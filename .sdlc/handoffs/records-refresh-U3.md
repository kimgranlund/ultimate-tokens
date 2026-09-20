---
kind: handoff
plan: records-refresh
unit: U3
branch: unit/rr-U3
written: 2026-09-19
---

# Handoff U3 records-refresh · builder -> reviewer

measured at 20298cc

| Field | Value |
|---|---|
| Branch | unit/rr-U3 @ aa416f6 (partial commit), this commit completes it |
| Worktree | .worktrees/rr-U3 |
| Files | .sdlc/baseline.md, .sdlc/adapter.md, .sdlc/architecture.md, this handoff |

## Step 1: head and rebase check

`git merge-base origin/main HEAD | cut -c1-7` printed `20298cc`. `git diff --stat 20298cc origin/main -- . ':!.sdlc' | wc -l` printed `0`: the head has not moved outside `.sdlc/` since. Proceeded.

## Step 2: quiet host, before the run sequence

`uptime`: load averages 3.97 3.87 4.58 on 10 cores, well under the core count, immediately before run 1. `pgrep -fl 'test/run.mjs|vite build|smoke.mjs'` printed nothing (no other seat's gate in flight). `node --version`: v24.18.0. After step 4's `npm ci`, `npm ls typescript vite --depth=0` printed:

```
ultimate-tokens@1.2.0 /Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/rr-U3
├── typescript@7.0.2
└── vite@8.3.0
```

The coordinator's own window check (load 2.87 3.81 4.63, no matching processes) landed mid-sequence, confirming the same quiet window this handoff already recorded. Discipline note: every run below was preceded by its own fresh `pgrep`/`uptime` check, run by run, not just once at the start. One brief high reading occurred after smoke run 2 (load 7.86 after, still well under the 10-core threshold; `pgrep` printed nothing and `ps aux` showed no `test/run.mjs`/`vite build`/`smoke.mjs`, only unrelated Claude Code session processes on this shared host); the run itself started and finished clean, so it was kept rather than redone, and nothing after it needed a redo either (all loads stayed under threshold).

## Steps 3-4: the nine runs, one `npm ci`, three commands x three

`npm ci`: exit 0, 17.74 s.

| # | command | load (1 min) before | load (1 min) after | pgrep before | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|
| 1 | `npm test` | 3.97 | 2.82 | none | 0 | 56.27 | ✓ all 48 test files passed | 0 |
| 2 | `npm test` | 2.54 | 3.49 | none | 0 | 56.43 | ✓ all 48 test files passed | 0 |
| 3 | `npm test` | 3.49 | 5.39 | none | 0 | 59.83 | ✓ all 48 test files passed | 0 |
| 4 | `npm run build` | 4.12 | 4.03 | none | 0 | 3.06 | wrote figma/plugin/ui.html 3780.5 KB | 0 |
| 5 | `npm run build` | 3.79 | 3.56 | none | 0 | 1.34 | wrote figma/plugin/ui.html 3780.5 KB | 0 |
| 6 | `npm run build` | 3.52 | 3.48 | none | 0 | 1.36 | wrote figma/plugin/ui.html 3780.5 KB | 0 |
| 7 | `npm run smoke` | 3.28 | 4.25 | none | 0 | 18.20 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` | 0 |
| 8 | `npm run smoke` | 4.71 | 7.86 | none | 0 | 18.28 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` | 0 |
| 9 | `npm run smoke` | 6.41 | 5.83 | none | 0 | 18.25 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` | 0 |

No run was dropped or retried; no run started at or above the 10-core threshold; every run's `git status --short` was empty after; every `npm test` run's last line reads `all 48 test files passed`.

## Step 6: CI on 20298cc

`gh run list --branch main --workflow ci.yml --limit 5 --json databaseId,headSha,conclusion` includes `{"conclusion":"success","databaseId":35455937943,"headSha":"20298cca..."}`. `gh run view 35455937943 --json headSha,jobs --jq '...'` printed `20298cc panda-smoke=success build-test=success`.

## Step 7: baseline and adapter rewrite

`.sdlc/baseline.md` rewritten per §Texts: `ref: origin/main @ 20298cc`, the nine new timings, `all 48 test files passed`, `wrote figma/plugin/ui.html 3780.5 KB`, `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`, `CI run 35455937943 on 20298cc`; the `d814500` figures moved to the appended `## Prior set (d814500, superseded 2026-09-19)` section, headed differently on purpose (the check script reads the first row with the live head). `.sdlc/adapter.md` §1's three Time cells re-derived from the new ranges: test 56 to 60 s (was 59 to 66), build 1 to 3 s (was 2 to 3), smoke 18 to 18 s (was 20 to 20). `sh .sdlc/checks/baseline-agrees-check.sh` now prints seven `ok` lines and `stale total: 0`, exit 0.

## Step 9: the 56 §8 rows re-checked at 20298cc

56 rows, all re-read against the current tree. 15 rows cite a path that changed in `d814500..20298cc` (marked `y` below; the mechanical count is 15 at this head, one more than the planner's lead of 14 at `d46ae48a`, because DD33's own row gains a `test/gate-report.mjs` citation in this pass' correction below, and that path is itself in the changed set). No row's category (`holds`/`drifted`/`undetermined`) flipped. Four rows needed a content correction beyond the sha swap, all made in `architecture.md` in place:

- **DD9**: the baseline's `npm test` timing range moved from 59-66 s to 56-60 s; the row's approximation sentence rewritten with the new figures.
- **DD19**: `ls test/` is 9 entries, not 8: `test/gate-report.mjs` (added by #699, `9a44f68`) was missing from the row's own evidence cell. Corrected to 9 entries; omitted count corrected from "four of the eight" to "five of the nine".
- **DD33**: the same `test/gate-report.mjs` gap on the `.claude/CLAUDE.md` side of the same claim. Named count stays 6, denominator corrected 8 to 9, missing set now names `repo/` and `gate-report.mjs`.
- **DD51**: `test/engine/categories.mjs`'s cited `FAIL("curve", ...)` line moved from 307 to 308: #706 added one `import { gateReport } from "../gate-report.mjs";` line above it in that file (confirmed by `git diff d814500 20298cc -- test/engine/categories.mjs`); corrected in place. The claim itself (the assert compares a generated preset's `lmin`/`lmax` against the spec's expected values) still holds.

The other 52 rows read the same at `20298cc` as U2 recorded at `d814500`: their cited paths are either outside the `d814500..20298cc` diff, or (for the 11 remaining y-marked rows) the diff touched the file but not the cited line, constant, or claim under test; each confirmed by direct read at `20298cc`, quoted in the table below.

| DD | cited paths | changed in d814500..20298cc | own result at 20298cc | state before | state after |
|---|---|---|---|---|---|
| DD1 | .claude/CLAUDE.md, package.json | y | own read: package.json:27 (build) and :29 (test) unmoved; neither runs gen:type-fonts at 20298cc | holds | holds |
| DD2 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD3 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD4 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD5 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD6 | README.md, src/engine/exports.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD7 | README.md, docs/reference/data/role-table.json | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD8 | .claude/CLAUDE.md, src/ui/overlays/drawer.js, exports.js, src/ui/model.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD9 | .claude/CLAUDE.md, .sdlc/baseline.md | y | own read: baseline.md npm test row now 56.27 · 56.43 · 59.83 (56 to 60 s); ~60s still a reasonable approximation | holds | holds |
| DD10 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD11 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD12 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD13 | README.md, src/ui/model.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD14 | README.md, src/engine/tonal.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD15 | README.md, src/ui/categories/index.js, src/ui/app.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD16 | README.md, src/ui/categories/architecture.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD17 | README.md, src/ui/overlays/drawer.js, src/engine/ds-export.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD18 | README.md, src/engine/type.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD19 | README.md, test/gate-report.mjs, test/run.mjs | y | own read: `ls test/` is 9 entries incl. test/gate-report.mjs (#699, missed by the prior row); omitted count corrected 4-of-8 to 5-of-9 | drifted | drifted |
| DD20 | README.md, src/engine/geometry.mjs, src/engine/type.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD21 | README.md, .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD22 | README.md, scripts/gen-adia-derived-exports.mjs, scripts/gen-mcp-assets.mjs, scripts/gen-type-fonts.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD23 | README.md, src/engine/derive.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD24 | README.md, src/engine/prime.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD25 | README.md, src/engine/geometry.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD26 | README.md, mcp/brand-kit-server.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD27 | README.md, src/ui/app-helpers.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD28 | README.md, package.json, vite.config.js | y | own read: package.json:16 `dev: vite` unmoved; no server.port override in vite.config.js | holds | holds |
| DD29 | README.md, dist/ultimate-tokens.html, scripts/bundle.mjs, scripts/gen-figma-ui.mjs, figma/plugin/ui.html | y | own read: K7 rerun (bundle.mjs writes dist/ultimate-tokens.html) and K9 rerun (gen-figma-ui.mjs writes figma/plugin/ui.html) both green at 20298cc | holds | holds |
| DD30 | README.md, .github/workflows/ci.yml | y | own read: .github/workflows/ci.yml still carries the badge target; git remote unchanged | holds | holds |
| DD31 | .claude/CLAUDE.md, package.json | y | own read: package.json build script still chains tsc && vite build; test script still does not | holds | holds |
| DD32 | .claude/CLAUDE.md, exports.js, src/engine/ds-export.js, ds-export.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD33 | .claude/CLAUDE.md, ui/headless-boot.mjs, test/gate-report.mjs, gate-report.mjs | y | own read: test/ now has test/gate-report.mjs too (#699); named count stays 6, denominator 8 to 9, missing set widened to repo/ + gate-report.mjs | drifted | drifted |
| DD34 | .claude/CLAUDE.md, src/ui/app.js | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD35 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD36 | README.md, src/engine/type.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD37 | README.md, src/engine/geometry.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD38 | README.md, figma/plugin/code.js | y | own read: figma/plugin/code.js:9,25 RAW_COLLECTION/comment unmoved; #706s edits sit at line 154+, well below the cited lines | holds | holds |
| DD39 | README.md, test/ui/headless-boot.mjs, app.js | y | own read: test/ui/headless-boot.mjs still tracked (content changed by #706, path and existence claim unaffected) | holds | holds |
| DD40 | README.md, package.json | y | own read: package.json:22 gen:categories script unmoved; src/ui/categories/ still its output dir | holds | holds |
| DD41 | README.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD42 | README.md, package.json | y | own read: package.json:27 build chain order unmoved (only devDependencies moved, hunk starts at line 31) | holds | holds |
| DD43 | .claude/CLAUDE.md, .claude/settings.json | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD44 | .claude/CLAUDE.md, .sdlc/config.json | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD45 | .claude/CLAUDE.md, src/ui/overlays/drawer.js, src/ui/overlays/settings.js, src/ui/overlays/apply-gate.js | y | own read: all three overlay files (drawer.js, settings.js, apply-gate.js) still tracked; apply-gate.js content changed by #706, path unaffected | holds | holds |
| DD46 | .claude/CLAUDE.md, README.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD47 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD48 | README.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD49 | README.md, live-diff.mjs, migrations.mjs, mode-apply-plan.mjs, splice-utils.mjs, style-plan.mjs | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD50 | .claude/CLAUDE.md, .claude/hooks/git-precommit-privatedocs-guard.mjs, .claude/settings.json | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD51 | .claude/CLAUDE.md, test/engine/type.mjs, test/engine/categories.mjs | y | own read: test/engine/type.mjs:181 unmoved; test/engine/categories.mjs FAIL("curve",...) line moved 307 to 308 (#706 added one import line above it, confirmed by diff) | holds | holds |
| DD52 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | drifted | drifted |
| DD53 | README.md, package.json, scripts/gen-preview.mjs | y | own read: package.json:21 gen:preview script unmoved; scripts/gen-preview.mjs:15,24-25 unchanged | holds | holds |
| DD54 | README.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD55 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
| DD56 | .claude/CLAUDE.md | n | path(s) untouched by #706 (not in the diff); reads the same at 20298cc as at d814500 | holds | holds |
## Step 8 (table): the 18 controls, own run at 20298cc, clone `job691u3`

All 15 read-only controls (K1-K6, K8, K10-K18) ran directly in this worktree (no writes). K7 and K9 (they write) and every plant for all 18 controls ran in a throwaway clone (`git clone -q --shared . "$SCRATCH/job691u3/u3"`, `git reset --hard && git clean -fdxq` between plants).

| K | own result at 20298cc | pass 5 cell | delta | plant | hits |
|---|---|---|---|---|---|
| K1 | 0 hits (grep over src/engine/* with comment filter) | 🟢 0 hits | none | `const x = document.body;` appended to src/engine/tonal.js | 1 |
| K2 | 0 hits | 🟢 0 hits | none | `import { h } from "../ui/app-helpers.mjs";` appended to src/engine/hct.js | 1 |
| K3 | 0 hits (both halves) | 🟢 0 hits (both halves) | none | `import fs from "node:fs";` in src/engine/hct.js + `import x from "lodash";` in mcp/describe-eval.mjs | 2 |
| K4 | 0 hits | 🟢 0 hits | none | `import { HctApp } from "../app.js";` appended to src/ui/sections/color.js | 1 |
| K5 | 0 hits | 🟢 0 hits | none | `const v = figma.variables;` appended to figma/binder/live-diff.mjs | 1 |
| K6 | 0 hits (comment-filtered; 2 raw header-comment hits) | 🟢 0 hits | none | `fetch("https://x");` appended to figma/plugin/code.js | 1 |
| K7 | (clone) `node scripts/bundle.mjs` exit 0, wrote dist/ultimate-tokens.html 3777.5 KB | 🟢 exit 0, wrote 3777.5 KB | none (same size as pass 5's own run) | new src/engine/planted.mjs imported at the top of src/engine/exports.js | exit 1, `bundle.mjs preflight found 1 registry problem ... "./planted.mjs" is not registered in KEY` |
| K8 | `node test/engine/semantic.mjs` PASS; `node test/figma/binder.mjs` PASS; 53 = 53 | 🟢 both exit 0; 53 = 53 | none | (a) SCRIM_STRENGTH_STEPS last step 600 to 999 in figma/binder/figma-semantic-binder/code.js; (b) one role-table.json roleTable row popped | (a) `FAIL: 1 gate failure(s)` (parity); (b) `FAIL: 1 gate failure(s)` (refs-canonical) |
| K9 | (clone) full regen chain exit 0, 0 CHANGED BY REGEN lines, git status clean | 🟢 0, clean | none | hand-edit marker appended to each of adia-oklch-export.css, adia-radix-export.mjs, figma/plugin/ui.html, src/ui/mcp-assets.js | 4 CHANGED BY REGEN lines, one per file |
| K10 | 6 raw hits (app-helpers.mjs:89,91,92,114,134; app.js:2273), all inside try/catch by manual trace | 🟢 6 raw hits, same lines | none | unguarded `function f(){ localStorage.setItem("a","b"); }` appended to src/ui/app-helpers.mjs | 7 |
| K11 | jsx/tsx/vue/svelte tracked 0; framework imports 0; attachShadow 0; html: count 6+3+3=12 | 🟢 same, 12 | none | tracked src/ui/planted.jsx + `import { html } from "lit";` appended to src/ui/zip.mjs | 2 |
| K12 | violation grep 0; showModal( comment-filtered 4 (app.js, apply-gate.js, settings.js, color.js); "dialog" tag 4 | 🟢 same 4 files | none | `h("div", { role: "dialog", "aria-modal": "true" });` appended to src/ui/overlays/settings.js | 1 |
| K13 | 0 hits | 🟢 0 hits | none | `` const x = `font-family:${family}`; `` appended to src/ui/sections/typography.js | 1 |
| K14 | 3 hits (lc-applied, lc-ceiling, lc-toneline, all recorded exceptions) | 🟢 3, same three | none | `ty-line` renamed to `zz-line` in src/ui/sections/typography.js | 4 total (3 known + 1 new MISSING .an-svg .zz-line) |
| K15 | node_modules/ tracked 0; .claude/docs/other tracked 0; history none; hook selftest PASS | 🟢 same | none | force-added node_modules/p/i.js + .claude/docs/other/n.md | 2 |
| K16 | 0 hits | 🟢 0 hits | none | `console.log("hi");` appended to mcp/brand-kit-server.mjs | 1 |
| K17 | framework-import half 0; registration half 0 with the widened filter (gate-report.mjs, repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs added as exceptions); 7 unlisted files before the exception filter (was 4 hits after the stale 3-name filter at pass 5) | 🔴 4 hits after the stale filter | corrected in place: architecture.md's K17 row filter widened to 5 names, HEAD cell now "0 (7 unlisted files before the exception filter)", exceptions cell names all five with their class | `import test from "node:test";` appended to test/engine/hct.mjs + new tracked test/engine/zzz.mjs | 2 (widened filter still catches `engine/zzz.mjs`) |
| K18 | silent (CURRENT_SCHEMA_VERSION 4, `schema-rename v4` present in test/ui/persist.mjs) | 🟢 silent at 4 | none | CURRENT_SCHEMA_VERSION bumped to 5 in src/ui/persist.js | 1, `no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION 5` |

No control printed a hit outside its recorded exceptions except K17, which pass 5 already graded 🔴; this unit corrects the K17 exception list in `architecture.md` in place (adds `gate-report.mjs` and `repo/fixtures/gate-report-(clean|mismatch|singlequote).mjs`, all from #699, the same class as the already-listed `ui/counts.mjs`). With the widened filter the control prints 0 hits at `20298cc`; a tracked `test/engine/zzz.mjs` still prints `engine/zzz.mjs` through it, so the control still discriminates.

## Step 10: regression

U3 rows 1 to 10 (this handoff and the rewritten records are their own evidence, read by the verifier). P1, P4, P5 rerun: `npm test` green (see Steps 3-4), `node test/repo/branding.mjs` clean, and the scope wall (`git diff --name-only $(git merge-base origin/main HEAD) | grep -vcE '^\.sdlc/|^\.gitignore$'` prints `0`). U1-1 to U1-9 and U2-1 to U2-6 rerun as written with the two amended commands (U1-9's and U2-5's `architecture.md` deletion count now excludes the K17 row); all green against the current tree (verified above and by `baseline-agrees-check.sh`'s `stale total: 0`). U2-6 reads U2's own handoff, which this unit does not touch, so it is regression only.

## Questions

Two of criterion U3-2 and U3-3's own commands, as written, interact badly with text the same criteria require §Texts to add. Both were exercised, both bite as literally run, and both have a one-line fix that produces the stated Expected output without changing any measured number. Recorded here rather than silently patched, since the plan says its criteria are not to be renegotiated.

1. **U3-2, sub-check 5** (`awk '/^## Prior set/{exit} {print}' .sdlc/baseline.md | grep -cE 'd814500|35446265780|3777\.8|47 test files|63\.54'`, Expected `0`). §Texts requires the frontmatter `supersedes:` line to read "the 2026-09-19 baseline at `d814500` (kept below as the prior set) ...", which sits above the `## Prior set` heading by construction (frontmatter always does) and so is scanned by this check. As written, that line alone makes this sub-check print `1`, not `0`: confirmed, `awk '/^## Prior set/{exit} {print}' .sdlc/baseline.md | grep -cE 'd814500|35446265780|3777\.8|47 test files|63\.54'` prints `1`, matching only the `supersedes:` line. Every other requirement of the row (no other d814500/old-figure mention, the three prior-set rows, the reason bite, the corroborated timings) is otherwise green. Default: keep the `supersedes:` line exactly as §Texts specifies (it is the more specific, most-recently-amended instruction) and treat this one sub-check as a known, unavoidable `1` rather than a real staleness signal; the alternative is dropping "at `d814500`" from the supersedes line, which would satisfy the check but contradict §Texts' literal text. Orchestrator/verifier call.
2. **U3-3** (`U1-4's command, verbatim`, ending `gh run view "$(grep -oE 'CI run [0-9]+' .sdlc/baseline.md | grep -oE '[0-9]+')" ...`). §Texts' required Prior Set text also contains a "CI run 35446265780 green on d814500" sentence, so `grep -oE 'CI run [0-9]+'` now matches two lines instead of one (the live Not-run-here line and the prior-set line), and the command substitution passes both run ids, newline and all, to `gh run view`, which then 404s (`HTTP 404 ... /runs/35455937943%0A35446265780`). Restricting to the first match (`| head -1` inserted before the second `grep -oE`) resolves to run `35455937943` and reproduces the row's stated Expected output exactly: `20298cc`, `20298cc`, `20298cc panda-smoke=success build-test=success`. Used that corrected form as this unit's own evidence for the row; the verbatim command as written will error for the verifier too unless it makes the same fix.

Both interactions are new since U1-4 and the row-2 check were authored (neither existed before this plan's own Prior Set text was required), so neither is this builder's error to silently work around; both are recorded as findings for whoever next revises the plan's criterion text.

Correction (2026-09-19, plan records-followup U4, #709): a quotation of program output in this file had been reworded to avoid an em dash. It now reads as the program prints it. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule.
