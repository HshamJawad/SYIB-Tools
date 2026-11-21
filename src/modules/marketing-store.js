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

  let data = null; let available = true; let timer = null; let lastSaved = null;

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

  /* ---------- backup / restore / reset (Stage 4) ---------- */
  const FORMAT = 'siyb-tools.iyb-marketing.backup';
  const BAD_KEYS = ['__proto__', 'constructor', 'prototype'];
  const MAX_BYTES = 2 * 1024 * 1024;
  const wrapFlush = flush;
  function leafOk(v, depth) {
    if (depth > 6) return false;
    if (typeof v === 'string') return v.length <= 50000;
    if (typeof v === 'boolean') return true;
    if (isObj(v)) return Object.keys(v).every((k) => !BAD_KEYS.includes(k) && leafOk(v[k], depth + 1));
    return false;
  }
  const hasData = () => {
    const d = ensure();
    const filled = (v) => (v && typeof v === 'object') ? Object.values(v).some(filled) : (v === true || (typeof v === 'string' && v.trim() !== ''));
    return filled(d.responses) || filled(d.progress) || (Array.isArray(d.actionPlan) && d.actionPlan.some(filled));
  };
  function exportJson() {
    wrapFlush(); const d = ensure(); d.language = (document.documentElement.lang === 'en') ? 'en' : 'ar';
    return JSON.stringify({ format: FORMAT, schemaVersion: SCHEMA, exportedAt: nowIso(), data: d }, null, 2);
  }
  // Validates a backup text WITHOUT changing anything. -> { ok, error?, data?, exportedAt? }
  function parseBackup(text) {
    if (typeof text !== 'string' || text.length > MAX_BYTES) return { ok: false, error: 'too-large' };
    let p; try { p = JSON.parse(text); } catch (_) { return { ok: false, error: 'invalid-json' }; }
    if (!isObj(p) || p.format !== FORMAT || !isObj(p.data)) return { ok: false, error: 'not-marketing-backup' };
    const d = p.data;
    if (d.moduleId !== 'marketing') return { ok: false, error: 'not-marketing-backup' };
    if (typeof d.schemaVersion !== 'number' || d.schemaVersion < 1 || d.schemaVersion > SCHEMA) return { ok: false, error: 'unsupported-version' };
    if (!isObj(d.progress) || !isObj(d.responses) || !Array.isArray(d.actionPlan)) return { ok: false, error: 'invalid-structure' };
    if (!Object.keys(d.progress).every((k) => !BAD_KEYS.includes(k)) || !leafOk(d.progress, 0) || !leafOk(d.responses, 0)) return { ok: false, error: 'invalid-structure' };
    if (d.actionPlan.length > 200 || !d.actionPlan.every((r) => isObj(r) && Object.keys(r).every((k) => ['what', 'how', 'who', 'when'].includes(k) && typeof r[k] === 'string' && r[k].length <= 20000))) return { ok: false, error: 'invalid-structure' };
    const clean = blank();
    clean.language = d.language === 'en' ? 'en' : (d.language === 'ar' ? 'ar' : null);
    clean.progress = Object.assign(blank().progress, d.progress);
    clean.responses = d.responses; clean.actionPlan = d.actionPlan;
    clean.lastCard = typeof d.lastCard === 'string' ? d.lastCard.slice(0, 20) : 'home';
    return { ok: true, data: clean, exportedAt: typeof p.exportedAt === 'string' ? p.exportedAt : null };
  }
  // Replaces the module data with an already validated backup. Keeps a safety copy of the previous data on this device.
  function applyBackup(parsed) {
    if (!parsed || !parsed.ok) return false;
    const ls = storage();
    if (ls && hasData()) { try { ls.setItem(KEY + '.beforeImport', JSON.stringify(ensure())); } catch (_) { /* best effort */ } }
    data = parsed.data; wrapFlush(); return true;
  }
  function reset() {
    clearTimeout(timer); timer = null; data = blank();
    const ls = storage(); try { if (ls) ls.removeItem(KEY); } catch (_) { /* ignore */ }
    lastSaved = null;
  }

  window.SIYBMarketingStore = {
    KEY, SCHEMA, FORMAT, get, set, hasData, exportJson, parseBackup, applyBackup, reset,
    flush() { const ok = wrapFlush(); if (ok) lastSaved = nowIso(); return ok; },
    status() { ensure(); return { available, lastSaved }; }
  };
})();
