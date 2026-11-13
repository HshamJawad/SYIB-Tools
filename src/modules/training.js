/* SIYB Training Mode engine (v0.4.0)
 * Interactive exercises: the trainee fills the result cells, checks the answers,
 * sees the correct steps for mistakes, and the trainer can reveal the model solution.
 * Numbers can come from the slides (seed 0) or from a seeded random set so that a
 * whole workshop group can use the same "set number".
 */
(function () {
  'use strict';

  const parse = (v) => (window.SIYBParseNumber ? window.SIYBParseNumber(v) : (Number(String(v).replace(/,/g, '')) || 0));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, d = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);
  const raw = (n, d) => String(Number((Number.isFinite(n) ? n : 0).toFixed(d)));
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const joinPlus = (arr, d) => arr.map((v) => fmt(v, d)).join(' + ');

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, min, max, step = 1) => {
    const n = Math.floor((max - min) / step + 1e-9) + 1;
    return Math.round((min + Math.floor(r() * n) * step) * 1000) / 1000;
  };

  /* ------------------------------------------------------------------ */
  /* Exercises                                                          */
  /* build(seed, cell) -> { questions:[{id,label,ans,dec,tol,steps:[formula,numbers]}], html }  */
  /* ------------------------------------------------------------------ */
  const EX = {};

  EX.depreciation = {
    title: 'تمرين | حساب تكاليف الإهلاك أو الاندثار',
    desc: 'احسب الإهلاك السنوي والمتراكم والقيمة الدفترية في 31/12/2017.',
    task: 'طبّق طريقة القسط الثابت على كل أصل: احسب الإهلاك السنوي، ثم الإهلاك المتراكم حتى 31/12/2017، ثم القيمة الدفترية، وبعدها أوجد المجاميع. اكتب إجاباتك في الخانات الفارغة (قرّب إلى منزلة عشرية واحدة).',
    build(seed, cell) {
      const names = ['ماكينة كاش', 'لوحة مضيئة باسم المحل', 'جهاز كمبيوتر وطابعة', 'رفوف', 'ثلاجات عرض'];
      let assets;
      if (!seed) {
        assets = [
          { y: 2014, m: 1, purchase: 500, life: 5 }, { y: 2014, m: 1, purchase: 500, life: 5 },
          { y: 2015, m: 1, purchase: 500, life: 5 }, { y: 2016, m: 1, purchase: 1800, life: 10 },
          { y: 2016, m: 1, purchase: 1500, life: 10 }
        ];
      } else {
        const r = rng(seed);
        assets = names.map(() => ({
          y: pick(r, 2013, 2016), m: pick(r, 1, 11),
          purchase: pick(r, 3, 30) * 100, life: r() < 0.5 ? 5 : 10
        }));
      }
      assets.forEach((a) => { a.months = (2017 - a.y) * 12 + (12 - a.m); a.date = '15/' + a.m + '/' + a.y; });
      const q = [];
      const rows = assets.map((a, i) => {
        const ann = a.purchase / a.life, acc = ann * a.months / 12, book = a.purchase - acc;
        a.ann = ann; a.acc = acc; a.book = book;
        q.push({ id: 'ann' + i, label: names[i] + ' — الإهلاك السنوي', ans: ann, dec: 1, tol: 0.11,
          steps: ['الإهلاك السنوي = قيمة الشراء ÷ العمر التشغيلي', fmt(a.purchase) + ' ÷ ' + a.life + ' = ' + fmt(ann, 1)] });
        q.push({ id: 'acc' + i, label: names[i] + ' — الإهلاك المتراكم', ans: acc, dec: 1, tol: 0.11,
          steps: ['الإهلاك المتراكم = الإهلاك السنوي × أشهر الاستخدام ÷ 12', fmt(ann, 1) + ' × ' + a.months + ' ÷ 12 = ' + fmt(acc, 1)] });
        q.push({ id: 'book' + i, label: names[i] + ' — القيمة الدفترية', ans: book, dec: 1, tol: 0.11,
          steps: ['القيمة الدفترية = قيمة الشراء − الإهلاك المتراكم', fmt(a.purchase) + ' − ' + fmt(acc, 1) + ' = ' + fmt(book, 1)] });
        return '<tr><td>' + esc(names[i]) + '</td><td>' + a.date + '</td><td class="num">' + fmt(a.purchase) + '</td><td class="num">' + a.life +
          '</td><td class="num">' + a.months + '</td><td>' + cell('ann' + i, names[i] + ' — الإهلاك السنوي') + '</td><td>' +
          cell('acc' + i, names[i] + ' — الإهلاك المتراكم') + '</td><td>' + cell('book' + i, names[i] + ' — القيمة الدفترية') + '</td></tr>';
      }).join('');
      const tot = (key, label, arr) => {
        const t = sum(arr);
        q.push({ id: key, label, ans: t, dec: 1, tol: 0.5,
          steps: ['المجموع = مجموع قيم العمود', joinPlus(arr, 1) + ' = ' + fmt(t, 1)] });
      };
      tot('tAnn', 'مجموع الإهلاك السنوي', assets.map((a) => a.ann));
      tot('tAcc', 'مجموع الإهلاك المتراكم', assets.map((a) => a.acc));
      tot('tBook', 'مجموع القيمة الدفترية', assets.map((a) => a.book));
      const html = '<div class="tablewrap"><table class="resulttable"><thead><tr><th>اسم العنصر</th><th>تاريخ الشراء</th><th>قيمة الشراء</th>' +
        '<th>العمر التشغيلي (سنة)</th><th>أشهر الاستخدام</th><th>الإهلاك السنوي</th><th>الإهلاك المتراكم</th><th>القيمة الدفترية</th></tr></thead><tbody>' + rows +
        '</tbody><tfoot><tr><th colspan="2">المجموع</th><th>' + fmt(sum(assets.map((a) => a.purchase))) + '</th><th>—</th><th>—</th><td>' +
        cell('tAnn', 'مجموع الإهلاك السنوي') + '</td><td>' + cell('tAcc', 'مجموع الإهلاك المتراكم') + '</td><td>' + cell('tBook', 'مجموع القيمة الدفترية') +
        '</td></tr></tfoot></table></div>';
      return { questions: q, html };
    }
  };

  EX.overheadExercise = {
    title: 'تمرين | تحميل التكاليف غير المباشرة على المنتجات',
    desc: 'احسب نسبة التحميل ثم تكلفة الوحدة لأربعة منتجات.',
    task: 'احسب نسبة تحميل التكاليف غير المباشرة، ثم التكلفة غير المباشرة والتكلفة الإجمالية لوحدة كل منتج. قرّب النسبة والمبالغ إلى منزلتين عشريتين.',
    build(seed, cell) {
      const names = ['فول مدمس (باقلاء) علبة وزن 450 غم', 'طحين نوع براد وزن 1 كغم', 'زيت طبخ نباتي حجم 1.8 لتر', 'شاي سيلاني وزن 500 غم'];
      let oh, dm, direct;
      if (!seed) { oh = 2053; dm = 10500; direct = [0.75, 1.0, 4.5, 1.5]; }
      else {
        const r = rng(seed);
        oh = pick(r, 1500, 3500, 50); dm = pick(r, 8000, 14000, 100);
        direct = [pick(r, 0.5, 1.5, 0.05), pick(r, 0.8, 1.6, 0.05), pick(r, 3, 6, 0.25), pick(r, 1, 2.5, 0.1)];
      }
      const rate = oh / dm * 100;
      const q = [{ id: 'rate', label: 'نسبة التحميل (%)', ans: rate, dec: 2, tol: 0.06,
        steps: ['نسبة التحميل = (التكاليف غير المباشرة الشهرية ÷ تكاليف المواد المباشرة الشهرية) × 100', '(' + fmt(oh) + ' ÷ ' + fmt(dm) + ') × 100 = ' + fmt(rate, 2) + '%'] }];
      const rows = direct.map((d, i) => {
        const ind = d * rate / 100, tot = d + ind;
        q.push({ id: 'ind' + i, label: names[i] + ' — التكلفة غير المباشرة', ans: ind, dec: 2, tol: 0.015,
          steps: ['التكلفة غير المباشرة = تكلفة المواد المباشرة للوحدة × نسبة التحميل', fmt(d, 2) + ' × ' + fmt(rate, 2) + '% = ' + fmt(ind, 2)] });
        q.push({ id: 'tot' + i, label: names[i] + ' — التكلفة الإجمالية', ans: tot, dec: 2, tol: 0.015,
          steps: ['التكلفة الإجمالية للوحدة = التكلفة المباشرة + التكلفة غير المباشرة', fmt(d, 2) + ' + ' + fmt(ind, 2) + ' = ' + fmt(tot, 2)] });
        return '<tr><td><b>' + esc(names[i]) + '</b></td><td class="num">' + fmt(d, 2) + '</td><td>' + cell('ind' + i, names[i] + ' — التكلفة غير المباشرة') +
          '</td><td>' + cell('tot' + i, names[i] + ' — التكلفة الإجمالية') + '</td></tr>';
      }).join('');
      const html = '<div class="fields"><div class="field"><label>التكاليف غير المباشرة الشهرية</label><input value="' + fmt(oh) + '" disabled></div>' +
        '<div class="field"><label>تكاليف المواد المباشرة الشهرية</label><input value="' + fmt(dm) + '" disabled></div>' +
        '<div class="field"><label>نسبة تحميل التكاليف غير المباشرة (%)</label>' + cell('rate', 'نسبة التحميل (%)') + '</div></div>' +
        '<div class="tablewrap" style="margin-top:14px"><table class="resulttable"><thead><tr><th>المنتج</th><th>تكلفة المواد المباشرة للوحدة (أ)</th>' +
        '<th>التكلفة غير المباشرة للوحدة (ب)</th><th>التكلفة الإجمالية للوحدة (أ + ب)</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
      return { questions: q, html };
    }
  };

  EX.ledger = {
    title: 'تمرين | سجل الحسابات الأساسية',
    desc: 'استخرج المصروفات العامة من سجل الصندوق وأوجد المجاميع.',
    task: 'سجل الصندوق لشهر تشرين الأول / أكتوبر 2017: حدّد في كل سطر المبلغ الذي يُعدّ مصروفاً عاماً (اكتب 0 إذا لم يكن مصروفاً عاماً)، ثم احسب مجاميع الداخل والخارج والمصروفات العامة.',
    build(seed, cell) {
      const defs = [
        ['راتب – البائع', 'in0', 'exp', 250], ['راتب – المالك', 'in0', 'exp', 500], ['مبيعات يومية', 'sale', 'sale', 520],
        ['الكهرباء', 'in0', 'exp', 100], ['النقل', 'in0', 'exp', 180], ['مشتريات مواد', 'in0', 'purch', 80], ['من البنك إلى الصندوق', 'transfer', 'transfer', 700]
      ];
      let amounts = defs.map((d) => d[3]);
      if (seed) {
        const r = rng(seed);
        amounts = [pick(r, 150, 400, 10), pick(r, 300, 800, 50), pick(r, 300, 900, 10), pick(r, 50, 200, 10), pick(r, 80, 250, 10), pick(r, 50, 300, 10), pick(r, 300, 1000, 50)];
      }
      const why = {
        exp: 'مصروف عام: نفقة إدارية أو تشغيلية تُسجَّل في عمود المصروفات العامة',
        sale: 'ليس مصروفاً: هذه مبيعات (إيراد داخل الصندوق)',
        purch: 'ليس مصروفاً عاماً: مشتريات المواد تُحتسب ضمن التكاليف المباشرة',
        transfer: 'ليس مصروفاً: تحويل بين البنك والصندوق'
      };
      const rows = defs.map((d, i) => {
        const inside = (d[2] === 'sale' || d[2] === 'transfer') ? amounts[i] : 0;
        const outside = inside ? 0 : amounts[i];
        const general = d[2] === 'exp' ? outside : 0;
        d.inside = inside; d.outside = outside; d.general = general;
        return d;
      });
      const q = [];
      const body = rows.map((d, i) => {
        q.push({ id: 'g' + i, label: d[0] + ' — المصروفات العامة', ans: d.general, dec: 0, tol: 0.01, steps: [why[d[2]], 'المبلغ = ' + fmt(d.general)] });
        return '<tr><td>30/10</td><td>' + esc(d[0]) + '</td><td class="num">' + fmt(d.inside) + '</td><td class="num">' + fmt(d.outside) + '</td><td>' + cell('g' + i, d[0] + ' — المصروفات العامة') + '</td></tr>';
      }).join('');
      const t = (id, label, f, arr) => { const v = sum(arr); q.push({ id, label, ans: v, dec: 0, tol: 0.01, steps: [f, joinPlus(arr, 0) + ' = ' + fmt(v)] }); };
      t('tIn', 'إجمالي داخل الصندوق', 'إجمالي الداخل = مجموع عمود داخل الصندوق', rows.map((d) => d.inside));
      t('tOut', 'إجمالي خارج الصندوق', 'إجمالي الخارج = مجموع عمود خارج الصندوق', rows.map((d) => d.outside));
      t('tGen', 'إجمالي المصروفات العامة', 'إجمالي المصروفات العامة = مجموع عمود المصروفات العامة', rows.map((d) => d.general));
      const html = '<div class="tablewrap"><table class="resulttable"><thead><tr><th>التاريخ</th><th>التفاصيل</th><th>داخل الصندوق</th><th>خارج الصندوق</th><th>المصروفات العامة</th></tr></thead><tbody>' + body +
        '</tbody><tfoot><tr><th colspan="2">المجموع</th><td>' + cell('tIn', 'إجمالي داخل الصندوق') + '</td><td>' + cell('tOut', 'إجمالي خارج الصندوق') + '</td><td>' + cell('tGen', 'إجمالي المصروفات العامة') + '</td></tr></tfoot></table></div>';
      return { questions: q, html };
    }
  };

  /* ------------------------------------------------------------------ */
  /* Engine                                                             */
  /* ------------------------------------------------------------------ */
  const cell = (id, label) => '<div class="tcell"><input class="tin" type="text" inputmode="decimal" autocomplete="off" data-siyb-numeric="true" data-q="' + id +
    '" aria-label="' + esc(label) + '"><div class="tfb" data-fb="' + id + '"></div></div>';

  const stepsHTML = (q) => '<div class="tsteps"><div>' + esc(q.steps[0]) + '</div><div class="tnum" dir="ltr">' + esc(q.steps[1]) + '</div></div>';

  function shell(ex) {
    return '<div class="training-banner"><span class="tb-icon" aria-hidden="true">✎</span><div><b>وضع التدريب</b> — أدخل إجاباتك في الخانات الفارغة ثم اضغط «تحقق من الإجابة». لا تظهر النتائج إلا بعد التحقق.</div></div>' +
      '<div class="layout"><section><div class="card training-card"><div class="cardhead"><div><h2>' + esc(ex.title) + '</h2><p>' + esc(ex.desc) + '</p></div><span class="tag">TRAINING MODE</span></div><div class="body">' +
      '<div class="callout">' + esc(ex.task) + '</div>' +
      '<div class="training-actions">' +
      '<button type="button" class="tbtn primary" data-act="check">تحقق من الإجابة</button>' +
      '<button type="button" class="tbtn" data-act="solution">عرض الحل النموذجي</button>' +
      '<button type="button" class="tbtn" data-act="reset">إعادة المحاولة</button>' +
      '<span class="tsep"></span>' +
      '<label class="tseed">رقم مجموعة الأرقام <input class="tseed-input" type="text" inputmode="numeric" data-act="seed" placeholder="أرقام الشرائح"></label>' +
      '<button type="button" class="tbtn" data-act="new">أرقام جديدة</button>' +
      '<button type="button" class="tbtn" data-act="slides">أرقام الشرائح</button>' +
      '</div><div class="tset" data-role="set"></div><div data-role="body"></div>' +
      '<p class="hint">للمدرب: اكتب رقم المجموعة نفسه عند جميع المتدربين ليحصلوا على الأرقام نفسها، أو اضغط «أرقام جديدة» ثم أعطِهم الرقم الظاهر.</p></div></div></section>' +
      '<aside><div class="card summary-card"><div class="cardhead"><div><h2>تقدّم المتدرب</h2><p>نتيجة التحقق من الإجابات</p></div><span class="tag">TRAINING</span></div><div class="body">' +
      '<div class="metrics">' +
      '<div class="metric blue"><div class="mlabel">عدد الخانات المطلوبة</div><div class="mvalue" data-k="total">—</div></div>' +
      '<div class="metric green"><div class="mlabel">إجابات صحيحة</div><div class="mvalue" data-k="ok">—</div></div>' +
      '<div class="metric orange"><div class="mlabel">إجابات خاطئة أو فارغة</div><div class="mvalue" data-k="wrong">—</div></div>' +
      '<div class="metric neutral"><div class="mlabel">النتيجة</div><div class="mvalue" data-k="score">—</div></div></div>' +
      '<div class="divider"></div><div class="rows">' +
      '<div class="rowline"><span>تمت الإجابة على</span><strong data-k="answered">—</strong></div><div class="bar"><span class="blue" data-k="barAnswered"></span></div>' +
      '<div class="rowline"><span>نسبة الإجابات الصحيحة</span><strong data-k="okPct">—</strong></div><div class="bar"><span class="green" data-k="barOk"></span></div></div>' +
      '<div class="callout tstatus" data-k="status"></div></div></div></aside></div>';
  }

  const $k = (st, k) => st.container.querySelector('[data-k="' + k + '"]');
  const setBar = (el, v) => { if (el) el.style.width = Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0)) + '%'; };
  const refresh = (st) => { if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(st.container); };

  function updateSummary(st) {
    const total = st.q.length;
    const answered = st.q.filter((q) => (st.answers[q.id] || '').trim() !== '').length;
    const res = st.q.map((q) => st.results[q.id]);
    const ok = res.filter((r) => r === 'ok').length;
    const wrong = res.filter((r) => r === 'bad' || r === 'empty').length;
    const evaluated = ok + wrong;
    $k(st, 'total').textContent = fmt(total, 0);
    $k(st, 'answered').textContent = fmt(answered, 0) + ' / ' + fmt(total, 0);
    setBar($k(st, 'barAnswered'), total ? answered / total * 100 : 0);
    if (st.checked && evaluated) {
      const pct = ok / total * 100;
      $k(st, 'ok').textContent = fmt(ok, 0);
      $k(st, 'wrong').textContent = fmt(wrong, 0);
      $k(st, 'score').textContent = fmt(Math.round(pct), 0) + '%';
      $k(st, 'okPct').textContent = fmt(Math.round(pct), 0) + '%';
      setBar($k(st, 'barOk'), pct);
    } else {
      ['ok', 'wrong', 'score', 'okPct'].forEach((k) => { $k(st, k).textContent = '—'; });
      setBar($k(st, 'barOk'), 0);
    }
    let msg;
    if (st.solution) msg = 'الحل النموذجي معروض للمدرب. اضغط «إخفاء الحل» للعودة إلى إجابات المتدرب.';
    else if (!st.checked) msg = 'أدخل إجاباتك ثم اضغط «تحقق من الإجابة».';
    else if (st.dirty) msg = 'عدّلت بعض الإجابات بعد التحقق؛ اضغط «تحقق من الإجابة» لتحديث النتيجة.';
    else if (wrong === 0) msg = 'أحسنت! جميع الإجابات صحيحة.';
    else msg = 'راجع الخانات المعلّمة بالبرتقالي: تحت كل واحدة الجواب الصحيح وخطوات الحساب.';
    $k(st, 'status').textContent = msg;
  }

  function paint(st) {
    st.q.forEach((q) => {
      const inp = st.container.querySelector('.tin[data-q="' + q.id + '"]');
      const fb = st.container.querySelector('.tfb[data-fb="' + q.id + '"]');
      if (!inp || !fb) return;
      inp.classList.remove('ok', 'bad', 'empty', 'sol');
      fb.innerHTML = '';
      if (st.solution) {
        inp.value = raw(q.ans, q.dec); inp.disabled = true; inp.classList.add('sol'); fb.innerHTML = stepsHTML(q);
        return;
      }
      inp.disabled = false;
      inp.value = st.answers[q.id] || '';
      const r = st.checked ? st.results[q.id] : null;
      if (r === 'ok') { inp.classList.add('ok'); fb.innerHTML = '<span class="tfb-ok">✓ صحيح</span>'; }
      else if (r === 'bad') { inp.classList.add('bad'); fb.innerHTML = '<span class="tfb-bad">✗ الصحيح: ' + raw(q.ans, q.dec) + '</span>' + stepsHTML(q); }
      else if (r === 'empty') { inp.classList.add('empty'); fb.innerHTML = '<span class="tfb-bad">لم تُجب. الصحيح: ' + raw(q.ans, q.dec) + '</span>' + stepsHTML(q); }
    });
    const sb = st.container.querySelector('[data-act="solution"]');
    sb.textContent = st.solution ? 'إخفاء الحل' : 'عرض الحل النموذجي';
    sb.classList.toggle('active', st.solution);
    updateSummary(st);
    refresh(st);
  }

  function rebuild(st) {
    const built = st.ex.build(st.seed, cell);
    st.q = built.questions;
    st.answers = {}; st.results = {}; st.checked = false; st.solution = false; st.dirty = false;
    st.container.querySelector('[data-role="body"]').innerHTML = built.html;
    st.container.querySelector('[data-role="set"]').textContent = st.seed ? 'مجموعة الأرقام الحالية: رقم ' + st.seed : 'مجموعة الأرقام الحالية: أرقام الشرائح الأصلية';
    st.container.querySelector('.tseed-input').value = st.seed ? String(st.seed) : '';
    st.container.querySelector('[data-act="slides"]').disabled = !st.seed;
    paint(st);
  }

  function check(st) {
    st.checked = true; st.solution = false; st.dirty = false;
    st.q.forEach((q) => {
      const v = (st.answers[q.id] || '').trim();
      st.results[q.id] = v === '' ? 'empty' : (Math.abs(parse(v) - q.ans) <= q.tol ? 'ok' : 'bad');
    });
    paint(st);
  }

  function bind(container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      const st = container._st;
      if (!btn || !st) return;
      const act = btn.dataset.act;
      if (act === 'check') check(st);
      else if (act === 'solution') { st.solution = !st.solution; paint(st); }
      else if (act === 'reset') { st.answers = {}; st.results = {}; st.checked = false; st.solution = false; st.dirty = false; paint(st); }
      else if (act === 'new') { st.seed = 1000 + Math.floor(Math.random() * 9000); rebuild(st); }
      else if (act === 'slides') { st.seed = 0; rebuild(st); }
    });
    container.addEventListener('change', (e) => {
      const st = container._st;
      if (!st || !e.target.matches('.tseed-input')) return;
      const n = Math.floor(parse(e.target.value));
      st.seed = n > 0 ? n : 0;
      rebuild(st);
    });
    container.addEventListener('input', (e) => {
      const st = container._st;
      if (!st || !e.target.matches('.tin')) return;
      const id = e.target.dataset.q;
      st.answers[id] = e.target.value;
      if (st.checked && st.results[id]) {
        delete st.results[id]; st.dirty = true;
        e.target.classList.remove('ok', 'bad', 'empty');
        const fb = container.querySelector('.tfb[data-fb="' + id + '"]');
        if (fb) fb.innerHTML = '';
      }
      updateSummary(st);
    });
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('.tin')) return;
      e.preventDefault();
      const all = Array.from(container.querySelectorAll('.tin:not(:disabled)'));
      const next = all[all.indexOf(e.target) + 1];
      if (next) next.focus();
    });
  }

  function mount(container, key) {
    const ex = EX[key];
    if (!container || !ex) return;
    const st = { container, key, ex, seed: 0, q: [], answers: {}, results: {}, checked: false, solution: false, dirty: false };
    container._st = st;
    container.innerHTML = shell(ex);
    if (!container.dataset.bound) { container.dataset.bound = '1'; bind(container); }
    rebuild(st);
  }

  window.SIYBTraining = { mount, exercises: Object.keys(EX) };
})();
