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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
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
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own subscriptions."
  ON subscriptions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own subscriptions."
  ON subscriptions FOR UPDATE
  USING ( auth.uid() = user_id );

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

-- Modify the handle_new_user function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the start of function execution
  RAISE LOG 'handle_new_user() started for user ID: %', new.id;
  
  BEGIN
    -- Insert into profiles
    INSERT INTO public.profiles (
      id,
      full_name,
      avatar_url,
      updated_at
    ) VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.email),
      COALESCE(new.raw_user_meta_data->>'avatar_url', 'default_avatar_url'),
      now()
    );
    
    RAISE LOG 'Profile created for user ID: %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile: %', SQLERRM;
    RAISE;
  END;

  BEGIN
    -- Insert into user_settings
    INSERT INTO public.user_settings (
      user_id,
      is_premium,
      theme,
      plan,
      created_at,
      updated_at
    ) VALUES (
      new.id,
      false,
      'light',
      'free',
      now(),
      now()
    );
    
    RAISE LOG 'User settings created for user ID: %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user settings: %', SQLERRM;
    RAISE;
  END;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Fatal error in handle_new_user(): %', SQLERRM;
  RETURN new; -- Still return new to allow the user creation even if our handling fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

