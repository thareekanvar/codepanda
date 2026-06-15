-- Enable pgvector extension
create extension if not exists vector;

-- Repositories table
create table if not exists repositories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  architecture_summary text,
  created_at timestamptz default now()
);

-- Repository chunks for RAG
create table if not exists repository_chunks (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id) on delete cascade,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),
  created_at timestamptz default now()
);

-- HNSW index for fast cosine similarity search
create index if not exists repository_chunks_embedding_idx
  on repository_chunks
  using hnsw (embedding vector_cosine_ops);

-- Index on repository_id for faster lookups
create index if not exists repository_chunks_repo_idx
  on repository_chunks (repository_id);

-- RPC function for similarity search
create or replace function match_repository_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_repository_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    rc.id,
    rc.content,
    rc.metadata,
    1 - (rc.embedding <=> query_embedding) as similarity
  from repository_chunks rc
  where rc.repository_id = filter_repository_id
    and 1 - (rc.embedding <=> query_embedding) > match_threshold
  order by rc.embedding <=> query_embedding
  limit match_count;
$$;

-- ─── ROW LEVEL SECURITY (RLS) ───────────────────────────────────

-- Enable RLS on both tables
alter table repositories enable row level security;
alter table repository_chunks enable row level security;

-- Allow read-only access to repositories for all users
create policy "Allow public read access to repositories"
  on repositories for select
  using (true);

-- Allow read-only access to repository chunks for all users
create policy "Allow public read access to repository_chunks"
  on repository_chunks for select
  using (true);

