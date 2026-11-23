// ═══════════════════════════════════════════════════════════════════
// LE BANC DU MOT DU GESTE + DU RAPPORT (013, 23/11 — chutjegère et
// sa mission de formation chez Sixt). La chaîne réelle : pro →
// GABARITS (le service Formation naît, 5 générales + 1 particulière)
// → fiche + mandat → tier → mission de formation → ACCEPTATION →
// 2 gestes cochés AVEC commentaires (dont un de 520 → coupé à 500)
// → 1 geste coché SANS mot → la vérité en base → le GET du tier sert
// les mots → la source du RAPPORT (/api/missions?id=) porte éléments
// + commentaires + l'enseigne → la page /pro/mission/[id]/rapport
// répond 200 → PURGE complète.
//   BANC_BASE=https://joblive.app node banc-commentaires.cjs
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

let étape = '';
let échecs = 0;
const ok = (msg) => console.log(`  ✓ ${étape} — ${msg}`);
const ko = (msg) => { console.error(`  ✗ ${étape} — ${msg}`); échecs++; };

async function api(chemin, { jeton, corps, method = 'POST' } = {}) {
  const entêtes = {};
  if (jeton) entêtes.authorization = `Bearer ${jeton}`;
  let body;
  if (corps !== undefined) { entêtes['content-type'] = 'application/json'; body = JSON.stringify(corps); }
  const r = await fetch(BASE + chemin, { method, headers: entêtes, body });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, j };
}

(async () => {
  // ── 1. LE PRO DE TEST (la formatrice de chez Resafix) ──
  étape = 'pro naît';
  const création = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancCommentaires!', email_confirm: true }),
  });
  if (!création.ok) { ko(`admin create ${création.status}`); return fin(); }
  const user = await création.json();
  ok(EMAIL);

  étape = 'session ouvre';
  const sess = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancCommentaires!' }),
  });
  if (!sess.ok) { ko(`sign in ${sess.status}`); return fin(); }
  const jeton = (await sess.json()).access_token;
  ok('mot de passe → jeton');

  // ── 2. LES GABARITS : le service FORMATION naît ──
  étape = 'gabarits posés';
  let r = await api('/api/catalogue', { jeton, corps: { action: 'gabarits' } });
  if (r.status !== 200) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  const catalogue = await (await fetch(`${BASE}/api/catalogue`, { headers: { authorization: `Bearer ${jeton}` } })).json();
  const formation = (catalogue.services ?? []).find((s) => s.nom === 'Formation');
  if (!formation) { ko('le service Formation manque dans les GABARITS'); return fin(); }
  const générales = (formation.taches ?? []).filter((t) => t.genre === 'generale');
  if (générales.length !== 5) { ko(`${générales.length} générales (5 attendues)`); return fin(); }
  ok(`« ${formation.nom} » — 5 générales : ${générales[0].libelle}…`);

  // ── 3. LA FICHE, LE MANDAT, LE TIER ──
  étape = 'fiche + mandat';
  r = await api('/api/clients', { jeton, corps: { action: 'creer', nom: 'Sixt (banc formation)', type: 'regulier' } });
  if (r.status !== 200 || !r.j.client?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const ficheId = r.j.client.id;
  r = await api('/api/mandats', { jeton, corps: { action: 'creer', client_id: ficheId, client_nom: 'Sixt (banc formation)', lieu: 'Agence Sixt Fort-de-France', debut: '2026-11-24', fin: '2026-11-25' } });
  if (r.status !== 200 || !r.j.mandat?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const mandatId = r.j.mandat.id;
  ok('Sixt — agence du Lamentin');

  étape = 'la formatrice';
  r = await api('/api/tiers', { jeton, corps: { action: 'creer', nom: 'Chutjegère (banc)', role: 'prestataire' } });
  if (r.status !== 200 || !r.j.tier?.id) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  const tiersId = r.j.tier.id;
  ok('prestataire — ' + tiersId.slice(0, 8));

  // ── 4. LA MISSION DE FORMATION (les tâches coulent en éléments) ──
  étape = 'mission de formation';
  r = await api('/api/missions', { jeton, corps: { action: 'creer', tiers_id: tiersId, mandat_id: mandatId, service_id: formation.id, prevue_le: '2026-11-24' } });
  if (r.status !== 200 || !r.j.mission?.id) { ko(JSON.stringify(r.j).slice(0, 160)); return fin(); }
  const mission = r.j.mission;
  if ((mission.mission_elements ?? []).length !== 6) { ko(`${(mission.mission_elements ?? []).length} éléments (6 attendues)`); return fin(); }
  ok(`${mission.mission_elements.length} éléments — jeton /m/${mission.jeton.slice(0, 4)}…`);

  étape = 'la formatrice accepte';
  r = await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'accepter' } });
  if (r.status !== 200) { ko(JSON.stringify(r.j).slice(0, 120)); return fin(); }
  ok("l'ordre signé, le travail s'ouvre");

  // ── 5. LES GESTES : 2 AVEC MOTS (dont un trop long), 1 SANS ──
  étape = 'geste 1 coché + mot';
  const el = (i) => mission.mission_elements.filter((e) => e.genre === 'generale')[i];
  r = await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'element-fait', id: el(0).id, fait: true, commentaire: 'Session lancée à 9 h — 8 participantes, les badges remis.' } });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('le mot voyage avec la coche');

  étape = 'geste 2 coché + mot TROP LONG';
  const bavard = 'x'.repeat(520);
  r = await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'element-fait', id: el(1).id, fait: true, commentaire: bavard } });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('accepté — la coupe serveur décidera');

  étape = 'geste 3 coché SANS mot';
  r = await api(`/api/mission-jeton/${mission.jeton}`, { corps: { action: 'element-fait', id: el(2).id, fait: true } });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120)); else ok('la coche seule reste honnête');

  // ── 6. LA VÉRITÉ EN BASE ──
  étape = 'les mots lus en base';
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const { rows: éléments } = await c.query('select libelle, fait, commentaire from mission_elements where mission_id = $1 order by ordre', [mission.id]);
  const e0 = éléments[0], e1 = éléments[1], e2 = éléments[2];
  if (e0?.fait && e0?.commentaire === 'Session lancée à 9 h — 8 participantes, les badges remis.') ok('geste 1 : le mot exact, posé avec la coche');
  else ko(`geste 1 : ${JSON.stringify(e0).slice(0, 120)}`);
  if (e1?.fait && e1?.commentaire?.length === 500) ok('geste 2 : les 520 caractères coupés à 500 (la borne tient)');
  else ko(`geste 2 : ${e1?.commentaire?.length} caractères`);
  if (e2?.fait === true && e2?.commentaire === null) ok('geste 3 : coché, aucun mot (facultatif)');
  else ko(`geste 3 : ${JSON.stringify(e2).slice(0, 80)}`);

  // ── 7. LE GET DU TIER SERVE LES MOTS (l'écran les préremplit) ──
  étape = "l'écran du tier sert les mots";
  const vue = await (await fetch(`${BASE}/api/mission-jeton/${mission.jeton}`)).json();
  const servis = (vue.mission?.mission_elements ?? []).filter((e) => e.commentaire).length;
  if (servis === 2) ok('2 commentaires imbriqués dans le GET'); else ko(`${servis} servis`);

  // ── 8. LA SOURCE DU RAPPORT : /api/missions?id= ──
  étape = 'la source du rapport';
  const rep = await api(`/api/missions?id=${mission.id}`, { jeton, method: 'GET' });
  const m = rep.j.mission;
  if (rep.status !== 200 || !m) { ko(`GET ${rep.status} : ${JSON.stringify(rep.j).slice(0, 160)})`); }
  else {
    const avec = (m.mission_elements ?? []).filter((e) => e.commentaire).length;
    if (avec === 2 && m.tiers?.nom === 'Chutjegère (banc)' && m.mandats?.client_nom === 'Sixt (banc formation)') ok('éléments + commentaires + tiers + client — la feuille blanche a tout');
    else ko(`${avec} commentaires — ${JSON.stringify(m).slice(0, 160)}`);
    if (m.pros?.enseigne || m.pros?.nom) ok(`l'émetteur du rapport : ${m.pros.enseigne || m.pros.nom}`); else ko('pros(enseigne) absent');
  }

  étape = 'la page du rapport répond';
  const page = await fetch(`${BASE}/pro/mission/${mission.id}/rapport`, { headers: { authorization: `Bearer ${jeton}` } });
  if (page.status === 200) ok('/pro/mission/[id]/rapport → 200 (le shell imprime, les données suivent)');
  else ko(`statut ${page.status}`);

  // ── 9. PURGE ──
  étape = 'purge';
  await c.query('delete from missions where id = $1', [mission.id]); // cascade éléments + preuves
  await c.query('delete from services where pro_id = $1', [user.id]);
  await c.query('delete from tiers where id = $1', [tiersId]);
  await c.query('delete from mandats where id = $1', [mandatId]);
  await c.query('delete from clients where id = $1', [ficheId]);
  await c.query('delete from pros where id = $1', [user.id]).catch(() => {});
  await c.query('delete from auth.users where id = $1', [user.id]);
  const reste = (await c.query('select count(*)::int as n from mission_elements where mission_id = $1', [mission.id])).rows[0].n;
  if (reste === 0) ok('base purgée (cascade complète)'); else ko(`${reste} éléments restent`);
  await c.end();

  fin();
})().catch((e) => { console.error('EXCEPTION :', e.message); échecs++; fin(); });

function fin() {
  console.log(échecs === 0 ? '\n══ BANC MOT DU GESTE + RAPPORT VERT — la mission qui prouve vit ══' : `\n══ ${échecs} ÉCHEC(S) ══`);
  process.exit(échecs === 0 ? 0 : 1);
}
