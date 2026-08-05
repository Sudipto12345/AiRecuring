import os
import stripe
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import company_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/payments", tags=["payments"])
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/checkout")
async def create_checkout(data: dict, user: User = Depends(company_user)):
    PACKAGES = {
        "pkg_10": {"credits": 10, "price": 9.90},
        "pkg_50": {"credits": 50, "price": 44.50},
        "pkg_100": {"credits": 100, "price": 79.00},
        "pkg_500": {"credits": 500, "price": 349.00},
    }
    
    pkg_id = data.get("package_id")
    if not pkg_id or pkg_id not in PACKAGES:
        raise HTTPException(400, "Invalid package")
        
    pkg = PACKAGES[pkg_id]
    credits = pkg["credits"]
    total_price = pkg["price"]
        
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Platform Credits',
                    },
                    'unit_amount': int(total_price * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{settings.frontend_url}/settings/billing?success=true",
            cancel_url=f"{settings.frontend_url}/settings/billing?canceled=true",
            metadata={
                "company_id": user.company_id,
                "credits": credits
            },
            payment_intent_data={
                "metadata": {
                    "company_id": user.company_id,
                    "credits": credits
                }
            }
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(500, str(e))
