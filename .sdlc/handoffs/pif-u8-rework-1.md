# U8 rework 1 · from Lane A orchestrator

The review (`.sdlc/verdicts/pif-u8-review.md`, untracked, leave it untracked) is FIX-FIRST. Every fix is to a record. Put them all in one new commit on `unit/pif-u8`. Do not amend.

| Finding | Fix |
|---|---|
| F1 | The r13-291s log header points at `.sdlc/handoffs/pif-preland-fixes.md`, which was never written. Point it at `.sdlc/handoffs/pif-u8.md`, or say plainly that it was never written. |
| F2 | The U8-3 row in `pif-u8.md` must not contain the string it forbids. Describe it without the literal. Drop the claim that every path resolves, since F3 shows two do not. |
| F3 | Mark `.git-worktrees/lane-a-notes/...` citations as local only and gitignored, or copy the brief into `.sdlc/records/` and cite that copy. Your call. |
| F4 | The comments in `test/engine/anchor.mjs` and `test/engine/prime.mjs`, and the handoff, say "the same defect class as #718", not "#718's defect". Rerun both test files after the edit. |
| F5 | `pif-u7-review-1.md:12` states that the `5.86e-1` figure needs a source change the README does not describe. |

Then rerun `node test/repo/branding.mjs` and the net em-dash count on the new diff. Add a rework section to `pif-u8.md` with one row per finding and its evidence. Return the new sha.
