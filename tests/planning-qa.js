/* IYB Planning QA – Phase 1 (registration, shell, storage isolation, bilingual landing, regression of sibling modules).
 * Run: node tests/planning-qa.js   (needs playwright, Chrome, and `python3 -m http.server 8123` from the repo root) */
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
const head = async (pg, id) => { await pg.evaluate((t) => document.querySelector(`[data-tool-head="${t}"]`).click(), id); await pg.waitForTimeout(800); };
const ad = (x) => x.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const pg = await newPage(browser, { width: 1280, height: 800 });
  await go(pg);
  const reg = await pg.evaluate(() => { const m = SIYBModules.get('planning'); return { order: SIYBModules.list().map((x) => x.id).join(), group: m && m.group, g: m && m.external.global }; });
  rec('Registry', 'Planning registered 5th under IYB', reg.order === 'gyb,costing,stock,marketing,planning' && reg.group === 'iyb' && reg.g === 'SIYBPlanning', reg.order);
  // Lazy loading, deterministic: (1) not loaded at DOMContentLoaded; (2) with idle preload disabled and no hover it stays
  // unloaded and requests nothing; (3) pointer-over the sidebar head loads it; (4) it is mounted only on opening.
  {
    const lz = await newPage(browser, { width: 1280, height: 800 });
    const NSC = await (async () => { const t = await newPage(browser, { width: 800, height: 600 }); await t.goto(URL_); const n = await t.evaluate(() => SIYBModules.get('planning').external.scripts.length); await t.context().close(); return n; })();
    const reqs = []; lz.on('request', (r) => { if (/\/planning[^/]*\.(js|css)/.test(r.url()) && /\.js/.test(r.url())) reqs.push(r.url().split('/').pop().split('?')[0]); });
    await lz.addInitScript(() => { window.requestIdleCallback = () => 0; });
    await lz.goto(URL_, { waitUntil: 'load' }); await lz.waitForTimeout(2200);
    const a = await lz.evaluate(() => ({ g: typeof window.SIYBPlanning, s: typeof window.SIYBPlanningStore, root: !!document.querySelector('#pypRoot') }));
    rec('Lazy loading', 'Without idle preload or hover Planning is NOT loaded and no planning script is requested', a.g === 'undefined' && a.s === 'undefined' && !a.root && reqs.length === 0, JSON.stringify(a) + ' reqs=' + reqs.join());
    await lz.click('.sidebar-group-head'); await lz.waitForTimeout(200);
    await lz.hover('[data-tool-head="planning"]'); await lz.waitForTimeout(1200);
    const b = await lz.evaluate(() => ({ g: typeof window.SIYBPlanning, root: !!document.querySelector('#pypRoot'), nav: document.querySelectorAll('[data-nav-group="planning"] [data-nav-item]').length }));
    rec('Lazy loading', 'Hover preloads all registered scripts (each once) but does not mount the module', b.g === 'object' && !b.root && b.nav === 0 && reqs.length === NSC && new Set(reqs).size === NSC && NSC >= 9, JSON.stringify(b) + ' reqs=' + reqs.join());
    await lz.evaluate(() => document.querySelector('[data-tool-head="planning"]').click()); await lz.waitForTimeout(800);
    const c = await lz.evaluate(() => ({ root: !!document.querySelector('#pypRoot .pyp-card'), nav: document.querySelectorAll('[data-nav-group="planning"] [data-nav-item]').length }));
    rec('Lazy loading', 'Opening mounts the module and builds its sub-menu without re-requesting scripts', c.root && c.nav === 8 && reqs.length === NSC, JSON.stringify(c) + ' reqs=' + reqs.length);
    await lz.context().close();
    const ld = await newPage(browser, { width: 1280, height: 800 });
    await ld.goto(URL_, { waitUntil: 'domcontentloaded' });
    rec('Lazy loading', 'Not loaded at DOMContentLoaded', await ld.evaluate(() => typeof window.SIYBPlanning) === 'undefined');
    await ld.waitForFunction(() => typeof window.SIYBPlanning === 'object', null, { timeout: 8000 }).then(() => rec('Lazy loading', 'Idle preload eventually loads it without mounting', true), () => rec('Lazy loading', 'Idle preload eventually loads it without mounting', false));
    await ld.context().close();
  }
  const welcome = await pg.evaluate(() => [...document.querySelectorAll('[data-welcome-tool]')].map((b) => b.dataset.welcomeTool).join());
  rec('Welcome', 'Welcome page lists Planning automatically', welcome.includes('planning'), welcome);
  await pg.click('.sidebar-group-head'); await pg.waitForTimeout(200);
  const iybOrder = await pg.evaluate(() => [...document.querySelector('[data-group="iyb"]').querySelectorAll('[data-tool-head]')].map((b) => b.dataset.toolHead).join());
  rec('Sidebar', 'IYB order Costing, Stock, Marketing, Planning', iybOrder === 'costing,stock,marketing,planning', iybOrder);
  const before = await pg.evaluate(() => Object.keys(localStorage).sort().join());
  await head(pg, 'planning');
  rec('Shell', 'Body class mode-planning + badge PL + #pypRoot', await pg.evaluate(() => document.body.classList.contains('mode-planning') && document.getElementById('workspaceBadgeNumber').textContent === 'PL' && !!document.querySelector('#pypRoot.pyp-root')));
  const subnav = await pg.evaluate(() => [...document.querySelectorAll('[data-nav-group="planning"] [data-nav-item]')].map((b) => b.dataset.section).join());
  rec('Navigation', 'Sub-menu: overview, Parts I–V, end, data', subnav === 'home,p1,p2,p3,p4,p5,end,data', subnav);
  const cards = await pg.evaluate(() => [...document.querySelectorAll('#pypRoot .pyp-card')].map((c) => c.querySelector('.pyp-card-title').textContent));
  rec('Landing', 'Six journey cards (5 parts + end of manual)', cards.length === 6, String(cards.length));
  rec('Landing', 'Arabic titles of the five parts', cards.slice(0, 5).join('|') === 'التخطيط للمستقبل|إجراء تحليل لمشروعك|توقّع التغيّرات في البيئة الخارجية|إدارة المخاطر|إعداد الخطط', cards.join('|'));
  rec('Landing', 'Five plans listed', (await pg.$$('#pypRoot .pyp-plans li')).length === 5);
  const txt = await pg.evaluate(() => document.querySelector('#pypRoot').innerText);
  rec('Attribution', 'CC BY-SA, adaptation and translation disclaimers, preliminary-translation note', /CC BY-SA/.test(txt) && /تكييف لعمل أصلي/.test(txt) && /الترجمة لم يُعدّها/.test(txt) && /ترجمة أولية/.test(txt));
  rec('Attribution', 'No ILO/SIYB logo images in module', await pg.evaluate(() => document.querySelectorAll('#pypRoot img,#pypRoot svg').length === 0));
  rec('Scope', 'No inputs, activities or assessments in Phase 1', await pg.evaluate(() => document.querySelectorAll('#pypRoot input,#pypRoot textarea,#pypRoot select').length === 0));
  await pg.evaluate(() => document.querySelectorAll('#pypRoot .pyp-card')[4].click()); await pg.waitForTimeout(200);
  const p5 = await pg.evaluate(() => ({ cur: SIYBPlanning.current(), ex: document.querySelectorAll('#pypRoot [id^="pypEx-a"]').length, as: !!document.querySelector('#pypAs-a5') }));
  rec('Section view', 'Part V (live since Phase 5) shows Activities 7–20 and Assessment 5', p5.cur === 'p5' && p5.ex === 14 && p5.as, JSON.stringify(p5));
  const acts = await pg.evaluate(() => SIYB_PYP_DATA.SECTIONS.filter((s) => s.activities).map((s) => s.id + ':' + s.activities + '/' + s.assessment).join());
  rec('Source fidelity', 'Activity/assessment mapping 1 | 2–3 | 4–5 | 6 | 7–20', acts === 'p1:1/1,p2:2–3/2,p3:4–5/3,p4:6/4,p5:7–20/5', acts);
  // storage isolation
  await pg.waitForTimeout(600);
  const after = await pg.evaluate(() => ({ keys: Object.keys(localStorage).sort(), raw: JSON.parse(localStorage.getItem('siyb.iyb.planning.v1') || 'null') }));
  rec('Storage', 'Only siyb.iyb.planning.v1 added', after.keys.filter((k) => !before.split(',').includes(k)).join() === 'siyb.iyb.planning.v1', after.keys.join());
  rec('Storage', 'Data model keys and moduleId iyb-planning', !!after.raw && after.raw.moduleId === 'iyb-planning' && after.raw.schemaVersion === 1 && ['businessProfile', 'objectives', 'activities', 'assessments', 'businessAnalysis', 'externalForecasts', 'risks', 'plans', 'actionPlan', 'progress'].every((k) => k in after.raw) && after.raw.lastSection === 'p5');
  // language
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  const en = await pg.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, cur: SIYBPlanning.current(), h: document.querySelector('#pypRoot h2').textContent, nav: [...document.querySelectorAll('[data-nav-group="planning"] .global-nav-label')].map((x) => x.textContent.trim()).join('|'), txt: document.querySelector('#pypRoot').innerText }));
  rec('Language', 'English: LTR, same section kept, titles in English', en.lang === 'en' && en.dir === 'ltr' && en.cur === 'p5' && /Making Plans/.test(en.h), en.h);
  rec('Language', 'No Arabic letters inside module or its sub-menu in English', !/[؀-ۿ]/.test(en.txt + en.nav), (en.txt + en.nav).match(/[؀-ۿ]+/g)?.slice(0, 3).join());
  await pg.evaluate(() => SIYBPlanning.open('home')); await pg.waitForTimeout(200);
  const enHome = await pg.evaluate(() => document.querySelector('#pypRoot').innerText);
  rec('Language', 'English landing has no Arabic and shows disclaimers', !/[؀-ۿ]/.test(enHome) && /preliminary translation/.test(enHome) && /not endorsed by the ILO/.test(enHome));
  await pg.click('#languageToggle'); await pg.waitForTimeout(400);
  rec('Language', 'Back to Arabic: RTL and data preserved', await pg.evaluate(() => document.documentElement.dir === 'rtl' && JSON.parse(localStorage.getItem('siyb.iyb.planning.v1')).moduleId === 'iyb-planning'));
  // reload restores last section
  await pg.evaluate(() => SIYBPlanning.open('p3')); await pg.waitForTimeout(600);
  await pg.reload(); await pg.waitForTimeout(900);
  await pg.click('.sidebar-group-head'); await head(pg, 'planning');
  rec('Persistence', 'Reload restores last section (p3)', await pg.evaluate(() => SIYBPlanning.current()) === 'p3');
  // corrupt data
  await pg.evaluate(() => localStorage.setItem('siyb.iyb.planning.v1', '{broken')); await pg.reload(); await pg.waitForTimeout(900);
  await pg.click('.sidebar-group-head'); await head(pg, 'planning');
  rec('Persistence', 'Corrupt data does not crash and is preserved as .unreadable', await pg.evaluate(() => !!document.querySelector('#pypRoot .pyp-card') && localStorage.getItem('siyb.iyb.planning.v1.unreadable') === '{broken'));
  // responsive
  for (const [w, h] of [[375, 700], [768, 900], [1280, 800]]) {
    await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250);
    const ov = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    rec('Responsive', 'No horizontal overflow at ' + w, ov <= 1, String(ov));
  }
  // sibling modules unaffected
  for (const t of ['marketing', 'stock', 'gyb']) {
    await pg.setViewportSize({ width: 1280, height: 800 });
    if (t !== 'gyb') { const open = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!open) await pg.click('.sidebar-group-head'); }
    await head(pg, t); await pg.waitForTimeout(500);
    const ok = await pg.evaluate((x) => document.body.classList.contains('mode-' + x) && !document.body.classList.contains('mode-planning') && document.querySelector('#workspaceContent').children.length > 0, t);
    rec('Regression', t + ' still opens and Planning body class is cleared', ok);
  }
  // Costing and Training (two modes of the costing tool) – opened from the sidebar
  await pg.setViewportSize({ width: 1280, height: 800 });
  {
    const open = await pg.evaluate(() => !!document.querySelector('[data-group="iyb"] .sidebar-group-body:not([hidden])')); if (!open) await pg.click('.sidebar-group-head');
    await head(pg, 'costing'); await pg.waitForTimeout(700);
    rec('Regression', 'Costing opens (not training mode) and Planning body class is cleared', await pg.evaluate(() => !document.body.classList.contains('mode-training') && !document.body.classList.contains('mode-planning') && !!document.querySelector('#costingModuleRoot') && document.querySelector('#costingModuleRoot').innerText.length > 100));
    await pg.evaluate(() => { const b = document.querySelector('[data-nav-item^="training-"]'); if (b) b.click(); }); await pg.waitForTimeout(1200);
    rec('Regression', 'Training opens (mode-training) with exercises and Planning body class is cleared', await pg.evaluate(() => document.body.classList.contains('mode-training') && !document.body.classList.contains('mode-planning') && document.querySelector('#trainingMount, #costingModuleRoot').innerText.length > 100));
    await pg.evaluate(() => { const b = document.querySelector('[data-nav-item^="business-"]'); if (b) b.click(); }); await pg.waitForTimeout(800);
    rec('Regression', 'Back to Costing from Training works', await pg.evaluate(() => !document.body.classList.contains('mode-training') && !!document.querySelector('#costingModuleRoot') && !document.querySelector('#trainingMount')));
  }
  // Pending changes are flushed when the page becomes hidden (document-level visibilitychange)
  {
    await head(pg, 'planning'); await pg.waitForTimeout(500);
    const r = await pg.evaluate(async () => {
      SIYBPlanningStore.flush(); const k = SIYBPlanningStore.KEY;
      SIYBPlanningStore.set('businessProfile.__qaProbe', 'x1');
      const before = JSON.parse(localStorage.getItem(k)).businessProfile.__qaProbe; // debounce pending, not yet stored
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
      const after = JSON.parse(localStorage.getItem(k)).businessProfile.__qaProbe;
      delete document.visibilityState;
      SIYBPlanningStore.set('businessProfile.__qaProbe', undefined); SIYBPlanningStore.flush();
      return { before, after };
    });
    rec('Persistence', 'Pending change is not yet stored, then flushed immediately on document visibilitychange (hidden)', r.before === undefined && r.after === 'x1', JSON.stringify(r));
    const src = await pg.evaluate(() => fetch('./src/modules/planning-store.js').then((x) => x.text()));
    rec('Persistence', 'visibilitychange listener is attached to document, not window', /document\.addEventListener\('visibilitychange'/.test(src) && !/window\.addEventListener\('visibilitychange'/.test(src));
  }
  rec('Console', 'No page errors', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await browser.close();
  let f = 0; results.forEach((r) => { if (r.status === 'FAIL') f++; console.log(r.status.padEnd(5) + ' [' + r.area + '] ' + r.name + (r.note ? ' — ' + r.note : '')); });
  console.log('PASSED ' + (results.length - f) + '  FAILED ' + f);
})();
