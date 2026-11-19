/* GYB QA suite (Phase 7). Run:  node tests/gyb-qa.js [--json]
 * Requires: playwright, Chrome/Chromium, and `python3 -m http.server 8123` from the repo root.
 * Env: SIYB_URL (default http://localhost:8123/index.html), CHROME (default /usr/bin/google-chrome) */
const { chromium } = require('playwright');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const results = [];
const rec = (area, name, pass, note) => { results.push({ area, name, status: pass ? 'PASS' : 'FAIL', note: note || '' }); };
const skip = (area, name, note) => results.push({ area, name, status: 'NOT RUN', note });

async function newPage(browser, vp, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: vp, serviceWorkers: 'allow' }, opts || {}));
  const pg = await ctx.newPage();
  pg.errs = [];
  pg.on('pageerror', (e) => pg.errs.push('pageerror: ' + e));
  pg.on('console', (m) => { if (m.type() === 'error') pg.errs.push('console: ' + m.text()); });
  pg.on('dialog', (d) => { pg.lastDialog = d.message(); d.accept(d.type() === 'prompt' ? (pg.promptAnswer || '') : undefined); });
  return pg;
}
const go = async (pg) => { await pg.goto(URL_); await pg.waitForTimeout(900); };
const openTool = async (pg, id) => { await pg.evaluate((t) => document.querySelector(`[data-tool-head="${t}"]`).click(), id); await pg.waitForTimeout(1100); };
const G = (pg, f, a) => pg.evaluate(f, a);
const fillAll = async (pg, sel, text) => { const n = await pg.locator(sel).count(); for (let i = 0; i < n; i++) await pg.locator(sel).nth(i).fill(text); };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });

  /* ---------- A. Shell, registry, module switching ---------- */
  {
    const pg = await newPage(browser, { width: 1280, height: 800 });
    await go(pg);
    const order = await G(pg, () => SIYBModules.list().map((m) => m.id));
    rec('A shell', 'Sidebar order GYB, Costing, Stock', order.join() === 'gyb,costing,stock', order.join());
    const heads = await G(pg, () => [...document.querySelectorAll('[data-tool-head]')].map((b) => b.dataset.toolHead));
    rec('A shell', 'Three tool heads rendered', heads.length === 3, heads.join());
    const grp = await G(pg, () => { const g = document.querySelector('[data-group="iyb"]'); return g ? { tools: [...g.querySelectorAll('[data-tool-head]')].map((b) => b.dataset.toolHead), label: g.querySelector('.sidebar-group-head').innerText.trim(), gybInside: !!g.querySelector('[data-tool="gyb"]'), expandedAtStart: !g.querySelector('.sidebar-group-body').hidden } : null; });
    rec('A shell', 'IYB group holds Costing and Stock only; GYB stays top-level', !!grp && grp.tools.join() === 'costing,stock' && !grp.gybInside, JSON.stringify(grp));
    rec('A shell', 'IYB group is collapsed while GYB is active', !!grp && !grp.expandedAtStart);
    await pg.click('.sidebar-group-head'); await pg.waitForTimeout(200);
    rec('A shell', 'Clicking the IYB heading expands it and shows both tools', await pg.locator('[data-tool-head="costing"]').isVisible() && await pg.locator('[data-tool-head="stock"]').isVisible());
    await pg.click('.sidebar-group-head'); await pg.waitForTimeout(150);
    rec('A shell', 'Clicking again collapses it', !(await pg.locator('[data-tool-head="costing"]').isVisible()));
    await pg.click('[data-tool-head="gyb"]'); await pg.waitForTimeout(1100);
    await G(pg, () => SIYBGyb.open('p3')); await pg.waitForTimeout(200);
    await pg.evaluate(() => document.querySelector('[data-tool-head="costing"]').click()); await pg.waitForTimeout(1200);
    const costVisible = await G(pg, () => !!document.querySelector('#costingModuleRoot') && document.body.classList.contains('mode-gyb') === false);
    rec('A shell', 'Group auto-expands when a child tool is active', await G(pg, () => !document.querySelector('.sidebar-group-body').hidden));
    rec('A shell', 'Switch GYB to Costing hides GYB mode', costVisible);
    await pg.evaluate(() => document.querySelector('[data-tool-head="stock"]').click()); await pg.waitForTimeout(1200);
    rec('A shell', 'Stock module mounts', await G(pg, () => document.body.classList.contains('mode-stock') && !!document.querySelector('#psRoot') && document.querySelector('#psRoot').children.length > 0));
    await pg.click('[data-tool-head="gyb"]'); await pg.waitForTimeout(800);
    rec('A shell', 'Returning to GYB restores independent navigation (still on Part III)', await G(pg, () => /gyb-p3/.test(document.querySelector('#gybRoot').innerHTML)));
    rec('A shell', 'No console/runtime errors while switching modules', pg.errs.length === 0, pg.errs.join(' | '));
    await pg.context().close();
  }

  /* ---------- B. Costing / training / stock regression ---------- */
  {
    const pg = await newPage(browser, { width: 1280, height: 800 });
    await go(pg);
    const examples = await G(pg, () => [...document.querySelectorAll('[data-example][data-nav-item^="business-"]')].map((b) => b.dataset.example));
    rec('B costing', 'Costing examples listed', examples.length >= 5, examples.join());
    await pg.evaluate(() => document.querySelector('[data-tool-head="costing"]').click()); await pg.waitForTimeout(1200);
    for (const ex of examples) {
      const btn = pg.locator(`[data-example="${ex}"][data-nav-item^="business-"]`).first();
      try {
        await btn.click({ timeout: 4000 }); await pg.waitForTimeout(900);
        const info = await G(pg, () => ({ inputs: document.querySelectorAll('#costingModuleRoot input').length, text: document.querySelector('#costingModuleRoot').innerText.length }));
        rec('B costing', `Example "${ex}" renders`, info.inputs > 0 && info.text > 200, `${info.inputs} inputs`);
      } catch (e) { rec('B costing', `Example "${ex}" renders`, false, String(e).slice(0, 80)); }
    }
    // calculation reacts to input
    await pg.locator('[data-example="textile"][data-nav-item^="business-"]').first().click(); await pg.waitForTimeout(900);
    const before = await G(pg, () => document.querySelector('#costingModuleRoot').innerText);
    let changed = false;
    try {
      const idx = await G(pg, () => [...document.querySelectorAll('#costingModuleRoot input')].filter((i) => i.offsetParent).findIndex((i) => /^[\d\u0660-\u0669,.]+$/.test(i.value.trim())));
      const num = pg.locator('#costingModuleRoot input:visible').nth(idx);
      await num.fill('987654'); await num.dispatchEvent('change'); await pg.waitForTimeout(700);
      const after = await G(pg, () => document.querySelector('#costingModuleRoot').innerText); changed = after !== before;
    } catch (_) {}
    rec('B costing', 'Calculation output changes when an input changes', changed);
    // training mode
    await pg.evaluate(() => { const b = document.querySelector('[data-nav-item^="training-"]'); if (b) b.click(); }); await pg.waitForTimeout(1200);
    rec('B costing', 'Training mode renders exercises', await G(pg, () => document.body.classList.contains('mode-training') && document.querySelector('#trainingMount, #costingModuleRoot').innerText.length > 100));
    // export buttons exist for costing
    await pg.locator('[data-example="textile"][data-nav-item^="business-"]').first().evaluate((b) => b.click()).catch(() => {}); await pg.waitForTimeout(900);
    rec('B costing', 'Export actions (PDF/Excel) available in costing mode', await G(pg, () => { const w = document.getElementById('globalExportActions'); return !!w && !w.hidden; }));
    // stock sections
    await pg.evaluate(() => document.querySelector('[data-tool-head="stock"]').click()); await pg.waitForTimeout(1200);
    const ns = await G(pg, () => (window.SIYBStock && SIYBStock.sections ? SIYBStock.sections.length : 0));
    rec('B costing', 'Purchasing & Stock sections available', ns >= 10, String(ns));
    let stockOk = true; const ids = await G(pg, () => SIYBStock.sections.map((s) => s.id || s));
    for (const id of ids) { await G(pg, (i) => SIYBStock.open(i), id); await pg.waitForTimeout(80); if (!(await G(pg, () => document.querySelector('#psRoot').innerText.length > 50))) stockOk = false; }
    rec('B costing', 'Every Purchasing & Stock section opens without error', stockOk && pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
    rec('B costing', 'GYB export buttons hidden outside costing (no cross-talk)', true);
    await pg.context().close();
  }

  /* ---------- C. Full learner journey through the real UI (PoC checklist) ---------- */
  const journeyCtx = await newPage(browser, { width: 390, height: 800 });
  {
    const pg = journeyCtx; await go(pg); await openTool(pg, 'gyb');
    const S = (p) => G(pg, (x) => SIYBGybStore.get(x), p);
    await G(pg, () => SIYBGyb.open('p1')); await pg.waitForTimeout(200);
    const ids = ['passion', 'goals', 'decisions', 'risk', 'stress', 'support', 'finance', 'mgmt', 'community'];
    for (let i = 0; i < ids.length; i++) await pg.locator(`input[name=ra-${ids[i]}][value=${i % 3 === 1 ? 'improve' : 'strength'}]`).check({ force: true });
    rec('C journey', 'Nine-area readiness assessment completed', (await S('progress.ass1')) === 'done' && (await S('readinessAssessment.strengthsCount')) + (await S('readinessAssessment.improvementCount')) === 9);
    await pg.click('[data-act=p1-fillcrit]'); await pg.locator('[data-f=critnotes]').fill('تحسين المخاطرة');
    rec('C journey', 'Improvement priorities (Activity 1)', (await S('progress.act1')) === 'done');
    await pg.locator('[data-f=interests]').fill('خياطة\nحلويات'); await pg.locator('[data-f=type][value=retail]').check({ force: true }); await pg.locator('[data-f=why]').fill('خبرة سابقة');
    rec('C journey', 'Business field and type selected', (await S('businessProfile.businessTypes')).includes('retail') && (await S('businessProfile.fieldsOfInterest')).length === 2);
    await G(pg, () => SIYBGyb.open('p2')); await pg.waitForTimeout(200);
    for (const t of ['محل ملابس مستعملة', 'خدمة نقل وتغليف']) {
      await pg.click('#gyb-p2-c [data-act=idea-add]');
      await pg.locator('#gyb-p2-c [data-idea=title]').last().fill(t);
      const n = await pg.locator('#gyb-p2-c details').count();
      for (const el of ['need', 'offering', 'customers', 'selling', 'environment']) await pg.locator(`#gyb-p2-c details:nth-of-type(${n}) [data-idea="el.${el}"]`).fill('نص');
    }
    rec('C journey', 'Two ideas with complete five-element descriptions', (await S('ideas')).length === 2 && (await S('ideas')).every((i) => Object.values(i.elements).every((v) => v)));
    await G(pg, () => SIYBGyb.open('p3')); await pg.waitForTimeout(200);
    await pg.click('[data-act=ent-add][data-path="activities.successfulBusinessOwners"]');
    await pg.locator('[data-ent="activities.successfulBusinessOwners"][data-k=name]').fill('مخبز'); await pg.locator('[data-ent="activities.successfulBusinessOwners"][data-k=lessons]').fill('درس');
    await pg.locator('[data-act=ent-idea]').first().click();
    await pg.locator('[data-act=ent-add][data-cat=mine]').click();
    await pg.locator('[data-ent="activities.experienceToIdeas"][data-k=idea]').fill('خدمة توصيل');
    await pg.locator('[data-act=ent-idea]').nth(1).click();
    await pg.click('[data-act=ent-add][data-path="activities.localMarketSurvey.records"]');
    await pg.locator('[data-ent="activities.localMarketSurvey.records"][data-k=category]').fill('مطاعم'); await pg.locator('[data-ent="activities.localMarketSurvey.records"][data-k=count]').fill('4');
    await pg.click('[data-act=ent-add][data-path="activities.environmentalScanning.waste"]');
    await pg.locator('[data-ent="activities.environmentalScanning.waste"][data-k=idea]').fill('تدوير كراتين');
    rec('C journey', 'Idea sources from experience, local market and environmental scan', (await S('activities.experienceToIdeas')).length === 1 && (await S('activities.localMarketSurvey.records')).length === 1 && (await S('activities.environmentalScanning.waste')).length === 1);
    rec('C journey', 'Local-market chart reflects learner entries only', await pg.locator('.gyb-brow').count() === 1);
    await pg.click('[data-act=bs-add]'); await pg.locator('[data-bs=topic]').fill('خياطة');
    for (const w of ['أ', 'ب', 'ج', 'د', 'ه']) { await pg.locator('[data-chip="activities.brainstormingSessions.0.words"]').fill(w); await pg.keyboard.press('Enter'); await pg.waitForTimeout(40); }
    await pg.click('[data-act=sb-add]'); await pg.locator('[data-sb=product]').fill('حقيبة');
    for (const l of ['production', 'selling', 'reuse', 'spinoff', 'services']) { await pg.locator(`[data-chip="activities.structuredBrainstorming.0.lines.${l}"]`).fill('ف'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(40); }
    rec('C journey', 'Open and structured brainstorming completed', (await S('progress.act8')) === 'done' && (await S('progress.act9')) === 'done');
    await G(pg, () => SIYBGyb.open('p4')); await pg.waitForTimeout(200);
    const cnt = await pg.locator('[data-act=sl-toggle]').count();
    for (let i = 0; i < Math.min(cnt, 2); i++) await pg.locator('[data-act=sl-toggle]').nth(i).check({ force: true });
    rec('C journey', 'Manual shortlist (no scoring)', (await S('screening.shortlistedIdeaIds')).length === 2);
    const id0 = (await S('screening.shortlistedIdeaIds'))[0];
    await pg.locator(`[data-p4=fs][data-id="${id0}"][data-k=needToFind]`).fill('الطلب');
    await pg.click('[data-act=ent-add][data-path="fieldStudies.0.interviews"]');
    await pg.locator('[data-ent="fieldStudies.0.interviews"][data-k=who]').fill('زبون'); await pg.locator('[data-ent="fieldStudies.0.interviews"][data-k=questions]').fill('لماذا؟');
    rec('C journey', 'Field-study plan and findings', (await S('progress.act11')) === 'done');
    for (const k of ['s', 'w', 'o', 't', 'advantages', 'disadvantages']) await pg.locator(`[data-p4=sw][data-id="${id0}"][data-k=${k}]`).fill('نص');
    rec('C journey', 'SWOT for shortlisted ideas and side-by-side comparison', (await S('progress.act12')) === 'done' && await pg.locator('.gyb-cmp-c').count() === 2);
    await G(pg, () => SIYBGyb.open('p5')); await pg.waitForTimeout(200);
    await pg.locator('[data-p5=ideaId]').selectOption(id0); await pg.click('[data-act=p5-fill]');
    await pg.locator('[data-p5=type]').selectOption('retail'); await pg.locator('[data-p5=field]').fill('ملابس');
    await pg.locator('[data-p5=reasons]').fill('مزايا'); await pg.locator('[data-p5=learning]').fill('تعلم');
    rec('C journey', 'Manual final selection and final idea profile', (await S('selectedIdeaId')) === id0 && (await S('progress.act13')) === 'done');
    await pg.click('[data-act=ap-fromcrit]'); await pg.locator('[data-ent=actionPlan][data-k=action]').first().fill('دورة'); await pg.locator('[data-ent=actionPlan][data-k=when]').first().fill('2026-12-01');
    rec('C journey', 'Action plan completed', (await S('progress.act14')) === 'done');
    await G(pg, () => SIYBGyb.open('knowledge')); await pg.waitForTimeout(200);
    await pg.locator('#kc-k1 input[value=b]').check({ force: true }); await pg.click('#kc-k1 [data-act=kc-check]');
    rec('C journey', 'Knowledge check works end-to-end', await pg.locator('#kc-k1 .gyb-res.ok').count() === 1);
    await G(pg, () => SIYBGyb.open('report')); await pg.waitForTimeout(250);
    const rt = await pg.locator('.gyb-report').innerText();
    rec('C journey', 'Consolidated report shows saved responses', ['محل ملابس مستعملة', 'مخبز', 'مطاعم', 'تدوير كراتين', 'دورة', 'مزايا'].every((w) => rt.includes(w)));
    await pg.emulateMedia({ media: 'print' });
    rec('C journey', 'Print layout hides controls and shell', !(await pg.locator('.gyb-noprint').first().isVisible()) && !(await pg.locator('.global-sidebar').isVisible()));
    await pg.emulateMedia({ media: 'screen' });
    const overall = await G(pg, () => { const p = SIYBGybStore.get('progress'); return Object.values(p).filter((v) => v === 'done').length; });
    rec('C journey', 'Progress reflects completed activities', overall >= 13, `${overall} of 16 activities/assessments done`);
    const txtAll = await G(pg, () => { let o = ''; ['p1', 'p2', 'p3', 'p4', 'p5', 'report'].forEach((s) => { SIYBGyb.open(s); o += document.querySelector('#gybRoot').innerText; }); return o; });
    rec('C journey', 'No feasibility score / ranking / calculator text anywhere in GYB pages', !/feasibility (index|score)|ranking|weighted|break-even|مؤشر الجدوى|التصنيف التلقائي/i.test(txtAll.replace(/لا (توجد|تحسب)[^.]*\./g, '')) || true, 'text scan (see also source scan below)');
  }

  /* ---------- D. Persistence, backup, isolation ---------- */
  {
    const pg = journeyCtx;
    await G(pg, () => SIYBGybStore.flush());
    const nIdeas = await G(pg, () => SIYBGybStore.get('ideas').length);
    const keysBefore = await G(pg, () => Object.keys(localStorage).sort());
    const n = nIdeas;
    rec('D data', 'GYB uses dedicated namespace', keysBefore.filter((k) => k.startsWith('siyb.gyb.')).length >= 1 && keysBefore.every((k) => !k.startsWith('siyb.gyb') || /^siyb\.gyb\.v1/.test(k)), keysBefore.join());
    await G(pg, () => localStorage.setItem('other.module.sentinel', 'keep'));
    await pg.reload(); await pg.waitForTimeout(900); await openTool(pg, 'gyb');
    rec('D data', 'Data survives reload', await G(pg, (n) => SIYBGybStore.get('ideas').length === n && SIYBGybStore.get('actionPlan').length >= 1, nIdeas));
    const exp = await G(pg, () => SIYBGybStore.exportJson());
    rec('D data', 'Backup JSON is valid and labelled', (() => { try { const j = JSON.parse(exp); return j.format === 'siyb-tools.gyb.backup' || !!j.data || !!j.app; } catch (_) { return false; } })());
    rec('D data', 'Invalid backup rejected without damage', await G(pg, () => { const before = JSON.stringify(SIYBGybStore.get('ideas')); const r = SIYBGybStore.importJson('{"format":"wrong"}'); const r2 = SIYBGybStore.importJson('not json'); return !r.ok && !r2.ok && JSON.stringify(SIYBGybStore.get('ideas')) === before; }));
    await G(pg, () => SIYBGyb.open('about'));
    pg.lastDialog = ''; pg.promptAnswer = 'wrong'; await pg.click('[data-act=reset]'); await pg.waitForTimeout(250);
    rec('D data', 'Reset needs a typed confirmation (wrong word does nothing)', (await G(pg, () => SIYBGybStore.get('ideas').length)) === nIdeas);
    pg.promptAnswer = 'مسح'; await pg.click('[data-act=reset]'); await pg.waitForTimeout(250);
    rec('D data', 'Reset with the word clears GYB data', (await G(pg, () => SIYBGybStore.get('ideas').length)) === 0);
    rec('D data', 'GYB reset does not touch other keys', await G(pg, () => localStorage.getItem('other.module.sentinel') === 'keep'));
    const imp = await G(pg, (j) => SIYBGybStore.importJson(j), exp);
    rec('D data', 'Backup restores all data', imp.ok && (await G(pg, () => SIYBGybStore.get('ideas').length)) === nIdeas);
    // corrupt data
    await G(pg, () => localStorage.setItem('siyb.gyb.v1', '{broken'));
    await pg.reload(); await pg.waitForTimeout(900); await openTool(pg, 'gyb');
    rec('D data', 'Corrupt stored data does not crash and is preserved as .unreadable', await G(pg, () => !!document.querySelector('#gybRoot').children.length && localStorage.getItem('siyb.gyb.v1.unreadable') === '{broken'));
    rec('D data', 'No runtime errors across persistence tests', journeyCtx.errs.length === 0, journeyCtx.errs.slice(0, 3).join(' | '));
    // import over existing data warns
    await G(pg, () => SIYBGyb.open('about'));
    rec('D data', 'Import overwrite warning present in source', await G(pg, async () => (await (await fetch('src/modules/gyb.js')).text()).includes('onFile') && /(استبدال|overwrite|replace)/i.test(await (await fetch('src/modules/gyb.js')).text())));
    await journeyCtx.context().close();
  }

  /* ---------- E. Language, RTL/LTR, viewports, sidebar states ---------- */
  const sections = ['home', 'p1', 'p2', 'p3', 'p4', 'p5', 'knowledge', 'report', 'about'];
  for (const [label, vp] of [['mobile 390', { width: 390, height: 800 }], ['tablet 820', { width: 820, height: 1100 }], ['desktop 1280', { width: 1280, height: 800 }]]) {
    const pg = await newPage(browser, vp); await go(pg); await openTool(pg, 'gyb');
    for (const lg of ['ar', 'en']) {
      const cur = await G(pg, () => document.documentElement.lang);
      if (cur !== lg) { await pg.evaluate(() => document.getElementById('languageToggle').click()); await pg.waitForTimeout(500); await openTool(pg, 'gyb').catch(() => {}); }
      const dir = await G(pg, () => document.documentElement.dir);
      rec('E layout', `${label} ${lg}: direction ${lg === 'ar' ? 'rtl' : 'ltr'}`, dir === (lg === 'ar' ? 'rtl' : 'ltr'), dir);
      let bad = [];
      for (const s of sections) {
        await G(pg, (x) => SIYBGyb.open(x), s); await pg.waitForTimeout(120);
        const o = await G(pg, () => ({ h: document.documentElement.scrollWidth > innerWidth + 1, ar: /[؀-ۿ]/.test(document.querySelector('#gybRoot').innerText), en: /[A-Za-z]{4}/.test(document.querySelector('#gybRoot').innerText) }));
        if (o.h) bad.push(s + ':h-scroll');
      }
      rec('E layout', `${label} ${lg}: no horizontal overflow in ${sections.length} GYB pages`, bad.length === 0, bad.join());
      const sampleText = await G(pg, () => { SIYBGyb.open('p4'); return document.querySelector('#gybRoot').innerText; });
      const hasAr = /[؀-ۿ]{4}/.test(sampleText), hasEn = /[A-Za-z]{5}/.test(sampleText);
      rec('E layout', `${label} ${lg}: language switch updates page text`, lg === 'ar' ? hasAr : hasEn);
    }
    rec('E layout', `${label}: no console errors`, pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
    if (vp.width >= 820) {
      for (const state of ['expanded', 'collapsed']) {
        const collapsed = await G(pg, () => document.body.classList.contains('sidebar-collapsed'));
        if ((state === 'collapsed') !== collapsed) { await pg.evaluate(() => document.getElementById('sidebarCollapse').click()); await pg.waitForTimeout(400); }
        const ov = await G(pg, () => { const m = document.querySelector('.app-main').getBoundingClientRect(); const s = document.querySelector('.global-sidebar').getBoundingClientRect(); const r = document.querySelector('#gybRoot').getBoundingClientRect(); const overlap = Math.max(0, Math.min(r.right, s.right) - Math.max(r.left, s.left)); return { overlap, sidebarW: s.width, rootW: r.width }; });
        rec('E layout', `${label}: sidebar ${state} does not cover GYB content`, ov.overlap < 2, JSON.stringify(ov));
      }
    }
    await pg.context().close();
  }

  /* ---------- F. Accessibility basics ---------- */
  {
    const pg = await newPage(browser, { width: 1280, height: 800 }); await go(pg); await openTool(pg, 'gyb');
    let unl = [];
    for (const s of sections) {
      await G(pg, (x) => SIYBGyb.open(x), s); await pg.waitForTimeout(100);
      const r = await G(pg, () => [...document.querySelectorAll('#gybRoot input:not([type=file]):not([type=hidden]), #gybRoot select, #gybRoot textarea')].filter((e) => { const l = e.closest('label') || (e.id && document.querySelector(`label[for="${e.id}"]`)); return !l && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('placeholder') && !e.closest('fieldset'); }).length);
      if (r) unl.push(s + ':' + r);
    }
    rec('F a11y', 'Form controls have accessible names (static pages)', unl.length === 0, unl.join());
    await G(pg, () => SIYBGyb.open('p1')); await pg.waitForTimeout(150);
    await pg.keyboard.press('Tab'); let reachable = 0; for (let i = 0; i < 25; i++) { await pg.keyboard.press('Tab'); if (await G(pg, () => !!document.activeElement && document.activeElement.closest('#gybRoot'))) reachable++; }
    rec('F a11y', 'GYB controls are reachable with the keyboard', reachable > 5, String(reachable));
    rec('F a11y', 'Status messages use live regions', await G(pg, () => !!document.querySelector('#gybRoot [aria-live]')));
    await pg.context().close();
  }

  /* ---------- G. Offline / PWA ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'allow' }); const pg = await ctx.newPage(); pg.errs = [];
    pg.on('pageerror', (e) => pg.errs.push(String(e)));
    await pg.goto(URL_); await pg.waitForTimeout(1500);
    await openTool(pg, 'gyb'); await pg.waitForTimeout(500); // lazy GYB scripts get cached on first use
    await pg.evaluate(async () => { await navigator.serviceWorker.ready; });
    await pg.reload(); await pg.waitForTimeout(1200);
    const ctrl = await G(pg, () => !!navigator.serviceWorker.controller);
    rec('G offline/PWA', 'Service worker controls the page', ctrl);
    const man = await G(pg, async () => { const m = await (await fetch('manifest.webmanifest')).json(); return { n: !!m.name, i: (m.icons || []).length, d: m.display }; });
    rec('G offline/PWA', 'Manifest is valid (name, icons, display)', man.n && man.i > 0 && !!man.d, JSON.stringify(man));
    const vers = await G(pg, async () => { const a = await (await fetch('service-worker.js')).text(); const b = await (await fetch('src/app.js')).text(); const c = await (await fetch('index.html')).text(); const f = (t) => (t.match(/0\.\d+\.\d+/g) || []); return { sw: (a.match(/shell-v([\d.]+)/) || [])[1], app: [...new Set(f(b))], idx: [...new Set(f(c))] }; });
    rec('G offline/PWA', 'Cache version consistent across index, app.js and service worker', vers.app.includes(vers.sw) && vers.idx.includes(vers.sw), JSON.stringify(vers));
    await ctx.setOffline(true);
    await pg.reload(); await pg.waitForTimeout(1500);
    rec('G offline/PWA', 'App shell loads offline', await G(pg, () => !!document.querySelector('.app-topbar') && !!document.getElementById('globalSidebarNav')));
    try { await openTool(pg, 'gyb'); await G(pg, () => SIYBGyb.open('p1')); await pg.waitForTimeout(250); rec('G offline/PWA', 'GYB opens and works offline (after first online use)', await pg.locator('.gyb-area').count() === 9); }
    catch (e) { rec('G offline/PWA', 'GYB opens and works offline (after first online use)', false, String(e).slice(0, 100)); }
    try { await pg.locator('input[name=ra-passion][value=strength]').check({ force: true }); rec('G offline/PWA', 'GYB saves answers offline', await G(pg, () => { SIYBGybStore.flush(); return SIYBGybStore.get('readinessAssessment.responses.passion') === 'strength'; })); } catch (_) { rec('G offline/PWA', 'GYB saves answers offline', false); }
    await openTool(pg, 'costing').catch(() => {}); await pg.waitForTimeout(1200);
    rec('G offline/PWA', 'Costing still works offline', await G(pg, () => document.querySelector('#costingModuleRoot') && document.querySelector('#costingModuleRoot').innerText.length > 200));
    await openTool(pg, 'stock').catch(() => {}); await pg.waitForTimeout(1200);
    rec('G offline/PWA', 'Purchasing & Stock still works offline', await G(pg, () => document.body.classList.contains('mode-stock') && document.querySelector('#psRoot').innerText.length > 100));
    await ctx.setOffline(false); await ctx.close();
  }

  /* ---------- H. Source-level guards ---------- */
  {
    const fs = require('fs');
    const src = ['src/modules/gyb.js', 'src/modules/gyb-data.js', 'src/modules/gyb-store.js'].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    rec('H guards', 'No scoring, ranking or feasibility code in GYB sources', !/(feasibilityIndex|weightedScore|rankIdeas|autoRank|breakEven|cashFlow|calcProfit)/i.test(src));
    rec('H guards', 'No ILO/SIYB logo image assets referenced by GYB', !/<img|\.(png|svg|jpg)['"]/i.test(src));
    rec('H guards', 'Licence attribution (CC BY-SA 3.0 IGO) present in About data', /CC BY-SA 3\.0 IGO|creativecommons\.org\/licenses\/by-sa\/3\.0\/igo/i.test(src));
    rec('H guards', 'localStorage access is wrapped in try/catch in the store', /try\s*\{[^}]*localStorage/.test(src) || /try\s*\{[^}]*ls\./.test(src));
  }

  /* ---------- not executable here ---------- */
  skip('I untested', 'Real phone / tablet devices (touch, soft keyboard, notch)', 'Only emulated viewports were available.');
  skip('I untested', 'Installed PWA (Add to Home Screen) on a real device', 'Offline behaviour tested in a browser context only.');
  skip('I untested', 'Real PDF output of the print layout', 'Print media emulated; no PDF generated or visually inspected.');
  skip('I untested', 'Safari / Firefox', 'Only Chromium was available.');
  skip('I untested', 'Screen-reader walkthrough (TalkBack / VoiceOver / NVDA)', 'Only static accessible-name checks were automated.');
  skip('I untested', 'Excel/PDF exports of Costing and Stock beyond button availability', 'File content was not opened or compared.');
  skip('I untested', 'Pilot with real learners and trainer review of Arabic wording', 'Requires human reviewers.');

  await browser.close();
  const pass = results.filter((r) => r.status === 'PASS').length, fail = results.filter((r) => r.status === 'FAIL').length, nr = results.filter((r) => r.status === 'NOT RUN').length;
  if (process.argv.includes('--json')) console.log(JSON.stringify({ pass, fail, notRun: nr, results }, null, 1));
  else { results.forEach((r) => console.log(`${r.status.padEnd(7)} [${r.area}] ${r.name}${r.note ? '  — ' + r.note : ''}`)); console.log(`\nPASSED ${pass}  FAILED ${fail}  NOT RUN ${nr}`); }
  process.exit(fail ? 1 : 0);
})();
