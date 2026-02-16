import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { philosophicalSchools } from "@/lib/philosophy/schools";
import { philosophers } from "@/lib/philosophy/philosophers";
import { QuoteBlock } from "@/components/core/QuoteBlock";
import type { PhilosophicalSchool } from "@/types/philosophy";

interface SchoolPageProps {
  params: Promise<{ school: string }>;
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school: schoolKey } = await params;

  const school = philosophicalSchools[schoolKey as PhilosophicalSchool];
  if (!school) {
    notFound();
  }

  const schoolPhilosophers = philosophers.filter((p) => p.school === schoolKey);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <Link href="/explore" className="text-body-sm text-muted hover:text-ink transition-colors">
          &larr; All Schools
        </Link>

        {/* School Header */}
        <div className="mt-6 mb-12">
          <div className="mb-4">
            <span className={`stamp text-${school.color}`}>{school.name}</span>
          </div>
          <h1 className="text-h1 text-ink mb-2">{school.name}</h1>
          <p className="font-mono text-sm text-muted mb-4">{school.era}</p>
          <p className="text-body text-ink max-w-2xl leading-relaxed">
            {school.core}
          </p>
        </div>

        {/* Best For */}
        <section className="mb-12">
          <h2 className="text-h3 text-ink mb-4">Best For</h2>
          <div className="flex flex-wrap gap-2">
            {school.bestFor.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-muted-light bg-paper-light px-3 py-1.5 font-mono text-xs text-muted"
              >
                {tag.replace("_", " ")}
              </span>
            ))}
          </div>
        </section>

        {/* Philosophers */}
        <section className="mb-12">
          <h2 className="text-h2 text-ink mb-6">Key Thinkers</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {schoolPhilosophers.map((philosopher) => (
              <div
                key={philosopher.name}
                className="rounded-lg border border-muted-light bg-paper-light p-6"
              >
                <h3 className="text-h3 text-ink">{philosopher.name}</h3>
                <p className="font-mono text-xs text-muted mt-1 mb-3">{philosopher.era}</p>
                <p className="text-body-sm text-muted leading-relaxed">{philosopher.bio}</p>

                {philosopher.keyIdeas.length > 0 && (
                  <div className="mt-4">
                    <p className="text-label text-muted mb-2">Key Ideas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {philosopher.keyIdeas.map((idea) => (
                        <span
                          key={idea}
                          className="rounded-sm bg-paper px-2 py-0.5 font-mono text-[0.65rem] text-muted"
                        >
                          {idea}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {schoolPhilosophers.length === 0 && (
              <p className="text-body-sm text-muted italic col-span-2">
                Philosopher profiles for {school.name} are being curated.
              </p>
            )}
          </div>
        </section>

        {/* Quotes from this school */}
        {schoolPhilosophers.some((p) => p.quotes.length > 0) && (
          <section className="mb-12">
            <h2 className="text-h2 text-ink mb-6">Wisdom</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {schoolPhilosophers
                .flatMap((p) =>
                  p.quotes.map((q) => ({
                    ...q,
                    philosopher: p.name,
                  }))
                )
                .slice(0, 6)
                .map((quote, i) => (
                  <QuoteBlock
                    key={i}
                    text={quote.text}
                    philosopher={quote.philosopher}
                    source={quote.source}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
