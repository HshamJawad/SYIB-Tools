# SIYB Digital Workshop Tools

**Prototype 0.1.5 — Business Costing Studio UI refresh**

Arabic-first, offline-first SIYB workshop tools with a modular Business Costing Studio.

## Interface updates

- Removed the legacy V1.0 demonstration scenario.
- Removed CSV export and its implementation.
- Introduced a responsive, collapsible right-side navigation panel. The active module is **احتساب تكاليف**.
- Added a compact application top bar, breadcrumb, module heading, and workspace actions.
- Removed the repeated module card from the landing page. The home page remains the place to select Business Mode or Training Mode.
- Sidebar supports an expanded desktop view, a compact icon-only desktop view, and an off-canvas mobile view.

## Business Costing Studio

The module preserves the remaining original examples and calculations: Nadia Textile, Hair and Beauty Salon, Alibaba Chairs, Asfi Bookshop, ledger/general expenses, straight-line depreciation, and indirect-cost allocation using the ful medames 450 g tin and other sample products.

The module retains editable inputs, browser print-to-PDF, and Excel workbook export. CSV export is no longer included.

## Structure

```text
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── font/
├── assets/
├── vendor/
├── styles/
└── src/
    ├── app.js
    ├── locales/translations.js
    └── modules/
        ├── business-costing.html
        └── business-costing.js
```

## Deployment

Upload the contents of this directory to the repository root and publish the intended branch/folder through GitHub Pages. The Service Worker cache version is 0.1.5. For a local test, serve the repository with localhost (for example, `python -m http.server 8000`).
