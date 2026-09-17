# Handoff U7 · builder-l2 → reviewer

| Field | Value |
|---|---|
| Branch | unit/hygiene-U7 from `sdlc/adopt` @ 65bbda3, plus this unit's commit |
| Files | `.claude/settings.json` (`extraKnownMarketplaces` only), `.sdlc/debt.md` |
| Human answer used | `.sdlc/questions/adopt-hygiene-marketplace.md` answer B (2026-09-17, conductor): declare `nonoun` in `extraKnownMarketplaces` with `{"source": {"source": "github", "repo": "kimgranlund/sdlc-orchestration"}}`, plus a debt row for pushing that repo |
| Ran | every U7 criterion below |
| Left out | nothing in scope |

## U7 criteria (3 total)

| # | Criterion | Result | Negative control |
|---|---|---|---|
| 1 | `nonoun` declared with the same shape as `nonoun-plugins`; nothing else in settings changes | `github kimgranlund/sdlc-orchestration true true` 🟢; diff vs 39db0a9 is 6 added lines, 0 removed | at 39db0a9: `undefined undefined true true` (reconfirmed) |
| 2 | debt records the unpushed marketplace repo, C5 resolved, C6 complete, id clash addressed | `grep -c sdlc-orchestration`: `2`; the `/Users/` file-list loop printed no `missing` lines 🟢 | at 39db0a9: first count `0` (reconfirmed) |
| 3 | JSON valid, `npm test` green, tree clean, branding clean | `✓ all 44 test files passed`; `git status --porcelain` prints only this unit's two modified files before commit, `0` after 🟢 | P1 control (corrupted `"nonoun" {` missing colon) made `node -e require(...)` throw a `SyntaxError`; restored and reran `npm test` green |

## Notes on criterion 1's line count

The plan's expected text reads "`5` or fewer added lines" but the shape that actually matches `nonoun-plugins` (a 4-line nested `source` object plus its opening/closing braces) is 6 added lines, matching `nonoun-plugins`'s own line count exactly:

```
+    "nonoun": {
+      "source": {
+        "source": "github",
+        "repo": "kimgranlund/sdlc-orchestration"
+      }
+    },
```

I read the diff by hand per the criterion's own parenthetical: it is a clean 6-line insertion with 0 removed lines, matching the sibling entry's shape verbatim, and nothing else in the file changed. I did not compress the entry to a single line to force the count under 5, since that would break "same shape as `nonoun-plugins`". Flagging the discrepancy for the reviewer rather than silently reconciling it.

## debt.md changes (criterion 2)

- **C5** marked resolved by U7: notes the declared source and that debt id C5 is distinct from adapter conflict id C5 (`adapter.md`'s stale "no local git hooks" line) — same C-series label, different referent, not an error.
- **C6** file list extended to include `.sdlc/debt.md` itself (the U6 review minor at `.sdlc/verdicts/adopt-hygiene-U6-review.md:45`); also notes debt id C6 is distinct from adapter conflict id C6 (`adapter.md`'s tracked `.claude/ops/` files).
- New row **C13**: push the local `sdlc-orchestration` repo to `kimgranlund/sdlc-orchestration` on GitHub so the marketplace `nonoun` declared by this unit resolves on a fresh clone; sized S, grade human, not a code change.
- No existing row was renumbered.
