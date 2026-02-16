"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type CreditAction, getCreditCost, hasEnoughCredits } from "@/lib/utils/credits";

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const getCredits = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("credits_remaining")
      .eq("id", user.id)
      .single();

    if (error) {
      setLoading(false);
      return null;
    }

    const balance = (data as { credits_remaining: number }).credits_remaining;
    setCredits(balance);
    setLoading(false);
    return balance;
  }, [supabase]);

  const deductCredit = useCallback(
    async (action: CreditAction): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const cost = getCreditCost(action);

      // Use RPC or manual check-and-update
      const { data, error } = await supabase
        .from("profiles")
        .select("credits_remaining")
        .eq("id", user.id)
        .single();

      if (error) return false;

      const current = (data as { credits_remaining: number }).credits_remaining;
      if (!hasEnoughCredits(current, action)) return false;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits_remaining: current - cost })
        .eq("id", user.id);

      if (updateError) return false;

      setCredits(current - cost);
      return true;
    },
    [supabase]
  );

  const canAfford = useCallback(
    (action: CreditAction): boolean => {
      if (credits === null) return false;
      return hasEnoughCredits(credits, action);
    },
    [credits]
  );

  useEffect(() => {
    getCredits();
  }, [getCredits]);

  return {
    credits,
    loading,
    getCredits,
    deductCredit,
    canAfford,
  };
}
