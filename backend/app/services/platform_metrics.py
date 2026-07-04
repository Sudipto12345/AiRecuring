# admin dashboard numbers — mongo for counts, made-up for billing/infra until stripe lands

import math
from collections import Counter
from datetime import datetime, timezone

from app.models.candidate import Candidate
from app.models.company import Company
from app.models.credit import CreditTxn
from app.models.interview import Interview
from app.models.job import Job
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.user import User

_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _last_months(n: int) -> list[tuple[int, int]]:
    now = datetime.now(timezone.utc)
    y, m = now.year, now.month
    out: list[tuple[int, int]] = []
    for _ in range(n):
        out.append((y, m))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    return list(reversed(out))


def _cumulative_by_month(dates: list[datetime], n: int = 6) -> list[dict]:
    months = _last_months(n)
    counts = Counter((d.year, d.month) for d in dates if d)
    running = sum(1 for d in dates if d and (d.year, d.month) < months[0])
    series = []
    for (y, m) in months:
        running += counts.get((y, m), 0)
        series.append({"label": _MONTHS[m - 1], "value": running})
    return series


def _new_by_month(dates: list[datetime], n: int = 6) -> list[dict]:
    months = _last_months(n)
    counts = Counter((d.year, d.month) for d in dates if d)
    return [{"label": _MONTHS[m - 1], "value": counts.get((y, m), 0)} for (y, m) in months]


def _mock_wave(base: float, n: int, amp: float = 0.18) -> list[float]:
    return [round(base * (1 + amp * math.sin(i / 1.7) + 0.04 * i), 2) for i in range(n)]


async def platform_overview() -> dict:
    companies = await Company.find_all().to_list()
    users = await User.find_all().to_list()
    candidates_n = await Candidate.find_all().count()
    jobs_n = await Job.find_all().count()
    interviews = await Interview.find_all().to_list()
    subs = await Subscription.find_all().to_list()
    plans = {p.key: p for p in await Plan.find_all().to_list()}
    txns = await CreditTxn.find_all().to_list()

    debit_txns = [t for t in txns if t.kind == "debit"]
    ai_requests = len(debit_txns)
    ai_credits_spent = sum(t.credits for t in debit_txns)
    ai_tokens = sum(t.tokens or 0 for t in debit_txns)

    # MRR from active subscriptions priced by their plan.
    active_subs = [s for s in subs if s.status == "active"]
    mrr = sum((plans.get(s.plan).price_monthly if plans.get(s.plan) else 0.0) for s in active_subs)
    arr = mrr * 12

    n = 6
    company_growth = _cumulative_by_month([c.created_at for c in companies], n)
    user_growth = _cumulative_by_month([u.created_at for u in users], n)
    company_new = _new_by_month([c.created_at for c in companies], n)
    ai_usage_series = _new_by_month([t.created_at for t in debit_txns], n)
    # attach real credits per month to ai usage
    months = _last_months(n)
    credit_by_month = Counter()
    for t in debit_txns:
        credit_by_month[(t.created_at.year, t.created_at.month)] += t.credits
    ai_usage_series = [
        {"label": _MONTHS[m - 1], "requests": ai_usage_series[i]["value"], "credits": credit_by_month.get((y, m), 0)}
        for i, (y, m) in enumerate(months)
    ]

    # Mock infra + revenue series.
    revenue_wave = _mock_wave(max(mrr, 1200), n)
    revenue_series = [{"label": company_growth[i]["label"], "revenue": revenue_wave[i]} for i in range(n)]
    storage_used_gb = round(candidates_n * 0.4 + len(interviews) * 45 / 1024 + len(companies) * 0.2, 1)

    active_sessions = max(1, len(users) // 3)

    return {
        "kpis": {
            "companies": len(companies),
            "active_companies": sum(1 for c in companies if c.status == "active"),
            "users": len(users),
            "candidates": candidates_n,
            "jobs": jobs_n,
            "interviews": len(interviews),
            "ai_requests": ai_requests,
            "ai_credits_spent": ai_credits_spent,
            "ai_tokens": ai_tokens,
            "active_sessions": active_sessions,
        },
        "revenue": {
            "mrr": round(mrr, 2),
            "arr": round(arr, 2),
            "today": round(mrr / 30, 2),
            "estimated": True,
        },
        "infra_sample": {
            "cpu_pct": 34,
            "ram_pct": 58,
            "queue_depth": 7,
            "error_rate_pct": 0.4,
            "api_requests_24h": 18420,
            "avg_response_ms": 142,
        },
        "storage": {"used_gb": storage_used_gb, "total_gb": 1000},
        "charts": {
            "revenue": revenue_series,
            "company_growth": company_growth,
            "user_growth": user_growth,
            "company_new": company_new,
            "ai_usage": ai_usage_series,
        },
    }


async def ai_usage_breakdown() -> dict:
    txns = await CreditTxn.find(CreditTxn.kind == "debit").to_list()
    by_reason: Counter[str] = Counter()
    by_model: Counter[str] = Counter()
    credits_by_reason: Counter[str] = Counter()
    by_company: Counter[str] = Counter()
    for t in txns:
        by_reason[t.reason] += 1
        credits_by_reason[t.reason] += t.credits
        by_model[t.model or "local/heuristic"] += 1
        by_company[t.company_id] += t.credits

    companies = {str(c.id): c.name for c in await Company.find_all().to_list()}
    top_companies = [
        {"company_id": cid, "name": companies.get(cid, "Unknown"), "credits": credits}
        for cid, credits in by_company.most_common(10)
    ]
    return {
        "total_requests": len(txns),
        "total_credits": sum(t.credits for t in txns),
        "total_tokens": sum(t.tokens or 0 for t in txns),
        "by_reason": [{"reason": r, "count": c, "credits": credits_by_reason[r]} for r, c in by_reason.most_common()],
        "by_model": [{"model": m, "count": c} for m, c in by_model.most_common()],
        "top_companies": top_companies,
    }
