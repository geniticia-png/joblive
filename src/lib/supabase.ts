// Le client Supabase PUBLIC — anon, la porte fermée (RLS côté base,
// zéro policy : l'anon ne lit rien, tout voyage par le serveur).
// Il ne sert qu'à l'AUTH (magic link) — le moule Resafix : naissance
// PARESSEUSE, jamais au chargement du module ; le build peut tourner
// sans .env (leçon du 06/11), le prerender ne crashe jamais.
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client == null) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Variables Supabase absentes (NEXT_PUBLIC_*)');
    _client = createClient(url, key);
  }
  return _client;
}

// Le client SERVEUR À CLÉ SERVICE — le seul qui lit/écrit la vérité
// (doctrine : RLS activée, zéro policy, filtrage par le code serveur).
// Il vit uniquement dans les routes API et les composants serveur.
export function getSupabaseService(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables Supabase service absentes');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (entrée, init) => fetch(entrée as any, { ...init, cache: 'no-store' }) },
  });
}
