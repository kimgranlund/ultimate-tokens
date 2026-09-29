# anchor-gaps U2: hueless hue (#744), pass 2

Status: 🟢 built. Pass 2 is records only: this handoff and three comment sites in `test/engine/tonal.mjs`. The code commit `9b534f08` is carried forward untouched. No deviation from plan revision 6; one figure differs from the pass 1 verdict (🟡, below).

Figures measured at `562b077a` (unit/ag-U2: the merge `4b64d3ac` of `plan/anchor-gaps` at `55021569`, then the comment commit). `$B` = `git merge-base plan/anchor-gaps HEAD` = `55021569`.

## Next for the Orchestrator

Send U2 pass 2 to reviewer-l3 and verifier-l2 at the head that carries this handoff.

## Pass 1 findings, repaired

| Finding | Repair | Proof at this head |
|---|---|---|
| 1 🔴 credit of the hue-0 `even` keys | The base's five hue-0 Nike keys came from two tickets, none from #701: `even` 50&75, 100&125, 175&200 with #681 (`8ba4bee4`), `peak` 75&100 and 150&175 with #739 (`9638894c`). U2 removes all five and adds four hue-36 keys | pickaxe per key, below |
| 2 🟡 handoff `:3`, `:25`, `:28` | Rewritten from this head's output: no deviation table (revision 6 absorbed all three rows); the U2-4 controls name the exact list state that printed each line; P3 counts are this head's | the Criteria table |
| 5 🟡 `tonal.mjs` comments | `:1268` and `:1274` state the tally re-derived at this head; the Nike block credits each hue-0 predecessor by ticket and says #744 swapped them for the four hue-36 keys | instrumented run, below |

Pickaxe, one command per key, `git log --format='%h %ad %s' --date=short -S'<key>' origin/main -- test/engine/tonal.mjs`:

| Key | Output |
|---|---|
| `even\|0\|100.00\|0\|0\|25-stop\|50&75` | `8ba4bee4 2026-09-23 Preset intent fidelity: prime anchors byte-exact, muted ramps, symmetric ladder (#681) (#737)` |
| `even\|0\|100.00\|0\|0\|25-stop\|100&125` | `8ba4bee4 2026-09-23 ... (#681) (#737)` |
| `even\|0\|100.00\|0\|0\|25-stop\|175&200` | `8ba4bee4 2026-09-23 ... (#681) (#737)` |
| `peak\|0\|100.00\|0\|0\|25-stop\|75&100` | `9638894c 2026-09-24 fix(engine): achromatic anchors take the palette's hue (#739) (#746)` |
| `peak\|0\|100.00\|0\|0\|25-stop\|150&175` | `9638894c 2026-09-24 ... (#739) (#746)` |

#701's squash adds none: `git show 33bd8920 -- test/engine/tonal.mjs | grep -cE '^[+].*\|0\|100\.00\|0\|0\|25-stop\|'` prints `0`.

## Criteria

| Id | Result | Command output at this head | Negative control |
|---|---|---|---|
| G0 | 🟢 | lines 1, 2, 5, 6: `CLOSED COMPLETED`, `1`, `CLOSED COMPLETED`, `1` | n/a (the gate) |
| U2-1 | 🟢 | `36 36 #FFFFFF [1,0,0]`; numstat `- - src/ui/categories/brands.js`, the only name; word diff prints `"name":"tertiary-muted","hue":0` then `"name":"tertiary-muted","hue":36` | base `brands.js` (`git show 55021569:...` imported from a temp path) prints `0 36 #FFFFFF [1,0,0]`; the word diff of `$B` against itself prints `0` lines |
| U2-2 | 🟢 | `6`, `1`, `0`, `1` | `git show $B:scripts/gen-categories.mjs \| grep -c fallbackHue` prints `0` |
| U2-3 | 🟢 | `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`; stop 650 CAM16 hue `35` | same probe with `d.palettes[i].hue=0` forced: `25 33.21 98.38 7 2.77 500:#F1F1F1 650:#B8969F 900:#3B1E27`, stop 650 hue `360`; field 2 reds the `28.00` bound |
| U2-4 | 🟢 | `PASS: tonal-generation clears all [gate] predicates`, `exit 0`; `PASS (FULL): C2, C3, C4 (...) ... each with a biting negative control`, `exit 0`; greps `1`, `4`, `0`, `4` (`#744` now also in the rewritten comment) | see the controls table |
| U2-5 | 🟢 | `#744` in CHANGELOG `1`; `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB`; `baseline-agrees-check.sh \| tail -1`: `stale total: 0` | build cell set to main's `4130.3`: `STALE ui.html: baseline 4130.3 KB, tree 4133.1 KB`, `stale total: 1`; restored |
| P1 | 🟢 | `npm test`: `✓ all 54 test files passed`, exit 0, `wrote figma/plugin/ui.html 4133.1 KB`; after the run `git status --short` listed only the comment edit, which `npm test` did not move | adapter §1's control is plan-level |
| P3 | 🟢 | `em-dash: clean (928 files scanned)`, `branding: clean (920 files scanned)` (the pass 2 merge brought main's newer files) | not re-run |
| P4 | 🟢 | `0`, nothing, `0`, `0` with the revision 6 class | six-name fixture through the first filter prints `3` |

U2-4 negative controls, each a `node test/engine/tonal.mjs --full` run in the unit tree with the list edited and then restored byte for byte (the gate keeps one message per gate name, so each line is the first red of its run):

| List state | First red | Exit |
|---|---|---|
| two hue-0 `peak` keys added back | `(C6 ii) 2 of the 24 cited baseline duplicates were not observed this run (peak\|0\|100.00\|0\|0\|25-stop\|75&100, peak\|0\|100.00\|0\|0\|25-stop\|150&175)` | 1 |
| `peak\|36` 75&100 dropped | `(C6 ii) peak: 1 duplicate-hex pair(s) beyond the cited list, e.g. 25-stop hue 36 ... stop 75&100 duplicates #FFFEFE` | 1 |
| `peak\|36` kept, the three `even\|36` keys dropped | `(C6 ii) even: 3 duplicate-hex pair(s) beyond the cited list, e.g. 25-stop hue 36 ... stop 50&75 duplicates #FFFFFF` | 1 |
| all four hue-36 keys dropped | `(C6 ii) peak: 1 ...`, the `even: 3` line hidden behind it | 1 |

Pass 1's `:25` quoted the `even: 3` line as the hue-0-only state; the third row is the state that prints it.

## Tally, re-derived

An instrumented FULL run (a push of each allow-listed hit, printed before the `seenBaselineDup` check, file restored after) prints `INSTR physical 24 unique 22 hue0 0 {"peak":8,"even":11,"perceptual":3}`. The two doubled keys, each hit by two different presets with different palette sets: `even|280|100.00|0|0|25-stop|850&875` (two `primary` palettes) and `even|60|100.00|0|0|25-stop|900&925` (a `primary-muted` and a `tertiary-muted`). So the comment keeps its "two keys each hit by two presets" sentence and names both.

🟡 The pass 1 verdict's instrumented run reported `physical 22`. This run counts every `KNOWN_BASELINE_DUP.has(key)` hit and prints 24; the verifier should state what its counter counted.

## Not run

`gen:preview` (`docs/img/palette-preview.svg`): not inside `npm test`, not run. `npm run build` and `npm run smoke`: no `node_modules`; no bundled source changed in pass 2.
