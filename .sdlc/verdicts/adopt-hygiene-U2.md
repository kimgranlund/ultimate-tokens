# Verdict adopt-hygiene U2 · 🔴

Graded by sdlc-verifier on 2026-09-16. Branch `unit/hygiene-U2` @ 04b93f0, worktree `.worktrees/hygiene-U2`. Every command run by me; build and mutation controls in throwaway worktrees (removed). The handoff's `Ran` row and the 🟢 review were not used as evidence.
Tally: 17 criteria. 🟢 15 · 🟡 1 · 🔴 1.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | `## SDLC` between Shipping and Always, equals adapter §7 | 🟢 | headings in order Shipping, SDLC, Always; diff prints `same` | one word changed in a temp copy: diff differs |
| 2 | Commands line lists `gen:adia-exports`, drops "the first three" | 🟢 | 1, 0 | origin/main 0, 1 (A7 plan review) |
| 3 | `html:` exception ratified with its live count | 🟡 | CLAUDE.md line 66 states 12; live sum 12. Concern: the ratified text misstates the mechanism. It says the files "embed inline `<foreignObject>` markup (`html:` attribute namespace)", but `foreignObject` appears 0 times in `src/ui`. `html:` is the `h()` attribute that sets `el.innerHTML` (`app-helpers.mjs:313`) on a `div.an-svg` holding an SVG string (`color.js:61,89`). A wrong fact in CLAUDE.md is stale context | origin/main count 0; a 13th attribute makes the sum 13 ≠ 12 |
| 4 | shipping-changes: no "no hooks" claim, no model pin, points at adapter §2.1 | 🟢 | 0, 1, 1 | origin/main 3, 0, 0 |
| 5 | four ignore rules | 🟢 | 4 | origin/main 0 |
| 6 | branding gate skips `.worktrees/` | 🟢 | `".worktrees"` 1 (one-line `SKIP_DIRS` change, nothing else in the file); probe `branding: clean (395 files scanned)` | same probe on origin/main: FAIL 3 (A7 plan review) |
| 7 | `.gitattributes` marks the K9 set generated and `-diff` | 🟢 | count 0 over 9 path groups; file lists exactly those 9 | origin/main: every line `unspecified` (28 for the first six groups) |
| 8 | pages.yml Node 22 + `npm ci` | 🟢 | 1, 0, 1; actionlint clean on pages.yml | origin/main 0, 1, 0 |
| 9 | scheduled describe-eval fails when the key is absent | 🔴 | the plan's literal checks pass (`exit 1` 1, `stays green` 0, `yaml ok`, mcp diff 0), but the new step is not a valid workflow. `actionlint`: `describe-eval.yml:27:17: context "secrets" is not allowed here. available contexts are "env", "github", "inputs", "job", "matrix", "needs", "runner", "steps", "strategy", "vars"`. The step is `if: ${{ secrets.ANTHROPIC_API_KEY == '' }}`, and GitHub rejects `secrets` in a step `if:`. So the file errors at load rather than failing loudly by design, and it stays broken after the key is added. A YAML parse cannot catch this; the plan's check was too weak | origin/main `describe-eval.yml` + `pages.yml`: actionlint exit 0, so the lint reports only this change |
| 10 | workflow.json canonical = adapter, squash kept | 🟢 | `.sdlc/adapter.md squash` | origin/main `undefined squash` |
| 11 | `.sdlc/config.json` preset accepted | 🟢 | `github main kimgranlund/ultimate-tokens false`; `adapter.py config` preset github, exit 0 | planted `token`: error "tokens belong to gh auth", exit 2 (A7 plan review) |
| 12 | `npm run build` green | 🟢 | scratch worktree of the branch: `npm ci` exit 0, build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`, status 0 | `const zz: number = "x";` appended to `src/main.ts`: build exit 2, `TS2322` |
| P1 | `npm test` green, tree stable | 🟢 | `✓ all 44 test files passed`; status 0 (in the U2 worktree) | role-table corruption fails semantic.mjs (A7 plan review) |
| P2 | private + node_modules untracked | 🟢 | 0 | origin/main ls-tree `.claude/ops` 7 |
| P3 | scope wall | 🟢 | 0 (only `test/repo/branding.mjs`, excluded, changed under the walled dirs) | planted `src/` edit: 2 (U3 verdict) |
| P4 | branding clean | 🟢 | `clean (395 files scanned)` | copy under `docs/`: FAIL 3 |
| P5 | no rewritten record | 🟢 | 0 | removed heading line: 1 (U3 verdict) |

## Gaps for the next pass

| Gap | Where |
|---|---|
| step-level `if:` cannot read `secrets`; the workflow must fail on an absent key in a form GitHub accepts, and the check should add `actionlint .github/workflows/describe-eval.yml` exit 0 | criterion 9, `.github/workflows/describe-eval.yml:27` |
| the `html:` convention line names a mechanism (`<foreignObject>`) the code does not use | criterion 3, `.claude/CLAUDE.md:66-67` |
