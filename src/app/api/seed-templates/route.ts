import { createClient } from "@/lib/supabase/server";
import { SEED_TEMPLATES } from "@/lib/philosophy/widget-templates";

export async function POST(req: Request) {
  // Admin-only: check for ADMIN_SECRET header
  const adminSecret = process.env.ADMIN_SECRET;
  const provided = req.headers.get("x-admin-secret");

  if (!adminSecret || provided !== adminSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Check if templates already exist (idempotent)
  const { count } = await supabase
    .from("widget_templates")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return Response.json({
      message: "Templates already seeded",
      count,
    });
  }

  // Insert seed templates
  const rows = SEED_TEMPLATES.map((t) => ({
    type: t.type,
    mood_tags: t.mood_tags,
    content: {
      ...t.content,
      title: t.title,
      description: t.description,
      philosopher: t.philosopher,
    },
    usage_count: 0,
  }));

  const { data, error } = await supabase
    .from("widget_templates")
    .insert(rows)
    .select();

  if (error) {
    return Response.json(
      { error: `Failed to seed templates: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({
    message: "Templates seeded successfully",
    count: data?.length || 0,
  });
}
