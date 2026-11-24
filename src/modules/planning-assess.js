/* IYB Planning – Assessments 1 and 2 (Phase 2). Questions, options and the answer key are transcribed from the
   original manual (Assessment 1 p.12–13, Assessment 2 p.26–27; answers p.97). Option values are LETTERS (a/b/c, A–F) so
   Arabic-Indic digit conversion can never alter them. Answers are revealed only after the learner checks. */
(() => {
  const B = (ar, en) => ({ ar, en });
  const A = window.SIYB_PYP_ASSESS = {};
  const mcq = (id, q, opts, key) => ({ id, type: 'mcq', q, opts, key });
  const mc3 = (a, b, c) => [{ v: 'a', t: a }, { v: 'b', t: b }, { v: 'c', t: c }];
  const word = [
    { v: 'A', t: B('التخطيط', 'Planning') }, { v: 'B', t: B('خطة المبيعات والتسويق', 'Sales and Marketing Plan') },
    { v: 'C', t: B('خطة الإنتاج والتكاليف', 'Production and Cost Plan') }, { v: 'D', t: B('خطة التدفق النقدي', 'Cash Flow Plan') },
    { v: 'E', t: B('خطة الأرباح', 'Profit Plan') }, { v: 'F', t: B('خطة الحصول على قرض', 'Loan Access Plan') }];
  A.a1 = {
    id: 'a1', no: 1, pg: '12–13', ansPg: '97',
    intro: B('لقد أنهيت الجزء الأول من هذا الدليل. أجب عن التمرينين أدناه للتحقق من فهمك. أنهِ التمرينين قبل مقارنة إجاباتك بالإجابات.', 'You have just completed Part I of this manual. Do the two exercises below to check your understanding. Finish the exercises before comparing your answers with the answers.'),
    parts: [
      { title: B('١. تدرّب على لغة العمل', '1. Practise your business language'), hint: B('أكمل كل جملة باختيار الكلمة أو الكلمات الصحيحة من القائمة:', 'Complete each sentence by choosing the right word or words from the list:'), bank: word, items: [
        { id: 'w1', type: 'word', q: B('التفكير فيما يجب فعله إزاء أمر ما قبل حدوثه، ووضع الخطة لذلك، يسمى …………', 'Thinking and working out what to do about something before it happens is called …………'), key: 'A' },
        { id: 'w2', type: 'word', q: B('عندما تتوقع كم من المال سيحتاج مشروعك إلى اقتراضه، ومتى يحتاج إليه، ومن ستراجع للحصول عليه، فإنك تعدّ …………', 'When you make a forecast of how much money your business will need to borrow, when it is needed and who you will approach for it, you are making a …………'), key: 'F' },
        { id: 'w3', type: 'word', q: B('…………  تساعد مشروعك على إيجاد طرق فعّالة التكلفة لصنع السلع أو تقديم الخدمات.', 'A …………  helps your business to work out cost-effective ways of making goods or services.'), key: 'C' },
        { id: 'w4', type: 'word', q: B('في …………  تتوقع إجمالي الربح وصافي الربح لكل شهر.', 'In a …………  you make a forecast of your Gross and Net Profit for each month.'), key: 'E' },
        { id: 'w5', type: 'word', q: B('…………  تساعدك على التأكد من أن النقد لا ينفد من مشروعك في أي وقت.', 'A …………  helps you to make sure your business does not run out of cash at any time.'), key: 'D' },
        { id: 'w6', type: 'word', q: B('عندما تتوقع السعر الذي سيقبل زبائنك دفعه وميزة المنتج الجديدة التي سيريدونها، فإنك تعدّ …………', 'When you make a forecast of the price your customers will accept to pay and the new product feature your customers will want, you are making a …………'), key: 'B' }] },
      { title: B('٢. أي إجابة صحيحة؟', '2. Which one is correct?'), hint: B('ضع دائرة حول النهاية الصحيحة أو الأفضل لكل جملة.', 'Circle the correct or best ending for each sentence.'), items: [
        mcq('m1', B('التخطيط ضروري …', 'Planning is necessary...'), mc3(B('للمشاريع الكبيرة جداً فقط.', 'for very large businesses only.'), B('للمشاريع الكبيرة والصغيرة.', 'for large and small businesses.'), B('لتجار التجزئة فقط.', 'for retailers only.')), 'b'),
        mcq('m2', B('إعداد خطة …', 'Making a plan will...'), mc3(B('يجبرك على التفكير في كل جزء من مشروعك.', 'force you to think about every part of your business.'), B('يساعدك على معرفة قيمة مشروعك.', 'help you work out how much your business is worth.'), B('يمكّنك من حساب الربح الدقيق الذي سيحققه مشروعك في العام القادم.', 'enable you to calculate the exact profit your business is going to make next year.')), 'a'),
        mcq('m3', B('أنسب مدة لخططك هي …', 'The most suitable period for your plans is...'), mc3(B('ثلاثة أشهر.', 'three months.'), B('سنة واحدة.', 'one year.'), B('أي مدة تناسب مشروعك.', 'whatever period that suits your business.')), 'c'),
        mcq('m4', B('ينبغي تقسيم خططك إلى …', 'Your plans should be divided into...'), mc3(B('أشهر.', 'months.'), B('أرباع سنة.', 'quarters.'), B('سنة كاملة.', 'a whole year.')), 'a'),
        mcq('m5', B('عندما تنتهي من إعداد خططك …', 'When you have worked out your plans...'), mc3(B('اتبعها بدقة.', 'strictly follow the plans.'), B('احتفظ بها في مكان آمن.', 'keep them in a safe place.'), B('راجعها وحدّثها بانتظام.', 'review and update them regularly.')), 'c')] }] };
  A.a2 = {
    id: 'a2', no: 2, pg: '26–27', ansPg: '97',
    intro: B('لقد أنهيت الجزء الثاني من هذا الدليل. جرّب التمرين أدناه للتحقق من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات.', 'You have just completed Part II of this manual. Try the exercise below to check your understanding. Finish the exercise before comparing your answers with the answers.'),
    parts: [{ title: B('أي إجابة صحيحة؟', 'Which one is correct?'), hint: B('ضع دائرة حول النهاية الصحيحة أو الأفضل لكل جملة.', 'Circle the correct or best ending for each sentence.'), items: [
      mcq('m1', B('لإجراء تحليل للمشروع تحتاج إلى …', 'To do a Business Analysis, you need...'), mc3(B('كثير من النقد.', 'lots of cash.'), B('مبيعات بالآجل.', 'credit sales.'), B('معلومات من سجلاتك.', 'information from your records.')), 'c'),
      mcq('m2', B('لمعرفة أسباب التغيّر في مبيعاتك ينبغي أن …', 'To find out the reasons for changes in your sales, you should...'), mc3(B('تدرس أرقام مبيعاتك السابقة بعناية.', 'carefully study your past sales figures.'), B('تحلّل أثر تسويقك هذا العام.', 'analyse the effect of your marketing this year.'), B('تسأل زبائنك.', 'ask your customers.')), 'b'),
      mcq('m3', B('لمعرفة هل تغيّر تكلفتك جيد أم سيئ ينبغي أن …', 'To find out if a change in your cost is good or bad, you should...'), mc3(B('تقارن التكلفة لكل وحدة.', 'compare the cost per item.'), B('تنظر إلى مبيعاتك لأن التكلفة تتناسب دائماً مع المبيعات.', 'look at your sales as the cost is always proportional to sales.'), B('زيادات التكلفة سيئة دائماً.', 'cost increases are always bad.')), 'a'),
      mcq('m4', B('الغرض من تحليل المشروع هو …', 'The purpose of a Business Analysis is...'), mc3(B('وضع خطط للتحسين.', 'to make plans for improvement.'), B('فهم كيف كان أداء مشروعك في الماضي.', 'to understand how your business performed in the past.'), B('كلا الإجابتين أعلاه صحيحة.', 'both of the above are correct.')), 'c'),
      mcq('m5', B('عند إجراء تحليل المشروع تستخدم …', 'When doing a Business Analysis, you use...'), mc3(B('سجلات مشروعك للعام الماضي.', 'your business records from last year.'), B('سجلات مشروعك لهذا العام.', 'your business records from this year.'), B('سجلاتك السابقة.', 'your past records.')), 'c')] }] };
  // Pure scoring helper (no DOM): answers = {itemId: value}; returns per-item correctness and totals.
  A.score = (assess, answers) => {
    const per = {}; let correct = 0; let total = 0; let answered = 0;
    assess.parts.forEach((pt) => pt.items.forEach((it) => {
      total++; const v = answers && answers[it.id]; if (v) answered++;
      per[it.id] = !v ? 'blank' : (v === it.key ? 'right' : 'wrong'); if (per[it.id] === 'right') correct++;
    }));
    return { per, correct, total, answered };
  };
})();
