export type PhilosophicalSchool = "stoicism";

export interface SchoolDefinition {
  name: string;
  era: string;
  core: string;
  bestFor: string[];
  philosophers: string[];
  color: string;
}

export interface Philosopher {
  name: string;
  school: PhilosophicalSchool;
  era: string;
  bio: string;
  keyIdeas: string[];
  quotes: PhilosopherQuote[];
}

export interface PhilosopherQuote {
  text: string;
  source?: string;
  moodTags: string[];
  situationTags: string[];
}

export interface PhilosophicalProfile {
  primarySchool: PhilosophicalSchool;
  description: string;
  stoicConcepts: string[];
  recommendedExercises: string[];
  welcomeQuote: PhilosopherQuote;
  familiarityLevel: "beginner" | "intermediate" | "advanced";
}
