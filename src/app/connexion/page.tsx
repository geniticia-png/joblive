'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

// LA CONNEXION PAR MAGIC LINK — le prestataire tape son email, la
// boîte fait le reste. Pas de mot de passe à retenir sur le terrain.
export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [envoyé, setEnvoyé] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [configAbsente, setConfigAbsente] = useState(false);
  const [attente, setAttente] = useState(false);

  // Session déjà vivante (retour du magic link : supabase-js capte le
  // jeton dans l'URL) → la maison du pro s'ouvre.
  useEffect(() => {
    let sb: ReturnType<typeof getSupabase>;
    try {
      sb = getSupabase();
    } catch {
      setConfigAbsente(true);
      return;
    }
    const { data: écoute } = sb.auth.onAuthStateChange((évènement, session) => {
      if (évènement === 'SIGNED_IN' && session) router.replace('/pro');
    });
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/pro');
    });
    return () => écoute.subscription.unsubscribe();
  }, [router]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setAttente(true);
    try {
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/connexion` },
      });
      if (error) throw error;
      setEnvoyé(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'L\'envoi a échoué');
    } finally {
      setAttente(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pierre px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center">
          <img src="/logo-job.png" alt="JOBLIVE" className="mx-auto h-14 w-auto" />
        </Link>

        <div className="carte-preuve p-7">
          {configAbsente ? (
            <p className="text-center text-sm leading-relaxed text-graphite">
              La maison attend sa soudure Supabase
              (projet dédié en cours de création par la direction).
              Revenez dès qu&apos;elle est née.
            </p>
          ) : envoyé ? (
            <div className="text-center">
              <p className="horodatage text-xs font-semibold tracking-widest text-vermillon">VOYANT ALLUMÉ</p>
              <h1 className="mt-2 font-titre text-xl font-bold text-vert">Regardez votre boîte mail</h1>
              <p className="mt-3 text-sm leading-relaxed text-graphite">
                Le lien magique part vers <strong className="text-vert">{email}</strong>.
                Un clic, et votre journal s&apos;ouvre.
              </p>
            </div>
          ) : (
            <form onSubmit={envoyer}>
              <h1 className="font-titre text-xl font-bold text-vert">Entrer dans la maison</h1>
              <p className="mt-1.5 text-sm text-graphite">Votre email, un lien, aucun mot de passe.</p>
              <label className="mt-5 block text-sm font-bold text-vert" htmlFor="email">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="claire@maison-vertes.fr"
                className="mt-1.5 w-full rounded-champ border border-pierre-sombre bg-white px-4 py-3.5 text-base outline-none transition focus:border-vert focus:ring-[3px] focus:ring-vert/10"
              />
              {erreur && <p className="mt-3 text-sm text-vermillon">{erreur}</p>}
              <button
                type="submit"
                disabled={attente}
                className="mt-5 w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white shadow-carte transition hover:opacity-92 disabled:opacity-50"
              >
                {attente ? 'Envoi…' : 'Recevoir mon lien'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-graphite">
          Vous êtes client&nbsp;? <Link href="/j" className="font-semibold text-vert underline underline-offset-2">Entrez votre code d&apos;accès</Link>
        </p>
      </div>
    </main>
  );
}
