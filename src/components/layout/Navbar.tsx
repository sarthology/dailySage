import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-muted-light bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <MobileNav isAuthenticated={!!user} />
          <Link
            href={user ? "/dashboard" : "/"}
            className="font-display text-xl font-extrabold tracking-wide text-ink"
          >
            Philosopher Coach
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="hidden text-sm font-medium text-muted transition-colors duration-150 hover:text-ink md:block"
          >
            Explore
          </Link>
          <Link
            href="/paths"
            className="hidden text-sm font-medium text-muted transition-colors duration-150 hover:text-ink md:block"
          >
            Journey
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-muted transition-colors duration-150 hover:text-ink md:block"
              >
                Dashboard
              </Link>
              <Link
                href="/session/new"
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
              >
                New Session
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light transition-colors duration-150 hover:bg-accent-hover"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
