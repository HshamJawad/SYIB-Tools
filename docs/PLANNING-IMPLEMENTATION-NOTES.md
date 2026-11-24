# IYB Planning for Your Business – implementation notes

Owner-approved decisions (Phase 0 review, 23 Nov 2026)
1. Order: fifth module in the IYB group, after Marketing.
2. IDs: registry `planning`, global `SIYBPlanning`, `moduleId` `iyb-planning`, storage `siyb.iyb.planning.v1`.
3. Files: `src/modules/planning-*.js`, `styles/planning.css`, all styles under `.pyp-root`.
4. Arabic: preliminary translation unless an official edition exists; preserve terminology, activities and assessment questions.
5. Source fidelity: Activities 1–6 in Parts I–IV (1 | 2–3 | 4–5 | 6), Activities 7–20 in Part V; Assessments 1–5. FRS corrected in `docs/PLANNING-FRS.md` (v1.1).
6. Verify all tables, exercises, calculations, cases and answer keys against the ORIGINAL PDF, not only the Markdown conversion.
7. Baseline: `main` after PR #36 (merged).
8. Keep ILO attribution and the adaptation/translation disclaimers; no ILO emblem; no implied endorsement; verify SIYB brand restrictions before release.

Phase 1 scope (this change): module foundation, registry entry, isolated store (no import/export yet), navigation shell, bilingual landing page, attribution notices. No manual learning content, activities, assessments or tools.

Open items
- The original Planning PDF has not been supplied in the session files (only the Markdown conversion); it is required from Phase 2 on.
- Phase 7 must allow numeric leaf values in import validation (Marketing's validator accepts strings/booleans only); Marketing's store is not modified.
- Existing tests hard-code the cache/app version; they are bumped with each release (0.23.0).

## Phase 2 – Parts I and II (v0.24.0)
Scope: Part I (Planning for the Future, printed pp. 1–13) and Part II (Doing a Business Analysis, pp. 15–27) as learning views; Activities 1, 2 and 3; Assessments 1 and 2; summaries; three business-analysis workspaces (sales/marketing, production/costs, profit); per-part progress; local persistence. Parts III–V, the end-of-manual material, the five plans, JSON import/export and PDF remain for later phases.

Source verification (original PDF, 113 pages, text extracted with pdftotext and compared)
- Assessment 1 (pp. 12–13) and Assessment 2 (pp. 26–27): questions, options and wording match the English original; key from p. 97: A1 words = Planning, Loan Access Plan, Production and Cost Plan, Profit Plan, Cash Flow Plan, Sales and Marketing Plan; A1 part 2 = 1b 2a 3c 4a 5c; A2 = 1c 2b 3a 4c 5c.
- Every thousands-formatted or decimal figure in the content, calculator and learning files was cross-checked against the PDF text (no figure missing). Plastic Solutions figures (e.g. 2013 Net Profit = (3,905)) are the manual's own example data and are used as unit-test cases.
- Formulas used are the manual's definitions only: Gross Profit = Sales − Material − Labour; Net Profit = Gross Profit − Overhead; cost per item = cost ÷ items produced. Increases/decreases are never labelled good or bad automatically.
- Answers are hidden until the learner checks an assessment or requests them.
- Progress counts saved work (activity text, completed + checked assessment, summary review), not merely opening a section.

Arabic remains a PRELIMINARY translation. Tests: `tests/planning-calc.test.js` (calculations), `tests/planning-qa.js` (foundation), `tests/planning-qa-phase2.js` (Parts I–II).
