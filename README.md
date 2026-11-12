# SIYB Digital Workshop Tools

**Prototype 0.2.9 — Adaptive sidebar and workspace layout**

A responsive, Arabic-first, offline-first SIYB digital workshop application.

## Application architecture

The workspace follows the adaptive layout model used in DACUM-Lite: desktop content reserves the expanded sidebar width (270px) or mini rail width (78px), and smoothly reflows as the sidebar changes state. Drawer mode is used at 768 CSS px and below, with an additional short-landscape touch breakpoint; the drawer overlays a dimmed, scroll-locked canvas.

The workspace occupies the full width remaining beside the persistent sidebar. Desktop margins reserve the sidebar width once only, both when expanded and when collapsed; mobile layout uses the full viewport width.

- A fixed global top bar contains the Business Mode and Training Mode selectors.
- A persistent right-hand sidebar belongs to the entire application, not to an individual module.
- Sidebar navigation changes according to the selected mode.
- Desktop sidebar can collapse to an icon rail. On mobile it becomes an off-canvas drawer.
- Individual tools load inside the shared workspace and do not create their own application sidebar or top bar.

## Current navigation

**Business Mode**
- احتساب تكاليف

**Training Mode**
- تحميل التكاليف غير المباشرة
- سجل الحسابات والمصروفات
- حساب الإهلاك

The three Training Mode entries select the corresponding editable exercises in Business Costing Studio.

## Business Costing Studio

The migrated tool preserves the remaining examples and calculations: Nadia Textile, Hair and Beauty Salon, Alibaba Chairs, Asfi Bookshop, ledger/general expenses, straight-line depreciation, and indirect-cost allocation using the ful medames 450 g tin and other sample products.

The legacy V1.0 scenario and CSV export have been removed. Excel workbook export and browser print-to-PDF remain available.

## Repository structure

```text
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── font/
├── assets/
├── vendor/
├── styles/
│   ├── main.css
│   ├── app-shell.css
│   └── business-costing.css
└── src/
    ├── app.js
    ├── locales/translations.js
    └── modules/
        ├── business-costing.html
        └── business-costing.js
```

## Deployment

Publish the repository root with GitHub Pages. The Service Worker cache is versioned `0.2.0`. For local testing, use localhost (for example, `python -m http.server 8000`).

After publishing, reload with Ctrl+Shift+R. If an older service worker remains active, unregister it once from DevTools → Application → Service Workers and clear site data.
