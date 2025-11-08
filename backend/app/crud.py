from __future__ import annotations

from typing import Iterable, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas


def list_attractions(db: Session) -> Sequence[models.Attraction]:
    return db.scalars(select(models.Attraction).order_by(models.Attraction.name)).all()


def get_attraction(db: Session, attraction_id: str) -> models.Attraction | None:
    return db.get(models.Attraction, attraction_id)


def create_attraction(db: Session, attraction: schemas.AttractionCreate) -> models.Attraction:
    db_obj = models.Attraction(
        id=attraction.id,
        name=attraction.name,
        type=attraction.type,
        marker=attraction.marker,
        image_nft=attraction.imageNFT,
        location=attraction.location,
        video_url=attraction.videoUrl,
        thumbnail=attraction.thumbnail,
        city=attraction.city,
        description=attraction.description,
    )
    db.add(db_obj)
    db.flush()
    return db_obj


def update_attraction(
    db: Session,
    db_obj: models.Attraction,
    attraction_in: schemas.AttractionUpdate,
) -> models.Attraction:
    for field, value in attraction_in.model_dump(exclude_unset=True).items():
        if field == "imageNFT":
            setattr(db_obj, "image_nft", value)
        elif field == "videoUrl":
            setattr(db_obj, "video_url", value)
        else:
            setattr(db_obj, field if field != "marker" else "marker", value)
    db.add(db_obj)
    db.flush()
    return db_obj


def delete_attraction(db: Session, db_obj: models.Attraction) -> None:
    db.delete(db_obj)
    db.flush()


def replace_attractions(db: Session, items: Iterable[schemas.AttractionCreate]) -> list[models.Attraction]:
    existing = {item.id: item for item in list_attractions(db)}
    incoming_ids = set()
    results: list[models.Attraction] = []

    for item in items:
        incoming_ids.add(item.id)
        if item.id in existing:
            obj = update_attraction(db, existing[item.id], schemas.AttractionUpdate(**item.model_dump(exclude={"id"})))
        else:
            obj = create_attraction(db, item)
        results.append(obj)

    for existing_id, obj in existing.items():
        if existing_id not in incoming_ids:
            delete_attraction(db, obj)

    return results

