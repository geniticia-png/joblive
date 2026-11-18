# JOBLIVE — Le travail vu en direct

La preuve de travail en direct : le prestataire montre, en photos
horodatées, que le travail est fait — pendant qu'il le fait.
Conciergerie, garde d'animaux, jardin, piscine, aide à domicile.

- **Prestataire** : `/connexion` (magic link) → `/pro`
- **Client** : `/j/<code>` — lecture pure, sans compte
- Dev : `npm run dev` (port **3023**)

## La mise en route (les gestes direction)

1. **Supabase** — créer le projet dédié `joblive` (supabase.com),
   puis dans l'éditeur SQL appliquer `sql/001_fondation.sql`
   (tables + RLS + bucket `preuves`).
2. **Les trois variables** (Paramètres → API) — dans `.env.local`
   pour le dev, et dans hPanel (ou Vercel) pour la prod :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # serveur seul, jamais commit
   ```
   Dans l'auth Supabase : ajouter l'URL du site (Site URL +
   Redirect URLs) pour le magic link.
3. **Hostinger** — créer l'application Node.js (Node 22, commande
   `npm run build` puis `npm run start`, répertoire `/`), pousser
   ce repo, lier le domaine **joblive.app** (et joblive.fr en
   redirection).

La doctrine complète vit dans `AGENTS.md` (journal de la maison)
et chez la mère : `Resacap/app/docs/JOBLIVE.md`.
