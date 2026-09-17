# Handoff U4 · builder → verifier

| Field | Value |
|---|---|
| Branch | unit/hygiene-U4 @ (see commit below) |
| Files | `.sdlc/verdicts/adopt-hygiene-U1-review.md` (P4 row only) |
| Ran | `npm test` ✅ (`all 44 test files passed`) · `git status --porcelain` ✅ (0 after commit) |

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | U1 review paraphrases the retired brand/domain, only P4 row changed | 🟢 | `branding: clean (409 files scanned)`; `git diff 29a2c06 --stat` → `1 file changed, 1 insertion(+), 1 deletion(-)` | at 29a2c06: `FAIL: 2 branding violation(s)` |
| 2 | U1 row 7 grep excludes `.sdlc/tickets`, prints 0 on head | 🟢 | `moved`, `1`, `0` | same grep without the exclusion: `1` |
| 3 | `npm test` green, tree clean | 🟢 | `all 44 test files passed`; `git status --porcelain` → 0 after commit | at 29a2c06: `1/44 test file(s) failed` |

Left out: none. Plan row 2 (U1-7 exclusion already in place at 39b78dc) confirmed, not re-edited.
