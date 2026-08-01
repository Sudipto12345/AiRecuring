from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import super_admin
from app.core.config import settings
from app.services.bedrock import BOTO3_AVAILABLE
from app.models.credit import CreditTxn
from beanie import Document

router = APIRouter(prefix="/admin/ai", tags=["super-admin-ai"], dependencies=[Depends(super_admin)])


from app.models.ai import PromptTemplate

class PromptTemplateCreate(BaseModel):
    name: str
    description: str
    template_text: str
    variables: List[str]


@router.get("/usage")
async def ai_usage_realtime():
    txns = await CreditTxn.find_all().to_list()
    total_tokens = sum(t.cost * 1000 for t in txns)  # Proxy for tokens for now
    total_spend = sum(t.cost for t in txns)
    return {
        "total_tokens_used": total_tokens,
        "total_spend_usd": total_spend,
        "recent_transactions": [
            {
                "id": str(t.id),
                "company_id": t.company_id,
                "action": t.action,
                "cost": t.cost,
                "created_at": t.created_at
            }
            for t in sorted(txns, key=lambda x: x.created_at, reverse=True)[:50]
        ]
    }


@router.get("/providers")
async def ai_providers():
    return {
        "active_provider": "aws_bedrock" if BOTO3_AVAILABLE and settings.aws_access_key_id else "none",
        "providers": [
            {
                "key": "aws_bedrock",
                "label": "AWS Bedrock",
                "configured": BOTO3_AVAILABLE and bool(settings.aws_access_key_id),
                "status": "online" if BOTO3_AVAILABLE and bool(settings.aws_access_key_id) else "offline",
                "models": ["anthropic.claude-v2", "anthropic.claude-3-sonnet-20240229-v1:0", "amazon.titan-text-express-v1"]
            },
            {
                "key": "anthropic",
                "label": "Anthropic API",
                "configured": False,
                "status": "offline",
                "models": ["claude-3-opus-20240229", "claude-3-sonnet-20240229"]
            },
            {
                "key": "openai",
                "label": "OpenAI",
                "configured": bool(settings.openai_api_key),
                "status": "online" if settings.openai_api_key else "offline",
                "models": ["gpt-4-turbo", "gpt-3.5-turbo"]
            }
        ]
    }


@router.get("/templates")
async def list_templates():
    return await PromptTemplate.find_all().to_list()


@router.post("/templates")
async def create_template(payload: PromptTemplateCreate):
    t = PromptTemplate(
        name=payload.name,
        description=payload.description,
        template_text=payload.template_text,
        variables=payload.variables
    )
    await t.insert()
    return t


@router.put("/templates/{id}/toggle")
async def toggle_template(id: str):
    t = await PromptTemplate.get(id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    t.is_active = not t.is_active
    await t.save()
    return t


@router.delete("/templates/{id}")
async def delete_template(id: str):
    t = await PromptTemplate.get(id)
    if t:
        await t.delete()
    return {"status": "deleted"}
