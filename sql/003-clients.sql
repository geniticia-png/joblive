-- ═══════════════════════════════════════════════════════════════════
-- 003 — LA FICHE CLIENT (19/11 nuit, étape ① de la vision direction)
-- Le propriétaire devient une fiche vivante : RÉGULIER ou
-- OCCASIONNEL. Le mandat s'y rattache — on ne retape plus la villa
-- à chaque saison. Le lieu reste au mandat (un régulier peut avoir
-- deux biens). RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros(id) on delete cascade,
  nom text not null,
  type text not null default 'occasionnel' check (type in ('regulier', 'occasionnel')),
  telephone text,
  cree_le timestamptz not null default now()
);

alter table mandats add column if not exists client_id uuid references clients(id) on delete set null;

alter table clients enable row level security;
