# JOBLIVE — le journal de la maison

## Le 23/11 (5ᵉ) — LA REFONTE DU VISAGE : LA LISTE DES DOSSIERS + LE DOSSIER AU MENU HORIZONTAL (direction : « pas assez convivial, tu connais WhatsApp ? » → la pierre JOBLIVE-DOSSIER chez la mère)

La première brique de la pierre validée (docs/JOBLIVE-DOSSIER.md,
la mère) : la grammaire WhatsApp entre au visage pro.

- **012 (appliquée au pooler)** : `reactions.vue_le` — le « Tout va
  bien » du client devient un MESSAGE ENTRANT avec son non-vu (le
  patron de missions.vue_le et codes.vu_le).
- **/api/pro/accueil apprend `conversations`** : par mandat, le
  DERNIER événement (l'aperçu de la ligne — intervention publiée ·
  en cours · mission close · réaction · code ouvert par le client ·
  création) et les NON-VUS (missions closes non vues + réactions
  non vues) ; mandat_id entre au select missions, les requêtes
  « récentes » (≤ 80) nourrissent l'agrégat.
- **/pro DEVIENT LA LISTE** : une ligne par dossier — avatar
  initiales, client + lieu, l'heure à droite (HH:MM aujourd'hui,
  date sinon), LE BADGE VERMILLON, l'aperçu du dernier message ;
  triés par activité, les dossiers clos pliés grisés en bas. Le CTA
  royal devient **FAB flottante vermillon** (le « + » de WhatsApp)
  qui ouvre le lanceur en voile — `?lancer=<mandat>` l'ouvre déjà
  choisi (la barre de geste du dossier y ramène). Les sections
  « travail indirect / en cours / journal du jour » meurent : la
  liste les contient.
- **/pro/mandat/[id] = LE DOSSIER**, menu horizontal MISSION ·
  INTERVENANT · AGENDA · CHIFFRES (via /api/pro/fil?id= qui charge
  ET MARQUE LU) :
  - **MISSION** — LE FIL UNIFIÉ : l'intervention est une mission
    dont l'intervenant est le pro (« par vous »), les missions
    déléguées portent leur tier (« par Marie ») ; les gestes du
    dossier à DROITE (vert-voile), **les « Tout va bien » du
    client à GAUCHE** (carte blanche — le message entrant) ;
    groupés par jour (patron /j), diptyque AVANT/APRÈS, photos de
    mission par geste (011).
  - **INTERVENANT** — les gens du dossier : « Vous — N gestes
    directs » + chaque tier (rôle, téléphone, missions, dernière) ;
    le « + confier une mission » vers /pro/missions.
  - **AGENDA** — v1 dérivée : la frise des passages passés et à
    venir (le pense-bête complet = la brique suivante du chemin).
  - **CHIFFRES** — v1 : les compteurs (gestes, missions tierces,
    photos, réactions, temps direct) + LE PORTAIL RésAcap si le
    bien est lié (net mois/année, saison — le calcul de /j).
  - **OUVRIR = LU** (le geste WhatsApp) : le chargement du fil
    éteint les non-vus DU dossier (réactions + missions closes).
    Barre de geste au-dessus de la nav : Démarrer · Confier · Code.
- **Banc `banc-conversations.cjs`** : 2 dossiers → publication +
  photo sur A → **réaction du client par son code** → mission close
  non vue sur B → l'accueil rend dernier + non_vus (A=réaction/1,
  B=mission/1) → **l'ouverture du dossier A éteint A, B reste
  allumé** → le fil rend les 4 onglets → purge cascade.
- **Banc `banc-conversations.cjs` 18/18 VERT SUR LA PROD** : 2
  dossiers → publication + photo sur A → **réaction du client par
  son code** → mission close non vue sur B → l'accueil rend dernier
  + non_vus (A=réaction/1, B=mission/1) → **l'ouverture du dossier
  A éteint A, B reste allumé** → le fil rend les 4 onglets → purge
  cascade.
- ⚠ **DEUX LEÇONS PAYÉES (gravées)** : ① **PGRST108** — filtrer
  sur une table imbriquée (`mandats.pro_id`) EXIGE qu'elle vive
  dans le select (`mandats(pro_id)`), sinon PostgREST répond 400
  EN SILENCE et la liste devient aveugle (le banc l'a pris ; le
  compositeur porte désormais le blindage : seuls les mandats du
  pro créent des lignes) ; ② **`a?.b++` est du JS invalide** (SWC
  le refuse — le 500 ne disait rien) : la variable intermédiaire
  compte, et le dev local avec la stack vaut dix suppositions.
- ⚠ Le modèle ne bouge pas : l'unification est à l'AFFICHAGE (la
  pierre : le terrain dira si la fusion des tables se réclame).

## Le 23/11 (4ᵉ) — LA GARDE D'ACCÈS : la maison réservée à RésaCap (direction : « pour l'instant, réserver Joblive à ResaCap »)

La porte de connexion ne laisse plus passer tout le monde. **LA
GARDE** (`/api/acces`) parle AVANT le lien magique — jamais de lien
mort dans une boîte inconnue : ① les comptes DÉJÀ vivants passent
toujours (l'API admin auth/users — aucun pro enfermé dehors, les
comptes de la direction compris) ; ② sinon, **l'email doit avoir un
compte chez la mère** — le pont `unites` scellé HMAC sert
d'annuaire (un client RésaCap = la famille). Les autres voient LA
PORTE PARLÉE : *« JOBLIVE est en accès réservé aux clients de la
famille RésaCap (pendant le pilote). Rejoignez la famille sur
resacap.fr »* — la porte fermée VEND la mère. **FAIL-CLOSED
assumé** : si le pont se tait, la porte reste fermée (raison
« indisponible » → réessayer). La page /connexion porte la mention
vermillon « Accès réservé aux clients RésaCap pendant le pilote ».
**Pour ROUVRIR à tous un jour** : retirer l'appel de garde dans
/connexion (la route devient inerte) — noté aussi au
CREDENTIALS-ADMIN. C'est le niveau ① du document JOBLIVE × RESAFIX
(chez la mère) qui prend vie : le pilote se vit ENTRE clients de la
famille. Vérifié en prod : email inconnu refusé (raison famille) ·
compte RésaCap passé (connu resacap) · compte existant passé
(connu pro). tsc + build verts.

## Le 23/11 (3ᵉ) — FINIR LA MAISON POUR LES CONCIERGERIES : les photos par geste (011) + l'historique des fiches (direction : « on doit finir joblive, pour conciergerie »)

Les deux « fins de kit » du 19/11 nuit, livrées — ce qu'une vraie
conciergerie touchera en pilote.

**① LES PHOTOS MULTIPLES PAR GESTE (011, appliquée au pooler)** — le
constat de l'exploration : aucune limite « une photo » n'existait, ce
qui manquait était le LIEN — `mission_preuves` ne savait pas de quel
geste une photo est la preuve. DÉSORMAIS : `element_id uuid →
mission_elements` (nullable — les photos LIBRES de mission restent
libres, rétro-compat totale, index posé). **L'API du tier** accepte
le champ `element` au multipart — la garde vérifie qu'il appartient
à LA mission (le patron element-fait étendu, un geste d'ailleurs est
refusé 404). **L'écran de Marie** : chaque ligne de geste gagne son
bouton 📷 et SES vignettes dessous (l'horodatage né à la prise,
l'idiome intact) ; la section « Mes photos » vit pour les photos
sans geste. **La vue conciergerie** : la carte mission regroupe les
photos PAR GESTE (rangées nommées + compteur 📷 n sur la ligne),
les libres dans le bloc du tier — `SELECT_MISSIONS` imbrique
`element_id`. L'AVAL ne bouge pas : les photos coulent déjà dans
l'entrée mission du journal propriétaire, la dose est inchangée.

**② L'HISTORIQUE DES FICHES CLIENTS** — tout vivait en base
(`mandats.client_id`, `codes.mandat_id`), la vue manquait. `GET
/api/clients` enrichit chaque fiche de ses MANDATS imbriqués (lieu,
dates, statut, codes avec leur état — mort/vivant), du plus récent
au plus ancien. LA PAGE /pro/mandats gagne la section **« Vos
clients »** : badge ● régulier / ○ occasionnel, téléphone (tel:),
« N mandats », l'HISTOIRE DÉPLIABLE (une ligne par mandat : lieu ·
dates · VIVANT/TERMINÉ · code et son état) — et le clic sur une
fiche la PRÉSÉLECTIONNE pour un nouveau mandat (« Mme Perrin
revient → sa fiche → son mandat »).

**BANC `banc-photos-fiches.cjs` VERT SUR LA PROD** (patron
naissance, BANC_BASE) : fiche → mandat → code → service 2 tâches →
tier → mission → acceptation → photo LIÉE + photo LIBRE + 2ᵉ photo
sur le MÊME geste (la multiplicité prouvée) → geste FAUX refusé →
les liaisons lues EN BASE (2 liées / 1 libre) → l'écran du tier et
la vue conciergerie servent element_id → l'histoire de la fiche
(mandat + code vivant) → purge complète (base cascade + storage).
tsc + build verts.

**⚠ LEÇON PAYÉE (gravée)** : le premier push (6beb0db) avait
OUBLIÉ DEUX FICHIERS dans son git add par liste explicite —
`api/missions/route.ts` (le SELECT_MISSIONS) et
`pro/mandats/client.tsx` (la section Vos clients entière !). LE
BANC A ATTRAPÉ le premier en prod (la vue servait l'ancien select
pendant que la base portait les liaisons — symptôme « impossible »,
deux pushes de réparation d356a81 + b93d029, banc REJOUÉ VERT
18/18). AVANT CHAQUE PUSH : `git status` lu, ou `git add -u` —
jamais une liste explicite quand la session a touché beaucoup de
fichiers.

## Le 23/11 (2ᵉ) — LA BASCULE : « on fera après — il faut passer aux publications » (direction)

Le point ② de la route (le pilote conciergerie, le démarchage) et la
v2 RESTENT NOTÉS CI-DESSOUS — la direction les remet à après : la
priorité passe aux PUBLICATIONS de la famille (le travail de vague —
moule gravé du 18/11, les prompts vivent à la mère :
`vague-*.md` à la racine RésaCap). La route est intacte, elle attend.

## Le 23/11 (suite) — LE POINT ① DE LA ROUTE REFERMÉ : le pont des incidents VÉRIFIÉ EN PROD, la chaîne entière marchée

Le déploiement confirmé vert par la direction (Hostinger + Vercel),
puis la vérification complète :

- **LE BANC DE NAISSANCE REJOUÉ SUR LA PROD : 24/24 VERT** (la leçon
  du 20/11 honorée — le banc se rejoue après chaque déploiement),
  purge comprise.
- **LA CHAÎNE RÉELLE DES INCIDENTS, MARCHÉE DE BOUT EN BOUT** : le
  séjour vivant M. Simulé 1 (21→24/11, Chambre d'hôte) porte un
  incident déclaré par la VRAIE API au jeton /s
  (`/api/incidents-voyageur` — jeton forgé côté serveur, mortalité
  respectée, 200), puis CLOS avec frais par l'écriture cœur
  (Vitrine 120,50 € + Main d'œuvre 40 €) — et **la page /j/N9L224
  montre l'entrée « Incident · lundi 23 novembre »** avec le détail
  « remplacé : … », AU-DESSUS de la saison et des revenus restaurés.
- **LES PROVISIONS CONFIRMÉES AU CENTIME** : net novembre affiché
  −72 € ; recalcul indépendant par le pont (`periode` : ca 510 −
  dépenses 210 − commission 102 − frais 110 − **provisions 160,50**
  = −72). La ligne Provisions vit dans la décomposition (derrière le
  clic « voir la décomposition ») et dans le net, mathématiquement.
- **LE MONDE DE DÉMO RESTAURÉ AU PASSAGE** : le mandat TEST (N9L224)
  avait perdu son lien de bien (l'email était passé à
  simu@resacap.dev pour la démo « recherche 70+ » du 21/11 soir —
  plus aucun /j ne montrait la saison). Restauré l'état documenté :
  `pros.email_resacap = admin@resacap.fr` + `unit_resacap` =
  Chambre d'hôte (snapshot {id, slug, nom}). ⚠ Pour rejouer la démo
  de la recherche à l'échelle : repasser l'email à
  simu@resacap.dev (le lien de bien est indépendant — on peut le
  garder). L'incident DÉMO (clairement étiqueté « fictif, semé pour
  la démo ») VIT sur le bien — à purger d'un UPDATE quand la
  direction veut la base propre (il alimente délibérément les
  Provisions de la démo).
- NB : la déclaration a sonné le Telegram du loueur admin
  (« INCIDENT déclaré par M. Simulé 1 ») — c'est le canal, vivant.

## Le 23/11 (matin) — LA ROUTE NOTÉE : ce qui reste à faire (consigne direction : « note ce qui reste à faire »)

La photographie du lendemain, dans l'ordre où les choses demandent.
Rien de neuf n'est codé ce matin — c'est la CARTE, pas le chantier.

**① D'ABORD — VÉRIFIER LE DÉPLOIEMENT DU PONT DES INCIDENTS (22/11,
commit d3b11ad)** : le pipeline Hostinger ne redéploie pas toujours
seul (deux redeploys manuels le 21/11 — panneau → Déploiements →
Redeploy sur le dernier commit si la prod est muette), puis REJOUER
LE BANC (la leçon du 20/11 2ᵉ : le banc se rejoue après chaque
déploiement — naissance 24/24 + ordre 13/13). Puis la chaîne réelle
des incidents, jamais marchée en prod : semer un incident sur le
bien lié du mandat TEST (Chambre d'hôte, fontainetelga@yahoo.fr) via
la page séjour /s de la mère, le CLORE avec frais dans
/incidents — et voir l'entrée « Incident » + les PROVISIONS de la
décomposition sur la page /j. joblive.app répondait 200 ce matin.

**② LA PRIORITÉ MÉTIER — LE PREMIER VRAI PILOTE CONCIERGERIE** :
une conciergerie, un mandat, un chien promené. L'argument a ENCORE
grandi hier chez la mère (saison + revenus + voyageur + EDL signé
par le voyageur + incidents qui nourrissent le journal propriétaire
— la transparence des deux côtés). Le kit est PRÊT : la page
/conciergerie parle d'elle-même, `démarchage-conciergerie.md` (119
lignes, racine Joblive : SMS · message · mail, signés Tanya,
gratuit pendant le pilote, installation AVEC la conciergerie en 15
minutes) — IL RESTE À LE DÉROULER. La friction Play Protect
Android (texte prêt, entrée du 19/11) resservira à l'installation
de la tuile.

**③ LA V2 DANS L'ORDRE GRAVÉ (décision 20/11 : les notifications
EN TÊTE de la v2)** :
- ① **LES NOTIFICATIONS EN TÊTE** — le téléphone du propriétaire
  VIBRE quand la photo arrive, la conciergerie est prévenue au
  geste. Rien n'existe encore côté push (aucun VAPID, aucun service
  worker de notification — le PWA est installable mais muet) :
  web push à bâtir, ou Telegram en relais rapide. Aujourd'hui le
  direct vit à chaque rechargement, personne n'est poussé.
- ② **LE RELAIS IA** — la voix qui répond « et le véto ? » DEPUIS LE
  JOURNAL UNIQUEMENT (l'IA ne dit que ce qui est écrit). IA chinoise
  d'abord (DeepSeek/Qwen/GLM — coût imbattable, modèles ouverts),
  Mistral en repli, jamais américaine en première intention.
  Annonce « TEST RELAIS IA EN COURS » sur UN SEUL hébergement, dosé,
  « pilote automatique quand le pilote dort ». Le libellé INPI
  classe 42 l'a déjà réservé.
- ③ **VERITIC** — le moteur commun (la vérité du temps équipe les
  deux maisons — spec préservée chez la mère, docs/VERITIC.md).

**④ LES FINS DE KIT** (posés le 19/11 nuit, restés ouverts) : les
photos MULTIPLES par élément de mission (aujourd'hui une par geste)
· L'HISTORIQUE DES FICHES (les mandats passés d'un client) · LE
TEST QR (jamais testé — en attente, rien à faire).

**⑤ LES FILETS INFRA À SUIVRE** : les env HOSTINGER de Biendispo et
Aktivit doivent porter la phrase de passe unifiée du pont (pont
sœurs activation/vente — à vérifier un jour de passage hPanel) · le
**Site URL Supabase** dort encore sur localhost:3000 (à repointer
https://joblive.app — geste direction, 30 secondes, NON bloquant :
les Redirect URLs couvrent déjà la prod) · la tuile d'icône finit à
52 % (« on laisse comme ça pour l'instant » — la direction peut
revenir dessus).

**⑥ CHEZ LA MÈRE, EN RÉSERVE (ça nous touche)** : les CAUTIONS
Stripe (empreinte bancaire, capture manuelle — tout à bâtir côté
paiement) et les NOTIFICATIONS 24/7 du séjour (les deux briques
voyageur non choisies le 22/11) · la publication des AVIS voyageurs
vers la vitrine /v. La scène Claire vit toujours en prod :
/j/J4L438 (purge : `node scene-mobile.cjs purger`). Les mondes de
démo : mandat TEST (Chambre d'hôte + modèle 20 %/50 €/30 €) ·
simu@resacap.dev (21 hébergements).

## Le 22/11 — LE PONT DES INCIDENTS REÇU : la preuve voyageur au journal du propriétaire (briques 2+ voyageur chez la mère)

La chaîne de la vision du 21/11 se referme : le VOYAGEUR déclare un
incident sur sa page séjour RésaCap (/s), la CONCIERGERIE le traite
et le CLOS avec frais — et le journal du propriétaire (/j) le montre
DÉJÀ. **LA CLOTURE EST L'ACTE DE PUBLICATION** : /api/pont-bien ne
rend QUE les incidents clos (sceau sceauBien('incidents', …), le
patron prouvé) — jamais le nom du voyageur, la dose commence au
pont.

- **LE MIROIR** (src/lib/pont-resacap.ts) : `incidentsResacap(email,
  unitId, debut, fin)` — un seul appel sur l'année civile, le mois
  de la décomposition se filtre localement.
- **LA TIMELINE** (/j/[code]) : les incidents clos rejoignent les
  entrées APRÈS le filtre de dose — leur publication était la
  CLOTURE chez la conciergerie, pas une catégorie de travail à
  doser. Catégorie « Incident » (format.ts), note = description +
  « remplacé : … » quand les frais vivent, photos en URLs ABSOLUES
  (urlPhoto laisse passer http(s) — elles vivent dans le bucket
  public de la sœur aînée, jamais re-préfixées).
- **LES PROVISIONS** : la décomposition des REVENUS gagne sa ligne —
  net = CA − dépenses − commission − frais fixes − **provisions**
  (Σ frais des incidents clos de la fenêtre, libellé par libellé,
  badge « incident clos »). Le propriétaire voit le résultat, jamais
  les règles — la doctrine tient.
- tsc + build verts. La source vit au journal RésaCap du 22/11
  (0126, banc 24/24 : que les clos traversent, JAMAIS le nom).

## LA NAISSANCE (18/11, direction : « GO »)

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
- En réserve v2 — **LES NOTIFICATIONS EN TÊTE** (décision direction
  du 20/11 : le téléphone du propriétaire vibre quand la photo
  arrive, la conciergerie est prévenue au geste — la promesse
  « le travail vu en direct » poussée jusqu'au poignet ; aujourd'hui
  le direct vit à chaque rechargement, personne n'est poussé) :
  ① les notifications · ② le relais IA (depuis le journal
  uniquement — l'IA ne dit que ce qui est écrit) · ③ le pont
  RésaCap (la Production qui coule) · VERITIC (le moteur commun —
  la vérité du temps équipe les deux). *(L'équipe, elle, est sortie
  de la réserve : les missions tierces lui ont donné son visage.)*

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

## LE VRAI LOGO PREND LE SITE (19/11, après-midi, direction : « celui du site n'est pas bon »)

Le monogramme vivait en TYPOGRAPHIE CSS (J + cercle + point
vermillon dessinés en styles) — une approximation qui ne parlait pas
la vraie identité. **Le remplacement** : la livraison ChatGPT validée
du monogramme JoB (robe exacte mesurée, œil vermillon), passée au
pipeline `habiller-logo.py` — deux habits nés : `logo-job.png`
(jour, encre verte) et `logo-job-nuit.png` (encre pierre, l'œil
vermillon ne s'éteint jamais), rognées, 512px de large, 55-71 Ko.
**Six emplacements remplacés** : l'en-tête de la landing (nuit +
mot JOBLIVE), la connexion et l'entrée de code (jour, h-14),
l'en-tête du mandat client et le dashboard pro (nuit), l'entrée
morte (jour fantôme opacity-40). tsc + build verts, serveur local
vérifié (les deux PNG servis 200), puis déploiement par push.

*Les classes CSS .monogramme/.o-live restent en réserve dans
globals.css — l'histoire garde ses outils.*

**Les icônes suivent (le même jour)** : l'onglet du navigateur reçoit
la cible o-œil (favicon 32/48, transparents, robe exacte) ; les apps
reçoivent le squircle **aplati sur pierre** (iOS déteste la
transparence — les coins arrondis deviennent pierre : même visage,
fond plein) en 180/192/512 ; le maskable se reconstruit propre
(pierre plein, JoB à 50 % — la zone sûre respectée). Le cache du
service worker monte en `joblive-v2` : les installs existantes
rechargent la robe au prochain passage. QA machine : robe partout
(pierre + vert + l'œil vermillon dans chaque icône).

## LE KIT PILOTE CONCIERGE — la maison accueille sa première vie (19/11, soir)

La direction a sonné le front : « l'urgence c'est conciergerie ». La
méthode : **marcher soi-même le chemin réel d'une conciergerie qui
arrive à vide** — on répare ce qui bloque la réalité, pas ce qu'on
imagine. La marche (pro neuf → maison vide → mandat → code → partage)
a révélé deux manques, réparés le jour même :

1. **LE PARTAGE QUI PARLE** — le code ne part plus en URL nue : le
   pro partage un MESSAGE (« suivez le travail en direct chez vous —
   chaque passage arrive en photos horodatées : lien (jusqu'au…) »)
   par la feuille native du téléphone (SMS, WhatsApp), ou bouton
   **SMS direct** pré-rempli vers le numéro du mandat (l'API accueil
   porte désormais client_tel), ou copie du message en repli bureau.
2. **LA CARTE PREMIÈRE FOIS** — la maison vide ne laisse pas le
   nouveau pro devant un CTA éteint : trois gestes numérotés (ouvrir
   un mandat · envoyer le code · photographier le premier geste) et
   le bouton qui ouvre la porte.

La marche à vide a tourné sur serveur local : accueil vide OUI,
mandat Mme Perrin né avec téléphone, code N6F-784 expirant, client_tel
de retour par l'accueil, purge complète (la règle tient). tsc + build
verts. **La suite du kit** : le pitch de la landing parle au
propriétaire — il manque la page qui parle à LA CONCIERGE (son gain à
elle : le mandat gagné, l'armure en litige, 15 minutes de moins au
téléphone à rassurer).

## LA PAGE QUI PARLE À LA CONCIERGE — /conciergerie (19/11, soir, la suite du kit)

Le concret demandé par la direction : une page à ENVOYER. La landing
parle au propriétaire (« Vous partez… ») ; **/conciergerie** parle à
celle qui fait le travail — « Le propriétaire compare. Celui qui
montre l'emporte. » La pièce concrète au centre : **LE JOURNAL
D'EXEMPLE**, une vraie carte client rendue en CSS (en-tête vert,
badge ● EN DIRECT, AVANT 14:29 / APRÈS 14:51 avec patte 🐾 — la leçon
de la vision : des aplats de couleur ne se lisent pas comme des
photos, la patte les fait lire —, la note d'Oscar, le sceau, le « vu
à 14:58 », la pastille « Tout va bien — reçu 15:07 ✓ »). Ses trois
gains (le mandat gagné · l'armure en litige · le téléphone qui se
tait), la mécanique des trois gestes chronométrés (2 MIN · 10 SEC ·
SUR PLACE), LA DOSE, et le CTA vermillon « Votre première preuve en
15 minutes — gratuit pendant le pilote ». Le fil d'entrée : bandeau
vermillon sous l'en-tête de la landing + lien en pied. Captures
mobiles vérifiées (390px, la vue de la conciergerie), tsc + build
verts.

## LE JEU DE RÔLE A PARLÉ — l'identité du pro naît (19/11, soir)

La direction n'a pas le temps de démarcher ; sa méthode : « se mettre
à la place de l'autre ». **LA MACHINE A JOUÉ LES DEUX RÔLES** — une
scène vivante (Claire la concierge, Mme Perrin l'absente, Oscar le
chien : mandat réel, code T9K-296, deux journées publiées), puis deux
rôles marchés pour de vrai dans le navigateur, en 390px :

**MME PERRIN** a ouvert le lien du SMS : le titre lui parle, sa villa
est nommée, Oscar apparaît, la mort du code est annoncée — mais
PERSONNE ne se présentait (qui envoie ce lien ? réflexe d'arnaque) et
les photos ne se zoomaient pas (le geste le plus naturel du client).
**CLAIRE** a cliqué son lien magique (flux confirmé en vrai : hash →
session → /pro), a vu la boucle se fermer (« Tout va bien — reçu
13:16 ✓ »)… et a été saluée par son EMAIL BRUT, sans aucun moyen de
dire son nom.

**LES TROIS FRICTIONS N'ÉTAIENT QU'UNE** : l'identité du pro
n'existait pas dans la maison. LE REMÈDE (vérifié rôle par rôle) :
- **migration 002** : pros.enseigne ;
- **la carte « Comment vous appelez-vous ? »** — nom + enseigne à la
  première venue (tant qu'elle n'est pas remplie, le salut reste
  « Bonjour » nu) + l'API /api/pro/profil ;
- **la signature du journal client** — « par {enseigne ou nom} » sous
  la villa : Mme Perrin sait qui lui parle ;
- **les photos cliquables** — chaque preuve ouverte en grand dans un
  onglet, le zoom natif du téléphone fait le reste.

Rejoué : « Bonjour Claire » ✓ · « par Conciergerie Les Oliviers » ✓ ·
« Agrandir la photo avant/après » ✓. Scène purgée, base zéro ligne.
La leçon gravée : **le jeu de rôle remplace le terrain tant que le
terrain n'existe pas — et il trouve ce que le banc ne cherche pas**
(le banc vérifie la chaîne, le rôle vit l'expérience).

## LA DIRECTION TESTE SUR SON MOBILE — la boucle des cinq tours (19/11, nuit)

Le premier test mobile réel, par la direction elle-même, sur Chrome :
la scène vivante en prod (`/j/J4L-438` — Claire, le Studio Les Pins,
ménage de sortie + accueil voyageurs). La boucle de la soirée — un
verdict, un correctif, un déploiement, l'œil tranche :

1. **« LA TUILE MOBILE −15 % »** — d'abord comprise comme les photos
   du journal (fait : w-85 %, sceau 30→24 px — des gestes justes qui
   restent)… puis le sens vrai est arrivé : LA TUILE = l'icône de
   l'app sur l'écran d'accueil, le manifest.
2. **« LE LOGO DANS LA TUILE TOUJOURS TROP GROS »** — le bug était
   GÉOMÉTRIQUE : le JoB est un bloc large (2,25:1), réglé en hauteur
   il couvrait 101 % de la largeur — bords touchés. Mesuré désormais
   en LARGEUR : 58 % L × 26 % H (maskable 50 % L), les marges sont
   vraies. Aperçu aux tailles réelles : apercu-icone-ecran.png.
   Leçon : un logo large se mesure en largeur dans une tuile carrée.
3. **« LA MISE EN PAGE A UN PROBLÈME »** (page d'accueil) — la vision
   a confirmé : logo + mot « JOBLIVE » + bouton = le **B rogné** sur
   390 px. Le remède sobre : LE LOGO EST LE NOM — le mot redondant
   part des deux en-têtes (accueil + concierge).
4. Caches montés en v3 puis v4 ; ôter/remettre l'icône pour voir la
   robe neuve (le mobile fige la tuile à l'installation).
5. **« C'EST BON »** — le verdict final de la nuit, sur Chrome.

**La tuile finit à 52 %** (58 trop grand → 46 trop petit → 52, la
mesure d'or, « on laisse comme ça pour l'instant » — la direction
peut revenir dessus). **LA FRICTION PLAY PROTECT** (terrain, à
réutiliser au pilote) : sur certains Android, l'installation de la
tuile râle — « appli conçue pour une version plus ancienne
d'Android » ; c'est l'emballage WebAPK que Chrome coud lui-même,
pas notre code : attendre le délai imposé (4-10 s) puis « Installer
quand même ». Le texte du pilote est prêt dans la réponse à la
direction. Sur iPhone, le message n'existe pas.

## LA VISION DE LA DIRECTION — l'amont, l'aval, la joblivisation (19/11, nuit — texte fondateur)

*Verbatim de la direction :* « Le prestataire doit établir deux types
de clients — réguliers et occasionnels — et doit établir une liste
d'informations à partager et une liste de services. Chaque service
doit avoir une liste de tâches générales et particulières. À chaque
élément le prestataire choisit s'il le partage via JOBLIVE : il est
JOBLIVISÉ, c'est celui qui est partagé. On peut aussi des missions
pour d'autres personnes — salariés, partenaires, prestataires — avec
des éléments à jobliviser. On introduit le principe de l'AMONT et de
l'AVAL : une femme de ménage peut avoir une mission avec des éléments
à jobliviser ; la conciergerie est AU CENTRE, elle transmet ces
éléments en aval au propriétaire. La conciergerie décide de partager
les éléments directs et indirects. »

**Traduite en architecture maison :**

1. **LA FICHE CLIENT** — le propriétaire devient une fiche vivante,
   typée **régulier** ou **occasionnel**. Le mandat s'y rattache (on
   ne retape plus « Mme Perrin, Villa… » à chaque saison).
2. **LES DEUX LISTES** — par client : les informations (à partager ou
   non) et les services commandés.
3. **LE CATALOGUE DE SERVICES** — chaque service porte ses TÂCHES
   GÉNÉRALES (la qualité constante) et ses TÂCHES PARTICULIÈRES (le
   soin propre au bien).
4. **LA JOBLIVISATION** — chaque ÉLÉMENT (info, service, tâche) porte
   son drapeau : partagé via JOBLIVE ou interne. LA DOSE
   généralisée — la granularité descend de la catégorie à l'élément.
5. **LES MISSIONS TIERCES** — la conciergerie assigne des missions à
   salariés, partenaires, prestataires, avec leurs éléments à
   jobliviser. Le tiers exécute et joblivise vers la conciergerie.
6. **L'AMONT ET L'AVAL** — la conciergerie est au centre : l'amont
   joblivise vers elle ; elle choisit ce qu'elle retransmet en aval
   au propriétaire — éléments DIRECTS (les siens) et INDIRECTS (ceux
   de ses tiers). Le propriétaire ne voit qu'une maison.

**La route proposée** (chaque étape tient debout seule) :
① la fiche client (régulier/occasionnel, mandats rattachés) →
② le catalogue (services, tâches générales/particulières,
joblivisation par élément) → ③ les missions tierces (l'équipe amont)
→ ④ l'aval (retransmission au propriétaire : directs + indirects).

Cette vision ne casse pas la v1 — elle l'ORGANISE : le journal sans
IA reste le cœur, la dose reste l'outil du pro, et « l'équipe » de la
réserve v2 a trouvé son visage.

**Étape ① posée dans la foulée (19/11, nuit)** — LA FICHE CLIENT :
migration 003 (clients : nom, type régulier/occasionnel, téléphone ;
mandats.client_id), l'API /api/clients (naissance sans doublon — même
nom, même fiche), la carte de création à puces de fiches (● régulier /
○ occasionnel), le badge sur chaque mandat, le téléphone vit la fiche
et le lieu vit le mandat (un régulier, deux biens). Vérifié : fiche
née, doublon absorbé, rattachement, type à l'accueil, purge.

**Étape ② posée la même nuit — LE CATALOGUE** : migration 004
(services + taches, genre générale/particulière, RLS), l'API
/api/catalogue (sept gestes dont LES GABARITS DU MÉTIER — location
touristique : ménage de sortie/séjour, accueil voyageurs, linge,
piscine, jardin, posés sans doublon), la page /pro/catalogue (l'icône
du livre dans la barre des trois pages) où chaque SERVICE et chaque
TÂCHE porte SON DRAPEAU — ● JOBLIVISÉ / ○ INTERNE — la dose descend
de la catégorie à L'ÉLÉMENT, exactement la vision. Vérifié 7/7 :
gabarits posés puis absorbés, tâche née dans son genre, drapeaux
bascules service ET tâche, isolation entre pros, purge cascade.

**Étape ③ posée la même nuit — LES MISSIONS TIERCES (l'amont)** :
migration 005 (tiers : salarié/partenaire/prestataire ; missions :
tiers × mandat × service, statut à faire/en cours/faite/annulée ;
mission_elements : libellé, genre, DRAPEAU joblivisé, case FAIT).
La création d'une mission COPIE les tâches du service comme éléments,
drapeaux du catalogue transportés — puis la dose se règle mission par
mission : cocher (fait), passer un élément interne, en ajouter un sur
mesure (« Cacher les objets fragiles du salon »). L'API vérifie
l'appartenance de chaque élément avant d'y toucher. Page /pro/missions
(l'icône de l'équipe) : le registre des tiers, l'assignation à puces
(qui · quel mandat · quel service · quand), les missions vivantes avec
compteur (faits/joblivisés) et les closes pliées. La barre compte
QUATRE pages : Journal · Mandats · Catalogue · Missions. Vérifié de
bout en bout : écosystème complet né, 9 éléments hérités drapeaux
compris, vie de la mission (cocher, interne, sur mesure), statuts,
purge cascade. **Ce qui reste à l'étape ③** : l'ÉCRAN DU TIER lui-même
(Marie ouvrant SA mission sur son téléphone — ses mains restent
libres) — et l'étape ④ : l'aval, la retransmission au propriétaire.

**③-bis posée dans la foulée — L'ÉCRAN DE MARIE** : chaque mission
naît avec SON JETON (le patron des codes : G3V9K4J7, mémorable, sans
signes ambigus — migration 006). La conciergerie lui ENVOIE le lien
(message pré-rempli ou SMS direct au téléphone du registre — le
partage qui parle, encore). Marie ouvre `/m/<jeton>` : SA mission
(titre, lieu, ses gestes en grosses cases), SANS COMPTE — et elle ne
voit JAMAIS les drapeaux ●○ : la dose reste l'affaire de la
conciergerie (la vision : le pro décide de l'amont ET de l'aval).
Elle coche, elle PHOTOGRAPHIE (l'horodatage naît à la prise, le
bucket des preuves), elle termine — le bouton vermillon ferme le
lien (403 sur tout geste après). Les photos de Marie remontent à la
conciergerie (vignettes cliquables dans la mission ouverte).
Vérifié de bout en bout : lien ouvert sans session, 3 gestes cochés,
photo horodatée servie du bucket, fermeture 403, la conciergerie
voit 3/9 faits + 1 photo + 9 drapeaux joblivisés — PRÊTS POUR
L'AVAL (étape ④). Purge cascade + storage.

**Étape ④ posée dans la même nuit — L'AVAL, LA VISION BOUCLÉE** :
quand le propriétaire ouvre /j/<code>, son journal porte désormais
LE TRAVAIL INDIRECT — les missions du mandat coulent dans la
timeline : les missions FAITES arrivent en entrées (titre, gestes
joblivisés FAITS joints par « · », photos à leur heure), les
missions EN COURS arrivent marquées du badge rouge EN COURS (la
présence, jusqu'à l'amont). LES RÈGLES DE LA DOSE, vérifiées une à
une dans le HTML du propriétaire : le geste partagé VISIBLE · le
geste INTERNE INVISIBLE · le nom du tier NULLE PART (la conciergerie
est le visage — signature « par {enseigne} ») · les photos de Marie
visibles et cliquables, à leur heure de prise (grille « travail » —
ni AVANT ni APRÈS, l'heure seule) · le bouton « Tout va bien »
réservé au travail direct (l'aval se regarde, il ne se commente
pas) · une mission entièrement interne n'apparaît pas du tout.
Verdict final 7/7, purge complète.

**LA VISION DE LA DIRECTION EST POSÉE EN UNE SEULE NUIT** — ① la
fiche client (régulier/occasionnel) ② le catalogue et la
joblivisation par élément ③ les missions tierces et leur écran
mains-libres ④ l'aval. La chaîne amont→centre→aval vit entière :
la conciergerie orchestre, Marie exécute les mains libres, le
propriétaire ne voit qu'une maison. Restent pour les jours qui
viennent : les photos multiples par élément, l'historique des
fiches (ses mandats passés), et le premier VRAI pilote Biendispo —
la maison est prête pour lui.

## LE REGARD DU CENTRE — la conciergerie voit le travail indirect (20/11, verdict direction : « je suis la conciergerie et je n'ai pas vu »)

Le test réel de la direction (kit ①→⑥, en mobile) : le tier a fait
sa mission, **LE CLIENT A VU** (l'aval marche) — mais la conciergerie
n'a rien vu et **ne savait pas où aller**. Le centre était aveugle
alors que la vision le veut AU CENTRE : le verdict du jour. Deux
leçons en sus : **LE PC** (« je ne suis pas à l'aise sur mobile,
j'aurais préféré tout préparer sur PC » — le kit disait « depuis ton
mobile » alors que les pages sont des colonnes qui marchent pareil au
PC : même adresse, même lien magique ouvert depuis le mail du PC ;
le kit est corrigé) et **le QR non testé** (en attente, rien à
faire).

**LE REMÈDE — le patron codes.vu_le appliqué aux missions**
(migration 007 : `missions.vue_le`, appliquée au pooler ✓) :

- `/api/pro/accueil` porte `missionsFaites` — les 5 dernières closes
  (tier, client, gestes faits, photos, fermee_le, vue_le) ;
- LE DASHBOARD gagne la section « **Le travail indirect** » entre le
  CTA et « En cours » : pastille vermillon-voile, « terminée à HH:MM ·
  X/Y gestes · N photos », pilule **« À REGARDER »** vermillon (ou
  « vue à HH:MM » en graphite une fois ouverte) — le clic pose vue_le
  et mène aux missions ;
- `/pro/missions` : les FAITES non vues sortent des closes pliées —
  section « **À regarder** » en tête (liseré vermillon, gestes
  partagés joints par « · », photos en grille, bouton « J'ai
  regardé ») ; les closes portent « vue à HH:MM » ;
- LA NAV : les quatre copies duplicuées de la barre basse meurent —
  UN composant `NavPro` (src/lib/nav-pro.tsx) avec **badge vermillon
  sur Missions** (le compte des faites non vues, rafraîchi à chaque
  navigation) ;
- `/api/missions` : action `voir` (pose vue_le, appartenance
  vérifiée comme chaque geste).

tsc + build verts. LE KIT DE TESTS suit (le PC partout + la ⑥ qui
fait revenir au dashboard voir le signal). La leçon du jour, gravée :
**chaque maillon qui voit doit avoir un endroit qui le lui dit** —
le client avait son journal, le centre n'avait rien. Committé,
poussé.

## Le 20/11 (2ᵉ) — LES DEUX RATTRAPAGES DU BANC POST-DÉPLOIEMENT : la preuve du direct ressuscitée, le journal scopé au pro

Le banc rejoué sur la prod après le push a attrapé DEUX fautes que
la nuit de l'④ avait laissées (LEÇON GRAVÉE : **le banc se rejoue
après chaque déploiement** — il vérifie la chaîne, pas seulement la
nouveauté) :

1. **LA PREUVE DU DIRECT RESSUSCITÉE** — en généralisant la grille
   travail pour l'aval, la nuit de l'④ avait ÉCRASÉ le diptyque
   AVANT/APRÈS : la condition ne rendait plus que les photos genre
   `travail` — le client ne voyait plus les preuves du travail
   direct (le banc : « preuves absentes »). Les DEUX grilles vivent
   désormais : le diptyque AVANT/APRÈS du direct (restauré à
   l'identique d'avant l'④) + la grille travail de l'aval (l'heure
   seule).
2. **LE JOURNAL SCOPÉ AU PRO** — `enCours` et le journal du jour de
   `/api/pro/accueil` n'avaient AUCUN filtre pro : chaque pro voyait
   les publications des autres. La doctrine « RLS zéro policy +
   filtre côté serveur » exigeait le geste : `.eq('mandats.pro_id')`
   sur les deux requêtes. Audit des autres routes : codes, preuves,
   missions, interventions déjà scopés — le jeton mission reste
   public par design (comme les codes client).

**ET LE BANC GRANDIT AVEC LA BASE** — l'assert de purge exigeait une
base VIERGE ; la base vit désormais (la scène Claire, les tests de
la direction) : le banc ne juge plus que SES propres lignes (pro,
mandat, intervention, preuves, codes, réactions — plus l'ensemble).

**BANC DE NAISSANCE VERT SUR LA PROD** — 24/24, base vivante, deploy
Hostinger vérifié (~3 min de build). Au passage : trois runs du banc
échoués purgés à la main (auth.users → cascade + storage — le banc
ne purge que quand il va au bout). **LE SIGNAL ATTEND LA DIRECTION**
— sa mission de test du matin (« Ménage de sortie », FAITE 20:03,
jamais vue) portera la pilule « À REGARDER » sur son dashboard dès
sa prochaine connexion, badge vermillon sur Missions compris.
Committé, poussé.

## Le 20/11 (3ᵉ) — LE DÉTAIL AVANT LE REGARD (verdict direction : « j'ai vu À REGARDER mais il a disparu, je n'ai pas vu les tâches faites ni les photos »)

La boucle en direct avec la direction sur PC : la pilule s'était
éteinte à son clic SANS jamais montrer les photos — le signal
tuait le contenu qu'il annonçait. LE REMÈDE (le bon ordre du
monde) : **la carte du dashboard OUVRE la mission en grand**
(`/pro/missions?m=<id>`) — les gestes cochés, les drapeaux et la
grille de photos s'affichent, PUIS le regard s'inscrit (ouvrir une
faite non vue la marque vue ; le bouton « J'ai regardé » meurt,
l'ouverture EST le regard). **LES CLOSES S'OUVRENT TOUJOURS** —
« Missions closes — cliquez pour revoir les photos » : le journal
du travail ne disparaît pas une fois vu (la carte porte « terminée
à HH:MM · vue à HH:MM · N photos », et se déplie pareil). LE BADGE
s'éteint en direct : la page missions crie `joblive:missions`
après chaque geste, la nav écoute. Les quatre listes (à regarder /
vivantes / closes) partagent UNE CarteMission — les mortes non
cliquables n'existent plus. Banc vert après coup (24/24), déployé,
vue_le remis à zéro pour la démo direction. Committé, poussé.

**VERDICT DIRECTION (suite, même jour) : « ok c'est bon »** — le
cycle du regard est validé sur PC. Au passage, la question du
direct (« le prestataire pouvait-il envoyer tâche par tâche, photo
par photo ? ») : C'EST DÉJÀ LE CAS — chaque coche et chaque photo
partent à l'instant du geste (la conciergerie voit la mission
vivre, le client voit l'entrée EN COURS grossir) ; ce qui manque
est le PUSH — et c'est gravé : **LES NOTIFICATIONS PASSENT EN TÊTE
DE LA V2** (voir EN ATTENTE).

## Le 20/11 (4ᵉ) — L'ORDRE DE MISSION ET L'ACCEPTATION : le tiers signe avant de travailler (direction : « le prix proposé, le contrat ou ordre de mission — et je n'ai pas vu que le prestataire ait accepté la mission »)

La mission partait au tiers nue — sans prix, sans conditions — et
il n'acceptait jamais : il ouvrait et faisait. LA PIERRE POSÉE
(migration 008 : `missions.prix` texte libre [« 45 € », « 20 €/h » —
la compta vit chez RésaCap] · `missions.conditions` [le contrat,
AMENDABLE à tout moment : le lien du tier montre toujours la
dernière version] · `missions.accepte_le` [la signature, posée UNE
fois, jamais réécrite]) :

- **L'ÉCRAN DU TIER** montre désormais L'ORDRE DE MISSION d'abord :
  le prix proposé en grand, les conditions, le bouton vermillon
  « J'accepte la mission » — les gestes, les photos et « terminé »
  restent CACHÉS avant la signature, qui ouvre le travail (et passe
  la mission en cours).
- **LA GARDE EST SERVEUR** — tout geste (la photo multipart
  comprise) est refusé 403 « à accepter » tant que la signature
  manque : l'écran du tier n'est que la politesse.
- **LA CONCIERGERIE** édite l'ordre dans la carte ouverte (prix +
  conditions + Enregistrer, même après envoi) et lit la trace en
  en-tête : « PAS ENCORE ACCEPTÉE » / « acceptée à HH:MM ». Le
  message du lien porte la rémunération — le tiers sait ce qu'il
  accepte avant d'ouvrir.

**BANC DE L'ORDRE VERT sur la prod, 13/13** : l'ordre s'affiche
avec le prix · les gestes cachés avant acceptation · « terminer »
refusé 403 · la signature posée (idempotente) · le travail ouvert ·
la trace côté conciergerie (statut passé en cours). Banc de
naissance vert après coup. La leçon du banc en passant : l'apostrophe
de « L'ORDRE » s'échappe en HTML — les assertions cherchent la
chaîne SANS apostrophe. Committé, poussé.

## Le 20/11 (5ᵉ) — LE MOT JOBLIVE REVIENT DANS L'EN-TÊTE (verdict direction : « il n'y a pas en blanc JOBLIVE, comme au début »)

La nuit des cinq tours l'avait retiré des deux en-têtes (accueil +
conciergerie) pour sauver le B rogné à 390 px — « le logo est le
nom ». Le nom revient par verdict direction : le bloc d'origine
(logo + « JOBLIVE » texte sm, tracking 0.18em, pierre/80) tient
dans l'air du 390 px (≈317 px dans 350) — le rognage venait des
tailles d'avant, pas du mot lui-même. Vérifié en prod sur les deux
en-têtes. Committé, poussé.

## Le 20/11 (soir) — LE POINT DU RELAIS (fin de session, tout est mémorisé)

LA JOURNÉE EN CINQ ENTRÉES CI-DESSUS : ① le regard du centre
(la conciergerie voit le travail indirect, badge + pilule À
REGARDER) · ② les deux rattrapages du banc (le diptyque AVANT/APRÈS
ressuscité, le journal scopé au pro) · ③ le détail avant le regard
(la carte ouvre la mission en grand, les closes se rouvrent
toujours) · ④ l'ordre de mission et l'acceptation (prix + conditions
amendables, la signature avant le travail, garde serveur) · ⑤ le
mot JOBLIVE revenu dans les en-têtes. BANCS VERTS : naissance 24/24
+ ordre 13/13, base vivante.

LA FAMILLE AUSSI A VÉCU : la vague « Nouvelle Ère 2 » publiée le
matin (pigeon, manivelle, marathon, jongleur — FB 4/4 ; **INSTA EN
ATTENTE chez RésaCap et Resafix, bloqué** — à republier au
déblocage, entrée du jour ; légendes dans `vague-nouvelle-ere-2.md`
à la racine RésaCap). Au passage : `corriger-visuels.cjs` (Biendispo)
accepte le .webp.

TOUT EST POUSSÉ : RésaCap, Biendispo, Aktivit, Resafix, Joblive —
origin/main partout.

LA ROUTE (pour la prochaine session) : **le premier VRAI pilote
conciergerie** (le texte de démarchage attend : `démarchage-conciergerie.md`
à la racine Joblive) · les photos multiples par élément ·
l'historique des fiches (mandats passés) · le test QR (jamais testé) ·
v2 : **les notifications en tête**, puis relais IA, pont RésaCap,
VERITIC. La scène Claire vit toujours en prod : /j/J4L438
(purge : `node scene-mobile.cjs purger`).

## Le 21/11 — LA SAISON DU BIEN : le pont RésaCap→Joblive, face propriétaire (vision direction : « le propriétaire voudra savoir où en est son bien — la conciergerie n'est plus dérangée »)

La page du propriétaire devient **le portail de son bien** — la
doctrine de la scène fondatrice étendue du travail à la
commercialisation : *la réponse doit déjà être là*. Le moteur est
RésaCap, le visage est Joblive (la face propriétaire du pont sœurs).
Briques : **le calendrier des réservations** (grille du mois, nuits
réservées en vert, D l'arrivée, F le départ, aujourd'hui cerclé) ·
**les nuitées vendues** (mois affiché + à venir 12 mois, sémantique
[début, fin)) · **les supports de vente actifs** (badges canaux).
Les MONTANTS attendent la brique suivante : le moteur de revenus —
commission + frais fixes composites négociés, VIVANT SUR LE MANDAT
(déjà tranché par la direction : « attention aux modes de calcul
individuels négociés »).

**LA CHAÎNE POSÉE EN UNE JOURNÉE** :
- **RésaCap** : `/api/pont-bien` scellé HMAC (`sceauBien` sur
  action+email+unit+plage, le patron pont-vente) — actions `unites`
  (l'annuaire par email) et `saison` (les séjours CONFIRMÉS, canal
  de vente NOMMÉ via la connexion, jamais les noms des voyageurs,
  jamais les blocs pinceau) + les canaux actifs.
- **Joblive** : migration 009 (`pros.email_resacap` l'annuaire ·
  `mandats.unit_resacap` le lien · `mandats.saison_visible` LA DOSE
  opt-in fermée par défaut) ; lib `pont-resacap` (serveur seul) ;
  API `/api/pro/resacap` ; la carte mandat gagne « Le bien RésaCap »
  (email → chips → lier/délier + l'interrupteur de saison) ; la page
  `/j/<code>` gagne la saison AU-DESSUS du journal — le pont ne
  casse JAMAIS le journal (muet par conception).
- **LA SOUDURE (geste direction)** : la phrase de passe du pont a
  été **UNIFIÉE** — la valeur `delestage-dev-…` des `.env` locaux
  est désormais AUSSI celle de Vercel RésaCap (l'ancienne prod y
  était marquée sensible, illisible). Une empreinte temporaire
  (6 caractères + longueur, jamais le secret) a prouvé ce que le
  process portait, puis a été retirée. LEÇON : une valeur
  illisible dans un tableau de bord finit par diviser la maison —
  la phrase de passe vit maintenant IDENTIQUE partout (Vercel
  RésaCap · Hostinger Joblive · les .env locaux). ⚠ RESTE À VÉRIFIER :
  les env HOSTINGER de Biendispo et Aktivit doivent porter la même
  (ils parlent au pont activation/vente).
- **VÉRIFIÉ EN PROD, LA CHAÎNE ENTIÈRE** : pont direct 200 (22
  séjours du Bungalow SIMU) · annuaire par le compte simu@resacap.dev ·
  lien + dose + code → la page propriétaire AFFICHE la saison, le
  bien, les nuitées · purge. FAUSSE ALERTE fermée au passage : les
  tables RésaCap sont toutes sous RLS (audit live : 0 nue — le
  REST anon répond 42501 partout).

Committé, poussé.

**LE NOM PARTOUT (verdict direction : « plusieurs pages n'ont pas
JOBLIVE en blanc à côté du logo »)** — le mot vit désormais sur
CHAQUE en-tête : connexion et entrée de code (logo centré + JOBLIVE
en vert sur pierre), journal propriétaire et mission du tier
(pierre sur vert, à côté du logo), dashboard, et les sous-pages pro
(mandats · catalogue · missions · intervention) qui n'avaient même
pas le logo le gagnent en haut à droite. Vérifié en prod, page par
page. Committé, poussé.

## Le 21/11 (6ᵉ) — LE MOTEUR DE REVENUS : la brique ③ de la saison (direction : « Revenu net · Taux d'occupation · Décomposition — si la conciergerie paramètre »)

La page du propriétaire porte désormais LES REVENUS DE VOTRE BIEN :
**le revenu net estimé** (mois affiché + cumul de l'année), **le taux
d'occupation en %** (troisième chiffre de la saison, à côté des
nuitées et de l'à-venir), et **la fenêtre de décomposition** qui se
déplie : CA estimé · dépenses du bien (AUTO, catégories natives de
la compta RésaCap) · frais conciergerie (commission X % + chaque
frais fixe NOMMÉ) · TVA et taxe de séjour (informatives) · = net.
LA FORMULE (verdict direction) : **net = CA HT − dépenses − frais
conciergerie** ; période = mois affiché + cumul année.

**LE MODÈLE NÉGOCIÉ VIT SUR LE MANDAT** (migration 010 :
`commission_pct` + `frais_fixes` composites [{libellé, montant,
par séjour|par mois}] — additifs, la règle « additionner des frais
fixes et des commissions » + `revenus_visible` LA DOSE opt-in).
L'UI conciergerie : « Les revenus du propriétaire — votre
négociation » dans la carte mandat. **La marge de la conciergerie
ne transite jamais par RésaCap** : le pont livre les chiffres bruts
(nuits, CA au prorata maison, TVA/taxe des factures, dépenses du
bien), le calcul est celui de la conciergerie — le propriétaire
voit le RÉSULTAT, jamais les règles.

**BANC VERT SUR LA PROD** (compte simu, Bungalow 30 séjours) :
modèle 20 % + 50 €/mois + 30 €/séjour → la page affiche saison,
taux, revenus et décomposition ✓, purge ✓. Côté RésaCap l'action
`periode` du pont est testée : 29 nuits, CA 4 335 €, 12 séjours,
TVA 188,41 € pour l'année simu.

**LA LEÇON DU JOUR (infrastructure)** : le banc codait en dur
l'IP 145.223.124.164 (le contournement DNS du 19/11) — Hostinger a
déplacé le site sur .67 : tous les tests tombaient sur un NŒUD
PÉRIMÉ qui sert l'ancien build, pendant que le panneau disait vert
et que la vraie adresse servait la brique. LEÇON : l'IP de
contournement est périssable — résoudre à frais nouveaux, ou
laisser le DNS vivre.

Committé, poussé.

## Le 21/11 (soir) — LE POINT DU RELAIS (fin de session)

LA JOURNÉE : la saison du bien (pont RésaCap scellé HMAC, testée
verte) · le moteur de revenus (banc vert : net 88 €/754 € sur la
démo admin, décomposition complète) · le nom JOBLIVE sur chaque
en-tête · la recherche d'hébergement (l'échelle 70+) + changer
d'email (verdict direction) · la phrase de passe du pont UNIFIÉE
(geste direction : Vercel = Hostinger = .env).

⚠ DEUX FILETS À SUIVRE : ① le pipeline HOSTINGER ne redéploie pas
toujours seul (deux redeploys manuels ce jour — panneau →
déploiements → Redeploy sur le dernier commit) ; ② les env HOSTINGER
de Biendispo et Aktivit doivent porter la même phrase de passe (pont
sœurs activation/vente — à vérifier).

LA ROUTE : **le premier VRAI pilote conciergerie** (l'argument a
triplement grandi : la saison + les revenus + le compagnon voyageur
qui vient de naître chez la mère — /s/<jeton>) · photos multiples
par élément · historique des fiches · test QR · v2 : les
notifications EN TÊTE, puis relais IA, puis le pont des incidents
(la preuve voyageur → le journal propriétaire). Les mondes de démo :
le mandat TEST (fontainetelga@yahoo.fr) porte Chambre d'hôte +
modèle 20 %/50 €/30 € ; simu@resacap.dev porte 21 hébergements.

Tout est poussé, origin/main. A+.




