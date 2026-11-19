'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { CATÉGORIES, labelCatégorie, heure, tampon } from '@/lib/format';
import { Icône, P_LANCER, P_ANIMAUX, P_MENAGE, P_JARDIN, P_PISCINE, P_COURSES, P_AUTRE, P_JOURNAL, P_CLE } from '@/lib/icones';

const ICÔNES: Record<string, string> = {
  animaux: P_ANIMAUX, menage: P_MENAGE, jardin: P_JARDIN,
  piscine: P_PISCINE, courses: P_COURSES, autre: P_AUTRE,
};

type Preuve = { id: string; genre: string; chemin: string; horodatage: string };
type Intervention = {
  id: string; mandat_id: string; categorie: string; note: string; statut: string;
  debut_le: string; publie_le: string | null; duree_secondes: number | null;
  mandats: { client_nom: string; lieu: string };
  preuves: Preuve[];
  reactions?: { id: string; cree_le: string }[];
};
type Code = { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null };
type Mandat = {
  id: string; client_nom: string; lieu: string; statut: string; debut: string | null; fin: string | null;
  codes: Code[];
};
type Accueil = { pro: { nom: string; email?: string; enseigne?: string | null }; mandats: Mandat[]; enCours: Intervention[]; journal: Intervention[] };

// L'identité du pro (leçon du jeu de rôle 19/11) : tant qu'il n'a
// pas dit son nom, la maison ne le salue pas par son email — et le
// journal de son client reste anonyme. La carte ne demande que ça.
function pasEncoreNommé(pro: { nom: string; email?: string }) {
  if (!pro.nom) return true;
  if (pro.email && pro.nom === pro.email.split('@')[0]) return true;
  return false;
}

export function DashboardPro() {
  const router = useRouter();
  const [données, setDonnées] = useState<Accueil | null>(null);
  const [reprise, setReprise] = useState(false);
  // Le lanceur : mandat + catégorie → l'intervention naît.
  const [lanceurOuvert, setLanceurOuvert] = useState(false);
  const [mandatChoisi, setMandatChoisi] = useState<string | null>(null);
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
      } else setErreur('Le journal ne charge pas — réessayez.');
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

  return (
    <main className="min-h-screen pb-24">
      {/* L'EN-TÊTE */}
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/pro"><img src="/logo-job-nuit.png" alt="JOBLIVE" className="h-7 w-auto" /></Link>
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

        {/* LA CARTE DU NOM — l'identité avant tout (leçon du jeu de
            rôle : la maison saluait le pro par son email, et le
            journal du client ne disait pas qui parlait). */}
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

        {/* LA PREMIÈRE FOIS — la maison vide montre le chemin en trois
            gestes (le pilote n'a pas à deviner l'ordre du monde). */}
        {données && données.mandats.length === 0 && (
          <section className="carte-preuve mt-5 p-6">
            <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">BIENVENUE — LA PREUVE COULE EN TROIS GESTES</p>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-graphite">
              <li><strong className="text-vert">① Ouvrez un mandat</strong> — le client, le lieu, la date de fin.</li>
              <li><strong className="text-vert">② Envoyez le code au propriétaire</strong> — il regarde sans compte, depuis son téléphone.</li>
              <li><strong className="text-vert">③ Photographiez votre premier geste</strong> — il arrive chez lui, horodaté, certifié.</li>
            </ol>
            <Link
              href="/pro/mandats"
              className="mt-5 flex items-center justify-center rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white shadow-haute transition hover:opacity-92"
            >
              Ouvrir mon premier mandat
            </Link>
          </section>
        )}

        {/* LE CTA RÈGNE EN HAUT (leçon Stitch : le geste principal ne
            se cherche pas, il s'impose — une main, du soleil). */}
        {!lanceurOuvert ? (
          <button
            onClick={() => setLanceurOuvert(true)}
            disabled={actifs.length === 0}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-conteneur bg-vert py-4 font-titre text-lg font-bold text-white shadow-haute transition hover:opacity-92 disabled:opacity-40"
          >
            <Icône d={P_LANCER} taille={24} />
            Démarrer une intervention
          </button>
        ) : (
          <div className="carte-preuve mt-5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-titre text-base font-bold text-vert">Nouvelle intervention</h2>
              <button onClick={() => setLanceurOuvert(false)} className="text-sm font-semibold text-graphite">Annuler</button>
            </div>
            {actifs.length === 0 ? (
              <p className="mt-3 text-sm text-graphite">Aucun mandat actif — créez-en un d&apos;abord.</p>
            ) : (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-vert">Pour quel mandat&nbsp;?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {actifs.map((m) => (
                    <button key={m.id}
                      onClick={() => setMandatChoisi(m.id)}
                      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${mandatChoisi === m.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                      {m.client_nom}{m.lieu ? ` · ${m.lieu}` : ''}
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
                  className="mt-5 w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40"
                >
                  {enVent ? 'Lancement…' : 'C\'est parti'}
                </button>
              </>
            )}
          </div>
        )}

        {/* EN COURS — jamais laissée derrière soi */}
        {données && données.enCours.length > 0 && (
          <section className="mt-7">
            <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-vert">En cours</h2>
            {données.enCours.map((i) => (
              <Link key={i.id} href={`/pro/intervention/${i.id}`} className="carte-preuve mt-2 flex items-center gap-4 p-4 transition hover:shadow-haute">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vert-voile text-vert">
                  <Icône d={ICÔNES[i.categorie] ?? P_AUTRE} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-titre text-sm font-bold text-vert">{labelCatégorie(i.categorie)} · {i.mandats.client_nom}</span>
                  <span className="horodatage block text-xs text-graphite">démarrée {heure(i.debut_le)} · {i.preuves.length} photo{i.preuves.length > 1 ? 's' : ''}</span>
                </span>
                <span className="font-semibold text-vermillon">reprendre →</span>
              </Link>
            ))}
          </section>
        )}

        {/* LE JOURNAL DU JOUR — plafonné (5), il ne noie jamais le geste */}
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-vert">Le journal du jour</h2>
            <Link href="/pro/mandats" className="text-xs font-semibold text-graphite">Tous les mandats →</Link>
          </div>
          {!données?.journal.length && (
            <p className="mt-2 rounded-carte bg-white px-4 py-5 text-center text-sm text-graphite">
              Rien de publié aujourd&apos;hui — le premier geste attend son preneur.
            </p>
          )}
          {données?.journal.map((i) => (
              <div key={i.id} className="carte-preuve mt-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-titre text-sm font-bold text-vert">
                    {labelCatégorie(i.categorie)} · {i.mandats.client_nom}
                  </p>
                  <p className="horodatage shrink-0 text-xs text-graphite">{heure(i.publie_le)}</p>
                </div>
                {i.note && <p className="mt-1 line-clamp-2 text-sm text-graphite">{i.note}</p>}
                {i.preuves.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {i.preuves.slice(0, 4).map((p) => (
                      <span key={p.id} className="horodatage rounded-md bg-vert-voile px-2 py-1 text-[10px] font-semibold text-vert">
                        {p.genre === 'avant' ? 'AVANT' : 'APRÈS'} {tampon(p.horodatage).split('— ')[1]}
                      </span>
                    ))}
                  </div>
                )}
                {i.reactions && i.reactions.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-vert">« Tout va bien » — reçu {heure(i.reactions[0].cree_le)} ✓</p>
                )}
              </div>
            ))}
          </section>
        </div>

      {/* LA NAV BASSE — le pouce décide */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-pierre-sombre bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          <Link href="/pro" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-vert">
            <Icône d={P_JOURNAL} taille={20} />
            <span className="text-[10px] font-bold">Journal</span>
          </Link>
          <Link href="/pro/mandats" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_CLE} taille={20} />
            <span className="text-[10px] font-bold">Mandats & codes</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
