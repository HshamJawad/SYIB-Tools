# IYB Record Keeping – implementation notes

Source of truth: ILO, *Improve Your Business (IYB): Record Keeping*, 2015 (official English edition). The Arabic edition is a comparison reference only. Arabic in the tool is a preliminary formal-Arabic translation made directly from the English.

## Phase 1 – Foundation (v0.29.0)
- Registered as `recordkeeping` (order 6, group `iyb`, after Planning); global `SIYBRecordKeeping`, root `#rkRoot`, body class `mode-recordkeeping`, badge `RK`.
- Files: `recordkeeping-store.js`, `recordkeeping-data.js`, `recordkeeping.js`, `styles/recordkeeping.css` (every selector `rk-` prefixed). Shared edits: `registry.js` (registration), `service-worker.js` (APP_SHELL + version), `index.html` (stylesheet link + version), `src/app.js` (version).
- Storage key `siyb.iyb.recordkeeping.v1`: header only (`schemaVersion` 1, `moduleId` "recordkeeping", `language`, `lastSection`, `updatedAt`). Unreadable or foreign-moduleId data is copied to `.unreadable`. No records, transactions or learner answers are stored in Phase 1.
- No learning content, activities, assessments, interactive forms or calculations (Phase 2+). The Forms page lists the manual's ten form names only.
- Attribution: CC BY-SA 3.0 IGO, ILO credit, adaptation and translation disclaimers, no ILO emblem, no SIYB logo.
- **Pre-publication check required:** the right to use the SIYB/IYB name and brand must be verified (the manual states adaptations not endorsed by the ILO SME Unit cannot use the SIYB brand name and logo). Content licence does not grant brand rights.
- Tests: `tests/recordkeeping-qa.js`.

## Source ambiguities recorded in Phase 0 (decisions required before they become logic)
1. VAT columns: p.25 (VAT out = collected on sales, VAT in = paid on purchases) agrees with the p.28 table; the p.27 sentence about the cupboard sale says "VAT in". VAT rates in the examples differ (5% and 10%); no default rate is ever assumed.
2. Years-used convention for depreciation: the p.32 register counts the purchase year as a full year; the Activity 6 answer (p.48) counts one year from Dec 2013 to Dec 2014.
3. Daily Cash Sales Record: the blank form (p.79) has VAT rate/VAT/Total columns that the p.18 instructions do not describe; numbering skips (4).
4. Customers' Accounts Record: blank form has a "Time limit" field absent from the p.21 example. Salary Register: example uses "Social and Health Insurance"; the blank form has Benefits and Insurance.
5. Typos in the source: "$123,1" (p.72), "principle" (p.39), "PLANING" (p.59); glossary cited as pp.75–77 but occupies pp.75–76.
