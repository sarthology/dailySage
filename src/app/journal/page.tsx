import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getMoodQuadrant } from "@/types/mood";
import type { MoodLogRow } from "@/lib/supabase/types";
import { JournalContent } from "./JournalContent";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch mood logs for stats + timeline
  const { data: moodsData } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(90);

  const moods = (moodsData || []) as MoodLogRow[];

  // Compute mood stats server-side
  const totalCheckins = moods.length;

  const quadrantCounts = new Map<string, number>();
  let totalValence = 0;
  for (const mood of moods) {
    const q = getMoodQuadrant(mood.mood_vector);
    quadrantCounts.set(q, (quadrantCounts.get(q) || 0) + 1);
    totalValence += mood.mood_vector.x;
  }

  let mostCommonQuadrant = "";
  let maxCount = 0;
  for (const [q, count] of quadrantCounts) {
    if (count > maxCount) {
      mostCommonQuadrant = q;
      maxCount = count;
    }
  }

  const avgValence = moods.length > 0 ? totalValence / moods.length : 0;

  // Streak calculation
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const uniqueDays = new Set(
    moods.map((m) => {
      const d = new Date(m.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);
    if (uniqueDays.has(checkDate.getTime())) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  streak = Math.max(streak, moods.length > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <JournalContent
        moodStats={{
          totalCheckins,
          streak,
          avgValence,
          mostCommonQuadrant,
        }}
        recentMoods={moods}
      />
    </div>
  );
}
