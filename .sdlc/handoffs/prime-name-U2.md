# Handoff prime-name U2 · #789 records

Builder, grade l1, pass 1. Branch `unit/pn-U2`, worktree `.worktrees/pn-U2`, cut from `plan/prime-name` at `f70c3f94`. Records commit `926e2714`; this handoff is the commit on top of it. R98 applied: no alias or legacy note beyond the one CHANGELOG entry. No `src/`, board, or plan file touched.

## Files

| File | Change |
|---|---|
| `docs/reference/references/knowledge-04-export-formats.md` | line 349: `prime` links the bare `--{pfx}-{n}-prime`; Panda key path stays nested (`prime.prime`, `prime.DEFAULT`) |
| `docs/spec/spec-muted-base-key-spikes.md` | EX-7: Tailwind has the bare `--color-primary-prime`; Panda nested key path unchanged |
| `docs/spec/spec-panda-park-ui-exports.md` | line 320: same bare link, same Panda key-path sentence |
| `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` | names all six suffixed steps plus the bare centre; says the Panda centre keeps `prime.prime` / `prime.DEFAULT` |
| `CHANGELOG.md` | one `[Unreleased]` entry under `### 2026-10-03`: breaking rename, schema 4, MCP 0.4.0 |
| `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md`, `best-practices.md` | `brand-kit/3` to `/4`, `version: "0.3.0"` to `"0.4.0"` (lines 13, 41, 43; 70, 73) |

## Ran

Controls restore the pre-edit content from `HEAD` of the unit branch before the commit, then the edit is put back; the tree was checked after.

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `git grep -l prime-prime -- docs plugin ':!docs/tickets' ':!docs/plan/archive' ':!docs/reference/data'` | `no output`, rc 1 | `spec-panda-park-ui-exports.md` restored to its pre-edit text: grep prints it | 🟢 |
| C2.2 | the plan's `grep -oE ... \| sort -u \| wc -l` on the skill | `6` | pre-edit skill: `2` | 🟢 |
| C2.3 | the plan's `awk ... \| grep -cF -- '-{n}-prime\`'` | `3` (at least 1) | pre-edit CHANGELOG: `0` | 🟢 |
| C2.4 | `npm test` (NODE_OPTIONS unset, 2 heavy processes at start); `git status --porcelain` | exit 0, `✓ all 54 test files passed` (incl. `repo/em-dash.mjs`); porcelain showed only the 7 intended edits, no generated drift | adapter section 1 control, unchanged from U1 | 🟢 |
| C2.5 | `git grep -a -n 'brand-kit/3\|version: "0.3.0"' -- .claude/skills` | `no output`, exit 1 | pre-edit `foundations.md`: 3 matches | 🟢 |

## Notes for the reviewer

- The Panda sentence is in the skill, the knowledge reference, and both specs. The CHANGELOG entry carries it too, since it is the one record a consumer renaming variables will read.
- `prime-prime` appears once outside the criterion's scope, in the CHANGELOG entry itself (the allowed single legacy note).
- `node test/repo/em-dash.mjs` run bare fails in this shell on a preload path in `NODE_OPTIONS`; it passes inside `npm test`.
