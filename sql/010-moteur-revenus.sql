-- ═══════════════════════════════════════════════════════════════════
-- 010 — LE MOTEUR DE REVENUS (21/11, brique ③ de la saison : la
-- direction « Revenu net · Taux d'occupation · Décomposition — si la
-- conciergerie paramètre »). LE MODÈLE NÉGOCIÉ VIT SUR LE MANDAT :
-- commission_pct (la part de la conciergerie) + frais_fixes composites
-- [{libelle, montant, base: sejour|mois}] — additifs, la règle
-- « additionner des frais fixes et des commissions ». LA DOSE :
-- revenus_visible, opt-in prudent. Les chiffres du bien (CA, dépenses,
-- TVA, taxe) naissent chez RésaCap par le pont scellé — la marge de
-- la conciergerie, elle, ne transite jamais : elle naît de SON calcul.
-- RLS activée, zéro policy (la doctrine).
-- ═══════════════════════════════════════════════════════════════════
alter table mandats add column if not exists commission_pct numeric(5,2);
alter table mandats add column if not exists frais_fixes jsonb;
alter table mandats add column if not exists revenus_visible boolean not null default false;
