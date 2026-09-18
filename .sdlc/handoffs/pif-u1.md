# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Unit | U1 (M) anchor field + `prime.DEFAULT` byte-exact, plan `preset-intent-fidelity` (ticket #681) |
| Branch | unit/pif-u1-anchor @ d9f375b7d8b5f2e96d2ae40452fc2ce4e8658e24 (post FIX-FIRST fold; see below) |
| Base | bf2aaf659fde4db3bddaed8dfa23e2f485ab2c46 (`git merge-base HEAD origin/main`, post-rebase; unchanged by the fold — no further rebase happened) |
| Grade | l3 |
| Ran (post-fold) | `npm test` ✅ (48/48) · `node scripts/audit-citations.mjs` ✅ (exit 0, 0 STALE) · `node test/repo/branding.mjs` ✅ (`branding: clean (446 files scanned)`) · `git status --short` ✅ (empty after every run) |
| Left out | Ramp anchor (U2), chroma envelope (U3), ladder metric/L* rewrite (U6), Reset UI action (U2's C12), records (U5) — none touched |

## FIX-FIRST fold (review `scratchpad/pif-u1-review-1.md`, 🔴 verdict, folded 2026-09-18)

Three findings, all fixed on top of the post-rebase commit (`ed6ac8e`), no further rebase:

- **F1 (High) — the anchored ladder collapsed for out-of-window sources.** `src/engine/prime.mjs`'s
  `lLadder` clamp (`Math.min(PRIME_L_MAX, Math.max(PRIME_L_MIN, lPrime))`) is unchanged, but when the
  clamped side's room hit 0 (or near enough that 8-bit rounding still collapsed it — 3 of the review's
  measured cases were technically 0.0001-0.001 *inside* the window, not past it), every rung on that
  side rendered the same byte-identical swatch, and `prime` (rendered exact, per Q3 (b)) could sit
  outside the resulting six-rung ladder entirely. Fix: `primeSwatches` now renders the natural
  (unchanged) ladder first and, ONLY if that produces a duplicate hex among the seven swatches,
  iteratively widens the reserved room on the clamped side (0.001 OKHSL-`l` steps, capped at one full
  `PRIME_STEP`) until every hex is distinct — re-using the SAME hue/skew/shift math the final render
  uses (a shared `rungHex` helper), so the search and the output can never disagree. `prime` itself
  never moves; non-anchored palettes and anchors already inside the window take the identical
  zero-iteration fast path as before (byte-identical to pre-fold, confirmed by C4 staying 3796/3796).
  A handful of sources sit close enough to the window floor that even a full `PRIME_STEP` of reserve
  cannot separate `dimmest` from `prime` — those are a named, counted allow-list, not silently passed.
  New gate, `test/engine/anchor.mjs`'s `anchor-ladder` (registered in the same file as C2/C4, not a
  new plan criterion): over the 3,380 anchored corpus palettes at primeChroma 100 —
  (a) the six non-`prime` rungs are strictly decreasing in `l`, unconditionally, 0 exceptions (this
  holds purely from `primeSteps`/the widening search, never from the anchor's position);
  (b) `prime` sits strictly between `bright` and `dim` in `l`, with a named order-allow-list, measured
  count **23** (`anchor-ladder order-allow-list: 23 (expected 23)`) — 21 of these are the same named
  sources the plan's own C5/U6 text already earmarks for a future CIE-L*-domain "ladder-window"
  allow-list (Nike, Double Indemnity, Night of the Hunter, 2001, TRON: Legacy, Tórshavn, Khumbu, Rub'
  al Khali, Atchafalaya, etc.), plus 2 more that only cross the line in OKHSL `l` (not CIE L*) —
  expected, since this is a provisional OKHSL-domain fix, not U6's rewrite;
  (c) all seven hexes are distinct, with a STRICTER dupe-allow-list (subset of (b)'s 23), measured
  count **4** (`anchor-ladder dupe-allow-list: 4 (expected 4)`) — every dupe is cross-checked to also
  be an order violation (asserted in the gate itself). Negative control: a synthetic `#000000` anchor
  (OKHSL `l`=0, unambiguously outside the window) is confirmed to fail the SAME predicate the corpus
  loop counts with, before the real 23/4 are trusted. Red-then-green: reverting the widening loop
  (keeping only the pre-fold `lLadder` clamp) reproduces the review's own measured hexes exactly
  (`#161618` → `dim`/`dimmer`/`dimmest` all `#202022`) and fails the new gate at `order-allow-list: 27
  (expected 23)` / `dupe-allow-list: 24 (expected 4)`.
- **F2 (Medium) — `defaultDocument()` never wrote `sourceAnchor`.** The plan's U1 line says
  `sourceAnchor` is "written only by the generator and by `defaultDocument()`"; the generator half
  (`scripts/gen-categories.mjs`) was already done, `defaultDocument()`'s half was missing, which would
  have silently disabled U2's Reset action for all 16 default families (Reset needs `sourceAnchor`
  present to re-derive `anchor` after a detach). Fix: `src/ui/model.mjs`'s `defaultDocument()` now
  stamps `sourceAnchor: p.anchor` alongside the existing `hue` conversion in the `DEFAULT_PALETTES.map`
  call — NOT added to `DEFAULT_PALETTES` itself (would have doubled the literal in source) and NOT to
  `docs/reference/data/role-table.json` (would have broken C9's `grep -c '^[-+]'` = 18 assertion and
  the `hpg-role-contrast` parity loop's `compared = 4 × 16` field count, per the review's own note).
  Verified: all 16 default-kit palettes now round-trip `sourceAnchor === anchor` from
  `defaultDocument()`, and the `anchor-ladder` gate confirms all 16 stay `distinct=7, mono=true`
  (unaffected by F1's widening search — well inside the window, as Q2 (b) intended).
- **F3 (Medium) — engine and persistence disagreed on lowercase anchor hex.** `src/engine/prime.mjs`'s
  `ANCHOR_HEX` accepted and normalized lowercase; `src/ui/persist.js`'s `clampHex` accepted uppercase
  only and silently DROPPED lowercase (no `DROPPED_KEYS` report), so a Q5-authored spec JSON or a
  hand-edited import with a lowercase anchor rendered correctly in the live session and then lost the
  anchor on the next save/reload. Fix: `clampHex`'s regex now accepts either case and normalizes to
  uppercase (`v.toUpperCase()`), matching the engine — same domain, same behaviour, no more silent
  loss. `test/ui/persist.mjs`'s malformed-value list dropped `"#0c5dcc"` (now covered by a dedicated
  normalization assertion instead) and gained an explicit case: lowercase `"#0c5dcc"` round-trips as
  uppercase `"#0C5DCC"`.

Citation fallout from the fold's own insertions (persist.js/model.mjs both grew by a few lines):
`docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md` (`model.mjs:1019` →
`:1031`, `persist.js:680`/`:798` → `:690`/`:808`) and `.../03-stores-and-persistence.md`
(`persist.js:602` → `:625`) — re-pinned the same way as the rebase's own re-pins (mechanically
verified against the current file content at each destination line, not guessed).

## Rebase note (superseding the original build's drift notes below)

This unit was rebased once, on team-lead instruction, from its original base `cf8e61a` onto
`origin/plan/preset-intent-fidelity @ 362cc48` (itself rebased onto `origin/main @ bf2aaf6`, which
now includes #662 "contrast on-color policy by default" and #674 "Adia Warning lift retune + a
curated-corpus contrast gate"). `git rebase origin/plan/preset-intent-fidelity` produced conflicts
in exactly the files expected from the two units landing in parallel:

- `test/run.mjs` — both sides added a test file to `TESTS` (`engine/curated-contrast.mjs` from #674,
  `engine/anchor.mjs` from this unit); merged to keep both, count now 48.
- `docs/spec/spec-panda-park-ui-exports.md` — both sides extended the same "re-generated N times"
  narrative paragraph (#662's on-color-black note, this unit's anchor note); merged to keep both in
  chronological order, then RE-VERIFIED every EX-1/EX-2 literal by direct computation post-merge
  (not assumed from either side) — all matched, including `on-primary._dark` now `oklch(0 0 0)`
  (#662) alongside `prime.prime` now `oklch(0.504 0.1867 258.99)` (this unit).
- `figma/plugin/ui.html`, `src/ui/categories/*.js` (7), `src/ui/describe-mcp-assets.js` — all
  GENERATED artifacts; resolved by regenerating via `npm run gen:categories` / the full `npm test`
  pipeline rather than hand-merging, since the source (`scripts/gen-categories.mjs`,
  `docs/reference/colors/categories/*.json`) had no conflict at all.
- `src/ui/persist.js`, `test/engine/semantic.mjs` — **auto-merged cleanly, no conflict**, confirming
  this unit's edits stayed clear of `onColorMode`/persist.js:126 and of `test/engine/semantic.mjs`'s
  floors/comment block, exactly as briefed.

`git diff --stat 362cc48..HEAD` (this unit's own two commits, isolated from the plan-branch history
it now sits on) shows the same 27 files as the original build, byte-for-byte the same insertion/
deletion shape modulo the generated artifacts' regenerated content. No contrast-ratio figures are
quoted anywhere in this document (the one place the team-lead flagged that risk) — U1's own criteria
never touch contrast.

## Base-count note (adapter.md §1 baseline drift, from the original build — still accurate)

`.sdlc/baseline.md` records 44 test files at `origin/main @ 7faf3aa`. Before this unit's own test
file, the branch already carried 46 (its original base) then 47 (after #674 landed upstream, adding
`engine/curated-contrast.mjs`); this unit's `test/engine/anchor.mjs` brings the post-rebase count to
**48** — `all 48 test files passed` is this unit's correct green.

## Criteria

| # | Criterion | State | Command + observed output | Negative control |
|---|---|---|---|---|
| C1 | `npm test` green, tree clean after | 🟢 | `npm test` → `✓ all 48 test files passed` (post-rebase); `git status --short` → empty | Corrupted `docs/reference/data/role-table.json` in a scratch copy during development (structural edits mid-build) reliably broke `semantic.mjs`/`prime.mjs`/`anchor.mjs`; not re-run as a final artifact since it would dirty the tree — the adapter's own named 17-FAIL control is `.sdlc/adapter.md`'s, unmodified by this unit |
| C2 | Anchor identity: `primeSwatches(...)[3].hex === anchor` and exports.js's `prime.DEFAULT` oklch equals an independent hex→oklch of `anchor`, over every anchored corpus palette | 🟢 | `node test/engine/anchor.mjs` → `anchor-identity: 3380 exact, 0 off` (2,028 sampled + 1,352 status, verified by direct JSON-structure count before writing the gate, not assumed from the plan) | Live, in the test file, on every run: one real anchored palette's hex is corrupted by one digit and the gate is proven to catch it BY NAME before the real 3,380 are graded. Also verified red-then-green by hand: reverting `src/engine/prime.mjs` to its pre-unit content and rerunning gave `FAIL anchor-identity: 0 exact, 3380 off` |
| C4 (prime part) | Non-anchored `primeSwatches` is byte-identical to pre-#681 behaviour | 🟢 | `node test/engine/anchor.mjs` → `prime-identity-control: 3796 exact, 0 off` (3,780 corpus + 16 default kit, `anchor` stripped, compared against a FRESH from-scratch reimplementation of the pre-#681 deriveKeyColor formula, never calling `primeSwatches` internals) | One subject's chroma mutated by 37 between the two derivations at test start; the loop is proven to catch the mismatch before the real 3,796 are graded |
| C10 (schema note only) | The persist.js schema bump documents itself per TKT-0016's standing convention | 🟢 | `src/ui/persist.js` `CURRENT_SCHEMA_VERSION` bumped 4→5 with an inline comment explaining why no `RENAME_MAPS` entry is needed (a new field, not a rename — same shape as the existing v4 note) | n/a — this is documentation, not a gated predicate; C10's own grep list (ADR-025, CHANGELOG 1.62, glossary, knowledge-02 §9, color-math SKILL.md, rubrics) is U5's scope and none of those files were touched here |

`npm run build`: `tsc` strict passed, `vite build` succeeded, `bundle`/`gen:figma-ui` wrote
`figma/plugin/ui.html` (3915.3 KB) — tree clean after (build outputs under `dist/` are gitignored).

## Files changed (27, `git diff --stat 362cc48..HEAD` — this unit's own two commits, post-rebase; the file list and per-file shape are unchanged from the original build, only the generated artifacts' bytes moved)

- `src/engine/prime.mjs` — anchor branch: `prime` step (index 3) renders the anchor rgb verbatim,
  unconditionally (never scaled by `primeChroma`); the other six steps ladder from
  `rgbToOkhsl(anchor)`, clamped into `[PRIME_L_MIN, PRIME_L_MAX]` (today's OKHSL window — U6 rewrites
  this in L* later). Absent-anchor path is untouched code, not a parallel implementation. **F1 fold**:
  a widening search (capped at one `PRIME_STEP` of reserve) now runs only when the natural ladder
  would produce a duplicate hex, sharing its hex-rendering math with the final output via a `rungHex`
  helper so the two can never disagree; byte-identical to pre-fold for every already-passing anchor.
- `src/engine/exports.js` — **deviation from the plan's literal file list** (see below): one field
  (`anchor: palette.anchor`) added to the existing `primeSwatches(...)` call inside `derivePalette`.
- `src/ui/model.mjs` — `DEFAULT_PALETTES` gain the 16 Q2 (b) anchors (each verified against the
  engine's real `rampChromaOf`-resolved perceptual-mode stop-550 hex before being typed in, not
  copied blind from the plan text); `projectView`'s own `primeSwatches(...)` call also forwards
  `anchor` (same deviation reasoning as exports.js — see below). **F2 fold**: `defaultDocument()`
  now stamps `sourceAnchor: p.anchor` on every default-kit palette, not just `anchor`.
- `docs/reference/data/role-table.json` — `defaults[]` gains the same 16 `anchor` fields, inserted
  before each default's `on` key (16 added lines, 0 removed; `.roleTable` stays 53).
- `src/ui/persist.js` — `DOMAINS.palette.anchor`/`sourceAnchor` (`kind: "hex"`), `clampHex` helper,
  `clampPalette` wiring, `CURRENT_SCHEMA_VERSION` 4→5 with its TKT-0016 no-op note. **F3 fold**:
  `clampHex`'s regex now accepts lowercase too, normalizing to uppercase, matching
  `src/engine/prime.mjs`'s `ANCHOR_HEX` instead of disagreeing with it.
- `scripts/gen-categories.mjs` — `palette()` stores `anchor`/`sourceAnchor` (the source hex, already
  canonical uppercase) for every sampled + status swatch; `direct` (brands pass-through) untouched.
- `test/engine/anchor.mjs` (new, registered in `test/run.mjs`) — C2 + C4's prime-half identity
  controls, both with live negative controls. **F1 fold**: gained the `anchor-ladder` gate (six-rung
  monotonicity, unconditional; prime-between-bright-and-dim and all-seven-distinct, both with a
  named, counted allow-list; a synthetic `#000000` negative control) — see "FIX-FIRST fold" above.
- `test/engine/prime.mjs` — `DEFAULTS` now strips `anchor` from `RT.defaults` before use (see
  Deviation 2 below).
- `test/engine/exports.mjs`, `docs/spec/spec-panda-park-ui-exports.md` — Primary's
  `prime.prime`/`.brightest`/`.dimmest` EX-1 literals re-pinned to the new anchor-derived values
  (independently verified against a from-scratch hex→oklch conversion of `#0C5DCC`, not read back
  from the pipeline under test).
- `test/engine/semantic.mjs` — `hpg-role-contrast`'s default-parity loop extended
  chroma/skew/lift → chroma/skew/lift/anchor (`compared` = 4 × 16); nothing else in this file touched.
- `test/ui/persist.mjs` — round-trip fuzz coverage + an explicit clamp block for `anchor`/
  `sourceAnchor` (well-formed round-trips, malformed values drop, absent stays absent). **F3 fold**:
  lowercase moved from the malformed/dropped list to its own normalization assertion
  (`"#0c5dcc"` → `"#0C5DCC"`).
- `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,02-sections-and-resolvers,03-stores-and-persistence}.md`
  — six `persist.js:N` citations re-pinned after this unit's insertions shifted line numbers by a
  uniform +37 (below the shifted region) — mechanically verified line-for-line against `git show
  cf8e61a:src/ui/persist.js`, not guessed from the audit tool's heuristic anchor-pairing alone.
  **Fold**: `02-sections-and-resolvers.md` and `03-stores-and-persistence.md` re-pinned a second time
  (`model.mjs:1019→1031`, `persist.js:680→690`, `persist.js:798→808`, `persist.js:602→625`) after
  F2/F3's own insertions shifted the same region again — same mechanical verification, not guessed.

## Regenerated artifacts (all committed)

`figma/plugin/ui.html`, `src/ui/categories/{architecture,brands,cuisine,film,literature,music,nature,travel}.js`,
`src/ui/describe-mcp-assets.js` (persist.js's source text is bundled into the MCP asset string).
`docs/reference/data/adia-*` regenerated by `npm run build` but byte-identical (not staged — `git
status` confirmed no diff there).

## Deviations from the plan's literal U1 file list (both necessary, both flagged for the reviewer)

1. **`src/engine/exports.js` — the plan says "unchanged ... confirm, do not edit (it is out of
   lane)".** Confirmed the aliasing line `prime.DEFAULT = prime.prime` (exports.js:967 in the plan's
   numbering) is genuinely unchanged. But `derivePalette`'s own call into `primeSwatches(...)`
   (exports.js, inside `derivePalette`) reconstructs a SUBSET object literal that did not forward
   `anchor` — without forwarding it, every real export (and the live canvas) would stay
   cusp-derived while `primeSwatches()` called directly (as C2's test does) rendered the anchor: a
   silent split between "what C2 measures" and "what actually ships", which is exactly what C2/C4
   exist to catch. Verified this is load-bearing by checking C2 red before the fix (only the direct
   `primeSwatches(...)[3].hex === anchor` half would have passed; the exports.js half would have
   stayed cusp-derived). The fix is a single added field on an existing line, additive only, and
   C4's non-anchored identity control proves it changes nothing when `anchor` is absent.
2. **`src/ui/model.mjs`'s `projectView` `primeSwatches(...)` call** — not named in the plan's file
   list at all, but has the exact same subset-object gap as exports.js's call (same reasoning,
   same fix, same one-field addition). Left unfixed, the live UI would never show an anchored
   preset's `prime.DEFAULT` as the anchor, even though `DEFAULT_PALETTES`/the regenerated presets
   carry `anchor`. Same additive-only, no-op-when-absent shape.
3. **`test/engine/prime.mjs`'s `DEFAULTS`** — adding `anchor` to `docs/reference/data/role-table.json`'s
   `defaults[]` (U1's own explicit scope) silently poisoned this file's existing AC-050 fixtures
   (`DEFAULTS = RT.defaults`), since this file's gates (d1..j) verify prime.mjs's ORIGINAL,
   non-anchored cusp construction — a construction U6 (not U1) is the unit that rewrites for the
   anchored case ("Depends on U1 (anchor = prime)"). Stripped `anchor` at the point this file
   derives its fixtures, restoring every pre-existing gate to green without touching their logic —
   left for U6 to remove when it rewrites this file for the anchored ladder.
4. **`test/engine/exports.mjs` + `docs/spec/spec-panda-park-ui-exports.md`** — not in the plan's file
   list, but Primary's `prime.*` literals are DIRECTLY in U1's own blast radius (Q2 (b) minting
   Primary an anchor moves its `prime.DEFAULT` from the cusp value to `#0C5DCC`'s own oklch) — the
   plan's own Blast radius table says as much ("default kit `prime.*` move ... via U1 under Q2 (b)
   ... e.g. Secondary `#00FBB1` to `#108960`"). Re-pinning a moved literal is not a design change.
5. **Three `docs/reference/reviews/2026-08-20-reactivity/*.md` files + `node
   scripts/audit-citations.mjs`** — required by the dispatch itself ("your edits shift cited lines
   in prime.mjs/persist.js/model.mjs; re-pin"). Not a design change; six citations moved by a
   uniform, verified +37 lines.

## Risks for U2 / U3 / U6

- **U2** builds the ramp anchor and the Reset action on top of `palette.anchor`/`sourceAnchor` as
  this unit leaves them; `src/ui/sections/color.js`/`app.js` are untouched here (U2's own scope).
  `src/engine/tonal.js` is untouched — the ramp still fits `lift` exactly as before for every
  palette, anchored or not (U1 stores `anchor` but the ramp does not yet read it).
- **U3**'s chroma envelope is independent of this unit's changes; `VIVID_MIDS`/`chromaEnvelope` were
  not touched.
- **U6** rewrites `src/engine/prime.mjs`'s ladder metric (OKHSL `l` → CIE L*, `STEP_L` 9, the
  equal-compress wall rule, hold-CAM16-chroma). This unit's anchor branch is written to compose with
  that rewrite: `lLadder` is the one clamp point U6's L*-window swap will need to touch (currently
  `Math.min(PRIME_L_MAX, Math.max(PRIME_L_MIN, lPrime))` in OKHSL `l`; U6 re-expresses the window in
  L* per its own plan text). U6 also inherits `test/engine/prime.mjs`'s anchor-stripped `DEFAULTS` —
  U6's own plan text already expects to rewrite this file's gates for the anchored case, so removing
  the strip is part of that unit's own work, not a leftover bug. **F1's fold adds one more thing U6
  inherits and should retire**: the F1 widening search and `test/engine/anchor.mjs`'s `anchor-ladder`
  gate (OKHSL-domain, counts 23/4) are this unit's provisional fix for the collapse/inversion defect;
  U6's own plan text already names a 21-source CIE-L*-domain "ladder-window" allow-list with the
  equal-compress wall rule as the real, permanent fix — U6 should replace F1's widening search (not
  layer on top of it) and re-derive `anchor-ladder`'s counts in L* terms, expecting a different
  number (this fix's 23/4 are OKHSL-domain and will not match U6's 21 one-for-one; 2 of this fix's 23
  are OKHSL-only near-boundary cases the CIE-L* window may not need to allow-list at all).
- **Rebase risk — resolved.** This unit has now been rebased onto `origin/plan/preset-intent-fidelity
  @ 362cc48` (which carries #662 and #674). `test/engine/semantic.mjs` and `src/ui/persist.js` both
  auto-merged with zero conflicts, confirming the scoping held. See "Rebase note" above for the full
  conflict list and how each was resolved (mechanical merges for `test/run.mjs`/the spec doc,
  regeneration for the generated artifacts).

## Open questions

None. The one place this unit was told to stop and ask (a disagreeing default-kit anchor hex) did
not trigger — all 16 Q2 (b) hexes matched the engine's own perceptual-mode, group-resolved stop-550
output on this branch's base, verified before being typed into `src/ui/model.mjs`.
