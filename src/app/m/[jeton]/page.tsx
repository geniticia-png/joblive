import { getSupabaseService } from '@/lib/supabase';
import { MissionDuTier, MissionMorte } from './vue';

// ═══════════════════════════════════════════════════════════════════
// L'ÉCRAN DU TIER (étape ③-bis) — Marie ouvre le lien que la
// conciergerie lui a envoyé : SA mission, sans compte, les mains
// libres. Le jeton est le droit d'agir ; la mission close le ferme.
// ═══════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { jeton: string } }) {
  const nu = params.jeton.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sb = getSupabaseService();
  const { data: mission } = await sb.from('missions')
    .select('id, titre, statut, prevue_le, tiers(nom), mandats(client_nom, lieu), mission_elements(id, libelle, genre, fait, ordre), mission_preuves(id, chemin, horodatage)')
    .eq('jeton', nu)
    .maybeSingle();

  if (!mission) return <MissionMorte raison="inconnu" />;
  const vivante = mission.statut === 'a_faire' || mission.statut === 'en_cours';
  if (!vivante) return <MissionMorte raison={mission.statut} />;
  return <MissionDuTier jeton={nu} mission={mission as unknown as import('./vue').MissionLégère} />;
}
