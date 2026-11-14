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

  const toWesternDigits = (value) => String(value ?? "").replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
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

  document.addEventListener("focusin", (event) => {
    const control = event.target;
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
      if (control.dataset.siybNumeric === "true" || /[٠-٩]/.test(control.value || "")) {
        control.value = toWesternDigits(control.value);
      }
    }
  });
  document.addEventListener("input", (event) => {
    const control = event.target;
    if (control instanceof HTMLInputElement && (control.dataset.siybNumeric === "true" || /[٠-٩]/.test(control.value || ""))) {
      const start = control.selectionStart;
      const before = control.value;
      control.value = toWesternDigits(before);
      if (start !== null && control === document.activeElement) {
        const delta = before.length - control.value.length;
        try { control.setSelectionRange(Math.max(0, start - delta), Math.max(0, start - delta)); } catch (_) {}
      }
    }
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
    const eyebrow = $("workspaceEyebrow");
    if (eyebrow && activeMode) {
      eyebrow.textContent = language === "ar"
        ? (activeMode === "training" ? "وضع التدريب" : "وضع إدارة الأعمال")
        : (activeMode === "training" ? "TRAINING MODE" : "BUSINESS TOOLS");
    }
    document.title = language === "ar" ? "أدوات ورش SIYB الرقمية" : "SIYB Digital Workshop Tools";
  }

  function setActiveModeButton(mode) {
    document.querySelectorAll("[data-mode]").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setSidebarGroup(mode) {
    document.querySelectorAll("[data-nav-group]").forEach((group) => {
      group.hidden = group.dataset.navGroup !== mode;
    });
    $("sidebarEmptyState").hidden = !!mode;
    $("sidebarContextTitle").textContent = mode === "business"
      ? "وضع إدارة الأعمال"
      : mode === "training" ? "وضع التدريب" : "اختر وضعاً من الشريط العلوي";
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
        script.src = assetUrl("src/modules/business-costing.js") + "?v=0.4.4";
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
        script.src = assetUrl("src/modules/training.js") + "?v=0.4.4";
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
      const response = await fetch(htmlUrl, { cache: "no-store" });
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

  async function activateMode(mode) {
    if (mode !== "business" && mode !== "training") return;
    activeMode = mode;
    document.body.classList.toggle("mode-training", mode === "training");
    setActiveModeButton(mode);
    setSidebarGroup(mode);
    closeMobileSidebar();

    if (mode === "business") {
      $("workspaceEyebrow").textContent = language === "ar" ? "وضع إدارة الأعمال" : "BUSINESS TOOLS";
      $("workspaceTitle").textContent = "احتساب تكاليف";
      $("workspaceDescription").textContent = "احتساب تكلفة المنتجات وتوزيع النفقات غير المباشرة والعامة وفق منهجية الكتيب.";
      $("workspaceBadgeNumber").textContent = "01";
      $("workspaceBadgeLabel").textContent = "الوحدة الأولى";
      setActiveNav("business-textile");
      await loadCostingModule(mode, "textile");
    } else {
      $("workspaceEyebrow").textContent = language === "ar" ? "وضع التدريب" : "TRAINING MODE";
      $("workspaceTitle").textContent = "تمارين احتساب التكاليف";
      $("workspaceDescription").textContent = "أدخل حساباتك بنفسك، تحقق من إجاباتك، وراجع خطوات الحل الصحيحة. يمكن للمدرب عرض الحل النموذجي وتوليد أرقام جديدة لكل مجموعة.";
      $("workspaceBadgeNumber").textContent = "T";
      $("workspaceBadgeLabel").textContent = "التدريب العملي";
      setActiveNav("training-overhead");
      await loadCostingModule(mode, "overheadExercise");
    }
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => activateMode(button.dataset.mode));
  });

  $("globalSidebarNav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-nav-item]");
    if (!button || !activeMode) return;
    setActiveNav(button.dataset.navItem);
    if (activeMode === "business") {
      loadCostingModule("business", button.dataset.example || "textile");
    } else {
      loadCostingModule("training", button.dataset.example || "overheadExercise");
    }
    closeMobileSidebar();
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

  applyLanguage();
  setSidebarGroup(null);
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
