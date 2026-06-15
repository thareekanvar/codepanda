-- Create reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade,
  pr_url text not null,
  issue_description text,
  code_diff text,
  result jsonb,
  created_at timestamptz default now()
);

-- Create index on repository_id for faster queries
create index if not exists reviews_repo_idx on reviews (repository_id);

-- Enable RLS
alter table reviews enable row level security;

-- Policies for public read/write access (using service role key on server anyway, but safe defaults)
create policy "Allow public read access to reviews"
  on reviews for select
  using (true);

create policy "Allow public insert access to reviews"
  on reviews for insert
  with check (true);
