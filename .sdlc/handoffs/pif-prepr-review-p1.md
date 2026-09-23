# Pre-land review, #681 preset-intent-fidelity

Head `plan/preset-intent-fidelity` @ `b4be472c`, diffed against `git merge-base origin/main b4be472c`.
Read-only worktree; mutations in scratch clones under `/tmp/pif-prepr-review-ctl/`. One test process
at a time, single files only, no `npm test`. Host load during this review was 55 to 135, so no timing
figure below is a reading.

## Verdict

| Severity | Count |
|---|---|
| 🔴 blocking | 2 |
| 🟡 should-fix before land | 5 |
| 🟢 carry | 5 |

Recommendation: do not land until B1 and B2 are either fixed or ruled by the owner in writing. Both
are criteria the plan states as "0 exceptions" or as a passing command, and both read red on the
shipped path today while every gate is green. Neither is a code defect I can prove harms a user;
both are the plan claiming something its own measurement contradicts, with no gate and no ticket.

## 🔴 Blocking

### B1. C11's corpus half was deferred at U6 and never discharged; it fails when measured

- Where: `test/engine/prime.mjs`, gate `symmetry` and gate `k`, both iterate `CASES`. `CASES` is the
  16 defaults plus the synthetic hue/chroma sweep, 464 cases. The 3,380 anchored corpus palettes are
  not in it. No file prints the "span < 30 L*" corpus report C11 names.
- Record: `.sdlc/verdicts/pif-u6.md` section 3 says plan-level C11 "cannot be signed off at U6's head
  and must be re-run after the U1 rebase". Nothing after it re-runs it. `.sdlc/verdicts/pif-u4.md`
  has no C11 row.
- C11 text: over "the full sweep plus the 16 defaults plus the 3,380 anchored palettes", pixel
  asymmetry within 3 L*, "0 exceptions"; span-under-30 count "373 ± 5".
- What I ran: `node /tmp/pif-prepr-review-ctl/sym.mjs` and `span.mjs` (each loads the eight
  `src/ui/categories/*.js`, calls `primeSwatches(p, { hueSpace, primeChroma: 100 })` for every palette
  with a string `anchor`, measures `lstarFromRgb` on the emitted `rgb`).
- Result: 22 of 3,380 exceed 3 L* (max 54.24, film "Suspiria" tertiary-muted `#201F25`; then music
  "Black metal" secondary `#1E2024` 54.10; film "The Night of the Hunter" tertiary `#1E211E` 53.99);
  26 are not equal by construction on the emitted `l` fields (the `ORDER_ALLOW` population in
  `test/engine/anchor.mjs`); span under 30 L* is 364, outside 368 to 378. Default kit: 0 under 30, as
  ruled.
- The failing input for the gate: none exists. A change that breaks symmetry only for anchored
  palettes (any edit to the `lLadder` clamp or the widening search in `src/engine/prime.mjs`) leaves
  `symmetry` green, because no anchored corpus palette is in `CASES`. The exceptions live exactly in
  the population the gate leaves out.
- Why blocking: the PR would close #681 stating ruling 3 (equal on both sides of prime) holds with 0
  exceptions. It holds with 22. The 22 are very likely the honest consequence of Q3 (b) on near-black
  sources, and an allow-list by name (as `ORDER_ALLOW` already does for order) would settle it. That
  is an owner ruling plus a gate, not something to infer at squash time.

### B2. C6's own command exits 1 at head, the miss has no owner, and the record cites a ticket that does not cover it

- What I ran: `node scripts/report-preset-fidelity.mjs --envelope` in the review worktree. Exit 1.
  Last lines: `READING (a) (emitted chroma): FAIL`, `READING (b) (envelope multiplier): FAIL`.
  Reading (a): perceptual 300 median 94.0% (bar 75) p90 146.2% (bar 90); perceptual 900 median 31.7
  p90 66.5; peak 300 84.0 / 137.7; even 300 p90 113.7; "above 100% of stop 500": peak 2,592, even 670,
  perceptual rule violations 446. 14 of 24 median/p90 readings fail, matching the record.
- The record is honest about it: ADR-026 Consequences and CHANGELOG 1.64 both say 14 of 24 miss. That
  part is not the finding.
- The finding, first half: ADR-026 closes the sentence with "an open owner item (#701)". `gh issue
  view 701` is the even-mode `chromaFloor` dip redesign; its Acceptance says "`--envelope` even cells
  all pass". It does not mention perceptual or peak, where 11 of the 14 misses are.
  `.sdlc/verdicts/pif-u4.md` row 22 says the same thing in its own words: "Q7 and #701 cover only the
  above 100% clause". So the citation is current and describes the wrong thing. No open issue owns
  the perceptual and peak median/p90 miss (searched open issues; only #701 matches).
- The finding, second half: nothing in `npm test` or CI measures ruling 2 ("more muted") in its ruled
  direction. `TARGET = { 100: {median 25, p90 35}, 300: {75, 90}, ... }` exists only in
  `scripts/report-preset-fidelity.mjs`; `grep -rn report-preset-fidelity package.json .github test`
  finds only a comment in `test/engine/tonal.mjs`. The report is already red, so it cannot go redder:
  it has no failing input left. Mutation M1 below shows what the suite does see.
- Mutation M1 (scratch clone `m1`): `scripts/gen-categories.mjs` `VIVID_MIDS.damp` 70 to 30, then
  `npm run gen:categories`, then single files in sequence.
  `node test/engine/categories.mjs` exit 0. `node test/engine/tonal.mjs` exit 1, one line:
  `FAIL chroma-envelope (C6 ii) perceptual: 5 duplicate-hex pair(s) beyond the cited list`. That is an
  incidental bite (a duplicate-hex side effect at hue 240), not a muting measurement. Results for
  `anchor.mjs` and `curated-contrast.mjs` on the same mutant are appended at the end of this file.
- Why blocking: the PR claims #681, whose ruling 2 is measured by C6, and C6 fails on the rendered
  path by the plan's own rendered-path rule ("a criterion whose measurement is taken on a path the
  product does not ship is not satisfied"). Landing is a legitimate owner choice, but it needs (a) a
  ticket that actually owns perceptual and peak, cited from ADR-026 and CHANGELOG in place of #701,
  and (b) the owner's explicit acceptance that #681 closes with C6 open. Neither is in the tree.

## 🟡 Should-fix before land

### S1. `projectView(...).palettes[i].key` and `brandKit().palettes[].key` still emit the cusp colour for anchored palettes

- Where: `src/ui/model.mjs` `deriveKeyColor` (called from `projectView` and `paletteKeyColors`);
  surfaced by `brandKit` as `kit.palettes[].key`, by `mcp/brand-kit-core.mjs` (the palettes summary
  `run`), and painted by `src/ui/sections/color.js` on the palette tile swatch, the hue-wheel dots and
  the relative-chain strip. `addKeyColor` stores `vp.keyOklch`, the same value.
- What I ran: `node /tmp/pif-prepr-review-ctl/key.mjs` (`projectView(hydrate(preset))` over the
  corpus, compare `palettes[i].key` to `palette.anchor`).
- Result: 0 of 3,380 equal; 3,062 over 5 L*; 1,570 over 20 L*; max 82.9 L*, travel "Hidaka coast"
  tertiary-muted: `key #F7F4E5`, `anchor #252215`, `prime[3] #252215`.
- 3,062 and 82.9 are the plan's own baseline (1) figures for `prime.DEFAULT` before the fix. The
  defect moved off the ruled token and stayed on the swatch the UI and the MCP kit call the palette's
  identity. Ruling 1 names `prime.DEFAULT` only, so this is not a criterion miss. It is a user-visible
  contradiction (a near-white tile for a near-black palette) that the plan made louder, and an MCP
  consumer reading `key` gets the wrong colour. No gate compares `key` to `anchor`, so there is no
  failing input today. Fix or ticket before land.

### S2. `seedFromKey` edits hue and chroma on an anchored palette without detaching

- Where: `src/ui/sections/color.js` `seedFromKey(i, role)`:
  `this.commit((d) => { d.palettes[i].hue = s.hue; d.palettes[i].chroma = s.chroma; })`. The Hue and
  Chroma sliders call `detachSnapshot` and `delete anchor`; this path does neither.
- C12: "editing `hue` or `chroma` removes `anchor`".
- Failing input: open an anchored preset, drag Hue (detaches), add a supportive key colour (captures
  the new colour), Reset (anchor back), click the supportive slot's seed button. Hue and chroma
  change, `anchor` stays.
- What I ran: `node /tmp/pif-prepr-review-ctl/seed.mjs`, `paletteStops` on default Primary with its
  anchor, hue 267 vs 27: ramp identical in perceptual, peak and even. So the seed's hue write is a
  dead control on that palette, which is the F4 "no control goes dead" class. Chroma 95 vs 20 does
  change the ramp in all three modes.
- No gate covers it: `test/ui/headless-boot.mjs` calls `app.seedFromKey(0, "dominant")` only on a
  non-anchored fixture, before the `rst` group.

### S3. `.sdlc/checks/ceiling-counts-check.mjs`: two of its eleven assertions cannot fail, one of them the assertion its header says the check exists for

- `PARTITION graded + explicit + unsupportable == total`: `explicit` is defined as
  `rows.filter((r) => !graded.includes(r) && !unsupportable.includes(r))`, and `graded` already
  excludes `statesNoStart` rows, so the three sets are a partition of `rows` by construction. No edit
  to `.sdlc/baseline.md` can make the sum differ from `rows.length`.
- `above + inside == total`: `above` is `wall > 550`, `inside` is `wall <= 550`. Same.
- The header names defect (3), "a partition whose parts summed to one less than the whole", as the
  reason the script exists. The assertion that actually catches that defect is the next one, `prose
  partition parts sum to 'other N'`, which compares prose to rows and can fail. The two tautologies
  print `ok` beside it and read as coverage.
- What I ran: `node .sdlc/checks/ceiling-counts-check.mjs`, exit 0, 11 ok lines, `partition: 19 = 2
  graded + 14 explicit + 3 unsupportable`. Failing input for the two named assertions: none
  constructible. Also: nothing invokes the check (`grep -rn ceiling-counts package.json .github` is
  empty); it is cited from `.sdlc/adapter.md` as a manual step only.

### S4. `docs/reference/references/knowledge-02-tonal-scale.md` still says `CURRENT_SCHEMA_VERSION` is 4

- This plan edits that file (new section 9) and bumps `src/ui/persist.js` `CURRENT_SCHEMA_VERSION`
  from 4 to 6. The sentence "`CURRENT_SCHEMA_VERSION` is 4 (`src/ui/persist.js`)" in the persistence
  paragraph of section 8 is now false. `node scripts/audit-citations.mjs` reads STALE 0 because it
  checks line citations, not values.
- What I ran: `grep -rnE "CURRENT_SCHEMA_VERSION" docs/reference/references`.
  `docs/spec/spec-muted-base-key-spikes.md` REQ-011 and AC-011 also say 4, but that spec is a
  versioned historical record; carry, not fix.

### S5. `docs/img/palette-preview.svg` (the README image) shows ramps this plan moved

- `npm run gen:preview` is not in `test` or `build`, so C9's "tree clean after the gens" cannot see
  it. In scratch clone `m2` at `b4be472c`, `node scripts/gen-preview.mjs` rewrites 283 lines; 26 of the
  355 default-kit hexes this plan retired (old vs new `test/ui/fixtures/default-doc-ramps.json`)
  still appear in the committed SVG.
- Honest caveat: it was already stale on the merge base (258 lines rewrite there). The plan widened
  an existing drift. One command fixes it.

## 🟢 Carry

- K1. `test/engine/anchor.mjs` `prime-identity-control` now asserts that all 3,796 subjects DIFFER
  from a retired reference. Its only failing input is restoring the pre-#681 ladder; any wrong new
  ladder also "differs" and passes. It is not vacuous, but it costs 7,592 `primeSwatches` calls per
  run to guard one unlikely regression, and its name says identity while it measures difference.
- K2. C4's command `node scripts/report-preset-fidelity.mjs --identity-control --base <sha>` does not
  exist in the script (`grep -n identity-control scripts/report-preset-fidelity.mjs` is empty). Known:
  `.sdlc/verdicts/pif-u4.md` rows 13 and 21 carry it 🟡 "no gate and no ticket number". Still no ticket.
- K3. `test/engine/semantic.mjs` `FLOORS` still labels 41 cells "pending U4" after U4 closed under
  standing ruling R2. The machine gate (`PENDING_U4`, `checkFloors`) is sound and has working negative
  controls; only the wording is stale. Peak drops are large (Data 5 dark 16.7 to 5.3) and all clear AA.
- K4. `test/ui/shell.mjs` comment says an anchored ramp "ignores `hue`/`chroma`". It ignores `hue`
  only; `chroma` moves it in all three modes (`seed.mjs` above).
- K5. R13 delta condition (the verifier's, checked because it was free):
  `git diff --name-only 8f037dd2 b4be472c` lists nothing outside `.sdlc/` and `docs/`. The 326 s
  reading describes the landed runtime tree. The two graded readings stay 326 s and 553.45 s, the
  second 3.45 s over the band top; that is #713's, per the brief.

## Blast radius, stated plainly

A consumer re-pinning against this release sees:

- every colour export change once. `prime.DEFAULT` and the whole `prime.*` ladder move for all 3,380
  fitted palettes and the 16 default families (default Primary prime `#2177F5` to `#0C5DCC`);
- every ramp stop change, anchored or not: the shared `chromaEnvelope` and `dampAmp` 55 to 0 move the
  non-anchored path too (355 of 383 distinct default-kit ramp hexes are gone from
  `test/ui/fixtures/default-doc-ramps.json`);
- a saved pre-v6 document hydrates with no `anchor`, so it renders on the non-anchored path and
  differs from a freshly created default set of the same name. Both are "Default" in the set list;
- the app's own chrome (`appThemeCSS`) moves with the default kit;
- MCP describe kits are unaffected by anchors (`buildPalettes` replaces palettes wholesale and never
  copies `anchor`) but do move with the envelope;
- `figma/binder/figma-semantic-binder/code.js` and the 53-role table are untouched;
  `docs/reference/data/role-table.json` changes only by the 16 `anchor` fields.

Still citing a moved figure: S4, S5, and ADR-026's #701 pointer (B2). `audit-citations` STALE 0.

## Conventions

12 `html:` attributes across the three section files, all on `an-svg`. No `node_modules` or
`.claude/docs/other/` path in `git ls-files`. No new interpolated `font-family`, no new SVG line
path, no `src/ui/styles.css` change. Every `paletteStops`/`primeSwatches` call site in `src/`
forwards `anchor`; `scripts/gen-tonal-fixture.mjs` omits it on purpose and says so.

## Gates I tried to turn red and could

- `anchor-identity`: built-in control corrupts one hex digit and requires the corrupted hex back. It
  compares `prime[3]` to the stored `anchor`, not to the spec JSON; the spec side is covered
  independently by `prime.mjs` `ladder-window`, which re-derives roles from
  `docs/reference/colors/categories/*.json`. Sound.
- `anchor-ramp` predicates (`monotoneOk`, `gapOk19`, `distinctOk25`, `notchOk`): each has a synthetic
  failing input in the file, read from emitted pixels. Sound.
- `chroma-envelope` C7 grep: control deletes one call site and requires the count to drop. Sound.
  `env(500) = 1`: fails if the old `1 + dampAmp` centre term returns; not a tautology.
- `hpg-role-contrast`: AA floor plus ratchet plus `checkFloors` with two controls. Sound.
- `rst` group in `test/ui/headless-boot.mjs`: drives the real sliders, non-zero lift fixture, real
  button click. Sound.

## For the scout: top three, reproducible from the tree alone

1. B1. Write a script that imports the eight `src/ui/categories/*.js`, and for each palette with a
   string `anchor` calls `primeSwatches(p, { hueSpace: preset.hueSpace ?? "oklch", primeChroma: 100 })`
   from `src/engine/prime.mjs`, then computes
   `|(L0 - L3) - (L3 - L6)|` with `lstarFromRgb(sw[i].rgb)` from `src/engine/hct.js`. Expect 22 over
   3, max 54.24. Then `grep -n "CASES.push" test/engine/prime.mjs`: two pushes, neither reads a
   category file.
2. B2. `node scripts/report-preset-fidelity.mjs --envelope; echo $?` prints 1. Then
   `gh issue view 701` and `grep -n "#701" docs/reference/references/decision-records.md`: compare
   what the ADR says #701 owns with #701's Acceptance section.
3. S1. `projectView(hydrate(preset))` from `src/ui/model.mjs` and `src/ui/persist.js` over the same
   corpus; compare `view.palettes[i].key` with `doc.palettes[i].anchor`. Expect 0 equal of 3,380 and
   3,062 more than 5 L* apart.

## Mutation M1, remaining files

Same mutant (`VIVID_MIDS.damp` 70 to 30, corpus regenerated), run one file at a time:

| File | Exit | What bit |
|---|---|---|
| `test/engine/categories.mjs` | 0 | nothing |
| `test/engine/tonal.mjs` | 1 | `chroma-envelope (C6 ii)`: 5 duplicate-hex pairs beyond the cited list |
| `test/engine/anchor.mjs` | 1 | four frozen allow-lists drifted: gap 75 (want 72), distinct 27 (want 16), notch 16 (want 15), lone-spike 29 (want 64) |
| `test/engine/curated-contrast.mjs` | 0 | nothing |

Reading: a large damping regression does turn the suite red, so B2's second half is narrower than
"nothing sees it". What bites is change detection on by-name allow-lists, and every one of the six
lines is a side effect (duplicates, gaps, spikes), not a chroma-ratio measurement. A seat re-pinning
those lists after such a change has no gate telling it the ramps got less muted, and the one
instrument that measures the ruled direction is already at exit 1. I did not run a milder mutant
(for example damp 70 to 60) because of host load; whether a small un-muting slips every list is a
suspicion, not a finding.
