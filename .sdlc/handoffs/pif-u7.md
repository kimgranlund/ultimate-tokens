# Handoff pif-u7 · #681 preset-intent-fidelity, the pre-land fix unit

Builder, grade l5. Branch `unit/pif-u7`, UB `de1bafef`. Worktree `.git-worktrees/pif-u7`.
Written 2026-09-20. Host load sat between 23 and 48 on 10 cores for every run below, single test
files, one process at a time. No timing here is offered as a baseline figure and none is graded
under R13.

## 1. Verdict on my own work, before the table

🔴 One criterion is red, three things are open, and none of it is a success story.

- 🟢 **U7-P5 went red because of this unit's own commit, and this unit repaired it.** S1 grew
  `figma/plugin/ui.html`, so `.sdlc/baseline.md`'s ui.html KB figure went stale. Team-lead ruled the
  unit that made the figure stale repairs it. Repaired from a fresh generator run, last, after every
  other edit. §8b.

- 🟡 **U7-P1 is not mine.** No `npm test` has been run by this unit. The host allows one at a time
  and team-lead holds the window. Everything else below is single test files.
- 🟡 **One generated artifact sits outside U7-P4's enumerated list.** `src/ui/describe-mcp-assets.js`
  is rewritten by `npm test` as a consequence of S1. It satisfies the row's governing clause and not
  its parenthetical list. Asked team-lead to rule; committed meanwhile, because omitting it reds
  U7-P1's clean-tree check. §6 has the proof it is S1's and not pre-existing drift.
- 🟡 **S1 has a blast-radius consequence the plan does not record**: the gallery poster-strip band
  widths move for every anchored curated preset. §5 names the mechanism and the witness.
- 🟡 **Two findings against my own first draft**, both caught by my own controls and both fixed: my
  first freeze comparison reported only one side of a substitution, and my first branding control
  used the wrong needle and read green while proving nothing. §7.

## 2. Per-criterion status

| # | Status | Evidence |
|---|---|---|
| U7-P1 | 🔴 not run by me | no `npm test` from this unit; team-lead's window. Every single-file gate below is green and the tree is clean after the generators |
| U7-P2 | 🟢 | `branding: clean (552 files scanned)`, exit 0. Control NC-P2 bites |
| U7-P3 | 🟢 | the em-dash diff predicate prints `0` over the hand-edited paths. Control NC-P3 prints `1` with `-CSD` and `0` without |
| U7-P4 | 🟢 | the wall's hand-edited paths, plus 2 generated artifacts named with their generators, plus `.sdlc/baseline.md` under team-lead's repair ruling. §6 and §8b |
| U7-P5 | 🟢 | `stale total: 0` and `ceiling-counts: clean`, both exit 0, after repairing `.sdlc/baseline.md`'s ui.html figure. §8b |
| U7-1 | 🟢 | 26 by-construction exceptions of 3,380, frozen by name. Controls NC-1a and NC-1b bite and name both sides |
| U7-2 | 🟢 | 22 measured-pixel exceptions, max 54.2383 L*, frozen by name. Pre-#681 fixture control reads 1,816 at max 52.4868 L*. Control NC-2 bites |
| U7-3 | 🟢 | the 26 equal `ORDER_ALLOW` member for member, read out of `test/engine/anchor.mjs`'s source. Control NC-3 bites and names the side that moved |
| U7-4 | 🟢 | 364 from pixels, 363 constructed, 0 on the default kit, tolerance 0. Controls NC-4 and NC-2 bite |
| U7-5 | 🟢 | C11 rewritten: 364 named as the gate's own, 373 ± 5 kept and labelled as the prototype's, Q3 (b) cited |
| U7-6 | 🟢 | `#725` now 1 in the ADR file and 2 in the CHANGELOG; `#701` still 1 and 3. #725 reads OPEN |
| U7-7 | 🟢 | a C6 continuation bullet carries the owner's acceptance and cites the questions file |
| U7-8 | 🟢 | `key-anchor corpus: 3380 of 3380` on both producers; rendered leg 46 of 46. Control NC-8 reads 3,380 off, exit 1 |
| U7-9 | 🟢 | `brandKit(defaultDocument())` 16 of 16, MCP `list_palettes` 16 of 16 |
| U7-10 | 🟢 | new `(sfk)` group, shim exit 0. Control NC-10 reds 5 `(sfk)` assertions and 0 `(rst)` ones |
| U7-11 | 🟢 | both tautologies gone, 3 real assertions in their place, 12 `ok` lines. Every one proven to red by one `.sdlc/baseline.md` edit, §4 |
| U7-12 | 🟢 | the document and `src/ui/persist.js` both read 6. Control NC-12 splits them |
| U7-13 | 🟢 | `docs/img/palette-preview.svg` regenerated, generator proven deterministic (same sha on a second run) |
| U7-14 | 🟢 | `0` and `38`, unchanged. §8 |

## 3. B1: the two symmetry legs and the span report

Added to `test/engine/prime.mjs`, after the existing 464-case synthetic sweep, which is untouched
and still reads `by-construction fails 0, measured exceed-3L* 0/464`.

Run, `node test/engine/prime.mjs`, exit 0, `163.44s user` over a `3:28.87` wall at load 35:

```
  symmetry (anchored corpus): 3380 palettes, by-construction exceptions 26 (max |up-down| 54.3116 L*), measured exceed-3L* 22 (max 54.2383 L*)
    worst 54.31 L*  film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25
    worst 54.10 L*  music "Black metal · the forest at night" secondary #1E2024
    worst 53.83 L*  film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E
  pass  symmetry corpus by-construction: 26 of 3380 (expected 26)
  pass  symmetry corpus measured-pixel: 22 of 3380 (expected 22)
  pass  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 26 vs 26
  pass  ladder-span under 30 L*: 364 of 3380 anchored corpus ladders measured from emitted pixels (expected 364), 363 read off the constructed rungs (expected 363), 0 of 16 default-kit families (expected 0); tolerance 0 on all three
  symmetry/ladder-span negative control (frozen pre-#681 fixture, anchored corpus): measured exceed-3L* 1816/3380, max 52.4868 L*, pixel span under 30 L* 0
```

Every one of the planner's figures reproduced with no adjustment: 26 and 22, the three worst
by-construction cases in the planner's own order, 364 and 363, 0 on the default kit, and the
control's 1,816 at 52.49.

**The mechanism, because R2 asks for one before a count is pinned.** An anchored palette renders
`prime` at its source's own CIE L* verbatim while the six ladder rungs are built around the pivot
the widening search in `src/engine/prime.mjs` settles on. Those two coincide for a source
comfortably inside the window and part company for a near-black one, which is Q3 (b)'s ruled class.
`ORDER_ALLOW`'s own note works the population out: 21 members sit at or past the window bound, 5 sit
inside it but within about 1.1 L* of `PRIME_L_MIN` (12.3351 to 13.3550 against a floor of 12.2500).
Breaking the prime rung away from the pivot is the same event that stops `prime` sitting between
`bright` and `dim`, so the two lists are predicted to hold the same members, and the gate asserts
that rather than pinning a second copy of 26.

**The 22 are a strict subset of the 26.** The four that break the constructed equality and still
measure inside 3 L* are Apocalypse Now primary `#241E1A`, The rave secondary `#212228`, the Patmos
church tertiary-muted `#232220` and the Hidaka coast tertiary-muted `#252215`. The gate asserts the
subset relation directly, so a member of the measured list that is not in the by-construction list
reds as an inconsistency rather than as corpus drift.

**One thing I did not quote as a control, on purpose.** The pre-#681 fixture's constructed-span
count over the same corpus is 3,380, not 0. That is a unit mismatch, not a measurement: the
fixture's own `l` field is OKHSL lightness on 0..1, not CIE L*, so every ladder is trivially "under
30". Quoting it would have been a false red. Only the fixture's PIXEL leg is used as a control, and
the code says so.

### Controls, run in a throwaway clone, with output

**NC-1a, one name dropped from the frozen by-construction list.** Exit 1.

```
  FAIL  symmetry corpus by-construction: 26 of 3380 (expected 25)
    UNEXPECTED in the measured corpus, absent from the frozen by-construction list: music "P-Funk · the cosmic album art" secondary-muted #211E27
  FAIL  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 25 vs 26
    ORDER_ALLOW side moved: music "P-Funk · the cosmic album art" secondary-muted #211E27 is in test/engine/anchor.mjs's ORDER_ALLOW and not in this file's by-construction list
```

**NC-1b, one name swapped for a fabricated one at the same length.** Exit 1. Both sides named,
which is the point of the row:

```
    MISSING from the measured corpus, present in the frozen by-construction list: film "A Made-Up Title" primary #000001
    UNEXPECTED in the measured corpus, absent from the frozen by-construction list: music "P-Funk · the cosmic album art" secondary-muted #211E27
    ORDER_ALLOW side moved: music "P-Funk · the cosmic album art" secondary-muted #211E27 ...
    this file's side moved: film "A Made-Up Title" primary #000001 is in this file's by-construction list and not in ORDER_ALLOW
```

**NC-3, a 27th name added to `ORDER_ALLOW` in `test/engine/anchor.mjs` alone.** Exit 1. Only the
cross-check moves, and it names which side did:

```
  FAIL  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 26 vs 27
    ORDER_ALLOW side moved: film "A 27th Invented Preset" primary #000002 is in test/engine/anchor.mjs's ORDER_ALLOW and not in this file's by-construction list
```

**NC-4, `SPAN_L_FLOOR` moved from 30 to 40 in a scratch copy.** Exit 1, the count tracks the
threshold:

```
  FAIL  ladder-span under 40 L*: 621 of 3380 ... (expected 364), 623 read off the constructed rungs (expected 363) ...
```

**NC-2, the corpus control's import pointed at the LIVE module instead of the frozen fixture.**
Exit 1, both halves of the control fire:

```
  FAIL  symmetry ... negative control: the pre-#681 fixture measured 22 corpus exceptions, not clearly more than this branch's 22 - this leg would not have caught #641's redistribute asymmetry
  FAIL  ladder-span ... negative control: the pre-#681 fixture reported the SAME 364 ladders under 30 L* as this branch - the span report may be constant rather than measured
```

### Cost, stated because #713 owns suite time

The two new corpus sweeps cost, measured in isolation on this host: 2.24 s for the live sweep and
21.6 s for the pre-#681 fixture control, about 24 s of CPU added to a file the baseline records at
54.9 s at load 5.16. The control is the expensive half and the criteria require it. Flagging it for
#713 rather than trimming it.

## 4. S3: the ceiling check's two tautologies

Removed from `.sdlc/checks/ceiling-counts-check.mjs`:

- `above + inside == total`. `above` and `inside` are complementary filters of the same `rows` array
  on `wall > BAND_TOP`. Their lengths sum to `rows.length` by construction.
- `PARTITION graded + explicit + unsupportable == total`. `explicit` is defined as the rows in
  neither of the other two parts, so the three exhaust `rows` by construction.

Neither had a constructible failing input, which is why they are gone rather than kept with a note.

Three real assertions replace them, each reading something the script did not read before:

- `prose above LIST == measured above walls` and `prose inside LIST == measured inside walls`. The
  prose does not only count the two halves, it LISTS them wall by wall in parentheses. Those lists
  are an independent human-typed source and can disagree with the rows at an unchanged count.
- `prose graded count == measured graded`, reading the `**Two** of the readings are graded under
  R13` sentence, which nothing in the script read before.

Current run: 12 `ok` lines, `partition: 19 = 2 graded + 14 explicit + 3 unsupportable`,
`ceiling-counts: clean`, exit 0.

**Every one of the 12, plus the three not-found branches, proven to red by one edit to
`.sdlc/baseline.md` in a throwaway clone.** The verifier reproduces at least three; all 15 are
listed so any three can be picked.

| assertion | one edit to `.sdlc/baseline.md` that reds it | observed |
|---|---|---|
| series has rows at all | delete every reading row | `FAIL series has rows at all (0 rows parsed)` |
| prose total == rows | `**19 readings**` to `**20 readings**` | `FAIL (prose 20, rows 19)` |
| prose above == measured | `**12** above` to `**11** above` | `FAIL (prose 11, measured 12)` |
| prose inside == measured | `**7** inside it` to `**8** inside it` | `FAIL (prose 8, measured 7)` |
| prose above LIST == measured | `592.17` to `592.18` inside the above-list parens | `FAIL prose [... 592.18 ...] vs measured [... 592.17 ...]` |
| prose inside LIST == measured | `inside it (284,` to `inside it (285,` | `FAIL prose [285, ...] vs measured [284, ...]` |
| prose 'other N' == total - graded | `Of the other 17:` to `Of the other 16:` | `FAIL (prose 16, measured 17)` |
| prose explicit count == measured | `**fourteen**` to `**thirteen**` | `FAIL (prose 13, measured 14)` |
| prose partition parts sum to 'other N' | the same `Of the other 16:` edit | `FAIL (14 + 3 vs 16)` |
| prose graded count == measured graded | `**Two** of the readings are graded` to `**Three**` | `FAIL (prose Three (3), measured 2)` |
| adapter note count == rows | append a 20th reading row to the table | `FAIL (note 19, rows 20)` |
| adapter note max == series max | the `1670.43 s` row becomes `1770.43 s` | `FAIL (note 1670.43, series 1770.43)` |
| prose count sentence found | drop `**19 readings**:` from the sentence | `FAIL prose count sentence found` |
| prose partition sentence found | `Of the other 17:` to `Of the rest:` | `FAIL prose partition sentence found` |
| prose graded sentence found | drop `under R13` from the graded sentence | `FAIL prose graded sentence found` |

`.sdlc/adapter.md` was not read, not edited and not reported on. Its §7 block and its CI row are
frozen records and correctly carry superseded text.

## 5. S1: the key swatch follows the anchor

`src/ui/model.mjs`'s `deriveKeyColor` now returns a valid `anchor` verbatim and short-circuits the
cusp search. It is deliberately NOT implemented by calling `primeSwatches`: the two stay independent
producers, which is what lets the gate compare them and mean something. `keyOklch` comes from a
private `rgbToOklchLocal`, the third identically-scoped copy in this codebase, for the reason
`src/engine/prime.mjs`'s own copy states: no module exports the full OKLCH triple from sRGB.

New `key-anchor` gate in `test/engine/anchor.mjs`, `node test/engine/anchor.mjs`, exit 0:

```
  pass  key-anchor corpus: 3380 of 3380 anchored palettes where the identity swatch equals the stored anchor, 3380 of 3380 where it equals primeSwatches(...)[3].hex, 0/0 off
  pass  key-anchor rendered path: 46 of 46 anchored palettes over projectView(hydrate(doc)), 4 subjects (the 16 default-kit families plus 3 named corpus presets), 0 off
```

The rendered leg's three named corpus presets are film "The Matrix", travel "Hidaka coast" and music
"Black metal", each resolved by a substring the gate reds on if it stops matching, rather than by
index.

**NC-8, the cusp branch restored in the clone.** Exit 1, and it reproduces the planner's own worst
case exactly:

```
  FAIL  key-anchor corpus: 0 of 3380 ... 3380/3380 off; worst travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted, key #F7F4E5 against anchor #252215, 82.9 L* apart
  FAIL  key-anchor rendered path: 0 of 46 ... 46 off
```

**Runtime, since U7-8 asks whether the anchored branch short-circuits or adds.** Measured directly
over the 3,380 anchored palettes in this worktree:

- anchored short-circuit branch: **12.26 ms**
- the cusp search it replaces: **21,225.70 ms**

It removes about 21 s of CPU from every full-corpus pass over `paletteKeyColors`, which is also
where the planner's "pre-fix corpus sweep costs 19.7 s" came from. `test/engine/anchor.mjs` itself
ran in about 4 minutes of wall at load 26 to 40; I did not capture a clean before-and-after wall for
that file because the load moved more than the change does, and the isolated 12 ms against 21.2 s
answers the question the row is actually asking.

**U7-9, the consumer surfaces.** `brandKit(defaultDocument())` reports 16 of 16 anchored default-kit
palettes with `key` equal to `anchor`; the MCP `list_palettes` tool over `buildSurface(kit)` reports
16 of 16. `src/ui/mcp-assets.js` did NOT move under `gen:mcp-assets`.

### Blast radius, now a row in the plan

`src/ui/app-helpers.mjs`'s poster-strip chroma weighting reads `paletteKeyColors().key`, so S1 moves
the preset-tile strip band widths for every anchored curated preset. Witness: literature "War and
Peace", dominant candle gold. The old key was `#D5BE98`, the cusp RECONSTRUCTION; the new key is
`#C49F60`, the stored sample. The sample is more chromatic than its own reconstruction, which is the
ADR-026 defect surfacing in the gallery. Team-lead ruled the row goes in the plan's Blast radius
section, inside the scope wall; it is there.

**The cap is DERIVED, not observed.** My first pin read 40.56 off a run, which team-lead correctly
called a fitted number. The prediction now comes from the sampled hex and the module's own exported
endpoints, before any run:

- `#C49F60`'s OKLCH chroma is **0.092275**, computed with this test group's own Ottosson conversion
  (`jjOwnChroma`), never through `posterStripChroma`, so a shared bug in that conversion cannot make
  the prediction agree with the engine.
- `POSTER_STRIP_CAP_CHROMA_LOW` is 0.02 and `POSTER_STRIP_CAP_CHROMA_HIGH` is 0.15, so
  t = (0.092275 - 0.02) / 0.13 = **0.555958**.
- `POSTER_STRIP_MAX_BAND_PCT_LOW` is 35 and `POSTER_STRIP_MAX_BAND_PCT_HIGH` is 45, so the cap is
  35 + 0.555958 x 10 = **40.5596**.

The same arithmetic on the retired cusp key `#D5BE98` (chroma **0.057194**, t **0.286108**) predicts
**37.8611**, which is exactly the cap the assertion used to sit under. The derivation reproduces BOTH
sides of the move, so it is a prediction rather than a description of one reading.

The `(jj)` group now asserts three things in order: the strip reads `#C49F60` and the documented
scaling predicts 40.5596 from that hex alone; `posterStripDominantCap` agrees with that prediction
to 1e-9; and the rendered band equals the engine, strictly inside (35, 45). The last of these is
what `#646` originally cared about and it is unchanged in intent.

**Control, per team-lead: the cusp key restored in a throwaway clone.** `node
test/ui/headless-boot.mjs`, exit 1:

```
  ✗ (jj) #681 S1: the strip reads War and Peace's SAMPLED dominant #C49F60, and the documented chroma scaling PREDICTS its cap at 40.5596 from that hex alone (key #D5BE98, predicted 37.8611)
jj failures: 1
```

Worth reading carefully: exactly ONE of the three reds, and it is the right one. The other two stay
green under the cusp key because the engine and the prediction move together to 37.86 and the
rendered band follows, which is the whole point. The assertion that pins WHICH colour the strip
reads is the one that bites, and the control prints the retired key and its predicted 37.8611 by
name.

Verification run in the worktree after the rewrite: `node test/ui/headless-boot.mjs`, exit 0,
`HEADLESS BOOT PASS`, 0 failures, `real 2m26.794s / user 2m24.581s` started at load 6.65.

**`src/ui/app-helpers.mjs` is not in the scope wall and I did not touch it.** No engine constant
moved; only the colour fed into it.

## 6. S2, S4, S5, and the generated artifacts

**S2.** `seedFromKey` in `src/ui/sections/color.js` now makes the same three calls the Hue and
Chroma sliders make, in their order: `detachSnapshot` from the pre-edit palette, then the new
values, then `delete anchor`. New `(sfk)` group in `test/ui/headless-boot.mjs` on a reopened
anchored preset copy; shim exit 0, `HEADLESS BOOT PASS`.

Why the suite did not already catch this: the `(kc)` group has called `app.seedFromKey(0,
"dominant")` all along, on the NON-ANCHORED default kit, where there is no `anchor` to drop and no
snapshot to stamp.

**NC-10, `seedFromKey` reverted to its two-field commit in the clone.** Exit 1, and the split is
exactly what the criterion predicted:

```
  ✗ (sfk1) seedFromKey drops `anchor`, the same detach the Hue and Chroma sliders perform
  ✗ (sfk3) ... (got hue=undefined/chroma=undefined/lift=undefined, want 263/54/-12)
  ✗ (sfk3b) the prime strip actually moved (a real detach, not a no-op)
  ✗ (sfk4) the Reset button renders after a seed-driven detach ...
  ✗ (sfk4c) Reset restores the EXACT pre-seed hue/chroma/lift snapshot (got 150/22/-12, want 263/54/-12)
rst failures: 0   sfk failures: 5
```

**S4.** `docs/reference/references/knowledge-02-tonal-scale.md` §8.4 now reads 6, matching
`src/ui/persist.js`, and says what v5 and v6 added. NC-12 bumps the constant in the clone and the
two readings split (`is 6` against `= 7`).

**S5.** `npm run gen:preview` regenerated `docs/img/palette-preview.svg`. Proven deterministic: two
consecutive runs leave the identical sha `453597f9b7613c73a876afd8f540d9b5b5b74398`. The file was
already stale at `0391f045`, which is the planner's own 283/283 reading; it is now committed
regenerated.

### Generated artifacts `npm test` rewrote, each with its generator

Ran the full `npm test` generator chain by hand (`gen:figma-assets`, `gen:mcp-assets`,
`gen:categories`, `gen:adia-exports`, `bundle`, `gen:figma-ui`). Exactly two moved:

| artifact | generator | on U7-P4's list |
|---|---|---|
| `figma/plugin/ui.html` | `scripts/gen-figma-ui.mjs` (`gen:figma-ui`) | yes |
| `src/ui/describe-mcp-assets.js` | `scripts/gen-describe-mcp-assets.mjs`, run by `gen:mcp-assets` | 🟡 **no** |

`src/ui/figma-plugin-assets.js`, `src/ui/mcp-assets.js`, `src/ui/categories/*.js` and
`test/ui/fixtures/default-doc-ramps.json` did NOT move.

The second row was raised as a scope-wall question and team-lead ruled on it (2026-09-20): commit it
and name it, do not amend the criterion. U7-P4's governing clause covers any committed generated
artifact `npm test` rewrites as a consequence of S1, each named here with its generator; the
parenthetical list is illustrative, not closed; the criterion text is owner-approved and stays as
written; and the conductor has been told so the verifier does not read the parenthetical as
exhaustive.

Naming the chain as asked: `npm test` runs `gen:mcp-assets`, which is
`node scripts/gen-mcp-assets.mjs && node scripts/gen-describe-mcp-assets.mjs`, and it is the SECOND
of those, `scripts/gen-describe-mcp-assets.mjs`, that rewrites `src/ui/describe-mcp-assets.js`.
**`src/ui/mcp-assets.js`, written by the first, did NOT move.**

Proof it is S1's consequence and not pre-existing drift, which is the control the clause asks for:
in a throwaway clone checked out at UB `de1bafef`, `npm run gen:mcp-assets` exits 0 and leaves
`git status --short` empty.

The third generated artifact in this commit, `docs/img/palette-preview.svg`, is S5's own deliverable
rather than a side effect, and it was already stale at `0391f045` before this unit existed.

## 7. Two findings against my own first draft

Recording these because a handoff that only reports success is the shape that cost this plan four
verdict passes.

- **My first freeze comparison named only one side of a substitution.** `prime.mjs`'s `FAIL` keeps
  the first message per gate name, so NC-1b's swap reported "expected member missing" and said
  nothing about what had replaced it, which is the exact scenario U7-1 asks the gate to survive. The
  comparison now prints every missing AND every unexpected name to stdout before calling `FAIL`, so
  the dedupe cannot swallow half the diff. NC-1b above is the re-run.
- **My first branding control read green while proving nothing.** I probed with an invented brand
  string instead of the one `test/repo/branding.mjs` actually bans, and it reported
  `branding: clean (553 files scanned)`, exit 0. A control that cannot fail is worse than no
  control. Redone with the real banned uppercase run in a `.sdlc/verdicts/` file:
  the gate's own line naming the file and the banned uppercase run it contains, `FAIL: 1 branding violation(s)
  across 553 files`, exit 1.
- A third, smaller one: my first two perl edits in the control battery, NC-1a and NC-2, did not
  match their targets (wrong indentation, wrong whitespace) and the runs came back green. Both were
  re-run once the edit was verified to have landed. The lesson is the same one: a control run is
  worthless until you have confirmed the edit it depends on actually applied.

## 8. U7-14: the carried K items

`grep -c identity-control scripts/report-preset-fidelity.mjs` prints **0**.
`grep -c "pending U4" test/engine/semantic.mjs` prints **38**.

Both readings are unchanged from the planner's measurement at `0391f045` and both are recorded as
known and carried, not fixed by this unit. K2 and K3 are the named close-out candidates; K1, K4 and
K5 are carried.

## 8b. U7-P5: the baseline figure this unit made stale, and repaired

Immediately after this unit's first commit, `sh .sdlc/checks/baseline-agrees-check.sh` read:

```
STALE ui.html: baseline 4111.1 KB, tree 4117.5 KB
stale total: 1
exit 1
```

It read `stale total: 0` before that commit. The cause is S1: the comments added to
`src/ui/model.mjs` and `src/ui/sections/color.js` grow `figma/plugin/ui.html` through
`scripts/gen-figma-ui.mjs`, and `.sdlc/baseline.md`'s recorded `ui.html 4111.1 KB` stopped matching
the tree the check measures.

`.sdlc/baseline.md` is not in U7-P4's enumerated list, so I stopped and asked rather than editing
outside the wall. Team-lead ruled (2026-09-20): the unit whose change made the figure stale repairs
it, leaving a red gate for a later commit is the defect rather than the tidy option, the
owner-approved criterion text is NOT amended, and the conductor is told so the verifier does not red
U7-P4 on the file. Revision 25 of the plan is the standing precedent for this shape: the landing
unit repairs the baseline figure in its own commit with `baseline-agrees-check.sh` run as a gate.

Done last, after every other edit, and re-measured rather than copied out of the error line. The
figure comes from the generator's own output line in this worktree, `wrote figma/plugin/ui.html
4117.5 KB`, confirmed independently by measuring the committed file the way the check measures it
(`readFileSync(..., "utf8").length / 1024`), which also gives `4117.5`. The single edited cell says
what moved it and why, rather than silently overwriting a run nobody redid.

Afterwards: `stale total: 0`, exit 0. Nothing else about the row moved at any point: the test-file
count agreed throughout (49 against 49), every adapter time range agreed, and the baseline ref stayed
in `origin/main`'s history. No timing figure in that file was touched.

## 9. What I did not do

- No `npm test`, and no full sweep of any kind. U7-P1 is unmet by this unit.
- No `npm run build` and no `npm run smoke`.
- No GitHub issue and no PR, per R16. Two items that would otherwise deserve one are written here
  instead: the poster-strip blast radius (§5) and the ~24 s this unit adds to
  `test/engine/prime.mjs` (§3), which belongs with #713.
- No push, no merge, no other worktree or branch touched.
- `.sdlc/adapter.md` not read for staleness, not edited, not reported on.
- `src/ui/app-helpers.mjs` not touched, although S1 changes what it computes.
- I did not capture a clean before-and-after wall time for `test/engine/anchor.mjs`. §5 explains why
  and gives the targeted measurement instead.

## 10. What I am unsure of

- Whether the owner would rather the poster strip keep weighting by the cusp reconstruction.
  Team-lead ruled on the gate and the plan row; nobody has ruled on the product behaviour itself.
  Following the sampled colour is what ADR-026 says the product does everywhere else, so I treated
  it as the intended consequence rather than a regression, but that is my reading, not a ruling.
- The `ladder-span` gate's expected counts are exact, tolerance 0, on my reading of "failing outside
  a stated tolerance". If the intent was a band, say so and I will widen it; I chose exact because
  both producers are deterministic functions of committed data and a band would only hide a move.
- `test/engine/prime.mjs` reads `ORDER_ALLOW` out of `test/engine/anchor.mjs`'s source text rather
  than importing it, because that file runs its whole suite and exits on import. Parsing a source
  literal is fragile in a way an import is not; the gate reds loudly if the literal is renamed or
  moved, which is the best I could do without adding a shared module outside the scope wall.
