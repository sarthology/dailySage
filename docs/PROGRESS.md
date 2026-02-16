# Progress Report — Philosopher Coach (Daily Sage)

**Last updated:** 2026-02-15

---

## Project Overview

Daily Sage is a philosophical coaching web app that helps people manage daily problems, anxiety, and emotional struggles through philosophical wisdom. Users express how they feel (visually + textually), and the app responds with tailored philosophical guidance through a beautiful, adaptive editorial interface.

---

## Tech Stack (Fully Configured)

| Layer | Technology | Status |
|-------|-----------|--------|
| Runtime | Bun | Installed |
| Framework | Next.js 16.1.6 (App Router, Turbopack) | Installed |
| UI Library | shadcn/ui (Radix primitives) | Installed (7 components) |
| Database + Auth | Supabase (Postgres + Auth + RLS) | Schema defined, client/server wrappers built |
| Styling | Tailwind CSS v4 | Configured with full design system |
| LLM Layer | Vercel AI SDK (`ai`) + @ai-sdk/anthropic, openai, google | Provider-agnostic abstraction complete |
| Validation | Zod | Schemas for all LLM outputs |
| Package Manager | Bun | Lock file committed |

---

## Build Status

`bun run build` compiles with **zero TypeScript errors**.

18 routes registered:

```
Route (app)
├ /                        (Static)   Landing page
├ /_not-found              (Static)   404
├ /api/analyze-mood        (Dynamic)  Mood analysis API
├ /api/analyze-onboarding  (Dynamic)  Onboarding profile generation API
├ /api/chat                (Dynamic)  Streaming coaching chat API
├ /api/generate-widget     (Dynamic)  Widget generation API
├ /api/journal-reflection  (Dynamic)  AI journal reflection API
├ /auth/callback           (Dynamic)  OAuth callback handler
├ /auth/login              (Static)   Login page
├ /auth/signup             (Static)   Signup page
├ /dashboard               (Dynamic)  Main hub
├ /explore                 (Static)   Browse philosophy schools
├ /explore/[school]        (Dynamic)  School detail
├ /journal                 (Dynamic)  Journal entry list
├ /journal/[id]            (Dynamic)  Single journal entry view
├ /journal/new             (Static)   New journal entry
├ /onboarding              (Static)   Multi-step onboarding
├ /profile                 (Dynamic)  User profile + stats
└ /session/[id]            (Dynamic)  Coaching session
```

---

## What's Been Built

### 1. Design System (Complete)

The full retro magazine editorial design system is implemented in `globals.css` with immutable tokens:

- **Colors:** ink, paper, paper-light, accent, accent-hover, muted, muted-light, sage, slate, warm
- **Typography:** Playfair Display (headings/quotes), Inter (body/UI), JetBrains Mono (timestamps/metadata)
- **Utility classes:** text-hero, text-h1-h4, text-body, text-body-sm, text-caption, text-quote, text-label
- **Aesthetic details:** Paper grain texture overlay, editorial dividers, stamp/seal motif, reduced-motion support
- **shadcn mapping:** All design tokens mapped to shadcn's expected CSS variables

### 2. Authentication (Complete)

- Email/password signup + login via Supabase Auth
- Google OAuth integration
- OAuth callback handler (`/auth/callback`)
- Middleware-based route protection (dashboard, session, journal, profile, onboarding)
- SSR cookie-based session management

### 3. LLM Abstraction Layer (Complete)

- **Provider factory** (`src/lib/llm/provider.ts`): Supports Anthropic, OpenAI, Google — switchable via env var
- **Prompt library** (`src/lib/llm/prompts.ts`): 5 prompt functions — coachSystemPrompt, onboardingAnalysisPrompt, journalReflectionPrompt, philosopherMatchPrompt
- **Zod schemas** (`src/lib/llm/schemas.ts`): widgetSchema, coachResponseSchema, philosophicalProfileSchema

### 4. Supabase Data Layer (Complete)

- **Client wrappers:** Browser client (`client.ts`), Server client (`server.ts`), Auth middleware (`middleware.ts`)
- **Type definitions** (`types.ts`): Profile, SessionRow, JournalEntry, MoodLogRow
- **SQL schema defined** in `ARCHITECTURE.md`: 6 tables (profiles, sessions, journal_entries, mood_logs, philosophical_paths, widget_templates) with RLS policies

### 5. API Routes (5 total)

| Route | Method | Purpose | LLM Function |
|-------|--------|---------|-------------|
| `/api/chat` | POST | Streaming coaching conversation | `streamText()` |
| `/api/generate-widget` | POST | Generate interactive widget config | `generateObject()` with widgetSchema |
| `/api/analyze-mood` | POST | Interpret mood vector + optional text | `generateObject()` with moodAnalysisSchema |
| `/api/analyze-onboarding` | POST | Generate philosophical profile from onboarding | `generateObject()` with philosophicalProfileSchema |
| `/api/journal-reflection` | POST | Generate AI reflection on journal entry | `generateText()`, writes back to DB |

### 6. Widget System (9/9 — All Complete)

All 9 widget types defined in `WidgetType` are now implemented:

| Widget | File | Type | Interaction |
|--------|------|------|-------------|
| Breathing Exercise | `BreathingExercise.tsx` | Client | Animated breathing circle, configurable inhale/hold/exhale timing, cycle counter |
| Reflection Prompt | `ReflectionPrompt.tsx` | Client | Textarea with guiding questions, save-to-journal flow |
| Daily Maxim | `DailyMaxim.tsx` | Server | Blockquote maxim, explanation, practical application |
| Mood Reframe | `MoodReframe.tsx` | Client | Original thought display, step-by-step technique, reveal-to-see reframe |
| Philosophical Dilemma | `PhilosophicalDilemma.tsx` | Client | 2-choice scenario, reveals philosopher perspectives + insight on selection |
| Gratitude List | `GratitudeList.tsx` | Client | 3-5 item input, minimum threshold, save reveals reflection |
| Stoic Meditation | `StoicMeditation.tsx` | Client | Multi-step timed meditation, SVG progress ring, step indicators |
| Thought Experiment | `ThoughtExperiment.tsx` | Client | Scenario + numbered questions, click-to-reveal insight |
| Progress Visualization | `ProgressVisualization.tsx` | Server | Stat blocks, school mastery progress bars, milestone checklist |

**WidgetRenderer** (`WidgetRenderer.tsx`): Central dispatcher with exhaustive type-safe switch covering all 9 types + content type interfaces.

### 7. Custom Hooks (4 total)

| Hook | File | Functions |
|------|------|-----------|
| `useProfile` | `src/hooks/useProfile.ts` | `getProfile()`, `updateProfile()`, `isOnboardingComplete()` |
| `useCredits` | `src/hooks/useCredits.ts` | `getCredits()`, `deductCredit(action)`, `canAfford(action)` |
| `useMood` | `src/hooks/useMood.ts` | `logMood(vector, label?, context?)`, `getMoodHistory(limit)`, `getStreak()` |
| `useSession` | `src/hooks/useSession.ts` | `createSession()`, `getSession(id)`, `endSession(id)`, `updateSessionMessages()`, `listSessions()` |

### 8. Foundation Utilities (2 total)

| Utility | File | Purpose |
|---------|------|---------|
| Mood Mapping | `src/lib/philosophy/mood-mapping.ts` | Maps MoodVector quadrants to philosophical schools, recommended widget types, and coaching tones |
| Credits | `src/lib/utils/credits.ts` | `CREDIT_COSTS` constant, `getCreditCost()`, `hasEnoughCredits()` |

### 9. Philosophy Knowledge Base

- **7 philosophical schools** (`schools.ts`): Stoicism, Existentialism, Buddhism, Absurdism, Taoism, Epicureanism, Pragmatism — each with era, core concept, bestFor tags, philosopher list, and color
- **8 philosophers** (`philosophers.ts`): Marcus Aurelius, Epictetus, Seneca, Albert Camus, Thich Nhat Hanh, Epicurus, Laozi, Simone de Beauvoir — each with era, bio, key ideas, and tagged quotes

### 10. Core Components

| Component | File | Purpose |
|-----------|------|---------|
| MoodCanvas | `src/components/core/MoodCanvas.tsx` | 2D interactive mood selector (pointer drag, quadrant labels, compact mode) |
| QuoteBlock | `src/components/core/QuoteBlock.tsx` | Styled blockquote with philosopher attribution |
| DashboardContent | `src/components/core/DashboardContent.tsx` | Client component: mood check-in, quick actions, streak, sessions list, quote |

### 11. Chat System

| Component | File | Purpose |
|-----------|------|---------|
| ChatContainer | `src/components/chat/ChatContainer.tsx` | Orchestrates chat via Vercel AI SDK `useChat`, persists messages to Supabase, deducts credits |
| ChatMessage | `src/components/chat/ChatMessage.tsx` | Role-based message rendering (editorial style, not chat bubbles) |
| ChatInput | `src/components/chat/ChatInput.tsx` | Textarea with Enter-to-send, loading states |

### 12. Pages with Supabase Integration

| Page | Key Data Features |
|------|-------------------|
| **Onboarding** | Calls `/api/analyze-onboarding` to generate philosophical profile, saves to `profiles` table, logs initial mood to `mood_logs` |
| **Dashboard** | Server-side: fetches profile, recent sessions, mood history; redirects to `/onboarding` if incomplete; calculates streak; shows personalized greeting + welcome quote from profile |
| **Session** | Handles `id === "new"` (creates DB row + redirects); validates session exists; ChatContainer persists messages + checks credits |
| **Journal List** | Fetches all entries from `journal_entries`, renders cards with content preview, tags, AI reflection indicator |
| **Journal New** | Saves to `journal_entries`, logs mood if selected, fires background `/api/journal-reflection` for AI reflection |
| **Journal View** | Fetches single entry, renders content, prompt, philosophical tags, AI reflection, mood snapshot |
| **Profile** | Real stats: session count, journal count, streak (calculated from mood_logs), credits from `profiles`, philosophical profile display, account email + join date |

---

## File Inventory (63 source files)

```
src/
├── app/                          (14 files)
│   ├── layout.tsx
│   ├── page.tsx                  Landing page
│   ├── globals.css               Design system tokens
│   ├── api/
│   │   ├── analyze-mood/route.ts
│   │   ├── analyze-onboarding/route.ts
│   │   ├── chat/route.ts
│   │   ├── generate-widget/route.ts
│   │   └── journal-reflection/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── dashboard/page.tsx
│   ├── explore/
│   │   ├── page.tsx
│   │   └── [school]/page.tsx
│   ├── journal/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── onboarding/page.tsx
│   ├── profile/page.tsx
│   └── session/[id]/page.tsx
├── components/                   (20 files)
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   ├── core/
│   │   ├── DashboardContent.tsx
│   │   ├── MoodCanvas.tsx
│   │   └── QuoteBlock.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                       (7 shadcn components)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   └── textarea.tsx
│   └── widgets/
│       ├── BreathingExercise.tsx
│       ├── DailyMaxim.tsx
│       ├── GratitudeList.tsx
│       ├── MoodReframe.tsx
│       ├── PhilosophicalDilemma.tsx
│       ├── ProgressVisualization.tsx
│       ├── ReflectionPrompt.tsx
│       ├── StoicMeditation.tsx
│       ├── ThoughtExperiment.tsx
│       └── WidgetRenderer.tsx
├── hooks/                        (4 files)
│   ├── useCredits.ts
│   ├── useMood.ts
│   ├── useProfile.ts
│   └── useSession.ts
├── lib/                          (9 files)
│   ├── utils.ts
│   ├── llm/
│   │   ├── provider.ts
│   │   ├── prompts.ts
│   │   └── schemas.ts
│   ├── philosophy/
│   │   ├── mood-mapping.ts
│   │   ├── philosophers.ts
│   │   └── schools.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils/
│       └── credits.ts
├── types/                        (4 files)
│   ├── mood.ts
│   ├── philosophy.ts
│   ├── session.ts
│   └── widget.ts
└── middleware.ts
```

---

## PRD Checklist — MVP Features

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (email + Google OAuth) | Done | Supabase Auth, middleware protection |
| Onboarding flow with Mood Canvas | Done | 5-step flow, LLM profile generation, saves to DB |
| Dashboard with daily mood check-in | Done | Server-fetched data, streak, personalized greeting |
| Coaching session (streaming chat + inline widgets) | Done | Vercel AI SDK streaming, message persistence, credit checks |
| All 9 widget types working | Done | Full implementation with WidgetRenderer dispatcher |
| Journal (free-write + AI reflection) | Done | Create, list, view pages; AI reflection via background API call |
| Design system fully applied | Done | All tokens in globals.css, consistent across all components |
| Mobile responsive | Done | Mobile-first Tailwind, compact component variants |
| Explore section | Done | Schools list + detail pages with philosopher profiles |
| Profile page with real stats | Done | Session count, journal count, streak, credits, philosophical profile |
| Credit system | Done | Cost definitions, hooks, deduction on chat, balance display |
| Session history | Done | Listed on dashboard sidebar, linked to session pages |

---

## What's NOT Yet Built (Future Work)

### From PRD v1 Scope
- Philosophical paths / progress tracking (table defined, UI not built)
- Mood timeline visualization
- Stripe integration for credit purchases
- Widget template caching (free tier)
- Inline widget rendering within chat messages

### From PRD v2 Scope
- Dark mode
- Community features
- Push notifications
- Journal PDF export
- Advanced analytics (mood trends, philosophical growth charts)
- Multiple coaching personas

### Technical Debt / Polish
- Run Supabase migrations (SQL schema defined in docs, needs `supabase db push`)
- End-to-end testing with a real Supabase instance
- Error boundaries on every route segment
- Loading skeletons matching the design system
- `philosophical_tags` auto-generation on journal entries
- Session title auto-generation from first message
- `.env.example` file for onboarding new developers
