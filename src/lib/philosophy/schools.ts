import type { PhilosophicalSchool, SchoolDefinition } from "@/types/philosophy";

export const philosophicalSchools: Record<PhilosophicalSchool, SchoolDefinition> = {
  stoicism: {
    name: "Stoicism",
    era: "Ancient Greece/Rome",
    core: "Focus on what you can control, accept what you cannot",
    bestFor: ["anxiety", "anger", "frustration", "uncertainty", "grief", "overwhelm"],
    philosophers: ["Marcus Aurelius", "Epictetus", "Seneca"],
    color: "slate",
  },
} as const;
