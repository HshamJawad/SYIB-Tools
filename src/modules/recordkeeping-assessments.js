/* IYB Record Keeping - Assessments 1-3 (data + scoring engine + renderer). Wording and answer keys come from the English manual
   (Assessment 1 p.09, Assessment 2 pp.46-47, Assessment 3 pp.60-61; answers on p.71). Arabic is a PRELIMINARY translation.
   Scoring is 1 point per item. No pass mark or grading band is defined by the source, so none is invented.
   Answer keys live only in this file's data; they are written into the DOM only after the learner submits. */
(() => {
  'use strict';
  const B = (ar, en) => ({ ar, en });
  const store = window.SIYBRecordKeepingStore;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const TF = { t: B('صحيح', 'True'), f: B('خطأ', 'False') };
  const MC = (id, ar, en, opts, key) => ({ id, stem: B(ar, en), opts: opts.map((o) => B(o[0], o[1])), key });
  const WORDS2 = [['credit', B('الأجل (Credit)', 'Credit')], ['overhead', B('النفقات العامة', 'Overhead Expenses')], ['dcsr', B('سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record')],
    ['material', B('تكاليف المواد', 'Material Costs')], ['car', B('سجل حسابات العملاء', 'Customers’ Accounts Record')], ['receipt', B('الإيصال', 'Receipt')]];
  const WORDS3 = [['np', B('صافي الربح', 'Net Profit')], ['liab', B('الالتزام', 'Liability')], ['pl', B('قائمة الأرباح والخسائر', 'Profit and Loss Statement')],
    ['gp', B('الربح الإجمالي', 'Gross Profit')], ['assets', B('الأصول', 'Assets')], ['bs', B('قائمة المركز المالي', 'Balance Sheet')]];

  const DATA = {
    a1: { id: 'a1', part: 'p1', no: 1, page: '09', pageAns: '71',
      title: B('التقييم 1', 'Assessment 1'),
      intro: B('أكملتَ الجزء الأول من هذا الدليل. جرّب التمرين التالي لتتحقق من فهمك. أنهِ التمرين قبل مقارنة إجاباتك. اختر «صحيح» أو «خطأ» لكل عبارة.', 'You have just completed Part I of this manual. Try the exercise below to check your understanding. Finish the exercise before comparing your answers. Choose True or False for each statement.'),
      sections: [{ id: 's', kind: 'tf', title: B('صحيح أم خطأ', 'True or False'), items: [
        { id: 't1', stem: B('السجلات المكتوبة مهمة للمشاريع الكبيرة فقط. في مشروعي أتذكر دائماً جميع المعاملات.', 'Written records are only important to big businesses. In my business, I always remember all the transactions.'), key: 'f' },
        { id: 't2', stem: B('سجلات الأعمال مهمة لإدارة العلاقات مع مورّديّ وزبائني.', 'Business records are important for managing relationships with my suppliers and customers.'), key: 't' },
        { id: 't3', stem: B('مسك سجلات العمل يعني تسجيل كل الأموال التي تدخل مشروعي أو تخرج منه فقط.', 'Keeping business records means recording all the money that comes in or goes out of my business only.'), key: 'f' },
        { id: 't4', stem: B('من أهم أسباب مسك المشاريع للسجلات استخدامها لتحديد المشكلات التي تواجه مشاريعها.', 'One of the most important reasons for businesses to keep records is to use them to identify problems with their businesses.'), key: 't' },
        { id: 't5', stem: B('قد يكون مسك السجلات مطلباً قانونياً لمشروعك.', 'Record keeping might be a legal requirement for your business.'), key: 't' }
      ] }] },
    a2: { id: 'a2', part: 'p2', no: 2, page: '46–47', pageAns: '71',
      title: B('التقييم 2', 'Assessment 2'),
      intro: B('أكملتَ الجزء الثاني من هذا الدليل. أجرِ التمرينين التاليين لتتحقق من فهمك. أنهِ التمرينين قبل مقارنة إجاباتك.', 'You have just completed Part II of this manual. Do the two exercises below to check your understanding. Finish the exercises before comparing your answers.'),
      sections: [
        { id: 'f', kind: 'fill', title: B('التمرين 1: تدرّب على لغة عملك', 'Exercise 1: Practise your business language'),
          intro: B('بعض الكلمات ناقصة في هذه القصة. أكمل كل جملة باختيار الكلمة الصحيحة من القائمة.', 'Some words are missing from this story. Complete each sentence by choosing the right word from the list.'),
          words: WORDS2,
          lines: [
            B('تارا هي صاحبة مكتبة Tara Book Shop. قررت أن تسافر في عطلة مدة شهر. وقبل مغادرتها، أرت مساعدها أونما كيف يمسك سجلات المشروع.', 'Tara is the owner of Tara Book Shop. She decided to go on holiday for a month. Before she left, she showed her assistant Unma how to keep records for the business.'),
            B('تارا: نبيع سلعاً رخيصة كثيرة. عندما يدفع الزبائن نقداً، اكتب مبلغ البيع في {1}. افعل ذلك فوراً. وإذا انتظرت فقد تنسى.', 'Tara: We sell many inexpensive goods. When customers pay by cash, write down the amount of the sale on the {1}. Do it immediately. If you wait, you may forget.'),
            B('أونما: إذا اشترى زبون بالأجل، فهل أسجّل ذلك البيع في المكان نفسه؟', 'Unma: If a customer buys on credit, should I record that sale in the same place?'),
            B('تارا: لا، لأن البيع بالأجل لا يعني نقداً وارداً في ذلك اليوم. بل يجب أن تكتب تفاصيل البيع بالأجل في {2}.', 'Tara: No, because a credit sale does not mean cash in for that day. Instead you must write down the details of the credit sale in the {2}.'),
            B('أونما: هل أطلب من المدرسة الثانوية أن تدفع نقداً ثمن طلباتها؟', 'Unma: Should I ask the secondary school to pay cash for their orders?'),
            B('تارا: لا، فقد اتفقتُ معهم على أن يشتروا بـ{3} لأنهم زبائن جيدون. فهم يشترون منا كثيراً ويدفعون دائماً في نهاية كل شهر.', 'Tara: No, I agreed to let them buy on {3} because they are good customers. They buy a lot from us and they always pay at the end of each month.'),
            B('أونما: سيسلّم المورّد طلبيتنا القادمة من الدفاتر والأقلام أثناء غيابك. أين أكتب ذلك؟', 'Unma: The supplier will deliver our next order of notebooks and pencils when you are away. Where should I write that down?'),
            B('تارا: ادفع للمورّد نقداً واحتفظ بـ{4} الذي يعطيك إياه كإثبات للدفع. وعندما تملأ السجل الأساسي في المساء، يجب أن تكتب المبلغ في موضعين: أولاً تحت «النقد الصادر» ثم تحت {5}.', 'Tara: Pay the supplier with cash and keep the {4} he gives you as proof of payment. When you fill in the Basic Record Book that evening, you must write the amount in two places, first under “Cash out” and then under {5}.'),
            B('أونما: عندما أدفع لنفسي في نهاية الشهر، يجب أن أدخل المبلغ في السجل الأساسي تحت «النقد الصادر» وفي عمود آخر. هل أكتبه تحت «تكاليف العمالة»؟', 'Unma: When I pay myself at the end of the month, I must enter the amount in the Basic Record Book under “Cash out” and in one other column. Should I write it under “Labour Costs”?'),
            B('تارا: لا يا أونما! راتبك هو {6} لمشروعي. وهذا هو العمود الآخر الذي يجب أن تكتب فيه المبلغ.', 'Tara: No, Unma! Your salary is an {6} for my business. That is the other column where you must write down the amount.')
          ],
          keys: ['dcsr', 'car', 'credit', 'receipt', 'material', 'overhead'] },
        { id: 'm', kind: 'mc', title: B('التمرين 2: أيّ الإجابات صحيحة؟', 'Exercise 2: Which one is correct?'),
          intro: B('اختر التكملة الصحيحة أو الأفضل لكل جملة.', 'Choose the correct or best ending for each sentence.'),
          items: [
            MC('m1', 'لكي تكون سجلات عملك دقيقة، يجب أن تكتب…', 'For accurate business records, you must write down...', [['المبيعات النقدية والمشتريات النقدية فقط.', 'cash sales and cash purchases only.'], ['كل الأموال الداخلة والخارجة.', 'all the money coming in and going out.'], ['المبيعات والمشتريات بالأجل فقط.', 'credit sales and purchases only.']], 'b'),
            MC('m2', 'تودع مبلغاً من صندوق النقد في حساب مشروعك المصرفي. في نهاية اليوم تُدخل المبلغ في سجلك الأساسي تحت…', 'You deposit some money from your cash box into your business bank account. At the end of the day, you enter the amount in your Basic Record Book under...', [['«المصرف الوارد» و«النقد الصادر».', '“Bank in” and “Cash out”.'], ['«المصرف الوارد» و«المبيعات».', '“Bank in” and “Sales”.'], ['«المصرف الوارد» دون أي قيد آخر.', '“Bank in” and no other entry.']], 'a'),
            MC('m3', 'مستند الإثبات (Voucher) هو…', 'A voucher is...', [['طريقة بسيطة لحساب الربح.', 'a simple way of calculating profit.'], ['طريقة لكتابة المبلغ دائماً في عمودين مختلفين في السجل الأساسي.', 'a way of always writing the amount in two different columns in your Basic Record Book.'], ['إيصال أو أي إثبات آخر للمعاملة.', 'a receipt or any other proof of transaction.']], 'c'),
            MC('m4', 'من المهم الاحتفاظ بسجل حسابات العملاء لأنه يساعدك على معرفة…', 'It is important to keep a Customers’ Accounts Record because it helps you to know...', [['كم من المال تنفقه على المواد.', 'how much money you spend on materials.'], ['كم من المال يدين به زبون معيّن لمشروعك.', 'how much money a certain customer owes your business.'], ['كم من المال تدين به لمورّديك.', 'how much money you owe your suppliers.']], 'b'),
            MC('m5', 'يدفع زبون نقداً ثمن كيس سكر. يكتب صاحب المتجر ذلك فوراً في…', 'A customer pays cash for a bag of sugar. The store owner immediately writes it down in the...', [['السجل الأساسي.', 'Basic Record Book.'], ['سجل حسابات العملاء.', 'Customers’ Accounts Record.'], ['سجل المبيعات النقدية اليومية.', 'Daily Cash Sales Record.']], 'c')
          ] }
      ] },
    a3: { id: 'a3', part: 'p3', no: 3, page: '60–61', pageAns: '71',
      title: B('التقييم 3', 'Assessment 3'),
      intro: B('أكملتَ الجزء الثالث من هذا الدليل. أجرِ التمرينين التاليين لتتحقق من فهمك. أنهِ التمرينين قبل مقارنة إجاباتك.', 'You have just completed Part III of this manual. Do the two exercises below to check your understanding. Finish the exercises before comparing your answers.'),
      sections: [
        { id: 'f', kind: 'fill', title: B('التمرين 1: تدرّب على لغة عملك', 'Exercise 1: Practise your business language'),
          intro: B('أكمل كل جملة باختيار الكلمة الصحيحة من القائمة.', 'Complete each sentence by choosing the right word from the list.'),
          words: WORDS3,
          lines: [
            B('إذا طرحتَ النفقات العامة من {1}، فستحصل على {2} الذي حققه مشروعك في ذلك الشهر.', 'If you subtract Overhead Expenses from your {1}, you will get the {2} that your business made that month.'),
            B('القرض أو الفاتورة التي لم تُدفع بعد لمورّد هو {3} على مشروعك.', 'A loan or a bill that has not yet been paid to a supplier is a {3} of your business.'),
            B('إذا طرحتَ مقدار التزامات مشروعك من {4}، فستعرف كم تساوي قيمة مشروعك.', 'If you subtract the amount of your business’ liabilities from its {4}, you will know how much your business is worth.'),
            B('تبيّن لك {5} كم لدى مشروعك من أصول وكم يدين به.', 'A {5} shows you how much in assets your business has and how much it owes.'),
            B('لمعرفة ما إذا كان مشروعك يحقق ربحاً أم لا، ينبغي أن تُعدّ {6}.', 'To determine if your business is making a profit or not, you should make a {6}.')
          ],
          keys: ['gp', 'np', 'liab', 'assets', 'bs', 'pl'] },
        { id: 'm', kind: 'mc', title: B('التمرين 2: أيّ الإجابات صحيحة؟', 'Exercise 2: Which one is correct?'),
          intro: B('اختر التكملة الصحيحة أو الأفضل لكل جملة.', 'Choose the correct or best ending for each sentence.'),
          items: [
            MC('m1', 'أفضل طريقة لمعرفة مدى جودة أداء مشروعك هي أن…', 'The best way to find out how well your business is performing is to...', [['تفحص صندوق النقد.', 'check your cash box.'], ['تُعدّ قائمة الأرباح والخسائر.', 'make a Profit and Loss Statement.'], ['تحلّل تكاليفك.', 'analyse your costs.']], 'b'),
            MC('m2', 'ربحك الإجمالي أقل من العام الماضي. من الأسباب المحتملة لذلك أن…', 'Your Gross Profit is lower than last year. A possible reason for this is that...', [['النفقات العامة أعلى مما كانت عليه في العام الماضي.', 'Overhead Expenses are higher than last year.'], ['قررتَ أن تدفع لنفسك راتباً أقل.', 'you decided to pay yourself a smaller salary.'], ['تكاليف المواد لديك أعلى مما كانت عليه في العام الماضي.', 'your Material Costs are higher than last year.']], 'c'),
            MC('m3', 'المال في صندوق النقد في نهاية اليوم أكثر من رصيد النقد في سجلك الأساسي في نهاية اليوم. من الأسباب المحتملة للفرق أن…', 'The money in your cash box at the end of the day is more than the cash balance in your Basic Record Book at the end of the day. A possible reason for the difference is that...', [['شخصاً سرق مالاً من صندوق النقد.', 'someone stole money from the cash box.'], ['ارتكبتَ خطأً عند تسجيل أحد المستندات.', 'you made a mistake when recording a voucher.'], ['نسيتَ أن تحصّل مالاً من زبون.', 'you forgot to get money from a customer.']], 'b'),
            MC('m4', 'تشمل أصول مشروعك…', 'Your business’ assets include...', [['فواتير مورّديك التي لم تُدفع بعد.', 'invoices from your suppliers that have not been paid yet.'], ['مبلغ ضريبة القيمة المضافة الذي عليك تقديمه للحكومة.', 'the amount of VAT you have to submit to the government.'], ['المال الموجود في حسابك المصرفي.', 'the money in your bank account.']], 'c'),
            MC('m5', 'إذا كانت التزامات مشروعك أكثر من أصوله، فإن مشروعك…', 'If your business has more liabilities than assets, your business...', [['في خطر.', 'is in danger.'], ['يؤدي أداءً جيداً.', 'is doing well.'], ['صافي قيمته إيجابي.', 'has a positive net worth.']], 'a')
          ] }
      ] }
  };
  DATA.a1.sections[0].kind = 'tf';
  const BY_PART = { p1: 'a1', p2: 'a2', p3: 'a3' };

  /* ---- scoring (pure) ---- */
    function itemsOf(def) {
    const out = [];
    def.sections.forEach((sec) => {
      if (sec.kind === 'fill') sec.keys.forEach((k, i) => out.push({ sec: sec.id, id: 'b' + (i + 1), key: k }));
      else sec.items.forEach((it) => out.push({ sec: sec.id, id: it.id, key: it.key }));
    });
    return out;
  }
  const keyOf = (sec, id) => sec + '_' + id;
  function score(def, answers) {
    const items = itemsOf(def); let right = 0;
    items.forEach((it) => { const a = (answers || {})[keyOf(it.sec, it.id)]; if (a !== undefined && a !== '' && String(a) === String(it.key)) right++; });
    return { score: right, total: items.length };
  }
  const read = (id) => {
    const s = store.get('assessments.' + id, null);
    const o = s && typeof s === 'object' && !Array.isArray(s) ? s : {};
    return { answers: o.answers && typeof o.answers === 'object' && !Array.isArray(o.answers) ? o.answers : {}, submitted: o.submitted === true, score: Number.isFinite(o.score) ? o.score : null, total: Number.isFinite(o.total) ? o.total : null, attempts: Number.isFinite(o.attempts) ? o.attempts : 0 };
  };
  const allAnswered = (def, answers) => itemsOf(def).every((it) => { const a = answers[keyOf(it.sec, it.id)]; return a !== undefined && a !== ''; });
  const status = (id) => { const r = read(id); return { submitted: r.submitted, score: r.score, total: r.total, attempts: r.attempts }; };

  /* ---- actions ---- */
  function setAnswer(id, k, v) { store.set('assessments.' + id + '.answers.' + k, v); }
  function submit(id) {
    const def = DATA[id]; const r = read(id);
    if (!allAnswered(def, r.answers)) return { ok: false };
    const s = score(def, r.answers);
    store.set('assessments.' + id + '.score', s.score); store.set('assessments.' + id + '.total', s.total); store.set('assessments.' + id + '.submitted', true);
    return { ok: true, ...s };
  }
  function retry(id) { const r = read(id); store.set('assessments.' + id, { answers: {}, submitted: false, score: null, total: null, attempts: r.attempts + 1 }); }

  /* ---- rendering ---- */
  const label = (opts, v) => T((opts.find((o) => o[0] === v) || [])[1]);
  function renderTF(def, sec, r) {
    return sec.items.map((it, n) => {
      const k = keyOf(sec.id, it.id); const a = r.answers[k]; const name = 'rk-' + def.id + '-' + k;
      const ok = r.submitted ? a === it.key : null;
      return `<fieldset class="rk-q${r.submitted ? (ok ? ' ok' : ' bad') : ''}" ${r.submitted ? 'disabled' : ''}><legend><bdi>${n + 1}.</bdi> ${esc(T(it.stem))}</legend>
        ${['t', 'f'].map((i) => `<label class="rk-opt"><input type="radio" name="${name}" value="${i}" data-rk-as="${def.id}" data-k="${k}"${a === i ? ' checked' : ''}> ${esc(T(TF[i]))}</label>`).join('')}
        ${r.submitted ? `<p class="rk-fb" role="note">${ok ? '✔ ' + X('إجابة صحيحة.', 'Correct.') : '✘ ' + X('إجابة غير صحيحة. الإجابة الصحيحة: ', 'Incorrect. Correct answer: ') + esc(T(TF[it.key]))}</p>` : ''}</fieldset>`;
    }).join('');
  }
  function renderMC(def, sec, r) {
    return sec.items.map((it, n) => {
      const k = keyOf(sec.id, it.id); const a = r.answers[k]; const name = 'rk-' + def.id + '-' + k;
      const ok = r.submitted ? a === it.key : null; const L = 'abc';
      return `<fieldset class="rk-q${r.submitted ? (ok ? ' ok' : ' bad') : ''}" ${r.submitted ? 'disabled' : ''}><legend><bdi>${n + 1}.</bdi> ${esc(T(it.stem))}</legend>
        ${it.opts.map((o, i) => `<label class="rk-opt"><input type="radio" name="${name}" value="${L[i]}" data-rk-as="${def.id}" data-k="${k}"${a === L[i] ? ' checked' : ''}> <bdi>${L[i]}.</bdi> ${esc(T(o))}</label>`).join('')}
        ${r.submitted ? `<p class="rk-fb" role="note">${ok ? '✔ ' + X('إجابة صحيحة.', 'Correct.') : '✘ ' + X('إجابة غير صحيحة. الإجابة الصحيحة: ', 'Incorrect. Correct answer: ') + '<bdi>' + it.key + '.</bdi> ' + esc(T(it.opts[L.indexOf(it.key)]))}</p>` : ''}</fieldset>`;
    }).join('');
  }
  function renderFill(def, sec, r) {
    const bank = `<p class="rk-bank"><strong>${X('قائمة الكلمات: ', 'Word list: ')}</strong>${sec.words.map((w) => `<span class="rk-chip">${esc(T(w[1]))}</span>`).join(' ')}</p>`;
    const lines = sec.lines.map((ln) => '<p class="rk-fill">' + esc(T(ln)).replace(/\{(\d)\}/g, (m, d) => {
      const id = 'b' + d; const k = keyOf(sec.id, id); const a = r.answers[k] || ''; const key = sec.keys[d - 1];
      const ok = r.submitted ? a === key : null;
      const opts = `<option value="">${esc(X('اختر…', 'Choose…'))}</option>` + sec.words.map((w) => `<option value="${w[0]}"${a === w[0] ? ' selected' : ''}>${esc(T(w[1]))}</option>`).join('');
      const fb = r.submitted ? `<span class="rk-fb inline" role="note">${ok ? '✔ ' + X('صحيح', 'Correct') : '✘ ' + X('غير صحيح؛ الصحيح: ', 'Incorrect; correct: ') + esc(label(sec.words, key))}</span>` : '';
      return `<span class="rk-blank${r.submitted ? (ok ? ' ok' : ' bad') : ''}"><label><span class="rk-sr">${esc(X('الفراغ ', 'Blank '))}${d}</span><select data-rk-as="${def.id}" data-k="${k}" ${r.submitted ? 'disabled' : ''}>${opts}</select></label><bdi class="rk-blankno">(${d})</bdi>${fb}</span>`;
    }) + '</p>').join('');
    return bank + lines;
  }
  function render(partId) {
    const id = BY_PART[partId]; if (!id) return '';
    const def = DATA[id]; const r = read(id);
    const body = def.sections.map((sec) => `<section class="rk-asec" aria-labelledby="rk-${id}-${sec.id}-h"><h4 id="rk-${id}-${sec.id}-h">${esc(T(sec.title))}</h4><p>${esc(T(sec.intro || ''))}</p>${sec.kind === 'fill' ? renderFill(def, sec, r) : sec.kind === 'mc' ? renderMC(def, sec, r) : renderTF(def, sec, r)}</section>`).join('');
    const sum = r.submitted ? `<div class="rk-score" role="status" tabindex="-1" id="rk-${id}-score"><strong>${X('نتيجتك: ', 'Your score: ')}<bdi>${r.score}</bdi> ${X('من', 'out of')} <bdi>${r.total}</bdi></strong><br><span class="rk-small">${X('نقطة واحدة لكل بند. لا يحدّد الدليل درجة نجاح، ولذلك لا تُعرض حالة نجاح أو رسوب. راجع الإجابات الصحيحة أعلاه؛ وإن شئت فأعد المحاولة.', 'One point per item. The manual defines no pass mark, so no pass/fail status is shown. Review the correct answers above; you may retry.')}</span><br><span class="rk-small">${X('الإجابات الصحيحة مطابقة لصفحة الإجابات في الدليل (ص ', 'The correct answers match the manual’s answers page (p. ')}<bdi>${def.pageAns}</bdi>${X(').', ').')}</span></div>` : '';
    const msg = `<p class="rk-msg" id="rk-${id}-msg" role="alert"></p>`;
    const btns = r.submitted ? `<button type="button" class="rk-btn" data-rk-act="retry" data-id="${id}">${X('إعادة المحاولة', 'Retry')}</button>` : `<button type="button" class="rk-btn primary" data-rk-act="submit" data-id="${id}">${X('تسليم الإجابات', 'Submit answers')}</button>`;
    return `<section class="rk-panel rk-assess" data-assessment="${id}" aria-labelledby="rk-${id}-h"><div class="rk-panel-head"><h3 id="rk-${id}-h">${esc(T(def.title))}</h3><span class="rk-status">${r.submitted ? X('مكتمل', 'Completed') : X('غير مكتمل', 'Not completed')}</span><span class="rk-small">${X('ص ', 'p. ')}<bdi>${def.page}</bdi></span></div><p>${esc(T(def.intro))}</p>${body}${sum}${msg}<div class="rk-actions">${btns}</div></section>`;
  }

  window.SIYBRKAssess = { DATA, BY_PART, render, score, itemsOf, status, setAnswer, submit, retry, read, allAnswered };
})();
