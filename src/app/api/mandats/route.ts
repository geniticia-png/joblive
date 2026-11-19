import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// POST — LES MANDATS : creer / terminer / regler (la dose).
type Corps = {
  action: 'creer' | 'terminer' | 'regler';
  id?: string;
  client_nom?: string;
  client_id?: string;
  client_tel?: string;
  lieu?: string;
  debut?: string;
  fin?: string;
  categories_diffusees?: string[] | null;
  chrono_visible?: boolean;
};

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps: Corps = await req.json();

  if (corps.action === 'creer') {
    if (!corps.client_nom?.trim()) return NextResponse.json({ erreur: 'nom' }, { status: 400 });
    const { data, error } = await sb.from('mandats').insert({
      pro_id: pro.id,
      client_nom: corps.client_nom.trim(),
      client_id: corps.client_id || null,
      client_tel: corps.client_tel?.trim() || null,
      lieu: corps.lieu?.trim() || '',
      debut: corps.debut || null,
      fin: corps.fin || null,
    }).select('id, client_nom, lieu, statut, debut, fin, categories_diffusees, chrono_visible').single();
    if (error) return NextResponse.json({ erreur: 'base' }, { status: 500 });
    return NextResponse.json({ mandat: data });
  }

  if (corps.action === 'terminer' && corps.id) {
    // Terminer mandate : le mandat se clôt ET ses codes meurent (le
    // code est mortel par nature — précaution gravée).
    const { error } = await sb.from('mandats').update({ statut: 'termine' })
      .eq('id', corps.id).eq('pro_id', pro.id);
    if (error) return NextResponse.json({ erreur: 'base' }, { status: 500 });
    await sb.from('codes').update({ revoque_le: new Date().toISOString() })
      .eq('mandat_id', corps.id).is('revoque_le', null);
    return NextResponse.json({ ok: true });
  }

  if (corps.action === 'regler' && corps.id) {
    // LA DOSE — la transparence est l'outil du pro, pas son procureur :
    // quelles catégories se diffusent, si le chrono se montre.
    const { error } = await sb.from('mandats').update({
      ...(corps.categories_diffusees !== undefined
        ? { categories_diffusees: corps.categories_diffusees }
        : {}),
      ...(corps.chrono_visible !== undefined ? { chrono_visible: corps.chrono_visible } : {}),
    }).eq('id', corps.id).eq('pro_id', pro.id);
    if (error) return NextResponse.json({ erreur: 'base' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erreur: 'action' }, { status: 400 });
}
