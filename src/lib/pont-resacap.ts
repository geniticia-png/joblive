// ═══════════════════════════════════════════════════════════════════
// LE PONT DU BIEN (21/11) — Joblive parle à RésaCap, scellé HMAC.
// -------------------------------------------------------------------
// La face propriétaire du pont sœurs : le moteur est RésaCap (les
// séjours, les canaux), le visage est Joblive (la page du
// propriétaire). Chaque demande porte le sceau SECRET_PARTENAIRES
// sur action + email + unit + plage — personne ne forge une saison.
// Ne s'utilise QUE côté serveur (jamais dans le navigateur).
// ═══════════════════════════════════════════════════════════════════
import { createHmac } from 'crypto';

const SECRET = () => {
  const s = process.env.SECRET_PARTENAIRES;
  if (!s) throw new Error('SECRET_PARTENAIRES absent — le pont ne peut pas sceller.');
  return s;
};

function sceauBien(action: string, email: string, unitId: string, debut: string, fin: string): string {
  return createHmac('sha256', SECRET()).update(`pont-bien:${action}:${email}:${unitId}:${debut}:${fin}`).digest('base64url');
}

export type Séjour = { debut: string; fin: string; montant: number | null; canal: string | null };
export type Saison = { bien: string; sejours: Séjour[]; canaux: string[] };
export type Période = {
  nuits: number; ca: number; nb_sejours: number;
  tva: number; taxe: number;
  depenses: { categorie: string; montant: number }[];
};
export type FraisIncident = { libelle: string; montant: number };
export type Incident = {
  date: string; categorie: string; description: string;
  photos: string[]; frais: FraisIncident[];
};

async function appeler<T>(corps: Record<string, unknown>): Promise<T> {
  const base = process.env.RESACAP_URL ?? 'https://www.resacap.fr';
  const r = await fetch(`${base}/api/pont-bien`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(corps),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`pont-bien ${r.status}`);
  return r.json() as Promise<T>;
}

/** L'annuaire : les hébergements du compte RésaCap (par email). */
export function unitesResacap(email: string) {
  const e = email.trim().toLowerCase();
  return appeler<{ ok: boolean; unites: { id: string; slug: string; nom: string }[] }>({
    action: 'unites', email: e, unit_id: '', debut: '', fin: '',
    sceau: sceauBien('unites', e, '', '', ''),
  });
}

/** La saison d'un bien : les séjours confirmés de la plage + les
 *  canaux actifs. Les blocs pinceau ne voyagent jamais. */
export function saisonResacap(email: string, unitId: string, debut: string, fin: string) {
  const e = email.trim().toLowerCase();
  return appeler<Saison & { ok: boolean }>({
    action: 'saison', email: e, unit_id: unitId, debut, fin,
    sceau: sceauBien('saison', e, unitId, debut, fin),
  });
}

/** LA PÉRIODE (brique revenus) — ce que le moteur sait du bien pour
 *  la fenêtre : nuitées, CA estimé (prorata par nuit), TVA et taxe
 *  au prorata des factures, dépenses par catégorie native. Le modèle
 *  négocié (commission + frais fixes) vit ici, sur le mandat. */
export function periodeResacap(email: string, unitId: string, debut: string, fin: string) {
  const e = email.trim().toLowerCase();
  return appeler<Période & { ok: boolean }>({
    action: 'periode', email: e, unit_id: unitId, debut, fin,
    sceau: sceauBien('periode', e, unitId, debut, fin),
  });
}

/** LES INCIDENTS (22/11, le pont des incidents) — la preuve voyageur
 *  déjà traitée par la conciergerie : seuls les CLOS traversent (la
 *  cloture chez RésaCap est l'acte de publication), frais compris —
 *  ils nourrissent les Provisions de la décomposition. Jamais le nom
 *  du voyageur : la dose commence au pont. */
export function incidentsResacap(email: string, unitId: string, debut: string, fin: string) {
  const e = email.trim().toLowerCase();
  return appeler<{ ok: boolean; incidents: Incident[] }>({
    action: 'incidents', email: e, unit_id: unitId, debut, fin,
    sceau: sceauBien('incidents', e, unitId, debut, fin),
  });
}
