'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';

// ═══════════════════════════════════════════════════════════════════
// LE VOLET DROIT SANS DOSSIER (23/11, l'atelier 2 volets) — quand
// aucun dossier n'est ouvert : la carte du nom (l'identité, leçon du
// jeu de rôle), les trois gestes de la première fois, et le geste du
// jour — la liste vit à gauche, la FAB dans le shell.
// ═══════════════════════════════════════════════════════════════════

type Accueil = { pro: { nom: string; email?: string; enseigne?: string | null }; mandats: unknown[] };

function pasEncoreNommé(pro: { nom: string; email?: string }) {
  if (!pro.nom) return true;
  if (pro.email && pro.nom === pro.email.split('@')[0]) return true;
  return false;
}

export function DashboardPro() {
  const router = useRouter();
  const [données, setDonnées] = useState<Accueil | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
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
      } else setErreur('Le volet ne charge pas — réessayez.');
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

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-lg">
        {erreur && <p className="mb-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}

        {/* LA CARTE DU NOM — l'identité avant tout (leçon du jeu de rôle). */}
        {données && pasEncoreNommé(données.pro) && (
          <section className="carte-preuve p-6">
            <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">UN DERNIER DÉTAIL — VOTRE IDENTITÉ</p>
            <h2 className="mt-2 font-titre text-lg font-bold text-vert">Comment vous appelez-vous&nbsp;?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">
              Votre nom (et votre enseigne, si vous en avez une) signent le journal
              que vos clients ouvrent — personne ne devrait recevoir un lien d&apos;un inconnu.
            </p>
            <div className="mt-4 grid gap-3">
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
              className="mt-4 w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40">
              {nomEnVent ? 'Sauvegarde…' : 'C\u2019est moi'}
            </button>
          </section>
        )}

        {/* LA PREMIÈRE FOIS — les trois gestes. */}
        {données && données.mandats.length === 0 && (
          <section className="carte-preuve p-6">
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

        {/* LE REPOS DE L'ATELIER — un dossier à gauche, un monde s'ouvre. */}
        {données && données.mandats.length > 0 && (
          <div className="rounded-carte border border-dashed border-pierre-sombre px-8 py-14 text-center">
            <p className="font-titre text-lg font-bold text-vert">Choisissez un dossier</p>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              La liste vit à gauche — un clic, et le dossier s&apos;ouvre ici&nbsp;:<br />
              ses missions, ses intervenants, son agenda, ses chiffres.
            </p>
            <p className="mt-4 text-xs text-graphite/70">
              (Le bouton vermillon, en bas à droite, démarre une mission.)
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
