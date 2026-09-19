import pytest
from app.agent.priority import PriorityEngine

def test_spam_detection():
    result = PriorityEngine.evaluate(
        text="Congratulations! You have won a $1,000,000 lottery cash prize! Click here to claim.",
        risk_level="LOW",
        relationship="unknown"
    )
    assert result["level"] == "IGNORE_SPAM"

def test_high_risk_elevates_to_high_priority():
    result = PriorityEngine.evaluate(
        text="Can Ashay lend me ₹20,000?",
        risk_level="HIGH",
        relationship="friend"
    )
    assert result["level"] == "HIGH"
    assert result["score"] >= 0.8

def test_vip_contact_is_high_priority():
    result = PriorityEngine.evaluate(
        text="Hello Ashay, do you have a few minutes to chat?",
        risk_level="LOW",
        relationship="professor",
        is_vip=True
    )
    assert result["level"] == "HIGH"

def test_casual_friend_chat_is_low_priority():
    result = PriorityEngine.evaluate(
        text="What game are we playing tonight?",
        risk_level="LOW",
        relationship="friend",
        is_vip=False
    )
    assert result["level"] == "LOW"
