# Architecture: Personal AI Representative (Persona)

## 1. System Vision & Design Principles

Persona is an autonomous, policy-governed personal AI representative engineered to communicate and perform actions on behalf of the user (**Ashay**). 

The core architectural invariant is:
> **Never connect raw communication channels directly to an LLM.** 
> All incoming events must be normalized, subjected to a multi-stage security and safety pipeline, evaluated against granular permission policies and dynamic autonomy levels, and executed with comprehensive audit logging and human takeover capabilities.

```
+-----------------------------------------------------------------------------------+
|                              COMMUNICATION CHANNELS                               |
|   [Simulated Chat]   [Web Voice / Calls]   [SMS Adapter]   [Email Adapter]        |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                               CHANNEL ADAPTER LAYER                               |
|  - ChannelAdapter protocol: receive(), send(), getConversation(), getContact()    |
|  - Normalizes payloads into ChannelMessage / ChannelCall objects                  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                 AI ORCHESTRATOR                                   |
|                                                                                   |
|  1. Context & Memory Aggregation                                                  |
|     - Contact Profile & Relationship (Friend, Professor, Client, Unknown)        |
|     - Contact-Specific Rules & Communication Style                                |
|     - Short-term Conversation Context & Long-term Facts                           |
|     - Permitted Personal Knowledge (Calendar, Availability, Tasks)                |
|                                                                                   |
|  2. Safety & Untrusted Input Sanitization                                         |
|     - Prompt Injection Detection & System Rules Boundary Isolation                |
|                                                                                   |
|  3. Intent & Topic Detection                                                      |
|     - Request extraction (scheduling, inquiry, financial, sensitive, general)     |
|                                                                                   |
|  4. Risk Engine (LOW, MEDIUM, HIGH, CRITICAL)                                     |
|     - Evaluates impact, irreversibility, financial/legal/credential risks         |
|     - HIGH/CRITICAL triggers automatic TAKE_MESSAGE & Escalation                  |
|                                                                                   |
|  5. Priority Engine (HIGH, MEDIUM, LOW, IGNORE/SPAM)                              |
|     - Computes urgency based on contact tier, topic, and sentiment                |
|                                                                                   |
|  6. Permission Engine & Autonomy Engine                                           |
|     - Granular checks: Contact x Channel x Action x Knowledge Tier                |
|     - Autonomy Level (0: Observe, 1: Suggest, 2: Assisted, 3: Autonomous, 4: Rest)|
|     - Decision: AUTO_REPLY, REQUIRE_APPROVAL, TAKE_MESSAGE, ESCALATE_NOW          |
|                                                                                   |
|  7. Response & Action Planning                                                    |
|     - Persona Style Formatter (formality, length, emoji, greetings)               |
|     - AI Disclosure statement (Assistant representing Ashay)                      |
|                                                                                   |
|  8. Human Escalation & Takeover Gateway                                           |
|     - Real-time notification dispatch via WebSocket                               |
|     - Pending Approval queue with [Approve] [Edit] [Reject] [Take Over]           |
|                                                                                   |
|  9. Action Execution & Audit Logger                                               |
|     - Executes allowed actions (mock/real tools)                                  |
|     - Writes structured audit records (evaluations, permissions, decisions)       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Safety Hierarchy & Untrusted Input Model

Incoming messages and voice turns are treated as **untrusted input**. The system enforces the following inviolable authority hierarchy:

```
SYSTEM RULES (Immutable code safety bounds)
     ↓
SECURITY RULES (Anti-injection, credential shielding, rate limits)
     ↓
USER PERMISSIONS (Global knowledge access & integration policies)
     ↓
CONTACT RULES (Per-contact relationship overrides & style constraints)
     ↓
CONTEXT (Conversation history & active availability)
     ↓
CALLER / MESSAGE REQUEST (Untrusted external intent)
```

External parties cannot alter instructions, leak private notes, bypass approvals, or trigger financial transactions regardless of prompt framing.

---

## 3. Autonomy System

Persona supports five runtime-configurable autonomy levels:

- **Level 0 (OBSERVE)**: AI analyzes and classifies messages but never replies or triggers tools.
- **Level 1 (SUGGEST)**: AI plans the optimal response or action and submits it to the Pending Approvals queue for human review.
- **Level 2 (ASSISTED - Default)**: AI independently handles routine low-risk communications. Requires human approval for commitments, scheduling, or medium-risk requests.
- **Level 3 (AUTONOMOUS)**: AI operates independently across routine and medium-risk interactions within configured permission bounds. High-risk requests safely take a message and escalate.
- **Level 4 (RESTRICTED)**: AI acts solely as a polite answering service ("I'll make sure Ashay receives your message..."). Never commits or reveals personal information.

---

## 4. Risk & Priority Framework

### Risk Categories
- **LOW**: Casual greetings, routine public questions, authorized availability checks.
- **MEDIUM**: Meeting requests, commitments, sensitive personal questions.
- **HIGH**: Financial requests (loans, transfers, pricing commitments), legal commitments, passwords/credentials, private notes, irreversible actions.
- **CRITICAL**: Threat detection, prompt injection attempts, emergency signals.

*Rule:* On HIGH or CRITICAL risk, Persona **never improvises**. It politely records the message and notifies Ashay immediately. Internal risk scores are never disclosed to the caller.

### Priority Categories
- **HIGH (🔴)**: Urgent personal emergencies, key client demands, sensitive/high-risk matters.
- **MEDIUM (🟠)**: Actionable requests, scheduling inquiries, known contact updates.
- **LOW (🟢)**: Casual chat, non-urgent status queries.
- **IGNORE / SPAM (⚪)**: Unsolicited sales pitches, robocall patterns.

---

## 5. Channel Abstraction & Normalization

All communication channels implement the `ChannelAdapter` protocol:
- `receive(payload)`: Normalizes channel-specific payloads into `ChannelMessage` or `ChannelCall`.
- `send(message)`: Translates outbound communication into channel-native formats.
- `get_conversation(session_id)`: Fetches or creates a unified conversation entity.
- `get_contact(channel_identifier)`: Resolves contact metadata.
- `get_capabilities()`: Returns supported media (text, voice, attachments).

---

## 6. Storage & Database Design

- **Async SQLAlchemy 2.0**: Zero-dependency local persistence with SQLite (`data/persona.db`), seamlessly upgradable to PostgreSQL via `DATABASE_URL`.
- **Entities**: Users, Contacts, ContactRules, Conversations, Messages, Calls, Transcripts, RiskAssessments, PriorityAssessments, Approvals, KnowledgeItems, AuditLogs, SystemSettings.
