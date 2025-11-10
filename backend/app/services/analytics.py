from __future__ import annotations

import asyncio
import uuid
from dataclasses import asdict
from datetime import datetime
from typing import Any, Iterable, Mapping

from ..config import get_settings
from ..initial_data import load_yaml_attractions
from .camara import CamaraRequestContext, MaaSAssistantConfig, MaaSOrchestrator
from .persona import PersonaProfile, PersonaUser, find_persona, resolve_user_from_token


settings = get_settings()
_orchestrator = MaaSOrchestrator()
_cached_attractions: list[dict[str, Any]] | None = None


def _load_attractions(limit: int | None = None) -> list[dict[str, Any]]:
    global _cached_attractions
    if _cached_attractions is None:
        _cached_attractions = [attr.model_dump() for attr in load_yaml_attractions(settings.data_path)]
    if limit is None:
        return list(_cached_attractions)
    return list(_cached_attractions[:limit])


def _derive_session_id(context: Mapping[str, Any] | None) -> str:
    if not context:
        return uuid.uuid4().hex
    if sid := context.get("sessionId") or context.get("session_id"):
        return str(sid)
    return uuid.uuid4().hex


def _resolve_persona_profile(persona_key: str) -> PersonaProfile:
    persona = find_persona(persona_key) or find_persona("priya")
    if persona is None:
        raise ValueError("Default persona 'priya' must exist.")
    return persona


def _resolve_user(context: Mapping[str, Any] | None, persona: PersonaProfile) -> PersonaUser | None:
    if not context:
        return None
    auth_token = context.get("authToken") or context.get("auth_token")
    if isinstance(auth_token, str):
        user = resolve_user_from_token(auth_token)
        if user:
            return user

    # Allow direct persona override
    if user_info := context.get("user"):
        if isinstance(user_info, Mapping):
            return PersonaUser(
                user_id=str(user_info.get("user_id") or user_info.get("id") or uuid.uuid4().hex),
                name=str(user_info.get("name") or persona.display_name),
                persona=str(user_info.get("persona") or persona.key),
                language=str(user_info.get("language") or persona.default_language),
                traits=user_info.get("traits") or {},
            )
    return None


async def _fetch_density_snapshot() -> Mapping[str, Any] | None:
    ctx = CamaraRequestContext(
        method="POST",
        url=settings.camara_population_density_url,
        scope=settings.camara_density_scope,
        mock_key="populationDensity" if settings.camara_use_mock else None,
    )
    body = {
        "area": {
            "type": "Circle",
            "center": {"lat": -25.3444, "lon": 131.0369},
            "radiusMeters": 5000,
        },
        "timeRange": {"duration": {"amount": 2, "unit": "HOUR"}},
    }
    try:
        return await _orchestrator.client.request(ctx, json_payload=body)
    except Exception:
        return None


async def _fetch_location_snapshot(phone_number: str | None = None) -> Mapping[str, Any] | None:
    if phone_number is None:
        phone_number = "+61370000000"
    ctx = CamaraRequestContext(
        method="POST",
        url=settings.camara_location_retrieval_url,
        scope=settings.camara_location_scope,
        mock_key="locationRetrieval" if settings.camara_use_mock else None,
    )
    payload = {"phoneNumber": phone_number, "requestedAccuracy": {"horizontal": 500}}
    try:
        return await _orchestrator.client.request(ctx, json_payload=payload)
    except Exception:
        return None


def _build_ar_preview(persona: PersonaProfile) -> dict[str, Any]:
    preview_map = {
        "priya": {
            "type": "ar-preview",
            "title": "Uluru Dawn Family Preview",
            "media": "/assets/videos/TheGeologicOddity_Uluru_Australia.mp4",
            "cta": "View dawn overlay",
        },
        "jax": {
            "type": "ar-preview",
            "title": "MCG Ashes Replay",
            "media": "/assets/videos/Sir-Don-Bradman_100-Century_SCG_15-11-1947.mp4",
            "cta": "Launch sporting chronicle",
        },
        "lena": {
            "type": "ar-preview",
            "title": "Anangu Co-designed Overlay",
            "media": "/assets/images/Uluru_Australia.jpg",
            "cta": "Review cultural layers",
        },
        "mike": {
            "type": "ar-dashboard",
            "title": "Uluru Capacity Console",
            "media": "/assets/images/pattern-Uluru_Australia.png",
            "cta": "Open ops dashboard",
        },
        "amara": {
            "type": "ar-quest",
            "title": "Desert Stars Quest",
            "media": "/assets/images/Uluru_Australia.jpg",
            "cta": "Start scavenger hunt",
        },
        "kabir": {
            "type": "ar-companion",
            "title": "Waru the Gecko Buddy",
            "media": "/assets/images/pattern-MCG_Australia.png",
            "cta": "Summon AR buddy",
        },
    }
    return preview_map.get(
        persona.key,
        {
            "type": "ar-preview",
            "title": "Echoes Time-Weave Preview",
            "media": "/assets/videos/TheSydneyOperaHouse_BBC_Australia.mp4",
            "cta": "Preview AR overlay",
        },
    )


def _build_knowledge_documents(attractions: Iterable[Mapping[str, Any]], persona: PersonaProfile) -> list[dict[str, Any]]:
    documents = []
    for attraction in attractions:
        documents.append(
            {
                "id": attraction.get("id"),
                "title": attraction.get("name"),
                "type": "markdown",
                "content": (
                    f"# {attraction.get('name')}\n"
                    f"*City:* {attraction.get('city', 'N/A')}\n"
                    f"*Description:* {attraction.get('description', 'No description provided.')}\n"
                    f"*Persona lens:* {persona.tone}.\n"
                ),
            }
        )
    return documents


def _compose_context_payload(
    persona: PersonaProfile,
    user: PersonaUser | None,
    density: Mapping[str, Any] | None,
    location: Mapping[str, Any] | None,
) -> dict[str, Any]:
    attractions = _load_attractions(limit=6)
    ar_preview = _build_ar_preview(persona)
    context: dict[str, Any] = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "persona": asdict(persona),
        "attractions": attractions,
        "arPreview": ar_preview,
        "density": density,
        "location": location,
    }
    if user:
        context["user"] = asdict(user)
    return context


async def generate_response(
    persona_key: str,
    prompt: str,
    context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    persona = _resolve_persona_profile(persona_key)
    user = _resolve_user(context, persona)
    session_id = _derive_session_id(context)

    attractions = _load_attractions(limit=5)
    knowledge_documents = _build_knowledge_documents(attractions, persona)

    density_task = asyncio.create_task(_fetch_density_snapshot())
    location_task = asyncio.create_task(_fetch_location_snapshot())
    ar_preview = _build_ar_preview(persona)

    # Compose instructions and attachments
    instructions = (
        f"{persona.instructions}\n"
        "You are EchoBot, the Time-Weave analytics companion. "
        "Blend CAMARA density, location, telco QoS metadata with Echoes of Eternity site data. "
        "Respond with multimodal-ready markdown (use bullet points). "
        "Always propose a proactive nudge aligned to sustainability."
    )

    assistant_config = MaaSAssistantConfig(
        persona=persona.key,
        instructions=instructions,
        language=user.language if user else persona.default_language,
        knowledge_base_documents=knowledge_documents,
        tags=persona.hashtags,
    )

    await _orchestrator.ensure_assistant(assistant_config)

    density, location = await asyncio.gather(density_task, location_task)
    enriched_context = _compose_context_payload(persona, user, density, location)

    attachments = [
        {
            "type": "ar-preview",
            "title": ar_preview["title"],
            "media": ar_preview["media"],
            "cta": ar_preview["cta"],
        },
        {
            "type": "itinerary-graph",
            "title": "Crowd & Weather Fusion",
            "url": "/dashboard?view=analytics",
        },
    ]

    maas_result = await _orchestrator.query(
        persona=persona.key,
        prompt=prompt,
        session_id=session_id,
        instructions=instructions,
        attachments=attachments,
        context=enriched_context,
        language=user.language if user else persona.default_language,
    )

    def _to_response_msg(message: Mapping[str, Any]) -> dict[str, Any]:
        return {
            "role": message.get("role", "assistant"),
            "content": message.get("content", ""),
            "attachments": message.get("attachments"),
        }

    messages = [_to_response_msg({"role": "system", "content": f"Persona:{persona.key}"})]
    messages.append(_to_response_msg({"role": "user", "content": prompt}))
    messages.extend(_to_response_msg(asdict(m)) for m in maas_result.messages)

    if context:
        messages.append(
            {
                "role": "assistant",
                "content": "Context ingested for personalised analytics.",
                "attachments": [{"type": "context", "payload": context}],
            }
        )

    return {
        "messages": messages,
        "persona": persona.key,
        "metadata": {
            "sessionId": session_id,
            "user": asdict(user) if user else None,
            "maas": maas_result.metadata,
        },
    }