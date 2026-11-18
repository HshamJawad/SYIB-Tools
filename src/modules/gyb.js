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
    return it.phase <= 4 ? `<span class="gyb-tag">${X('لم يبدأ', 'Not started')}</span>` : `<span class="gyb-tag">${X('قريباً', 'Coming soon')}</span>`;
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

  /* ---------- Part I: You as an entrepreneur (Phase 2) ---------- */
  const P1 = D.P1;
  const isO = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const strArr = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  const readResponses = () => { const r = store.get('readinessAssessment.responses', {}); return isO(r) ? r : {}; };
  const lines = (txt) => String(txt || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  // experienceSkillsNetworks is stored as [{k:'experience'|'skills'|'network', text}]
  const enGet = (k) => { const a = store.get('businessProfile.experienceSkillsNetworks', []); const e = Array.isArray(a) ? a.find((x) => x && x.k === k) : null; return e && typeof e.text === 'string' ? e.text : ''; };
  const enSet = (k, text) => {
    const a = store.get('businessProfile.experienceSkillsNetworks', []);
    const list = (Array.isArray(a) ? a : []).filter((x) => x && x.k !== k);
    if (text.trim()) list.push({ k, text });
    store.set('businessProfile.experienceSkillsNetworks', list);
  };
  const ta = (f, val, rows = 3) => `<textarea class="gyb-ta" rows="${rows}" data-f="${f}">${esc(val)}</textarea>`;
  const fld = (label, inner) => `<label class="gyb-fld"><span>${esc(T(label))}</span>${inner}</label>`;

  function renderPart1(s) {
    const p = s.part; const resp = readResponses();
    const crit = strArr(store.get('readinessAssessment.criticalImprovementAreas', []));
    const types = strArr(store.get('businessProfile.businessTypes', []));
    const areas = P1.areas.map((a, i) => `<fieldset class="gyb-area" data-area="${a.id}"><legend><span class="gyb-area-n">${i + 1}</span>${esc(T(a.t))}</legend>
      <p class="gyb-q">${esc(T(a.q))}</p>
      <div class="gyb-choices" role="radiogroup">${P1.answers.map((o) => `<label class="gyb-choice ${o.v}"><input type="radio" name="ra-${a.id}" value="${o.v}" data-f="area" data-id="${a.id}"${resp[a.id] === o.v ? ' checked' : ''}><span>${esc(T(o.t))}</span></label>`).join('')}</div></fieldset>`).join('');
    const critBoxes = P1.areas.map((a) => `<label class="gyb-choice crit"><input type="checkbox" data-f="crit" value="${a.id}"${crit.includes(a.id) ? ' checked' : ''}><span>${esc(T(a.t))}</span></label>`).join('');
    const typeBoxes = P1.types.map((t) => `<label class="gyb-type"><input type="checkbox" data-f="type" value="${t.id}"${types.includes(t.id) ? ' checked' : ''}><span><b>${esc(T(t.t))}</b><small>${esc(T(t.d))}</small></span></label>`).join('');
    const typeName = (id) => T(P1.types.find((t) => t.id === id).t);
    const cases = P1.cases.map((c) => `<li><b>${esc(T(c.n))}</b> — ${esc(T(c.f))} <span class="gyb-tag blue">${esc(typeName(c.ty))}</span><small>${esc(T(c.s))}</small></li>`).join('');
    const statusOf = (id) => statusTag(p.items.find((i) => i.id === id));
    return head(T(p.title), T(p.lead)) +
      card('', `<p>${esc(T(P1.reflective))}</p>`, 'warn') +
      `<nav class="gyb-steps" aria-label="${X('خطوات الجزء الأول', 'Part I steps')}">
        <a href="#gyb-p1-a">${X('1 · الجاهزية', '1 · Readiness')}</a><a href="#gyb-p1-b">${X('2 · النشاط 1', '2 · Activity 1')}</a><a href="#gyb-p1-c">${X('3 · المجال والنوع', '3 · Field and type')}</a><a href="#gyb-p1-d">${X('4 · تقوية قدراتك', '4 · Strengthen')}</a></nav>` +
      `<div id="gyb-p1-a">` + card(X('1 · هل لديك ما يلزم لتكون رائد أعمال؟', '1 · Do you have what it takes to be an entrepreneur?'),
        `<p class="gyb-note">${X('لكل مجال من المجالات التسعة اختر ما يعبّر عنك الآن. يمكنك ترك أي مجال دون إجابة والعودة إليه، وتعديل إجاباتك في أي وقت.', 'For each of the nine areas, choose what describes you now. You may leave any area unanswered and return to it, and change your answers at any time.')}</p>
        <div class="gyb-p1-status" data-o="ass1tag">${statusOf('ass1')}</div>${areas}
        <div class="gyb-counts" role="status" aria-live="polite" data-o="counts"></div>`, 'accent') + `</div>` +
      `<div id="gyb-p1-b">` + card(X('2 · النشاط 1: مجالات التحسين والنمو الحرجة', '2 · Activity 1: critical areas needing improvement and growth'),
        `<p>${esc(T(P1.act1Intro))}</p><div class="gyb-p1-status" data-o="act1tag">${statusOf('act1')}</div>
        <div class="gyb-choices wrap">${critBoxes}</div>
        <div class="gyb-actions">${btn('p1-fillcrit', X('اقترح من مجالات «تحتاج تحسيناً»', 'Suggest from "Needs improvement" areas'))}</div>
        ${fld(D.B('ملاحظاتك: ما أهم ما تريد تحسينه ولماذا؟', 'Your notes: what do you most want to improve, and why?'), ta('critnotes', store.get('readinessAssessment.criticalNotes', ''), 4))}`) + `</div>` +
      `<div id="gyb-p1-c">` + card(X('3 · أي مجال وأي نوع من الأعمال يناسبك؟', '3 · Which field and type of business suit you?'),
        `<p>${esc(T(P1.fieldIntro))}</p><ul class="gyb-cases">${cases}</ul>
        <div class="gyb-p1-status" data-o="ass2tag">${statusOf('ass2')}</div>
        ${fld(P1.prompts.interests, ta('interests', strArr(store.get('businessProfile.fieldsOfInterest', [])).join('\n'), 4))}
        <h4>${X('أنواع الأعمال التي تفكر فيها (اختر واحداً أو أكثر)', 'Business types you are considering (choose one or more)')}</h4><div class="gyb-types">${typeBoxes}</div>
        <div class="gyb-grid two">${fld(P1.prompts.experience, ta('experience', enGet('experience')))}${fld(P1.prompts.skills, ta('skills', enGet('skills')))}</div>
        ${fld(P1.prompts.network, ta('network', enGet('network')))}
        ${fld(P1.prompts.why, ta('why', store.get('businessProfile.whySuits', ''), 4))}
        <p class="gyb-note">${X('هذه الإجابات مسودة تفكير وليست قراراً: ستقارن أفكارك وتختار لاحقاً في أجزاء الرحلة التالية.', 'These answers are a thinking draft, not a decision: you will compare and choose your ideas later in the next parts of the journey.')}</p>`) + `</div>` +
      `<div id="gyb-p1-d">` + card(X('4 · كيف تقوّي قدراتك؟', '4 · How to strengthen your abilities'), `${ul(P1.strengthen)}<p class="gyb-note">${esc(T(P1.strengthenNote))}</p>
        <p>${statusTag(p.items.find((i) => i.id === 'act2'))}</p>`, 'good') + `</div>`;
  }

  function updatePart1() {
    if (!root) return;
    const resp = readResponses();
    const ids = P1.areas.map((a) => a.id);
    const strengths = ids.filter((i) => resp[i] === 'strength').length;
    const improves = ids.filter((i) => resp[i] === 'improve').length;
    const unsure = ids.filter((i) => resp[i] === 'unsure').length;
    const answered = strengths + improves + unsure;
    const left = ids.length - answered;
    store.set('readinessAssessment.strengthsCount', strengths);
    store.set('readinessAssessment.improvementCount', improves);
    const c = root.querySelector('[data-o="counts"]');
    if (c) c.innerHTML = `<span class="gyb-count good"><b>${strengths}</b>${X('نقاط قوة', 'strengths')}</span><span class="gyb-count warn"><b>${improves}</b>${X('مجالات تحتاج تحسيناً', 'areas to improve')}</span><span class="gyb-count"><b>${unsure}</b>${X('غير متأكد', 'not sure')}</span><span class="gyb-count"><b>${left}</b>${left ? X('بلا إجابة', 'unanswered') : X('كلها أُجيبت', 'all answered')}</span>` +
      (left ? `<p class="gyb-note">${X('التقييم غير مكتمل بعد، وهذا طبيعي؛ المجالات غير المجابة ليست نقاط ضعف.', 'The assessment is not complete yet, which is fine; unanswered areas are not weaknesses.')}</p>` : '');
    const crit = strArr(store.get('readinessAssessment.criticalImprovementAreas', []));
    const fields = strArr(store.get('businessProfile.fieldsOfInterest', []));
    const types = strArr(store.get('businessProfile.businessTypes', []));
    const why = String(store.get('businessProfile.whySuits', '')).trim();
    const notes = String(store.get('readinessAssessment.criticalNotes', '')).trim();
    const prog = {
      ass1: answered === 0 ? '' : left === 0 ? 'done' : 'inprogress',
      act1: crit.length || notes ? 'done' : '',
      ass2: (fields.length && types.length && why) ? 'done' : (fields.length || types.length || why || enGet('experience') || enGet('skills') || enGet('network')) ? 'inprogress' : ''
    };
    const p = byId('p1').part;
    Object.keys(prog).forEach((id) => {
      if (stateOf({ id }) !== prog[id]) store.set('progress.' + id, prog[id]);
      const el = root.querySelector(`[data-o="${id}tag"]`);
      if (el) el.innerHTML = statusTag(p.items.find((i) => i.id === id));
    });
  }

  function onP1Input(el) {
    const f = el.dataset.f;
    if (f === 'area') { const r = readResponses(); r[el.dataset.id] = el.value; store.set('readinessAssessment.responses', r); }
    else if (f === 'crit') { store.set('readinessAssessment.criticalImprovementAreas', P1.areas.map((a) => a.id).filter((id) => root.querySelector(`[data-f="crit"][value="${id}"]`).checked)); }
    else if (f === 'type') { store.set('businessProfile.businessTypes', P1.types.map((t) => t.id).filter((id) => root.querySelector(`[data-f="type"][value="${id}"]`).checked)); }
    else if (f === 'critnotes') store.set('readinessAssessment.criticalNotes', el.value);
    else if (f === 'interests') store.set('businessProfile.fieldsOfInterest', lines(el.value));
    else if (f === 'why') store.set('businessProfile.whySuits', el.value);
    else if (f === 'experience' || f === 'skills' || f === 'network') enSet(f, el.value);
    else return;
    updatePart1();
  }

  /* ---------- Parts II and III (Phase 3): idea bank, case studies and idea-generation activities ---------- */
  const P2 = D.P2, P3 = D.P3;
  const ascii = (v) => String(v == null ? '' : v).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const arrAt = (path) => { const a = store.get(path, []); return Array.isArray(a) ? a.filter(isO) : []; };
  const strAt = (path) => { const v = store.get(path, ''); return typeof v === 'string' ? v : ''; };
  const opts = (list, cur, blank) => (blank ? `<option value="">${esc(blank)}</option>` : '') + list.map(([v, t]) => `<option value="${v}"${cur === v ? ' selected' : ''}>${esc(T(t))}</option>`).join('');
  const SRC_BY_PATH = [['successfulBusinessOwners', 'owners'], ['experienceToIdeas', 'experience'], ['localMarketSurvey', 'survey'], ['environmentalScanning', 'scan']];

  // Generic entry lists: each entry is an object in an array in the store.
  const ENT = {};
  ENT['activities.successfulBusinessOwners'] = { fields: P3.act4.fields, max: 3, add: D.B('+ أضف مشروعاً', '+ Add a business'), title: (e, i) => e.name || X('مشروع ', 'Business ') + (i + 1), idea: (e) => ({ title: e.name ? X('فكرة مشابهة لـ ', 'Idea inspired by ') + e.name : '', notes: e.lessons || '' }) };
  ENT['activities.experienceToIdeas'] = { fields: P3.act5.fields, add: D.B('+ أضف تجربة', '+ Add an experience'), idea: (e) => ({ title: e.idea || '', notes: e.experience || '' }) };
  ENT['activities.localMarketSurvey.records'] = { fields: P3.act6.fields, add: D.B('+ أضف مشروعاً محلياً', '+ Add a local business'), idea: null };
  P3.act7.sources.forEach((src) => { ENT['activities.environmentalScanning.' + src.id] = { fields: P3.act7.fields, add: D.B('+ أضف ملاحظة', '+ Add an observation'), idea: (e) => ({ title: e.idea || '', notes: e.obs || '' }) }; });
  const srcOf = (path) => (SRC_BY_PATH.find(([k]) => path.includes(k)) || [0, 'own'])[1];

  const ideas = () => arrAt('ideas');
  const saveIdeas = (list) => store.set('ideas', list);
  function addIdea(seed) {
    const list = ideas();
    const title = (seed.title || '').trim();
    if (title && list.some((i) => i.title === title && i.source === seed.source)) return false;
    list.push({ id: uid(), title, field: '', type: '', description: '', source: seed.source || 'own', notes: seed.notes || '', status: 'draft', elements: { need: '', offering: '', customers: '', selling: '', environment: '' }, createdAt: new Date().toISOString() });
    saveIdeas(list); return list[list.length - 1].id;
  }
  const elemDone = (i) => P2.elements.filter((e) => isO(i.elements) && String(i.elements[e.id] || '').trim()).length;

  const entryHtml = (path, e, idx) => {
    const cfg = ENT[path];
    const f = cfg.fields.map((d) => {
      const v = e[d.k] == null ? '' : String(e[d.k]);
      const inp = d.sel ? `<select class="gyb-ta" data-ent="${path}" data-i="${idx}" data-k="${d.k}">${opts(d.sel, v)}</select>`
        : (d.r ? `<textarea class="gyb-ta" rows="${d.r}" data-ent="${path}" data-i="${idx}" data-k="${d.k}">${esc(v)}</textarea>` : `<input class="gyb-ta" type="${d.num ? 'number' : 'text'}"${d.num ? ' min="0" inputmode="numeric"' : ''} data-ent="${path}" data-i="${idx}" data-k="${d.k}" value="${esc(v)}">`);
      return fld(d.l, inp);
    }).join('');
    const acts = `<div class="gyb-actions">${cfg.idea ? btn('ent-idea', X('← إلى قائمة أفكاري', 'To my ideas list'), '', `data-path="${path}" data-i="${idx}"`) : ''}${btn('ent-del', X('حذف', 'Delete'), 'orange', `data-path="${path}" data-i="${idx}"`)}</div>`;
    return `<div class="gyb-entry">${cfg.title ? `<h4>${esc(cfg.title(e, idx))}</h4>` : ''}${f}${acts}</div>`;
  };
  const entriesHtml = (path, cat) => {
    const list = arrAt(path); const cfg = ENT[path];
    const rows = list.map((e, i) => (cat && e.cat !== cat ? '' : entryHtml(path, e, i))).join('');
    const can = !cfg.max || list.length < cfg.max;
    return `<div class="gyb-entries">${rows}</div>${can ? `<div class="gyb-actions">${btn('ent-add', esc(T(cfg.add)), '', `data-path="${path}"${cat ? ` data-cat="${cat}"` : ''}`)}</div>` : `<p class="gyb-note">${X('بلغت الحد الأقصى (3).', 'Maximum reached (3).')}</p>`}`;
  };

  // Chips (brainstorming): list of strings at path
  const chipsHtml = (path, ph) => {
    const list = (Array.isArray(store.get(path, [])) ? store.get(path, []) : []).filter((x) => typeof x === 'string');
    return `<div class="gyb-chips">${list.map((w, i) => `<span class="gyb-chip"><span>${esc(w)}</span><button type="button" class="gyb-chip-b" data-act="chip-idea" data-path="${path}" data-i="${i}" title="${X('إلى قائمة أفكاري', 'To my ideas list')}" aria-label="${X('إلى قائمة أفكاري', 'To my ideas list')}">＋</button><button type="button" class="gyb-chip-b" data-act="chip-del" data-path="${path}" data-i="${i}" title="${X('حذف', 'Delete')}" aria-label="${X('حذف', 'Delete')}">×</button></span>`).join('')}</div>
      <div class="gyb-chip-add"><input class="gyb-ta" type="text" data-chip="${path}" placeholder="${esc(ph || X('اكتب واضغط Enter', 'Type and press Enter'))}"><button type="button" class="gyb-btn" data-act="chip-add" data-path="${path}">${X('أضف', 'Add')}</button></div>`;
  };
  const sessions = () => arrAt('activities.brainstormingSessions');
  const structs = () => arrAt('activities.structuredBrainstorming');
  const sessionsHtml = () => sessions().map((s, i) => `<div class="gyb-entry"><div class="gyb-grid two">${fld(D.B('نوع كلمة البداية', 'Starting word type'), `<select class="gyb-ta" data-bs="kind" data-i="${i}">${opts(P3.act8.kinds, s.kind)}</select>`)}${fld(D.B('كلمة البداية', 'Starting word'), `<input class="gyb-ta" type="text" data-bs="topic" data-i="${i}" value="${esc(s.topic || '')}">`)}</div>
      ${chipsHtml('activities.brainstormingSessions.' + i + '.words')}<div class="gyb-actions">${btn('bs-del', X('حذف الجلسة', 'Delete session'), 'orange', `data-i="${i}"`)}</div></div>`).join('') + `<div class="gyb-actions">${btn('bs-add', X('+ جلسة عصف ذهني جديدة', '+ New brainstorming session'))}</div>`;
  const structHtml = () => structs().map((s, i) => `<div class="gyb-entry">${fld(D.B('المنتج', 'Product'), `<input class="gyb-ta" type="text" data-sb="product" data-i="${i}" value="${esc(s.product || '')}">`)}
      <div class="gyb-lines">${P3.act9.lines.map((l) => `<div class="gyb-line"><b>${esc(T(l.t))}</b><small>${esc(T(l.h))}</small>${chipsHtml('activities.structuredBrainstorming.' + i + '.lines.' + l.id)}</div>`).join('')}</div>
      <div class="gyb-actions">${btn('sb-del', X('حذف المنتج', 'Delete product'), 'orange', `data-i="${i}"`)}</div></div>`).join('') + `<div class="gyb-actions">${btn('sb-add', X('+ أضف منتجاً', '+ Add a product'))}</div>`;

  // Idea bank
  const bankUi = { status: '', type: '', field: '', open: new Set() };
  const ideaCard = (it) => {
    const done = elemDone(it);
    const el = P2.elements.map((e) => fld(D.B(e.t.ar + ' — ' + e.q.ar, e.t.en + ' — ' + e.q.en), `<textarea class="gyb-ta" rows="2" data-idea="el.${e.id}" data-id="${it.id}">${esc((it.elements || {})[e.id] || '')}</textarea>`)).join('');
    const stT = T((P3.bank.statuses.find(([v]) => v === it.status) || [0, D.B('مسودة', 'Draft')])[1]);
    return `<details class="gyb-idea" data-id="${it.id}"${bankUi.open.has(it.id) ? ' open' : ''}><summary><b>${esc(it.title || X('(فكرة بلا عنوان)', '(untitled idea)'))}</b><span class="gyb-tag blue">${esc(stT)}</span><span class="gyb-tag ${done === 5 ? 'green' : 'orange'}">${done === 5 ? X('العناصر الخمسة مكتملة', 'Five elements complete') : X(`غير مكتملة: ${done} من 5`, `Incomplete: ${done} of 5`)}</span></summary>
      <div class="gyb-idea-body">${fld(D.B('عنوان الفكرة', 'Idea title'), `<input class="gyb-ta" type="text" data-idea="title" data-id="${it.id}" value="${esc(it.title || '')}">`)}
      <div class="gyb-grid two">${fld(D.B('المجال', 'Field'), `<input class="gyb-ta" type="text" data-idea="field" data-id="${it.id}" value="${esc(it.field || '')}">`)}${fld(D.B('النوع', 'Type'), `<select class="gyb-ta" data-idea="type" data-id="${it.id}">${opts(P1.types.map((t) => [t.id, t.t]), it.type, '—')}</select>`)}</div>
      <div class="gyb-grid two">${fld(D.B('المصدر', 'Source'), `<select class="gyb-ta" data-idea="source" data-id="${it.id}">${opts(P3.bank.sources, it.source)}</select>`)}${fld(D.B('الحالة', 'Status'), `<select class="gyb-ta" data-idea="status" data-id="${it.id}">${opts(P3.bank.statuses, it.status)}</select>`)}</div>
      ${fld(D.B('وصف الفكرة', 'Description'), `<textarea class="gyb-ta" rows="2" data-idea="description" data-id="${it.id}">${esc(it.description || '')}</textarea>`)}
      <h4>${X('العناصر الخمسة للفكرة', 'The five elements of the idea')}</h4>${el}
      ${fld(D.B('ملاحظات', 'Notes'), `<textarea class="gyb-ta" rows="2" data-idea="notes" data-id="${it.id}">${esc(it.notes || '')}</textarea>`)}
      <div class="gyb-actions">${btn('idea-del', X('حذف الفكرة', 'Delete idea'), 'orange', `data-id="${it.id}"`)}</div></div></details>`;
  };
  const filteredIdeas = () => ideas().filter((i) => (!bankUi.status || i.status === bankUi.status) && (!bankUi.type || i.type === bankUi.type) && (!bankUi.field || String(i.field || '').toLowerCase().includes(bankUi.field.toLowerCase())));
  const bankListHtml = () => {
    const all = ideas(); const list = filteredIdeas();
    return `<p class="gyb-note" data-o="bankcount">${X(`عدد الأفكار: ${all.length}` + (list.length !== all.length ? ` (المعروض ${list.length})` : ''), `Ideas: ${all.length}` + (list.length !== all.length ? ` (showing ${list.length})` : ''))}</p>` +
      (list.length ? list.map(ideaCard).join('') : `<p class="gyb-note">${all.length ? X('لا أفكار تطابق التصفية.', 'No ideas match the filter.') : X('لم تضف أفكاراً بعد.', 'You have not added any ideas yet.')}</p>`);
  };
  const bankHtml = () => `<div class="gyb-filters">
      <label>${X('الحالة', 'Status')}<select class="gyb-ta" data-bf="status">${opts(P3.bank.statuses, bankUi.status, X('الكل', 'All'))}</select></label>
      <label>${X('النوع', 'Type')}<select class="gyb-ta" data-bf="type">${opts(P1.types.map((t) => [t.id, t.t]), bankUi.type, X('الكل', 'All'))}</select></label>
      <label>${X('المجال', 'Field')}<input class="gyb-ta" type="text" data-bf="field" value="${esc(bankUi.field)}"></label></div>
    <div class="gyb-actions">${btn('idea-add', X('+ فكرة جديدة', '+ New idea'), 'primary')}</div><div data-o="banklist">${bankListHtml()}</div>`;

  const jump = (arr) => `<nav class="gyb-steps">${arr.map(([id, t]) => `<a href="#${id}">${esc(T(t))}</a>`).join('')}</nav>`;
  const tagBox = (id, part) => `<div class="gyb-p1-status" data-o="${id}tag">${statusTag(byId(part).part.items.find((i) => i.id === id))}</div>`;

  function renderPart2(s) {
    const p = s.part;
    const cs = (c) => `<div class="gyb-case"><h4>${esc(T(c.n))}</h4><p>${esc(T(c.s))}</p><p class="gyb-q"><b>${esc(T(c.q))}</b></p></div>`;
    return head(T(p.title), T(p.lead)) + card('', `<p>${esc(T(P2.intro))}</p>`, 'warn') +
      jump([['gyb-p2-a', D.B('الحالتان', 'Cases')], ['gyb-p2-b', D.B('العناصر الخمسة', 'Five elements')], ['gyb-p2-c', D.B('النشاط 3', 'Activity 3')]]) +
      `<div id="gyb-p2-a">${card(X('حالتا Janet وLily', 'The cases of Janet and Lily'), cs(P2.janet) + cs(P2.lily) + `<p class="gyb-note">${X('فكّر في الإجابة ودوّنها في دفترك أو في ملاحظات أفكارك.', 'Think about your answer and note it in your notebook or in your idea notes.')}</p>`, 'accent')}</div>` +
      `<div id="gyb-p2-b">${card(X('ما الذي يصنع فكرة المشروع؟', 'What makes a business idea?'), `<p>${esc(T(p.lead))}</p><ol class="gyb-list">${P2.elements.map((e) => `<li><b>${esc(T(e.t))}</b>: ${esc(T(e.q))}</li>`).join('')}</ol>`)}</div>` +
      `<div id="gyb-p2-c">${card(X('النشاط 3: صِف فكرة مشروعك', 'Activity 3: describe your business idea'), `<p>${esc(T(P2.act3))}</p>${tagBox('act3', 'p2')}${bankHtml()}`, 'good')}</div>`;
  }

  function renderPart3(s) {
    const p = s.part; const a5 = P3.act5; const a6 = P3.act6;
    const obs = Array.from({ length: 5 }, (_, i) => { const o = store.get('activities.localMarketSurvey.observations', []); return Array.isArray(o) && typeof o[i] === 'string' ? o[i] : ''; });
    const stages = [['gyb-p3-a', D.B('Hamisi', 'Hamisi')], ['gyb-p3-4', D.B('النشاط 4', 'Act. 4')], ['gyb-p3-5', D.B('النشاط 5', 'Act. 5')], ['gyb-p3-6', D.B('النشاط 6', 'Act. 6')], ['gyb-p3-7', D.B('النشاط 7', 'Act. 7')], ['gyb-p3-8', D.B('النشاط 8', 'Act. 8')], ['gyb-p3-9', D.B('النشاط 9', 'Act. 9')], ['gyb-p3-10', D.B('النشاط 10', 'Act. 10')]];
    return head(T(p.title), T(p.lead)) + jump(stages) +
      `<div id="gyb-p3-a">${card(X('تجربة Hamisi', 'Hamisi\'s experience'), `<p>${esc(T(P3.hamisi.s))}</p><p class="gyb-q"><b>${esc(T(P3.hamisi.q))}</b></p>`, 'accent')}</div>` +
      `<div id="gyb-p3-4">${card(X('النشاط 4: التعلم من أصحاب المشاريع الناجحة', 'Activity 4: learn from successful business owners'), `<p>${esc(T(P3.act4.intro))}</p>${tagBox('act4', 'p3')}${entriesHtml('activities.successfulBusinessOwners')}`)}</div>` +
      `<div id="gyb-p3-5">${card(X('النشاط 5: التجربة الشخصية وتجارب الآخرين', 'Activity 5: your own and other people\'s experience'), `<p>${esc(T(a5.intro))}</p>${tagBox('act5', 'p3')}${a5.cats.map((c) => `<h4>${esc(T(c.t))}</h4>${entriesHtml('activities.experienceToIdeas', c.id)}`).join('')}`)}</div>` +
      `<div id="gyb-p3-6">${card(X('النشاط 6: مسح منطقتك التجارية', 'Activity 6: survey your local business area'), `<p>${esc(T(a6.intro))}</p>${tagBox('act6', 'p3')}${entriesHtml('activities.localMarketSurvey.records')}<div class="gyb-chart" data-o="chart"></div>
        <h4>${esc(T(a6.obs))}</h4>${obs.map((o, i) => `<input class="gyb-ta gyb-obs" type="text" data-obs="${i}" value="${esc(o)}" aria-label="${X('ملاحظة', 'Observation')} ${i + 1}">`).join('')}
        ${fld(a6.missing, ta('survmissing', strAt('activities.localMarketSurvey.missing'), 3))}${fld(a6.opps, ta('survopps', strAt('activities.localMarketSurvey.opportunities'), 3))}`)}</div>` +
      `<div id="gyb-p3-7">${card(X('النشاط 7: فحص البيئة (ستة مصادر)', 'Activity 7: scan your environment (six sources)'), `<p>${esc(T(P3.act7.intro))}</p>${tagBox('act7', 'p3')}${P3.act7.sources.map((src) => `<h4>${esc(T(src.t))}</h4><p class="gyb-note">${esc(T(src.h))}</p>${entriesHtml('activities.environmentalScanning.' + src.id)}`).join('')}`)}</div>` +
      `<div id="gyb-p3-8">${card(X('النشاط 8: العصف الذهني', 'Activity 8: brainstorming'), `<p>${esc(T(P3.act8.intro))}</p>${tagBox('act8', 'p3')}${sessionsHtml()}`)}</div>` +
      `<div id="gyb-p3-9">${card(X('النشاط 9: العصف الذهني المنظَّم', 'Activity 9: structured brainstorming'), `<p>${esc(T(P3.act9.intro))}</p>${tagBox('act9', 'p3')}${structHtml()}`)}</div>` +
      `<div id="gyb-p3-10">${card(X('النشاط 10: قائمة أفكاري', 'Activity 10: my ideas list'), `<p>${esc(T(P3.bank.intro))}</p>${tagBox('act10', 'p3')}${bankHtml()}`, 'good')}</div>`;
  }

  function updatePartN() {
    if (!root) return;
    const cnt = (p) => arrAt(p).length;
    const filled = (p, k) => arrAt(p).filter((e) => String(e[k] || '').trim()).length;
    const list = ideas();
    const obs = store.get('activities.localMarketSurvey.observations', []);
    const nObs = Array.isArray(obs) ? obs.filter((o) => typeof o === 'string' && o.trim()).length : 0;
    const wordsOf = (o, path) => { const a = path.reduce((x, k) => (x == null ? x : x[k]), o); return Array.isArray(a) ? a.length : 0; };
    const ss = sessions(); const st = structs();
    const lvl = (done, any) => (done ? 'done' : any ? 'inprogress' : '');
    const scanOk = P3.act7.sources.filter((src) => cnt('activities.environmentalScanning.' + src.id) > 0).length;
    const catOk = P3.act5.cats.filter((c) => arrAt('activities.experienceToIdeas').some((e) => e.cat === c.id && String(e.experience || '').trim())).length;
    const prog = {
      act3: lvl(list.some((i) => elemDone(i) === 5), list.length > 0),
      act4: lvl(arrAt('activities.successfulBusinessOwners').some((e) => String(e.name || '').trim() && String(e.lessons || '').trim()), cnt('activities.successfulBusinessOwners') > 0),
      act5: lvl(catOk === P3.act5.cats.length, cnt('activities.experienceToIdeas') > 0),
      act6: lvl(filled('activities.localMarketSurvey.records', 'name') > 0 && nObs >= 5, cnt('activities.localMarketSurvey.records') > 0 || nObs > 0 || strAt('activities.localMarketSurvey.missing').trim() || strAt('activities.localMarketSurvey.opportunities').trim()),
      act7: lvl(scanOk === P3.act7.sources.length, scanOk > 0),
      act8: lvl(ss.some((s) => String(s.topic || '').trim() && wordsOf(s, ['words']) >= 5), ss.length > 0),
      act9: lvl(st.some((s) => String(s.product || '').trim() && P3.act9.lines.every((l) => wordsOf(s, ['lines', l.id]) > 0)), st.length > 0),
      act10: lvl(list.length >= 3, list.length > 0)
    };
    ['p2', 'p3'].forEach((pid) => {
      const part = byId(pid).part;
      part.items.forEach((it) => {
        if (!(it.id in prog)) return;
        if (stateOf(it) !== prog[it.id]) store.set('progress.' + it.id, prog[it.id]);
        root.querySelectorAll(`[data-o="${it.id}tag"]`).forEach((el) => { el.innerHTML = statusTag(it); });
      });
    });
    // survey chart (learner observations only)
    const ch = root.querySelector('[data-o="chart"]');
    if (ch) {
      const by = {};
      arrAt('activities.localMarketSurvey.records').forEach((r) => { const k = String(r.category || '').trim(); const n = Number(ascii(r.count)); if (k && n > 0) by[k] = (by[k] || 0) + n; });
      const keys = Object.keys(by); const max = Math.max(1, ...keys.map((k) => by[k]));
      ch.innerHTML = keys.length ? `<h4>${X('ملخص ما سجّلته (ملاحظات المتعلم)', 'Summary of what you recorded (learner observations)')}</h4>` + keys.map((k) => `<div class="gyb-brow"><span>${esc(k)}</span><div class="gyb-bar"><span style="width:${Math.round(by[k] / max * 100)}%"></span></div><b>${by[k]}</b></div>`).join('') : '';
    }
  }

  function setPath(path, mut) {
    const keys = path.split('.'); const top = keys[0];
    const root0 = store.get(top, null);
    const clone = JSON.parse(JSON.stringify(root0 == null ? (['ideas'].includes(top) ? [] : {}) : root0));
    let o = clone; keys.slice(1, -1).forEach((k) => { if (o[k] == null) o[k] = {}; o = o[k]; });
    mut(o, keys[keys.length - 1]); store.set(top, clone);
  }
  const getArr = (path) => { const v = store.get(path, []); return Array.isArray(v) ? v : []; };

  function onPartNInput(el) {
    if (el.dataset.ent) { const path = el.dataset.ent; setPath(path, (o, k) => { const a = Array.isArray(o[k]) ? o[k] : []; if (a[+el.dataset.i]) a[+el.dataset.i][el.dataset.k] = el.type === 'number' || el.inputMode === 'numeric' ? ascii(el.value) : el.value; o[k] = a; }); if (path.endsWith('records')) updatePartN(); else updatePartN(); return true; }
    if (el.dataset.idea) {
      const list = ideas(); const it = list.find((i) => i.id === el.dataset.id); if (!it) return true;
      const k = el.dataset.idea;
      if (k.startsWith('el.')) { it.elements = isO(it.elements) ? it.elements : {}; it.elements[k.slice(3)] = el.value; } else it[k] = el.value;
      saveIdeas(list); updatePartN();
      if (el.tagName === 'SELECT' || k === 'title' || k.startsWith('el.')) { const d = el.closest('details'); const sm = d && d.querySelector('summary'); if (sm) { const fresh = document.createElement('div'); fresh.innerHTML = ideaCard(it); sm.innerHTML = fresh.querySelector('summary').innerHTML; } }
      return true;
    }
    if (el.dataset.obs != null && el.dataset.obs !== '') { const o = getArr('activities.localMarketSurvey.observations').slice(); while (o.length < 5) o.push(''); o[+el.dataset.obs] = el.value; store.set('activities.localMarketSurvey.observations', o); updatePartN(); return true; }
    if (el.dataset.f === 'survmissing') { store.set('activities.localMarketSurvey.missing', el.value); updatePartN(); return true; }
    if (el.dataset.f === 'survopps') { store.set('activities.localMarketSurvey.opportunities', el.value); updatePartN(); return true; }
    if (el.dataset.bs) { const l = sessions(); if (l[+el.dataset.i]) { l[+el.dataset.i][el.dataset.bs] = el.value; store.set('activities.brainstormingSessions', l); updatePartN(); } return true; }
    if (el.dataset.sb) { const l = structs(); if (l[+el.dataset.i]) { l[+el.dataset.i][el.dataset.sb] = el.value; store.set('activities.structuredBrainstorming', l); updatePartN(); } return true; }
    if (el.dataset.bf) { bankUi[el.dataset.bf] = el.value; const box = root.querySelector('[data-o="banklist"]'); const all = root.querySelectorAll('[data-o="banklist"]'); all.forEach((b) => { b.innerHTML = bankListHtml(); }); return true; }
    return false;
  }

  const confirmDel = () => window.confirm(X('هل تريد الحذف؟ لا يمكن التراجع.', 'Delete this? This cannot be undone.'));
  const ACT_EXTRA = {};
  Object.assign(ACT_EXTRA, {
    'ent-add': (el) => { const path = el.dataset.path; setPath(path, (o, k) => { const a = Array.isArray(o[k]) ? o[k] : []; const n = {}; if (el.dataset.cat) n.cat = el.dataset.cat; a.push(n); o[k] = a; }); render(true); },
    'ent-del': (el) => { if (!confirmDel()) return; setPath(el.dataset.path, (o, k) => { const a = Array.isArray(o[k]) ? o[k] : []; a.splice(+el.dataset.i, 1); o[k] = a; }); render(true); },
    'ent-idea': (el) => { const e = getArr(el.dataset.path)[+el.dataset.i]; const cfg = ENT[el.dataset.path]; if (!e || !cfg.idea) return; const seed = cfg.idea(e); if (!String(seed.title || '').trim()) { window.alert(X('اكتب عنوان الفكرة أولاً.', 'Write the idea first.')); return; } const ok = addIdea({ ...seed, source: srcOf(el.dataset.path) }); window.alert(ok ? X('أُضيفت الفكرة إلى قائمة أفكاري.', 'Added to your ideas list.') : X('هذه الفكرة موجودة بالفعل في قائمتك.', 'This idea is already in your list.')); updatePartN(); },
    'chip-add': (el) => { const inp = root.querySelector(`[data-chip="${el.dataset.path}"]`); addChip(el.dataset.path, inp); },
    'chip-del': (el) => { setPath(el.dataset.path, (o, k) => { const a = Array.isArray(o[k]) ? o[k] : []; a.splice(+el.dataset.i, 1); o[k] = a; }); render(true); },
    'chip-idea': (el) => { const w = getArr(el.dataset.path)[+el.dataset.i]; if (typeof w !== 'string') return; const ok = addIdea({ title: w, source: el.dataset.path.includes('structured') ? 'structured' : 'brain' }); window.alert(ok ? X('أُضيفت الفكرة إلى قائمة أفكاري.', 'Added to your ideas list.') : X('هذه الفكرة موجودة بالفعل في قائمتك.', 'This idea is already in your list.')); updatePartN(); },
    'bs-add': () => { store.set('activities.brainstormingSessions', sessions().concat([{ kind: 'field', topic: '', words: [] }])); render(true); },
    'bs-del': (el) => { if (!confirmDel()) return; const l = sessions(); l.splice(+el.dataset.i, 1); store.set('activities.brainstormingSessions', l); render(true); },
    'sb-add': () => { store.set('activities.structuredBrainstorming', structs().concat([{ product: '', lines: {} }])); render(true); },
    'sb-del': (el) => { if (!confirmDel()) return; const l = structs(); l.splice(+el.dataset.i, 1); store.set('activities.structuredBrainstorming', l); render(true); },
    'idea-add': () => { const id = addIdea({ title: '', source: 'own' }); bankUi.open.add(id); render(true); },
    'idea-del': (el) => { if (!confirmDel()) return; saveIdeas(ideas().filter((i) => i.id !== el.dataset.id)); bankUi.open.delete(el.dataset.id); render(true); }
  });
  function addChip(path, inp) {
    const v = inp ? inp.value.trim() : ''; if (!v) return;
    setPath(path, (o, k) => { const a = Array.isArray(o[k]) ? o[k] : []; a.push(v); o[k] = a; });
    render(true);
    const again = root.querySelector(`[data-chip="${path}"]`); if (again) again.focus();
  }

  /* ---------- Part IV: The best business ideas for you (Phase 4) ---------- */
  const P4 = D.P4;
  const shortlist = () => strArr(store.get('screening.shortlistedIdeaIds', [])).filter((id) => ideas().some((i) => i.id === id));
  const ideaTitle = (i) => i.title || X('(فكرة بلا عنوان)', '(untitled idea)');
  const fsIdx = (id) => arrAt('fieldStudies').findIndex((r) => r.ideaId === id);
  const swIdx = (id) => arrAt('swotAnalyses').findIndex((r) => r.ideaId === id);
  const IV_FIELDS = [
    { k: 'group', l: D.B('الجهة', 'Group'), sel: P4.groups },
    { k: 'who', l: D.B('من سأقابل؟ (الاسم أو الوصف)', 'Who will I talk to? (name or description)') },
    { k: 'questions', l: D.B('الأسئلة التي سأطرحها', 'Questions to ask'), r: 3 },
    { k: 'notes', l: D.B('ملاحظات المقابلة والنتائج', 'Interview notes and findings'), r: 3 },
    { k: 'followUp', l: D.B('إجراءات المتابعة', 'Follow-up actions'), r: 2 }
  ];
  function ensureP4() {
    const sl = shortlist();
    const fs = arrAt('fieldStudies'); const sw = arrAt('swotAnalyses');
    let cf = false, cs = false;
    sl.forEach((id) => {
      if (!fs.some((r) => r.ideaId === id)) { fs.push({ ideaId: id, needToFind: '', interviews: [] }); cf = true; }
      if (!sw.some((r) => r.ideaId === id)) { sw.push({ ideaId: id, s: '', w: '', o: '', t: '', advantages: '', disadvantages: '', addressing: '', matching: '', managing: '' }); cs = true; }
    });
    if (cf) store.set('fieldStudies', fs);
    if (cs) store.set('swotAnalyses', sw);
    fs.forEach((r, i) => { ENT['fieldStudies.' + i + '.interviews'] = { fields: IV_FIELDS, add: D.B('+ أضف مقابلة', '+ Add an interview'), title: (e, j) => e.who || X('مقابلة ', 'Interview ') + (j + 1), idea: null }; });
  }
  function toggleShortlist(id) {
    const cur = shortlist(); const list = ideas(); const it = list.find((i) => i.id === id); if (!it) return;
    if (cur.includes(id)) { store.set('screening.shortlistedIdeaIds', cur.filter((x) => x !== id)); if (it.status === 'shortlisted') { it.status = 'review'; saveIdeas(list); } }
    else {
      if (cur.length >= 3) { window.alert(X('يمكنك ترشيح ثلاث أفكار كحد أقصى. أزل فكرة أولاً.', 'You can shortlist at most three ideas. Remove one first.')); return; }
      store.set('screening.shortlistedIdeaIds', cur.concat([id])); it.status = 'shortlisted'; saveIdeas(list);
    }
    ensureP4(); render(true);
  }
  const emptyP4 = () => `<p class="gyb-note">${X('لم ترشّح أي فكرة بعد. ارجع إلى «الغربلة» أعلاه واختر حتى ثلاث أفكار.', 'You have not shortlisted any idea yet. Go back to "Screen your ideas" above and choose up to three.')}</p>`;

  function renderPart4(s) {
    ensureP4();
    const p = s.part; const list = ideas(); const sl = shortlist();
    const rows = list.map((it) => {
      const n = elemDone(it); const on = sl.includes(it.id);
      const crit = P2.elements.map((e) => { const has = isO(it.elements) && String(it.elements[e.id] || '').trim(); return `<li class="${has ? 'ok' : 'miss'}"><span aria-hidden="true">${has ? '✓' : '○'}</span> ${esc(T(e.t))}${has ? '' : ` <small>${X('— ناقص', '— missing')}</small>`}</li>`; }).join('');
      return `<div class="gyb-screen${on ? ' on' : ''}"><div class="gyb-screen-h"><b>${esc(ideaTitle(it))}</b><span class="gyb-tag ${n === 5 ? 'green' : 'orange'}">${n === 5 ? X('الوصف مكتمل', 'Description complete') : X(`وصف غير مكتمل: ${n} من 5`, `Incomplete description: ${n} of 5`)}</span></div>
        <ul class="gyb-crit">${crit}</ul>
        <label class="gyb-choice crit"><input type="checkbox" data-act="sl-toggle" data-id="${it.id}"${on ? ' checked' : ''}><span>${X('أرشّح هذه الفكرة للفحص', 'Shortlist this idea for further study')}</span></label></div>`;
    }).join('');
    const screen = card(X('1 · غربلة قائمة الأفكار', '1 · Screen your ideas list'),
      `<p>${esc(T(P4.screenIntro))}</p><h4>${X('أسئلة تساعدك على التأمل', 'Questions to reflect on')}</h4>${ul(P4.reflect)}
       <div class="gyb-counts"><span class="gyb-count good"><b>${sl.length}</b>${X('من 3 مرشحة', 'of 3 shortlisted')}</span><span class="gyb-count"><b>${list.length}</b>${X('أفكار في قائمتك', 'ideas in your list')}</span></div>
       ${list.length ? rows : `<p class="gyb-note">${X('قائمة أفكارك فارغة. أضف أفكاراً في الجزء الثالث (النشاط 10).', 'Your ideas list is empty. Add ideas in Part III (Activity 10).')}</p><div class="gyb-actions">${btn('go', X('إلى الجزء الثالث', 'Go to Part III'), 'primary', 'data-id="p3"')}</div>`}`, 'accent');
    const fsHtml = sl.map((id) => { const it = list.find((i) => i.id === id); const i = fsIdx(id); const r = arrAt('fieldStudies')[i] || {};
      return `<div class="gyb-case"><h4>${esc(ideaTitle(it))}</h4>${fld(D.B('ماذا أحتاج أن أعرف؟', 'What do I need to find out?'), `<textarea class="gyb-ta" rows="3" data-p4="fs" data-id="${id}" data-k="needToFind">${esc(r.needToFind || '')}</textarea>`)}${entriesHtml('fieldStudies.' + i + '.interviews')}</div>`; }).join('');
    const act11 = card(X('2 · النشاط 11: خطة الدراسة الميدانية', '2 · Activity 11: field study plan'),
      `<div class="gyb-res">${esc(T(P4.fieldIntro))}</div><p>${esc(T(P4.wh))}</p>${tagBox('act11', 'p4')}${sl.length ? fsHtml : emptyP4()}`);
    const swotCard = (id) => { const it = list.find((i) => i.id === id); const r = arrAt('swotAnalyses')[swIdx(id)] || {};
      const q = P4.quad.map((x) => fld(x.t, `<textarea class="gyb-ta" rows="3" data-p4="sw" data-id="${id}" data-k="${x.k}">${esc(r[x.k] || '')}</textarea>`)).join('');
      const rf = P4.refl.map((x) => fld(x.t, `<textarea class="gyb-ta" rows="2" data-p4="sw" data-id="${id}" data-k="${x.k}">${esc(r[x.k] || '')}</textarea>`)).join('');
      return `<div class="gyb-case"><h4>${esc(ideaTitle(it))}</h4><div class="gyb-grid two">${q}</div>${rf}</div>`; };
    const cmp = sl.length > 1 ? `<h4>${X('مقارنة نوعية جنباً إلى جنب', 'Side-by-side qualitative comparison')}</h4><div class="gyb-cmp">${sl.map((id) => { const it = list.find((i) => i.id === id); const r = arrAt('swotAnalyses')[swIdx(id)] || {}; return `<div class="gyb-cmp-c"><b>${esc(ideaTitle(it))}</b><small>${X('المزايا', 'Advantages')}</small><p>${esc(r.advantages || '—')}</p><small>${X('العيوب', 'Disadvantages')}</small><p>${esc(r.disadvantages || '—')}</p></div>`; }).join('')}</div><p class="gyb-note">${esc(T(P4.compareNote))}</p>` : '';
    const act12 = card(X('3 · النشاط 12: تحليل SWOT', '3 · Activity 12: SWOT analysis'),
      `<p>${esc(T(P4.swotIntro))}</p>${tagBox('act12', 'p4')}${sl.length ? sl.map(swotCard).join('') + `<div data-o="cmp">${cmp}</div>` : emptyP4()}`, 'good');
    return head(T(p.title), T(p.lead)) + jump([['gyb-p4-a', D.B('الغربلة', 'Screening')], ['gyb-p4-b', D.B('النشاط 11', 'Act. 11')], ['gyb-p4-c', D.B('النشاط 12', 'Act. 12')]]) +
      `<div id="gyb-p4-a">${screen}</div><div id="gyb-p4-b">${act11}</div><div id="gyb-p4-c">${act12}</div>`;
  }

  function updatePart4() {
    if (!root) return;
    const sl = shortlist(); const fs = arrAt('fieldStudies'); const sw = arrAt('swotAnalyses');
    const t = (v) => String(v || '').trim();
    const fsOn = fs.filter((r) => sl.includes(r.ideaId));
    const swOn = sw.filter((r) => sl.includes(r.ideaId));
    const a11Any = fsOn.some((r) => t(r.needToFind) || (Array.isArray(r.interviews) && r.interviews.length));
    const a11Done = fsOn.some((r) => t(r.needToFind) && Array.isArray(r.interviews) && r.interviews.some((e) => isO(e) && t(e.who) && t(e.questions)));
    const a12Any = swOn.some((r) => ['s', 'w', 'o', 't', 'advantages', 'disadvantages'].some((k) => t(r[k])));
    const a12Done = swOn.some((r) => ['s', 'w', 'o', 't', 'advantages', 'disadvantages'].every((k) => t(r[k])));
    const prog = { act11: a11Done ? 'done' : a11Any ? 'inprogress' : '', act12: a12Done ? 'done' : a12Any ? 'inprogress' : '' };
    const part = byId('p4').part;
    part.items.forEach((it) => {
      if (!(it.id in prog)) return;
      if (stateOf(it) !== prog[it.id]) store.set('progress.' + it.id, prog[it.id]);
      root.querySelectorAll(`[data-o="${it.id}tag"]`).forEach((el) => { el.innerHTML = statusTag(it); });
    });
  }
  function onP4Input(el) {
    if (!el.dataset.p4) return false;
    const key = el.dataset.p4 === 'fs' ? 'fieldStudies' : 'swotAnalyses';
    const l = arrAt(key); const r = l.find((x) => x.ideaId === el.dataset.id);
    if (r) { r[el.dataset.k] = el.value; store.set(key, l); }
    updatePart4();
    if (key === 'swotAnalyses') { const box = root.querySelector('[data-o="cmp"]'); if (box && !box.contains(el)) { /* comparison refreshed on re-render */ } }
    return true;
  }
  ACT_EXTRA['sl-toggle'] = (el) => toggleShortlist(el.dataset.id);

  function renderPart(s) {
    const p = s.part;
    if (p.id === 'p1') return renderPart1(s);
    if (p.id === 'p2') return renderPart2(s);
    if (p.id === 'p3') return renderPart3(s);
    if (p.id === 'p4') return renderPart4(s);
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
    if (s.part && s.part.id === 'p1') updatePart1();
    if (s.part && (s.part.id === 'p2' || s.part.id === 'p3')) updatePartN();
    if (s.part && s.part.id === 'p4') updatePart4();
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
    'p1-fillcrit': () => {
      const r = readResponses();
      const ids = P1.areas.map((a) => a.id).filter((id) => r[id] === 'improve');
      if (!ids.length) { window.alert(X('لم تضع علامة «تحتاج تحسيناً» على أي مجال بعد.', 'You have not marked any area as "Needs improvement" yet.')); return; }
      root.querySelectorAll('[data-f="crit"]').forEach((b) => { b.checked = ids.includes(b.value); });
      store.set('readinessAssessment.criticalImprovementAreas', ids);
      updatePart1();
    },
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
      const word = X('مسح', 'ERASE');
      const typed = window.prompt(X('للتأكيد النهائي اكتب الكلمة: ', 'For final confirmation type the word: ') + word, '');
      if (typed === null || typed.trim().toLowerCase() !== word.toLowerCase()) { msg(X('لم يتم المسح: لم تُكتب كلمة التأكيد.', 'Nothing erased: the confirmation word was not typed.'), false); return; }
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
      const fn = ACT[b.dataset.act] || ACT_EXTRA[b.dataset.act]; if (fn) fn(b);
    });
    const SEL = '[data-f],[data-ent],[data-idea],[data-bs],[data-sb],[data-bf],[data-obs],[data-p4]';
    const dispatch = (el) => { if (onP4Input(el)) return; if (!onPartNInput(el)) onP1Input(el); if (el.dataset.ent && el.dataset.ent.startsWith('fieldStudies')) updatePart4(); };
    root.addEventListener('change', (e) => { if (e.target.matches('[data-act-file="import"]')) onFile(e.target); else if (e.target.matches(SEL)) dispatch(e.target); });
    root.addEventListener('input', (e) => { if (e.target.matches(SEL) && !e.target.matches('select,input[type=radio],input[type=checkbox]')) dispatch(e.target); });
    root.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-chip]')) { e.preventDefault(); addChip(e.target.dataset.chip, e.target); } });
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
