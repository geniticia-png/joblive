import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// LA PREUVE — upload d'une photo (FormData). L'HORODATAGE NAÎT À LA
// PRISE (le client l'envoie, capturé au geste), jamais à l'upload :
// c'est toute la différence entre un fait et un fichier.
export async function POST(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();

  const form = await req.formData();
  const interventionId = String(form.get('intervention_id') ?? '');
  const genre = String(form.get('genre') ?? '');
  const horodatage = String(form.get('horodatage') ?? '');
  const fichier = form.get('fichier');

  if (!interventionId || !['avant', 'apres'].includes(genre) || !(fichier instanceof File)) {
    return NextResponse.json({ erreur: 'corps' }, { status: 400 });
  }

  // L'intervention doit être au pro, et vivante (on ne prouve pas
  // dans le passé figé).
  const { data: intervention } = await sb
    .from('interventions')
    .select('id, statut, mandat_id, mandats!inner(pro_id)')
    .eq('id', interventionId)
    .eq('mandats.pro_id', pro.id)
    .maybeSingle();
  if (!intervention || intervention.statut !== 'en_cours') {
    return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });
  }

  const extension = (fichier.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const chemin = `${intervention.mandat_id}/${crypto.randomUUID()}.${extension}`;

  const bytes = new Uint8Array(await fichier.arrayBuffer());
  const { error: errUpload } = await sb.storage
    .from('preuves')
    .upload(chemin, bytes, { contentType: fichier.type || 'image/jpeg', upsert: false });
  if (errUpload) return NextResponse.json({ erreur: 'stockage' }, { status: 500 });

  const instant = horodatage && !isNaN(Date.parse(horodatage)) ? new Date(horodatage).toISOString() : new Date().toISOString();
  const { data: preuve, error } = await sb.from('preuves')
    .insert({ intervention_id: interventionId, genre, chemin, horodatage: instant })
    .select('id, genre, chemin, horodatage')
    .single();
  if (error || !preuve) return NextResponse.json({ erreur: 'base' }, { status: 500 });

  return NextResponse.json({ preuve });
}
