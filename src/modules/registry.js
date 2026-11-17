/* SIYB Tools module registry.
   Each module registers: id, order (sidebar position), icon, title {ar,en}, the app modes it owns, and either
   - `navTemplate` + `defaultMode` (modules handled by the shell: Business Costing / Training), or
   - `external` { global, scripts, rootSelector, bodyClass, badge, defaultSection } for lazy-loaded modules that expose
     window[global].mount(host) / .open(sectionId) and build their own sub-menu into [data-nav-group="<mode>"].
   To add a future module: add a register() call (and its files to service-worker.js). */
(() => {
  'use strict';
  const modules = [];
  const registry = {
    register(def) { modules.push(def); modules.sort((a, b) => a.order - b.order); },
    list() { return modules.slice(); },
    get(id) { return modules.find((m) => m.id === id) || null; },
    byMode(mode) { return modules.find((m) => m.modes.includes(mode)) || null; }
  };

  registry.register({
    id: 'gyb', order: 1, icon: '✦',
    title: { ar: 'توليد فكرة مشروعك (GYB)', en: 'Generate Your Business Idea (GYB)' },
    modes: ['gyb'],
    external: {
      global: 'SIYBGyb', rootSelector: '#gybRoot', bodyClass: 'mode-gyb', badge: 'GYB', defaultSection: 'home',
      scripts: ['src/modules/gyb-store.js', 'src/modules/gyb-data.js', 'src/modules/gyb.js']
    }
  });
  registry.register({
    id: 'costing', order: 2, icon: '▦',
    title: { ar: 'احتساب التكاليف', en: 'Cost Calculation' },
    modes: ['business', 'training'], defaultMode: 'business', navTemplate: 'tplCostingNav'
  });
  registry.register({
    id: 'stock', order: 3, icon: '▤',
    title: { ar: 'المشتريات والمخزون', en: 'Purchasing & Stock' },
    modes: ['stock'],
    external: {
      global: 'SIYBStock', rootSelector: '#psRoot', bodyClass: 'mode-stock', badge: 'PS', defaultSection: 'home',
      scripts: ['src/modules/purchasing-stock-data.js', 'src/modules/purchasing-stock.js']
    }
  });

  window.SIYBModules = registry;
})();
