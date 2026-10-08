<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- (red) smoke.mjs has `data-radius` and `--radius-control`: pass. Evidence: grep exit 0 on the built tree; exit 1 at base sha 0da75c3c in a throwaway worktree (so the check can go red). The diff adds the resolver block at test/smoke/smoke.mjs:265-281.
- (guard) `node --check test/smoke/smoke.mjs`: pass. Evidence: exit 0.
- (red) `--control-height` in geometry-tokens/SKILL.md: pass. Evidence: grep exit 0 on the built tree; exit 1 at base.
- (red) no retired tokens or knobs under geometry-tokens: pass. Evidence: both negated greps exit 0 on the built tree; exit 1 at base. SKILL.md "Migrating from the step ramp" (line 95) gives the migration note in words, and SKILL.md/detail.md teach the four axes, the cell and role names, the glyph rules (text-sized indicator, gap = inset / 2, badge = height - inset with `--radius-inset`, icon-only control is a height square) and `--chip-*`, `--radius-mark/-inset/-card`.
- `node test/plugin/geometry-tokens.mjs`: pass. Evidence: "dimension-parity PASS, every dimension token in 5 files matches the engine (27 cells x 14 fields, 13 roles)" and "plugin PASS". At base the same command prints "plugin FAIL: geometry-tokens skill drifted from the geometry engine", so it is red-then-green as the handoff says.
- Runtime behavior (108 nested cases, `getComputedStyle` of `--control-height` and `--radius-control` equals the engine's cell values): pass. Evidence: I ran `npm run smoke` here (real headless Chrome). Output: "✓ geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height and --radius-control to the engine's cell values", the `.geom-ctl` check is still there, and the run ends "SMOKE PASS". The block nests tier + decoy `data-size="lg"` + `data-radius`, then scale, then size, so a broken nearest-ancestor cascade would show up as a mismatch. I did not re-run the builder's mutation controls (72 of 108 off without the inner `data-size`, 73 of 108 off without `data-radius`); I only read the probe code.

## Out of scope changes
None. `git diff --stat` lists the 7 expected files: the geometry-tokens skill (SKILL.md, 4 references, scripts/dimension-parity.mjs) and test/smoke/smoke.mjs. `npm run smoke` rebuilt figma/plugin/ui.html. I restored that generated file with `git checkout`, so the tree holds only those 7 files. Neighbor gates: all five test/plugin/*.mjs pass, and em-dash and branding are clean.

## For the next attempt
None. One note for the records step: the comment in test/plugin/geometry-tokens.mjs still says ".control-* class it names must match" (outside this step's scope). The `repo/citations.mjs` red the builder reported is inherited from base, and I did not re-run it.
