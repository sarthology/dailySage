import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    title: "Express, Don't Select",
    description:
      "Place a pin on the Mood Canvas instead of picking from a dropdown. We meet you where you are, not where a checkbox says you should be.",
    icon: "01",
  },
  {
    title: "Philosophy, Not Platitudes",
    description:
      "Real guidance from Stoicism, Existentialism, Buddhism, and more — delivered as practical exercises, not Wikipedia summaries.",
    icon: "02",
  },
  {
    title: "Your Inner Editorial",
    description:
      "A beautiful, adaptive interface that feels like reading a magazine about your inner life. Because clarity deserves good design.",
    icon: "03",
  },
];

const schools = [
  { name: "Stoicism", philosopher: "Marcus Aurelius", color: "text-slate" },
  { name: "Existentialism", philosopher: "Camus", color: "text-ink" },
  { name: "Buddhist Philosophy", philosopher: "Thich Nhat Hanh", color: "text-sage" },
  { name: "Taoism", philosopher: "Laozi", color: "text-sage" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-[1200px] px-4 pt-20 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-caption mb-6 uppercase tracking-[0.2em] text-muted">
            Philosophical Coaching
          </p>
          <h1 className="text-hero mb-6 text-ink">
            Ancient Wisdom.{" "}
            <span className="italic text-accent">Modern Clarity.</span>
          </h1>
          <p className="text-body mx-auto mb-10 max-w-xl text-muted leading-relaxed text-lg">
            Navigate daily anxiety, big decisions, and emotional struggles with
            guidance rooted in centuries of philosophical wisdom — delivered
            through a beautiful, adaptive experience.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="inline-block rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
            >
              Begin Your Journey
            </Link>
            <Link
              href="/explore"
              className="inline-block rounded-md border-2 border-ink px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Explore Schools
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Divider */}
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="editorial-divider">
          <span className="text-muted-light">&#9670;</span>
        </div>
      </div>

      {/* How It Works — 3-panel editorial cards */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
        <h2 className="text-h2 mb-4 text-center text-ink">
          A Different Kind of Guidance
        </h2>
        <p className="text-body-sm mx-auto mb-16 max-w-lg text-center text-muted">
          Not a chatbot. Not a meditation timer. A guided philosophical
          experience that adapts to what you actually need.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.icon}
              className="group rounded-lg border border-muted-light bg-paper-light p-6 transition-shadow duration-300 hover:shadow-md"
            >
              <span className="font-mono text-xs font-medium text-accent">
                {feature.icon}
              </span>
              <h3 className="text-h3 mt-4 mb-3 text-ink">{feature.title}</h3>
              <p className="text-body-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull Quote Section */}
      <section className="border-y border-muted-light bg-paper-light">
        <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="text-quote text-ink">
              &ldquo;We suffer more often in imagination than in reality.&rdquo;
            </p>
            <footer className="mt-6">
              <cite className="text-body-sm font-medium not-italic text-muted">
                — Seneca, <span className="font-mono text-xs">Letters to Lucilius</span>
              </cite>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Schools Preview */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
        <h2 className="text-h2 mb-4 text-center text-ink">
          Seven Schools of Thought
        </h2>
        <p className="text-body-sm mx-auto mb-16 max-w-lg text-center text-muted">
          From Stoicism to Taoism — the app matches you with the philosophical
          tradition that speaks to your situation.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {schools.map((school) => (
            <div
              key={school.name}
              className="flex flex-col items-center rounded-lg border border-muted-light bg-paper-light p-6 text-center transition-shadow duration-300 hover:shadow-md"
            >
              <div className="stamp mb-4 text-muted">{school.name}</div>
              <p className="text-body-sm text-muted">{school.philosopher}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-muted-light bg-paper-light">
        <div className="mx-auto max-w-[1200px] px-4 py-20 text-center md:px-8 md:py-28">
          <h2 className="text-h2 mb-4 text-ink">
            Ready to Think Differently?
          </h2>
          <p className="text-body-sm mx-auto mb-10 max-w-md text-muted">
            Start with a 30-second mood check-in. The philosophy will find you.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block rounded-md bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
          >
            Begin Your Journey
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
