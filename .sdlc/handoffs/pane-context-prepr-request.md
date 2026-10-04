# Pre-land request: pane-context (#785), pass 2

| Field | Value |
|---|---|
| Branch | plan/pane-context @ 1cfefe261c61651859cab986c71208c770279a59 (U1 to U5 merged; main merged in at 620d0323; U5 repaired the pass 1 reds: dead R69 group target, DD27, card-source-range, CHANGELOG Adia, C2.6 control) |
| Ticket | #785 (draft PR #797 open) |
| Scope | the whole diff `origin/main...plan/pane-context`; pass 1 findings in `.sdlc/verdicts/pane-context-prepr.md` (history, overwritten by pass 2) |
| Criteria | C1.* to C5.* in `git show plan/pane-context:.sdlc/plans/pane-context.md` (revision 14); unit verdicts `.sdlc/verdicts/pane-context-U1.md` to `pane-context-U5.md` (U4 pass 2 and U5 pass 1 are 🟡, records-only, fixed and checked) |
| Record to write | `.sdlc/verdicts/pane-context-prepr.md` with `sha: 1cfefe261c61651859cab986c71208c770279a59` |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Baseline gates | npm test, npm ci and npm run build on this head; `baseline-agrees-check.sh` must print `stale total: 0` (NODE_OPTIONS unset; ui.html 4170.7 KB); smoke; also run the ceiling-counts and panda-smoke controls pass 1 reported as not run; CI legs are the Conductor's |
| Reminder | R98: none found line; R97 accepted; revision 13 (`pane-context-schema7.md`) and revision 14 (`pane-context-prepr-p1.md`) both owner answer A; the integrate question authority is the lead's ruling, no owner answer recorded (report, not a bar); compute-layers U3 waits on this landing |
