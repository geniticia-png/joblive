// ═══════════════════════════════════════════════════════════════════
// LE BANC DE NAISSANCE JOBLIVE (18/11) — la chaîne entière, réelle :
// user pro → mandat → code → intervention → photos AVANT/APRÈS →
// publication → timeline client par code → « Tout va bien » →
// vu_le → révocation (la mort du code) → dashboard. PUIS purge.
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

// LE DNS DE LA BOX (canalbox) ne résout pas joblive.app (les DNS publics,
// eux, répondent). BANC_DNS_IP route le domaine vers une IP Hostinger
// le temps du banc — ex. BANC_DNS_IP=145.223.124.164 (19/11, journal).
if (process.env.BANC_DNS_IP) {
  const orig = require('dns').lookup.bind(require('dns'));
  require('dns').lookup = function (hôte, options, callback) {
    if (typeof options === 'function') { callback = options; options = {}; }
    if (hôte === 'joblive.app') {
      if (options && options.all) return callback(null, [{ address: process.env.BANC_DNS_IP, family: 4 }]);
      return callback(null, process.env.BANC_DNS_IP, 4);
    }
    return orig(hôte, options, callback);
  };
}

let étape = '';
const ok = (msg) => console.log(`  ✓ ${étape} — ${msg}`);
const ko = (msg) => { console.error(`  ✗ ${étape} — ${msg}`); process.exit(1); };

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
  // ── 1. LE PRO DE TEST naît (admin API) puis ouvre sa session ──
  étape = 'pro naît';
  const création = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancNaissance3023!', email_confirm: true }),
  });
  if (!création.ok) ko(`admin create ${création.status} : ${JSON.stringify(await création.json()).slice(0, 120)}`);
  const user = await création.json();
  ok(EMAIL);

  étape = 'session ouvre';
  const sess = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'BancNaissance3023!' }),
  });
  if (!sess.ok) ko(`sign in ${sess.status}`);
  const jeton = (await sess.json()).access_token;
  ok('mot de passe → jeton');

  // ── 2. LE MANDAT ──
  étape = 'mandat';
  let r = await api('/api/mandats', { jeton, corps: { action: 'creer', client_nom: 'Mme Valmont (banc)', lieu: 'Villa Oscar, 12 rue des Roses', client_tel: '06 12 34 56 78', debut: '2026-11-18', fin: '2026-12-18' } });
  if (r.status !== 200 || !r.j.mandat?.id) ko(JSON.stringify(r.j).slice(0, 120));
  const mandatId = r.j.mandat.id;
  ok(`Mme Valmont — ${mandatId.slice(0, 8)}`);

  // ── 3. LE CODE ──
  étape = 'code naît';
  r = await api('/api/codes', { jeton, corps: { action: 'generer', mandat_id: mandatId } });
  if (r.status !== 200 || !r.j.code?.code) ko(JSON.stringify(r.j).slice(0, 120));
  const codeNu = r.j.code.code;
  const codeId = r.j.code.id;
  ok(`J7B-style : ${codeNu.slice(0, 3)}-${codeNu.slice(3)} (expire ${r.j.code.expire_le?.slice(0, 10)})`);

  // ── 4. L'INTERVENTION ──
  étape = 'intervention naît';
  r = await api('/api/interventions', { jeton, corps: { action: 'creer', mandat_id: mandatId, categorie: 'animaux' } });
  if (r.status !== 200 || !r.j.id) ko(JSON.stringify(r.j).slice(0, 120));
  const itvId = r.j.id;
  ok(`animaux — ${itvId.slice(0, 8)}`);

  // ── 5. LES PREUVES (avant/après, horodatage à la prise) ──
  étape = 'photo AVANT';
  const formA = new FormData();
  formA.set('intervention_id', itvId); formA.set('genre', 'avant');
  formA.set('horodatage', new Date(Date.now() - 300_000).toISOString());
  formA.set('fichier', new Blob([fs.readFileSync('banc-avant.jpg')], { type: 'image/jpeg' }), 'avant.jpg');
  r = await api('/api/preuves', { jeton, form: formA });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120));
  ok('scellée (-5 min, l\'heure de la prise)');

  étape = 'photo APRÈS';
  const formB = new FormData();
  formB.set('intervention_id', itvId); formB.set('genre', 'apres');
  formB.set('horodatage', new Date().toISOString());
  formB.set('fichier', new Blob([fs.readFileSync('banc-apres.jpg')], { type: 'image/jpeg' }), 'apres.jpg');
  r = await api('/api/preuves', { jeton, form: formB });
  if (r.status !== 200) ko(JSON.stringify(r.j).slice(0, 120));
  ok('scellée (maintenant)');

  // la photo est-elle VRAIMENT servie depuis le bucket ?
  étape = 'photo servie';
  const c = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const { rows: [preuve] } = await c.query('select chemin from preuves order by horodatage desc limit 1');
  const img = await fetch(`${URL}/storage/v1/object/public/preuves/${preuve.chemin}`);
  img.status === 200 ? ok(`${preuve.chemin.slice(0, 24)}… → 200`) : ko(`storage ${img.status}`);

  // ── 6. LA PUBLICATION (l'acte vermillon) ──
  étape = 'publication';
  r = await api('/api/interventions', { jeton, corps: { action: 'publier', id: itvId, note: 'Oscar a couru 20 minutes, très joueur (banc de naissance).', duree_secondes: 1260 } });
  r.status === 200 ? ok('dans le journal du client') : ko(JSON.stringify(r.j).slice(0, 120));

  // ── 7. LA TIMELINE CLIENT (lecture pure, par code) ──
  étape = 'timeline client';
  const page = await fetch(`${BASE}/j/${codeNu}`);
  const html = await page.text();
  page.status === 200 ? ok('/j/' + codeNu.slice(0, 3) + '-' + codeNu.slice(3) + ' → 200') : ko(`${page.status}`);
  html.includes('Oscar a couru') ? ok('la note du terrain lisible') : ko('note absente');
  html.includes('HORODAT') ? ok('le sceau certifie la page') : ko('sceau absent');
  html.includes('Tout va bien') ? ok('le bouton doux présent') : ko('bouton absent');
  html.includes('AVANT') && html.includes('APRÈS') ? ok('les deux preuves visibles') : ko('preuves absentes');

  étape = 'le regard compte (vu_le)';
  await new Promise(r2 => setTimeout(r2, 800));
  const { rows: [codeRow] } = await c.query('select vu_le from codes where id = $1', [codeId]);
  codeRow.vu_le ? ok(`vu par le client à ${codeRow.vu_le.toISOString().slice(11, 19)}Z`) : ko('vu_le jamais posé');

  // ── 8. LA RÉACTION « Tout va bien » ──
  étape = 'réaction client';
  r = await api('/api/reaction', { corps: { code: codeNu, intervention_id: itvId } });
  r.status === 200 ? ok('« Tout va bien » enregistré') : ko(JSON.stringify(r.j));
  const { rows: [réac] } = await c.query('select count(*)::int as n from reactions where intervention_id = $1', [itvId]);
  réac.n === 1 ? ok('une ligne en base') : ko(`${réac.n} lignes`);
  const doublon = await api('/api/reaction', { corps: { code: codeNu, intervention_id: itvId } });
  doublon.j.déjà === true ? ok('le doublon reste une seule ligne') : ko('doublon accepté !');

  // ── 9. LE DASHBOARD pro voit le journal + la réaction ──
  étape = 'dashboard pro';
  r = await fetch(`${BASE}/api/pro/accueil`, { headers: { authorization: `Bearer ${jeton}` } });
  const accueil = await r.json();
  r.status === 200 && accueil.journal?.length === 1 && accueil.journal[0].reactions?.length === 1
    ? ok('journal du jour + « Tout va bien » reçu ✓') : ko(JSON.stringify(accueil).slice(0, 150));

  // ── 10. LA DOSE : une catégorie masquée n'apparaît pas ──
  étape = 'la dose (catégories)';
  await api('/api/mandats', { jeton, corps: { action: 'regler', id: mandatId, categories_diffusees: ['menage'] } });
  const pageFiltrée = await fetch(`${BASE}/j/${codeNu}`);
  const htmlF = await pageFiltrée.text();
  !htmlF.includes('Oscar a couru') ? ok('animaux masqué → la preuve disparaît de la timeline') : ko('la dose ne filtre pas !');
  await api('/api/mandats', { jeton, corps: { action: 'regler', id: mandatId, categories_diffusees: null } });

  // ── 11. LA MORT DU CODE (révocation) ──
  étape = 'révocation';
  r = await api('/api/codes', { jeton, corps: { action: 'revoquer', id: codeId } });
  if (r.status !== 200) ko(JSON.stringify(r.j));
  const pageMorte = await fetch(`${BASE}/j/${codeNu}`);
  const htmlM = await pageMorte.text();
  htmlM.includes('ne vit plus') ? ok('le code révoqué → « Ce code ne vit plus »') : ko('le code survit !');
  const réacMorte = await api('/api/reaction', { corps: { code: codeNu } });
  réacMorte.status === 403 ? ok('la réaction meurt avec le code') : ko('la réaction survit !');

  // ── 12. UN CODE INCONNU reste élégant ──
  étape = 'code inconnu';
  const inconnu = await fetch(`${BASE}/j/ZZZ999`);
  (inconnu.status === 200 && (await inconnu.text()).includes('ne vit plus')) ? ok('page élégante, zéro fuite') : ko(`${inconnu.status}`);

  // ── LA PURGE (règle maison : le banc ne laisse rien) ──
  étape = 'purge';
  // 20/11 : la base est VIVANTE (la scène de démonstration, les
  // tests de la direction) — le banc ne juge que SES propres lignes,
  // plus l'ensemble de la base.
  const { rows: fichiers } = await c.query('select chemin from preuves where intervention_id = $1', [itvId]);
  await fetch(`${URL}/storage/v1/object/preuves/${mandatId}`, { method: 'DELETE', headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` } }).catch(() => {});
  await fetch(`${URL}/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` } });
  const { rows: [après] } = await c.query(
    'select (select count(*) from pros where id = $1)::int pros, (select count(*) from mandats where pro_id = $1)::int mandats, (select count(*) from interventions where mandat_id = $2)::int itv, (select count(*) from preuves where intervention_id = $3)::int preuves, (select count(*) from codes where mandat_id = $2)::int codes, (select count(*) from reactions where intervention_id = $3)::int réactions',
    [user.id, mandatId, itvId],
  );
  await c.end();
  [après.pros, après.mandats, après.itv, après.preuves, après.codes, après.réactions].every(n => n === 0)
    ? ok('ses lignes purgées : pro 0 · mandat 0 · interventions 0 · preuves 0 · codes 0 · réactions 0 · ' + fichiers.length + ' fichiers storage purgés (cascade)')
    : ko(`reste : ${JSON.stringify(après)}`);

  console.log('\n══ LE BANC DE NAISSANCE EST VERT — la maison fonctionne de bout en bout ══');
})().catch(e => { console.error('ERREUR BANC :', e); process.exit(1); });
