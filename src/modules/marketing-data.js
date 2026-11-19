/* IYB Marketing – content-independent structure (Stage 1).
   Card titles and manual coverage follow the approved FRS (section 2). The short descriptions are application
   guidance derived from that coverage column – they are NOT text from the manual. No learning content,
   activities, assessments or answers are included yet (Stage 2+). */
window.SIYB_MK_DATA = (() => {
  const B = (ar, en) => ({ ar, en });
  const CARDS = [
    { id: 'c01', no: '01', icon: '◎', title: B('المدخل والتقدم', 'Introduction & Progress'),
      coverage: B('مدخل الدليل وأهدافه وكيفية استخدامه ونظرة على تقدم المتعلم', 'Manual introduction, objectives, how to use the manual, learner progress overview'),
      parts: [] },
    { id: 'c02', no: '02', icon: '◉', title: B('التسويق وقوة الزبائن', 'Marketing & the Power of Customers'),
      coverage: B('الجزء الأول: التسويق ومشروعك', 'Part I – Marketing and Your Business'), parts: ['I'] },
    { id: 'c03', no: '03', icon: '◈', title: B('تحديد مكانة المنتج', 'Positioning Your Product'),
      coverage: B('الجزء الثاني: تحديد مكانة المنتج', 'Part II – Positioning Your Product'), parts: ['II'] },
    { id: 'c04', no: '04', icon: '◧', title: B('المنتج والسعر', 'Product & Price'),
      coverage: B('الجزء الثالث: المنتج · الجزء الرابع: السعر', 'Part III – Product; Part IV – Price'), parts: ['III', 'IV'] },
    { id: 'c05', no: '05', icon: '◩', title: B('المكان والترويج', 'Place & Promotion'),
      coverage: B('الجزء الخامس: المكان · الجزء السادس: الترويج', 'Part V – Place; Part VI – Promotion'), parts: ['V', 'VI'] },
    { id: 'c06', no: '06', icon: '◍', title: B('المستخدمون وأساليب العمل', 'People & Processes'),
      coverage: B('الجزء السابع: الأشخاص · الجزء الثامن: العمليات', 'Part VII – People; Part VIII – Process'), parts: ['VII', 'VIII'] },
    { id: 'c07', no: '07', icon: '◫', title: B('الأدلة المادية', 'Physical Evidence'),
      coverage: B('الجزء التاسع: الأدلة المادية', 'Part IX – Physical Evidence'), parts: ['IX'] },
    { id: 'c08', no: '08', icon: '✔', title: B('التقييم وخطة العمل', 'Assessment & Action Plan'),
      coverage: B('مراجعة الدليل كاملاً، «هل تستطيع المساعدة؟»، خطة العمل، الإجابات ودعم المراجعة، والمفردات التجارية المفيدة',
        'Whole-manual review, “Can You Help?”, Action Plan, answers/review support and useful business words'), parts: [] }
  ];
  const STATUS = {
    notstarted: B('لم تبدأ', 'Not started'),
    inprogress: B('قيد التنفيذ', 'In progress'),
    done: B('مكتملة', 'Completed')
  };
  return { B, CARDS, STATUS };
})();
