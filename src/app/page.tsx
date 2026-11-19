import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════
// LA LANDING — le principe en une page, le ton des deux mondes :
// la chaleur de l'artisan (« la promenade d'Oscar ») et la rigueur
// de l'outil (l'horodatage mono). Le monogramme vit en typographie
// pure — le logo EST le mot.
// ═══════════════════════════════════════════════════════════════════
export default function Accueil() {
  return (
    <main className="min-h-screen">
      {/* L'EN-TÊTE — vert nuit, le monogramme pierre */}
      <header className="bg-vert-nuit px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="inline-flex items-center gap-2.5">
            <img src="/logo-job-nuit.png" alt="JOBLIVE" className="h-8 w-auto" />
            <span className="align-middle font-titre text-sm font-semibold tracking-[0.18em] text-pierre opacity-80">JOBLIVE</span>
          </span>
          <Link href="/connexion" className="rounded-full border border-pierre/40 px-4 py-1.5 text-sm font-semibold text-pierre transition hover:bg-pierre/10">
            Espace prestataire
          </Link>
        </div>
      </header>

      {/* LA SCÈNE FONDATRICE — la promesse en clair */}
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-10 text-center">
        <p className="horodatage mb-5 text-xs font-semibold tracking-[0.25em] text-vermillon">LE TRAVAIL VU EN DIRECT</p>
        <h1 className="font-titre text-4xl font-extrabold leading-tight text-vert sm:text-5xl">
          Vous partez.<br />
          Le travail, lui, <span className="whitespace-nowrap">reste visible.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-graphite">
          Le chien a-t-il été promené&nbsp;? La piscine tournée&nbsp;? Les rosiers taillés&nbsp;?
          La réponse est déjà là — <strong className="font-semibold text-vert">en photo, horodatée</strong>,
          sans que personne ait pris le temps de vous l'écrire.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/connexion" className="w-full rounded-full bg-vert px-8 py-3.5 font-titre text-base font-semibold text-white shadow-carte transition hover:opacity-92 sm:w-auto">
            Je suis prestataire
          </Link>
          <Link href="/j" className="w-full rounded-full border-[1.5px] border-vert px-8 py-3.5 font-titre text-base font-semibold text-vert transition hover:bg-vert-voile sm:w-auto">
            J&apos;ai un code d&apos;accès
          </Link>
        </div>
      </section>

      {/* LES TROIS FAITS — la mécanique, sobre */}
      <section className="mx-auto grid max-w-4xl gap-4 px-5 pb-14 sm:grid-cols-3">
        {[
          { n: '01', t: 'Le geste horodaté', d: "Chaque intervention naît au terrain : photo avant, photo après, l'heure à la seconde." },
          { n: '02', t: 'Le journal vivant', d: "Le client ouvre sa timeline : les preuves s'y ajoutent en direct, scellées HORODATÉ · CERTIFIÉ." },
          { n: '03', t: 'Le regard apaisé', d: "Sans compte, par un simple code temporaire — il regarde, il ne demande plus. « Tout va bien. »" },
        ].map((f) => (
          <div key={f.n} className="carte-preuve p-6 text-left">
            <p className="horodatage text-xs font-semibold text-vermillon">{f.n}</p>
            <h2 className="mt-2 font-titre text-lg font-bold text-vert">{f.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">{f.d}</p>
          </div>
        ))}
      </section>

      {/* LA LIGNE DE FOND — pourquoi c'est différent */}
      <section className="bg-vert px-5 py-14 text-pierre">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-titre text-2xl font-bold leading-snug sm:text-3xl">
            « JOBLIVE ne raconte pas que le travail a été fait.<br />
            Il montre que quelqu&apos;est en train de le faire. »
          </p>
          <p className="mt-6 text-sm leading-relaxed text-pierre/80">
            Pas un reporting mensuel, pas une IA qui promet. Des faits. La transparence
            est l&apos;armure des deux côtés : le propriétaire est rassuré, le prestataire
            est protégé — chaque preuve le défend, le jour où il faudra.
          </p>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-xs text-graphite">
        <p>JOBLIVE — Le travail vu en direct · joblive.app</p>
        <p className="mt-1 opacity-70">La preuve horodatée, sans caméra de surveillance : le soin, pas le contrôle.</p>
      </footer>
    </main>
  );
}
