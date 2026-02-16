# Architecture — Philosopher Coach

---

## 1. LLM Abstraction Layer

### Strategy: Vercel AI SDK

We use the [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` package) which provides a unified interface across LLM providers. Switching providers is an env var change + installing the provider package.

### Provider Setup

```bash
# Install core + desired providers
bun add ai
bun add @ai-sdk/anthropic    # For Claude
bun add @ai-sdk/openai       # For OpenAI / GPT
bun add @ai-sdk/google       # For Google Gemini
```

### Environment Config

```env
# .env.local — switch provider by changing these two values
LLM_PROVIDER=anthropic                          # "anthropic" | "openai" | "google"
LLM_MODEL=claude-sonnet-4-20250514         # Model ID for the chosen provider

# Provider API Keys (only the active one needs to be set)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Provider Factory — `/src/lib/llm/provider.ts`

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

const providers = {
  anthropic,
  openai,
  google,
} as const;

type ProviderKey = keyof typeof providers;

export function getModel() {
  const providerKey = (process.env.LLM_PROVIDER || "anthropic") as ProviderKey;
  const modelId = process.env.LLM_MODEL || "claude-sonnet-4-20250514";
  const provider = providers[providerKey];

  if (!provider) {
    throw new Error(`Unknown LLM provider: ${providerKey}. Valid: ${Object.keys(providers).join(", ")}`);
  }

  return provider(modelId);
}
```

### Usage in API Routes — `/src/app/api/chat/route.ts`

```typescript
import { streamText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { coachSystemPrompt } from "@/lib/llm/prompts";

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: getModel(),
    system: coachSystemPrompt(context),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Structured Output for Widget Generation — `/src/app/api/generate-widget/route.ts`

```typescript
import { generateObject } from "ai";
import { getModel } from "@/lib/llm/provider";
import { widgetSchema } from "@/lib/llm/schemas";

export async function POST(req: Request) {
  const { mood, context, sessionHistory } = await req.json();

  const { object } = await generateObject({
    model: getModel(),
    schema: widgetSchema,
    prompt: `Based on the user's mood (${mood}) and context, generate an appropriate interactive widget...`,
  });

  return Response.json(object);
}
```

### Prompt Management — `/src/lib/llm/prompts.ts`

Store all system prompts here. Each prompt is a function that accepts context and returns a string. This keeps prompts version-controlled and testable.

Key prompts to implement:
- `coachSystemPrompt(context)` — Main coaching conversation
- `widgetGeneratorPrompt(mood, goals)` — Generates widget configs
- `onboardingAnalysisPrompt(responses)` — Analyzes initial assessment
- `journalReflectionPrompt(entry, history)` — Reflects on journal entries
- `philosopherMatchPrompt(situation)` — Matches user to relevant philosophers

### Schema Validation — `/src/lib/llm/schemas.ts`

Use Zod schemas for ALL structured LLM outputs:

```typescript
import { z } from "zod";

export const widgetSchema = z.object({
  type: z.enum([
    "breathing_exercise",
    "reflection_prompt",
    "philosophical_dilemma",
    "gratitude_list",
    "mood_reframe",
    "stoic_meditation",
    "thought_experiment",
    "daily_maxim",
    "progress_visualization",
  ]),
  title: z.string(),
  description: z.string(),
  content: z.record(z.unknown()), // Type-specific content validated per widget type
  philosopher: z.object({
    name: z.string(),
    school: z.string(),
    relevance: z.string(),
  }).optional(),
  followUp: z.string().optional(),
});

export const coachResponseSchema = z.object({
  message: z.string(),
  suggestedWidgets: z.array(widgetSchema).max(3),
  moodAssessment: z.object({
    detected: z.string(),
    confidence: z.number().min(0).max(1),
    shift: z.enum(["improving", "stable", "declining"]).optional(),
  }),
  philosophicalContext: z.object({
    school: z.string(),
    concept: z.string(),
    practicalApplication: z.string(),
  }).optional(),
});
```

---

## 2. Supabase Schema

### Tables

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  philosophical_profile JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
  credits_remaining INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaching sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  initial_mood JSONB,
  final_mood JSONB,
  messages JSONB DEFAULT '[]',
  widgets_generated JSONB DEFAULT '[]',
  philosophers_referenced TEXT[] DEFAULT '{}',
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  mood_before JSONB,
  mood_after JSONB,
  philosophical_tags TEXT[] DEFAULT '{}',
  ai_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs (granular tracking)
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  mood_vector JSONB NOT NULL, -- { x: -1 to 1, y: -1 to 1 } or multi-dimensional
  mood_label TEXT,
  intensity SMALLINT CHECK (intensity BETWEEN 1 AND 10),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Philosophical journey / progress
CREATE TABLE philosophical_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL, -- "stoicism", "existentialism", "buddhism", etc.
  philosopher TEXT,
  concept TEXT NOT NULL,
  mastery_level SMALLINT DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  exercises_completed INTEGER DEFAULT 0,
  notes TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached widget templates (for free tier / common problems)
CREATE TABLE widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  mood_tags TEXT[] NOT NULL,
  content JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE philosophical_paths ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users manage own journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own moods" ON mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own paths" ON philosophical_paths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone reads widget templates" ON widget_templates FOR SELECT TO authenticated USING (true);
```

### Supabase Client Setup — `/src/lib/supabase/`

```
/src/lib/supabase/
  client.ts        — Browser client (createBrowserClient)
  server.ts        — Server component client (createServerClient with cookies)
  middleware.ts     — Auth middleware for protected routes
  types.ts         — Generated types from Supabase CLI
```

Use `@supabase/ssr` for Next.js App Router integration. Follow the official Supabase + Next.js guide.

---

## 3. Project Directory Structure

```
/
├── CLAUDE.md                          # Claude Code instructions (root)
├── docs/
│   ├── DESIGN_SYSTEM.md              # Immutable design tokens
│   ├── ARCHITECTURE.md               # This file
│   └── PRD.md                        # Product requirements
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Design tokens + base styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts     # Supabase OAuth callback
│   │   ├── onboarding/
│   │   │   └── page.tsx              # Multi-step onboarding
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main hub
│   │   ├── session/
│   │   │   └── [id]/page.tsx         # Coaching session
│   │   ├── journal/
│   │   │   ├── page.tsx              # Journal list
│   │   │   └── [id]/page.tsx         # Single entry
│   │   ├── explore/
│   │   │   ├── page.tsx              # Browse philosophers
│   │   │   └── [school]/page.tsx     # School detail
│   │   ├── profile/
│   │   │   └── page.tsx              # Settings + history
│   │   └── api/
│   │       ├── chat/route.ts         # Streaming coaching chat
│   │       ├── generate-widget/route.ts
│   │       └── analyze-mood/route.ts
│   ├── components/
│   │   ├── ui/                       # shadcn components (DO NOT MODIFY STYLES — only apply design tokens via tailwind config)
│   │   ├── core/                     # App-specific composed components
│   │   │   ├── MoodWheel.tsx         # Visual mood selector
│   │   │   ├── PhilosopherCard.tsx
│   │   │   ├── QuoteBlock.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   ├── StreakIndicator.tsx
│   │   │   └── MoodTimeline.tsx
│   │   ├── widgets/                  # Dynamically rendered by LLM
│   │   │   ├── WidgetRenderer.tsx    # Takes widget config → renders correct component
│   │   │   ├── BreathingExercise.tsx
│   │   │   ├── ReflectionPrompt.tsx
│   │   │   ├── PhilosophicalDilemma.tsx
│   │   │   ├── GratitudeList.tsx
│   │   │   ├── MoodReframe.tsx
│   │   │   ├── StoicMeditation.tsx
│   │   │   ├── ThoughtExperiment.tsx
│   │   │   ├── DailyMaxim.tsx
│   │   │   └── ProgressVisualization.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AppShell.tsx
│   │   │   └── Footer.tsx
│   │   └── chat/
│   │       ├── ChatContainer.tsx
│   │       ├── ChatMessage.tsx
│   │       ├── ChatInput.tsx
│   │       └── WidgetInChat.tsx      # Renders widgets inline in chat
│   ├── lib/
│   │   ├── llm/
│   │   │   ├── provider.ts          # Provider factory
│   │   │   ├── prompts.ts           # All system prompts
│   │   │   └── schemas.ts           # Zod schemas for LLM output
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── philosophy/
│   │   │   ├── schools.ts           # Philosophical school definitions
│   │   │   ├── philosophers.ts      # Philosopher profiles + quotes
│   │   │   └── mood-mapping.ts      # Mood → philosophy matching logic
│   │   └── utils/
│   │       ├── cn.ts                # clsx + tailwind-merge
│   │       └── credits.ts           # Credit calculation logic
│   ├── hooks/
│   │   ├── useChat.ts               # Chat state management
│   │   ├── useMood.ts               # Mood tracking state
│   │   ├── useSession.ts            # Session management
│   │   └── useCredits.ts            # Credit balance
│   └── types/
│       ├── mood.ts
│       ├── session.ts
│       ├── widget.ts
│       └── philosophy.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # The SQL from above
├── public/
│   └── fonts/                       # Self-hosted fonts (optional if using Google Fonts)
├── .env.example
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── bun.lock
```

---

## 4. Philosophical Data Model

### Schools of Philosophy

The app covers these schools, each with associated mood ranges and approaches:

```typescript
export const philosophicalSchools = {
  stoicism: {
    name: "Stoicism",
    era: "Ancient Greece/Rome",
    core: "Focus on what you can control, accept what you cannot",
    bestFor: ["anxiety", "anger", "frustration", "uncertainty"],
    philosophers: ["Marcus Aurelius", "Epictetus", "Seneca"],
    color: "slate",
  },
  existentialism: {
    name: "Existentialism",
    era: "19th-20th Century",
    core: "Create your own meaning through authentic choices",
    bestFor: ["meaninglessness", "identity_crisis", "major_decisions"],
    philosophers: ["Kierkegaard", "Sartre", "Camus", "de Beauvoir"],
    color: "ink",
  },
  buddhism: {
    name: "Buddhist Philosophy",
    era: "Ancient India",
    core: "Suffering arises from attachment; mindfulness brings peace",
    bestFor: ["attachment", "grief", "restlessness", "overthinking"],
    philosophers: ["Siddhartha Gautama", "Thich Nhat Hanh", "Pema Chödrön"],
    color: "sage",
  },
  absurdism: {
    name: "Absurdism",
    era: "20th Century",
    core: "Embrace the absurd, find joy despite meaninglessness",
    bestFor: ["despair", "cynicism", "burnout", "dark_humor"],
    philosophers: ["Albert Camus", "Thomas Nagel"],
    color: "warm",
  },
  taoism: {
    name: "Taoism",
    era: "Ancient China",
    core: "Flow with nature, embrace simplicity and balance",
    bestFor: ["overwhelm", "perfectionism", "control_issues", "burnout"],
    philosophers: ["Laozi", "Zhuangzi"],
    color: "sage",
  },
  epicureanism: {
    name: "Epicureanism",
    era: "Ancient Greece",
    core: "Pursue simple pleasures, avoid unnecessary pain",
    bestFor: ["hedonic_treadmill", "materialism", "social_pressure"],
    philosophers: ["Epicurus", "Lucretius"],
    color: "warm",
  },
  pragmatism: {
    name: "Pragmatism",
    era: "19th-20th Century America",
    core: "Truth is what works; focus on practical outcomes",
    bestFor: ["analysis_paralysis", "perfectionism", "indecision"],
    philosophers: ["William James", "John Dewey", "Charles Peirce"],
    color: "slate",
  },
} as const;
```

---

## 5. Widget System Architecture

Widgets are the core interactive elements. The LLM generates a widget config (JSON matching the Zod schema), and `WidgetRenderer.tsx` maps it to the correct React component.

### Flow:
1. User expresses a feeling or problem
2. LLM analyzes mood + context
3. LLM returns a coaching response + 1-3 widget configs
4. `WidgetRenderer` maps each config to a React component
5. Widget renders with FIXED design tokens (colors, fonts, spacing)
6. User interacts with widget → interaction data fed back to LLM for next turn

### Widget Config Example:
```json
{
  "type": "stoic_meditation",
  "title": "The View From Above",
  "description": "Marcus Aurelius' technique for gaining perspective",
  "content": {
    "steps": [
      "Close your eyes and picture yourself sitting where you are now.",
      "Slowly zoom out — see your room, your building, your city.",
      "Continue until you see the entire Earth from space.",
      "From this vantage point, how significant is today's worry?"
    ],
    "duration_seconds": 180,
    "reflection_prompt": "What shifted in your perspective?"
  },
  "philosopher": {
    "name": "Marcus Aurelius",
    "school": "Stoicism",
    "relevance": "The Meditations contain this visualization technique for managing daily anxieties"
  }
}
```

---

## 6. Credit System

### Pricing Tiers:
- **Free:** Access to cached widget templates for common problems. No live LLM calls.
- **Starter (50 credits/month):** ~25 coaching sessions
- **Growth (200 credits/month):** ~100 coaching sessions
- **Unlimited:** Flat monthly fee

### Credit Costs:
- Coaching message (streaming): 1 credit
- Widget generation: 1 credit
- Journal reflection (AI analysis): 1 credit
- Onboarding analysis: 2 credits (one-time)

Track via `profiles.credits_remaining` + a `credit_transactions` table for audit.
