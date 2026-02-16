"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-wide text-ink">
            Daily Sage
          </Link>
          <p className="mt-2 text-body-sm text-muted">Welcome back, seeker.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="editorial-divider my-8">
          <span className="text-xs text-muted">or</span>
        </div>

        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full rounded-md border-2 border-ink text-sm font-semibold uppercase tracking-[0.05em] text-ink hover:bg-ink hover:text-paper"
        >
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-body-sm text-muted">
          New here?{" "}
          <Link href="/auth/signup" className="font-medium text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
