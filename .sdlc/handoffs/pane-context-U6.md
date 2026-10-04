# Handoff: pane-context U6 (#785)

Branch: `unit/pc-U6` (off `plan/pane-context` @ 24b9d01c), head recorded in the commit below.

## Files

| File | Change |
|---|---|
| `.sdlc/records/cards/ADR-026.md` | Decision line: stop 500 is the anchor only at group 100 (R94); amended-by row names the five amendments |
| `.sdlc/records/index.md` | line 41 lineage cell names the five amendments |
| `docs/spec/spec-muted-base-key-spikes.md` | #785 banner names EX-1 and AC-003(a); EX-1 and AC-003(a) state the chroma-100-only identity and the damped fixture |
| `test/engine/tonal.mjs` | two comment lines above the `hpg-tonal-intensity-legacy` case header, no code line |

No asset regenerated: `npm test` left the tree clean. `.sdlc/baseline.md` untouched (no ui.html movement). The plan file is untouched (C6.4 belongs to the Orchestrator).

## Ran

| Command | Result |
|---|---|
| `npm test` (NODE_OPTIONS unset, 0 competing gate processes) | all 54 test files passed, exit 0, tree clean after |
| `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` |
| `node test/repo/em-dash.mjs` | clean (1150 files) |
| `sh .sdlc/checks/card-amendment-check.sh` | `stale total: 0` |
| `FORCE_COLOR=0 node test/engine/tonal.mjs` | exit 0 |
| `git diff --stat 24b9d01c` | the four lane files only |

## Criteria

| # | Evidence |
|---|---|
| C6.1 | `grep -c 'in all three tone modes' .sdlc/records/cards/ADR-026.md` reads `0`; the Decision line reads "at ramp stop 500 only at group 100 (R94: a group value below 100 damps the whole ramp, stop 500 included, ...)"; the amended-by row and `index.md:41` name #701, #725 (R69), #785 (R94 to R98), #766 (R85, R87), #785 (#766) |
| C6.2 | `grep -n 'EX-1' docs/spec/spec-muted-base-key-spikes.md` lists `:14` (the banner) and EX-1 with the chroma-100-only sentence (20/25 perceptual, 13/25 even) |
| C6.3 | `git diff -U0 test/engine/tonal.mjs \| grep '^+[^+]' \| grep -vc '^+//'` reads `0`; the header says 14 of 16 defaults, not pre-0.2.0 identity; SPEC AC-003(a) says the same; `tonal.mjs` exits 0 |
| C6.4 | not this builder's lane (Orchestrator, plan file) |
| C6.5 | the Ran rows above; `git status --porcelain` empty after commit |
