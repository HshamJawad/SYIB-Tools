/* IYB Record Keeping (mode "recordkeeping") – Phase 1: module foundation, navigation shell and bilingual landing page.
   Section views show only the manual's table-of-contents structure and a "later phase" note. NO learning content, activities,
   assessments, interactive record forms or calculations yet (Phase 2+). Scoped under .rk-root; shares nothing with other modules. */
(() => {
  'use strict';
  const D = window.SIYB_RK_DATA;
  const store = window.SIYBRecordKeepingStore;
  const $ = (id) => document.getElementById(id);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const NAV = [{ id: 'home', icon: '▥', no: '', title: D.B('لوحة مسك السجلات', 'Record Keeping overview') }].concat(D.SECTIONS);
  const byId = (id) => NAV.find((s) => s.id === id) || NAV[0];
  let root = null; let currentId = null;

  const later = (s) => X('المحتوى في المرحلة ' + s.phase + ' من التطوير', 'Content arrives in development phase ' + s.phase);
  const pill = (s) => `<span class="rk-status">${esc(later(s))}</span>`;
  const appTag = () => `<span class="rk-apptag">${X('إرشاد التطبيق', 'Application guidance')}</span>`;
  const FORMS = [
    ['السجل الأساسي', 'Basic Record Book'], ['سجل حسابات العملاء', 'Customers’ Accounts Record'], ['سجل المبيعات النقدية اليومية', 'Daily Cash Sales Record'],
    ['سجل الأصول', 'Asset Register'], ['سجل الأجور', 'Salary Register'], ['سجل المخزون', 'Inventory Record'],
    ['سجل التكاليف التفصيلي', 'Detailed Cost Record'], ['سجل القروض', 'Loan Record'], ['سجل الدائنين', 'Creditors’ Record'], ['سجل الضرائب المستحقة', 'Tax Payable Record']
  ];

  const credit = () => `<section class="rk-panel rk-credit" aria-labelledby="rkCreditH"><h3 id="rkCreditH">${X('المصدر والترخيص', 'Source and licence')}</h3>
    <p>${X('المصدر: منظمة العمل الدولية (ILO)، «حسّن مشروعك (IYB): مسك السجلات»، 2015، ويُوزَّع بموجب رخصة CC BY-SA 3.0 IGO. تُنسب الأفكار والمنهجية إلى المنظمة، وتسري رخصة المشاركة بالمثل على أي تكييف للمحتوى المرخّص.', 'Source: International Labour Office (ILO), “Improve Your Business (IYB): Record Keeping”, 2015, distributed under the CC BY-SA 3.0 IGO licence. The ideas and methodology are credited to the ILO; the ShareAlike requirement applies to any adaptation of the licensed content.')}</p>
    <p>${X('هذا تكييف لعمل أصلي أصدره مكتب العمل الدولي (ILO). المسؤولية عن الآراء الواردة في هذا التكييف تقع على عاتق مؤلفيه وحدهم، ولا يحظى بتأييد منظمة العمل الدولية.', 'This is an adaptation of an original work by the International Labour Office (ILO). Responsibility for the views and opinions expressed in the adaptation rests solely with the author or authors of the adaptation and are not endorsed by the ILO.')}</p>
    <p>${X('هذه الترجمة لم يُعدّها مكتب العمل الدولي (ILO) ولا تُعدّ ترجمة رسمية له، والمنظمة غير مسؤولة عن محتوى هذه الترجمة أو دقتها.', 'This translation was not created by the International Labour Office (ILO) and should not be considered an official ILO translation. The ILO is not responsible for the content or accuracy of this translation.')}</p>
    <p class="rk-small">${X('لا يُستخدم شعار منظمة العمل الدولية ولا شعار SIYB في هذه الأداة، ولا يعني ذلك أي تأييد رسمي.', 'The ILO emblem and the SIYB logo are not used in this tool, and nothing here implies official endorsement.')}</p></section>`;
  const prelim = () => `<div class="rk-notice" role="note">${appTag()} ${X('الترجمة العربية في هذه الوحدة <strong>ترجمة أولية</strong> بالعربية الفصحى أعدّها مطوّر الأداة عن النص الإنجليزي الرسمي، وتحتاج إلى مراجعة لغوية ومهنية قبل الاعتماد.', 'The Arabic text in this module is a <strong>preliminary translation</strong> into formal Arabic prepared by the tool developer from the official English manual and needs linguistic and professional review before it is adopted.')}</div>`;
  const edu = () => `<div class="rk-notice" role="note">${appTag()} ${X('هذه الوحدة أداة تعليمية لمسك السجلات، وليست برنامج محاسبة ولا تقدّم استشارة ضريبية أو قانونية. لا تفترض الأداة عملة ولا معدل ضريبة.', 'This module is an educational record-keeping tool. It is not accounting software and gives no tax or legal advice. The tool assumes no currency and no tax rate.')}</div>`;
  const storageNote = () => (store.status().available ? '' : `<div class="rk-notice warn" role="alert">${X('تعذّر الحفظ الدائم على هذا الجهاز؛ تُحفظ بياناتك في الذاكرة المؤقتة لهذه الجلسة فقط.', 'Persistent storage is unavailable on this device; your data is kept in temporary memory for this session only.')}</div>`);

  function buildNav() {
    const nav = document.querySelector('[data-nav-group="recordkeeping"]'); if (!nav) return;
    const act = document.body.classList.contains('mode-recordkeeping');
    nav.innerHTML = NAV.map((s) => {
      const on = act && s.id === currentId;
      return `<button type="button" class="global-nav-item${on ? ' active' : ''}" data-nav-item="recordkeeping-${s.id}" data-section="${s.id}"${on ? ' aria-current="page"' : ''}><span class="global-nav-icon">${s.icon}</span><span class="global-nav-label">${s.no ? `<bdi class="rk-nav-no">${s.no}</bdi> ` : ''}${esc(T(s.title))}</span><span class="global-nav-current"></span></button>`;
    }).join('');
  }
  function setHeading() {
    const t = $('workspaceTitle'), d = $('workspaceDescription'), n = $('workspaceBadgeNumber'), l = $('workspaceBadgeLabel');
    if (t) t.textContent = X('مسك السجلات (IYB)', 'Record Keeping (IYB)');
    if (d) d.textContent = X('ثلاثة أجزاء تقود من فهم مسك السجلات إلى استخدامها لتحسين مشروعك', 'Three parts that lead from understanding record keeping to using records to improve your business');
    if (n) n.textContent = 'RK';
    if (l) l.textContent = X('حسّن مشروعك · مسك السجلات', 'Improve Your Business · Record Keeping');
  }

  function renderHome() {
    const cards = D.SECTIONS.filter((s) => s.id !== 'data').map((s) => `<button type="button" class="rk-card" data-act="go" data-id="${s.id}" aria-label="${esc((s.no ? s.no + ' · ' : '') + T(s.title))}">
      <span class="rk-card-top"><span class="rk-card-no">${s.no || s.icon}</span><span class="rk-card-icon" aria-hidden="true">${s.icon}</span></span>
      <span class="rk-card-title">${esc(T(s.title))}</span>
      <span class="rk-card-desc">${esc(s.topics.map(T).slice(0, 3).join(X('، ', ', ')))}…</span>
      ${pill(s)}</button>`).join('');
    return `<h2>${X('مسك السجلات — حسّن مشروعك (IYB)', 'Record Keeping — Improve Your Business (IYB)')}</h2>
      <p class="rk-lead">${X('تتبع هذه الوحدة تسلسل الدليل: مسك سجلات المشروع، ثم نظام مبسط لمسك السجلات، ثم استخدام السجلات لتحسين مشروعك، ثم مواد الختام والنماذج.', 'This module follows the manual’s sequence: keeping business records, a simple system of keeping records, using records to improve your business, then the end matter and the forms.')} ${appTag()}</p>
      ${storageNote()}${prelim()}${edu()}
      <div class="rk-grid">${cards}</div>
      <section class="rk-panel" aria-labelledby="rkFoundH"><h3 id="rkFoundH">${X('حالة التطوير', 'Development status')}</h3>
        <p class="rk-small">${X('هذه مرحلة التأسيس: التنقل والإسناد والتخزين المعزول. لم يُضَف بعد المحتوى التعليمي ولا الأنشطة ولا التقييمات ولا نماذج السجلات التفاعلية ولا الحسابات؛ تأتي في المراحل التالية بعد مراجعتك.', 'This is the foundation phase: navigation, attribution and isolated storage. The learning content, activities, assessments, interactive record forms and calculations are not included yet; they come in later phases after your review.')}</p></section>
      ${credit()}`;
  }

  const pager = (p, n, ar) => `<div class="rk-pager">${p ? `<button type="button" class="rk-btn" data-act="go" data-id="${p.id}">${ar ? '→ ' : '← '}${esc(T(p.title))}</button>` : '<span></span>'}${n ? `<button type="button" class="rk-btn primary" data-act="go" data-id="${n.id}">${esc(T(n.title))} ${ar ? '←' : '→'}</button>` : '<span></span>'}</div>`;
  function renderSection(id) {
    const s = byId(id); const ar = lang() === 'ar';
    const i = NAV.findIndex((x) => x.id === id); const p = NAV[i - 1], n = NAV[i + 1];
    let body;
    if (s.id === 'data') {
      body = `<p>${X('النسخ الاحتياطي والاستيراد ومسح البيانات والتقرير ستتوفر في المرحلة 7.', 'Backup, import, erase and the report will be available in phase 7.')}</p>
        <p class="rk-small">${X('مفتاح التخزين المعزول لهذه الوحدة: ', 'This module’s isolated storage key: ')}<code dir="ltr">${esc(store.KEY)}</code></p>`;
    } else {
      body = `<p class="rk-cov"><strong>${X('محتويات الدليل (حسب الفهرس): ', 'Manual contents (per its table of contents): ')}</strong></p>
        <ul class="rk-topics">${s.topics.map((t) => `<li>${esc(T(t))}</li>`).join('')}</ul>
        ${s.id === 'forms' ? `<ol class="rk-forms">${FORMS.map((f) => `<li>${esc(X(f[0], f[1]))}</li>`).join('')}</ol>` : ''}
        ${s.activities ? `<p class="rk-meta"><strong>${X('الأنشطة: ', 'Activities: ')}</strong><bdi>${esc(s.activities)}</bdi> · <strong>${X('التقييم: ', 'Assessment: ')}</strong><bdi>${esc(s.assessment)}</bdi></p>` : (s.assessment ? `<p class="rk-meta"><strong>${X('التقييم: ', 'Assessment: ')}</strong><bdi>${esc(s.assessment)}</bdi></p>` : '')}
        <div class="rk-placeholder">${X('المحتوى التعليمي والأنشطة والتقييمات والنماذج التفاعلية لم تُضَف بعد؛ تُنفَّذ في المرحلة ' + s.phase + ' بعد مراجعتك.', 'The learning content, activities, assessments and interactive forms are not included yet; they are implemented in phase ' + s.phase + ' after your review.')}</div>`;
    }
    return `<div class="rk-actions"><button type="button" class="rk-btn" data-act="go" data-id="home">${ar ? '→' : '←'} ${X('العودة إلى اللوحة', 'Back to overview')}</button></div>
      <section class="rk-panel"><div class="rk-panel-head">${s.no ? `<span class="rk-card-no">${s.no}</span>` : ''}<h2>${esc((s.no ? X('الجزء ', 'Part ') + s.no + ': ' : '') + T(s.title))}</h2>${s.id === 'data' ? '' : pill(s)}</div>${body}</section>
      ${s.id === 'data' ? '' : credit()}${pager(p, n, ar)}`;
  }

  function render(keepScroll) {
    if (!root) return;
    const s = byId(currentId); const y = window.scrollY;
    store.flush();
    root.innerHTML = s.id === 'home' ? renderHome() : renderSection(s.id);
    setHeading();
    if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function open(id) {
    currentId = byId(id).id;
    store.set('lastSection', currentId);
    document.querySelectorAll('[data-nav-item^="recordkeeping-"]').forEach((b) => {
      const a = b.dataset.navItem === 'recordkeeping-' + currentId;
      b.classList.toggle('active', a);
      if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    render(false);
  }
  function mount(host) {
    host.innerHTML = '<div class="rk-root" id="rkRoot"></div>';
    root = host.querySelector('#rkRoot');
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
      if (b.dataset.act === 'go') open(b.dataset.id);
    });
    if (!currentId) { const last = store.get('lastSection', 'home'); currentId = NAV.some((s) => s.id === last) ? last : 'home'; }
    buildNav();
    open(currentId);
  }
  window.SIYBRecordKeeping = { mount, open, current: () => currentId, refresh: () => { buildNav(); render(true); }, sections: NAV.map((s) => s.id) };
  window.addEventListener('siyb:languagechange', () => {
    if (!root) return;
    if (document.body.classList.contains('mode-recordkeeping')) window.SIYBRecordKeeping.refresh(); else buildNav();
  });
})();
