-- ═══════════════════════════════════════════════════════════════════
-- 011 — LES PHOTOS PAR GESTE (23/11, finir la maison pour les
-- conciergeries). mission_preuves apprend DE QUEL GESTE une photo est
-- la preuve : element_id nullable (les photos libres de mission
-- restent libres — rétro-compat totale, la vraie vie du terrain veut
-- plusieurs photos sur un même geste).
-- Doctrine : RLS déjà active sur la table (006) — rien à sceller.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE mission_preuves
  ADD COLUMN IF NOT EXISTS element_id uuid REFERENCES mission_elements(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS mission_preuves_element_idx ON mission_preuves(element_id);
