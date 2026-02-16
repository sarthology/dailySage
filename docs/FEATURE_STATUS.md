# Philosopher Coach — Feature Status

Overview of every feature in the app and its current functional state.

---

## Fully Functional

### Auth (Login / Signup)
- Email + password sign-in and sign-up via Supabase Auth
- Google OAuth sign-in
- Auth callback handler for OAuth redirect
- Middleware protects all private routes (`/dashboard`, `/session`, `/journal`, `/profile`, `/onboarding`, `/moods`, `/paths`) — redirects unauthenticated users to `/auth/login`
- Session refresh on every request via middleware
- Auth-aware Navbar: shows Dashboard/New Session/Sign Out when logged in, Sign In/Get Started when logged out

### Onboarding (4-step guided flow)
- Step 1: Mood Canvas — user places a pin on a 2D emotional plane (valence x arousal)
- Step 2: Primary concern selection (Work, Relationships, Self, Purpose, Other)
- Step 3: Coping style selection (Talk it out, Push through, Avoid, Analyze)
- Step 4: Quote resonance — pick philosophical quotes that speak to you
- On completion: calls `/api/analyze-onboarding` which uses the LLM to generate a personalized philosophical profile (primary/secondary school, description, welcome quote)
- Saves profile + logs initial mood to Supabase, then redirects to dashboard
- Dashboard redirects back to onboarding if `onboarding_complete` is false

### Coaching Sessions (AI Chat)
- Create new sessions via `/session/new` (generates DB row, redirects to `/session/{uuid}`)
- Real-time LLM streaming via Vercel AI SDK (`streamText` + `useChat`)
- Markdown rendering in assistant messages (GitHub-flavored markdown with prose styling)
- Messages persist to Supabase after each assistant response
- Messages reload from Supabase on page refresh (hydrated into `useChat` initial state)
- System prompt provides philosophical coaching context
- Auto-unlocks philosophical paths: when the LLM mentions a school (Stoicism, Buddhism, etc.), it auto-creates/increments a path record for that user
- Credit system: each message costs 1 credit, checked before sending

### Dashboard
- Personalized greeting based on time of day + display name
- Streak calculation (consecutive days with mood check-ins, up to 90 days)
- Recent sessions list (last 5)
- Mood timeline of recent check-ins
- Top 3 philosophical school progress bars
- Welcome quote from the user's philosophical profile (generated during onboarding)

### Journal
- List all journal entries (newest first) with preview, date, philosophical tags, and AI reflection status
- Create new entries with optional writing prompts and optional mood check-in (MoodCanvas)
- View individual entries with AI-generated philosophical reflection
- AI reflection fires in the background via `/api/journal-reflection` after saving (non-blocking)
- Empty state with Socrates quote encouraging first entry

### Mood Tracking
- Mood Canvas component: interactive 2D plane for placing a mood pin (valence vs arousal)
- Mood logged during onboarding, journal entries, and dashboard check-ins
- `/moods` page shows: total check-ins, streak, average valence, most common quadrant
- 90-day mood timeline visualization (MoodTimeline component)
- Recent check-ins list with quadrant labels and color-coded dots
- Quadrant system: Calm & Content, Energized & Happy, Low & Struggling, Tense & Overwhelmed

### Philosophical Paths (Journey Tracking)
- Paths auto-created when coaching sessions mention philosophical schools
- Exercise count and mastery level tracked per school/concept
- Mastery progression: Novice → Beginner → Student → Practitioner → Adept → Master
- Thresholds: 0, 2, 5, 10, 20, 35 exercises per level
- `/paths` page shows: schools explored count, concepts unlocked, exercises completed
- Per-school detail: progress bar, mastery label, exercises to next level, concept list

### Explore (Philosophical Schools)
- Browse 7 philosophical schools: Stoicism, Existentialism, Buddhism, Taoism, Absurdism, Epicureanism, Pragmatism
- Each school card shows: name, era, core description, best-for tags, key philosophers
- Individual school pages (`/explore/{school}`) with deeper detail

### Profile
- Philosophical profile display (description + primary/secondary school badges)
- Stats: total sessions, journal entries, streak
- Philosophical journey progress (all schools with progress bars)
- Credits remaining display with link to pricing
- Account info (email, member since date)
- Preferences section (placeholder — theme/notifications not yet functional)

### Credits System
- Each user starts with credits (default 50)
- Costs: chat message = 1, widget = 2, journal reflection = 1, onboarding analysis = 3
- Credit check before sending chat messages (blocks with warning if insufficient)
- Atomic deduction via Supabase RPC or direct update
- Balance visible on profile page

### Pricing Page
- 3-tier display: Free, Starter ($9/mo), Growth ($24/mo)
- Feature comparison list per tier
- Credit cost explainer section
- Stripe checkout integration scaffolded (form posts to `/api/stripe/checkout`)
- CTAs show "Coming Soon" when Stripe is not configured

### Landing Page
- Hero section with tagline + CTAs (Begin Your Journey / Explore Schools)
- 3-panel editorial feature cards
- Pull quote section (Seneca)
- Schools preview grid
- Final CTA section
- Footer component

### Design System
- Full token system in CSS custom properties (colors, typography, spacing)
- Retro editorial aesthetic (warm parchment, serif headings, grain overlays)
- Custom typography scale with Playfair Display, Inter, JetBrains Mono
- Stamp motifs, editorial dividers, prose/markdown styling
- Mobile-first responsive across all pages

---

## Partially Built / Scaffolded

### Widget Generation
- API route exists (`/api/generate-widget`) and widget template hook (`useWidgetTemplate`) exists
- Seed templates endpoint exists (`/api/seed-templates`)
- Not visibly integrated into the chat or dashboard UI yet

### Stripe Payments
- Checkout route (`/api/stripe/checkout`) and webhook route (`/api/stripe/webhook`) exist
- Pricing page is built with tier display
- Actual Stripe integration depends on `STRIPE_SECRET_KEY` env var being set
- No subscription management or billing portal yet

### Mood Analysis API
- `/api/analyze-mood` route exists
- Not clear if it's actively called from any UI flow beyond onboarding

---

## Not Yet Built

- Dark mode (mentioned as "coming soon" in profile preferences)
- Notification/reminder system
- Dynamic widget rendering in chat sessions (breathing exercises, dilemma cards, etc.)
- Subscription management / billing portal
- Advanced progress analytics
- Session completion flow (end session with final mood)
- User settings editing (display name, preferences)
- Mobile navigation (hamburger menu)

---

## Database Schema (Supabase)

| Table | Purpose |
|---|---|
| `profiles` | User profile, preferences, philosophical_profile JSON, credits, onboarding status |
| `sessions` | Coaching sessions with messages (JSONB), status, mood before/after |
| `journal_entries` | User reflections with optional prompt, mood, AI reflection, philosophical tags |
| `mood_logs` | Mood check-ins with 2D vector, label, intensity, context |
| `philosophical_paths` | Per-user progress in philosophical schools/concepts with mastery levels |

All tables use RLS policies for user-level data isolation.

---

## API Routes

| Route | Purpose |
|---|---|
| `/api/chat` | Streaming LLM coaching + auto path tracking |
| `/api/analyze-onboarding` | LLM generates philosophical profile from onboarding answers |
| `/api/journal-reflection` | LLM generates philosophical reflection on a journal entry |
| `/api/analyze-mood` | LLM mood analysis |
| `/api/generate-widget` | LLM widget generation (scaffolded) |
| `/api/seed-templates` | Seed widget templates |
| `/api/stripe/checkout` | Stripe checkout session creation |
| `/api/stripe/webhook` | Stripe webhook handler |

---

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 15 (App Router, server components by default)
- **UI:** shadcn/ui + Radix primitives
- **Styling:** Tailwind CSS v4
- **Database + Auth:** Supabase (Postgres + Auth)
- **LLM:** Vercel AI SDK v6 with provider abstraction (currently Anthropic Claude)
- **Payments:** Stripe (scaffolded)
