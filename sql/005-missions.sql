-- ═══════════════════════════════════════════════════════════════════
-- 005 — LES MISSIONS TIERCES (19/11 nuit, étape ③ de la vision)
-- L'AMONT entre dans la maison : la conciergerie assigne des missions
-- à ses salariés, partenaires, prestataires. La mission porte un
-- service du catalogue (ou libre), un mandat, une date — et SES
-- ÉLÉMENTS : les tâches copiées du service, chacune avec SON DRAPEAU
-- joblivisé et sa case à cocher (fait). Le tiers exécute, les
-- éléments remontent — l'aval (étape ④) les retransmettra.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
create table if not exists tiers (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros(id) on delete cascade,
  nom text not null,
  role text not null default 'partenaire' check (role in ('salarie', 'partenaire', 'prestataire')),
  telephone text,
  cree_le timestamptz not null default now()
);

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros(id) on delete cascade,
  tiers_id uuid not null references tiers(id) on delete cascade,
  mandat_id uuid references mandats(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  titre text not null default '',
  prevue_le date,
  statut text not null default 'a_faire' check (statut in ('a_faire', 'en_cours', 'faite', 'annulee')),
  cree_le timestamptz not null default now()
);

create table if not exists mission_elements (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  libelle text not null,
  genre text not null default 'generale',
  joblivise boolean not null default true,
  fait boolean not null default false,
  ordre int not null default 0
);

alter table tiers enable row level security;
alter table missions enable row level security;
alter table mission_elements enable row level security;
