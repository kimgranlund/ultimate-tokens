---
kind: review
plan: adopt-hygiene
unit: U2
pass: 2
diff: b885e67..unit/hygiene-U2 (head 0ad0faa); pass 2 delta 04b93f0..0ad0faa
reviewer: reviewer (fresh context)
date: 2026-09-16
verdict: 🟢 pass
---

# U2 review, pass 2: harness, config, ignores, workflows, CLAUDE.md

Fresh-context review against `.sdlc/plans/adopt-hygiene.md` §U2 (rows 3 and 9 as revised), plan-level P1 to P5, the pass 1 verdict `.sdlc/verdicts/adopt-hygiene-U2.md`, and the re-diagnosis `.sdlc/plans/adopt-hygiene-U2-p2.md`. Every command below was run by me in `.worktrees/hygiene-U2`. Each plant was restored (`git checkout` or `rm`), and `git status --short` was `0` at the end. The pass 1 review that used to be in this file (🟢 at 04b93f0) is superseded: it missed both gaps the verifier found.

## Pass 1 gaps

| Gap | State | Evidence |
|---|---|---|
| 🔴 row 9: `secrets` in a step-level `if:` | 🟢 closed | the secret moved to job-level `env:`, and a run step does `[ -z "$ANTHROPIC_API_KEY" ] && exit 1`. `actionlint` exit 0. The eval step reads the job env |
| 🟡 row 3: CLAUDE.md named `<foreignObject>` | 🟢 closed | the line now names `h("div", { class: "an-svg", html: svg })` → `innerHTML`, which is true at `src/ui/app-helpers.mjs:313` |

## Criteria (17/17 pass)

| # | Criterion | State | Result | Negative control |
|---|---|---|---|---|
| 1 | `## SDLC` between Shipping and Always, equals adapter §7 | 🟢 | Shipping, SDLC, Always; `same` | one word changed in a scratch copy: `differs`; origin/main `## SDLC` count 0 |
| 2 | `gen:adia-exports` listed, "run the first three" gone | 🟢 | 1, 0 | origin/main 0, 1 |
| 3 | `html:` exception with live count and a real mechanism (revised) | 🟢 | 1, 12, 1, 0; `git grep -c innerHTML -- src/ui` finds 2 files, `foreignObject` 0 | a 13th `html:` planted in `color.js`: sum 13; origin/main first count 0 |
| 4 | shipping-changes: stale hook and model claims gone, adapter pointer present | 🟢 | 0, 1, 1 | origin/main 3, 0, 0 |
| 5 | four ignore rules | 🟢 | 4 | origin/main `.gitignore` has none of the four patterns (grep 0) |
| 6 | branding gate skips `.worktrees/` | 🟢 | 1, `branding: clean (395 files scanned)` | origin/main `branding.mjs` over the same probe: FAIL |
| 7 | `.gitattributes` covers the K9 set | 🟢 | 0 | origin/main has no `.gitattributes` |
| 8 | `pages.yml` Node 22, `npm ci` | 🟢 | 1, 0, 1 | origin/main 0, 1, 0 |
| 9 | describe-eval fails loudly on an absent key, in a form GitHub accepts (revised) | 🟢 | `exit 0`, 1, 0, `yaml ok`, 0, 0 | step-level `if: ${{ secrets... }}` planted in a scratch copy: actionlint `context "secrets" is not allowed here`, exit 1, while ruby still printed `yaml ok`. A broken indent: ruby raises. Guard with an empty key exits 1, with a set key exits 0. origin/main: `exit 1` count 0, `stays green` 1 |
| 10 | `workflow.json` canonical and squash | 🟢 | `.sdlc/adapter.md squash` | origin/main `undefined squash` |
| 11 | `.sdlc/config.json` preset accepted | 🟢 | `github main kimgranlund/ultimate-tokens false`; `adapter.py config` preset github, exit 0 | scratch copy with `github.token`: `tokens belong to gh auth, never .sdlc/config.json`, exit 2 |
| 12 | `npm ci` then `npm run build` | 🟢 | ci exit 0; build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`; status 0 | not re-planted this pass (pass 1 verifier: TS2322, exit 2). Pass 2 touches no build input |
| P1 | `npm test` green, tree byte-stable | 🟢 | `✓ all 44 test files passed`, exit 0; status 0 | not re-planted (the verifier's pass 1 control stands; pass 2 touches no gate input) |
| P2 | private folder and `node_modules` untracked | 🟢 | 0 | origin/main `.claude/ops/` ls-tree 7 |
| P3 | scope wall | 🟢 | 0; without the branding exclusion 2 | `// probe` planted in `src/engine/motion.mjs`: 2 |
| P4 | branding clean | 🟢 | `clean (395 files scanned)` in the unit worktree | `docs/x.md` copy of the records file: FAIL |
| P5 | no rewritten record | 🟢 | 0 | U2 does not touch the file; control inherited (U3 verdict) |

## Beyond the criteria

- Scope: the full diff has 10 files. Each one is named in the plan's U2 file list, plus the handoff. Pass 2 touches three: `CLAUDE.md` (one line reworded, not a fourth edit under C9), `describe-eval.yml`, and the handoff. `.claude/settings.json` is not in the diff. Under the walled dirs, only the `SKIP_DIRS` line in `test/repo/branding.mjs` changed.
- Handoff: `.sdlc/handoffs/adopt-hygiene-U2.md` was updated for pass 2 (a new top table, with pass 1 kept below and marked superseded), so it is not stale. Its `app-helpers.mjs:313` citation is correct.
- Commit trailer on 0ad0faa is `Co-Authored-By: Claude Opus 5 (1M context)`, the form the harness asks for.

## Findings

| Severity | Finding | Where |
|---|---|---|
| Blocking | none | |
| 🟡 minor | Job-level `env:` puts `ANTHROPIC_API_KEY` in the environment of every step, including `npm ci`, so any dependency's install script can read it. `package.json` has no `postinstall` of its own. `secrets` is also allowed in a step-level `env:` (only a step `if:` rejects it). A tighter shape would set `env: ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` on just the guard step and the eval step. The re-diagnosis prescribed the job-level form, so this is a follow-up, not a builder error | `.github/workflows/describe-eval.yml:21-22` |
| ⚪ nit | CLAUDE.md shows the call as `{ class: "an-svg", html: svg }`, but 2 of the 12 carry an extra class (`an-svg hw`, `an-svg newpal-hc`). The mechanism is still accurate | `src/ui/sections/color.js:250,647` |

## Verdict

🟢 **Pass.** Both pass 1 gaps are closed. All 12 U2 rows and P1 to P5 hold on my own runs, including actionlint and the negative controls. The scope wall holds. There are 0 blocking findings, 1 minor (secret scope, follow-up), and 1 nit.
