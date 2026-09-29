PASS

# records-gates U2 review, pass 2 (#742)

Worktree `.worktrees/rc-U2`, branch `unit/rc-U2` at `4bfd2ba8`, base `plan/records-gates`. Round 1 failed at `e6ee37e0` (`.sdlc/verdicts/records-gates-U2-review.md`).

## Round 1 finding

| Finding | State | Evidence |
|---|---|---|
| Critical: four prose em dashes in `.sdlc/handoffs/records-gates-U2.md` (lines 65, 89, 106, 109) reddened `test/repo/em-dash.mjs` | fixed | `node test/repo/em-dash.mjs` prints `self-test: PASS` and `em-dash: clean (796 files scanned)`, exit 0. The only glyph left in the handoff is line 22, inside a backtick span quoting the old rule verbatim, which the gate exempts. Line 89 now reads with a colon. |

## Criteria

| Id | Result | Reading |
|---|---|---|
| U2-1 | met | On the §6 slice: `after ADR-022` 0, `line 654` 0, `#742` 1, `after the last ADR` 1, glyph lines 0, `## ADR-NNN: title` 1. Matches the expected `0, 0, 1+, 1+, 0, 1+`. |
| U2-2 | met | `decision-records.md` heading counts: 27 total, 27 colon shape, 0 hyphen shape. |
| U2-3 | met | `range mismatches: 0` exit 0, `stale total: 0` exit 0, `git diff --numstat` for the file reads `2 2`. |
| P3 | met | `branding: clean (788 files scanned)`, em-dash gate green. The only added glyph outside a simple span is in the round 1 verdict, quoting a line inside nested backticks, and the gate passes it. |
| Scope wall | met | Changed files: `.sdlc/adapter.md`, `.sdlc/handoffs/records-gates-U2.md`, `.sdlc/verdicts/records-gates-U2-review.md`, `docs/reference/references/decision-records.md`. No deletions or renames. Nothing under `src/`, `scripts/`, `figma/`, `mcp/`, no other check script. |

The §6 rewrite, the two stub rows and the dated amendment are unchanged from round 1 and were read again: heading shape and append rule only, no ADR body touched.

Not run: `npm test` in full (the em-dash, branding and card checks were run directly). The verifier-l1 pass owed under Q2 is separate.

verdict: 🟢
