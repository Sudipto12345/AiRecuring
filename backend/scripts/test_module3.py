import asyncio
import tempfile
import uuid

import cv2
import httpx
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

BASE = "http://127.0.0.1:8000/api"


async def upgrade(company_id: str):
    client = AsyncIOMotorClient(settings.mongo_uri)
    await client[settings.mongo_db]["subscriptions"].update_one(
        {"company_id": company_id},
        {"$set": {"plan": "enterprise", "modules": ["cvRanking", "examPortal", "interviewFace"]}},
    )
    client.close()


def make_video() -> str:
    path = tempfile.mktemp(suffix=".mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(path, fourcc, 10.0, (320, 240))
    for _ in range(40):
        frame = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)
        writer.write(frame)
    writer.release()
    return path


async def main():
    suffix = uuid.uuid4().hex[:6]
    async with httpx.AsyncClient(timeout=60) as c:
        reg = await c.post(f"{BASE}/auth/register", json={
            "company_name": f"QA Interview Co {suffix}",
            "admin_name": "QA Admin",
            "email": f"qai_{suffix}@example.com",
            "password": "secret123",
        })
        token = reg.json()["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        cid = (await c.get(f"{BASE}/auth/me", headers=h)).json()["company"]["id"]
        await upgrade(cid)

        job = (await c.post(f"{BASE}/jobs", headers=h, json={"title": "ML Engineer", "skills": ["Python", "PyTorch"]})).json()
        files = [("files", ("c.txt", b"Dina Roy\ndina@example.com\nPython, PyTorch, 3 years. Bachelor of Science.", "text/plain"))]
        cand = (await c.post(f"{BASE}/candidates/upload", headers=h, data={"job_id": job["id"]}, files=files)).json()["candidates"][0]

        itv = (await c.post(f"{BASE}/interviews", headers=h, json={"candidate_id": cand["id"], "interview_type": "AI Interview"})).json()
        print("SCHEDULED:", itv["interview_code"], "| status", itv["status"])

        vid = make_video()
        with open(vid, "rb") as f:
            up = await c.post(f"{BASE}/interviews/{itv['id']}/video", headers=h, files={"file": ("interview.mp4", f, "video/mp4")})
        result = up.json()
        face = result["face"]
        print("UPLOADED: status", result["status"], "| ai_score", result["ai_score"], "| duration", result["duration_sec"], "s")
        print("FACE: frames", face["frames_total"], "| focus", face["focus_score"], "| integrity", face["integrity_score"], "| risk", face["risk_level"])
        print("SCORES:", result["scores"])

        summ = (await c.get(f"{BASE}/monitoring/summary", headers=h)).json()
        print("MONITORING:", summ)

        ana = (await c.get(f"{BASE}/analytics/summary", headers=h)).json()
        print("ANALYTICS pipeline:", [(p["label"], p["count"]) for p in ana["pipeline"]])
        print("ANALYTICS top_skills:", ana["top_skills"])


asyncio.run(main())
