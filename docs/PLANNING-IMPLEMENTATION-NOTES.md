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

## Phase 3 – Part III: Forecasting Changes in the External Environment (v0.25.0)
Scope: Part III learning view (printed pp. 29–36), Activities 4 and 5, Assessment 3, the manual's summary, and an application-guidance register of external-change forecasts (FR-08). Parts IV–V, end-of-manual material, JSON import/export and PDF remain for later phases.

Source verification (original PDF text compared with the code)
- Activity 4 (p. 32) and Activity 5 (p. 34) prompts, the reflection questions before each list of examples, the lists of changes (customers, competitors, alternative products, economy, regulations and policies; supply of raw materials, new technologies, skills supply, economy, regulations and policies), the question lists, Juma's forecasts, the realism note ("base your answer on facts, not on wishes and dreams") and the summary are transcribed from the PDF.
- Assessment 3 (p. 36): three multiple-choice questions; key from p. 97 = 1a, 2b, 3c.
- The manual's Part III has no calculations or tables; none were added.

Application guidance (labelled as such, not manual content): the forecasts register. Each record stores the business area (sales and marketing, or production and costs), the type of change (the manual's example categories plus "other"), the expected change, the facts it rests on, the expected effect and a possible response, and is tagged "estimate about the future — not a fact". No live data, no AI-generated forecasts, no scoring.

Storage: records live in `externalForecasts` (array) inside `siyb.iyb.planning.v1`. The Planning store's path setter now also traverses arrays. The forecasts do not affect Part III progress (progress = Activities 4–5, Assessment 3 completed and checked, summary review).

Tests: `tests/planning-qa-phase3.js` (41 checks). Earlier Planning suites updated for the new state: the script-count assertion now reads the registry, and the Phase 2 scope/dashboard assertions treat Part III as live.

## Phase 4 – Part IV: Managing Risk (v0.28.0)
Scope: Part IV learning view (printed pp. 37–42): what risk is, risk management (four steps, five questions), the four ways to respond (accept, transfer, reduce, avoid), Activity 6 with the risk-register form, the manual's closing note, summary and Assessment 4.

Source verification (original PDF text compared with the code)
- Activity 6 (p. 41): three questions and the form columns Risk, Likelihood, Frequency, Impact, Priority, Actions to take, in the manual's order. Likelihood, frequency, impact and priority are free text; no scale, score, matrix or classification is imposed.
- Assessment 4 (p. 42): five true/false tick statements; key from p. 97 = F, F, T, F, T. The manual's explanations appear only after the learner checks. A check with nothing ticked is not counted as an attempt.
- Part IV has no calculations; none were added.

Application guidance (labelled as such): optional origin (internal/external) and response (accept/transfer/reduce/avoid) selectors on each risk, and a "From my forecasts (Part III)" box that creates a risk from a forecast. Each risk records `fromForecast` (the forecast id), so a forecast can be added once only; the forecast itself stays in Part III. Removing a risk (after confirmation) frees its forecast again.

Storage: records live in `risks` (array) in `siyb.iyb.planning.v1` and are the single source the later plans will read (no duplicated entries). Progress: Activity 6 counts when saved text or a risk with text exists; Assessment 4 when completed and checked; summary when reviewed.

Tests: `tests/planning-qa-phase4.js` (40 checks). Phase 2/3 suites updated for the new state (Part IV is now live; only Part V and end of manual are placeholders).

## Phase 5 – Part V: Making plans (v0.28.0)
Scope: Part V learning view (printed pp. 43–85): objectives, Risk Management in planning, Sales and Marketing Plan, Production and Cost Plan, Profit Plan, Cash Flow Plan, Loan Access Plan, Activities 7–20, summary and Assessment 5. Content in `planning-content-e.js` / `-f.js`; workspaces in `planning-plans.js` (registered into the learning engine); calculations in `planning-calc.js`.

Source verification (original PDF): all Plastic Solutions (Juma) tables were checked against the PDF text (sales 113,325; materials 61,560; labour 15,840; overhead 30,880; gross 35,925; net 5,045; cash flow closing 7,884 / 6,202 / (4,097); loan interest flat 320 and reduced balance 180). Assessment 5 key (p. 97) = b c a c a a b c. Answers to Activities 12, 19 and 20 (pp. 86–87) are hidden until the learner asks; no answer keys or scoring were invented.

Application guidance (labelled in the UI): objectives list; product names/count; "apply January value to all months", "use my sales quantity" and "copy from my forecasts" helpers (explicit, one-off, editable); the read-only link to the Part IV risk register plus a note per plan; the loan helper (both interest methods, optional addition of instalments to Cash Flow line 10); shortage flags (text, not colour only). Forecasts are labelled as assumptions, nothing predicts or recommends borrowing. The printed Activity 13/18 forms show 6 and 3 months; the app offers 12 because the manual says plans may cover a quarter, six months or a year.

Storage (single key): `objectives`, `plans.nProducts`, `plans.productNames.*`, `plans.salesMarketing.fc.*`, `plans.productionCost.{prodQty,matItem,oh,ohN,lab,waste}`, `plans.practice.a12`, `plans.cashFlow.*`, `plans.loanAccess.*`, `plans.unit`. Cost, profit and cash lines are computed from these, never re-entered.

Known app-wide behaviour (not changed): the shell's UI translator rewrites some English dictionary words typed into inputs/textareas while Arabic is active (display only; stored text is intact).

Tests: `tests/planning-qa-phase5.js` (54 checks, including the full Juma scenario). Earlier suites updated: only the end of the manual remains a placeholder.

## Phase 6 — End of the manual (printed pp. 89–101)

- Source: What Did You Learn, "Can You Help?" (Reliable Tailors, Chimba Carpentry), Action Plan, Answers, Useful Business Words. Case figures and answers verified against the PDF (PDF page = printed page + 11).
- Content: `src/modules/planning-content-g.js` (`C.end`); workspaces in `src/modules/planning-cases.js` registered through `SIYBPlanningLearn.register`.
- Storage: `cases.tailors.*`, `cases.chimba.*`, `actionPlan[]` ({what, how, who, when, done}) inside `siyb.iyb.planning.v1`.
- Tailors uses `calc.cashMonth`; Chimba computes sales, materials, labour, overhead, gross and net profit. Manual answers stay hidden until requested. No scoring or invented answer keys.
- Progress: 3 items (two cases, Action Plan). Arabic is a preliminary translation; ILO attribution and disclaimers retained.
- Tests: `tests/planning-qa-phase6.js` (45 checks); earlier suites updated so only Data & report (Phase 7) remains a placeholder.
