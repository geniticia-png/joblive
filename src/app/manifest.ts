import type { MetadataRoute } from 'next';

// ═══════════════════════════════════════════════════════════════════
// LE MANIFEST PWA — la maison s'installe : « Ajouter à l'écran
// d'accueil » devient une vraie app (sans store, sans commission —
// la doctrine des sœurs). Vert forêt en fond, le JoB dedans.
// ═══════════════════════════════════════════════════════════════════
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JOBLIVE — Le travail vu en direct',
    short_name: 'JOBLIVE',
    description:
      "La preuve de travail en direct : photos horodatées, journal vivant, le client regarde sans demander.",
    lang: 'fr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F5F3',
    theme_color: '#123F3D',
    categories: ['business', 'productivity', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Démarrer une intervention',
        url: '/pro',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
