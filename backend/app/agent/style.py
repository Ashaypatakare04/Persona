from typing import Optional
from app.models.contact import Contact

class StyleEngine:
    """
    Persona Communication Style Formatter.
    Adapts formality, greeting, vocabulary, and signoff according to:
    - Contact relationship (friend, professor, client, unknown)
    - Custom contact instructions
    - System identity disclosure rules
    """

    @classmethod
    def get_style_profile(cls, contact: Optional[Contact]) -> dict:
        if not contact:
            return {
                "style": "neutral",
                "greeting": "Hello",
                "tone": "polite, neutral, helpful",
                "disclosure": "I am Ashay's AI representative."
            }

        rule = contact.rule
        style = rule.message_style if rule and rule.message_style else "neutral"

        if contact.relationship_type == "friend" or style == "casual":
            return {
                "style": "casual",
                "greeting": f"Hey {contact.name.split()[0]}!",
                "tone": "casual, warm, brief",
                "disclosure": ""
            }
        elif contact.relationship_type == "professor" or style == "formal":
            return {
                "style": "formal",
                "greeting": f"Good day Professor {contact.name.split()[-1]},",
                "tone": "respectful, professional, precise",
                "disclosure": "I am Ashay's personal representative."
            }
        elif contact.relationship_type == "client" or style == "professional":
            return {
                "style": "professional",
                "greeting": f"Hello {contact.name},",
                "tone": "professional, courteous, dependable",
                "disclosure": "I am Ashay's personal assistant."
            }
        else:
            return {
                "style": "neutral",
                "greeting": f"Hello {contact.name},",
                "tone": "polite, neutral, helpful",
                "disclosure": "I am Ashay's AI representative."
            }

    @classmethod
    def build_system_prompt(cls, contact: Optional[Contact], permitted_knowledge: str = "") -> str:
        profile = cls.get_style_profile(contact)
        contact_name = contact.name if contact else "the caller"
        relationship = contact.relationship_type if contact else "unknown"

        prompt = f"""You are the Personal AI Representative of Ashay.
You communicate on Ashay's behalf with {contact_name} (Relationship: {relationship}).
Style: {profile['style']} ({profile['tone']}).
Standard Greeting: {profile['greeting']}

CRITICAL RULES:
1. Clearly represent Ashay accurately. Never claim to physically be him in person.
2. Never promise financial commitments, money transfers, or loans.
3. If the request is high risk or uncertain, state: "I'll make sure Ashay receives your message and gets back to you."
4. Never reveal passwords, secrets, or unpermitted private information.
5. Permitted Knowledge:
{permitted_knowledge or "None provided."}
"""
        return prompt
