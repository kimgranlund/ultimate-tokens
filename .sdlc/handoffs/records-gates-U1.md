# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rc-U1 @ 8c016f23 |
| Files | `.sdlc/checks/card-source-range-check.sh`, `.sdlc/checks/card-amendment-check.sh`, `.sdlc/adapter.md` |
| Ran | G0 ✅ (`CLOSED COMPLETED`, `1`, `1`, `25`, `53`, `bad 0`) · `npm test` ✅ `all 53 test files passed`, tree clean after · U1-1 ✅ · U1-2 ✅ · U1-3 ✅ |
| Left out | nothing in scope |

## G0 (rule-gates landed)

`gh issue view 730` → `CLOSED COMPLETED`; `origin/main:test/run.mjs` names `repo/em-dash.mjs` → `1`; `origin/main:.sdlc/checks/card-source-range-check.sh` has `[: ]` → `1`; `decision-records.md` colon headings → `25`; `TESTS` length → `53`; `verdict-frontmatter-check.sh` over `origin/main`'s archived verdicts → `verdicts 162 graded 162 bad 0`. No backfill list for U3 to inherit.

## Criteria

| Id | Command | Expected | Got | Negative control | Control result |
|---|---|---|---|---|---|
| U1-1 | both card scripts, tail -1 each | `range mismatches: 0` exit 0, `stale total: 0` exit 0, `exit $((n > 0))` on both last lines | matched | clone 8c016f23, ADR-025 Source row set to `682-694` | `range mismatches: 2`, exit 1; separately, drop `Amendment (2026-09-16)` from ADR-010's `Supersedes` row | `stale card ADR-010`, `stale total: 1`, exit 1 |
| U1-2 | `grep -c` on adapter §1 sentence, §2.1 wording, `#745` | `1`, `1`, `1` or more | matched | tree before this unit's edit | `0`, `0`, `0` |
| U1-3 | other four checks untouched, still exit on count | `0`, `1`, `1` | matched | clone 8c016f23, appended a line to `doc-drift-rows-check.sh` | first count → `1` |

Both scripts' last two lines:

```
$ tail -2 .sdlc/checks/card-source-range-check.sh
echo "range mismatches: $n"
exit $((n > 0))
$ tail -2 .sdlc/checks/card-amendment-check.sh
echo "stale total: $n"
exit $((n > 0))
```

Adapter §1 gained one bullet at the end of "Rules the gates imply": every script under `.sdlc/checks/` is read by its last line and its exit code, a non-zero count is a non-zero exit (#745). §2.1 item 1's "records each in the pre-land table" became "records each one's last line and exit code in the pre-land table".

`npm test`: `✓ all 53 test files passed`, exit 0, `git status --short` empty after.

No em dash added; no scope-wall files touched beyond U1's three.
