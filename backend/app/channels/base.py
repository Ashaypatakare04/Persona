from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation
from app.models.contact import Contact

class ChannelAdapter(ABC):
    @property
    @abstractmethod
    def channel_type(self) -> str:
        """Returns the channel identifier, e.g. 'chat', 'call', 'sms', 'email'"""
        pass

    @abstractmethod
    async def get_or_create_conversation(
        self,
        db: AsyncSession,
        external_id: str,
        contact_id: Optional[int] = None
    ) -> Conversation:
        pass

    @abstractmethod
    async def receive_inbound(
        self,
        db: AsyncSession,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Normalizes inbound payload and delegates to AI Orchestrator."""
        pass

    @abstractmethod
    async def send_outbound(
        self,
        db: AsyncSession,
        conversation_id: int,
        content: str
    ) -> bool:
        """Dispatches an outbound message formatted for this channel."""
        pass
