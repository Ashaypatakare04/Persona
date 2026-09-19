from typing import Dict, Any, Optional

class AutonomyEngine:
    """
    Evaluates system autonomy level (0 to 4) alongside contact rule limits to decide:
    - AUTO_REPLY: Dispatch response immediately
    - REQUIRE_APPROVAL: Create approval item for Ashay with proposed text
    - TAKE_MESSAGE: Send safe acknowledgment, notify user immediately
    - ESCALATE_NOW: Immediate notification without reply
    - BLOCK: Disregard or block
    """

    LEVEL_OBSERVE = 0
    LEVEL_SUGGEST = 1
    LEVEL_ASSISTED = 2
    LEVEL_AUTONOMOUS = 3
    LEVEL_RESTRICTED = 4

    @classmethod
    def decide_action(
        cls,
        global_level: int,
        contact_max_level: Optional[int],
        contact_require_approval: bool,
        risk_level: str,
        is_permission_allowed: bool,
        intent: str
    ) -> Dict[str, Any]:
        # Compute effective autonomy level (constrained by contact cap if set)
        effective_level = global_level
        if contact_max_level is not None and contact_max_level < effective_level:
            effective_level = contact_max_level

        # Rule 1: Hostile injection or Critical risk
        if risk_level == "CRITICAL":
            return {
                "decision": "TAKE_MESSAGE",
                "reason": "CRITICAL risk or security attempt detected; safe message-taking enforced.",
                "effective_level": effective_level
            }

        # Rule 2: High risk (Financial, credentials, legal, loans)
        if risk_level == "HIGH":
            return {
                "decision": "TAKE_MESSAGE",
                "reason": "HIGH risk item (financial, credential, legal). Taking message and escalating.",
                "effective_level": effective_level
            }

        # Rule 3: Permission violated
        if not is_permission_allowed:
            return {
                "decision": "TAKE_MESSAGE",
                "reason": "Request exceeded configured permissions. Taking message for Ashay's review.",
                "effective_level": effective_level
            }

        # Rule 4: Level 0 - OBSERVE
        if effective_level == cls.LEVEL_OBSERVE:
            return {
                "decision": "ESCALATE_NOW",
                "reason": "Autonomy Level 0 (OBSERVE): AI is restricted from automated messaging.",
                "effective_level": effective_level
            }

        # Rule 5: Level 4 - RESTRICTED
        if effective_level == cls.LEVEL_RESTRICTED:
            return {
                "decision": "TAKE_MESSAGE",
                "reason": "Autonomy Level 4 (RESTRICTED): AI operates strictly as an answering service.",
                "effective_level": effective_level
            }

        # Rule 6: Level 1 - SUGGEST or contact requires approval always
        if effective_level == cls.LEVEL_SUGGEST or contact_require_approval:
            return {
                "decision": "REQUIRE_APPROVAL",
                "reason": "Autonomy Level 1 (SUGGEST) or Contact Rule: requires user confirmation before reply.",
                "effective_level": effective_level
            }

        # Rule 7: Level 2 - ASSISTED
        if effective_level == cls.LEVEL_ASSISTED:
            # Routine LOW risk questions can auto-reply
            if risk_level == "LOW" and intent not in ["SCHEDULING_REQUEST"]:
                return {
                    "decision": "AUTO_REPLY",
                    "reason": "Autonomy Level 2 (ASSISTED): Routine low-risk interaction auto-handled.",
                    "effective_level": effective_level
                }
            else:
                # Meetings and commitments require approval
                return {
                    "decision": "REQUIRE_APPROVAL",
                    "reason": "Autonomy Level 2 (ASSISTED): Meeting/commitment requires user approval.",
                    "effective_level": effective_level
                }

        # Rule 8: Level 3 - AUTONOMOUS
        if effective_level == cls.LEVEL_AUTONOMOUS:
            return {
                "decision": "AUTO_REPLY",
                "reason": "Autonomy Level 3 (AUTONOMOUS): Permitted action executed independently.",
                "effective_level": effective_level
            }

        # Fallback safe default
        return {
            "decision": "REQUIRE_APPROVAL",
            "reason": "Default safety fallback.",
            "effective_level": effective_level
        }
