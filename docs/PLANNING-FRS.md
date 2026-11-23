# Functional Requirements Specification (FRS)
## SIYB Tools – IYB: Planning for Your Business
**Version:** 1.1 | **Date:** 23 November 2026 | **Status:** Phase 0 approved by owner; corrections applied (see section 10)

## 1. Purpose
Add a standalone bilingual Arabic/English module named **Planning for Your Business – التخطيط لمشروعك** under the existing IYB group in SIYB Tools. The module converts the ILO manual's learning sequence, activities, assessments, five planning templates and action plan into an interactive learning and planning workspace.

**Authoritative source:** ILO, *Improve Your Business (IYB): Planning for Your Business*, 2015, 113-page English edition.

## 2. Source structure to preserve
1. Part I – Planning for the Future.
2. Part II – Doing a Business Analysis.
3. Part III – Forecasting Changes in the External Environment.
4. Part IV – Managing Risk.
5. Part V – Making Plans.

The manual also includes Activities 1–20, Assessments 1–5, “What Did You Learn in This Manual?”, “Can You Help?” cases, an Action Plan, Answers and Useful Business Words.

The five plans are:
- Sales and Marketing Plan.
- Production and Cost Plan.
- Profit Plan.
- Cash Flow Plan.
- Loan Access Plan.

## 3. Integration requirements
- Register as a separate child module under the existing IYB group.
- Sidebar position (owner-approved): fifth module in the IYB group, after Costing, Buying & Stock Control and Marketing.
- Follow the current module registry, lazy-loading and mount/open/refresh/current lifecycle.
- Reuse the existing bilingual data pattern, language-change event, local storage conventions, PDF helper and PWA cache/version process.
- Keep styles scoped to a unique root such as `.pyp-root`.
- Do not refactor the registry or alter internals of Marketing, Costing, Buying & Stock Control, GYB or other existing modules unless the owner explicitly approves.
- Keep module data isolated under `siyb.iyb.planning.v1`.

## 4. Learning navigation
The dashboard presents the module purpose, five-part journey and learner progress. Each part contains its topics, activities, summary and assessment.

### Part I – Planning for the Future
- What is planning?
- Is planning necessary?
- How planning can improve the business.
- Five useful plans.
- Tips for making a plan.
- Activity 1, Summary and Assessment 1.

### Part II – Doing a Business Analysis
- Analyse sales and marketing.
- Analyse production and costs.
- Analyse profit.
- Use the three-step method: get past data, compare records, find reasons.
- Activities 2–3, Summary and Assessment 2.

### Part III – Forecasting Changes in the External Environment
- What is a forecast?
- Changes affecting sales and marketing.
- Changes affecting production and costs.
- Activities 4–5, Summary and Assessment 3.

### Part IV – Managing Risk
- What is risk?
- What is risk management?
- Stages in the risk management process.
- Risk management strategies.
- Risk register fields shown in the manual, including risk, likelihood, frequency, impact, priority and actions.
- Activity 6 (risk-register form: Risk, Likelihood, Frequency, Impact, Priority, Actions) and Assessment 4. Part IV contains only Activity 6.

### Part V – Making Plans
- Set business objectives.
- Incorporate risk management strategies.
- Sales and Marketing Plan.
- Production and Cost Plan.
- Profit Plan.
- Cash Flow Plan.
- Loan Access Plan.
- Activities 7–20 and Assessment 5, preserving the exact source mapping (Activities 7–10 precede the Production and Cost forecasts; 11–16 production/cost; 17 profit; 18–19 cash flow; 20 loan access).

### End-of-manual learning
- “What Did You Learn in This Manual?”
- “Can You Help?” cases, including Reliable Tailors cash-flow case.
- Action Plan.
- Answers, hidden until the learner attempts the activity or requests them.
- Useful Business Words glossary.

## 5. Functional requirements

### FR-01 – Module registration
The module appears under IYB and follows the existing external-module lifecycle.
**Acceptance:** Opens independently in both languages without changing existing navigation.

### FR-02 – Bilingual interface
All UI and authored learning content has Arabic and English values; Arabic is RTL and English LTR. Language switching preserves all entries and focus where possible.
**Acceptance:** No mixed-language labels, direction errors or lost form data.

### FR-03 – Five-part learning structure
Render all five parts and subtopics in manual order.
**Acceptance:** All sections are reachable and verified source page references are shown.

### FR-04 – Source content and provenance
Present explanations, stories, important notes and summaries. Distinguish manual content from app-authored help, labelled “إرشاد التطبيق / Application guidance”.
**Acceptance:** Learners can identify source-derived content versus application additions.

### FR-05 – Activities 1–20
Convert source activities into interactive forms (Activities 1–6 in Parts I–IV, Activities 7–20 in Part V) while preserving activity numbers, prompts, table structure and response types.
**Acceptance:** Each response saves independently and remains editable. Do not guess unclear activity numbering.

### FR-06 – Assessments 1–5
Implement the source assessment questions and options with submit/check behaviour and answer feedback.
**Acceptance:** Answers remain concealed until an attempt or explicit reveal.

### FR-07 – Business analysis workspace
Support sales/marketing, production/cost and profit analysis using past data → compare records → find reasons.
**Acceptance:** The interface prompts interpretation; increases or decreases are not automatically labelled good or bad.

### FR-08 – External environment forecasting
Capture relevant external changes, evidence, affected business area, expected impact and possible response. Include source examples such as customer demand, competitors, alternative products, economy, policies, raw-material/skilled-labour supply and technology.
**Acceptance:** Estimates are clearly identified as forecasts, not facts.

### FR-09 – Risk management
Implement the manual's risk-management sequence and strategies. Include source-aligned risk register fields.
**Acceptance:** Risk records are editable and saved. Do not invent a numerical scoring formula.

### FR-10 – Business objectives
Allow users to define business objectives before preparing plans.
**Acceptance:** Objectives can be edited and used as context in the plans.

### FR-11 – Sales and Marketing Plan
Provide planning prompts for the seven Ps (Product, Price, Place, Promotion, People, Process, Physical Evidence) and monthly sales forecasts.
**Acceptance:** Monthly sales value is calculated transparently as forecast price × forecast quantity.

### FR-12 – Production and Cost Plan
Provide monthly production quantity, material cost, labour cost and overhead forecasts, plus proposed operational improvements.
**Acceptance:** Forecast calculations are transparent. This does not replace the separate Costing module.

### FR-13 – Profit Plan
Use sales and cost forecasts to calculate monthly Gross Profit and Net Profit using the manual's definitions.
**Acceptance:** Formula inputs are traceable and forecasts are not presented as actual results.

### FR-14 – Cash Flow Plan
Provide monthly cash-in, cash-out, opening and closing cash balances and potential shortage indicators, following the source model.
**Acceptance:** Cash flow is distinct from profit. Include timing effects such as credit collections, tax/VAT payments, loans and investment outflows where the source template/case requires them.

### FR-15 – Loan Access Plan
Cover whether a loan is needed, amount/purpose, timing, choice of financial institution, interest concepts, qualification and repayment management.
**Acceptance:** The tool does not recommend borrowing; it helps test repayment capacity using cash-flow forecasts. Distinguish flat-rate and reducing-balance interest as the manual does.

### FR-16 – Integrated plans
Carry relevant values between sales, production/cost, profit, cash flow and loan planning; integrate risk strategies across plans.
**Acceptance:** Shared assumptions are linked or clearly carried forward, avoiding inconsistent duplicate inputs.

### FR-17 – End-of-manual cases
Implement the “Can You Help?” exercises, including Reliable Tailors.
**Acceptance:** Preserve case data and questions; hide worked answers until requested.

### FR-18 – Action Plan
Provide an editable action plan aligned with the source template.
**Acceptance:** Users can save, revisit and update actions.

### FR-19 – Progress tracking
Track progress based on meaningful work (saved activity, assessment completion, summary review or completed plan), not merely opening a section.
**Acceptance:** Dashboard progress updates accurately.

### FR-20 – Local persistence
Autosave with debounce using an isolated namespaced key. Handle unavailable storage with in-memory fallback and a clear warning.
**Acceptance:** Data survives reload and does not collide with other modules.

### FR-21 – JSON export/import
Export and import module data with schema/module/version validation and confirmation before replacing existing data.
**Acceptance:** Invalid files are rejected safely; no silent overwrite.

### FR-22 – PDF/report
Generate a learner planning report using the existing PDF helper where compatible.
**Acceptance:** Arabic/RTL renders correctly. Clearly label it as a learner-prepared planning document, not an official ILO certificate or endorsed business plan.

### FR-23 – Responsive/accessibility
Support desktop, tablet and mobile; accessible labels, keyboard navigation and visible focus.
**Acceptance:** No common mobile horizontal overflow or focus loss during calculations/language switching.

### FR-24 – Offline/PWA
Add required local assets to the service-worker cache and update versions according to repository convention.
**Acceptance:** After caching, module opens and works offline.

### FR-25 – Regression safety
Run existing GYB, Marketing and shell tests after integration.
**Acceptance:** Existing tests pass or pre-existing failures are documented separately.

## 6. Proposed data model
```js
{
  schemaVersion: 1,
  moduleId: "iyb-planning",
  language: "ar",
  businessProfile: {},
  objectives: [],
  activities: {},
  assessments: {},
  businessAnalysis: {
    salesMarketing: {},
    productionCosts: {},
    profit: {}
  },
  externalForecasts: [],
  risks: [],
  plans: {
    salesMarketing: { monthly: [], sevenPs: {} },
    productionCost: { monthly: [], improvements: [] },
    profit: { monthly: [] },
    cashFlow: { monthly: [] },
    loanAccess: {}
  },
  actionPlan: [],
  progress: {},
  updatedAt: ""
}
```
Final schema must follow existing repository patterns after reconnaissance.

## 7. First PoC exclusions
- No AI-generated forecasts, assumptions or recommendations.
- No live market, exchange-rate, tax or lending-rate feeds.
- No bank application submission, loan matching or creditworthiness decisions.
- No accounts/cloud sync unless already supported and explicitly approved.
- No local tax/VAT/legal presets without verified local sources.
- No replacement of Costing, Record Keeping, Marketing or Buying & Stock Control.
- No promise of profitability or loan approval.
- No ILO emblem or claim of ILO endorsement.

## 8. Copyright and attribution
The manual states CC BY-SA 3.0 IGO. Reuse/adaptation requires clear ILO attribution, the same licence for new works using original content, the prescribed translation disclaimer for translations and adaptation disclaimer for adaptations. The ILO emblem is not permitted. Adaptations not endorsed by the ILO SME Unit cannot use the SIYB brand name and logo. The product owner must review naming/branding before public distribution.

## 9. Definition of Done
- Five parts, activities 1–20, assessments 1–5, five planning workspaces and end-of-manual learning implemented.
- Source references and provenance are clear.
- Arabic/English, RTL/LTR, persistence, JSON import/export and PDF verified.
- Offline/PWA and regression tests documented.
- Existing modules remain unaffected.
- No implementation starts until the owner reviews and approves Phase 0 repository reconnaissance.

## 10. Corrections and decisions in v1.1 (owner-approved 23 Nov 2026)
1. Activity distribution follows the manual: Activity 1 (Part I), 2–3 (II), 4–5 (III), 6 (IV), 7–20 (V). v1.0 wrongly placed Activities 11–20 in Part V and left Part IV unspecified.
2. Registry ID `planning`; global `SIYBPlanning`; internal `moduleId` `iyb-planning`; storage key `siyb.iyb.planning.v1`; styles scoped to `.pyp-root`.
3. Arabic text is a preliminary translation unless an official Arabic edition is supplied; it is labelled as such and carries the ILO translation disclaimer.
4. Tables, exercises, calculations, case studies and answer keys must be verified against the original PDF (the Markdown conversion may lose table layout).
5. Verify SIYB brand-use restrictions before release; no ILO emblem; no implied endorsement.
