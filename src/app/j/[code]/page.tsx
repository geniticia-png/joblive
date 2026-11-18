import { getSupabaseService } from '@/lib/supabase';
import { Timeline, EntréeMorte } from './vue';
import type { Entrée } from './vue';

// ═══════════════════════════════════════════════════════════════════
// LA TIMELINE CLIENT (le cœur — lecture pure). Le code ouvre, le
// serveur vérifie (mort ? révoqué ? mandat vivant ?), filtre LA DOSE
// (catégories diffusées, chrono), et marque le regard (vu_le) — la
// boucle des deux sens : le pro sait que sa preuve est vue.
// ═══════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { code: string } }) {
  const nu = params.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let données: { client: string; lieu: string; fin: string | null; entrées: Entrée[] } | null = null;

  try {
    const sb = getSupabaseService();
    const { data: accès } = await sb.from('codes')
      .select('id, mandat_id, expire_le, revoque_le, mandats(id, client_nom, lieu, statut, fin, categories_diffusees, chrono_visible, pro_id, pros(nom))')
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

      données = {
        client: mandat.client_nom,
        lieu: mandat.lieu ?? '',
        fin: accès.expire_le,
        entrées,
      };
    }
  } catch {
    // Sans soudure, la page rend l'état d'attente — jamais un crash.
  }

  if (!données) return <EntréeMorte />;
  return <Timeline code={nu} données={données} />;
}
