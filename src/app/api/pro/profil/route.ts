import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// POST — LE PROFIL DU PRO (19/11, leçon du jeu de rôle) : le pro dit
// son nom et son enseigne — l'enseigne est ce que le client lit sur
// son journal. Sans elle, la maison reste anonyme des deux côtés.
export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });

  const corps = await req.json().catch(() => ({}));
  if (corps.action !== 'nommer') {
    return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
  const nom = typeof corps.nom === 'string' ? corps.nom.trim().slice(0, 80) : '';
  const enseigne = typeof corps.enseigne === 'string' ? corps.enseigne.trim().slice(0, 80) : '';
  if (!nom) return NextResponse.json({ erreur: 'le nom est requis' }, { status: 400 });

  const sb = getSupabaseService();
  const { error } = await sb
    .from('pros')
    .update({ nom, enseigne: enseigne || null })
    .eq('id', pro.id);
  if (error) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
  return NextResponse.json({ ok: true, pro: { nom, enseigne: enseigne || null } });
}
