'use client';

import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════
// LA SAISON DU BIEN (21/11, vision direction) — le propriétaire veut
// savoir où en est son bien, quand son envie lui prend : le calendrier
// de ses réservations, ses nuitées vendues, ses supports de vente.
// La réponse est déjà là — la conciergerie n'est plus dérangée.
// Les montants ne voyagent pas encore (la brique revenus viendra,
// dosée par la conciergerie : commission + frais fixes négociés).
// ═══════════════════════════════════════════════════════════════════

export type SéjourSaison = { debut: string; fin: string; canal: string | null };
export type Saison = { bien: string; sejours: SéjourSaison[]; canaux: string[] };

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function SaisonBien({ saison }: { saison: Saison }) {
  const aujourd = new Date(); aujourd.setHours(0, 0, 0, 0);
  const [curseur, setCurseur] = useState({ a: aujourd.getFullYear(), m: aujourd.getMonth() });

  // une nuit est occupée si un séjour la couvre — sémantique [début, fin)
  const occupée = (n: string) => saison.sejours.some((s) => s.debut <= n && n < s.fin);
  const arrivée = (n: string) => saison.sejours.some((s) => s.debut === n);
  const départ = (n: string) => saison.sejours.some((s) => s.fin === n);

  function nuitées(du: Date, au: Date): number {
    let n = 0;
    for (const s of saison.sejours) {
      const de = new Date(Math.max(new Date(s.debut + 'T00:00:00').getTime(), du.getTime()));
      const à = new Date(Math.min(new Date(s.fin + 'T00:00:00').getTime(), au.getTime()));
      n += Math.max(0, Math.round((à.getTime() - de.getTime()) / 86400000));
    }
    return n;
  }

  const premier = new Date(curseur.a, curseur.m, 1);
  const nbJours = new Date(curseur.a, curseur.m + 1, 0).getDate();
  const décalage = (premier.getDay() + 6) % 7; // la semaine commence lundi
  const cells: (Date | null)[] = [
    ...Array.from({ length: décalage }, () => null),
    ...Array.from({ length: nbJours }, (_, i) => new Date(curseur.a, curseur.m, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const aujourdhuiISO = iso(aujourd);
  const moisNuitées = nuitées(premier, new Date(curseur.a, curseur.m + 1, 1));
  const dansUnAn = new Date(aujourd); dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);
  const àVenir = nuitées(aujourd, dansUnAn);

  const bouger = (pas: number) => {
    const d = new Date(curseur.a, curseur.m + pas, 1);
    setCurseur({ a: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <section className="carte-preuve mt-6 p-5">
      <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">LA SAISON DE VOTRE BIEN</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate font-titre text-base font-bold text-vert">{saison.bien}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => bouger(-1)} aria-label="Mois précédent" className="flex h-8 w-8 items-center justify-center rounded-full bg-pierre text-vert transition hover:bg-vert-voile">‹</button>
          <span className="min-w-[92px] text-center text-sm font-semibold capitalize text-encre">{MOIS[curseur.m]} {curseur.a}</span>
          <button onClick={() => bouger(1)} aria-label="Mois suivant" className="flex h-8 w-8 items-center justify-center rounded-full bg-pierre text-vert transition hover:bg-vert-voile">›</button>
        </div>
      </div>

      {/* LE CALENDRIER — nuits occupées en vert, D l'arrivée, F le départ */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {JOURS.map((j, i) => (
          <span key={i} className="horodatage pb-1 text-[10px] font-semibold text-graphite">{j}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const n = iso(d);
          const libre = !occupée(n);
          const ceJour = n === aujourdhuiISO;
          return (
            <span key={i}
              className={`relative flex aspect-square items-center justify-center rounded-md text-xs font-semibold transition
                ${libre ? 'bg-pierre text-graphite/60' : 'bg-vert text-pierre'}
                ${ceJour ? 'ring-2 ring-vermillon ring-offset-1 ring-offset-white' : ''}`}
              title={libre ? undefined : 'réservé'}
            >
              {d.getDate()}
              {arrivée(n) && <span className="absolute -top-0.5 left-0.5 text-[8px] font-bold text-vermillon">D</span>}
              {départ(n) && <span className="absolute -top-0.5 right-0.5 text-[8px] font-bold text-vermillon">F</span>}
            </span>
          );
        })}
      </div>
      <p className="horodatage mt-2 text-[10px] text-graphite">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-vert align-middle" /> réservé · D arrivée · F départ · le jour cerclé, c&apos;est aujourd&apos;hui
      </p>

      {/* LES CHIFFRES DU BIEN */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-carte bg-pierre px-3 py-2.5 text-center">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">Nuitées {MOIS[curseur.m]}</p>
          <p className="font-titre text-xl font-bold text-vert">{moisNuitées}</p>
        </div>
        <div className="rounded-carte bg-pierre px-3 py-2.5 text-center">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">À venir (12 mois)</p>
          <p className="font-titre text-xl font-bold text-vert">{àVenir}</p>
        </div>
      </div>

      {/* LES SUPPORTS DE VENTE */}
      {saison.canaux.length > 0 && (
        <div className="mt-3">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">Votre bien se vend sur</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {saison.canaux.map((c) => (
              <span key={c} className="rounded-full border border-vert/30 bg-vert-voile px-2.5 py-1 text-[11px] font-semibold text-vert">{c}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
