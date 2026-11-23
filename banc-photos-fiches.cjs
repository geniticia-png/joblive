// ═══════════════════════════════════════════════════════════════════
// LE BANC DES PHOTOS PAR GESTE + DES FICHES (011, 23/11 — finir la
// maison pour les conciergeries). La chaîne réelle : pro → fiche
// client → mandat → code → service (2 tâches) → tier → mission →
// ACCEPTATION → photo LIÉE à un geste + photo LIBRE + 2ᵉ photo sur le
// MÊME geste (la multiplicité) → geste FAUX refusé → l'écran du tier
// et la vue conciergerie servent les liaisons → la fiche relue avec
// son histoire (mandats + codes) → PURGE complète (base + storage).
//   BANC_BASE=https://joblive.app node banc-photos-fiches.cjs
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
const PHOTO = fs.readFileSync('banc-avant.jpg'); // une vraie photo du dépôt

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
  // ── 1. LE PRO DE TEST naît puis ouvre sa session (patron naissance) ──
  étape = 'pro naît';
  const création = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancPhotosFiches!', email_confirm: true }),
  });
  if (!création.ok) { ko(`admin create ${création.status}`); return fin(); }
  const user = await création.json();
  ok(EMAIL);

  étape = 'session ouvre';
  const sess = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancPhotosFiches!' }),
  });
  if (!sess.ok) { ko(`sign in ${sess.status}`); return fin(); }
  const jeton = (await sess.json()).access_token;
  ok('mot de passe → jeton');

  // ── 2. LA FICHE CLIENT naît, le mandat s'y rattache, le code vit ──
  étape = 'fiche naît';
  let r = await api('/api/clients', { jeton, corps: { action: 'creer', nom: 'Mme Perrin (banc photos)', type: 'regulier', telephone: '06 98 76 54 32' } });
  if (r.status !== 200 || !r.j.client?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const ficheId = r.j.client.id;
  ok('régulière — ' + ficheId.slice(0, 8));

  étape = 'mandat sur la fiche';
  r = await api('/api/mandats', { jeton, corps: { action: 'creer', client_id: ficheId, client_nom: 'Mme Perrin (banc photos)', lieu: 'Villa les Pins, 3 allée des Chênes', debut: '2026-11-20', fin: '2026-12-20' } });
  if (r.status !== 200 || !r.j.mandat?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const mandatId = r.j.mandat.id;
  ok(mandatId.slice(0, 8));

  étape = 'code naît';
  r = await api('/api/codes', { jeton, corps: { action: 'generer', mandat_id: mandatId } });
  if (r.status !== 200 || !r.j.code?.code) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  ok(r.j.code.code.slice(0, 3) + '-' + r.j.code.code.slice(3));

  // ── 3. LE SERVICE (2 tâches), LE TIER, LA MISSION ──
  étape = 'service à 2 tâches';
  r = await api('/api/catalogue', { jeton, corps: { action: 'service-creer', nom: 'Ménage de sortie (banc photos)' } });
  if (r.status !== 200 || !r.j.service?.id) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  const serviceId = r.j.service.id;
  for (const libelle of ['Sols aspirés et lavés', 'Cuisine et électroménager']) {
    r = await api('/api/catalogue', { jeton, corps: { action: 'tache-creer', service_id: serviceId, libelle, genre: 'generale' } });
    if (r.status !== 200) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  }
  ok('les tâches du métier posées');

  étape = 'le tier de confiance';
  r = await api('/api/tiers', { jeton, corps: { action: 'creer', nom: 'Marie (banc photos)', role: 'partenaire' } });
  if (r.status !== 200 || !r.j.tier?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const tiersId = r.j.tier.id;
  ok('Marie — ' + tiersId.slice(0, 8));

  étape = 'la mission naît (2 éléments copiés)';
  r = await api('/api/missions', { jeton, corps: { action: 'creer', tiers_id: tiersId, mandat_id: mandatId, service_id: serviceId, titre: 'Le grand ménage (banc photos)' } });
  if (r.status !== 200 || !r.j.mission?.id) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  const mission = r.j.mission;
  const el1 = (mission.mission_elements ?? [])[0];
  if (!el1 || (mission.mission_elements ?? []).length < 2) { ko('les tâches n\'ont pas coulé'); return fin(); }
  ok(`${mission.mission_elements.length} éléments, jeton /m/${mission.jeton.slice(0, 4)}…`);

  // ── 4. L'ACCEPTATION ouvre le travail ──
  étape = 'Marie accepte';
  r = await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'accepter' } });
  if (r.status !== 200) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  ok("l'ordre signé, la mission en cours");

  // ── 5. LES PHOTOS : LIÉE, LIBRE, puis 2ᵉ sur le MÊME geste ──
  étape = 'photo LIÉE au geste 1';
  const f1 = new FormData();
  f1.set('horodatage', new Date().toISOString());
  f1.set('element', el1.id);
  f1.set('fichier', new Blob([PHOTO], { type: 'image/jpeg' }), 'geste1.jpg');
  r = await api(`/api/mission-jeton/${mission.jeton}`, { form: f1 });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('scellée sur SON geste');

  étape = 'photo LIBRE (aucun geste)';
  const f2 = new FormData();
  f2.set('horodatage', new Date().toISOString());
  f2.set('fichier', new Blob([PHOTO], { type: 'image/jpeg' }), 'libre.jpg');
  r = await api(`/api/mission-jeton/${mission.jeton}`, { form: f2 });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('pool de mission');

  étape = '2ᵉ photo sur le MÊME geste';
  const f3 = new FormData();
  f3.set('horodatage', new Date().toISOString());
  f3.set('element', el1.id);
  f3.set('fichier', new Blob([PHOTO], { type: 'image/jpeg' }), 'geste1-bis.jpg');
  r = await api(`/api/mission-jeton/${mission.jeton}`, { form: f3 });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('la multiplicité prouvée');

  étape = 'photo sur un geste FAUX';
  const f4 = new FormData();
  f4.set('horodatage', new Date().toISOString());
  f4.set('element', '11111111-1111-4111-8111-111111111111');
  f4.set('fichier', new Blob([PHOTO], { type: 'image/jpeg' }), 'intrus.jpg');
  r = await api(`/api/mission-jeton/${mission.jeton}`, { form: f4 });
  if (r.status === 404) ok('refusée (la garde element-fait étendue)'); else ko(`statut ${r.status} — la garde dort`);

  // ── 6. LA VÉRITÉ EN BASE : les liaisons element_id ──
  étape = 'liaisons lues en base';
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const { rows: preuves } = await c.query('select element_id from mission_preuves where mission_id = $1', [mission.id]);
  const liées = preuves.filter((p) => p.element_id === el1.id).length;
  const libres = preuves.filter((p) => p.element_id === null).length;
  if (liées === 2 && libres === 1) ok('2 photos sur le geste 1, 1 libre — exact'); else ko(`${liées} liées / ${libres} libres`);

  étape = "l'écran du tier sert element_id";
  const vue = await (await fetch(`${BASE}/api/mission-jeton/${mission.jeton}`)).json();
  const servies = (vue.mission?.mission_preuves ?? []).filter((p) => p.element_id === el1.id).length;
  if (servies === 2) ok('le GET imbrique element_id (les vignettes du geste)'); else ko(`${servies} servies`);

  // ── 7. LA FICHE ET SON HISTOIRE (mandats + codes imbriqués) ──
  étape = "l'histoire de la fiche";
  const liste = await (await fetch(`${BASE}/api/clients`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const fiche = (liste.clients ?? []).find((f) => f.id === ficheId);
  const md = fiche?.mandats?.[0];
  if (fiche && md && md.id === mandatId && md.codes?.length >= 1 && md.statut === 'actif') {
    ok(`${fiche.mandats.length} mandat · code ${md.codes[0].code.slice(0, 3)}-${md.codes[0].code.slice(3)} vivant — le registre lit`);
  } else ko(JSON.stringify(fiche ?? 'absente').slice(0, 160));

  // ── 8. LA VUE CONCIERGERIE porte les liaisons ──
  étape = 'la conciergerie voit les liaisons';
  const mv = await (await fetch(`${BASE}/api/missions`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const mc = (mv.missions ?? []).find((m) => m.id === mission.id);
  const liéesVue = (mc?.mission_preuves ?? []).filter((p) => p.element_id === el1.id).length;
  if (liéesVue === 2) ok('SELECT_MISSIONS imbrique element_id (les rangées par geste)'); else ko(`${liéesVue} liées dans la vue`);

  // ── 9. PURGE (la règle : le banc ne laisse rien) ──
  étape = 'purge';
  const chemins = (await c.query('select chemin from mission_preuves where mission_id = $1', [mission.id])).rows.map((x) => x.chemin);
  await c.query('delete from missions where id = $1', [mission.id]); // cascade éléments + preuves
  await c.query('delete from services where id = $1', [serviceId]);
  await c.query('delete from tiers where id = $1', [tiersId]);
  await c.query('delete from mandats where id = $1', [mandatId]);   // cascade codes
  await c.query('delete from clients where id = $1', [ficheId]);
  await c.query('delete from auth.users where id = $1', [user.id]);
  const reste = (await c.query('select count(*)::int as n from mission_preuves where mission_id = $1', [mission.id])).rows[0].n;
  if (reste === 0) ok('base purgée (cascade complète)'); else ko(`${reste} preuves restent`);
  await c.end();
  for (const ch of chemins) {
    await fetch(`${URL}/storage/v1/object/preuves/${ch}`, { method: 'DELETE', headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` } }).catch(() => {});
  }
  ok('storage purgé');

  fin();
})().catch((e) => { console.error('EXCEPTION :', e.message); échecs++; fin(); });

function fin() {
  console.log(échecs === 0 ? '\n══ BANC PHOTOS+FICHES VERT — la maison finit pour les conciergeries ══' : `\n══ ${échecs} ÉCHEC(S) ══`);
  process.exit(échecs === 0 ? 0 : 1);
}
