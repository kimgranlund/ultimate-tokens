# Question U1 · from okl-U1-builder-l2

| Field | Value |
|---|---|
| Blocks | U1 P1 (`npm test` green) |
| Question | `_okL` deleted per plan; `test/repo/citations.mjs` now reds because `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89` cites `src/engine/tonal.js:926` (the old `_okL` line, now my no-cache comment) to support a now-false claim about a module-level memo. The plan's scope wall rules that whole directory "untouched" (dated review records); P4 would fail if I edit it. Does U1's scope widen by this one line to repair the stale citation, or does an owner ruling waive this citation-gate red for U1? |
| Options | A widen scope one line, correct the stale sentence (recommended: repairs a now-false record, keeps P1 green, no judgment call, matches CLAUDE.md's stale-record rule) · B owner ruling waives this `npm test` red for U1, file it as a follow-up instead |
| Default if unanswered | A |

Everything else in U1 is done and verified by hand (memo gone, `okl-order` gate green both directions, seven color-math lines repaired). This is the only blocker to committing.

## Answer (2026-09-24, orchestrator)

A. Plan revision 3 widens P4 by this one file, and the builder corrects the stale sentence at `00-synthesis.md:89` in U1. The same repair class as achromatic-anchor revision 3 on the same file.
