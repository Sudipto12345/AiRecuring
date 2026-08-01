from fastapi import APIRouter, Depends

from app.api.deps import company_user
from app.models.credit import CreditTxn
from app.models.user import User
from app.schemas.credits import CreditBalanceOut, CreditTxnOut
from app.services.credits import get_account

router = APIRouter(prefix="/credits", tags=["credits"])


@router.get("", response_model=CreditBalanceOut)
async def my_credits(user: User = Depends(company_user)):
    acc = await get_account(user.company_id)
    txns = (
        await CreditTxn.find(CreditTxn.company_id == user.company_id)
        .sort("-created_at")
        .limit(25)
        .to_list()
    )
    return CreditBalanceOut(
        balance=acc.balance,
        lifetime_granted=acc.lifetime_granted,
        lifetime_spent=acc.lifetime_spent,
        transactions=[
            CreditTxnOut(
                id=str(t.id),
                kind=t.kind,
                credits=t.credits,
                reason=t.reason,
                model=t.model,
                tokens=t.tokens,
                cost_usd=t.cost_usd,
                balance_after=t.balance_after,
                created_at=t.created_at,
            )
            for t in txns
        ],
    )
