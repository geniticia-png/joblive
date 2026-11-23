import { DashboardPro } from './client';

// (23/11) ?lancer=<mandat> — la barre de geste du dossier ramène ici,
// le lanceur s'ouvre tout seul, le dossier déjà choisi.
export default function Page({ searchParams }: { searchParams: { lancer?: string } }) {
  return <DashboardPro lancerMandat={searchParams.lancer} />;
}
