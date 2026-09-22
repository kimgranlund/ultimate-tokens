# chroma-floor revision 7 (#701), re-derived at #681's tip 505416d7

Commit `6888cc3e` on `plan/chroma-floor` (not pushed). Status stays `draft`. Both scratch worktrees removed.

## Rows changed

| Criterion | What moved | Repaired to |
|---|---|---|
| C2 | two lone-spike lists (`LONE_SPIKE_ALLOW` 64, `DEFAULT_KIT_SPIKE_FINDING` 1), two printed lines | one count over corpus + kit, `=== 0`, gate-internal data-URL control against the shoulder term |
| C3 | `EVEN_DIP_BASELINE` is a 90-name rendered-path list | baseline deleted, unconditional off-anchor / stop-500 (K = 32) line, two controls, stays in `npm test` (rework, not a new sweep) |
| C4 | nothing reads the gate path | `gate:even-dips` CI gate script per #713; measured 0 at 505416d7, 1.6x-floor control 155 |
| C5 | found stale by measurement: `--envelope` reads the rendered path since fa0264fa (even 15.6/37.0, 48.4/113.7, 42.5/80.2, 22.9/52.0, above 100% 670 FAIL); the ruled gate-path cells are printed nowhere | U1 adds `--gate-path`; `--rendered` dropped; perceptual/peak md5-pinned; rendered block quoted under REPORTED, NOT BARRED (Q2) |
| C6 | new full-corpus sweep | `gate:mode-isolation` CI gate script per #713 |
| C11 | three lists, `NOTCH_ALLOW` 79 (revision 6's 102 was a miscount, 79 at both shas) | seven greps, the two count assertions named |
| C1, C7, C12 | `TESTS.length` 49; assert lines 1137/1138; the baseline script exits 1 for any stale, never the count | 49; 1137/1138; pass is `stale total: 1`, `exit 1` |
| depends, Units | the owner's 2026-09-20 waiver was recorded in the approval file only | build off #681's tree, merge `origin/main` once after its squash |
| blast radius, scope | `--movement` does not exist; #715 and #713 unnamed | scratch movement script; two Not-in-scope rows (no #715 overlap: the kit is already in both sweeps this plan owns) |

## Owner must decide

1. Re-approve: five criteria and both unit contents changed since the 2026-09-19 approval.
2. Confirm C4 and C6 as CI gate scripts (adapter and baseline rows in U1/U2) rather than `npm test` additions.
3. The even rendered-path bar (three p90 misses, 670 above 100%) stays unowned: Q2 ruled report-only here and #725's acceptance scopes to perceptual and peak.

## Notes

- Commit attribution carries the session's mandated Fable 5.1 lines and the trailer `Seat: orchestrator`; the dispatch asked for an Opus 5.5 co-author line, which would not be true.
- An accidental full `npm test` run in the #681 scratch worktree ran for about two minutes at 12:00 PDT before it was killed; a HOST QUIET waiter would have seen a `test/run.mjs` process then.
- Measurements: `--envelope` 94.35 s at load 5.88 to 20.33; gate-path script 16.7 s; every grep count also run on 730ff941 as the failing control.
