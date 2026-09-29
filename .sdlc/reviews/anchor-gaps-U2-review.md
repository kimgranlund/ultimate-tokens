PASS

# anchor-gaps U2 review, pass 1 (#744)

Branch `unit/ag-U2` @ 9b534f08, base `plan/anchor-gaps` @ 9f981140, `B = git merge-base origin/main HEAD` = fd8ef025. Criteria: `## U2: hueless hue (#744)` and P1 to P4 of `.sdlc/plans/anchor-gaps.md`. Every figure below is my own run, at 9b534f08 in the unit worktree (read-only commands) or in a throwaway shared clone of it (`git -C <clone> log -1` = `9b534f08`, every edit reverted with `git checkout`). Nothing is copied from the handoff.

## Criteria

| Id | State | Evidence (my output) | Negative control (mine) |
|---|---|---|---|
| G0 (lines 1, 2, 5, 6) | 🟢 | `CLOSED COMPLETED`, `1`, `CLOSED COMPLETED`, `1` | the line-6 needle read at the unit head instead of main: `grep -c` of the `peak\|0\|...\|75&100` key in `test/engine/tonal.mjs` = `0`, the Q4 stop state |
| U2-1 | 🟢 | `36 36 #FFFFFF [1,0,0]`; one numstat line, `- - src/ui/categories/brands.js` (binary: `.gitattributes` sets `diff: unset` on it); a word diff of that file against B has exactly one change, `"hue":0` to `"hue":36` | base `brands.js` in the clone: probe prints hue `0`. Plan's control run: `"oklch": "0.500 0 0"` planted on the Baikal entry's dominant swatch in `travel.json`, regenerated: a `travel.js` numstat line appears and that palette's hue `47` equals the entry's neutral hue `47` |
| U2-2 | 🟢 | `6`, `1`, `0`, `1` | base generator has no `fallbackHue` (plan's figure; the rule is new code in the diff) |
| U2-3 | 🟢 (field 3 per deviation b) | `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`, stop 650 CAM16 hue `35` | base `brands.js`: `25 33.21 98.38 7 2.77 500:#F1F1F1 650:#B8969F 900:#3B1E27`, field 2 reds the `28.00` bound |
| U2-4 | 🟢 | `PASS: tonal-generation clears all [gate] predicates`, `exit 0`; `PASS (FULL): C2, C3, C4 ...` (the baseline row's text), `exit 0`; key greps `1`, `0`; `#744` count `3` | both plan controls, FULL, in the clone: the two `peak\|0` keys added back gives `(C6 ii) 2 of the 24 cited baseline duplicates were not observed this run (peak\|0\|...75&100, peak\|0\|...150&175)`, `exit 1`; the `peak\|36\|...75&100` key dropped gives `(C6 ii) peak: 1 duplicate-hex pair(s) beyond the cited list ... (key peak\|36\|100.00\|0\|0\|25-stop\|75&100)`, `exit 1` |
| U2-5 | 🟢 | `#744` in CHANGELOG `1`; `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB` | base 9f981140 carries baseline `4130.3` against a committed `ui.html` of `4133.1` (measured the check's way), so the cell left alone is `STALE` |
| P1 | 🟢 | clone at 9b534f08: `npm test` exit 0, `✓ all 54 test files passed`, TESTS `54`, `git status --short` empty after | not rerun (adapter §1 control, plan-level) |
| P3 | 🟢 | `branding: clean (875 files scanned)`, `0`, `0`, `em-dash: clean (883 files scanned)`, `exit 0` | not rerun |
| P4 | 🟢 | `0` lines outside the wall, model.mjs `1 1` (U1's), tonal.mjs non-key non-comment changed lines `0`, guarded paths `0`. The unit's own diff (9f981140..HEAD) touches 7 files, all inside the wall | not rerun |

P2 (`npm run build`) was not run: no `node_modules` in the worktree; the plan puts it on the pre-land record.

## The two deviations

| Deviation | Ruling | Mechanism |
|---|---|---|
| (a) five hue-0 keys out, four hue-36 keys in, 23 to 22 unique | plan defect; the unit is correct | I stripped every Nike key from the list in the clone and instrumented the FULL gate to print every beyond-list key (`dupWitness`, all modes) and every never-seen key. At head (hue 36): exactly `peak\|36\|...\|75&100`, `even\|36\|...\|50&75`, `even\|36\|...\|100&125`, `even\|36\|...\|175&200`, and no stale key among the other 18. With 9f981140's `brands.js` (hue 0): exactly the five hue-0 keys the base list held (`peak` 75&100, 150&175; `even` 50&75, 100&125, 175&200). So 18 + 4 = 22, and the unit's list equals the gate's own output. The plan counted only the two `peak\|0` keys and quoted only the `peak` FAIL line; `FAIL()` keeps one message per gate name (`tonal.mjs:35`), so the `even` line never prints while the `peak` one does, which is how three even keys were missed |
| (b) twin max CAM16 C `86.00`, not `98.38` | plan defect; the unit is correct | the probe builds the twin as `structuredClone(d)` with only `anchor` deleted, so the twin renders at the palette's stored hue, which U2 moves from 0 to 36. Forcing the twin back to hue 0 at head (`t.palettes[i].hue=0`) prints `98.38` exactly, with field 2 still `27.28`. The plan's "unchanged" was false by construction; the row's intent (the anchored ramp bounded by its own twin) holds, `27.28 <= 86.00` |

The U2-1 Expected `1 1` numstat is a third plan defect of the same kind: git prints `- -` for this file.

## Findings

| Severity | Finding | Evidence |
|---|---|---|
| minor | the handoff attributes the three `even\|0` keys to chroma-floor #701; they come from #681 | `git log -S'even\|0\|100.00\|0\|0\|25-stop\|50&75' origin/main -- test/engine/tonal.mjs` names only 8ba4bee4 (#681, PR #737); the planner's own 7d325b32 already holds all three (`grep -c '"even\|0\|100.00'` = `3`). Record-only (the handoff), no tree claim depends on it |
| nit | the inner `// Ticket #739:` comment in `KNOWN_BASELINE_DUP` now lists "three even-mode ones and one peak" under #739, which reads as if #739 caused the even keys; the outer comment gets it right ("three even keys at hue 0 among the 21 above") | `test/engine/tonal.mjs`, the comment above the four hue-36 keys |
| nit | one reflowed comment line in that block runs to 131 columns, where its neighbours wrap near 100 | the line ending `...every OTHER anchored ramp in the corpus byte-identical).` |
| note | `gen:preview` needs no run: `scripts/gen-preview.mjs` does not read `src/ui/categories` (no `brands`, `nike` or `categories` match), so `docs/img/palette-preview.svg` cannot move with this unit | grep of the script |

## Claims checked at head

| Claim | State | Evidence | Control |
|---|---|---|---|
| generator comment and CHANGELOG: one hueless sample in the corpus | 🟢 | 2028 `"oklch"` values over the eight category files, one with chroma `0`: `"1.000 0 0"` | the plan's `travel.json` plant makes the census `2` and moves a second palette (U2-1 control) |
| generator comment: `fallbackHue` is the entry's derived neutral hue | 🟢 | instrumented clone generator, all 338 `mapColors` entries: the fallback hue equals the stored `neutral` palette hue in `338` of `338` (the neutral derives from the six palettes' r4-rounded key colours, the fallback from the raw swatches; no entry rounds differently) | the planted Baikal swatch takes `47`, its own entry's neutral, not Nike's `36` |
| generator comment and CHANGELOG: `keyColors` and `anchor` unchanged | 🟢 | the one word-diff change in `brands.js` is the hue; probe prints `#FFFFFF [1,0,0]` | the word diff reports any other changed field; it found none |
| CHANGELOG: the ramp was mauve, now tints toward the warm neutral | 🟢 | stop 650 `#B8969F` at hue 0, `#B8988F` at CAM16 hue `35` against neutral hue `36` | base `brands.js`: 650 hue `360`, `#B8969F` |
| tonal.mjs: "22 unique in all", "three even keys at hue 0 among the 21 above and two peak keys below" | 🟢 | 22 list entries, 0 duplicates; base list 23 = 21 + the two `peak\|0` keys; the three `even\|0` keys were among the 21 | adding the two `peak\|0` keys back (24) reds the FULL gate as never-seen |
| baseline Correction: main's 4130.3 lacks U1's growth; the tree is 4133.1; U2 adds one character | 🟢 | the check's own measure (`readFileSync(...,"utf8").length/1024`): fd8ef025 `4130.3`, 9f981140 `4133.1`, 9b534f08 `4133.1`; main's baseline reads `4130.3`; `brands.js` 33651 to 33652 bytes; `4133.1 - 4130.3 = 2.8` matches the cited U1 corrections (4118.0 to 4120.8); clone `npm test` printed `wrote figma/plugin/ui.html 4133.1 KB` | at 9f981140 the same measure (`4133.1`) disagrees with its baseline cell (`4130.3`) |

verdict: 🟢
