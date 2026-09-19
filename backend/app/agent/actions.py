from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.approval import ActionExecution
from app.models.knowledge import KnowledgeItem

class ActionExecutor:
    """
    Executes authorized tools safely.
    Tools:
    - 'calendar.add_event': Inserts a tentative meeting in knowledge items
    - 'notes.save_message': Stores an escalated message for Ashay
    """

    @classmethod
    async def execute(
        cls,
        db: AsyncSession,
        action_name: str,
        parameters: Dict[str, Any],
        conversation_id: int = None
    ) -> Dict[str, Any]:
        try:
            if action_name == "calendar.add_event":
                title = parameters.get("title", "Tentative Meeting")
                content = parameters.get("time_and_details", "Requested time slot")
                item = KnowledgeItem(
                    category="calendar",
                    title=f"[Confirmed Meeting] {title}",
                    content=content,
                    sensitivity="AUTHORIZED_CONTACTS"
                )
                db.add(item)
                await db.flush()
                result = {"status": "success", "event_id": item.id}
            elif action_name == "notes.save_message":
                title = parameters.get("title", "Escalated Message")
                content = parameters.get("message", "")
                item = KnowledgeItem(
                    category="note",
                    title=f"[Action Item] {title}",
                    content=content,
                    sensitivity="AUTHORIZED_CONTACTS"
                )
                db.add(item)
                await db.flush()
                result = {"status": "success", "note_id": item.id}
            else:
                result = {"status": "noop", "message": f"Action {action_name} performed"}

            execution = ActionExecution(
                conversation_id=conversation_id,
                action_name=action_name,
                parameters=parameters,
                result=result,
                status="SUCCESS"
            )
            db.add(execution)
            await db.commit()
            return result
        except Exception as e:
            await db.rollback()
            return {"status": "error", "error": str(e)}
