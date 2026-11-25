/* Unit tests (no browser) for planning-calc.js using the manual's own Plastic Solutions figures (Part II). Run: node tests/planning-calc.test.js */
global.window = {}; const C = require('../src/modules/planning-calc.js'); global.window = undefined;
let pass = 0, fail = 0; const ok = (n, c, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + n + (x !== undefined ? ' — ' + x : '')); } };
// P&L statements (manual p.24): 2011, 2012, 2013
ok('GP 2011', C.gross(57500, 29168, 9720) === 18612); ok('NP 2011', C.net(18612, 16520) === 2092);
ok('GP 2012', C.gross(66815, 33698, 10200) === 22917); ok('NP 2012', C.net(22917, 17560) === 5357);
ok('GP 2013', C.gross(80950, 48615, 10800) === 21535); ok('NP 2013 is a loss', C.net(21535, 25440) === -3905);
ok('loss shown in brackets', C.fmt(-3905) === '(3,905)'); ok('profit shown with separator', C.fmt(21535) === '21,535');
// cost per item (manual p.22): material 15 / 11.6, labour 3.3 / 3.5 (rounded in the manual to 1 decimal)
ok('material/item this year', Math.round(C.perItem(48615, 3240) * 10) / 10 === 15);
ok('material/item last year', Math.round(C.perItem(33698, 2900) * 10) / 10 === 11.6);
ok('labour/item this year', Math.round(C.perItem(10800, 3240) * 10) / 10 === 3.3);
ok('labour/item last year', Math.round(C.perItem(10200, 2900) * 10) / 10 === 3.5);
ok('per item with zero/blank quantity is null', C.perItem(100, 0) === null && C.perItem(100, '') === null);
// table totals as printed in the manual
ok('costs sum', C.sum([4800, 5400, 4640]) === 14840);
// parsing: Arabic-Indic digits, separators, brackets, blanks, junk
ok('parse arabic digits', C.parse('٨٬٦٥٠') === 8650); ok('parse decimal comma/arabic', C.parse('١٥٫٥') === 15.5);
ok('parse brackets negative', C.parse('(3,905)') === -3905); ok('parse $ and spaces', C.parse(' $80,950 ') === 80950);
ok('parse blank is null', C.parse('') === null && C.parse(null) === null); ok('parse junk is null', C.parse('abc') === null && C.parse('1.2.3') === null);
ok('num(junk) is 0 (never NaN)', C.num('abc') === 0);
// change
const c = C.change(9200, 10971); ok('change diff', c.diff === -1771); ok('change pct', c.pct === -16.14);
ok('change vs zero base: pct null', C.change(5, 0).pct === null); ok('change with blank is null', C.change('', 5) === null);
// ---- Part V: Plastic Solutions' forecasts (manual pp. 48, 57, 62, 64-67, 72, 79-80) ----
const sq = [210, 284, 336, 356, 371, 378, 385, 392, 402, 420, 484, 515];
const sales = sq.map((q) => C.times(q, 25));
ok('sales forecast Jan..Dec', [5250, 7100, 8400, 8900, 9275, 9450, 9625, 9800, 10050, 10500, 12100, 12875].every((v, i) => sales[i] === v));
ok('total sales quantity 4,533', C.sum(sq) === 4533); ok('total sales 113,325', C.sum(sales) === 113325);
ok('times with a blank is null', C.times('', 25) === null && C.times(5, 'x') === null);
ok('material total 380 x 13.5 = 5,130', C.times(380, 13.5) === 5130); ok('year material 61,560', C.sum(Array(12).fill(5130)) === 61560);
const oh = [2360, 2360, 2343, 2343, 2343, 2343, 2343, 2343, 2356, 2356, 3682, 3708];
ok('overhead total 30,880', C.sum(oh) === 30880);
const lab = 1320, mat = 5130; const gp = sales.map((s) => C.gross(s, mat, lab)); const np = gp.map((g, i) => C.net(g, oh[i]));
ok('gross profit Jan (1,200) and Dec 6,425', gp[0] === -1200 && gp[11] === 6425); ok('gross profit total 35,925', C.sum(gp) === 35925);
ok('net profit Jan (3,560), Apr 107, Dec 2,717', np[0] === -3560 && np[3] === 107 && np[11] === 2717); ok('net profit total 5,045', C.sum(np) === 5045);
// Activity 12 answer (p.86): Jan-Mar 473, Apr 488, May-Jun 508
const a12 = [[300, 100, 20, 18, 35], [300, 100, 20, 18, 35], [300, 100, 20, 18, 35], [315, 100, 20, 18, 35], [315, 120, 20, 18, 35], [315, 120, 20, 18, 35]].map((r) => C.sum(r));
ok('activity 12 totals 473 473 473 488 508 508', a12.join() === '473,473,473,488,508,508');
// Cash Flow Plan (p.72)
const j = C.cashMonth({ open: 10000, sales: 4200, credit: '', otherIn: 420, mat: 1786, lab: 1320, oh: 2710, equip: 0, otherOut: 920 }, null);
const f = C.cashMonth({ sales: 5680, credit: 1050, otherIn: 568, mat: 5130, lab: 1320, oh: 2110, equip: 0, otherOut: 420 }, j.close);
const m = C.cashMonth({ sales: 6720, credit: 1420, otherIn: 672, mat: 5130, lab: 1320, oh: 2093, equip: 10000, otherOut: 568 }, f.close);
ok('cash Jan in 4,620 out 6,736 close 7,884', j.cashIn === 4620 && j.cashOut === 6736 && j.close === 7884);
ok('cash Feb in 7,298 out 8,980 close 6,202', f.cashIn === 7298 && f.cashOut === 8980 && f.close === 6202);
ok('cash Mar in 8,812 out 19,111 close (4,097)', m.cashIn === 8812 && m.cashOut === 19111 && m.close === -4097 && C.fmt(m.close) === '(4,097)');
// Loan (p.79-80): 4,000 at 12% p.a. over 8 months
const fl = C.loanSchedule(4000, 12, 8, 'flat'), rb = C.loanSchedule(4000, 12, 8, 'reduced');
ok('flat: interest 320, paid 4,320, every month 540', fl.totalInterest === 320 && fl.totalPaid === 4320 && fl.rows.every((r) => r.total === 540));
ok('reduced: interest 180, paid 4,180', rb.totalInterest === 180 && rb.totalPaid === 4180);
ok('reduced interest 40,35,30,25,20,15,10,5', rb.rows.map((r) => r.interest).join() === '40,35,30,25,20,15,10,5');
ok('reduced instalments 540..505', rb.rows.map((r) => r.total).join() === '540,535,530,525,520,515,510,505');
ok('loan balance ends at 0', fl.rows[7].balance === 0 && rb.rows[7].balance === 0 && rb.rows[0].balance === 3500);
ok('non-divisible principal still ends at 0', C.loanSchedule(1000, 10, 3, 'reduced').rows[2].balance === 0 && C.loanSchedule(1000, 10, 3, 'reduced').totalPrincipal === 1000);
ok('loan invalid inputs are null', C.loanSchedule('', 12, 8, 'flat') === null && C.loanSchedule(1000, 12, 0, 'flat') === null && C.loanSchedule(-5, 12, 8, 'flat') === null && C.loanSchedule(1000, 12, 2.5, 'flat') === null);
console.log('PASSED ' + pass + '  FAILED ' + fail); process.exit(fail ? 1 : 0);
