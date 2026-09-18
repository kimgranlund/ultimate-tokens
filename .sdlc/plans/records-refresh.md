---
status: active
ticket: #691
priority: P1
lane: docs
size: S (U1 S = 1 point)
labels: kind:chore · size:S · lane:docs · mode:multi
written: 2026-09-18
head: 746f93d (`plan/records-refresh`, 4 commits over `cf8e61a`, not pushed); rebases onto `origin/main` @ 1ea2f80 before U1
branch: plan/records-refresh
inputs: .sdlc/questions/survey-2026-09-18-approval.md Q2, .sdlc/verdicts/survey.md (C9, C11, C13, C15 and its corrections line), .sdlc/survey.md, .sdlc/baseline.md, .sdlc/adapter.md §1 §3, .sdlc/debt.md, .sdlc/architecture.md
---

# Make the adoption records true at today's head: rerun the baseline, remove the copied stale numbers, put the two local-only ignore rules in the repo, and mark the two records that were not re-derived

The owner approved the "Small records unit" (approval Q2) and nothing more. `architecture.md` and `debt.md` are not re-derived. The survey, its verdict, and the approval doc are already committed on this branch and land with this plan as one PR.

Root cause this plan fixes, not only the symptom. The test count went stale because `adapter.md` and `debt.md` each carry a copy of a number that only `baseline.md` measures, and nothing compares the copies. Two test files were added over 16 commits and no record moved. So the copies go, `baseline.md` becomes the one home of measured numbers, and a check script compares what is left against the tree.

Scope wall. Only these paths change: `.sdlc/baseline.md`, `.sdlc/adapter.md`, `.sdlc/debt.md` (the P3 row and one note), `.sdlc/architecture.md` (one note), `.sdlc/checks/baseline-agrees-check.sh` (new), `.gitignore`, plus the unit's handoff and the Orchestrator's board and checklist. `.claude/CLAUDE.md` does not change: it carries no test count (measured: the stale-count sweep in U1 row 5 finds nothing under `.claude/`), and adapter C9 allows an edit there only inside a unit with a criterion for it. `.sdlc/survey.md` is a dated snapshot, already corrected in 33ee3b1. Verdicts, handoffs, archived plans, tickets, and questions are history and keep their numbers.

Branding rule (adapter C12). Nothing this plan writes quotes the retired maker brand or the pre-rename element identifier. No em dash in any added line.

Criteria ids follow the archived plan's shape (P rows for the plan, numbered rows per unit, cited as U1-3), because `C<n>` in this plan already means a survey claim.

## Before U1: rebase (Orchestrator)

`origin/main` moved from `cf8e61a` to `1ea2f80` while the survey was graded. In this worktree: `git fetch origin && git rebase origin/main`. Measured in a throwaway clone on 2026-09-18: clean, 4 commits over `1ea2f80`, every one touching `.sdlc/` only. The branch is not on the remote, so nothing is force-pushed. Then `worktrees.py add U1 --plan records-refresh`. If `origin/main` has moved past `1ea2f80` by then, rebase onto what is there and read every "1ea2f80" below as that sha.

## Criteria (plan-level: the standing gates of adapter §1, run by the builder, again by the verifier, again at pre-land)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/neg"`), never in the unit worktree (the 2026-09-18 survey verdict's practice). In every table cell below `\|` is the table's escape for a plain `|`: type it unescaped. Where a regex needs a literal pipe it is written `[|]`, so no cell depends on which way a backslash is read.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules` needed, tree byte-stable | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all N test files passed` where N is the `tests:` figure U1-1 prints (46 at plan time), then `0` | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test 2>&1 \| grep -c FAIL` prints a non-zero count (3 in the adopt-hygiene verdicts) |
| P2 | `npm run build` green, prints the size the baseline records, tree clean | `npm ci >/dev/null 2>&1; npm run build > "$CLAUDE_JOB_DIR/tmp/build.log" 2>&1; echo "exit $?"; grep -o 'ui.html [0-9.]* KB' "$CLAUDE_JOB_DIR/tmp/build.log"; grep -o 'ui.html [0-9.]* KB' .sdlc/baseline.md; git status --short \| wc -l` | `exit 0`, then the same `ui.html NNNN.N KB` string twice, then `0` | in the clone with no `node_modules`: exit 127, `tsc: command not found`. At 746f93d the two strings differ (`3753.6` built, `3695.6` recorded) |
| P3 | `npm run smoke` green (the rewritten baseline claims it at this head) | `npm run smoke 2>&1 \| grep -c 'SMOKE PASS'` | `1` | in the clone with no `dist/`: `node test/smoke/smoke.mjs` exits 1 with `smoke: missing dist/ultimate-tokens.html` |
| P4 | branding gate clean | `node test/repo/branding.mjs \| tail -1` | `clean (N files scanned)`, exit 0 | in the clone: `cp docs/reference/references/decision-records.md docs/x.md && node test/repo/branding.mjs \| tail -1` prints FAIL (the RECORDS exemption is by path) |
| P5 | scope wall: nothing outside `.sdlc/` and `.gitignore` differs from the merge base, so `.claude/CLAUDE.md`, `src/`, `test/`, `scripts/`, `mcp/`, `figma/` are untouched | `git diff --name-only $(git merge-base origin/main HEAD) \| grep -vcE '^\.sdlc/\|^\.gitignore$'` | `0` | `echo "// probe" >> src/engine/motion.mjs` in the clone and rerun: `1` (the command reads the working tree, so an uncommitted edit shows) |

## Units

- [~] U1 (S) rerun the baseline, remove the copied numbers, add the two ignore rules, state C11's scope, add the two staleness notes · grade l2 · reviewer-l1 · verifier-l1

Grade. The Orchestrator's table puts docs and config at l1, and `debt.md` grades every docs row L1. This unit goes one up, on the table's own evidence rule: it touches six files, its core job is transcribing nine measured runs without error, and three of the four l1 records units in adopt-hygiene needed a second pass. l2 keeps the l1 checker pair (reviewer-l1, verifier-l1). The reviewer dispatch names `.claude/agents/change-reviewer-agent.md` §What to check (adapter C2).

### U1 (S, grade l2)

Order matters, because the baseline must describe the tree before this unit edits it.

1. In the fresh unit worktree, which has no `node_modules`: note `uptime` and `sysctl -n hw.ncpu`. If the 1-minute load is above the core count (it was 19 on 10 cores when this plan was written), tell the Orchestrator and wait for a quiet slot. Timings taken under load are not a baseline.
2. `npm test` three times in sequence. After each: exit code, wall seconds (`/usr/bin/time -p`), the runner's last line, `git status --short | wc -l`.
3. `npm ci` once, then `npm run build` three times, then `npm run smoke` three times, recording the same four facts plus the `wrote figma/plugin/ui.html NNNN.N KB` line and the `SMOKE PASS` line.
4. Every run made is recorded. No run is dropped or retried away. A red run stops the unit: triage it with `flaky-gates`, write it under Fail or Flaky, and send the Orchestrator a question, because a baseline with a Fail row changes what green means for every later plan.
5. `gh run list --branch main --workflow ci.yml --limit 5 --json databaseId,headSha,conclusion` and take the run whose `headSha` is the `origin/main` sha the branch was rebased onto (35342720776 for `1ea2f80`, measured 2026-09-18).
6. Create `.sdlc/checks/baseline-agrees-check.sh` from the block below, byte for byte. Then make the edits in §Texts. Then run U1 rows 1 to 9 and P1, P4, P5.

The check script (written and measured by the planner on 2026-09-18; outputs are in the U1-1 control cell):

```sh
# The numbers in .sdlc/baseline.md agree with the tree they describe, and the adapter's
# time ranges agree with the baseline. Reads files and git only: no node_modules, no network.
# Usage: sh .sdlc/checks/baseline-agrees-check.sh   (from the repo root)
# A STALE head line on a later commit is expected: it says the tree moved since the baseline ran,
# so the numbers are unproven at that head, not that they are wrong.
node - <<'EOF'
const fs = require("fs"), cp = require("child_process");
const read = (f) => fs.readFileSync(f, "utf8");
const b = read(".sdlc/baseline.md"), a = read(".sdlc/adapter.md");
let stale = 0;
const say = (ok, line) => { if (!ok) stale++; console.log((ok ? "ok    " : "STALE ") + line); };
const row = (txt, head) => (txt.split("\n").find((l) => l.startsWith(head)) || "").split("|").map((s) => s.trim());
const tests = ((read("test/run.mjs").match(/const TESTS = \[([\s\S]*?)\];/) || ["", ""])[1].match(/"[^"]+\.mjs"/g) || []).length;
const bn = (row(b, "| `npm test` |")[5] || "").match(/all (\d+) test files passed/);
say(!!bn && +bn[1] === tests, `tests: baseline ${bn ? bn[1] : "none"}, test/run.mjs TESTS ${tests}`);
const kb = (read("figma/plugin/ui.html").length / 1024).toFixed(1);
const bs = (row(b, "| `npm run build` |")[5] || "").match(/ui\.html ([\d.]+) KB/);
say(!!bs && bs[1] === kb, `ui.html: baseline ${bs ? bs[1] : "none"} KB, tree ${kb} KB`);
for (const [cmd, gate] of [["npm test", "test"], ["npm run build", "build"], ["npm run smoke", "smoke"]]) {
  const t = (row(b, "| `" + cmd + "` |")[4] || "").split("·").map(Number);
  const m = (row(a, "| " + gate + " |")[5] || "").match(/(\d+) to (\d+) s/);
  const lo = Math.round(Math.min(...t)), hi = Math.round(Math.max(...t));
  say(t.length === 3 && t.every(Number.isFinite) && !!m && +m[1] === lo && +m[2] === hi,
    `time ${gate}: baseline ${lo} to ${hi} s, adapter ${m ? m[1] + " to " + m[2] + " s" : "none"}`);
}
const ref = (b.match(/^ref: .*@ ([0-9a-f]{7,40})\b/m) || [])[1];
let same = false, onMain = false;
if (ref) {
  try { cp.execSync(`git diff --quiet ${ref} HEAD -- . ":(exclude).sdlc" ":(exclude).gitignore"`, { stdio: "ignore" }); same = true; } catch (e) {}
  try { cp.execSync(`git merge-base --is-ancestor ${ref} origin/main`, { stdio: "ignore" }); onMain = true; } catch (e) {}
}
say(same, `head: baseline ref ${ref || "none"} has the same tree as HEAD outside .sdlc/ and .gitignore`);
say(onMain, `head: baseline ref ${ref || "none"} is in origin/main's history`);
console.log(`stale total: ${stale}`);
process.exit(stale ? 1 : 0);
EOF
```

#### Texts

`.sdlc/baseline.md` is rewritten whole, same sections and table shape as today. Front matter: `ran:` the run date; `ref: origin/main @ <the sha the branch was rebased onto>`; `host:` as today plus the load figures from step 1; a new line `supersedes: the 2026-09-16 baseline (git show 180eca0:.sdlc/baseline.md)`. The `ref` is a `main` sha on purpose: a plan-branch sha dies at the squash, which is how `architecture.md` and `debt.md` came to cite a head that is not in `main`'s history. The intro sentence says the runs happened in the unit worktree at the rebased plan head, whose tree equals the `ref` outside `.sdlc/` (U1-1 proves it). The Pass table carries the three new timings per command (`a · b · c`, the separator the script splits on), `all N test files passed`, and `wrote figma/plugin/ui.html NNNN.N KB` exactly as printed. The sentence under the table becomes:

```text
`git status --short` empty after every run: every committed asset that `npm test` and `npm run build` regenerate is byte-stable at this head. `src/ui/type-fonts.js` is not in that set. Neither chain runs `gen:type-fonts`, so a clean status says nothing about that file (survey verdict C11 of 2026-09-18, debt G1).
```

The Not-run-here line names the new CI run id and the same sha as `ref`, in the words `CI run <id> on <sha7>`. The old head, the old size, and the old run id appear nowhere in the file.

`.sdlc/adapter.md`, in-place edits in the §1 gate table only (four lines at most):

- Header cell `Time (baseline, main @ 7faf3aa)` becomes ``Time (rounded from `.sdlc/baseline.md`)``.
- The three Time cells become `A to B s` (test, smoke) and `A to B s warm` (build), where A and B are the rounded minimum and maximum of that command's three baseline timings. A cell whose range did not move stays as it is.
- In the test row's Green-means cell, the text from the space before `(N = 44 at baseline` through `(C13, CI drift gate)` becomes (so the cell reads ``passed`, where N is``):

```text
, where N is the length of `TESTS` in `test/run.mjs` (the last measured N is in `.sdlc/baseline.md`; a unit that adds a test file raises N and must register it in TESTS, K17). Then `git status --short` is empty: every asset `npm test` regenerates is byte-stable (survey C11 of 2026-09-18, CI drift gate). `src/ui/type-fonts.js` is outside that set, because `npm test` never runs `gen:type-fonts`; the fonts row below is its gate
```

The adapter carries no literal N afterwards. The verdict's correction asked for "46"; a second copy of the number is what went stale, so the cell names the source instead (measured: with this edit the row still parses and U1-6 prints `0` outside-table deletions).

`.sdlc/adapter.md`, two appended amendments, in the file's own `**Amendment (date).**` shape. After the paragraph that ends "where each fact was proved." and before `## 1. Gates`:

```text
**Amendment (2026-09-18).** `.sdlc/baseline.md` was rerun and is the only record that carries measured gate numbers. This file points at it and copies only the rounded time ranges, which `sh .sdlc/checks/baseline-agrees-check.sh` compares against it. `.sdlc/architecture.md` and `.sdlc/debt.md` were not re-derived and still cite `f9e20c5`; each opens with a staleness note, and a plan that touches a path they cite re-checks the citations it relies on at its own head (the note gives the command). Survey claim ids cited in this file and in `debt.md` (C1 to C14) are the 2026-09-16 grading's, readable with `git show 180eca0:.sdlc/verdicts/survey.md`. The 2026-09-18 grading renumbered them: byte-stability moved from C13 to C11, and C13 is now the local-only ignore rules.
```

At the end of §3, after the second 2026-09-17 amendment:

```text
**Amendment (2026-09-18).** `.gitignore` now carries `.claude/settings.local.json` and `.sdlc/launcher.env`. Before this the first was ignored only by one machine's user-global git ignore file and the second only by one clone's `.git/info/exclude`, so a fresh clone protected neither (survey verdict C13 of 2026-09-18). The local rules stay where they are and are now redundant.
```

`.gitignore`, appended at the end:

```text

# local-only files that must never reach a commit: per-user Claude Code settings, the sdlc launcher environment
.claude/settings.local.json
.sdlc/launcher.env
```

`.sdlc/debt.md` row P3, in place: the item cell becomes ``` `npm test` runs every `TESTS` entry serially as child processes, about a minute per run ``` and the where cell becomes ``` `test/run.mjs:23-25`; count and timings in `.sdlc/baseline.md` Pass ```. No other row changes.

`.sdlc/debt.md`, one paragraph after the intro paragraph and before `## Hot untested`:

```text
Staleness note (graded 2026-09-18). This map was built at `f9e20c5`, the head of `sdlc/adopt`. That commit is not in `main`'s history: the branch landed squashed as `180eca0` (PR #653), and the object is reachable only through `origin/sdlc/adopt`. The survey verdict of 2026-09-18 (`.sdlc/verdicts/survey.md` C15, graded at `cf8e61a`) found 16 of the 96 paths this file cites edited in `180eca0..cf8e61a`, and `main` has moved again since, so a line-anchored citation into an edited path is unverified at any later head. The map was not re-derived (owner ruling, `.sdlc/questions/survey-2026-09-18-approval.md` Q2). Rule: a plan that touches a path this file cites, or sizes a unit from a row here, re-checks each citation it relies on at its own head and records the result in the plan. `git diff --stat f9e20c5 HEAD -- <path>` prints nothing when the cited file is unchanged since this map was written. Where the `f9e20c5` object is absent, `git log --oneline 180eca0..HEAD -- <path>` is the fallback, and a weaker one: `180eca0` already differs from `f9e20c5` in ten files under `src/`, `test/` and `figma/`. Survey claim ids cited here (C5, C6, C8, C13) are the 2026-09-16 grading's, readable with `git show 180eca0:.sdlc/verdicts/survey.md`; the 2026-09-18 grading renumbered them.
```

`.sdlc/architecture.md`, one paragraph after the "Recovered from code at f9e20c5." paragraph and before `## 1.`: the same text with three changes. "This map was built at" becomes "This map was recovered at"; "16 of the 96" becomes "18 of the 72"; "or sizes a unit from a row here" becomes "or relies on a claim or a K control here". The last sentence (survey claim ids) is dropped, because this file cites none.

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | the baseline's test count, bundle size, and cited head agree with the tree, and the adapter's time ranges agree with the baseline | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` | seven `ok` lines, `stale total: 0`, `exit 0` | measured at 746f93d, script run from a scratch copy: `STALE tests: baseline 44, test/run.mjs TESTS 46`, `STALE ui.html: baseline 3695.6 KB, tree 3753.6 KB`, `STALE head`, `stale total: 3`, exit 1. Measured in a clone rebased onto 1ea2f80 with the three numbers fixed (46, 3763.2, ref 1ea2f80): `stale total: 0`; one timing changed to `99.9` prints `STALE time test: baseline 58 to 100 s, adapter 58 to 62 s`; a probe commit under `src/` prints `STALE head`; a size taken from the byte count instead of the build line (3798.0) prints `STALE ui.html` |
| 2 | the script is the plan's text, so a builder cannot pass row 1 by weakening it | `diff <(awk '/^\140\140\140sh$/{f=1;next} /^\140\140\140$/{f=0} f' .sdlc/plans/records-refresh.md) .sdlc/checks/baseline-agrees-check.sh && echo same` (`\140` is awk's octal for a backtick; the plan has exactly one `sh` fence) | `same` | change one character of the script: `diff` prints the hunk and `same` is absent. Before the unit the file does not exist and `diff` errors |
| 3 | the baseline is a full rerun: three runs of three commands, all exit 0, and no figure of the old baseline left | `grep -cE '^[\|] .npm (test\|run build\|run smoke). [\|] 3/3 [\|] 0 [\|]' .sdlc/baseline.md; grep -cE '7faf3aa\|34804556354\|3695\.6' .sdlc/baseline.md` | `3`, then `0` | at 746f93d: `3`, then `4`. A red run cannot produce `3/3`, so it fails the first count and the unit stops with a question (step 4) |
| 4 | the cited CI run is green on the cited head, and that head is the `main` commit the branch sits on | `git merge-base origin/main HEAD \| cut -c1-7; grep -oE '^ref: .*@ [0-9a-f]+' .sdlc/baseline.md \| grep -oE '[0-9a-f]+$' \| cut -c1-7; gh run view "$(grep -oE 'CI run [0-9]+' .sdlc/baseline.md \| grep -oE '[0-9]+')" --json headSha,jobs --jq '[.headSha[0:7], (.jobs[] \| select(.name=="build-test" or .name=="panda-smoke") \| .name + "=" + .conclusion)] \| join(" ")'` | the same seven-character sha three times, the third followed by `build-test=success panda-smoke=success` (for run 35342720776: `1ea2f80 build-test=success panda-smoke=success`, measured) | measured at 746f93d: `cf8e61a`, `7faf3aa`, `7faf3aa build-test=success panda-smoke=success`. The old baseline agrees with its own run, so the first line is what bites: the merge base is not the head the baseline cites. Run 34660177977 prints `build-test=failure`, so the jobs query can report red |
| 5 | no live record outside the baseline carries a test count (the "find them" sweep: `.sdlc`, `.claude`, `README.md`; history dirs and the dated survey excluded) | `git grep -nE '[0-9]+ test files\|runs [0-9]+ files\|N = [0-9]+ at' -- .sdlc .claude README.md ':!.sdlc/verdicts' ':!.sdlc/handoffs' ':!.sdlc/plans' ':!.sdlc/tickets' ':!.sdlc/questions' ':!.sdlc/survey.md' \| cut -d: -f1` | one line, `.sdlc/baseline.md` | measured at 746f93d: three lines, `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/debt.md`. Nothing under `.claude/` at either head, which is why CLAUDE.md stays out of scope |
| 6 | adapter: in-place edits stay inside the §1 gate table, no literal N and no old head remain, the two amendments sit where §Texts puts them | `MB=$(git merge-base origin/main HEAD); git diff $MB -- .sdlc/adapter.md \| grep -E '^-[^-]' \| grep -vcE '^-[\|] (Gate\|test\|build\|smoke) [\|]'; grep -cE 'N = [0-9]+\|7faf3aa' .sdlc/adapter.md; awk '/^# Adapter/,/^## 1\. Gates/' .sdlc/adapter.md \| grep -c 'Amendment (2026-09-18)'; awk '/^## 3\. /,/^## 4\. /' .sdlc/adapter.md \| grep -c 'Amendment (2026-09-18)'` | `0`, `0`, `1`, `1` | at 746f93d the last three print `2`, `0`, `0`. For the first: measured in a clone, one reworded §4 row (C12 "scans" to "walks") prints `1` |
| 7 | C11's real scope is stated where the records claim byte-stability, and the statement is true | `grep -E '^[\|] test [\|]' .sdlc/adapter.md \| grep -c 'gen:type-fonts'; grep -c 'type-fonts' .sdlc/baseline.md; node -e 'const s=require("./package.json").scripts; console.log(/gen:type-fonts/.test(s.test), /gen:type-fonts/.test(s.build), /gen:categories/.test(s.test))'` | `1`, `1` or more, `false false true` | at 746f93d the first two print `0`, `0`. The third `true` shows the same regex shape does see a generator that is in the chain; if a later change adds `gen:type-fonts` to either script the first two values flip and both records become false |
| 8 | both local-only rules come from the repo's `.gitignore`, and neither file is tracked | `for p in .claude/settings.local.json .sdlc/launcher.env; do git check-ignore -v "$p" \| cut -f1 \| cut -d: -f1; done; git ls-files .claude/settings.local.json .sdlc/launcher.env \| wc -l` | `.gitignore` twice, then `0` | at 746f93d in this checkout: the user-global ignore path and the `.git/info/exclude` path. Measured in a fresh clone at 746f93d: the `launcher.env` line is missing altogether. Measured with the rule in both `.gitignore` and `info/exclude`: `.gitignore` wins. `git check-ignore -v README.md` exits 1, and `git ls-files .claude/settings.json \| wc -l` prints `1`, so neither command matches everything |
| 9 | each not-re-derived record opens with one dated staleness note that quotes the verdict faithfully, states true facts, and carries the re-check rule; nothing else in either file changed except debt row P3 | `for f in architecture debt; do awk '/^## /{exit} /^Staleness note \(graded 2026-09-18\)\./{n++} END{print n+0}' .sdlc/$f.md; grep -c 'git diff --stat f9e20c5 HEAD' .sdlc/$f.md; done; grep -c '18 of the 72' .sdlc/architecture.md; grep -c '16 of the 96' .sdlc/debt.md; grep -c '18 of the 72.*16 of the 96' .sdlc/verdicts/survey.md; git merge-base --is-ancestor f9e20c5 origin/main; echo "ancestor $?"; git diff --name-only f9e20c5 180eca0 -- src test scripts mcp figma \| wc -l; MB=$(git merge-base origin/main HEAD); git diff $MB -- .sdlc/architecture.md \| grep -cE '^-[^-]'; git diff $MB -- .sdlc/debt.md \| grep -E '^-[^-]' \| grep -vc '^-[\|] P3 [\|]'` | four lines of `1` (note count and rule count, per file), then `1`, `1`, `1`, `ancestor 1`, `10`, `0`, `0` | at 746f93d the four note counts and the two quote counts print `0`. `git merge-base --is-ancestor 180eca0 origin/main` prints `ancestor 0`, so the ancestry test can say yes. The rule's own command is not vacuous, measured: `git diff --stat f9e20c5 HEAD -- src/engine/tonal.js` prints `113 insertions(+), 18 deletions(-)` and the same on `src/engine/hct.js` prints nothing |

## Risks and assumptions

| Risk | Handling |
|---|---|
| The host runs many agents (load 19 on 10 cores at plan time), so timings can come out inflated and a gate can go red from contention | step 1 waits for a quiet slot; a red run is recorded and triaged with `flaky-gates`, never retried away. The verifier's own single runs of P1 to P3 are a sanity read on the timings, not a criterion: a run outside half to double the recorded range is a 🟡 note |
| `origin/main` moves again after U1 verifies | the squash does not need another rebase (only `.gitignore` could conflict). If the branch is rebased anyway, rerun U1-1: a `STALE head` line sends the unit back for a baseline rerun, a `STALE ui.html` or `STALE tests` line likewise |
| After landing, U1-1's head line goes STALE at the next feature commit | intended and said in the script's header: it reports that the baseline is behind. It is a criterion only inside a plan that reruns the baseline |
| `f9e20c5` lives only on `origin/sdlc/adopt`; the remote branch sweep (debt P2, a human job) would make the head `architecture.md` and `debt.md` cite unrecoverable in a fresh clone | the notes give the `180eca0` fallback and say it is weaker. Whoever runs the sweep decides whether to keep that branch; not this plan's call |
| Records on this branch cite plan-branch shas (`8120ab4`, `c1c0a32`, `33ee3b1`) that the rebase rewrites and the squash drops | accepted, as for every unit sha on the adopt-hygiene board; the new baseline avoids the pattern by citing a `main` sha |
| The in-place adapter edit breaks the append-only habit the adopt-hygiene plan held the adapter to | the habit was that plan's criterion, not an adapter rule. The owner approved fixing the lines; U1-6 confines deletions to the gate table and both changes are recorded by dated amendments |

## Not in scope, and why

| Item | Why |
|---|---|
| Re-deriving `architecture.md` and `debt.md` | owner ruling Q2; re-checked per plan under the new rule |
| `.claude/CLAUDE.md` | no stale count in it; adapter C9 |
| `test/ui/counts.mjs` tracked and registered nowhere (verdict C9), debt K17 | a test-gate change, L2 in the debt map; the first plan that opens `test/` takes it with R12 |
| Rewriting old survey claim ids row by row in `adapter.md` and `debt.md` | one sentence in the amendment and in the note resolves them; a row-by-row rewrite is a re-derivation |
| The five unowned `.git-worktrees/` worktrees (verdict C14), the missing `.sdlc/roadmap.md` (approval Q3) | separate work already routed by the Conductor |

## Landing

One PR from `plan/records-refresh` to `main`, carrying the refreshed survey, its verdict, the approval doc, this plan, and U1. Title `chore(sdlc): refresh the survey and the adoption records`. The door is `.sdlc/adapter.md` §2.1 as ruled (C4): pre-land review writes `.sdlc/verdicts/records-refresh-prepr.md` with `verdict: 🟢` and the branch head sha; `adapter.py land --branch plan/records-refresh --gate .sdlc/verdicts/records-refresh-prepr.md --dry-run` proves the gate; CI watched to `success` for `build-test` and `panda-smoke`; squash per `shipping-changes` step 7; sync per step 8. Then adapter §5: status `done`, revision row, file moved to `.sdlc/plans/archive/` (U1-2's path gains `archive/` from then on), ticket closed, board row 🟢 under `Seat: orchestrator`.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-18 | plan written (draft) from approval Q2 and the survey verdict's corrections line; every U1 command was run by the planner at 746f93d (controls) and again in a throwaway clone rebased onto 1ea2f80 with §Texts applied by script (expected values); P1 to P3 were not rerun, their figures come from the 2026-09-18 survey verdict | records-refresh dispatch |
| 2026-09-18 | mobilized: ticket #691 minted; branch rebased onto `origin/main` @ `841e185` (not `1ea2f80`: #673 landed first), so read every `1ea2f80` above as `841e185`; unit worktree is `.worktrees/rr-U1` on `unit/rr-U1` (a plan-scoped name, since `U1` alone collides across plans) | Orchestrator, on the Conductor's mobilize |
