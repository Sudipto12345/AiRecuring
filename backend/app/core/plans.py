"""Subscription plan catalog and module keys."""

MODULE_CV_RANKING = "cvRanking"
MODULE_EXAM_PORTAL = "examPortal"
MODULE_INTERVIEW_FACE = "interviewFace"

ALL_MODULES = [MODULE_CV_RANKING, MODULE_EXAM_PORTAL, MODULE_INTERVIEW_FACE]

UNLIMITED = -1

PLAN_CATALOG = {
    "free": {
        "label": "Free",
        "modules": [MODULE_CV_RANKING],
        "limits": {"jobs": 3, "cvUploadsPerMonth": 50, "seats": 2},
    },
    "pro": {
        "label": "Pro",
        "modules": [MODULE_CV_RANKING, MODULE_EXAM_PORTAL],
        "limits": {"jobs": 50, "cvUploadsPerMonth": 2000, "seats": 15},
    },
    "enterprise": {
        "label": "Enterprise",
        "modules": ALL_MODULES,
        "limits": {"jobs": UNLIMITED, "cvUploadsPerMonth": UNLIMITED, "seats": UNLIMITED},
    },
}

DEFAULT_PLAN = "free"


def plan_definition(plan: str) -> dict:
    return PLAN_CATALOG.get(plan, PLAN_CATALOG[DEFAULT_PLAN])
