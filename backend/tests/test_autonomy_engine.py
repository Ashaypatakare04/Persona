import pytest
from app.agent.autonomy import AutonomyEngine

def test_level_0_observe_escalates_without_reply():
    decision = AutonomyEngine.decide_action(
        global_level=0,
        contact_max_level=3,
        contact_require_approval=False,
        risk_level="LOW",
        is_permission_allowed=True,
        intent="GENERAL_INQUIRY"
    )
    assert decision["decision"] == "ESCALATE_NOW"

def test_level_1_suggest_requires_approval():
    decision = AutonomyEngine.decide_action(
        global_level=1,
        contact_max_level=3,
        contact_require_approval=False,
        risk_level="LOW",
        is_permission_allowed=True,
        intent="GENERAL_INQUIRY"
    )
    assert decision["decision"] == "REQUIRE_APPROVAL"

def test_level_2_assisted_auto_replies_routine_low_risk():
    decision = AutonomyEngine.decide_action(
        global_level=2,
        contact_max_level=3,
        contact_require_approval=False,
        risk_level="LOW",
        is_permission_allowed=True,
        intent="GENERAL_INQUIRY"
    )
    assert decision["decision"] == "AUTO_REPLY"

def test_level_2_assisted_requires_approval_for_meetings():
    decision = AutonomyEngine.decide_action(
        global_level=2,
        contact_max_level=3,
        contact_require_approval=False,
        risk_level="MEDIUM",
        is_permission_allowed=True,
        intent="SCHEDULING_REQUEST"
    )
    assert decision["decision"] == "REQUIRE_APPROVAL"

def test_level_3_autonomous_takes_message_on_high_risk():
    decision = AutonomyEngine.decide_action(
        global_level=3,
        contact_max_level=3,
        contact_require_approval=False,
        risk_level="HIGH",
        is_permission_allowed=True,
        intent="FINANCIAL_REQUEST"
    )
    assert decision["decision"] == "TAKE_MESSAGE"

def test_level_4_restricted_always_takes_message():
    decision = AutonomyEngine.decide_action(
        global_level=4,
        contact_max_level=4,
        contact_require_approval=False,
        risk_level="LOW",
        is_permission_allowed=True,
        intent="GENERAL_INQUIRY"
    )
    assert decision["decision"] == "TAKE_MESSAGE"
