PASS
---
kind: review
plan: pane-context
unit: U7
seat: reviewer
pass: 2
reviewed: dbd7519b
base: 99565566
ticket: "#785"
written: 2026-10-04
---

# pane-context U7 · reviewer pass 2 · PASS (F1 to F3 and nit 1a fixed in substance, re-judged sweeps hold)

Diff `99565566..dbd7519b` on `unit/pc-U7`, plus the unit total `96409def..dbd7519b` for the code-scope and em-dash checks. No blocking or major finding. Two nits and two observations below, none requires a rework.

## Findings

| # | Severity | Where | What |
|---|---|---|---|
| N1 | nit | `docs/spec/spec-muted-base-key-spikes.md:441-444` AC-006 | "exactly on even" is a measured fact, not a gated one: `group-chroma-damper` (v) (`test/engine/tonal.mjs:2199-2221`) loops perceptual and peak only and says even "is exact and not repeated here". My probe confirms it (below), so the sentence is true; it just has no assertion behind it. Optional: say "measured, not gated" or add an even arm to (v) in a later unit |
| N2 | nit | same clause | the gate's group values are 50 and 10; the spec's figures (0.177 to 0.200) are a probe at 30, 60, 95 on one palette, labelled as a probe, so honest. A wider sweep gives 0.220 (perceptual) and 0.219 (peak) at worst, so "0.177 to 0.200" is the one palette's range, not a bound; the clause's actual bound is the rounding floor, which it states first |
| O1 | observation | `test/engine/tonal.mjs:1276-1279` | says `projectView` makes the `rampChromaOf` call "at line ~913"; it is at `src/ui/model.mjs:~950` at head. Stale line hint, not the class (no group-value claim), left alone |
| O2 | observation | `test/engine/fixtures/shadcn-baseline.css:48`, `test/engine/semantic.mjs:188, 207` | dated carve-out and re-measure log text saying the blend targets "resolved `rampChroma`" at each endpoint. History entries, outside both regexes (backticked), correctly left |

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | F1 (AC-006) | fixed | my probe, `paletteStops({hue:267, skew:-20, chroma:g})` against g = 100, largest stop tone delta over 19 stops, g 30 / 60 / 95: perceptual 0.177 / 0.177 / 0.179, peak 0.185 / 0.200 / 0.182, even 0 / 0 / 0. Same as the builder's and pass 1's. Wider probe (8 hues x 3 skews x g 10/50/95, 19 and 25 stops): even 0 exactly, perceptual 0.224, peak 0.220 at worst, all inside the two-pixel rounding floor the gate checks. The new text matches what (v) asserts and keeps no 1e-9 claim |
| 1 | F2 | fixed | `knowledge-02-tonal-scale.md:259` now `paletteStops` only; the paragraph below it (`g` is one damper, `dampStops`) reads true against `tonal.js:946` |
| 1 | F3 | fixed | `headless-boot.mjs:4245` now `dampStops`/`chromaEnvelope`; one comment word; `detunedChroma = pal.chroma - 13` is below 100 so the chroma enters via `dampStops` |
| 1 | nit 1a | fixed | `tonal.js:111` carries "a direct call uses its own chroma"; file is 1530 lines before and after, so no line below moved |
| 2 | sweep re-run at head | totals agree | Sweep A at head: 14 hits (`tonal.js` 4, `spec` 2, `exports.mjs` 2, `fixtures` 2, `tonal.mjs` 2, `decision-records.md` 1, `describe-mcp-assets.js` 1), = 17 at base minus the three fixed. Sweep B at head: 171 over 29 files (per-file counts match the handoff rows). Handoff says 170 at base `96409def`; the +1 at head is the pass 1 REQ-005 parenthetical (+2 in `spec`) less the F3 comment (-1 in `headless-boot.mjs`), and the AC-006 reword is net 0 |
| 2 | table sums | sum | Sweep A: 1+4+1+1+1+2+2+2+1+1+1 = 17 and 1+2+6+6+1+1 = 17. Sweep B rows sum to 170; the verdict column re-tallied per row: true 147 (including the 2 amended in text), history 8, banner 8, fixed pass 1 two, reclassified-and-fixed three, stale out of lane two = 170 |
| 2 | sample re-judged against the code | 40 hits, all agree | see the list below; every reclassified hit is in it |
| 3 | comment-strip diff over `src test scripts` | empty | Python, drop whitespace-only and `//` lines: `tonal.js` 1530 to 1530 lines code-identical, `headless-boot.mjs` 4361 to 4361 code-identical, for both `99565566..HEAD` and `96409def..HEAD`. `describe-mcp-assets.js` (one 843 KB line pair) compared by common-prefix and suffix: one changed line (65), the embedded old comment against the new one, nothing else |
| 4 | U+2014, private docs, branding | clean | zero U+2014 bytes among added diff lines; `node test/repo/em-dash.mjs` clean (1157 files); `.claude/docs/other` absent and not in the diff; `node test/repo/branding.mjs` clean (1149 files) |
| 5 | generated assets | regenerated output | `ui.html` line-level diff `99565566..HEAD`: lines 2762 and 11060 only, the old comment against the new; `describe-mcp-assets.js` line 65 only. `npm test` reran the generators and `git status --porcelain` is empty afterwards, so the committed files are the generator's output. Log carries `wrote figma/plugin/ui.html 4170.9 KB`, the `.sdlc/baseline.md` figure, so no baseline edit |
| 6 | three out-of-lane finds | accurate | `anchor.mjs:505` says the blend goes to `rampChroma` at the ends, the next line already says only even keeps the blend, and even's blend target is `palette.chroma`, 100 since #785: a stale tail in a dated narrative. `SPEC-muted-base.md` card: `grep -c 785` is 0; line 4 states the ABSOLUTE target and "defaults material 30/60", line 7 the open 30/60 follow-up; the "Supersedes / amended by" row has no #785. `spec:110` REQ-007 "ramp at 30": the `:14` banner names REQ-001, REQ-003, AC-007, G2 and the follow-up, not REQ-007 |
| 7 | `npm test` | pass | `NODE_OPTIONS` unset, load 12 at start rising to 47 (heavy, so no timing claim): rc 0, `all 54 test files passed`, `git status --porcelain` empty after (`/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U7-rev2/nt.log`) |

## Sample re-opened and judged (40 hits)

Judged by reading the code or running it, not by name.

| Hit | Verdict | Basis |
|---|---|---|
| `tonal.js:111` (new comment) | true | `:946` re-entry at 100, `dampStops` after; matches `:1486-1500` |
| `tonal.js:580-609` basis comment | true | `groupValue` of `anchorChromaBasis` is fed only from `:889-890`, inside `paletteStopsAnchored`, reachable only from `:949`; `palette.chroma` is 100 there |
| `tonal.js:848, 855, 889, 890` | true | same reachability, `groupTarget = (palette.chroma/100)*pk` is a 100-based value |
| `tonal.js:1486-1487` | true | resolver hands g to `paletteStops` as `palette.chroma`; the damper header says it enters at one line |
| `tonal.js:392` | history | a dated measurement against the resolved corpus |
| `spec:104-106` REQ-005 | true | anchor reads the at-100 chroma, `dampStops` holds hue |
| `spec:91-94` REQ-003 | true | amended in text for #785 |
| `spec:77-80` REQ-002 | banner | the absolute-target wording the `:14` banner supersedes |
| `spec:102` REQ-004 | true | `tonal.js` is group-unaware |
| `spec:349` EX-2 | banner | the chroma 30 Neutral sentence, named by the banner |
| `spec:423` AC-002 | true | resolver-level, `shell.mjs:216` asserts it |
| `spec:434` AC-003(b) | true | `shell.mjs:261-268` asserts the row against the direct call at `rampChroma` |
| `spec:441-446` AC-006 | fixed, true | probe above |
| `knowledge-02:256-262` | true | after F2 |
| `knowledge-02:280` | history | marked "Before #785" |
| `tonal.mjs:355-362` | true | asserts 0.18 x the at-100 floored chroma within 0.5 |
| `tonal.mjs:438-439` | true | AC-005 passes 20/45/100 through `paletteStops` |
| `tonal.mjs:1276-1290` | true (O1) | `rampChromaOf` feeds `paletteStops` at its entry |
| `tonal.mjs:1663` | history | dated "#725 U2: retired" |
| `tonal.mjs:1778, 1784` | true, history | the patch at `:1799` routes to `anchorChromaBasis(..., 1)`; `:1784` a dated sample count |
| `tonal.mjs:1914` | true | the damper by one ratio, the carve-out removed |
| `anchor.mjs:464` | true | stop 500 equals the anchor at 100 only |
| `anchor.mjs:505` | stale tail (out of lane) | see check 6 |
| `anchor.mjs:804, 1537` | true | the control renders at 100; the achromatic cell asserts the damper law |
| `headless-boot.mjs:3571-3599` (gid1 to gid3) | true | asserts the chroma-50 ramp's OKHSL s is 0.5 x the 100 ramp's at every stop, with a measured precondition on Neutral's anchor s |
| `headless-boot.mjs:4245` | fixed, true | F3 |
| `exports.mjs:440` | true | the resolver skip is real |
| `exports.mjs:480, 487-490` | history | dated "#681 re-capture" entries |
| `semantic.mjs:207-210` | history | dated re-measure log |
| `shell.mjs:204-293` | true | AC-002 and AC-003b are byte-for-byte hex compares with a witness and a control |
| `categories.mjs:347-357` | true | a real discriminating gate on the resolved chroma |
| `model.mjs:279-281` | true | measured: the pre-#785 engine (`1e3fe1eb^`) at chroma 30 and the head engine at 100, Neutral with its anchor, 25 stops: perceptual identical, peak identical, even differs (the sentence claims perceptual only) |
| `model.mjs:947-950` | true | says damper |
| `src/ui/sections/color.js:2030-2036` | true | resolver comment, not the class |
| `glossary.md:26` | true | anchor at group 100 only, damper after |
| `lld:14` banner, `:189-192` | banner and history | the G2 row is a dated plan row |
| `color-math/SKILL.md:52-70`, `foundations.md:126-136` | true | `groupValue` is 100 on even, damper after |
| `.sdlc/records/cards/SPEC-muted-base.md` lines 4, 6, 7 | stale (out of lane) | check 6 |
| `report-preset-fidelity.mjs:6, 328, 497, 791` | true | resolver call sites, no interior claim |

R98: none found
