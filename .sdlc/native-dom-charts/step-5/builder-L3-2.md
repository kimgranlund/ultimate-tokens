<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/app-helpers.mjs: removed the `html` branch from `h()`, so it no longer sets `innerHTML`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/repo/dom-charts.mjs: rewritten in its final form. The ALLOW map and check (b) are gone. It asserts 0 `html:` attributes and 0 `<svg` strings in every `src/ui/sections/*.js`, no `innerHTML` in `app-helpers.mjs`, and no `innerHTML` or `<svg` in `src/ui/charts/*.mjs`. Every FAIL line names its file, and the pass line is the one the handoff gives.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/smoke/smoke.mjs: new block that covers the color, typography and geometry rails in light and in dark. It saves `charts-<section>-<theme>.png` (filenames written out literally) and checks:
  - the `.an-chart` minimums (4, 3, 3);
  - every `.ch-ribbon` has a non-zero box and no NaN in its style;
  - the `.ty-mono` ribbon computes a mask;
  - the centering card holds exactly 2 `.ch-rect`.
  It then restores `theme = "system"` and the color section.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/CLAUDE.md: removed the `fill: none` bullet and the interim ALLOW bullet, and added the native DOM marks convention (`renderChart`, `core.mjs`, `--series`/`--dash`, the gate, ADR-035).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/skills/building-editor-sections/SKILL.md: the Left-analysis table cell, step 3 and the best-practices reference-table row now describe `.an-chart`/`renderChart`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/skills/building-editor-sections/references/best-practices.md: the `fill: none` bullet became the chart-primitive bullet. The `.an-svg` mention in the reuse bullet and the `fill:none` note in the walkthrough are gone.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/skills/building-editor-sections/references/foundations.md: dropped `html` (innerHTML for SVG strings) from the `h()` paragraph.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/skills/building-editor-sections/references/rubric.md: S4 now reads "charts are native DOM marks". I also reworded its score anchors so they no longer mention the wedge-fill and fill checks.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/agents/change-reviewer-agent.md: the description and the browser-traps bullet now state the native-chart rule: no `html:` or SVG string in a section file, and `-webkit-mask-image` beside every `mask-image`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/references/component-inventory.md:
  - The S3 surface line, row 14 (`SVG/CSS` became `CSS`), rows 15 to 17, the S3 intro and cards 15 to 17 now describe native marks (`.an-chart`, `.ch-ribbon`, `.ch-band`, `.ch-dot`, `.ch-rule`, `.ch-circle`, `--series`).
  - Cites into `app-helpers.mjs` that pointed below the deleted line shift by -1 (lines 43, 112, 116, 123, 147, 155, 243, 259).
  - I reworded the cite on line 388 so the citation gate stays green.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/references/decision-records.md: added ADR-035 before `## Quick map`, with Context, Decision, Rejected, Consequences and a PROPOSED Status line. Its Quick-map row sits after the ADR-032 row.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/figma/plugin/ui.html: rebuilt by `npm test`'s generator. Kept for CI's drift gate.

## Checks
- `python3 .../redck.py record .sdlc/native-dom-charts/step-5/handoff.md`, run before any edit: exit 0, "recorded 5 pre-edit control(s) red".
- Criterion 68 `! grep -qF 'innerHTML' src/ui/app-helpers.mjs`: pass.
- Criterion 69 (`dom-charts.mjs` prints `h() sets no innerHTML`): pass.
- Criterion 70 (`<svg` injected into `geometry.js` through a patched readFileSync): the gate fails and names `src/ui/sections/geometry.js`. Pass.
- Criterion 71 (CLAUDE.md, skill and agent records): pass.
- Criterion 72 (component inventory): pass.
- Criterion 73 (ADR heading, Quick-map row, heading before Quick map): pass, with ADR-035.
- Criterion 74 (the six `charts-*.png` names in `smoke.mjs`): pass.
- `node test/repo/citations.mjs`: first run found 1 stale cite (component-inventory.md:388, after my edit). Reworded it; the rerun reports STALE 0.
- Criterion 75, `npm test` through gate_lock:
  - First run: rc 0, all 56 test files passed. The guarded files' shasum changed because `figma/plugin/ui.html` was rebuilt.
  - Second run: the full criterion passes (rc 0, shasum unchanged).
- Criterion 76, `npm run build` through gate_lock: exit 0.
- Criterion 77, `npm run smoke` through gate_lock: SMOKE PASS. All 18 new chart assertions pass:
  - color: 4 `.an-chart`, 4 ribbons;
  - typography: 3 `.an-chart`, 39 ribbons, mono mask a repeating-linear-gradient;
  - geometry: 3 `.an-chart`, 6 ribbons, 2 `.ch-rect`.
  All six PNGs exist and are non-empty.
- Criterion 78 (guard), `gate:corpus-reset` through gate_lock: exit 0, HEADLESS BOOT PASS. The log's one "license revalidation failed (kept cached): Error: network" line is a logged fallback, not a failure.
- Criterion 79 (guard), the seven colour legs one at a time through gate_lock: exit 0, no `red leg` line, chroma-envelope last and passing. The run outlasted the 600 s Bash timeout, so the harness moved it to the background. I waited in the foreground until it finished.
- `node test/repo/em-dash.mjs`: clean.

## Notes
- redck recorded 5 of the 6 `(red)` controls. Criterion 73 (ADR) is not in `red-checkpoint.jsonl`: 5 lines, none mention `decision-records`. I did not run `record` again after editing.
- ADR number: the highest `## ADR-` on this lane is 033 and on `origin/main` (just fetched) is 034, so this one is ADR-035.
- `figma/plugin/ui.html` is changed in the tree on purpose: these are the bytes `npm test` rebuilt, kept so CI's drift gate passes (adapter section 1).
- The 00-synthesis.md and 03-stores-and-persistence.md cites into `app-helpers.mjs` all point above line 324, so the deletion did not move them and they are unchanged. In the inventory, only the cites below line 324 moved; the `:319` cite for `h` still points at `h`.
- No commits, no throwaway worktrees, and nothing pushed.
