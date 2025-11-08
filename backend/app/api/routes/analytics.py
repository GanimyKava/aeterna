from fastapi import APIRouter

from ...schemas import ChatRequest, ChatResponse
from ...services.analytics import generate_response

router = APIRouter()


@router.post("/analytics-chat", response_model=ChatResponse)
async def analytics_chat(payload: ChatRequest) -> ChatResponse:
    result = generate_response(payload.persona, payload.prompt, payload.context)
    return ChatResponse.model_validate(result)

