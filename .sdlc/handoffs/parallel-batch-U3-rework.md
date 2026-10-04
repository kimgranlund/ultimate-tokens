# Rework U3 pass 2 · orchestrator to builder

| Field | Value |
|---|---|
| Branch | unit/pb-U3 @ 584db9e2 (code d72d7e5b, review commit on top) |
| Worktree | /Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/pb-U3 |
| Review | `.sdlc/reviews/parallel-batch-U3-review.md` on the unit branch, FAIL |
| Grade | builder-l4 (pass 2 never below pass 1) |
| Lane | unchanged: `src/engine/names.mjs`, `test/engine/names.mjs`, the TESTS line, the handoff |

## Fix

1. F1 (🔴): the predicate must cover every name the exporters join onto a slug, not only the CSS exporter's. The Tailwind exporter (`exports.js` near `:785`) writes unpadded stops, so palettes `x` and `x-50` collide there and `nameCollisions` returns nothing. Read each exporter's own naming (CSS, Tailwind, and Panda or any other that keys by slug), take the union, and prove it by an equality test against what each exporter actually emits for a one-palette state, as the CSS one already does. Add a C3.1 case where `(x, x-50)` must collide. If Panda or another format keys names differently, say what you measured.
2. F2 (🟡): `nameCollisions` receives palette objects, so fold in the opt-in key colour names (`-key-{role}`) where `palette.keyColors` shows them. Keep `emittedNames(slug)` as is if a slug alone cannot know.
3. F4 (nit): make the prefix-heuristic negative control exercise the module, not a helper inside the test.

Re-run the C3.1 to C3.4 greps, `npm test` (unset NODE_OPTIONS; load count 5 or fewer, poll inside your turn), keep the tree clean, append a pass 2 section to the handoff, commit on `unit/pb-U3` with `Seat: builder`, return the sha.
