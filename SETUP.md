# Setup Guide — Philosopher Coach

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### Required: Supabase

1. Go to https://supabase.com/dashboard → create a new project (or use an existing one)
2. Go to **Project Settings → API** and copy:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

3. Run the migration: Go to **SQL Editor** in the Supabase dashboard, paste the contents of `supabase/migrations/001_initial_schema.sql`, and run it.

4. Enable Google OAuth (optional): Go to **Authentication → Providers → Google** and configure with your Google Cloud credentials.

### Required: LLM Provider (pick one)

Set the provider and model, then add the API key for that provider:

```env
# Option A: Anthropic (default)
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=sk-ant-...

# Option B: OpenAI
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
OPENAI_API_KEY=sk-...

# Option C: Google
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Get your API key from:
- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- Google: https://aistudio.google.com/apikey

## Running the App

```bash
bun dev --port 3030
```
