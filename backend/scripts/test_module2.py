import asyncio
import uuid

import httpx
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

BASE = "http://127.0.0.1:8000/api"


async def upgrade_to_pro(company_id: str):
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.mongo_db]
    await db["subscriptions"].update_one(
        {"company_id": company_id},
        {"$set": {"plan": "pro", "modules": ["cvRanking", "examPortal"]}},
    )
    client.close()


async def main():
    suffix = uuid.uuid4().hex[:6]
    async with httpx.AsyncClient(timeout=30) as c:
        reg = await c.post(f"{BASE}/auth/register", json={
            "company_name": f"QA Exam Co {suffix}",
            "admin_name": "QA Admin",
            "email": f"qa_{suffix}@example.com",
            "password": "secret123",
        })
        token = reg.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}

        me = (await c.get(f"{BASE}/auth/me", headers=h)).json()
        cid = me["company"]["id"]
        await upgrade_to_pro(cid)

        job = (await c.post(f"{BASE}/jobs", headers=h, json={
            "title": "Backend Developer",
            "skills": ["Python", "FastAPI", "MongoDB"],
            "experience_min": 2, "experience_max": 5,
        })).json()
        jid = job["id"]

        files = [("files", ("cand.txt", b"Aisha Khan\naisha@example.com\nPython, FastAPI, MongoDB developer with 4 years experience. Master of Science.", "text/plain"))]
        up = (await c.post(f"{BASE}/candidates/upload", headers=h, data={"job_id": jid}, files=files)).json()
        cand = up["candidates"][0]
        print("UPLOAD: created", up["created"], "| score", cand["overall_score"], "| stage", cand["stage"])

        for i in range(3):
            await c.post(f"{BASE}/questions", headers=h, json={
                "text": f"Question {i+1}: which is correct?",
                "options": ["Right answer", "Wrong 1", "Wrong 2"],
                "correct_index": 0, "category": "Python", "difficulty": "easy",
            })

        disp = (await c.post(f"{BASE}/candidates/{cand['id']}/dispatch", headers=h, json={"mode": "exam", "question_count": 3})).json()
        print("DISPATCH exam: stage", disp["stage"], "| emailed", disp["emailed"], "| link_ok", bool(disp.get("link")))
        token_exam = disp["link"].rstrip("/").split("/")[-1]

        pub = (await c.get(f"{BASE}/exam/{token_exam}")).json()
        print("PUBLIC EXAM: candidate", pub["candidate_name"], "| questions", len(pub["questions"]))

        answers = {q["id"]: 0 for q in pub["questions"]}  # all correct
        res = (await c.post(f"{BASE}/exam/{token_exam}/submit", json={"answers": answers})).json()
        print("SUBMIT: score", res["score"], "| correct", f"{res['correct']}/{res['total']}", "| status", res["status"])

        after = (await c.get(f"{BASE}/candidates/{cand['id']}", headers=h)).json()
        print("CANDIDATE AFTER: stage", after["stage"], "| exam_score", after["exam_score"])

        # Meeting path on a free-plan style call (still pro here, but meeting always allowed)
        files2 = [("files", ("c2.txt", b"Bob Lee\nbob@example.com\nJava developer 1 year.", "text/plain"))]
        up2 = (await c.post(f"{BASE}/candidates/upload", headers=h, data={"job_id": jid}, files=files2)).json()
        c2 = up2["candidates"][0]
        m = (await c.post(f"{BASE}/candidates/{c2['id']}/dispatch", headers=h, json={"mode": "meeting", "meeting_link": "https://meet.google.com/abc-defg-hij"})).json()
        print("DISPATCH meeting: stage", m["stage"], "| link_ok", bool(m.get("link")))


asyncio.run(main())
