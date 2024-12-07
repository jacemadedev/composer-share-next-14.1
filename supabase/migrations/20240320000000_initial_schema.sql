-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create profiles table (instead of users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create user_settings table
create table if not exists public.user_settings (
  user_id uuid references auth.users not null primary key,
  openai_api_key text,
  plan text default 'free',
  is_premium boolean default false,
  theme text default 'light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  customer_id text,
  status text not null,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  ended_at timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);

-- Create chat_history table (instead of conversations)
create table if not exists public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  title text,
  messages jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create history table
create table if not exists public.history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  chat_id uuid references public.chat_history(id) on delete cascade,
  action_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.chat_history enable row level security;
alter table public.history enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- User settings policies
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage all subscriptions"
  on public.subscriptions
  using (auth.role() = 'service_role');

-- Chat history policies
create policy "Users can view their own chat history"
  on public.chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat history"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat history"
  on public.chat_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chat history"
  on public.chat_history for delete
  using (auth.uid() = user_id);

-- History policies
create policy "Users can view their own history"
  on public.history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own history"
  on public.history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own history"
  on public.history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own history"
  on public.history for delete
  using (auth.uid() = user_id);

-- Create functions and triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.user_settings
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.chat_history
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.history
  for each row
  execute function public.handle_updated_at();

-- Create indexes for faster queries
create index if not exists idx_history_user_id on public.history(user_id);
create index if not exists idx_history_chat_id on public.history(chat_id);
create index if not exists idx_history_created_at on public.history(created_at);

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role; 