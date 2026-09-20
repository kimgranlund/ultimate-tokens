---
kind: baseline
repo: ultimate-tokens
ran: 2026-09-19
ref: origin/main @ 20298cc
host: local macOS, Node 24.18, local Chrome for smoke; load 3.97 3.87 4.58 on 10 cores at run start (the test timings' own set, the uncontaminated rerun)
extended: 2026-09-19, rows corpus-contrast and fonts, host load 3.97 4.39 4.80 to 6.16 4.94 4.97 on 10 cores across the six runs
supersedes: the 2026-09-19 baseline at d814500 (kept below as the prior set) and the 2026-09-16 baseline (git show 180eca0:.sdlc/baseline.md)
---

# Baseline

Each command run three times in sequence in the U3 unit worktree of plan records-refresh, whose tree equals `ref` outside `.sdlc/` and `.gitignore` (U1-1 proves it). `npm test` ran with no `node_modules` present; build and smoke after one `npm ci` (exit 0, 17.74 s; resolves typescript 7.0.2 and vite 8.3.0, `npm ls --depth=0`).

## Pass

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` | 3/3 | 0 | 56.27 · 56.43 · 59.83 | all 48 test files passed |
| `npm run build` | 3/3 | 0 | 3.06 · 1.34 · 1.36 | wrote figma/plugin/ui.html 3780.5 KB |
| `npm run smoke` | 3/3 | 0 | 18.20 · 18.28 · 18.25 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` |
| `npm run gate:corpus-contrast` | 3/3 | 0 | 20.12 · 22.89 · 22.29 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` |
| `npm run gen:type-fonts` | 3/3 | 0 | 0.77 · 0.78 · 0.70 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` |

The corpus-contrast gate's own counts, as it printed them on run 5 of the set above, one list item per line of output:

- `  (343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)`
- `  (perceptual   7560 cells, 0 under 4.5, worst 4.502:1 at nature "47° N · April · 10:00 · Hoh Rain Forest, Olympic Peninsula, Washington" neutral/light)`
- `  (peak         7560 cells, 0 under 4.5, worst 4.504:1 at architecture "Bauhaus Dessau · 1926 · Walter Gropius" neutral/light)`
- `  (even         7560 cells, 0 under 4.5, worst 4.505:1 at brands "BZZR · The product's own design system" tertiary/dark)`

`git status --short` empty after every run: every committed asset that `npm test` and `npm run build` regenerate is byte-stable at this head. `src/ui/type-fonts.js` is not in that set. Neither chain runs `gen:type-fonts`, so a clean status says nothing about that file (survey verdict C11 of 2026-09-18, debt G1).

## Fail

None.

## Flaky

None observed in three runs each.

## Lint

No `lint` script in `package.json`. `tsc` runs inside `npm run build` (strict unused-locals/params) and is the only static check. Undetermined: no ESLint/Prettier config found by the survey.

## Not run here

`scripts/smoke-panda.mjs` and `mcp/describe-eval-runner.mjs` (CI-only jobs); CI run 35455937943 on 20298cc reports four jobs, all `success`: `build-test`, `corpus-contrast`, `deploy`, `panda-smoke`.

## Prior set (d814500, superseded 2026-09-19)

The figures of the 2026-09-19 run at `origin/main @ d814500` (U1 of plan records-refresh; load 3.13 6.16 6.24 on 10 cores at run start; CI run 35446265780 green on d814500). Kept because the seven commits of `d814500..20298cc` changed what the live table describes: #706 moved the toolchain (TypeScript 6 to 7, vite 8.0 to 8.3, Node 24 in CI) and #699 (PR #702, 9a44f685) added one test file to `TESTS`. They changed the toolchain the live table describes, so these are history to compare against, not a range to grade against. The rows are headed differently from the live table on purpose: `baseline-agrees-check.sh` reads the first row that starts with the live head.

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` (prior, d814500) | 3/3 | 0 | 63.54 · 65.90 · 59.17 | all 47 test files passed |
| `npm run build` (prior, d814500) | 3/3 | 0 | 2.96 · 1.87 · 2.48 | wrote figma/plugin/ui.html 3777.8 KB |
| `npm run smoke` (prior, d814500) | 3/3 | 0 | 19.96 · 20.23 · 20.45 | SMOKE PASS |
