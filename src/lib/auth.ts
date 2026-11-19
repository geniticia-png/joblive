// ═══════════════════════════════════════════════════════════════════
// JOBLIVE — LA SESSION DU PRESTATAIRE : le magic link ouvre, le
// bearer token prouve. Les routes API vérifient toujours côté
// serveur (getUser) — le client ne s'auto-déclare jamais.
// ═══════════════════════════════════════════════════════════════════
import { getSupabase } from './supabase';

export interface Pro {
  id: string;
  nom: string;
  email: string;
  metiers: string[];
  enseigne: string | null;
}

/** Le pro authentifié d'une requête API (bearer → getUser → pros), ou null. */
export async function proDeLaRequête(req: Request): Promise<Pro | null> {
  const auth = req.headers.get('authorization') ?? '';
  const jeton = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!jeton) return null;
  try {
    const sb = getSupabase();
    const { data: userData, error } = await sb.auth.getUser(jeton);
    if (error || !userData?.user) return null;
    const service = await import('./supabase').then(m => m.getSupabaseService());
    const { data: pro } = await service
      .from('pros')
      .select('id, nom, email, metiers, enseigne')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (pro) return pro as Pro;
    // Première venue : le pro naît à sa première connexion validée.
    // Le nom restera son préfixe d'email jusqu'à la carte « Comment
    // vous appelez-vous ? » (leçon du jeu de rôle 19/11 : l'identité
    // ne souffre pas l'anonymat, des deux côtés du journal).
    const email = userData.user.email ?? '';
    const { data: né } = await service
      .from('pros')
      .insert({ id: userData.user.id, email, nom: email.split('@')[0] })
      .select('id, nom, email, metiers, enseigne')
      .single();
    return (né as Pro) ?? null;
  } catch {
    return null;
  }
}

/** Le header bearer depuis la session navigateur (côté client). */
export async function entêteSession(): Promise<Record<string, string>> {
  const { data } = await getSupabase().auth.getSession();
  const jeton = data.session?.access_token;
  return jeton ? { authorization: `Bearer ${jeton}` } : {};
}
