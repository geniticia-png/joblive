'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { Icône, P_JOURNAL, P_CLE, P_LIVRE } from '@/lib/icones';

type Tâche = { id: string; libelle: string; genre: string; joblivise: boolean };
type Service = { id: string; nom: string; ordre: number; joblivise: boolean; taches: Tâche[] };

// LE DRAPEAU — la joblivisation en un geste : l'élément est partagé
// via JOBLIVE (●) ou reste interne (○). La dose, élément par élément.
function Drapeau({ actif, onBascule, label }: { actif: boolean; onBascule: () => void; label: string }) {
  return (
    <button
      onClick={onBascule}
      aria-label={label}
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition ${actif ? 'bg-vert text-white' : 'bg-pierre-sombre text-graphite'}`}
    >
      {actif ? '● JOBLIVISÉ' : '○ INTERNE'}
    </button>
  );
}

export function CatalogueClient() {
  const router = useRouter();
  const [services, setServices] = useState<Service[] | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [nouveauService, setNouveauService] = useState('');
  const [nouvellesTâches, setNouvellesTâches] = useState<Record<string, { generale: string; particuliere: string }>>({});
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const d = await appeller<{ services: Service[] }>('/api/catalogue', undefined, 'GET');
      setServices(d.services);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Le catalogue ne charge pas — réessayez.');
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  async function geste(corps: Record<string, unknown>) {
    await appeller('/api/catalogue', corps).catch(() => setErreur('Le geste a échoué'));
    await charger();
  }

  async function poserGabarits() {
    await geste({ action: 'gabarits' });
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto max-w-2xl">
          <Link href="/pro" className="text-xs font-semibold text-pierre/60">← Journal</Link>
          <h1 className="mt-2 font-titre text-2xl font-bold text-pierre">Le catalogue</h1>
          <p className="text-sm text-pierre/60">
            Vos services, leurs tâches — et la dose : chaque élément partagé <span className="font-bold">●</span> ou interne <span className="font-bold">○</span>.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {erreur && <p className="mt-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}
        {!services && <p className="mt-8 text-center text-sm text-graphite">Chargement…</p>}

        {services && services.length === 0 && (
          <section className="carte-preuve mt-5 p-6 text-center">
            <h2 className="font-titre text-lg font-bold text-vert">Votre catalogue est vide</h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              Posez les gabarits du métier de la location touristière (ménage de sortie, accueil
              voyageurs, linge, piscine, jardin…) — puis pliez chaque liste à VOS gestes.
            </p>
            <button onClick={poserGabarits} className="mt-5 rounded-full bg-vert px-8 py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92">
              Poser les gabarits du métier
            </button>
          </section>
        )}

        {/* LE NOUVEAU SERVICE */}
        {services && services.length > 0 && (
          <div className="carte-preuve mt-5 flex gap-2 p-3">
            <input
              value={nouveauService}
              onChange={(e) => setNouveauService(e.target.value)}
              placeholder="Un nouveau service (ex. Repas de bienvenue)"
              aria-label="Nom du nouveau service"
              className="min-w-0 flex-1 rounded-champ border border-pierre-sombre bg-white px-4 py-2.5 text-base outline-none focus:border-vert"
            />
            <button
              onClick={async () => {
                if (!nouveauService.trim()) return;
                await geste({ action: 'service-creer', nom: nouveauService.trim() });
                setNouveauService('');
              }}
              disabled={!nouveauService.trim()}
              className="shrink-0 rounded-full bg-vert px-5 py-2.5 font-titre text-sm font-semibold text-white transition hover:opacity-92 disabled:opacity-40"
            >
              + Ajouter
            </button>
          </div>
        )}

        {/* LES SERVICES */}
        {services?.map((s) => {
          const générales = s.taches.filter((t) => t.genre === 'generale');
          const particulières = s.taches.filter((t) => t.genre === 'particuliere');
          const form = nouvellesTâches[s.id] ?? { generale: '', particuliere: '' };
          return (
            <section key={s.id} className="carte-preuve mt-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setOuvert(ouvert === s.id ? null : s.id)} className="min-w-0 flex-1 text-left">
                  <h2 className="truncate font-titre text-lg font-bold text-vert">{s.nom}</h2>
                  <p className="text-xs text-graphite">
                    {générales.length} générale{générales.length > 1 ? 's' : ''} · {particulières.length} particulière{particulières.length > 1 ? 's' : ''}
                    {ouvert === s.id ? ' ▲' : ' ▼'}
                  </p>
                </button>
                <Drapeau actif={s.joblivise} label={`Partager ${s.nom} via JOBLIVE`} onBascule={() => geste({ action: 'service-jobliviser', id: s.id, joblivise: !s.joblivise })} />
              </div>

              {ouvert === s.id && (
                <div className="mt-4 space-y-4">
                  {(['generale', 'particuliere'] as const).map((genre) => {
                    const liste = genre === 'generale' ? générales : particulières;
                    const titre = genre === 'generale' ? 'Tâches générales — la qualité constante' : 'Tâches particulières — le soin du bien';
                    return (
                      <div key={genre}>
                        <p className="text-xs font-bold uppercase tracking-wide text-vert">{titre}</p>
                        <div className="mt-2 space-y-1.5">
                          {liste.map((t) => (
                            <div key={t.id} className="flex items-center gap-2 rounded-carte bg-pierre px-3 py-2">
                              <p className="min-w-0 flex-1 text-sm text-graphite">{t.libelle}</p>
                              <Drapeau actif={t.joblivise} label={`Partager la tâche ${t.libelle}`} onBascule={() => geste({ action: 'tache-jobliviser', id: t.id, joblivise: !t.joblivise })} />
                              <button onClick={() => geste({ action: 'tache-supprimer', id: t.id })} aria-label={`Supprimer ${t.libelle}`} className="shrink-0 text-xs font-bold text-vermillon">✕</button>
                            </div>
                          ))}
                          {liste.length === 0 && <p className="px-3 text-xs italic text-graphite">aucune pour l&apos;instant</p>}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            value={form[genre]}
                            onChange={(e) => setNouvellesTâches({ ...nouvellesTâches, [s.id]: { ...form, [genre]: e.target.value } })}
                            placeholder={genre === 'generale' ? 'Une tâche toujours faite…' : 'Une consigne propre au bien…'}
                            aria-label={`Nouvelle tâche ${genre} pour ${s.nom}`}
                            className="min-w-0 flex-1 rounded-champ border border-pierre-sombre bg-white px-3 py-2 text-sm outline-none focus:border-vert"
                          />
                          <button
                            onClick={async () => {
                              if (!form[genre].trim()) return;
                              await geste({ action: 'tache-creer', service_id: s.id, libelle: form[genre].trim(), genre });
                              setNouvellesTâches({ ...nouvellesTâches, [s.id]: { ...form, [genre]: '' } });
                            }}
                            disabled={!form[genre].trim()}
                            className="shrink-0 rounded-full bg-vert px-4 py-2 text-xs font-bold text-white transition hover:opacity-92 disabled:opacity-40"
                          >
                            + tâche
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => { if (confirm(`Supprimer le service « ${s.nom} » et ses tâches ?`)) geste({ action: 'service-supprimer', id: s.id }); }} className="text-xs font-bold text-vermillon">
                    supprimer ce service
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-pierre-sombre bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          <Link href="/pro" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_JOURNAL} taille={20} />
            <span className="text-[10px] font-bold">Journal</span>
          </Link>
          <Link href="/pro/mandats" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_CLE} taille={20} />
            <span className="text-[10px] font-bold">Mandats</span>
          </Link>
          <Link href="/pro/catalogue" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-vert">
            <Icône d={P_LIVRE} taille={20} />
            <span className="text-[10px] font-bold">Catalogue</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
