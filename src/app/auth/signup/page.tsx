"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-h2 mb-4 text-ink">Check Your Email</h1>
          <p className="text-body text-muted">
            We&apos;ve sent a confirmation link to <strong className="text-ink">{email}</strong>.
            Click it to begin your philosophical journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-wide text-ink">
            Philosopher Coach
          </Link>
          <p className="mt-2 text-body-sm text-muted">Begin your journey.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-label text-ink mb-1 block">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-muted-light bg-paper-light text-ink placeholder:text-muted focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-label text-ink mb-1 block">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-muted-light bg-paper-light text-ink placeholder:text-muted focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-body-sm text-accent">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="editorial-divider my-8">
          <span className="text-xs text-muted">or</span>
        </div>

        <Button
          onClick={handleGoogleSignup}
          variant="outline"
          className="w-full rounded-md border-2 border-ink text-sm font-semibold uppercase tracking-[0.05em] text-ink hover:bg-ink hover:text-paper"
        >
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-body-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
