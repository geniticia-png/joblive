'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { CATÉGORIES, heure } from '@/lib/format';
import { Icône, P_LANCER, P_ANIMAUX, P_MENAGE, P_JARDIN, P_PISCINE, P_COURSES, P_AUTRE, P_ACCUEIL, P_LINGE } from '@/lib/icones';
import { NavPro } from '@/lib/nav-pro';
import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════
// L'ATELIER (23/11, verdict direction : « un espace avec 2 volets sur
// le même workflow, comme WhatsApp ») — LE VOLET GAUCHE : la liste
// des dossiers, persistante sur TOUTES les pages pro (elle ne bouge
// jamais, les badges respirent) ; LE VOLET DROIT : la page ouverte
// (le dossier, la console, les missions…). Sur téléphone : un volet à
// la fois — la liste, puis le dossier plein écran.
// ═══════════════════════════════════════════════════════════════════

const ICÔNES: Record<string, string> = {
  animaux: P_ANIMAUX, menage: P_MENAGE, jardin: P_JARDIN,
  piscine: P_PISCINE, courses: P_COURSES, accueil: P_ACCUEIL, linge: P_LINGE, autre: P_AUTRE,
};

type Code = { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null };
type Mandat = { id: string; client_nom: string; lieu: string; statut: string; codes: Code[] };
type Conversation = { dernier: { genre: string; texte: string; le: string } | null; non_vus: number };
type Accueil = { pro: { nom: string; email?: string }; mandats: Mandat[]; conversations: Record<string, Conversation> };

/** L'heure à droite de la ligne : HH:MM aujourd'hui, la date sinon. */
function repère(le: string): string {
  if (!le) return '';
  const d = new Date(le);
  if (d.toDateString() === new Date().toDateString()) return heure(le);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function initiales(nom: string): string {
  const parties = nom.trim().split(/\s+/).slice(0, 2);
  return parties.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function AtelierPro({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [données, setDonnées] = useState<Accueil | null>(null);
  const dossierOuvert = pathname.startsWith('/pro/mandat/');
  // Sur liste (pas de dossier ouvert) : le volet gauche occupe l'écran
  // du téléphone ; dès qu'un dossier s'ouvre, il lui cède la place.

  const charger = useCallback(async () => {
    try {
      const d = await appeller<Accueil>('/api/pro/accueil', undefined, 'GET');
      setDonnées(d);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      }
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);
  // ?lancer=<mandat> (la barre de geste du dossier ramène ici) : le
  // lanceur s'ouvre tout seul, le dossier déjà choisi — lu côté
  // navigateur, sans useSearchParams (pas de frontière Suspense à
  // poser pour un shell).
  useEffect(() => {
    const lancer = new URLSearchParams(window.location.search).get('lancer');
    if (lancer) { setLanceurOuvert(true); setMandatChoisi(lancer); }
  }, []);
  // Les dossiers respirent : un dossier ouvert (ouvrir = lu) sonne
  // l'événement, la liste ravive ses badges sans recharger la page.
  useEffect(() => {
    const écouteur = () => charger();
    window.addEventListener('joblive:dossiers', écouteur);
    return () => window.removeEventListener('joblive:dossiers', écouteur);
  }, [charger]);

  // LE LANCEUR (la FAB l'ouvre en voile) : mandat + catégorie.
  const [lanceurOuvert, setLanceurOuvert] = useState(false);
  const [mandatChoisi, setMandatChoisi] = useState<string | null>(null);
  const [catégorie, setCatégorie] = useState<string | null>(null);
  const [enVent, setEnVent] = useState(false);

  async function lancer() {
    if (!mandatChoisi || !catégorie) return;
    setEnVent(true);
    try {
      const { id } = await appeller<{ id: string }>('/api/interventions', {
        action: 'creer', mandat_id: mandatChoisi, categorie: catégorie,
      });
      router.push(`/pro/intervention/${id}`);
    } catch { setEnVent(false); }
  }

  const actifs = données?.mandats.filter((m) => m.statut === 'actif') ?? [];
  const clos = données?.mandats.filter((m) => m.statut !== 'actif') ?? [];
  const classement = (m: Mandat) => données?.conversations?.[m.id]?.dernier?.le ?? '';
  const actifsTriés = [...actifs].sort((a, b) => classement(b).localeCompare(classement(a)));

  return (
    <div className="flex min-h-screen">
      {/* ══ LE VOLET GAUCHE — la liste, persistante ══ */}
      <aside
        className={`${dossierOuvert ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-pierre-sombre bg-pierre md:w-[380px]`}
      >
        {/* l'en-tête du volet */}
        <header className="bg-vert-nuit px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/pro" className="inline-flex items-center gap-2.5">
              <img src="/logo-job-nuit.png" alt="JOBLIVE" className="h-7 w-auto" />
              <span className="align-middle font-titre text-sm font-semibold tracking-[0.18em] text-pierre opacity-80">JOBLIVE</span>
            </Link>
            <button
              onClick={async () => { await getSupabase().auth.signOut(); router.replace('/'); }}
              className="text-xs font-semibold tracking-wide text-pierre/70 transition hover:text-pierre"
            >
              Se déconnecter
            </button>
          </div>
          <p className="horodatage mt-3 text-[10px] font-semibold tracking-[0.22em] text-pierre/60">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </p>
          <h1 className="mt-0.5 font-titre text-xl font-bold text-pierre">
            Les dossiers
          </h1>
        </header>

        {/* la liste */}
        <div className="flex-1 overflow-y-auto px-3 py-3 pb-28 md:pb-6">
          {!données ? (
            <p className="px-2 py-6 text-center text-sm text-graphite">Chargement…</p>
          ) : données.mandats.length === 0 ? (
            <div className="mx-1 rounded-carte bg-white p-5 text-sm leading-relaxed text-graphite">
              Aucun dossier encore —{' '}
              <Link href="/pro/mandats" className="font-bold text-vert">ouvrez le premier →</Link>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-carte border border-pierre-sombre bg-white">
                {actifsTriés.map((m) => {
                  const c = données.conversations?.[m.id];
                  const nonVus = c?.non_vus ?? 0;
                  const sélectionné = pathname === `/pro/mandat/${m.id}`;
                  return (
                    <Link
                      key={m.id}
                      href={`/pro/mandat/${m.id}`}
                      className={`flex items-center gap-3.5 border-b border-pierre px-4 py-3.5 transition last:border-b-0 ${sélectionné ? 'bg-vert-voile' : 'hover:bg-vert-voile'}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vert font-titre text-sm font-bold text-white">
                        {initiales(m.client_nom)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-titre text-[15px] font-bold text-encre">{m.client_nom}</span>
                          <span className="horodatage shrink-0 text-[10px] text-graphite">{repère(c?.dernier?.le ?? '')}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={`truncate text-[13px] ${nonVus > 0 ? 'font-semibold text-encre' : 'text-graphite'}`}>
                            {m.lieu ? `${m.lieu} · ` : ''}{c?.dernier?.texte ?? 'Dossier ouvert'}
                          </span>
                          {nonVus > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-vermillon px-1.5 text-[10px] font-bold text-white">
                              {nonVus}
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              {clos.length > 0 && (
                <details className="mt-3 px-1">
                  <summary className="cursor-pointer text-xs font-semibold text-graphite">
                    Dossiers clos ({clos.length})
                  </summary>
                  <div className="mt-2 overflow-hidden rounded-carte border border-pierre-sombre bg-white/60">
                    {clos.map((m) => (
                      <Link
                        key={m.id}
                        href={`/pro/mandat/${m.id}`}
                        className="flex items-center gap-3 border-b border-pierre px-4 py-2.5 opacity-60 transition last:border-b-0 hover:opacity-100"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pierre-sombre font-titre text-[11px] font-bold text-graphite">
                          {initiales(m.client_nom)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-graphite">
                          {m.client_nom}{m.lieu ? ` · ${m.lieu}` : ''}
                        </span>
                        <span className="horodatage shrink-0 text-[10px] text-graphite">clos</span>
                      </Link>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ══ LE VOLET DROIT — la page ouverte ══ */}
      <div className={`${dossierOuvert ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-pierre`}>
        {children}
      </div>

      {/* LA FAB — le geste royal, à la place du pouce */}
      {actifs.length > 0 && !lanceurOuvert && (
        <button
          onClick={() => setLanceurOuvert(true)}
          aria-label="Démarrer une mission"
          className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-vermillon text-white shadow-haute transition hover:opacity-92 md:bottom-20"
        >
          <Icône d={P_LANCER} taille={26} />
        </button>
      )}

      {/* LE LANCEUR EN VOILE */}
      {lanceurOuvert && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-vert-nuit/60 p-4 pb-24 sm:items-center" onClick={() => setLanceurOuvert(false)}>
          <div className="carte-preuve w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-titre text-base font-bold text-vert">Démarrer une mission</h2>
              <button onClick={() => setLanceurOuvert(false)} className="text-sm font-semibold text-graphite">Fermer</button>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-vert">Pour quel dossier&nbsp;?</p>
            <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {actifs.map((m) => (
                <button key={m.id}
                  onClick={() => setMandatChoisi(m.id)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${mandatChoisi === m.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                  {m.client_nom}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-vert">Le geste</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CATÉGORIES.map((c) => (
                <button key={c.cle}
                  onClick={() => setCatégorie(c.cle)}
                  className={`flex flex-col items-center gap-1.5 rounded-carte border px-2 py-3 text-xs font-semibold transition ${catégorie === c.cle ? 'border-vert bg-vert-voile text-vert' : 'border-pierre-sombre bg-white text-graphite hover:border-vert/40'}`}>
                  <Icône d={ICÔNES[c.cle]} taille={22} />
                  {c.label}
                </button>
              ))}
            </div>
            <button
              onClick={lancer}
              disabled={!mandatChoisi || !catégorie || enVent}
              className="mt-5 w-full rounded-full bg-vermillon py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40"
            >
              {enVent ? 'Lancement…' : 'C\'est parti'}
            </button>
          </div>
        </div>
      )}

      {/* LA NAV BASSE — le pouce décide (le shell la porte pour toutes les pages pro) */}
      <NavPro />
    </div>
  );
}
