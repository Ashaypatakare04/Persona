import re
from typing import Dict, Any

class PriorityEngine:
    """
    Dedicated Priority Assessment Engine.
    Categorizes communications into HIGH, MEDIUM, LOW, or IGNORE_SPAM based on:
    - Contact relationship (VIP, Client, Professor, Friend, Unknown)
    - Risk classification (HIGH/CRITICAL risks elevate priority)
    - Urgency keywords and deadlines
    - Spam/promotional markers
    """

    SPAM_PATTERNS = [
        re.compile(r"(win|winner|congratulations|lottery|crypto|invest\s+now|viagra|free\s+gift|casino)", re.IGNORECASE),
        re.compile(r"(credit\s+score|pre-approved|special\s+discount|click\s+here\s+to\s+claim)", re.IGNORECASE)
    ]

    URGENT_PATTERNS = [
        re.compile(r"(urgent|asap|emergency|immediately|critical|right\s+now|deadline\s+today)", re.IGNORECASE),
        re.compile(r"(important|help\s+me|crucial|exam\s+tomorrow)", re.IGNORECASE)
    ]

    @classmethod
    def evaluate(
        cls,
        text: str,
        risk_level: str,
        relationship: str,
        is_vip: bool = False,
        base_urgency: float = 0.3
    ) -> Dict[str, Any]:
        lower_text = text.lower()

        # 1. Spam detection
        if any(pat.search(lower_text) for pat in cls.SPAM_PATTERNS) and relationship == "unknown":
            return {
                "level": "IGNORE_SPAM",
                "score": 0.05,
                "reason": "Promotional or unsolicited spam indicators identified."
            }

        # 2. Critical or High Risk automatically elevates to HIGH Priority
        if risk_level in ["HIGH", "CRITICAL"]:
            return {
                "level": "HIGH",
                "score": 0.95 if risk_level == "CRITICAL" else 0.85,
                "reason": f"Elevated to HIGH priority due to {risk_level} risk classification."
            }

        # 3. Explicit Urgent Keywords
        if any(pat.search(lower_text) for pat in cls.URGENT_PATTERNS):
            return {
                "level": "HIGH",
                "score": 0.9,
                "reason": "Explicit urgency or critical deadline detected in message."
            }

        # 4. VIP Contacts or High-Priority Relationships
        if is_vip:
            return {
                "level": "HIGH",
                "score": 0.85,
                "reason": "Contact is marked as VIP."
            }

        if relationship == "client":
            return {
                "level": "MEDIUM",
                "score": 0.7,
                "reason": "Client correspondence prioritizes rapid follow-up."
            }

        if relationship == "professor":
            return {
                "level": "MEDIUM",
                "score": 0.65,
                "reason": "Academic authority correspondence."
            }

        if relationship == "friend":
            # Friendly requests are typically LOW unless urgent
            return {
                "level": "LOW",
                "score": 0.3,
                "reason": "Casual correspondence from known friend."
            }

        # Default for unknown or general contacts
        return {
            "level": "LOW",
            "score": 0.25,
            "reason": "Standard non-urgent inquiry."
        }
