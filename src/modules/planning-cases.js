/* IYB Planning – end-of-manual workspaces (Phase 6): the two "Can You Help?" cases (Reliable Tailors cash flow; Chimba Carpentry sales,
   costs and profit) and the editable Action Plan. Application guidance, clearly labelled. The learner works out and types the case figures
   (no figures are pre-filled); only the manual's own mechanical lines (sales = quantity × price, totals, Gross/Net Profit, cash lines 5, 11, 12)
   are calculated. The manual's answers (pp. 98–100) are shown only on request. No scoring is applied. Data: cases.* and actionPlan[]. */
(() => {
  'use strict';
  const L = window.SIYBPlanningLearn; if (!L) return;
  const { X, T, esc, gv, store, calc, B, MONTHS, appTag, saved, inp, txt, area, updateProgress } = L._h;
  const M3 = [0, 1, 2], ARR3 = (f) => M3.map(f);
  const num3 = (path) => ARR3((j) => calc.parse(gv(path + '.m' + j, '')));
  const anyNN = (a) => a.some((v) => v !== null);
  const money = (n) => (n === null || n === undefined ? '' : calc.fmt(n));
  const box = (id, title, intro, body) => `<section class="pyp-panel pyp-ws pyp-case" id="${id}" aria-label="${esc(T(title))}"><h4>${esc(T(title))} ${appTag()}</h4>${intro ? `<p class="pyp-small">${esc(T(intro))}</p>` : ''}${body}</section>`;
  const head3 = (first) => `<thead><tr><th scope="col">${first}</th>${M3.map((j) => `<th scope="col">${esc(T(MONTHS[j]))}</th>`).join('')}</tr></thead>`;
  const wrap = (label, inner) => `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${esc(label)}"><table class="pyp-table pyp-input"><caption>${esc(label)}</caption>${inner}</table></div>`;
  const rowIn = (label, path) => `<tr><th scope="row">${esc(label)}</th>${M3.map((j) => `<td>${inp(path + '.m' + j, label + ' — ' + T(MONTHS[j]))}</td>`).join('')}</tr>`;
  const rowCalc = (label, key, cls) => `<tr${cls ? ` class="${cls}"` : ''}><th scope="row">${esc(label)}</th>${M3.map((j) => `<td dir="ltr" data-calc="${key}.m${j}"></td>`).join('')}</tr>`;
  const caseNote = () => `<div class="pyp-important" role="note">${X('اكتب أنت الأرقام التي تتوصل إليها من معلومات الحالة. يحسب التطبيق فقط الأسطر الحسابية في النموذج (المبيعات = الكمية × السعر، والمجاميع، والأرباح، وأسطر التدفق النقدي 5 و11 و12). ولا يعطي التطبيق درجات؛ قارن بإجابة الدليل بعد أن تجرّب.', 'Type the figures you work out from the case information. The app only calculates the form’s mechanical lines (sales = quantity × price, totals, profits and cash-flow lines 5, 11 and 12). It gives no score; compare with the manual’s answer after you have tried.')}</div>`;

  /* ---------- 1.1 Reliable Tailors ---------- */
  const TL = [['open', B('1. النقد في بداية الشهر', '1. Cash at the start of the month')], ['sales', B('2. النقد الداخل من المبيعات', '2. Cash in from sales')], ['credit', B('3. النقد الداخل من المبيعات بالآجل', '3. Cash in from credit sales')], ['otherIn', B('4. أي نقد داخل آخر', '4. Any other cash in')], ['tin', B('5. إجمالي النقد الداخل', '5. TOTAL CASH IN')], ['mat', B('6. النقد الخارج لتكاليف المواد', '6. Cash out for Material Costs')], ['lab', B('7. النقد الخارج لتكاليف العمالة', '7. Cash out for Labour Costs')], ['oh', B('8. النقد الخارج للنفقات العامة', '8. Cash out for Overhead Expenses')], ['equip', B('9. النقد الخارج للاستثمار المخطط في المعدات', '9. Cash out for planned investment in equipment')], ['otherOut', B('10. أي نقد خارج آخر', '10. Any other cash out')], ['tout', B('11. إجمالي النقد الخارج', '11. TOTAL CASH OUT')], ['close', B('12. النقد في نهاية الشهر', '12. CASH AT THE END OF THE MONTH')]];
  function wsTailors() {
    const rows = TL.map(([k, t]) => {
      const label = T(t);
      if (k === 'open') return `<tr><th scope="row">${esc(label)}</th><td>${inp('cases.tailors.open', label + ' — ' + T(MONTHS[0]))}</td>${[1, 2].map((j) => `<td dir="ltr" data-calc="tl.open.m${j}"></td>`).join('')}</tr>`;
      if (['tin', 'tout', 'close'].includes(k)) return rowCalc(label, 'tl.' + k, 'pyp-cf-total');
      return rowIn(label, 'cases.tailors.' + k);
    }).join('');
    return box('pypTailorsWs', B('مساحة عملي: خطة التدفق النقدي لـ«ريلايبل تيلرز» (الدولار)', 'My workspace: Cash Flow Plan for Reliable Tailors (US$)'), B('أكمل الأسطر 1–4 و6–10 لكل شهر. السطران 5 و11 والنقد في نهاية الشهر وبداية الشهر التالي يُحسبان تلقائياً.', 'Complete lines 1–4 and 6–10 for each month. Lines 5 and 11, the closing cash and the next month’s opening cash are calculated for you.'),
      caseNote() + wrap(X('خطة التدفق النقدي', 'Cash Flow Plan'), head3(X('التفاصيل (دولار)', 'Details (US$)')) + `<tbody>${rows}</tbody>`) + `<p class="pyp-calcsentence" role="status" data-calc="tl.sentence"></p><div class="pyp-actions">${saved()}</div>`);
  }
  const AT = { open: ['2,600', '4,925', '5,325'], sales: ['2,500', '3,000', '3,500'], credit: ['4,000', '2,500', '3,000'], otherIn: ['825', '275', '325'], tin: ['7,325', '5,775', '6,825'], mat: ['2,200', '2,720', '3,230'], lab: ['800', '1,080', '1,220'], oh: ['1,100', '1,200', '1,200'], equip: ['500', '–', '–'], otherOut: ['400', '375', '325'], tout: ['5,000', '5,375', '5,975'], close: ['4,925', '5,325', '6,175'] };
  const tailorsAnswer = () => `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('إجابة الدليل: خطة التدفق النقدي', 'The manual’s answer: Cash Flow Plan')}"><table class="pyp-table"><thead><tr><th scope="col">${X('التفاصيل (دولار)', 'Details (US$)')}</th>${M3.map((j) => `<th scope="col">${esc(T(MONTHS[j]))}</th>`).join('')}</tr></thead><tbody>${TL.map(([k, t]) => `<tr><th scope="row">${esc(T(t))}</th>${AT[k].map((v) => `<td dir="ltr">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p>${X('ملاحظة (من الدليل): «أي نقد داخل آخر» يشمل ضريبة القيمة المضافة المحصّلة والقروض المستلمة خلال الشهر. وضريبة القيمة المضافة المحصّلة هي 5% من المبيعات (شاملة المبيعات النقدية للشهر والنقد المقبوض من المبيعات بالآجل للشهر السابق). ففي كانون الثاني ستكون 325 دولاراً (5% × (2,500 + 4,000)) والمبلغ المستلم من القرض 500 دولار.', 'Please note (from the manual): “Any other cash in” includes VAT collected and loans received during the month. VAT collected is 5% of sales (including cash sales for the month and cash received from credit sales from the previous month). For example, in January, the VAT collected will be $325 (5% x (2,500 + 4,000)) and the amount received from the loan will be $500.')}</p>
    <p>${X('«أي نقد خارج آخر» يشمل دفع مبلغ ضريبة القيمة المضافة المحصّلة في الشهر السابق وقسط القرض الشهري. حصّلت «ريلايبل تيلرز» 350 دولاراً ضريبة قيمة مضافة في كانون الأول وستدفع قسط قرض 50 دولاراً في كانون الثاني (400). وفي شباط ستكون ضريبة القيمة المضافة المحصّلة في كانون الثاني 325 دولاراً فيكون «أي نقد خارج آخر» لشباط 325 + 50 = 375 دولاراً.', '“Any other cash out” includes the payment of the VAT amount collected during the previous month and the monthly loan payment. Reliable Tailors collected $350 in VAT during December and will make a $50 loan payment in January. In February, VAT collected during January will be $325 so “Any other cash out” for February will be $325 + $50 = $375.')}</p>`;

  /* ---------- 1.2 Chimba Carpentry ---------- */
  const OHK = [['rent', B('الإيجار', 'Rent')], ['elec', B('الكهرباء', 'Electricity')], ['transport', B('النقل', 'Transport')], ['wages', B('الأجور', 'Wages')], ['maint', B('صيانة الماكينات', 'Machinery maintenance')]];
  function wsChimba() {
    const chair = X('الكرسي', 'Chair'), tab = X('الطاولة', 'Table');
    const sales = wrap(X('1. توقّع المبيعات', '1. Forecast of Sales'), head3(X('التفاصيل', 'Details')) + `<tbody>${rowIn(chair + ' — ' + X('كمية المبيعات', 'Sales quantity'), 'cases.chimba.chair.qty')}${rowIn(chair + ' — ' + X('سعر البيع ($)', 'Sales price ($)'), 'cases.chimba.chair.price')}${rowCalc(chair + ' — ' + X('المبيعات ($)', 'Sales ($)'), 'cm.cs')}${rowIn(tab + ' — ' + X('كمية المبيعات', 'Sales quantity'), 'cases.chimba.table.qty')}${rowIn(tab + ' — ' + X('سعر البيع ($)', 'Sales price ($)'), 'cases.chimba.table.price')}${rowCalc(tab + ' — ' + X('المبيعات ($)', 'Sales ($)'), 'cm.ts')}${rowCalc(X('إجمالي المبيعات ($)', 'TOTAL SALES ($)'), 'cm.sales', 'pyp-cf-total')}</tbody>`);
    const oh = wrap(X('2. توقّع النفقات العامة الشهرية (الوحدة: دولار)', '2. Forecast of Overhead Expense per month (Unit: US$)'), `<thead><tr><th scope="col">${X('التفاصيل', 'Details')}</th><th scope="col">${X('المبلغ', 'Amount')}</th></tr></thead><tbody>${OHK.map(([k, t]) => `<tr><th scope="row">${esc(T(t))}</th><td>${inp('cases.chimba.oh.' + k, T(t))}</td></tr>`).join('')}<tr class="pyp-cf-total"><th scope="row">${X('المجموع', 'Total')}</th><td dir="ltr" data-calc="cm.ohT"></td></tr></tbody>`);
    const lab = wrap(X('3. توقّع إجمالي تكلفة العمالة (الوحدة: دولار)', '3. Forecast of the total Labour Cost (Unit: US$)'), head3(X('التفاصيل', 'Details')) + `<tbody>${rowIn(X('الأجور — شيمبا', 'Wages – Chimba'), 'cases.chimba.lab')}${rowCalc(X('المجموع', 'Total'), 'cm.lab', 'pyp-cf-total')}</tbody>`);
    const mat = wrap(X('4. توقّع إجمالي تكلفة المواد', '4. Forecast of total Material Cost'), head3(X('التفاصيل', 'Details')) + `<tbody>${rowIn(X('تكلفة المادة للوحدة — كرسي ($)', 'Material Cost per item – chair ($)'), 'cases.chimba.chair.per')}${rowIn(X('عدد الكراسي المنتجة', 'Number of chairs produced'), 'cases.chimba.chair.num')}${rowCalc(X('تكلفة المواد لصنع الكراسي ($)', 'Material Cost for making chairs ($)'), 'cm.mc')}${rowIn(X('تكلفة المادة للوحدة — طاولة ($)', 'Material Cost per item – table ($)'), 'cases.chimba.table.per')}${rowIn(X('عدد الطاولات المنتجة', 'Number of tables produced'), 'cases.chimba.table.num')}${rowCalc(X('تكلفة المواد لصنع الطاولات ($)', 'Material Cost for making tables ($)'), 'cm.mt')}${rowCalc(X('المجموع ($)', 'Total ($)'), 'cm.mat', 'pyp-cf-total')}</tbody>`);
    const costs = wrap(X('5. توقّع التكاليف (الوحدة: دولار) — يُملأ من 2 و3 و4', '5. Forecast of costs (Unit: US$) — filled from 2, 3 and 4'), head3(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('تكاليف المواد', 'Material Costs'), 'cm.cM')}${rowCalc(X('تكاليف العمالة', 'Labour Costs'), 'cm.cL')}${rowCalc(X('النفقات العامة', 'Overhead Expenses'), 'cm.cO')}${rowCalc(X('المجموع', 'Total'), 'cm.cT', 'pyp-cf-total')}</tbody>`);
    const prof = wrap(X('6. خطة الأرباح (الوحدة: دولار)', '6. Profit Plan (Unit: US$)'), head3(X('التفاصيل', 'Details')) + `<tbody>${rowCalc(X('إجمالي المبيعات', 'Total Sales'), 'cm.pS')}${rowCalc(X('إجمالي تكاليف المواد', 'Total Material Costs'), 'cm.pM')}${rowCalc(X('إجمالي تكاليف العمالة', 'Total Labour Costs'), 'cm.pL')}${rowCalc(X('إجمالي الربح', 'Gross Profit'), 'cm.pG', 'pyp-cf-total')}${rowCalc(X('النفقات العامة', 'Overhead Expenses'), 'cm.pO')}${rowCalc(X('صافي الربح', 'Net Profit'), 'cm.pN', 'pyp-cf-total')}</tbody>`);
    return box('pypChimbaWs', B('مساحة عملي: خطط «شيمبا للنجارة»', 'My workspace: Chimba Carpentry’s plans'), B('اكتب الأرقام التي تستنتجها من معلومات الحالة. النفقات العامة المكتوبة شهرية فتُطبَّق على كل شهر يُدخل فيه بيانات.', 'Type the figures you work out from the case. The overhead amounts are per month, so they apply to every month for which you enter data.'),
      caseNote() + sales + oh + lab + mat + costs + prof + `<p class="pyp-calcsentence" role="status" data-calc="cm.sentence"></p><div class="pyp-actions">${saved()}</div>`);
  }
  const chimbaAnswer = () => {
    const t = (cap, rows) => `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${esc(cap)}"><table class="pyp-table"><caption>${esc(cap)}</caption><tbody>${rows.map((r) => `<tr><th scope="row">${esc(T(r[0]))}</th>${r.slice(1).map((v) => `<td dir="ltr">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return t(X('توقّع المبيعات — كانون الثاني', 'Forecast of Sales — January'), [[B('كرسي: الكمية', 'Chair: quantity'), 20], [B('كرسي: السعر ($)', 'Chair: price ($)'), 40], [B('كرسي: المبيعات ($)', 'Chair: sales ($)'), 800], [B('طاولة: الكمية', 'Table: quantity'), 10], [B('طاولة: السعر ($)', 'Table: price ($)'), 80], [B('طاولة: المبيعات ($)', 'Table: sales ($)'), 800], [B('إجمالي المبيعات ($)', 'TOTAL SALES ($)'), '1,600']]) +
      t(X('النفقات العامة الشهرية ($)', 'Overhead Expense per month ($)'), [[B('الإيجار', 'Rent'), 150], [B('الكهرباء', 'Electricity'), 50], [B('النقل', 'Transport'), 32], [B('الأجور', 'Wages'), 150], [B('صيانة الماكينات', 'Machinery maintenance'), 40], [B('المجموع', 'Total'), 422]]) +
      t(X('إجمالي تكلفة العمالة — كانون الثاني ($)', 'Total Labour Cost — January ($)'), [[B('الأجور — شيمبا', 'Wages – Chimba'), 350], [B('المجموع', 'Total'), 350]]) +
      t(X('إجمالي تكلفة المواد — كانون الثاني ($)', 'Total Material Cost — January ($)'), [[B('تكلفة الوحدة — كرسي', 'Cost per item – chair'), 10], [B('كراسي منتجة', 'Chairs produced'), 20], [B('تكلفة مواد الكراسي', 'Material Cost for chairs'), 200], [B('تكلفة الوحدة — طاولة', 'Cost per item – table'), 22], [B('طاولات منتجة', 'Tables produced'), 10], [B('تكلفة مواد الطاولات', 'Material Cost for tables'), 220], [B('المجموع', 'Total'), 420]]) +
      t(X('توقّع التكاليف — كانون الثاني ($)', 'Forecast of costs — January ($)'), [[B('تكاليف المواد', 'Material Costs'), 420], [B('تكاليف العمالة', 'Labour Costs'), 350], [B('النفقات العامة', 'Overhead Expenses'), 422], [B('المجموع', 'Total'), '1,192']]) +
      t(X('خطة الأرباح — كانون الثاني ($)', 'Profit Plan — January ($)'), [[B('إجمالي المبيعات', 'Total Sales'), '1,600'], [B('إجمالي تكاليف المواد', 'Total Material Costs'), 420], [B('إجمالي تكاليف العمالة', 'Total Labour Costs'), 350], [B('إجمالي الربح', 'Gross Profit'), 830], [B('النفقات العامة', 'Overhead Expenses'), 422], [B('صافي الربح', 'Net Profit'), 408]]);
  };

  /* ---------- Action Plan ---------- */
  const apList = () => { const v = gv('actionPlan', []); return Array.isArray(v) ? v : []; };
  const apCols = [['what', B('ما المشكلة؟', 'WHAT is the problem?')], ['how', B('كيف تحل المشكلة؟', 'HOW do you solve the problem?')], ['who', B('من سيحلها؟', 'WHO will solve the problem?')], ['when', B('متى ستُحل المشكلة؟', 'WHEN will the problem be solved?')]];
  function wsAction() {
    const list = apList();
    const card = (a, i) => `<div class="pyp-fc" id="pypAp-${i}" role="group" aria-label="${X('إجراء ', 'Action ')}${i + 1}"><div class="pyp-fc-head"><strong><bdi>${i + 1}</bdi>. ${X('إجراء', 'Action')}</strong>${btn('ap-del', X('حذف', 'Remove'), ` data-idx="${i}"`)}</div>
      ${apCols.map(([k, t]) => `<label class="pyp-q"><span>${esc(T(t))}</span><textarea class="pyp-ta" rows="2" data-kind="ta" data-key="actionPlan.${i}.${k}">${esc(a[k] || '')}</textarea></label>`).join('')}
      <label class="pyp-opt"><input type="checkbox" data-kind="apdone" data-idx="${i}"${a.done ? ' checked' : ''}> <span>${X('أنجزت هذا الإجراء (للمتابعة الأسبوعية)', 'I have completed this action (for the weekly check)')}</span></label></div>`;
    return box('pypActionWs', B('مساحة عملي: خطتي لتحسين التخطيط في مشروعي', 'My workspace: my plan to improve planning in my business'), B('أضف إجراءً لكل مشكلة تخطيطية في مشروعك. تُحفظ الخطة تلقائياً ويمكنك العودة إليها وتعديلها ووضع علامة على ما أنجزته (علامة الإنجاز من إضافة التطبيق وليست في نموذج الدليل).', 'Add one action for each planning problem in your business. The plan saves automatically; you can return to it, edit it and tick what you have completed (the completed tick is an app addition, not in the manual’s form).'),
      `<div id="pypApList">${list.length ? list.map(card).join('') : `<p class="pyp-small">${X('لا توجد إجراءات بعد. اضغط «إضافة إجراء».', 'No actions yet. Press “Add an action”.')}</p>`}</div><div class="pyp-actions">${btn('ap-add', X('إضافة إجراء', 'Add an action'))}${saved()}</div>`);
  }
  const btn = (act, label, attrs) => `<button type="button" class="pyp-btn" data-act="${act}"${attrs || ''}>${label}</button>`;

  /* ---------- calculations ---------- */
  function recalc(root) {
    if (!root.querySelector('.pyp-case')) return;
    const set = (name, text) => root.querySelectorAll('[data-calc="' + name + '"]').forEach((el) => { el.textContent = text; });
    const put = (key, arr) => arr.forEach((v, j) => set(key + '.m' + j, money(v)));
    // Reliable Tailors
    const f = {}; ['sales', 'credit', 'otherIn', 'mat', 'lab', 'oh', 'equip', 'otherOut'].forEach((k) => { f[k] = num3('cases.tailors.' + k); });
    const open = gv('cases.tailors.open', '');
    const active = ARR3((j) => Object.values(f).some((a) => a[j] !== null) || (j === 0 && calc.parse(open) !== null));
    let last = -1; active.forEach((a, j) => { if (a) last = j; });
    const rows = []; let prev = null;
    for (let j = 0; j <= last; j++) { const r = calc.cashMonth({ open, sales: f.sales[j], credit: f.credit[j], otherIn: f.otherIn[j], mat: f.mat[j], lab: f.lab[j], oh: f.oh[j], equip: f.equip[j], otherOut: f.otherOut[j] }, j === 0 ? null : prev); rows.push(r); prev = r.close; }
    M3.forEach((j) => { const r = rows[j]; set('tl.tin.m' + j, r ? money(r.cashIn) : ''); set('tl.tout.m' + j, r ? money(r.cashOut) : ''); set('tl.close.m' + j, r ? money(r.close) : ''); if (j > 0) set('tl.open.m' + j, r ? money(r.open) : ''); });
    const neg = rows.map((r, j) => ({ j, v: r.close })).filter((x) => x.v < 0);
    set('tl.sentence', !rows.length ? '' : neg.length ? '⚠ ' + X('نقص نقدي في: ', 'Cash shortage in: ') + neg.map((x) => T(MONTHS[x.j]) + ' (' + calc.fmt(x.v) + ')').join('، ') : X('لا يظهر نقص نقدي في الأشهر المُدخلة.', 'No cash shortage appears in the months entered.'));
    // Chimba
    const g = (p) => num3('cases.chimba.' + p);
    const cs = ARR3((j) => calc.times(g('chair.qty')[j], g('chair.price')[j])), ts = ARR3((j) => calc.times(g('table.qty')[j], g('table.price')[j]));
    const tot = (...a) => ARR3((j) => { const v = a.map((x) => x[j]).filter((x) => x !== null); return v.length ? calc.round2(v.reduce((s, x) => s + x, 0)) : null; });
    const sales = tot(cs, ts), mc = ARR3((j) => calc.times(g('chair.per')[j], g('chair.num')[j])), mt = ARR3((j) => calc.times(g('table.per')[j], g('table.num')[j])), mat = tot(mc, mt), lab = g('lab');
    const ohv = ['rent', 'elec', 'transport', 'wages', 'maint'].map((k) => calc.parse(gv('cases.chimba.oh.' + k, ''))).filter((x) => x !== null);
    const ohT = ohv.length ? calc.round2(ohv.reduce((s, x) => s + x, 0)) : null; set('cm.ohT', money(ohT));
    const ohm = ARR3((j) => (ohT !== null && (sales[j] !== null || mat[j] !== null || lab[j] !== null) ? ohT : null));
    const costT = tot(mat, lab, ohm);
    const gross = ARR3((j) => (sales[j] === null && mat[j] === null && lab[j] === null ? null : calc.gross(sales[j], mat[j], lab[j])));
    const net = ARR3((j) => (gross[j] === null && ohm[j] === null ? null : calc.net(gross[j], ohm[j])));
    put('cm.cs', cs); put('cm.ts', ts); put('cm.sales', sales); put('cm.lab', lab); put('cm.mc', mc); put('cm.mt', mt); put('cm.mat', mat);
    put('cm.cM', mat); put('cm.cL', lab); put('cm.cO', ohm); put('cm.cT', costT); put('cm.pS', sales); put('cm.pM', mat); put('cm.pL', lab); put('cm.pG', gross); put('cm.pO', ohm); put('cm.pN', net);
    set('cm.sentence', gross[0] === null && net[0] === null ? '' : X('في كانون الثاني: إجمالي الربح المتوقع ', 'In January: the likely Gross Profit is ') + money(gross[0]) + X('، وصافي الربح المتوقع ', ' and the likely Net Profit is ') + money(net[0]) + '. ' + X('(تمرين تعليمي، لا نتائج فعلية).', '(a training exercise, not actual results).'));
    updateProgress(root);
  }

  /* ---------- actions ---------- */
  function click(a, b, ctx, root) {
    const rerender = () => { store.flush(); ctx.rerender(true); };
    if (a === 'ap-add') { const l = apList().slice(); l.push({ id: 'ap' + Date.now().toString(36) + l.length, what: '', how: '', who: '', when: '', done: '' }); store.set('actionPlan', l); rerender(); const f = root.querySelector('[data-key="actionPlan.' + (l.length - 1) + '.what"]'); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); } return true; }
    if (a === 'ap-del') { if (!window.confirm(X('حذف هذا الإجراء؟', 'Remove this action?'))) return true; const l = apList().slice(); l.splice(Number(b.dataset.idx), 1); store.set('actionPlan', l); rerender(); const f = root.querySelector('[data-act="ap-add"]'); if (f) f.focus(); return true; }
    return false;
  }
  document.addEventListener('change', (e) => { const t = e.target; if (t && t.dataset && t.dataset.kind === 'apdone') { store.set('actionPlan.' + t.dataset.idx + '.done', t.checked ? '1' : ''); store.flush(); } });

  const anyStr = (o) => Object.values(o || {}).some((v) => (v && typeof v === 'object' ? anyStr(v) : String(v || '').trim()));
  L.register({
    ws: { 'c-tailors': wsTailors, 'c-chimba': wsChimba, 'c-action': wsAction },
    recalc, click, exExtra: { c1: { ansHtml: tailorsAnswer }, c2: { ansHtml: chimbaAnswer } },
    done: { c1: () => anyStr(gv('cases.tailors', {})), c2: () => anyStr(gv('cases.chimba', {})), c3: () => apList().some((a) => ['what', 'how', 'who', 'when'].some((k) => String((a && a[k]) || '').trim())) }
  });
})();
