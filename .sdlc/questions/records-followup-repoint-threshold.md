# Question · the quiet-host threshold, and what to do with the fourteen runs in hand

date: 2026-09-20
from: orchestrator (Lane B), raised by close-709-repoint-builder-l5
about: the baseline re-point to `origin/main @ e9850935` (owner ruling 6 on `plan/gate-split` approval Q6)
status: open

## What was measured

Fourteen of the fifteen runs are in hand, every one started under load 10 on 10 cores as the rule requires, starts ranging 6.31 to 7.76, all exit 0, tree clean after each.

| gate | seconds | state |
|---|---|---|
| `npm test` | 109.73 · 106.32 · 112.89 | complete |
| `npm run build` | 3.04 · 2.38 · 2.50 | complete |
| `npm run smoke` | 30.22 · 25.87 · missing | incomplete |
| `npm run gate:corpus-contrast` | 30.93 · 35.57 · 25.92 | complete |
| `npm run gen:type-fonts` | 0.88 · 0.87 · 0.91 | complete |

Run 15 (`npm run smoke` third) never started: its guard held 120 samples over 41 minutes and aborted at `ABORT load1 54.21 repo_busy 1`. Only 7 of the 120 samples were under load 10 at all.

Three runs were recorded and not used, per the rule: builds 10 to 12 (a sibling worktree's `headless-boot.mjs` at about 100% cpu through all three, re-taken clean), fonts run 9, and the first dispatch's 138 s `npm test` at load 10.21.

## The finding

`npm test` doubled, 56 s to about 110 s, on a tree that did not move: `20298cc..e9850935` touches 68 files, 66 of them under `.sdlc/`, the other two `.claude/CLAUDE.md` and `.gitignore`. No test file changed.

The cause is in the rule, not the runs. `baseline.md`'s host line records that the figures of record were taken at load `3.97 3.87 4.58`; the six extended rows at `3.97 4.39 4.80` to `6.16 4.94 4.97`. The quiet-host rule permits anything under 10, so a set taken at 6.3 to 7.8 obeys the rule and still measures a host roughly twice as loaded as the one that produced the numbers it is compared against. The threshold of "under the core count" was never the condition the recorded figures were taken under.

Writing `106 to 113 s` into `.sdlc/adapter.md` §1 would make a loaded host the repo's stated gate budget, and every seat reads that cell as what the gate costs.

Port 9333 was clear before both smoke runs that did happen, so the reap is holding.

## The decision

1. Re-take all fifteen under a tightened rule, load under 5, matching the conditions the prior set was taken under. Comparable figures; on a host that has spent today between 20 and 70, the wait may be long and the re-point stays deferred meanwhile.
2. (Recommended) Commit the set as measured, with the host line naming the 6.31 to 7.76 starts and a sentence beside the rows saying the figures are not comparable with the `20298cc` set, the host load being the reason, exactly as the smoke reap is recorded. Then tighten the rule to load under 5 for every set taken afterwards, including the one gate-split U6b takes. Nothing is falsified, the lane unblocks, and the misleading threshold stops being a rule.
3. Leave `ref` at `20298cc` until a quiet window appears, and drop the fourteen runs.

Either 1 or 2 still needs one `npm run smoke` run, about 26 s, to complete the set: the check script requires three figures per cell.

## Answer

(pending)
