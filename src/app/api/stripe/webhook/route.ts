import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return Response.json(
      { error: "Payment system not configured" },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (userId && credits > 0) {
      const supabase = await createClient();

      // Fetch current credits and add
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits_remaining")
        .eq("id", userId)
        .single();

      if (profile) {
        const current = (profile as { credits_remaining: number }).credits_remaining;
        await supabase
          .from("profiles")
          .update({ credits_remaining: current + credits })
          .eq("id", userId);
      }
    }
  }

  return Response.json({ received: true });
}
