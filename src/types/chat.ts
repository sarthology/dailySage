export type ChatMode = "dialogue" | "praxis" | "discourse" | "elenchus";

export interface ChatModeConfig {
  key: ChatMode;
  label: string;
  shortDescription: string;
  description: string;
}

export const CHAT_MODES: ChatModeConfig[] = [
  {
    key: "dialogue",
    label: "Open",
    shortDescription: "Exercises + conversation",
    description: "The coach responds freely, using exercises and conversation as needed",
  },
  {
    key: "praxis",
    label: "Practice",
    shortDescription: "Exercises first",
    description: "Focus on interactive exercises, reflections, and tools",
  },
  {
    key: "discourse",
    label: "Chat",
    shortDescription: "Just talking",
    description: "Pure philosophical conversation \u2014 no widgets or exercises",
  },
  {
    key: "elenchus",
    label: "Challenge",
    shortDescription: "Socratic method",
    description: "The coach challenges you with probing questions instead of answers",
  },
];

export const MODE_PLACEHOLDERS: Record<ChatMode, string> = {
  dialogue: "What\u2019s on your mind?",
  praxis: "What would you like to practice?",
  discourse: "Let\u2019s talk philosophy...",
  elenchus: "Present a belief to examine...",
};
