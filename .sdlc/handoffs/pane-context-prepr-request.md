# Pre-land request: pane-context (#785), pass 4

| Field | Value |
|---|---|
| Branch | plan/pane-context @ 06f7f553bba9aaea1570648bf1d0abfcf2ac6422 (U1 to U7 merged; U7 verdict 🟢 at 9f43f3fe, merge 8d4529a7; main merged in at 06f7f553 with `.sdlc/board.md` resolved to main's, the pane-context rows identical) |
| Ticket | #785 (draft PR #797 open, body refreshed with U7) |
| Scope | the whole diff `origin/main...plan/pane-context`; it now merges clean into main (`git merge-tree`); 56 non-`.sdlc/` paths |
| Criteria | C1.* to C7.* in `git show plan/pane-context:.sdlc/plans/pane-context.md` (revision 16); unit verdicts `.sdlc/verdicts/pane-context-U1.md` to `pane-context-U7.md` |
| Record to write | `.sdlc/verdicts/pane-context-prepr.md` with `sha: 06f7f553bba9aaea1570648bf1d0abfcf2ac6422` (pass 3 stays in git history) |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Baseline gates | npm test, npm ci and npm run build on this head; `baseline-agrees-check.sh` printed `stale total: 0` (ui.html 4170.9 KB); smoke; ceiling-counts and panda-smoke controls; CI legs are the Conductor's |
| Pass 3 finding | the one 🔴 (a false `tonal.js:109-110` comment and the same class in comments and records) was U7; re-verify it closed on this head, and re-run the "group target" sweep yourself |
| Reminders | R98: none found line; R97 accepted; owner answers: revisions 13 to 16 and U6 pass 3 and 4, all A. Not bars, report only: the vestigial `palette.chroma / 100` reads below `tonal.js:946` (follow-up issue), the headless-boot `fails` dump, the integrate-question authority, the `decision-records.md:828` in-place edit, and the three U7 out-of-lane finds (`anchor.mjs:505`, the SPEC-muted-base card line 4, spec REQ-007 banner). Compute-layers U3 waits on this landing |
