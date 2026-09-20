# Handoff U1 . builder -> reviewer, rework 1

| Field | Value |
|---|---|
| Branch | unit/gs-U1 @ 4b48f34660de87d6e9781a80ffc7761ccae4063f |
| Files | test/engine/lib/corpus-sample.mjs, test/engine/corpus-sample.mjs, test/engine/curated-contrast.mjs, test/run.mjs, package.json, .sdlc/architecture.md |
| Ran | npm test 49/49 pass, exit 0, tree 0 after ; node test/repo/branding.mjs clean (481 files) |
| Left out | none |

This is a rework of the head reviewed as FIX-FIRST (`fbd4efd4`); see `gs-U1-review-1.md` and `gs-U1-rework-1.md` for the findings. `plan/gate-split` (`ef0df0d2`, U1-6 and U1-7 rows) is merged into this branch. Corrections from the previous handoff, which the review caught, are called out below rather than silently replaced.

## Fix 1 (ruled): K17 exception entry

`test/engine/lib/corpus-sample.mjs` is a helper, the same class as `test/ui/counts.mjs`, and was missing from the K17 exception filter in `.sdlc/architecture.md:115`, so the K17 control printed it where it must print nothing. Added one name to the control's regex and one clause to the row's prose exceptions list; the row's own `(7 unlisted files before the exception filter)` reading moved to `(8 unlisted...)` in the same line, since that is what the pipeline now measures before the filter. `.sdlc/debt.md` was left untouched, as ruled: its K17 row quotes the pre-filter count and #709 is editing that row now; the quote moves in U6b after #709 lands, so this branch and `debt.md` disagree on that number in the meantime, on purpose.

Control (U1-7): `git diff --numstat -- .sdlc/architecture.md .sdlc/debt.md` -> `1  1  .sdlc/architecture.md` (no line for `debt.md`). K17 pipeline at this head: empty output (0 hits). At `fbd4efd4` (before the fix) the same pipeline prints `engine/lib/corpus-sample.mjs`.

## Fix 2: the previous handoff reported a number it did not read

The prior handoff said `stale total: 1`. At `fbd4efd4` the script actually printed `stale total: 2`: the ruled `STALE tests: baseline 48, TESTS 49` row, and a second, benign `STALE head: baseline ref 20298cc has the same tree as HEAD ...` row, caused by `plan/gate-split` being cut from a `main` that still carries `baseline-agrees-check.sh` as it read before #709's fix (the same-tree row counted, and its sentence was inverted, before that fix). That second row clears once #709 lands; it was never this unit's defect to fix, but the handoff should have named it instead of printing a stale count. Corrected below with what the script prints today.

## Fix 3 (ruled): total order and a uniqueness assertion

`sampleCorpus`'s sort broke a tie on category and name by falling back on `Array#sort`'s own stability, which is input order: the exact defect #686 exists to remove. Not live on the real corpus (0 collisions across all 8 categories), but the sample's own equality key (`category/name`) could not have seen the break if it ever happened.

Fixed both, per the plan's U1-6 row and the rework brief:
- a third sort key, `contentKey`, built from each document's own fields (`vol`, `curve`, `tension`, `lmin`, `lmax`, `palettes`), so a tie is broken by what the two documents ARE, never by which array position either one arrived at.
- a uniqueness assertion: `sampleCorpus` throws if a category ever holds two documents under the same `docKey` (`category/name`).
- the registered test's own `sampleKey` now folds in `JSON.stringify(d.palettes)`, so it can see a content-order flip a name-only key would have missed.

## Fix 4: em dashes

The prior handoff claimed 0 added-line em dashes; the diff at `fbd4efd4` carried 5, all inside `FAIL(...)` strings: four newly authored in `test/engine/corpus-sample.mjs` (the "exposed no PRESETS", "the pick moved ... none named", "seed 1 picked the identical sample", and "brands sampled ... of ..." messages) and one on the line moved into `curated-contrast.mjs` from the original file, which already carries many and was left as inherited text, not reworded. The four new ones are reworded to a colon; branding and the em-dash sweep below are both clean at this head.

## U1-1 to U1-5, re-measured against the committed tree (4b48f346)

| # | Command | Printed | Verdict |
|---|---|---|---|
| U1-1 (=P6) | `node test/engine/corpus-sample.mjs; echo "exit $?"` | `(forward = reversed = shuffled: 35 documents, 392 palettes)` / `(seed 0 != seed 1: 35 documents)` / `PASS: corpus sample is a pure function of the document set and the seed` / `exit 0` | 🟢 |
| U1-2 | the `sampleCorpus` one-liner over the 8 category mirrors | `35 392` | 🟢 unchanged |
| U1-3 | `grep -rlE 'fnv1a\|% vols\.length' test/engine test/ui \| sort` | `test/engine/lib/corpus-sample.mjs` (one line) | 🟢 unchanged |
| U1-4 | `node test/engine/curated-contrast.mjs`, mode line, sorted-pick grep, then `npm run -s gate:corpus-contrast \| tail -1` | `exit 0` ; `(SAMPLED seed 0, volumes architecture V, cuisine III, film IX, literature V, music IV, nature X, travel XI)` ; grep count `1` ; `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 🟢 unchanged, sorted pick still matches the plan's cited needle byte for byte |
| U1-5 | the `require("./package.json").scripts` check | four `ok` then five `ok` | 🟢 unchanged |

## U1-6, measured against the committed tree

Command named per the plan row: `node --input-type=module -e '...sampleCorpus(by); const keys=s.map(d=>`${d.category}/${d.name}`); console.log(keys.length, new Set(keys).size)'` -> `35 35`, exit 0. Key count and distinct key count are equal.

Negative controls, each in a throwaway `git clone -q --shared`:
- planted duplicate: a synthetic `{ brands: [ {name:"Dup",vol:"I",...}, {name:"Dup",vol:"I",...} ] }` passed to the shipped `sampleCorpus` -> throws `corpus-sample: category "brands" holds two documents named "Dup", so docKey is not unique`, exit 1.
- tiebreak removed: in a second clone, the sort reverted to the old two-key comparator (no `contentKey`), same duplicate-name-different-content fixture, forward vs reversed input -> `forward: ["A","B"]`, `reversed: ["B","A"]`, `CHANGED (order flipped with input)`. On the shipped code this same fixture never reaches an order comparison: the uniqueness assertion throws first, which is the intended behavior (a duplicate name is always a defect to report, not an order to quietly stabilize).

## U1-7, measured against the committed tree

`git diff --numstat -- .sdlc/architecture.md .sdlc/debt.md` -> `1  1  .sdlc/architecture.md`, no `debt.md` line. `npm test` green for the K17 gate (see `npm test` run below). Negative control: removing the entry in a scratch copy reprints `engine/lib/corpus-sample.mjs` from the K17 pipeline (reproduced at `fbd4efd4` above; same effect from reverting the line in a fresh clone).

## P1 to P9 negative controls re-run at this head

| # | Control | Printed |
|---|---|---|
| P1 | corrupt `role-table.json`, run `npm test` | `exit 1` (1 of 49 files failed) |
| U1-1/P6 | delete `.sort()` on `vols` in the lib | `FAIL: 1 failure(s)`, naming categories `architecture, cuisine, film, literature, music, nature, travel`, exit 1 |
| U1-3 | restore the old two-line picker in `curated-contrast.mjs` | two lines (`test/engine/curated-contrast.mjs`, `test/engine/lib/corpus-sample.mjs`) |
| U1-4 | restore the unsorted pick in the lib | mode line reads `architecture VI, cuisine III, film V, literature VI, music IV, nature X, travel XI`; sorted-pick grep count `0` |
| U1-5 | change one command to `echo gate:`, drop `gate:sweeps` | one `WRONG`, five `MISSING` |

## P7 (baseline-agrees-check.sh) at this head, exact output

```
STALE tests: baseline 48, test/run.mjs TESTS 49
ok    ui.html: baseline 3780.5 KB, tree 3780.5 KB
ok    time test: baseline 56 to 60 s, adapter 56 to 60 s
ok    time build: baseline 1 to 3 s, adapter 1 to 3 s
ok    time smoke: baseline 18 to 18 s, adapter 18 to 18 s
STALE head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore
ok    head: baseline ref 20298cc is in origin/main's history
stale total: 2
```
exit 1. Two STALE rows as the review named: the ruled `tests` row (48 -> 49, U6b's to close after all sweep units land) and the benign `head` row (clears once #709 lands on `origin/main`; this branch inherits the pre-#709 script from where it forked). `.sdlc/baseline.md` was not touched.

## Branding and prose, at this head

`node test/repo/branding.mjs` -> `branding: clean (481 files scanned)`. Em-dash sweep on added lines (`git diff \| grep '^+' \| perl ... \x{2014}`) -> `0`, and a direct sweep of the two new files (not visible to `git diff` against origin for untracked-then-added content, checked directly) -> `0`.

## Host

`sysctl -n hw.ncpu` `10`; `uptime` 1-minute load stayed above the 10-core quiet-host threshold for the whole rework pass (other seats active on the host), so no `npm test` timing is recorded as evidence, only pass/fail and file counts. No `gate:*` full sweep for tonal/anchor/prime/reset was executed for real (the target files do not exist pre-#681); U1-5/U1-7 checks are wiring only.
