<p align="center">
  <h1 align="center">Daily Sage</h1>
  <p align="center"><strong>Ancient Wisdom. Modern Clarity.</strong></p>
  <p align="center">
    A philosophical coaching app that helps you navigate daily anxiety, big decisions, and emotional struggles — with guidance rooted in centuries of wisdom.
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> &nbsp;&bull;&nbsp;
  <a href="#tech-stack">Tech Stack</a> &nbsp;&bull;&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;&bull;&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#design-system">Design System</a> &nbsp;&bull;&nbsp;
  <a href="#license">License</a>
</p>

---

## What is Daily Sage?

Daily Sage is not a generic chatbot. It's a **guided philosophical coaching experience** where the UI itself is part of the therapy. The interface dynamically generates layouts, interactive widgets, and exercises that adapt to each user's emotional state and goals.

Users express how they feel — visually through an interactive mood canvas and textually through conversation — and receive tailored guidance drawn from Stoicism, Existentialism, Buddhism, Taoism, Absurdism, Epicureanism, and Pragmatism.

The aesthetic is **retro magazine editorial** — warm paper textures, strong serif headings, and clean geometric layouts inspired by mid-century design.

---

## Features

### Philosophical Coaching Sessions
Real-time streaming conversations with an AI coach that blends philosophical wisdom with practical advice. The coach dynamically invokes interactive widgets mid-conversation — breathing exercises, thought experiments, philosophical dilemmas, and more.

### 17 Interactive Widgets
Exercises and tools rendered inline within coaching sessions:

| Widget | What it does |
|--------|-------------|
| **Breathing Exercise** | Animated breathing circle with configurable timing |
| **Stoic Meditation** | Multi-step timed meditation with progress ring |
| **Daily Maxim** | Philosophical maxim with explanation and practical application |
| **Thought Experiment** | Scenario + questions with click-to-reveal insight |
| **Philosophical Dilemma** | 2-choice scenario revealing philosopher perspectives |
| **Reflection Prompt** | Guided journaling that saves to your journal |
| **Gratitude List** | Multi-item gratitude capture |
| **Mood Reframe** | Step-by-step cognitive reframing |
| **Obstacle Reframe** | Stoic dichotomy of control applied to your obstacles |
| **Values Wheel** | Life domains assessment and rating |
| **Cognitive Distortion** | Identify and reframe distorted thinking patterns |
| **Weekly Review** | Structured weekly reflection |
| **Progress Visualization** | Stats, mastery bars, and milestone tracking |
| **Feeling Picker** | Quick emotional state selector |
| **Quick Prompt** | One-tap prompts to guide conversation |
| **Quote Challenge** | Interactive quote engagement |
| **Argument Mapper** | Visual argument mapping |

### Interactive Mood Canvas
A 2D emotional plane (valence x arousal) where you place a pin to express how you feel. Four quadrants — *Calm & Content*, *Energized & Happy*, *Low & Struggling*, *Tense & Overwhelmed* — map your state to relevant philosophical schools and exercises.

### 7-Step Onboarding
A guided flow that generates your unique **philosophical profile** — identifying which schools of thought resonate with your personality, concerns, and coping style. This profile shapes every future interaction.

### Journal System
Free-write journal entries with optional prompts and mood check-ins. Each entry can receive an **AI-generated philosophical reflection** that connects your thoughts to relevant philosophical concepts.

### Philosophical Paths & Progress
Your journey through 7 schools of thought is tracked automatically. As you engage with coaching sessions, exercises, and journal entries, you progress through mastery levels: *Novice → Beginner → Student → Practitioner → Adept → Master*.

### Mood Timeline
90-day mood visualization showing your emotional trajectory with check-in history.

### 7 Philosophical Schools

| School | Core Idea | Key Thinkers |
|--------|-----------|--------------|
| **Stoicism** | Focus on what you can control | Marcus Aurelius, Epictetus, Seneca |
| **Existentialism** | Create meaning through authentic choices | Kierkegaard, Sartre, Camus, de Beauvoir |
| **Buddhism** | Suffering arises from attachment | Siddhartha Gautama, Thich Nhat Hanh, Pema Chödrön |
| **Taoism** | Flow with nature, embrace simplicity | Laozi, Zhuangzi |
| **Absurdism** | Embrace the absurd, find joy regardless | Camus, Nagel |
| **Epicureanism** | Pursue simple pleasures, avoid pain | Epicurus, Lucretius |
| **Pragmatism** | Truth is what works | William James, John Dewey |

### Credit System & Pricing
Three tiers — **Free** (curated daily exercises), **Starter** ($9/mo, 50 credits), and **Growth** ($24/mo, 200 credits) — with credit costs for coaching messages, widget generation, journal reflections, and onboarding analysis.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **UI** | [shadcn/ui](https://ui.shadcn.com) + [Radix](https://www.radix-ui.com) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Database & Auth** | [Supabase](https://supabase.com) (Postgres + Auth + RLS) |
| **AI** | [Vercel AI SDK v6](https://sdk.vercel.ai) — provider-agnostic |
| **LLM Providers** | Anthropic Claude, OpenAI, Google Gemini (switchable via env) |
| **Validation** | [Zod v4](https://zod.dev) |
| **Animations** | [Framer Motion](https://www.framer.com/motion) |
| **Payments** | [Stripe](https://stripe.com) (scaffolded) |
| **Language** | TypeScript (strict mode) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Supabase](https://supabase.com) project (free tier works)
- An API key for at least one LLM provider (Anthropic, OpenAI, or Google)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/daily-sage.git
cd daily-sage
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```env
# LLM Provider — switch by changing these two values
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514

# Provider API Keys (only the active one needs to be set)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set Up Database

Run the migrations in your Supabase SQL editor (in order):

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_backfill_profiles.sql
supabase/migrations/003_add_profile_insert_policy.sql
supabase/migrations/004_widget_data.sql
supabase/migrations/005_sessions_delete_policy.sql
```

### 4. Run

```bash
bun dev
```

Open [http://localhost:4040](http://localhost:4040).

---

## Architecture

### Provider-Agnostic LLM Layer

Switching AI providers is a one-line env var change. The abstraction layer in `src/lib/llm/provider.ts` supports Anthropic, OpenAI, and Google Gemini through the Vercel AI SDK.

### Tool-Based Widget Invocation

The coaching chat uses AI SDK tool calling — the LLM can invoke tools like `show_breathing_exercise` or `show_reflection_prompt` mid-conversation. Each tool returns a widget config that renders inline in the chat.

### Database (Supabase + RLS)

Six tables with row-level security:

- **profiles** — user preferences, philosophical profile, credits
- **sessions** — coaching sessions with message history
- **journal_entries** — reflections with mood and philosophical tags
- **mood_logs** — 2D mood vectors with context
- **philosophical_paths** — per-school mastery tracking
- **widget_templates** — pre-cached widget configs for free tier

### Project Structure

```
src/
├── app/                    Routes & API endpoints
│   ├── api/                8 API routes (chat, mood, journal, etc.)
│   ├── auth/               Login, signup, OAuth callback
│   ├── dashboard/          Main hub
│   ├── explore/            Browse philosophical schools
│   ├── journal/            Journal CRUD
│   ├── onboarding/         7-step guided onboarding
│   ├── profile/            User profile & stats
│   ├── session/            Coaching sessions
│   └── pricing/            Pricing tiers
├── components/
│   ├── ui/                 shadcn base components
│   ├── core/               App-specific components
│   ├── chat/               Chat UI (container, messages, input)
│   ├── widgets/            17 interactive widget components
│   ├── layout/             Navbar, footer, shells
│   └── motion/             Animation providers
├── lib/
│   ├── llm/                Provider abstraction, prompts, schemas
│   ├── philosophy/         Schools, philosophers, mood mapping
│   ├── supabase/           Client, server, middleware, types
│   └── utils/              Credits, cn, helpers
├── hooks/                  7 custom hooks (profile, credits, mood, etc.)
├── types/                  TypeScript type definitions
└── middleware.ts           Auth route protection
```

---

## Design System

The visual identity is fixed — a **retro magazine editorial** aesthetic inspired by mid-century design.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1a1a1a` | Primary text, borders |
| `paper` | `#f5f0e8` | Warm parchment background |
| `paper-light` | `#faf7f2` | Card surfaces |
| `accent` | `#c45d3e` | Burnt sienna — CTAs, highlights |
| `muted` | `#8a8275` | Secondary text, labels |
| `sage` | `#7a8b6f` | Success, growth |
| `slate` | `#5b6b7a` | Info, calm |
| `warm` | `#b8860b` | Warning, energy |

### Typography

| Token | Font | Usage |
|-------|------|-------|
| `--font-display` | Playfair Display | Headings, quotes, philosopher names |
| `--font-body` | Inter | Body text, UI elements |
| `--font-mono` | JetBrains Mono | Timestamps, metadata |

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Email + Google OAuth sign-in |
| `/auth/signup` | Account creation |
| `/onboarding` | 7-step philosophical profile generation |
| `/dashboard` | Main hub — mood, streaks, sessions, progress |
| `/session/[id]` | Live coaching with streaming chat + widgets |
| `/journal` | Journal entries list |
| `/journal/new` | New journal entry |
| `/journal/[id]` | View entry with AI reflection |
| `/explore` | Browse philosophical schools |
| `/explore/[school]` | School detail page |
| `/profile` | User stats and philosophical journey |
| `/pricing` | Pricing tiers and credit explainer |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | Yes | `anthropic`, `openai`, or `google` |
| `LLM_MODEL` | Yes | Model ID (e.g., `claude-sonnet-4-20250514`) |
| `ANTHROPIC_API_KEY` | If using Anthropic | Anthropic API key |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If using Google | Google AI API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `STRIPE_SECRET_KEY` | No | Stripe key (for payments) |

---

## Scripts

```bash
bun dev        # Start dev server on port 4040
bun run build  # Production build
bun start      # Start production server
bun run lint   # Run ESLint
```

---

## License

MIT
