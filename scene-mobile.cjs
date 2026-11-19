// ═══ LA SCÈNE MOBILE POUR LA DIRECTION (19/11) ═══
// Claire Fontaine — Conciergerie Les Oliviers (cliente Biendispo) gère
// le Studio Les Pins. M. et Mme Rossignol, propriétaires absents,
// regardent. LA DIRECTION TESTE SUR SON MOBILE : https://joblive.app/j/<code>
// La scène vit jusqu'au verdict (purge : node scene-mobile.cjs purger).
const fs = require('fs');
const ENV = fs.readFileSync(__dirname + '/.env.local', 'utf8');
const u = ENV.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const anon = ENV.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const svc = ENV.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const BASE = process.env.BANC_BASE ?? 'http://localhost:3023';

async function api(chemin, jeton, corps) {
  const r = await fetch(BASE + chemin, { method: 'POST', headers: { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' }, body: JSON.stringify(corps) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(chemin + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 100));
  return j;
}

(async () => {
  if (process.argv[2] === 'purger') {
    const { data: { users } } = await (await fetch(u + '/auth/v1/admin/users?per_page=100', { headers: { apikey: svc, authorization: `Bearer ${svc}` } })).json();
    for (const usr of users.filter(x => x.email.startsWith('claire-demo-mobile'))) {
      await fetch(u + '/auth/v1/admin/users/' + usr.id, { method: 'DELETE', headers: { apikey: svc, authorization: `Bearer ${svc}` } });
    }
    return console.log('scène mobile purgée');
  }

  const email = `claire-demo-mobile+${Date.now()}@joblive.test`;
  await fetch(u + '/auth/v1/admin/users', { method: 'POST', headers: { apikey: svc, authorization: `Bearer ${svc}`, 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'SceneMobile1911!', email_confirm: true }) });
  const sess = await (await fetch(u + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: anon, 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'SceneMobile1911!' }) })).json();
  const jeton = sess.access_token;

  // l'identité de Claire (la carte du nom, déjà remplie pour la scène)
  await api('/api/pro/profil', jeton, { action: 'nommer', nom: 'Claire Fontaine', enseigne: 'Conciergerie Les Oliviers' });

  const { mandat } = await api('/api/mandats', jeton, { action: 'creer', client_nom: 'M. et Mme Rossignol', lieu: 'Studio Les Pins, Sainte-Maxime', client_tel: '06 98 76 54 32', debut: '2026-11-12', fin: '2026-12-12' });
  const { code } = await api('/api/codes', jeton, { action: 'generer', mandat_id: mandat.id });

  const avant = fs.readFileSync('../demo-avant-1600.jpg');
  const apres = fs.readFileSync('../demo-apres-1600.jpg');
  const scenarios = [
    { cat: 'menage', h: -2.2 * 3600e3, note: "Voyageurs partis à 10h, remise impeccable pour l'arrivée de 17h : linge changé, sols, sanitaires, terrasse. Le studio attend ses prochains hôtes." },
    { cat: 'accueil', h: -26 * 3600e3, note: "Arrivée des voyageurs : clé remise en main propre, le tour du studio fait ensemble. Ils repartent contents jusqu'à dimanche." },
  ];
  for (const s of scenarios) {
    const { id: itv } = await api('/api/interventions', jeton, { action: 'creer', mandat_id: mandat.id, categorie: s.cat });
    for (const genre of ['avant', 'apres']) {
      const form = new FormData();
      form.set('intervention_id', itv);
      form.set('genre', genre);
      form.set('horodatage', new Date(Date.now() + s.h + (genre === 'apres' ? 45 * 60e3 : 0)).toISOString());
      form.set('fichier', new Blob([genre === 'avant' ? avant : apres], { type: 'image/jpeg' }), genre + '.jpg');
      const r = await fetch(BASE + '/api/preuves', { method: 'POST', headers: { authorization: `Bearer ${jeton}` }, body: form });
      if (!r.ok) throw new Error('preuve ' + r.status);
    }
    await api('/api/interventions', jeton, { action: 'publier', id: itv, note: s.note, duree_secondes: s.cat === 'menage' ? 5400 : 1800 });
    console.log('publié :', s.cat, '—', s.note.slice(0, 50) + '…');
  }

  console.log('\n══ LA SCÈNE EST PRÊTE POUR TON MOBILE ══');
  console.log('  →  ' + (BASE.startsWith('http://localhost') ? 'http://localhost:3023' : 'https://joblive.app') + '/j/' + code.code);
  console.log('  (expire le 12/12 · purge : node scene-mobile.cjs purger)');
})().catch(e => { console.error('ERREUR SCÈNE :', e.message); process.exit(1); });
