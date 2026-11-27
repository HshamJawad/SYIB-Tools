/* IYB Record Keeping - content renderer (blocks, tables, embedded questions, activities) with learner responses persisted in the module store.
   Reflective questions are NEVER scored. Where the English manual provides model answers, they are shown only after the learner has written an
   answer and chosen to reveal them. Arabic is a PRELIMINARY translation. Scoped under .rk-root. */
(() => {
  'use strict';
  const store = window.SIYBRecordKeepingStore;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const T = (o) => (o && typeof o === 'object' ? (o[lang()] ?? '') : (o ?? ''));
  const X = (ar, en) => (lang() === 'en' ? en : ar);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const C = () => window.SIYB_RK_CONTENT || {};
  const A = () => window.SIYBRKAssess;

  /* ---- learner responses ---- */
  const respPath = (id) => 'activities.' + id;
  function resp(id) {
    const o = store.get(respPath(id), null);
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  }
  const hasAttempt = (id) => Object.keys(resp(id)).some((k) => /^q\d+$/.test(k) && typeof resp(id)[k] === 'string' && resp(id)[k].trim() !== '');
  const isRevealed = (id) => resp(id).revealed === true;

  /* ---- blocks ---- */
  function table(b) {
    const heads = b.head.map((h) => `<th scope="col">${esc(T(h))}</th>`).join('');
    const group = b.group ? `<tr class="rk-grp">${b.group.map((g) => `<th colspan="${g[1]}" scope="colgroup">${esc(T(g[0]))}</th>`).join('')}</tr>` : '';
    const cell = (c, i) => `<td${i === 0 ? '' : ''}>${esc(typeof c === 'object' && c ? T(c) : c)}</td>`;
    const rows = b.rows.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('');
    const foot = b.foot ? `<tfoot><tr>${b.foot.map((c) => `<th scope="row">${esc(typeof c === 'object' && c ? T(c) : c)}</th>`).join('')}</tr></tfoot>` : '';
    const pre = b.pre ? `<ul class="rk-pre">${b.pre.map((x) => `<li>${esc(T({ ar: x[0], en: x[1] }))}</li>`).join('')}</ul>` : '';
    const cap = b.cap ? T(b.cap) : '';
    return `<figure class="rk-fig">${pre}<div class="rk-tablewrap" role="region" tabindex="0" aria-label="${esc(cap || X('جدول', 'Table'))}"><table class="rk-table${b.blank ? ' blank' : ''}">${cap ? `<caption>${esc(cap)}</caption>` : ''}<thead>${group}<tr>${heads}</tr></thead><tbody>${rows}</tbody>${foot}</table></div></figure>`;
  }
  function ansBlock(a) {
    if (a && a.t) return block(a);
    return `<p>${esc(T(a))}</p>`;
  }
  function ex(b) {
    const r = resp(b.id); const rev = isRevealed(b.id); const att = hasAttempt(b.id);
    const qs = b.qs.map((q, i) => `<div class="rk-qrow"><label for="rk-r-${b.id}-${i}">${esc(T(q))}</label><textarea id="rk-r-${b.id}-${i}" rows="3" data-rk-resp="${b.id}" data-q="${i}" placeholder="${esc(X('اكتب إجابتك هنا…', 'Write your answer here…'))}">${esc(r['q' + i] || '')}</textarea></div>`).join('');
    const ans = b.ans && b.ans.length ? `<div class="rk-reveal"><button type="button" class="rk-btn" data-rk-act="reveal" data-id="${b.id}" aria-expanded="${rev}" aria-controls="rk-a-${b.id}"${att ? '' : ' disabled'}>${rev ? X('إخفاء الإجابة النموذجية', 'Hide model answer') : X('عرض الإجابة النموذجية', 'Show model answer')}</button>${att ? '' : `<span class="rk-small"> ${X('اكتب إجابتك أولاً لتفعيل الإجابة النموذجية.', 'Write your own answer first to enable the model answer.')}</span>`}${rev ? `<div class="rk-modelans" id="rk-a-${b.id}" role="region" aria-label="${esc(X('الإجابة النموذجية من الدليل', 'Model answer from the manual'))}"><strong>${X('الإجابة النموذجية (من الدليل):', 'Model answer (from the manual):')}</strong>${b.ans.map((a, i) => `<p>${esc(T(a))}</p>`).join('')}</div>` : ''}</div>` : '';
    return `<div class="rk-ex" data-ex="${b.id}"><h4>${esc(T(b.title))}</h4>${qs}<p class="rk-small">${X('تأمّل ذاتي: لا يُحتسب لها نتيجة.', 'Self-reflection: not scored.')}</p>${ans}</div>`;
  }
  function block(b) {
    switch (b.t) {
      case 'p': return `<p>${esc(T(b.x))}</p>`;
      case 'h': return `<h4>${esc(T(b.x))}</h4>`;
      case 'ul': return `<ul>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ul>`;
      case 'ol': return `<ol>${b.items.map((i) => `<li>${esc(T(i))}</li>`).join('')}</ol>`;
      case 'quote': return `<blockquote class="rk-quote">${b.who && T(b.who) ? `<cite>${esc(T(b.who))}</cite>` : ''}<p>${esc(T(b.x))}</p></blockquote>`;
      case 'note': return `<div class="rk-note" role="note">${esc(T(b.x))}</div>`;
      case 'formula': return `<div class="rk-formula" role="math">${esc(T(b.x))}</div>`;
      case 'doc': return `<figure class="rk-doc"><figcaption>${esc(T(b.title))}</figcaption><ul>${b.lines.map((l) => `<li>${esc(T(l))}</li>`).join('')}</ul></figure>`;
      case 'table': return table(b);
      case 'ex': return ex(b);
      default: return '';
    }
  }
  function activity(a) {
    const r = resp(a.id); const rev = isRevealed(a.id); const att = hasAttempt(a.id);
    const qs = (a.qs && a.qs.length ? a.qs : [X('اكتب إجابتك أو عملك هنا.', 'Write your answer or working here.')]).map((q, i) => {
      const lbl = typeof q === 'object' ? T(q) : q;
      return `<div class="rk-qrow"><label for="rk-r-${a.id}-${i}">${esc(lbl)}</label><textarea id="rk-r-${a.id}-${i}" rows="3" data-rk-resp="${a.id}" data-q="${i}" placeholder="${esc(X('اكتب إجابتك هنا…', 'Write your answer here…'))}">${esc(r['q' + i] || '')}</textarea></div>`;
    }).join('');
    const hasAns = a.ans && a.ans.length;
    const ans = hasAns ? `<div class="rk-reveal"><button type="button" class="rk-btn" data-rk-act="reveal" data-id="${a.id}" aria-expanded="${rev}" aria-controls="rk-a-${a.id}"${att ? '' : ' disabled'}>${rev ? X('إخفاء الإجابة', 'Hide answer') : X('عرض الإجابة من الدليل', 'Show the manual’s answer')}</button>${att ? '' : `<span class="rk-small"> ${X('اكتب محاولتك أولاً لتفعيل زر الإجابة.', 'Write your attempt first to enable the answer button.')}</span>`}${rev ? `<div class="rk-modelans" id="rk-a-${a.id}" role="region" aria-label="${esc(X('الإجابة من الدليل', 'Answer from the manual'))}"><strong>${X('الإجابة (ص 48 من الدليل):', 'Answer (manual p. 48):')}</strong>${a.ans.map(ansBlock).join('')}</div>` : ''}</div>` : `<p class="rk-small">${X('نشاط تأمّلي: لا توجد إجابة نموذجية في الدليل ولا يُحتسب له درجة.', 'Reflective activity: the manual gives no model answer and it is not scored.')}</p>`;
    return `<section class="rk-panel rk-activity" data-activity="${a.id}" aria-labelledby="rk-${a.id}-h"><div class="rk-panel-head"><h3 id="rk-${a.id}-h">${esc(T(a.title))}</h3><span class="rk-status">${att ? X('تمت الإجابة', 'Answered') : X('لم تُجب بعد', 'Not answered yet')}</span></div>${a.intro ? `<p>${esc(T(a.intro))}</p>` : ''}${(a.facts || []).map(block).join('')}${a.ans && a.id === 'a5' ? `<p class="rk-small">${X('ملاحظة التطبيق: نماذج السجلات التفاعلية تأتي في مرحلة لاحقة؛ دوّن أرقامك هنا في الوقت الحالي.', 'Application note: interactive record forms arrive in a later phase; write your figures here for now.')}</p>` : ''}${qs}${ans}</section>`;
  }

  /* ---- part views ---- */
  const parts = () => C();
  const items = (partId) => {
    const secs = (parts()[partId] || []).map((s) => ({ kind: 'sec', id: s.id, sec: s }));
    if (A() && A().BY_PART[partId]) secs.push({ kind: 'assess', id: 'assessment', def: A().DATA[A().BY_PART[partId]] });
    return secs;
  };
  const titleOf = (it) => (it.kind === 'sec' ? T(it.sec.title) : T(it.def.title));
  const activityIds = (partId) => (parts()[partId] || []).filter((s) => s.activity).map((s) => s.activity.id);
  function progress(partId) {
    const ids = activityIds(partId); const answered = ids.filter(hasAttempt).length;
    const aid = A() && A().BY_PART[partId]; const st = aid ? A().status(aid) : null;
    return { activities: ids.length, answered, assessment: aid || null, submitted: st ? st.submitted : false, score: st ? st.score : null, total: st ? st.total : null };
  }
  function renderPart(partId, subId) {
    const list = items(partId); if (!list.length) return null;
    const idx = Math.max(0, list.findIndex((x) => x.id === subId)); const cur = list[idx]; const pr = progress(partId);
    const subnav = `<nav class="rk-subnav" aria-label="${esc(X('أقسام الجزء', 'Part sections'))}">${list.map((x, i) => `<button type="button" class="rk-sub${i === idx ? ' active' : ''}" data-rk-act="sub" data-id="${x.id}"${i === idx ? ' aria-current="true"' : ''}>${esc(titleOf(x))}</button>`).join('')}</nav>`;
    const prog = `<p class="rk-progress" role="status">${pr.activities ? `${X('الأنشطة المجاب عنها: ', 'Activities answered: ')}<bdi>${pr.answered}</bdi>/<bdi>${pr.activities}</bdi> · ` : ''}${pr.assessment ? `${X('التقييم: ', 'Assessment: ')}${pr.submitted ? X('مكتمل، النتيجة ', 'completed, score ') + '<bdi>' + pr.score + '/' + pr.total + '</bdi>' : X('غير مكتمل', 'not completed')}` : ''}</p>`;
    let body;
    if (cur.kind === 'assess') body = A().render(partId);
    else {
      const s = cur.sec;
      body = `<section class="rk-panel rk-sec" data-section-id="${s.id}" aria-labelledby="rk-${partId}-${s.id}-h"><div class="rk-panel-head"><h3 id="rk-${partId}-${s.id}-h">${esc(T(s.title))}</h3>${s.summary ? `<span class="rk-status">${X('ملخص', 'Summary')}</span>` : ''}<span class="rk-small">${X('ص ', 'p. ')}<bdi>${esc(s.pg)}</bdi></span></div>${s.activity ? '' : (s.blocks || []).map(block).join('')}</section>${s.activity ? activity(s.activity) : ''}`;
    }
    const prev = list[idx - 1], next = list[idx + 1];
    const ar = lang() === 'ar';
    const pager = `<div class="rk-pager">${prev ? `<button type="button" class="rk-btn" data-rk-act="sub" data-id="${prev.id}">${ar ? '→ ' : '← '}${esc(titleOf(prev))}</button>` : '<span></span>'}${next ? `<button type="button" class="rk-btn primary" data-rk-act="sub" data-id="${next.id}">${esc(titleOf(next))} ${ar ? '←' : '→'}</button>` : '<span></span>'}</div>`;
    return { html: `${prog}${subnav}${body}${pager}`, subId: cur.id, count: list.length };
  }

  /* ---- events ---- */
  function bind(root, ctx) {
    root.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches && t.matches('[data-rk-resp]')) {
        store.set(respPath(t.dataset.rkResp) + '.q' + t.dataset.q, t.value);
        const id = t.dataset.rkResp; const btn = root.querySelector('[data-rk-act="reveal"][data-id="' + id + '"]');
        if (btn && hasAttempt(id)) { btn.disabled = false; }
      }
    });
    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches && t.matches('[data-rk-as]')) A().setAnswer(t.dataset.rkAs, t.dataset.k, t.value);
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rk-act]'); if (!b || !root.contains(b)) return;
      const act = b.dataset.rkAct; const id = b.dataset.id;
      if (act === 'sub') ctx.sub(id);
      else if (act === 'reveal') {
        if (!hasAttempt(id)) return;
        store.set(respPath(id) + '.revealed', !isRevealed(id)); ctx.refresh('[data-rk-act="reveal"][data-id="' + id + '"]');
      } else if (act === 'submit') {
        const r = A().submit(id);
        if (!r.ok) { const m = root.querySelector('#rk-' + id + '-msg'); if (m) m.textContent = X('أجب عن جميع البنود قبل التسليم.', 'Answer every item before submitting.'); return; }
        ctx.refresh('#rk-' + id + '-score');
      } else if (act === 'retry') { A().retry(id); ctx.refresh('[data-assessment="' + id + '"] input, [data-assessment="' + id + '"] select'); }
    });
  }
  window.SIYBRKContent = { renderPart, progress, bind, resp, hasAttempt, isRevealed, items, activityIds };
})();
