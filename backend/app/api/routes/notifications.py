"""Real-time notification WebSocket hub."""
import asyncio
import logging
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("air.notifications")

router = APIRouter(prefix="/notifications", tags=["notifications"])


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}  # company_id -> [ws]

    async def connect(self, company_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(company_id, []).append(ws)

    def disconnect(self, company_id: str, ws: WebSocket):
        if company_id in self.active:
            if ws in self.active[company_id]:
                self.active[company_id].remove(ws)
            if not self.active[company_id]:
                del self.active[company_id]

    async def broadcast_to_company(self, company_id: str, message: dict):
        for ws in list(self.active.get(company_id, [])):
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send WS message: {e}")


manager = ConnectionManager()


async def notify_company(company_id: str, event_type: str, data: dict | None = None):
    """Helper function to broadcast notification to a specific company."""
    try:
        loop = asyncio.get_running_loop()
        now_ts = loop.time()
    except RuntimeError:
        now_ts = 0.0
    message = {
        "event": event_type,
        "data": data or {},
        "timestamp": now_ts,
    }
    await manager.broadcast_to_company(company_id, message)


@router.websocket("/ws/{company_id}")
async def ws_endpoint(websocket: WebSocket, company_id: str):
    await manager.connect(company_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(company_id, websocket)
    except Exception as e:
        logger.warning(f"WS error: {e}")
        manager.disconnect(company_id, websocket)
