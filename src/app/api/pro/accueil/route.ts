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

  const [{ data: mandats }, { data: interventions }] = await Promise.all([
    sb.from('mandats')
      .select('id, client_nom, lieu, client_tel, statut, debut, fin, categories_diffusees, chrono_visible, codes(id, code, expire_le, revoque_le, vu_le)')
      .eq('pro_id', pro.id)
      .order('cree_le', { ascending: false }),
    sb.from('interventions')
      .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage)')
      .eq('statut', 'en_cours')
      .order('debut_le', { ascending: false }),
  ]);

  // Le journal du jour : les publiées d'aujourd'hui, tous mandats.
  const début = new Date(); début.setHours(0, 0, 0, 0);
  const { data: publiées } = await sb
    .from('interventions')
    .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage), reactions(id, genre, cree_le)')
    .eq('statut', 'publie')
    .gte('publie_le', début.toISOString())
    .order('publie_le', { ascending: false });

  return NextResponse.json({ pro, mandats: mandats ?? [], enCours: interventions ?? [], journal: (publiées ?? []).slice(0, 5) });
}
