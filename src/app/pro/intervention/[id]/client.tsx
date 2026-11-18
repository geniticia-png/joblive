'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller, envoyerPreuve, réduirePhoto } from '@/lib/appels';
import { labelCatégorie, tampon } from '@/lib/format';
import { Sceau, BadgeDirect } from '@/lib/sceau';

// L'INTERVENTION EN COURS — le geste du terrain : photo AVANT, photo
// APRÈS (l'horodatage naît à la prise), la note, et L'ACTE FINAL —
// le bouton vermillon Publier. Le chrono tourne si le pro l'assume
// (la dose règle le prestataire).

type Preuve = { id: string; genre: string; chemin: string; horodatage: string };
type Intervention = {
  id: string; categorie: string; note: string; statut: string;
  debut_le: string; mandats: { client_nom: string; lieu: string; chrono_visible: boolean };
  preuves: Preuve[];
};

export function urlPreuve(chemin: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/preuves/${chemin}`;
}

export function InterventionClient({ id }: { id: string }) {
  const router = useRouter();
  const [itv, setItv] = useState<Intervention | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [envoiPhoto, setEnvoiPhoto] = useState<'avant' | 'apres' | null>(null);
  const [publie, setPublie] = useState(false);
  const [enVent, setEnVent] = useState(false);
  const débutRéf = useRef<number>(0);
  const [écoulé, setÉcoulé] = useState(0);

  const charger = useCallback(async () => {
    try {
      const { intervention } = await appeller<{ intervention: Intervention }>(`/api/interventions?id=${id}`, undefined, 'GET');
      setItv(intervention);
      setNote(intervention.note ?? '');
      débutRéf.current = new Date(intervention.debut_le).getTime();
    } catch (e) {
      if (e instanceof Error && e.message === 'session') router.replace('/connexion');
      else setErreur('Intervention introuvable');
    }
  }, [id, router]);

  useEffect(() => { charger(); }, [charger]);

  // Le chrono — discret, seulement si le mandat l'accepte.
  useEffect(() => {
    if (!itv || !itv.mandats.chrono_visible || itv.statut !== 'en_cours') return;
    const t = setInterval(() => setÉcoulé(Math.floor((Date.now() - débutRéf.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [itv]);

  async function prendrePhoto(genre: 'avant' | 'apres', fichier: File) {
    if (!itv) return;
    setEnvoiPhoto(genre);
    try {
      const { blob, horodatage } = await réduirePhoto(fichier);
      await envoyerPreuve(itv.id, genre, blob, horodatage);
      await charger();
    } catch {
      setErreur('La photo n\'a pas pu partir — vérifiez le réseau (le hors-ligne garde le geste, republiez après).');
    } finally {
      setEnvoiPhoto(null);
    }
  }

  async function publier() {
    if (!itv) return;
    setEnVent(true);
    try {
      await appeller('/api/interventions', {
        action: 'publier', id: itv.id,
        note, duree_secondes: itv.mandats.chrono_visible ? Math.max(0, Math.round((Date.now() - débutRéf.current) / 1000)) : null,
      });
      setPublie(true); // le sceau anime, puis la maison du journal
      setTimeout(() => router.push('/pro'), 1600);
    } catch {
      setErreur('La publication a échoué — le geste est gardé, réessayez.');
      setEnVent(false);
    }
  }

  async function annuler() {
    if (!itv || !confirm('Abandonner cette intervention ? Les photos déjà prises disparaissent.')) return;
    await appeller('/api/interventions', { action: 'annuler', id: itv.id }).catch(() => {});
    router.push('/pro');
  }

  const avant = itv?.preuves.filter((p) => p.genre === 'avant') ?? [];
  const après = itv?.preuves.filter((p) => p.genre === 'apres') ?? [];

  if (publie) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-vert px-5 text-center">
        <Sceau taille={120} animé sombre />
        <h1 className="mt-6 font-titre text-2xl font-bold text-pierre">Publié dans le journal</h1>
        <p className="mt-2 text-sm text-pierre/70">La preuve voyage — votre client la voit, live.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      {/* LE BANDEAU TERRAIN — vert nuit, le badge DIRECT vit ici */}
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <Link href="/pro" className="text-xs font-semibold text-pierre/60">← Journal</Link>
            <BadgeDirect texte="EN COURS" />
          </div>
          <h1 className="mt-3 font-titre text-xl font-bold text-pierre">
            {itv ? `${labelCatégorie(itv.categorie)} · ${itv.mandats.client_nom}` : '…'}
          </h1>
          {itv?.mandats.lieu && <p className="text-sm text-pierre/60">{itv.mandats.lieu}</p>}
          {écoulé > 0 && (
            <p className="horodatage mt-1 text-xs text-pierre/50">
              chrono {String(Math.floor(écoulé / 60)).padStart(2, '0')}:{String(écoulé % 60).padStart(2, '0')}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {erreur && <p className="mt-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}
        {!itv && !erreur && <p className="mt-8 text-center text-sm text-graphite">Chargement du geste…</p>}

        {itv && (
          <>
            {/* AVANT / APRÈS — les deux volets de la preuve */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(['avant', 'apres'] as const).map((genre) => {
                const liste = genre === 'avant' ? avant : après;
                return (
                  <div key={genre} className="carte-preuve overflow-hidden">
                    <label className="block">
                      <input
                        type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) prendrePhoto(genre, f); e.currentTarget.value = ''; }}
                      />
                      <div className="aspect-[3/4] w-full cursor-pointer bg-vert-voile transition hover:bg-vermillon-voile">
                        {liste.length > 0 ? (
                          <div className="relative h-full w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={urlPreuve(liste[liste.length - 1].chemin)} alt={`${genre} — ${tampon(liste[liste.length - 1].horodatage)}`} className="h-full w-full object-cover" />
                            <span className="horodatage absolute bottom-2 left-2 rounded-md bg-vert-nuit/80 px-2 py-1 text-[10px] font-semibold text-pierre">
                              {genre.toUpperCase()} · {tampon(liste[liste.length - 1].horodatage)}
                            </span>
                            <span className="absolute right-2 top-2"><Sceau taille={34} /></span>
                          </div>
                        ) : (
                          <div className={`flex h-full w-full flex-col items-center justify-center gap-2 text-vert ${envoiPhoto === genre ? 'opacity-50' : ''}`}>
                            {envoiPhoto === genre ? (
                              <span className="horodatage text-xs font-semibold">scellement…</span>
                            ) : (
                              <>
                                <span className="font-titre text-base font-bold">{genre === 'avant' ? 'AVANT' : 'APRÈS'}</span>
                                <span className="px-4 text-center text-[11px] leading-tight opacity-70">toucher pour photographier</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                    {liste.length > 1 && (
                      <p className="horodatage px-3 py-2 text-[10px] text-graphite">{liste.length} prises — la dernière s&apos;affiche</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LA NOTE — courte, chaude, lisible par le client */}
            <label className="mt-5 block text-sm font-bold text-vert" htmlFor="note">Le mot du terrain</label>
            <textarea
              id="note"
              rows={3} maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Oscar a couru 20 minutes, très joueur. Rosiers taillés côté sud."
              className="mt-1.5 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3.5 text-base outline-none transition focus:border-vert focus:ring-[3px] focus:ring-vert/10"
            />

            {/* L'ACTE FINAL — le seul bouton vermillon de la maison */}
            <button
              onClick={publier}
              disabled={enVent}
              className="mt-6 w-full rounded-full bg-vermillon py-4 font-titre text-lg font-bold text-white shadow-haute transition hover:opacity-92 disabled:opacity-50"
            >
              {enVent ? 'Publication…' : 'Publier dans le journal du client'}
            </button>

            <button onClick={annuler} className="mt-3 w-full py-2 text-sm font-semibold text-graphite transition hover:text-vermillon">
              Abandonner le geste
            </button>
          </>
        )}
      </div>
    </main>
  );
}
