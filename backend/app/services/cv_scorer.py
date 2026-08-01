from app.models.job import Job


def _culture_fit(soft_skills: list[str]) -> float:
    # Derived from soft-skill evidence actually found in the CV (no random data).
    if not soft_skills:
        return 68.0
    return round(min(95.0, 68.0 + len(soft_skills) * 4.0), 1)


def _skill_match(candidate_skills: list[str], job_skills: list[str]) -> tuple[float, list[str], list[str]]:
    if not job_skills:
        score = min(90.0, 55.0 + len(candidate_skills) * 3.0)
        return round(score, 1), candidate_skills[:8], []

    cand = {s.lower() for s in candidate_skills}
    matched = [s for s in job_skills if s.lower() in cand]
    missing = [s for s in job_skills if s.lower() not in cand]
    ratio = len(matched) / len(job_skills)
    extra = min(len(cand - {s.lower() for s in job_skills}) * 1.5, 10)
    score = min(100.0, ratio * 92 + extra)
    return round(score, 1), matched, missing


def _experience_match(years: float, job: Job) -> float:
    lo, hi = job.experience_min, max(job.experience_max, job.experience_min)
    if lo == 0 and hi == 0:
        return round(min(95.0, 60.0 + years * 6.0), 1)
    if years < lo:
        gap = lo - years
        return round(max(45.0, 90.0 - gap * 12.0), 1)
    if hi and years > hi:
        return round(max(82.0, 96.0 - (years - hi) * 2.0), 1)
    return round(min(98.0, 88.0 + (years - lo) * 2.0), 1)


def _education_match(education: str | None) -> float:
    table = {
        "PhD": 96.0,
        "Master's": 93.0,
        "MBA": 92.0,
        "Bachelor's": 88.0,
        "Diploma": 76.0,
        "Higher Secondary": 64.0,
    }
    if education in table:
        return table[education]
    return 70.0


def score_candidate(parsed: dict, job: Job) -> dict:
    skills = parsed.get("skills", [])
    years = float(parsed.get("experience_years") or 0)
    education = parsed.get("education")

    skill_score, matched, missing = _skill_match(skills, job.skills)
    exp_score = _experience_match(years, job)
    edu_score = _education_match(education)
    culture = _culture_fit(parsed.get("soft_skills", []))

    overall = round(skill_score * 0.4 + exp_score * 0.25 + edu_score * 0.2 + culture * 0.15, 1)

    strengths: list[str] = []
    if matched:
        strengths.append(f"Strong match on {', '.join(matched[:3])}")
    if years >= max(job.experience_min, 1):
        strengths.append(f"{years:g} years of relevant experience")
    if education in ("PhD", "Master's", "MBA"):
        strengths.append(f"{education} level education")
    if not strengths:
        strengths.append("Broad technical exposure")

    risks: list[str] = []
    if missing:
        risks.append(f"Limited evidence of {', '.join(missing[:3])}")
    if years < job.experience_min:
        risks.append("Experience below the role's minimum")
    if not education:
        risks.append("Education details not detected in CV")

    band = "an excellent" if overall >= 90 else "a strong" if overall >= 80 else "a moderate" if overall >= 70 else "a partial"
    summary = (
        f"{parsed.get('name', 'The candidate')} is {band} fit for {job.title}, "
        f"matching {len(matched)}/{len(job.skills) or len(skills)} core skills "
        f"with {years:g} years of experience."
    )

    return {
        "scores": {
            "skill": skill_score,
            "experience": exp_score,
            "education": edu_score,
            "culture": culture,
        },
        "overall_score": overall,
        "matched_skills": matched,
        "missing_skills": missing,
        "ai_summary": summary,
        "strengths": strengths,
        "risks": risks,
        "scored_by": "heuristic",
    }
