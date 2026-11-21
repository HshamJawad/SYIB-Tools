(() => {
  const B = (ar, en) => ({ ar, en });
  const A = (window.SIYB_MK_ASSESS = window.SIYB_MK_ASSESS || {});
  const R = (window.SIYB_MK_ACT_ANSWERS = window.SIYB_MK_ACT_ANSWERS || {});

  A.asmt1 = {
    id: 'asmt1', no: 1, part: 'I', card: 'c02', src: '7', answerSrc: '94',
    title: B('التقييم 1', 'Assessment 1'),
    intro: B(
      'لقد أنهيت للتو الجزء الأول من هذا الدليل. قم بالتمرين أدناه للتأكد من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات الواردة في الصفحة 94. تمرّن على لغة الأعمال: أكمل كل جملة باختيار الكلمة أو الكلمات المناسبة من القائمة أدناه.',
      'You have just completed Part I of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 94. Practise your business language: Complete each sentence by choosing the right word or words from the list below.'
    ),
    kind: 'cloze',
    bank: [
      { v: 'a', t: B('المنتج / المنتجات', 'Product(s)') },
      { v: 'b', t: B('المكانة / المكانات (تحديد مكانة المنتج)', 'Position(s)') },
      { v: 'c', t: B('السعر / الأسعار', 'Price(s)') },
      { v: 'd', t: B('المستخدمون', 'People') },
      { v: 'e', t: B('الكلمة المنقولة (التسويق الشفهي)', 'Word of mouth') },
      { v: 'f', t: B('المكان / الأماكن', 'Place(s)') },
      { v: 'g', t: B('الترويج', 'Promotion') },
      { v: 'h', t: B('أسلوب / أساليب العمل', 'Process(es)') },
      { v: 'i', t: B('الدليل / الأدلة المادية', 'Physical evidence(s)') }
    ],
    story: [
      B(
        '«الفرصة الثانية» (Second Chance) مشروع ناجح جداً لبيع السلع المستعملة. تحدد «الفرصة الثانية» {1} نفسها بوصفها خياراً ذكياً للتسوق للأشخاص الأنيقين والمهتمين بالبيئة. تقدم «الفرصة الثانية» أنواعاً مختلفة من {2}، بدءاً من الملابس وإكسسوارات الموضة وصولاً إلى أثاث المنزل وأدوات المطبخ. وتكون {3} فيها أقل بكثير منها في السلع الجديدة. والنوع الوحيد من {4} الذي تقوم به «الفرصة الثانية» لجذب الزبائن هو توزيع منشورات عند التقاطع القريب من {5} الذي يقع فيه المتجر. وهي تعتمد أكثر على {6} من الزبائن. إن موظفيها مدرَّبون تدريباً جيداً جداً، إذ يعتقد أصحاب «الفرصة الثانية» أن {7} هم من يصنعون الفرق لمشروعهم. كما وضعوا {8} واضحاً جداً يجعل التسوق في «الفرصة الثانية» مريحاً إلى حد كبير. والتحسين الوحيد الذي ينبغي أن تجريه «الفرصة الثانية» هو إيجاد مزيد من {9} للتأكيد على صورتها الصديقة للبيئة.',
        'Second Chance is a very successful business selling second hand items. Second Chance {1} itself as a smart shopping option for stylish and environmentally friendly people. Second Chance offers various types of {2} from clothes and fashion accessories to home furniture and kitchen utensils. Its {3} are much lower than for new items. The only type of {4} that Second Chance does to attract customers is to give away leaflets at the intersection near the {5} that the shop is located. They rely more on {6} by the customers. Their staff is very well trained, as the owners of Second Chance believe that it is the {7} that make a difference for their business. They also set up a very clear {8} which makes shopping at Second Chance quite convenient. The only improvement that Second Chance should make is to create more {9} to emphasize its environmentally friendly image.'
      )
    ],
    key: { '1': 'b', '2': 'a', '3': 'c', '4': 'g', '5': 'f', '6': 'e', '7': 'd', '8': 'h', '9': 'i' }
  };

  A.asmt2 = {
    id: 'asmt2', no: 2, part: 'II', card: 'c03', src: '21', answerSrc: '94',
    title: B('التقييم 2', 'Assessment 2'),
    intro: B(
      'لقد أنهيت للتو الجزء الثاني من هذا الدليل. قم بالتمرين أدناه للتأكد من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات الواردة في الصفحة 94. أي إجابة صحيحة؟ اختر النهاية الصحيحة أو الأفضل لكل جملة.',
      'You have just completed Part II of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 94. Which one is correct? Choose the correct or best ending for each sentence.'
    ),
    kind: 'mcq',
    items: [
      {
        n: 1,
        q: B('أول ما ينبغي فعله في التسويق هو...', 'The first thing to do in marketing is to...'),
        opts: [
          { v: 'a', t: B('أن تبذل كل مهاراتك لصنع منتجاتك بالطريقة التي تحبها.', 'put all your skills into making your products the way you like them.') },
          { v: 'b', t: B('أن تعرف أكبر قدر ممكن عن احتياجات زبائنك وعمّا يستطيع المورّدون الآخرون تقديمه.', 'find out as much as possible about your customers’ needs and what other suppliers can offer.') },
          { v: 'c', t: B('أن تحاول صنع السلع أو الخدمات نفسها التي تصنعها المشاريع الأخرى.', 'try to make the same goods or services other businesses make.') }
        ],
        correct: 'b'
      },
      {
        n: 2,
        q: B('تتم عملية تحديد السوق المستهدف في...', 'The process of identifying a target market is done in...'),
        opts: [
          { v: 'a', t: B('خطوتين.', 'two steps.') },
          { v: 'b', t: B('ثلاث خطوات.', 'three steps.') },
          { v: 'c', t: B('أربع خطوات.', 'four steps.') }
        ],
        correct: 'b'
      },
      {
        n: 3,
        q: B('المكانة الجيدة ينبغي أن...', 'A good Position should...'),
        opts: [
          { v: 'a', t: B('تدوم إلى الأبد.', 'exist forever.') },
          { v: 'b', t: B('تستجيب لحاجة يقدّرها الزبائن تقديراً عالياً.', 'respond to a need that customers highly value.') },
          { v: 'c', t: B('تُراجَع وتُحدَّث بانتظام.', 'be reviewed and updated regularly.') }
        ],
        correct: 'c'
      },
      {
        n: 4,
        q: B('لتقسيم السوق، ينبغي أن تحدد...', 'To segment the market, you should identify...'),
        opts: [
          { v: 'a', t: B('مجموعات من الزبائن يتشاركون قيماً متشابهة.', 'groups of customers who share similar values.') },
          { v: 'b', t: B('مجموعات من الزبائن من العمر نفسه.', 'groups of customers who are the same age.') },
          { v: 'c', t: B('مجموعات من الزبائن يحبون مشروعك.', 'groups of customers who like your business.') }
        ],
        correct: 'a'
      },
      {
        n: 5,
        q: B('ينبغي أن تقيّم ما إذا كانت الشرائح التي تختارها لسوقك المستهدف...', 'You should assess whether the segments you choose for your target market...'),
        opts: [
          { v: 'a', t: B('تضم عدداً كافياً من الزبائن المحتملين ليحقق مشروعك الربح.', 'have enough potential customers for your business to make a profit.') },
          { v: 'b', t: B('لا يخدمها أي منافس بعد.', 'are not yet served by any competitors.') },
          { v: 'c', t: B('في نمو.', 'are growing.') }
        ],
        correct: 'a'
      }
    ]
  };

  A.asmt3 = {
    id: 'asmt3', no: 3, part: 'III', card: 'c04', src: '30', answerSrc: '94',
    title: B('التقييم 3', 'Assessment 3'),
    intro: B(
      'لقد أنهيت للتو الجزء الثالث من هذا الدليل. قم بالتمرين أدناه للتأكد من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات الواردة في الصفحة 94. تمرّن على لغة الأعمال: أكمل الفقرة باختيار الكلمة أو الكلمات المناسبة من القائمة أدناه.',
      'You have just completed Part III of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 94. Practise your business language: Complete the paragraph by choosing the right word or words from the list below.'
    ),
    kind: 'cloze',
    bank: [
      { v: 'a', t: B('الحاجة / الحاجات الأساسية', 'Basic need(s)') },
      { v: 'b', t: B('المنتج / المنتجات', 'Product(s)') },
      { v: 'c', t: B('الحاجة / الحاجات المحددة', 'Specific need(s)') },
      { v: 'd', t: B('البحث عن أفكار جديدة', 'Look(ing) for new ideas') }
    ],
    story: [
      B(
        'يملك دان محلاً يصنع ويبيع خزائن المطبخ. يُصنع {1} الخاص به من الخشب واللوح الخشبي والستانلس ستيل (inox). وغالباً ما يبحث الزبائن عن خزائن تناسب مساحة معينة في مطابخهم. ولتلبية هذه {2} يجب على دان أن يذهب إلى بيوت الزبائن ويقيس المساحة الفعلية. وكثيراً ما يوصي الزبائن الآخرين بخدمة دان لأنهم يقدّرون نصيحته بشأن المواد والألوان والتصاميم. وبتلبية هذه {3} يكون دان مشغولاً دائماً بتنفيذ الطلبات. ومع ذلك، كلما توفر لديه وقت فراغ يواصل {4} لتحسين منتجاته.',
        'Dan has a shop which makes and sells kitchen cupboards. His {1} is made from wood, board and inox. Customers often look for cupboards that fit a certain space in their kitchens. To meet this {2} Dan must go to customers’ homes and measure the actual space. Customers often recommend Dan’s service to others because they appreciate his advice about the materials, colours and styles. By fulfilling this {3} Dan is always busy filling orders. However, whenever he has free time he keeps {4} to improve his products.'
      )
    ],
    key: { '1': 'b', '2': 'a', '3': 'c', '4': 'd' }
  };

  A.asmt4 = {
    id: 'asmt4', no: 4, part: 'IV', card: 'c04', src: '40', answerSrc: '94',
    title: B('التقييم 4', 'Assessment 4'),
    intro: B(
      'لقد أنهيت للتو الجزء الرابع من هذا الدليل. قم بالتمرين أدناه للتأكد من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات الواردة في الصفحة 94. أي إجابة صحيحة؟ اختر الإجابات الصحيحة أو الأنسب.',
      'You have just completed Part IV of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 94. Which one is correct? Choose the correct or most appropriate answers.'
    ),
    kind: 'mcq',
    items: [
      {
        n: 1,
        q: B('على ماذا يعتمد إجمالي ربحك؟', 'What does your total profit depend on?'),
        opts: [
          { v: 'a', t: B('سعر القطعة الواحدة وتكلفة القطعة الواحدة', 'Price per item and cost per item') },
          { v: 'b', t: B('عدد القطع المباعة والربح من القطعة الواحدة', 'Number of items sold and profit per item') },
          { v: 'c', t: B('عدد القطع المباعة وسعر القطعة الواحدة', 'Number of items sold and price per item') }
        ],
        correct: 'b'
      },
      {
        n: 2,
        q: B('ماذا ينبغي أن تفعل قبل تحديد سعرك؟', 'What should you do before setting your price?'),
        opts: [
          { v: 'a', t: B('أن تعرف تكلفتك، وأن تعرف كم يرغب الزبائن في الدفع، وأن تعرف أسعار منافسيك', 'Know your cost, know how much customers are willing to pay, know your competitors’ prices') },
          { v: 'b', t: B('أن تعرف تكلفة منافسيك، وأن تعرف تكلفتك، وأن تعرف كيف تجعل سعرك جذاباً', 'Know your competitors’ cost, know your cost, know how to make your price attractive') },
          { v: 'c', t: B('أن تعرف تكلفتك، وأن تعرف كم سيدفع الزبائن، وأن تعرف أسعار منافسيك، وأن تعرف كيف تجعل سعرك جذاباً', 'Know your cost, know how much customers will pay, know your competitors’ prices and know how to make your price attractive') }
        ],
        correct: 'c'
      },
      {
        n: 3,
        q: B('متى ينبغي تقديم خصم الكمية؟', 'When should a quantity discount be offered?'),
        opts: [
          { v: 'a', t: B('عندما يدفع الزبائن نقداً', 'When customers pay in cash') },
          { v: 'b', t: B('عندما يشتري الزبائن بكميات كبيرة', 'When customers buy in large quantity') },
          { v: 'c', t: B('عندما يكون الموسم قليل النشاط لمشروعك', 'When it is low season for your business') }
        ],
        correct: 'b'
      },
      {
        n: 4,
        q: B('متى ينبغي تقديم السعر التعريفي (الافتتاحي)؟', 'When should an introductory price be offered?'),
        opts: [
          { v: 'a', t: B('عند إطلاق منتج جديد', 'When a new product is launched') },
          { v: 'b', t: B('عندما يشتري زبون جديد منتجك', 'When a new customer buys your product') },
          { v: 'c', t: B('عندما تكون هناك مناسبة خاصة', 'When there is a special event') }
        ],
        correct: 'a'
      }
    ]
  };

  A.asmt5 = {
    id: 'asmt5', no: 5, part: 'V', card: 'c05', src: '50', answerSrc: '94',
    title: B('التقييم 5', 'Assessment 5'),
    intro: B(
      'لقد أنهيت للتو الجزء الخامس من هذا الدليل. قم بالتمرين أدناه للتأكد من فهمك. أنهِ التمرين قبل مقارنة إجاباتك بالإجابات الواردة في الصفحة 94. تمرّن على لغة الأعمال: أكمل كل جملة باختيار الكلمة أو الكلمات المناسبة من القائمة أدناه.',
      'You have just completed Part V of this manual. Do the exercise below to check your understanding. Finish the exercise before comparing your answers with those on page 94. Practise your business language: Complete each sentence by choosing the right word or words from the list below.'
    ),
    kind: 'cloze',
    bank: [
      { v: 'a', t: B('تجار التجزئة', 'Retailers') },
      { v: 'b', t: B('الموقع', 'Location') },
      { v: 'c', t: B('تجار الجملة', 'Wholesalers') },
      { v: 'd', t: B('التوزيع', 'Distribution') },
      { v: 'e', t: B('التوزيع عبر الإنترنت', 'Online distribution') },
      { v: 'f', t: B('التوزيع المباشر', 'Direct distribution') }
    ],
    story: [
      B(
        '«أصدقاء المزارعين» (Friends Of Farmers) شركة مصنِّعة للأسمدة. تبيع الشركة منتجها إلى كثير من المزارعين في أنحاء البلاد. ويجب أن تستخدم {1}.',
        '1. Friends Of Farmers is a fertilizer manufacturer. The company sells its product to many farmers across the country. They must use {1}.'
      ),
      B(
        'يقع «بيت ضيافة روز» (Rose Guest House) قرب محطة القطار، لذا يمر به كثير من المسافرين. ولديه {2} جيد.',
        '2. Rose Guest House is near the train station, so many travellers pass by. It has a good {2}.'
      ),
      B(
        'يلتقط كن صوراً لجميع إطارات لوحاته الفنية وينشرها على صفحته الشخصية في إحدى شبكات التواصل الاجتماعي. وكل من يريد شراء إطار عليه فقط أن يختار تصميماً من الصور ويُعلمه بالمقاس. وسيصنع كن الإطارات حسب الطلب ويوصل المنتج. وتسمى هذه الطريقة {3}.',
        '3. Ken takes pictures of all his art frames and posts them on his personal page of a social network. Anyone who wants to buy a frame just needs to choose a design among the photos and let him know the size. Ken will make frames to order and deliver the product. It is called {3}.'
      ),
      B(
        'تصنع مارتا حقائب معقودة يدوية الصنع وتبيعها. يأتي زبائنها إلى محلها ويصفون الحقائب التي يريدونها. وتسمى طريقة التوزيع هذه {4a}. كما تبيع بعض الحقائب إلى {4b} في مركز «بونجور» التجاري (Bonjour shopping centre) حيث يوجد كثير من السياح الباحثين عن المنتجات اليدوية.',
        '4. Marta makes and sells hand-made knotted bags. Her customers come into her shop and describe the bags they want. This method of distribution is called {4a}. She also sells some bags to {4b} at Bonjour shopping centre where there are a lot of tourists looking for hand-made products.'
      )
    ],
    key: { '1': 'c', '2': 'b', '3': 'e', '4a': 'f', '4b': 'a' }
  };

  R.act7 = {
    src: '30',
    paras: [
      B(
        'ينبغي ألا توسّع «الخيار الأخضر» (Green Choice) خط منتجاتها ليشمل الأصناف غير المعتمدة. فإذا فعلت ذلك فستفقد المكانة التي صنعتها في أذهان زبائنها، وهي أنها لا تقدم سوى «الخضروات العضوية والطازجة». وعندها لن تختلف عن غيرها من موردي الخضروات. وبدلاً من ذلك، ينبغي أن تعمل «الخيار الأخضر» على زيادة عدد المزارع التي تزرع خضروات عضوية معتمدة، لتمنح نفسها تنوعاً أكبر من الخضروات العضوية لتبيعه.',
        'Green Choice should not extend their product line to cover the uncertified items. If they do, they will lose the Position that they have created in their customers’ minds that they only have “organic and fresh vegetables”. Then they would be no different than the other vegetable suppliers. Instead, Green Choice should work to increase the number of farms that grow certified organic vegetables in order to give them a greater variety of organic vegetables to sell.'
      )
    ]
  };

  R.act10 = {
    src: '50',
    paras: [
      B(
        '1. المكان الجيد لمقهى الإنترنت هو حيث يتجمع الأشخاص الذين يستخدمون التقنيات الحديثة كثيراً، مثل قرب جامعة أو كلية، أو مبنى مكاتب، أو مركز تسوق، أو في مواقع الجذب السياحي.',
        '1. A good place for a cyber cafe would be where people who often use new technologies gather, such as near a university or college, an office building, a shopping mall or at tourist attractions.'
      ),
      B(
        '2. المكان الجيد لمحل البقالة هو داخل منطقة سكنية أو بالقرب منها. فيستطيع الزبائن عندها الوصول إلى المحل بسهولة وحمل مشترياتهم إلى بيوتهم. وبدلاً من ذلك، يكون الموقع الجيد قرب مجمع مكاتب، حيث يتسوق العاملون للحصول على الطعام وقت الغداء أو بعد العمل، قبل العودة إلى البيت.',
        '2. A good place for a grocery store is inside or near a residential area. Customers can then easily get to the store and carry their groceries home. Alternatively, a good location would be near an office complex, where working people go shopping for food at lunch time or after work, before going home.'
      ),
      B(
        '3. المكان الجيد لشركة تصنيع ملابس الأطفال هو حيث تستطيع الشركة استئجار أو شراء أرض رخيصة، وحيث تتوفر إمكانية كافية للوصول إلى وسائل النقل لاستلام المواد وتوصيل المنتج، وموقع قريب من مركز سكاني حيث يسهل عليها إيجاد القوى العاملة لصنع المنتج.',
        '3. A good place for a baby clothing manufacturer is where the company can rent or buy inexpensive land, where there is sufficient access to transportation for both receiving supplies and delivering the product and a location close to a population centre where they can easily find a workforce to make the product.'
      )
    ]
  };
})();
