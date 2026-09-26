---
kind: verdict
plan: anchor-gaps
unit: U1
ticket: "#740, #744"
branch: unit/ag-U1
base: bb13fa50
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 1
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
