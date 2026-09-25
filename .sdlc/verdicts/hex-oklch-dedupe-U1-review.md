PASS

# Review hex-oklch-dedupe U1 · pass 1 · reviewer-l2 · PASS

Head `54c7be66` on `unit/hx-U1`, B `625248316db62d7ed55947507c7300161db29f31` (`git merge-base origin/main HEAD`). Plan `.sdlc/plans/hex-oklch-dedupe.md` with the 2026-09-25 P4 revision. Diff and greps read at the head; U1-2, U1-3 and U1-4 rerun in `git clone -q --shared` copies under `$TMPDIR` (one at B, one at the head, one head control clone), deleted after. `npm test` was not run in the worktree, per dispatch. The worktree was not written except for this file.

## Rows

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | one conversion, false comment gone, public one and regex kept | 🟢 | `0`, `1`, `1`, `1` at the head | handoff's G0 run `7, 1, 0, 1`; B's text still carries all four needles (read in the diff) |
| U1-2 | engine anchor gate agrees | 🟢 | head clone: `exit 0`, `key-anchor` count `2`, `^  FAIL` count `0` (the run outlived the 600 s foreground cap at load 68 and finished detached; the task's own exit 1 is the last `grep -c` finding 0 FAIL lines) | head clone with `keyOklch: hexToOklch("#000000")`: `anchor ctl exit 0`, reproduced (the row reads hex only, as the plan says) |
| U1-3 | behaviour-neutral, measured | 🟢 | probe at B and at head: stderr `3780 3380` both times; `cmp 0` over a 581488-byte dump | head clone, `0.4122214708 * r` to `0.4122214709 * r` in `rgbToOklchArr`: stderr `3780 3380`, `before.json ctl.json differ: char 286, line 1`, `cmp 1` |
| U1-4 | agreement assertion in the suite and bites | 🟢 | `node test/ui/model.mjs`: `exit 0`, pass line count `1`, subjects `16` | head clone, `keyOklch: hexToOklch("#000000")`, `keyHex` kept: `exit 1`, `model FAIL (16):` first line `anchored palette "Neutral": keyOklch [0,0,0] must deep-equal hexToOklch(#576485) = [0.5055872104656467,0.055171795476485236,267.76109005365805]` |
| U1-5 | deletion is the whole source change | 🟢 | numstat `1 20`, added-line count `1`; deleted set matches the handoff (B `:871`, `:874` to `:878`, `:880` to `:892`, `:913`) | the handoff's appended-line clone (`2 20`, `2`) read, not rerun |
| P3 | no added em dash outside backticks | 🟢 | the P3 sweep on B..head: `0`; with `.sdlc/handoffs` included and backtick spans kept: `0` | not rerun; the handoff's control read |
| P4 | scope wall | 🟢 | `0`, `0` with the revised exclude list | the planner's three-name fixture, not rerun |

## Findings

1. Correctness, none. `src/ui/model.mjs:894` now returns `hexToOklch(keyHex)`; `hexToOklch` (`src/ui/model.mjs:836`) is `rgbToOklchArr(hexToRgb(...))` on the same matrices as the deleted `rgbToOklchLocal`. The only formal difference is the hue wrap (`(x + 360) % 360` against `((x % 360) + 360) % 360`), which agree for every `atan2` output in `[-180, 180]`; the U1-3 `cmp 0` over all 3780 corpus rows confirms it byte for byte, and the coefficient control shows the probe would see a last-digit change.
2. The surviving comment at `src/ui/model.mjs:871` to `:872` (the regex mirrors `prime.mjs`) still reads correctly with its lead line gone; no remaining text in `src/` or `test/` names the deleted helpers (`git grep` hits are only historical `.sdlc` records and this plan).
3. The citation repair at `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md:41` (`model.mjs:1100` to `:1081`) is correct: B's line 1100 and the head's line 1081 are the same `shadcn: exportShadcn(... radii: shadGeom.radii ...)` line, a shift of 19 that matches the 20 deleted and 1 added above it. The other `model.mjs` citations on that line (`:53-58`, `:669-725`) sit above the deletion and did not move. One line changed, the file is admitted by the P4 revision.
4. The test block at `test/ui/model.mjs:367` to `:394` asserts `anchored.length > 0` before its fallback, so an empty default kit reds rather than silently building a synthetic subject; the pinned pass line matches U1-4's grep exactly.
5. Nit, no action needed: the handoff's Branch row (`.sdlc/handoffs/hex-oklch-dedupe-U1.md:5`) names `52ad7ddc`; the head is `54c7be66`. The two later commits touch only the handoff, so every result it states still describes the head's code.

verdict: PASS, U1 at 54c7be66 meets U1-1 to U1-5 and P3 to P4 as rerun; no blocking findings
