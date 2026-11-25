/* IYB Planning – Assessments 1 and 2 (Phase 2). Questions, options and the answer key are transcribed from the
   original manual (Assessment 1 p.12–13, Assessment 2 p.26–27, Assessment 3 p.36; answers p.97). Option values are LETTERS (a/b/c, A–F) so
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
  A.a3 = {
    id: 'a3', no: 3, pg: '36', ansPg: '97',
    intro: B('لقد أنهيت الجزء الثالث من هذا الدليل. جرّب التمرين أدناه للتحقق من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات.', 'You have just completed Part III of this manual. Try the exercise below to check your understanding. Finish the exercise before comparing your answers with the answers.'),
    parts: [{ title: B('أي إجابة صحيحة؟', 'Which one is correct?'), hint: B('ضع دائرة حول النهاية الصحيحة أو الأفضل لكل جملة.', 'Circle the correct or best ending for each sentence.'), items: [
      mcq('m1', B('التوقّع يخبرك …', 'A forecast tells you...'), mc3(B('بما يُرجَّح أن يحدث في المستقبل.', 'what is likely to happen in the future.'), B('بالربح الذي حققته العام الماضي.', 'what profit you made last year.'), B('عن الماضي.', 'about the past.')), 'a'),
      mcq('m2', B('عند توقّع التغيّرات في البيئة الخارجية …', 'When you forecast changes in the external environment...'), mc3(B('ركّز على التغيّرات الكبيرة.', 'focus on big changes.'), B('ركّز على التغيّرات التي قد تؤثر في مشروعك.', 'focus on changes that may affect your business.'), B('حاول تحديد كل التغيّرات الممكنة.', 'try to identify all possible changes.')), 'b'),
      mcq('m3', B('ينبغي أن تبني توقعك على …', 'You should base your forecast on...'), mc3(B('أمنياتك.', 'your wish.'), B('سجلاتك السابقة.', 'your past records.'), B('الحقائق.', 'facts.')), 'c')] }] };
  const tick = (id, q, truth, why) => ({ id, type: 'tick', q, truth, why });
  A.a4 = {
    id: 'a4', no: 4, pg: '42', ansPg: '97',
    intro: B('لقد أنهيت الجزء الرابع من هذا الدليل. أجرِ التمرين أدناه للتحقق من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات.', 'You have just completed Part IV of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with the answers.'),
    parts: [{ title: B('صح أم خطأ', 'True or False'), hint: B('ضع علامة أمام الجملة الصحيحة (يمكن أن تكون أكثر من جملة).', 'Tick the sentence that is true.'), items: [
      tick('t1', B('إذا كان أداء مشروعك جيداً فاحتمال وقوع أحداث ذات أثر سلبي أقل، ولذلك ليس من الضروري أن يدير مشروعك المخاطر.', 'If your business is performing well, it is less likely that events will occur that have a negative impact and therefore, it is not necessary for your business to manage risks.'), false,
        B('إدارة المخاطر ضرورية دائماً لأن الأحداث غير المواتية قد تقع في أي وقت وفي أي مشروع.', 'Managing risk is always necessary because unfavourable events can occur at any time in any business.')),
      tick('t2', B('تساعد إدارة المخاطر مشروعك على تحديد كل المخاطر التي يتعرض لها الآن وفي المستقبل ليتمكن من تجنب كل المخاطر أو التخفيف منها.', 'Risk Management helps your business identify all the risks to which it is exposed now and in the future so that it can avoid or mitigate all the risks.'), false,
        B('الغرض من إدارة المخاطر ليس تجنب كل المخاطر، بل ضمان أن تُتَّخذ المخاطر عن وعي بمعرفة كاملة وفهم واضح للاستجابات المناسبة.', 'The purpose of Risk Management is not to avoid all risks but to ensure that risks are consciously taken with a complete knowledge and clear understanding of the appropriate responses to take.')),
      tick('t3', B('ينبغي أن تحصل المخاطر ذات الأثر الأكبر والاحتمال الأعلى على أعلى أولوية.', 'Risks with the greatest impact and the highest likelihood should get the highest priority.'), true,
        B('ينبغي أن تعطي الأولوية للمخاطر الأشد خطورة على مشروعك.', 'You should prioritize the risks that are most dangerous to your business.')),
      tick('t4', B('ينبغي للمشاريع أن تقبل المخاطر الأقل احتمالاً للوقوع.', 'Businesses should accept risks that are less likely to occur.'), false,
        B('ليس من الحكمة قبول المخاطر ذات الأثر الكبير في مشروعك حتى لو كان احتمال وقوعها منخفضاً. والتقليل أو النقل استجابة أنسب.', 'It is not a good idea to accept risks which have a significant impact on your business even if the possibility of occurrence is low. Reducing or transferring will be a more appropriate response.')),
      tick('t5', B('لتحديد الاستجابة المناسبة لخطر ما يجب تقييم احتمال وقوعه وأثره.', 'To determine the appropriate response to a risk, one must assess its likelihood and impact.'), true,
        B('تذكّر أن تتبع الخطوات الأربع لعملية إدارة المخاطر ولا تتسرع في الاستجابة لخطر قبل إجراء التقييم.', 'Remember to follow the four steps of the Risk Management process and do not rush to respond to a risk before making an assessment.'))] }] };
  A.a5 = {
    id: 'a5', no: 5, pg: '84–85', ansPg: '97',
    intro: B('لقد أنهيت الجزء الخامس من هذا الدليل. أجرِ التمرين أدناه للتحقق من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات.', 'You have just completed Part V of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 97.'),
    parts: [{ title: B('أي إجابة صحيحة؟', 'Which one is correct?'), hint: B('ضع دائرة حول النهاية الصحيحة أو الأفضل لكل جملة.', 'Circle the correct or best ending for each sentence.'), items: [
      mcq('m1', B('عند إعداد خطط مشروعك ينبغي أن تبدأ بـ …', 'When making plans for your business, you should start with...'), mc3(B('سجلات المشروع السابقة.', 'past business records.'), B('الأهداف التي يريد مشروعك تحقيقها.', 'the objectives your business wants to achieve.'), B('توقعات العام القادم.', 'forecasts for the next year.')), 'b'),
      mcq('m2', B('ينبغي أن تتضمن كل خطط المشروع …', 'All plans for a business should have built-in...'), mc3(B('خطة المبيعات والتسويق.', 'Sales and Marketing Plan.'), B('خطة التدفق النقدي.', 'Cash Flow Plan.'), B('استراتيجيات إدارة المخاطر.', 'Risk Management strategies.')), 'c'),
      mcq('m3', B('عند إعداد خطة المبيعات والتسويق لمشروعك تفكّر في …', 'When you make a Sales and Marketing Plan for your business, you think about...'), mc3(B('تحسين أنشطتك التسويقية.', 'improving your marketing activities.'), B('خفض نفقاتك العامة.', 'reducing your Overhead Expenses.'), B('زيادة أجور موظفيك.', 'increasing wages for your employees.')), 'a'),
      mcq('m4', B('عند توقّع نفقاتك العامة الشهرية …', 'When you forecast your monthly Overhead Expenses,...'), mc3(B('تخمّن المبلغ للعام القادم.', 'you guess the amount for next year.'), B('تستخدم المبالغ نفسها كما في هذا العام.', 'you use the same amounts as this year.'), B('تضع التوقع بناءً على التغيّرات التي قد تؤثر في التكاليف في العام القادم.', 'you make the forecast based on changes that may affect the costs next year.')), 'c'),
      mcq('m5', B('لتوقّع تكاليف المواد الشهرية للعام القادم …', 'To forecast your monthly Material Costs for the next year, you...'), mc3(B('تتوقع تكلفة المواد للوحدة وكمية الإنتاج الشهرية.', 'forecast the Material Cost per item and the amount of monthly production.'), B('تتوقع إجمالي تكلفة المواد للعام القادم وتقسمه على 12 شهراً.', 'forecast the total Material Cost for next year and divide it by 12 months.'), B('تضع تقديراً بناءً على توقع مبيعاتك لأن تكاليفك تتناسب طردياً مع حجم مبيعاتك.', 'make an estimation based on your sales forecast because your costs are directly proportional to the amount of sales you will make.')), 'a'),
      mcq('m6', B('لإعداد خطة التكاليف، يتوقع تجار التجزئة والجملة …', 'To make a cost plan, retailers and wholesalers forecast...'), mc3(B('تكاليف المواد والنفقات العامة.', 'Material Costs and Overhead Expenses.'), B('تكلفة العمالة والمواد.', 'the cost of labour and material.'), B('تكلفة العمالة والنفقات العامة.', 'the cost of labour and the Overhead Expenses.')), 'a'),
      mcq('m7', B('ستساعدك خطة التدفق النقدي على …', 'A Cash Flow Plan will help you to...'), mc3(B('زيادة المبيعات.', 'increase sales.'), B('معرفة مقدار النقد الذي سيدخل مشروعك ويخرج منه في المستقبل.', 'know how much cash will come into and go out of your business in the future.'), B('معرفة مقدار النقد الذي تدين به لمورّديك.', 'know how much cash you owe your suppliers.')), 'b'),
      mcq('m8', B('تبيّن لك خطة الحصول على قرض …', 'A Loan Access Plan shows you...'), mc3(B('الطرق المختلفة للحصول على مال إضافي لمشروعك.', 'the different ways to get additional money for your business.'), B('كيف تحسب المؤسسات المالية الفائدة.', 'how financial institutions calculate interest.'), B('مقدار الفائدة التي سيدفعها مشروعك على القرض.', 'the amount of interest your business will have to pay for the loan.')), 'c')] }] };
  // Pure scoring helper (no DOM): answers = {itemId: value}; returns per-item correctness and totals.
  A.score = (assess, answers) => {
    const per = {}; let correct = 0; let total = 0; let answered = 0;
    let anyTick = false; let ticks = 0;
    assess.parts.forEach((pt) => pt.items.forEach((it) => {
      total++; const v = answers && answers[it.id];
      if (it.type === 'tick') { ticks++; if (v === 'T') anyTick = true; per[it.id] = ((v === 'T') === it.truth) ? 'right' : 'wrong'; if (per[it.id] === 'right') correct++; return; }
      if (v) answered++;
      per[it.id] = !v ? 'blank' : (v === it.key ? 'right' : 'wrong'); if (per[it.id] === 'right') correct++;
    }));
    // Tick-box items: an unticked box is a valid answer ("false"), so the assessment counts as attempted once at least one box is ticked.
    if (ticks) answered += anyTick ? ticks : 0;
    return { per, correct, total, answered };
  };
})();
