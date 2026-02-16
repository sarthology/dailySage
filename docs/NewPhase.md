# Final Build Sprint — Philosopher Coach (Daily Sage)

> **Context:** Less than 1 day remains before the hackathon deadline (Feb 16, 2026).
> This file lists everything missing from the PRD, prioritized by demo impact.
> Claude Code: read this file AFTER reading `CLAUDE.md`, `DESIGN_SYSTEM.md`, and `ARCHITECTURE.md`.

---

## PRIORITY 1 — CRITICAL FOR DEMO (Must Ship)

### 1.1 Inline Widget Rendering in Chat Messages

**This is the single most important missing feature.** It is the core differentiator of the app.

**Current state:**
- 9 widget components exist in `src/components/widgets/`
- `WidgetRenderer.tsx` dispatches widget configs to correct components
- `/api/generate-widget` route exists and can generate widget configs via LLM
- `/api/chat` route streams text responses
- `ChatContainer.tsx` renders messages via `ChatMessage.tsx`
- **BUT:** Widgets never appear inside the chat. The coach cannot embed interactive exercises in the conversation.

**What needs to happen:**

#### Step A: Modify the chat API to return widget instructions

Update `/src/app/api/chat/route.ts`:
- After the LLM streams a text response, check if the response suggests an interactive exercise
- Use a secondary `generateObject()` call with the `widgetSchema` to produce a widget config when appropriate
- Return widget configs as special message annotations or as a separate field in the stream response
- Alternative approach: Use Vercel AI SDK's tool calling — define widgets as "tools" the LLM can invoke. When the LLM calls a tool like `show_breathing_exercise`, the tool returns the widget config. This is cleaner and more reliable.

**Recommended approach — Tool-based widget invocation:**

```typescript
// In /src/app/api/chat/route.ts
import { streamText, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/llm/provider";
import { coachSystemPrompt } from "@/lib/llm/prompts";

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: getModel(),
    system: coachSystemPrompt(context),
    messages,
    tools: {
      show_breathing_exercise: tool({
        description: "Show an interactive breathing exercise when the user needs to calm down, reduce anxiety, or practice mindfulness",
        parameters: z.object({
          title: z.string().describe("Title for the exercise"),
          inhaleSeconds: z.number().default(4),
          holdSeconds: z.number().default(7),
          exhaleSeconds: z.number().default(8),
          cycles: z.number().default(3),
          description: z.string().describe("Brief context for why this exercise helps"),
        }),
      }),
      show_reflection_prompt: tool({
        description: "Show a guided reflection prompt when the user needs to think deeper about their situation",
        parameters: z.object({
          title: z.string(),
          prompt: z.string().describe("The main reflection question"),
          guidingQuestions: z.array(z.string()).describe("2-4 follow-up questions to guide thinking"),
          philosopherName: z.string().optional(),
          philosopherQuote: z.string().optional(),
        }),
      }),
      show_mood_reframe: tool({
        description: "Show a cognitive reframing exercise when the user is stuck in a negative thought pattern",
        parameters: z.object({
          title: z.string(),
          originalThought: z.string().describe("The negative thought to reframe"),
          technique: z.string().describe("The reframing technique being used"),
          steps: z.array(z.string()).describe("Step-by-step reframing process"),
          reframedThought: z.string().describe("The reframed perspective"),
        }),
      }),
      show_philosophical_dilemma: tool({
        description: "Present a philosophical thought experiment or dilemma relevant to the user's situation",
        parameters: z.object({
          title: z.string(),
          scenario: z.string(),
          optionA: z.object({ label: z.string(), description: z.string() }),
          optionB: z.object({ label: z.string(), description: z.string() }),
          philosopherPerspectives: z.array(z.object({
            name: z.string(),
            position: z.string(),
          })).optional(),
          insight: z.string().describe("The philosophical insight this dilemma illustrates"),
        }),
      }),
      show_stoic_meditation: tool({
        description: "Guide the user through a Stoic meditation exercise (view from above, negative visualization, etc.)",
        parameters: z.object({
          title: z.string(),
          steps: z.array(z.object({
            instruction: z.string(),
            durationSeconds: z.number(),
          })),
          reflectionPrompt: z.string(),
        }),
      }),
      show_daily_maxim: tool({
        description: "Present a philosophical maxim with explanation and practical application",
        parameters: z.object({
          quote: z.string(),
          philosopher: z.string(),
          school: z.string(),
          explanation: z.string(),
          practicalApplication: z.string(),
        }),
      }),
      show_gratitude_list: tool({
        description: "Guide the user through a gratitude exercise",
        parameters: z.object({
          title: z.string(),
          prompt: z.string(),
          minItems: z.number().default(3),
          maxItems: z.number().default(5),
          reflectionOnComplete: z.string(),
        }),
      }),
      show_thought_experiment: tool({
        description: "Present a philosophical thought experiment with questions for the user to consider",
        parameters: z.object({
          title: z.string(),
          scenario: z.string(),
          questions: z.array(z.string()),
          insight: z.string(),
          philosopher: z.string().optional(),
        }),
      }),
      show_obstacle_reframe: tool({
        description: "Help the user apply the Stoic dichotomy of control to a specific obstacle",
        parameters: z.object({
          title: z.string(),
          obstacle: z.string().describe("The obstacle the user described"),
          withinControl: z.array(z.string()),
          outsideControl: z.array(z.string()),
          actionPlan: z.string(),
          stoicQuote: z.string().optional(),
        }),
      }),
      show_values_wheel: tool({
        description: "Show an interactive values clarification exercise with life domains",
        parameters: z.object({
          title: z.string(),
          domains: z.array(z.object({
            name: z.string(),
            question: z.string(),
          })).describe("6-8 life domains to rate"),
          reflectionPrompt: z.string(),
        }),
      }),
      show_cognitive_distortion: tool({
        description: "Identify and explain a cognitive distortion in the user's thinking",
        parameters: z.object({
          title: z.string(),
          userThought: z.string(),
          distortionType: z.string(),
          explanation: z.string(),
          philosophicalCounter: z.string(),
          reframedPerspective: z.string(),
        }),
      }),
      show_quote_challenge: tool({
        description: "Present a philosophical quote guessing game to build familiarity",
        parameters: z.object({
          quote: z.string(),
          options: z.array(z.object({
            name: z.string(),
            school: z.string(),
          })).describe("3-4 philosopher options including the correct one"),
          correctIndex: z.number(),
          explanation: z.string(),
        }),
      }),
      show_weekly_review: tool({
        description: "Guide the user through a structured weekly philosophical review",
        parameters: z.object({
          title: z.string(),
          prompts: z.array(z.object({
            question: z.string(),
            placeholder: z.string(),
          })),
          closingReflection: z.string(),
        }),
      }),
      show_argument_mapper: tool({
        description: "Break down the user's worry into premises and conclusion for critical examination",
        parameters: z.object({
          title: z.string(),
          originalStatement: z.string(),
          premises: z.array(z.object({
            text: z.string(),
            challengeQuestion: z.string(),
          })),
          conclusion: z.string(),
          philosophicalAnalysis: z.string(),
        }),
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

#### Step B: Update the system prompt to use widgets

Update `/src/lib/llm/prompts.ts` — the `coachSystemPrompt` function must instruct the LLM to use widget tools:

```
Add to the system prompt:

"You have access to interactive widget tools. Use them when appropriate — don't just describe exercises in text. If you suggest a breathing exercise, USE the show_breathing_exercise tool so the user can actually do it interactively. If you identify a cognitive distortion, USE the show_cognitive_distortion tool. If a Stoic meditation would help, USE the show_stoic_meditation tool.

Guidelines for widget usage:
- Use 1 widget per response maximum (don't overwhelm)
- Always provide text context before or after the widget
- Match the widget to the user's emotional state and conversation context
- Breathing exercises for anxiety, overwhelm, panic
- Reflection prompts for confusion, seeking direction
- Mood reframes for negative thought spirals
- Philosophical dilemmas for ethical questions, decision-making
- Stoic meditations for perspective, acceptance
- Daily maxims for inspiration, grounding
- Gratitude lists for negativity bias, low mood
- Thought experiments for expanding worldview
- Obstacle reframes for feeling stuck, helpless
- Values wheels for identity questions, life direction
- Cognitive distortion detection for irrational fears, catastrophizing
- Quote challenges for learning, engagement
- Weekly reviews for structured reflection
- Argument mappers for rumination, circular thinking"
```

#### Step C: Create `WidgetInChat.tsx` component

Create `/src/components/chat/WidgetInChat.tsx`:
- Receives tool invocation data from the Vercel AI SDK stream
- Maps tool name to widget component (similar to WidgetRenderer but keyed by tool name)
- Renders the widget inline in the chat message flow
- Handles widget interaction callbacks (e.g., completed breathing exercise, submitted reflection)
- Optionally sends widget completion data back to the chat as a user message so the LLM knows the user did the exercise

#### Step D: Update `ChatContainer.tsx` to render tool invocations

The Vercel AI SDK's `useChat` hook provides `toolInvocations` on assistant messages when tools are called. Update the chat rendering loop:

```typescript
// In ChatContainer.tsx render loop
{messages.map((message) => (
  <div key={message.id}>
    <ChatMessage message={message} />
    {message.toolInvocations?.map((invocation) => (
      <WidgetInChat
        key={invocation.toolCallId}
        toolName={invocation.toolName}
        args={invocation.args}
        onComplete={(result) => {
          // Optionally append completion info to chat
        }}
      />
    ))}
  </div>
))}
```

#### Step E: Build the new widget components

These are the new widget types discussed. Build them in `/src/components/widgets/`:

**New widgets to create:**

1. **`ObstacleReframe.tsx`** — Displays the obstacle, two columns (within control / outside control), action plan, and a Stoic quote. User can check off items they'll focus on.

2. **`ValuesWheel.tsx`** — Circular or grid display of 6-8 life domains. Each has a slider (1-10) for current alignment. Shows gap analysis on completion. Styled with editorial grid, sage/slate colors for domain categories.

3. **`CognitiveDistortion.tsx`** — Shows the user's thought, identifies the distortion type with a badge, explains it, shows the philosophical counter-argument, reveals the reframed perspective on tap/click.

4. **`QuoteChallenge.tsx`** — Shows a quote, 3-4 philosopher options as selectable cards. On selection, reveals correct answer with explanation. Uses display font for the quote, badge styling for options.

5. **`WeeklyReview.tsx`** — Multi-step form with philosophical reflection prompts. Each prompt has a textarea. On completion, shows a summary card. Save-to-journal integration.

6. **`ArgumentMapper.tsx`** — Shows original statement at top, then each premise as a card with a challenge question. User can mark premises as "solid" or "questionable." Shows conclusion and philosophical analysis at the end.

**Widget styling rules (MUST follow design system):**
- Background: `paper-light`
- Border: `1px solid muted-light`, with `2px solid accent` left border for emphasis
- Border radius: `radius-md`
- Headings: `font-display` (Playfair Display)
- Body text: `font-body` (Inter)
- Interactive elements: `accent` color for buttons/highlights
- Completion states: `sage` color for success
- All padding/spacing from the design system spacing scale
- Smooth entrance animation: slide-up + fade, 300ms

---

### 1.2 Session Completion Flow

**Current state:** Sessions can be created and chatted in, but there's no "end session" experience.

**What needs to happen:**

1. Add an "End Session" button in the session page header or chat footer
2. On click, show a compact MoodCanvas for final mood capture
3. Save final mood to the session record (`final_mood` field already exists in schema)
4. Show a before/after mood comparison card:
   - Left: initial mood pin position + label
   - Right: final mood pin position + label
   - Middle: arrow or shift indicator with color coding (improved = sage, same = slate, declined = warm)
5. Show a brief session summary (could be LLM-generated or just stats: duration, messages exchanged, widgets used, philosophical schools referenced)
6. Update session status to `completed`
7. CTA: "Start New Session" or "Write a Journal Entry"

**Implementation location:** Modify `/src/app/session/[id]/page.tsx` and create `/src/components/core/SessionSummary.tsx`

---

### 1.3 Mobile Navigation

**Current state:** Navbar exists but no mobile hamburger menu. Users on phones can't navigate.

**What needs to happen:**

1. Update `/src/components/layout/Navbar.tsx`
2. Add a hamburger icon button visible only on `md:hidden`
3. Use shadcn `Sheet` component (already installed) for a slide-out mobile menu
4. Menu items: Dashboard, New Session, Journal, Explore, Moods, Paths, Profile, Sign Out
5. Sheet slides from the left, paper-light background, editorial styling
6. Close on navigation (use `usePathname` to detect route changes)

---

## PRIORITY 2 — STRONG DEMO VALUE (Should Ship)

### 2.1 Philosophy Familiarity Gating in Onboarding

**What we discussed:** Most users don't know the difference between 7 schools. Ask about their familiarity level during onboarding and adjust the experience accordingly.

**What needs to happen:**

1. **Add a new onboarding step (Step 5) — Philosophy Familiarity:**
   After the quote resonance step, before submission:
   - Show the user their matched primary school (e.g., "Based on your responses, Stoicism resonates with you")
   - Ask: "How familiar are you with Stoicism?"
   - Three options: "Never heard of it" / "I've heard of it but don't know much" / "I've read about it / practiced it"
   - Store the answer as `familiarity_level` in the philosophical profile JSON

2. **Update `/api/analyze-onboarding`:**
   - Include the familiarity response in the LLM prompt
   - The generated profile should include a `familiarity_level` field: "beginner" | "intermediate" | "advanced"

3. **Update the coach system prompt:**
   - Read `familiarity_level` from the user's profile
   - If beginner: "Explain philosophical concepts simply. Don't assume knowledge. Use everyday analogies. Introduce philosophers by name with brief context."
   - If intermediate: "User has some familiarity. Reference concepts by name but briefly explain. Connect to practical situations."
   - If advanced: "User is well-read. Reference specific texts and passages. Engage in deeper philosophical discussion. Challenge their understanding."

4. **Update Explore section:**
   - Show the user's primary school prominently at the top
   - Other schools show with a "Coming Soon" or "Unlock by exploring in sessions" badge
   - Schools unlock naturally as the user's coaching sessions reference them (the auto-path-tracking already does this)

### 2.2 Single School Focus for MVP

**What we discussed:** Don't overwhelm new users with 7 schools. Default to Stoicism as the entry point.

**What needs to happen:**

1. The onboarding flow should still match users to a school based on their responses (keep the LLM analysis), but if the match isn't strong, default to Stoicism
2. On the Explore page, show the user's matched school as "Your Path" with a full card, and the remaining 6 as smaller cards with "Explore Later" styling (muted, no click-through, or a simplified preview)
3. The coach system prompt should primarily draw from the user's matched school, only referencing others when directly relevant
4. Dashboard widgets and daily quotes should prioritize the primary school

---

## PRIORITY 3 — POLISH (Nice to Have)

### 3.1 Error Boundaries

Add error boundaries on every route segment:
- `/src/app/dashboard/error.tsx`
- `/src/app/session/[id]/error.tsx`
- `/src/app/journal/error.tsx`
- `/src/app/journal/[id]/error.tsx`
- `/src/app/explore/error.tsx`
- `/src/app/explore/[school]/error.tsx`
- `/src/app/profile/error.tsx`
- `/src/app/onboarding/error.tsx`
- `/src/app/moods/error.tsx`
- `/src/app/paths/error.tsx`

Each should:
- Catch rendering errors gracefully
- Show a styled error card (paper-light background, accent border, display font heading)
- Include a "Try Again" button that calls `reset()`
- Include a "Go to Dashboard" fallback link

### 3.2 Loading Skeletons

Add loading states for every dynamic route:
- `/src/app/dashboard/loading.tsx`
- `/src/app/session/[id]/loading.tsx`
- `/src/app/journal/loading.tsx`
- `/src/app/journal/[id]/loading.tsx`
- `/src/app/profile/loading.tsx`
- `/src/app/moods/loading.tsx`
- `/src/app/paths/loading.tsx`

Each should show skeleton cards/lines matching the design system:
- Use `muted-light` background with a subtle shimmer animation
- Match the layout structure of the actual page
- Use `rounded-md` shapes matching card sizes

### 3.3 Session Title Auto-Generation

After the first user message in a session, fire a background LLM call to generate a short title (3-6 words) and update the session record. Display this title in the session list on the dashboard.

### 3.4 Journal Philosophical Tags Auto-Generation

When saving a journal entry, have the `/api/journal-reflection` route also return philosophical tags based on the content. Save these to the `philosophical_tags` array field.

---

## NEW WIDGET COMPONENTS TO BUILD

These are the 6 new widget types discussed. They should follow the exact same patterns as existing widgets in `/src/components/widgets/`.

### Widget: ObstacleReframe
**File:** `src/components/widgets/ObstacleReframe.tsx`
**Type:** Client component ("use client")
**Purpose:** Applies Stoic dichotomy of control to user's obstacle
**UI:**
- Header with title (Playfair Display)
- Obstacle statement in a muted card
- Two columns: "Within Your Control" (sage left border) and "Outside Your Control" (slate left border)
- Each item is a checkbox — user checks what they'll focus on
- Action plan card appears after checking at least one "within control" item
- Optional Stoic quote at the bottom in `text-quote` style

### Widget: ValuesWheel
**File:** `src/components/widgets/ValuesWheel.tsx`
**Type:** Client component ("use client")
**Purpose:** Rate alignment across life domains, identify gaps
**UI:**
- Header with title
- Grid of 6-8 domain cards (e.g., Career, Relationships, Health, Creativity, Spirituality, Community)
- Each card has the domain name, a guiding question, and a slider or 1-10 button row
- On completion (all domains rated), show a gap analysis:
  - Highest rated domains in sage
  - Lowest rated domains in warm
  - Reflection prompt about the gaps
- Save results option

### Widget: CognitiveDistortion
**File:** `src/components/widgets/CognitiveDistortion.tsx`
**Type:** Client component ("use client")
**Purpose:** Identify and reframe cognitive distortions using philosophical lens
**UI:**
- Header with title
- "Your Thought" card showing the user's original statement (muted background)
- Distortion type badge (e.g., "Catastrophizing", "Black & White Thinking") in accent color
- Explanation paragraph
- Divider
- "Philosophical Counter" section with the philosophical response
- Click-to-reveal "Reframed Perspective" card (sage border on reveal)

### Widget: QuoteChallenge
**File:** `src/components/widgets/QuoteChallenge.tsx`
**Type:** Client component ("use client")
**Purpose:** Educational game — guess which philosopher said a quote
**UI:**
- Large quote in `text-quote` style (Playfair Display italic)
- "Who said this?" label
- 3-4 option cards, each showing philosopher name + school
- On selection: correct = sage highlight + checkmark, wrong = warm highlight + X
- Reveal section with explanation of the quote's context
- Score/streak counter if used multiple times

### Widget: WeeklyReview
**File:** `src/components/widgets/WeeklyReview.tsx`
**Type:** Client component ("use client")
**Purpose:** Structured philosophical reflection on the past week
**UI:**
- Header with title
- Multi-step flow (one prompt per step)
- Each step: prompt text (Playfair Display), textarea (Inter), "Next" button
- Progress indicator (step dots or a thin progress bar)
- On completion: summary card showing all responses
- "Save to Journal" button that creates a journal entry with all responses combined
- Closing philosophical reflection text

### Widget: ArgumentMapper
**File:** `src/components/widgets/ArgumentMapper.tsx`
**Type:** Client component ("use client")
**Purpose:** Break down a worry into premises for critical examination
**UI:**
- Header with title
- Original statement at top in a highlighted card
- Each premise rendered as a card with:
  - The premise text
  - A challenge question in muted text
  - Two buttons: "Solid" (sage) and "Questionable" (warm)
- After all premises are evaluated:
  - Conclusion card
  - Philosophical analysis paragraph
  - Summary: "X of Y premises you found questionable — perhaps the conclusion deserves re-examination"

---

## IMPLEMENTATION ORDER FOR CLAUDE CODE

1. **Mobile navigation** (30 min) — Quick win, makes everything look better
2. **New widget components** (2-3 hrs) — Build all 6 new widgets following existing patterns
3. **Inline widgets in chat** (2-3 hrs) — Wire up tool-based invocation + WidgetInChat renderer
4. **Update system prompt** for widget usage (30 min)
5. **Session completion flow** (1 hr)
6. **Philosophy familiarity in onboarding** (1 hr)
7. **Single school focus on Explore page** (30 min)
8. **Error boundaries** (30 min — repetitive, fast)
9. **Loading skeletons** (30 min — repetitive, fast)
10. **Session title auto-gen** (20 min)
11. **Journal tag auto-gen** (20 min)

**Total estimated: ~9-11 hours of Claude Code work**

---

## IMPORTANT REMINDERS

- **Design system is FIXED.** All new components use the same tokens from `globals.css`. No new colors, no new fonts.
- **All widgets must be "use client" components** (they have interactive state).
- **Follow existing patterns.** Look at `BreathingExercise.tsx` and `PhilosophicalDilemma.tsx` as reference for how widgets are structured.
- **Zod validate everything** from the LLM. Tool parameters are validated by Vercel AI SDK automatically, but any additional parsing should use Zod.
- **Test the widget tools** by having a conversation that triggers each one. The system prompt must be explicit about when to use which tool.
- **Credit cost for widget generation:** Each tool invocation in chat should cost 1 additional credit (the message itself costs 1, so a message + widget = 2 credits).