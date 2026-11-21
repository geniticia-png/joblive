import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// GET — L'ACCUEIL DU PRO : ses mandats (avec le dernier regard du
// client), le journal du jour (publiées + en cours). Le CTA règne
// en haut : ce qu'on charge ne doit jamais le noyer (leçon Stitch).
export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();

  const [{ data: mandats }, { data: interventions }, { data: missionsFaites }] = await Promise.all([
    sb.from('mandats')
      .select('id, client_nom, client_id, lieu, client_tel, statut, debut, fin, categories_diffusees, chrono_visible, unit_resacap, saison_visible, commission_pct, frais_fixes, revenus_visible, clients(type), codes(id, code, expire_le, revoque_le, vu_le)')
      .eq('pro_id', pro.id)
      .order('cree_le', { ascending: false }),
    sb.from('interventions')
      .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage)')
      .eq('statut', 'en_cours')
      .eq('mandats.pro_id', pro.id)
      .order('debut_le', { ascending: false }),
    // LE TRAVAIL INDIRECT TERMINÉ (20/11) — les dernières missions
    // faites par les tiers : le centre doit voir sans chercher (le
    // client voyait, pas la conciergerie). vue_le suit codes.vu_le.
    sb.from('missions')
      .select('id, titre, statut, fermee_le, vue_le, tiers(nom), mandats(client_nom, lieu), mission_elements(id, fait), mission_preuves(id, chemin, horodatage)')
      .eq('pro_id', pro.id)
      .eq('statut', 'faite')
      .order('fermee_le', { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  // Le journal du jour : les publiées d'aujourd'hui, tous SES mandats —
  // (20/11 : le filtre pro manquait, chaque pro voyait les publications
  // des autres ; la doctrine exige le filtre côté serveur).
  const début = new Date(); début.setHours(0, 0, 0, 0);
  const { data: publiées } = await sb
    .from('interventions')
    .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage), reactions(id, genre, cree_le)')
    .eq('statut', 'publie')
    .eq('mandats.pro_id', pro.id)
    .gte('publie_le', début.toISOString())
    .order('publie_le', { ascending: false });

  const mandatsPlats = (mandats ?? []).map((m: any) => ({
    ...m,
    client_type: m.clients?.type ?? null,
    clients: undefined,
  }));
  return NextResponse.json({
    pro, mandats: mandatsPlats, enCours: interventions ?? [],
    journal: (publiées ?? []).slice(0, 5),
    missionsFaites: missionsFaites ?? [],
  });
}
