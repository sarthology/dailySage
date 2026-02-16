import type { MoodVector } from "./mood";

export type SessionStatus = "active" | "completed" | "archived";

export interface Session {
  id: string;
  userId: string;
  title?: string;
  status: SessionStatus;
  initialMood?: MoodVector;
  finalMood?: MoodVector;
  messages: SessionMessage[];
  widgetsGenerated: string[];
  philosophersReferenced: string[];
  tokenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  widgets?: string[];
}
