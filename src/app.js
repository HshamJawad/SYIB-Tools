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

  function t(key) {
    return (window.SIYB_TRANSLATIONS && window.SIYB_TRANSLATIONS[language] || {})[key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ltr", language === "en");
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    const toggle = $("languageToggle");
    if (toggle) toggle.textContent = language === "ar" ? "EN" : "ع";
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
        script.src = assetUrl("src/modules/business-costing.js") + "?v=0.3.12";
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

    try {
      const htmlUrl = assetUrl("src/modules/business-costing.html");
      const response = await fetch(htmlUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("تعذر تحميل ملف HTML: " + response.status + " — " + htmlUrl);

      host.innerHTML = await response.text();
      await ensureCostingScript();
      window.initBusinessCostingStudio();

      const select = $("exampleSelect");
      const targetExample = exampleKey || (mode === "training" ? "overheadExercise" : "textile");
      if (select && select.value !== targetExample) {
        select.value = targetExample;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
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
    setActiveModeButton(mode);
    setSidebarGroup(mode);
    closeMobileSidebar();

    if (mode === "business") {
      $("workspaceEyebrow").textContent = "BUSINESS TOOLS";
      $("workspaceTitle").textContent = "احتساب تكاليف";
      $("workspaceDescription").textContent = "احتساب تكلفة المنتجات وتوزيع النفقات غير المباشرة والعامة وفق منهجية الكتيب.";
      $("workspaceBadgeNumber").textContent = "01";
      $("workspaceBadgeLabel").textContent = "الوحدة الأولى";
      setActiveNav("business-costing");
      await loadCostingModule(mode, "textile");
    } else {
      $("workspaceEyebrow").textContent = "TRAINING MODE";
      $("workspaceTitle").textContent = "تمارين احتساب التكاليف";
      $("workspaceDescription").textContent = "تدرب على تسجيل المصروفات، تحميل التكاليف غير المباشرة، واحتساب الإهلاك.";
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
      loadCostingModule("business", "textile");
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
