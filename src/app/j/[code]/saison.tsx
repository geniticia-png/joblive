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
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-carte bg-pierre px-2 py-2.5 text-center">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">Nuitées</p>
          <p className="font-titre text-xl font-bold text-vert">{moisNuitées}</p>
        </div>
        <div className="rounded-carte bg-pierre px-2 py-2.5 text-center">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">Occupation</p>
          <p className="font-titre text-xl font-bold text-vert">{Math.round(100 * moisNuitées / nbJours)}&nbsp;%</p>
        </div>
        <div className="rounded-carte bg-pierre px-2 py-2.5 text-center">
          <p className="horodatage text-[10px] font-semibold uppercase tracking-wide text-graphite">À venir</p>
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

// ═══════════════════════════════════════════════════════════════════
// LES REVENUS DU BIEN (21/11, brique ③) — le revenu net estimé du
// propriétaire, sa fenêtre de décomposition (CA · dépenses du bien ·
// frais conciergerie · TVA · taxe de séjour). La conciergerie
// paramètre SON modèle (commission + frais fixes négociés) : le
// propriétaire voit le RÉSULTAT, jamais les règles.
// ═══════════════════════════════════════════════════════════════════

export type Revenus = {
  moisLabel: string;
  netMois: number;
  netAnnée: number;
  ca: number;
  depenses: { categorie: string; montant: number }[];
  commission: number | null;
  commissionMontant: number;
  fraisDétail: { libelle: string; montant: number }[];
  // (22/11, pont des incidents) Les frais de remplacement des
  // incidents CLOS — la ligne Provisions de la décomposition.
  provisions: { libelle: string; montant: number }[];
  tva: number;
  taxe: number;
};

const euros = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + '\u00A0€';

export function RevenusBien({ revenus }: { revenus: Revenus }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <section className="carte-preuve mt-4 p-5">
      <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">LES REVENUS DE VOTRE BIEN</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-graphite">Revenu net estimé — {revenus.moisLabel}</p>
          <p className="font-titre text-3xl font-bold text-vert">{euros(revenus.netMois)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-graphite">Cumul de l&apos;année</p>
          <p className="font-titre text-xl font-bold text-vert">{euros(revenus.netAnnée)}</p>
        </div>
      </div>

      <button onClick={() => setOuvert(!ouvert)} className="mt-3 w-full py-1.5 text-xs font-bold text-vert transition hover:text-vermillon">
        {ouvert ? 'fermer la décomposition ▲' : 'voir la décomposition ▼'}
      </button>
      {ouvert && (
        <div className="mt-2 space-y-1.5 rounded-carte bg-pierre p-3.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-encre">Chiffre d&apos;affaires (estimé)</span>
            <span className="font-semibold text-vert">{euros(revenus.ca)}</span>
          </div>
          {revenus.depenses.map((d) => (
            <div key={d.categorie} className="flex items-center justify-between text-sm">
              <span className="pl-3 text-graphite">− {d.categorie}</span>
              <span className="font-semibold text-graphite">{euros(d.montant)}</span>
            </div>
          ))}
          {revenus.commission != null && revenus.commission > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="pl-3 text-graphite">− Frais conciergerie (commission {Math.round(revenus.commission)}&nbsp;%)</span>
              <span className="font-semibold text-graphite">{euros(revenus.commissionMontant)}</span>
            </div>
          )}
          {revenus.fraisDétail.map((f) => (
            <div key={f.libelle} className="flex items-center justify-between text-sm">
              <span className="pl-3 text-graphite">− {f.libelle}</span>
              <span className="font-semibold text-graphite">{euros(f.montant)}</span>
            </div>
          ))}
          {(revenus.provisions ?? []).map((f) => (
            <div key={'p-' + f.libelle} className="flex items-center justify-between text-sm">
              <span className="pl-3 text-graphite">− Provisions — {f.libelle} <span className="text-[11px]">(incident clos)</span></span>
              <span className="font-semibold text-graphite">{euros(f.montant)}</span>
            </div>
          ))}
          <div className="mt-2 border-t border-pierre-sombre pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-graphite">Montant TVA <span className="text-[11px]">(informatif)</span></span>
              <span className="font-semibold text-graphite">{euros(revenus.tva)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-graphite">Taxe de séjour <span className="text-[11px]">(collectée pour la commune)</span></span>
              <span className="font-semibold text-graphite">{euros(revenus.taxe)}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-pierre-sombre pt-2.5">
            <span className="font-titre text-sm font-bold text-vert">Revenu net estimé</span>
            <span className="font-titre text-base font-bold text-vert">{euros(revenus.netMois)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
