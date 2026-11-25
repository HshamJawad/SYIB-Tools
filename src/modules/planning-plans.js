/* IYB Planning – Part V workspaces (Phase 5): objectives, Sales and Marketing forecast (Activity 8), waste table (Activity 9),
   production quantity (11), Overhead Expenses (12, 13), Material Costs (14), Labour Costs (15), Forecast of Costs (16), Profit Plan (17),
   Cash Flow Plan (18) and the Loan Access helper. Application guidance, clearly labelled: every figure is typed by the learner and every
   formula is the manual's own (see planning-calc.js). Forecasts are assumptions, never actual results; nothing here predicts or recommends borrowing.
   Data lives under plans.* and objectives in the single Planning store key. Cost, profit and cash lines are linked (computed), never re-typed. */
(() => {
  'use strict';
  const L = window.SIYBPlanningLearn; if (!L) return;
  const { X, T, esc, gv, store, calc, B, MONTHS, appTag, saved, inp, txt, area, updateProgress, riskList } = L._h;
  const N = 12, ARR = (f) => Array.from({ length: N }, (_, i) => f(i));
  const ser = (path) => ARR((i) => gv(path + '.m' + i, ''));
  const anyNull = (a) => a.some((v) => v !== null);
  const tot = (arrs) => ARR((j) => { const v = arrs.map((a) => a[j]).filter((x) => x !== null && x !== undefined); return v.length ? calc.round2(v.reduce((t, x) => t + x, 0)) : null; });
  const sumNN = (a) => (anyNull(a) ? calc.round2(a.reduce((t, x) => t + (x === null ? 0 : x), 0)) : null);
  const numArr = (a) => a.map((v) => (calc.parse(v) === null ? null : calc.parse(v)));

  /* ---------- data model (all derived values come from here) ---------- */
  const nProd = () => { const n = parseInt(gv('plans.nProducts', 2), 10); return n >= 1 && n <= 5 ? n : 2; };
  const prodList = () => ARR((i) => i).slice(0, nProd()).map((i) => ({ name: String(gv('plans.productNames.' + i, '') || '') }));
  const pname = (i) => { const n = String((prodList()[i] || {}).name || '').trim(); return n || X('المنتج ', 'Product ') + String.fromCharCode(65 + i); };
  const ohN = () => { const n = parseInt(gv('plans.productionCost.ohN', 6), 10); return n >= 1 && n <= 20 ? n : 6; };
  function model() {
    const n = prodList().length; const P = [];
    for (let i = 0; i < n; i++) {
      const qty = numArr(ser('plans.salesMarketing.fc.' + i + '.qty')), price = numArr(ser('plans.salesMarketing.fc.' + i + '.price'));
      const sales = ARR((j) => calc.times(qty[j], price[j]));
      const pq = numArr(ser('plans.productionCost.prodQty.' + i)), per = numArr(ser('plans.productionCost.matItem.' + i));
      const mat = ARR((j) => calc.times(pq[j], per[j]));
      P.push({ qty, price, sales, pq, per, mat });
    }
    const oh = []; for (let r = 0; r < ohN(); r++) oh.push(numArr(ser('plans.productionCost.oh.' + r)));
    const lab = numArr(ser('plans.productionCost.lab'));
    const m = { P, oh, lab, sales: tot(P.map((x) => x.sales)), mat: tot(P.map((x) => x.mat)), ohT: tot(oh) };
    m.gross = ARR((j) => (m.sales[j] === null && m.mat[j] === null && lab[j] === null ? null : calc.gross(m.sales[j], m.mat[j], lab[j])));
    m.net = ARR((j) => (m.gross[j] === null && m.ohT[j] === null ? null : calc.net(m.gross[j], m.ohT[j])));
    return m;
  }
  const loanInst = () => {
    const start = parseInt(gv('plans.loanAccess.start', ''), 10); const sch = calc.loanSchedule(gv('plans.loanAccess.amount', ''), gv('plans.loanAccess.rate', ''), gv('plans.loanAccess.months', ''), gv('plans.loanAccess.method', 'reduced'));
    const arr = ARR(() => 0); if (!sch || !(start >= 1 && start <= 12)) return { arr, sch, cut: false };
    let cut = false; sch.rows.forEach((r, k) => { const j = start - 1 + k; if (j < N) arr[j] = r.total; else cut = true; });
    return { arr, sch, cut };
  };
  function cash() {
    const L1 = (k) => numArr(ser('plans.cashFlow.' + k)); const f = { sales: L1('sales'), credit: L1('credit'), otherIn: L1('otherIn'), mat: L1('mat'), lab: L1('lab'), oh: L1('oh'), equip: L1('equip'), otherOut: L1('otherOut') };
    const li = gv('plans.cashFlow.loanOn', '') === '1' ? loanInst() : { arr: ARR(() => 0) };
    const open = gv('plans.cashFlow.open', '');
    const active = ARR((j) => Object.values(f).some((a) => a[j] !== null) || li.arr[j] > 0 || (j === 0 && calc.parse(open) !== null));
    let last = -1; active.forEach((a, j) => { if (a) last = j; });
    const rows = []; let prev = null;
    for (let j = 0; j <= last; j++) {
      const r = calc.cashMonth({ open, sales: f.sales[j], credit: f.credit[j], otherIn: f.otherIn[j], mat: f.mat[j], lab: f.lab[j], oh: f.oh[j], equip: f.equip[j], otherOut: (f.otherOut[j] || 0) + li.arr[j] }, j === 0 ? null : prev);
      rows.push(r); prev = r.close;
    }
    return { f, rows, li, last };
  }

  /* ---------- markup helpers ---------- */
  const unitTxt = () => String(gv('plans.unit', '') || '').trim();
  const money = (n) => (n === null || n === undefined ? '' : calc.fmt(n));
  const mHead = (first, total) => `<thead><tr><th scope="col">${first}</th>${MONTHS.map((m) => `<th scope="col">${esc(T(m))}</th>`).join('')}${total === false ? '' : `<th scope="col">${X('الإجمالي', 'Total')}</th>`}</tr></thead>`;
  const rowIn = (label, path, tcalc) => `<tr><th scope="row">${esc(label)}</th>${ARR((j) => `<td>${inp(path + '.m' + j, label + ' — ' + T(MONTHS[j]))}</td>`).join('')}${tcalc === false ? '' : `<td dir="ltr" data-calc="${tcalc || path}.t"></td>`}</tr>`;
  const rowCalc = (label, key, tc) => `<tr><th scope="row">${esc(label)}</th>${ARR((j) => `<td dir="ltr" data-calc="${key}.m${j}"></td>`).join('')}${tc === false ? '' : `<td dir="ltr" data-calc="${key}.t"></td>`}</tr>`;
  const wrapT = (label, inner, extra) => `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${esc(label)}"><table class="pyp-table pyp-input pyp-wide"><caption>${esc(label)} <span class="pyp-unitcap" data-calc="unitcap"></span></caption>${inner}</table></div>`;
  const wsBox = (id, title, intro, body) => `<section class="pyp-panel pyp-ws pyp-plan" id="${id}" aria-label="${esc(T(title))}"><h4>${esc(T(title))} ${appTag()}</h4>${intro ? `<p class="pyp-small">${esc(T(intro))}</p>` : ''}${body}</section>`;
  const fcNote = () => `<div class="pyp-important" role="note">${X('هذه توقعات وافتراضات: ليست نتائج فعلية ولا مضمونة. المبالغ التي تدخلها هي تقديراتك أنت، وتُراجَع عندما تتوفر معلومات جديدة.', 'These are forecasts and assumptions: they are not actual or guaranteed results. The amounts are your own estimates and should be reviewed when new information is available.')}</div>`;
  const btn = (act, label, attrs) => `<button type="button" class="pyp-btn" data-act="${act}"${attrs || ''}>${label}</button>`;
  // learner-typed text is shown in read-only fields (the app-wide UI translator rewrites words inside plain text nodes)
  const ro = (text, label) => `<input type="text" class="pyp-txt pyp-ro" readonly value="${esc(text)}" title="${esc(text)}" aria-label="${esc(label)}">`;
  const riskBox = (planKey) => {
    const rs = riskList().filter((r) => r && (String(r.risk || '').trim() || String(r.actions || '').trim()));
    const list = rs.length ? `<ul class="pyp-riskref">${rs.map((r) => `<li>${ro(r.risk || '—', X('الخطر', 'Risk'))}${r.actions ? ro(r.actions, X('الإجراءات', 'Actions')) : ''}${r.strategy ? ` <em>(${esc(T(({ accept: B('قبول', 'Accept'), transfer: B('نقل', 'Transfer'), reduce: B('تقليل', 'Reduce'), avoid: B('تجنب', 'Avoid') })[r.strategy] || ''))})</em>` : ''}</li>`).join('')}</ul>` : `<p class="pyp-small">${X('لا توجد مخاطر مسجّلة في الجزء الرابع بعد؛ يمكنك العودة إليه وتسجيلها (لا تُكرَّر هنا).', 'No risks are recorded in Part IV yet; go back and record them there (they are not duplicated here).')}</p>`;
    return `<div class="pyp-fcbox"><h5>${X('استراتيجيات إدارة المخاطر من الجزء الرابع (للاطلاع فقط)', 'Risk Management strategies from Part IV (read-only)')}</h5>${list}${planKey ? area('plans.' + planKey + '.riskNote', X('كيف أدمج استراتيجيات إدارة المخاطر في هذه الخطة؟ (مثلاً: التأمين ضد الحريق بند في النفقات العامة وفي النقد الخارج)', 'How do I build my Risk Management strategies into this plan? (e.g. fire insurance is an Overhead Expense and a cash out)')) : ''}</div>`;
  };

  /* ---------- workspaces ---------- */
  const objList = () => { const v = gv('objectives', []); return Array.isArray(v) ? v : []; };
  function wsObjectives() {
    const list = objList();
    const card = (o, i) => `<div class="pyp-fc" id="pypObj-${i}" role="group" aria-label="${X('هدف ', 'Objective ')}${i + 1}"><div class="pyp-fc-head"><strong><bdi>${i + 1}</bdi>. ${X('هدف', 'Objective')}</strong>${btn('obj-del', X('حذف', 'Remove'), ` data-idx="${i}"`)}</div>
      <div class="pyp-fc-row"><label>${X('النوع', 'Type')}<select class="pyp-sel" data-kind="fsel" data-key="objectives.${i}.kind"><option value="">—</option><option value="fin"${o.kind === 'fin' ? ' selected' : ''}>${X('مالي', 'Financial')}</option><option value="nonfin"${o.kind === 'nonfin' ? ' selected' : ''}>${X('غير مالي', 'Non-financial')}</option></select></label></div>
      <label class="pyp-q"><span>${X('الهدف (كن واقعياً: مبنياً على طاقة مشروعك وظروف السوق)', 'Objective (be realistic: based on your business capacity and the market conditions)')}</span><textarea class="pyp-ta" rows="2" data-kind="ta" data-key="objectives.${i}.text">${esc(o.text || '')}</textarea></label></div>`;
    return wsBox('pypObjWs', B('مساحة عملي: أهداف مشروعي للعام القادم', 'My workspace: my business objectives for next year'), B('اكتب أهدافك المالية وغير المالية. ستظهر في خطة الأرباح للمقارنة؛ ولا يقيّمها التطبيق ولا يقترح أرقاماً.', 'Write your financial and non-financial objectives. They appear in the Profit Plan for comparison; the app does not judge them or suggest figures.'),
      `<div id="pypObjList">${list.length ? list.map(card).join('') : `<p class="pyp-small">${X('لا توجد أهداف مسجّلة بعد. اضغط «إضافة هدف».', 'No objectives recorded yet. Press “Add an objective”.')}</p>`}</div><div class="pyp-actions">${btn('obj-add', X('إضافة هدف', 'Add an objective'))}${saved()}</div>`);
  }
  const wsRiskRef = () => wsBox('pypRiskRef', B('استراتيجيات المخاطر الخاصة بك', 'Your Risk Management strategies'), B('المخاطر وإجراءاتها مسجّلة مرة واحدة في الجزء الرابع، وتُعرض هنا لتدمجها في كل خطة.', 'Your risks and their actions are recorded once, in Part IV, and shown here so that you can build them into each plan.'), riskBox(null));

  function wsSales() {
    const n = prodList().length; const ty = ser('businessAnalysis.salesMarketing.ty');
    const ref = calc.filled(ty) ? `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('مبيعات هذا العام من الجزء الثاني', 'This year’s sales from Part II')}"><table class="pyp-table pyp-wide"><caption>${X('للاطلاع: مبيعات هذا العام كما أدخلتها في الجزء الثاني', 'For reference: this year’s sales as you entered them in Part II')}</caption><thead><tr>${MONTHS.map((m) => `<th scope="col">${esc(T(m))}</th>`).join('')}</tr></thead><tbody><tr>${ty.map((v) => `<td dir="ltr">${esc(calc.parse(v) === null ? '' : calc.fmt(calc.parse(v)))}</td>`).join('')}</tr></tbody></table></div>` : '';
    const names = prodList().map((p, i) => `<label class="pyp-q"><span>${X('اسم المنتج أو الخدمة ', 'Name of product or service ')}<bdi>${String.fromCharCode(65 + i)}</bdi></span>${txt('plans.productNames.' + i, X('اسم المنتج ', 'Product name ') + String.fromCharCode(65 + i))}</label>`).join('');
    const tables = prodList().map((p, i) => wrapT(X('توقّع المبيعات — ', 'Forecast of sales — ') + pname(i), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowIn(X('كمية المبيعات', 'Sale quantity'), 'plans.salesMarketing.fc.' + i + '.qty', 'sq' + i)}${rowIn(X('سعر البيع', 'Sale price'), 'plans.salesMarketing.fc.' + i + '.price', 'sp' + i)}${rowCalc(X('المبيعات', 'Sales'), 'ss' + i)}</tbody>`) + `<div class="pyp-actions">${btn('fill-jan', X('طبّق سعر كانون الثاني على كل الأشهر', 'Apply the January price to all months'), ` data-path="plans.salesMarketing.fc.${i}.price"`)}</div>`).join('');
    return wsBox('pypSalesWs', B('مساحة عملي: توقّع مبيعات العام القادم (النشاط 8)', 'My workspace: forecast of next year’s sales (Activity 8)'), B('المبيعات = سعر البيع × كمية المبيعات (الدليل ص 49). تحصل على الأشهر بإدخال كمية وسعر لكل شهر.', 'Sales = sale price × sale quantity (manual p. 49). Enter a quantity and a price for each month.'),
      fcNote() + `<label class="pyp-unitrow"><span>${X('العملة / الوحدة المستخدمة في كل خططك (اختياري)', 'Currency / unit used in all your plans (optional)')}</span> ${txt('plans.unit', X('العملة', 'Currency'), X('مثال: $', 'e.g. $'))}</label>` + ref + `<div class="pyp-fcbox"><h5>${X('منتجاتك أو خدماتك', 'Your products or services')}</h5>${names}<div class="pyp-actions">${n < 5 ? btn('pp-add', X('إضافة منتج', 'Add a product')) : ''}${n > 1 ? btn('pp-del', X('حذف آخر منتج', 'Remove the last product')) : ''}</div></div>` + tables +
      (n > 1 ? wrapT(X('إجمالي المبيعات لكل المنتجات', 'Total sales of all products'), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('المبيعات', 'Sales'), 'ssT')}</tbody>`) : '') + riskBox('salesMarketing') + `<div class="pyp-actions">${saved()}</div>`);
  }
  const WASTE_COLS = [['material', B('المواد', 'Materials')], ['reduce', B('التقليل', 'Reduce')], ['reuse', B('إعادة الاستخدام', 'Reuse')], ['recycle', B('إعادة التدوير', 'Recycle')], ['repurpose', B('إعادة التوظيف لغرض آخر', 'Repurpose')]];
  function wsWaste() {
    const rows = ARR((i) => i).slice(0, 5).map((i) => `<tr>${WASTE_COLS.map(([k, t]) => `<td>${txt('plans.productionCost.waste.' + i + '.' + k, T(t) + ' — ' + (i + 1))}</td>`).join('')}</tr>`).join('');
    return wsBox('pypWasteWs', B('مساحة عملي: المواد والنفايات (النشاط 9)', 'My workspace: materials and waste (Activity 9)'), B('اكتب موادك واذكر لكل منها ما يمكنك فعله: التقليل، إعادة الاستخدام، إعادة التدوير، إعادة التوظيف لغرض آخر. اترك الصفوف الزائدة فارغة.', 'Write your materials and, for each, what you could do: reduce, reuse, recycle, repurpose. Leave unused rows empty.'),
      `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('جدول النفايات', 'Waste table')}"><table class="pyp-table pyp-input"><thead><tr>${WASTE_COLS.map(([k, t]) => `<th scope="col">${esc(T(t))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="pyp-actions">${saved()}</div>`);
  }
  function wsProdQty() {
    const tables = prodList().map((p, i) => wrapT(X('توقّع كمية الإنتاج — ', 'Forecast of production quantity — ') + pname(i), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowIn(X('كمية الإنتاج', 'Production quantity'), 'plans.productionCost.prodQty.' + i, 'pq' + i)}</tbody>`) + `<div class="pyp-actions">${btn('pq-copy', X('استخدم كمية مبيعاتي (النشاط 8) ككمية إنتاج', 'Use my sales quantity (Activity 8) as the production quantity'), ` data-i="${i}"`)}</div>`).join('');
    return wsBox('pypProdQtyWs', B('مساحة عملي: كمية الإنتاج للعام القادم (النشاط 11)', 'My workspace: production quantity for next year (Activity 11)'), B('إذا كنت تنتج بقدر المبيعات تماماً فكمية الإنتاج هي كمية المبيعات؛ وإذا أردت الاحتفاظ بمخزون فاكتب كمياتك أنت (الدليل ص 55). الزر ينسخ الكميات مرة واحدة وتعدّلها بعد ذلك كما تشاء.', 'If you produce just enough for sales, the production quantity is the sales quantity; if you want to keep stock, type your own quantities (manual p. 55). The button copies the quantities once and you can then edit them freely.'), fcNote() + tables + riskBox('productionCost') + `<div class="pyp-actions">${saved()}</div>`);
  }
  const A12 = [[B('الإيجار', 'Rent'), [300, 300, 300, 315, 315, 315]], [B('الكهرباء', 'Electricity'), [100, 100, 100, 100, 120, 120]], [B('القرطاسية', 'Stationery'), [20, 20, 20, 20, 20, 20]], [B('الماء', 'Water'), [18, 18, 18, 18, 18, 18]], [B('الإهلاك', 'Depreciation'), [35, 35, 35, 35, 35, 35]]];
  function wsA12() {
    const rows = ARR((i) => i).slice(0, 6).map((i) => `<tr><th scope="row">${txt('plans.practice.a12.' + i + '.name', X('اسم البند ', 'Item name ') + (i + 1))}</th>${ARR((j) => j).slice(0, 6).map((j) => `<td>${inp('plans.practice.a12.' + i + '.m' + j, X('البند ', 'Item ') + (i + 1) + ' — ' + T(MONTHS[j]))}</td>`).join('')}</tr>`).join('');
    return wsBox('pypA12Ws', B('مساحة عملي: النموذج الفارغ للنشاط 12', 'My workspace: the blank form for Activity 12'), B('اكتب البنود (اسماً لكل صف) ثم المبالغ لأول ستة أشهر؛ يُحسب المجموع تلقائياً. هذا تمرين على مشروع كريس وليس بيانات مشروعك.', 'Name each row, then enter the amounts for the first six months; the total is calculated for you. This is practice on Chris’ business, not your own data.'),
      `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('النموذج الفارغ للنشاط 12', 'The blank form for Activity 12')}"><table class="pyp-table pyp-input"><thead><tr><th scope="col">${X('التفاصيل', 'Details')} <span class="pyp-unitcap" data-calc="unitcap"></span></th>${ARR((j) => j).slice(0, 6).map((j) => `<th scope="col">${esc(T(MONTHS[j]))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">${X('المجموع', 'Total')}</th>${ARR((j) => j).slice(0, 6).map((j) => `<td dir="ltr" data-calc="a12.m${j}"></td>`).join('')}</tr></tfoot></table></div><div class="pyp-actions">${saved()}</div>`);
  }
  const a12Answer = () => `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('إجابة النشاط 12 في الدليل', 'The manual’s answer to Activity 12')}"><table class="pyp-table"><thead><tr><th scope="col">${X('التفاصيل (دولار)', 'Details (US$)')}</th>${ARR((j) => j).slice(0, 6).map((j) => `<th scope="col">${esc(T(MONTHS[j]))}</th>`).join('')}</tr></thead><tbody>${A12.map(([n, v]) => `<tr><th scope="row">${esc(T(n))}</th>${v.map((x) => `<td dir="ltr">${x}</td>`).join('')}</tr>`).join('')}</tbody><tfoot><tr><th scope="row">${X('المجموع', 'Total')}</th>${[473, 473, 473, 488, 508, 508].map((x) => `<td dir="ltr">${x}</td>`).join('')}</tr></tfoot></table></div>`;
  function wsOh() {
    const n = ohN();
    const rows = ARR((i) => i).slice(0, n).map((i) => `<tr><th scope="row">${txt('plans.productionCost.oh.' + i + '.name', X('اسم نفقة عامة ', 'Overhead Expense name ') + (i + 1), X('مثال: الإيجار', 'e.g. Rent'))}</th>${ARR((j) => `<td>${inp('plans.productionCost.oh.' + i + '.m' + j, X('نفقة ', 'Expense ') + (i + 1) + ' — ' + T(MONTHS[j]))}</td>`).join('')}<td dir="ltr" data-calc="oh${i}.t"></td></tr>`).join('');
    return wsBox('pypOhWs', B('مساحة عملي: توقّع النفقات العامة للعام القادم (النشاط 13)', 'My workspace: forecast of Overhead Expenses for next year (Activity 13)'), B('أدرج كل أنواع النفقات العامة في مشروعك، ووزّع على الأشهر النفقات التي لا تُدفع كل شهر (كالرخصة والتأمين) لتقدّر التكلفة والربح لكل شهر بدقة (الدليل ص 56).', 'List every kind of Overhead Expense in your business. Spread costs that are not paid monthly (like licences and insurance) across the months so that cost and profit are estimated accurately for each month (manual p. 56).'),
      fcNote() + `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('توقّع النفقات العامة', 'Forecast of Overhead Expenses')}"><table class="pyp-table pyp-input pyp-wide"><caption>${X('توقّع النفقات العامة', 'Forecast of Overhead Expenses')} <span class="pyp-unitcap" data-calc="unitcap"></span></caption>${mHead(X('التفاصيل', 'Details'))}<tbody>${rows}</tbody><tfoot>${rowCalc(X('المجموع', 'Total'), 'ohT')}</tfoot></table></div>
      <div class="pyp-actions">${n < 20 ? btn('oh-add', X('إضافة سطر', 'Add a row')) : ''}${n > 1 ? btn('oh-del', X('حذف آخر سطر', 'Remove the last row')) : ''}${saved()}</div>` + riskBox('productionCost'));
  }
  function wsMat() {
    const tables = prodList().map((p, i) => wrapT(X('توقّع إجمالي تكلفة المواد — ', 'Forecast of the total Material Cost — ') + pname(i), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('كمية الإنتاج (من النشاط 11)', 'Production quantity (from Activity 11)'), 'mq' + i)}${rowIn(X('تكلفة المادة للوحدة', 'Material Cost per item'), 'plans.productionCost.matItem.' + i, 'mp' + i)}${rowCalc(X('تكلفة المواد', 'Material Cost'), 'mm' + i)}</tbody>`) + `<div class="pyp-actions">${btn('fill-jan', X('طبّق تكلفة كانون الثاني على كل الأشهر', 'Apply the January cost to all months'), ` data-path="plans.productionCost.matItem.${i}"`)}</div>`).join('');
    return wsBox('pypMatWs', B('مساحة عملي: توقّع إجمالي تكلفة المواد (النشاط 14)', 'My workspace: forecast of the total Material Cost (Activity 14)'), B('تكلفة المواد الشهرية = تكلفة المادة للوحدة × كمية الإنتاج (الدليل ص 62). اسأل مورّديك عن الزيادات والخصومات للعام القادم ثم احسب المبالغ الصحيحة. يحصل تاجر التجزئة أو الجملة على تكلفة الوحدة من فواتير مورّديه.', 'Monthly Material Cost = Material Cost per item × production quantity (manual p. 62). Ask your suppliers about increases and discounts for next year, then work out the correct amounts. A retailer or wholesaler finds the cost per item in the suppliers’ invoices.'),
      fcNote() + tables + (prodList().length > 1 ? wrapT(X('إجمالي تكلفة المواد لكل المنتجات', 'Total Material Cost of all products'), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('إجمالي تكلفة المواد', 'Total Material Cost'), 'mmT')}</tbody>`) : '') + `<div class="pyp-actions">${saved()}</div>`);
  }
  const wsLab = () => wsBox('pypLabWs', B('مساحة عملي: توقّع إجمالي تكلفة العمالة (النشاط 15)', 'My workspace: forecast of the total Labour Cost (Activity 15)'), B('تكاليف العمالة هي ما ينفقه المشروع على أجور ورواتب ومزايا من يشاركون مباشرة في الإنتاج أو تقديم الخدمة. وإذا كنت تاجر تجزئة أو جملة فلا تسجّلها هنا بل ضمن النفقات العامة (الدليل ص 63).', 'Labour Costs are all the money your business spends on wages, salaries and benefits for the people directly involved in production or providing the service. If you are a retailer or wholesaler, record them as an Overhead Expense instead (manual p. 63).'),
    fcNote() + wrapT(X('توقّع إجمالي تكلفة العمالة', 'Forecast of the total Labour Cost'), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowIn(X('إجمالي تكلفة العمالة', 'Total Labour Cost'), 'plans.productionCost.lab', 'lab')}</tbody>`) + `<div class="pyp-actions">${saved()}</div>`);
  const wsCosts = () => wsBox('pypCostsWs', B('توقّع التكاليف لمشروعك (النشاط 16)', 'The forecast of costs of your business (Activity 16)'), B('هذا الجدول يُملأ تلقائياً من النشاطين 13 و14 و15، فلا تعيد إدخال الأرقام. وإذا كنت تاجر تجزئة أو جملة فاترك سطر تكاليف العمالة فارغاً.', 'This table is filled automatically from Activities 13, 14 and 15, so you do not re-enter the figures. If you are a retailer or wholesaler, leave the Labour Costs line empty.'),
    fcNote() + wrapT(X('توقّع التكاليف', 'Forecast of costs'), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('تكاليف المواد', 'Material Costs'), 'cM')}${rowCalc(X('تكاليف العمالة', 'Labour Costs'), 'cL')}${rowCalc(X('النفقات العامة', 'Overhead Expenses'), 'cO')}</tbody>`) + riskBox('productionCost'));
  const objHtml = () => { const objs = objList().filter((o) => String(o.text || '').trim()); return objs.length ? `<ul class="pyp-riskref">${objs.map((o) => `<li>${ro(o.text, X('هدف', 'Objective'))}</li>`).join('')}</ul>` : `<p class="pyp-small">${X('لم تسجّل أهدافاً بعد.', 'You have not recorded objectives yet.')}</p>`; };
  function wsProfit() {
    return wsBox('pypProfitWs', B('خطة الأرباح لمشروعك (النشاط 17)', 'The Profit Plan of your business (Activity 17)'), B('يُملأ الجدول تلقائياً من توقع المبيعات (النشاط 8) وتوقع التكاليف (النشاط 16): إجمالي الربح = المبيعات − تكاليف المواد − تكاليف العمالة؛ وصافي الربح = إجمالي الربح − النفقات العامة. الأرقام بين قوسين تعني خسارة.', 'The table is filled automatically from the forecast of sales (Activity 8) and costs (Activity 16): Gross Profit = Sales − Material Costs − Labour Costs; Net Profit = Gross Profit − Overhead Expenses. Figures in brackets mean a loss.'),
      fcNote() + wrapT(X('خطة الأرباح', 'Profit Plan'), mHead(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('المبيعات', 'Sales'), 'pS')}${rowCalc(X('تكاليف المواد', 'Material Costs'), 'pM')}${rowCalc(X('تكاليف العمالة', 'Labour Costs'), 'pL')}${rowCalc(X('إجمالي الربح', 'Gross Profit'), 'pG')}${rowCalc(X('النفقات العامة', 'Overhead Expenses'), 'pO')}${rowCalc(X('صافي الربح', 'Net Profit'), 'pN')}</tbody>`) +
      `<p class="pyp-calcsentence" role="status" data-calc="pSentence"></p><div class="pyp-fcbox"><h5>${X('أهدافي (من بداية الجزء الخامس)', 'My objectives (from the start of Part V)')}</h5><div data-calc-html="objs">${objHtml()}</div>
      <p class="pyp-small">${X('إذا لم يحقق صافي ربحك المتوقع أهدافك فاسأل (كما في الدليل): هل هناك أي طريقة لخفض التكاليف؟ هل هناك أي طريقة لزيادة المبيعات؟ هل الهدف واقعي؟', 'If your forecast Net Profit does not meet your objectives, ask (as in the manual): Is there any way to lower costs? Is there any way to increase sales? Is the objective realistic?')}</p></div>` + riskBox('profit'));
  }
  const CF = [['open', B('1. النقد في بداية الشهر', '1. Cash at the start of the month')], ['sales', B('2. النقد الداخل من المبيعات', '2. Cash in from sales')], ['credit', B('3. النقد الداخل من المبيعات بالآجل', '3. Cash in from credit sales')], ['otherIn', B('4. أي نقد داخل آخر', '4. Any other cash in')], ['tin', B('5. إجمالي النقد الداخل', '5. TOTAL CASH IN')], ['mat', B('6. النقد الخارج لتكاليف المواد', '6. Cash out for Material Costs')], ['lab', B('7. النقد الخارج لتكاليف العمالة', '7. Cash out for Labour Costs')], ['oh', B('8. النقد الخارج للنفقات العامة', '8. Cash out for Overhead Expenses')], ['equip', B('9. النقد الخارج للاستثمار المخطط في المعدات', '9. Cash out for planned investment in equipment')], ['otherOut', B('10. أي نقد خارج آخر', '10. Any other cash out')], ['tout', B('11. إجمالي النقد الخارج', '11. TOTAL CASH OUT')], ['close', B('12. النقد في نهاية الشهر', '12. CASH AT THE END OF THE MONTH')]];
  function wsCash() {
    const loanOn = gv('plans.cashFlow.loanOn', '') === '1';
    const rows = CF.map(([k, t]) => {
      const label = T(t);
      if (k === 'open') return `<tr><th scope="row">${esc(label)}</th><td>${inp('plans.cashFlow.open', label + ' — ' + T(MONTHS[0]))}</td>${ARR((j) => j).slice(1).map((j) => `<td dir="ltr" data-calc="cf.open.m${j}"></td>`).join('')}</tr>`;
      if (['tin', 'tout', 'close'].includes(k)) return `<tr class="pyp-cf-total"><th scope="row">${esc(label)}</th>${ARR((j) => `<td dir="ltr" data-calc="cf.${k}.m${j}"></td>`).join('')}</tr>`;
      return `<tr><th scope="row">${esc(label)}</th>${ARR((j) => `<td>${inp('plans.cashFlow.' + k + '.m' + j, label + ' — ' + T(MONTHS[j]))}</td>`).join('')}</tr>` + (k === 'otherOut' ? `<tr data-loanrow${loanOn ? '' : ' hidden'}><th scope="row">${X('10أ. أقساط القرض (من مساعد القرض أدناه، مضافة إلى السطر 10)', '10a. Loan instalments (from the loan helper below, added to line 10)')}</th>${ARR((j) => `<td dir="ltr" data-calc="cf.loan.m${j}"></td>`).join('')}</tr>` : '');
    }).join('');
    return wsBox('pypCashWs', B('خطة التدفق النقدي لمشروعك (النشاط 18)', 'The Cash Flow Plan of your business (Activity 18)'), B('اتبع الخطوات الاثنتي عشرة في القسم 6.2. الأسطر 5 و11 و12 والنقد في بداية كل شهر بعد الأول تُحسب تلقائياً: إجمالي الداخل = 2 + 3 + 4؛ إجمالي الخارج = 6 + 7 + 8 + 9 + 10؛ النقد في النهاية = 1 + 5 − 11. التدفق النقدي يختلف عن الربح.', 'Follow the twelve steps in section 6.2. Lines 5, 11 and 12 and each later month’s opening cash are calculated for you: total in = 2 + 3 + 4; total out = 6 + 7 + 8 + 9 + 10; closing cash = 1 + 5 − 11. Cash flow is different from profit.'),
      fcNote() + `<div class="pyp-actions">${btn('cf-copy', X('انسخ من توقعاتي: المبيعات والمواد والعمالة والنفقات العامة', 'Copy from my forecasts: sales, material, labour and overhead'))}</div><p class="pyp-small">${X('ينسخ الزر مرة واحدة قيم توقعاتك إلى الأسطر 2 و6 و7 و8 لتعدّلها. عدّلها وفق الخطوات: المبيعات بالآجل، المواد التي تُشترى بالآجل، والنفقات التي تُدفع سنوياً (كالرخصة والتأمين) وغير النقدية كالإهلاك.', 'The button copies your forecast values once into lines 2, 6, 7 and 8 so that you can edit them. Adjust them as the steps explain: credit sales, materials bought on credit, annual payments (like licences and insurance) and non-cash items such as depreciation.')}</p>
      <div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('خطة التدفق النقدي', 'Cash Flow Plan')}"><table class="pyp-table pyp-input pyp-wide"><caption>${X('خطة التدفق النقدي', 'Cash Flow Plan')} <span class="pyp-unitcap" data-calc="unitcap"></span></caption><thead><tr><th scope="col">${X('البند', 'Line')}</th>${MONTHS.map((m) => `<th scope="col">${esc(T(m))}</th>`).join('')}</tr></thead><tbody>${rows}<tr><th scope="row">${X('تنبيه', 'Alert')}</th>${ARR((j) => `<td data-calc="cf.alert.m${j}"></td>`).join('')}</tr></tbody></table></div>
      <label class="pyp-opt"><input type="checkbox" data-kind="cfloan"${loanOn ? ' checked' : ''}> <span>${X('أضف أقساط القرض من مساعد القرض إلى «أي نقد خارج آخر» (السطر 10)', 'Add the loan instalments from the loan helper to “Any other cash out” (line 10)')}</span></label>
      <p class="pyp-calcsentence" role="status" data-calc="cf.sentence"></p>` + riskBox('cashFlow') + `<div class="pyp-actions">${saved()}</div>`);
  }
  const LQ = [['needed', 'هل أحتاج إلى قرض؟ ولماذا؟ (هل أظهرت خطة التدفق النقدي نقصاً لا أستطيع تأجيله أو تخفيضه؟)', 'Do I need a loan? Why? (Does my Cash Flow Plan show a shortage I cannot postpone or reduce?)'], ['purpose', 'كم أحتاج فعلاً ولأي غرض محدد؟ ومتى أحتاج إليه؟', 'How much do I really need and for what specific purpose? When do I need it?'], ['institution', 'ما المؤسسات المالية التي سأقارن بينها؟ وما شروط كل منها (موعد السداد، الفائدة، الضمان، غرامات التأخر)؟', 'Which financial institutions will I compare? What are their conditions (when to pay, interest, collateral, penalties)?'], ['method', 'هل تُحسب الفائدة بالسعر الثابت أم بالرصيد المتناقص؟ ما الفائدة الأقل؟', 'Is the interest charged on a flat rate or a reduced balance? Which interest is lowest?'], ['qualify', 'كيف سأتأهل؟ (سجلات المبيعات والتكاليف والأرباح السابقة، الغرض من القرض، الربح المتوقع لسداده، الضمان)', 'How will I qualify? (past records of sales, costs and profits, the purpose of the loan, the profit to repay it, collateral)'], ['repay', 'كيف سأدير السداد؟ هل يولّد مشروعي إجمالي ربح كافياً وهل رصيدي النقدي موجب كل شهر بعد الأقساط؟', 'How will I manage repayment? Will my business generate enough Gross Profit and is my cash balance positive every month after the instalments?']];
  function wsLoan() {
    const method = gv('plans.loanAccess.method', 'reduced'); const start = String(gv('plans.loanAccess.start', ''));
    return wsBox('pypLoanWs', B('مساحة عملي: خطة الحصول على قرض', 'My workspace: my Loan Access Plan'), B('أداة مساعدة لاختبار قدرتك على السداد، لا لتوصيتك بالاقتراض. تُحسب الفائدة بطريقتي الدليل (أقساط أصل متساوية، الفائدة السنوية ÷ 12 شهرياً) ثم يمكنك إضافة الأقساط إلى خطة التدفق النقدي لترى هل يبقى رصيدك موجباً.', 'A helper to test your ability to repay, not a recommendation to borrow. Interest is calculated with the manual’s two methods (equal principal payments, annual rate ÷ 12 per month); you can then add the instalments to your Cash Flow Plan to see whether your balance stays positive.'),
      `<p class="pyp-calcsentence" role="status" data-calc="loan.short"></p>
      <div class="pyp-fc-row"><label>${X('مبلغ القرض', 'Loan amount')} ${inp('plans.loanAccess.amount', X('مبلغ القرض', 'Loan amount'))}</label><label>${X('الفائدة السنوية %', 'Interest % per annum')} ${inp('plans.loanAccess.rate', X('الفائدة السنوية', 'Interest per annum'))}</label><label>${X('عدد أشهر السداد', 'Number of months to repay')} ${inp('plans.loanAccess.months', X('عدد الأشهر', 'Number of months'))}</label>
      <label>${X('طريقة حساب الفائدة', 'Interest method')}<select class="pyp-sel" data-kind="fsel" data-key="plans.loanAccess.method"><option value="reduced"${method === 'reduced' ? ' selected' : ''}>${X('الرصيد المتناقص', 'Reduced balance')}</option><option value="flat"${method === 'flat' ? ' selected' : ''}>${X('السعر الثابت', 'Flat rate')}</option></select></label>
      <label>${X('شهر أول قسط في الخطة', 'Month of the first instalment')}<select class="pyp-sel" data-kind="fsel" data-key="plans.loanAccess.start"><option value="">—</option>${MONTHS.map((m, i) => `<option value="${i + 1}"${start === String(i + 1) ? ' selected' : ''}>${esc(T(m))}</option>`).join('')}</select></label></div>
      <div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('مقارنة طريقتي الفائدة', 'Comparison of the two interest methods')}"><table class="pyp-table"><caption>${X('مقارنة الطريقتين لنفس القرض', 'The two methods for the same loan')}</caption><thead><tr><th scope="col">${X('الطريقة', 'Method')}</th><th scope="col">${X('إجمالي الفائدة', 'Total interest')}</th><th scope="col">${X('إجمالي ما يُدفع', 'Total paid')}</th></tr></thead><tbody><tr><th scope="row">${X('السعر الثابت', 'Flat rate')}</th><td dir="ltr" data-calc="loan.flat.i"></td><td dir="ltr" data-calc="loan.flat.t"></td></tr><tr><th scope="row">${X('الرصيد المتناقص', 'Reduced balance')}</th><td dir="ltr" data-calc="loan.red.i"></td><td dir="ltr" data-calc="loan.red.t"></td></tr></tbody></table></div>
      <div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('جدول السداد', 'Repayment schedule')}"><table class="pyp-table"><caption>${X('جدول السداد بالطريقة المختارة', 'Repayment schedule for the chosen method')}</caption><thead><tr><th scope="col">${X('الشهر', 'Month')}</th><th scope="col">${X('الفائدة', 'Interest')}</th><th scope="col">${X('الأصل', 'Principal')}</th><th scope="col">${X('إجمالي الدفعة', 'Total payment')}</th><th scope="col">${X('رصيد القرض', 'Loan balance')}</th></tr></thead><tbody data-calc-html="loan.rows"></tbody></table></div>
      <p class="pyp-small" data-calc="loan.cut"></p><p class="pyp-small">${X('إذا حصلت على القرض فسجّل المبلغ المستلم في «أي نقد داخل آخر» (السطر 4) في الشهر الذي تتسلمه فيه.', 'If you receive the loan, enter the amount received under “Any other cash in” (line 4) in the month you receive it.')}</p>
      <h5>${X('أسئلة خطتي للحصول على قرض (القسمان 7.1–7.5)', 'My Loan Access Plan questions (sections 7.1–7.5)')}</h5>${LQ.map(([k, a, e]) => area('plans.loanAccess.q.' + k, X(a, e))).join('')}<div class="pyp-actions">${saved()}</div>`);
  }

  /* ---------- calculations → DOM ---------- */
  function recalc(root) {
    if (!root.querySelector('.pyp-plan, #pypRiskRef, [id^="pypEx-a1"]')) return;
    const set = (name, text) => root.querySelectorAll('[data-calc="' + name + '"]').forEach((el) => { el.textContent = text; });
    const put = (key, arr, total) => { arr.forEach((v, j) => set(key + '.m' + j, money(v))); if (total !== false) set(key + '.t', money(sumNN(arr))); };
    const u = unitTxt(); set('unitcap', u ? '(' + X('الوحدة: ', 'Unit: ') + u + ')' : '');
    const m = model();
    m.P.forEach((x, i) => {
      put('sq' + i, x.qty); put('ss' + i, x.sales); put('pq' + i, x.pq); put('mp' + i, x.per, false); put('mm' + i, x.mat); put('mq' + i, x.pq);
      const sq = sumNN(x.qty), ss = sumNN(x.sales); set('sp' + i + '.t', sq && ss !== null ? calc.fmt(calc.round2(ss / sq), { dec: 2 }).replace(/\.00$/, '') : '');
      set('mp' + i + '.t', '');
    });
    put('ssT', m.sales); put('mmT', m.mat); put('ohT', m.ohT); put('lab', m.lab);
    m.oh.forEach((r, i) => set('oh' + i + '.t', money(sumNN(r))));
    for (let j = 0; j < 6; j++) { const col = ARR((i) => (i < 6 ? calc.parse(gv('plans.practice.a12.' + i + '.m' + j, '')) : null)); set('a12.m' + j, anyNull(col) ? money(calc.round2(col.reduce((t, x) => t + (x || 0), 0))) : ''); }
    put('cM', m.mat); put('cL', m.lab); put('cO', m.ohT);
    put('pS', m.sales); put('pM', m.mat); put('pL', m.lab); put('pG', m.gross); put('pO', m.ohT); put('pN', m.net);
    const tn = sumNN(m.net), tg = sumNN(m.gross);
    set('pSentence', tn === null ? '' : X('إجمالي صافي الربح المتوقع للعام: ', 'Forecast total Net Profit for the year: ') + calc.fmt(tn) + (tn < 0 ? X(' (خسارة).', ' (a loss).') : '.') + (tg !== null ? ' ' + X('إجمالي الربح المتوقع: ', 'Forecast total Gross Profit: ') + calc.fmt(tg) + '.' : '') + ' ' + X('هذه توقعات وليست نتائج فعلية.', 'These are forecasts, not actual results.'));
    // cash flow
    root.querySelectorAll('[data-loanrow]').forEach((tr) => { tr.hidden = gv('plans.cashFlow.loanOn', '') !== '1'; });
    const c = cash(); const rowsOf = (k) => ARR((j) => (j <= c.last ? c.rows[j][k] : null));
    ARR((j) => j).forEach((j) => {
      const r = c.rows[j]; set('cf.tin.m' + j, r ? money(r.cashIn) : ''); set('cf.tout.m' + j, r ? money(r.cashOut) : ''); set('cf.close.m' + j, r ? money(r.close) : '');
      if (j > 0) set('cf.open.m' + j, r ? money(r.open) : ''); set('cf.loan.m' + j, c.li.arr[j] > 0 ? money(c.li.arr[j]) : '');
      set('cf.alert.m' + j, r && r.close < 0 ? '⚠ ' + X('نقص نقدي', 'Cash shortage') : '');
    });
    const neg = c.rows.map((r, j) => ({ j, v: r.close })).filter((x) => x.v < 0);
    set('cf.sentence', !c.rows.length ? '' : neg.length ? X('تُظهر الخطة نقصاً في النقد في: ', 'Your plan shows a cash shortage in: ') + neg.map((x) => T(MONTHS[x.j]) + ' (' + calc.fmt(x.v) + ')').join('، ') + X('. راجع أسئلة القسم 6.3 قبل أي قرار.', '. Review the questions in section 6.3 before any decision.') : X('لا يظهر نقص نقدي في الأشهر التي أدخلتها (الرصيد في نهاية كل شهر غير سالب).', 'No cash shortage appears in the months you entered (the closing cash is never negative).'));
    set('loan.short', !neg.length ? (c.rows.length ? X('لا يوجد نقص نقدي في خطتك الحالية.', 'There is no cash shortage in your current plan.') : '') : X('أكبر نقص في خطة التدفق النقدي: ', 'Largest shortage in your Cash Flow Plan: ') + calc.fmt(Math.min(...neg.map((x) => x.v))) + ' (' + T(MONTHS[neg.reduce((a, b) => (b.v < a.v ? b : a)).j]) + '). ' + X('بحسب الدليل تحتاج إلى هذا المبلغ على الأقل إذا اخترت الاقتراض لتغطيته؛ والقرار لك.', 'According to the manual you would need at least this amount if you choose to borrow to cover it; the decision is yours.'));
    // loan
    const a = gv('plans.loanAccess.amount', ''), r = gv('plans.loanAccess.rate', ''), n = gv('plans.loanAccess.months', '');
    const fl = calc.loanSchedule(a, r, n, 'flat'), rb = calc.loanSchedule(a, r, n, 'reduced');
    set('loan.flat.i', fl ? calc.fmt(fl.totalInterest) : ''); set('loan.flat.t', fl ? calc.fmt(fl.totalPaid) : ''); set('loan.red.i', rb ? calc.fmt(rb.totalInterest) : ''); set('loan.red.t', rb ? calc.fmt(rb.totalPaid) : '');
    const ch = gv('plans.loanAccess.method', 'reduced') === 'flat' ? fl : rb; const body = root.querySelector('[data-calc-html="loan.rows"]');
    if (body) body.innerHTML = ch ? ch.rows.map((x) => `<tr><th scope="row"><bdi>${x.n}</bdi></th><td dir="ltr">${calc.fmt(x.interest)}</td><td dir="ltr">${calc.fmt(x.principal)}</td><td dir="ltr">${calc.fmt(x.total)}</td><td dir="ltr">${calc.fmt(x.balance)}</td></tr>`).join('') + `<tr><th scope="row">${X('الإجمالي', 'Total')}</th><td dir="ltr">${calc.fmt(ch.totalInterest)}</td><td dir="ltr">${calc.fmt(ch.totalPrincipal)}</td><td dir="ltr">${calc.fmt(ch.totalPaid)}</td><td></td></tr>` : `<tr><td colspan="5">${X('أدخل المبلغ والفائدة وعدد الأشهر.', 'Enter the amount, the interest and the number of months.')}</td></tr>`;
    if (body && window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(body);
    const ob = root.querySelector('[data-calc-html="objs"]'); if (ob) ob.innerHTML = objHtml();
    const li = loanInst(); set('loan.cut', li.cut ? X('بعض الأقساط تقع بعد كانون الأول فلا تظهر في خطة التدفق النقدي ذات الاثني عشر شهراً.', 'Some instalments fall after December and do not appear in the 12-month Cash Flow Plan.') : '');
    updateProgress(root);
  }

  /* ---------- actions ---------- */
  function click(a, b, ctx, root) {
    const rerender = () => { store.flush(); ctx.rerender(true); };
    const focus = (sel) => { const f = root.querySelector(sel); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); } };
    if (a === 'obj-add') { const l = objList().slice(); l.push({ id: 'o' + Date.now().toString(36) + l.length, kind: '', text: '' }); store.set('objectives', l); rerender(); focus('#pypObj-' + (l.length - 1) + ' textarea'); return true; }
    if (a === 'obj-del') { if (!window.confirm(X('حذف هذا الهدف؟', 'Remove this objective?'))) return true; const l = objList().slice(); l.splice(Number(b.dataset.idx), 1); store.set('objectives', l); rerender(); focus('[data-act="obj-add"]'); return true; }
    if (a === 'pp-add') { if (nProd() >= 5) return true; store.set('plans.nProducts', nProd() + 1); rerender(); return true; }
    if (a === 'pp-del') {
      if (nProd() <= 1) return true; const i = nProd() - 1; const m = model().P[i];
      const has = [m.qty, m.price, m.pq, m.per].some(anyNull);
      if (has && !window.confirm(X('سيُحذف آخر منتج وأرقامه. متابعة؟', 'The last product and its figures will be removed. Continue?'))) return true;
      store.set('plans.nProducts', i); store.set('plans.productNames.' + i, '');
      store.set('plans.salesMarketing.fc.' + i, {}); store.set('plans.productionCost.prodQty.' + i, {}); store.set('plans.productionCost.matItem.' + i, {});
      rerender(); return true;
    }
    if (a === 'oh-add') { store.set('plans.productionCost.ohN', Math.min(20, ohN() + 1)); rerender(); focus('[data-key="plans.productionCost.oh.' + (ohN() - 1) + '.name"]'); return true; }
    if (a === 'oh-del') {
      const i = ohN() - 1; if (i < 1) return true; const row = gv('plans.productionCost.oh.' + i, {}) || {};
      if (Object.values(row).some((v) => String(v || '').trim()) && !window.confirm(X('سيُحذف آخر سطر وأرقامه. متابعة؟', 'The last row and its figures will be removed. Continue?'))) return true;
      store.set('plans.productionCost.oh.' + i, {}); store.set('plans.productionCost.ohN', i); rerender(); return true;
    }
    if (a === 'fill-jan') { const path = b.dataset.path; const v = gv(path + '.m0', ''); for (let j = 1; j < N; j++) store.set(path + '.m' + j, v); rerender(); return true; }
    if (a === 'pq-copy') {
      const i = Number(b.dataset.i); const src = ser('plans.salesMarketing.fc.' + i + '.qty'); const dst = ser('plans.productionCost.prodQty.' + i);
      if (dst.some((v) => String(v).trim()) && !window.confirm(X('ستُستبدل كميات الإنتاج الحالية. متابعة؟', 'Your current production quantities will be replaced. Continue?'))) return true;
      src.forEach((v, j) => store.set('plans.productionCost.prodQty.' + i + '.m' + j, v)); rerender(); return true;
    }
    if (a === 'cf-copy') {
      const m = model(); const cur = ['sales', 'mat', 'lab', 'oh'].some((k) => ser('plans.cashFlow.' + k).some((v) => String(v).trim()));
      if (cur && !window.confirm(X('ستُستبدل قيم الأسطر 2 و6 و7 و8 الحالية. متابعة؟', 'The current values of lines 2, 6, 7 and 8 will be replaced. Continue?'))) return true;
      const map = { sales: m.sales, mat: m.mat, lab: m.lab, oh: m.ohT };
      Object.keys(map).forEach((k) => map[k].forEach((v, j) => store.set('plans.cashFlow.' + k + '.m' + j, v === null ? '' : String(v)))); rerender(); return true;
    }
    return false;
  }
  // the loan toggle is a checkbox (not a data-act button)
  document.addEventListener('change', (e) => { const t = e.target; if (t && t.dataset && t.dataset.kind === 'cfloan') { store.set('plans.cashFlow.loanOn', t.checked ? '1' : ''); store.flush(); const root = t.closest('.pyp-root') || document; recalc(root); } });
  // loan method / start month are selects (fsel) that only store the value; recalc once the store has it
  document.addEventListener('change', (e) => { const t = e.target; if (t && t.dataset && t.dataset.kind === 'fsel' && /^plans\.loanAccess\./.test(t.dataset.key || '')) { const root = t.closest('.pyp-root') || document; setTimeout(() => recalc(root), 0); } });

  const any = (...arrs) => arrs.some(anyNull);
  L.register({
    ws: { 'p5-objectives': wsObjectives, 'p5-riskref': wsRiskRef, 'p5-sales': wsSales, 'p5-waste': wsWaste, 'p5-prodqty': wsProdQty, 'p5-a12': wsA12, 'p5-oh': wsOh, 'p5-mat': wsMat, 'p5-lab': wsLab, 'p5-costs': wsCosts, 'p5-profit': wsProfit, 'p5-cash': wsCash, 'p5-loan': wsLoan },
    recalc, click, exExtra: { a12: { ansHtml: a12Answer } },
    done: {
      a8: () => model().P.some((x) => any(x.qty, x.price)),
      a9: () => ARR((i) => i).slice(0, 5).some((i) => WASTE_COLS.some(([k]) => String(gv('plans.productionCost.waste.' + i + '.' + k, '')).trim())),
      a11: () => model().P.some((x) => anyNull(x.pq)),
      a12: () => ARR((i) => i).slice(0, 6).some((i) => ARR((j) => j).slice(0, 6).some((j) => calc.parse(gv('plans.practice.a12.' + i + '.m' + j, '')) !== null)),
      a13: () => model().oh.some(anyNull),
      a14: () => model().P.some((x) => anyNull(x.per)),
      a15: () => anyNull(model().lab),
      a16: () => { const m = model(); return any(m.mat, m.lab, m.ohT); },
      a17: () => { const m = model(); return any(m.sales, m.mat, m.lab, m.ohT); },
      a18: () => { const c = cash(); return c.last >= 0; }
    }
  });
})();
