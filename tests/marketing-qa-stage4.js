/* IYB Marketing QA – Stage 4 (persistence, JSON export/import with validation, protected reset, fallback, PDF report).
 * Run: node tests/marketing-qa-stage4.js */
const { chromium } = require('playwright'); const fs = require('fs');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const K = 'siyb.iyb.marketing.v1';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const boot = async (p) => { await p.goto(URL_); await p.waitForTimeout(900); await p.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await p.waitForTimeout(900); };
  const op = async (c) => { await pg.evaluate((x) => SIYBMarketing.open(x), c); await pg.waitForTimeout(250); };
  const stored = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), K);
  await boot(pg);
  rec('Nav', 'Dashboard still shows exactly 8 cards; data page reachable from home and menu', await pg.evaluate(() => document.querySelectorAll('.mk-card').length === 8 && !!document.querySelector('[data-act="go"][data-id="data"]') && !!document.querySelector('[data-nav-item="marketing-data"]')));
  // enter data
  await op('c02'); await pg.fill('#act1_a', 'Hair braiding'); await pg.click('#act1 [data-act="done"]'); await pg.waitForTimeout(200);
  await pg.selectOption('#asmt1 select[data-k="b1"]', 'a'); await pg.click('#asmt1 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  await op('c08'); await pg.fill('#cyh_t1', 'Customers want straight perms'); await pg.fill('#plan textarea[data-ap="0"][data-apk="what"]', 'Menu is boring'); await pg.waitForTimeout(600);
  const s1 = await stored();
  rec('Save', 'Autosave writes versioned namespaced data (schemaVersion, moduleId, language, progress, responses, actionPlan, updatedAt)', !!s1 && s1.schemaVersion === 1 && s1.moduleId === 'marketing' && ['ar', 'en'].includes(s1.language) && s1.progress && s1.responses.act1.a === 'Hair braiding' && Array.isArray(s1.actionPlan) && !!s1.updatedAt, JSON.stringify(Object.keys(s1 || {})));
  rec('Save', 'No manual content stored (only learner data) and size is small', JSON.stringify(s1).length < 5000, String(JSON.stringify(s1).length));
  await pg.reload(); await pg.waitForTimeout(900); await boot(pg).catch(() => {});
  await op('c02'); rec('Restore', 'Entries, completion mark and assessment restored after reload', await pg.evaluate(() => document.getElementById('act1_a').value === 'Hair braiding' && document.querySelector('[data-st="act:act1"]').className.includes('done') && !!document.querySelector('#asmt1 .mk-result')));
  // data page
  await op('data');
  rec('DataPage', 'Data page shows export/import/erase/PDF controls and last-saved info', await pg.evaluate(() => ['export', 'import', 'reset', 'pdf'].every((a) => document.querySelector(`[data-act="${a}"]`)) && /Last saved|آخر حفظ/.test(document.getElementById('mkRoot').innerText)));
  // export
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('[data-act="export"]')]);
  const path = '/tmp/mk-backup.json'; await dl.saveAs(path); const exp = JSON.parse(fs.readFileSync(path, 'utf8'));
  rec('Export', 'JSON file with format, schemaVersion, exportedAt and data', exp.format === 'siyb-tools.iyb-marketing.backup' && exp.schemaVersion === 1 && !!exp.exportedAt && exp.data.moduleId === 'marketing' && exp.data.responses.act1.a === 'Hair braiding' && /siyb-iyb-marketing-backup-\d{4}-\d{2}-\d{2}\.json/.test(dl.suggestedFilename()), dl.suggestedFilename());
  rec('Export', 'Export contains no other module\'s data keys', !JSON.stringify(exp).includes('readinessAssessment'));
  // invalid imports
  const bad = {
    'invalid JSON': '{not json',
    'wrong format': JSON.stringify({ format: 'x', data: {} }),
    'GYB-like file': JSON.stringify({ format: 'siyb-tools.gyb.backup', schemaVersion: 1, data: { moduleId: 'gyb' } }),
    'future version': JSON.stringify({ format: exp.format, schemaVersion: 99, data: Object.assign({}, exp.data, { schemaVersion: 99 }) }),
    'bad structure (actionPlan not array)': JSON.stringify({ format: exp.format, schemaVersion: 1, data: Object.assign({}, exp.data, { actionPlan: 'x' }) }),
    'bad structure (nested number in responses)': JSON.stringify({ format: exp.format, schemaVersion: 1, data: Object.assign({}, exp.data, { responses: { act1: { a: 5 } } }) }),
    'bad structure (prototype key)': '{"format":"' + exp.format + '","schemaVersion":1,"data":' + JSON.stringify(Object.assign({}, exp.data, { responses: {} })).replace('"responses":{}', '"responses":{"__proto__":{"x":"y"}}') + '}'
  };
  let dialogs = 0; pg.on('dialog', (d) => { dialogs++; d.dismiss(); });
  for (const [name, text] of Object.entries(bad)) {
    fs.writeFileSync('/tmp/mk-bad.json', text);
    await pg.setInputFiles('[data-file="import"]', '/tmp/mk-bad.json'); await pg.waitForTimeout(400);
    const m = await pg.evaluate(() => document.querySelector('[data-o="msg"]').className);
    const now = await stored();
    rec('Import', `Rejected: ${name}; data unchanged; no overwrite prompt`, m.includes('bad') && now.responses.act1.a === 'Hair braiding' && dialogs === 0, m);
  }
  // valid import onto existing data: cancel
  const modified = JSON.parse(JSON.stringify(exp)); modified.data.responses.act1.a = 'Imported value'; modified.exportedAt = '2026-01-01T00:00:00.000Z'; modified.data.actionPlan = [{ what: 'W', how: 'H', who: 'O', when: 'N' }];
  fs.writeFileSync('/tmp/mk-good.json', JSON.stringify(modified));
  let seenMsg = '';
  pg.removeAllListeners('dialog'); pg.once('dialog', (d) => { seenMsg = d.message(); d.dismiss(); });
  await pg.evaluate(() => { document.querySelector('[data-file="import"]').value = ''; }); await pg.setInputFiles('[data-file="import"]', '/tmp/mk-good.json'); await pg.waitForTimeout(500);
  rec('Import', 'Existing data => overwrite warning shown (mentions replace + safety copy)', /replace|محل|تحذير|Warning/i.test(seenMsg) && /safety|أمان/.test(seenMsg), seenMsg.slice(0, 120));
  rec('Import', 'Cancelling keeps existing data untouched', (await stored()).responses.act1.a === 'Hair braiding');
  pg.once('dialog', (d) => d.accept());
  await pg.evaluate(() => { document.querySelector('[data-file="import"]').value = ''; }); await pg.setInputFiles('[data-file="import"]', '/tmp/mk-good.json'); await pg.waitForTimeout(600);
  const s2 = await stored(); const before = await pg.evaluate((k) => JSON.parse(localStorage.getItem(k + '.beforeImport') || 'null'), K);
  rec('Import', 'Accepting replaces data; success message shown', s2.responses.act1.a === 'Imported value' && s2.actionPlan[0].what === 'W' && (await pg.evaluate(() => document.querySelector('[data-o="msg"]').className.includes('ok'))));
  rec('Import', 'Safety copy of previous data kept (not silently discarded)', !!before && before.responses.act1.a === 'Hair braiding');
  await op('c02'); rec('Import', 'Imported values appear in the UI', await pg.evaluate(() => document.getElementById('act1_a').value === 'Imported value'));
  // report
  await op('data');
  const rep = await pg.evaluate(() => document.querySelector('.mk-report').innerText);
  rec('Report', 'Contains notice (not a certificate / no official ILO completion), progress, activity, assessment, plan, source', /not a certificate|ليس شهادة/.test(rep) && /Imported value/.test(rep) && /Assessment|التقييم/.test(rep) && /W/.test(rep) && /CC BY-SA/.test(rep) && /مراجعة ذاتية|Self-check/.test(rep));
  rec('Report', 'No certification/score/viability claims', !/certified|congratulations|viab(le|ility) score/i.test(rep.replace(/not a certificate[^.]*\./i, '')));
  const [pdf] = await Promise.all([pg.waitForEvent('download', { timeout: 20000 }), pg.click('[data-act="pdf"]')]);
  await pdf.saveAs('/tmp/mk-report.pdf'); const buf = fs.readFileSync('/tmp/mk-report.pdf');
  rec('Report', 'Saves a real PDF directly (no print dialog)', buf.slice(0, 4).toString() === '%PDF' && buf.length > 3000 && /IYB-Marketing-report-\d{4}/.test(pdf.suggestedFilename()), `${buf.length} bytes ${pdf.suggestedFilename()}`);
  // language
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Data page + report switch language and keep data', await pg.evaluate(() => SIYBMarketing.current() === 'data' && /Learner report|تقرير/.test(document.querySelector('.mk-report h2').textContent)));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  // reset: protected
  let n = 0; pg.removeAllListeners('dialog');
  pg.once('dialog', (d) => d.dismiss());
  await pg.click('[data-act="reset"]'); await pg.waitForTimeout(300);
  rec('Reset', 'Declining first confirmation erases nothing', (await stored()).responses.act1.a === 'Imported value');
  pg.on('dialog', async (d) => { n++; if (d.type() === 'confirm') await d.accept(); else await d.accept('wrong'); });
  await pg.click('[data-act="reset"]'); await pg.waitForTimeout(400);
  rec('Reset', 'Wrong confirmation word erases nothing', (await stored()).responses.act1.a === 'Imported value' && n >= 2);
  await pg.evaluate(() => localStorage.setItem('siyb.gyb.v1', '{"keep":1}'));
  pg.removeAllListeners('dialog'); pg.on('dialog', async (d) => { if (d.type() === 'confirm') await d.accept(); else await d.accept(/[a-z]/i.test(d.message()) && /ERASE/.test(d.message()) ? 'ERASE' : 'مسح'); });
  await pg.click('[data-act="reset"]'); await pg.waitForTimeout(500);
  rec('Reset', 'Correct word clears Marketing data (key removed, back to overview)', (await stored()) === null && await pg.evaluate(() => SIYBMarketing.current() === 'home'));
  rec('Reset', 'Other modules\' data untouched', await pg.evaluate(() => localStorage.getItem('siyb.gyb.v1') === '{"keep":1}'));
  await op('c02'); rec('Reset', 'Fields empty and progress reset after erase', await pg.evaluate(() => document.getElementById('act1_a').value === '' && document.querySelector('[data-st="act:act1"]').className.includes('notstarted')));
  // import into empty state: no warning
  pg.removeAllListeners('dialog'); let d2 = 0; pg.on('dialog', (d) => { d2++; d.dismiss(); });
  await op('data'); await pg.evaluate(() => { document.querySelector('[data-file="import"]').value = ''; }); await pg.setInputFiles('[data-file="import"]', '/tmp/mk-good.json'); await pg.waitForTimeout(500);
  rec('Import', 'Importing into empty state needs no overwrite warning and works', d2 === 0 && (await stored()).responses.act1.a === 'Imported value');
  // fallback
  const pf = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })).newPage();
  await pf.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await boot(pf); await pf.evaluate(() => SIYBMarketing.open('c02')); await pf.fill('#act1_a', 'mem only'); await pf.evaluate(() => SIYBMarketing.open('data')); await pf.waitForTimeout(300);
  rec('Fallback', 'Storage blocked: notice shown on data page, entries kept in memory', await pf.evaluate(() => !!document.querySelector('.mk-notice.warn') && SIYBMarketingStore.get('responses.act1.a') === 'mem only'));
  const [dl2] = await Promise.all([pf.waitForEvent('download'), pf.click('[data-act="export"]')]);
  await dl2.saveAs('/tmp/mk-mem.json'); rec('Fallback', 'Export still works from memory', JSON.parse(fs.readFileSync('/tmp/mk-mem.json', 'utf8')).data.responses.act1.a === 'mem only');
  // responsive
  for (const [nme, vp] of [['phone', { width: 390, height: 800 }], ['tablet', { width: 820, height: 1000 }]]) {
    const p2 = await (await browser.newContext({ viewport: vp })).newPage(); await boot(p2); await p2.evaluate(() => SIYBMarketing.open('data')); await p2.waitForTimeout(300);
    rec('Responsive', `${nme}: data page no horizontal overflow`, await p2.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  }
  rec('Console', 'No console/page errors (main flow)', errs.length === 0, errs.join(' | ').slice(0, 300));
  // offline
  const pw = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true })).newPage(); await pw.goto(URL_); await pw.waitForTimeout(2500);
  await pw.context().setOffline(true); await pw.reload().catch(() => {}); await pw.waitForTimeout(1500);
  await pw.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await pw.waitForTimeout(900);
  await pw.evaluate(() => SIYBMarketing.open('data')).catch(() => {}); await pw.waitForTimeout(300);
  rec('PWA', 'Offline: data page and report render; export works', await (async () => { try { const ok = await pw.evaluate(() => !!document.querySelector('.mk-report') && !!document.querySelector('[data-act="export"]')); const [d] = await Promise.all([pw.waitForEvent('download', { timeout: 5000 }), pw.click('[data-act="export"]')]); return ok && !!d; } catch (_) { return false; } })());
  rec('PWA', 'Cache v0.25.0 present', await pw.evaluate(async () => (await caches.keys()).some((k) => k.includes('v0.25.0'))).catch(() => false));
  await browser.close();
  results.forEach((r) => console.log(r.p ? 'PASS ' : 'FAIL ', `[${r.a}]`, r.n, !r.p && r.note ? ' — ' + r.note : ''));
  const f = results.filter((r) => !r.p).length; console.log(`\nPASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})();
