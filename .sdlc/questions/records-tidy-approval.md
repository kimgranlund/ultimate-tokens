# Approval: plan records-tidy

date: 2026-09-20
asked by: conductor (sdlc-ultimate-tokens-conductor)
answered by: human (Kim Granlund)
refers to: .sdlc/verdicts/k17-rerun-prepr.md concerns 2, 4, 6

## Q1
Question: k17-rerun landed (PR #711, squash 41b2877e, #710 closed, plan archived) and the plugin repo has the sha. The pre-land record left three stale-record items with me: architecture.md line 18 still says pass 5 is K17's current reading; debt.md line 92 still says the K17 control filters 3 files (it is 7); adapter.md section 2.1 says the pre-land reviewer is l3 while the plugin skill says l4 (l4 is what ran). All three are one-line record fixes, but they need a plan, which you told me to stay out of. How do I take them?
Options:
- One more exception: a single S plan (Recommended): plan records-tidy, one unit, exactly those three lines plus its own records
- Leave them, note only
- The other session takes them
Chosen: One more exception: a single S plan (Recommended)

## Q2
Question: Plan records-tidy passed the checkability review on pass 2 (8 of 8). One S unit, builder-l1, reviewer-l1, verifier-l1: architecture.md line 18 points K17's current reading at pass 6; debt.md line 92 quotes the map's current 7-file filter; adapter.md section 2.1 gets a dated amendment stating the pre-land reviewer is l4 (fable, cross-family) and why. Criteria: each line replaced exactly and the old text gone; zero other deletions per file; npm test green; branding; scope wall by naming rule; the A2 verdict's seven C31 counts unchanged. Approve for mobilization?
Options:
- Approve (Recommended)
- Hold
Chosen: Approve (Recommended)

## Q3 (2026-09-20)
Question: records-tidy pre-land is 🟢 at 1884b5ef and the adapter gate accepts the record. Verifier-l3: 14 rows, 12 🟢, 2 🟡, 0 🔴 (npm test ran 101 s under load 12 on 10 cores, exit 0, 48/48, tree clean; the head moved once for an em dash fix and the affected rows were re-run). Reviewer-l4: 0 🔴, its one 🟡 fixed. CI was green at the previous head and re-runs on 1884b5ef once pushed. Squash-merge PR #714 when CI is green on that head?
Options:
- Land it (Recommended)
- Hold until after the restart
Chosen: Land it (Recommended)
