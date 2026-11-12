# SIYB Digital Workshop Tools

**Prototype 0.1.2 — Business Costing Studio V1.5 migrated**

An offline-first, Arabic-first PWA shell with a modular Business Costing Studio.

## Repository structure

```text
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── font/
│   └── Cairo.woff2
├── vendor/
│   ├── jspdf/
│   │   ├── jspdf.umd.min.js
│   │   └── LICENSE.txt
│   └── exceljs/
│       ├── exceljs.min.js
│       └── LICENSE.txt
├── styles/
│   ├── main.css
│   └── business-costing.css
└── src/
    ├── app.js
    ├── locales/
    │   └── translations.js
    └── modules/
        ├── business-costing.html
        └── business-costing.js
```

## Business Costing Studio V1.5

The original V1.5 calculator has been migrated into a separately loaded module. Its training data and calculation routines have been retained, including:

- Nadia Textile multi-product costing example.
- Previous prototype example.
- Hair and Beauty Salon service costing.
- Alibaba Chairs single-product example.
- Asfi Bookshop retail example.
- Ledger and general-expense exercise.
- Straight-line depreciation exercise.
- Indirect-cost allocation exercise, including the ful medames (fava beans) 450 g tin and the other sample products.

The module retains the original editable inputs, calculation logic, notices, CSV export, and print-to-PDF workflow. Excel export is added using the supplied local ExcelJS bundle. The workbook includes the main costing sheet and, when selected, the relevant ledger, depreciation, or overhead-allocation exercise sheet.

## Modes

- **Business Mode:** opens the costing module with its standard worked example.
- **Training Mode:** opens the same module and selects the indirect-cost allocation exercise by default. Other examples remain available in the example selector.

The current costing module interface and its training examples are Arabic. The application shell language toggle currently changes the shell interface only.

## Local vendor libraries

- `vendor/jspdf/jspdf.umd.min.js` — jsPDF 2.5.1.
- `vendor/exceljs/exceljs.min.js` — ExcelJS bundle supplied for this migration.

Both libraries are loaded locally and included in the Service Worker app shell for offline availability. The PDF workflow in this release remains the browser's print-to-PDF feature; jsPDF is bundled for the next dedicated PDF-export implementation.

## Run locally

A Service Worker requires HTTPS or localhost:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages deployment

Upload the contents of this directory to the repository root, enable GitHub Pages, and deploy from the intended branch/folder. Internal paths are relative so the project can be hosted from a repository subpath.

After deployment:
1. Open the application once while online.
2. Allow the Service Worker to install and cache the app shell.
3. Test the costing module and Excel export.
4. Test offline launch after the first successful online load.

## Versioning

When changing cached files, update `CACHE_NAME` in `service-worker.js` so browsers install a fresh cache.
