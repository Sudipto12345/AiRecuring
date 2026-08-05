from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import current_user
from app.core.config import settings
from app.core.plans import DEFAULT_PLAN
from app.core.security import create_access_token, hash_password, verify_password, create_refresh_token, decode_refresh_token
from fastapi import Response
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
async def register(payload: RegisterRequest, request: Request, response: Response):
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

    fp = getattr(request.state, "fingerprint", "")
    token = create_access_token(str(admin.id), {"role": admin.role, "cid": admin.company_id, "fp": fp})
    refresh_token = create_refresh_token(str(admin.id), {"role": admin.role, "cid": admin.company_id, "fp": fp})
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=30*24*60*60, samesite="lax", secure=True)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, response: Response):
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

    fp = getattr(request.state, "fingerprint", "")
    token = create_access_token(str(user.id), {"role": user.role, "cid": user.company_id, "fp": fp})
    refresh_token = create_refresh_token(str(user.id), {"role": user.role, "cid": user.company_id, "fp": fp})
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=30*24*60*60, samesite="lax", secure=True)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=SessionOut)
async def me(user: User = Depends(current_user)):
    return await build_session(user)


from fastapi import Request

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token missing")
    
    payload = decode_refresh_token(token)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
        
    if payload.get("fp") and payload.get("fp") != getattr(request.state, "fingerprint", ""):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid device fingerprint")

    user_id = payload.get("sub")
    role = payload.get("role")
    cid = payload.get("cid")
    fp = getattr(request.state, "fingerprint", "")
    
    new_access = create_access_token(user_id, {"role": role, "cid": cid, "fp": fp})
    new_refresh = create_refresh_token(user_id, {"role": role, "cid": cid, "fp": fp})
    
    response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, max_age=30*24*60*60, samesite="lax", secure=True)
    return TokenResponse(access_token=new_access)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token", httponly=True, samesite="lax", secure=True)
    return {"detail": "Logged out"}
