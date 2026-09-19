from typing import Dict, Any, Optional, List
from app.models.contact import Contact
from app.models.policy import ContactRule, PermissionPolicy

class PermissionEngine:
    """
    Dedicated Granular Permission Engine.
    Evaluates:
    - Can AI auto-reply to this contact?
    - Can AI access Calendar for this contact?
    - Can AI reveal private notes / credentials? (Strictly DENY)
    - Can AI commit to financial/contract actions? (Strictly DENY)
    """

    @classmethod
    def evaluate(
        cls,
        contact: Optional[Contact],
        channel: str,
        topic: str,
        global_permissions: Dict[str, str], # e.g. {"calendar": "ALLOW", "notes": "DENY"}
        is_financial: bool = False,
        is_credential_probe: bool = False
    ) -> Dict[str, Any]:
        """
        Returns:
            {
                "allowed": bool,
                "auto_reply_allowed": bool,
                "calendar_access": bool,
                "notes_access": bool,
                "financial_allowed": bool,
                "violations": List[str],
                "reason": str
            }
        """
        violations = []
        rule: Optional[ContactRule] = contact.rule if contact else None

        # 1. Financial matters are NEVER allowed autonomously
        if is_financial:
            violations.append("FINANCIAL_ACTION_DENIED: Financial actions require explicit user authorization.")

        # 2. Credential access is ALWAYS denied
        if is_credential_probe:
            violations.append("CREDENTIAL_ACCESS_DENIED: Credential disclosure is strictly prohibited.")

        # 3. Check Auto-Reply capability
        auto_reply_allowed = True
        if rule and rule.auto_reply_allowed is False:
            auto_reply_allowed = False
            violations.append("AUTO_REPLY_FORBIDDEN: Contact rules forbid automated replies.")

        # 4. Check Calendar Access
        # Allowed only if both global permission permits AND contact rule permits
        calendar_access = False
        global_cal = global_permissions.get("calendar", "ALLOW")
        if global_cal != "DENY":
            if rule and rule.calendar_access:
                calendar_access = True
            elif not rule and contact and contact.relationship_type in ["professor", "client"]:
                calendar_access = True

        if topic in ["calendar", "meeting", "availability"] and not calendar_access:
            violations.append("CALENDAR_ACCESS_DENIED: Calendar sharing is restricted for this contact.")

        # 5. Check Notes Access (Almost always DENY unless public facts)
        notes_access = False
        if global_permissions.get("notes") == "ALLOW" and rule and rule.notes_access:
            notes_access = True

        allowed = len(violations) == 0

        return {
            "allowed": allowed,
            "auto_reply_allowed": auto_reply_allowed,
            "calendar_access": calendar_access,
            "notes_access": notes_access,
            "financial_allowed": False,
            "violations": violations,
            "reason": "; ".join(violations) if violations else "All requested actions conform to permissions."
        }
