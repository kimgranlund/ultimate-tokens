# Handoff U1 . builder -> reviewer, rework 2

| Field | Value |
|---|---|
| Branch | unit/gs-U1 @ af023dc6987625019e1acaf86577b2ba17d8fbf9 |
| Files | test/engine/lib/corpus-sample.mjs, test/engine/corpus-sample.mjs, test/engine/curated-contrast.mjs, test/run.mjs, package.json, .sdlc/architecture.md |
| Ran | npm test 49/49 pass, exit 0, tree 0 after ; node test/repo/branding.mjs clean (481 files) |
| Left out | none |

Second rework. `plan/gate-split` @ `3a375e13` (revision 5) is merged into this branch: the delta review at `98f26418` found U1-6's half FIX-FIRST, and the Conductor withdrew that half of revision 4 rather than asking for a second fix on top of it.

## Fix (delta review at 98f26418, ruled): U1-6 is the assertion alone

The rework 1 pass added both a `contentKey` tiebreak and a uniqueness assertion to `sampleCorpus`. The assertion runs, and throws, BEFORE the sort. That means the sort never sees two entries sharing a category and name, so the tiebreak comparator's third branch could never execute, and its own negative control (revert the tiebreak, show a reversed input flips the order) could never fail, because the fixture that would exercise it is rejected by the assertion first. Dead code with an unfalsifiable control.

Per revision 5's U1-6 row:
- removed `contentKey` and the sort's third comparator branch. `git grep -c 'contentKey' -- test/engine/lib` now prints nothing (exit 1, no matches).
- kept the uniqueness assertion in `sampleCorpus` as is.
- reworded the function's doc comment: it now says the order is total because the KEYS are unique (the assertion), not because of a tiebreak, and explains why no tiebreak is needed (nothing is left to break a tie on once duplicate keys are rejected).
- added a synthetic duplicate-name leg to the REGISTERED `test/engine/corpus-sample.mjs`: a fixture with two `"brands"` documents both named `"Dup"` (different `palettes` content, same `vol`), asserting `sampleCorpus` throws and that the thrown message names `"Dup"`. This is what gives the guarantee coverage inside `npm test` itself, not only in a throwaway clone. Also added an explicit key-count-equals-distinct-count check on the real sample, printed as `(35 document keys, all distinct)`.

Control, run in a throwaway `git clone -q --shared`: removed the uniqueness assertion (the `seen`/`docKey` block) from the clone's `lib/corpus-sample.mjs`, leaving the sort untouched, then ran the registered test. The duplicate-name leg failed exactly as intended:
```
1 failure(s):
  - sampleCorpus accepted a synthetic corpus with two "brands" documents named "Dup" instead of throwing

FAIL: 1 failure(s)
```
exit 1. On the unmutated tree the same leg passes (see U1-1 below): `sampleCorpus threw as expected: corpus-sample: category "brands" holds two documents named "Dup", so docKey is not unique`.

## U1-1 to U1-5, re-measured against the committed tree (af023dc6)

| # | Command | Printed | Verdict |
|---|---|---|---|
| U1-1 (=P6) | `node test/engine/corpus-sample.mjs; echo "exit $?"` | `(forward = reversed = shuffled: 35 documents, 392 palettes)` / `(seed 0 != seed 1: 35 documents)` / `(35 document keys, all distinct)` / `(duplicate-name leg: sampleCorpus threw as expected: corpus-sample: category "brands" holds two documents named "Dup", so docKey is not unique)` / `PASS: corpus sample is a pure function of the document set and the seed` / `exit 0` | 🟢 |
| U1-2 | the `sampleCorpus` one-liner over the 8 category mirrors | `35 392` | 🟢 unchanged |
| U1-3 | `grep -rlE 'fnv1a\|% vols\.length' test/engine test/ui \| sort` | `test/engine/lib/corpus-sample.mjs` (one line) | 🟢 unchanged |
| U1-4 | `node test/engine/curated-contrast.mjs`, mode line, sorted-pick grep, then `npm run -s gate:corpus-contrast \| tail -1` | `exit 0` ; `(SAMPLED seed 0, volumes architecture V, cuisine III, film IX, literature V, music IV, nature X, travel XI)` ; grep count `1` ; `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 🟢 unchanged |
| U1-5 | the `require("./package.json").scripts` check | four `ok` then five `ok` | 🟢 unchanged |

## U1-6, re-measured as revision 5 now reads

`git grep -c 'contentKey' -- test/engine/lib` -> nothing printed, exit 1 (no matches; grep's own "found nothing" exit code, not a failure of the check). The registered sampler test's synthetic duplicate-name leg (named above) passes on the real corpus by observing the throw, and the key count equals the distinct key count (`35 35`, also checked directly): `node --input-type=module -e '...sampleCorpus(by); const keys=s.map(d=>`${d.category}/${d.name}`); console.log(keys.length, new Set(keys).size)'` -> `35 35`, exit 0.

## U1-7, re-measured against the committed tree

`BASE=$(git merge-base origin/main HEAD); git diff --numstat "$BASE" -- .sdlc/architecture.md .sdlc/debt.md` -> `1  1  .sdlc/architecture.md`, no `debt.md` line. K17 pipeline (`git grep -nE 'from "(vitest|jest|mocha|node:test|uvu|ava)"' -- test; git ls-files test | ... | grep -vxE "...\|engine/lib/corpus-sample.mjs\|..."`) prints nothing, exit 1 (no hits). `.sdlc/debt.md` remains untouched, per the standing ruling (its K17 count quote moves in U6b, after #709 lands).

## P1, U1-1/P6, U1-3, U1-4, U1-5 negative controls, re-run at this head

| # | Control | Printed |
|---|---|---|
| P1 | corrupt `role-table.json`, run `npm test` | `exit 1` |
| U1-1/P6 | delete `.sort()` on `vols` in the lib | `FAIL: 1 failure(s)`, naming categories `architecture, cuisine, film, literature, music, nature, travel`, exit 1 |
| U1-3 | restore the old two-line picker in `curated-contrast.mjs` | two lines (`test/engine/curated-contrast.mjs`, `test/engine/lib/corpus-sample.mjs`) |
| U1-4 | restore the unsorted pick in the lib | mode line reads `architecture VI, cuisine III, film V, literature VI, music IV, nature X, travel XI`; sorted-pick grep count `0` |
| U1-5 | change one command to `echo gate:`, drop `gate:sweeps` | one `WRONG`, five `MISSING` |
| U1-6 | remove the uniqueness assertion in a scratch copy | the registered test's duplicate-name leg fails (quoted above), exit 1 |

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
exit 1. Unchanged since rework 1: the ruled `tests` row (48 -> 49, U6b's to close) and the benign `head` row (clears once #709 lands). `.sdlc/baseline.md` was not touched.

## Branding and prose, at this head

`node test/repo/branding.mjs` -> `branding: clean (481 files scanned)`. Em-dash sweep on added lines (`git diff \| grep '^+' \| perl ... \x{2014}`) -> `0`, and a direct sweep of the two touched test files -> `0`.

## npm test, at this head

`npm test` -> `all 49 test files passed`, exit 0, `git status --short` empty after (tree byte-stable).

## Host

`sysctl -n hw.ncpu` `10`; the host stayed loud through this pass (other seats active), so no `npm test` timing is recorded as evidence, only pass/fail and file counts. No `gate:*` full sweep for tonal/anchor/prime/reset was executed for real (the target files do not exist pre-#681); U1-5/U1-7 checks are wiring only.
