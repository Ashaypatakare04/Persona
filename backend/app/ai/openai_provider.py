import json
import logging
from typing import Dict, Any, Optional, List
import httpx
from app.ai.base import BaseLLMProvider
from app.ai.mock_provider import MockRuleLLMProvider

logger = logging.getLogger(__name__)

class OpenAILLMProvider(BaseLLMProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4o-mini",
        base_url: str = "https://api.openai.com/v1"
    ):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.fallback = MockRuleLLMProvider()

    async def analyze_semantics(
        self,
        text: str,
        contact_name: str,
        relationship: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.analyze_semantics(text, contact_name, relationship, history)

        system_msg = (
            "You are a security and intent evaluation engine for Ashay's Personal AI Representative. "
            "Output JSON with keys: intent, topics, sentiment, urgency (0.0 to 1.0), risk_level (LOW, MEDIUM, HIGH, CRITICAL), "
            "risk_category (general, scheduling, financial, credential, legal, security), risk_factors, summary."
        )
        user_msg = f"Contact: {contact_name} ({relationship})\nMessage: {text}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": user_msg}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            logger.warning(f"OpenAI error: {e}. Falling back to mock provider.")

        return await self.fallback.analyze_semantics(text, contact_name, relationship, history)

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        if not self.api_key:
            return await self.fallback.generate_response(prompt, system_prompt, conversation_history, temperature, max_tokens)

        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            for item in conversation_history:
                role = "assistant" if item.get("sender") == "ai_representative" else "user"
                messages.append({"role": role, "content": item.get("text", "")})
        messages.append({"role": "user", "content": prompt})

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"OpenAI error: {e}. Falling back to mock provider.")

        return await self.fallback.generate_response(prompt, system_prompt, conversation_history, temperature, max_tokens)
