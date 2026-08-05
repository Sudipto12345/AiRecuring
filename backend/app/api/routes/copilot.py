# company-panel copilot — llm when credits allow, rules engine otherwise

from fastapi import APIRouter, Depends

from app.api.deps import company_user
from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.job import Job
from app.models.user import User
from app.schemas.copilot import CopilotRequest, CopilotResponse
from app.services.credits import get_account
from app.services.llm import llm_available, llm_chat

router = APIRouter(prefix="/ai", tags=["copilot"])

SYSTEM = (
    "You're the in-app hiring assistant for AIRecruit. Keep answers short and usable. "
    "When someone asks for a JD, interview kit or report, give copy they can paste straight in. "
    "Don't invent candidate names or stats you weren't given."
)


async def _company_stats(company_id: str) -> dict:
    candidates = await Candidate.find(Candidate.company_id == company_id).to_list()
    jobs = await Job.find(Job.company_id == company_id).to_list()
    interviews = await Interview.find(Interview.company_id == company_id).to_list()
    shortlisted = sum(1 for c in candidates if c.stage in ("AI Shortlisted", "Shortlisted"))
    hired = sum(1 for c in candidates if c.stage == "Hired")
    completed = sum(1 for i in interviews if i.status == "Completed")
    return {
        "candidates": len(candidates),
        "jobs": len(jobs),
        "open_jobs": sum(1 for j in jobs if j.status in ("Active", "Open")),
        "interviews": len(interviews),
        "completed_interviews": completed,
        "shortlisted": shortlisted,
        "hired": hired,
    }


def _heuristic(action: str, message: str, stats: dict) -> str:
    role = message.strip().rstrip(".")
    if action == "generate_jd":
        return (
            f"## {role or 'Job Description'}\n\n"
            "**About the role**\nWe are looking for a motivated professional to join our team. "
            "You will collaborate cross-functionally to deliver high-impact work.\n\n"
            "**Responsibilities**\n- Own key deliverables end to end\n- Collaborate with stakeholders\n"
            "- Drive quality and continuous improvement\n\n"
            "**Requirements**\n- Relevant experience in the field\n- Strong communication skills\n"
            "- Problem-solving mindset\n\n"
            "**Nice to have**\n- Familiarity with modern tooling\n- Prior team leadership\n\n"
            "_Generated offline. Connect an AI provider for tailored output._"
        )
    if action == "summarize_resume":
        return (
            "When summarizing a resume, focus on: years of relevant experience, core skills matched "
            "to the role, notable achievements (quantified where possible), education, and any gaps "
            "or risks worth probing in an interview.\n\n"
            "_Tip: open a candidate and use AI Screening for an automatic, scored summary._"
        )
    if action == "compare_candidates":
        return (
            "To compare candidates fairly, evaluate each on the same criteria: skill match, relevant "
            "experience, education, and culture fit. Use the AI Score as a starting signal, then review "
            "strengths and risks side by side and validate with structured interview questions to reduce bias."
        )
    if action in ("generate_report", "ask_data"):
        return (
            "Here is your current pipeline snapshot:\n\n"
            f"- Open jobs: {stats['open_jobs']} (of {stats['jobs']} total)\n"
            f"- Candidates: {stats['candidates']}\n"
            f"- Shortlisted: {stats['shortlisted']}\n"
            f"- Interviews: {stats['interviews']} ({stats['completed_interviews']} completed)\n"
            f"- Hired: {stats['hired']}\n\n"
            "Ask me to break this down by job or stage."
        )
    return (
        "I can help you write job descriptions, summarize resumes, compare candidates, draft interview "
        "questions and answer questions about your pipeline. Try one of the quick actions below.\n\n"
        "_Connect an AI provider in Settings → AI Models for richer, tailored answers._"
    )


@router.post("/copilot", response_model=CopilotResponse)
async def copilot(payload: CopilotRequest, user: User = Depends(company_user)):
    stats = await _company_stats(user.company_id)
    acc = await get_account(user.company_id)
    can_use_llm = llm_available() and acc.balance > 0

    if can_use_llm:
        from app.core.token_budget import apply_budget

        context = (
            f"Workspace pipeline context — open_jobs={stats['open_jobs']}, candidates={stats['candidates']}, "
            f"shortlisted={stats['shortlisted']}, interviews={stats['interviews']}, hired={stats['hired']}.\n\n"
        )
        prompt = context + f"[action={payload.action}]\n{payload.message}"
        body = apply_budget({"max_tokens": 1000, "prompt": prompt})
        result = await llm_chat(SYSTEM, body["prompt"], user.company_id, reason="Copilot", meta={"action": payload.action})
        if result is not None:
            reply, tokens = result
            return CopilotResponse(reply=reply, used_llm=True, tokens=tokens)

    return CopilotResponse(reply=_heuristic(payload.action, payload.message, stats), used_llm=False, tokens=0)
