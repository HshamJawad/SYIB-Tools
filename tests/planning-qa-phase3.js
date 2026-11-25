/* IYB Planning QA – Phase 3 (Part III: content, Activities 4–5, Assessment 3, external-change forecasts register, progress).
 * Run: node tests/planning-qa-phase3.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬]/g, ',').replace(/٫/g, '.');
const AR = /[؀-ۿ]/;
async function open(pg, sec) { await pg.evaluate((s) => SIYBPlanning.open(s), sec); await pg.waitForTimeout(250); }
const stripInputs = (sel) => `(() => { const c = document.querySelector('${sel}').cloneNode(true); c.querySelectorAll('textarea,input').forEach((x) => x.remove()); return c.innerText; })()`;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(URL_); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  // ---- structure and fidelity (original PDF, printed pp. 29–36)
  await open(pg, 'p3');
  const s = await pg.evaluate(() => ({ ids: [...document.querySelectorAll('#pypRoot [id^="pypSec-p3-"],#pypRoot [id^="pypEx-"],#pypRoot [id^="pypAs-"],#pypRoot #pypFcWs')].map((e) => e.id).join(), txt: document.querySelector('#pypRoot').innerText, tags: [...document.querySelectorAll('#pypRoot .pyp-srcpg')].map((e) => e.innerText).join('|') }));
  s.tags = ad(s.tags);
  rec('Part III', 'Sections in manual order (what is a forecast, 2, Activity 4, 3, Activity 5, bridge, workspace, summary, Assessment 3)', s.ids === 'pypSec-p3-intro,pypSec-p3-s2,pypEx-fc1,pypEx-a4,pypSec-p3-s3,pypEx-fc2,pypEx-a5,pypSec-p3-bridge,pypSec-p3-fcws,pypFcWs,pypSec-p3-sum,pypAs-a3'.replace('pypSec-p3-s2,pypEx-fc1,pypEx-a4','pypSec-p3-s2,pypEx-fc1,pypEx-a4') || s.ids === 'pypSec-p3-intro,pypSec-p3-s2,pypEx-fc1,pypEx-a4,pypSec-p3-s3,pypEx-fc2,pypEx-a5,pypSec-p3-bridge,pypSec-p3-fcws,pypFcWs,pypSec-p3-sum,pypAs-a3', s.ids);
  rec('Part III', 'Only Activities 4 and 5 in Part III', (s.txt.match(/نشاط\s*[0-9٠-٩]+/g) || []).map(ad).every((x) => /[45]/.test(x)) && /4/.test(ad(s.txt)) && /5/.test(ad(s.txt)));
  rec('Part III', 'Source page tags present (29–30, 31–32, 32, 32–34, 34, 35, 36)', /29/.test(s.tags) && /31/.test(s.tags) && /32/.test(s.tags) && /34/.test(s.tags) && /35/.test(s.tags) && /36/.test(s.tags), s.tags);
  rec('Part III', 'Realism note: base answers on facts, not wishes', /الحقائق، لا على الأمنيات/.test(s.txt));
  rec('Part III', 'Manual examples: customers, competitors, alternative products, economy, regulations; raw materials, technologies, skills', ['الزبائن', 'المنافسون', 'المنتجات البديلة', 'الاقتصاد', 'اللوائح والسياسات', 'توريد المواد الخام', 'التقنيات الجديدة', 'مشكلات توفر المهارات'].every((w) => s.txt.includes(w)));
  rec('Part III', 'Juma forecasts (environment concern, stable economy, incentives scheme) present', /مستقرة|جيد ومستقر/.test(s.txt) && /صديقة للبيئة/.test(s.txt) && /حوافز/.test(s.txt));
  rec('Part III', 'Application-guidance label on the forecasts workspace', await pg.evaluate(() => !!document.querySelector('#pypSec-p3-fcws .pyp-apptag')));
  rec('Part III', 'Application guidance does not claim live data or AI', !/ذكاء|AI/.test(s.txt));
  // ---- activities 4 and 5
  rec('Activity 4/5', 'Two separate text fields, exact prompts', (await pg.$$('[data-key="activities.a4.q0"]')).length === 1 && (await pg.$$('[data-key="activities.a5.q0"]')).length === 1);
  await pg.fill('[data-key="activities.a4.q0"]', 'منافس جديد في الحي'); await pg.fill('[data-key="activities.a5.q0"]', 'Material prices may rise'); await pg.waitForTimeout(500);
  rec('Activity 4/5', 'Saved independently under activities.a4 and a5', await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')); return d.activities.a4.q0 === 'منافس جديد في الحي' && d.activities.a5.q0 === 'Material prices may rise'; }));
  rec('Progress', 'Part III progress is 2/4 after both activities', /2\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  // ---- Assessment 3
  rec('Assessment 3', '3 multiple-choice questions, 9 options, no answers before checking', (await pg.$$('#pypAs-a3 input[type=radio]')).length === 9 && (await pg.$$('#pypAs-a3 .pyp-fb')).length === 0);
  const pick = async (m) => { for (const [it, v] of Object.entries(m)) await pg.evaluate(([i, x]) => document.querySelector(`#pypAs-a3 [data-item="${i}"][value="${x}"]`).click(), [it, v]); };
  await pick({ m1: 'b', m2: 'a' }); await pg.evaluate(() => document.querySelector('#pypAs-a3 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const part = await pg.evaluate(() => ({ t: document.querySelector('#pypAs-a3').innerText, bad: document.querySelectorAll('#pypAs-a3 .pyp-fb.bad').length }));
  rec('Assessment 3', 'Partial answers: incomplete, wrong ones corrected with key, unanswered flagged', /1\/3|١\/٣/.test(part.t) === false && part.bad === 3 && /لم تُجب/.test(part.t), part.t.slice(0, 120));
  rec('Progress', 'Incomplete assessment gives no credit (still 2/4)', /2\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  await pick({ m1: 'a', m2: 'b', m3: 'c' }); await pg.evaluate(() => document.querySelector('#pypAs-a3 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const a3 = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a3);
  rec('Assessment 3', 'Key (1a 2b 3c) scores 3/3 and completes', a3.correct === 3 && a3.total === 3 && a3.complete === true, JSON.stringify(a3));
  rec('Progress', 'Part III 3/4 before summary review', /3\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  await pg.evaluate(() => document.querySelector('[data-act="review"][data-part="p3"]').click()); await pg.waitForTimeout(300);
  rec('Progress', 'Part III 4/4 after summary review; dashboard bar 100%', /4\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  // ---- forecasts register
  rec('Forecasts', 'Empty state with add button', (await pg.$$('#pypFcWs .pyp-fc')).length === 0 && !!(await pg.$('#pypFcWs [data-act="fc-add"]')));
  await pg.evaluate(() => document.querySelector('[data-act="fc-add"]').click()); await pg.waitForTimeout(300);
  rec('Forecasts', 'Add creates a card labelled as an estimate, not a fact; focus moves to it', await pg.evaluate(() => document.querySelectorAll('#pypFcWs .pyp-fc').length === 1 && /ليس حقيقة/.test(document.querySelector('.pyp-forecast-tag').textContent) && document.activeElement && document.activeElement.closest('.pyp-fc') !== null));
  const cats0 = await pg.evaluate(() => document.querySelector('[data-key="externalForecasts.0.cat"]').disabled);
  rec('Forecasts', 'Type of change is disabled until a business area is chosen', cats0 === true);
  await pg.selectOption('[data-key="externalForecasts.0.area"]', 'sales'); await pg.waitForTimeout(300);
  const salesCats = await pg.evaluate(() => [...document.querySelectorAll('[data-key="externalForecasts.0.cat"] option')].map((o) => o.value).filter(Boolean).join());
  rec('Forecasts', 'Sales categories = customers, competitors, alternatives, economy, regulations, other', salesCats === 'customers,competitors,alternatives,economy,regulations,other', salesCats);
  await pg.selectOption('[data-key="externalForecasts.0.cat"]', 'competitors');
  await pg.fill('[data-key="externalForecasts.0.change"]', 'سوبرماركت جديد سيفتتح'); await pg.fill('[data-key="externalForecasts.0.evidence"]', 'Saw the building permit'); await pg.fill('[data-key="externalForecasts.0.effect"]', 'Fewer walk-in customers'); await pg.fill('[data-key="externalForecasts.0.response"]', 'Offer delivery');
  await pg.selectOption('[data-key="externalForecasts.0.area"]', 'costs'); await pg.waitForTimeout(300);
  const reset = await pg.evaluate(() => ({ cat: document.querySelector('[data-key="externalForecasts.0.cat"]').value, opts: [...document.querySelectorAll('[data-key="externalForecasts.0.cat"] option')].map((o) => o.value).filter(Boolean).join(), ch: document.querySelector('[data-key="externalForecasts.0.change"]').value }));
  rec('Forecasts', 'Changing the area resets only the category and keeps the written text; cost categories apply', reset.cat === '' && reset.opts === 'supply,technology,economy,regulations,other' && reset.ch === 'سوبرماركت جديد سيفتتح', JSON.stringify(reset));
  await pg.selectOption('[data-key="externalForecasts.0.cat"]', 'supply');
  await pg.evaluate(() => document.querySelector('[data-act="fc-add"]').click()); await pg.waitForTimeout(300);
  await pg.fill('[data-key="externalForecasts.1.change"]', 'Second forecast'); await pg.waitForTimeout(500);
  const st = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).externalForecasts);
  rec('Forecasts', 'Two records saved in externalForecasts with all fields and unique ids', st.length === 2 && st[0].area === 'costs' && st[0].cat === 'supply' && st[0].evidence === 'Saw the building permit' && st[0].effect === 'Fewer walk-in customers' && st[0].response === 'Offer delivery' && st[1].change === 'Second forecast' && st[0].id !== st[1].id, JSON.stringify(st).slice(0, 200));
  rec('Forecasts', 'Forecast edits do not change progress (still 4/4)', /4\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  // language switch keeps data + focus
  await pg.focus('[data-key="externalForecasts.0.change"]'); await pg.keyboard.press('Control+End'); await pg.keyboard.type(' +x');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(500);
  const en = await pg.evaluate(() => ({ v: document.querySelector('[data-key="externalForecasts.0.change"]').value, foc: document.activeElement && document.activeElement.dataset.key, n: document.querySelectorAll('#pypFcWs .pyp-fc').length, dir: document.documentElement.dir, tag: document.querySelector('.pyp-forecast-tag').textContent, cat: document.querySelector('[data-key="externalForecasts.0.cat"]').value }));
  rec('Language', 'English: both forecasts kept, text kept, focus kept, LTR, selection kept', en.v === 'سوبرماركت جديد سيفتتح +x' && en.foc === 'externalForecasts.0.change' && en.n === 2 && en.dir === 'ltr' && en.cat === 'supply' && /not a fact/.test(en.tag), JSON.stringify(en));
  const enTxt = await pg.evaluate(stripInputs('#pypRoot'));
  rec('Language', 'English Part III shows no Arabic letters (outside typed entries and options)', !AR.test(enTxt.replace(/[؀-ۿ]+ \+x/g, '')), (enTxt.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  rec('Language', 'English Assessment 3 answers kept after switch (3/3)', /3\/3/.test(await pg.evaluate(() => document.querySelector('#pypAs-a3').innerText)));
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(400);
  // reload persistence
  await pg.waitForTimeout(500); await pg.reload(); await pg.waitForTimeout(900); await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(800); await open(pg, 'p3');
  const rl = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypFcWs .pyp-fc').length, v: document.querySelector('[data-key="externalForecasts.1.change"]').value, a4: document.querySelector('[data-key="activities.a4.q0"]').value, prog: document.querySelector('[data-pyp-prog="p3"]').innerText, chk: !!document.querySelector('#pypAs-a3 .pyp-result') }));
  rec('Persistence', 'After reload: forecasts, activities, assessment result and progress restored', rl.n === 2 && rl.v === 'Second forecast' && /منافس/.test(rl.a4) && /4\/4/.test(ad(rl.prog)) && rl.chk, JSON.stringify(rl).slice(0, 160));
  // remove
  await pg.evaluate(() => document.querySelector('[data-act="fc-del"][data-idx="0"]').click()); await pg.waitForTimeout(400);
  const del = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypFcWs .pyp-fc').length, v: document.querySelector('[data-key="externalForecasts.0.change"]').value, st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).externalForecasts.length }));
  rec('Forecasts', 'Remove (with confirmation) deletes the right record and persists', del.n === 1 && del.v === 'Second forecast' && del.st === 1, JSON.stringify(del));
  await pg.evaluate(() => document.querySelector('[data-act="fc-del"][data-idx="0"]').click()); await pg.waitForTimeout(300);
  rec('Forecasts', 'Removing the last record returns to the empty state', await pg.evaluate(() => document.querySelectorAll('#pypFcWs .pyp-fc').length === 0 && /لا توجد توقعات/.test(document.querySelector('#pypFcList').innerText)));
  // retry assessment removes credit
  await pg.evaluate(() => document.querySelector('#pypAs-a3 [data-act="retry"]').click()); await pg.waitForTimeout(250);
  rec('Assessment 3', 'Try again clears answers and removes progress credit', (await pg.$$('#pypAs-a3 input:checked')).length === 0 && /3\/4/.test(ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p3"]').innerText))));
  // responsive
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); await open(pg, 'p3'); rec('Responsive', `No page-level horizontal overflow, p3 at ${w}`, await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1)); }
  await pg.setViewportSize({ width: 1280, height: 800 });
  // scope, isolation, regression
  rec('Scope', 'The end of the manual remains a placeholder (no inputs)', await (async () => { for (const x of ['end']) { await open(pg, x); if ((await pg.$$('#pypRoot input,#pypRoot textarea,#pypRoot select')).length) return false; } return true; })());
  const keys = await pg.evaluate(() => Object.keys(localStorage).sort().join()); rec('Storage', 'Only siyb.iyb.planning.v1 added to localStorage', keys.split(',').filter((k) => !before.split(',').includes(k) && k !== 'siyb-language').join() === 'siyb.iyb.planning.v1', keys);
  const sc = await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')); return { m: d.moduleId, v: d.schemaVersion, keys: ['businessAnalysis', 'risks', 'plans', 'actionPlan', 'objectives'].every((k) => k in d) }; });
  rec('Storage', 'moduleId iyb-planning, schema 1, other model keys intact', sc.m === 'iyb-planning' && sc.v === 1 && sc.keys);
  for (const t of ['marketing', 'stock', 'costing']) { const o = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!o) await pg.click('.sidebar-group-head'); await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(700); rec('Regression', t + ' still opens', await pg.evaluate((x) => (x === 'costing' ? (!document.body.classList.contains('mode-training') && document.querySelector('#costingModuleRoot').innerText.length > 100) : document.body.classList.contains('mode-' + x)) && !document.body.classList.contains('mode-planning'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
