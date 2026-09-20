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
| 1 | Commit the staged `origin/main` merge in this worktree with a `Seat: orchestrator` trailer | The commit-msg hook bars a builder committing `.sdlc/board.md`. Same case, same answer as `.sdlc/questions/records-followup-U9-board-seat.md` (option B, 2026-09-20). Details in `.sdlc/questions/pif-u5-board-seat.md` |
| 2 | Route the proposed C1 and C10 wording in §5 to the Conductor | `.sdlc/plans/` is not this unit's to edit, and **C10 cannot pass as written** |

## 2. Why this unit merged `origin/main`

Not optional, and not cosmetic. The base `a2bb3c84` carries main at `3ce50daa`; main is now
`e9850935` (`git rev-parse origin/main`, confirmed after a fetch), and #709 landed two things this
unit's own definition of done depends on.

| # | What #709 changed | Consequence for U5 |
|---|---|---|
| 1 | `.sdlc/checks/baseline-agrees-check.sh` turned the same-tree row from a counting `STALE` into a non-counting `note head:` | On the base's older copy the brief's required `exit 0` is unreachable on ANY branch, because a unit branch's tree always differs from a main ref |
| 2 | `.sdlc/baseline.md` rewritten: five gate rows (adds `gate:corpus-contrast` and `gen:type-fonts`), an `extended:` frontmatter field, a correction block | Editing the base's three-row copy would put the tests-49 and ui.html repairs on a version main has already replaced, and would conflict at land |

The merge is resolved and staged. One conflict, `.sdlc/board.md`, purely additive on both sides,
resolved as the union with no row's text edited: main's `records-followup` rows first, then this
plan's five `preset-intent-fidelity` rows, matching the landed-first order the rows above already
read in. `git diff --stat a2bb3c84 <staged tree> -- src test docs scripts figma mcp` is empty, so the
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

### `.sdlc/`

| Path | What changed |
|---|---|
| `.sdlc/baseline.md` | `npm test` summary 48 to **49** files, quoted byte for byte from this unit's own run; `npm run build` ui.html **3780.5 to 4111.1 KB**; both cells marked as re-measured rather than silently overwritten; new **§Interim gate-time ceiling (INTERIM, #713)**; a dated correction paragraph. `ref:` deliberately left at `origin/main @ 20298cc` |
| `.sdlc/adapter.md` | The `test` gate row's Time cell and the budget note now cite the interim ceiling and #713, superseding the stale 90 to 175 s range. The `56 to 60 s` prefix is untouched on purpose: `baseline-agrees-check.sh` parses it against the baseline's own seconds column |
| `.sdlc/handoffs/pif-u4.md` | Five repairs, below |
| `.sdlc/questions/pif-u5-board-seat.md` | New: the board-seat question for the merge commit |

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
- Inside a slash or comma list (`app.js:2458/2490`) the repo's parser yields one citation per member.
  Counting the list as one gives one fewer in `02-sections-and-resolvers.md` and one more in
  `04-context-and-messaging.md` than the verifier recorded.

46 minus those 6 bare forms is 40. Every row reproduces at head either way, and
`node test/repo/citations.mjs` reads `STALE 0 across 10 discovered docs`.

## 5. Proposed plan wording (the Conductor's to apply, not mine)

### C10 cannot pass as written: two id collisions

C10 requires each grep to be non-zero on the branch **and zero on `origin/main`**. Two of its five
greps are already non-zero on `origin/main`, so they cannot discriminate this plan's work:

| C10 grep | State on `origin/main` | Cause |
|---|---|---|
| `grep -c "^## ADR-025" docs/reference/references/decision-records.md` | **1**, and it already precedes `## Quick map` | ADR-025 is "WCAG-safe on-colors are the DEFAULT", landed by #662 after this plan's text was written. The last ADR when C10 was drafted was ADR-024 |
| `grep -c "^## 1.62" docs/reference/CHANGELOG.md` | **1** | 1.62 is "travel's curated hexes are rendered from their OKLCH again" (#656); 1.63 is #662's. The plan's own risk table records both as landed, but C10's numbers were not moved with them |

This unit therefore wrote **ADR-026** and **CHANGELOG 1.64**, the next free ids. Proposed C10
replacement for those two clauses, everything else in C10 unchanged:

> `grep -c "^## ADR-026" docs/reference/references/decision-records.md` = 1 and it precedes
> `## Quick map`; `grep -c "^## 1.64" docs/reference/CHANGELOG.md` = 1.

The other three C10 greps pass as written and are verified in §8.

### Proposed C1 amendment: the interim gate-time ceiling

Verbatim owner ruling, 2026-09-20, ticket #713: "Interim ceiling now, split sweeps into gate scripts
as a new ticket (Recommended)". Proposed text to append to C1:

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
| 1 | The staged `origin/main` merge is uncommitted | `only the orchestrator commits the board (got Seat: builder)`. A builder never signs `Seat: orchestrator` (the ruling in `records-followup-U9-board-seat.md`), and a merge commit cannot leave a path out of its staged set. Needs the Orchestrator, per §1 |
| 2 | `docs/reference/data/adia-*` tag notes | The provenance headers are GENERATED; a hand edit is erased by the next `npm run gen:adia-exports`. Their values live in `scripts/gen-adia-derived-exports.mjs`, outside a docs lane. Two substantive problems for the Conductor, neither a docs edit: (a) that file's `1.1.0` rationale comment says "no token value, name or ordering changed", which is FALSE on this branch, since #681 moved the token values, so under the file's own bump policy the artifacts are due another minor bump; (b) C9 expects `git tag --list 'adia-*@1.1.0'` to print three lines including `adia-brand-document@1.1.0`, but `docs/reference/colors/categories/brands.json` is byte-identical to `origin/main`, so the SOURCE document did not change and `SOURCE_TAG adia-brand-document@1.0.0` with `SOURCE_COMMIT 770297b` is still true. Either C9's three-tag expectation or the generator's version constants is wrong; a builder cannot pick |

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

All run in this worktree, in the foreground, blocking, with load recorded.

| Gate | Result |
|---|---|
| `npm test`, run 1 (mid-unit) | `✓ all 49 test files passed`, 0 FAIL lines. Wall **518.66 s** (`8:38.66 total`, user 524.72 s). Load `6.56 / 14.82 / 20.43` at start, `9.85 / 10.04 / 15.18` at end |
| `npm test`, run 2 (final tree) | **exit 0**, `✓ all 49 test files passed`. Wall **649 s**. Load `9.42 / 10.69 / 13.38` at start, `33.98 / 19.23 / 15.70` at end. Above the proposed band, and reported as such: the host's 1-minute load more than tripled during the run, so it was never under 10 throughout. Recorded in the baseline's own reading series rather than dropped |
| `sh .sdlc/checks/baseline-agrees-check.sh` | **exit 0**, `stale total: 0`. Seven `ok` rows, one expected `note head:` line, and `ok head: baseline ref 20298cc is in origin/main's history` |
| `node test/repo/citations.mjs` | exit 0, `STALE 0 across 10 discovered docs` |
| `node scripts/audit-citations.mjs` | `STALE 0` in every audited doc |
| `node test/repo/branding.mjs` | exit 0, `branding: clean (535 files scanned)` |
| C10's three uncollided greps | ADR heading precedes `## Quick map`; `^| \*\*Anchor\*\*` in the glossary = 1; `^## 9\. Anchored palettes` = 1; `anchor` in `color-math/SKILL.md` well past 3; `anchored palette` present in both rubrics |
| em dashes in added prose | 0 in every file this unit added lines to, including the subagent-authored spec and LLD amendments |

Process notes, per the brief: every command ran in the foreground with `uptime` recorded either side,
no bare `git stash` was run. One exception, disclosed rather than hidden: the FINAL `npm test` ran
past the 600 s tool timeout and the harness moved it to the background on its own. It was not
launched in the background, and it was not left unattended: the wait for it was a blocking watch on
its own log, and its exit code (0) and full output were read from the completed run's output file,
not inferred. Before the timed gate I
swept for CPU-holding leftovers; the `node` processes on this host all sat at 0.0% CPU and belong to
other projects, so none was reaped and none held the timing.
