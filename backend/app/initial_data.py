from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

import yaml
from sqlalchemy.orm import Session

from . import crud, schemas


def load_yaml_attractions(path: Path) -> Iterable[schemas.AttractionCreate]:
    if not path.exists():
        raise FileNotFoundError(f"Attractions YAML not found at {path}")

    with path.open("r", encoding="utf-8") as file:
        raw = yaml.safe_load(file) or []

    for item in raw:
        yield schemas.AttractionCreate.model_validate(
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "type": item.get("type"),
                "marker": item.get("marker"),
                "imageNFT": item.get("imageNFT"),
                "location": item.get("location"),
                "videoUrl": item.get("videoUrl"),
                "thumbnail": item.get("thumbnail"),
                "city": item.get("city"),
                "description": item.get("description"),
            }
        )


def export_attractions_to_yaml(attractions: Iterable[schemas.Attraction]) -> str:
    data = [
        {
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "marker": a.marker,
            "imageNFT": a.imageNFT,
            "location": a.location,
            "videoUrl": a.videoUrl,
            "thumbnail": a.thumbnail,
            "city": a.city,
            "description": a.description,
        }
        for a in attractions
    ]
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True)


def load_camara_samples(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)

