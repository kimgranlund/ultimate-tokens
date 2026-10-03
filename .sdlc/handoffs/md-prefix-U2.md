# Handoff md-prefix U2 · #791 Records use `--md-*`

Builder, pass 1. Branch `unit/md-U2`, worktree `.worktrees/md-U2`, cut from `plan/md-prefix` at `f3661dbe` (U1 merged). Code commit is the one before this handoff; the handoff is in the head commit. Applied: criteria C2.1, C2.3, C2.4 (C2.2 dropped in plan revision 1) and the Q1 ruling (the new names are `--md-color-*`, `--md-typescale-*`, `--md-*` for geometry). R98: no alias, no legacy mention; the old names appear nowhere in the three lanes or in `CHANGELOG.md`.

## Files

| File | Change |
|---|---|
| `plugin/ultimate-tokens/{README.md,.claude-plugin/plugin.json,agents/token-integrator.md,skills/{color,typography,geometry}-tokens/SKILL.md}` | `--md-sys-*` family to `--md-*` (8 lines): colour, typescale, size, radius and `.md-control-*` |
| `.claude/skills/geometry-system/{SKILL.md,references/foundations.md}` | `--md-sys-size-*` to `--md-size-*` (2 lines) |
| `docs/marketing/{fact-sheet.md,launch/launch-kit.md,product/claude-plugin.md,store-copy.md,web/landing.md}` | the Material root named in 7 lines, `--md-*` (fact sheet row also names `--md-color-*` and `--md-typescale-*`). Token spellings only, no sentence reworded, no count, price or tier touched, so the fact sheet stays the pinned source; I did not dispatch the marketing-manager-agent because no customer-facing prose changed |
| `CHANGELOG.md` | the Unreleased "Configurable token naming scheme" note rewritten to the new names; new Unreleased entry under 2026-10-03 "Changed": "Breaking: the Material naming scheme is `--md-*`" (#791), naming the three families, the v7 hydrate rewrite, the export schema `brand-kit/5` and server 0.5.0. The #789 entry above it (`brand-kit/4`, 0.4.0) is history and stays |
| `docs/reference/references/knowledge-02-tonal-scale.md` | **addition outside the U2 line** (verdict finding 2): section 8.4 "Two bumps landed after v4, both adding" to "Three bumps landed after v4: two added". One phrase; the rest of the sentence already says neither of those two needs an entry, and the v7 rename follows |

Not touched: `src/`, `.sdlc/baseline.md`, `docs/plan/archive`, `docs/reference/reviews/2026-07-17-export-drift.md`, `.sdlc/records`, `.sdlc/plans/archive`.

## Ran

Controls ran in the unit tree, each as a one-line mutation of a file backed up under `$CLAUDE_JOB_DIR/tmp/md-U2-b/bak`, restored with `cp` and checked byte-identical (`cmp`) before commit.

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `git grep -c md-sys -- plugin .claude/skills docs/marketing` | no output, `rc=1` (was 17 lines over 13 files) | `token-integrator.md:35` put back to `--md-sys-color-*`: `plugin/ultimate-tokens/agents/token-integrator.md:35: ... a Material root (`--md-sys-color-*` ...`, `rc=0`; restored | 🟢 |
| C2.3 | the awk slice of `## [Unreleased]` piped to `grep -cF -- '--md-*'` and to `grep -c md-sys` | first `3`, second `0` | old note left as it was (both lines back to `md-sys`): second reads `2`, as the plan predicts; restored. New entry dropped: first reads `1`, not `0` (see Notes) | 🟡 |
| C2.4 | `node test/repo/em-dash.mjs`; `node test/repo/branding.mjs` | `em-dash: clean (1127 files scanned)`, `branding: clean (1119 files scanned)`, both exit 0 | U+2014 appended to `plugin/ultimate-tokens/README.md`: `FAIL: 1 em dashes outside inline code spans in 1 files`; restored | 🟢 |
| Gate | `npm test`, then `git status --porcelain` | exit 0, `✓ all 54 test files passed`; porcelain lists only the 15 tracked files of this unit's edits, no generated asset moved | the C2.4 U+2014 plant reds `em-dash.mjs`, which is a leg of `npm test` (`▶ repo/em-dash.mjs pass` in the log), so the gate reds with it | 🟢 |

Load before `npm test`: 6 heavy processes at first, waited until 0, then ran.

## Notes for the reviewer

- C2.3 first command: the rewritten naming-scheme note also contains the literal `--md-*`, so dropping only the new entry leaves the count at `1`, not the plan's `0`. The row cannot tell the new entry from the rewritten note. A sharper needle would be `grep -c '#791'` on the same slice (reads 1 with the entry, 0 without). Plan text gap, not a unit defect; the Orchestrator may want C2.3 amended.
- C2.3 second command and the brief: the brief asks the new entry to say old md-sys kits load via the hydrate rewrite, but the slice must hold zero `md-sys`. The entry says "the old `--md-` plus system-segment roots" and "the old Material triple", never the literal.
- Marketing: fact-sheet.md row 29 lists the geometry root as `--md-*` and the colour and type roots as `--md-color-*` and `--md-typescale-*`; matches `rxr4` in `test/ui/headless-boot.mjs`.
