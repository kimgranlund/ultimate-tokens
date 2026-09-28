# Handoff: bold-labels U1 pass 1 (#752), records fix for verdict H1

Branch `unit/bl-U1`, base `B` = `e3a114d6` (`git merge-base origin/main HEAD`), figures measured at head `fa0b11dd` (code commit `b18c76cb`). Prose-only edits to 12 files plus the kept list; two generated files regenerated.

## Verdict

🟡 attention: every U1 criterion reads as expected except P4, a plan-side miscount, and the Prompt departure named below. `npm test` green: `all 53 test files passed`, tree `0` lines after.

## Criteria

| Row | Evidence | Expected | State | Negative control |
|---|---|---|---|---|
| U1-1 | removed `31`, added `3` (`git diff "$B" -U0 -- ':!.sdlc'`, the two `**label**, ` greps) | `31`, `3` | 🟢 | `storage-and-sync-spec.md` restored to `B`: `30`, `2` (the verdict's run) |
| U1-2 | `wc -l` `18` rows, `cut -f1 \| sort -u \| wc -l` `11` distinct files | `18`, `12` in the plan | 🟢 | dropping K17 reads `17`, `10` (the verdict's run) |
| U1-3 | `12` | `12` (was `0`) | 🟢 | the same grep on `B`'s copy: `0` |
| U1-4 | sum `10`, base sum `0` | base + 10 | 🟢 | `controls.md` restored to `B`: `7` (the verdict's run) |
| U1-5 | `plugin/color-tokens.mjs`, `typography-tokens.mjs`, `geometry-tokens.mjs` all `pass` | 3 | 🟢 | a plant of `54 semantic roles` in `color-tokens/SKILL.md` reds `plugin/color-tokens.mjs` (the verdict's run) |
| P1 | `57` hits, `diff` against the kept list: `0` lines only in the list, `39` extra | `57` at U1's head | 🟢 | `**Probe**, a planted line` in `README.md`: `58`, and the `diff` names it (the verdict's run) |
| P2 | `em-dash: clean (808 files scanned)`, added-glyph count `0` | clean, `0` | 🟢 | a glyph line in `mcp/README.md`: `FAIL: 1 em dashes`, exit 1 (the verdict's run) |
| P3 | `branding: clean (800 files scanned)`; added `30`, removed `31` | clean; added = removed minus 1 | 🟢 | a planted `**Planted**: text` line: `31`, `31` (the verdict's run) |
| P4 | first count `2` (`figma/plugin/ui.html`, `src/ui/mcp-assets.js`), second count `2` (the same two paths) | `0`, `0` in the plan | 🟡 | an intent-to-add `docs/spec/planted.md` raises the first count by one (the verdict's run) |
| P5 | `line-for-line` | line-for-line | 🟢 | a split `**KV**:` line: `UNEQUAL 2 1`, exit 1 (the verdict's run) |
| P6 | `all 53 test files passed`; `git status --short \| wc -l` `0` | `53` passed, `0` | 🟢 | `scrimX` in `role-table.json`: `1/53 test file(s) failed`, exit 1 (the verdict's run) |
| P7 | the three README greps print `1`, `1`, `1` | `1`, `1`, `1` | 🟢 | the same greps at `B`: `0`, `0`, `0` (the verdict's run) |
| P8 | `grep -c` of the live URL in README.md: `3`, base `3` | equal | 🟢 | the URL dropped from line 6: `2` |
| count | predicate over tracked `.md` outside `.sdlc/` reads `57` | `85 - 28 = 57` | 🟢 | `85` at base, minus the 28 removals |

## Commands and output at `fa0b11dd`

- P1: `git ls-files '*.md'` minus `.sdlc/`, `grep -HnE '^[[:space:]]*\*\*[^*]+\*\*, '`, sorted to a scratch file: `wc -l` prints `57`. `diff <(sort .sdlc/plans/bold-labels-kept.tsv) <hits>` shows `0` lines starting `<` and `39` starting `>`. The 39 are walled to later units: `docs/marketing/store-copy.md` 32 (U2), `docs/reference/references/ui-plan.md` 2, and five skill files, 1 each (`adding-semantic-roles`, `geometry-system/SKILL.md`, `geometry-system/references/foundations.md`, `maintaining-brand-kit-mcp`, `type-scale/references/foundations.md`) (U3).
- P2: `node test/repo/em-dash.mjs | tail -1` prints `em-dash: clean (808 files scanned)`; `git diff "$B" | grep -c "^+.*<U+2014>"` prints `0`.
- P3: `node test/repo/branding.mjs | tail -1` prints `branding: clean (800 files scanned)`. Added bold-label lines outside `.sdlc/`: `30`. Removed: `31`. The one-line gap is U1 row 29, whose new line opens with `run `.
- P4: the first `git diff --name-only "$B" | grep -v` wall filter prints `2`, listing `figma/plugin/ui.html` and `src/ui/mcp-assets.js`. The second, `git diff --name-only "$B" -- src test scripts figma 'mcp/*.mjs' package.json package-lock.json`, prints `2` with the same two paths.
- P6: `npm test 2>&1 | tail -1` prints `✓ all 53 test files passed`; `git status --short | wc -l` prints `0`.
- P7: the three README greps print `1`, `1`, `1`.

## Discrepancies

- U1-2 distinct files: the 18 kept rows span 11 files (voice-platform, typography README, docs/reference/CHANGELOG, CHANGELOG, README, geometry README, decision-records, 2026-07-17-librarian, tkt-0007, prose.md, storage-and-sync-spec). The plan's expected `12` and its control (`drop K17: 11`) contradict each other; the list matches the Kept table row for row, so the plan's number is the miscount. The row reads `18`, `11` and is 🟢 against the list.
- P4 says no generated file changes. `mcp/README.md` is bundled into `src/ui/mcp-assets.js` and `figma/plugin/ui.html`, so `npm test` regenerates both (same size, content differs). Both paths are outside the plan's wall filter and inside its `src`/`figma` pathspec, so both P4 counts read `2`, not `0`. Committed as the deterministic output; leaving them stale would make the tree dirty after test.
- Departure, `mcp/README.md` Prompt line: the line changes twice. `**Prompt**, `apply_brand`: how to apply the kit` becomes `**Prompt**: `apply_brand`, how to apply the kit`, so the inner colon after `apply_brand` became a comma. The label needed the colon (P7's third grep expects `**Prompt**: `apply_brand``), and keeping the inner colon would leave two colons in one sentence, so the sentence's own break moved to a comma. The plan's row for this line does not say the inner colon changes.

## Controls

- U1-1 bites: row 31 (`storage-and-sync-spec.md`) contributes one removed line; the count reads 31 with it, so 30 without.
- P5 bites by construction: any split line makes the insertion and deletion counts differ, and the awk exits 1.
- Tree after `npm test`: `0` lines, no drift.

## Scope

Nothing under the prompt-audit or docs-repair walls was touched (no geometry-system, type-scale, maintaining-brand-kit-mcp, adding-semantic-roles, or ui-plan.md edits).
