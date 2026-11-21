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
    .concat(D.CARDS.map((c) => ({ id: c.id, icon: c.icon, no: c.no, title: c.title })))
    .concat([{ id: 'data', icon: '⛁', title: D.B('البيانات والتقرير', 'Data & report') }]);
  const byId = (id) => NAV.find((s) => s.id === id) || NAV[0];
  const cardOf = (id) => D.CARDS.find((c) => c.id === id);

  let root = null;
  let currentId = null;

  const CONTENT = () => window.SIYB_MK_CONTENT || {};
  const ascii = (v) => String(v ?? '').replace(/[\u0660-\u0669]/g, (d) => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(d));
  const filled = (v) => (v && typeof v === 'object') ? Object.values(v).some(filled) : (v === true || (typeof v === 'string' && v.trim() !== ''));
  const partsOf = (cardId) => ((CONTENT()[cardId] || {}).parts || []);
  const actsOf = (part) => (part.blocks || []).filter((b) => b.t === 'activity');
  const planFilled = () => (store.get('actionPlan', []) || []).some(filled);
  const actStatus = (id) => (store.get('progress.activities.' + id, '') === 'done' ? 'done' : ((id === 'plan' ? planFilled() : filled(store.get('responses.' + id, null))) ? 'inprogress' : 'notstarted'));
  const ASM = () => window.SIYB_MK_ASSESS || {};
  const ACTANS = () => window.SIYB_MK_ACT_ANSWERS || {};
  const asmOf = (partId) => Object.values(ASM()).find((a) => a.part === partId);
  const asmStatus = (id) => (store.get('progress.assessments.' + id, '') === 'submitted' ? 'done' : (filled(store.get('responses.' + id, null)) ? 'inprogress' : 'notstarted'));
  const sumRead = (pid) => store.get('progress.parts.' + pid + '.summary', false) === true;
  function partStatus(p) {
    const st = actsOf(p).map((a) => actStatus(a.id)); const r = sumRead(p.id);
    const am = asmOf(p.id); if (am) st.push(asmStatus(am.id));
    if (st.every((x) => x === 'done') && r) return 'done';
    return (r || st.some((x) => x !== 'notstarted')) ? 'inprogress' : 'notstarted';
  }
  function statusOf(id) {
    if (id === 'c01') return store.get('progress.cards.c01read', false) === true ? 'done' : 'notstarted';
    if (id === 'c08') { const s2 = [actStatus('cyh'), actStatus('plan')]; return s2.every((x) => x === 'done') ? 'done' : (s2.some((x) => x !== 'notstarted') ? 'inprogress' : 'notstarted'); }
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


  const revealed = (id) => store.get('progress.answers.' + id, false) === true;
  const ansToggle = (id) => `<button type="button" class="mk-btn" data-act="ans" data-id="${id}" aria-expanded="${revealed(id)}">${revealed(id) ? X('إخفاء الإجابة النموذجية', 'Hide model answer') : X('عرض الإجابة النموذجية (بعد محاولتك)', 'Show model answer (after your attempt)')}</button>`;
  const ansBox = (paras, src, part) => `<div class="mk-answer" role="note"><strong>${X('الإجابة النموذجية من الدليل', 'Model answer from the manual')}</strong> ${src ? `<span class="mk-src">${X('ص ', 'p. ')}${esc(src)}</span>` : ''}${paras.map((x) => `<p>${esc(T(x))}</p>`).join('')}</div>`;

  function assessmentHtml(a, part) {
    const sub = store.get('progress.assessments.' + a.id, '') === 'submitted'; const st = asmStatus(a.id);
    const G = (k) => store.get('responses.' + a.id + '.' + k, '');
    let body = ''; let score = '';
    const lock = sub ? ' disabled' : '';
    if (a.kind === 'cloze') {
      const bank = Object.fromEntries(a.bank.map((o) => [o.v, T(o.t)]));
      let ok = 0, tot = 0;
      body = `<p class="mk-bank"><strong>${X('قائمة الكلمات: ', 'Word list: ')}</strong>${a.bank.map((o) => `<span class="mk-chip">${esc(T(o.t))}</span>`).join(' ')}</p>` +
        a.story.map((para) => `<p>${esc(T(para)).replace(/\{(\d+[a-z]?)\}/g, (m, id) => {
          const cur = G('b' + id); let cls = '', extra = '';
          if (sub) { tot++; if (cur === a.key[id]) { ok++; cls = ' ok'; } else { cls = ' bad'; extra = `<span class="mk-key">✓ ${esc(bank[a.key[id]])}</span>`; } }
          return `<span class="mk-blank${cls}"><span class="mk-blank-n">(${id})</span><select data-f="${a.id}" data-k="b${id}" aria-label="${esc(X('الفراغ ', 'Blank '))}${id}"${lock}><option value="">—</option>${a.bank.map((o) => `<option value="${o.v}"${cur === o.v ? ' selected' : ''}>${esc(T(o.t))}</option>`).join('')}</select>${extra}</span>`;
        })}</p>`).join('');
      if (sub) score = `${ok}/${tot}`;
    } else if (a.kind === 'mcq') {
      let ok = 0;
      body = a.items.map((i) => {
        const cur = G('q' + i.n); if (sub && cur === i.correct) ok++;
        return `<fieldset class="mk-field mk-q"><legend class="mk-lab">${i.n}. ${esc(T(i.q))}</legend>${i.opts.map((o) => {
          const cls = sub ? (o.v === i.correct ? ' ok' : (cur === o.v ? ' bad' : '')) : '';
          return `<label class="mk-opt${cls}"><input type="radio" name="${a.id}_q${i.n}" value="${o.v}" data-f="${a.id}" data-k="q${i.n}" ${cur === o.v ? 'checked' : ''}${lock}> <span>${o.v}. ${esc(T(o.t))}${sub && o.v === i.correct ? ' ✓' : ''}</span></label>`;
        }).join('')}</fieldset>`;
      }).join('');
      if (sub) score = `${ok}/${a.items.length}`;
    } else {
      body = (a.note ? `<p class="mk-fnote">${a.note.app ? appTag() + ' ' : ''}${esc(T(a.note))}</p>` : '') + a.items.map((i) => `<div class="mk-field"><label class="mk-lab" for="${a.id}_o${i.n}">${i.n}. ${esc(T(i.q))}</label><textarea id="${a.id}_o${i.n}" rows="5" data-f="${a.id}" data-k="o${i.n}"${lock}>${esc(G('o' + i.n))}</textarea></div>`).join('') +
        (sub ? ansBox(a.model, a.modelSrc, part) : '');
    }
    const result = (sub && score) ? `<p class="mk-result" role="status"><strong>${X('مراجعة ذاتية: ', 'Self-check: ')}</strong>${X('الإجابات المطابقة لمفتاح الدليل: ', 'Answers matching the manual\'s key: ')}${score} <span class="mk-small">${X('(للمراجعة الذاتية فقط وليست درجة رسمية)', '(for self-review only, not an official grade)')}</span></p>` : '';
    const btn = sub ? `<button type="button" class="mk-btn" data-act="asm-edit" data-id="${a.id}">${X('تعديل إجاباتي', 'Edit my answers')}</button>`
      : `<button type="button" class="mk-btn primary" data-act="asm-submit" data-id="${a.id}">${a.kind === 'open' ? X('حفظ إجابتي وعرض الإجابة النموذجية', 'Save my answer and show the model answer') : X('تحقق من إجاباتي', 'Check my answers')}</button>`;
    return `<section class="mk-asm" id="${a.id}" aria-labelledby="${a.id}_h"><div class="mk-act-head"><h4 id="${a.id}_h">${esc(T(a.title))}</h4>${badge('asm:' + a.id, st)}<span class="mk-src">${X('المصدر: الجزء ' + part.id + '، ص ', 'Source: Part ' + part.id + ', p. ')}${esc(a.src)}${a.answerSrc ? X(' · الإجابات ص ', ' · answers p. ') + esc(a.answerSrc) : ''}</span></div>
      <p>${esc(T(a.intro))}</p>${body}<div class="mk-act-foot">${btn}</div>${result}</section>`;
  }

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
      <div class="mk-act-foot"><button type="button" class="mk-btn${done ? '' : ' primary'}" data-act="done" data-id="${b.id}" aria-pressed="${done}">${done ? X('إلغاء علامة الإكمال', 'Unmark as complete') : X('وضع علامة: أنجزت هذا النشاط', 'Mark this activity as complete')}</button>${ACTANS()[b.id] ? ansToggle(b.id) : ''}</div>${ACTANS()[b.id] && revealed(b.id) ? ansBox(ACTANS()[b.id].paras, ACTANS()[b.id].src, part) : ''}</section>`;
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
    return `<section class="mk-part" id="part-${p.id || 'intro'}"><div class="mk-panel-head"><h3>${esc(T(p.title))}</h3>${st ? badge('part:' + p.id, st) : ''}</div>${p.blocks.map((b) => block(b, p)).join('')}${p.id && asmOf(p.id) ? assessmentHtml(asmOf(p.id), p) : ''}</section>`;
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
    return `<section class="mk-overview"><h3>${X('نظرة على تقدمك', 'Your progress overview')}</h3><p class="mk-small">${X('تُحسب الحالة من عملك الفعلي (إدخال أو علامة إكمال أو مراجعة الملخص) لا من فتح البطاقة.', 'Status reflects your actual work (an entry, a completion mark or a reviewed summary), not just opening a card.')}</p><div class="mk-two"><div><h4>${X('البطاقات الثماني', 'The eight cards')}</h4><ul class="mk-plist">${cardsHtml}</ul></div><div><h4>${X('أجزاء الدليل التسعة', 'The nine Parts of the manual')}</h4><ul class="mk-plist">${partsHtml}</ul></div></div><p class="mk-small">${X('التقييمات المنجزة: ', 'Assessments completed: ')}${Object.keys(ASM()).filter((k) => asmStatus(k) === 'done').length} / ${Object.keys(ASM()).length}</p></section>`;
  }
  function refreshBadges() {
    if (!root) return;
    root.querySelectorAll('[data-st]').forEach((el) => {
      const [k, id] = el.dataset.st.split(':'); let st = 'notstarted';
      if (k === 'act') st = actStatus(id); else if (k === 'asm') st = asmStatus(id); else if (k === 'card') st = statusOf(id);
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
    if (d) d.textContent = s.id === 'data' ? X('نسخ احتياطي، استيراد، مسح، وتقرير PDF', 'Backup, import, erase and PDF report') : s.id === 'home' ? X('ثماني بطاقات تغطي أجزاء الدليل التسعة بالترتيب', 'Eight cards covering the manual\'s nine Parts in order') : T(s.title);
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
      ${storageNote()}<div class="mk-grid">${cards}</div><p><button type="button" class="mk-btn" data-act="go" data-id="data">⛁ ${X('بياناتك: نسخ احتياطي وتقرير PDF', 'Your data: backup and PDF report')}</button></p>${notice()}`;
  }

  let gq = '';
  const C8 = () => window.SIYB_MK_CARD8 || null;
  const GL = () => window.SIYB_MK_GLOSSARY || [];
  const fakePart = { id: '', title: D.B('', '') };
  const apRows = () => { const a = store.get('actionPlan', []) || []; return Array.isArray(a) ? a : []; };
  function glossaryList() {
    const q = gq.trim().toLowerCase();
    const items = GL().filter((g) => !q || (g.term.ar + ' ' + g.term.en + ' ' + T(g.def)).toLowerCase().includes(q));
    return items.length ? items.map((g) => `<dl class="mk-def mk-gl"><dt>${esc(T(g.term))} <span class="mk-src">${X('ص ', 'p. ')}${esc(g.src)}</span></dt><dd>${esc(T(g.def))}</dd></dl>`).join('') : `<p class="mk-small">${X('لا توجد نتائج مطابقة.', 'No matching entries.')}</p>`;
  }
  function renderCard8Body() {
    const c = C8(); if (!c) return '';
    const y = c.cyh; const pl = c.plan; const G = (k) => store.get('responses.cyh.' + k, '');
    const doneBtn = (id, labelOn, labelOff) => { const d = actStatus(id) === 'done'; return `<button type="button" class="mk-btn${d ? '' : ' primary'}" data-act="done" data-id="${id}" aria-pressed="${d}">${d ? labelOff : labelOn}</button>`; };
    const rev = c.review;
    let h = `<section class="mk-part" id="part-review"><div class="mk-panel-head"><h3>${esc(T(rev.title))}</h3><span class="mk-src">${X('المصدر: ص ', 'Source: p. ')}${esc(rev.src)}</span></div>${rev.paras.map(para).join('')}${(rev.bullets || []).length ? `<ul>${rev.bullets.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul>` : ''}${rev.quote ? `<blockquote class="mk-quote">${esc(T(rev.quote))}</blockquote>` : ''}</section>`;
    // Can You Help
    h += `<section class="mk-part mk-act" id="cyh"><div class="mk-act-head"><h3>${esc(T(y.title))}</h3>${badge('act:cyh', actStatus('cyh'))}<span class="mk-src">${X('المصدر: ص ', 'Source: p. ')}${esc(y.src)}</span></div>${y.story.map(para).join('')}${y.info.map((b) => block(b, fakePart)).join('')}${para(y.lead)}
      ${y.tasks.map((t) => `<div class="mk-field"><label class="mk-lab" for="cyh_t${t.n}">${t.n}. ${esc(T(t.dim))}</label><p class="mk-small">${esc(T(t.q))}</p><textarea id="cyh_t${t.n}" rows="4" data-f="cyh" data-k="t${t.n}">${esc(G('t' + t.n))}</textarea></div>`).join('')}
      <div class="mk-act-foot">${doneBtn('cyh', X('وضع علامة: أنجزت هذا التمرين', 'Mark this exercise as complete'), X('إلغاء علامة الإكمال', 'Unmark as complete'))}${ansToggle('cyh')}</div>
      ${revealed('cyh') ? `<div class="mk-answer" role="note"><strong>${X('الإجابات النموذجية من الدليل', 'Model answers from the manual')}</strong> <span class="mk-src">${X('ص ', 'p. ')}${esc(y.modelSrc)}</span>${y.tasks.map((t) => `<h5 class="mk-h2">${t.n}. ${esc(T(t.dim))}</h5>${(y.model[t.n] || []).map(para).join('')}`).join('')}</div>` : ''}</section>`;
    // Action plan
    const rows = apRows(); const n = Math.max(4, rows.length);
    let body = '';
    for (let r = 0; r < n; r++) body += `<tr>${pl.cols.map((cl) => `<td><textarea rows="3" aria-label="${esc(T(cl.head))} ${r + 1}" data-ap="${r}" data-apk="${cl.k}">${esc(((rows[r] || {})[cl.k]) || '')}</textarea></td>`).join('')}<td class="mk-rm"><button type="button" class="mk-btn" data-act="ap-del" data-id="${r}" aria-label="${X('حذف الصف ', 'Delete row ')}${r + 1}">✕</button></td></tr>`;
    h += `<section class="mk-part mk-act" id="plan"><div class="mk-act-head"><h3>${esc(T(pl.title))}</h3>${badge('act:plan', actStatus('plan'))}<span class="mk-src">${X('المصدر: ص ', 'Source: p. ')}${esc(pl.src)}</span></div>${pl.intro.map(para).join('')}
      <h5 class="mk-h2">${X('مثال من الدليل', 'Example from the manual')}</h5><div class="mk-tablewrap"><table class="mk-table"><thead><tr>${pl.cols.map((cl) => `<th scope="col">${esc(T(cl.head))}</th>`).join('')}</tr></thead><tbody><tr>${pl.cols.map((cl) => `<td>${esc(T(pl.example[cl.k]))}</td>`).join('')}</tr></tbody></table></div>
      <ol>${pl.questions.map((q) => `<li>${esc(T(q))}</li>`).join('')}</ol><ul>${pl.tips.map((q) => `<li>${esc(T(q))}</li>`).join('')}</ul>
      <h5 class="mk-h2">${X('خطتك', 'Your action plan')}</h5><div class="mk-tablewrap"><table class="mk-table mk-ftable"><thead><tr>${pl.cols.map((cl) => `<th scope="col">${esc(T(cl.head))}</th>`).join('')}<th></th></tr></thead><tbody>${body}</tbody></table></div>
      <div class="mk-act-foot"><button type="button" class="mk-btn" data-act="ap-add">${X('إضافة صف', 'Add a row')} <span class="mk-apptag">${X('إضافة من التطبيق', 'App feature')}</span></button>${doneBtn('plan', X('وضع علامة: أنجزت خطتي', 'Mark my plan as complete'), X('إلغاء علامة الإكمال', 'Unmark as complete'))}</div></section>`;
    // Answers & review
    const asm = Object.values(ASM()).sort((a, b) => a.no - b.no);
    h += `<section class="mk-part" id="answers"><div class="mk-panel-head"><h3>${X('الإجابات ودعم المراجعة', 'Answers and review support')}</h3></div><p>${X('أنهِ كل تمرين قبل النظر إلى الإجابات؛ فأفضل طريقة للتعلّم أن تكمل التمرين أولاً. إن صعب عليك سؤال فاقرأ ذلك الجزء من الدليل مرة أخرى.', 'Finish each exercise before looking at the answers; the best way to learn is to attempt first. If a question is difficult, read that part of the manual again.')} <span class="mk-src">${X('المصدر: ص 89', 'Source: p. 89')}</span></p>
      <ul class="mk-plist">${asm.map((a) => { const cd = D.CARDS.find((x) => x.id === a.card); return `<li><span>${esc(T(a.title))} · ${X('الجزء ', 'Part ')}${a.part}</span><span class="mk-rowact">${badge('asm:' + a.id, asmStatus(a.id))}<button type="button" class="mk-btn" data-act="go" data-id="${a.card}" data-to="${a.id}">${X('افتح الجزء', 'Open Part')}</button></span></li>`; }).join('')}</ul></section>`;
    // Glossary
    h += `<section class="mk-part" id="glossary"><div class="mk-panel-head"><h3>${X('كلمات تجارية مفيدة', 'Useful Business Words')}</h3></div><div class="mk-field"><label class="mk-lab" for="glq">${X('ابحث في القاموس', 'Search the glossary')}</label><input type="search" id="glq" data-gl="1" value="${esc(gq)}" autocomplete="off"></div><div id="glList">${glossaryList()}</div></section>`;
    return h;
  }


  /* ---------- Stage 4: data, backup, report ---------- */
  const optText = (f, v) => { const o = (f.options || []).find((x) => x.v === v); return o ? T(o.t) : ''; };
  function fieldText(f, val) {
    if (f.type === 'note' || val == null) return '';
    if (f.type === 'text' || f.type === 'area') return String(val).trim();
    if (f.type === 'choice') return optText(f, val);
    if (f.type === 'multi') return Object.keys(val || {}).filter((k) => val[k]).map((k) => optText(f, k)).filter(Boolean).join('; ');
    if (f.type === 'table') {
      const rows = f.rows ? f.rows.length : f.rowsN; const out = [];
      for (let r = 0; r < rows; r++) {
        const cells = f.cols.map((c, ci) => { const v = ((val || {})[r + '_' + ci] || '').trim(); return v ? T(c) + ': ' + v : ''; }).filter(Boolean);
        if (cells.length) out.push((f.rows ? T(f.rows[r]) + ' — ' : (r + 1) + '. ') + cells.join(' | '));
      }
      return out;
    }
    return '';
  }
  function reportHtml() {
    const lg = lang(); const now = new Date();
    const date = now.toLocaleDateString(lg === 'en' ? 'en-GB' : 'ar-IQ');
    const st = store.status();
    let h = `<div class="mk-report"><h2>${X('تقرير تعلّم المتعلم — حسّن مشروعك (IYB): التسويق', 'Learner report — Improve Your Business (IYB): Marketing')}</h2>
      <p>${X('تاريخ التقرير: ', 'Report date: ')}${esc(date)}</p>
      <p><strong>${X('تنبيه: ', 'Notice: ')}</strong>${X('هذا سجل ذاتي لمتعلم أعدّته أداة رقمية. وهو ليس شهادة ولا يدل على إتمام معتمد من منظمة العمل الدولية، ولا يتضمن تقييماً لجدوى المشروع.', 'This is a learner\'s self-study record produced by a digital tool. It is not a certificate, does not indicate official ILO completion, and makes no assessment of business viability.')}</p>`;
    // progress
    const cards = D.CARDS.map((c) => [c.no + ' · ' + T(c.title), stLabel(statusOf(c.id))]);
    const parts = []; ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].forEach((c) => partsOf(c).forEach((p) => parts.push([T(p.title), stLabel(partStatus(p))])));
    const asm = Object.values(ASM()).sort((a, b) => a.no - b.no);
    const done = asm.filter((a) => asmStatus(a.id) === 'done').length;
    h += `<h3>${X('ملخص التقدم', 'Progress summary')}</h3><table><thead><tr><th>${X('البطاقة', 'Card')}</th><th>${X('الحالة', 'Status')}</th></tr></thead><tbody>${cards.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
      <table><thead><tr><th>${X('جزء الدليل', 'Manual Part')}</th><th>${X('الحالة', 'Status')}</th></tr></thead><tbody>${parts.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
      <p>${X('التقييمات المنجزة: ' + done + ' من ' + asm.length, 'Assessments completed: ' + done + ' / ' + asm.length)}</p>`;
    // activities
    let acts = '';
    ['c02', 'c03', 'c04', 'c05', 'c06', 'c07'].forEach((c) => partsOf(c).forEach((p) => actsOf(p).forEach((a) => {
      const stt = actStatus(a.id); if (stt === 'notstarted') return;
      const resp = store.get('responses.' + a.id, {}) || {}; let items = '';
      a.fields.forEach((f) => { const v = fieldText(f, resp[f.k]); if (!v || (Array.isArray(v) && !v.length)) return; const lab = f.label ? T(f.label) : ''; items += Array.isArray(v) ? v.map((x) => `<li>${lab ? esc(lab) + ': ' : ''}${esc(x)}</li>`).join('') : `<li>${lab ? esc(lab) + ': ' : ''}${esc(v)}</li>`; });
      acts += `<h4>${esc(T(a.title))} — ${X('الجزء ', 'Part ')}${p.id} (${esc(stLabel(stt))})</h4>${items ? `<ul>${items}</ul>` : ''}`;
    })));
    h += `<h3>${X('الأنشطة', 'Activities')}</h3>${acts || `<p>${X('لا توجد أنشطة بدأها المتعلم بعد.', 'No activities started yet.')}</p>`}`;
    // assessments
    let as = '';
    asm.forEach((a) => {
      const stt = asmStatus(a.id); if (stt === 'notstarted') return;
      const sub = stt === 'done'; const G = (k) => store.get('responses.' + a.id + '.' + k, ''); let li = ''; let ok = 0, tot = 0;
      if (a.kind === 'cloze') { const bank = Object.fromEntries(a.bank.map((o) => [o.v, T(o.t)])); Object.keys(a.key).forEach((id) => { const v = G('b' + id); tot++; const good = v === a.key[id]; if (good) ok++; li += `<li>(${id}) ${esc(v ? bank[v] : '—')}${sub ? (good ? ' ✓' : ' ✗ → ' + esc(bank[a.key[id]])) : ''}</li>`; }); }
      else if (a.kind === 'mcq') a.items.forEach((i) => { const v = G('q' + i.n); tot++; const good = v === i.correct; if (good) ok++; li += `<li>${i.n}. ${esc(v ? v + '. ' + optText(i, v) : '—')}${sub ? (good ? ' ✓' : ' ✗ → ' + i.correct) : ''}</li>`; });
      else a.items.forEach((i) => { const v = String(G('o' + i.n)).trim(); li += `<li>${i.n}. ${esc(v || '—')}</li>`; });
      as += `<h4>${esc(T(a.title))} — ${X('الجزء ', 'Part ')}${a.part} (${esc(stLabel(stt))})</h4>${sub && tot ? `<p>${X('مراجعة ذاتية (مطابقة لمفتاح الدليل): ' + ok + ' من ' + tot, 'Self-check (matches the manual\'s key): ' + ok + ' / ' + tot)}</p>` : ''}<ul>${li}</ul>`;
    });
    h += `<h3>${X('التقييمات', 'Assessments')}</h3>${as || `<p>${X('لا توجد تقييمات بدأها المتعلم بعد.', 'No assessments started yet.')}</p>`}`;
    // CYH
    const c8 = C8(); const cy = (c8 && c8.cyh) ? c8.cyh.tasks.map((t) => { const v = String(store.get('responses.cyh.t' + t.n, '')).trim(); return v ? `<li>${t.n}. ${esc(T(t.dim))}: ${esc(v)}</li>` : ''; }).join('') : '';
    h += `<h3>${X('هل تستطيع المساعدة؟ – صالون الشعر', 'Can You Help? – Beauty Hair Salon')}</h3>${cy ? `<ul>${cy}</ul>` : `<p>${X('لا توجد إجابات بعد.', 'No answers yet.')}</p>`}`;
    // action plan
    const rows = apRows().filter(filled); const cols = c8 ? c8.plan.cols : [];
    h += `<h3>${X('خطة العمل', 'Action Plan')}</h3>${rows.length ? `<table><thead><tr>${cols.map((c) => `<th>${esc(T(c.head))}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(r[c.k] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : `<p>${X('لم تُكتب خطة عمل بعد.', 'No action plan written yet.')}</p>`}`;
    h += `<h3>${X('المصدر', 'Source')}</h3><p>${X('مبني على دليل «حسّن مشروعك – التسويق»، منظمة العمل الدولية (2015)، CC BY-SA 3.0 IGO. تعديل وترجمة غير رسميين لا تؤيدهما منظمة العمل الدولية.', 'Based on “Improve Your Business – Marketing”, International Labour Office (2015), CC BY-SA 3.0 IGO. Unofficial adaptation and translation, not endorsed by the ILO.')}</p></div>`;
    return h;
  }
  const FILE_ERR = {
    'invalid-json': D.B('الملف ليس بصيغة JSON صحيحة.', 'The file is not valid JSON.'),
    'not-marketing-backup': D.B('هذا الملف ليس نسخة احتياطية لوحدة التسويق.', 'This file is not a Marketing module backup.'),
    'unsupported-version': D.B('إصدار النسخة الاحتياطية غير مدعوم.', 'This backup version is not supported.'),
    'invalid-structure': D.B('بنية الملف غير صالحة أو تالفة؛ لم يُغيَّر شيء.', 'The file structure is invalid or damaged; nothing was changed.'),
    'too-large': D.B('الملف كبير جداً.', 'The file is too large.')
  };
  function renderData() {
    const sts = store.status();
    const saved = sts.available ? (sts.lastSaved ? `<div class="mk-notice" role="status">${X('آخر حفظ: ', 'Last saved: ')}${esc(new Date(sts.lastSaved).toLocaleString(lang() === 'en' ? 'en-GB' : 'ar-IQ'))}</div>` : `<div class="mk-notice" role="status">${X('لم يُحفظ شيء بعد. يبدأ الحفظ تلقائياً مع أول إدخال.', 'Nothing saved yet. Saving starts automatically with your first entry.')}</div>`) : '';
    return `<div class="mk-actions"><button type="button" class="mk-btn" data-act="go" data-id="home">${lang() === 'ar' ? '→' : '←'} ${X('العودة إلى لوحة البطاقات', 'Back to card overview')}</button></div>
      <section class="mk-panel"><h2>${X('بياناتك', 'Your data')}</h2>
      <p>${X('تُحفظ إدخالاتك وتقدمك تلقائياً على هذا الجهاز فقط (في هذا المتصفح)، ولا تُرسَل إلى أي خادم، ومفصولة عن بيانات الوحدات الأخرى. صدّر نسخة احتياطية للاحتفاظ بها أو لنقلها إلى جهاز آخر.', 'Your entries and progress are saved automatically on this device only (in this browser), are never sent to a server, and are kept separate from the other modules\' data. Export a backup to keep it or move it to another device.')}</p>
      ${storageNote()}${saved}
      <div class="mk-act-foot"><button type="button" class="mk-btn primary" data-act="export">${X('تصدير نسخة احتياطية JSON', 'Export JSON backup')}</button><button type="button" class="mk-btn" data-act="import">${X('استيراد نسخة احتياطية', 'Import a backup')}</button><button type="button" class="mk-btn danger" data-act="reset">${X('مسح بيانات التسويق', 'Erase Marketing data')}</button></div>
      <input type="file" accept="application/json,.json" data-file="import" hidden>
      <div class="mk-msg" data-o="msg" role="status" aria-live="polite"></div></section>
      <section class="mk-panel"><h2>${X('تقرير المتعلم', 'Learner report')}</h2>
      <div class="mk-act-foot"><button type="button" class="mk-btn primary" data-act="pdf">${X('حفظ التقرير بصيغة PDF', 'Save report as PDF')}</button></div>
      ${reportHtml()}</section>${notice()}`;
  }
  function msg(text, ok) { const m = root && root.querySelector('[data-o="msg"]'); if (m) { m.textContent = text; m.className = 'mk-msg ' + (ok ? 'ok' : 'bad'); } }
  const DATA_ACT = {
    export() {
      const blob = new Blob([store.exportJson()], { type: 'application/json' }); const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'siyb-iyb-marketing-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      msg(X('تم تصدير النسخة الاحتياطية.', 'Backup exported.'), true);
    },
    import() { const f = root.querySelector('[data-file="import"]'); if (f) { f.value = ''; f.click(); } },
    reset() {
      if (!window.confirm(X('سيُمسح كل ما أدخلته في وحدة التسويق على هذا الجهاز ولا يمكن التراجع. هل تريد المتابعة؟ (بيانات الوحدات الأخرى لن تتأثر)', 'Everything you entered in the Marketing module on this device will be erased and this cannot be undone. Continue? (Other modules\' data is not affected.)'))) return;
      const word = X('مسح', 'ERASE');
      const typed = window.prompt(X('للتأكيد النهائي اكتب الكلمة: ', 'For final confirmation type the word: ') + word, '');
      if (typed === null || typed.trim().toLowerCase() !== word.toLowerCase()) { msg(X('لم يتم المسح: لم تُكتب كلمة التأكيد.', 'Nothing erased: the confirmation word was not typed.'), false); return; }
      store.reset(); currentId = 'home'; render(false); buildNav();
    },
    pdf() {
      const el = root.querySelector('.mk-report'); if (!el || !window.SIYBReportPdf) { msg(X('تعذر إنشاء ملف PDF.', 'The PDF could not be created.'), false); return; }
      window.SIYBReportPdf.save({ root: el, title: X('تقرير المتعلم — حسّن مشروعك (IYB): التسويق', 'Learner report — Improve Your Business (IYB): Marketing'), filename: 'IYB-Marketing-report-' + new Date().toISOString().slice(0, 10) + '.pdf', lang: lang() });
    }
  };
  function onImportFile(input) {
    const f = input.files && input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const res = store.parseBackup(String(r.result));
      if (!res.ok) { msg(T(FILE_ERR[res.error]) || X('تعذر الاستيراد.', 'Import failed.'), false); return; }
      if (store.hasData()) {
        const when = res.exportedAt ? new Date(res.exportedAt).toLocaleString(lang() === 'en' ? 'en-GB' : 'ar-IQ') : X('غير معروف', 'unknown');
        if (!window.confirm(X('تحذير: سيحل محتوى النسخة الاحتياطية (بتاريخ ' + when + ') محل بيانات التسويق الحالية على هذا الجهاز. تُحفظ نسخة أمان من بياناتك الحالية على الجهاز قبل الاستبدال. هل تريد المتابعة؟', 'Warning: the backup (dated ' + when + ') will replace the current Marketing data on this device. A safety copy of your current data is kept on this device before replacing. Continue?'))) { msg(X('أُلغي الاستيراد ولم يتغير شيء.', 'Import cancelled; nothing was changed.'), false); return; }
      }
      if (store.applyBackup(res)) { currentId = 'data'; render(false); buildNav(); msg(X('تم استيراد النسخة الاحتياطية.', 'Backup imported.'), true); }
      else msg(X('تعذر الاستيراد.', 'Import failed.'), false);
    };
    r.onerror = () => msg(X('تعذرت قراءة الملف.', 'The file could not be read.'), false);
    r.readAsText(f);
  }

  function renderCard(id) {
    const c = cardOf(id); const st = statusOf(id);
    const i = D.CARDS.indexOf(c); const p = D.CARDS[i - 1], n = D.CARDS[i + 1]; const ar = lang() === 'ar';
    const parts = partsOf(id);
    let body;
    if (id === 'c08' && C8()) {
      body = `<nav class="mk-jump" aria-label="${X('أقسام البطاقة', 'Sections')}">${[['cyh', X('هل تستطيع المساعدة؟', 'Can You Help?')], ['plan', X('خطة العمل', 'Action Plan')], ['answers', X('الإجابات والمراجعة', 'Answers & review')], ['glossary', X('كلمات تجارية مفيدة', 'Useful Business Words')]].map(([t, l]) => `<a href="#${t}" data-act="jump" data-to="${t}">${esc(l)}</a>`).join('')}</nav>` + renderCard8Body();
    } else if (!parts.length) {
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
    root.innerHTML = s.id === 'home' ? renderHome() : s.id === 'data' ? renderData() : renderCard(s.id);
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
      if (DATA_ACT[b.dataset.act]) { DATA_ACT[b.dataset.act](); return; }
      if (b.dataset.act === 'go') { open(b.dataset.id); if (b.dataset.to) setTimeout(() => { const t = root.querySelector('#' + b.dataset.to); if (t) t.scrollIntoView({ block: 'start' }); }, 30); }
      else if (b.dataset.act === 'done') {
        const id = b.dataset.id; store.set('progress.activities.' + id, actStatus(id) === 'done' ? '' : 'done'); store.flush(); render(true);
      } else if (b.dataset.act === 'ans') { const id = b.dataset.id; store.set('progress.answers.' + id, !revealed(id)); store.flush(); render(true);
      } else if (b.dataset.act === 'asm-submit') { store.set('progress.assessments.' + b.dataset.id, 'submitted'); store.flush(); render(true);
      } else if (b.dataset.act === 'asm-edit') { store.set('progress.assessments.' + b.dataset.id, ''); store.flush(); render(true);
      } else if (b.dataset.act === 'ap-add') { const a = apRows().slice(); while (a.length < 4) a.push({}); a.push({}); store.set('actionPlan', a); store.flush(); render(true);
      } else if (b.dataset.act === 'ap-del') { const a = apRows().slice(); const i = +b.dataset.id; if (i < a.length) a.splice(i, 1); store.set('actionPlan', a); store.flush(); render(true);
      } else if (b.dataset.act === 'jump') { e.preventDefault(); const t = root.querySelector('#' + b.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    root.addEventListener('input', (e) => {
      const el = e.target; if (el.dataset && el.dataset.gl) { gq = el.value; const l = root.querySelector('#glList'); if (l) { l.innerHTML = glossaryList(); if (window.SIYBRefreshLocaleDigits) window.SIYBRefreshLocaleDigits(l); } return; }
      if (el.dataset && el.dataset.ap !== undefined) {
        const a = apRows().map((r) => Object.assign({}, r)); const i = +el.dataset.ap; while (a.length <= i) a.push({});
        a[i][el.dataset.apk] = ascii(el.value); store.set('actionPlan', a); refreshBadges(); return;
      }
      if (!el.dataset || !el.dataset.f || el.type === 'radio' || el.type === 'checkbox') return;
      const path = 'responses.' + el.dataset.f + '.' + el.dataset.k + (el.dataset.cell ? '.' + el.dataset.cell : '');
      store.set(path, ascii(el.value)); refreshBadges();
    });
    root.addEventListener('change', (e) => {
      const el = e.target; if (!el.dataset) return;
      if (el.dataset.file === 'import') { onImportFile(el); return; }
      if (el.dataset.f && el.tagName === 'SELECT') { store.set('responses.' + el.dataset.f + '.' + el.dataset.k, el.value); refreshBadges(); }
      else if (el.dataset.f && el.type === 'radio') { store.set('responses.' + el.dataset.f + '.' + el.dataset.k, el.value); refreshBadges(); }
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
