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
      : mode === "training" ? "وضع التدريب" : "اختر وضع العمل";
  }

  function setActiveNav(item) {
    document.querySelectorAll("[data-nav-item]").forEach((button) => {
      const active = button.dataset.navItem === item;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
    const toggle = $("sidebarToggle");
    if (toggle) {
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      const expanded = mobile ? false : !document.body.classList.contains("sidebar-collapsed");
      toggle.setAttribute("aria-expanded", String(expanded));
    }
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.body.classList.toggle("sidebar-open");
    } else {
      document.body.classList.toggle("sidebar-collapsed");
    }
  }

  async function ensureCostingScript() {
    if (typeof window.initBusinessCostingStudio === "function") return;
    if (!costingScriptPromise) {
      costingScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = assetUrl("src/modules/business-costing.js");
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

  async function loadCostingModule(mode, exampleKey) {
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
    } catch (error) {
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
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const expanded = mobile ? document.body.classList.contains("sidebar-open") : !document.body.classList.contains("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", String(expanded));
  }

  $("sidebarToggle").addEventListener("click", () => {
    toggleSidebar();
    syncSidebarToggleState();
  });
  $("sidebarCollapse").addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
    syncSidebarToggleState();
  });
  $("globalSidebarBackdrop").addEventListener("click", () => {
    closeMobileSidebar();
    syncSidebarToggleState();
  });
  window.addEventListener("resize", syncSidebarToggleState);
  $("globalSidebarBackdrop").addEventListener("click", closeMobileSidebar);

  $("languageToggle").addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    try { localStorage.setItem("siyb-language", language); } catch (_) {}
    applyLanguage();
  });

  applyLanguage();
  setSidebarGroup(null);
  syncSidebarToggleState();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(assetUrl("service-worker.js"), { scope: APP_BASE.pathname })
        .catch((error) => console.error("Service worker registration failed:", error));
    });
  }
})();
