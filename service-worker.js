const CACHE_NAME = "siyb-workshop-shell-v0.31.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/main.css",
  "./styles/app-shell.css",
  "./styles/business-costing.css",
  "./styles/purchasing-stock.css",
  "./styles/gyb.css",
  "./styles/marketing.css",
  "./styles/planning.css",
  "./styles/recordkeeping.css",
  "./src/locales/translations.js",
  "./src/app.js",
  "./src/modules/business-costing.html",
  "./src/modules/business-costing.js",
  "./src/modules/training.js",
  "./src/modules/purchasing-stock-data.js",
  "./src/modules/purchasing-stock.js",
  "./src/modules/registry.js",
  "./src/modules/gyb-store.js",
  "./src/modules/gyb-data.js",
  "./src/modules/gyb.js",
  "./src/modules/marketing-store.js",
  "./src/modules/marketing-data.js",
  "./src/modules/marketing-content-a.js",
  "./src/modules/marketing-content-b.js",
  "./src/modules/marketing-content-c.js",
  "./src/modules/marketing-content-d.js",
  "./src/modules/marketing-assess-a.js",
  "./src/modules/marketing-assess-b.js",
  "./src/modules/marketing-card8.js",
  "./src/modules/marketing-glossary.js",
  "./src/modules/marketing.js",
  "./src/modules/planning-store.js",
  "./src/modules/planning-data.js",
  "./src/modules/planning-calc.js",
  "./src/modules/planning-assess.js",
  "./src/modules/planning-content-a.js",
  "./src/modules/planning-content-b.js",
  "./src/modules/planning-content-c.js",
  "./src/modules/planning-content-d.js",
  "./src/modules/planning-content-e.js",
  "./src/modules/planning-content-f.js",
  "./src/modules/planning-content-g.js",
  "./src/modules/planning-learn.js",
  "./src/modules/planning-plans.js",
  "./src/modules/planning-cases.js",
  "./src/modules/planning.js",
  "./src/modules/recordkeeping-store.js",
  "./src/modules/recordkeeping-data.js",
  "./src/modules/recordkeeping-content-intro.js",
  "./src/modules/recordkeeping-content-part1.js",
  "./src/modules/recordkeeping-content-part2.js",
  "./src/modules/recordkeeping-content-part3.js",
  "./src/modules/recordkeeping-assessments.js",
  "./src/modules/recordkeeping-activities.js",
  "./src/modules/recordkeeping-forms.js",
  "./src/modules/recordkeeping.js",
  "./src/modules/arabic-pdf.js",
  "./src/modules/report-pdf.js",
  "./font/Cairo-Regular.ttf",
  "./assets/icons/app-icon.png",
  "./font/Cairo.woff2",
  "./vendor/jspdf/jspdf.umd.min.js",
  "./vendor/exceljs/exceljs.min.js"
].map((path) => new URL(path, self.registration.scope).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // Keep the current app active until the user chooses Update now.

});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key.startsWith("siyb-workshop-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
  self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "SIYB_APP_UPDATED", version: "0.31.0" }));
  });
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Lazy-loaded scripts are requested with a ?v=<version> suffix while the pre-cache stores them without it,
    // so fall back to a search-less match to keep never-opened modules available offline.
    const cached = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (cached) return cached;

      // Only a navigation request may fall back to the cached app shell.
      if (request.mode === "navigate") {
        const appShell = await cache.match(new URL("./index.html", self.registration.scope).href);
        if (appShell) return appShell;
      }

      // Never return index.html for a missing JavaScript, CSS, font, or module file.
      return new Response("Offline asset unavailable: " + requestUrl.pathname, {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});

// Release note: v0.31.0 update flow is ready for the Pages deployment.
// The update is activated only after an explicit user action in the app banner.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SIYB_SKIP_WAITING") self.skipWaiting();
});
