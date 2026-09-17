---
kind: debt
repo: ultimate-tokens
built: 2026-09-16
head: f9e20c52f5b73a2358be4bf17a63d79dbbc63c16
branch: sdlc/adopt
unit: A6
inputs: .sdlc/survey.md, .sdlc/verdicts/survey.md, .sdlc/architecture.md, .sdlc/verdicts/architecture.md, .sdlc/records/decisions.md, .sdlc/verdicts/records.md, .sdlc/baseline.md
status: draft
---

# Debt map: ultimate-tokens

Every row is sized S/M/L (the plan-rules scale, S=1 M=2 L=4) and carries the builder grade the unit implies, per the orchestrator's grade table (L1 sonnet low for rename/config/docs, L2 default S and M, L3 M with interacting files, L5 opus medium for multi-file or generated-in-lockstep work, L6 for design judgment). Rule applied throughout: an S change in a hot, untested file is an L5 job. "Hot" means the file is in the top 25 by commit count since 2026-06-01; "untested" means no file under `test/` imports it (a path listed in `test/repo/doc-mutation-lane.mjs` or `test/repo/branding.mjs` is a name, not a test). Source facts: commit counts from `git log --since=2026-06-01 --format= --name-only | sort | uniq -c`, sizes from `wc`, test references from `git grep -- test`.

## Hot untested

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| H1 | `app.js` has no direct unit test; it is exercised only by the headless shim booting the element and by unasserted Chrome screenshots | `src/ui/app.js` 2596 lines, 183 commits since 2026-06-01 | `test/ui/headless-boot.mjs:133` (`await import("../../src/ui/app.js")`); `test/ui/shell.mjs:2-3` (syntax check only); baseline.md smoke row | L | L6 | hottest hand-written file; deciding what to extract into testable seams is design judgment |
| H2 | `sections/color.js` is never imported by a test | `src/ui/sections/color.js` 2156 lines, 11 commits in 90 days | `git grep` in test: only `doc-mutation-lane.mjs:31,39` (path list) and `headless-boot.mjs:3048` (reads the source as text) | M | L5 | largest section, hot, untested: the S-change rule applies to every edit |
| H3 | `sections/typography.js` and `sections/geometry.js` never imported by a test | 1097 + 934 lines, 6 + 7 commits in 90 days | test refs: `doc-mutation-lane.mjs:40-41` only | M | L5 | same as H2; both carry the SVG charts behind K11 and K14 |
| H4 | overlays `drawer.js`, `apply-gate.js`, `settings.js` never imported by a test | 506 / 430 / 503 lines, 12 / 8 / 3 commits in 90 days | test refs: `doc-mutation-lane.mjs:42-44` only; Pro gates live at `drawer.js:338,470` (verdicts/records.md SITE-runbook row) | M | L5 | drawer carries the export tab list and Pro gating; apply-gate is the Figma write path |
| H5 | `app-helpers.mjs` (the `h()` hyperscript and the storage chain) is imported by one test for one constant | `src/ui/app-helpers.mjs` 560 lines, 8 commits in 90 days | `headless-boot.mjs:3258` imports `PRO_EXPORT_FORMATS`; architecture K10 (storage guard is a manual trace) | S | L5 | every markup call goes through `h()`; a regression is invisible to the shim |
| H6 | `styles.css` has no assertion; the Safari font-quoting and SVG fill traps the conventions exist for are invisible to Chrome smoke | `src/ui/styles.css` 1602 lines, 81 commits | architecture K13, K14 control scripts (not wired into `npm test`); baseline.md smoke row | S | L2 | wire the existing K13/K14 scripts into a `test/repo/` gate; no engine code |
| H7 | engine modules with zero test references | `src/engine/icon-systems.mjs`, `src/engine/motion.mjs` | `git grep` in test: 0 hits; consumed by `settings.js`, `ds-export.js`, `model.mjs` | S | L2 | cold pure engines, not in the hot list; a plain verifier each |
| H8 | `bundle.mjs` and `gen-figma-ui.mjs` are untested except by being run | `scripts/bundle.mjs` 200 lines, 37 commits; `scripts/gen-figma-ui.mjs` 62 lines | test refs: 0; architecture K7 (`preflight()` is the only check) | S | L3 | build-chain files; a break surfaces as a red `npm test` with no message about which module |
| H9 | the shim test is one 3298-line, 274 KB file edited by 154 commits | `test/ui/headless-boot.mjs` | survey Hygiene (largest tracked); hot list rank 3 | L | L5 | splitting the gate by group is a multi-file refactor of the gate itself; must stay byte-equivalent in what it asserts |

## Records drift

From the Human answers table in `.sdlc/records/decisions.md` (2026-09-16) and the rows of `.sdlc/verdicts/records.md`.

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| R1 | six stale records: ADR-010 (`window.storage` chain and `makeZip` exist only as comment/renamed), ADR-013 (thirteen voices, engine has fifteen, G4), ADR-016 (heading says "Breakpoints", code says "Geometry", G8), LLD-muted-base (resolver lives in `resolve.mjs`, LLD says `model.mjs`), SITE-runbook (says no `flagOf()` consumer, four exist), SITE-describe-palette wording | `decision-records.md:147-148, :260, :354,373`; `docs/lld/lld-muted-base-key-spikes.md:31`; `docs/site/go-live-runbook.md:14-17`; `src/engine/collections.js:6-8`; `src/engine/resolve.mjs:16,25` | decisions.md Human answers row 1; verdicts/records.md ADR-010, ADR-013, ADR-016, SPEC-muted-base, SITE-runbook rows | M | L1 | docs only; dated amendments appended, never rewritten; ruled to land as one A7 unit. Closed by U1 in plan adopt-hygiene (#643) |
| R2 | `hostedMcp: true` is wired in the pro `TIER_FLAGS` though the spec says it stays unwired until Phase E; a tier flip would grant a feature with no server | `src/engine/flags.js:17-18`; `docs/site/mcp-hosting-spec.md:266` | Human answers row 2; verdicts/records.md SITE-mcp-hosting | S | L2 | engine file but cold and gated: `test/engine/flags.mjs:19,55-57` already reference `hostedMcp`; `FLAG_KEYS` stays |
| R3 | ADR-007 caution absent: drawer tab reads "Figma UI3", README lists it beside Figma variables, "interchange" appears 0 times on either | `src/ui/overlays/drawer.js:38`; `README.md:56` | Human answers row 3; verdicts/records.md ADR-007 | S | L5 | `drawer.js` is hot and untested (H4), so the S-change rule bites; the README half alone is L1. README half closed by U1; the drawer half stays open |
| R4 | three plans never closed (G5): both `docs/plan/*.md` say `status: active` with every step "todo" though the work landed (#578, #593, #631); PLAN-overhaul Phase 4 unticked | `docs/plan/plan-2026-09-adia-derived-export-artifacts.md:4`; `docs/plan/plan-2026-09-export-schema-revision.md:4`; `.claude/overhaul-plan-2026-08-14.md:74-77` | Human answers row 4; verdicts/records.md PLAN-* rows | S | L1 | docs; A5 names the Orchestrator as closer from here on. Closed by U1 in plan adopt-hygiene (#643) |
| R5 | SITE-licensing Phase 1 (license bound to email, email match in the Account panel) never built | `src/engine/flags.js`, `src/main.ts`, `src/ui/overlays/settings.js`: 0 hits for `email`/`customer_email` | Human answers row 5 (deferred on purpose); verdicts/records.md SITE-licensing 🔴 | M | L5 | touches the app's only network call (`main.ts:39`) and an untested overlay; stays debt until licensing is scheduled |
| R6 | OD-004 (manual Figma import of the aliased DTCG cascade) still open; its named results file `docs/spec/CHANGELOG.md` was deleted in df2ef6f (#172) | `decision-records.md:50`; `git log --diff-filter=D -- docs/spec/CHANGELOG.md` | Human answers row 6; verdicts/records.md OD-004 🔴 | S | human + L1 | the human runs the test in Figma and the conductor records it; repointing the record's results file is a one-line docs fix. Closed by U1 in plan adopt-hygiene (#643) |
| R7 | three missing records: a PRD stub (G1, `PRD-G1..G7` cited by `app-shell-patterns.md` and `storage-and-sync-spec.md`), a scrim-500 ADR (G2, live at `semantic.js:223-226`, recorded only as a note inside ADR-004), a vite/bundle split ADR (G3: vite is dev server plus type check, `bundle.mjs` is the artifact) | `docs/reference/references/decision-records.md` (append ADR-023, ADR-024); new PRD file | Human answers row 7; verdicts/records.md G1, G2, G3 rows | S ×3 | L1 | pure authoring; the evidence for each ruling is already written in the G3 verdict row and `semantic.js:223-226`. Closed by U1 in plan adopt-hygiene (#643) |
| R8 | the weekly describe-eval is a no-op: the secret is absent (`gh secret list`: `NPM_TOKEN` only), the runner prints "skipped" and exits 0, the job shows green | `.github/workflows/describe-eval.yml:22-29`; `mcp/describe-eval-runner.mjs:87-90` | Human answers row 8 (G6): "check whether the eval silently skips". Answer: it skips loudly in the log and silently in the badge | S | human + L1 | adding the secret is a human custody decision; making the scheduled run exit 1 without a key is a two-line workflow edit. Closed by U2 and U6 in plan adopt-hygiene (#643) |
| R9 | `flattenOver` is exported with 0 callers in src, test, mcp, scripts | `src/engine/exports.js:1080-1084` | Human answers row 10; verdicts/records.md SPEC-panda-park | S | L2 | `exports.js` is hot (65 commits) but gated by `test/engine/exports.mjs` (1901 lines); `adding-export-formats` skill owns the file |
| R10 | ADR-019's documented gaps still stand: `exportUI3` and the standalone binder hardcode Light+Dark while the theme axis is data | `src/engine/exports.js` (`exportUI3` `modes: ["Light","Dark"]`); `figma/binder/figma-semantic-binder/code.js:789` | decisions.md lineage ADR-019; verdicts/records.md ADR-019 | M | L5 | engine plus generated binder move in lockstep under the parity gate |
| R11 | CLAUDE.md Commands line says `test`/`build` run "the first three" generators and omits `gen:adia-exports`, which `npm test` has run since #631 | `.claude/CLAUDE.md:21-22`; `package.json` `test` script | survey Manifests (test script) | S | L1 | one line. Closed by U2 in plan adopt-hygiene (#643) |
| R12 | two pointers behind the A7 scope wall still name the pre-archive plan paths that U1 moved to `docs/plan/archive/` | `scripts/gen-adia-derived-exports.mjs:3`; `test/engine/adia-derived-exports.mjs:6` | `.sdlc/verdicts/adopt-hygiene-prepr.md` stale-pointers-behind-the-wall row (🟡) | S | L1 | comment-only path fix; P3 forbids touching `scripts/`/`test/` in this plan, so it waits for the first plan after #643 that opens `scripts/` or `test/`; the Orchestrator names R12 in the close comment on #643 (Landing) and adds it to that plan |

## Config smells

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| C1 | `pages.yml` pins Node 20 and runs `npm install`; every other workflow pins Node 22 and runs `npm ci` | `.github/workflows/pages.yml:38-39` vs `ci.yml:25-28`, `describe-eval.yml:20-21`, `publish-plugin.yml:35` | survey CI | S | L1 | manual fallback workflow; align both lines, no code. Closed by U2 in plan adopt-hygiene (#643) |
| C2 | no `lint` script; `tsc` (strict unused locals/params) is the only static check and runs only inside `npm run build` | `package.json` scripts; no eslint/prettier/biome config at root | baseline.md Lint | M | L2 | a linter is a dev-dependency decision (the zero runtime deps rule is untouched); the first run will flag across ~14k lines of `src/ui` |
| C3 | vite builds `dist/index.html` + `assets/` that nothing deploys; `vite.config.js` exists only to stop the dep-scan crawling the 3.8 MB committed `ui.html` | `vite.config.js:1-12`; `ci.yml:57-60` (ships `dist/ultimate-tokens.html`) | verdicts/records.md G3 (sharpened) | S | L2 | the ruling belongs in the G3 ADR (R7); trimming the build chain itself needs `npm run build` green and is separate |
| C4 | repo allows squash, merge commit and rebase; `delete_branch_on_merge` false; `main` has no protection or rulesets | `gh api repos/:owner/:repo`: squash/merge/rebase all true; protection 404 | verdicts/survey.md C5, C6 | S | human | one `gh api` PATCH by the repo admin; not a code change. Squash-only set by U3; `delete_branch_on_merge` and protection stay open |
| C5 | `.claude/settings.json` enables `sdlc@nonoun` but `extraKnownMarketplaces` declares no `nonoun` marketplace, so a fresh clone cannot resolve the plugin | `.claude/settings.json` `enabledPlugins` | `.sdlc/questions/adopt-hygiene-marketplace.md` (default A: leave it user-scoped, no public source to point at) | S | human | resolved by U7 under human answer B: `extraKnownMarketplaces.nonoun` now declares `{"source": {"source": "github", "repo": "kimgranlund/sdlc-orchestration"}}`, same shape as `nonoun-plugins`; the source repo itself is C7. This debt id C5 is distinct from adapter conflict C5 in `.sdlc/adapter.md` §4 (the stale "no local git hooks" line); the two tables number their own rows and the shared prefix is a reading hazard, not an error |
| C6 | machine-local absolute home paths appear in `.sdlc/` records (`.sdlc/plans/adopt-hygiene.md`, `.sdlc/tickets/T-0001.md`, `.sdlc/architecture.md`, `.sdlc/debt.md` itself) | `git grep -n '/Users/' -- .sdlc` | `.sdlc/verdicts/adopt-hygiene-prepr.md` config-and-records row (🟡 accepted); U6 review minor (`.sdlc/verdicts/adopt-hygiene-U6-review.md:45`) flagged the file list as incomplete, missing `debt.md`'s own hit | S | accepted | seat-local records written on one maintainer's machine; not worth rewriting for a single-maintainer repo. This debt id C6 is distinct from adapter conflict C6 in `.sdlc/adapter.md` §4 (the tracked `.claude/ops/` files); the two tables number their own rows and the shared prefix is a reading hazard, not an error |
| C7 | the `nonoun` marketplace declared by U7 (`kimgranlund/sdlc-orchestration`) has no source repo pushed to GitHub yet, so a fresh clone still cannot resolve `sdlc@nonoun` until the human pushes it | `.claude/settings.json` `extraKnownMarketplaces.nonoun` | U7 (`.sdlc/questions/adopt-hygiene-marketplace.md` answer B) | S | human | the human pushes the local `sdlc-orchestration` repo to `kimgranlund/sdlc-orchestration` on GitHub after this plan lands; not a code change. This debt id C7 is distinct from adapter conflict C7 in `.sdlc/adapter.md` §4 (commit trailers); same reading hazard as C5 and C6 |

## Generated artifacts

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| G1 | `type-fonts.js` is regenerated only by hand, sits outside `npm test` and the K9 control, and a hand edit leaks into the regenerated `ui.html` | `src/ui/type-fonts.js` 229 KB; `scripts/gen-type-fonts.mjs:1-5` (fetches font subsets over the network, so it cannot join the offline `npm test`) | verdicts/survey.md C13 🟡; architecture K9 exceptions | S | L2 | a header-plus-sha fingerprint gate under `test/repo/`, not a change to the generator |
| G2 | `ui.html` is 3.8 MB, tracked, rewritten by 340 commits, has no generated header in its first 600 bytes, and the repo has no `.gitattributes` | `figma/plugin/ui.html`; `scripts/gen-figma-ui.mjs`; `.gitattributes` absent | architecture K9 exceptions; survey Hygiene | S | L1 | add `linguist-generated -diff` for `ui.html`, `src/ui/*-assets.js`, `type-fonts.js`, `categories/*.js`; one header line in `gen-figma-ui.mjs`. Closed by U2 in plan adopt-hygiene (#643) |
| G3 | `describe-mcp-assets.js` (681 KB) embeds `ds-export.js` source, so the K13 font-family control must exclude it by name | `src/ui/describe-mcp-assets.js`; architecture K13 exceptions | architecture K13 | S | L1 | covered by G2's `.gitattributes`; no code change. Closed by U2 in plan adopt-hygiene (#643) |
| G4 | `gen-font-test.mjs` has no npm script, no test, and no README mention; it writes `font-test.html` to the repo root | `scripts/gen-font-test.mjs:1-4`; only reference `CHANGELOG.md:461` | survey Manifests scripts table (absent) | S | L1 | add to the README scripts line or delete; `migrate-type-registers.mjs` stays by ADR-022. Closed by U1 in plan adopt-hygiene (#643) |

## Dead agent artifacts

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| D1 | 7 files tracked under `.claude/ops/` while `.gitignore:14` ignores the directory; `plan.md` is dated 2026-07-29, the 3 reports 2026-07-25 | `.claude/ops/{plan.md,held-items.md,friendlies.json,watch-checkpoint.json,reports/*.md}` | verdicts/survey.md C8 🟡 | S | L1 + human | `git rm --cached` the four stale files; `friendlies.json` and `held-items.md` are a human-approved allow-list and need a ruling: keep tracked outside the ignored dir, or drop. Closed by U3 in plan adopt-hygiene (#643) |
| D2 | overhaul plan: Wave 1 landed (#439-#442) yet Phase 4 closeout is unticked and "nothing above has been executed" still stands; `naming.manifest.json` exemptions 10 to 6 closeout pending | `.claude/overhaul-plan-2026-08-14.md:74-77, :86-87`; `.claude/naming.manifest.json` | verdicts/records.md PLAN-overhaul 🟡 | S | L1 | tick what landed with a date, then close via R4 or move under `docs/plan/archive/`. Closed by U1 in plan adopt-hygiene (#643) |
| D3 | `workflow.json` (backend github, squash, gate `npm test`) overlaps what `.sdlc/adapter.md` will rule; no reader found under the sibling plugins' skill trees | `.claude/workflow.json` | survey Harnesses | S | L1 | A5-planner-adapter decides which file is canonical; the other gets a pointer or is deleted. Closed by U2 in plan adopt-hygiene (#643) |
| D4 | one-off agent report tracked under `.claude/docs/reports/` (6 files, 80 KB), not referenced by CLAUDE.md | `.claude/docs/reports/reactivity-2026-08-20/` | survey Harnesses | S | L1 | move to `docs/reference/reviews/` beside the other six reviews, or delete. Closed by U1 in plan adopt-hygiene (#643) |

Not debt: the working-tree change to `.claude/settings.json` is a key reorder present before A2 (verdicts/architecture.md row 3); the duplicate conductor session note; G7 (`.sdlc/` tripping the branding gate) is closed, `node test/repo/branding.mjs` on the root checkout now prints "clean (441 files scanned)".

## Architecture exceptions

The five K controls in `.sdlc/architecture.md` §6 that carry an exceptions cell.

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| K9 | regeneration control cannot cover `type-fonts.js` and `ui.html` carries no generated header | see G1 and G2 | architecture K9 exceptions | S | L2 | fixed by G1 + G2 together |
| K11 | 12 `html:` attributes inject SVG chart strings via `innerHTML` (color 6, geometry 3, typography 3), against the `h()`-only convention | `src/ui/sections/*.js`; `src/ui/app-helpers.mjs:313` | architecture K11 exceptions | S to ratify · M to eliminate | L1 · L5 | ratify: one CLAUDE.md convention line naming the exception, the K11 grep as its gate. Eliminate: `h()` has no SVG namespace and the sections are hot and untested (H2, H3). Closed by U2 in plan adopt-hygiene (#643) |
| K14 | `.lc-toneline` and `.lc-applied` set `fill: none` without the `.an-svg` qualifier; `.lc-ceiling` is filled on purpose | `src/ui/styles.css:825-827`; all three paths do sit under `.an-svg` (`sections/color.js:61,89,117`) | architecture K14 exceptions | S | L3 | CSS in a hot untested file, but the K14 script verifies the fix and the three containers are confirmed; the `lc-ceiling` case needs an allowlist in the script, which is the reasoning step |
| K17 | `run.mjs` TESTS is a hand-kept list and the control filters 3 files by name; a new test file that is not listed never runs and nothing says so | `test/run.mjs:12-21` (33 commits) | architecture K17 exceptions | S | L2 | add a listing self-check to `run.mjs`: every `test/**/*.mjs` is in TESTS or a named allowlist |
| K18 | v4 is a drop-only bump with no `RENAME_MAPS` entry and the control accepts a comment as the rule | `src/ui/persist.js:312-318`; `test/ui/persist.mjs:179-183` already holds the v3 to v4 snapshot case | architecture K18 exceptions | S | L1 | the test exists; only the §6.1 control script should require a `schemaVersion: N` case in `persist.mjs` instead of a `vN` comment. Closed by U1 in plan adopt-hygiene (#643) |

## Process

| id | item | where | source | size | grade | why that grade |
|---|---|---|---|---|---|---|
| P1 | squash is practice, not policy: 48/50 subjects carry `(#NNN)`, 2 direct commits on `sdlc/adopt`, all three merge styles allowed | `git log -50 --format=%s`; `gh api` merge settings | verdicts/survey.md C6 🟡 | S | human | the same admin switch as C4; enforce squash and delete-branch-on-merge together. Squash is policy since U3; delete-branch-on-merge stays open with C4 |
| P2 | 15 local branches whose remote is gone, 41 remote branches, and ops plan item 1 (delete 58 merged remote branches) never finished | `git branch -vv` (15 `: gone]`); `git branch -r` (41); `.claude/ops/plan.md` Queue 1 | survey Branches; ops plan | S | L1 (local) + human (remote) | local prune is reversible; remote deletes are outward-facing and stay a human sweep. Closed by U3 (local half; the remote sweep stays human) in plan adopt-hygiene (#643) |
| P3 | `npm test` runs 44 files serially as child processes, ~60 s per run | `test/run.mjs:23-25`; baseline 58.4 · 62.4 · 60.8 s | baseline.md Pass | M | L3 | parallel children must respect the regenerated-asset precondition (`run.mjs:5-6`); not needed for adoption |
| P4 | no rule names who closes a plan (G5), which is why R4 exists | `docs/plan/*.md`; decisions.md G5 | Human answers row 4 | S | L1 | lands in A5's `adapter.md` (the Orchestrator closes); this row is done when that rule is written. Closed by A5: adapter.md §5 names the Orchestrator |

Row count: Hot untested 9 · Records drift 12 · Config smells 7 · Generated artifacts 4 · Dead agent artifacts 4 · Architecture exceptions 5 · Process 4 · total 45.

## A7 hygiene candidates

S items a `builder-l1` can do in one unit without touching engine code, in order. R1 (six record amendments, M, docs) is the A7 docs unit the human already ruled; it is listed first because the rows below it amend the same ledger.

1. R1 six stale record amendments (M, docs, ruled for A7)
2. R4 + D2 close the three plans and tick the overhaul plan's landed items with dates
3. R7 write the three record stubs: PRD (G1), scrim-500 ADR (G2), vite/bundle split ADR (G3)
4. R11 fix the CLAUDE.md generators line (add `gen:adia-exports`)
5. R6 repoint OD-004's results file (the docs half; the Figma run stays human)
6. R3 README half only: name UI3 as interchange-only beside the format list (the `drawer.js` half is L5, excluded)
7. C1 `pages.yml` to Node 22 + `npm ci`
8. G2 + G3 add `.gitattributes` with `linguist-generated -diff` for every generated file, plus a generated header line in `gen-figma-ui.mjs`
9. R8 make the scheduled describe-eval exit 1 when the key is absent (workflow only; adding the secret stays human)
10. D1 `git rm --cached` the four stale ops files (`plan.md`, `watch-checkpoint.json`, `reports/*`); leave `friendlies.json` and `held-items.md` for the human ruling
11. D4 move the reactivity report to `docs/reference/reviews/`
12. D3 point `workflow.json` at `adapter.md` or delete it, after A5 lands
13. K11 ratify the `html:` SVG exception in CLAUDE.md Conventions
14. K18 reword the §6.1 K18 control to require the `persist.mjs` snapshot case
15. G4 add `gen-font-test.mjs` to the README scripts line or delete it
16. P2 prune the 15 gone local branches (`git fetch -p`, `git branch -d`)

Excluded from A7 on purpose: R2 and R9 (engine files, L2), G1, K17 (test gates, L2), K14 (L3), every H row, C2, C3, R5, R10 (M or L).
