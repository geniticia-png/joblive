import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// LA MISSION DE MARIE (19/11 nuit, étape ③-bis) — l'écran du tier,
// SANS COMPTE : le jeton est le droit d'agir (le patron des codes
// clients). Marie ouvre /m/<jeton> : sa mission, ses éléments à
// cocher, ses photos horodatées à la prise, et le geste final.
// La mission morte (faite/annulée) ferme le lien. Le tier ne voit
// JAMAIS les drapeaux ●○ — la dose est l'affaire de la conciergerie.
// ═══════════════════════════════════════════════════════════════════

async function missionDuJeton(jeton: string) {
  const sb = getSupabaseService();
  const { data } = await sb.from('missions')
    .select('id, titre, statut, prevue_le, fermee_le, prix, conditions, accepte_le, tiers(nom), mandats(client_nom, lieu), mission_elements(id, libelle, genre, fait, ordre), mission_preuves(id, chemin, horodatage, element_id)')
    .eq('jeton', jeton.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .maybeSingle();
  return data ?? null;
}

export async function GET(_req: Request, { params }: { params: { jeton: string } }) {
  const mission = await missionDuJeton(params.jeton);
  if (!mission) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
  const vivante = mission.statut === 'a_faire' || mission.statut === 'en_cours';
  return NextResponse.json({ mission: { ...mission, vivante } });
}

export async function POST(req: Request, { params }: { params: { jeton: string } }) {
  const sb = getSupabaseService();
  const mission = await missionDuJeton(params.jeton);
  if (!mission) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
  if (mission.statut !== 'a_faire' && mission.statut !== 'en_cours') {
    return NextResponse.json({ erreur: 'mission close' }, { status: 403 });
  }

  // LA PORTE DE L'ACCEPTATION, VOLET PHOTO — la photo est un geste :
  // elle attend la signature comme les autres (la garde est serveur).
  if (req.headers.get('content-type')?.includes('multipart/form-data') && !mission.accepte_le) {
    return NextResponse.json({ erreur: 'à accepter' }, { status: 403 });
  }

  // la photo : multipart (horodatage à la prise, le bucket des preuves).
  // (011) Le champ optionnel `element` lie la photo à SON geste — la
  // preuve du travail point par point ; sans lui, la photo reste libre
  // de mission (l'ancien comportement, rétro-compatible).
  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await req.formData();
    const fichier = form.get('fichier') as File | null;
    const horodatage = form.get('horodatage');
    const element = form.get('element');
    if (!fichier || !fichier.size || fichier.size > 8 * 1024 * 1024) {
      return NextResponse.json({ erreur: 'photo' }, { status: 400 });
    }
    // L'élément, s'il est invoqué, appartient-il à cette mission ?
    // (la même garde qu'element-fait — jamais un geste d'ailleurs.)
    if (element && typeof element === 'string' && element) {
      const élément = (mission.mission_elements ?? []).find((e: any) => e.id === element);
      if (!élément) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
    }
    const extension = (fichier.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const chemin = `${mission.id}/${crypto.randomUUID()}.${extension}`;
    const octets = new Uint8Array(await fichier.arrayBuffer());
    const { error } = await sb.storage.from('preuves').upload(chemin, octets, {
      contentType: fichier.type || 'image/jpeg', upsert: false,
    });
    if (error) return NextResponse.json({ erreur: 'stockage' }, { status: 500 });
    await sb.from('mission_preuves').insert({
      mission_id: mission.id,
      chemin,
      horodatage: typeof horodatage === 'string' && horodatage ? horodatage : new Date().toISOString(),
      element_id: typeof element === 'string' && element ? element : null,
    });
    return NextResponse.json({ ok: true, chemin });
  }

  const corps = await req.json().catch(() => ({}));

  // LA PORTE DE L'ACCEPTATION (20/11 4ᵉ) — l'ordre de mission se lit,
  // puis se signe : aucun geste avant accepte_le. La garde est
  // SERVEUR — l'écran du tier n'est que la politesse.
  if (corps.action !== 'accepter' && !mission.accepte_le) {
    return NextResponse.json({ erreur: 'à accepter' }, { status: 403 });
  }

  switch (corps.action) {
    case 'accepter': {
      // la signature se pose UNE fois — la trace ne se réécrit pas
      if (mission.accepte_le) return NextResponse.json({ ok: true });
      await sb.from('missions')
        .update({ accepte_le: new Date().toISOString(), statut: mission.statut === 'a_faire' ? 'en_cours' : mission.statut })
        .eq('id', mission.id);
      return NextResponse.json({ ok: true });
    }
    case 'element-fait': {
      // l'élément appartient-il à cette mission ?
      const élément = (mission.mission_elements ?? []).find((e: any) => e.id === corps.id);
      if (!élément) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      await sb.from('mission_elements').update({ fait: !!corps.fait }).eq('id', corps.id);
      return NextResponse.json({ ok: true });
    }
    case 'photo-supprimer': {
      const preuve = (mission.mission_preuves ?? []).find((p: any) => p.id === corps.id);
      if (!preuve) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      await sb.storage.from('preuves').remove([preuve.chemin]);
      await sb.from('mission_preuves').delete().eq('id', corps.id);
      return NextResponse.json({ ok: true });
    }
    case 'terminer': {
      await sb.from('missions')
        .update({ statut: 'faite', fermee_le: new Date().toISOString() })
        .eq('id', mission.id);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
}
