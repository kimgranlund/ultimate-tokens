<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `test/repo/control-text.mjs -> test/repo/shell-text.mjs`: renamed with `git mv` (the rename is staged) and rewritten as the wider gate. It has ALLOW, the named chrome exceptions, PENDING for steps 4 to 8 (with `.radix-tip` in step-4), a `--strict` flag, a path argument, and the negative controls plus one allow-list positive.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/test/run.mjs`: `"repo/control-text.mjs"` replaced with `"repo/shell-text.mjs"`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/.claude/CLAUDE.md`: the test layout line now names `test/repo/shell-text.mjs` and says it gates text on every shell rule.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/.claude/skills/building-editor-sections/SKILL.md`: the Tests bullet now names `test/repo/shell-text.mjs` and says what it gates.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/docs/references/component-inventory.md`: lines 127-128 name the new gate and its scope. Line 127's font-size item was reworded (see Notes).

## Checks
- `redck.py record .sdlc/ui-standardization/step-3/handoff.md`, run before the first edit: 5 pre-edit controls recorded red, exit 0.
- `node test/repo/shell-text.mjs`: exit 0. It passes and prints `shell-text: 239 declarations pending in step-4, step-5, step-6, step-7, step-8`.
- `! test -e test/repo/control-text.mjs && grep -qF '"repo/shell-text.mjs"' test/run.mjs && ! grep -qF '"repo/control-text.mjs"' test/run.mjs`: exit 0.
- The six strict negative samples piped to `--strict /dev/stdin`: every one flagged, exit 0.
- The four strict positive samples piped to `--strict /dev/stdin`: they pass, exit 0.
- `! git grep -nE 'control-text\.mjs|repo/control-text|control-text\)' -- .claude/CLAUDE.md .claude/skills docs/references/component-inventory.md docs/specs test`: exit 0, after the rewording described in Notes. Before it, exit 1 on `component-inventory.md:127`.
- `! node test/repo/shell-text.mjs --strict`: exit 0, because strict is red with 239 declarations.
- (guard) `node test/repo/citations.mjs`: exit 0, STALE 0.
- (guard) the no-diff check over the src/scripts/test-ui/test-smoke paths against `7df5f57d`: exit 0.
- `node test/repo/em-dash.mjs`: clean, 1880 files.
- `npm test`: exit 0, all 62 test files passed (`repo/shell-text.mjs pass`). Afterwards the tree holds only this step's files.

## Notes
- Criterion 5's `control-text\)` alternative also matches the CSS custom property `var(--sh-control-text)`, which is not a file reference. To clear it, I reworded `component-inventory.md:127` from `` `font-size: var(--sh-control-text)` `` to "a `font-size` that reads `--sh-control-text`". The fact is unchanged, and the line is inside the 127-128 range the handoff names. If a later edit puts `var(--sh-control-text)` back on that line, the grep goes red again.
- The gate pends 239 declarations, against the plan probe's 237 (236 plus `.radix-tip`). Both extras come from checking for a literal length "outside `var(`" as the handoff says, where the old gate exempted any value holding `var(`: `.segmented, .figma-files, .radix-files | padding: calc(var(--sh-part-inset) - 1px)` and `.map-raw-select | padding-inline-end: calc(var(--sh-chip-inset) + 14px)`. Both already sit under existing step-8 needles, so no PENDING entry was added beyond `.radix-tip`.
- The length regex now accepts a leading minus, so negative tracking such as `letter-spacing: -0.01em` gets flagged; the old regex skipped it. No offender of that shape exists today.
- The rename is staged and the content edits are unstaged. `git diff --name-only 7df5f57d` shows both; a bare `git diff` misses the rename.
- `$SDLC_BASE_SHA` was empty in the environment, so I exported `7df5f57d` by hand to run the guard criterion.
- `allowed:` lines print the exact-match needle as `=body`.
