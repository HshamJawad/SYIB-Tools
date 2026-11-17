/* GYB data store – isolated, namespaced local persistence for the "Generate Your Business Idea" module.
   - One key only: siyb.gyb.v1 (never touches other modules' data or the language key).
   - Offline-first: localStorage; if it is unavailable (private mode / blocked) the module keeps working in memory.
   - Non-destructive: unreadable stored data is copied to siyb.gyb.v1.unreadable before starting fresh.
   - Data shape follows the FRS conceptual model (schemaVersion 1). */
(() => {
  'use strict';
  const KEY = 'siyb.gyb.v1';
  const BACKUP_FORMAT = 'siyb-tools.gyb.backup';
  const SCHEMA = 1;

  const nowIso = () => new Date().toISOString();
  const blank = () => ({
    schemaVersion: SCHEMA,
    learnerProfile: { preferredLanguage: null, createdAt: nowIso(), updatedAt: nowIso(), lastSection: 'home' },
    readinessAssessment: { responses: {}, strengthsCount: 0, improvementCount: 0, criticalImprovementAreas: [] },
    businessProfile: { fieldsOfInterest: [], businessTypes: [], experienceSkillsNetworks: [] },
    ideas: [],
    activities: {
      successfulBusinessOwners: [], experienceToIdeas: [], localMarketSurvey: {},
      environmentalScanning: {}, brainstormingSessions: [], structuredBrainstorming: []
    },
    screening: { shortlistedIdeaIds: [] },
    fieldStudies: [], swotAnalyses: [], selectedIdeaId: '',
    finalIdeaProfile: {}, actionPlan: [], knowledgeChecks: [], progress: {}
  });

  let data = null;
  let available = true;
  let lastSaved = null;
  let timer = null;
  const listeners = [];

  const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const storage = () => { try { return window.localStorage; } catch (_) { return null; } };

  function load() {
    const ls = storage();
    if (!ls) { available = false; data = blank(); return data; }
    let raw = null;
    try { raw = ls.getItem(KEY); } catch (_) { available = false; data = blank(); return data; }
    if (!raw) { data = blank(); return data; }
    try {
      const parsed = JSON.parse(raw);
      if (!isObj(parsed) || typeof parsed.schemaVersion !== 'number') throw new Error('shape');
      if (parsed.schemaVersion > SCHEMA) throw new Error('newer');
      // Fill any missing top-level keys (forward-compatible with additions) without discarding what exists.
      data = Object.assign(blank(), parsed);
      data.learnerProfile = Object.assign(blank().learnerProfile, parsed.learnerProfile || {});
    } catch (_) {
      try { ls.setItem(KEY + '.unreadable', raw); } catch (__) { /* keep going */ }
      data = blank();
    }
    return data;
  }

  function ensure() { return data || load(); }

  function flush() {
    clearTimeout(timer); timer = null;
    const d = ensure();
    d.learnerProfile.updatedAt = nowIso();
    const ls = storage();
    if (!ls) { available = false; return false; }
    try { ls.setItem(KEY, JSON.stringify(d)); available = true; lastSaved = d.learnerProfile.updatedAt; }
    catch (_) { available = false; return false; }
    listeners.forEach((fn) => { try { fn('saved'); } catch (_) { /* ignore */ } });
    return true;
  }
  function scheduleSave() { clearTimeout(timer); timer = setTimeout(flush, 350); }

  const get = (path, def) => {
    let o = ensure();
    for (const k of String(path).split('.')) { if (o == null) return def; o = o[k]; }
    return o === undefined ? def : o;
  };
  const set = (path, value) => {
    const keys = String(path).split('.');
    let o = ensure();
    keys.slice(0, -1).forEach((k) => { if (!isObj(o[k]) && !Array.isArray(o[k])) o[k] = {}; o = o[k]; });
    o[keys[keys.length - 1]] = value;
    scheduleSave();
  };

  function exportJson() {
    flush();
    return JSON.stringify({ format: BACKUP_FORMAT, schemaVersion: SCHEMA, exportedAt: nowIso(), data: ensure() }, null, 2);
  }

  // Replaces the module's data with a validated backup. Returns { ok, error }.
  function importJson(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { return { ok: false, error: 'invalid-json' }; }
    if (!isObj(parsed) || parsed.format !== BACKUP_FORMAT || !isObj(parsed.data)) return { ok: false, error: 'not-gyb-backup' };
    if (typeof parsed.data.schemaVersion !== 'number' || parsed.data.schemaVersion > SCHEMA) return { ok: false, error: 'unsupported-version' };
    data = Object.assign(blank(), parsed.data);
    data.learnerProfile = Object.assign(blank().learnerProfile, parsed.data.learnerProfile || {});
    flush();
    return { ok: true };
  }

  function reset() {
    data = blank();
    clearTimeout(timer); timer = null;
    const ls = storage();
    try { if (ls) ls.removeItem(KEY); } catch (_) { /* ignore */ }
    lastSaved = null;
    listeners.forEach((fn) => { try { fn('reset'); } catch (_) { /* ignore */ } });
  }

  window.addEventListener('pagehide', () => { if (timer) flush(); });
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) flush(); });

  window.SIYBGybStore = {
    KEY, SCHEMA, get, set, flush, exportJson, importJson, reset,
    onChange(fn) { listeners.push(fn); },
    status() { ensure(); return { available, lastSaved }; }
  };
})();
