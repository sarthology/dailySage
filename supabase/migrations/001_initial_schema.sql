-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  philosophical_profile JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
  credits_remaining INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaching sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  initial_mood JSONB,
  final_mood JSONB,
  messages JSONB DEFAULT '[]',
  widgets_generated JSONB DEFAULT '[]',
  philosophers_referenced TEXT[] DEFAULT '{}',
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  mood_before JSONB,
  mood_after JSONB,
  philosophical_tags TEXT[] DEFAULT '{}',
  ai_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs (granular tracking)
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  mood_vector JSONB NOT NULL,
  mood_label TEXT,
  intensity SMALLINT CHECK (intensity BETWEEN 1 AND 10),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Philosophical journey / progress
CREATE TABLE philosophical_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  philosopher TEXT,
  concept TEXT NOT NULL,
  mastery_level SMALLINT DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  exercises_completed INTEGER DEFAULT 0,
  notes TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached widget templates (for free tier / common problems)
CREATE TABLE widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  mood_tags TEXT[] NOT NULL,
  content JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE philosophical_paths ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users manage own journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own moods" ON mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own paths" ON philosophical_paths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone reads widget templates" ON widget_templates FOR SELECT TO authenticated USING (true);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
