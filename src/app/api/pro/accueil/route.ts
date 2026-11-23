import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { labelCatégorie } from '@/lib/format';

// ── (23/11, JOBLIVE-DOSSIER) LES CONVERSATIONS — la grammaire
// WhatsApp : par mandat, le DERNIER événement (l'aperçu) et les
// NON-VUS (le badge vermillon). Le pro ouvre sa liste et sait,
// d'un regard, qui attend.
type Événement = { genre: string; texte: string; le: string };
function composerConversations(
  mandats: any[],
  publiéesRécentes: any[],
  enCours: any[],
  missionsToutes: any[],
  réactions: any[],
): Record<string, { dernier: Événement | null; non_vus: number }> {
  const parMandat: Record<string, { dernier: Événement | null; non_vus: number }> = {};
  // LE BLINDAGE : seuls les mandats DU PRO vivent (parMandat est la
  // frontière — un événement d'ailleurs ne crée jamais de ligne).
  const posé = (mandatId: string, e: Événement) => {
    if (!(mandatId in parMandat)) return;
    const c = parMandat[mandatId];
    if (!c.dernier || e.le > c.dernier.le) c.dernier = e;
  };
  for (const m of mandats) {
    parMandat[m.id] = { dernier: { genre: 'création', texte: 'Dossier ouvert', le: m.cree_le ?? '' }, non_vus: 0 };
  }
  for (const i of enCours) {
    if (!i.mandat_id) continue;
    posé(i.mandat_id, { genre: 'en_cours', texte: `${labelCatégorie(i.categorie)} — en cours`, le: i.debut_le ?? '' });
  }
  for (const i of publiéesRécentes) {
    if (!i.mandat_id) continue;
    const photos = (i.preuves ?? []).length;
    posé(i.mandat_id, {
      genre: 'publiée',
      texte: `${labelCatégorie(i.categorie)} publié${photos ? ` · ${photos} photo${photos > 1 ? 's' : ''}` : ''}`,
      le: i.publie_le ?? '',
    });
  }
  for (const m of missionsToutes) {
    if (!m.mandat_id) continue;
    const tiers = m.tiers?.nom ?? 'un tiers';
    if (m.statut === 'faite') {
      const gestes = (m.mission_elements ?? []).filter((e: any) => e.fait).length;
      const photos = (m.mission_preuves ?? []).length;
      posé(m.mandat_id, {
        genre: 'mission_faite',
        texte: `Mission de ${tiers} close — ${gestes} geste${gestes > 1 ? 's' : ''}${photos ? ` · ${photos} photo${photos > 1 ? 's' : ''}` : ''}${m.vue_le ? '' : ' — à regarder'}`,
        le: (m.fermee_le ?? m.cree_le ?? '') as string,
      });
    } else if (m.statut === 'en_cours') {
      posé(m.mandat_id, { genre: 'mission_en_cours', texte: `Mission de ${tiers} en cours`, le: m.accepte_le ?? m.cree_le ?? '' });
    } else if (m.statut === 'a_faire') {
      posé(m.mandat_id, { genre: 'mission_a_faire', texte: `Mission confiée à ${tiers} — à faire`, le: m.cree_le ?? '' });
    }
  }
  for (const r of réactions) {
    if (!r.mandat_id) continue;
    posé(r.mandat_id, {
      genre: 'réaction',
      texte: `« Tout va bien » — reçu ${r.cree_le ? new Date(r.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}`,
      le: r.cree_le ?? '',
    });
  }
  for (const m of mandats) {
    const codeVu = (m.codes ?? []).filter((c: any) => c.vu_le).sort((a: any, b: any) => (b.vu_le ?? '').localeCompare(a.vu_le ?? ''))[0];
    if (codeVu) posé(m.id, { genre: 'code_vu', texte: 'Le client a ouvert son journal', le: codeVu.vu_le });
  }
  // Les non-vus par dossier : missions faites non regardées + réactions non vues.
  for (const m of missionsToutes) {
    if (m.mandat_id && m.statut === 'faite' && !m.vue_le) parMandat[m.mandat_id].non_vus++;
  }
  for (const r of réactions) {
    if (r.mandat_id && !r.vue_le) parMandat[r.mandat_id].non_vus++;
  }
  return parMandat;
}

// GET — L'ACCUEIL DU PRO : ses mandats (avec le dernier regard du
// client), le journal du jour (publiées + en cours). Le CTA règne
// en haut : ce qu'on charge ne doit jamais le noyer (leçon Stitch).
export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const sb = getSupabaseService();

  const [{ data: mandats }, { data: interventions }, { data: missionsFaites }, { data: publiéesToutes }, { data: missionsToutes }, { data: réactions }] = await Promise.all([
    sb.from('mandats')
      .select('id, client_nom, client_id, lieu, client_tel, statut, debut, fin, cree_le, categories_diffusees, chrono_visible, unit_resacap, saison_visible, commission_pct, frais_fixes, revenus_visible, clients(type), codes(id, code, expire_le, revoque_le, vu_le)')
      .eq('pro_id', pro.id)
      .order('cree_le', { ascending: false }),
    sb.from('interventions')
      .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage)')
      .eq('statut', 'en_cours')
      .eq('mandats.pro_id', pro.id)
      .order('debut_le', { ascending: false }),
    // LE TRAVAIL INDIRECT TERMINÉ (20/11) — les dernières missions
    // faites par les tiers : le centre doit voir sans chercher (le
    // client voyait, pas la conciergerie). vue_le suit codes.vu_le.
    sb.from('missions')
      .select('id, mandat_id, titre, statut, fermee_le, vue_le, tiers(nom), mandats(client_nom, lieu), mission_elements(id, fait), mission_preuves(id, chemin, horodatage)')
      .eq('pro_id', pro.id)
      .eq('statut', 'faite')
      .order('fermee_le', { ascending: false, nullsFirst: false })
      .limit(5),
    // (23/11) LES CONVERSATIONS — tout le récent du pro, pour
    // l'aperçu « dernier message » par dossier (≤ 80, les vieux
    // dossiers tombent sur leur création). ⚠ PGRST108 : filtrer sur
    // une table imbriquée EXIGE qu'elle vive dans le select —
    // mandats(pro_id) sélectionné, sinon PostgREST répond 400 et
    // la liste devient aveugle (piège payé au banc).
    sb.from('interventions')
      .select('id, mandat_id, categorie, statut, debut_le, publie_le, preuves(id), mandats(pro_id)')
      .eq('mandats.pro_id', pro.id)
      .in('statut', ['publie'])
      .order('publie_le', { ascending: false })
      .limit(80),
    sb.from('missions')
      .select('id, mandat_id, titre, statut, fermee_le, vue_le, accepte_le, cree_le, tiers(nom), mission_elements(id, fait), mission_preuves(id, chemin, horodatage)')
      .eq('pro_id', pro.id)
      .neq('statut', 'annulee')
      .order('cree_le', { ascending: false })
      .limit(80),
    sb.from('reactions')
      .select('id, mandat_id, intervention_id, genre, cree_le, vue_le, mandats(pro_id)')
      .eq('mandats.pro_id', pro.id)
      .order('cree_le', { ascending: false })
      .limit(80),
  ]);

  // Le journal du jour : les publiées d'aujourd'hui, tous SES mandats —
  // (20/11 : le filtre pro manquait, chaque pro voyait les publications
  // des autres ; la doctrine exige le filtre côté serveur).
  const début = new Date(); début.setHours(0, 0, 0, 0);
  const { data: publiées } = await sb
    .from('interventions')
    .select('id, mandat_id, categorie, note, statut, debut_le, publie_le, duree_secondes, mandats(client_nom, lieu), preuves(id, genre, chemin, horodatage), reactions(id, genre, cree_le)')
    .eq('statut', 'publie')
    .eq('mandats.pro_id', pro.id)
    .gte('publie_le', début.toISOString())
    .order('publie_le', { ascending: false });

  const mandatsPlats = (mandats ?? []).map((m: any) => ({
    ...m,
    client_type: m.clients?.type ?? null,
    clients: undefined,
  }));
  return NextResponse.json({
    pro, mandats: mandatsPlats, enCours: interventions ?? [],
    journal: (publiées ?? []).slice(0, 5),
    missionsFaites: missionsFaites ?? [],
    conversations: composerConversations(mandats ?? [], publiéesToutes ?? [], interventions ?? [], missionsToutes ?? [], réactions ?? []),
  });
}
