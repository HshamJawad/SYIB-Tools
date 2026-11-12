# SIYB Digital Workshop Tools

**Prototype 0.1.4 — module initialization and cache refresh fix**

An offline-first, Arabic-first PWA shell with a modular Business Costing Studio.

## Repository structure

```text
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── font/Cairo.woff2
├── vendor/
│   ├── jspdf/jspdf.umd.min.js
│   └── exceljs/exceljs.min.js
├── styles/
│   ├── main.css
│   └── business-costing.css
└── src/
    ├── app.js
    ├── locales/translations.js
    └── modules/
        ├── business-costing.html
        └── business-costing.js
```

## Business Costing Studio V1.5

The migrated module preserves the source examples and calculation routines, including Nadia Textile, the previous prototype, Hair and Beauty Salon, Alibaba Chairs, Asfi Bookshop, ledger/general expenses, straight-line depreciation, and indirect-cost allocation using the ful medames (fava beans) 450 g tin and other sample products.

The module retains editable inputs, CSV export, and print-to-PDF. Excel export uses the local ExcelJS bundle and includes the relevant exercise sheet when applicable.

## Modes

- **Business Mode:** opens the costing module with its standard worked example.
- **Training Mode:** opens the same module and selects the indirect-cost allocation exercise by default.

The costing module interface and training examples are Arabic. The shell language toggle changes the shell interface only.

## GitHub Pages and path handling

The module asset paths are resolved from the actual URL of `src/app.js`, not from the current browser route. This supports GitHub Pages repository subpaths and custom base paths.

The Service Worker uses a versioned cache (0.1.3). It returns the cached home page only for navigation requests; it never substitutes `index.html` for a missing JavaScript, CSS, or module file. Missing/offline assets return HTTP 503 so the actual failing request is visible.

## Deployment

Upload the contents of this directory to the repository root and publish from the intended GitHub Pages branch/folder. After deployment, hard-refresh the page (Ctrl+Shift+R). If the browser still controls an older Service Worker, open DevTools → Application → Service Workers, unregister the old worker, then reload once.

## Local run

Use a local HTTP server (for example, `python -m http.server 8000`) and open `http://localhost:8000`. Service Workers require HTTPS or localhost.
