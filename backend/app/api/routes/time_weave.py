from __future__ import annotations

import asyncio
import json
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/time-weave")
async def time_weave_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        await websocket.send_json(
            {
                "type": "welcome",
                "message": "Connected to Time-Weave stream.",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        )
        while True:
            try:
                data = await websocket.receive_text()
                payload = json.loads(data) if data else {}
            except json.JSONDecodeError:
                payload = {"raw": data}

            await websocket.send_json(
                {
                    "type": "echo",
                    "received": payload,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                }
            )
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        return

