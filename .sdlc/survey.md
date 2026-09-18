---
kind: survey
repo: ultimate-tokens
surveyed_at: 2026-09-18
head: cf8e61a26b2e97ea68dd7e8c5a21a682106a4b88
branch: main
status: ungraded
verdict: .sdlc/verdicts/survey.md
supersedes: survey of 2026-09-16 at f9e20c5 (graded, corrected)
---

# Survey: ultimate-tokens

Facts as returned by nine scouts on 2026-09-18 at `cf8e61a`. No interpretation. Grading lands in `.sdlc/verdicts/survey.md`. Rows marked (conductor) were re-measured by the Conductor where a scout's return was thin or wrong; the scout's original figure is kept beside it.

## Languages

Tracked files only (`git ls-files`), 460 total.

| extension | count |
|---|---|
| md | 271 |
| mjs | 103 |
| js | 34 |
| json | 27 |
| png | 5 |
| yml | 4 |
| html | 3 |
| css | 3 |

## Manifests

| path | kind | notes |
|---|---|---|
| `package.json` | package | 15 scripts, table below |
| `package-lock.json` | lock | undetermined |
| `tsconfig.json` | build config | undetermined |
| `vite.config.js` | build config | undetermined |
| `figma/plugin/manifest.json` | Figma manifest | undetermined |
| `figma/binder/figma-semantic-binder/manifest.json` | Figma manifest | undetermined |

| script | command |
|---|---|
| dev | `vite` |
| gen:figma-binder-code | `node scripts/gen-figma-binder-code.mjs` |
| gen:figma-assets | `node scripts/gen-figma-binder-code.mjs && node scripts/gen-figma-assets.mjs` |
| bundle | `node scripts/bundle.mjs` |
| gen:figma-ui | `node scripts/gen-figma-ui.mjs` |
| gen:preview | `node scripts/gen-preview.mjs` |
| gen:categories | `node scripts/gen-categories.mjs` |
| gen:adia-exports | `node scripts/gen-adia-derived-exports.mjs` |
| gen:mcp-assets | `node scripts/gen-mcp-assets.mjs && node scripts/gen-describe-mcp-assets.mjs` |
| gen:type-fonts | `node scripts/gen-type-fonts.mjs` |
| gen:plugin-pack | `node scripts/gen-plugin-pack.mjs` |
| build | `npm run gen:figma-assets && npm run gen:mcp-assets && npm run gen:categories && npm run gen:adia-exports && tsc && vite build && npm run bundle && npm run gen:figma-ui` |
| preview | `vite preview` |
| test | `npm run gen:figma-assets && npm run gen:mcp-assets && npm run gen:categories && npm run gen:adia-exports && npm run bundle && npm run gen:figma-ui && node test/run.mjs` |
| smoke | `npm run build && node test/smoke/smoke.mjs` |

## Tests

- runner: custom Node runner, `node test/run.mjs`
- test files: 49 tracked under `test/` (engine 15, figma 6, mcp 11, plugin 5, repo 3, smoke 1, ui 7, top level 1)
- test command: `npm test` (`package.json:29`, the six generators then `node test/run.mjs`); CI runs `npm test` at `.github/workflows/ci.yml:30`

## CI

| file | job | trigger |
|---|---|---|
| `.github/workflows/ci.yml` | build-test | push main + pull_request |
| `.github/workflows/ci.yml` | panda-smoke | push main + pull_request |
| `.github/workflows/ci.yml` | deploy | push main (needs build-test) |
| `.github/workflows/describe-eval.yml` | describe-eval | workflow_dispatch + schedule Mon 06:00 UTC |
| `.github/workflows/pages.yml` | deploy | workflow_dispatch only |
| `.github/workflows/publish-plugin.yml` | publish | push main (paths plugin/**, scripts/gen-plugin-pack.mjs, the workflow) + workflow_dispatch |

Last five `CI` runs on main (`gh run list --branch main --limit 5`):

| workflow | conclusion | head | created |
|---|---|---|---|
| CI | success | cf8e61a | 2026-09-18T11:35:16Z |
| CI | success | 279dc74 | 2026-09-18T11:30:59Z |
| CI | success | e3ef1d6 | 2026-09-18T11:24:14Z |
| CI | success | bda9584 | 2026-09-18T10:48:51Z |
| CI | success | b332be4 | 2026-09-18T10:46:17Z |

## Branches

| item | value |
|---|---|
| default branch | main |
| current branch (root checkout) | main |
| local branches | 33 |
| remote prefixes | chore 22, fix 3, docs 3, feat 2, defect 2, feature 1, plan 1, sdlc 1, bare numbered 5 to 6 (scout's count and its example list disagree) |
| main branch protection (GitHub API) | not configured (HTTP 404) |
| merge settings | squash-merge only since 2026-09-17 (`.sdlc/adapter.md` §2.1 amendment; not re-measured by the scout) |
| branch rules in docs | `.sdlc/adapter.md` §2: base main, `plan/<slug>` one per plan from `origin/main`, unit worktrees branch from it, never commit to main; `shipping-changes/SKILL.md:40-42`: branch from freshest main, PR title is the squash subject |

Worktrees at survey time (`git worktree list`):

| path | head | branch |
|---|---|---|
| root | cf8e61a | main |
| `.git-worktrees/638-dual-radix` | c269dbf | feat/638-dual-radix |
| `.git-worktrees/662-contrast-policy` | ae7f75d | fix/662-oncolor-contrast-policy |
| `.git-worktrees/668-stop800-uptick` | cf8e61a | fix/668-stop800-uptick |
| `.git-worktrees/674-adia-warning` | dd97b98 | fix/674-adia-warning-lift |
| `.git-worktrees/pif-u1-anchor` | fb3ad33 | unit/pif-u1-anchor |
| `/private/tmp/pr682-main-critic` | cf8e61a | detached |
| `/private/tmp/pr682-review-critic` | ae7f75d | detached |

The 638 and 674 heads moved between two reads a few minutes apart (ed229a8 to c269dbf, df87682 to dd97b98): another session is committing in them. None of the five `.git-worktrees/` rows has a board row.

## Harnesses

No AGENTS.md, `.cursor*`, `.github/copilot*`, `.codex/`, `.husky/`, or `.githooks/` present. `core.hooksPath` points at the sdlc plugin cache (`~/.claude/plugins/cache/nonoun/sdlc/0.1.0/githooks`).

Scout return: `.claude/CLAUDE.md` 9419 B (2026-09-17), `.claude/settings.json` 1183 B (2026-09-17), `.claude/agents` 3 files, `.claude/skills` 50 files, `.claude/hooks` 1 file, `.sdlc` 106 files. Per-file rows below are (conductor); skill `references/`, `evals/`, `scripts/` files are counted, not listed. `.claude/` tracks 57 files; `.sdlc/` tracks 104 (the scout's 106 included its own and a sibling's two stray untracked files, since removed).

| path | size (bytes) | last commit |
|---|---|---|
| `.claude/CLAUDE.md` | 9419 | 2026-09-17 |
| `.claude/agents/change-reviewer-agent.md` | 5063 | 2026-08-14 |
| `.claude/agents/marketing-manager-agent.md` | 3446 | 2026-08-14 |
| `.claude/agents/palette-researcher-agent.md` | 5232 | 2026-08-14 |
| `.claude/hooks/git-precommit-privatedocs-guard.mjs` | 3389 | 2026-07-31 |
| `.claude/naming.manifest.json` | 2352 | 2026-08-14 |
| `.claude/settings.json` | 1183 | 2026-09-17 |
| `.claude/skills/adding-export-formats/SKILL.md` | 12097 | 2026-09-12 |
| `.claude/skills/adding-semantic-roles/SKILL.md` | 8482 | 2026-08-14 |
| `.claude/skills/building-editor-sections/SKILL.md` | 8455 | 2026-07-11 |
| `.claude/skills/color-math/SKILL.md` | 11127 | 2026-07-12 |
| `.claude/skills/figma-file-migration/SKILL.md` | 10280 | 2026-08-14 |
| `.claude/skills/geometry-system/SKILL.md` | 17034 | 2026-09-02 |
| `.claude/skills/lemon-squeezy-api/SKILL.md` | 3682 | 2026-07-11 |
| `.claude/skills/lemon-squeezy-schemas/SKILL.md` | 3368 | 2026-07-11 |
| `.claude/skills/maintaining-brand-kit-mcp/SKILL.md` | 12530 | 2026-09-11 |
| `.claude/skills/maintaining-figma-plugins/SKILL.md` | 12940 | 2026-09-18 |
| `.claude/skills/project-docs/SKILL.md` | 4938 | 2026-09-17 |
| `.claude/skills/shipping-changes/SKILL.md` | 9021 | 2026-09-17 |
| `.claude/skills/type-scale/SKILL.md` | 16180 | 2026-09-02 |
| `.claude/skills/ultimate-tokens-brand-voice/SKILL.md` | 5256 | 2026-08-14 |
| `.claude/workflow.json` | 333 | 2026-09-17 |

`.sdlc/` tracked, by top-level entry: adapter.md, architecture.md, baseline.md, board.md, config.json, debt.md, survey.md (1 each), checks 2, handoffs 11, plans 6, questions 12, records 40, tickets 1, verdicts 25. No `.sdlc/roadmap.md`.

Gone since the last survey: `.claude/ops/*`, `.claude/overhaul-plan-2026-08-14.md`, `.claude/docs/reports/` are no longer tracked.

## Docs

| location | count | newest commit | note |
|---|---|---|---|
| README files | 4 | 2026-09-17 | root, `mcp/README.md`, `mcp/README-describe.md`, `plugin/ultimate-tokens/README.md` |
| `CHANGELOG.md` | 1 | 2026-09-18 | newest entry heading 2026-09-17 |
| `docs/reference` | 59 | 2026-09-18 | |
| `docs/marketing` | 11 | 2026-09-12 | |
| `docs/tickets` | 31 | 2026-07-17 | archive only |
| `docs/site` | 5 | 2026-09-17 | |
| `docs/plan` | 3 | 2026-09-17 | all 3 in `archive/` |
| `docs/lld` | 2 | 2026-09-18 | |
| `docs/spec` | 2 | 2026-09-18 | |
| `docs/prd` | 1 | 2026-09-17 | |
| `docs/img` | 1 | 2026-09-11 | |
| `docs/brand-assets` | 2 | 2026-07-12 | |
| `.sdlc/plans` | 6 | 2026-09-17 | 1 in `archive/` |

ADRs: 24 sections in `docs/reference/references/decision-records.md`, highest ADR-024.

## Authorship

Last 50 commits on `main`, `cf8e61a` back to `bef0bfd` (2026-09-11 (conductor); the scout reported 2024-03-19, which `git log -50 --format=%cs | tail -1` does not reproduce).

| signal | count |
|---|---|
| author Kim Granlund | 50 |
| subject ends `(#NNN)` (squash-merge) | 49 (conductor re-run agrees) |
| merge commits | 1 (conductor re-run agrees) |
| `Seat: orchestrator` trailer | 2 |
| `Co-Authored-By` trailer lines, all 50 bodies | 166: Opus 5 63, Fable 5.1 54, Sonnet 5 33, Opus 5 (1M context) 16 |

The scout's category table sums to 51 (49 + 1 + 1), so one commit is counted twice; which one is undetermined. Commits carrying at least one agent trailer: undetermined (the scout counted lines, not commits).

| prefix | count |
|---|---|
| fix | 13 |
| docs | 9 |
| feat | 8 |
| chore | 2 |
| sdlc | 1 |
| none | 17 |

## Hygiene

| item | value |
|---|---|
| `.env*` files tracked | 0 |
| secret patterns (`AKIA`, `ghp_`, `sk-`, private-key header, `api_key =` literal) | 0 secrets; `AKIA` appears as a pattern name in `.sdlc/survey.md` and `.sdlc/verdicts/survey.md` only |
| largest tracked | `figma/plugin/ui.html` 3.7 MB, `src/ui/describe-mcp-assets.js` 697 KB, `test/ui/headless-boot.mjs` 302 KB, `docs/reference/colors/categories/travel.json` 252 KB, `src/ui/categories/travel.js` 235 KB, `src/ui/type-fonts.js` 229 KB, `src/ui/categories/nature.js` 224 KB, `docs/reference/colors/categories/music.json` 222 KB, `film.json` 220 KB, `literature.json` 220 KB |
| `.gitattributes` `linguist-generated` | `figma/plugin/ui.html`, `src/ui/figma-plugin-assets.js`, `src/ui/mcp-assets.js`, `src/ui/describe-mcp-assets.js`, `src/ui/type-fonts.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-oklch-export.css`, `docs/reference/data/adia-radix-export.mjs`, `figma/binder/figma-semantic-binder/code.js` |
| `dist/`, `build/` tracked | no |
| `node_modules` tracked | no (`git ls-files node_modules` empty) |
| `.sdlc/runtime`, `.worktrees`, `.git-worktrees`, `smoke-out` | in `.gitignore` |
| `.sdlc/launcher.env`, `.claude/docs/other/` | in `.git/info/exclude` |
| `.claude/settings.local.json` | ignored only by the user-global `~/.config/git/ignore` (conductor, `git check-ignore -v`); the scout reported "not present in repo" |

Process note: the hygiene and authorship scouts each wrote an untracked report file under `.sdlc/` against a read-only brief. Both were folded in here and deleted; the root tree was clean afterwards.

## Claims to verify

| id | claim | source | how to check |
|---|---|---|---|
| C1 | `npm test` runs without `node_modules` and exits 0 on `cf8e61a`, last line `all N test files passed` | CLAUDE.md, adapter §1 | run it in a checkout without node_modules; report N |
| C2 | `npm run build` exits 0 on `cf8e61a` after `npm ci` | CLAUDE.md | `npm ci && npm run build` |
| C3 | `npm run smoke` exits 0 on `cf8e61a` | CLAUDE.md, ci.yml | run it; requires Chrome |
| C4 | CI `build-test` and `panda-smoke` are both green on `cf8e61a` | ci scout (workflow-level only) | `gh run view` the cf8e61a run, per job |
| C5 | main has no branch protection | branches scout | `gh api repos/{owner}/{repo}/branches/main/protection` |
| C6 | The repo allows squash-merge only | adapter §2.1 amendment | `gh api repos/{owner}/{repo} -q '.allow_squash_merge,.allow_merge_commit,.allow_rebase_merge'` |
| C7 | 49 of the last 50 subjects end `(#NNN)`, 1 merge commit, oldest of the 50 is `bef0bfd` dated 2026-09-11 | authorship scout + conductor | `git log -50 --format='%h %cs %s'` |
| C8 | `.claude/` tracks 57 files: 3 agents, 14 skills, 1 hook, CLAUDE.md, settings.json, workflow.json, naming.manifest.json, the rest skill support files | conductor | `git ls-files .claude` |
| C9 | 49 tracked files under `test/`; adapter §1's baseline N = 44 still matches what `test/run.mjs` registers, or names the new N | tests scout, adapter §1 | `git ls-files test \| wc -l`; count TESTS in `test/run.mjs` |
| C10 | 24 ADRs, highest ADR-024; the approved plan preset-intent-fidelity reserves ADR-025 and nothing on main has taken it | docs scout, plan C10 | grep `^## ADR-` in decision-records.md |
| C11 | Generated assets are byte-identical after `npm test` on `cf8e61a` (`git status --short` empty) | CLAUDE.md, adapter §1 | run with C1 |
| C12 | No secrets in tracked files | hygiene scout | rerun the greps |
| C13 | `.claude/settings.local.json` and `.sdlc/launcher.env` cannot reach a commit from this checkout | hygiene scout + conductor | `git check-ignore -v` both paths |
| C14 | Five `.git-worktrees/` worktrees exist with no board row, and `unit/pif-u1-anchor` equals `origin/plan/preset-intent-fidelity` at `fb3ad33` | branches scout, orchestrator reconcile note | `git worktree list`; `git rev-parse` both refs |
| C15 | `.sdlc/baseline.md`, `.sdlc/architecture.md`, `.sdlc/debt.md` cite a head older than `cf8e61a`; list which of their facts the 8 commits since `180eca0` touch | conductor | `git diff --stat 180eca0..cf8e61a` against each file's cited paths |
