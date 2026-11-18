/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // LA SOUDURE HOSTINGER-SUPABASE (le moule Resafix, 06/11) : l'intégration
  // Hostinger pose SUPABASE_URL / SUPABASE_API_KEY (noms du guide officiel)
  // — or Next n'inline dans le bundle NAVIGATEUR que les NEXT_PUBLIC_*.
  // On cuit donc les valeurs Hostinger sous nos noms ; nos variables posées
  // à la main gardent la priorité. Vides au pire : les clients paresseux
  // rendent l'état vide élégant (jamais de crash au prerender).
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || '',
  },
};

export default nextConfig;
