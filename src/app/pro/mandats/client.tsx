'use client';

import QRCode from 'qrcode';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { appeller } from '@/lib/appels';
import { CATÉGORIES, heure } from '@/lib/format';
import { Icône, P_CLE, P_JOURNAL, P_LIVRE, P_EQUIPE } from '@/lib/icones';

// LES MANDATS — le lien vivant pro ↔ client. Chaque mandat porte :
// ses codes d'accès (mortels : révocables, expirant à la fin), et LA
// DOSE — quelles catégories se diffusent, si le chrono se montre.
// La transparence est l'outil du pro, pas son procureur.

type Code = { id: string; code: string; expire_le: string | null; revoque_le: string | null; vu_le: string | null };
type Fiche = { id: string; nom: string; type: string; telephone: string | null };
type Mandat = {
  id: string; client_nom: string; lieu: string; client_tel: string | null; client_type: string | null; statut: string;
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
  const [form, setForm] = useState({ lieu: '', debut: '', fin: '' });
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [ficheChoisie, setFicheChoisie] = useState<string | null>(null); // id de fiche, ou 'nouveau'
  const [nouveau, setNouveau] = useState({ nom: '', type: 'regulier', tel: '' });
  const [enVent, setEnVent] = useState(false);
  const [partagé, setPartagé] = useState<string | null>(null);
  const [doseOuverte, setDoseOuverte] = useState<string | null>(null);
  const [qrOuvert, setQrOuvert] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const d = await appeller<{ mandats: Mandat[] }>('/api/pro/accueil', undefined, 'GET');
      setMandats(d.mandats);
      const f = await appeller<{ clients: Fiche[] }>('/api/clients', undefined, 'GET');
      setFiches(f.clients);
    } catch (e) {
      if (e instanceof Error && e.message === 'session') {
        await getSupabase().auth.signOut().catch(() => {});
        router.replace('/connexion');
      } else setErreur('Le chargement a échoué');
    }
  }, [router]);

  useEffect(() => { charger(); }, [charger]);

  async function créer() {
    setEnVent(true);
    try {
      // la fiche : choisie parmi les siennes, ou née maintenant
      // (l'étape ① de la vision : régulier ou occasionnel)
      let id = ficheChoisie;
      let nom = '';
      let tel = '';
      if (id === 'nouveau') {
        if (!nouveau.nom.trim()) { setEnVent(false); return; }
        const r = await appeller<{ client: Fiche }>('/api/clients', { action: 'creer', nom: nouveau.nom.trim(), type: nouveau.type, telephone: nouveau.tel.trim() });
        id = r.client.id; nom = r.client.nom; tel = r.client.telephone ?? '';
      } else if (id) {
        const fiche = fiches.find((f) => f.id === id);
        if (!fiche) { setEnVent(false); return; }
        nom = fiche.nom; tel = fiche.telephone ?? '';
      } else { setEnVent(false); return; }
      await appeller('/api/mandats', { action: 'creer', client_id: id, client_nom: nom, client_tel: tel, ...form });
      setForm({ lieu: '', debut: '', fin: '' });
      setFicheChoisie(null);
      setNouveau({ nom: '', type: 'regulier', tel: '' });
      setCréation(false);
      await charger();
    } catch { setErreur('La création a échoué'); }
    finally { setEnVent(false); }
  }

  async function générerCode(mandatId: string) {
    await appeller('/api/codes', { action: 'generer', mandat_id: mandatId }).catch(() => setErreur('La génération a échoué'));
    await charger();
  }

  // LE QR DE LA REMISE DES CLÉS — le pro montre, le propriétaire scanne,
  // son journal s'ouvre. (Dessiné dans un canvas au moment de l'ouverture.)
  function dessinerQR(code: string) {
    const canvas = document.getElementById('qr-' + code) as HTMLCanvasElement | null;
    if (!canvas) return;
    QRCode.toCanvas(canvas, `${window.location.origin}/j/${code}`, {
      width: 240, margin: 1, color: { dark: '#123F3D', light: '#F4F5F3' },
    }).catch(() => {});
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
            <div>
              <p className="text-sm font-bold text-vert">Le client</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {fiches.map((f) => (
                  <button key={f.id} type="button"
                    onClick={() => setFicheChoisie(ficheChoisie === f.id ? null : f.id)}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${ficheChoisie === f.id ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert hover:bg-vert-voile'}`}>
                    {f.nom}{f.type === 'regulier' ? ' ●' : ' ○'}
                  </button>
                ))}
                <button type="button"
                  onClick={() => setFicheChoisie(ficheChoisie === 'nouveau' ? null : 'nouveau')}
                  className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${ficheChoisie === 'nouveau' ? 'border-vert bg-vert text-white' : 'border-dashed border-vert bg-white text-vert hover:bg-vert-voile'}`}>
                  + Nouveau client
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-graphite">● régulier · ○ occasionnel — la fiche vit, les mandats s'y rattachent.</p>
              {ficheChoisie === 'nouveau' && (
                <div className="mt-3 space-y-3 rounded-carte bg-pierre p-3.5">
                  <input
                    value={nouveau.nom}
                    onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
                    placeholder="M. et Mme Rossignol"
                    aria-label="Nom du nouveau client"
                    className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert"
                  />
                  <div className="flex gap-2">
                    {([['regulier', '● Régulier'], ['occasionnel', '○ Occasionnel']] as const).map(([cle, label]) => (
                      <button key={cle} type="button"
                        onClick={() => setNouveau({ ...nouveau, type: cle })}
                        className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${nouveau.type === cle ? 'border-vert bg-vert text-white' : 'border-pierre-sombre bg-white text-vert'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    value={nouveau.tel}
                    onChange={(e) => setNouveau({ ...nouveau, tel: e.target.value })}
                    placeholder="Téléphone (optionnel)"
                    aria-label="Téléphone du nouveau client"
                    className="w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-vert" htmlFor="lieu">Le lieu</label>
              <input
                id="lieu"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                placeholder="Studio Les Pins, Sainte-Maxime"
                className="mt-1 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3 text-base outline-none focus:border-vert focus:ring-[3px] focus:ring-vert/10"
              />
            </div>
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
            <button onClick={créer} disabled={enVent || !ficheChoisie || (ficheChoisie === 'nouveau' && !nouveau.nom.trim())}
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
                <h2 className="font-titre text-lg font-bold text-vert">{m.client_nom} <span className={`ml-1 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold ${m.client_type === 'regulier' ? 'bg-vert text-white' : 'bg-vert-voile text-vert'}`}>{m.client_type === 'regulier' ? 'RÉGULIER' : 'OCCASIONNEL'}</span></h2>
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
                          <button onClick={() => { setQrOuvert(qrOuvert === c.code ? null : c.code); setTimeout(() => dessinerQR(c.code), 30); }} className="rounded-full bg-vert-voile px-3 py-1 text-xs font-bold text-vert">
                            QR
                          </button>
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
                    {qrOuvert === c.code && !mort && (
                      <div className="mt-3 rounded-carte bg-pierre p-4 text-center">
                        <canvas id={'qr-' + c.code} className="mx-auto rounded-champ" />
                        <p className="mt-2 text-xs leading-relaxed text-graphite">
                          La remise des clés&nbsp;: le propriétaire scanne, son journal s&apos;ouvre.<br />
                          <span className="horodatage text-[10px] text-vert">{`${typeof window !== 'undefined' ? window.location.origin : ''}/j/${c.code}`}</span>
                        </p>
                      </div>
                    )}
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
          <Link href="/pro/catalogue" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_LIVRE} taille={20} />
            <span className="text-[10px] font-bold">Catalogue</span>
          </Link>
          <Link href="/pro/missions" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-graphite transition hover:text-vert">
            <Icône d={P_EQUIPE} taille={20} />
            <span className="text-[10px] font-bold">Missions</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
