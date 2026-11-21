import { getSupabaseService } from '@/lib/supabase';
import { saisonResacap } from '@/lib/pont-resacap';
import { Timeline, EntréeMorte } from './vue';
import type { Entrée, Saison } from './vue';

// ═══════════════════════════════════════════════════════════════════
// LA TIMELINE CLIENT (le cœur — lecture pure). Le code ouvre, le
// serveur vérifie (mort ? révoqué ? mandat vivant ?), filtre LA DOSE
// (catégories diffusées, chrono), et marque le regard (vu_le) — la
// boucle des deux sens : le pro sait que sa preuve est vue.
// ═══════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { code: string } }) {
  const nu = params.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let données: { client: string; lieu: string; fin: string | null; par: string | null; entrées: Entrée[]; saison: Saison | null } | null = null;

  try {
    const sb = getSupabaseService();
    const { data: accès } = await sb.from('codes')
      .select('id, mandat_id, expire_le, revoque_le, mandats(id, client_nom, lieu, statut, fin, categories_diffusees, chrono_visible, unit_resacap, saison_visible, pro_id, pros(nom, enseigne, email_resacap))')
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
      let saison: Saison | null = null;
      if (mandat.unit_resacap && mandat.saison_visible && (mandat.pros as any)?.email_resacap) {
        const jMA = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const début = new Date(maintenant); début.setDate(début.getDate() - 62);
        const fin = new Date(maintenant); fin.setFullYear(fin.getFullYear() + 1);
        try {
          const r = await saisonResacap((mandat.pros as any).email_resacap, mandat.unit_resacap.id, jMA(début), jMA(fin));
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

      données = {
        client: mandat.client_nom,
        lieu: mandat.lieu ?? '',
        fin: accès.expire_le,
        par: pro ? (pro.enseigne || pro.nom) : null,
        entrées: [...entrées, ...entréesMissions],
        saison,
      };
    }
  } catch {
    // Sans soudure, la page rend l'état d'attente — jamais un crash.
  }

  if (!données) return <EntréeMorte />;
  return <Timeline code={nu} données={données} />;
}
