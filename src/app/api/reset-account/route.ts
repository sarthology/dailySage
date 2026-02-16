import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Delete all user data from every table
  const deletes = await Promise.allSettled([
    supabase.from("mood_logs").delete().eq("user_id", user.id),
    supabase.from("journal_entries").delete().eq("user_id", user.id),
    supabase.from("sessions").delete().eq("user_id", user.id),
    supabase.from("philosophical_paths").delete().eq("user_id", user.id),
    supabase.from("widget_data").delete().eq("user_id", user.id),
  ]);

  // Check for failures
  const failures = deletes.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    return Response.json({ error: "Failed to delete some data" }, { status: 500 });
  }

  // Reset profile to pre-onboarding state
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      onboarding_complete: false,
      philosophical_profile: null,
      dashboard_layout: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
