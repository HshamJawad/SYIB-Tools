/* IYB Planning QA – Phase 2 (Parts I & II: content, Activities 1–3, Assessments 1–2, analysis workspaces, progress).
 * Run: node tests/planning-qa-phase2.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬]/g, ',').replace(/٫/g, '.');
const KEY = { a1: { w1: 'A', w2: 'F', w3: 'C', w4: 'E', w5: 'D', w6: 'B', m1: 'b', m2: 'a', m3: 'c', m4: 'a', m5: 'c' }, a2: { m1: 'c', m2: 'b', m3: 'a', m4: 'c', m5: 'c' } };
async function open(pg, sec) { await pg.evaluate((s) => SIYBPlanning.open(s), sec); await pg.waitForTimeout(250); }
async function answer(pg, aid, map) { for (const [it, v] of Object.entries(map)) { await pg.evaluate(([a, i, x]) => { const el = document.querySelector(`#pypAs-${a} [data-item="${i}"]` + (i[0] === 'm' ? `[value="${x}"]` : '')); if (el.tagName === 'SELECT') { el.value = x; el.dispatchEvent(new Event('change', { bubbles: true })); } else { el.click(); } }, [aid, it, v]); } }
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  // ---- structure / fidelity
  const home = await pg.evaluate(() => document.querySelector('#pypRoot').innerText);
  rec('Dashboard', 'Parts I and II show progress; Parts III–V show later-phase status', (await pg.$$('#pypRoot .pyp-card [data-pyp-prog]')).length === 2 && /المرحلة 3/.test(ad(home)) && /المرحلة 5/.test(ad(home)));
  await open(pg, 'p1');
  const p1 = await pg.evaluate(() => ({ ids: [...document.querySelectorAll('#pypRoot [id^="pypSec-p1-"],#pypRoot [id^="pypEx-"],#pypRoot [id^="pypAs-"]')].map((e) => e.id).join(), txt: document.querySelector('#pypRoot').innerText, tags: document.querySelectorAll('#pypRoot .pyp-srcpg').length }));
  rec('Part I', 'All Part I sections present in manual order (intro, 1–3, Activity 1, 4, 5, summary, Assessment 1)', p1.ids === 'pypSec-p1-intro,pypSec-p1-t1,pypSec-p1-t2,pypEx-st1,pypEx-st2,pypSec-p1-t3,pypEx-a1,pypSec-p1-t4,pypSec-p1-t5,pypSec-p1-sum,pypAs-a1', p1.ids);
  rec('Part I', 'Source page tags shown; five plans 4.1–4.5 present', p1.tags >= 8 && (await pg.$$('#pypRoot .pyp-plancard')).length === 5, String(p1.tags));
  rec('Part I', 'Only Activity 1 in Part I', (p1.txt.match(/نشاط\s*[0-9٠-٩]+/g) || []).map(ad).every((x) => /1/.test(x)));
  rec('Part I', 'Story figures preserved ($5,000 / $4,000, 10%)', /5,000/.test(ad(p1.txt)) && /4,000/.test(ad(p1.txt)) && /10%/.test(ad(p1.txt)));
  // exercise answers concealed until requested
  rec('Exercise', 'Manual answer is concealed before the learner asks', !/قد تشبه إجاباتك/.test(p1.txt));
  await pg.evaluate(() => document.querySelector('#pypEx-st1 [data-act="reveal"]').click()); await pg.waitForTimeout(200);
  rec('Exercise', 'Manual answer appears after the request', /قد تشبه إجاباتك/.test(await pg.evaluate(() => document.querySelector('#pypEx-st1').innerText)));
  // activity persistence
  await pg.fill('[data-key="activities.a1.q0"]', 'مخبز صغير'); await pg.fill('[data-key="activities.a1.q1"]', 'Cash is short');
  await pg.waitForTimeout(500);
  rec('Activity 1', 'Saved under activities.a1 in the isolated key', await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')); return d.activities.a1.q0 === 'مخبز صغير' && d.activities.a1.q1 === 'Cash is short'; }));
  rec('Progress', 'Part I progress is 1/3 after Activity 1', /1\/3/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p1"]').innerText))));
  // ---- Assessment 1
  const a1txt = await pg.evaluate(() => document.querySelector('#pypAs-a1').innerText);
  rec('Assessment 1', '6 word items + 5 multiple-choice, word bank of six', (await pg.$$('#pypAs-a1 select')).length === 6 && (await pg.$$('#pypAs-a1 input[type=radio]')).length === 15 && (await pg.$$('#pypAs-a1 .pyp-bank li')).length === 6);
  rec('Assessment 1', 'Answers concealed before checking', !/الإجابة الصحيحة:/.test(a1txt) && (await pg.$$('#pypAs-a1 .pyp-fb')).length === 0);
  await answer(pg, 'a1', { w1: 'B', m1: 'a' }); await pg.evaluate(() => document.querySelector('#pypAs-a1 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const wrong = await pg.evaluate(() => ({ t: document.querySelector('#pypAs-a1').innerText, bad: document.querySelectorAll('#pypAs-a1 .pyp-fb.bad').length, ok: document.querySelectorAll('#pypAs-a1 .pyp-fb.ok').length }));
  rec('Assessment 1', 'Wrong and blank answers show the correct answer after checking; score 0/11', wrong.bad === 11 && /0\/11/.test(ad(wrong.t)) && /التخطيط/.test(wrong.t), JSON.stringify({ bad: wrong.bad }));
  rec('Assessment 1', 'Incomplete assessment is not counted as complete', /1\/3/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p1"]').innerText))));
  await answer(pg, 'a1', KEY.a1); await pg.evaluate(() => document.querySelector('#pypAs-a1 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const right = await pg.evaluate(() => ({ t: document.querySelector('#pypAs-a1').innerText, ok: document.querySelectorAll('#pypAs-a1 .pyp-fb.ok').length, st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a1 }));
  rec('Assessment 1', 'Source answer key gives 11/11 (Planning, Loan Access, Production and Cost, Profit, Cash Flow, Sales and Marketing; 1b 2a 3c 4a 5c)', right.ok === 11 && /11\/11/.test(ad(right.t)) && right.st.complete === true && right.st.correct === 11, JSON.stringify(right.st));
  rec('Assessment 1', 'Stored option values are letters, unaffected by Arabic digits', Object.values(right.st.answers).every((v) => /^[A-Fa-c]$/.test(v)));
  // summary review + progress
  await pg.evaluate(() => document.querySelector('[data-act="review"][data-part="p1"]').click()); await pg.waitForTimeout(300);
  rec('Progress', 'Part I reaches 3/3 only after activity + summary review + completed assessment', /3\/3/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p1"]').innerText))));
  // ---- Part II
  await open(pg, 'p2');
  const p2 = await pg.evaluate(() => ({ ids: [...document.querySelectorAll('#pypRoot [id^="pypSec-p2-"],#pypRoot [id^="pypEx-"],#pypRoot [id^="pypAs-"]')].map((e) => e.id).join(), txt: document.querySelector('#pypRoot').innerText }));
  p2.txt = ad(p2.txt);
  rec('Part II', 'Sections in order incl. Activity 2 (after 1.3) and Activity 3 (after 2.3), Assessment 2', p2.ids === 'pypSec-p2-intro,pypSec-p2-s1,pypEx-a2,pypSec-p2-s2,pypEx-a3,pypSec-p2-s3,pypEx-pr1,pypSec-p2-sum,pypAs-a2', p2.ids);
  rec('Part II', 'Manual example figures present (80,950; 66,815; (3,905); 15 and 11.6 per item)', ['80,950', '66,815', '(3,905)', '11.6', '57,500', '29,168', '21,535'].every((x) => p2.txt.includes(x)));
  rec('Part II', 'Seven Ps table has all seven elements', (await pg.$$('#pypRoot .pyp-7p tbody tr')).length === 7);
  // workspaces: sales
  const fill = async (k, v) => pg.fill(`[data-key="${k}"]`, v);
  await fill('businessAnalysis.salesMarketing.ty.m10', '8650'); await fill('businessAnalysis.salesMarketing.ty.m11', '٩٬٢٠٠'); await fill('businessAnalysis.salesMarketing.ly.m11', '10,971');
  const sales = await pg.evaluate(() => ({ d: document.querySelector('[data-calc="s.d.m11"]').textContent, p: document.querySelector('[data-calc="s.p.m11"]').textContent, tt: document.querySelector('[data-calc="s.t.ty"]').textContent, tl: document.querySelector('[data-calc="s.t.ly"]').textContent, s: document.querySelector('[data-calc="s.sentence"]').textContent, d10: document.querySelector('[data-calc="s.d.m10"]').textContent }));
  rec('Sales workspace', 'Month difference −1,771 (−16.14%) from Arabic-Indic input; totals 17,850 / 10,971', ad(sales.d) === '−1,771' && ad(sales.p) === '−16.14%' && ad(sales.tt) === '17,850' && ad(sales.tl) === '10,971', JSON.stringify(sales));
  rec('Sales workspace', 'No difference shown when only one year is entered', sales.d10 === '');
  rec('Sales workspace', 'Sentence is neutral (no good/bad wording)', sales.s.length > 5 && !/جيد|سيئ|ممتاز|good|bad|excellent/i.test(sales.s), sales.s);
  // costs
  const cb = 'businessAnalysis.productionCosts';
  await fill(cb + '.mat_ty.m0', '48615'); await fill(cb + '.mat_ly.m0', '33698'); await fill(cb + '.qty_ty.m0', '3240'); await fill(cb + '.qty_ly.m0', '2900'); await fill(cb + '.lab_ty.m0', '10800'); await fill(cb + '.lab_ly.m0', '10200'); await fill(cb + '.oh_ty.m0', '25440'); await fill(cb + '.oh_ly.m0', '17560');
  const cst = await pg.evaluate(() => { const g = (n) => document.querySelector(`[data-calc="${n}"]`).textContent; return { mt: g('c.s.mat.ty'), pm: g('c.s.mat.pi_ty'), pml: g('c.s.mat.pi_ly'), pl: g('c.s.lab.pi_ty'), pll: g('c.s.lab.pi_ly'), all: g('c.s.all.ty'), alll: g('c.s.all.ly') }; });
  const r1 = (x) => Math.round(parseFloat(ad(x).replace(/[()]/g, '')) * 10) / 10;
  rec('Cost workspace', "Material cost per item 15 / 11.6 and labour 3.3 / 3.5 match the manual's example", r1(cst.pm) === 15 && r1(cst.pml) === 11.6 && r1(cst.pl) === 3.3 && r1(cst.pll) === 3.5, JSON.stringify(cst));
  rec('Cost workspace', 'Total costs this year 84,855 / last year 61,458', ad(cst.all) === '84,855' && ad(cst.alll) === '61,458', JSON.stringify(cst));
  // profit
  const pb = 'businessAnalysis.profit';
  const yrs = [['y0', 57500, 29168, 9720, 16520], ['y1', 66815, 33698, 10200, 17560], ['y2', 80950, 48615, 10800, 25440]];
  for (const [y, s, m, l, o] of yrs) { await fill(pb + '.' + y + '.sales', String(s)); await fill(pb + '.' + y + '.mat', String(m)); await fill(pb + '.' + y + '.lab', String(l)); await fill(pb + '.' + y + '.oh', String(o)); }
  const prof = await pg.evaluate(() => [0, 1, 2].map((c) => [document.querySelector(`[data-calc="p.gp.${c}"]`).textContent, document.querySelector(`[data-calc="p.np.${c}"]`).textContent]).concat([document.querySelector('[data-calc="p.sentence"]').textContent]));
  rec('Profit workspace', "Gross/Net profit match the manual's three statements; loss shown in brackets", ad(prof[0].join('|')) === '18,612|2,092' && ad(prof[1].join('|')) === '22,917|5,357' && ad(prof[2].join('|')) === '21,535|(3,905)', JSON.stringify(prof.slice(0, 3)));
  rec('Profit workspace', 'Loss explanation sentence and neutral trend sentence shown', /خسارة/.test(prof[3]) && /ما الأسباب/.test(prof[3]));
  rec('Profit workspace', 'Formulas displayed', /إجمالي الربح = المبيعات − تكاليف المواد − تكاليف العمالة/.test(await pg.evaluate(() => document.querySelector('.pyp-ws .pyp-formula').innerText)));
  // Activity 2 / 3 + Assessment 2
  await pg.fill('[data-key="activities.a2.q0"]', 'Falling in December'); await pg.fill('[data-key="activities.a3.q0"]', 'Material costs rising');
  await answer(pg, 'a2', KEY.a2); await pg.evaluate(() => document.querySelector('#pypAs-a2 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const a2 = await pg.evaluate(() => ({ st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a2 }));
  rec('Assessment 2', 'Key (1c 2b 3a 4c 5c) scores 5/5 and completes', a2.st.correct === 5 && a2.st.complete === true && a2.st.total === 5, JSON.stringify(a2.st));
  rec('Progress', 'Part II 3/4 before summary review', /3\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p2"]').innerText))));
  await pg.evaluate(() => document.querySelector('[data-act="review"][data-part="p2"]').click()); await pg.waitForTimeout(300);
  rec('Progress', 'Part II 4/4 after summary review; dashboard shows both parts complete', /4\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p2"]').innerText))));
  await open(pg, 'home'); rec('Dashboard', 'Dashboard progress bars are 100%', await pg.evaluate(() => [...document.querySelectorAll('#pypRoot .pyp-card .pyp-prog-bar i')].every((i) => i.style.width === '100%')));
  // ---- language switch keeps data and focus; English has no Arabic UI text
  await open(pg, 'p2'); await pg.focus('[data-key="activities.a2.q0"]'); await pg.keyboard.press('Control+End'); await pg.keyboard.type(' +more');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); /* programmatic click keeps focus in the field, as a keyboard shortcut would */ await pg.waitForTimeout(500);
  const en = await pg.evaluate(() => ({ val: document.querySelector('[data-key="activities.a2.q0"]').value, foc: document.activeElement && document.activeElement.dataset.key, calc: document.querySelector('[data-calc="p.np.2"]').textContent, ui: [...document.querySelectorAll('#pypRoot')].map((r) => { const c = r.cloneNode(true); c.querySelectorAll('textarea,input').forEach((x) => x.remove()); return c.innerText; })[0], dir: document.documentElement.dir }));
  rec('Language', 'English: data kept, focus kept on the same field, LTR', en.val === 'Falling in December +more' && en.foc === 'activities.a2.q0' && en.dir === 'ltr', JSON.stringify({ v: en.val, f: en.foc }));
  rec('Language', 'English Part II shows no Arabic letters; loss figure still (3,905)', !/[؀-ۿ]/.test(en.ui) && /\(3,905\)/.test(en.calc), (en.ui.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  await open(pg, 'p1'); const en1 = await pg.evaluate(() => { const c = document.querySelector('#pypRoot').cloneNode(true); c.querySelectorAll('textarea,input').forEach((x) => x.remove()); return c.innerText; });
  rec('Language', 'English Part I shows no Arabic letters', !/[؀-ۿ]/.test(en1), (en1.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  rec('Language', 'Assessment answers kept after language switch (11/11 still shown)', /11\/11/.test(await pg.evaluate(() => document.querySelector('#pypAs-a1').innerText)));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  // ---- reload persistence
  await pg.waitForTimeout(500); await pg.reload(); await pg.waitForTimeout(900); await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(800); await open(pg, 'p2');
  const rl = await pg.evaluate(() => ({ a2: document.querySelector('[data-key="activities.a2.q0"]').value, np: document.querySelector('[data-calc="p.np.2"]').textContent, prog: document.querySelector('[data-pyp-prog="p2"]').innerText, chk: !!document.querySelector('#pypAs-a2 .pyp-result') }));
  rec('Persistence', 'After reload: activity text, calculations, assessment result and progress restored', /Falling in December/.test(rl.a2) && /3[,٬]905/.test(ad(rl.np)) && /4\/4/.test(ad(rl.prog)) && rl.chk, JSON.stringify(rl).slice(0, 160));
  // retry
  await pg.evaluate(() => document.querySelector('#pypAs-a2 [data-act="retry"]').click()); await pg.waitForTimeout(250);
  rec('Assessment 2', 'Try again clears answers and removes progress credit', (await pg.$$('#pypAs-a2 input:checked')).length === 0 && /3\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p2"]').innerText))));
  // ---- responsive
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); for (const s of ['p1', 'p2']) { await open(pg, s); rec('Responsive', `No page-level horizontal overflow, ${s} at ${w}`, await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1)); } }
  // ---- scope / isolation / regression
  await pg.setViewportSize({ width: 1280, height: 800 });
  rec('Scope', 'Parts III–V and end-of-manual remain placeholders (no inputs)', await (async () => { for (const s of ['p3', 'p4', 'p5', 'end']) { await open(pg, s); if ((await pg.$$('#pypRoot input,#pypRoot textarea,#pypRoot select')).length) return false; } return true; })());
  const keys = await pg.evaluate(() => Object.keys(localStorage).sort().join()); rec('Storage', 'Only siyb.iyb.planning.v1 added to localStorage', keys.split(',').filter((k) => !before.split(',').includes(k) && k !== 'siyb-language').join() === 'siyb.iyb.planning.v1', keys);
  for (const t of ['marketing', 'stock', 'costing']) { const o = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!o) await pg.click('.sidebar-group-head'); await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(700); rec('Regression', t + ' still opens', await pg.evaluate((x) => (x === 'costing' ? (!document.body.classList.contains('mode-training') && document.querySelector('#costingModuleRoot').innerText.length > 100) : document.body.classList.contains('mode-' + x)) && !document.body.classList.contains('mode-planning'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
