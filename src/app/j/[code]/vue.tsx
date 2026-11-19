'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sceau, BadgeDirect } from '@/lib/sceau';
import { labelCatégorie } from '@/lib/format';

// LA VUE CLIENT — chaleureuse, presque un album. Lecture pure : le
// client regarde, le sceau certifie, un seul bouton répond (« Tout
// va bien ») — jamais de tunnel de messagerie.

export type Photo = { id: string; genre: string; chemin: string; horodatage: string };
export type Entrée = {
  id: string; categorie: string; note: string; publie_le: string;
  durée: number | null; photos: Photo[]; réaction: string | null;
};
export type Données = { client: string; lieu: string; fin: string | null; par: string | null; entrées: Entrée[] };

function urlPhoto(chemin: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${chemin}`;
}

const HEURE = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const JOUR = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const JOUR_COURT = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

function tampon(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} — ${HEURE.format(d)}`;
}

export function Timeline({ code, données }: { code: string; données: Données }) {
  const [réactions, setRéactions] = useState<Record<string, boolean>>(
    Object.fromEntries(données.entrées.filter((e) => e.réaction).map((e) => [e.id, true])),
  );
  const [merci, setMerci] = useState(false);

  async function toutVaBien(entréeId?: string) {
    setMerci(true);
    setRéactions((r) => ({ ...r, ...(entréeId ? { [entréeId]: true } : {}) }));
    await fetch('/api/reaction', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, intervention_id: entréeId ?? null }),
    }).catch(() => {});
    setTimeout(() => setMerci(false), 2500);
  }

  // Le groupage par jour — l'album respire par chapitres.
  const jours: { jour: string; entrées: Entrée[] }[] = [];
  for (const e of données.entrées) {
    const j = JOUR.format(new Date(e.publie_le));
    const dernier = jours[jours.length - 1];
    if (dernier && dernier.jour === j) dernier.entrées.push(e);
    else jours.push({ jour: j, entrées: [e] });
  }

  return (
    <main className="min-h-screen pb-10">
      {/* L'EN-TÊTE DU MANDAT */}
      <header className="bg-vert px-5 pt-6 pb-7">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <img src="/logo-job-nuit.png" alt="JOBLIVE" className="h-7 w-auto" />
            <BadgeDirect />
          </div>
          <h1 className="mt-4 font-titre text-2xl font-bold leading-snug text-pierre">
            Le travail de chez vous,<br />vu en direct.
          </h1>
          <p className="mt-2 text-sm text-pierre/70">
            {données.lieu || données.client} · {données.entrées.length} intervention{données.entrées.length > 1 ? 's' : ''} certifiée{données.entrées.length > 1 ? 's' : ''}
            {données.par && <span className="block">par {données.par}</span>}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {jours.length === 0 && (
          <div className="carte-preuve mt-6 p-8 text-center">
            <Sceau taille={72} />
            <h2 className="mt-4 font-titre text-lg font-bold text-vert">Le journal s&apos;ouvre</h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              Aucune intervention publiée pour l&apos;instant. Dès que votre prestataire
              agira, la preuve apparaîtra ici — en photo, horodatée.
            </p>
          </div>
        )}

        {jours.map((j) => (
          <section key={j.jour} className="mt-6">
            <h2 className="horodatage text-xs font-bold uppercase tracking-[0.18em] text-graphite">{j.jour}</h2>
            {j.entrées.map((e) => {
              const avant = e.photos.filter((p) => p.genre === 'avant');
              const après = e.photos.filter((p) => p.genre === 'apres');
              return (
                <article key={e.id} className="carte-preuve mt-3 overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-4">
                    <h3 className="font-titre text-base font-bold text-vert">{labelCatégorie(e.categorie)}</h3>
                    <p className="horodatage text-xs text-graphite">
                      {HEURE.format(new Date(e.publie_le))}{e.durée ? ` · ${duréeTxt(e.durée)}` : ''}
                    </p>
                  </div>
                  {e.note && <p className="px-5 pt-1.5 text-sm leading-relaxed text-encre">{e.note}</p>}

                  {/* LES PREUVES — le sceau en filigrane, l'horodatage sur chaque prise */}
                  {(avant.length > 0 || après.length > 0) && (
                    <div className={`mt-3 grid gap-1.5 px-5 pb-4 ${avant.length > 0 && après.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {[avant[avant.length - 1], après[après.length - 1]].filter(Boolean).map((p) => (
                        <figure key={p!.id} className="relative overflow-hidden rounded-champ">
                          <a href={urlPhoto(p!.chemin)} target="_blank" rel="noopener" aria-label={`Agrandir la photo ${p!.genre === 'avant' ? 'avant' : 'après'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={urlPhoto(p!.chemin)} alt={`${p!.genre} — certifié ${tampon(p!.horodatage)}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                          </a>
                          <figcaption className="horodatage absolute bottom-1.5 left-1.5 rounded-md bg-vert-nuit/80 px-2 py-0.5 text-[10px] font-semibold text-pierre">
                            {p!.genre === 'avant' ? 'AVANT' : 'APRÈS'} · {tampon(p!.horodatage)}
                          </figcaption>
                          <span className="absolute bottom-1.5 right-1.5 opacity-90"><Sceau taille={30} /></span>
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* LA RÉACTION — douce, à sens unique */}
                  <div className="border-t border-pierre-sombre px-5 py-3">
                    {réactions[e.id] ? (
                      <p className="text-sm font-semibold text-vert">« Tout va bien » envoyé ✓</p>
                    ) : (
                      <button onClick={() => toutVaBien(e.id)} className="rounded-full bg-vert-voile px-4 py-2 text-sm font-bold text-vert transition hover:bg-vert hover:text-white">
                        Tout va bien
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ))}

        {/* LE PIED — la promesse tenue */}
        <footer className="mt-8 text-center">
          {merci && <p className="mb-4 font-titre text-base font-bold text-vert">Merci — votre prestataire est rassuré ✓</p>}
          <p className="text-xs leading-relaxed text-graphite">
            Chaque photo est scellée <span className="horodatage">HORODATÉ · CERTIFIÉ</span> à la prise.<br />
            {données.fin && `Ce journal est ouvert jusqu'au ${JOUR_COURT(données.fin)} à minuit.`}
          </p>
          <p className="mt-3 opacity-60"><Link href="/" className="underline underline-offset-2">JOBLIVE — le travail vu en direct</Link></p>
        </footer>
      </div>
    </main>
  );
}

function duréeTxt(s: number): string {
  if (!s || s < 30) return '';
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
}

// L'ENTRÉE MORTE — code révoqué, expiré ou inconnu. La mort d'un
// code est une FEATURE (précaution gravée), pas une erreur.
export function EntréeMorte() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pierre px-5">
      <div className="w-full max-w-sm text-center">
        <img src="/logo-job.png" alt="" aria-hidden="true" className="mx-auto block h-12 w-auto opacity-40" />
        <div className="carte-preuve mt-6 p-8">
          <h1 className="font-titre text-xl font-bold text-vert">Ce code ne vit plus</h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite">
            Il a peut-être expiré, été révoqué, ou le mandat est terminé.
            Les codes JOBLIVE sont mortels par nature — demandez un lien
            neuf à votre prestataire.
          </p>
          <Link href="/j" className="mt-5 inline-block rounded-full border-[1.5px] border-vert px-6 py-2.5 font-titre text-sm font-semibold text-vert transition hover:bg-vert-voile">
            Entrer un autre code
          </Link>
        </div>
      </div>
    </main>
  );
}
