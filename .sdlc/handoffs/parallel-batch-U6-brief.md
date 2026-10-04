# U6 brief · parallel-batch (#787 UI) · orchestrator to builder

| Field | Value |
|---|---|
| Worktree | `.worktrees/pb-U6`, branch `unit/pb-U6`, from `plan/parallel-batch` (U3 `names.mjs` and U4 are merged) |
| Lane | trivial lane: one builder, one reviewer, merged on the reviewer PASS (owner rules R4, R7). Grade builder-l2, reviewer-l1 |
| Spec and criteria | plan section 3 `### U6` and section 5 `### U6 criteria` (C6.1 to C6.5), plus the wave B brief rules in `.sdlc/handoffs/parallel-batch-waveB-brief.md` |
| Predicate | `src/engine/names.mjs`: `nameCollisions` and `emittedNames`; read its header (the contract: 10 formats plus 3 DS bundles; reported, not refused: Panda plus Radix together, a palette against a kit constant, a self-duplicating palette) and call it as is. U3 is verified: do not edit it |
| Also in this unit | `src/ui/styles.css:1359` says "21-step"; the ramp has 11 stops, fix the wording (comment or text only, whichever it is) |
| Notes from U3 | the first call costs about 120 ms (memoized after), so call it on `change` only, never per keystroke; `templateNames()` returns the memo's mutable `Set`, never mutate it |
| Handoff | `.sdlc/handoffs/parallel-batch-U6.md` in the worktree: criteria rows with commands and output, one negative control per C6.x in a scratch clone under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U6/` |
| Rules | no U+2014; `node test/repo/em-dash.mjs`, `branding.mjs` clean; R98 (one predicate, no special cases); `unset NODE_OPTIONS`; heavy count 5 or fewer before `npm test` or `npm run build`, wait inside your turn; `npm ci` first; commit with `Seat: builder` plus the Co-Authored-By line; do not push; never end the turn waiting |
