---
kind: handoff
unit: pif-u5-records (plan preset-intent-fidelity, ticket #681, unit U5)
written: 2026-09-20
branch: unit/pif-u5-records
base: a2bb3c848ec9423bbec534559f9a8bcf0da22a17 (plan/preset-intent-fidelity, U4 merged)
head: resolve with `git log -1 --format=%H unit/pif-u5-records`; a commit cannot name its own sha
---

# U5: records

Brings every record the plan's U5 paragraph names into line with what shipped, plus the
carry-forwards that accumulated after that paragraph was written. Nothing here changes engine or
test source. Two items could not be made true inside this lane and are named in §6.

## 1. Next action for the Orchestrator

| # | Action | Why |
|---|---|---|
| 1 | Nothing | Every action this section once listed is discharged at this head, and the one open question is answered and tracked. No seat is waiting on this unit |

The two actions this section asked for while the unit was mid-flight, and where each was
discharged, so the next reader does not re-do them:

| Was asked | Discharged by |
|---|---|
| Commit the staged `origin/main` merge with a `Seat: orchestrator` trailer | `e69dfb0b`. It is the direct parent of this record's own first commit, so the record was already asking for something its own parent had done |
| Route §5's C1 and C10 wording to the Conductor | Plan revisions 27 (`b25e4ea5`) and 29 (`71c7c792`). Revision 28 (`adcd93fc`) answered §6's adia question the same way |

## 2. Why this unit merged `origin/main`

Not optional, and not cosmetic. The base `a2bb3c84` carries main at `3ce50daa`; main is now
`e9850935` (`git rev-parse origin/main`, confirmed after a fetch), and #709 landed two things this
unit's own definition of done depends on.

| # | What #709 changed | Consequence for U5 |
|---|---|---|
| 1 | `.sdlc/checks/baseline-agrees-check.sh` turned the same-tree row from a counting `STALE` into a non-counting `note head:` | On the base's older copy the brief's required `exit 0` is unreachable on ANY branch, because a unit branch's tree always differs from a main ref |
| 2 | `.sdlc/baseline.md` rewritten: five gate rows (adds `gate:corpus-contrast` and `gen:type-fonts`), an `extended:` frontmatter field, a correction block | Editing the base's three-row copy would put the tests-49 and ui.html repairs on a version main has already replaced, and would conflict at land |

The merge is commit `e69dfb0b`. This builder resolved and staged it; the lane's orchestrator seat
committed it, because the commit-msg hook refuses a builder who commits `.sdlc/board.md` and a merge
commit cannot leave a path out of its staged set. One conflict, `.sdlc/board.md`, purely additive on both sides,
resolved as the union with no row's text edited: main's `records-followup` rows first, then this
plan's five `preset-intent-fidelity` rows, matching the landed-first order the rows above already
read in. `git diff --stat a2bb3c84 e69dfb0b -- src test docs scripts figma mcp` is empty, so the
merge moves no source and no docs file.

## 3. Records touched, and what changed in each

### `docs/` (the C6 (iii) list: every path in `git diff --stat origin/main -- docs/`, with its reason)

| Path | Reason |
|---|---|
| `docs/reference/references/knowledge-02-tonal-scale.md` | §2 gains `anchor`/`sourceAnchor`; §4 pins `toneAt`'s shipped form and names `anchorLerp` as the anchored replacement; §5's `m` formula replaced by the shared `chromaEnvelope` with its three load-bearing properties; §8.3 rewritten from the retired OKHSL ladder to U6's CIE-L\* equal-compress, hold-chroma construction with the U4 widening search, worked example regenerated from this tree; new §9 "Anchored palettes" |
| `docs/reference/references/glossary.md` | New **Anchor** row; `Lift`, `Prime fill`, `dampAmp` and `Differential damping` rows corrected; the `On-color` row's ADR-003-only claim corrected to ADR-025 (see §7) |
| `docs/reference/rubrics/acceptance-criteria.md` | New **AC-T6**: the anchored predicate is equality, not a tolerance |
| `docs/reference/rubrics/quality-rubric.md` | B2 gains the one-envelope bullet and the anchored-equality bullet; "a document that states an anchor within N L\* is wrong, not merely imprecise" |
| `docs/reference/CHANGELOG.md` | New top entry, **1.64** (not 1.62, see §5) |
| `docs/reference/references/decision-records.md` | New **ADR-026** (not ADR-025, see §5) "A palette's anchor is STORED, not fitted", appended before the Quick map, plus its Quick-map row |
| `docs/spec/spec-muted-base-key-spikes.md` | 0.3.2 to **0.4.0**: REQ-050/051/051a/052/053/053a re-based on the shipped construction, EX-4/EX-4b/EX-5/EX-6 regenerated from the engine, AC-050's gate table restated, R1 amended a third time |
| `docs/lld/lld-muted-base-key-spikes.md` | 0.3.0 to **0.4.0**: the `prime.mjs` pseudocode block rewritten to the shipped function, Risk 4's redistribution narrative superseded with re-measured numbers, Risk 5 restated in CAM16 terms |
| `docs/spec/spec-panda-park-ui-exports.md` | 0.3.0 to **0.3.1**: EX-1's three `prime.*` literals regenerated, plus seven further stale EX-1/EX-2 literals and one false prose sentence (see §7) |
| `docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs` | NOT edited by this unit. They appear in the diff because U3's envelope moved their values and `gen:adia-exports` regenerated them, which is C6 (iii)'s own named expectation. The tag-note item is in §6 |
| `docs/reference/data/role-table.json` | NOT edited by this unit. U1's 16 `defaults[].anchor` fields, which is exactly what C9 expects of it (+16 lines, no other change) |
| `docs/lld/app-shell.md`, `docs/reference/SKILL.md`, `docs/reference/references/component-inventory.md`, `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,02-sections-and-resolvers,03-stores-and-persistence,04-context-and-messaging}.md` | NOT edited by this unit. These are the seven documents carrying U4's citation re-pins, moved because `src/ui/app.js`, `test/engine/tonal.mjs`, `src/engine/tonal.js`, `src/ui/model.mjs` and `src/ui/persist.js` grew by different amounts on the two merge parents. U5's contribution is the LEDGER for them in `.sdlc/handoffs/pif-u4.md` (§4), not an edit to the documents; `node test/repo/citations.mjs` reads `STALE 0` over all of them |

That is all 19 paths in `git diff --name-only origin/main -- docs/`, each with its reason, as
C6 (iii) requires.

`.claude/skills/color-math/SKILL.md` and `references/foundations.md` are outside `docs/` but on the
plan's list: the two-path warning becomes a four-branch warning with the anchor rule and the named
regressions each shortcut reproduces, and the `m` formula is replaced by `chromaEnvelope` with the
`liftStop` and `env(anchorStop) = 1` properties stated.

### 3.1 The one generator line (plan revision 28, C9)

`scripts/gen-adia-derived-exports.mjs` is neither engine nor test, and this unit's lane otherwise
stops at records. The edit is made only because C9 as restated at revision 28 names that file. Both
`ARTIFACTS` rows move `version: "1.1.0"` to `"1.2.0"`, with one comment above them saying why. The
1.1.0 comment stays as the history of 1.1.0, per the ruling.

Why `minor` and not `major`. The #631 policy's three cases, quoted from the generator's own
`BUMP POLICY` block under the verbatim-quote rule, one span per source line with the `//   ` leading
whitespace kept:
`//   patch  provenance/comment-only change, exporter bytes identical.`
`//   minor  the same document re-exported under a bumped EXPORT_SCHEMA_VERSION or a new`
``//          `adia-brand-document` tag.`` (altered: fenced with a double backtick because the line
itself carries backticks; its bytes are unchanged)
`//   major  a shape change a consumer's byte-compare cannot absorb (format keys renamed/removed).`

`patch` is excluded by its own words, since the exporter bytes are not identical. `major` asks
whether a shape change defeats a consumer's byte-compare. A byte-compare does break here, because
token values moved, but the SHAPE it compares does not, which is what that case turns on. Measured
by this builder against `origin/main` rather than cited: the radix artifact has 2,909 `key: value`
entries on both sides, the key sequence is identical, 797 values differ, and every one of the 797 is
an `oklch(...)` string replaced by another `oklch(...)` string, with zero moves of any other kind. No
key, name or ordering moved. So `minor`, which is also the only reading consistent with C9's own
arithmetic: three existing tags at 1.0.0 plus two at the new version is the five `adia-*` tags it
expects.

`SOURCE_TAG` stays `adia-brand-document@1.0.0` and `SOURCE_COMMIT` stays `770297b`, both still true:
`git diff --stat origin/main -- docs/reference/colors/categories/brands.json` prints nothing, so the
source document did not move and no document tag is cut.

After `npm run gen:adia-exports` the diff in each artifact is exactly one line, the version inside
its own generated provenance block: `/* adia-oklch-export 1.2.0` and `/* adia-radix-export 1.2.0`.
No token value moves in this commit; those had already moved when U3's envelope landed. Tags are cut
at the squash per the #631 procedure, not by this unit.

One thing the ruling settles in practice that the file does not say in its own words, raised here
rather than fixed, because widening a policy block is a bigger edit than C9 authorises. All three
cases above describe a change this bump is not: the same document, at the same
`EXPORT_SCHEMA_VERSION`, whose values moved because the ENGINE under it changed. The policy never
anticipated that, revision 28 ruled it a `minor`, and the 1.2.0 comment records the reasoning. The
`minor` line should gain that fourth case, and whoever picks it up can do it in one line. The p2
session raised this point independently before it was stood down; the reading of the policy block
above is this builder's own.

### `.sdlc/`

| Path | What changed |
|---|---|
| `.sdlc/baseline.md` | `npm test` summary 48 to **49** files, quoted byte for byte from this unit's own run; `npm run build` ui.html **3780.5 to 4111.1 KB**; both cells marked as re-measured rather than silently overwritten; new **§Interim gate-time ceiling (INTERIM, #713)**; a dated correction paragraph. `ref:` deliberately left at `origin/main @ 20298cc` |
| `.sdlc/adapter.md` | The `test` gate row's Time cell and the budget note now cite the interim ceiling and #713, superseding the stale 90 to 175 s range. The `56 to 60 s` prefix is untouched on purpose: `baseline-agrees-check.sh` parses it against the baseline's own seconds column |
| `.sdlc/handoffs/pif-u4.md` | Five repairs, below |
| `.sdlc/questions/pif-u5-board-seat.md` | New: the board-seat question for the merge commit |
| `.sdlc/checks/ceiling-counts-check.mjs` | New. Re-derives the ceiling section's counts and its graded/explicit/unsupportable partition from the reading rows and checks the prose and the adapter's pointer against them. Written because the same section shipped three count defects in three passes, the last of which no total could see. Negative control constructed, see §8 |
| `.sdlc/records/pif-u5-gate-logs/` | New. The raw logs behind the two R13-graded readings, `r13-326s-sync-tree-8f037dd2.txt` and `r13-553s-unit-branch.log`. Committed because the 716.04 s reading spent a verdict cycle as a suspected phantom purely for want of a source in the tree: its run was real and its evidence sat in `/tmp`. A graded figure with no committed log is the same defect waiting to recur, and the 326 s reading's log was on a scratch branch that is not an ancestor of this one |

The four stale lines the U4 verdict named, each re-derived rather than copied:

1. **Pass-5 scope sentence** now lists the six `FLOORS.even` re-pins it omitted while its commit
   subject said records-only: Secondary light 5.6 (5.6078), Success light 7.7 (7.7219), Warning dark
   5.3 (5.3334), Data 1 light 6.3 (6.3149), Data 3 light 6.5 (6.5224), Data 5 light 5.8 (5.8350).
   Read out of `test/engine/semantic.mjs`'s own `FLOORS.even` block in this tree, not from the brief.
2. **41-cell table**, `even Success light`: integrated value 7.6 to **7.7**, matching the pin.
3. **§7.6 `cells failing` column**: it counted rows where the prose counted readings. Re-derived from
   the tables' own percentages against C6's own targets: after, perceptual **6** (was 7), peak **5**
   (was 3), even 3 unchanged, total 14 of 24; before, perceptual **2** (was 1), total 2 of 24. Both
   totals now agree with the prose and with the verifier.
4. **Row 20 wording**: the claim that reproducing the peak-cap trade figures needs an engine change is
   withdrawn. A scratch copy of `src/` does it, and the measured figures are recorded: capped n 702,
   tone error over 0.01 L\* on 249 (35.5%), max 0.0848, hue residual max 24.6211 deg, gap below anchor
   max 1.6578 C; anchors stripped, n 1,412, 23.6%, max 0.0945, 24.6211 deg.

Plus the frontmatter (its false "this record's own commit is the LAST one" self-description replaced,
round history extended past pass 5), **#715 cited beside rows 13, 20 and 25**, and the re-pin ledger.

## 4. The re-pin ledger: 46, and why not 40

The ledger in `.sdlc/handoffs/pif-u4.md` now lists every re-pinned citation one per line with old
value at each parent, new value, and the anchor it lands on at head, plus the tenth re-pin
(`shadcn-baseline.css`'s three `export schema 2` to `3` stamps, mechanism: main's #638 bumped
`EXPORT_SCHEMA_VERSION` from 2 to 3).

Derived independently with the repo's own parser (`scripts/audit-citations.mjs`'s `parseCitations`),
not read off the eight the merging builder listed. My count is **46**, the verifier's was 40, and the
difference is two named, reproducible counter differences rather than a disagreement about facts:

- `docs/lld/app-shell.md` carries six BARE citations (`:1641` and friends) whose file is implied. The
  repo's parser resolves them and the gate audits them, so they are re-pins by the same definition; a
  counter that requires an explicit filename sees 6 of that file's 12.
- Two further differences of one each, pointing in OPPOSITE directions, so they cancel and leave the
  total where it was. Inside a slash or comma list (`app.js:2458/2490`) the repo's parser yields one
  citation per member, so the expanded count reads 5 in `02-sections-and-resolvers.md` against the
  verifier's 4: one MORE, and collapsing that list is what closes it. The other goes the other way:
  `04-context-and-messaging.md` reads 16 against the verifier's 17, one FEWER, which list collapsing
  cannot cause, since collapsing can only lower a count. That second one is a difference in the other
  counter, not in this one. Net across the three documents, `app-shell.md` +6,
  `02-sections-and-resolvers.md` +1, `04-context-and-messaging.md` -1, which is +6.

  An earlier draft of this paragraph had both directions backwards, which review 1 caught (F4). The
  per-document figures above are this builder's own, from the ledger's 46 rows grouped by citing
  document, against the verifier's list in `.sdlc/verdicts/pif-u4.md` row 7.

46 minus those 6 bare forms is 40. Every row reproduces at head either way, and
`node test/repo/citations.mjs` reads `STALE 0 across 10 discovered docs`.

## 5. Plan wording this unit proposed, and what became of it

Everything this section once proposed has landed in `.sdlc/plans/preset-intent-fidelity.md`. It is
now a record of what was wrong and which revision fixed it, not an open ask.

### C10: three clauses that could not discriminate, all three re-needled

C10 requires each grep to be non-zero on the branch **and zero on `origin/main`**. Three clauses
failed that preamble. Two were id collisions, found by this unit and applied as revision 27:

| C10 grep | State on `origin/main` | Cause |
|---|---|---|
| `grep -c "^## ADR-025" docs/reference/references/decision-records.md` | **1**, and it already precedes `## Quick map` | ADR-025 is "WCAG-safe on-colors are the DEFAULT", landed by #662 after this plan's text was written. The last ADR when C10 was drafted was ADR-024 |
| `grep -c "^## 1.62" docs/reference/CHANGELOG.md` | **1** | 1.62 is "travel's curated hexes are rendered from their OKLCH again" (#656); 1.63 is #662's. The plan's own risk table records both as landed, but C10's numbers were not moved with them |

This unit therefore wrote **ADR-026** and **CHANGELOG 1.64**, the next free ids, and proposed the
matching C10 wording:

> `grep -c "^## ADR-026" docs/reference/references/decision-records.md` = 1 and it precedes
> `## Quick map`; `grep -c "^## 1.64" docs/reference/CHANGELOG.md` = 1.

Revision 27 applied exactly that, and both clauses now discriminate at this head (§8).

#### The third clause: the color-math needle, re-needled at revision 29

Review 1 (F5) found a third clause of the same shape, after the two ids had been fixed: the clause
met its own threshold on `origin/main`, so it separated nothing this plan did.

| C10 clause | `origin/main` | This branch | Why it failed the preamble |
|---|---|---|---|
| was `grep -ci "anchor" .claude/skills/color-math/SKILL.md` >= 3 | **12** | 29 | The skill has used the word since long before #681, so 12 clears a >= 3 bar with no work done at all |
| now `grep -c "palette.anchor" .claude/skills/color-math/SKILL.md` >= 2 | **0** | 3 | `palette.anchor` is the field #681 added, so only text about the anchored branch can satisfy it |

The plan picked that needle at revision 29, so nothing was left for this unit to propose; what was
left was checking that it works. Measured here at this head rather than taken from the review or the
plan: 0 on `origin/main`, 3 on the branch, at `.claude/skills/color-math/SKILL.md:50`, `:54` and
`:55`, all three inside the section this unit added for the anchored branch, whose opening line is
`:50`. Two notes for the next reader, neither a defect: `grep -c` counts matching LINES rather than
occurrences, so the margin over `>= 2` is one line and a future trim of that section could reach the
bar; and the `.` in the needle is an unescaped regex dot, harmless here because every match is the
literal `palette.anchor`.

The count, stated in the plan's own sense because getting it wrong was the whole of F5. Revision 29's
own row reads: C10 has **six** clauses, **two** moved to ADR-026 and 1.64 at revision 27, **one**
re-needled at 29, **three** unchanged. An earlier draft of this section said "the other three pass as
written", which conflated the three untouched clauses with the number of clauses left to check after
the two ids moved, which was four. Six total, three re-needled across revisions 27 and 29, three
never touched. All six are verified in both directions in §8.

### C1 amendment: the interim gate-time ceiling, applied at revision 27

Verbatim owner ruling, 2026-09-20, ticket #713: "Interim ceiling now, split sweeps into gate scripts
as a new ticket (Recommended)". The text this unit proposed for C1, which revision 27 applied in a
condensed form keeping `.sdlc/baseline.md` as the one home for the readings:

> Gate time is under an INTERIM ceiling (owner ruling 2026-09-20, #713): `npm test` is expected
> between **280 and 550 s** on a host at load under about 10. It is interim by the ruling's own terms
> and is re-measured, not renewed, when #713 splits the corpus sweeps into gate scripts. Four files
> carry almost the whole suite, measured sequentially in the foreground at `bf62ee30` at load 5.16
> over 48 files: `engine/tonal.mjs` 100.2 s, `engine/anchor.mjs` 80.0 s, `ui/headless-boot.mjs`
> 61.0 s, `engine/prime.mjs` 54.9 s, every other file under 10 s. The whole-suite readings behind the
> range, stated as the spread they are: 284 s and 344 s across this round's own runs at loads in the
> 3.9 to 9.4 band, 293.09 s at load 9.42 (U4 round 4), 318.52 s (the verifier's), 430.46 s at load
> 5.18 at the main-merge commit with 49 files, 518.66 s at load 6.56 and 649 s at a load that rose
> from 9.42 to 33.98 (U5's own two runs, 49 files), and 780.23 s at a load that peaked near 63 (the
> verifier's pass 7). A reading past the ceiling is a contention question first, per `flaky-gates`,
> and only then a regression question: the series is monotone in host load, which is what contention
> looks like and what a fixed regression would not. Neither reading above the band was taken at a
> load under 10 throughout, so neither contradicts it; that this host rarely holds under 10 for the
> nine minutes the suite needs is an argument for #713, not for a wider ceiling.

The same text, expanded, is already in `.sdlc/baseline.md` §Interim gate-time ceiling, which the
adapter's `test` row now points at.

### Adapter `C<n>` to `X<n>` cross-references: none owed

Checked every record this unit owns. Every `C<n>` token in them is a **plan criterion id** (#681's
C1 to C12) or a survey claim id, not one of the adapter conflict rows main renamed at #691. The only
adapter-id mention in the set already reads `X1-X13` (`.sdlc/handoffs/pif-u4.md`, the main-merge
section). Nothing to rename; recorded so the next reader does not re-check.

## 6. What could not be made true in this lane

| # | Item | Why, and what it would take |
|---|---|---|
| 1 | The `origin/main` merge could not be committed by this builder | DISCHARGED, kept here as the finding and its answer. The commit-msg hook prints `only the orchestrator commits the board (got Seat: builder)`, a builder never signs `Seat: orchestrator` (the ruling in `records-followup-U9-board-seat.md`), and a merge commit cannot leave a path out of its staged set. The lane's orchestrator seat committed it as `e69dfb0b`, the direct parent of this record's own first commit, so nothing is outstanding |
| 2 | `docs/reference/data/adia-*` tag notes | The provenance headers are GENERATED; a hand edit is erased by the next `npm run gen:adia-exports`. Their values live in `scripts/gen-adia-derived-exports.mjs`, outside a docs lane. Two substantive problems for the Conductor, neither a docs edit: (a) that file's `1.1.0` rationale comment says "no token value, name or ordering changed", which is FALSE on this branch, since #681 moved the token values, so under the file's own bump policy the artifacts are due another minor bump; (b) C9 expects `git tag --list 'adia-*@1.1.0'` to print three lines including `adia-brand-document@1.1.0`, but `docs/reference/colors/categories/brands.json` is byte-identical to `origin/main`, so the SOURCE document did not change and `SOURCE_TAG adia-brand-document@1.0.0` with `SOURCE_COMMIT 770297b` is still true. Either C9's three-tag expectation or the generator's version constants is wrong; a builder cannot pick. RESOLVED by plan revision 28 (`adcd93fc`): no document tag is cut, and the two derived exports take their next version for the changed values. Applied in §3.1 |
| 3 | C1's load threshold in the plan disagrees with R13 | Raised by review 3's row 26 and NOT fixable here, because `.sdlc/plans/` is not this unit's to edit. C1 at the plan tip reads `A run at load 10 or above is recorded with its load and not graded against the ceiling.`; R13 on `origin/main` reads `A run at load 5 or above is recorded with its load and not graded.` `.sdlc/baseline.md` applies R13's threshold, which is the later ruling, and cites R13 by name; the plan's wording is the one this unit proposed at revision 27, before R13 existed. A later reader grading against C1 alone would grade a load-7 run that R13 exempts. One line for the Conductor, in the plan, not here |

## 7. Scope I extended beyond the plan paragraph, and why

Each of these is inside a file the plan already assigns to this unit, and each is a statement that is
outright false against the tree rather than merely dated.

1. **`docs/spec/spec-panda-park-ui-exports.md`, seven more literals and one sentence.** The plan names
   only EX-1's three `prime.*` literals. On inspection EX-1 and EX-2 carry seven further stale values
   and a sentence claiming "the RAMP stops (500/050/950/scrim) and every other default family's prime
   are untouched by #681", which described U1 alone and is false once U2, U3 and U6 integrated. All
   seven are re-pinned to the values `test/engine/exports.mjs` already asserts green at this head
   (`primary["500"]`, `neutral["500"]`, `primary.scrim["300"]`, EX-2's `primary.DEFAULT`,
   `primary.hover`, `primary["on-primary"]._dark`, `neutral.scrim` base, `data-1.DEFAULT.base`), and
   a check confirms every `oklch(...)` value the gate pins now appears in the spec. Leaving seven
   false literals in a NORMATIVE block I was editing anyway would have been a half-repair.
2. **`glossary.md`'s `On-color` row** stated the ADR-003 fixed policy as current. ADR-025 made
   `contrast` the default at #662. One clause, corrected.
3. **`.sdlc/adapter.md`** was not on the plan's list, but its `test` row carried a 90 to 175 s range
   that every reading since integration exceeds. The stale range is superseded in place, pointing at
   the baseline's new section; the machine-parsed `56 to 60 s` prefix is untouched.

## 8. Gates

All run in this worktree, in the foreground, blocking, with load recorded. Every span below that
holds program output is copied from that program's own output in this worktree, never from another
record, and keeps the leading whitespace the program printed; where a quote is cut, the cell says
so next to it (`.sdlc/adapter.md` §3, Verbatim-quote rule).

| Gate | Result |
|---|---|
| `npm test`, run 1 (mid-unit) | `✓ all 49 test files passed`, 0 FAIL lines. Wall **518.66 s** (`time`'s own line, `npm test >  2>&1  524.72s user 6.70s system 102% cpu 8:38.66 total`). Load 6.56 / 14.82 / 20.43 at start, 9.85 / 10.04 / 15.18 at end |
| `npm test`, run 2 (final tree) | **exit 0**, `✓ all 49 test files passed`. Wall **649 s**. Load `9.42 / 10.69 / 13.38` at start, `33.98 / 19.23 / 15.70` at end. Above the proposed band, and reported as such: the host's 1-minute load more than tripled during the run, so it was never under 10 throughout. Recorded in the baseline's own reading series rather than dropped |
| `npm test`, run 3 (the committed tree) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **889.89 s** (`time`'s own line: `npm test  784.04s user 18.80s system 90% cpu 14:49.89 total`). Load `79.53 120.51 112.94` at start, `24.79 37.01 60.62` at end. Recorded as contention, not as a gate reading, and added to the ceiling series flagged that way: the host was carrying five other heavy runs and the process held 90% of one CPU. The suite's verdict, exit 0 with 49 of 49, is unaffected. The lead's standing instruction was to read `uptime` first and either wait for the load to fall or run and record the conditions; load had sat between 88 and 233 for the whole session under other projects' work, so waiting was unbounded and this unit ran and recorded |
| `npm test`, run 4 (the committed tree) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **705.01 s** (`time`'s own line: `npm test  682.61s user 10.48s system 98% cpu 11:45.01 total`). Load `5.42 19.69 47.04` at start, `14.67 20.63 32.21` at end. Taken in the first window all day with the 1-minute load under 10 at the start and no other suite running, checked with `pgrep` before starting per the owner's one-at-a-time convention. At 98% of one CPU it is the least contended of this unit's four runs, and it is still 155 s above the ceiling's band. Recorded in the series as the reading #713 or #718 should re-measure first, not used to move the ceiling, which is not this unit's to move |
| `npm test`, run 5 (the committed tree) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **647.42 s** (`time`'s own line: `npm test  632.26s user 12.01s system 99% cpu 10:47.42 total`). Load `7.70 14.75 27.35` at start, `11.82 12.27 18.96` at end. The cleanest run of the five: the host to itself at 99% of one CPU, started only after waiting for another seat's suite in `scratchpad/rv2` to finish, per the owner's one-at-a-time convention. Still 97 s above the ceiling's band |
| `npm test`, run 6 (the committed tree, round 3) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **592.17 s** (`time`'s own line: `npm test  591.84s user 10.67s system 101% cpu 9:52.17 total`). Load `7.94 10.73 15.56` at start, `13.79 12.06 13.48` at end. Started only after waiting 255 s for another seat's suite in `scratchpad/rv3` to finish, per the owner's one-at-a-time convention. The only run in the series to exceed one core, and the first to complete inside the 600 s tool timeout without the harness backgrounding it |
| `npm test`, run 7 (the committed tree, round 3 fold-in) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **747.27 s** (`time`'s own line: `npm test  698.47s user 17.98s system 95% cpu 12:27.27 total`). Load `16.81 13.92 13.75` at start, `26.00 20.09 17.79` at end. `pgrep` found no competing suite, so the one-at-a-time convention held, but the host's own load was already above 10, so this is not a clean-conditions reading and is not offered as one |
| `npm test`, run 8 (the committed tree, R13 fold-in) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **795.49 s** (`time`'s own line: `npm test  725.42s user 21.05s system 93% cpu 13:15.49 total`). Load `17.27 20.56 18.53` at start, `23.58 34.77 34.36` at end. Started at load 17.27, so under R13 it is recorded and not graded, and it was safe to run without burning the quiet window #681's pre-land needs |
| `npm test`, run 9 (the committed tree, R8 pass) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **553.45 s**, both evidence lines from the run's own output per the evidence rule: `npm test  553.58s user 9.44s system 101% cpu 9:13.45 total` and `UPTIME BEFORE: 16:53  up 12 days, 22:50, 16 users, load averages: 4.63 4.88 10.76`. Started at load **4.63**, so this is the first reading in the whole series that R13 GRADES rather than records, and it lands 3.45 s above the band's 550 s top. Taken unintentionally in a sub-5 window: `uptime` read 5.17 when this builder checked immediately before starting, and had fallen to 4.63 by the time the run itself sampled it. Reported to the lead as soon as the run's own output showed it, because the standing order for #681's pre-land was waiting on that window. It does not substitute for that run, which R13 needs on the sync tree at `8f037dd2`, not on this unit branch. The worry that it had cost the pre-land its window proved unfounded, and the correction is recorded rather than quietly dropped: `scratchpad/r13-window-result.txt` gives that run's `post-run date: Sun Sep 20 16:52:04 PDT 2026`, so it had finished before this run sampled `16:53` |
| `npm test`, run 10 (the committed tree, R8 pass) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **1119.57 s**, both evidence lines from the run's own output: `npm test  821.74s user 25.47s system 75% cpu 18:39.57 total` and `UPTIME BEFORE: 17:36  up 12 days, 23:32, 15 users, load averages: 194.52 112.51 106.18`. Started at load 194.52, so recorded and not graded. Taken only after waiting out three other seats in turn, `rf-U11`, `gs-U4` and the pre-land run in `prepr3/clone`, per the owner's one-at-a-time convention; roughly 30 minutes of this unit's time went on that queue rather than on contending |
| Graded readings have committed sources | Both R13-graded readings cite a log committed under `.sdlc/records/pif-u5-gate-logs/`, not a scratchpad or `/tmp` path. `git ls-tree -r HEAD --name-only .sdlc/records/pif-u5-gate-logs/` prints both files |
| 🟡 A coverage gap found while checking the above, filed as **#724**, NOT fixed here | Adding two files under `.sdlc/` left `node test/repo/branding.mjs` reading `branding: clean (537 files scanned)`, exactly as before. The controlled comparison arrived by accident in the same pass and settles it: adding ONE more file to `.sdlc/`, the `.mjs` check below, moved the same count to `branding: clean (538 files scanned)`. Two `.txt` and `.log` files moved it by zero; one `.mjs` moved it by one. That unchanged count is not reassurance, it is the finding: the gate's own `TEXT` filter is `/\.(js\|mjs\|ts\|json\|html\|css\|md\|yml\|yaml\|svg\|webmanifest)$/`, so a `.txt` or `.log` file committed anywhere it walks, `.sdlc/` included, is never opened. The branding rule applies to every record in `.sdlc/`, but a raw gate log committed there could carry the retired maker brand and the gate would stay green. This unit just created the first such files, so the gap is newly reachable. Filed as **#724** rather than left as handoff prose, since a finding that lives only in a unit's handoff is discoverable by nobody after the plan archives. Not fixed here: widening the filter is a test change and this is a records lane. Two points belong to the ticket rather than to this unit. The gap was effectively unreachable until now, because nothing under `.sdlc/` was anything but markdown; and the evidence rule this plan just adopted, that a wall time enters a series only with its raw output attached, makes committed raw output NORMAL, so reachability increases from here rather than staying flat. The fix direction on the ticket is to invert the filter to a deny-list of binary extensions, so the next text type committed is covered without anyone having to remember it. One line for whoever picks it up. The two logs added here were checked by hand against all three patterns the gate defines at `test/repo/branding.mjs:71-75`, since the gate itself will not open them: the upper-case maker name, the maker domain and the pre-rename package identifier all read 0 in each file. The patterns are cited by line rather than quoted, because this record is itself scanned and writing them out turns the record into a violation, which is what a first draft of this cell did. A looser `grep -i brand` does match both logs, 5 times and 4, but every hit is a test or artifact NAME the runner printed, `mcp/brand-kit.mjs`, `repo/branding.mjs`, `categories/brands.js`. Recorded that way round because "no brand string" would have been false as stated |
| `npm test`, run 11 (the committed tree) | **exit 0**, `✓ all 49 test files passed`, 0 FAIL lines. Wall **1670.43 s**, its own two lines: `npm test  734.54s user 92.87s system 49% cpu 27:50.43 total` and `UPTIME BEFORE: 18:40  up 13 days, 37 mins, 11 users, load averages: 44.47 46.02 87.46`. Taken when `ps` showed no other suite running anywhere, which is why it was taken at all: the earlier passes had declined a full run while three seats' suites were executing, and this one closes that out over the final tree. Recorded and not graded, start load 44.47 |
| `node .sdlc/checks/ceiling-counts-check.mjs` | **exit 0**, `ceiling-counts: clean`, eleven assertions, and it earned its place in this table on first use. Recording run 11 added a reading, and the ad-hoc recount this builder had been running updated the totals but not the partition sentence. The check failed with `FAIL  prose 'other N' == total - graded  (prose 16, measured 17)` and `FAIL  prose explicit count == measured  (prose 13, measured 14)`, which is the exact defect class the verdict raised, caught in seconds by a script instead of in a review round by a person |
| `sh .sdlc/checks/baseline-agrees-check.sh` | **exit 0**. Eight `ok` rows, one `note` row, one total row; the two that carry the verdict, byte for byte including their column padding: `ok    head: baseline ref 20298cc is in origin/main's history` and `stale total: 0`. The expected non-counting row: `note  head: baseline ref 20298cc, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`. What this green does NOT say, stated because it is easy to read the wrong thing into it: the `time test` row proves only that `.sdlc/baseline.md` and `.sdlc/adapter.md` carry the SAME figure, not that 56 to 60 s is true at this head. The script has no reading of its own to compare against, and its `note head:` line is the standing admission of that. Nothing in this unit cites this green as evidence about gate timing; the timing evidence is the ceiling series and its recorded loads. #718 is ruled to teach the script the ceiling as its own labelled figure, as a small plan after #681 lands, and is not this unit's |
| `node test/repo/citations.mjs` | exit 0, last line `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD fad008c1)`. The gate prints whatever HEAD it ran at, and it ran at `fad008c1`, the commit this one replaces by amend, so the span is that run's real output rather than a sha rewritten to match the commit it sits in. The `STALE 0` is the part that carries the verdict, and it is unaffected by the amend, which moves no cited line |
| `node scripts/audit-citations.mjs` | `STALE 0` in every audited doc. `altered:` that is the recurring leading token of each per-doc summary line, not a whole line; a whole one reads `    STALE 0 | NEAR 1 | UNDECIDABLE 0 | OK 19 | NOFILE 0  (line counts, deduped)`, four leading spaces kept |
| `node test/repo/branding.mjs` | exit 0, `branding: clean (538 files scanned)`. It read 536 before this unit tracked `.sdlc/questions/pif-u5-concurrent-writer.md`; the gate walks the filesystem, so the count includes the file the unit itself adds |
| `node test/repo/doc-mutation-lane.mjs` | exit 0, `doc-mutation-lane: clean (7 files scanned)` |
| C10, all six clauses, branch against `origin/main` | Every clause re-measured here at this head after revisions 27 and 29, both directions, because a clause that is non-zero on main discriminates nothing and that was F5's whole finding. `^## ADR-026` 1 / 0, at line 730 with `## Quick map` at 765, so it precedes the map; `^## 1.64` 1 / 0; `^\| \*\*Anchor\*\*` in the glossary 1 / 0; `^## 9\. Anchored palettes` 1 / 0; `palette.anchor` in `color-math/SKILL.md` 3 / 0, the revision-29 needle, where the retired bare `anchor` read 29 / 12; `anchored palette` 3 / 0 in `acceptance-criteria.md` and 1 / 0 in `quality-rubric.md`. All six non-zero on the branch and zero on main, as C10's preamble requires. Re-checked after this round's edits, since C10's risk here is regression, not attainment |
| em dashes in added prose | 0 in every file this unit added lines to, including the subagent-authored spec and LLD amendments |

Eleven `npm test` runs, not the one the round-2 brief asked for. Disclosed rather than smoothed over:
runs 1 and 2 belong to the earlier rounds, runs 3, 4 and 5 were forced by ordering rather than
chosen, and runs 6 to 11 are the passes after it, each one because a further correction landed after the previous gate had already run; runs 9 and 10 follow the verdict's four red rows, run 10 because restoring the 716.04 s reading and recording the graded pair changed the records again after run 9 had gated them. The lead's corrections to the addendum, the ruling on the two-writer incident, the
attribution fix and the addition-3 line number all arrived after this unit had already run its gates
and committed, and every one of them changed a file. Re-running was the only way to leave a green
gate over the tree that actually landed.

Owner ruling on how these runs are taken, 2026-09-20: until a host-wide gate lock ships, one heavy
gate run at a time by convention, and read the load before starting. This unit read `uptime` before
each run and recorded both ends. For runs 3 and 4 it could not honour the one-at-a-time half, because
the contending runs were other seats' and other projects', not this unit's to schedule; that is the
gap the lock is for. Run 5 did honour it: `pgrep` found another seat's suite starting in
`scratchpad/rv2`, so this unit waited for that run to finish and only then started its own, which is
why run 5 is the cleanest reading in the ceiling series. The repeated runs here are the ordering's cost, not a second opinion sought on a red gate.

One limit on every row above, stated once because it is structural and not a lapse. A gate run
cannot cover the record of its own result: run 10 was taken over the tree as it stood before run
10's own row, its `1119.57 s` series reading, the adapter note's count, the two committed gate logs,
the narrowing of run 10's own framing and this paragraph were written. Rather than leave that as a hand-wave or chase it with an
eleventh run, this unit established which tests can see that delta at all.

`grep -rln "\.sdlc" test/ scripts/` returns seven files. Five are engine tests, `anchor.mjs`,
`tonal.mjs`, `exports.mjs`, `semantic.mjs` and `prime.mjs`, and in every one of them the match is a
COMMENT citing an `.sdlc/` document, not a read of it. The remaining two are
`scripts/audit-citations.mjs`, which `repo/citations.mjs` drives, and `scripts/gen-categories.mjs`.
`test/repo/gate-report.mjs` mentions neither `.sdlc`, the baseline nor the adapter. The tests that
actually read this directory are therefore exactly `repo/branding.mjs`, `repo/citations.mjs` and
`repo/doc-mutation-lane.mjs`, and all three were run directly against the final tree and are green,
as is `baseline-agrees-check.sh`. `branding.mjs` is the one that walks the filesystem, and it still
reads `branding: clean (538 files scanned)`: the two new log files are outside its scan and the one
new `.mjs` is inside it, which is the coverage gap recorded above.

The count checks are no longer a habit of this builder's, they are a
committed script: `.sdlc/checks/ceiling-counts-check.mjs`, run as `node
.sdlc/checks/ceiling-counts-check.mjs` from the repo root, exit 0 or 1 with one line per assertion.
It re-derives every figure from the reading rows and compares them against the prose and against
the adapter's pointer, eleven assertions, and prints the partition it measured.

It exists because three defects in this one section reached a verdict, and the third is the reason
it is a script: the readings were described as 2 graded plus "twelve" explicit plus 3
unsupportable, which is 17 against a series of 18, while every TOTAL in the section still agreed.
Checking totals does not check a partition. The script asserts both, plus the two adapter-pointer
figures that went stale twice.

Its failure case is constructed rather than assumed, per the pre-land brief's standard. Reverting
the word `thirteen` to `twelve` in `.sdlc/baseline.md` makes it print `FAIL  prose explicit count
== measured  (prose 12, measured 13)` and `FAIL  prose partition parts sum to 'other N'  (12 + 3 vs
16)`, and exit 1. It is not a vacuous gate.

That reasoning covered three passes in which a full run was declined
deliberately, and declared rather than implied, because other seats' suites were executing and a
fourth would have degraded their readings while exercising nothing the three `.sdlc` gates did not.
It is no longer load-bearing: run 11 is a full `npm test` over the final tree, taken once `ps`
showed the host clear, so the Verifier does not have to take that argument on trust. The only delta
after run 11 is run 11's own row, this paragraph, and the partition sentence the counts check
repaired, all prose in `.sdlc/*.md`.

Process notes, per the brief: every command ran in the foreground with `uptime` recorded either side,
no bare `git stash` was run. One exception, disclosed rather than hidden: each long `npm test` ran
past the 600 s tool timeout and the harness moved it to the background on its own. It was not
launched in the background, and it was not left unattended: the wait for it was a blocking watch on
its own log, and its exit code (0) and full output were read from the completed run's output file,
not inferred. Before the timed gate I
swept for CPU-holding leftovers; the `node` processes on this host all sat at 0.0% CPU and belong to
other projects, so none was reaped and none held the timing.

## 9. The two-writer incident, and why none of p2's prose is in this commit

Recorded in full because the file mtimes alone would mislead a later reader, and because the
question it raised (`.sdlc/questions/pif-u5-concurrent-writer.md`) is closed by a ruling that this
section has to be consistent with.

For about four minutes two builders were writing to this worktree. The lane lead had read this
builder's session-limit notice as a death and dispatched a second builder, p2, into the same tree.
This builder detected the second writer by watching the file's md5 change under it, stopped editing,
and raised the question rather than committing work it had not written.

The stand-down, attributed correctly because an earlier draft of this section did not. **The lane
lead**, not p2, performed the 14:23 revert. After killing p2 with `TaskStop` the lead copied both
handoffs to `scratchpad/p2-abandoned-pif-u4.md` and `-u5.md` and ran `git checkout` on them in this
worktree, because p2 had died mid-write and a half-finished edit cannot be audited more cheaply than
it can be redone. That revert also destroyed an earlier version of this very section, which this
builder had written at 14:22 and which the lead had no way of knowing was in those files. It was
recovered from the abandoned copies. The earlier draft of this section recorded the revert as p2's
last write; it was not p2's act at all, and the mtimes this builder measured (14:23:48 on both
handoffs and both copies) are the lead's `git checkout`, not a builder's write.

What this builder got wrong in between, stated plainly. Before the ruling arrived it read those
abandoned copies, re-measured every claim in them at this head, and committed round 2 built on that
recovered text at `183322211b0c5dfa295415f309bc4a50eebc363f`. Verifying each line was necessary but
not sufficient: the ruling is that a killed worker's edits are reverted and rewritten, not inherited
and checked, so that every line is signed by whoever wrote it. That commit was therefore rebuilt.
Both handoffs were restored from this builder's own pre-p2 text at `a9a36405`, and F2, F4 and F5
were written again from the review in this builder's own hand. The landed commit carries no prose of
p2's. The only place p2's words survive is the section of the question doc explicitly headed as its
own statement, which the ruling keeps on exactly that basis.

The measured facts p2 also reported were re-taken here rather than adopted, and each is cited at the
point it is used: the six C10 clauses in both directions (§8), the per-document citation counts
behind the 46-versus-40 reconciliation (§4), `e69dfb0b`'s two parents and `Seat: orchestrator`
trailer (§2), and the artifact shape comparison behind `minor` (§3.1, measured here at 2,909 key
entries with an identical key sequence, which is this builder's own count and not p2's). Agreement
with p2 on a figure is not the reason any of them is stated; taking the reading is.

One timing correction. This builder earlier recorded p2's last write as 14:21:55 and attributed the
14:23 revert to p2. The ruling gives 14:22:19 and attributes the revert to the lead. What is
measurable at this head is only that both handoffs and both abandoned copies carry an mtime of
14:23:48 and that the two worktree files were byte-identical to HEAD afterwards, which fits the
ruling and not the earlier note. The ruling's account stands.

## 10. Instructions this unit received that were later corrected

Kept because a correction that leaves no trace is the defect this plan is about, and because the
next reader of these records should be able to see which figures were never measured.

| Instruction | What was wrong | Outcome |
|---|---|---|
| Round-2 addendum, addition 1 (timing): register `npm test` at 90 to 175 s in `.sdlc/baseline.md`'s Pass table | Withdrawn by the lead as issued wrong. The figure came from a recon that measured the plan tip, not this branch, and the caveat saying so was dropped on the way into the brief. Registering it would have regressed the owner's #713 interim ceiling of 280 to 550 s, and would have broken `.sdlc/checks/baseline-agrees-check.sh`, which needs three figures in that column and cross-checks it against the adapter `test` row's first `N to M s` match | Not done. The Pass table's `seconds` column and the adapter's `56 to 60 s` are untouched. This unit's gate run is recorded instead as one more reading in `.sdlc/baseline.md` §Interim gate-time ceiling, where the owner's ruling lives |
| Round-2 addendum, addition 1 (file count): register 49 test files | Already registered on this branch since `ac7af748` | Confirmed only, nothing changed. `baseline-agrees-check.sh` prints `ok    tests: baseline 49, test/run.mjs TESTS 49` |
| Round-2 addendum, addition 2: move U6's inlined gate detail out of the adapter's Time cell | Already honoured earlier in this unit, and a trap if taken further: `56 to 60 s` must stay that cell's FIRST `N to M s` match or the check exits 1 | Nothing owed, nothing done |
| Round-2 addendum, addition 3: fix the adapter's CI-jobs line, first cited as `:172`, then as `:192` | WITHDRAWN entirely by the lead, after this unit had already made the edit. The line number moved twice (main's 172 against this branch's 192) and the final ruling is that neither should change. Line 192 sits inside `.sdlc/adapter.md` §7, headed `## 7. Proposed \`## SDLC\` section for \`.claude/CLAUDE.md\`` and prefaced `Text only. A builder adds it in A7 (conflict X9 rules who edits the file).`, and §8's adoption table lists it at `:206` as `| CLAUDE.md \`## SDLC\` | insert section 7 text | S |`. It is a record of what was proposed and already adopted, not live instruction, and the live `.claude/CLAUDE.md:99` was inserted from it and corrected to three jobs afterwards. Editing it would falsify the record of the proposal, which is exactly why line 66's "Two jobs" row is preserved by line 74's Amendment | REVERTED. `.sdlc/adapter.md:192` is byte-identical to `a9a36405` in this commit; the file as a whole carries one later hunk, the §3 budget note's reading count, which review 3's row 25 required and which is described at the end of this section. Nothing is owed on addition 3. Recorded at length because the same trap caught three successive instructions: the obvious edit was the wrong one each time, and in two of the three the line cited was the historical record rather than the live text |
| Review 1 F5, as first briefed: propose a replacement needle for C10's color-math clause | Overtaken rather than wrong. Plan revision 29 had already picked `palette.anchor`, so proposing one would have offered a choice already made | Verified instead that the chosen needle discriminates: 3 on the branch, 0 on `origin/main` (§5) |
| The count "four" for C10's remaining clauses | Not the plan's own arithmetic. Revision 29's row states six clauses, two re-idded at revision 27, one re-needled at 29, three unchanged | §5 states it in the plan's sense and says which sense it means, since conflating remaining with total was the whole of F5 |

### The addition-3 line, settled: the stop was right and the restore was wrong

Recorded in full because this one question consumed three instructions in both directions and a
later reader should not re-open it.

Sequence. The edit to `.sdlc/adapter.md:192` was made at `66de9bd1`; a stop followed, reasoning
from §7's heading that the block is a preserved record; the edit was reverted at `27b26330`; review
2 overturned the stop, on the ground that the §7 block matched `.claude/CLAUDE.md`'s `## SDLC`
section in 22 of 23 lines and so must be a maintained mirror; a brief told this unit to restore the
edit and it did; review 2 then WITHDREW its own ruling, and the restore was reverted. The file is
byte-identical to `a9a36405` at line 192 and nothing is owed on addition 3.

One later edit does touch this file, so the blanket phrasing that stood here is now too strong and
is corrected rather than left to be found. Review 3's row 25 caught the budget note this unit added
in §3 describing the ceiling's evidence as "a seven-reading series from 284 s to 780 s that is
monotone in host load". All three figures were stale or wrong: the series holds 14 readings, its
maximum is 889.89 s, and the monotone-in-load claim is withdrawn in the baseline itself. The note
now reads `a 19-reading series from 284 s to 1670.43 s`, the count re-taken after this pass added a
reading, since fixing a stale count and then staling it again in the same pass is the failure this
whole section is about. So the invariant this unit is checked
against is line-specific from here: `git diff a9a36405 HEAD -- .sdlc/adapter.md` is NO LONGER empty,
and the one hunk it prints is that note. Line 192 is untouched, which is the thing the invariant
existed to protect, and `git show HEAD:.sdlc/adapter.md | sed -n '192p'` still reads two jobs.

What settled it was a measurement of the right quantity. Review 2 measured how SIMILAR the two
blocks are; what decides the question is whether the block ever MOVED. Content hashes, from review
3, which any reader can re-run:

| commit | §7 block | `CLAUDE.md` `## SDLC` |
|---|---|---|
| `180eca0e` (adoption) | `1a012fb378` | `ffe2ca1351` |
| `ac7af748` | `1a012fb378` | `04ec273805`, changed once at `e9850935` |
| `66de9bd1` (the edit) | `cb301ae4a4` | `04ec273805` |
| `27b26330` (the revert) | `1a012fb378` | `04ec273805` |

The block is byte-frozen from adoption until a builder touched it, and it did not follow the one
edit `CLAUDE.md` took. So the 22-of-23 similarity is both sides sitting still, not maintenance, and
a section never edited since its proposal was adopted is a record of that proposal. A frozen record
of a 2026-09-17 proposal should contain the 2026-09-17 text.

Consequence, stated so it is not filed as a defect later: `.sdlc/adapter.md:192` reads two CI jobs
while line 74 reads three, and that is correct. A pre-land ritual needing the live figure reads §2,
§5 or `.claude/CLAUDE.md` instead.

The general lesson, which is the same one the table above records six times over with the sign
flipped: measuring beats reading, but only when it measures the quantity the question turns on.
Review 2 measured, and was still wrong, because similarity was the wrong statistic. The heading
reading reached the right answer by luck of a weaker argument, and this unit twice wrote records
asserting the wrong one, first that the edit would falsify a record, then that it demonstrably
would not.
