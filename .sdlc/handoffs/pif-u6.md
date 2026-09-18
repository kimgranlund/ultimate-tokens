---
kind: handoff
unit: U6 (M) prime ladder steps equally in perceived lightness
plan: preset-intent-fidelity (ticket #681, P1)
branch: unit/pif-u6-ladder
written: 2026-09-18
status: gates green, rebased onto origin/plan/preset-intent-fidelity @ 6429c49, review passes 1-3 folded, gamut-ceiling gate added per owner ruling and given a real negative control
---

# U6 handoff: prime ladder steps equally in perceived CIE L*, held CAM16 chroma

## Review pass 1 (fresh-context reviewer, 🔴 FIX-FIRST against head ac93f2b) — folded

Report: kept by the team lead, not committed to this branch. All findings addressed:

- **S1 (blocking).** The `symmetry` negative control read `origin/main` live via `git show` at
  test-run time, which reds `npm test` in PR CI (no `origin/main` ref on a `pull_request` checkout) and
  permanently on `main` after this unit's own squash-merge. Fixed: vendored
  `test/engine/fixtures/prime-pre-681.mjs`, a frozen, committed copy of `src/engine/prime.mjs` at
  `origin/main` blob `c744fb8` (commit `9195773`), imported statically. Same discipline as `d5`'s frozen
  hex snapshot. Re-verified: same 295/464 exceed-3L* count as the live version.
- **S2 (blocking for C5).** `ladder-window` printed 0 on the false premise that C5's 21-name corpus was
  U1-only data. It is not: the source hexes are shipped now, under
  `docs/reference/colors/categories/*.json` `palettes[].swatches[].hex`. Fixed: `mapColorsRoles` in
  `test/engine/prime.mjs` independently re-derives `scripts/gen-categories.mjs`'s own six-role mapping
  from the raw swatch data (never calling the generator), iterates all eight category files, and asserts
  both the count (21) and the exact (category, role, hex) triple set against C5's canonical list. Every
  hex and role matches C5 character for character.
- **S3 (🟡, escalated).** `inGamut: false` (including on the prime rung) surfaced because
  `maxChromaInGamut`/`peakC` (`src/engine/hct.js`) memoize on `hue.toFixed(2)`, a coarser key than the
  float hues this ladder renders at per rung. Investigating the reviewer's suggested epsilon-shave fix
  surfaced something bigger: the SAME shared-cache bucketing makes two calls to `primeSwatches` for the
  identical logical palette return DIFFERENT hex values depending on what else had rendered earlier in
  the same process — reproduced directly as a break of `test/engine/exports.mjs`'s REQ-043
  theme-independence check (`exportPanda({...state, theme:'light'})` disagreeing with the same call
  under `theme:'auto'`, purely from an unrelated `exportPanda` call for a different fixture running in
  between and evicting/repopulating the shared cache). An epsilon nudge conditioned on the observed
  `inGamut` flag does not fix this, because `inGamut` itself is cache-order-dependent. Fixed properly:
  `localMaxChroma` in `prime.mjs`, a private reimplementation of `maxChromaInGamut`'s own binary
  search, used only inside `primeSwatches` — a genuinely pure function of `(hue, tone)` alone, no
  cross-call interference possible (review pass 1 shipped this uncached; review pass 2 added a private,
  exact-keyed cache back for cost reasons — see below, correctness is unaffected either way). Gate (c)
  widened to a hueShift x skew x both-space sweep (matching the reviewer's reproduction scale) and the
  REQ-043 scenario re-verified directly: 0 violations over 54,000 palettes / 378,000 swatches, and
  `exportPanda` under `light`/`dark`/`auto` now byte-identical again even with an intervening unrelated
  export call.
- **S4 (🟡).** Confirmed as described: `docs/spec/spec-muted-base-key-spikes.md`,
  `docs/lld/lld-muted-base-key-spikes.md`, and `docs/spec/spec-panda-park-ui-exports.md` are now stale
  and none is in U5's file list (`.sdlc/plans/preset-intent-fidelity.md:225-226`). This is a plan edit,
  not a unit edit — reported to the team lead / Orchestrator to add to U5's scope; not changed here.
- **S5.** `.sdlc/questions/pif-u6.md` amended: the clipped-defaults trip-wire stays green through a
  plain U1 merge (unknown fields forwarded harmlessly) and only reds on the actual U1+U6 integration
  edit to `prime.mjs` — stated explicitly now so a green `npm test` right after a U1 merge is not
  mistaken for "the ladder is anchored."
- **S6 (🟢 note).** No action — expected pre-U1 state, cited as-is (five default families ship a
  collapsed prime ladder under cusp anchors; Q2(b)'s minted anchors are the cure, per U1).
- **S7 (🟢 low).** `test/engine/prime.mjs`'s d5 capture-commit citation re-pointed from the pre-rebase
  `766478b` to `c286d40`. The handoff's test-file count was already corrected to 47 in the prior
  (rebase) update.

New file: `test/engine/fixtures/prime-pre-681.mjs` (frozen negative-control fixture, S1).

## Gamut-ceiling criterion (owner ruling, folded after review pass 1; superseded by review pass 3 — see below)

The owner ruled: the reviewer's pre-S3 count of 1,288/302,400 out-of-gamut rungs is accepted,
ship as is; a rev9 of the plan adds a numeric ceiling criterion on U6 for exactly that count;
gate it by measuring the count on my own folded head (not by re-asserting the reviewer's 1,288
figure, which described the PRE-S3 head, not mine) and assert it does not exceed what I measure.

**Superseded, review pass 3 (see the "Review pass 3" section below for the full fold):** the version
described in the rest of this section — riding on gate (c)'s full-precision sweep, pinning
`PINNED_GAMUT_CEILING = 0` with no negative control — could never fail by construction (`chroma` is
always `min(cPrime, cap)` where `cap` is a value the binary search just confirmed in gamut, so
"chroma <= cap is in gamut" is a tautology, not a testable fact). Kept below as a record of what
shipped between the pass-1 and pass-3 folds; the shipped gate now uses its own smaller sweep with a
real negative control (`vulnPrimeSwatches`), still pinning a measured ceiling of 0.

- **What I pinned (pass 1 fold, since revised):** `PINNED_GAMUT_CEILING = 0` in `test/engine/prime.mjs`
  (new `gamut-ceiling` gate).
- **How derived (pass 1 fold, since revised):** reused gate (c)'s widened sweep, now run at full
  precision (hue step 1, matching what was BELIEVED to be the reviewer's own reproduction exactly: hue
  0..359 x chroma {25,50,75,100} x hueShift {0,±10,±20} x skew {0,±40} x both hue spaces = 43,200
  palettes x 7 rungs = 302,400 rungs, chroma 0 excluded to match the reviewer's denominator since it is
  neutral and trivially always in gamut). Measured on commit `7cd5e2e` (this fold): **0/302,400**
  out-of-gamut. The S3 fix (`localMaxChroma`, already shipped before this ruling arrived — it was
  required regardless to close the REQ-043 determinism break) turns out to eliminate the violations
  entirely, so the honestly-measured ceiling on this head is 0, not a re-statement of the
  owner-accepted 1,288 figure from the pre-S3 head. **Correction, review pass 3:** the belief that this
  matched "the reviewer's own reproduction exactly" was wrong — their sweep uses 4 hueShift values x 5
  chroma values, this one used 5 x 4; the 302,400 totals coincided by accident. On MY parameters the
  pre-fix violation count is 1,549, not the reviewer's 1,288 (also independently re-measured, see
  "Review pass 3" below) — I had been citing a number from different axis parameters as if it were
  the same measurement.
- Gate (c) itself was widened alongside this (hue step 3 → step 1) since the two now shared one sweep
  pass rather than running two separate expensive loops; **reverted to step 3 in review pass 3** once
  the two gates were decoupled (see below).

## Review pass 2 (fresh-context reviewer, 🔴 FIX-FIRST, narrow) — folded

Report: kept by the team lead, appended to the review pass 1 report in their scratchpad. S1/S2/S4/S7
from pass 1 confirmed closed and the gamut-ceiling 0/302,400 pin confirmed independently. Two new
findings, both addressed:

- **Blocker 1: determinism was only half fixed.** S3 (review pass 1) made the per-RUNG gamut cap
  (`localMaxChroma`) uncached, but `primeSwatches`'s own ANCHOR (`lPrime`/`keyChroma`, from
  `peakC(baseHue)`) still called hct.js's SHARED, memoized `peakC` directly, which itself calls hct.js's
  SHARED `maxChromaInGamut` across its own t-sweep — the identical collision hazard one level up. The
  reviewer's own repro: 63/4000 colliding palettes shifted ANCHOR hex by call order even after S3 (13
  per 1000 post-S3, 15 pre-S3, 4 on `main` — S3 helped but did not close it). The risk 5 item in this
  handoff (below) had wrongly called `prime.mjs` a bystander to a latent `hct.js`-only risk; it was not
  — `primeSwatches` itself made the vulnerable call. Fixed: `localPeakC` in `prime.mjs`, this file's own
  private reimplementation of `peakC`, built on `localMaxChroma`. No part of `primeSwatches` (anchor or
  rung) reads any hct.js shared cache anymore. Rather than dropping caching outright (which had made a
  single widened sweep run roughly two minutes slower for no correctness gain, since the anchor's
  `baseHue` recurs identically across every `hueShift`/`skew` combination for a fixed
  `(hue,chroma,hueSpace)`), both `localMaxChroma` and `localPeakC` keep a cache — but a PRIVATE one
  (`boundedCache` imported from hct.js as a stateless factory, own instance, never shared), keyed on the
  EXACT, untruncated float (`hue + "|" + tone`, `String(hue)`) rather than hct.js's lossy `.toFixed(2)`.
  Two different hues can never collide into the same bucket under an exact key, so a cache hit only ever
  fires for a bit-identical repeat and returns exactly what a fresh computation would. Manually verified
  (scratch reproduction in the session scratchpad, not committed — reverted `localPeakC` back to calling
  hct.js's shared `peakC` in a throwaway copy of `prime.mjs` and re-ran the same interleave): the
  vulnerable version measured 23/4000 mismatches on a dense fractional-hue sweep; the shipped version
  measures 0/1500 (and 0/4000 at the original scale, also checked in scratch before sizing down for cost).
- **Blocker 2: gate (c) claimed determinism but only checked `inGamut`.** Two different in-gamut hexes
  for the same logical palette both read `inGamut: true`, so the prior sweep could not have caught
  either blocker above by itself. Fixed: a new hex-identity assertion (folded into gate "c", not a
  separate gate) runs a dense, non-integer 1500-case hue sweep through `primeSwatches` twice, with an
  hct.js-shared-cache-poisoning sweep (3600 unrelated hues at a dense 0.1deg step, forcing real LRU
  eviction/repopulation of hct.js's OWN `peakC`/`maxChromaInGamut` caches) interleaved between the two
  passes, and asserts every rung's hex is byte-identical both times. Sized down from an initial
  4000-case version (~45s standalone) to 1500 (~20s) by CUTTING CASE COUNT, not poison density — a
  scratch check found that thinning the poison sweep to a 0.5deg step made the vulnerable code read a
  false-clean 0/1500, while keeping the dense 0.1deg poison step and only cutting cases to 1500 still
  caught 3/1500 on the same vulnerable code. Cost (team lead flagged `npm test` at 2:21 against a 58-62s
  baseline before this fold): the private exact-keyed caches recovered most of the anchor-path cost the
  uncached `localPeakC` would otherwise have added, and sizing the determinism sweep to 1500 cases (dense
  poison kept) brought `npm test` to 1:49 (109.9s) and the standalone `node test/engine/prime.mjs` run to
  1:03 (63.8s) — both re-measured on this fold's head, full re-run, tree clean after.

## Review pass 3 (fresh-context reviewer, 🔴 FIX-FIRST, then two corrections) — folded

Report: appended to the same review file the team lead holds. Confirmed: the 0/302,400 pin from the
gamut-ceiling fold above is real (1,288 pre-fix, 0 on this head); the reviewer's own three "apparent
survivors" while checking my work were probe artefacts on their end, not a bug here. One new finding,
plus two corrections the team lead relayed after their own re-check:

- **Finding: the gamut-ceiling gate cannot fail.** `chroma` in `primeSwatches` is always
  `Math.min(cPrime, cap)`, and `cap` (`localMaxChroma(hue, l)`) is itself a value the SAME function's
  own 18-iteration binary search just confirmed in gamut via `hctToRgb`. "chroma <= cap renders in
  gamut" holds by the identical monotonicity assumption the binary search itself depends on to be
  valid at all — a mathematical tautology given the current construction, un-falsifiable by any sweep
  at any scale, not a fact this test can discover. The reviewer's own 1,456-slice probe already showed
  zero counterexamples; running the SAME tautological check at 302,400-rung scale (riding on gate (c)'s
  sweep) bought no additional discriminating power for real cost (part of what pushed `npm test` to
  2:21). Fixed: decoupled gate (c) from the ceiling gate. Gate (c) reverted to its review-pass-1-
  approved, cheaper step-3 sweep (its own purpose — a broad `inGamut===true` correctness check — never
  needed step-1 resolution; that was only added to match a denominator the ceiling gate no longer
  needs). The `gamut-ceiling` gate now runs its own smaller, dedicated sweep (hue step 2 x chroma
  {25,50,75,100} x hueShift {0,±10,±20} x skew {0,±40} x both hue spaces = 151,200 rungs) and adds a
  REAL negative control: `vulnPrimeSwatches`, a reimplementation of `primeSwatches`'s exact
  construction but using hct.js's shared, `.toFixed(2)`-truncated `peakC`/`maxChromaInGamut` in place
  of `prime.mjs`'s private, exact-keyed `localPeakC`/`localMaxChroma` — i.e. literally the pre-fix
  construction, which CAN clip past the true gamut boundary on a cache-bucket collision (a real,
  non-tautological failure mode). Measured on this fold: 0/151,200 real violations (the pinned
  ceiling, unchanged), and a robust, repeatable nonzero count on the vulnerable reconstruction
  (327/151,200 in this test file's own run context — the count is inherently order-dependent, since
  it deliberately reads hct.js's shared, history-sensitive cache, but stayed at exactly 327 across
  repeated runs of the unchanged file, and a standalone, cold-cache measurement of the same sweep
  parameters found 89/151,200 — both comfortably nonzero, proving the check would catch a regression
  back to the shared cache). `npm test` standalone `node test/engine/prime.mjs` time: 63.8s -> 39.8s.
- **Correction 1 (relayed after the finding above).** The negative control already existed in spirit —
  the pre-fix cached-cap construction, run on the reviewer's own parameters, measures 1,546/302,400.
  This also licenses a far smaller sweep than the 40s one I had been running. Addressed by building
  `vulnPrimeSwatches` (above) rather than reusing a fixture, since no committed fixture captured this
  specific intermediate (post-S3, pre-review-pass-3) construction — `test/engine/fixtures/prime-pre-681.mjs`
  is the OLDER, pre-#681 OKHSL-domain construction, a different bug entirely; reimplementing the
  cap-only difference inline (mirroring this file's own stated pattern of independently re-deriving
  expectations from hct.js's own primitives, never calling back into `primeSwatches`'s internals) was
  more honest than trying to make an unrelated fixture serve double duty.
- **Correction 2.** My gate's own comment had credited "the reviewer's own reproduction sweep" for the
  302,400 denominator while actually using different axis composition (theirs: 4 hueShift values x 5
  chroma values; mine: 5 x 4) that only coincidentally summed to the same total — and on MY axis
  composition the pre-fix violation count is 1,549, not the reviewer's 1,288 (a number that belongs to
  a DIFFERENT parameter set, not mine). Instructed to measure my own parameters and cite that, or adopt
  theirs, rather than carry a copied figure. Fixed: independently re-measured 1,549 on my own 5x4 axis
  composition at full hue-step-1 resolution (302,400 rungs) via a standalone script before writing
  anything into the committed gate — it matched the team lead's own independent re-check exactly. The
  shipped gate's comment now states its own parameters plainly, cites the 1,549 cross-check as
  independently re-measured (not copied), and the actual committed negative control runs its own
  smaller 151,200-rung sweep (327/151,200 vulnerable, in this file's run context) rather than the full
  302,400-rung one, per the cost finding above.

## Commits (post-rebase, plus the gamut-ceiling, review-pass-2, and review-pass-3 folds)

- `c286d40` feat(prime): ladder steps equally in perceived CIE L*, held CAM16 chroma (#681 U6)
- `b0e2adb` test(prime): cite the d5 frozen snapshot's capture commit (#681 U6)
- `ac93f2b` docs(sdlc): U6 handoff for #681 prime ladder (#681 U6)
- `d922aaf`/`a5e5986`/`f9fb08e` review pass 1 fold (S1-S7, see above)
- `7cd5e2e` test(prime): pin a numeric gamut-ceiling gate per owner ruling (#681 U6)
- `8b9400d` docs(sdlc): fold the gamut-ceiling ruling into the U6 handoff (#681 U6)
- `3fe82d9` fix(prime): close the anchor-path determinism hazard, assert hex identity (#681 U6 review
  pass 2)
- `49ac4e7` docs(sdlc): fold review pass 2 into the U6 handoff (#681 U6)
- `3a9e6bb` test(prime): give the gamut-ceiling gate a real negative control (#681 U6 review pass 3)

`head: 3a9e6bb` (pending this handoff commit). `base: bf2aaf6` (`git merge-base HEAD origin/main`,
re-measured after rebasing onto
`origin/plan/preset-intent-fidelity` @ `6429c49`, per team-lead instruction). Rebased cleanly, no
conflicts (`git rebase origin/plan/preset-intent-fidelity`). Re-read `.sdlc/plans/preset-intent-fidelity.md`
at the new tip: U6's own unit bullet (line 223-224) is byte-identical to what this unit was built
against — revisions 7 and 8 on the rebased plan branch are both in U3's text, confirmed via
`git diff fb3ad33 6429c49 -- .sdlc/plans/preset-intent-fidelity.md`. No changes needed as a result.
No further rebase has happened since (rev9 plan tip not yet sent).

Original (pre-rebase) commits, superseded by the rebase: `766478b`/`9bbfe0a`/`95355a5` (same content,
different shas after the rebase rewrote parent history).

## Scope note (read this first)

U1's `anchor` field is not on this branch. Per the team-lead dispatch (2026-09-18): "U6 is independent
of U1's anchor field... use the existing key colour's L\* on the non-anchored path so your unit stands
alone, and say so in the handoff." Concretely: `src/engine/prime.mjs`'s ladder anchor is
`peakC(baseHue).tone` (the cusp key colour's own CIE L\*, unchanged from pre-#681), not U1's minted
source hex. This has two knock-on effects, both surfaced below and in `.sdlc/questions/pif-u6.md`:

1. ~~The plan's C5 "ladder-window allow-list: 21 (expected 21)" needs U1's source-anchored corpus
   data~~ — CORRECTED in review pass 1 (S2, false premise): C5's 21-name list is a property of the
   already-shipped curated corpus source swatches (`docs/reference/colors/categories/*.json`), not of
   U1's `anchor` field. `ladder-window` now iterates that corpus directly and matches C5's list exactly
   (count and every name). The cusp anchor's own [32, 96] L\* range (comfortably inside the ladder
   window) is a separate, true fact about `primeSwatches`'s ANCHORS, unrelated to this gate's real job.
2. The dispatch's pinned clipped-default spans (Tertiary/Danger/Warning at 52.8/49.9/46.3 L\*) are
   computed against U1's anchors and do not reproduce on the cusp anchor: Tertiary and Danger are
   UNCLIPPED here (span 54 exactly), and Warning clips to 45.77, not 46.3. `test/engine/prime.mjs`
   asserts what IS true on this branch (a different clip set: Secondary, Info, Success, Warning, Data
   1/4/5/6/7) plus an explicit "Tertiary/Danger unclipped here" trip-wire, so this reconciles visibly,
   not silently, once U1 lands. Full measurement table in `.sdlc/questions/pif-u6.md`.

## What changed

`src/engine/prime.mjs`: full rebuild of the seven-swatch prime ladder.

- **Metric**: CIE L\*, not OKHSL `l`. The anchor's L\* is `peakC(baseHue).tone` directly — `hctToRgb`'s
  `tone` argument already converges to that exact CIE L\* by construction, so no OKHSL round trip is
  needed to read it (this also makes gate (h)'s REQ-056 identity exact rather than "within one 8-bit
  step" for the prime rung specifically, since chroma at t=0 now algebraically equals `keyChroma`
  exactly, not merely close).
- **Step**: `STEP_L = 9` (Q8: keeps the 54 L\* total span, `6 * STEP_L`).
- **Wall rule**: equal-compress (Q9), replacing #641's redistribute rule. `primeSteps(lPrimeStar)` now
  returns `up === down === Math.min(STEP_L, roomUp, roomDown)` — the two sides are the SAME computed
  value, not merely close, whenever either bound is in reach.
- **Chroma**: held at the anchor's own CAM16 chroma on every rung (`cPrime`), desaturated only where
  `maxChromaInGamut(hue, l)` at that rung's own tone can't carry it (Q9 "hold C").
- **Window**: `PRIME_L_MIN`/`PRIME_L_MAX` are now CIE L\*, DERIVED at module load from the retired
  OKHSL-domain grey bounds (0.14/0.97) via `lstarFromRgb(okhslToRgb(0,0,l))` — one source of truth, not
  a second, independently-typed literal (measured: 12.250030101522825 / 96.88492823209958, matching the
  plan's stated [12.25, 96.88]).
- `PRIME_STEP` (the old OKHSL-domain step constant) is retired; nothing outside `prime.mjs` and its own
  test imported it (checked via repo-wide grep before removing it).
- Returned shape is UNCHANGED (`{step, l, s, hue, rgb, hex, oklch, inGamut}` — the shape `exports.js`
  and `model.mjs` document in a comment) so no downstream caller needed touching; only field DOMAINS
  moved (`l` is now CIE L\* 0–100, not OKHSL `l` 0–1; `s` is now the rung's rendered CAM16 chroma, not
  OKHSL saturation — checked: nothing outside `prime.mjs`'s own test reads `.l`/`.s`/`.hue` numerically,
  the UI only reads `.hex`/`.step`/`.inGamut`).

`test/engine/prime.mjs`: d1/d3/d4/d6 rewritten for the equal-compress L\*-domain formula; d5 re-frozen
(seven unclipped defaults under the cusp anchor — Neutral, Primary, Tertiary, Danger, Data 2, Data 3,
Data 8; Data 8 is newly unclipped versus the pre-#681 six-family set); (g) re-based on measured CAM16
chroma (the code was already domain-agnostic — only the comment and tolerance needed updating, since
`.s` now means chroma); (e)/(f) re-based on CAM16 hue instead of OKLCH hue (see below — a real,
measured property change, not a test bug); new gate (k) verifies the chroma-hold property from measured
pixels (`cam16FromRgb`, not the internal `.s` field), skipping near-neutral cases (measured prime chroma
< 3 CAM16 units) the same way (e)/(f)'s hue tolerance already skips near-neutral hue noise; new
`ladder-window` gate (iterates the real curated corpus, review pass 1 S2 — see below); new `symmetry`
gate: by-construction `|up-down| <= 1e-9` (0 failures, 464 cases: 16 defaults + hue 0..359 step 5 x
chroma {0,50,100}, both hue spaces) and pixel-measured `<= 3 L*` (0 exceptions, max measured asymmetry
0.518 L\*), with a negative control against a FROZEN fixture, `test/engine/fixtures/prime-pre-681.mjs`
(a committed, byte-for-byte copy of `origin/main`'s pre-#681 `prime.mjs` at blob `c744fb8`, imports
rewritten to this worktree's unchanged `hct.js`/`okhsl.js`/`tonal.js`; review pass 1 S1 — a first pass
read `origin/main` live via `git show` at test-run time, which reds `npm test` in PR CI and permanently
on `main` after this unit's own squash-merge) over the SAME sweep, confirming it FAILS: 295/464 cases
exceed 3 L\*, max asymmetry 52.01 L\*.

**Why (e)/(f) moved to CAM16 hue.** The old construction rendered every non-prime rung through
`okhslToRgb(hue, s, l)` at a fixed OKHSL hue, so the rendered pixel's measured OKLCH hue stayed fairly
stable across the ladder (one nonlinear model, uniformly applied). The new construction renders every
rung through `hctToRgb(hue, chroma, l)` at a fixed CAM16 hue — and a fixed CAM16 hue does NOT hold a
fixed OKLCH hue across varying tone (the Abney effect this codebase already corrects for elsewhere via
`oklchToCam16Hue`). Measured on Neutral (hue 267, chroma 29): CAM16 hue across all seven rungs stays
within ~2.6° of the 267.000 target (8-bit-rounding scale), while OKLCH hue spans 265.8–271.3° (a real
~5.4° spread at IDENTICAL CAM16 hue, tone alone varying). Comparing OKLCH hue across rungs was testing
a property the ladder never promised to hold under the ruled construction; comparing CAM16 hue tests
the actual invariant.

`test/engine/exports.mjs`: re-pinned the two EX-1 panda literals that moved
(`colors.primary.prime.brightest` `oklch(0.8266 0.0853 258.93)` → `oklch(0.82 0.0893 266.91)`;
`.dimmest` `oklch(0.3543 0.1307 258.84)` → `oklch(0.3575 0.1329 258.11)`); `.prime` itself is unchanged
(REQ-056 identity preserved exactly). This is the only file outside my stated scope files I touched —
required because `npm test` regenerates from `src/engine/prime.mjs` and this frozen literal is a
mechanical consequence of the ladder rebuild, not a design decision.

## STOP-and-report: stale docs/spec (not edited, out of lane)

Per the dispatch: "If a docs/spec literal moves, STOP and report the lines; docs are out of lane except
the handoff." These are now stale as a direct, mechanical result of U6 and were NOT edited:

- `docs/spec/spec-panda-park-ui-exports.md:419-424` — EX-1's normative `.brightest`/`.dimmest` literals
  (same two values as the exports.mjs re-pin above). The comment in `test/engine/exports.mjs` used to
  say these are "re-pinned here AND in the SPEC's own Examples section in the same change, so the
  normative text and this mirror cannot drift apart" — that invariant is now broken until the SPEC is
  updated.
- `docs/spec/spec-muted-base-key-spikes.md` — the whole REQ-051 section (roughly lines 24–228, 327,
  418–508) is normative prose/pseudocode for the RETIRED redistribute rule (`PRIME_STEP`,
  `PRIME_L_MIN`/`MAX` as OKHSL-domain 0.09/0.14/0.97 literals, the `short = ...` redistribution
  formula). This SPEC needs a superseding amendment (REQ-051 revised or a new REQ for Q8/Q9's
  equal-compress rule), not a hand-edit from this unit.
- `docs/lld/lld-muted-base-key-spikes.md` — same retired formula, lines 35/70/77-80/200-222.
- `docs/reference/CHANGELOG.md:73,77,86,195` — narrates the pre-#681 span/window history in
  `PRIME_STEP`/`PRIME_L_MAX` terms; needs a new dated entry for #681 U6, not an edit of the old ones.
- `docs/reference/references/knowledge-02-tonal-scale.md:267-271,286` — same retired
  `primeSteps`/`PRIME_STEP` pseudocode.

None of these break `npm test` (checked: `node scripts/audit-citations.mjs` finds 0 STALE citation
lines anywhere, and zero citations reference specific `prime.mjs` line numbers, so my heavy rewrite
didn't invalidate any pinned citation — these are narrative/prose staleness, which citations.mjs
doesn't check). This is plan unit U5's territory ("records") per the plan's own unit table.

## Criteria (as scoped to U6: C1, C5 ladder half, C11)

| Criterion | Command | Observed | Negative control |
|---|---|---|---|
| C1 `npm test` green | `npm test` | exit 0, `✓ all 47 test files passed`; `git status --short` empty after every fold's re-run; `node scripts/audit-citations.mjs` STALE 0 everywhere; `node test/repo/branding.mjs` clean (447 files); standalone `node test/engine/prime.mjs` 39.8s on the review-pass-3 fold head (down from 63.8s pre-pass-3, 45s+ during the pass-2 fold itself) — `npm test` total wall time varied 1:36-2:10 across repeated runs on this fold's head, which I attribute to other worktrees/sessions competing for CPU on this machine (consistent with the earlier "concurrent run" caveat this session was given), not to this gate's own cost; the standalone, single-process figure is the reliable signal | not re-run here (owned by C1's own negative control in `.sdlc/adapter.md` §1 — corrupt role-table.json, expect 17 FAIL — out of my unit's scope to re-verify; my own red-then-green is below) |
| C5 (ladder half) | `node test/engine/prime.mjs`, gate `ladder-window` | `ladder-window allow-list: 21 (expected 21)` — iterates every swatch across `docs/reference/colors/categories/*.json`, re-derives the six-role mapping independently, matches C5's 21-name list on (category, role, hex) exactly (review pass 1 S2; superseded the false-premise "0" this gate printed before review) | synthetic [40,60] narrow window inside the same gate: found more than 21 out-of-window cases, proving the filter discriminates on the window bounds |
| C11 symmetry | `node test/engine/prime.mjs`, gate `symmetry` | by-construction: 0/464 fails, `|up-down|` exactly 0 every case. Measured (pixel `lstarFromRgb`): 0/464 exceed 3 L\*, max measured asymmetry 0.518 L\* | the frozen `prime-pre-681.mjs` fixture (pre-#681 redistribute rule), same 464-case sweep: 295/464 exceed 3 L\*, max asymmetry 52.01 L\* — FAILS as required (review pass 1 S1: this control previously read `origin/main` live via `git show`, now a committed fixture) |
| gamut-ceiling (owner ruling, post-review, corrected review pass 3) | `node test/engine/prime.mjs`, gate `gamut-ceiling` | 0/151,200 real out-of-gamut rungs, pinned ceiling 0, on this gate's own dedicated sweep (hue step 2 x chroma {25,50,75,100} x hueShift {0,±10,±20} x skew {0,±40} x both hue spaces — see "Review pass 3" above for why this is no longer the reviewer's/gate-(c)'s 302,400-rung sweep) | `vulnPrimeSwatches`, a reimplementation using hct.js's shared, truncated-key `peakC`/`maxChromaInGamut` in place of `localPeakC`/`localMaxChroma` (the real pre-fix construction): 327/151,200 in this file's own run context (order-dependent by construction, repeatably nonzero across runs; 89/151,200 measured cold-cache, standalone) — proves the gate discriminates a regression back to the shared cache, closing review pass 3's "cannot fail" finding |

Red-then-green, every gate: before my `src/engine/prime.mjs` edit, `node test/engine/prime.mjs` threw a
`SyntaxError` (`PRIME_STEP` no longer exported) — the RED state, since I edited the engine before the
test. After rewriting both files together: all of a/b/c/d1/d2a/d3/d4/d5/d6/d2/e/f/g/h/i/j/k/
ladder-window/symmetry read `pass`. (I did not keep a separate "old test file vs new engine" red
capture beyond that import error, since the old test file's entire OKHSL-domain vocabulary — `PRIME_STEP`,
`.l` as OKHSL — is incompatible with the new engine at the language level, not just assertion-level; the
import error IS the honest red state.)

Additional, not formally scoped but load-bearing: gate (k) (chroma-hold, re-derived via `cam16FromRgb`
on rendered pixels, 3,248 rungs checked, 1,008 near-neutral rungs correctly excluded, 0 violations) and
gate (g) (chroma scales exactly linearly with `primeChroma`, ratio 0.5 exactly on an unclamped probe —
tightened from the old ±0.02 OKHSL-nonlinearity tolerance to 1e-6, since the new relation is algebraic).

## Regenerated artifacts (committed)

`docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs`,
`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` — these bake `prime.*` hex values and moved.
`src/ui/categories/*.js` and `figma/binder/figma-semantic-binder/code.js` did NOT move (they store
`hue`/`chroma`/`skew`/`lift`, not baked prime hexes — `primeSwatches` is called live at render/export
time) — checked via `git status --short` after `npm run gen:categories`/`gen:figma-assets`, confirmed
empty for those paths across two consecutive `npm test` runs.

`npm run build` was NOT run: this unit touches no TypeScript, `vite.config.js`, `scripts/`, bundled
fonts, or `package*.json` (`.sdlc/adapter.md` §1's build trigger list), and `node_modules` is not
present in this worktree. `npm run smoke` was not run for the same reason (touches no `src/ui/`,
`src/main.ts`, `scripts/bundle.mjs`, `scripts/gen-figma-ui.mjs`).

## Re-measured figures versus the plan

See `.sdlc/questions/pif-u6.md` for the full table. Summary: PRIME_L_MIN/MAX (12.250030101522825 /
96.88492823209958) match the plan's stated [12.25, 96.88]. The 21-name ladder-window allow-list (C5) IS
re-measured here (review pass 1 S2), matching the plan exactly — see the Criteria table above. The
373±5/2,034±10 corpus-scale figures (C11's ladders-under-30-L\*-span and the negative-control exception
count) remain properties of the full 3,780-palette anchored corpus and were not re-measured at that
scale here; this branch's own 464-case sweep (16 defaults + hue×chroma×hueSpace) found 0 symmetry
exceptions (vs. the frozen pre-#681 fixture's 295) and 164 ladders under 30 L\* span — not directly
comparable to the plan's corpus-scale numbers, reported for scale only.

## Risks / open items

1. **Rebase: done.** Rebased onto `origin/plan/preset-intent-fidelity` @ `6429c49` (team-lead
   instruction, two messages: first naming `362cc48`, superseded by `6429c49` before I acted on the
   first). Clean rebase, no conflicts, three commits reapplied with new shas (see Commits above). Full
   `npm test` re-run post-rebase: green, 47/47, tree clean. `audit-citations.mjs` STALE 0,
   `branding.mjs` clean.
2. `.sdlc/questions/pif-u6.md`: the clipped-default numbers disagreement (Tertiary/Danger/Warning).
   Team lead: "routed to the owner; assume option 1 stands unless I say otherwise" — option 1 (keep U6
   standalone, assert the measured cusp-anchor clip set, with an explicit Tertiary/Danger-unclipped
   trip-wire) is what `test/engine/prime.mjs` ships. No code change needed under this ruling.
3. For U2/U3 (parallel units): U6 does not touch `src/engine/tonal.js` or `scripts/gen-categories.mjs`'s
   lift fitting (out of lane, untouched, checked via `git diff --stat`). U6's `prime.mjs` rewrite is
   independent of U2/U3's ramp-envelope work; no shared functions changed.
4. Stale docs/spec listed above (see "STOP-and-report" — `docs/spec/spec-muted-base-key-spikes.md`,
   `docs/lld/lld-muted-base-key-spikes.md`, `docs/spec/spec-panda-park-ui-exports.md`) need U5 (or a
   dedicated docs pass) once U1–U3 land and the real numbers settle. Review pass 1 S4: NONE of these
   three files is currently in U5's file list
   (`.sdlc/plans/preset-intent-fidelity.md:225-226`) — a plan defect, not a unit defect. Needs the
   Orchestrator to add them to U5's scope; not editable from this unit.
5. **Corrected, review pass 2:** an earlier version of this risk described `src/engine/hct.js`'s
   `maxChromaInGamut`/`peakC` memoization (`hue.toFixed(2)` cache keys) as a risk `prime.mjs` was merely
   exposed to by calling shared code — that framing was wrong. `prime.mjs` was not a bystander:
   `primeSwatches` called `peakC(baseHue)` directly for its own ANCHOR (`lPrime`/`keyChroma`), and that
   call was directly vulnerable — the reviewer's own repro shifted 63/4000 colliding palettes' ANCHOR
   hex by call order, even after S3's rung-level fix. Fixed here, not deferred: `localPeakC` in
   `prime.mjs` is `prime.mjs`'s own private, exact-keyed re-implementation of `peakC`, so no part of
   `primeSwatches` (anchor or rung) reads hct.js's shared cache anymore. What DOES remain a
   pre-existing, out-of-lane risk in shared engine code: `hct.js`'s OWN `maxChromaInGamut`/`peakC`
   exports still truncate cache keys to 2 decimals, so ANY OTHER caller (e.g. a future chroma envelope
   or gamut-mapping pass in U3) that computes a gamut cap for a fractional, densely-swept hue can still
   hit the same collision — `hct.js` itself is unchanged and out of this unit's scope file list. Worth a
   ticket of its own.

## Files changed

- `src/engine/prime.mjs` (rewritten; review pass 1: `localMaxChroma` replaces the shared-cache
  `maxChromaInGamut` call inside `primeSwatches`, S3; review pass 2: `localPeakC` added, replacing the
  shared-cache `peakC(baseHue)` anchor call, both now backed by a PRIVATE, exact-keyed cache instead of
  being fully uncached, for cost)
- `test/engine/prime.mjs` (rewritten; review pass 1: frozen fixture import replaces the live `git show`
  negative control (S1), `ladder-window` iterates the real corpus (S2), gate (c) widened (S3), d5
  citation re-pointed (S7); post-review pass 1: gate (c) sweep taken to full precision (hue step 1) and
  a new `gamut-ceiling` gate added, reusing that sweep, per the owner's numeric-ceiling ruling; review
  pass 2: a real hex-identity determinism assertion added to gate (c), replacing its prior inGamut-only
  claim; review pass 3: gate (c) reverted to its cheaper step-3 sweep, decoupled from `gamut-ceiling`,
  which gained its own smaller dedicated sweep plus `vulnPrimeSwatches` as a real negative control)
- `test/engine/fixtures/prime-pre-681.mjs` (new, review pass 1 S1 — frozen pre-#681 `prime.mjs`, vendored
  from `origin/main` blob `c744fb8`)
- `test/engine/exports.mjs` (two literals + comment, mechanical re-pin)
- `docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs`,
  `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` (regenerated; the latter two embed
  `prime.mjs`'s own source text, so they moved again on the review-pass-2 source edit)
- `.sdlc/questions/pif-u6.md` (new; amended review pass 1 S5)
- `.sdlc/handoffs/pif-u6.md` (this file)
