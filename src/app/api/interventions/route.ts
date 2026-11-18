import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// LES INTERVENTIONS — GET ?id= (le détail en cours), POST actions
// creer / publier / annuler. Publier est un ACTE (le bouton
// vermillon), jamais un automatisme.
type Corps = {
  action: 'creer' | 'publier' | 'annuler';
  id?: string;
  mandat_id?: string;
  categorie?: string;
  note?: string;
  duree_secondes?: number | null;
};

async function interventionDuPro(sb: ReturnType<typeof getSupabaseService>, id: string, proId: string) {
  const { data } = await sb
    .from('interventions')
    .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats!inner(id, pro_id, client_nom, lieu, chrono_visible), preuves(id, genre, chemin, horodatage)')
    .eq('id', id)
    .eq('mandats.pro_id', proId)
    .maybeSingle();
  return data;
}

export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ erreur: 'id' }, { status: 400 });
  const data = await interventionDuPro(getSupabaseService(), id, pro.id);
  if (!data) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
  return NextResponse.json({ intervention: data });
}

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps: Corps = await req.json();

  if (corps.action === 'creer' && corps.mandat_id && corps.categorie) {
    // Le mandat doit être à lui ET vivant.
    const { data: mandat } = await sb.from('mandats')
      .select('id, statut').eq('id', corps.mandat_id).eq('pro_id', pro.id).maybeSingle();
    if (!mandat || mandat.statut !== 'actif') return NextResponse.json({ erreur: 'mandat' }, { status: 400 });
    const { data, error } = await sb.from('interventions').insert({
      mandat_id: corps.mandat_id,
      categorie: corps.categorie,
      note: '',
    }).select('id').single();
    if (error || !data) return NextResponse.json({ erreur: 'base' }, { status: 500 });
    return NextResponse.json({ id: data.id });
  }

  if (corps.action === 'publier' && corps.id) {
    const existante = await interventionDuPro(sb, corps.id, pro.id);
    if (!existante) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
    const { error } = await sb.from('interventions').update({
      statut: 'publie',
      publie_le: new Date().toISOString(),
      note: corps.note?.slice(0, 500) ?? existante.note,
      duree_secondes: corps.duree_secondes ?? existante.duree_secondes,
    }).eq('id', corps.id);
    if (error) return NextResponse.json({ erreur: 'base' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (corps.action === 'annuler' && corps.id) {
    const existante = await interventionDuPro(sb, corps.id, pro.id);
    if (!existante) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
    await sb.from('interventions').delete().eq('id', corps.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erreur: 'action' }, { status: 400 });
}
