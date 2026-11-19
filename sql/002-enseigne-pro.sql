-- ═══════════════════════════════════════════════════════════════════
-- 002 — L'ENSEIGNE DU PRO (19/11, leçon du jeu de rôle)
-- La maison saluait le pro par son email, le client ne savait pas
-- qui lui parlait : l'identité manquait des deux côtés. Le pro gagne
-- son enseigne — ce que voient ses clients sur le journal.
-- RLS activée, zéro policy (la doctrine) : tout filtre côté serveur.
-- ═══════════════════════════════════════════════════════════════════
alter table pros add column if not exists enseigne text;
