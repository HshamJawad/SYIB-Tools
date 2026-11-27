/* IYB Record Keeping — Part III "Use records to improve your business" (printed pp.49-60, up to but excluding Assessment 3).
   Source: English manual only (PDF pages 58-69). Arabic is a PRELIMINARY translation (not an official ILO translation). */
(() => {
  const B = (ar, en) => ({ ar, en });
  const p = (ar, en) => ({ t: 'p', x: B(ar, en) });
  const h = (ar, en) => ({ t: 'h', x: B(ar, en) });
  const ul = (items) => ({ t: 'ul', items: items.map(x => B(x[0], x[1])) });
  const quote = (wa, we, ar, en) => ({ t: 'quote', who: B(wa, we), x: B(ar, en) });
  const note = (ar, en) => ({ t: 'note', x: B(ar, en) });
  const formula = (ar, en) => ({ t: 'formula', x: B(ar, en) });
  const doc = (title, lines) => ({ t: 'doc', title: B(title[0], title[1]), lines: lines.map(x => B(x[0], x[1])) });
  const tbl = (cap, head, rows, extra) => Object.assign({ t: 'table', cap: cap ? B(cap[0], cap[1]) : null, head: head.map(x => B(x[0], x[1])), rows: rows.map(r => r.map(c => Array.isArray(c) ? B(c[0], c[1]) : c)) }, extra || {});

  const FAT = ['فاطمة', 'Fatuma'], MOY = ['مويو', 'Moyo'];
  const MF = 'Modern Furniture', MFa = 'مودرن فيرنيتشر';

  const C = window.SIYB_RK_CONTENT = window.SIYB_RK_CONTENT || {};
  C.p3 = [
    { id: 'cash', pg: '49–50', title: B('1. إدارة نقدك (Manage your cash)', '1. Manage your cash'), blocks: [
      quote(FAT[0], FAT[1], 'أنا الآن أحتفظ بسجلات العمل. يا مويو، كيف يمكن لسجلاتي أن تحل المشكلات وتحسّن عملي؟', 'I’m now keeping business records. Moyo, how can my records solve problems and improve my business?'),
      quote(MOY[0], MOY[1], 'السجلات لا تحل المشكلات بنفسها. أنت من يجب أن يحل المشكلات. لكن سجلاتك ستساعدك.', 'Records cannot solve problems by themselves. You are the one who must solve the problems. But your records will help you.'),
      p('يمكنك استخدام سجلاتك لإدارة نقدك كل يوم. في نهاية اليوم، تحقق من سجلاتك بمقارنة المبلغ في الخانة الأخيرة من عمود «الرصيد النقدي» مع المبلغ الذي لديك في صندوق النقد.', 'You can use your records to manage your cash every day. At the end of the day, check your records by comparing the amount in the last cell of the “Cash balance” column and the money you have in your cash box.'),
      p('إذا كان هناك فرق، فتحقق من سجلاتك وأعد عدّ النقود. وإذا بقي هناك فرق، فحاول معرفة السبب.', 'If there is a difference, check your records and count the money again. If there still is a difference, try to find the reason.'),
      p('في الجدول أدناه المعلومات المأخوذة من السجل الأساسي (Basic Record Book) لشركة Modern Furniture.', 'In the table below is the information taken from Modern Furniture’s Basic Record Book.'),
      tbl(null, [['البند', 'Item'], ['المبلغ', 'Amount']], [
        [['الرصيد النقدي في نهاية اليوم', 'Cash balance at the end of the day'], '$540'],
        [['النقد في صندوق النقد في نهاية اليوم', 'Money in cash box at the end of the day'], '$320']
      ]),
      { t: 'ex', id: 'q-cashdiff', title: B('فرق النقد', 'Cash difference'),
        qs: [B('النقد في صندوق النقد أقل مما ينبغي أن يكون. هل يمكنك التفكير في السبب؟', 'There is less cash in the cash box than there should be. Can you think of the reason?')],
        ans: [
          B('قد تكون كتبتَ ما يلي:', 'You may have written down the following:'),
          B('ارتكب مويو أو موظفوه خطأً عند تسجيل مستندات الإثبات.', 'Moyo or his employees made a mistake when recording the vouchers.'),
          B('نسي مويو أو موظفوه أخذ المال من أحد الزبائن.', 'Moyo or his employees forgot to get money from a customer.'),
          B('أعطى مويو أو موظفوه باقياً زائداً لزبون أو مورّد أو شخص آخر.', 'Moyo or his employees gave too much change to a customer, supplier or someone else.'),
          B('سرق شخص ما نقداً من صندوق النقد.', 'Someone stole money from the cash box.')
        ] },
      p('أولاً، على مويو أن يتحقق من جميع المبالغ في كل مستند إثبات (Voucher) وفي سجله الأساسي. ثم يعيد حساب الأرصدة النقدية. وإذا بقي هناك فرق، فعليه أن يحاول معرفة السبب.', 'First, Moyo needs to check all the amounts on each voucher and in his Basic Record Book. Then, do the calculation for cash balances again. If there is still a difference, he should try to find the reason.')
    ] },

    { id: 'debtors', pg: '51', title: B('2. إدارة المدينين (Manage your debtors)', '2 Manage your debtors'), blocks: [
      p('سيخبرك سجل حسابات العملاء (Customers’ Accounts Record) بالضبط كم يدين لك العميل، وأي العملاء يسدّدون ديونهم في الوقت المحدد غالباً، وأي العملاء بلغوا حد الائتمان (Credit Limit) الخاص بهم، حتى تعرف ألّا تمنحهم مزيداً من الائتمان إلى أن يسدّدوا دفعة. راجع سجل حسابات العملاء وذكّر عملاءك الذين يشترون بالآجل بسداد حساباتهم في الوقت المحدد.', 'Your Customers’ Accounts Record will tell you exactly how much a customer owes you, which customers often pay their debt on time and which customers have reached their credit limit so that you know not to extend any more credit to them until they make a payment. Review your Customers’ Account Record and remind your credit customers to pay their accounts on time.')
    ] },

    { id: 'profit', pg: '51–52', title: B('3. حساب ربحك (Calculate your profit)', '3 Calculate your profit'), blocks: [
      quote(FAT[0], FAT[1], 'يا مويو، انظر إلى إجمالي مبيعاتي للسنة الماضية. ربحي مرتفع جداً.', 'Moyo, look at my total sales for last year. My profit is really high.'),
      quote(MOY[0], MOY[1], 'المبيعات ليست هي الربح يا فاطمة.', 'Sales are not the same as profit, Fatuma.'),
      p('المبيعات ليست هي الأرباح. يجب أن تطرح مبلغ جميع التكاليف من مبلغ دخل مبيعاتك قبل أن تعرف إن كان عملك مربحاً أو خاسراً.', 'Sales are not the same as profits. You must subtract the amount of all costs from the amount of your sales income before you can tell if your business is profitable or is losing money.'),
      p('يدخل المال إلى عملك من المبيعات. ويخرج المال من عملك مقابل التكاليف. وعندما يكون دخل المبيعات أعلى من مبلغ تكاليفك، يحقق عملك ربحاً:', 'Money comes into your business from sales. Money goes out of your business for costs. When sales income is higher than the amount of your costs, your business makes a profit:'),
      formula('$7,000 – $4,000 = $3,000 | المبيعات – التكاليف = الربح (Sales – Costs = Profit)', '$7,000 – $4,000 = $3,000 | Sales – Costs = Profit'),
      p('وعندما يكون دخل المبيعات أقل من إجمالي مبلغ التكاليف، يُظهر عملك خسارة:', 'When sales income is lower than the total amount of the costs, your business shows a loss:'),
      formula('$4,000 – $7,000 = ($3,000) | المبيعات – التكاليف = الخسارة (Sales – Costs = Loss)', '$4,000 – $7,000 = ($3,000) | Sales – Costs = Loss')
    ] },

    { id: 'pl', pg: '52', title: B('3.1 قائمة الأرباح والخسائر (Profit and Loss Statement)', '3.1 Profit and Loss Statement'), blocks: [
      p('تساعدك قائمة الأرباح والخسائر على حساب ما إذا كان عملك يحقق ربحاً أو يخسر مالاً. ينبغي على كل مشروع إعداد قائمة أرباح وخسائر في نهاية كل سنة مالية. ويمكنك أيضاً حساب ربحك وخسارتك كل شهر، أو بعد ثلاثة أشهر، أو بعد ستة أشهر.', 'A Profit and Loss Statement helps you to calculate if your business is making a profit or is losing money. Every business should do a Profit and Loss Statement at the end of every financial year. You can also calculate your profit and loss every month, after three months, or after six months.'),
      p('كلما حسبتَ ربحك وخسارتك بوتيرة أكبر، عرفتَ أسرع ما إذا كان عملك يواجه مشكلات. عندها يمكنك فعل شيء حيال المشكلات قبل فوات الأوان.', 'The more often you calculate your profit and loss, the sooner you will be aware if your business has problems. Then you can do something about the problems before it is too late.'),
      p('يمكنك اتباع هذه الخطوات لإعداد قائمة الأرباح والخسائر:', 'You can follow these steps to make a Profit and Loss Statement:'),
      p('اتبع هذه الخطوات لحساب الربح الإجمالي (Gross Profit).', 'Follow these steps to calculate your Gross Profit.'),
      doc(['خطوات الربح الإجمالي', 'Steps for Gross Profit'], [
        ['1. المبيعات (Sales) ........ $7,000', '1. Sales ........ $7,000'],
        ['2. تكاليف المواد (Material Costs) ........ – $4,000', '2. Material Costs ........ – $4,000'],
        ['3. تكاليف العمالة (Labour Costs) ........ – $1,500', '3. Labour Costs ........ – $1,500'],
        ['الربح الإجمالي = $1,500', 'Gross Profit = $1,500']
      ]),
      p('اتبع هذه الخطوة لحساب صافي الربح (Net Profit).', 'Follow this step to calculate your Net Profit.'),
      doc(['خطوة صافي الربح', 'Step for Net Profit'], [
        ['4. النفقات العامة (Overhead Expenses) ........ – $500', '4. Overhead Expenses ........ – $500'],
        ['صافي الربح = $1,000', 'Net Profit = $1,000']
      ]),
      formula('$7,000 – $4,000 – $1,500 = $1,500 – $500 = $1,000 | المبيعات – تكاليف المواد – تكاليف العمالة = الربح الإجمالي – النفقات العامة = صافي الربح', '$7,000 – $4,000 – $1,500 = $1,500 – $500 = $1,000 | Sales – Material Costs – Labour Costs = Gross Profit – Overhead Expenses = Net Profit'),
      p('تأتي معظم المبالغ في قائمة الأرباح والخسائر من السجل الأساسي.', 'Most of the amounts for your Profit and Loss Statement come from the Basic Record Book.')
    ] },

    { id: 'gross', pg: '53–54', title: B('3.2 حساب الربح الإجمالي (Calculating Gross Profit)', '3.2 Calculating Gross Profit'), blocks: [
      p('الربح الإجمالي رقم مهم جداً لعملك. وهو يبيّن مقدار المال المتبقي بعد طرح جميع تكاليف إنتاج بضائعك أو خدماتك، بما فيها تكاليف المواد وتكاليف العمالة، من المال المكتسب من المبيعات. ويجب أن يكون الربح الإجمالي مرتفعاً بما يكفي لدفع جميع النفقات العامة في عملك. أرى مويو فاطمة أنه أعدّ قائمة أرباح وخسائر لشركة ' + MF + ' لعام 2013.', 'The Gross Profit is a very important figure for your business. It shows the amount of money left after you have subtracted all the costs to make your goods or services, including Material Costs and Labour Costs, from the money earned from sales. The Gross Profit must be high enough to pay for all the Overhead Expenses in your business. Moyo showed Fatuma that he had created a Profit and Loss Statement for Modern Furniture in 2013.'),
      quote(MOY[0], MOY[1], 'هذه قائمة الأرباح والخسائر الخاصة بي لعام 2013.', 'This is my Profit and Loss Statement for the year of 2013.'),
      h('1. المبيعات', '1. Sales'),
      p('جمع مويو أولاً إجماليات المبيعات الشهرية لعام 2013. وحصل على الأرقام من السجل الأساسي للأشهر الاثني عشر من كانون الثاني/يناير إلى كانون الأول/ديسمبر:', 'Moyo first added all the monthly sales totals for 2013. He got the figures from the Basic Record Book for the 12 months from January to December:'),
      formula('$1,860 + $2,315 + $2,650 + $3,440 + $2,635 + $3,050 + $2,870 + $2,812 + $3,200 + $2,980 + $3,728 + $4,673 = $36,213', '$1,860 + $2,315 + $2,650 + $3,440 + $2,635 + $3,050 + $2,870 + $2,812 + $3,200 + $2,980 + $3,728 + $4,673 = $36,213'),
      h('2. تكاليف المواد', '2. Material Costs'),
      p('جمع مويو تكاليف المواد لكل شهر من كانون الثاني/يناير إلى كانون الأول/ديسمبر 2013، فحصل على إجمالي تكاليف المواد لتلك السنة وهو $11,600. وقد أُخذت الأرقام من السجل الأساسي لمويو.', 'Moyo added the Material Costs for each month from January to December 2013 and obtained the total Material Costs for that year as $11,600. The figures were taken from Moyo’s Basic Record Book.'),
      h('3. تكاليف العمالة', '3. Labour Costs'),
      p('جمع مويو تكاليف العمالة لكل شهر من كانون الثاني/يناير إلى كانون الأول/ديسمبر 2013، فحصل على إجمالي تكاليف العمالة لتلك السنة - $15,800. وقد أُخذت الأرقام من السجل الأساسي لمويو.', 'Moyo added the Labour Costs for each month from January to December 2013 and obtained the total Labour Cost for that year - $15,800. The figures were taken from Moyo’s Basic Record Book.'),
      h('4. النفقات العامة', '4. Overhead Expenses'),
      p('كان إجمالي النفقات العامة لشركة ' + MF + ' في عام 2013 هو $4,713. وقد توصّل مويو إلى هذا الرقم بجمع جميع الإجماليات الشهرية من سجله الأساسي.', 'The total of the Overhead Expenses for Modern Furniture in 2013 was $4,713. Moyo arrived at this figure by adding up all monthly totals from his Basic Record Book.'),
      doc(['قائمة الأرباح والخسائر 1/1/13 - 31/12/13', 'Profit and Loss Statement 1/1/13 - 31/12/13'], [
        ['1. المبيعات ........ $36,213', '1. Sales ........ $36,213'],
        ['2. تكاليف المواد ........ –$11,600', '2. Material Costs ........ –$11,600'],
        ['3. تكاليف العمالة ........ –$15,800', '3. Labour Costs ........ –$15,800'],
        ['الربح الإجمالي = $8,813', 'Gross Profit = $8,813'],
        ['4. النفقات العامة ........ – $4,713', '4. Overhead Expenses ........ – $4,713'],
        ['صافي الربح = $4,100', 'Net Profit = $4,100']
      ]),
      note('تكون لمعظم المصنّعين والعديد من مقدمي الخدمات تكاليف عمالة. أما تجار التجزئة وتجار الجملة فيسجلون الأجور والرواتب المدفوعة لموظفيهم ضمن النفقات العامة. وإذا لم يكن في عملك عمالة مشاركة في الإنتاج، فلا تُدخل أي مبلغ تحت تكاليف العمالة. وبدلاً من ذلك، أدرج جميع مدفوعاتك للأجور والرواتب ضمن النفقات العامة. انظر دليل تكاليف IYB (IYB COSTING MANUAL) لمزيد من المعلومات.', 'Most manufacturers and many service providers have Labour Costs. Retailers and wholesalers record the wages and salaries paid to their employees under Overhead Expenses. If your business does not have labour involved in production, do not enter any amount under Labour Costs. Instead, include all your payments for wages and salaries under Overhead Expenses. See the IYB COSTING MANUAL for more information.'),
      p('يبيّن تمرين «هل يمكنك المساعدة؟» (Can You Help?) في الصفحة 66 من هذا الدليل كيف يعدّ تاجر التجزئة أو تاجر الجملة قائمة الأرباح والخسائر.', 'The “Can You Help?” exercise on page 66 in this manual shows how a retailer or wholesaler makes a Profit and Loss Statement.')
    ] },

    { id: 'net', pg: '54–55', title: B('3.3 حساب صافي الربح (Calculating Net Profit)', '3.3 Calculating Net Profit'), blocks: [
      quote(FAT[0], FAT[1], 'الربح في عملك كان أكثر من $8,000. عملك يسير جيداً جداً.', 'The profit in your business was more than $8,000. Your business is doing very well.'),
      quote(MOY[0], MOY[1], 'يا فاطمة، مبلغ $8,813 هو الربح الإجمالي فقط. أما صافي الربح البالغ $4,100 فيبيّن مدى جودة أداء عملي.', 'Fatuma, $8,813 is only my Gross Profit. The Net Profit of $4,100 shows how well my business is doing.'),
      quote('', '', 'فهم الفرق بين الربح الإجمالي وصافي الربح يساعدنا على تحليل أرباحنا وتحسينها.', 'Understanding the difference between Gross and Net Profit helps us to analyse and improve our profits.'),
      p('صافي الربح هو مقدار المال المتبقي بعد طرح جميع النفقات العامة من الربح الإجمالي. ويبيّن صافي الربح النتيجة الكلية لتعاملات عملك. وهو يخبرك بمدى جودة أداء عملك.', 'The Net Profit is the amount of money left after you have subtracted all Overhead Expenses from the Gross Profit. The Net Profit shows the total result of your business dealings. It tells you how well your business is performing.')
    ] },

    { id: 'tax', pg: '55', title: B('4. حساب الضريبة المستحقة (Calculate your Tax Payable)', '4 Calculate your Tax Payable'), blocks: [
      p('تُخصم الضريبة من صافي الربح. ويُسمّى المبلغ الناتج بذلك صافي الدخل (Net Income).', 'Tax is deducted from Net Profit. The amount thus obtained is called Net Income.'),
      p('تساعد سجلات عملك على تحديد صافي ربح عملك، مما يجعل من الممكن حساب ضرائب الدخل المستحقة عليك. ويمكنك تحديد مبلغ ضريبة الدخل التي يتعيّن على عملك دفعها في سنة معينة بضرب صافي ربحك لتلك السنة في معدل ضريبة الدخل المطبّق على عملك.', 'Your business records help determine the Net Profit of your business, making it possible to calculate your income tax payables. You can determine the amount of income tax your business has to pay in a specific year by multiplying your Net Profit for that year by the income tax rate applied to your business.'),
      p('على سبيل المثال:', 'For example:'),
      formula('$4,100 x 15% = $615 | صافي الربح × معدل الضريبة = ضريبة الدخل المستحقة (Net Profit x Tax rate = Income tax payable)', '$4,100 x 15% = $615 | Net Profit x Tax rate = Income tax payable'),
      p('يمكنك تحديد مبلغ ضريبة القيمة المضافة المستحقة كل شهر أو ربع سنة أو سنة بأخذ الرصيد النهائي في عمود «ضريبة القيمة المضافة» (VAT) من سجلك الأساسي.', 'You can determine the amount of VAT payable every month, quarter, or year by taking the final balance in the “VAT” column from your Basic Record Book.'),
      tbl(['ضريبة القيمة المضافة المستحقة', 'VAT payable'], [['تكاليف المواد', 'Material Costs'], ['تكاليف العمالة', 'Labour Costs'], ['النفقات العامة', 'Overhead Expenses'], ['وارد', 'IN'], ['صادر', 'OUT'], ['الرصيد', 'BALANCE']],
        [['—', '—', '—', '—', '—', '—'], ['—', '—', '—', '—', '—', '(314.6)']],
        { group: [[B('', ''), 3], [B('ضريبة القيمة المضافة', 'VAT'), 3]] })
    ] },

    { id: 'bs-what', pg: '56', title: B('5.1 ما هي قائمة المركز المالي؟ (What is a Balance Sheet?)', '5.1 What is a Balance Sheet?'), blocks: [
      p('تُظهر لك قائمة المركز المالي (Balance Sheet) المركز المالي لعملك. وهي تبيّن لك كم من المال لدى عملك وكم عليه من التزامات، من خلال تتبّع الأصول (Assets) والالتزامات (Liabilities). الأصل هو شيء يضيف قيمة إلى عملك، مثل النقد أو المعدات. والالتزام هو شيء يدين به عملك لشخص آخر، مثل قرض أو فاتورة من مورّد.', 'A Balance Sheet shows you the financial position of your business. It shows you how much money your business has and how much it owes, by tracking assets and liabilities. An asset is something that adds value to your business, such as cash or equipment. A liability is something that your business owes to someone else, such as a loan or a bill from a supplier.'),
      p('إن طرح مبلغ التزامات عملك من أصوله يعطيك صافي قيمة العمل (net worth). وتتكوّن صافي قيمة عملك من كل المال الذي استثمرته والأرباح المحتجزة (صافي الدخل).', 'The amount of your business’ liabilities subtracted from its assets will give you the business’ net worth. Your business’ net worth is made up of all the money you have invested and the retained profit (Net Income).'),
      p('قائمة المركز المالي متوازنة دائماً. يجب أن يكون مبلغ الأصول دائماً مساوياً لمجموع الالتزامات وصافي القيمة.', 'The Balance Sheet always balances. The amount of assets must always be the same as the total of the liabilities and the net worth.')
    ] },

    { id: 'bs-why', pg: '56–57', title: B('5.2 لماذا قائمة المركز المالي مفيدة؟', '5.2 Why is a Balance Sheet useful?'), blocks: [
      ul([['تبيّن قائمة المركز المالي كم تساوي قيمة عملك. فعلى سبيل المثال، يمكن أن تساعد المصرف في تقرير ما إذا كان ينبغي منحك قرضاً.', 'A Balance Sheet shows how much your business is worth. For example, it can help a bank decide if you should be given a loan.']]),
      quote('', '', 'أرى أن لدى عملك أصولاً أكثر بكثير من الالتزامات. وهذا جيد للحصول على قرض.', 'I can see that your business has many more assets than liabilities. That is good for getting a loan.'),
      ul([['تساعدك قائمة المركز المالي على أن ترى مدى جودة إدارتك لعملك مع مرور الوقت.', 'A Balance Sheet helps you see how well you have managed your business over time.']]),
      quote(MOY[0], MOY[1], 'المبلغ المستحق لنا على العملاء الذين يشترون بالآجل ازداد مع مرور الوقت. يجب أن أعرف لماذا حدث ذلك.', 'The amount of money owed to us by credit customers has increased over time. I must find out why this has happened.')
    ] },

    { id: 'bs-how', pg: '57–58', title: B('5.3 كيف تعدّ قائمة المركز المالي؟', '5.3 How to make a Balance Sheet'), blocks: [
      p('لإعداد قائمة المركز المالي، تسجّل:', 'To make a Balance Sheet, you record:'),
      ul([['الأصول التي يملكها عملك', 'The assets that your business owns'], ['الالتزامات التي على عملك', 'The liabilities that your business owes']]),
      p('يعدّ مويو، صاحب شركة ' + MF + '، قائمة مركز مالي كل ثلاثة أشهر. وفيما يلي قائمة المركز المالي الخاصة به لشهر كانون الأول/ديسمبر.', 'Modern Furniture owner Moyo makes a Balance Sheet every three months. Here is his Balance Sheet for the month of December.'),
      quote(MOY[0], MOY[1], 'يا فاطمة، هذه قائمة المركز المالي الخاصة بنا. إنها تبيّن لي كم يملك العمل، وكم عليه، وكم تساوي قيمته.', 'Fatuma, here is our Balance Sheet. It shows me how much the business owns, how much it owes, and what it is worth.'),
      tbl([MFa, MF], [['الرقم', 'No.'], ['البند', 'Item'], ['المبلغ', 'Amount'], ['الرقم', 'No.'], ['البند', 'Item'], ['المبلغ', 'Amount']], [
        ['1', ['النقد', 'Cash'], '$2,000', '6', ['الذمم الدائنة', 'Accounts Payable'], '$3,250'],
        ['2', ['الذمم المدينة', 'Accounts Receivable'], '$1,500', '7', ['الضرائب المستحقة', 'Taxes Payable'], '$250'],
        ['3', ['المخزون', 'Inventory'], '$4,730', '8', ['القروض القائمة', 'Loans outstanding'], '0'],
        ['4', ['الممتلكات والمعدات', 'Property and equipment'], '$3,500', '—', '—', '—'],
        ['5', ['إجمالي الأصول', 'TOTAL ASSETS'], '$11,730', '9', ['إجمالي الالتزامات', 'TOTAL LIABILITIES'], '$3,500'],
        ['—', '—', '—', '10', ['صافي القيمة', 'NET WORTH'], '$8,230']
      ], { group: [[B('', ''), 1], [B('الأصول', 'ASSETS'), 2], [B('', ''), 1], [B('الالتزامات', 'LIABILITIES'), 2]] }),
      p('لإعداد قائمة مركز مالي لعملك، اتبع هذه الخطوات العشر. تذكّر أن قائمة المركز المالي تبيّن لك وضع عملك في أي نقطة زمنية. وتستخدم المبالغ الحالية لإعداد قائمة المركز المالي.', 'To make a Balance Sheet for your business, follow these ten steps. Remember, a Balance Sheet shows you the position of your business at any point in time. You use current amounts to make a Balance Sheet.'),
      p('الخطوة 1: النقد – هذا هو مبلغ النقد الذي لديك حالياً في صندوق النقد وفي حسابك المصرفي. اجمع هذه الأرقام من سجلك الأساسي. اكتب هذا المبلغ الإجمالي بجانب الرقم واحد.', 'Step 1: Cash – This is the amount of cash that you currently have in your cash box and your bank account. Add these numbers from your Basic Record Book. Write this total amount next to number one.'),
      p('الخطوة 2: الذمم المدينة (Accounts Receivable) – هل يبيع عملك لعملائه بالآجل؟ إن كان كذلك، فهذا يعني أنك لن تستلم المال مقابل البيع إلى أن يدفع لك العميل. ويسمّى المبلغ الذي تنتظر أن يدفعه لك عملاؤك الذين يشترون بالآجل الذمم المدينة. ويمكنك معرفة ذممك المدينة بجمع جميع الأرصدة الحالية في سجل حسابات العملاء. أدخل هذا المبلغ الإجمالي للرصيد الحالي بجانب الرقم اثنين.', 'Step 2: Accounts Receivable – Does your business sell to your customers on credit? If so, this means that you will not receive money for the sale until the credit customer pays you. The amount of money that you are waiting for your credit customers to pay is called your Accounts Receivable. You can find out your Accounts Receivable by adding all the current balances in your Customers’ Accounts Record. Enter this total current balance amount next to number two.'),
      p('الخطوة 3: المخزون (Inventory) - هذا هو المبلغ الذي يساوي قيمة مخزون عملك. فإذا كان مخزون عملك محدوداً جداً أو لم يكن لديه مخزون إطلاقاً، فاكتب صفراً بجانب الرقم ثلاثة. وإذا كان لدى عملك كمية كبيرة من المخزون وكنت تحتفظ بسجل للمخزون، فإن الرصيد الحالي لسجل المخزون (Inventory Record) يبيّن كم تساوي قيمة مخزونك. أدخل مبلغ هذا الرصيد الحالي بجانب الرقم ثلاثة.', 'Step 3: Inventory - This is the amount of money that the stock of your business is worth. If your business has very limited stock or has no stock at all, write zero next to number three. If your business has a substantial amount of stock and you kept a record of your inventory, the current balance of your Inventory Record shows how much your stock is worth. Enter this current balance amount next to number three.'),
      p('الخطوة 4: الممتلكات والمعدات – هذا هو المبلغ الذي تساويه قيمة الممتلكات والمعدات. ينبغي ألّا تشمل الممتلكات والمعدات هنا إلا البنود التي تحسب لها الإهلاك (Depreciation)، مثل المباني أو المعدات ذات القيمة العالية.', 'Step 4: Property and equipment – This is the amount of money that the property and equipment is worth. The property and equipment here should only include items for which you calculate the depreciation, such as buildings or high value equipment.'),
      p('يمكنك معرفة القيمة الحالية لممتلكاتك ومعداتك بالنظر في سجل الأصول (Asset Register). خذ سجل الأصول وانظر إلى القيمة المتبقية لكل بند. وهذه هي القيمة الحالية لكل أصل. ومجموع عمود «القيمة المتبقية» هو إجمالي القيمة الحالية لممتلكاتك ومعداتك. أدخل المجموع بجانب الرقم أربعة.', 'You can work out the current value of your property and equipment by looking at your Asset Register. Take the Asset Register and look at the remaining value of each item. This is the current value of each asset. The total of the “Remaining value” column is the total current value of your property and equipment. Enter the total next to number four.'),
      p('الخطوة 5: إجمالي الأصول – اجمع جميع المبالغ في الخطوات 1 و2 و3 و4. وهذا المبلغ هو إجمالي قيمة الأصول في عملك. أدخل هذا المجموع بجانب الرقم خمسة.', 'Step 5: TOTAL ASSETS – Add up all the amounts in steps 1, 2, 3 and 4. This amount is the total value of the assets in your business. Enter that total next to number five.'),
      p('الخطوة 6: الذمم الدائنة (Accounts Payable) – هل يشتري عملك لوازم أو مواد بالآجل؟ إن كان كذلك، فقد تدين لمورّديك بمبالغ نقدية مقابل ما اشتريته. ويسمّى مبلغ النقد الذي تدين به للمورّدين مقابل المشتريات بالآجل الذمم الدائنة. وهذا التزام لأنه مال يدين به عملك لشخص آخر. ولتحديد ذممك الدائنة، خذ الرصيد الحالي من سجل الدائنين (Creditors’ Record) أو اجمع مبالغ فواتيرك التي لم تُدفع نقداً بعد. أدخل المبلغ بجانب الرقم ستة.', 'Step 6: Accounts Payable – Does your business buy supplies or materials on credit? If it does, you may owe your suppliers cash for what you have bought. The amount of cash that you owe to suppliers for credit purchases is your Accounts Payable. This is a liability because it is money that your business owes to someone else. To determine your Accounts Payable, take the current balance from your Creditors’ Record or add up the amount from your invoices that have not yet paid in cash. Enter the amount next to number six.'),
      p('الخطوة 7: الضرائب المستحقة (Taxes Payable) – قد يدين عملك لجهة الضرائب بضريبة دخل عن أرباحك السابقة أو بضريبة القيمة المضافة. ويمكنك الحصول على هذا المبلغ بالنظر إلى الرصيد الحالي لسجل الضرائب المستحقة (Tax Payable Record) أو إلى فواتير الضرائب التي لم تدفعها بعد. أدخل هذا المبلغ الإجمالي بجانب الرقم سبعة.', 'Step 7: Taxes Payable – Your business may owe the tax authority for income tax on your past profits or for VAT. You can get this amount by looking at the current balance of your Tax Payable Record or your tax bills that you have not yet paid. Enter this total amount next to number seven.'),
      p('الخطوة 8: القروض القائمة (Loans outstanding) – هل حصل عملك على أي قرض ما زال يسدّد دفعاته؟ إن كان كذلك، فإن المبلغ غير المسدَّد من هذا القرض التزام. ولمعرفة مبلغ قروضك القائمة، انظر إلى عمود الرصيد في سجل القروض (Loan Record) وأدخل هذا المبلغ بجانب الرقم ثمانية.', 'Step 8: Loans outstanding – Has your business received any loan for which it is still making payments? If so, the unpaid amount of this loan is a liability. To find the amount of your outstanding loans, look at the balance column of your Loans Record and enter this amount next to number eight.'),
      p('الخطوة 9: الالتزامات – اجمع الأرقام من الخطوات 6 و7 و8. وهذا هو المبلغ الذي يدين به عملك للآخرين. أدخل المجموع بجانب الرقم تسعة.', 'Step 9: LIABILITIES – Add up the figures from steps 6, 7 and 8. This is the amount that your business owes to others. Enter the total next to number nine.'),
      p('الخطوة 10: صافي القيمة (NET WORTH) – هذا هو مبلغ أصول عملك مطروحاً منه التزاماته. ولمعرفة صافي قيمة عملك، اطرح الرقم تسعة «إجمالي الالتزامات» من الرقم خمسة «إجمالي الأصول». أدخل هذا المبلغ بجانب الرقم عشرة. والرقم في هذا السطر هو صافي قيمة عملك.', 'Step 10: NET WORTH – This is the amount of your business’ assets minus its liabilities. To find out the net worth of your business, subtract number nine “TOTAL LIABILITIES” from number five “TOTAL ASSETS”. Enter this amount next to number ten. The figure on this line is the net worth of your business.'),
      p('قرّر كم مرة ستعدّ قائمة المركز المالي. يجب إعدادها مرة واحدة على الأقل في السنة، ولكن يمكن إعدادها شهرياً أو كل ثلاثة أشهر أو كل نصف سنة إذا رغبت في الاطلاع على وضع أصول عملك والتزاماته وصافي قيمته بوتيرة أكبر.', 'Decide how often you will make your Balance Sheet. It must be made at least once a year, but may be made monthly, quarterly or semi-annually if you wish to be appraised of the status of the assets, liabilities and net worth of your business more often.')
    ] },

    { id: 'other', pg: '59', title: B('6. استخدامات أخرى للسجلات (Other uses of records)', '6 Other uses of records'), blocks: [
      p('تساعدك سجلات عملك على معرفة كيف يؤدي عملك. ويمكنك استخدام السجلات لتحليل عملك ووضع خطط للتحسين. كما تساعدك سجلات عملك على حساب تكاليف بضائعك أو خدماتك بدقة أكبر.', 'Your business records help you to find out how your business is performing. You can use records to analyse your business and develop plans for improvement. Your business records also help you to calculate the costs of your goods or services more accurately.'),
      note('انظر دليل التخطيط لعملك من IYB (IYB PLANING FOR YOUR BUSINESS MANUAL) لمعرفة المزيد عن تحليل عملك باستخدام سجلات العمل السابقة.', 'See the IYB PLANING FOR YOUR BUSINESS MANUAL to learn more about analysing your business using past business records.'),
      note('انظر دليل تكاليف IYB (IYB COSTING MANUAL) لمعرفة كيفية استخدام سجلات العمل في حساب التكاليف.', 'See the IYB COSTING MANUAL to learn about using business records to calculate costs.')
    ] },

    { id: 'sum', pg: '59–60', summary: true, title: B('7. ملخص (Summary)', '7. Summary'), blocks: [
      p('استخدم سجلاتك من أجل:', 'Use your records to:'),
      ul([
        ['إدارة نقدك: في نهاية اليوم، ينبغي أن يكون النقد في صندوق النقد والرصيد النقدي متساويين. وإذا كان هناك فرق، فحاول معرفة السبب.', 'Manage your cash: At the end of the day, the money in your cash box and the cash balance should be the same. If there is a difference, try to find the reason.'],
        ['إدارة المدينين: انظر أي العملاء يحتاجون إلى سداد حساباتهم وأي العملاء بلغوا حد الائتمان الخاص بهم.', 'Manage your debtors: See which customers need to pay on their accounts and which customers have reached their credit limit.'],
        ['حساب ربحك:', 'Calculate your profit:']
      ]),
      formula('المبيعات – تكاليف المواد – تكاليف العمالة = الربح الإجمالي – النفقات العامة = صافي الربح | Sales – Material Costs – Labour Costs = Gross Profit – Overhead Expenses = Net Profit', 'Sales – Material Costs – Labour Costs = Gross Profit – Overhead Expenses = Net Profit'),
      p('الربح الإجمالي هو مقدار المال المتبقي بعد طرح جميع تكاليف إنتاج بضائعك أو خدماتك، بما فيها تكاليف المواد وتكاليف العمالة. ويجب أن يكون الربح الإجمالي مرتفعاً بما يكفي لدفع النفقات العامة في عملك.', 'Gross Profit is the amount of money left after you have subtracted all the costs to make your goods or services, including Material Costs and Labour Costs. The Gross Profit must be high enough to pay for the Overhead Expenses in your business.'),
      p('يبيّن صافي الربح مقدار المال المتبقي بعد طرح النفقات العامة من الربح الإجمالي. ويبيّن صافي الربح النتيجة الكلية لعملك. اطرح الضرائب من صافي الربح للحصول على صافي الدخل للعمل.', 'Net Profit shows the amount of money left after you have subtracted Overhead Expenses from the Gross Profit. The Net Profit shows the total result for your business. Subtract taxes from Net Profit to get Net Income of the business.'),
      ul([
        ['حساب الضرائب المستحقة عليك: يمكنك حساب مبلغ ضريبة الدخل التي يحتاج عملك إلى دفعها بناءً على صافي ربحك. واستخدم المعلومات الواردة في سجلك الأساسي لتحديد مبلغ ضريبة القيمة المضافة الذي يحتاج عملك إلى تقديمه.', 'Calculate your Tax Payables: You can calculate the amount of income tax your business needs to pay, based on your Net Profit. Use the information in your Basic Record Book to work out the amount of VAT your business needs to submit.'],
        ['إعداد قائمة المركز المالي: قائمة المركز المالي أداة تبيّن أصول عملك (ما يملكه عملك) والتزاماته (ما يدين به عملك للآخرين). وتساعدك قائمة المركز المالي على معرفة صافي قيمة عملك. ولإعداد قائمة المركز المالي، دوّن قيمة أصول عملك والتزاماته باتباع هذه الخطوات العشر:', 'Make a Balance Sheet: A Balance Sheet is a tool that shows your business’ assets (what your business owns) and the liabilities (what your business owes to others). The Balance Sheet helps you to find out the net worth of your business. To make a Balance Sheet, write down the value of the assets and liabilities of your business by following these ten steps:']
      ]),
      { t: 'ol', items: [
        B('الخطوة 1: النقد', 'Step 1: Cash'), B('الخطوة 2: الذمم المدينة', 'Step 2: Accounts Receivable'), B('الخطوة 3: المخزون', 'Step 3: Inventory'),
        B('الخطوة 4: الممتلكات والمعدات', 'Step 4: Property and equipment'), B('الخطوة 5: إجمالي الأصول', 'Step 5: TOTAL ASSETS'), B('الخطوة 6: الذمم الدائنة', 'Step 6: Accounts Payable'),
        B('الخطوة 7: الضرائب المستحقة', 'Step 7: Taxes Payable'), B('الخطوة 8: القروض القائمة', 'Step 8: Loans outstanding'), B('الخطوة 9: إجمالي الالتزامات', 'Step 9: TOTAL LIABILITIES'), B('الخطوة 10: صافي القيمة', 'Step 10: NET WORTH')
      ] },
      p('تأتي المعلومات التي تحتاجها من سجلك الأساسي، وسجل حسابات العملاء، وسجل المخزون، وسجل الأصول، وسجل القروض، وسجل الضرائب المستحقة، وسجل الدائنين.', 'The information you need comes from your Basic Record Book, the Customers’ Accounts Record, the Inventory Record, the Asset Register, the Loan Record, the Tax Payable Record and the Creditors’ Record.'),
      p('أعدّ قائمة مركز مالي مرة واحدة على الأقل كل سنة.', 'Make a Balance Sheet at least once each year.'),
      p('كما تساعدك سجلات عملك على فهم عملك بشكل أفضل وعلى حساب التكاليف.', 'Your business records also help you to better understand your business and to calculate costs.')
    ] }
  ];
})();
