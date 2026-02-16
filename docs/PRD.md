# Product Requirements Document — Philosopher Coach

---

## Vision

A premium philosophical coaching app where people express what they're going through — visually, verbally, or both — and receive personalized guidance rooted in centuries of philosophical wisdom, delivered through a beautiful adaptive interface.

**Tagline:** *"Ancient wisdom. Modern clarity."*

---

## Target Users

1. **Anxious professionals** — High achievers dealing with daily stress who want more than generic meditation apps
2. **Seekers** — People going through life transitions (career, relationship, identity) looking for deeper frameworks
3. **Philosophy-curious** — People who've heard of Stoicism from a podcast and want practical application
4. **Therapy-adjacent** — People between therapy sessions who want daily emotional check-ins with depth

---

## Core User Flows

### Flow 1: First Time — Onboarding

1. User signs up (email or OAuth via Supabase Auth)
2. Welcome screen with brief app explanation (editorial design, no boring wizard)
3. **Mood Canvas** — user places a marker on a 2D space (calm↔intense × negative↔positive) instead of picking from a list
4. 3-4 quick multiple-choice questions about what brought them here:
   - "What's on your mind today?" (work, relationships, self, purpose, other)
   - "How do you usually cope?" (talk it out, push through, avoid, analyze)
   - "What resonates with you?" (show 4 short philosophy quotes, user picks 1-2)
5. LLM analyzes responses → generates a **Philosophical Profile**:
   - Primary school match (e.g., "You think like a Stoic with Existentialist undertones")
   - 2-3 recommended starting exercises
   - A personalized welcome quote
6. User lands on Dashboard

### Flow 2: Daily Check-In → Coaching Session

1. User opens app → Dashboard shows:
   - "How are you today?" with Mood Canvas (quick tap or full selection)
   - Streak counter (days of consecutive check-ins)
   - Today's philosophical quote (matched to recent mood trend)
   - Quick-start options: "Start a Session", "Journal", "Explore"
2. User taps "Start a Session" or just starts typing
3. **Coaching Session** begins:
   - Chat interface with the philosophical coach
   - Coach responds with empathetic, philosophically-grounded guidance
   - Inline widgets appear in the chat (breathing exercises, thought experiments, etc.)
   - User can interact with widgets without leaving the conversation
4. Session ends → mood check (before/after comparison) → saved to history

### Flow 3: Journaling

1. User navigates to Journal
2. Can start from a prompt (LLM-generated based on recent sessions) or free-write
3. After saving, LLM provides a brief philosophical reflection on the entry
4. Entry is tagged with mood + philosophical themes

### Flow 4: Explore

1. Browse philosophical schools as beautifully designed editorial cards
2. Tap into a school → see its core philosophy, key thinkers, and practical exercises
3. Each philosopher has a profile page with quotes and relevant exercises
4. Users unlock "paths" as they engage with different schools (gamification-lite)

---

## Feature Priority (MVP → v1 → v2)

### MVP (Hackathon / Week 1)
- [ ] Auth (Supabase email + Google OAuth)
- [ ] Onboarding flow with Mood Canvas
- [ ] Dashboard with daily mood check-in
- [ ] Coaching session (streaming chat + inline widgets)
- [ ] 3-4 widget types working (breathing, reflection, daily maxim, mood reframe)
- [ ] Basic journal (free-write + AI reflection)
- [ ] Design system fully applied
- [ ] Mobile responsive

### v1 (Month 1)
- [ ] All 9 widget types
- [ ] Explore section with philosopher profiles
- [ ] Philosophical paths / progress tracking
- [ ] Mood timeline visualization
- [ ] Credit system + Stripe integration
- [ ] Widget template caching (free tier)
- [ ] Session history

### v2 (Month 2-3)
- [ ] Dark mode
- [ ] Community features (shared reflections, anonymized)
- [ ] Push notifications (daily check-in reminders)
- [ ] Export journal as PDF
- [ ] Advanced analytics (mood trends, philosophical growth)
- [ ] Multiple coaching personas (Stoic Coach, Zen Guide, Existential Companion)

---

## UX Principles

1. **The UI is therapy.** The interface itself should feel calming and grounding. No visual clutter, no bright distracting colors, no notification anxiety.

2. **Express, don't select.** Users place markers, drag sliders, and interact spatially rather than picking from dropdowns. This helps people who can't articulate their feelings.

3. **Show, don't tell.** Philosophy is presented through exercises and experiences, not lectures. A Stoic technique is a guided visualization, not a Wikipedia paragraph.

4. **Progressive depth.** Surface-level engagement is easy (daily check-in takes 30 seconds). Depth is always available (a full coaching session, a deep journal entry).

5. **Editorial, not clinical.** The app feels like reading a beautiful magazine about your inner life, not using a medical app.

---

## Key Screens — Design Intent

### Landing Page
- Hero: Large Playfair Display heading, warm paper background, a single subtle illustration or geometric motif
- "Ancient wisdom. Modern clarity." tagline
- Brief 3-panel value proposition (editorial card layout)
- CTA: "Begin Your Journey" (burnt sienna accent button)
- Social proof / press mentions (if available) styled as magazine pull-quotes

### Dashboard
- Clean two-column layout (main + sidebar on desktop, stacked on mobile)
- Main: Mood Canvas (compact version), current streak, quick-start session button
- Sidebar: Today's quote, recent sessions, philosophical path progress
- Cards use editorial grid with generous whitespace

### Coaching Session
- Full-width chat area with subtle paper texture background
- Messages styled as editorial text blocks, not chat bubbles
- Coach messages have a subtle left accent border (burnt sienna)
- Widgets render inline, taking full chat width
- Smooth scroll, minimal UI chrome
- Bottom input area: text field + optional mood indicator button

### Mood Canvas (Widget)
- 2D plane: X-axis (negative ← → positive), Y-axis (low energy ← → high energy)
- User taps/drags to place a pin
- Quadrant labels: "Calm & Content" (bottom-right), "Energized & Happy" (top-right), "Low & Struggling" (bottom-left), "Tense & Overwhelmed" (top-left)
- Subtle grid lines, warm tones, smooth animation
- After placement: brief label + philosophical school association appears

---

## Content Strategy

### Philosopher Quotes Database
Maintain a curated collection of 200+ quotes mapped to:
- Mood tags
- Philosophical school
- Situation tags (work, relationships, self, purpose, loss, growth)

These are used for:
- Daily quotes on dashboard
- Inline references in coaching responses
- Journal prompts
- Explore section content

### Coaching Personality
The AI coach should:
- Be warm but not saccharine
- Reference specific philosophers and teachings naturally
- Ask thoughtful questions rather than immediately solving
- Suggest exercises/widgets at appropriate moments
- Acknowledge difficulty without toxic positivity
- Use metaphors and thought experiments
- Mirror the editorial tone of the UI (measured, intelligent, caring)

### Tone Examples:
**Good:** "Marcus Aurelius faced similar uncertainty as Roman Emperor. His approach was remarkably practical — he'd ask himself: 'Is this within my control?' Let's try that with what you're facing."

**Bad:** "Don't worry, everything will be fine! 😊 Here's a quick tip to feel better!"

**Bad:** "According to Stoic philosophy, which originated in Athens around 300 BC and was founded by Zeno of Citium..." (too academic)
