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

## Phase 2 — Educational content (v0.30.0)

**Implemented**: Introduction (4 sections); Part I (what is record keeping, how records improve your business, Activities 1–2, embedded questions, summary, Assessment 1); Part II (sections 1–6 incl. 3.1–3.3, 4.1–4.7, 5.1–5.2, Activities 3–7, summary, Assessment 2, Activity 5/6 answers from p. 48); Part III (sections 1–7, Assessment 3). Bilingual AR/EN; the Arabic is a preliminary translation (labelled in the module).

**Files**: `recordkeeping-content-intro|part1|part2|part3.js` (content), `recordkeeping-assessments.js` (data, scoring, review, retry), `recordkeeping-activities.js` (renderer, learner responses, reveal), edits to `recordkeeping.js`, `recordkeeping.css`, `registry.js`, `service-worker.js`.

**Storage (schema version stays 1, header unchanged)** — new keys are created only when the learner acts:
- `activities.<id>.q<n>` free-text responses (`a1`…`a7` and embedded questions such as `q-other`); `activities.<id>.revealed` boolean.
- `assessments.<a1|a2|a3>` = `{ answers: { <section>_<item>: value }, submitted, score, total, attempts }`.
Answer values are letters/ids (`t`/`f`, `a`–`c`, word ids), not digits, because the shell’s Arabic digit localiser rewrites digit characters in input values.

**Behaviour**: reflective questions are never scored. Model answers (embedded questions, Activities 5 and 6) are hidden until the learner has written an attempt and chooses to reveal them. Assessments: answers/feedback hidden initially; submit requires all items answered; score = 1 point per item with no pass mark (the manual defines none); review shows correct answers; retry clears the attempt; completion is recorded only on submission.

**Source ambiguities / decisions**
- p. 27 narrative says the cupboard cash sale is recorded under “VAT in” while the p. 28 table shows it as VAT out; the text is reproduced as printed and the table follows p. 28.
- p. 17 receipt is handwritten; the reading (Mr. Pie, 5 cupboards, 454.50 + 45.50 = 500.00, 18/10) is approximate.
- p. 18 text describes four Daily Cash Sales columns; the blank form is shown as a Basic Record Book only (no separate form until Phase 3+).
- Activity 6: the p. 48 answer (125 / 125 / 375 at 31 Dec 2014) is shown as printed.
- p. 38 Detailed Cost Record and p. 44 Reliable Tailors excerpts: column placement was transcribed from the page and is flagged in the UI for checking against the print.
- Source typos kept/normalised: “principle” (principal), “PLANING”.
- Balance Sheet Arabic: قائمة المركز المالي (Phase 2 terminology table governs over FRS v3).

**Not implemented (later phases)**: interactive record forms and calculators, backup/import/erase/report (Phase 7), end matter and forms pages.

## Phase 3 — Core interactive forms (v0.31.0)

**Implemented** (Forms page, three tabs): Basic Record Book, Daily Cash Sales Record, Customers’ Accounts Record. File: `src/modules/recordkeeping-forms.js` (engine + UI); wired in `recordkeeping.js`, registry, service worker; `.rk-*` CSS only.

**Basic Record Book**: columns and order per p.15 (Date, Details, Voucher No., Cash IN/OUT/BALANCE, Bank IN/OUT/BALANCE, Sales, Material, Labour, Overhead, VAT IN/OUT/BALANCE – VAT columns only when the learner marks the business VAT registered, p.25). Opening balances (B/f) for cash and bank. Entry by transaction type; each type writes the columns the manual prescribes and a live preview shows them: sale; purchase (material/overhead); wages (labour/overhead split); cash→bank deposit; bank→cash; loan received; loan payment (interest only to overhead); asset purchase; stock purchase; stock used; tax payment; depreciation. Deposits, withdrawals and loans are never Sales. Balances are plain running sums; VAT balance = VAT IN − VAT OUT, negative shown in brackets (p.25/28). Warnings (not blocks): duplicate voucher number, negative cash/bank balance. Edit, delete (two-step), clear form.
**Verified against the manual**: Modern Furniture November (p.28) – every running balance and the totals row; Activity 5 answer (p.48); Reliable Tailors wages, loan, stock and depreciation entries (pp.36–44).
**Daily Cash Sales Record**: day sheets with item, quantity sold, unit price, amount = quantity × price, total; the total can be transferred once to the Basic Record Book as a cash sale (Cash IN + Sales, optional VAT amount).
**Customers’ Accounts Record**: customers with address, tel, credit limit; credit sale / payment entries with signature text; running balance (Welcome Hotel p.21 reproduces 200/400/800/300); non-blocking warnings above the credit limit and on overpayment. Credit sales are not cash received and create nothing in the Basic Record Book.

**Assumptions**: no currency, no tax rate – VAT is a typed amount (net = amount − VAT). Dates are free text d/m[/y] or ISO as the manual writes them. Numbers accept Arabic-Indic digits.

**Source ambiguities left un-automated (documented, not guessed)**: (1) whether a customer’s payment is also written in Sales, and when a credit sale enters Sales – the manual says a cash payment is cash from sales but does not state the Basic Record Book columns for it, so customer payments are not auto-posted; (2) the p.27 cupboard narrative (“VAT in”) vs the p.28 table (VAT out) – the table is followed; (3) Daily Cash Sales form VAT fields are not specified – only an optional VAT amount at transfer time.

**Storage (schema 1, header unchanged)**: `forms.brb` {unit, vat, openCash, openBank, seq, rows{r<n>}}, `forms.dcsr` {seq, days{d<n>{date, items{i<n>}, posted}}}, `forms.car` {seq, customers{c<n>{name,address,tel,limit,entries{e<n>}}}}. Keys appear only when the learner acts; Phase 1/2 data is untouched.

**Not implemented (Phase 4+)**: the seven additional record books, receipts as attachments (not required for the first release), cash control comparison (FR-11), reports/PDF, backup/import.
