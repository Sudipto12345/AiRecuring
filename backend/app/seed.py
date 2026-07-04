from app.core.config import settings
from app.core.demo import DEMO_COMPANIES, DEMO_PASSWORD, DEMO_USERS
from app.core.security import hash_password
from app.models.company import Company
from app.models.subscription import Subscription
from app.models.user import User
from app.services.credits import grant
from app.services.sessions import slugify


async def ensure_super_admin() -> None:
    existing = await User.find_one(User.role == "super_admin")
    if existing:
        return
    owner = User(
        email=settings.superadmin_email,
        name=settings.superadmin_name,
        password_hash=hash_password(settings.superadmin_password),
        role="super_admin",
        title="Platform Owner",
    )
    await owner.insert()


async def _unique_slug(name: str) -> str:
    base = slugify(name)
    slug = base
    n = 1
    while await Company.find_one(Company.slug == slug):
        n += 1
        slug = f"{base}-{n}"
    return slug


async def ensure_demo_accounts() -> None:
    """Create role/subscription demo companies + users (idempotent, dev-only)."""
    if not settings.dev_mode:
        return

    name_to_id: dict[str, str] = {}
    for spec in DEMO_COMPANIES:
        company = await Company.find_one(Company.name == spec["name"])
        if not company:
            company = Company(
                name=spec["name"],
                slug=await _unique_slug(spec["name"]),
                industry=spec.get("industry"),
            )
            await company.insert()
            sub = Subscription.from_plan(str(company.id), spec["plan"])
            await sub.insert()
            if settings.new_company_credits > 0:
                await grant(str(company.id), settings.new_company_credits, "Demo seed credits")
        name_to_id[spec["name"]] = str(company.id)

    for u in DEMO_USERS:
        if await User.find_one(User.email == u["email"]):
            continue
        user = User(
            email=u["email"],
            name=u["name"],
            password_hash=hash_password(DEMO_PASSWORD),
            role=u["role"],
            company_id=name_to_id.get(u["company"]),
            title=u.get("title"),
        )
        await user.insert()
