/* IYB Marketing QA – Stage 1 (navigation, dashboard, bilingual, storage foundation, regression of sibling modules).
 * Run: node tests/marketing-qa.js   (needs playwright, Chrome, and `python3 -m http.server 8123` from the repo root) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = [];
const rec = (area, name, pass, note) => results.push({ area, name, status: pass ? 'PASS' : 'FAIL', note: note || '' });
async function newPage(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'allow' });
  const pg = await ctx.newPage(); pg.errs = [];
  pg.on('pageerror', (e) => pg.errs.push(String(e)));
  pg.on('console', (m) => { if (m.type() === 'error') pg.errs.push(m.text()); });
  return pg;
}
const go = async (pg) => { await pg.goto(URL_); await pg.waitForTimeout(900); };
const head = async (pg, id) => { await pg.evaluate((t) => document.querySelector(`[data-tool-head="${t}"]`).click(), id); await pg.waitForTimeout(1000); };
const lang = async (pg, l) => { await pg.evaluate((x) => { localStorage.setItem('siyb-language', x); }, l); };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const pg = await newPage(browser, { width: 1280, height: 800 });
  await go(pg);
  const reg = await pg.evaluate(() => { const m = SIYBModules.get('marketing'); return { order: SIYBModules.list().map((x) => x.id).join(), group: m && m.group }; });
  rec('Registry', 'Marketing registered 4th, followed by Planning, under IYB', reg.order === 'gyb,costing,stock,marketing,planning' && reg.group === 'iyb', reg.order);
  await pg.click('.sidebar-group-head'); await pg.waitForTimeout(200);
  const iybOrder = await pg.evaluate(() => [...document.querySelector('[data-group="iyb"]').querySelectorAll('[data-tool-head]')].map((b) => b.dataset.toolHead).join());
  rec('Sidebar', 'IYB order Costing, Stock, Marketing, Planning', iybOrder === 'costing,stock,marketing,planning', iybOrder);
  await head(pg, 'marketing');
  const cards = await pg.evaluate(() => [...document.querySelectorAll('#mkRoot .mk-card')].map((c) => ({ no: c.querySelector('.mk-card-no').textContent, t: c.querySelector('.mk-card-title').textContent, d: c.querySelector('.mk-card-desc').textContent.length > 0, s: c.querySelector('.mk-status').textContent })));
  rec('Dashboard', 'Exactly eight cards', cards.length === 8, String(cards.length));
  const ad = (x) => x.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  rec('Dashboard', 'Card numbers 01..08 in order (Arabic digits normalised)', cards.map((c) => ad(c.no)).join() === '01,02,03,04,05,06,07,08', cards.map((c) => c.no).join());
  rec('Dashboard', 'Arabic titles match FRS', cards.map((c) => c.t).join('|') === 'المدخل والتقدم|التسويق وقوة الزبائن|تحديد مكانة المنتج|المنتج والسعر|المكان والترويج|المستخدمون وأساليب العمل|الأدلة المادية|التقييم وخطة العمل'.replace(/[0-9]/g, (d) => d), cards.map((c) => c.t).join('|'));
  rec('Dashboard', 'Every card has description and status', cards.every((c) => c.d && c.s));
  rec('Dashboard', 'All statuses "not started" (no interaction yet)', cards.every((c) => c.s === 'لم تبدأ'));
  rec('Dashboard', 'Body class mode-marketing + badge MK', await pg.evaluate(() => document.body.classList.contains('mode-marketing') && document.getElementById('workspaceBadgeNumber').textContent === 'MK'));
  rec('Dashboard', 'No manual learning content (no activities/inputs)', await pg.evaluate(() => document.querySelectorAll('#mkRoot input,#mkRoot textarea,#mkRoot select').length === 0));
  const subnav = await pg.evaluate(() => document.querySelectorAll('[data-nav-group="marketing"] [data-nav-item]').length);
  rec('Navigation', 'Sub-menu has 10 items (overview + 8 cards + data page)', subnav === 10, String(subnav));
  for (let i = 1; i <= 8; i++) {
    await pg.evaluate((n) => document.querySelectorAll('#mkRoot .mk-card')[n].click(), i - 1); await pg.waitForTimeout(150);
    const ok = await pg.evaluate((n) => { const c = SIYBMarketing.current(); return c === 'c0' + n && !!document.querySelector('#mkRoot .mk-panel') && document.querySelector('[data-nav-item="marketing-c0' + n + '"]').classList.contains('active'); }, i);
    rec('Navigation', `Card ${i} opens its view and highlights sub-menu`, ok);
    await pg.evaluate(() => document.querySelector('#mkRoot [data-id="home"]').click()); await pg.waitForTimeout(100);
    rec('Navigation', `Back from card ${i} returns to overview`, await pg.evaluate(() => SIYBMarketing.current() === 'home' && document.querySelectorAll('#mkRoot .mk-card').length === 8));
  }
  await pg.evaluate(() => SIYBMarketing.open('c05'));
  rec('Navigation', 'Card 05 title is Place & Promotion order (Part V then VI)', await pg.evaluate(() => document.querySelector('#mkRoot h2').textContent === 'المكان والترويج' && /الخامس.*السادس/.test(document.querySelector('.mk-cov').textContent)));
  rec('Navigation', 'Next/previous pager works', await pg.evaluate(() => { document.querySelector('.mk-pager .primary').click(); return SIYBMarketing.current() === 'c06'; }));
  // language
  await pg.evaluate(() => SIYBMarketing.open('home'));
  const ids = ['languageToggle', 'languageButton'];
  const sw = await pg.evaluate(() => { const b = document.querySelector('[data-language-toggle],#languageToggle,[data-lang-toggle],button[data-lang]'); return b ? (b.id || b.className) : null; });
  await pg.evaluate(() => { localStorage.setItem('siyb-language', 'en'); });
  await pg.reload(); await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(1000);
  const en = await pg.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, t: [...document.querySelectorAll('#mkRoot .mk-card-title')].map((x) => x.textContent), st: document.querySelector('.mk-status').textContent }));
  rec('Language', 'English: LTR + titles per FRS', en.dir === 'ltr' && en.lang === 'en' && en.t.join('|') === 'Introduction & Progress|Marketing & the Power of Customers|Positioning Your Product|Product & Price|Place & Promotion|People & Processes|Physical Evidence|Assessment & Action Plan', en.t.join('|'));
  rec('Language', 'English status label', en.st === 'Not started', en.st);
  // real language toggle (shell button) while a card is open: card kept, dir flips, text switches
  await pg.evaluate(() => SIYBMarketing.open('c03'));
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Real toggle EN→AR keeps the open card, RTL, Arabic title', await pg.evaluate(() => SIYBMarketing.current() === 'c03' && document.querySelector('#mkRoot h2').textContent === 'تحديد مكانة المنتج' && document.documentElement.dir === 'rtl'));
  await pg.click('#languageToggle'); await pg.waitForTimeout(500);
  rec('Language', 'Real toggle AR→EN keeps the open card, LTR, English title', await pg.evaluate(() => SIYBMarketing.current() === 'c03' && document.querySelector('#mkRoot h2').textContent === 'Positioning Your Product' && document.documentElement.dir === 'ltr'));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  // storage
  await pg.evaluate(() => SIYBMarketing.open('c04')); await pg.waitForTimeout(600);
  const st = await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('siyb.iyb.marketing.v1') || 'null'); return d && { m: d.moduleId, v: d.schemaVersion, keys: Object.keys(d).sort().join(), last: d.lastCard }; });
  rec('Storage', 'Namespaced key siyb.iyb.marketing.v1 with FRS shape', !!st && st.m === 'marketing' && st.v === 1 && ['actionPlan', 'language', 'moduleId', 'progress', 'responses', 'schemaVersion', 'updatedAt'].every((k) => st.keys.includes(k)), JSON.stringify(st));
  await pg.reload(); await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg.waitForTimeout(1000);
  rec('Storage', 'Last card restored after reload', await pg.evaluate(() => SIYBMarketing.current() === 'c04'));
  rec('Storage', 'Other modules\' keys untouched (no gyb/costing keys created by Marketing)', await pg.evaluate(() => !localStorage.getItem('siyb.gyb.v1')));
  await pg.evaluate(() => localStorage.setItem('siyb.iyb.marketing.v1', '{bad'));
  const pg2 = await pg.context().newPage(); await pg2.goto(URL_); await pg2.waitForTimeout(900);
  await pg2.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg2.waitForTimeout(1000);
  rec('Storage', 'Corrupt data: starts fresh and keeps a .unreadable copy', await pg2.evaluate(() => SIYBMarketing.current() === 'home' && localStorage.getItem('siyb.iyb.marketing.v1.unreadable') === '{bad'));
  const pg3 = await newPage(browser, { width: 1280, height: 800 });
  await pg3.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await pg3.goto(URL_); await pg3.waitForTimeout(900);
  await pg3.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()); await pg3.waitForTimeout(1000);
  rec('Storage', 'localStorage blocked: module still works + notice shown', await pg3.evaluate(() => document.querySelectorAll('#mkRoot .mk-card').length === 8 && !!document.querySelector('#mkRoot .mk-notice.warn')));
  // sibling modules
  for (const t of ['costing', 'stock']) {
    await head(pg, t);
    rec('Regression', `${t} opens after Marketing`, await pg.evaluate((x) => !document.body.classList.contains('mode-marketing') && (x === 'stock' ? document.body.classList.contains('mode-stock') : !document.body.classList.contains('mode-stock')) && document.getElementById('workspace').hidden === false, t));
  }
  await head(pg, 'gyb'); rec('Regression', 'GYB opens', await pg.evaluate(() => document.body.classList.contains('mode-gyb')));
  await head(pg, 'marketing'); rec('Regression', 'Marketing resumes last card', await pg.evaluate(() => SIYBMarketing.current() === 'c04'));
  // sidebar collapsed
  const collapse = await pg.evaluate(() => { const b = document.querySelector('#sidebarCollapse,[data-sidebar-toggle],.sidebar-collapse-btn,#sidebarToggle'); return b ? (b.id || b.className) : null; });
  rec('Sidebar', 'Collapse control located', !!collapse, String(collapse));
  // responsive
  for (const [n, vp] of [['desktop', { width: 1280, height: 800 }], ['tablet', { width: 820, height: 1000 }], ['phone', { width: 390, height: 800 }]]) {
    const p = await newPage(browser, vp); await go(p);
    await p.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await p.waitForTimeout(1100);
    const m = await p.evaluate(() => { const g = document.querySelector('.mk-grid'); const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length; return { cols, cards: document.querySelectorAll('.mk-card').length, overflow: document.documentElement.scrollWidth > window.innerWidth + 1 }; });
    rec('Responsive', `${n}: 8 cards, no horizontal overflow (cols=${m.cols})`, m.cards === 8 && !m.overflow, JSON.stringify(m));
    if (n === 'phone') rec('Responsive', 'phone: single column', m.cols === 1);
    if (n === 'desktop') rec('Responsive', 'desktop: multi-column', m.cols >= 3);
    await p.screenshot({ path: `/tmp/mk-${n}.png` });
    if (p.errs.length) rec('Console', `${n}: no console/page errors`, false, p.errs.join(' | ').slice(0, 200)); else rec('Console', `${n}: no console/page errors`, true);
  }
  rec('Console', 'main run: no console/page errors', pg.errs.length === 0, pg.errs.join(' | ').slice(0, 300));
  // PWA / offline
  const pw = await newPage(browser, { width: 1280, height: 800 }); await go(pw); await pw.waitForTimeout(2500);
  const swr = await pw.evaluate(async () => { const keys = await caches.keys(); const c = keys.find((k) => k.includes('v0.28.0')); if (!c) return { keys }; const reqs = await (await caches.open(c)).keys(); return { c, files: reqs.map((r) => r.url).filter((u) => /marketing/.test(u)).map((u) => u.split('/').pop()) }; });
  rec('PWA', 'Cache v0.28.0 holds the 4 Marketing files', !!swr.c && ['marketing.css','marketing-store.js','marketing-data.js','marketing.js'].every((f) => swr.files.includes(f)), JSON.stringify(swr));
  await pw.context().setOffline(true);
  await pw.reload().catch(() => {}); await pw.waitForTimeout(1500);
  await pw.evaluate(() => document.querySelector('[data-tool-head="marketing"]').click()).catch(() => {}); await pw.waitForTimeout(1200);
  rec('PWA', 'Offline: Marketing loads and shows 8 cards', await pw.evaluate(() => document.querySelectorAll('#mkRoot .mk-card').length === 8).catch(() => false));

  await browser.close();
  const p = results.filter((r) => r.status === 'PASS').length, f = results.filter((r) => r.status === 'FAIL');
  results.forEach((r) => console.log(r.status.padEnd(5), `[${r.area}]`, r.name, r.note && r.status === 'FAIL' ? ' — ' + r.note : ''));
  console.log(`\nPASSED ${p}  FAILED ${f.length}`);
  process.exit(f.length ? 1 : 0);
})();
