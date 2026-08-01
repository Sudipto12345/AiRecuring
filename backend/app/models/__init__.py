from app.models.audit import AuditLog
from app.models.billing import Coupon, Invoice, SubscriptionRenewal
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.credit import CreditAccount, CreditTxn
from app.models.exam import ExamInvite
from app.models.exam_template import Exam
from app.models.interview import FaceAnalysis, Interview
from app.models.job import Job
from app.models.plan import Plan
from app.models.platform import PlatformSettings
from app.models.question import Question
from app.models.rbac import RolePermission, SupportStaff
from app.models.resume import Resume
from app.models.subscription import Subscription
from app.models.user import User
from app.models.ai import PromptTemplate
from app.models.session import LoginSession

document_models = [
    AuditLog,
    Candidate,
    Company,
    Coupon,
    CreditAccount,
    CreditTxn,
    ExamInvite,
    Exam,
    FaceAnalysis,
    Interview,
    Invoice,
    Job,
    LoginSession,
    Plan,
    PlatformSettings,
    PromptTemplate,
    Question,
    RolePermission,
    Resume,
    Subscription,
    SubscriptionRenewal,
    SupportStaff,
    User,
]
