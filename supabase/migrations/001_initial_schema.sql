-- Enable pgvector extension for RAG
create extension if not exists vector;

-- Create discharge_reports table
create table if not exists discharge_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Raw input
  file_url text,
  original_text text,
  
  -- Processing status
  status text check (status in ('processing', 'completed', 'failed')) default 'processing',
  error_message text,
  
  -- AI Output (JSON)
  ai_output jsonb,
  
  -- Vector embedding of the original text for Ask Lens RAG
  embedding vector(1536) -- assuming OpenAI text-embedding-3-small or Gemini text-embedding-004
);

-- Enable RLS
alter table discharge_reports enable row level security;

-- RLS Policies
create policy "Users can insert their own reports"
  on discharge_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own reports"
  on discharge_reports for select
  using (auth.uid() = user_id);

create policy "Users can update their own reports"
  on discharge_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on discharge_reports for delete
  using (auth.uid() = user_id);

-- Hybrid Privacy: Auto-delete reports older than 24 hours
-- This requires the pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, this can be run manually or via an external CRON service.
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'cleanup-old-reports',
--   '0 * * * *', -- every hour
--   $$ delete from discharge_reports where created_at < now() - interval '24 hours' $$
-- );

-- Create a storage bucket for discharge documents
insert into storage.buckets (id, name, public) 
values ('discharges', 'discharges', false)
on conflict do nothing;

-- Storage RLS Policies
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'discharges' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'discharges' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'discharges' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
