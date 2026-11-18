'use client';

// ═══════════════════════════════════════════════════════════════════
// JOBLIVE — LE SCEAU D'INTÉGRITÉ (le composant signature, DESIGN.md).
// Double anneau pointillé, texte courbe HORODATÉ · CERTIFIÉ · JOBLIVE,
// point vermillon au centre qui pulse au moment de la signature.
// En SVG pur : net à toute taille, le texte ne se coupe jamais.
// ═══════════════════════════════════════════════════════════════════

export function Sceau({
  taille = 64,
  horodatage,
  animé = false,
  sombre = false,
}: {
  taille?: number;
  horodatage?: string;      // ex. « 18.11 — 14:32 »
  animé?: boolean;          // le halo pulse (la signature vient d'avoir lieu)
  sombre?: boolean;         // sur fond vert (vue viseur)
}) {
  const encre = sombre ? '#F4F5F3' : '#123F3D';
  const id = `arc-${taille}-${sombre ? 'n' : 'j'}`;
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      role="img"
      aria-label={horodatage ? `Preuve certifiée ${horodatage}` : 'Preuve certifiée JOBLIVE'}
      className={animé ? 'animate-[sceau-pulse_1.5s_ease-in-out_infinite]' : ''}
    >
      <defs>
        <path id={id} d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
      </defs>
      {/* anneau extérieur pointillé */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={encre} strokeWidth="1.5" strokeDasharray="2.5 3.5" opacity="0.9" />
      {/* texte courbé */}
      <text fontSize="8.2" fontFamily="var(--__mono), monospace" fontWeight="600" fill={encre} letterSpacing="1.6">
        <textPath href={`#${id}`} startOffset="2%">HORODATÉ · CERTIFIÉ · JOBLIVE</textPath>
      </text>
      {/* anneau intérieur */}
      <circle cx="50" cy="50" r="24" fill="none" stroke={encre} strokeWidth="1.2" opacity="0.55" />
      {/* le point live — l'unique vermillon */}
      <circle cx="50" cy="50" r="7.5" fill="#D9381E" />
      {animé && <circle cx="50" cy="50" r="7.5" fill="none" stroke="#D9381E" strokeWidth="1.5" opacity="0.6" className="animate-[sceau-halo_1.5s_ease-out_infinite]" />}
      {horodatage && (
        <text x="50" y="84" textAnchor="middle" fontSize="7.5" fontFamily="var(--__mono), monospace" fill={encre} opacity="0.75">
          {horodatage}
        </text>
      )}
    </svg>
  );
}

/** Le badge DIRECT — fond vermillon translucide, point qui clignote
 *  lentement (1,5 s), JetBrains Mono. L'un des trois usages du vermillon. */
export function BadgeDirect({ texte = 'DIRECT' }: { texte?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-vermillon" style={{ background: 'rgba(217, 56, 30, 0.12)' }}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermillon animate-[direct_1.5s_ease-in-out_infinite]" />
      {texte}
    </span>
  );
}
