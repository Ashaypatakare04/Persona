# Persona — Personal AI Representative

Persona is an autonomous, policy-governed personal AI representative built to communicate and perform actions on behalf of **Ashay** across phone calls, text messages, email, and live chat.

---

## 🌟 Core Architecture & Capabilities

1. **Multi-Stage Security & Decision Pipeline**:
   - **Safety Guard**: Detects and neutralizes prompt injections, roleplay traps, and confidential credential probing.
   - **Context & Memory Aggregation**: Loads contact profile, relationship rules, and permitted personal knowledge.
   - **Intent & Topic Classifier**: Extracts intent, subject domains, and urgency.
   - **Dedicated Risk Engine**: Evaluates impact across `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` tiers. On high-risk requests (e.g., loan requests, financial transfers, legal commitments), Persona safely takes a message and escalates to Ashay without disclosing internal scores.
   - **Dedicated Priority Engine**: Computes priority (`HIGH` 🔴, `MEDIUM` 🟠, `LOW` 🟢, `IGNORE_SPAM` ⚪) based on relationships, deadlines, and risk factors.
   - **Granular Permission Engine**: Enforces contact rules, channel capabilities, and resource permissions (Calendar, Notes, Tasks, Financial).
   - **Dynamic Autonomy Engine**: Configurable from Level 0 (Observe) to Level 4 (Restricted) at runtime without changing code.
   - **Persona Communication Style Engine**: Formats tone dynamically: casual for friends, formal for professors, professional for clients, and neutral for unknown callers.
   - **Human Takeover & Escalation**: Immediate takeover controls for live calls and message threads.
   - **Chronological Audit Trail**: Full structured logging of every cognitive step and policy decision.

2. **Browser Voice Engine (STT + TTS)**:
   - Real-time voice simulation in the browser using Web Speech SpeechRecognition (STT) and SpeechSynthesis (TTS).
   - Voice controls: `[Take Over Call]`, `[Continue AI]`, and `[End Call]`.

3. **Interactive Simulation Sandbox**:
   - Test incoming communications across Chat, Voice Calls, SMS, and Email with one click.
   - Preset test scenarios including:
     - 💰 **Loan Request (₹20,000)** -> High Risk, polite message-taking, escalation to Ashay.
     - 🛡️ **Prompt Injection Attack** -> Security guard detection, Critical Risk, policy shielding.
     - ☕ **Friend Casual Chat** -> Casual tone, availability check.
     - 🎓 **Professor Academic Deadline** -> Formal tone, high priority routing.
     - 💼 **Client Business Proposal** -> Professional tone, calendar consultation.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+** (Tested on Python 3.13)
- **Node.js 18+** and **pnpm** (or npm)

---

### Step 1: Run the Backend (FastAPI)

```bash
# Navigate to the backend folder
cd backend

# Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# (Optional) Install dependencies if not already installed:
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **REST API & Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **WebSocket Event Stream**: `ws://127.0.0.1:8000/ws`
- **Database**: Persistent local SQLite database stored in `backend/data/persona.db`.

---

### Step 2: Run the Frontend (React + Vite + Tailwind)

In a new terminal:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies if not already installed
pnpm install

# Start the Vite development server
pnpm dev
```

The dashboard will open at **[http://localhost:5173](http://localhost:5173)**.

---

### Step 3: Run Automated Tests

To run the complete 24-test suite covering the safety guard, risk engine, priority engine, permission engine, autonomy levels, and HTTP API endpoints:

```bash
cd backend
.venv\Scripts\pytest -v
```

---

## ⚙️ AI Provider Options

Persona is provider-agnostic. Out of the box, it uses the **Local Heuristic Mock Engine** which runs with **zero external API keys** and 100% deterministic reliability.

To connect live Gemini or OpenAI models:
1. Open the **AI Settings** tab in the dashboard (or edit `backend/.env`).
2. Select **Google Gemini** or **OpenAI / Ollama**.
3. Paste your API key and save.
