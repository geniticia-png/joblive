-- ═══════════════════════════════════════════════════════════════════
-- 008 — L'ORDRE DE MISSION ET L'ACCEPTATION (20/11 4ᵉ, direction :
-- « le prix proposé, le contrat ou ordre de mission — et je n'ai pas
-- vu que le prestataire ait accepté la mission »). Le prix et les
-- conditions vivent sur la mission, AMENDABLES à tout moment (le
-- lien du tier montre la dernière version) ; accepte_le est la
-- signature du tier — posée UNE fois, jamais réécrite. La porte est
-- serveur : aucun geste avant acceptation.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
alter table missions add column if not exists prix text;
alter table missions add column if not exists conditions text;
alter table missions add column if not exists accepte_le timestamptz;
