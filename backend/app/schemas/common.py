import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

# User Schemas
class UserRead(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None

# Contact Rule Schemas
class ContactRuleBase(BaseModel):
    auto_reply_allowed: bool = True
    calendar_access: bool = False
    notes_access: bool = False
    financial_actions_allowed: bool = False
    message_style: str = "neutral"  # casual, formal, professional, neutral
    max_autonomy_level: int = 3
    require_approval_always: bool = False
    custom_instructions: Optional[str] = None

class ContactRuleRead(ContactRuleBase):
    id: int
    contact_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class ContactRuleUpdate(BaseModel):
    auto_reply_allowed: Optional[bool] = None
    calendar_access: Optional[bool] = None
    notes_access: Optional[bool] = None
    financial_actions_allowed: Optional[bool] = None
    message_style: Optional[str] = None
    max_autonomy_level: Optional[int] = None
    require_approval_always: Optional[bool] = None
    custom_instructions: Optional[str] = None

# Contact Schemas
class ContactBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    relationship_type: str = "unknown"  # friend, professor, client, family, colleague, unknown
    company: Optional[str] = None
    notes: Optional[str] = None
    is_vip: bool = False
    is_blocked: bool = False

class ContactCreate(ContactBase):
    rule: Optional[ContactRuleBase] = None

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    relationship_type: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None
    is_vip: bool = None
    is_blocked: bool = None

class ContactRead(ContactBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    rule: Optional[ContactRuleRead] = None
    model_config = ConfigDict(from_attributes=True)

# Message Schemas
class MessageBase(BaseModel):
    content: str
    sender_type: str  # contact, ai_representative, user_human
    sender_name: Optional[str] = None
    channel: str = "chat"

class MessageCreate(BaseModel):
    content: str
    channel: str = "chat"
    sender_type: str = "contact"
    sender_name: Optional[str] = None

class MessageRead(BaseModel):
    id: int
    conversation_id: int
    sender_type: str
    sender_name: Optional[str] = None
    content: str
    channel: str
    status: str
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# Call & Transcript Schemas
class TranscriptTurnRead(BaseModel):
    id: int
    speaker: str
    text: str
    confidence: float
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class CallRead(BaseModel):
    id: int
    conversation_id: int
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    status: str
    duration_seconds: int
    summary: Optional[str] = None
    risk_level: str
    priority: str
    audio_recording_url: Optional[str] = None
    created_at: datetime.datetime
    ended_at: Optional[datetime.datetime] = None
    transcript_turns: List[TranscriptTurnRead] = []
    model_config = ConfigDict(from_attributes=True)

# Conversation Schemas
class ConversationRead(BaseModel):
    id: int
    channel: str
    contact_id: Optional[int] = None
    contact: Optional[ContactRead] = None
    external_identifier: Optional[str] = None
    status: str
    title: Optional[str] = None
    summary: Optional[str] = None
    priority: str
    risk_level: str
    human_taken_over: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime
    messages: List[MessageRead] = []
    model_config = ConfigDict(from_attributes=True)

# Approval Schemas
class ApprovalRead(BaseModel):
    id: int
    conversation_id: int
    message_id: Optional[int] = None
    action_type: str
    proposed_content: str
    proposed_tool: Optional[str] = None
    tool_parameters: Optional[Dict[str, Any]] = None
    context_summary: Optional[str] = None
    risk_level: str
    priority: str
    status: str  # PENDING, APPROVED, EDITED, REJECTED, TAKEN_OVER
    edited_content: Optional[str] = None
    reviewer_notes: Optional[str] = None
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ApprovalResolveRequest(BaseModel):
    action: str  # "approve", "edit", "reject", "takeover"
    edited_content: Optional[str] = None
    reviewer_notes: Optional[str] = None

# Knowledge Item Schemas
class KnowledgeItemBase(BaseModel):
    category: str  # calendar, availability, note, task, personal_fact
    title: str
    content: str
    sensitivity: str = "AUTHORIZED_CONTACTS"  # PUBLIC, AUTHORIZED_CONTACTS, STRICT_PRIVATE
    is_active: bool = True

class KnowledgeItemCreate(KnowledgeItemBase):
    pass

class KnowledgeItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    sensitivity: Optional[str] = None
    is_active: Optional[bool] = None

class KnowledgeItemRead(KnowledgeItemBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# Audit Log Schemas
class AuditLogRead(BaseModel):
    id: int
    timestamp: datetime.datetime
    event_type: str
    category: str
    actor: str
    conversation_id: Optional[int] = None
    contact_name: Optional[str] = None
    description: str
    details: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

# Settings Schemas
class AutonomySettings(BaseModel):
    global_autonomy_level: int = 2  # 0: OBSERVE, 1: SUGGEST, 2: ASSISTED, 3: AUTONOMOUS, 4: RESTRICTED
    require_approval_for_scheduling: bool = True
    require_approval_for_unknown: bool = True
    level_descriptions: Dict[int, str] = {
        0: "OBSERVE: Analyze & classify only. Never replies or acts.",
        1: "SUGGEST: Generates proposed response/action. Requires user approval.",
        2: "ASSISTED: Routine conversations automated. Approval for meetings/medium risk.",
        3: "AUTONOMOUS: Full independent handling within allowed permissions. High risk takes message.",
        4: "RESTRICTED: Takes messages only. Discloses nothing."
    }

class PermissionSettings(BaseModel):
    calendar: str = "ALLOW"  # ALLOW, DENY, REQUIRE_APPROVAL
    notes: str = "DENY"
    tasks: str = "ALLOW"
    financial: str = "DENY"

class LLMProviderSettings(BaseModel):
    provider: str = "mock"  # "mock", "gemini", "openai"
    gemini_api_key_set: bool = False
    gemini_model: str = "gemini-2.0-flash"
    openai_api_key_set: bool = False
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"

class LLMProviderUpdate(BaseModel):
    provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    openai_base_url: Optional[str] = None

# Simulation Schemas
class SimulateEventRequest(BaseModel):
    channel: str = "chat"  # chat, call, sms, email
    contact_id: Optional[int] = None
    sender_name: Optional[str] = None
    sender_phone_or_email: Optional[str] = None
    message_content: str

class DecisionTrace(BaseModel):
    input_sanitized: bool
    prompt_injection_detected: bool
    contact_identified: str
    contact_relationship: str
    detected_intent: str
    detected_topics: List[str]
    risk_level: str
    risk_category: str
    risk_factors: List[str]
    priority_level: str
    urgency_score: float
    permitted_actions: List[str]
    autonomy_level: int
    decision: str  # AUTO_REPLY, REQUIRE_APPROVAL, TAKE_MESSAGE, ESCALATE_NOW, BLOCK
    generated_response: Optional[str] = None
    escalation_reason: Optional[str] = None

class SimulateEventResponse(BaseModel):
    conversation_id: int
    message_id: int
    trace: DecisionTrace
    pending_approval_id: Optional[int] = None
    sent_response: Optional[str] = None
