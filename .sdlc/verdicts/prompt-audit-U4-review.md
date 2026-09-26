PASS

# prompt-audit U4 review

Unit worktree `.worktrees/pa-U4`, branch `unit/pa-U4` at `8de8ca2d` (code commit
`64cf225c`, handoff commit `8de8ca2d`), base `8f5c6dc0`. Diff: `mcp/describe-eval-runner.mjs`
plus `.sdlc/handoffs/prompt-audit-U4.md`. Reviewed fresh context, read-only against source.

## Q2 reading

Plan's Q2 ruled A: leave the forced tool-use request shape as is, apply E2 to E4 only,
drop E1 (structured outputs, unverifiable without an API key, tracked as debt R8). The
diff matches: `tool_choice: { type: "tool", name: "submit_brief" }` is untouched, no
`strict: true` added, no structured-outputs rewrite attempted.

## Criterion re-runs

**U4-1** (`F=mcp/describe-eval-runner.mjs; grep -c ...` six needles): re-run on the
worktree head prints `1, 0, 0, 1, 1, 1`, matching the Expected row's Q2=A branch exactly.
Re-run on a `git worktree add --detach` at `8f5c6dc0` (the negative control) prints
`0, 1, 1, 0, 1, 0`, matching the plan's stated negative control exactly.

**U4-2**: `node --check` exits 0; the runner with no `ANTHROPIC_API_KEY` set prints the
skip line and exits 0; `node test/mcp/describe-eval.mjs` prints its PASS line and exits 0.
All three match Expected.

**U4-3**: ran the plan's exact fetch-stub probe against the worktree head, got `1`
(`RESEARCH_TIER_NOTE` appears once in the assembled `system` string — the rubric embeds
it, the runner no longer appends `briefing.research` a second time). Ran the same probe
against a fresh `git worktree add --detach` at `8f5c6dc0` (the unit's own base, a
same-repo clone rather than the handoff's `git clone --shared`, functionally identical),
got `2`. Matches both the Expected row and the plan's stated negative control.

## Request correctness

- `stop_reason` guard: reads `json.stop_reason` off the top-level Messages API response
  (correct field location, not nested under `content`), throws before the (missing)
  `tool_use` block would otherwise produce a less specific "no tool_use block" error.
  Verified this ordering by inspection: the guard executes before the `toolUse` lookup at
  `mcp/describe-eval-runner.mjs:49`.
- `max_tokens: 4096`: a 4x headroom bump over the prior `1024` for a schema-shaped
  `PaletteBrief` tool call; reasonable, no evidence of being undersized or wastefully large
  for this payload shape.
- System prompt: `${briefing.rubric}\n\n${briefing.research}` (double-sent, `E2`/`E3`'s
  target) is replaced with `${briefing.rubric}\n\nNo web search is available in this
  session; work only from the description given.` — matches the plan's stated intent for
  E3 (rubric embeds `RESEARCH_TIER_NOTE` once already at §10; the added sentence heads off
  the model reaching for a host tool the note references but this eval never provides).
  The comment above `interpretOne` is retargeted off the retracted "guaranteed
  schema-shaped" claim (E2) onto a factual description of what the call does and why the
  note is sent once, not twice.

## Scope wall

Two files touched: `mcp/describe-eval-runner.mjs` (U4's sole scope-wall entry) and its own
unit handoff. No other file moved. `git worktree` diff stat confirms this (2 files
changed, no others touched).

## Gates

- `npm test`: all 53 test files pass, exit 0, tree clean after (`git status --short`
  empty in the unit worktree, and confirmed clean again after this review's own run).
- `node test/repo/branding.mjs`: clean (785 files scanned).
- Em dash: searched the diff's added lines for U+2014 directly (not just the gate's own
  report) — none found. No em dash added by this unit.

## Findings

None blocking.

- Low: the handoff's own "P6" label (`## Gates`, the paragraph checking `#375`/`#377`
  survive untouched in the mcp file) is not the plan's actual P6 criterion, which scopes
  to `.claude/agents .claude/skills plugin/ultimate-tokens docs/reference/SKILL.md
  .claude/CLAUDE.md` only — a file set U4 never touches, so the plan's P6 doesn't apply to
  this unit at all. The check the builder ran is a reasonable extra sanity pass (no
  history id crept into the touched file) but mislabeling it as "P6" could confuse a later
  reader cross-referencing the plan's actual criterion table. No fix needed to the code or
  the fate table; a future handoff revision could just call this something else (e.g.
  "own-file id check").

## Verdict

PASS. Q2 (A) applied correctly, E1 dropped with a documented reason, E2/E3/E4 all
correctly implemented and independently re-verified against both the positive and
negative control the plan specifies, request shape (stop_reason handling, max_tokens,
system prompt) is sound, scope wall holds, gates green, no em dash, branding clean.

verdict: 🟢 PASS
