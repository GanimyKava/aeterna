from fastapi import APIRouter

from ...schemas import HealthResponse

router = APIRouter()


@router.get("/healthz", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")

