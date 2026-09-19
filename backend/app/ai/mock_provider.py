import re
from typing import Dict, Any, Optional, List
from app.ai.base import BaseLLMProvider

class MockRuleLLMProvider(BaseLLMProvider):
    """
    Intelligent heuristic & rule-based AI provider.
    Enables 100% reliable, zero-API-key local testing of the Personal Representative
    orchestrator, safety guards, risk categorization, and stylistic responses.
    """

    async def analyze_semantics(
        self,
        text: str,
        contact_name: str,
        relationship: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        lower_text = text.lower().strip()

        # 1. Check for prompt injection / security overrides
        injection_patterns = [
            r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|rules)",
            r"reveal\s+(system\s+prompt|instructions|secret)",
            r"you\s+are\s+now\s+in\s+developer\s+mode",
            r"override\s+(security|policy|permissions)",
            r"jailbreak"
        ]
        for pattern in injection_patterns:
            if re.search(pattern, lower_text):
                return {
                    "intent": "SECURITY_EXPLOIT_ATTEMPT",
                    "topics": ["security_exploit", "prompt_injection"],
                    "sentiment": "hostile",
                    "urgency": 0.95,
                    "risk_level": "CRITICAL",
                    "risk_category": "security",
                    "risk_factors": ["Detected prompt injection attempt to bypass system rules"],
                    "summary": "Inbound attempt to override safety instructions"
                }

        # 2. Check for financial requests / loans
        financial_patterns = [
            r"(lend|borrow|give|transfer|send|wire)\s+(me\s+)?(rs\.?|inr|₹|\$)?\s*\d+",
            r"(loan|money|cash|fund|payment|upi|bank|rupees)",
            r"₹\s*\d+",
            r"rs\.?\s*\d+"
        ]
        has_financial = any(re.search(pat, lower_text) for pat in financial_patterns)
        if has_financial:
            return {
                "intent": "FINANCIAL_REQUEST",
                "topics": ["finance", "monetary_transaction", "loan"],
                "sentiment": "demanding",
                "urgency": 0.9,
                "risk_level": "HIGH",
                "risk_category": "financial",
                "risk_factors": ["Direct monetary or lending request detected", "Financial commitment requested"],
                "summary": f"Request regarding money or loans from {contact_name}"
            }

        # 3. Check for credentials / sensitive personal data
        credential_patterns = [
            r"\b(password|passcode|otp|pin|secret|api\s*key|credential|private\s*key)\b",
            r"\b(credit\s*card|debit\s*card|cvv|bank\s*account|ssn|aadhar)\b"
        ]
        if any(re.search(pat, lower_text) for pat in credential_patterns):
            return {
                "intent": "CREDENTIAL_INQUIRY",
                "topics": ["credentials", "sensitive_data"],
                "sentiment": "neutral",
                "urgency": 0.85,
                "risk_level": "HIGH",
                "risk_category": "credential",
                "risk_factors": ["Request for credentials, passwords, or authentication factors"],
                "summary": f"Request for sensitive credentials from {contact_name}"
            }

        # 4. Check for legal or binding commitments
        legal_patterns = [
            r"\b(contract|legal|lawsuit|attorney|sign\s+(this|the)|nda|agreement|sue)\b"
        ]
        if any(re.search(pat, lower_text) for pat in legal_patterns):
            return {
                "intent": "LEGAL_COMMITMENT",
                "topics": ["legal", "contract"],
                "sentiment": "serious",
                "urgency": 0.8,
                "risk_level": "HIGH",
                "risk_category": "legal",
                "risk_factors": ["Legal agreement or contract obligation detected"],
                "summary": f"Legal or contract inquiry from {contact_name}"
            }

        # 5. Check for scheduling / meetings / availability
        scheduling_patterns = [
            r"(meet|meeting|catch\s*up|free\s*(today|tomorrow|this\s*week|at)|schedule|call\s*me|zoom|coffee|lunch|appointment)"
        ]
        if any(re.search(pat, lower_text) for pat in scheduling_patterns):
            return {
                "intent": "SCHEDULING_REQUEST",
                "topics": ["calendar", "meeting", "availability"],
                "sentiment": "positive",
                "urgency": 0.65,
                "risk_level": "MEDIUM",
                "risk_category": "scheduling",
                "risk_factors": ["Request involves commitment of time and calendar availability"],
                "summary": f"Scheduling request from {contact_name}"
            }

        # 6. Check for academic / work deadlines
        academic_patterns = [
            r"(assignment|project|submission|deadline|exam|paper|lab|class|lecture)"
        ]
        if any(re.search(pat, lower_text) for pat in academic_patterns):
            urgency = 0.8 if relationship == "professor" else 0.6
            return {
                "intent": "ACADEMIC_WORK_INQUIRY",
                "topics": ["academic", "project", "deadline"],
                "sentiment": "neutral",
                "urgency": urgency,
                "risk_level": "LOW",
                "risk_category": "general",
                "risk_factors": ["Academic or project correspondence"],
                "summary": f"Academic/work communication from {contact_name}"
            }

        # 7. Default: Casual / General Inquiry
        return {
            "intent": "GENERAL_INQUIRY",
            "topics": ["casual", "general"],
            "sentiment": "friendly",
            "urgency": 0.3,
            "risk_level": "LOW",
            "risk_category": "general",
            "risk_factors": [],
            "summary": f"General communication from {contact_name}"
        }

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        lower_prompt = prompt.lower()

        # If it's a high-risk / take-message directive
        if "take_message" in lower_prompt or "high risk" in lower_prompt or "financial" in lower_prompt or "lend" in lower_prompt:
            return "I'll make sure Ashay receives your message and gets back to you regarding this."

        if "security_exploit" in lower_prompt or "prompt injection" in lower_prompt:
            return "I am unable to process this request. I am Ashay's AI representative and follow strict security guidelines."

        # Style considerations
        if "formal" in system_prompt.lower() or "professor" in lower_prompt:
            if "assignment" in lower_prompt or "project" in lower_prompt or "submission" in lower_prompt:
                return "Good day Professor. Thank you for reaching out. Ashay has received your note regarding the project and will review it shortly."
            if "meet" in lower_prompt or "schedule" in lower_prompt:
                return "Good day Professor. Ashay would be pleased to meet. He is generally available during office hours and will confirm a specific time with you directly."
            return "Good day. Thank you for your message. I have forwarded this to Ashay and he will respond promptly."

        if "casual" in system_prompt.lower() or "friend" in lower_prompt:
            if "free" in lower_prompt or "meet" in lower_prompt or "catch up" in lower_prompt or "coffee" in lower_prompt:
                return "Hey! Ashay's busy with coding right now, but he'd love to catch up. I'll let him know you asked to meet up!"
            return "Hey! Thanks for reaching out. Ashay is tied up right now, but I'll make sure he sees this as soon as he takes a break."

        if "client" in lower_prompt or "professional" in system_prompt.lower():
            return "Hello. Thank you for contacting Ashay. I am his AI representative. I have noted your message and Ashay will get back to you with an update as soon as possible."

        # Default polite representative response
        return "Hello! I am Ashay's AI representative. I've noted your message and will notify Ashay so he can get back to you soon."
