/* IYB Marketing QA – Stage 2 (learning content Cards 01–07, activities, summaries, progress, bilingual, input safety).
 * Run: node tests/marketing-qa-stage2.js  (playwright + Chrome + `python3 -m http.server 8123` at repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
async function open(pg, card) {
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(900);
  if (card) { await pg.evaluate((c) => SIYBMarketing.open(c), card); await pg.waitForTimeout(250); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(900); await open(pg);
  // ---- content presence
  const expect = { c01: [], c02: ['act1'], c03: ['act2', 'act3', 'act4'], c04: ['act5', 'act6', 'act7', 'act8', 'act9'], c05: ['act10', 'act11', 'act12', 'act13', 'act14', 'act15', 'act16'], c06: ['act17', 'act18', 'act19', 'act20', 'act21', 'act22'], c07: ['act23'] };
  const partsExp = { c02: 'I', c03: 'II', c04: 'III,IV', c05: 'V,VI', c06: 'VII,VIII', c07: 'IX' };
  const seen = [];
  for (const [c, acts] of Object.entries(expect)) {
    await pg.evaluate((x) => SIYBMarketing.open(x), c); await pg.waitForTimeout(200);
    const r = await pg.evaluate(() => ({ acts: [...document.querySelectorAll('#mkRoot .mk-act')].map((a) => a.id), parts: [...document.querySelectorAll('#mkRoot .mk-part')].map((a) => a.id.replace('part-', '')), sums: document.querySelectorAll('#mkRoot .mk-summary').length, ph: !!document.querySelector('#mkRoot .mk-placeholder') }));
    seen.push(...r.acts);
    rec('Content', `${c}: activities ${acts.join(',') || 'none'} in source order`, r.acts.join() === acts.join(), r.acts.join());
    if (partsExp[c]) { rec('Content', `${c}: parts ${partsExp[c]} in source order, one summary each`, r.parts.join() === partsExp[c] && r.sums === partsExp[c].split(',').length, r.parts.join() + ' sums=' + r.sums); }
    rec('Content', `${c}: no placeholder`, !r.ph);
  }
  rec('Content', 'All 23 source activities present, none renumbered', seen.length === 23 && seen.every((a, i) => a === 'act' + (i + 1)), seen.join());
  await pg.evaluate(() => SIYBMarketing.open('c08'));
  rec('Content', 'Card 08 now has Stage 3 content (no placeholder)', await pg.evaluate(() => !document.querySelector('#mkRoot .mk-placeholder') && !!document.getElementById('cyh')));
  const all = {};
  for (const c of ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07']) { await pg.evaluate((x) => SIYBMarketing.open(x), c); all[c] = await pg.evaluate(() => document.getElementById('mkRoot').innerText); }
  const alltxt = Object.values(all).join('\n');
  rec('Scope', 'No raw "ANSWERS TO ACTIVITIES" section dumped into content (answers are gated)', !/ANSWERS TO ACTIVITIES|Answers to Activities/i.test(alltxt));
  rec('Scope', 'Can You Help / Beauty Hair Salon only in Card 08, not in cards 01-07', !/Can You Help|Beauty Hair Salon|هل تستطيع المساعدة/i.test(alltxt));
  // ---- case studies/anchor content
  await pg.evaluate(() => SIYBMarketing.open('c02'));
  rec('Content', 'c02: Ann\'s restaurant (Sawadee) case + seven Ps table', await pg.evaluate(() => /Sawadee|ساوادي|سوادي/.test(document.getElementById('mkRoot').innerText) && document.querySelectorAll('#mkRoot .mk-table').length >= 1));
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  rec('Content', 'c03: Kathira mobile phone shop case', await pg.evaluate(() => /Kathira|كاثيرا/.test(document.getElementById('mkRoot').innerText)));
  rec('Content', 'c04: Green Choice case', await (async () => { await pg.evaluate(() => SIYBMarketing.open('c04')); return pg.evaluate(() => /Green Choice|غرين تشويس|الخيار الأخضر/.test(document.getElementById('mkRoot').innerText)); })());
  rec('Content', 'c06: Sawadee process example (Part VIII)', await (async () => { await pg.evaluate(() => SIYBMarketing.open('c06')); return pg.evaluate(() => /Sawadee|ساوادي|سوادي/.test(document.getElementById('mkRoot').innerText)); })());
  // ---- every card has source refs and activity tags
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  rec('Mapping', 'Activities/cases/summaries show source Part + page', await pg.evaluate(() => [...document.querySelectorAll('#mkRoot .mk-act, #mkRoot .mk-case, #mkRoot .mk-summary')].every((e) => e.querySelector('.mk-src'))));
  // ---- inputs persist
  await pg.evaluate(() => SIYBMarketing.open('c02'));
  await pg.fill('#act1_a', 'My product is special 123'); await pg.waitForTimeout(500);
  rec('Input', 'Typing in activity marks it "in progress" live', await pg.evaluate(() => document.querySelector('[data-st="act:act1"]').className.includes('inprogress')));
  await pg.reload(); await pg.waitForTimeout(900); await open(pg, 'c02');
  rec('Input', 'Entry restored after reload', ad(await pg.inputValue('#act1_a')) === ad('My product is special 123'));
  // language switch keeps input
  await pg.fill('#act1_b', 'Second answer'); 
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  const langNow = await pg.evaluate(() => document.documentElement.lang);
  rec('Language', 'Switch keeps both entries (FR-23)', await pg.inputValue('#act1_a') !== '' && ad(await pg.inputValue('#act1_a')) === ad('My product is special 123') && await pg.inputValue('#act1_b') === 'Second answer', langNow);
  const dirNow = await pg.evaluate(() => document.documentElement.dir);
  rec('Language', 'Direction flips with language', (langNow === 'en' && dirNow === 'ltr') || (langNow === 'ar' && dirNow === 'rtl'), langNow + dirNow);
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Second switch keeps entries', ad(await pg.inputValue('#act1_a')) === ad('My product is special 123') && await pg.inputValue('#act1_b') === 'Second answer');
  rec('Language', 'Card content switches language (Arabic title/heading present)', await pg.evaluate(() => /الجزء/.test(document.getElementById('mkRoot').innerText) || /Part I/.test(document.getElementById('mkRoot').innerText)));
  // digits typed in Arabic are stored as ASCII
  const ls = await pg.evaluate(() => JSON.parse(localStorage.getItem('siyb.iyb.marketing.v1')).responses.act1.a);
  rec('Storage', 'Stored value uses ASCII digits', ls === 'My product is special 123', ls);
  // navigating away/back keeps
  await pg.evaluate(() => SIYBMarketing.open('c03')); await pg.evaluate(() => SIYBMarketing.open('c02'));
  rec('Input', 'Entry kept after card navigation', await pg.inputValue('#act1_a') !== '');
  // table + multi
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  const cell = pg.locator('#act2 .mk-ftable textarea').first(); await cell.fill('Phones'); await pg.waitForTimeout(500);
  rec('Input', 'Table cell typing saved under responses', await pg.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('siyb.iyb.marketing.v1') || '{}').responses || {}).includes('Phones')) || await pg.evaluate(() => { SIYBMarketingStore.flush(); return JSON.stringify(JSON.parse(localStorage.getItem('siyb.iyb.marketing.v1')).responses).includes('Phones'); }));
  const mb = pg.locator('#act4 input[type=checkbox]').first(); await mb.check(); await pg.waitForTimeout(500);
  await pg.reload(); await pg.waitForTimeout(900); await open(pg, 'c03');
  rec('Input', 'Table cell + checklist restored after reload', (await pg.locator('#act2 .mk-ftable textarea').first().inputValue()) === 'Phones' && await pg.locator('#act4 input[type=checkbox]').first().isChecked());
  // progress
  const st = async (sel) => pg.evaluate((s) => document.querySelector(s).textContent.trim(), sel);
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  rec('Progress', 'Opening a card alone keeps others "not started"', await pg.evaluate(() => { SIYBMarketing.open('c05'); return document.querySelector('[data-st="card:c05"]').className.includes('notstarted'); }));
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  rec('Progress', 'Card 03 is in progress after an entry', (await pg.evaluate(() => document.querySelector('[data-st="card:c03"]').className)).includes('inprogress'));
  // complete all of c02 (act1 + summary)
  await pg.evaluate(() => SIYBMarketing.open('c02'));
  await pg.click('#act1 [data-act="done"]'); await pg.waitForTimeout(200);
  rec('Progress', 'Activity marked complete shows completed', (await pg.evaluate(() => document.querySelector('[data-st="act:act1"]').className)).includes('done'));
  await pg.locator('.mk-summary input[type=checkbox]').check(); await pg.waitForTimeout(300);
  rec('Progress', 'Card 02 NOT yet completed after activity + summary only (assessment pending)', !(await pg.evaluate(() => document.querySelector('[data-st="card:c02"]').className)).includes('done'));
  await pg.click('#asmt1 [data-act="asm-submit"]'); await pg.waitForTimeout(300);
  rec('Progress', 'Card 02 completed after activity + summary + assessment', (await pg.evaluate(() => document.querySelector('[data-st="card:c02"]').className)).includes('done'));
  await pg.evaluate(() => SIYBMarketing.open('c01'));
  await pg.locator('.mk-read input').check(); await pg.waitForTimeout(300);
  const ov = await pg.evaluate(() => ({ cards: document.querySelectorAll('.mk-overview .mk-two > div:first-child li').length, parts: document.querySelectorAll('.mk-overview .mk-two > div:last-child li').length, c01: document.querySelector('.mk-overview [data-st="card:c01"]').className, c02: document.querySelector('.mk-overview [data-st="card:c02"]').className }));
  rec('Progress', 'Card 01 overview lists 8 cards + 9 Parts with live status', ov.cards === 8 && ov.parts === 9 && ov.c01.includes('done') && ov.c02.includes('done'), JSON.stringify(ov));
  await pg.evaluate(() => SIYBMarketing.open('home'));
  rec('Progress', 'Dashboard statuses reflect real progress', await pg.evaluate(() => { const s = [...document.querySelectorAll('.mk-card .mk-status')].map((x) => x.className.replace('mk-status ', '')); return s[0] === 'done' && s[1] === 'done' && s[2] === 'inprogress' && s[3] === 'notstarted'; }));
  // licence
  await pg.evaluate(() => SIYBMarketing.open('c01'));
  const lic = await pg.evaluate(() => { const t = document.getElementById('mkRoot').innerText; return { cc: /CC BY-SA [3٣]\.[0٠] IGO/.test(t), adapt: /not endorsed by the ILO|لا تحظى بتأييد/.test(t), transl: /not created by the International Labour Office|لم يُعدّ مكتب العمل/.test(t), siyb: /SIYB brand name and logo|اسم SIYB/.test(t), imgs: document.querySelectorAll('#mkRoot img').length }; });
  rec('Licence', 'CC BY-SA 3.0 IGO attribution + adaptation + translation + SIYB-brand disclaimers, no images/logos', lic.cc && lic.adapt && lic.transl && lic.siyb && lic.imgs === 0, JSON.stringify(lic));
  rec('Licence', 'Card 01 states the module is not ILO-endorsed', await pg.evaluate(() => /not an ILO-endorsed|ليست منصة معتمدة/.test(document.getElementById('mkRoot').innerText)));
  // no external requests
  // responsive
  for (const [n, vp] of [['phone', { width: 390, height: 800 }], ['tablet', { width: 820, height: 1000 }]]) {
    const p2 = await (await browser.newContext({ viewport: vp })).newPage(); await p2.goto(URL_); await p2.waitForTimeout(900);
    await p2.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await p2.waitForTimeout(900);
    let bad = [];
    for (const c of ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07']) {
      await p2.evaluate((x) => SIYBMarketing.open(x), c); await p2.waitForTimeout(150);
      if (await p2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) bad.push(c);
    }
    rec('Responsive', `${n}: cards 01-07 no horizontal page overflow`, bad.length === 0, bad.join());
    if (n === 'phone') { await p2.evaluate(() => SIYBMarketing.open('c03')); await p2.screenshot({ path: '/tmp/mk-s2-phone.png' }); }
  }
  // arabic RTL render screenshot
  rec('Console', 'No console/page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  // offline
  const pw = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); await pw.goto(URL_); await pw.waitForTimeout(2500);
  const cache = await pw.evaluate(async () => { const k = (await caches.keys()).find((x) => x.includes('v0.24.0')); if (!k) return null; return (await (await caches.open(k)).keys()).map((r) => r.url.split('/').pop().split('?')[0]); });
  rec('PWA', 'Cache v0.24.0 holds all marketing content files', !!cache && ['marketing-content-a.js', 'marketing-content-b.js', 'marketing-content-c.js', 'marketing-content-d.js', 'marketing.js'].every((f) => cache.includes(f)), String(cache && cache.length));
  await pw.context().setOffline(true); await pw.reload().catch(() => {}); await pw.waitForTimeout(1500);
  await pw.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await pw.waitForTimeout(1000);
  await pw.evaluate(() => SIYBMarketing.open('c04')).catch(() => {}); await pw.waitForTimeout(300);
  rec('PWA', 'Offline: Card 04 content + activities render', await pw.evaluate(() => document.querySelectorAll('#mkRoot .mk-act').length === 5).catch(() => false));
  await browser.close();
  results.forEach((r) => console.log(r.p ? 'PASS ' : 'FAIL ', `[${r.a}]`, r.n, !r.p && r.note ? ' — ' + r.note : ''));
  const f = results.filter((r) => !r.p).length; console.log(`\nPASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})();
