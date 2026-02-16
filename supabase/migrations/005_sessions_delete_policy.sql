-- Add missing DELETE policy for sessions table
-- Without this, the reset-account endpoint silently fails to delete sessions (chat history)
CREATE POLICY "Users delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);
