# PHILOSOPHER COACH — Claude Code Project Instructions

## What This Project Is

A philosophical coaching web app that helps people manage daily problems, anxiety, and emotional struggles through philosophical wisdom. Users express how they feel (visually + textually), and the app responds with tailored philosophical guidance through a beautiful, adaptive interface.

**This is NOT a generic chatbot.** It's a guided experience where the UI itself is part of the therapy — dynamically generated layouts, widgets, and interactive components adapt to each user's emotional state and goals.

---

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui (with Radix primitives)
- **Database + Auth:** Supabase (Postgres + Auth + Realtime)
- **Styling:** Tailwind CSS v4
- **LLM Layer:** Provider-agnostic abstraction (see `/docs/ARCHITECTURE.md`)
- **Package Manager:** Bun

### Setup Commands
```bash
bun create next-app . --typescript --tailwind --eslint --app --src-dir
bunx shadcn@latest init
bun add @supabase/supabase-js @supabase/ssr
bun add ai # Vercel AI SDK for streaming + provider abstraction
```

---

## Design System — FIXED, NEVER CHANGE THESE

The color palette and typography are **constants**. They do not change. They are not generated. Every component, page, and widget must use ONLY these tokens.

Read `/docs/DESIGN_SYSTEM.md` for the full spec. Here's the summary:

### Colors
```
--ink:          #1a1a1a     (primary text, borders, UI lines)
--paper:        #f5f0e8     (background — warm parchment)
--paper-light:  #faf7f2     (card backgrounds, elevated surfaces)
--accent:       #c45d3e     (burnt sienna — CTAs, highlights, active states)
--accent-hover: #a84e33     (accent hover/pressed)
--muted:        #8a8275     (secondary text, timestamps, labels)
--muted-light:  #d4cfc6     (dividers, subtle borders)
--sage:         #7a8b6f     (success, positive sentiment, growth)
--slate:        #5b6b7a     (info, neutral sentiment, calm)
--warm:         #b8860b     (warning, caution, energy)
```

### Typography
```
--font-display: "Playfair Display", Georgia, serif    (headings, quotes, philosopher names)
--font-body:    "Inter", system-ui, sans-serif         (body text, UI elements)
--font-mono:    "JetBrains Mono", monospace            (timestamps, metadata, codes)
```

### Aesthetic
**Retro magazine editorial** — inspired by TVA (Loki), mid-century design, Fantastic Four retro-futurism. Think: warm paper textures, strong serif headings, clean geometric layouts, subtle grain/noise overlays, editorial grid systems, stamp/seal motifs for achievements.

---

## What Claude Code DOES Generate Dynamically

The LLM generates these based on user emotional state and context:

1. **UX Flows** — The sequence of screens/steps a user sees
2. **Layouts** — How content is arranged (grid configs, section ordering)
3. **Interactive Widgets** — Mood selectors, reflection prompts, breathing exercises, journaling templates, philosophical dilemma cards, progress visualizations
4. **Philosophical Content** — Quotes, teachings, exercises mapped to user's situation
5. **Coaching Responses** — Conversational guidance blending philosophy with practical advice

The LLM does NOT generate: colors, fonts, spacing scales, or base component styles. Those are fixed.

---

## Architecture Rules

1. **LLM Provider Abstraction is MANDATORY.** Use the Vercel AI SDK (`ai` package) which already supports OpenAI, Anthropic, Google Gemini, etc. via provider packages. See `/docs/ARCHITECTURE.md` for the exact pattern. Switching providers must be a one-line env var change.

2. **Component Structure:**
   - `/src/components/ui/` — shadcn base components (buttons, cards, inputs, etc.)
   - `/src/components/core/` — app-specific composed components (PhilosopherCard, MoodWheel, etc.)
   - `/src/components/widgets/` — dynamically rendered interactive widgets
   - `/src/components/layout/` — page layouts, navigation, shells

3. **Supabase Schema:** See `/docs/ARCHITECTURE.md` for full schema. Key tables:
   - `profiles` — user profiles + preferences
   - `sessions` — coaching sessions
   - `journal_entries` — user reflections
   - `mood_logs` — emotional state tracking
   - `philosophical_paths` — user's philosophical journey/progress

4. **Route Structure:**
   ```
   /                    → Landing page
   /auth                → Login/signup
   /onboarding          → Initial mood + goal assessment
   /dashboard           → Main hub — today's state, streaks, recent sessions
   /session/[id]        → Active coaching session (chat + widgets)
   /journal             → Reflection journal
   /explore             → Browse philosophers, schools, exercises
   /profile             → Settings, history, philosophical profile
   ```

5. **Server Components by default.** Only use `"use client"` for interactive widgets, forms, and chat UI. API routes handle LLM calls via streaming.

---

## File Reading Order

When starting this project, read files in this order:
1. `CLAUDE.md` (this file)
2. `/docs/DESIGN_SYSTEM.md`
3. `/docs/ARCHITECTURE.md`
4. `/docs/PRD.md`

Then begin building in this order:
1. Project setup (Next.js + Bun + shadcn + Supabase client)
2. Design system tokens in Tailwind config + globals.css
3. Auth flow (Supabase)
4. LLM abstraction layer
5. Core components (following design system)
6. Onboarding flow
7. Dashboard
8. Session/coaching flow
9. Journal
10. Explore section

---

## Important Conventions

- Use TypeScript strict mode
- Use Zod for all LLM response validation
- Use server actions for mutations where appropriate
- All env vars go in `.env.local` with a `.env.example` template
- Error boundaries on every route segment
- Loading states with skeleton components matching the design system
- Mobile-first responsive design
- Minimum accessible contrast ratios maintained
