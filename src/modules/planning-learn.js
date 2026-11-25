/* IYB Planning – learning views for Parts I and II (Phase 2): source content blocks, exercises, Activities 1–3,
   Assessments 1–2, summaries, progress and the three business-analysis workspaces (sales, costs, profit).
   Everything the learner types is saved under the isolated store; calculations come from planning-calc.js.
   Source-derived content is labelled with its printed page; application additions are labelled "Application guidance". */
(() => {
  'use strict';
  const D = window.SIYB_PYP_DATA, C = window.SIYB_PYP_CONTENT, AS = window.SIYB_PYP_ASSESS, calc = window.SIYBPlanningCalc, store = window.SIYBPlanningStore;
  const B = D.B;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gv = (path, def) => store.get(path, def);
  const MONTHS = [B('كانون الثاني', 'January'), B('شباط', 'February'), B('آذار', 'March'), B('نيسان', 'April'), B('أيار', 'May'), B('حزيران', 'June'), B('تموز', 'July'), B('آب', 'August'), B('أيلول', 'September'), B('تشرين الأول', 'October'), B('تشرين الثاني', 'November'), B('كانون الأول', 'December')];
  const revealed = {};
  const reg = { ws: {}, recalc: [], click: [], done: {}, exExtra: {} };
  const srcTag = (pg) => (pg ? `<span class="pyp-srcpg">${X('المصدر: الدليل، ص ', 'Source: manual, p. ')}<bdi>${esc(pg)}</bdi></span>` : '');
  const appTag = () => `<span class="pyp-apptag">${X('إرشاد التطبيق', 'Application guidance')}</span>`;

  /* ---------- progress ---------- */
  const hasText = (id) => Object.values(gv('activities.' + id, {}) || {}).some((v) => String(v || '').trim());
  const asDone = (aid) => { const s = gv('assessments.' + aid, {}) || {}; return !!(s.checked && s.complete); };
  function progressItems(part) {
    return (C[part] || []).filter((s) => s.activity || s.summary || s.assess).map((s) => ({
      id: s.id, kind: s.activity ? 'activity' : (s.summary ? 'summary' : 'assessment'),
      done: s.activity ? (hasText(s.activity.id) || (reg.done[s.activity.id] ? !!reg.done[s.activity.id]() : false) || (s.activity.id === 'a6' && riskList().some((r) => String((r && r.risk) || '').trim()))) : (s.summary ? !!gv('progress.' + part + '.summary', false) : asDone(s.assess)) }));
  }
  function progress(part) { const it = progressItems(part); const done = it.filter((i) => i.done).length; return { done, total: it.length, pct: it.length ? Math.round((done / it.length) * 100) : 0 }; }
  const progBar = (part, cls) => { const p = progress(part); return `<span class="pyp-prog ${cls || ''}" data-pyp-prog="${part}"><span class="pyp-prog-bar" aria-hidden="true"><i style="width:${p.pct}%"></i></span><span class="pyp-prog-txt"><bdi>${p.done}/${p.total}</bdi> ${X('عناصر مكتملة', 'items completed')}</span></span>`; };
  function updateProgress(root) { root.querySelectorAll('[data-pyp-prog]').forEach((el) => { el.outerHTML = progBar(el.dataset.pypProg, el.classList.contains('big') ? 'big' : ''); }); }

  /* ---------- content blocks ---------- */
  function table(b) {
    return `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${esc(b.cap ? T(b.cap) : X('جدول', 'Table'))}"><table class="pyp-table">${b.cap ? `<caption>${esc(T(b.cap))}</caption>` : ''}<thead><tr>${b.head.map((c) => `<th scope="col">${esc(T(c))}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(T(c))}</th>` : `<td dir="ltr">${esc(T(c))}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function block(b) {
    switch (b.t) {
      case 'h': return `<h4>${esc(T(b.x))}</h4>`;
      case 'p': return `<p>${esc(T(b.x))}</p>`;
      case 'ul': return `<ul>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul>`;
      case 'ol': return `<ol>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ol>`;
      case 'quote': { const w = T(b.who); return `<blockquote class="pyp-quote">${w ? `<strong>${esc(w)}:</strong> ` : ''}${esc(T(b.x))}</blockquote>`; }
      case 'note': return `<div class="pyp-important" role="note"><span aria-hidden="true">ⓘ</span> ${esc(T(b.x))}</div>`;
      case 'app': return `<div class="pyp-notice" role="note">${appTag()} ${esc(T(b.x))}</div>`;
      case 'formula': return `<div class="pyp-formula" role="note">${T(b.x).split(' | ').map(esc).join('<br>')}</div>`;
      case 'plan': return `<div class="pyp-plancard"><h4><bdi>${esc(b.n)}</bdi> ${esc(T(b.x))}</h4><p>${esc(T(b.d))}</p></div>`;
      case 'steps': return `<ol class="pyp-steps">${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ol>`;
      case 'table': return table(b);
      case 'sevenps': return `<div class="pyp-scroll"><table class="pyp-table pyp-7p"><thead><tr><th scope="col">${X('العنصر', 'Element')}</th><th scope="col">${X('أسئلة تطرحها على نفسك', 'Questions to ask yourself')}</th></tr></thead><tbody>${b.rows.map((r) => `<tr><th scope="row">${esc(T(r[0]))}</th><td><ul>${r[1].map((q) => `<li>${esc(T(q))}</li>`).join('')}</ul></td></tr>`).join('')}</tbody></table></div>`;
      case 'ex': return exercise(b.id, b.title, b.qs, b.ans, null);
      default: return '';
    }
  }
  const saved = () => `<span class="pyp-saved" aria-live="polite" data-saved></span>`;
  function taGroup(id, qs) {
    const v = gv('activities.' + id, {}) || {};
    return qs.map((q, i) => `<label class="pyp-q"><span>${esc(T(q))}</span><textarea class="pyp-ta" rows="3" data-kind="ta" data-key="activities.${id}.q${i}">${esc(v['q' + i] || '')}</textarea></label>`).join('');
  }
  function exercise(id, title, qs, ans, no, pg, extra) {
    extra = extra || {};
    const open = !!revealed[id];
    return `<section class="pyp-panel pyp-ex" id="pypEx-${id}" aria-labelledby="pypExH-${id}">
      <h4 id="pypExH-${id}">${srcTag(pg)} ${no ? `<span class="pyp-card-no">${X('نشاط ', 'Activity ')}<bdi>${no}</bdi></span> ` : ''}${esc(T(title))}</h4>
      ${extra.intro ? `<p>${esc(T(extra.intro))}</p>` : ''}${extra.facts ? `<ul class="pyp-facts">${extra.facts.map((f) => `<li>${esc(T(f))}</li>`).join('')}</ul>` : ''}
      ${taGroup(id, qs)}${qs.length ? saved() : ''}
      ${(ans || extra.hasAns) ? `<div class="pyp-actions"><button type="button" class="pyp-btn" data-act="reveal" data-id="${id}" aria-expanded="${open}">${open ? X('إخفاء إجابة الدليل', 'Hide the manual’s answer') : X('عرض الإجابة المقترحة في الدليل (جرّب أولاً)', 'Show the manual’s suggested answer (try first)')}</button></div>
      ${open ? `<div class="pyp-answer" role="note"><strong>${X('إجابة الدليل: ', 'Manual’s answer: ')}</strong>${Array.isArray(ans) ? `<ol>${ans.map((a) => `<li>${esc(T(a))}</li>`).join('')}</ol>` : (ans ? esc(T(ans)) : '')}${extra.ansHtml ? extra.ansHtml() : ''}</div>` : ''}` : ''}
    </section>`;
  }

  /* ---------- assessments ---------- */
  function optText(item, v, bank) { const list = bank || item.opts || []; const o = list.find((x) => x.v === v); return o ? T(o.t) : ''; }
  function assessHtml(aid) {
    const A = AS[aid]; const st = gv('assessments.' + aid, {}) || {}; const ans = st.answers || {}; const checked = !!st.checked; const sc = AS.score(A, ans);
    let n = 0;
    const parts = A.parts.map((pt) => `<div class="pyp-aspart"><h5>${esc(T(pt.title))}</h5><p class="pyp-small">${esc(T(pt.hint))}</p>
      ${pt.bank ? `<ul class="pyp-bank">${pt.bank.map((o) => `<li>${esc(T(o.t))}</li>`).join('')}</ul>` : ''}
      <ol class="pyp-items">${pt.items.map((it) => {
        n++; const val = ans[it.id] || ''; const res = checked ? sc.per[it.id] : '';
        const fb = checked ? (res === 'right' ? `<span class="pyp-fb ok">✔ ${X('صحيح', 'Correct')}</span>` : `<span class="pyp-fb bad">✘ ${res === 'blank' ? X('لم تُجِب', 'Not answered') : X('غير صحيح', 'Not correct')} — ${X('الإجابة الصحيحة: ', 'Correct answer: ')}<strong>${esc(optText(it, it.key, pt.bank))}</strong></span>`) : '';
        if (it.type === 'tick') {
          const ticked = val === 'T';
          const tfb = checked ? `<span class="pyp-fb ${res === 'right' ? 'ok' : 'bad'}">${res === 'right' ? '✔ ' + X('صحيح', 'Correct') : '✘ ' + X('غير صحيح', 'Not correct')} — <strong>${it.truth ? X('صحيحة: ', 'True: ') : X('خاطئة: ', 'False: ')}</strong>${esc(T(it.why))}</span>` : '';
          return `<li class="pyp-item ${res}"><label class="pyp-opt"><input type="checkbox" value="T" data-kind="tick" data-aid="${aid}" data-item="${it.id}"${ticked ? ' checked' : ''}> <span>${esc(T(it.q))}</span></label> ${tfb}</li>`;
        }
        if (it.type === 'word') {
          return `<li class="pyp-item ${res}"><label for="pyp-${aid}-${it.id}">${esc(T(it.q))}</label><select id="pyp-${aid}-${it.id}" class="pyp-sel" data-kind="ans" data-aid="${aid}" data-item="${it.id}"><option value="">—</option>${pt.bank.map((o) => `<option value="${o.v}"${val === o.v ? ' selected' : ''}>${esc(T(o.t))}</option>`).join('')}</select> ${fb}</li>`;
        }
        return `<li class="pyp-item ${res}"><fieldset><legend>${esc(T(it.q))}</legend>${it.opts.map((o) => `<label class="pyp-opt"><input type="radio" name="pyp-${aid}-${it.id}" value="${o.v}" data-kind="ans" data-aid="${aid}" data-item="${it.id}"${val === o.v ? ' checked' : ''}> <span>${esc(T(o.t))}</span></label>`).join('')}</fieldset> ${fb}</li>`;
      }).join('')}</ol></div>`).join('');
    const result = checked ? `<p class="pyp-result" role="status"><strong>${X('نتيجتك: ', 'Your score: ')}<bdi>${sc.correct}/${sc.total}</bdi></strong>${sc.answered < sc.total ? ' — ' + X('لم تُجب عن كل الأسئلة؛ أكمل الإجابات ثم تحقق مرة أخرى لإتمام التقييم.', 'Not every question was answered; complete your answers and check again to complete the assessment.') : ''}</p>` : '';
    return `<section class="pyp-panel pyp-assess" id="pypAs-${aid}" aria-labelledby="pypAsH-${aid}">
      <h3 id="pypAsH-${aid}">${X('التقييم ', 'Assessment ')}<bdi>${A.no}</bdi> ${srcTag(A.pg)}</h3>
      <p>${esc(T(A.intro))}</p>${parts}
      <div class="pyp-actions"><button type="button" class="pyp-btn primary" data-act="check" data-aid="${aid}">${X('تحقق من إجاباتي', 'Check my answers')}</button>
      <button type="button" class="pyp-btn" data-act="retry" data-aid="${aid}">${X('إعادة المحاولة', 'Try again')}</button></div>${result}
      <p class="pyp-small">${X('تظهر الإجابات الصحيحة (من الدليل، ص ' + A.ansPg + ') بعد أن تضغط «تحقق».', 'The correct answers (manual, p. ' + A.ansPg + ') appear only after you press “Check”.')}</p></section>`;
  }

  /* ---------- workspaces (Application guidance; historical analysis, not forecasts) ---------- */
  const inp = (path, label, extra) => `<input class="pyp-num" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-kind="num" data-key="${path}" value="${esc(gv(path, ''))}" aria-label="${esc(label)}"${extra || ''}>`;
  const txt = (path, label, ph) => `<input class="pyp-txt" type="text" data-kind="txt" data-key="${path}" value="${esc(gv(path, ''))}" aria-label="${esc(label)}"${ph ? ` placeholder="${esc(ph)}"` : ''}>`;
  const area = (path, label) => `<label class="pyp-q"><span>${esc(label)}</span><textarea class="pyp-ta" rows="3" data-kind="ta" data-key="${path}">${esc(gv(path, ''))}</textarea></label>`;
  const wsHead = (ws, title, intro) => `<section class="pyp-panel pyp-ws" aria-label="${esc(T(title))}"><h4>${esc(T(title))} ${appTag()}</h4><p class="pyp-small">${esc(T(intro))}</p>
    <label class="pyp-unitrow"><span>${X('العملة / الوحدة المستخدمة في أرقامك (اختياري)', 'Currency / unit used in your figures (optional)')}</span> ${txt('businessAnalysis.' + ws + '.unit', X('العملة', 'Currency'), X('مثال: $', 'e.g. $'))}</label>`;
  const stepHead = (n, ar, en) => `<h5>${X('الخطوة ', 'Step ')}<bdi>${n}</bdi>: ${X(ar, en)}</h5>`;
  const reasonNote = () => `<div class="pyp-important" role="note">${X('ارتفاع الرقم أو انخفاضه ليس جيداً أو سيئاً بالضرورة؛ ابحث دائماً عن السبب (الخطوة 3).', 'A rise or a fall is not automatically good or bad; always look for the reason (Step 3).')}</div>`;

  function wsSales() {
    const base = 'businessAnalysis.salesMarketing';
    const rows = MONTHS.map((m, i) => `<tr><th scope="row">${esc(T(m))}</th><td>${inp(base + '.ty.m' + i, T(m) + ' — ' + X('هذا العام', 'this year'))}</td><td>${inp(base + '.ly.m' + i, T(m) + ' — ' + X('العام الماضي', 'last year'))}</td><td dir="ltr" data-calc="s.d.m${i}"></td><td dir="ltr" data-calc="s.p.m${i}"></td></tr>`).join('');
    const ps = D.SEVENPS.map((p) => area(base + '.p.' + p.k, T(p.t))).join('');
    return wsHead('salesMarketing', B('مساحة عملي: تحليل مبيعات مشروعك', 'My workspace: analyse my business sales'), B('أدخل مبيعاتك الشهرية لهذا العام وللعام الماضي (من دفتر السجل الأساسي؛ ضع أفضل تقدير إن لم تتوفر البيانات). يحسب التطبيق الفروق والإجماليات فقط؛ التفسير عملك أنت.', 'Enter your monthly sales for this year and last year (from your Basic Record Book; make your best estimate if data is missing). The app only calculates differences and totals; the interpretation is yours.')) +
      stepHead(1, 'احصل على بيانات سابقة', 'Get past data') + `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('جدول المبيعات الشهرية', 'Monthly sales table')}"><table class="pyp-table pyp-input"><thead><tr><th scope="col">${X('الشهر', 'Month')}</th><th scope="col">${X('هذا العام', 'This year')} <span class="pyp-unit"></span></th><th scope="col">${X('العام الماضي', 'Last year')} <span class="pyp-unit"></span></th><th scope="col">${X('الفرق', 'Difference')}</th><th scope="col">${X('الفرق %', 'Difference %')}</th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><th scope="row">${X('الإجمالي', 'Total')}</th><td dir="ltr" data-calc="s.t.ty"></td><td dir="ltr" data-calc="s.t.ly"></td><td dir="ltr" data-calc="s.t.d"></td><td dir="ltr" data-calc="s.t.p"></td></tr></tfoot></table></div>
      <p class="pyp-small">${X('الفرق = هذا العام − العام الماضي. النسبة = الفرق ÷ العام الماضي.', 'Difference = this year − last year. Percent = difference ÷ last year.')}</p>` +
      stepHead(2, 'قارن سجلاتك', 'Compare your records') + `<p class="pyp-calcsentence" role="status" data-calc="s.sentence"></p>${reasonNote()}` +
      stepHead(3, 'ابحث عن الأسباب (الباءات السبع)', 'Find reasons (the seven Ps)') + `<p class="pyp-small">${X('اعتمد على أسئلة الباءات السبع أعلاه. دوّن ما وجدته لكل عنصر.', 'Use the seven-P questions above. Note what you found for each element.')}</p>${ps}${area(base + '.reasons', X('ملخص الأسباب التي وجدتها', 'Summary of the reasons I found'))}</section>`;
  }
  const COST_KEYS = [['qty', B('كمية الإنتاج', 'Production quantity')], ['mat', B('تكاليف المواد', 'Material Costs')], ['lab', B('تكاليف العمالة', 'Labour Costs')], ['oh', B('النفقات العامة', 'Overhead Expenses')]];
  function wsCosts() {
    const base = 'businessAnalysis.productionCosts';
    const head = COST_KEYS.map(([k, n]) => `<th scope="col" colspan="2">${esc(T(n))}</th>`).join('');
    const sub = COST_KEYS.map(() => `<th scope="col">${X('هذا العام', 'This year')}</th><th scope="col">${X('العام الماضي', 'Last year')}</th>`).join('');
    const rows = MONTHS.map((m, i) => `<tr><th scope="row">${esc(T(m))}</th>${COST_KEYS.map(([k, n]) => ['ty', 'ly'].map((y) => `<td>${inp(base + '.' + k + '_' + y + '.m' + i, T(m) + ' — ' + T(n) + ' — ' + (y === 'ty' ? X('هذا العام', 'this year') : X('العام الماضي', 'last year')))}</td>`).join('')).join('')}</tr>`).join('');
    const tot = COST_KEYS.map(([k]) => `<td dir="ltr" data-calc="c.t.${k}_ty"></td><td dir="ltr" data-calc="c.t.${k}_ly"></td>`).join('');
    const sumRows = [['mat', B('تكاليف المواد', 'Material Costs')], ['lab', B('تكاليف العمالة', 'Labour Costs')], ['oh', B('النفقات العامة', 'Overhead Expenses')], ['all', B('إجمالي التكاليف', 'Total costs')]].map(([k, n]) => `<tr><th scope="row">${esc(T(n))}</th><td dir="ltr" data-calc="c.s.${k}.ty"></td><td dir="ltr" data-calc="c.s.${k}.ly"></td><td dir="ltr" data-calc="c.s.${k}.d"></td><td dir="ltr" data-calc="c.s.${k}.p"></td><td dir="ltr" data-calc="c.s.${k}.pi_ty"></td><td dir="ltr" data-calc="c.s.${k}.pi_ly"></td></tr>`).join('');
    return wsHead('productionCosts', B('مساحة عملي: تحليل إنتاج مشروعك وتكاليفه', 'My workspace: analyse my production and costs'), B('أدخل بياناتك الشهرية لهذا العام وللعام الماضي. تُحسب التكلفة لكل وحدة بقسمة التكلفة على عدد الوحدات المنتجة، كما في الدليل.', 'Enter your monthly figures for this year and last year. Cost per item = cost ÷ number of items produced, as in the manual.')) +
      stepHead(1, 'احصل على بيانات سابقة', 'Get past data') + `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('جدول التكاليف والإنتاج الشهري', 'Monthly costs and production table')}"><table class="pyp-table pyp-input pyp-wide"><thead><tr><th rowspan="2" scope="col">${X('الشهر', 'Month')}</th>${head}</tr><tr>${sub}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">${X('الإجمالي', 'Total')}</th>${tot}</tr></tfoot></table></div>` +
      stepHead(2, 'قارن سجلاتك', 'Compare your records') + `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('مقارنة التكاليف', 'Cost comparison')}"><table class="pyp-table"><thead><tr><th scope="col">${X('البند', 'Item')}</th><th scope="col">${X('هذا العام', 'This year')}</th><th scope="col">${X('العام الماضي', 'Last year')}</th><th scope="col">${X('الفرق', 'Difference')}</th><th scope="col">${X('الفرق %', 'Difference %')}</th><th scope="col">${X('لكل وحدة هذا العام', 'Per item, this year')}</th><th scope="col">${X('لكل وحدة العام الماضي', 'Per item, last year')}</th></tr></thead><tbody>${sumRows}</tbody></table></div>
      <p class="pyp-small">${X('التكلفة لكل وحدة = إجمالي التكلفة ÷ كمية الإنتاج الإجمالية (تظهر عند إدخال كمية الإنتاج).', 'Cost per item = total cost ÷ total production quantity (shown once you enter production quantity).')}</p>${reasonNote()}` +
      stepHead(3, 'ابحث عن الأسباب', 'Find reasons') + `<p class="pyp-small">${X('استعن بالأسئلة في القسم 2.3 أعلاه.', 'Use the questions in section 2.3 above.')}</p>` +
      area(base + '.reasons_mat', X('أسباب تغيّر تكاليف المواد', 'Reasons for the change in Material Costs')) + area(base + '.reasons_lab', X('أسباب تغيّر تكاليف العمالة', 'Reasons for the change in Labour Costs')) + area(base + '.reasons_oh', X('أسباب تغيّر النفقات العامة', 'Reasons for the change in Overhead Expenses')) + area(base + '.reasons_qty', X('أسباب تغيّر كمية الإنتاج وجودتها', 'Reasons for the change in production quantity and quality')) + '</section>';
  }
  function wsProfit() {
    const base = 'businessAnalysis.profit';
    const cols = [0, 1, 2];
    const line = (k, n) => `<tr><th scope="row">${esc(T(n))}</th>${cols.map((c) => `<td>${inp(base + '.y' + c + '.' + k, T(n) + ' — ' + X('العمود ', 'column ') + (c + 1))}</td>`).join('')}</tr>`;
    return wsHead('profit', B('مساحة عملي: تحليل أرباح مشروعك', 'My workspace: analyse my business profit'), B('أدخل بيانات قوائم الأرباح والخسائر لثلاث سنوات (الأقدم أولاً). يحسب التطبيق إجمالي الربح وصافي الربح بتعريفي الدليل؛ الأرقام بين قوسين خسارة.', 'Enter your Profit and Loss Statement data for up to three years (oldest first). The app calculates Gross Profit and Net Profit using the manual’s definitions; figures in brackets are a loss.')) +
      stepHead(1, 'احصل على بيانات سابقة', 'Get past data') + `<div class="pyp-scroll" tabindex="0" role="region" aria-label="${X('جدول الأرباح', 'Profit table')}"><table class="pyp-table pyp-input"><thead><tr><th scope="col">${X('البند', 'Item')} <span class="pyp-unit"></span></th>${cols.map((c) => `<th scope="col">${txt(base + '.y' + c + '.label', X('تسمية السنة ', 'Year label ') + (c + 1), X('السنة', 'Year') + ' ' + (c + 1))}</th>`).join('')}</tr></thead><tbody>
      ${line('sales', B('المبيعات', 'Sales'))}${line('mat', B('تكاليف المواد', 'Material Costs'))}${line('lab', B('تكاليف العمالة', 'Labour Costs'))}</tbody><tfoot><tr><th scope="row">${X('إجمالي الربح', 'Gross Profit')}</th>${cols.map((c) => `<td dir="ltr" data-calc="p.gp.${c}"></td>`).join('')}</tr></tfoot></table>
      <table class="pyp-table pyp-input"><tbody>${line('oh', B('النفقات العامة', 'Overhead Expenses'))}</tbody><tfoot><tr><th scope="row">${X('صافي الربح', 'Net Profit')}</th>${cols.map((c) => `<td dir="ltr" data-calc="p.np.${c}"></td>`).join('')}</tr></tfoot></table></div>
      <div class="pyp-formula" role="note">${X('إجمالي الربح = المبيعات − تكاليف المواد − تكاليف العمالة', 'Gross Profit = Sales − Material Costs − Labour Costs')}<br>${X('صافي الربح = إجمالي الربح − النفقات العامة', 'Net Profit = Gross Profit − Overhead Expenses')}</div>` +
      stepHead(2, 'قارن سجلاتك', 'Compare your records') + `<p class="pyp-calcsentence" role="status" data-calc="p.sentence"></p>${reasonNote()}` +
      stepHead(3, 'ابحث عن الأسباب', 'Find reasons') + area(base + '.reasons_gp', X('لماذا تغيّر إجمالي الربح؟', 'Why did the Gross Profit change?')) + area(base + '.reasons_np', X('لماذا تغيّر صافي الربح؟', 'Why did the Net Profit change?')) + '</section>';
  }

  /* ---------- external-change forecasts workspace (FR-08; Application guidance; forecasts are assumptions, not facts) ---------- */
  const FC_CATS = {
    sales: [['customers', B('الزبائن: تغيّر الطلب أو السلوك الشرائي', 'Customers: change in demand or buying behaviour')], ['competitors', B('المنافسون', 'Competitors')], ['alternatives', B('المنتجات البديلة', 'Alternative products')], ['economy', B('الاقتصاد', 'Economy')], ['regulations', B('اللوائح والسياسات', 'Regulations and policies')], ['other', B('أخرى', 'Other')]],
    costs: [['supply', B('توريد المواد الخام والعمالة الماهرة', 'Supply of raw materials and skilled labour')], ['technology', B('التقنيات الجديدة', 'New technologies')], ['economy', B('الاقتصاد', 'Economy')], ['regulations', B('اللوائح والسياسات', 'Regulations and policies')], ['other', B('أخرى', 'Other')]]
  };
  const FC_AREAS = [['sales', B('المبيعات والتسويق', 'Sales and marketing')], ['costs', B('الإنتاج والتكاليف', 'Production and costs')]];
  const fcList = () => { const v = gv('externalForecasts', []); return Array.isArray(v) ? v : []; };
  function fcCard(f, i) {
    const k = (n) => 'externalForecasts.' + i + '.' + n;
    const cats = FC_CATS[f.area] || [];
    const ta = (n, ar, en) => `<label class="pyp-q"><span>${X(ar, en)}</span><textarea class="pyp-ta" rows="3" data-kind="ta" data-key="${k(n)}">${esc(f[n] || '')}</textarea></label>`;
    return `<div class="pyp-fc" id="pypFc-${i}" role="group" aria-label="${X('توقع ', 'Forecast ')}${i + 1}">
      <div class="pyp-fc-head"><strong><bdi>${i + 1}</bdi>. ${X('توقّع', 'Forecast')}</strong><span class="pyp-forecast-tag">${X('تقدير مستقبلي — ليس حقيقة', 'Estimate about the future — not a fact')}</span>
      <button type="button" class="pyp-btn" data-act="fc-del" data-idx="${i}">${X('حذف', 'Remove')}</button></div>
      <div class="pyp-fc-row"><label>${X('المجال المتأثر', 'Business area affected')}<select class="pyp-sel" data-kind="fsel" data-key="${k('area')}"><option value="">—</option>${FC_AREAS.map(([v, n]) => `<option value="${v}"${f.area === v ? ' selected' : ''}>${esc(T(n))}</option>`).join('')}</select></label>
      <label>${X('نوع التغيّر', 'Type of change')}<select class="pyp-sel" data-kind="fsel" data-key="${k('cat')}"${cats.length ? '' : ' disabled'}><option value="">—</option>${cats.map(([v, n]) => `<option value="${v}"${f.cat === v ? ' selected' : ''}>${esc(T(n))}</option>`).join('')}</select></label></div>
      ${ta('change', 'ما التغيّر الذي تتوقعه؟', 'What change do you expect?')}
      ${ta('evidence', 'ما الوقائع التي يستند إليها توقعك؟ (حقائق لا أمنيات)', 'What facts is this forecast based on? (facts, not wishes)')}
      ${ta('effect', 'ما أثره المتوقع في مبيعاتك أو تسويقك أو إنتاجك أو تكاليفك؟', 'What effect may it have on your sales, marketing, production or costs?')}
      ${ta('response', 'ما الذي يمكن أن يفعله مشروعك استجابةً لذلك؟', 'What could your business do about it?')}</div>`;
  }
  function wsForecast() {
    const list = fcList();
    return `<section class="pyp-panel pyp-ws pyp-fcws" id="pypFcWs" aria-label="${X('سجل التوقعات', 'Forecast register')}">
      <div class="pyp-important" role="note">${X('هذه توقعات واعتبارها افتراضات: ليست حقائق ولا نتائج مضمونة، وتُراجَع عندما تتوفر معلومات جديدة.', 'These are forecasts and should be treated as assumptions: they are not facts or guaranteed outcomes, and should be reviewed when new information is available.')}</div>
      <div id="pypFcList">${list.length ? list.map(fcCard).join('') : `<p class="pyp-small">${X('لا توجد توقعات مسجّلة بعد. اضغط «إضافة توقّع».', 'No forecasts recorded yet. Press “Add a forecast”.')}</p>`}</div>
      <div class="pyp-actions"><button type="button" class="pyp-btn primary" data-act="fc-add">${X('إضافة توقّع', 'Add a forecast')}</button>${saved()}</div>
      <p class="pyp-small">${X('توجد صلة بين هذه التوقعات والمخاطر في الجزء الرابع: ما قد يضرّ مشروعك سيُعالَج هناك.', 'These forecasts connect to the risks in Part IV: what could harm your business is handled there.')}</p></section>`;
  }

  /* ---------- risk register (Activity 6 form; FR-09; Application guidance for optional helper fields; NO scoring) ---------- */
  const R_ORIGIN = [['internal', B('داخلي', 'Internal')], ['external', B('خارجي', 'External')]];
  const R_STRAT = [['accept', B('قبول', 'Accept')], ['transfer', B('نقل', 'Transfer')], ['reduce', B('تقليل', 'Reduce')], ['avoid', B('تجنب', 'Avoid')]];
  const riskList = () => { const v = gv('risks', []); return Array.isArray(v) ? v : []; };
  function riskCard(r, i) {
    const k = (n) => 'risks.' + i + '.' + n;
    const tx = (n, ar, en) => `<label class="pyp-q"><span>${X(ar, en)}</span><input class="pyp-txt" type="text" data-kind="txt" data-key="${k(n)}" value="${esc(r[n] || '')}"></label>`;
    const sel = (n, ar, en, list) => `<label>${X(ar, en)}<select class="pyp-sel" data-kind="fsel" data-key="${k(n)}"><option value="">—</option>${list.map(([v, t]) => `<option value="${v}"${r[n] === v ? ' selected' : ''}>${esc(T(t))}</option>`).join('')}</select></label>`;
    return `<div class="pyp-fc pyp-risk" id="pypRisk-${i}" role="group" aria-label="${X('خطر ', 'Risk ')}${i + 1}">
      <div class="pyp-fc-head"><strong><bdi>${i + 1}</bdi>. ${X('خطر', 'Risk')}</strong>${r.fromForecast ? `<span class="pyp-forecast-tag">${X('من سجل توقعاتي', 'From my forecasts')}</span>` : ''}<button type="button" class="pyp-btn" data-act="risk-del" data-idx="${i}">${X('حذف', 'Remove')}</button></div>
      <label class="pyp-q"><span>${X('الخطر', 'Risk')}</span><textarea class="pyp-ta" rows="2" data-kind="ta" data-key="${k('risk')}">${esc(r.risk || '')}</textarea></label>
      <div class="pyp-fc-row">${tx('likelihood', 'الاحتمال (Likelihood)', 'Likelihood')}${tx('frequency', 'التكرار (Frequency)', 'Frequency')}${tx('impact', 'الأثر (Impact)', 'Impact')}${tx('priority', 'الأولوية (Priority)', 'Priority')}</div>
      <label class="pyp-q"><span>${X('الإجراءات (Actions)', 'Actions')}</span><textarea class="pyp-ta" rows="3" data-kind="ta" data-key="${k('actions')}">${esc(r.actions || '')}</textarea></label>
      <div class="pyp-fc-row pyp-optional"><span class="pyp-apptag">${X('اختياري — إرشاد التطبيق', 'Optional — application guidance')}</span>${sel('origin', 'مصدر الخطر (كما يعرّفه الدليل)', 'Where the risk arises (as the manual defines it)', R_ORIGIN)}${sel('strategy', 'طريقة الاستجابة (الطرق الأربع في الدليل)', 'Way of responding (the manual’s four ways)', R_STRAT)}</div></div>`;
  }
  function wsRisk() {
    const list = riskList(); const fcs = fcList();
    const linked = new Set(list.map((r) => r && r.fromForecast).filter(Boolean));
    const fcLabel = (f, i) => (T(((FC_AREAS.find((a) => a[0] === f.area) || [])[1])) || X('توقّع ', 'Forecast ') + (i + 1)) + ': ' + (String(f.change || '').trim().slice(0, 70) || X('(بلا وصف)', '(no description)'));
    const fcBox = fcs.length ? `<div class="pyp-fcbox"><h5>${X('من توقعاتي (الجزء الثالث)', 'From my forecasts (Part III)')}</h5><p class="pyp-small">${X('يطلب منك الدليل الرجوع إلى توقعاتك لتحديد المخاطر الخارجية. يمكنك تحويل توقع إلى خطر ثم إكمال حقوله، دون إدخال النص مرتين.', 'The manual asks you to refer to your forecasts to identify external risks. You can turn a forecast into a risk and complete its fields, without typing the text twice.')}</p>
      <ul class="pyp-fclist">${fcs.map((f, i) => `<li><span>${esc(fcLabel(f, i))}</span> <button type="button" class="pyp-btn" data-act="risk-from-fc" data-fid="${esc(f.id)}"${linked.has(f.id) ? ' disabled' : ''}>${linked.has(f.id) ? X('أُضيف', 'Added') : X('أضف كخطر', 'Add as a risk')}</button></li>`).join('')}</ul></div>` : '';
    return `<section class="pyp-panel pyp-ws pyp-riskws" id="pypRiskWs" aria-label="${X('سجل المخاطر', 'Risk register')}"><h4>${X('نموذج النشاط 6: سجل المخاطر', 'Activity 6 form: risk register')} ${appTag()}</h4>
      <p class="pyp-small">${X('أعمدة النموذج كما في الدليل: الخطر، الاحتمال، التكرار، الأثر، الأولوية، الإجراءات. اكتب تقييمك بكلماتك؛ لا يفرض التطبيق مقياساً أو صيغة أو تصنيفاً.', 'The form columns are those of the manual: Risk, Likelihood, Frequency, Impact, Priority, Actions. Write your assessment in your own words; the app imposes no scale, formula or classification.')}</p>
      <div class="pyp-important" role="note">${X('الدليل: «نعطي الأولوية للمخاطر الأكبر أثراً في مشروعنا.» وتذكّر أن الخطر قد يكون داخلياً (من تحليل مشروعك) أو خارجياً (من توقعاتك).', 'The manual: “We prioritize the risks that have the greatest impact on our business.” Remember a risk may be internal (from your Business Analysis) or external (from your forecasts).')}</div>
      ${fcBox}<div id="pypRiskList">${list.length ? list.map(riskCard).join('') : `<p class="pyp-small">${X('لا توجد مخاطر مسجّلة بعد. اضغط «إضافة خطر».', 'No risks recorded yet. Press “Add a risk”.')}</p>`}</div>
      <div class="pyp-actions"><button type="button" class="pyp-btn primary" data-act="risk-add">${X('إضافة خطر', 'Add a risk')}</button>${saved()}</div></section>`;
  }

  /* ---------- calculations → DOM ---------- */
  function recalc(root) { recalcCore(root); reg.recalc.forEach((f) => f(root)); }
  function recalcCore(root) {
    const set = (name, text) => { const el = root.querySelector('[data-calc="' + name + '"]'); if (el) el.textContent = text; };
    ['salesMarketing', 'productionCosts', 'profit'].forEach((ws) => { const u = String(gv('businessAnalysis.' + ws + '.unit', '') || ''); const wsEl = root.querySelector('[data-key="businessAnalysis.' + ws + '.unit"]'); if (wsEl) wsEl.closest('.pyp-ws').querySelectorAll('.pyp-unit').forEach((e) => { e.textContent = u ? '(' + u + ')' : ''; }); });
    const dp = (c) => (c ? [calc.fmt(c.diff, { minus: true }), c.pct === null ? '' : calc.fmt(c.pct, { minus: true, dec: 2 }) + '%'] : ['', '']);
    const sentence = (c, a, b) => (!c ? '' : (c.diff > 0 ? X('إجمالي ' + a + ' أعلى من ' + b + ' بمقدار ', 'Total ' + a + ' is higher than ' + b + ' by ') : c.diff < 0 ? X('إجمالي ' + a + ' أقل من ' + b + ' بمقدار ', 'Total ' + a + ' is lower than ' + b + ' by ') : X('إجمالي ' + a + ' يساوي ' + b, 'Total ' + a + ' equals ' + b)) + (c.diff !== 0 ? calc.fmt(Math.abs(c.diff)) + (c.pct === null ? '' : ' (' + calc.fmt(Math.abs(c.pct), { dec: 2 }) + '%)') + X('. ما السبب؟', '. What is the reason?') : ''));
    if (root.querySelector('[data-calc="s.t.ty"]')) {
      const b = 'businessAnalysis.salesMarketing'; const ty = [], ly = [];
      for (let i = 0; i < 12; i++) { const a = gv(b + '.ty.m' + i, ''), l = gv(b + '.ly.m' + i, ''); ty.push(a); ly.push(l); const [d, p] = dp(calc.change(a, l)); set('s.d.m' + i, d); set('s.p.m' + i, p); }
      const any = calc.filled(ty) || calc.filled(ly); const tt = calc.sum(ty), tl = calc.sum(ly);
      set('s.t.ty', any ? calc.fmt(tt) : ''); set('s.t.ly', any ? calc.fmt(tl) : '');
      const c = any ? calc.change(tt, tl) : null; const [d, p] = dp(c); set('s.t.d', d); set('s.t.p', p);
      set('s.sentence', sentence(c, X('مبيعات هذا العام', 'sales this year'), X('مبيعات العام الماضي', 'sales last year')));
    }
    if (root.querySelector('[data-calc="c.t.qty_ty"]')) {
      const b = 'businessAnalysis.productionCosts'; const T0 = {};
      COST_KEYS.forEach(([k]) => ['ty', 'ly'].forEach((y) => { const a = []; for (let i = 0; i < 12; i++) a.push(gv(b + '.' + k + '_' + y + '.m' + i, '')); T0[k + '_' + y] = { any: calc.filled(a), v: calc.sum(a) }; set('c.t.' + k + '_' + y, T0[k + '_' + y].any ? calc.fmt(T0[k + '_' + y].v) : ''); }));
      const rowOf = (k, ty, ly) => { const any = ty.any || ly.any; set('c.s.' + k + '.ty', any ? calc.fmt(ty.v) : ''); set('c.s.' + k + '.ly', any ? calc.fmt(ly.v) : ''); const [d, p] = dp(any ? calc.change(ty.v, ly.v) : null); set('c.s.' + k + '.d', d); set('c.s.' + k + '.p', p);
        const pt = calc.perItem(ty.v, T0.qty_ty.v), pl = calc.perItem(ly.v, T0.qty_ly.v); set('c.s.' + k + '.pi_ty', any && T0.qty_ty.any && pt !== null ? calc.fmt(pt, { dec: 2 }) : ''); set('c.s.' + k + '.pi_ly', any && T0.qty_ly.any && pl !== null ? calc.fmt(pl, { dec: 2 }) : ''); };
      ['mat', 'lab', 'oh'].forEach((k) => rowOf(k, T0[k + '_ty'], T0[k + '_ly']));
      const al = (y) => ({ any: ['mat', 'lab', 'oh'].some((k) => T0[k + '_' + y].any), v: ['mat', 'lab', 'oh'].reduce((t, k) => t + T0[k + '_' + y].v, 0) });
      rowOf('all', al('ty'), al('ly'));
    }
    if (root.querySelector('[data-calc="p.gp.0"]')) {
      const b = 'businessAnalysis.profit'; const nps = [];
      for (let c = 0; c < 3; c++) {
        const f = (k) => gv(b + '.y' + c + '.' + k, ''); const any = calc.filled([f('sales'), f('mat'), f('lab'), f('oh')]);
        const gp = calc.gross(f('sales'), f('mat'), f('lab')); const np = calc.net(gp, f('oh'));
        set('p.gp.' + c, any ? calc.fmt(gp) : ''); set('p.np.' + c, any ? calc.fmt(np) : ''); nps.push(any ? { gp, np, l: String(gv(b + '.y' + c + '.label', '') || X('العمود ', 'column ') + (c + 1)) } : null);
      }
      const used = nps.filter(Boolean); let s = '';
      if (used.length >= 2) { const a = used[used.length - 1], z = used[used.length - 2]; const cg = calc.change(a.gp, z.gp), cn = calc.change(a.np, z.np);
        s = X('إجمالي الربح ' + (cg.diff > 0 ? 'ارتفع' : cg.diff < 0 ? 'انخفض' : 'لم يتغير') + ' (' + calc.fmt(cg.diff, { minus: true }) + ') وصافي الربح ' + (cn.diff > 0 ? 'ارتفع' : cn.diff < 0 ? 'انخفض' : 'لم يتغير') + ' (' + calc.fmt(cn.diff, { minus: true }) + ') بين «' + z.l + '» و«' + a.l + '». ما الأسباب؟',
          'Gross Profit ' + (cg.diff > 0 ? 'rose' : cg.diff < 0 ? 'fell' : 'did not change') + ' (' + calc.fmt(cg.diff, { minus: true }) + ') and Net Profit ' + (cn.diff > 0 ? 'rose' : cn.diff < 0 ? 'fell' : 'did not change') + ' (' + calc.fmt(cn.diff, { minus: true }) + ') between “' + z.l + '” and “' + a.l + '”. What are the reasons?'); }
      if (used.some((u) => u.np < 0)) s += (s ? ' ' : '') + X('صافي الربح السالب (بين قوسين) يعني خسارة: إجمالي الربح لا يكفي لتغطية النفقات العامة.', 'A negative Net Profit (in brackets) means a loss: the Gross Profit is not enough to cover the Overhead Expenses.');
      set('p.sentence', s);
    }
  }

  /* ---------- part page ---------- */
  function section(part, s) {
    const head = `<h3 id="pypS-${part}-${s.id}">${esc(T(s.title || (s.activity && B('نشاط ' + s.activity.no, 'Activity ' + s.activity.no))))} ${srcTag(s.pg)}</h3>`;
    if (s.activity) return exFromSection(s) + (s.workspace ? ws(s.workspace) : '');
    if (s.assess) return assessHtml(s.assess);
    if (s.summary) { const done = !!gv('progress.' + part + '.summary', false); return `<section class="pyp-panel" id="pypSec-${part}-${s.id}" aria-labelledby="pypS-${part}-${s.id}">${head}${s.blocks.map(block).join('')}<div class="pyp-actions"><button type="button" class="pyp-btn ${done ? '' : 'primary'}" data-act="review" data-part="${part}" aria-pressed="${done}">${done ? '✔ ' + X('تمت مراجعة الملخص (اضغط للتراجع)', 'Summary reviewed (press to undo)') : X('أنهيت مراجعة الملخص', 'I have reviewed the summary')}</button></div></section>`; }
    return `<section class="pyp-panel" id="pypSec-${part}-${s.id}" aria-labelledby="pypS-${part}-${s.id}">${head}${s.blocks.map(block).join('')}</section>${s.workspace ? ws(s.workspace) : ''}`;
  }
  const ws = (k) => (reg.ws[k] ? reg.ws[k]() : k === 'sales' ? wsSales() : k === 'costs' ? wsCosts() : k === 'profit' ? wsProfit() : k === 'forecast' ? wsForecast() : k === 'risk' ? wsRisk() : '');
  function renderPart(part) {
    const secs = C[part]; const meta = D.SECTIONS.find((x) => x.id === part);
    const chips = secs.map((s) => `<button type="button" class="pyp-chip" data-act="jump" data-to="${s.activity ? 'pypEx-' + s.activity.id : s.assess ? 'pypAs-' + s.assess : 'pypSec-' + part + '-' + s.id}">${esc(T(s.title || (s.activity && B('نشاط ' + s.activity.no, 'Activity ' + s.activity.no))))}</button>`).join('');
    return `<section class="pyp-panel"><div class="pyp-panel-head"><span class="pyp-card-no">${meta.no}</span><h2>${X('الجزء ', 'Part ')}${meta.no}: ${esc(T(meta.title))}</h2></div>
      ${progBar(part, 'big')}<nav class="pyp-chips" aria-label="${X('محتويات الجزء', 'Part contents')}">${chips}</nav>
      <p class="pyp-small">${X('المحتوى مقتبس من الدليل ومكيَّف؛ الأقسام المعلَّمة «إرشاد التطبيق» من إضافة التطبيق.', 'Content is adapted from the manual; sections marked “Application guidance” are added by this app.')}</p></section>
      ${secs.map((s) => section(part, s)).join('')}`;
  }

  /* ---------- events ---------- */
  function bind(root, ctx) {
    root.addEventListener('input', (e) => {
      const t = e.target; if (!t.dataset || !t.dataset.key) return;
      store.set(t.dataset.key, t.value);
      if (t.dataset.kind === 'num' || t.dataset.kind === 'txt') recalc(root);
      if (t.dataset.kind === 'ta') updateProgress(root);
      const sv = t.closest('section') && t.closest('section').querySelector('[data-saved]'); if (sv) sv.textContent = X('✓ تم الحفظ تلقائياً', '✓ Saved automatically');
    });
    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.kind === 'fsel') {
        store.set(t.dataset.key, t.value);
        if (/\.area$/.test(t.dataset.key)) { const i = t.dataset.key.split('.')[1]; store.set('externalForecasts.' + i + '.cat', ''); store.flush(); ctx.rerender(true); const nf = root.querySelector('[data-key="' + t.dataset.key + '"]'); if (nf) nf.focus({ preventScroll: true }); }
        else store.flush();
        return;
      }
      if (t.dataset && (t.dataset.kind === 'ans' || t.dataset.kind === 'tick')) {
        const k = 'assessments.' + t.dataset.aid; const st = gv(k, {}) || {}; const answers = Object.assign({}, st.answers || {}); answers[t.dataset.item] = t.dataset.kind === 'tick' ? (t.checked ? 'T' : '') : t.value;
        const was = !!st.checked; store.set(k, { answers, checked: false, complete: false }); updateProgress(root);
        if (was) { const el = root.querySelector('#pypAs-' + t.dataset.aid); if (el) { el.outerHTML = assessHtml(t.dataset.aid); if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root); const nf = root.querySelector('#pypAs-' + t.dataset.aid + ' [data-item="' + t.dataset.item + '"]' + (t.type === 'radio' ? '[value="' + t.value + '"]' : '')); if (nf) nf.focus(); } }
      }
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return; const a = b.dataset.act;
      for (const h of reg.click) { if (h(a, b, ctx, root)) return; }
      const swap = (id, html) => { const el = root.querySelector('#' + id); if (el) { el.outerHTML = html; if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root); } };
      if (a === 'risk-add' || a === 'risk-from-fc') {
        const list = riskList().slice(); const base = { id: 'r' + Date.now().toString(36) + list.length, risk: '', likelihood: '', frequency: '', impact: '', priority: '', actions: '', origin: '', strategy: '', fromForecast: '' };
        if (a === 'risk-from-fc') { const f = fcList().find((x) => x.id === b.dataset.fid); if (!f || list.some((r) => r && r.fromForecast === f.id)) return; base.risk = String(f.change || ''); base.origin = 'external'; base.fromForecast = f.id; }
        list.push(base); store.set('risks', list); store.flush(); ctx.rerender(true);
        const f2 = root.querySelector('#pypRisk-' + (list.length - 1) + ' textarea'); if (f2) { f2.focus(); f2.scrollIntoView({ block: 'center' }); }
        return;
      }
      if (a === 'risk-del') {
        const i = Number(b.dataset.idx); const list = riskList().slice();
        if (!window.confirm(X('حذف هذا الخطر؟', 'Remove this risk?'))) return;
        list.splice(i, 1); store.set('risks', list); store.flush(); ctx.rerender(true);
        const f = root.querySelector('[data-act="risk-add"]'); if (f) f.focus();
        return;
      }
      if (a === 'fc-add') {
        const list = fcList().slice(); list.push({ id: 'f' + Date.now().toString(36) + list.length, area: '', cat: '', change: '', evidence: '', effect: '', response: '' });
        store.set('externalForecasts', list); store.flush(); ctx.rerender(true);
        const f = root.querySelector('#pypFc-' + (list.length - 1) + ' select'); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); }
        return;
      }
      if (a === 'fc-del') {
        const i = Number(b.dataset.idx); const list = fcList().slice();
        if (!window.confirm(X('حذف هذا التوقّع؟', 'Remove this forecast?'))) return;
        list.splice(i, 1); store.set('externalForecasts', list); store.flush(); ctx.rerender(true);
        const f = root.querySelector('[data-act="fc-add"]'); if (f) f.focus();
        return;
      }
      if (a === 'reveal') { revealed[b.dataset.id] = !revealed[b.dataset.id]; const sec = findEx(b.dataset.id); if (sec) swap('pypEx-' + b.dataset.id, sec); const nb = root.querySelector('#pypEx-' + b.dataset.id + ' [data-act="reveal"]'); if (nb) nb.focus(); }
      else if (a === 'check') { const aid = b.dataset.aid; const st = gv('assessments.' + aid, {}) || {}; const sc = AS.score(AS[aid], st.answers || {}); store.set('assessments.' + aid, { answers: st.answers || {}, checked: true, complete: sc.answered === sc.total, correct: sc.correct, total: sc.total, answered: sc.answered }); store.flush(); swap('pypAs-' + aid, assessHtml(aid)); updateProgress(root); const r = root.querySelector('#pypAs-' + aid + ' .pyp-result'); if (r) r.scrollIntoView({ block: 'nearest' }); }
      else if (a === 'retry') { const aid = b.dataset.aid; store.set('assessments.' + aid, { answers: {}, checked: false, complete: false }); store.flush(); swap('pypAs-' + aid, assessHtml(aid)); updateProgress(root); }
      else if (a === 'review') { const k = 'progress.' + b.dataset.part + '.summary'; store.set(k, !gv(k, false)); store.flush(); ctx.rerender(true); }
      else if (a === 'jump') { const el = root.querySelector('#' + b.dataset.to); if (el) { el.scrollIntoView({ block: 'start' }); const f = el.querySelector('textarea,select,input,button,h3,h4'); if (f) { if (!f.hasAttribute('tabindex') && /^H/.test(f.tagName)) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); } } }
    });
  }
  function exFromSection(s) { const a = s.activity; const ex = reg.exExtra[a.id] || {}; return exercise(a.id, a.title, a.qs, a.ans || null, a.no, s.pg, { intro: a.intro, facts: a.facts, hasAns: !!ex.ansHtml, ansHtml: ex.ansHtml }); }
  function findEx(id) { for (const part of ['p1', 'p2', 'p3', 'p4', 'p5']) for (const s of C[part] || []) { if (s.activity && s.activity.id === id) return exFromSection(s); for (const b of s.blocks || []) if (b.t === 'ex' && b.id === id) return exercise(b.id, b.title, b.qs, b.ans, null); } return ''; }

  window.SIYBPlanningLearn = { _h: { X, T, esc, gv, store, calc, B, MONTHS, appTag, saved, srcTag, inp, txt, area, revealed, riskList, fcList, updateProgress }, register: (o) => { Object.assign(reg.ws, o.ws || {}); if (o.recalc) reg.recalc.push(o.recalc); if (o.click) reg.click.push(o.click); Object.assign(reg.done, o.done || {}); Object.assign(reg.exExtra, o.exExtra || {}); }, renderPart, bind, recalc, progress, progBar, updateProgress, isLive: (id) => !!C[id], MONTHS };
})();
