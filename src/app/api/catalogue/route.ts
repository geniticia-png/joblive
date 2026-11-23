import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════
// LE CATALOGUE (19/11 nuit, étape ② de la vision direction) — les
// services du pro, leurs tâches GÉNÉRALES et PARTICULIÈRES, et LA
// JOBLIVISATION : chaque élément porte son drapeau.
// ═══════════════════════════════════════════════════════════════════

/** GET — le catalogue du pro : services avec leurs tâches. */
export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const { data: services } = await sb
    .from('services')
    .select('id, nom, ordre, joblivise, taches(id, libelle, genre, joblivise)')
    .eq('pro_id', pro.id)
    .order('ordre', { ascending: true });
  return NextResponse.json({ services: services ?? [] });
}

/** Les gabarits du métier (location touristique) — posés d'un clic. */
const GABARITS: { nom: string; generale: string[]; particuliere: string[] }[] = [
  {
    nom: 'Ménage de sortie',
    generale: ['Linge changé, lit refait', 'Sols aspirés et lavés', 'Sanitaires détartrés et désinfectés', 'Cuisine et électroménager nettoyés', 'Poussières et aspiration canapés', 'Poubelles sorties, tri fait', 'Terrasse et mobiliers extérieurs'],
    particuliere: ['Consignes particulières du bien', 'Fenêtres et volets du séjour'],
  },
  {
    nom: 'Ménage de séjour',
    generale: ['Linge de lit changé', 'Serviettes renouvelées', 'Sols et sanitaires entretenus', 'Cuisine remise en ordre'],
    particuliere: ['Demandes des voyageurs en cours'],
  },
  {
    nom: 'Accueil voyageurs',
    generale: ['Remise des clés en main propre', 'Le tour du bien avec les voyageurs', 'Consignes du logement et du quartier', 'Code wifi vérifié'],
    particuliere: ['Arrivée tardive organisée', 'Instructions spéciales du propriétaire'],
  },
  {
    nom: 'Linge & remise',
    generale: ['Linge récupéré et compté', 'Linge propre remis en place', 'Lit monté aux draps du séjour'],
    particuliere: ['Linge particulier du propriétaire'],
  },
  {
    nom: 'Piscine',
    generale: ['Skimmer et paniers vidés', 'Fond aspiré ou robot passé', 'Produits dosés, eau analysée', 'Ligne d’eau nettoyée'],
    particuliere: ['Bâche et horaires du propriétaire'],
  },
  {
    nom: 'Jardin',
    generale: ['Arrosage vérifié', 'Tonte passée', 'Allées balayées'],
    particuliere: ['Plantes fragiles du propriétaire'],
  },
  // (23/11, chutjegère) LA FORMATION — le monde Resafix : la mission
  // qui se PROUVE. Les étapes d'une session se cochent au fil du
  // jour, chacune porte son mot — le reporting naît tout seul.
  {
    nom: 'Formation',
    generale: ['Lancer la session et prendre les présences', 'Présentation du cadre et des objectifs', 'Atelier pratique — mise en situation', 'Évaluation des participants', 'Bilan de la session et attestation'],
    particuliere: ['Consignes du client de la formation'],
  },
];

/** POST — les gestes du catalogue. */
export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();
  const corps = await req.json().catch(() => ({}));
  const action: string = corps.action ?? '';

  switch (action) {
    case 'service-creer': {
      const nom = typeof corps.nom === 'string' ? corps.nom.trim().slice(0, 120) : '';
      if (!nom) return NextResponse.json({ erreur: 'nom requis' }, { status: 400 });
      const { data: existant } = await sb.from('services')
        .select('id').eq('pro_id', pro.id).ilike('nom', nom).maybeSingle();
      if (existant) return NextResponse.json({ service: existant, existant: true });
      const { count } = await sb.from('services')
        .select('id', { count: 'exact', head: true }).eq('pro_id', pro.id);
      const { data: service, error } = await sb.from('services')
        .insert({ pro_id: pro.id, nom, ordre: count ?? 0 })
        .select('id, nom, ordre, joblivise').single();
      if (error || !service) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
      return NextResponse.json({ service });
    }
    case 'service-jobliviser': {
      const { error } = await sb.from('services')
        .update({ joblivise: !!corps.joblivise })
        .eq('id', corps.id).eq('pro_id', pro.id);
      return error ? NextResponse.json({ erreur: 'échec' }, { status: 500 }) : NextResponse.json({ ok: true });
    }
    case 'service-supprimer': {
      await sb.from('services').delete().eq('id', corps.id).eq('pro_id', pro.id);
      return NextResponse.json({ ok: true });
    }
    case 'tache-creer': {
      const libelle = typeof corps.libelle === 'string' ? corps.libelle.trim().slice(0, 200) : '';
      const genre = corps.genre === 'particuliere' ? 'particuliere' : 'generale';
      if (!libelle || !corps.service_id) return NextResponse.json({ erreur: 'champs requis' }, { status: 400 });
      const { data: service } = await sb.from('services')
        .select('id').eq('id', corps.service_id).eq('pro_id', pro.id).maybeSingle();
      if (!service) return NextResponse.json({ erreur: 'service inconnu' }, { status: 404 });
      const { data: tache, error } = await sb.from('taches')
        .insert({ service_id: corps.service_id, libelle, genre })
        .select('id, libelle, genre, joblivise').single();
      if (error || !tache) return NextResponse.json({ erreur: 'échec' }, { status: 500 });
      return NextResponse.json({ tache });
    }
    case 'tache-jobliviser': {
      const { error } = await sb.from('taches')
        .update({ joblivise: !!corps.joblivise })
        .eq('id', corps.id)
        .in('service_id', (await sb.from('services').select('id').eq('pro_id', pro.id)).data?.map((s: any) => s.id) ?? ['00000000-0000-0000-0000-000000000000']);
      return error ? NextResponse.json({ erreur: 'échec' }, { status: 500 }) : NextResponse.json({ ok: true });
    }
    case 'tache-supprimer': {
      const ids = (await sb.from('services').select('id').eq('pro_id', pro.id)).data?.map((s: any) => s.id) ?? [];
      await sb.from('taches').delete().eq('id', corps.id).in('service_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
      return NextResponse.json({ ok: true });
    }
    case 'gabarits': {
      // Les gabarits du métier — posés une seule fois, sans doublons.
      let posés = 0;
      for (const g of GABARITS) {
        const { data: existant } = await sb.from('services')
          .select('id').eq('pro_id', pro.id).ilike('nom', g.nom).maybeSingle();
        let serviceId = existant?.id;
        if (!serviceId) {
          const { count } = await sb.from('services')
            .select('id', { count: 'exact', head: true }).eq('pro_id', pro.id);
          const { data: né } = await sb.from('services')
            .insert({ pro_id: pro.id, nom: g.nom, ordre: (count ?? 0) })
            .select('id').single();
          serviceId = né?.id;
          if (serviceId) posés++;
        }
        if (!serviceId) continue;
        const { data: déjà } = await sb.from('taches')
          .select('id').eq('service_id', serviceId);
        if ((déjà ?? []).length === 0) {
          const lignes = [
            ...g.generale.map((libelle) => ({ service_id: serviceId!, libelle, genre: 'generale' })),
            ...g.particuliere.map((libelle) => ({ service_id: serviceId!, libelle, genre: 'particuliere' })),
          ];
          await sb.from('taches').insert(lignes);
        }
      }
      return NextResponse.json({ ok: true, posés });
    }
    default:
      return NextResponse.json({ erreur: 'action inconnue' }, { status: 400 });
  }
}
