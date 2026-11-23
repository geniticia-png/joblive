'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

// L'ÉCRAN DE MARIE — le tier voit SA mission : le titre, le lieu, ses
// éléments à cocher, ses photos. Il ne voit JAMAIS les drapeaux ●○ :
// la dose est l'affaire de la conciergerie (la vision : le pro décide
// de l'amont ET de l'aval — le tier exécute, simplement).

type Élément = { id: string; libelle: string; genre: string; fait: boolean; commentaire: string | null; ordre: number };
type Preuve = { id: string; chemin: string; horodatage: string; element_id: string | null };
export type MissionLégère = {
  id: string; titre: string; statut: string; prevue_le: string | null;
  prix: string | null; conditions: string | null; accepte_le: string | null;
  tiers: { nom: string } | null;
  mandats: { client_nom: string; lieu: string } | null;
  mission_elements: Élément[];
  mission_preuves: Preuve[];
};

const URL_PHOTO = (chemin: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/preuves/${chemin}`;

export function MissionMorte({ raison }: { raison: string }) {
  const texte = raison === 'faite'
    ? 'Cette mission est terminée — merci pour le beau travail.'
    : raison === 'annulee'
      ? 'Cette mission a été annulée par la conciergerie.'
      : 'Ce lien ne correspond à aucune mission. Vérifiez le message reçu.';
  return (
    <main className="flex min-h-screen items-center justify-center bg-pierre px-5">
      <div className="w-full max-w-sm text-center">
        <Image src="/logo-job.png" alt="" width={126} height={56} className="mx-auto block h-12 w-auto opacity-40" />
        <div className="carte-preuve mt-6 p-8">
          <h1 className="font-titre text-xl font-bold text-vert">{raison === 'faite' ? 'Mission terminée' : 'Ce lien ne vit plus'}</h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite">{texte}</p>
        </div>
      </div>
    </main>
  );
}

export function MissionDuTier({ jeton, mission: m0 }: { jeton: string; mission: MissionLégère }) {
  const router = useRouter();
  const [mission, setMission] = useState(m0);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const entréePhoto = useRef<HTMLInputElement>(null);
  // (013) La brouillon des mots — un par geste, posé AVEC la coche.
  const [mots, setMots] = useState<Record<string, string>>({});
  // (011) La photo visée : l'élément qu'elle prouve (null = libre).
  const [cible, setCible] = useState<string | null>(null);
  function viser(element: string | null) {
    setCible(element);
    entréePhoto.current?.click();
  }

  const api = `${jeton}`;
  async function geste(corps: Record<string, unknown>) {
    setEnvoi(true);
    try {
      await fetch(`/api/mission-jeton/${api}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corps),
      });
      const d = await (await fetch(`/api/mission-jeton/${api}`)).json();
      if (d.mission) setMission({ ...d.mission });
    } finally { setEnvoi(false); }
  }

  async function photographier(fichier: File, element?: string) {
    // l'horodatage naît à la PRISE (la doctrine : la vérité du geste).
    // (011) `element` lie la photo à SON geste — la preuve point par
    // point ; sans lui, la photo reste libre de mission.
    const horodatage = new Date().toISOString();
    const form = new FormData();
    form.set('fichier', fichier);
    form.set('horodatage', horodatage);
    if (element) form.set('element', element);
    setEnvoi(true);
    try {
      await fetch(`/api/mission-jeton/${api}`, { method: 'POST', body: form });
      const d = await (await fetch(`/api/mission-jeton/${api}`)).json();
      if (d.mission) setMission({ ...d.mission });
    } finally { setEnvoi(false); }
  }

  async function terminer() {
    await geste({ action: 'terminer' });
    setMessage('Mission terminée — la conciergerie voit votre travail. Merci !');
    router.refresh();
  }

  // L'ORDRE DE MISSION (20/11 4ᵉ) — le prix et les conditions se
  // lisent, puis la mission se SIGNE : rien ne s'ouvre avant, et le
  // serveur garde la même porte que l'écran.
  const pasEncoreAcceptée = !mission.accepte_le;
  async function accepter() {
    await geste({ action: 'accepter' });
  }

  const générales = mission.mission_elements.filter((e) => e.genre === 'generale');
  const particulières = mission.mission_elements.filter((e) => e.genre === 'particuliere');
  const faits = mission.mission_elements.filter((e) => e.fait).length;

  return (
    <main className="min-h-screen pb-16">
      {/* L'EN-TÊTE — qui je suis, où je vais */}
      <header className="bg-vert px-5 pt-6 pb-7">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2.5">
              <Image src="/logo-job-nuit.png" alt="JOBLIVE" width={63} height={28} className="h-7 w-auto" />
              <span className="align-middle font-titre text-sm font-semibold tracking-[0.18em] text-pierre opacity-80">JOBLIVE</span>
            </span>
            <span className="rounded-full bg-vermillon px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">MA MISSION</span>
          </div>
          <h1 className="mt-4 font-titre text-2xl font-bold leading-snug text-pierre">{mission.titre}</h1>
          <p className="mt-1.5 text-sm text-pierre/70">
            {mission.mandats?.client_nom}{mission.mandats?.lieu ? ` — ${mission.mandats.lieu}` : ''}
            {mission.prevue_le ? ` · prévue le ${new Date(mission.prevue_le).toLocaleDateString('fr-FR')}` : ''}
          </p>
          <p className="horodatage mt-2 text-xs text-pierre/60">
            {faits}/{mission.mission_elements.length} faits · {mission.mission_preuves.length} photo{mission.mission_preuves.length > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-md px-5">
        {message && (
          <p className="mt-4 rounded-champ bg-vert-voile px-4 py-3 text-center text-sm font-semibold text-vert">{message}</p>
        )}

        {/* L'ORDRE DE MISSION (20/11 4ᵉ) — à lire, puis à signer :
            le travail s'ouvre après l'acceptation (le serveur garde
            la même porte que l'écran). */}
        {pasEncoreAcceptée ? (
          <section className="carte-preuve mt-6 p-6">
            <p className="horodatage text-[10px] font-semibold tracking-[0.22em] text-vermillon">L&apos;ORDRE DE MISSION</p>
            <h2 className="mt-2 font-titre text-lg font-bold text-vert">{mission.titre}</h2>
            {mission.prix ? (
              <p className="mt-3 font-titre text-2xl font-bold text-vert">{mission.prix}</p>
            ) : (
              <p className="mt-3 text-sm text-graphite">Rémunération à convenir avec la conciergerie.</p>
            )}
            {mission.conditions && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-graphite">{mission.conditions}</p>
            )}
            <button onClick={accepter} disabled={envoi}
              className="mt-5 w-full rounded-full bg-vermillon py-4 font-titre text-base font-bold text-white shadow-haute transition hover:opacity-92 disabled:opacity-50">
              {envoi ? 'Enregistrement…' : 'J\u2019accepte la mission'}
            </button>
            <p className="mt-3 text-center text-xs text-graphite">Les gestes et les photos s&apos;ouvrent après votre acceptation.</p>
          </section>
        ) : (
          <>
            <p className="horodatage mt-4 text-center text-[10px] font-semibold tracking-wide text-vert">
              MISSION ACCEPTÉE ✓{' '}
              {new Date(mission.accepte_le!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* LES ÉLÉMENTS — de grosses cases, une main, du soleil */}
        {([['Mes gestes', générales], ['Les consignes du lieu', particulières]] as const).map(([titre, liste]) =>
          liste.length > 0 ? (
            <section key={titre} className="mt-6">
              <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-vert">{titre}</h2>
              <div className="mt-2 space-y-2">
                {liste.map((e) => {
                  // (011) LES PHOTOS DU GESTE — la preuve point par point,
                  // plusieurs par geste (la vraie vie du terrain).
                  const photos = mission.mission_preuves.filter((p) => p.element_id === e.id);
                  return (
                    <div key={e.id} className="rounded-carte border border-pierre-sombre bg-white px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={e.fait}
                            disabled={envoi}
                            onChange={(ev) => geste({
                              action: 'element-fait', id: e.id, fait: ev.target.checked,
                              // (013) LE MOT VOYAGE AVEC LA COCHE — un geste =
                              // cocher + commenter, d'un seul trait.
                              commentaire: mots[e.id] ?? e.commentaire ?? '',
                            })}
                            className="h-6 w-6 shrink-0 cursor-pointer accent-[#123F3D]"
                          />
                          <span className={`text-base ${e.fait ? 'text-graphite line-through' : 'text-encre'}`}>{e.libelle}</span>
                        </label>
                        <button
                          onClick={() => viser(e.id)}
                          disabled={envoi}
                          title="Photographier ce geste"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-vert text-vert transition hover:bg-vert-voile disabled:opacity-50"
                        >
                          <span className="text-base leading-none">📷</span>
                        </button>
                      </div>
                      {/* (013, chutjegère) UN MOT SUR CE GESTE — facultatif,
                          posé avec la coche ; amendable tant que le geste
                          vit (on blur, le mot se sauvegarde). */}
                      <input
                        type="text"
                        value={mots[e.id] ?? e.commentaire ?? ''}
                        onChange={(ev) => setMots((m) => ({ ...m, [e.id]: ev.target.value }))}
                        onBlur={() => {
                          const mot = (mots[e.id] ?? '').trim();
                          if (e.fait && mot && mot !== (e.commentaire ?? '')) {
                            geste({ action: 'element-fait', id: e.id, fait: true, commentaire: mot });
                          }
                        }}
                        placeholder="Un mot sur ce geste ? (facultatif)"
                        disabled={envoi}
                        className="mt-2 w-full rounded-champ border border-pierre-sombre/60 bg-pierre/40 px-3 py-2 text-sm text-encre placeholder:text-graphite/60 focus:border-vert focus:bg-white focus:outline-none"
                      />
                      {photos.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          {photos.map((p) => (
                            <figure key={p.id} className="relative overflow-hidden rounded-champ">
                              <Image src={URL_PHOTO(p.chemin)} alt="" width={200} height={150} className="aspect-[4/3] w-full object-cover" unoptimized />
                              <figcaption className="horodatage absolute bottom-1 left-1 rounded bg-vert-nuit/80 px-1.5 py-0.5 text-[9px] font-semibold text-pierre">
                                {new Date(p.horodatage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null,
        )}

        {/* LES PHOTOS LIBRES — celles d'aucun geste en particulier */}
        <section className="mt-7">
          <h2 className="font-titre text-sm font-bold uppercase tracking-wide text-vert">Mes photos</h2>
          <p className="mt-1 text-xs text-graphite">Chaque photo porte l&apos;heure de sa prise — c&apos;est elle qui parle pour vous.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {mission.mission_preuves.filter((p) => !p.element_id).map((p) => (
              <figure key={p.id} className="relative overflow-hidden rounded-champ">
                <Image src={URL_PHOTO(p.chemin)} alt="" width={200} height={150} className="aspect-[4/3] w-full object-cover" unoptimized />
                <figcaption className="horodatage absolute bottom-1 left-1 rounded bg-vert-nuit/80 px-1.5 py-0.5 text-[9px] font-semibold text-pierre">
                  {new Date(p.horodatage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </figcaption>
              </figure>
            ))}
            <button
              onClick={() => viser(null)}
              disabled={envoi}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-champ border-[1.5px] border-dashed border-vert text-vert transition hover:bg-vert-voile disabled:opacity-50"
            >
              <span className="text-2xl leading-none">📷</span>
              <span className="text-[10px] font-bold">{envoi ? 'envoi…' : 'photographier'}</span>
            </button>
          </div>
          <input
            ref={entréePhoto}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) photographier(f, cible ?? undefined); e.target.value = ''; }}
          />
        </section>

        {/* LE GESTE FINAL */}
            {!message && (
              <button
                onClick={terminer}
                disabled={envoi}
                className="mt-8 w-full rounded-full bg-vermillon py-4 font-titre text-lg font-bold text-white shadow-haute transition hover:opacity-92 disabled:opacity-50"
              >
                J&apos;ai terminé ma mission
              </button>
            )}
          </>
        )}
        <p className="mt-4 text-center text-xs text-graphite">
          La conciergerie voit votre progression et vos photos en direct —<br />vous n&apos;avez rien à reporter.
        </p>
      </div>
    </main>
  );
}
