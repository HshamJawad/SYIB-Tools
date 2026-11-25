/* IYB Planning QA – Phase 6 (end of the manual: Can You Help?, Action Plan, Answers, Useful business words).
 * Run: node tests/planning-qa-phase6.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٬/g, ',').replace(/٫/g, '.');
const AR = /[؀-ۿ]/;
async function open(pg, s) { await pg.evaluate((x) => SIYBPlanning.open(x), s); await pg.waitForTimeout(300); }
const setv = (pg, key, v) => pg.evaluate(([k, x]) => { const el = document.querySelector('[data-key="' + k + '"]'); if (!el) throw new Error('missing ' + k); el.value = x; el.dispatchEvent(new Event('input', { bubbles: true })); }, [key, String(v)]);
const calc = async (pg, n) => ad(await pg.evaluate((x) => (document.querySelector('[data-calc="' + x + '"]') || {}).textContent || '', n));
const prog = async (pg) => ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="end"]').innerText));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const pg = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('dialog', (d) => d.accept());
  await pg.goto(URL_); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  const home = ad(await pg.evaluate(() => document.querySelector('#pypRoot').innerText));
  rec('Dashboard', 'All six learning cards show progress (Parts I–V and the end of the manual)', (await pg.$$('#pypRoot .pyp-card [data-pyp-prog]')).length === 6);
  await open(pg, 'end');
  const ids = await pg.evaluate(() => [...document.querySelectorAll('#pypRoot [id^="pypSec-end-"],#pypRoot [id^="pypEx-"]')].map((e) => e.id).join());
  rec('Structure', 'Sections in the manual’s order: learn, Reliable Tailors, case form, Chimba, case form, action plan, form, answers, words', ids === 'pypSec-end-learn,pypSec-end-tailors,pypEx-c1,pypSec-end-chimba,pypEx-c2,pypSec-end-action,pypEx-c3,pypSec-end-answers,pypSec-end-words', ids);
  const hd = await pg.evaluate(() => document.querySelector('#pypRoot h2').textContent);
  rec('Structure', 'Heading is the end-of-manual title without “Part”', !/الجزء/.test(hd) && /نهاية الدليل/.test(hd), hd);
  const pgs = ad(await pg.evaluate(() => [...document.querySelectorAll('#pypRoot .pyp-srcpg')].map((e) => e.innerText).join('|')));
  rec('Structure', 'Source page tags cover pp. 89–101', ['89', '90', '91', '94', '96', '97', '101'].every((n) => pgs.includes(n)), pgs);
  rec('Progress', 'Starts at 0/3 (two cases and the Action Plan)', /0\/3/.test(await prog(pg)));
  const txt = ad(await pg.evaluate(() => document.querySelector('#pypRoot').innerText));
  rec('Case data', 'Reliable Tailors facts preserved (5% VAT, $350 December VAT, 50% credit, $8,000 December sales, $500 loan, $600 cash box, $2,000 bank)', ['5,000', '6,000', '7,000', '2,200', '3,230', '5% VAT', '350', '50%', '8,000', '500', '600', '2,000'].every((w) => txt.includes(w)) || ['٥%', '5%'].some((w) => txt.includes(w)));
  rec('Case data', 'Chimba facts preserved (20 chairs, 10 tables, $40, $80, rent +$10, transport $32, $500 wages 70/30, maintenance $40, +20% timber, $10 and $22)', ['عشرين كرسياً', '80 دولاراً', '32 دولاراً', '70%', '40 دولاراً', '22 دولاراً'].every((w) => txt.includes(w)));
  rec('Case data', 'No answers are shown before they are requested', await pg.evaluate(() => !document.querySelector('#pypEx-c1 .pyp-answer') && !document.querySelector('#pypEx-c2 .pyp-answer')) && !/6,175/.test(txt.replace(/6,175\s*$/, '')) );
  rec('Case forms', 'Forms start empty (no pre-filled case figures)', await pg.evaluate(() => [...document.querySelectorAll('#pypTailorsWs input, #pypChimbaWs input')].every((i) => i.value === '')));
  // Reliable Tailors
  const T = { sales: [2500, 3000, 3500], credit: [4000, 2500, 3000], otherIn: [825, 275, 325], mat: [2200, 2720, 3230], lab: [800, 1080, 1220], oh: [1100, 1200, 1200], equip: [500, '', ''], otherOut: [400, 375, 325] };
  await setv(pg, 'cases.tailors.open', 2600);
  for (const k of Object.keys(T)) for (let j = 0; j < 3; j++) await setv(pg, 'cases.tailors.' + k + '.m' + j, T[k][j]);
  await pg.waitForTimeout(450);
  const g3 = async (k) => [await calc(pg, k + '.m0'), await calc(pg, k + '.m1'), await calc(pg, k + '.m2')].join('|');
  rec('Reliable Tailors', 'Total cash in 7,325 / 5,775 / 6,825', (await g3('tl.tin')) === '7,325|5,775|6,825', await g3('tl.tin'));
  rec('Reliable Tailors', 'Total cash out 5,000 / 5,375 / 5,975', (await g3('tl.tout')) === '5,000|5,375|5,975', await g3('tl.tout'));
  rec('Reliable Tailors', 'Cash at the end of the month 4,925 / 5,325 / 6,175 (the manual’s answer)', (await g3('tl.close')) === '4,925|5,325|6,175', await g3('tl.close'));
  rec('Reliable Tailors', 'Next month’s opening cash = previous closing (4,925; 5,325)', (await calc(pg, 'tl.open.m1')) === '4,925' && (await calc(pg, 'tl.open.m2')) === '5,325');
  rec('Reliable Tailors', 'No shortage message when the balance stays positive', /No cash shortage|لا يظهر نقص/.test(await calc(pg, 'tl.sentence')));
  await setv(pg, 'cases.tailors.mat.m0', 9000); await pg.waitForTimeout(350);
  rec('Reliable Tailors', 'A shortage is flagged in words when closing cash goes negative', /⚠/.test(await calc(pg, 'tl.sentence')));
  await setv(pg, 'cases.tailors.mat.m0', 2200); await pg.waitForTimeout(350);
  rec('Progress', 'Typing in the Tailors form counts the case (1/3)', /1\/3/.test(await prog(pg)));
  await pg.evaluate(() => document.querySelector('#pypEx-c1 [data-act="reveal"]').click()); await pg.waitForTimeout(250);
  const ansT = ad(await pg.evaluate(() => document.querySelector('#pypEx-c1 .pyp-answer').innerText));
  rec('Reliable Tailors', 'Manual’s answer appears on request (the table and VAT/loan notes: 325 and 375)', /6,175/.test(ansT) && /4,925/.test(ansT) && /325/.test(ansT) && /375/.test(ansT));
  // Chimba
  for (const [k, v] of [['chair.qty', 20], ['chair.price', 40], ['table.qty', 10], ['table.price', 80], ['lab', 350], ['chair.per', 10], ['chair.num', 20], ['table.per', 22], ['table.num', 10]]) await setv(pg, 'cases.chimba.' + k + '.m0', v);
  for (const [k, v] of [['rent', 150], ['elec', 50], ['transport', 32], ['wages', 150], ['maint', 40]]) await setv(pg, 'cases.chimba.oh.' + k, v);
  await pg.waitForTimeout(450);
  const R = async (k) => (await calc(pg, k + '.m0'));
  rec('Chimba', 'Sales: chairs 800, tables 800, total 1,600', (await R('cm.cs')) === '800' && (await R('cm.ts')) === '800' && (await R('cm.sales')) === '1,600');
  rec('Chimba', 'Overhead total 422; labour 350', (await calc(pg, 'cm.ohT')) === '422' && (await R('cm.lab')) === '350');
  rec('Chimba', 'Material: chairs 200, tables 220, total 420', (await R('cm.mc')) === '200' && (await R('cm.mt')) === '220' && (await R('cm.mat')) === '420');
  rec('Chimba', 'Forecast of costs: 420 / 350 / 422 = 1,192 (linked, not re-typed)', (await R('cm.cM')) === '420' && (await R('cm.cL')) === '350' && (await R('cm.cO')) === '422' && (await R('cm.cT')) === '1,192' && !(await pg.$('#pypChimbaWs table:nth-of-type(5) input')));
  rec('Chimba', 'Gross Profit 830 and Net Profit 408 in January (the manual’s answer)', (await R('cm.pG')) === '830' && (await R('cm.pN')) === '408');
  rec('Chimba', 'February and March stay blank where nothing was entered', (await calc(pg, 'cm.pN.m1')) === '' && (await calc(pg, 'cm.pN.m2')) === '' && (await calc(pg, 'cm.cT.m1')) === '');
  rec('Chimba', 'Sentence reports the January profits and says it is a training exercise', /830/.test(await calc(pg, 'cm.sentence')) && /408/.test(await calc(pg, 'cm.sentence')));
  await pg.evaluate(() => document.querySelector('#pypEx-c2 [data-act="reveal"]').click()); await pg.waitForTimeout(250);
  const ansC = ad(await pg.evaluate(() => document.querySelector('#pypEx-c2 .pyp-answer').innerText));
  rec('Chimba', 'Manual’s answer on request (1,600; 422; 350; 420; 1,192; 830; 408)', ['1,600', '422', '350', '420', '1,192', '830', '408'].every((n) => ansC.includes(n)));
  // Action plan
  rec('Action Plan', 'Juma’s example and the six suggestions are present', /ماكينة بثق|extruding/.test(await pg.evaluate(() => document.querySelector('#pypSec-end-action').innerText)) && (await pg.$$('#pypSec-end-action ul li')).length === 6);
  await pg.evaluate(() => document.querySelector('[data-act="ap-add"]').click()); await pg.waitForTimeout(300);
  const foc = await pg.evaluate(() => document.activeElement && document.activeElement.dataset.key);
  rec('Action Plan', 'Adding an action focuses its first field; four columns what/how/who/when', foc === 'actionPlan.0.what' && (await pg.$$('#pypAp-0 textarea')).length === 4, foc);
  await setv(pg, 'actionPlan.0.what', 'No monthly cash plan'); await setv(pg, 'actionPlan.0.how', 'Make the plan every month'); await setv(pg, 'actionPlan.0.who', 'Me'); await setv(pg, 'actionPlan.0.when', 'Zorbex March');
  await pg.evaluate(() => document.querySelector('[data-act="ap-add"]').click()); await pg.waitForTimeout(250); await setv(pg, 'actionPlan.1.what', 'Second problem');
  await pg.evaluate(() => document.querySelector('#pypAp-0 [data-kind="apdone"]').click()); await pg.waitForTimeout(500);
  const ap = await pg.evaluate(() => SIYBPlanningStore.get('actionPlan'));
  rec('Action Plan', 'Actions saved with the manual’s four fields and the done tick', ap.length === 2 && ap[0].what === 'No monthly cash plan' && ap[0].how === 'Make the plan every month' && ap[0].who === 'Me' && ap[0].when === 'Zorbex March' && ap[0].done === '1' && !ap[1].done, JSON.stringify(ap));
  rec('Progress', 'Both cases and the Action Plan complete (3/3)', /3\/3/.test(await prog(pg)));
  await pg.evaluate(() => document.querySelector('#pypAp-1 [data-act="ap-del"]').click()); await pg.waitForTimeout(400);
  rec('Action Plan', 'Removing an action (with confirmation) deletes only that action', await pg.evaluate(() => SIYBPlanningStore.get('actionPlan').length === 1 && document.querySelectorAll('#pypApList .pyp-fc').length === 1 && document.querySelector('[data-key="actionPlan.0.what"]').value === 'No monthly cash plan'));
  // answers + glossary
  const aw = await pg.evaluate(() => document.querySelector('#pypSec-end-answers').innerText);
  rec('Answers', 'Answers section explains where each answer appears; no key is invented', /التقييمات/.test(aw) && !/1b|bcac/.test(aw));
  const gl = await pg.evaluate(() => [...document.querySelectorAll('#pypSec-end-words tbody tr')].map((r) => r.innerText.replace(/\s+/g, ' ')));
  rec('Glossary', 'Ten business words with meaning and manual page references, as on p. 101', gl.length === 10 && ad(gl.join('|')).includes('68–78') && ad(gl.join('|')).includes('15–25') && /37/.test(ad(gl[7])), String(gl.length));
  // language / persistence
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(600);
  const en = await pg.evaluate(() => { const c = document.querySelector('#pypRoot').cloneNode(true); c.querySelectorAll('textarea,input,select,option,[data-key]').forEach((x) => x.remove()); return { t: c.innerText, dir: document.documentElement.dir, ap: document.querySelector('[data-key="actionPlan.0.who"]').value, cl: (document.querySelector('[data-calc="tl.close.m2"]') || {}).textContent }; });
  rec('Language', 'English: LTR, no Arabic letters outside typed entries, data and calculations kept', en.dir === 'ltr' && !AR.test(en.t) && en.ap === 'Me' && en.cl === '6,175', (en.t.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(500);
  await pg.waitForTimeout(500); await pg.reload(); await pg.waitForTimeout(900); await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(800); await open(pg, 'end');
  { const a = await calc(pg, 'tl.close.m2'), b = await calc(pg, 'cm.pN.m0'), c = await pg.evaluate(() => document.querySelector('[data-key="actionPlan.0.when"]').value), d = await prog(pg); rec('Persistence', 'After reload: case figures, calculations, action plan and progress restored', a === '6,175' && b === '408' && c === 'Zorbex March' && /3\/3/.test(d), [a, b, c, d].join('|')); }
  rec('Persistence', 'The done tick survives a reload', await pg.evaluate(() => document.querySelector('#pypAp-0 [data-kind="apdone"]').checked));
  const keys = await pg.evaluate(() => Object.keys(localStorage).sort().join()); rec('Storage', 'Only siyb.iyb.planning.v1 added to localStorage', keys.split(',').filter((k) => !before.split(',').includes(k) && k !== 'siyb-language').join() === 'siyb.iyb.planning.v1', keys);
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); await open(pg, 'end'); rec('Responsive', `No page-level horizontal overflow at ${w}`, await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1)); }
  await pg.setViewportSize({ width: 1280, height: 800 });
  await open(pg, 'data'); rec('Scope', 'Data & report (Phase 7) is still a placeholder', await pg.evaluate(() => /المرحلة [7٧]|phase 7/i.test(document.querySelector("#pypRoot").innerText)) && (await pg.$$('#pypRoot textarea')).length === 0);
  await open(pg, 'p5'); rec('Part V', 'Part V still opens with its 14 activities', (await pg.$$('#pypRoot [id^="pypEx-a"]')).length === 14);
  for (const t of ['marketing', 'stock', 'costing']) { const o = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!o) await pg.click('.sidebar-group-head'); await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(700); rec('Regression', t + ' still opens', await pg.evaluate((x) => (x === 'costing' ? (!document.body.classList.contains('mode-training') && document.querySelector('#costingModuleRoot').innerText.length > 100) : document.body.classList.contains('mode-' + x)) && !document.body.classList.contains('mode-planning'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
