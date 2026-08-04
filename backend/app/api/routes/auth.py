from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import current_user
from app.core.config import settings
from app.core.plans import DEFAULT_PLAN
from app.core.security import create_access_token, hash_password, verify_password
from app.services.credits import grant
from app.models.company import Company
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    SessionOut,
    TokenResponse,
)
from app.services.sessions import build_session, slugify

router = APIRouter(prefix="/auth", tags=["auth"])


async def _unique_slug(name: str) -> str:
    base = slugify(name)
    slug = base
    n = 1
    while await Company.find_one(Company.slug == slug):
        n += 1
        slug = f"{base}-{n}"
    return slug


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    company = Company(name=payload.company_name, slug=await _unique_slug(payload.company_name), industry=payload.industry)
    await company.insert()

    sub = Subscription.from_plan(str(company.id), payload.plan or DEFAULT_PLAN)
    await sub.insert()

    admin = User(
        email=payload.email,
        name=payload.admin_name,
        password_hash=hash_password(payload.password),
        role="company_admin",
        company_id=str(company.id),
        title="Administrator",
    )
    await admin.insert()

    if settings.new_company_credits > 0:
        await grant(str(company.id), settings.new_company_credits, "Welcome credits")

    token = create_access_token(str(admin.id), {"role": admin.role, "cid": admin.company_id})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    # Super admins are never blocked by company verification
    if user.role not in ("super_admin", "support"):
        company = await Company.get(user.company_id) if user.company_id else None
        if company:
            vs = company.verification_status
            if vs == "pending":
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "PENDING_VERIFICATION: Your company registration is awaiting admin approval. You will be notified by email once approved.",
                )
            elif vs == "rejected":
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    f"REJECTED: Your company registration was rejected. {company.verification_notes or 'Please contact support.'}",
                )
            elif vs == "on_hold":
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "ON_HOLD: Your account is on hold. Please contact support.",
                )

    token = create_access_token(str(user.id), {"role": user.role, "cid": user.company_id})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=SessionOut)
async def me(user: User = Depends(current_user)):
    return await build_session(user)
