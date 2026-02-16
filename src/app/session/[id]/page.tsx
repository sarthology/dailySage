import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { createClient } from "@/lib/supabase/server";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Handle "new" session creation
  if (id === "new") {
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        status: "active",
        messages: [],
        widgets_generated: [],
        philosophers_referenced: [],
        token_count: 0,
      })
      .select()
      .single();

    if (error || !session) {
      redirect("/dashboard");
    }

    redirect(`/session/${session.id}`);
  }

  // Fetch existing session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <ChatContainer sessionId={id} initialMessages={session.messages as any[] ?? []} />
    </div>
  );
}
