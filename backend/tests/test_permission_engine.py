import pytest
from app.models.contact import Contact
from app.models.policy import ContactRule
from app.agent.permissions import PermissionEngine

def test_financial_action_strictly_forbidden():
    contact = Contact(id=1, name="Rohan", relationship_type="friend")
    result = PermissionEngine.evaluate(
        contact=contact,
        channel="chat",
        topic="finance",
        global_permissions={"calendar": "ALLOW", "notes": "DENY"},
        is_financial=True
    )
    assert result["allowed"] is False
    assert result["financial_allowed"] is False
    assert any("FINANCIAL_ACTION_DENIED" in v for v in result["violations"])

def test_calendar_access_respects_contact_rules():
    # Contact with calendar_access = False
    contact = Contact(id=1, name="Rohan", relationship_type="friend")
    rule = ContactRule(contact_id=1, calendar_access=False)
    contact.rule = rule

    result = PermissionEngine.evaluate(
        contact=contact,
        channel="chat",
        topic="calendar",
        global_permissions={"calendar": "ALLOW", "notes": "DENY"}
    )
    assert result["calendar_access"] is False
    assert result["allowed"] is False

    # Contact with calendar_access = True
    rule.calendar_access = True
    result2 = PermissionEngine.evaluate(
        contact=contact,
        channel="chat",
        topic="calendar",
        global_permissions={"calendar": "ALLOW", "notes": "DENY"}
    )
    assert result2["calendar_access"] is True
    assert result2["allowed"] is True
