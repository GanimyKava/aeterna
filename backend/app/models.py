from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Attraction(Base):
    __tablename__ = "attractions"

    id: Mapped[str] = mapped_column(String(128), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    marker: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    image_nft: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    location: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    thumbnail: Mapped[str | None] = mapped_column(String(512), nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "marker": self.marker or {},
            "imageNFT": self.image_nft or {},
            "location": self.location or {},
            "videoUrl": self.video_url,
            "thumbnail": self.thumbnail,
            "city": self.city,
            "description": self.description,
        }

