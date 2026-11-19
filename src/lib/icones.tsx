'use client';

// Les icônes de la maison — traits 1.8, arrondis, sobres. Jamais de
// sémiologie policière (pas d'objectif menaçant, pas de cadenas).

export function Icône({ d, taille = 22, gras = 1.8 }: { d: string; taille?: number; gras?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={gras} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const P_LANCER = 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z';           // le chrono qui démarre
export const P_JOURNAL = 'M4 6h16M4 10h16M4 14h10M4 18h7';                             // le journal (lignes)
export const P_ANIMAUX = 'M5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-5 9v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2M3 20v-3a2 2 0 0 1 2-2'; // la patte douce
export const P_MENAGE = 'M4 4l9 9m-9-9v3m0-3h3m6 12 5 5m-2-2 3-3a2 2 0 0 0-3-3l-3 3'; // le geste net
export const P_JARDIN = 'M12 21v-8m0 0c0-4-3-7-7-7 0 4 3 7 7 7Zm0 0c0-4 3-7 7-7 0 4-3 7-7 7Z'; // la pousse
export const P_PISCINE = 'M2 17c2 0 2 1.5 4 1.5S8 17 10 17s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M2 12c2 0 2 1.5 4 1.5S8 12 10 12s2 1.5 4 1.5S16 12 18 12s2 1.5 4 1.5M8 12V5a2 2 0 0 1 4 0M14 12V5a2 2 0 0 1 4 0'; // l'eau
export const P_COURSES = 'M4 7h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 7Zm4 0a4 4 0 0 1 8 0'; // le panier
export const P_ACCUEIL = 'M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M14 12h.01';      // la porte qui s'ouvre (accueil voyageurs)
export const P_LINGE = 'M8 4 4 7l2 3 1-1v10h10V9l1 1 2-3-4-3a4 4 0 0 1-8 0Z';          // le tee plié (linge & remise)
export const P_LIVRE = 'M4 19V5a2 2 0 0 1 2-2h13v16H6.5A2.5 2.5 0 0 0 4 21.5V19Zm0 0a2.5 2.5 0 0 1 2.5-2.5H19'; // le catalogue (les pages)
export const P_AUTRE = 'M12 5v14m-7-7h14';                                              // le geste libre
export const P_CLE = 'M15 7a4 4 0 1 1-3.5 5.9L4 20l-1-1 1-2-1-1 2-1.5L3 13l8.1-8.1A4 4 0 0 1 15 7Z'; // le code d'accès
export const P_OEIL_LIVE = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'; // le o● (l'œil, pas la surveillance)
export const P_REGlages = 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7.4 7.4 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.4 7.4 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z';
