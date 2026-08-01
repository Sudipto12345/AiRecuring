from datetime import datetime

from pydantic import BaseModel, Field


class CreditTxnOut(BaseModel):
    id: str
    kind: str
    credits: int
    reason: str
    model: str | None = None
    tokens: int | None = None
    cost_usd: float | None = None
    balance_after: int
    created_at: datetime


class CreditBalanceOut(BaseModel):
    balance: int
    lifetime_granted: int
    lifetime_spent: int
    transactions: list[CreditTxnOut] = Field(default_factory=list)


class GrantRequest(BaseModel):
    credits: int = Field(gt=0, le=1_000_000)
    reason: str | None = None
