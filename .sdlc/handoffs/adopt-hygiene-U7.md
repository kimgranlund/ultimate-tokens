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

## debt.md changes (criterion 2, pass 1; ids as of pass 2)

- C5 marked resolved by U7, with a note that debt id C5 is distinct from adapter conflict C5.
- C6 file list extended to include `.sdlc/debt.md` itself (the U6 review minor at `.sdlc/verdicts/adopt-hygiene-U6-review.md:45`), with a note that debt id C6 is distinct from adapter conflict C6.
- New row C7 (added as C13 in pass 1, renumbered in pass 2): push the local `sdlc-orchestration` repo to `kimgranlund/sdlc-orchestration` on GitHub so the `nonoun` marketplace resolves on a fresh clone; sized S, grade human, not a code change.

## Pass 2 · builder-l7

Verdict `.sdlc/verdicts/adopt-hygiene-U7.md` row 2 was 🔴; fix text from `.sdlc/plans/adopt-hygiene-U7-p2.md`.

| Field | Value |
|---|---|
| Base | `unit/hygiene-U7` @ ac52be8 |
| Files | `.sdlc/debt.md`, this handoff |
| Changed | C5 and C6 last cells rewritten (no em dash, no bold label, note names the adapter row); C13 renumbered C7 with an adapter C7 note; row count line now `Config smells 7 ... total 45`. No row deleted |
| Left out | the merge of `sdlc/adopt` @ b001a21 suggested by the re-diagnosis (it carries `.sdlc/board.md` and would add a second commit); `.claude/settings.json` untouched |

| # | Criterion | Result | Negative control |
|---|---|---|---|
| 1 | `nonoun` declared with the `nonoun-plugins` shape; nothing else in settings changes | `github kimgranlund/sdlc-orchestration true true`; diff vs 39db0a9: 6 changed lines, 0 removed 🟢 | 39db0a9: `undefined undefined true true` |
| 2 | debt records the unpushed repo, C5 resolved, C6 complete, clashing ids noted, no em dash or bold label, row count true | `2`, no `missing` line, no `clash` line, `0`, `0`, `7 / 7`, `45 / 45` 🟢 | 65bbda3: `0`, `missing .sdlc/debt.md`, `clash C5`, `clash C6`, `0`, `0`, `4 / 6`, `41 / 44`; ac52be8: `2`, `clash C13 without note`, `2`, `1`, `4 / 7`, `41 / 45`; scratch copy with C7 renamed C8: `clash C8 without note` only |
| 3 | JSON valid, `npm test` green, tree clean, branding clean | `✓ all 44 test files passed` (branding test included); porcelain shows only the two pass 2 files before commit, `0` after 🟢 | scratch copy of settings with the `nonoun` colon removed: `SyntaxError ... Expected ':'` |
