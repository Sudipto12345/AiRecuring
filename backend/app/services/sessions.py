import re

from app.models.company import Company
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.auth import CompanyOut, SessionOut, SubscriptionOut, UserOut


def slugify(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return base or "company"


def user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        company_id=user.company_id,
        title=user.title,
        avatar_url=user.avatar_url,
    )


def company_out(company: Company) -> CompanyOut:
    return CompanyOut(
        id=str(company.id),
        name=company.name,
        slug=company.slug,
        industry=company.industry,
        status=company.status,
        registration_number=company.registration_number,
        incorporation_country=company.incorporation_country,
        business_address=company.business_address,
        legal_entity_name=company.legal_entity_name,
        proof_document_url=company.proof_document_url,
        verification_status=company.verification_status,
        verification_notes=company.verification_notes,
        verified_at=company.verified_at,
    )


def subscription_out(sub: Subscription) -> SubscriptionOut:
    return SubscriptionOut(plan=sub.plan, modules=sub.modules, limits=sub.limits, status=sub.status)


async def build_session(user: User) -> SessionOut:
    company = None
    subscription = None
    credits = 0
    if user.company_id:
        company = await Company.get(user.company_id)
        sub = await Subscription.find_one(Subscription.company_id == user.company_id)
        if sub:
            subscription = subscription_out(sub)
        from app.services.credits import get_account

        account = await get_account(user.company_id)
        credits = account.balance
    return SessionOut(
        user=user_out(user),
        company=company_out(company) if company else None,
        subscription=subscription,
        credits=credits,
    )
