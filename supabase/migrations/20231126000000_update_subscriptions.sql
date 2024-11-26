-- Update subscriptions table to use TEXT instead of UUID for id
ALTER TABLE subscriptions 
  ALTER COLUMN id TYPE TEXT;

-- Add service role policy if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can manage all subscriptions'
    ) THEN
        CREATE POLICY "Service role can manage all subscriptions"
            ON subscriptions
            USING (auth.role() = 'service_role');
    END IF;
END
$$;

-- Update existing RLS policies if needed
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id); 