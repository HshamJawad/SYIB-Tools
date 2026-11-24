/* SIYB Tools module registry.
   Each module registers: id, order (sidebar position), icon, title {ar,en}, the app modes it owns, and either
   - `navTemplate` + `defaultMode` (modules handled by the shell: Business Costing / Training), or
   - `external` { global, scripts, rootSelector, bodyClass, badge, defaultSection } for lazy-loaded modules that expose
     window[global].mount(host) / .open(sectionId) and build their own sub-menu into [data-nav-group="<mode>"].
   To add a future module: add a register() call (and its files to service-worker.js). */
(() => {
  'use strict';
  const modules = [];
  // Sidebar groups: modules with `group: '<id>'` are shown together under one heading (their own sub-menus are unchanged).
  const groups = { iyb: { icon: '▣', title: { ar: 'حسّن مشروعك (IYB)', en: 'Improve Your Business (IYB)' }, desc: { ar: 'أدوات إدارة المشروع القائم: التكاليف والمشتريات والمخزون والتسويق.', en: 'Tools for running an existing business: costs, purchasing and stock, marketing.' } } };
  const registry = {
    register(def) { modules.push(def); modules.sort((a, b) => a.order - b.order); },
    list() { return modules.slice(); },
    group(id) { return groups[id] || null; },
    get(id) { return modules.find((m) => m.id === id) || null; },
    byMode(mode) { return modules.find((m) => m.modes.includes(mode)) || null; }
  };

  registry.register({
    id: 'gyb', order: 1, icon: '✦',
    desc: { ar: 'أنشطة وتمارين لتوليد فكرة مشروعك وتقييمها واختيار الأنسب.', en: 'Activities and exercises to generate, assess and choose your business idea.' },
    title: { ar: 'توليد فكرة مشروعك (GYB)', en: 'Generate Your Business Idea (GYB)' },
    modes: ['gyb'],
    external: {
      global: 'SIYBGyb', rootSelector: '#gybRoot', bodyClass: 'mode-gyb', badge: 'GYB', defaultSection: 'home',
      scripts: ['src/modules/gyb-store.js', 'src/modules/gyb-data.js', 'src/modules/gyb.js']
    }
  });
  registry.register({
    id: 'costing', order: 2, icon: '▦', group: 'iyb',
    desc: { ar: 'أدوات وأمثلة لاحتساب تكاليف مشروعك، وتمارين تطبيقية على خطوات الاحتساب.', en: 'Tools and examples to calculate your business costs, with practical exercises.' },
    title: { ar: 'احتساب التكاليف', en: 'Cost Calculation' },
    modes: ['business', 'training'], defaultMode: 'business', navTemplate: 'tplCostingNav'
  });
  registry.register({
    id: 'stock', order: 3, icon: '▤', group: 'iyb',
    desc: { ar: 'خطوات الشراء وبطاقات المخزون والجرد وإدارة علاقات المزوّدين، مع أنشطة وتمارين.', en: 'Purchasing steps, stock cards, stocktaking and supplier relations, with activities.' },
    title: { ar: 'المشتريات والمخزون', en: 'Purchasing & Stock' },
    modes: ['stock'],
    external: {
      global: 'SIYBStock', rootSelector: '#psRoot', bodyClass: 'mode-stock', badge: 'PS', defaultSection: 'home',
      scripts: ['src/modules/purchasing-stock-data.js', 'src/modules/purchasing-stock.js']
    }
  });
  registry.register({
    id: 'marketing', order: 4, icon: '◉', group: 'iyb',
    desc: { ar: 'البطاقات الثماني للتسويق: السوق والمنافسون والمنتج والسعر والترويج وخطة التسويق.', en: 'The eight marketing cards: market, competitors, product, price, promotion and plan.' },
    title: { ar: 'التسويق', en: 'Marketing' },
    modes: ['marketing'],
    external: {
      global: 'SIYBMarketing', rootSelector: '#mkRoot', bodyClass: 'mode-marketing', badge: 'MK', defaultSection: 'home',
      scripts: ['src/modules/marketing-store.js', 'src/modules/marketing-data.js', 'src/modules/marketing-content-a.js', 'src/modules/marketing-content-b.js', 'src/modules/marketing-content-c.js', 'src/modules/marketing-content-d.js', 'src/modules/marketing-assess-a.js', 'src/modules/marketing-assess-b.js', 'src/modules/marketing-card8.js', 'src/modules/marketing-glossary.js', 'src/modules/marketing.js']
    }
  });

  registry.register({
    id: 'planning', order: 5, icon: '▨', group: 'iyb',
    desc: { ar: 'خمسة أجزاء وخمس خطط: التحليل والتوقع والمخاطر والمبيعات والإنتاج والأرباح والتدفق النقدي والقروض.', en: 'Five parts and five plans: analysis, forecasting, risk, sales, production, profit, cash flow and loans.' },
    title: { ar: 'التخطيط لمشروعك', en: 'Planning for Your Business' },
    modes: ['planning'],
    external: {
      global: 'SIYBPlanning', rootSelector: '#pypRoot', bodyClass: 'mode-planning', badge: 'PL', defaultSection: 'home',
      scripts: ['src/modules/planning-store.js', 'src/modules/planning-data.js', 'src/modules/planning-calc.js', 'src/modules/planning-assess.js', 'src/modules/planning-content-a.js', 'src/modules/planning-content-b.js', 'src/modules/planning-learn.js', 'src/modules/planning.js']
    }
  });

  window.SIYBModules = registry;
})();
