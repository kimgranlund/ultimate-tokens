# U7 series row, #681, handoff

Head: `ed1783bdece2052e9e301c89ca504d561cf355d4` plus one follow-up commit, on
`plan/preset-intent-fidelity`.

## Gates

- `node .sdlc/checks/ceiling-counts-check.mjs`: every line `ok`, exit 0 (20 rows, prose 20/12/8,
  other 17 = 14 explicit + 3 unsupportable, graded Three (3), adapter note 20-reading/1670.43 max).
- `sh .sdlc/checks/baseline-agrees-check.sh | tail -1`: `stale total: 0`.
- `node test/repo/branding.mjs | tail -1`: `branding: clean (566 files scanned)`.
- `git diff --stat .sdlc/adapter.md`: 1 line changed (19-reading to 20-reading), nothing else touched.
- Guard read 0 before and after, one process at a time, no `npm test` run, no em dashes.

## What I did

Added the 309.34 s / load 2.64 row (bold wall + start load, **GRADED under R13**, tree `43033841`,
log path, the two quoted lines, 240.66 s to spare, 104% of CPU) right after the 553.45 s row.
Bumped the reading-count sentence to 20/12/8 with `309.34` inserted into the sorted inside list.
Changed "Two ... best read as a pair" to "Three ... graded under R13" and named all three start
loads/trees. Added a paragraph after the existing 326/553.45 "spread is the finding" paragraph
(left untouched, per the brief) saying `309.34 s` sits 17 s under `326 s`, so the two low-load
readings agree and `553.45 s` stands alone as the outlier, narrowing where the spread lives rather
than explaining it. Verified the tree relation with `git diff --name-only 43033841 1212a722`, which
lists only `.sdlc/` files, none outside `.sdlc/` or `docs/`.

## Follow-up fixes (team-lead's four items)

1. Fixed the "only reading in the series to exceed one core" clause at its real location, the
   592.17 s row (not 553.45 s as the brief named it), to name the new 104% reading and drop the
   "only" claim.
2. Fixed "the two graded readings are 227 s apart" and "neither graded reading supports widening
   it" in the "divergence among the quiet runs" paragraph: now names `553.45 s` as 227 s from the
   other two graded readings, `326 s` and `309.34 s`, and says none of the three graded readings
   supports widening the band. The finding (the spread is unexplained) is unchanged.
3. Fixed the CPU-share table and its prose: added a `104% | 309.34 s | yes` row (the table's own
   rule is one row per reading whose CPU share is recorded, and this one is), moved the row count
   from 12 to 13 and inside-band count from one to two, and corrected "Run 1 ... fastest and most
   CPU-efficient reading" and "What is not circular is run 1 on its own: highest share" to name the
   309.34 s reading as the new highest share and fastest wall of any reading in that table, with
   Run 1 now the second-highest.
4. Re-ran all three gates after the fixes; all still clean (see above).
