/* Generate Your Business Idea (GYB) – workshop module (mode "gyb").
   Renders into #workspaceContent. Content: gyb-data.js. Persistence: gyb-store.js (namespaced, local, offline).
   Phase 1 = shell: navigation, introduction, part overviews, progress foundation, About/attribution, backup/restore. */
(() => {
  'use strict';
  const D = window.SIYB_GYB_DATA;
  const store = window.SIYBGybStore;
  const $ = (id) => document.getElementById(id);
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let root = null;
  let currentId = null;
  const byId = (id) => D.SECTIONS.find((s) => s.id === id) || D.SECTIONS[0];

  /* ---------- html helpers ---------- */
  const card = (title, body, cls = '') => `<section class="gyb-card ${cls}">${title ? `<h3>${title}</h3>` : ''}${body}</section>`;
  const ul = (arr) => `<ul class="gyb-list">${arr.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul>`;
  const btn = (act, label, cls = '', data = '') => `<button type="button" class="gyb-btn ${cls}" data-act="${act}" ${data}>${label}</button>`;
  const head = (title, lead) => `<h2>${esc(title)}</h2>${lead ? `<p class="gyb-lead">${esc(lead)}</p>` : ''}`;

  const KIND = {
    assessment: D.B('تقييم', 'Assessment'), activity: D.B('نشاط', 'Activity'),
    story: D.B('حالة تعلّم', 'Case study'), learn: D.B('شرح', 'Learn')
  };

  /* ---------- progress (stored; items become trackable as their phases are delivered) ---------- */
  const tracked = (it) => it.kind === 'assessment' || it.kind === 'activity';
  const stateOf = (it) => store.get('progress.' + it.id, '');
  const partStats = (p) => {
    const t = p.items.filter(tracked);
    return { total: t.length, done: t.filter((i) => stateOf(i) === 'done').length, started: t.filter((i) => stateOf(i) === 'inprogress').length };
  };
  const totals = () => D.PARTS.reduce((a, p) => { const s = partStats(p); return { total: a.total + s.total, done: a.done + s.done }; }, { total: 0, done: 0 });
  const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
  const bar = (done, total) => `<div class="gyb-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(done, total)}"><span style="width:${pct(done, total)}%"></span></div>`;
  const statusTag = (it) => {
    const s = stateOf(it);
    if (s === 'done') return `<span class="gyb-tag green">${X('مكتمل', 'Completed')}</span>`;
    if (s === 'inprogress') return `<span class="gyb-tag orange">${X('قيد العمل', 'In progress')}</span>`;
    return `<span class="gyb-tag">${X('قريباً', 'Coming soon')}</span>`;
  };

  /* ---------- sections ---------- */
  function renderHome() {
    const H = D.HOME; const tt = totals();
    const journey = D.PARTS.map((p) => {
      const st = partStats(p);
      return `<button type="button" class="gyb-step" data-act="go" data-id="${p.id}">
        <span class="gyb-step-n">${esc(p.roman)}</span>
        <span class="gyb-step-body"><b>${esc(T(p.title))}</b><small>${esc(T(p.short))}</small>${bar(st.done, st.total)}
        <small>${X(`${st.done} من ${st.total} مكتمل`, `${st.done} of ${st.total} completed`)}</small></span></button>`;
    }).join('');
    return head(X('توليد فكرة مشروعك', 'Generate Your Business Idea'), T(H.purpose)) +
      card(X('رحلتك في خمسة أجزاء', 'Your journey in five parts'), `<div class="gyb-journey">${journey}</div>`, 'accent') +
      card(X('تقدمك', 'Your progress'), `${bar(tt.done, tt.total)}<p class="gyb-note">${X(`أكملت ${tt.done} من ${tt.total} تقييماً ونشاطاً. يُحفظ عملك تلقائياً على هذا الجهاز، ويمكنك العودة إلى أي جزء في أي وقت دون قيد.`, `You have completed ${tt.done} of ${tt.total} assessments and activities. Your work is saved automatically on this device, and you can return to any part at any time without restriction.`)}</p>`) +
      `<div class="gyb-grid two">` +
        card(X('بعد إكمال الوحدة ستكون قادراً على', 'When you complete this module you will be able to'), ul(H.objectives), 'good') +
        card(X('ماذا ستجد هنا؟', 'What you will find here'), ul(H.howTo)) +
      `</div>` +
      card('', `<p>${esc(T(H.principles))}</p>`, 'warn') +
      `<div class="gyb-actions">${btn('go', X('ابدأ: الجزء الأول ←', 'Start: Part I →'), 'primary', 'data-id="p1"')}</div>`;
  }

  function renderPart(s) {
    const p = s.part;
    const items = p.items.map((it) => `<li class="gyb-item"><span class="gyb-tag blue">${esc(T(KIND[it.kind]))}</span><span class="gyb-item-t">${esc(T(it.title))}</span>${statusTag(it)}</li>`).join('');
    return head(T(p.title), T(p.lead)) +
      card(X('ما ستعمل عليه في هذا الجزء', 'What you will work on in this part'), `<ul class="gyb-items">${items}</ul>
        <p class="gyb-note">${X('الأنشطة التفاعلية لهذا الجزء قيد الإضافة. ستظهر هنا فور توفرها، ويبقى عملك محفوظاً.', 'The interactive activities for this part are being added. They will appear here as soon as they are available, and your work stays saved.')}</p>`, 'accent');
  }

  function renderPlaceholder(s) {
    const text = s.id === 'knowledge'
      ? X('أسئلة تدريبية بتغذية راجعة فورية تغطي جاهزية الرائد، والمجالات والأنواع، وعناصر الفكرة الخمسة، ومصادر الأفكار، والعصف الذهني، والغربلة، والدراسة الميدانية، وتحليل SWOT، واختيار الفكرة.', 'Practice questions with immediate feedback covering readiness, fields and types, the five elements of an idea, idea sources, brainstorming, screening, the field study, SWOT and final selection.')
      : X('تقرير جاهز للطباعة أو الحفظ بصيغة PDF يجمع كل ما أدخلته: الجاهزية، والمجال والنوع، وقائمة الأفكار، والملاحظات، والقائمة المختصرة، وSWOT، والملف النهائي لفكرتك، وخطة العمل.', 'A print-ready report (or Save as PDF) that gathers everything you entered: readiness, field and type, ideas list, observations, shortlist, SWOT, your final idea profile and your action plan.');
    return head(T(s.title), '') + card(X('قريباً', 'Coming soon'), `<p>${esc(text)}</p><p class="gyb-note">${X('ستُضاف هذه الصفحة بعد اكتمال أجزاء الرحلة الخمسة.', 'This page will be added once the five parts of the journey are complete.')}</p>`, 'warn');
  }

  function storageNote() {
    const st = store.status();
    if (!st.available) return `<div class="gyb-res bad">${X('التخزين المحلي غير متاح في هذا المتصفح (ربما بسبب التصفح الخاص). تعمل الوحدة مؤقتاً دون حفظ؛ صدّر نسخة احتياطية قبل الإغلاق.', 'Local storage is not available in this browser (possibly private browsing). The module works without saving for now; export a backup before closing.')}</div>`;
    return `<div class="gyb-res ok">${st.lastSaved ? X('آخر حفظ: ', 'Last saved: ') + esc(new Date(st.lastSaved).toLocaleString(lang() === 'en' ? 'en-GB' : 'ar-IQ')) : X('لم يُحفظ شيء بعد. سيبدأ الحفظ تلقائياً مع أول إدخال.', 'Nothing saved yet. Saving starts automatically with your first entry.')}</div>`;
  }

  function renderAbout() {
    const A = D.ABOUT;
    const disclaimers = `<p class="gyb-quote" dir="ltr" lang="en">${esc(A.adaptationEn)}</p><p class="gyb-quote" dir="ltr" lang="en">${esc(A.translationEn)}</p>` +
      (lang() === 'ar' ? `<p class="gyb-quote">${esc(A.adaptationAr)}</p><p class="gyb-quote">${esc(A.translationAr)}</p>` : '');
    return head(X('حول الوحدة والبيانات', 'About this module and your data'), '') +
      card(X('عن الوحدة', 'About the module'), `<p>${esc(T(A.what))}</p><p>${esc(T(A.identity))}</p>`, 'accent') +
      card(X('المصدر والترخيص', 'Source and licence'), `<p>${esc(T(A.licence))}</p><p><a href="${A.licenceUrl}" target="_blank" rel="noopener noreferrer" dir="ltr">${A.licenceUrl}</a></p>${disclaimers}`) +
      card(X('بياناتك', 'Your data'), `<p>${esc(T(A.data))}</p>${storageNote()}
        <div class="gyb-actions">${btn('export', X('تصدير نسخة احتياطية', 'Export a backup'), 'primary')}${btn('import', X('استيراد نسخة احتياطية', 'Import a backup'))}${btn('reset', X('مسح بيانات GYB', 'Erase GYB data'), 'orange')}</div>
        <input type="file" accept="application/json,.json" class="gyb-file" data-act-file="import" hidden>
        <div class="gyb-res" data-o="msg" role="status" aria-live="polite"></div>`, 'good');
  }

  const SECTION_RENDER = (s) => (s.part ? renderPart(s) : s.id === 'home' ? renderHome() : s.id === 'about' ? renderAbout() : renderPlaceholder(s));

  /* ---------- nav / heading / render ---------- */
  function buildNav() {
    const nav = document.querySelector('[data-nav-group="gyb"]'); if (!nav) return;
    const act = document.body.classList.contains('mode-gyb');
    let html = ''; let last = '';
    D.SECTIONS.forEach((s) => {
      if (s.grp !== last) { html += `<div class="sidebar-nav-caption sub">${esc(T(D.GROUPS[s.grp]))}</div>`; last = s.grp; }
      const on = act && s.id === currentId;
      html += `<button type="button" class="global-nav-item${on ? ' active' : ''}" data-nav-item="gyb-${s.id}" data-section="${s.id}"${on ? ' aria-current="page"' : ''}><span class="global-nav-icon">${s.icon}</span><span class="global-nav-label">${esc(T(s.title))}</span><span class="global-nav-current"></span></button>`;
    });
    nav.innerHTML = html;
  }
  function setHeading(s) {
    const t = $('workspaceTitle'), d = $('workspaceDescription'), n = $('workspaceBadgeNumber'), l = $('workspaceBadgeLabel');
    if (t) t.textContent = X('توليد فكرة مشروعك (GYB)', 'Generate Your Business Idea (GYB)');
    if (d) d.textContent = T(s.title);
    if (n) n.textContent = s.part ? s.part.roman : ({ home: 'GYB', knowledge: '?', report: '▤', about: 'i' }[s.id] || 'GYB');
    if (l) l.textContent = T(D.GROUPS[s.grp]);
  }
  function pager(s) {
    const i = D.SECTIONS.indexOf(s); const p = D.SECTIONS[i - 1], n = D.SECTIONS[i + 1];
    const ar = lang() === 'ar';
    return `<div class="gyb-pager">${p ? btn('go', (ar ? '→ ' : '← ') + esc(T(p.title)), '', `data-id="${p.id}"`) : '<span></span>'}${n ? btn('go', esc(T(n.title)) + (ar ? ' ←' : ' →'), 'primary', `data-id="${n.id}"`) : '<span></span>'}</div>`;
  }
  function render(keepScroll) {
    if (!root) return;
    const s = byId(currentId); const y = window.scrollY;
    root.innerHTML = SECTION_RENDER(s) + pager(s);
    setHeading(s);
    if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(root);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function open(id) {
    currentId = byId(id).id;
    store.set('learnerProfile.lastSection', currentId);
    document.querySelectorAll('[data-nav-item]').forEach((b) => {
      const a = b.dataset.navItem === 'gyb-' + currentId;
      b.classList.toggle('active', a);
      if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    render(false);
  }

  /* ---------- actions ---------- */
  const msg = (text, ok) => { const e = root && root.querySelector('[data-o="msg"]'); if (e) { e.textContent = text; e.className = 'gyb-res ' + (ok ? 'ok' : 'bad'); } };
  const ACT = {
    go: (el) => open(el.dataset.id),
    export: () => {
      const blob = new Blob([store.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'siyb-gyb-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      msg(X('تم تصدير النسخة الاحتياطية.', 'Backup exported.'), true);
    },
    import: () => { const f = root.querySelector('[data-act-file="import"]'); if (f) { f.value = ''; f.click(); } },
    reset: () => {
      if (!window.confirm(X('سيُمسح كل ما أدخلته في وحدة GYB على هذا الجهاز ولا يمكن التراجع. هل تريد المتابعة؟ (بيانات الوحدات الأخرى لن تتأثر)', 'Everything you entered in the GYB module on this device will be erased and this cannot be undone. Continue? (Other modules\' data is not affected.)'))) return;
      store.reset(); currentId = 'about'; render(false);
      msg(X('تم مسح بيانات GYB.', 'GYB data erased.'), true);
    }
  };
  const ERR = {
    'invalid-json': D.B('الملف ليس بصيغة JSON صحيحة.', 'The file is not valid JSON.'),
    'not-gyb-backup': D.B('هذا الملف ليس نسخة احتياطية لوحدة GYB.', 'This file is not a GYB backup.'),
    'unsupported-version': D.B('إصدار النسخة الاحتياطية غير مدعوم.', 'This backup version is not supported.')
  };
  function onFile(input) {
    const f = input.files && input.files[0]; if (!f) return;
    if (!window.confirm(X('سيحل محتوى النسخة الاحتياطية محل بيانات GYB الحالية على هذا الجهاز. هل تريد المتابعة؟', 'The backup will replace the current GYB data on this device. Continue?'))) return;
    const r = new FileReader();
    r.onload = () => {
      const res = store.importJson(String(r.result));
      if (res.ok) { render(false); msg(X('تم استيراد النسخة الاحتياطية.', 'Backup imported.'), true); }
      else msg(T(ERR[res.error]) || X('تعذر الاستيراد.', 'Import failed.'), false);
    };
    r.onerror = () => msg(X('تعذرت قراءة الملف.', 'The file could not be read.'), false);
    r.readAsText(f);
  }
  function bind() {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
      const fn = ACT[b.dataset.act]; if (fn) fn(b);
    });
    root.addEventListener('change', (e) => { if (e.target.matches('[data-act-file="import"]')) onFile(e.target); });
  }

  function mount(host) {
    host.innerHTML = '<div class="gyb-root" id="gybRoot"></div>';
    root = host.querySelector('#gybRoot');
    bind();
    if (!currentId) { const last = store.get('learnerProfile.lastSection', 'home'); currentId = D.SECTIONS.some((s) => s.id === last) ? last : 'home'; }
    buildNav();
    open(currentId);
  }

  window.SIYBGyb = { mount, open, refresh: () => { buildNav(); render(true); }, sections: D.SECTIONS.map((s) => s.id) };
  window.addEventListener('siyb:languagechange', () => {
    if (!root) return;
    if (document.body.classList.contains('mode-gyb')) window.SIYBGyb.refresh(); else buildNav();
  });
})();
