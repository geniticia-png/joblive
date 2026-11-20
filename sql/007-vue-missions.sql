-- ═══════════════════════════════════════════════════════════════════
-- 007 — LE REGARD DU CENTRE (20/11, verdict direction : « le tiers a
-- fait sa mission, le client a vu, la conciergerie n'a rien vu »).
-- missions.vue_le suit le patron de codes.vu_le : posé quand le pro
-- ouvre le travail de son tiers, affiché « vue à HH:MM ». Le centre
-- voit sans chercher — l'onglet Missions porte le badge.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
alter table missions add column if not exists vue_le timestamptz;
