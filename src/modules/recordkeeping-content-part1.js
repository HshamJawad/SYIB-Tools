/* IYB Record Keeping manual (ILO 2015) - Part I "Keeping business records", printed pages 01-08 (PDF pages 10-17).
   Assessment 1 (p.09) is authored separately. English = manual's own wording.
   Arabic is a PRELIMINARY translation (not an official ILO translation). */
(() => {
  const B = (ar, en) => ({ ar, en });
  const h = (ar, en) => ({ t: 'h', x: B(ar, en) });
  const p = (ar, en) => ({ t: 'p', x: B(ar, en) });
  const q = (who, x) => ({ t: 'quote', who, x });
  const ul = (items) => ({ t: 'ul', items: items.map(i => B(i[0], i[1])) });
  const C = window.SIYB_RK_CONTENT = window.SIYB_RK_CONTENT || {};

  const T1 = B('1. ما هو مسك السجلات؟', '1. What is record keeping?');
  const T2 = B('2. كيف يمكن للسجلات أن تحسّن مشروعك؟', '2. How can records improve your business?');
  const listItems = [
    ['كم من المال يستلمه مشروعك؟', 'How much money does your business receive?'],
    ['كم من المال يدفعه مشروعك؟', 'How much money does your business pay out?'],
    ['كم بيع بالأجل (بالدَّين)؟', 'How much has been sold on credit?']
  ];

  C.p1 = [
    { id: 'what', pg: '01–04', title: T1, blocks: [
      h('مطعم لوتس', 'LOTUS RESTAURANT'),
      q(B('', ''), B('كان لدينا زبائن كثيرون اليوم، لكن لا يوجد في صندوق النقد سوى مبلغ قليل جدًا.', 'We had many customers today, but there is very little money in the cash box.')),
      q(B('', ''), B('لقد دفعتَ لبعض الموردين اليوم.', 'You paid some suppliers today.')),
      h('البقالة المريحة', 'CONVENIENT GROCERY'),
      q(B('فاطمة', 'Fatuma'), B('يا بانغو، أنت مدين لنا بمبلغ 32 $.', 'Bango, you owe us $32.')),
      q(B('بانغو', 'Bango'), B('لا يا فاطمة. أنا مدين بمبلغ 25 $ فقط، وقد قلتِ إنه يمكنني السداد في نهاية الشهر.', 'No, Fatuma. I only owe $25 and you said I can pay at the end of the month.')),
      { t: 'ex', id: 'q-story1', title: B('أسئلة', 'Questions'), qs: [
        B('ما المشكلة التي حدثت في مطعم لوتس؟', 'What was the problem at Lotus Restaurant?'),
        B('ماذا كان ينبغي أن يفعل صاحب المطعم لمنع هذه المشكلة؟', 'What should the restaurant owner have done to prevent this problem?'),
        B('على ماذا اختلفت فاطمة، صاحبة البقالة المريحة، مع الزبون؟', 'What did the Convenient Grocery owner, Fatuma, and the customer disagree about?'),
        B('ماذا كان ينبغي أن تفعل فاطمة لمنع هذه المشكلة؟', 'What should Fatuma have done to prevent this problem?')
      ], ans: [
        B('ربما لاحظتَ أن صاحب المطعم يواجه مشكلة في إدارة نقده. فهو لم يتذكر أنه أجرى بعض الدفعات. ولو كان قد سجّل كل الأموال التي استلمها ودفعها خلال اليوم، لعرف بالضبط سبب وجود القليل من النقد فقط.',
          'You may have recognized that the restaurant owner has a problem managing his cash. He did not remember that he had made some payments. If he had recorded all the money he received and paid out during the day, he would have known exactly why there was only a little cash left.'),
        B('اختلفت صاحبة البقالة وزبونتها على المبلغ الذي تدين به الزبونة، وكذلك على التواريخ التي كان يُفترض أن تسدده فيها. ولو كانت صاحبة البقالة قد سجّلت تفاصيل المعاملة، لما وقع الخلاف مع زبونتها.',
          'The grocery owner and her customer disagreed about the amount of money that the customer owed, as well as the dates she was supposed to pay it back. If the owner had recorded the details of the transaction, she would not have had a disagreement with her customer.')
      ] },
      q(B('فاطمة', 'Fatuma'), B('أحتاج إلى شراء ثلاجة جديدة. أنا متأكدة أنني سأتمكن من سداد القرض في ستة أشهر.', 'I need to buy a new freezer. I am sure I will be able to repay the loan in six months.')),
      q(B('مدير خدمة العملاء', 'Customer Service Manager'), B('لا بأس بذلك يا فاطمة.', 'That would be fine, Fatuma.')),
      q(B('مدير خدمة العملاء', 'Customer Service Manager'), B('لكن المصرف يحتاج أولًا إلى الاطلاع على سجل مبيعاتك وأرباحك وعلى خطتك للمستقبل.', 'But first the bank needs to see your sales and profit record and your plan for the future.')),
      q(B('فاطمة', 'Fatuma'), B('لقد وعدتني بخصم 5% على الطلبات التي قدمتها في حزيران/يونيو، ولذلك قدمت طلبات كثيرة.', 'You promised me a discount of 5% for the orders I made in June, so I made many orders.')),
      q(B('المورّد', 'Supplier'), B('لا، قلتُ إن الخصم كان للطلب الأول فقط الذي يُقدَّم في حزيران/يونيو.', 'No, I said the discount was only for the first order made in June.')),
      { t: 'ex', id: 'q-story2', title: B('أسئلة', 'Questions'), qs: [
        B('هل تعتقد أن المصرف منح فاطمة قرضًا؟', 'Do you think the bank gave Fatuma a loan?'),
        B('ماذا كان ينبغي أن تفعل فاطمة ليساعدها ذلك في الحصول على القرض؟', 'What should Fatuma have done that would have helped her to get the loan?'),
        B('ما المشكلة التي حدثت بين فاطمة ومورّدها؟', 'What was the problem with Fatuma and her supplier?'),
        B('ماذا كان ينبغي أن تفعل فاطمة لتمنع حدوث المشكلة؟', 'What should Fatuma have done that would have prevented the problem?')
      ], ans: [
        B('ربما خمّنتَ أن المصرف لم يمنح فاطمة القرض. فقد كان المصرف بحاجة إلى معرفة مدى نجاح مشروعها، ولذلك أراد الاطلاع على سجل مبيعاتها وأرباحها. ولو كانت فاطمة تمسك مثل هذه السجلات، لتمكنت من أن تُري المصرف مدى نجاح مشروعها، ولكان احتمال الموافقة على قرضها أكبر بكثير.',
          'Perhaps you have guessed that the bank did not give a loan to Fatuma. The bank needed to know how well her business had been doing, so they wanted to see her record of sales and profits. Had Fatuma kept such records, she would have been able to show the bank how well her business was doing and she would have been much more likely to get her loan approved.'),
        B('واجهت فاطمة ومورّدها مشكلة سوء تواصل بشأن برنامج الخصم. ولو كانت فاطمة ومورّدها قد وقّعا عقدًا مكتوبًا، لما حدث أي سوء تواصل.',
          'Fatuma and her supplier had a problem of miscommunication about the discount programme. Had Fatuma and her supplier signed a written contract, there would have not been any miscommunication.')
      ] }
    ] },
    { id: 'act1', pg: '05', title: B('النشاط 1', 'Activity 1'), activity: {
      id: 'a1', no: 1, title: B('النشاط 1', 'Activity 1'),
      qs: [
        B('هل لديك مشكلات مماثلة في مشروعك؟', 'Do you have similar problems in your business?'),
        B('هل تعرف أي مشروع آخر واجه مشكلات مماثلة؟', 'Do you know of any other business that has had similar problems?'),
        B('هل جرى حل المشكلات؟', 'Were the problems solved?'),
        B('كيف جرى حلها؟', 'How were they solved?')
      ]
    } },
    { id: 'what2', pg: '05', title: T1, blocks: [
      p('في معظم المشاريع، توجد معاملات كثيرة جدًا بحيث لا يستطيع أصحاب المشاريع تذكرها جميعها. ومن شأن السجلات المكتوبة للمعاملات التجارية أن تساعد أصحاب المشاريع على تجنب مشكلات مماثلة. وهذا هو السبب في أن المشاريع تحتاج إلى مسك سجلات دقيقة. وثمة سبب آخر يدعو المشاريع إلى مسك السجلات، وهو أن القانون يشترط ذلك في بلدان كثيرة.',
        'In most businesses, there are so many transactions that entrepreneurs cannot remember all of them. Written records of business transactions would help entrepreneurs avoid similar problems. This is the reason that businesses need to keep accurate records. Another reason for businesses to keep records is that, in many countries, the law requires it.'),
      { t: 'note', x: B('مسك سجلات المشروع مطلب قانوني في كثير من المشاريع!', 'Keeping business records is a legal requirement for many businesses!') },
      { t: 'ex', id: 'q-constitutes', title: B('سؤال', 'Question'), qs: [
        B('من الأمثلة أعلاه، هل يمكنك التفكير فيما يشكّل مسك السجلات؟', 'From the examples above, can you think about what constitutes record keeping?')
      ] },
      p('مسك السجلات يعني تدوين جميع المعلومات المهمة لمشروعك، مثل:', 'Records keeping means writing down all the information that is important to your business, such as:'),
      ul([
        listItems[0], listItems[1], listItems[2],
        ['كم يدين مشروعك للآخرين؟', 'How much does your business owe others?'],
        ['قيمة المعدات التي يشتريها مشروعك', 'The value of equipment that your business buys'],
        ['الأموال التي تستثمرها في مشروعك', 'The money you invest in your business'],
        ['الاتفاقيات بين مشروعك ومورّديه أو زبائنه', 'Agreements between your business and its suppliers or customers']
      ])
    ] },
    { id: 'how', pg: '06–07', title: T2, blocks: [
      p('لقد اطّلعتَ على بعض الفوائد التي يمكن أن يحققها مسك السجلات لمشروعك. كما يمكن للسجلات المرتبة والدقيقة أن تساعدك على معرفة كيف يسير مشروعك وعلى حل المشكلات فيه:',
        'You have been made aware of some of the benefits that keeping records can bring to your business. Neat, accurate records can also help you to find out how your business is doing and to solve problems in your business:'),
      ul([
        ['إذا كان مشروعك يسير بصورة جيدة، فاستخدم سجلاتك لمعرفة السبب وراء ذلك ولإيجاد أمور يمكنك فعلها لتحسينه أكثر.', 'If your business is doing well, use your records to identify the reason behind it and to find things that you can do to make it even better.'],
        ['إذا كان مشروعك لا يسير بصورة جيدة، فاستخدم سجلاتك لتحديد المشكلات ثم خطط لكيفية حلها.', 'If your business is not doing well, use your records to identify the problems and then plan how to solve them.']
      ]),
      p('والسجلات مهمة أيضًا لإدارة العلاقات مع مختلف المؤسسات والأفراد الذين يقدمون الخدمات أو يصنّعون السلع التي تحتاج إليها في مشروعك. كما أن الاتفاقيات التعاقدية التي تبرمها هي جزء من سجلات مشروعك.',
        'Records are also important for managing relationships with different institutions and individuals that offer the services or manufacture the goods that you need in your business. The contractual agreements you enter into are also part of your business records.'),
      p('توضح الرسوم أدناه بعض فوائد مسك سجلات دقيقة:', 'The illustrations below show some of the benefits of maintaining accurate records:'),
      h('1. تساعدك السجلات على التحكم في نقدك.', '1. Records help you to control your cash.'),
      p('توضح سجلاتك مقدار النقد الذي ينبغي أن يكون لدى مشروعك في اليد في أي وقت. استخدم سجلاتك للتأكد من أن المال لا يختفي.',
        'Your records show how much cash your business should have in hand at any point in time. Use your records to make sure that money does not disappear.'),
      h('2. تُظهر لك السجلات كيف يؤدي مشروعك.', '2. Records show you how your business is performing.'),
      p('تساعدك سجلاتك على اكتشاف المشكلات قبل فوات الأوان. استخدم سجلاتك لمعرفة ما إذا كان هناك خلل ما، أو إذا كانت التكاليف مرتفعة جدًا، أو إذا كانت المبيعات في تراجع، وغير ذلك.',
        'Your records help you to identify problems before it is too late. Use your records to find out if something is wrong, if costs are too high, if sales are falling, etc.'),
      h('3. تُظهر السجلات للآخرين كيف يؤدي مشروعك.', '3. Records show others how your business is performing.'),
      p('تحتاج إلى سجلات سليمة لتقديم طلب قرض، ولدفع ضرائبك، ولمعظم أنشطة المشروع. استخدم سجلاتك لإثبات أن كل شيء في نصابه وأنك تسيطر على مشروعك.',
        'You need proper records to apply for a loan, to pay your taxes and for most business activities. Use your records to show that everything is in order and that you are in control of your business.'),
      h('4. تساعدك السجلات على التخطيط للمستقبل.', '4. Records help you plan for the future.'),
      p('تُظهر السجلات مدى نجاح مشروعك في الماضي ومدى نجاحه الآن. وعندما تعرف نقاط قوتك وضعفك، يمكنك التخطيط للمستقبل على النحو الصحيح.',
        'Records show how well your business did in the past and how well it is doing now. When you know your strengths and weaknesses, you can properly plan for the future.')
    ] },
    { id: 'act2', pg: '08', title: B('النشاط 2', 'Activity 2'), activity: {
      id: 'a2', no: 2, title: B('النشاط 2', 'Activity 2'),
      qs: [B('إذا كنت تمسك سجلات، فكيف تود أن تستخدمها لتحسين مشروعك؟', 'If you keep records, how would you like to use them to improve your business?')]
    } },
    { id: 'how2', pg: '08', title: T2, blocks: [
      p('سنتناول في الأجزاء التالية أدوات مسك سجلات المشروع بصورة سليمة، وتفاصيل محددة عن كيفية استخدامها.',
        'In the following parts, we will examine the tools for keeping proper business records and specific details on how to use them.')
    ] },
    { id: 'sum', pg: '08', summary: true, title: B('الملخص', 'Summary'), blocks: [
      p('مسك السجلات يعني تدوين جميع المعلومات المهمة لمشروعك. على سبيل المثال:', 'Record keeping means writing down all the information that is important to your business. For example:'),
      ul([
        listItems[0], listItems[1], listItems[2],
        ['كم يدين مشروعك؟', 'How much does your business owe?'],
        ['قيمة المعدات التي يشتريها مشروعك', 'The value of equipment that your business buys'],
        ['الأموال التي تستثمرها في مشروعك', 'The money you invest in your business'],
        ['الاتفاقيات والعقود بين مشروعك ومورّديه أو زبائنه', 'Agreements and contracts between your business and its suppliers or customers']
      ]),
      p('مسك السجلات ضروري لكل مشروع. وستساعدك السجلات المرتبة والدقيقة على اكتشاف المشكلات وحلها. استخدم السجلات من أجل:',
        'Record keeping is necessary for every business. Neat, accurate records will help you to identify and solve problems. Use records to:'),
      ul([
        ['التحكم في نقدك', 'Control your cash'],
        ['معرفة كيف يؤدي مشروعك', 'See how your business is performing'],
        ['إظهار أداء مشروعك للمصارف أو المستثمرين أو الأطراف المهتمة الأخرى', 'Demonstrate to banks, investors, or other interested parties how your business is performing'],
        ['التخطيط للمستقبل', 'Plan for the future']
      ])
    ] }
  ];
})();
