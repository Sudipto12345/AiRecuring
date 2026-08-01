from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.api.deps import super_admin
from app.models.billing import Coupon, Invoice, SubscriptionRenewal
from app.models.company import Company
from app.models.credit import CreditTxn
from app.models.user import User

router = APIRouter(prefix="/admin/billing", tags=["super-admin-billing"], dependencies=[Depends(super_admin)])


# --- Schemas ---

class InvoiceCreate(BaseModel):
    company_id: str
    company_name: str
    company_address: Optional[str] = None
    tax_id: Optional[str] = None
    subtotal: float
    tax: float = 0.0
    total: float
    currency: str = "USD"
    status: str = "paid"
    due_date: datetime
    line_items: List[dict] = Field(default_factory=list)


class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percent"
    discount_value: float
    max_uses: int = 100
    expires_at: Optional[datetime] = None


class RenewalCreate(BaseModel):
    company_id: str
    company_name: str
    plan_key: str
    renewal_date: datetime
    amount: float
    auto_renew: bool = True


# --- Invoices Endpoints ---

@router.get("/invoices")
async def list_invoices():
    return await Invoice.find_all().sort("-created_at").to_list()


@router.post("/invoices")
async def create_invoice(payload: InvoiceCreate):
    inv_num = f"INV-{datetime.now().strftime('%Y%m%d')}-{await Invoice.count() + 1:04d}"
    inv = Invoice(
        invoice_number=inv_num,
        company_id=payload.company_id,
        company_name=payload.company_name,
        company_address=payload.company_address,
        tax_id=payload.tax_id,
        subtotal=payload.subtotal,
        tax=payload.tax,
        total=payload.total,
        currency=payload.currency,
        status=payload.status,
        due_date=payload.due_date,
        line_items=payload.line_items,
        paid_at=datetime.now(timezone.utc) if payload.status == "paid" else None,
    )
    await inv.insert()
    return inv


@router.put("/invoices/{id}/status")
async def update_invoice_status(id: str, new_status: str):
    inv = await Invoice.get(id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv.status = new_status
    if new_status == "paid":
        inv.paid_at = datetime.now(timezone.utc)
    await inv.save()
    return inv


@router.delete("/invoices/{id}")
async def delete_invoice(id: str):
    inv = await Invoice.get(id)
    if inv:
        await inv.delete()
    return {"status": "deleted"}


# --- Coupons Endpoints ---

@router.get("/coupons")
async def list_coupons():
    return await Coupon.find_all().sort("-created_at").to_list()


@router.post("/coupons")
async def create_coupon(payload: CouponCreate):
    c = Coupon(
        code=payload.code.upper(),
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        max_uses=payload.max_uses,
        expires_at=payload.expires_at,
    )
    await c.insert()
    return c


@router.put("/coupons/{id}/toggle")
async def toggle_coupon(id: str):
    c = await Coupon.get(id)
    if not c:
        raise HTTPException(status_code=404, detail="Coupon not found")
    c.is_active = not c.is_active
    await c.save()
    return c


@router.delete("/coupons/{id}")
async def delete_coupon(id: str):
    c = await Coupon.get(id)
    if c:
        await c.delete()
    return {"status": "deleted"}


# --- Renewals Endpoints ---

@router.get("/renewals")
async def list_renewals():
    return await SubscriptionRenewal.find_all().sort("renewal_date").to_list()


@router.post("/renewals")
async def create_renewal(payload: RenewalCreate):
    r = SubscriptionRenewal(
        company_id=payload.company_id,
        company_name=payload.company_name,
        plan_key=payload.plan_key,
        renewal_date=payload.renewal_date,
        amount=payload.amount,
        auto_renew=payload.auto_renew,
    )
    await r.insert()
    return r


@router.delete("/renewals/{id}")
async def delete_renewal(id: str):
    r = await SubscriptionRenewal.get(id)
    if r:
        await r.delete()
    return {"status": "deleted"}


# --- Realtime Transactions Endpoint ---

@router.get("/transactions")
async def list_transactions():
    return await CreditTxn.find_all().sort("-created_at").to_list()
