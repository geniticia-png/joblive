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




