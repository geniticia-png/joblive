import { NextResponse } from 'next/server';
import { proDeLaRequête } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { saisonResacap, periodeResacap } from '@/lib/pont-resacap';

// ═══════════════════════════════════════════════════════════════════
// LE DOSSIER (23/11, JOBLIVE-DOSSIER.md chez la mère) — la charge du
// mandat au menu horizontal MISSION · INTERVENANT · AGENDA ·
// CHIFFRES, et LE GESTE WHATSAPP : OUVRIR = LU (les réactions du
// client et les missions closes non vues de CE dossier s'éteignent).
// Garde : le mandat appartient au pro (doctrine, filtre serveur).
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const pro = await proDeLaRequête(req);
  if (!pro) return NextResponse.json({ erreur: 'session' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  const sb = getSupabaseService();

  const { data: mandat } = await sb.from('mandats')
    .select('id, client_nom, lieu, statut, debut, fin, unit_resacap, saison_visible, commission_pct, frais_fixes, revenus_visible, pros(email_resacap), codes(id, code, expire_le, revoque_le, vu_le)')
    .eq('id', id).eq('pro_id', pro.id).maybeSingle();
  if (!mandat) return NextResponse.json({ erreur: 'inconnu' }, { status: 404 });

  // ── MISSION : le fil unifié — interventions (l'intervenant = vous)
  // et missions déléguées (l'intervenant = le tiers), avec les
  // réactions du client comme messages entrants.
  const [{ data: interventions }, { data: missions }] = await Promise.all([
    sb.from('interventions')
      .select('id, categorie, note, statut, debut_le, publie_le, duree_secondes, preuves(id, genre, chemin, horodatage), reactions(id, genre, cree_le)')
      .eq('mandat_id', id)
      .neq('statut', 'annulee')
      .order('publie_le', { ascending: false, nullsFirst: false }),
    sb.from('missions')
      .select('id, titre, statut, prevue_le, fermee_le, accepte_le, vue_le, jeton, tiers(nom, telephone), mission_elements(id, libelle, fait, joblivise), mission_preuves(id, chemin, horodatage, element_id)')
      .eq('mandat_id', id)
      .neq('statut', 'annulee')
      .order('cree_le', { ascending: false }),
  ]);

  // ── INTERVENANT : les gens du dossier — vous + les tiers.
  const intervenants = new Map<string, { nom: string; rôle: string; téléphone: string | null; missions: number; dernière: string | null; jeton: string | null }>();
  const tienne = (interventions ?? []).length;
  intervenants.set('vous', { nom: 'Vous', rôle: 'vos gestes directs', téléphone: null, missions: tienne, dernière: (interventions ?? [])[0]?.publie_le ?? null, jeton: null });
  for (const mRaw of missions ?? []) {
    // (le client typé rend tiers en tableau selon la relation — on
    // normalise : un objet ou le premier du tableau, jamais un crash)
    const m = mRaw as any;
    const t = Array.isArray(m.tiers) ? m.tiers[0] : m.tiers;
    if (!t?.nom) continue;
    const cle = t.nom as string;
    const e = intervenants.get(cle) ?? { nom: t.nom, rôle: 'tiers de confiance', téléphone: t.telephone ?? null, missions: 0, dernière: null, jeton: m.jeton ?? null };
    e.missions += 1;
    e.dernière = e.dernière ?? m.fermee_le ?? m.prevue_le;
    intervenants.set(cle, e);
  }

  // ── OUVRIR = LU (le geste WhatsApp) : ce dossier s'éteint.
  await sb.from('reactions').update({ vue_le: new Date().toISOString() })
    .eq('mandat_id', id).is('vue_le', null);
  await sb.from('missions').update({ vue_le: new Date().toISOString() })
    .eq('mandat_id', id).eq('statut', 'faite').is('vue_le', null);

  // ── CHIFFRES v1 : les compteurs du dossier + le portail RésaCap
  // si le bien est lié et la dose ouverte (le même calcul que /j).
  const chiffres: Record<string, unknown> = {
    gestes_directs: tienne,
    missions_déléguées: (missions ?? []).length,
    photos: [
      ...(interventions ?? []).flatMap((i: any) => i.preuves ?? []),
      ...(missions ?? []).flatMap((m: any) => m.mission_preuves ?? []),
    ].length,
    réactions: (interventions ?? []).flatMap((i: any) => i.reactions ?? []).length,
    durée_directe_s: (interventions ?? []).reduce((s: number, i: any) => s + (i.duree_secondes ?? 0), 0),
  };
  const emailResacap = (mandat.pros as any)?.email_resacap;
  if (mandat.unit_resacap && mandat.revenus_visible && emailResacap) {
    try {
      const jMA = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const maintenant = new Date();
      const débutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
      const débutAn = new Date(maintenant.getFullYear(), 0, 1);
      const finAn = new Date(maintenant.getFullYear() + 1, 0, 1);
      const [pM, pA, sR] = await Promise.all([
        periodeResacap(emailResacap, mandat.unit_resacap.id, jMA(débutMois), jMA(finMois)),
        periodeResacap(emailResacap, mandat.unit_resacap.id, jMA(débutAn), jMA(finAn)),
        mandat.saison_visible
          ? saisonResacap(emailResacap, mandat.unit_resacap.id, jMA(new Date(maintenant.getTime() - 62 * 86400000)), jMA(new Date(maintenant.getFullYear() + 1, maintenant.getMonth(), maintenant.getDate())))
          : Promise.resolve(null),
      ]);
      const calcule = (p: any, nbMois: number) => {
        const ca = Number(p?.ca) || 0;
        const dépenses = (p?.depenses ?? []).reduce((s: number, d: any) => s + Number(d.montant || 0), 0);
        const commission = mandat.commission_pct != null ? (Number(mandat.commission_pct) / 100) * ca : 0;
        const frais = (mandat.frais_fixes ?? []).reduce((s: number, f: any) => s + f.montant * (f.base === 'sejour' ? (Number(p?.nb_sejours) || 0) : nbMois), 0);
        return { net: Math.round(ca - dépenses - commission - frais), ca: Math.round(ca) };
      };
      chiffres.portail = {
        net_mois: calcule(pM, 1).net, net_année: calcule(pA, 12).net,
        saison: sR?.ok ? { sejours: (sR.sejours ?? []).length } : null,
      };
    } catch { /* muet par conception — le dossier vit sans le pont */ }
  }

  // Le mandat rendu (pros retiré du nested).
  const { pros: _pros, ...mandatRendu } = mandat as any;

  return NextResponse.json({
    mandat: mandatRendu,
    interventions: interventions ?? [],
    missions: missions ?? [],
    intervenants: Array.from(intervenants.values()),
    chiffres,
  });
}

