/* IYB Planning QA – Phase 5 (Part V: Making plans, Activities 7–20, Assessment 5).
 * Run: node tests/planning-qa-phase5.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٬/g, ',').replace(/٫/g, '.');
const AR = /[؀-ۿ]/;
const J = { sq: [210, 284, 336, 356, 371, 378, 385, 392, 402, 420, 484, 515],
  oh: { Rent: [400, 400, 370, 370, 370, 370, 370, 370, 370, 370, 370, 370], Electricity: [117, 117, 117, 117, 117, 117, 117, 117, 130, 130, 143, 143], Water: Array(12).fill(26), Labour: Array(12).fill(1320), Depreciation: Array(12).fill(200), Transport: [182, 182, 195, 195, 195, 195, 195, 195, 195, 195, 208, 234], Stationery: Array(12).fill(65), Licence: Array(12).fill(10), Insurance: Array(12).fill(40), Marketing: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1300, 1300] } };
async function open(pg, s) { await pg.evaluate((x) => SIYBPlanning.open(x), s); await pg.waitForTimeout(300); }
const setv = (pg, key, v) => pg.evaluate(([k, x]) => { const el = document.querySelector('[data-key="' + k + '"]'); if (!el) throw new Error('missing ' + k); el.value = x; el.dispatchEvent(new Event('input', { bubbles: true })); }, [key, String(v)]);
const calc = async (pg, name) => ad(await pg.evaluate((n) => (document.querySelector('[data-calc="' + n + '"]') || {}).textContent || '', name));
const row = async (pg, key) => { const out = []; for (let j = 0; j < 12; j++) out.push(await calc(pg, key + '.m' + j)); return out; };
const prog = async (pg) => ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p5"]').innerText));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const pg = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('dialog', (d) => d.accept());
  await pg.goto(URL_); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  // seed one risk with actions in Part IV (to be shown, not duplicated, in Part V)
  await open(pg, 'p4'); await pg.evaluate(() => document.querySelector('[data-act="risk-add"]').click()); await pg.waitForTimeout(250);
  await setv(pg, 'risks.0.risk', 'Fire in the workshop'); await setv(pg, 'risks.0.actions', 'Buy fire insurance'); await pg.waitForTimeout(500);
  await open(pg, 'p5');
  const ids = await pg.evaluate(() => [...document.querySelectorAll('#pypRoot [id^="pypEx-"],#pypRoot [id^="pypAs-"]')].map((e) => e.id).join());
  rec('Structure', 'Activities 7–20 and Assessment 5 in manual order', ids === ['a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20'].map((x) => 'pypEx-' + x).concat('pypAs-a5').join(), ids);
  const pgs = ad(await pg.evaluate(() => [...document.querySelectorAll('#pypRoot .pyp-srcpg')].map((e) => e.innerText).join('|')));
  rec('Structure', 'Source page tags span pp. 43–85', ['43', '44', '47', '49', '58', '65', '68', '75', '77', '82', '83', '84'].every((n) => pgs.includes(n)));
  rec('Structure', 'Progress counts 14 activities + summary + Assessment 5 = 16, starting at 0', /0\/16/.test(await prog(pg)));
  const txt = await pg.evaluate(() => document.querySelector('#pypRoot').innerText);
  rec('Content', 'Key manual passages: two-step process, 3 Rs, 12 steps, flat vs reduced balance, collateral', ['خطوتين', 'إعادة التدوير', 'الخطوة 12', 'الرصيد المتناقص', 'الضمان'].every((w) => ad(txt).includes(w)));
  rec('Content', 'Worked example tables present (113,325; 61,560; 30,880; 35,925; 5,045; (4,097); 4,320; 4,180)', ['113,325', '61,560', '30,880', '35,925', '5,045', '(4,097)', '4,320', '4,180'].every((n) => ad(txt).includes(n)));
  // objectives + risk reference
  await pg.evaluate(() => document.querySelector('[data-act="obj-add"]').click()); await pg.waitForTimeout(250);
  await setv(pg, 'objectives.0.text', 'Zorbex goal 5000'); await pg.selectOption('[data-key="objectives.0.kind"]', 'fin'); await pg.waitForTimeout(450);
  rec('Objectives', 'Objective saved with its type', await pg.evaluate(() => { const o = SIYBPlanningStore.get('objectives.0'); return o.text.startsWith('Zorbex') && o.kind === 'fin'; }));
  rec('Risk link', 'Part IV risks and actions are shown read-only in Part V (no duplicate entries)', await pg.evaluate(() => [...document.querySelectorAll('#pypRiskRef input[readonly]')].map((x) => x.value).join('|') === 'Fire in the workshop|Buy fire insurance' && SIYBPlanningStore.get('risks').length === 1 && !document.querySelector('#pypRiskRef textarea,#pypRiskRef input:not([readonly])')));
  // Activity 7 / 10 text counts
  await setv(pg, 'activities.a7.q0', 'SMS promotion'); await setv(pg, 'activities.a10.q0', 'Maintain the machine'); await pg.waitForTimeout(450);
  rec('Progress', 'Activities 7 and 10 count once text is saved (2/16)', /2\/16/.test(await prog(pg)));
  // Activity 8 – sales
  for (let j = 0; j < 12; j++) await setv(pg, 'plans.salesMarketing.fc.0.qty.m' + j, J.sq[j]);
  await setv(pg, 'plans.salesMarketing.fc.0.price.m0', 25); await pg.evaluate(() => document.querySelector('[data-act="fill-jan"][data-path="plans.salesMarketing.fc.0.price"]').click()); await pg.waitForTimeout(400);
  const ss = await row(pg, 'ss0'); rec('Activity 8', 'Monthly sales match the manual (p.48)', ss.join('|') === ['5,250', '7,100', '8,400', '8,900', '9,275', '9,450', '9,625', '9,800', '10,050', '10,500', '12,100', '12,875'].join('|'), ss.join('|'));
  rec('Activity 8', 'Totals: sales 113,325, quantity 4,533, price 25', (await calc(pg, 'ss0.t')) === '113,325' && (await calc(pg, 'sq0.t')) === '4,533' && (await calc(pg, 'sp0.t')) === '25');
  rec('Activity 8', '“Apply the January price to all months” filled the price row', await pg.evaluate(() => SIYBPlanningStore.get('plans.salesMarketing.fc.0.price.m11') === '25'));
  // products add / rename / remove
  await setv(pg, 'plans.productNames.0', 'Poles'); await pg.evaluate(() => document.querySelector('[data-act="pp-add"]').click()); await pg.waitForTimeout(300);
  rec('Products', 'Adding a product adds its tables; names are used in captions', await pg.evaluate(() => document.querySelectorAll('#pypSalesWs table').length >= 3 && /Poles/.test(document.querySelector('#pypSalesWs').innerText)));
  await pg.evaluate(() => document.querySelector('[data-act="pp-del"]').click()); await pg.waitForTimeout(300);
  rec('Products', 'Removing the last product restores the previous tables and keeps product 1 data', await pg.evaluate(() => SIYBPlanningStore.get('plans.nProducts') === 2 && SIYBPlanningStore.get('plans.salesMarketing.fc.0.qty.m0') === '210'));
  // Activity 9
  await setv(pg, 'plans.productionCost.waste.0.material', 'Crushed plastic'); await setv(pg, 'plans.productionCost.waste.0.recycle', 'Recycle offcuts'); await pg.waitForTimeout(450);
  // Activity 11 production quantity 380
  await setv(pg, 'plans.productionCost.prodQty.0.m0', 380); await pg.evaluate(() => { const b = document.querySelector('[data-act="fill-jan"]'); }); for (let j = 1; j < 12; j++) await setv(pg, 'plans.productionCost.prodQty.0.m' + j, 380); await pg.waitForTimeout(300);
  rec('Activity 11', 'Production quantity total 4,560', (await calc(pg, 'pq0.t')) === '4,560');
  await pg.evaluate(() => document.querySelector('[data-act="pq-copy"][data-i="0"]').click()); await pg.waitForTimeout(400);
  rec('Activity 11', '“Use my sales quantity” copies the sales quantities once (4,533)', (await calc(pg, 'pq0.t')) === '4,533');
  for (let j = 0; j < 12; j++) await setv(pg, 'plans.productionCost.prodQty.0.m' + j, 380); await pg.waitForTimeout(300);
  // Activity 12 practice
  const a12 = [[300, 300, 300, 315, 315, 315], [100, 100, 100, 100, 120, 120], [20, 20, 20, 20, 20, 20], [18, 18, 18, 18, 18, 18], [35, 35, 35, 35, 35, 35]];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) await setv(pg, 'plans.practice.a12.' + i + '.m' + j, a12[i][j]);
  await pg.waitForTimeout(300);
  rec('Activity 12', 'Totals 473 473 473 488 508 508 (the manual’s answer)', (await Promise.all([0, 1, 2, 3, 4, 5].map((j) => calc(pg, 'a12.m' + j)))).join() === '473,473,473,488,508,508');
  rec('Activity 12', 'The manual’s answer is hidden until requested', await pg.evaluate(() => !document.querySelector('#pypEx-a12 .pyp-answer')));
  await pg.evaluate(() => document.querySelector('#pypEx-a12 [data-act="reveal"]').click()); await pg.waitForTimeout(250);
  rec('Activity 12', 'Revealed answer shows the manual’s table', await pg.evaluate(() => /508/.test(document.querySelector('#pypEx-a12 .pyp-answer').innerText) || /٥٠٨/.test(document.querySelector('#pypEx-a12 .pyp-answer').innerText)));
  // Activity 13 overhead (10 rows)
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => document.querySelector('[data-act="oh-add"]').click()); await pg.waitForTimeout(200); }
  const names = Object.keys(J.oh); for (let i = 0; i < names.length; i++) { await setv(pg, 'plans.productionCost.oh.' + i + '.name', names[i]); for (let j = 0; j < 12; j++) await setv(pg, 'plans.productionCost.oh.' + i + '.m' + j, J.oh[names[i]][j]); }
  await pg.waitForTimeout(400);
  const ohT = await row(pg, 'ohT');
  rec('Activity 13', 'Monthly totals 2,360 … 3,708', ohT.join('|') === ['2,360', '2,360', '2,343', '2,343', '2,343', '2,343', '2,343', '2,343', '2,356', '2,356', '3,682', '3,708'].join('|'), ohT.join('|'));
  rec('Activity 13', 'Year total 30,880 and a row total (Rent 4,500)', (await calc(pg, 'ohT.t')) === '30,880' && (await calc(pg, 'oh0.t')) === '4,500');
  // Activity 14 material cost per item 13.5
  await setv(pg, 'plans.productionCost.matItem.0.m0', 13.5); await pg.evaluate(() => document.querySelector('[data-act="fill-jan"][data-path="plans.productionCost.matItem.0"]').click()); await pg.waitForTimeout(400);
  rec('Activity 14', 'Material Cost = per item × production quantity: 5,130 a month, 61,560 a year', (await calc(pg, 'mm0.m0')) === '5,130' && (await calc(pg, 'mm0.t')) === '61,560' && (await calc(pg, 'mq0.t')) === '4,560');
  // Activity 15
  for (let j = 0; j < 12; j++) await setv(pg, 'plans.productionCost.lab.m' + j, 1320); await pg.waitForTimeout(300);
  rec('Activity 15', 'Labour total 15,840', (await calc(pg, 'lab.t')) === '15,840');
  // Activity 16 forecast of costs
  rec('Activity 16', 'Forecast of costs is linked: 61,560 / 15,840 / 30,880 (no re-entry)', (await calc(pg, 'cM.t')) === '61,560' && (await calc(pg, 'cL.t')) === '15,840' && (await calc(pg, 'cO.t')) === '30,880' && !(await pg.$('#pypCostsWs input:not([readonly])')));
  // Activity 17 profit
  const gp = await row(pg, 'pG'), np = await row(pg, 'pN');
  rec('Activity 17', 'Gross Profit (1,200) 650 … 6,425; total 35,925', gp[0] === '(1,200)' && gp[1] === '650' && gp[11] === '6,425' && (await calc(pg, 'pG.t')) === '35,925', gp.join('|'));
  rec('Activity 17', 'Net Profit (3,560) (1,710) (393) 107 … 2,717; total 5,045', np[0] === '(3,560)' && np[1] === '(1,710)' && np[2] === '(393)' && np[3] === '107' && np[11] === '2,717' && (await calc(pg, 'pN.t')) === '5,045', np.join('|'));
    rec('Activity 17', 'Sentence says forecast, not actual; objective is shown for comparison', /5,045/.test(ad(await pg.evaluate(() => document.querySelector('#pypProfitWs [data-calc="pSentence"]').textContent))) && /Zorbex goal 5000/.test(ad(await pg.evaluate(() => document.querySelector('#pypProfitWs [data-calc-html="objs"] input').value))));
  // Activity 18 cash flow – copy then Juma's lines
  await pg.evaluate(() => document.querySelector('[data-act="cf-copy"]').click()); await pg.waitForTimeout(400);
  rec('Activity 18', '“Copy from my forecasts” fills lines 2, 6, 7, 8 (Jan sales 5,250)', await pg.evaluate(() => SIYBPlanningStore.get('plans.cashFlow.sales.m0') === '5250' && SIYBPlanningStore.get('plans.cashFlow.mat.m0') === '5130'));
  const L = { sales: [4200, 5680, 6720], credit: ['', 1050, 1420], otherIn: [420, 568, 672], mat: [1786, 5130, 5130], lab: [1320, 1320, 1320], oh: [2710, 2110, 2093], equip: [0, 0, 10000], otherOut: [920, 420, 568] };
  await setv(pg, 'plans.cashFlow.open', 10000);
  for (const k of Object.keys(L)) for (let j = 0; j < 12; j++) await setv(pg, 'plans.cashFlow.' + k + '.m' + j, j < 3 ? L[k][j] : '');
  await pg.waitForTimeout(500);
  const cl = [await calc(pg, 'cf.close.m0'), await calc(pg, 'cf.close.m1'), await calc(pg, 'cf.close.m2')];
  rec('Activity 18', 'Closing cash 7,884 / 6,202 / (4,097) as in the manual', cl.join('|') === '7,884|6,202|(4,097)', cl.join('|'));
  rec('Activity 18', 'Totals: cash in 4,620 / 7,298 / 8,812; cash out 6,736 / 8,980 / 19,111', (await calc(pg, 'cf.tin.m0')) === '4,620' && (await calc(pg, 'cf.tin.m1')) === '7,298' && (await calc(pg, 'cf.tin.m2')) === '8,812' && (await calc(pg, 'cf.tout.m0')) === '6,736' && (await calc(pg, 'cf.tout.m1')) === '8,980' && (await calc(pg, 'cf.tout.m2')) === '19,111');
  rec('Activity 18', 'Next month’s opening = previous closing (7,884; 6,202)', (await calc(pg, 'cf.open.m1')) === '7,884' && (await calc(pg, 'cf.open.m2')) === '6,202');
  rec('Activity 18', 'Shortage is flagged in words (not only by colour) and months after the last entry stay blank', /⚠/.test(await pg.evaluate(() => document.querySelector('[data-calc="cf.alert.m2"]').textContent)) && (await calc(pg, 'cf.close.m3')) === '' && /\(4,097\)/.test(await calc(pg, 'cf.sentence')));
  rec('Activity 18', 'Cash flow differs from profit: March profit is positive while cash is negative', np[2] === '(393)' && cl[2] === '(4,097)');
  // loan helper
  rec('Loan', 'Largest shortage from the Cash Flow Plan is shown without recommending a loan', /4,097/.test(await calc(pg, 'loan.short')) && !/should borrow|يجب أن تقترض/.test(await calc(pg, 'loan.short')));
  await setv(pg, 'plans.loanAccess.amount', 4000); await setv(pg, 'plans.loanAccess.rate', 12); await setv(pg, 'plans.loanAccess.months', 8); await pg.waitForTimeout(300);
  rec('Loan', 'Flat 320 / 4,320 and reduced balance 180 / 4,180 (manual pp. 79–80)', (await calc(pg, 'loan.flat.i')) === '320' && (await calc(pg, 'loan.flat.t')) === '4,320' && (await calc(pg, 'loan.red.i')) === '180' && (await calc(pg, 'loan.red.t')) === '4,180');
  const sched = ad(await pg.evaluate(() => [...document.querySelectorAll('[data-calc-html="loan.rows"] tr')].map((t) => t.innerText.replace(/\s+/g, ' ')).join('|')));
  rec('Loan', 'Reduced-balance schedule: interest 40,35,…,5 and instalments 540 … 505', /1 40 500 540 3,500/.test(sched) && /8 5 500 505 0/.test(sched), sched.slice(0, 120));
  await pg.selectOption('[data-key="plans.loanAccess.method"]', 'flat'); await pg.waitForTimeout(250);
  rec('Loan', 'Switching to flat rate: every instalment 540', /8 40 500 540 0/.test(ad(await pg.evaluate(() => document.querySelector('[data-calc-html="loan.rows"]').innerText.replace(/\s+/g, ' ')))));
  await pg.selectOption('[data-key="plans.loanAccess.method"]', 'reduced'); await pg.selectOption('[data-key="plans.loanAccess.start"]', '4'); await pg.waitForTimeout(250);
  const before4 = await calc(pg, 'cf.close.m3');
  await pg.evaluate(() => { const c = document.querySelector('[data-kind="cfloan"]'); c.click(); }); await pg.waitForTimeout(400);
  if (0) console.log('DBG', before4, await calc(pg, 'cf.loan.m3'), await calc(pg, 'cf.loan.m10'), await calc(pg, 'cf.loan.m11'), await calc(pg, 'cf.close.m3'));
  rec('Loan', 'Instalments (540 from April) are added to line 10 only when the box is ticked', before4 === '' && (await calc(pg, 'cf.loan.m3')) === '540' && (await calc(pg, 'cf.loan.m10')) === '505' && (await calc(pg, 'cf.loan.m11')) === '' && (await calc(pg, 'cf.close.m3')) !== '');
  await pg.evaluate(() => document.querySelector('[data-kind="cfloan"]').click()); await pg.waitForTimeout(300);
  rec('Loan', 'Un-ticking removes them again', (await calc(pg, 'cf.loan.m3')) === '');
  await setv(pg, 'plans.loanAccess.q.needed', 'To buy equipment'); await pg.waitForTimeout(350);
  // Activity 19 / 20 answers hidden until requested
  const hid = await pg.evaluate(() => !document.querySelector('#pypEx-a19 .pyp-answer') && !document.querySelector('#pypEx-a20 .pyp-answer'));
  await pg.evaluate(() => document.querySelector('#pypEx-a19 [data-act="reveal"]').click()); await pg.evaluate(() => document.querySelector('#pypEx-a20 [data-act="reveal"]').click()); await pg.waitForTimeout(300);
  rec('Activities 19–20', 'Manual answers hidden until requested; then 3 and 5 numbered answers', hid && await pg.evaluate(() => document.querySelectorAll('#pypEx-a19 .pyp-answer li').length === 3 && document.querySelectorAll('#pypEx-a20 .pyp-answer li').length === 5));
  await setv(pg, 'activities.a19.q0', 'Equipment'); await setv(pg, 'activities.a20.q0', 'When cash runs out'); await pg.waitForTimeout(450);
  // Assessment 5
  const key = { m1: 'b', m2: 'c', m3: 'a', m4: 'c', m5: 'a', m6: 'a', m7: 'b', m8: 'c' };
  const a5n = await pg.evaluate(() => document.querySelectorAll('#pypAs-a5 fieldset').length);
  rec('Assessment 5', 'Eight multiple-choice questions, no answers shown before checking', a5n === 8 && await pg.evaluate(() => !document.querySelector('#pypAs-a5 .pyp-fb')));
  for (const [k, v] of Object.entries(key)) await pg.evaluate(([q, x]) => document.querySelector(`#pypAs-a5 [data-item="${q}"][value="${x}"]`).click(), [k, v]);
  await pg.evaluate(() => document.querySelector('#pypAs-a5 [data-act="check"]').click()); await pg.waitForTimeout(300);
  const a5 = await pg.evaluate(() => SIYBPlanningStore.get('assessments.a5'));
  rec('Assessment 5', 'Key 1b 2c 3a 4c 5a 6a 7b 8c scores 8/8 and completes', a5.correct === 8 && a5.total === 8 && a5.complete === true, JSON.stringify(a5));
  await pg.evaluate(() => document.querySelector('[data-act="review"][data-part="p5"]').click()); await pg.waitForTimeout(350);
  const pr = await prog(pg); rec('Progress', 'All 16 items complete after work, assessment and summary review', /16\/16/.test(pr), pr);
  // language switch keeps data; English has no Arabic outside entries
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(600);
  const en = await pg.evaluate(() => { const c = document.querySelector('#pypRoot').cloneNode(true); c.querySelectorAll('textarea,input,select,option,[data-key]').forEach((x) => x.remove()); return { t: c.innerText, dir: document.documentElement.dir, v: SIYBPlanningStore.get('plans.salesMarketing.fc.0.qty.m11'), cl: (document.querySelector('[data-calc="cf.close.m2"]') || {}).textContent }; });
  rec('Language', 'English Part V: LTR, no Arabic letters outside typed entries, data and calculations kept', en.dir === 'ltr' && !AR.test(en.t) && en.v === '515' && en.cl === '(4,097)', (en.t.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(500);
  // persistence
  await pg.waitForTimeout(500); await pg.reload(); await pg.waitForTimeout(900); await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(800); await open(pg, 'p5');
  rec('Persistence', 'After reload: forecasts, profit, cash flow, loan, assessment and progress restored', (await calc(pg, 'ss0.t')) === '113,325' && (await calc(pg, 'pN.t')) === '5,045' && (await calc(pg, 'cf.close.m2')) === '(4,097)' && (await calc(pg, 'loan.red.i')) === '180' && /16\/16/.test(await prog(pg)));
  // Part IV unchanged, scope, storage, responsive, regression
  rec('Part IV', 'Risk register is unchanged by Part V work', await pg.evaluate(() => { const r = SIYBPlanningStore.get('risks'); return r.length === 1 && r[0].risk === 'Fire in the workshop'; }));
  await open(pg, 'end'); rec('Scope', 'Only the end of the manual remains a placeholder (no inputs)', (await pg.$$('#pypRoot input,#pypRoot textarea,#pypRoot select')).length === 0);
  const keys = await pg.evaluate(() => Object.keys(localStorage).sort().join()); rec('Storage', 'Only siyb.iyb.planning.v1 added to localStorage', keys.split(',').filter((k) => !before.split(',').includes(k) && k !== 'siyb-language').join() === 'siyb.iyb.planning.v1', keys);
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); await open(pg, 'p5'); rec('Responsive', `No page-level horizontal overflow, Part V at ${w}`, await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1)); }
  await pg.setViewportSize({ width: 1280, height: 800 });
  for (const t of ['marketing', 'stock', 'costing']) { const o = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!o) await pg.click('.sidebar-group-head'); await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(700); rec('Regression', t + ' still opens', await pg.evaluate((x) => (x === 'costing' ? (!document.body.classList.contains('mode-training') && document.querySelector('#costingModuleRoot').innerText.length > 100) : document.body.classList.contains('mode-' + x)) && !document.body.classList.contains('mode-planning'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
