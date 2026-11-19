import { CatalogueClient } from './client';

// ═══════════════════════════════════════════════════════════════════
// LE CATALOGUE (étape ② de la vision direction) — les services, leurs
// tâches générales et particulières, et LA JOBLIVISATION : chaque
// élément porte son drapeau, partagé via JOBLIVE ou interne.
// ═══════════════════════════════════════════════════════════════════
export const metadata = { title: 'Catalogue' };

export default function PageCatalogue() {
  return <CatalogueClient />;
}
