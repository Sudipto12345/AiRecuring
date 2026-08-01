from fastapi import APIRouter, Depends
from app.api.deps import super_admin
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/admin/communication", tags=["super-admin-communication"], dependencies=[Depends(super_admin)])

class EmailTemplate(BaseModel):
    id: str
    name: str
    subject: str
    body: str

@router.get("/templates")
async def list_email_templates():
    return [
        {"id": "welcome_email", "name": "Welcome Email", "subject": "Welcome to AiRecuring!", "body": "Hello {{name}},\nWelcome to the platform..."},
        {"id": "password_reset", "name": "Password Reset", "subject": "Reset your password", "body": "Click here to reset..."}
    ]

@router.post("/send-email")
async def send_email(to: str, subject: str, body: str):
    # Mock sending email
    return {"status": "sent", "to": to}
