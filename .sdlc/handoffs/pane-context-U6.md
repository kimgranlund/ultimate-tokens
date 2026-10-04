# Handoff: pane-context U6 (#785)

Branch: `unit/pc-U6` (off `plan/pane-context` @ 24b9d01c), head recorded in the commit below.

## Files

| File | Change |
|---|---|
| `.sdlc/records/cards/ADR-026.md` | Decision line: stop 500 is the anchor only at group 100 (R94); amended-by row names the five amendments |
| `.sdlc/records/index.md` | line 41 lineage cell names the five amendments |
| `docs/spec/spec-muted-base-key-spikes.md` | #785 banner names EX-1 and AC-003(a); EX-1 and AC-003(a) state the chroma-100-only identity and the damped fixture |
| `test/engine/tonal.mjs` | two comment lines above the `hpg-tonal-intensity-legacy` case header, no code line |

No asset regenerated: `npm test` left the tree clean. `.sdlc/baseline.md` untouched (no ui.html movement). The plan file is untouched (C6.4 belongs to the Orchestrator).

## Ran

| Command | Result |
|---|---|
| `npm test` (NODE_OPTIONS unset, 0 competing gate processes) | all 54 test files passed, exit 0, tree clean after |
| `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` |
| `node test/repo/em-dash.mjs` | clean (1150 files) |
| `sh .sdlc/checks/card-amendment-check.sh` | `stale total: 0` |
| `FORCE_COLOR=0 node test/engine/tonal.mjs` | exit 0 |
| `git diff --stat 24b9d01c` | the four lane files only |

## Criteria

| # | Evidence |
|---|---|
| C6.1 | `grep -c 'in all three tone modes' .sdlc/records/cards/ADR-026.md` reads `0`; the Decision line reads "at ramp stop 500 only at group 100 (R94: a group value below 100 damps the whole ramp, stop 500 included, ...)"; the amended-by row and `index.md:41` name #701, #725 (R69), #785 (R94 to R98), #766 (R85, R87), #785 (#766) |
| C6.2 | `grep -n 'EX-1' docs/spec/spec-muted-base-key-spikes.md` lists `:14` (the banner) and EX-1 with the chroma-100-only sentence (20/25 perceptual, 13/25 even) |
| C6.3 | `git diff -U0 test/engine/tonal.mjs \| grep '^+[^+]' \| grep -vc '^+//'` reads `0`; the header says 14 of 16 defaults, not pre-0.2.0 identity; SPEC AC-003(a) says the same; `tonal.mjs` exits 0 |
| C6.4 | not this builder's lane (Orchestrator, plan file) |
| C6.5 | the Ran rows above; `git status --porcelain` empty after commit |

## Pass 2 (review pass 1 FAIL, findings 1 to 3; widened lane C6.1, C6.2)

| File | Change |
|---|---|
| `docs/spec/spec-muted-base-key-spikes.md` | banner names REQ-003 and AC-006; REQ-003 engine level and its IF AND ONLY IF clause say the identity holds for chroma-100 subjects only since #785; AC-006 says the 0.2.0 pin changed (#785 regenerated the fixture, 512 of 800 cells); EX-1 sentence adds 22/25 peak |
| `.claude/skills/color-math/SKILL.md` | stop 500 equals the anchor "at group base chroma 100 (a group value below 100 damps the whole ramp, stop 500 included, R94)" |
| `docs/reference/references/glossary.md` | same qualifier in the Anchor entry |
| `docs/reference/rubrics/quality-rubric.md` | same qualifier in the anchored-palette checklist line |
| `docs/reference/references/knowledge-02-tonal-scale.md` | sweep hit (section 8.1, `:277`): the same IF AND ONLY IF byte-identity claim as REQ-003, now chroma-100 subjects only; outside the named lane, same stale fact |
| `test/engine/tonal.mjs` | the `hpg-tonal-intensity-legacy` header line now opens "HISTORICAL framing (superseded ... by #785 ...)"; comment lines only, non-comment changed lines `0` |

Sweep (`in all three tone modes`, `byte for byte`, `byte-identical`, plus an anchor/stop-500 regex, over `docs/`, `.claude/skills/`, `.sdlc/records`, `src/`, `test/`, `plugin/`, `mcp/`): the only live paletteStops or stop-500 identity claims left were the three Finding 2 files and `knowledge-02:277`. Left alone on purpose: `decision-records.md:742` (ADR body, amended at `:792`), `knowledge-02:264` and `:428` (already qualified), SPEC EX-2 "Secondary (chroma 100) is byte-identical" (true, chroma 100), `lld-muted-base-key-spikes.md:169` (derived-live rule, gated by `shell.mjs` ac003b, which already handles #785), `tonal.mjs:679` (carve-out history), CHANGELOG, archives, handoffs, questions.

| Command | Result |
|---|---|
| heavy-process count before `npm test` | `0` |
| `npm test` (NODE_OPTIONS unset), after the last edit | all 54 test files passed, exit 0, tree shows only the intended edits, no regenerated asset |
| `npm run build` | exit 0, `figma/plugin/ui.html` 4170.7 KB, tracked tree unchanged by it |
| `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` (ui.html KB did not move, no Correction line) |
| `node test/repo/em-dash.mjs` | clean (1152 files) |
| `sh .sdlc/checks/card-amendment-check.sh` | `stale total: 0` |

## Pass 2 continuation (rework note `pane-context-U6-rework.md`, reviewer p2 PASS sweep notes)

| # | Change |
|---|---|
| 1 | `docs/reference/rubrics/acceptance-criteria.md` AC-T6: stop 500 `=== anchor` now "at group base chroma 100 (a group value below 100 damps the whole ramp, stop 500 included, R94)", wording copied from `quality-rubric.md` |
| 2 | `test/engine/anchor.mjs` C3 header (`// ── anchor-ramp` block): same qualifier, comment lines only, non-comment changed lines `0` |
| 3 | SPEC banner `:14`: "The byte identity ..." capitalised |
| 4 | Chose to NAME, not correct: the banner now lists REQ-001's shipped defaults (`:73`), REQ-003's "Neutral (29 vs 30)" (`:95`), AC-007's `chroma 30` Neutral ramp (`:443`), G2 (`:659`) and the Open follow-up (`:665`) as the pre-#785 record that stays as written (EX-2 was already named). Reason: these are ratified-history rows of a superseded-in-part SPEC, and the banner is the SPEC's own mechanism for that |
| 5 | Multi-line re-sweep (whitespace-collapsed, `stop 500` near `anchor` plus an equality word, over `docs/`, `.claude/skills`, `plugin/`, `mcp/`, `src/`, `test/`, `.sdlc/records`): one more live hit fixed, `glossary.md` Lift entry ("stop 500 stays byte-exact to the anchor at any lift") now carries "(at group base chroma 100, R94)". Already qualified or about the pre-damper construction, left: ADR-026 body and amendments, `knowledge-02` `:264` `:428` and the rows below, `anchor.mjs:1503-1507`, `tonal.mjs` construction comments |

Not touched, out of lane (src comments, editing them moves the bundles): `src/engine/tonal.js:633` ("renders stop 500 as that anchor's OWN color VERBATIM, in every tone mode", the anchored builder's own contract, true before `dampStops` runs) and `src/ui/persist.js:150` ("the ramp's stop 500 renders verbatim"). The Orchestrator can widen the lane if wanted.

## Pass 3 (owner ruled A, `.sdlc/questions/pane-context-prepr-p2.md` Question 2; verdict pass 1 🔴, five live lines)

Grade l4. Wording and comments only (R98, no shim, no logic). Base `edeeb8d9`.

### The five lines

| Line | Fix |
|---|---|
| `.claude/skills/color-math/references/foundations.md:132` | "Stop 500 returns the stored `anchor` verbatim at group base chroma 100 only (a group value below 100 damps the whole ramp, stop 500 included, R94), and only when the source sits inside `[9.95, 95.05]` L\*", wording from `knowledge-02-tonal-scale.md:428` |
| `src/engine/tonal.js:631-638` | the anchored-ramp header says the VERBATIM stop 500 is this function's own contract and `paletteStops` damps it below group 100 (R94); paragraph reflowed to the same 7 lines |
| `src/ui/persist.js:150` | "(and, from U2, the ramp's stop 500 at group 100, R94 damps it below) renders verbatim", same 2 lines |
| `scripts/gen-categories.mjs:131` | "(group 100 only, R94) render verbatim", same line count |
| `docs/lld/lld-muted-base-key-spikes.md:169-172` | the `chroma == rampChroma` sentence is past-tensed and says that since #785 it holds only for a palette whose group is at 100 (14 of 16 defaults moved, Secondary and Warning did not); the #785 banner `:14` names it |

Every `src`, `scripts` and `test` edit is line-count neutral. The first pass shifted `persist.js` by one line and `npm test` went red on `reviews/2026-08-20-reactivity/00-synthesis.md:79` (`persist.js:655-666`, the citation gate), so the comments were reflowed instead of re-homing a review record.

### Found by the class sweep, outside the five (small wording, same class)

| Line | Fix |
|---|---|
| `docs/reference/references/knowledge-02-tonal-scale.md:15` | the section 9 TOC gloss "exact at `prime.DEFAULT` and at stop 500" now reads "... and at stop 500 at group base chroma 100" |
| `src/engine/tonal.js:755-756` | the monotone repair's "stop 500 ... stays byte-exact by contract" now says "at group 100 (R94 damps after)", same line count |
| `test/ui/headless-boot.mjs:1505-1506` | the #681 U2 comment "the stop the anchor guarantees byte-exact" now says "at group 100 (R94)", same line count |

These three are outside the lane line as written (knowledge-02 is in it for section 8.1 only; `tonal.js` for `:631-633` only; the shim not at all). They are comment or TOC wording and the sweep class demands them. The Orchestrator should widen the lane line to name them, or tell me to revert them.

### Class sweep (C6.1)

Method: every tracked file under `docs`, `.claude`, `plugin`, `mcp`, `src`, `scripts`, `test`, line breaks collapsed (a 4-line window with comment, list and table markers stripped), matching `stop 500`, `verbatim`, `rampChroma`, `byte for byte`, `0.2.0 output`, case-insensitive. Excluded as history: archives, `docs/tickets`, `reviews/`, CHANGELOG, amendments, verdicts, handoffs, questions, generated `*-assets.js` and `type-fonts.js`, fixtures and JSON. The script is `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U6-p3/triage.py` (scratch only, not committed). Result: 546 hits (537 from the script plus 9 in the LLD, swept by hand because the LLD is in the lane): 433 true as written, 74 already qualified, 27 history, 12 fixed (the hit lines of the eight edits above).

Dispositions, with the reason class for each:

| Disposition | Meaning |
|---|---|
| fixed | edited in this pass |
| already qualified | the line or a neighbour within 3 lines carries group 100, R94, #785 or the damper; read by hand for docs, SKILL, rubrics, SPEC, glossary, the engine, the shim and the gates |
| history | ADR bodies (append-only, each amendment carries R94), the panda-park SPEC narrative of #681, the fact-sheet row (a release statement about #681 that is still true of that release), `tonal.js:1163,1189` (what `okhslStops` did when the strict seed landed) |
| true as written | an identifier (`rampChromaOf`, `rampChromaFor`), `verbatim` in the sense of copied text or a served field, `stop 500` as a position (chroma at stop 500, gates and measurements), the prime swatch (`prime.DEFAULT` equals `anchor` byte for byte, unconditional), or a function-level statement about `paletteStopsAnchored` / `okhslStopsAnchored` before the damper (`tonal.js:671-676,837,1308-1312,1332`; the contract is qualified once, at `:633`) |

| File | Disposition | Hit lines |
|---|---|---|
| `.claude/skills/adding-export-formats/references/foundations.md` | true as written | 23 |
| `.claude/skills/adding-semantic-roles/SKILL.md` | true as written | 52 |
| `.claude/skills/adding-semantic-roles/references/foundations.md` | true as written | 85 |
| `.claude/skills/building-editor-sections/references/foundations.md` | true as written | 66 |
| `.claude/skills/color-math/SKILL.md` | already qualified | 54, 55, 56, 67, 113, 155 |
| `.claude/skills/color-math/SKILL.md` | true as written | 124 |
| `.claude/skills/color-math/references/best-practices.md` | true as written | 8, 10, 42 |
| `.claude/skills/color-math/references/foundations.md` | fixed | 132, 133 |
| `.claude/skills/color-math/references/foundations.md` | true as written | 124, 160, 175, 182 |
| `.claude/skills/color-math/references/rubric.md` | true as written | 12 |
| `.claude/skills/geometry-system/references/foundations.md` | true as written | 184 |
| `.claude/skills/lemon-squeezy-schemas/SKILL.md` | true as written | 50 |
| `.claude/skills/maintaining-brand-kit-mcp/SKILL.md` | true as written | 139 |
| `.claude/skills/maintaining-brand-kit-mcp/references/best-practices.md` | true as written | 45, 50, 98 |
| `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md` | true as written | 120, 131, 138 |
| `.claude/skills/maintaining-brand-kit-mcp/references/rubric.md` | true as written | 12 |
| `.claude/skills/maintaining-figma-plugins/SKILL.md` | true as written | 39, 63, 101 |
| `.claude/skills/maintaining-figma-plugins/references/foundations.md` | true as written | 65, 132 |
| `.claude/skills/ultimate-tokens-brand-voice/SKILL.md` | true as written | 35 |
| `docs/marketing/fact-sheet.md` | history | 18, 49 |
| `docs/marketing/voice/voice-platform.md` | true as written | 119 |
| `docs/prd/prd-0001-app-shell.md` | true as written | 24 |
| `docs/reference/SKILL.md` | already qualified | 96, 100, 101 |
| `docs/reference/SKILL.md` | true as written | 205 |
| `docs/reference/colors/adia-16-family-residuals.md` | true as written | 4 |
| `docs/reference/references/component-inventory.md` | true as written | 37 |
| `docs/reference/references/decision-records.md` | history | 202, 217, 445, 595, 734, 740, 742, 754, 755, 756, 758, 776, 798, 800, 828, 877, 892, 902 |
| `docs/reference/references/glossary.md` | already qualified | 22, 25, 26 |
| `docs/reference/references/glossary.md` | true as written | 14, 21, 39 |
| `docs/reference/references/knowledge-02-tonal-scale.md` | already qualified | 36, 124, 264, 389, 430, 431, 451 |
| `docs/reference/references/knowledge-02-tonal-scale.md` | fixed | 15 |
| `docs/reference/references/knowledge-02-tonal-scale.md` | true as written | 26, 58, 107, 130, 186, 209, 210, 248, 251, 255, 259, 280, 355, 395, 424, 435, 436, 441, 442, 461, 462, 463, 471, 472 |
| `docs/reference/references/knowledge-04-export-formats.md` | true as written | 222, 233, 332, 335, 381, 400 |
| `docs/reference/references/radix-park-adaptation.md` | true as written | 4 |
| `docs/reference/references/spec-draft.md` | true as written | 104 |
| `docs/reference/rubrics/acceptance-criteria.md` | already qualified | 32, 34 |
| `docs/reference/rubrics/quality-rubric.md` | already qualified | 49, 50 |
| `docs/reference/rubrics/quality-rubric.md` | true as written | 41 |
| `docs/site/describe-palette-spec.md` | true as written | 82, 164, 305, 410 |
| `docs/site/mcp-hosting-spec.md` | true as written | 39 |
| `docs/spec/spec-muted-base-key-spikes.md` | already qualified | 103, 343, 345, 425, 429 |
| `docs/spec/spec-muted-base-key-spikes.md` | true as written | 78, 80, 91, 369, 421, 432, 438 |
| `docs/spec/spec-panda-park-ui-exports.md` | history | 93, 300, 463, 480, 488, 550 |
| `mcp/describe-eval-runner.mjs` | true as written | 59 |
| `mcp/describe-kit-core.mjs` | true as written | 240, 312 |
| `mcp/describe-rubric.mjs` | true as written | 83 |
| `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` | true as written | 79 |
| `scripts/audit-citations.mjs` | true as written | 335, 869, 950 |
| `scripts/bundle.mjs` | true as written | 28 |
| `scripts/gen-categories.mjs` | fixed | 131 |
| `scripts/gen-categories.mjs` | true as written | 92, 102, 226, 236, 245, 283, 374, 395, 477, 522 |
| `scripts/gen-describe-mcp-assets.mjs` | true as written | 21 |
| `scripts/gen-figma-binder-code.mjs` | true as written | 12, 15, 18, 47, 58, 75, 83, 92 |
| `scripts/gen-plugin-pack.mjs` | true as written | 19, 47 |
| `scripts/lib/envelope-measure.mjs` | already qualified | 6 |
| `scripts/lib/envelope-measure.mjs` | true as written | 4, 5, 17, 28, 36, 37, 44, 52, 90, 118 |
| `scripts/report-preset-fidelity.mjs` | already qualified | 307 |
| `scripts/report-preset-fidelity.mjs` | true as written | 4, 6, 31, 45, 108, 227, 228, 252, 260, 261, 291, 328, 346, 347, 497, 583, 595, 599, 743, 755, 756, 791 |
| `src/engine/ds-export.js` | true as written | 11, 75, 85, 94, 111, 181, 275, 1045, 1188, 1344 |
| `src/engine/ds-gates.js` | true as written | 6, 166, 193 |
| `src/engine/exports.js` | true as written | 36, 272, 274, 278, 281, 340, 507, 513, 1103, 1313 |
| `src/engine/geometry.mjs` | true as written | 74, 100, 104 |
| `src/engine/icon-systems.mjs` | true as written | 33, 41 |
| `src/engine/okhsl.js` | true as written | 3 |
| `src/engine/prime.mjs` | true as written | 133, 169, 246 |
| `src/engine/resolve.mjs` | true as written | 12, 17 |
| `src/engine/tonal.js` | already qualified | 570, 597, 729, 734, 845, 1188, 1362 |
| `src/engine/tonal.js` | fixed | 633 |
| `src/engine/tonal.js` | true as written | 63, 392, 450, 603, 670, 671, 674, 675, 698, 754, 832, 834, 835, 836, 839, 861, 983, 1006, 1044, 1162, 1190, 1274, 1309, 1311, 1314, 1331, 1332, 1454, 1487, 1488 |
| `src/engine/type.mjs` | true as written | 43, 757 |
| `src/ui/app-helpers.mjs` | true as written | 1, 847 |
| `src/ui/model.mjs` | true as written | 39, 221, 279, 451, 453, 457, 459, 638, 884, 947, 951, 957, 1141 |
| `src/ui/overlays/apply-gate.js` | true as written | 19, 110 |
| `src/ui/overlays/drawer.js` | true as written | 13, 253 |
| `src/ui/overlays/settings.js` | true as written | 7, 206 |
| `src/ui/persist.js` | already qualified | 149 |
| `src/ui/persist.js` | fixed | 150 |
| `src/ui/persist.js` | true as written | 38, 253, 611 |
| `src/ui/sections/color.js` | already qualified | 2015 |
| `src/ui/sections/color.js` | true as written | 6, 1732, 2033 |
| `src/ui/sections/geometry.js` | true as written | 7 |
| `src/ui/sections/typography.js` | true as written | 8 |
| `test/engine/anchor.mjs` | already qualified | 463, 468, 802, 805, 824, 867, 871, 1000, 1177, 1503, 1507 |
| `test/engine/anchor.mjs` | true as written | 72, 87, 144, 205, 464, 467, 471, 496, 505, 732, 818, 832, 854, 911, 983, 990, 1003, 1028, 1181, 1303, 1308, 1422, 1522, 1614, 1616, 1621 |
| `test/engine/categories.mjs` | already qualified | 6 |
| `test/engine/categories.mjs` | true as written | 16, 179, 265, 278, 343, 347, 350, 352, 353, 424, 456, 525, 549 |
| `test/engine/chroma-envelope-gate.mjs` | true as written | 4, 11 |
| `test/engine/even-dips-gate.mjs` | true as written | 48, 53, 67, 125, 179, 219, 220, 221 |
| `test/engine/exports.mjs` | already qualified | 475 |
| `test/engine/exports.mjs` | true as written | 448, 455, 460, 479, 487, 511, 525, 781, 791, 803, 1478, 1569, 2377 |
| `test/engine/prime.mjs` | true as written | 711, 750, 784, 788, 804, 1027 |
| `test/engine/semantic.mjs` | already qualified | 206 |
| `test/engine/semantic.mjs` | true as written | 187, 207, 342 |
| `test/engine/tonal.mjs` | already qualified | 434, 683, 687, 1883, 2037, 2161, 2169, 2190 |
| `test/engine/tonal.mjs` | true as written | 16, 117, 140, 237, 248, 323, 363, 410, 423, 439, 462, 499, 500, 543, 547, 663, 665, 669, 692, 735, 903, 1053, 1055, 1209, 1219, 1227, 1242, 1276, 1284, 1385, 1461, 1515, 1544, 1549, 1551, 1658, 1681, 1694, 1864, 1890, 1893, 1941, 1942, 1944, 1964, 1965, 1966, 1977, 1997, 2006, 2010, 2011, 2179 |
| `test/figma/binder.mjs` | true as written | 105, 729, 783 |
| `test/figma/plugin.mjs` | true as written | 1926 |
| `test/figma/style-plan.mjs` | true as written | 51, 52, 53, 54, 55 |
| `test/mcp/brand-kit.mjs` | true as written | 22, 182, 211, 214, 221, 224 |
| `test/mcp/core.mjs` | true as written | 46, 51, 63 |
| `test/mcp/describe-eval.mjs` | true as written | 27 |
| `test/mcp/describe-kit-core.mjs` | true as written | 41 |
| `test/mcp/describe-mcp-core.mjs` | true as written | 38, 39 |
| `test/mcp/describe-mcp.mjs` | true as written | 52 |
| `test/mcp/describe-rubric.mjs` | true as written | 41 |
| `test/plugin/hosted-pack.mjs` | true as written | 10 |
| `test/repo/branding.mjs` | true as written | 28 |
| `test/repo/em-dash.mjs` | true as written | 9, 10, 50, 900, 910, 920, 933 |
| `test/ui/headless-boot.mjs` | already qualified | 3572, 3586, 3597, 3637, 3638, 3647 |
| `test/ui/headless-boot.mjs` | fixed | 1505, 1506 |
| `test/ui/headless-boot.mjs` | true as written | 1513, 2410, 3564, 3568, 3571, 3579 |
| `test/ui/model.mjs` | true as written | 324 |
| `test/ui/persist.mjs` | true as written | 336 |
| `test/ui/shell.mjs` | already qualified | 238 |
| `test/ui/shell.mjs` | true as written | 55, 101, 204, 216, 217, 240, 243, 261, 263, 266, 268, 277, 279, 282, 291, 292, 350 |
| `docs/lld/lld-muted-base-key-spikes.md` | fixed | 170 (the `chroma == rampChroma` sentence, qualified in place; banner `:14` names it) |
| `docs/lld/lld-muted-base-key-spikes.md` | already qualified | 14 (the #785 banner) |
| `docs/lld/lld-muted-base-key-spikes.md` | true as written | 36, 41, 66, 69, 192, 203 (`rampChromaOf`, an identifier), 327 (U1's stored-anchor prime branch) |

### Gates

| Check | Result |
|---|---|
| `git diff -U0 edeeb8d9 -- src test scripts`, lines not starting `//` after trim | `0`; every changed line is a comment (`src/engine/tonal.js`, `src/ui/persist.js`, `scripts/gen-categories.mjs`, `test/ui/headless-boot.mjs`), and `src/ui/describe-mcp-assets.js` is a generated asset with the same comment moved |
| `npm test` (NODE_OPTIONS unset, 0 competing heavy processes) | all 54 test files passed, exit 0; regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` committed |
| `npm run build` | exit 0, `wrote figma/plugin/ui.html 4170.9 KB`, tree clean after |
| `baseline-agrees-check.sh` | read `STALE ui.html: baseline 4170.7 KB, tree 4170.9 KB`; `.sdlc/baseline.md` figure moved with a Correction line, now `stale total: 0` |
| `card-amendment-check.sh` | `stale total: 0` |
| `node test/repo/em-dash.mjs` | clean |
| `node test/repo/branding.mjs` | clean |
