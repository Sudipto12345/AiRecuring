from fastapi import APIRouter, Depends
from app.api.deps import super_admin
from datetime import datetime

router = APIRouter(prefix="/admin/security", tags=["super-admin-security"], dependencies=[Depends(super_admin)])

@router.get("/threats")
async def get_threats():
    # Mock data for threat detection
    return [
        {"id": "t1", "type": "multiple_failed_logins", "ip": "192.168.1.1", "user_id": "u1", "timestamp": datetime.utcnow()},
        {"id": "t2", "type": "suspicious_ip", "ip": "10.0.0.5", "user_id": None, "timestamp": datetime.utcnow()}
    ]

@router.get("/api-logs")
async def get_api_logs():
    # Mock data for API logs
    return [
        {"id": "log1", "endpoint": "/api/v1/auth/login", "method": "POST", "status": 200, "ip": "127.0.0.1", "timestamp": datetime.utcnow()},
        {"id": "log2", "endpoint": "/api/v1/admin/users", "method": "GET", "status": 200, "ip": "127.0.0.1", "timestamp": datetime.utcnow()}
    ]
