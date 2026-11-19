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

- ~~**LE GESTE DIRECTION**~~ : **ACCOMPLI le soir même (18/11, 22h26)** — voir
  « LA BASE EST NÉE » ci-dessous.
- Le premier vrai pilote : une conciergerie, un mandat, un chien promené.
- En réserve v2 : le relais IA (depuis le journal uniquement —
  l'IA ne dit que ce qui est écrit), le pont RésaCap (la
  Production qui coule), les notifications, l'équipe, VERITIC
  (le moteur commun — la vérité du temps équipe les deux).

## LA BASE EST NÉE — et LE BANC DE NAISSANCE VERT (18/11, soir)

**La décision d'architecture** (direction) : la compta ne quitte PAS
RésaCap (base destinée aux grosses données), Geneticia et Resafix
restent gratuites (le cœur donneur Resafix veille Geneticia), et
**JOBLIVE PASSE EN PRO** — l'argent suit le produit : une maison qui
vend le DIRECT n'a pas le droit de dormir. Org type **Company**,
première base créée en Amérique par erreur → **recréée à PARIS**
(eu-west-9 — données françaises sur sol français, RGPD béton,
latence minimale). Option Supabase « RLS sur nouvelles tables » :
**ACTIVE** — notre doctrine devenue paramètre natif (les tables ne
peuvent plus naître nues — la leçon RésaCap/Aktivit du même soir).

**La soirée des variables** : les vraies clés avaient été collées
dans `.env.example` (fichier TRACKÉ) — déplacées vers `.env.local`
(ignoré), template restauré, historique vérifié : **rien n'a jamais
été committé ni poussé**. Leçon : `.env.example` ne reçoit JAMAIS
de vraies valeurs. Le 001 non appliqué par le dashboard → **appliqué
par le pooler** (6 tables RLS✓ + bucket `preuves` public).

**LE BANC DE NAISSANCE (banc-naissance.cjs, 24 vérifications vertes)** :
pro de test né (admin API) → session → mandat Mme Valmont → code
**Q8Z-379** expirant à la fin du mandat → intervention animaux →
photos AVANT/APRÈS **horodatées à la prise** (−5 min pour l'avant :
l'heure du geste, pas de l'upload) → servies depuis le bucket (200)
→ **publication** → la timeline client par code : note lisible, SCEAU
certifiant, bouton doux, les deux preuves → **vu_le** posé (le pro
sait que sa preuve est regardée) → « Tout va bien » (une ligne, le
doublon refusé) → dashboard pro : journal du jour + réaction reçue ✓
→ **LA DOSE** : catégories masquées = preuve invisible côté client
→ **révocation** : code mort (« Ce code ne vit plus »), réaction
refusée (403) après mort → code inconnu : page élégante → **PURGE
complète** (base zéro ligne partout, storage vidé — le banc ne
laisse rien, la règle maison). Pages : / /connexion /j /pro 200,
manifest PWA servi. `tsc` + build verts sans env (clients
paresseux), et verts AVEC la soudure.

**Ce qui reste pour la mise en ligne** : l'app Hostinger Node 22
(git push, README gestes) + domaines joblive.app/.fr + les variables
dans hPanel + Site URL Supabase pointant joblive.app pour le
magic link en prod (localhost:3023 déjà couvert pour le banc).

## LA MISE EN LIGNE — joblive.app répond (18/11, 23h)

L'app hPanel créée par la direction (Node 22, repo GitHub, sortie
.next) — et **https://joblive.app répond 200 en notre robe** (les
trois voix typographiques dans le HTML). **LE BANC EN LIGNE :
24/24 VERT** (banc-naissance.cjs, `BANC_BASE=https://joblive.app`) —
la même chaîne entière que le banc local, sur le vrai domaine :
mandat, code W8F-689, photos scellées à la prise et servies du
bucket, publication, timeline par code (sceau + note + bouton doux),
vu_le, « Tout va bien » anti-doublon, dashboard, LA DOSE, révocation,
code inconnu élégant, PURGE zéro ligne. Manifest PWA servi (3 icônes,
theme #123F3D), sw.js 200, icônes 200. Les variables hPanel étaient
donc bien posées (les nôtres, pas ceux du guide Hostinger).

Restent deux réglages de finition : **joblive.fr en redirection**
vers joblive.app (hPanel → Domaines), et **Supabase → Authentication
→ URL Configuration** : Site URL `https://joblive.app` + Redirect
URLs `https://joblive.app/**` (le magic link doit atterrir en prod —
le banc a testé par mot de passe, pas encore par lien magique).

## LA REDIRECTION VIT + LA LEÇON DU PROXY (18/11, 23h15)

**joblive.fr → 301 → https://joblive.app** : posée par la direction
(guidée par l'IA hPanel : Domaines → Gérer → DNS/Nameservers →
onglet Redirections, 301 permanente, SANS enregistrement A/CNAME),
vérifiée à la machine, les deux variantes. **L'INCIDENT DU SOIR** :
le push 8d6b554 a redéployé l'app — et le rebuild a DÉBRANCHÉ le
proxy du domaine personnalisé (joblive.app timeout, www 503) alors
que l'app elle-même vivait (200 sur son host natif). LE REMÈDE
MAISON : `POST …/nodejs/server/restart` (UN geste, jamais pendant
un build — la discipline Resafix) → proxy recâblé, joblive.app 200.
**LA LEÇON OPÉRATIONNELLE** : chaque push → attendre build
`completed` → tester les TROIS hosts (app, www, domaine natif) →
restart si le proxy beugle. www.joblive.app reste 503 à ce stade :
à rattacher proprement dans hPanel (app → Domaines) ou à laisser
dormir — le canonique est joblive.app, les liens clients ne passent
jamais par www.

## LE LENDEMAIN VÉRIFIÉ — l'inconnue du magic link LEVÉE (19/11, reprise de main)

**La santé du lendemain, à la machine** : joblive.app **200** (la
robe en place), www.joblive.app **200** (503 hier soir — le proxy
s'est recâblé seul dans la nuit, l'incident n'était pas structurel),
joblive.fr **301** vers l'apex. MAIS la box locale (canalbox) ne
résout plus joblive.app : curl nu et Node voient le domaine mort
alors que les DNS publics répondent (Google, OneOneOne → IPs
Hostinger). **LE VIVANT SE VÉRIFIE PAR PLUSIEURS BOUCHES** : box
muette ≠ site mort — `curl --resolve` et un DNS public tranchent.

**L'INCONNUE DU MAGIC LINK — LEVÉE PAR PREUVE** (la dernière de la
mise en ligne : « le banc a testé par mot de passe, pas encore par
lien magique »). La sonde `admin/generate_link` : ① une URL
volontairement interdite → repli `http://localhost:3000` → la liste
blanche des Redirect URLs VALIDE bel et bien ; ②
`https://joblive.app/connexion` → honoré tel quel → **joblive.app
EST déjà dans les Redirect URLs** (la direction l'avait donc posé) ;
③ le lien généré, cliqué à la machine : **303 →
https://joblive.app/connexion#access_token=…&type=magiclink** — LE
LIEN MAGIQUE ATERRIT EN PROD, session captée par la page, redirection
/pro. Reste en hygiène (NON bloquant — l'app passe toujours
`emailRedirectTo: origin/connexion`) : le **Site URL** Supabase dort
encore sur `http://localhost:3000` par défaut — il ne sert que de
repli ; à repointer `https://joblive.app` un jour de passage
dashboard (geste direction, 30 secondes). La sonde purgée après
l'essai (la règle ne souffre pas d'exception).

**LE BANC RESSUSCITÉ ET RENDU AUTONOME** : les photos témoins
avaient disparu du dossier voisin (le banc moutrait en cours de
route) — recréées (AVANT pierre, APRÈS vert — la robe dans le
geste) et **ENTRÉES AU DÉPÔT** : le banc lit désormais
`banc-avant.jpg`/`banc-apres.jpg` depuis le repo, il ne dépend plus
d'un dossier externe. **LE RITUEL DNS GRAVÉ DANS LE BANC LUI-MÊME** :
`BANC_BASE=https://joblive.app BANC_DNS_IP=145.223.124.164 node
banc-naissance.cjs` — la variable route joblive.app vers une IP
Hostinger le temps du banc (la box aveugle ne peut plus tuer le
geste). **24/24 VERT sur le vrai domaine** (code L3T-882, purge
complète, base zéro ligne). Au fil des essais, 3 orphelins auth
purgés un à un — la règle tient : le banc ne laisse rien.

## LE SCEAU RESSUSCITÉ PAR GREFFE — la journée logo de la direction (19/11, midi)

La direction a fait produire les éléments par ChatGPT (une journée de
dialogue, cinq prompts maison, la doctrine des montages pour comparer).
**LE PEINTRE ET LE SCANNEUR** : ChatGPT PEINT, il ne scanne pas —
chaque livraison redessine (bandes noires derrière le texte, cible aux
anneaux inversés, cible Ø140 au lieu de Ø213). Le prompt gagnant pour
la structure : « prends le visuel EN BAS À DROITE de la planche,
reproduis-le TEL QUEL, la seule différence permise est le fond
transparent ». Puis LA MACHINE FINIT : `habiller-logo.py` — le
pipeline des livraisons, où L'ENCRE DÉFINIT L'ALPHA (les pixels verts
ou vermillon sont le dessin ; gris, blancs et fonds deviennent
transparents, quel que soit leur place — le disque clair derrière le
sceau n'est pas de l'encre). Robe remise droite : vert #123F3D,
vermillon #D9381E, déclinaisons jour + nuit.

**LA GREFFE DE LA CIBLE** (le geste du jour) : la cible livrée n'était
pas la vraie. La direction a tranché sur montage : la vraie = celle du
HAUT de la planche (le « o » cible) — cœur vermillon PLEIN, couche
pierre, anneau vert. La machine l'a greffée dans le sceau : l'ancienne
effacée (disque), la vraie collée à la PROPORTION DE LA PLANCHE —
mesurée : cible Ø64 / cercle Ø309 = **20,7 %**, appliquée : Ø232 pour
cercle Ø1121. **LA RÉVÉLATION DES PIXELS** : l'anneau de la vraie
cible est À SECTEURS ALTERNÉS (couverture 55-73 % à tous les rayons —
l'indicateur « enregistrement en direct », invisible de loin, vivant
de près) ; la petite cible du sceau d'origine porte un anneau
vermillon autour d'un point vert — deux sœurs, deux dessins, la
direction a choisi la grande. Une coquille de greffe (disque décalé,
double cible) a été détectée par vérification numérique et refaite
propre : chaque étape mesurée (cœur, anneau, couverture, marges) —
les pixels ne mentent jamais, ils vérifient.

**Le sceau vit en deux habits** : `joblive-sceau-transparent.png`
(jour, encre verte) et `joblive-sceau-nuit.png` (encre pierre) — le
cœur vermillon ne s'éteint jamais. L'œil de la direction a validé :
cercle pointillé, quatre équerres, la cible à 20,7 %, HORODATÉ /
CERTIFIÉ nus. Les quatre autres livraisons (favicon, icône app,
monogramme, mot+slogan — déjà dans la robe exacte) attendent leur
feu vert pour remplacer les anciens assets.

**Où en est la maison** : en ligne, vérifiée, lien magique compris —
il ne manque plus que le premier vrai pilote (une conciergerie, un
mandat, un chien promené) et le geste d'hygiène Site URL. La v2
dort en réserve (relais IA, pont RésaCap, notifications, équipe,
VERITIC).



