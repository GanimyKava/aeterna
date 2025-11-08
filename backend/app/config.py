from functools import lru_cache
from pathlib import Path
from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "Echoes of Eternity API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./app.db"
    root_path: Path = Path(__file__).resolve().parents[2]
    store_path: Path = Path(__file__).resolve().parents[1] / "store"
    data_path: Path = Path(__file__).resolve().parents[1] / "store" / "data" / "attractions.yaml"
    camara_sample_path: Path = Path(__file__).resolve().parents[1] / "store" / "data" / "camaraSampleResponses.json"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    websocket_namespace: str = "/time-weave"

    class Config:
        frozen = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL")
    cors = os.getenv("CORS_ORIGINS")

    defaults = Settings()
    return Settings(
        database_url=database_url or defaults.database_url,
        cors_origins=[origin.strip() for origin in cors.split(",")] if cors else defaults.cors_origins,
    )

