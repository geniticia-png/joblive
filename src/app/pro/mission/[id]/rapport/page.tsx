import { redirect } from 'next/navigation';
import RapportClient from './client';

// ═══════════════════════════════════════════════════════════════════
// LE RAPPORT DE MISSION (23/11, chutjegère — sa formation chez Sixt
// doit se PROUVER) — la vue imprimable : cochages, mots du tiers,
// photos horodatées, sceau. window.print() → le navigateur fait le
// PDF, zéro dépendance. Sixt reçoit la preuve.
// ═══════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';

export default async function PageRapport({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) redirect('/pro');
  return <RapportClient id={params.id} />;
}
