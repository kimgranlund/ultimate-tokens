---
kind: verdict
seat: conductor (pre-land record, light process for a one-unit plan)
plan: `.sdlc/plans/baseline-regex.md`, ticket #718, PR #729
verdict: 🟢
sha: 492562b1ae66ccd35700937b87ae5d3c7ae34dd3
---

# Verdict baseline-regex pre-land · 🟢 at 492562b1

The unit verdict is `.sdlc/verdicts/baseline-regex-U1.md`, 🟢 at `f57f99d3` by an independent verifier-l1, with both edge cases held and the `ms.length > 0` guard ablated to prove it load-bearing. No separate pre-land pair ran: the owner's standing ruling keeps one-unit changes light, and this plan is one unit. The rows below establish only what changed between the verified unit head and the landing head: a merge of `origin/main` to clear a `.sdlc/board.md` conflict, which GitHub would otherwise have refused to run CI on.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | The landing head carries the verified unit head and current main | 🟢 | `git merge-base --is-ancestor f57f99d3 492562b1` and `git merge-base --is-ancestor origin/main 492562b1` both exit 0 | `git merge-base --is-ancestor f57f99d3 origin/main` exits `1`: the unit is not on main, so the test can fail |
| 2 | The fix is byte-identical to what the verifier graded | 🟢 | `git diff --stat f57f99d3 492562b1 -- .sdlc/checks/baseline-agrees-check.sh` prints nothing; `grep -c matchAll .sdlc/checks/baseline-agrees-check.sh` prints `1` | in a copy of the head, replacing `matchAll(` with `match(` makes the same grep print `0` |
| 3 | The fixed check reds a disagreeing second range at the landing head | 🟢 | clean tree: `sh .sdlc/checks/baseline-agrees-check.sh` ends `stale total: 0`, exit 0 | in a copy of the head, a second range planted into the `test` row of `.sdlc/adapter.md` (file hash changed, so the plant took) prints `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 1`, exit `1` |
| 4 | Scope: nothing outside `.sdlc/` | 🟢 | `git diff --name-only origin/main 492562b1 \| grep -vc '^\.sdlc/'` prints `0`, over eight planned paths | the same pipeline over `origin/main` against `plan/preset-intent-fidelity` prints `61` |
| 5 | Branding clean and no em dash added | 🟢 | `node test/repo/branding.mjs` prints `branding: clean (526 files scanned)`; the added-line em-dash probe with `perl -CSD` prints `0` | the branding gate reds a copied file naming the retired maker brand, per the plan's P4 control, which the unit verifier reproduced |
