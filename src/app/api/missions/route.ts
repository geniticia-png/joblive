import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// LES MISSIONS (19/11 nuit, étape ③ de la vision) — la conciergerie
// assigne à un tiers (salarié, partenaire, prestataire) un service du
// catalogue sur un mandat. Les tâches du service deviennent LES
// ÉLÉMENTS de la mission, avec leurs drapeaux joblivisés hérités —
// la dose se règle ensuite mission par mission, élément par élément.
// ═══════════════════════════════════════════════════════════════════

// LE JETON DE MISSION — le même patron que les codes J7B-492 :
// mémorable, sans signes ambigus. Marie ouvre /m/<jeton>, sans compte.
const CONSONNES = 'BCDFGHJKLMNPQRTVWXYZ';
const CHIFFRES = '2346789';
function jetonNu(): string {
  let j = '';
  for (let i = 0; i < 8; i++) {
    j += i % 2 === 0 ? CONSONNES[Math.floor(Math.random() * CONSONNES.length)] : CHIFFRES[Math.floor(Math.random() * CHIFFRES.length)];
  }
  return j;
}

const SELECT_MISSIONS = `id, tiers_id, mandat_id, service_id, titre, prevue_le, statut, jeton, vue_le, fermee_le, prix, conditions, accepte_le, tiers(nom, role, telephone), mandats(client_nom, lieu), services(nom), mission_elements(id, libelle, genre, joblivise, fait, commentaire, ordre), mission_preuves(id, chemin, horodatage, element_id)`;

export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  // (013) LE RAPPORT demande UNE mission — pleine, avec l'enseigne du
  // pro pour l'en-tête (la preuve qui voyage porte son émetteur).
  const voulu = new URL(req.url).searchParams.get('id');
  if (voulu && /^[0-9a-f-]{36}$/i.test(voulu)) {
    const { data: une } = await getSupabaseService()
      .from('missions')
      .select(`${SELECT_MISSIONS}, pros(enseigne, nom)`)
      .eq('id', voulu).eq('pro_id', pro.id).maybeSingle();
    return NextResponse.json({ mission: une ?? null });
  }
  const { data } = await getSupabaseService()
    .from('missions')
    .select(SELECT_MISSIONS)
    .eq('pro_id', pro.id)
    .order('prevue_le', { ascending: true, nullsFirst: false });
  return NextResponse.json({ missions: data ?? [] });
}

export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps = await req.json().catch(() => ({}));
  const action: string = corps.action ?? '';

  // un utilitaire : la mission appartient-elle bien au pro ?
  async function missionAuPro(id: string) {
    const { data } = await sb.from('missions')
      .select('id').eq('id', id).eq('pro_id', pro!.id).maybeSingle();
    return !!data;
  }

  switch (action) {
    case 'creer': {
      if (!corps.tiers_id || !corps.mandat_id) {
        return NextResponse.json({ erreur: 'tiers et mandat requis' }, { status: 400 });
      }
      // le tiers et le mandat appartiennent au pro
      const { data: tiers } = await sb.from('tiers')
        .select('id').eq('id', corps.tiers_id).eq('pro_id', pro.id).maybeSingle();
      const { data: mandat } = await sb.from('mandats')
        .select('id').eq('id', corps.mandat_id).eq('pro_id', pro.id).maybeSingle();
      if (!tiers || !mandat) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });

      let titre = typeof corps.titre === 'string' ? corps.titre.trim().slice(0, 120) : '';
      let éléments: { libelle: string; genre: string; joblivise: boolean }[] = [];

      // le service du catalogue apporte ses tâches (avec leurs drapeaux)
      if (corps.service_id) {
        const { data: service } = await sb.from('services')
          .select('id, nom, taches(libelle, genre, joblivise)')
          .eq('id', corps.service_id).eq('pro_id', pro.id).maybeSingle();
        if (service) {
          if (!titre) titre = service.nom;
          éléments = (service.taches ?? []).map((t: any) => ({
            libelle: t.libelle, genre: t.genre, joblivise: t.joblivise,
          }));
        }
      }

      const { data: mission, error } = await sb.from('missions')
        .insert({
          pro_id: pro.id,
          tiers_id: corps.tiers_id,
          mandat_id: corps.mandat_id,
          service_id: corps.service_id || null,
          titre: titre || 'Mission',
          prevue_le: corps.prevue_le || null,
          jeton: jetonNu(),
        })
        .select(SELECT_MISSIONS)
        .single();
      if (error || !mission) return NextResponse.json({ erreur: 'échec' }, { status: 500 });

      if (éléments.length > 0) {
        await sb.from('mission_elements').insert(
          éléments.map((e, i) => ({
            mission_id: mission.id, libelle: e.libelle, genre: e.genre,
            joblivise: e.joblivise, ordre: i,
          })),
        );
      }
      const { data: pleine } = await sb.from('missions')
        .select(SELECT_MISSIONS).eq('id', mission.id).single();
      return NextResponse.json({ mission: pleine ?? mission });
    }
    case 'element-ajouter': {
      const libelle = typeof corps.libelle === 'string' ? corps.libelle.trim().slice(0, 200) : '';
      if (!libelle || !corps.mission_id || !(await missionAuPro(corps.mission_id))) {
        return NextResponse.json({ erreur: 'champs requis' }, { status: 400 });
      }
      const { count } = await sb.from('mission_elements')
        .select('id', { count: 'exact', head: true }).eq('mission_id', corps.mission_id);
      const { data: élément, error } = await sb.from('mission_elements')
        .insert({
          mission_id: corps.mission_id, libelle,
          genre: corps.genre === 'particuliere' ? 'particuliere' : 'generale',
          ordre: count ?? 0,
        })
        .select('id, libelle, genre, joblivise, fait, ordre').single();
      if (error || !élément) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
      return NextResponse.json({ element: élément });
    }
    case 'element-fait': {
      if (!corps.id) return NextResponse.json({ erreur: 'id requis' }, { status: 400 });
      // l'élément appartient-il à une mission du pro ?
      const { data: élément } = await sb.from('mission_elements')
        .select('id, mission_id').eq('id', corps.id).maybeSingle();
      if (!élément || !(await missionAuPro(élément.mission_id))) {
        return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      }
      // (013, 23/11) LE MOT DU GESTE — le commentaire accompagne la
      // coche, jamais seul : le tiers dit son geste à l'instant où il
      // le fait (≤ 500, le rapport le rend à côté des photos).
      const màj: { fait: boolean; commentaire?: string | null } = { fait: !!corps.fait };
      if (typeof corps.commentaire === 'string') {
        const mot = corps.commentaire.trim().slice(0, 500);
        màj.commentaire = mot || null;
      }
      await sb.from('mission_elements').update(màj).eq('id', corps.id);
      return NextResponse.json({ ok: true });
    }
    case 'element-jobliviser': {
      if (!corps.id) return NextResponse.json({ erreur: 'id requis' }, { status: 400 });
      const { data: élément } = await sb.from('mission_elements')
        .select('id, mission_id').eq('id', corps.id).maybeSingle();
      if (!élément || !(await missionAuPro(élément.mission_id))) {
        return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
      }
      await sb.from('mission_elements').update({ joblivise: !!corps.joblivise }).eq('id', corps.id);
      return NextResponse.json({ ok: true });
    }
    case 'statut': {
      const statuts = ['a_faire', 'en_cours', 'faite', 'annulee'];
      if (!corps.id || !statuts.includes(corps.statut) || !(await missionAuPro(corps.id))) {
        return NextResponse.json({ erreur: 'champs requis' }, { status: 400 });
      }
      await sb.from('missions').update({ statut: corps.statut }).eq('id', corps.id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    case 'voir': {
      // LE REGARD DU CENTRE (20/11) — le pro ouvre le travail de son
      // tiers : vue_le suit le patron de codes.vu_le.
      if (!corps.id || !(await missionAuPro(corps.id))) {
        return NextResponse.json({ erreur: 'champs requis' }, { status: 400 });
      }
      await sb.from('missions').update({ vue_le: new Date().toISOString() }).eq('id', corps.id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    case 'conditions': {
      // L'ORDRE DE MISSION (20/11 4ᵉ) — le prix proposé et les
      // conditions, AMENDABLES à tout moment : le lien du tier montre
      // toujours la dernière version.
      if (!corps.id || !(await missionAuPro(corps.id))) {
        return NextResponse.json({ erreur: 'champs requis' }, { status: 400 });
      }
      const prix = typeof corps.prix === 'string' ? corps.prix.trim().slice(0, 60) : '';
      const conditions = typeof corps.conditions === 'string' ? corps.conditions.trim().slice(0, 4000) : '';
      await sb.from('missions').update({ prix, conditions }).eq('id', corps.id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
}
