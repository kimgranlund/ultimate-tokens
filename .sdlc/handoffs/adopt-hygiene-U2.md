# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/hygiene-U2 |
| Plan | `.sdlc/plans/adopt-hygiene.md` §U2 |
| Files | `.claude/CLAUDE.md` · `.claude/skills/shipping-changes/SKILL.md` · `.claude/workflow.json` · `.gitignore` · `.gitattributes` (new) · `test/repo/branding.mjs` (SKIP_DIRS line only) · `.github/workflows/pages.yml` · `.github/workflows/describe-eval.yml` · `.sdlc/config.json` (new) |
| Ran | `npm ci` ✅ · `npm run build` ✅ exit 0 · `npm test` ✅ `all 44 test files passed` · `node test/repo/branding.mjs` ✅ `clean (394 files scanned)` · `git status --short` after gates: only the 9 files listed above (byte-stable) |
| Criteria | U2 1–12 all 🟢, run individually with each command from the plan; P1–P5 (scope wall, branding, no rewritten record) also 🟢 |
| Left out | none — full U2 scope covered. `.claude/settings.json` and `.sdlc/board.md` never staged, per instruction |

## Criteria detail

| # | Criterion | Result |
|---|---|---|
| 1 | `## SDLC` between Shipping/Always, equals adapter §7 verbatim | 🟢 headings in order, `diff` prints `same` |
| 2 | Commands line lists `gen:adia-exports`, drops "run the first three" | 🟢 `1` then `0` |
| 3 | `html:` exception ratified with live count 12 | 🟢 grep `1`, live sum `12` |
| 4 | shipping-changes drops stale hook/model claims, points at adapter §2.1 | 🟢 `0`, `1`, `1` |
| 5 | four ignore rules added | 🟢 `4` |
| 6 | branding gate skips `.worktrees/` | 🟢 `1`, probe prints `clean (... files scanned)` |
| 7 | `.gitattributes` covers the K9 set | 🟢 `0` mismatches |
| 8 | `pages.yml` Node 22 + `npm ci` | 🟢 `1`, `0`, `1` |
| 9 | describe-eval fails loudly on a missing key | 🟢 `exit 1` present, `stays green` absent, YAML valid, `mcp/` untouched |
| 10 | `workflow.json` canonical + squash | 🟢 `.sdlc/adapter.md squash` |
| 11 | `.sdlc/config.json` §2.2 preset, adapter accepts it | 🟢 `github main kimgranlund/ultimate-tokens false`, `adapter.py config` exit 0 |
| 12 | `npm run build` green, tree clean after | 🟢 `exit 0`, `git status --short` shows only source edits |
