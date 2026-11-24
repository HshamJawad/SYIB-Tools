/* IYB Planning – Part IV content ("Managing Risk", printed pp. 37–42).
   Source: ILO (2015), verified against the original PDF. Arabic = PRELIMINARY translation. Examples are the manual's own.
   The risk register follows the manual's Activity 6 form (Risk, Likelihood, Frequency, Impact, Priority, Actions); the app adds
   only optional, clearly labelled helper fields and defines NO scoring formula, scale or classification. */
(() => {
  const B = (ar, en) => ({ ar, en });
  const p = (ar, en) => ({ t: 'p', x: B(ar, en) });
  const h = (ar, en) => ({ t: 'h', x: B(ar, en) });
  const ul = (items) => ({ t: 'ul', items: items.map((i) => B(i[0], i[1])) });
  const note = (ar, en) => ({ t: 'note', x: B(ar, en) });
  const app = (ar, en) => ({ t: 'app', x: B(ar, en) });
  const C = window.SIYB_PYP_CONTENT = window.SIYB_PYP_CONTENT || {};
  C.p4 = [
    { id: 'intro', pg: '37–38', title: B('ما هي المخاطر؟ وما هي إدارة المخاطر؟', 'What is risk? What is Risk Management?'), blocks: [
      p('يعمل كل مشروع في ظل قدر كبير من عدم اليقين. وعندما تفهم مشروعك والبيئة الخارجية التي يعمل فيها تصبح أقدر على تحديد حالات عدم اليقين. وقد تظهر حالات عدم اليقين في مجمل عمليات تشغيل المشروع، من توريد المدخلات إلى المعالجة والتسويق. ولذلك ينبغي لأصحاب المشاريع ومديريها أن يدركوا حالات عدم اليقين المحتملة وأن يستعدوا لإدارتها قبل وضع خطط محددة للمستقبل.',
        'Every business operates under a lot of uncertainties. When you understand your business and the external environment within which it operates, you are better equipped to identify uncertainties. Uncertainties may occur in the overall business operation processes, from input supplies, to processing and marketing. Therefore, owners and managers of businesses should be aware of the possible uncertainties and be prepared to manage them before making specific plans for the future.'),
      h('1. ما هي المخاطر؟', '1. What is risk?'),
      p('الخطر هو احتمال أن يتعرض مشروعك لخسارة بسبب أحداث غير متوقعة. وفيما يلي بعض أمثلة على حوادث غير متوقعة أصابت مشاريع:', 'Risk is the possibility of your business suffering a loss due to unexpected events. Following are some examples of unexpected incidents that affected the businesses:'),
      ul([
        ['«أُصبت في حادث سير وأنا في المستشفى منذ أسابيع. مشروعي في فوضى لأن موظفيّ لا يستطيعون فعل شيء من دوني.»', '“I was injured in a traffic accident and have been in the hospital for weeks. My business is in chaos because my staff can do nothing without me.”'],
        ['«الحريق الذي وقع الشهر الماضي دمّر ورشتي وكل المعدات. سيتوقف مشروعي ثلاثة أشهر على الأقل.»', '“The fire last month ruined my workshop and all the equipment. My business will be interrupted for three months, at least.”'],
        ['«سمحت الحكومة باستيراد طماطم رخيصة من بلدنا المجاور. التجار يلغون الطلبات. هذا المحصول مهدد بالضياع!!»', '“Government has allowed import of cheap tomatoes from our neighbouring country. Retailers are cancelling orders. This crop is likely to go to waste!!”'],
        ['«تسبب تغيّر المناخ في فيضانات؛ سيُدمَّر محصولنا من الذرة!»', '“Climate change has resulted in flooding; our crop of maize will be destroyed!”'],
        ['«الفيضان قطع الإمدادات عن محالّنا التجارية. ستفرغ المحال غداً ما لم تنخفض مياه الأنهار ونتمكن من عبور الجسر.»', '“For us the flooding has blocked supplies for our retail shops. The shop will be empty by tomorrow, unless the rivers subside and we can cross the bridge.”']]),
      p('قد ينشأ الخطر من داخل المشروع أو من البيئة الخارجية. فالمخاطر التي تنشأ من داخل المشروع تسمى مخاطر داخلية، ومن أمثلتها تلف الممتلكات والاحتيال والحوادث ودوران العاملين. أما المخاطر التي تنشأ من البيئة الخارجية فتسمى مخاطر خارجية، ومن أمثلتها نقص التوريد وتقلب أسعار الصرف والديون المعدومة واللوائح الجديدة والكوارث الطبيعية.',
        'Risk can arise from within the business or from the external environment. Risks that arise from within the business are called internal risks. Some examples of internal risks are property damage, fraud, accidents and employee turnover. Risks that arise from the external environment are called external risks. Some examples of external risks are supply shortages, exchange rate fluctuation, bad debts, new regulations and natural disasters.'),
      h('2. ما هي إدارة المخاطر؟', '2. What is Risk Management?'),
      p('إدارة المخاطر هي عملية تحديد المخاطر التي يتعرض لها مشروعك ووضع استراتيجيات لتقليل أثر الخطر في مشروعك. وينبغي أن تكون ضمانات إدارة المخاطر محركاً استراتيجياً للمشروع وأن تكون جزءاً من الإدارة اليومية الشاملة.',
        'Risk Management is the process of identifying risks to which your business is exposed and developing strategies for reducing the impact of the risk on your business. Risk Management safeguards should be a strategic driver of the business and be embedded in the overall day-to-day management.'),
      p('هدف إدارة المخاطر ليس منع المخاطرة أو حظرها، بل ضمان أن تُتَّخذ المخاطر عن وعي، بمعرفة كاملة وفهم واضح للعواقب، حتى يمكن اتخاذ الاستجابات المناسبة.',
        'The objective of Risk Management is not to prevent or prohibit risk taking. It is to ensure that risks are consciously taken with a complete knowledge and clear understanding of the consequences so that appropriate responses can be made.')] },

    { id: 's3', pg: '39–40', title: B('٣. مراحل عملية إدارة المخاطر', '3. Stages in the Risk Management process'), blocks: [
      p('تتضمن عملية إدارة المخاطر الخطوات الأربع الآتية:', 'Risk Management process includes the following four steps:'),
      ul([
        ['الخطوة 1: حدّد المخاطر التي يتعرض لها مشروعك الآن وفي المستقبل. — «كريس، نُدرج كل المخاطر الممكنة التي قد تصيبنا الآن وفي المستقبل. انظر إلى قائمتي.» المخاطر: الحريق، الإضراب، السرقة، تشبّع السوق، التسمم الكيميائي.', 'Step 1: Identify the risks to which your business is exposed now and in the future. — “Chris, we list all possible risks that can befall us now and in the future. Look at my list.” RISKS: Fire, Strike, Theft, Market saturation, Chemical poisoning.'],
        ['الخطوة 2: قيّم احتمال وقوع الخطر. — «ثم ننظر في الآتي:» الاحتمال (Likelihood): هل سيقع هذا الخطر؟ وهل سيقع كثيراً؟ الأثر (Impact): إذا وقع الخطر فما الأثر المرجّح؟', 'Step 2: Assessing the possibility of the risk occurring. — “Then, we look at the following:” Likelihood: Will this risk occur? Will it occur often? Impact: If the risk occurs what is the likely impact?'],
        ['الخطوة 3: رتّب المخاطر حسب الأولوية. — «نعطي الأولوية للمخاطر الأكبر أثراً في مشروعنا. وكما ترى، أثر الحريق مدمّر لأنه قد يدمّر المشروع كله. وفي مشروعي للبلاستيك احتمال الحريق مرتفع.»', 'Step 3: Prioritizing the risk. — “We prioritize the risks that have the greatest impact on our business. As you can see, the impact of a fire is devastating, as it can ruin the whole business. In my plastics business, the likelihood of a fire is high.”'],
        ['الخطوة 4: ضع استراتيجيات للاستجابة للخطر. — «كريس، ندرّب موظفينا كل عام على إجراءات الصحة والسلامة المهنية. ونصون معدات إطفاء الحريق بانتظام. ونشتري أيضاً تأميناً ضد الحريق.»', 'Step 4: Develop strategies for responding to the risk. — “Chris, we train our staff about operational health and safety measures every year. We maintain our firefighting equipment regularly. We also buy fire insurance.”']]),
      p('لتحديد المخاطر الداخلية ارجع إلى تحليل مشروعك. فالمجالات التي لا يؤدي فيها مشروعك أداءً جيداً قد تنطوي على عنصر مخاطرة. فمثلاً قد يكون مشروعك معرضاً لخطر فقدان سمعته إذا لم تستطع ضبط جودة المواد الخام المستخدمة في الإنتاج.',
        'To identify internal risks, refer to your Business Analysis. The areas in which your business is not doing well may carry an element of risk. For example, your business is possibly at risk of losing its reputation if you are unable to control the quality of the raw materials used in production.'),
      p('ولتحديد المخاطر الخارجية ارجع إلى توقعاتك للتغيّرات في البيئة الخارجية. فكّر مليّاً في التهديدات المحتملة الناتجة عن التغيّرات الخارجية وفي احتمال أن يتكبد مشروعك خسارة بسببها.',
        'To identify external risks, refer to your forecast of changes in the external environment. Think carefully about possible threats that are caused by external changes and the possibility of your business suffering loss due to those threats.'),
      p('بعض المخاطر مشتركة بين كثير من المشاريع. لذلك يمكنك أيضاً أن تنظر إلى مشاريع أخرى من النوع والحجم نفسيهما وأن تتعلم من تجاربها في تحديد المخاطر الشائعة. وفيما يلي بعض الأسئلة التي يمكنك أن تسألها لنفسك:',
        'Some risks are common to many businesses. So, you can also look at other businesses of the same type and size and learn from their experiences identifying common risks. Here are some of the questions you may ask yourself:'),
      ul([
        ['ما الأمر الحاسم لبقاء مشروعي؟', 'What is critical for the survival of my business?'],
        ['إلى أي مدى يعتمد مشروعي على الآخرين في إنتاج السلع أو تقديم الخدمات؟', 'How much is my business relying on others to produce goods or provide services?'],
        ['هل يعتمد مشروعي كثيراً على زبون أو شخص معيّن؟', 'Is my business depending too much on a particular customer or person?'],
        ['هل العمليات الداخلية في مشروعي كافية؟', 'Are the internal processes of my business adequate?'],
        ['هل تأخر أي زبون أو مورّد عن السداد؟', 'Did any customer or supplier default on payments?']])] },

    { id: 's4', pg: '40–41', title: B('٤. استراتيجيات إدارة المخاطر', '4. Risk Management strategies'), blocks: [
      p('قرّر ما ستفعله مع كل خطر يواجه مشروعك. هناك أربع طرق شائعة للاستجابة للخطر.', 'Decide what to do with each risk facing your business. There are four common ways to respond to risk.'),
      ul([
        ['«اشتريت تأميناً للسيارة لأنقل المخاطر المالية الناتجة عن حوادث السيارات.»', '“I bought car insurance to transfer financial risks caused by car accidents.”'],
        ['«لدي إطار احتياطي لأقلل الأثر السلبي لثقب الإطار.»', '“I have a spare wheel in order to reduce the negative impact of a flat tyre.”'],
        ['«تأمين سيارتي لا يغطي خطر السرقة. أقبل خطر أن يسرق أحدهم سيارتي.»', '“My car insurance does not cover the risk of being stolen. I accept the risk that someone may steal my car.”'],
        ['«أتبنى قيادة أكثر حذراً لتجنب خطر الاصطدام بأحد.»', '“I adopt a more defensive driving to avoid the risk of hitting somebody.”']]),
      h('قبول الخطر', 'Accepting the risk'),
      p('قد تقرر أن بعض المخاطر حتمية. فخطر ألا تلقى بعض المنتجات رواجاً لدى زبائنك جزء من ممارسة الأعمال. ومع ذلك، ولتقليل مثل هذه المخاطر يمكنك إجراء بحوث سوق لتفهم احتياجات زبائنك وتفضيلاتهم فهماً أفضل. ومخاطر الائتمان كثيراً ما تكون كلفة ممارسة الأعمال، لكن منح الائتمان قد يكون مهماً لمشروعك لزيادة المبيعات.',
        'You may decide that certain risks are inevitable. The risk that certain products are not popular with your customers is part of doing business. However, in order to minimize such risks, you could do market research so that you have a better understanding of your customers’ needs and preferences. Credit risk is often the cost of doing business. But giving credit may be important for your business in order to increase sales.'),
      h('نقل الخطر', 'Transferring the risk'),
      p('يمكن لمشروعك أن يؤمّن ضد بعض المخاطر لتقليل أثرها في المشروع. وتستطيع أقساط التأمين تغطية مخاطر مثل الحريق والسرقة وفشل المحصول. وعند وقوع الخسارة تعوّض شركة التأمين مشروعك.',
        'Your business can take out insurance against certain risks to reduce the impact on the business. Insurance premiums can cover risks such as fire, theft and crop failure. When a loss occurs, the insurance company compensates your business.'),
      h('تقليل احتمال الخطر أو أثره', 'Reducing the likelihood or impact of the risk'),
      p('يمكن لمشروعك أن يبتكر طرقاً لتقليل احتمال وقوع الخطر أو الضرر الناتج عن حدث الخطر. فمثلاً يمكنك ضبط مخاطر الائتمان بحفظ السجلات والمراقبة بعناية. وقد تدّخر بعض الأموال في حساب توفير لتتوفر لديك موارد للتعامل مع أي حدث غير متوقع حال وقوعه. والتخطيط للطوارئ مهم لمخاطر الكوارث الطبيعية؛ إذ على مشروعك أن يخطط لكيفية التعامل مع المخاطر المرتبطة بالكوارث الطبيعية التي يتعرض لها.',
        'Your business can come up with ways to reduce the likelihood of the risk occurring or the damage that is caused by a risk event. For example, you can control credit risk through careful record keeping and monitoring. You might set aside some funds in a savings account so that you have resources available to react to an unexpected event as soon as it occurs. Contingency planning is important for natural disaster risks. Your business needs to plan how it will handle natural disaster related risks to which your business is exposed.'),
      h('تجنب الخطر', 'Avoid the risk'),
      p('قد يرغب مشروعك في تجنب المخاطر ذات الأثر الكبير والاحتمال المرتفع. فمثلاً لا ينبغي أن تمنح ائتماناً لزبائن لا تعرفهم بعد أو لمن له سجل ائتماني سيئ. وهذا يحميك من كلفة التخلف عن السداد ومن الكلفة المرتبطة بمحاولة استرداد دفعة متأخرة.',
        'Your business may wish to avoid risks that have a significant impact and a high probability. For example, you should not give credit to customers you do not yet know or those who have a bad credit history. This can protect you from the cost of default, as well as the costs associated with trying to recover a late payment.')] },

    { id: 'act6', pg: '41', activity: { no: 6, id: 'a6', title: B('المخاطر التي يتعرض لها مشروعك', 'The risks to which your business is exposed'),
      qs: [B('اذكر المخاطر التي يتعرض لها مشروعك الآن وفي المستقبل.', 'List the risks to which your business is exposed now and in the future.'), B('أي المخاطر ينبغي أن يعطيها مشروعك الأولوية؟', 'Which risks should your business prioritize?'), B('كيف سيتعامل مشروعك مع تلك المخاطر ذات الأولوية؟', 'How will your business deal with those prioritized risks?')] },
      blocks: [], workspace: 'risk' },

    { id: 'note6', pg: '41', title: B('ملاحظة بعد النشاط 6', 'After Activity 6'), blocks: [
      p('من المهم أن تنظر في طيف واسع من المخاطر التي يتعرض لها مشروعك. قيّم التعرض الحالي والمستقبلي لمخاطر محددة. اتبع خطوات إدارة المخاطر الأربع لوضع استراتيجيات إدارة المخاطر لمشروعك.',
        'It is important to consider a wide range of risks to which your business is exposed. Assess the current and possible future exposure to specific risks. Take the four Risk Management steps to develop Risk Management strategies for your business.')] },

    { id: 'sum', pg: '42', summary: true, title: B('ملخص الجزء الرابع', 'Summary of Part IV'), blocks: [
      p('الخطر هو احتمال أن يتعرض مشروعك لخسارة بسبب أحداث غير متوقعة. ومن المهم أن تكون واعياً بإمكانية وقوع أحداث لها أثر سلبي في مشروعك وأن تخطط لها.', 'Risk is the possibility of your business suffering loss due to unexpected events. It is important to be aware of and plan for the possible occurrence of events that would have a negative impact on your business.'),
      p('إدارة المخاطر هي عملية تحديد المخاطر التي يتعرض لها مشروعك ووضع استراتيجيات لتقليل آثار الخطر في مشروعك.', 'Risk Management is the process of identifying risks to which your business is exposed and developing strategies for reducing the effects of the risk to your business.'),
      p('هناك أربع مراحل في عملية إدارة المخاطر:', 'There are four stages in the Risk Management process:'),
      ul([['تحديد المخاطر', 'Identifying risks'], ['تقييم المخاطر', 'Assessing the risks'], ['ترتيب المخاطر حسب الأولوية', 'Prioritizing the risks'], ['الاستجابة للمخاطر', 'Responding to the risks']]),
      p('هناك أربع طرق شائعة للاستجابة للخطر:', 'There are four common ways to respond to risk.'),
      ul([['القبول', 'Accept'], ['النقل', 'Transfer'], ['التقليل', 'Reduce'], ['التجنب', 'Avoid']])] },

    { id: 'as4', pg: '42', assess: 'a4', title: B('التقييم 4', 'Assessment 4'), blocks: [] }
  ];
})();
