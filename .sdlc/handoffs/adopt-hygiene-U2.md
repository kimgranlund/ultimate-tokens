# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/hygiene-U2`, pass 2 commit on top of 04b93f0 |
| Plan | `.sdlc/plans/adopt-hygiene.md` §U2, rows 3 and 9 revised · re-diagnosis `.sdlc/plans/adopt-hygiene-U2-p2.md` |
| Pass | 2 |
| Files this pass | `.github/workflows/describe-eval.yml` · `.claude/CLAUDE.md` (reword of the pass-1 `html:` line, not a fourth edit under ruling C9) |
| Ran | `npm ci` 🟢 exit 0 · `npm run build` 🟢 exit 0, `wrote figma/plugin/ui.html 3695.6 KB` · `npm test` 🟢 `all 44 test files passed` · `node test/repo/branding.mjs` 🟢 `clean (395 files scanned)` · `actionlint` 🟢 exit 0 · `ruby -ryaml` 🟢 `yaml ok` |
| Criteria | U2 1 to 12 all 🟢 with rows 3 and 9 as revised · P1 to P5 all 🟢 · `git status --short` empty after commit |
| Left out | none. `.claude/settings.json` and `.sdlc/board.md` never staged; no `--no-verify`; nothing pushed |

## Pass 2 · the two verdict gaps

Both gaps in `.sdlc/verdicts/adopt-hygiene-U2.md` are closed. Nothing else in the U2 tree moved.

| Gap | Fix | Evidence |
|---|---|---|
| 🔴 row 9: `if: ${{ secrets.ANTHROPIC_API_KEY == '' }}` on a step, a context GitHub rejects, so the file errored at load | the secret moves to a job-level `env:`, where `secrets` is allowed, and a `Require the eval key` run step exits 1 on an empty value. The eval step drops its own `env:`; the R8 comment now states the mechanism | `actionlint` exit 0 · `grep -c 'if: ${{ secrets'` = 0 · `ruby` `yaml ok` · `mcp/` diff 0 |
| 🟡 row 3: the convention line named `<foreignObject>`, which appears 0 times in `src/ui` | the line now says the three section files pass an SVG string to `h("div", { class: "an-svg", html: svg })`, which sets `innerHTML` (`app-helpers.mjs:313`). The literal count 12 is unchanged | `grep -c innerHTML .claude/CLAUDE.md` = 1 · `grep -c foreignObject` = 0 · live sum still 12, all 12 in `src/ui/sections/` |

### Negative controls run this pass

| Control | Result |
|---|---|
| a step-level `if: ${{ secrets.X }}` planted in a scratch copy | `actionlint` exit 1, `context "secrets" is not allowed here` at the planted line, while `ruby` still printed `yaml ok`. The pass-1 check was vacuous without `actionlint` |
| the guard against a real empty key | `ANTHROPIC_API_KEY=` exits 1; a set key exits 0 |
| the mechanism CLAUDE.md names must exist in `src/ui` | `git grep -c innerHTML -- src/ui` matches 2 files; `foreignObject` matches none |
| scope wall without the `test/repo/branding.mjs` exclusion | 2, so `branding.mjs` is still the only file changed under the walled dirs |

### Criteria rerun, pass 2

| # | Criterion | State | Result |
|---|---|---|---|
| 1 | `## SDLC` between Shipping and Always, equals adapter §7 | 🟢 | headings in order, `diff` prints `same` |
| 2 | Commands line lists `gen:adia-exports`, drops "run the first three" | 🟢 | 1, 0 |
| 3 | `html:` exception names a live mechanism and its count (revised) | 🟢 | 1, 12, 1, 0 |
| 4 | shipping-changes drops the stale hook and model claims, points at adapter §2.1 | 🟢 | 0, 1, 1 |
| 5 | four ignore rules | 🟢 | 4 |
| 6 | branding gate skips `.worktrees/` | 🟢 | 1, then `clean (395 files scanned)` |
| 7 | `.gitattributes` covers the K9 set | 🟢 | 0 mismatches |
| 8 | `pages.yml` Node 22 and `npm ci` | 🟢 | 1, 0, 1 |
| 9 | describe-eval fails loudly on an absent key, in a form GitHub accepts (revised) | 🟢 | exit 0, 1, 0, `yaml ok`, 0, 0 |
| 10 | `workflow.json` canonical plus squash | 🟢 | `.sdlc/adapter.md squash` |
| 11 | `.sdlc/config.json` preset accepted | 🟢 | `github main kimgranlund/ultimate-tokens false`, `adapter.py config` exit 0 |
| 12 | `npm run build` green, tree stable | 🟢 | exit 0, no generated-asset drift |
| P1 | `npm test` green, tree stable | 🟢 | `all 44 test files passed` |
| P2 | private folder and `node_modules` untracked | 🟢 | 0 |
| P3 | scope wall | 🟢 | 0 |
| P4 | branding clean | 🟢 | `clean (395 files scanned)`, run in the unit worktree. The root checkout still walks `.worktrees/` until U2 merges, which the plan's risk table already rules |
| P5 | no rewritten record | 🟢 | 0 |

## Pass 1 · superseded on rows 3 and 9

The verdict overturned this pass's own 🟢 on rows 3 and 9. The table below is kept as the pass-1 record, not as a current claim.

| Field | Value |
|---|---|
| Branch | unit/hygiene-U2 |
| Plan | `.sdlc/plans/adopt-hygiene.md` §U2 |
| Files | `.claude/CLAUDE.md` · `.claude/skills/shipping-changes/SKILL.md` · `.claude/workflow.json` · `.gitignore` · `.gitattributes` (new) · `test/repo/branding.mjs` (SKIP_DIRS line only) · `.github/workflows/pages.yml` · `.github/workflows/describe-eval.yml` · `.sdlc/config.json` (new) |
| Ran | `npm ci` ✅ · `npm run build` ✅ exit 0 · `npm test` ✅ `all 44 test files passed` · `node test/repo/branding.mjs` ✅ `clean (394 files scanned)` · `git status --short` after gates: only the 9 files listed above (byte-stable) |
| Criteria | U2 1–12 all 🟢, run individually with each command from the plan; P1–P5 (scope wall, branding, no rewritten record) also 🟢 |
| Left out | none, full U2 scope covered. `.claude/settings.json` and `.sdlc/board.md` never staged, per instruction |

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
