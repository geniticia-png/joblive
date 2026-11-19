import Link from 'next/link';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════════════════
// LA PAGE CONCIERGE (19/11) — la landing parle au propriétaire ;
// CELLE-CI parle à celle qui fait le travail. Son gain à elle :
// le mandat gagné, l'armure en litige, le téléphone qui se tait.
// Elle se partage telle quelle : un lien envoyé à une conciergerie.
// ═══════════════════════════════════════════════════════════════════
export const metadata = {
  title: 'JOBLIVE pour les conciergeries',
  description:
    'Le propriétaire qui voit votre travail en direct ne change pas de conciergerie. Photos horodatées, journal vivant, zéro compte pour lui — et vous, vous gagnez le mandat.',
};

export default function PageConciergerie() {
  return (
    <main className="min-h-screen">
      {/* L'EN-TÊTE */}
      <header className="bg-vert-nuit px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Image src="/logo-job-nuit.png" alt="JOBLIVE" width={63} height={28} className="h-8 w-auto" priority />
          <Link href="/" className="rounded-full border border-pierre/40 px-4 py-1.5 text-sm font-semibold text-pierre transition hover:bg-pierre/10">
            Accueil
          </Link>
        </div>
      </header>

      {/* LA PROMESSE — son intérêt à elle, en une phrase */}
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-8 text-center">
        <p className="horodatage mb-5 text-xs font-semibold tracking-[0.25em] text-vermillon">POUR LES CONCIERGERIES</p>
        <h1 className="font-titre text-4xl font-extrabold leading-tight text-vert sm:text-5xl">
          Le propriétaire compare.<br />
          <span className="whitespace-nowrap">Celui qui montre</span> l&apos;emporte.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-graphite">
          Deux devis, deux maisons. L&apos;une promet « nous vous tiendrons informés ».
          L&apos;autre dit : <strong className="font-semibold text-vert">« regardez-le vous-même, en direct »</strong> —
          et le propriétaire tient son journal dans la main.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/connexion" className="w-full rounded-full bg-vert px-8 py-3.5 font-titre text-base font-semibold text-white shadow-carte transition hover:opacity-92 sm:w-auto">
            Ouvrir ma maison — 2 minutes
          </Link>
          <a href="#journal" className="w-full rounded-full border-[1.5px] border-vert px-8 py-3.5 font-titre text-base font-semibold text-vert transition hover:bg-vert-voile sm:w-auto">
            Voir un journal vrai
          </a>
        </div>
      </section>

      {/* LE JOURNAL D'EXEMPLE — la pièce concrète : ce que reçoit le propriétaire */}
      <section id="journal" className="mx-auto max-w-md px-5 pb-14">
        <p className="horodatage mb-3 text-center text-[10px] font-semibold tracking-[0.22em] text-graphite">
          CE QUE LE PROPRIÉTAIRE OUVRE SUR SON TÉLÉPHONE, SANS COMPTE
        </p>
        <div className="overflow-hidden rounded-conteneur border border-pierre-sombre bg-white shadow-haute">
          {/* l'en-tête du journal client */}
          <div className="bg-vert px-5 pt-5 pb-6">
            <div className="flex items-center justify-between">
              <Image src="/logo-job-nuit.png" alt="" width={50} height={22} className="h-6 w-auto" />
              <span className="rounded-full bg-vermillon px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">● EN DIRECT</span>
            </div>
            <p className="mt-4 font-titre text-xl font-bold leading-snug text-pierre">
              Votre bien, vu en direct,<br />séjour après séjour.
            </p>
            <p className="mt-1.5 text-xs text-pierre/70">Studio Les Pins · Sainte-Maxime · 2 interventions certifiées</p>
          </div>
          {/* l'entrée du jour */}
          <div className="px-5 py-5">
            <p className="horodatage text-[10px] font-semibold tracking-[0.2em] text-graphite">AUJOURD&apos;HUI</p>
            <div className="mt-3 rounded-carte bg-pierre p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-titre text-sm font-bold text-vert">Ménage de sortie</p>
                <p className="horodatage text-xs text-graphite">14:32</p>
              </div>
              {/* les deux preuves */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <figure>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-champ">
                    <Image src="/demo-avant.jpg" alt="" fill sizes="200px" className="object-cover opacity-90" />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40 grayscale">🛏</span>
                  </div>
                  <figcaption className="horodatage mt-1 text-center text-[10px] font-semibold text-graphite">AVANT · 14:29</figcaption>
                </figure>
                <figure>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-champ">
                    <Image src="/demo-apres.jpg" alt="" fill sizes="200px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-80">🛏</span>
                  </div>
                  <figcaption className="horodatage mt-1 text-center text-[10px] font-semibold text-vermillon">APRÈS · 14:51</figcaption>
                </figure>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-graphite">
                Voyageurs partis à 10h, remise impeccable pour l&apos;arrivée de 17h : linge changé,
                sols, sanitaires, terrasse. Prêts pour les prochains séjours.
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-pierre-sombre pt-3">
                <p className="horodatage text-[10px] font-semibold tracking-wide text-vert">HORODATÉ · CERTIFIÉ</p>
                <p className="horodatage text-[10px] text-graphite">vu à 14:58</p>
              </div>
            </div>
            {/* la réaction du propriétaire */}
            <div className="mt-2 rounded-carte bg-vert-voile px-4 py-2.5 text-center">
              <p className="text-xs font-semibold text-vert">« Tout va bien » — reçu 15:07 ✓</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs leading-relaxed text-graphite">
          Vous publiez depuis votre téléphone, en un geste. Lui regarde quand il veut.<br />
          Il n&apos;y a pas de messagerie — le journal apaise, il ne discute pas.
        </p>
      </section>

      {/* SES TROIS GAINS — concrets, chiffrés quand ça se chiffre */}
      <section className="mx-auto grid max-w-3xl gap-4 px-5 pb-14 sm:grid-cols-3">
        {[
          {
            n: '①', t: 'Le mandat gagné',
            d: "Le propriétaire EXIGE de voir. Bientôt il demandera « vous avez JOBLIVE ? » — celui qui l'a signe, l'autre explique.",
          },
          {
            n: '②', t: "L'armure en litige",
            d: "Photo scellée, heure certifiée à la seconde de la prise. Le jour où quelqu'un conteste, votre journal parle pour vous.",
          },
          {
            n: '③', t: 'Le téléphone qui se tait',
            d: "Chaque photo publiée est une conversation qui n'a pas eu lieu. « C'est bien passé ? » — la réponse est déjà là.",
          },
        ].map((g) => (
          <div key={g.n} className="carte-preuve p-6 text-left">
            <p className="font-titre text-2xl font-bold text-vermillon">{g.n}</p>
            <h2 className="mt-2 font-titre text-lg font-bold text-vert">{g.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">{g.d}</p>
          </div>
        ))}
      </section>

      {/* LA MÉCANIQUE — 3 gestes, les vrais de l'app */}
      <section className="bg-vert px-5 py-14 text-pierre">
        <div className="mx-auto max-w-2xl">
          <p className="horodatage text-center text-xs font-semibold tracking-[0.25em] text-pierre/70">VOTRE CÔTÉ DU JOURNAL — TROIS GESTES</p>
          <div className="mt-6 space-y-4">
            {[
              ['Ouvrez le mandat', 'Le client, le lieu, la date de fin — 2 minutes. Son code d’accès naît avec.', '2 MIN'],
              ['Envoyez le code', 'Un SMS pré-rempli, depuis l’écran du mandat. Le propriétaire ouvre, sans créer de compte.', '10 SEC'],
              ['Photographiez le geste', 'Avant / après — l’heure se scelle à la prise, pas à l’envoi. Publier : un bouton vermillon.', 'SUR PLACE'],
            ].map(([t, d, e]) => (
              <div key={t} className="flex items-start gap-4 rounded-carte bg-pierre/10 p-4">
                <span className="horodatage mt-0.5 shrink-0 rounded-full bg-pierre px-2.5 py-1 text-[10px] font-bold text-vert">{e}</span>
                <span>
                  <span className="block font-titre text-base font-bold text-pierre">{t}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-pierre/80">{d}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-pierre/70">
            Ménage de sortie ou de séjour, accueil des voyageurs, linge, piscine, jardin — vos catégories, telles quelles.
          </p>
        </div>
      </section>

      {/* LA DOSE — la précaution qui rassure le métier */}
      <section className="mx-auto max-w-2xl px-5 py-14 text-center">
        <p className="horodatage mb-4 text-xs font-semibold tracking-[0.25em] text-vermillon">LA DOSE — VOUS DÉCIDEZ</p>
        <h2 className="font-titre text-2xl font-bold leading-snug text-vert sm:text-3xl">
          La transparence est votre outil,<br />pas votre procureur.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-graphite">
          Mandat par mandat, vous réglez ce que le client voit : toutes les catégories,
          ou seulement les grandes lignes. Le chrono se montre ou se tait.
          Et le code d&apos;accès est <strong className="font-semibold text-vert">mortel par nature</strong> —
          révocable en un clic, mort à la fin du mandat.
        </p>
      </section>

      {/* LE CTA FINAL */}
      <section className="mx-auto max-w-md px-5 pb-16 text-center">
        <div className="carte-preuve p-8">
          <h2 className="font-titre text-2xl font-bold text-vert">Votre première preuve en 15 minutes.</h2>
          <p className="mt-3 text-sm leading-relaxed text-graphite">
            Gratuit pendant le pilote. Un email, un lien, aucun mot de passe —
            et le prochain propriétaire qui compare verra votre travail, pas vos promesses.
          </p>
          <Link href="/connexion" className="mt-6 block rounded-full bg-vermillon py-4 font-titre text-base font-semibold text-white shadow-haute transition hover:opacity-92">
            Commencer maintenant
          </Link>
          <p className="horodatage mt-4 text-[10px] tracking-wide text-graphite">JOBLIVE — LE TRAVAIL VU EN DIRECT · JOBLIVE.APP · LA FAMILLE BIENDISPO</p>
        </div>
      </section>

      <footer className="px-5 pb-8 text-center text-xs text-graphite">
        <Link href="/" className="font-semibold text-vert underline underline-offset-2">
          ← Vous êtes propriétaire ? La page d&apos;accueil vous parle
        </Link>
      </footer>
    </main>
  );
}
