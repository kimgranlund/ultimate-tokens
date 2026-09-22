---
kind: verdict
seat: conductor (pre-land record, light process for a one-unit plan)
plan: `.sdlc/plans/baseline-regex.md`, ticket #718, PR #729
verdict: 🟢
sha: 4ef00c35
---

# Verdict baseline-regex pre-land · 🟢 at 4ef00c35

Second record. The first named `492562b1` and a critic accepted that head (`ACCEPT at 880b4a36`, PR comment 5762684310, twelve constructed attacks, five of which red the check). The head then moved once more because `.sdlc/board.md` conflicted with main again, which is a structural race between plans rather than anything about this change (sdlc-orchestration#3). This record grades the head that resulted, and the rows below establish what changed since the accepted one.

The unit verdict is `.sdlc/verdicts/baseline-regex-U1.md`, 🟢 at `f57f99d3` by an independent verifier-l1, with both edge cases held and the `ms.length > 0` guard ablated to prove it load-bearing. No pre-land pair ran: the owner's standing ruling keeps one-unit changes light.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | The landing head carries the accepted head and current main | 🟢 | `git merge-base --is-ancestor 880b4a36 4ef00c35` and `git merge-base --is-ancestor origin/main 4ef00c35` both exit 0 | `git merge-base --is-ancestor f57f99d3 origin/main` exits `1`: the unit is not on main, so the test can fail |
| 2 | The shipped fix has not moved since the head the unit verifier graded | 🟢 | `git diff --stat 492562b1 4ef00c35 -- .sdlc/checks/baseline-agrees-check.sh` prints nothing; `grep -c matchAll .sdlc/checks/baseline-agrees-check.sh` prints `1` | in a copy of the head, replacing `matchAll(` with `match(` makes the same grep print `0` |
| 3 | The delta from the accepted head is the board merge and the record nits only | 🟢 | `git diff --name-only 880b4a36 4ef00c35` lists `.sdlc/board.md`, `.sdlc/handoffs/baseline-regex-checkability.md`, and nine records arriving from main under `records-followup`; no plan file of this ticket and no check script | the same command against `f57f99d3` lists the check script, so a shipped-code change in the delta would show |
| 4 | The fixed check reds a disagreeing second range at the landing head | 🟢 | clean tree: `sh .sdlc/checks/baseline-agrees-check.sh` ends `stale total: 0`, exit 0 | in a copy of the head, a second range planted into the `test` row of `.sdlc/adapter.md` (file hash changed, so the plant took) prints `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s` and `stale total: 1` |
| 5 | Scope: nothing outside `.sdlc/`, nine paths | 🟢 | `git diff --name-only origin/main 4ef00c35 \| grep -vc '^\.sdlc/'` prints `0` over nine paths | the same pipeline over `origin/main` against `plan/preset-intent-fidelity` prints a non-zero count, since that plan ships source |
| 6 | Branding clean and no em dash added | 🟢 | `node test/repo/branding.mjs` prints `branding: clean (530 files scanned)`; the added-line em-dash probe with `perl -CSD` prints `0` | the branding gate reds a copied file naming the retired maker brand, per the plan's P4 control, re-measured by the lane in an isolated worktree as `clean (527 files scanned)` then `FAIL: 3 branding violation(s) across 528 files` |
