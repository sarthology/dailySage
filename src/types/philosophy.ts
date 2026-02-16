export type PhilosophicalSchool =
  | "stoicism"
  | "existentialism"
  | "buddhism"
  | "absurdism"
  | "taoism"
  | "epicureanism"
  | "pragmatism";

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
  secondarySchool?: PhilosophicalSchool;
  description: string;
  recommendedExercises: string[];
  welcomeQuote: PhilosopherQuote;
}
