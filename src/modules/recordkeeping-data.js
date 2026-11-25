/* IYB Record Keeping – content-independent structure (Phase 1).
   Section titles and topic lists follow the English manual's table of contents (ILO 2015; printed page numbers as given there).
   Descriptions, notices and labels are application guidance – NOT text from the manual.
   Arabic is a PRELIMINARY formal-Arabic rendering translated directly from the English (not an official ILO translation).
   No learning content, activities, assessments, answers, forms or calculations are included yet (Phase 2+). */
window.SIYB_RK_DATA = (() => {
  const B = (ar, en) => ({ ar, en });
  const SECTIONS = [
    { id: 'intro', icon: '◇', no: '', phase: 2, page: 'i',
      title: B('المقدمة', 'Introduction'),
      topics: [B('ما موضوع هذا الدليل؟', 'What is this manual about?'), B('من ينبغي أن يقرأ هذا الدليل؟', 'Who should read this manual?'),
        B('أهداف هذا الدليل', 'Objectives of this manual'), B('كيف يُستخدم هذا الدليل؟', 'How to use this manual?')] },
    { id: 'p1', no: 'I', icon: '◎', phase: 2, page: '01',
      title: B('مسك سجلات المشروع', 'Keeping Business Records'),
      topics: [B('ما هو مسك السجلات؟', 'What is record keeping?'), B('كيف يمكن للسجلات أن تحسّن مشروعك؟', 'How can records improve your business?'),
        B('الملخص', 'Summary')],
      activities: '1–2', assessment: '1' },
    { id: 'p2', no: 'II', icon: '▤', phase: 2, page: '11',
      title: B('نظام مبسط لمسك السجلات', 'A Simple System of Keeping Records'),
      topics: [B('أي السجلات ينبغي الاحتفاظ بها؟', 'Which records to keep?'), B('السجل الأساسي (Basic Record Book)', 'The Basic Record Book'),
        B('كيف يُملأ السجل الأساسي؟', 'How to fill in the Basic Record Book?'),
        B('سجلات أخرى مفيدة: الأصول، الأجور، المخزون، التكاليف التفصيلية، القروض، الدائنون، الضرائب المستحقة', 'Other useful record books: Asset Register, Salary Register, Inventory Record, Detailed Cost Record, Loan Record, Creditors’ Record, Tax Payable Record'),
        B('كيف تحتفظ بسجلاتك؟ الطريقة الورقية والطريقة الحاسوبية', 'How to keep your records? Paper based method and Computer method'),
        B('الملخص', 'Summary')],
      activities: '3–7', assessment: '2' },
    { id: 'p3', no: 'III', icon: '◈', phase: 2, page: '49',
      title: B('استخدام السجلات لتحسين مشروعك', 'Use Records to Improve Your Business'),
      topics: [B('إدارة نقدك', 'Manage your cash'), B('إدارة المدينين', 'Manage your debtors'), B('احسب ربحك', 'Calculate your profit'),
        B('احسب الضريبة المستحقة عليك', 'Calculate your Tax Payable'), B('أنشئ الميزانية العمومية (Balance Sheet)', 'Create a Balance Sheet'),
        B('استخدامات أخرى للسجلات', 'Other uses of records'), B('الملخص', 'Summary')],
      assessment: '3' },
    { id: 'end', no: '', icon: '✔', phase: 6, page: '63',
      title: B('ماذا تعلّمت من هذا الدليل؟', 'What Did You Learn in This Manual?'),
      topics: [B('هل تستطيع المساعدة؟ (Can You Help?)', 'Can You Help?'), B('خطة العمل (Action Plan)', 'Action Plan'), B('الإجابات', 'Answers'),
        B('مفردات أعمال مفيدة', 'Useful business words')] },
    { id: 'forms', no: '', icon: '▦', phase: 6, page: '77',
      title: B('نماذج مسك السجلات', 'Record Keeping Forms'),
      topics: [B('عشرة نماذج في نهاية الدليل', 'Ten forms at the end of the manual')] },
    { id: 'data', no: '', icon: '⛁', phase: 7, page: '',
      title: B('البيانات والتقرير', 'Data & Report'), topics: [] }
  ];
  return { B, SECTIONS };
})();
