PASS

Fresh-context review of prompt-audit U5 (#758), pass 1. Unit worktree .worktrees/pa-U5,
branch unit/pa-U5 at 0d175339, base 8f5c6dc0.

## Scope

Diff 8f5c6dc0..0d175339 touches exactly two agent files plus the handoff, matching the
plan's U5 scope (SA4, SA5 on marketing-manager-agent.md; SA6 on palette-researcher-agent.md).
No other file changed.

## Criteria re-run (own commands, independent of the handoff's copy)

- U5-1 (marketing-manager-agent.md): `grep -c -E 'non-negotiable|no exceptions'` -> 0,
  `grep -c -E '\b59\b|cautionary precedent'` -> 0, `grep -c 'name the surface'` -> 1,
  `grep -c 'grep -rn "<old value>" docs/marketing/'` -> 1. Matches expected (0, 0, 1, 1).
  Negative control in a throwaway `git clone -q --shared .` checked out to 8f5c6dc0: same
  four commands print 2, 2, 1, 1, matching the plan's stated Today row (the control
  discriminates, per checks-that-bite).
- U5-2 (palette-researcher-agent.md): `grep -c -E 'first-class since|RETIRED pre-2026'` -> 0,
  `grep -c 'type.slots'` -> 1, `grep -c 'ADR-022'` -> 1, `grep -c 'type.registers'` -> 1.
  Matches expected (0, 1 or more, 1 or more, 1 or more). Negative control at the same clone:
  2, 1, 1, 1, matching Today.
- U5-3 (frontmatter untouched, two files only): `B=$(git merge-base origin/main HEAD)`;
  `git diff "$B" -- .claude/agents | grep -c -E '^[-+](name|description|tools|model|color):'`
  -> 0; `git diff --name-only "$B" -- .claude/agents | wc -l` -> 2. Matches expected (0, 2).
  Frontmatter of both files read directly and confirmed intact: marketing-manager-agent.md
  keeps name/description/tools/model/skills; palette-researcher-agent.md keeps
  name/description/tools/model/skills. Only prose lines changed in both diffs.

## Other gates

- `node test/repo/branding.mjs` -> `branding: clean (785 files scanned)`.
- `node test/repo/em-dash.mjs` -> `em-dash: clean (793 files scanned)`; diff of the two
  touched files against base also greps clean for U+2014 directly.
- `npm test` -> `all 53 test files passed`; `git status --short` empty after (tree clean).

## Findings

None. The rewritten prose reads correctly: the loop's steps and the drift-servicing grep
command survive verbatim (SA4/SA5), the anecdote sentence is gone without leaving a dangling
reference, and the Type mode heading/type.slots clause read as present-tense rules that still
cite ADR-022 (SA6). No scope-wall violation, no added em dash, no branding hit, frontmatter
parses on both files.

verdict: 🟢
