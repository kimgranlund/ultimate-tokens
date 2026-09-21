---
kind: handoff
plan: gate-split
unit: U5
branch: unit/gs-U5
written: 2026-09-20
pass: 1
---

# gate-split U5: `headless-boot.mjs`, the reset sweep only (#713)

Head sha: `fe099258`. Files changed: `test/ui/headless-boot.mjs` (1 file, 11 insertions, 4 deletions).

## G0, as waived

`git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?` printed `0`. Branch built off
`plan/gate-split @ ebddc55d` (the merge of `a2bb3c84`), per the U5 brief.

## Correction from the U4 builder, applied here too

P8, P9 and U5-3 are diffed against `ebddc55d` (the branch point), not `git merge-base origin/main
HEAD` or `git merge-base plan/gate-split HEAD`: `plan/gate-split` has moved past this branch's cut,
and origin/main pulls in #681's whole unrelated history. All three criteria below use `ebddc55d`.

## Re-observed counts (before editing)

- `TESTS.length` on this branch: `50` (matches the common brief's stated post-U1 count).
- Pre-edit M-D control (scratch clone `pre-md`, unedited file): `git diff --stat` read
  `1 file changed, 1 insertion(+), 1 deletion(-)`; `node test/ui/headless-boot.mjs` exit `1` with
  `(rst-corpus) 3396 of 3396 anchored palettes failed the exact-snapshot field round trip` and
  `(rst-corpus-ramp) 3396 of 3396 anchored palettes failed the full projectView ramp round trip`,
  identical to the plan's citation at `36ce7777`. No drift.
- `A` (`^// (rst-corpus)`) is `3950`, `Z` (`^// ── report`) is `4020` at this branch's pre-edit head
  (plan cites `3841`/`3906` at `36ce7777`; the shift is #681's merge, re-observed as instructed).
- FULL corpus scale, unedited: `343` curated documents, `3780` palettes (confirmed post-edit below,
  no drift from the plan's citation).
- SAMPLED scale under the shared sampler: `35` curated documents, `392` palettes (confirmed
  post-edit below; matches U1-2, no dropped category).

## Criteria

| # | Result |
|---|---|
| U5-1 | `npm run -s gate:corpus-reset` exit `0`. `grep -c 'HEADLESS BOOT PASS'` → `1`. `grep -c '(FULL: 343 curated documents, 3780 palettes)'` → `1` |
| U5-2 | `node test/ui/headless-boot.mjs` (SAMPLED) exit `0`, last two lines `(SAMPLED seed 0: 35 curated documents, 392 palettes)` then `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold`. M-D clone (`post-md`), SAMPLED: exit `1`, `grep -c '(rst-corpus)'` → `4`, needle line `(rst-corpus) 316 of 316 anchored palettes failed the exact-snapshot field round trip` |
| U5-3 | Base `ebddc55d` (corrected). `A=3950`, `Z=4020`. Outside-range hunks: `2`, at new-file lines `13` and `15`: the `const FULL = process.argv.includes("--full");` line and the `import { sampleCorpus, SAMPLE_SEED } from "../engine/lib/corpus-sample.mjs";` line, exactly the two named in the brief. Every other hunk (`3965`, `3968`, `3970`, `3974`, `4011`, `4015`) falls inside `[A, Z]` |
| U5-4 | Loud host. Before: `181.79 195.96 131.44`. `real 72.18`. After: `129.33 175.35 128.64`. Graded 🟡 per the plan's rule (load far above the 10-core count both before and after); not waiting for quiet |
| P1 | `npm test 2>&1 \| tail -1` → `✓ all 50 test files passed`. `TESTS.length` via the perl one-liner → `50`. `git status --short \| wc -l` → `0`. Host was loud (`121.75 172.18 128.06` before, `342.48 280.38 192.31` after); P1 has no quiet-host requirement, unlike P2/timing rows |
| P3 (a) | Clone `p3a`: dropped ` --full` from `gate:corpus-reset`. `npm run -s gate:corpus-reset` exit `0`, `grep -c '(FULL: 343 curated documents, 3780 palettes)'` → `0` |
| P3 (b) | Clone `p3b`: `process.argv.includes("--full")` forced to `false`, `git diff --stat` → `1 file changed, 1 insertion(+), 1 deletion(-)`. `npm run -s gate:corpus-reset` exit `0`, `grep -c '(FULL:'` → `0` |
| P3 (c) | Clone `p3c`: FULL branch forced onto `sampleCorpus(byCategory)` too (`perl -pi -e 's/FULL \? Object\.values\(byCategory\)\.flat\(\) : sampleCorpus\(byCategory\)/FULL ? sampleCorpus(byCategory) : sampleCorpus(byCategory)/'`), `git diff --stat` → `1 file changed, 1 insertion(+), 1 deletion(-)`. `npm run -s gate:corpus-reset` exit `1`, `grep -c 'FAIL'` → `1`, needle line `(rst-corpus-setup) exercised Reset over the FULL anchored corpus, all 8 categories plus the default kit (316 palettes, want > 3000)`: the FULL-side vacuity floor bites at the same `316` the SAMPLED scale produces, naming it instead of `3000` |
| P5 row 6 (M-D) | Clone `post-md`, post-edit code, `git diff --stat` → `1 file changed, 1 insertion(+), 1 deletion(-)`. `npm run -s gate:corpus-reset` (FULL) exit `1`, `grep -c '(rst-corpus)'` → `4`, needle `(rst-corpus) 3396 of 3396 anchored palettes failed the exact-snapshot field round trip` |
| P8 | Base `ebddc55d`. `node test/repo/branding.mjs \| tail -1` → `branding: clean (514 files scanned)`. Added-line em dash count → `0` |
| P9 | Base `ebddc55d`, `Q2=yes`. Scope-wall filter → `0`. `src` diff → `0` |

## Scratch clones (kept, not removed)

All under `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U5-neg/`:
`pre-md` (pre-edit M-D baseline), `post-md` (post-edit M-D, U5-2 + P5 row 6), `p3a`, `p3b`, `p3c`.

## Corrections / disagreements with the plan

1. P8, P9 and U5-3's diff base: the plan's own commands read `git merge-base origin/main HEAD` (P8/P9)
   and `git merge-base plan/gate-split HEAD` (U5-3). On this branch both pull in unrelated history
   (`origin/main` predates #681; `plan/gate-split` has since moved past this unit's cut). Per the U4
   builder's finding, relayed by the team lead, all three ran against `ebddc55d` instead, and that is
   what is reported above.
2. `A`/`Z` moved from the plan's `36ce7777` citation (`3841`/`3906`) to `3950`/`4020` at this branch's
   head, from #681's merge landing between those two measurements. Re-observed and cited per the
   brief; not a defect.
3. The plan's revision note ("the note from the U1 verdict for U2 onward: `sampleCorpus` silently
   drops a category whose presets lose `vol` ...; the first unit that consumes the sampler adds a
   per-category presence assertion with a control that fails") is not one of U5's four brief steps,
   and U2/U3/U4 are being built in parallel by sibling seats, so it is unclear whether this unit
   qualifies as "the first" consumer. No presence assertion was added here, staying inside the brief's
   stated scope (the `(rst-corpus)` block, the `--full` flag, and the sampler import only). The
   post-edit SAMPLED run measured `35` documents / `392` palettes with no category dropped, so the
   defect is not observed on this corpus today, but the gap in coverage stands until someone rules
   which unit owns it.
