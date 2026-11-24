/* IYB Planning – Part III content ("Forecasting Changes in the External Environment", printed pp. 29–36).
   Source: ILO (2015), verified against the original PDF. Arabic = PRELIMINARY translation. Plastic Solutions (Juma) statements are the manual's own examples.
   The forecasts workspace is application guidance (labelled), not manual content. */
(() => {
  const B = (ar, en) => ({ ar, en });
  const p = (ar, en) => ({ t: 'p', x: B(ar, en) });
  const h = (ar, en) => ({ t: 'h', x: B(ar, en) });
  const ul = (items) => ({ t: 'ul', items: items.map((i) => B(i[0], i[1])) });
  const note = (ar, en) => ({ t: 'note', x: B(ar, en) });
  const app = (ar, en) => ({ t: 'app', x: B(ar, en) });
  const C = window.SIYB_PYP_CONTENT = window.SIYB_PYP_CONTENT || {};
  C.p3 = [
    { id: 'intro', pg: '29–30', title: B('ما هو التوقّع؟', 'What is a forecast?'), blocks: [
      p('مشروعك لا يعمل بمعزل عن غيره؛ إنه يعمل في سوق. ولذلك، ولكي تضمن أن خطط التحسين لديك قابلة للتنفيذ، يجب أن تفهم العوامل الخارجية أيضاً. وبالنسبة لرواد الأعمال من المهم أن يعرفوا ليس ما حدث فحسب، بل ما يُرجَّح أن يحدث في السوق. وهذا يعني أنك بحاجة إلى توقّع التغيّرات في البيئة الخارجية التي قد تؤثر في مشروعك.',
        'Your business does not stand alone. It is operating in a market. Therefore, to ensure that your improvement plans are feasible, you must understand external factors as well. For entrepreneurs, it is important to know not only what happened but also what is likely to happen in the market. It means you need to forecast changes in the external environment that may affect your business.'),
      h('1. ما هو التوقّع؟', '1. What is a forecast?'),
      p('التوقّع هو تنبؤك بما سيحدث لمشروعك في المستقبل. وعندما تعرف ما يُرجَّح أن يحدث يمكنك التخطيط مسبقاً. فمثلاً تخبرك نشرة الطقس في الراديو أو التلفاز بما يُرجَّح أن يكون عليه الطقس غداً لتستعد له.',
        'A forecast is your prediction of what will happen to your business in the future. When you know what is likely to happen you can plan ahead. For example, a weather forecast on the radio or television tells you what the weather is likely to be on the next day so that you can get ready.'),
      ul([['«يجب أن نأخذ مظلاتنا إلى العمل والمدرسة. غداً ستمطر.»', '“We must take our umbrellas to work and school. Tomorrow it will rain.”']]),
      p('عندما تعدّ خططاً لمشروعك ينبغي أن تتوقع التغيّرات التي يُرجَّح أن تحدث في البيئة الخارجية وكيف ستؤثر في مشروعك. وقد ترغب في تقدير أثر هذه التغيّرات في تسويقك ومبيعاتك وعملية إنتاجك وتكاليفك وأرباحك وتدفقك النقدي مستقبلاً. أو قد ترغب حتى في إعادة تقييم نقاط قوة مشروعك وضعفه وتحديد فرص وتهديدات جديدة.',
        'When you make plans for your business you should anticipate the changes that are likely to occur in the external environment and how they will affect your business. You may want to estimate how the changes will impact your marketing, sales, production process, costs, profit and cash flow in the future. Or you may even want to reassess your business’ strengths and weaknesses and identify new opportunities and threats.'),
      p('انظر كيف يفكر أصحاب الأعمال مسبقاً ويضعون التوقعات:', 'Look at how these business people think ahead and make forecasts.'),
      ul([
        ['«الزبائن أكثر مطالبة. سيفضّلون الصالونات التي لا تكتفي بالعناية بشعرهم بل تساعدهم على الاسترخاء أيضاً.» — يمكن لصاحب المشروع أن يتوقع تغيّرات في سلوك الزبائن الشرائي.', '“Customers are more demanding. They will prefer salons which not only take care of their hair but also help them relax.” — A business person can forecast changes in customers’ buying behaviours.'],
        ['«استيراد الملابس الرخيصة من بلدنا المجاور في ازدياد. سيكون الوضع صعباً جداً على مشاريع الخياطة المحلية.» — يمكن لصاحب المشروع أن يتوقع تغيّرات في المنافسة في السوق.', '“Import of cheap clothing from our neighboring country is increasing. It will be very tough for local tailoring businesses.” — A business person can forecast changes in market competition.'],
        ['«سيبدأ سوبرماركت قريب العمل العام القادم. سيجذب كثيراً من زبائني.» — يمكن لصاحب المشروع أن يتوقع تغيّرات تؤثر في مبيعاته.', '“A nearby supermarket is going to start operating next year. It will attract many of my customers.” — A business person can forecast changes that affect his or her sales.'],
        ['«قد ينخفض سعر الصرف هذا العام نتيجة التضخم. سيرتفع سعر المواد المستوردة.» — يمكن لصاحب المشروع أن يتوقع تغيّرات في سعر المواد الخام.', '“The exchange rate may be lower this year as a result of inflation. The price of imported materials will rise.” — A business person can forecast changes in the price of raw materials.']])] },

    { id: 's2', pg: '31–32', title: B('٢. تغيّرات قد تؤثر في مبيعاتك وتسويقك', '2. Changes that may impact your sales and marketing'), blocks: [
      p('فكّر في البيئة التي يعمل فيها مشروعك وفي أي أمر سيؤثر في مبيعاتك وتسويقك.', 'Think about the environment in which your business is operating and consider anything that will affect your sales and marketing.'),
      { t: 'ex', id: 'fc1', title: B('فكّر', 'Think about it'), qs: [B('ما التغيّرات في البيئة الخارجية التي قد تؤثر في مبيعات المشاريع وتسويقها؟', 'What changes in the external environment may affect the sales and marketing of businesses?')], ans: null },
      p('هناك تغيّرات كثيرة في البيئة الخارجية قد تؤثر في مبيعات المشروع وتسويقه. وفيما يلي بعض الأمثلة:', 'There are many changes in the external environment that may affect the sales and marketing of a business. Below are some examples:'),
      ul([
        ['الزبائن: تغيّر طلب الزبائن. سلوك المستهلكين سيؤثر بالتأكيد في عدد المنتجات التي يستطيع المشروع بيعها. وتغيّر طلب الزبائن يتطلب استجابات تسويقية مناسبة، مثل تحسين المنتجات الحالية أو تجديدها أو تغيير قنوات التوزيع.', 'Customers: Changes in demand of customers. The behaviour of the consumers will definitely have an impact on the number of products a business can sell. Changes in customers’ demand require appropriate marketing responses, such as improving or renewing current products, changing distribution channels, etc.'],
        ['المنافسون: إذا اشتدت المنافسة فقد يضطر المشروع إلى تخفيض أسعار منتجاته أو القيام بمزيد من العروض الترويجية.', 'Competitors: If competition becomes fiercer, a business may have to reduce the price of its products or run more promotions.'],
        ['المنتجات البديلة: إذا ظهر منتج بديل جديد في السوق فسيتوفر للزبائن خيارات أكثر، ومن المحتمل أن يخسر المشروع الذي يبيع المنتج القديم وحده عدداً من زبائنه.', 'Alternative products: If there is a new alternative product in the market, customers will have more options and it is possible that a business that sells only the old product will lose a certain number of customers.'],
        ['الاقتصاد: عندما يكون الاقتصاد في توسع يكون الزبائن مستعدين لإنفاق مال أكثر، وعندما يكون في ركود ينفقون أقل.', 'Economy: When the economy is expanding, customers are willing to spend more money; and when the economy is in a recession, customers will spend less.'],
        ['اللوائح والسياسات: اللوائح والسياسات الجديدة التي تؤثر في سلوك الزبائن الشرائي، مثل الضرائب على الاستيراد أو ضريبة القيمة المضافة، تزيد التكلفة فتؤثر في الطلب على تلك السلعة أو الخدمة.', 'Regulations and policies: New regulations and policies that impact customers’ buying behaviours, such as import taxes or value added taxes will increase the cost, which will then affect the demand for that good or service.']]),
      p('ستتعلم من التجربة عن التغيّرات التي تؤثر في مبيعات مشروعك وتسويقه. وكلما اكتسبت خبرة أكثر أجدت التوقع أكثر. ولتتمكن من توقّع التغيّرات المذكورة أعلاه، اسأل نفسك باستمرار هذه الأسئلة:',
        'You will learn from experience about changes that affect the sales and marketing of your business. The more experience you accumulate, the better forecast you will make. To be able to forecast the above changes, constantly ask yourself these questions:'),
      ul([
        ['هل هناك أعمال أخرى بدأت تنافس مشروعي؟', 'Are there other businesses starting to compete with my business?'],
        ['هل يقدّم المنافسون منتجات أفضل من منتجاتنا؟', 'Are competitors introducing products that are superior to ours?'],
        ['هل هناك أي تغيّرات في طلب الزبائن أو سلوكهم الاستهلاكي؟', 'Are there any changes in customers’ demand or consuming behaviours?'],
        ['هل هناك أي لوائح أو سياسات جديدة أو تغيّرات في الاقتصاد يمكن أن تؤثر في مشروعي؟', 'Are there any new regulations, policies or changes in the economy that can affect my business?']]),
      p('فيما يلي بعض توقعات جوما عن التغيّرات في البيئة الخارجية التي قد تؤثر في مبيعات «بلاستيك سوليوشنز» وتسويقها:', 'Here are some of Juma’s forecasts about changes in the external environment that may affect Plastic Solutions’ sales and marketing:'),
      ul([
        ['الزبائن أكثر اهتماماً بالبيئة. يفضّلون المنتجات الصديقة للبيئة وسيكونون مستعدين لدفع مبلغ أكبر قليلاً مقابلها.', 'Customers are more concerned about the environment. They prefer environmentally friendly products and will be willing to pay a little bit more for those products.'],
        ['الاقتصاد جيد ومستقر.', 'The economy is doing well and stable.'],
        ['توجد منتجات بديلة كثيرة بسعر أقل.', 'There are plenty of alternative products with a lower price.']])] },

    { id: 'act4', pg: '32', activity: { no: 4, id: 'a4', title: B('هل توقعت أي تغيّرات في البيئة الخارجية قد تؤثر في مبيعات مشروعك وتسويقه في العام القادم؟ ما هي؟', 'Have you foreseen any changes in the external environment that may affect the sales and marketing of your business next year? What are they?'),
      qs: [B('هل توقعت أي تغيّرات في البيئة الخارجية قد تؤثر في مبيعات مشروعك وتسويقه في العام القادم؟ ما هي؟', 'Have you foreseen any changes in the external environment that may affect the sales and marketing of your business next year? What are they?')] }, blocks: [] },

    { id: 's3', pg: '32–34', title: B('٣. تغيّرات قد تؤثر في إنتاجك وتكاليفك', '3. Changes that may impact your production and costs'), blocks: [
      p('فكّر في البيئة التي يعمل فيها مشروعك، وفكّر أيضاً في أي أمر سيؤثر في إنتاجك وتكاليفك مستقبلاً.', 'Think about the environment in which your business is operating, plus think of anything that will affect your future production and costs.'),
      { t: 'ex', id: 'fc2', title: B('فكّر', 'Think about it'), qs: [B('ما التغيّرات في البيئة الخارجية التي قد تؤثر في إنتاج المشاريع وتكاليفها؟', 'What changes in the external environment may affect the production and costs of a business?')], ans: null },
      p('ربما دوّنت تغيّرات كثيرة بناءً على تجربتك الشخصية. وفيما يلي أمثلة على تغيّرات في البيئة الخارجية تؤثر في إنتاج المشروع وتكاليفه وقد لا تكون فكّرت فيها:', 'You may have listed many changes based on your personal experience. Below are some examples of changes in the external environment that affect the production and costs of a business that you may not have considered:'),
      ul([
        ['توريد المواد الخام: إذا أدّى أمر كسوء الطقس إلى نقص في المادة الخام التي يستخدمها المشروع فقد يؤدي ذلك إلى انقطاع في إنتاج المنتج وارتفاع سعر تلك المادة.', 'Supply of raw materials: If something such as bad weather leads to a shortage of the raw material that a business uses, it will possibly lead to an interruption in the production of the product and the price of that material will increase.'],
        ['التقنيات الجديدة: أمور مثل المواد الجديدة وعمليات الإنتاج المتقدمة وطرق إدارة النفايات الحديثة كثيراً ما تساعد المشاريع على خفض تكاليف الإنتاج وتحسين الإنتاجية ورفع جودة المنتج.', 'New technologies: Things such as new materials, advanced production processes and new waste management methods often help businesses reduce the costs of production, improve productivity and increase product quality.'],
        ['مشكلات توفر المهارات لمجموعات المنتجات: إذا أصبح العمال الذين يحتاج إليهم المشروع بمهاراتهم نادرين فقد يصعب عليه توظيف عدد كافٍ منهم وقد يضطر إلى دفع أكثر لاستقطاب أصحاب المهارات المناسبة.', 'Skills supply issues for product ranges: If workers with the skills needed for a business become scarce, the business may find it difficult to recruit enough people and may have to pay more to get the people who have the proper skills.'],
        ['الاقتصاد: التضخم وتقلبات أسعار الصرف أو الأزمة الاقتصادية تؤثر في جميع تكاليف المشروع.', 'Economy: Inflation, fluctuation in exchange rates or an economic crisis will impact all business costs.'],
        ['اللوائح والسياسات: السياسات الحكومية الجديدة، مثل قوانين حماية البيئة ومتطلبات إدارة النفايات أو اللوائح المتعلقة بمنافع العاملين والتأمين، قد تؤثر في إنتاج المشاريع وتشغيلها وتزيد التكاليف.', 'Regulations and policies: New government policies, such as environmental protection laws, waste management requirements or regulations concerning employee benefits and insurance may affect the production and operation of businesses and increase costs.']]),
      p('إذا حدثت هذه التغيّرات فتوقّع كيف ستؤثر في إنتاجك وفي كل بند من تكاليف مشروعك، ثم اسأل نفسك الأسئلة الآتية:', 'If these changes occur, forecast how the changes will impact your production as well as each of your business costs and then ask yourself the following questions:'),
      ul([
        ['هل هناك طرق أفضل لإنتاج سلعي أو خدماتي؟', 'Are there any better ways to produce my goods or services?'],
        ['هل هناك احتمال أن تشحّ المواد؟', 'Is there a possibility that materials will be in short supply?'],
        ['هل هناك مواد أرخص تلبي متطلباتنا؟', 'Are there any cheaper materials that meet our requirements?'],
        ['هل هناك تذبذب كبير في تكاليف المواد؟ وما علاقة التغيّر بتكاليفنا الإجمالية؟', 'Is there a significant fluctuation in Material Costs? How does the change relate to our overall costs?']]),
      note('عند الإجابة عن هذه الأسئلة تذكّر أن تكون واقعياً. احرص على أن تبني إجابتك على الحقائق، لا على الأمنيات والأحلام.', 'When answering these questions, remember to be realistic. Make sure you base your answer on facts, not on wishes and dreams.'),
      p('توقّعت جوما التغيّرات التي قد تؤثر في إنتاج «بلاستيك سوليوشنز» وتكاليفها كما يلي:', 'Juma forecasted changes that may affect Plastic Solutions’ production and costs as follows:'),
      ul([
        ['ارتفع سعر المواد الخام ارتفاعاً كبيراً هذا العام. لكن الأسعار لن تتذبذب العام القادم لأن توقعات الاقتصاد مستقرة.', 'The price of raw materials increased significantly this year. However, the prices will not fluctuate next year, as the forecast for the economy is stable.'],
        ['تقدّم الحكومة حوافز للمجمعات الصناعية لتشجيع ريادة الأعمال. سأستفيد من هذا البرنامج وأتفاوض على أجور أقل مع وكيلي العقاري.', 'The government is offering incentives for industrial complexes in order to encourage entrepreneurship. I will take advantage of this scheme and negotiate lower rates with my estate agent.']])] },

    { id: 'act5', pg: '34', activity: { no: 5, id: 'a5', title: B('هل توقعت أي تغيّرات في البيئة الخارجية قد تؤثر في الإنتاج والتكاليف في مشروعك العام القادم؟ ما هي؟', 'Have you foreseen any changes in the external environment that may affect the production and costs in your business next year? What are they?'),
      qs: [B('هل توقعت أي تغيّرات في البيئة الخارجية قد تؤثر في الإنتاج والتكاليف في مشروعك العام القادم؟ ما هي؟', 'Have you foreseen any changes in the external environment that may affect the production and costs in your business next year? What are they?')] }, blocks: [] },

    { id: 'bridge', pg: '34', title: B('من التوقّع إلى المخاطر', 'From forecasts to risks'), blocks: [
      p('يعتمد مشروعك على الفرص في البيئة الاقتصادية والبيئة السياسية والبيئة الاجتماعية والبيئة التقنية. غير أن هذه البيئات تنطوي أيضاً على تهديدات تُدخل عنصر المخاطرة على المشروع. وفي الجزء التالي سنتناول كيفية تحديد المخاطر وإدارتها.',
        'Your business depends on opportunities in the economic environment, the political environment, the social environment and the technological environment. However, these environments also present threats that bring the element of risk to the business. In the next part we will examine how to identify and manage risks.')] },

    { id: 'fcws', pg: '', title: B('مساحة عملي: سجل توقعاتي للتغيّرات الخارجية', 'My workspace: my external-change forecasts'), blocks: [
      app('سجّل هنا التغيّرات الخارجية التي تتوقعها (من الأنشطة 4 و5 وغيرها). كل بند أدناه توقّع وليس حقيقة: اكتب ما تستند إليه من وقائع، وأثره المتوقع في مشروعك، وما يمكن أن تفعله. لا يستخدم التطبيق بيانات سوق حية ولا يقترح توقعات.', 'Record here the external changes you expect (from Activities 4 and 5 and beyond). Each entry below is a forecast, not a fact: write the facts it rests on, its expected effect on your business and what you could do about it. The app uses no live market data and suggests no forecasts.')], workspace: 'forecast' },

    { id: 'sum', pg: '35', summary: true, title: B('ملخص الجزء الثالث', 'Summary of Part III'), blocks: [
      p('التوقّع يخبرك بما يُرجَّح أن يحدث في المستقبل.', 'A forecast tells you what is likely to happen in the future.'),
      p('التغيّرات في البيئة الخارجية تؤثر فعلاً في مشروعك. ولكي تخطط للمستقبل عليك أن تتوقع التغيّرات في البيئة الخارجية وترصد التغيّرات المرجّحة التي قد تؤثر في مشروعك وتقدّر أثرها فيه.', 'Changes in the external environment do impact your business. To plan for the future you have to forecast changes in the external environment, watch for likely changes that may affect your business and estimate their impact on your business.'),
      p('بعض أمثلة التغيّرات التي قد تؤثر في مبيعات مشروعك وتسويقه:', 'Some examples of change that may affect the sales and marketing of your business are:'),
      ul([['طلب الزبائن', 'Customers’ demand'], ['إجراءات المنافسين', 'Competitors’ actions'], ['المنتجات البديلة', 'Alternative products'], ['التغيّرات في الاقتصاد', 'Changes in the economy'], ['اللوائح والسياسات الجديدة', 'New regulations and policies']]),
      p('وبعض أمثلة التغيّرات التي قد تؤثر في عملية الإنتاج والتكاليف في مشروعك:', 'Some examples of changes that may affect the production and costs process of your business are:'),
      ul([['توريد المواد الخام والعمالة الماهرة', 'Supply of raw materials and skilled labour'], ['التقنيات الجديدة', 'New technologies'], ['التغيّرات في الاقتصاد', 'Changes in the economy'], ['اللوائح والسياسات الجديدة', 'New regulations and policies']])] },

    { id: 'as3', pg: '36', assess: 'a3', title: B('التقييم 3', 'Assessment 3'), blocks: [] }
  ];
})();
