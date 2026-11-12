(() => {
  const $ = (id) => document.getElementById(id);
  const savedLang = localStorage.getItem("siyb-language");
  let language = savedLang === "en" ? "en" : "ar";
  let activeMode = null;
  let costingScriptPromise = null;

  function t(key) {
    return (window.SIYB_TRANSLATIONS[language] || {})[key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ltr", language === "en");
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    $("languageToggle").textContent = language === "ar" ? "EN" : "ع";
    if (activeMode) {
      $("workspaceTitle").textContent = t(activeMode === "business" ? "businessTitle" : "trainingTitle");
    }
  }

  async function loadCostingModule(mode) {
    const host = $("workspaceContent");
    host.innerHTML = '<div class="workspace-placeholder"><strong>جارٍ تحميل Business Costing Studio...</strong><p>يتم تحميل ملفات الوحدة المحلية.</p></div>';
    try {
      const response = await fetch("./src/modules/business-costing.html");
      if (!response.ok) throw new Error("HTTP " + response.status);
      host.innerHTML = await response.text();
      if (!costingScriptPromise) {
        costingScriptPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "./src/modules/business-costing.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("تعذر تحميل ملف وظائف الأداة"));
          document.body.appendChild(script);
        });
      }
      await costingScriptPromise;
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
      host.innerHTML = '<div class="workspace-placeholder"><strong>تعذر تحميل الأداة</strong><p>تحقق من وجود ملفات src/modules/business-costing.html وsrc/modules/business-costing.js ثم أعد تحميل الصفحة.</p></div>';
    }
  }

  function renderWorkspace(mode) {
    activeMode = mode;
    $("workspace").hidden = false;
    $("workspaceEyebrow").textContent = mode === "business" ? "BUSINESS TOOLS" : "TRAINING";
    $("workspaceTitle").textContent = t(mode === "business" ? "businessTitle" : "trainingTitle");
    $("workspace").scrollIntoView({behavior:"smooth",block:"start"});
    loadCostingModule(mode);
  }

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => renderWorkspace(button.dataset.mode));
  });
  $("backHome").addEventListener("click", () => {
    activeMode = null;
    $("workspace").hidden = true;
    $("workspaceContent").innerHTML = "";
    window.scrollTo({top:0,behavior:"smooth"});
  });
  $("languageToggle").addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    localStorage.setItem("siyb-language", language);
    applyLanguage();
  });

  applyLanguage();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    });
  }
})();
