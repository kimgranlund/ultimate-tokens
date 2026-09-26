# Verdict adopt-hygiene U2 · 🟢
verdict: 🟢

Graded by sdlc-verifier on 2026-09-16, pass 2. Branch `unit/hygiene-U2` @ 0ad0faa, worktree `.worktrees/hygiene-U2`. I used the criteria from `.sdlc/plans/adopt-hygiene.md` §U2 (rows 3 and 9 revised) plus P1 to P5. The Orchestrator asked for grade L3, but this seat has no Agent tool to dispatch a `verifier-l3` worker, so this seat (L1) ran every command itself. Pre-land still requires a fresh `verifier-l3`. Negative controls ran against `origin/main`, in mktemp scratch dirs, or as edits in the worktree that I reverted. The tree was back to 0 dirty paths afterwards. I did not use the handoff or the review as evidence.
Tally: 17 criteria. 🟢 16 · 🟡 1 · 🔴 0. The unit's diff against base `b885e67` touches exactly the plan's file set (10 files). CLAUDE.md has 3 hunks, which matches the C9 limit of three edits.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U2-1 | `## SDLC` between Shipping and Always, equals adapter §7 | 🟢 | headings Shipping, SDLC, Always; `same` | `origin/main` `## SDLC` count 0; one word altered in a /tmp copy of CLAUDE.md: diff differs |
| U2-2 | Commands lists `gen:adia-exports`, drops "the first three" | 🟢 | 1, 0 | `origin/main`: 0, 1 |
| U2-3 | `html:` exception with live count, true mechanism | 🟢 | 1, 12, 1, 0. In `src/ui`: `innerHTML` present (`app-helpers.mjs` `else if (k === "html") el.innerHTML = v`), `foreignObject` absent. The 12 hits are color.js 6, geometry.js 3, typography.js 3, all `h("div", { class: "an-svg…", html: svg })` (2 carry an extra class) | `origin/main` first count 0; a 13th `html:` appended to geometry.js: sum 13; restored |
| U2-4 | shipping-changes: no "no hooks"/model pin, has hooksPath + adapter | 🟢 | 0, 1, 1 | `origin/main`: 3, 0, 0 |
| U2-5 | four ignore rules | 🟢 | 4 | scratch repo with `origin/main` `.gitignore`: 0; same repo with the unit's `.gitignore`: 4 |
| U2-6 | branding gate skips `.worktrees/` | 🟢 | `"\.worktrees"` 1; planted `.worktrees/zz/x.md` copy: `branding: clean (395 files scanned)`; removed | `origin/main` `branding.mjs` in place with the same plant: 3 hits on `worktrees/zz`; restored. Diff to `branding.mjs` is the one SKIP_DIRS line |
| U2-7 | `.gitattributes` generated set | 🟢 | 34 attribute lines, 0 off-expectation | `check-attr --source=origin/main`: 34. A tree whose `.gitattributes` drops the radix line: 2. Moving the file aside does not work as a control: check-attr then falls back to the index and still printed 0 |
| U2-8 | pages.yml Node 22, `npm ci` | 🟢 | 1, 0, 1 | `origin/main`: 0, 1, 0 |
| U2-9 | describe-eval fails without the key | 🟡 | `actionlint` no output, exit 0; `exit 1` 1; `stays green` 0; `yaml ok`; `mcp/` diff 0; step-level `if: ${{ secrets` 0. The guard script, pulled from the file: empty key exits 1 with the `::error::` line, set key exits 0. Concern: the key is set in job-level `env`, so every step receives it, including `npm ci`, where dependency install scripts can read it. The key only needs to reach the guard step and the eval step | step-level `if: ${{ secrets.ANTHROPIC_API_KEY == '' }}` inserted in a scratch copy: actionlint `context "secrets" is not allowed here`, exit 1. Broken `runs-on` indent: ruby raises |
| U2-10 | workflow.json canonical + squash | 🟢 | `.sdlc/adapter.md squash` | `origin/main`: `undefined squash` |
| U2-11 | `.sdlc/config.json` preset accepted | 🟢 | `github main kimgranlund/ultimate-tokens false`; `adapter.py config` JSON preset `github`, exit 0 | scratch repo, config plus `github.token`: `{"error": "tokens belong to gh auth, never .sdlc/config.json"}` exit 2; scratch repo with no config: preset `local` |
| U2-12 | `npm run build` green | 🟢 | `npm ci` exit 0; build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`; status 0 | `const zz: number = "x";` appended to `src/main.ts`: TS2322, build exit 2; restored, status 0 |
| P1 | `npm test` green, tree stable | 🟢 | `✓ all 44 test files passed`; status 0 | role-table `"scrim` to `"scrimX`: FAIL 3; restored, re-run green, status 0 |
| P2 | private folder + node_modules untracked | 🟢 | 0 (`node_modules` installed, still untracked) | `origin/main` `.claude/ops/` tree grep 7 (U1 run, same shape) |
| P3 | scope wall | 🟢 | 0; without the `branding.mjs` exclusion: 2 | `// probe` appended to `src/engine/motion.mjs`: 2; restored |
| P4 | branding gate clean | 🟢 | `branding: clean (395 files scanned)`, exit 0 | `docs/x.md` copy of decision-records: FAIL 1; removed |
| P5 | no rewritten record | 🟢 | 0 | line 1 of decision-records.md deleted: 1; restored |

## Concern for the next owner

- U2-9 (non-blocking): the eval key is exposed at job level, so `checkout`, `setup-node`, and `npm ci` also receive it. Scoping it is the Orchestrator's call; this criterion does not require it.
