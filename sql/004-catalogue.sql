-- ═══════════════════════════════════════════════════════════════════
-- 004 — LE CATALOGUE (19/11 nuit, étape ② de la vision direction)
-- Les services du pro, leurs TÂCHES GÉNÉRALES (la qualité constante)
-- et PARTICULIÈRES (le soin propre au bien) — et LA JOBLIVISATION :
-- chaque élément porte son drapeau, partagé via JOBLIVE ou interne.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros(id) on delete cascade,
  nom text not null,
  ordre int not null default 0,
  joblivise boolean not null default true,
  cree_le timestamptz not null default now()
);

create table if not exists taches (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  libelle text not null,
  genre text not null default 'generale' check (genre in ('generale', 'particuliere')),
  joblivise boolean not null default true,
  cree_le timestamptz not null default now()
);

alter table services enable row level security;
alter table taches enable row level security;
