# Handoff floorref-hue U2 · builder → reviewer

Branch unit/fh-U2 @ d77e5b74 (code head), off plan/floorref-hue @ 0ef7b87b, merge-base with main 8428280e, ticket #766. Changed: `src/engine/tonal.js` (new `floorRefAt`, both per-ramp `const floorRef` lines gone, both call-site comments rewritten), `test/engine/fixtures/chroma-envelope.json` (even row re-captured), the regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, and two `okhslLAt` line citations in `docs/reference/reviews/2026-08-20-reactivity/` (00-synthesis.md, 04-context-and-messaging.md) re-pointed 1026 to 1046 because the helper pushed the function down 20 lines (`repo/citations.mjs` red otherwise).

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `node scripts/report-preset-fidelity.mjs --floor-ref --base 8428280e` | gate `STOPS`: 6 moved / 3 palettes / 1 doc / 0.60 C, exactly the pinned set: Adia `Success` 150 `#C7EABD -> #C6EBBC`, 200 `#B7DAAE -> #B6DAAD`, 250 `#A6C99E -> #A6C99D`, 300 `#95B78D -> #94B78D`; `Info` 300 `#95ACBC -> #96ACBC`; `Data 5` 300 `#ABA880 -> #AAA880`. `EXPORT_STOPS` adds only `Success` 175 `#BFE2B6 -> #BEE3B5` (7 cells, 0.60 C). `moved in hueShift 0 palettes: 0 palette(s)` on both gate rows | stop-300 mutant (recipe M300 below): 6 cells, 0.34 C, `Success stop 150 #C7EABD -> #C6EABD`, so it passes a count bound and fails the pinned set | 🟢 |
| C2.2 | same report, rendered rows | `STOPS` 3,870 moved / 1,522 palettes / 339 docs / max 9.11 C; `EXPORT_STOPS` 4,441 / 1,523 / 339 / 9.11 C; largest mover Tbilisi `secondary` 100 `#FBF9AF -> #F9F8C6`; histograms equal section 2's to the cell. Kit only (`--only default-kit`): rendered 24 of 304 / 30 of 400, 7 palettes, 4.08 C; gate 0 / 0 | 450-only mutant (recipe M450): rendered max 18.05 C on both stop sets (4,601 / 5,274 moved), Camargue `primary` 600 `#A8585C -> #916465` | 🟢 |
| C2.3 | read `paletteStopsAnchored`; `grep -n "const floorRef" src/engine/tonal.js` | `floorRefAt(h, mc, pivotTone, tone450, tone550)` is the fifth argument of `evenChroma` inside `chromaAt = (h) => ...`, so `solveCam16Hue` and `const chroma = chromaAt(hue)` read the same floor; the 500 ceiling is at `pivotTone`; grep prints nothing | the diff (two `const floorRef` lines removed) | 🟢 |
| C2.4 | `npm run gate:even-dips`; `node test/engine/tonal.mjs` | `dip-gate even gate-path (no anchor): 0 dips (19 + 25 stops ...)`, `PASS`; `pass  dip-gate-even`, `pass  chroma-floor`, tonal exit 0 | built-in, both still bite: even-dips `negative control (pre-#701 floor, 1.6x): 120 dips`; tonal `pre-#701 gamut-relative floor: 1 off-anchor dip(s)` and `1.6x: 38` | 🟢 |
| C2.5 | `npm run gate:mode-isolation` | `pass  mode-isolation: perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef match fixture (captured at ba7a299e...)`; fixture untouched | recipe C25: fixture `perceptual` hash changed by one hex digit, the gate reds `FAIL  mode-isolation: perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef do not match fixture`, exit 1 | 🟢 |
| C2.6 | `node test/engine/tonal.mjs` (`intensity-legacy`); `git diff --stat 8428280e -- test/engine/fixtures/tonal-legacy.json` | `pass  intensity-legacy`; diff empty | not run (the `hueShift` 10 scratch kit); the kit-only gate row reading 0 of 304 is the same fact from the tool | 🟢 |
| C2.7 | `node test/engine/chroma-envelope-gate.mjs --capture`, then `--compare <base>` with `<base>` = `git show 8428280e:test/engine/fixtures/chroma-envelope.json` | even: median 300 47.0855 to 46.9621, p90 300 100.3224 to 100.0000, `above100` 502 to 499; every other even cell, and the perceptual and peak rows, unchanged; `--compare`: `perceptual: byte-identical to base`, `peak: byte-identical to base`, `0 cells rose`, exit 0. A second `--capture` on the final code leaves the file unchanged | recipe C27 below: base `above100` set to 498 reds, `rose: even above100 499 > base 498`, exit 1. The plan's literal recipe (merge-base value lowered by 1, to 501) does NOT red: head fell by 3, so 499 is still under 501 | 🟢 (control 🟡, see notes) |
| C2.8 | paired timing, five alternating base/head runs per gate (recipe TIME), then three quiet-host pairs | five-pair set (load 6.6 to 11.1): `even-dips-gate` 12.53 / 13.47 s = 0.93, `chroma-envelope-gate` 45.23 / 32.06 s = 1.41. Quiet-host set (load under 5 at every start): `gate:even-dips` head 5.71 · 5.68 · 6.30 s, median 5.71 against base 5.53, 1.03 (baseline row 18.90 to 23.15 s, inside); `gate:chroma-envelope` head 21.25 · 23.19 · 22.13 s, median 22.13 against base 14.75, 1.50 (baseline row 12.00 to 12.34 s, so the row needs re-timing). `npm test` quiet runs 114 · 116 · 125 s, median 116 s, under 120 | recipe EAGER's code under the same pairing read a pairwise median of 2.57x (ratio of medians 2.30x) under load, over the 2.5 bound, so the pairing does register a slowdown | 🟢 ratios; 🟡 baseline row edit |
| C2.9 | `node scripts/report-preset-fidelity.mjs --identity-control --authored --base 8428280e` | perceptual and peak 0 of 94,500 cells and 0 of 400 kit cells; even 4,418 of 94,500 (the 4,411 dampAmp-0 rendered movers of C2.2 plus Adia's 7 gate movers) and kit 30 of 400; `4448 differing cells`, exit 1 (the mode exits 1 on any difference) | as C2.5 | 🟢 |
| C2.10 | `node test/engine/semantic.mjs` | exit 0; output byte-identical to the same command at 8428280e (`diff` empty), including `role-contrast Q-B floor gate: 0 unlisted drops, 0 further erosion (41 cells named "pending U4")`, so no new pending cell | recipe FLOOR0: kit `chromaFloor` 0 reds `role-contrast, even Secondary DARK: accent #529879 on #0F1210 = 5.50:1, below its pinned floor 5.5:1`, exit 1 | 🟢 |
| C2.11 | `grep -c "deferred to #766\|the issue its comment names" src/engine/tonal.js` | `0`; both call-site comments state the per-stop rule, the exact cases and the 10 C bound | the same grep on `git show 8428280e:src/engine/tonal.js` prints `2` | 🟢 |
| C2.12 | `git diff 8428280e -- src/engine/tonal.js \| grep '^+[^+]' \| grep -cE "$P"` with `P='(\bh(ue)?\b\s*(<\|>\|<=\|>=\|===\|!==\|==\|!=)\|(<\|>\|<=\|>=\|===\|!==\|==\|!=)\s*\bh(ue)?\b)'`, then a read of the added lines for numeric literals | `0` hue comparisons; the only numeric literals are the stop numbers 450 and 550 and `let ref = 0` | recipe C212: two synthetic added lines with a hue comparison through the same pipeline print `2` | 🟢 |
| gates | `npm test`; `npm run gate:sweeps` | see Runs | n/a | see Runs |

## One deviation from section 3's literal text

`floorRefAt` takes the stop's own `maxc` and stops reading at the first ceiling that reaches it, returning `maxc`. `evenChroma` only uses `Math.min(maxc, floorRef)`, so the floor is the same number in every case. Why: with the literal `Math.max` of three readings the chroma-envelope pair median was 2.57x (ratio of medians 2.30x) against the 2.5 bound, under load. The short-circuit keeps the reading inside `chromaAt` at the candidate hue, so it is not the section 2 placement change. Proof of identity: a scratch copy with the eager three-way max as base and the lazy form as head reads `0 moved cell(s) in total` on `--floor-ref` and `0 differing cells` on `--identity-control --authored`. The reviewer should judge whether this still counts as "the same formula" at both call sites (it is one helper used at both).

## Negative-control recipes (replayable)

Scratch trees, made from the worktree at d77e5b74:

~~~sh
W=<the fh-U2 worktree>; T=<a scratch dir>
mkdir -p $T/base $T/m300 $T/m450 $T/mfloor
git -C $W archive 8428280e | tar -x -C $T/base
for d in m300 m450 mfloor; do git -C $W archive d77e5b74 | tar -x -C $T/$d; done
~~~

M300 and M450 apply this script (`python3 mutate.py $T/<d>/src/engine/tonal.js <d>`):

~~~python
import sys
p, kind = sys.argv[1], sys.argv[2]
s = open(p).read()
if kind == "m300":
    old = "controls.chromaFloor, floorRefAt(hue, maxc, tone500, tone450, tone550)"
    new = "controls.chromaFloor, floorRefAt((((baseHue + shift * (sameDir ? -Math.abs((300 - 500) / 450) : (300 - 500) / 450)) % 360) + 360) % 360, maxc, tone500, tone450, tone550)"
elif kind == "m450":
    old = "floorRefAt(h, mc, pivotTone, tone450, tone550)"
    new = "maxChromaInGamut(h, tone450)"
assert s.count(old) == 1, kind
open(p, "w").write(s.replace(old, new))
~~~

| Recipe | Run | Reads |
|---|---|---|
| M300 (C2.1) | `cd $T/m300 && node scripts/report-preset-fidelity.mjs --floor-ref --base-dir $T/base` | gate `STOPS`: 6 moved, 3 palettes, 1 doc, max 0.34 C; `Success stop 150 #C7EABD -> #C6EABD` (pinned `#C6EBBC`), 200, 250, 300 at 0.34 C each |
| M450 (C2.2) | `cd $T/m450 && node scripts/report-preset-fidelity.mjs --floor-ref --base-dir $T/base` | rendered `STOPS` 4,601 moved / 1,728 palettes / 18.05 C; `EXPORT_STOPS` 5,274 / 1,729 / 18.05 C; top mover Camargue `primary` 600 `#A8585C -> #916465`; gate rows unchanged from head (6 / 7, 0.60 C) |
| C27 (C2.7) | base fixture with `modes.even.above100` set to 498 (`json.load`, edit, `json.dump`), then `node test/engine/chroma-envelope-gate.mjs --compare <that file>` in the worktree | exit 1, `1 cells rose (... even above100)`, `rose: even above100 499 > base 498`. With 501 (merge-base minus 1, the plan's wording): exit 0, `0 cells rose` |
| FLOOR0 (C2.10) | in `$T/mfloor`: `src/engine/tonal.js` `chromaFloor: 40,` to `chromaFloor: 0,` (DEFAULT_CONTROLS) and `src/ui/persist.js` `chromaFloor` domain `default: 40` to `default: 0`; `node test/engine/semantic.mjs` | exit 1, `FAIL  role-contrast, even Secondary DARK: accent #529879 on #0F1210 = 5.50:1, below its pinned floor 5.5:1`, `FAIL: 1 gate failure(s)` |
| C25 (C2.5) | `git archive d77e5b74 \| tar -x -C $T/c25`; in `$T/c25` sed `"perceptual": "8ae715d202be14b2"` to `...14b3` in `test/engine/fixtures/mode-isolation.json`; `node test/engine/mode-isolation-gate.mjs` | exit 1, `FAIL  mode-isolation: perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef do not match fixture`, `expected perceptual 8ae715d202be14b3` |
| C212 (C2.12) | `printf '+  if (hue > 100) return maxc;\n+  const k = h === 30 ? 1 : 0;\n' \| grep '^+[^+]' \| grep -cE "$P"` | `2` |
| EAGER (deviation proof) | `$T/head` = the commit with `floorRefAt` as `return Math.max(maxChromaInGamut(hue, tone500), maxChromaInGamut(hue, tone450), maxChromaInGamut(hue, tone550));` and call sites without the `maxc`/`mc` argument; `$T/lazy` = d77e5b74's `tonal.js`; `cd $T/lazy && node scripts/report-preset-fidelity.mjs --floor-ref --base-dir $T/head` and `--identity-control --authored --base-dir $T/head` | `0 moved cell(s) in total`; `0 differing cells` |

## Runs

TIME recipe: base = `$T/base`, head = the worktree; for i in 1..5, for gate in `even-dips-gate`, `chroma-envelope-gate`, run base then head, `node test/engine/<gate>.mjs > /dev/null`, wall time by `perl Time::HiRes`, 1-minute load from `sysctl vm.loadavg`, heavy = `ps -Ao command | grep -E 'test/run.mjs|gate:|--full|report-preset'` count (0 at every start). All exit 0. 2026-09-30, 19:55 to 20:04 PDT.

| Gate | Base s (5) | Head s (5) | Median base / head | Ratio of medians | Pairwise median | Load at starts |
|---|---|---|---|---|---|---|
| even-dips-gate | 8.53 · 13.47 · 20.15 · 14.62 · 12.72 | 9.08 · 12.53 · 25.64 · 14.30 · 8.43 | 13.47 / 12.53 | 0.93 (bound 1.2) | 0.98 | 7.1 to 11.0 |
| chroma-envelope-gate | 32.06 · 28.86 · 37.11 · 32.30 · 19.28 | 45.23 · 44.08 · 54.91 · 45.64 · 28.22 | 32.06 / 45.23 | 1.41 (bound 2.5) | 1.46 | 6.6 to 11.1 |
| chroma-envelope-gate, eager form (superseded) | 13.52 · 17.85 · 22.44 · 19.64 · 19.42 | 34.70 · 47.40 · 44.66 · 54.16 · 42.98 | 19.42 / 44.66 | 2.30 | 2.57 | 4.8 to 8.6 |

Quiet-host pairs, 2026-09-30 20:25:34 to 20:28:12 PDT, load under 5 at every start (per-run load readings not kept), `node test/engine/<gate>.mjs --full`, alternating base then head, 0 heavy processes at every start, all exit 0:

| Gate | Base s | Head s | Medians | Ratio |
|---|---|---|---|---|
| chroma-envelope-gate | 13.63 · 14.75 · 16.40 | 21.25 · 23.19 · 22.13 | 14.75 / 22.13 | 1.50 |
| even-dips-gate | 5.53 · 5.52 · 5.58 | 5.71 · 5.68 · 6.30 | 5.53 / 5.71 | 1.03 |

| Run | Start (PDT) | Seconds | Load at start | Result | Tree after |
|---|---|---|---|---|---|
| `npm test` 1 (loud, not counted) | 20:08:35 | 190 | 9.26 | `✓ all 54 test files passed` | clean |
| `npm run gate:sweeps` | 20:11:50 | 700 | 12.90 | exit 0, all eight legs pass (corpus-tonal, corpus-anchor, sweep-prime, corpus-reset, corpus-contrast, mode-isolation, even-dips, chroma-envelope) | clean |
| `npm test` 2 | 20:23:40 | 114 | 4.93 | `✓ all 54 test files passed` | clean |
| `npm test` 3 | 20:28:12 | 116 | 3.94 | `✓ all 54 test files passed` | clean |
| `npm test` 4 | 20:30:13 | 125 | 4.34 | `✓ all 54 test files passed` | clean |

`npm run build` not run: the worktree has no `node_modules`; `npm test` regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` and both are committed in d77e5b74.

## Open items

| Item | State |
|---|---|
| C2.8 asks for the `gate:chroma-envelope` baseline row re-timed under the quiet-host rule and named in the plan's Revisions. Quiet readings at d77e5b74 are in Runs (21.25 · 23.19 · 22.13 s); `.sdlc/baseline.md` and the plan are not edited by this seat | 🟡 Orchestrator: carry the three readings into the row and a plan revision |
| `npm run build` not run (no `node_modules` in the worktree) | 🟡 Orchestrator or pre-land |
| C2.7's control as worded (merge-base `above100` minus 1) is blind once the head falls by more than 1; the biting form is "base value one under the head's" | 🟡 plan wording, U3 or a revision |
| `evenChroma`'s header still says "both floorRef call sites name the approximate cases" and "exact at hueShift 0 on the cam16 path"; the call sites now name the exact cases instead. Left for U3, which owns that comment (C3.5) | 🟡 U3 |
| Commit trailer reads `Claude Opus 5.5`, the model that wrote it, not the dispatch's `Sonnet 5.5` | note |
