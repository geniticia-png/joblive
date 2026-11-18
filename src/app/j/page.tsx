'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// L'ENTRÉE PAR CODE — six signes mémorables (J7B-492), sans compte,
// sans mot de passe. Le lien SMS/WhatsApp du pro mène directement à
// /j/<code> ; cette page sert à la saisie manuelle.
export default function EntréeCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [attente, setAttente] = useState(false);

  function entrer(e: React.FormEvent) {
    e.preventDefault();
    const nu = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (nu.length < 4) return;
    setAttente(true);
    router.push(`/j/${nu}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pierre px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="monogramme mb-8 block text-center text-4xl">
          J<span className="o-live mx-1" aria-label="o" />B
        </Link>
        <div className="carte-preuve p-7">
          <h1 className="text-center font-titre text-xl font-bold text-vert">Votre journal en direct</h1>
          <p className="mt-1.5 text-center text-sm text-graphite">Le code que votre prestataire vous a donné.</p>
          <form onSubmit={entrer} className="mt-6">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="J7B-492"
              maxLength={7}
              autoComplete="off" autoCorrect="off" spellCheck={false}
              className="horodatage w-full rounded-champ border border-pierre-sombre bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.25em] text-vert outline-none transition focus:border-vert focus:ring-[3px] focus:ring-vert/10"
            />
            <button type="submit" disabled={attente || code.replace(/[^A-Z0-9]/g, '').length < 4}
              className="mt-4 w-full rounded-full bg-vert py-3.5 font-titre text-base font-semibold text-white shadow-carte transition hover:opacity-92 disabled:opacity-40">
              {attente ? 'Ouverture…' : 'Voir le travail'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-graphite">
          Lecture seule, horodatée, certifiée.<br />Votre prestataire choisit ce qu&apos;il partage — la transparence est son outil.
        </p>
      </div>
    </main>
  );
}
