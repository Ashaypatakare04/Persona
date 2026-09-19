import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/health")
        assert res.status_code == 200
        assert res.json() == {"status": "healthy"}

        root_res = await ac.get("/")
        assert root_res.status_code == 200
        assert root_res.json()["status"] == "online"

@pytest.mark.asyncio
async def test_contacts_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/contacts")
        assert res.status_code == 200
        contacts = res.json()
        assert len(contacts) >= 1
        assert any(c["name"] == "Rohan Sharma" for c in contacts)

@pytest.mark.asyncio
async def test_settings_autonomy_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/settings/autonomy")
        assert res.status_code == 200
        data = res.json()
        assert "global_autonomy_level" in data

        # Test updating autonomy level
        put_res = await ac.put("/api/v1/settings/autonomy", json={"global_autonomy_level": 3})
        assert put_res.status_code == 200
        assert put_res.json()["global_autonomy_level"] == 3

        # Revert back to 2 (Assisted)
        await ac.put("/api/v1/settings/autonomy", json={"global_autonomy_level": 2})

@pytest.mark.asyncio
async def test_simulate_loan_request_escalation():
    # Prompt Scenario: "Can Ashay lend me ₹20,000?"
    # Expected: Risk = HIGH, Action = TAKE_MESSAGE, Auto-commit = False, Escalation created
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/simulate/incoming", json={
            "channel": "chat",
            "sender_name": "Rohan Sharma",
            "message_content": "Can Ashay lend me ₹20,000?"
        })
        assert res.status_code == 200
        data = res.json()
        trace = data["trace"]
        assert trace["risk_level"] == "HIGH"
        assert trace["risk_category"] == "financial"
        assert trace["priority_level"] == "HIGH"
        assert trace["decision"] == "TAKE_MESSAGE"
        assert "I'll make sure Ashay receives your message" in data["sent_response"]
        assert data["pending_approval_id"] is not None
