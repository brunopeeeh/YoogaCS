-- Yooga CS Coach — Higiene de schema (extensions, funções privileged)
-- Criado em: 2026-05-26
--
-- Resolve os avisos do linter de segurança do Supabase:
--   * extension_in_public: a extensão `vector` estava no schema `public`.
--   * anon/authenticated_security_definer_function_executable: funções
--     SECURITY DEFINER executáveis por qualquer visitor.
--
-- O schema `private` guarda objetos que não devem ser expostos pela API.

-- ─── 1. Schema privado ──────────────────────────────────────────────────────

create schema if not exists private;

-- ─── 2. Event trigger de RLS fora do schema exposto ─────────────────────────
--
-- `rls_auto_enable` é um EVENT TRIGGER (não é chamável via RPC na prática,
-- mas o linter não distingue). Movê-lo para `private` tira a função da API
-- pública; o event trigger continua apontando para a mesma função (OID).

alter function public.rls_auto_enable() set schema private;
revoke all on function private.rls_auto_enable() from public, anon, authenticated;

-- ─── 3. Extensão vector fora do schema public ───────────────────────────────

create extension if not exists vector with schema extensions;
alter extension vector set schema extensions;

-- ─── 4. Recriar as funções de leitura como SECURITY INVOKER ─────────────────
--
-- As funções são reescritas porque:
--   * a assinatura passa a referenciar `extensions.vector`;
--   * o search_path precisa incluir `extensions` para resolver o operador
--     `<=>` (cosine distance) em tempo de execução;
--   * como SECURITY INVOKER, o chamador precisa de SELECT nas tabelas — o que
--     anon/authenticated têm na base de conhecimento (grant select da
--     migration 20260526120000).

drop function if exists public.match_knowledge_chunks(vector, integer, double precision, text);
drop function if exists public.knowledge_base_stats();

create or replace function public.match_knowledge_chunks(
  query_embedding extensions.vector,
  match_count integer default 10,
  match_threshold double precision default 0.15,
  filter_category text default null::text
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
security invoker
set search_path = public, extensions
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

create or replace function public.knowledge_base_stats()
returns table (
  article_count bigint,
  chunk_count bigint,
  embedded_count bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    (select count(*) from public.knowledge_articles),
    (select count(*) from public.knowledge_chunks),
    (select count(*) from public.knowledge_chunks where embedding is not null);
$$;

-- ─── 5. Índice da foreign key de agent_performances ─────────────────────────
-- (linter: unindexed_foreign_keys)

create index if not exists agent_performances_agent_id_idx
  on public.agent_performances (agent_id);
