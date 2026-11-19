/* IYB Marketing module (mode "marketing") – Stage 1: eight-card dashboard, navigation, bilingual structure.
   Card views hold only titles, coverage and a clearly marked placeholder; learning content arrives in Stage 2+.
   Scoped under .mk-root; shares nothing with Costing, Stock or GYB. */
(() => {
  'use strict';
  const D = window.SIYB_MK_DATA;
  const store = window.SIYBMarketingStore;
  const $ = (id) => document.getElementById(id);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const NAV = [{ id: 'home', icon: '▥', title: D.B('لوحة البطاقات', 'Card overview') }]
    .concat(D.CARDS.map((c) => ({ id: c.id, icon: c.icon, no: c.no, title: c.title })));
  const byId = (id) => NAV.find((s) => s.id === id) || NAV[0];
  const cardOf = (id) => D.CARDS.find((c) => c.id === id);

  let root = null;
  let currentId = null;

  const statusOf = (id) => { const v = store.get('progress.cards.' + id, ''); return D.STATUS[v] ? v : 'notstarted'; };

  function buildNav() {
    const nav = document.querySelector('[data-nav-group="marketing"]'); if (!nav) return;
    const act = document.body.classList.contains('mode-marketing');
    nav.innerHTML = NAV.map((s) => {
      const on = act && s.id === currentId;
      return `<button type="button" class="global-nav-item${on ? ' active' : ''}" data-nav-item="marketing-${s.id}" data-section="${s.id}"${on ? ' aria-current="page"' : ''}><span class="global-nav-icon">${s.icon}</span><span class="global-nav-label">${s.no ? `<bdi class="mk-nav-no">${s.no}</bdi> ` : ''}${esc(T(s.title))}</span><span class="global-nav-current"></span></button>`;
    }).join('');
  }
  function setHeading(s) {
    const t = $('workspaceTitle'), d = $('workspaceDescription'), n = $('workspaceBadgeNumber'), l = $('workspaceBadgeLabel');
    if (t) t.textContent = X('التسويق (IYB)', 'Marketing (IYB)');
    if (d) d.textContent = s.id === 'home' ? X('ثماني بطاقات تغطي أجزاء الدليل التسعة بالترتيب', 'Eight cards covering the manual\'s nine Parts in order') : T(s.title);
    if (n) n.textContent = s.no || 'MK';
    if (l) l.textContent = X('حسّن مشروعك · التسويق', 'Improve Your Business · Marketing');
  }

  const notice = () => `<div class="mk-notice" role="note"><strong>${X('إرشاد التطبيق', 'App guidance')}</strong> — ${X('هذا النص من إعداد التطبيق وليس من محتوى الدليل. المحتوى التعليمي (الأنشطة والتقييمات والإجابات) سيُضاف في مرحلة لاحقة.', 'This text is written by the application, not taken from the manual. The learning content (activities, assessments, answers) will be added in a later stage.')}</div>`;
  const storageNote = () => (store.status().available ? '' : `<div class="mk-notice warn" role="alert">${X('تعذّر الحفظ الدائم على هذا الجهاز؛ تُحفظ بياناتك في الذاكرة المؤقتة لهذه الجلسة فقط.', 'Persistent storage is unavailable on this device; your data is kept in temporary memory for this session only.')}</div>`);

  function renderHome() {
    const cards = D.CARDS.map((c) => {
      const st = statusOf(c.id);
      return `<button type="button" class="mk-card" data-act="go" data-id="${c.id}" aria-label="${esc(c.no + ' · ' + T(c.title))}">
        <span class="mk-card-top"><span class="mk-card-no">${c.no}</span><span class="mk-card-icon" aria-hidden="true">${c.icon}</span></span>
        <span class="mk-card-title">${esc(T(c.title))}</span>
        <span class="mk-card-desc">${esc(T(c.coverage))}</span>
        <span class="mk-status ${st}">${esc(T(D.STATUS[st]))}</span></button>`;
    }).join('');
    return `<h2>${X('التسويق — حسّن مشروعك (IYB)', 'Marketing — Improve Your Business (IYB)')}</h2>
      <p class="mk-lead">${X('اختر بطاقة لفتحها. تحدّد حالة كل بطاقة من عملك الفعلي فيها، لا من مجرد فتحها.', 'Choose a card to open it. A card\'s status reflects your actual work in it, not just opening it.')}</p>
      ${storageNote()}<div class="mk-grid">${cards}</div>${notice()}`;
  }
  function renderCard(id) {
    const c = cardOf(id); const st = statusOf(id);
    const i = D.CARDS.indexOf(c); const p = D.CARDS[i - 1], n = D.CARDS[i + 1]; const ar = lang() === 'ar';
    return `<div class="mk-actions"><button type="button" class="mk-btn" data-act="go" data-id="home">${ar ? '→' : '←'} ${X('العودة إلى لوحة البطاقات', 'Back to card overview')}</button></div>
      <section class="mk-panel"><div class="mk-panel-head"><span class="mk-card-no">${c.no}</span><h2>${esc(T(c.title))}</h2><span class="mk-status ${st}">${esc(T(D.STATUS[st]))}</span></div>
      <p class="mk-cov"><strong>${X('تغطية الدليل: ', 'Manual coverage: ')}</strong>${esc(T(c.coverage))}</p>
      <div class="mk-placeholder"><strong>${X('المحتوى قيد الإعداد', 'Content to be added')}</strong><p>${X('سيُضاف محتوى هذه البطاقة من الدليل في مرحلة لاحقة بعد اعتماد المصدر.', 'This card\'s content from the manual will be added in a later stage, once the source is approved.')}</p></div></section>
      ${notice()}
      <div class="mk-pager">${p ? `<button type="button" class="mk-btn" data-act="go" data-id="${p.id}">${ar ? '→ ' : '← '}${esc(T(p.title))}</button>` : '<span></span>'}${n ? `<button type="button" class="mk-btn primary" data-act="go" data-id="${n.id}">${esc(T(n.title))}${ar ? ' ←' : ' →'}</button>` : '<span></span>'}</div>`;
  }
  function render(keepScroll) {
    if (!root) return;
    const s = byId(currentId); const y = window.scrollY;
    root.innerHTML = s.id === 'home' ? renderHome() : renderCard(s.id);
    setHeading(s);
    if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function open(id) {
    currentId = byId(id).id;
    store.set('lastCard', currentId);
    document.querySelectorAll('[data-nav-item^="marketing-"]').forEach((b) => {
      const a = b.dataset.navItem === 'marketing-' + currentId;
      b.classList.toggle('active', a);
      if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    render(false);
  }
  function mount(host) {
    host.innerHTML = '<div class="mk-root" id="mkRoot"></div>';
    root = host.querySelector('#mkRoot');
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act="go"]'); if (b && root.contains(b)) open(b.dataset.id);
    });
    if (!currentId) { const last = store.get('lastCard', 'home'); currentId = NAV.some((s) => s.id === last) ? last : 'home'; }
    buildNav();
    open(currentId);
  }
  window.SIYBMarketing = { mount, open, current: () => currentId, refresh: () => { buildNav(); render(true); }, sections: NAV.map((s) => s.id) };
  window.addEventListener('siyb:languagechange', () => {
    if (!root) return;
    if (document.body.classList.contains('mode-marketing')) window.SIYBMarketing.refresh(); else buildNav();
  });
})();
