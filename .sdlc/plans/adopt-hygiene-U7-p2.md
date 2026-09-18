# adopt-hygiene U7 · pass 2 re-diagnosis

Re-diagnosed by sdlc-planner on 2026-09-17 against `unit/hygiene-U7` @ ac52be8 (base `sdlc/adopt` @ 65bbda3) and `.sdlc/verdicts/adopt-hygiene-U7.md`. Read-only; the fixes below are for the builder. The fix is prototyped: a scratch copy of `.sdlc/debt.md` with the three replacement rows passes every check below (0 clash lines, 0 em dashes, 0 bold labels, row count line true), the file at ac52be8 fails three of them, and four planted faults each print one line.

## Root causes

| # | Failure | Cause | Who was wrong |
|---|---|---|---|
| 2a | new debt row `C13` collides with adapter conflict `C13` and carries no note | `.sdlc/debt.md` numbers its Config smells rows `C<n>` and `.sdlc/adapter.md` §4 numbers its Conflicts rows `C<n>`; the adapter series runs C1 to C13 without a gap, so every debt id from C1 to C13 collides. The builder chose C13 (skipping C7 to C12), which reads as an attempt to step past the adapter's ids and landed on its last one. Of the seven debt C ids at ac52be8, all seven collide; the three added in this plan are C5 and C6 (U6, e26d023) and C13 (U7). C1 to C4 predate the plan (b885e67) and are out of scope | builder (the id) and plan (row 2's command is `grep -c sdlc-orchestration` plus a home-path file loop; neither reads an id, so the "id clash addressed" clause of the criterion had no check at all) |
| 2b | the C5 and C6 notes add two em dashes and a bold label around `resolved by U7` | writing rules from the user's global contract (no em dashes anywhere; no bold inline labels) are not in the plan's criteria, and row 2 counts strings that cannot see either | plan (no check) and builder (the text) |
| stale | the `Row count:` line still reads `Config smells 4 ... total 41` while the section has 7 rows and the file 45 (Records drift also gained R12 in U6, so the base line was already wrong at 11 and 41) | nobody reads the summary line when appending rows | U6 and U7 builders; not graded, but a stale count in a record is a defect and the fix is one line |

The id scheme is the cause of 2a, not a one-off miscount: any future Config smells row will collide until the debt series passes C13. The cheapest durable rule is the one U6's reviewer already named and U7 tried to apply: a debt C row whose id also exists in adapter §4 says so in its last cell. The check below enforces exactly that for rows added in this plan.

## Fixes (smallest correct, `.sdlc/debt.md` only)

Rows C5 and C6 are replaced in place (same ids; only the last cell changes). Row C13 is renumbered C7, the next id in the debt series (it was added by this unit and is on no other branch, so nothing loses history). C7 also collides with adapter C7, so it carries the same note; this keeps the debt series sequential instead of jumping to C14 and pretending the two tables will never meet again. The `Row count:` line is corrected. No row is deleted.

Row C5 (replace the whole line):

```
| C5 | `.claude/settings.json` enables `sdlc@nonoun` but `extraKnownMarketplaces` declares no `nonoun` marketplace, so a fresh clone cannot resolve the plugin | `.claude/settings.json` `enabledPlugins` | `.sdlc/questions/adopt-hygiene-marketplace.md` (default A: leave it user-scoped, no public source to point at) | S | human | resolved by U7 under human answer B: `extraKnownMarketplaces.nonoun` now declares `{"source": {"source": "github", "repo": "kimgranlund/sdlc-orchestration"}}`, same shape as `nonoun-plugins`; the source repo itself is C7. This debt id C5 is distinct from adapter conflict C5 in `.sdlc/adapter.md` §4 (the stale "no local git hooks" line); the two tables number their own rows and the shared prefix is a reading hazard, not an error |
```

Row C6 (replace the whole line):

```
| C6 | machine-local absolute home paths appear in `.sdlc/` records (`.sdlc/plans/adopt-hygiene.md`, `.sdlc/tickets/T-0001.md`, `.sdlc/architecture.md`, `.sdlc/debt.md` itself) | `git grep -n '/Users/' -- .sdlc` | `.sdlc/verdicts/adopt-hygiene-prepr.md` config-and-records row (🟡 accepted); U6 review minor (`.sdlc/verdicts/adopt-hygiene-U6-review.md:45`) flagged the file list as incomplete, missing `debt.md`'s own hit | S | accepted | seat-local records written on one maintainer's machine; not worth rewriting for a single-maintainer repo. This debt id C6 is distinct from adapter conflict C6 in `.sdlc/adapter.md` §4 (the tracked `.claude/ops/` files); the two tables number their own rows and the shared prefix is a reading hazard, not an error |
```

Row C13 becomes C7 (replace the whole line):

```
| C7 | the `nonoun` marketplace declared by U7 (`kimgranlund/sdlc-orchestration`) has no source repo pushed to GitHub yet, so a fresh clone still cannot resolve `sdlc@nonoun` until the human pushes it | `.claude/settings.json` `extraKnownMarketplaces.nonoun` | U7 (`.sdlc/questions/adopt-hygiene-marketplace.md` answer B) | S | human | the human pushes the local `sdlc-orchestration` repo to `kimgranlund/sdlc-orchestration` on GitHub after this plan lands; not a code change. This debt id C7 is distinct from adapter conflict C7 in `.sdlc/adapter.md` §4 (commit trailers); same reading hazard as C5 and C6 |
```

Row count line (replace the whole line):

```
Row count: Hot untested 9 · Records drift 12 · Config smells 7 · Generated artifacts 4 · Dead agent artifacts 4 · Architecture exceptions 5 · Process 4 · total 45.
```

Also for the builder, not a debt.md edit: merge `sdlc/adopt` @ b001a21 into `unit/hygiene-U7` before committing, so the branch's plan copy carries the row 1 "6 changed lines" wording (verdict gap 3) and this file. Rewrite the handoff's "New row C13" line to C7. `.claude/settings.json` does not change.

## Commands that must go green (run in `.worktrees/hygiene-U7`)

| # | Command | Expected |
|---|---|---|
| 2 | plan row 2 as written (`grep -c 'sdlc-orchestration'`, the `/Users/` file loop) | `2`, no `missing` line |
| 2 | the clash-and-wording block below | no `clash` line, `0`, `0`, `7 / 7`, `45 / 45` |
| 3 | `npm test 2>&1 \| tail -1; git status --porcelain \| wc -l` | `all 44 test files passed`, `0` |

Clash-and-wording block (prototyped at `$CLAUDE_JOB_DIR/tmp/u7check.sh`; paste into the plan as the row 2 second command; `b885e67` is the plan approval commit, so the ids it lacks are the ones this plan added):

```sh
for id in $(comm -13 <(git show b885e67:.sdlc/debt.md | grep -oE '^\| C[0-9]+ ' | tr -d '| ' | sort) <(grep -oE '^\| C[0-9]+ ' .sdlc/debt.md | tr -d '| ' | sort)); do
  grep -qE "^\| $id " .sdlc/adapter.md || continue
  grep -E "^\| $id " .sdlc/debt.md | grep -qE "adapter conflict (id )?$id([^0-9]|$)" || echo "clash $id without note"
done
grep -c $'\xe2\x80\x94' .sdlc/debt.md
grep -cE '\*\*[^*]+\*\*' .sdlc/debt.md
echo "$(grep -oE 'Config smells [0-9]+' .sdlc/debt.md | tr -dc '0-9') / $(grep -cE '^\| C[0-9]+ ' .sdlc/debt.md)"
echo "$(grep -oE 'total [0-9]+' .sdlc/debt.md | tr -dc '0-9') / $(grep -cE '^\| [HRCGDKP][0-9]+ ' .sdlc/debt.md)"
```

Prototype results (2026-09-17, scratch copies of `.sdlc/debt.md`, adapter read from the root checkout):

| File | clash lines | em dash | bold | counts |
|---|---|---|---|---|
| 65bbda3 (base) | `clash C5`, `clash C6` (U6 added them without notes; the plan's C5/C6 clause exists because of this) | 0 | 0 | `4 / 6`, `41 / 44` |
| ac52be8 (head) | `clash C13 without note` | 2 | 1 | `4 / 7`, `41 / 45` |
| fixed | none | 0 | 0 | `7 / 7`, `45 / 45` |
| fixed, one note's comma swapped for an em dash | none | 2 (`grep -c` counts lines; two rows share the sentence pattern the plant hit) | 0 | unchanged |
| fixed, `resolved by U7` re-bolded | none | 0 | 1 | unchanged |
| fixed, C7 renamed C8 | `clash C8 without note` | 0 | 0 | unchanged |
| fixed, C7's note reworded without the phrase `adapter conflict C7` | `clash C7 without note` | 0 | 0 | unchanged |

Why the block bites where row 2 did not: row 2 counts one string and one file list; it is true on ac52be8 and true on the fixed file, so it cannot separate them. The block reads the ids themselves, joins them against the adapter table, and requires the note phrase on the same row; the em dash and bold greps are whole-file (base is 0 for both, so any new one shows); the count lines compare the summary against the rows it summarises. The em dash grep is the bytes of U+2014 (`$'\xe2\x80\x94'`, so the plan itself carries no em dash), and the plant must be the character, not `--`.

## Plan revisions (append to `.sdlc/plans/adopt-hygiene.md` §U7 and its revision log)

| Row | Revised text |
|---|---|
| 2 | Criterion: "debt records the unpushed marketplace repo, C5 resolved, C6 complete, every debt C id this plan added that also exists in adapter §4 says so on its row, no em dash or bold inline label in the file, row count line true". Command: keep the two existing commands, then append `; ` and the clash-and-wording block above. Expected: `2`, no `missing` line, then no `clash` line, `0`, `0`, `7 / 7`, `45 / 45`. Negative control: "at 65bbda3: first count `0`, `missing .sdlc/debt.md`, `clash C5` and `clash C6`, counts `4 / 6` and `41 / 44`; at ac52be8: `clash C13 without note`, `2`, `1`, `4 / 7`, `41 / 45`; on a scratch copy of the fixed file with `C7` renamed `C8` the block prints exactly `clash C8 without note`" |
| files | §U7 preamble: "the new C5/C6 ids that collide with adapter conflict ids get a note or distinct ids" becomes "the C5/C6/C7 ids that collide with adapter conflict ids each carry a note naming the adapter row; the marketplace source repo row is C7, not C13; the row count line is corrected" |
| log | `2026-09-17 · U7 pass 2: row 2 adds an id-clash join against adapter §4, em dash and bold greps, and a row-count self-check (a string count cannot see an id, a dash, or a label); the new debt row is C7 with a note, not C13 · verdict adopt-hygiene-U7 🔴, re-diagnosis .sdlc/plans/adopt-hygiene-U7-p2.md` |
