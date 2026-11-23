-- 013 — LE MOT DU GESTE (mission_elements.commentaire), 23/11
-- (chutjegère/Resafix — sa mission de formation chez Sixt doit se
-- PROUVER : chaque tâche préselectionnée cochée porte un commentaire,
-- le reporting naît tout seul.)
--
-- Le commentaire accompagne TOUJOURS la coche (jamais seul) : c'est
-- le mot du tiers sur CE geste, à l'instant où il le fait. Il vit à
-- côté des photos horodatées — le rapport imprimé les rend ensemble.

ALTER TABLE mission_elements ADD COLUMN IF NOT EXISTS commentaire text;
