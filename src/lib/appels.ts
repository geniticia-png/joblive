'use client';

import { entêteSession } from './auth';

// Les appels authentifiés du navigateur — le bearer voyage avec
// chaque geste, le serveur vérifie toujours (jamais d'auto-déclaration).

export async function appeller<T = any>(chemin: string, corps?: unknown, méthode = 'POST'): Promise<T> {
  const entêtes = { ...(await entêteSession()) };
  if (corps !== undefined) entêtes['content-type'] = 'application/json';
  const r = await fetch(chemin, {
    method: méthode,
    headers: entêtes,
    body: corps !== undefined ? JSON.stringify(corps) : undefined,
  });
  if (r.status === 401) throw new Error('session');
  const données = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(données?.erreur ?? `erreur ${r.status}`);
  return données as T;
}

export async function envoyerPreuve(interventionId: string, genre: 'avant' | 'apres', blob: Blob, horodatage: string) {
  const entêtes = await entêteSession();
  const form = new FormData();
  form.set('intervention_id', interventionId);
  form.set('genre', genre);
  form.set('horodatage', horodatage);
  form.set('fichier', blob, `preuve-${genre}.jpg`);
  const r = await fetch('/api/preuves', { method: 'POST', headers: entêtes, body: form });
  if (!r.ok) throw new Error('preuve');
  return r.json();
}

/** Réduit la photo du terrain (3-8 Mo → ~200 Ko, 1600px max) : la
 *  preuve voyage vite, la qualité reste lisible. L'horodatage naît
 *  à la PRISE — capturé avant la compression, envoyé tel quel. */
export async function réduirePhoto(fichier: File): Promise<{ blob: Blob; horodatage: string }> {
  const horodatage = new Date().toISOString();
  const bitmap = await createImageBitmap(fichier).catch(() => null);
  if (!bitmap) return { blob: fichier, horodatage };
  const max = 1600;
  const échelle = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canevas = document.createElement('canvas');
  canevas.width = Math.round(bitmap.width * échelle);
  canevas.height = Math.round(bitmap.height * échelle);
  canevas.getContext('2d')!.drawImage(bitmap, 0, 0, canevas.width, canevas.height);
  const blob = await new Promise<Blob | null>((résous) => canevas.toBlob(résous, 'image/jpeg', 0.82));
  return { blob: blob ?? fichier, horodatage };
}
