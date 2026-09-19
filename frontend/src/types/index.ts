export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ContactRule {
  id: number;
  contact_id: number;
  auto_reply_allowed: boolean;
  calendar_access: boolean;
  notes_access: boolean;
  financial_actions_allowed: boolean;
  message_style: string;
  max_autonomy_level: number;
  require_approval_always: boolean;
  custom_instructions?: string;
}

export interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  relationship_type: string; // friend, professor, client, family, colleague, unknown
  company?: string;
  notes?: string;
  is_vip: boolean;
  is_blocked: boolean;
  created_at: string;
  rule?: ContactRule;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'contact' | 'ai_representative' | 'user_human';
  sender_name?: string;
  content: string;
  channel: string;
  status: string;
  metadata_info?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: number;
  channel: 'chat' | 'call' | 'sms' | 'email' | 'whatsapp';
  contact_id?: number;
  contact?: Contact;
  external_identifier?: string;
  status: 'active' | 'escalated' | 'closed' | 'human_takeover';
  title?: string;
  summary?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'IGNORE_SPAM';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  human_taken_over: boolean;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface TranscriptTurn {
  id: number;
  speaker: string;
  text: string;
  confidence: number;
  created_at: string;
}

export interface Call {
  id: number;
  conversation_id: number;
  caller_name?: string;
  caller_phone?: string;
  status: string;
  duration_seconds: number;
  summary?: string;
  risk_level: string;
  priority: string;
  audio_recording_url?: string;
  created_at: string;
  ended_at?: string;
  transcript_turns: TranscriptTurn[];
}

export interface Approval {
  id: number;
  conversation_id: number;
  message_id?: number;
  action_type: string;
  proposed_content: string;
  proposed_tool?: string;
  tool_parameters?: Record<string, any>;
  context_summary?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'IGNORE_SPAM';
  status: 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED' | 'TAKEN_OVER';
  edited_content?: string;
  reviewer_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface KnowledgeItem {
  id: number;
  category: 'calendar' | 'availability' | 'note' | 'task' | 'personal_fact';
  title: string;
  content: string;
  sensitivity: 'PUBLIC' | 'AUTHORIZED_CONTACTS' | 'STRICT_PRIVATE';
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  event_type: string;
  category: string;
  actor: string;
  conversation_id?: number;
  contact_name?: string;
  description: string;
  details?: Record<string, any>;
}

export interface DashboardStats {
  calls_today: number;
  messages_today: number;
  pending_approvals: number;
  escalations_count: number;
  ai_handled_count: number;
  high_priority_count: number;
  contacts_count: number;
}

export interface AutonomySettings {
  global_autonomy_level: number;
  require_approval_for_scheduling: boolean;
  require_approval_for_unknown: boolean;
  level_descriptions: Record<number, string>;
}

export interface PermissionSettings {
  calendar: string;
  notes: string;
  tasks: string;
  financial: string;
}

export interface LLMSettings {
  provider: string;
  gemini_api_key_set: boolean;
  gemini_model: string;
  openai_api_key_set: boolean;
  openai_model: string;
  openai_base_url: string;
}

export interface DecisionTrace {
  input_sanitized: boolean;
  prompt_injection_detected: boolean;
  contact_identified: string;
  contact_relationship: string;
  detected_intent: string;
  detected_topics: string[];
  risk_level: string;
  risk_category: string;
  risk_factors: string[];
  priority_level: string;
  urgency_score: number;
  permitted_actions: string[];
  autonomy_level: number;
  decision: string;
  generated_response?: string;
  escalation_reason?: string;
}

export interface SimulateResponse {
  conversation_id: number;
  message_id: number;
  trace: DecisionTrace;
  pending_approval_id?: number;
  sent_response?: string;
}
