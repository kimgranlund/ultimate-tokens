# Pre-land request: pane-context (#785)

| Field | Value |
|---|---|
| Branch | plan/pane-context @ 7cbd4156180ea9b8cf970d0dc1489fee5df356c4 (U1 to U4 merged, main merged in at 620d0323, baseline ui.html figure repaired to 4172.1 KB, plan revision 13 re-pins C2.8 to schema 7) |
| Ticket | #785 (draft PR #797 open) |
| Scope | the whole diff `origin/main...plan/pane-context` |
| Criteria | C1.* to C4.* in `git show plan/pane-context:.sdlc/plans/pane-context.md`; unit verdicts `.sdlc/verdicts/pane-context-U1.md` to `pane-context-U4.md` (U4 pass 2 🟡 records-only) |
| Record to write | `.sdlc/verdicts/pane-context-prepr.md` with `sha: 7cbd4156180ea9b8cf970d0dc1489fee5df356c4` |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Baseline gates | npm test, npm ci and npm run build on this head; `baseline-agrees-check.sh` must print `stale total: 0` (NODE_OPTIONS unset); smoke; CI legs are the Conductor's |
| Reminder | R98: no overrides, shims, fallbacks or legacy layers (reviewer carries an `R98: none found` line); R97 even-mode Neutral shift accepted; revision 13 authority is `.sdlc/questions/pane-context-schema7.md` (default A, owner answer pending); compute-layers U3 and the 0.2.2 follow-ups wait on this landing |
