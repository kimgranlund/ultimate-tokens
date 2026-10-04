# Brief U7 · orchestrator to builder-l3

| Field | Value |
|---|---|
| Unit | pane-context U7 (#785), worktree `.worktrees/pc-U7`, branch `unit/pc-U7` off plan head 96409def, port 3001 |
| Criteria | `### U7` C7.1 to C7.4 in `.worktrees/pc-U7/.sdlc/plans/pane-context.md`; lane on the `- [ ] U7` line |
| Authority | owner answer A, `.sdlc/questions/pane-context-prepr-p3.md @ e4be5f06` |
| Source | `.sdlc/verdicts/pane-context-prepr.md` pass 3 🔴 (the `tonal.js:109-110` comment) and the 🟡 lines on LLD `:62` and reactivity review `:27` |

## Lesson from U6 (it took four passes)
The sweep is the work. Define the class first, then grep with hyphen, no-space and plural spellings, classify EVERY hit in a table in the handoff (true as written, fixed, history with the reason), and make the table sum to its stated total. Fix every live false hit in the same pass; a lane file you need that is not listed goes to the Orchestrator as a question, not a silent edit.

## Rules
- Comments and records only. No code line, test logic or pixel moves. The vestigial `palette.chroma / 100` reads are a follow-up issue, leave them.
- R98: no override, shim or fallback; report `R98: none found` in the handoff.
- `unset NODE_OPTIONS`; heavy-load check (3 or fewer) before `npm test`; `npm ci` then `npm run build`; no U+2014; regenerate assets only if a comment moves them.
- Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U7/`. Commit on `unit/pc-U7`, trailer `Seat: builder`; write `.sdlc/handoffs/pane-context-U7.md` in the worktree (sweep table, gates, sha) and return the sha.
