from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.models.subscription import Subscription
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)


async def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = await User.get(payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return user


def require_roles(*roles: str):
    async def checker(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user

    return checker


async def super_admin(user: User = Depends(current_user)) -> User:
    if user.role != "super_admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Platform owner only")
    return user


async def company_user(user: User = Depends(current_user)) -> User:
    if not user.company_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No company context")
    return user


async def active_subscription(user: User = Depends(company_user)) -> Subscription:
    sub = await Subscription.find_one(Subscription.company_id == user.company_id)
    if sub is None:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "No active subscription")
    return sub


def require_module(module_key: str):
    async def checker(sub: Subscription = Depends(active_subscription)) -> Subscription:
        if module_key not in sub.modules:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                f"Your plan does not include the '{module_key}' module",
            )
        return sub

    return checker
