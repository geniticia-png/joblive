import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { unitesResacap } from '@/lib/pont-resacap';

// ═══════════════════════════════════════════════════════════════════
// LE LIEN RÉSACAP (21/11) — la conciergerie relie son mandat au bien
// qui vit chez RésaCap. L'annuaire (son email de compte RésaCap) ne
// passe JAMAIS par le navigateur : le serveur signe et interroge le
// pont. La dose (saison_visible) est opt-in : fermée par défaut.
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const { data } = await getSupabaseService()
    .from('pros').select('email_resacap').eq('id', pro.id).maybeSingle();
  return NextResponse.json({ email_resacap: data?.email_resacap ?? null });
}

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps = await req.json().catch(() => ({}));
  const action: string = corps.action ?? '';

  switch (action) {
    case 'email': {
      // l'annuaire se pose une fois sur le pro
      const email = typeof corps.email === 'string' ? corps.email.trim().slice(0, 160) : '';
      await sb.from('pros').update({ email_resacap: email || null }).eq('id', pro.id);
      return NextResponse.json({ ok: true });
    }
    case 'unites': {
      const { data } = await sb.from('pros').select('email_resacap').eq('id', pro.id).maybeSingle();
      const email = data?.email_resacap;
      if (!email) return NextResponse.json({ erreur: 'posez d\u2019abord votre email RésaCap' }, { status: 400 });
      try {
        const r = await unitesResacap(email);
        return NextResponse.json({ unites: r.unites ?? [] });
      } catch (e) {
        // le code HTTP du pont voyage (400 = sceau ≠, 404 = compte
        // inconnu, réseau = autre) — jamais le secret lui-même.
        const détail = e instanceof Error ? ' (' + e.message + ')' : '';
        return NextResponse.json({ erreur: 'RésaCap ne répond pas — vérifiez l\u2019email du compte' + détail }, { status: 502 });
      }
    }
    case 'lier': {
      if (!corps.mandat_id) return NextResponse.json({ erreur: 'mandat requis' }, { status: 400 });
      const { data: mandat } = await sb.from('mandats')
        .select('id').eq('id', corps.mandat_id).eq('pro_id', pro.id).maybeSingle();
      if (!mandat) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      // le snapshot du bien : id, slug, nom (vérifiés par le pont avant ? non :
      // le lien ne montre rien tant que la dose est fermée — et la saison ne
      // voyage que scellée, pour ce unit_id précis)
      const unit = corps.unit && typeof corps.unit.id === 'string' && typeof corps.unit.nom === 'string'
        ? { id: corps.unit.id, slug: String(corps.unit.slug ?? ''), nom: String(corps.unit.nom).slice(0, 120) }
        : null;
      await sb.from('mandats').update({ unit_resacap: unit }).eq('id', corps.mandat_id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    case 'saison-visible': {
      if (!corps.mandat_id) return NextResponse.json({ erreur: 'mandat requis' }, { status: 400 });
      const { data: mandat } = await sb.from('mandats')
        .select('id, unit_resacap').eq('id', corps.mandat_id).eq('pro_id', pro.id).maybeSingle();
      if (!mandat) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      if (corps.visible && !mandat.unit_resacap) {
        return NextResponse.json({ erreur: 'liez d\u2019abord un bien' }, { status: 400 });
      }
      await sb.from('mandats')
        .update({ saison_visible: !!corps.visible })
        .eq('id', corps.mandat_id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
}
