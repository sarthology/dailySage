import type { WidgetType } from "@/types/widget";
import { WIDGET_REGISTRY } from "./widget-registry";
import type { WidgetBehavior } from "@/types/widget-behaviors";

export interface WidgetPreset {
  widgetType: WidgetType;
  label: string;
  description: string;
  icon: string;
  defaultArgs: Record<string, unknown>;
}

export const WIDGET_PRESETS: WidgetPreset[] = [
  {
    widgetType: "breathing_exercise",
    label: "Breathing Exercise",
    description: "Guided 4-7-8 breathing for calm and focus",
    icon: "🌬",
    defaultArgs: {
      title: "Stoic Breathing",
      description: "Center yourself with rhythmic breathing — a practice Marcus Aurelius used before addressing the Senate.",
      inhaleSeconds: 4,
      holdSeconds: 7,
      exhaleSeconds: 8,
      cycles: 3,
    },
  },
  {
    widgetType: "reflection_prompt",
    label: "Reflection Prompt",
    description: "A guided Stoic self-inquiry question",
    icon: "💭",
    defaultArgs: {
      title: "Evening Reflection",
      description: "A nightly practice from Seneca's letters",
      prompt: "What did I do well today? Where did I fall short? What can I do better tomorrow?",
      guidingQuestions: [
        "Did I act according to my values?",
        "Where did I let externals disturb my peace?",
        "What virtue did I practice today?",
      ],
    },
  },
  {
    widgetType: "daily_maxim",
    label: "Daily Maxim",
    description: "A Stoic quote with practical application",
    icon: "📜",
    defaultArgs: {
      quote: "The happiness of your life depends upon the quality of your thoughts.",
      philosopher: "Marcus Aurelius",
      school: "Stoicism",
      explanation: "Our judgments — not events — determine our experience. This is the foundation of Stoic psychology.",
      practicalApplication: "Before reacting to any situation today, pause and ask: 'Is this within my control?' If not, release it.",
    },
  },
  {
    widgetType: "gratitude_list",
    label: "Gratitude List",
    description: "Stoic gratitude exercise with guided prompts",
    icon: "🙏",
    defaultArgs: {
      title: "Stoic Gratitude",
      description: "Negative visualization in reverse — appreciate what you have by imagining its absence.",
      prompt: "What would you miss most if it were taken from you today?",
      minItems: 3,
      maxItems: 5,
      reflectionOnComplete: "Epictetus taught: 'He is a wise man who does not grieve for the things he has not, but rejoices for those which he has.'",
    },
  },
  {
    widgetType: "mood_reframe",
    label: "Mood Reframe",
    description: "Cognitive reframing using Stoic principles",
    icon: "🔄",
    defaultArgs: {
      title: "Stoic Reframe",
      description: "Apply the Stoic lens to transform negative thought patterns",
      originalThought: "Everything is going wrong today.",
      technique: "Dichotomy of Control",
      steps: [
        "Identify the judgment you're making about the situation",
        "Separate what's within your control from what isn't",
        "Focus your energy only on what you can influence",
        "Accept the rest with Stoic equanimity",
      ],
      reframedThought: "Some things didn't go as planned, but I can control my response and focus on what's next.",
    },
  },
  {
    widgetType: "stoic_meditation",
    label: "Stoic Meditation",
    description: "Guided meditation (view from above, negative visualization)",
    icon: "🧘",
    defaultArgs: {
      title: "View from Above",
      description: "Marcus Aurelius' perspective-shifting meditation from Meditations Book 9",
      steps: [
        { instruction: "Close your eyes. Visualize yourself sitting where you are now.", durationSeconds: 15 },
        { instruction: "Rise above — see the room, the building, the city from above.", durationSeconds: 20 },
        { instruction: "Continue rising — see the continent, the Earth, the cosmos.", durationSeconds: 20 },
        { instruction: "From this vantage point, observe how small your worries appear.", durationSeconds: 15 },
        { instruction: "Slowly return. Carry this perspective with you.", durationSeconds: 10 },
      ],
      reflectionPrompt: "What seemed large before that now feels manageable from this cosmic perspective?",
    },
  },
  {
    widgetType: "thought_experiment",
    label: "Thought Experiment",
    description: "A Stoic scenario for expanding perspective",
    icon: "🔬",
    defaultArgs: {
      title: "The Last Day",
      description: "Seneca's most powerful thought experiment",
      scenario: "Imagine this were your last day. How would you spend it? What conversations would you have? What would you let go of?",
      questions: [
        "What would you stop postponing?",
        "Who would you forgive?",
        "What trivial worry would you immediately drop?",
      ],
      insight: "Seneca wrote: 'Let us prepare our minds as if we'd come to the very end of life.' This isn't morbid — it's clarity.",
      philosopher: "Seneca",
    },
  },
  {
    widgetType: "obstacle_reframe",
    label: "Obstacle Reframe",
    description: "Apply the dichotomy of control to a challenge",
    icon: "🏔",
    defaultArgs: {
      title: "The Obstacle Is the Way",
      obstacle: "A challenge or setback you're currently facing",
      withinControl: [
        "Your response and attitude",
        "The effort you put into solving it",
        "Seeking help and advice",
      ],
      outsideControl: [
        "Other people's decisions",
        "Timing and external circumstances",
        "Past events that led here",
      ],
      actionPlan: "Focus exclusively on what you can control. Start with the smallest actionable step.",
      stoicQuote: "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
    },
  },
  {
    widgetType: "values_wheel",
    label: "Values Wheel",
    description: "Clarify your values across life domains",
    icon: "🎯",
    defaultArgs: {
      title: "Stoic Values Audit",
      domains: [
        { name: "Wisdom", question: "Am I pursuing knowledge and making sound judgments?" },
        { name: "Courage", question: "Am I facing difficulties with bravery and honesty?" },
        { name: "Justice", question: "Am I treating others fairly and contributing to community?" },
        { name: "Temperance", question: "Am I exercising self-discipline and moderation?" },
        { name: "Relationships", question: "Am I showing up authentically for the people I care about?" },
        { name: "Purpose", question: "Am I living in alignment with my deeper calling?" },
      ],
      reflectionPrompt: "Which virtue needs the most attention this week? What one action could strengthen it?",
    },
  },
  {
    widgetType: "philosophical_dilemma",
    label: "Philosophical Dilemma",
    description: "A Stoic ethical dilemma to sharpen reasoning",
    icon: "⚖️",
    defaultArgs: {
      title: "The Ring of Gyges",
      description: "A thought experiment on virtue and visibility",
      scenario: "If you had a ring that made you invisible — meaning no one could ever know what you did — would you still act virtuously?",
      optionA: { label: "Yes, always", description: "Virtue is its own reward. Character is who you are when no one watches." },
      optionB: { label: "It depends", description: "Social accountability is part of what makes virtue practical. Remove it, and human nature shifts." },
      insight: "The Stoics argued that virtue is the sole good — not because of reputation, but because it's the natural expression of a rational soul aligned with nature.",
    },
  },
  {
    widgetType: "quote_challenge",
    label: "Quote Challenge",
    description: "Guess the Stoic philosopher — build literacy",
    icon: "❓",
    defaultArgs: {
      quote: "We suffer more often in imagination than in reality.",
      options: [
        { name: "Seneca", school: "Stoicism" },
        { name: "Marcus Aurelius", school: "Stoicism" },
        { name: "Epictetus", school: "Stoicism" },
      ],
      correctIndex: 0,
      explanation: "This is from Seneca's Letters to Lucilius. It captures his core teaching that most of our suffering is self-created through anticipation and worry.",
    },
  },
  {
    widgetType: "weekly_review",
    label: "Weekly Review",
    description: "Structured weekly Stoic self-examination",
    icon: "📋",
    defaultArgs: {
      title: "Weekly Stoic Review",
      prompts: [
        { question: "What virtue did I practice most this week?", placeholder: "Courage, wisdom, justice, temperance..." },
        { question: "Where did I fall short of my principles?", placeholder: "A moment of anger, avoidance, dishonesty..." },
        { question: "What am I grateful for?", placeholder: "People, experiences, lessons..." },
        { question: "What's my intention for next week?", placeholder: "One specific virtue to focus on..." },
      ],
      closingReflection: "Seneca reviewed each day; you've reviewed the whole week. Progress, not perfection, is the Stoic way.",
    },
  },
  {
    widgetType: "cognitive_distortion",
    label: "Cognitive Distortion",
    description: "Identify thought distortions with Stoic reasoning",
    icon: "🧠",
    defaultArgs: {
      title: "Thought Pattern Check",
      userThought: "I'll never be good enough.",
      distortionType: "Overgeneralization",
      explanation: "This takes one instance of perceived failure and extends it to all of life — 'never' and 'always' are the hallmarks.",
      philosophicalCounter: "Epictetus would say: 'It is not things that disturb us, but our judgments about things.' The word 'never' is a judgment, not a fact.",
      reframedPerspective: "I struggled with this particular thing. That doesn't define my entire capability. What can I learn from it?",
    },
  },
  {
    widgetType: "argument_mapper",
    label: "Argument Mapper",
    description: "Break down worries into premises for examination",
    icon: "🗺",
    defaultArgs: {
      title: "Stoic Argument Analysis",
      originalStatement: "I should be worried about the future.",
      premises: [
        { text: "The future is uncertain.", challengeQuestion: "Has uncertainty always led to bad outcomes for you?" },
        { text: "Uncertainty means danger.", challengeQuestion: "Can uncertainty also mean opportunity?" },
        { text: "I should prepare for the worst.", challengeQuestion: "Is worry the same as preparation?" },
      ],
      conclusion: "Therefore I should be worried.",
      philosophicalAnalysis: "Seneca distinguished between 'premeditatio malorum' (useful preparation) and anxious worry (useless suffering). Prepare, yes. Suffer in advance, no.",
    },
  },
  {
    widgetType: "feeling_picker",
    label: "Feeling Picker",
    description: "Quick mood check — tap to share with your coach",
    icon: "😊",
    defaultArgs: {
      title: "How are you feeling?",
      description: "Tap a feeling to share with your coach",
    },
  },
  {
    widgetType: "quick_prompt",
    label: "Quick Prompts",
    description: "Predefined conversation starters for your coach",
    icon: "💬",
    defaultArgs: {
      title: "Quick Start",
      prompts: [
        { text: "I need help calming down", icon: "🧘" },
        { text: "Help me think through a decision", icon: "🤔" },
        { text: "I want to reflect on my day", icon: "📝" },
        { text: "I'm struggling with motivation", icon: "💪" },
      ],
    },
  },
];

/** Get presets filtered by primary behavior */
export function getPresetsByBehavior(behavior: WidgetBehavior): WidgetPreset[] {
  return WIDGET_PRESETS.filter(
    (p) => WIDGET_REGISTRY[p.widgetType]?.primaryBehavior === behavior
  );
}
