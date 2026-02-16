import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }

  return stripeInstance;
}

export const TIERS = {
  starter: {
    name: "Starter",
    credits: 50,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
  },
  growth: {
    name: "Growth",
    credits: 200,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "",
  },
} as const;

export type TierKey = keyof typeof TIERS;
