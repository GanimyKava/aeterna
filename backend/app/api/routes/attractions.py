from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ... import crud, schemas
from ...api import deps
from ...initial_data import export_attractions_to_yaml

router = APIRouter(prefix="/attractions", tags=["Attractions"])


@router.get("/", response_model=schemas.AttractionListResponse)
def list_attractions(db: Session = Depends(deps.get_db)) -> schemas.AttractionListResponse:
    items = crud.list_attractions(db)
    return schemas.AttractionListResponse(
        data=[schemas.Attraction.model_validate(item) for item in items]
    )


@router.get("/export", response_class=Response)
def export_attractions(db: Session = Depends(deps.get_db)) -> Response:
    items = crud.list_attractions(db)
    payload = export_attractions_to_yaml(
        [
            schemas.Attraction.model_validate(item)
            for item in items
        ]
    )
    return Response(content=payload, media_type="text/yaml")


@router.get("/{attraction_id}", response_model=schemas.Attraction)
def get_attraction(
    attraction_id: str,
    db: Session = Depends(deps.get_db),
) -> schemas.Attraction:
    item = crud.get_attraction(db, attraction_id)
    if not item:
        raise HTTPException(status_code=404, detail="Attraction not found")
    return schemas.Attraction.model_validate(item)


@router.post("/", response_model=schemas.Attraction, status_code=201)
def create_attraction(
    request: schemas.AttractionCreate,
    db: Session = Depends(deps.get_db),
) -> schemas.Attraction:
    if crud.get_attraction(db, request.id):
        raise HTTPException(status_code=400, detail="Attraction with this ID already exists")
    item = crud.create_attraction(db, request)
    return schemas.Attraction.model_validate(item)


@router.put("/{attraction_id}", response_model=schemas.Attraction)
def update_attraction(
    attraction_id: str,
    request: schemas.AttractionUpdate,
    db: Session = Depends(deps.get_db),
) -> schemas.Attraction:
    item = crud.get_attraction(db, attraction_id)
    if not item:
        raise HTTPException(status_code=404, detail="Attraction not found")
    updated = crud.update_attraction(db, item, request)
    return schemas.Attraction.model_validate(updated)


@router.delete("/{attraction_id}", status_code=204)
def delete_attraction(attraction_id: str, db: Session = Depends(deps.get_db)) -> None:
    item = crud.get_attraction(db, attraction_id)
    if not item:
        raise HTTPException(status_code=404, detail="Attraction not found")
    crud.delete_attraction(db, item)


@router.put("/", response_model=schemas.AttractionListResponse)
def replace_attractions(
    request: list[schemas.AttractionCreate],
    db: Session = Depends(deps.get_db),
) -> schemas.AttractionListResponse:
    updated = crud.replace_attractions(db, request)
    return schemas.AttractionListResponse(
        data=[schemas.Attraction.model_validate(item) for item in updated]
    )

