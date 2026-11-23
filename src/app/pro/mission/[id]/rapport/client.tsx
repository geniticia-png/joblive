'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';

// ═══════════════════════════════════════════════════════════════════
// LE RAPPORT, LA FEUILLE BLANCHE — tout ce que le tiers a vécu, dans
// l'ordre : chaque geste coché (ou pas), son mot, ses photos
// horodatées. L'écran sert à relire ; l'imprimante fait le reste
// (Ctrl+P → PDF). Le sceau JOBLIVE en pied : la preuve est datée,
// le document ne se réécrit pas.
// ═══════════════════════════════════════════════════════════════════

type Élément = { id: string; libelle: string; genre: string; fait: boolean; commentaire: string | null; ordre: number };
type Preuve = { id: string; chemin: string; horodatage: string; element_id: string | null };
type Rapport = {
  id: string; titre: string; statut: string; prevue_le: string | null;
  fermee_le: string | null; accepte_le: string | null; vue_le: string | null;
  prix: string | null; conditions: string | null;
  tiers: { nom: string; role: string; telephone: string | null } | null;
  mandats: { client_nom: string; lieu: string } | null;
  mission_elements: Élément[];
  mission_preuves: Preuve[];
  pros: { enseigne: string; nom: string } | null;
};

const URL_PHOTO = (chemin: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${chemin}`;

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const HEURE = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const le = (iso: string | null) => iso ? `${DATE.format(new Date(iso))} à ${HEURE.format(new Date(iso))}` : '—';
const STATUTS: Record<string, string> = { a_faire: 'à faire', en_cours: 'en cours', faite: 'faite', annulee: 'annulée' };

export default function RapportClient({ id }: { id: string }) {
  const router = useRouter();
  const [mission, setMission] = useState<Rapport | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const r = await appeller<{ mission: Rapport | null }>(`/api/missions?id=${encodeURIComponent(id)}`, undefined, 'GET');
      if (!r.mission) { setErreur('Mission introuvable.'); return; }
      setMission(r.mission);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Le rapport ne charge pas — réessayez.');
    }
  }, [id, router]);
  useEffect(() => { charger(); }, [charger]);

  if (erreur) {
    return <main className="min-h-screen bg-pierre px-5 py-16"><p className="mx-auto max-w-xl text-center text-sm text-graphite">{erreur}</p></main>;
  }
  if (!mission) {
    return <main className="min-h-screen bg-pierre px-5 py-16"><p className="mx-auto max-w-xl text-center text-sm text-graphite">Chargement du rapport…</p></main>;
  }

  const émetteur = mission.pros?.enseigne || mission.pros?.nom || '—';
  const générales = [...mission.mission_elements].filter((e) => e.genre === 'generale').sort((a, b) => a.ordre - b.ordre);
  const particulières = [...mission.mission_elements].filter((e) => e.genre === 'particuliere').sort((a, b) => a.ordre - b.ordre);
  const libres = mission.mission_preuves.filter((p) => !p.element_id);
  const faits = mission.mission_elements.filter((e) => e.fait).length;
  const générée = new Date();

  return (
    <main className="min-h-screen bg-pierre pb-16 print:bg-white print:pb-0">
      {/* Le bouton de l'écran — l'impression ne l'emporte pas. */}
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 pt-5 print:hidden">
        <a href="/pro/missions" className="text-xs font-semibold text-vert">← Les missions</a>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-vert px-5 py-2.5 text-xs font-bold text-white shadow-haute transition hover:opacity-92"
        >
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <article className="mx-auto mt-5 max-w-3xl bg-white px-10 py-10 text-encre print:mt-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* L'EN-TÊTE — l'émetteur, la mission, l'identifiant. */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-encre pb-4">
          <div>
            <p className="font-titre text-[11px] font-bold tracking-[0.3em] text-vert">JOBLIVE — RAPPORT DE MISSION</p>
            <h1 className="mt-2 font-titre text-2xl font-bold leading-tight text-encre">{mission.titre}</h1>
            <p className="mt-1 text-sm text-graphite">
              {mission.mandats?.client_nom}{mission.mandats?.lieu ? ` — ${mission.mandats.lieu}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right text-[11px] leading-relaxed text-graphite">
            <p className="font-bold text-encre">{émetteur}</p>
            <p>Édité le {DATE.format(générée)}</p>
            <p className="horodatage">{mission.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </header>

        {/* LES FAITS — qui, quand, où en est la mission. */}
        <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-[12.5px] print:grid-cols-2">
          <p><span className="font-bold text-vert">Intervenant :</span> {mission.tiers?.nom ?? '—'}{mission.tiers?.role ? ` (${mission.tiers.role})` : ''}</p>
          <p><span className="font-bold text-vert">Client / lieu :</span> {mission.mandats?.client_nom ?? '—'}{mission.mandats?.lieu ? ` — ${mission.mandats.lieu}` : ''}</p>
          <p><span className="font-bold text-vert">Prévue le :</span> {mission.prevue_le ? DATE.format(new Date(mission.prevue_le)) : '—'}</p>
          <p><span className="font-bold text-vert">Avancement :</span> {faits}/{mission.mission_elements.length} gestes faits — mission {STATUTS[mission.statut] ?? mission.statut}</p>
          <p><span className="font-bold text-vert">Acceptée :</span> {le(mission.accepte_le)}</p>
          <p><span className="font-bold text-vert">Terminée :</span> {le(mission.fermee_le)}</p>
        </section>

        {mission.conditions && (
          <section className="mt-5">
            <p className="font-titre text-[11px] font-bold uppercase tracking-[0.2em] text-vert">L&apos;ordre de mission</p>
            <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-encre">{mission.conditions}</p>
            {mission.prix && <p className="mt-1.5 text-[12.5px] font-bold text-encre">Rémunération convenue : {mission.prix}</p>}
          </section>
        )}

        {/* LE DÉROULÉ — chaque geste, coché ou pas, son mot, ses photos. */}
        {([['Le déroulé du travail', générales], ['Les consignes du lieu', particulières]] as const).map(([titre, liste]) =>
          liste.length > 0 ? (
            <section key={titre} className="mt-7">
              <p className="font-titre text-[11px] font-bold uppercase tracking-[0.2em] text-vert">{titre}</p>
              <div className="mt-3 space-y-4">
                {liste.map((e) => {
                  const photos = mission.mission_preuves.filter((p) => p.element_id === e.id);
                  return (
                    <div key={e.id} className="border-b border-encre/10 pb-3.5 print:break-inside-avoid">
                      <div className="flex items-baseline gap-2.5">
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${e.fait ? 'border-vert bg-vert text-white' : 'border-encre/30 text-encre/40'}`}>
                          {e.fait ? '✓' : '·'}
                        </span>
                        <p className={`text-[13.5px] font-semibold ${e.fait ? 'text-encre' : 'text-encre/50'}`}>{e.libelle}</p>
                        <span className="horodatage ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-graphite">
                          {e.fait ? 'fait' : 'non fait'}
                        </span>
                      </div>
                      {e.commentaire && (
                        <p className="mt-1.5 pl-8 text-[12px] italic leading-relaxed text-graphite">« {e.commentaire} » — {mission.tiers?.nom ?? 'l&apos;intervenant'}</p>
                      )}
                      {photos.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-4 gap-2 pl-8 print:grid-cols-4">
                          {photos.map((p) => (
                            <figure key={p.id} className="print:break-inside-avoid">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={URL_PHOTO(p.chemin)} alt="" className="aspect-[4/3] w-full rounded-champ object-cover print:rounded-none" />
                              <figcaption className="horodatage mt-0.5 text-[9px] font-semibold text-graphite">
                                {DATE.format(new Date(p.horodatage))} · {HEURE.format(new Date(p.horodatage))}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
        )}

        {/* LES PHOTOS LIBRES — celles d'aucun geste en particulier. */}
        {libres.length > 0 && (
          <section className="mt-7 print:break-inside-avoid">
            <p className="font-titre text-[11px] font-bold uppercase tracking-[0.2em] text-vert">Photos de la mission ({libres.length})</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {libres.map((p) => (
                <figure key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL_PHOTO(p.chemin)} alt="" className="aspect-[4/3] w-full rounded-champ object-cover print:rounded-none" />
                  <figcaption className="horodatage mt-0.5 text-[9px] font-semibold text-graphite">
                    {DATE.format(new Date(p.horodatage))} · {HEURE.format(new Date(p.horodatage))}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* LE PIED — la chronologie certifiée + LE SCEAU. */}
        <footer className="mt-9 flex items-end justify-between gap-6 border-t-2 border-encre pt-4 print:break-inside-avoid">
          <div className="text-[10.5px] leading-relaxed text-graphite">
            <p>Mission acceptée le {le(mission.accepte_le)}</p>
            <p>Mission close le {le(mission.fermee_le)}</p>
            <p>Rapport édité le {le(générée.toISOString())}</p>
            <p className="mt-1.5 max-w-md text-encre/70">
              Chaque photo porte l&apos;horodatage de sa prise ; chaque geste, le mot de son intervenant.
              Ce document est le journal du travail tel qu&apos;il s&apos;est déroulé.
            </p>
          </div>
          {/* LE SCEAU — la marque de la preuve, tournée comme un tampon. */}
          <div className="shrink-0 -rotate-6 rounded-xl border-[2.5px] border-vert px-4 py-2.5 text-center print:rotate-[-4deg]">
            <p className="font-titre text-[13px] font-bold tracking-[0.22em] text-vert">JOBLIVE</p>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-vert">Preuve horodatée</p>
            <p className="horodatage mt-0.5 text-[8.5px] text-graphite">Mission {mission.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </footer>
      </article>
    </main>
  );
}
