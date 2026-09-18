# Pre-PR · adopt-hygiene · 262c00c7c558069233e8123761805af0b87dbf05
verdict: 🔴
sha: 262c00c7c558069233e8123761805af0b87dbf05

Written by sdlc-verifier on 2026-09-17, replacing the 🔴 record on 279ae0f. This is the capped final round. Two fresh-context workers ran against `origin/main` @ 797173e (an ancestor since the 8125cf4 merge)...`sdlc/adopt` @ 262c00c, head unchanged start to end: `adopt-hygiene-prepr-verifier-p6` (verifier-l3, Fable 5.1; scratch worktrees removed, root untouched) and `adopt-hygiene-prepr-reviewer-p6` (reviewer-l4, Fable; 0 blocker, 1 major, 8 minor, 12 nit). The Verifier seat reconfirmed both 🔴 cells with its own commands, including a planted-ignore run for the U3-1 control.
Tally: 30 rows. 🟢 23 · 🟡 5 · 🔴 2. Every gate, every criterion U1 to U10, every P row, both committed checks, and all three 279ae0f blockers pass. Two cells of the plan itself are false at this head, the same class that blocked the five previous rounds. Both are one-line Orchestrator edits; the record then needs the new head's sha.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| gate `npm test` | 🟢 | exit 0, `✓ all 44 test files passed`, tree clean | role-table plant: exit 1, `✗ 1/44` |
| gate `npm ci && npm run build` | 🟢 | ci 0; build 0; tree clean | type error in `src/main.ts`: exit 2 |
| gate `npm run smoke` | 🟢 | `SMOKE PASS`, tree clean | throw at line 1 of `src/ui/app.js`: `SMOKE FAIL` |
| U1 to U10 criteria, P1 to P5 | 🟢 | every row at its expected value on the head | a control fired for each row (797173e, 279ae0f, 61a3f90, 1ad1958, and planted defects) |
| check `.sdlc/checks/card-amendment-check.sh` | 🟢 | `stale total: 0` at head. A pass proves every card whose source carries the 2026-09-16 amendment names it in its lineage cell, and that the matching index row does too; it keys on that date, so it is a landing-time sweep, not a standing gate | `12` at 279ae0f and on `sdlc/adopt` before the U10 merge; planted card date, index cell, and an ADR-011 amendment each fire |
| check `.sdlc/checks/card-source-range-check.sh` | 🟢 | `range mismatches: 0` at head. A pass proves every ADR card's `Source` range starts at its `## ADR-NNN` heading and ends at its section's last non-blank line | `26` at 279ae0f, `14` at 1ad1958; planted start and end shifts each print their exact mismatch line |
| 279ae0f blocker: plan U7 loop scope | 🟢 | the quoted loop carries `-- .sdlc` and prints nothing at head | without the scope it prints `missing .claude/skills/shipping-changes/references/best-practices.md` |
| 279ae0f blocker: Landing branch sweep | 🟢 | the sentence globs `unit/hygiene-*` and asserts no count; the close-out records what it measures | at 279ae0f it named nine branches and asserted 28 |
| 279ae0f blocker: six cards and index cells | 🟢 | rows above; independent sweep of all 38 cards: 0 omissions | `12` at the control commits |
| plan intro unit count | 🔴 | `.sdlc/plans/adopt-hygiene.md:17` says the units are "nine after the pre-land rounds (U4 to U7 fixes, the U8 staleness sweep, the U9 round four fixes)" while ten exist: line 6 sums ten, §U10 is a section, and the board carries the row. The sentence was already stale in the commit that added U10 | `grep -c '^### U'` prints 10; the size line sums ten units |
| plan U3-1 control cell | 🔴 | `.sdlc/plans/adopt-hygiene.md:96` predicts `7` for `git status --short \| grep -c '\.claude/ops'` after the ignore line is deleted. Git collapses an untracked directory to one entry, so the run prints `1`. Measured by the Verifier seat in a scratch tree at 262c00c with the ignore line removed: `?? .claude/ops/`, one line. The criterion itself passes; its control cell is false | the same scratch tree prints `M .gitignore` and `?? .claude/ops/`, two lines total |
| live-record sweep | 🟢 | apart from the two plan cells above, no live record states something false at head: records, cards, adapter, debt notes, skills, README, CLAUDE.md, architecture checked, and sampled numeric claims (roles, tests, attributes, workflows, debt counts) match the tree | planted false claims fire in each sweep; 279ae0f values differ on every fixed row |
| dead-path scan on added lines | 🟢 | 0 live misses; every non-resolving path classified | the scan resolves the pointers U1, U6, U9, and U10 fixed |
| adapter land gate behaviour | 🟢 | proven end to end: this record red gives exit 2; a scratch green record carrying the head sha gives `would: land`, exit 0; a stale sha exits 2; a missing file exits 2 | the four runs are each other's controls |
| Landing section executable as written | 🟡 | the land call, gate path, PR steps, and close-out items are runnable; concern: the section does not say where the post-squash close-out commit lands, given the adapter forbids direct commits to main and the sweep deletes the branch | reviewer minor, re-derived |
| wording contract | 🟢 | `plan-authored em dashes: 0, bold labels: 0`, exit 0 | 61a3f90: `9, 3`, exit 1 |
| integration, secrets, dependencies, commit hygiene, branding | 🟢 | ten units integrate; no `package*.json` change; only `secrets.ANTHROPIC_API_KEY`; no private folder or `node_modules` path; branding clean | P3 probe; planted brand string fires |
| U3-4, U3-5 branch counts (restated) | 🟡 | 41 local and 41 remote at this head; a `fix/648` branch opened during the run, so the close-out measures rather than asserts | counted by the run |
| marketplace repo (restated) | 🟡 | `kimgranlund/sdlc-orchestration` still does not resolve; debt C7, human, after landing | `gh repo view` fails |
| CI (restated) | 🟡 | the branch is unpushed, so `build-test` and `panda-smoke` have not run on this head; the PR run is the last gate | no run exists to control |
| checker family (restated) | 🟡 | both workers Fable 5.1, fresh context; builders Opus | self-declared |
| minor record wording | 🟡 | `decisions.md` rows 27, 51, 54 omit the amendment without contradicting it; `.sdlc/survey.md` carries a pre-plan path typo; the U10-6 control prose misdescribes what ADR-024 claimed at 1ad1958; the P3 parenthetical says `prints 7` where the command prints 0 | re-derived by both workers |

## Gaps for the next pass

1. 🔴 `.sdlc/plans/adopt-hygiene.md:17`: say ten units, and name U10 with the others.
2. 🔴 `.sdlc/plans/adopt-hygiene.md:96`: the U3-1 control predicts 7; git prints 1 for a collapsed untracked directory. Restate it from the measurement.
3. 🟡 Worth folding into the same commit: the Landing section should say where the close-out commit lands; the P3 parenthetical `prints 7`; the U10-6 control prose about ADR-024; `decisions.md` rows 27, 51, 54.
4. 🟡 Restated, not reopened: branch counts measured at close-out, marketplace repo unpushed (C7, human), checker family self-declared, CI unrun until the PR.
5. This record's `sha` must match the landing head, so a new commit on `sdlc/adopt` requires a rerun before the adapter will land it.
