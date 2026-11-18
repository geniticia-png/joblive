import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// LES CODES D'ACCÈS — mortels par nature. generer / revoquer.
// Six signes mémorables façon J7B-492 : consonne-chiffre-consonne
// puis trois chiffres, sans signes ambigus (O/0, I/1, S/5 bannis).

const CONSONNES = 'BCDFGHJKLMNPQRTVWXYZ';
const CHIFFRES = '2346789';

function codeNu(): string {
  let c = '';
  c += CONSONNES[Math.floor(Math.random() * CONSONNES.length)];
  c += CHIFFRES[Math.floor(Math.random() * CHIFFRES.length)];
  c += CONSONNES[Math.floor(Math.random() * CONSONNES.length)];
  for (let i = 0; i < 3; i++) c += CHIFFRES[Math.floor(Math.random() * CHIFFRES.length)];
  return c;
}

// (le formatage « J7B-492 » vit côté client — une route n'exporte
// que ses handlers, la loi de Next)

type Corps = { action: 'generer' | 'revoquer'; mandat_id?: string; id?: string; jours?: number };

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps: Corps = await req.json();

  if (corps.action === 'generer' && corps.mandat_id) {
    const { data: mandat } = await sb.from('mandats')
      .select('id, fin, statut').eq('id', corps.mandat_id).eq('pro_id', pro.id).maybeSingle();
    if (!mandat || mandat.statut !== 'actif') return NextResponse.json({ erreur: 'mandat' }, { status: 400 });

    // Le code expire à la fin du mandat — ou à 30 jours si le mandat
    // n'a pas de fin. Le code est mortel : il ne survit pas au mandat.
    const expire = mandat.fin
      ? new Date(mandat.fin + 'T23:59:59')
      : new Date(Date.now() + (corps.jours ?? 30) * 86400_000);

    for (let tentative = 0; tentative < 5; tentative++) {
      const nu = codeNu();
      const { data, error } = await sb.from('codes')
        .insert({ mandat_id: mandat.id, code: nu, expire_le: expire.toISOString() })
        .select('id, code, expire_le, revoque_le, vu_le')
        .single();
      if (!error && data) return NextResponse.json({ code: data });
    }
    return NextResponse.json({ erreur: 'generation' }, { status: 500 });
  }

  if (corps.action === 'revoquer' && corps.id) {
    // Révocation en un clic — le lien du client meurt sur l'heure.
    const { data: code } = await sb.from('codes')
      .select('id, mandats!inner(pro_id)').eq('id', corps.id).eq('mandats.pro_id', pro.id).maybeSingle();
    if (!code) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
    await sb.from('codes').update({ revoque_le: new Date().toISOString() }).eq('id', corps.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erreur: 'action' }, { status: 400 });
}
