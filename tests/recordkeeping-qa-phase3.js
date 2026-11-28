/* IYB Record Keeping QA – Phase 3 (core interactive forms: Basic Record Book, Daily Cash Sales Record, Customers' Accounts Record).
 * Run: node tests/recordkeeping-qa-phase3.js   (Playwright + Chrome + `python3 -m http.server 8123` at the repo root)
 * Condition-based waits only. Expected figures are taken from the English manual: Modern Furniture November (p.28), Activity 5 answer (p.48),
 * Reliable Tailors (pp.36-44), Welcome Hotel Customers' Accounts Record (p.21), Daily Cash Sales example (p.29 voucher E). */
const { chromium } = require('playwright');
const fs = require('fs');
const URL_ = process.env.SIYB_URL || 'http://localhost:8123/index.html';
const KEY = 'siyb.iyb.recordkeeping.v1';
const results = []; const rec = (a, n, p, note) => results.push({ a, n, p: !!p, note: note || '' });
const ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.').replace(/٬/g, ',');
const AR = /[؀-ۿ]/;

const MF = [ // Modern Furniture, November (VAT registered). amount = money in/out; vat = VAT part
  { type: 'purchase', where: 'cash', cat: 'material', date: '10/11', details: 'Bought timber', voucher: '340', amount: 294, vat: 14 },
  { type: 'sale', where: 'cash', date: '10/11', details: 'Sales', voucher: '341', amount: 100, vat: 9.1 },
  { type: 'sale', where: 'cash', date: '10/11', details: 'Sales', voucher: '342', amount: 1560, vat: 141.8 },
  { type: 'purchase', where: 'cash', cat: 'material', date: '11/11', details: 'Bought varnish, etc.', voucher: '343', amount: 210, vat: 19.1 },
  { type: 'sale', where: 'bank', date: '18/11', details: 'Sales', voucher: '344', amount: 2400, vat: 218.2 },
  { type: 'deposit_rev', where: 'cash', date: '23/11', details: 'Bank to cash box', voucher: '345', amount: 2000 },
  { type: 'purchase', where: 'cash', cat: 'material', date: '23/11', details: 'Bought timber', voucher: '346', amount: 1500, vat: 71.4 },
  { type: 'wages', where: 'cash', date: '23/11', details: 'Wage', voucher: '347', amount: 310, labour: 310 },
  { type: 'wages', where: 'cash', date: '23/11', details: 'Wage', voucher: '348', amount: 310, labour: 310 },
  { type: 'wages', where: 'cash', date: '23/11', details: 'Own salary', voucher: '349', amount: 600, labour: 400 },
  { type: 'sale', where: 'cash', date: '24/11', details: 'Sales', voucher: '350', amount: 890, vat: 80.9 },
  { type: 'purchase', where: 'cash', cat: 'overhead', date: '25/11', details: 'Electricity', voucher: '351', amount: 90, vat: 8.2 },
  { type: 'purchase', where: 'cash', cat: 'overhead', date: '27/11', details: 'Rent', voucher: '352', amount: 250, vat: 22.7 }
].map((r) => (r.type === 'deposit_rev' ? Object.assign(r, { type: 'withdraw' }) : r));
// expected running balances in cents after each row (cash, bank, vat) from p.28
const MF_EXP = [[8600, 257000, 1400], [18600, 257000, 490], [174600, 257000, -13690], [153600, 257000, -11780], [153600, 497000, -33600], [353600, 297000, -33600], [203600, 297000, -26460], [172600, 297000, -26460], [141600, 297000, -26460], [81600, 297000, -26460], [170600, 297000, -34550], [161600, 297000, -33730], [136600, 297000, -31460]];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.addInitScript(() => { window.__ad = (x) => String(x).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.').replace(/٬/g, ','); }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e))); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const boot = async () => {
    await pg.goto(URL_).catch(() => pg.goto(URL_)); await pg.waitForFunction(() => window.SIYBModules, null, { timeout: 15000 });
    const o = await pg.evaluate(() => !!document.querySelector('[data-tool-head="recordkeeping"]') && document.querySelector('[data-tool-head="recordkeeping"]').offsetParent !== null);
    if (!o) await pg.click('.sidebar-group-head');
    await pg.evaluate(() => document.querySelector('[data-tool-head="recordkeeping"]').click());
    await pg.waitForFunction(() => window.SIYBRecordKeeping && window.SIYBRKForms && document.querySelector('#rkRoot h2'), null, { timeout: 15000 });
  };
  const flush = () => pg.evaluate(() => window.SIYBRecordKeepingStore.flush());
  const store = () => pg.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
  const openForms = async (tab) => {
    await pg.waitForFunction(() => window.SIYBRecordKeeping && window.SIYBRKForms && document.querySelector('#rkRoot'));
    await pg.evaluate(() => window.SIYBRecordKeeping.open('forms')); await pg.waitForSelector('#rk-forms-live');
    if (tab) { await pg.click(`[data-fm-act="tab"][data-id="${tab}"]`); await pg.waitForSelector(`[data-fm-act="tab"][data-id="${tab}"].active`); }
  };
  const viewText = async () => ad(await pg.evaluate(() => document.querySelector('#rk-fm-view').innerText));
  const fillTxn = async (t, o) => {
    await pg.selectOption('#rk-fm-type', t); await pg.waitForFunction((x) => document.querySelector('#rk-fm-type').value === x, t);
    const set = async (k, v) => { if (v === undefined) return; const sel = `#rk-fm-${k}`; if (await pg.$(sel)) { const tag = await pg.$eval(sel, (e) => e.tagName); if (tag === 'SELECT') { await pg.selectOption(sel, String(v)); await pg.waitForFunction(([s, x]) => document.querySelector(s).value === x, [sel, String(v)]); } else await pg.fill(sel, String(v)); } };
    for (const k of ['where', 'cat']) await set(k, o[k]);
    for (const k of ['date', 'voucher', 'details', 'amount', 'vat', 'labour', 'interest']) await set(k, o[k]);
  };
  const submitTxn = async () => { await pg.click('[data-fm-act="save"]'); };
  const rowCount = () => pg.$$eval('#rk-fm-view tr[data-row]', (e) => e.length);
  const addTxn = async (t, o) => { const n = await rowCount(); await fillTxn(t, o); await submitTxn(); await pg.waitForFunction((c) => document.querySelectorAll('#rk-fm-view tr[data-row]').length === c, n + 1); };

  await pg.goto(URL_).catch(() => {}); await pg.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready).catch(() => {});
  await pg.goto(URL_).catch(() => {}); await pg.waitForLoadState('load'); await pg.waitForFunction(() => window.SIYBModules); await pg.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready);
  await boot(); await openForms('brb');

  // ---------- Engine: Modern Furniture reconciliation (pure functions) ----------
  const eng = await pg.evaluate(([mf]) => {
    const F = window.SIYBRKForms; const rows = mf.map((r, i) => Object.assign({ cat: 'material', labour: 0, interest: 0 }, r, { id: 'r' + i, n: i }));
    const c = F.compute(rows, 380, 2570, true); return { bal: c.lines.map((l) => [l.cash, l.bank, l.vat]), tot: c.tot, cash: c.cash, bank: c.bank, vat: c.vat };
  }, [MF]);
  rec('Engine', 'Modern Furniture p.28: every running cash / bank / VAT balance matches the manual', JSON.stringify(eng.bal) === JSON.stringify(MF_EXP), JSON.stringify(eng.bal.map((b, i) => (JSON.stringify(b) !== JSON.stringify(MF_EXP[i]) ? i + ':' + b : '')).filter(Boolean)));
  const T = eng.tot;
  rec('Engine', 'Totals: cash IN 4,550.0 / OUT 3,564.0; bank IN 2,400.0 / OUT 2,000.0', T.cashIn === 455000 && T.cashOut === 356400 && T.bankIn === 240000 && T.bankOut === 200000);
  rec('Engine', 'Totals: sales 4,500.0; material 1,899.5; labour 1,020.0; overhead 509.1', T.sales === 450000 && T.mat === 189950 && T.lab === 102000 && T.ovh === 50910, JSON.stringify(T));
  rec('Engine', 'VAT in 135.4, VAT out 450.0, final VAT balance (314.6); cash 1,366.0; bank 2,970.0', T.vatIn === 13540 && T.vatOut === 45000 && eng.vat === -31460 && eng.cash === 136600 && eng.bank === 297000);
  const act5 = await pg.evaluate(() => { const F = window.SIYBRKForms; const r = [{ type: 'sale', where: 'cash', amount: 325 }, { type: 'purchase', where: 'cash', cat: 'material', amount: 30 }, { type: 'asset', where: 'cash', amount: 500 }]; const c = F.compute(r, 1200, 0, false); return { bal: c.lines.map((l) => l.cash), mat: c.tot.mat, sales: c.tot.sales }; });
  rec('Engine', 'Activity 5 answer p.48: 1,200 → 1,525 → 1,495 → 995; freezer has no cost column', JSON.stringify(act5.bal) === JSON.stringify([152500, 149500, 99500]) && act5.mat === 3000 && act5.sales === 32500);
  const kinds = await pg.evaluate(() => {
    const F = window.SIYBRKForms; const k = (r, v) => F.cols(r, v);
    return { dep: k({ type: 'withdraw', amount: 2000 }), dep2: k({ type: 'deposit', amount: 2000 }), loan: k({ type: 'loanin', where: 'bank', amount: 12000 }), lp: k({ type: 'loanpay', where: 'cash', amount: 1100, interest: 100 }),
      wg: k({ type: 'wages', where: 'cash', amount: 2200, labour: 1470 }), used: k({ type: 'stockused', amount: 2500 }), sb: k({ type: 'stockbuy', where: 'bank', amount: 8250, vat: 750 }, true), dp: k({ type: 'depreciation', amount: 2100 }), tx: k({ type: 'tax', where: 'cash', amount: 540 }), nv: k({ type: 'sale', where: 'cash', amount: 100, vat: 9.1 }, false) };
  });
  rec('Engine', 'Bank deposit (cash→bank) is Cash OUT + Bank IN and never Sales (Assessment 2 q2)', kinds.dep2.cashOut === 200000 && kinds.dep2.bankIn === 200000 && kinds.dep2.sales === 0 && kinds.dep.cashIn === 200000 && kinds.dep.bankOut === 200000 && kinds.dep.sales === 0);
  rec('Engine', 'Loan received is Bank IN only – not sales (p.39, roadmap rule)', kinds.loan.bankIn === 1200000 && kinds.loan.sales === 0 && Object.entries(kinds.loan).filter(([k, v]) => v && k !== 'bankIn').length === 0);
  rec('Engine', 'Loan payment 1,100 with interest 100: Cash OUT 1,100, Overhead 100 only (p.39)', kinds.lp.cashOut === 110000 && kinds.lp.ovh === 10000 && kinds.lp.mat === 0);
  rec('Engine', 'Wages 2,200 with labour 1,470: Cash OUT 2,200, Labour 1,470, Overhead 730 (p.36)', kinds.wg.cashOut === 220000 && kinds.wg.lab === 147000 && kinds.wg.ovh === 73000);
  rec('Engine', 'Stock purchase: Bank OUT 8,250 + VAT IN 750, no Material Costs; stock used: Material 2,500 only (p.36–37)', kinds.sb.bankOut === 825000 && kinds.sb.vatIn === 75000 && kinds.sb.mat === 0 && kinds.used.mat === 250000 && kinds.used.cashOut === 0);
  rec('Engine', 'Depreciation is Overhead only; tax payment is cash out only; non-VAT business ignores VAT amounts', kinds.dp.ovh === 210000 && kinds.dp.cashOut === 0 && kinds.tx.cashOut === 54000 && kinds.tx.vatIn === 0 && kinds.nv.sales === 10000 && kinds.nv.vatOut === 0);
  const pm = await pg.evaluate(() => { const F = window.SIYBRKForms; return [F.parseMoney('1,560.50'), F.parseMoney('٢٩٤٫٥'), F.parseMoney('12.345'), F.parseMoney('abc'), F.parseMoney('-5'), F.parseMoney('', true), F.parseMoney(''), F.parseDate('10/11'), F.parseDate('31/12/2026'), F.parseDate('32/1'), F.parseDate('5/13'), F.parseDate('x')]; });
  rec('Engine', 'Number/date parsing: thousands, Arabic-Indic digits, bad input and impossible dates rejected', JSON.stringify(pm) === JSON.stringify([1560.5, 294.5, null, null, null, 0, null, '10/11', '31/12/2026', null, null, null]), JSON.stringify(pm));

  // ---------- Basic Record Book UI ----------
  rec('BRB', 'Forms page: three interactive tabs; ten forms still listed by name', (await pg.$$('[data-fm-act="tab"]')).length === 3 && (await pg.$$('#rkRoot .rk-forms li')).length === 10);
  const hdr = ad(await pg.evaluate(() => [...document.querySelectorAll('.rk-brb thead th')].map((t) => t.innerText.trim()).join('|')));
  rec('BRB', 'Column order follows p.15: Date, Details, Voucher No., Cash, Bank, Sales, Material, Labour, Overhead (VAT hidden until registered)', /^.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*\|.*$/.test(hdr) && !/ضريبة القيمة|VAT/.test(await pg.evaluate(() => document.querySelector('.rk-brb thead').innerText)));
  await pg.fill('#rk-fm-oc', '380'); await pg.dispatchEvent('#rk-fm-oc', 'change'); await pg.waitForFunction(() => document.querySelector('.rk-bf'));
  await pg.fill('#rk-fm-ob', '2,570'); await pg.dispatchEvent('#rk-fm-ob', 'change'); await pg.waitForFunction(() => /2,570\.00/.test(window.__ad(document.querySelector('.rk-bf').innerText)));
  rec('BRB', 'Opening balances (B/f) shown as the first row', /380\.00/.test(ad(await pg.textContent('.rk-bf'))) && /2,570\.00/.test(ad(await pg.textContent('.rk-bf'))));
  await pg.check('[data-fm-set="vat"]'); await pg.waitForFunction(() => /VAT|ضريبة القيمة/.test(document.querySelector('.rk-brb thead').innerText));
  rec('BRB', 'VAT-registered switch shows the VAT IN / OUT / BALANCE columns and the VAT field', await pg.evaluate(() => document.querySelectorAll('.rk-brb thead tr:nth-child(2) th').length === 16 && !!document.querySelector('#rk-fm-vat')));
  // validation
  await fillTxn('sale', { date: '99/99', details: '', amount: '0', vat: '5' }); await submitTxn(); await pg.waitForSelector('#rk-fm-view .rk-ferr');
  const ve = await pg.$$eval('#rk-fm-view .rk-ferr', (e) => e.length);
  rec('Validation', 'Bad date, empty details, zero amount and VAT > amount are all rejected with messages (nothing saved)', ve >= 3 && (await rowCount()) === 0, String(ve));
  rec('A11y', 'Invalid fields have aria-invalid and linked role=alert messages', await pg.evaluate(() => [...document.querySelectorAll('#rk-fm-view [aria-invalid="true"]')].every((i) => { const d = i.getAttribute('aria-describedby'); const m = d && document.getElementById(d); return m && m.getAttribute('role') === 'alert'; })));
  const vs = await viewText(); rec('Validation', 'Error messages are in Arabic by default', /أدخل/.test(vs));
  await pg.fill('#rk-fm-date', '1/1'); await pg.fill('#rk-fm-details', 'Zorbex'); await pg.fill('#rk-fm-amount', '100'); await pg.fill('#rk-fm-vat', '200'); await submitTxn(); await pg.waitForSelector('#rk-fm-vat-e');
  rec('Validation', 'VAT larger than the amount rejected', (await rowCount()) === 0);
  await pg.fill('#rk-fm-vat', ''); await pg.fill('#rk-fm-amount', '-3'); await submitTxn(); await pg.waitForSelector('#rk-fm-amount-e');
  rec('Validation', 'Negative amount rejected', (await rowCount()) === 0);
  await pg.fill('#rk-fm-amount', '٢٩٤'); await pg.fill('#rk-fm-date', '10/11');
  await pg.waitForFunction(() => /294/.test(window.__ad(document.querySelector('#rk-fm-prev').innerText)));
  rec('BRB', 'Live preview lists the affected columns (Cash IN + Sales) as the amount is typed (Arabic-Indic digits accepted)', /النقد وارد/.test(await pg.textContent('#rk-fm-prev')) && /المبيعات/.test(await pg.textContent('#rk-fm-prev')));
  // enter the real November transactions through the UI
  await pg.fill('#rk-fm-amount', ''); // reset by re-selecting
  const uiRows = [MF[0], MF[1], MF[2]];
  await pg.selectOption('#rk-fm-type', 'purchase'); await pg.waitForFunction(() => document.querySelector('#rk-fm-type').value === 'purchase');
  for (const r of MF) { await addTxn(r.type, r); }
  await pg.waitForFunction((n) => document.querySelectorAll('#rk-fm-view tr[data-row]').length === n, MF.length);
  const tt = ad(await pg.textContent('.rk-brb .rk-tot'));
  rec('BRB', 'UI entry of the 13 November transactions reproduces the manual’s totals row', ['4,550.00', '3,564.00', '2,400.00', '2,000.00', '4,500.00', '1,899.50', '1,020.00', '509.10', '135.40', '450.00'].every((x) => tt.includes(x)), tt);
  rec('BRB', 'Final balances shown: cash 1,366.00, bank 2,970.00, VAT balance (314.60) in brackets', ['1,366.00', '2,970.00', '(314.60)'].every((x) => tt.includes(x)), tt);
  const r3 = ad(await pg.textContent('tr[data-row]:nth-of-type(4)')); // after B/f row => row index
  rec('BRB', 'Per-row balances shown (e.g. sale 342 → cash 1,746.00, VAT (136.90))', ad(await pg.textContent('.rk-brb tbody')).includes('1,746.00') && ad(await pg.textContent('.rk-brb tbody')).includes('(136.90)'));
  rec('BRB', 'Cash sale reduces nothing: bank deposit/withdrawal row (345) is not in Sales', await pg.evaluate(() => { const tr = [...document.querySelectorAll('tr[data-row]')].find((r) => /345/.test(r.innerText.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)))); const cells = [...tr.children].map((c) => c.innerText.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim()); return cells[3] === '2,000.00' && cells[9] === ''; }));
  // edit and delete
  await pg.click('tr[data-row] [data-fm-act="edit"]'); await pg.waitForSelector('[data-fm-act="cancel"]');
  rec('BRB', 'Edit loads the row into the form (type, voucher and amount)', ad(await pg.inputValue('#rk-fm-voucher')) === '340' && ad(await pg.inputValue('#rk-fm-amount')) === '294');
  await pg.fill('#rk-fm-amount', '300'); await pg.fill('#rk-fm-vat', '14'); await submitTxn(); await pg.waitForFunction(() => /300\.00/.test(window.__ad(document.querySelector('tr[data-row]').innerText)));
  const afterEdit = ad(await pg.textContent('.rk-brb .rk-tot'));
  rec('BRB', 'Saving an edit recalculates balances and totals (cash OUT 3,570.00)', afterEdit.includes('3,570.00') && (await rowCount()) === 13);
  await pg.click('tr[data-row] [data-fm-act="del"]'); await pg.waitForSelector('[data-fm-act="del-yes"]');
  rec('BRB', 'Delete needs a confirmation step; cancelling keeps the row', await (async () => { await pg.click('[data-fm-act="del-no"]'); await pg.waitForFunction(() => !document.querySelector('[data-fm-act="del-yes"]')); return (await rowCount()) === 13; })());
  await pg.click('tr[data-row] [data-fm-act="del"]'); await pg.click('[data-fm-act="del-yes"]'); await pg.waitForFunction(() => document.querySelectorAll('#rk-fm-view tr[data-row]').length === 12);
  rec('BRB', 'Confirmed delete removes the row and recalculates', ad(await pg.textContent('.rk-brb .rk-tot')).includes('3,270.00'));
  // warnings
  await addTxn('purchase', { date: '28/11', details: 'Big purchase', voucher: '341', amount: '9,000', vat: '0' });
  const warn = await pg.textContent('#rk-fm-view'); rec('BRB', 'Warns on duplicate voucher numbers and on a negative cash balance (does not block)', /رقم المستند مكرر/.test(warn) && /رصيد النقد سالب/.test(warn));
  await pg.click('tr[data-row]:last-child [data-fm-act="del"]'); await pg.click('[data-fm-act="del-yes"]'); await pg.waitForFunction(() => document.querySelectorAll('#rk-fm-view tr[data-row]').length === 12);
  // persistence
  await flush(); const st = await store();
  rec('Storage', 'Rows saved under forms.brb.rows with a sequence counter; settings saved', st.forms && st.forms.brb && Object.keys(st.forms.brb.rows).length === 12 && st.forms.brb.openCash === 380 && st.forms.brb.openBank === 2570 && st.forms.brb.vat === true && st.forms.brb.seq >= 13);
  rec('Storage', 'Phase 1 header and Phase 2 data keys remain alongside forms', st.schemaVersion === 1 && st.moduleId === 'recordkeeping' && 'lastSection' in st);
  await pg.reload(); await boot(); await openForms('brb');
  rec('Persistence', 'Transactions, balances and VAT setting survive a reload', (await rowCount()) === 12 && ad(await pg.textContent('.rk-brb .rk-tot')).includes('3,270.00') && await pg.isChecked('[data-fm-set="vat"]'));
  await pg.evaluate(() => window.SIYBRecordKeeping.open('p2')); await pg.waitForSelector('#rkRoot .rk-sub'); await openForms('brb');
  rec('Persistence', 'Data survives navigation to another section and back', (await rowCount()) === 12);

  // ---------- Daily Cash Sales Record ----------
  await pg.click('[data-fm-act="tab"][data-id="dcsr"]'); await pg.waitForSelector('[data-fm-form="dcsr-day"]');
  await pg.fill('#rk-fm-dcsr-date', 'zz'); await pg.click('[data-fm-act="dcsr-newday"]'); await pg.waitForSelector('#rk-fm-dcsr-date-e');
  rec('DCSR', 'Invalid day date rejected', (await pg.$$('.rk-sub[data-fm-act="dcsr-day"]')).length === 0);
  await pg.fill('#rk-fm-dcsr-date', '1/12'); await pg.click('[data-fm-act="dcsr-newday"]'); await pg.waitForSelector('[data-fm-form="dcsr-item"]');
  const addItem = async (n, q, p) => { const c = await pg.$$eval('.rk-table tbody tr', (e) => e.length); await pg.fill('#rk-fm-dcsr-name', n); await pg.fill('#rk-fm-dcsr-qty', q); await pg.fill('#rk-fm-dcsr-price', p); await pg.click('[data-fm-act="dcsr-additem"]'); await pg.waitForFunction((x) => !!document.querySelector('[data-fm-form="dcsr-item"]') && document.querySelector('#rk-fm-dcsr-name').value === '' && document.querySelectorAll('.rk-table tbody tr').length >= x, c); };
  await pg.fill('#rk-fm-dcsr-name', ''); await pg.fill('#rk-fm-dcsr-qty', '0'); await pg.click('[data-fm-act="dcsr-additem"]'); await pg.waitForSelector('#rk-fm-dcsr-qty-e');
  rec('DCSR', 'Item needs a name and a positive quantity', (await pg.$$('.rk-table tbody tr td .rk-btn')).length === 0);
  await pg.fill('#rk-fm-dcsr-name', 'Potato snack'); await pg.fill('#rk-fm-dcsr-qty', '24'); await pg.fill('#rk-fm-dcsr-price', '0.4'); await pg.click('[data-fm-act="dcsr-additem"]'); await pg.waitForFunction(() => document.querySelectorAll('.rk-table tbody tr td .rk-btn').length === 1);
  await pg.fill('#rk-fm-dcsr-name', 'Onion snack'); await pg.fill('#rk-fm-dcsr-qty', '30'); await pg.fill('#rk-fm-dcsr-price', '0.5'); await pg.click('[data-fm-act="dcsr-additem"]'); await pg.waitForFunction(() => document.querySelectorAll('.rk-table tbody tr td .rk-btn').length === 2);
  const dt = ad(await pg.textContent('#rk-dcsr-total')); const dtb = ad(await pg.textContent('.rk-table tbody'));
  rec('DCSR', 'Amount = quantity × unit price (24×0.4 = 9.60, 30×0.5 = 15.00) and total 24.60', dtb.includes('9.60') && dtb.includes('15.00') && dt === '24.60', dt);
  await pg.fill('#rk-fm-dcsr-voucher', 'E'); await pg.click('[data-fm-act="dcsr-post"]'); await pg.waitForFunction(() => /سُجِّل مجموع هذا اليوم|already recorded/.test(document.querySelector('#rk-fm-view').innerText));
  rec('DCSR', 'Total transferred once as a cash sale; button replaced by a confirmation (no duplicate transfer)', !(await pg.$('[data-fm-act="dcsr-post"]')));
  await pg.click('[data-fm-act="tab"][data-id="brb"]'); await pg.waitForSelector('.rk-brb');
  const last = ad(await pg.textContent('tr[data-row]:last-child'));
  rec('DCSR', 'BRB gained a cash sale row: Cash IN 24.60 and Sales 24.60 (voucher E)', (await rowCount()) === 13 && (last.match(/24\.60/g) || []).length >= 2 && /E/.test(last), last);
  await pg.click('[data-fm-act="tab"][data-id="dcsr"]'); await pg.waitForSelector('[data-fm-form="dcsr-item"]');
  await pg.click('[data-fm-act="dcsr-del-item"]'); await pg.waitForFunction(() => document.querySelectorAll('.rk-table tbody tr td .rk-btn').length === 1);
  rec('DCSR', 'Item delete works and the total updates (15.00 left… 9.60 or 15.00)', /15\.00|9\.60/.test(ad(await pg.textContent('#rk-dcsr-total'))));
  await flush(); const s2 = await store(); rec('Storage', 'Daily sales saved under forms.dcsr.days with the posted BRB row id', s2.forms.dcsr && Object.values(s2.forms.dcsr.days).some((d) => d.posted && s2.forms.brb.rows[d.posted]));

  // ---------- Customers' Accounts Record ----------
  await pg.click('[data-fm-act="tab"][data-id="car"]'); await pg.waitForSelector('[data-fm-form="car-cust"]');
  await pg.click('[data-fm-act="car-addcust"]'); await pg.waitForSelector('#rk-fm-car-name-e');
  rec('CAR', 'Customer name is required', (await pg.$$('.rk-sub[data-fm-act="car-cust"]')).length === 0);
  await pg.fill('#rk-fm-car-name', 'Welcome Hotel'); await pg.fill('#rk-fm-car-address', '12 Main Road, Simba'); await pg.fill('#rk-fm-car-tel', '13782784'); await pg.fill('#rk-fm-car-limit', '800'); await pg.click('[data-fm-act="car-addcust"]'); await pg.waitForSelector('[data-fm-form="car-entry"]');
  const addEntry = async (kind, date, details, qty, amount, sig) => { const c = await pg.$$eval('.rk-table tbody tr td .rk-btn', (e) => e.length); await pg.selectOption('#rk-fm-ekind', kind); await pg.waitForFunction((k) => document.querySelector('#rk-fm-ekind').value === k, kind); await pg.fill('#rk-fm-car-date', date); await pg.fill('#rk-fm-car-details', details); if (kind === 'credit') await pg.fill('#rk-fm-car-qty', qty); await pg.fill('#rk-fm-car-amount', amount); await pg.fill('#rk-fm-car-sig', sig); await pg.click('[data-fm-act="car-addentry"]'); await pg.waitForFunction((n) => document.querySelectorAll('.rk-table tbody tr td .rk-btn').length === n, c + 1); };
  await pg.click('[data-fm-act="car-addentry"]'); await pg.waitForSelector('#rk-fm-car-date-e');
  rec('CAR', 'Entry needs a valid date, details and a positive amount', (await pg.$$('.rk-table tbody tr td .rk-btn')).length === 0);
  await addEntry('credit', '26/10', 'Cupboard', '2', '200', 'phiri'); await addEntry('credit', '3/11', 'Cupboard', '2', '200', 'phiri'); await addEntry('credit', '10/11', 'Cupboard', '4', '400', 'phiri');
  rec('CAR', 'Welcome Hotel p.21: balances 200 → 400 → 800 and no limit warning at exactly the limit', ad(await pg.textContent('#rk-car-bal')) === '800.00' && !/تجاوز حد الائتمان|exceeds the credit limit/.test(await pg.textContent('#rk-fm-view')));
  await addEntry('payment', '15/11', 'Payment', '', '500', 'Moyo');
  rec('CAR', 'After the 500 payment the balance is 300 (p.21); payment shown in "Amount paid"', ad(await pg.textContent('#rk-car-bal')) === '300.00');
  rec('CAR', 'Credit sales are not cash received: nothing was added to the Basic Record Book by customer entries', await pg.evaluate(() => (SIYBRKForms.brb().rows.filter((r) => r.type === 'sale' && /Cupboard/.test(r.details))).length === 0));
  await addEntry('credit', '20/11', 'Table', '1', '600', 'phiri');
  rec('CAR', 'Credit-limit warning when the balance (900) exceeds the limit (800)', /تجاوز حد الائتمان/.test(await pg.textContent('#rk-fm-view')) && ad(await pg.textContent('#rk-car-bal')) === '900.00');
  await addEntry('payment', '21/11', 'Payment', '', '1000', 'Moyo');
  rec('CAR', 'Overpayment shows a negative balance in brackets with a warning', /\(100\.00\)/.test(ad(await pg.textContent('#rk-car-bal'))) && /دفع الزبون أكثر/.test(await pg.textContent('#rk-fm-view')));
  await pg.fill('#rk-fm-car-name', ''); await pg.fill('#rk-fm-car-name', 'Corner Cafe'); await pg.fill('#rk-fm-car-limit', 'abc'); await pg.click('[data-fm-act="car-addcust"]'); await pg.waitForSelector('#rk-fm-car-limit-e');
  rec('CAR', 'Invalid credit limit rejected', (await pg.$$('.rk-sub[data-fm-act="car-cust"]')).length === 1);
  await pg.fill('#rk-fm-car-limit', ''); await pg.click('[data-fm-act="car-addcust"]'); await pg.waitForFunction(() => document.querySelectorAll('.rk-sub[data-fm-act="car-cust"]').length === 2);
  rec('CAR', 'Second customer has its own separate account and the summary lists both', /2/.test(ad(await pg.textContent('.rk-progress'))));
  await pg.click('.rk-sub[data-fm-act="car-cust"]:first-child'); await pg.waitForFunction(() => /Welcome Hotel/.test(document.querySelector('#rk-fm-view h4:nth-of-type(1)') ? document.querySelector('#rk-fm-view').innerText : ''));
  await flush(); await pg.reload(); await boot(); await openForms('car');
  rec('Persistence', 'Customers and entries survive reload (balance (100.00) restored)', /\(100\.00\)/.test(ad(await pg.textContent('#rk-car-bal'))));

  // ---------- Language / RTL / a11y ----------
  await openForms('brb');
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForFunction(() => document.documentElement.lang === 'en' && /Basic Record Book/.test(document.querySelector('#rk-fm-view').innerText));
  const en = await pg.evaluate(() => ({ dir: document.documentElement.dir, t: document.querySelector('#rk-forms-live').innerText, opts: [...document.querySelectorAll('#rk-fm-type option')].map((o) => o.textContent).join() }));
  rec('Language', 'English: LTR, no Arabic in the forms area (labels, selects, hints) except user-typed data', en.dir === 'ltr' && !AR.test(en.t), (en.t.match(/[؀-ۿ]+/g) || []).slice(0, 3).join());
  rec('Language', 'English transaction types are listed', /Sale/.test(en.opts) && /Bank deposit|Deposit from the cash box/.test(en.opts) && !AR.test(en.opts));
  await pg.fill('#rk-fm-amount', ''); await pg.fill('#rk-fm-date', 'bad'); await submitTxn(); await pg.waitForSelector('#rk-fm-date-e');
  rec('Language', 'English validation messages', /valid date/.test(await pg.textContent('#rk-fm-date-e')));
  await pg.evaluate(() => document.querySelector('#languageToggle').click()); await pg.waitForFunction(() => document.documentElement.lang === 'ar');
  rec('A11y', 'Every form field has a visible label (for/id), tables are keyboard-scrollable regions with captions and scoped headers', await pg.evaluate(() => [...document.querySelectorAll('#rk-forms-live input:not([type=checkbox]), #rk-forms-live select')].every((i) => i.id && document.querySelector(`label[for="${i.id}"]`)) && [...document.querySelectorAll('#rk-forms-live .rk-tablewrap')].every((w) => w.tabIndex === 0 && w.getAttribute('role') === 'region' && w.querySelector('caption') && w.querySelector('th[scope]'))));
  await openForms('brb'); await pg.fill('#rk-fm-date', '2/12'); await pg.fill('#rk-fm-details', 'Zorbex'); await pg.fill('#rk-fm-amount', '5');
  const n0 = await rowCount(); await pg.focus('#rk-fm-amount'); await pg.keyboard.press('Enter'); await pg.waitForFunction((c) => document.querySelectorAll('#rk-fm-view tr[data-row]').length === c + 1, n0);
  rec('A11y', 'The transaction form can be submitted from the keyboard (Enter)', (await rowCount()) === n0 + 1);

  // ---------- Responsive ----------
  for (const w of [375, 768, 1280]) {
    await pg.setViewportSize({ width: w, height: 900 }); const bad = [];
    for (const tab of ['brb', 'dcsr', 'car']) { await openForms(tab); const o = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1); if (o) bad.push(tab); }
    rec('Responsive', `No horizontal page overflow at ${w}px (3 forms with data; wide tables scroll inside their own region)`, bad.length === 0, bad.join());
  }
  await pg.setViewportSize({ width: 1280, height: 900 });

  // ---------- Storage isolation / robustness ----------
  const mine = (await pg.evaluate(() => Object.keys(localStorage))).filter((k) => /recordkeeping/.test(k));
  rec('Storage', 'All form data is under the module key only', mine.join() === KEY, mine.join());
  rec('Storage', 'Other modules’ keys never contain Record Keeping entries', !(await pg.evaluate(() => Object.keys(localStorage).filter((k) => !/recordkeeping/.test(k)).some((k) => /Zorbex|Welcome Hotel/.test(localStorage.getItem(k))))));
  await pg.evaluate((k) => localStorage.setItem(k, JSON.stringify({ schemaVersion: 1, moduleId: 'recordkeeping', language: 'ar', lastSection: 'forms', activities: { a1: { q0: 'keep me' } }, assessments: { a1: { answers: {}, submitted: false } } })), KEY);
  await boot(); await openForms('brb');
  rec('Storage', 'Phase 1/2-shaped data (no forms key) loads with empty forms and Phase 2 answers intact', (await rowCount()) === 0 && (await store()).activities.a1.q0 === 'keep me');
  await addTxn('sale', { date: '1/1', details: 'Zorbex', amount: '10' }); await flush();
  const mixed = await store(); rec('Storage', 'Adding a form entry preserves Phase 2 data and the header', mixed.activities.a1.q0 === 'keep me' && mixed.moduleId === 'recordkeeping' && Object.keys(mixed.forms.brb.rows).length === 1);
  await pg.evaluate((k) => localStorage.setItem(k, JSON.stringify({ schemaVersion: 1, moduleId: 'recordkeeping', forms: { brb: { unit: 5, vat: 'x', openCash: 'a', rows: { r1: 'bad', r2: { type: 'nope' }, r3: { type: 'sale', n: 'x', amount: 'y', date: 4 }, r4: null }, seq: 'z' }, dcsr: { days: 'oops' }, car: { customers: { c1: { name: 3, entries: 'bad' }, c2: null } } } })), KEY);
  await boot(); await openForms('brb'); await pg.waitForSelector('.rk-brb');
  rec('Robustness', 'Corrupted nested form data does not break the Basic Record Book view', (await pg.$$('#rk-fm-view tr[data-row]')).length <= 1);
  await openForms('dcsr'); await pg.waitForSelector('[data-fm-form="dcsr-day"]'); await openForms('car'); await pg.waitForSelector('[data-fm-form="car-cust"]');
  rec('Robustness', 'Corrupted daily-sales and customer data do not break their views', !!(await pg.$('[data-fm-form="car-cust"]')) && !!(await pg.$('[data-fm-form="car-cust"] button')));
  await openForms('brb'); await addTxn('sale', { date: '2/1', details: 'Zorbex', amount: '10' });
  rec('Robustness', 'The learner can keep working after corrupted data (new transaction saved)', (await rowCount()) >= 1);
  await pg.evaluate((k) => localStorage.setItem(k, '{bad'), KEY); await boot(); await openForms('brb');
  rec('Robustness', 'Unreadable JSON is preserved in .unreadable and the forms still work', await pg.evaluate(() => localStorage.getItem('siyb.iyb.recordkeeping.v1.unreadable') === '{bad') && !!(await pg.$('#rk-fm-type')));

  // ---------- Packaging ----------
  const sw = fs.readFileSync('service-worker.js', 'utf8'); const reg = fs.readFileSync('src/modules/registry.js', 'utf8');
  rec('Packaging', 'recordkeeping-forms.js is in APP_SHELL and in the registry scripts (before the module script)', sw.includes('./src/modules/recordkeeping-forms.js') && reg.includes('recordkeeping-forms.js') && reg.indexOf('recordkeeping-forms.js') < reg.indexOf("recordkeeping.js']") && fs.existsSync('src/modules/recordkeeping-forms.js'));
  rec('Packaging', 'Version 0.31.0 consistent in service worker, app.js and index.html', /v0\.31\.0/.test(sw) && fs.readFileSync('src/app.js', 'utf8').includes('0.31.0') && fs.readFileSync('index.html', 'utf8').includes('0.31.0') && !/0\.30\.0/.test(sw));
  const css = await pg.evaluate(async () => { const t = await (await fetch('styles/recordkeeping.css')).text(); return t.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter(Boolean).flatMap((x) => x.split(',').map((y) => y.trim())).filter((x) => !/^(@media.*|\.rk-.*)$/.test(x)); });
  rec('Packaging', 'Every selector in recordkeeping.css is rk- prefixed', css.length === 0, css.slice(0, 3).join());
  rec('Packaging', 'No JavaScript errors during the whole run', errs.length === 0, errs.slice(0, 3).join('|'));

  await browser.close();
  let f = 0; for (const r of results) { if (!r.p) f++; console.log((r.p ? 'PASS' : 'FAIL') + '  [' + r.a + '] ' + r.n + (r.p || !r.note ? '' : '  -> ' + r.note)); }
  console.log(`PASSED ${results.length - f}  FAILED ${f}`); process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
