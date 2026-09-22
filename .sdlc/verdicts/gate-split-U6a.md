# Verdict: U6a (gate-split, #713) · independent verification

| Field | Value |
|---|---|
| Unit | U6a, the `sweeps` matrix job in CI |
| Graded head | `unit/gs-U6a` @ `166b0ec6` |
| Plan read at | `plan/gate-split` @ `61ce5c56` (rows U6-1, U6-2, U6-8, P4, P10, the U6a checklist row) |
| Method | detached clone at `/tmp/gs-u6a-verify/work`, mutation clone at `/tmp/gs-u6a-verify/neg`, both removed at the end. The unit worktree `.worktrees/gs-U6a` was never touched |
| Host | `load averages: 11.13 ... 19.02` across the run, 10 cores. Not a quiet host, so no timing is graded, only exit codes |
| Verdict | 🟢 with one waived red and two pre-land ⚪ rows |

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | P4 / U6-1: CI invokes every gate script on every PR, no leg can mask a red | 🟢 | plan command verbatim in the clone printed `corpus-tonal 1`, `corpus-anchor 1`, `sweep-prime 1`, `corpus-reset 1`, then `2`, `1`, `0`, `1`, `1` | in `/tmp/gs-u6a-verify/neg`: commented out the `- gate:corpus-anchor` matrix entry, added `continue-on-error: true` under `sweeps:`, removed `fail-fast: false`. The same command then printed `corpus-anchor 0`, and the two job-level figures flipped to `1` and `0` |
| 2 | U6-2: the workflow parses and the matrix lists exactly the gate scripts that exist | 🟢 | plan command verbatim printed `same 5`; the five legs equal `package.json`'s `gate:*` minus `gate:sweeps` | the plan's `DIFFER` control: added `"gate:zzz-extra"` to `package.json` in the neg clone, same command printed `DIFFER 5` |
| 3 | Job shape: five legs, no `if:`, `needs:`, `continue-on-error:` on the job or any step, no `npm ci` | 🟢 | `yaml.safe_load` of the workflow: `sweeps top keys: ['runs-on', 'steps', 'strategy']`, `forbidden on job: []`, `forbidden on steps: []`, `fail-fast: False`, one step `npm run ${{ matrix.gate }}`, `npm ci present: False` | the leg-removal control of row 1 is the shape control: dropping one matrix entry reds P4's per-gate line. Injecting `continue-on-error: true` on the job made the forbidden-key figure print `1` |
| 4 | The workflow parses | 🟢 | `python3 -c 'import yaml; yaml.safe_load(...)'` printed `YAML OK ['build-test', 'corpus-contrast', 'deploy', 'panda-smoke', 'sweeps']` | a tab-indented `bad: [unclosed` inserted under `sweeps:` in a copy: the same parse raised `found character '\t' that cannot start any token`, line 112 |
| 5 | Runs on `pull_request`; `deploy` stays push-only | 🟢 | parsed `on: {'push': {'branches': ['main']}, 'pull_request': None}`; `deploy if: github.event_name == 'push' && github.ref == 'refs/heads/main'`; `sweeps` carries no `if:` at all | P4's last figure, `grep -cE '^\s+pull_request:'`, prints `1` here and would print `0` on a workflow with the trigger removed; the `deploy` guard is read from the parsed tree, not by grep, so a moved guard cannot be missed |
| 6 | Legs match gate entry points that exist at the head | 🟡 | `test/engine/tonal.mjs`, `prime.mjs`, `curated-contrast.mjs`, `test/ui/headless-boot.mjs` all present in `git ls-tree unit/gs-U6a`; `test/engine/anchor.mjs` absent, it arrives with #681 | the missing file is itself the control: `gate:corpus-anchor` exits 1 with `Cannot find module '.../test/engine/anchor.mjs'`, so a leg pointed at a file that does not exist cannot pass silently |
| 7 | Leg 1, `gate:corpus-tonal` | 🟢 | `exit 0`, wall `28s`, last line `PASS: tonal-generation clears all [gate] predicates`. Load before `11.13`, after `18.38` | row 6's `Cannot find module` red proves a leg's exit code reaches the report; row 1's matrix-entry deletion proves an absent leg is caught by the shape check |
| 8 | Leg 2, `gate:corpus-anchor` | 🟡 waived | `exit 1`, wall `0s`, `Error: Cannot find module '/private/tmp/gs-u6a-verify/work/test/engine/anchor.mjs'`. Known and waived until #681 lands, per `.sdlc/questions/gate-split-approval.md` question 7 and the plan's own sequencing comment in the job. Recorded, not graded red | not applicable: this row records a waived condition rather than asserting a green. The condition is directly observed, not inferred |
| 9 | Leg 3, `gate:sweep-prime` | 🟢 | `exit 0`, wall `5s`, last line `PASS: prime-system clears all AC-050 gates` | as row 7: the anchor leg's non-zero exit in the same loop shows the loop reports reds |
| 10 | Leg 4, `gate:corpus-reset` | 🟢 | `exit 0`, wall `61s`, last line `HEADLESS BOOT PASS` | as row 7, same loop, same reporting path that surfaced anchor's `exit 1` |
| 11 | Leg 5, `gate:corpus-contrast` | 🟢 | `exit 0`, wall `46s`, last line `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color`. Load after `16.40` | as row 7, same loop |
| 12 | Scope wall: the unit touches only the workflow and its handoff | 🟢 | `git diff --name-only 0b02711b unit/gs-U6a` prints exactly `.github/workflows/ci.yml` and `.sdlc/handoffs/gate-split-U6a.md`; `-- src` prints `0`; P9's filter prints `0`. The `.sdlc/board.md` and `.sdlc/plans/gate-split.md` rows in a plain `plan/gate-split ... unit` diff are plan-side commits made after the merge-base `0b02711b`, not unit edits | P9's filter over a five-name fixture including `src/engine/hct.js` printed `1` |
| 13 | No em dash added in prose, outside backtick spans | 🟢 | added lines of `git diff 0b02711b unit/gs-U6a`, backtick spans stripped with `perl -CSD`, printed `0`; the same pipe counted with `grep -o` printed `0` | a two-line fixture, one prose line with the dash and one where it sits inside a backtick span, printed `1`: the prose line is caught, the code span is not |
| 14 | Branding clean | 🟢 | `node test/repo/branding.mjs` printed `branding: clean (483 files scanned)`, exit `0` | in the neg clone, `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` printed `FAIL: 3 branding violation(s) across 484 files`, exit `1` |
| 15 | U6-8 / P10, the CI wall budget | ⚪ | pre-land only. `unit/gs-U6a` is local and unpushed and no PR exists, so `gh run list --branch plan/gate-split` has nothing to read. The builder's handoff records the same reason | not applicable: nothing measurable exists to control against until a draft PR produces a completed run |

## Notes

- The `sweeps` matrix carries `gate:corpus-contrast` as a fifth leg while the standalone `corpus-contrast` job also runs it, so that script runs twice on a PR. This is what the plan specifies: U6-2 demands the matrix equal every `gate:*` script except `gate:sweeps`, which prints `same 5` only with contrast in the list. Intended duplication, recorded, not a finding.
- Action pins (`actions/checkout@v7`, `actions/setup-node@v7`, `node-version: 24`) match every other job in the file.
- The builder's handoff correction stands up under an independent run: exactly one leg exits non-zero today, `gate:corpus-anchor`, not two. The other three legs silently ignore `--full` until U2, U4 and U5 teach their files to read it, which is reduced coverage rather than a failure, and is P3's business at pre-land, not this unit's.
- Host load never dropped below `11.13` on 10 cores, so every wall figure above is contention-inflated and none of it is a figure of record. Only exit codes are graded here.
- Scratch trees `/tmp/gs-u6a-verify/work` and `/tmp/gs-u6a-verify/neg` are still on disk: the removal command was declined by the permission prompt three times. They are throwaway clones with no unique content; remove with `rm -rf /tmp/gs-u6a-verify`.
