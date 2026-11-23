/* IYB Planning data store – isolated, namespaced local persistence (Phase 1 foundation).
   - One key only: siyb.iyb.planning.v1 (never touches other modules' data or the language key).
   - Offline-first: localStorage; if unavailable the module keeps working in memory (status() reports it).
   - Non-destructive: unreadable stored data is copied to siyb.iyb.planning.v1.unreadable before starting fresh.
   - Stores learner data only – never manual content.
   - JSON import/export and the full persistence workflows arrive in Phase 7. */
(() => {
  'use strict';
  const KEY = 'siyb.iyb.planning.v1';
  const MODULE_ID = 'iyb-planning';
  const SCHEMA = 1;
  const nowIso = () => new Date().toISOString();
  const blank = () => ({
    schemaVersion: SCHEMA, moduleId: MODULE_ID, language: null,
    businessProfile: {}, objectives: [], activities: {}, assessments: {},
    businessAnalysis: { salesMarketing: {}, productionCosts: {}, profit: {} },
    externalForecasts: [], risks: [],
    plans: {
      salesMarketing: { monthly: [], sevenPs: {} }, productionCost: { monthly: [], improvements: [] },
      profit: { monthly: [] }, cashFlow: { monthly: [] }, loanAccess: {}
    },
    actionPlan: [], progress: {}, updatedAt: nowIso(), lastSection: 'home'
  });
  const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const storage = () => { try { return window.localStorage; } catch (_) { return null; } };

  let data = null; let available = true; let timer = null; let lastSaved = null;

  function load() {
    const ls = storage();
    if (!ls) { available = false; data = blank(); return data; }
    let raw = null;
    try { raw = ls.getItem(KEY); } catch (_) { available = false; data = blank(); return data; }
    if (!raw) { data = blank(); return data; }
    try {
      const p = JSON.parse(raw);
      if (!isObj(p) || p.moduleId !== MODULE_ID || typeof p.schemaVersion !== 'number' || p.schemaVersion > SCHEMA) throw new Error('shape');
      const b = blank();
      data = Object.assign(b, p);
      data.businessAnalysis = Object.assign(b.businessAnalysis, isObj(p.businessAnalysis) ? p.businessAnalysis : {});
      data.plans = Object.assign(b.plans, isObj(p.plans) ? p.plans : {});
      lastSaved = typeof p.updatedAt === 'string' ? p.updatedAt : null;
    } catch (_) {
      try { ls.setItem(KEY + '.unreadable', raw); } catch (__) { /* keep going */ }
      data = blank();
    }
    return data;
  }
  const ensure = () => data || load();
  function flush() {
    clearTimeout(timer); timer = null;
    const d = ensure(); d.updatedAt = nowIso(); d.language = (document.documentElement.lang === 'en') ? 'en' : 'ar';
    const ls = storage();
    if (!ls) { available = false; return false; }
    try { ls.setItem(KEY, JSON.stringify(d)); available = true; lastSaved = d.updatedAt; } catch (_) { available = false; return false; }
    return true;
  }
  const BAD = ['__proto__', 'constructor', 'prototype'];
  const get = (path, def) => {
    let o = ensure();
    for (const k of String(path).split('.')) { if (o == null || BAD.includes(k)) return def; o = o[k]; }
    return o === undefined ? def : o;
  };
  const set = (path, value) => {
    const keys = String(path).split('.');
    if (keys.some((k) => BAD.includes(k))) return;
    let o = ensure();
    keys.slice(0, -1).forEach((k) => { if (!isObj(o[k])) o[k] = {}; o = o[k]; });
    o[keys[keys.length - 1]] = value;
    clearTimeout(timer); timer = setTimeout(flush, 350);
  };
  function reset() {
    clearTimeout(timer); timer = null; data = blank(); lastSaved = null;
    const ls = storage(); try { if (ls) ls.removeItem(KEY); } catch (_) { /* ignore */ }
  }
  window.addEventListener('pagehide', () => { if (timer) flush(); });
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) flush(); });

  window.SIYBPlanningStore = {
    KEY, MODULE_ID, SCHEMA, get, set, reset, flush,
    status() { ensure(); return { available, lastSaved }; }
  };
})();
