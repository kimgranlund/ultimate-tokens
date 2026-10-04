# Rework U3 pass 3 · orchestrator to builder

| Field | Value |
|---|---|
| Branch | unit/pb-U3 @ ee0a38b0 (pass 2 code fb7f69f1, review p2 FAIL on top) |
| Worktree | /Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/pb-U3 |
| Grade | builder-l5 (owner ruling, `.sdlc/questions/parallel-batch-U3-pass3.md`) |
| Why | `.sdlc/plans/parallel-batch-U3-rediagnosis.md` (read all of it first); reviews `.sdlc/reviews/parallel-batch-U3-review.md` and `-review-p2.md` on the unit branch |
| Criteria | `### U3 criteria` C3.1 to C3.6 in `.sdlc/plans/parallel-batch.md` on main (plan revision 7) |
| Lane | unchanged: `src/engine/names.mjs`, `test/engine/names.mjs`, the `TESTS` line of `test/run.mjs`, the handoff. No edit to `exports.js` or `ds-export.js` |

## Owner rulings
- Contract A: the 10 formats plus the 3 DS bundles (Claude Design, Stitch, Make), each installed as documented; position-independent superset. Reported, not refused: Panda and Radix presets in one config, a palette against a kit constant, a single palette duplicating itself.

## Do
1. Rewrite `emittedNames` per re-diagnosis section 3: a sentinel-slug probe palette (every key role, `on: true`) run through every surface once per process, memoized; names read back from output, never a hand table. Registry of surfaces in `names.mjs`, one reader each (css/oklch/tailwind/shadcn custom properties, json/dtcg/ui3 group key, panda/radix/radixRef path joined with `-` with `DEFAULT` collapsed, DESIGN.md frontmatter keys, `tokens.json` keys, `styles.css` and `dsFullLayersCss` custom properties).
2. Module header: the contract paragraph with the literal phrase `Reported, not refused` (C3.5).
3. Test: C3.1 extra cases, C3.2 (i) to (iii) with the three printed lines, C3.5, C3.6, each with its negative control run and recorded in the handoff.
4. Keep C3.3 (purity) and C3.4 (count 55) green. `npm test` (unset NODE_OPTIONS; heavy-load count 5 or fewer is fine; poll inside your turn, never end the turn waiting), tree clean.
5. Handoff: append a pass 3 section with the measured counts (name count read, not stated; the `surfaces`, `oracle` lines). Commit on `unit/pb-U3` with `Seat: builder`, return the sha.
