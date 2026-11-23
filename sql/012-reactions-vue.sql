-- ═══════════════════════════════════════════════════════════════════
-- 012 — LE BADGE NON-VU DES MESSAGES ENTRANTS (23/11, la refonte
-- « dossier » façon WhatsApp : JOBLIVE-DOSSIER.md chez la mère).
-- reactions.vue_le : le « Tout va bien » du client est un message
-- ENTRANT — le pro le voit s'allumer (badge) puis s'éteindre à
-- l'ouverture du dossier. Le patron de codes.vu_le (le client a
-- vu) et missions.vue_le (le pro a regardé) — la maison connaît.
-- Doctrine : RLS déjà active sur reactions (001) — rien à sceller.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE reactions
  ADD COLUMN IF NOT EXISTS vue_le timestamptz;

CREATE INDEX IF NOT EXISTS reactions_non_vues_idx ON reactions(vue_le) WHERE vue_le IS NULL;
