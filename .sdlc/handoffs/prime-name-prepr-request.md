# Pre-land request: prime-name (#789)

| Field | Value |
|---|---|
| Branch | plan/prime-name @ fc35d88156891781ae2bff8290405718fc77ac0a (U1 and U2 merged, main merged in, baseline ui.html figure repaired to 4162.0 KB) |
| Ticket | #789 (draft PR open) |
| Scope | the whole diff `origin/main...plan/prime-name` |
| Criteria | C1.* and C2.1 to C2.5 in `git show plan/prime-name:.sdlc/plans/prime-name.md`; unit verdicts `.sdlc/verdicts/prime-name-U1.md` 🟢, `.sdlc/verdicts/prime-name-U2.md` 🟢 pass 2 |
| Record to write | `.sdlc/verdicts/prime-name-prepr.md` with `sha: fc35d88156891781ae2bff8290405718fc77ac0a` |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Baseline gates | npm test, npm ci and npm run build on this head; `baseline-agrees-check.sh` must print `stale total: 0` (run with NODE_OPTIONS unset); CI legs are the Conductor's |
| Reminder | schema 3 to 4, MCP 0.4.0, Adia artifact versions oklch 2.0.0 and radix 1.3.0 are accepted; md-prefix and compute-layers U4 wait on this landing |
