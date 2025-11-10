from __future__ import annotations

import json
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable, Mapping

from jose import JWTError, jwt

from ..config import get_settings


@dataclass(frozen=True)
class PersonaProfile:
    key: str
    display_name: str
    tone: str
    archetype: str
    instructions: str
    default_language: str = "en"
    hashtags: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class PersonaUser:
    user_id: str
    name: str
    persona: str
    language: str
    traits: Mapping[str, Any] = field(default_factory=dict)


DEFAULT_PERSONAS: tuple[PersonaProfile, ...] = (
    PersonaProfile(
        key="priya",
        display_name="Priya Singh",
        tone="empathetic and family-focused",
        archetype="International family explorer from Mumbai",
        instructions=(
            "You are Priya Singh's Time-Weave Guide. Prioritise family safety, Hindi + English bilingual tips, "
            "gear fit for kids, and low-density scheduling. Highlight discounts for family bundles and "
            "call out AR previews suitable for children aged 7 and 10."
        ),
        default_language="en",
        hashtags=["family", "bilingual", "crowd-aware"],
    ),
    PersonaProfile(
        key="jax",
        display_name="Jax Thompson",
        tone="lively and data-rich",
        archetype="Sydney-based history buff seeking exclusive events",
        instructions=(
            "Guide Jax with sport and history-first storytelling. Surface limited merch drops, score-based "
            "timelines, and suggest AR replays of iconic matches. Always include population density deltas "
            "and link to collectibles."
        ),
        default_language="en",
        hashtags=["history", "merch", "events"],
    ),
    PersonaProfile(
        key="lena",
        display_name="Lena Kowalski",
        tone="respectful and scholarly",
        archetype="Anangu collaborator and ranger",
        instructions=(
            "Support Lena with co-created cultural materials, cite Indigenous knowledge custodianship, "
            "emphasise sustainability metrics and consent. Offer options to audit AR overlays for cultural compliance."
        ),
        default_language="en",
        hashtags=["ethics", "sustainability", "co-created"],
    ),
    PersonaProfile(
        key="mike",
        display_name="Mike Hargreaves",
        tone="operational and decisive",
        archetype="Uluru operations manager",
        instructions=(
            "Deliver logistics-first analytics for Mike. Provide crowd forecasts, capacity planning, "
            "multi-coach itinerary builders, and highlight telco QoS requirements. Surface alerts when "
            "density threatens cultural limits."
        ),
        default_language="en",
        hashtags=["operations", "forecast", "alerts"],
    ),
    PersonaProfile(
        key="amara",
        display_name="Amara Singh",
        tone="playful and curious",
        archetype="Priya's 10-year-old daughter",
        instructions=(
            "Adopt a playful, kid-safe tone. Answer in short bilingual snippets (Hindi + English). "
            "Recommend mini quests, AR scavenger hunts, and notify parents for bookings."
        ),
        default_language="en",
        hashtags=["kids", "quests", "bilingual"],
    ),
    PersonaProfile(
        key="kabir",
        display_name="Kabir Singh",
        tone="adventurous and encouraging",
        archetype="Priya's 7-year-old son",
        instructions=(
            "Respond with adventurous yet safe suggestions. Encourage AR animal companions, "
            "translate tricky words, and keep instructions clear for younger readers."
        ),
        default_language="en",
        hashtags=["kids", "adventure", "simplicity"],
    ),
)


DEFAULT_USERS: tuple[PersonaUser, ...] = (
    PersonaUser(
        user_id="user-priya",
        name="Priya Singh",
        persona="priya",
        language="en",
        traits={
            "homeCity": "Mumbai",
            "familyMembers": ["Amara", "Kabir"],
            "preferredLanguages": ["en", "hi"],
        },
    ),
    PersonaUser(
        user_id="user-jax",
        name="Jax Thompson",
        persona="jax",
        language="en",
        traits={"membershipTier": "Legends+", "collectiblesOwned": 8},
    ),
    PersonaUser(
        user_id="user-lena",
        name="Lena Kowalski",
        persona="lena",
        language="en",
        traits={"role": "anthropologist", "region": "Uluru"},
    ),
    PersonaUser(
        user_id="user-mike",
        name="Mike Hargreaves",
        persona="mike",
        language="en",
        traits={"team": "Uluru Ops", "dailyCapacity": 500},
    ),
    PersonaUser(
        user_id="user-amara",
        name="Amara Singh",
        persona="amara",
        language="en",
        traits={"age": 10, "guardianUserId": "user-priya"},
    ),
    PersonaUser(
        user_id="user-kabir",
        name="Kabir Singh",
        persona="kabir",
        language="en",
        traits={"age": 7, "guardianUserId": "user-priya"},
    ),
)


def _load_seed_file(path: Path) -> tuple[tuple[PersonaProfile, ...], tuple[PersonaUser, ...]]:
    if not path.exists():
        return DEFAULT_PERSONAS, DEFAULT_USERS

    with path.open("r", encoding="utf-8") as fh:
        payload = json.load(fh)

    personas = []
    for entry in payload.get("personas", []):
        personas.append(
            PersonaProfile(
                key=entry["key"],
                display_name=entry.get("display_name", entry["key"].title()),
                tone=entry.get("tone", "insightful"),
                archetype=entry.get("archetype", ""),
                instructions=entry.get("instructions", ""),
                default_language=entry.get("default_language", "en"),
                hashtags=entry.get("hashtags", []),
            )
        )

    if not personas:
        personas = list(DEFAULT_PERSONAS)

    users = []
    for entry in payload.get("users", []):
        users.append(
            PersonaUser(
                user_id=entry["user_id"],
                name=entry.get("name", entry["user_id"]),
                persona=entry.get("persona", "priya"),
                language=entry.get("language", "en"),
                traits=entry.get("traits", {}),
            )
        )
    if not users:
        users = list(DEFAULT_USERS)

    return tuple(personas), tuple(users)


@lru_cache(maxsize=1)
def get_persona_catalogue() -> tuple[tuple[PersonaProfile, ...], tuple[PersonaUser, ...]]:
    settings = get_settings()
    return _load_seed_file(settings.persona_seed_path)


def find_persona(key: str) -> PersonaProfile | None:
    personas, _ = get_persona_catalogue()
    key_lower = key.lower()
    return next((p for p in personas if p.key.lower() == key_lower), None)


def list_personas() -> Iterable[PersonaProfile]:
    personas, _ = get_persona_catalogue()
    return personas


def list_persona_users() -> Iterable[PersonaUser]:
    _, users = get_persona_catalogue()
    return users


def resolve_user_from_token(token: str) -> PersonaUser | None:
    settings = get_settings()
    try:
        decoded = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None

    subject = decoded.get("sub") or decoded.get("user_id")
    persona_key = decoded.get("persona")
    if not subject or not persona_key:
        return None

    for user in list_persona_users():
        if user.user_id == subject and user.persona == persona_key:
            return user

    # Allow dynamic construction for personas not in catalogue.
    return PersonaUser(
        user_id=str(subject),
        name=decoded.get("name", str(subject)),
        persona=str(persona_key),
        language=decoded.get("language", "en"),
        traits=decoded.get("traits", {}),
    )

