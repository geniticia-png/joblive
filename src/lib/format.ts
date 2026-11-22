export const CATÉGORIES = [
  { cle: 'animaux', label: 'Animaux' },
  { cle: 'menage', label: 'Ménage' },
  { cle: 'accueil', label: 'Accueil' },
  { cle: 'linge', label: 'Linge' },
  { cle: 'jardin', label: 'Jardin' },
  { cle: 'piscine', label: 'Piscine' },
  { cle: 'courses', label: 'Courses' },
  { cle: 'incident', label: 'Incident' },
  { cle: 'mission', label: 'Mission' },
  { cle: 'autre', label: 'Autre' },
] as const;

export function labelCatégorie(cle: string): string {
  return CATÉGORIES.find((c) => c.cle === cle)?.label ?? cle;
}

const FMT_HEURE = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const FMT_DATE = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const FMT_COMPLET = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long',
  hour: '2-digit', minute: '2-digit',
});

export const heure = (iso: string | null | undefined) => (iso ? FMT_HEURE.format(new Date(iso)) : '');
export const dateLongue = (iso: string | null | undefined) => (iso ? FMT_DATE.format(new Date(iso)) : '');
export const horodatageComplet = (iso: string | null | undefined) => (iso ? FMT_COMPLET.format(new Date(iso)) : '');

/** L'horodatage mono façon reçu : « 18.11 — 14:32 ». */
export function tampon(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}.${mm} — ${FMT_HEURE.format(d)}`;
}

export function durée(secondes: number | null | undefined): string {
  if (!secondes || secondes < 30) return '';
  const m = Math.round(secondes / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
}
