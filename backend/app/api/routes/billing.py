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

@router.post("/checkout")
async def create_checkout(data: dict, user: User = Depends(company_user)):
    credits = data.get("credits", 0)
    price_per_credit = data.get("price_per_credit", 1.0)
    
    if not credits:
        raise HTTPException(400, "Missing credits")
        
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Platform Credits',
                    },
                    'unit_amount': int(price_per_credit * 100),
                },
                'quantity': credits,
            }],
            mode='payment',
            success_url=f"{settings.frontend_url}/settings/billing?success=true",
            cancel_url=f"{settings.frontend_url}/settings/billing?canceled=true",
            metadata={
                "company_id": user.company_id,
                "credits": credits
            }
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/invoices")
async def list_invoices(user: User = Depends(company_user)):
    invoices = await Invoice.find(Invoice.company_id == user.company_id).to_list()
    return invoices

@router.get("/invoices/{id}/pdf")
async def get_invoice_pdf(id: str, user: User = Depends(company_user)):
    # This would stream from MinIO in a real app
    # For now returning a dummy response
    return {"detail": "PDF streaming not implemented yet"}
