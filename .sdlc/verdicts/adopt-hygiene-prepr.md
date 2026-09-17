# Pre-PR · adopt-hygiene · 4f3085545f9c79f953a3e093c91df8794952fa90
verdict: 🔴
sha: 4f3085545f9c79f953a3e093c91df8794952fa90

Written by sdlc-verifier on 2026-09-17, replacing the 🔴 record on b44883d. Two fresh-context workers ran against `origin/main` @ 7faf3aa...`sdlc/adopt` @ 4f30855 (head unchanged start to end, branch unpushed): `adopt-hygiene-prepr-verifier-p4` (verifier-l3, Fable 5.1; six scratch worktrees, all removed; root untouched) and `adopt-hygiene-prepr-reviewer-p4` (reviewer on Fable, read-only: 0 blocker, 2 major, 3 minor, 10 nit). The Verifier seat reconfirmed all four 🔴 rows below with its own commands.
Tally: 32 rows. 🟢 24 · 🟡 4 · 🔴 4. Every b44883d row that U8 targeted is closed. Four new rows fail, all of the same class the last two records blocked on: a criterion that no longer passes as written, and three live records that state something false at the head.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| gate `npm test` | 🟢 | exit 0, `✓ all 44 test files passed`, tree clean | role-table `"scrimX"`: exit 1, `✗ 1/44`; restored, green |
| gate `npm ci && npm run build` | 🟢 | ci 0; build 0, `wrote figma/plugin/ui.html 3695.6 KB`; tree clean | type error in `src/main.ts`: exit 2 |
| gate `npm run smoke` | 🟢 | `SMOKE PASS`, tree clean | throw at line 1 of `src/ui/app.js`: `SMOKE FAIL` |
| U1-1..12 | 🟢 | all expected values on head | origin/main differs on every row; planted controls per row |
| U2-1..8, 10..12 | 🟢 | CLAUDE.md equals adapter §7; ignores, attributes, pages.yml, workflow.json, config.json as specified | origin/main values; 13th `html:`: 13; `github.token` planted: exit 2 |
| U2-9 / U6-3 eval key scope | 🟢 | parsed YAML: no workflow or job `env`; key only on guard and eval steps; guard exits 1 without it; actionlint 0 | 80ae4d8: job-level `true` |
| U3-1..3 | 🟢 | ops tracked 0; one 7-path commit; live `[true,false,false]` | origin/main ops tree 7; other repo `[true,true,true]` |
| U3-4, U3-5 counts (carried) | 🟡 | 37 local (29 non-unit + 8 unit branches), 40 remote; the Landing section now holds the branch sweep | carried from the U3 verdict |
| U4, U5, U6 rows | 🟢 | branding clean; no `worktree` block; repointed plan paths resolve; adapter amendments append-only | 29a2c06 file: FAIL 2; 39b78dc: bgIsolation 1; 80ae4d8: 4 stale pointer files |
| U7-1 marketplace entry | 🟢 | `github kimgranlund/sdlc-orchestration true true`; 6 added lines only | 39db0a9: `undefined` |
| U7-2 `/Users/` loop (carried by U8-11) | 🔴 | the revised loop `git grep -lE '/Users/[a-z]' -- .sdlc` prints `missing .sdlc/plans/adopt-hygiene-U8-p2.md` on the head; expected is no `missing` line. That file carries a home path at line 80, committed in aa4394e after the measurement the revision row cites, and debt C6 does not list it | the same loop is silent on the rows C6 does list; at d7cf7f4 the file did not exist |
| U8-1..13 | 🟢 | index facts, adapter amendments, closure notes (`disagreeing: 0` with live `gh`), decisions ledger, cards, K18, plan wording, shipping-changes, SPEC row, wording sweep `0, 0`, board | 61a3f90: 20 `no-note`; d7cf7f4: four `false-close`; planted false closures on G2, D2, C4 each fire; b44883d values on the rest |
| P1..P5 | 🟢 | 44 pass and tree clean; 0; 0; branding clean; 0 deleted lines | planted controls each fire |
| stale pointers to archived plans | 🟢 | all remaining hits are historical records or the two behind-wall files; wrap scan clean | on origin/main the old paths exist |
| behind-wall pointers | 🟢 | debt R12 now names its trigger; the Landing section holds it | b44883d: no trigger |
| `.sdlc/records/cards/OD-004.md:7` | 🔴 | the card says the eval result is to be recorded in `docs/spec/CHANGELOG.md`; that path does not exist at head (`git cat-file -e` fails) and U1's R6 repointed the source record to the root `CHANGELOG.md`. The plan's fact table missed this cell | the root `CHANGELOG.md` resolves, so the same check separates the two |
| `.sdlc/records/decisions.md:21` | 🔴 | the ADR-004 lineage cell says the scrim revision is "recorded only as a note inside ADR-004 (gap G2)", while line 40 of the same file says ADR-023 supersedes ADR-004 and line 68 records G2 closed by ADR-023. U8 fixed the same sentence in `index.md:19` and missed this one | `index.md:19` now names ADR-023, so the corrected shape exists to compare against |
| `.claude/skills/shipping-changes/SKILL.md:32` | 🔴 | says CI runs `npm install`; `.github/workflows/ci.yml:28` runs `npm ci`, with a comment insisting on `ci`, not `install`. Pre-existing, but U2-4 and U8-8 edited this file to remove exactly this kind of stale claim | the workflow line and its comment are the counter-evidence; the same grep on `ci.yml` finds no `npm install` |
| merge styles in canonical records | 🟢 | adapter §2 amendment and debt C4, P1 now match live `[true,false,false]` | another repo returns `[true,true,true]` |
| debt rows closed or partial | 🟢 | all 21 re-derived against their own evidence with the verifier's commands and live `gh`; none disagrees; the closure check fires on planted false closures | d7cf7f4: four rows disagreed |
| project-docs SPEC row, shipping-changes references, plan wording | 🟢 | `spec-absent: 0 spec-files: 2`; `stale: 0`; `three-units: 0 bold-lead: 0` | b44883d: `1 2`, `3`, `3 3` |
| wording contract on added lines | 🟢 | `plan-authored em dashes: 0, bold labels: 0`, exit 0; the remaining dashes are the ratified kept classes and seat records | 61a3f90: `9, 3`, exit 1 |
| dead-path scan on added lines | 🟢 | 53 non-resolving paths, all classified (ignored dirs, control probes, glob prefixes, future paths, dated snapshots); 0 live misses besides the OD-004 row above | the scan resolves the pointers U1 and U6 fixed |
| marketplace and home paths | 🟡 | `nonoun` declared; the source repo still cannot be resolved on GitHub, tracked as debt C7 (human, after landing); home paths debt C6 accepted but its file list is short by the U8 re-diagnosis file (see the 🔴 row) | 65bbda3: C7 absent |
| Landing holds the deferred steps | 🟢 | the Landing section names the spec repoint, the branch sweep, and the R12 trigger | b44883d: the spec repoint appeared only in the U6 preamble, count 0 in Landing |
| checker family (carried) | 🟡 | both workers Fable 5.1, fresh context; builders Opus | self-declared; nothing in the tree can falsify a model name |
| CI on this head | 🟡 | the branch is unpushed, so `build-test` and `panda-smoke` have not run on 4f30855; the adapter requires green CI before landing | n/a: no run exists to control |
| integration, secrets, dependencies, commit hygiene | 🟢 | all eight units integrate; no `package*.json` change; only `secrets.ANTHROPIC_API_KEY`; no private folder or `node_modules` path in any commit | P3 probe |

## Gaps for the next pass

1. 🔴 U7-2's loop flags `.sdlc/plans/adopt-hygiene-U8-p2.md`. Either exclude the re-diagnosis class the plan already calls history, or add the file to debt C6.
2. 🔴 `.sdlc/records/cards/OD-004.md:7` names a file that does not exist; it should name the record U1 repointed to.
3. 🔴 `.sdlc/records/decisions.md:21` contradicts lines 40 and 68 of its own file about ADR-004 and gap G2.
4. 🔴 `.claude/skills/shipping-changes/SKILL.md:32` says CI runs `npm install`; CI runs `npm ci`.
5. 🟡 Debt C6's file list is short; push the marketplace repo before or after landing (C7, human); U3-4 and U3-5 counts carried; checker family self-declared.
6. 🟡 CI has not run on this head: the branch is unpushed. Landing needs green `build-test` and `panda-smoke` on the landing head.
7. Any new commit on `sdlc/adopt` invalidates this record; rerun on the new head.
