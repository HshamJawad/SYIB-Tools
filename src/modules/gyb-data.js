/* GYB module content (bilingual). Structure and sequence follow "Generate Your Business Idea (GYB)", ILO, 2015.
   Texts are short adaptations written for this application (not copies of the manual); every item is {ar, en}.
   Phase 1 contains the module shell only: the activities listed per part are announced ("coming soon") and
   are implemented in the following roadmap phases (field `phase`). */
window.SIYB_GYB_DATA = (() => {
  const B = (ar, en) => ({ ar, en });

  const GROUPS = {
    start: B('البداية', 'Getting started'),
    parts: B('أجزاء رحلة GYB', 'The GYB journey'),
    follow: B('المتابعة', 'Follow-up'),
    info: B('معلومات', 'Information')
  };

  /* The five parts of the manual, in the manual's learning sequence. */
  const PARTS = [
    {
      id: 'p1', roman: 'I', icon: '①',
      title: B('الجزء الأول: أنت كرائد أعمال', 'Part I: You as an entrepreneur'),
      short: B('قيّم جاهزيتك وحدّد المجال والنوع الأنسب لك.', 'Reflect on your readiness and find the field and type of business that suit you.'),
      lead: B(
        'امتلاك مشروعك الخاص مغرٍ، لكنه يعني مسؤوليات وتحديات كثيرة. قبل أي شيء اعرف إن كنت قادراً على إدارة مشروعك: تحتاج ظروفاً مناسبة وصفات ومهارات شخصية ومعرفة وخبرة في المجال الذي تختاره. في هذا الجزء تقييمان: الأول يقيس قدراتك كرائد أعمال، والثاني يساعدك على تحديد مجال ونوع المشروع المناسبين لك.',
        'Owning a business is tempting, but it also brings many responsibilities and challenges. First find out whether you can run your own business: you need favourable circumstances, personal characteristics and skills, and knowledge and experience in the field you choose. This part has two assessments: the first looks at your abilities as an entrepreneur; the second helps you identify the field and type of business that may suit you.'),
      items: [
        { id: 'ass1', kind: 'assessment', phase: 2, title: B('تقييم: هل لديك ما يلزم لتكون رائد أعمال؟ (تسعة مجالات)', 'Assessment: do you have what it takes to be an entrepreneur? (nine areas)') },
        { id: 'act1', kind: 'activity', phase: 2, title: B('النشاط 1: مجالات التحسين والنمو الحرجة', 'Activity 1: critical areas needing improvement and growth') },
        { id: 'ass2', kind: 'assessment', phase: 2, title: B('تقييم: ما المجال والنوع الأنسب لك؟ (أربعة أنواع: تصنيع، خدمات، جملة، تجزئة)', 'Assessment: which field and type suit you? (four types: manufacturing, service provision, wholesaling, retailing)') },
        { id: 'act2', kind: 'activity', phase: 5, title: B('النشاط 2: خطة عمل لتقوية قدراتك ومهاراتك', 'Activity 2: action plan to strengthen your abilities and skills') }
      ]
    },
    {
      id: 'p2', roman: 'II', icon: '②',
      title: B('الجزء الثاني: سوق ينتظرك', 'Part II: A market is waiting for you'),
      short: B('تعلّم العناصر الخمسة التي تقوم عليها فكرة المشروع.', 'Learn the five elements that make up a business idea.'),
      lead: B(
        'فكرة المشروع وصف قصير ودقيق للتشغيل الأساسي للمشروع المقصود. من خلال حالتي Janet وLily ستتعرف على الأسئلة الخمسة التي تجيب عنها الفكرة الجيدة: أي حاجة للزبائن يلبّيها المشروع؟ وما السلعة أو الخدمة؟ ولمن سيبيع؟ وكيف سيبيع؟ وإلى أي مدى سيعتمد على البيئة ويؤثر فيها؟',
        'A business idea is a short, precise description of the basic operation of an intended business. Through the cases of Janet and Lily you will see the five questions a good idea answers: which customer need will the business fulfil? What good or service will it sell? Who will it sell to? How will it sell? How much will it depend on, and affect, the environment?'),
      items: [
        { id: 'case2', kind: 'story', phase: 3, title: B('حالتا Janet وLily: لماذا نجحت إحداهما ولم تنجح الأخرى؟', 'The cases of Janet and Lily: why did one succeed and not the other?') },
        { id: 'five', kind: 'learn', phase: 3, title: B('العناصر الخمسة لفكرة المشروع', 'The five elements of a business idea') },
        { id: 'act3', kind: 'activity', phase: 3, title: B('النشاط 3: صِف فكرة مشروعك', 'Activity 3: describe your business idea') }
      ]
    },
    {
      id: 'p3', roman: 'III', icon: '③',
      title: B('الجزء الثالث: قائمة أفكار مشروعك', 'Part III: Your own business idea list'),
      short: B('ولّد أفكاراً من مصادر متعددة وسجّلها في قائمتك.', 'Generate ideas from several sources and record them in your list.'),
      lead: B(
        'كل فكرة جيدة تقوم على معرفة السوق وحاجاته. هدفك الأول أن تفكر في أكبر عدد ممكن من الأفكار، ثم تفحص القائمة وتختار الأقوى. في هذا الجزء طرق متعددة لتوليد الأفكار: التعلم من أصحاب المشاريع الناجحة، والاستفادة من تجربتك وتجارب الآخرين، ومسح منطقتك التجارية، وفحص بيئتك، والعصف الذهني.',
        'Every business idea should rest on knowledge of the market and its needs. Your first goal is to think of as many ideas as possible, then scan the list and pick the strongest. This part gives several ways to generate ideas: learning from successful business owners, drawing on your own and other people\'s experience, surveying your local business area, scanning your environment, and brainstorming.'),
      items: [
        { id: 'case3', kind: 'story', phase: 3, title: B('تجربة Hamisi: كيف وصل إلى فكرته؟', 'Hamisi\'s experience: how did he find his idea?') },
        { id: 'act4', kind: 'activity', phase: 3, title: B('النشاط 4: التعلم من أصحاب المشاريع الناجحة (نموذج تحليل أفكار الأعمال)', 'Activity 4: learn from successful business owners (Business Ideas Analysis Form)') },
        { id: 'act5', kind: 'activity', phase: 3, title: B('النشاط 5: الاستفادة من التجربة الشخصية وتجارب الآخرين', 'Activity 5: draw from your own and other people\'s experience') },
        { id: 'act6', kind: 'activity', phase: 3, title: B('النشاط 6: مسح منطقتك التجارية المحلية', 'Activity 6: survey your local business area') },
        { id: 'act7', kind: 'activity', phase: 3, title: B('النشاط 7: فحص البيئة (ستة مصادر)', 'Activity 7: scan your environment (six sources)') },
        { id: 'act8', kind: 'activity', phase: 3, title: B('النشاط 8: العصف الذهني', 'Activity 8: brainstorming') },
        { id: 'act9', kind: 'activity', phase: 3, title: B('النشاط 9: العصف الذهني المنظَّم', 'Activity 9: structured brainstorming') },
        { id: 'act10', kind: 'activity', phase: 3, title: B('النشاط 10: قائمة أفكاري', 'Activity 10: my ideas list') }
      ]
    },
    {
      id: 'p4', roman: 'IV', icon: '④',
      title: B('الجزء الرابع: أفضل أفكار الأعمال لك', 'Part IV: The best business ideas for you'),
      short: B('اغربل أفكارك، وافحصها ميدانياً، وحلّلها بأداة SWOT.', 'Screen your ideas, test them in the field and analyse them with SWOT.'),
      lead: B(
        'بعد توليد قائمة الأفكار تأتي مرحلة الاختيار: تغربل قائمتك بحسب المعايير الخمسة، ثم تجمع معلومات إضافية بدراسة ميدانية وبمقابلات مع الزبائن والمنافسين والموردين والجهات المالية وأصحاب المعرفة، ثم تحلل أفضل ثلاث أفكار بأداة SWOT. القرار النهائي دائماً قرارك أنت.',
        'After generating your list comes selection: you screen the list against the five criteria, gather more information through a field study and interviews with customers, competitors, suppliers, financial institutions and key informants, then analyse your best three ideas with a SWOT analysis. The final decision is always yours.'),
      items: [
        { id: 'screen', kind: 'learn', phase: 4, title: B('غربلة قائمة الأفكار بالمعايير الخمسة', 'Screen your ideas list against the five criteria') },
        { id: 'act11', kind: 'activity', phase: 4, title: B('النشاط 11: خطة الدراسة الميدانية والمقابلات', 'Activity 11: field study and interview plan') },
        { id: 'act12', kind: 'activity', phase: 4, title: B('النشاط 12: تحليل SWOT للأفكار الثلاث المختارة', 'Activity 12: SWOT analysis of your three selected ideas') }
      ]
    },
    {
      id: 'p5', roman: 'V', icon: '⑤',
      title: B('الجزء الخامس: فكرة مشروعك', 'Part V: Your own business idea'),
      short: B('لخّص فكرتك المختارة وضع خطة عملك الشخصية.', 'Summarise your chosen idea and prepare your personal action plan.'),
      lead: B(
        'إن حسمتَ اختيارك فمبروك! في هذا الجزء تكتب ملخصاً لفكرتك. وإن كنت لا تزال متردداً فلا بأس: وضّح ما سبب التردد (ثقتك بقدراتك؟ وجود حاجة غير ملباة في السوق؟ كثرة الأفكار؟ كفاية التحليل والمقارنة؟) ودوّن في خطة عمل ما ستفعله لاحقاً.',
        'If you have decided, congratulations! In this part you write a summary of your idea. If you are still undecided, do not worry: clarify what causes the hesitation (confidence in your abilities? a real unmet market need? too many ideas? enough analysis and comparison?) and list what you will do next in an action plan.'),
      items: [
        { id: 'act13', kind: 'activity', phase: 5, title: B('النشاط 13: ملخص فكرة مشروعي', 'Activity 13: summary of my business idea') },
        { id: 'act14', kind: 'activity', phase: 5, title: B('النشاط 14: خطة العمل الشخصية', 'Activity 14: personal action plan') }
      ]
    }
  ];

  const SECTIONS = [
    { id: 'home', grp: 'start', icon: '⌂', title: B('البداية', 'Getting started') },
    ...PARTS.map((p) => ({ id: p.id, grp: 'parts', icon: p.icon, title: p.title, part: p })),
    { id: 'knowledge', grp: 'follow', icon: '?', title: B('اختبر معلوماتك', 'Knowledge check'), phase: 6 },
    { id: 'report', grp: 'follow', icon: '▤', title: B('تقرير GYB الخاص بي', 'My GYB report'), phase: 6 },
    { id: 'about', grp: 'info', icon: 'i', title: B('حول الوحدة والبيانات', 'About this module and your data') }
  ];

  const HOME = {
    purpose: B(
      'هذه الوحدة رفيق تعلّم رقمي لمن يريد أن يبدأ مشروعاً لكنه غير متأكد من الفكرة التي يتبعها. ترافقك خطوة بخطوة من تقييم جاهزيتك إلى اختيار فكرتك الأفضل ووضع خطة عملك، وفق تسلسل دليل «توليد فكرة مشروعك» (GYB).',
      'This module is a digital learning companion for people who want to start a business but are not sure which idea to pursue. It accompanies you step by step from assessing your readiness to choosing your best idea and preparing your action plan, following the sequence of the "Generate Your Business Idea" (GYB) manual.'),
    objectives: [
      B('تقييم ما إذا كنت تملك المتطلبات الأساسية لتكون رائد أعمال ناجحاً.', 'Assess whether you have the basic requirements to be a successful entrepreneur.'),
      B('شرح أي فكرة مشروع تخطر ببالك شرحاً واضحاً.', 'Clearly explain any business idea that comes to your mind.'),
      B('تحديد مصادر أفكار المشاريع المحتملة وإعداد قائمة أفكار.', 'Identify potential sources of business ideas and create an ideas list.'),
      B('اختيار أفضل فكرة بعد غربلة القائمة واختصارها.', 'Shortlist and then select the best idea to pursue in order to start your own business.')
    ],
    howTo: [
      B('قصص مشاريع: قارن بينها وبين وضعك وتعلّم منها.', 'Stories of businesses: compare them with your own situation and learn from them.'),
      B('أنشطة: تمارين عملية تدفعك للتفكير في المفاهيم وتطبيقها على مشروعك المقبل.', 'Activities: practical exercises that help you think about the concepts and apply them to your future business.'),
      B('تقييمات: إجابتك عن الأسئلة تساعدك على معرفة قدرتك وجاهزيتك لتكون رائد أعمال.', 'Assessments: answering the questions helps you gauge your capability and readiness to be an entrepreneur.'),
      B('خطط عمل: املأها لتحوّل ما تعلمته إلى خطوات عملية.', 'Action plans: fill them in to turn what you learn into practical steps.')
    ],
    principles: B(
      'المتعلم هو من يختار فكرته النهائية. التقييمات للتأمل الذاتي وليست اختباراً تشخيصياً. والأرقام والملاحظات التي تدخلها هي ملاحظاتك أنت وليست إحصاءات سوق موثّقة.',
      'You make the final choice of your idea. The assessments are for self-reflection, not a diagnostic test. The counts and observations you enter are your own observations, not verified market statistics.')
  };

  const ABOUT = {
    what: B(
      'وحدة GYB في أدوات SIYB الرقمية تكييف رقمي مستقل لدليل «توليد فكرة مشروعك (GYB)» الصادر عن مكتب العمل الدولي عام 2015. هي أداة مساندة للتعلم ولا تحل محل الدليل ولا محل إشراف المدرب ولا محل البحث الميداني الفعلي.',
      'The GYB module of SIYB Digital Workshop Tools is an independent digital adaptation of the manual "Generate Your Business Idea (GYB)", International Labour Office (ILO), 2015. It is a learning aid and does not replace the manual, trainer facilitation or real field research.'),
    licence: B(
      'الدليل الأصلي مرخّص بموجب رخصة المشاع الإبداعي «نسب المصنف – الترخيص بالمثل 3.0 IGO» (CC BY-SA 3.0 IGO). أُعيد استخدام محتواه هنا مع نسبته إلى مكتب العمل الدولي، ويُتاح المحتوى المشتق من الدليل في هذه الوحدة بشروط الرخصة نفسها.',
      'The original manual is distributed under the Creative Commons Attribution-ShareAlike 3.0 IGO licence (CC BY-SA 3.0 IGO). Its content is re-used here with attribution to the ILO, and content derived from the manual in this module is made available under the same licence terms.'),
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/igo/',
    adaptationEn: 'This is an adaptation of an original work by the International Labour Office (ILO). Responsibility for the views and opinions expressed in the adaptation rests solely with the author or authors of the adaptation and are not endorsed by the ILO.',
    adaptationAr: 'هذا تكييف لعمل أصلي أنتجه مكتب العمل الدولي (ILO). وتقع المسؤولية عن الآراء والأفكار الواردة في التكييف على مؤلفه أو مؤلفيه وحدهم، ولا يعتمدها مكتب العمل الدولي.',
    translationEn: 'This translation was not created by the International Labour Office (ILO) and should not be considered an official ILO translation. The ILO is not responsible for the content or accuracy of this translation.',
    translationAr: 'لم يُنجز مكتب العمل الدولي (ILO) هذه الترجمة، ولا تُعدّ ترجمة رسمية صادرة عنه، والمكتب غير مسؤول عن محتواها أو دقتها.',
    identity: B(
      'لا تستخدم هذه الوحدة شعار مكتب العمل الدولي ولا شعار SIYB، ولا تعني أن المكتب اعتمدها أو أقرّها.',
      'This module does not use the ILO or SIYB logos or emblems and does not imply ILO approval or endorsement.'),
    data: B(
      'تُحفظ إجاباتك على هذا الجهاز وفي هذا المتصفح فقط (التخزين المحلي)، ولا تُرسل إلى أي خادم، وتعمل دون اتصال. بياناتك هنا منفصلة تماماً عن بيانات «احتساب التكاليف» و«المشتريات والمخزون». لنقل عملك إلى جهاز آخر أو الاحتفاظ بنسخة، صدّر نسخة احتياطية.',
      'Your answers are saved on this device and in this browser only (local storage); they are never sent to a server, and the module works offline. Your data here is completely separate from the Cost Calculation and Purchasing & Stock modules. To move your work to another device or keep a copy, export a backup.')
  };

  /* ---------- Part I content (Phase 2): short original adaptations of the manual's topics ---------- */
  const P1 = {
    areas: [
      { id: 'passion', t: B('الشغف', 'Passion'), q: B('هل أنت متحمس لفكرة امتلاك مشروعك، وهل ستواصل حتى حين يصعب الأمر؟', 'Are you excited about running your own business, and would you keep going when it gets hard?') },
      { id: 'goals', t: B('التوجه نحو الأهداف', 'Goal orientation'), q: B('هل تضع لنفسك أهدافاً واضحة وتعمل بإصرار لتحقيقها؟', 'Do you set clear goals for yourself and work steadily to reach them?') },
      { id: 'decisions', t: B('اتخاذ القرارات', 'Making decisions'), q: B('هل تستطيع أن تقرر في الوقت المناسب بعد دراسة الخيارات، وتتحمل نتيجة قراراتك؟', 'Can you decide in good time after weighing the options, and accept the results of your decisions?') },
      { id: 'risk', t: B('تحمل المخاطرة', 'Taking risks'), q: B('هل تقبل المخاطر المحسوبة وتعرف كيف تقلل أثرها؟', 'Do you accept calculated risks and know how to reduce their impact?') },
      { id: 'stress', t: B('القدرة على تحمل الضغط', 'Ability to handle stress'), q: B('هل تبقى هادئاً وفعّالاً حين يزداد العمل والضغط؟', 'Do you stay calm and effective when work and pressure increase?') },
      { id: 'support', t: B('الدعم الاجتماعي', 'Social support'), q: B('هل تجد دعماً من أسرتك وأصدقائك ومعارفك لتحمل متطلبات المشروع؟', 'Do your family, friends and acquaintances support you in facing the demands of a business?') },
      { id: 'finance', t: B('وضعك المالي', 'Financial situation'), q: B('هل لديك ما تبدأ به، أو مصادر تمويل ممكنة، وهل تستطيع تدبّر أمرك في بدايات قد تكون قليلة الدخل؟', 'Do you have something to start with, or possible sources of funds, and can you manage through a start that may bring little income?') },
      { id: 'mgmt', t: B('مهارات إدارة المشروع', 'Business management skills'), q: B('هل لديك أو تستطيع اكتساب مهارات البيع والحسابات والتنظيم وإدارة الناس؟', 'Do you have, or can you gain, skills in selling, record keeping, organising and managing people?') },
      { id: 'community', t: B('الالتزام تجاه مجتمعك', 'Commitment to your community'), q: B('هل يهمك أن يفيد مشروعك مجتمعك وأن تراعي الناس والبيئة من حولك؟', 'Do you care that your business benefits your community and respects the people and environment around you?') }
    ],
    answers: [
      { v: 'strength', t: B('نقطة قوة', 'Strength') },
      { v: 'improve', t: B('تحتاج تحسيناً', 'Needs improvement') },
      { v: 'unsure', t: B('لست متأكداً', 'Not sure') }
    ],
    reflective: B(
      'هذا التقييم للتأمل الذاتي وليس اختباراً: لا توجد نتيجة نجاح أو رسوب، ولا حكم بأنك مناسب أو غير مناسب. هدفه أن ترى نقاط قوتك والمجالات التي تستحق عنايتك، فتخطط لتقويتها.',
      'This assessment is for self-reflection, not a test: there is no pass or fail, and no verdict on whether you are suited. It helps you see your strengths and the areas that deserve attention, so you can plan to strengthen them.'),
    act1Intro: B(
      'اختر المجالات التي ترى أنها أكثر ما يحتاج إلى تحسين ونمو لديك الآن، ثم دوّن ما يهمك. يمكنك البدء من المجالات التي علّمتها «تحتاج تحسيناً»، ثم تعدّل الاختيار كما تشاء.',
      'Choose the areas that most need improvement and growth for you now, then write what matters to you. You can start from the areas you marked "Needs improvement" and adjust the choice freely.'),
    types: [
      { id: 'manufacturing', t: B('التصنيع', 'Manufacturing'), d: B('تصنع منتجاً من مواد خام أو مكونات وتبيعه (مثل الخبز أو الأثاث أو الملابس).', 'You make a product from raw materials or components and sell it (for example bread, furniture or clothes).') },
      { id: 'service', t: B('تقديم الخدمات', 'Service provision'), d: B('تبيع وقتك ومهارتك لا سلعة مادية (مثل التوصيل أو التصليح أو التدريب).', 'You sell your time and skill rather than a physical product (for example delivery, repairs or training).') },
      { id: 'wholesale', t: B('البيع بالجملة', 'Wholesaling'), d: B('تشتري بكميات كبيرة وتبيع لتجار ومشاريع أخرى.', 'You buy in large quantities and sell to traders and other businesses.') },
      { id: 'retail', t: B('البيع بالتجزئة', 'Retailing'), d: B('تشتري من تجار الجملة أو المنتجين وتبيع للمستهلك النهائي بكميات صغيرة.', 'You buy from wholesalers or producers and sell to final consumers in small quantities.') }
    ],
    cases: [
      { n: B('حسن', 'Hasan'), f: B('نقل وتوصيل', 'Courier'), ty: 'service', s: B('يقدم خدمة توصيل الطرود داخل المدينة.', 'Delivers parcels inside the city.') },
      { n: B('ماريا', 'Maria'), f: B('خضروات عضوية', 'Organic vegetables'), ty: 'manufacturing', s: B('تزرع الخضروات العضوية وتبيعها.', 'Grows organic vegetables and sells them.') },
      { n: B('كيم', 'Kim'), f: B('الأزياء', 'Fashion'), ty: 'wholesale', s: B('تبيع الملابس بالجملة للمحال.', 'Sells clothing in bulk to shops.') },
      { n: B('غيتوكو', 'Githuku'), f: B('مواد البناء', 'Construction materials'), ty: 'retail', s: B('يبيع مواد البناء للأفراد في محله.', 'Sells building materials to individuals in his shop.') }
    ],
    fieldIntro: B(
      '«المجال» هو ما تعمل فيه (مثل الغذاء أو الأزياء أو البناء)، و«النوع» هو كيف تعمل فيه (تصنيع أو خدمات أو جملة أو تجزئة). المجال الواحد قد يحتمل أكثر من نوع، لذلك يتقاطعان في شبكة. الحالات الأربع أدناه أمثلة فقط.',
      'The "field" is what you work in (such as food, fashion or construction); the "type" is how you work in it (manufacturing, service, wholesale or retail). One field can host more than one type, so they cross in a grid. The four cases below are only examples.'),
    prompts: {
      interests: B('اهتماماتك وهواياتك: ما الذي تحب فعله وتجيده؟ (سطر لكل مجال محتمل)', 'Your interests and hobbies: what do you enjoy doing and do well? (one line per possible field)'),
      experience: B('خبراتك: أين عملت أو تعلمت، وماذا اكتسبت؟', 'Your experience: where have you worked or learned, and what did you gain?'),
      skills: B('مهاراتك: ماذا تتقن عملياً؟', 'Your skills: what can you do well in practice?'),
      network: B('شبكة علاقاتك: من تعرف ممن قد يساعدك أو يشتري منك أو يعلّمك؟', 'Your network: who do you know who could help, buy from you or teach you?'),
      why: B('لماذا يناسبك هذا المجال وهذا النوع؟', 'Why do this field and this type suit you?')
    },
    strengthen: [
      B('تعلّم من أصحاب أعمال ناجحين: زر مشروعاً مشابهاً أو اسأل صاحبه.', 'Learn from successful business owners: visit a similar business or ask its owner.'),
      B('احضر تدريباً أو دورة في المهارة الناقصة.', 'Attend training or a course in the missing skill.'),
      B('اكتسب خبرة بالعمل أو التطوع في مشروع مماثل.', 'Gain experience by working or volunteering in a similar business.'),
      B('اقرأ وتابع مواد تعليمية موثوقة عن إدارة الأعمال.', 'Read and follow reliable learning material on running a business.'),
      B('اطلب نصيحة وإرشاداً من مرشد أو صديق ذي خبرة.', 'Ask for advice and guidance from a mentor or an experienced friend.'),
      B('جرّب أولاً بخطوة صغيرة لتختبر قدرتك قبل الالتزام الكبير.', 'Try a small first step to test your ability before a large commitment.'),
      B('اشرح لأسرتك خطتك واطلب دعمها وتفهمها.', 'Explain your plan to your family and ask for their understanding and support.')
    ],
    strengthenNote: B(
      'خطة العمل الكاملة (النشاط 2: ماذا ستفعل ومتى) تُضاف في مرحلة لاحقة من الوحدة وتجمع كل ما تحتاج تقويته. دوّن الآن ما ينفعك في ملاحظات النشاط 1.',
      'The full action plan (Activity 2: what you will do and when) is added in a later stage of the module and gathers everything you need to strengthen. For now, note what helps you in the Activity 1 notes.')
  };

  /* ---------- Parts II and III content (Phase 3): short original adaptations ---------- */
  const P2 = {
    intro: B('أنشئ فكرة مشروع واضحة قبل أن تبدأ: الجهد والمال قد يضيعان إن بدأت المشروع الخطأ. الحالتان أدناه ملخصان قصيران بصياغتنا لما ورد في الدليل.', 'Shape a clear business idea before you start: effort and money can be lost if you start the wrong business. The two cases below are our own short summaries of those in the manual.'),
    janet: { n: B('حالة Janet', 'Janet\'s case'), s: B('تملك Janet مزرعة صغيرة ولا يكفي دخل الأسرة لتعليم الأطفال. قررت تربية الدجاج وتملك قرضاً صغيراً، ثم سمعت أن زيت عباد الشمس مطلوب فغيّرت فكرتها بسرعة وأنفقت القرض على البذور والأسمدة ومعدات العصر دون تجربة سابقة ودون التأكد من السوق. ضاقت أرض الأسرة عن غذائها، وأمرضت الأسمدة الأطفال، واحتاجت عاملاً، وامتلأ السوق بزيت المزارعين الآخرين، فباعت بسعر زهيد ولم تسدد القرض.', 'Janet has a small farm and the family income does not cover the children\'s education. She planned to raise chickens and had a small loan, then heard sunflower oil was in demand and quickly changed her idea. She spent the loan on seeds, fertiliser and pressing equipment with no experience and no check of the market. Family land was lost to food growing, the fertiliser made the children ill, she needed paid help, and the market filled with other farmers\' oil, so she sold cheaply and could not repay the loan.'), q: B('ما الخطأ في فكرة Janet، ولماذا؟', 'What is wrong with Janet\'s idea, and why?') },
    lily: { n: B('حالة Lily', 'Lily\'s case'), s: B('تعمل Lily في مصنع ملابس براتب منخفض. سمعت شكوى قريبتها من صعوبة إيجاد ملابس لابنتها المراهقة، فتجولت في المحال ولاحظت قلة الخيارات لهذه الفئة. رسمت تصاميم وعرضتها على أصحاب المحال وسألتهم عن السعر والكمية، ثم اشترت آلة خياطة بمدخراتها وعملت مساءً. بيعت الفساتين جيداً بالدفع نقداً، فتركت المصنع وصارت تتلقى طلبات منتظمة.', 'Lily works in a garment factory for low pay. She heard a relative complain she could not find clothes for her teenage daughter, toured the shops and saw few choices for that age group. She drew designs, showed them to shop owners asking about price and quantity, then bought a sewing machine from her savings and worked evenings. The dresses sold well for cash, so she left the factory and now receives regular orders.'), q: B('لماذا نجحت Lily؟ ماذا فعلت؟', 'Why is Lily successful? What did she do?') },
    elements: [
      { id: 'need', t: B('الحاجة', 'The need'), q: B('أي حاجة لدى الزبائن سيلبّيها مشروعك، وأي زبائن ستجذب؟', 'Which customer need will your business fulfil, and which customers will it attract?') },
      { id: 'offering', t: B('السلعة أو الخدمة', 'The good or service'), q: B('ماذا ستبيع تحديداً؟', 'What exactly will you sell?') },
      { id: 'customers', t: B('الزبائن', 'The customers'), q: B('لمن ستبيع؟', 'Who will you sell to?') },
      { id: 'selling', t: B('طريقة البيع', 'How you will sell'), q: B('كيف ستصل إلى زبائنك وتبيع لهم؟', 'How will you reach your customers and sell to them?') },
      { id: 'environment', t: B('البيئة', 'Environment'), q: B('إلى أي حد يعتمد مشروعك على البيئة والموارد الطبيعية، وما أثره فيها وفي المجتمع؟', 'How far does your business depend on, and affect, the environment, natural resources and the community?') }
    ],
    act3: B('اكتب فكرة أو أكثر بعناصرها الخمسة. الفكرة غير المكتملة تبقى مسودة ولا تُعدّ فكرة جاهزة. تُحفظ أفكارك في قائمة أفكاري (النشاط 10).', 'Write one or more ideas with their five elements. An incomplete idea stays a draft and is not treated as a ready idea. Your ideas are kept in My ideas list (Activity 10).')
  };

  const P3 = {
    hamisi: { s: B('عمل Hamisi خمس سنوات لدى مستورد مواقد غاز، وعرضت عمته أن تموّله. فكّر أولاً ببيع حقائب السيزال للسياح فتبيّن أن السياح قليلون، ثم بمحل مواقد غاز فوجد السوق مزدحماً ومبيعاته ضعيفة. وحين ساعد عمته في نقل أثاثها لاحظ أنه لا توجد شركة نقل وتغليف في منطقته، فبحث في الأمر ووصف فكرته بعناصرها الخمسة، وبدأ بأقاربه وأصدقائه وزبائن عمته، وصار يعيد استخدام الكراتين.', 'Hamisi worked five years for a gas-stove importer and his aunt offered to fund him. He first thought of selling sisal bags to tourists but found there were too few tourists, then of a gas-stove shop but found a crowded, slow market. When he helped his aunt move he noticed no packing-and-moving company in his area, researched it and described his idea with its five elements, starting with relatives, friends and his aunt\'s customers and reusing cartons.'), q: B('ماذا فعل Hamisi ليصل إلى فكرته؟ ولماذا لم يتمسك بأول فكرة؟', 'What did Hamisi do to find his idea, and why did he not stay with his first idea?') },
    act4: {
      intro: B('اختر حتى ثلاثة مشاريع ناجحة في منطقتك (يفضّل أن يكون عمرها ثلاث سنوات على الأقل)، وقابل أصحابها، وسجّل ما تعلمته في «نموذج تحليل أفكار الأعمال».', 'Choose up to three successful businesses in your area (preferably at least three years old), interview their owners and record what you learn in the Business Ideas Analysis Form.'),
      fields: [
        { k: 'name', l: B('اسم المشروع', 'Business name') },
        { k: 'goods', l: B('السلع أو الخدمات التي يبيعها', 'Goods or services sold') },
        { k: 'customers', l: B('الزبائن', 'Customers') },
        { k: 'whenWhy', l: B('متى ولماذا بدأ المشروع؟', 'When and why was it started?'), r: 2 },
        { k: 'whyGood', l: B('لماذا اعتبر صاحبه الفكرة جيدة؟', 'Why did the owner consider it a good idea?'), r: 2 },
        { k: 'needKnown', l: B('كيف عرف حاجة الزبائن؟', 'How did the owner understand customer needs?'), r: 2 },
        { k: 'strengths', l: B('نقاط القوة والأصول التي استفاد منها (خبرة، علاقات، مهارات)', 'Strengths and assets used (experience, contacts, skills)'), r: 2 },
        { k: 'problems', l: B('مشكلات البداية', 'Start-up problems'), r: 2 },
        { k: 'changes', l: B('ما الذي تغيّر مع الوقت؟', 'What changed over time?'), r: 2 },
        { k: 'impact', l: B('الأثر في البيئة والمجتمع', 'Impact on the environment and community'), r: 2 },
        { k: 'lessons', l: B('الدروس التي تعلمتها', 'Lessons you learned'), r: 2 },
        { k: 'mistakes', l: B('أخطاء ترى أنه ارتكبها', 'Mistakes you think were made'), r: 2 },
        { k: 'avoid', l: B('كيف تتجنبها؟', 'How could you avoid them?'), r: 2 }
      ]
    },
    act5: {
      intro: B('تأمل تجاربك وتجارب غيرك كزبائن وما واجهته من صعوبات ومشكلات بيئية، وسجّل لكل تجربة فكرة مشروع مرتبطة بها.', 'Reflect on your own and other people\'s experiences as customers, and on difficulties and environmental problems, and record a related business idea for each.'),
      cats: [
        { id: 'mine', t: B('تجاربي كزبون', 'My experiences as a customer') },
        { id: 'others', t: B('تجارب الآخرين كزبائن', 'Other people\'s experiences as customers') },
        { id: 'poor', t: B('شكاوى من سوء الخدمة', 'Comments on poor service') },
        { id: 'difficulty', t: B('صعوبات واجهتها', 'Difficulties I met') },
        { id: 'env', t: B('مشكلات بيئية', 'Environmental problems') }
      ],
      fields: [{ k: 'experience', l: B('التجربة أو المشكلة', 'The experience or problem'), r: 2 }, { k: 'idea', l: B('فكرة المشروع المرتبطة', 'Related business idea') }]
    },
    act6: {
      intro: B('تجوّل في منطقتك التجارية وسجّل المشاريع حسب المجال، ثم دوّن ملاحظاتك. المخطط أدناه يلخص ما أدخلتَه أنت وهو ملاحظات متعلم لا بيانات سوق رسمية.', 'Walk around your business area and record the businesses by field, then note your observations. The chart below summarises what you entered and shows learner observations, not official market data.'),
      fields: [
        { k: 'category', l: B('المجال أو الفئة', 'Field or category') },
        { k: 'name', l: B('اسم المشروع أو نوعه', 'Business name or type') },
        { k: 'count', l: B('العدد أو الملاحظة (رقم)', 'Count or observation (number)'), num: true },
        { k: 'density', l: B('كثافة المنافسين (تقدير نوعي)', 'Competitor density (qualitative)'), sel: [['', B('—', '—')], ['low', B('قليلة', 'Low')], ['medium', B('متوسطة', 'Medium')], ['high', B('كبيرة', 'High')]] }
      ],
      obs: B('خمس ملاحظات على السوق المحلي', 'Five observations about the local market'),
      missing: B('مشاريع غير متوفرة حالياً في منطقتك (سطر لكل مشروع)', 'Businesses not currently available in your area (one per line)'),
      opps: B('فرص محتملة (سطر لكل فرصة)', 'Possible opportunities (one per line)')
    },
    act7: {
      intro: B('افحص بيئتك من المصادر الستة التالية: سجّل ما لاحظته وفكرة مشروع مرتبطة به.', 'Scan your environment through the six sources below: record what you noticed and a related business idea.'),
      sources: [
        { id: 'natural', t: B('الموارد الطبيعية', 'Natural resources'), h: B('ما الموارد المتوفرة محلياً ولا تُستثمر؟', 'Which local resources are available but not used?') },
        { id: 'people', t: B('خصائص ومهارات أهل المجتمع المحلي', 'Characteristics and skills of local people'), h: B('ما المهارات والحِرف الشائعة بين الناس حولك؟', 'Which skills and crafts are common among people around you?') },
        { id: 'waste', t: B('النفايات والمخلفات', 'Waste products'), h: B('ما المخلفات التي يمكن إعادة استخدامها أو تحويلها؟', 'Which waste could be reused or turned into something?') },
        { id: 'import', t: B('الاستعاضة عن الاستيراد', 'Import substitution'), h: B('ما المنتجات التي تُستورد ويمكن إنتاجها محلياً؟', 'Which imported products could be produced locally?') },
        { id: 'pubs', t: B('المطبوعات والنشرات', 'Publications'), h: B('ما الأفكار التي تقرؤها في الصحف والمجلات والمواقع المتخصصة؟', 'What ideas do you read in newspapers, magazines and specialist sites?') },
        { id: 'fairs', t: B('المعارض والأسواق التجارية', 'Trade fairs and exhibitions'), h: B('ما الجديد الذي رأيته في المعارض؟', 'What new things did you see at fairs and exhibitions?') }
      ],
      fields: [{ k: 'obs', l: B('ما لاحظته', 'What you noticed'), r: 2 }, { k: 'idea', l: B('فكرة مشروع مرتبطة', 'Related business idea') }]
    },
    act8: {
      intro: B('العصف الذهني المفتوح: اختر كلمة بداية (مجال أو مهارة أو خبرة أو دراسة أو اهتمام) ثم اكتب بسرعة كل ما يخطر ببالك. لا تقيّم ولا ترفض أي فكرة الآن؛ يمكنك لاحقاً مراجعتها ونقل ما يعجبك إلى قائمة أفكارك.', 'Open brainstorming: choose a starting word (a field, skill, work experience, education or interest) then quickly write everything that comes to mind. Do not judge or reject any idea now; later you can review them and move the ones you like to your ideas list.'),
      kinds: [['field', B('مجال', 'Field')], ['skill', B('مهارة', 'Skill')], ['work', B('خبرة عمل', 'Work experience')], ['edu', B('دراسة', 'Education')], ['interest', B('اهتمام', 'Interest')]]
    },
    act9: {
      intro: B('العصف الذهني المنظَّم: اكتب منتجاً، ثم ابحث عن فرص مرتبطة به في خمسة خطوط.', 'Structured brainstorming: enter a product, then look for related opportunities along five lines.'),
      lines: [
        { id: 'production', t: B('الإنتاج', 'Production'), h: B('ما الذي يلزم لإنتاجه أو ما الذي يدخل في صنعه؟', 'What is needed to make it, or what goes into making it?') },
        { id: 'selling', t: B('البيع', 'Selling'), h: B('كيف يُباع ويُوزَّع ويُسوَّق؟', 'How is it sold, distributed and marketed?') },
        { id: 'reuse', t: B('إعادة الاستخدام والتدوير', 'Re-use and recycling'), h: B('ماذا يمكن فعله بمخلفاته أو بعد استعماله؟', 'What can be done with its waste or after its use?') },
        { id: 'spinoff', t: B('أنشطة فرعية', 'Spin-off activities'), h: B('ما المنتجات أو الأنشطة المشتقة منه؟', 'Which products or activities can spin off from it?') },
        { id: 'services', t: B('الخدمات', 'Services'), h: B('ما الخدمات المرتبطة به (تركيب، صيانة، توصيل…)؟', 'Which related services (installation, repair, delivery…)?') }
      ]
    },
    bank: {
      intro: B('قائمة أفكارك: أضف كل فكرة تخطر لك، وعدّلها ورتّبها. كثرة الأفكار هدف في هذه المرحلة؛ الغربلة تأتي في الجزء الرابع. حالة «مرشحة» تعني فقط أنك تريد فحصها، وليست حكماً على جدواها.', 'Your ideas list: add every idea that occurs to you, edit and organise them. Many ideas is the goal at this stage; screening comes in Part IV. "Shortlisted" only means you want to examine it, not a verdict on its viability.'),
      statuses: [['draft', B('مسودة', 'Draft')], ['review', B('للمراجعة', 'To review')], ['shortlisted', B('مرشحة', 'Shortlisted')], ['notproceeding', B('لن تُنفَّذ', 'Not proceeding')], ['selected', B('مختارة', 'Selected')]],
      sources: [['own', B('من عندي', 'My own')], ['owners', B('أصحاب مشاريع ناجحة', 'Successful owners')], ['experience', B('التجارب', 'Experiences')], ['survey', B('مسح المنطقة', 'Local survey')], ['scan', B('فحص البيئة', 'Environmental scan')], ['brain', B('عصف ذهني', 'Brainstorming')], ['structured', B('عصف منظَّم', 'Structured brainstorming')], ['other', B('أخرى', 'Other')]]
    }
  };

  return { B, GROUPS, PARTS, SECTIONS, HOME, ABOUT, P1, P2, P3 };
})();
