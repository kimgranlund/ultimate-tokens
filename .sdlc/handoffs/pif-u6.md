---
kind: handoff
unit: U6 (M) prime ladder steps equally in perceived lightness
plan: preset-intent-fidelity (ticket #681, P1)
branch: unit/pif-u6-ladder
written: 2026-09-18
status: gates green, rebased onto origin/plan/preset-intent-fidelity @ 6429c49
---

# U6 handoff: prime ladder steps equally in perceived CIE L*, held CAM16 chroma

## Commits (post-rebase)

- `c286d40` feat(prime): ladder steps equally in perceived CIE L*, held CAM16 chroma (#681 U6)
- `b0e2adb` test(prime): cite the d5 frozen snapshot's capture commit (#681 U6)
- `ac93f2b` docs(sdlc): U6 handoff for #681 prime ladder (#681 U6)

`head: ac93f2b`. `base: bf2aaf6` (`git merge-base HEAD origin/main`, re-measured after rebasing onto
`origin/plan/preset-intent-fidelity` @ `6429c49`, per team-lead instruction). Rebased cleanly, no
conflicts (`git rebase origin/plan/preset-intent-fidelity`). Re-read `.sdlc/plans/preset-intent-fidelity.md`
at the new tip: U6's own unit bullet (line 223-224) is byte-identical to what this unit was built
against — revisions 7 and 8 on the rebased plan branch are both in U3's text, confirmed via
`git diff fb3ad33 6429c49 -- .sdlc/plans/preset-intent-fidelity.md`. No changes needed as a result.

Original (pre-rebase) commits, superseded by the rebase: `766478b`/`9bbfe0a`/`95355a5` (same content,
different shas after the rebase rewrote parent history).

## Scope note (read this first)

U1's `anchor` field is not on this branch. Per the team-lead dispatch (2026-09-18): "U6 is independent
of U1's anchor field... use the existing key colour's L\* on the non-anchored path so your unit stands
alone, and say so in the handoff." Concretely: `src/engine/prime.mjs`'s ladder anchor is
`peakC(baseHue).tone` (the cusp key colour's own CIE L\*, unchanged from pre-#681), not U1's minted
source hex. This has two knock-on effects, both surfaced below and in `.sdlc/questions/pif-u6.md`:

1. The plan's C5 "ladder-window allow-list: 21 (expected 21)" needs U1's source-anchored corpus data,
   not available here. This branch's own `ladder-window` gate honestly reports 0 (the cusp anchor's own
   range is [32, 96] L\*, measured, comfortably inside the [12.25, 96.88] window) and documents why.
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
`ladder-window` gate (honest 0 here, negative-controlled against a synthetic narrow window); new
`symmetry` gate: by-construction `|up-down| <= 1e-9` (0 failures, 464 cases: 16 defaults + hue 0..359
step 5 x chroma {0,50,100}, both hue spaces) and pixel-measured `<= 3 L*` (0 exceptions, max measured
asymmetry 0.518 L\*), with a negative control that dynamically imports `origin/main`'s `prime.mjs`
(via `git show`, imports rewritten to this worktree's unchanged `hct.js`/`okhsl.js`/`tonal.js`) over the
SAME sweep and confirms it FAILS: 295/464 cases exceed 3 L\*, max asymmetry 52.01 L\*.

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
| C1 `npm test` green | `npm test` | exit 0, `✓ all 47 test files passed` (46 pre-rebase; 47 post-rebase — the extra registered file came from upstream #662/#674 work already on the rebased plan branch, not from this unit, which adds no new registered test file); `git status --short` empty after the rebase and after two further consecutive runs (byte-stable); `node scripts/audit-citations.mjs` STALE 0 everywhere; `node test/repo/branding.mjs` clean (446 files) | not re-run here (owned by C1's own negative control in `.sdlc/adapter.md` §1 — corrupt role-table.json, expect 17 FAIL — out of my unit's scope to re-verify; my own red-then-green is below) |
| C5 (ladder half) | `node test/engine/prime.mjs`, gate `ladder-window` | `ladder-window allow-list: 0 (expected 0 on this branch...)` — see Scope note above for why this is 0, not 21 | synthetic [40,60] narrow window inside the same gate: found a large non-zero out-of-window count, proving the filter isn't vacuous |
| C11 symmetry | `node test/engine/prime.mjs`, gate `symmetry` | by-construction: 0/464 fails, `|up-down|` exactly 0 every case. Measured (pixel `lstarFromRgb`): 0/464 exceed 3 L\*, max measured asymmetry 0.518 L\* | origin/main's `prime.mjs` (pre-#681 redistribute rule), same 464-case sweep, dynamically imported via `git show`: 295/464 exceed 3 L\*, max asymmetry 52.01 L\* — FAILS as required |

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
96.88492823209958) match the plan's stated [12.25, 96.88]. The 373±5/2,034±10 corpus figures (C11) and
the 21-name ladder-window allow-list (C5) are properties of the U1 source-anchored corpus and were not
re-measured here (this branch has no source-anchored corpus); this branch's own 464-case sweep (16
defaults + hue×chroma×hueSpace) found 0 symmetry exceptions (vs. origin/main's 295) and 164 ladders
under 30 L\* span — not directly comparable to the plan's corpus-scale numbers, reported for scale only.

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
4. Stale docs/spec listed above need U5 (or a dedicated docs pass) once U1–U3 land and the real numbers
   settle, since several of these files' formulas would need to describe the ANCHORED case too, not
   just Q8/Q9's ladder change in isolation.

## Files changed

- `src/engine/prime.mjs` (rewritten)
- `test/engine/prime.mjs` (rewritten)
- `test/engine/exports.mjs` (two literals + comment, mechanical re-pin)
- `docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs`,
  `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` (regenerated)
- `.sdlc/questions/pif-u6.md` (new)
- `.sdlc/handoffs/pif-u6.md` (this file)
