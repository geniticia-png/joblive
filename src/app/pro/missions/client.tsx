'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { Icône, P_JOURNAL, P_CLE, P_LIVRE, P_EQUIPE } from '@/lib/icones';

type Élément = { id: string; libelle: string; genre: string; joblivise: boolean; fait: boolean; ordre: number };
type Mission = {
  id: string; jeton: string | null; titre: string; prevue_le: string | null; statut: string;
  tiers: { nom: string; role: string; telephone: string | null } | null;
  mandats: { client_nom: string; lieu: string } | null;
  mission_elements: Élément[];
  mission_preuves: { id: string; chemin: string; horodatage: string }[];
};
type Tier = { id: string; nom: string; role: string; telephone: string | null };
type Fiche = { id: string; nom: string; type: string };
type MandatLéger = { id: string; client_nom: string; lieu: string; statut: string };
type ServiceLéger = { id: string; nom: string };

const RÔLES: Record<string, string> = { salarie: 'salarié·e', partenaire: 'partenaire', prestataire: 'prestataire' };
const STATUTS: Record<string, string> = { a_faire: 'À FAIRE', en_cours: 'EN COURS', faite: 'FAITE', annulee: 'ANNULÉE' };

export function MissionsClient() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [mandats, setMandats] = useState<MandatLéger[]>([]);
  const [services, setServices] = useState<ServiceLéger[]>([]);
  const [création, setCréation] = useState(false);
  const [nouveauTier, setNouveauTier] = useState(false);
  const [formTier, setFormTier] = useState({ nom: '', role: 'partenaire', tel: '' });
  const [form, setForm] = useState({ tiers_id: '', mandat_id: '', service_id: '', prevue_le: '' });
  const [ouvertes, setOuvertes] = useState<string | null>(null);
  const [nouvelÉlément, setNouvelÉlément] = useState('');
  const [partagé, setPartagé] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const [m, t, md, ct] = await Promise.all([
        appeller<{ missions: Mission[] }>('/api/missions', undefined, 'GET'),
        appeller<{ tiers: Tier[] }>('/api/tiers', undefined, 'GET'),
        appeller<{ mandats: MandatLéger[] }>('/api/pro/accueil', undefined, 'GET'),
        appeller<{ services: ServiceLéger[] }>('/api/catalogue', undefined, 'GET'),
      ]);
      setMissions(m.missions);
      setTiers(t.tiers);
      setMandats(md.mandats.filter((x) => x.statut === 'actif'));
      setServices(ct.services);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Les missions ne chargent pas — réessayez.');
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  // LE LIEN DE MARIE — la mission s'envoie comme le code : un message,
  // jamais une URL nue (la leçon du partage qui parle).
  function messageMission(m: Mission) {
    const lien = `${window.location.origin}/m/${m.jeton}`;
    return `Bonjour ${m.tiers?.nom ?? ''}, voici votre mission « ${m.titre} »${m.mandats?.lieu ? ` (${m.mandats.lieu})` : ''} — ouvrez ce lien, cochez vos gestes, photographiez sur place : ${lien}`;
  }
  async function partagerMission(m: Mission) {
    const texte = messageMission(m);
    try {
      if (navigator.share) { await navigator.share({ title: 'JOBLIVE — mission', text: texte }); return; }
    } catch { return; }
    navigator.clipboard?.writeText(texte).then(() => {
      setPartagé(m.id);
      setTimeout(() => setPartagé(null), 1800);
    }).catch(() => {});
  }

  async function geste(corps: Record<string, unknown>, chemin = '/api/missions') {
    await appeller(chemin, corps).catch(() => setErreur('Le geste a échoué'));
    await charger();
  }

  const vivantes = missions?.filter((m) => m.statut !== 'annulee' && m.statut !== 'faite') ?? [];
  const closes = missions?.filter((m) => m.statut === 'faite' || m.statut === 'annulee') ?? [];

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto max-w-2xl">
          <Link href="/pro" className="text-xs font-semibold text-pierre/60">← Journal</Link>
          <h1 className="mt-2 font-titre text-2xl font-bold text-pierre">Les missions</h1>
          <p className="text-sm text-pierre/60">L&apos;amont&nbsp;: votre équipe exécute, les éléments remontent vers vous.</p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {erreur && <p className="mt-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}

        {/* L'ÉQUIPE — le registre des tiers */}
        <section className="carte-preuve mt-5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-titre text-base font-bold text-vert">Votre équipe</h2>
            <button onClick={() => setNouveauTier(!nouveauTier)} className="rounded-full bg-vert-voile px-3 py-1.5 text-xs font-bold text-vert">
              {nouveauTier ? 'fermer' : '+ ajouter'}
            </button>
          </div>
          {tiers.length === 0 && !nouveauTier && (
            <p className="mt-2 text-sm text-graphite">Personne encore — salariés, partenaires, prestataires… la femme de ménage vit ici.</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {tiers.map((t) => (
              <span key={t.id} className="rounded-full border border-pierre-sombre bg-white px-3 py-1.5 text-xs font-semibold text-vert">
                {t.nom} <span className="text-graphite">· {RÔLES[t.role] ?? t.role}</span>
              </span>
            ))}
          </div>
          {nouveauTier && (
            <div className="mt-3 space-y-2 rounded-carte bg-pierre p-3.5">
              <input
                value={formTier.nom}
                onChange={(e) => setFormTier({ ...formTier, nom: e.target.value })}
                placeholder="Marie L. (femme de ménage)"
                aria-label="Nom du tiers"
                className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-2.5 text-base outline-none focus:border-vert"
              />
              <div className="flex gap-2">
                {(['salarie', 'partenaire', 'prestataire'] as const).map((r) => (
                  <button key={r} onClick={() => setFormTier({ ...formTier, role: r })}
                    className={`flex-1 rounded-full border px-2 py-2 text-xs font-semibold transition ${formTier.role === r ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert'}`}>
                    {RÔLES[r]}
                  </button>
                ))}
              </div>
              <input
                value={formTier.tel}
                onChange={(e) => setFormTier({ ...formTier, tel: e.target.value })}
                placeholder="Téléphone (optionnel)"
                aria-label="Téléphone du tiers"
                className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-2.5 text-base outline-none focus:border-vert"
              />
              <button
                onClick={async () => {
                  if (!formTier.nom.trim()) return;
                  await geste({ action: 'creer', nom: formTier.nom.trim(), role: formTier.role, telephone: formTier.tel.trim() }, '/api/tiers');
                  setFormTier({ nom: '', role: 'partenaire', tel: '' });
                  setNouveauTier(false);
                }}
                disabled={!formTier.nom.trim()}
                className="w-full rounded-full bg-vert py-3 font-titre text-sm font-semibold text-white transition hover:opacity-92 disabled:opacity-40"
              >
                L&apos;ajouter à l&apos;équipe
              </button>
            </div>
          )}
        </section>

        {/* LA MISSION — assigner */}
        <button
          onClick={() => setCréation(!création)}
          className="mt-5 w-full rounded-full border-[1.5px] border-vert py-3 font-titre text-base font-semibold text-vert transition hover:bg-vert-voile"
        >
          {création ? 'Fermer' : '+ Nouvelle mission'}
        </button>
        {création && (
          <div className="carte-preuve mt-3 space-y-4 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-vert">Qui&nbsp;?</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map((t) => (
                <button key={t.id} onClick={() => setForm({ ...form, tiers_id: t.id })}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${form.tiers_id === t.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                  {t.nom}
                </button>
              ))}
              {tiers.length === 0 && <p className="text-sm text-graphite">Ajoutez d&apos;abord un tiers à votre équipe ↑</p>}
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-vert">Pour quel mandat&nbsp;?</p>
            <div className="flex flex-wrap gap-2">
              {mandats.map((m) => (
                <button key={m.id} onClick={() => setForm({ ...form, mandat_id: m.id })}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${form.mandat_id === m.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                  {m.client_nom}{m.lieu ? ` · ${m.lieu}` : ''}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-vert">Quel service du catalogue&nbsp;?</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setForm({ ...form, service_id: '' })}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${form.service_id === '' ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                libre
              </button>
              {services.map((s) => (
                <button key={s.id} onClick={() => setForm({ ...form, service_id: s.id })}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${form.service_id === s.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                  {s.nom}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-vert" htmlFor="prevue">Prévue le (optionnel)</label>
              <input id="prevue" type="date" value={form.prevue_le} onChange={(e) => setForm({ ...form, prevue_le: e.target.value })}
                className="mt-1 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 outline-none focus:border-vert" />
            </div>
            <button
              onClick={async () => {
                if (!form.tiers_id || !form.mandat_id) return;
                await geste({ action: 'creer', ...form });
                setForm({ tiers_id: '', mandat_id: '', service_id: '', prevue_le: '' });
                setCréation(false);
              }}
              disabled={!form.tiers_id || !form.mandat_id}
              className="w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40"
            >
              Assigner la mission
            </button>
            {form.service_id && (
              <p className="text-center text-xs text-graphite">Les tâches du service (et leurs drapeaux ●○) deviendront les éléments de la mission.</p>
            )}
          </div>
        )}

        {!missions && <p className="mt-8 text-center text-sm text-graphite">Chargement…</p>}
        {missions && vivantes.length === 0 && !création && (
          <p className="mt-6 rounded-carte bg-white px-4 py-5 text-center text-sm text-graphite">
            Aucune mission vivante — l&apos;équipe attend ses consignes.
          </p>
        )}

        {/* LES MISSIONS VIVANTES */}
        {vivantes.map((m) => {
          const faits = m.mission_elements.filter((e) => e.fait).length;
          return (
            <section key={m.id} className="carte-preuve mt-4 p-5">
              <button onClick={() => setOuvertes(ouvertes === m.id ? null : m.id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="min-w-0 truncate font-titre text-base font-bold text-vert">{m.titre}</h3>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${m.statut === 'en_cours' ? 'bg-vermillon text-white' : 'bg-vert-voile text-vert'}`}>
                    {STATUTS[m.statut]}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-graphite">
                  {m.tiers?.nom} · {m.mandats?.client_nom}{m.mandats?.lieu ? ` — ${m.mandats.lieu}` : ''}
                  {m.prevue_le ? ` · prévue le ${new Date(m.prevue_le).toLocaleDateString('fr-FR')}` : ''}
                </p>
                <p className="horodatage mt-1 text-xs text-graphite">
                  {faits}/{m.mission_elements.length} élément{m.mission_elements.length > 1 ? 's' : ''} fait{faits > 1 ? 's' : ''} ·{' '}
                  {m.mission_elements.filter((e) => e.joblivise).length} joblivisé{ouvertes === m.id ? ' ▲' : ' ▼'}
                </p>
              </button>

              {ouvertes === m.id && (
                <div className="mt-4 space-y-1.5">
                  {m.mission_elements.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 rounded-carte bg-pierre px-3 py-2">
                      <input
                        type="checkbox"
                        checked={e.fait}
                        onChange={(ev) => geste({ action: 'element-fait', id: e.id, fait: ev.target.checked })}
                        aria-label={`Fait : ${e.libelle}`}
                        className="h-5 w-5 shrink-0 cursor-pointer accent-[#123F3D]"
                      />
                      <p className={`min-w-0 flex-1 text-sm ${e.fait ? 'text-graphite line-through' : 'text-encre'}`}>{e.libelle}</p>
                      <button
                        onClick={() => geste({ action: 'element-jobliviser', id: e.id, joblivise: !e.joblivise })}
                        aria-label={`Partager ${e.libelle} via JOBLIVE`}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition ${e.joblivise ? 'bg-vert text-white' : 'bg-pierre-sombre text-graphite'}`}
                      >
                        {e.joblivise ? '●' : '○'}
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      value={nouvelÉlément}
                      onChange={(e) => setNouvelÉlément(e.target.value)}
                      placeholder="Un élément propre à cette mission…"
                      aria-label="Nouvel élément de mission"
                      className="min-w-0 flex-1 rounded-champ border border-pierre-sombre bg-white px-3 py-2 text-sm outline-none focus:border-vert"
                    />
                    <button
                      onClick={async () => {
                        if (!nouvelÉlément.trim()) return;
                        await geste({ action: 'element-ajouter', mission_id: m.id, libelle: nouvelÉlément.trim(), genre: 'particuliere' });
                        setNouvelÉlément('');
                      }}
                      disabled={!nouvelÉlément.trim()}
                      className="shrink-0 rounded-full bg-vert px-4 py-2 text-xs font-bold text-white transition hover:opacity-92 disabled:opacity-40"
                    >
                      + élément
                    </button>
                  </div>
                  {m.jeton && m.statut !== 'faite' && m.statut !== 'annulee' && (
                    <div className="mt-3 rounded-carte bg-vert-voile px-4 py-3">
                      <p className="text-xs leading-relaxed text-vert">
                        Le lien de {m.tiers?.nom} — elle ouvre, elle coche, elle photographie. Sans compte.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => partagerMission(m)} className="rounded-full bg-vert px-4 py-2 text-xs font-bold text-white transition hover:opacity-92">
                          {partagé === m.id ? 'copié ✓' : 'envoyer'}
                        </button>
                        {m.tiers?.telephone && (
                          <a
                            href={`sms:${m.tiers.telephone.replace(/[^+\d]/g, '')}?&body=${encodeURIComponent(messageMission(m))}`}
                            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-vert"
                          >
                            SMS
                          </a>
                        )}
                        <span className="horodatage ml-auto self-center text-[10px] text-vert/70">/m/{m.jeton}</span>
                      </div>
                    </div>
                  )}
                  {m.mission_preuves.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-vert">Les photos de {m.tiers?.nom} ({m.mission_preuves.length})</p>
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        {m.mission_preuves.map((p) => (
                          <a key={p.id} href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${p.chemin}`} target="_blank" rel="noopener">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${p.chemin}`} alt="" className="aspect-square w-full rounded-champ object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => geste({ action: 'statut', id: m.id, statut: m.statut === 'a_faire' ? 'en_cours' : 'faite' })}
                      className="flex-1 rounded-full bg-vert py-2.5 text-xs font-bold text-white transition hover:opacity-92">
                      {m.statut === 'a_faire' ? 'Démarrer' : 'Marquer faite'}
                    </button>
                    <button onClick={() => geste({ action: 'statut', id: m.id, statut: 'annulee' })}
                      className="rounded-full bg-vermillon-voile px-4 py-2.5 text-xs font-bold text-vermillon">
                      annuler
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* LES CLOSES — pliées, honorées */}
        {closes.length > 0 && (
          <section className="mt-6">
            <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-graphite">Missions closes</h2>
            {closes.map((m) => (
              <div key={m.id} className="mt-2 rounded-carte border border-pierre-sombre bg-white/60 px-4 py-3 opacity-70">
                <p className="font-titre text-sm font-bold text-vert">{m.titre}</p>
                <p className="text-xs text-graphite">{m.tiers?.nom} · {STATUTS[m.statut]} · {m.mission_elements.filter((e) => e.fait).length}/{m.mission_elements.length} faits</p>
              </div>
            ))}
          </section>
        )}
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
          <Link href="/pro/catalogue" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_LIVRE} taille={20} />
            <span className="text-[10px] font-bold">Catalogue</span>
          </Link>
          <Link href="/pro/missions" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-vert">
            <Icône d={P_EQUIPE} taille={20} />
            <span className="text-[10px] font-bold">Missions</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
