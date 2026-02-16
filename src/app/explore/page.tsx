import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { philosophicalSchools } from "@/lib/philosophy/schools";

export default function ExplorePage() {
  const schools = Object.entries(philosophicalSchools);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="mb-12 text-center">
          <p className="text-caption mb-2 uppercase tracking-[0.2em] text-muted">
            Explore
          </p>
          <h1 className="text-h1 mb-4 text-ink">Schools of Thought</h1>
          <p className="text-body mx-auto max-w-lg text-muted">
            Seven philosophical traditions, each offering a different lens for
            understanding yourself and the world.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.map(([key, school]) => (
            <Link
              key={key}
              href={`/explore/${key}`}
              className="group rounded-lg border border-muted-light bg-paper-light p-6 transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-4">
                <span className={`stamp text-${school.color}`}>
                  {school.name}
                </span>
              </div>
              <p className="font-mono text-xs text-muted mb-3">{school.era}</p>
              <p className="text-body-sm text-ink leading-relaxed">
                {school.core}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {school.bestFor.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-paper px-2 py-0.5 text-[0.7rem] font-mono text-muted"
                  >
                    {tag.replace("_", " ")}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-body-sm text-muted">
                {school.philosophers.slice(0, 3).join(", ")}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
