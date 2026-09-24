# U7 review, pass 1: plan #681 preset-intent-fidelity, head `285f66ec`
verdict: 🟡

Fresh-context reviewer, grade l3. Unit branch `unit/pif-u7`, UB `de1bafef`, graded head `285f66ec`
(the two commits past `9ecd071e` touch `test/ui/shell.mjs` and the handoff only). Written 2026-09-21.

Every mutation ran in a throwaway `git clone -q --shared` under my own scratch directory, never in
the worktree. The host guard `pgrep -f 'node .*test/(run|engine|ui)' | wc -l` was polled to 0
before every test process; one process at a time; `npm test` was never run. Host load sat between
14 and 32 during the runs, so no timing here is a baseline figure. Raw outputs went to a session scratch directory that does not survive the session and are not
recovered; the figures quoted below are the record of them. The two control scripts those figures
come from are committed at `.sdlc/records/pif-u7-blast/blast.mjs` and `ko.mjs`, with the command
that regenerates each in that directory's `README.md` (re-run at pre-land pass 2, both reproduce
the figures below, `ko.mjs`'s head figure only: its cusp-restored comparison figure needs a source
mutation the README does not describe). The `runner*.sh` shell wrappers around the test gates were
not recovered.

Criteria read from the unit tree, with U7-P4 read as amended at revision 32
(`git show 5951b160:.sdlc/plans/preset-intent-fidelity.md`).

## Findings, severity first

### F1 🟡 `test/ui/shell.mjs:69` at `285f66ec`: the skew stale-cache probe is now vacuous, the same defect the builder found and fixed one assertion later

The builder's round-2 repair (`1b1fb33a`) noticed that the key probe's `kc2 !== kc` comparison
passed on the detach alone, because dropping `anchor` swaps the key from the anchor to the cusp
colour whether or not the hue edit was re-projected, and re-based that probe against a
detached-but-unedited palette (`test/ui/shell.mjs:98-103`). The ramp probe at line 69,
`editing skew did not change the projected ramp (stale/stored derived state?)`, has the identical
flaw and was not re-based. The fixture now deletes `anchor` (line 68, added in this unit), and
detaching alone moves the ramp, so the assertion can no longer tell whether `skew` was
re-projected.

Input constructed: replace the line `edited.palettes[1].skew = ((edited.palettes[1].skew + 130 + 100) % 200) - 100;`
with a comment, keep every other line, run `node test/ui/shell.mjs`.

| clone | result |
|---|---|
| UB `de1bafef`, skew edit removed | `FAIL  model  — editing skew did not change the projected ramp (stale/stored derived state?)`, `FAIL: 1 gate failure(s)`, exit 1 |
| `9ecd071e`, skew edit removed | `PASS: ui-app pure core + shell clear the checkable predicates`, exit 0 |
| `285f66ec`, skew edit removed | `PASS: ui-app pure core + shell clear the checkable predicates`, exit 0 |

Mechanism, from a node one-liner in the `285f66ec` clone over `defaultDocument()` palette 1:

```
detach ONLY (no skew, no hue): ramp[12] #174488 -> #194B97 changed: true
skew ONLY, still anchored:     ramp[12] #174488 -> #164183 changed: true
```

So the probe discriminated before the unit (a skew edit was the only thing that could move an
anchored ramp in that fixture, since the anchored branch ignores `hue`) and does not after it. The
handoff §8d says "No assertion was weakened, but my first repair did weaken one, and I caught it."
Two were weakened by the same edit; one was caught. Not a product bug: a gate regression inside a
file the unit repaired under revision 32's second half. The fix is the shape the builder already
applied at line 98: compare `v2.palettes[1].ramp[12]` against `projectView(detachedOnly)`'s, or
run the skew probe on the still-anchored copy, where skew alone moves the ramp (measured above).

### F2 🟡 S1's blast radius has consumers the plan and the handoff do not record, and one of them changes an ordering

Grepped every consumer of `paletteKeyColors`, `deriveKeyColor`, `.key` on a palette view and
`.keyOklch` across `src/` and `mcp/`, excluding the generated `*-assets.js` and `categories/`.
Beyond the four the pre-land review listed (tile swatch, hue-wheel dots, relative-chain strip, MCP
palettes summary) and the poster strip the builder found:

| consumer | file:line | reads | moves under S1 | recorded |
|---|---|---|---|---|
| `_isNeutralPalette`, the near-grey test `keyOklch[1] < 0.02` | `src/ui/sections/color.js:424` | `vp.keyOklch` | yes | no |
| `_orderedContext` / `newPalSamples`, the Relative-derivation primary and samples | `src/ui/sections/color.js:433-445` | `.key`, `.keyOklch` | yes | no |
| `_newPalProposed` Custom fallback position and `_hueCircle` dots | `src/ui/sections/color.js:588, 621-623` | `vp.keyOklch`, `vp.key` | yes | hue-wheel dots only |
| `addKeyColor`, stores `vp.keyOklch` | `src/ui/sections/color.js:1935` | `vp.keyOklch` | yes | pre-land review S1, one clause |
| poster strip weighting | `src/ui/app-helpers.mjs:582` via `app.js:797` | `.key` | yes | handoff §5, plan Blast radius row |

Measured with `blast.mjs`, committed at `.sdlc/records/pif-u7-blast/blast.mjs`: `projectView(hydrate(doc))` at UB against head over
the default kit plus all 343 curated presets (344 documents), applying `_orderedContext`'s own
ordering rule with the whole palette set as context, then `deriveRelative("extend", samples)`:

```
{ total: 344, neutralFlip: 148, primaryMoved: 14, relMoved: 339 }
default Relative extend: [0.593,0.206,289.000] -> [0.504,0.187,288.988]
architecture/Bankside / Tate Modern · 1947: primary idx 2 -> 1
architecture/SoHo cast-iron loft · 1880s: primary idx 5 -> 3
```

148 palettes flip their neutral classification (a sampled near-grey now reads as near-grey, or a
reconstruction that read near-grey no longer does), the Relative-derivation primary index changes
for 14 presets, and the derived target moves for 339 of 344 documents. No test reads `keyOklch`
(`grep -rn keyOklch test/` is empty); the `(np)` group in `test/ui/headless-boot.mjs:2195-2230`
asserts shape only (`samples.length`, three-element arrays). Consistent with ADR-026's intent that
the product follows the sampled colour everywhere, and the same reasoning the builder gave for the
poster strip in handoff §10, but the plan's Blast radius table names only the poster strip. Needs
a row naming `_isNeutralPalette`, `_orderedContext`, `newPalSamples`, `addKeyColor` with the
figures above, and the owner's word that the New-Palette derivation pivoting on the sampled colour
is intended, since nobody has ruled on the product behaviour (the builder says so of the poster
strip in §10, and it applies equally here).

Also checked, in the builder's favour: `keyOklch` and `key` agree under the new branch.
`ko.mjs`, committed at `.sdlc/records/pif-u7-blast/ko.mjs`, reads `max |keyOklch - hexToOklch(key)|` at `0.00e+0` over the 16
default-kit palettes at head, against `5.86e-1` with the cusp branch restored. So the triple
`rgbToOklchLocal` returns is the anchor's, not a leftover cusp triple, and every consumer of
`keyOklch` sees the same colour the swatch shows.

Related question from the brief, answered: `src/ui/describe-mcp-assets.js` moved and
`src/ui/mcp-assets.js` did not, and that is consistent. `describe-mcp-assets.js`'s header says it
is generated "from mcp/ + src/ + docs/reference/data/" and inlines `src/ui/model.mjs`, which S1
edited. `gen-mcp-assets.mjs` reads only `mcp/brand-kit-server.mjs`, `mcp/brand-kit-core.mjs` and
`mcp/README.md`, none of which changed. Neither is stale.

### F3 🟡 suspicion, `test/engine/prime.mjs:1043-1046`: the four-name difference between the two frozen lists is stated in a comment and not asserted

The comment says the by-construction list minus the measured list is exactly Apocalypse Now,
The rave, the Patmos church and the Hidaka coast "by subtraction". The code asserts the subset
direction only (`pxNames ⊆ bcNames`, line 1096). A palette that leaves the measured list while
staying in the by-construction list reds the measured freeze anyway, so the gate is sound and I
could not construct an input that passes wrongly. Labelled a suspicion; it does not carry the
verdict. If R2 wants the mechanism-as-code, one line asserting the set difference equals those
four would do it.

## Gates I made fail, each reproduced from my own clone

The brief said to assume a seventh vacuous gate is somewhere in the diff. F1 is it: not a new
gate, but an existing one the unit's own fixture edit hollowed out. Every gate the unit added
reds on a constructed input.

| criterion | input constructed | run output |
|---|---|---|
| U7-1 / U7-2 (`prime_m1`) | in `test/engine/prime.mjs`, swap P-Funk for `` `music "Fabricated Preset" primary #000001` `` in `SYM_BY_CONSTRUCTION_ALLOW` and Tórshavn for `` `travel "Fabricated Two" primary #000002` `` in `SYM_MEASURED_ALLOW`; both counts unchanged at 26 and 22 | `MISSING from the measured corpus, present in the frozen by-construction list: music "Fabricated Preset" primary #000001` · `UNEXPECTED ... music "P-Funk · the cosmic album art" secondary-muted #211E27` · `MISSING ... Fabricated Two` · `UNEXPECTED ... Tórshavn ... #221913` · `FAIL symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 26 vs 26` with both `ORDER_ALLOW side moved` and `this file's side moved` lines · exit 1. A same-count substitution names both members on both legs; a count cannot carry the gate. |
| U7-3 (`prime_m2`) | swap one `ORDER_ALLOW` member in `test/engine/anchor.mjs` alone for `` `music "Fabricated Order" primary #000003` ``, count still 26, `prime.mjs` untouched | `FAIL symmetry corpus by-construction set == ORDER_ALLOW: 26 vs 26` · `ORDER_ALLOW side moved: music "Fabricated Order" primary #000003 is in test/engine/anchor.mjs's ORDER_ALLOW and not in this file's by-construction list` · `this file's side moved: music "P-Funk ..." is in this file's by-construction list and not in ORDER_ALLOW` · exit 1. Either side moving alone fails and is named. |
| U7-8 (`anchor_m3`) | `src/ui/model.mjs:911` changed to `if (false && typeof p?.anchor === "string" && ANCHOR_HEX.test(p.anchor))`, restoring the cusp search | `FAIL key-anchor corpus: 0 of 3380 anchored palettes where the identity swatch equals the stored anchor, 0 of 3380 where it equals primeSwatches(...)[3].hex, 3380/3380 off; worst travel "42° N · July · 06:00 · Hidaka coast ..." tertiary-muted, key #F7F4E5 against anchor #252215, 82.9 L* apart` · `FAIL key-anchor rendered path: 0 of 46 ... 46 off` · exit 1. Reproduces the planner's worst case exactly. Independence: `primeSwatches` is untouched by the mutation and the second producer still disagrees 3380 of 3380, so the comparison is not circular; the two producers share `peakC`/`hct.js` only on the non-anchored path, which the anchored branch never enters. |
| U7-10 (`hb_m4`) | `seedFromKey` body in `src/ui/sections/color.js` reverted to `this.commit((d) => { d.palettes[i].hue = s.hue; d.palettes[i].chroma = s.chroma; });` | `HEADLESS BOOT FAIL` · `✗ (sfk1)` · `✗ (sfk3) ... got hue=undefined/chroma=undefined/lift=undefined, want 263/54/-12` · `✗ (sfk3b)` · `✗ (sfk4)` · `✗ (sfk4c) ... got 150/22/-12, want 263/54/-12` · no `(rst)` line red · exit 1. The new leg is what catches it. |
| U7-11 (`cc` clone, eight edits to `.sdlc/baseline.md`, one at a time, `git checkout` between) | E1 `747.27` to `747.28` in the above list; E2 move `518.66` from the inside list to the above list (prose counts untouched); E3 `**Two**` to `**Three**`; E4 `(284, 293.09` to `(293.09, 293.09` (duplicate at unchanged length); E5 `649` to `649s`; E6 `**fourteen**` to `**thirteen**`; E7 `Of the other 17:` to `16:`; E8 E6 and E7 together (prose self-consistent, rows unchanged) | E1 `FAIL prose above LIST == measured above walls` · E2 both LIST lines FAIL while all four count lines stay `ok`, which is exactly the move the retired partition could not see · E3 `FAIL prose graded count == measured graded (prose Three (3), measured 2)` · E4 `FAIL prose inside LIST` · E5 `FAIL prose above LIST` (the junk token drops out and the list is one short) · E6 `FAIL prose explicit count == measured` and `FAIL prose partition parts sum to 'other N'` · E7 `FAIL prose 'other N' == total - graded` and the parts-sum line · E8 two FAILs · every run exit 1. Base run: 12 `ok` lines, `partition: 19 = 2 graded + 14 explicit + 3 unsupportable`, `ceiling-counts: clean`, exit 0. Three rewritten assertions covered (E1, E2, E3, E4). |
| shell key probe at `285f66ec` (`s285_nohue`) | the `+ 60` hue edit line replaced with a comment, the `delete anchor` kept | `FAIL  model  — paletteKeyColors did not change after a hue edit on a detached palette (stale/cached state?): #2177F5 both before and after` · exit 1. Same input at `9ecd071e` (`s9ecd_nohue`): `PASS`, exit 0. The builder's claim that its own round-1 probe was vacuous reproduces, and the round-2 probe bites. |
| U7-P3 | `printf '+ a \xe2\x80\x94 b\n' \| perl -CSD -ne ...` | `1`; the head diff over the hand-edited paths reads `0`; `src/ui/describe-mcp-assets.js`'s added lines read `0` too |
| U7-12 | not re-run as a mutation; the comparison shape is the row's own, both sides read `6` at head, and `persist.js:376-386` carries the v5/v6 history the document now states |

### The poster-strip cap (brief item 5), checked arithmetic

Recomputed independently in Python by a different matrix route (sRGB linear to XYZ D65, then
Ottosson's XYZ-to-LMS `M1`), not the direct sRGB-to-LMS matrices the test's `jjOwnChroma` uses:

```
#C49F60  chroma 0.092214  t 0.555496  cap 40.555
#D5BE98  chroma 0.057126  t 0.285585  cap 37.856
```

The test's route gives 40.5596 and 37.8611. The 5e-3 gap is the two matrix paths' rounding, not a
fitted number. `posterStripDominantCap` at `src/ui/app-helpers.mjs:637-641` is
`LOW + clamp((c - CAP_LOW) / (CAP_HIGH - CAP_LOW)) * (HIGH - LOW)` with `LOW 35`, `HIGH 45`,
`CAP_LOW 0.02`, `CAP_HIGH 0.15`, which is the arithmetic the tests re-express. The prediction is
computed from the hex and the exported endpoints, and the assertion on the key (`=== "#C49F60"`,
the palette's real `anchor` per `src/ui/categories/literature.js`, secondary, colorRole dominant)
is the one that pins which colour the strip reads. Both `(jj)` and `test/ui/poster-strip.mjs` carry
the same three-step shape. Not a finding.

## Scope wall, U7-P4 under revision 32

`git diff --name-only de1bafef` at head lists 19 paths. Twelve are on the declared list. Two are
generated artifacts named with their generator in handoff §6 and §8d (`figma/plugin/ui.html` via
`gen:figma-ui`; `src/ui/describe-mcp-assets.js` via `scripts/gen-describe-mcp-assets.mjs` inside
`gen:mcp-assets`). Five are out-of-wall repairs under revision 32's second half, each named in
handoff §8d with its cause. Controls at UB `de1bafef` that I reproduced myself in the `ub` clone,
not read from the handoff:

| path | my control at `de1bafef` | result |
|---|---|---|
| `.sdlc/baseline.md` | `sh .sdlc/checks/baseline-agrees-check.sh` | `ok    ui.html: baseline 4111.1 KB, tree 4111.1 KB`, `stale total: 0` |
| `test/ui/shell.mjs` | `node test/ui/shell.mjs` | `PASS: ui-app pure core + shell clear the checkable predicates`, exit 0 |
| `test/ui/poster-strip.mjs` | `node test/ui/poster-strip.mjs` | `poster-strip PASS: ...`, exit 0 |
| `docs/reference/references/component-inventory.md` | `node test/repo/citations.mjs` | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD de1bafef)` |
| `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md` | same run | same line |

The citation repairs were checked by word-diff: each moved number is a line shift (+14 in
`color.js`, +39 in `model.mjs`), and the three em dashes swapped for colons or semicolons change
punctuation only. U7-13's generator was rerun in a head clone: `npm run gen:preview` exits 0 and
`git status --short` is empty. The row's own control (an unnamed path reds it) still holds since
the table is exhaustive over the 19 paths. U7-P4 🟢 under revision 32.

## The post-run edit (team-lead item 2)

Run at `9ecd071e` in the `neg` clone, one at a time on the guard: `test/repo/citations.mjs`
`✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 9ecd071e)` exit 0;
`test/repo/branding.mjs` `branding: clean (553 files scanned)` exit 0;
`test/repo/doc-mutation-lane.mjs` `doc-mutation-lane: clean (7 files scanned)` exit 0. The
`285f66ec` delta is `test/ui/shell.mjs` and the handoff; `test/ui/shell.mjs` at `285f66ec` reads
`PASS`, exit 0 (`s285_shell`). The builder's run 3 at `1b1fb33a` covers everything but the handoff
commit, which only `branding.mjs` reads, and that was clean at the prior head over the same
directory.

## Spot checks, all green

| row | reading at head |
|---|---|
| U7-5 | `awk '/^- C11 /,/^- C12 /' ... \| grep -c 364` prints `1`; the bullet names 364 as the gate's own, keeps 373 ± 5 labelled as the prototype's, cites Q3 (b) |
| U7-6 | `#725` 2 in `decision-records.md`, 2 in `CHANGELOG.md`; `#701` 2 and 3 |
| U7-7 | `1`; the C6 continuation bullet quotes the ruling and cites the questions file |
| U7-12 | both read `6`; the document's v5/v6 account matches `src/ui/persist.js:376-386` and the two commits that bumped it (`57f0511b`, `e0e22ae0`) |
| U7-14 | `0` and `38` |
| U7-P3 | `0` |
| U7-P2 | `branding: clean (553 files scanned)` |

Standing traps observed: nothing in `.sdlc/adapter.md` reported; no reading offered for the ceiling
series; `rampChromaOf`/`projectView` used, never raw `palette.chroma`.

## What I did not do

No `npm test`, no `npm run build`, no smoke. No edits, commits or pushes. The C11 count 364/363
was not re-derived by a third method; the planner's and the builder's readings agree and the
pre-#681 fixture control (0 under 30 L*, 1,816 exceptions) is in the gate itself, which I did not
mutate beyond the list swaps above. The time cost of the corpus leg (~24 s CPU) was not
re-measured; it belongs with #713.

## Verdict

**FIX-FIRST.** F1 blocks: a probe the unit repaired under revision 32 was made vacuous by that
repair, and the handoff states the opposite; the fix is one comparison re-based the way line 98
already is, plus the handoff sentence. F2 blocks on the record, not the code: a Blast radius row
naming the New-Palette derivation consumers with the measured figures, and the owner's word that
the derivation following the sampled colour is intended. F3 is a suspicion and carries nothing.
