/* IYB Planning – content-independent structure (Phase 1).
   Section titles and the topic lists follow the manual's table of contents (printed page numbers as given there).
   Activity/assessment numbers follow the manual: Activity 1 (Part I), 2–3 (II), 4–5 (III), 6 (IV), 7–20 (V); Assessments 1–5.
   Descriptions, notices and labels are application guidance – NOT text from the manual.
   Arabic is a PRELIMINARY translation (not an official ILO translation). No learning content, activities,
   assessments or answers are included yet (Phase 2+). */
window.SIYB_PYP_DATA = (() => {
  const B = (ar, en) => ({ ar, en });
  const SECTIONS = [
    { id: 'p1', live: true, no: 'I', icon: '◎', phase: 2, page: '01',
      title: B('التخطيط للمستقبل', 'Planning for the Future'),
      topics: [
        B('ما هو التخطيط؟', 'What is planning?'), B('هل التخطيط ضروري؟', 'Is planning necessary?'),
        B('كيف يمكن للتخطيط أن يحسّن مشروعك؟', 'How can planning improve your business?'),
        B('خطط مفيدة: المبيعات والتسويق، الإنتاج والتكاليف، الأرباح، التدفق النقدي، الحصول على قرض', 'Useful plans: Sales and Marketing, Production and Cost, Profit, Cash Flow, Loan Access'),
        B('نصائح لإعداد خطة', 'Tips for making a plan')],
      activities: '1', assessment: '1' },
    { id: 'p2', live: true, no: 'II', icon: '◈', phase: 2, page: '15',
      title: B('إجراء تحليل لمشروعك', 'Doing a Business Analysis'),
      topics: [
        B('تحليل المبيعات والتسويق', 'Analyse your sales and marketing'), B('تحليل الإنتاج والتكاليف', 'Analyse your production and costs'),
        B('تحليل الربح', 'Analyse your profit'),
        B('لكل تحليل ثلاث خطوات: الحصول على بيانات سابقة، ومقارنة سجلاتك، وإيجاد الأسباب', 'Each analysis has three steps: get past data, compare your records, find reasons')],
      activities: '2–3', assessment: '2' },
    { id: 'p3', live: true, no: 'III', icon: '◐', phase: 3, page: '29',
      title: B('توقّع التغيّرات في البيئة الخارجية', 'Forecasting Changes in the External Environment'),
      topics: [
        B('ما هو التوقّع؟', 'What is a forecast?'),
        B('تغيّرات قد تؤثر في مبيعاتك وتسويقك', 'Changes that may impact your sales and marketing'),
        B('تغيّرات قد تؤثر في إنتاجك وتكاليفك', 'Changes that may impact your production and costs')],
      activities: '4–5', assessment: '3' },
    { id: 'p4', live: true, no: 'IV', icon: '◬', phase: 4, page: '37',
      title: B('إدارة المخاطر', 'Managing Risk'),
      topics: [
        B('ما هي المخاطر؟', 'What is risk?'), B('ما هي إدارة المخاطر؟', 'What is Risk Management?'),
        B('مراحل عملية إدارة المخاطر', 'Stages in the Risk Management process'), B('استراتيجيات إدارة المخاطر', 'Risk Management strategies')],
      activities: '6', assessment: '4' },
    { id: 'p5', no: 'V', icon: '▣', phase: 5, page: '43',
      title: B('إعداد الخطط', 'Making Plans'),
      topics: [
        B('تحديد أهداف المشروع', 'Set business objectives'),
        B('دمج استراتيجيات إدارة المخاطر في التخطيط', 'Incorporate Risk Management strategies in planning'),
        B('إعداد خطة المبيعات والتسويق (ص 44)', 'Make a Sales and Marketing Plan (p. 44)'),
        B('إعداد خطة الإنتاج والتكاليف (ص 51)', 'Make a Production and Cost Plan (p. 51)'),
        B('إعداد خطة الأرباح (ص 66)', 'Make a Profit Plan (p. 66)'),
        B('إعداد خطة التدفق النقدي (ص 68)', 'Make a Cash Flow Plan (p. 68)'),
        B('إعداد خطة الحصول على قرض (ص 78)', 'Make a Loan Access Plan (p. 78)')],
      activities: '7–20', assessment: '5' },
    { id: 'end', no: '✔', icon: '✔', phase: 6, page: '89',
      title: B('نهاية الدليل: المراجعة وخطة العمل', 'End of the manual: Review & Action Plan'),
      topics: [
        B('ماذا تعلّمت في هذا الدليل؟', 'What Did You Learn in This Manual?'), B('هل تستطيع المساعدة؟', 'Can You Help?'),
        B('خطة العمل', 'Action Plan'), B('الإجابات', 'Answers'), B('المفردات التجارية المفيدة', 'Useful business words')],
      activities: '', assessment: '' },
    { id: 'data', no: '', icon: '⛁', phase: 7, page: '',
      title: B('البيانات والتقرير', 'Data & report'), topics: [], activities: '', assessment: '' }
  ];
  const PLANS = [
    B('خطة المبيعات والتسويق', 'Sales and Marketing Plan'), B('خطة الإنتاج والتكاليف', 'Production and Cost Plan'),
    B('خطة الأرباح', 'Profit Plan'), B('خطة التدفق النقدي', 'Cash Flow Plan'), B('خطة الحصول على قرض', 'Loan Access Plan')
  ];
  const SEVENPS = [
    { k: 'product', t: B('المنتج (Product)', 'Product') }, { k: 'price', t: B('السعر (Price)', 'Price') }, { k: 'place', t: B('المكان (Place)', 'Place') },
    { k: 'promotion', t: B('الترويج (Promotion)', 'Promotion') }, { k: 'people', t: B('الأشخاص (People)', 'People') },
    { k: 'process', t: B('العملية (Process)', 'Process') }, { k: 'physical', t: B('الدليل المادي (Physical Evidence)', 'Physical Evidence') }];
  return { B, SECTIONS, PLANS, SEVENPS };
})();
