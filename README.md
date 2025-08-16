# Chatbot App – Nhost + Hasura + n8n + OpenRouter

This is a complete, GraphQL-only chatbot app that meets the assessment requirements.

## Stack
- **Auth**: Nhost email/password
- **DB/GraphQL**: Hasura (Postgres)
- **Actions**: Hasura Action → n8n webhook
- **Automation**: n8n workflow calls OpenRouter and writes back to DB
- **Frontend**: React (Vite) + @nhost/react-apollo (GraphQL queries/mutations/subscriptions only)
- **Hosting**: Netlify (frontend)

---

## 1) Nhost & Hasura Setup

1. Create a free **Nhost** project (subdomain + region).
2. Open the **Hasura Console** from Nhost dashboard.

### Create Tables (run in Hasura SQL console)
Execute `hasura/schema.sql`:

```sql

-- Enable UUID if needed (Nhost PG has it enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional PG indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id_created_at ON public.chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON public.messages(chat_id, created_at DESC);

```

### Track Foreign Keys & Relationships
- In Hasura Console → Data → Track the `messages.chat_id -> chats.id` relationship.
- This creates an object relationship `messages.chat` automatically.

### Permissions
Open `hasura/permissions.md` and apply exactly as written for role `user`.

### Hasura Action: `sendMessage`
1. In Hasura Console → Actions → Create.
2. **SDL** (Types & Action): use `hasura/action_sdl.graphql`.
3. **Handler (webhook)**: use the **Production URL** of your n8n Webhook node (from `n8n/workflow.json` after import).
4. **Forward client headers**: **ON** (so `x-hasura-user-id` reaches n8n).
5. **Permissions**: allow only role `user` to execute `sendMessage`.

> The Action returns a single field: `reply`.

---

## 2) n8n Workflow

1. Import `n8n/workflow.json` into n8n.
2. Create n8n **Credentials** (Environment variables or directly in nodes):
   - `HASURA_GRAPHQL_ENDPOINT` (e.g. from Nhost)
   - `HASURA_ADMIN_SECRET`
   - `OPENROUTER_API_KEY`
3. Open the Webhook node, copy the **Production URL** and put it into Hasura Action handler.
4. **Activate** the workflow.

What it does:
- Validates the caller owns the `chat_id` (GraphQL query to Hasura).
- Fetches recent messages for context.
- Calls **OpenRouter** (free model) to generate a reply.
- Inserts the bot's reply into `messages` via Hasura GraphQL.
- Returns the reply to Hasura Action.

---

## 3) Frontend (Vite + React + Nhost)

### Environment
Copy `frontend/.env.example` to `frontend/.env` and fill:
```
VITE_NHOST_SUBDOMAIN=YOUR_SUBDOMAIN
VITE_NHOST_REGION=YOUR_REGION
```
Nhost SDK will infer GraphQL & WS endpoints automatically.

### Install & Run
```bash
cd frontend
npm i
npm run dev
```
To build for Netlify:
```bash
npm run build
```
Deploy `frontend/dist` to Netlify, or connect the repo to Netlify directly.

---

## 4) Required GraphQL-only Behaviors

- **All** frontend calls use GraphQL (queries/mutations/subscriptions).
- **No** REST calls from frontend.
- The **Action** `sendMessage` is the only way the chatbot is triggered.
- **n8n** handles all external API calls (OpenRouter).

---

## 5) Demo Flow

1. Sign up / Sign in.
2. Create a chat → it appears in the chat list (subscription).
3. Open a chat, type a message:
   - Frontend inserts the user message (GraphQL mutation).
   - Frontend calls the `sendMessage` Action (GraphQL mutation).
   - n8n generates a reply, inserts bot message, returns `reply`.
   - Messages list updates in real-time (subscription).

---

## 6) Netlify

Use `frontend/netlify.toml` for SPA redirect rules.

---

## 7) Submission Template

```
Name: Your Name
Contact: Your Number
Deployed: https://<your-netlify-app>.netlify.app/
```
