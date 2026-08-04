import json
import logging
import httpx

from app.core.config import settings
from app.models.job import Job
from app.services.bedrock import bedrock_service

logger = logging.getLogger("air.llm")

SYSTEM = (
    "Recruitment analyst. Job + resume in, JSON out. Keys: skill, experience, education, culture, "
    "overall (0-100 each), matched_skills[], missing_skills[], summary, strengths[], risks[]. "
    "JSON only, no chit-chat."
)

PARSE_SYSTEM = (
    "Pull fields from this CV/resume. JSON keys: name, email, phone, location, education, "
    "experience_years, skills[], soft_skills[]. Only what's actually in the text — don't guess. JSON only."
)


def llm_available() -> bool:
    return bool(settings.openai_api_key) or bedrock_service.is_available()


async def _charge(company_id: str | None, usage: dict, reason: str, meta: dict | None = None) -> None:
    if not company_id:
        return
    from app.services.credits import charge_tokens

    await charge_tokens(
        company_id,
        settings.llm_model,
        int(usage.get("prompt_tokens", 0)),
        int(usage.get("completion_tokens", 0)),
        reason,
        meta,
    )


async def llm_parse(resume_text: str, company_id: str | None = None) -> dict | None:
    if settings.llm_provider == "bedrock" and bedrock_service.is_available():
        res = await bedrock_service.parse_resume_with_bedrock(resume_text)
        if res:
            return res

    if not settings.openai_api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=40) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={
                    "model": settings.llm_model,
                    "messages": [
                        {"role": "system", "content": PARSE_SYSTEM},
                        {"role": "user", "content": resume_text[:8000]},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0,
                },
            )
            res.raise_for_status()
            body = res.json()
            data = json.loads(body["choices"][0]["message"]["content"])
            await _charge(company_id, body.get("usage", {}), "CV parsing")
            cleaned = {k: v for k, v in data.items() if v not in (None, "", [])}
            return cleaned or None
    except Exception as err:
        logger.warning(f"OpenAI parse failed: {err}")
        return None


async def llm_chat(
    system: str,
    user_msg: str,
    company_id: str | None = None,
    reason: str = "Copilot",
    meta: dict | None = None,
) -> tuple[str, int] | None:
    """Generic chat completion for the AI Copilot.

    Tries AWS Bedrock first, then OpenAI, returning (reply_text, total_tokens)
    or None if unavailable/failing.
    """
    if bedrock_service.is_available():
        try:
            prompt = f"System instruction: {system}\n\nUser Question: {user_msg}"
            reply = bedrock_service._invoke_text(prompt, max_tokens=1000)
            if reply:
                return reply, len(prompt.split())
        except Exception as err:
            logger.info(f"Bedrock chat invocation unavailable/failed, checking fallbacks: {err}")

    if settings.openai_api_key:
        try:
            async with httpx.AsyncClient(timeout=40) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json={
                        "model": settings.llm_model,
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": user_msg[:8000]},
                        ],
                        "temperature": 0.4,
                    },
                )
                res.raise_for_status()
                body = res.json()
                reply = body["choices"][0]["message"]["content"]
                usage = body.get("usage", {})
                await _charge(company_id, usage, reason, meta)
                total = int(usage.get("prompt_tokens", 0)) + int(usage.get("completion_tokens", 0))
                return reply, total
        except Exception as err:
            logger.warning(f"OpenAI chat failed: {err}")

    return None


async def llm_score(resume_text: str, job: Job, company_id: str | None = None) -> dict | None:
    if settings.llm_provider == "bedrock" and bedrock_service.is_available():
        result = await bedrock_service.score_cv_with_bedrock(resume_text, job.description or job.title)
        if result:
            return result

    if not settings.openai_api_key:
        return None

    prompt = (
        f"JOB TITLE: {job.title}\n"
        f"REQUIRED SKILLS: {', '.join(job.skills)}\n"
        f"EXPERIENCE RANGE: {job.experience_min}-{job.experience_max} years\n"
        f"JOB DESCRIPTION: {job.description or 'N/A'}\n\n"
        f"RESUME:\n{resume_text[:6000]}"
    )
    try:
        async with httpx.AsyncClient(timeout=40) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={
                    "model": settings.llm_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2,
                },
            )
            res.raise_for_status()
            body = res.json()
            data = json.loads(body["choices"][0]["message"]["content"])
            await _charge(company_id, body.get("usage", {}), "CV scoring", {"job": job.title})
            return {
                "scores": {
                    "skill": float(data.get("skill", 0)),
                    "experience": float(data.get("experience", 0)),
                    "education": float(data.get("education", 0)),
                    "culture": float(data.get("culture", 0)),
                },
                "overall_score": round(float(data.get("overall", 0)), 1),
                "matched_skills": data.get("matched_skills", []),
                "missing_skills": data.get("missing_skills", []),
                "ai_summary": data.get("summary"),
                "strengths": data.get("strengths", []),
                "risks": data.get("risks", []),
                "scored_by": "llm",
            }
    except Exception as err:
        logger.warning(f"OpenAI scoring failed: {err}")
        return None
