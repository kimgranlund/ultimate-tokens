---
kind: verdict
plan: records-policy
seat: verifier
pass: 1
pr: 732
ticket: "#722, #721"
written: 2026-09-24
---

# Pre-PR · records-policy · pass 1 · 🟢 at `7ef88531`

verdict: 🟢
sha: 7ef88531c175ce2f3245d4570d64d584ef66f881

`plan/records-policy` at `7ef88531`, draft PR #732, two units, both 🟢 on their own verdicts.

The pair:

- **Review leg:** the Orchestrator dispatched it, not me, and its report names no grade. It was fresh
  and read-only. Round 1 at `699344f5` closed 🟡 on two record-text findings. Round 2 at `7ef88531`
  closed `verdict: 🟢`: `/var/folders/0b/jf4lh4jd4sd9y2q7x271c9jm0000gn/T/records-policy-prepr-review-p1.md`.
- **Verification leg:** I dispatched it as `verifier-l3` at `699344f5`: `/tmp/v13/rp-prepr-verify.md`.

The head then moved by revision 6 alone, a plan-text change that restores P4's control text under
ruling A. So the graded rows carry to `7ef88531` on custody, and I reran at `7ef88531` every row
that change could move.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C1 | nothing ungraded lands | 🟢 | `git diff --stat 699344f5 7ef88531`: `.sdlc/plans/records-policy.md` only, `3 insertions(+), 2 deletions(-)`; mine: `decision-records.md`, the generator and `.sdlc/records` are `same` at both; the leg: those paths equal their blobs at U2's `ec03c157` and U1's `2be1fc71` | at `0fb47573` (main) the same paths differ: U2-5's control printed `0` and `No such file` ×3 there |
| P1 | `npm test` green, no `node_modules` | 🟢 | the leg at `699344f5`: `✓ all 49 test files passed`, exit `0`, tree `0`; CI `build-test` `success` at `7ef88531`, run `35947572996` | the leg's `//` to `/*` plant: exit `1` |
| P2 | branding, no added prose dash | 🟢 | mine at `7ef88531`: `branding: clean (665 files scanned)`; revision 6's added lines, backticks stripped: `0` | the leg's plants: a prose dash line `1`; a name plant `FAIL` |
| P3 | scope wall | 🟢 | mine against main's merge base: `0`; the leg: `0`, `0` | a real engine-file plant: `1`, `1` |
| P4 | the generator's outputs do not move | 🟢 | the leg: `0`, `0`. Under ruling A the plant is on the version the row reads at the pre-land base, `1.2.0` to `1.2.1`, and revision 6 restores the row's own text to `1.1.0` as that ruling asks | the `1.2.0` to `1.2.1` plant: first figure `1`; the written `1.1.0` string matches `0` lines, so the version is named here as the ruling requires |
| U1 | U1-1 to U1-5 | 🟢 | the leg reran all five at `699344f5`, with U1-3 planted under ruling A as P4 was; the plan-only delta moves none of them | each reds on its plant (report) |
| U2 | U2-1 to U2-8 | 🟢 | the leg reran all eight at `699344f5`; card ranges `696-728`, `730-768`, `770-816`, checked by hand | each reds on its plant (report) |
| K | every check | 🟢 | mine at `7ef88531`: `stale total: 0`, `stale total: 0`, `range mismatches: 0`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, `verdicts 115 graded 115 bad 0`, `ceiling-counts: clean` | the leg planted a fault in each; the two scripts that exit `0` when stale printed `stale total: 1` and `range mismatches: 2` |
| X1 | CI on this sha | 🟢 | run `35947572996` at `7ef88531`: `build-test`, `panda-smoke`, `corpus-contrast` `success` | at `699344f5` the leg cited a different run, `35946229341`, so the call is sha-specific |
| X2 | the PR | 🟢 | `7ef88531`, draft, `MERGEABLE`, `CLEAN` | the head sha compared with the target: equal |
| X3 | the merge onto main | 🟢 | mine: `git merge-tree --write-tree origin/main 7ef88531` exit `0`; the leg at `699344f5`: the merge tree equals the head tree, and it passes the verdict check at `verdicts 115 graded 115 bad 0` | the leg's planted `patch`-line conflict: exit `1` |
| B | `npm run build` | 🟢 | the leg: exit `0`, `wrote figma/plugin/ui.html 4119.1 KB`, tree `0` | the baseline's `4119.1 KB` agrees (`baseline-agrees`: `stale total: 0`) |

## Carried, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| L1 | the review leg's provenance | 🟡 | the Orchestrator dispatched it and it names no grade; `pre-land-review` has the Verifier seat dispatch a `reviewer-l4`. I accepted it because it is fresh and read-only, and its round 1 found a real text defect that revision 6 fixed | its round 1 closed `verdict: 🟡`, so it does not pass everything |
| L2 | the PR body is stale | 🟡 | it still says U2 waits on G0 and has no pre-land table; the title `chore(sdlc): records-policy, the bump policy and ADR-027 (#722, #721)` fits the grammar | `gh pr view 732` at landing |
| L3 | `npm test` wall time | 🟡 | `9:20.06` at load `12.90`, above the ceiling; host contention, not the diff, which touches no test input | CI's `build-test` on the same tree: `success` |
| L4 | review notes outside the scope wall | 🟡 | adapter §6 still names the old heading glyph and "append after ADR-022"; `3bb6b645` lacks a `Seat:` trailer; the U1 review cites `plan/preset-intent-fidelity`, which is no longer on the remote (the text is at `origin/main` lines 65 to 69) | a follow-up, not this plan |

verdict: 🟢
sha: 7ef88531c175ce2f3245d4570d64d584ef66f881
