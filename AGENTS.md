# JOBLIVE — le journal de la maison

> **« Le travail vu en direct. »** La preuve de travail en direct :
> le prestataire montre, en photos horodatées, que le travail est
> fait — pendant qu'il le fait. Née de la veille PassPass (16/11) :
> tous les concurrents font du REPORTING (le passé, le froid) —
> JOBLIVE ouvre la catégorie de la PRÉSENCE (le live, le chaud).

## LA NAISSANCE (18/11, direction : « GO »)

La cinquième maison. Mère : RésaCap. Sœurs : Biendispo, Aktivit,
Resafix. Le jour même ont été tranchés : la robe (vert forêt
`#123F3D` · pierre `#F4F5F3` · vermillon `#D9381E`, à trois voix —
deux IA consultées, le vermillon choisi par la direction sur
palettes Coolors), le logo (le monogramme **JoB** inventé par la
direction — J majuscule, o minuscule, B majuscule : il épele
« job », le o porte l'œil vermillon), le sceau (`HORODATÉ ·
CERTIFIÉ`, promu élément SYSTÈME : il valide chaque photo du
journal), et le design system (Stitch : Outfit titres / Plus
Jakarta Sans corps / **JetBrains Mono horodatage** — la preuve
technique en chiffres alignés).

État civil : marque INPI déposée (classes 35 + 42, le libellé IA
réservé pour le relais v2), domaines **joblive.app** (principal) +
joblive.fr (redirection) chez Hostinger. L'histoire complète vit
chez la mère : `Resacap/app/docs/JOBLIVE.md`.

## CE QUE LA V1 EST (le périmètre gravé)

**Le journal sans IA** — pure transparence : des faits horodatés,
des photos, rien de plus. Le relais IA (chinois d'abord, jamais
américain en première intention) attend la v2, dosé, « comme un
pilote automatique quand le pilote dort ».

- **LE PRESTATAIRE** (magic link email) : dashboard au CTA royal
  (« Démarrer une intervention », la leçon Stitch : le geste
  principal ne se cherche pas), l'écran terrain (catégorie, photo
  AVANT/APRÈS — l'horodatage naît à la PRISE, note, chrono si le
  mandat l'accepte), et L'ACTE : le bouton vermillon « Publier ».
- **LE MANDAT** : le lien vivant pro ↔ client. Porte LA DOSE.
- **LE CLIENT** (lecture pure, sans compte) : `/j/<code>` — la
  timeline en album, photos scellées, un seul bouton « Tout va
  bien » (à sens unique, jamais de messagerie).
- **LE CODE** : mortel par nature — 6 signes mémorables (J7B-492),
  expirant à la fin du mandat, révocable en un clic.

## LES TROIS PRÉCAUTIONS (gravées d'avance, 16/11)

1. **LA DOSE RÈGLE LE PRESTATAIRE** — catégories diffusées
   paramétrables par mandat, chrono masquable : la transparence est
   son outil, pas son procureur (`/pro/mandats` → régler la
   transparence).
2. **LE CLIENT FINAL EST PROTÉGÉ** — lecture seule, noms floutés
   par défaut (colonne prête `noms_floutes`), le code est un droit
   d'accès pas une identité.
3. **LE CODE EST MORTEL** — temporaire, révocable, expirant ;
   terminer le mandat tue ses codes.

## LA DOCTRINE TECHNIQUE (l'héritage des sœurs)

Moule Resafix : Next 14 + `src/` racine, port dédié **3023**,
soudure `next.config.mjs` (SUPABASE_URL → NEXT_PUBLIC_*, clients
paresseux — le build tourne SANS .env), PWA (manifest + sw.js :
réseau d'abord pour les navigations, jamais de cache /api),
deploy Hostinger Node 22 par git push. Supabase **dédié**.
Migrations maison : **RLS activée, zéro policy** — tout filtre
côté serveur (clé service), l'anon ne lit rien. Les photos vivent
dans le bucket `preuves` (lecture publique, chemins UUID
innommables — le secret vit dans le lien, pas dans la porte).

## LES FONCTIONNALITÉS REÇUES DE STITCH (18/11, recueillies)

« Vu à HH:MM » (codes.vu_le — le pro sait que sa preuve est
regardée, la boucle des deux sens) · l'indicateur hors-ligne (le
sw + la réduction photo côté client en posent les bases) · le code
mémorisable J7B-492 · le masquage du chrono (la dose).

## EN ATTENTE (le lendemain de la naissance)

- **LE GESTE DIRECTION** : créer le projet Supabase `joblive`,
  appliquer `sql/001_fondation.sql`, poser les trois variables
  (voir README.md), créer l'app Hostinger Node 22 (git push),
  lier joblive.app.
- Le banc réel 3023 : création mandat → code → intervention →
  photos avant/après → publication → lecture client par code →
  « Tout va bien » → révocation (la mort du code vérifiée).
- En réserve v2 : le relais IA (depuis le journal uniquement —
  l'IA ne dit que ce qui est écrit), le pont RésaCap (la
  Production qui coule), les notifications, l'équipe, VERITIC
  (le moteur commun — la vérité du temps équipe les deux).
