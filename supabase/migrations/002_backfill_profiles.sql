-- Backfill profiles for existing users who don't have one yet
-- This handles users created before the initial migration

INSERT INTO public.profiles (id)
SELECT id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = users.id
)
ON CONFLICT (id) DO NOTHING;
