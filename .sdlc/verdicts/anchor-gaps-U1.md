---
kind: verdict
plan: anchor-gaps
unit: U1
ticket: "#740, #744"
branch: unit/ag-U1
base: bb13fa50
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-26
---

# Verdict anchor-gaps U1 · 🔴 · every plan row is met; the backfill can undo a user's hue edit

verdict: 🔴
sha: dcbbf259b3bbdc6e620faee7fd84a539c0a1c1b1

`unit/ag-U1` at `dcbbf259`. The evidence ran at `5de45b6a` (`/tmp/v13/ag-U1-verify.md`); `dcbbf259` adds only the
review record's `verdict:` line (`1 file changed, 2 insertions(+)`), so the rows carry, and I reread the records there.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| M1 | the backfill anchors only what is still a default row (the plan's aim; its Grades note names this class "silent data corruption in every user's stored kit") | 🔴 | mine, `src/ui/app-helpers.mjs` at `dcbbf259`: `defaultRows.find((r) => sameRow(p, r)) \|\| DEFAULT_PALETTES.find((r) => sameRow(p, r))` tries both tables whatever `stored.hueSpace` says. Default hues are integers and differ between the forms (`Primary` `259` in the OKLCH form, `267` raw), and the hue slider steps by `1`. The run built the case: an OKLCH-form kit from before v5 with Primary dragged to `267` reads `stamped: #0C5DCC hueSpace: oklch stops differing: 24 of 25`, and the result equals the fresh default ramp, so the user's edit is undone on load. The reverse (a raw doc with Primary at `259`) reads `stamped #0C5DCC cam16 differing 23 of 25`. The plan's Risks row covers only an edit equal to a default in its own form | the one-line gate on `stored.hueSpace === "cam16"` in a throwaway clone: `PASS: ui-persistence clears all [gate] predicates`, and the `267` case is no longer stamped (`false`) |
| CL | the CHANGELOG entry is true of the change | 🔴 | `CHANGELOG.md:19` says any palette `a slider touched` stays parametric; the M1 case is a slider-touched palette that is stamped | the same case under the gate: not stamped, so the sentence becomes true |

What unblocks: a plan revision ruling on M1, most simply the hue-space gate plus a sixth sub-gate that pins the
cross-form case, and the CHANGELOG sentence made true. That changes code, so the next pass reruns U1-2 to U1-5,
P1, P2 and smoke.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| R | the unit's records | 🟢 | mine at `dcbbf259`: the review's line 68 reads `verdict: 🟢`; `verdicts 163 graded 163 bad 0` | at `5de45b6a` the same check read `bad 1` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 53 test files passed`, TESTS `53`, tree `0` (under load) | the `"scrimX` clone: exit `1` |
| P2 | `npm run build`, the baseline's KB cell | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4120.3 KB`; `ok    ui.html: baseline 4120.3 KB, tree 4120.3 KB` | a brace removed from `backfillDefaultAnchors`: build exit `1` |
| SM | `npm run smoke` (`src/ui/` changed) | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, exit `0` | run `35785765215` shows the smoke step can go red |
| P3 | branding and dashes | 🟢 | `branding: clean (788 files scanned)`, `em-dash: clean (796 files scanned)`, added `0` | a maker-brand copy: `FAIL: 3` |
| P4 | scope wall | 🟢 | `0`, `1 1`, `0`, `0` | the four-name fixture: `2` |
| U1-1 | the seam is wired and pure on a current doc | 🟢 | `1`, `1`, `1`, `true` | the base: `TypeError: a.backfillDefaultAnchors is not a function` |
| U1-2 | five sub-gates in `persist.mjs` | 🟢 | `PASS: ui-persistence clears all [gate] predicates`, `stored-anchors` `11` | the backfill returning its argument: exit `1`, `FAIL  stored-anchors` |
| U1-3 | a stripped default kit renders as the fresh one | 🟢 | `0 of 16 16` | through `p.hydrate(s)` alone: `16 of 16 0` |
| U1-4 | the raw legacy form covered, an edited row not | 🟢 | `cam16 16 15 false` | the raw table dropped: `cam16 1 1 false`, persist exit `1` |
| U1-5 | the CHANGELOG entry exists, the source diff bounded | 🟢 | `1`; `33 2` | three extra lines replaced: `36 4` |
| M2 | `DEFAULT_PALETTES` exported unfrozen | 🟢 | no caller mutates it: `app-helpers.mjs` reads it, `test/ui/persist.mjs` maps and copies it; `defaultDocument()` spreads each row of primitives | the `git grep DEFAULT_PALETTES` caller list |

Carried, 🟡: DD9, #755, and R53's one `STALE time test` line, the same at the base.

verdict: 🔴
sha: dcbbf259b3bbdc6e620faee7fd84a539c0a1c1b1

## Pass 2 · 2026-09-26 · `de9073e7` (revision 5): 🟢

Code `d33eadb8` reads one default table by `stored.hueSpace`; U1-6 adds the cross-form sub-gates; the CHANGELOG sentence
is restated. The evidence run is `/tmp/v13/ag-U1-verify-p2.md`, rerun at the head. Review r2 ends `verdict: 🟢`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| M1 | the backfill anchors only what is still a default row of the doc's own form | 🟢 | the pass 1 case, an OKLCH kit with Primary at `267`: `anchor none`, `0 of 25` stops moved (pass 1: stamped, `24 of 25`); the raw doc at `259`: `anchor none`. Every row whose hue differs across forms dragged onto the other form's default, both ways: `15` of 15 not stamped. `hueSpace` absent, `null`, `"cam16"`, `"oklch"`, `"hct"`, `""`: the table follows the form the doc renders in | pass 1's both-tables lookup restored: `oklch true 16 cam16 true 16`, and `persist.mjs` exit `1` with `FAIL  stored-anchors, (f) cross-form` |
| U1-6 | one table by hue space, cross-form not stamped | 🟢 | `oklch false 15 cam16 false 15`; `cross-form` `5`; `hueSpace` inside the function `1` | the restore above |
| CL | the CHANGELOG entry is true of the change | 🟢 | it now says a palette moved off its form's row, `including onto the OTHER hue form's own default value`, stays unanchored, which M1's probes show | pass 1's sentence was false on the same case |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 53 test files passed`, TESTS `53`, tree `0` | the `"scrimX` clone: exit `1` |
| P2 | build and the baseline's KB cell | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4120.8 KB`; `ok    ui.html: baseline 4120.8 KB, tree 4120.8 KB` | a brace removed: build exit `1` |
| SM | `npm run smoke` | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser` | run `35785765215` red at `Run npm run smoke` |
| P3 | branding, dashes, the em dash gate | 🟢 | `branding: clean (789 files scanned)`, `em-dash: clean (797 files scanned)`, added `0` | a maker-brand copy: `FAIL: 3` |
| U1-1 to U1-4 | as pass 1 | 🟢 | `1`, `1`, `1`, `true`; `PASS: ui-persistence clears all [gate] predicates`, `stored-anchors` `15`; `0 of 16 16`; `cam16 16 15 false` | the base's `TypeError`; the backfill returning its argument: exit `1`; `16 of 16 0`; the raw table dropped: `cam16 1 1 false` |
| U1-5 | CHANGELOG present, source diff bounded | 🟢 | `1`; `39 2` against the base | three extra lines replaced: `42 4` |
| R | records | 🟢 | `verdicts 164 graded 164 bad 0` | pass 1 at `5de45b6a`: `bad 1` |

Notes, 🟡:
- P4 prints `1`: `.sdlc/plans/prompt-audit.md`, carried in by the Orchestrator's board syncs (`c379a774`, `d9e3fd35`), a
  frontmatter and checkbox change that main already holds. It must read `0` at pre-land, after main is merged in; the run's
  trial merge conflicts in `board.md` and `prompt-audit.md`, to be resolved at that sync.
- The handoff's U1-5 figure `54 18` is the commit's own numstat, not the diff against the base (`39 2`, which passes).
- Carried: DD9, #755, and R53's one `STALE time test` line, the same at the base.

verdict: 🟢
sha: de9073e714589834b6d8ba023944dc51ee827b1d
