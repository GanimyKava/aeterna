from __future__ import annotations

import asyncio
import json
import time
from copy import deepcopy
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping, MutableMapping

import httpx

from ...config import get_settings
from ...initial_data import load_camara_samples


@dataclass(frozen=True)
class CamaraCredentials:
    token_url: str
    client_id: str
    client_secret: str


@dataclass(frozen=True)
class CamaraRequestContext:
    method: str
    url: str
    scope: str
    mock_key: str | None = None
    headers: Mapping[str, str] | None = None


@dataclass
class _TokenEntry:
    access_token: str
    expires_at: float
    scope_key: str


class CamaraClient:
    """Thin wrapper around CAMARA MaaS endpoints with mock support and token caching."""

    def __init__(
        self,
        credentials: CamaraCredentials | None = None,
        *,
        use_mock: bool | None = None,
        timeout: float | None = None,
        mock_latency_ms: int | None = None,
    ) -> None:
        settings = get_settings()
        self._credentials = credentials or CamaraCredentials(
            token_url=settings.camara_token_url,
            client_id=settings.camara_client_id,
            client_secret=settings.camara_client_secret,
        )
        self._use_mock = settings.camara_use_mock if use_mock is None else use_mock
        self._timeout = timeout or settings.camara_timeout_seconds
        self._mock_latency = (
            mock_latency_ms if mock_latency_ms is not None else settings.camara_mock_latency_ms
        )
        self._token_cache: MutableMapping[str, _TokenEntry] = {}
        self._mock_payloads: dict[str, Any] | None = None
        self._http_client = httpx.AsyncClient(timeout=self._timeout)

    async def close(self) -> None:
        await self._http_client.aclose()

    async def __aenter__(self) -> "CamaraClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await self.close()

    async def _load_mock_payloads(self) -> Mapping[str, Any]:
        if self._mock_payloads is None:
            settings = get_settings()
            payload = load_camara_samples(settings.camara_sample_path)
            if isinstance(payload, Mapping):
                self._mock_payloads = dict(payload)
            else:
                raise ValueError("CAMARA mock payloads must be a JSON object.")
        return self._mock_payloads

    def _build_scope_key(self, scope: str | Iterable[str]) -> str:
        if isinstance(scope, str):
            return scope
        ordered = sorted(set(scope))
        return " ".join(ordered)

    async def _obtain_token(self, scope: str | Iterable[str] | None = None) -> str:
        scope_key = self._build_scope_key(scope or [])
        cached = self._token_cache.get(scope_key)
        now = time.time()
        if cached and cached.expires_at > now + 30:
            return cached.access_token

        if self._use_mock:
            payloads = await self._load_mock_payloads()
            token_payload = payloads.get("token") or {
                "access_token": "mock-access-token",
                "expires_in": 3600,
            }
            access_token = str(token_payload.get("access_token", "mock-access-token"))
            expires_in = float(token_payload.get("expires_in", 3600))
            self._token_cache[scope_key] = _TokenEntry(
                access_token=access_token,
                expires_at=now + expires_in,
                scope_key=scope_key,
            )
            return access_token

        data = {"grant_type": "client_credentials"}
        if scope_key:
            data["scope"] = scope_key

        auth = (self._credentials.client_id, self._credentials.client_secret)
        response = await self._http_client.post(
            self._credentials.token_url,
            data=data,
            auth=auth,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        payload = response.json()
        access_token = payload.get("access_token")
        if not access_token:
            raise RuntimeError("Token response missing access_token")
        expires_in = float(payload.get("expires_in", 3600))
        self._token_cache[scope_key] = _TokenEntry(
            access_token=access_token,
            expires_at=now + expires_in,
            scope_key=scope_key,
        )
        return access_token

    async def request(
        self,
        ctx: CamaraRequestContext,
        *,
        json_payload: Any | None = None,
        headers: Mapping[str, str] | None = None,
    ) -> Any:
        """Issue a call to CAMARA, optionally returning mock data."""
        if self._use_mock:
            if not ctx.mock_key:
                raise ValueError("Mock mode requires a mock_key on CamaraRequestContext.")
            payloads = await self._load_mock_payloads()
            if ctx.mock_key not in payloads:
                raise KeyError(f"Mock payload '{ctx.mock_key}' is not defined in sample data.")
            cloned = deepcopy(payloads[ctx.mock_key])
            latency = max(0, int(self._mock_latency))
            if latency:
                await asyncio.sleep(latency / 1000)
            return cloned

        access_token = await self._obtain_token(scope=ctx.scope)

        request_headers: dict[str, str] = {
            "Authorization": f"Bearer {access_token}",
            "x-correlator": self._build_correlator(),
            "Content-Type": "application/json",
        }
        if ctx.headers:
            request_headers.update(ctx.headers)
        if headers:
            request_headers.update(headers)

        response = await self._http_client.request(
            ctx.method,
            ctx.url,
            json=json_payload,
            headers=request_headers,
        )
        response.raise_for_status()
        if not response.content:
            return None
        content_type = response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            return response.json()
        return json.loads(response.text)

    @staticmethod
    def _build_correlator() -> str:
        now = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
        fractional = f"{int(time.time() * 1_000_000) % 1_000_000:06d}"
        return f"aeterna-{now}-{fractional}"

