# Project Plan: Personal AI Representative (Persona)

## 1. Project Overview

Persona is an extensible AI Representative designed to handle phone calls, text messages, email, and live conversations on behalf of Ashay. It provides autonomous communication under strict policy, permission, and risk controls.

---

## 2. Roadmap Phases

- **Phase 1 (Active)**: Local AI Representative MVP
  - Chat & simulated communication interfaces
  - Modular AI Orchestrator (Intent, Risk, Priority, Permissions, Autonomy)
  - Rule-Mock LLM engine (zero-dependency) + Gemini/OpenAI adapter
  - Human approval workflow ([Approve], [Edit], [Reject], [Take Over])
  - Persistent database with contacts, rules, conversations, knowledge, audit logs
  - Real-time Browser Voice Simulator (Web Speech STT/TTS)
  - Full-featured Dashboard UI (Overview, Inbox, Calls, Approvals, Contacts, Settings, Audit)
- **Phase 2**: Advanced Voice Pipeline (Low-latency streaming STT/TTS, barge-in, voice cloning)
- **Phase 3**: Real Telephony (Twilio / Webhook gateway, incoming/outgoing carrier calls)
- **Phase 4**: Multi-Channel Messaging (SMS, WhatsApp Business, IMAP/SMTP Email)
- **Phase 5**: Deep Personal Memory & Integrations (Google Calendar, Notion, Notes)
- **Phase 6**: Communication Style Learning (Few-shot learning from historical messages)
- **Phase 7**: Tool & Action Automation (Autonomous agent execution)
- **Phase 8**: Multilingual Voice Support (Hindi, Marathi, Gujarati, English code-switching)

---

## 3. Phase 1 Implementation Schedule

1. **Environment & Scaffolding**: Setup Python virtual environment, dependencies, Vite + React app.
2. **Database & Data Models**: SQLAlchemy async models, persistent SQLite, initial Ashay profile & seeds.
3. **AI Cognitive Engines**: Safety guard, intent detector, risk engine, priority engine, permission engine, autonomy engine, and orchestrator.
4. **Channel Adapters & APIs**: Web chat, browser voice, mock SMS, mock email, and simulation sandbox.
5. **Human Approval & Takeover**: Workflow for approving/editing responses and taking over chats/calls.
6. **Frontend Dashboard**: React 18 + Tailwind UI with reactive WebSockets and Web Speech API.
7. **Testing & Validation**: Pytest test suite covering risk, permissions, autonomy, injection defense, and API endpoints.
