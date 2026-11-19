import { MissionsClient } from './client';

// ═══════════════════════════════════════════════════════════════════
// LES MISSIONS TIERCES (étape ③ de la vision) — l'amont : la
// conciergerie assigne, le tiers exécute, les éléments (et leurs
// drapeaux) remontent vers elle.
// ═══════════════════════════════════════════════════════════════════
export const metadata = { title: 'Missions' };

export default function PageMissions() {
  return <MissionsClient />;
}
