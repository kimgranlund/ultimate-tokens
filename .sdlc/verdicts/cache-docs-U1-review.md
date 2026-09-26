PASS

# cache-docs U1 review (#750)

Reviewed `unit/cd-U1` at `c0cca710` (builder commits `2bb80509` docs, `c0cca710` handoff), base
`8f5c6dc0` (origin/main after rule-gates landed), against `.sdlc/plans/cache-docs.md` revision 4
and `.sdlc/handoffs/cache-docs-U1.md`, in the worktree only, no source edited.

## Cache claims checked against live code

Read `src/engine/hct.js` directly (not the handoff's quotes):

- `maxChromaInGamut`: `src/engine/hct.js:316` `const key = hue + "|" + tone;`, behind `_mc = boundedCache(CACHE_CAP)` (`hct.js:313`). Matches knowledge-01 §6's rewritten claim exactly.
- `peakC`: `hct.js:341` `const key = String(hue);`, behind `_pk = boundedCache(CACHE_CAP)` (`hct.js:339`). Matches §7.
- `oklchToCam16Hue`: `hct.js:372` `const key = target + ":" + cf;`, behind `_oh = boundedCache(CACHE_CAP)` (`hct.js:368`). Matches §8's pseudo-code line.
- Type/geometry engines: `grep -n 'toFixed|new Map|boundedCache' src/engine/type.mjs src/engine/geometry.mjs` finds only one `toFixed` in each file, both the `dimUnit`/unit-formatter (`type.mjs:519`, `geometry.mjs:325`), no `Map`, no `boundedCache`. Confirms "the type engine keeps no cache" (§9, and the geometry best-practices line).
- `tonal.js`: `okhslLAt` (`tonal.js:926`) is commented "pure, with no cache (#738)" and there is no memo Map in front of it. Confirms §9's added sentence "The memo `tonal.js` used to keep in front of `okhslLAt` is gone (#738)."

All four rewritten claims are true of the tree as it stands, citing the right issue numbers (#686 for the three `hct.js` re-keys, #738 for the `tonal.js` memo removal).

## The reworded peakC line (U1-1's needle vs. the plan's design sketch)

The plan's design text (line 52) suggested wording built around "a 0.01° bucket," but U1-1's own needle requires `0.01°`/`within 0.01` to be absent (row 99, expected last value `0`) because §9's old "exact within 0.01" claim is exactly what's being retracted. The builder's actual line reads:

> "Memoized by `String(hue)`, the exact float: a truncated key let the first caller into a shared rounded bucket decide every later caller's peak, the order dependence #686 fixed."

This still says what the plan intends: a truncated (`toFixed(2)`-style) key caused hue values that round to the same bucket to share one cache entry, so whichever caller arrived first decided the peak for every later caller at a nearby hue, an order-dependence bug, and #686 is cited as the fix. "Shared rounded bucket" is an accurate paraphrase of what a `toFixed(2)` key produces (multiple distinct floats collapsing to one string key) without using the banned literal. No loss of meaning. Correctly flagged in the handoff's "Left out" section as a design-vs-needle conflict resolved in the needle's favor, which is the right call, the needle is what's graded (R10, criteria are function names/ids/strings/counts, never line numbers, but here it's the plan's own stated criterion that must hold, not the design prose).

## Criteria rerun independently (fresh reads, not trusting the handoff's numbers)

- P1: `npm test` in the worktree, own run, `✓ all 53 test files passed`, exit 0, `git status --short | wc -l` = `0` after. Negative control not rerun (adapter's own standing control, not disputed).
- P2: `git diff --name-only "$B" -- src scripts test figma mcp plugin package.json | wc -l` = `0`.
- P3: `node test/repo/branding.mjs` clean (787 files), `node test/repo/em-dash.mjs` self-test PASS + clean (795 files), both exit 0. Raw em-dash count on added lines (`git diff "$B" | grep '^+' | perl ... /\x{2014}/`) = `0`.
- P4: scope-wall filter over `git diff --name-only "$B"` = `0`; the reviews/color-math refusal filter = `0`. The diff's five paths (`knowledge-01-color-engine.md`, `best-practices.md`, this unit's own plan/handoff/questions files under `.sdlc/`) are all inside the admitted set; no other file touched.
- U1-1: `grep -c toFixed|hue+"|"+tone|String(hue)|target+":"+cf|#686|#738|0.01°/within 0.01` on knowledge-01 → `0,2,2,2,4,1,0`. Matches the handoff and satisfies the row's expected shape (`0,>=1,>=1,>=1,>=1,>=1,0`).
- U1-2: same needles on the geometry file → `0,1,1,0`. Matches, satisfies `0,>=1,>=1,0`.
- U1-4: `node test/repo/citations.mjs` → `✓ citations: parser self-test + STALE 0 across 10 discovered docs`, exit 0. Numstat: `1 1 best-practices.md`, `5 5 knowledge-01-color-engine.md`, both matching row U1-4's expected shape exactly.

Every rerun matches what the handoff reported; no discrepancy found.

## Scope, prose rules, branding

- No em dash (U+2014) in any added line (checked above).
- No bold inline labels added in the doc prose itself (the handoff table uses `**Memoized**` only because that bold already existed in the pre-image; the rewritten portion after it is plain prose).
- No retired-brand or pre-rename-identifier text introduced; `branding.mjs` clean at 787 files including `.sdlc/`.
- Geometry line's bullet first sentence is untouched; only the parenthetical changed, one physical line, numstat `1 1`, no ticket id added (correct per prompt-audit's U6-4 rule for skill narratives).
- No file outside the plan's two target files plus this unit's own `.sdlc/` records was touched.

## Verdict

All four cache claims plus the geometry cross-reference are now true against the live `hct.js`/`type.mjs`/`geometry.mjs`/`tonal.js` code, correctly cited (#686, #738), the reworded `peakC` line preserves the plan's intended explanation while satisfying the needle it originally conflicted with, and every plan-level and unit criterion (P1-P4, U1-1 to U1-4) reruns green with matching values. PASS.

verdict: 🟢
