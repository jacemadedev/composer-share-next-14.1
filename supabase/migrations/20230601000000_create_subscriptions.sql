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

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Insert into user_settings with default values including plan
  INSERT INTO public.user_settings (user_id, is_premium, theme, plan)
  VALUES (new.id, false, 'light', 'free');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Secure the function
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

