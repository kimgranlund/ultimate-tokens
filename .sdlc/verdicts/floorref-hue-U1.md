---
kind: verdict
plan: floorref-hue
unit: U1
seat: verifier
pass: 1
ticket: "#766"
written: 2026-10-01
---

# floorref-hue U1 · pass 1 · 🟡 at `fb3b2179`

verdict: 🟡
sha: fb3b2179bb9bd4b4746fd8d3d85b744699a2e468

`unit/fh-U1` at `fb3b2179` (code head `3e815253`), merge base `8428280e`, graded against plan revision 2 (`git show 71510381:.sdlc/plans/floorref-hue.md`, section U1 rows C1.1 to C1.4 and the U1 units line). Builder builder-l3 (sonnet); checker verifier-l2 (opus, high) in a fresh context, outside the builder's model family. Review `.sdlc/reviews/floorref-hue-U1-review.md` PASS was read, not relied on. Preflight: `verdict.py check` exit 0 on the handoff and the review (both created by the unit). The seat spot-checked the scope diff, the `floor-ref` grep counts (`8` at head, `0` at the base) and the stop-300 mutant's printed `#C7EABD -> #C6EABD` in the worker's run log.

Every criterion is met and re-derived. Section 2's figures reproduce exactly against `8428280e` with an independent section 3 prototype, and both C2 negative controls named by revision 2 bite. The one 🟡 is a stale record: the handoff still records the revision 1 C2.1 control. Cleared to merge.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| Scope: no `src/` change | 🟢 | `git diff --name-only 8428280e fb3b2179` lists only `.sdlc/handoffs/floorref-hue-U1.md`, `.sdlc/reviews/floorref-hue-U1-review.md`, `scripts/report-preset-fidelity.mjs`; `git diff --name-only 8428280e fb3b2179 -- src \| wc -l` = `0` | The section 3 prototype clone `$S/proto` shows `git diff --stat` = `src/engine/tonal.js \| 7 +++----`, so a src edit would be visible to the same check |
| C1.1 head and merge base | 🟢 | `node scripts/report-preset-fidelity.mjs --floor-ref --base HEAD`: exit 0, four rows `cells 71820` / `94500` / `72124` / `94900`, each `moved 0`, `0 moved cell(s) in total` (87 s). Same with `--base 8428280e`: exit 0, `0 moved cell(s) in total`. Output carries cells, moved, palettes, docs, max dC, 5-band histogram, `moved in hueShift 0 palettes`, up to 12 movers with label, stop, from-hex, to-hex, dC, hueShift | `--base-dir $S/m16` (FLOOR_TARGET patched to `1.6 * ...`, the even-dips-gate recipe): gate STOPS `moved 41103 (57.0%)`, rendered STOPS `moved 50778 (70.7%)`, `214708 moved cell(s) in total`. Usage: `--floor-ref` with no base exits `2`; `--only bogus` prints `usage: --only must be one of ...` |
| C1.1 section 2 reproduced (prototype of section 3 vs 8428280e) | 🟢 | `$S/proto` (string replacement per section 3 in `src/engine/tonal.js`, never committed), `--floor-ref --base 8428280e`: rendered STOPS `cells 71820 · moved 3870 (5.4%) · palettes moved 1522 · docs moved 339 · max dC 9.11 C`, histogram `<0.5: 899 · <1: 624 · <2: 2213 · <4: 112 · >=4: 22`; rendered EXPORT `moved 4441 ... palettes moved 1523 · docs moved 339 · max dC 9.11 C`, `959 · 729 · 2607 · 121 · 25`; top mover `9.11 C ... Tbilisi .../secondary stop 100  #FBF9AF -> #F9F8C6`; gate STOPS `moved 6 ... palettes moved 3 · docs moved 1 · max dC 0.60 C`, gate EXPORT `moved 7`, `moved in hueShift 0 palettes: 0 palette(s)` on both gate rows | Head at its own tree (`--base HEAD`, row above) prints `moved 0` in every row, so the 3,870 / 6 figures come from the prototype edit and not the instrument |
| C1.1 / C2.1 pinned set printable and matched | 🟢 | Prototype gate STOPS movers, verbatim: `Success stop 150  #C7EABD -> #C6EBBC`, `Success stop 200  #B7DAAE -> #B6DAAD`, `Success stop 250  #A6C99E -> #A6C99D`, `Success stop 300  #95B78D -> #94B78D`, `Info stop 300  #95ACBC -> #96ACBC`, `Data 5 stop 300  #ABA880 -> #AAA880`, all `(hueShift 1)` in `brands/Adia`; EXPORT adds only `Success stop 175  #BFE2B6 -> #BEE3B5`. Exactly the plan's C2.1 set: the tool prints palette, stop, from-hex, to-hex | Stop-300 mutant `$S/m300` (paletteStops floorRef a per-ramp constant at `baseHue + shift*dir(300)`): gate STOPS `moved 6 ... max dC 0.34 C` (passes a count bound) but prints `Success stop 150  #C7EABD -> #C6EABD`, not `#C6EBBC`, so the pinned set rejects it, exactly as C2.1 rev 2 states |
| C1.1 / C2.2 anchored control | 🟢 | Prototype rendered max dC `9.11 C` on both stop sets (bound 10 C) | `$S/m450` (anchored `chromaAt` reference `maxChromaInGamut(h, firstStepTone(450))` only): rendered STOPS and EXPORT both `max dC 18.05 C`, top `nature/... Camargue .../primary stop 600  #A8585C -> #916465`, exceeds 10 C |
| C1.2 `--only default-kit` | 🟢 | `--floor-ref --base HEAD --only default-kit`: `subjects: 1 document(s), 16 palettes`, cells `304`/`400` on both paths, `0 moved cell(s) in total`, exit 0. Prototype `--only default-kit --base 8428280e`: rendered STOPS `moved 24 (7.9%) · palettes moved 7 ... max dC 4.08 C`, top `Success stop 150  #C0E8BB -> #C5E7C1`; gate STOPS and EXPORT `moved 0` (kit is `hueShift` 0) | `--base-dir $S/m16 --only default-kit`: rendered STOPS `moved 217`, EXPORT `moved 294`, gate STOPS `moved 182`, EXPORT `moved 254`, `947 moved cell(s) in total` |
| C1.3 header | 🟢 | `grep -c "floor-ref" scripts/report-preset-fidelity.mjs` = `8`; header lines 54 to 78 give the usage `--floor-ref (--base <rev> \| --base-dir <dir>) [--only <category>\|default-kit]`, the two paths, both stop sets, "A moved cell means the head renders a different hex than the base for the same palette, controls and stop", and name `#766 U1` | `git show 8428280e:scripts/report-preset-fidelity.mjs \| /usr/bin/grep -c "floor-ref"` = `0` |
| C1.4 `npm test` | 🟢 | In `$S/c1` (heavy-suite count `0` before): `✓ all 54 test files passed`, `1:41.23 total`; `node test/engine/tonal.mjs` prints `pass  report-static`; `git status --porcelain \| wc -l` = `0` before and after | `$S/brk` with one appended comment line carrying U+2014 in `scripts/report-preset-fidelity.mjs`: `npm test` exit `1`, `▶ repo/em-dash.mjs FAIL`, `✗ scripts/report-preset-fidelity.mjs:686`, `✗ 1/54 test file(s) failed` |
| U1 units line: the two C2 controls recorded in the handoff | 🟡 | Handoff `.sdlc/handoffs/floorref-hue-U1.md` C1.1 records the C2.1 control as `per-ramp constant at stop 50's rotated hue: gate STOPS 7 moved, 0.78 C` judged against "the bound 6", and a 🟡 calling the margin thin. Plan revision 2 replaced that with the pinned 6-cell set and names the stop-300 mutant as the control. The C2.2 control (`18.05 C`) matches revision 2 | I ran the revision 2 control myself (`$S/m300`, row above) and it bites against the pinned set (`#C6EABD` vs `#C6EBBC`). So the tool supports it; only the handoff record is stale |

## Findings

1. 🟡 Handoff is stale against plan revision 2. It records the stop-50 mutant (7 cells, 0.78 C) judged by a count bound as U1's C2.1 control. Revision 2 names the stop-300 mutant judged by the pinned hex set. The units line asks for "the counts recorded in the handoff", so the record should carry the stop-300 run: `Success stop 150 #C7EABD -> #C6EABD`, 6 cells, 0.34 C. This is a record gap, not a tool gap. The tool prints every field the pinned set needs (palette, stop, from-hex, to-hex), and the control bites when run.
2. Low: the handoff's 1.6x-floor control counts do not reproduce exactly. It records gate STOPS 41,140, rendered 50,783 and kit gate 183. With the FLOOR_TARGET literal scaled by `1.6 *`, I get `41103`, `50778` and `182`. Either way the control bites by tens of thousands of cells, so the verdict does not change. The handoff never says exactly how it patched the floor.
3. Info: the mover list is capped at 12 (`movers.slice(0, 12)`). That is enough for C2.1's 6/7-cell gate set, because a regression that moved more than 12 gate cells would also break the pinned count. The rendered rows only ever show the top 12, so C2.2's "names no palette with dC above 10" rests on the max-dC figure, which the sort makes equivalent.
4. Info: every section 2 figure reproduces exactly against 8428280e with my own section 3 prototype: 3,870 / 4,441, 1,522 / 1,523 palettes, 339 docs, 9.11 C, both histograms, gate 6 / 7 at 0.60 C, and kit 24 / 304 at 4.08 C.
5. Info: the review addendum's F2 (stale scope comment) is fixed at fb3b2179. Header lines 69 to 71 and `addDoc` now give the non-anchored-Adia reason.

## For the next pass

- Before U2 dispatch, bring the U1 handoff's C2.1 control up to revision 2. Record the stop-300 mutant against the pinned set: 6 cells, 0.34 C, `Success` 150 `#C6EABD` against the pinned `#C6EBBC`. Also say exactly how the 1.6x floor base was patched. This is a records fix, owned by the Orchestrator.
