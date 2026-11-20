'use client';

// LA NAV BASSE — un seul composant pour les quatre pages (les quatre
// copies duplicuées meurent ici). LE BADGE MISSIONS compte le travail
// indirect terminé que le pro n'a pas encore ouvert : le centre voit
// sans chercher (verdict direction du 20/11 — le client voyait, pas
// la conciergerie).
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appeller } from '@/lib/appels';
import { Icône, P_JOURNAL, P_CLE, P_LIVRE, P_EQUIPE } from '@/lib/icones';

export function NavPro() {
  const chemin = usePathname();
  const [àRegarder, setÀRegarder] = useState(0);

  const chargerBadge = useCallback(() => {
    appeller<{ missions: { statut: string; vue_le: string | null }[] }>('/api/missions', undefined, 'GET')
      .then((d) => setÀRegarder((d.missions ?? []).filter((m) => m.statut === 'faite' && !m.vue_le).length))
      .catch(() => {});
  }, []);

  useEffect(() => { chargerBadge(); }, [chargerBadge, chemin]);
  // la page missions crie « joblive:missions » après chaque geste :
  // le badge s'éteint sans attendre la navigation.
  useEffect(() => {
    window.addEventListener('joblive:missions', chargerBadge);
    return () => window.removeEventListener('joblive:missions', chargerBadge);
  }, [chargerBadge]);

  const onglet = (href: string) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2.5 transition ${chemin === href ? 'text-vert' : 'text-graphite hover:text-vert'}`;

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-pierre-sombre bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        <Link href="/pro" className={onglet('/pro')}>
          <Icône d={P_JOURNAL} taille={20} />
          <span className="text-[10px] font-bold">Journal</span>
        </Link>
        <Link href="/pro/mandats" className={onglet('/pro/mandats')}>
          <Icône d={P_CLE} taille={20} />
          <span className="text-[10px] font-bold">Mandats &amp; codes</span>
        </Link>
        <Link href="/pro/catalogue" className={onglet('/pro/catalogue')}>
          <Icône d={P_LIVRE} taille={20} />
          <span className="text-[10px] font-bold">Catalogue</span>
        </Link>
        <Link href="/pro/missions" className={onglet('/pro/missions')}>
          <span className="relative">
            <Icône d={P_EQUIPE} taille={20} />
            {àRegarder > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vermillon px-1 text-[9px] font-bold text-white">
                {àRegarder}
              </span>
            )}
          </span>
          <span className="text-[10px] font-bold">Missions</span>
        </Link>
      </div>
    </nav>
  );
}
