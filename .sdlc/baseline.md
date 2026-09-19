---
kind: baseline
repo: ultimate-tokens
ran: 2026-09-19
ref: origin/main @ d814500
host: local macOS, Node 22, local Chrome for smoke; load 8.91 6.03 5.77 on 10 cores at run start
supersedes: the 2026-09-16 baseline (git show 180eca0:.sdlc/baseline.md)
---

# Baseline

Each command run three times in sequence in the unit worktree at the rebased plan head (`plan/records-refresh` @ d44c857c), whose tree equals `ref` outside `.sdlc/` and `.gitignore` (U1-1 proves it). `npm test` ran with no `node_modules` present; build and smoke after one `npm ci` (exit 0, 0.68 s, cold cache in this worktree).

## Pass

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` | 3/3 | 0 | 108.96 · 93.81 · 90.72 | all 47 test files passed |
| `npm run build` | 3/3 | 0 | 2.96 · 1.87 · 2.48 | wrote figma/plugin/ui.html 3777.8 KB |
| `npm run smoke` | 3/3 | 0 | 19.96 · 20.23 · 20.45 | SMOKE PASS: gallery · category · editor · export dialog render in real Chrome |

`git status --short` empty after every run: every committed asset that `npm test` and `npm run build` regenerate is byte-stable at this head. `src/ui/type-fonts.js` is not in that set. Neither chain runs `gen:type-fonts`, so a clean status says nothing about that file (survey verdict C11 of 2026-09-18, debt G1).

## Fail

None.

## Flaky

None observed in three runs each.

## Lint

No `lint` script in `package.json`. `tsc` runs inside `npm run build` (strict unused-locals/params) and is the only static check. Undetermined: no ESLint/Prettier config found by the survey.

## Not run here

`scripts/smoke-panda.mjs` and `mcp/describe-eval-runner.mjs` (CI-only jobs); CI run 35446265780 on d814500 reports both build-test and panda-smoke green (survey verdict C4).
