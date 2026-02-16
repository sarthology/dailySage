"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AccountActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClearEverything() {
    setLoading(true);
    try {
      const res = await fetch("/api/reset-account", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to reset account");
      }
      router.push("/dashboard");
    } catch {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
      <h2 className="text-h3 text-ink mb-2">Danger Zone</h2>
      <p className="text-body-sm text-muted mb-4">
        This will permanently delete all your data — sessions, journal entries,
        mood logs, philosophical progress, and dashboard widgets. Your account
        will be reset to a fresh state.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-paper-light"
          >
            Clear Everything
          </Button>
        </DialogTrigger>
        <DialogContent className="border-muted-light bg-paper-light">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-ink">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-muted">
              This action cannot be undone. All your sessions, journal entries,
              mood logs, philosophical paths, and dashboard widgets will be
              permanently deleted. You&apos;ll start fresh from onboarding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-muted-light text-ink"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearEverything}
              disabled={loading}
              className="bg-accent text-paper-light hover:bg-accent-hover"
            >
              {loading ? "Clearing..." : "Yes, Clear Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
