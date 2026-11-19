/* Purchasing and Stock Management – workshop module (mode "stock").
   Renders sections into #workspaceContent. Content lives in purchasing-stock-data.js.
   State is kept in memory only (same as the other modules) so that exercises can be reset between groups. */
(() => {
  'use strict';
  const D = window.SIYB_PS_DATA;
  const $ = (id) => document.getElementById(id);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => { const n = window.SIYBParseNumber ? window.SIYBParseNumber(v) : Number(v); return Number.isFinite(n) ? n : 0; };
  const blank = (v) => v === '' || v === undefined || v === null;
  const near = (a, b) => Math.abs(a - b) < 0.005;
  const fmt = (n, d = 2) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fq = (n) => String(Number(Number(n).toFixed(3)));
  const sgn = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + fq(Math.abs(n));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let S = {};            // in-memory state
  let root = null;       // #psRoot
  let currentId = 'home';

  const sget = (path, def = '') => { let o = S; for (const k of path.split('.')) { if (o == null) return def; o = o[k]; } return o == null ? def : o; };
  const sset = (path, v) => { const ks = path.split('.'); let o = S; ks.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = v; };

  /* ---------- small HTML helpers ---------- */
  const card = (title, body, cls = '') => `<section class="ps-card ${cls}">${title ? `<h3>${title}</h3>` : ''}${body}</section>`;
  const ul = (arr) => `<ul class="ps-list">${arr.map((i) => `<li>${T(i)}</li>`).join('')}</ul>`;
  const btn = (act, label, cls = '', data = '') => `<button type="button" class="ps-btn ${cls}" data-act="${act}" ${data}>${label}</button>`;
  const head = (title, lead) => `<h2>${title}</h2>${lead ? `<p class="ps-lead">${lead}</p>` : ''}`;
  const nin = (k, extra = '') => `<input class="ps-in num" type="text" inputmode="decimal" autocomplete="off" data-siyb-numeric="true" data-k="${k}" value="${esc(sget(k))}" ${extra}>`;
  const tin = (k, cls = '', ph = '') => `<input class="ps-in ${cls}" type="text" data-k="${k}" value="${esc(sget(k))}" placeholder="${esc(ph)}">`;
  const area = (k, ph = '') => `<textarea class="ps-ta" data-k="${k}" placeholder="${esc(ph)}">${esc(sget(k))}</textarea>`;
  const sel = (k, opts, cls = '') => `<select class="ps-sel ${cls}" data-k="${k}"><option value="">${X('— اختر —', '— choose —')}</option>${opts.map((o) => `<option value="${esc(o.v)}" ${String(sget(k)) === String(o.v) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}</select>`;
  const out = (id, v = '—') => `<span class="ps-num" data-o="${id}">${v}</span>`;
  const tw = (inner) => `<div class="ps-tablewrap"><table class="ps-table">${inner}</table></div>`;
  const resetBar = (extra = '') => `<div class="ps-actions">${extra}${btn('reset', X('إعادة ضبط هذه الصفحة', 'Reset this page'))}${btn('print', X('حفظ PDF', 'Save PDF'))}</div>`;

  function mcq(id, list) {
    const st = sget('mcq.' + id, {});
    const done = !!st.checked;
    let score = 0;
    const qs = list.map((q, i) => {
      const s = st.a ? st.a[i] : undefined;
      const ok = done && s === q.a;
      if (ok) score++;
      return `<div class="ps-q ${done ? (ok ? 'ok' : 'bad') : ''}"><b>${i + 1}. ${T(q.q)}</b>${q.o.map((o, j) => `<label class="ps-opt"><input type="radio" name="${id}-${i}" data-k="mcq.${id}.a.${i}" value="${j}" ${s === j ? 'checked' : ''}><span>${T(o)}</span></label>`).join('')}${done && !ok ? `<div class="ps-note">${X('الإجابة الصحيحة: ', 'Correct answer: ')}<b>${T(q.o[q.a])}</b></div>` : ''}</div>`;
    }).join('');
    const result = done ? `<div class="ps-res ${score === list.length ? 'ok' : ''}">${X('نتيجتك: ', 'Your score: ')}<b>${fmt(score, 0)} / ${fmt(list.length, 0)}</b></div>` : '';
    return qs + `<div class="ps-actions">${btn('mcqcheck', X('تحقق من إجاباتي', 'Check my answers'), 'primary', `data-id="${id}"`)}${btn('mcqreset', X('إعادة الاختبار', 'Retake'), '', `data-id="${id}"`)}</div>${result}`;
  }

  /* ---------- stock card engine ---------- */
  const cardBalances = (rows) => { let bal = 0; return rows.map((r) => { bal = !blank(r.bf) ? num(r.bf) : bal + num(r.in) - num(r.out); return bal; }); };
  function cardFromPreset(p) { const c = clone(p); return c; }
  function cardTable(key, st, o = {}) {
    const ro = !!o.ro;
    const cell = (k, v, cls) => (ro ? `<span>${esc(T(v))}</span>` : `<input class="ps-in ${cls || ''}" type="text" data-k="${k}" value="${esc(T(v))}">`);
    const numc = (k, v) => (ro ? `<span class="ps-num">${blank(v) ? '' : esc(fq(num(v)))}</span>` : nin(k));
    const bals = cardBalances(st.rows);
    const rows = st.rows.map((r, i) => {
      const bf = !blank(r.bf);
      return `<tr data-row="${key}-${i}"><td>${cell(`${key}.rows.${i}.d`, r.d)}</td><td class="start">${cell(`${key}.rows.${i}.det`, r.det, 'wide')}</td>` +
        (bf ? `<td colspan="2">—</td><td>${ro ? `<span class="ps-num">${fq(num(r.bf))}</span>` : nin(`${key}.rows.${i}.bf`)}</td>`
            : `<td>${numc(`${key}.rows.${i}.in`, r.in)}</td><td>${numc(`${key}.rows.${i}.out`, r.out)}</td><td>${out(`${key}-bal-${i}`, fq(bals[i]))}</td>`) +
        (ro ? '' : `<td><button type="button" class="ps-btn small" data-act="delrow" data-key="${key}" data-i="${i}" aria-label="${X('حذف السطر', 'Delete row')}">×</button></td>`) + '</tr>';
    }).join('');
    return tw(`<thead><tr><th>${X('التاريخ', 'Date')}</th><th>${X('التفاصيل', 'Details')}</th><th>${X('الداخل', 'In')}</th><th>${X('الخارج', 'Out')}</th><th>${X('الرصيد', 'Balance')}</th>${ro ? '' : '<th></th>'}</tr></thead><tbody>${rows}</tbody>`);
  }
  function cardHeader(key, st, ro) {
    const f = (label, k, v, isNum) => `<div class="ps-field"><label>${label}</label>${ro ? `<b>${esc(T(v)) || '—'}</b>` : isNum ? nin(k) : `<input class="ps-in" type="text" data-k="${k}" value="${esc(T(v))}">`}</div>`;
    return `<div class="ps-fields">${f(X('المنتج / المادة', 'Product / material'), `${key}.product`, st.product, false)}${f(X('كلفة الوحدة (تدفعها للمزوّد)', 'Unit cost (paid to supplier)'), `${key}.cost`, st.cost, true)}${f(X('سعر البيع (إن وُجد)', 'Selling price (if any)'), `${key}.price`, st.price, true)}${f(X('مستوى تجديد الطلبية', 'Reorder level'), `${key}.reorder`, st.reorder, true)}</div>`;
  }
  function updateCard(key, st) {
    const bals = cardBalances(st.rows);
    const level = num(st.reorder);
    const useLevel = !blank(st.reorder) && level > 0;
    bals.forEach((b, i) => {
      const el = root.querySelector(`[data-o="${key}-bal-${i}"]`);
      if (el) el.textContent = fq(b);
      const tr = root.querySelector(`tr[data-row="${key}-${i}"]`);
      if (tr && el) tr.classList.toggle('flag', useLevel && b < level);
    });
    const last = bals.length ? bals[bals.length - 1] : 0;
    const tin_ = st.rows.reduce((a, r) => a + (blank(r.bf) ? num(r.in) : 0), 0);
    const tout = st.rows.reduce((a, r) => a + (blank(r.bf) ? num(r.out) : 0), 0);
    const set = (id, v) => { const e = root.querySelector(`[data-o="${id}"]`); if (e) e.textContent = v; };
    set(`${key}-last`, fq(last)); set(`${key}-tin`, fq(tin_)); set(`${key}-tout`, fq(tout));
    const w = root.querySelector(`[data-o="${key}-warn"]`);
    if (w) { w.textContent = useLevel ? (last < level ? X('الرصيد الحالي أدنى من مستوى تجديد الطلبية: تقدّم بطلب الشراء بأسرع وقت.', 'The current balance is below the reorder level: place a purchase order as soon as possible.') : X('الرصيد الحالي أعلى من مستوى تجديد الطلبية.', 'The current balance is above the reorder level.')) : ''; w.className = 'ps-res ' + (useLevel ? (last < level ? 'bad' : 'ok') : ''); w.hidden = !useLevel; }
  }
  const cardStats = (key) => `<div class="ps-meter"><div class="ps-stat"><small>${X('مجموع الداخل', 'Total in')}</small><strong data-o="${key}-tin">0</strong></div><div class="ps-stat"><small>${X('مجموع الخارج', 'Total out')}</small><strong data-o="${key}-tout">0</strong></div><div class="ps-stat"><small>${X('الرصيد الحالي', 'Current balance')}</small><strong data-o="${key}-last">0</strong></div></div><div class="ps-res" data-o="${key}-warn" hidden></div>`;

  /* ---------- sections ---------- */
  const GROUPS = {
    H: D.B('البداية', 'Start'),
    A: D.B('القسم الأول: الشراء بالطريقة الأفضل', 'Part I: Buy the best way'),
    B: D.B('القسم الثاني: تدبير المخزون بعد الشراء', 'Part II: Controlling your stock'),
    C: D.B('القسم الثالث: إدارة العلاقات مع المزوّدين', 'Part III: Managing supplier relationships'),
    P: D.B('التطبيق', 'Application')
  };
  const SECTIONS = [];
  const add = (s) => SECTIONS.push(s);

  /* Home */
  add({ id: 'home', grp: 'H', icon: '⌂', title: D.B('نظرة عامة', 'Overview'), render() {
    return head(X('المشتريات وتدبير المخزون', 'Purchasing and Stock Management'), X('أدوات تفاعلية لورش «حسّن مشروعك» مبنية على دليل المشتريات وتدبير المخزون: أنشطة وتمارين وحسابات تنفَّذ مع المتدربين.', 'Interactive tools for “Improve Your Business” workshops, based on the Purchasing and Stock Management manual: activities, exercises and calculations to run with participants.')) +
      `<div class="ps-hero"><button type="button" class="part" data-act="go" data-id="p-needs"><span class="k">1</span><b>${X('الشراء', 'Purchasing')}</b>${X('احتياجات المقاولة، أخطاء الشراء الشائعة، والخطوات الثماني: من تحديد الاحتياجات إلى دفع الفاتورة.', 'Business needs, common buying mistakes, and the eight steps from identifying needs to paying the invoice.')}</button>` +
      `<button type="button" class="part" data-act="go" data-id="s-what"><span class="k">2</span><b>${X('تدبير المخزون', 'Stock management')}</b>${X('أنواع المخزون، السجلات وبطاقة المخزون، مستوى تجديد الطلبية، الجرد الفعلي، والنظام الإلكتروني.', 'Types of stock, records and the stock card, reorder level, physical stocktaking and the electronic system.')}</button>` +
      `<button type="button" class="part" data-act="go" data-id="r-suppliers"><span class="k">3</span><b>${X('علاقات المزوّدين', 'Supplier relationships')}</b>${X('سجلات المزوّدين، مراجعة الأداء، معالجة النزاعات وفسخ العقود.', 'Supplier records, performance review, handling disputes and ending contracts.')}</button></div>` +
      card(X('كيف تستخدم هذه الوحدة في الورشة؟', 'How to use this module in the workshop'), ul([
        D.B('ميسّر: اعرض الصفحة واشرحها ثم دع المتدربين يجرّبون الأنشطة بأنفسهم.', 'Trainer: show a page and explain it, then let participants try the activities themselves.'),
        D.B('متدرب: أدخل أرقامك في الحقول؛ تُحسب الأرصدة والمجاميع تلقائياً، ثم اضغط «تحقق» حيث يوجد.', 'Participant: enter your numbers; balances and totals are calculated automatically, then press “Check” where available.'),
        D.B('زر «إعادة ضبط هذه الصفحة» يمسح الصفحة لتبدأ مجموعة أخرى. و«حفظ PDF» يحفظ الصفحة ملف PDF.', 'The “Reset this page” button clears the page for the next group. “Save PDF” saves the page as a PDF file.'),
        D.B('الأمثلة الرقمية (المبالغ بالدرهم المغربي) مأخوذة من دليل الشراء وتدبير المخزون ضمن سلسلة «حسّن مشروعك».', 'The worked examples (amounts in Moroccan dirhams) come from the Purchasing and Stock Management manual of the Improve Your Business series.')
      ]), 'accent') +
      card(X('مصطلحات مفيدة', 'Useful business words'), `<div class="ps-grid two">${D.glossary.map((g) => `<div class="ps-mini"><b>${T(g.t)}</b>${T(g.d)}</div>`).join('')}</div>`) +
      `<div class="ps-note">${X('هذه الأداة للتدريب وتيسير الورش وليست نظاماً لإدارة المستودعات أو برنامجاً محاسبياً.', 'This is a training and workshop tool, not a warehouse management system or accounting software.')}</div>`;
  } });

  /* A1: what do businesses buy */
  add({ id: 'p-needs', grp: 'A', icon: '①', title: D.B('ما المشتريات التي تقتنيها المقاولة؟', 'What does a business buy?'), render() {
    const clsOpts = D.categories.map((c) => ({ v: c.k, t: T(c.t) }));
    const done = !!sget('cls.checked');
    let score = 0;
    const rows = D.classify.map((c, i) => { const v = sget(`cls.a.${i}`); const ok = done && v === c.a; if (ok) score++; return `<tr class="${done ? (ok ? 'flag-ok' : 'flag') : ''}"><td class="start">${T(c.t)}</td><td>${sel(`cls.a.${i}`, clsOpts, done ? (ok ? 'ok' : 'bad') : '')}${done && !ok ? `<div class="ps-note">${X('الصحيح: ', 'Correct: ')}<b>${T(D.categories.find((x) => x.k === c.a).t)}</b></div>` : ''}</td></tr>`; }).join('');
    return head(X('ما هي المشتريات التي تقتنيها المقاولة؟', 'What does a business buy?'), X('تؤثر المشتريات على ما تبيعه المقاولة لزبنائها. ضمن أي فئة تندرج مشترياتك؟', 'What a business buys affects what it can sell to its customers. Which category do your purchases fall into?')) +
      card('', `<div class="ps-grid">${D.categories.map((c, i) => `<div class="ps-mini"><span class="ps-tag ${['', 'orange', 'green', ''][i]}">${i + 1}</span><b>${T(c.t)}</b>${T(c.d)}</div>`).join('')}</div>`) +
      card(X('نشاط: أدرج مشترياتك الحالية', 'Activity: list what your business buys'), `<div class="ps-grid two">${D.categories.map((c) => `<div class="ps-field"><label>${T(c.t)}</label>${area(`needs.${c.k}`)}</div>`).join('')}</div>`, 'warn') +
      card(X('تمرين: صنّف المشتريات', 'Exercise: classify the purchases'), tw(`<thead><tr><th class="start">${X('المشتريات', 'Purchase')}</th><th>${X('الفئة', 'Category')}</th></tr></thead><tbody>${rows}</tbody>`) +
        `<div class="ps-actions">${btn('clscheck', X('تحقق', 'Check'), 'primary')}</div>${done ? `<div class="ps-res ${score === D.classify.length ? 'ok' : ''}">${X('الإجابات الصحيحة: ', 'Correct answers: ')}<b>${fmt(score, 0)} / ${fmt(D.classify.length, 0)}</b></div>` : ''}`) +
      card(X('قبل شراء التجهيزات: أسئلة يجب الإجابة عنها', 'Before buying equipment: questions to answer'), `<p>${X('مثال: مصنّع معادن حصل على طلبات كثيرة ويحتاج إلى آلة طحن جديدة. قد لا تحتاج إلى شراء تجهيزات جديدة؛ حدّد هل تستطيع مواصلة استخدام ما تملك مع استعارة أو استئجار تجهيزات إضافية عند الحاجة، أو دفع المال إلى مقاولة أخرى تملك التجهيزات.', 'Example: a metalworker has many new orders and needs a new grinding machine. You may not need to buy new equipment; check whether you can keep using what you have and borrow or rent extra equipment when needed, or pay another business that owns the equipment to do the work.')}</p>${ul(D.equipmentQuestions)}`) +
      card(X('الخدمات والمناولة', 'Services and subcontracting'), `<p>${X('في كثير من الحالات يكون شراء الخدمات من مزوّدين ذائعي الصيت أقل كلفة من القيام بها بنفسك. وتفكّر في مناولة بعض مهام الإنتاج إذا لم يملك عمالك المهارات اللازمة أو كان العمل موسمياً. قبل الاختيار ابحث هل يملك المرشحون المهارات والخبرات، واسأل من تعاملوا معهم عن سمعتهم.', 'Buying services from reputable providers is often cheaper than doing the work yourself. Consider subcontracting some production tasks if your workers lack the skills or the work is seasonal. Before choosing, check that candidates have the skills and experience, and ask people who worked with them about their reputation.')}</p>`) +
      resetBar();
  } });

  /* A2: good purchasing + mistakes */
  add({ id: 'p-good', grp: 'A', icon: '②', title: D.B('أخطاء شائعة وعملية الشراء الجيدة', 'Common mistakes and good purchasing'), render() {
    const cases = D.cases.map((c, ci) => { const shown = !!sget(`case.${ci}`); return `<div class="ps-card warn"><h3>${T(c.n)}</h3><p>${T(c.s)}</p>${c.q.map((q, qi) => `<p><b>${qi + 1}. ${T(q.q)}</b></p>${area(`caseNote.${ci}.${qi}`, X('اكتب إجابتك هنا…', 'Write your answer here…'))}${shown ? `<div class="ps-answer"><b>${X('الإجابة النموذجية: ', 'Model answer: ')}</b>${T(q.a)}</div>` : ''}`).join('')}<div class="ps-actions">${btn('toggle', shown ? X('إخفاء الإجابات النموذجية', 'Hide model answers') : X('عرض الإجابات النموذجية', 'Show model answers'), '', `data-k="case.${ci}"`)}</div></div>`; }).join('');
    return head(X('أخطاء شائعة خلال الشراء وما معنى «عملية شراء جيدة»؟', 'Common mistakes when buying, and what “good purchasing” means'), X('اقرأ كل حالة وأجب عن الأسئلة قبل عرض الإجابة النموذجية.', 'Read each case and answer the questions before showing the model answer.')) +
      cases +
      card(X('عملية الشراء الجيدة تشمل', 'Good purchasing means buying'), `<div class="ps-grid">${D.fourRights.map((r, i) => `<div class="ps-mini"><span class="ps-tag ${['', 'orange', 'green', ''][i]}">${i + 1}</span><b>${T(r.t)}</b>${T(r.d)}</div>`).join('')}</div><p style="margin-top:10px">${X('نظّم عملية الشراء: على المسؤولين عن الشراء أن يتأكدوا باستمرار مما يريده الزبناء وأن يطّلعوا على المنتجات الجديدة في السوق. ويوصى بتعيين شخص تناط به القرارات النهائية للشراء.', 'Organise purchasing: the people in charge should keep checking what customers want and know about new products on the market. It is recommended to appoint one person to take the final buying decisions.')}</p>`, 'accent') +
      resetBar();
  } });

  /* A3: eight steps */
  add({ id: 'p-steps', grp: 'A', icon: '③', title: D.B('الخطوات الثماني للشراء', 'The eight purchasing steps'), render() {
    const open = sget('step.open', 0);
    const steps = D.steps.map((s, i) => `<div class="ps-step ${open === i + 1 ? 'open' : ''}"><button type="button" data-act="step" data-i="${i + 1}"><span class="n">${i + 1}</span><span>${T(s.t)}</span></button><div class="body">${s.p.map((p) => `<p>${T(p)}</p>`).join('')}${s.doc ? `<span class="ps-doc">${X('وثيقة العمل: ', 'Work document: ')}${T(s.doc)}</span>` : ''}</div></div>`).join('');
    const docs = D.steps.map((s, i) => `<tr><td>${i + 1}</td><td class="start">${T(s.t)}</td><td class="start">${s.doc ? T(s.doc) : '—'}</td></tr>`).join('');
    return head(X('الخطوات الواجب اتباعها في عملية الشراء', 'The steps to follow in the purchasing process'), X('تتطلب الفعالية في الشراء مساراً منهجياً بخطوات محددة (قواعد وإجراءات الشراء). توجد ثماني خطوات تحدّ من الغش وتضمن أفضل الأسعار والشروط.', 'An effective purchasing process follows a systematic path with defined steps (purchasing rules and procedures). The eight steps reduce fraud and help your business get the best prices and terms.')) +
      `<div class="ps-steps">${steps}</div>` +
      card(X('وثائق العمل المستخدمة في الشراء', 'Work documents used in purchasing'), tw(`<thead><tr><th>#</th><th class="start">${X('خطوة الشراء', 'Purchasing step')}</th><th class="start">${X('وثيقة العمل', 'Work document')}</th></tr></thead><tbody>${docs}</tbody>`)) +
      `<div class="ps-actions">${btn('go', X('التطبيق: مقارنة عروض الأسعار ←', 'Practice: compare quotations →'), 'primary', 'data-id="p-quotes"')}</div>` + resetBar();
  } });

  /* A4: quotations */
  const quoteTotals = () => {
    const sub = (p) => D.quoteItems.reduce((a, i) => a + i.q * i[p], 0);
    const a = sub('pa'), b = sub('pb');
    return { a: { sub: a, vat: a * D.vat, tot: a * (1 + D.vat) }, b: { sub: b, vat: b * D.vat, tot: b * (1 + D.vat) } };
  };
  add({ id: 'p-quotes', grp: 'A', icon: '④', title: D.B('طلب الأسعار والمقارنة والتفاوض', 'Requesting, comparing and negotiating quotations'), render() {
    const qt = quoteTotals();
    const qrows = D.quoteItems.map((i) => `<tr><td class="start">${T(i.d)}</td><td>${nin(`inq.qty.${i.code}`, `data-def="${i.q}"`)}</td></tr>`).join('');
    const cmp = D.quoteItems.map((i) => `<tr><td class="start">${T(i.d)}</td><td>${fq(i.q)}</td><td>${fmt(i.pa)}</td><td>${fmt(i.q * i.pa)}</td><td>${fmt(i.pb)}</td><td>${fmt(i.q * i.pb)}</td></tr>`).join('');
    const done = !!sget('cmp.checked');
    const mk = (who, tot) => ['sub', 'vat', 'tot'].map((f) => { const v = sget(`cmp.${who}.${f}`); const ok = done && !blank(v) && near(num(v), tot[f]); return `<td>${nin(`cmp.${who}.${f}`, '')}${done ? `<div class="ps-note ${ok ? '' : ''}">${ok ? '✓' : X('الصحيح: ', 'Correct: ') + fmt(tot[f])}</div>` : ''}</td>`; }).join('');
    const sa = D.quoteSuppliers.a, sb = D.quoteSuppliers.b;
    const supOpts = [{ v: 'a', t: T(sa.name) }, { v: 'b', t: T(sb.name) }];
    const qs = [
      { k: 'q1', q: X('أي مزوّد يقدّم الأسعار الأدنى؟', 'Which supplier offers the lowest prices?'), a: 'a' },
      { k: 'q2', q: X('أي مزوّد يقدّم أفضل شروط للاستدانة؟', 'Which supplier offers the best credit terms?'), a: 'b' },
      { k: 'q3', q: X('أي مزوّد يقدّم أفضل شروط للتسليم؟', 'Which supplier offers the best delivery terms?'), a: 'a' },
      { k: 'q4', q: X('أي مزوّد ستختاره نادية برأيك؟ ولماذا؟', 'Which supplier would Nadia choose, in your opinion? Why?'), a: 'a' }
    ].map((q) => { const v = sget(`cmp.${q.k}`); const ok = done && v === q.a; return `<div class="ps-q ${done ? (ok ? 'ok' : 'bad') : ''}"><b>${q.q}</b>${sel(`cmp.${q.k}`, supOpts, done ? (ok ? 'ok' : 'bad') : '')}${done && !ok ? `<div class="ps-note">${X('الإجابة: ', 'Answer: ')}<b>${T(q.a === 'a' ? sa.name : sb.name)}</b></div>` : ''}</div>`; }).join('');
    return head(X('الخطوتان 4 و5: عروض الأسعار والتفاوض', 'Steps 4 and 5: quotations and negotiation'), X('مثال من الدليل: نادية تدير صالون العناية بالشعر والأظافر في مراكش وتحتاج إلى منتجات من مزوّدين مختلفين.', 'Example from the manual: Nadia runs a hair and nail salon in Marrakech and needs products from different suppliers.')) +
      card(X('أ) إعداد طلب عرض أسعار', 'A) Prepare a request for a quotation'), `<div class="ps-fields"><div class="ps-field"><label>${X('إلى (المزوّد)', 'To (supplier)')}</label>${tin('inq.to')}</div><div class="ps-field"><label>${X('من (اسم مقاولتك)', 'From (your business)')}</label>${tin('inq.from')}</div><div class="ps-field"><label>${X('الاسم / الهاتف', 'Name / phone')}</label>${tin('inq.contact')}</div></div>` +
        tw(`<thead><tr><th class="start">${X('الوصف', 'Description')}</th><th>${X('الكمية المطلوبة', 'Quantity')}</th></tr></thead><tbody>${qrows}</tbody>`) +
        `<div class="ps-docpaper" data-o="inq-preview"></div><div class="ps-actions">${btn('copyinq', X('نسخ نص الطلب', 'Copy the request text'), 'primary')}</div>` +
        `<p class="ps-note">${X('يجب أن يطلب الاستفسار: أنواع السلع وكمياتها الدنيا، الأسعار وشروط الدفع، وشروط التسليم. الأفضل الحصول على الرد مكتوباً.', 'Your inquiry should ask for: the goods and minimum quantities, prices and payment terms, and delivery terms. It is best to get the answer in writing.')}</p>`) +
      card(X('ب) قارن عرضي الأسعار', 'B) Compare the two quotations'), `<div class="ps-grid two"><div class="ps-mini"><b>A – ${T(sa.name)}</b>${ul([sa.prices, sa.credit, sa.delivery])}</div><div class="ps-mini"><b>B – ${T(sb.name)}</b>${ul([sb.prices, sb.credit, sb.delivery])}</div></div>` +
        tw(`<thead><tr><th class="start" rowspan="2">${X('الوصف', 'Description')}</th><th rowspan="2">${X('الكمية', 'Qty')}</th><th colspan="2">A</th><th colspan="2">B</th></tr><tr><th>${X('سعر الوحدة', 'Unit price')}</th><th>${X('الإجمالي', 'Total')}</th><th>${X('سعر الوحدة', 'Unit price')}</th><th>${X('الإجمالي', 'Total')}</th></tr></thead><tbody>${cmp}</tbody>`) +
        `<p><b>${X('احسب لكل عرض: المجموع دون رسوم، والضريبة على القيمة المضافة 20%، والمجموع مع الرسوم (درهم).', 'For each quotation calculate: total without tax, VAT at 20%, and total including tax (MAD).')}</b></p>` +
        tw(`<thead><tr><th></th><th>${X('المجموع دون رسوم', 'Total excl. tax')}</th><th>${X('الضريبة 20%', 'VAT 20%')}</th><th>${X('المجموع مع الرسوم', 'Total incl. tax')}</th></tr></thead><tbody><tr><td class="start"><b>A</b></td>${mk('a', qt.a)}</tr><tr><td class="start"><b>B</b></td>${mk('b', qt.b)}</tr></tbody>`) +
        qs + `<div class="ps-actions">${btn('cmpcheck', X('تحقق من إجاباتي', 'Check my answers'), 'primary')}</div>` +
        (done ? `<div class="ps-answer">${X('قرّرت نادية الشراء من الشركة المصنّعة لأن التسليم المجاني والسريع هو الأهم لمقاولتها؛ فأسعارها هي الأدنى (', 'Nadia decided to buy from the manufacturer because free, fast delivery matters most to her business; its price is the lowest (')}<b>${fmt(qt.a.tot)}</b> ${X('مقابل', 'versus')} <b>${fmt(qt.b.tot)}</b>${X(' درهم)، رغم عدم إتاحتها الاستدانة.', ' MAD), although it offers no credit.')}</div>` : '')) +
      card(X('ج) نقاط للتفاوض', 'C) Points to negotiate'), ul([
        D.B('الحصول على السلع بأفضل سعر ممكن مع احترام مواعيد الاستلام وشروط التأمين والدفع والجودة.', 'The best possible price, while respecting delivery dates and insurance, payment and quality terms.'),
        D.B('إمكانية إعادة السلع غير المباعة خلال مدة محددة (خصوصاً السلع القابلة للفساد).', 'The possibility of returning unsold goods within a set period (especially perishable goods).'),
        D.B('شروط الاستدانة وآجال الدفع والتخفيض على الكميات الكبيرة أو الدفع السريع.', 'Credit terms, payment periods, and discounts for large quantities or quick payment.'),
        D.B('إن حسّنت الأسعار أو الشروط عبر التفاوض فاطلب تأكيدها كتابةً.', 'If negotiation improves prices or terms, ask for the new terms in writing.')
      ]), 'accent') + resetBar();
  }, afterRender() {
    D.quoteItems.forEach((i) => { if (blank(sget(`inq.qty.${i.code}`))) sset(`inq.qty.${i.code}`, i.q); const e = root.querySelector(`[data-k="inq.qty.${i.code}"]`); if (e) e.value = String(sget(`inq.qty.${i.code}`)); });
  }, update() {
    const q = D.quoteItems.map((i) => ({ ...i, qty: blank(sget(`inq.qty.${i.code}`)) ? i.q : num(sget(`inq.qty.${i.code}`)) }));
    const lines = q.map((i) => `• ${T(i.d)} — ${X('الكمية', 'Qty')}: ${fq(i.qty)}`).join('<br>');
    const el = root.querySelector('[data-o="inq-preview"]');
    if (el) el.innerHTML = `<div class="hd"><span>${X('طلب عبر البريد الإلكتروني', 'E-mail request')}</span><span>${esc(sget('inq.to')) || '…'}</span></div><p><b>${X('الموضوع: طلب عرض أسعار', 'Subject: Request for a price quotation')}</b></p><p>${X('السيد/السيدة الكريم/ة،', 'Dear Sir/Madam,')}<br>${X('لقد اطلعنا على منتجاتكم ونرغب في الحصول على عرض أسعار للمنتجات التالية:', 'We have seen your products and would like a quotation for the following:')}</p><p>${lines}</p><p>${X('يرجى تحديد الأسعار وشروط التسليم والدفع.', 'Please state prices, delivery terms and payment terms.')}<br>${X('مع فائق الاحترام،', 'Kind regards,')}<br>${esc(sget('inq.from'))}<br>${esc(sget('inq.contact'))}</p>`;
  } });

  /* A5: order, receive, invoice */
  add({ id: 'p-order', grp: 'A', icon: '⑤', title: D.B('الطلبية والاستلام والفاتورة', 'Order, receiving and invoice'), render() {
    const lines = D.quoteItems.map((i) => `<tr><td class="start">${T(i.d)}</td><td>${nin(`po.q.${i.code}`)}</td><td>${nin(`po.p.${i.code}`)}</td><td>${out(`po-t-${i.code}`)}</td></tr>`).join('');
    const checks = [D.B('هذه هي السلع التي طلبتها', 'These are the goods I ordered'), D.B('هذه هي الكمية التي طلبتها', 'This is the quantity I ordered'), D.B('السلع في حالة جيدة', 'The goods are in good condition'), D.B('وصلت الشحنة في الوقت المحدد', 'The delivery arrived on time')];
    const chk = checks.map((c, i) => `<label class="ps-check"><input type="checkbox" data-k="recv.${i}" ${sget(`recv.${i}`) === true ? 'checked' : ''}><span>${T(c)}</span></label>`).join('');
    const ret = sget('inv.ret', D.returned.defaultQty);
    const done = !!sget('inv.checked');
    const exp = invExpected();
    const f = (k, label, exv) => { const v = sget(`inv.${k}`); const ok = done && !blank(v) && near(num(v), exv); return `<div class="ps-field"><label>${label}</label>${nin(`inv.${k}`)}${done ? `<div class="ps-note">${ok ? '✓' : X('الصحيح: ', 'Correct: ') + fmt(exv)}</div>` : ''}</div>`; };
    const pay = [D.B('قارنت الفاتورة بطلب الشراء وسند التسليم', 'I compared the invoice with the purchase order and delivery note'), D.B('تحققت من صحة الأسعار والمجموع', 'I checked that prices and totals are correct'), D.B('اتصلت بالمزوّد فور اكتشاف أي خطأ', 'I contacted the supplier as soon as I found any error'), D.B('حصلت على إيصال بعد الدفع', 'I got a receipt after paying'), D.B('استرددت ثمن أي سلع أعدتها', 'I got back the money for any goods I returned')]
      .map((c, i) => `<label class="ps-check"><input type="checkbox" data-k="pay.${i}" ${sget(`pay.${i}`) === true ? 'checked' : ''}><span>${T(c)}</span></label>`).join('');
    return head(X('الخطوات 6 و7 و8: الطلبية والاستلام والفاتورة', 'Steps 6, 7 and 8: order, receiving and invoice'), X('من الأفضل دائماً طلب مكتوب فهو دليل على تقدمك بالطلب.', 'A written order is always better: it is proof that you placed the order.')) +
      card(X('الخطوة 6: سند طلبية (طلب شراء)', 'Step 6: Purchase order'), `<div class="ps-fields"><div class="ps-field"><label>${X('رقم الطلبية', 'Order number')}</label>${tin('po.no')}</div><div class="ps-field"><label>${X('التاريخ', 'Date')}</label>${tin('po.date')}</div><div class="ps-field"><label>${X('إلى (المزوّد)', 'To (supplier)')}</label>${tin('po.sup')}</div><div class="ps-field"><label>${X('بناءً على عرض الأسعار رقم', 'Based on quotation no.')}</label>${tin('po.ref')}</div></div>` +
        tw(`<thead><tr><th class="start">${X('الوصف', 'Description')}</th><th>${X('الكمية', 'Quantity')}</th><th>${X('سعر الوحدة (درهم)', 'Unit price (MAD)')}</th><th>${X('السعر الإجمالي (درهم)', 'Total price (MAD)')}</th></tr></thead><tbody>${lines}</tbody><tfoot><tr><td colspan="3" class="start">${X('المجموع دون رسوم', 'Total excl. tax')}</td><td>${out('po-sub')}</td></tr><tr><td colspan="3" class="start">${X('الضريبة على القيمة المضافة 20%', 'VAT 20%')}</td><td>${out('po-vat')}</td></tr><tr><td colspan="3" class="start">${X('المجموع مع الرسوم', 'Total incl. tax')}</td><td>${out('po-tot')}</td></tr></tfoot>`) +
        `<p class="ps-note">${X('الأسعار والكميات معبأة مسبقاً من عرض الشركة المصنّعة (A) ويمكن تعديلها. يُرجى إرفاق السلع بفاتورة أو سند تسليم يحمل رقم الطلبية.', 'Prices and quantities are pre-filled from the manufacturer’s quotation (A) and can be edited. Ask for the goods to come with an invoice or delivery note showing the order number.')}</p>`, 'accent') +
      card(X('الخطوة 7: استلم السلع وتحقق منها على الفور', 'Step 7: Receive and check the goods immediately'), `<p>${X('قارن البضاعة بسند التسليم/الفاتورة وتأكد من:', 'Compare the goods with the delivery note/invoice and check that:')}</p>${chk}<div class="ps-res" data-o="recv-res"></div><p class="ps-note">${X('عند حصول أي مشكلة أشعِر المزوّد فوراً وسجّل ذلك على سند التسليم، ولا توقّعه إلى حين حلّ المشكلة.', 'If there is any problem, tell the supplier immediately, note it on the delivery note, and do not sign it until the problem is solved.')}</p>`) +
      card(X('الخطوة 8: تأكد من الفاتورة وادفع قيمتها', 'Step 8: Check the invoice and pay for it'), `<p>${X('الحالة: عند التسليم تبيّن أن علب الجيل الوردي (500 غ) غير صالحة، فأعادتها نادية إلى المزوّد. لكن الفاتورة وصلت بقيمة السلع كاملة (22,100 درهم قبل الضريبة).', 'Case: on delivery, some jars of pink gel (500 g) were defective, so Nadia returned them to the supplier. But the invoice arrived charging for the full order (22,100 MAD before tax).')}</p>` +
        `<div class="ps-fields"><div class="ps-field"><label>${X('عدد العلب المُعادة (يمكن للمدرب تغييره)', 'Jars returned (trainer may change)')}</label>${nin('inv.ret')}</div></div>` +
        `<p><b>${X('ما الخطأ في الفاتورة؟ احسب المبلغ الصحيح (سعر العلبة 30 درهماً):', 'What is wrong with the invoice? Calculate the correct amount (price per jar 30 MAD):')}</b></p><div class="ps-fields">${f('wrong', X('قيمة السلع المُعادة المحسوبة خطأً', 'Value of returned goods charged in error'), exp.wrong)}${f('sub', X('المجموع الصحيح دون رسوم', 'Correct total excl. tax'), exp.sub)}${f('vat', X('الضريبة 20%', 'VAT 20%'), exp.vat)}${f('tot', X('المبلغ الصحيح الواجب دفعه', 'Correct amount to pay'), exp.tot)}</div>` +
        `<div class="ps-actions">${btn('invcheck', X('تحقق', 'Check'), 'primary')}</div>${done ? `<div class="ps-answer">${X('بعد اكتشاف الخطأ اتصلت نادية بالمزوّد فوراً وشرحت المشكلة وأخبرته بمذكرة الشكوى التي أرسلتها مع عامل التوصيل، ثم ناقشت معه كيفية حلها.', 'After spotting the error, Nadia contacted the supplier immediately, explained the problem, mentioned the complaint note she sent with the delivery person, then discussed how to solve it.')}</div>` : ''}` +
        `<h3 style="margin-top:12px">${X('قائمة التحقق قبل الدفع', 'Checklist before and after paying')}</h3>${pay}`, 'warn') +
      resetBar();
  }, update() {
    const set = (id, v) => { const e = root.querySelector(`[data-o="${id}"]`); if (e) e.textContent = v; };
    let sub = 0;
    D.quoteItems.forEach((i) => { const q = blank(sget(`po.q.${i.code}`)) ? i.q : num(sget(`po.q.${i.code}`)); const p = blank(sget(`po.p.${i.code}`)) ? i.pa : num(sget(`po.p.${i.code}`)); sub += q * p; set(`po-t-${i.code}`, fmt(q * p)); });
    set('po-sub', fmt(sub)); set('po-vat', fmt(sub * D.vat)); set('po-tot', fmt(sub * (1 + D.vat)));
    const n = [0, 1, 2, 3].filter((i) => sget(`recv.${i}`) === true).length;
    const r = root.querySelector('[data-o="recv-res"]');
    if (r) { r.textContent = n === 4 ? X('تم التحقق من كل شيء: يمكنك توقيع سند التسليم.', 'Everything checked: you can sign the delivery note.') : X(`تم التحقق من ${fmt(n, 0)} من 4 – أكمل التحقق قبل التوقيع.`, `${fmt(n, 0)} of 4 checked – complete the checks before signing.`); r.className = 'ps-res ' + (n === 4 ? 'ok' : ''); }
  }, afterRender() {
    // pre-fill order lines with the manufacturer's quotation (editable)
    D.quoteItems.forEach((i) => { if (blank(sget(`po.q.${i.code}`))) sset(`po.q.${i.code}`, i.q); if (blank(sget(`po.p.${i.code}`))) sset(`po.p.${i.code}`, i.pa); const a = root.querySelector(`[data-k="po.q.${i.code}"]`), b = root.querySelector(`[data-k="po.p.${i.code}"]`); if (a) a.value = String(sget(`po.q.${i.code}`)); if (b) b.value = String(sget(`po.p.${i.code}`)); });
    if (blank(sget('inv.ret'))) { sset('inv.ret', D.returned.defaultQty); const e = root.querySelector('[data-k="inv.ret"]'); if (e) e.value = String(D.returned.defaultQty); }
  } });
  function invExpected() {
    const full = D.quoteItems.reduce((a, i) => a + i.q * i.pa, 0);
    const ret = blank(sget('inv.ret')) ? D.returned.defaultQty : num(sget('inv.ret'));
    const gel = D.quoteItems.find((i) => i.code === D.returned.item);
    const wrong = ret * gel.pa; const sub = full - wrong;
    return { wrong, sub, vat: sub * D.vat, tot: sub * (1 + D.vat) };
  }

  add({ id: 'p-check', grp: 'A', icon: '✓', title: D.B('اختبر معلوماتك: الشراء', 'Check yourself: Purchasing'), render() {
    return head(X('التقييم 1: الشراء', 'Assessment 1: Purchasing'), X('اختر الإجابة الصحيحة لكل سؤال.', 'Choose the correct answer for each question.')) + mcq('p', D.assessmentPurchasing) + resetBar();
  } });

  /* B1: understanding stock */
  add({ id: 's-what', grp: 'B', icon: '⑥', title: D.B('ما هو المخزون ولماذا نضبطه؟', 'What is stock and why control it?'), render() {
    const taskOpts = D.stockTasks.map((t) => ({ v: t.k, t: T(t.t) }));
    const done = !!sget('prob.checked');
    let score = 0;
    const rows = D.stockProblems.map((p, i) => { const v = sget(`prob.a.${i}`); const ok = done && v === p.a; if (ok) score++; return `<tr class="${done ? (ok ? 'flag-ok' : 'flag') : ''}"><td class="start">${T(p.t)}</td><td>${sel(`prob.a.${i}`, taskOpts, done ? (ok ? 'ok' : 'bad') : '')}${done && !ok ? `<div class="ps-note">${X('المهمة الأنسب: ', 'Best fit: ')}<b>${T(D.stockTasks.find((t) => t.k === p.a).t)}</b></div>` : ''}</td></tr>`; }).join('');
    return head(X('ما هو المخزون؟', 'What is stock?'), X('بعد شراء السلع قد لا تستخدمها أو تبيعها على الفور، فتحتفظ بها في مخزونك، ويجب أن تضبط مخزونك بصورة جيدة.', 'After buying goods you may not use or sell them immediately, so you keep them in stock, and you must control your stock well.')) +
      `<div class="ps-grid">${D.stockTypes.map((t, i) => `<div class="ps-card ${['accent', 'warn', 'good'][i]}"><h3>${T(t.t)}</h3><p>${T(t.d)}</p><p class="ps-note">${T(t.ex)}</p></div>`).join('')}</div>` +
      card(X('نشاط: أدرج جميع المواد المخزّنة في مقاولتك حالياً', 'Activity: list everything stored in your business now'), area('mystock')) +
      card(X('ما هي مراقبة المخزون؟ خمس مهام', 'What is stock control? Five tasks'), `<div class="ps-grid">${D.stockTasks.map((t, i) => `<div class="ps-mini"><span class="ps-tag ${['', 'orange', 'green', '', 'orange'][i]}">${i + 1}</span><b>${T(t.t)}</b>${T(t.d)}</div>`).join('')}</div>`, 'accent') +
      card(X('كيف تحسّن مراقبة المخزون مقاولتك؟', 'How does stock control improve your business?'), ul(D.stockBenefits), 'good') +
      card(X('تمرين: أي مهمة من مهام مراقبة المخزون تعالج المشكلة؟', 'Exercise: which stock-control task solves the problem?'), tw(`<thead><tr><th class="start">${X('المشكلة (من متجر ياسر للمستلزمات العامة)', 'Problem (from Yasser’s general store)')}</th><th>${X('المهمة', 'Task')}</th></tr></thead><tbody>${rows}</tbody>`) + `<div class="ps-actions">${btn('probcheck', X('تحقق', 'Check'), 'primary')}</div>${done ? `<div class="ps-res ${score === D.stockProblems.length ? 'ok' : ''}">${X('الإجابات الصحيحة: ', 'Correct answers: ')}<b>${fmt(score, 0)} / ${fmt(D.stockProblems.length, 0)}</b> — ${X('يمكن للمدرب مناقشة أكثر من مهمة لكل مشكلة.', 'the trainer may discuss more than one task for each problem.')}</div>` : ''}`, 'warn') +
      resetBar();
  } });

  /* B2: stock records */
  add({ id: 's-records', grp: 'B', icon: '⑦', title: D.B('سجلات المخزون', 'Stock records'), render() {
    const cash = D.act13.cashSales.map((r) => `<tr><td class="start">${T(r.t)}</td><td>${fq(r.q)}</td></tr>`).join('');
    const steps = [
      D.B('عندما أشتري السلع أحتفظ بالفواتير والإيصالات كي أضيفها إلى سجلاتي.', 'When I buy goods I keep the invoices and receipts so I can add them to my records.'),
      D.B('أدوّن جميع تفاصيل مبيعات المتجر يومياً: سجل المبيعات النقدية، وسجل حسابات الزبناء للبيع بالدين.', 'I write down all the details of the shop’s sales every day: the cash sales record, and the customer accounts record for credit sales.'),
      D.B('أنقل المعلومات من السجلين ومن الفواتير إلى بطاقات المخزون.', 'I transfer the information from both records and the invoices to the stock cards.')
    ];
    return head(X('احتفظ بسجلات المخزون', 'Keep stock records'), X('سجلات المخزون سجلات مكتوبة تُظهر كمية السلع والمواد الداخلة إلى مخزون المقاولة والخارجة منه. وتسمح لك بمعرفة ما بعته أو استخدمته، وكميته، وتوقيته، وما تبقى في المخزون.', 'Stock records are written records showing the quantity of goods and materials coming into and going out of the business. They tell you what you sold or used, how much, when, and what is left in stock.')) +
      card(X('سجلات المخزون عند البائع بالتقسيط (مثال دلال)', 'Stock records for a retailer (Dalal’s example)'), `<div class="ps-steps">${steps.map((s, i) => `<div class="ps-step open"><button type="button" tabindex="-1" style="cursor:default"><span class="n">${i + 1}</span><span>${T(s)}</span></button></div>`).join('')}</div>` +
        `<h3 style="margin-top:12px">${X('سجل المبيعات النقدية – 25 مارس 2017 (مقتطف)', 'Cash sales record – 25 March 2017 (extract)')}</h3>` + tw(`<thead><tr><th class="start">${X('الغرض', 'Item')}</th><th>${X('الكمية المباعة', 'Quantity sold')}</th></tr></thead><tbody>${cash}</tbody>`) +
        `<h3>${X('سجل حسابات الزبناء – البيع بالدين (الزبونة ماجدة)', 'Customer accounts record – credit sales (customer Majda)')}</h3>` + tw(`<thead><tr><th class="start">${X('الغرض', 'Item')}</th><th>${X('الكمية', 'Quantity')}</th></tr></thead><tbody>${D.act13.credit.map((r) => `<tr><td class="start">${T(r.t)}</td><td>${fq(r.q)}</td></tr>`).join('')}</tbody>`), 'accent') +
      card(X('سجلات المصنّع ومقدّم الخدمات', 'Records for manufacturers and service providers'), ul([
        D.B('يحتفظ المصنّعون بسجلات للمواد الأولية والسلع الداخلة والخارجة؛ وليس من الضروري ذكر سعر البيع للمواد الأولية.', 'Manufacturers keep records of raw materials and goods coming in and going out; a selling price is not needed for raw materials.'),
        D.B('عند إنجاز المنتجات يُسجَّل ذلك ضمن السلع الداخلة، وعند بيعها ضمن السلع الخارجة.', 'When products are finished they are recorded as coming in; when they are sold they are recorded as going out.'),
        D.B('يحتفظ مقدّم الخدمات ببطاقات للمواد التي يشتريها لاستخدامها في الخدمة (مثل زيت صيانة السيارات).', 'A service provider keeps cards for the materials bought for use in the service (such as oil for car maintenance).')
      ])) +
      `<div class="ps-actions">${btn('go', X('التطبيق: بطاقة المخزون ←', 'Practice: the stock card →'), 'primary', 'data-id="s-cards"')}</div>` + resetBar();
  } });

  /* B3: stock card */
  add({ id: 's-cards', grp: 'B', icon: '⑧', title: D.B('بطاقة المخزون', 'The stock card'), render() {
    if (!S.card) S.card = cardFromPreset(D.oilCard), S.cardPreset = 'oil';
    const presets = [{ v: 'oil', t: X('بائع بالتقسيط: زيت غذائي', 'Retailer: cooking oil') }, { v: 'cotton', t: X('مصنّع: مادة أولية (قطن)', 'Manufacturer: raw material (cotton)') }, { v: 'coat', t: X('مصنّع: سلع منجزة (معاطف)', 'Manufacturer: finished goods (coats)') }, { v: 'blank', t: X('بطاقة فارغة', 'Blank card') }];
    const a = D.act13; const done = !!sget('a13.checked');
    const f = (k, label, exv) => { const v = sget(`a13.${k}`); const ok = done && !blank(v) && near(num(v), exv); return `<div class="ps-field"><label>${label}</label>${nin(`a13.${k}`)}${done ? `<div class="ps-note">${ok ? '✓' : X('الصحيح: ', 'Correct: ') + fq(exv)}</div>` : ''}</div>`; };
    return head(X('بطاقة المخزون', 'The stock card'), X('تُخصَّص بطاقة أو صفحة مستقلة لكل منتج أو مادة، وتُحسب أرصدتها تلقائياً هنا بعد كل حركة.', 'Each product or material has its own card or page. Here the balance is calculated automatically after every transaction.')) +
      card(X('بطاقة تفاعلية', 'Interactive card'), `<div class="ps-actions"><div class="ps-field" style="min-width:240px"><label>${X('اختر نموذجاً', 'Choose a model')}</label><select class="ps-sel" data-act-change="preset">${presets.map((p) => `<option value="${p.v}" ${S.cardPreset === p.v ? 'selected' : ''}>${esc(p.t)}</option>`).join('')}</select></div>${btn('addrow', X('+ إضافة سطر', '+ Add row'), 'primary', 'data-key="card"')}${btn('preset', X('استعادة النموذج', 'Restore model'), '', `data-v="${S.cardPreset}"`)}</div>` +
        cardHeader('card', S.card, false) + cardTable('card', S.card) + cardStats('card') +
        `<p class="ps-note">${X('أدخل في الصف الأول «الرصيد المنقول». سجّل المشتريات في «الداخل» والمبيعات والتالف والفاقد في «الخارج». عند نهاية الصفحة انقل الرصيد إلى رأس الصفحة التالية.', 'In the first row enter the “balance brought forward”. Record purchases in “In”, and sales, damaged and lost goods in “Out”. At the bottom of a page, carry the balance to the top of the next page.')}</p>`, 'accent') +
      card(X('ماذا تتضمن البطاقة؟', 'What goes on a stock card?'), ul([
        D.B('اسم المنتج أو المادة وتفاصيله.', 'The name and details of the product or material.'),
        D.B('سعر الوحدة الذي تدفعه للمزوّد، وسعر الوحدة الذي تتقاضاه من الزبناء (إن وُجد).', 'The unit price you pay the supplier, and the unit price you charge customers (if any).'),
        D.B('مستوى تجديد الطلبية: مستوى المخزون الواجب الحفاظ عليه لسلعة محددة.', 'The reorder level: the level of stock to keep for a particular item.'),
        D.B('عدد الأغراض المتوفرة عند بدء إكمال البطاقات (الرصيد المنقول من أسفل الصفحة إلى رأس الصفحة التالية).', 'The quantity in stock when you start the card (balance carried from the bottom of one page to the top of the next).'),
        D.B('سجّل مشترياتك كأغراض داخلة، وكل ما تبيعه كسلع خارجة، وأي أغراض تنكسر وتصبح غير صالحة للبيع.', 'Record all purchases as coming in, all sales as going out, and any items that break and cannot be sold.')
      ])) +
      card(X('نشاط 13: أكمل بطاقة زيت 750 مل ليوم 25 مارس', 'Activity 13: complete the 750 ml cooking-oil card for 25 March'), `<p>${X('رصيد البطاقة في 24 مارس هو 7 قنينات. استخدم المستندات الثلاثة: سجل المبيعات النقدية (زيت 750 مل: 3 مبيعات)، سجل حسابات الزبناء (زيت 750 مل: قنينة للزبونة ماجدة)، وفاتورة المورّد (علبتان من الزيت × 12 قنينة).', 'The card balance on 24 March is 7 bottles. Use the three documents: the cash sales record (750 ml oil: 3 sales), the customer accounts record (750 ml oil: 1 bottle to Majda), and the supplier’s invoice (2 cases of oil × 12 bottles).')}</p>` +
        `<div class="ps-fields">${f('in', X('الداخل (قنينات مستلمة)', 'In (bottles received)'), a.expected.in)}${f('out', X('الخارج (قنينات مباعة)', 'Out (bottles sold)'), a.expected.out)}${f('final', X('الرصيد في نهاية 25 مارس', 'Balance at the end of 25 March'), a.expected.final)}</div>` +
        `<div class="ps-actions">${btn('a13check', X('تحقق', 'Check'), 'primary')}</div>`, 'warn') +
      resetBar(btn('go', X('التالي: مستوى تجديد الطلبية ←', 'Next: reorder level →'), '', 'data-id="s-reorder"'));
  }, update() { updateCard('card', S.card); } });

  /* B4: reorder level */
  add({ id: 's-reorder', grp: 'B', icon: '⑨', title: D.B('مستوى تجديد الطلبية', 'Reorder level'), render() {
    if (!S.ro) S.ro = cardFromPreset(D.oilCard);
    const st = S.ro; const lvl = sget('roLevel'); const bals = cardBalances(st.rows); const useL = !blank(lvl) && num(lvl) > 0;
    const first = useL ? bals.findIndex((b) => b < num(lvl)) : -1;
    return head(X('مستوى تجديد الطلبية', 'Reorder level'), X('قدّر مستوى المخزون الواجب الحفاظ عليه لسلعة محددة. يُحدَّد هذا المستوى الآمن بعد تقدير الوقت المطلوب لتجديد الطلبية وشراء المادة. إن تدنّى رصيد أحد مكونات المخزون تحت هذا المستوى فعلى المقاولة التقدّم بطلب شراء المنتج بأسرع وقت ممكن.', 'Estimate the level of stock to keep for a particular item. This safe level is set after estimating the time needed to renew the order and buy the item. If the balance of an item falls below the reorder level, the business should place a purchase order as soon as possible.')) +
      card(X('تمرين: أين كان يجب أن تطلب دلال؟', 'Exercise: when should Dalal have ordered?'), `<p>${X('هذه بطاقة الزيت (750 مل). اكتب مستوى تجديد الطلبية الذي تراه مناسباً: تُظلَّل الصفوف التي هبط فيها الرصيد تحت المستوى. جرّب مستويات مختلفة (5، 8، 10، 12…) وناقش النتيجة مع المجموعة.', 'This is the 750 ml oil card. Enter the reorder level you think is right: rows where the balance fell below the level are highlighted. Try different levels (5, 8, 10, 12…) and discuss the result with the group.')}</p>` +
        `<div class="ps-fields"><div class="ps-field"><label>${X('مستوى تجديد الطلبية (قنينات)', 'Reorder level (bottles)')}</label>${nin('roLevel')}</div></div>` + cardTable('ro', st, { ro: true }) +
        `<div class="ps-res" data-o="ro-res"></div>`, 'accent') +
      card(X('قصة دلال: الحدّ الأقصى للمخزون', 'Dalal’s story: a maximum stock level'), `<p>${X('بيّن ضبط المخزون أن مبيعات نوع من البنّ بطيئة وثمنه مرتفع، فقدر كبير من أموال المقاولة مقيّد به. في المستقبل لن تطلب دلال سوى 8 علب كل مرة، وقررت أن تحتفظ بـ 12 علبة ككمية قصوى في مخزونها. وفي المقابل بيعت معلبات السمك تقريباً كلها في أربعة أيام، فستطلب كمية أكبر في المرة المقبلة.', 'Stock control showed that one kind of coffee sells slowly and is expensive, so a lot of the business’s money is tied up in it. In future Dalal will order only 8 boxes at a time and keep 12 boxes as the maximum in stock. On the other hand, almost all the canned fish sold in four days, so next time she will order a larger quantity.')}</p>`, 'good') +
      card(X('سؤال سريع', 'Quick question'), mcq('ro', [{ q: D.B('عندما يهبط رصيد سلعة تحت مستوى تجديد الطلبية، ما الذي يجب أن تفعله؟', 'When the balance of an item falls below the reorder level, what should you do?'), o: [D.B('التقدّم بطلب شراء بأسرع وقت ممكن', 'Place a purchase order as soon as possible'), D.B('خفض مستوى تجديد الطلبية', 'Lower the reorder level'), D.B('الانتظار حتى ينفد المخزون', 'Wait until the stock runs out')], a: 0 }])) + resetBar();
  }, update() {
    const st = S.ro; const lvl = sget('roLevel'); const bals = cardBalances(st.rows); const useL = !blank(lvl) && num(lvl) > 0; const L = num(lvl);
    bals.forEach((b, i) => { const tr = root.querySelector(`tr[data-row="ro-${i}"]`); if (tr) tr.classList.toggle('flag', useL && b < L); });
    const r = root.querySelector('[data-o="ro-res"]'); if (!r) return;
    if (!useL) { r.textContent = X('أدخل مستوى لتظهر النتيجة.', 'Enter a level to see the result.'); r.className = 'ps-res'; return; }
    const idx = bals.findIndex((b) => b < L);
    r.textContent = idx < 0 ? X('لم يهبط الرصيد تحت هذا المستوى أبداً.', 'The balance never fell below this level.') : X(`هبط الرصيد تحت المستوى لأول مرة بتاريخ ${st.rows[idx].d} (الرصيد ${fq(bals[idx])}): كان يجب إعداد طلبية جديدة في ذلك الوقت.`, `The balance first fell below the level on ${st.rows[idx].d} (balance ${fq(bals[idx])}): a new order should have been prepared then.`);
    r.className = 'ps-res ' + (idx < 0 ? 'ok' : 'bad');
  } });

  /* B5: stocktaking */
  function countBlock(key, data, intro) {
    const st = S.count && S.count[key] ? S.count[key] : {};
    const rows = data.map((r, i) => {
      const noCard = blank(r.card);
      return `<tr data-row="${key}-${i}"><td class="start">${T(r.t)}</td><td>${noCard ? '—' : fq(r.card)}</td><td>${nin(`count.${key}.c.${i}`)}</td><td>${out(`${key}-d-${i}`)}</td><td>${out(`${key}-s-${i}`)}</td><td>${tin(`count.${key}.m.${i}`, 'wide')}</td></tr>`;
    }).join('');
    const corr = st.applied ? card(X('تصحيح بطاقات المخزون', 'Correct the stock cards'), tw(`<thead><tr><th class="start">${X('المنتج', 'Product')}</th><th>${X('الفارق', 'Difference')}</th><th>${X('ماذا تدوّن؟', 'What to record?')}</th><th>${X('الرصيد الجديد على البطاقة', 'New card balance')}</th></tr></thead><tbody>${data.map((r, i) => { if (blank(r.card)) return `<tr><td class="start">${T(r.t)}</td><td>—</td><td class="start">${X('أنشئ بطاقة مخزون جديدة وسجّل الكمية المعدودة كرصيد أولي', 'Create a new stock card and record the counted quantity as the opening balance')}</td><td>${blank(sget(`count.${key}.c.${i}`)) ? '—' : fq(num(sget(`count.${key}.c.${i}`)))}</td></tr>`; const c = sget(`count.${key}.c.${i}`); if (blank(c)) return `<tr><td class="start">${T(r.t)}</td><td>—</td><td>—</td><td>—</td></tr>`; const d = num(c) - r.card; return `<tr><td class="start">${T(r.t)}</td><td>${sgn(d)}</td><td class="start">${d < 0 ? X(`سجّل ${fq(-d)} في خانة «السلع الخارجة»`, `Record ${fq(-d)} in the “Out” column`) : d > 0 ? X(`سجّل ${fq(d)} في خانة «السلع الداخلة»`, `Record ${fq(d)} in the “In” column`) : X('لا تصحيح', 'No correction')}</td><td>${fq(num(c))}</td></tr>`; }).join('')}</tbody>`) + `<p class="ps-note">${X('بعد التصحيح يطابق رصيد كل بطاقة الكمية المعدودة فعلياً.', 'After correction, each card balance equals the quantity actually counted.')}</p>`, 'good') : '';
    return `<p>${intro}</p>` + tw(`<thead><tr><th class="start">${X('التفاصيل', 'Details')}</th><th>${X('الكمية في بطاقة المخزون', 'Quantity on the stock card')}</th><th>${X('الجرد الفعلي للمخزون', 'Actual count')}</th><th>${X('الفارق', 'Difference')}</th><th>${X('الحالة', 'Status')}</th><th>${X('التعليقات', 'Comments')}</th></tr></thead><tbody>${rows}</tbody>`) +
      `<div class="ps-res" data-o="${key}-sum"></div><div class="ps-actions">${btn('fillcount', X('تعبئة الكميات المعدودة من المثال', 'Fill the counted quantities from the example'), '', `data-key="${key}"`)}${btn('applycount', st.applied ? X('إخفاء التصحيح', 'Hide corrections') : X('عرض تصحيح البطاقات', 'Show card corrections'), 'primary', `data-key="${key}"`)}</div>` + corr;
  }
  function updateCount(key, data) {
    let shortages = 0, surpluses = 0, ok = 0, filled = 0;
    const set = (id, v) => { const e = root.querySelector(`[data-o="${id}"]`); if (e) e.textContent = v; };
    data.forEach((r, i) => {
      const c = sget(`count.${key}.c.${i}`);
      if (blank(r.card)) { set(`${key}-d-${i}`, '—'); set(`${key}-s-${i}`, X('لا توجد بطاقة', 'No card')); return; }
      if (blank(c)) { set(`${key}-d-${i}`, '—'); set(`${key}-s-${i}`, '—'); return; }
      filled++; const d = num(c) - r.card;
      set(`${key}-d-${i}`, d === 0 ? '0' : sgn(d));
      set(`${key}-s-${i}`, d < 0 ? X('نقص', 'Shortage') : d > 0 ? X('زيادة', 'Surplus') : X('مطابق', 'Matches'));
      const tr = root.querySelector(`tr[data-row="${key}-${i}"]`); if (tr) { tr.classList.toggle('flag', d !== 0); tr.classList.toggle('flag-ok', d === 0); }
      if (d < 0) shortages++; else if (d > 0) surpluses++; else ok++;
    });
    const s = root.querySelector(`[data-o="${key}-sum"]`);
    if (s) { s.textContent = filled === 0 ? X('أدخل الكميات المعدودة لتظهر الفوارق.', 'Enter the counted quantities to see the differences.') : X(`مطابق: ${fmt(ok, 0)} · نقص: ${fmt(shortages, 0)} · زيادة: ${fmt(surpluses, 0)}`, `Matches: ${fmt(ok, 0)} · Shortages: ${fmt(shortages, 0)} · Surpluses: ${fmt(surpluses, 0)}`); s.className = 'ps-res ' + (filled && !shortages && !surpluses ? 'ok' : filled ? 'bad' : ''); }
  }
  add({ id: 's-count', grp: 'B', icon: '⑩', title: D.B('الجرد الفعلي للمخزون', 'Physical stocktaking'), render() {
    const steps = D.stocktakeSteps.map((s, i) => `<div class="ps-step open"><button type="button" tabindex="-1" style="cursor:default"><span class="n">${i + 1}</span><span>${T(s.t)}</span></button><div class="body"><p>${T(s.d)}</p></div></div>`).join('');
    return head(X('الجرد الفعلي للمخزون', 'Physical stocktaking'), X('هو عملية الإحصاء والفحص المادي لجميع السلع الموجودة في المخزون، ثم مقارنة الأرقام بتلك المسجلة في بطاقات المخزون. وهو يكشف أي سلع مفقودة أو متضررة.', 'Counting and physically checking all the goods in stock, then comparing the figures with those on the stock cards. It reveals any goods that are missing or damaged.')) +
      card(X('خطوات الجرد الفعلي', 'Steps of a stocktake'), `<div class="ps-steps">${steps}</div>`, 'accent') +
      card(X('تمرين 1: لائحة الجرد في متجر دلال – 20 مارس', 'Exercise 1: stocktaking list in Dalal’s shop – 20 March'), countBlock('shop', D.stocktakeShop, X('أدخل الكميات المعدودة فعلياً (الجرد الفعلي) ثم اقرأ الفارق: الفارق = الجرد الفعلي − رصيد البطاقة.', 'Enter the quantities actually counted, then read the difference: difference = actual count − card balance.')), 'warn') +
      card(X('لماذا قد توجد فوارق؟', 'Why might there be differences?'), ul(D.lossReasons) + `<p class="ps-note">${X('الجرد الفعلي يكشف وجود النقص وكميته لكنه لا يبيّن سببه؛ ابحث عن السبب.', 'A stocktake shows that something is missing and how much, but not why; look for the reason.')}</p>`) +
      card(X('تمرين 2: مخبزة «الخبز اللذيذ» – الجرد بعد إغلاق المتجر', 'Exercise 2: Tasty Bread Bakery – stocktake after closing'), countBlock('bakery', D.stocktakeBakery, X('أحصت جيهان ومساعدتها المواد بعد الإغلاق. السكر: بطاقة 20.5 كلغ؛ الطحين: بطاقة 380 كلغ. تحتاج المخبزة إلى الملح أيضاً لكنها لا تحتفظ ببطاقة مخزون خاصة به.', 'Jihane and her assistant counted the materials after closing. Sugar: card 20.5 kg; flour: card 380 kg. The bakery also needs salt but keeps no stock card for it.')), 'warn') +
      card(X('ما الوتيرة المناسبة للجرد الفعلي؟ ومتى؟', 'How often and when to do a stocktake?'), `<div class="ps-grid"><div class="ps-mini"><b>${X('جرد أكثر تواتراً إذا', 'More often if')}</b>${ul(D.frequency.more)}</div><div class="ps-mini"><b>${X('جرد أقل تواتراً إذا', 'Less often if')}</b>${ul(D.frequency.less)}</div><div class="ps-mini"><b>${X('متى؟', 'When?')}</b>${ul(D.frequency.when)}</div></div><div class="ps-field"><label>${X('هل تقوم بالجرد الفعلي في مقاولتك؟ كم مرة؟ ومتى؟', 'Do you do a stocktake in your business? How often? When?')}</label>${area('myCount')}</div>`) +
      resetBar();
  }, update() { updateCount('shop', D.stocktakeShop); updateCount('bakery', D.stocktakeBakery); } });

  add({ id: 's-electronic', grp: 'B', icon: '⑪', title: D.B('النظام الإلكتروني لتدبير المخزون', 'Electronic stock control system'), render() {
    return head(X('النظام الإلكتروني لتدبير المخزون', 'The electronic stock control system'), X('تعرّف على فكرة النظام وفوائده. هذه الوحدة لا تحاكي نظام مستودعات حقيقياً.', 'Learn the idea of the system and its benefits. This module does not simulate a real warehouse system.')) +
      card(X('كيف يعمل؟', 'How does it work?'), ul(D.electronic.how), 'accent') + card(X('فوائده', 'Benefits'), ul(D.electronic.benefits), 'good') +
      card(X('نشاط 16: فكّر', 'Activity 16: think'), D.electronic.reflect.map((q, i) => `<div class="ps-field"><label>${T(q)}</label>${area(`elec.${i}`)}</div>`).join('')) + resetBar();
  } });
  add({ id: 's-check', grp: 'B', icon: '✓', title: D.B('اختبر معلوماتك: المخزون', 'Check yourself: Stock'), render() {
    return head(X('التقييم 2: تدبير المخزون', 'Assessment 2: Stock management'), X('اختر الإجابة الصحيحة لكل سؤال.', 'Choose the correct answer for each question.')) + mcq('s', D.assessmentStock) + resetBar();
  } });

  /* C: supplier relationships */
  add({ id: 'r-suppliers', grp: 'C', icon: '⑫', title: D.B('المزوّدون وسجلاتهم', 'Suppliers and supplier records'), render() {
    if (!S.recs) S.recs = [0, 1, 2].map(() => ({}));
    const rows = S.recs.map((r, i) => `<tr>${D.recordFields.map((_, c) => `<td>${tin(`recs.${i}.f${c}`, 'wide')}</td>`).join('')}<td><button type="button" class="ps-btn small" data-act="delrec" data-i="${i}" aria-label="${X('حذف', 'Delete')}">×</button></td></tr>`).join('');
    return head(X('إدارة العلاقات مع المزوّدين', 'Managing supplier relationships'), X('هل يوجد عدد قليل أم كبير من المزوّدين؟ وكيف تؤثر العلاقات معهم على مقاولتك؟', 'Few or many suppliers? And how do your relationships with them affect your business?')) +
      `<div class="ps-grid two"><div class="ps-card warn"><h3>${X('الاعتماد على مزوّد واحد', 'Relying on one supplier')}</h3>${ul(D.supplierCounts.few)}</div><div class="ps-card good"><h3>${X('التعامل مع عدد كبير أو قليل', 'Many or few suppliers')}</h3>${ul(D.supplierCounts.many)}</div></div>` +
      card(X('نشاط 17: كم مزوّداً تتعامل معهم؟ وما فائدة ذلك لك؟', 'Activity 17: how many suppliers do you deal with, and what does it give you?'), area('supCount')) +
      card(X('نشاط 18: سجلات المزوّدين', 'Activity 18: supplier records'), `<p>${X('حافظ على سجلات مزوّدك وحدّثها لتقرر مواصلة التعاون معهم أم لا: سجّل التوصيل والكميات المسلّمة وأي تغيير في الأسعار وما يتعلق بالجودة والدفع.', 'Keep your supplier records and update them so you can decide whether to continue working with them: record deliveries, quantities delivered, any price changes, and anything about quality and payment.')}</p>` +
        tw(`<thead><tr>${D.recordFields.map((f) => `<th>${T(f)}</th>`).join('')}<th></th></tr></thead><tbody>${rows}</tbody>`) + `<div class="ps-actions">${btn('addrec', X('+ إضافة سطر', '+ Add row'), 'primary')}</div>`, 'accent') + resetBar();
  } });

  add({ id: 'r-performance', grp: 'C', icon: '⑬', title: D.B('مراجعة أداء المزوّدين', 'Reviewing supplier performance'), render() {
    const N = 5;
    const names = Array.from({ length: N }, (_, c) => `<th>${tin(`perf.n.${c}`, '', X('المزوّد ', 'Supplier ') + (c + 1))}</th>`).join('');
    const rows = D.criteria.map((cr, r) => `<tr><td class="start">${T(cr)}</td>${Array.from({ length: N }, (_, c) => `<td>${nin(`perf.s.${r}.${c}`, 'data-min="0"')}</td>`).join('')}</tr>`).join('');
    return head(X('مراجعة أداء المزوّدين', 'Reviewing supplier performance'), X('راجع أداء المزوّدين وصنّفهم بانتظام وفق معايير واضحة، ثم قرّر من تواصل التعامل معه.', 'Review and rank your suppliers regularly against clear criteria, then decide whom to keep working with.')) +
      card(X('نشاط 19-20: صنّف مزوّديك', 'Activities 19–20: rate your suppliers'), `<p>${X('أعطِ كل مزوّد درجة من 1 (ضعيف) إلى 5 (ممتاز) لكل معيار. المجموع والترتيب يُحسبان تلقائياً.', 'Give each supplier a score from 1 (poor) to 5 (excellent) for each criterion. Totals and ranking are calculated automatically.')}</p>` +
        tw(`<thead><tr><th class="start">${X('معايير الأداء', 'Performance criteria')}</th>${names}</tr></thead><tbody>${rows}</tbody><tfoot><tr><td class="start">${X('المجموع', 'Total')}</td>${Array.from({ length: N }, (_, c) => `<td>${out(`perf-t-${c}`)}</td>`).join('')}</tr><tr><td class="start">${X('التصنيف', 'Ranking')}</td>${Array.from({ length: N }, (_, c) => `<td>${out(`perf-r-${c}`)}</td>`).join('')}</tr></tfoot>`) +
        `<div class="ps-actions">${btn('perfsample', X('تعبئة مثال تدريبي', 'Fill a practice example'))}</div><p class="ps-note">${X('المثال التدريبي بدرجات افتراضية لأغراض التمرين فقط (ليست من الدليل).', 'The practice example uses invented scores for exercise purposes only (they are not from the manual).')}</p>`, 'accent') + resetBar();
  }, update() {
    const N = 5; const tot = []; const set = (id, v) => { const e = root.querySelector(`[data-o="${id}"]`); if (e) e.textContent = v; };
    for (let c = 0; c < N; c++) { let t = 0, any = false; D.criteria.forEach((_, r) => { const v = sget(`perf.s.${r}.${c}`); if (!blank(v)) { any = true; t += Math.min(5, Math.max(0, num(v))); } }); tot.push(any ? t : null); set(`perf-t-${c}`, any ? fq(t) : '—'); }
    const vals = tot.filter((v) => v !== null);
    tot.forEach((t, c) => set(`perf-r-${c}`, t === null ? '—' : fmt(vals.filter((v) => v > t).length + 1, 0)));
  } });

  add({ id: 'r-disputes', grp: 'C', icon: '⑭', title: D.B('معالجة النزاعات وفسخ العقود', 'Handling disputes and ending contracts'), render() {
    const items = [...D.disputeTips.map((t) => ({ t, good: true })), ...D.disputeWrong.map((t) => ({ t, good: false }))];
    const order = [3, 8, 0, 5, 9, 1, 6, 2, 7, 4]; // fixed mixed order
    const done = !!sget('disp.checked'); let score = 0;
    const list = order.map((idx) => { const it = items[idx]; const v = sget(`disp.${idx}`) === true; const ok = done && v === it.good; if (ok) score++; return `<label class="ps-check ${done ? (ok ? '' : '') : ''}" style="${done ? (ok ? 'background:#A4CF0626;border-radius:8px;padding:6px' : 'background:#F48D0114;border-radius:8px;padding:6px') : ''}"><input type="checkbox" data-k="disp.${idx}" ${v ? 'checked' : ''}><span>${T(it.t)}${done && !ok ? ` <b>(${it.good ? X('هذا تصرف موصى به', 'this is recommended') : X('هذا تصرف غير موصى به', 'this is not recommended')})</b>` : ''}</span></label>`; }).join('');
    return head(X('معالجة النزاعات مع المزوّدين', 'Handling disputes with suppliers'), X('عند نشوب نزاع (كتأخر التسليم أو خلل في الجودة أو خطأ في الفاتورة) اتبع نهجاً واضحاً.', 'When a dispute arises (late delivery, poor quality, an invoice error) follow a clear approach.')) +
      card(X('نشاط 21: أي هذه التصرفات موصى بها؟', 'Activity 21: which of these actions are recommended?'), `<p>${X('ضع علامة على التصرفات الموصى بها عند حل النزاع.', 'Tick the actions that are recommended when solving a dispute.')}</p>${list}<div class="ps-actions">${btn('dispcheck', X('تحقق', 'Check'), 'primary')}</div>${done ? `<div class="ps-res ${score === items.length ? 'ok' : ''}">${X('الإجابات الصحيحة: ', 'Correct answers: ')}<b>${fmt(score, 0)} / ${fmt(items.length, 0)}</b></div>` : ''}`, 'warn') +
      card(X('نصائح المنهج', 'The recommended approach'), `<ol class="ps-list">${D.disputeTips.map((t) => `<li>${T(t)}</li>`).join('')}</ol>`, 'accent') +
      card(X('فسخ العقود مع المزوّدين', 'Ending contracts with suppliers'), ul(D.endContract), 'good') +
      card(X('تمرين: فكّر في مزوّد قد تنهي التعامل معه', 'Exercise: think of a supplier you might stop using'), `<div class="ps-field"><label>${X('لماذا؟ وما الذي يجب أن تتحقق منه في العقد قبل ذلك؟', 'Why? What must you check in the contract first?')}</label>${area('endNote')}</div>`) + resetBar();
  } });
  add({ id: 'r-check', grp: 'C', icon: '✓', title: D.B('اختبر معلوماتك: المزوّدون', 'Check yourself: Suppliers'), render() {
    return head(X('التقييم 3: العلاقات مع المزوّدين', 'Assessment 3: Supplier relationships'), X('اختر الإجابة الصحيحة لكل سؤال.', 'Choose the correct answer for each question.')) + mcq('r', D.assessmentSuppliers) + resetBar();
  } });

  add({ id: 'plan', grp: 'P', icon: '✎', title: D.B('خطة العمل', 'Action plan'), render() {
    if (!S.plan) S.plan = [{}, {}, {}];
    const rows = S.plan.map((r, i) => `<tr><td>${tin(`plan.${i}.p`, 'wide')}</td><td>${tin(`plan.${i}.s`, 'wide')}</td><td>${tin(`plan.${i}.w`, 'wide')}</td><td>${tin(`plan.${i}.d`, 'wide')}</td><td><button type="button" class="ps-btn small" data-act="delplan" data-i="${i}" aria-label="${X('حذف', 'Delete')}">×</button></td></tr>`).join('');
    return head(X('خطة العمل', 'Action plan'), X('طبّق ما تعلّمته على مقاولتك: حدّد أبرز مشاكل الشراء وتدبير المخزون وكيف ومن ومتى ستحلها.', 'Apply what you learned to your business: identify your main purchasing and stock problems, and decide how, who and when you will solve them.')) +
      card('', tw(`<thead><tr><th>${X('ما هي المشكلة؟', 'What is the problem?')}</th><th>${X('كيف يمكن حلّها؟', 'How can it be solved?')}</th><th>${X('من سيحلّها؟', 'Who will solve it?')}</th><th>${X('متى؟', 'When?')}</th><th></th></tr></thead><tbody>${rows}</tbody>`) + `<div class="ps-actions">${btn('addplan', X('+ إضافة سطر', '+ Add row'), 'primary')}</div>`, 'accent') +
      `<p class="ps-note">${X('مثال: «أحتفظ بكمية كبيرة جداً من بعض السلع بينما تنفد سلع أخرى» ← أتحقق من مستويات تجديد الطلبية وأصحّحها، وأتحقق من مخزوني مرتين في الأسبوع على الأقل ← أنا ← بدءاً من الأسبوع المقبل.', 'Example: “I keep far too much of some goods while others often run out” → check and correct the reorder levels, and check my stock at least twice a week → me → starting next week.')}</p>` + resetBar();
  } });

  /* ---------- navigation, rendering, events ---------- */
  const byId = (id) => SECTIONS.find((s) => s.id === id) || SECTIONS[0];
  function buildNav() {
    const nav = document.querySelector('[data-nav-group="stock"]'); if (!nav) return;
    const act = document.body.classList.contains('mode-stock');
    let html = ''; let last = '';
    SECTIONS.forEach((s) => {
      if (s.grp !== last) { if (s.grp !== 'H') html += `<div class="sidebar-nav-caption sub">${esc(T(GROUPS[s.grp]))}</div>`; last = s.grp; }
      html += `<button type="button" class="global-nav-item${act && s.id === currentId ? ' active' : ''}" data-nav-item="stock-${s.id}" data-stock="${s.id}"${act && s.id === currentId ? ' aria-current="page"' : ''}><span class="global-nav-icon">${s.icon}</span><span class="global-nav-label">${esc(T(s.title))}</span><span class="global-nav-current"></span></button>`;
    });
    nav.innerHTML = html;
  }
  function setHeading(s) {
    const t = $('workspaceTitle'), d = $('workspaceDescription'), n = $('workspaceBadgeNumber'), l = $('workspaceBadgeLabel');
    if (t) t.textContent = X('المشتريات وتدبير المخزون', 'Purchasing and Stock Management');
    if (d) d.textContent = T(s.title);
    if (n) n.textContent = { H: 'PS', A: 'I', B: 'II', C: 'III', P: '✎' }[s.grp];
    if (l) l.textContent = T(GROUPS[s.grp]);
  }
  function pager(s) {
    const i = SECTIONS.indexOf(s); const p = SECTIONS[i - 1], n = SECTIONS[i + 1];
    return `<div class="ps-pager">${p ? btn('go', (lang() === 'en' ? '← ' : '→ ') + esc(T(p.title)), '', `data-id="${p.id}"`) : '<span></span>'}${n ? btn('go', esc(T(n.title)) + (lang() === 'en' ? ' →' : ' ←'), 'primary', `data-id="${n.id}"`) : '<span></span>'}</div>`;
  }
  function render(keepScroll) {
    if (!root) return;
    const s = byId(currentId); const y = window.scrollY;
    root.innerHTML = s.render() + pager(s);
    if (s.afterRender) s.afterRender();
    if (s.update) s.update();
    setHeading(s);
    if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function open(id) {
    currentId = byId(id).id;
    document.querySelectorAll('[data-nav-item]').forEach((b) => { const a = b.dataset.navItem === 'stock-' + currentId; b.classList.toggle('active', a); if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    render(false);
  }

  const resetKeys = { 'p-needs': ['cls', 'needs'], 'p-good': ['case', 'caseNote'], 'p-steps': ['step'], 'p-quotes': ['inq', 'cmp'], 'p-order': ['po', 'recv', 'inv', 'pay'], 'p-check': ['mcq.p'], 's-what': ['mystock', 'prob'], 's-records': [], 's-cards': ['card', 'cardPreset', 'a13'], 's-reorder': ['ro', 'roLevel', 'mcq.ro'], 's-count': ['count', 'myCount'], 's-electronic': ['elec'], 's-check': ['mcq.s'], 'r-suppliers': ['recs', 'supCount'], 'r-performance': ['perf'], 'r-disputes': ['disp', 'endNote'], 'r-check': ['mcq.r'], plan: ['plan'] };
  const del = (path) => { const ks = path.split('.'); let o = S; for (const k of ks.slice(0, -1)) { if (o == null) return; o = o[k]; } if (o) delete o[ks[ks.length - 1]]; };

  const ACT = {
    go: (b) => open(b.dataset.id),
    reset: () => { (resetKeys[currentId] || []).forEach(del); render(true); },
    print: () => { if (!window.SIYBReportPdf || !root) return; const h = root.querySelector('h2, h1'); window.SIYBReportPdf.save({ root, title: (h ? h.textContent.trim() : '') || X('المشتريات والمخزون', 'Purchasing and Stock'), filename: 'SIYB-stock-' + currentId + '-' + new Date().toISOString().slice(0, 10) + '.pdf', lang: lang() }); },
    toggle: (b) => { sset(b.dataset.k, !sget(b.dataset.k)); render(true); },
    step: (b) => { const i = Number(b.dataset.i); sset('step.open', sget('step.open', 0) === i ? 0 : i); render(true); },
    clscheck: () => { sset('cls.checked', true); render(true); },
    probcheck: () => { sset('prob.checked', true); render(true); },
    cmpcheck: () => { sset('cmp.checked', true); render(true); },
    invcheck: () => { sset('inv.checked', true); render(true); },
    dispcheck: () => { sset('disp.checked', true); render(true); },
    a13check: () => { sset('a13.checked', true); render(true); },
    mcqcheck: (b) => { sset(`mcq.${b.dataset.id}.checked`, true); render(true); },
    mcqreset: (b) => { del(`mcq.${b.dataset.id}`); render(true); },
    preset: (b) => { const m = { oil: D.oilCard, cotton: D.cottonCard, coat: D.coatCard, blank: D.blankCard }[b.dataset.v] || D.oilCard; S.card = cardFromPreset(m); S.cardPreset = b.dataset.v; render(true); },
    addrow: (b) => { S[b.dataset.key].rows.push({ d: '', det: '', in: '', out: '' }); render(true); },
    delrow: (b) => { const st = S[b.dataset.key]; st.rows.splice(Number(b.dataset.i), 1); if (!st.rows.length) st.rows.push({ d: '', det: '', in: '', out: '' }); render(true); },
    addrec: () => { S.recs.push({}); render(true); },
    delrec: (b) => { S.recs.splice(Number(b.dataset.i), 1); if (!S.recs.length) S.recs.push({}); render(true); },
    addplan: () => { S.plan.push({}); render(true); },
    delplan: (b) => { S.plan.splice(Number(b.dataset.i), 1); if (!S.plan.length) S.plan.push({}); render(true); },
    fillcount: (b) => { const data = b.dataset.key === 'shop' ? D.stocktakeShop : D.stocktakeBakery; data.forEach((r, i) => { if (!blank(r.card)) sset(`count.${b.dataset.key}.c.${i}`, String(r.count)); }); render(true); },
    applycount: (b) => { const k = `${b.dataset.key}`; S.count = S.count || {}; S.count[k] = S.count[k] || {}; S.count[k].applied = !S.count[k].applied; render(true); },
    perfsample: () => { D.sampleSuppliers.forEach((s, c) => { sset(`perf.n.${c}`, T(s.n)); s.s.forEach((v, r) => sset(`perf.s.${r}.${c}`, String(v))); }); render(true); },
    copyinq: () => { const el = root.querySelector('[data-o="inq-preview"]'); const text = el ? el.innerText : ''; if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); }
  };

  function bind() {
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return; const f = ACT[b.dataset.act]; if (f) f(b); });
    const store = (t) => {
      const k = t.dataset && t.dataset.k; if (!k) return false;
      if (t.type === 'checkbox') sset(k, t.checked);
      else if (t.type === 'radio') sset(k, Number(t.value));
      else sset(k, t.value);
      // keep card state in sync with the row model (values are stored by path inside S.card / S.ro)
      return true;
    };
    const refresh = () => { const s = byId(currentId); if (s.update) s.update(); };
    root.addEventListener('input', (e) => { if (store(e.target)) refresh(); });
    root.addEventListener('change', (e) => {
      if (e.target.matches('[data-act-change="preset"]')) { ACT.preset({ dataset: { v: e.target.value } }); return; }
      if (store(e.target) && (e.target.type === 'checkbox' || e.target.tagName === 'SELECT' || e.target.type === 'radio')) refresh();
    });
  }

  function mount(host) {
    S = S || {};
    host.innerHTML = '<div class="ps-root" id="psRoot"></div>';
    root = host.querySelector('#psRoot');
    bind(); buildNav(); open(currentId || 'home');
  }
  window.SIYBStock = { mount, open, refresh: () => { buildNav(); render(true); }, sections: SECTIONS.map((s) => s.id) };
  window.addEventListener('siyb:languagechange', () => { if (!root) return; if (document.body.classList.contains('mode-stock')) window.SIYBStock.refresh(); else buildNav(); });
})();
