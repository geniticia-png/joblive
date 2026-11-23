'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { labelCatégorie, heure } from '@/lib/format';
import { NavPro } from '@/lib/nav-pro';

// ═══════════════════════════════════════════════════════════════════
// LE DOSSIER, côté vivant — le menu horizontal MISSION · INTERVENANT
// · AGENDA · CHIFFRES. L'UNITÉ MISSION : chaque entrée du fil porte
// SON INTERVENANT (« par vous » / « par Marie ») — l'unification à
// l'affichage, le modèle ne bouge pas. OUVRIR = LU (le fil marque
// les réactions et missions closes vues — le badge s'éteint).
// ═══════════════════════════════════════════════════════════════════

const URL_PHOTO = (chemin: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${chemin}`;

type Preuve = { id: string; genre: string; chemin: string; horodatage: string };
type Réaction = { id: string; genre: string; cree_le: string };
type Intervention = {
  id: string; categorie: string; note: string; statut: string;
  debut_le: string; publie_le: string | null; duree_secondes: number | null;
  preuves: Preuve[]; reactions: Réaction[];
};
type Mission = {
  id: string; titre: string; statut: string; prevue_le: string | null; fermee_le: string | null;
  accepte_le: string | null; vue_le: string | null; jeton: string | null;
  tiers: { nom: string; telephone: string | null } | null;
  mission_elements: { id: string; libelle: string; fait: boolean; joblivise: boolean }[];
  mission_preuves: { id: string; chemin: string; horodatage: string; element_id: string | null }[];
};
type Intervenant = { nom: string; rôle: string; téléphone: string | null; missions: number; dernière: string | null; jeton: string | null };
type Dossier = {
  mandat: {
    id: string; client_nom: string; lieu: string; statut: string;
    debut: string | null; fin: string | null;
    unit_resacap: { id: string; nom: string } | null;
    codes: { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null }[];
  };
  interventions: Intervention[];
  missions: Mission[];
  intervenants: Intervenant[];
  chiffres: {
    gestes_directs: number; missions_déléguées: number; photos: number;
    réactions: number; durée_directe_s: number;
    portail?: { net_mois: number; net_année: number; saison: { sejours: number } | null } | null;
  };
};

const ONGLETS = [
  { cle: 'mission', label: 'MISSION' },
  { cle: 'intervenant', label: 'INTERVENANT' },
  { cle: 'agenda', label: 'AGENDA' },
  { cle: 'chiffres', label: 'CHIFFRES' },
] as const;
type Onglet = typeof ONGLETS[number]['cle'];

/** La date longue du groupe (« lundi 18 novembre »). */
const JOUR = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dateCourte = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';

export default function DossierClient({ id }: { id: string }) {
  const router = useRouter();
  const [d, setD] = useState<Dossier | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('mission');

  const charger = useCallback(async () => {
    try {
      const r = await appeller<Dossier>(`/api/pro/fil?id=${encodeURIComponent(id)}`, undefined, 'GET');
      setD(r);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Le dossier ne charge pas — réessayez.');
    }
  }, [id, router]);
  useEffect(() => { charger(); }, [charger]);

  // ── LE FIL UNIFIÉ : les événements du dossier, du plus récent au
  // plus ancien, groupés par jour. L'INTERVENTION est une mission
  // dont l'intervenant est le pro (« par vous »).
  const groupes = useMemo(() => {
    if (!d) return [] as { jour: string; entrées: { le: string; nœud: JSX.Element }[] }[];
    type Entrée = { le: string; nœud: JSX.Element };
    const entrées: Entrée[] = [];
    for (const i of d.interventions) {
      const le = i.publie_le ?? i.debut_le;
      const photos = i.preuves ?? [];
      const avant = photos.find((p) => p.genre === 'avant');
      const après = photos.find((p) => p.genre === 'apres');
      entrées.push({
        le,
        nœud: (
          <div key={i.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-champ bg-vert-voile px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-titre text-sm font-bold text-vert">{labelCatégorie(i.categorie)} <span className="font-normal text-graphite">— par vous</span></p>
                <p className="horodatage shrink-0 text-[10px] text-graphite">
                  {i.statut === 'en_cours' ? 'en cours' : heure(le)}
                </p>
              </div>
              {i.note && <p className="mt-1 text-sm text-encre">{i.note}</p>}
              {(avant || après) && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {avant && (
                    <a href={URL_PHOTO(avant.chemin)} target="_blank" rel="noopener">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL_PHOTO(avant.chemin)} alt="avant" className="aspect-[4/3] w-full rounded-md object-cover" />
                      <span className="horodatage mt-0.5 block text-[9px] font-semibold text-graphite">AVANT</span>
                    </a>
                  )}
                  {après && (
                    <a href={URL_PHOTO(après.chemin)} target="_blank" rel="noopener">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL_PHOTO(après.chemin)} alt="après" className="aspect-[4/3] w-full rounded-md object-cover" />
                      <span className="horodatage mt-0.5 block text-[9px] font-semibold text-graphite">APRÈS</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      });
      // La réaction du client : le message ENTRANT, à gauche.
      for (const r of i.reactions ?? []) {
        entrées.push({
          le: r.cree_le,
          nœud: (
            <div key={'r' + r.id} className="flex justify-start">
              <div className="max-w-[85%] rounded-champ bg-white px-4 py-3 shadow-carte">
                <p className="font-titre text-sm font-bold text-vert">« Tout va bien »</p>
                <p className="horodatage mt-0.5 text-[10px] text-graphite">le client · {heure(r.cree_le)}</p>
              </div>
            </div>
          ),
        });
      }
    }
    for (const m of d.missions) {
      const le = m.fermee_le ?? m.prevue_le ?? '';
      const faits = (m.mission_elements ?? []).filter((e) => e.fait).length;
      entrées.push({
        le,
        nœud: (
          <div key={'m' + m.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-champ bg-vert-voile px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-titre text-sm font-bold text-vert">{m.titre || 'Mission'} <span className="font-normal text-graphite">— par {m.tiers?.nom ?? 'un tiers'}</span></p>
                <p className="horodatage shrink-0 text-[10px] text-graphite">
                  {m.statut === 'faite' ? heure(m.fermee_le ?? le) : m.statut === 'en_cours' ? 'en cours' : m.prevue_le ? `prévue le ${dateCourte(m.prevue_le)}` : 'à faire'}
                </p>
              </div>
              <p className="horodatage mt-0.5 text-[10px] text-graphite">{faits}/{m.mission_elements?.length ?? 0} gestes · {m.mission_preuves?.length ?? 0} photo{(m.mission_preuves?.length ?? 0) > 1 ? 's' : ''}</p>
              {(m.mission_preuves ?? []).length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {m.mission_preuves.slice(0, 8).map((p) => (
                    <a key={p.id} href={URL_PHOTO(p.chemin)} target="_blank" rel="noopener">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL_PHOTO(p.chemin)} alt="" className="aspect-square w-full rounded-md object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <Link href={`/pro/missions?m=${m.id}`} className="mt-1.5 inline-block text-xs font-semibold text-vert">ouvrir la mission →</Link>
            </div>
          </div>
        ),
      });
    }
    entrées.sort((a, b) => b.le.localeCompare(a.le));
    const groupes: { jour: string; entrées: Entrée[] }[] = [];
    for (const e of entrées) {
      const jour = e.le ? JOUR.format(new Date(e.le)) : 'à venir';
      const dernier = groupes[groupes.length - 1];
      if (dernier && dernier.jour === jour) dernier.entrées.push(e);
      else groupes.push({ jour, entrées: [e] });
    }
    return groupes;
  }, [d]);

  if (erreur) {
    return (
      <main className="min-h-screen pb-24">
        <div className="mx-auto max-w-2xl px-5 pt-8">
          <p className="rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>
          <Link href="/pro" className="mt-4 inline-block text-sm font-semibold text-vert">← La liste</Link>
        </div>
        <NavPro />
      </main>
    );
  }

  const codeVivant = d?.mandat.codes.find((c) => !c.revoque_le && (!c.expire_le || new Date(c.expire_le) > new Date()));

  return (
    <main className="min-h-screen pb-36">
      {/* L'EN-TÊTE DU DOSSIER */}
      <header className="bg-vert-nuit px-5 pt-5 pb-5">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <Link href="/pro" className="inline-flex items-center gap-2 text-sm font-semibold text-pierre/80 transition hover:text-pierre">
              ← La liste
            </Link>
            <Link href="/pro/mandats" className="text-xs font-semibold tracking-wide text-pierre/70 transition hover:text-pierre">
              Réglages du dossier →
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-vert font-titre text-base font-bold text-white">
              {d ? d.mandat.client_nom.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') : '…'}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-titre text-xl font-bold text-pierre">{d?.mandat.client_nom ?? '…'}</h1>
              <p className="truncate text-sm text-pierre/70">
                {d?.mandat.lieu || ''}
                {d?.mandat.statut !== 'actif' ? ' · clos' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* LE MENU HORIZONTAL */}
      <div className="sticky top-0 z-10 border-b border-pierre-sombre bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl px-2">
          {ONGLETS.map((o) => (
            <button
              key={o.cle}
              onClick={() => setOnglet(o.cle)}
              className={`horodatage flex-1 border-b-2 py-3 text-center text-[10px] font-bold tracking-[0.14em] transition ${onglet === o.cle ? 'border-vermillon text-vert' : 'border-transparent text-graphite hover:text-vert'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 pt-4">
        {!d ? (
          <p className="py-10 text-center text-sm text-graphite">Chargement du dossier…</p>
        ) : (
          <>
            {/* ══ MISSION — LE FIL UNIFIÉ ══ */}
            {onglet === 'mission' && (
              <>
                {groupes.length === 0 ? (
                  <p className="rounded-carte bg-white px-4 py-8 text-center text-sm text-graphite">
                    Aucune mission encore — le premier geste attend (la FAB, en bas à droite).
                  </p>
                ) : (
                  groupes.map((g) => (
                    <section key={g.jour} className="mt-4">
                      <p className="horodatage px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-graphite">{g.jour}</p>
                      <div className="mt-2 space-y-2.5">{g.entrées.map((e) => e.nœud)}</div>
                    </section>
                  ))
                )}
              </>
            )}

            {/* ══ INTERVENANT — LES GENS DU DOSSIER ══ */}
            {onglet === 'intervenant' && (
              <section className="mt-2 space-y-2">
                {d.intervenants.map((i) => (
                  <div key={i.nom} className="carte-preuve flex items-center gap-3.5 p-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-titre text-sm font-bold ${i.nom === 'Vous' ? 'bg-vert text-white' : 'bg-vermillon-voile text-vermillon'}`}>
                      {i.nom === 'Vous' ? 'V' : i.nom.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-titre text-sm font-bold text-encre">{i.nom}</p>
                      <p className="text-xs text-graphite">
                        {i.rôle} · {i.missions} mission{i.missions > 1 ? 's' : ''}{i.dernière ? ` · dernière le ${dateCourte(i.dernière)}` : ''}
                      </p>
                      {i.téléphone && (
                        <a href={`tel:${i.téléphone.replace(/[^+\d]/g, '')}`} className="text-xs font-semibold text-vert">{i.téléphone}</a>
                      )}
                    </div>
                  </div>
                ))}
                <Link
                  href="/pro/missions"
                  className="carte-preuve flex items-center justify-center gap-2 p-4 text-sm font-bold text-vert transition hover:shadow-haute"
                >
                  + Confier une mission à un intervenant
                </Link>
              </section>
            )}

            {/* ══ AGENDA — la frise v1 (passé publié + futur prévu) ══ */}
            {onglet === 'agenda' && (
              <section className="mt-2">
                <p className="px-1 text-xs text-graphite">
                  La frise du dossier — les passages passés et les missions prévues. (Le pense-bête complet — rappels, véto, révision — arrive avec sa brique.)
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    ...d.interventions.filter((i) => i.publie_le).map((i) => ({ le: i.publie_le!, texte: `${labelCatégorie(i.categorie)} — par vous`, passé: true })),
                    ...d.missions.map((m) => ({
                      le: m.prevue_le ?? m.fermee_le ?? '',
                      texte: `${m.titre || 'Mission'} — ${m.tiers?.nom ?? 'un tiers'}${m.statut === 'faite' ? ' (faite)' : m.statut === 'en_cours' ? ' (en cours)' : ''}`,
                      passé: m.statut === 'faite',
                    })),
                  ]
                    .filter((e) => e.le)
                    .sort((a, b) => b.le.localeCompare(a.le))
                    .map((e, k) => (
                      <div key={k} className={`flex items-center gap-3 rounded-champ px-4 py-2.5 ${e.passé ? 'bg-white' : 'bg-vert-voile'}`}>
                        <span className="horodatage w-20 shrink-0 text-[10px] font-bold text-graphite">{dateCourte(e.le)}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-encre">{e.texte}</span>
                        {!e.passé && <span className="shrink-0 rounded-full bg-vert px-2 py-0.5 text-[9px] font-bold text-white">À VENIR</span>}
                      </div>
                    ))}
                  {d.interventions.length === 0 && d.missions.length === 0 && (
                    <p className="rounded-carte bg-white px-4 py-6 text-center text-sm text-graphite">Rien à l&apos;agenda — le dossier s&apos;ouvre.</p>
                  )}
                </div>
              </section>
            )}

            {/* ══ CHIFFRES — les compteurs + le portail ══ */}
            {onglet === 'chiffres' && (
              <section className="mt-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="carte-preuve p-4 text-center">
                    <p className="horodatage text-[9px] font-bold uppercase text-graphite">Gestes directs</p>
                    <p className="font-titre text-2xl font-bold text-vert">{d.chiffres.gestes_directs}</p>
                  </div>
                  <div className="carte-preuve p-4 text-center">
                    <p className="horodatage text-[9px] font-bold uppercase text-graphite">Missions tierces</p>
                    <p className="font-titre text-2xl font-bold text-vert">{d.chiffres.missions_déléguées}</p>
                  </div>
                  <div className="carte-preuve p-4 text-center">
                    <p className="horodatage text-[9px] font-bold uppercase text-graphite">Photos scellées</p>
                    <p className="font-titre text-2xl font-bold text-vert">{d.chiffres.photos}</p>
                  </div>
                  <div className="carte-preuve p-4 text-center">
                    <p className="horodatage text-[9px] font-bold uppercase text-graphite">« Tout va bien »</p>
                    <p className="font-titre text-2xl font-bold text-vert">{d.chiffres.réactions}</p>
                  </div>
                </div>
                {d.chiffres.durée_directe_s > 0 && (
                  <p className="mt-2 px-1 text-xs text-graphite">
                    Temps direct cumulé : {Math.round(d.chiffres.durée_directe_s / 60)} min
                  </p>
                )}
                {d.chiffres.portail && (
                  <div className="carte-preuve mt-3 p-5">
                    <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">LE PORTAIL DU BIEN (RÉSACAP)</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-graphite">Revenu net estimé — ce mois</p>
                        <p className="font-titre text-2xl font-bold text-vert">{d.chiffres.portail.net_mois.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-graphite">Cumul de l&apos;année</p>
                        <p className="font-titre text-xl font-bold text-vert">{d.chiffres.portail.net_année.toLocaleString('fr-FR')} €</p>
                      </div>
                    </div>
                    {d.chiffres.portail.saison && (
                      <p className="horodatage mt-2 text-[10px] text-graphite">
                        saison chargée · {d.chiffres.portail.saison.sejours} séjour{d.chiffres.portail.saison.sejours > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* LA BARRE DE GESTE — façon barre de saisie, au-dessus de la nav */}
      {d && d.mandat.statut === 'actif' && (
        <div className="fixed inset-x-0 bottom-16 z-10 border-t border-pierre-sombre bg-white/95 px-4 py-2.5 backdrop-blur">
          <div className="mx-auto flex max-w-2xl gap-2">
            <Link
              href={`/pro?lancer=${d.mandat.id}`}
              className="flex-1 rounded-full bg-vermillon py-2.5 text-center text-xs font-bold text-white transition hover:opacity-92"
            >
              Démarrer une mission
            </Link>
            <Link
              href="/pro/missions"
              className="flex-1 rounded-full border-[1.5px] border-vert py-2.5 text-center text-xs font-bold text-vert transition hover:bg-vert-voile"
            >
              Confier à un tiers
            </Link>
            <Link
              href="/pro/mandats"
              className="rounded-full bg-pierre px-4 py-2.5 text-center text-xs font-bold text-vert transition hover:bg-vert-voile"
              title={codeVivant ? `Code ${codeVivant.code.slice(0, 3)}-${codeVivant.code.slice(3)}` : 'Aucun code vivant'}
            >
              Code {codeVivant ? `${codeVivant.code.slice(0, 3)}-${codeVivant.code.slice(3)}` : '—'}
            </Link>
          </div>
        </div>
      )}

      <NavPro />
    </main>
  );
}
