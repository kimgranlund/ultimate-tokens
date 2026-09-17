---
kind: survey
repo: ultimate-tokens
surveyed_at: 2026-09-16
head: f9e20c52f5b73a2358be4bf17a63d79dbbc63c16
branch: sdlc/adopt
status: graded
verdict: .sdlc/verdicts/survey.md
corrected: 2026-09-16 (C7, C8, C9, C10, C12 facts fixed per verdict)
---

# Survey: ultimate-tokens

Facts as returned by nine scouts. No interpretation. Grading lands in `.sdlc/verdicts/survey.md`.

## Languages

Tracked files only (`git ls-files`), 357 total.

| extension | count |
|---|---|
| md | 174 |
| mjs | 99 |
| js | 34 |
| json | 28 |
| png | 5 |
| yml | 4 |
| html | 3 |
| css | 3 |

## Manifests

| path | kind | notes |
|---|---|---|
| `package.json` | package | Root ESM module; exports .engine, .tonal, .semantic, .model |
| `package-lock.json` | lock | typescript ~6.0.2, vite ^8.0.12 |
| `tsconfig.json` | build config | ES2023 target, bundler resolution, strict unused-locals/params |
| `.claude/naming.manifest.json` | naming manifest | Estate vocab for skills/agents; seeded 2026-08-14 |
| `figma/binder/figma-semantic-binder/manifest.json` | Figma manifest | id color-tokens-semantic-binder, main code.js |
| `figma/plugin/manifest.json` | Figma manifest | id ultimate-tokens, ui ui.html, main code.js |

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

- runner: `node test/run.mjs` (custom harness, no framework); runs 44 files. Other entrypoints: `test/smoke/smoke.mjs` (`npm run smoke`), `scripts/smoke-panda.mjs` and `mcp/describe-eval-runner.mjs` (CI only); `test/ui/counts.mjs` is a helper
- test files: 50 tracked under `test/` (47 .mjs, 2 .json, 1 .css)
- ci command: `npm test`

## CI

| file | job | trigger | key commands |
|---|---|---|---|
| `.github/workflows/ci.yml` | build-test | push main + pull_request | `npm ci` → `npm run build` → `npm test` → `npm run smoke` |
| `.github/workflows/ci.yml` | panda-smoke | push main + pull_request | `node scripts/smoke-panda.mjs` |
| `.github/workflows/ci.yml` | deploy | push main (needs build-test) | `actions/deploy-pages@v4` |
| `.github/workflows/pages.yml` | deploy | workflow_dispatch only | `npm install` → `npm run build` → deploy-pages |
| `.github/workflows/publish-plugin.yml` | publish | push main (paths plugin/**, scripts/gen-plugin-pack.mjs, the workflow) + workflow_dispatch | version compare → `npm test` → `node scripts/gen-plugin-pack.mjs` → `npm publish` |
| `.github/workflows/describe-eval.yml` | describe-eval | workflow_dispatch + schedule Mon 06:00 UTC | `npm ci` → `node mcp/describe-eval-runner.mjs` |

Node 22 in ci.yml, publish-plugin.yml, describe-eval.yml; Node 20 in pages.yml. ci.yml and describe-eval.yml use `npm ci`; pages.yml uses `npm install`.

## Branches

| item | value |
|---|---|
| default branch | main |
| current branch | sdlc/adopt |
| remote branches | 42 |
| local branches | 43 |
| naming prefixes (top) | chore 22, docs 3, fix 2, feat 2, defect 2, agent 2 |
| protection hints in docs | squash-merge mentioned in docs/tickets/tkt-0009.md, tkt-0010.md, docs/plan/ |
| main branch protection (GitHub API) | not configured (404) |

## Harnesses

No AGENTS.md, .cursor*, .github/copilot*, or .codex/ present.

| path | kind | size (bytes) | last commit |
|---|---|---|---|
| `.claude/CLAUDE.md` | file | 7056 | 2026-09-12 (no root CLAUDE.md; moved under .claude/ in d4f5e80, 2026-07-29) |
| `.claude/settings.json` | file | 1104 | 2026-09-16 (working tree modified, `6 +++---`) |
| `.claude/settings.local.json` | file | 1725 | untracked |
| `.claude/workflow.json` | file | 298 | 2026-09-11 |
| `.claude/agents/change-reviewer-agent.md` | agent | 5063 | 2026-08-14 |
| `.claude/agents/marketing-manager-agent.md` | agent | 3446 | 2026-08-14 |
| `.claude/agents/palette-researcher-agent.md` | agent | 5232 | 2026-08-14 |
| `.claude/skills/adding-export-formats/SKILL.md` | skill | 12097 | 2026-09-12 |
| `.claude/skills/adding-semantic-roles/SKILL.md` | skill | 8482 | 2026-08-14 |
| `.claude/skills/building-editor-sections/SKILL.md` | skill | 8455 | 2026-07-11 |
| `.claude/skills/color-math/SKILL.md` | skill | 11127 | 2026-07-12 |
| `.claude/skills/figma-file-migration/SKILL.md` | skill | 10280 | 2026-08-14 |
| `.claude/skills/geometry-system/SKILL.md` | skill | 17034 | 2026-09-02 |
| `.claude/skills/lemon-squeezy-api/SKILL.md` | skill | 3682 | 2026-07-11 |
| `.claude/skills/lemon-squeezy-schemas/SKILL.md` | skill | 3368 | 2026-07-11 |
| `.claude/skills/maintaining-brand-kit-mcp/SKILL.md` | skill | 12530 | 2026-09-11 |
| `.claude/skills/maintaining-figma-plugins/SKILL.md` | skill | 11944 | 2026-09-02 |
| `.claude/skills/project-docs/SKILL.md` | skill | 4814 | 2026-08-14 |
| `.claude/skills/shipping-changes/SKILL.md` | skill | 8806 | 2026-09-11 |
| `.claude/skills/type-scale/SKILL.md` | skill | 16180 | 2026-09-02 |
| `.claude/skills/ultimate-tokens-brand-voice/SKILL.md` | skill | 5256 | 2026-08-14 |
| `.claude/hooks/git-precommit-privatedocs-guard.mjs` | hook | 3389 | 2026-07-31 |
| `.claude/ops/plan.md` | ops | 7274 | 2026-07-29 |
| `.claude/ops/held-items.md` | ops | 381 | 2026-07-25 |
| `.claude/ops/friendlies.json` | ops | 1795 | 2026-07-25 |
| `.claude/ops/watch-checkpoint.json` | ops | 234 | 2026-07-25 |
| `.claude/docs/reports/reactivity-2026-08-20/` | dir | 61901 | 2026-08-20 |
| `.claude/overhaul-plan-2026-08-14.md` | file | 6914 | 2026-08-14 |
| `.claude/naming.manifest.json` | file | 2352 | 2026-08-14 |

Also tracked: 3 files under `.claude/ops/reports/` (7 ops files tracked in total). Untracked: `.claude/docs/other/` (~1.7 MB: output-examples/, type revision JSONs, working notes, font primitives); `.claude/ops/` transient state (session-identity, dispatch-heartbeats, review-queue, conductor-state, lanes). Note: `.gitignore` lists `.claude/ops/` yet 7 ops files are tracked.

## Docs

| location | kind | count | newest commit |
|---|---|---|---|
| `README.md` | root | 1 | 2026-09-12 |
| `CHANGELOG.md` | root | 1 | 2026-09-12 |
| `docs/reference` | reference | 51 (4 top-level; colors/ 3, colors/categories/ 8, data/ 6, geometry/ 2, references/ 14, reviews/ 6, rubrics/ 4, typography/ 4) | 2026-09-12 |
| `docs/marketing` | marketing | 3 | 2026-09-12 |
| `docs/tickets` | ticket archive | 31 | 2026-07-17 |
| `docs/site` | site specs | 5 | 2026-09-11 |
| `docs/lld` | LLD | 2 | 2026-09-13 |
| `docs/plan` | plans | 2 | 2026-09-12 |
| `docs/spec` | spec | 2 | 2026-09-12 |
| `docs/img` | images | 1 | 2026-09-11 |
| `docs/brand-assets` | assets | 1 | 2026-07-12 |

SPEC-type files: 7 (2 in docs/spec, 4 in docs/site, 1 `docs/reference/spec-draft.md`). ADRs: 22 (`## ADR-001` through `## ADR-022`) as sections of one file, `docs/reference/references/decision-records.md`; no per-ADR files.

## Authorship

Last 50 commits on `sdlc/adopt`.

| signal | count |
|---|---|
| Claude/Anthropic Co-Authored-By trailer | 21 |
| other Co-Authored-By | 0 |
| bot author or 🤖 body | 0 |
| no agent signal | 29 |
| subject ends `(#NNN)` (squash-merge) | 48 |
| merge commits | 0 |
| neither | 2 |

| author | commits |
|---|---|
| Kim Granlund | 50 |

| prefix | count |
|---|---|
| feat | 13 |
| docs | 10 |
| fix | 7 |
| gen-categories | 3 |
| Add | 2 |

## Hygiene

| item | value |
|---|---|
| .env* files | none present, none tracked |
| secrets patterns (`sk-`, `AKIA`, `ghp_`) | 0 files |
| `api_key =` / `token =` | 12 files, scout reports all as prose or variable names |
| largest tracked | `figma/plugin/ui.html` 3.6 MB (generated), `src/ui/describe-mcp-assets.js` 681 KB, `test/ui/headless-boot.mjs` 274 KB, `docs/reference/colors/categories/travel.json` 252 KB, `src/ui/categories/travel.js` 235 KB, `src/ui/type-fonts.js` 229 KB |
| `dist/` | ignored |
| `smoke-out/` | ignored |
| `figma/plugin/ui.html` | tracked, generated |
| `src/ui/mcp-assets.js`, `src/ui/type-fonts.js`, `src/ui/categories/*.js` | tracked, generated |
| `.gitignore` | node_modules, dist/, _site/, smoke-out/, .DS_Store, .git-worktrees/, test/plugin/.hosted-pack-scratch/, .claude/ops/ |
| `.git/info/exclude` | .claude/docs/other/ plus claude-code runtime state globs (scheduled_tasks, routines/.state, worktrees, checkpoints, mailbox, agent-registry.json, agent-memory-local, first-run, assistant-daemon-state.json) |

## Claims to verify

| id | claim | source | how to check |
|---|---|---|---|
| C1 | `npm test` runs without `node_modules` and exits 0 on HEAD | CLAUDE.md, package.json | run it in a checkout without node_modules |
| C2 | `npm run build` needs `node_modules` and exits 0 on HEAD | CLAUDE.md | `npm ci && npm run build` |
| C3 | `npm run smoke` boots headless Chrome and exits 0 on HEAD | CLAUDE.md, ci.yml | run it; requires Chrome |
| C4 | CI `build-test` job is green on latest `main` | ci.yml | `gh run list --branch main --workflow ci.yml -L 1` |
| C5 | main has no branch protection | branches scout | `gh api repos/{owner}/{repo}/branches/main/protection` |
| C6 | PRs land by squash-merge (48/50 subjects carry `(#NNN)`) | authorship scout | `git log -50 --format=%s` |
| C7 | `.claude/CLAUDE.md` and root `CLAUDE.md` are identical (both 7056 bytes) | harness scout | `diff` |
| C8 | `.gitignore` ignores `.claude/ops/` while 4 ops files are tracked | harness + hygiene scouts | `git ls-files .claude/ops` |
| C9 | `docs/reference` holds 5 files (docs scout) vs many `docs/reference/colors/categories/*.json` (hygiene scout lists 4) | docs + hygiene scouts | `git ls-files docs/reference \| wc -l` |
| C10 | No ADR files exist although CLAUDE.md cites ADR-017 | docs scout | grep `ADR-017` across repo |
| C11 | The 3 agents, 14 skills, 1 hook listed are the complete `.claude/` harness | harness scout | `git ls-files .claude` |
| C12 | `test/run.mjs` is the sole test entrypoint; 47 test .mjs files | tests scout | `find test -name '*.mjs' \| wc -l` |
| C13 | Generated files `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/type-fonts.js`, `src/ui/categories/*.js` are byte-identical after `npm test` regenerates them on HEAD | CLAUDE.md "regenerates committed assets" | `npm test && git status --short` |
| C14 | No secrets in tracked files | hygiene scout | rerun the greps |
