from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Generate conversational response text given prompt and context."""
        pass

    @abstractmethod
    async def analyze_semantics(
        self,
        text: str,
        contact_name: str,
        relationship: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Analyze text to extract:
        - intent: str
        - topics: List[str]
        - sentiment: str
        - urgency: float (0.0 to 1.0)
        - risk_level: str ("LOW", "MEDIUM", "HIGH", "CRITICAL")
        - risk_category: str
        - risk_factors: List[str]
        """
        pass
