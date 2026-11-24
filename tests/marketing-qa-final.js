/* IYB Marketing – Stage 5 final QA (end-to-end). Run: node tests/marketing-qa-final.js
 * Needs playwright + Chrome and `python3 -m http.server 8123` at the repo root. */
const { chromium } = require('playwright'); const fs = require('fs'); const vm = require('vm'); const path = require('path');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const K = 'siyb.iyb.marketing.v1';
/* ---------- static content integrity (no browser) ---------- */
(function staticChecks() {
  const w = {}; const dir = path.join(__dirname, '..', 'src', 'modules');
  ['marketing-data', 'marketing-content-a', 'marketing-content-b', 'marketing-content-c', 'marketing-content-d', 'marketing-assess-a', 'marketing-assess-b', 'marketing-card8', 'marketing-glossary'].forEach((f) => vm.runInNewContext(fs.readFileSync(path.join(dir, f + '.js'), 'utf8'), { window: w, console }));
  const texts = []; const walk = (o, p) => { if (o && typeof o === 'object') { if (typeof o.ar === 'string' && typeof o.en === 'string' && Object.keys(o).length <= 2 && !('t' in o) && !('v' in o)) texts.push({ p, ar: o.ar, en: o.en }); else for (const k in o) walk(o[k], p + '.' + k); } };
  ['SIYB_MK_CONTENT', 'SIYB_MK_ASSESS', 'SIYB_MK_ACT_ANSWERS', 'SIYB_MK_CARD8', 'SIYB_MK_GLOSSARY'].forEach((k) => walk(w[k], k));
  rec('Content', `Bilingual texts: ${texts.length} strings, none empty in either language`, texts.length > 800 && texts.every((t) => t.ar.trim() && t.en.trim()), String(texts.length));
  const noAr = texts.filter((t) => /[A-Za-z]{4,}/.test(t.en) && !/[؀-ۿ]/.test(t.ar) && t.ar.replace(/[^\u0000-\u007F]/g, '').length === t.ar.length && !/^[\d\s.,%$:;()\-–/]+$/.test(t.ar));
  rec('Content', 'Every English text has Arabic letters in its Arabic twin (no untranslated strings)', noAr.length === 0, noAr.slice(0, 3).map((t) => t.p).join(' | '));
  const bad = texts.filter((t) => /undefined|\[object|\bNaN\b|\bTODO\b|lorem ipsum/i.test(t.ar + t.en)); rec('Content', 'No placeholder artefacts (undefined/TODO/lorem/[object])', bad.length === 0, bad.slice(0, 3).map((t) => t.p).join(' | '));
  const acts = []; Object.values(w.SIYB_MK_CONTENT).forEach((c) => c.parts.forEach((p) => p.blocks.filter((b) => b.t === 'activity').forEach((b) => acts.push(b.no))));
  rec('Content', 'Activities 1–23 each exactly once, in order, source IDs kept', acts.join() === Array.from({ length: 23 }, (_, i) => i + 1).join(), acts.join());
  const parts = []; ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].forEach((c) => w.SIYB_MK_CONTENT[c].parts.forEach((p) => parts.push(p.id)));
  rec('Content', 'Nine source Parts I–IX in source order across Cards 02–07 (Place before Promotion)', parts.join() === 'I,II,III,IV,V,VI,VII,VIII,IX', parts.join());
  rec('Content', 'Every Part has a summary block with source page', ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].every((c) => w.SIYB_MK_CONTENT[c].parts.every((p) => p.blocks.some((b) => b.t === 'summary' && b.src))));
  const A = Object.values(w.SIYB_MK_ASSESS); rec('Content', 'Nine assessments, one per Part, with answer-source pages', A.length === 9 && A.every((a) => a.answerSrc && a.src) && A.map((a) => a.part).join() === 'I,II,III,IV,V,VI,VII,VIII,IX', A.map((a) => a.part).join());
  rec('Content', 'Card 08: 10 Can-You-Help tasks with 10 model answers, 4-column plan, 21 glossary terms', w.SIYB_MK_CARD8.cyh.tasks.length === 10 && Object.keys(w.SIYB_MK_CARD8.cyh.model).length === 10 && w.SIYB_MK_CARD8.plan.cols.length === 4 && w.SIYB_MK_GLOSSARY.length === 21);
  const optDigits = []; const chk = (o) => { if (o && typeof o === 'object') { if (typeof o.v === 'string' && /\d/.test(o.v)) optDigits.push(o.v); for (const k in o) chk(o[k]); } }; chk(w.SIYB_MK_CONTENT); chk(w.SIYB_MK_ASSESS);
  rec('Content', 'All option values are letters (safe from Arabic-digit rewriting)', optDigits.length === 0);
  // protected modules untouched
  const { execSync } = require('child_process');
  try {
    const d = execSync('git diff 3324ace..HEAD --name-only -- src/modules/business-costing.js src/modules/business-costing-ui.js src/modules/training.js src/modules/purchasing-stock.js src/modules/purchasing-stock-ui.js src/modules/gyb.js src/modules/gyb-data.js src/modules/gyb-store.js src/modules/report-pdf.js src/modules/arabic-pdf.js styles/gyb.css', { cwd: path.join(__dirname, '..') }).toString().trim();
    rec('Regression', 'Protected files (Costing, Stock, GYB, report-pdf; shell CSS excluded: intentionally changed by PR #36) byte-identical since pre-Marketing commit 3324ace', d === '', d);
  } catch (e) { rec('Regression', 'Protected-file diff vs 3324ace could not be run', false, String(e).slice(0, 100)); }
  const regs = fs.readFileSync(path.join(dir, 'registry.js'), 'utf8'); rec('Licence', 'No ILO/SIYB logo asset added (no image files in the Marketing change)', !execSync('git diff 3324ace..HEAD --name-only', { cwd: path.join(__dirname, '..') }).toString().split('\n').some((f) => /\.(png|jpe?g|svg|gif|webp|ico)$/i.test(f)));
})();
const lum = (h) => { h = h.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const pg = await ctx.newPage();
  const errs = []; const ext = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('request', (r) => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1'].includes(u.hostname) && !/^(data|blob):/.test(u.protocol)) ext.push(r.url()); });
  const boot = async (p) => { await p.goto(URL_); await p.waitForTimeout(900); await p.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await p.waitForTimeout(900); };
  const op = async (c) => { await pg.evaluate((x) => SIYBMarketing.open(x), c); await pg.waitForTimeout(150); };
  const store = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), K);
  await boot(pg);
  const CARD_PARTS = { c01: '', c02: 'I', c03: 'II', c04: 'III,IV', c05: 'V,VI', c06: 'VII,VIII', c07: 'IX', c08: '' };
  /* ---------- both languages: every card ---------- */
  for (const L of ['ar', 'en']) {
    const cur = await pg.evaluate(() => document.documentElement.lang);
    if (cur !== L) { await pg.click('#languageToggle'); await pg.waitForTimeout(500); }
    const dirOk = await pg.evaluate((l) => document.documentElement.lang === l && document.documentElement.dir === (l === 'ar' ? 'rtl' : 'ltr'), L);
    rec('Language', `${L.toUpperCase()}: html lang/dir correct (${L === 'ar' ? 'RTL' : 'LTR'})`, dirOk);
    for (const [c, parts] of Object.entries(CARD_PARTS)) {
      await op(c);
      const r = await pg.evaluate(() => { const t = document.getElementById('mkRoot').innerText; const ps = [...document.querySelectorAll('#mkRoot .mk-part')].map((x) => x.id.replace('part-', '')); const hs = [...document.querySelectorAll('#mkRoot h2,#mkRoot h3,#mkRoot h4,#mkRoot h5')].map((h) => +h.tagName[1]); let skip = false; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skip = true; const bad = /undefined|\[object|NaN|\{[0-9]/.test(t); const unl = [...document.querySelectorAll('#mkRoot input:not([type=hidden]):not([type=file]),#mkRoot select,#mkRoot textarea')].filter((el) => { if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false; if (el.id && document.querySelector(`label[for="${el.id}"]`)) return false; if (el.closest('label')) return false; if (el.closest('fieldset') && el.closest('fieldset').querySelector('legend')) return false; return true; }).length; return { h2: document.querySelector('#mkRoot h2') && document.querySelector('#mkRoot h2').textContent.trim().length > 0, ps: ps.filter((x) => x && x !== 'intro' && x !== 'review').join(), skip, bad, unl, sts: [...document.querySelectorAll('#mkRoot .mk-status')].every((s) => s.textContent.trim().length > 0), ov: document.documentElement.scrollWidth > innerWidth + 1 }; });
      const okParts = c === 'c08' ? true : r.ps === parts;
      rec(`Cards ${L}`, `${c}: title, parts [${parts || '—'}], no artefacts, no heading-level skips, all inputs labelled, status text on badges, no overflow`, r.h2 && okParts && !r.skip && !r.bad && r.unl === 0 && r.sts && !r.ov, JSON.stringify(r));
    }
  }
  if ((await pg.evaluate(() => document.documentElement.lang)) !== 'ar') { await pg.click('#languageToggle'); await pg.waitForTimeout(400); }
  /* ---------- fill ALL 23 activities, all assessments, Card 08 via the real UI ---------- */
  const fillCard = async (c) => {
    await op(c);
    const acts = await pg.evaluate(() => [...document.querySelectorAll('#mkRoot .mk-act[id^="act"]')].map((a) => a.id)); const done = [];
    for (const id of acts) {
      const sel = '#' + id;
      for (const el of await pg.locator(`${sel} textarea, ${sel} input[type=text]`).elementHandles()) await el.fill('Test entry 42');
      const groups = await pg.evaluate((s) => [...new Set([...document.querySelectorAll(s + ' input[type=radio]')].map((r) => r.name))].map((n) => ({ name: n })), sel);
      for (const g of groups) { await pg.locator(`${sel} input[name="${g.name}"]`).first().check(); }
      const multis = await pg.locator(`${sel} input[type=checkbox]`).elementHandles(); for (const m of multis) await m.check();
      await pg.click(`${sel} [data-act="done"]`); done.push(id);
    }
    const asm = await pg.evaluate(() => [...document.querySelectorAll('#mkRoot .mk-asm')].map((a) => a.id));
    for (const id of asm) {
      const sel = '#' + id;
      for (const s of await pg.locator(`${sel} select`).elementHandles()) { const vals = await s.evaluate((e) => [...e.options].map((o) => o.value).filter(Boolean)); await s.selectOption(vals[0]); }
      const names = await pg.evaluate((s) => [...new Set([...document.querySelectorAll(s + ' input[type=radio]')].map((r) => r.name))], sel);
      for (const n of names) await pg.locator(`${sel} input[name="${n}"]`).first().check();
      for (const t of await pg.locator(`${sel} textarea`).elementHandles()) await t.fill('Open answer 7');
      await pg.click(`${sel} [data-act="asm-submit"]`);
    }
    const sums = await pg.locator('.mk-summary input[type=checkbox]').elementHandles(); for (const s of sums) await s.check();
    return { done, asm };
  };
  const all = { acts: [], asm: [] };
  for (const c of ['c02', 'c03', 'c04', 'c05', 'c06', 'c07']) { const r = await fillCard(c); all.acts.push(...r.done); all.asm.push(...r.asm); }
  rec('E2E', 'All 23 activities filled through the UI', all.acts.length === 23, String(all.acts.length));
  rec('E2E', 'All 9 assessments submitted through the UI', all.asm.length === 9, all.asm.join());
  await op('c01'); await pg.locator('.mk-read input').check();
  await op('c08');
  for (let i = 1; i <= 10; i++) await pg.fill('#cyh_t' + i, 'Advice ' + i);
  await pg.click('#cyh [data-act="done"]');
  for (let r = 0; r < 4; r++) for (const k of ['what', 'how', 'who', 'when']) await pg.fill(`#plan textarea[data-ap="${r}"][data-apk="${k}"]`, `row${r} ${k}`);
  await pg.click('#plan [data-act="done"]'); await pg.waitForTimeout(600);
  await op('home');
  const sts = await pg.evaluate(() => [...document.querySelectorAll('.mk-card .mk-status')].map((s) => s.className.replace('mk-status ', '')));
  rec('E2E', 'Dashboard: all 8 cards "completed" after full work-through', sts.length === 8 && sts.every((s) => s === 'done'), sts.join());
  const sv = await store(); rec('E2E', 'Saved data holds 23 activity responses + 9 assessments + plan rows + ten CYH answers', Object.keys(sv.responses).filter((k) => /^act\d+$/.test(k)).length === 23 && Object.keys(sv.responses).filter((k) => /^asmt\d$/.test(k)).length === 9 && sv.actionPlan.length === 4 && Object.keys(sv.responses.cyh).length === 10, Object.keys(sv.responses).length + ' keys, ' + JSON.stringify(sv).length + ' bytes');
  /* ---------- persistence, language, export/import round trip ---------- */
  await pg.reload(); await boot(pg);
  const sv2 = await store(); rec('Persistence', 'Reload: stored data identical (nothing lost)', JSON.stringify(sv2.responses) === JSON.stringify(sv.responses) && JSON.stringify(sv2.progress) === JSON.stringify(sv.progress));
  await op('home'); rec('Persistence', 'Reload: dashboard still shows 8 completed', await pg.evaluate(() => [...document.querySelectorAll('.mk-card .mk-status')].every((s) => s.className.includes('done'))));
  await op('c05'); await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Switching language with full data keeps every entry (Card 05: 7 activities, 2 assessments)', await pg.evaluate(() => [...document.querySelectorAll('#mkRoot .mk-act[id^="act"] textarea, #mkRoot .mk-act[id^="act"] input[type=text]')].every((e) => e.value.length > 0) && document.querySelectorAll('#mkRoot .mk-asm .mk-result').length === 2));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  await op('data'); const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('[data-act="export"]')]); await dl.saveAs('/tmp/mk-final.json');
  pg.on('dialog', async (d) => { if (d.type() === 'confirm') await d.accept(); else await d.accept(/ERASE/.test(d.message()) ? 'ERASE' : 'مسح'); });
  await pg.click('[data-act="reset"]'); await pg.waitForTimeout(500);
  rec('RoundTrip', 'Erase clears everything', (await store()) === null);
  await op('data'); await pg.evaluate(() => { document.querySelector('[data-file="import"]').value = ''; }); await pg.setInputFiles('[data-file="import"]', '/tmp/mk-final.json'); await pg.waitForTimeout(600);
  const sv3 = await store(); rec('RoundTrip', 'Export → erase → import restores identical responses, progress and plan', !!sv3 && JSON.stringify(sv3.responses) === JSON.stringify(sv.responses) && JSON.stringify(sv3.progress) === JSON.stringify(sv.progress) && JSON.stringify(sv3.actionPlan) === JSON.stringify(sv.actionPlan));
  await op('home'); rec('RoundTrip', 'After import the dashboard again shows 8 completed', await pg.evaluate(() => [...document.querySelectorAll('.mk-card .mk-status')].every((s) => s.className.includes('done'))));
  await op('data');
  const [pdf] = await Promise.all([pg.waitForEvent('download', { timeout: 30000 }), pg.click('[data-act="pdf"]')]); await pdf.saveAs('/tmp/mk-final.pdf'); const buf = fs.readFileSync('/tmp/mk-final.pdf');
  rec('Report', 'Full-data PDF report saved (valid PDF)', buf.slice(0, 4).toString() === '%PDF' && buf.length > 10000, buf.length + ' bytes');
  const rt = (await pg.evaluate(() => document.querySelector('.mk-report').innerText)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); rec('Report', 'Report lists completed work: 23 activities, 9 assessments, action plan rows', (rt.match(/\(مكتملة\)|\(Completed\)/g) || []).length >= 32 && /row0\s+what/.test(rt) && /row3\s+when/.test(rt), String((rt.match(/\(مكتملة\)|\(Completed\)/g) || []).length) + ' | ' + JSON.stringify(rt.slice(rt.indexOf('row0') - 30, rt.indexOf('row0') + 60)));
  /* ---------- keyboard, focus, contrast ---------- */
  await op('home'); await pg.evaluate(() => document.querySelector('.mk-card').focus()); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  rec('A11y', 'Keyboard: Enter on a focused card opens it', await pg.evaluate(() => SIYBMarketing.current() === 'c01'));
  await pg.keyboard.press('Tab'); const fo = await pg.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, outline: cs.outlineStyle + ' ' + cs.outlineWidth }; });
  rec('A11y', 'Focused control has a visible focus indicator', fo.outline && !/^none/.test(fo.outline), JSON.stringify(fo));
  rec('A11y', 'Contrast: black on brand blue ≥ 4.5 and body text on white ≥ 4.5', ratio('#111111', '#24A8E0') >= 4.5 && ratio('#2a4656', '#ffffff') >= 4.5 && ratio('#415a68', '#fffaf3') >= 4.5, ratio('#111111', '#24A8E0').toFixed(2));
  rec('A11y', 'Primary buttons use dark text (not white on blue)', await (async () => { await op('c02'); return pg.evaluate(() => { const b = document.querySelector('#mkRoot .mk-btn.primary'); return !b || getComputedStyle(b).color === 'rgb(17, 17, 17)'; }); })());
  /* ---------- sidebar expanded / collapsed ---------- */
  await pg.evaluate(() => { document.body.classList.remove('sidebar-collapsed'); }); await op('home');
  const exp = await pg.evaluate(() => ({ nav: document.querySelectorAll('[data-nav-group="marketing"] .global-nav-item').length, vis: !!document.querySelector('[data-tool-head="marketing"]').offsetParent }));
  rec('Sidebar', 'Expanded: Marketing head + 10 sub-items present', exp.nav === 10 && exp.vis, JSON.stringify(exp));
  await pg.click('#sidebarToggle'); await pg.waitForTimeout(500);
  const col = await pg.evaluate(() => ({ c: document.body.classList.contains('sidebar-collapsed'), cards: document.querySelectorAll('.mk-card').length, ov: document.documentElement.scrollWidth > innerWidth + 1 }));
  rec('Sidebar', 'Collapsed: module stays usable (8 cards, no overflow)', col.c && col.cards === 8 && !col.ov, JSON.stringify(col));
  await op('c03'); rec('Sidebar', 'Collapsed: card content + activities render', await pg.evaluate(() => document.querySelectorAll('#mkRoot .mk-act').length === 3));
  await pg.click('#sidebarToggle'); await pg.waitForTimeout(500); rec('Sidebar', 'Re-expand restores sidebar', await pg.evaluate(() => !document.body.classList.contains('sidebar-collapsed')));
  /* ---------- IYB module navigation + sibling modules ---------- */
  const order = []; for (const t of ['costing', 'stock', 'marketing', 'gyb', 'marketing', 'costing']) { await pg.evaluate((x) => document.querySelector(`[data-tool-head="${x}"]`).click(), t); await pg.waitForTimeout(800); order.push(await pg.evaluate(() => [...document.body.classList].filter((c) => c.startsWith('mode-')).join())); }
  rec('Regression', 'Switching Costing → Stock → Marketing → GYB → Marketing → Costing sets the right mode each time', order.join('|').includes('mode-stock') && order[2].includes('mode-marketing') && order[3].includes('mode-gyb') && order[4].includes('mode-marketing') && !order[5].includes('mode-marketing'), order.join(' | '));
  rec('Regression', 'Costing renders its calculator after the round of switching', await pg.evaluate(() => !!document.getElementById('workspace') && document.querySelectorAll('input').length > 3 && !document.body.classList.contains('mode-marketing')));
  rec('Regression', 'Marketing data intact after visiting other modules', (await store()) && JSON.stringify((await store()).responses) === JSON.stringify(sv.responses));
  /* ---------- responsive: all 8 cards + data page ---------- */
  for (const [n, vp] of [['phone 390', { width: 390, height: 800 }], ['phone 360', { width: 360, height: 740 }], ['tablet 820', { width: 820, height: 1000 }], ['desktop 1440', { width: 1440, height: 900 }]]) {
    const p2 = await (await browser.newContext({ viewport: vp })).newPage(); await boot(p2); const bad = [];
    for (const c of ['home', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'data']) { await p2.evaluate((x) => SIYBMarketing.open(x), c); await p2.waitForTimeout(100); if (await p2.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) bad.push(c); }
    const cols = await p2.evaluate(() => { SIYBMarketing.open('home'); return getComputedStyle(document.querySelector('.mk-grid')).gridTemplateColumns.split(' ').length; });
    rec('Responsive', `${n}: dashboard ${cols} column(s); no horizontal overflow on any Marketing page`, bad.length === 0, bad.join());
    const tt = await p2.evaluate(() => { SIYBMarketing.open('c02'); const b = [...document.querySelectorAll('#mkRoot button, #mkRoot a')].filter((x) => x.offsetParent); const small = b.filter((x) => { const r = x.getBoundingClientRect(); return r.height < 28; }).length; return { n: b.length, small }; });
    rec('Responsive', `${n}: interactive controls ≥ 28px tall (${tt.small} smaller of ${tt.n})`, tt.small === 0, JSON.stringify(tt));
  }
  rec('Network', 'No external (non-localhost) requests during the whole run', ext.length === 0, ext.slice(0, 3).join(' '));
  rec('Console', 'No console or page errors during the whole run', errs.length === 0, errs.join(' | ').slice(0, 300));
  /* ---------- offline: full module ---------- */
  const pw = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true })).newPage(); await pw.goto(URL_); await pw.waitForTimeout(3000);
  const cache = await pw.evaluate(async () => { const k = (await caches.keys()).find((x) => /^siyb-workshop-shell-v/.test(x)); const urls = (await (await caches.open(k)).keys()).map((r) => r.url.split('/').pop().split('?')[0]); return { k, urls }; });
  const need = ['marketing.js', 'marketing-store.js', 'marketing-data.js', 'marketing-content-a.js', 'marketing-content-b.js', 'marketing-content-c.js', 'marketing-content-d.js', 'marketing-assess-a.js', 'marketing-assess-b.js', 'marketing-card8.js', 'marketing-glossary.js', 'marketing.css'];
  rec('PWA', `Cache ${cache.k} holds all ${need.length} Marketing assets`, need.every((f) => cache.urls.includes(f)), need.filter((f) => !cache.urls.includes(f)).join());
  rec('PWA', 'Cache version is consistent (index.html, app.js, service-worker.js all 0.26.0 or the same version)', await (async () => { const v = (f) => (fs.readFileSync(path.join(__dirname, '..', f), 'utf8').match(/0\.\d+\.0/g) || []); const sets = ['index.html', 'src/app.js', 'service-worker.js'].map((f) => [...new Set(v(f))].join()); return new Set(sets).size === 1; })(), '');
  await pw.context().setOffline(true); await pw.reload().catch(() => {}); await pw.waitForTimeout(1500);
  await pw.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await pw.waitForTimeout(900);
  const offl = []; for (const c of ['home', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'data']) { await pw.evaluate((x) => SIYBMarketing.open(x), c).catch(() => {}); await pw.waitForTimeout(120); offl.push(await pw.evaluate(() => document.querySelectorAll('#mkRoot h2').length > 0).catch(() => false)); }
  rec('PWA', 'Offline: all 8 cards + data page render', offl.every(Boolean), offl.join());
  await pw.evaluate(() => SIYBMarketing.open('c02')).catch(() => {}); await pw.fill('#act1_a', 'offline entry').catch(() => {}); await pw.waitForTimeout(500);
  rec('PWA', 'Offline: entries still saved', await pw.evaluate((k) => (JSON.parse(localStorage.getItem(k) || '{}').responses || {}).act1 && JSON.parse(localStorage.getItem(k)).responses.act1.a === 'offline entry', K).catch(() => false));
  const t0 = Date.now(); await pw.evaluate(() => SIYBMarketing.open('c05')).catch(() => {}); const dt = Date.now() - t0;
  rec('Perf', `Card 05 (largest) renders in ${dt} ms`, dt < 800, String(dt));
  await browser.close();
  results.forEach((r) => console.log(r.p ? 'PASS ' : 'FAIL ', `[${r.a}]`, r.n, !r.p && r.note ? ' — ' + r.note : ''));
  const f = results.filter((r) => !r.p).length; console.log(`\nPASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})();
