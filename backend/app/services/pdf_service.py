import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime

class PDFService:
    @staticmethod
    def generate_invoice_pdf(invoice) -> bytes:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.setFont("Helvetica", 12)
        
        # Header
        c.drawString(50, 750, "INVOICE")
        c.drawString(50, 730, f"Invoice ID: {invoice.id}")
        c.drawString(50, 710, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
        
        # Details
        c.drawString(50, 680, f"Amount: ${invoice.amount_usd}")
        c.drawString(50, 660, f"Status: {invoice.status}")
        if hasattr(invoice, 'credits_purchased') and invoice.credits_purchased:
            c.drawString(50, 640, f"Credits: {invoice.credits_purchased}")
        if hasattr(invoice, 'paid_at') and invoice.paid_at:
            c.drawString(50, 620, f"Paid At: {invoice.paid_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        c.save()
        buffer.seek(0)
        return buffer.read()
