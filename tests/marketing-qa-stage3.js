/* IYB Marketing QA – Stage 3 (assessments 1–9, activity answers, Card 08: Can You Help?, Action Plan, answers/review, glossary).
 * Run: node tests/marketing-qa-stage3.js */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const pg = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(900);
  const op = async (c) => { await pg.evaluate((x) => SIYBMarketing.open(x), c); await pg.waitForTimeout(200); };
  const placement = { asmt1: 'c02', asmt2: 'c03', asmt3: 'c04', asmt4: 'c04', asmt5: 'c05', asmt6: 'c05', asmt7: 'c06', asmt8: 'c06', asmt9: 'c07' };
  const kinds = { asmt1: 'cloze', asmt2: 'mcq', asmt3: 'cloze', asmt4: 'mcq', asmt5: 'cloze', asmt6: 'cloze', asmt7: 'mcq', asmt8: 'open', asmt9: 'open' };
  for (const [id, c] of Object.entries(placement)) {
    await op(c);
    const r = await pg.evaluate((i) => { const e = document.getElementById(i); if (!e) return null; const part = e.closest('.mk-part'); const isLast = [...part.children].filter((x) => x.matches('.mk-asm')).length === 1; return { sel: e.querySelectorAll('select').length, radios: e.querySelectorAll('input[type=radio]').length, ta: e.querySelectorAll('textarea').length, leak: e.querySelectorAll('.mk-key,.mk-result,.mk-answer,.ok,.bad').length, after: !!e.previousElementSibling, src: !!e.querySelector('.mk-src'), inPart: !!part }; }, id);
    rec('Assessment', `${id} rendered in ${c}, source ref shown`, !!r && r.src && r.inPart, JSON.stringify(r));
    rec('Assessment', `${id}: no answer key visible before submit`, !!r && r.leak === 0);
    rec('Assessment', `${id}: control type matches ${kinds[id]}`, !!r && (kinds[id] === 'cloze' ? r.sel > 0 : kinds[id] === 'mcq' ? r.radios > 0 : r.ta > 0), JSON.stringify(r));
  }
  // cloze 1: correct answers -> 9/9
  await op('c02');
  const keys = await pg.evaluate(() => Object.fromEntries(Object.values(SIYB_MK_ASSESS).map((a) => [a.id, a.key || a.items.map((i) => i.correct)])));
  rec('Assessment', 'Assessment 1 has 9 blanks, 2 has 5 items', Object.keys(keys.asmt1).length === 9 && keys.asmt2.length === 5);
  // wrong first
  await pg.selectOption('#asmt1 select[data-k="b1"]', keys.asmt1['1'] === 'a' ? 'b' : 'a');
  await pg.click('#asmt1 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  rec('Assessment', 'Submit reveals ✓ keys and marks wrong answers', await pg.evaluate(() => !!document.querySelector('#asmt1 .mk-blank.bad .mk-key') && !!document.querySelector('#asmt1 .mk-result')));
  rec('Assessment', 'Result labelled self-review, not a grade', await pg.evaluate(() => /self-review|المراجعة الذاتية|مراجعة ذاتية/.test(document.querySelector('#asmt1 .mk-result').innerText)));
  await pg.click('#asmt1 [data-act="asm-edit"]'); await pg.waitForTimeout(300);
  rec('Assessment', 'Edit hides the key again and keeps my selection', await pg.evaluate(() => !document.querySelector('#asmt1 .mk-key') && document.querySelector('#asmt1 select[data-k="b1"]').value !== ''));
  for (const [k, v] of Object.entries(keys.asmt1)) await pg.selectOption(`#asmt1 select[data-k="b${k}"]`, v);
  await pg.click('#asmt1 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  rec('Assessment', 'All keyed answers => 9/9 self-check', await pg.evaluate(() => /9\s*\/\s*9|٩\s*\/\s*٩/.test(document.querySelector('#asmt1 .mk-result').innerText)));
  rec('Progress', 'Assessment 1 badge completed; Part I not yet done (activity+summary pending)', await pg.evaluate(() => document.querySelector('[data-st="asm:asmt1"]').className.includes('done') && !document.querySelector('[data-st="part:I"]').className.includes('done')));
  await pg.click('#act1 [data-act="done"]'); await pg.locator('.mk-summary input[type=checkbox]').check(); await pg.waitForTimeout(300);
  rec('Progress', 'Part I/Card 02 done after activity + summary + assessment', await pg.evaluate(() => document.querySelector('[data-st="part:I"]').className.includes('done') && document.querySelector('[data-st="card:c02"]').className.includes('done')));
  // persistence + language
  await pg.reload(); await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(900); await op('c02');
  rec('Storage', 'Assessment state + selections restored after reload', await pg.evaluate(() => !!document.querySelector('#asmt1 .mk-result') && document.querySelector('#asmt1 select').disabled));
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Language switch keeps assessment answers and submitted state', await pg.evaluate((k) => !!document.querySelector('#asmt1 .mk-result') && document.querySelector('#asmt1 select[data-k="b1"]').value === k, keys.asmt1['1']));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  // mcq 2
  await op('c03');
  const letters = keys.asmt2;
  for (let i = 0; i < 5; i++) await pg.check(`#asmt2 input[data-k="q${i + 1}"][value="${letters[i]}"]`);
  await pg.click('#asmt2 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  rec('Assessment', 'MCQ 2: all correct => 5/5 and ✓ shown', await pg.evaluate(() => /5\s*\/\s*5|٥\s*\/\s*٥/.test(document.querySelector('#asmt2 .mk-result').innerText) && document.querySelectorAll('#asmt2 .mk-opt.ok').length === 5));
  rec('Assessment', 'MCQ keys equal the manual (1b 2b 3c 4a 5a)', keys.asmt2.join('') === 'bbcaa', keys.asmt2.join(''));
  // open 8
  await op('c06');
  rec('Assessment', 'Open 8: no model answer before request', await pg.evaluate(() => !document.querySelector('#asmt8 .mk-answer')));
  await pg.fill('#asmt8 textarea', 'The second one'); await pg.click('#asmt8 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  rec('Assessment', 'Open 8: model answer after request, my text kept', await pg.evaluate(() => !!document.querySelector('#asmt8 .mk-answer') && document.querySelector('#asmt8 textarea').value === 'The second one'));
  // activity answers
  await op('c04');
  rec('ActAnswers', 'Activity 7 model answer hidden by default', await pg.evaluate(() => !document.querySelector('#act7 .mk-answer') && !!document.querySelector('#act7 [data-act="ans"]')));
  await pg.click('#act7 [data-act="ans"]'); await pg.waitForTimeout(250);
  rec('ActAnswers', 'Activity 7 model answer shows on request with source page', await pg.evaluate(() => !!document.querySelector('#act7 .mk-answer .mk-src')));
  const ansIds = await pg.evaluate(() => Object.keys(SIYB_MK_ACT_ANSWERS).join());
  rec('ActAnswers', 'Answer entries only for activities the manual answers (7,10,19,20)', ansIds === 'act7,act10,act19,act20', ansIds);
  await op('c03'); rec('ActAnswers', 'No answer button on activities without manual answers', await pg.evaluate(() => !document.querySelector('#act2 [data-act="ans"]')));
  // card 08
  await op('c08');
  const c8 = await pg.evaluate(() => ({ tasks: document.querySelectorAll('#cyh textarea').length, ans: !!document.querySelector('#cyh .mk-answer'), rows: document.querySelectorAll('#plan .mk-ftable tbody tr').length, gl: document.querySelectorAll('#glList .mk-gl').length, asmRows: document.querySelectorAll('#answers .mk-plist li').length, ph: !!document.querySelector('#mkRoot .mk-placeholder') }));
  rec('Card08', 'Ten Can-You-Help tasks, answers hidden, 4 plan rows, 21 glossary terms, 9 assessment rows, no placeholder', c8.tasks === 10 && !c8.ans && c8.rows === 4 && c8.gl === 21 && c8.asmRows === 9 && !c8.ph, JSON.stringify(c8));
  await pg.fill('#cyh_t1', 'Customers want straight perms'); await pg.waitForTimeout(400);
  rec('Card08', 'Can You Help entry marks exercise in progress', await pg.evaluate(() => document.querySelector('[data-st="act:cyh"]').className.includes('inprogress')));
  await pg.click('#cyh [data-act="ans"]'); await pg.waitForTimeout(250);
  rec('Card08', 'Can You Help model answers on request (10 items)', await pg.evaluate(() => document.querySelectorAll("#cyh .mk-answer h4").length === 10));
  await pg.fill('#plan textarea[data-ap="0"][data-apk="what"]', 'Menu is boring'); await pg.fill('#plan textarea[data-ap="0"][data-apk="who"]', 'Me 123'); await pg.waitForTimeout(500);
  const ap = await pg.evaluate(() => { SIYBMarketingStore.flush(); return JSON.parse(localStorage.getItem('siyb.iyb.marketing.v1')).actionPlan; });
  rec('Card08', 'Action Plan saved as array of {what,how,who,when}', Array.isArray(ap) && ap[0].what === 'Menu is boring' && ap[0].who === 'Me 123', JSON.stringify(ap));
  await pg.click('#plan [data-act="ap-add"]'); await pg.waitForTimeout(250);
  rec('Card08', 'Add row => 5 rows, text kept', await pg.evaluate(() => document.querySelectorAll('#plan .mk-ftable tbody tr').length === 5 && document.querySelector('#plan textarea[data-ap="0"][data-apk="what"]').value === 'Menu is boring'));
  await pg.click('#plan tbody tr:nth-child(5) [data-act="ap-del"]'); await pg.waitForTimeout(250);
  rec('Card08', 'Delete row works', await pg.evaluate(() => document.querySelectorAll('#plan .mk-ftable tbody tr').length === 4));
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Switch keeps plan + Can You Help text', await pg.evaluate(() => document.querySelector('#plan textarea[data-ap="0"][data-apk="what"]').value === 'Menu is boring' && document.getElementById('cyh_t1').value === 'Customers want straight perms'));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  await pg.reload(); await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(900); await op('c08');
  rec('Storage', 'Plan + exercise + revealed answers restored after reload', await pg.evaluate(() => document.querySelector('#plan textarea[data-ap="0"][data-apk="what"]').value === 'Menu is boring' && document.getElementById('cyh_t1').value !== '' && !!document.querySelector('#cyh .mk-answer')));
  await pg.click('#cyh [data-act="done"]'); await pg.click('#plan [data-act="done"]'); await pg.waitForTimeout(300);
  rec('Progress', 'Card 08 completed after both marked complete', await pg.evaluate(() => document.querySelector('[data-st="card:c08"]').className.includes('done')));
  // glossary
  await pg.fill('#glq', 'price'); await pg.waitForTimeout(250);
  const g1 = await pg.evaluate(() => [document.querySelectorAll('#glList .mk-gl').length, document.activeElement && document.activeElement.id]);
  rec('Glossary', 'Search (English or Arabic term) filters entries and keeps focus', g1[0] >= 1 && g1[0] < 21 && g1[1] === 'glq', JSON.stringify(g1));
  await pg.fill('#glq', 'zzzzqq'); await pg.waitForTimeout(200);
  rec('Glossary', 'No-match message', await pg.evaluate(() => document.querySelectorAll('#glList .mk-gl').length === 0 && document.querySelector('#glList').innerText.length > 5));
  await pg.fill('#glq', '');
  // answers & review: open Part
  await pg.click('#answers [data-id="c05"][data-to="asmt6"]'); await pg.waitForTimeout(400);
  rec('Review', '"Open Part" jumps to the assessment card', await pg.evaluate(() => SIYBMarketing.current() === 'c05' && !!document.getElementById('asmt6')));
  // overview
  await op('c01');
  rec('Progress', 'Card 01 overview shows assessments completed count', await pg.evaluate(() => /[0-9٠-٩]+\s*\/\s*[0-9٠-٩]+/.test(document.querySelector('.mk-overview .mk-small:last-child').innerText)));
  // scope: no invented content / cheating
  rec('Scope', 'No ILO/SIYB logo images anywhere in Card 08', await (async () => { await op('c08'); return pg.evaluate(() => document.querySelectorAll('#mkRoot img').length === 0); })());
  // responsive
  for (const [n, vp] of [['phone', { width: 390, height: 800 }], ['tablet', { width: 820, height: 1000 }]]) {
    const p2 = await (await browser.newContext({ viewport: vp })).newPage(); await p2.goto(URL_); await p2.waitForTimeout(900);
    await p2.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await p2.waitForTimeout(900);
    const bad = [];
    for (const c of ['c01', 'c02', 'c04', 'c05', 'c06', 'c07', 'c08']) { await p2.evaluate((x) => SIYBMarketing.open(x), c); await p2.waitForTimeout(150); if (await p2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) bad.push(c); }
    rec('Responsive', `${n}: cards 01-08 no horizontal overflow`, bad.length === 0, bad.join());
    if (n === 'phone') { await p2.evaluate(() => { SIYBMarketing.open('c08'); document.getElementById('plan').scrollIntoView(); }); await p2.screenshot({ path: '/tmp/mk-s3-phone.png' }); }
  }
  rec('Console', 'No console/page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  const pw = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); await pw.goto(URL_); await pw.waitForTimeout(2500);
  const cache = await pw.evaluate(async () => { const k = (await caches.keys()).find((x) => x.includes('v0.30.0')); if (!k) return null; return (await (await caches.open(k)).keys()).map((r) => r.url.split('/').pop().split('?')[0]); });
  rec('PWA', 'Cache v0.30.0 holds Stage 3 files', !!cache && ['marketing-assess-a.js', 'marketing-assess-b.js', 'marketing-card8.js', 'marketing-glossary.js'].every((f) => cache.includes(f)));
  await pw.context().setOffline(true); await pw.reload().catch(() => {}); await pw.waitForTimeout(1500);
  await pw.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await pw.waitForTimeout(1000);
  await pw.evaluate(() => SIYBMarketing.open('c08')).catch(() => {}); await pw.waitForTimeout(300);
  rec('PWA', 'Offline: Card 08 renders (glossary, plan)', await pw.evaluate(() => document.querySelectorAll('#glList .mk-gl').length === 21 && !!document.getElementById('plan')).catch(() => false));
  await browser.close();
  results.forEach((r) => console.log(r.p ? 'PASS ' : 'FAIL ', `[${r.a}]`, r.n, !r.p && r.note ? ' — ' + r.note : ''));
  const f = results.filter((r) => !r.p).length; console.log(`\nPASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})();
