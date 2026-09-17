# Pre-PR · adopt-hygiene · 80ae4d8a66b4b96c395e00e31880d13024c9ea93
verdict: 🔴
sha: 80ae4d8a66b4b96c395e00e31880d13024c9ea93

Written by sdlc-verifier on 2026-09-17, replacing the 🔴 record on 29a2c06. Per answer A in `.sdlc/questions/adopt-hygiene-prepr.md`, two fresh-context workers ran against `origin/main` @ 7faf3aa...`sdlc/adopt` (36 commits, 114 files): `adopt-hygiene-prepr-verifier` (verifier-l3, Fable 5.1), which ran every gate and criterion in detached scratch worktrees (removed; root checkout untouched), and `adopt-hygiene-prepr-reviewer` (reviewer-l3 on Fable, read-only diff review: 0 blocker, 2 major, 5 minor, 3 nit, recommends ship). The Verifier seat reconfirmed the head sha and the stale-pointer rows itself.
Tally: 30 rows. 🟢 21 · 🟡 8 · 🔴 1. One blocker: the plan moved two plan files and left live pointers to them, including two records this plan created. Stale context is a defect (CLAUDE.md standing convictions), and the fix is in scope, so it is 🔴 rather than 🟡, overruling the reviewer's "ship".

| Check | State | Evidence | Negative control |
|---|---|---|---|
| gate `npm test` | 🟢 | exit 0, `✓ all 44 test files passed`, dirty 0 | `"scrim` → `"scrimX` in role-table: exit 1, `✗ 1/44` |
| gate `npm ci && npm run build` | 🟢 | build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`, dirty 0 | type error in `src/main.ts`: exit 2 |
| gate `npm run smoke` | 🟡 | exit 0, `SMOKE PASS: gallery · category · editor · export dialog`, dirty 0 | none run; smoke has no plan control |
| prior 🔴 npm test / P4 / U2-6 on U1 review record | 🟢 | `branding: clean (416 files scanned)`; U1 review diff vs 29a2c06: +1/−1 | 29a2c06 review file restored: `FAIL: 2` |
| prior 🔴 checker grade and family | 🟡 | verifier-l3 and reviewer on Fable, fresh context; unit content commits (9b7051e, 89c9538, 04b93f0, 0ad0faa, 492b616, d422287, ed565dd) all Opus trailers; the 6 Fable commits are `.sdlc/`-only seat records | self-declared model; no control can falsify it from inside the run |
| prior 🔴 `worktree.bgIsolation` | 🟢 | `s.worktree===undefined` true; settings diff vs origin/main is the two plugin flags only | 39b78dc: false, bgIsolation 1 |
| U1-1..5, 8..11 | 🟢 | 1 1 1; ADR-022/023/024/Quick map; 1 1; amendments + `resolve.mjs`; 0 1; 4 2 0; 3 3 3; 1 1 0; `moved` 1 0 | origin/main values differ on every row (worker run) |
| U1-6 plans closed | 🟢 | 0, 3, 2, todo 0 and 0; resolver silent | origin/main: todo 8 and 7 |
| U1-6 SHA-to-PR pairing (carried 🟡) | 🟢 | all 9 pairs match `gh pr view --json mergeCommit`, all MERGED; concern closed | `PR #592`→`#578`: 1 line; `620ac4b`→`5a0e438`: 1 line |
| U1-7 / U4-2 stale path | 🟢 | `moved`, 1, 0 | without `.sdlc/tickets` exclusion: 1 |
| U1-12 K18 | 🟢 | grep 1, block silent | `CURRENT_SCHEMA_VERSION = 5`: missing-case line |
| U2-1..8, 10, 11 | 🟢 | Shipping/SDLC/Always same; 1 0; 1 12 1 0; 0 1 1; 4; `.worktrees` skip clean; 0 of 34 attrs off; 1 0 1; `squash`; preset github exit 0 | 13th `html:`: 13; origin/main branding with `.worktrees` plant: FAIL 3; radix line dropped: 2; `github.token` planted: exit 2 |
| U2-9 describe-eval (carried 🟡) | 🟡 | actionlint 0, guard exits 1 without key. Still stands: `ANTHROPIC_API_KEY` in job-level `env` (`describe-eval.yml:21-22`) reaches `npm ci` (:28); reviewer rates major | step-level `if: secrets`: actionlint exit 1 |
| U2-12 build | 🟢 | see gate row | see gate row |
| U3-1, U3-2, U3-3 | 🟢 | ops tracked 0; one 7-path deletion commit; live `[true,false,false]` | ignore line removed: `?? .claude/ops/`; b885e67: 52 paths; other repos `[true,true,true]` |
| U3-4 local branch count | 🟡 | gone 0; 33 local, over "at most 28" only by the 5 `unit/hygiene-*` branches | carried from U3 verdict |
| U3-5 remote count | 🟡 | 40; 2 external deletes before the plan | carried |
| U4-1, U4-3 | 🟢 | branding clean; `npm test` 44 pass | 29a2c06 file: FAIL 2; role-table corrupt: exit 1 |
| U5-1, U5-2 | 🟢 | no `worktree` block; flags `true false` | 39b78dc: 1; trailing comma: SyntaxError |
| P1 | 🟢 | gate green, dirty 0 | FAIL 3, exit 1 |
| P1 control restore (carried 🟡) | 🟡 | still stands: after restoring role-table, `ui.html` and `describe-mcp-assets.js` stay modified until a second `npm test`; plan recipe gap | reproduction is the control |
| P2, P3, P5 | 🟢 | 0, 0, 0 | origin/main ops tree 7; `// probe` in motion.mjs: 2; decision-records line deleted: 1 |
| P4 branding | 🟢 | clean (416), head worktree | `docs/x.md` copy: FAIL 3 |
| integration | 🟢 | top-level diff .claude 12, .sdlc 81, docs 15, .github 2, root files, test 1; no package or lockfile change | P3 probe |
| secrets | 🟢 | no literal key, token, or password; only `secrets.ANTHROPIC_API_KEY` | pattern scan |
| docs current: CLAUDE.md, shipping-changes, README, project-docs | 🟢 | expected greps on head | origin/main counts |
| stale pointers to archived plans, in scope | 🔴 | U1 moved `docs/plan/plan-2026-09-adia-derived-export-artifacts.md` and `...-export-schema-revision.md` to `docs/plan/archive/` (`git cat-file -e 80ae4d8:<old path>` fails; origin/main has both). Live pointers left: `.sdlc/records/cards/PLAN-adia-exports.md:9` and `PLAN-export-schema.md:9` (Source rows, files new in this plan), `docs/reference/references/knowledge-04-export-formats.md:341`, `docs/spec/spec-panda-park-ui-exports.md:34`. No criterion covered them | on origin/main the same doc pointers resolve (files present), so the grep separates broken from valid |
| stale pointers behind the scope wall | 🟡 | `scripts/gen-adia-derived-exports.mjs:3`, `test/engine/adia-derived-exports.mjs:6` also point at the old paths; P3 forbids touching them, and no debt row names them (precedent: G2) | same `cat-file` check |
| config and records (reviewer minors) | 🟡 | `.sdlc/adapter.md` §2.2/§3 still state pre-U2/U3 facts with no amendment; `sdlc@nonoun` enabled without an `extraKnownMarketplaces` entry, so a fresh clone cannot resolve it; machine-local absolute home paths in `.sdlc/plans/adopt-hygiene.md`, `.sdlc/tickets/T-0001.md`, `.sdlc/architecture.md`; T-0001 lacks #643; `docs/site/describe-palette-spec.md:579` links the plan path Landing will archive | reviewer read at head; not independently controlled |
| commit hygiene (reviewer nits) | 🟢 | varied trailer order, f9e20c5 lacks attribution; squash collapses them; `sdlc@adia: false` dead config; Quick map omits ADR-023/024 (selective map) | n/a, non-blocking nits |

## Gaps for the next pass

1. 🔴 Repoint the four in-scope live pointers (two `.sdlc/records/cards` Source rows, two docs) at the archived paths, with a criterion whose check fails on the current head.
2. 🟡 Record the two `scripts/`/`test/` pointers as debt, or rule them out of the wall.
3. 🟡 Decide before landing: U2-9 job-level key (reviewer major), adapter §2.2/§3 amendment, undeclared marketplace, absolute home paths, spec link that Landing will invalidate.
4. Any new commit on `sdlc/adopt` invalidates this record; rerun on the new head.
