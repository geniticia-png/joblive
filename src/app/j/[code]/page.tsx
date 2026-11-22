import { getSupabaseService } from '@/lib/supabase';
import { saisonResacap, periodeResacap, incidentsResacap } from '@/lib/pont-resacap';
import type { Incident } from '@/lib/pont-resacap';
import { Timeline, EntréeMorte } from './vue';
import type { Entrée, Saison, Revenus } from './vue';

// ═══════════════════════════════════════════════════════════════════
// LA TIMELINE CLIENT (le cœur — lecture pure). Le code ouvre, le
// serveur vérifie (mort ? révoqué ? mandat vivant ?), filtre LA DOSE
// (catégories diffusées, chrono), et marque le regard (vu_le) — la
// boucle des deux sens : le pro sait que sa preuve est vue.
// ═══════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { code: string } }) {
  const nu = params.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let données: { client: string; lieu: string; fin: string | null; par: string | null; entrées: Entrée[]; saison: Saison | null; revenus: Revenus | null } | null = null;

  try {
    const sb = getSupabaseService();
    const { data: accès } = await sb.from('codes')
      .select('id, mandat_id, expire_le, revoque_le, mandats(id, client_nom, lieu, statut, fin, categories_diffusees, chrono_visible, unit_resacap, saison_visible, commission_pct, frais_fixes, revenus_visible, pro_id, pros(nom, enseigne, email_resacap))')
      .eq('code', nu)
      .maybeSingle();

    const maintenant = new Date();
    const mandat = accès ? (accès.mandats as any) : null;
    const valide = accès && mandat
      && !accès.revoque_le
      && (!accès.expire_le || new Date(accès.expire_le) > maintenant)
      && mandat.statut === 'actif';

    if (valide && accès) {
      // LA DOSE — le pro a choisi ce qui se diffuse.
      const filtrées = Array.isArray(mandat.categories_diffusees) ? mandat.categories_diffusees : null;
      const { data: interventions } = await sb.from('interventions')
        .select('id, categorie, note, statut, publie_le, duree_secondes, preuves(id, genre, chemin, horodatage), reactions(id, intervention_id, cree_le)')
        .eq('mandat_id', mandat.id)
        .eq('statut', 'publie')
        .order('publie_le', { ascending: false })
        .limit(60);

      // ═══ L'AVAL (étape ④ de la vision) — le travail INDIRECT : les
      // missions du mandat, filtrées par les drapeaux ● (joblivise).
      // Le propriétaire voit les gestes faits + les photos ; jamais le
      // nom du tiers — la conciergerie reste le visage. Une mission
      // entièrement interne n'apparaît pas : c'est la dose.
      const { data: missionsData } = await sb.from('missions')
        .select('id, titre, statut, fermee_le, prevue_le, mission_elements(id, libelle, fait, joblivise), mission_preuves(id, chemin, horodatage)')
        .eq('mandat_id', mandat.id)
        .in('statut', ['en_cours', 'faite'])
        .order('fermee_le', { ascending: false, nullsFirst: false });
      const entréesMissions: Entrée[] = (missionsData ?? [])
        .filter((mm: any) => (mm.mission_elements ?? []).some((el: any) => el.joblivise) || (mm.mission_preuves ?? []).length > 0)
        .map((mm: any) => {
          const faits = (mm.mission_elements ?? []).filter((el: any) => el.joblivise && el.fait);
          const enCours = mm.statut === 'en_cours';
          return {
            id: 'm-' + mm.id,
            categorie: 'mission',
            libellé: mm.titre,
            enCours,
            note: faits.length > 0 ? faits.map((el: any) => el.libelle).join(' · ') : '',
            publie_le: enCours ? maintenant.toISOString() : (mm.fermee_le ?? mm.prevue_le ?? maintenant.toISOString()),
            durée: null,
            photos: (mm.mission_preuves ?? []).map((pp: any) => ({
              id: pp.id, genre: 'travail', chemin: pp.chemin, horodatage: pp.horodatage,
            })),
            réaction: null,
          };
        });

      // Le regard du client — humble mais précieux pour le pro.
      await sb.from('codes').update({ vu_le: maintenant.toISOString() }).eq('id', accès.id);

      const entrées: Entrée[] = (interventions ?? [])
        .filter((i: any) => !filtrées || filtrées.includes(i.categorie))
        .map((i: any) => ({
          id: i.id,
          categorie: i.categorie,
          note: i.note,
          publie_le: i.publie_le,
          durée: mandat.chrono_visible ? i.duree_secondes : null,
          photos: (i.preuves ?? []).map((p: any) => ({ id: p.id, genre: p.genre, chemin: p.chemin, horodatage: p.horodatage })),
          réaction: (i.reactions ?? [])[0]?.cree_le ?? null,
        }));

      const pro = mandat.pros as { nom: string; enseigne: string | null } | null;

      // LA SAISON DU BIEN (21/11) — la conciergerie a lié un bien
      // RésaCap ET ouvert la dose : la page porte le calendrier, les
      // nuitées, les canaux. Jamais un échec du pont ne casse le
      // journal — la saison est un cadeau, pas une dalle.
      const jMA = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let saison: Saison | null = null;
      let revenus: Revenus | null = null;
      const emailResacap = (mandat.pros as any)?.email_resacap;
      const bienLié = mandat.unit_resacap && emailResacap;
      if (bienLié && mandat.saison_visible) {
        const début = new Date(maintenant); début.setDate(début.getDate() - 62);
        const fin = new Date(maintenant); fin.setFullYear(fin.getFullYear() + 1);
        try {
          const r = await saisonResacap(emailResacap, mandat.unit_resacap.id, jMA(début), jMA(fin));
          if (r?.ok) {
            saison = {
              bien: r.bien,
              sejours: (r.sejours ?? []).map((s: { debut: string; fin: string; canal: string | null }) =>
                ({ debut: s.debut, fin: s.fin, canal: s.canal })),
              canaux: r.canaux ?? [],
            };
          }
        } catch { /* muet par conception */ }
      }

      // ── (22/11) LE PONT DES INCIDENTS — la preuve voyageur déjà
      // traitée par la conciergerie : les incidents CLOS du bien, frais
      // compris. Ils vivent dans LA TIMELINE (le propriétaire déjà
      // informé) et nourrissent LES PROVISIONS de la décomposition.
      // Un seul appel sur l'année civile — le mois se filtre localement.
      const débutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
      const débutAn = new Date(maintenant.getFullYear(), 0, 1);
      const finAn = new Date(maintenant.getFullYear() + 1, 0, 1);
      let incidents: Incident[] = [];
      if (bienLié) {
        try {
          const r = await incidentsResacap(emailResacap, mandat.unit_resacap.id, jMA(débutAn), jMA(finAn));
          if (r?.ok) incidents = r.incidents ?? [];
        } catch { /* muet par conception */ }
      }
      const entréesIncidents: Entrée[] = incidents.map((inc, k) => ({
        id: 'inc-' + k,
        categorie: 'incident',
        note: inc.frais?.length
          ? `${inc.description} — remplacé : ${inc.frais.map((f) => `${f.libelle} (${f.montant.toLocaleString('fr-FR')} €)`).join(', ')}`
          : inc.description,
        publie_le: inc.date + 'T12:00:00',
        durée: null,
        photos: (inc.photos ?? []).map((u, j) => ({ id: 'incp-' + k + '-' + j, genre: 'incident', chemin: u, horodatage: inc.date + 'T12:00:00' })),
        réaction: null,
      }));

      // LES REVENUS (21/11, brique ③) — le moteur nourrit, le modèle
      // négocié (commission + frais fixes, SUR LE MANDAT) soustrait :
      // revenu net = CA − dépenses du bien − frais conciergerie −
      // PROVISIONS (frais d'incidents clos). Le propriétaire voit le
      // résultat, jamais les règles.
      if (bienLié && mandat.revenus_visible) {
        try {
          const [pM, pA] = await Promise.all([
            periodeResacap(emailResacap, mandat.unit_resacap.id, jMA(débutMois), jMA(finMois)),
            periodeResacap(emailResacap, mandat.unit_resacap.id, jMA(débutAn), jMA(finAn)),
          ]);
          // LES PROVISIONS — les frais des incidents CLOS de la fenêtre
          // (déclarés par le voyageur, traités et clos par la
          // conciergerie : la preuve était déjà dans le journal).
          const provisionsFenêtre = (du: string, au: string) => incidents
            .filter((i) => i.date >= du && i.date < au)
            .flatMap((i, k) => (i.frais ?? []).map((f, j) => ({ libelle: `${f.libelle}`, montant: Number(f.montant) || 0, cle: `${i.date}-${k}-${j}` })));
          const calcule = (p: { ca?: number; nb_sejours?: number; depenses?: { montant: number }[] }, nbMois: number,
                           provisions: { libelle: string; montant: number; cle: string }[]) => {
            const ca = Number(p.ca) || 0;
            const dépenses = (p.depenses ?? []).reduce((s: number, d: { montant: number }) => s + Number(d.montant || 0), 0);
            const commission = mandat.commission_pct != null ? (Number(mandat.commission_pct) / 100) * ca : 0;
            const fraisDétail = (mandat.frais_fixes ?? []).map((f: any) => {
              const nb = Number(p.nb_sejours) || 0;
              if (f.base === 'sejour') return { libelle: `${f.libelle} (× ${nb})`, montant: f.montant * nb };
              // les frais « par mois » se multiplient sur la fenêtre
              return { libelle: nbMois > 1 ? `${f.libelle} (× ${nbMois} mois)` : f.libelle, montant: f.montant * nbMois };
            });
            const frais = fraisDétail.reduce((s: number, f: { montant: number }) => s + f.montant, 0);
            const provisionsTotal = provisions.reduce((s, f) => s + f.montant, 0);
            return {
              net: ca - dépenses - commission - frais - provisionsTotal,
              commission, fraisDétail,
              provisions: provisions.map(({ cle, ...f }) => { void cle; return f; }),
            };
          };
          const m = calcule(pM, 1, provisionsFenêtre(jMA(débutMois), jMA(finMois)));
          const a = calcule(pA, 12, provisionsFenêtre(jMA(débutAn), jMA(finAn)));
          revenus = {
            moisLabel: débutMois.toLocaleDateString('fr-FR', { month: 'long' }),
            netMois: Math.round(m.net),
            netAnnée: Math.round(a.net),
            ca: Math.round(Number(pM.ca) || 0),
            depenses: (pM.depenses ?? []).map((d: { categorie: string; montant: number }) => ({ categorie: d.categorie, montant: Math.round(Number(d.montant) || 0) })),
            commission: mandat.commission_pct != null ? Number(mandat.commission_pct) : null,
            commissionMontant: Math.round(m.commission),
            fraisDétail: m.fraisDétail.map((f: { libelle: string; montant: number }) => ({ libelle: f.libelle, montant: Math.round(f.montant) })),
            provisions: m.provisions.map((f: { libelle: string; montant: number }) => ({ libelle: f.libelle, montant: Math.round(f.montant) })),
            tva: Math.round(Number(pM.tva) || 0),
            taxe: Math.round(Number(pM.taxe) || 0),
          };
        } catch { /* muet par conception */ }
      }

      données = {
        client: mandat.client_nom,
        lieu: mandat.lieu ?? '',
        fin: accès.expire_le,
        par: pro ? (pro.enseigne || pro.nom) : null,
        // Les incidents (clos) rejoignent la Timeline APRÈS le filtre
        // de dose : leur publication était la CLOTURE chez la
        // conciergerie — pas une catégorie de travail à doser.
        entrées: [...entrées, ...entréesIncidents, ...entréesMissions],
        saison,
        revenus,
      };
    }
  } catch {
    // Sans soudure, la page rend l'état d'attente — jamais un crash.
  }

  if (!données) return <EntréeMorte />;
  return <Timeline code={nu} données={données} />;
}
