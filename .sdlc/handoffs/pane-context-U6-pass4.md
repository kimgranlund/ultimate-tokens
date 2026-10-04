# Pass 4 brief U6 · orchestrator to builder-l4

| Field | Value |
|---|---|
| Unit | pane-context U6 (#785), worktree `.worktrees/pc-U6`, branch `unit/pc-U6` @ a282dd2b, port 3001 |
| Authority | Owner Question 3 answered A, `.sdlc/questions/pane-context-prepr-p2.md @ 87750a9f` |
| Verdict | `.sdlc/verdicts/pane-context-U6.md` 🔴 at a282dd2b (read it first) |

## The fix (one clause, one file)
`docs/lld/lld-muted-base-key-spikes.md:170-172`: DELETE the clause "R94: 14 of the 16 defaults moved, Secondary and Warning did not". Keep the qualifier "since #785 that identity holds only for a palette whose group is at 100, a group below 100 damps the whole ramp". Add no count, no new claim. Re-read the sentence so it parses after the cut.

## Also, in the same pass (records only)
1. Handoff `.sdlc/handoffs/pane-context-U6.md`: correct the pass 3 sweep table total (531 vs the stated 546) and the wrong `tonal.js:754` row; state the matcher missed hyphen and no-space spellings (7 files, none live).
2. Run C6.5's build control (`npm run build` needs node_modules, `npm ci` in the worktree if absent) and record the result in the handoff, or state why it was not run.

## Rules
- No other file than the LLD line and the handoff. Run `grep -rn '14 of the 16' docs src test .sdlc/records` and report every hit (a live one is a finding, not a silent edit).
- Cite the verdict's 🔴 line by quoting the new LLD text in the handoff.
- `unset NODE_OPTIONS`; heavy-load check before `npm test` (3 or fewer); `npm test` green; no U+2014; commit on `unit/pc-U6`, trailer `Seat: builder`.
- Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U6-p4/`. Return a handoff section "Pass 4" with the sha.
