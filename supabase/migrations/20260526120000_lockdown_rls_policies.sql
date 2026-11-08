-- Yooga CS Coach — Lockdown de RLS, grants e hashes de senha
-- Criado em: 2026-05-26
--
-- CONTEXTO
-- A migration 20260525130000 criou as policies "Allow all operations"
-- (roles={public}, cmd=ALL, using=true, with check=true) e concedeu
-- `grant all` para anon/authenticated em todas as tabelas relacionais.
--
-- A consequence é uma escalada de privilégio trivial: a anon key é pública
-- (por natureza), então qualquer pessoa podia:
--   1. INSERT em public.users um registro com role='admin';
--   2. POST /api/auth/login -> o backend lia a tabela, conferia o hash e
--      devolvia o `role` do banco -> login como administrador.
--
-- O backend (Render) acessa o banco com a SERVICE ROLE key, que tem
-- `rolbypassrls = true`. Portanto fechar estas policies NÃO quebra o backend,
-- desde que SUPABASE_SERVICE_ROLE_KEY esteja configurada no ambiente.
--
-- A partir daqui, a autorização é feita pelo backend (JWT + papel do usuário)
-- e o banco volta a ser acessado apenas por ele.

-- ─── 1. Remover as policies permissivas ─────────────────────────────────────

drop policy if exists "Allow all operations for users" on public.users;
drop policy if exists "Allow all operations for scenarios" on public.scenarios;
drop policy if exists "Allow all operations for simulations" on public.simulations;
drop policy if exists "Allow all operations for company_profiles" on public.company_profiles;
drop policy if exists "Allow all operations for agent_performances" on public.agent_performances;

-- ─── 2. Tabelas relacionais: acesso exclusivo do backend ─────────────────────

revoke all on public.users from anon, authenticated;
revoke all on public.scenarios from anon, authenticated;
revoke all on public.simulations from anon, authenticated;
revoke all on public.company_profiles from anon, authenticated;
revoke all on public.agent_performances from anon, authenticated;

-- Nenhuma tabela relacional usa identity/serial, mas fica registrado por
-- precaução caso venham a ser adicionadas.
revoke all on all sequences in schema public from anon, authenticated;

-- ─── 3. Base de conhecimento: leitura pública, sem escrita ──────────────────
--
-- A base da Central de Ajuda é conteúdo público e continua legível via REST.
-- Escrita fica restrita ao backend (service role), que é quem faz o ingest.

revoke all on public.knowledge_articles from anon, authenticated;
revoke all on public.knowledge_chunks from anon, authenticated;

grant select on public.knowledge_articles to anon, authenticated;
grant select on public.knowledge_chunks to anon, authenticated;

-- ─── 4. Converter os hashes legados (SHA-256) para bcrypt ────────────────────
--
-- As senhas estavam gravadas como SHA-256 (rápido, sem salt, quebrável por
-- rainbow table). O backend (backend/auth.py) aceita o hash legado apenas para
-- verificá-lo e o reescreve em bcrypt no primeiro login bem-sucedido.
--
-- Esta etapa converte antecipadamente as contas cujo hash bate com a senha
-- conhecida — a condição no WHERE garante que nenhuma conta fique com um hash
-- que não corresponde à senha que o usuário realmente tem.
--
-- IMPORTANTE: estas são as mesmas senhas que estavam publicadas no repositório.
-- Troque-as depois de aplicar esta migration (ver README, seção "Rotação de
-- credenciais").

update public.users u
set password = extensions.crypt(k.plaintext, extensions.gen_salt('bf', 12))
from (
  values
    ('admin@yooga.com.br',            'admin123'),
    ('bruno.oliveira@yooga.com.br',   '123456'),
    ('mariana.silva@yooga.com.br',    'user123'),
    ('pedro.oliveira@yooga.com.br',   'user123')
) as k(email, plaintext)
where lower(u.email) = k.email
  and u.password = encode(extensions.digest(k.plaintext, 'sha256'), 'hex');

-- ─── 5. Verificação (deve retornar 0 linhas) ────────────────────────────────
--
-- select email, length(password) as tamanho
-- from public.users
-- where password ~ '^[0-9a-f]{64}$';
