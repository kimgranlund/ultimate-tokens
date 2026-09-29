---
kind: handoff
plan: prompt-audit
unit: U4
branch: unit/pa-U4
written: 2026-09-26
pass: 1
---

# U4 handoff: the eval runner's request (E2 E3 E4; E1 dropped per Q2)

Branch `unit/pa-U4` at `64cf225c`, base `8f5c6dc0` (`origin/main`, plan rule-gates #730
landed). One file touched: `mcp/describe-eval-runner.mjs`.

## G0

`git show origin/main:test/run.mjs | grep -c '"repo/em-dash.mjs"'` -> `1`. `git
merge-base --is-ancestor 8f5c6dc0 origin/main` -> exit 0 (`origin/main` at
`8f5c6dc0`, PR #757 squash of rule-gates already landed). G0 was green before this
unit started; U4 has no G1 dependency (its file is not in docs-repair's wall).

## Findings

| Id | Fate | Note |
|---|---|---|
| E1 | dropped | Q2 ruled A: leave forced tool-use as is (E2 to E4 only); no API key here to probe provider support for structured outputs, debt R8 |
| E2 | applied | the comment above `interpretOne` no longer claims forced tool-use makes the output "guaranteed schema-shaped"; it states what the call actually does and why the research note is sent once |
| E3 | applied | the system prompt no longer appends `briefing.research` a second time (`RUBRIC` already embeds `RESEARCH_TIER_NOTE` at section 10); adds one sentence telling the model this session has no web search of its own, since the note it just read tells it to reach for a host tool |
| E4 | applied | `max_tokens` raised 1024 to 4096; a `stop_reason === "max_tokens"` check throws before a truncated response is read as a completed `PaletteBrief` |

## U4-1, the three edits and the request shape

```
F=mcp/describe-eval-runner.mjs
grep -c 'max_tokens: 4096' $F                                           -> 1
grep -c 'briefing.research' $F                                          -> 0
grep -c 'guaranteed schema-shaped' $F                                   -> 0
grep -c 'stop_reason' $F                                                -> 1
grep -c 'tool_choice: { type: "tool", name: "submit_brief" }' $F        -> 1  (Q2 default, unchanged)
grep -c 'No web search' $F                                              -> 1
```
All six match the criterion's Expected row exactly.

## U4-2, the runner still skips cleanly and its pure test is green

```
node --check mcp/describe-eval-runner.mjs                     -> check 0
env -u ANTHROPIC_API_KEY node mcp/describe-eval-runner.mjs     -> "[describe-eval] skipped, no ANTHROPIC_API_KEY set. ..." exit 0
node test/mcp/describe-eval.mjs | tail -1                      -> "describe-eval PASS, ..." exit 0
```

## U4-3, the research note reaches the model exactly once

Ran the fetch-stub probe from the criterion, on the worktree head:

```
node --input-type=module -e '
import { interpretOne } from "./mcp/describe-eval-runner.mjs";
import { generateKitTool } from "./mcp/describe-mcp-core.mjs";
import { RESEARCH_TIER_NOTE } from "./mcp/describe-rubric.mjs";
let sys = "";
globalThis.fetch = async (u, o) => { sys = JSON.parse(o.body).system;
  return { ok: true, json: async () => ({ stop_reason: "tool_use",
    content: [{ type: "tool_use", name: "submit_brief", input: {} }] }) }; };
await interpretOne("k", "m", "x", generateKitTool({}));
console.log(sys.split(RESEARCH_TIER_NOTE).length - 1)'
```
-> `1` on the worktree head.

Negative control, run in a throwaway clone made from this unit's own parent commit
(`git clone -q --shared . "$F/neg"`, `F` under this seat's scratchpad,
`git -C "$F/neg" rev-parse --short HEAD` -> `8f5c6dc0`, the branch's own base, since
`B == origin/main` here): the same probe against that clone's
`mcp/describe-eval-runner.mjs` prints `2` (the rubric embeds the note once, the old
code appends `briefing.research` again). Confirms the row: the edit is what turns `2`
into `1`, not an artifact of the fixture.

## U4-4 (stop_reason guard, not a numbered criterion but load-bearing)

Probed the guard directly with a stubbed `fetch` returning `stop_reason: "max_tokens"`:
sends `max_tokens: 4096` in the request body, then throws
`"the response hit max_tokens before completing (stop_reason: max_tokens): ..."`
instead of reading `content` as a finished tool-use block. At the parent commit (no
guard), the same stub would fall through to the `no tool_use block` error instead of
naming the real cause; this unit makes the cause explicit.

## Gates

```
node test/repo/branding.mjs   -> branding: clean (784 files scanned)
node test/repo/em-dash.mjs    -> self-test: PASS; em-dash: clean (792 files scanned)
npm test                      -> all 53 test files passed, exit 0
git status --short            -> clean (after the one commit)
```

P6 (no history id enters or leaves this file): `git diff 8f5c6dc0 -- mcp/describe-eval-runner.mjs`
added lines against `TKT-[0-9]{4}|\(#[0-9]{3,4}\)|#[0-9]{3,4} (U[0-9]|review)` -> `0`.
The pre-existing `#375` and `#377` references in the file's header/body comments are
untouched by this diff (kept verbatim, not re-typed), so neither counts as an id
entering under P6.

No dashed prose line added (P3): the diff's added lines carry no U+2014.

## Left out

- E1 (structured outputs) is out of scope per Q2; no follow-up ticket minted here,
  the plan already tracks it as debt R8.
- No other file in U4's scope-wall entry (`mcp/describe-eval-runner.mjs` only) needed
  a change; `test/mcp/describe-eval.mjs` was read, not edited (U4 registers no new
  test file, N is unchanged at whatever `npm test` reports, which was `53` on this
  worktree head, gate-gaps's `engine/ramp-identity.mjs` already present).
