/* IYB Planning – pure calculation helpers (no DOM). Every formula is the manual's own definition:
   Gross Profit = Sales − Material Costs − Labour Costs; Net Profit = Gross Profit − Overhead Expenses (Part II §3);
   cost per item = cost ÷ number of items produced (the manual's Material/Labour Cost per item, Part II §2.3).
   These are historical-analysis helpers only; forecasts (Part V) arrive in a later phase. */
(() => {
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩', FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  // Normalise user input (Arabic-Indic digits, Arabic decimal/thousands separators, brackets = negative) → number | null
  function parse(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    let s = String(v).trim(); if (!s) return null;
    s = s.replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d)).replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d)).replace(/٫/g, '.').replace(/[٬،\s,]/g, '');
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/^[$€£]/, '');
    if (s[0] === '-' || s[0] === '−') { neg = !neg; s = s.slice(1); }
    if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return null;
    const n = parseFloat(s); return Number.isFinite(n) ? (neg ? -n : n) : null;
  }
  const num = (v) => { const n = parse(v); return n === null ? 0 : n; };
  const sum = (arr) => arr.reduce((t, v) => t + num(v), 0);
  const filled = (arr) => arr.some((v) => parse(v) !== null);
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const gross = (sales, material, labour) => num(sales) - num(material) - num(labour);
  const net = (grossProfit, overhead) => num(grossProfit) - num(overhead);
  const perItem = (cost, qty) => { const q = parse(qty); return q ? round2(num(cost) / q) : null; };
  const change = (now, before) => { const a = parse(now), b = parse(before); if (a === null || b === null) return null; return { diff: round2(a - b), pct: b === 0 ? null : round2(((a - b) / Math.abs(b)) * 100) }; };
  // ---- Part V (forecast) helpers: the manual's own formulas only ----
  // Forecast sales = price × quantity (p.49); total material cost = material cost per item × production quantity (p.62).
  const times = (a, b) => { const x = parse(a), y = parse(b); return (x === null || y === null) ? null : round2(x * y); };
  // Cash Flow Plan, the manual's 12 steps (p.72–74): closing = opening + total cash in − total cash out.
  // m = {open, sales, credit, otherIn, mat, lab, oh, equip, otherOut}; prevClose is the previous month's closing (null for the first month).
  function cashMonth(m, prevClose) {
    const open = prevClose === null || prevClose === undefined ? num(m.open) : prevClose;
    const cashIn = num(m.sales) + num(m.credit) + num(m.otherIn);
    const cashOut = num(m.mat) + num(m.lab) + num(m.oh) + num(m.equip) + num(m.otherOut);
    return { open, cashIn, cashOut, close: round2(open + cashIn - cashOut) };
  }
  // Loan interest, the manual's two methods (p.79–80). Equal monthly principal; flat = interest on the original amount every month,
  // reduced balance = interest on the balance due at the start of each month. rate = % per annum.
  function loanSchedule(principal, ratePct, months, method) {
    const P = parse(principal), r = parse(ratePct), n = parse(months);
    if (P === null || r === null || n === null || P <= 0 || r < 0 || n < 1 || !Number.isInteger(n)) return null;
    const rows = []; let bal = P; const each = P / n; let ti = 0, tp = 0;
    for (let k = 1; k <= n; k++) {
      const interest = round2((method === 'flat' ? P : bal) * (r / 100) * (1 / 12));
      const pr = k === n ? round2(bal) : round2(each);
      bal = round2(bal - pr); ti = round2(ti + interest); tp = round2(tp + pr);
      rows.push({ n: k, interest, principal: pr, total: round2(interest + pr), balance: bal < 0.005 ? 0 : bal });
    }
    return { rows, totalInterest: ti, totalPrincipal: tp, totalPaid: round2(ti + tp) };
  }
  // Display: thousands separators, up to 2 decimals, negatives in brackets (the manual's loss convention)
  function fmt(n, opt) {
    if (n === null || n === undefined || Number.isNaN(n)) return '';
    const dec = opt && opt.dec !== undefined ? opt.dec : (Number.isInteger(n) ? 0 : 2);
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return n < 0 ? (opt && opt.minus ? '−' + s : '(' + s + ')') : s;
  }

  window.SIYBPlanningCalc = { parse, num, sum, filled, round2, gross, net, perItem, change, fmt, times, cashMonth, loanSchedule };
  if (typeof module !== 'undefined') module.exports = window.SIYBPlanningCalc;
})();
