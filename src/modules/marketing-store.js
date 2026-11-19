/* IYB Marketing data store – isolated, namespaced local persistence (Stage 1 foundation).
   - One key only: siyb.iyb.marketing.v1 (never touches other modules' data or the language key).
   - Offline-first: localStorage; if unavailable the module keeps working in memory (status() reports it).
   - Non-destructive: unreadable stored data is copied to siyb.iyb.marketing.v1.unreadable before starting fresh.
   - Stores learner data only (progress, responses, actionPlan) – never manual content.
   - JSON import/export, reset UI and the full persistence workflows arrive in a later stage. */
(() => {
  'use strict';
  const KEY = 'siyb.iyb.marketing.v1';
  const SCHEMA = 1;
  const nowIso = () => new Date().toISOString();
  const blank = () => ({
    schemaVersion: SCHEMA, moduleId: 'marketing', language: null,
    progress: { cards: {}, parts: {}, activities: {}, assessments: {} },
    responses: {}, actionPlan: [], updatedAt: nowIso(), lastCard: 'home'
  });
  const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const storage = () => { try { return window.localStorage; } catch (_) { return null; } };

  let data = null; let available = true; let timer = null;

  function load() {
    const ls = storage();
    if (!ls) { available = false; data = blank(); return data; }
    let raw = null;
    try { raw = ls.getItem(KEY); } catch (_) { available = false; data = blank(); return data; }
    if (!raw) { data = blank(); return data; }
    try {
      const p = JSON.parse(raw);
      if (!isObj(p) || p.moduleId !== 'marketing' || typeof p.schemaVersion !== 'number' || p.schemaVersion > SCHEMA) throw new Error('shape');
      data = Object.assign(blank(), p);
      data.progress = Object.assign(blank().progress, isObj(p.progress) ? p.progress : {});
    } catch (_) {
      try { ls.setItem(KEY + '.unreadable', raw); } catch (__) { /* keep going */ }
      data = blank();
    }
    return data;
  }
  const ensure = () => data || load();
  function flush() {
    clearTimeout(timer); timer = null;
    const d = ensure(); d.updatedAt = nowIso();
    const ls = storage();
    if (!ls) { available = false; return false; }
    try { ls.setItem(KEY, JSON.stringify(d)); available = true; } catch (_) { available = false; return false; }
    return true;
  }
  const get = (path, def) => {
    let o = ensure();
    for (const k of String(path).split('.')) { if (o == null) return def; o = o[k]; }
    return o === undefined ? def : o;
  };
  const set = (path, value) => {
    const keys = String(path).split('.'); let o = ensure();
    keys.slice(0, -1).forEach((k) => { if (!isObj(o[k])) o[k] = {}; o = o[k]; });
    o[keys[keys.length - 1]] = value;
    clearTimeout(timer); timer = setTimeout(flush, 350);
  };
  window.addEventListener('pagehide', () => { if (timer) flush(); });
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) flush(); });

  window.SIYBMarketingStore = { KEY, SCHEMA, get, set, flush, status() { ensure(); return { available }; } };
})();
