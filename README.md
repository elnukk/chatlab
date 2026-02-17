# ChatLab

An open-source platform for embedding AI chatbot experiments in Qualtrics surveys.

**Live:** [https://app.vercel.app](https://app.vercel.app)

---

## What it does

ChatLab lets researchers create chatbot experiments with a system prompt, embed them in Qualtrics surveys via iframe, and collect conversation data. Any URL parameter becomes a template variable in the system prompt.

### Template variables

Write a system prompt using `{{variable_name}}` placeholders:

```
You are a {{persona}} assistant who helps with {{topic}}.

{{#if style}}Respond in a {{style}} tone.{{/if}}
```

Then pass values through URL parameters:

```
/chat?experiment_id=abc&participant_id=123&persona=friendly&topic=cooking&style=casual
```

Every parameter except `experiment_id` and `participant_id` becomes a template variable. This works with Qualtrics piped text (`${e://Field/condition}`) for between-subjects designs.

## Using ChatLab

If you just want to run experiments, go to the live site and create an account. No setup needed.

1. Sign up at the live link above
2. Create an experiment: write a system prompt, set the LLM provider, and add your API key
3. Activate the experiment
4. Embed the chat URL in a Qualtrics survey iframe
5. View conversations and export data from the admin dashboard

## Self-hosting / Contributing

The sections below are only relevant if you want to run your own instance or contribute to the codebase.

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### Install

```bash
git clone https://github.com/your-username/os-gpt.git
cd os-gpt
npm install
```

### Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database

The SQL migrations are not in the repo. You can find them in the `supabase/migrations/` folder of the deployed instance, or request them from a maintainer. Run them in order in the Supabase SQL editor:

1. `001_create_tables.sql`
2. `003_seed_data.sql` (optional demo data)
3. `005_feedback_table.sql`

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** (App Router)
- **Supabase** (auth, database)
- **Tailwind CSS**
- **OpenAI / Anthropic** APIs

## Contributing

This is an early-stage research tool. Contributions are welcome.

- Open an issue to report bugs or suggest features
- Fork the repo and submit a pull request
- See the codebase structure below for orientation

### Project structure

```
app/
  page.js                  # Homepage
  (chat)/chat/page.js      # Participant chat interface
  (admin)/login/page.js    # Researcher login
  (admin)/admin/           # Admin dashboard, experiments, settings
  api/                     # API routes (chat, session, experiments, feedback)
components/
  chat/                    # Chat UI (MessageBubble, ChatInput, etc.)
  admin/                   # Admin UI (Sidebar, ExperimentCard, etc.)
  ui/                      # Reusable UI components
lib/
  llm/                     # LLM provider adapters (OpenAI, Anthropic)
  supabase*.js             # Supabase client helpers
  prompts.js               # Template variable rendering
supabase/
  migrations/              # SQL migrations
```

## License

MIT
