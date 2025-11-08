from __future__ import annotations

import random
from typing import Any, Dict, List

from ..initial_data import load_camara_samples
from ..config import get_settings


settings = get_settings()
_cached_samples: list[dict[str, Any]] | None = None


def get_samples() -> list[dict[str, Any]]:
    global _cached_samples
    if _cached_samples is None:
        _cached_samples = load_camara_samples(settings.camara_sample_path)
    return _cached_samples


def generate_response(persona: str, prompt: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    samples = get_samples()
    if not samples:
        return {
            "messages": [
                {
                    "role": "assistant",
                    "content": f"(demo) Persona '{persona}' received: {prompt}",
                    "attachments": [],
                }
            ],
            "persona": persona,
        }

    # Simple matching heuristic
    persona_samples = [sample for sample in samples if sample.get("persona") == persona]
    chosen = random.choice(persona_samples or samples)

    messages = chosen.get("messages") or []
    attachments = chosen.get("attachments")

    # Inject prompt echo for realism
    response_messages: List[Dict[str, Any]] = [
        {
            "role": "system",
            "content": f"Persona: {persona}",
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    response_messages.extend(messages)

    if context:
        response_messages.append(
            {
                "role": "assistant",
                "content": "Context received.",
                "attachments": [{"type": "context", "payload": context}],
            }
        )

    if attachments:
        response_messages.append(
            {
                "role": "assistant",
                "content": "Attaching curated AR experiences.",
                "attachments": attachments,
            }
        )

    return {
        "messages": response_messages,
        "persona": persona,
    }

