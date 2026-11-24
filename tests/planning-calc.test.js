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
console.log('PASSED ' + pass + '  FAILED ' + fail); process.exit(fail ? 1 : 0);
