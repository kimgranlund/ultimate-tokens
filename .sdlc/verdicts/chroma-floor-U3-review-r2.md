PASS

# Review chroma-floor U3 pass 2 · reviewer-l3 standing in for reviewer-l4 · unit/cf-U3 @ 3affbaa5 (#701)

| Field | Value |
|---|---|
| Seat | reviewer, fresh context, read-only on source |
| Grade | reviewer-l3 (opus) stands in for reviewer-l4 while fable is capped on this host (`.sdlc/questions/seat-reliability-approval.md`); the builder was opus L5 |
| Head read | `unit/cf-U3` @ 3affbaa5 (records 03a6dd63, handoff on top); U3 cut from 27c513c1; merge-base with `origin/main` 022e1443 |
| Criteria | plan revision 17 in the worktree (U3 rows, C10, C11, C12, C14) plus revision 18 on the plan branch (c9a1b86c: C14 (a) third leg reads added lines only) |
| Ruling | R66: no `npm test`, build, smoke or timing run. Read with git, grep and single lightweight node scripts (`liftStop` probe, `baseline-agrees-check.sh`, `branding.mjs`, `citations.mjs`) |
| Date | 2026-09-28 |

## Criteria

| Crit | State | Evidence (run here at 3affbaa5) |
|---|---|---|
| C14 (a) rev 18 | 🟢 | R65 in baseline `3`, adapter `1`; `git diff 27c513c1 -- baseline adapter handoff \| grep '^+' \| grep -c sdlc/runtime` `0`; `origin/main:.sdlc/questions/chroma-floor-R57-even-dips.md` `resolves`. The file's Answer block reads R65, 2026-09-28, "R57 now covers gate:even-dips"; its Context row states R57 (2026-09-26) accepts the mode-isolation runs under load, which is what `baseline.md:31` says it cites it for. 537de9db is an ancestor of `origin/main`. The adapter's five whole-file hits (146, 152, 171, 176, 247) are all present at 27c513c1 (`5`) |
| C14 (b) | 🟢 | adapter rows 33 to 35 and 27 to 30 give lows 86, 79, 67, 57, 20, 48, 19 (sum 376) and highs 116, 100, 86, 83, 23, 65, 23 (sum 496), in the `sweeps` row's gate order; row 36 says `376 to 496 s` with those addends. AGREE |
| C14 (c) | 🟢 | CHANGELOG 1.65: `Both are 0` `0`, `58 off-anchor dips` `1`. Source re-derived from `git show 282fca8d:test/engine/tonal.mjs`: `EVEN_DIP_BASELINE` holds 90 names, 57 at `\|450`, 32 at `\|500`, 1 at `\|550` |
| C14 (d) | 🟢 | `Tongass secondary stop 175` `1`, `tertiary ramp` `0`; `.sdlc/handoffs/chroma-floor-U2.md:106` `23.38, Tongass secondary stop 175`, `:105` `0.3848`, both in the `U1 + U2 vs 282fca8d` column the entry summarises (`:101`); `:103`/`:104` give 2,991 / 3,796 and 11,311 / 94,900 (11.92%) as the entry says |
| C14 (e) | 🟢 | `sed -n '6p;33p' .sdlc/baseline.md \| grep -c R65` `2`. The "load 21 to 42" both lines state matches the table rows 30 and 31 (min 21.43, max 42.34 over start and end readings) |
| C14 (f) | 🟢 | `envelope-relative`: decision-records `:0`, glossary `:0`, plan Units `0` |
| C14 (g) | 🟢 | `made the retired dip baseline` `0`, `chromaFloor.*32 at stop 500` `1` |
| C14 (h) | 🟢 | `lifted-stop units` three `:0`; `nothing beyond stops 400/600 moves` `0`; `lift 0` foundations `:1`, knowledge-02 `:2`. Threshold re-derived with `liftStop` from `src/engine/tonal.js` (anchor 500): `\|sd\|` of stop 400 is 0.2222 at lift 0, 0.2004 at 14, 0.2000 at 14.25, 0.1988 at 15; stop 600 mirrors under negative lift. "0.2 of the 450-stop half-ramp, 90 stop units at lift 0" matches `tonal.js:431` (`/ 450`) and `:427` |
| C14 (i) | 🟢 | amendment under ADR-026 (`decision-records.md:730`) `1`, under ADR-025 (`:696`) `0`; `ADR-026 carries` `1`; plan Units `both allow-lists` `0`. ADR-026's Consequences (`:762`) names "#701 owns the even-mode `chromaFloor` side", as the amendment's first sentence claims |
| C14 (j) | 🟢 | with this record: `.sdlc/verdicts` `chroma-floor-U3-review` `2`, `.sdlc/reviews` `chroma-floor` `0`. The move is a 100% rename (`git diff -M 7cea7c41 HEAD`) |
| C14 (k) | 🟢 | handoff `21 to 103` `0`, `sdlc/runtime` `0`, `C1.*exit 1` `1` |
| C14 (l) | 🟢 | `git diff 27c513c1 -- . ':!src' \| grep '^+' \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l` `0` |
| C10 (docs half) | 🟢 | `git diff --stat 022e1443 -- docs/` lists 8 paths, all inside the ten; `adia-oklch-export.css`, `code.js`, `role-table.json` absent. Generator half not run (R66); pass 2 moves no generator input (`git diff --stat 27c513c1 HEAD -- src test scripts package.json .github` empty) |
| C11 | 🟢 | no test file moved since 27c513c1 (same empty diff), so pass 1's seven counts stand |
| C12 | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh`: 13 `ok` including `time gate:mode-isolation 48 to 65 s` and `time gate:even-dips 19 to 23 s`, one `note head`, `STALE ui.html` the only STALE line, `stale total: 1`, `exit 1`, the allowed shape |
| C1 | 🟡 | not run (R66); the handoff quotes pass 1's green run and the verifier's control honestly. Owed to the verifier or pre-land, not a review finding |
| Repo scripts | 🟢 | `node test/repo/branding.mjs` `clean (750 files scanned)`; `node test/repo/citations.mjs` `STALE 0 across 10 discovered docs (HEAD 3affbaa5)`; tree clean after (`0`) |

## Sentences read against their sources

Every sentence 03a6dd63 changed in `CHANGELOG.md`, `decision-records.md`, `glossary.md`, `knowledge-02-tonal-scale.md`, `foundations.md`, `baseline.md` and `adapter.md` was read against the file or figure it cites: the floor formula and the 450/500/550 reference against `evenChroma` and both `floorRef` sites (`tonal.js:336`, `:806`, `:934`); "gamut-relative near white and black, flat where the gamut widens" and "a valley one or two stops out" against the `floorRef` comment (`tonal.js:320` to `:326`); the envelope-slope credit for the 57 against the `EVEN_NEIGHBOURHOOD_R` comment (`:404` to `:409`); the 58/32 split against the retired list at 282fca8d; the movement figures against the U2 handoff; the rulings against the tracked question file; the timing ranges against their own table rows. No sentence says more than its source.

## Findings

- 🟢 None blocking. No High or Medium finding.
- Low, plan-owned: the re-diagnosis F6 row (`.sdlc/plans/chroma-floor-U3-rediagnosis.md:48`) records the plan Units `envelope-relative` count at 7cea7c41 as `1`; `git show 7cea7c41:.sdlc/plans/chroma-floor.md | sed -n '/^## Units/,/^## Parity/p' | grep -c envelope-relative` prints `2`, which the handoff's C14 (f) control states correctly. The plan's C14 control list gives (f) as `1`, `2`, `0`, not in the command's output order (`:1`, `:0`, `2`). Neither is a U3 record; a planner repair at the next revision.
- Low, stale by one commit: the handoff's C14 (a) row (`.sdlc/handoffs/chroma-floor-U3.md:21`, with its Left out line `:56`) is 🟡 and asks for the narrowing revision 18 then made (c9a1b86c, two minutes after 3affbaa5). Under revision 18 the leg reads `0`, so the row is 🟢 in fact; the handoff need not be rewritten for it.
- Info: the `EVEN_NEIGHBOURHOOD_R` comment in `tonal.js` keeps the lift-0 wording; routed out of U3 by the re-diagnosis, not graded here.

verdict: 🟢
