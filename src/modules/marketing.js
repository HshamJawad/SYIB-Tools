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

  const CONTENT = () => window.SIYB_MK_CONTENT || {};
  const ascii = (v) => String(v ?? '').replace(/[\u0660-\u0669]/g, (d) => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(d));
  const filled = (v) => (v && typeof v === 'object') ? Object.values(v).some(filled) : (v === true || (typeof v === 'string' && v.trim() !== ''));
  const partsOf = (cardId) => ((CONTENT()[cardId] || {}).parts || []);
  const actsOf = (part) => (part.blocks || []).filter((b) => b.t === 'activity');
  const actStatus = (id) => (store.get('progress.activities.' + id, '') === 'done' ? 'done' : (filled(store.get('responses.' + id, null)) ? 'inprogress' : 'notstarted'));
  const sumRead = (pid) => store.get('progress.parts.' + pid + '.summary', false) === true;
  function partStatus(p) {
    const st = actsOf(p).map((a) => actStatus(a.id)); const r = sumRead(p.id);
    if (st.every((x) => x === 'done') && r) return 'done';
    return (r || st.some((x) => x !== 'notstarted')) ? 'inprogress' : 'notstarted';
  }
  function statusOf(id) {
    if (id === 'c01') return store.get('progress.cards.c01read', false) === true ? 'done' : 'notstarted';
    const ps = partsOf(id); if (!ps.length) return 'notstarted';
    const st = ps.map(partStatus);
    if (st.every((x) => x === 'done')) return 'done';
    return st.some((x) => x !== 'notstarted') ? 'inprogress' : 'notstarted';
  }
  const stLabel = (st) => T(D.STATUS[st]);
  const badge = (key, st) => `<span class="mk-status ${st}" data-st="${key}">${esc(stLabel(st))}</span>`;
  const srcTag = (b, part) => (b.src ? `<span class="mk-src">${X('المصدر: الجزء ' + (part.id || 'المدخل') + '، ص ', 'Source: Part ' + (part.id || 'Introduction') + ', p. ')}${esc(b.src)}</span>` : '');
  const appTag = () => `<span class="mk-apptag">${X('إرشاد التطبيق', 'App guidance')}</span>`;
  const para = (o) => `<p>${esc(T(o))}</p>`;

  function field(act, f) {
    const id = act.id + '_' + f.k; const lab = f.label ? `<label class="mk-lab" for="${id}">${esc(T(f.label))}</label>` : '';
    const key = `data-f="${act.id}" data-k="${f.k}"`;
    if (f.type === 'note') return `<p class="mk-fnote">${esc(T(f.text))}</p>`;
    if (f.type === 'text') return `<div class="mk-field">${lab}<input type="text" id="${id}" ${key} value="${esc(store.get('responses.' + act.id + '.' + f.k, ''))}"></div>`;
    if (f.type === 'area') return `<div class="mk-field">${lab}<textarea id="${id}" ${key} rows="${f.rows || 4}">${esc(store.get('responses.' + act.id + '.' + f.k, ''))}</textarea></div>`;
    if (f.type === 'choice') {
      const cur = store.get('responses.' + act.id + '.' + f.k, '');
      return `<fieldset class="mk-field"><legend class="mk-lab">${esc(T(f.label))}</legend>${f.options.map((o) => `<label class="mk-opt"><input type="radio" name="${id}" value="${o.v}" ${key} ${cur === o.v ? 'checked' : ''}> <span>${esc(T(o.t))}</span></label>`).join('')}</fieldset>`;
    }
    if (f.type === 'multi') {
      const cur = store.get('responses.' + act.id + '.' + f.k, {}) || {};
      return `<fieldset class="mk-field"><legend class="mk-lab">${esc(T(f.label))}</legend>${f.options.map((o) => `<label class="mk-opt"><input type="checkbox" value="${o.v}" ${key} data-multi="1" ${cur[o.v] ? 'checked' : ''}> <span>${esc(T(o.t))}</span></label>`).join('')}</fieldset>`;
    }
    if (f.type === 'table') {
      const rows = f.rows ? f.rows.length : f.rowsN; const cur = store.get('responses.' + act.id + '.' + f.k, {}) || {};
      const head = `<tr>${f.rows ? '<th></th>' : ''}${f.cols.map((c) => `<th scope="col">${esc(T(c))}</th>`).join('')}</tr>`;
      let body = '';
      for (let r = 0; r < rows; r++) {
        body += `<tr>${f.rows ? `<th scope="row">${esc(T(f.rows[r]))}</th>` : ''}${f.cols.map((c, ci) => `<td><textarea rows="2" aria-label="${esc(T(c))} ${r + 1}" data-f="${act.id}" data-k="${f.k}" data-cell="${r}_${ci}">${esc(cur[r + '_' + ci] || '')}</textarea></td>`).join('')}</tr>`;
      }
      return `<div class="mk-field">${lab || (f.label ? '' : '')}<div class="mk-tablewrap"><table class="mk-table mk-ftable"><thead>${head}</thead><tbody>${body}</tbody></table></div></div>`;
    }
    return '';
  }
  function activity(b, part) {
    const st = actStatus(b.id); const done = st === 'done';
    return `<section class="mk-act" id="${b.id}" aria-labelledby="${b.id}_h"><div class="mk-act-head"><h4 id="${b.id}_h">${esc(T(b.title))}</h4>${badge('act:' + b.id, st)}${srcTag(b, part)}</div>
      ${b.intro ? para(b.intro) : ''}${b.fields.map((f) => field(b, f)).join('')}
      <div class="mk-act-foot"><button type="button" class="mk-btn${done ? '' : ' primary'}" data-act="done" data-id="${b.id}" aria-pressed="${done}">${done ? X('إلغاء علامة الإكمال', 'Unmark as complete') : X('وضع علامة: أنجزت هذا النشاط', 'Mark this activity as complete')}</button></div></section>`;
  }
  function block(b, part) {
    switch (b.t) {
      case 'h': return `<h4 class="mk-h">${esc(T(b.title))}</h4>`;
      case 'h2': return `<h5 class="mk-h2">${esc(T(b.title))}</h5>`;
      case 'p': return para(b.text);
      case 'ul': return `<ul>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul>`;
      case 'ol': return `<ol>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ol>`;
      case 'def': return `<dl class="mk-def"><dt>${esc(T(b.term))}</dt><dd>${esc(T(b.text))}</dd></dl>`;
      case 'quote': return `<blockquote class="mk-quote">${esc(T(b.text))}${b.who ? `<cite>— ${esc(T(b.who))}</cite>` : ''}</blockquote>`;
      case 'note': return `<aside class="mk-note ${b.kind || 'important'}">${b.app ? appTag() : ''}<p>${esc(T(b.text))}</p>${srcTag(b, part)}</aside>`;
      case 'table': return `<div class="mk-tablewrap"><table class="mk-table"><thead><tr>${b.head.map((h) => `<th scope="col">${esc(T(h))}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(T(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'case': return `<section class="mk-case"><div class="mk-case-head"><span class="mk-casetag">${X('قصة', 'Story')}</span><h4>${esc(T(b.title))}</h4>${srcTag(b, part)}</div>${b.paras.map(para).join('')}</section>`;
      case 'activity': return activity(b, part);
      case 'summary': {
        const r = sumRead(part.id);
        return `<section class="mk-summary"><div class="mk-act-head"><h4>${X('الملخص', 'Summary')}</h4>${srcTag(b, part)}</div><ul>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul><label class="mk-opt"><input type="checkbox" data-sum="${part.id}" ${r ? 'checked' : ''}> <span>${X('راجعتُ ملخص هذا الجزء', 'I have reviewed this Part\'s summary')}</span></label></section>`;
      }
      default: return '';
    }
  }
  function renderPart(p, show) {
    const st = p.id ? partStatus(p) : null;
    return `<section class="mk-part" id="part-${p.id || 'intro'}"><div class="mk-panel-head"><h3>${esc(T(p.title))}</h3>${st ? badge('part:' + p.id, st) : ''}</div>${p.blocks.map((b) => block(b, p)).join('')}</section>`;
  }
  const LICENCE = () => `<section class="mk-licence" aria-labelledby="mkLic"><h3 id="mkLic">${X('المصدر والترخيص', 'Source and licence')}</h3>
    <p>${X('هذه الوحدة أداة تعلّم رقمية مبنية على دليل «حسّن مشروعك (IYB) – التسويق» (منظمة العمل الدولية، 2015). المصدر: International Labour Office (ILO). النص الأصلي منشور بترخيص Creative Commons Attribution-ShareAlike 3.0 IGO (CC BY-SA 3.0 IGO)، ويُنسب إلى منظمة العمل الدولية بوصفها مالكة العمل الأصلي.', 'This module is a digital learning aid based on the manual “Improve Your Business (IYB) – Marketing” (International Labour Office, 2015). Source: International Labour Office (ILO). The original text is published under the Creative Commons Attribution-ShareAlike 3.0 IGO licence (CC BY-SA 3.0 IGO); the ILO is credited as owner of the original work.')}</p>
    <p><strong>${X('تعديل', 'Adaptation')}:</strong> ${X('هذا تعديلٌ لعمل أصلي أعدّه مكتب العمل الدولي (ILO). المسؤولية عن الآراء الواردة في التعديل تقع على مؤلفي التعديل وحدهم ولا تحظى بتأييد منظمة العمل الدولية. التعديلات التي لا تحظى بتأييد وحدة المنشآت الصغيرة والمتوسطة في المنظمة لا يجوز أن تستخدم اسم SIYB التجاري وشعاره.', 'This is an adaptation of an original work by the International Labour Office (ILO). Responsibility for the views and opinions expressed in the adaptation rests solely with the author or authors of the adaptation and are not endorsed by the ILO. Adaptations not endorsed by the SME Unit of the ILO cannot use the SIYB brand name and logo.')}</p>
    <p><strong>${X('ترجمة', 'Translation')}:</strong> ${X('لم يُعدّ مكتب العمل الدولي هذه الترجمة ولا يجوز اعتبارها ترجمة رسمية صادرة عنه. المنظمة غير مسؤولة عن محتوى الترجمة أو دقتها.', 'This translation was not created by the International Labour Office (ILO) and should not be considered an official ILO translation. The ILO is not responsible for the content or accuracy of this translation.')}</p>
    <p class="mk-apptag-line">${appTag()} ${X('النص العربي في هذه المرحلة ترجمة غير رسمية عن الدليل الإنجليزي، وهي بانتظار المراجعة مقابل الطبعة العربية الأصلية. هذه الوحدة ليست منصة معتمدة أو مؤيَّدة من منظمة العمل الدولية، ولا تستخدم شعارها.', 'In this stage the Arabic text is an unofficial translation of the English manual, pending review against the original Arabic edition. This module is not an ILO-endorsed platform and does not use the ILO emblem.')}</p></section>`;
  function overview() {
    const parts = []; ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].forEach((c) => partsOf(c).forEach((p) => parts.push({ p, c })));
    const cardsHtml = D.CARDS.map((c) => `<li><span>${c.no} · ${esc(T(c.title))}</span>${badge('card:' + c.id, statusOf(c.id))}</li>`).join('');
    const partsHtml = parts.map(({ p }) => `<li><span>${esc(T(p.title))}</span>${badge('part:' + p.id, partStatus(p))}</li>`).join('');
    return `<section class="mk-overview"><h3>${X('نظرة على تقدمك', 'Your progress overview')}</h3><p class="mk-small">${X('تُحسب الحالة من عملك الفعلي (إدخال أو علامة إكمال أو مراجعة الملخص) لا من فتح البطاقة.', 'Status reflects your actual work (an entry, a completion mark or a reviewed summary), not just opening a card.')}</p><div class="mk-two"><div><h4>${X('البطاقات الثماني', 'The eight cards')}</h4><ul class="mk-plist">${cardsHtml}</ul></div><div><h4>${X('أجزاء الدليل التسعة', 'The nine Parts of the manual')}</h4><ul class="mk-plist">${partsHtml}</ul></div></div></section>`;
  }
  function refreshBadges() {
    if (!root) return;
    root.querySelectorAll('[data-st]').forEach((el) => {
      const [k, id] = el.dataset.st.split(':'); let st = 'notstarted';
      if (k === 'act') st = actStatus(id); else if (k === 'card') st = statusOf(id);
      else { const p = ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].flatMap(partsOf).find((x) => x.id === id); if (p) st = partStatus(p); }
      el.className = 'mk-status ' + st; el.textContent = stLabel(st);
    });
  }

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

  const notice = () => `<div class="mk-notice" role="note"><strong>${X('إرشاد التطبيق', 'App guidance')}</strong> — ${X('هذا النص من إعداد التطبيق وليس من محتوى الدليل. التقييمات والإجابات وخطة العمل وقاموس المفردات تُضاف في مرحلة لاحقة.', 'This text is written by the application, not taken from the manual. Assessments, answers, the Action Plan and the glossary are added in a later stage.')}</div>`;
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
    const parts = partsOf(id);
    let body;
    if (id === 'c08' || !parts.length) {
      body = `<div class="mk-placeholder"><strong>${X('المحتوى قيد الإعداد', 'Content to be added')}</strong><p>${X('سيُضاف محتوى هذه البطاقة من الدليل في مرحلة لاحقة بعد اعتماد المصدر.', 'This card\'s content from the manual will be added in a later stage, once the source is approved.')}</p></div>`;
    } else {
      const jump = parts.length > 1 ? `<nav class="mk-jump" aria-label="${X('أجزاء البطاقة', 'Parts in this card')}">${parts.map((x) => `<a href="#part-${x.id}" data-act="jump" data-to="part-${x.id}">${esc(T(x.title))}</a>`).join('')}</nav>` : '';
      body = jump + parts.map((x) => renderPart(x)).join('');
      if (id === 'c01') {
        const rd = store.get('progress.cards.c01read', false) === true;
        body += `<label class="mk-opt mk-read"><input type="checkbox" data-read="1" ${rd ? 'checked' : ''}> <span>${X('قرأتُ المدخل وأهداف الدليل وطريقة استخدامه', 'I have read the introduction, objectives and how to use the manual')}</span></label>` + overview() + LICENCE();
      }
    }
    return `<div class="mk-actions"><button type="button" class="mk-btn" data-act="go" data-id="home">${ar ? '→' : '←'} ${X('العودة إلى لوحة البطاقات', 'Back to card overview')}</button></div>
      <section class="mk-panel"><div class="mk-panel-head"><span class="mk-card-no">${c.no}</span><h2>${esc(T(c.title))}</h2>${badge('card:' + c.id, st)}</div>
      <p class="mk-cov"><strong>${X('تغطية الدليل: ', 'Manual coverage: ')}</strong>${esc(T(c.coverage))}</p>${body}</section>
      ${id === 'c01' ? '' : `<p class="mk-small mk-credit">${X('المصدر: ILO، «حسّن مشروعك – التسويق» (2015)، CC BY-SA 3.0 IGO. تعديل وترجمة غير رسميين، لا تؤيدهما منظمة العمل الدولية. التفاصيل في البطاقة 01.', 'Source: ILO, “Improve Your Business – Marketing” (2015), CC BY-SA 3.0 IGO. Unofficial adaptation and translation, not endorsed by the ILO. Details in Card 01.')}</p>`}
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
      const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
      if (b.dataset.act === 'go') open(b.dataset.id);
      else if (b.dataset.act === 'done') {
        const id = b.dataset.id; store.set('progress.activities.' + id, actStatus(id) === 'done' ? '' : 'done'); store.flush(); render(true);
      } else if (b.dataset.act === 'jump') { e.preventDefault(); const t = root.querySelector('#' + b.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    root.addEventListener('input', (e) => {
      const el = e.target; if (!el.dataset || !el.dataset.f || el.type === 'radio' || el.type === 'checkbox') return;
      const path = 'responses.' + el.dataset.f + '.' + el.dataset.k + (el.dataset.cell ? '.' + el.dataset.cell : '');
      store.set(path, ascii(el.value)); refreshBadges();
    });
    root.addEventListener('change', (e) => {
      const el = e.target; if (!el.dataset) return;
      if (el.dataset.f && el.type === 'radio') { store.set('responses.' + el.dataset.f + '.' + el.dataset.k, el.value); refreshBadges(); }
      else if (el.dataset.f && el.dataset.multi) { store.set('responses.' + el.dataset.f + '.' + el.dataset.k + '.' + el.value, el.checked); refreshBadges(); }
      else if (el.dataset.sum) { store.set('progress.parts.' + el.dataset.sum + '.summary', el.checked); refreshBadges(); }
      else if (el.dataset.read) { store.set('progress.cards.c01read', el.checked); refreshBadges(); }
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
