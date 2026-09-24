---
kind: handoff
plan: records-tidy
unit: U1
branch: unit/records-tidy-U1
written: 2026-09-20
pass: 1
---

# U1 handoff: rerun note, K17 debt row, adapter pre-land grade

measured at f4c6bac6

## Files

- `.sdlc/architecture.md`: line 18 only, the rerun note, per §Texts.
- `.sdlc/debt.md`: line 92 only, the K17 exceptions row, per §Texts.
- `.sdlc/adapter.md`: line 58 in place, plus the `**Amendment (2026-09-20).**` paragraph inserted after §2.1 item 4 and its blank line, before `### 2.2`.

## Block U1-1

```
0
1
1
1
1
```

## Block U1-2

The filter string lifted from `.sdlc/architecture.md`'s K17 cell:

```
grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs\|gate-report.mjs\|repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs"
```

```
1
0
1
1
```

## Block U1-3

```
0
2
1
1
2
1
```

## Block U1-4

```

18
      18
19
31
1
7
19 19
```

## Block U1-5

```
0
```

## P1, P4, P5

- P1: `npm test` → `✓ all 48 test files passed`; `git status --short | wc -l` → `3` (the three edited files, unchanged by the test run; tree byte-stable across the run itself)
- P4: `branding: clean (471 files scanned)`, `exit 0`
- P5: `0`
