from fastapi import APIRouter, Header

from ...schemas import ChatRequest, ChatResponse
from ...services.analytics import generate_response
from ...socketio_app import emit_session_event

router = APIRouter()


@router.post("/analytics-chat", response_model=ChatResponse)
async def analytics_chat(
    payload: ChatRequest,
    authorization: str | None = Header(default=None),
) -> ChatResponse:
    context = dict(payload.context or {})
    if payload.sessionId:
        context.setdefault("sessionId", payload.sessionId)
    if payload.language:
        context.setdefault("language", payload.language)
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        context["authToken"] = token
    elif authorization:
        context["authToken"] = authorization

    result = await generate_response(payload.persona, payload.prompt, context)
    metadata = result.get("metadata") if isinstance(result, dict) else None
    session_id = metadata.get("sessionId") if isinstance(metadata, dict) else None
    if session_id:
        await emit_session_event(
            session_id,
            "analytics:response",
            {
                "persona": result.get("persona"),
                "messages": result.get("messages"),
                "metadata": metadata,
            },
        )
    return ChatResponse.model_validate(result)

