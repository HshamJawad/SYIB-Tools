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
  // Display: thousands separators, up to 2 decimals, negatives in brackets (the manual's loss convention)
  function fmt(n, opt) {
    if (n === null || n === undefined || Number.isNaN(n)) return '';
    const dec = opt && opt.dec !== undefined ? opt.dec : (Number.isInteger(n) ? 0 : 2);
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return n < 0 ? (opt && opt.minus ? '−' + s : '(' + s + ')') : s;
  }
  window.SIYBPlanningCalc = { parse, num, sum, filled, round2, gross, net, perItem, change, fmt };
  if (typeof module !== 'undefined') module.exports = window.SIYBPlanningCalc;
})();
