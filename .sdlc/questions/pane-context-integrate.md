# Question pane-context integrate · from builder

| Field | Value |
|---|---|
| Blocks | STEP 0 of U4 only: committing the merge of `origin/main` (0ef7b87b) into `unit/pc-U4` (2f45a4bb). Nothing of U4 itself is started |
| Raised by | the U4 builder, `unit/pc-U4`, merge in progress and uncommitted in `.worktrees/pc-U4` |
| Finding | Six conflicts resolved as the union (CHANGELOG, decision-records, `scripts/report-preset-fidelity.mjs` keep both sides; `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` taken from main for regeneration; `chroma-envelope.json` re-captured). After integration two things are not a textual conflict: (1) `--compare` against main's fixture prints `2 cells rose`; (2) `npm test` is red on one case. Details below |
| Governed by | the lead's STEP 0 stop rule (a risen cell, or an unattributable red engine test); `.sdlc/questions/pane-context-U2.md` Question 1 (owner, 2026-10-03: A accept); R94, R98 |
| Question | Proceed with the merge as resolved, with the fixture re-captured and the one pinned hash re-pinned, or stop? |
| Default if unanswered | A |
| Why not decided by the builder | The lead's rule says STOP on any risen cell, and a re-pin edits a U2 test that the lead did not name in the integration lane |

## Numbers

Fixtures, `node test/engine/chroma-envelope-gate.mjs --compare <base>` (copies under `$CLAUDE_JOB_DIR/tmp/pc-U4-b/`):

| Head fixture | Base fixture | perceptual | peak | even | Cells rose |
|---|---|---|---|---|---|
| main (0ef7b87b) | merge base (ba7a299e) | byte-identical | byte-identical | moved | 0 |
| plan head pre-merge (1e3fe1eb, U2) | merge base | moved | moved | moved | 2 (even 300 p90 `101.1588` vs `100.3224`; even above100 `503` vs `502`), the pair owner-accepted in U2 Question 1 A |
| merged tree re-captured (`19ce51c4`, the merge on `2f45a4bb`) | main | moved | moved | moved | 2 (even 300 p90 `100.2196` vs `100.0000`; even above100 `500` vs `499`) |

So the two risen cells are the same two cells, the same direction, that U2 already carried against its own base (rise `+0.84` and `+1` on the old base; `+0.22` and `+1` against main, because #766 had lowered the base to `100.0000` and `499`). The merged `perceptual` and `peak` lines say `moved` against main because the damper moves corpus subjects stored below 100, as C2.6 allows.

`npm test` on the merged tree: 53 of 54 files pass. The red one is `engine/tonal.mjs`, case `group-chroma-damper` row (i): `even Primary at 100 hashes 98d8a73594eb7383, not the pre-damper render 4ba0da5e00260a71`. Attribution: the pin is the 19-stop hex hash of the default kit's Primary at chroma 100 in `even`, captured from 306f9a9e's engine, which predates #766 (the per-stop floor reference). On a detached worktree of `origin/main` (0ef7b87b, no damper) the same hash script prints `perceptual 517576c558838c97`, `peak 5b1905c4160c2a85`, `even 98d8a73594eb7383`; on the merged tree it prints the identical three. So the damper at 100 is still the identity, and the stale value is the `even` pin: main's own at-100 even render moved with #766.

A sweep gate the merge also moved (found at the U4 pass 1 verdict, not at the merge):

| Gate | Result on the merged tree | Cause and fix |
|---|---|---|
| `npm run gate:even-dips` (CI `sweeps`) | `rc=1`, control (a) `0 dips (want > 0)`, where main reads `32` | #766's grid sits on the chroma axis 30/45/60, which since #785 never reaches `evenChroma` (the damper scales a chroma-100 render). The damper is correct (R94, R98); the gate's controls were derived before it. U4 pass 2 re-derives the gate (axis gains 100, (b2) renders at 100, pin 7 to 8 by R87's rule), no `src/` change. Record: `.sdlc/plans/pane-context-U4-rediagnosis.md`, `.sdlc/questions/pane-context-even-dips.md` (owner ruling A) |

## Options

- A (recommended): commit the merge with the re-captured `chroma-envelope.json` (U2's accepted pair carries forward, the numbers above go in the U4 handoff's "Integration of main"), and change one literal in `test/engine/tonal.mjs`, the `even` entry of `AT100` from `4ba0da5e00260a71` to `98d8a73594eb7383` with its comment saying the pin is main's at-100 render at 0ef7b87b. No code path changes.
- B: stop; ask U2's builder to rebase the damper onto main, re-capture and re-pin on `unit/pc-U2`, then re-merge `plan/pane-context`.
- C: ask the owner whether the +1 cell / +0.22 p90 should be driven back to main's `499` and `100.0000`; that needs an engine change inside the damper, which R98 forbids.

## Answer

| Field | Value |
|---|---|
| Chosen | A. 2026-10-03, authority: `pane-context-U2.md` Question 1 A (the two risen cells) and the lead's ruling for this question; the pinned even hash is re-pinned to main's at-100 render |
