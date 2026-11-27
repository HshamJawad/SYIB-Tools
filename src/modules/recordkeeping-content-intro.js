/* IYB Record Keeping manual (ILO 2015) - Introduction, printed pages i-ii (PDF pages 8-9).
   English = manual's own wording. Arabic is a PRELIMINARY translation (not an official ILO translation). */
(() => {
  const B = (ar, en) => ({ ar, en });
  const p = (ar, en) => ({ t: 'p', x: B(ar, en) });
  const ul = (items) => ({ t: 'ul', items: items.map(i => B(i[0], i[1])) });
  const C = window.SIYB_RK_CONTENT = window.SIYB_RK_CONTENT || {};
  C.intro = [
    { id: 'about', pg: 'i', title: B('1. ما موضوع هذا الدليل؟', '1. What is this manual about?'), blocks: [
      p('يُعرّف هذا الدليل مسك السجلات (Record Keeping) ويشرح أسباب أهميته للمشاريع الصغيرة. ويساعدك على تحديد السجلات المهمة لمشروعك، ويعلّمك كيف تمسك هذه السجلات، ويبيّن لك كيف تستخدمها لتحسين مشروعك.',
        'This manual defines record keeping and explains the reasons why it is important to small businesses. It helps you to identify records that are important for your business, teaches you how to keep the records, and shows you how to use them to improve your business.')
    ] },
    { id: 'who', pg: 'i', title: B('2. من الذي ينبغي أن يقرأ هذا الدليل؟', '2. Who should read this manual?'), blocks: [
      p('مسك السجلات هو أحد الأدلة في سلسلة «حسّن مشروعك» (IYB). وهو مفيد لأصحاب المشاريع الذين يديرون مؤسسات ويرغبون في تطوير مشاريعهم وزيادة المبيعات وتقليل التكاليف.',
        'Record Keeping is one of the manuals in the Improve Your Business (IYB) series. It is useful for entrepreneurs who are running enterprises and who wish to develop their businesses, increase sales and reduce costs.')
    ] },
    { id: 'objectives', pg: 'i', title: B('3. أهداف هذا الدليل', '3. Objectives of this manual'), blocks: [
      p('عند إكمالك هذا الدليل، ينبغي أن تكون قادرًا على:', 'When you have completed this manual, you should be able to:'),
      ul([
        ['شرح فوائد مسك السجلات', 'Explain the benefits of record keeping'],
        ['تحديد السجلات المهمة التي ينبغي الاحتفاظ بها', 'Determine which records are important and should be kept'],
        ['مسك سجلات مشروعك', 'Keep your business records'],
        ['استخدام هذه السجلات لتحسين مشروعك', 'Use these records to improve your business']
      ])
    ] },
    { id: 'use', pg: 'i–ii', title: B('4. كيف تستخدم هذا الدليل؟', '4. How to use this manual?'), blocks: [
      p('ستجد في هذا الدليل ما يلي:', 'In this manual you will find:'),
      ul([
        ['قصص مشاريع: قارن هذه الأمثلة بمشروعك الخاص واستخدمها لتحسين أداء مشروعك وربحيته.', 'Stories of businesses: Compare these examples with your own business and use them to improve the performance and profitability of your business.'],
        ['الأنشطة: تمارين عملية في منتصف كل جزء تساعدك على التفكير الاستباقي في المفاهيم وكيفية تطبيقها على مشروعك الخاص.', 'Activities: Practical exercises in the middle of each part that help you to proactively think about the concepts and how to apply them to your own business.'],
        ['الملخص: يرد في نهاية كل جزء. استخدمه لمراجعة النقاط الرئيسية.', 'Summary: This is provided at the end of each part. Use it to review the key points.'],
        ['التقييم: يرد في نهاية كل جزء. ستساعدك الإجابة عن أسئلته على تقييم مدى فهمك للمحتوى المعروض في ذلك الجزء.', 'Assessment: This is provided at the end of each part. Answering the questions will help you to assess how well you understand the content presented in that part.'],
        ['«هل يمكنك المساعدة؟»: تمارين في نهاية الدليل تتيح لك فرصة تطبيق معارفك ومهاراتك الجديدة في مواقف محددة. وبإنجاز هذه التمارين ستعرف مقدار ما تعلمته من الدليل كاملًا.', '“Can You Help?”: These are exercises at the end of the manual which will give you an opportunity to apply your new knowledge and skills in specific situations. By doing these exercises, you will find out how much you have learned from the whole manual.'],
        ['خطة العمل: املأ خطة العمل واستخدمها، وهي ترد قرب نهاية الدليل. ستساعدك على وضع معارفك الجديدة موضع التطبيق.', 'Action Plan: Fill in and use the Action Plan near the end of the manual. This will help you to put your new knowledge into practice.'],
        ['الإجابات: ترد في نهاية الدليل إجابات التقييمات وتمارين «هل يمكنك المساعدة؟». أنهِ كل تمرين قبل أن تطّلع على الإجابة.', 'Answers: Answers to Assessments and “Can You Help?” exercises are given at the end of the manual. Finish each exercise before you look at the answer.'],
        ['مفردات الأعمال المفيدة: يمكنك البحث عن معنى مفردات الأعمال التي لا تفهمها. يرد هذا الجزء في نهاية الدليل.', 'Useful Business Words: You can look up the meaning of business words that you do not understand. This part is at the end of the manual.'],
        ['الملاحظات المهمة: تتضمن كل ملاحظة منها معلومات مهمة. استفد من هذه المعلومات بأقصى ما تستطيع. ستجد هذه الملاحظات في منتصف أجزاء مختلفة من الدليل.', 'Important notes: Each of these notes has important information. Use this information to the best of your ability. You can find these notes in the middle of different parts of the manual.']
      ]),
      p('تُستخدم عدة أيقونات داخل الدليل لتوجيه دراستك. وفيما يلي أمثلة على الأيقونات ومعانيها:',
        'Several icons are used within the manual to help guide your study. Examples of the icons and their meanings are listed below:'),
      ul([
        ['عندما ترى هذه الأيقونة، فهناك أنشطة عليك القيام بها أو أسئلة عليك الإجابة عنها.', 'When you see this icon, you have activities to do or questions to answer.'],
        ['عندما ترى هذه الأيقونة، ستجد هنا إجابة لأنشطتك وتقييماتك.', 'When you see this icon, you find an answer for your activities and assessments here.'],
        ['عندما ترى هذه الأيقونة، فهذا يعني أن المعلومات في هذا الجزء بالغة الأهمية.', 'When you see this icon, it signifies that the information in this part is extremely important.'],
        ['عندما ترى هذه الأيقونة، عليك إكمال تقييمات تساعدك على قياس ما تعلمته.', 'When you see this icon, you have to complete assessments that help you measure what you have learned.'],
        ['عندما ترى هذه الأيقونة، ستعرف أنك أنهيت للتو جزءًا وأن الأفكار المهمة التي عُرضت فيه تُلخَّص هنا.', 'When you see this icon, you will know you have just completed one part and the important ideas that were presented are being summarized here.'],
        ['عندما ترى هذه الأيقونة، فإنها تخبرك أين تجد مزيدًا من المعلومات أو ماذا تفعل.', 'When you see this icon, it tells you where to find more information or what to do.']
      ])
    ] }
  ];
})();
