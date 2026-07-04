from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.pricing import usd_cost, usd_to_credits
from app.models.credit import CreditAccount, CreditTxn


async def get_account(company_id: str) -> CreditAccount:
    acc = await CreditAccount.find_one(CreditAccount.company_id == company_id)
    if acc is None:
        acc = CreditAccount(company_id=company_id, balance=0)
        await acc.insert()
    return acc


async def grant(company_id: str, credits: int, reason: str = "Top-up", meta: dict | None = None) -> CreditAccount:
    acc = await get_account(company_id)
    acc.balance += credits
    acc.lifetime_granted += credits
    acc.updated_at = datetime.now(timezone.utc)
    await acc.save()
    await CreditTxn(
        company_id=company_id,
        kind="grant",
        credits=credits,
        reason=reason,
        balance_after=acc.balance,
        meta=meta or {},
    ).insert()
    return acc


async def ensure_balance(company_id: str) -> None:
    """Gate a paid AI operation: raise 402 when the wallet is empty."""
    acc = await get_account(company_id)
    if acc.balance <= 0:
        raise HTTPException(
            status.HTTP_402_PAYMENT_REQUIRED,
            "Insufficient AI credits. Ask your administrator to top up the balance.",
        )


async def _debit(
    company_id: str,
    credits: int,
    reason: str,
    model: str | None,
    tokens: int | None,
    cost_usd: float | None,
    meta: dict | None,
) -> CreditAccount | None:
    if credits <= 0:
        return None  # offline / heuristic usage costs nothing
    acc = await get_account(company_id)
    acc.balance = max(0, acc.balance - credits)
    acc.lifetime_spent += credits
    acc.updated_at = datetime.now(timezone.utc)
    await acc.save()
    await CreditTxn(
        company_id=company_id,
        kind="debit",
        credits=credits,
        reason=reason,
        model=model,
        tokens=tokens,
        cost_usd=cost_usd,
        balance_after=acc.balance,
        meta=meta or {},
    ).insert()
    return acc


async def charge_tokens(
    company_id: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    reason: str,
    meta: dict | None = None,
) -> None:
    cost = usd_cost(model, input_tokens, output_tokens)
    credits = usd_to_credits(cost, settings.credit_usd_per_credit)
    await _debit(company_id, credits, reason, model, input_tokens + output_tokens, cost, meta)


async def charge_flat(company_id: str, credits: int, reason: str, meta: dict | None = None) -> None:
    await _debit(company_id, credits, reason, None, None, None, meta)
