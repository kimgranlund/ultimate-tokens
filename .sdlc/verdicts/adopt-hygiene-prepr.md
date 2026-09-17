# Pre-PR · adopt-hygiene · 279ae0f701b43d85e1196cafafdfeb7015a83abc
verdict: 🔴
sha: 279ae0f701b43d85e1196cafafdfeb7015a83abc

Written by sdlc-verifier on 2026-09-17, replacing the 🔴 record on 4f30855. Two fresh-context workers ran against `origin/main` @ 797173e...`sdlc/adopt` @ 279ae0f (origin/main is now an ancestor: the 8125cf4 merge brought its 7 files through byte-identical; head unchanged start to end): `adopt-hygiene-prepr-verifier-p5` (verifier-l3, Fable 5.1; scratch worktrees removed, root untouched) and `adopt-hygiene-prepr-reviewer-p5` (reviewer-l4, Fable; 0 blocker, 2 major, 5 minor, 8 nit). The Verifier seat reconfirmed all three 🔴 rows with its own commands. Unit criteria graded at the f39a640 plan wording.
Tally: 31 rows. 🟢 22 · 🟡 6 · 🔴 3. All four 4f30855 blockers are closed and every unit criterion passes. Three rows fail, all the same class as before: a live record that states something false at this head. Two are in the plan's own Landing paragraph and U7 row, one is in six record cards.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| gate `npm test` | 🟢 | exit 0, `✓ all 44 test files passed`, tree clean | role-table plant: exit 1, `✗ 1/44` |
| gate `npm ci && npm run build` | 🟢 | ci 0; build 0, `wrote figma/plugin/ui.html`; tree clean | type error in `src/main.ts`: exit 2 |
| gate `npm run smoke` | 🟢 | `SMOKE PASS`, tree clean | throw at line 1 of `src/ui/app.js`: `SMOKE FAIL` |
| U1 to U9 criteria, P1 to P5 | 🟢 | every row at its expected value on the head, at the f39a640 wording | controls at 797173e, 4f30855, and 61a3f90 each fire |
| 4f30855 blocker: OD-004 card path | 🟢 | the card names the root `CHANGELOG.md`, which resolves; the U9-1 scan prints exactly its three named misses | at 4f30855 a fourth line, `missing docs/spec/CHANGELOG.md` |
| 4f30855 blocker: `decisions.md:21` | 🟢 | the lineage cell names ADR-023 and the G2 closure, matching `:40`, `:66`, and `index.md:19` | at 4f30855: the old "only as a note" sentence |
| 4f30855 blocker: CI `npm install` claims | 🟢 | no line at head; `npm ci` count 3 in `ci.yml` | at 4f30855 the f39a640 pattern prints all three pre-fix lines |
| 4f30855 blocker: U7-2 `/Users/` loop result | 🟢 | the loop as scoped to `.sdlc` sees only files debt C6 lists | without the plan exclusions: `missing .sdlc/plans/adopt-hygiene-U8-p2.md` |
| plan U7 row 2, the quoted loop | 🔴 | the loop quoted at `.sdlc/plans/adopt-hygiene.md:140` has lost its `-- .sdlc` scope (pass 1 at 65bbda3 and U9-4 at line 174 both carry it). Run literally at this head it prints `missing .claude/skills/shipping-changes/references/best-practices.md`, a file outside `.sdlc` and not in debt C6, so the criterion fails as written. Confirmed by the Verifier seat | the same loop with `-- .sdlc` restored prints nothing |
| plan Landing, branch sweep | 🔴 | line 210 sweeps `sdlc/adopt` and `unit/hygiene-U1` through `U8` and says the count then prints 28. `unit/hygiene-U9` exists (merged at 1ee2a40) and `git branch \| wc -l` is 38 at this head, so the sweep as written leaves 29 and U3-4's "at most 28" is not met. Confirmed by the Verifier seat | `git branch --list 'unit/hygiene-*'` prints 9 names, U9 among them |
| record cards omit U1's amendments | 🔴 | six cards (`ADR-010`, `ADR-013`, `ADR-016`, `SITE-runbook`, `SITE-describe-palette`, `LLD-muted-base`) do not name the `Amendment (2026-09-16)` U1 appended to their sources; `ADR-016` and `SITE-runbook` read "none stated" while `decisions.md:33` and `:50` record the amendment, so the two records contradict each other. The card format does carry in-body amendments (ADR-002's cell names two) | `grep -E '^\| Supersedes' ` on the six cards, counting `2026-09-16`: `0` six times; the source `decision-records.md` carries 3 such amendments |
| origin/main merge did not reintroduce or invalidate anything | 🟢 | the merge brought main's 7 files through byte-identical; the facts the plan asserts about them still hold (`html:` 12, `TESTS` 44, attributes, role table, README, CLAUDE.md, workflows) | recounted against the tree; a changed count would show in the same greps |
| merge styles, debt closures, index facts, marketplace, R12 | 🟢 | adapter §2 and debt C4, P1 match live `[true,false,false]`; all closed and partial debt rows re-derived against their own evidence, `disagreeing: 0`; index facts true; `nonoun` declared with C7 open; R12 names its trigger | planted false closures on G2, D2, C4 each fire; 61a3f90 prints 20 `no-note` lines |
| Landing holds the deferred steps | 🟡 | the spec repoint and the R12 trigger are held with checks; the branch sweep is held but is wrong (see the 🔴 row) | at b44883d the spec repoint was not in Landing at all |
| dead-path scan on added lines | 🟢 | 0 live misses; every non-resolving path classified (ignored dirs, control probes, glob prefixes, future paths, dated snapshots) | the scan resolves the pointers U1, U6, and U9 fixed |
| wording contract | 🟢 | `plan-authored em dashes: 0, bold labels: 0`, exit 0 | 61a3f90: `9, 3`, exit 1 |
| index lineage cells for the same six records | 🟡 | `index.md` carries the same omission as the cards; one fix should cover both files | same grep as the 🔴 row |
| plan section count, `decisions.md:21` wording | 🟡 | the plan's §17 enumeration stops at eight units while nine exist; `decisions.md:21` uses a deictic "here" that reads oddly out of context | reviewer minors, re-derived |
| U3-4, U3-5 branch counts (carried) | 🟡 | 38 local, 40 remote at this head; the Landing sweep is meant to close U3-4 and does not | counted by me |
| marketplace repo, home paths | 🟡 | the source repo still cannot be resolved on GitHub (debt C7, human, after landing); debt C6 lists the `.sdlc` files the scoped loop sees | 65bbda3: C7 absent |
| CI on this head | 🟡 | the branch is unpushed, so `build-test` and `panda-smoke` have not run on 279ae0f; the adapter requires green CI on the landing head | no run exists to control |
| checker family (carried) | 🟡 | both workers Fable 5.1, fresh context; builders Opus | self-declared |
| integration, secrets, dependencies, commit hygiene, branding | 🟢 | nine units integrate; no `package*.json` change; only `secrets.ANTHROPIC_API_KEY`; no private folder or `node_modules` path; branding clean | P3 probe; planted brand string fires |

## Gaps for the next pass

1. 🔴 `.sdlc/plans/adopt-hygiene.md:140`: restore the `-- .sdlc` scope on the quoted `/Users/` loop, or the U7 row fails as written.
2. 🔴 `.sdlc/plans/adopt-hygiene.md:210`: add `unit/hygiene-U9` to the branch sweep and restate the resulting count from a measurement (38 local at this head).
3. 🔴 Six cards, and the matching `index.md` lineage cells, omit the `Amendment (2026-09-16)` U1 appended to their sources; two of them read "none stated" against `decisions.md`. Needs a criterion whose check fails on 279ae0f.
4. 🟡 Plan §17 stops at eight units; `decisions.md:21` deictic wording; U3-4 and U3-5 counts; marketplace repo unpushed (C7, human).
5. 🟡 CI has not run on this head. Landing needs green `build-test` and `panda-smoke` on the landing head.
6. Any new commit on `sdlc/adopt` invalidates this record; rerun on the new head.
