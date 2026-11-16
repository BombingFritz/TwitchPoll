// Ablauftest für SpargelPoll.html im Headless-Chromium.
// Server (/token, /api/twitch/poll/current) und Twitch Helix (/polls, /chat/messages) werden per Playwright abgefangen
// und nachgebildet; es geht keine Anfrage an echte Server. Die Uhr ist künstlich (page.clock), Wartezeiten laufen im Zeitraffer.
// Start: node test/widget-test.js   (braucht Playwright: npm install, einmalig npx playwright install chromium)
// Ausgabe: OK …/FAIL …, Exit-Code 1 bei Fehlern.

const path = require('path');
const { chromium } = require('playwright');

// WIDGET=<Pfad> prüft eine andere Fassung, z. B. einen Entwurf: WIDGET=entwuerfe/SpargelPoll-1.0.html node test/widget-test.js
const FILE = 'file://' + path.resolve(__dirname, '..', process.env.WIDGET || 'SpargelPoll.html');
const T0 = new Date('2026-11-14T20:00:00Z').getTime();
const CORS = { 'Access-Control-Allow-Origin': '*' };
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FAIL ') + msg); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Stand wie GET /api/twitch/poll/current (Server-Spec wetten-abstimmungen.md, Schritt 2); extra Feld prüft, dass Unbekanntes nicht stört
function serverPoll(o) {
  return {
    pollId: o.id || 'poll1', title: o.title || 'Welches Boot nehmen wir heute?', status: o.status || 'ACTIVE',
    choices: (o.votes || [0, 0, 0]).map((v, i) => ({ id: 'c' + i, title: ['Typ VII', 'Typ IX', 'Typ XXI', 'Typ II', 'Typ XIV'][i], votes: v, channelPointsVotes: 0, bitsVotes: 0 })),
    channelPointsVoting: { isEnabled: false, amountPerVote: 0 }, bitsVoting: { isEnabled: false, amountPerVote: 0 },
    startedAt: new Date(o.now - 10000).toISOString(), endsAt: new Date(o.now + (o.left || 60) * 1000).toISOString(),
    endedAt: null, duration: (o.left || 60) + 10, updatedAt: new Date(o.now).toISOString(), kuenftigesFeld: { x: 1 }
  };
}

// Helix GET /polls (nur für den Legacy-Rückfall)
function helixPoll(o) {
  return {
    id: o.id || 'poll1', title: o.title || 'Helix-Abstimmung', status: o.status || 'ACTIVE',
    choices: (o.votes || [0, 0]).map((v, i) => ({ id: 'h' + i, title: 'Antwort ' + (i + 1), votes: v })),
    started_at: new Date(o.now - 10000).toISOString(), duration: 70
  };
}

async function open(browser, state, query) {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page = await ctx.newPage();
  state.tokenCalls = 0; state.serverCalls = 0; state.helixCalls = 0; state.chat = []; state.console = [];
  page.on('console', m => state.console.push(m.text()));
  page.on('pageerror', e => state.console.push('PAGEERROR ' + e.message));
  await page.clock.install({ time: T0 });
  await page.route('http://localhost:3000/token', route => {
    state.tokenCalls++;
    if (state.authDown) return route.abort();
    route.fulfill({ status: 200, contentType: 'application/json', headers: CORS,
      body: JSON.stringify({ access_token: 'tok', client_id: 'cid', broadcaster_id: '123', expires_at: new Date(T0 + 3600000).toISOString() }) });
  });
  await page.route('http://localhost:3000/api/twitch/poll/current', route => {
    state.serverCalls++;
    if (state.serverDown) return route.abort();
    if (state.oldServer) return route.fulfill({ status: 404, body: 'Cannot GET', headers: CORS });
    route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(state.poll || { status: 'WAITING' }) });
  });
  await page.route('https://api.twitch.tv/helix/polls**', route => {
    state.helixCalls++;
    route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify({ data: state.helix ? [state.helix] : [] }) });
  });
  await page.route('https://api.twitch.tv/helix/chat/messages', route => {
    state.chat.push(JSON.parse(route.request().postData() || '{}'));
    route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify({ data: [{ message_id: 'm1', is_sent: true }] }) });
  });
  await page.route('https://api.twitch.tv/helix/users**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: '{"data":[{"id":"123"}]}' }));
  await page.goto(FILE + (query || ''));
  // Zähler für Endsequenzen (gestartete triggerPollEnded) und Sound; Sound selbst wird nicht abgespielt.
  // Unabhängig von der Darstellung, damit dieselbe Testreihe auch Entwürfe prüft.
  await page.evaluate(() => {
    window.__overlays = 0; window.__sounds = 0;
    const orig = triggerPollEnded;
    triggerPollEnded = function(p) { if (!pollEndedInProgress) window.__overlays++; return orig(p); };
    playResultSound = function() { window.__sounds++; };
  });
  return page;
}

// Zeit vorspulen; zwischendurch echte Pausen, damit abgefangene Anfragen beantwortet werden
async function advance(page, ms) {
  for (let t = 0; t < ms; t += 500) { await page.clock.runFor(Math.min(500, ms - t)); await sleep(25); }
}
const now = page => page.evaluate(() => Date.now());
const visible = page => page.evaluate(() => document.getElementById('widgetContainer').classList.contains('visible'));
const text = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : null; }, sel);
const counts = page => page.evaluate(() => ({ overlays: window.__overlays, sounds: window.__sounds }));
// Restzeit in Sekunden, ob als „55“ oder als „0:55“ angezeigt
const seconds = t => { const m = String(t || '').match(/(?:(\d+):)?(\d+)\s*$/); return m ? (Number(m[1] || 0) * 60 + Number(m[2])) : NaN; };
const connected = page => page.evaluate(() => document.getElementById('statusIndicator').classList.contains('connected'));

(async () => {
  const browser = await chromium.launch();

  // 1) Normalablauf über den Server: WAITING, ACTIVE, Aktualisierung, COMPLETED, danach ARCHIVED
  {
    const st = {};
    const page = await open(browser, st);
    await advance(page, 1000);
    ok(st.tokenCalls === 1, 'Start: /token genau einmal');
    ok(st.serverCalls >= 1, 'Start: Abstimmung vom Server abgefragt');
    ok(!(await visible(page)), 'WAITING: Widget ausgeblendet');
    st.poll = serverPoll({ now: await now(page), votes: [0, 0, 0] });
    await advance(page, 5000);
    ok(await visible(page), 'ACTIVE: Widget sichtbar');
    ok((await page.locator('.poll-option').count()) === 3, 'ACTIVE: drei Spargelstangen');
    ok((await text(page, '#pollQuestion')) === 'Welches Boot nehmen wir heute?', 'ACTIVE: Frage angezeigt');
    const t1 = seconds(await text(page, '#timer'));
    ok(t1 > 50 && t1 <= 60, 'ACTIVE: Timer aus endsAt (' + t1 + ' s)');
    await page.evaluate(() => { window.__firstBar = document.querySelector('.poll-option'); });
    st.poll = serverPoll({ now: await now(page) - 6000, votes: [5, 3, 2] });
    await advance(page, 2500);
    ok((await text(page, '.label-group .option-percentage')) === '50%', 'Aktualisierung: neue Prozentwerte');
    ok(await page.evaluate(() => window.__firstBar === document.querySelector('.poll-option')), 'Aktualisierung: kein Neuaufbau der Stangen');
    ok(await page.evaluate(() => {
      const bar = document.querySelector('.poll-option');
      const segs = bar.querySelectorAll('.spargel-mitte').length;
      if (segs) return segs === 5;                                                        // bis 0.9.5: ein Mittelteil je 10 %
      return getComputedStyle(bar).getPropertyValue('--h').trim() === stalkHeight(50) + 'px'; // ab 1.0: Höhe nach Prozent
    }), 'Aktualisierung: Stangenlänge entspricht 50 %');
    ok(st.helixCalls === 0, 'Kein GET /helix/polls');
    st.poll = Object.assign({}, st.poll, { status: 'COMPLETED', endedAt: new Date(await now(page)).toISOString() });
    await advance(page, 2000);
    ok((await counts(page)).overlays === 1, 'COMPLETED: Endsequenz gestartet');
    st.poll = Object.assign({}, st.poll, { status: 'ARCHIVED' });
    await advance(page, 14000);
    let c = await counts(page);
    ok(c.overlays === 1, 'ARCHIVED nach COMPLETED: keine zweite Endsequenz');
    ok(c.sounds === 1, 'Sound genau einmal');
    ok(!(await visible(page)), 'Nach der Endsequenz ausgeblendet');
    await advance(page, 10000);
    c = await counts(page);
    ok(c.overlays === 1 && c.sounds === 1, 'ARCHIVED bleibt stehen: nichts wiederholt');
    ok(st.chat.length === 0, 'Vorgabe: Widget sendet keine Chat-Zeile');
    ok(st.console.some(l => l.includes('sendet der Server') && l.includes('Den längsten Spargel hat "Typ VII" mit 50 Prozent')), 'Ergebniszeile nur im Log, Text wie bisher');
    ok(!st.console.some(l => l.startsWith('PAGEERROR')), 'Keine Skriptfehler');
    await page.context().close();
  }

  // 2) TERMINATED mit 0:0 → Endsequenz, Gleichstand, Sound einmal
  {
    const st = {};
    const page = await open(browser, st);
    await advance(page, 500);
    st.poll = serverPoll({ now: await now(page), votes: [0, 0] });
    await advance(page, 5500);
    st.poll = Object.assign({}, st.poll, { status: 'TERMINATED' });
    await advance(page, 6000);
    const c = await counts(page);
    ok(c.overlays === 1 && c.sounds === 1, 'TERMINATED: eine Endsequenz, Sound einmal');
    ok((await text(page, '#winnerAnnouncement')).includes('Gleichstand'), 'TERMINATED 0:0: Gleichstand-Banner');
    ok((await page.locator('.poll-option.winner').count()) === 0, '0:0: kein Sieger-Styling');
    await page.context().close();
  }

  // 3) Älterer Server (404) → Legacy-Rückfall auf GET /helix/polls
  {
    const st = { oldServer: true };
    const page = await open(browser, st);
    st.helix = helixPoll({ now: T0, votes: [3, 1] });
    await advance(page, 4500);
    ok(st.serverCalls === 1, '404: Server-Adresse nur einmal versucht');
    ok(st.helixCalls >= 1, '404: Rückfall auf GET /helix/polls');
    ok(await visible(page), '404: Abstimmung aus Helix angezeigt');
    ok((await text(page, '.label-group .option-percentage')) === '75%', '404: Werte aus Helix');
    ok(st.console.some(l => l.includes('Rückfall')), '404: Rückfall im Log');
    st.helix = Object.assign({}, st.helix, { status: 'COMPLETED' });
    await advance(page, 3000);
    ok((await counts(page)).overlays === 1, '404: Endsequenz auch im Rückfall');
    await page.context().close();
  }

  // 4) Server während laufender Abstimmung nicht erreichbar, danach wieder da
  {
    const st = {};
    const page = await open(browser, st);
    await advance(page, 500);
    st.poll = serverPoll({ now: await now(page), votes: [2, 2, 1] });
    await advance(page, 5500);
    st.serverDown = true;
    await advance(page, 6000);
    ok(await visible(page), 'Server weg: Abstimmung bleibt sichtbar');
    ok((await page.locator('.poll-option').count()) === 3, 'Server weg: letzter Stand bleibt');
    ok(!(await connected(page)), 'Server weg: Statuspunkt rot');
    ok(st.console.filter(l => l.includes('Abfrage fehlgeschlagen')).length === 1, 'Server weg: Warnung nur einmal');
    st.serverDown = false;
    st.poll = serverPoll({ now: await now(page) - 12000, votes: [6, 2, 2] });
    await advance(page, 2500);
    ok(await connected(page), 'Server wieder da: Statuspunkt grün');
    ok((await text(page, '.label-group .option-percentage')) === '60%', 'Server wieder da: Aktualisierung läuft weiter');
    await page.context().close();
  }

  // 5) Kurzes WAITING nach Server-Neustart während einer Abstimmung; danach dauerhaft ohne Stand
  {
    const st = {};
    const page = await open(browser, st);
    await advance(page, 500);
    st.poll = serverPoll({ now: await now(page), votes: [1, 1, 1], left: 20 });
    await advance(page, 5500);
    st.poll = { status: 'WAITING' };
    await advance(page, 4000);
    ok(await visible(page), 'WAITING während Abstimmung: bleibt sichtbar');
    await advance(page, 50000);
    ok(!(await visible(page)), 'Dauerhaft WAITING nach Ablauf + 30 s: ausgeblendet');
    ok((await counts(page)).overlays === 0, 'Dauerhaft WAITING: keine Endsequenz erfunden');
    await page.context().close();
  }

  // 6) Neuladen während laufender Abstimmung
  {
    const st = {};
    st.poll = serverPoll({ now: T0, votes: [7, 3], left: 45 });
    const page = await open(browser, st);
    await advance(page, 1500);
    ok(await visible(page), 'Neuladen: laufende Abstimmung sofort sichtbar');
    ok((await text(page, '.label-group .option-percentage')) === '70%', 'Neuladen: aktueller Stand');
    const t = seconds(await text(page, '#timer'));
    ok(t > 40 && t <= 45, 'Neuladen: Restzeit aus endsAt (' + t + ' s)');
    await page.context().close();
  }

  // 7) Ungültige Serverantwort während einer Abstimmung
  {
    const st = {};
    const page = await open(browser, st);
    await advance(page, 500);
    st.poll = serverPoll({ now: await now(page), votes: [1, 0, 0] });
    await advance(page, 5500);
    st.poll = { status: 'ACTIVE', title: 'kaputt' };
    await advance(page, 4000);
    ok(await visible(page) && (await page.locator('.poll-option').count()) === 3, 'Antwort ohne pollId/choices: letzter Stand bleibt');
    ok(!st.console.some(l => l.startsWith('PAGEERROR')), 'Antwort ohne pollId/choices: kein Skriptfehler');
    await page.context().close();
  }

  // 8) Schalter WIDGET_CHAT_MESSAGE (ältere Server ohne Ergebniszeilen): genau eine Zeile beim Overlay-Ende
  {
    const st = {};
    const page = await open(browser, st);
    await page.evaluate(() => { CONFIG.WIDGET_CHAT_MESSAGE = true; });
    await advance(page, 500);
    st.poll = serverPoll({ now: await now(page), votes: [4, 4, 2] });
    await advance(page, 5500);
    st.poll = Object.assign({}, st.poll, { status: 'COMPLETED' });
    await advance(page, 2000);
    st.poll = Object.assign({}, st.poll, { status: 'ARCHIVED' });
    await advance(page, 14000);
    ok(st.chat.length === 1, 'Schalter an: genau eine Chat-Zeile, auch mit ARCHIVED');
    ok(st.chat[0] && st.chat[0].message.includes('Gleichstand') && st.chat[0].message.includes('"Typ VII" mit 40 Prozent der Stimmen sowie "Typ IX" mit 40 Prozent'), 'Schalter an: Gleichstand-Text wie bisher');
    await page.context().close();
  }

  // 9) Server beim Start nicht erreichbar → Start-Wiederholung wie bisher
  {
    const st = { authDown: true };
    const page = await open(browser, st);
    await advance(page, 500);
    ok((await text(page, '#pollQuestion')) === 'Auth-Server nicht erreichbar!', 'Start ohne Server: Hinweis angezeigt');
    st.authDown = false;
    st.poll = serverPoll({ now: await now(page) + 10000, votes: [1, 2] });
    await advance(page, 11000);
    ok(await visible(page), 'Start ohne Server: nach Wiederholung läuft die Abfrage');
    await page.context().close();
  }

  // 10) Zwei Instanzen: beide zeigen an, keine sendet in der Vorgabe
  {
    const st1 = {}, st2 = {};
    const [p1, p2] = [await open(browser, st1), await open(browser, st2)];
    for (const [p, st] of [[p1, st1], [p2, st2]]) { await advance(p, 500); st.poll = serverPoll({ now: await now(p), votes: [2, 1] }); }
    for (const [p, st] of [[p1, st1], [p2, st2]]) { await advance(p, 5500); st.poll = Object.assign({}, st.poll, { status: 'COMPLETED' }); }
    for (const p of [p1, p2]) await advance(p, 13000);
    ok((await counts(p1)).overlays === 1 && (await counts(p2)).overlays === 1, 'Zwei Instanzen: je eine Endsequenz');
    ok(st1.chat.length + st2.chat.length === 0, 'Zwei Instanzen: keine Chat-Zeile vom Widget');
    await p1.context().close(); await p2.context().close();
  }

  // 11) Demo-Modus (0.9.5): ohne Server, Twitch und Chat; Ablauf wie im Stream
  {
    const st = {};
    const page = await open(browser, st, '?demo=zwei');
    await advance(page, 2000);
    ok(!(await visible(page)), 'Demo: vor dem Start unsichtbar');
    await advance(page, 6000);
    ok(await visible(page), 'Demo: Abstimmung sichtbar');
    ok((await text(page, '#pollQuestion')) === 'Tauchen oder auftauchen?', 'Demo: Beispiel „zwei“');
    await advance(page, 42000);
    ok((await counts(page)).overlays === 1, 'Demo: Endsequenz');
    await advance(page, 30000);
    const c = await counts(page);
    ok(c.overlays === 1 && c.sounds === 1, 'Demo: ARCHIVED ohne zweite Endsequenz, Ton einmal');
    ok(!(await visible(page)), 'Demo: danach ausgeblendet');
    ok(st.tokenCalls === 0 && st.serverCalls === 0 && st.helixCalls === 0 && st.chat.length === 0, 'Demo: keine Anfrage an Server oder Twitch, kein Chat');
    ok(!st.console.some(l => l.startsWith('PAGEERROR')), 'Demo: keine Skriptfehler');
    await page.context().close();
  }

  // 12) Demo „null“ mit always=1: dauerhaft sichtbar (AUTO_HIDE aus), 0:0 als Gleichstand; Abbruch-Beispiel endet früher
  {
    const st = {};
    const page = await open(browser, st, '?demo=null&always=1');
    await advance(page, 1000);
    ok(await visible(page), 'always=1: ohne Abstimmung sichtbar (AUTO_HIDE aus)');
    await advance(page, 55000);
    ok((await text(page, '#winnerAnnouncement')).includes('Gleichstand'), 'Demo 0:0: Gleichstand-Banner');
    await advance(page, 10000);
    ok(await visible(page), 'always=1: nach der Endsequenz weiter sichtbar');
    await page.context().close();
    const st2 = {};
    const p2 = await open(browser, st2, '?demo=abbruch');
    await advance(p2, 32000);
    ok((await counts(p2)).overlays === 1, 'Demo Abbruch: Endsequenz nach 27 s Laufzeit');
    await p2.context().close();
  }

  // 13) demo.html: lädt ohne Fehler und ohne Anfragen nach außen
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [], ext = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('request', r => { if (!r.url().startsWith('file:')) ext.push(r.url()); });
    await page.goto('file://' + path.resolve(__dirname, '..', 'demo.html'));
    await sleep(1500);
    ok(errs.length === 0, 'demo.html: keine Skriptfehler');
    ok(ext.length === 0, 'demo.html: keine Anfragen nach außen');
    ok((await page.frameLocator('#frameA').locator('#widgetContainer').count()) === 1, 'demo.html: Widget eingebunden');
    ok(await page.evaluate(() => getComputedStyle(document.getElementById('boxB')).display === 'none'), 'demo.html: ohne Entwurf nur ein Widget');
    await ctx.close();
  }

  await browser.close();
  console.log(fails ? `\n${fails} FAIL` : '\n0 FAIL');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
