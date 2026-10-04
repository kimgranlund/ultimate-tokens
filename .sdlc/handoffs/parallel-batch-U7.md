# Handoff · parallel-batch U7 (#783 citations half) · builder to orchestrator

| Field | Value |
|---|---|
| Unit | U7, branch `unit/pb-U7`, base `plan/parallel-batch` @ 61bcd123 |
| Lane | `test/repo/citations.mjs` only (plus this handoff) |
| Verdict ask | C7.1, C7.2, C7.3 |

## What changed

| Leg | Change |
|---|---|
| Bare literal (4b) | `bareLiteralSource` now also matches `true` / `false` and a parenthesised literal, in every shape it already took (plain, arrow, async, block body). Self-test gains positives `source: () => true,`, `() => false },`, `async () => { return true; },`, `() => (7),`, `async () => { return 7; },` and negatives `() => truthy(x) },`, `() => true && ok() },`, `() => (await f()).length },`. |
| Narrowed noun (4c) | After `if (!pin.noun) continue;` a pin whose needle ends in a singular word must have a noun that full-matches both that word and its plural. `roles?` reads `role` and `roles`; a narrowed `role` reads only the singular, so the pin reds: ``fact pin "roles per palette": noun `role` is narrowed ...``. Plural needles (`15 voices`, `ten colour formats`) are unchanged. |

Why the noun rule keys on the needle: `a 53-role` still matches the narrowed `role`, so the per-pin floor is met and `53 roles` on `ui-plan.md:163` (and any drifted `52 roles`) would never be read. The needle is the one text the pin already must carry, so no new config is added.

## Hunk-level isolation (pane-context #785)

`git diff -U0 origin/main...origin/plan/pane-context -- test/repo/citations.mjs | grep '^@@'` at dispatch:

```
@@ -61 +61 @@ for (const e of DOCS_EXEMPT) ...
@@ -85,2 +84,0 @@ const FACT_PINS = [
```

My hunks (`git diff -U0 HEAD`, new-side lines): 127-128, 130, 137-138, 217-221. Nearest is 127, more than 40 lines from :85. Disjoint, confirmed.

## Evidence

~~~sh ran
# C7.2 at the unit head (clone, narrowing sed applied)
sed -i '' 's/noun: "roles?"/noun: "role"/' test/repo/citations.mjs; out=$(mktemp); node test/repo/citations.mjs > "$out" 2>&1; echo "exit $?"; grep -c 'roles per palette' "$out"
# C7.2 at the base, same sed
# C7.1 planted pins: each of `() => true`, `async () => { return 7; }`, `() => (7)` swapped into the `btn home` pin in a clone
# C7.3
node test/repo/citations.mjs | grep -c FAIL
~~~

~~~out ran
C7.2 head : exit 1, count 1, line: ✗ test/repo/citations.mjs: count phrases: fact pin "roles per palette": noun `role` is narrowed, its needle's `role` is singular so the noun must read `role` and `roles`
C7.2 base : exit 0, count 0 (the gap #783 names)
C7.1 plant `() => true`                : ✗ fact pin "btn home": bare literal source ...
C7.1 plant `async () => { return 7; }` : ✗ fact pin "btn home": bare literal source ...
C7.1 plant `() => (7)`                 : ✗ fact pin "btn home": bare literal source ...
C7.3 : 0
unmodified head: ✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins + 35 count phrases
~~~

Planted-red controls (both legs) are the C7.1 and C7.2 rows above; both clones lived under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U7/` and are not committed.

## Gates

| Gate | Result |
|---|---|
| `node test/repo/em-dash.mjs` | clean |
| `node test/repo/branding.mjs` | clean |
| `npm test` | `✓ all 54 test files passed`, exit 0 (54 files in `TESTS`), tree clean after apart from this unit's files |
| `git diff --name-only 61bcd123..HEAD` | `test/repo/citations.mjs`, this handoff |

R98: no override, shim or fallback added.
