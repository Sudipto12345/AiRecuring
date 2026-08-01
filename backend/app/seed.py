import hashlib
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.demo import DEMO_COMPANIES, DEMO_PASSWORD, DEMO_USERS
from app.core.security import hash_password
from app.models.company import Company
from app.models.subscription import Subscription
from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.question import Question
from app.models.exam_template import Exam
from app.models.exam import ExamInvite
from app.models.interview import Interview, FaceAnalysis
from app.models.audit import AuditLog
from app.models.credit import CreditAccount, CreditTxn
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


async def seed_questions(company_id: str) -> list[Question]:
    questions_data = [
        {
            "text": "What is the time complexity of searching for an element in a balanced binary search tree?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct_index": 1,
            "category": "Technical",
            "difficulty": "medium",
        },
        {
            "text": "Which of the following is NOT one of the four main principles of Object-Oriented Programming?",
            "options": ["Encapsulation", "Polymorphism", "Inheritance", "Compilation"],
            "correct_index": 3,
            "category": "Technical",
            "difficulty": "easy",
        },
        {
            "text": "What is the primary purpose of a database index?",
            "options": ["To encrypt stored data", "To speed up data retrieval operations", "To ensure data integrity constraints", "To compress the database size"],
            "correct_index": 1,
            "category": "Technical",
            "difficulty": "medium",
        },
        {
            "text": "In a Scrum framework, who is primarily responsible for maintaining the Product Backlog?",
            "options": ["Scrum Master", "Product Owner", "Development Team", "Project Manager"],
            "correct_index": 1,
            "category": "Product Management",
            "difficulty": "medium",
        },
        {
            "text": "A team has a velocity of 30 story points per sprint. A project backlog has 120 story points. How many sprints will it take to complete the project?",
            "options": ["3 sprints", "4 sprints", "5 sprints", "6 sprints"],
            "correct_index": 1,
            "category": "Aptitude",
            "difficulty": "easy",
        },
        {
            "text": "Which HTTP status code represents a resource that has been permanently moved to a new URI?",
            "options": ["301 Moved Permanently", "302 Found", "404 Not Found", "500 Internal Server Error"],
            "correct_index": 0,
            "category": "Technical",
            "difficulty": "medium",
        },
        {
            "text": "What is the purpose of Git's cherry-pick command?",
            "options": ["To merge two branches completely", "To apply the changes introduced by some existing commits on other branches", "To delete a remote branch", "To discard unstaged changes"],
            "correct_index": 1,
            "category": "Technical",
            "difficulty": "hard",
        },
        {
            "text": "If all A are B, and some B are C, then some A are definitely C. Is this statement true or false?",
            "options": ["True", "False"],
            "correct_index": 1,
            "category": "Aptitude",
            "difficulty": "hard",
        }
    ]
    questions = []
    for qd in questions_data:
        q = Question(company_id=company_id, **qd)
        await q.insert()
        questions.append(q)
    return questions


async def seed_jobs(company_id: str, plan_key: str) -> list[Job]:
    jobs = []
    if plan_key == "enterprise":
        j1 = Job(
            company_id=company_id,
            title="Senior Software Engineer",
            department="Engineering",
            location="Dhaka (Gulshan)",
            work_mode="Hybrid",
            job_type="Full-time",
            experience_min=5,
            experience_max=10,
            salary_min=120000,
            salary_max=180000,
            currency="BDT",
            skills=["Python", "FastAPI", "MongoDB", "System Design", "Docker"],
            description="We are looking for a Senior Software Engineer to join our backend team. You will be responsible for building scalable API services, designing robust database schemas, and mentoring junior engineers.",
            status="active",
            featured=True,
        )
        await j1.insert()
        jobs.append(j1)

        j2 = Job(
            company_id=company_id,
            title="Product Manager",
            department="Product",
            location="Remote",
            work_mode="Remote",
            job_type="Full-time",
            experience_min=3,
            experience_max=6,
            salary_min=100000,
            salary_max=150000,
            currency="BDT",
            skills=["Roadmapping", "Agile", "User Research", "Scrum"],
            description="We are seeking an experienced Product Manager to drive product development from concept to launch. You will collaborate with engineering, design, and marketing teams to define and execute the product vision.",
            status="active",
            featured=False,
        )
        await j2.insert()
        jobs.append(j2)

    elif plan_key == "pro":
        j1 = Job(
            company_id=company_id,
            title="Full Stack Developer",
            department="Engineering",
            location="Dhaka (Banani)",
            work_mode="On-site",
            job_type="Full-time",
            experience_min=2,
            experience_max=5,
            salary_min=60000,
            salary_max=90000,
            currency="BDT",
            skills=["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
            description="Join our team as a Full Stack Developer. You will work on both frontend interfaces and backend API routes, ensuring smooth integration, high performance, and great user experiences.",
            status="active",
            featured=True,
        )
        await j1.insert()
        jobs.append(j1)

    elif plan_key == "free":
        j1 = Job(
            company_id=company_id,
            title="Sales Associate",
            department="Sales",
            location="Dhaka (Dhanmondi)",
            work_mode="On-site",
            job_type="Part-time",
            experience_min=1,
            experience_max=3,
            salary_min=20000,
            salary_max=35000,
            currency="BDT",
            skills=["Negotiation", "CRM", "Communication", "Sales Pitching"],
            description="We are hiring a part-time Sales Associate to manage client inquiries, pitch solutions, and maintain customer relations in our local branch.",
            status="active",
            featured=False,
        )
        await j1.insert()
        jobs.append(j1)

    return jobs


async def seed_exams(company_id: str, jobs: list[Job], questions: list[Question]) -> list[Exam]:
    exams = []
    if not jobs or not questions:
        return exams

    job = jobs[0]
    q_ids = [str(q.id) for q in questions[:5]]
    exam = Exam(
        company_id=company_id,
        job_id=str(job.id),
        title=f"{job.title} Core Assessment",
        category="Technical",
        description="A general core skills assessment containing coding, OOP, and database questions.",
        num_questions=len(q_ids),
        duration_min=30,
        pass_score=70.0,
        question_ids=q_ids,
        status="active",
        sent_count=0,
    )
    await exam.insert()
    exams.append(exam)
    return exams


async def seed_candidates(company_id: str, job: Job, exam: Exam | None = None) -> list[Candidate]:
    candidates = []
    
    if job.title == "Senior Software Engineer":
        c1 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Diana Prince",
            email="diana.prince@example.com",
            phone="+8801711111111",
            location="Dhaka, Bangladesh",
            skills=["Python", "FastAPI", "MongoDB", "System Design", "Docker", "AWS"],
            matched_skills=["Python", "FastAPI", "MongoDB", "System Design", "Docker"],
            missing_skills=[],
            experience_years=8.5,
            education="M.Sc. in Computer Science (DU)",
            scores={"skill": 96, "experience": 95, "education": 90, "culture": 95},
            overall_score=94.5,
            ai_summary="Exceptional candidate with extensive Python and backend architecture experience. Showed deep knowledge of system design, database modeling, and team leadership. Perfect technical and cultural fit.",
            strengths=["Expert backend engineering", "Scale & System architecture", "Clear and proactive communication"],
            risks=[],
            stage="Hired",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
            exam_status="completed" if exam else None,
            exam_score=92.0 if exam else None,
        )
        await c1.insert()
        candidates.append(c1)

        c2 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Bob Johnson",
            email="bob.johnson@example.com",
            phone="+8801722222222",
            location="Dhaka, Bangladesh",
            skills=["Python", "FastAPI", "MongoDB", "PostgreSQL"],
            matched_skills=["Python", "FastAPI", "MongoDB"],
            missing_skills=["System Design", "Docker"],
            experience_years=6.0,
            education="B.Sc. in CS (NSU)",
            scores={"skill": 86, "experience": 85, "education": 80, "culture": 85},
            overall_score=84.5,
            ai_summary="Strong software engineer with a focus on web backend frameworks. Familiar with relational and non-relational databases. Good problem-solving skills, though system design experience is somewhat limited.",
            strengths=["Proficient in Python & FastAPI", "Good database fundamentals", "Solid programming patterns"],
            risks=["Limited experience with containerization/deployment"],
            stage="AI Shortlisted",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
            exam_status="completed" if exam else None,
            exam_score=80.0 if exam else None,
        )
        await c2.insert()
        candidates.append(c2)

        c3 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Charlie Brown",
            email="charlie.brown@example.com",
            phone="+8801733333333",
            location="Chittagong, Bangladesh",
            skills=["Python", "FastAPI", "Docker", "System Design"],
            matched_skills=["Python", "FastAPI", "Docker", "System Design"],
            missing_skills=["MongoDB"],
            experience_years=7.0,
            education="B.Sc. in CSE (BUET)",
            scores={"skill": 89, "experience": 88, "education": 90, "culture": 82},
            overall_score=87.5,
            ai_summary="BUET graduate with strong foundation in backend development and containerization. Decent cloud experience. Communicates technical designs clearly.",
            strengths=["Strong algorithmic foundation", "BUET Alumnus", "Excellent communication"],
            risks=["No direct experience with MongoDB"],
            stage="Interview Scheduled",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
            exam_status="started" if exam else None,
        )
        await c3.insert()
        candidates.append(c3)

        c4 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Alice Smith",
            email="alice.smith@example.com",
            phone="+8801744444444",
            location="Sylhet, Bangladesh",
            skills=["Python", "Django", "SQL"],
            matched_skills=["Python"],
            missing_skills=["FastAPI", "MongoDB", "System Design"],
            experience_years=5.0,
            education="B.Sc. in CSE (SUST)",
            scores={"skill": 70, "experience": 75, "education": 75, "culture": 70},
            overall_score=72.0,
            ai_summary="Experienced with Django and Python web applications. Has worked on standard CRUD backends. Needs upskilling in FastAPI, MongoDB, and modern microservices.",
            strengths=["Solid Django experience", "Good SQL fundamentals"],
            risks=["Lacks FastAPI/MongoDB exposure"],
            stage="AI Screened",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
        )
        await c4.insert()
        candidates.append(c4)

        c5 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="John Doe",
            email="john.doe@example.com",
            phone="+8801755555555",
            location="Dhaka, Bangladesh",
            skills=["Python", "HTML", "CSS"],
            matched_skills=["Python"],
            missing_skills=["FastAPI", "MongoDB", "System Design", "Docker"],
            experience_years=2.0,
            education="Self-taught",
            scores={"skill": 45, "experience": 40, "education": 50, "culture": 60},
            overall_score=46.5,
            ai_summary="Junior Python coder with basic frontend skills. Lacks the enterprise backend experience and systems knowledge required for this senior position.",
            strengths=["Eager frontend/python learner"],
            risks=["Very junior for a senior-level role", "No FastAPI or DB knowledge"],
            stage="Applied",
            status="active",
            source="CV Upload",
            scored_by="Heuristic Scorer",
        )
        await c5.insert()
        candidates.append(c5)

        c6 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Peter Parker",
            email="peter.parker@example.com",
            phone="+8801766666666",
            location="Dhaka, Bangladesh",
            skills=["Javascript", "Node.js", "React"],
            matched_skills=[],
            missing_skills=["Python", "FastAPI", "MongoDB", "System Design"],
            experience_years=4.0,
            education="B.Sc. in CSE (AIUB)",
            scores={"skill": 40, "experience": 60, "education": 60, "culture": 70},
            overall_score=53.0,
            ai_summary="Strong developer but in Javascript/Node.js stack rather than Python/FastAPI. The role is strictly Python/FastAPI, making him a mismatch for this specific job opening.",
            strengths=["React / Frontend skills"],
            risks=["No Python/FastAPI experience"],
            stage="Rejected",
            status="active",
            source="CV Upload",
            scored_by="Heuristic Scorer",
        )
        await c6.insert()
        candidates.append(c6)

    elif job.title == "Product Manager":
        c1 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Bruce Wayne",
            email="bruce.wayne@example.com",
            phone="+8801777777777",
            location="Dhaka, Bangladesh",
            skills=["Agile", "User Research"],
            matched_skills=["Agile", "User Research"],
            missing_skills=["Roadmapping", "Scrum"],
            experience_years=3.0,
            education="BBA (IBA, DU)",
            scores={"skill": 65, "experience": 60, "education": 80, "culture": 75},
            overall_score=68.0,
            ai_summary="Product analyst looking to transition to PM. Good analytical skills and market research, needs more roadmapping and engineering coordination experience.",
            strengths=["Excellent market research", "Analytically strong"],
            risks=["Lacks technical roadmapping experience"],
            stage="Applied",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
        )
        await c1.insert()
        candidates.append(c1)

        c2 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Clark Kent",
            email="clark.kent@example.com",
            phone="+8801788888888",
            location="Dhaka, Bangladesh",
            skills=["Roadmapping", "Agile", "User Research", "Scrum", "Jira"],
            matched_skills=["Roadmapping", "Agile", "User Research", "Scrum"],
            missing_skills=[],
            experience_years=5.5,
            education="MBA (IBA, DU)",
            scores={"skill": 92, "experience": 90, "education": 85, "culture": 90},
            overall_score=90.0,
            ai_summary="Experienced Product Manager with a proven record of leading agile cross-functional teams. Excellent roadmapping, wireframing, and user research capability.",
            strengths=["End-to-end PM delivery", "Agile leadership", "Strong user empathy"],
            risks=[],
            stage="Interview Scheduled",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
        )
        await c2.insert()
        candidates.append(c2)

    elif job.title == "Full Stack Developer":
        c1 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Jane Foster",
            email="jane.foster@example.com",
            phone="+8801712345678",
            location="Dhaka, Bangladesh",
            skills=["React", "Next.js", "Node.js", "Tailwind CSS"],
            matched_skills=["React", "Next.js", "Node.js", "Tailwind CSS"],
            missing_skills=["PostgreSQL"],
            experience_years=3.5,
            education="B.Sc. in CSE (NSU)",
            scores={"skill": 84, "experience": 80, "education": 80, "culture": 85},
            overall_score=82.0,
            ai_summary="Proficient full stack developer with great react and next.js framework skills. Capable of building beautiful layouts and efficient API routes.",
            strengths=["Excellent React & Next.js details", "Sleek frontend layout skills"],
            risks=["Lacks PostgreSQL database scaling experience"],
            stage="AI Shortlisted",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
            exam_status="completed" if exam else None,
            exam_score=80.0 if exam else None,
        )
        await c1.insert()
        candidates.append(c1)

        c2 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Clark Kent",
            email="clark.kent.pro@example.com",
            phone="+8801788888889",
            location="Dhaka, Bangladesh",
            skills=["React", "Tailwind CSS"],
            matched_skills=["React", "Tailwind CSS"],
            missing_skills=["Next.js", "Node.js", "PostgreSQL"],
            experience_years=2.0,
            education="B.Sc. in CS (IUB)",
            scores={"skill": 60, "experience": 65, "education": 70, "culture": 70},
            overall_score=65.0,
            ai_summary="Junior frontend developer with basic React skills. Needs more backend and Node.js database scaling experience to fit full-stack profile.",
            strengths=["Tailwind expert", "Decent React coding style"],
            risks=["Missing backend database knowledge"],
            stage="AI Screened",
            status="active",
            source="CV Upload",
            scored_by="Heuristic Scorer",
        )
        await c2.insert()
        candidates.append(c2)

        c3 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Oliver Queen",
            email="oliver.queen@example.com",
            phone="+8801799999999",
            location="Dhaka, Bangladesh",
            skills=["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
            matched_skills=["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
            missing_skills=[],
            experience_years=4.5,
            education="B.Sc. in CSE (BUET)",
            scores={"skill": 92, "experience": 90, "education": 88, "culture": 90},
            overall_score=90.5,
            ai_summary="Top class full-stack engineer. BUET graduate with exceptional command over PostgreSQL query optimization, Node.js API development, and Next.js optimization.",
            strengths=["Optimized database architecture", "Highly performant Next.js code"],
            risks=[],
            stage="Hired",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
            exam_status="completed" if exam else None,
            exam_score=90.0 if exam else None,
        )
        await c3.insert()
        candidates.append(c3)

    elif job.title == "Sales Associate":
        c1 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Bruce Wayne",
            email="bruce.wayne.sales@example.com",
            phone="+8801777777778",
            location="Dhaka, Bangladesh",
            skills=["Communication"],
            matched_skills=["Communication"],
            missing_skills=["Negotiation", "CRM", "Sales Pitching"],
            experience_years=1.0,
            education="BBA",
            scores={"skill": 40, "experience": 40, "education": 50, "culture": 50},
            overall_score=45.0,
            ai_summary="Lacks core sales training or CRM platform usage. Fresh graduate with generic communication skills.",
            strengths=["Polite communication"],
            risks=["No direct sales experience"],
            stage="Applied",
            status="active",
            source="CV Upload",
            scored_by="Heuristic Scorer",
        )
        await c1.insert()
        candidates.append(c1)

        c2 = Candidate(
            company_id=company_id,
            job_id=str(job.id),
            job_title=job.title,
            name="Barry Allen",
            email="barry.allen@example.com",
            phone="+8801790909090",
            location="Dhaka, Bangladesh",
            skills=["Negotiation", "Communication", "Sales Pitching"],
            matched_skills=["Negotiation", "Communication", "Sales Pitching"],
            missing_skills=["CRM"],
            experience_years=2.5,
            education="BBA in Marketing (NSU)",
            scores={"skill": 80, "experience": 75, "education": 80, "culture": 75},
            overall_score=78.0,
            ai_summary="Energetic and fast-paced marketer. Has solid sales pitch skills, communicates confidently, and has background in B2C negotiation.",
            strengths=["Fast learner", "Great sales pitching", "Confident negotiator"],
            risks=["Needs training on specific CRM database tools"],
            stage="AI Screened",
            status="active",
            source="CV Upload",
            scored_by="LLM Evaluator",
        )
        await c2.insert()
        candidates.append(c2)

    return candidates


async def seed_exam_invites(company_id: str, exam: Exam, candidates: list[Candidate]) -> None:
    for c in candidates:
        if c.exam_status == "completed":
            inv = ExamInvite(
                company_id=company_id,
                job_id=exam.job_id,
                candidate_id=str(c.id),
                exam_id=str(exam.id),
                token=f"TOKEN-{str(c.id)[:6].upper()}",
                question_ids=exam.question_ids,
                answers={qid: 1 for qid in exam.question_ids},
                score=c.exam_score or 85.0,
                correct=4,
                total=5,
                status="completed",
                emailed=True,
                sent_to=c.email,
                started_at=datetime.now(timezone.utc) - timedelta(minutes=45),
                completed_at=datetime.now(timezone.utc) - timedelta(minutes=15),
            )
            await inv.insert()
        elif c.exam_status == "started":
            inv = ExamInvite(
                company_id=company_id,
                job_id=exam.job_id,
                candidate_id=str(c.id),
                exam_id=str(exam.id),
                token=f"TOKEN-{str(c.id)[:6].upper()}",
                question_ids=exam.question_ids,
                answers={},
                status="started",
                emailed=True,
                sent_to=c.email,
                started_at=datetime.now(timezone.utc) - timedelta(minutes=10),
            )
            await inv.insert()
        elif c.exam_status == "pending":
            inv = ExamInvite(
                company_id=company_id,
                job_id=exam.job_id,
                candidate_id=str(c.id),
                exam_id=str(exam.id),
                token=f"TOKEN-{str(c.id)[:6].upper()}",
                question_ids=exam.question_ids,
                status="pending",
                emailed=True,
                sent_to=c.email,
            )
            await inv.insert()


async def seed_interviews(company_id: str, candidates: list[Candidate]) -> None:
    for c in candidates:
        if c.name == "Diana Prince":
            itv = Interview(
                company_id=company_id,
                candidate_id=str(c.id),
                job_id=c.job_id,
                interview_code="INT-2026-001",
                interview_type="AI Interview",
                mode="Auto",
                scheduled_at=datetime.now(timezone.utc) - timedelta(days=2),
                duration_sec=1240,
                status="Completed",
                ai_score=93.5,
                scores={"communication": 95.0, "technical": 92.0, "problem_solving": 94.0, "coding": 93.0},
                device="Web · Chrome (Mac)",
                location="Dhaka, Bangladesh",
                proctoring_status="No Issues Detected",
                has_video=True,
                video_path=str(settings.storage_path / "demo/interview_diana.mp4"),
                candidate_name=c.name,
                job_title=c.job_title,
            )
            await itv.insert()

            face = FaceAnalysis(
                interview_id=str(itv.id),
                company_id=company_id,
                face_detected=True,
                focus_score=95.0,
                integrity_score=98.0,
                risk_level="low",
                frames_total=2480,
                identity_verified=True,
                identity_match_score=96.5,
                identity_consistency=98.0,
                distinct_identities=1,
                events=[
                    {"type": "focus_high", "count": 1, "severity": "low"},
                    {"type": "look_away", "count": 1, "severity": "low"}
                ],
                timeline=[
                    "00:02 - Candidate identity verified successfully",
                    "05:15 - Candidate focused, maintaining screen presence",
                    "10:45 - Looking away briefly (1.2s)",
                    "20:30 - Interview completed with excellent focus scores"
                ]
            )
            await face.insert()

            c.meeting_link = f"/interviews/{str(itv.id)}"
            c.last_activity = datetime.now(timezone.utc)
            await c.save()

        elif c.name == "Charlie Brown":
            itv = Interview(
                company_id=company_id,
                candidate_id=str(c.id),
                job_id=c.job_id,
                interview_code="INT-2026-002",
                interview_type="AI Interview",
                mode="Auto",
                scheduled_at=datetime.now(timezone.utc) + timedelta(days=1),
                status="Scheduled",
                proctoring_status="pending",
                candidate_name=c.name,
                job_title=c.job_title,
            )
            await itv.insert()
            c.meeting_link = f"/interviews/{str(itv.id)}"
            c.last_activity = datetime.now(timezone.utc)
            await c.save()

        elif c.name == "Clark Kent" and c.job_title == "Product Manager":
            itv = Interview(
                company_id=company_id,
                candidate_id=str(c.id),
                job_id=c.job_id,
                interview_code="INT-2026-003",
                interview_type="AI Interview",
                mode="Auto",
                scheduled_at=datetime.now(timezone.utc) + timedelta(days=2),
                status="Scheduled",
                proctoring_status="pending",
                candidate_name=c.name,
                job_title=c.job_title,
            )
            await itv.insert()
            c.meeting_link = f"/interviews/{str(itv.id)}"
            c.last_activity = datetime.now(timezone.utc)
            await c.save()


async def seed_audit_logs(company_id: str, admin_user: User) -> None:
    logs = [
        {
            "action": "company.register",
            "target_type": "company",
            "target_id": company_id,
            "meta": {"name": "Enterprise Corp"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        },
        {
            "action": "subscription.init",
            "target_type": "subscription",
            "target_id": company_id,
            "meta": {"plan": "enterprise"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        },
        {
            "action": "credits.grant",
            "target_type": "credit",
            "target_id": company_id,
            "meta": {"credits": 500, "reason": "Welcome credits"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        },
        {
            "action": "job.create",
            "target_type": "job",
            "meta": {"title": "Senior Software Engineer"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=8),
        },
        {
            "action": "candidate.upload",
            "target_type": "candidate",
            "meta": {"count": 6},
            "created_at": datetime.now(timezone.utc) - timedelta(days=5),
        },
        {
            "action": "exam.create",
            "target_type": "exam",
            "meta": {"title": "Senior Software Engineer Core Assessment"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=4),
        },
        {
            "action": "interview.schedule",
            "target_type": "interview",
            "meta": {"candidate": "Diana Prince"},
            "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        }
    ]
    for ld in logs:
        log = AuditLog(
            actor_id=str(admin_user.id),
            actor_email=admin_user.email,
            actor_role=admin_user.role,
            company_id=company_id,
            ip="127.0.0.1",
            **ld
        )
        await log.insert()


async def seed_credits(company_id: str) -> None:
    acc = await CreditAccount.find_one(CreditAccount.company_id == company_id)
    if not acc:
        acc = CreditAccount(company_id=company_id, balance=1000, lifetime_granted=1200, lifetime_spent=200)
        await acc.insert()
    else:
        acc.balance = 1000
        acc.lifetime_granted = 1200
        acc.lifetime_spent = 200
        await acc.save()

    await CreditTxn.find(CreditTxn.company_id == company_id).delete()
    
    txns = [
        {
            "kind": "grant",
            "credits": 500,
            "reason": "Welcome credits",
            "balance_after": 500,
            "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        },
        {
            "kind": "debit",
            "credits": 50,
            "reason": "CV upload ranking (5 candidates)",
            "model": "gpt-4o-mini",
            "tokens": 45000,
            "cost_usd": 0.50,
            "balance_after": 450,
            "created_at": datetime.now(timezone.utc) - timedelta(days=5),
        },
        {
            "kind": "grant",
            "credits": 700,
            "reason": "Top-up via stripe",
            "balance_after": 1150,
            "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        },
        {
            "kind": "debit",
            "credits": 150,
            "reason": "AI Interview Proctoring & Facial analysis (3 candidates)",
            "balance_after": 1000,
            "created_at": datetime.now(timezone.utc) - timedelta(days=2),
        }
    ]
    for td in txns:
        t = CreditTxn(company_id=company_id, **td)
        await t.insert()


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

    company_admins = {}
    for u in DEMO_USERS:
        user = await User.find_one(User.email == u["email"])
        if not user:
            user = User(
                email=u["email"],
                name=u["name"],
                password_hash=hash_password(DEMO_PASSWORD),
                role=u["role"],
                company_id=name_to_id.get(u["company"]),
                title=u.get("title"),
            )
            await user.insert()
        if u["role"] == "company_admin":
            company_admins[u["company"]] = user

    # Flow-wise logical seed data for each company
    for spec in DEMO_COMPANIES:
        cid = name_to_id.get(spec["name"])
        if not cid:
            continue
        
        # Check if already seeded to ensure idempotency
        jobs_exist = await Job.find_one(Job.company_id == cid)
        if not jobs_exist:
            # Seed Questions
            questions = []
            if spec["plan"] in ("pro", "enterprise"):
                questions = await seed_questions(cid)
            
            # Seed Jobs
            jobs = await seed_jobs(cid, spec["plan"])
            
            # Seed Exams & invites
            exam = None
            if spec["plan"] in ("pro", "enterprise") and jobs and questions:
                exams = await seed_exams(cid, jobs, questions)
                if exams:
                    exam = exams[0]
            
            # Seed Candidates
            all_candidates = []
            for job in jobs:
                candidates = await seed_candidates(cid, job, exam)
                all_candidates.extend(candidates)
            
            # Seed Exam Invites
            if exam and all_candidates:
                await seed_exam_invites(cid, exam, all_candidates)
            
            # Seed Interviews & FaceAnalysis (Enterprise only, since it supports interviewFace module)
            if spec["plan"] == "enterprise" and all_candidates:
                await seed_interviews(cid, all_candidates)
            
            # Seed Audit Logs
            admin_user = company_admins.get(spec["name"])
            if admin_user:
                await seed_audit_logs(cid, admin_user)
                
            # Seed Credit Txns
            await seed_credits(cid)
