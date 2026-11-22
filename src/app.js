(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const scriptElement = document.currentScript;
  const APP_BASE = scriptElement && scriptElement.src
    ? new URL("../", scriptElement.src)
    : new URL("../", location.href);
  const assetUrl = (path) => new URL(path.replace(/^\.\//, ""), APP_BASE).href;

  let language = "ar";
  try { language = localStorage.getItem("siyb-language") === "en" ? "en" : "ar"; } catch (_) {}
  let activeMode = null;
  let costingScriptPromise = null;
  let waitingWorker = null;

  const toWesternDigits = (value) => String(value ?? "").replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit)).replace(/٫/g, ".").replace(/٬/g, ",");
  const toArabicDigits = (value) => String(value ?? "").replace(/[0-9]/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
  const localizeDigits = (value) => language === "ar" ? toArabicDigits(value) : toWesternDigits(value);

  window.SIYBParseNumber = (value) => {
    const normalized = toWesternDigits(value)
      .replace(/[٬,]/g, "")
      .replace(/[٫]/g, ".")
      .replace(/[−]/g, "-")
      .trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  function localizeNumericControl(control) {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) return;
    if (control.type === "number") {
      control.type = "text";
      control.inputMode = "decimal";
      control.dataset.siybNumeric = "true";
      control.setAttribute("autocomplete", "off");
    }
    if (document.activeElement === control) return;
    if (control.value && /[0-9٠-٩]/.test(control.value)) {
      control.value = localizeDigits(control.value);
    }
    if (control.placeholder && /[0-9٠-٩]/.test(control.placeholder)) {
      control.placeholder = localizeDigits(control.placeholder);
    }
  }

  function localizeTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    translateUiNode(node);
    if (!/[0-9٠-٩]/.test(node.nodeValue || "")) return;
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,noscript,code,pre,textarea,[contenteditable='true']")) return;
    const next = localizeDigits(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function refreshLocaleDigits(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) localizeTextNode(node);
    if (root.nodeType === Node.ELEMENT_NODE && root.matches("input,textarea")) localizeNumericControl(root);
    root.querySelectorAll?.("input,textarea").forEach(localizeNumericControl);
    translateUiTree(root);
  }
  window.SIYBRefreshLocaleDigits = refreshLocaleDigits;

  // Numeric fields keep the digits of the active language while focused and while typing
  // (Arabic-Indic digits in Arabic mode). Parsing accepts both digit sets (SIYBParseNumber),
  // and the replacement is 1:1 so the caret position is preserved.
  const isNumericControl = (control) => control instanceof HTMLInputElement && control.dataset.siybNumeric === "true";
  function relocalizeActiveControl(control) {
    const before = control.value;
    const next = localizeDigits(before);
    if (next === before) return;
    let start = null, end = null;
    try { start = control.selectionStart; end = control.selectionEnd; } catch (_) {}
    control.value = next;
    if (start !== null && control === document.activeElement) {
      try { control.setSelectionRange(start, end); } catch (_) {}
    }
  }
  document.addEventListener("focusin", (event) => {
    if (isNumericControl(event.target)) relocalizeActiveControl(event.target);
  });
  document.addEventListener("input", (event) => {
    if (isNumericControl(event.target)) relocalizeActiveControl(event.target);
  }, true);
  document.addEventListener("focusout", (event) => {
    const control = event.target;
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
      localizeNumericControl(control);
    }
  });

  const localeDigitObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "characterData") {
        localizeTextNode(record.target);
      } else {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) refreshLocaleDigits(node);
        });
      }
    });
  });
  localeDigitObserver.observe(document.documentElement, {subtree:true,childList:true,characterData:true});

  function t(key) {
    return (window.SIYB_TRANSLATIONS && window.SIYB_TRANSLATIONS[language] || {})[key] || key;
  }

  const uiTextMap=window.SIYB_UI_TEXT||{};
  const reverseUiTextMap=Object.fromEntries(Object.entries(uiTextMap).map(([ar,en])=>[en,ar]));
  const textKeys=Object.keys(uiTextMap).sort((x,y)=>y.length-x.length);
  const reverseTextKeys=Object.keys(reverseUiTextMap).sort((x,y)=>y.length-x.length);
  function translateUiText(value){
    let output=String(value??"");
    // Arabic-Indic digits are applied to the DOM in Arabic mode; normalize them first so
    // full-string dictionary keys (written with Western digits) still match when switching to English.
    if(language==="en")output=toWesternDigits(output);
    const map=language==="en"?uiTextMap:reverseUiTextMap;
    const keys=language==="en"?textKeys:reverseTextKeys;
    const exact=map[output.trim()];
    if(exact!==undefined){
      const leading=output.match(/^\\s*/)?.[0]||"",trailing=output.match(/\\s*$/)?.[0]||"";
      return leading+exact+trailing;
    }
    for(const key of keys)if(output.includes(key))output=output.split(key).join(map[key]);
    return output;
  }
  function translateUiNode(node){
    if(!node||node.nodeType!==Node.TEXT_NODE)return;
    const parent=node.parentElement;
    if(!parent||parent.closest("script,style,noscript,code,pre,[contenteditable='true']"))return;
    const next=translateUiText(node.nodeValue);
    if(next!==node.nodeValue)node.nodeValue=next;
  }
  function translateUiElement(element){
    if(!element||element.nodeType!==Node.ELEMENT_NODE)return;
    ["title","aria-label","placeholder","alt"].forEach(attr=>{
      if(element.hasAttribute(attr)){
        const oldValue=element.getAttribute(attr),next=translateUiText(oldValue);
        if(next!==oldValue)element.setAttribute(attr,next);
      }
    });
    if(element.matches("input:not([type='number']),textarea")&&element.value&&document.activeElement!==element){
      const next=translateUiText(element.value);if(next!==element.value)element.value=next;
    }
  }
  function translateUiTree(root=document.body){
    if(!root)return;
    if(root.nodeType===Node.TEXT_NODE)translateUiNode(root);
    else if(root.nodeType===Node.ELEMENT_NODE){
      translateUiElement(root);
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
      while((node=walker.nextNode()))translateUiNode(node);
      root.querySelectorAll?.("*").forEach(translateUiElement);
    }
  }
  window.SIYBTranslateText=translateUiText;

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ltr", language === "en");
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    translateUiTree(document.body);
    refreshLocaleDigits(document.body);
    const toggle = $("languageToggle");
    if (toggle) toggle.textContent = language === "ar" ? "EN" : "عربي";
    document.title = language === "ar" ? "أدوات ورش SIYB الرقمية" : "SIYB Digital Workshop Tools";
    renderWelcomeModes();
    window.dispatchEvent(new CustomEvent("siyb:languagechange", { detail: { language } }));
  }

  const REG = window.SIYBModules;
  const toolOf = (mode) => { const m = REG.byMode(mode); return m ? m.id : null; };
  const toolTitle = (tool) => { const m = REG.get(tool); return m ? m.title.ar : ""; };

  // Builds the sidebar tool blocks from the module registry (one block per registered module, in order).
  function renderSidebarTools() {
    const nav = $("globalSidebarNav");
    nav.innerHTML = "";
    const groupBodies = {};
    REG.list().forEach((m) => {
      const block = document.createElement("div");
      block.className = "sidebar-tool";
      block.dataset.tool = m.id;
      block.innerHTML =
        '<button type="button" class="sidebar-tool-head" data-tool-head="' + m.id + '" aria-expanded="false">' +
        '<span class="global-nav-icon">' + m.icon + '</span><span class="global-nav-label">' + m.title.ar + '</span>' +
        '<span class="sidebar-tool-chevron" aria-hidden="true"></span></button>' +
        '<div class="sidebar-tool-body" hidden></div>';
      const body = block.querySelector(".sidebar-tool-body");
      if (m.navTemplate) body.appendChild(document.getElementById(m.navTemplate).content.cloneNode(true));
      else {
        const group = document.createElement("section");
        group.className = "sidebar-nav-group";
        group.dataset.navGroup = m.modes[0];
        body.appendChild(group);
      }
      if (m.group && REG.group(m.group)) {
        if (!groupBodies[m.group]) {
          const g = REG.group(m.group);
          const wrap = document.createElement("div");
          wrap.className = "sidebar-group";
          wrap.dataset.group = m.group;
          wrap.innerHTML =
            '<button type="button" class="sidebar-group-head" data-group-head="' + m.group + '" aria-expanded="false">' +
            '<span class="global-nav-icon">' + g.icon + '</span><span class="global-nav-label">' + g.title.ar + '</span>' +
            '<span class="sidebar-tool-chevron" aria-hidden="true"></span></button>' +
            '<div class="sidebar-group-body" hidden></div>';
          nav.appendChild(wrap);
          groupBodies[m.group] = wrap.querySelector(".sidebar-group-body");
        }
        groupBodies[m.group].appendChild(block);
      } else nav.appendChild(block);
    });
  }

  // Welcome page cards: generated from the registry (one card per sidebar top-level entry, sub-tools as chips).
  function renderWelcomeModes() {
    const host = $("welcomeGuideModes");
    if (!host) return;
    const L = language === "en" ? "en" : "ar";
    const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const seen = {};
    let html = "";
    REG.list().forEach((m) => {
      const g = m.group && REG.group(m.group);
      if (g) {
        if (seen[m.group]) return;
        seen[m.group] = true;
        const kids = REG.list().filter((k) => k.group === m.group);
        html += '<div class="welcome-guide-mode welcome-guide-group"><strong><span aria-hidden="true">' + g.icon + '</span> ' + esc(g.title[L]) + '</strong>' +
          (g.desc ? '<p>' + esc(g.desc[L]) + '</p>' : '') + '<ul class="welcome-guide-subs">' +
          kids.map((k) => '<li><button type="button" class="welcome-guide-chip" data-welcome-tool="' + esc(k.id) + '">' + esc(k.title[L]) + '</button></li>').join("") +
          '</ul></div>';
      } else {
        html += '<div class="welcome-guide-mode"><strong><span aria-hidden="true">' + m.icon + '</span> ' + esc(m.title[L]) + '</strong>' +
          (m.desc ? '<p>' + esc(m.desc[L]) + '</p>' : '') +
          '<ul class="welcome-guide-subs"><li><button type="button" class="welcome-guide-chip" data-welcome-tool="' + esc(m.id) + '">' + (L === "en" ? "Open" : "افتح") + '</button></li></ul></div>';
      }
    });
    host.innerHTML = html;
    refreshLocaleDigits(host);
  }
  document.addEventListener("click", (event) => {
    const chip = event.target.closest && event.target.closest("[data-welcome-tool]");
    if (!chip) return;
    const def = REG.get(chip.dataset.welcomeTool);
    if (def) activateMode(def.external ? def.modes[0] : def.defaultMode, null, null, { keepDrawer: true });
  });

  function setGroupExpanded(groupEl, expanded) {
    groupEl.querySelector(".sidebar-group-body").hidden = !expanded;
    groupEl.querySelector(".sidebar-group-head").setAttribute("aria-expanded", String(expanded));
    groupEl.classList.toggle("open", expanded);
  }

  function setToolExpanded(tool, expanded) {
    const el = document.querySelector('[data-tool="' + tool + '"]');
    if (!el) return;
    el.querySelector(".sidebar-tool-body").hidden = !expanded;
    el.querySelector(".sidebar-tool-head").setAttribute("aria-expanded", String(expanded));
  }

  // Marks the active tool, expands its sub-menu and collapses the others (accordion).
  function setActiveTool(tool) {
    document.querySelectorAll("[data-tool]").forEach((el) => {
      const on = el.dataset.tool === tool;
      el.classList.toggle("active", on);
      setToolExpanded(el.dataset.tool, on);
    });
    document.querySelectorAll(".sidebar-group").forEach((g) => {
      const has = !!tool && !!g.querySelector('[data-tool="' + tool + '"]');
      g.classList.toggle("active", has);
      setGroupExpanded(g, has);
    });
    const name = $("topbarToolName");
    if (name) name.textContent = toolTitle(tool);
    const pill = $("topbarToolTitle");
    if (pill) pill.hidden = !tool;
    if (name && tool) translateUiTree(pill);
  }

  function setActiveNav(item) {
    document.querySelectorAll("[data-nav-item]").forEach((button) => {
      const active = button.dataset.navItem === item;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  // Match DACUM-Lite's responsive breakpoint: use a fixed sidebar on
  // layouts wider than 768 CSS px, and an off-canvas drawer on phones.
  // The short-landscape touch condition also handles phones/tablets rotated
  // horizontally without allowing CSS and JavaScript breakpoints to drift.
  const DRAWER_MEDIA_QUERY =
    "(max-width: 768px), (pointer: coarse) and (max-height: 520px) and (max-width: 1024px)";
  const drawerMedia = window.matchMedia(DRAWER_MEDIA_QUERY);
  function isDrawerMode() {
    return drawerMedia.matches;
  }

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open", "sidebar-locked");
    syncSidebarToggleState();
  }

  function toggleSidebar() {
    if (isDrawerMode()) {
      const isOpen = document.body.classList.toggle("sidebar-open");
      document.body.classList.toggle("sidebar-locked", isOpen);
    } else {
      document.body.classList.toggle("sidebar-collapsed");
    }
    syncSidebarToggleState();
  }

  async function ensureCostingScript() {
    if (typeof window.initBusinessCostingStudio === "function") return;
    if (!costingScriptPromise) {
      costingScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = assetUrl("src/modules/business-costing.js") + "?v=0.22.0";
        script.onload = resolve;
        script.onerror = () => reject(new Error("تعذر تحميل ملف JavaScript: " + script.src));
        document.body.appendChild(script);
      }).catch((error) => {
        costingScriptPromise = null;
        throw error;
      });
    }
    await costingScriptPromise;
    if (typeof window.initBusinessCostingStudio !== "function") {
      throw new Error("تم تحميل ملف JavaScript لكن دالة تهيئة أداة التكاليف غير موجودة.");
    }
  }

  let trainingScriptPromise = null;
  async function ensureTrainingScript() {
    if (window.SIYBTraining) return;
    if (!trainingScriptPromise) {
      trainingScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = assetUrl("src/modules/training.js") + "?v=0.22.0";
        script.onload = resolve;
        script.onerror = () => reject(new Error("تعذر تحميل ملف JavaScript: " + script.src));
        document.body.appendChild(script);
      }).catch((error) => {
        trainingScriptPromise = null;
        throw error;
      });
    }
    await trainingScriptPromise;
  }

  // External (lazy-loaded) modules registered with an `external` descriptor: gyb, stock, future modules.
  const externalScripts = {};
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = assetUrl(src) + "?v=0.22.0";
      script.async = false; // download in parallel, execute in insertion order
      script.onload = resolve;
      script.onerror = () => reject(new Error("تعذر تحميل ملف JavaScript: " + script.src));
      document.body.appendChild(script);
    });
  }
  async function ensureExternalScripts(def) {
    const ext = def.external;
    if (window[ext.global]) return;
    if (!externalScripts[def.id]) {
      externalScripts[def.id] = Promise.all(ext.scripts.map(loadScript))
        .catch((error) => { externalScripts[def.id] = null; throw error; });
    }
    await externalScripts[def.id];
  }

  async function loadExternalModule(def, sectionId) {
    setGlobalExportActionsVisible(false);
    const host = $("workspaceContent");
    $("welcomeScreen").hidden = true;
    $("workspace").hidden = false;
    try {
      await ensureExternalScripts(def);
      const api = window[def.external.global];
      if (!host.querySelector(def.external.rootSelector)) api.mount(host);
      api.open(sectionId || (typeof api.current === "function" && api.current()) || def.external.defaultSection);
    } catch (error) {
      console.error(def.id + " module loading failed:", error);
      host.innerHTML = '<div class="workspace-error"><strong>تعذر تحميل الوحدة</strong><p dir="ltr">' +
        String(error && error.message || error).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])) + '</p></div>';
    }
  }

  function setGlobalExportActionsVisible(visible) {
    const actions = $("globalExportActions");
    if (actions) actions.hidden = !visible;
  }

  async function loadCostingModule(mode, exampleKey) {
    setGlobalExportActionsVisible(false);
    const host = $("workspaceContent");
    $("welcomeScreen").hidden = true;
    $("workspace").hidden = false;
    host.innerHTML = '<div class="workspace-loading"><span class="loading-spinner"></span><strong>جارٍ تحميل أداة احتساب التكاليف...</strong></div>';

    document.body.classList.toggle("mode-training", mode === "training");

    if (mode === "training") {
      try {
        await ensureTrainingScript();
        const key = window.SIYBTraining.exercises.includes(exampleKey) ? exampleKey : "overheadExercise";
        host.innerHTML = '<div id="costingModuleRoot" class="costing-tool training-root"><main class="costing-content"><div id="trainingMount"></div></main></div>';
        window.SIYBTraining.mount($("trainingMount"), key);
        translateUiTree(host);
        refreshLocaleDigits(host);
      } catch (error) {
        console.error("Training Mode loading failed:", error);
        host.innerHTML = '<div class="workspace-error"><strong>تعذر تحميل التمرين</strong><p dir="ltr">' +
          String(error && error.message || error).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])) + '</p></div>';
      }
      return;
    }

    try {
      const htmlUrl = assetUrl("src/modules/business-costing.html");
      const response = await fetch(htmlUrl + "?v=0.22.0");
      if (!response.ok) throw new Error("تعذر تحميل ملف HTML: " + response.status + " — " + htmlUrl);

      host.innerHTML = await response.text();
      translateUiTree(host);
      await ensureCostingScript();
      window.initBusinessCostingStudio();

      const select = $("exampleSelect");
      const targetExample = exampleKey || (mode === "training" ? "overheadExercise" : "textile");
      if (select && select.value !== targetExample) {
        select.value = targetExample;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (select) select.addEventListener("change", () => {
        setActiveNav(select.value === "overheadExercise" ? "business-overhead" : "business-" + select.value);
      });
      translateUiTree(host);
      refreshLocaleDigits(host);
      setGlobalExportActionsVisible(true);
    } catch (error) {
      setGlobalExportActionsVisible(false);
      console.error("Business Costing Studio loading failed:", error);
      const message = String(error && error.message || error);
      host.innerHTML = '<div class="workspace-error"><strong>تعذر تحميل الأداة</strong><p dir="ltr">' +
        message.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])) +
        '</p></div>';
    }
  }

  async function activateMode(mode, example, navId, opts) {
    if (!REG.byMode(mode)) return;
    const keepDrawer = !!(opts && opts.keepDrawer);
    activeMode = mode;
    document.body.classList.toggle("mode-training", mode === "training");
    REG.list().forEach((m) => { if (m.external) document.body.classList.toggle(m.external.bodyClass, m.modes.includes(mode)); });
    setActiveTool(toolOf(mode));
    if (!keepDrawer) closeMobileSidebar();

    const ext = REG.byMode(mode);
    if (ext && ext.external) {
      $("workspaceBadgeNumber").textContent = ext.external.badge;
      await loadExternalModule(ext, example);
      translateUiTree($("workspaceContent"));
      return;
    }

    if (mode === "business") {
      $("workspaceTitle").textContent = "احتساب تكاليف";
      $("workspaceDescription").textContent = "احتساب تكلفة المنتجات وتوزيع النفقات غير المباشرة والعامة وفق منهجية الكتيب.";
      $("workspaceBadgeNumber").textContent = "01";
      $("workspaceBadgeLabel").textContent = "الوحدة الأولى";
      setActiveNav(navId || "business-textile");
      await loadCostingModule(mode, example || "textile");
    } else {
      $("workspaceTitle").textContent = "تمارين احتساب التكاليف";
      $("workspaceDescription").textContent = "أدخل حساباتك بنفسك، تحقق من إجاباتك، وراجع خطوات الحل الصحيحة. يمكن للمدرب عرض الحل النموذجي وتوليد أرقام جديدة لكل مجموعة.";
      $("workspaceBadgeNumber").textContent = "T";
      $("workspaceBadgeLabel").textContent = "التدريب العملي";
      setActiveNav(navId || "training-overhead");
      await loadCostingModule(mode, example || "overheadExercise");
    }
    translateUiTree($("workspaceTitle").parentElement);
    translateUiTree($("workspaceBadgeNumber").parentElement);
  }

  // Warm module code before the click: on pointer-over/touch, and when the browser is idle.
  function prewarm(def) {
    if (!def) return;
    if (def.external) ensureExternalScripts(def).catch(() => {});
    else if (def.id === "costing") { ensureCostingScript().catch(() => {}); }
  }
  $("globalSidebarNav").addEventListener("pointerover", (event) => {
    const head = event.target.closest && event.target.closest(".sidebar-tool-head");
    if (head) prewarm(REG.get(head.dataset.toolHead));
  });
  $("globalSidebarNav").addEventListener("pointerdown", (event) => {
    const head = event.target.closest && event.target.closest(".sidebar-tool-head");
    if (head) prewarm(REG.get(head.dataset.toolHead));
  });
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  window.addEventListener("load", () => idle(() => REG.list().forEach(prewarm)));

  $("globalSidebarNav").addEventListener("click", (event) => {
    const gHead = event.target.closest(".sidebar-group-head");
    if (gHead) {
      const g = gHead.parentElement;
      setGroupExpanded(g, g.querySelector(".sidebar-group-body").hidden);
      return;
    }
    const head = event.target.closest(".sidebar-tool-head");
    if (head) {
      const tool = head.dataset.toolHead;
      if (tool !== toolOf(activeMode)) {
        // Open the tool's default page; keep the drawer open on phones so its sub-menu is visible.
        const def = REG.get(tool);
        activateMode(def.external ? def.modes[0] : def.defaultMode, null, null, { keepDrawer: true });
      } else {
        const body = head.parentElement.querySelector(".sidebar-tool-body");
        setToolExpanded(tool, body.hidden);
      }
      return;
    }
    const button = event.target.closest("[data-nav-item]");
    if (!button) return;
    const group = button.closest("[data-nav-group]");
    const mode = group && group.dataset.navGroup;
    const def = REG.byMode(mode);
    if (def && def.external) activateMode(mode, button.dataset.section || button.dataset.stock, null);
    else if (def) activateMode(mode, button.dataset.example, button.dataset.navItem);
  });

  function syncSidebarToggleState() {
    const toggle = $("sidebarToggle");
    if (!toggle) return;
    const expanded = isDrawerMode()
      ? document.body.classList.contains("sidebar-open")
      : !document.body.classList.contains("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", String(expanded));
  }

  function handleResponsiveModeChange() {
    // A drawer must not remain open after crossing into the desktop layout.
    if (!isDrawerMode()) {
      document.body.classList.remove("sidebar-open", "sidebar-locked");
    }
    syncSidebarToggleState();
  }

  $("sidebarToggle").addEventListener("click", toggleSidebar);
  $("sidebarCollapse").addEventListener("click", () => {
    if (isDrawerMode()) {
      closeMobileSidebar();
    } else {
      document.body.classList.toggle("sidebar-collapsed");
      syncSidebarToggleState();
    }
  });
  $("globalSidebarBackdrop").addEventListener("click", closeMobileSidebar);
  window.addEventListener("resize", handleResponsiveModeChange);
  if (drawerMedia.addEventListener) {
    drawerMedia.addEventListener("change", handleResponsiveModeChange);
  } else if (drawerMedia.addListener) {
    drawerMedia.addListener(handleResponsiveModeChange);
  }

$("globalPDFButton").addEventListener("click", () => {
    if (typeof window.exportPDF === "function") {
      window.exportPDF();
    } else {
      console.warn("PDF export is not available until a costing module is loaded.");
    }
  });

  $("globalExcelButton").addEventListener("click", () => {
    if (typeof window.exportXLSX === "function") {
      window.exportXLSX();
    } else {
      console.warn("Excel export is not available until a costing module is loaded.");
    }
  });

  $("languageToggle").addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    try { localStorage.setItem("siyb-language", language); } catch (_) {}
    applyLanguage();
  });

  renderSidebarTools();
  applyLanguage();
  setActiveTool(null);
  syncSidebarToggleState();


  function showUpdateBanner() {
    const banner = $("updateBanner");
    if (banner) banner.hidden = false;
  }

  function setupServiceWorkerUpdates(registration) {
    if (!registration) return;
    if (registration.waiting && navigator.serviceWorker.controller) {
      waitingWorker = registration.waiting;
      showUpdateBanner();
    }
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          waitingWorker = installing;
          showUpdateBanner();
        }
      });
    });
  }

  const updateButton = $("applyUpdateButton");
  if (updateButton) updateButton.addEventListener("click", () => {
    if (waitingWorker) waitingWorker.postMessage({ type: "SIYB_SKIP_WAITING" });
  });
  const dismissUpdateButton = $("dismissUpdateButton");
  if (dismissUpdateButton) dismissUpdateButton.addEventListener("click", () => {
    const banner = $("updateBanner");
    if (banner) banner.hidden = true;
  });

  /* Number steppers: small up/down arrows for numeric inputs (works with Arabic digits) */
  const STEPPER_SELECTOR = 'input[data-siyb-numeric="true"]:not([disabled]):not([readonly]):not(.tseed-input):not([data-no-stepper])';

  function decimalsOf(value) {
    const text = toWesternDigits(value).replace(/[٬,]/g, "").replace(/[٫]/g, ".").trim();
    const dot = text.indexOf(".");
    return dot < 0 ? 0 : Math.min(2, text.length - dot - 1);
  }

  function stepInput(input, direction) {
    if (input.disabled || input.readOnly) return;
    const raw = input.value;
    const current = window.SIYBParseNumber(raw);
    const decimals = input.dataset.step ? decimalsOf(input.dataset.step) : decimalsOf(raw);
    const step = input.dataset.step ? Number(input.dataset.step) || 1 : (decimals > 0 ? Math.pow(10, -decimals) : 1);
    const min = input.dataset.min !== undefined ? Number(input.dataset.min) : 0;
    let next = Math.round((current + direction * step) / step) * step;
    if (Number.isFinite(min) && next < min) next = min;
    input.value = next.toFixed(decimals);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    relocalizeActiveControl(input);
    localizeNumericControl(input);
  }

  function attachStepper(input) {
    if (input.dataset.stepperReady || !input.parentNode) return;
    input.dataset.stepperReady = "1";
    const wrap = document.createElement("span");
    wrap.className = "num-stepper";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const make = (cls, glyph, direction) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.tabIndex = -1;
      btn.className = "num-step " + cls;
      btn.textContent = glyph;
      btn.setAttribute("aria-label", direction > 0 ? (language === "ar" ? "زيادة" : "Increase") : (language === "ar" ? "إنقاص" : "Decrease"));
      let timer = null, repeat = null;
      const stop = () => { clearTimeout(timer); clearInterval(repeat); };
      btn.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        stepInput(input, direction);
        timer = setTimeout(() => { repeat = setInterval(() => stepInput(input, direction), 90); }, 450);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((name) => btn.addEventListener(name, stop));
      btn.addEventListener("click", (event) => event.preventDefault());
      return btn;
    };
    wrap.appendChild(make("num-step-up", "", 1));
    wrap.appendChild(make("num-step-down", "", -1));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") { event.preventDefault(); stepInput(input, 1); }
      else if (event.key === "ArrowDown") { event.preventDefault(); stepInput(input, -1); }
    });
  }

  let stepperScheduled = false;
  function scanSteppers() {
    stepperScheduled = false;
    document.querySelectorAll(STEPPER_SELECTOR).forEach(attachStepper);
  }
  function scheduleStepperScan() {
    if (stepperScheduled) return;
    stepperScheduled = true;
    requestAnimationFrame(scanSteppers);
  }
  new MutationObserver(scheduleStepperScan).observe(document.body, { childList: true, subtree: true });
  scheduleStepperScan();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (window.__siybReloadingForUpdate) return;
      window.__siybReloadingForUpdate = true;
      window.location.reload();
    });
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SIYB_APP_UPDATED") showUpdateBanner();
    });
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(assetUrl("service-worker.js"), { scope: APP_BASE.pathname })
        .then((registration) => {
          setupServiceWorkerUpdates(registration);
          registration.update().catch(() => {});
        })
        .catch((error) => console.error("Service worker registration failed:", error));
    });
  }
})();
