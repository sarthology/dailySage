"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorCardProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorCard({ error, reset }: ErrorCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-lg border border-accent/30 bg-paper-light p-8 max-w-md text-center">
        <AlertTriangle size={32} className="mx-auto text-accent mb-4" />
        <h2 className="text-h3 text-ink mb-2">Something went wrong</h2>
        <p className="text-body-sm text-muted mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="rounded-md bg-accent px-6 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-paper-light hover:bg-accent-hover"
          >
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="rounded-md border-2 border-ink px-6 py-2 text-sm font-semibold text-ink w-full"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
