-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  PRIMARY KEY (id)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id TEXT,
  status TEXT NOT NULL,
  price_id TEXT,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  is_premium BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light',
  openai_api_key TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Users can view own subscriptions."
  ON subscriptions FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions."
  ON subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions."
  ON subscriptions FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can view own settings."
  ON user_settings FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update own settings."
  ON user_settings FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own settings."
  ON user_settings FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- First, let's add logging capability
CREATE EXTENSION IF NOT EXISTS "plpgsql_check";

-- First ensure we have the necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function in public schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  profile_id UUID;
BEGIN
    -- Debug logging
    RAISE LOG 'New user created: %', NEW.id;
    
    -- Create profile
    INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'default_avatar_url'),
        NOW()
    )
    RETURNING id INTO profile_id;
    
    RAISE LOG 'Profile created with ID: %', profile_id;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id,
        is_premium,
        theme,
        plan,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        false,
        'light',
        'free',
        NOW(),
        NOW()
    );
    
    RAISE LOG 'User settings created for ID: %', NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Enable the trigger explicitly
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Add policy for service role
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions
  USING (auth.role() = 'service_role');

