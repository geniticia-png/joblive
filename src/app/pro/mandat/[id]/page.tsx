import { redirect } from 'next/navigation';
import DossierClient from './client';

// ═══════════════════════════════════════════════════════════════════
// LE DOSSIER (23/11, JOBLIVE-DOSSIER.md) — le mandat ouvert au menu
// horizontal MISSION · INTERVENANT · AGENDA · CHIFFRES. La coquille
// sert (session pro) ; le client charge et marque lu.
// ═══════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';

export default async function PageDossier({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) redirect('/pro');
  return <DossierClient id={params.id} />;
}
