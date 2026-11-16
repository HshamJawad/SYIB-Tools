/* Content for the "Purchasing and Stock Management" module.
   Source: ILO SIYB "Purchasing and Stock Management" manual (Improve Your Business series).
   Every text is bilingual {ar,en}. Numbers in worked examples were checked for arithmetic consistency
   (the extracted manual text had corrupted digits in places); amounts are in Moroccan dirham (MAD) as in the manual. */
window.SIYB_PS_DATA = (() => {
  const B = (ar, en) => ({ ar, en });

  /* ---------- Section I: Purchasing ---------- */
  const categories = [
    { k: 'equipment', t: B('التجهيزات', 'Equipment'), d: B('جميع الآلات والأدوات وتجهيزات أوراش العمل وأثاث المكاتب وغيرها مما تحتاجه المقاولة لتصنيع السلع أو توفير الخدمات.', 'All machines, tools, workshop equipment, office furniture and other items the business needs to make goods or provide services.') },
    { k: 'raw', t: B('المواد الأولية', 'Raw materials'), d: B('جميع المواد التي تدخل في تصنيع سلعك المعدة للبيع.', 'All the materials used to make the goods you sell.') },
    { k: 'finished', t: B('السلع المنجزة', 'Finished goods'), d: B('سلع جاهزة يشتريها البائع بالتقسيط أو بالجملة بغرض إعادة بيعها.', 'Ready-made goods that retailers and wholesalers buy in order to resell them.') },
    { k: 'services', t: B('الخدمات والمناولة', 'Services and subcontracting'), d: B('خدمات مقاولات أخرى (الأمن، النقل، التنظيف، صيانة التجهيزات) أو إسناد بعض مهام الإنتاج إلى مناولين.', 'Services from other businesses (security, transport, cleaning, equipment servicing and maintenance) or production tasks given to subcontractors.') }
  ];
  const classify = [
    { t: B('آلة جديدة لطحن المعادن', 'A new metal-grinding machine'), a: 'equipment' },
    { t: B('أثاث المكتب', 'Office furniture'), a: 'equipment' },
    { t: B('الطحين لمخبزة', 'Flour for a bakery'), a: 'raw' },
    { t: B('الأسمدة لضيعة فلاحية', 'Fertiliser for a farm'), a: 'raw' },
    { t: B('القطن السميك لصنع المعاطف', 'Thick cotton used to make coats'), a: 'raw' },
    { t: B('أقمشة الحرير جاهزة لإعادة بيعها في متجر', 'Silk fabric bought to resell in a shop'), a: 'finished' },
    { t: B('منتجات العناية بالشعر لإعادة بيعها', 'Hair-care products bought to resell'), a: 'finished' },
    { t: B('خدمات النقل والنظافة', 'Transport and cleaning services'), a: 'services' },
    { t: B('إسناد التطريز إلى نساء يعملن من المنزل', 'Giving embroidery work to women working from home'), a: 'services' },
    { t: B('صيانة التجهيزات', 'Equipment maintenance service'), a: 'services' }
  ];
  const equipmentQuestions = [
    B('كم ستبلغ تكلفة الآلة؟ وهل تستطيع مقاولتي تحمّل تكلفتها؟', 'How much will the machine cost? Can my business afford it?'),
    B('ما حجم الآلة ونوعها المناسب للعمل المتوقع؟ وهل يمكنني شراء آلة مستعملة؟', 'What size and type of machine suits the expected work? Can I buy a used machine?'),
    B('كم عدد الطلبيات الإضافية التي سأستقبلها؟', 'How many extra orders will I get?'),
    B('هل ستزداد أرباحي بما يكفي لتغطية تكلفة الآلة؟', 'Will my profits increase enough to cover the cost of the machine?'),
    B('هل تعمل التجهيزات بشكل جيد؟ وكم مرة تتعطل؟', 'Does the equipment work well? How often does it break down?'),
    B('ما مدة صلاحية التجهيزات؟ وهل يوفّر المزوّد ضمانة مكتوبة؟', 'How long will the equipment last? Does the supplier give a written guarantee?'),
    B('هل تتوفر قطع الغيار محلياً وما كلفتها؟ وهل يوجد خبراء محليون للصيانة؟', 'Are spare parts available locally and what do they cost? Are there local experts for maintenance and repairs?'),
    B('هل أحتاج إلى تدريب خاص لاستخدام التجهيزات؟', 'Do I need special training to use the equipment?')
  ];
  const fourRights = [
    { t: B('الجودة الصحيحة', 'The right quality'), d: B('اشترِ ما تحتاجه مقاولتك بالجودة التي تحتاجها والتي يريدها الزبناء.', 'Buy what your business needs, at the quality your business needs and your customers want.') },
    { t: B('الكمية الصحيحة', 'The right quantity'), d: B('اشترِ الكميات التي تحتاجها مقاولتك ويطلبها الزبناء – لا أكثر من حجم الطلب ولا أدنى منه بكثير.', 'Buy the quantities your business needs and customers ask for – not far more and not far less than the demand.') },
    { t: B('السعر المناسب', 'The right price'), d: B('اشترِ بالأسعار التي تستطيع مقاولتك تحمّلها والتي يقبل الزبناء دفعها، بحيث تسمح لك بتحقيق الربح.', 'Buy at prices your business can afford and customers will accept, so that you can still make a profit.') },
    { t: B('الوقت المناسب', 'The right time'), d: B('اشترِ عندما يكون زبناؤك ومقاولتك بحاجة إلى السلع أو المواد أو التجهيزات – وليس قبل ذلك بكثير ولا بعده بكثير.', 'Buy when your customers and business need the goods, materials or equipment – not long before and not long after.') }
  ];
  const cases = [
    { n: B('متجر مايا للنسيج', "Maya's Textile Shop"),
      s: B('اشترت مايا 50 متراً من الحرير الرقيق لأن المزوّد أكد أنه رائج جداً. بعد سنة كاملة ما زال لديها 40 متراً غير مباعة.', 'Maya bought 50 metres of fine silk because the supplier said it sells very well. After a whole year she still has 40 metres unsold.'),
      q: [
        { q: B('لماذا اشترى المتجر هذا القدر الكبير من الحرير؟ وما المشكلة في طريقة الشراء؟', 'Why did the shop buy so much silk? What is wrong with its way of buying?'),
          a: B('المشكلة أن المتجر لا يعرف ما يريده الزبناء، ويتخذ قرارات الشراء بناءً على ما يقوله المزوّد.', 'The shop does not know what its customers want and takes its buying decisions from what the supplier says.') },
        { q: B('ما نصيحتك لتحسين عملية الشراء؟', 'What advice would you give to improve its buying?'),
          a: B('معرفة ما يريده الزبناء قبل الشراء وعدم الاعتماد على معلومات المزوّد وحده، وإجراء دراسة للسوق. ويمكن شراء كميات صغيرة أولاً لمعرفة هل يريد الزبناء هذه المواد وهل هم مستعدون لدفع ثمنها.', 'Find out what customers want before buying, do not rely only on the supplier’s information, and study the market. Buy small quantities first to see whether customers want the item and will pay for it.') }
      ] },
    { n: B('مخبزة «الخبز اللذيذ»', 'Tasty Bread Bakery'),
      s: B('كثيراً ما ينفد الطحين من المخبزة. وكل شراء يتطلب التنقل إلى المدينة، ما يكلّف وقتاً ومالاً كثيرين.', 'The bakery often runs out of flour. Each purchase means a trip to the city, which costs a lot of time and money.'),
      q: [
        { q: B('ما الخطأ الذي ارتكبته المخبزة؟', 'What mistake did the bakery make?'),
          a: B('لم تشترِ كمية كافية من الطحين؛ فلم يقدّر صاحبها حجم الطلب بالشكل الصحيح، فنفد الطحين مرات كثيرة وكلّفته الرحلات المتكررة وقتاً ومالاً.', 'It did not buy enough flour. The owner did not estimate demand correctly, so flour ran out many times and the repeated trips cost time and money.') },
        { q: B('ماذا قد يحدث إن لم تحسّن عملية الشراء؟', 'What could happen if it does not improve its buying?'),
          a: B('لن تستطيع إنتاج ما يكفي من الخبز لتلبية السوق فتنخفض المبيعات ويفقد المخبز زبناءه، كما أن ارتفاع كلفة النقل يخفض الأرباح.', 'It will not be able to bake enough bread for the market, sales will fall and customers will be lost; high transport costs also reduce profit.') }
      ] },
    { n: B('ضيعة سمير الفلاحية', "Samir's Farm"),
      s: B('اشترى سمير كمية كبيرة جداً من نوع واحد من الأسمدة ولم يتبقَّ له مال لشراء النوع الآخر الذي تحتاجه المحاصيل أكثر.', 'Samir bought a very large amount of one type of fertiliser and had no money left to buy the other type, which the crops need more.'),
      q: [
        { q: B('ما الخطأ الذي ارتكبته الضيعة؟', 'What mistake did the farm make?'),
          a: B('اشترى كمية كبيرة جداً من نوع واحد من الأسمدة ولم يبقَ له مال للنوع الآخر الأكثر حاجة للمحاصيل.', 'It bought far too much of one fertiliser and had no money left for the other, which the crops need more.') },
        { q: B('ماذا قد يحدث إن لم تحسّن ضيعة سمير الشراء؟', 'What could happen if the farm does not improve its buying?'),
          a: B('سيتراجع مردود المزرعة ما يؤثر على الربحية، ولن تلبي المحاصيل معايير الجودة التي يطلبها الزبناء، فقد تخسر الضيعة الزبناء وتتراجع المبيعات والأرباح.', 'Yields will fall, hurting profitability, and the crops will not meet the quality customers expect, so the farm may lose customers, sales and profit.') }
      ] }
  ];
  const customerNeedsQ = [
    B('ما المواد أو التجهيزات التي تحتاجها إن كنت تصنّع سلعاً بغرض بيعها؟', 'Which materials or equipment do you need if you make goods to sell?'),
    B('ما السلع التي تحتاجها في حال كنت تعيد بيع سلع مصنّعة؟', 'Which goods do you need if you resell manufactured goods?'),
    B('ما الكميات التي تحتاجها؟', 'What quantities do you need?'),
    B('ما الأسعار التي يقبل الزبناء بدفعها؟', 'What prices will your customers agree to pay?'),
    B('متى تحتاج السلع أو المواد؟', 'When do you need the goods or materials?'),
    B('ما الخدمات التي تحتاج مقاولتك إلى شرائها؟', 'Which services does your business need to buy?')
  ];
  const steps = [
    { t: B('حدّد احتياجات مقاولتك', 'Identify your business’s purchasing needs'), doc: null,
      p: [B('تعتمد احتياجات مقاولتك على احتياجات الزبناء: من هم وما الذي يحتاجونه ويريدونه.', 'What your business needs depends on what your customers need: who they are and what they need and want.'),
          B('بعد تحديد رغبات الزبناء قرّر: المواد أو التجهيزات، السلع، الكميات، الأسعار المقبولة، توقيت الحاجة، والخدمات.', 'Once you know what customers want, decide on: materials or equipment, goods, quantities, acceptable prices, when you need them, and services.')] },
    { t: B('اجمع المعلومات حول المزوّدين المختلفين', 'Collect information about the different suppliers'), doc: null,
      p: [B('حدّد المزوّدين الذين يبيعون ما تحتاجه واجمع المعلومات عنهم، حتى من لا تربطك بهم علاقة. ابحث أيضاً عن مزوّدين جدد لم تكن تعرفهم.', 'Identify the suppliers who sell what you need and collect information about them, even if you have no relationship with them. Look for new suppliers you did not know.'),
          B('مصادر المعلومات: الأصدقاء والزملاء والأساتذة والمستشارون؛ الغرف التجارية والمنظمات الداعمة؛ الصحف والمجلات ودليل الهاتف؛ الإنترنت؛ وسائل التواصل الاجتماعي؛ المعارض التجارية؛ نشر إعلانات عن احتياجاتك.', 'Sources: friends, colleagues, teachers and consultants; chambers of commerce and support organisations; newspapers, magazines and the phone directory; the internet; social media; trade fairs; advertising your needs.')] },
    { t: B('تحقّق من سمعة المزوّدين', 'Check the suppliers’ reputation'), doc: null,
      p: [B('هل يسلّم المزوّد الطلبات في المواعيد المحددة؟ هل يقبل استعادة السلع أو المواد؟ إلى أي حد يتحمل مسؤولية جودتها؟', 'Does the supplier deliver on time? Does the supplier take back goods or materials? How far does the supplier take responsibility for quality?'),
          B('اجمع المعلومات بمناقشة الموضوع مع أصحاب أعمال آخرين، والتحدث إلى زبناء سابقين للمزوّد، والتحقق عبر الإنترنت من آراء الناس.', 'Gather information by talking to other business people, speaking to the supplier’s former customers, and checking people’s opinions on the internet.')] },
    { t: B('تواصل مع المزوّدين للحصول على عروض الأسعار', 'Contact suppliers to get price quotations'), doc: B('طلب المعلومات / الاستفسار', 'Request for information (inquiry)'),
      p: [B('تواصل عبر الهاتف أو بزيارة مكان العمل أو بالبريد الإلكتروني، واطلب من كل مزوّد عرضاً ثم قارن السلع والخدمات والأسعار. فكّر في الشراء الجماعي مع مقاولات أخرى للاستفادة من خصم الكميات الكبيرة وتقاسم تكاليف النقل.', 'Contact suppliers by phone, by visiting, or by e-mail, ask each for a quotation, then compare goods, services and prices. Consider group buying with other businesses to get bulk discounts and share transport costs.'),
          B('يجب أن يتضمن عرض السعر: أنواع السلع وكمياتها الدنيا، الأسعار وشروط الدفع (نقداً أو بالدين، سقف الدين، آجال الدفع، التخفيضات)، وشروط التسليم (مدة التسليم وكلفة النقل). والأفضل أن يكون الرد مكتوباً.', 'A quotation should state: the goods and minimum quantities, prices and payment terms (cash or credit, credit limit, payment period, discounts), and delivery terms (delivery time and transport cost). It is best to get the answer in writing.')] },
    { t: B('تفاوض على الشروط واختر أفضل المزوّدين', 'Negotiate terms and select the best suppliers'), doc: B('عرض الأسعار', 'Price quotation'),
      p: [B('عرض الأسعار هو الرد على استفسارك؛ قارن العروض لتعرف ما يمكن لكل مزوّد أن يقدمه ثم تفاوض.', 'A quotation is the answer to your inquiry; compare quotations to see what each supplier offers, then negotiate.'),
          B('هدفك الحصول على السلع بأفضل سعر ممكن مع ضمان الاستلام في الوقت المحدد وتلبية شروط التأمين والدفع والجودة. تفاوض على إمكانية إعادة السلع غير المباعة خلال مدة محددة (شائعة في السلع القابلة للفساد). الاستدانة عنصر هام لمقاولتك.', 'Your aim is the best possible price while making sure goods arrive on time and insurance, payment and quality terms are met. Negotiate the right to return unsold goods within a set period (common for perishable goods). Credit terms are important for your business.')] },
    { t: B('وقّع على العقد وتقدّم بطلب السلعة أو الخدمة', 'Sign the agreement and place the order'), doc: B('سند طلبية المنتوج (طلب الشراء)', 'Purchase order'),
      p: [B('من الأفضل دائماً التقدّم بطلب شراء مكتوب فهو دليل على تقدّمك بالطلب. فكّر مليّاً في الكميات التي تحتاجها.', 'It is always better to place a written purchase order, as it is proof that you placed the order. Think carefully about the quantities you need.'),
          B('في حال شراء الخدمات أو المناولة لا يمكنك رؤية المنتج وقت إبرام العقد، فاضمن الجودة بالعقد وبزيارة مكان عمل المزوّد.', 'When buying services or subcontracting you cannot see the product when the contract is made, so secure quality in the contract and by visiting the supplier’s workplace.')] },
    { t: B('استلم السلع وتحقّق منها على الفور', 'Receive and check the goods immediately'), doc: B('سند التسليم', 'Delivery note'),
      p: [B('قارن البضاعة بسند التسليم أو الفاتورة وتحقق من: أنها السلع التي طلبتها، وأنها الكمية التي طلبتها، وأنها في حالة جيدة، وأنها وصلت في الوقت المحدد.', 'Compare the goods with the delivery note or invoice and check: they are the goods you ordered, the quantity you ordered, they are in good condition, and they arrived on time.'),
          B('عند أي مشكلة أخبر المزوّد فوراً وسجّل ذلك على سند التسليم، ولا توقّعه إلى أن تُحلّ المشكلة.', 'If there is any problem, tell the supplier immediately, note it on the delivery note, and do not sign it until the problem is solved.')] },
    { t: B('تأكّد من الفاتورة وادفع قيمتها', 'Check the invoice and pay for it'), doc: B('الفاتورة والإيصال', 'Invoice and receipt'),
      p: [B('قارن الفاتورة بطلب الشراء وسند التسليم، وتأكد من صحة الأسعار والمجموع. إن وجدت خطأً فحدّد مكانه واتصل بالمزوّد فوراً.', 'Compare the invoice with the purchase order and the delivery note, and check that prices and totals are correct. If you find an error, locate it and contact the supplier at once.'),
          B('بعد الدفع احصل على إيصال. وإن أعدت أي سلعة فتأكد من استرداد ثمنها.', 'After paying, get a receipt. If you returned any goods, make sure you get your money back for them.')] }
  ];

  /* Two quotations (Nadia's hair and nail salon) – totals reconstructed and checked: A = 22,100 + 20% VAT = 26,520; B = 22,350 + 20% VAT = 26,820 */
  const quoteItems = [
    { code: 'A1', d: B('مزيل طلاء الأظافر، 100 مل', 'Nail polish remover, 100 ml'), q: 50, pa: 10, pb: 11 },
    { code: 'A2', d: B('الجيل الوردي «الجميل والجريء»، 500 غ', 'Pink gel “Beautiful and Bold”, 500 g'), q: 100, pa: 30, pb: 35 },
    { code: 'A3', d: B('مثبّت ضفائر الشعر العادية، 250 مل', 'Regular hair braid fixer, 250 ml'), q: 70, pa: 30, pb: 30 },
    { code: 'A4', d: B('معالج جلدة الرأس الملكي النقي، 250 مل', 'Pure royal scalp treatment, 250 ml'), q: 30, pa: 150, pb: 160 },
    { code: 'A5', d: B('مرطب الشعر – للتصفيف، 250 مل', 'Hair moisturiser – for styling, 250 ml'), q: 100, pa: 80, pb: 70 },
    { code: 'A6', d: B('مثبت الشعر، 400 مل', 'Hair fixer, 400 ml'), q: 20, pa: 200, pb: 220 }
  ];
  const quoteSuppliers = {
    a: { name: B('شركة تصنيع منتجات العناية بالشعر والأظافر', 'Hair and Nail Products Manufacturer'), credit: B('لا استدانة – الدفع نقداً عند التسليم', 'No credit – cash on delivery'), delivery: B('تسليم مجاني خلال 24 ساعة (ضمن مسافة 100 كلم)', 'Free delivery within 24 hours (within 100 km)'), prices: B('أسعار أدنى لعدد من السلع', 'Lower prices on a number of items') },
    b: { name: B('شركة «شعر السوق الجيد»', '“Good Market Hair” company'), credit: B('استدانة ممكنة لمدة 14 يوماً', 'Credit possible for 14 days'), delivery: B('تسليم مجاني خلال أسبوعين من الطلبية', 'Free delivery within two weeks of the order'), prices: B('أسعار أعلى لعدد من السلع', 'Higher prices on a number of items') }
  };
  const vat = 0.20;
  const returned = { item: 'A2', defaultQty: 10 };

  const glossary = [
    { t: B('الاستفسار', 'Inquiry'), d: B('أسئلة تُوجَّه إلى المزوّد لمعرفة نوع السلع والأسعار وشروطها.', 'Questions asked to a supplier to find out the goods, prices and terms.') },
    { t: B('عرض الأسعار', 'Quotation'), d: B('رد المزوّد على الاستفسار بعرض لبيع سلع مع الأسعار وشروط الدفع والتسليم.', 'The supplier’s answer to your inquiry: an offer to sell goods with prices, payment and delivery terms.') },
    { t: B('طلب الشراء', 'Purchase order'), d: B('وثيقة مكتوبة تطلب بها السلع من المزوّد، وهي دليل على تقدمك بالطلب.', 'A written document asking the supplier for goods; it is proof that you placed the order.') },
    { t: B('سند التسليم', 'Delivery note'), d: B('وثيقة ترافق السلع تبيّن ما سُلّم فعلاً، وتوقّعها عند الاستلام بعد التحقق.', 'A document that comes with the goods showing what was delivered; you sign it on receipt after checking.') },
    { t: B('الفاتورة', 'Invoice'), d: B('وثيقة المزوّد التي تطلب بها دفع قيمة السلع.', 'The supplier’s document asking you to pay for the goods.') },
    { t: B('الإيصال', 'Receipt'), d: B('إثبات بأنك دفعت قيمة السلع.', 'Proof that you paid for the goods.') },
    { t: B('الدفع عند التسليم', 'Cash on delivery (COD)'), d: B('أن تدفع لدى تسليم السلع إليك.', 'You pay when the goods are delivered to you.') }
  ];

  const assessmentPurchasing = [
    { q: B('عند شراء الآلات والتجهيزات الأخرى يجب أن:', 'When buying machines and other equipment you should:'), o: [B('تبيع الآلات التي تملكها', 'Sell the machines you already own'), B('تجمع المعلومات عن أنواع التجهيزات المتوفرة وقطع الغيار والصيانة والضمانة', 'Collect information on the types of equipment available, spare parts, servicing and guarantee'), B('تشتري دائماً الأرخص ثمناً', 'Always buy the cheapest')], a: 1 },
    { q: B('قبل شراء السلع المنجزة بغرض إعادة بيعها يجب أن تعرف:', 'Before buying finished goods to resell you need to know:'), o: [B('ما السلع التي يريدها زبناؤك', 'Which goods your customers want'), B('ما السلع التي يبيعها المزوّد بكثرة', 'Which goods the supplier has plenty of'), B('ما السلع الأرخص في السوق', 'Which goods are cheapest on the market')], a: 0 },
    { q: B('عند اختيار مزوّد خدمات أو مناول، المعلومات الأهم تتعلق بـ:', 'When choosing a service provider or subcontractor, the most important information concerns their:'), o: [B('زبنائهم', 'Customers'), B('حجم أعمالهم', 'Size of business'), B('مهاراتهم وخبراتهم', 'Skills and experience')], a: 2 },
    { q: B('تسمح فعالية عملية الشراء لمقاولتك بـ:', 'An efficient purchasing process allows your business to:'), o: [B('خفض التكاليف', 'Reduce costs'), B('الحفاظ على استقرار التكاليف', 'Keep costs steady'), B('بيع سلعك بسعر أعلى من المقاولات الأخرى', 'Sell goods at a higher price than other businesses')], a: 0 },
    { q: B('يكون طلب الشراء المكتوب أفضل من الشفوي لأنه:', 'A written purchase order is better than an oral one because it:'), o: [B('أرخص', 'Is cheaper'), B('طريقة أسرع لطلب السلع', 'Is a quicker way to order goods'), B('إثبات بتقدمك بالطلب', 'Is proof that you placed the order')], a: 2 },
    { q: B('تتحقق من السلع مقارنة مع سند التسليم أو الفاتورة:', 'You check the goods against the delivery note or invoice:'), o: [B('عند احتساب مخزونك نهاية الأسبوع', 'When you count your stock at the end of the week'), B('فور استلام السلع', 'As soon as you receive the goods'), B('عندما تقدّم طلب الشراء', 'When you place the order')], a: 1 },
    { q: B('سلّمك مزوّدك بنّاً مدرجاً في الفاتورة ولا تذكر أنك طلبته. للتأكد تتحقق من:', 'Your supplier delivers coffee that is on the invoice but you do not remember ordering it. To check, look at the:'), o: [B('طلب الشراء', 'Purchase order'), B('عرض الأسعار', 'Quotation'), B('الإيصال', 'Receipt')], a: 0 },
    { q: B('«الدفع عند التسليم» يعني أن تدفع:', '“Cash on delivery” means you pay:'), o: [B('بالشيك', 'By cheque'), B('لدى تسليم السلع إليك', 'When the goods are delivered to you'), B('في غضون 30 يوماً', 'Within 30 days')], a: 1 },
    { q: B('عرض الأسعار هو:', 'A quotation is:'), o: [B('رد المزوّد على استفسارك بعرض لبيع السلع', 'The supplier’s answer to your inquiry offering goods for sale'), B('وثيقة تثبت دفعك قيمة السلع', 'A document proving that you paid'), B('طلبك الشراء من المزوّد', 'Your order to the supplier')], a: 0 }
  ];

  /* ---------- Section II: Stock ---------- */
  const stockTypes = [
    { k: 'retail', t: B('البائع بالتقسيط', 'Retailer'), d: B('المخزون: السلع والمواد التي تشتريها المقاولة من مقاولات أخرى وتحتفظ بها بهدف إعادة بيعها.', 'Stock: goods and materials the business buys from other businesses and keeps in order to resell them.'), ex: B('متجر حواسيب وهواتف نقالة: الحواسيب والهواتف والإكسسوارات وقطع الحاسوب والشواحن والسماعات…', 'A computer and mobile phone shop: computers, phones, accessories, computer parts, chargers, headphones…') },
    { k: 'maker', t: B('المصنّع', 'Manufacturer'), d: B('المخزون: المواد الأولية والقطع التي تستخدمها المقاولة لتصنيع السلع المعدة للبيع، والسلع المنجزة غير المباعة بعد.', 'Stock: the raw materials and parts used to make the goods for sale, plus finished goods not yet sold.'), ex: B('معمل مشتقات الحليب: الحليب الطري الذي يورّده المنتجون ومستلزمات التغليف والمضافات والقشات والملصقات التعريفية.', 'A dairy plant: fresh milk from producers, packaging, additives, straws and identification labels.') },
    { k: 'service', t: B('مقدّم الخدمات', 'Service provider'), d: B('المخزون: المواد أو السلع التي تشتريها المقاولة لاستخدامها بهدف توفير خدمة محدّدة.', 'Stock: the materials or goods the business buys to use in providing a specific service.'), ex: B('صالون تجميل: قنينات منظّف ومنعّم الشعر والمقصات ومنتجات العناية بالشعر…', 'A beauty salon: bottles of shampoo and conditioner, scissors, hair-care products…') }
  ];
  const stockTasks = [
    { k: 'record', t: B('سجّل محتويات المخزون', 'Record stock'), d: B('دوّن جميع السلع أو المواد التي تدخل إلى مقاولتك أو تخرج منها.', 'Write down all goods or materials that come into or leave your business.') },
    { k: 'store', t: B('ضع مخزونك في المستودع', 'Store your stock'), d: B('احتفظ بحجم المخزون الصحيح بطريقة آمنة وعملية.', 'Keep the right amount of stock in a safe and practical way.') },
    { k: 'arrange', t: B('رتّب مخزونك', 'Arrange your stock'), d: B('رتّبه بحيث يسهل عليك رؤية البضائع وعدّها.', 'Arrange it so that goods are easy to see and count.') },
    { k: 'check', t: B('تحقّق من مخزونك', 'Check your stock'), d: B('تحقق من المواد المخزنة واحسبها بصورة متكررة لتتأكد أنها في حالة جيدة وأنه لا أغراض ناقصة.', 'Check and count stored items regularly to be sure they are in good condition and none is missing.') },
    { k: 'reorder', t: B('أعدّ طلبية جديدة لمخزونك', 'Prepare a new order'), d: B('اطلب مزيداً من السلع أو المواد في الوقت المناسب.', 'Order more goods or materials at the right time.') }
  ];
  const stockBenefits = [
    B('تعرف متى يجب عليك إعادة طلب إمدادات السلع.', 'You know when to reorder supplies.'),
    B('تقرر ما السلع التي يجب أن تبيعها: تعرف ما الذي يباع بسرعة وما الذي يباع ببطء.', 'You can decide which goods to sell: you see what sells fast and what sells slowly.'),
    B('تتفادى نفاد المخزون: إن نفد الطحين تتوقف المخبزة عن الإنتاج ويخسر الزبناء وتنخفض المبيعات والأرباح.', 'You avoid running out of stock: if the flour runs out, the bakery stops producing, customers are lost and sales and profit fall.'),
    B('تتفادى تجميد أموال المقاولة في مخزون زائد يباع ببطء، فلا يبقى مال لطلب ما يريده الزبناء. (حدّدت دلال 12 علبة كحدّ أقصى للبنّ بطيء البيع.)', 'You avoid tying up money in extra, slow-selling stock, leaving no money to order what customers want. (Dalal set 12 boxes as the maximum for slow-selling coffee.)'),
    B('تعرف الضياع الذي يحدث في مخزونك: إن اختلف السجل عن التعداد الفعلي (مثلاً 15 قنينة في السجل و12 في الجرد = نقص 3).', 'You can see losses from your stock: if records and the actual count differ (e.g. 15 bottles on the card but 12 counted = shortage of 3).')
  ];
  const stockProblems = [
    { t: B('«أراقب الرفوف ببساطة وأطلب المزيد من السلع عندما تنفد».', '“I just watch the shelves and order more when things run out.”'), a: 'reorder' },
    { t: B('«المسامير كلها مبعثرة ولا أستطيع العثور على الحجم الذي أريده».', '“The nails are all mixed up and I can’t find the size I want.”'), a: 'arrange' },
    { t: B('«هذا الخبز يابس وقديم، فلنذهب إلى متجر آخر».', '“This bread is dry and old, let’s go to another shop.”'), a: 'check' },
    { t: B('«ضع هذا في جيبك. لن ينتبه أحد أبداً».', '“Put this in your pocket. No one will ever notice.”'), a: 'check' },
    { t: B('«معظم هذه الأكواب مكسورة».', '“Most of these cups are broken.”'), a: 'store' },
    { t: B('«إنها بداية العام الدراسي لكن جميع الدفاتر نفدت».', '“It’s the start of the school year but all the exercise books have run out.”'), a: 'reorder' }
  ];

  /* Retailer stock card (cooking oil 750 ml, unit cost 16.00, selling price 17.00). Balance checked: 19 -3 -2 -1 -4 -2 -3 +24 -4 -3 -3 -4 -3 -4 */
  const oilCard = {
    product: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), cost: 16, price: 17, reorder: '',
    rows: [
      { d: '1/3', det: B('الرصيد المنقول', 'Balance brought forward'), bf: 19 },
      { d: '2/3', det: B('مباع', 'Sold'), out: 3 }, { d: '4/3', det: B('مباع', 'Sold'), out: 2 },
      { d: '5/3', det: B('مباع', 'Sold'), out: 1 }, { d: '8/3', det: B('مباع', 'Sold'), out: 4 },
      { d: '9/3', det: B('مباع', 'Sold'), out: 2 }, { d: '11/3', det: B('مباع', 'Sold'), out: 3 },
      { d: '12/3', det: B('تم الشراء', 'Purchased'), in: 24 }, { d: '12/3', det: B('مباع', 'Sold'), out: 4 },
      { d: '15/3', det: B('مباع', 'Sold'), out: 3 }, { d: '17/3', det: B('مباع', 'Sold'), out: 3 },
      { d: '19/3', det: B('مباع', 'Sold'), out: 4 }, { d: '23/3', det: B('مباع', 'Sold'), out: 3 },
      { d: '24/3', det: B('مباع', 'Sold'), out: 4 }
    ]
  };
  /* Manufacturer card: thick grey cotton (raw material), 50.00 per metre, no selling price, reorder level 20 m */
  const cottonCard = {
    product: B('القطن السميك، رمادي', 'Thick cotton, grey'), cost: 50, price: '', reorder: 20,
    rows: [
      { d: '9/2', det: B('تم شراؤها (بالمتر)', 'Purchased (metres)'), in: 50 },
      { d: '10/2', det: B('لـ 10 معاطف خفيفة', 'For 10 light coats'), out: 20 }
    ]
  };
  /* Finished goods card kept by a manufacturer: light coats, cost 180.00, normal selling price 250.00 */
  const coatCard = {
    product: B('المعاطف الخفيفة، حجم متوسط، رمادية', 'Light coats, medium size, grey'), cost: 180, price: 250, reorder: '',
    rows: [
      { d: '9/2', det: B('معاطف جاهزة', 'Finished coats'), in: 10 },
      { d: '10/2', det: B('مباع', 'Sold'), out: 2 }
    ]
  };
  const blankCard = { product: { ar: '', en: '' }, cost: '', price: '', reorder: '', rows: [{ d: '', det: { ar: '', en: '' }, bf: 0 }, { d: '', det: { ar: '', en: '' } }, { d: '', det: { ar: '', en: '' } }] };

  /* Activity 13 (25 March): sources – cash sales, credit sale, supplier invoice */
  const act13 = {
    cashSales: [
      { t: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), q: 1 }, { t: B('الملح الناعم، 1 كلغ', 'Fine salt, 1 kg'), q: 1 },
      { t: B('الأرز البخاري، 1 كلغ', 'Steamed rice, 1 kg'), q: 1 }, { t: B('سكر، 2 كلغ', 'Sugar, 2 kg'), q: 1 },
      { t: B('صابون (قطع)', 'Soap (bars)'), q: 3 }, { t: B('بسكويت بنكهة الليمون، 250 غ', 'Lemon biscuits, 250 g'), q: 1 },
      { t: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), q: 1 }, { t: B('شاي بالخلطة الشرقية، 125 غ', 'Oriental-blend tea, 125 g'), q: 1 },
      { t: B('زيت غذائي، 5 ل', 'Cooking oil, 5 l'), q: 1 }, { t: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), q: 1 },
      { t: B('سكر، 2 كلغ', 'Sugar, 2 kg'), q: 2 }, { t: B('طحين، 1 كلغ', 'Flour, 1 kg'), q: 1 }
    ],
    credit: [ { t: B('سكر، 2 كلغ', 'Sugar, 2 kg'), q: 1 }, { t: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), q: 1 }, { t: B('شاي', 'Tea'), q: 1 } ],
    invoice: [
      { t: B('شاي بالخلطة الشرقية (علب)', 'Oriental-blend tea (boxes)'), q: 3 }, { t: B('قهوة «صباح الخير» (علب)', '“Good Morning” coffee (boxes)'), q: 2 },
      { t: B('سكر (علب)', 'Sugar (cases)'), q: 2 }, { t: B('زيت غذائي، علبتان × 12 قنينة (750 مل)', 'Cooking oil, 2 cases × 12 bottles (750 ml)'), q: 2, per: 12 }
    ],
    expected: { in: 24, out: 4, final: 27 }
  };

  /* Stocktaking list, 20 March (Dalal's shop): card balance, physical count, difference */
  const stocktakeShop = [
    { t: B('زيت غذائي، 750 مل', 'Cooking oil, 750 ml'), card: 15, count: 12 },
    { t: B('سكر، 2 كلغ', 'Sugar, 2 kg'), card: 9, count: 10 },
    { t: B('شاي بالخلطة الشرقية، 250 غ', 'Oriental-blend tea, 250 g'), card: 2, count: 0 },
    { t: B('قهوة «صباح الخير»، 100 غ', '“Good Morning” coffee, 100 g'), card: 5, count: 4 }
  ];
  /* Tasty Bread Bakery, stocktake after closing: sugar (card 20.5 kg, 2 kg missing) and flour (card 380 kg, 20 kg missing) */
  const stocktakeBakery = [
    { t: B('سكر (كلغ)', 'Sugar (kg)'), card: 20.5, count: 18.5 },
    { t: B('طحين أبيض (كلغ)', 'White flour (kg)'), card: 380, count: 360 },
    { t: B('ملح (كلغ) – لا توجد بطاقة مخزون', 'Salt (kg) – no stock card'), card: '', count: '' }
  ];
  const lossReasons = [
    B('هل أخطأت في العدّ أو في الحساب؟', 'Did you make a counting or calculation mistake?'),
    B('هل نسيت إحصاء بعض موجودات المخزون؟', 'Did you forget to count some stock?'),
    B('هل حسبت الموجودات بشكل صحيح؟', 'Did you count the items correctly?'),
    B('هل نسي أحد تسجيل مبيعات أو مشتريات على بطاقة المخزون؟', 'Did someone forget to record a sale or purchase on the stock card?'),
    B('قد ترتبط المشكلة بسرقة محتملة من الزبناء أو الموظفين أو أي شخص آخر يتعامل مع المقاولة.', 'The problem may be theft by customers, employees or anyone else dealing with the business.')
  ];
  const stocktakeSteps = [
    { t: B('تأكد من الترتيب الجيد للمخزون', 'Make sure the stock is well arranged'), d: B('اعرض موجودات المخزون بوضوح وترتيب ليسهل العد.', 'Display the stock clearly and in order so that it is easy to count.') },
    { t: B('أعدّ لائحة الجرد الفعلي للمخزون', 'Prepare the stocktaking list'), d: B('اكتب التفاصيل (اسم كل منتج) وجهّز الأعمدة: الكمية في بطاقة المخزون، الجرد الفعلي، الفارق، التعليقات. يمكن استخدام أوراق منفصلة أو دفتر.', 'Write the details (each product) and prepare the columns: stock card quantity, actual count, difference, comments. Separate sheets or a notebook can be used.') },
    { t: B('احسب مكونات المخزون ودوّن الكميات', 'Count the stock and write down the quantities'), d: B('يستحسن أن يقوم شخصان بالعد معاً: أحدهما يقرأ الكمية بصوت مسموع والآخر يدوّنها في اللائحة، لتفادي الأخطاء. دوّن اسم المنتج والكمية.', 'It is best for two people to count together: one reads the quantity aloud and the other writes it on the list, to avoid mistakes.') },
    { t: B('انسخ المعلومات من بطاقات المخزون إلى اللائحة وقارن', 'Copy the card balances to the list and compare'), d: B('تأكد أن بطاقاتك محدّثة قبل نسخ الأرصدة. الفارق = الجرد الفعلي − رصيد البطاقة.', 'Make sure your cards are up to date before copying the balances. Difference = actual count − card balance.') },
    { t: B('صحّح الكميات في بطاقات المخزون', 'Correct the quantities on the stock cards'), d: B('إن كان الجرد أقل من الرصيد دوّن الفارق في خانة «السلع الخارجة». وإن كان أكبر دوّنه في خانة «السلع الداخلة».', 'If the count is lower than the balance, write the difference in the “Out” column. If it is higher, write it in the “In” column.') }
  ];
  const frequency = {
    more: [B('كنت تملك مخزوناً كبيراً أو غالي الثمن', 'You have a large or valuable stock'), B('كانت مبيعاتك كبيرة أو يحدث فقدان سلع بكثرة', 'Your sales are high or you often lose items')],
    less: [B('كنت تملك مخزوناً صغيراً', 'You have a small stock'), B('كنت تتمتع بإجراءات أمنية جيدة', 'You have good security procedures')],
    when: [B('وفق جدول زمني دوري (شهرياً مثلاً)', 'On a regular schedule (e.g. monthly)'), B('كلما شككت في وجود نقص', 'Whenever you suspect something is missing'), B('بعد إغلاق المقاولة أبوابها في نهاية يوم العمل', 'At the end of the working day after the business has closed')]
  };
  const electronic = {
    how: [B('يُستخدم الحاسوب لتدبير المخزون ويتعقّب السلع التي تباع بتسجيل الباركود (الرمز الشريطي) عند البيع.', 'A computer is used to manage stock and tracks goods sold by scanning the barcode at the time of sale.'),
          B('تحتاج المقاولة إلى برنامج حاسوبي (نظام نقاط البيع أو برنامج خاص بتدبير المخزون) وآلة مسح الباركود.', 'The business needs software (a point-of-sale system or inventory software) and a barcode scanner.'),
          B('تُمسح المنتجات لدى استلامها ومرة أخرى لدى بيعها أو نقلها.', 'Products are scanned when received and again when sold or moved.')],
    benefits: [B('قد تكون كلفة النظام الإلكتروني أدنى من كلفة الوقت اللازم للضبط اليدوي للمخزون.', 'The electronic system may cost less than the time needed to control stock by hand.'),
               B('يقدّم تقارير تساعدك على تقرير متى تطلب السلع وتتفادى تخزين أقل أو أكثر من المطلوب.', 'It produces reports that help you decide when to order, so you avoid holding too little or too much.'),
               B('توجد برامج مخصصة لأصحاب المقاولات الصغيرة والمتاجر.', 'There are programmes designed for small businesses and shops.')],
    reflect: [B('هل تستخدم نظاماً إلكترونياً لتدبير المخزون في مقاولتك؟ ولماذا؟', 'Do you use an electronic stock system in your business? Why / why not?'), B('ما الفوائد التي قد تجنيها من استخدامه؟', 'What benefits could you gain from using one?')]
  };
  const assessmentStock = [
    { q: B('تُعتبر مراقبة المخزون مهمة:', 'Stock control is important:'), o: [B('فقط للبائعين بالتقسيط', 'Only for retailers'), B('فقط للشركات المصنّعة', 'Only for manufacturers'), B('لجميع المقاولات', 'For all businesses')], a: 2 },
    { q: B('يساعد تدبير المخزون مقاولتك في:', 'Stock control helps your business to:'), o: [B('تفادي نفاد المخزون', 'Avoid running out of stock'), B('الحصول على تخفيضات على الإعلانات', 'Get discounts on advertising'), B('الاحتفاظ دوماً بكميات كبيرة', 'Always keep large quantities')], a: 0 },
    { q: B('إن شككت في فقدان بعض محتويات مخزونك، فسجلات المخزون ستعلمك:', 'If you suspect you are losing stock, stock records will tell you:'), o: [B('من المسؤول عن السرقة', 'Who is responsible for the theft'), B('الكمية المفقودة من المخزون', 'The quantity missing from stock'), B('كيفية حل المشكلة', 'How to solve the problem')], a: 1 },
    { q: B('أفضل طريقة لمعرفة إن كانت مكونات مفقودة هي:', 'The best way to find out whether anything is missing is to:'), o: [B('احتساب المخزون ومقارنة الكميات مع الأرصدة المدونة على بطاقات المخزون', 'Count the stock and compare the quantities with the balances on the stock cards'), B('سؤال الموظفين', 'Ask the employees'), B('انتظار نفاد المخزون', 'Wait until the stock runs out')], a: 0 },
    { q: B('لا يسمح لك الجرد الفعلي للمخزون بمعرفة:', 'A physical stocktake does NOT let you know:'), o: [B('إن كانت مكونات مفقودة', 'Whether anything is missing'), B('كمية المكونات المفقودة', 'How much is missing'), B('سبب فقدان المكونات', 'Why items went missing')], a: 2 },
    { q: B('عندما يظهر الجرد كمية أقل من الرصيد في البطاقة، دوّن الفارق في خانة:', 'When the count is lower than the card balance, record the difference in the:'), o: [B('السلع الداخلة', 'In column'), B('السلع الخارجة', 'Out column'), B('لا تدوّن شيئاً', 'Do not record anything')], a: 1 },
    { q: B('وعندما يظهر الجرد كمية أكبر من الرصيد، دوّن الفارق في خانة:', 'When the count is higher than the card balance, record the difference in the:'), o: [B('السلع الداخلة', 'In column'), B('السلع الخارجة', 'Out column'), B('لا تدوّن شيئاً', 'Do not record anything')], a: 0 },
    { q: B('إذا تدنّى رصيد سلعة تحت مستوى تجديد الطلبية فعلى المقاولة:', 'If the balance of an item falls below the reorder level the business should:'), o: [B('التقدم بطلب شراء المنتج بأسرع وقت ممكن', 'Place a purchase order as soon as possible'), B('خفض مستوى تجديد الطلبية', 'Lower the reorder level'), B('الانتظار حتى ينفد المخزون', 'Wait until the stock runs out')], a: 0 },
    { q: B('في النظام الإلكتروني للمخزون تُمسح المنتجات:', 'In an electronic stock system products are scanned:'), o: [B('عند استلامها وعند بيعها أو نقلها', 'When received and when sold or moved'), B('مرة واحدة في السنة', 'Once a year'), B('عند الجرد فقط', 'Only at stocktaking')], a: 0 }
  ];

  /* ---------- Section III: Supplier relationships ---------- */
  const supplierCounts = {
    few: [B('خطر الاعتماد على مزوّد واحد: إذا تعطّل أو توقف فستتأثر مقاولتك.', 'Relying on one supplier is very risky: if it fails or stops, your business suffers.'), B('تعامل مع أكثر من مزوّد كي تتمكن دوماً من الحصول على ما تحتاجه.', 'Deal with more than one supplier so you can always get what you need.')],
    many: [B('عدد كبير من المزوّدين يتيح لك التفاوض على الأسعار والحصول على المنتجات بسهولة عند النقص أو الطلبيات الطارئة.', 'Many suppliers let you compare prices and get goods easily when you face shortages or need an urgent order.'), B('لكن التعامل مع عدد قليل يتيح علاقات أوثق (تواصل دوري، مهلة تفضيلية للدفع، إعلامك أولاً بالمنتجات الجديدة).', 'But dealing with fewer suppliers allows closer relationships (regular contact, preferential payment periods, being first to hear about new products).')]
  };
  const recordFields = [
    B('السنة', 'Year'), B('اسم المزوّد', 'Supplier name'), B('السلع/الخدمات الموفّرة', 'Goods / services supplied'),
    B('الكميات المطلوبة', 'Quantities ordered'), B('مواعيد التوصيل', 'Delivery dates'), B('النوعية', 'Quality'), B('السعر', 'Price'), B('الدفع', 'Payment'), B('ملاحظات أخرى', 'Other notes')
  ];
  const criteria = [
    B('التوصيل في الوقت المحدد', 'Delivery on time'), B('كمية كافية', 'Sufficient quantity'), B('الاستجابة السريعة للطلبيات الطارئة', 'Quick response to urgent orders'),
    B('جودة قارّة', 'Consistent quality'), B('طرق دفع ملائمة', 'Suitable payment terms')
  ];
  const sampleSuppliers = [
    { n: B('شركة حكيم للزيوت الغذائية', 'Hakim Edible Oils'), s: [3, 3, 2, 4, 4] },
    { n: B('شركة نوافا للسكر', 'Nawafa Sugar'), s: [4, 3, 4, 3, 3] }
  ];
  const disputeTips = [
    B('أشعر المزوّد بأي خلل على الفور', 'Tell the supplier about any problem immediately'),
    B('اجمع الأدلة حول المشكلة', 'Collect evidence about the problem'),
    B('عبّر بوضوح عن شروط العقد المنتهكة', 'State clearly which terms of the contract have been broken'),
    B('حدّد موقفك', 'Decide your position'),
    B('كن منفتحاً لكن لا تبدّل موقفك', 'Be open, but do not change your position'),
    B('اطلب موافقات مكتوبة من المزوّدين', 'Ask suppliers for written agreements'),
    B('اطلب مساعدة طرف ثالث أو مستشار قانوني', 'Ask for help from a third party or a legal adviser')
  ];
  const disputeWrong = [
    B('انتظر نهاية الشهر قبل إخبار المزوّد بالمشكلة', 'Wait until the end of the month before telling the supplier'),
    B('اكتفِ بوعد شفهي من المزوّد', 'Accept just a verbal promise from the supplier'),
    B('غيّر موقفك كلما أصرّ المزوّد', 'Change your position whenever the supplier insists')
  ];
  const endContract = [
    B('قد تنهي العقد مع مزوّد بعد مراجعة أدائه لتبحث عن مزوّدين أفضل.', 'You may end a contract after reviewing the supplier’s performance, in order to find better suppliers.'),
    B('تحقق من العقد كي لا تتحمل أي غرامة أو التزام في حال الفسخ المبكر.', 'Check the contract so that you do not suffer any penalty if you end it early.'),
    B('تذكّر فوائد العلاقة الجيدة مع المزوّد (مهلة تفضيلية للدفع، إعلامك أولاً بالمنتجات الجديدة) قبل اتخاذ القرار.', 'Remember the benefits of a good relationship with a supplier (preferential payment period, being told first about new products) before deciding.')
  ];
  const assessmentSuppliers = [
    { q: B('من أجل التخفيف من المخاطر يجدر بك:', 'To reduce risks you should:'), o: [B('التعامل مع مزوّد واحد فقط', 'Deal with one supplier only'), B('التعامل مع عدد قليل من المزوّدين وليس مزوّداً واحداً', 'Deal with a small number of suppliers, not just one'), B('تغيير المزوّد في كل طلبية', 'Change supplier with every order')], a: 1 },
    { q: B('لمراجعة أداء المزوّدين:', 'To review supplier performance you should:'), o: [B('اعتمد على انطباعك فقط', 'Rely only on your impression'), B('قارنهم بالمعايير نفسها (كالتسليم في الموعد والكمية والجودة وطرق الدفع)', 'Compare them against the same criteria (on-time delivery, quantity, quality, payment terms)'), B('اسأل المزوّد وحده', 'Ask only the supplier')], a: 1 },
    { q: B('قبل فسخ عقد مع مزوّد يجب أن:', 'Before ending a contract with a supplier you should:'), o: [B('تتحقق من العقد حتى لا تتعرض لأي غرامة عند الفسخ المبكر', 'Check the contract so that you do not face any penalty for early termination'), B('تتوقف عن الدفع فوراً', 'Stop paying immediately'), B('لا تخبر المزوّد', 'Not tell the supplier')], a: 0 },
    { q: B('عند نشوب نزاع مع مزوّد:', 'When a dispute arises with a supplier:'), o: [B('أشعره بالمشكلة على الفور واجمع الأدلة', 'Tell it about the problem immediately and collect evidence'), B('انتظر أن تُحلّ من تلقاء نفسها', 'Wait for it to solve itself'), B('تجاهل شروط العقد', 'Ignore the contract terms')], a: 0 },
    { q: B('نحافظ على سجلات المزوّدين ونحدّثها من أجل:', 'We keep and update supplier records in order to:'), o: [B('تقرير مواصلة التعاون معهم أم لا', 'Decide whether to continue working with them'), B('إخفاء الأخطاء', 'Hide mistakes'), B('زيادة حجم الأوراق', 'Increase paperwork')], a: 0 }
  ];

  return { B, categories, classify, equipmentQuestions, fourRights, cases, customerNeedsQ, steps, quoteItems, quoteSuppliers, vat, returned, glossary, assessmentPurchasing,
    stockTypes, stockTasks, stockBenefits, stockProblems, oilCard, cottonCard, coatCard, blankCard, act13, stocktakeShop, stocktakeBakery, lossReasons, stocktakeSteps, frequency, electronic, assessmentStock,
    supplierCounts, recordFields, criteria, sampleSuppliers, disputeTips, disputeWrong, endContract, assessmentSuppliers };
})();
