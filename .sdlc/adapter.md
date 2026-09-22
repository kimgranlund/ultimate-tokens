---
kind: adapter
repo: ultimate-tokens
written: 2026-09-16
head: f9e20c5
branch: sdlc/adopt
unit: A5
inputs: .sdlc/survey.md, .sdlc/verdicts/survey.md, .sdlc/architecture.md, .sdlc/verdicts/architecture.md, .sdlc/records/decisions.md, .sdlc/verdicts/records.md, .sdlc/baseline.md, .sdlc/questions/adopt-a3-drift.md
status: approved, conflicts ruled 2026-09-16 (.sdlc/questions/adopt-a5-conflicts.md)
---

# Adapter: how sdlc composes with the ultimate-tokens harness

**This file wins.** Where `.sdlc/adapter.md` and an sdlc plugin default (a skill, an agent prompt, `adapter.py`, a git hook) disagree, this file rules (adopt-repo: "Repo-adapter wins"). Where this file and the repo's own harness (`.claude/CLAUDE.md`, its skills, agents, hooks) disagree, section 4 lists the conflict and its resolution; a row marked needs-human is not in force until the human answers.

Facts below come from the graded survey, architecture, records, and baseline. Nothing here was measured fresh; the citations say where each fact was proved.

**Amendment (2026-09-18).** `.sdlc/baseline.md` was rerun and is the only record that carries measured gate numbers. This file points at it and copies only the rounded time ranges, which `sh .sdlc/checks/baseline-agrees-check.sh` compares against it. `.sdlc/architecture.md` and `.sdlc/debt.md` were not re-derived and still cite `f9e20c5`; each opens with a staleness note, and a plan that touches a path they cite re-checks the citations it relies on at its own head (the note gives the command). Survey claim ids cited in this file and in `debt.md` (C1 to C14) are the 2026-09-16 grading's, readable with `git show 180eca0:.sdlc/verdicts/survey.md`. The 2026-09-18 grading renumbered them: byte-stability moved from C13 to C11, and C13 is now the local-only ignore rules.

## 1. Gates

Every builder runs the gates in its unit worktree, never in the root checkout: `npm test` and `npm run build` rewrite committed generated files (`figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/categories/*.js`), so a run in a tree another seat is editing corrupts that seat's diff (architecture P7, K9). Every verifier reruns them itself; a handoff's `Ran` row is evidence for the reviewer, never for the verdict.

| Gate | Command | Needs | Green means | Time (rounded from `.sdlc/baseline.md`) | Who runs it |
|---|---|---|---|---|---|
| test | `npm test` | Node 24. No `node_modules`, no browser (survey C1 🟢) | exit 0 and the runner's last line reads `all N test files passed`, where N is the length of `TESTS` in `test/run.mjs` (the last measured N is in `.sdlc/baseline.md`; a unit that adds a test file raises N and must register it in TESTS, K17). Then `git status --short` is empty: every asset `npm test` regenerates is byte-stable (survey C11 of 2026-09-18, CI drift gate). `src/ui/type-fonts.js` is outside that set, because `npm test` never runs `gen:type-fonts`; the fonts row below is its gate | 56 to 60 s baseline; **revised #681 U6 (review pass 6 N9)**: 90 to 175 s wall observed, host-contention-sensitive - see the note below the table | builder every pass; verifier every verdict; CI |
| build | `npm run build` | `node_modules` from `npm ci` (C2 🟢); without it `tsc: command not found`, exit 127 | exit 0, `tsc` strict passes (the only static check; there is no lint script, baseline §Lint), `figma/plugin/ui.html` written, tree clean after | 1 to 3 s warm | builder when the unit touches TypeScript, `vite.config.js`, `scripts/`, bundled fonts, or `package*.json`; verifier at pre-land always; CI |
| smoke | `npm run smoke` | `node_modules` plus a Chrome binary (runs `npm run build` first, #564) | exit 0 and `SMOKE PASS` printed; screenshots in `smoke-out/` (gitignored) | 18 to 18 s | verifier for any unit touching `src/ui/`, `src/main.ts`, `scripts/bundle.mjs`, `scripts/gen-figma-ui.mjs`; CI always. Local Chrome exists on this Mac (C3 🟢); a host without Chrome lets CI be the smoke gate |
| corpus-contrast | `npm run gate:corpus-contrast` | Node 24. No `node_modules`, no browser; reads the committed `src/ui/categories/*.js` mirrors, so run it after `npm test` has regenerated them | exit 0 and the last line reads `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color`, over all 343 curated documents x 3 tone modes = 22680 accent-on-color cells (#674). `npm test` already runs the same gate SAMPLED (brands.json in full plus one deterministic volume per gallery category), so this is the full-corpus leg only | ~20 s (host-sensitive; 17-27 s observed, mirror parsing dominates) | CI (`corpus-contrast` job); builder or verifier when a unit touches the tonal ramp, `src/engine/semantic.js`, an on-color policy, or a category spec |
| fonts | `npm run gen:type-fonts` | nothing | tree clean after (K9 exception: `npm test` never runs this generator) | seconds | builder whenever a bundled font changes, in the same commit |
| ramp-identity | `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD)` | git; no `node_modules`, no browser | exit 0 and the last line reads `0 differing cells`. On a plan that declares a ramp movement, copy the six `identity <mode>[...]` lines into the verdict and compare them against the declaration rather than treating any nonzero reading as a fail | 22 to 54 s loud, stripped (the default, unanchored-path leg); about 104 to 150 s loud with `--authored` added, five times the cost (#715 U2) | builder and verifier of any unit touching `src/engine/`, `src/ui/model.mjs`, `src/ui/persist.js` or `src/ui/categories/`, adding `--authored` when the unit touches the anchored construction; pre-land always |

Rules the gates imply:

- **`npm test`'s budget moved, #681 U6 (review pass 6, N9).** `src/engine/hct.js`'s `maxChromaInGamut`/
  `peakC`/`oklchToCam16Hue` cache keys went from truncated (`.toFixed(2)`) to exact, closing a real
  order-dependence defect (#686) at the cost of fewer cache hits. Measured at corpus scale (343
  documents, 3,780 palettes, 3 tone modes, fresh cold process per measurement, CPU time, engine
  variants differing ONLY in the three keys): a real, repeatable **+21% CPU**, four clean pairs, no
  inversions — corroborating an independent reviewer's own +26%/+32% corpus-scale finding. Raising
  `CACHE_CAP` (5,000 to 60,000) did not help. `npm test`'s own total moved with it, but the WALL-CLOCK
  figure is additionally, and heavily, host-contention-sensitive on this dev machine (many concurrent
  unit worktrees/agents): repeated post-fix runs measured 1:34 to 2:51 total, 97.99s to 173.89s user
  CPU. This is the repo's own rule in practice — a change invalidating a record repairs that record in
  the same change — and the 58-62s figure at `7faf3aa` no longer holds once #686 is fixed; a clean,
  quiet-host re-measurement on `main` after this unit lands would tighten the range above.
- A red `npm test` in a unit worktree is the unit's own red until proven otherwise; `flaky-gates` is the triage skill when several agents run gates at once (three baseline runs showed no flake).
- The verifier's criterion 1 on every unit is `npm test` green on the branch head, with the negative control the baseline verdict used (corrupt `docs/reference/data/role-table.json`, expect 17 FAIL).
- `npm run build` in a unit worktree needs `node_modules`: symlink the root checkout's `node_modules` into `.worktrees/<unit>` (the `shipping-changes` worktree practice) or run `npm ci` there. Never commit it (K15).

## 2. Branch and PR

| Item | Ruling | Source |
|---|---|---|
| Base | `main`. Plan branches start from the freshest remote main: `git fetch origin && git branch plan/<slug> origin/main`. Never commit to `main` directly | `shipping-changes` step 1; mode-rules |
| Plan branch | `plan/<slug>`, one per plan. Unit worktrees branch from it (`worktrees.py add <unit> --plan <slug>`) and merge back into it locally after their verdict | plan-rules, mode-rules |
| Repo prefixes | `feat`, `fix`, `docs`, `chore` prefixes are the PR-title grammar, not a branch rule. The PR title becomes the squash subject, so it is written `feat(scope): summary` / `fix(scope): summary` | survey §Authorship, `shipping-changes` step 5 |
| Merge | Squash-merge is the practice (48/50 recent subjects end `(#NNN)`), not enforced: the repo allows squash, merge commit, and rebase, and `main` has no branch protection (survey C5 🟢, C6 🟡). `.claude/workflow.json` records `merge.style: squash` | verdicts/survey |
| CI on a PR | Two jobs must both report `success`: `build-test` (npm ci, build, test, generated-artifact drift gate `git diff --exit-code`, smoke, screenshot artifact) and `panda-smoke` (`node scripts/smoke-panda.mjs`, needs registry access). `deploy` runs only on a main push. With no branch protection, `gh pr merge` merges a red PR without complaint, so the conclusion is checked by hand: `gh run view <run> --json conclusion --jq .conclusion` must print `success` | `.github/workflows/ci.yml`; `shipping-changes` steps 6 and 7 |
| CI watch quirk | A bare `gh pr checks --watch` right after `gh pr create` false-greens ("no checks reported", exit 0). Poll `gh run list --branch <branch>` until a run id exists, then `gh run watch <id> --exit-status` | `shipping-changes` §gh quirks |
| PR body | Plan summary plus the pre-land verdict table, ending with the exact line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Always passed as `--body-file` (backticks in an inline `--body` get shell-evaluated) | `shipping-changes` §Trailers, §gh quirks |
| Commit trailers | `Co-Authored-By: <the running model's attribution line>` on every commit (see conflict X8 for which string). A commit that stages `.sdlc/board.md` also carries `Seat: orchestrator` (section 3) | harness attribution reminder; sdlc `commit-msg` hook |
| After merge | `git switch main && git fetch origin && git merge --ff-only origin/main`; delete the plan branch locally with `-D` (a squash leaves it "unmerged") and remotely with `gh api -X DELETE repos/:owner/:repo/git/refs/heads/<branch>` (`--delete-branch` fails when `main` is checked out in the primary worktree) | `shipping-changes` step 8, §gh quirks |

**Amendment (2026-09-17).** U3 set the repository to squash-merge only (`allow_merge_commit` and `allow_rebase_merge` false, ruling P1), so the Merge row's "not enforced" no longer holds; `main` still has no branch protection.

### 2.1 Landing: `shipping-changes` and `adapter.py land` composed

`shipping-changes` is the landing procedure of record. sdlc adds two things in front of it and one door through it:

1. **Pre-land review first.** After the last unit on `plan/<slug>` verifies, the Verifier seat dispatches `<plan>-prepr-reviewer` (reviewer-l4) and `<plan>-prepr-verifier` (verifier-l3) per `pre-land-review` and writes `.sdlc/verdicts/<plan>-prepr.md` with `verdict: 🟢` and `sha: <plan branch head>`. The verifier's baseline gates for this repo are test and build, plus smoke when `src/ui/` changed (section 1).
2. **Draft PR at first verified unit.** `adapter.py land --branch plan/<slug> --draft --title "<feat(scope): …>" --body-file <body>` pushes and opens a draft PR (no gate needed). CI runs on it from then on.
3. **Final landing goes through the adapter's gate check, then the repo's merge practice.** `adapter.py land --branch plan/<slug> --gate .sdlc/verdicts/<plan>-prepr.md` refuses a missing record, a stale `sha`, or a non-🟢 verdict; a new commit on the branch invalidates the record. What happens after the gate is conflict X4 (the adapter merges with a merge commit and does not wait for CI; the repo squash-merges after a CI conclusion check). Until the human rules, the Orchestrator runs `adapter.py land … --gate … --dry-run` to prove the gate, watches CI to `success` per the quirk above, then squash-merges per `shipping-changes` step 7, then syncs main per step 8.
4. **Ticket close.** `adapter.py close <id> --reason .sdlc/verdicts/<plan>-prepr.md` after the merge is confirmed by `gh pr view <n> --json state,mergedAt`.

**Amendment (2026-09-20).** Item 1 said `reviewer-l3` until this date and says `reviewer-l4` now, edited in place. The plugin's `pre-land-review` skill names `reviewer-l4` (fable) beside `verifier-l3` (fable) so that the pre-land pair never shares a model family with any builder grade (l1 to l4 sonnet, l5 to l7 opus; `reviewer-l3` is opus and would share a family with l5 to l7), and l4 is what ran at the records-refresh and k17-rerun pre-lands (`.sdlc/verdicts/records-refresh-prepr.md`, `.sdlc/verdicts/k17-rerun-prepr.md`). This file wins over plugin defaults, so the stricter pair is now the ruled one, not an accident of dispatch. Records written before this date that say `reviewer-l3` for a pre-land are history and were not rewritten.

### 2.2 Proposed `.sdlc/config.json`

No config file exists (adapter defaults to preset `local`), yet the repo is GitHub-native for tickets (ADR-017) and PRs. Proposed, pending conflict X3 and X4:

```json
{ "preset": "github", "baseBranch": "main", "github": { "repo": "kimgranlund/ultimate-tokens", "remote": "origin" } }
```

Tokens stay in `gh auth`; a `token` key is refused by the adapter.

**Amendment (2026-09-17).** `.sdlc/config.json` is committed with exactly this preset, by U2.

## 3. Hooks and guards

| Guard | Where it bites | What it does | sdlc consequence |
|---|---|---|---|
| `git-precommit-privatedocs-guard` | Claude Code `PreToolUse` on `Bash` (`.claude/settings.json`), script `.claude/hooks/git-precommit-privatedocs-guard.mjs` | Blocks any Bash command matching `git … commit` when `git status --short` shows a path under `.claude/docs/other/`; exit 2, message says to `git restore --staged`. Selftest: `node .claude/hooks/git-precommit-privatedocs-guard.mjs --selftest` | Fires for every seat's commits. Does not fire on `adapter.py land` (its git calls run inside python, the Bash command has no `git commit`); the landing merge stages only branch content, so nothing private can enter there. Never bypass with `--no-verify` |
| `.claude/docs/other/` | `.git/info/exclude` line 1 (not `.gitignore`) | The private working folder; ~1.7 MB local scratch, never tracked (K15 🟢, `git log --all` shows no commit) | Seats never read it speculatively (`project-docs`), never cite it in a plan, handoff, or verdict, never copy it into a worktree |
| `node_modules` | `.gitignore` line 1; `shipping-changes` guard | Ignored and de-tracked; re-tracking it is the exit-194 regression | `git ls-files | grep -c node_modules` must print 0 in every handoff; a symlinked `node_modules` in a unit worktree is fine because it is ignored |
| `test/repo/branding.mjs` | Inside `npm test` (`test/run.mjs` TESTS) | ADR-015 gate: walks every tracked-extension text file under the repo root except `.git`, `node_modules`, `dist`, `other`, `worktrees`, `.git-worktrees`, and fails on the retired maker name in uppercase, its `.io` domain, and the pre-rename element identifier outside a five-file allowlist. `decision-records.md` and the changelogs are exempt as RECORDS | **Every file under `.sdlc/` is scanned** (`.sdlc` is not a skipped dir). Verdict G7 🔴: cards and decisions.md tripped it and were scrubbed. Rule: a card, verdict, handoff, question, or plan under `.sdlc/` paraphrases ("the retired maker brand", "the pre-rename tag") and never quotes the banned strings, even when the source ADR does. `npm test` red with a `branding` line is this, not the code |
| Generated-artifact drift | CI `build-test` step "Generated artifacts match committed" | `git diff --exit-code` after build plus test | A builder who edits a source that feeds a generator commits the regenerated files in the same commit (they come out of the `npm test` it just ran). Hand-editing `figma/plugin/ui.html` or `src/ui/*-assets.js` is a defect (K9) |
| sdlc `commit-msg` | `core.hooksPath` = the sdlc plugin cache `githooks/` (installed by `session.sh up`) | A commit staging `.sdlc/board.md` needs a `Seat: orchestrator` trailer; a commit whose staged set is only the board also needs `Board-only: <why>` (merge commits exempt) | Builders never stage the board. The Orchestrator commits it with `git commit --trailer Seat:orchestrator` alongside the plan checklist or verdict that changed |
| sdlc `pre-commit` / `pre-merge-commit` | same `hooksPath` | When the board is staged, `board.py check` must agree with the staged plan checklists | Board rows and checklist marks move in the same commit |
| sdlc `no-seat-subagents`, `message-discipline` | Plugin `PreToolUse` on `Agent` and `SendMessage` | Refuse a seat spawned as a subagent; refuse a peer message with a table row, more than 6 lines, or more than 700 characters | Peer messages point at documents; the document carries the table |
| `.sdlc/runtime/` | plan-rules says gitignored; the repo's `.gitignore` does not list it yet | `worktrees.json`, `preview.json` are per-checkout state | A7 adds `.sdlc/runtime/` and `.sdlc/.fake-tickets/`, `.sdlc/.fake-releases/` (selftest scratch) to `.gitignore` |
| `.worktrees/` | `worktrees.py add` creates `.worktrees/<unit>` inside the repo root; not in `.gitignore` (only `.git-worktrees/` is) and not in the branding gate's skip list (only `worktrees` and `.git-worktrees`) | A unit worktree is a full nested copy of the repo | Until A7 adds `.worktrees/` to `.gitignore` and to `SKIP_DIRS` in `test/repo/branding.mjs`, an `npm test` in the root checkout walks every nested worktree, and `git status` in the root shows `.worktrees/` as untracked. Either fix lands in A7; a seat that sees `?? .worktrees/` in `git status` leaves it unstaged |
| `.claude/ops/` | `.gitignore` line 14 ignores the dir; 7 files under it are tracked (C8 🟡) | Ops-family (harness plugin) coordination state from July, plus live lock files | Conflict X6 |

**Amendment (2026-09-17).** U2 added `.worktrees/` to `.gitignore` and to `SKIP_DIRS` in `test/repo/branding.mjs`, so a root-checkout `npm test` no longer walks nested unit worktrees; U3 untracked the seven `.claude/ops/` files (X6) and set the GitHub repo to squash-merge only (P1).

**Amendment (2026-09-17, second).** U2 also added `.sdlc/runtime/`, `.sdlc/.fake-tickets/`, and `.sdlc/.fake-releases/` to `.gitignore`, closing the `.sdlc/runtime/` row above.

**Amendment (2026-09-18).** `.gitignore` now carries `.claude/settings.local.json` and `.sdlc/launcher.env`. Before this the first was ignored only by one machine's user-global git ignore file and the second only by one clone's `.git/info/exclude`, so a fresh clone protected neither (survey verdict C13 of 2026-09-18). The local rules stay where they are and are now redundant.

## 4. Conflicts: existing agent instructions vs sdlc

Thirteen rows. Four need the human. A row's resolution is in force once the human approves the list (adopt-repo: the Conductor gets approval on the A5 conflict list through `AskUserQuestion`).

| # | existing instruction | sdlc default | proposed resolution | needs human |
|---|---|---|---|---|
| X1 | `.claude/CLAUDE.md` Always: "`npm test` green before treating a change as done (and `npm run build` if you touched the build chain)". The change's author decides done | A unit is done when the Verifier's verdict is 🟢; the builder's own gate run is evidence, not a verdict | Both hold, layered: the builder must have `npm test` (and build when applicable) green before writing its handoff, and the verifier reruns the same gates as verdict criterion 1 with a negative control. "Done" in sdlc vocabulary is the verdict; CLAUDE.md's line stays as the builder's floor. The `## SDLC` section (section 7) says so | no |
| X2 | `change-reviewer-agent` (opus, preloads `building-editor-sections` + `shipping-changes`): reviews a diff against this repo's invariants in a fixed priority order (privacy, role parity, Safari font quoting, SVG `fill:none`, headless-shim selectors, section routing, engine purity, override identity gate, tests + trailer); read-only, never runs build/test | `reviewer-l<n>` (grade follows the builder grade): fresh-context review of one builder's diff against its acceptance criteria and for correctness; generic prompt | `reviewer-l<n>` stays the seat, the checklist rides in the dispatch: every reviewer dispatch in this repo names `.claude/agents/change-reviewer-agent.md` §What to check as a required pass, in that order, and inherits its rule of never running build/test (the verifier does). `change-reviewer-agent` stays for the human's ad hoc use and is not dispatched by the Orchestrator (two reviews per unit is waste). The reviewer grade floor for units touching `src/engine/semantic.js`, `figma/`, or `test/ui/headless-boot.mjs` is l2 | no |
| X3 | ADR-017 and `.claude/CLAUDE.md` Layout: bugs and features are GitHub Issues minted by the docs plugin's `/file-bug` / `/file-feature`, labels `kind:bug` / `kind:feature` + `size:small` / `size:big`; `.claude/workflow.json` `backend: github`; `project-docs` answers "what's open" from `gh issue list` | `adapter.py create` (preset `github`) mints one issue per plan with `size:S|M|L` + `status:backlog`, refuses `--label size:*`/`status:*`, and swaps `status:*` labels on `set-status`; plan-rules kind values are `feature, defect, chore, incident, spike` | Same backend, two label families on one repo. Proposed: sdlc plan tickets carry `kind:<plan-rules value>` via `--label`, the adapter's `size:S|M|L`, and `status:*`; human-filed intake keeps ADR-017's `kind:bug|feature` + `size:small|big`. `project-docs` lists both. RULED: two families. The alternative was one amendment to ADR-017 mapping `small` to S/M and `big` to L and retiring `size:small|big` on new issues, which touches the docs plugin's intake. The human picks | ruled 2026-09-16: as proposed, see .sdlc/questions/adopt-a5-conflicts.md |
| X4 | `shipping-changes`: CI conclusion checked by hand (no branch protection), `gh pr merge --squash`, PR title is the squash subject, then ff-sync and branch delete | `adapter.py land --gate`: after the gate check it pushes, marks ready, runs `gh pr merge --merge --match-head-commit <head>` (a merge commit) and ff-syncs local main; it never waits for CI. mode-rules: "never call gh yourself" | Keep both gates: the pre-land record (adapter) and the CI `success` conclusion (repo). Options: (a) accept merge commits for plan branches and let the adapter merge; CI must still be watched to success by the Orchestrator before running `land` (recommended only if merge commits are acceptable in `git log`); (b) extend the plugin's `land_github` with a merge-style setting read from `.sdlc/config.json` (`"mergeStyle": "squash"`) and a CI-conclusion wait, then the adapter is the only door (recommended, a plugin change); (c) interim, already stated in §2.1: adapter `--dry-run` proves the gate, `shipping-changes` steps 6 to 8 do the merge. RULED 2026-09-16: (c) is the door; (a)/(b) are not adopted | ruled 2026-09-16: as proposed, see .sdlc/questions/adopt-a5-conflicts.md |
| X5 | `shipping-changes` §Guards: "there is no hook; you are the hook"; the skill says the repo "has no local git hooks" | `session.sh up` sets `core.hooksPath` to the plugin's `githooks/` (`commit-msg`, `pre-commit`, `pre-merge-commit`); the repo's `PreToolUse` privacy guard also exists (since 2026-07-31) | The skill's sentence is stale twice over. A7 rewrites it: "guards are the `PreToolUse` privacy hook plus, under sdlc, the plugin's board hooks via `core.hooksPath`; the content guards below stay manual". The guard checklist itself is unchanged and still runs by hand | no |
| X6 | Seven files tracked under `.claude/ops/` (`plan.md`, `held-items.md`, `friendlies.json`, `watch-checkpoint.json`, three `reports/*.md`, all dated 2026-07-25 to 07-29) while `.gitignore` line 14 ignores `.claude/ops/` as "sdlc live per-checkout coordination state" (C8 🟡) | sdlc keeps its own live state in `.sdlc/runtime/` (gitignored) and `.sdlc/board.md` (tracked, Orchestrator-only); it does not use `.claude/ops/` | The ignore rule is right and the seven tracked files predate it. Proposed: `git rm --cached` the seven in A7 so `.claude/ops/` is fully ignored (the harness plugin's ops seats regenerate `plan.md` and reports on demand). Removing tracked content is the human's call | ruled 2026-09-16: as proposed, see .sdlc/questions/adopt-a5-conflicts.md |
| X7 | `shipping-changes` §Trailers: a commit ends with the `Co-Authored-By` line only; nothing about seats | `commit-msg` requires `Seat: orchestrator` on any commit that stages `.sdlc/board.md`, and `Board-only: <why>` when the board is the whole staged set; `adapter.py land` (local mode) appends the Seat trailer to its merge message itself | Trailers stack. Builders: `Co-Authored-By` only, never stage the board. Orchestrator (or the Conductor in single-agent mode): `Co-Authored-By` plus `--trailer Seat:orchestrator` on board commits. The board never travels alone: stage the checklist or verdict that moved with it | no |
| X8 | `shipping-changes` §Trailers pins the exact string `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`; `change-reviewer-agent` step 7 checks for "the `Co-Authored-By` trailer" | The harness's attribution reminder names the running model (`Claude Fable 5.1` in this session); sdlc has no trailer rule of its own | The running model's attribution line wins; the skill's pinned string is stale each time the model changes. A7 rewrites the skill line to "the attribution line the harness reminder gives for the running model" and the reviewer keeps checking presence, not the model name | no |
| X9 | `.claude/CLAUDE.md` is the repo's own harness contract; the user-level contract says a change that invalidates a record repairs that record in the same change; no seat is named as its owner | sdlc seats treat CLAUDE.md as builder context (graded by the Verifier in A1 to A3) and adopt-repo A5 hands "a repo CLAUDE.md section" to A7's builder | Proposed: `.claude/CLAUDE.md` is edited only inside a unit the human approved (the A7 builder adds the `## SDLC` section from section 7; later edits are a unit with a criterion the verifier greps). No seat edits it ad hoc, and no peer message can authorize an edit. The human confirms this ownership | ruled 2026-09-16: as proposed, see .sdlc/questions/adopt-a5-conflicts.md |
| X10 | `docs/plan/` plans use `doc-type: plan`, `status: active | complete | abandoned`, steps as a table; PLAN-overhaul lived under `.claude/` before A7 moved it to `docs/plan/archive/overhaul-plan-2026-08-14.md`; nobody flipped any of them (G5) | plan-rules: `.sdlc/plans/<slug>.md`, `status: draft | approved | active | done | superseded`, `## Units` checklist, archive under `.sdlc/plans/archive/`, Orchestrator owns the checklist | Two homes, one closer (section 5). Legacy plans stay in `docs/plan/` with the repo enum and archive to `docs/plan/archive/` (human ruling Q4); new plans are sdlc plans in `.sdlc/plans/`. `complete` in the repo enum equals `done` in sdlc's. A7 closes the three legacy plans and moves PLAN-overhaul under `docs/plan/archive/` too | no |
| X11 | `shipping-changes` §Concurrency: fan-out worktrees at `/tmp/wt` off `origin/main`, symlink `node_modules`, copy only your files, remove after | `worktrees.py add <unit> --plan <slug>` creates `.worktrees/<unit>` inside the repo, branched from `plan/<slug>`, with a port slot for `npm run dev`; registry in `.sdlc/runtime/worktrees.json` | sdlc's registry wins for unit work (ports, preview pointer, reconcile). Two repo fixes ride A7: `.worktrees/` into `.gitignore` and into the branding gate's `SKIP_DIRS` (section 3). The `node_modules` symlink practice carries over into each `.worktrees/<unit>` | no |
| X12 | ADR-015 gate scans the whole tree; the repo's RECORDS exemption covers only `decision-records.md` and the two changelogs | ingest-records cards and verdicts quote records verbatim, including retired names (G7 🔴 happened) | The gate stays as is; `.sdlc/` is not added to the exemption (a new file must not quietly reacquire the old identifier, which is the gate's stated point). Rule for every seat: under `.sdlc/`, paraphrase the retired brand and pre-rename identifier; run `node test/repo/branding.mjs` before committing anything under `.sdlc/` | no |
| X13 | The repo carries harness, docs, teamwork plugins whose seats (`fleet-marshal`, `build-leader`, `issue-sorter`, `repo-cleaner`) also plan, build, triage, and clean, and `.claude/workflow.json` records the docs plugin's `gate: ["npm test"]` | The sdlc plugin's `settings.json` makes `sdlc:conductor` the main-thread agent; seats are conductor, orchestrator, verifier; only the adapter touches tickets, PRs, releases | In an sdlc session the sdlc seats own plan, build, verify, land; the other plugins' seats are dispatched only by an sdlc seat for a bounded job (intake via `file-bug`/`file-feature`, a `repo-cleaner` hygiene proposal) and never mint or land on their own. `workflow.json`'s gate list is consistent with section 1 and stays | no |

**Amendment (2026-09-19).** The conflict rows above were numbered C1 to C13 until this date and are X1 to X13 now, same numbers, same rows. `X<n>` is the prefix plan-rules reserves for an id the adapter itself mints; the plugin's `board.py ids` pre-commit check reads a `#`-headed table in this file as definitions and refuses a `C<n>` here, because `C` belongs to plans. A record written before this date that cites conflict C<n> (the A5 ruling in `.sdlc/questions/adopt-a5-conflicts.md`, the adopt-hygiene verdicts and handoffs, `.sdlc/tickets/T-0001.md`) means X<n>; those files are history and were not rewritten. Every `C<n>` still in this file is a survey claim id (the 2026-09-18 amendment above says which grading).

## 5. Plan-closing rule (human ruling 2026-09-16, decisions.md Q4)

The Orchestrator closes a plan on landing, in the landing commit or the one right after it, never later:

1. Flip the plan's status: `active` to `done` for an `.sdlc/plans/` plan, `active` to `complete` for a `docs/plan/` plan, with a revision row `| <date> | closed on landing of PR #<n> | last unit verified |`.
2. Tick every unit or step that shipped; a step that did not ship is moved to a new ticket and named in the revision row, so the archived file is a true record.
3. Move the file to that home's `archive/` (`.sdlc/plans/archive/` or `docs/plan/archive/`); the roadmap row and the ticket keep the link.
4. `adapter.py close <ticket> --reason <pre-land verdict path>`; the board row moves to 🟢 in the same commit under `Seat: orchestrator`.

In single-agent mode the Conductor runs these steps. A plan whose PR merged without this step is a G5 recurrence and goes on the board as 🟡 until closed. A7 applies steps 1 to 3 to the three legacy plans (PLAN-export-schema, PLAN-adia-exports, PLAN-overhaul) as ruled.

## 6. Records

ADRs are sections of one file, `docs/reference/references/decision-records.md`, format Context, Decision, Rationale, Consequences, Status, numbered `## ADR-NNN — title`. New ADRs append after ADR-022 and before the closing `## Quick map` section (line 654 at f9e20c5). The file is exempt from the branding gate, so it may name what it retires; a card about it under `.sdlc/` may not (X12). An accepted ADR is append-only: a change is a dated amendment line or a superseding ADR, never a rewrite.

The human ruled all three stubs (Q7). Each is one paragraph a builder pastes; the A7 unit (or a docs unit the Conductor splits from it) lands them.

| id | goes to | stub text |
|---|---|---|
| ADR-023 (G2) | `decision-records.md`, new section after ADR-022, heading `## ADR-023 — Scrims are one 500-based alpha ramp, mode-flat (records the ADR-004 supersession)` | **Context.** ADR-004 put the seven scrim roles on base 750; a note inside it (2026-06-17) records that this was superseded, but the live model has no record of its own. **Decision.** A scrim is `500-{step}`: the palette's 500 color at alpha% = step/10, 3-digit padded (ADR-006), identical in light and dark. All twelve scrim-using roles (the seven `scrim*` strengths plus outline and the container Low/High family) resolve onto that ramp; bases 250 and 750 stay raw primitives. **Rationale.** One saturated mid base reads as the same overlay in both modes; a per-mode base made scrims flip tone with the theme. **Consequences.** `src/engine/semantic.js` emits every scrim ref as `500-NNN`; any change moves `role-table.json`, the binder table, and the count gates in lockstep (ADR-018). **Status.** DECIDED (as-built since 2026-06-17; recorded 2026-09-16). Supersedes ADR-004. |
| ADR-024 (G3) | `decision-records.md`, new section after ADR-023, heading `## ADR-024 — vite is the dev server and type check; bundle.mjs is the shipped artifact (rules the split ADR-010 and ADR-020 imply)` | **Context.** ADR-010 says "no build step" and ADR-020 rejects vite for the single-file bundle, yet `vite` runs in `npm run dev`, `npm run preview`, and inside `npm run build` (`tsc` then `vite build`). The split was implied, never ruled (verdict G3). **Decision.** vite serves development (`dev`, `preview`) and, with `tsc`, is the static check inside `build`; its output under `dist/` is never deployed or shipped. `scripts/bundle.mjs` alone produces the shipped artifact `dist/ultimate-tokens.html`, which CI copies to Pages and `gen-figma-ui` wraps into the plugin. **Rationale.** ADR-010's "no build step" means no toolchain is needed to run the artifact, not to author it; ADR-020's byte-parity bar keeps the inliner. **Consequences.** A change to `vite.config.js` cannot alter what ships; a module reachable from the app must still be registered in `bundle.mjs` MODS/KEY (K7). `npm test` stays vite-free. **Status.** DECIDED (as-built; recorded 2026-09-16). Amends ADR-010 wording; complements ADR-020. |
| PRD stub (G1) | new file `docs/prd/prd-0001-app-shell.md` (the `project-docs` table already reserves `docs/prd/` for PRD-*; its "not present yet" cell flips in the same change), frontmatter `doc-type: prd`, `id: prd-0001-app-shell`, `status: stub`, `date: 2026-09-16` | **Why this exists.** `docs/reference/app-shell-patterns.md` and `docs/site/storage-and-sync-spec.md` cite goals PRD-G1 to PRD-G7 whose source document was never written (gap G1). This stub is that source, recovered from the citing spec, so the ID spine resolves. **Goals.** G1 a standard shell skeleton for create/configure/analyze tools; G2 a stable spatial contract of fixed regions with fixed roles; G3 one document exposing multiple editable facets (sections) in one editor; G4 continuous-tuning edits that stay responsive and keep focus, caret, and scroll; G5 orientation and status always visible; G6 user-controlled density without losing the way back; G7 design-system-agnostic structure. **Status.** Stub: goals transcribed verbatim from `app-shell-patterns.md` §PRD goals; users, non-goals, and success measures are owed and tracked as debt (A6). |

Cards under `.sdlc/records/cards/` for the two ADRs are written by the same unit; `.sdlc/records/index.md` and `decisions.md` gain rows for ADR-023, ADR-024, and PRD-0001.

## 7. Proposed `## SDLC` section for `.claude/CLAUDE.md`

Text only. A builder adds it in A7 (conflict X9 rules who edits the file). Insert after `## Shipping`, before `## Always`.

```markdown
## SDLC

This repo runs under the `sdlc` plugin (`sdlc@nonoun` in `.claude/settings.json`). `.sdlc/adapter.md`
is the contract between the plugin and this harness and wins over plugin defaults; read it before
planning, building, or landing. The one-paragraph version:

- Seats: the Conductor talks to the human; the Orchestrator plans units, dispatches graded
  builders and reviewers in `.worktrees/<unit>` off `plan/<slug>`, and owns `.sdlc/board.md`
  (commits carry `Seat: orchestrator`); the Verifier's 🟢 verdict is what "done" means. A builder's
  own green `npm test` is its floor (see Always), not the verdict.
- Gates and what green means live in `.sdlc/adapter.md` §1 and `.sdlc/baseline.md`: `npm test`
  (no `node_modules`, ~60 s, tree clean after), `npm run build` (needs `npm ci`), `npm run smoke`
  (needs Chrome). Run them in the unit worktree, never in a tree another seat is editing.
- Tickets, PRs, and releases go through `adapter.py` (`.sdlc/config.json`, preset `github`); one
  ticket, one `plan/<slug>` branch, one PR per plan. Landing needs a 🟢 pre-land record
  (`.sdlc/verdicts/<plan>-prepr.md`) and green CI (`build-test` + `panda-smoke`), then the
  `shipping-changes` squash and sync steps. Human-filed bugs and features still go through
  `/file-bug` and `/file-feature` per ADR-017.
- The Orchestrator closes a plan on landing: status flipped, steps ticked, file moved to
  `docs/plan/archive/` or `.sdlc/plans/archive/`, ticket closed (`.sdlc/adapter.md` §5).
- New ADRs append to `docs/reference/references/decision-records.md` before its Quick map.
- `test/repo/branding.mjs` scans `.sdlc/` too: paraphrase the retired maker brand in every record,
  verdict, and handoff there. `.claude/docs/other/` and `node_modules` stay out of every commit.
```

## 8. What A7 inherits from this file

| Item | Action | Size |
|---|---|---|
| CLAUDE.md `## SDLC` | insert section 7 text | S |
| `.gitignore` | add `.sdlc/runtime/`, `.sdlc/.fake-tickets/`, `.sdlc/.fake-releases/`, `.worktrees/` | S |
| `test/repo/branding.mjs` | add `.worktrees` to `SKIP_DIRS` | S |
| `shipping-changes/SKILL.md` | rewrite the "no hooks" sentence (X5) and the pinned trailer string (X8); add one line pointing landing under sdlc at `.sdlc/adapter.md` §2.1 | S |
| `.sdlc/config.json` | write section 2.2 once X3/X4 are ruled | S |
| `.claude/ops/` | `git rm --cached` the seven tracked files if X6 is approved | S |
| Legacy plans | close and archive per section 5 (Q4) | S |
| Records | ADR-023, ADR-024, `docs/prd/prd-0001-app-shell.md`, cards, index rows (section 6) | M |

**Amendment (2026-09-17).** Every row above landed: CLAUDE.md, `.gitignore`, `SKIP_DIRS`, `shipping-changes`, and `.sdlc/config.json` by U2; `.claude/ops/` by U3; the legacy plans and the records by U1.
