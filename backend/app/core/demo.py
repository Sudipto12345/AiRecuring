"""Demo data definitions used by the seeder and the dev-only login helper.

These accounts let anyone explore the product with different roles and
subscription tiers without registering. They are only created / exposed while
``settings.dev_mode`` is true.
"""

from app.core.config import settings
from app.core.plans import plan_definition

DEMO_PASSWORD = "demo12345"

# Companies, one per subscription tier.
DEMO_COMPANIES = [
    {"name": "Enterprise Corp", "industry": "Technology", "plan": "enterprise"},
    {"name": "Pro Startup", "industry": "SaaS", "plan": "pro"},
    {"name": "Free Team", "industry": "Recruiting Agency", "plan": "free"},
]

# Users, referencing a company by name. Covers company_admin + hr roles.
DEMO_USERS = [
    {
        "label": "Enterprise Admin",
        "email": "admin@enterprise.com",
        "name": "Eleanor Shaw",
        "role": "company_admin",
        "company": "Enterprise Corp",
        "title": "Head of Talent",
    },
    {
        "label": "Enterprise Recruiter",
        "email": "hr@enterprise.com",
        "name": "Marcus Lee",
        "role": "hr",
        "company": "Enterprise Corp",
        "title": "Senior Recruiter",
    },
    {
        "label": "Pro Admin",
        "email": "admin@pro.com",
        "name": "Priya Nair",
        "role": "company_admin",
        "company": "Pro Startup",
        "title": "Founder",
    },
    {
        "label": "Free Admin",
        "email": "admin@free.com",
        "name": "Tom Reyes",
        "role": "company_admin",
        "company": "Free Team",
        "title": "Recruiter",
    },
]


def _company_plan(name: str) -> str:
    for c in DEMO_COMPANIES:
        if c["name"] == name:
            return c["plan"]
    return "free"


def demo_account_list() -> list[dict]:
    """Public, password-included list for the dev login screen (no DB access)."""
    return [
        {
            "label": "Platform Super Admin",
            "email": settings.superadmin_email,
            "password": settings.superadmin_password,
            "role": "super_admin",
            "company": None,
            "plan": None,
            "modules": [],
        }
    ]
