# Handoff U5 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rc-U5 @ 163da18f (handoff commit follows) |
| Files | `.sdlc/adapter.md` (§3, one sentence) |
| Ran | `npm test` ✅ `✓ all 54 test files passed`, exit 0, `git status --short` 0 lines (host load about 32) · U5-1 ✅ · U5-2 ✅ · U5-3 ✅ · U5-4 ✅ |
| Left out | nothing in scope; `ceiling-counts-check.mjs` untouched |

## What changed

Figures read off the baseline by U5-2's commands: `20` rows, maximum `1670.43`, the plan's own figures.

Old sentence: "That evidence now lives as a labelled prior set in `.sdlc/baseline.md` §Interim gate-time ceiling (the section stays for history; nothing there is graded against `npm test` any more)."

New sentence: "That evidence now lives as a labelled prior set in `.sdlc/baseline.md` §Interim gate-time ceiling, a 20-reading series from 284 s to 1670.43 s (the section stays for history; nothing there is graded against `npm test` any more; the ceiling-counts check reads this sentence's two figures against the section's rows, #755)."

Check, last four lines:

```
ok    adapter note max == series max  (note 1670.43, series 1670.43)
partition: 20 = 3 graded + 14 explicit + 3 unsupportable
ceiling-counts: clean
```

and the line above them, `ok    adapter note count == rows  (note 20, rows 20)`.

## Criteria

| Id | Got | Negative control | Control result |
|---|---|---|---|
| U5-1 | tail as above, `exit 0`, shape grep `1` | clone at unit head, `adapter.md` reverted to base | `FAIL  adapter pointer found`, `ceiling-counts: 1 failure(s)`, `exit 1`, grep `0` |
| | | clone, sentence's `20` to `19` | `FAIL  adapter note count == rows  (note 19, rows 20)`, `exit 1`, grep `1` |
| U5-2 | `20`, `1670.43`, `1`, `1`, `1`, `1` | clone, sentence moved into the §1 `npm test` row | check exit `0`, third command `0` |
| | | clone, `Retired, #713 U6b` renamed | fifth command `0` |
| U5-3 | `✓ all 54 test files passed`, `0`, `0` | clone, `"scrim` to `"scrimX` in `role-table.json` | `npm test` exit `1` |
| | | clone, one byte appended to `ceiling-counts-check.mjs` | third command `1` |
| U5-4 | `0`, `branding: clean (796 files scanned)`, `exit 0`, `em-dash: clean (804 files scanned)`, filter `1` (see note) | clone, one glyph line added to `adapter.md` | glyph count `1`, `em-dash.mjs` exit `1` |
| | | the check's path through the filter | `1` |

Note on U5-4's last command: it prints `1` against `origin/main` because the plan branch already carries `.sdlc/plans/prompt-audit.md` (not this unit's file, and not in the plan's filter). `git diff --name-only 8002b414 HEAD` names only `.sdlc/adapter.md` for this unit.

Scratch clone: `/private/tmp/claude-501/rcU5/ctl`; logs `test.log`, `ctl.log`.

No em dash added to any tracked file.
