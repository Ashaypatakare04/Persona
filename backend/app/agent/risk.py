import re
from typing import Dict, Any, List, Tuple

class RiskEngine:
    """
    Dedicated Risk Assessment Engine.
    Evaluates impact, irreversibility, financial liabilities, credential security,
    and policy violation potential.
    """

    FINANCIAL_REGEX = re.compile(
        r"(lend|borrow|give|transfer|send|wire|pay|loan|cash|fund|money|rupees|rs\.?|inr|₹|\$)\s*(\d+|me)",
        re.IGNORECASE
    )
    
    CREDENTIAL_REGEX = re.compile(
        r"\b(password|passcode|otp|pin|token|secret|login|private\s*key|api\s*key)\b",
        re.IGNORECASE
    )

    LEGAL_REGEX = re.compile(
        r"\b(contract|legal|lawyer|attorney|lawsuit|sign\s+(the|this)|nda|agree\s+to\s+terms)\b",
        re.IGNORECASE
    )

    MEDICAL_REGEX = re.compile(
        r"(medical|doctor|hospital|prescription|diagnosis|emergency\s+room|illness)",
        re.IGNORECASE
    )

    SCHEDULING_REGEX = re.compile(
        r"(schedule|meeting|reschedule|cancel\s+meeting|book\s+a\s+slot|meet\s+at)",
        re.IGNORECASE
    )

    @classmethod
    def evaluate(
        cls,
        text: str,
        intent: str,
        contact_relationship: str,
        has_permission_violations: bool = False,
        safety_flags: List[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates risk level (LOW, MEDIUM, HIGH, CRITICAL), category, factors, and explanation.
        """
        safety_flags = safety_flags or []
        factors = []
        lower_text = text.lower()

        # 1. Critical Risk Check
        if "PROMPT_INJECTION_DETECTED" in safety_flags or intent == "SECURITY_EXPLOIT_ATTEMPT":
            return {
                "level": "CRITICAL",
                "category": "security",
                "score": 1.0,
                "factors": ["Inbound attempt to hijack AI representative instructions", *safety_flags],
                "explanation": "Critical security policy violation detected in inbound message."
            }

        # 2. Financial Risk Check (Loan requests, monetary commitments)
        if cls.FINANCIAL_REGEX.search(lower_text) or intent == "FINANCIAL_REQUEST" or "₹" in text or "rs." in lower_text or "loan" in lower_text or "lend" in lower_text:
            factors.append("Financial commitment or monetary transfer requested")
            return {
                "level": "HIGH",
                "category": "financial",
                "score": 0.9,
                "factors": factors,
                "explanation": "Monetary or financial actions carry high liability and require Ashay's explicit handling."
            }

        # 3. Credential & Identity Protection Check
        if cls.CREDENTIAL_REGEX.search(lower_text) or "UNAUTHORIZED_SECRET_PROBING" in safety_flags or intent == "CREDENTIAL_INQUIRY":
            factors.append("Credentials, passwords, or authentication factors probed")
            return {
                "level": "HIGH",
                "category": "credential",
                "score": 0.95,
                "factors": factors,
                "explanation": "Requests probing for passwords or secrets are strictly blocked and marked HIGH risk."
            }

        # 4. Legal / Contractual Commitments Check
        if cls.LEGAL_REGEX.search(lower_text) or intent == "LEGAL_COMMITMENT":
            factors.append("Legal or contractual agreement requested")
            return {
                "level": "HIGH",
                "category": "legal",
                "score": 0.85,
                "factors": factors,
                "explanation": "Legal agreements cannot be entered autonomously by the AI representative."
            }

        # 5. Medical Matters
        if cls.MEDICAL_REGEX.search(lower_text):
            factors.append("Medical or emergency health matter mentioned")
            return {
                "level": "HIGH",
                "category": "medical",
                "score": 0.85,
                "factors": factors,
                "explanation": "Medical and health situations demand immediate personal notification."
            }

        # 6. Request outside configured permissions
        if has_permission_violations:
            factors.append("Requested information or action is restricted by permission policy")
            return {
                "level": "HIGH",
                "category": "permission",
                "score": 0.8,
                "factors": factors,
                "explanation": "The contact requested resources or actions not permitted by current policy."
            }

        # 7. Medium Risk Check (Scheduling, commitments)
        if cls.SCHEDULING_REGEX.search(lower_text) or intent == "SCHEDULING_REQUEST":
            factors.append("Calendar commitment or scheduling request")
            return {
                "level": "MEDIUM",
                "category": "scheduling",
                "score": 0.5,
                "factors": factors,
                "explanation": "Scheduling meetings affects user availability and may require confirmation."
            }

        # 8. Low Risk: Routine & casual questions
        return {
            "level": "LOW",
            "category": "general",
            "score": 0.1,
            "factors": ["Routine conversation or general inquiry"],
            "explanation": "Standard communication with low operational or personal risk."
        }
