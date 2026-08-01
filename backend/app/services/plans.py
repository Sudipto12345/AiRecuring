"""DB-backed plan catalog powering the Plan Builder.

Seeded once from the static catalog plus a few extra tiers the console exposes.
Subscriptions read their modules/limits from the matching plan at assignment time,
so editing a plan affects newly-assigned tenants while existing gating (which reads
``subscription.modules``) keeps working.
"""

from datetime import datetime, timezone

from app.models.plan import Plan
from app.models.subscription import Subscription

UNLIMITED = -1

# key -> (label, modules, price_monthly, extra limits, order, is_custom)
SEED_PLANS = [
    {
        "key": "free",
        "label": "Free",
        "modules": ["cvRanking"],
        "price_monthly": 0.0,
        "limits": {"jobs": 3, "cvUploadsPerMonth": 50, "seats": 2, "aiCredits": 500,
                   "storageGb": 1, "videoUploads": 0, "interviewMinutes": 0,
                   "questionBank": False, "apiAccess": False, "whiteLabel": False,
                   "customDomain": False, "integrations": False, "prioritySupport": False},
        "order": 0,
    },
    {
        "key": "starter",
        "label": "Starter",
        "modules": ["cvRanking"],
        "price_monthly": 29.0,
        "limits": {"jobs": 10, "cvUploadsPerMonth": 300, "seats": 5, "aiCredits": 2000,
                   "storageGb": 10, "videoUploads": 0, "interviewMinutes": 0,
                   "questionBank": True, "apiAccess": False, "whiteLabel": False,
                   "customDomain": False, "integrations": True, "prioritySupport": False},
        "order": 1,
    },
    {
        "key": "pro",
        "label": "Professional",
        "modules": ["cvRanking", "examPortal"],
        "price_monthly": 79.0,
        "limits": {"jobs": 50, "cvUploadsPerMonth": 2000, "seats": 15, "aiCredits": 10000,
                   "storageGb": 50, "videoUploads": 200, "interviewMinutes": 1000,
                   "questionBank": True, "apiAccess": True, "whiteLabel": False,
                   "customDomain": False, "integrations": True, "prioritySupport": False},
        "order": 2,
    },
    {
        "key": "business",
        "label": "Business",
        "modules": ["cvRanking", "examPortal", "interviewFace"],
        "price_monthly": 149.0,
        "limits": {"jobs": 200, "cvUploadsPerMonth": 8000, "seats": 50, "aiCredits": 40000,
                   "storageGb": 250, "videoUploads": 1000, "interviewMinutes": 5000,
                   "questionBank": True, "apiAccess": True, "whiteLabel": True,
                   "customDomain": True, "integrations": True, "prioritySupport": True},
        "order": 3,
    },
    {
        "key": "enterprise",
        "label": "Enterprise",
        "modules": ["cvRanking", "examPortal", "interviewFace"],
        "price_monthly": 299.0,
        "limits": {"jobs": UNLIMITED, "cvUploadsPerMonth": UNLIMITED, "seats": UNLIMITED,
                   "aiCredits": UNLIMITED, "storageGb": 1000, "videoUploads": UNLIMITED,
                   "interviewMinutes": UNLIMITED, "questionBank": True, "apiAccess": True,
                   "whiteLabel": True, "customDomain": True, "integrations": True,
                   "prioritySupport": True},
        "order": 4,
    },
    {
        "key": "custom",
        "label": "Custom",
        "modules": ["cvRanking", "examPortal", "interviewFace"],
        "price_monthly": 0.0,
        "is_custom": True,
        "limits": {"jobs": UNLIMITED, "cvUploadsPerMonth": UNLIMITED, "seats": UNLIMITED,
                   "aiCredits": UNLIMITED, "storageGb": UNLIMITED, "videoUploads": UNLIMITED,
                   "interviewMinutes": UNLIMITED, "questionBank": True, "apiAccess": True,
                   "whiteLabel": True, "customDomain": True, "integrations": True,
                   "prioritySupport": True},
        "order": 5,
    },
]


async def ensure_seeded() -> None:
    if await Plan.find_one(Plan.key == "free"):
        return
    for spec in SEED_PLANS:
        await Plan(
            key=spec["key"],
            label=spec["label"],
            modules=list(spec["modules"]),
            limits=dict(spec["limits"]),
            price_monthly=spec.get("price_monthly", 0.0),
            is_custom=spec.get("is_custom", False),
            order=spec.get("order", 0),
        ).insert()


async def list_plans() -> list[Plan]:
    return await Plan.find_all().sort("order").to_list()


async def get_plan(key: str) -> Plan | None:
    return await Plan.find_one(Plan.key == key)


async def apply_to_subscription(sub: Subscription, plan: Plan) -> None:
    sub.plan = plan.key
    sub.modules = list(plan.modules)
    sub.limits = dict(plan.limits)
    sub.updated_at = datetime.now(timezone.utc)
    await sub.save()
