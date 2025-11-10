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
    persona_seed_path: Path = Path(__file__).resolve().parents[1] / "store" / "data" / "personas.json"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    websocket_namespace: str = "/time-weave"
    jwt_secret: str = "time-weave-secret"
    jwt_algorithm: str = "HS256"
    camara_use_mock: bool = True
    camara_token_url: str = "https://operator.example.com/oauth2/token"
    camara_client_id: str = "your-client-id"
    camara_client_secret: str = "your-client-secret"
    camara_maas_base_url: str = "https://maas.operator.example.com"
    camara_maas_tenant_id: str = "example-tenant"
    camara_population_density_url: str = "https://operator.example.com/population-density-data/v0/query"
    camara_location_retrieval_url: str = "https://operator.example.com/location-retrieval/v0/retrieve"
    camara_knowledge_base_scope: str = "maas-knowledge-base"
    camara_assistant_scope: str = "maas-assistant"
    camara_service_scope: str = "maas-service"
    camara_density_scope: str = "population-density-data"
    camara_location_scope: str = "location-retrieval"
    camara_timeout_seconds: int = 12
    camara_mock_latency_ms: int = 60

    class Config:
        frozen = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL")
    cors = os.getenv("CORS_ORIGINS")
    camara_use_mock = os.getenv("CAMARA_USE_MOCK")
    camara_token_url = os.getenv("CAMARA_TOKEN_URL")
    camara_client_id = os.getenv("CAMARA_CLIENT_ID")
    camara_client_secret = os.getenv("CAMARA_CLIENT_SECRET")
    camara_maas_base_url = os.getenv("CAMARA_MAAS_BASE_URL")
    camara_maas_tenant_id = os.getenv("CAMARA_MAAS_TENANT_ID")
    camara_population_density_url = os.getenv("CAMARA_POPULATION_DENSITY_URL")
    camara_location_retrieval_url = os.getenv("CAMARA_LOCATION_RETRIEVAL_URL")
    jwt_secret = os.getenv("JWT_SECRET")
    jwt_algorithm = os.getenv("JWT_ALGORITHM")

    defaults = Settings()
    return Settings(
        database_url=database_url or defaults.database_url,
        cors_origins=[origin.strip() for origin in cors.split(",")] if cors else defaults.cors_origins,
        camara_use_mock=camara_use_mock.lower() == "true" if camara_use_mock else defaults.camara_use_mock,
        camara_token_url=camara_token_url or defaults.camara_token_url,
        camara_client_id=camara_client_id or defaults.camara_client_id,
        camara_client_secret=camara_client_secret or defaults.camara_client_secret,
        camara_maas_base_url=camara_maas_base_url or defaults.camara_maas_base_url,
        camara_maas_tenant_id=camara_maas_tenant_id or defaults.camara_maas_tenant_id,
        camara_population_density_url=camara_population_density_url or defaults.camara_population_density_url,
        camara_location_retrieval_url=camara_location_retrieval_url or defaults.camara_location_retrieval_url,
        jwt_secret=jwt_secret or defaults.jwt_secret,
        jwt_algorithm=jwt_algorithm or defaults.jwt_algorithm,
    )

