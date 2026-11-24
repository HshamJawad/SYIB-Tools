/* IYB Planning for Your Business (mode "planning") – Phase 1: module foundation, navigation shell and bilingual landing page.
   Section views show only the manual's table-of-contents structure and a "later phase" note; learning content,
   activities, assessments and planning tools arrive in Phase 2+. Scoped under .pyp-root; shares nothing with other modules. */
(() => {
  'use strict';
  const D = window.SIYB_PYP_DATA;
  const store = window.SIYBPlanningStore;
  const L = window.SIYBPlanningLearn;
  const $ = (id) => document.getElementById(id);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const NAV = [{ id: 'home', icon: '▥', no: '', title: D.B('لوحة التخطيط', 'Planning overview') }].concat(D.SECTIONS);
  const byId = (id) => NAV.find((s) => s.id === id) || NAV[0];
  let root = null; let currentId = null;

  const later = (s) => X('المحتوى في المرحلة ' + s.phase + ' من التطوير', 'Content arrives in development phase ' + s.phase);
  const pill = (s) => (s.live ? L.progBar(s.id, '') : `<span class="pyp-status">${esc(later(s))}</span>`);
  const appTag = () => `<span class="pyp-apptag">${X('إرشاد التطبيق', 'Application guidance')}</span>`;

  const credit = () => `<section class="pyp-panel pyp-credit" aria-labelledby="pypCreditH"><h3 id="pypCreditH">${X('المصدر والترخيص', 'Source and licence')}</h3>
    <p>${X('المصدر: منظمة العمل الدولية (ILO)، «حسّن مشروعك (IYB): التخطيط لمشروعك»، 2015، ويُوزَّع بموجب رخصة CC BY-SA 3.0 IGO. تُنسب الأفكار والمنهجية إلى المنظمة، وتسري رخصة المشاركة بالمثل على أي تكييف للمحتوى المرخّص.', 'Source: International Labour Office (ILO), “Improve Your Business (IYB): Planning for Your Business”, 2015, distributed under the CC BY-SA 3.0 IGO licence. The ideas and methodology are credited to the ILO; the ShareAlike requirement applies to any adaptation of the licensed content.')}</p>
    <p>${X('هذا تكييف لعمل أصلي أصدره مكتب العمل الدولي (ILO). المسؤولية عن الآراء الواردة في هذا التكييف تقع على عاتق مؤلفيه وحدهم، ولا يحظى بتأييد منظمة العمل الدولية.', 'This is an adaptation of an original work by the International Labour Office (ILO). Responsibility for the views and opinions expressed in the adaptation rests solely with the author or authors of the adaptation and are not endorsed by the ILO.')}</p>
    <p>${X('هذه الترجمة لم يُعدّها مكتب العمل الدولي (ILO) ولا تُعدّ ترجمة رسمية له، والمنظمة غير مسؤولة عن محتوى هذه الترجمة أو دقتها.', 'This translation was not created by the International Labour Office (ILO) and should not be considered an official ILO translation. The ILO is not responsible for the content or accuracy of this translation.')}</p>
    <p class="pyp-small">${X('لا يُستخدم شعار منظمة العمل الدولية ولا شعار SIYB في هذه الأداة، ولا يعني ذلك أي تأييد رسمي.', 'The ILO emblem and the SIYB logo are not used in this tool, and nothing here implies official endorsement.')}</p></section>`;

  const prelim = () => `<div class="pyp-notice" role="note">${appTag()} ${X('الترجمة العربية في هذه الوحدة <strong>ترجمة أولية</strong> أعدّها مطوّر الأداة وتحتاج إلى مراجعة لغوية ومهنية قبل الاعتماد.', 'The Arabic text in this module is a <strong>preliminary translation</strong> prepared by the tool developer and needs linguistic and professional review before it is adopted.')}</div>`;
  const edu = () => `<div class="pyp-notice" role="note">${appTag()} ${X('هذه الوحدة أداة تعليمية للتخطيط. التوقعات تقديرات وليست نتائج مضمونة، ولا توصي الأداة بالاقتراض ولا باختيار جهة تمويل.', 'This module is an educational planning tool. Forecasts are estimates, not guaranteed outcomes, and the tool does not recommend borrowing or any particular lender.')}</div>`;
  const storageNote = () => (store.status().available ? '' : `<div class="pyp-notice warn" role="alert">${X('تعذّر الحفظ الدائم على هذا الجهاز؛ تُحفظ بياناتك في الذاكرة المؤقتة لهذه الجلسة فقط.', 'Persistent storage is unavailable on this device; your data is kept in temporary memory for this session only.')}</div>`);

  function buildNav() {
    const nav = document.querySelector('[data-nav-group="planning"]'); if (!nav) return;
    const act = document.body.classList.contains('mode-planning');
    nav.innerHTML = NAV.map((s) => {
      const on = act && s.id === currentId;
      return `<button type="button" class="global-nav-item${on ? ' active' : ''}" data-nav-item="planning-${s.id}" data-section="${s.id}"${on ? ' aria-current="page"' : ''}><span class="global-nav-icon">${s.icon}</span><span class="global-nav-label">${s.no && s.id !== 'end' ? `<bdi class="pyp-nav-no">${s.no}</bdi> ` : ''}${esc(T(s.title))}</span><span class="global-nav-current"></span></button>`;
    }).join('');
  }
  function setHeading(s) {
    const t = $('workspaceTitle'), d = $('workspaceDescription'), n = $('workspaceBadgeNumber'), l = $('workspaceBadgeLabel');
    if (t) t.textContent = X('التخطيط لمشروعك (IYB)', 'Planning for Your Business (IYB)');
    if (d) d.textContent = X('خمسة أجزاء وخمس خطط تقود من تحليل مشروعك إلى خطة العام القادم', 'Five parts and five plans that lead from analysing your business to next year’s plan');
    if (n) n.textContent = 'PL';
    if (l) l.textContent = X('حسّن مشروعك · التخطيط', 'Improve Your Business · Planning');
  }

  function renderHome() {
    const cards = D.SECTIONS.filter((s) => s.id !== 'data').map((s) => `<button type="button" class="pyp-card" data-act="go" data-id="${s.id}" aria-label="${esc((s.id === 'end' ? '' : s.no + ' · ') + T(s.title))}">
      <span class="pyp-card-top"><span class="pyp-card-no">${s.id === 'end' ? '✔' : s.no}</span><span class="pyp-card-icon" aria-hidden="true">${s.icon}</span></span>
      <span class="pyp-card-title">${esc(T(s.title))}</span>
      <span class="pyp-card-desc">${esc(s.topics.map(T).slice(0, 3).join(X('، ', ', ')))}…</span>
      ${pill(s)}</button>`).join('');
    const plans = D.PLANS.map((p, i) => `<li><bdi class="pyp-plan-no">${i + 1}</bdi> ${esc(T(p))}</li>`).join('');
    return `<h2>${X('التخطيط لمشروعك — حسّن مشروعك (IYB)', 'Planning for Your Business — Improve Your Business (IYB)')}</h2>
      <p class="pyp-lead">${X('تتبع هذه الوحدة تسلسل الدليل: التخطيط للمستقبل، ثم تحليل المشروع، ثم توقّع التغيّرات الخارجية، ثم إدارة المخاطر، ثم إعداد الخطط الخمس.', 'This module follows the manual’s sequence: planning for the future, analysing your business, forecasting external changes, managing risk, and finally making the five plans.')} ${appTag()}</p>
      ${storageNote()}${prelim()}${edu()}
      <div class="pyp-grid">${cards}</div>
      <section class="pyp-panel" aria-labelledby="pypPlansH"><h3 id="pypPlansH">${X('الخطط الخمس في الدليل', 'The five plans in the manual')}</h3><ol class="pyp-plans">${plans}</ol>
        <p class="pyp-small">${X('الجزءان الأول والثاني متاحان الآن؛ وتُنفَّذ أدوات الخطط الخمس في المرحلة 5 من التطوير، وفق تسلسل الدليل.', 'Parts I and II are available now; the tools for the five plans arrive in development phase 5, following the manual’s sequence.')}</p></section>
      ${credit()}`;
  }

  const pager = (p, n, ar) => `<div class="pyp-pager">${p ? `<button type="button" class="pyp-btn" data-act="go" data-id="${p.id}">${ar ? '→ ' : '← '}${esc(T(p.title))}</button>` : '<span></span>'}${n ? `<button type="button" class="pyp-btn primary" data-act="go" data-id="${n.id}">${esc(T(n.title))} ${ar ? '←' : '→'}</button>` : '<span></span>'}</div>`;
  function renderSection(id) {
    const s = byId(id); const ar = lang() === 'ar';
    const i = NAV.findIndex((x) => x.id === id); const p = NAV[i - 1], n = NAV[i + 1];
    let body;
    if (s.live) {
      return L.renderPart(s.id) + credit() + pager(p, n, ar);
    }
    if (s.id === 'data') {
      body = `<p>${X('النسخ الاحتياطي والاستيراد ومسح البيانات وتقرير PDF ستتوفر في المرحلة 7.', 'Backup, import, erase and the PDF report will be available in phase 7.')}</p>
        <p class="pyp-small">${X('مفتاح التخزين المعزول لهذه الوحدة: ', 'This module’s isolated storage key: ')}<code dir="ltr">${esc(store.KEY)}</code></p>`;
    } else {
      body = `<p class="pyp-cov"><strong>${X('محتويات الدليل (حسب الفهرس): ', 'Manual contents (per its table of contents): ')}</strong></p>
        <ul class="pyp-topics">${s.topics.map((t) => `<li>${esc(T(t))}</li>`).join('')}</ul>
        ${s.activities ? `<p class="pyp-meta"><strong>${X('الأنشطة: ', 'Activities: ')}</strong><bdi>${esc(s.activities)}</bdi> · <strong>${X('التقييم: ', 'Assessment: ')}</strong><bdi>${esc(s.assessment)}</bdi></p>` : ''}
        <div class="pyp-placeholder">${X('المحتوى التعليمي والأنشطة والتقييمات وأدوات الخطط لم تُضَف بعد؛ تُنفَّذ في المرحلة ' + s.phase + ' بعد مراجعتك.', 'The learning content, activities, assessments and planning tools are not included yet; they are implemented in phase ' + s.phase + ' after your review.')}</div>`;
    }
    return `<div class="pyp-actions"><button type="button" class="pyp-btn" data-act="go" data-id="home">${ar ? '→' : '←'} ${X('العودة إلى اللوحة', 'Back to overview')}</button></div>
      <section class="pyp-panel"><div class="pyp-panel-head">${s.no && s.id !== 'data' ? `<span class="pyp-card-no">${s.id === 'end' ? '✔' : s.no}</span>` : ''}<h2>${esc((s.id !== 'end' && s.id !== 'data' ? X('الجزء ', 'Part ') + s.no + (ar ? ': ' : ': ') : '') + T(s.title))}</h2>${s.id === 'data' ? '' : (s.id === 'end' ? '' : '')}${pill(s)}</div>${body}</section>
      ${s.id === 'data' ? '' : credit()}
      <div class="pyp-pager">${p ? `<button type="button" class="pyp-btn" data-act="go" data-id="${p.id}">${ar ? '→ ' : '← '}${esc(T(p.title))}</button>` : '<span></span>'}${n ? `<button type="button" class="pyp-btn primary" data-act="go" data-id="${n.id}">${esc(T(n.title))} ${ar ? '←' : '→'}</button>` : '<span></span>'}</div>`;
  }

  function render(keepScroll) {
    if (!root) return;
    const s = byId(currentId); const y = window.scrollY;
    const ae = document.activeElement; const fk = keepScroll && ae && root.contains(ae) && ae.dataset && ae.dataset.key ? ae.dataset.key : null;
    const sel = fk && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null;
    store.flush();
    root.innerHTML = s.id === 'home' ? renderHome() : renderSection(s.id);
    setHeading(s);
    L.recalc(root);
    if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    if (fk) { const el = root.querySelector('[data-key="' + fk + '"]'); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (_) { /* ignore */ } } } }
  }
  function open(id) {
    currentId = byId(id).id;
    store.set('lastSection', currentId);
    document.querySelectorAll('[data-nav-item^="planning-"]').forEach((b) => {
      const a = b.dataset.navItem === 'planning-' + currentId;
      b.classList.toggle('active', a);
      if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    render(false);
  }
  function mount(host) {
    host.innerHTML = '<div class="pyp-root" id="pypRoot"></div>';
    root = host.querySelector('#pypRoot');
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
      if (b.dataset.act === 'go') open(b.dataset.id);
    });
    L.bind(root, { rerender: (k) => render(k) });
    if (!currentId) { const last = store.get('lastSection', 'home'); currentId = NAV.some((s) => s.id === last) ? last : 'home'; }
    buildNav();
    open(currentId);
  }
  window.SIYBPlanning = { mount, open, current: () => currentId, refresh: () => { buildNav(); render(true); }, sections: NAV.map((s) => s.id) };
  window.addEventListener('siyb:languagechange', () => {
    if (!root) return;
    if (document.body.classList.contains('mode-planning')) window.SIYBPlanning.refresh(); else buildNav();
  });
})();
