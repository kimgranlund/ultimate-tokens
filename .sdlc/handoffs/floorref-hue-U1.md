# Handoff floorref-hue U1 · builder → reviewer

Branch unit/fh-U1 @ 3e815253 (code head), ticket #766. One file changed: `scripts/report-preset-fidelity.mjs` (new `--floor-ref` mode, header documented).

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C1.1 | `node scripts/report-preset-fidelity.mjs --floor-ref --base HEAD` | four rows (rendered/gate x STOPS/EXPORT_STOPS) with cells, moved, palettes, docs, max dC, histogram, 12 movers; exit 0; `0 moved cell(s) in total` | base with the floor scaled 1.6x (FLOOR_TARGET patch): gate STOPS 41,140 moved, rendered 50,783. Section 3 prototype (scratch, not committed) vs HEAD: rendered STOPS 3,870 moved / 1,522 palettes / 339 docs / 9.11 C; gate STOPS 6 / 3 / 1 / 0.60 C, matching section 2. C2.1 control (per-ramp constant at stop 50's rotated hue): gate STOPS 7 moved, 0.78 C. C2.2 control (anchored reference 450 only): rendered max dC 18.05 C on both stop sets | 🟢 |
| C1.2 | same, `--only default-kit` | 16 palettes; rendered and gate 304/400 cells, `0 moved cell(s) in total` | same 1.6x base: 217 to 294 moved on rendered, 183 to 255 on gate | 🟢 |
| C1.3 | `grep -c floor-ref scripts/report-preset-fidelity.mjs`; header read | `8`; header names #766, arguments, moved-cell meaning | at HEAD~2 (before the mode) `git grep -c floor-ref` prints nothing | 🟢 |
| C1.4 | `npm test` in the worktree | `all 54 test files passed`, tree clean | a failing test file in the same run would drop the count from 54 (suite stops at the first red) | 🟢 |

## Review pass 1 fixes (review `.sdlc/reviews/floorref-hue-U1-review.md`, PASS)

| Finding | Fix |
|---|---|
| F2 | scope-rule comments (header and `addDoc`) now give the real reason: the plan's own cell counts imply the scope, and Adia has no anchored palette so its rendered path equals its gate path |
| F3 | unused `defaultDocument` import dropped |
| F4 | not routed through `controlsOf`: it is a module-local function in `src/ui/model.mjs`, so using it means a src edit outside this unit. Stated in the script header instead (controls are the doc's own fields, equivalent while hydrate fills every field) |
| F1, F5 | planner and U2 dispatch items, no U1 change |

## Claims

| Claim | Evidence |
|---|---|
| Code head is 3e815253; the ran block below replays at it | `git rev-parse --short HEAD` prints `3e815253` before this record's own commit |
| Rendered path reads dampAmp-0 docs plus the kit; gate path reads all 344 docs | `subjects: 344 document(s), 3796 palettes`; rendered cells 71,820 / 94,500, gate 72,124 / 94,900 |
| The 12 hueShift palettes sit in the dampAmp-70 Adia doc (11) and BZZR (1, hueShift -1) | `/Users/kimba/.claude/jobs/8c58a81c/tmp/c.mjs` census: 12 palettes, none anchored |
| Prototype rendered EXPORT_STOPS reads 4,441 / 1,523 palettes / 339 docs, not the plan's 4,448 / 1,526 / 340 | plan's EXPORT row evidently included the Adia doc on the rendered path while its STOPS row (3,870) did not; the 7 cell, 3 palette difference is exactly Adia's gate-path movers |
| C1.1 control for C2.1 bites by one cell | gate STOPS 7 against the bound 6, max dC 0.78 vs 0.60; weak but `> 6` as written |

🟡 for the orchestrator: the plan's section 2 rendered EXPORT_STOPS figures (4,448 / 1,526 / 340 docs) are not reproducible by any single scope rule alongside its STOPS row; U2 should pin the tool's numbers. The C2.1 control margin (7 vs 6) is thin; a stronger control would rotate all 12 palettes to a different fixed stop.

~~~sh ran
node scripts/report-preset-fidelity.mjs --floor-ref --base HEAD | grep -E "^subjects|total"
npm test | tail -1
~~~

~~~out ran
subjects: 344 document(s), 3796 palettes (1 dampAmp != 0 doc(s), gate path only), toneMode forced to even
0 moved cell(s) in total
✓ all 54 test files passed
~~~
