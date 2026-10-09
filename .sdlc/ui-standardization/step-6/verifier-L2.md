<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- (red) role-system criterion: pass. Evidence: the criterion span, extracted verbatim from the handoff to a scratch script, exits 0 with `0 off` on the built tree. At base 5a6bd08e in a throwaway worktree (since removed) it exits 1 with `92 off`; the first findings are `.drawer-head h3 | font-size: 14px` and `.drawer-systems-label | font-size: 11.5px`. This confirms red-then-green, and the predicate bites on both the literal-text check and the role-mapping check. `redck` recorded no controls, as the conductor noted. I reran the base control myself, so that parser miss is covered.
- `node test/repo/shell-text.mjs && ! grep -qF '"step-6"' test/repo/shell-text.mjs`: pass. Evidence: exit 0, `shell-text: pass`, `13 declarations pending in step-8`. The grep negation returned 0, so the `"step-6"` key is gone from PENDING.
- (guard) `node test/repo/ui-polish.mjs`: pass. Evidence: exit 0, `6 stylesheet checks (each rejects its known-bad sample)`.
- (guard) `node test/repo/citations.mjs`: pass. Evidence: exit 0, `STALE 0 across 13 discovered docs`, `45 checked, 0 stale`.
- (guard) scope `test -z "$(git diff --name-only $SDLC_BASE_SHA -- ...)"`: pass. Evidence: run with `SDLC_BASE_SHA=5a6bd08e3984cfafb9262ab93863d23ceca10236`, exit 0.
- `npm test` (via `gate_lock.py` with `SDLC_GATE_WORKERS=10`): pass. Evidence: `✓ all 62 test files passed`; `repo/shell-text.mjs`, `repo/ui-polish.mjs`, `repo/citations.mjs` and `repo/em-dash.mjs` all pass.

Ruling on the builder's flagged item, `.settings-nav-item.on`: this is not a usable selected state, but it does not fail the step.
- **What changed:** `src/ui/styles.css:1393` sets `.on` to the neutral-container background, `color: var(--ink)` and `font-weight: var(--ui-weight-medium)`.
- **Why it is weak:** `--ui-control-font` already carries weight 500 (`styles.css:99`), so the `.on` weight is a no-op. The ink also matches resting and hover (`--ui-control-ink` is `--ink`). The selected item therefore differs from rest only by its background, and it looks identical to hover.
- **Why it still passes:** the handoff names the weight token and the control ink for this selector as binding, and the builder followed them.
- **What the plan owner should do:** pick a distinguishing selected cue, for example an accent ink or an inset marker, in a later step. The cue must be a state-color exception, which the role rules already permit.

## Out of scope changes
None from step 6. `src/ui/styles.css` and `test/repo/shell-text.mjs` are the intended edits, and the other lanes' rules in `styles.css` are per the conductor note. `npm test` regenerated `figma/plugin/ui.html`, which now shows as modified in the tree. It is a generated bundle and a side effect of the gate, not a builder edit.

## For the next attempt
None
