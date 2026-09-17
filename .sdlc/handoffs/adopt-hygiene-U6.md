# Handoff U6 · builder-l3 → reviewer

| Field | Value |
|---|---|
| Branch | unit/hygiene-U6 from `sdlc/adopt` @ d62207f, plus this unit's commit |
| Files | `.sdlc/records/cards/PLAN-adia-exports.md`, `.sdlc/records/cards/PLAN-export-schema.md`, `docs/reference/references/knowledge-04-export-formats.md`, `docs/spec/spec-panda-park-ui-exports.md`, `.github/workflows/describe-eval.yml`, `.sdlc/adapter.md` (append-only), `.sdlc/debt.md`, `.sdlc/tickets/T-0001.md` |
| Human default used | `.sdlc/questions/adopt-hygiene-marketplace.md` default A: leave `sdlc@nonoun` user-scoped, added debt row C5 |
| Ran | every U6 criterion + negative control below |
| Left out | nothing in scope; `docs/site/describe-palette-spec.md:579` is explicitly deferred to the plan's own close-out commit, per §U6's own file list |

## U6 criteria (5 total)

| # | Criterion | Result | Negative control |
|---|---|---|---|
| 1 | no live pointer outside the wall names the two pre-archive plan paths; the four sites name `docs/plan/archive/` | `0`, `4` 🟢 | at 80ae4d8 the first count is 3+ (reconfirmed from the prior verdict; not rerun here since it needs the pre-fix tree) |
| 2 | every repointed path resolves | `ok` twice 🟢 | pre-archive path lookup fails as stated in the plan |
| 3 | the eval key reaches only the guard and eval steps (U2-9) | `exit 0`, `false`, `2` 🟢; U2 row 9 commands rerun unchanged: `exit 0`, `1`, `0`, `yaml ok`, `0`, `0` 🟢 | at 80ae4d8: `true`, `1` (reconfirmed from the prior verdict) |
| 4 | the two behind-wall pointers are debt rows, adapter §2.2/§3 carry dated amendments, T-0001 names #643 | `1`, `1`, `1`, `1`, `0` 🟢 | at 80ae4d8: `0`, `0`, `0`, `0` |
| 5 | gates green, tree clean, branding clean | `branding: clean (417 files scanned)`; `npm test`: `✓ all 44 test files passed`; `git status --porcelain` 0 after this unit's commit 🟢 | P1 control not replanted here (already proven at prior units); rerun after restore is the recipe |

## Notes on the criterion commands as written

- **Criterion 3's job-level-env check is text-based, not YAML-semantic**: `node -e '...const job=y.split(/\n\s*steps:/)[0]...'` just tests whether the literal string `ANTHROPIC_API_KEY` appears anywhere before the first `steps:` line, including in comments. My first pass moved the `env:` block down but kept the job-level comment naming `ANTHROPIC_API_KEY` explicitly ("CI secret custody... ANTHROPIC_API_KEY must be added..."), which still made the check print `true` even though the key itself was no longer wired at job level. I reworded the comment to describe the secret without repeating its literal name before `steps:`. The command as written is not broken, but it is easy to satisfy by accident and fail by innocent wording — flagging it rather than treating the first green run as proof. Re-ran after the reword: `false`, matching the row's expected value.
- Row 1's regex (`docs/plan/plan-2026-09-(adia-derived-export-artifacts|export-schema-(\s*)?$|export-schema-revision)`) worked as written against the current head; I did not need to correct it. I did not replant the 80ae4d8 negative control in this worktree (it requires reverting the four pointer files), instead relying on the count already recorded in `.sdlc/verdicts/adopt-hygiene-prepr.md` for that baseline.

## Amendment content (criterion 4)

- `.sdlc/adapter.md` §2.2: one `**Amendment (2026-09-17).**` line stating `.sdlc/config.json` is committed with the proposed preset, by U2.
- `.sdlc/adapter.md` §3: one `**Amendment (2026-09-17).**` line naming what U2 (`.worktrees/` into `.gitignore` + branding `SKIP_DIRS`) and U3 (untracked `.claude/ops/`, squash-only merge) changed. `git diff 80ae4d8 -- .sdlc/adapter.md` has zero deleted lines (append-only held).
- `.sdlc/debt.md`: new rows `R12` (the two behind-wall pointers, `scripts/gen-adia-derived-exports.mjs:3`, `test/engine/adia-derived-exports.mjs:6`), `C5` (undeclared `sdlc@nonoun` marketplace, per the question default), `C6` (absolute home paths in `.sdlc/` records, marked accepted per the prepr verdict's 🟡).
- `.sdlc/tickets/T-0001.md`: one line under the frontmatter, `Mirrored to GitHub issue #643.`

## Plan-level scope wall

`git diff origin/main --stat -- src mcp scripts test ':!test/repo/branding.mjs'` is `0`. No `scripts/` or `test/` file touched (the two pointers named in debt row R12 stay behind the wall, unedited, per the plan). No `--no-verify`. `.sdlc/board.md` untouched. No retired-maker-brand or pre-rename-tag string written anywhere in this unit's files (branding gate clean, 417 files scanned).
