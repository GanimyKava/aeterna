from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping, MutableMapping, Sequence

from .client import CamaraClient, CamaraRequestContext
from ...config import get_settings


@dataclass
class MaaSChatMessage:
    role: str
    content: str
    attachments: list[dict[str, Any]] | None = None


@dataclass
class MaaSQueryResult:
    messages: list[MaaSChatMessage]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class MaaSAssistantConfig:
    persona: str
    instructions: str
    language: str = "en"
    description: str | None = None
    tags: list[str] | None = None
    knowledge_base_documents: Sequence[dict[str, Any]] = field(default_factory=list)


class MaaSOrchestrator:
    """Coordinates MaaS Knowledge Base, Assistant, and Service API lifecycles."""

    def __init__(self, client: CamaraClient | None = None) -> None:
        self._settings = get_settings()
        self._client = client or CamaraClient()
        self._knowledge_base_ids: MutableMapping[str, str] = {}
        self._assistant_ids: MutableMapping[str, str] = {}

    @property
    def client(self) -> CamaraClient:
        return self._client

    async def ensure_assistant(self, config: MaaSAssistantConfig) -> str:
        if self._client._use_mock:  # type: ignore[attr-defined]
            return self._ensure_mock_assistant(config)

        knowledge_base_id = await self._ensure_remote_knowledge_base(config)
        existing = self._assistant_ids.get(config.persona)
        if existing:
            return existing

        payload = {
            "name": f"{config.persona.title()} Time-Weave Assistant",
            "description": config.description
            or "Adaptive MaaS-powered guide for Echoes of Eternity AR analytics.",
            "instructions": config.instructions,
            "language": config.language,
            "knowledgeBaseIds": [knowledge_base_id],
            "tags": config.tags or ["echoes-of-eternity", "time-weave", config.persona],
        }

        ctx = CamaraRequestContext(
            method="POST",
            url=self._build_manage_url("/assistants"),
            scope=self._settings.camara_assistant_scope,
            mock_key=None,
        )
        response = await self._client.request(ctx, json_payload=payload)
        assistant_id = response.get("id")
        if not assistant_id:
            raise RuntimeError("Assistant creation failed: missing id")
        self._assistant_ids[config.persona] = assistant_id
        return assistant_id

    async def query(
        self,
        persona: str,
        prompt: str,
        session_id: str,
        *,
        instructions: str,
        attachments: Sequence[dict[str, Any]] | None = None,
        context: Mapping[str, Any] | None = None,
        language: str = "en",
    ) -> MaaSQueryResult:
        if self._client._use_mock:  # type: ignore[attr-defined]
            return self._mock_query(
                persona,
                prompt,
                session_id=session_id,
                instructions=instructions,
                attachments=attachments,
                context=context,
            )

        config = MaaSAssistantConfig(persona=persona, instructions=instructions, language=language)
        assistant_id = await self.ensure_assistant(config)

        payload = {
            "assistantId": assistant_id,
            "sessionId": session_id,
            "query": prompt,
            "language": language,
            "context": context or {},
            "attachments": list(attachments or []),
        }

        ctx = CamaraRequestContext(
            method="POST",
            url=self._build_service_url("/assistants/query"),
            scope=self._settings.camara_service_scope,
            mock_key=None,
        )
        response = await self._client.request(ctx, json_payload=payload)
        messages = [
            MaaSChatMessage(
                role=msg.get("role", "assistant"),
                content=msg.get("content", ""),
                attachments=msg.get("attachments"),
            )
            for msg in response.get("messages", [])
        ]
        return MaaSQueryResult(messages=messages, metadata=response.get("metadata", {}))

    async def _ensure_remote_knowledge_base(self, config: MaaSAssistantConfig) -> str:
        existing = self._knowledge_base_ids.get(config.persona)
        if existing:
            return existing

        payload = {
            "name": f"{config.persona}-heritage-kb",
            "description": config.description
            or f"Curated cultural analytics corpus for {config.persona}.",
            "language": config.language,
            "documents": list(config.knowledge_base_documents),
        }

        ctx = CamaraRequestContext(
            method="POST",
            url=self._build_kb_url("/knowledge-bases"),
            scope=self._settings.camara_knowledge_base_scope,
            mock_key=None,
        )
        response = await self._client.request(ctx, json_payload=payload)
        kb_id = response.get("id")
        if not kb_id:
            raise RuntimeError("Knowledge base creation failed: missing id")
        self._knowledge_base_ids[config.persona] = kb_id
        return kb_id

    def _ensure_mock_assistant(self, config: MaaSAssistantConfig) -> str:
        assistant_id = self._assistant_ids.get(config.persona)
        if assistant_id:
            return assistant_id
        # In mock mode, fabricate deterministic IDs.
        assistant_id = f"mock-assistant-{config.persona}"
        self._assistant_ids[config.persona] = assistant_id
        self._knowledge_base_ids.setdefault(config.persona, f"mock-kb-{config.persona}")
        return assistant_id

    def _mock_query(
        self,
        persona: str,
        prompt: str,
        *,
        session_id: str,
        instructions: str,
        attachments: Sequence[dict[str, Any]] | None,
        context: Mapping[str, Any] | None,
    ) -> MaaSQueryResult:
        tone_lookup = {
            "priya": "empathetic",
            "jax": "enthusiastic",
            "lena": "scholarly",
            "mike": "operational",
        }
        tone = tone_lookup.get(persona.lower(), "insightful")
        intro = f"[Mock MaaS] {persona.title()} guide speaking with a {tone} tone."
        summary_bits = []
        if context:
            if attractions := context.get("attractions"):
                summary_bits.append(
                    f"{len(attractions)} spotlighted sites including "
                    f"{', '.join(a.get('name') for a in attractions[:2])}"
                )
            if density := context.get("density"):
                summary_bits.append(f"density index {density.get('forecastIndex', 'N/A')}")
            if weather := context.get("weather"):
                summary_bits.append(f"weather {weather.get('summary')}")
        if summary_bits:
            intro += " Context: " + "; ".join(summary_bits) + "."

        generated = f"{intro}\nPrompt understood: {prompt[:400]}"

        attachment_list = list(attachments or [])
        if context and context.get("arPreview"):
            attachment_list.append(context["arPreview"])

        messages = [
            MaaSChatMessage(role="assistant", content=generated, attachments=attachment_list or None),
            MaaSChatMessage(
                role="assistant",
                content=(
                    f"Proactive nudge for session {session_id}: consider the dawn slot to avoid peaks; "
                    "I'll keep monitoring density."
                ),
            ),
        ]
        return MaaSQueryResult(messages=messages, metadata={"mock": True, "instructions": instructions})

    def _build_kb_url(self, path: str) -> str:
        base = self._settings.camara_maas_base_url.rstrip("/")
        tenant = self._settings.camara_maas_tenant_id
        return f"{base}/tenants/{tenant}{path}"

    def _build_manage_url(self, path: str) -> str:
        return self._build_kb_url(f"/assistant-manage{path}")

    def _build_service_url(self, path: str) -> str:
        return self._build_kb_url(f"/assistant-service{path}")

