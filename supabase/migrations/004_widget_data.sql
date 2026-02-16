-- Generic widget data table for gratitude, assessment, and reframe subtypes
CREATE TABLE widget_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  widget_instance_id TEXT,
  data_subtype TEXT NOT NULL CHECK (data_subtype IN ('gratitude', 'assessment', 'reframe')),
  content JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tags column to journal_entries for filtering by theme/context
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags column to mood_logs for filtering by theme/context
ALTER TABLE mood_logs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add dashboard_layout column to profiles (may already exist as JSONB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_layout JSONB;

-- RLS
ALTER TABLE widget_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own widget data" ON widget_data FOR ALL USING (auth.uid() = user_id);

-- Indexes for history queries
CREATE INDEX idx_widget_data_user_subtype ON widget_data(user_id, data_subtype);
CREATE INDEX idx_widget_data_user_created ON widget_data(user_id, created_at DESC);
CREATE INDEX idx_widget_data_tags ON widget_data USING GIN(tags);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX idx_mood_logs_tags ON mood_logs USING GIN(tags);
