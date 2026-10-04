FAIL
---
kind: review
plan: pane-context
unit: U7
seat: reviewer
pass: 1
reviewed: d2311bef
base: 96409def
ticket: "#785"
written: 2026-10-04
---

# pane-context U7 · reviewer pass 1 · FAIL (one live false hit, one reference-doc slip, one out-of-lane comment)

Diff `96409def..d2311bef` on `unit/pc-U7`. The comment repair, the LLD, the reactivity row and every gate are good. The class sweep left one live false statement standing, SPEC AC-006, which the lead asked to be decided against the code.

## Findings

| # | Severity | Where | What | Fix |
|---|---|---|---|---|
| F1 | blocking | `docs/spec/spec-muted-base-key-spikes.md:441` (AC-006, `:439` before the REQ-005 edit) | "tones equal within 1e-9 across group targets" is false against the code. Probe at head, `paletteStops({hue:267,chroma:g,skew:-20})` against g = 100, max stop tone delta: perceptual 0.177 (g 30), 0.177 (60), 0.179 (95); peak 0.185, 0.200, 0.182; even 0 exactly. The damper holds tone only to the two pixels' rounding floors (the 8-bit staircase), which is what `test/engine/tonal.mjs` `group-chroma-damper` (v) asserts (`:2201-2221`); no 1e-9 tone gate across group values exists. The banner at `:14` names AC-006's fixtures, not this clause, so it is neither true, banner-superseded nor listed as the pre-#785 record. The handoff classed it "true as written" | Reword the clause, in lane: "the damped stop keeps its at-100 L* within the two pixels' rounding floors on perceptual and peak, exact on even (`group-chroma-damper` (v))" |
| F2 | minor | `docs/reference/references/knowledge-02-tonal-scale.md:259` | "the model hands the resolved number to `paletteStops`/`okhslStops` AS the palette's own `chroma`". `okhslStops` is module-private (`git grep okhslStops -- src scripts` outside `tonal.js` is empty) and sits below the `:946` re-entry, so it never receives the group value. Same class, in lane (`docs/reference/references/*.md`, class hits only). The handoff table classed the file's `:244-284` true | Drop `/okhslStops` |
| F3 | minor, needs a lane decision | `test/ui/headless-boot.mjs:4245` | The comment says chroma reaches the anchored render "via `groupTarget`/`chromaEnvelope`". `detunedChroma = pal.chroma - 13` (`:4239`) is below 100 for every palette, so it reaches the render through `dampStops`; `groupTarget` (`tonal.js:855`) only ever sees 100. Same class. The handoff classed it true because the variable still exists. `headless-boot.mjs` is not in the U7 lane (only `test/engine/tonal.mjs` and `exports.mjs`), so this is an Orchestrator question, not a silent edit | Orchestrator adds the file (one comment) to the lane, or records it as a follow-up with F2 |

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | tonal.js comment true; diff outside comments empty | pass | `:109-111` read against `:946` (`if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, ...`), `groupDamper` and `dampStops` `:1486-1540`; all three `hueAnchorFrac` callers (`:830`, `:972`, `:1390`) sit in `paletteStopsAnchored`, `okhslStops`, `okhslStopsAnchored`, reachable only after the re-entry. `git diff -U0 96409def..d2311bef -- src test scripts` minus `describe-mcp-assets.js`, with comment-marker lines removed, prints nothing. Assets: line-by-line python diff of old against new, `ui.html` lines 2760 to 2762 and 11060, `describe-mcp-assets.js` line 65, all only the old comment against the new one (+4 bytes per embedded copy, +8 for the two in ui.html) |
| 1a | note | nit, not a finding | `test/engine/tonal.mjs:419-422` calls the exported `hueAnchorFrac` directly with chroma 76, 25, 40, 150; "always 100 here" holds for the ramp build, not for a direct engine call. The old text said so ("the palette's own chroma on a direct engine call"); the new one drops it. Harmless, optional to restore |
| 2 | class sweep re-run | partial, see F1 to F3 | Sweep A at head: 16 hits, files and counts as the handoff (`tonal.js` 4, `spec` 3, `exports.mjs` 2, `shadcn-baseline.css` 2, `tonal.mjs` 2, `headless-boot.mjs` 1, `decision-records.md` 1, `describe-mcp-assets.js` 1); `docs/tickets` and dated `docs/reference/reviews` have none. Table sums: 1 + 8 + 6 + 1 + 1 = 17 at base, 16 at head. Sweep B re-run with `git grep` (so `src/ui/sections/` is included): 172 at head = the handoff's 169 at base, plus 2 in the REQ-005 parenthetical, plus 1 in `src/ui/sections/color.js:2033` (a resolver comment, not the class). Table sums to 169 |
| 2a | `spec:104` REQ-005 | true | the parenthetical matches `groupDamper`/`dampStops` and the hue hold (`dampStops` solves the hue back in OKLCH on every path); `AC-005` passes `rampChroma` through `paletteStops`, gate green |
| 2b | `spec:347` EX-2 | superseded by banner, ok | the `chroma 30` Neutral sentence is false at head, and the `:14` banner names it ("EX-2's chroma 30 Neutral ramp no longer holds") |
| 2c | `spec:439` (AC-006 at base) | FALSE | F1 |
| 2d | `test/engine/tonal.mjs:1778` | true | a control description: the patch at `:1799` rewrites `intendedS` to `anchorChromaBasis(..., 1)`, a hypothetical target of 1 |
| 2e | `test/engine/exports.mjs:490` (and `:480`) | history, ok | dated "#681 re-capture ... revision 17" log entries describing what moved then |
| 3 | LLD `:62`, `:149`; reactivity `:27` | true | `GROUP_DEFAULTS` in `src/ui/persist.js:44-49` is material 100/60, brand/system/data 100/100, data locked, as both LLD snippets; `grep -n 'baseChroma: 30'` on the LLD lists nothing. Reactivity row: `_liveRefreshNow` is `app.js:291`, its early return `:292`, closing brace `:334`, `liveRefresh` `:276`, `edit(...,{live:true})` `:262`; `canvas-bg`, example card, damping graph, selection label all present; `git diff --stat` for the file is 1 line, the row only |
| 4 | lane | pass with one disclosed deviation | all seven changed files are in the U7 lane or are the handoff. LLD `:149` is outside the lane's `(:62)` but the same file and one token, disclosed in the handoff, and C7.2's negative control needs it; accepted |
| 5 | `npm test` | pass | load 5.7, 0 test processes at start, `NODE_OPTIONS` unset: rc 0, `all 54 test files passed`, `git status --porcelain` empty after (`/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U7-rev/nt.log`) |
| 6 | U+2014 | pass | `node test/repo/em-dash.mjs`: `clean (1156 files scanned)`; zero U+2014 bytes in the added diff lines |

R98: none found
