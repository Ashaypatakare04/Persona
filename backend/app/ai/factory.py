from app.core.config import settings
from app.ai.base import BaseLLMProvider
from app.ai.mock_provider import MockRuleLLMProvider
from app.ai.gemini_provider import GeminiLLMProvider
from app.ai.openai_provider import OpenAILLMProvider

_current_provider: BaseLLMProvider = None

def get_llm_provider(force_provider: str = None) -> BaseLLMProvider:
    global _current_provider
    provider_name = force_provider or settings.DEFAULT_LLM_PROVIDER
    
    if provider_name == "gemini":
        return GeminiLLMProvider(
            api_key=settings.GEMINI_API_KEY,
            model=settings.GEMINI_MODEL
        )
    elif provider_name == "openai":
        return OpenAILLMProvider(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            base_url=settings.OPENAI_BASE_URL
        )
    else:
        return MockRuleLLMProvider()
