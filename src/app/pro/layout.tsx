import type { ReactNode } from 'react';
import { AtelierPro } from './atelier';

// ═══════════════════════════════════════════════════════════════════
// L'ATELIER PRO (23/11, verdict direction : « un espace avec 2 volets
// sur le même workflow, comme WhatsApp ») — la liste des dossiers à
// GAUCHE ne bouge jamais, le dossier ouvert vit à DROITE ; sur
// téléphone, un volet à la fois (la liste, puis le dossier). Toutes
// les pages pro vivent dans ce shell.
// ═══════════════════════════════════════════════════════════════════

export default function LayoutPro({ children }: { children: ReactNode }) {
  return <AtelierPro>{children}</AtelierPro>;
}
