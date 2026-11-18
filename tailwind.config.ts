import type { Config } from 'tailwindcss';

// ═══════════════════════════════════════════════════════════════════
// JOBLIVE — LA ROBE (18/11, tranchée à trois voix) : vert forêt
// #123F3D (l'autorité douce), pierre #F4F5F3 (le fond qui respire),
// vermillon #D9381E (LA touche unique : le point live, le bouton
// Publier, le badge DIRECT — jamais ailleurs). Jamais les couleurs
// des sœurs (violet RésaCap, azur Biendispo, orange Aktivit,
// ivoire/champagne Resafix).
// ═══════════════════════════════════════════════════════════════════
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vert: {
          DEFAULT: '#123F3D',
          nuit: '#0D2E2C',
          voile: 'rgba(18, 63, 61, 0.08)',
          halo: 'rgba(18, 63, 61, 0.04)',
        },
        pierre: {
          DEFAULT: '#F4F5F3',
          sombre: '#E2E4DE',
        },
        vermillon: {
          DEFAULT: '#D9381E',
          voile: 'rgba(217, 56, 30, 0.12)',
        },
        graphite: '#5A6563',
        encre: '#191C1B',
      },
      fontFamily: {
        titre: ['var(--__outfit)', 'system-ui', 'sans-serif'],
        corps: ['var(--__jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--__mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        carte: '24px',
        champ: '16px',
        conteneur: '32px',
      },
      boxShadow: {
        carte: '0px 4px 20px -2px rgba(18, 63, 61, 0.04)',
        haute: '0px 12px 32px -4px rgba(18, 63, 61, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
