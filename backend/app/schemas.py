from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class MarkerConfig(BaseModel):
    preset: Optional[str] = None
    patternUrl: Optional[str] = None


class ImageNFTConfig(BaseModel):
    nftBaseUrl: Optional[str] = None


class LocationConfig(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radiusMeters: Optional[int] = Field(default=100, ge=0)


class AttractionBase(BaseModel):
    name: str
    type: str
    marker: Optional[dict[str, Any]] = None
    imageNFT: Optional[dict[str, Any]] = None
    location: Optional[dict[str, Any]] = None
    videoUrl: Optional[str] = None
    thumbnail: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None


class AttractionCreate(AttractionBase):
    id: str


class AttractionUpdate(AttractionBase):
    pass


class Attraction(AttractionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttractionListResponse(BaseModel):
    data: list[Attraction]


class ChatRequest(BaseModel):
    persona: str = "default"
    prompt: str
    sessionId: Optional[str] = None
    language: Optional[str] = None
    context: Optional[dict[str, Any]] = None


class ChatMessage(BaseModel):
    role: str
    content: str
    attachments: Optional[list[dict[str, Any]]] = None


class ChatResponse(BaseModel):
    messages: list[ChatMessage]
    persona: str
    metadata: Optional[dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str

