---
status: approved
ticket: none yet (adapter.py create on approval; carries kind:chore, size:M, lane:docs)
priority: P1
lane: docs
size: M (U1 M + U2 M + U3 S = 5 points)
labels: kind:chore · size:M · lane:docs · mode:multi
unit: A7
written: 2026-09-16
head: f9e20c5
branch: sdlc/adopt
inputs: .sdlc/debt.md §A7 hygiene candidates, .sdlc/adapter.md §3 §5 §6 §7 §8 and rows C5 C8 C10 C11 C12, .sdlc/records/decisions.md §Human answers, .sdlc/questions/adopt-a5-conflicts.md, .sdlc/verdicts/records.md, .sdlc/verdicts/architecture.md
---

# Close the adoption's hygiene debt without touching engine, UI, test-gate, or mcp source

Sixteen S items the debt map lists under "A7 hygiene candidates", plus the eight things `adapter.md` §8 hands A7, grouped into three units a `builder-l1` can each finish in one pass. Every criterion below is a shell command run from the unit worktree root, its expected output, and a negative control that would make it fail. The Verifier runs every command itself; a handoff's `Ran` row is never evidence.

**Scope wall (in force for all three units).** Nothing under `src/`, `mcp/`, `scripts/`, or `test/` changes except the one `SKIP_DIRS` line in `test/repo/branding.mjs`. Everything in scope is docs, `.claude/` harness files, two workflows, `.gitignore`, `.gitattributes`, `.sdlc/` records, the git index, GitHub repo settings, and local branches. The L5/L2 rows the debt map excludes stay excluded: R2 (`hostedMcp` unwire), the `drawer.js` half of R3, R9, R10, R5, G1, K14, K17, C2, C3, every H row.

**Branding rule (adapter C12).** `test/repo/branding.mjs` scans `.sdlc/` and `docs/`. No file this plan writes quotes the retired maker brand or the pre-rename element identifier, even when the amended ADR does; paraphrase.

## Criteria (plan-level, checked on every unit and again at pre-land)

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, tree byte-stable (run in a unit worktree; from the root checkout exclude the pre-existing `.claude/settings.json` reorder, X2) | `npm test 2>&1 \| tail -1; git status --short -- . ':!.claude/settings.json' \| wc -l` | `all 44 test files passed` then `0` | `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test 2>&1 \| grep -c FAIL` prints a non-zero count (baseline used 17); `git checkout docs/reference/data/role-table.json` restores |
| P2 | private folder and `node_modules` untracked | `git ls-files \| grep -cE '^\.claude/docs/other/\|(^\|/)node_modules/'` | `0` | `git ls-tree -r --name-only origin/main \| grep -cE '^\.claude/ops/'` prints `7` (the same grep shape sees tracked files under `.claude/`; `git ls-files` reads the index, so the control reads the remote tree instead) |
| P3 | scope wall holds | `git diff origin/main --stat -- src mcp scripts test ':!test/repo/branding.mjs' \| wc -l` | `0` | plant `echo "// probe" >> src/engine/motion.mjs` and rerun: `2` (the file line plus the summary line); `git checkout src/engine/motion.mjs` restores. On U2 additionally, dropping the `:!test/repo/branding.mjs` exclusion prints `2` |
| P4 | branding gate clean on the root checkout | `node test/repo/branding.mjs` | `clean (N files scanned)`, exit 0 | `cp docs/reference/references/decision-records.md docs/x.md && node test/repo/branding.mjs` prints FAIL (the RECORDS exemption is by path, so a copy trips it); `rm docs/x.md` |
| P5 | no rewritten record | `git diff origin/main -- docs/reference/references/decision-records.md \| grep -cE '^-[^-]'` | `0` (every change is an appended line) | any deleted line in that file makes the count non-zero |

## Units

- [ ] U1 (M) records, plans, stubs, moved docs · grade l1 · reviewer-l1 · verifier-l1
- [ ] U2 (M) harness, config, ignores, workflows, CLAUDE.md `## SDLC` · grade l1 · reviewer-l1 · verifier-l1
- [ ] U3 (S) repo settings, git index, local branches · grade l1 · reviewer-l1 · verifier-l1

Dispatch order: U2 first when possible (it adds `.worktrees/` to `.gitignore` and to the branding skip list, so a root-checkout `npm test` stops walking the unit worktrees). U1 and U3 are independent of U2 and of each other; their file sets do not overlap. Builders run gates inside `.worktrees/<unit>` only. `npm run build` is required for U2 (it touches `.github/` and `test/repo/`, and the verifier at pre-land runs it always); U1 and U3 need only `npm test`.

### U1 records, plans, stubs, moved docs (M, grade l1)

Debt rows: R1, R4, D2, R7, R6, R3 (README half), G4, D4, K18. Files: `docs/reference/references/decision-records.md` (append only), `docs/lld/lld-muted-base-key-spikes.md`, `docs/site/go-live-runbook.md`, `docs/site/describe-palette-spec.md`, `docs/reference/references/od-004-plugin-free-import-test.md`, `docs/plan/*.md` and `.claude/overhaul-plan-2026-08-14.md` (move to `docs/plan/archive/`), new `docs/prd/prd-0001-app-shell.md`, `.claude/docs/reports/reactivity-2026-08-20/` (move to `docs/reference/reviews/2026-08-20-reactivity/`), `README.md`, `.claude/skills/project-docs/SKILL.md` (two table cells), `.sdlc/records/cards/{ADR-023,ADR-024,PRD-0001}.md`, `.sdlc/records/index.md`, `.sdlc/records/decisions.md`, `.sdlc/architecture.md` (K18 control only).

Texts to paste: ADR-023, ADR-024, and the PRD stub are given verbatim in `.sdlc/adapter.md` §6. Amendment lines follow the file's own `- **Update (date).**` shape, written as `- **Amendment (2026-09-16).**`. The plan-closing steps are `.sdlc/adapter.md` §5, items 1 to 3.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | ADR-010, ADR-013, ADR-016 each carry one dated amendment (R1): ADR-010 that the storage chain is a comment and `makeZip` is now `zipStore`; ADR-013 that the engine has fifteen voices (G4); ADR-016 that #491 renamed the collection set to "Color Roles", "Type Primitives", "Geometry" (G8) | `for a in 010 013 016; do n=$((10#$a+1)); awk "/^## ADR-$a /,/^## ADR-0$n /" docs/reference/references/decision-records.md \| grep -c 'Amendment (2026-09-16)'; done` | `1` three times | same loop on `origin/main`: `0` three times |
| 2 | ADR-023 and ADR-024 appended after ADR-022, before the Quick map (R7) | `grep -n '^## ADR-022 \|^## ADR-023 \|^## ADR-024 \|^## Quick map' docs/reference/references/decision-records.md \| cut -d: -f2 \| cut -c1-12` | four lines in the order ADR-022, ADR-023, ADR-024, Quick map | `origin/main` prints two lines (ADR-022, Quick map) |
| 3 | ADR-023 records the scrim ramp as built and ADR-024 the vite/bundle split, with the given Status lines | `grep -c 'Supersedes ADR-004' docs/reference/references/decision-records.md; grep -c 'Amends ADR-010 wording' docs/reference/references/decision-records.md` | `1` and `1` | `origin/main`: `0` and `0` |
| 4 | LLD, runbook, and describe spec each carry one dated amendment (R1): LLD names `src/engine/resolve.mjs` as the resolver's home; runbook step 0 names the four wired `flagOf()` consumers and `hostedMcp` as the only unwired one; describe spec §12 says the weekly eval fails loudly without the key from this plan on | `grep -c 'Amendment (2026-09-16)' docs/lld/lld-muted-base-key-spikes.md docs/site/go-live-runbook.md docs/site/describe-palette-spec.md; grep -c 'resolve.mjs' docs/lld/lld-muted-base-key-spikes.md` | `1` per file, then `1` or more | `origin/main`: `0` per file, and `resolve.mjs` count `0` |
| 5 | OD-004 results file repointed to root `CHANGELOG.md` (R6, docs half only; the Figma run stays human) | `grep -c 'docs/spec/CHANGELOG.md' docs/reference/references/od-004-plugin-free-import-test.md; grep -c 'CHANGELOG.md' docs/reference/references/od-004-plugin-free-import-test.md` | `0` then `1` or more | `origin/main`: `1` then `1`, and `ls docs/spec/CHANGELOG.md` errors (the pointed-at file does not exist) |
| 6 | the two `docs/plan/` plans are closed and archived (R4, adapter §5 items 1 to 3): status `complete`, every step ticked or moved with a revision row naming the landing PRs (#578, #593, #631) | `ls docs/plan/*.md 2>/dev/null \| wc -l; ls docs/plan/archive/ \| wc -l; grep -h '^status:' docs/plan/archive/plan-2026-09-*.md \| grep -c complete; grep -ciE '\btodo\b' docs/plan/archive/plan-2026-09-*.md` | `0`, `3`, `2`, then `0` for each file (the revision row must not contain the word "todo" either, since the grep counts it) | `origin/main`: two files in `docs/plan/`, no archive dir, `todo` counts `8` (adia) and `7` (export-schema) |
| 7 | PLAN-overhaul moved to `docs/plan/archive/overhaul-plan-2026-08-14.md`, Phase 4 items ticked only where the verdict has evidence (item 2: old names 0 in tracked `.claude/`), the rest named as debt D2 in a dated closing line, the "nothing above has been executed" sentence dated (D2) | `test ! -e .claude/overhaul-plan-2026-08-14.md && echo moved; grep -c 'Closed 2026-09-16' docs/plan/archive/overhaul-plan-2026-08-14.md; git grep -c '\.claude/overhaul-plan-2026-08-14' -- ':!docs/plan/archive' ':!CHANGELOG.md' ':!.sdlc/survey.md' ':!.sdlc/debt.md' ':!.sdlc/verdicts' ':!.sdlc/plans' \| wc -l` | `moved`, `1`, `0` | `origin/main`: the file exists under `.claude/`, and `.sdlc/records/index.md` still cites the old path (the grep prints `1` or more) |
| 8 | PRD stub exists with the adapter §6 frontmatter and the seven goals (R7, G1), and `project-docs` no longer says `docs/prd/` and `docs/plan/` are absent | `grep -cE '^(doc-type: prd\|id: prd-0001-app-shell\|status: stub\|date: 2026-09-16)$' docs/prd/prd-0001-app-shell.md; grep -c 'PRD-G7\|G7 ' docs/prd/prd-0001-app-shell.md; grep -n 'docs/prd/\|docs/plan/' .claude/skills/project-docs/SKILL.md \| grep -c 'not present yet'` | `4`, `1` or more, `0` | `origin/main`: `ls docs/prd` errors and the last grep prints `2` |
| 9 | cards and ledger rows for ADR-023, ADR-024, PRD-0001 (adapter §6 last paragraph) | `ls .sdlc/records/cards/ADR-023.md .sdlc/records/cards/ADR-024.md .sdlc/records/cards/PRD-0001.md \| wc -l; grep -c 'ADR-023\|ADR-024\|PRD-0001' .sdlc/records/index.md; grep -c 'ADR-023\|ADR-024\|PRD-0001' .sdlc/records/decisions.md` | `3`, `3` or more, `3` or more | `origin/main`: `ls` errors, both greps `0` |
| 10 | README names UI3 as interchange-only beside the format list (R3, README half) and lists `gen-font-test.mjs` on the scripts line (G4) | `grep -c 'interchange' README.md; grep -c 'gen-font-test' README.md; git diff origin/main --stat -- src/ui/overlays/drawer.js scripts/ \| wc -l` | `1` or more, `1` or more, `0` | `origin/main`: `0` and `0` (the drawer half is excluded on purpose, so the third count must stay `0`) |
| 11 | the reactivity report moved beside the other reviews (D4) and nothing tracked still points at `.claude/docs/reports/` | `test ! -e .claude/docs/reports && echo moved; ls docs/reference/reviews/ \| grep -c reactivity; git grep -c '\.claude/docs/reports' -- ':!CHANGELOG.md' ':!.sdlc' \| wc -l` | `moved`, `1`, `0` | `origin/main`: `ls .claude/docs/reports/reactivity-2026-08-20 \| wc -l` prints `6` and `docs/reference/reviews/` has no reactivity entry |
| 12 | K18 control reworded to require the `test/ui/persist.mjs` snapshot case for the current schema version instead of a `vN` comment (K18) | `sed -n '/^K18:/,/^```$/p' .sdlc/architecture.md \| grep -c 'test/ui/persist.mjs'; sed -n '/^K18:/,/^```$/p' .sdlc/architecture.md \| sed '1d;2d;$d' \| bash` | `1` or more, then no output (control passes at HEAD, `CURRENT_SCHEMA_VERSION` 4 has its snapshot case starting at `test/ui/persist.mjs:183`; the block's exit code comes from its last `[ ]` test and is not the signal, printed lines are) | bump `CURRENT_SCHEMA_VERSION` to 5 in a scratch copy of `src/ui/persist.js` and rerun the block: one line printed; the `origin/main` block prints `0` for the first grep |

### U2 harness, config, ignores, workflows, CLAUDE.md (M, grade l1)

Debt rows: R11, K11, C1, G2 + G3 (the `.gitattributes` half), R8, D3; adapter §8 rows: CLAUDE.md `## SDLC`, `.gitignore`, `SKIP_DIRS`, `shipping-changes` (C5, C8, C11 pointer), `.sdlc/config.json`. Files: `.claude/CLAUDE.md` (the one human-approved edit unit under C9: three edits, nothing else), `.claude/skills/shipping-changes/SKILL.md`, `.gitignore`, `test/repo/branding.mjs` line 41 only, new `.gitattributes`, `.github/workflows/pages.yml`, `.github/workflows/describe-eval.yml`, `.claude/workflow.json`, new `.sdlc/config.json`.

Texts: the `## SDLC` section is the fenced block in `.sdlc/adapter.md` §7, pasted byte-for-byte between `## Shipping` and `## Always`. The config is `.sdlc/adapter.md` §2.2. The shipping-changes rewrites are the C5 and C8 resolution sentences in `.sdlc/adapter.md` §4.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | `## SDLC` sits between Shipping and Always and equals the adapter §7 block | `grep -n '^## Shipping\|^## SDLC\|^## Always' .claude/CLAUDE.md \| cut -d: -f2; diff <(sed -n '/^## SDLC$/,/^## Always$/p' .claude/CLAUDE.md \| sed '$d' \| sed '/^$/d') <(sed -n '/^```markdown$/,/^```$/p' .sdlc/adapter.md \| sed '1d;$d' \| sed '/^$/d') && echo same` (blank lines stripped on both sides; the adapter's first ```markdown fence is the §7 block) | three headings in the order Shipping, SDLC, Always, then `same` | `origin/main` has no `## SDLC`; changing one word in the pasted block makes `diff` print the hunk and drop `same` |
| 2 | CLAUDE.md Commands line lists `gen:adia-exports` and drops "the first three" (R11) | `grep -c 'gen:adia-exports' .claude/CLAUDE.md; grep -c 'run the first three' .claude/CLAUDE.md` | `1` or more, then `0` | `origin/main`: `0` then `1` |
| 3 | CLAUDE.md Conventions ratifies the `html:` SVG-chart exception with its live count as the gate (K11) | `grep 'html:' .claude/CLAUDE.md \| grep -c '\b12\b'; git grep -cE 'html:' -- src/ui/app.js src/ui/sections src/ui/overlays \| awk -F: '{s+=$NF} END {print s}'` | `1` (the convention line states the literal count), then `12` | `origin/main`: first count `0`; a thirteenth `html:` attribute anywhere in those files makes the sum disagree with the stated number |
| 4 | shipping-changes no longer claims "no hooks" or pins a model name, and points landing under sdlc at `adapter.md` §2.1 (C5, C8) | `grep -c 'no local git hooks\|there is no hook; you are the hook\|Opus 4.8' .claude/skills/shipping-changes/SKILL.md; grep -c 'core.hooksPath' .claude/skills/shipping-changes/SKILL.md; grep -c 'adapter.md' .claude/skills/shipping-changes/SKILL.md` | `0`, `1` or more, `1` or more | `origin/main`: `3`, `0`, `0` |
| 5 | four ignore rules added (adapter §3) | `for p in .sdlc/runtime/x .sdlc/.fake-tickets/x .sdlc/.fake-releases/x .worktrees/x; do git check-ignore -q "$p" && echo "ok $p"; done \| wc -l` | `4` | `origin/main`: `0` (`.git-worktrees/` is ignored there, `.worktrees/` is not) |
| 6 | branding gate skips `.worktrees/` (C11) | `grep -c '"\.worktrees"' test/repo/branding.mjs; mkdir -p .worktrees/zz && cp docs/reference/references/decision-records.md .worktrees/zz/x.md && node test/repo/branding.mjs \| tail -1; rm -r .worktrees/zz` | `1`, then `clean (N files scanned)` | the same probe on `origin/main` prints FAIL lines from `.worktrees/zz/x.md` (the copy is not RECORDS-exempt and the dir is walked) |
| 7 | `.gitattributes` marks every generated file `linguist-generated` and `-diff` (G2, G3): the K9 watched set, which is `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/type-fonts.js`, `src/ui/categories/*.js`, the two adia artifacts `docs/reference/data/adia-oklch-export.css` and `docs/reference/data/adia-radix-export.mjs`, and the binder `figma/binder/figma-semantic-binder/code.js` | `git check-attr diff linguist-generated -- figma/plugin/ui.html src/ui/type-fonts.js src/ui/figma-plugin-assets.js src/ui/mcp-assets.js src/ui/describe-mcp-assets.js src/ui/categories/*.js docs/reference/data/adia-oklch-export.css docs/reference/data/adia-radix-export.mjs figma/binder/figma-semantic-binder/code.js \| grep -vc 'diff: unset\|linguist-generated: set'` | `0` (every line is one of the two expected attributes; the `--` keeps `linguist-generated` from being read as a path) | `origin/main`: every line reads `unspecified`, count `28` for the first six path groups at plan time and `34` with the three added paths (no `.gitattributes` exists) |
| 8 | `pages.yml` aligned with the other workflows: Node 22, `npm ci` (C1) | `grep -c 'node-version: 22' .github/workflows/pages.yml; grep -c 'npm install' .github/workflows/pages.yml; grep -c 'run: npm ci' .github/workflows/pages.yml` | `1`, `0`, `1` | `origin/main`: `0`, `1`, `0` |
| 9 | the scheduled describe-eval fails when the key is absent (R8, workflow only; the secret stays human custody, `mcp/` untouched) | `grep -c 'exit 1' .github/workflows/describe-eval.yml; grep -c 'stays green' .github/workflows/describe-eval.yml; ruby -ryaml -e 'YAML.load_file(ARGV[0]); puts "yaml ok"' .github/workflows/describe-eval.yml; git diff origin/main --stat -- mcp/ \| wc -l` | `1` or more, `0`, `yaml ok`, `0` | `origin/main`: `0`, `1`; a broken indent makes `ruby` raise instead of printing `yaml ok` |
| 10 | `workflow.json` points at the adapter as canonical and keeps `merge.style: squash` (D3, C13) | `node -e 'const j=require("./.claude/workflow.json"); console.log(j.canonical, j.merge.style)'` | `.sdlc/adapter.md squash` | `origin/main`: `undefined squash` |
| 11 | `.sdlc/config.json` is the §2.2 preset and the adapter accepts it | `node -e 'const c=require("./.sdlc/config.json"); console.log(c.preset, c.baseBranch, c.github.repo, "token" in c.github)'; python3 /Users/kimba/Projects/nonoun/sdlc-orchestration/plugins/sdlc/scripts/adapter.py config --repo . \| head -c 300` | `github main kimgranlund/ultimate-tokens false`, then JSON naming preset `github`, exit 0 | add `"token": "x"` under `github` in a scratch copy: `adapter.py config` exits 2 with the named error about `gh auth`; `origin/main` has no file and `adapter.py config` reports preset `local` |
| 12 | `npm run build` green with the U2 tree (workflows and the gate file changed); a unit worktree has no `node_modules`, so install first | `npm ci >/dev/null 2>&1; npm run build 2>&1 \| tail -3; echo "exit $?"; git status --short \| wc -l` | `exit 0`, `figma/plugin/ui.html` regenerated, then `0` (`node_modules` is ignored, so it never shows) | plant a type error, `echo 'const zz: number = "x";' >> src/main.ts`, and rerun: `tsc` reports the error and `npm run build` exits non-zero; `git checkout src/main.ts` restores (the P1 role-table corruption does not bite here: every `gen:*` step still exits 0) |

### U3 repo settings, git index, local branches (S, grade l1; the `gh repo edit` line needs a repo admin)

Debt rows: D1, C4 + P1 (squash-only, ruled), P2 (local half). Rulings: `.sdlc/questions/adopt-a5-conflicts.md` C6 and D1 (all seven `.claude/ops` files untracked, `friendlies.json` and `held-items.md` included), P1 (squash only on GitHub). Remote branch deletion, branch protection, and `delete_branch_on_merge` are not ruled and stay out (debt C4, P2 remote half).

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | the seven `.claude/ops` files are untracked, still on disk, and ignored (D1, C6) | `git ls-files .claude/ops \| wc -l; ls .claude/ops/friendlies.json .claude/ops/held-items.md .claude/ops/plan.md \| wc -l; git status --short \| grep -c '\.claude/ops'` | `0`, `3`, `0` | `origin/main`: `7`, `3`, `0`; in a scratch tree, `sed -i '' '/^\.claude\/ops\/$/d' .gitignore` (delete the line by content, since U2 edits the file and line numbers move) makes the third count `7` (the files reappear as untracked) |
| 2 | the untrack is one commit that removes index entries only | `git log origin/main..HEAD --diff-filter=D --name-only --format= -- .claude/ops \| wc -l; git log origin/main..HEAD --format=%s -- .claude/ops; sha=$(git log origin/main..HEAD --format=%H -- .claude/ops); git show --stat --format= "$sha" \| grep -c '\|'` | `7`, one subject, then `7` (the commit touches exactly seven paths) | a commit that also edits any other path makes the last count exceed `7`; the `--diff-filter=D -- .claude/ops` count alone would hide that |
| 3 | GitHub allows squash only (P1) | `gh api repos/:owner/:repo --jq '[.allow_squash_merge,.allow_merge_commit,.allow_rebase_merge]'` | `[true,false,false]` | before the edit the same call prints `[true,true,true]` (recorded in `.sdlc/debt.md` C4); `gh repo edit --enable-merge-commit=true` restores it, so the change is reversible |
| 4 | the 15 gone local branches are pruned; `main` and `sdlc/adopt` remain (P2) | `git fetch -p; git branch -vv \| grep -c ': gone\]'; git branch --list main sdlc/adopt \| wc -l; git branch \| wc -l` | `0`, `2`, at most `28` (the pre-plan count is `43`, recorded 2026-09-16) | before the prune `git branch -vv \| grep -c ': gone]'` prints `15` and `git branch \| wc -l` prints `43`; `git worktree list` shows none of the 15 checked out (a checked-out branch refuses `-D`) |
| 5 | remote branches untouched by this unit | `git branch -r \| wc -l` before and after | the same number both times (`42` at plan time, which includes `origin/HEAD`) | any drop means a remote delete happened, which is outside this unit |

## Risks and assumptions

| Risk | Handling |
|---|---|
| U1 and U2 both touch `.claude/`, but disjoint files; U1's only `.claude/` edits are the `project-docs` table cells and the two moves out of `.claude/` | merge order does not matter; a conflict on merge is a scope breach, not a rebase job |
| `.worktrees/` is walked by the branding gate until U2 lands | builders run `npm test` inside their own `.worktrees/<unit>` (no nested worktrees there); the Orchestrator does not run `npm test` in the root checkout until U2 is merged |
| the `.gitattributes` `-diff` flag hides generated diffs from `git diff`; CI's drift gate uses `git diff --exit-code`, which still reports a changed file under `-diff` (it prints "Binary files differ") | U2 criterion 12 plus CI on the PR prove the drift gate still bites |
| the describe-eval job will show red every Monday until the human adds `ANTHROPIC_API_KEY` | intended (decisions.md G6: the badge must stop lying); the human adds the secret with `gh secret set ANTHROPIC_API_KEY` when ready |
| `.claude/settings.json` shows a working-tree modification (a key reorder that predates A2, verdicts/architecture row 3) | not part of this plan; it stays unstaged and never enters a unit commit |

## Dropped from the debt list, and why

| Item | Why |
|---|---|
| G2 header line in `scripts/gen-figma-ui.mjs` | `scripts/` is outside the scope wall; it regenerates the 3.8 MB `ui.html` and pulls the build gate into a docs unit. Stays as debt G2 (half) |
| G4 option "delete `gen-font-test.mjs`" | same wall; the README mention was the other ruled option |
| `delete_branch_on_merge` | not ruled (P1 asked squash-only); stays debt C4 |
| remote branch deletes (58 merged, ops plan item 1) | outward-facing; stays a human sweep (debt P2) |
| R3 drawer label, R2 `hostedMcp`, R9, R10, K14, K17, G1, every H row | excluded by the debt map and the dispatch |

## Landing

**Before mobilizing (X1).** `.sdlc/` is untracked at f9e20c5, so a unit worktree branched from `sdlc/adopt` would have no `.sdlc/` at all. The Conductor commits the whole `.sdlc/` record (survey, architecture, baseline, records, verdicts, questions, adapter, debt, this plan) to `sdlc/adopt` in the approval commit, before any `worktrees.py add`. That is what makes U1 criteria 7, 9, and 12 and U2 criterion 1 checkable inside a worktree as written; they are not rewritten to point at the root checkout.

One PR from `sdlc/adopt` to `main`. It carries the whole adoption record under `.sdlc/` (survey, architecture, baseline, records, verdicts, questions, adapter, debt, this plan) plus the three unit commits and the board. The door is `.sdlc/adapter.md` §2.1 as ruled (C4): after the last unit verifies, the pre-land review writes `.sdlc/verdicts/adopt-hygiene-prepr.md` with `verdict: 🟢` and `sha: <branch head>`; the Orchestrator proves the gate with

```
python3 /Users/kimba/Projects/nonoun/sdlc-orchestration/plugins/sdlc/scripts/adapter.py land --branch sdlc/adopt --gate .sdlc/verdicts/adopt-hygiene-prepr.md --dry-run
```

(exit 0, JSON naming the branch and the verdict path; a stale `sha` or a missing record exits 2), then opens the PR per `shipping-changes` steps 5 and 6 (`--body-file`, title `chore(sdlc): adopt the sdlc plugin and close the A7 hygiene debt`), polls `gh run list --branch sdlc/adopt` until a run id exists and `gh run watch <id> --exit-status` reports `success` for both `build-test` and `panda-smoke`, squash-merges per step 7, syncs local main per step 8, and closes the ticket with `adapter.py close <id> --reason .sdlc/verdicts/adopt-hygiene-prepr.md`. Then it applies §5 to this plan itself: status `done`, revision row `closed on landing of PR #<n>`, file moved to `.sdlc/plans/archive/`. With U3 landed the squash is the only merge style GitHub offers, so the merge command cannot silently produce a merge commit.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-16 | plan written (draft) from debt.md §A7 candidates and adapter.md §8 | A7 dispatch |
| 2026-09-16 | 14 tweaks from `.sdlc/verdicts/adopt-hygiene-plan.md` applied: X1 approval commit in Landing; X2/P1 status count excludes the settings reorder; P2 control reads `origin/main` tree; P3 planted-edit control; U1-6 counts and revision-row note; U1-12 line ref; U2-3 literal count grep; U2-7 `--`, baseline 28, adia + binder paths; U2-12 `npm ci` and type-error control; U3-1 delete by content; U3-2 `show --stat` count; U3-4 pre-plan count 43; U3-5 remote count 42 | criteria review 🟡 |
