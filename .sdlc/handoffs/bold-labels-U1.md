# Handoff: bold-labels U1 pass 1 (#752)

Branch `unit/bl-U1`, base `0b551835`. Prose-only edits to 12 files plus the kept list; two generated files regenerated.

## Verdict

🟡 attention: every U1 criterion reads as expected except two plan-side discrepancies, listed below. `npm test` green: `all 53 test files passed`.

## Criteria

| Row | Evidence | Expected | State | Control |
|---|---|---|---|---|
| U1-1 | removed `31`, added `3` (`git diff` vs base, `':!.sdlc' ':!figma' ':!src'`) | `31`, `3` | 🟢 | without row 31 the removed count reads 30 |
| U1-2 | `18` rows, `11` distinct files | `18`, `12` | 🟡 | dropping K17 reads 17 rows, 10 files |
| U1-3 | `12` | `12` (was `0`) | 🟢 | was 0 at base |
| U1-4 | sum `10`, base sum `0` | base + 10 | 🟢 | base sum 0 (skipped rows leave it unchanged) |
| U1-5 | `plugin/color-tokens.mjs`, `typography-tokens.mjs`, `geometry-tokens.mjs` all `pass` | 3 | 🟢 | runner names any failing file |
| P2 | `em-dash: clean (805 files scanned)` | clean | 🟢 | a planted U+2014 reds the gate |
| P3 | `branding: clean (798 files scanned)` | clean | 🟢 | a planted new label makes added equal removed |
| P5 | `line-for-line` | line-for-line | 🟢 | a split line makes awk print UNEQUAL, exit 1 |
| P8 | `grep -c` of the live URL in README.md: `3`, base `3` | equal | 🟢 | dropping the URL lowers head below base |
| count | predicate over tracked `.md` outside `.sdlc/` reads `57` | `85 - 28 = 57` | 🟢 | 85 at base, minus the 28 removals |

## Discrepancies

- U1-2 distinct files: the 18 kept rows span 11 files (voice-platform, typography README, docs/reference/CHANGELOG, CHANGELOG, README, geometry README, decision-records, 2026-07-17-librarian, tkt-0007, prose.md, storage-and-sync-spec). The plan's expected `12` and its control (`drop K17: 11`) contradict each other; the list matches the Kept table row for row, so the plan's number is the miscount.
- P4 says no generated file changes. `mcp/README.md` is bundled into `src/ui/mcp-assets.js` and `figma/plugin/ui.html`, so `npm test` regenerates both (same size, content differs). Committed as the deterministic output; leaving them stale would make the tree dirty after test.

## Controls

- U1-1 bites: row 31 (`storage-and-sync-spec.md`) contributes one removed line; the count reads 31 with it, so 30 without.
- P5 bites by construction: any split line makes the insertion and deletion counts differ, and the awk exits 1.
- Tree after `npm test` (before commit): only the 14 modified files and the kept list, no further drift.

## Scope

Nothing under the prompt-audit or docs-repair walls was touched (no geometry-system, type-scale, maintaining-brand-kit-mcp, adding-semantic-roles, or ui-plan.md edits).
