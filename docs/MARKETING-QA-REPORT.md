# IYB Marketing module – final QA report (Stage 5)

Version under test: **0.21.0** (cache `siyb-workshop-shell-v0.21.0`). Tested against the repository at the Stage 5 branch, served locally (`python3 -m http.server 8123`) and driven with Playwright + Google Chrome (headless, `--no-sandbox`). Only what is listed under "Executed" was run.

## Executed (all via the automated suites in `tests/`)

| Suite | Result |
|---|---|
| `marketing-qa.js` (Stage 1: registration, order, 8 cards, navigation, language, storage basics, sibling modules, responsive, offline) | 53 passed / 0 failed |
| `marketing-qa-stage2.js` (content Cards 01–07, 23 activities, summaries, progress, licence) | 53 / 0 |
| `marketing-qa-stage3.js` (Assessments 1–9, activity answers, Card 08, glossary) | 63 / 0 |
| `marketing-qa-stage4.js` (autosave/restore, JSON export/import, validation, protected reset, fallback, PDF report) | 36 / 0 |
| `marketing-qa-final.js` (end-to-end, see below) | 67 / 0 |
| `gyb-qa.js` (shell, Costing, GYB, Stock regression) | 94 passed / 0 failed / 7 not run (harness limits). **Flaky harness:** in 2 of 4 runs it aborted at a forced radio click in the GYB knowledge check (`#kc-k1 input[value=b]`) before finishing; every completed run was 94/0. Pre-existing, GYB-only, not related to Marketing. |

### What `marketing-qa-final.js` covers
- **Content integrity (static):** every text exists in Arabic and English (no empty, no untranslated, no placeholder artefacts); Activities 1–23 each once and in order; nine Parts I–IX in source order across Cards 02–07 (Place before Promotion); every Part has a summary; nine assessments with answer-source pages; Card 08 has 10 tasks/answers, a 4-column plan and 21 glossary terms; option values are letters.
- **Protected files:** `git diff 3324ace..HEAD` shows no change to the Costing, Stock, GYB, `report-pdf`, `arabic-pdf`, `gyb.css` or `app-shell.css` files. (`registry.js`, `index.html`, `app.js`, `service-worker.js` carry only the Marketing registration, CSS link and version/cache edits.) No image/logo file was added.
- **Both languages × all 8 cards:** lang/dir (RTL/LTR), title present, expected Parts per card, no artefacts, no heading-level skips, every input labelled, badges have text, no horizontal overflow.
- **Full work-through through the real UI:** all 23 activities filled and marked, all 9 assessments submitted, summaries reviewed, Card 01 read, 10 Can-You-Help answers, 4 plan rows → dashboard shows all 8 cards completed; saved data holds 23 + 9 responses, plan, CYH.
- **Persistence:** reload keeps identical data and progress; language switch with full data keeps every entry; export → erase → import restores identical responses/progress/plan; PDF report saved with full data (valid PDF).
- **Accessibility basics:** keyboard Enter opens a focused card; visible focus indicator; contrast ≥ 4.5:1 for the checked colour pairs; dark text on brand-blue primary buttons.
- **Sidebar:** expanded (Marketing head + 10 sub-items) and collapsed (module usable) states; re-expand.
- **Navigation/regression:** Costing → Stock → Marketing → GYB → Marketing → Costing sets the right mode each time; Costing renders after switching; Marketing data intact after visiting other modules.
- **Responsive:** 390, 360, 820 and 1440 px: all 8 cards + Data page without horizontal overflow; controls ≥ 28 px tall.
- **Network:** no external (non-localhost) request during the entire run. **Console:** no errors.
- **Offline:** all 12 Marketing assets in the cache; offline reload renders all 8 cards and the Data page; entries still save offline; largest card renders in well under 800 ms.

## Fixed during Stage 5
1. Primary buttons were white on brand blue (2.7:1) → dark text (6.97:1).
2. Card 08 skipped heading levels (h3 → h5) → corrected to h4 (`marketing.js`).

## NOT tested (explicitly)
- Real phones/tablets, a **real installed PWA**, Safari, Firefox, Edge; iOS download behaviour.
- Screen readers; full WCAG audit (only the checks above); high-contrast/dark mode.
- Real printing; the PDF was checked structurally and one page visually (Stage 4), not every page.
- Human review of the **Arabic translation**, the market-research table in "Can You Help?", and a sample-by-sample comparison of all content against the manual (only an automated number/name comparison and spot checks were done).
- Long-term storage limits/quotas, multi-tab concurrent editing.

## Known issues / decisions for the owner
- **Arabic text source:** the supplied Arabic manual extraction is corrupt OCR and the Arabic edition appears to use localised cases (Moroccan restaurant, dirham). The module follows the **English** manual; Arabic is an **unofficial translation**, labelled in-app, pending review against the Arabic edition. Decide whether to adopt the Arabic edition's cases.
- "Can You Help?" market-research page was extracted jumbled; reconstructed from the extracted cells with an in-app note (original p. 91). Please verify.
- Illustrations are not reproduced (text-only, with page references). Assessments 8 and 9 refer to pictures in the original.
- Glossary Arabic terms (e.g. Publicity, Sales promotion, Display) are provisional choices.
- "Add a row" in the Action Plan and the Data & report page are app features (labelled), not manual content.
- Import/reset confirmations use browser `confirm`/`prompt` dialogs (same as GYB).
- **Licence/name (owner decision):** CC BY-SA 3.0 IGO attribution and disclaimers are shown, no ILO/SIYB logos. The app name "SIYB Digital Workshop Tools" and the label "IYB" may conflict with the manual's statement that unendorsed adaptations cannot use the SIYB brand name and logo; legal review is needed before public release. This is not legal advice.
