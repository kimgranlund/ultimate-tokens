# anchor-gaps U2: hueless hue (#744)

Status: 🟢 built, one deviation from the plan flagged below (🟡).

## Next for the Orchestrator

Send U2 to reviewer-l2 and verifier-l2 at the head named in the commit. One plan figure is stale (see Deviations); the verifier should re-derive the `KNOWN_BASELINE_DUP` keys, not copy them.

## Deviations from the plan

| Item | Plan said | Measured | Effect |
|---|---|---|---|
| the re-freeze | two hue-0 `peak` keys leave, one hue-36 `peak` key joins | the base list holds five hue-0 Nike keys (`peak` 75&100 and 150&175, and three `even`: 50&75, 100&125, 175&200; chroma-floor #701 added the `even` ones); at hue 36 the full gate finds four dup pairs (`peak` 75&100, `even` 50&75, 100&125, 175&200) and `peak` 150&175 is gone | five keys leave, four hue-36 keys join, unique count 22 (was 23) |
| twin's max CAM16 C (U2-3 field 3) | `98.38` unchanged | `86.00` | the twin is the anchor-less palette at the stored hue, so it moved with the hue (36 not 0); field 2 `27.28` is still bounded by it |
| `numstat` on `brands.js` | `1 1` | `-  -` (git treats the file as binary) | `git diff --stat` shows `33651 -> 33652 bytes`, one byte, the hue `0` to `36` |

## Criteria

| Id | Result | Command output at this head | Negative control |
|---|---|---|---|
| G0 | 🟢 | lines 1, 2, 5, 6: `CLOSED COMPLETED`, `1`, `CLOSED COMPLETED`, `1` | n/a (the gate) |
| U2-1 | 🟢 | `36 36 #FFFFFF [1,0,0]`; only `src/ui/categories/brands.js` changed under `src/ui/categories/` | `HEAD~0` version of `brands.js` (before regeneration) prints hue `0` for `tertiary-muted`, run above |
| U2-2 | 🟢 | `fallbackHue` 6, `#744` 1 in the generator, `0` files under `docs/reference/colors` changed, `"oklch": "1.000 0 0"` still 1 in `brands.json` | the base tree has no `fallbackHue`; the JSON is untouched, so the rule lives in the generator |
| U2-3 | 🟢 | `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`, stop 650 CAM16 hue `35` (before: `25 33.21 98.38 7 2.77 ... 650:#B8969F 900:#3B1E27`) | the before line is the base tree's render at hue 0 |
| U2-4 | 🟢 | `gate:corpus-tonal`: `PASS: tonal-generation clears all [gate] predicates`, exit 0; `gate:corpus-anchor`: `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (17, Q3-resolved, +2 at #739) are named allow-lists, compared by name, each with a biting negative control`, exit 0; `#744` in `tonal.mjs`: 3; non-comment, non-key changed lines in `tonal.mjs`: 0 | with only the hue-0 keys kept, the first FULL run at hue 36 reddened as `(C6 ii) even: 3 duplicate-hex pair(s) beyond the cited list ... (key even|36|100.00|0|0|25-stop|50&75)`; with the `peak` hue-36 key dropped: see the control line below |
| U2-5 | 🟢 | `#744` in `CHANGELOG.md`: 1; `sh .sdlc/checks/baseline-agrees-check.sh`: only `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s` (inherited); `ok    ui.html:` with 4133.1 both sides | the baseline cell left at main's `4130.3` would print `STALE ui.html` (tree is `4133.1`) |
| P1 | 🟢 | `npm test`: `✓ all 54 test files passed`, tree clean after except the intended changes | not re-run (adapter §1's control is plan-level) |
| P3 | 🟢 | `em-dash: clean (882 files scanned)`, `branding: clean (874 files scanned)`, added lines carrying U+2014: `0` | not re-run |

Negative control, dropped `peak|36|...|75&100` key, in a throwaway clone (`node test/engine/tonal.mjs --full`): recorded in the last section.

## Bundle and baseline

`npm test` printed `wrote figma/plugin/ui.html 4133.1 KB`. Main's `4130.3` figure was stale for this branch because anchor-gaps U1's app-helpers growth is not in it; the committed `ui.html` at the branch head before this unit already measured `4133.1`, and U2 adds one byte. The build cell of `.sdlc/baseline.md` is set to `4133.1` and a dated Correction paragraph names the cause. `npm run build` was not run (no `node_modules`).

## Not run

`gen:preview` (`docs/img/palette-preview.svg`): not inside `npm test`, not run; the plan asked the builder to report it.

## Negative control result



Dropping `peak|36|100.00|0|0|25-stop|75&100` in a clone at 9f981140 with this unit's tonal.mjs and brands.js: `exit 1`,   FAIL  chroma-envelope, (C6 ii) peak: 1 duplicate-hex pair(s) beyond the cited list, e.g. 25-stop hue 36 chroma 100.00 skew 0 lift 0: stop 75&100 duplicates #FFFEFE (key peak|36|100.00|0|0|25-stop|75&100)
