-- ═══════════════════════════════════════════════════════════════════
-- 006 — LE JETON DE MISSION (19/11 nuit, étape ③-bis : l'écran du tier)
-- Marie ouvre SA mission sans compte : la conciergerie lui envoie le
-- lien /m/<jeton>, elle coche, photographie, termine. Le jeton meurt
-- avec la mission (annulée/faite = lien muet). Les preuves de mission
-- vivent le bucket `preuves` comme les autres, horodatées à la prise.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
alter table missions add column if not exists jeton text unique;
alter table missions add column if not exists fermee_le timestamptz;

create table if not exists mission_preuves (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  chemin text not null,
  horodatage timestamptz not null default now(),
  cree_le timestamptz not null default now()
);

alter table mission_preuves enable row level security;
