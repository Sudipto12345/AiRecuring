import os
import stripe
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import StreamingResponse
from app.api.deps import company_user
from app.models.user import User
from app.models.invoice import Invoice
from app.models.subscription import Subscription
from app.core.config import settings
from datetime import datetime, timezone
from app.services.pdf_service import PDFService

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        company_id = intent.get("metadata", {}).get("company_id")
        credits = int(intent.get("metadata", {}).get("credits", 0))
        if company_id and credits:
            sub = await Subscription.find_one(Subscription.company_id == company_id)
            if sub:
                sub.credits += credits
                await sub.save()
                
            inv = await Invoice.find_one(Invoice.stripe_invoice_id == intent.get("invoice"))
            if inv:
                inv.status = "paid"
                inv.paid_at = datetime.now(timezone.utc)
                await inv.save()
            else:
                # Create a new invoice record for the credit purchase
                new_inv = Invoice(
                    company_id=company_id,
                    stripe_invoice_id=intent.get("invoice") or intent.get("id"),
                    amount_usd=intent.get("amount", 0) / 100.0,
                    credits_purchased=credits,
                    status="paid",
                    issued_at=datetime.now(timezone.utc),
                    paid_at=datetime.now(timezone.utc)
                )
                await new_inv.insert()

    elif event["type"] == "invoice.payment_failed":
        inv_obj = event["data"]["object"]
        company_id = inv_obj.get("subscription_details", {}).get("metadata", {}).get("company_id")
        # In a real app we'd map subscription to company
        if company_id:
            sub = await Subscription.find_one(Subscription.company_id == company_id)
            if sub:
                sub.status = "past_due"
                await sub.save()

    elif event["type"] == "customer.subscription.deleted":
        sub_obj = event["data"]["object"]
        company_id = sub_obj.get("metadata", {}).get("company_id")
        if company_id:
            sub = await Subscription.find_one(Subscription.company_id == company_id)
            if sub:
                sub.plan_id = "free"
                await sub.save()

    return {"status": "success"}

@router.get("/invoices")
async def list_invoices(user: User = Depends(company_user)):
    invoices = await Invoice.find(Invoice.company_id == user.company_id).to_list()
    return invoices

@router.get("/invoices/{id}/pdf")
async def get_invoice_pdf(id: str, user: User = Depends(company_user)):
    from bson import ObjectId
    try:
        inv = await Invoice.get(ObjectId(id))
        if not inv or inv.company_id != user.company_id:
            raise HTTPException(404, "Invoice not found")
            
        pdf_bytes = PDFService.generate_invoice_pdf(inv)
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=invoice_{inv.id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(500, str(e))
