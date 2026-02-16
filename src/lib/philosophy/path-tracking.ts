import type { PhilosophicalSchool } from "@/types/philosophy";
import type { PhilosophicalPathRow } from "@/lib/supabase/types";

const MASTERY_THRESHOLDS = [0, 2, 5, 10, 20, 35];

export function calculateMastery(exercisesCompleted: number): number {
  for (let level = MASTERY_THRESHOLDS.length - 1; level >= 0; level--) {
    if (exercisesCompleted >= MASTERY_THRESHOLDS[level]) {
      return level;
    }
  }
  return 0;
}

export function exercisesForNextLevel(currentMastery: number): number | null {
  if (currentMastery >= 5) return null;
  return MASTERY_THRESHOLDS[currentMastery + 1];
}

export function shouldUnlockPath(
  school: PhilosophicalSchool,
  existingPaths: PhilosophicalPathRow[]
): boolean {
  // Don't auto-create if user already has a general path for this school
  return !existingPaths.some(
    (p) => p.school === school && p.concept === "general"
  );
}

export interface SchoolProgress {
  school: string;
  totalExercises: number;
  avgMastery: number;
  conceptCount: number;
}

export function aggregateSchoolProgress(
  paths: PhilosophicalPathRow[]
): SchoolProgress[] {
  const grouped = new Map<string, PhilosophicalPathRow[]>();

  for (const path of paths) {
    const existing = grouped.get(path.school) || [];
    existing.push(path);
    grouped.set(path.school, existing);
  }

  return Array.from(grouped.entries())
    .map(([school, schoolPaths]) => ({
      school,
      totalExercises: schoolPaths.reduce((sum, p) => sum + p.exercises_completed, 0),
      avgMastery:
        schoolPaths.reduce((sum, p) => sum + p.mastery_level, 0) / schoolPaths.length,
      conceptCount: schoolPaths.length,
    }))
    .sort((a, b) => b.totalExercises - a.totalExercises);
}
