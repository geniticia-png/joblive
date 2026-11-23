// ═══════════════════════════════════════════════════════════════════
// LE BANC DES CONVERSATIONS (012, 23/11 — la refonte « dossier »).
// La grammaire WhatsApp, marchée en vrai : 2 dossiers → mission
// directe publiée + photo sur A → RÉACTION du client sur A (par son
// code) → mission déléguée close non vue sur B → l'accueil rend le
// DERNIER et les NON-VUS de chaque dossier → L'OUVERTURE DU DOSSIER
// A éteint ses non-vus (ouvrir = lu) → l'API du fil rend les 4
// onglets (fil avec l'INTERVENANT, intervenants, agenda, chiffres)
// → PURGE complète.
//   BANC_BASE=https://joblive.app node banc-conversations.cjs
// ═══════════════════════════════════════════════════════════════════
const fs = require('fs');
const { Client } = require('./node_modules/pg');

function env(txt, cle) {
  const m = txt.match(new RegExp('^' + cle + '=\\s*[\'"]?([^\'"\n]+)', 'm'));
  return m ? m[1].trim() : null;
}

const ENV = fs.readFileSync('.env.local', 'utf8');
const URL = env(ENV, 'NEXT_PUBLIC_SUPABASE_URL');
const ANON = env(ENV, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SERVICE = env(ENV, 'SUPABASE_SERVICE_ROLE_KEY');
const DB = env(ENV, 'DATABASE_URL');
const BASE = process.env.BANC_BASE ?? 'http://localhost:3023';
const EMAIL = `banc+${Date.now()}@joblive.test`;
const PHOTO = fs.readFileSync('banc-avant.jpg');

let étape = '';
let échecs = 0;
const ok = (msg) => console.log(`  ✓ ${étape} — ${msg}`);
const ko = (msg) => { console.error(`  ✗ ${étape} — ${msg}`); échecs++; };

async function api(chemin, { jeton, corps, form } = {}) {
  const entêtes = {};
  if (jeton) entêtes.authorization = `Bearer ${jeton}`;
  let body;
  if (form) { body = form; }
  else if (corps !== undefined) { entêtes['content-type'] = 'application/json'; body = JSON.stringify(corps); }
  const r = await fetch(BASE + chemin, { method: 'POST', headers: entêtes, body });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, j };
}

(async () => {
  // ── 1. LE PRO ──
  étape = 'pro naît';
  const création = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancConversations!', email_confirm: true }),
  });
  if (!création.ok) { ko(`admin create ${création.status}`); return fin(); }
  const user = await création.json();
  ok(EMAIL);

  étape = 'session ouvre';
  const sess = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancConversations!' }),
  });
  if (!sess.ok) { ko(`sign in ${sess.status}`); return fin(); }
  const jeton = (await sess.json()).access_token;
  ok('mot de passe → jeton');

  // ── 2. DEUX DOSSIERS ──
  const mandats = [];
  for (const [nom, lieu] of [['Mme A (banc conv)', 'Villa A, 1 rue des Lilas'], ['M. B (banc conv)', 'Villa B, 2 chemin des Pins']]) {
    étape = `dossier ${nom}`;
    let r = await api('/api/mandats', { jeton, corps: { action: 'creer', client_nom: nom, lieu, debut: '2026-11-20', fin: '2026-12-20' } });
    if (r.status !== 200 || !r.j.mandat?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
    const codes = await api('/api/codes', { jeton, corps: { action: 'generer', mandat_id: r.j.mandat.id } });
    mandats.push({ id: r.j.mandat.id, code: codes.j.code.code });
    ok(`${lieu} · code ${codes.j.code.code.slice(0, 3)}-${codes.j.code.code.slice(3)}`);
  }
  const [A, B] = mandats;

  // ── 3. SUR A : mission directe publiée + photo, puis LA RÉACTION du client ──
  étape = 'mission directe sur A';
  let r = await api('/api/interventions', { jeton, corps: { action: 'creer', mandat_id: A.id, categorie: 'menage' } });
  if (r.status !== 200 || !r.j.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const itv = r.j.id;
  const fPhoto = new FormData();
  fPhoto.set('intervention_id', itv);
  fPhoto.set('genre', 'apres');
  fPhoto.set('horodatage', new Date().toISOString());
  fPhoto.set('fichier', new Blob([PHOTO], { type: 'image/jpeg' }), 'apres.jpg');
  r = await api('/api/preuves', { jeton, form: fPhoto });
  if (r.status !== 200) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  r = await api('/api/interventions', { jeton, corps: { action: 'publier', id: itv } });
  if (r.status !== 200) { ko('publication échouée'); return fin(); }
  ok('publiée, photo scellée');

  étape = 'LA RÉACTION du client (par son code)';
  r = await api(`/api/reaction`, { corps: { code: A.code, intervention_id: itv } });
  if (r.status !== 200 && r.status !== 201 && r.status !== 200) { ko(`statut ${r.status} — ${JSON.stringify(r.j).slice(0, 120)}`); return fin(); }
  ok('« Tout va bien » reçu');

  // ── 4. SUR B : mission déléguée CLOSE non vue ──
  étape = 'mission déléguée close sur B';
  r = await api('/api/tiers', { jeton, corps: { action: 'creer', nom: 'Marie (banc conv)', role: 'partenaire' } });
  const tiersId = r.j.tier?.id;
  if (!tiersId) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  r = await api('/api/missions', { jeton, corps: { action: 'creer', tiers_id: tiersId, mandat_id: B.id, titre: 'Le grand ménage B' } });
  const mission = r.j.mission;
  if (!mission?.id) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'accepter' } });
  await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'terminer' } });
  ok(`close par Marie — /m/${mission.jeton.slice(0, 4)}…`);

  // ── 5. L'ACCUEIL REND LES CONVERSATIONS ──
  étape = "l'accueil rend les conversations";
  const accueil = await (await fetch(`${BASE}/api/pro/accueil`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const convA = accueil.conversations?.[A.id];
  const convB = accueil.conversations?.[B.id];
  if (convA?.dernier?.genre === 'réaction' && /Tout va bien/.test(convA.dernier.texte)) ok(`A : dernier = la réaction (« ${convA.dernier.texte.slice(0, 40)}… »)`);
  else ko(`A : ${JSON.stringify(convA).slice(0, 140)}`);
  if ((convA?.non_vus ?? -1) === 1) ok('A : 1 non-vu (la réaction)'); else ko(`A non_vus=${convA?.non_vus}`);
  if (convB?.dernier?.genre === 'mission_faite' && /Marie/.test(convB.dernier.texte)) ok('B : dernier = la mission close de Marie'); else ko(`B : ${JSON.stringify(convB).slice(0, 140)}`);
  if ((convB?.non_vus ?? -1) === 1) ok('B : 1 non-vu (la mission close)'); else ko(`B non_vus=${convB?.non_vus}`);

  // ── 6. OUVRIR LE DOSSIER A = LU ──
  étape = 'ouvrir le dossier A (le fil)';
  const fil = await (await fetch(`${BASE}/api/pro/fil?id=${A.id}`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const intérim = (fil.interventions ?? []).length;
  if (fil.mandat?.id === A.id && intérim === 1) ok(`le fil charge — ${intérim} geste direct avec photo`);
  else ko(`fil A : ${JSON.stringify(fil).slice(0, 140)}`);
  if ((fil.intervenants ?? []).some((i) => i.nom === 'Vous' && i.missions === 1)) ok("l'onglet INTERVENANT porte « Vous — 1 geste direct »");
  else ko(`intervenants : ${JSON.stringify(fil.intervenants).slice(0, 120)}`);
  if ((fil.chiffres?.gestes_directs ?? -1) === 1 && (fil.chiffres?.réactions ?? -1) === 1) ok('les CHIFFRES comptent (1 geste, 1 réaction)');
  else ko(`chiffres : ${JSON.stringify(fil.chiffres).slice(0, 120)}`);

  étape = 'le badge A s\'éteint';
  const accueil2 = await (await fetch(`${BASE}/api/pro/accueil`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const convA2 = accueil2.conversations?.[A.id];
  if ((convA2?.non_vus ?? -1) === 0) ok('ouvrir = lu : la réaction de A est vue');
  else ko(`A non_vus après ouverture = ${convA2?.non_vus}`);
  // B n'a pas été ouvert : son non-vu reste.
  if ((accueil2.conversations?.[B.id]?.non_vus ?? -1) === 1) ok('B non ouvert : son badge reste allumé');

  // ── 7. PURGE ──
  étape = 'purge';
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const chemins = (await c.query("select chemin from preuves where intervention_id = $1", [itv])).rows.map((x) => x.chemin);
  await c.query('delete from mandats where id = ANY($1)', [[A.id, B.id]]); // cascade codes, interventions, preuves, missions, réactions
  await c.query('delete from tiers where id = $1', [tiersId]);
  await c.query('delete from auth.users where id = $1', [user.id]);
  const reste = (await c.query('select count(*)::int as n from mandats where id = ANY($1)', [[A.id, B.id]])).rows[0].n;
  if (reste === 0) ok('base purgée (cascade)'); else ko(`${reste} mandats restent`);
  await c.end();
  for (const ch of chemins) {
    await fetch(`${URL}/storage/v1/object/preuves/${ch}`, { method: 'DELETE', headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` } }).catch(() => {});
  }
  ok('storage purgé');

  fin();
})().catch((e) => { console.error('EXCEPTION :', e.message); échecs++; fin(); });

function fin() {
  console.log(échecs === 0 ? '\n══ BANC CONVERSATIONS VERT — la grammaire WhatsApp vit ══' : `\n══ ${échecs} ÉCHEC(S) ══`);
  process.exit(échecs === 0 ? 0 : 1);
}
