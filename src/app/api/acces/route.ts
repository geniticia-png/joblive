import { NextResponse } from 'next/server';
import { unitesResacap } from '@/lib/pont-resacap';

// ═══════════════════════════════════════════════════════════════════
// LA GARDE D'ACCÈS (23/11, direction : « pour l'instant, réserver
// Joblive à RésaCap »). La porte de connexion ne laisse passer QUE :
//   ① les comptes DÉJÀ vivants (aucun pro existant enfermé dehors) ;
//   ② les emails qui ONT un compte chez la mère (le pont unites,
//      sceau HMAC — un client RésaCap = la famille).
// Les autres voient la porte parlée : rejoindre la famille sur
// resacap.fr. FAIL-CLOSED assumé : si le pont se tait, la porte
// reste fermée (c'est le sens de « réservé ») — la raison
// « indisponible » le dit au navigateur pour réessayer.
// Pour ROUVRIR à tous un jour : retirer l'appel de garde dans
// /connexion — cette route devient inerte.
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const corps = await req.json().catch(() => ({}));
  const email = typeof corps.email === 'string' ? corps.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ autorise: false, raison: 'email' }, { status: 400 });
  }

  // ① Un compte vit déjà ? (l'API admin — jamais enfermer un pro dehors.
  // ⚠ Le filtre ?email= n'est pas garanti exact : la RÉPONSE fait foi,
  // on ne passe que si l'un des utilisateurs rendus porte EXACTEMENT
  // cet email — un filtre ignoré ne laisse rien passer.)
  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } },
    );
    if (r.ok) {
      const { users } = await r.json();
      if (Array.isArray(users) && users.some((u: { email?: string }) => (u.email ?? '').toLowerCase() === email)) {
        return NextResponse.json({ autorise: true, connu: 'pro' });
      }
    }
  } catch {
    return NextResponse.json({ autorise: false, raison: 'indisponible' }, { status: 503 });
  }

  // ② Un compte chez la mère ? (le pont scellé — l'annuaire par email)
  try {
    const r = await unitesResacap(email);
    if (r?.ok) return NextResponse.json({ autorise: true, connu: 'resacap' });
  } catch (e) {
    // Le pont parle en statut : 404 = compte RésaCap inconnu (refus
    // franc) ; tout autre = la mère ne répond pas (porte fermée,
    // réessayable).
    const message = e instanceof Error ? e.message : '';
    if (!message.includes('404')) {
      return NextResponse.json({ autorise: false, raison: 'indisponible' }, { status: 503 });
    }
  }

  return NextResponse.json({ autorise: false, raison: 'famille' });
}
