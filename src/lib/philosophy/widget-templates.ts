import type { WidgetType } from "@/types/widget";
import type { MoodQuadrant } from "@/types/mood";

export interface SeedTemplate {
  type: WidgetType;
  mood_tags: MoodQuadrant[];
  content: Record<string, unknown>;
  title: string;
  description: string;
  philosopher?: { name: string; school: string; relevance: string };
}

export const SEED_TEMPLATES: SeedTemplate[] = [
  // --- Breathing Exercises ---
  {
    type: "breathing_exercise",
    mood_tags: ["tense_overwhelmed", "low_struggling"],
    title: "The 4-7-8 Calming Breath",
    description: "A ancient technique refined by Stoic practitioners to restore inner stillness.",
    content: {
      inhale_seconds: 4,
      hold_seconds: 7,
      exhale_seconds: 8,
      cycles: 4,
      technique: "4-7-8 Relaxation",
    },
    philosopher: { name: "Marcus Aurelius", school: "Stoicism", relevance: "Stoic breath control for emotional regulation" },
  },
  {
    type: "breathing_exercise",
    mood_tags: ["energized_happy", "calm_content"],
    title: "Mindful Awareness Breath",
    description: "Simple equal breathing to deepen your present-moment awareness.",
    content: {
      inhale_seconds: 5,
      hold_seconds: 2,
      exhale_seconds: 5,
      cycles: 6,
      technique: "Equal Breathing",
    },
    philosopher: { name: "Thich Nhat Hanh", school: "Buddhism", relevance: "Mindful breathing as the bridge between body and mind" },
  },

  // --- Reflection Prompts ---
  {
    type: "reflection_prompt",
    mood_tags: ["low_struggling", "tense_overwhelmed"],
    title: "The View from Above",
    description: "A Stoic exercise in perspective — see your troubles from the cosmic scale.",
    content: {
      prompt: "Imagine you are looking down at your life from a great height — from above the clouds, above the continent, from space itself. From this vantage point, describe what you see about your current struggle.",
      guiding_questions: [
        "How does this challenge look from the perspective of a year from now?",
        "What would a wise friend say about this situation?",
        "What part of this is within your control?",
      ],
      placeholder: "From this wider perspective, I notice...",
    },
    philosopher: { name: "Marcus Aurelius", school: "Stoicism", relevance: "The cosmic perspective exercise from Meditations" },
  },
  {
    type: "reflection_prompt",
    mood_tags: ["calm_content", "energized_happy"],
    title: "Gratitude of the Present",
    description: "An Epicurean reflection on the simple pleasures available to you right now.",
    content: {
      prompt: "Epicurus taught that happiness comes from appreciating what we already have. Without thinking of what you lack, describe three simple pleasures you can access right now.",
      guiding_questions: [
        "What sensation are you enjoying at this very moment?",
        "Who in your life brings you quiet joy?",
        "What ordinary thing would you miss deeply if it vanished?",
      ],
      placeholder: "Right now, I'm grateful for...",
    },
    philosopher: { name: "Epicurus", school: "Epicureanism", relevance: "Finding contentment in simple, available pleasures" },
  },

  // --- Philosophical Dilemmas ---
  {
    type: "philosophical_dilemma",
    mood_tags: ["tense_overwhelmed", "energized_happy"],
    title: "The Ship of Theseus",
    description: "A classic puzzle about identity and change — who are you after transformation?",
    content: {
      scenario: "A ship's planks are replaced one by one until every original piece is gone. Is it still the same ship? Now consider: you've changed enormously since childhood — every cell replaced, beliefs shifted, relationships transformed. Are you still the same person?",
      choice_a: { label: "Same Ship", description: "Identity persists through continuity of form and purpose, not material.", philosopher: "Aristotle", perspective: "The essence of a thing is its function and pattern, not its matter." },
      choice_b: { label: "New Ship", description: "Without original material, it's a replica — identity requires substance.", philosopher: "Heraclitus", perspective: "You cannot step into the same river twice. Change is the only constant." },
      insight: "Both views reveal something true. You are both continuous and ever-changing. The tension between these truths is what makes personal growth meaningful — you can honor who you were while becoming who you need to be.",
    },
    philosopher: { name: "Plutarch", school: "Stoicism", relevance: "Questions of identity through change" },
  },
  {
    type: "philosophical_dilemma",
    mood_tags: ["low_struggling", "calm_content"],
    title: "The Paradox of Choice",
    description: "When more options lead to less satisfaction — a modern dilemma with ancient roots.",
    content: {
      scenario: "You have the freedom to pursue any career, live anywhere, become anyone. Yet this freedom paralyzes you — every choice means closing a thousand doors. A monk who has chosen one path seems more at peace than you with all your options.",
      choice_a: { label: "Embrace Limits", description: "Voluntary constraint creates depth. Choose one path and commit fully.", philosopher: "Kierkegaard", perspective: "Anxiety is the dizziness of freedom. The leap of faith is choosing without certainty." },
      choice_b: { label: "Stay Open", description: "Keeping options open is itself a valid way of living. Flow like water.", philosopher: "Lao Tzu", perspective: "The Tao that can be told is not the eternal Tao. Remain formless, like water." },
      insight: "The Stoics resolved this by distinguishing between what is 'up to us' and what isn't. You cannot control outcomes, but you can commit to a direction with full presence. The peace you seek comes not from the perfect choice, but from wholehearted engagement with the choice you make.",
    },
    philosopher: { name: "Epictetus", school: "Stoicism", relevance: "Freedom through acceptance of what we can and cannot control" },
  },

  // --- Gratitude Lists ---
  {
    type: "gratitude_list",
    mood_tags: ["calm_content", "energized_happy"],
    title: "Epicurean Pleasures",
    description: "Name the simple, necessary pleasures that ground your day in contentment.",
    content: {
      min_items: 3,
      max_items: 5,
      prompt: "Epicurus divided pleasures into necessary and unnecessary. List the simple, necessary pleasures present in your life today — food, shelter, friendship, a moment of quiet.",
      reflection: "Notice how the deepest contentment comes not from luxury, but from appreciating what sustains you. This is the Epicurean path to ataraxia — tranquility of the soul.",
    },
    philosopher: { name: "Epicurus", school: "Epicureanism", relevance: "The calculus of pleasure and the good life" },
  },
  {
    type: "gratitude_list",
    mood_tags: ["low_struggling", "tense_overwhelmed"],
    title: "What Remains",
    description: "Even in difficulty, certain things endure. Name them.",
    content: {
      min_items: 3,
      max_items: 5,
      prompt: "When life feels overwhelming, it helps to anchor in what hasn't been taken away. What relationships, abilities, or simple comforts remain available to you right now?",
      reflection: "Viktor Frankl, in the darkest circumstances imaginable, discovered that meaning itself cannot be taken from us. By naming what remains, you reconnect with your capacity to find meaning — the last of human freedoms.",
    },
    philosopher: { name: "Seneca", school: "Stoicism", relevance: "Finding abundance through attention to what we have, not what we lack" },
  },

  // --- Mood Reframes ---
  {
    type: "mood_reframe",
    mood_tags: ["tense_overwhelmed"],
    title: "The Obstacle Is the Way",
    description: "Transform your obstacle into an opportunity using Stoic wisdom.",
    content: {
      original_thought: "This situation is unbearable and I can't handle it.",
      reframe: "This difficulty is precisely the training ground I need. Every obstacle contains within it the seed of an equal or greater opportunity for growth.",
      technique: "Stoic Reversal",
      steps: [
        "Name the obstacle clearly — what exactly is threatening you?",
        "Separate fact from story — what happened vs. what you're telling yourself about it",
        "Ask: what virtue does this demand of me? (Courage, patience, wisdom, justice?)",
        "Act on what you can control. Release what you cannot.",
      ],
      reflection_prompt: "What is one small action you can take right now that aligns with the virtue this moment demands?",
    },
    philosopher: { name: "Marcus Aurelius", school: "Stoicism", relevance: "Turning obstacles into advantages through perception" },
  },
  {
    type: "mood_reframe",
    mood_tags: ["low_struggling"],
    title: "Embracing Impermanence",
    description: "Buddhist wisdom on why this feeling will not last forever.",
    content: {
      original_thought: "I feel stuck and nothing will ever change.",
      reframe: "All feelings are visitors. This heaviness is temporary — like weather passing through. You don't need to fix it, just observe it with gentleness.",
      technique: "Buddhist Impermanence",
      steps: [
        "Acknowledge the feeling without judgment — say 'I notice I feel...'",
        "Remember a past difficulty that eventually passed",
        "Observe the physical sensations — where in your body do you feel it?",
        "Gently remind yourself: 'This too shall pass.' Not as dismissal, but as truth.",
      ],
      reflection_prompt: "Can you sit with this feeling for just one more minute, knowing it is temporary?",
    },
    philosopher: { name: "Pema Chödrön", school: "Buddhism", relevance: "The practice of sitting with discomfort" },
  },

  // --- Stoic Meditations ---
  {
    type: "stoic_meditation",
    mood_tags: ["tense_overwhelmed", "low_struggling"],
    title: "Evening Review of Seneca",
    description: "The Stoic practice of examining your day with compassion and clarity.",
    content: {
      technique: "Seneca's Evening Review",
      steps: [
        { instruction: "Settle into stillness. Close your eyes and take three deep breaths.", duration_seconds: 30 },
        { instruction: "Review your day from morning to now. What did you do well? Acknowledge it without pride.", duration_seconds: 60 },
        { instruction: "Where did you fall short of your values? Name it without harsh judgment — as a teacher, not a critic.", duration_seconds: 60 },
        { instruction: "What will you do differently tomorrow? Set one clear intention.", duration_seconds: 45 },
        { instruction: "Release the day. It is done. Rest now with a clear conscience.", duration_seconds: 25 },
      ],
      total_duration_seconds: 220,
    },
    philosopher: { name: "Seneca", school: "Stoicism", relevance: "The examined life through daily self-review" },
  },
  {
    type: "stoic_meditation",
    mood_tags: ["calm_content", "energized_happy"],
    title: "Morning Premeditatio",
    description: "Prepare for the day by imagining difficulties — so nothing catches you off guard.",
    content: {
      technique: "Premeditatio Malorum",
      steps: [
        { instruction: "Sit comfortably. Ground yourself with three slow breaths.", duration_seconds: 25 },
        { instruction: "Imagine the day ahead. What challenges might arise? Visualize them calmly.", duration_seconds: 60 },
        { instruction: "For each challenge, ask: what virtue will I need? Courage, patience, kindness?", duration_seconds: 60 },
        { instruction: "Now imagine handling each difficulty with grace. See yourself responding, not reacting.", duration_seconds: 45 },
        { instruction: "Set your intention: today I will meet whatever comes with equanimity.", duration_seconds: 30 },
      ],
      total_duration_seconds: 220,
    },
    philosopher: { name: "Marcus Aurelius", school: "Stoicism", relevance: "Mental rehearsal for daily challenges" },
  },

  // --- Thought Experiments ---
  {
    type: "thought_experiment",
    mood_tags: ["energized_happy", "calm_content"],
    title: "Nietzsche's Eternal Return",
    description: "If you had to live this exact life infinitely — would you say yes?",
    content: {
      scenario: "Imagine a demon visits you tonight and declares: 'This life, as you have lived it, you will have to live once more and innumerable times more. Every pain, every joy, every thought — in the same sequence.' Would you curse this demon, or would you say: 'You are a god, and never have I heard anything more divine'?",
      questions: [
        "Which parts of your current life would you joyfully relive?",
        "Which parts make you want to change course?",
        "What would you need to change today to say 'yes' to eternal return?",
      ],
      insight: "Nietzsche designed this thought experiment not as a cosmological theory but as a test of life-affirmation. The goal isn't to achieve a perfect life, but to live so deliberately that you could embrace even its difficulties as necessary parts of the whole.",
      further_reading: "The Gay Science, Section 341 — Friedrich Nietzsche",
    },
    philosopher: { name: "Friedrich Nietzsche", school: "Existentialism", relevance: "The ultimate test of whether you're living authentically" },
  },
  {
    type: "thought_experiment",
    mood_tags: ["low_struggling", "tense_overwhelmed"],
    title: "Camus and the Absurd",
    description: "Finding meaning when the universe offers none — the rebel's response.",
    content: {
      scenario: "Sisyphus is condemned to roll a boulder up a hill for eternity, watching it roll back down each time. Camus says we must imagine Sisyphus happy. Your own struggles may feel similarly futile — the same problems returning, the same patterns repeating. Yet Camus argues that the struggle itself, fully embraced, is enough to fill a heart.",
      questions: [
        "What is your 'boulder' right now — the recurring challenge that feels endless?",
        "Can you find any satisfaction in the effort itself, separate from the outcome?",
        "What would it mean to rebel against meaninglessness by choosing joy anyway?",
      ],
      insight: "Absurdism doesn't deny suffering or pretend problems don't exist. It's the radical act of creating meaning through engagement with life despite its apparent meaninglessness. The absurd hero doesn't hope for victory — they find freedom in the struggle itself.",
      further_reading: "The Myth of Sisyphus — Albert Camus",
    },
    philosopher: { name: "Albert Camus", school: "Absurdism", relevance: "Finding freedom and meaning in the face of the absurd" },
  },

  // --- Daily Maxims ---
  {
    type: "daily_maxim",
    mood_tags: ["calm_content", "energized_happy"],
    title: "The Tao of Letting Go",
    description: "A daily reminder from Lao Tzu on the power of non-action.",
    content: {
      maxim: "Nature does not hurry, yet everything is accomplished.",
      explanation: "Wu wei — effortless action — is not laziness or passivity. It's the art of aligning with the natural flow of events rather than forcing outcomes. Like water finding its way downhill, the wisest path often involves yielding rather than pushing.",
      practical_application: "Today, notice one situation where you're forcing an outcome. Experiment with loosening your grip — not giving up, but letting the situation breathe. Act when the moment is right, not when anxiety demands it.",
    },
    philosopher: { name: "Lao Tzu", school: "Taoism", relevance: "Wu wei and the art of effortless action" },
  },
  {
    type: "daily_maxim",
    mood_tags: ["low_struggling", "tense_overwhelmed"],
    title: "Amor Fati",
    description: "Love your fate — even the painful parts.",
    content: {
      maxim: "Do not seek for things to happen the way you want them to. Rather, wish that what happens happen the way it happens. Then you will be happy.",
      explanation: "Epictetus, a former slave, understood suffering intimately. His insight isn't about passive acceptance — it's about redirecting the enormous energy we waste on wishing things were different. When we stop fighting reality, we suddenly have the energy to respond to it wisely.",
      practical_application: "Identify one thing you're currently resisting or wishing were different. For the next hour, experiment with accepting it fully as it is — not approving of it, but acknowledging it. Notice how this shift changes your emotional energy.",
    },
    philosopher: { name: "Epictetus", school: "Stoicism", relevance: "Freedom through alignment with reality" },
  },
  {
    type: "daily_maxim",
    mood_tags: ["energized_happy", "tense_overwhelmed"],
    title: "The Middle Way",
    description: "Balance between extremes — the Buddha's central teaching.",
    content: {
      maxim: "Avoid the two extremes: do not indulge in sensual pleasure, and do not practice harsh austerity. The middle path gives vision and knowledge, and leads to calm, insight, and awakening.",
      explanation: "The Buddha discovered this after years of extreme asceticism nearly killed him. Wisdom lies not in denial or indulgence but in the balanced middle. This applies to emotions too — neither suppressing feelings nor being ruled by them.",
      practical_application: "Notice where you might be swinging to an extreme today — overworking or avoiding work, overthinking or not reflecting at all. Gently adjust toward the middle. Balance is not a fixed point but a continuous, gentle correction.",
    },
    philosopher: { name: "Siddhartha Gautama", school: "Buddhism", relevance: "The middle path between extremes" },
  },

  // --- Progress Visualization ---
  {
    type: "progress_visualization",
    mood_tags: ["calm_content", "energized_happy", "low_struggling", "tense_overwhelmed"],
    title: "Your Philosophical Journey",
    description: "A snapshot of your growth across different schools of thought.",
    content: {
      stats: [
        { label: "Sessions", value: 0, detail: "coaching conversations" },
        { label: "Reflections", value: 0, detail: "journal entries" },
        { label: "Streak", value: 1, detail: "days in a row" },
      ],
      schools: [
        { name: "Stoicism", progress: 0, sessions: 0 },
        { name: "Buddhism", progress: 0, sessions: 0 },
        { name: "Existentialism", progress: 0, sessions: 0 },
      ],
      milestones: [
        { label: "First Session", achieved: false },
        { label: "7-Day Streak", achieved: false },
        { label: "All Schools Explored", achieved: false },
      ],
    },
    philosopher: { name: "Socrates", school: "Stoicism", relevance: "The unexamined life is not worth living" },
  },
];
