import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// LES TIERS (19/11 nuit, étape ③) — l'amont du pro : salariés,
// partenaires, prestataires. La femme de ménage y vit, missionnée.
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const { data } = await getSupabaseService()
    .from('tiers')
    .select('id, nom, role, telephone, cree_le')
    .eq('pro_id', pro.id)
    .order('cree_le', { ascending: false });
  return NextResponse.json({ tiers: data ?? [] });
}

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const corps = await req.json().catch(() => ({}));
  if (corps.action !== 'creer') {
    return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
  const nom = typeof corps.nom === 'string' ? corps.nom.trim().slice(0, 120) : '';
  const role = ['salarie', 'partenaire', 'prestataire'].includes(corps.role) ? corps.role : 'partenaire';
  const telephone = typeof corps.telephone === 'string' ? corps.telephone.trim().slice(0, 40) : '';
  if (!nom) return NextResponse.json({ erreur: 'le nom est requis' }, { status: 400 });

  const sb = getSupabaseService();
  const { data: existant } = await sb.from('tiers')
    .select('id, nom, role, telephone, cree_le')
    .eq('pro_id', pro.id).ilike('nom', nom).maybeSingle();
  if (existant) return NextResponse.json({ tier: existant, existant: true });

  const { data: tier, error } = await sb.from('tiers')
    .insert({ pro_id: pro.id, nom, role, telephone: telephone || null })
    .select('id, nom, role, telephone, cree_le').single();
  if (error || !tier) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
  return NextResponse.json({ tier });
}
