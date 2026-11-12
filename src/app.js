(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const scriptElement = document.currentScript;
  const APP_BASE = scriptElement && scriptElement.src
    ? new URL("../", scriptElement.src)
    : new URL("../", location.href);
  const assetUrl = (path) => new URL(path.replace(/^\.\//, ""), APP_BASE).href;

  let language = "ar";
  try {
    language = localStorage.getItem("siyb-language") === "en" ? "en" : "ar";
  } catch (_) {}

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
    if (activeMode && $("workspaceTitle")) {
      $("workspaceTitle").textContent = t(activeMode === "business" ? "businessTitle" : "trainingTitle");
    }
  }

  async function loadCostingModule(mode) {
    const host = $("workspaceContent");
    host.innerHTML = '<div class="workspace-placeholder"><strong>جارٍ تحميل Business Costing Studio...</strong><p>يتم تحميل ملفات الوحدة.</p></div>';

    try {
      const htmlUrl = assetUrl("src/modules/business-costing.html");
      const response = await fetch(htmlUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("تعذر تحميل ملف HTML: " + response.status + " — " + htmlUrl);

      host.innerHTML = await response.text();
      const workspace = $("workspace");
      workspace.classList.add("workspace-fullscreen");
      const workspaceHead = workspace.querySelector(".workspace-head");
      if (workspaceHead) workspaceHead.hidden = true;

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
        throw new Error("تم تحميل ملف JavaScript لكن الدالة initBusinessCostingStudio غير موجودة.");
      }

      window.initBusinessCostingStudio();

      if (mode === "training") {
        const select = $("exampleSelect");
        if (select) {
          select.value = "overheadExercise";
          select.dispatchEvent(new Event("change"));
        }
      }
    } catch (error) {
      console.error("Business Costing Studio loading failed:", error);
      const details = String(error && error.message || error);
      host.innerHTML = '<div class="workspace-placeholder"><strong>تعذر تحميل الأداة</strong><p dir="ltr" style="text-align:left;overflow-wrap:anywhere">' +
        details.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])) +
        '</p><p>افتح أدوات المطور (F12) للاطلاع على تفاصيل إضافية.</p></div>';
    }
  }

  function renderWorkspace(mode) {
    activeMode = mode;
    $("workspace").hidden = false;
    $("workspaceEyebrow").textContent = mode === "business" ? "BUSINESS TOOLS" : "TRAINING";
    $("workspaceTitle").textContent = t(mode === "business" ? "businessTitle" : "trainingTitle");
    $("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    loadCostingModule(mode);
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => renderWorkspace(button.dataset.mode));
  });

  $("backHome").addEventListener("click", () => {
    activeMode = null;
    $("workspace").hidden = true;
    $("workspaceContent").innerHTML = "";
    $("workspace").classList.remove("workspace-fullscreen");
    const workspaceHead = $("workspace").querySelector(".workspace-head");
    if (workspaceHead) workspaceHead.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("languageToggle").addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    try { localStorage.setItem("siyb-language", language); } catch (_) {}
    applyLanguage();
  });

  applyLanguage();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(assetUrl("service-worker.js"), { scope: APP_BASE.pathname })
        .catch((error) => console.error("Service worker registration failed:", error));
    });
  }
})();
