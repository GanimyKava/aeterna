from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .api.routes import health, attractions, analytics, time_weave
from .config import get_settings
from .database import Base, engine, get_session
from .initial_data import load_yaml_attractions
from . import crud, schemas
from .socketio_app import SOCKET_MOUNT_PATH, socket_app

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)

    with get_session() as session:
        existing = crud.list_attractions(session)
        if not existing:
            for item in load_yaml_attractions(settings.data_path):
                crud.create_attraction(session, item)


api_prefix = settings.api_prefix
app.include_router(health.router)
app.include_router(attractions.router, prefix=api_prefix)
app.include_router(analytics.router)
app.include_router(time_weave.router)

store_root = settings.store_path
app.mount("/assets", StaticFiles(directory=store_root / "assets"), name="assets")
app.mount("/images", StaticFiles(directory=store_root / "images"), name="images")

data_mounts = StaticFiles(directory=store_root / "data")
app.mount("/data", data_mounts, name="data")
app.mount("/api/data", data_mounts, name="data-api")
app.mount(SOCKET_MOUNT_PATH, socket_app)


def mount_frontend(app_directory: Path) -> None:
    build_dir = app_directory / "build"
    index_file = build_dir / "index.html"

    if not index_file.exists():
        @app.get("/", include_in_schema=False)
        async def root() -> dict[str, str]:
            return {"message": "Echoes of Eternity API"}

        return

    app.mount("/", StaticFiles(directory=build_dir, html=True), name="frontend")

    excluded_prefixes = (
        "api/",
        "api",
        "analytics-chat",
        "analytics-socket",
        "time-weave",
        "assets",
        "images",
        "styles",
        "data",
    )

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str) -> FileResponse:
        if full_path.startswith(excluded_prefixes):
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse(index_file)


mount_frontend(settings.root_path / "frontend")

