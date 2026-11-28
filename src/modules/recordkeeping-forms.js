/* IYB Record Keeping - Phase 3: interactive core forms (Basic Record Book, Daily Cash Sales Record, Customers' Accounts Record).
   Column layout and the effect of each transaction on the columns follow the English manual (pp.14-30, 36-39, 41; Modern Furniture example p.28).
   The tool assumes NO currency and NO tax rate: VAT is always an amount typed by the learner. Balances/totals are plain, transparent sums.
   Arabic is a PRELIMINARY translation. Stored under the module's own key: forms.brb / forms.dcsr / forms.car. Scoped under .rk-root. */
(() => {
  'use strict';
  const store = window.SIYBRecordKeepingStore;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const B = (ar, en) => ({ ar, en });
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);

  /* ---------- parsing / formatting ---------- */
  const norm = (s) => String(s ?? '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٫]/g, '.').replace(/[٬،]/g, ',').trim();
  /** money text -> number (max 2 decimals, >= 0) or null when invalid; '' -> 0 when allowEmpty */
  function parseMoney(s, allowEmpty) {
    const t = norm(s).replace(/\s/g, '');
    if (t === '') return allowEmpty ? 0 : null;
    const u = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t) ? t.replace(/,/g, '') : t;
    if (!/^\d+(\.\d{1,2})?$/.test(u)) return null;
    return Math.round(parseFloat(u) * 100) / 100;
  }
  function parseDate(s) {
    const t = norm(s); let m;
    if ((m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?$/.exec(t))) { const d = +m[1], mo = +m[2]; return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 ? t : null; }
    if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t))) { const mo = +m[2], d = +m[3]; return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 ? t : null; }
    return null;
  }
  const c100 = (n) => Math.round((Number(n) || 0) * 100);
  const fmt = (cents, brackets) => {
    const neg = cents < 0; const a = Math.abs(cents) / 100;
    const s = a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return neg ? (brackets ? '(' + s + ')' : '-' + s) : s;
  };

  /* ---------- Basic Record Book: transaction types ---------- */
  const WHERE = { cash: B('نقداً', 'Cash'), bank: B('عبر المصرف', 'Bank') };
  const CAT = { material: B('تكاليف المواد', 'Material Costs'), overhead: B('النفقات العامة', 'Overhead Expenses') };
  const TYPES = {
    sale: { t: B('بيع (نقداً أو عبر المصرف)', 'Sale (cash or bank)'), pg: '23–28', f: ['where', 'amount', 'vat'], amt: B('المبلغ المستلم', 'Amount received'),
      eff: B('يُكتب المبلغ في «النقد الوارد» أو «المصرف الوارد» وفي «المبيعات» (بعد استثناء ضريبة القيمة المضافة)، وتُكتب ضريبة القيمة المضافة في «صادر».', 'The amount goes in “Cash in” or “Bank in” and in “Sales” (VAT excluded); the VAT amount goes in “VAT out”.') },
    purchase: { t: B('شراء مواد أو دفع مصروف', 'Purchase of materials / payment of an expense'), pg: '24–28', f: ['where', 'cat', 'amount', 'vat'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('يُكتب المبلغ في «النقد الصادر» أو «المصرف الصادر» وفي عمود التكلفة (بعد استثناء الضريبة)، وتُكتب الضريبة في «وارد».', 'The amount goes in “Cash out” or “Bank out” and in the cost column (VAT excluded); the VAT goes in “VAT in”.') },
    wages: { t: B('أجور أو راتب', 'Wages or salary'), pg: '26–28, 36', f: ['where', 'amount', 'labour'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('يُكتب المبلغ في «النقد الصادر» (أو المصرف) ويُوزَّع على «تكاليف العمالة» و«النفقات العامة»؛ الباقي بعد تكاليف العمالة يُسجَّل نفقات عامة.', 'The amount goes in “Cash out” (or bank) and is split between “Labour Costs” and “Overhead Expenses”; what is not labour is recorded as overhead.') },
    deposit: { t: B('إيداع من صندوق النقد في المصرف', 'Deposit from the cash box into the bank'), pg: '27, Assessment 2', f: ['amount'], amt: B('المبلغ المودَع', 'Amount deposited'),
      eff: B('«النقد الصادر» و«المصرف الوارد» فقط. ليس بيعاً ولا يُكتب في «المبيعات».', '“Cash out” and “Bank in” only. It is not a sale and is not written in “Sales”.') },
    withdraw: { t: B('سحب من المصرف إلى صندوق النقد', 'Withdrawal from the bank into the cash box'), pg: '27–28', f: ['amount'], amt: B('المبلغ المسحوب', 'Amount withdrawn'),
      eff: B('«النقد الوارد» و«المصرف الصادر» فقط. ليس بيعاً ولا يُكتب في «المبيعات».', '“Cash in” and “Bank out” only. It is not a sale and is not written in “Sales”.') },
    loanin: { t: B('استلام قرض', 'Loan received'), pg: '39', f: ['where', 'amount'], amt: B('مبلغ القرض', 'Loan amount'),
      eff: B('«النقد الوارد» أو «المصرف الوارد» فقط بحسب مكان وضع المال. القرض ليس مبيعات. ويُسجَّل أيضاً في سجل القروض (مرحلة لاحقة).', '“Cash in” or “Bank in” only, depending on where you put the money. A loan is not sales. It is also recorded in the Loan Record (later phase).') },
    loanpay: { t: B('سداد دفعة قرض', 'Loan payment'), pg: '39', f: ['where', 'amount', 'interest'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('«النقد الصادر» أو «المصرف الصادر» بالمبلغ كاملاً، وجزء الفائدة فقط في «النفقات العامة».', '“Cash out” or “Bank out” for the full amount; only the interest part goes in “Overhead Expenses”.') },
    asset: { t: B('شراء أصل (آلة أو معدات)', 'Purchase of an asset (machine / equipment)'), pg: '30–33', f: ['where', 'amount', 'vat'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('«النقد الصادر» أو «المصرف الصادر» وضريبة القيمة المضافة «وارد» فقط؛ لا يُكتب في أعمدة التكاليف. ويُسجَّل في سجل الأصول (مرحلة لاحقة).', '“Cash out” or “Bank out” and “VAT in” only; nothing in the cost columns. It is also recorded in the Asset Register (later phase).') },
    stockbuy: { t: B('شراء مخزون لعدة أشهر', 'Purchase of stock for several months'), pg: '36–37', f: ['where', 'amount', 'vat'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('«النقد الصادر» أو «المصرف الصادر» وضريبة القيمة المضافة «وارد» فقط؛ لا تُكتب تكاليف المواد إلا عند الاستخدام. ويُسجَّل في سجل المخزون (مرحلة لاحقة).', '“Cash out” or “Bank out” and “VAT in” only; Material Costs are recorded only when the stock is used. It is also recorded in the Inventory Record (later phase).') },
    stockused: { t: B('مواد مخزون مستخدمة في الشهر', 'Stock used during the month'), pg: '36–37', f: ['amount'], amt: B('قيمة المواد المستخدمة', 'Value of material used'),
      eff: B('«تكاليف المواد» فقط، دون حركة نقد أو مصرف.', '“Material Costs” only, with no cash or bank movement.') },
    tax: { t: B('تقديم/دفع ضريبة', 'Tax submitted / paid'), pg: '41', f: ['where', 'amount'], amt: B('المبلغ المدفوع', 'Amount paid'),
      eff: B('«النقد الصادر» أو «المصرف الصادر» فقط. ويُسجَّل أيضاً في سجل الضرائب المستحقة (مرحلة لاحقة).', '“Cash out” or “Bank out” only. It is also recorded in the Tax Payable Record (later phase).') },
    depreciation: { t: B('إهلاك (آخر قيد في السنة)', 'Depreciation (last entry of the year)'), pg: '33–34', f: ['amount'], amt: B('الإهلاك السنوي', 'Yearly depreciation'),
      eff: B('«النفقات العامة» فقط، دون حركة نقد أو مصرف.', '“Overhead Expenses” only, with no cash or bank movement.') }
  };
  const TYPE_IDS = Object.keys(TYPES);
  const ZERO = () => ({ cashIn: 0, cashOut: 0, bankIn: 0, bankOut: 0, sales: 0, mat: 0, lab: 0, ovh: 0, vatIn: 0, vatOut: 0 });
  /** Columns (in cents) affected by one row. Pure. */
  function cols(r, vatReg) {
    const c = ZERO(); const t = TYPES[r.type]; if (!t) return c;
    const A = c100(r.amount); const V = vatReg ? Math.min(c100(r.vat), A) : 0; const W = r.where === 'bank' ? 'bank' : 'cash';
    switch (r.type) {
      case 'sale': c[W + 'In'] = A; c.sales = A - V; c.vatOut = V; break;
      case 'purchase': c[W + 'Out'] = A; if (r.cat === 'overhead') c.ovh = A - V; else c.mat = A - V; c.vatIn = V; break;
      case 'wages': { const L = Math.min(c100(r.labour), A); c[W + 'Out'] = A; c.lab = L; c.ovh = A - L; break; }
      case 'deposit': c.cashOut = A; c.bankIn = A; break;
      case 'withdraw': c.bankOut = A; c.cashIn = A; break;
      case 'loanin': c[W + 'In'] = A; break;
      case 'loanpay': { const I = Math.min(c100(r.interest), A); c[W + 'Out'] = A; c.ovh = I; break; }
      case 'asset': case 'stockbuy': c[W + 'Out'] = A; c.vatIn = V; break;
      case 'stockused': c.mat = A; break;
      case 'tax': c[W + 'Out'] = A; break;
      case 'depreciation': c.ovh = A; break;
      default: break;
    }
    return c;
  }
  /** Rows -> computed lines with running balances and totals (cents). Pure. */
  function compute(rows, openCash, openBank, vatReg) {
    let cash = c100(openCash), bank = c100(openBank), vat = 0; const tot = ZERO(); const lines = [];
    rows.forEach((r) => {
      const c = cols(r, vatReg);
      cash += c.cashIn - c.cashOut; bank += c.bankIn - c.bankOut; vat += c.vatIn - c.vatOut;
      Object.keys(tot).forEach((k) => { tot[k] += c[k]; });
      lines.push({ row: r, c, cash, bank, vat });
    });
    return { lines, tot, cash, bank, vat, openCash: c100(openCash), openBank: c100(openBank) };
  }

  /* ---------- store access (defensive against corrupted data) ---------- */
  const get = (p, d) => { const v = store.get(p, d); return v === undefined || v === null ? d : v; };
  const num = (v) => (Number.isFinite(v) ? v : 0);
  function brb() {
    const o = get('forms.brb', {}); const b = isObj(o) ? o : {};
    const rows = isObj(b.rows) ? Object.entries(b.rows).filter(([, r]) => isObj(r) && TYPES[r.type]).map(([id, r]) => ({ id, n: num(r.n), type: r.type, date: String(r.date || ''), details: String(r.details || ''), voucher: String(r.voucher || ''), where: r.where === 'bank' ? 'bank' : 'cash', cat: r.cat === 'overhead' ? 'overhead' : 'material', amount: num(r.amount), vat: num(r.vat), labour: num(r.labour), interest: num(r.interest), src: typeof r.src === 'string' ? r.src : '' })).sort((a, b2) => a.n - b2.n) : [];
    return { unit: typeof b.unit === 'string' ? b.unit : '', vat: b.vat === true, openCash: num(b.openCash), openBank: num(b.openBank), rows };
  }
  const DCSR_L = B('سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record');
  const shownDetails = (r) => (r.src.startsWith('dcsr:') && (r.details === DCSR_L.ar || r.details === DCSR_L.en) ? T(DCSR_L) : r.details);
  const nextSeq = (path) => { const n = num(get(path, 0)) + 1; store.set(path, n); return n; };
  function addRow(d) {
    const n = nextSeq('forms.brb.seq'); const id = 'r' + n;
    store.set('forms.brb.rows.' + id, Object.assign({ n }, d)); return id;
  }
  /* ---------- validation ---------- */
  const MSG = {
    date: B('أدخل تاريخاً صحيحاً مثل 10/11 أو 10/11/2026.', 'Enter a valid date such as 10/11 or 10/11/2026.'),
    details: B('اكتب وصف المعاملة في «التفاصيل».', 'Describe the transaction in “Details”.'),
    amount: B('أدخل مبلغاً صحيحاً أكبر من صفر (رقمان عشريان كحد أقصى).', 'Enter a valid amount greater than zero (at most two decimals).'),
    vat: B('مبلغ ضريبة القيمة المضافة غير صحيح أو أكبر من المبلغ.', 'The VAT amount is invalid or larger than the amount.'),
    labour: B('تكاليف العمالة غير صحيحة أو أكبر من المبلغ.', 'Labour Costs are invalid or larger than the amount.'),
    interest: B('الفائدة غير صحيحة أو أكبر من المبلغ.', 'Interest is invalid or larger than the amount.'),
    qty: B('أدخل كمية صحيحة.', 'Enter a valid quantity.'), price: B('أدخل سعر وحدة صحيحاً.', 'Enter a valid unit price.'),
    name: B('اكتب الاسم.', 'Enter the name.'), limit: B('حد الائتمان غير صحيح.', 'The credit limit is invalid.'),
    amt0: B('أدخل مبلغاً صحيحاً أكبر من صفر.', 'Enter a valid amount greater than zero.')
  };
  /** Validate a BRB draft (strings) -> {errors:{field:msg}, row} */
  function validateRow(d, vatReg) {
    const e = {}; const t = TYPES[d.type]; const row = { type: d.type, where: d.where === 'bank' ? 'bank' : 'cash', cat: d.cat === 'overhead' ? 'overhead' : 'material', voucher: String(d.voucher || '').trim(), src: d.src || '' };
    if (!t) { e.type = MSG.amount; return { errors: e, row }; }
    const dt = parseDate(d.date); if (!dt) e.date = MSG.date; row.date = dt || '';
    row.details = String(d.details || '').trim(); if (!row.details) e.details = MSG.details;
    const A = parseMoney(d.amount); if (A === null || A <= 0) e.amount = MSG.amount; row.amount = A || 0;
    if (t.f.includes('vat')) { const V = vatReg ? parseMoney(d.vat, true) : 0; if (V === null || V > row.amount) e.vat = MSG.vat; row.vat = V || 0; }
    if (t.f.includes('labour')) { const L = parseMoney(d.labour, true); if (L === null || L > row.amount) e.labour = MSG.labour; row.labour = L || 0; }
    if (t.f.includes('interest')) { const I = parseMoney(d.interest, true); if (I === null || I > row.amount) e.interest = MSG.interest; row.interest = I || 0; }
    return { errors: e, row };
  }

  /* ---------- UI state (memory only; learner data itself lives in the store) ---------- */
  const ui = { tab: 'brb', draft: {}, edit: null, errors: {}, del: null, dcsr: { day: null, draft: {}, err: {}, post: {} }, car: { cust: null, cdraft: {}, edraft: { kind: 'credit' }, err: {}, ee: null }, clear: null, notice: '' };

  /* ---------- Basic Record Book view ---------- */
  const inputId = (k) => 'rk-fm-' + k;
  function field(k, label, val, err, attrs) {
    return `<div class="rk-fld"><label for="${inputId(k)}">${esc(label)}</label><input id="${inputId(k)}" data-fm-f="${k}" type="text" ${attrs || ''} value="${esc(val ?? '')}"${err ? ` aria-invalid="true" aria-describedby="${inputId(k)}-e"` : ''}>${err ? `<span class="rk-ferr" id="${inputId(k)}-e" role="alert">${esc(T(err))}</span>` : ''}</div>`;
  }
  function brbForm(b) {
    const d = ui.draft; d.type = d.type || 'sale'; const t = TYPES[d.type]; const er = ui.errors;
    const opts = TYPE_IDS.map((id) => `<option value="${id}"${d.type === id ? ' selected' : ''}>${esc(T(TYPES[id].t))}</option>`).join('');
    const sel = (k, label, map, cur) => `<div class="rk-fld"><label for="${inputId(k)}">${esc(label)}</label><select id="${inputId(k)}" data-fm-f="${k}" data-fm-rerender="1">${Object.keys(map).map((o) => `<option value="${o}"${cur === o ? ' selected' : ''}>${esc(T(map[o]))}</option>`).join('')}</select></div>`;
    const money = 'inputmode="decimal" autocomplete="off"';
    const f = t.f;
    return `<form class="rk-form" data-fm-form="brb" novalidate aria-labelledby="rk-fm-h"><h4 id="rk-fm-h">${ui.edit ? X('تعديل معاملة', 'Edit transaction') : X('إضافة معاملة', 'Add a transaction')}</h4>
      <div class="rk-fld"><label for="${inputId('type')}">${X('نوع المعاملة', 'Transaction type')}</label><select id="${inputId('type')}" data-fm-f="type" data-fm-rerender="1">${opts}</select></div>
      <p class="rk-small rk-eff" id="rk-fm-eff"><strong>${X('أثرها على الأعمدة: ', 'Effect on the columns: ')}</strong>${esc(T(t.eff))} <bdi>(${X('ص ', 'p. ')}${esc(t.pg)})</bdi></p>
      <div class="rk-frow">${field('date', X('التاريخ', 'Date'), d.date, er.date, 'inputmode="numeric" placeholder="10/11" autocomplete="off"')}${field('voucher', X('رقم المستند', 'Voucher No.'), d.voucher, er.voucher, 'autocomplete="off"')}</div>
      ${field('details', X('التفاصيل', 'Details'), d.details, er.details, 'autocomplete="off"')}
      <div class="rk-frow">${f.includes('where') ? sel('where', X('طريقة الدفع / الاستلام', 'Paid / received'), WHERE, d.where || 'cash') : ''}${f.includes('cat') ? sel('cat', X('عمود التكلفة', 'Cost column'), CAT, d.cat || 'material') : ''}</div>
      <div class="rk-frow">${field('amount', T(t.amt), d.amount, er.amount, money)}${f.includes('vat') && b.vat ? field('vat', X('منها ضريبة القيمة المضافة (مبلغ)', 'of which VAT (amount)'), d.vat, er.vat, money) : ''}${f.includes('labour') ? field('labour', X('منها تكاليف العمالة', 'of which Labour Costs'), d.labour, er.labour, money) : ''}${f.includes('interest') ? field('interest', X('منها فائدة', 'of which interest'), d.interest, er.interest, money) : ''}</div>
      <div class="rk-prev" id="rk-fm-prev" role="status" aria-live="polite">${prevHtml(b)}</div>
      <div class="rk-actions"><button type="submit" class="rk-btn primary" data-fm-act="save">${ui.edit ? X('حفظ التعديل', 'Save changes') : X('إضافة إلى السجل', 'Add to the record book')}</button>${ui.edit ? `<button type="button" class="rk-btn" data-fm-act="cancel">${X('إلغاء', 'Cancel')}</button>` : ''}</div></form>`;
  }
  const COLN = { cashIn: B('النقد وارد', 'Cash IN'), cashOut: B('النقد صادر', 'Cash OUT'), bankIn: B('المصرف وارد', 'Bank IN'), bankOut: B('المصرف صادر', 'Bank OUT'), sales: B('المبيعات', 'Sales'), mat: B('تكاليف المواد', 'Material Costs'), lab: B('تكاليف العمالة', 'Labour Costs'), ovh: B('النفقات العامة', 'Overhead Expenses'), vatIn: B('ضريبة وارد', 'VAT IN'), vatOut: B('ضريبة صادر', 'VAT OUT') };
  function prevHtml(b) {
    const v = validateRow(ui.draft, b.vat); if (Object.keys(v.errors).length && !v.row.amount) return `<span class="rk-small">${X('أدخل المبلغ لمعاينة الأعمدة المتأثرة.', 'Enter the amount to preview the affected columns.')}</span>`;
    const c = cols(v.row, b.vat); const parts = Object.keys(c).filter((k) => c[k] !== 0).map((k) => `<span class="rk-chip">${esc(T(COLN[k]))}: <bdi>${fmt(c[k])}</bdi></span>`);
    return `<strong>${X('الأعمدة المتأثرة: ', 'Columns affected: ')}</strong>${parts.join(' ') || '—'}`;
  }
  function brbTable(b, calc) {
    const vr = b.vat;
    const head1 = `<tr class="rk-grp"><th colspan="3" scope="colgroup"></th><th colspan="3" scope="colgroup">${X('النقد', 'Cash')}</th><th colspan="3" scope="colgroup">${X('المصرف', 'Bank')}</th><th colspan="4" scope="colgroup"></th>${vr ? `<th colspan="3" scope="colgroup">${X('ضريبة القيمة المضافة', 'VAT')}</th>` : ''}<th scope="col" rowspan="2">${X('إجراء', 'Actions')}</th></tr>`;
    const h = (a, e) => `<th scope="col">${X(a, e)}</th>`;
    const head2 = `<tr>${h('التاريخ', 'Date')}${h('التفاصيل', 'Details')}${h('رقم المستند', 'Voucher No.')}${h('وارد', 'IN')}${h('صادر', 'OUT')}${h('الرصيد', 'BALANCE')}${h('وارد', 'IN')}${h('صادر', 'OUT')}${h('الرصيد', 'BALANCE')}${h('المبيعات', 'Sales')}${h('تكاليف المواد', 'Material Costs')}${h('تكاليف العمالة', 'Labour Costs')}${h('النفقات العامة', 'Overhead Expenses')}${vr ? h('وارد', 'IN') + h('صادر', 'OUT') + h('الرصيد', 'BALANCE') : ''}</tr>`;
    const cell = (v, br) => `<td class="rk-num">${v === 0 ? '' : fmt(v, br)}</td>`;
    const warnVouch = {}; b.rows.forEach((r) => { if (r.voucher) warnVouch[r.voucher] = (warnVouch[r.voucher] || 0) + 1; });
    const opening = (b.openCash || b.openBank) ? `<tr class="rk-bf"><td></td><td>${X('رصيد منقول (B/f)', 'B/f')}</td><td></td><td></td><td></td><td class="rk-num">${fmt(c100(b.openCash))}</td><td></td><td></td><td class="rk-num">${fmt(c100(b.openBank))}</td><td></td><td></td><td></td><td></td>${vr ? '<td></td><td></td><td></td>' : ''}<td></td></tr>` : '';
    const body = calc.lines.map((l) => {
      const r = l.row; const c = l.c; const delMode = ui.del === r.id;
      const flags = []; if (r.voucher && warnVouch[r.voucher] > 1) flags.push(X('رقم المستند مكرر', 'Duplicate voucher number')); if (l.cash < 0) flags.push(X('رصيد النقد سالب', 'Cash balance below zero')); if (l.bank < 0) flags.push(X('رصيد المصرف سالب', 'Bank balance below zero'));
      return `<tr data-row="${r.id}"><td><bdi>${esc(r.date)}</bdi></td><td>${esc(shownDetails(r))}${flags.length ? `<div class="rk-warn" role="note">⚠ ${esc(flags.join(' · '))}</div>` : ''}</td><td><bdi>${esc(r.voucher)}</bdi></td>${cell(c.cashIn)}${cell(c.cashOut)}<td class="rk-num">${fmt(l.cash)}</td>${cell(c.bankIn)}${cell(c.bankOut)}<td class="rk-num">${fmt(l.bank)}</td>${cell(c.sales)}${cell(c.mat)}${cell(c.lab)}${cell(c.ovh)}${vr ? cell(c.vatIn) + cell(c.vatOut) + `<td class="rk-num">${fmt(l.vat, true)}</td>` : ''}<td class="rk-rowact">${delMode ? `<button type="button" class="rk-btn danger" data-fm-act="del-yes" data-id="${r.id}">${X('تأكيد الحذف', 'Confirm delete')}</button><button type="button" class="rk-btn" data-fm-act="del-no">${X('إلغاء', 'Cancel')}</button>` : `<button type="button" class="rk-btn" data-fm-act="edit" data-id="${r.id}" aria-label="${esc(X('تعديل: ', 'Edit: ') + r.details)}">${X('تعديل', 'Edit')}</button><button type="button" class="rk-btn" data-fm-act="del" data-id="${r.id}" aria-label="${esc(X('حذف: ', 'Delete: ') + r.details)}">${X('حذف', 'Delete')}</button>`}</td></tr>`;
    }).join('');
    const t = calc.tot;
    const foot = `<tr class="rk-tot"><th scope="row" colspan="3">${X('المجموع', 'Total')}</th>${cell(t.cashIn)}${cell(t.cashOut)}<td class="rk-num"><strong>${fmt(calc.cash)}</strong></td>${cell(t.bankIn)}${cell(t.bankOut)}<td class="rk-num"><strong>${fmt(calc.bank)}</strong></td>${cell(t.sales)}${cell(t.mat)}${cell(t.lab)}${cell(t.ovh)}${vr ? cell(t.vatIn) + cell(t.vatOut) + `<td class="rk-num"><strong>${fmt(calc.vat, true)}</strong></td>` : ''}<td></td></tr>`;
    return `<div class="rk-tablewrap" role="region" tabindex="0" aria-label="${esc(X('السجل الأساسي', 'Basic Record Book'))}"><table class="rk-table rk-brb"><caption>${X('السجل الأساسي', 'BASIC RECORD BOOK')}${b.unit ? ' (' + X('الوحدة: ', 'Unit: ') + esc(b.unit) + ')' : ''}</caption><thead>${head1}${head2}</thead><tbody>${opening}${body || `<tr><td colspan="${vr ? 17 : 14}" class="rk-empty">${X('لا معاملات بعد.', 'No transactions yet.')}</td></tr>`}</tbody><tfoot>${foot}</tfoot></table></div>`;
  }
  function renderBrb() {
    const b = brb(); const calc = compute(b.rows, b.openCash, b.openBank, b.vat);
    const set = `<fieldset class="rk-set"><legend>${X('إعدادات السجل', 'Record book settings')}</legend><div class="rk-frow">
      <div class="rk-fld"><label for="rk-fm-unit">${X('الوحدة / العملة (اختياري)', 'Unit / currency (optional)')}</label><input id="rk-fm-unit" type="text" data-fm-set="unit" value="${esc(b.unit)}" autocomplete="off"></div>
      <div class="rk-fld"><label for="rk-fm-oc">${X('رصيد النقد المنقول (B/f)', 'Cash balance brought forward (B/f)')}</label><input id="rk-fm-oc" type="text" inputmode="decimal" data-fm-set="openCash" value="${b.openCash ? esc(String(b.openCash)) : ''}" autocomplete="off"></div>
      <div class="rk-fld"><label for="rk-fm-ob">${X('رصيد المصرف المنقول (B/f)', 'Bank balance brought forward (B/f)')}</label><input id="rk-fm-ob" type="text" inputmode="decimal" data-fm-set="openBank" value="${b.openBank ? esc(String(b.openBank)) : ''}" autocomplete="off"></div></div>
      <label class="rk-opt"><input type="checkbox" data-fm-set="vat"${b.vat ? ' checked' : ''}> ${X('مشروعي مسجل في ضريبة القيمة المضافة (تظهر أعمدة الضريبة)', 'My business is VAT registered (the VAT columns are shown)')}</label>
      <p class="rk-small" id="rk-fm-seterr" role="alert"></p></fieldset>`;
    const note = `<p class="rk-small">${X('الأرصدة والمجاميع جمع بسيط للقيود. تذكّر: الرصيد النقدي المحسوب لا يثبت النقد الفعلي في الصندوق؛ قارنه بالنقد الذي تعدّه فعلاً. لا تفترض الأداة عملة ولا معدل ضريبة؛ أدخل مبلغ الضريبة كما في المستند. التواريخ تُكتب كما في الدليل (مثل 10/11).', 'Balances and totals are plain sums of your entries. Remember: the calculated cash balance does not prove the actual cash in the box; compare it with the cash you actually count. The tool assumes no currency and no tax rate; enter the VAT amount as on the voucher. Dates are written as in the manual (for example 10/11).')}</p>`;
    return `<h3>${X('السجل الأساسي (Basic Record Book)', 'Basic Record Book')}</h3>${set}${brbForm(b)}${ui.notice ? `<p class="rk-ok" role="status">${esc(ui.notice)}</p>` : ''}${brbTable(b, calc)}${note}${clearBox('brb')}`;
  }
  const clearBox = (f) => `<div class="rk-actions rk-clear">${ui.clear === f ? `<span>${X('حذف كل بيانات هذا النموذج؟ لا يمكن التراجع.', 'Delete all data of this form? This cannot be undone.')}</span><button type="button" class="rk-btn danger" data-fm-act="clear-yes" data-id="${f}">${X('نعم، احذف', 'Yes, delete')}</button><button type="button" class="rk-btn" data-fm-act="clear-no">${X('إلغاء', 'Cancel')}</button>` : `<button type="button" class="rk-btn" data-fm-act="clear" data-id="${f}">${X('مسح بيانات هذا النموذج', 'Clear this form’s data')}</button>`}</div>`;

  /* ---------- Daily Cash Sales Record ---------- */
  function dcsr() {
    const o = get('forms.dcsr', {}); const days = isObj(o.days) ? o.days : {};
    const list = Object.entries(days).filter(([, d]) => isObj(d)).map(([id, d]) => ({ id, n: num(d.n), date: String(d.date || ''), posted: typeof d.posted === 'string' ? d.posted : '',
      items: isObj(d.items) ? Object.entries(d.items).filter(([, i]) => isObj(i)).map(([iid, i]) => ({ id: iid, n: num(i.n), name: String(i.name || ''), qty: num(i.qty), price: num(i.price) })).sort((a, b) => a.n - b.n) : [] })).sort((a, b) => a.n - b.n);
    return list;
  }
  const dayTotal = (d) => d.items.reduce((s, i) => s + Math.round(i.qty * c100(i.price)), 0);
  function renderDcsr() {
    const days = dcsr(); const U = ui.dcsr; if (!days.some((d) => d.id === U.day)) U.day = days.length ? days[days.length - 1].id : null;
    const b = brb(); const cur = days.find((d) => d.id === U.day);
    const nav = days.map((d) => `<button type="button" class="rk-sub${d.id === U.day ? ' active' : ''}" data-fm-act="dcsr-day" data-id="${d.id}"${d.id === U.day ? ' aria-current="true"' : ''}>${esc(d.date)}</button>`).join('');
    const newDay = `<form class="rk-form" data-fm-form="dcsr-day" novalidate><h4>${X('يوم جديد', 'New day')}</h4><div class="rk-frow">${field('dcsr-date', X('التاريخ', 'Date'), U.draft.date, U.err.date, 'inputmode="numeric" placeholder="10/11" autocomplete="off"')}</div><button type="submit" class="rk-btn primary" data-fm-act="dcsr-newday">${X('إنشاء سجل اليوم', 'Create the day’s record')}</button></form>`;
    let body = `<p class="rk-small">${X('سجّل لكل صنف رخيص الكمية المباعة اليوم وسعر الوحدة؛ يُحسب المبلغ = الكمية × سعر الوحدة، والمجموع هو النقد الداخل من مبيعات الأصناف الصغيرة (ص 17–18 من الدليل).', 'For each inexpensive item record the quantity sold today and the unit price; the amount = quantity × unit price, and the total is the cash that came in from small items (manual pp. 17–18).')}</p>`;
    if (cur) {
      const rows = cur.items.map((i) => `<tr><td>${esc(i.name)}</td><td class="rk-num">${esc(String(i.qty))}</td><td class="rk-num">${fmt(c100(i.price))}</td><td class="rk-num">${fmt(Math.round(i.qty * c100(i.price)))}</td><td class="rk-rowact"><button type="button" class="rk-btn" data-fm-act="dcsr-del-item" data-id="${cur.id}" data-item="${i.id}" aria-label="${esc(X('حذف الصنف: ', 'Delete item: ') + i.name)}">${X('حذف', 'Delete')}</button></td></tr>`).join('');
      const tot = dayTotal(cur);
      body += `<h4>${X('سجل المبيعات النقدية اليومية – ', 'Daily Cash Sales Record – ')}<bdi>${esc(cur.date)}</bdi></h4>
      <div class="rk-tablewrap" role="region" tabindex="0" aria-label="${esc(X('سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record'))}"><table class="rk-table"><caption>${X('الأصناف المباعة', 'Items sold')}</caption><thead><tr><th scope="col">${X('الصنف (1)', 'Item (1)')}</th><th scope="col">${X('الكمية المباعة (2)', 'Quantity sold (2)')}</th><th scope="col">${X('سعر الوحدة (3)', 'Unit price (3)')}</th><th scope="col">${X('المبلغ (4)', 'Amount (4)')}</th><th scope="col">${X('إجراء', 'Actions')}</th></tr></thead><tbody>${rows || `<tr><td colspan="5" class="rk-empty">${X('لا أصناف بعد.', 'No items yet.')}</td></tr>`}</tbody><tfoot><tr class="rk-tot"><th scope="row" colspan="3">${X('المجموع', 'Total')}</th><td class="rk-num"><strong id="rk-dcsr-total">${fmt(tot)}</strong></td><td></td></tr></tfoot></table></div>
      <form class="rk-form" data-fm-form="dcsr-item" novalidate><h4>${X('إضافة صنف', 'Add an item')}</h4><div class="rk-frow">${field('dcsr-name', X('الصنف', 'Item'), U.draft.name, U.err.name, 'autocomplete="off"')}${field('dcsr-qty', X('الكمية المباعة', 'Quantity sold'), U.draft.qty, U.err.qty, 'inputmode="decimal" autocomplete="off"')}${field('dcsr-price', X('سعر الوحدة', 'Unit price'), U.draft.price, U.err.price, 'inputmode="decimal" autocomplete="off"')}</div><button type="submit" class="rk-btn primary" data-fm-act="dcsr-additem" data-id="${cur.id}">${X('إضافة الصنف', 'Add item')}</button></form>`;
      const exists = cur.posted && b.rows.some((r) => r.id === cur.posted);
      body += `<div class="rk-post"><h4>${X('نقل المجموع إلى السجل الأساسي', 'Transfer the total to the Basic Record Book')}</h4><p class="rk-small">${X('يُسجَّل المجموع كبيع نقدي («النقد الوارد» و«المبيعات»).', 'The total is recorded as a cash sale (“Cash in” and “Sales”).')}</p>`
        + (exists ? `<p class="rk-ok" role="status">${X('سُجِّل مجموع هذا اليوم في السجل الأساسي.', 'This day’s total is already recorded in the Basic Record Book.')}</p>`
          : `<div class="rk-frow">${field('dcsr-voucher', X('رقم المستند', 'Voucher No.'), U.post.voucher, null, 'autocomplete="off"')}${b.vat ? field('dcsr-vat', X('منها ضريبة القيمة المضافة (مبلغ)', 'of which VAT (amount)'), U.post.vat, U.err.postvat, 'inputmode="decimal" autocomplete="off"') : ''}</div><button type="button" class="rk-btn primary" data-fm-act="dcsr-post" data-id="${cur.id}"${tot > 0 ? '' : ' disabled'}>${X('تسجيل المجموع في السجل الأساسي', 'Record the total in the Basic Record Book')}</button>${tot > 0 ? '' : `<span class="rk-small"> ${X('أضف أصنافاً أولاً.', 'Add items first.')}</span>`}`) + `</div>`;
    }
    return `<h3>${X('سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record')}</h3>${body}<nav class="rk-subnav" aria-label="${esc(X('الأيام', 'Days'))}">${nav}</nav>${newDay}${clearBox('dcsr')}`;
  }

  /* ---------- Customers' Accounts Record ---------- */
  function car() {
    const o = get('forms.car', {}); const cs = isObj(o.customers) ? o.customers : {};
    return Object.entries(cs).filter(([, c]) => isObj(c)).map(([id, c]) => {
      const entries = isObj(c.entries) ? Object.entries(c.entries).filter(([, e]) => isObj(e)).map(([eid, e]) => ({ id: eid, n: num(e.n), kind: e.kind === 'payment' ? 'payment' : 'credit', date: String(e.date || ''), details: String(e.details || ''), qty: String(e.qty ?? ''), amount: num(e.amount), sig: String(e.sig || '') })).sort((a, b) => a.n - b.n) : [];
      let bal = 0; const lines = entries.map((e) => { bal += e.kind === 'credit' ? c100(e.amount) : -c100(e.amount); return { e, bal }; });
      return { id, n: num(c.n), name: String(c.name || ''), address: String(c.address || ''), tel: String(c.tel || ''), limit: num(c.limit), lines, bal };
    }).sort((a, b) => a.n - b.n);
  }
  function renderCar() {
    const cs = car(); const U = ui.car; if (!cs.some((c) => c.id === U.cust)) U.cust = cs.length ? cs[0].id : null; const cur = cs.find((c) => c.id === U.cust);
    const nav = cs.map((c) => `<button type="button" class="rk-sub${c.id === U.cust ? ' active' : ''}" data-fm-act="car-cust" data-id="${c.id}"${c.id === U.cust ? ' aria-current="true"' : ''}>${esc(c.name || '—')}</button>`).join('');
    const totalOwed = cs.reduce((s, c) => s + c.bal, 0);
    const summary = cs.length ? `<p class="rk-progress" role="status">${X('عدد الزبائن: ', 'Customers: ')}<bdi>${cs.length}</bdi> · ${X('إجمالي ما يدين به الزبائن: ', 'Total owed by customers: ')}<bdi id="rk-car-total">${fmt(totalOwed, true)}</bdi></p>` : '';
    const newC = `<form class="rk-form" data-fm-form="car-cust" novalidate><h4>${X('زبون جديد', 'New customer')}</h4><div class="rk-frow">${field('car-name', X('اسم الزبون', 'Customer'), U.cdraft.name, U.err.name, 'autocomplete="off"')}${field('car-address', X('العنوان', 'Address'), U.cdraft.address, null, 'autocomplete="off"')}${field('car-tel', X('رقم الهاتف', 'Tel. number'), U.cdraft.tel, null, 'autocomplete="off"')}${field('car-limit', X('حد الائتمان', 'Credit limit'), U.cdraft.limit, U.err.limit, 'inputmode="decimal" autocomplete="off"')}</div><button type="submit" class="rk-btn primary" data-fm-act="car-addcust">${X('إضافة الزبون', 'Add customer')}</button></form>`;
    let body = `<p class="rk-small">${X('تُسجَّل المبيعات بالأجل هنا لا على أنها نقد مستلم؛ فهي مبالغ يدين بها الزبون حتى يدفع (ص 20–22 من الدليل). حد الائتمان هو أعلى مبلغ ائتمان تمنحه للزبون.', 'Credit sales are recorded here and are not cash received; they are amounts the customer owes until he or she pays (manual pp. 20–22). The credit limit is the highest amount of credit you will give the customer.')}</p>`;
    if (cur) {
      const over = cur.limit > 0 && cur.bal > c100(cur.limit);
      const rows = cur.lines.map((l) => { const e = l.e; const ov = cur.limit > 0 && l.bal > c100(cur.limit);
        return `<tr><td><bdi>${esc(e.date)}</bdi></td><td>${esc(e.details)}${ov ? `<div class="rk-warn" role="note">⚠ ${X('الرصيد تجاوز حد الائتمان', 'Balance exceeds the credit limit')}</div>` : ''}${l.bal < 0 ? `<div class="rk-warn" role="note">⚠ ${X('دفع الزبون أكثر مما عليه', 'The customer has paid more than owed')}</div>` : ''}</td><td class="rk-num">${esc(e.qty)}</td><td class="rk-num">${e.kind === 'credit' ? fmt(c100(e.amount)) : ''}</td><td class="rk-num">${e.kind === 'payment' ? fmt(c100(e.amount)) : ''}</td><td class="rk-num">${fmt(l.bal, true)}</td><td>${esc(e.sig)}</td><td class="rk-rowact"><button type="button" class="rk-btn" data-fm-act="car-del-entry" data-id="${cur.id}" data-item="${e.id}" aria-label="${esc(X('حذف القيد: ', 'Delete entry: ') + e.details)}">${X('حذف', 'Delete')}</button></td></tr>`; }).join('');
      const ed = U.edraft; const kind = ed.kind === 'payment' ? 'payment' : 'credit';
      body += `<h4>${esc(cur.name)}</h4><ul class="rk-pre"><li>${X('العنوان: ', 'Address: ')}${esc(cur.address) || '—'}</li><li>${X('رقم الهاتف: ', 'Tel. number: ')}<bdi>${esc(cur.tel) || '—'}</bdi></li><li>${X('حد الائتمان: ', 'Credit limit: ')}<bdi>${cur.limit ? fmt(c100(cur.limit)) : '—'}</bdi></li></ul>
      ${over ? `<p class="rk-warn" role="alert">⚠ ${X('رصيد هذا الزبون يتجاوز حد الائتمان.', 'This customer’s balance exceeds the credit limit.')}</p>` : ''}
      <div class="rk-tablewrap" role="region" tabindex="0" aria-label="${esc(X('سجل حسابات العملاء', 'Customers’ Accounts Record'))}"><table class="rk-table"><caption>${X('سجل حسابات العملاء', 'CUSTOMERS’ ACCOUNTS RECORD')}</caption><thead><tr><th scope="col">${X('التاريخ', 'Date')}</th><th scope="col">${X('التفاصيل', 'Details')}</th><th scope="col">${X('الكمية', 'Quantity')}</th><th scope="col">${X('البيع بالأجل', 'Credit sale')}</th><th scope="col">${X('المبلغ المدفوع', 'Amount paid')}</th><th scope="col">${X('الرصيد', 'Balance')}</th><th scope="col">${X('التوقيع', 'Signature')}</th><th scope="col">${X('إجراء', 'Actions')}</th></tr></thead><tbody>${rows || `<tr><td colspan="8" class="rk-empty">${X('لا قيود بعد.', 'No entries yet.')}</td></tr>`}</tbody><tfoot><tr class="rk-tot"><th scope="row" colspan="5">${X('الرصيد الحالي (ما يدين به الزبون)', 'Current balance (owed by the customer)')}</th><td class="rk-num"><strong id="rk-car-bal">${fmt(cur.bal, true)}</strong></td><td colspan="2"></td></tr></tfoot></table></div>
      <form class="rk-form" data-fm-form="car-entry" novalidate><h4>${X('إضافة قيد', 'Add an entry')}</h4>
        <div class="rk-fld"><label for="rk-fm-ekind">${X('نوع القيد', 'Entry type')}</label><select id="rk-fm-ekind" data-fm-f="car-kind" data-fm-rerender="1"><option value="credit"${kind === 'credit' ? ' selected' : ''}>${X('بيع بالأجل', 'Credit sale')}</option><option value="payment"${kind === 'payment' ? ' selected' : ''}>${X('دفعة من الزبون', 'Payment by the customer')}</option></select></div>
        <div class="rk-frow">${field('car-date', X('التاريخ', 'Date'), ed.date, U.err.edate, 'inputmode="numeric" placeholder="26/10" autocomplete="off"')}${field('car-details', kind === 'credit' ? X('التفاصيل (الأصناف المشتراة)', 'Details (items bought)') : X('التفاصيل', 'Details'), ed.details, U.err.edetails, 'autocomplete="off"')}${kind === 'credit' ? field('car-qty', X('الكمية', 'Quantity'), ed.qty, null, 'inputmode="decimal" autocomplete="off"') : ''}</div>
        <div class="rk-frow">${field('car-amount', kind === 'credit' ? X('قيمة البيع بالأجل', 'Credit sale value') : X('المبلغ المدفوع', 'Amount paid'), ed.amount, U.err.eamount, 'inputmode="decimal" autocomplete="off"')}${field('car-sig', kind === 'credit' ? X('توقيع الزبون', 'The customer’s signature') : X('توقيعك', 'Your signature'), ed.sig, null, 'autocomplete="off"')}</div>
        <button type="submit" class="rk-btn primary" data-fm-act="car-addentry" data-id="${cur.id}">${X('إضافة القيد', 'Add entry')}</button></form>`;
    }
    return `<h3>${X('سجل حسابات العملاء', 'Customers’ Accounts Record')}</h3>${summary}${body}<nav class="rk-subnav" aria-label="${esc(X('الزبائن', 'Customers'))}">${nav}</nav>${newC}${clearBox('car')}`;
  }

  /* ---------- container ---------- */
  const TABS = [['brb', B('السجل الأساسي', 'Basic Record Book')], ['dcsr', B('سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record')], ['car', B('سجل حسابات العملاء', 'Customers’ Accounts Record')]];
  function render() {
    const nav = `<nav class="rk-subnav" aria-label="${esc(X('النماذج التفاعلية', 'Interactive forms'))}">${TABS.map((t) => `<button type="button" class="rk-sub${ui.tab === t[0] ? ' active' : ''}" data-fm-act="tab" data-id="${t[0]}"${ui.tab === t[0] ? ' aria-current="true"' : ''}>${esc(T(t[1]))}</button>`).join('')}</nav>`;
    const view = ui.tab === 'dcsr' ? renderDcsr() : ui.tab === 'car' ? renderCar() : renderBrb();
    return `<section class="rk-panel rk-forms-live" id="rk-forms-live" aria-labelledby="rk-forms-h"><h3 id="rk-forms-h">${X('النماذج التفاعلية الأساسية (المرحلة 3)', 'Core interactive forms (Phase 3)')}</h3><p class="rk-small">${X('بياناتك تُحفظ على هذا الجهاز فقط داخل مفتاح هذه الوحدة. النماذج السبعة الأخرى تأتي في المرحلة 4.', 'Your data is kept on this device only, under this module’s own key. The other seven forms arrive in phase 4.')}</p>${nav}<div id="rk-fm-view">${view}</div></section>`;
  }

  /* ---------- events ---------- */
  function bind(root, ctx) {
    const redraw = (focus) => ctx.refresh(focus);
    const v = (id) => { const el = root.querySelector('#' + id); return el ? el.value : ''; };
    const readBrbDraft = () => { ['type', 'where', 'cat', 'date', 'voucher', 'details', 'amount', 'vat', 'labour', 'interest'].forEach((k) => { const el = root.querySelector('#' + inputId(k)); if (el) ui.draft[k] = el.value; }); };
    root.addEventListener('input', (e) => {
      const t = e.target; if (!t.closest || !t.closest('#rk-forms-live')) return;
      if (t.dataset.fmF) {
        if (/^(date|voucher|details|amount|vat|labour|interest|type|where|cat)$/.test(t.dataset.fmF)) { ui.draft[t.dataset.fmF] = t.value; const p = root.querySelector('#rk-fm-prev'); if (p) p.innerHTML = prevHtml(brb()); }
        else if (t.dataset.fmF.startsWith('dcsr-')) { const k = t.dataset.fmF.slice(5); if (k === 'voucher' || k === 'vat') ui.dcsr.post[k] = t.value; else ui.dcsr.draft[k] = t.value; }
        else if (t.dataset.fmF.startsWith('car-')) { const k = t.dataset.fmF.slice(4); if (['name', 'address', 'tel', 'limit'].includes(k)) ui.car.cdraft[k] = t.value; else ui.car.edraft[k === 'kind' ? 'kind' : k] = t.value; }
      }
    });
    root.addEventListener('change', (e) => {
      const t = e.target; if (!t.closest || !t.closest('#rk-forms-live')) return;
      if (t.dataset.fmSet) {
        const k = t.dataset.fmSet; const msg = root.querySelector('#rk-fm-seterr');
        if (k === 'vat') { store.set('forms.brb.vat', t.checked); ui.draft.vat = ''; redraw(); return; }
        if (k === 'unit') { store.set('forms.brb.unit', t.value.trim()); redraw(); return; }
        const val = parseMoney(t.value, true);
        if (val === null) { if (msg) msg.textContent = X('أدخل رصيداً صحيحاً (رقم غير سالب).', 'Enter a valid balance (a non-negative number).'); t.setAttribute('aria-invalid', 'true'); return; }
        store.set('forms.brb.' + k, val); redraw();
        return;
      }
      if (t.dataset.fmRerender) {
        if (t.dataset.fmF === 'car-kind') { ui.car.edraft.kind = t.value; redraw('#' + t.id); return; }
        readBrbDraft(); ui.errors = {}; redraw('#' + t.id);
      }
    });
    const submitBrb = () => {
      readBrbDraft(); const b = brb(); const res = validateRow(ui.draft, b.vat); ui.errors = res.errors; ui.notice = '';
      if (Object.keys(res.errors).length) { redraw('#rk-fm-view [aria-invalid="true"]'); return; }
      if (ui.edit) { const old = b.rows.find((r) => r.id === ui.edit); store.set('forms.brb.rows.' + ui.edit, Object.assign({ n: old ? old.n : nextSeq('forms.brb.seq') }, res.row)); ui.edit = null; ui.notice = X('تم حفظ التعديل.', 'Changes saved.'); }
      else { addRow(res.row); ui.notice = X('أُضيفت المعاملة.', 'Transaction added.'); }
      const keep = { type: ui.draft.type, where: ui.draft.where }; ui.draft = keep; ui.errors = {}; redraw('#' + inputId('date'));
    };
    root.addEventListener('submit', (e) => {
      const f = e.target.closest && e.target.closest('form[data-fm-form]'); if (!f) return; e.preventDefault();
      const kind = f.dataset.fmForm;
      if (kind === 'brb') { submitBrb(); return; }
      if (kind === 'dcsr-day') {
        const dt = parseDate(ui.dcsr.draft.date); if (!dt) { ui.dcsr.err = { date: MSG.date }; redraw('#' + inputId('dcsr-date')); return; }
        const n = nextSeq('forms.dcsr.seq'); store.set('forms.dcsr.days.d' + n, { n, date: dt }); ui.dcsr.day = 'd' + n; ui.dcsr.draft = {}; ui.dcsr.err = {}; redraw(); return;
      }
      if (kind === 'dcsr-item') {
        const d = ui.dcsr.draft; const err = {}; const name = String(d.name || '').trim(); const qty = parseMoney(d.qty); const price = parseMoney(d.price);
        if (!name) err.name = MSG.name; if (qty === null || qty <= 0) err.qty = MSG.qty; if (price === null) err.price = MSG.price;
        ui.dcsr.err = err; if (Object.keys(err).length) { redraw('#rk-fm-view [aria-invalid="true"]'); return; }
        const n = nextSeq('forms.dcsr.seq'); store.set('forms.dcsr.days.' + ui.dcsr.day + '.items.i' + n, { n, name, qty, price }); ui.dcsr.draft = {}; redraw('#' + inputId('dcsr-name')); return;
      }
      if (kind === 'car-cust') {
        const d = ui.car.cdraft; const err = {}; const name = String(d.name || '').trim(); const limit = parseMoney(d.limit, true);
        if (!name) err.name = MSG.name; if (limit === null) err.limit = MSG.limit; ui.car.err = err; if (Object.keys(err).length) { redraw('#rk-fm-view [aria-invalid="true"]'); return; }
        const n = nextSeq('forms.car.seq'); store.set('forms.car.customers.c' + n, { n, name, address: String(d.address || '').trim(), tel: String(d.tel || '').trim(), limit }); ui.car.cust = 'c' + n; ui.car.cdraft = {}; redraw(); return;
      }
      if (kind === 'car-entry') {
        const d = ui.car.edraft; const err = {}; const dt = parseDate(d.date); const det = String(d.details || '').trim(); const amt = parseMoney(d.amount);
        if (!dt) err.edate = MSG.date; if (!det) err.edetails = MSG.details; if (amt === null || amt <= 0) err.eamount = MSG.amt0;
        ui.car.err = err; if (Object.keys(err).length) { redraw('#rk-fm-view [aria-invalid="true"]'); return; }
        const n = nextSeq('forms.car.seq'); store.set('forms.car.customers.' + ui.car.cust + '.entries.e' + n, { n, kind: d.kind === 'payment' ? 'payment' : 'credit', date: dt, details: det, qty: String(d.qty || '').trim(), amount: amt, sig: String(d.sig || '').trim() });
        ui.car.edraft = { kind: d.kind }; redraw('#' + inputId('car-date'));
      }
    });
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fm-act]'); if (!btn || !root.contains(btn) || btn.type === 'submit') return;
      const a = btn.dataset.fmAct; const id = btn.dataset.id;
      switch (a) {
        case 'tab': ui.tab = id; ui.notice = ''; redraw(); break;
        case 'edit': { const r = brb().rows.find((x) => x.id === id); if (!r) break; ui.edit = id; ui.errors = {}; ui.draft = { type: r.type, where: r.where, cat: r.cat, date: r.date, voucher: r.voucher, details: r.details, amount: String(r.amount), vat: r.vat ? String(r.vat) : '', labour: r.labour ? String(r.labour) : '', interest: r.interest ? String(r.interest) : '', src: r.src }; redraw('#' + inputId('date')); break; }
        case 'cancel': ui.edit = null; ui.draft = {}; ui.errors = {}; redraw(); break;
        case 'del': ui.del = id; redraw('[data-fm-act="del-yes"]'); break;
        case 'del-no': ui.del = null; redraw(); break;
        case 'del-yes': { const rows = get('forms.brb.rows', {}); if (isObj(rows)) { const n = Object.assign({}, rows); delete n[id]; store.set('forms.brb.rows', n); } ui.del = null; if (ui.edit === id) { ui.edit = null; ui.draft = {}; } redraw(); break; }
        case 'dcsr-day': ui.dcsr.day = id; redraw(); break;
        case 'dcsr-del-item': { const items = get('forms.dcsr.days.' + id + '.items', {}); if (isObj(items)) { const n = Object.assign({}, items); delete n[btn.dataset.item]; store.set('forms.dcsr.days.' + id + '.items', n); } redraw(); break; }
        case 'dcsr-post': {
          const d = dcsr().find((x) => x.id === id); if (!d) break; const b = brb(); const tot = dayTotal(d); if (tot <= 0) break;
          const vat = b.vat ? parseMoney(ui.dcsr.post.vat, true) : 0; if (vat === null || c100(vat) > tot) { ui.dcsr.err = { postvat: MSG.vat }; redraw('#' + inputId('dcsr-vat')); break; }
          const rid = addRow({ type: 'sale', where: 'cash', cat: 'material', date: d.date, details: DCSR_L.en, voucher: String(ui.dcsr.post.voucher || '').trim(), amount: tot / 100, vat: vat || 0, labour: 0, interest: 0, src: 'dcsr:' + id });
          store.set('forms.dcsr.days.' + id + '.posted', rid); ui.dcsr.post = {}; ui.dcsr.err = {}; redraw(); break;
        }
        case 'car-cust': ui.car.cust = id; ui.car.err = {}; redraw(); break;
        case 'car-del-entry': { const es = get('forms.car.customers.' + id + '.entries', {}); if (isObj(es)) { const n = Object.assign({}, es); delete n[btn.dataset.item]; store.set('forms.car.customers.' + id + '.entries', n); } redraw(); break; }
        case 'clear': ui.clear = id; redraw('[data-fm-act="clear-yes"]'); break;
        case 'clear-no': ui.clear = null; redraw(); break;
        case 'clear-yes': { store.set('forms.' + id, {}); ui.clear = null; ui.draft = {}; ui.edit = null; ui.dcsr.day = null; ui.car.cust = null; redraw(); break; }
        default: break;
      }
    });
  }
  window.SIYBRKForms = { render, bind, compute, cols, validateRow, parseMoney, parseDate, fmt, TYPES, brb, addRow, dcsr, car, ui };
})();
