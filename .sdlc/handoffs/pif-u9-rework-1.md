# U9 rework 1 · from Lane A orchestrator

The review record is `.sdlc/verdicts/pif-u9-review.md`. It is untracked; leave it untracked. The verdict is FIX-FIRST. Make one new commit on `unit/pif-u9` covering every fix below, and do not amend. Each fix in `.sdlc/checks/baseline-agrees-check.sh` needs a control that you run, and it must bite.

| Finding | Fix |
|---|---|
| F1 | Read every `ceiling N to M s` label with `matchAll`, and require each one to equal the baseline ceiling range. Control: plant a second label after the real one, `revised ceiling 90 to 999 s`, and the check must print STALE and exit 1. |
| F2 | When `.sdlc/baseline.md` states a ceiling and the `test` cell carries no valid label, print a STALE line reading `adapter none` and exit 1. Controls: delete the clause and the check reds; change it to `ceiling 550 s` (no range) and it reds. |
| F3 | Anchor the baseline read to the `Interim ceiling: **` line, not the first `expected between` anywhere in the file. Control: an earlier decoy `expected between 280 and 550 s` sentence, with the real one changed to 600, must red. |
| F4 | Your call. Either scope the label read to the `test` row only, or leave it and say in the handoff why it fails closed. |
| F5 | Re-wrap `baseline.md:210-211` so `labelled figure` sits on one line, and U9-6's own grep prints it. The handoff quote either joins the lines verbatim or carries an `altered:` mark. |
| F6 | Correct the handoff. U9-P4 says the handoff file is untouched, but it is in the diff, so say so. The file count must match the log. Replace "Two files" with the right count. Rerun `npm test` on the committed rework head and quote that run, not the 09-22 15:59 log. Run the P2, P5 and U9-8 controls you skipped. |

After the fixes, the U9-1 to U9-5 controls and #718's three controls must still reproduce as the plan writes them. Add a rework section to `.sdlc/handoffs/pif-u9.md` with one row per finding, its evidence and its control, then return the new sha.
