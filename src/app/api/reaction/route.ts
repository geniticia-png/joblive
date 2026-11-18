import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

// LA RÉACTION CLIENT — « Tout va bien », à sens unique, sans session
// (le code d'accès EST la preuve). Un bouton doux, pas une messagerie.
type Corps = { code?: string; intervention_id?: string | null };

export async function POST(req: Request) {
  const corps: Corps = await req.json();
  const code = (corps.code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code) return NextResponse.json({ erreur: 'code' }, { status: 400 });
  const sb = getSupabaseService();

  const { data: accès } = await sb.from('codes')
    .select('id, mandat_id, expire_le, revoque_le, mandats(statut)')
    .eq('code', code)
    .maybeSingle();
  const maintenant = new Date();
  const valide = accès
    && !accès.revoque_le
    && (!accès.expire_le || new Date(accès.expire_le) > maintenant)
    && (accès.mandats as any)?.statut === 'actif';
  if (!valide) return NextResponse.json({ erreur: 'code' }, { status: 403 });

  // Une seule réaction par intervention — le client dit « tout va
  // bien », il ne spame pas.
  if (corps.intervention_id) {
    const { data: déjà } = await sb.from('reactions')
      .select('id').eq('intervention_id', corps.intervention_id).maybeSingle();
    if (déjà) return NextResponse.json({ ok: true, déjà: true });
  }

  const { error } = await sb.from('reactions').insert({
    mandat_id: accès.mandat_id,
    intervention_id: corps.intervention_id ?? null,
  });
  if (error) return NextResponse.json({ erreur: 'base' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
