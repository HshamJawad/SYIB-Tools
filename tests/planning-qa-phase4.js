/* IYB Planning QA – Phase 4 (Part IV: content, Activity 6, Assessment 4, risk register, progress).
 * Run: node tests/planning-qa-phase4.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬]/g, ',').replace(/٫/g, '.');
const AR = /[؀-ۿ]/;
async function open(pg, sec) { await pg.evaluate((s) => SIYBPlanning.open(s), sec); await pg.waitForTimeout(250); }
const prog = async (pg) => ad(await pg.evaluate(() => document.querySelector('[data-pyp-prog="p4"]').innerText));
const stripInputs = `(() => { const c = document.querySelector('#pypRoot').cloneNode(true); c.querySelectorAll('textarea,input').forEach((x) => x.remove()); return c.innerText; })()`;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(URL_); await pg.waitForTimeout(900);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(900);
  // seed two Part III forecasts so the forecast → risk helper can be tested
  await open(pg, 'p3');
  for (const t of ['Competitor opens nearby', 'Raw material prices may rise']) { await pg.evaluate(() => document.querySelector('[data-act="fc-add"]').click()); await pg.waitForTimeout(150); }
  await pg.fill('[data-key="externalForecasts.0.change"]', 'Competitor opens nearby'); await pg.fill('[data-key="externalForecasts.1.change"]', 'Raw material prices may rise'); await pg.waitForTimeout(400);
  await open(pg, 'p4');
  const s = await pg.evaluate(() => ({ ids: [...document.querySelectorAll('#pypRoot [id^="pypSec-p4-"],#pypRoot [id^="pypEx-"],#pypRoot [id^="pypRiskWs"],#pypRoot [id^="pypAs-"]')].map((e) => e.id).join(), txt: document.querySelector('#pypRoot').innerText, tags: [...document.querySelectorAll('#pypRoot .pyp-srcpg')].map((e) => e.innerText).join('|') }));
  s.tags = ad(s.tags);
  rec('Part IV', 'Sections in manual order (what is risk, 3 stages, 4 strategies, Activity 6 + register, note, summary, Assessment 4)', s.ids === 'pypSec-p4-intro,pypSec-p4-s3,pypSec-p4-s4,pypEx-a6,pypRiskWs,pypSec-p4-note6,pypSec-p4-sum,pypAs-a4', s.ids);
  rec('Part IV', 'Only Activity 6 appears in Part IV', (s.txt.match(/نشاط\s*[0-9٠-٩]+/g) || []).map(ad).every((x) => /6/.test(x)) && /6/.test(ad(s.txt)));
  rec('Part IV', 'Source page tags (37–38, 39–40, 40–41, 41, 42)', ['37', '39', '40', '41', '42'].every((n) => s.tags.includes(n)), s.tags);
  rec('Part IV', 'Four steps, internal/external risks and the four ways to respond are present', ['الخطوة 1', 'الخطوة 4', 'مخاطر داخلية', 'مخاطر خارجية', 'قبول الخطر', 'نقل الخطر', 'تقليل احتمال الخطر أو أثره', 'تجنب الخطر'].every((w) => ad(s.txt).includes(w)));
  rec('Part IV', 'Manual examples: fire, strike, theft, market saturation, chemical poisoning; Likelihood and Impact defined', ['الحريق', 'الإضراب', 'السرقة', 'تشبّع السوق', 'التسمم الكيميائي'].every((w) => s.txt.includes(w)) && /Likelihood/.test(s.txt) && /Impact/.test(s.txt));
  rec('Part IV', 'No invented scoring, matrix or risk classification', !/مصفوفة|درجة الخطر|عالٍ|مرتفع جداً|متوسط|منخفض/.test(s.txt.replace(/احتمال الحريق مرتفع/g, '').replace(/الاحتمال المرتفع|الأثر الكبير والاحتمال المرتفع|الاحتمال الأعلى|مرتفع/g, '')) && (await pg.$$('#pypRiskWs select option')).length <= 2 * 7);
  // Activity 6
  rec('Activity 6', 'Three question fields with the manual wording', (await pg.$$('#pypEx-a6 textarea')).length === 3 && /List the risks|اذكر المخاطر/.test(await pg.evaluate(() => document.querySelector('#pypEx-a6').innerText)));
  rec('Progress', 'Starts at 0/3 (Activity 6, summary, Assessment 4)', /0\/3/.test(await prog(pg)));
  rec('Register', 'Empty state with add button; form columns follow the manual', !!(await pg.$('#pypRiskWs [data-act="risk-add"]')) && /الاحتمال، التكرار، الأثر، الأولوية، الإجراءات/.test(await pg.evaluate(() => document.querySelector('#pypRiskWs').innerText)));
  await pg.evaluate(() => document.querySelector('[data-act="risk-add"]').click()); await pg.waitForTimeout(300);
  const f1 = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypRiskWs .pyp-risk').length, foc: document.activeElement && document.activeElement.dataset.key, fields: [...document.querySelectorAll('#pypRisk-0 [data-key]')].map((e) => e.dataset.key.split('.').pop()).join() }));
  rec('Register', 'Add creates a risk card, focus on its first field, six manual fields in order plus 2 optional', f1.n === 1 && f1.foc === 'risks.0.risk' && f1.fields === 'risk,likelihood,frequency,impact,priority,actions,origin,strategy', JSON.stringify(f1));
  await pg.fill('[data-key="risks.0.risk"]', 'Fire in the workshop'); await pg.fill('[data-key="risks.0.likelihood"]', 'high'); await pg.fill('[data-key="risks.0.frequency"]', 'once in 5 years'); await pg.fill('[data-key="risks.0.impact"]', 'devastating'); await pg.fill('[data-key="risks.0.priority"]', '1'); await pg.fill('[data-key="risks.0.actions"]', 'Train staff; buy fire insurance');
  await pg.selectOption('[data-key="risks.0.origin"]', 'internal'); await pg.selectOption('[data-key="risks.0.strategy"]', 'transfer'); await pg.waitForTimeout(500);
  const r0 = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).risks[0]);
  rec('Register', 'All fields saved in risks[0] (free text; numbers like "1" kept as typed)', r0.risk === 'Fire in the workshop' && r0.likelihood === 'high' && r0.frequency === 'once in 5 years' && r0.impact === 'devastating' && r0.priority === '1' && r0.actions === 'Train staff; buy fire insurance' && r0.origin === 'internal' && r0.strategy === 'transfer', JSON.stringify(r0));
  rec('Progress', 'Activity 6 counts once a risk is recorded (1/3)', /1\/3/.test(await prog(pg)));
  // forecast → risk
  const fb = await pg.evaluate(() => [...document.querySelectorAll('#pypRiskWs .pyp-fclist li')].map((li) => li.innerText.replace(/\s+/g, ' ').trim()));
  rec('Forecast link', 'Part III forecasts are listed for conversion into risks', fb.length === 2 && /Competitor opens nearby/.test(fb[0]), fb.join(' | '));
  await pg.evaluate(() => document.querySelector('[data-act="risk-from-fc"]').click()); await pg.waitForTimeout(300);
  const lk = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypRiskWs .pyp-risk').length, v: document.querySelector('[data-key="risks.1.risk"]').value, o: document.querySelector('[data-key="risks.1.origin"]').value, tag: !!document.querySelector('#pypRisk-1 .pyp-forecast-tag'), dis: document.querySelector('[data-act="risk-from-fc"]').disabled, st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).risks[1].fromForecast }));
  rec('Forecast link', 'Converting copies the text once, marks it external, links by id, and disables a duplicate', lk.n === 2 && lk.v === 'Competitor opens nearby' && lk.o === 'external' && lk.tag && lk.dis && !!lk.st, JSON.stringify(lk));
  rec('Forecast link', 'The forecast in Part III is unchanged (no duplicate or move)', await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).externalForecasts.length === 2));
  // assessment 4
  const a4 = await pg.evaluate(() => ({ boxes: document.querySelectorAll('#pypAs-a4 input[type=checkbox]').length, fb: document.querySelectorAll('#pypAs-a4 .pyp-fb').length, t: document.querySelector('#pypAs-a4').innerText }));
  rec('Assessment 4', 'Five tick-boxes; no answers or explanations before checking', a4.boxes === 5 && a4.fb === 0 && !/الغرض من إدارة المخاطر ليس تجنب/.test(a4.t));
  await pg.evaluate(() => document.querySelector('#pypAs-a4 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const none = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a4);
  rec('Assessment 4', 'Checking with nothing ticked is not a completed attempt', none.complete === false, JSON.stringify(none));
  const tick = async (ids) => { for (const id of ids) await pg.evaluate((i) => document.querySelector(`#pypAs-a4 [data-item="${i}"]`).click(), id); };
  await tick(['t1', 't3']); await pg.evaluate(() => document.querySelector('#pypAs-a4 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const part = await pg.evaluate(() => ({ t: document.querySelector('#pypAs-a4').innerText, ok: document.querySelectorAll('#pypAs-a4 .pyp-fb.ok').length, bad: document.querySelectorAll('#pypAs-a4 .pyp-fb.bad').length, st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a4 }));
  rec('Assessment 4', 'Ticking 1 and 3: item 1 wrong (it is false), 3 right, 2 and 4 right (false), 5 wrong (true)', part.ok === 3 && part.bad === 2 && part.st.correct === 3 && part.st.total === 5 && part.st.complete === true, JSON.stringify(part.st));
  rec('Assessment 4', 'Manual explanations appear only after checking', /الغرض من إدارة المخاطر ليس تجنب/.test(part.t) && /صحيحة:/.test(part.t) && /خاطئة:/.test(part.t));
  await pg.evaluate(() => document.querySelector('#pypAs-a4 [data-item="t1"]').click()); await pg.waitForTimeout(250);
  rec('Assessment 4', 'Changing a tick after checking clears the checked state and the credit', await pg.evaluate(() => { const a = SIYBPlanningStore.get('assessments.a4'); return a.checked === false && a.complete === false && document.querySelectorAll('#pypAs-a4 .pyp-fb').length === 0; }));
  await pg.evaluate(() => { const b = document.querySelector('#pypAs-a4 [data-item="t1"]'); if (b.checked) b.click(); });
  await tick(['t5']); // t3 and t5 ticked = the key (3 and 5 are true)
  await pg.evaluate(() => document.querySelector('#pypAs-a4 [data-act="check"]').click()); await pg.waitForTimeout(250);
  const full = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).assessments.a4);
  rec('Assessment 4', 'Key (3 and 5 true; 1, 2, 4 false) scores 5/5 and completes', full.correct === 5 && full.total === 5 && full.complete === true, JSON.stringify(full));
  rec('Progress', 'Activity 6 + Assessment 4 = 2/3', /2\/3/.test(await prog(pg)));
  await pg.evaluate(() => document.querySelector('[data-act="review"][data-part="p4"]').click()); await pg.waitForTimeout(300);
  rec('Progress', 'Summary review completes Part IV (3/3, 100%)', /3\/3/.test(await prog(pg)));
  // language switch + persistence
  await pg.focus('[data-key="risks.0.actions"]'); await pg.keyboard.press('Control+End'); await pg.keyboard.type(' +x');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(500);
  const en = await pg.evaluate(() => ({ v: document.querySelector('[data-key="risks.0.actions"]').value, foc: document.activeElement && document.activeElement.dataset.key, n: document.querySelectorAll('#pypRiskWs .pyp-risk').length, dir: document.documentElement.dir, st: document.querySelector('[data-key="risks.0.strategy"]').value, chk: document.querySelectorAll('#pypAs-a4 input:checked').length }));
  rec('Language', 'English: risks, text, selections, ticks and focus kept; LTR', en.v === 'Train staff; buy fire insurance +x' && en.foc === 'risks.0.actions' && en.n === 2 && en.dir === 'ltr' && en.st === 'transfer' && en.chk === 2, JSON.stringify(en));
  const enTxt = await pg.evaluate(stripInputs);
  rec('Language', 'English Part IV has no Arabic letters outside typed entries', !AR.test(enTxt), (enTxt.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  const opts = await pg.evaluate(() => [...document.querySelectorAll('#pypRisk-0 select option')].map((o) => o.textContent).join('|'));
  rec('Language', 'English select options (Internal/External, Accept/Transfer/Reduce/Avoid)', /Internal\|External\|—\|Accept\|Transfer\|Reduce\|Avoid/.test(opts) || (/Internal/.test(opts) && /Avoid/.test(opts)), opts);
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForTimeout(400);
  await pg.waitForTimeout(500); await pg.reload(); await pg.waitForTimeout(900); await pg.click('.sidebar-group-head'); await pg.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await pg.waitForTimeout(800); await open(pg, 'p4');
  const rl = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypRiskWs .pyp-risk').length, v: document.querySelector('[data-key="risks.1.risk"]').value, chk: document.querySelectorAll('#pypAs-a4 input:checked').length, res: !!document.querySelector('#pypAs-a4 .pyp-result') }));
  rec('Persistence', 'After reload: risks, ticks, assessment result and progress restored', rl.n === 2 && rl.v === 'Competitor opens nearby' && rl.chk === 2 && rl.res && /3\/3/.test(await prog(pg)), JSON.stringify(rl));
  // remove
  await pg.evaluate(() => document.querySelector('[data-act="risk-del"][data-idx="0"]').click()); await pg.waitForTimeout(400);
  const del = await pg.evaluate(() => ({ n: document.querySelectorAll('#pypRiskWs .pyp-risk').length, v: document.querySelector('[data-key="risks.0.risk"]').value, st: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).risks.length, btn: document.querySelector('[data-act="risk-from-fc"]').disabled }));
  rec('Register', 'Remove (with confirmation) deletes the right risk; the linked forecast stays unavailable until its risk is gone', del.n === 1 && del.v === 'Competitor opens nearby' && del.st === 1 && del.btn === true, JSON.stringify(del));
  await pg.evaluate(() => document.querySelector('[data-act="risk-del"][data-idx="0"]').click()); await pg.waitForTimeout(400);
  rec('Register', 'Deleting the linked risk re-enables its forecast; empty state returns', await pg.evaluate(() => !document.querySelector('[data-act="risk-from-fc"]').disabled && /لا توجد مخاطر/.test(document.querySelector('#pypRiskList').innerText)));
  rec('Progress', 'Without a risk and Activity 6 text, Part IV drops to 2/3', /2\/3/.test(await prog(pg)));
  // Part III intact and keys isolated
  rec('Part III', 'Forecasts in externalForecasts untouched by Part IV work', await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')); return d.externalForecasts.length === 2 && d.externalForecasts[0].change === 'Competitor opens nearby'; }));
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250); await open(pg, 'p4'); rec('Responsive', `No page-level horizontal overflow, p4 at ${w}`, await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1)); }
  await pg.setViewportSize({ width: 1280, height: 800 });
  rec('Scope', 'Part V and end-of-manual remain placeholders (no inputs)', await (async () => { for (const x of ['p5', 'end']) { await open(pg, x); if ((await pg.$$('#pypRoot input,#pypRoot textarea,#pypRoot select')).length) return false; } return true; })());
  const keys = await pg.evaluate(() => Object.keys(localStorage).sort().join()); rec('Storage', 'Only siyb.iyb.planning.v1 added to localStorage', keys.split(',').filter((k) => !before.split(',').includes(k) && k !== 'siyb-language').join() === 'siyb.iyb.planning.v1', keys);
  for (const t of ['marketing', 'stock', 'costing']) { const o = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!o) await pg.click('.sidebar-group-head'); await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(700); rec('Regression', t + ' still opens', await pg.evaluate((x) => (x === 'costing' ? (!document.body.classList.contains('mode-training') && document.querySelector('#costingModuleRoot').innerText.length > 100) : document.body.classList.contains('mode-' + x)) && !document.body.classList.contains('mode-planning'), t)); }
  rec('Console', 'No page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (!r.p) f++; console.log((r.p ? 'PASS  ' : 'FAIL  ') + '[' + r.a + '] ' + r.n + (r.note && !r.p ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
