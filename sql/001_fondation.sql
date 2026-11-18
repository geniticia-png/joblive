-- ═══════════════════════════════════════════════════════════════════
-- JOBLIVE 001 — LA FONDATION (18/11)
-- Le journal sans IA : le prestataire prouve, le client regarde.
-- Doctrine maison : RLS ACTIVÉE, ZÉRO POLICY — tout passe par le
-- serveur (clé service), jamais par l'anon. Les photos vivent dans
-- le bucket `preuves` (lecture publique, chemins UUID innommables).
-- ═══════════════════════════════════════════════════════════════════

-- LE PRESTATAIRE — prolonge auth.users (magic link email)
create table if not exists pros (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  email text not null default '',
  metiers text[] not null default '{}',   -- animaux, menage, jardin, piscine, conciergerie, courses…
  cree_le timestamptz not null default now()
);

-- LE MANDAT — le lien vivant entre un pro et un client ("Villa Oscar,
-- du 12 au 30"). La dose y vit : quelles catégories se diffusent,
-- si le chrono se montre. La transparence est l'outil du pro, pas
-- son procureur.
create table if not exists mandats (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros(id) on delete cascade,
  client_nom text not null,
  client_tel text,
  lieu text not null default '',
  debut date,
  fin date,
  statut text not null default 'actif' check (statut in ('actif','termine')),
  categories_diffusees text[],            -- null = TOUT se diffuse
  chrono_visible boolean not null default true,
  noms_floutes boolean not null default true,  -- précaution gravée : le client final est protégé
  cree_le timestamptz not null default now()
);

-- L'INTERVENTION — le geste du terrain. Née en_cours, publiée quand
-- le pro appuie le bouton vermillon (publier est un ACTE, pas un auto).
create table if not exists interventions (
  id uuid primary key default gen_random_uuid(),
  mandat_id uuid not null references mandats(id) on delete cascade,
  categorie text not null,                -- animaux, menage, jardin, piscine, courses, autre
  note text not null default '',
  debut_le timestamptz not null default now(),
  publie_le timestamptz,
  statut text not null default 'en_cours' check (statut in ('en_cours','publie')),
  duree_secondes integer                  -- le chrono, si le pro l'assume
);

-- LA PREUVE — une photo horodatée. Le genre avant/après raconte le
-- travail ; l'horodatage né à la PRISE (jamais à l'upload).
create table if not exists preuves (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references interventions(id) on delete cascade,
  genre text not null check (genre in ('avant','apres')),
  chemin text not null,                   -- storage: preuves/<mandat>/<uuid>.jpg
  horodatage timestamptz not null default now()
);

-- LE CODE — mortel par nature : temporaire, révocable, expirant à la
-- fin du mandat. Six signes mémorables (J7B492), stocké nu, montré
-- avec tiret (J7B-492). vu_le = la boucle des deux sens.
create table if not exists codes (
  id uuid primary key default gen_random_uuid(),
  mandat_id uuid not null references mandats(id) on delete cascade,
  code text not null unique,
  expire_le timestamptz,
  revoque_le timestamptz,
  vu_le timestamptz,
  cree_le timestamptz not null default now()
);

-- LA RÉACTION — le client répond sans messagerie : « Tout va bien ».
-- À sens unique, apaisée, jamais un tunnel de discussion.
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  mandat_id uuid not null references mandats(id) on delete cascade,
  intervention_id uuid references interventions(id) on delete cascade,
  genre text not null default 'tout_va_bien' check (genre in ('tout_va_bien')),
  cree_le timestamptz not null default now()
);

create index if not exists idx_mandats_pro on mandats(pro_id);
create index if not exists idx_interventions_mandat on interventions(mandat_id, statut);
create index if not exists idx_preuves_intervention on preuves(intervention_id);
create index if not exists idx_codes_code on codes(code);

-- LA CLOTURE : la maison ne parle pas à l'anon. Tout filtre côté
-- serveur (clé service), la doctrine des sœurs.
alter table pros enable row level security;
alter table mandats enable row level security;
alter table interventions enable row level security;
alter table preuves enable row level security;
alter table codes enable row level security;
alter table reactions enable row level security;

-- LE BUCKET DES PREUVES — lecture publique (les chemins UUID sont
-- innommables : le secret vit dans le lien, pas dans la porte).
insert into storage.buckets (id, name, public)
values ('preuves', 'preuves', true)
on conflict (id) do nothing;
