'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { CATÉGORIES, heure } from '@/lib/format';
import { Icône, P_LANCER, P_ANIMAUX, P_MENAGE, P_JARDIN, P_PISCINE, P_COURSES, P_AUTRE, P_ACCUEIL, P_LINGE } from '@/lib/icones';
import { NavPro } from '@/lib/nav-pro';

// ═══════════════════════════════════════════════════════════════════
// LA LISTE DES DOSSIERS (23/11, JOBLIVE-DOSSIER.md chez la mère) —
// la grammaire WhatsApp : une ligne par dossier (le mandat du pro,
// la ressource du particulier demain), l'aperçu du dernier
// événement, le badge des non-vus. Le geste royal vit en FAB.
// ═══════════════════════════════════════════════════════════════════

const ICÔNES: Record<string, string> = {
  animaux: P_ANIMAUX, menage: P_MENAGE, jardin: P_JARDIN,
  piscine: P_PISCINE, courses: P_COURSES, accueil: P_ACCUEIL, linge: P_LINGE, autre: P_AUTRE,
};

type Code = { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null };
type Mandat = {
  id: string; client_nom: string; lieu: string; statut: string; debut: string | null; fin: string | null;
  codes: Code[];
};
type Conversation = { dernier: { genre: string; texte: string; le: string } | null; non_vus: number };
type Accueil = {
  pro: { nom: string; email?: string; enseigne?: string | null };
  mandats: Mandat[];
  conversations: Record<string, Conversation>;
};

// L'identité du pro (leçon du jeu de rôle 19/11) : tant qu'il n'a
// pas dit son nom, la maison ne le salue pas par son email — et le
// journal de son client reste anonyme. La carte ne demande que ça.
function pasEncoreNommé(pro: { nom: string; email?: string }) {
  if (!pro.nom) return true;
  if (pro.email && pro.nom === pro.email.split('@')[0]) return true;
  return false;
}

/** L'heure à droite de la ligne : HH:MM aujourd'hui, la date sinon
 *  (la convention WhatsApp — la ligne se lit d'un regard). */
function repère(le: string): string {
  if (!le) return '';
  const d = new Date(le);
  const aujourd = new Date();
  if (d.toDateString() === aujourd.toDateString()) return heure(le);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/** L'avatar du dossier : les initiales du client, sur vert-voile. */
function initiales(nom: string): string {
  const parties = nom.trim().split(/\s+/).slice(0, 2);
  return parties.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function DashboardPro({ lancerMandat }: { lancerMandat?: string }) {
  const router = useRouter();
  const [données, setDonnées] = useState<Accueil | null>(null);
  const [reprise, setReprise] = useState(false);
  // Le lanceur (la FAB l'ouvre en voile) : mandat + catégorie → la
  // mission directe naît. ?lancer=<id> l'ouvre déjà choisi (la barre
  // de geste du dossier ramène ici).
  const [lanceurOuvert, setLanceurOuvert] = useState(!!lancerMandat);
  const [mandatChoisi, setMandatChoisi] = useState<string | null>(lancerMandat ?? null);
  const [catégorie, setCatégorie] = useState<string | null>(null);
  const [enVent, setEnVent] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // La carte du nom (l'identité, leçon du jeu de rôle).
  const [identité, setIdentité] = useState({ nom: '', enseigne: '' });
  const [nomEnVent, setNomEnVent] = useState(false);

  const charger = useCallback(async () => {
    try {
      const d = await appeller<Accueil>('/api/pro/accueil', undefined, 'GET');
      setDonnées(d);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('La liste ne charge pas — réessayez.');
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  async function nommer() {
    if (!identité.nom.trim()) return;
    setNomEnVent(true);
    try {
      await appeller('/api/pro/profil', { action: 'nommer', nom: identité.nom.trim(), enseigne: identité.enseigne.trim() });
      await charger();
    } catch { setErreur('La sauvegarde a échoué'); }
    finally { setNomEnVent(false); }
  }

  async function lancer() {
    if (!mandatChoisi || !catégorie) return;
    setEnVent(true);
    try {
      const { id } = await appeller<{ id: string }>('/api/interventions', {
        action: 'creer', mandat_id: mandatChoisi, categorie: catégorie,
      });
      router.push(`/pro/intervention/${id}`);
    } catch {
      setErreur('Le lancement a échoué');
      setEnVent(false);
    }
  }

  if (reprise) return null;
  const actifs = données?.mandats.filter((m) => m.statut === 'actif') ?? [];
  const clos = données?.mandats.filter((m) => m.statut !== 'actif') ?? [];
  // La liste vit par son activité récente (la grammaire WhatsApp),
  // les sans-nouvelles restent visibles en fin de liste.
  const classement = (m: Mandat) => données?.conversations?.[m.id]?.dernier?.le ?? '';
  const actifsTriés = [...actifs].sort((a, b) => classement(b).localeCompare(classement(a)));

  return (
    <main className="min-h-screen pb-24">
      {/* L'EN-TÊTE */}
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/pro" className="inline-flex items-center gap-2.5">
            <img src="/logo-job-nuit.png" alt="JOBLIVE" className="h-7 w-auto" />
            <span className="align-middle font-titre text-sm font-semibold tracking-[0.18em] text-pierre opacity-80">JOBLIVE</span>
          </Link>
          <button
            onClick={async () => { setReprise(true); await getSupabase().auth.signOut(); router.replace('/'); }}
            className="text-xs font-semibold tracking-wide text-pierre/70 transition hover:text-pierre"
          >
            Se déconnecter
          </button>
        </div>
        <div className="mx-auto mt-4 max-w-2xl">
          <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-pierre/60">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
          <h1 className="mt-1 font-titre text-2xl font-bold text-pierre">
            Bonjour{données?.pro && !pasEncoreNommé(données.pro) ? ` ${données.pro.nom.split(' ')[0]}` : ''}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {erreur && <p className="mt-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}

        {/* LA CARTE DU NOM — l'identité avant tout (leçon du jeu de rôle). */}
        {données && pasEncoreNommé(données.pro) && (
          <section className="carte-preuve mt-5 p-6">
            <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">UN DERNIER DÉTAIL — VOTRE IDENTITÉ</p>
            <h2 className="mt-2 font-titre text-lg font-bold text-vert">Comment vous appelez-vous&nbsp;?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">
              Votre nom (et votre enseigne, si vous en avez une) signent le journal
              que vos clients ouvrent — personne ne devrait recevoir un lien d&apos;un inconnu.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={identité.nom}
                onChange={(e) => setIdentité({ ...identité, nom: e.target.value })}
                placeholder="Claire Fontaine"
                aria-label="Votre nom"
                className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert focus:ring-[3px] focus:ring-vert/10"
              />
              <input
                value={identité.enseigne}
                onChange={(e) => setIdentité({ ...identité, enseigne: e.target.value })}
                placeholder="Conciergerie Les Oliviers (optionnel)"
                aria-label="Votre enseigne"
                className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert focus:ring-[3px] focus:ring-vert/10"
              />
            </div>
            <button onClick={nommer} disabled={nomEnVent || !identité.nom.trim()}
              className="mt-4 w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40 sm:w-auto sm:px-10">
              {nomEnVent ? 'Sauvegarde…' : 'C\u2019est moi'}
            </button>
          </section>
        )}

        {/* LA PREMIÈRE FOIS — la maison vide montre le chemin en trois gestes. */}
        {données && données.mandats.length === 0 && (
          <section className="carte-preuve mt-5 p-6">
            <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">BIENVENUE — LA PREUVE COULE EN TROIS GESTES</p>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-graphite">
              <li><strong className="text-vert">① Ouvrez un dossier</strong> — le client, le lieu, la date de fin.</li>
              <li><strong className="text-vert">② Envoyez le code au propriétaire</strong> — il regarde sans compte, depuis son téléphone.</li>
              <li><strong className="text-vert">③ Photographiez votre premier geste</strong> — il arrive chez lui, horodaté, certifié.</li>
            </ol>
            <Link
              href="/pro/mandats"
              className="mt-5 flex items-center justify-center rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white shadow-haute transition hover:opacity-92"
            >
              Ouvrir mon premier dossier
            </Link>
          </section>
        )}

        {/* ══ LA LISTE DES DOSSIERS — la grammaire WhatsApp : une ligne
            par dossier, l'aperçu du dernier événement, le badge. ══ */}
        {données && données.mandats.length > 0 && (
          <section className="mt-4">
            <h2 className="px-1 font-titre text-sm font-bold uppercase tracking-wide text-vert">Les dossiers</h2>
            <div className="mt-2 overflow-hidden rounded-carte border border-pierre-sombre bg-white">
              {actifsTriés.map((m) => {
                const c = données.conversations?.[m.id];
                const nonVus = c?.non_vus ?? 0;
                return (
                  <Link
                    key={m.id}
                    href={`/pro/mandat/${m.id}`}
                    className="flex items-center gap-3.5 border-b border-pierre px-4 py-3.5 transition last:border-b-0 hover:bg-vert-voile"
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
              <details className="mt-4">
                <summary className="cursor-pointer px-1 text-xs font-semibold text-graphite">
                  Dossiers clos ({clos.length})
                </summary>
                <div className="mt-2 overflow-hidden rounded-carte border border-pierre-sombre bg-white/60">
                  {clos.map((m) => (
                    <Link
                      key={m.id}
                      href={`/pro/mandat/${m.id}`}
                      className="flex items-center gap-3.5 border-b border-pierre px-4 py-3 opacity-60 transition last:border-b-0 hover:opacity-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pierre-sombre font-titre text-xs font-bold text-graphite">
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
          </section>
        )}
      </div>

      {/* ══ LA FAB — le geste royal, à la place du pouce (le « + » de
          WhatsApp ouvre le lanceur en voile). ══ */}
      {actifs.length > 0 && !lanceurOuvert && (
        <button
          onClick={() => setLanceurOuvert(true)}
          aria-label="Démarrer une mission"
          className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-vermillon text-white shadow-haute transition hover:opacity-92"
        >
          <Icône d={P_LANCER} taille={26} />
        </button>
      )}

      {/* LE LANCEUR EN VOILE — mandat + catégorie → la mission directe. */}
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

      {/* LA NAV BASSE — le pouce décide */}
      <NavPro />
    </main>
  );
}
