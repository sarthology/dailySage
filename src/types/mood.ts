export interface MoodVector {
  /** X-axis: -1 (negative) to 1 (positive) */
  x: number;
  /** Y-axis: -1 (low energy) to 1 (high energy) */
  y: number;
}

export type MoodLabel =
  | "calm"
  | "peaceful"
  | "happy"
  | "energized"
  | "anxious"
  | "tense"
  | "sad"
  | "low"
  | "angry"
  | "intense";

export type MoodQuadrant =
  | "calm_content"      // bottom-right: positive + low energy
  | "energized_happy"   // top-right: positive + high energy
  | "low_struggling"    // bottom-left: negative + low energy
  | "tense_overwhelmed"; // top-left: negative + high energy

export interface MoodLog {
  id: string;
  userId: string;
  sessionId?: string;
  moodVector: MoodVector;
  moodLabel?: MoodLabel;
  intensity: number; // 1-10
  context?: string;
  createdAt: string;
}

export function getMoodQuadrant(vector: MoodVector): MoodQuadrant {
  if (vector.x >= 0 && vector.y >= 0) return "energized_happy";
  if (vector.x >= 0 && vector.y < 0) return "calm_content";
  if (vector.x < 0 && vector.y >= 0) return "tense_overwhelmed";
  return "low_struggling";
}

export function getMoodColor(quadrant: MoodQuadrant): string {
  const map: Record<MoodQuadrant, string> = {
    calm_content: "slate",
    energized_happy: "sage",
    tense_overwhelmed: "warm",
    low_struggling: "muted",
  };
  return map[quadrant];
}
