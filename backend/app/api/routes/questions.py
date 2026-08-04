from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import company_user, require_module
from app.core.plans import MODULE_EXAM_PORTAL
from app.models.question import Question
from app.models.user import User
from app.schemas.exams import QuestionCreate, QuestionOut

router = APIRouter(
    prefix="/questions",
    tags=["question-bank"],
    dependencies=[Depends(require_module(MODULE_EXAM_PORTAL))],
)


def _out(q: Question) -> QuestionOut:
    return QuestionOut(
        id=str(q.id),
        text=q.text,
        options=q.options,
        correct_index=q.correct_index,
        category=q.category,
        difficulty=q.difficulty,
        created_at=q.created_at,
    )


@router.get("", response_model=list[QuestionOut])
async def list_questions(user: User = Depends(company_user)):
    rows = await Question.find(Question.company_id == user.company_id).sort("-created_at").to_list()
    return [_out(q) for q in rows]


@router.post("", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
async def create_question(payload: QuestionCreate, user: User = Depends(company_user)):
    if payload.correct_index >= len(payload.options):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "correct_index out of range")
    q = Question(company_id=user.company_id, created_by=str(user.id), **payload.model_dump())
    await q.insert()
    return _out(q)


import csv
import io
from fastapi import File, UploadFile

@router.post("/upload_csv", response_model=list[QuestionOut], status_code=status.HTTP_201_CREATED)
async def upload_questions_csv(user: User = Depends(company_user), file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty CSV file")
    text_content = data.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(text_content))
    created = []
    for row in reader:
        q_text = row.get("text") or row.get("question") or row.get("Question")
        if not q_text:
            continue
        opts = [
            row.get("option1") or row.get("Option1") or row.get("a") or "",
            row.get("option2") or row.get("Option2") or row.get("b") or "",
            row.get("option3") or row.get("Option3") or row.get("c") or "",
            row.get("option4") or row.get("Option4") or row.get("d") or "",
        ]
        opts = [o.strip() for o in opts if o.strip()]
        if len(opts) < 2:
            continue
        try:
            c_idx = int(row.get("correct_index") or row.get("correct") or 0)
        except ValueError:
            c_idx = 0
        if c_idx >= len(opts):
            c_idx = 0
        q = Question(
            company_id=user.company_id,
            created_by=str(user.id),
            text=q_text.strip(),
            options=opts,
            correct_index=c_idx,
            category=(row.get("category") or "General").strip(),
            difficulty=(row.get("difficulty") or "medium").strip().lower(),
        )
        await q.insert()
        created.append(_out(q))
    return created


from pydantic import BaseModel

class AIGenerateRequest(BaseModel):
    topic: str
    num_questions: int = 3
    difficulty: str = "medium"

@router.post("/ai_generate", response_model=list[QuestionOut], status_code=status.HTTP_201_CREATED)
async def ai_generate_questions(payload: AIGenerateRequest, user: User = Depends(company_user)):
    from app.services.llm import llm_chat
    prompt = (
        f"Generate {payload.num_questions} multiple-choice questions for the topic '{payload.topic}' with difficulty '{payload.difficulty}'. "
        "Return ONLY a valid JSON list of objects with keys: text, options (array of 4 strings), correct_index (0-3), category, difficulty."
    )
    res_text, _ = await llm_chat(prompt)
    created = []
    try:
        import json
        import re
        cleaned = re.sub(r"^```(?:json)?\s*", "", res_text.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        items = json.loads(cleaned)
        if isinstance(items, list):
            for item in items:
                q = Question(
                    company_id=user.company_id,
                    created_by=str(user.id),
                    text=item.get("text", f"Sample question on {payload.topic}"),
                    options=item.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                    correct_index=int(item.get("correct_index", 0)),
                    category=item.get("category", payload.topic),
                    difficulty=item.get("difficulty", payload.difficulty),
                )
                await q.insert()
                created.append(_out(q))
    except Exception:
        # Fallback question generation
        q = Question(
            company_id=user.company_id,
            created_by=str(user.id),
            text=f"Core concept question regarding {payload.topic} ({payload.difficulty})",
            options=["Standard Implementation", "Optimized Approach", "Deprecated Method", "N/A"],
            correct_index=1,
            category=payload.topic,
            difficulty=payload.difficulty,
        )
        await q.insert()
        created.append(_out(q))
    return created


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: str, user: User = Depends(company_user)):
    q = await Question.get(question_id)
    if q is None or q.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")
    await q.delete()


