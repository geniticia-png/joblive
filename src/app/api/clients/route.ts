import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// LES FICHES CLIENTS (19/11 nuit, étape ① de la vision direction) —
// régulier ou occasionnel, la fiche vit, les mandats s'y rattachent.
// ═══════════════════════════════════════════════════════════════════

/** GET — les fiches du pro, les récentes d'abord. (23/11) Chaque
 *  fiche porte SON HISTOIRE : ses mandats (lieu, dates, statut) et
 *  leurs codes — le registre de la conciergerie, un regard. */
export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const { data } = await getSupabaseService()
    .from('clients')
    .select(`id, nom, type, telephone, cree_le,
             mandats(id, lieu, debut, fin, statut, codes(id, code, expire_le, revoque_le, vu_le))`)
    .eq('pro_id', pro.id)
    .order('cree_le', { ascending: false });
  // Les mandats du plus récent au plus ancien, dans chaque fiche.
  for (const c of data ?? []) {
    if (Array.isArray(c.mandats)) c.mandats.sort((a: { debut: string | null }, b: { debut: string | null }) =>
      (b.debut ?? '').localeCompare(a.debut ?? ''));
  }
  return NextResponse.json({ clients: data ?? [] });
}

/** POST — action 'creer' : la fiche naît (nom + type + téléphone). */
export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const corps = await req.json().catch(() => ({}));
  if (corps.action !== 'creer') {
    return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
  const nom = typeof corps.nom === 'string' ? corps.nom.trim().slice(0, 120) : '';
  const type = corps.type === 'regulier' ? 'regulier' : 'occasionnel';
  const telephone = typeof corps.telephone === 'string' ? corps.telephone.trim().slice(0, 40) : '';
  if (!nom) return NextResponse.json({ erreur: 'le nom est requis' }, { status: 400 });

  const sb = getSupabaseService();
  // La fiche existe déjà ? (même nom, même pro — pas de doublons)
  const { data: existant } = await sb
    .from('clients')
    .select('id, nom, type, telephone, cree_le')
    .eq('pro_id', pro.id)
    .ilike('nom', nom)
    .maybeSingle();
  if (existant) return NextResponse.json({ client: existant, existant: true });

  const { data: client, error } = await sb
    .from('clients')
    .insert({ pro_id: pro.id, nom, type, telephone: telephone || null })
    .select('id, nom, type, telephone, cree_le')
    .single();
  if (error || !client) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
  return NextResponse.json({ client });
}
