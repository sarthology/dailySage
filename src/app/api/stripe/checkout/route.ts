import { getStripe, TIERS, type TierKey } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return Response.json(
      { error: "Payment system not configured" },
      { status: 503 }
    );
  }

  const body = await req.formData().catch(() => null);
  const tier = (body?.get("tier") as string) || "";

  if (!tier || !(tier in TIERS)) {
    return Response.json({ error: "Invalid tier" }, { status: 400 });
  }

  const tierConfig = TIERS[tier as TierKey];

  if (!tierConfig.priceId) {
    return Response.json(
      { error: "Price not configured for this tier" },
      { status: 503 }
    );
  }

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const origin = req.headers.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: tierConfig.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgrade=success`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: user.id,
    metadata: {
      tier,
      credits: String(tierConfig.credits),
    },
  });

  if (session.url) {
    return Response.redirect(session.url, 303);
  }

  return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
}
