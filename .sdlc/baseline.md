---
kind: baseline
repo: ultimate-tokens
ran: 2026-09-16
ref: origin/main @ 7faf3aa
host: local macOS, runs under Node 22; toolchain now Node 24 (#706), rerun tracked in #691 U1, local Chrome for smoke
---

# Baseline

Each command run three times in sequence in a detached scratch worktree of `origin/main` (7faf3aa). `npm test` ran with no `node_modules` present; build and smoke after one `npm ci` (exit 0, 1 s, warm npm cache).

## Pass

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` | 3/3 | 0 | 58.4 · 62.4 · 60.8 | all 44 test files passed |
| `npm run build` | 3/3 | 0 | 3.71 · 2.35 · 3.43 | wrote figma/plugin/ui.html 3695.6 KB |
| `npm run smoke` | 3/3 | 0 | 21.34 · 21.79 · 21.53 | SMOKE PASS: gallery · category · editor · export dialog render in real Chrome |

`git status --short` empty after every run: the regenerated committed assets are byte-stable on main.

## Fail

None.

## Flaky

None observed in three runs each.

## Lint

No `lint` script in `package.json`. `tsc` runs inside `npm run build` (strict unused-locals/params) and is the only static check. Undetermined: no ESLint/Prettier config found by the survey.

## Not run here

`scripts/smoke-panda.mjs` and `mcp/describe-eval-runner.mjs` (CI-only jobs); CI run 34804556354 on 7faf3aa reports both build-test and panda-smoke green (survey verdict C4).
