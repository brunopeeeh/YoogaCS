-- Yooga CS Coach — Tabelas Relacionais do Sistema
-- Criado em: 2026-05-25

-- 1. Tabela de Usuários (Users/Perfis)
create table if not exists public.users (
  id text primary key,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by text not null default 'local',
  full_name text not null,
  email text not null unique,
  role text not null default 'agent',
  password text not null
);

comment on table public.users is 'Contas de analistas e administradores do simulador';

-- 2. Tabela de Cenários (Scenarios)
create table if not exists public.scenarios (
  id text primary key,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by text not null default 'local',
  title text not null,
  description text,
  client_profile text not null default 'irritado',
  initial_problem text not null,
  difficulty_level text not null default 'intermediario',
  goals jsonb not null default '[]'::jsonb,
  context text,
  expected_interactions integer not null default 4,
  status text not null default 'ativo',
  module_id text
);

comment on table public.scenarios is 'Cenários de simulação de suporte do Yooga CS Coach';

-- 3. Tabela de Simulações (Simulations)
create table if not exists public.simulations (
  id text primary key,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by text not null default 'local',
  scenario_id text not null,
  scenario_title text not null,
  agent_id text not null,
  agent_name text not null,
  status text not null default 'ativo',
  history jsonb not null default '[]'::jsonb,
  audit_results jsonb not null default '{}'::jsonb
);

comment on table public.simulations is 'Histórico e transcrição completa de simulações com auditorias pós-chat';

-- 4. Tabela de Perfis de Empresas (Company Profiles)
create table if not exists public.company_profiles (
  id text primary key,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by text not null default 'local',
  name text not null
);

comment on table public.company_profiles is 'Cadastro de perfis de empresas parceiras';

-- 5. Tabela de Performance de Agentes (Agent Performances)
create table if not exists public.agent_performances (
  id text primary key,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by text not null default 'local',
  agent_id text not null references public.users(id) on delete cascade,
  overall_score_avg numeric not null default 0.0,
  simulations_count integer not null default 0,
  badges jsonb not null default '[]'::jsonb
);

comment on table public.agent_performances is 'Analytics agregados de performance e conquistas de badges dos operadores';

-- Habilitar RLS (Row Level Security) em todas as tabelas
alter table public.users enable row level security;
alter table public.scenarios enable row level security;
alter table public.simulations enable row level security;
alter table public.company_profiles enable row level security;
alter table public.agent_performances enable row level security;

-- Criar políticas de acesso simplificadas (allow all) para anon e authenticated, 
-- já que o controle fino e acesso via service_role é feito pelo backend
create policy "Allow all operations for users" on public.users for all using (true) with check (true);
create policy "Allow all operations for scenarios" on public.scenarios for all using (true) with check (true);
create policy "Allow all operations for simulations" on public.simulations for all using (true) with check (true);
create policy "Allow all operations for company_profiles" on public.company_profiles for all using (true) with check (true);
create policy "Allow all operations for agent_performances" on public.agent_performances for all using (true) with check (true);

-- Conceder permissões para anon e authenticated
grant all on public.users to anon, authenticated;
grant all on public.scenarios to anon, authenticated;
grant all on public.simulations to anon, authenticated;
grant all on public.company_profiles to anon, authenticated;
grant all on public.agent_performances to anon, authenticated;
