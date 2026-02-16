"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Not authenticated");
      return null;
    }

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }

    setProfile(data as Profile);
    setLoading(false);
    return data as Profile;
  }, [supabase]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, "display_name" | "avatar_url" | "onboarding_complete" | "philosophical_profile" | "preferences">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      setProfile(data as Profile);
      return data as Profile;
    },
    [supabase]
  );

  const isOnboardingComplete = useCallback(() => {
    return profile?.onboarding_complete ?? false;
  }, [profile]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    isOnboardingComplete,
  };
}
