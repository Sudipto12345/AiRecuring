import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email(to: str, subject: str, body: str) -> bool:
    if not settings.smtp_host:
        print(f"[email:console] to={to} subject={subject}\n{body}\n")
        return True
    try:
        msg = EmailMessage()
        msg["From"] = settings.mail_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception as exc:
        print(f"[email:error] {exc}")
        return False
