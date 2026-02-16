import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore philosophical wisdom at your own pace.",
    features: [
      "5 curated exercises per day",
      "Browse all philosophical schools",
      "Journal with manual reflection",
      "Basic mood tracking",
    ],
    cta: "Current Plan",
    ctaStyle: "border-2 border-muted-light text-muted cursor-default",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Live AI coaching and personalized philosophical guidance.",
    features: [
      "50 credits/month (~25 sessions)",
      "Live philosophical coaching",
      "AI journal reflections",
      "All widget types, live-generated",
      "Mood trend analysis",
    ],
    cta: "Coming Soon",
    ctaStyle: "bg-accent text-paper-light hover:bg-accent-hover",
    highlight: true,
    tier: "starter",
  },
  {
    name: "Growth",
    price: "$24",
    period: "/month",
    description: "For serious seekers building a daily philosophical practice.",
    features: [
      "200 credits/month (~100 sessions)",
      "Everything in Starter",
      "Priority response times",
      "Philosophical path tracking",
      "Advanced progress analytics",
    ],
    cta: "Coming Soon",
    ctaStyle: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
    highlight: false,
    tier: "growth",
  },
];

export default function PricingPage() {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-16">
        <div className="mb-12 text-center">
          <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted">
            Pricing
          </p>
          <h1 className="text-h1 mb-4 text-ink">Invest in Your Inner Life</h1>
          <p className="text-body mx-auto max-w-lg text-muted">
            Ancient wisdom shouldn&apos;t be locked behind a paywall. Start free,
            upgrade when you&apos;re ready for deeper guidance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border bg-paper-light p-6 flex flex-col ${
                tier.highlight
                  ? "border-accent shadow-md"
                  : "border-muted-light"
              }`}
            >
              {tier.highlight && (
                <p className="font-mono text-xs font-medium text-accent uppercase tracking-wider mb-2">
                  Most Popular
                </p>
              )}
              <h2 className="text-h3 text-ink">{tier.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-ink">
                  {tier.price}
                </span>
                <span className="text-body-sm text-muted">{tier.period}</span>
              </div>
              <p className="text-body-sm text-muted mt-2 mb-6">
                {tier.description}
              </p>

              <ul className="space-y-2 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="text-body-sm text-ink flex gap-2">
                    <span className="text-sage shrink-0 mt-0.5">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.tier && stripeConfigured ? (
                <form action={`/api/stripe/checkout`} method="POST">
                  <input type="hidden" name="tier" value={tier.tier} />
                  <button
                    type="submit"
                    className={`w-full rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] transition-colors duration-150 ${tier.ctaStyle}`}
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <span
                  className={`block w-full rounded-md px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.05em] transition-colors duration-150 ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Credit explainer */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-h3 text-ink text-center mb-6">How Credits Work</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-muted-light bg-paper-light p-4">
              <p className="font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Coaching message
              </p>
              <p className="font-display text-lg font-bold text-ink">1 credit</p>
            </div>
            <div className="rounded-md border border-muted-light bg-paper-light p-4">
              <p className="font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Widget generation
              </p>
              <p className="font-display text-lg font-bold text-ink">2 credits</p>
            </div>
            <div className="rounded-md border border-muted-light bg-paper-light p-4">
              <p className="font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Journal reflection
              </p>
              <p className="font-display text-lg font-bold text-ink">1 credit</p>
            </div>
            <div className="rounded-md border border-muted-light bg-paper-light p-4">
              <p className="font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Onboarding analysis
              </p>
              <p className="font-display text-lg font-bold text-ink">3 credits</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="text-body-sm text-muted hover:text-ink transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
