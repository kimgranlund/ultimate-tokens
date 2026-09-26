# prompt-audit U5 handoff: the two agents

branch: unit/pa-U5 @ (see commit below)
worktree: .worktrees/pa-U5

## Files touched

- `.claude/agents/marketing-manager-agent.md`
- `.claude/agents/palette-researcher-agent.md`

## Findings

| Id | fate |
|---|---|
| SA4 | applied |
| SA5 | applied |
| SA6 | applied |

SA4/SA5 (`marketing-manager-agent.md`): dropped the "non-negotiable"/"no exceptions" register
from the loop heading and its lead sentence, keeping the loop's steps and the `name the surface`
wording; removed the "store-copy's 53 to 59 role-count drift is the cautionary precedent"
anecdote sentence, keeping the drift-servicing sweep instruction (the `grep -rn "<old value>"
docs/marketing/` command) intact.

SA6 (`palette-researcher-agent.md`): reworded the Type mode heading from "first-class since
ADR-022" to a present-tense form that still names ADR-022; reworded the `type.slots` clause from
"is the RETIRED pre-2026-07-30 shape" to "is forbidden, not a valid shape" (present tense, no
date), keeping `type.registers` and `ADR-022` present.

## Ran

- `node test/repo/branding.mjs` -> `branding: clean (784 files scanned)`
- `node test/repo/em-dash.mjs` -> `em-dash: clean (792 files scanned)`
- `npm test` -> `all 53 test files passed`, tree clean after except the two intended files

## Per-criterion evidence

U5-1 (own run, at HEAD):
```
A=.claude/agents/marketing-manager-agent.md
grep -c -E 'non-negotiable|no exceptions' $A   -> 0
grep -c -E '\b59\b|cautionary precedent' $A    -> 0
grep -c 'name the surface' $A                  -> 1
grep -c 'grep -rn "<old value>" docs/marketing/' $A -> 1
```
Negative control (clone at B=8f5c6dc0f617b6cd4147176ac6e815510e20bf84, a throwaway
`git clone -q --shared .` checked out to B, removed after use): same four commands print
`2`, `2`, `1`, `1`, matching the plan's stated Today row.

U5-2 (own run, at HEAD):
```
A=.claude/agents/palette-researcher-agent.md
grep -c -E 'first-class since|RETIRED pre-2026' $A -> 0
grep -c 'type.slots' $A -> 1
grep -c 'ADR-022' $A -> 1
grep -c 'type.registers' $A -> 1
```
Negative control (same clone at B): `2`, `1`, `1`, `1`, matching Today.

U5-3 (own run, at HEAD):
```
B=$(git merge-base origin/main HEAD)
git diff "$B" -- .claude/agents | grep -c -E '^[-+](name|description|tools|model|color):' -> 0
git diff --name-only "$B" -- .claude/agents | wc -l -> 2
```
No negative control needed beyond the plan's own note (a `description:` edit would print `1`);
frontmatter blocks were not touched by either edit above (confirmed by the diff itself, only
prose lines changed).

## Left out

Nothing in U5's own scope. Not touched: any other unit's files, `.sdlc/board.md`.
