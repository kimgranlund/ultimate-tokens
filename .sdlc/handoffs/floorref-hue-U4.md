# Handoff floorref-hue U4 · builder-l1 → reviewer

| Field | Value |
|---|---|
| Branch | `unit/fh-U4` off `plan/floorref-hue` (`774512dc`); code commit `a0e00f36` |
| Ticket | #766 |
| Files | `.sdlc/checks/baseline-agrees-check.sh` (line 42, one token: `t.length === 3` to `t.length >= 3`) · this handoff |
| Ran | `bash .sdlc/checks/baseline-agrees-check.sh` 🟢 `stale total: 0`, `ui.html: baseline 4165.2 KB, tree 4165.2 KB` reads ok · `node test/repo/em-dash.mjs` 🟢 `clean (1123 files scanned)` · `node test/repo/branding.mjs` 🟢 `clean (1115 files scanned)` |
| Left out | `npm test`/build/smoke (a `.sdlc/` shell check only; no `src/`, `test/` or bundle touched); the plan file and board (Orchestrator's) |

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C4.1 | `git diff --stat HEAD~1..HEAD -- .sdlc/checks/baseline-agrees-check.sh` | `1 file changed, 1 insertion(+), 1 deletion(-)`; the only changed line is `t.length === 3` becoming `t.length >= 3` | reverting the token gives an empty diff and C4.2 reds (see C4.2) | 🟢 |
| C4.2 | `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0`; `ok time gate:even-dips: baseline 36 to 54 s, adapter 36 to 54 s` and `ok time gate:chroma-envelope: baseline 20 to 21 s, adapter 20 to 21 s` | run before the edit with `=== 3`: `STALE time gate:even-dips` and `STALE time gate:chroma-envelope`, `stale total: 2` | 🟢 |
| C4.3 | `grep -c "length === 3\|length >= 3" .sdlc/checks/baseline-agrees-check.sh` | `1` (one timing-row condition, not duplicated) | `git show plan/floorref-hue:.sdlc/checks/baseline-agrees-check.sh \| grep -c "length >= 3"` is `0`, now `1` | 🟢 |
| C4.4 | `node test/repo/em-dash.mjs && node test/repo/branding.mjs` | `em-dash: clean (1123 files scanned)`, `branding: clean (1115 files scanned)`, exit 0 | appended a U+2014 line to a tracked file (`CHANGELOG.md`, restored with `git checkout`): `FAIL: 1 em dashes outside inline code spans in 1 files` | 🟢 |
