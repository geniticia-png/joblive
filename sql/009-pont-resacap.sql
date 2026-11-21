-- ═══════════════════════════════════════════════════════════════════
-- 009 — LE PONT RÉSACAP, FACE PROPRIÉTAIRE (21/11, vision direction :
-- « le propriétaire voudra savoir où en est son bien — calendrier de
-- réservation, nuitées vendues, supports de vente — la conciergerie
-- n'est plus dérangée »). L'annuaire vit sur le pro (son email de
-- compte RésaCap), le lien vit sur le mandat (le bien suivi), LA
-- DOSE vit sur le mandat (la saison se partage seulement si la
-- conciergerie l'ouvre — opt-in prudent).
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
alter table pros add column if not exists email_resacap text;

alter table mandats add column if not exists unit_resacap jsonb;
alter table mandats add column if not exists saison_visible boolean not null default false;
