import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// ═══ JOBLIVE — le layout racine (le moule Resafix, la robe neuve).
// Trois voix : Outfit (les titres, géométrique charpentée), Plus
// Jakarta Sans (le corps, chaleureux et clair en mouvement), JetBrains
// Mono (l'horodatage — la preuve technique en chiffres alignés).

const outfit = Outfit({ subsets: ['latin'], variable: '--__outfit', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--__jakarta', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--__mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://joblive.app'),
  title: {
    default: 'JOBLIVE — Le travail vu en direct',
    template: '%s · JOBLIVE',
  },
  description:
    "La preuve de travail en direct : le prestataire montre, en photos horodatées, que le travail est fait — pendant qu'il le fait. Conciergerie, animaux, jardin, aide à domicile.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-512.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JOBLIVE',
  },
  openGraph: {
    title: 'JOBLIVE — Le travail vu en direct',
    description:
      'Le journal sans IA : des faits horodatés, des photos, la vérité du terrain — live.',
    url: 'https://joblive.app',
    siteName: 'JOBLIVE',
    locale: 'fr_FR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#123F3D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="font-corps">
        {children}
        <script
          dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}` }}
        />
      </body>
    </html>
  );
}
