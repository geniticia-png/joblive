'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { CATÉGORIES, heure } from '@/lib/format';
import { Icône, P_CLE, P_JOURNAL } from '@/lib/icones';

// LES MANDATS — le lien vivant pro ↔ client. Chaque mandat porte :
// ses codes d'accès (mortels : révocables, expirant à la fin), et LA
// DOSE — quelles catégories se diffusent, si le chrono se montre.
// La transparence est l'outil du pro, pas son procureur.

type Code = { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null };
type Mandat = {
  id: string; client_nom: string; lieu: string; client_tel: string | null; statut: string;
  debut: string | null; fin: string | null;
  categories_diffusees: string[] | null; chrono_visible: boolean;
  codes: Code[];
};

function codeAffiché(nu: string) {
  return nu.length === 6 ? `${nu.slice(0, 3)}-${nu.slice(3)}` : nu;
}

export function MandatsClient() {
  const router = useRouter();
  const [mandats, setMandats] = useState<Mandat[] | null>(null);
  const [création, setCréation] = useState(false);
  const [form, setForm] = useState({ client_nom: '', lieu: '', client_tel: '', debut: '', fin: '' });
  const [enVent, setEnVent] = useState(false);
  const [partagé, setPartagé] = useState<string | null>(null);
  const [doseOuverte, setDoseOuverte] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const d = await appeller<{ mandats: Mandat[] }>('/api/pro/accueil', undefined, 'GET');
      setMandats(d.mandats);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Le chargement a échoué');
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  async function créer() {
    if (!form.client_nom.trim()) return;
    setEnVent(true);
    try {
      await appeller('/api/mandats', { action: 'creer', ...form });
      setForm({ client_nom: '', lieu: '', client_tel: '', debut: '', fin: '' });
      setCréation(false);
      await charger();
    } catch { setErreur('La création a échoué'); }
    finally { setEnVent(false); }
  }

  async function générerCode(mandatId: string) {
    await appeller('/api/codes', { action: 'generer', mandat_id: mandatId }).catch(() => setErreur('La génération a échoué'));
    await charger();
  }

  async function révoquer(codeId: string) {
    if (!confirm('Révoquer ce code ? Le lien du client cesse de fonctionner sur l\'heure.')) return;
    await appeller('/api/codes', { action: 'revoquer', id: codeId }).catch(() => {});
    await charger();
  }

  async function régler(mandat: Mandat, maj: Partial<{ categories_diffusees: string[] | null; chrono_visible: boolean }>) {
    await appeller('/api/mandats', { action: 'regler', id: mandat.id, ...maj }).catch(() => {});
    await charger();
  }

  async function terminer(mandatId: string) {
    if (!confirm('Terminer le mandat ? Ses codes d\'accès meurent avec lui.')) return;
    await appeller('/api/mandats', { action: 'terminer', id: mandatId }).catch(() => {});
    await charger();
  }

  // LE PARTAGE QUI PARLE — le propriétaire reçoit un message, jamais
  // une URL nue : le feuilleton arrive avec ses explications. Mobile :
  // la feuille native de partage (SMS, WhatsApp…) ; sinon le message
  // se copie, lien dedans.
  function messagePour(c: Code) {
    const lien = `${window.location.origin}/j/${c.code}`;
    const fin = c.expire_le ? new Date(c.expire_le).toLocaleDateString('fr-FR') : null;
    return `Bonjour, suivez le travail en direct chez vous — chaque passage arrive en photos horodatées : ${lien}${fin ? ` (jusqu'au ${fin})` : ''}`;
  }

  async function partager(c: Code) {
    const texte = messagePour(c);
    try {
      if (navigator.share) { await navigator.share({ title: 'JOBLIVE', text: texte }); return; }
    } catch { return; } // feuille fermée par le pro — rien à faire
    navigator.clipboard?.writeText(texte).then(() => {
      setPartagé(c.code);
      setTimeout(() => setPartagé(null), 1800);
    }).catch(() => {});
  }

  function lienSMS(m: Mandat, c: Code) {
    const nu = (m.client_tel ?? '').replace(/[^+\d]/g, '');
    return `sms:${nu}?&body=${encodeURIComponent(messagePour(c))}`;
  }

  const actifs = mandats?.filter((m) => m.statut === 'actif') ?? [];
  const passés = mandats?.filter((m) => m.statut !== 'actif') ?? [];

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-vert-nuit px-5 pt-5 pb-6">
        <div className="mx-auto max-w-2xl">
          <Link href="/pro" className="text-xs font-semibold text-pierre/60">← Journal</Link>
          <h1 className="mt-2 font-titre text-2xl font-bold text-pierre">Mandats & codes</h1>
          <p className="text-sm text-pierre/60">Chaque client, son mandat — chaque mandat, ses codes mortels.</p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {erreur && <p className="mt-4 rounded-champ bg-vermillon-voile px-4 py-3 text-sm text-vermillon">{erreur}</p>}

        <button
          onClick={() => setCréation(!création)}
          className="mt-5 w-full rounded-full border-[1.5px] border-vert py-3 font-titre text-base font-semibold text-vert transition hover:bg-vert-voile"
        >
          {création ? 'Fermer' : '+ Nouveau mandat'}
        </button>

        {création && (
          <div className="carte-preuve mt-3 space-y-3 p-5">
            {([
              ['client_nom', 'Le client', 'Mme Valmont'],
              ['lieu', 'Le lieu', 'Villa Oscar, 12 rue des Roses'],
              ['client_tel', 'Téléphone (optionnel)', '06 12 34 56 78'],
            ] as const).map(([cle, label, ph]) => (
              <div key={cle}>
                <label className="block text-sm font-bold text-vert" htmlFor={cle}>{label}</label>
                <input
                  id={cle}
                  value={(form as any)[cle]}
                  onChange={(e) => setForm({ ...form, [cle]: e.target.value })}
                  placeholder={ph}
                  className="mt-1 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert focus:ring-[3px] focus:ring-vert/10"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-vert" htmlFor="debut">Début</label>
                <input id="debut" type="date" value={form.debut} onChange={(e) => setForm({ ...form, debut: e.target.value })}
                  className="mt-1 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 outline-none focus:border-vert" />
              </div>
              <div>
                <label className="block text-sm font-bold text-vert" htmlFor="fin">Fin (le code meure ce soir-là)</label>
                <input id="fin" type="date" value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })}
                  className="mt-1 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 outline-none focus:border-vert" />
              </div>
            </div>
            <button onClick={créer} disabled={enVent || !form.client_nom.trim()}
              className="w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white transition hover:opacity-92 disabled:opacity-40">
              {enVent ? 'Création…' : 'Ouvrir le mandat'}
            </button>
          </div>
        )}

        {/* LES MANDATS ACTIFS */}
        {!mandats && <p className="mt-8 text-center text-sm text-graphite">Chargement…</p>}
        {mandats && actifs.length === 0 && !création && (
          <p className="mt-6 rounded-carte bg-white px-4 py-5 text-center text-sm text-graphite">
            Aucun mandat actif. Le premier client attend sa ligne.
          </p>
        )}

        {actifs.map((m) => (
          <section key={m.id} className="carte-preuve mt-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-titre text-lg font-bold text-vert">{m.client_nom}</h2>
                <p className="truncate text-sm text-graphite">{m.lieu}</p>
                {(m.debut || m.fin) && (
                  <p className="horodatage mt-0.5 text-xs text-graphite">
                    {m.debut ? new Date(m.debut).toLocaleDateString('fr-FR') : '…'} → {m.fin ? new Date(m.fin).toLocaleDateString('fr-FR') : 'sans fin'}
                  </p>
                )}
              </div>
              <button onClick={() => terminer(m.id)} className="shrink-0 rounded-full bg-vert-voile px-3 py-1.5 text-xs font-bold text-vert transition hover:bg-vermillon-voile hover:text-vermillon">
                Terminer
              </button>
            </div>

            {/* LES CODES — mortels par nature */}
            <div className="mt-4 rounded-carte bg-pierre p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-vert"><Icône d={P_CLE} taille={16} /> Codes d&apos;accès client</p>
                <button onClick={() => générerCode(m.id)} className="rounded-full bg-vert px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-92">+ Générer</button>
              </div>
              {m.codes.length === 0 && <p className="mt-2 text-xs text-graphite">Aucun code — le journal du client est fermé.</p>}
              {m.codes.map((c) => {
                const mort = !!c.revoque_le || (!!c.expire_le && new Date(c.expire_le) < new Date());
                return (
                  <div key={c.id} className={`mt-2 rounded-champ bg-white px-3 py-2.5 ${mort ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="horodatage text-lg font-bold tracking-[0.12em] text-vert">{codeAffiché(c.code)}</p>
                      <div className="flex gap-2">
                        {!mort && (
                          <button onClick={() => partager(c)} className="rounded-full bg-vert px-3 py-1 text-xs font-bold text-white transition hover:opacity-92">
                            {partagé === c.code ? 'copié ✓' : 'envoyer'}
                          </button>
                        )}
                        {!mort && m.client_tel && (
                          <a href={lienSMS(m, c)} className="rounded-full bg-vert-voile px-3 py-1 text-xs font-bold text-vert">
                            SMS
                          </a>
                        )}
                        {!mort && (
                          <button onClick={() => révoquer(c.id)} className="rounded-full bg-vermillon-voile px-3 py-1 text-xs font-bold text-vermillon">révoquer</button>
                        )}
                      </div>
                    </div>
                    <p className="horodatage mt-0.5 text-[10px] text-graphite">
                      {mort ? 'mort —' : ''} {c.revoque_le ? `révoqué le ${new Date(c.revoque_le).toLocaleDateString('fr-FR')}` : c.expire_le ? `expire le ${new Date(c.expire_le).toLocaleDateString('fr-FR')} à minuit` : 'sans expiration'}
                      {c.vu_le && !mort ? ` · vu par le client à ${heure(c.vu_le)}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* LA DOSE */}
            <button onClick={() => setDoseOuverte(doseOuverte === m.id ? null : m.id)} className="mt-3 w-full py-2 text-sm font-bold text-vert transition hover:text-vermillon">
              {doseOuverte === m.id ? 'fermer la transparence ▲' : 'régler la transparence ▼'}
            </button>
            {doseOuverte === m.id && (
              <div className="mt-1 rounded-carte border border-pierre-sombre bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-vert">Ce que le client voit</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATÉGORIES.map((c) => {
                    const tout = m.categories_diffusees === null;
                    const actif = tout || m.categories_diffusees!.includes(c.cle);
                    return (
                      <button key={c.cle}
                        onClick={() => {
                          const tout = m.categories_diffusees === null;
                          const actuelles = tout ? CATÉGORIES.map((x) => x.cle) : [...m.categories_diffusees!];
                          const prochain = actif ? actuelles.filter((x) => x !== c.cle) : [...actuelles, c.cle];
                          régler(m, { categories_diffusees: prochain.length === 0 ? [] : prochain });
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${actif ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-graphite'}`}>
                        {c.label} {actif ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
                {m.categories_diffusees !== null && m.categories_diffusees.length === 0 && (
                  <p className="mt-2 text-xs text-vermillon">Le client ne voit RIEN — la fermeture totale est un choix, pas un accident.</p>
                )}
                <label className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-encre">Le chrono se montre au client</span>
                  <input type="checkbox" checked={m.chrono_visible}
                    onChange={(e) => régler(m, { chrono_visible: e.target.checked })}
                    className="h-6 w-11 cursor-pointer appearance-none rounded-full bg-pierre-sombre transition checked:bg-vert relative after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition checked:after:translate-x-5" />
                </label>
              </div>
            )}
          </section>
        ))}

        {/* LES PASSÉS — pliés, honorés */}
        {passés.length > 0 && (
          <section className="mt-6">
            <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-graphite">Mandats passés</h2>
            {passés.map((m) => (
              <div key={m.id} className="mt-2 rounded-carte border border-pierre-sombre bg-white/60 px-4 py-3 opacity-70">
                <p className="font-titre text-sm font-bold text-vert">{m.client_nom}{m.lieu ? ` · ${m.lieu}` : ''}</p>
                <p className="text-xs text-graphite">mandat terminé</p>
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
          <Link href="/pro/mandats" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-vert">
            <Icône d={P_CLE} taille={20} />
            <span className="text-[10px] font-bold">Mandats & codes</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
