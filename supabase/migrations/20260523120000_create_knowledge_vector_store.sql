-- Yooga CS Coach — Base de Conhecimento Vetorial (pgvector)
-- Dimensão: 768 (Gemini text-embedding-004 / fallback determinístico)

create extension if not exists vector;

-- Artigos pai (metadados agregados por título/fonte)
create table if not exists public.knowledge_articles (
  id text primary key,
  title text not null,
  faq_url text,
  category text,
  source_slug text,
  chunk_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.knowledge_articles is 'Metadados dos artigos da Central de Ajuda Yooga';

-- Chunks vetorizados para RAG
create table if not exists public.knowledge_chunks (
  id text primary key,
  article_id text not null references public.knowledge_articles(id) on delete cascade,
  chunk_index integer not null default 0,
  title text not null,
  faq_url text,
  category text,
  content text not null,
  content_tokens integer,
  embedding vector(768),
  keywords text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_chunks_article_chunk_unique unique (article_id, chunk_index)
);

comment on table public.knowledge_chunks is 'Fragmentos da base FAQ Yooga com embeddings para busca semântica';

create index if not exists knowledge_chunks_article_id_idx
  on public.knowledge_chunks (article_id);

create index if not exists knowledge_chunks_category_idx
  on public.knowledge_chunks (category);

create index if not exists knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists knowledge_chunks_content_fts_idx
  on public.knowledge_chunks
  using gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || content));

-- Busca por similaridade cosseno (retorna candidatos; boosting no app)
create or replace function public.match_knowledge_chunks(
  query_embedding vector(768),
  match_count integer default 10,
  match_threshold double precision default 0.15,
  filter_category text default null
)
returns table (
  id text,
  article_id text,
  title text,
  faq_url text,
  category text,
  content text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    kc.id,
    kc.article_id,
    kc.title,
    kc.faq_url,
    kc.category,
    kc.content,
    (1 - (kc.embedding <=> query_embedding))::double precision as similarity
  from public.knowledge_chunks kc
  where kc.embedding is not null
    and (filter_category is null or kc.category = filter_category)
    and (1 - (kc.embedding <=> query_embedding)) >= match_threshold
  order by kc.embedding <=> query_embedding asc
  limit greatest(match_count, 1);
$$;

comment on function public.match_knowledge_chunks is
  'Busca semântica na base FAQ Yooga. Usar embedding de 768 dimensões.';

create or replace function public.knowledge_base_stats()
returns table (
  article_count bigint,
  chunk_count bigint,
  embedded_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.knowledge_articles),
    (select count(*) from public.knowledge_chunks),
    (select count(*) from public.knowledge_chunks where embedding is not null);
$$;

alter table public.knowledge_articles enable row level security;
alter table public.knowledge_chunks enable row level security;

drop policy if exists "knowledge_articles_read" on public.knowledge_articles;
create policy "knowledge_articles_read"
  on public.knowledge_articles for select
  using (true);

drop policy if exists "knowledge_chunks_read" on public.knowledge_chunks;
create policy "knowledge_chunks_read"
  on public.knowledge_chunks for select
  using (true);

grant select on public.knowledge_articles to anon, authenticated;
grant select on public.knowledge_chunks to anon, authenticated;
grant execute on function public.match_knowledge_chunks to anon, authenticated;
grant execute on function public.knowledge_base_stats to anon, authenticated;
