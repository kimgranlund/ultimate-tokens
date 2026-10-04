# U3 brief · compute-layers (#788) · orchestrator to builder

| Field | Value |
|---|---|
| Worktree | `.worktrees/cl-U3`, branch `unit/cl-U3`, from `plan/compute-layers` (main through 82a34993 and the ceremony policy merged in; #785 is on main) |
| Spec and criteria | plan `.sdlc/plans/compute-layers.md` section `### U3: one evaluator`, C3.1 to C3.3, plus the plan's design text for `compute(doc)`, `projectView`, `derivedAll`, and the `IDENT` definition (line 45). Read U1 and U2 handoffs in `.sdlc/handoffs/compute-layers-U1.md` and `-U2.md` first |
| Grade | builder-l5, reviewer-l3, verifier-l2 (engine code, risky) |
| Lane | `src/engine/layers.mjs`, `src/engine/exports.js`, `src/ui/model.mjs`, `test/engine/layers.mjs`, `test/run.mjs` (the `TESTS` line, append-only), `scripts/bundle.mjs` and `scripts/gen-describe-mcp-assets.mjs` only if the new import graph needs a MODS/KEY or asset registration (name it in the handoff), regenerated bundles, your handoff. Parallel-batch has merged `src/engine/names.mjs` and U4 edits in `src/ui/sections/color.js` onto main: do not touch `color.js` |
| Merge note | the merge into this branch already ported main's `controlsOf` comment into `resolveControls`; `hueSpace` now defaults to `"oklch"` there (U1's ruled default, `IDENT` is the check) |
| Handoff | `.sdlc/handoffs/compute-layers-U3.md` in the worktree: C3.1 to C3.3 rows with commands, output and one negative control each (scratch clones under `/Users/kimba/.claude/jobs/8c58a81c/tmp/cl-U3/`), `presets N` and the `0 differing cells` lines for both `IDENT` runs |
| Owner ceremony | only code or behavior defects block; wording goes to follow-ups; do not polish docs in this unit |
| Rules | R98 (computation first: one evaluator, no per-caller special cases, no fallback); no U+2014; `node test/repo/em-dash.mjs` and `branding.mjs` clean; `unset NODE_OPTIONS`; heavy count (`ps -Ao command \| grep -E 'test/run.mjs\|gate:\|--full' \| grep -vc grep`) 5 or fewer before `npm test`, `npm run build` or `IDENT`: wait inside your turn; `npm ci` first; commit `Seat: builder` plus Co-Authored-By; do not push; never end the turn waiting. The host is loaded and `npm test` can take 30 minutes: start it once, in the background, and poll its output file |
