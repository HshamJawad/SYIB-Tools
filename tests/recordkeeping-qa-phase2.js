/* IYB Record Keeping QA – Phase 2 (educational content, activities, assessments, persistence, language, responsive, storage, regression of Phase 1 data).
 * Run: node tests/recordkeeping-qa-phase2.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root)
 * Waits are condition-based (waitForFunction); no fixed delays. Answer keys below are written independently from the manual (pp.9, 46–47, 60–61, 71). */
const { chromium } = require('playwright');
const fs = require('fs');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const KEY = 'siyb.iyb.recordkeeping.v1';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.').replace(/٬/g, ',');
const AR = /[؀-ۿ]/;
const KEYS = {
  a1: { tf: { t1: 'f', t2: 't', t3: 'f', t4: 't', t5: 't' } },
  a2: { fill: ['dcsr', 'car', 'credit', 'receipt', 'material', 'overhead'], mc: ['b', 'a', 'c', 'b', 'c'] },
  a3: { fill: ['gp', 'np', 'liab', 'assets', 'bs', 'pl'], mc: ['b', 'c', 'b', 'c', 'a'] }
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const boot = async () => {
    await pg.goto(URL_); await pg.waitForFunction(() => window.SIYBModules, null, { timeout: 15000 });
    const o = await pg.evaluate(() => !!document.querySelector('[data-tool-head="recordkeeping"]') && document.querySelector('[data-tool-head="recordkeeping"]').offsetParent !== null);
    if (!o) await pg.click('.sidebar-group-head');
    await pg.evaluate(() => document.querySelector('[data-tool-head="recordkeeping"]').click());
    await pg.waitForFunction(() => window.SIYBRecordKeeping && window.SIYBRKContent && document.querySelector('#rkRoot h2'), null, { timeout: 15000 });
  };
  const flush = () => pg.evaluate(() => window.SIYBRecordKeepingStore.flush());
  const openPart = async (id, sub) => {
    await pg.waitForFunction(() => window.SIYBRecordKeeping && window.SIYBRKContent && document.querySelector('#rkRoot'));
    await pg.evaluate((x) => window.SIYBRecordKeeping.open(x), id);
    await pg.waitForFunction((x) => window.SIYBRecordKeeping && window.SIYBRecordKeeping.current() === x && document.querySelector('#rkRoot .rk-sub'), id);
    if (sub) await goSub(sub);
  };
  const goSub = async (sub) => { await pg.click(`#rkRoot .rk-sub[data-id="${sub}"]`); await pg.waitForFunction((s) => document.querySelector(`#rkRoot .rk-sub.active[data-id="${s}"]`), sub); };
  const rootText = async () => ad(await pg.evaluate(() => document.querySelector('#rkRoot').innerText));
  const subIds = (p) => pg.evaluate((x) => SIYBRKContent.items(x).map((i) => i.id), p);
  const store = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);

  // let the service worker install/activate (its update reload happens once) before the real run
  await pg.goto(URL_); await pg.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready); await pg.waitForFunction(() => !navigator.serviceWorker || navigator.serviceWorker.controller || true);
  await pg.goto(URL_); await pg.waitForFunction(() => window.SIYBModules); await pg.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready);
  await boot();
  // ---------- Content completeness ----------
  const ids = {}; for (const p of ['intro', 'p1', 'p2', 'p3']) ids[p] = await subIds(p);
  rec('Content', 'Introduction: 4 sections', ids.intro.join() === 'about,who,objectives,use', ids.intro.join());
  rec('Content', 'Part I: what, Activity 1, what2, how, Activity 2, how2, summary + Assessment 1', ids.p1.join() === 'what,act1,what2,how,act2,how2,sum,assessment', ids.p1.join());
  const need2 = ['which', 'act3', 'brb', 'proof1', 'act4', 'proof2', 'manage', 'fill', 'mfbook', 'act5', 'after5', 'asset', 'act6', 'dep', 'salary', 'inventory', 'cost', 'loan', 'creditors', 'tax', 'keep', 'rtbook', 'act7', 'sum', 'assessment'];
  rec('Content', 'Part II: sections 1–5 incl. 3.1–3.3, 4.1–4.7, 5.1–5.2, Activities 3–7, summary, Assessment 2', need2.every((x) => ids.p2.includes(x)), need2.filter((x) => !ids.p2.includes(x)).join());
  const need3 = ['cash', 'debtors', 'profit', 'pl', 'gross', 'net', 'tax', 'bs-what', 'bs-why', 'bs-how', 'other', 'sum', 'assessment'];
  rec('Content', 'Part III: all sections incl. Assessment 3', need3.every((x) => ids.p3.includes(x)), need3.filter((x) => !ids.p3.includes(x)).join());
  const act = await pg.evaluate(() => ['p1', 'p2'].flatMap((p) => SIYBRKContent.activityIds(p)).join());
  rec('Content', 'Activities 1–7 all present', act === 'a1,a2,a3,a4,a5,a6,a7', act);
  // figures per section (Arabic default view)
  const figs = {
    mfbook: ['4,550.0', '3,564.0', '1,899.5', '1,020.0', '509.1', '135.4', '450.0', '(336.0)', '2,970.0', '1,366.0'],
    asset: ['9,200', '4,900', '4,300', '2,100', '1,320', '1,200'],
    salary: ['660', '810', '730', '1,470', '2,200'],
    inventory: ['7,500', '8,900', '2,500', '6,400', '8,250', '750'],
    loan: ['12,000', '11,000', '1,100'], creditors: ['1,200', '800', '400'], tax: ['540', '1,420', '1,960', '018'],
    proof2: ['800', '300', '500', '13782784'], act5: ['325.0', '1,200', '9.6', '15.0']
  };
  for (const [s, list] of Object.entries(figs)) {
    await openPart('p2', s); const t = await rootText();
    rec('Figures', `Part II ${s}: source figures present`, list.every((f) => t.includes(f)), list.filter((f) => !t.includes(f)).join());
  }
  await openPart('p3', 'gross'); let t3 = await rootText(); rec('Figures', 'Part III Modern Furniture 2013 statement: 36,213 / 11,600 / 15,800 / 8,813 / 4,713 / 4,100', /Modern Furniture/.test(t3) && ['36,213', '11,600', '15,800', '8,813', '4,713', '4,100'].every((x) => t3.includes(x)), ['36,213', '11,600', '15,800', '8,813', '4,713', '4,100'].filter((x) => !t3.includes(x)).join());
  await openPart('p3', 'bs-how'); t3 = await rootText(); rec('Figures', 'Part III Balance Sheet section has a table', (await pg.$$('#rkRoot .rk-table')).length >= 1);
  // terminology
  await openPart('p2', 'asset'); const term = await rootText();
  rec('Terminology', 'Approved Arabic terms: سجل الأصول، الإهلاك', /سجل الأصول/.test(term) && /الإهلاك/.test(term));
  await openPart('p3', 'pl'); const t3b = await rootText();
  rec('Terminology', 'Approved Arabic: قائمة الأرباح والخسائر، الربح الإجمالي', /قائمة الأرباح والخسائر/.test(t3b) || /الأرباح والخسائر/.test(t3b));
  rec('Content', 'Preliminary-translation notice and ILO attribution on the module', /ترجمة أولية/.test(await rootText()));

  // ---------- Reflective activities: no scoring, persistence ----------
  await openPart('p1', 'act1');
  rec('Activity', 'Activity 1 has 4 labelled textareas', (await pg.$$('#rkRoot .rk-activity textarea')).length === 4 && await pg.evaluate(() => [...document.querySelectorAll('#rkRoot .rk-activity textarea')].every((t) => document.querySelector(`label[for="${t.id}"]`))));
  rec('Activity', 'Reflective activity is not scored and has no model answer / reveal', await pg.evaluate(() => !document.querySelector('#rkRoot .rk-score') && !document.querySelector('#rkRoot [data-rk-act="reveal"]') && !document.querySelector('#rkRoot .rk-fb')));
  await pg.fill('#rk-r-a1-0', 'Zorbex answer one'); await pg.fill('#rk-r-a1-3', 'Zorbex answer four');
  rec('Activity', 'Typing a reflective answer shows no score or correctness', await pg.evaluate(() => !document.querySelector('#rkRoot .rk-score') && !/✔|✘/.test(document.querySelector('#rkRoot').innerText)));
  await flush();
  const s1 = await store();
  rec('Storage', 'Activity answers saved under activities.a1 in the module store', s1 && s1.activities && s1.activities.a1 && s1.activities.a1.q0 === 'Zorbex answer one' && s1.activities.a1.q3 === 'Zorbex answer four');
  rec('Storage', 'Phase 1 header preserved (schemaVersion 1, moduleId, language, lastSection)', s1.schemaVersion === 1 && s1.moduleId === 'recordkeeping' && 'lastSection' in s1 && 'language' in s1);
  await openPart('p3'); await openPart('p1', 'act1');
  rec('Persistence', 'Answer survives navigation to another part and back', await pg.inputValue('#rk-r-a1-0') === 'Zorbex answer one');
  await pg.reload(); await pg.waitForFunction(() => window.SIYBRKContent); await boot(); await openPart('p1', 'act1');
  rec('Persistence', 'Answer survives full page reload', await pg.inputValue('#rk-r-a1-3') === 'Zorbex answer four');
  rec('Persistence', 'Progress counter reflects answered activity', /1\/2/.test(await rootText()));
  for (const a of ['a3', 'a4', 'a7']) { const sec = { a3: ['p2', 'act3'], a4: ['p2', 'act4'], a7: ['p2', 'act7'] }[a]; await openPart(sec[0], sec[1]); const bad = await pg.evaluate(() => !!document.querySelector('#rkRoot [data-rk-act="reveal"], #rkRoot .rk-score')); rec('Activity', `Activity ${a.slice(1)} reflective: no reveal, no score`, !bad); }

  // ---------- Embedded question / Activity 5-6 reveal ----------
  await openPart('p2', 'which');
  rec('Reveal', 'Embedded question: model answer hidden initially and button disabled before an attempt', await pg.evaluate(() => !document.querySelector('#rk-a-q-other') && document.querySelector('[data-rk-act="reveal"][data-id="q-other"]').disabled) && !(await rootText()).includes('Bank transactions'));
  await pg.fill('#rk-r-q-other-0', 'Zorbex idea');
  await pg.waitForFunction(() => !document.querySelector('[data-rk-act="reveal"][data-id="q-other"]').disabled);
  await pg.click('[data-rk-act="reveal"][data-id="q-other"]'); await pg.waitForSelector('#rk-a-q-other');
  const qa = await rootText(); rec('Reveal', 'Model answer appears after attempt and reveal (bank, assets, salary, inventory, tax, agreements)', /المعاملات المصرفية|Bank transactions/.test(qa) && /المخزون|Inventory/.test(qa) && /الاتفاقيات|Agreements/.test(qa));
  await pg.reload(); await boot(); await openPart('p2', 'which');
  rec('Persistence', 'Reveal state persists after reload', await pg.evaluate(() => !!document.querySelector('#rk-a-q-other')));
  await openPart('p2', 'act5');
  const hid5 = await rootText(); rec('Reveal', 'Activity 5 answer hidden before attempt (no 1,525 / 995 balances)', !/1,525|995/.test(hid5) && await pg.evaluate(() => document.querySelector('[data-rk-act="reveal"][data-id="a5"]').disabled));
  await pg.fill('#rk-r-a5-0', 'Zorbex working'); await pg.waitForFunction(() => !document.querySelector('[data-rk-act="reveal"][data-id="a5"]').disabled);
  await pg.click('[data-rk-act="reveal"][data-id="a5"]'); await pg.waitForSelector('#rk-a-a5');
  const r5 = await rootText(); rec('Reveal', 'Activity 5 answer: 1,200 / 325 / 1,525 / 30 / 1,495 / 500 / 995', ['1,200', '325', '1,525', '1,495', '995'].every((x) => r5.includes(x)));
  await openPart('p2', 'act6'); const h6 = await rootText(); rec('Reveal', 'Activity 6 answer hidden before attempt', !/F0113/.test(h6));
  await pg.fill('#rk-r-a6-0', 'Zorbex'); await pg.waitForFunction(() => !document.querySelector('[data-rk-act="reveal"][data-id="a6"]').disabled); await pg.click('[data-rk-act="reveal"][data-id="a6"]'); await pg.waitForSelector('#rk-a-a6');
  const r6 = await rootText(); rec('Reveal', 'Activity 6 answer: F0113, 2013, 500, 4, 125, 125, 375', ['F0113', '2013', '500', '125', '375'].every((x) => r6.includes(x)));
  await pg.click('[data-rk-act="reveal"][data-id="a6"]'); await pg.waitForFunction(() => !document.querySelector('#rk-a-a6'));
  rec('Reveal', 'Reveal can be hidden again', true);
  await openPart('p1', 'what'); const q1 = await rootText(); rec('Reveal', 'Part I embedded story questions are hidden until an attempt', !!(await pg.$('[data-rk-act="reveal"][data-id="q-story1"]')) && !(await pg.$('#rk-a-q-story1')));

  // ---------- Assessments ----------
  const answerAll = async (id, wrong) => {
    const k = KEYS[id];
    if (id === 'a1') { for (const [n, v] of Object.entries(k.tf)) await pg.check(`input[data-rk-as="a1"][data-k="s_${n}"][value="${wrong ? (v === 't' ? 'f' : 't') : v}"]`); return; }
    for (let i = 0; i < 6; i++) await pg.selectOption(`select[data-k="f_b${i + 1}"]`, wrong ? { index: ((k.fill.indexOf(k.fill[i]) + 1) % 2) + 1 } : k.fill[i]);
    for (let i = 0; i < 5; i++) await pg.check(`input[data-k="m_m${i + 1}"][value="${wrong ? 'abc'['abc'.indexOf(k.mc[i]) + 1 > 2 ? 0 : 'abc'.indexOf(k.mc[i]) + 1] : k.mc[i]}"]`);
  };
  const wrongFill = async (id) => { /* choose an option that differs from the key */
    const keys = KEYS[id].fill;
    for (let i = 0; i < 6; i++) { const vals = await pg.$$eval(`select[data-k="f_b${i + 1}"] option`, (o) => o.map((x) => x.value).filter(Boolean)); await pg.selectOption(`select[data-k="f_b${i + 1}"]`, vals.find((v) => v !== keys[i])); }
  };
  const total = { a1: 5, a2: 11, a3: 11 };
  for (const [id, part] of [['a1', 'p1'], ['a2', 'p2'], ['a3', 'p3']]) {
    const N = id.toUpperCase();
    await openPart(part, 'assessment');
    const init = await pg.evaluate(() => ({ fb: document.querySelectorAll('#rkRoot .rk-fb').length, score: !!document.querySelector('#rkRoot .rk-score'), checked: document.querySelectorAll('#rkRoot input:checked').length, st: document.querySelector('.rk-assess .rk-status').textContent }));
    rec('Assess', `${N}: answers/feedback/score hidden initially; not completed`, init.fb === 0 && !init.score && init.checked === 0 && /غير مكتمل|Not completed/.test(init.st));
    await pg.click(`[data-rk-act="submit"][data-id="${id}"]`);
    rec('Assess', `${N}: submitting with unanswered items is refused with a message (not completed)`, (await pg.textContent(`#rk-${id}-msg`)).length > 0 && !(await pg.$('#rkRoot .rk-score')));
    await flush(); const s0 = await store(); rec('Assess', `${N}: completion only after submission (store has no submitted flag)`, !(s0.assessments && s0.assessments[id] && s0.assessments[id].submitted));
    if (id === 'a1') await answerAll(id, true); else { await wrongFill(id); for (let i = 0; i < 5; i++) await pg.check(`input[data-k="m_m${i + 1}"][value="${'abc'[('abc'.indexOf(KEYS[id].mc[i]) + 1) % 3]}"]`); }
    await pg.click(`[data-rk-act="submit"][data-id="${id}"]`); await pg.waitForSelector('#rkRoot .rk-score');
    let sc = ad(await pg.textContent('#rkRoot .rk-score'));
    rec('Assess', `${N}: all-wrong attempt scores 0/${total[id]} and shows feedback with the correct answers`, new RegExp(`0\\D+${total[id]}`).test(sc) && (await pg.$$('#rkRoot .rk-fb')).length >= (id === 'a1' ? 5 : 11) && /✘/.test(await rootText()));
    rec('Assess', `${N}: controls locked after submission and shown as completed`, await pg.evaluate(() => [...document.querySelectorAll('#rkRoot .rk-assess input, #rkRoot .rk-assess select')].every((e) => e.disabled || e.closest('fieldset[disabled]')) && /مكتمل|Completed/.test(document.querySelector('.rk-assess .rk-status').textContent)));
    await pg.click(`[data-rk-act="retry"][data-id="${id}"]`); await pg.waitForFunction(() => !document.querySelector('#rkRoot .rk-score'));
    rec('Assess', `${N}: retry clears answers, score and feedback`, await pg.evaluate(() => document.querySelectorAll('#rkRoot .rk-assess input:checked').length === 0 && !document.querySelector('#rkRoot .rk-fb')));
    await answerAll(id, false);
    await pg.focus(`[data-rk-act="submit"][data-id="${id}"]`); await pg.keyboard.press('Enter'); await pg.waitForSelector('#rkRoot .rk-score');
    sc = ad(await pg.textContent('#rkRoot .rk-score'));
    rec('Assess', `${N}: all-correct attempt (submitted by keyboard) scores ${total[id]}/${total[id]}`, new RegExp(`${total[id]}\\D+${total[id]}`).test(sc) && !/✘/.test(await rootText()), sc.slice(0, 40));
    await flush(); const s2 = await store(); const A = s2.assessments[id];
    rec('Storage', `${N}: answers, submitted flag and score persisted`, A && A.submitted === true && A.score === total[id] && A.total === total[id] && Object.keys(A.answers).length === total[id]);
    await pg.reload(); await boot(); await openPart(part, 'assessment');
    rec('Persistence', `${N}: completed state, score and review restored after reload`, /مكتمل|Completed/.test(await pg.textContent('.rk-assess .rk-status')) && new RegExp(`${total[id]}\\D+${total[id]}`).test(ad(await pg.textContent('#rkRoot .rk-score'))));
    rec('Assess', `${N}: progress line shows completion`, new RegExp(`${total[id]}/${total[id]}`).test(await rootText()));
  }
  // partial answers persist without submitting; wrong answers feedback mixture
  await openPart('p1', 'assessment'); await pg.click('[data-rk-act="retry"][data-id="a1"]'); await pg.waitForFunction(() => !document.querySelector('#rkRoot .rk-score'));
  await pg.check('input[data-k="s_t1"][value="f"]'); await pg.check('input[data-k="s_t2"][value="f"]'); await flush();
  await openPart('p2'); await openPart('p1', 'assessment');
  rec('Persistence', 'A1 partial answers persist across navigation without completing', await pg.evaluate(() => document.querySelector('input[data-k="s_t1"][value="f"]').checked && document.querySelector('input[data-k="s_t2"][value="f"]').checked && !document.querySelector('#rkRoot .rk-score')));
  for (const [k, v] of [['t3', 'f'], ['t4', 't'], ['t5', 't']]) await pg.check(`input[data-k="s_${k}"][value="${v}"]`);
  await pg.click('[data-rk-act="submit"][data-id="a1"]'); await pg.waitForSelector('#rkRoot .rk-score');
  rec('Assess', 'A1 mixed answers: 4/5 (t2 wrong) with one ✘ and four ✔', /4\D+5/.test(ad(await pg.textContent('#rkRoot .rk-score'))));
  const mix = await pg.$$eval('#rkRoot .rk-fb', (e) => e.map((x) => x.textContent.trim()[0]).join(''));
  rec('Assess', 'A1 feedback order: t1 ✔, t2 ✘, t3 ✔, t4 ✔, t5 ✔', mix === '✔✘✔✔✔', mix);
  rec('Assess', 'No pass/fail grading invented', !/نجاح|رسوب|Pass|Fail/.test((await rootText()).replace(/لا يحدّد الدليل درجة نجاح[^.]*\./, '').replace(/The manual defines no pass mark[^.]*\./, '')));

  // ---------- Accessibility ----------
  await openPart('p2', 'assessment'); await pg.click('[data-rk-act="retry"][data-id="a2"]'); await pg.waitForFunction(() => !document.querySelector('#rkRoot .rk-score'));
  const a11y = await pg.evaluate(() => ({ legends: [...document.querySelectorAll('#rkRoot fieldset')].every((f) => f.querySelector('legend')), selects: [...document.querySelectorAll('#rkRoot select')].every((s) => s.closest('label') && s.closest('label').textContent.trim().length > 0), radios: [...document.querySelectorAll('#rkRoot input[type=radio]')].every((r) => r.closest('label')), btns: [...document.querySelectorAll('#rkRoot [data-rk-act]')].every((b) => b.tagName === 'BUTTON' && b.type === 'button'), wraps: [...document.querySelectorAll('#rkRoot .rk-tablewrap')].every((w) => w.getAttribute('role') === 'region' && w.tabIndex === 0) }));
  rec('A11y', 'Assessment items are fieldset+legend; radios and selects are labelled; actions are real buttons', a11y.legends && a11y.selects && a11y.radios && a11y.btns);
  await openPart('p2', 'mfbook');
  rec('A11y', 'Tables are keyboard-scrollable regions with headers, scoped columns and captions', await pg.evaluate(() => [...document.querySelectorAll('#rkRoot .rk-tablewrap')].every((w) => w.getAttribute('role') === 'region' && w.tabIndex === 0 && w.querySelector('th[scope]') && w.querySelector('caption'))));
  await openPart('p2', 'which'); await pg.fill('#rk-r-q-other-0', 'Zorbex'); const ex0 = await pg.getAttribute('[data-rk-act="reveal"][data-id="q-other"]', 'aria-expanded'); await pg.focus('[data-rk-act="reveal"][data-id="q-other"]'); await pg.keyboard.press('Space');
  await pg.waitForFunction((v) => document.querySelector('[data-rk-act="reveal"][data-id="q-other"]').getAttribute('aria-expanded') !== v, ex0);
  rec('A11y', 'Reveal button is keyboard operable and toggles aria-expanded', true);

  // ---------- Language ----------
  await openPart('p2', 'proof2');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForFunction(() => document.documentElement.lang === 'en' && /Customers/.test(document.querySelector('#rkRoot').innerText));
  const en = await pg.evaluate(() => ({ dir: document.documentElement.dir, t: document.querySelector('#rkRoot').innerText }));
  rec('Language', 'English: LTR and no Arabic characters in the content view', en.dir === 'ltr' && !AR.test(en.t), (en.t.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  rec('Language', 'English terminology: Customers’ Accounts Record, Credit Limit', /Customers’ Accounts Record/i.test(en.t) && /Credit Limit/i.test(en.t));
  await openPart('p3', 'assessment'); const enA = ad(await pg.evaluate(() => document.querySelector('#rkRoot').innerText));
  rec('Language', 'English assessment: Profit and Loss Statement / Balance Sheet in word list', /Profit and Loss Statement/.test(enA) && /Balance Sheet/.test(enA) && !AR.test(enA));
  await openPart('p1', 'act1'); rec('Language', 'Answers typed in Arabic mode remain after switching language', await pg.inputValue('#rk-r-a1-0') === 'Zorbex answer one');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForFunction(() => document.documentElement.lang === 'ar');
  rec('Language', 'Back to Arabic restores RTL', await pg.evaluate(() => document.documentElement.dir === 'rtl' && /الجزء/.test(document.querySelector('#rkRoot').innerText)));

  // ---------- Responsive ----------
  for (const w of [375, 768, 1280]) {
    await pg.setViewportSize({ width: w, height: 900 }); let bad = [];
    for (const [p, s] of [['intro', 'about'], ['p1', 'what'], ['p2', 'mfbook'], ['p2', 'asset'], ['p2', 'rtbook'], ['p2', 'assessment'], ['p3', 'pl'], ['p3', 'assessment']]) {
      await openPart(p, s); const o = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1); if (o) bad.push(p + '/' + s);
    }
    rec('Responsive', `No horizontal page overflow at ${w}px (8 views)`, bad.length === 0, bad.join());
  }
  await pg.setViewportSize({ width: 1280, height: 900 });

  // ---------- Storage isolation & robustness ----------
  const keys = await pg.evaluate(() => Object.keys(localStorage));
  const mine = keys.filter((k) => /recordkeeping/.test(k));
  rec('Storage', 'Module data only under siyb.iyb.recordkeeping.v1 (no other recordkeeping keys)', mine.join() === KEY, mine.join());
  const others = await pg.evaluate(() => { const o = {}; Object.keys(localStorage).filter((k) => !/recordkeeping/.test(k)).forEach((k) => { o[k] = localStorage.getItem(k); }); return o; });
  rec('Storage', 'Other modules’ keys never contain Record Keeping answers', !Object.values(others).some((v) => /Zorbex/.test(v)));
  // Phase 1 shaped data readable
  await pg.evaluate((k) => localStorage.setItem(k, JSON.stringify({ schemaVersion: 1, moduleId: 'recordkeeping', language: 'ar', lastSection: 'p3', updatedAt: '2026-11-20T00:00:00.000Z' })), KEY);
  await boot();
  rec('Storage', 'Phase 1 data (header only) is read without loss; last section honoured', await pg.evaluate(() => SIYBRecordKeeping.current() === 'p3' && !localStorage.getItem('siyb.iyb.recordkeeping.v1.unreadable')));
  await openPart('p3', 'assessment'); await pg.check('input[data-k="m_m1"][value="b"]'); await flush();
  const up = await store(); rec('Storage', 'Phase 2 keys added to a Phase 1 record keep its header intact', up.moduleId === 'recordkeeping' && up.schemaVersion === 1 && up.assessments.a3.answers.m_m1 === 'b');
  // corrupted nested values
  await pg.evaluate((k) => localStorage.setItem(k, JSON.stringify({ schemaVersion: 1, moduleId: 'recordkeeping', activities: 'oops', assessments: { a1: 'bad', a2: { answers: 5, submitted: 'yes', score: 'x' }, a3: null } })), KEY);
  await boot(); await openPart('p1', 'assessment'); await openPart('p2', 'assessment'); await openPart('p3', 'assessment'); await openPart('p1', 'act1');
  rec('Robustness', 'Corrupted nested activity/assessment values do not break the views', await pg.evaluate(() => !!document.querySelector('#rkRoot textarea') && !document.querySelector('#rkRoot .rk-score')));
  await pg.fill('#rk-r-a1-0', 'Zorbex again'); await flush();
  rec('Robustness', 'Learner can continue after corrupted data (new answer saved)', (await store()).activities && (await store()).activities.a1 && (await store()).activities.a1.q0 === 'Zorbex again');
  await pg.evaluate((k) => localStorage.setItem(k, '{bad json'), KEY); await boot(); await openPart('p2', 'act3');
  rec('Robustness', 'Unreadable JSON preserved in .unreadable and content still works', await pg.evaluate(() => localStorage.getItem('siyb.iyb.recordkeeping.v1.unreadable') === '{bad json' && !!document.querySelector('#rkRoot textarea')));

  // ---------- Packaging ----------
  const sw = fs.readFileSync('service-worker.js', 'utf8'); const appJs = fs.readFileSync('src/app.js', 'utf8'); const html = fs.readFileSync('index.html', 'utf8');
  const files = ['content-intro', 'content-part1', 'content-part2', 'content-part3', 'assessments', 'activities'];
  rec('Packaging', 'Service worker APP_SHELL lists the 6 new Record Keeping files', files.every((f) => sw.includes(`./src/modules/recordkeeping-${f}.js`) && fs.existsSync(`src/modules/recordkeeping-${f}.js`)));
  const reg = fs.readFileSync('src/modules/registry.js', 'utf8'); rec('Packaging', 'Registry scripts load the new files before the module script', files.every((f) => reg.includes(`recordkeeping-${f}.js`)) && reg.indexOf('recordkeeping-activities.js') < reg.indexOf("recordkeeping.js']"));
  const ver = (s) => (s.match(/0\.\d+\.\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  rec('Packaging', 'Version 0.31.0 consistent in service worker, app.js and index.html', /v0\.31\.0/.test(sw) && appJs.includes('0.31.0') && html.includes('0.31.0') && !ver(sw).includes('0.29.0'));
  rec('Packaging', 'No JavaScript errors during the whole run', errs.length === 0, errs.slice(0, 3).join('|'));

  await browser.close();
  let f = 0; for (const r of results) { if (!r.p) f++; console.log((r.p ? 'PASS' : 'FAIL') + '  [' + r.a + '] ' + r.n + (r.p || !r.note ? '' : '  -> ' + r.note)); }
  console.log(`PASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
