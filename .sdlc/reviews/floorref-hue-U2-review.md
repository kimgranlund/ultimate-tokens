# Review floorref-hue U2 · reviewer-l3 · pass 1

Checker family: reviewer-l3 (opus) checks a builder-l5 (opus) unit; fable is capped, so this checker sits inside the builder's family under the owner's standing ruling (`.sdlc/questions/seat-reliability-approval.md`).

Target: unit/fh-U2 @ 79088044 (code head d77e5b74), against plan revision 2 (`.sdlc/plans/floorref-hue.md`, section 3, Constraints, C2.1 to C2.12, Risks), merge-base 8428280e, ticket #766. Fresh context; scratch trees under the job tmp dir (base = `git archive 8428280e`, eager = d77e5b74 with `floorRefAt` replaced by the literal three-way `Math.max`, m300 = the handoff's recipe).

## Verdict: FAIL

All twelve criteria hold and replay. The unit fails on the plan's own Risk row 1: the per-stop reading opens off-anchor even dips for edge-rotated palettes at `|hueShift|` 30 and over, inside the persisted domain (-60..60, `src/ui/persist.js` `hueShift`), where the merge-base reads 0. The Risk row's response is "stops 🟡 if a dip appears"; the handoff carries no `hueShift` 60 hand probe, and no shipped gate can see it (the corpus tops out at `|hueShift|` 10).

## Findings, ranked

| # | Severity | Item | Evidence | State | Control |
|---|---|---|---|---|---|
| F1 | High | Off-anchor dips reopen under large edge rotation (non-anchored even path, user palettes) | Grid, default-kit controls (`defaultDocument()`, `chromaFloor` 40), hues 0..355 step 5, chroma 10/20/30/45/60, opposite and same direction, oklch and cam16, `STOPS` and `EXPORT_STOPS`, predicate copied from `even-dips-gate.mjs` `findDips` (interior stop at least 3 C under both neighbours). Head dips by `\|hueShift\|`: 10: 0 · 20: 0 · 30: 4 · 45: 20 · 60: 64. Base: 0 at every shift. Repro: oklch, hue 115, chroma 60, skew 0, lift 0, `hueShift` -60, stop 400 reads 29.89 / 26.79 / 35.19 C (350 / 400 / 450), `#97A77D` to `#95A876`. Mechanism: the base floor holds flat at 22.73 C from 400 outward (one reference hue); the head reads the reference at each rotated hue, and on the light side the rotated hue's ceilings grow (stop 300 floor 32.42 C), so the floor rises outward and meets the damped value in a valley at 400, the #701 shape. The `evenChroma` header's "from there outward the floor never rises" held only because the reference hue was constant | 🔴 stop 🟡 per Risk row 1; placement or rule is the Orchestrator's and planner's call, not the builder's | Same grid on the base tree reads 0 dips, so the probe discriminates head from base; the predicate is the gate's own |
| F2 | Medium | Code comments state the 10 C tolerance as an engine bound | `floorRefAt`'s header ("elsewhere a stop moves by at most 10 CAM16 C") and `paletteStops`'s call-site comment ("under edge rotation a stop moves by at most 10 C") read as true for every input. Measured on user-reachable input: 3,000 random non-anchored palettes at `hueShift` ±60, 21 move a stop over 10 C, max 13.93 C (oklch, hue 180.49, chroma 53.1, `hueShift` 60, stop 200 `#D2E6C8` to `#C2ECB4`); 300 clamped near-grey anchors under oklch, max 17.04 C. C2.2's bound is over the curated corpus and holds there (9.11 C); the comment should say "measured over the curated corpus", not "at most". Same comment: "it equals the old per-ramp reading" is loose, the helper returns `maxc` when it short-circuits; the floor is equal, the value is not | 🟡 builder, fold into the F1 rework | The same random set at `hueShift` ±10 or the curated corpus stays under 10 C (C2.2 replay below) |
| F3 | Low | Stale test comment outside U3's greps | `test/engine/tonal.mjs` (the `dip-gate-even` block's header, the line reading `src/engine/tonal.js floorRef, one per`): "src/engine/tonal.js floorRef, one per ramp path" and "at hueShift 0 on cam16 the floor does not rise from 450/550 outward". There is no per-ramp `floorRef` now. C3.5 greps `#766` and C3.1 greps the skill files, so neither catches this line | 🟡 U3 scope (add the line to C3.5) or the F1 rework | `grep -n "one per" test/engine/tonal.mjs` hits it today |
| F4 | Low | Engine comment cites a plan path that moves at close | `floorRefAt`'s header cites `.sdlc/plans/floorref-hue.md, C2.2`; the plan moves to `.sdlc/plans/archive/` on landing (`.sdlc/adapter.md` §5), and `test/repo/citations.mjs` audits `docs/` only, so the path rots silently. Cite #766 or the ADR-026 amendment U3 writes | 🟡 builder or U3 | `grep -c "\.sdlc/plans/floorref-hue.md" src/engine/tonal.js` reads 1 today; after the archive move that path no longer exists, and `citations.mjs` stays green because it walks `docs/` only |
| F5 | Info | C2.7's plan control is blind as worded (builder's note confirmed) | `--compare` against the merge-base fixture with `even.above100` 502: exit 0. Lowered by 1 to 501 (the plan's wording): exit 0, `0 cells rose`, because the head fell to 499. Set to 498: exit 1, `1 cells rose (... even above100)`. The biting control is a moved base cell set under the head's re-captured value: a count to head minus 1, a median or p90 cell to head minus 0.1 pp (over the 0.05 slack) | 🟡 planner, a revision wording fix | Replayed all three values here |
| F6 | Info | The `floorRefAt` short-circuit deviation | Algebra: `evenChroma` reads `floorRef` only as `Math.min(maxc, floorRef)`. If a prefix maximum reaches `maxc`, the full maximum is at least `maxc` and both forms give `maxc`; otherwise the helper returns the full maximum. Both call sites pass the same `maxc` / `mc` to the helper and to `evenChroma`. NaN propagates the same in both forms. Measured: lazy against eager, 0 differing cells (hex and the float `chroma`) over 50,000 random `EXPORT_STOPS` cells (both paths, both hue spaces, relChroma, `chromaFloor` 20 to 100, `hueShift` to ±60), 600 clamped-anchor palettes, and 3,000 `hueShift` ±60 palettes. The reading stays inside `chromaAt(h)`, so it is not the section 2 placement change. Accepted as the same formula | 🟢 | Eager tree built from d77e5b74 with the literal `Math.max` of three |
| F7 | Info | Open from the handoff | `npm run build` not run (no `node_modules`); the `gate:chroma-envelope` baseline row re-timing (quiet reading 22.13 s, ratio 1.50) is the Orchestrator's | 🟡 Orchestrator | `ls node_modules` in the worktree: `No such file or directory`, so `npm run build` cannot run there |

## Criteria

| Id | Evidence (reviewer's own run unless marked) | State | Control |
|---|---|---|---|
| C2.1 | `--floor-ref --base-dir <8428280e>`: gate `STOPS` 6 / 3 / 1 / 0.60 C, the exact pinned set (Success 150 `#C6EBBC`, 200 `#B6DAAD`, 250 `#A6C99D`, 300 `#94B78D`; Info 300 `#96ACBC`; Data 5 300 `#AAA880`); `EXPORT_STOPS` adds only Success 175 `#BEE3B5`; `moved in hueShift 0 palettes: 0` on both gate rows | 🟢 | M300 replayed: 6 cells, 0.34 C, Success 150 `#C6EABD`, rejected by the set |
| C2.2 | Same run: rendered `STOPS` 3,870 / 1,522 / 339 / 9.11 C, `EXPORT_STOPS` 4,441 / 1,523 / 339 / 9.11 C, histograms equal section 2's, top mover Tbilisi `secondary` 100 `#FBF9AF` to `#F9F8C6` | 🟢 (curated corpus; see F2 for user input) | M450 not replayed; builder's 18.05 C reading |
| C2.3 | Read: `floorRefAt(h, mc, pivotTone, tone450, tone550)` is `evenChroma`'s fifth argument inside `chromaAt = (h) => ...`; `solveCam16Hue` and `const chroma = chromaAt(hue)` read it; pivot ceiling at `pivotTone`; no `const floorRef` remains. Exactness claims measured: non-anchored `hueShift` 0 (both spaces) and anchored cam16 `hueShift` 0 (unclamped and 300 clamped anchors) move 0 cells against base | 🟢 | The diff removes both `const floorRef` lines |
| C2.4 | `npm test` green (runs `tonal.mjs` `dip-gate-even` and both `FLOOR_TARGET` controls); `evenChroma` header and body byte-identical to base; `even-dips-gate.mjs` and `tonal.mjs` untouched; the `FLOOR_TARGET` literal present once | 🟢 on the corpus; F1 outside it | Built-in controls ran inside `npm test` |
| C2.5 | `npm test` green; `mode-isolation.json` untouched; `--compare` reads perceptual and peak byte-identical | 🟢 | Builder's C25 recipe, not replayed |
| C2.6 | `tonal-legacy.json` untouched (diff against 8428280e empty); `intensity-legacy` green in `npm test` | 🟢 | Not replayed |
| C2.7 | `--capture --fixture <scratch copy>` on the head reproduces the committed fixture byte for byte (even 47.0 / 100.0 / 499); `--compare` against base: perceptual and peak byte-identical, `0 cells rose`, exit 0 | 🟢 | F5: 498 reds, 501 does not |
| C2.8 | Builder's readings: even-dips 1.03, chroma-envelope 1.50 quiet, both inside bounds; reviewer's `npm test` 222 s at load 5.9 (loud, not a ceiling reading) | 🟢 ratios; 🟡 baseline row (F7) | Builder's EAGER pairing read 2.57x pairwise, over the 2.5 bound, so the pairing registers a slowdown |
| C2.9 | Builder's `--identity-control --authored` run: perceptual and peak 0 of 94,500, even 4,418; the F6 identity covers the even mode | 🟢 | The same mode exits 1 on `4448 differing cells`, so the compare ran and is not vacuous |
| C2.10 | `semantic.mjs` green inside `npm test` | 🟢 | Builder's FLOOR0, not replayed |
| C2.11 | `grep -c "deferred to #766\|the issue its comment names" src/engine/tonal.js` reads 0 | 🟢 | Base reads 2 |
| C2.12 | 14 added code lines; hue-comparison pattern 0 hits; numeric literals 0, 450, 550 only (stop numbers and the accumulator start); `ref >= maxc` compares chroma | 🟢 | Builder's C212 synthetic lines read 2 |
| Bundles | `npm test` regenerated every committed asset and the tree was clean after: `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` match their generators | 🟢 | The regen step rewrites both files in place, so a hand edit or a stale bundle shows in `git status --short` after the same run |
| Doc citations | The two `okhslLAt` edits (1026 to 1046) are a forced record repair: with the base copies of both docs and head `tonal.js`, `test/repo/citations.mjs` exits 1 (`00-synthesis.md:89` and `04-context-and-messaging.md:71` STALE); with the head copies it exits 0. In scope as the same-change repair | 🟢 | That base-docs run |
| Stale comments | `evenChroma` header ("both floorRef call sites name the approximate cases") is U3's under C3.5, as the handoff says; F3 is the one the plan's greps miss | 🟡 F3 | `grep -c "both floorRef call sites name" src/engine/tonal.js` reads 1 today, the line U3 must retire |

## Runs

| Run | Result |
|---|---|
| `node scripts/report-preset-fidelity.mjs --floor-ref --base-dir <base>` | exit 0, 89 s, rows above |
| Same on m300 | gate `STOPS` 6 cells, 0.34 C, Success 150 `#C6EABD` |
| `npm test` (20:51 PDT, load 5.9, 0 heavy processes at start) | `✓ all 54 test files passed`, 222 s, tree clean after |
| `chroma-envelope-gate.mjs --capture --fixture <scratch>` | byte-identical to the committed fixture |
| `chroma-envelope-gate.mjs --compare` at above100 502 / 501 / 498 | exit 0 / 0 / 1 |
| Fuzz lazy vs eager vs base, clamped anchors, `hueShift` grid | F1, F2, F6 figures |

## For the Orchestrator

| Item | Owner |
|---|---|
| F1: decide the rule. One general option that keeps R78 (no hue table) and the per-stop hue: take each stop's reference as the running minimum of `floorRefAt` from the pivot outward, so the reference is non-increasing outward, the property the per-ramp constant gave (not measured here; it needs the same grid to read 0); then add a `hueShift` 60 row to the dip gate's corpus as Risk row 1 says | Orchestrator, planner |
| F2 to F4 into the rework or U3 | builder, U3 |
| F5 wording | planner revision |
