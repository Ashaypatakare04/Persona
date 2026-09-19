import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.contact import Contact
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.approval import Approval
from app.models.risk_priority import RiskAssessment, PriorityAssessment
from app.models.audit import AuditLog
from app.models.policy import SystemSetting, PermissionPolicy

from app.agent.safety import SafetyGuard
from app.agent.risk import RiskEngine
from app.agent.priority import PriorityEngine
from app.agent.permissions import PermissionEngine
from app.agent.autonomy import AutonomyEngine
from app.agent.style import StyleEngine
from app.agent.memory import MemoryManager
from app.ai.factory import get_llm_provider

logger = logging.getLogger(__name__)

class AIOrchestrator:
    """
    Central AI Representative Orchestration Pipeline.
    Strictly follows the safety hierarchy and modular pipeline architecture:
    Sanitize -> Context/Memory -> Intent -> Risk -> Priority -> Permissions -> Autonomy -> Response/Escalation -> Audit
    """

    @classmethod
    async def process_incoming_event(
        cls,
        db: AsyncSession,
        conversation_id: int,
        raw_text: str,
        channel: str = "chat",
        sender_name: Optional[str] = None
    ) -> Dict[str, Any]:
        # Step 1: Input Sanitization & Safety Guard
        clean_text = SafetyGuard.sanitize_input(raw_text)
        is_safe, safety_flags = SafetyGuard.evaluate_safety(clean_text)

        # Fetch conversation and associated contact
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        res = await db.execute(stmt)
        conversation = res.scalar_one_or_none()
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found.")

        contact: Optional[Contact] = None
        if conversation.contact_id:
            c_stmt = select(Contact).where(Contact.id == conversation.contact_id)
            c_res = await db.execute(c_stmt)
            contact = c_res.scalar_one_or_none()

        contact_name = contact.name if contact else (sender_name or "Unknown")
        relationship = contact.relationship_type if contact else "unknown"
        is_vip = contact.is_vip if contact else False

        # Step 2: Intent, Semantic, and Topic Analysis
        llm = get_llm_provider()
        semantics = await llm.analyze_semantics(clean_text, contact_name, relationship)
        intent = semantics.get("intent", "GENERAL_INQUIRY")
        topics = semantics.get("topics", ["general"])
        primary_topic = topics[0] if topics else "general"

        # Step 3: Risk Assessment
        is_financial = "financial" in topics or intent == "FINANCIAL_REQUEST"
        is_credential = "credentials" in topics or intent == "CREDENTIAL_INQUIRY"
        risk_result = RiskEngine.evaluate(
            text=clean_text,
            intent=intent,
            contact_relationship=relationship,
            has_permission_violations=False,
            safety_flags=safety_flags
        )
        risk_level = risk_result["level"]

        # Step 4: Priority Assessment
        priority_result = PriorityEngine.evaluate(
            text=clean_text,
            risk_level=risk_level,
            relationship=relationship,
            is_vip=is_vip,
            base_urgency=semantics.get("urgency", 0.3)
        )
        priority_level = priority_result["level"]

        # Step 5: Global Settings & Granular Permission Evaluation
        # Fetch global autonomy level setting
        setting_stmt = select(SystemSetting).where(SystemSetting.key == "global_autonomy_level")
        setting_res = await db.execute(setting_stmt)
        setting_obj = setting_res.scalar_one_or_none()
        global_autonomy_level = int(setting_obj.value) if setting_obj else 2

        # Fetch global permissions
        perm_stmt = select(PermissionPolicy)
        perm_res = await db.execute(perm_stmt)
        perm_items = perm_res.scalars().all()
        global_permissions = {p.resource_name: p.access_level for p in perm_items}

        perm_eval = PermissionEngine.evaluate(
            contact=contact,
            channel=channel,
            topic=primary_topic,
            global_permissions=global_permissions,
            is_financial=is_financial,
            is_credential_probe=is_credential
        )

        # Re-check risk if permission violated
        if not perm_eval["allowed"] and risk_level == "LOW":
            risk_level = "HIGH"
            risk_result["level"] = "HIGH"
            risk_result["factors"].extend(perm_eval["violations"])

        # Step 6: Autonomy Decision
        contact_rule = contact.rule if contact else None
        contact_max_level = contact_rule.max_autonomy_level if contact_rule else None
        contact_require_approval = contact_rule.require_approval_always if contact_rule else False

        autonomy_decision = AutonomyEngine.decide_action(
            global_level=global_autonomy_level,
            contact_max_level=contact_max_level,
            contact_require_approval=contact_require_approval,
            risk_level=risk_level,
            is_permission_allowed=perm_eval["allowed"],
            intent=intent
        )
        decision = autonomy_decision["decision"]

        # Step 7: Response & Action Formulation
        calendar_allowed = perm_eval.get("calendar_access", False)
        notes_allowed = perm_eval.get("notes_access", False)
        permitted_knowledge = await MemoryManager.get_permitted_knowledge(db, calendar_allowed, notes_allowed)
        history = await MemoryManager.get_recent_conversation_history(db, conversation.id)

        system_prompt = StyleEngine.build_system_prompt(contact, permitted_knowledge)
        
        # Determine AI response text based on decision
        if decision == "TAKE_MESSAGE":
            # For risky/high impact or restricted mode: standard reassuring message-taking response
            generated_text = "I'll make sure Ashay receives your message and gets back to you regarding this."
        elif not is_safe:
            generated_text = "I am unable to process this request. I am Ashay's AI representative and follow strict security guidelines."
        else:
            generated_text = await llm.generate_response(
                prompt=clean_text,
                system_prompt=system_prompt,
                conversation_history=history
            )

        # Step 8: Execute Decision Flow
        sent_response = None
        pending_approval_id = None

        if decision == "AUTO_REPLY":
            # Dispatch AI message immediately
            ai_msg = Message(
                conversation_id=conversation.id,
                sender_type="ai_representative",
                sender_name="AI Representative",
                content=generated_text,
                channel=channel,
                status="sent",
                metadata_info={"intent": intent, "risk": risk_level, "decision": decision}
            )
            db.add(ai_msg)
            sent_response = generated_text
        elif decision == "TAKE_MESSAGE":
            # Send message-taking response to contact
            ai_msg = Message(
                conversation_id=conversation.id,
                sender_type="ai_representative",
                sender_name="AI Representative",
                content=generated_text,
                channel=channel,
                status="sent",
                metadata_info={"intent": intent, "risk": risk_level, "decision": decision}
            )
            db.add(ai_msg)
            sent_response = generated_text

            # Create an Escalation record in Approvals table so Ashay is notified
            approval = Approval(
                conversation_id=conversation.id,
                action_type="TAKE_MESSAGE",
                proposed_content=f"Contact said: '{clean_text}'\nAI took message: '{generated_text}'",
                context_summary=f"High risk / escalation event ({risk_result['category']}). Action needed from Ashay.",
                risk_level=risk_level,
                priority=priority_level,
                status="PENDING"
            )
            db.add(approval)
            await db.flush()
            pending_approval_id = approval.id
            conversation.status = "escalated"

        elif decision == "REQUIRE_APPROVAL":
            # Do NOT send response yet; save as pending approval for Ashay
            approval = Approval(
                conversation_id=conversation.id,
                action_type="SEND_MESSAGE",
                proposed_content=generated_text,
                context_summary=f"Inbound from {contact_name}: '{clean_text}'",
                risk_level=risk_level,
                priority=priority_level,
                status="PENDING"
            )
            db.add(approval)
            await db.flush()
            pending_approval_id = approval.id

        elif decision == "ESCALATE_NOW":
            # Autonomy 0: Inform Ashay without sending response
            approval = Approval(
                conversation_id=conversation.id,
                action_type="ESCALATE",
                proposed_content=f"Inbound from {contact_name}: '{clean_text}'",
                context_summary="Autonomy Level 0 (Observe mode): Response requires manual dispatch.",
                risk_level=risk_level,
                priority=priority_level,
                status="PENDING"
            )
            db.add(approval)
            await db.flush()
            pending_approval_id = approval.id
            conversation.status = "escalated"

        # Update conversation meta
        conversation.priority = priority_level
        conversation.risk_level = risk_level
        conversation.summary = semantics.get("summary", clean_text[:80])

        # Step 9: Save Risk and Priority Assessment entities
        risk_entity = RiskAssessment(
            conversation_id=conversation.id,
            risk_level=risk_level,
            risk_category=risk_result["category"],
            score=risk_result["score"],
            factors=risk_result["factors"],
            explanation=risk_result["explanation"]
        )
        db.add(risk_entity)

        priority_entity = PriorityAssessment(
            conversation_id=conversation.id,
            priority_level=priority_level,
            urgency_score=priority_result["score"],
            reason=priority_result["reason"]
        )
        db.add(priority_entity)

        # Step 10: Comprehensive Audit Log
        audit_entry = AuditLog(
            event_type="ORCHESTRATION_COMPLETED",
            category="DECISION",
            actor="AI_REPRESENTATIVE",
            conversation_id=conversation.id,
            contact_name=contact_name,
            description=f"Evaluated inbound from {contact_name}: Risk={risk_level}, Priority={priority_level}, Decision={decision}",
            details={
                "inbound_text": clean_text,
                "safety": {"is_safe": is_safe, "flags": safety_flags},
                "intent": intent,
                "topics": topics,
                "risk": risk_result,
                "priority": priority_result,
                "permissions": perm_eval,
                "autonomy": autonomy_decision,
                "decision": decision,
                "generated_text": generated_text,
                "sent_to_contact": sent_response is not None,
                "pending_approval_id": pending_approval_id
            }
        )
        db.add(audit_entry)
        await db.commit()

        trace = {
            "input_sanitized": True,
            "prompt_injection_detected": not is_safe,
            "contact_identified": contact_name,
            "contact_relationship": relationship,
            "detected_intent": intent,
            "detected_topics": topics,
            "risk_level": risk_level,
            "risk_category": risk_result["category"],
            "risk_factors": risk_result["factors"],
            "priority_level": priority_level,
            "urgency_score": priority_result["score"],
            "permitted_actions": ["auto_reply"] if perm_eval["auto_reply_allowed"] else [],
            "autonomy_level": autonomy_decision["effective_level"],
            "decision": decision,
            "generated_response": generated_text,
            "escalation_reason": risk_result["explanation"] if risk_level in ["HIGH", "CRITICAL"] else None
        }

        return {
            "conversation_id": conversation.id,
            "trace": trace,
            "pending_approval_id": pending_approval_id,
            "sent_response": sent_response
        }
