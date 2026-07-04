from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import company_user
from app.models.user import User

router = APIRouter(prefix="/team", tags=["team"])

ASSIGNABLE_ROLES = {"company_admin", "hr", "interviewer"}


class TeamMemberOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    title: str | None = None
    avatar_url: str | None = None
    created_at: datetime


class RoleUpdate(BaseModel):
    role: str


def _row(u: User) -> TeamMemberOut:
    return TeamMemberOut(
        id=str(u.id),
        name=u.name,
        email=u.email,
        role=u.role,
        title=u.title,
        avatar_url=u.avatar_url,
        created_at=u.created_at,
    )


@router.get("", response_model=list[TeamMemberOut])
async def list_team(user: User = Depends(company_user)):
    members = await User.find(User.company_id == user.company_id).sort("+name").to_list()
    return [_row(m) for m in members]


@router.patch("/{member_id}/role", response_model=TeamMemberOut)
async def update_role(member_id: str, payload: RoleUpdate, user: User = Depends(company_user)):
    if user.role != "company_admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only company admins can change roles")
    if payload.role not in ASSIGNABLE_ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid role")
    member = await User.get(member_id)
    if member is None or member.company_id != user.company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")
    member.role = payload.role
    await member.save()
    return _row(member)
