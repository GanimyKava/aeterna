from __future__ import annotations

from typing import Any, Mapping

import socketio

from .config import get_settings


settings = get_settings()

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.cors_origins or "*",
)
socket_app = socketio.ASGIApp(sio, socketio_path="socket.io")

SESSION_PREFIX = "analytics-session-"
SOCKET_MOUNT_PATH = "/analytics-socket"


def _session_room(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"


async def emit_session_event(session_id: str, event: str, payload: Mapping[str, Any]) -> None:
    await sio.emit(event, payload, room=_session_room(session_id))


@sio.event
async def connect(sid, environ):  # type: ignore[override]
    await sio.emit(
        "analytics:status",
        {"message": "Socket connected", "sid": sid},
        to=sid,
    )


@sio.event
async def disconnect(sid):  # type: ignore[override]
    await sio.emit(
        "analytics:status",
        {"message": "Socket disconnected", "sid": sid},
        to=sid,
    )


@sio.on("register_session")
async def register_session(sid, data):  # type: ignore[override]
    session_id = (data or {}).get("sessionId")
    if not session_id:
        await sio.emit(
            "analytics:error",
            {"message": "Missing sessionId for registration."},
            to=sid,
        )
        return
    room = _session_room(session_id)
    sio.enter_room(sid, room)
    await sio.emit(
        "analytics:status",
        {"message": "Session registered", "sessionId": session_id},
        room=room,
    )


@sio.on("leave_session")
async def leave_session(sid, data):  # type: ignore[override]
    session_id = (data or {}).get("sessionId")
    if not session_id:
        return
    room = _session_room(session_id)
    sio.leave_room(sid, room)
    await sio.emit(
        "analytics:status",
        {"message": "Session left", "sessionId": session_id},
        to=sid,
    )

