-- ============================================================
-- HOBBY BICHES · Banco de dados (rode este arquivo inteiro no
-- SQL Editor do Supabase — Passo 3 do README)
-- ============================================================

-- Extensão necessária para gerar IDs únicos automaticamente
create extension if not exists "pgcrypto";

-- ---------- CLIENTES ----------
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  telefone text,
  endereco text,
  created_at timestamptz default now()
);

-- ---------- ANIMAIS ----------
create table if not exists animais (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  nome text not null,
  raca text,
  porte text,
  idade text,
  restricoes text,
  foto_url text,
  -- dados do plano de banho (fica vazio até o animal assinar um plano)
  plano_tipo text,
  plano_banhos_totais int,
  plano_banhos_usados int default 0,
  plano_data_assinatura date,
  plano_data_expiracao date,
  created_at timestamptz default now()
);

-- ---------- BANHOS (histórico + banhos em andamento) ----------
create table if not exists banhos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animais(id) on delete cascade,
  hora_inicio timestamptz default now(),
  hora_fim timestamptz,
  status text default 'em_andamento', -- 'em_andamento' | 'finalizado'
  observacoes text
);

-- ---------- TABELA DE PREÇOS (editável pela equipe dentro do sistema) ----------
create table if not exists precos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  nome text not null,
  porte text,
  preco numeric(10,2) not null,
  ordem int default 0
);

-- Preços iniciais de exemplo — pode editar tudo isso depois pela tela "Preços"
insert into precos (categoria, nome, porte, preco, ordem) values
  ('Banho','Banho simples','Pequeno',35.00,1),
  ('Banho','Banho simples','Médio',45.00,2),
  ('Banho','Banho simples','Grande',60.00,3),
  ('Banho','Banho + hidratação','Pequeno',50.00,4),
  ('Banho','Banho + hidratação','Médio',65.00,5),
  ('Banho','Banho + hidratação','Grande',85.00,6),
  ('Tosa','Tosa higiênica','Único',25.00,7),
  ('Tosa','Tosa na máquina','Pequeno',40.00,8),
  ('Tosa','Tosa na máquina','Médio',55.00,9),
  ('Tosa','Tosa na máquina','Grande',70.00,10),
  ('Extras','Corte de unhas','Único',15.00,11),
  ('Extras','Limpeza de ouvidos','Único',15.00,12)
on conflict do nothing;

-- ============================================================
-- SEGURANÇA (RLS) — só funcionários logados (autenticados) podem
-- ler e escrever dados. Sem login, ninguém acessa nada.
-- ============================================================
alter table clientes enable row level security;
alter table animais  enable row level security;
alter table banhos   enable row level security;
alter table precos   enable row level security;

create policy "funcionarios_full_access_clientes" on clientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "funcionarios_full_access_animais" on animais
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "funcionarios_full_access_banhos" on banhos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "funcionarios_full_access_precos" on precos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Ativa "realtime" para o painel atualizar sozinho em todas as telas
-- quando qualquer funcionário iniciar/finalizar um banho
-- ============================================================
alter publication supabase_realtime add table banhos;
alter publication supabase_realtime add table animais;
