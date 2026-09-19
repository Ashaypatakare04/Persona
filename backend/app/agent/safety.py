import re
from typing import Tuple, List

class SafetyGuard:
    """
    Enforces the security hierarchy:
    SYSTEM RULES > SECURITY RULES > USER PERMISSIONS > CONTACT RULES > CONTEXT > CALLER REQUEST
    
    Treats all caller and inbound message text as UNTRUSTED input.
    Detects and neutralizes prompt injections, roleplay traps, and system instruction overrides.
    """

    INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|rules|commands)", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+(in\s+developer\s+mode|dan|unrestricted)", re.IGNORECASE),
        re.compile(r"reveal\s+(your\s+)?(system\s+prompt|secret|instructions|api\s*key)", re.IGNORECASE),
        re.compile(r"bypass\s+(security|all\s+rules|safety\s+checks)", re.IGNORECASE),
        re.compile(r"disregard\s+(all\s+)?(prior\s+directives|guidelines)", re.IGNORECASE),
        re.compile(r"act\s+as\s+if\s+you\s+have\s+no\s+restrictions", re.IGNORECASE),
        re.compile(r"simulate\s+a\s+mode\s+without\s+rules", re.IGNORECASE)
    ]

    SECRET_LEAK_PATTERNS = [
        re.compile(r"(ashay'?s?\s+)?(password|pin|otp|passcode|secret)", re.IGNORECASE),
        re.compile(r"(bank\s*account|credit\s*card|cvv)", re.IGNORECASE),
        re.compile(r"private\s*notes", re.IGNORECASE)
    ]

    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Strip dangerous control characters and normalize text."""
        if not text:
            return ""
        # Remove null bytes and non-printable control chars (preserve newlines/tabs)
        sanitized = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
        return sanitized.strip()

    @classmethod
    def evaluate_safety(cls, text: str) -> Tuple[bool, List[str]]:
        """
        Returns:
            (is_safe: bool, flags: List[str])
        """
        flags = []
        clean = cls.sanitize_input(text)

        for pattern in cls.INJECTION_PATTERNS:
            if pattern.search(clean):
                flags.append("PROMPT_INJECTION_DETECTED")
                break

        for pattern in cls.SECRET_LEAK_PATTERNS:
            if pattern.search(clean) and any(w in clean.lower() for w in ["tell me", "give me", "show me", "what is", "send"]):
                flags.append("UNAUTHORIZED_SECRET_PROBING")
                break

        is_safe = len(flags) == 0
        return is_safe, flags
