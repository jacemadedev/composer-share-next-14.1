-- First, drop all existing policies on the subscriptions table
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable all actions for service role" ON subscriptions;
DROP POLICY IF EXISTS "Allow service role to insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow service role to update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable full access for service role" ON subscriptions;

-- Revoke existing permissions to start fresh
REVOKE ALL ON subscriptions FROM authenticated;
REVOKE ALL ON subscriptions FROM service_role;

-- Create new comprehensive policy for service role
CREATE POLICY "Enable full access for service role"
ON subscriptions
USING (true)
WITH CHECK (true);

-- Create read-only policy for authenticated users
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Grant new permissions
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT ON subscriptions TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY; 