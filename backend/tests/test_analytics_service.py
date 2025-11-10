import pytest

from app.services.analytics import generate_response


@pytest.mark.asyncio
async def test_generate_response_returns_messages():
    result = await generate_response("priya", "Plan my Uluru dawn visit", {"sessionId": "test-session"})

    assert result["persona"] == "priya"
    assert isinstance(result["messages"], list)
    assert result["messages"], "Expected non-empty messages"
    assert result["metadata"]["sessionId"]
    assert result["metadata"]["maas"]["mock"] is True

