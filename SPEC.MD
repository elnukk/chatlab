# Open-Source Specification: Qualtrics Chatbot Experimentation Platform

> A comprehensive specification for building an open-source platform that enables researchers to conduct survey-integrated chatbot experiments with AI assistants, custom prompts, data embeddings, and multi-session participant tracking.

---

## Table of Contents

1. [Project Vision & Goals](#1-project-vision--goals)
2. [Product Features](#2-product-features)
3. [Architecture Overview](#3-architecture-overview)
4. [Core System: Survey-Integrated Chatbot](#4-core-system-survey-integrated-chatbot)
5. [Experiment Configuration Engine](#5-experiment-configuration-engine)
6. [Prompt Management System](#6-prompt-management-system)
7. [Memory & Embeddings System](#7-memory--embeddings-system)
8. [Multi-Session Participant Tracking](#8-multi-session-participant-tracking)
9. [Admin Dashboard](#9-admin-dashboard)
10. [Data Export & Analytics](#10-data-export--analytics)
11. [Survey Platform Integration](#11-survey-platform-integration)
12. [Authentication & Security](#12-authentication--security)
13. [Database Schema](#13-database-schema)
14. [API Specification](#14-api-specification)
15. [Frontend Chat Interface](#15-frontend-chat-interface)
16. [LLM Provider Integration](#16-llm-provider-integration)
17. [Deployment & Infrastructure](#17-deployment--infrastructure)
18. [Developer Experience](#18-developer-experience)
19. [Implementation Phases](#19-implementation-phases)
20. [Reference: Original System Analysis](#20-reference-original-system-analysis)

---

## 1. Project Vision & Goals

### What This Platform Does

This is an open-source platform that allows **researchers** (behavioral science, HCI, psychology, marketing, etc.) to run **chatbot-based experiments** embedded inside survey platforms like Qualtrics. Researchers can:

- Deploy AI chatbots (GPT-4, Claude, etc.) as part of survey flows
- Assign participants to different experimental conditions (prompt variants, memory on/off, structured vs. exploratory tasks)
- Track participants across multiple sessions with persistent memory
- Use data embeddings to give chatbots personalized context from prior interactions
- Collect and export complete conversation transcripts for analysis
- Manage everything through an admin dashboard — no coding required for basic experiments

### Why Open Source This

The original system was built for a specific Stanford GSB research study on weekend planning with AI assistants. The core patterns — survey-embedded chatbots, experimental conditions, cross-session memory, prompt management — are universally useful for any researcher running chatbot experiments. Currently, there is no open-source tool that bridges survey platforms and AI chatbots for experimental research.

### Target Users

| User Type | Use Case |
|-----------|----------|
| **Academic Researchers** | Run IRB-approved chatbot experiments embedded in Qualtrics/REDCap surveys |
| **UX Researchers** | A/B test different chatbot personalities or interaction styles |
| **Behavioral Scientists** | Study how AI memory/personalization affects user behavior |
| **Graduate Students** | Set up chatbot experiments without full-stack development skills |
| **Research Labs** | Standardize chatbot experimentation across multiple studies |

### Core Principles

1. **Researcher-first**: Non-technical researchers should be able to configure and launch experiments through the admin dashboard
2. **Survey-native**: First-class integration with Qualtrics, with a plugin architecture for other survey platforms
3. **Experiment-aware**: Built around the concept of experimental conditions, not just chatbot deployment
4. **Memory-capable**: Cross-session participant memory with semantic embeddings is a core feature, not an afterthought
5. **Data-transparent**: Complete audit trail of every interaction, exportable in research-friendly formats (CSV, JSON, JSONL)
6. **Provider-agnostic**: Support multiple LLM providers (OpenAI, Anthropic, open-source models) through a unified interface

---

## 2. Product Features

### Feature Matrix

| Feature | Description | Priority |
|---------|-------------|----------|
| **Embeddable Chat Widget** | Chatbot UI that embeds in Qualtrics via iframe with URL parameters | P0 — Core |
| **Experiment Builder** | Admin UI to create experiments with conditions, prompts, and settings | P0 — Core |
| **Prompt Management** | Create, version, and assign system prompts to experimental conditions | P0 — Core |
| **Multi-Session Support** | Track participants across 2+ sessions with configurable session flows | P0 — Core |
| **Conversation Storage** | Store complete chat transcripts per participant per session | P0 — Core |
| **Condition Assignment** | Assign participants to conditions via URL params or random assignment | P0 — Core |
| **Memory Injection** | Inject facts from prior sessions into new session prompts | P0 — Core |
| **Admin Dashboard** | Web UI for managing experiments, viewing data, and configuring settings | P0 — Core |
| **Data Export** | Export transcripts and metadata as CSV/JSON for analysis | P0 — Core |
| **LLM Provider Selection** | Choose between OpenAI, Anthropic, or custom LLM endpoints per experiment | P1 — Important |
| **Automatic Memory Extraction** | Use LLM to extract key facts from session transcripts automatically | P1 — Important |
| **Semantic Embeddings** | Vector embeddings for smart memory retrieval (not just dump all facts) | P1 — Important |
| **Turn/Message Limits** | Configure max messages per session and max LLM replies | P1 — Important |
| **CORS Management** | Configure allowed origins through admin UI | P1 — Important |
| **Researcher Auth** | Email/password login for researchers to access the admin dashboard | P1 — Important |
| **Real-time Monitoring** | Live view of active participant sessions | P2 — Nice to Have |
| **Token Usage Tracking** | Track and display LLM API costs per experiment | P2 — Nice to Have |
| **Webhook Notifications** | Fire webhooks on session completion for Qualtrics flow triggers | P2 — Nice to Have |
| **Response Streaming** | Stream LLM responses token-by-token for better UX | P2 — Nice to Have |
| **Custom CSS Themes** | Allow researchers to customize chat widget appearance | P2 — Nice to Have |
| **Prolific/MTurk Integration** | Direct integration with participant recruitment platforms | P3 — Future |
| **Multi-language Support** | i18n for chat interface and system prompts | P3 — Future |
| **Branching Logic** | Route participants to different chatbot flows based on survey responses | P3 — Future |

---

## 3. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SURVEY PLATFORM                              │
│  (Qualtrics / REDCap / Custom)                                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Embedded iframe:                                            │    │
│  │  https://your-app.com/chat?experiment_id=X&participant_id=Y  │    │
│  │  &session=1&condition=structured&memory=1                    │    │
│  └──────────────────────────┬──────────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CHATBOT PLATFORM                                │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────────┐    │
│  │   Frontend    │    │   Admin      │    │   API Routes       │    │
│  │   Chat UI     │◄──►│   Dashboard  │    │                    │    │
│  │   (React)     │    │   (React)    │    │  POST /api/chat    │    │
│  │              │    │              │    │  GET  /api/session  │    │
│  │  - Messages   │    │  - Experiments│    │  POST /api/extract │    │
│  │  - Input      │    │  - Prompts   │    │  GET  /api/export  │    │
│  │  - Session    │    │  - Data view │    │  CRUD /api/admin/* │    │
│  │    info       │    │  - Export    │    │                    │    │
│  └──────┬───────┘    └──────┬───────┘    └────────┬───────────┘    │
│         │                   │                     │                 │
│         └───────────────────┴─────────────────────┘                 │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    DATABASE (PostgreSQL / Supabase)           │   │
│  │                                                              │   │
│  │  experiments    │  conditions     │  prompts                 │   │
│  │  sessions       │  conversations  │  memory_statements       │   │
│  │  participants   │  embeddings     │  researchers             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL SERVICES                          │   │
│  │                                                              │   │
│  │  OpenAI API  │  Anthropic API  │  Custom LLM Endpoint       │   │
│  │  (GPT-4)     │  (Claude)       │  (Ollama, vLLM, etc.)      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | Full-stack React with API routes, SSR, easy deployment |
| **Frontend** | React 18+, Tailwind CSS | Component-based UI, utility-first styling |
| **Backend** | Next.js API Routes (Node.js) | Co-located with frontend, serverless-compatible |
| **Database** | Supabase (PostgreSQL + pgvector) | Managed Postgres, built-in auth, vector search, real-time |
| **LLM** | OpenAI SDK, Anthropic SDK | Multi-provider support via adapter pattern |
| **Embeddings** | OpenAI text-embedding-3-small or Supabase pgvector | Semantic memory retrieval |
| **Auth** | Supabase Auth (researchers) + URL params (participants) | Simple researcher auth, no participant auth needed |
| **Hosting** | Vercel / Railway / Self-hosted | Flexible deployment options |
| **Export** | Papa Parse (CSV), native JSON | Research-friendly data export |

---

## 4. Core System: Survey-Integrated Chatbot

### How It Works

The chatbot is a standalone web page that receives experiment parameters through URL query strings. Survey platforms (primarily Qualtrics) embed this page in an iframe or link to it, passing participant and condition data.

### URL Parameter Contract

```
https://your-app.com/chat?experiment_id=EXP001&participant_id=PROLIFIC_123&session=1&condition=structured&memory=1
```

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `experiment_id` | Yes | string | Unique experiment identifier |
| `participant_id` | Yes | string | Unique participant identifier (from Prolific, MTurk, etc.) |
| `session` | Yes | integer | Session number (1, 2, 3, ...) |
| `condition` | No | string | Experimental condition name (maps to a prompt template) |
| `memory` | No | `0` or `1` | Whether to inject memory from prior sessions (default: `0`) |

### Chat Flow

```
1. Page loads → parse URL parameters
2. Validate experiment_id exists in database
3. Load experiment config (prompts, limits, LLM settings)
4. Load condition-specific prompt template
5. If memory=1, fetch memory statements for this participant
6. Display seed/welcome message
7. User sends message → POST /api/chat
8. Backend: build system prompt + inject memory + call LLM
9. Store conversation in database
10. Return assistant response → display in UI
11. Repeat 7-10 until session limit reached
12. Display session-complete message
```

### Seed Messages

Each condition can have a custom **seed message** — the first message shown to the participant before they type anything. This is configured per condition in the admin dashboard.

Examples from the original system:
- Session 1: *"You have a free Saturday coming up and you'd like to make the most of it! I'd love to help you plan — let's start by getting to know your typical day..."*
- Session 2 (Structured): *"Welcome back! I'm here to help you plan a schedule for your upcoming Saturday..."*
- Session 2 (Exploratory): *"Welcome back! I'm here to help you get new inspiration for how to spend your upcoming Saturday..."*

---

## 5. Experiment Configuration Engine

### Experiment Model

An **experiment** is the top-level container. It defines:

```
Experiment
├── name: "Weekend Planning Study v2"
├── description: "2-session study on AI-assisted weekend planning"
├── status: active | paused | completed | draft
├── created_by: researcher_id
├── llm_provider: "openai" | "anthropic" | "custom"
├── llm_model: "gpt-4" | "claude-sonnet-4-5-20250929" | custom model ID
├── llm_temperature: 0.7
├── llm_max_tokens: 1024 (optional)
├── allowed_origins: ["https://stanforduniversity.qualtrics.com", ...]
├── sessions: [
│   ├── Session 1: { max_user_messages: null, max_llm_replies: 6 }
│   └── Session 2: { max_user_messages: 5, max_llm_replies: null }
│   ]
├── conditions: [
│   ├── Condition A: "structured" → prompt_id_1, seed_message_A
│   ├── Condition B: "exploratory" → prompt_id_2, seed_message_B
│   └── Condition C: "control" → prompt_id_3, seed_message_C
│   ]
└── memory_enabled: true | false
```

### Conditions

A **condition** is an experimental variant within an experiment. Each condition has:

- **Name**: Human-readable identifier (e.g., "structured", "exploratory")
- **Prompt Template**: Which system prompt to use (references a prompt by ID)
- **Seed Message**: The initial message shown to the participant
- **Per-Session Overrides**: Different prompts for different sessions within the same condition
- **Memory Settings**: Whether this condition uses memory injection

### Session Configuration

Each experiment defines one or more **sessions** (ordered interactions a participant goes through):

| Setting | Type | Description |
|---------|------|-------------|
| `session_number` | int | 1, 2, 3, ... |
| `max_user_messages` | int or null | Max messages participant can send (null = unlimited) |
| `max_llm_replies` | int or null | Max replies the LLM can give (null = unlimited) |
| `prompt_override` | prompt_id or null | Session-specific prompt (overrides condition default) |
| `memory_source_session` | int or null | Which prior session to pull memory from |
| `completion_message` | string | Message shown when session limits are reached |

---

## 6. Prompt Management System

### Prompt Model

Prompts are versioned, reusable system prompt templates:

```
Prompt
├── id: uuid
├── name: "Weekend Planning - Structured"
├── description: "Methodical planning prompt with closed-ended questions"
├── content: (the actual system prompt text — see below)
├── version: 3
├── created_by: researcher_id
├── created_at: timestamp
├── variables: ["participant_name", "session_number", "custom_instructions"]
└── tags: ["planning", "structured", "session2"]
```

### Prompt Templating

Prompts support **variable interpolation** using `{{variable}}` syntax:

```
You are a helpful assistant. The user wants to plan their upcoming Saturday.

{{#if memory_statements}}
This is what you know about the user from a previous conversation:
{{memory_statements}}

Use this information naturally in your responses when relevant.
Do not explicitly mention that you have this information unless asked.
{{/if}}

Help them create a concrete, organized plan with specific times and activities.
Be structured and methodical in your approach.

{{#if is_final_reply}}
This is your final reply. Do not ask any questions. Deliver the best complete plan you can based on what you have so far.
{{/if}}
```

**Available Template Variables:**

| Variable | Source | Description |
|----------|--------|-------------|
| `{{memory_statements}}` | Database | Bullet list of extracted facts from prior sessions |
| `{{is_final_reply}}` | Runtime | Boolean — true when LLM is at reply limit |
| `{{session_number}}` | URL param | Current session number |
| `{{participant_id}}` | URL param | Participant identifier |
| `{{condition_name}}` | Experiment config | Name of the assigned condition |
| `{{custom_instructions}}` | Condition config | Researcher-defined per-condition instructions |
| `{{reply_count}}` | Runtime | How many replies the LLM has given so far |
| `{{remaining_replies}}` | Runtime | How many replies the LLM has left |

### Prompt Versioning

- Every edit creates a new version (immutable history)
- Experiments reference a specific prompt version
- Researchers can compare prompt versions side-by-side
- Running experiments always use the version that was active when the experiment was started (prevents mid-experiment changes)

### Example Prompts (from original system)

**Session 1 — Weekend Planning Elicitation:**
```
You are helping a participant design a concrete plan for their upcoming Saturday.

You must do two things:
(1) Elicit information by asking questions that cover ALL of the following:
  - Typical day (work schedule, wake time, commitments)
  - Energy patterns across the day
  - Values in free time
  - What prevents good weekends (constraints, obligations, budget)
  - How they want the schedule presented (format/detail)

(2) Then co-create a specific Saturday plan that includes:
  - Timing (aligned with their wake-up preferences and energy patterns)
  - Specific activities
  - Constraint-aware choices
  - Presented in their preferred format

Turn limit: You may ask questions in replies 1–5. On your 6th reply,
do NOT ask any questions — deliver the best complete Saturday plan you can.
If details are missing, make reasonable assumptions and state them briefly.
```

**Session 2 — Structured Condition:**
```
You are a helpful assistant. The user wants to plan their upcoming Saturday
and develop a schedule or timetable.

Help them create a concrete, organized plan with specific times and activities.
Be structured and methodical in your approach.
First, ask 3–5 closed-ended questions to understand their constraints,
must-dos, location, budget, and energy level.
This should be conversational, not a list of questions.
Then, produce a time-block schedule with exactly six blocks, each with a
start time, end time, and a short rationale for the activity.
```

**Session 2 — Exploratory Condition:**
```
You are a helpful assistant. The user wants to get new inspiration for how
to spend their upcoming Saturday and brainstorm new ideas.

Help them explore possibilities and discover fresh ideas for their weekend.
Be creative and encouraging. Suggest diverse options they might not have considered.
Ask open-ended questions to spark their imagination and help them think outside the box.
Do not produce a schedule or timetable. Instead, organize suggestions into idea
clusters and include a short shortlisting step where you ask the user to choose
a direction. First, ask 3–5 open-ended questions about their mood, novelty-seeking,
social vs. solo preferences, and similar topics. This should be conversational.
Then, generate exactly six ideas organized into thematic clusters, and ask the
user to select a direction before going deeper.
```

---

## 7. Memory & Embeddings System

### Overview

The memory system allows chatbots in later sessions to "remember" facts about participants from earlier sessions. This is a key experimental feature — researchers can study how AI memory affects user experience and outcomes.

### Memory Pipeline

```
Session 1 Conversation
        │
        ▼
┌─────────────────────────┐
│  Memory Extraction       │  (Automatic or Manual)
│  - LLM parses transcript │
│  - Extracts key facts    │
│  - Stores as statements  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  memory_statements       │
│  - "Wakes up at 8 AM"   │
│  - "Prefers outdoors"   │
│  - "Budget: low-cost"   │
│  - "Works from home"    │
└───────────┬─────────────┘
            │
            ▼  (Session 2, if memory=1)
┌─────────────────────────┐
│  Memory Injection        │
│  - Fetch statements      │
│  - Format as bullet list │
│  - Inject into prompt    │
└─────────────────────────┘
```

### Automatic Memory Extraction

The original system populated memory statements manually/offline. The open-source version should automate this:

**Endpoint**: `POST /api/extract-memory`

**Process**:
1. Fetch the complete conversation transcript for a participant + session
2. Send to LLM with an extraction prompt:
   ```
   Extract key factual statements about this person from the following conversation.
   Return each fact as a separate bullet point. Focus on:
   - Preferences and values
   - Schedule and routine information
   - Constraints (budget, time, physical)
   - Personality traits revealed
   - Specific interests mentioned

   Return ONLY the bullet points, nothing else.
   ```
3. Parse the LLM response into individual statements
4. Store each statement in the `memory_statements` table
5. Optionally generate vector embeddings for each statement

**Trigger Options**:
- Automatic: Run extraction after session completion (when message limit reached)
- Manual: Researcher clicks "Extract Memory" in admin dashboard
- Batch: Researcher triggers extraction for all participants in an experiment

### Semantic Embeddings (P1)

For experiments with many memory statements per participant, simple "dump all facts" into the prompt is wasteful and may exceed token limits. Semantic embeddings solve this:

**Storage**: Use Supabase pgvector extension

**Process**:
1. When memory statements are created, generate embeddings via OpenAI `text-embedding-3-small`
2. Store embeddings alongside statements in the database
3. At memory injection time:
   a. Embed the current conversation context (last few messages)
   b. Find the top-K most relevant memory statements via cosine similarity
   c. Inject only the relevant statements into the prompt

**Configuration** (per experiment):
| Setting | Default | Description |
|---------|---------|-------------|
| `embedding_model` | `text-embedding-3-small` | Which embedding model to use |
| `memory_retrieval_mode` | `all` | `all` (inject everything) or `semantic` (use embeddings) |
| `memory_top_k` | 10 | How many statements to inject in semantic mode |
| `memory_similarity_threshold` | 0.7 | Minimum cosine similarity for inclusion |

### Memory Injection Format

When injecting memory into the system prompt, use this format:

```
This is what you know about the user from a previous conversation:
- Wakes up around 8 AM on Saturdays
- Values outdoor activities and physical exercise
- Budget constraint: prefers free or low-cost activities
- Introverted; prefers solo or small group activities
- Has a dog named Max that they like to take on walks
- Works from home with flexible schedule on weekdays

Use this information naturally in your responses when relevant.
Do not explicitly mention that you have this information unless asked.
```

---

## 8. Multi-Session Participant Tracking

### Session Model

Participants can go through multiple sessions within an experiment. The platform tracks:

```
Participant Journey:
  Session 1 (Day 1)  →  Memory Extraction  →  Session 2 (Day 7)  →  ...
       │                      │                      │
       ▼                      ▼                      ▼
  chat_sessions          memory_statements       chat_sessions
  (session=1)            (extracted facts)       (session=2)
```

### Session State Machine

```
NEW → ACTIVE → COMPLETED
         │
         └→ ABANDONED (no activity for configurable timeout)
```

### Participant Data Model

```
Participant (per experiment)
├── participant_id: "PROLIFIC_123"  (from URL, not platform-generated)
├── experiment_id: "EXP001"
├── condition: "structured"
├── sessions: [
│   ├── { session: 1, status: completed, messages: 12, started_at, completed_at }
│   └── { session: 2, status: active, messages: 3, started_at, completed_at: null }
│   ]
├── memory_statements: ["fact1", "fact2", ...]
└── metadata: { source: "prolific", recruited_at: timestamp }
```

### Cross-Session Continuity

When a participant returns for Session 2:

1. Platform looks up their Session 1 data by `participant_id` + `experiment_id`
2. If `memory=1`, fetches memory statements from Session 1
3. Loads Session 2-specific prompt template for their condition
4. Injects memory into the system prompt
5. Conversation starts fresh (no Session 1 messages in context) but with memory context

### Session Resumption

If a participant refreshes the page mid-session:
- Fetch existing conversation from database
- Display all prior messages
- Continue from where they left off
- Message count preserved (don't reset limits)

---

## 9. Admin Dashboard

### Dashboard Pages

#### 9.1 Experiments List (`/admin/experiments`)

- List all experiments with status badges (Draft, Active, Paused, Completed)
- Create new experiment button
- Quick stats: participant count, session count, completion rate
- Search and filter by status, date, researcher

#### 9.2 Experiment Builder (`/admin/experiments/new` or `/admin/experiments/:id/edit`)

**Step 1 — Basic Info:**
- Experiment name, description
- LLM provider and model selection
- Temperature and max token settings

**Step 2 — Sessions:**
- Define number of sessions (1, 2, 3, ...)
- Per-session: message limits, reply limits, completion message
- Memory settings: which session to pull memory from

**Step 3 — Conditions:**
- Add conditions (e.g., "structured", "exploratory", "control")
- Assign prompt templates to each condition
- Configure seed messages per condition per session
- Set condition-specific overrides (different LLM model, temperature, etc.)

**Step 4 — Integration:**
- Generate embed URLs for each condition
- CORS origin configuration
- Qualtrics setup instructions with copy-paste snippets
- Test mode: preview chatbot for each condition

#### 9.3 Prompt Library (`/admin/prompts`)

- List all prompts with tags and version history
- Create / edit / duplicate prompts
- Template variable reference
- Side-by-side version comparison
- "Try it" playground to test prompts with the LLM

#### 9.4 Participants View (`/admin/experiments/:id/participants`)

- Table of all participants with:
  - Participant ID
  - Condition assignment
  - Session completion status (checkmarks per session)
  - Total messages sent
  - Last active timestamp
- Click a participant to view full conversation transcript
- Bulk actions: export selected, extract memory for selected

#### 9.5 Conversation Viewer (`/admin/experiments/:id/participants/:pid/session/:sid`)

- Full conversation transcript in chat-bubble format
- Metadata sidebar: condition, memory status, message count, timestamps
- Memory statements panel (if extracted)
- Raw JSON view toggle

#### 9.6 Data Export (`/admin/experiments/:id/export`)

- Export formats: CSV, JSON, JSONL
- Export scopes:
  - All conversations
  - By condition
  - By session
  - By participant list
- Include/exclude options:
  - Timestamps
  - Memory statements
  - Metadata (condition, session, memory flag)
  - System prompts used
- Download or copy to clipboard

#### 9.7 Settings (`/admin/settings`)

- API keys management (OpenAI, Anthropic)
- Default LLM settings
- CORS whitelist management
- Account settings
- Team management (invite other researchers)

---

## 10. Data Export & Analytics

### Export Formats

**CSV Export** (one row per message):
```csv
experiment_id,participant_id,session,condition,memory_enabled,message_index,role,content,timestamp
EXP001,PROLIFIC_123,1,structured,false,0,assistant,"Welcome! Let's plan...",2026-02-10T10:00:00Z
EXP001,PROLIFIC_123,1,structured,false,1,user,"I usually wake up at 9",2026-02-10T10:01:00Z
EXP001,PROLIFIC_123,1,structured,false,2,assistant,"Great! So a 9am start...",2026-02-10T10:01:05Z
```

**JSON Export** (grouped by participant):
```json
[
  {
    "experiment_id": "EXP001",
    "participant_id": "PROLIFIC_123",
    "condition": "structured",
    "sessions": [
      {
        "session": 1,
        "memory_enabled": false,
        "started_at": "2026-02-10T10:00:00Z",
        "completed_at": "2026-02-10T10:15:00Z",
        "messages": [
          { "role": "assistant", "content": "Welcome!", "timestamp": "..." },
          { "role": "user", "content": "Hi!", "timestamp": "..." }
        ]
      }
    ],
    "memory_statements": [
      "Wakes up around 9 AM",
      "Prefers outdoor activities"
    ]
  }
]
```

**JSONL Export** (one JSON object per line — for large datasets):
```jsonl
{"participant_id":"P1","session":1,"role":"user","content":"Hi","timestamp":"..."}
{"participant_id":"P1","session":1,"role":"assistant","content":"Hello!","timestamp":"..."}
```

### Built-in Analytics (P2)

- Experiment summary: total participants, completion rates, avg messages per session
- Condition comparison: side-by-side stats across conditions
- Message length distribution by condition
- Session duration by condition
- Memory injection coverage (% of participants with memory statements)

---

## 11. Survey Platform Integration

### Qualtrics (Primary)

**Embedding Method 1 — iframe:**
```html
<!-- In Qualtrics question → HTML/JS -->
<iframe
  src="https://your-app.com/chat?experiment_id=${e://Field/experiment_id}&participant_id=${e://Field/prolific_id}&session=1&condition=${e://Field/condition}&memory=0"
  width="100%"
  height="600px"
  style="border: none;"
></iframe>
```

**Embedding Method 2 — External Link:**
```html
<a href="https://your-app.com/chat?experiment_id=EXP001&participant_id=${e://Field/prolific_id}&session=1&condition=structured"
   target="_blank">
  Click here to start the chat session
</a>
```

**Qualtrics Piped Text Variables:**
- `${e://Field/prolific_id}` — Participant ID
- `${e://Field/condition}` — Condition assignment (set via randomizer or embedded data)
- `${e://Field/experiment_id}` — Experiment ID (set as embedded data)

**CORS Requirements:**
- The backend must allow `https://<institution>.qualtrics.com` as an origin
- Configurable per experiment in the admin dashboard

### Other Platforms (Plugin Architecture)

The URL parameter contract is platform-agnostic. Any survey tool that can embed an iframe or link with URL parameters will work:

| Platform | Embedding Method |
|----------|-----------------|
| **Qualtrics** | iframe or external link with piped text |
| **REDCap** | Action tag with piped variables |
| **Google Forms** | Link with pre-filled URL parameters |
| **SurveyMonkey** | Custom embed with merge fields |
| **Gorilla** | External URL redirect with participant variables |
| **Pavlovia** | Redirect with participant info |
| **Custom** | Any platform that can construct a URL with parameters |

---

## 12. Authentication & Security

### Two Authentication Layers

**Layer 1 — Researcher Auth (Admin Dashboard):**
- Supabase Auth with email/password
- Protected routes: `/admin/*`
- Role-based: `owner` (full access) and `member` (view + export only)
- Session-based with secure cookies

**Layer 2 — Participant Auth (Chat Interface):**
- No traditional auth (no login required)
- Identification via `participant_id` URL parameter
- Data isolation: participants can only see their own conversations
- CORS restrictions prevent unauthorized embedding
- Optional: signed URLs with HMAC to prevent URL tampering

### Security Measures

| Measure | Implementation |
|---------|---------------|
| **API Key Protection** | All LLM API keys stored server-side only, never exposed to client |
| **CORS Whitelist** | Per-experiment allowed origins, enforced on all API routes |
| **Input Sanitization** | Sanitize all user inputs before storing or sending to LLM |
| **Rate Limiting** | Per-participant rate limits on chat API (prevent abuse) |
| **Data Isolation** | All queries filtered by `participant_id` — no cross-participant data leakage |
| **Environment Variables** | Sensitive config in env vars, never committed to repo |
| **SQL Injection Prevention** | Parameterized queries via Supabase client (never raw SQL) |
| **XSS Prevention** | React's built-in escaping + Content Security Policy headers |

### Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM Providers
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://your-app.com
SIGNING_SECRET=random-secret-for-hmac-url-signing  # Optional
```

---

## 13. Database Schema

### Entity Relationship Diagram

```
researchers ─────┐
                 │ 1:N
                 ▼
experiments ─────┬─── conditions ─── prompt_versions
                 │        │
                 │        │ N:M (via condition_sessions)
                 │        │
                 ├─── sessions_config
                 │
                 └─── participants
                         │
                         ├─── conversations (1 per session)
                         │       └─── messages
                         │
                         └─── memory_statements
                                 └─── embeddings (optional)
```

### Table Definitions

#### `researchers`
```sql
CREATE TABLE researchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `experiments`
```sql
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused, completed
  created_by UUID REFERENCES researchers(id),
  llm_provider TEXT NOT NULL DEFAULT 'openai', -- openai, anthropic, custom
  llm_model TEXT NOT NULL DEFAULT 'gpt-4',
  llm_temperature REAL DEFAULT 0.7,
  llm_max_tokens INTEGER,
  allowed_origins TEXT[] DEFAULT '{}',
  memory_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `conditions`
```sql
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "structured", "exploratory"
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `sessions_config`
```sql
CREATE TABLE sessions_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  max_user_messages INTEGER, -- null = unlimited
  max_llm_replies INTEGER, -- null = unlimited
  memory_source_session INTEGER, -- which prior session to pull memory from
  completion_message TEXT DEFAULT 'Thank you for completing this session.',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, session_number)
);
```

#### `condition_sessions` (prompt + seed per condition per session)
```sql
CREATE TABLE condition_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id UUID REFERENCES conditions(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  prompt_version_id UUID REFERENCES prompt_versions(id),
  seed_message TEXT, -- initial message shown to participant
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(condition_id, session_number)
);
```

#### `prompts`
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES researchers(id),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `prompt_versions`
```sql
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL, -- the actual prompt text with {{variables}}
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prompt_id, version)
);
```

#### `participants`
```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- prolific_id, mturk_id, etc.
  condition_id UUID REFERENCES conditions(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, external_id)
);
```

#### `conversations`
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, abandoned
  memory_enabled BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(participant_id, session_number)
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  token_count INTEGER, -- tracked for cost analysis
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

#### `memory_statements`
```sql
CREATE TABLE memory_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  source_session INTEGER NOT NULL, -- which session this was extracted from
  statement TEXT NOT NULL,
  embedding VECTOR(1536), -- pgvector for semantic search (nullable)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memory_participant ON memory_statements(participant_id, source_session);
```

---

## 14. API Specification

### Chat API

#### `POST /api/chat`

The main chat endpoint. Receives a message, generates a response, and stores both.

**Request:**
```json
{
  "experiment_id": "uuid",
  "participant_id": "PROLIFIC_123",
  "session": 1,
  "condition": "structured",
  "memory": true,
  "messages": [
    { "role": "user", "content": "I usually wake up at 9am on Saturdays" }
  ]
}
```

**Response (200):**
```json
{
  "message": "Great! A 9am start gives you plenty of time...",
  "session_status": "active",
  "messages_remaining": 4,
  "replies_remaining": 3
}
```

**Response (429 — Rate Limited):**
```json
{
  "error": "Too many requests. Please wait a moment."
}
```

**Response (403 — Session Limit Reached):**
```json
{
  "error": "Session message limit reached",
  "session_status": "completed"
}
```

**Processing Steps:**
1. Validate experiment exists and is active
2. Find or create participant record
3. Find or create conversation record for this session
4. Check message limits
5. Load condition-specific prompt template
6. Render template variables (memory, reply count, etc.)
7. Fetch full conversation history from database
8. Call LLM API with system prompt + conversation history
9. Store user message and assistant response
10. Check if session is now complete (limits reached)
11. Return assistant response with session status

#### `POST /api/extract-memory`

Extract memory statements from a completed session.

**Request:**
```json
{
  "experiment_id": "uuid",
  "participant_id": "PROLIFIC_123",
  "session": 1
}
```

**Response (200):**
```json
{
  "statements": [
    "Wakes up around 9 AM on Saturdays",
    "Prefers outdoor activities",
    "Budget: prefers free or low-cost options",
    "Has a dog named Max"
  ],
  "count": 4
}
```

#### `GET /api/session`

Get session status and metadata (used by frontend to resume sessions).

**Request:**
```
GET /api/session?experiment_id=X&participant_id=Y&session=1
```

**Response (200):**
```json
{
  "status": "active",
  "messages": [
    { "role": "assistant", "content": "Welcome!", "timestamp": "..." },
    { "role": "user", "content": "Hi", "timestamp": "..." }
  ],
  "messages_sent": 1,
  "messages_remaining": 4,
  "condition": "structured",
  "memory_enabled": false
}
```

### Admin API

#### `GET /api/admin/experiments`
List all experiments for the authenticated researcher.

#### `POST /api/admin/experiments`
Create a new experiment.

#### `GET /api/admin/experiments/:id`
Get experiment details including conditions and session configs.

#### `PUT /api/admin/experiments/:id`
Update experiment settings.

#### `GET /api/admin/experiments/:id/participants`
List all participants with session completion status.

#### `GET /api/admin/experiments/:id/export`
Export conversation data in specified format.

#### `CRUD /api/admin/prompts`
Full CRUD for prompt management.

#### `CRUD /api/admin/conditions`
Full CRUD for condition management within experiments.

---

## 15. Frontend Chat Interface

### Component Architecture

```
ChatPage (page.js)
├── ChatHeader
│   └── Session info, participant ID, experiment name
├── ChatMessages
│   ├── MessageBubble (assistant — left, light background)
│   ├── MessageBubble (user — right, blue background)
│   └── TypingIndicator (loading state)
├── ChatInput
│   ├── Textarea (auto-resize, Ctrl+Enter to send)
│   ├── SendButton (with loading spinner)
│   └── MessageLimitBanner (shown when approaching limit)
└── SessionComplete (overlay when session is done)
```

### UI Specifications

**Layout:**
- Full-height flex column
- Header: fixed top, white background, subtle border
- Messages: scrollable area, auto-scroll to latest message
- Input: fixed bottom, textarea + send button

**Message Bubbles:**
- Assistant: left-aligned, light gray background (#f3f4f6), rounded corners
- User: right-aligned, blue background (#2563eb), white text, rounded corners
- Timestamps: small gray text below each message (optional, configurable)

**Loading State:**
- Animated dots or spinner while waiting for LLM response
- Send button shows loading icon
- Input disabled during API call

**Session Complete:**
- Input disabled
- Placeholder text: "This session is complete. Thank you!"
- Optional: display completion message from experiment config

**Responsive:**
- Works in iframe (min-width: 320px)
- Works as standalone page
- Mobile-friendly input handling

### Customization Options (P2)

Researchers can customize via the admin dashboard:
- Primary color (default: blue #2563eb)
- Font family
- Header text
- Placeholder text
- Send button label
- Custom CSS injection

---

## 16. LLM Provider Integration

### Provider Adapter Pattern

```typescript
interface LLMProvider {
  chat(params: {
    model: string;
    systemMessage: string;
    messages: Message[];
    temperature: number;
    maxTokens?: number;
  }): Promise<{ content: string; tokenUsage: TokenUsage }>;

  extractMemory(transcript: Message[]): Promise<string[]>;

  generateEmbedding(text: string): Promise<number[]>;
}
```

### Supported Providers

#### OpenAI
```javascript
// Uses openai SDK
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: config.llm_model, // 'gpt-4', 'gpt-4o', 'gpt-4o-mini', etc.
  messages: [{ role: 'system', content: systemMessage }, ...messages],
  temperature: config.llm_temperature,
  max_tokens: config.llm_max_tokens
});
```

#### Anthropic
```javascript
// Uses @anthropic-ai/sdk
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: config.llm_model, // 'claude-sonnet-4-5-20250929', 'claude-opus-4-6', etc.
  system: systemMessage,
  messages: messages,
  temperature: config.llm_temperature,
  max_tokens: config.llm_max_tokens || 1024
});
```

#### Custom Endpoint
```javascript
// For self-hosted models (Ollama, vLLM, etc.)
const response = await fetch(config.custom_endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...config.custom_headers },
  body: JSON.stringify({
    model: config.llm_model,
    messages: [{ role: 'system', content: systemMessage }, ...messages],
    temperature: config.llm_temperature
  })
});
```

### Token Tracking

Every LLM call records:
- Input tokens (system prompt + conversation history)
- Output tokens (assistant response)
- Total cost estimate (based on provider pricing)
- Stored alongside the message for per-experiment cost analysis

---

## 17. Deployment & Infrastructure

### Option 1: Vercel (Recommended for simplicity)

```bash
# Clone the repository
git clone https://github.com/your-org/chatbot-experiment-platform.git
cd chatbot-experiment-platform

# Install dependencies
npm install

# Set up environment variables in Vercel Dashboard
# Deploy
vercel --prod
```

**Vercel Advantages:**
- Zero-config Next.js deployment
- Automatic SSL
- Serverless API routes (scale to zero)
- Preview deployments for PRs
- Free tier sufficient for small studies

### Option 2: Railway / Render

```bash
# Similar to Vercel but with persistent containers
# Better for self-hosted LLM endpoints
railway up
```

### Option 3: Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### Supabase Setup

```bash
# Option A: Hosted Supabase (recommended)
# 1. Create project at supabase.com
# 2. Run migrations (provided in /supabase/migrations/)
# 3. Enable pgvector extension
# 4. Copy API keys to environment variables

# Option B: Self-hosted Supabase
docker-compose -f supabase-docker-compose.yml up
```

### One-Click Deploy

The README should include a "Deploy to Vercel" button:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/chatbot-experiment-platform&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY)
```

---

## 18. Developer Experience

### Repository Structure

```
chatbot-experiment-platform/
├── app/
│   ├── (chat)/                  # Chat interface (participant-facing)
│   │   ├── chat/
│   │   │   └── page.js          # Main chat page
│   │   └── layout.js            # Chat layout (minimal)
│   ├── (admin)/                 # Admin dashboard (researcher-facing)
│   │   ├── admin/
│   │   │   ├── layout.js        # Admin layout (sidebar nav)
│   │   │   ├── page.js          # Dashboard home
│   │   │   ├── experiments/
│   │   │   │   ├── page.js      # Experiment list
│   │   │   │   ├── new/page.js  # Create experiment
│   │   │   │   └── [id]/
│   │   │   │       ├── page.js  # Experiment detail
│   │   │   │       ├── edit/page.js
│   │   │   │       ├── participants/page.js
│   │   │   │       └── export/page.js
│   │   │   ├── prompts/
│   │   │   │   ├── page.js      # Prompt library
│   │   │   │   └── [id]/page.js # Prompt editor
│   │   │   └── settings/
│   │   │       └── page.js      # Platform settings
│   │   └── login/
│   │       └── page.js          # Researcher login
│   ├── api/
│   │   ├── chat/route.js        # POST - main chat endpoint
│   │   ├── session/route.js     # GET - session status / resume
│   │   ├── extract-memory/route.js  # POST - memory extraction
│   │   └── admin/               # Admin API routes
│   │       ├── experiments/route.js
│   │       ├── prompts/route.js
│   │       ├── participants/route.js
│   │       └── export/route.js
│   ├── globals.css
│   └── layout.js                # Root layout
├── components/
│   ├── chat/
│   │   ├── ChatMessages.jsx
│   │   ├── ChatInput.jsx
│   │   ├── MessageBubble.jsx
│   │   └── TypingIndicator.jsx
│   ├── admin/
│   │   ├── Sidebar.jsx
│   │   ├── ExperimentCard.jsx
│   │   ├── PromptEditor.jsx
│   │   ├── ParticipantTable.jsx
│   │   ├── ConversationViewer.jsx
│   │   └── ExportDialog.jsx
│   └── ui/                      # Shared UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       ├── Table.jsx
│       ├── Badge.jsx
│       └── Modal.jsx
├── lib/
│   ├── supabase-client.js       # Client-side Supabase
│   ├── supabase-server.js       # Server-side Supabase
│   ├── llm/
│   │   ├── index.js             # LLM provider factory
│   │   ├── openai.js            # OpenAI adapter
│   │   ├── anthropic.js         # Anthropic adapter
│   │   └── custom.js            # Custom endpoint adapter
│   ├── prompts/
│   │   └── renderer.js          # Template variable rendering
│   ├── memory/
│   │   ├── extractor.js         # Memory extraction logic
│   │   └── retriever.js         # Memory retrieval (all or semantic)
│   └── utils/
│       ├── cors.js              # CORS helper
│       └── validation.js        # Input validation
├── supabase/
│   └── migrations/
│       ├── 001_create_tables.sql
│       ├── 002_enable_pgvector.sql
│       └── 003_seed_data.sql
├── public/
│   └── favicon.ico
├── .env.example                 # Template for environment variables
├── .gitignore
├── package.json
├── tailwind.config.js
├── next.config.js
├── README.md                    # Setup guide + documentation
├── CONTRIBUTING.md
├── LICENSE                      # MIT
└── docker-compose.yml           # Self-hosted option
```

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/chatbot-experiment-platform.git
cd chatbot-experiment-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and OpenAI credentials

# 4. Set up database
# Option A: Use hosted Supabase and run migrations via dashboard
# Option B: Use Supabase CLI
npx supabase start
npx supabase db push

# 5. Start development server
npm run dev
# App runs at http://localhost:3000
# Admin dashboard at http://localhost:3000/admin
# Chat interface at http://localhost:3000/chat?experiment_id=...

# 6. Test chat interface
# Open: http://localhost:3000/chat?experiment_id=test&participant_id=test1&session=1&condition=default
```

### Testing

```bash
# Unit tests (vitest)
npm run test

# E2E tests (playwright)
npm run test:e2e

# Type checking (if using TypeScript in future)
npm run typecheck
```

---

## 19. Implementation Phases

### Phase 1: Core Platform (MVP)

**Goal**: Replicate the original system's functionality in a generalized, configurable way.

**Tasks:**

1. **Project scaffolding**
   - Next.js 14 app with App Router
   - Tailwind CSS setup
   - Supabase client configuration
   - Environment variable template

2. **Database setup**
   - Create all tables (experiments, conditions, sessions_config, condition_sessions, prompts, prompt_versions, participants, conversations, messages, memory_statements)
   - Write SQL migrations
   - Seed data for testing

3. **Chat interface** (`/chat`)
   - URL parameter parsing (experiment_id, participant_id, session, condition, memory)
   - Message display with chat bubbles
   - Text input with send button (Ctrl+Enter)
   - Auto-scroll to latest message
   - Loading indicator during LLM response
   - Session resumption (fetch existing messages on page load)
   - Message limit enforcement (disable input when limit reached)
   - Session completion message

4. **Chat API** (`POST /api/chat`)
   - Validate experiment and load configuration
   - Find or create participant and conversation records
   - Load condition-specific prompt template
   - Render template variables
   - Inject memory statements if enabled
   - Enforce reply limits (append final-reply instruction to prompt)
   - Call OpenAI API
   - Store messages in database
   - Return response with session status

5. **Session API** (`GET /api/session`)
   - Return existing conversation messages for resumption
   - Return session status and message counts

6. **Basic prompt management**
   - Prompts table with versioning
   - Template variable rendering ({{memory_statements}}, {{is_final_reply}}, etc.)

7. **Memory injection** (basic — all statements)
   - Fetch all memory_statements for participant
   - Format as bullet list
   - Inject into system prompt

8. **CORS handling**
   - Read allowed_origins from experiment config
   - Apply CORS headers on all API routes

---

### Phase 2: Admin Dashboard

**Goal**: Give researchers a web UI to manage everything.

**Tasks:**

1. **Researcher authentication**
   - Supabase Auth (email/password)
   - Login page at `/admin/login`
   - Protected routes middleware for `/admin/*`

2. **Experiment management**
   - List experiments with status badges
   - Create experiment wizard (basic info → sessions → conditions → integration)
   - Edit experiment settings
   - Activate / pause / complete experiments

3. **Condition management**
   - Add/edit/delete conditions within an experiment
   - Assign prompts to conditions per session
   - Configure seed messages

4. **Prompt library**
   - List all prompts with search and tags
   - Create / edit prompts with syntax highlighting
   - Version history with diff view
   - Template variable reference panel

5. **Participant viewer**
   - Table of participants per experiment
   - Session completion status indicators
   - Click-through to conversation viewer

6. **Conversation viewer**
   - Full transcript in chat-bubble format
   - Metadata sidebar
   - Raw JSON toggle

7. **Data export**
   - CSV and JSON export
   - Filter by condition, session, participant list
   - Include/exclude metadata options

8. **Integration guide**
   - Generate embed URLs for Qualtrics
   - Copy-paste iframe snippets
   - CORS configuration UI

---

### Phase 3: Memory & Embeddings

**Goal**: Automated memory extraction and semantic retrieval.

**Tasks:**

1. **Automatic memory extraction**
   - `POST /api/extract-memory` endpoint
   - LLM-based fact extraction from transcripts
   - Admin UI: "Extract Memory" button per participant or batch
   - Auto-trigger option on session completion

2. **Memory review UI**
   - View extracted statements per participant
   - Edit / delete statements
   - Manual statement addition

3. **Vector embeddings**
   - Enable pgvector extension in Supabase
   - Generate embeddings for memory statements via OpenAI
   - Semantic retrieval: embed conversation context → find top-K relevant memories
   - Configuration: retrieval mode (all vs. semantic), top-K, similarity threshold

4. **Memory analytics**
   - Coverage stats: % of participants with memory extracted
   - Statement count distributions
   - Memory injection preview (see what the LLM "remembers")

---

### Phase 4: Multi-Provider & Advanced Features

**Goal**: Support multiple LLM providers and power-user features.

**Tasks:**

1. **Anthropic Claude support**
   - Anthropic SDK integration
   - Provider selection per experiment in admin UI

2. **Custom LLM endpoint**
   - Support any OpenAI-compatible API (Ollama, vLLM, Together, etc.)
   - Custom endpoint URL, headers, model name configuration

3. **Response streaming** (P2)
   - Stream LLM responses via Server-Sent Events
   - Token-by-token display in chat UI

4. **Token usage tracking**
   - Record input/output tokens per message
   - Cost estimates per experiment
   - Dashboard charts for token usage

5. **Chat widget customization**
   - Theme editor (colors, fonts)
   - Custom CSS injection
   - Header text customization

6. **Webhook notifications**
   - Fire webhook on session completion
   - Configurable endpoint per experiment
   - Useful for triggering Qualtrics survey flow advancement

7. **Real-time monitoring** (P2)
   - Live view of active sessions
   - Message count ticker
   - Error alerts

---

## 20. Reference: Original System Analysis

This section documents the original GSB system that this open-source project is based on. It serves as both a reference and a test case — the open-source platform should be able to fully replicate this experiment.

### Original Experiment Design

**Research Context**: Stanford GSB study on AI-assisted weekend planning

**Experiment Structure**:
- **Session 1** (all participants): Open-ended weekend planning conversation. The AI elicits information about the participant's schedule, preferences, constraints, and energy patterns, then produces a Saturday plan. 6-reply limit for the AI.
- **Session 2** (condition-dependent): Follow-up session where the AI helps with a specific task. Participants assigned to either:
  - **Structured condition**: Methodical planning with closed-ended questions → 6-block timetable
  - **Exploratory condition**: Creative brainstorming with open-ended questions → 6 idea clusters
- **Memory manipulation**: Half of Session 2 participants get memory injection (facts from Session 1), half don't

**Participant Sourcing**: Prolific Academic (participant IDs passed as `prolific_id`)

**Survey Platform**: Qualtrics (Stanford instance: `stanforduniversity.qualtrics.com`)

### Original Technical Implementation

| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | Next.js 14.2.5 | App Router |
| LLM | OpenAI GPT-4 | Temperature 0.7 |
| Database | Supabase | 3 tables: chat_sessions, chat_sessions_2, memory_statements |
| Hosting | Vercel | Two instances: gsb-gray, gsb-session1 |
| Auth | None (Prolific ID only) | No researcher dashboard |
| Memory | Manual extraction | Statements stored as simple strings, all injected |
| Export | Manual DB queries | No built-in export |
| Prompts | Hardcoded in route.js | No admin UI or versioning |

### What the Open-Source Version Improves

| Limitation | Open-Source Solution |
|-----------|---------------------|
| Hardcoded prompts in source code | Admin UI prompt management with versioning |
| Single experiment support | Multi-experiment with conditions |
| Manual memory extraction | Automated LLM-based extraction |
| No admin dashboard | Full researcher dashboard |
| No data export | CSV/JSON/JSONL export with filters |
| OpenAI only | Multi-provider (OpenAI, Anthropic, custom) |
| No session resumption | Fetch and display prior messages on page load |
| Two separate Vercel deployments | Single deployment, multi-experiment |
| Separate tables per session | Unified schema with session numbering |
| No auth for researchers | Supabase Auth for admin access |
| CORS hardcoded | Configurable per experiment |
| No embeddings | pgvector semantic memory retrieval |
| No monitoring | Real-time session monitoring |
| No cost tracking | Token usage and cost analytics |

---

## Quick Start Guide (for README.md)

```markdown
# Chatbot Experiment Platform

Open-source platform for running AI chatbot experiments embedded in survey tools like Qualtrics.

## Features
- Embed AI chatbots in Qualtrics surveys
- Configure experimental conditions with different prompts
- Track participants across multiple sessions
- Cross-session memory with semantic embeddings
- Admin dashboard for experiment management
- Export conversation data for analysis
- Support for OpenAI, Anthropic, and custom LLMs

## Quick Start

1. Clone this repo
2. Create a Supabase project at supabase.com
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Run `npm install && npm run dev`
5. Open http://localhost:3000/admin to create your first experiment
6. Embed the chat URL in your Qualtrics survey

## Documentation
- [Setup Guide](docs/setup.md)
- [Qualtrics Integration](docs/qualtrics.md)
- [Creating Experiments](docs/experiments.md)
- [Memory & Embeddings](docs/memory.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)

## License
MIT
```

---

*This specification was generated by analyzing the GSB chatbot codebase and generalizing its patterns into a reusable open-source platform. Every feature described here is either directly implemented in the original system or is a natural extension that researchers would need.*
