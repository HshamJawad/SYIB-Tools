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
