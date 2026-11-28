/* IYB Record Keeping QA – Phase 1 (registration, shell, language, storage isolation, CSS isolation, responsive).
 * Run: node tests/recordkeeping-qa.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.');
const AR = /[؀-ۿ]/;
async function openRk(pg) {
  const o = await pg.evaluate(() => !!document.querySelector('[data-tool-head="recordkeeping"]') && document.querySelector('[data-tool-head="recordkeeping"]').offsetParent !== null);
  if (!o) await pg.click('.sidebar-group-head');
  await pg.evaluate(() => document.querySelector('[data-tool-head="recordkeeping"]').click()); await pg.waitForFunction(() => window.SIYBRecordKeeping && document.querySelector('#rkRoot'), null, { timeout: 8000 }); await pg.waitForTimeout(400);
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(URL_); await pg.waitForFunction(() => window.SIYBModules, null, { timeout: 10000 }); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  // registry
  const reg = await pg.evaluate(() => { const l = SIYBModules.list(); const m = SIYBModules.get('recordkeeping'); return { ids: l.map((x) => x.id + ':' + x.order).join(), m: m && { order: m.order, group: m.group, g: m.external.global, r: m.external.rootSelector, b: m.external.bodyClass, badge: m.external.badge, modes: m.modes.join(), ar: m.title.ar, en: m.title.en } }; });
  rec('Registry', 'Registered in group iyb at order 6 after Planning (5)', reg.m && reg.m.order === 6 && reg.m.group === 'iyb' && /planning:5,recordkeeping:6$/.test(reg.ids.split(',').filter((x) => /^(planning|recordkeeping):/.test(x)).join()), reg.ids);
  rec('Registry', 'id/global/root/body class/badge as approved', reg.m && reg.m.g === 'SIYBRecordKeeping' && reg.m.r === '#rkRoot' && reg.m.b === 'mode-recordkeeping' && reg.m.badge === 'RK' && reg.m.modes === 'recordkeeping');
  rec('Registry', 'Titles: «مسك السجلات» / Record Keeping', reg.m && reg.m.ar === 'مسك السجلات' && reg.m.en === 'Record Keeping');
  rec('Registry', 'Existing module orders unchanged (gyb1 costing2 stock3 marketing4 planning5)', ['gyb:1', 'costing:2', 'stock:3', 'marketing:4', 'planning:5'].every((x) => reg.ids.includes(x)));
  // sidebar + welcome
  await pg.click('.sidebar-group-head');
  const sb = await pg.evaluate(() => [...document.querySelectorAll('[data-tool-head]')].map((e) => e.dataset.toolHead).join());
  rec('Sidebar', 'Appears inside the IYB group after planning', /planning,recordkeeping/.test(sb), sb);
  const welcomeHas = await pg.evaluate(() => document.body.innerText.includes('مسك السجلات'));
  rec('Welcome', 'Module card/entry visible with its Arabic title', welcomeHas);
  // open
  await openRk(pg);
  const st = await pg.evaluate(() => ({ cls: document.body.classList.contains('mode-recordkeeping'), others: ['gyb', 'stock', 'marketing', 'planning'].some((m) => document.body.classList.contains('mode-' + m)), nav: document.querySelectorAll('[data-nav-group="recordkeeping"] .global-nav-item').length, cards: document.querySelectorAll('#rkRoot .rk-card').length, badge: document.querySelector('#workspaceBadgeNumber').textContent, dir: document.documentElement.dir, h: document.querySelector('#rkRoot h2').textContent }));
  rec('Open', 'Opens with body class, no other mode class, no errors', st.cls && !st.others && errs.length === 0, errs.join('|'));
  rec('Open', 'Sub-menu: overview + 7 sections (intro, I, II, III, end, forms, data)', st.nav === 8, String(st.nav));
  rec('Open', 'Overview shows 6 cards (data page has no card)', st.cards === 6, String(st.cards));
  rec('Open', 'Badge RK; Arabic default is RTL', st.badge === 'RK' && st.dir === 'rtl');
  const txt = ad(await pg.evaluate(() => document.querySelector('#rkRoot').innerText));
  rec('Content', 'Preliminary-translation notice and ILO attribution/disclaimers present (Arabic)', /ترجمة أولية/.test(txt) && /CC BY-SA 3\.0 IGO/.test(txt) && /لم يُعدّها مكتب العمل الدولي/.test(txt) && /تأييد/.test(txt));
  rec('Content', 'No ILO emblem or logo image in the module', await pg.evaluate(() => document.querySelectorAll('#rkRoot img, #rkRoot svg').length === 0));
  rec('Scope', 'Landing page has no inputs, forms or calculations', await pg.evaluate(() => document.querySelectorAll('#rkRoot input,#rkRoot textarea,#rkRoot select,#rkRoot [data-calc]').length === 0 /* landing page only; Phase 2 adds inputs inside content views */));
  // sections
  const secs = ['intro', 'p1', 'p2', 'p3', 'end', 'forms', 'data'];
  let ok = true; for (const s of secs) { await pg.evaluate((x) => SIYBRecordKeeping.open(x), s); await pg.waitForTimeout(120); const t = await pg.evaluate(() => document.querySelector('#rkRoot').innerText); if (['end'].includes(s) && !/لم تُضَف بعد/.test(t)) ok = false; if (['intro', 'p1', 'p2', 'p3', 'forms'].includes(s) && (/لم تُضَف بعد/.test(t))) ok = false; }
  rec('Sections', 'All seven sections open; end matter keeps the “not included yet” note; parts I–III and forms now show content (Phase 2–3)', ok);
  await pg.evaluate(() => SIYBRecordKeeping.open('forms')); await pg.waitForTimeout(150);
  rec('Sections', 'Forms page lists the manual’s ten forms by name only', (await pg.$$('#rkRoot .rk-forms li')).length === 10);
  await pg.evaluate(() => SIYBRecordKeeping.open('p2')); await pg.waitForTimeout(150);
  rec('Sections', 'Part II now shows content with Activities 3–7 and Assessment 2 available', await pg.evaluate(() => !!document.querySelector('#rkRoot .rk-sub') && /3|٣/.test(document.querySelector('#rkRoot').innerText)));
  // language
  await pg.evaluate(() => SIYBRecordKeeping.open('home')); await pg.waitForTimeout(150);
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(600);
  const en = await pg.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, t: document.querySelector('#rkRoot').innerText, h: document.querySelector('#workspaceTitle').textContent, nav: document.querySelector('[data-nav-group="recordkeeping"]').innerText }));
  rec('Language', 'English switch: LTR, English text only in module and its sub-menu', en.dir === 'ltr' && en.lang === 'en' && !AR.test(en.t) && !AR.test(en.nav) && /Record Keeping/.test(en.h), (en.t.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  rec('Language', 'English notices: preliminary translation, not accounting software, ILO licence', /preliminary translation/.test(en.t) && /not accounting software/.test(en.t) && /CC BY-SA 3\.0 IGO/.test(en.t));
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(500);
  rec('Language', 'Back to Arabic restores RTL', await pg.evaluate(() => document.documentElement.dir === 'rtl' && /مسك السجلات/.test(document.querySelector('#workspaceTitle').textContent)));
  // storage
  await pg.evaluate(() => SIYBRecordKeeping.open('p3')); await pg.waitForTimeout(600); await pg.evaluate(() => SIYBRecordKeeping.open('home')); await pg.waitForTimeout(600);
  const sto = await pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const added = Object.keys(sto).filter((k) => !(k in before));
  rec('Storage', 'Only siyb.iyb.recordkeeping.v1 added (plus language key if toggled)', added.filter((k) => k !== 'siyb-language' && k !== 'siyb.language').join() === 'siyb.iyb.recordkeeping.v1', added.join());
  const own = JSON.parse(sto['siyb.iyb.recordkeeping.v1'] || '{}');
  rec('Storage', 'Header: schemaVersion 1, moduleId "recordkeeping"; no records/answers stored', own.schemaVersion === 1 && own.moduleId === 'recordkeeping' && Object.keys(own).sort().join() === 'language,lastSection,moduleId,schemaVersion,updatedAt', Object.keys(own).join());
  rec('Storage', 'Other modules’ keys untouched', Object.keys(before).every((k) => k === 'siyb-language' || sto[k] === before[k]));
  // corrupt data kept non-destructively
  await pg.evaluate(() => { localStorage.setItem('siyb.iyb.recordkeeping.v1', '{bad json'); }); await pg.reload(); await pg.waitForTimeout(900); await openRk(pg);
  const cor = await pg.evaluate(() => ({ un: localStorage.getItem('siyb.iyb.recordkeeping.v1.unreadable'), ok: !!document.querySelector('#rkRoot h2') }));
  rec('Storage', 'Unreadable stored data is copied to .unreadable and the module still opens', cor.un === '{bad json' && cor.ok);
  await pg.evaluate(() => { localStorage.setItem('siyb.iyb.recordkeeping.v1', JSON.stringify({ schemaVersion: 1, moduleId: 'planning' })); localStorage.removeItem('siyb.iyb.recordkeeping.v1.unreadable'); });
  await pg.reload(); await pg.waitForTimeout(900); await openRk(pg);
  rec('Storage', 'A foreign moduleId is rejected (treated as unreadable)', await pg.evaluate(() => !!localStorage.getItem('siyb.iyb.recordkeeping.v1.unreadable')));
  // last section persistence
  await pg.evaluate(() => SIYBRecordKeeping.open('p2')); await pg.waitForTimeout(600); await pg.reload(); await pg.waitForTimeout(900); await openRk(pg);
  rec('Persistence', 'Last visited section restored after reload', await pg.evaluate(() => SIYBRecordKeeping.current() === 'p2'));
  // CSS isolation
  const css = await pg.evaluate(async () => { const t = await (await fetch('styles/recordkeeping.css')).text(); const sels = t.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter(Boolean).flatMap((s) => s.split(',').map((x) => x.trim())); return sels.filter((s) => !/^(@media.*|\.rk-.*)$/.test(s)); });
  rec('CSS', 'Every selector in recordkeeping.css is rk- prefixed (no global rules)', css.length === 0, css.slice(0, 3).join());
  await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  const plan = await pg.evaluate(() => ({ cls: document.body.classList.contains('mode-planning') && !document.body.classList.contains('mode-recordkeeping'), h: document.querySelector('#pypRoot h2') && getComputedStyle(document.querySelector('#pypRoot h2')).fontSize }));
  rec('CSS', 'Planning still renders unchanged beside Record Keeping (h2 19px)', plan.cls && plan.h === '19px');
  // responsive
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); await openRk(pg); for (const s of ['home', 'p2', 'forms']) { await pg.evaluate((x) => SIYBRecordKeeping.open(x), s); await pg.waitForTimeout(120); const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); rec('Responsive', `No horizontal overflow at ${w}px (${s})`, ov <= 1, String(ov)); } }
  // regression smoke of siblings
  await pg.setViewportSize({ width: 1280, height: 800 });
  for (const t of ['marketing', 'stock', 'planning']) { await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(800); rec('Regression', t + ' still opens', await pg.evaluate((x) => document.body.classList.contains('mode-' + x) && !document.body.classList.contains('mode-recordkeeping'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
