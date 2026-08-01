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


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: str, user: User = Depends(company_user)):
    q = await Question.get(question_id)
    if q is None or q.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")
    await q.delete()
