import json

import httpx

from app.core.config import settings
from app.models.job import Job

SYSTEM = (
    "Recruitment analyst. Job + resume in, JSON out. Keys: skill, experience, education, culture, "
    "overall (0-100 each), matched_skills[], missing_skills[], summary, strengths[], risks[]. "
    "JSON only, no chit-chat."
)


def llm_available() -> bool:
    return bool(settings.openai_api_key)


PARSE_SYSTEM = (
    "Pull fields from this CV/resume. JSON keys: name, email, phone, location, education, "
    "experience_years, skills[], soft_skills[]. Only what's actually in the text — don't guess. JSON only."
)


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
    if not llm_available():
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
    except Exception:
        return None

    cleaned = {k: v for k, v in data.items() if v not in (None, "", [])}
    if "experience_years" in cleaned:
        try:
            cleaned["experience_years"] = float(cleaned["experience_years"])
        except (TypeError, ValueError):
            cleaned.pop("experience_years", None)
    return cleaned or None


async def llm_chat(
    system: str,
    user_msg: str,
    company_id: str | None = None,
    reason: str = "Copilot",
    meta: dict | None = None,
) -> tuple[str, int] | None:
    """Generic chat completion for the AI Copilot.

    Returns ``(reply_text, total_tokens)`` or ``None`` when the LLM is
    unavailable or the call fails (callers fall back to a heuristic reply).
    """
    if not llm_available():
        return None
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
    except Exception:
        return None
    return reply, total


async def llm_score(resume_text: str, job: Job, company_id: str | None = None) -> dict | None:
    if not llm_available():
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
    except Exception:
        return None

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
