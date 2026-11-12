const CACHE_NAME = "siyb-workshop-shell-v0.3.6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/main.css",
  "./styles/app-shell.css",
  "./styles/business-costing.css",
  "./src/locales/translations.js",
  "./src/app.js",
  "./src/modules/business-costing.html",
  "./src/modules/business-costing.js",
  "./src/modules/arabic-pdf.js",
  "./font/Cairo-Regular.ttf",
  "./assets/icons/app-icon.svg",
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
    clients.forEach((client) => client.postMessage({ type: "SIYB_APP_UPDATED", version: "0.3.6" }));
  });
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

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

// Release note: v0.3.6 update flow is ready for the Pages deployment.
// The update is activated only after an explicit user action in the app banner.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SIYB_SKIP_WAITING") self.skipWaiting();
});
