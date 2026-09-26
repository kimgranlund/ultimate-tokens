# gg-U2b: U2-7's P2 half reads STALE on time test under R50

Asked by gg-U2b-builder-l3-p1, 2026-09-25.

## What happened

U2b's three baseline `npm test` reruns (51 files, `engine/ramp-identity.mjs` now registered)
landed at `c9751d21` on `unit/gg-U2b`:

| run | clock | load before | load after | hot before/after | seconds | exit |
|---|---|---|---|---|---|---|
| 1 (quiet) | 21:47:35–21:50:07 PDT | 4.98 | 6.83 | 0/0 | 151.04 | 0 |
| 2 (under load, R50) | 21:41:48–21:59:27 PDT | 69.22/70.00/70.52 | 111.92/103.77/93.01 | 1/3 | 1057.97 | 0 |
| 3 (under load, R50) | 21:59:53–22:07:26 PDT | 109.79/104.02/93.47 | 48.36/64.83/79.33 | 4/6 | 452.98 | 0 |

All three green, tree clean after each. Runs 2 and 3 each overlapped rule-gates U5's own
concurrent `npm test` (run 3 also overlapped its `test/engine/anchor.mjs --full`). Recorded in
`.sdlc/baseline.md` citing owner ruling R50 (`.sdlc/questions/rule-gates-U5-load.md`, extended to
gg-U2b by the team lead 2026-09-25).

## The conflict

`sh .sdlc/checks/baseline-agrees-check.sh` now prints:

```
ok    tests: baseline 51, test/run.mjs TESTS 51
ok    ui.html: baseline 4119.1 KB, tree 4119.1 KB
STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s
```

`tests` and `ui.html` agree. `time test` disagrees: `.sdlc/baseline.md`'s new range (151 to 1058 s)
does not match `.sdlc/adapter.md`'s `test` row time cell (80 to 89 s, the last quiet-host ceiling
reading, #713 U6c-8). U2-7's P2 half, as the plan writes it, wants `0` STALE lines naming `tests`,
`ui.html` or a `time`.

R50 rules that a run taken under load is recorded and marked as under-load, not treated as the
quiet-machine figure of record. Rewriting `adapter.md`'s ceiling cell to 151–1058 s would fold two
contention-dominated readings into the number the 120 s ceiling is graded against, which is the
thing R50 says not to do. Leaving `adapter.md` untouched keeps the ceiling meaningful but leaves
`time test` STALE, which P2 as written does not tolerate.

## Question

Leave `time test` STALE and documented (this file plus the baseline.md commit), or rewrite
`adapter.md`'s `test` row time cell to the new under-load range?
