-- FounderVoice AI — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ───── Profiles ─────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  linkedin_url text,
  avatar_url text,
  voice_style jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ───── Voice Samples ─────
create table if not exists voice_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  audio_url text not null,
  transcript text,
  processed boolean default false,
  created_at timestamptz default now()
);

-- ───── Drafts ─────
create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  raw_transcript text not null,
  ai_output text,
  status text default 'draft' check (status in ('draft', 'pending', 'approved', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ───── Indexes ─────
create index if not exists idx_voice_samples_user on voice_samples(user_id);
create index if not exists idx_drafts_user on drafts(user_id);
create index if not exists idx_drafts_status on drafts(status);

-- ───── Schema Additions ─────
alter table profiles add column if not exists phone_number text unique;

alter table drafts add column if not exists variation_type text check (variation_type in ('short', 'deep_dive', 'carousel'));
alter table drafts add column if not exists source_audio_url text;

-- ───── Trial & Subscription ─────
alter table profiles add column if not exists subscription_tier text not null default 'trial' check (subscription_tier in ('trial', 'basic', 'pro', 'founder'));
alter table profiles add column if not exists trial_started_at timestamptz not null default now();

-- ───── Multimodal Input ─────
alter table drafts add column if not exists source_image_url text;

-- ───── Daily Rate Limiting ─────
alter table profiles add column if not exists daily_requests_count int not null default 0;
alter table profiles add column if not exists last_request_date date;

-- ───── WhatsApp Sync Token ─────
alter table profiles add column if not exists whatsapp_sync_token text unique;
alter table profiles add column if not exists whatsapp_sync_expires_at timestamptz;

-- ───── Voice DNA & Preferences ─────
alter table profiles add column if not exists voice_dna text;
alter table profiles add column if not exists context_vault text;
alter table profiles add column if not exists whatsapp_notifications boolean not null default true;

-- ───── Row Level Security ─────
alter table profiles enable row level security;
alter table voice_samples enable row level security;
alter table drafts enable row level security;

-- Users can only access their own data
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own voice samples"
  on voice_samples for select using (auth.uid() = user_id);

create policy "Users can insert own voice samples"
  on voice_samples for insert with check (auth.uid() = user_id);

create policy "Users can view own drafts"
  on drafts for select using (auth.uid() = user_id);

create policy "Users can insert own drafts"
  on drafts for insert with check (auth.uid() = user_id);

create policy "Users can update own drafts"
  on drafts for update using (auth.uid() = user_id);

create policy "Users can delete own drafts"
  on drafts for delete using (auth.uid() = user_id);
