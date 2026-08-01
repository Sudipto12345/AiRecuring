import asyncio
import tempfile
import uuid

import cv2
import httpx
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

BASE = "http://127.0.0.1:8000/api"
LENA = "test_assets/lena.jpg"
MESSI = "test_assets/messi.jpg"


async def upgrade(company_id: str):
    client = AsyncIOMotorClient(settings.mongo_uri)
    await client[settings.mongo_db]["subscriptions"].update_one(
        {"company_id": company_id},
        {"$set": {"plan": "enterprise", "modules": ["cvRanking", "examPortal", "interviewFace"]}},
    )
    client.close()


def video_from(images: list[str], frames_each=20) -> str:
    path = tempfile.mktemp(suffix=".mp4")
    writer = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*"mp4v"), 10.0, (320, 320))
    for img_path in images:
        img = cv2.resize(cv2.imread(img_path), (320, 320))
        for _ in range(frames_each):
            writer.write(img)
    writer.release()
    return path


def noise_video() -> str:
    path = tempfile.mktemp(suffix=".mp4")
    writer = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*"mp4v"), 10.0, (320, 320))
    for _ in range(30):
        writer.write(np.random.randint(0, 255, (320, 320, 3), dtype=np.uint8))
    writer.release()
    return path


async def run_interview(c, h, cand_id, label, video_path):
    itv = (await c.post(f"{BASE}/interviews", headers=h, json={"candidate_id": cand_id})).json()
    with open(video_path, "rb") as f:
        res = (await c.post(f"{BASE}/interviews/{itv['id']}/video", headers=h, files={"file": ("v.mp4", f, "video/mp4")})).json()
    fa = res["face"]
    print(f"[{label}] verified={fa['identity_verified']} match={fa['identity_match_score']}% "
          f"consistency={fa['identity_consistency']}% people={fa['distinct_identities']} "
          f"risk={fa['risk_level']} focus={fa['focus_score']}%")


async def main():
    suffix = uuid.uuid4().hex[:6]
    async with httpx.AsyncClient(timeout=120) as c:
        reg = await c.post(f"{BASE}/auth/register", json={
            "company_name": f"FaceRec Co {suffix}", "admin_name": "QA",
            "email": f"fr_{suffix}@example.com", "password": "secret123",
        })
        h = {"Authorization": f"Bearer {reg.json()['access_token']}"}
        cid = (await c.get(f"{BASE}/auth/me", headers=h)).json()["company"]["id"]
        await upgrade(cid)

        job = (await c.post(f"{BASE}/jobs", headers=h, json={"title": "Engineer", "skills": ["Python"]})).json()
        files = [("files", ("c.txt", b"Test User\ntest@example.com\nPython developer 3 years. Bachelor.", "text/plain"))]
        cand = (await c.post(f"{BASE}/candidates/upload", headers=h, data={"job_id": job["id"]}, files=files)).json()["candidates"][0]

        # Reference photo = Lena
        with open(LENA, "rb") as f:
            pr = (await c.post(f"{BASE}/candidates/{cand['id']}/photo", headers=h, files={"file": ("id.jpg", f, "image/jpeg")})).json()
        print("REFERENCE PHOTO: has_reference_photo =", pr["has_reference_photo"])

        await run_interview(c, h, cand["id"], "GENUINE  (lena video vs lena ref)", video_from([LENA], 40))
        await run_interview(c, h, cand["id"], "IMPOSTER (messi video vs lena ref)", video_from([MESSI], 40))
        await run_interview(c, h, cand["id"], "TWO PEOPLE (lena+messi)         ", video_from([LENA, MESSI], 20))
        await run_interview(c, h, cand["id"], "NO FACE  (noise)                ", noise_video())


asyncio.run(main())
