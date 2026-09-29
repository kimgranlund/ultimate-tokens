# Handoff U3 · builder to reviewer (pass 2, revision 17)

| Field | Value |
|---|---|
| Branch | unit/cf-U3: records 03a6dd63, handoff 3affbaa5, review r2 PASS b96ce5b1 (`.sdlc/verdicts/chroma-floor-U3-review-r2.md`); this update is the next commit |
| Base | plan/chroma-floor revision 17 via d3b8a461; U3 cut from 27c513c1; `<base>` 282fca8d; merge-base with `origin/main` 022e1443 |
| Pass 1 | ba8eece2 records and handoff, 7cea7c41 review PASS (`.sdlc/verdicts/chroma-floor-U3-review.md`); verdict 🔴 at 7cea7c41 (`.sdlc/verdicts/chroma-floor-U3.md` on main), re-diagnosis `.sdlc/plans/chroma-floor-U3-rediagnosis.md` |
| Files (pass 2) | `.sdlc/baseline.md` · `.sdlc/adapter.md` · `docs/reference/CHANGELOG.md` · `docs/reference/references/{decision-records,glossary,knowledge-02-tonal-scale}.md` · `.claude/skills/color-math/references/foundations.md` · `.sdlc/reviews/chroma-floor-U3-review.md` moved to `.sdlc/verdicts/` · this handoff. No `src/`, `test/`, `scripts/`, `package.json` or CI file: `git diff --stat 27c513c1 HEAD -- src test scripts package.json .github \| wc -l` prints `0` |
| Host | pass 2 times nothing. The one `npm test` run (R66 lifted) started at 1-minute load 20.21 and ended at 8.78, beside a second suite. The six pass 1 timings carry: 1-minute load 21.43 to 42.34 across their start and end readings, counted under R57 (mode-isolation) and R65 (even-dips, R57 extended), both recorded in `.sdlc/questions/chroma-floor-R57-even-dips.md` on `origin/main` @ 537de9db |
| Scratch | `$CLAUDE_JOB_DIR/tmp/` (`/Users/kimba/.claude/jobs/8c58a81c/tmp/`): `c14.sh` (C14 (a) to (k) over any ref), `sum.js` (C14 (b)), `ad-ctl.md` (the (b) control copy); pass 1 logs still in `/private/tmp/claude-501/cf-U3/` |

## Criteria (read at 03a6dd63; controls at 7cea7c41 unless stated)

| Crit | State | Evidence | Negative control |
|---|---|---|---|
| npm test | 🟢 | run once at b96ce5b1 after R66 lifted, from the worktree root: `✓ all 50 test files passed`, `exit 0`, 256 s wall (a second suite ran beside it, so the time is not a figure of record); `git status --short \| wc -l` after prints `0` (the regeneration inside `npm test` moved nothing). Log: `$CLAUDE_JOB_DIR/tmp/npmtest.log` | the verifier's scrim sed at 7cea7c41, quoted in the next row |
| C1 | 🟢 | N = `TESTS.length` 50 (`baseline-agrees-check.sh`: `ok tests: baseline 50, test/run.mjs TESTS 50`); the run above reads `✓ all 50 test files passed` and tree `0`. The C1 control was run by the verifier at 7cea7c41: the scrim sed gives `✗ 1/50 test file(s) failed`, `exit 1` | the verifier's run at 7cea7c41, quoted left |
| C10 | 🟢 | `git diff --stat 022e1443 HEAD -- docs/ code.js role-table.json` lists 8 paths: CHANGELOG, `docs/reference/SKILL.md`, decision-records, glossary, knowledge-02, the two `2026-08-20-reactivity/` files, `rubrics/acceptance-criteria.md`. All inside the ten; no `code.js`, `role-table.json`, `adia-oklch-export.css` or `quality-rubric.md`. The generator half ran inside `npm test` (its script runs `gen:mcp-assets`, `gen:categories`, `gen:adia-exports`, `bundle` and `gen:figma-ui`, C10's five) and the tree read `0` after | a scratch tree (temp index, HEAD plus one line appended to `knowledge-01-color-engine.md`, working tree untouched) lists 9 paths, `grep -c knowledge-01` prints `1` |
| C11 | 🟢 | the seven greps print `0`, `0`, `0`, `1`, `1`, `0`, `2` (unchanged; no test file moved) | the verifier's pass 1 scratch copies with `LONE_SPIKE_ALLOW` and `EVEN_DIP_BASELINE` appended print `1` each |
| C12 | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh` from the worktree root: `ok tests: baseline 50, test/run.mjs TESTS 50`, `ok time gate:mode-isolation: baseline 48 to 65 s, adapter 48 to 65 s`, `ok time gate:even-dips: baseline 19 to 23 s, adapter 19 to 23 s`, `STALE ui.html: baseline 4130.1 KB, tree 4135.3 KB`, `stale total: 1` (the one allowed line, pre-land's) | pass 1's verifier: the adapter even-dips cell set to `~19 to 22 s` gives `stale total: 2` |
| C14 (a) | 🟢 | under revision 18 (`plan/chroma-floor` @ c9a1b86c, which narrows the runtime-path grep to lines the unit adds): `R65` baseline `3`, adapter `1`; `git diff 27c513c1 -- .sdlc/baseline.md .sdlc/adapter.md .sdlc/handoffs/chroma-floor-U3.md \| grep '^+' \| grep -c` on the runtime path prints `0`; `git cat-file -e origin/main:.sdlc/questions/chroma-floor-R57-even-dips.md` prints `resolves`. The adapter's five older `.gitignore` history lines (146, 152, 171, 176, 247) sit at 27c513c1 and are outside the added-lines read | 7cea7c41: `0`, `0`, and the pass 1 handoff added the path once |
| C14 (b) | 🟢 | `node sum.js adapter.md`: `computed 376 to 496 (86+79+67+57+20+48+19 to 116+100+86+83+23+65+23); row says 376 to 496; AGREE` | 7cea7c41: `row says 355 to 475; STALE`; a copy with the even-dips cell `~19 to 24 s`: `computed 376 to 497 ...; STALE` |
| C14 (c) | 🟢 | CHANGELOG 1.65: `Both are 0` `0`, `58 off-anchor dips` `1`. U2 handoff line 83: `450: 57, 500: 32, 550: 1` | 7cea7c41: `1`, `0` |
| C14 (d) | 🟢 | `Tongass secondary stop 175` `1`, `tertiary ramp` `0`. Source: U2 handoff line 106 `max dC overall \| 23.38, Tongass secondary stop 175`; the entry's `largest L* move 0.3848` is line 105, the `U1 + U2 vs 282fca8d` column | 7cea7c41: `0`, `1` |
| C14 (e) | 🟢 | `sed -n '6p;33p' .sdlc/baseline.md \| grep -c R65` prints `2` | 7cea7c41: `0` |
| C14 (f) | 🟢 | `envelope-relative`: decision-records `:0`, glossary `:0`, plan Units `0` | 7cea7c41: `:1`, `:0`, Units `2` (revision 17 was not on the branch then) |
| C14 (g) | 🟢 | glossary: `made the retired dip baseline` `0`, `chromaFloor.*32 at stop 500` `1` | 7cea7c41: `1`, `0` |
| C14 (h) | 🟢 | `lifted-stop units`: foundations `:0`, knowledge-02 `:0`, CHANGELOG `:0`; `nothing beyond stops 400/600 moves` `0`; `lift 0`: foundations `:1`, knowledge-02 `:2`. The threshold read from `liftStop` in `tonal.js` (anchor 500): `\|sd\|` for stop 400 is `0.2222` at lift 0, `0.2004` at 14, `0.2000` at 14.25, `0.1988` at 15 | 7cea7c41: `:1`, `:0`, `:1`, `1`, `:0`, `:0` |
| C14 (i) | 🟢 | the amendment sits under ADR-026 (`decision-records.md:730`) `1`, under ADR-025 (`:696`) `0`; `ADR-026 carries` in CHANGELOG `1`; plan Units `both allow-lists` `0` | 7cea7c41: `0`, `1`, `0`, `1` |
| C14 (j) | 🟢 | `.sdlc/verdicts` `chroma-floor-U3-review` `2` (`chroma-floor-U3-review.md`, `chroma-floor-U3-review-r2.md`), `.sdlc/reviews` `chroma-floor` `0` | 7cea7c41: `0`, `1` |
| C14 (k) | 🟢 | this file: the old load range `0`, the runtime path `0`, the C1 control line `1` (the three greps of C14 (k)) | the pass 1 handoff (ba8eece2): `1`, `1`, `0` |
| C14 (l) | 🟢 | `git diff 27c513c1 -- . ':!src' \| grep '^+' \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l` prints `0` at 03a6dd63 and with this handoff staged. `test/repo/em-dash.mjs` is not on this branch (pre-sweep); pre-land runs it after the `origin/main` merge | the same pipe with one added line carrying U+2014 appended (`printf`) prints `1` |
| Records against the engine | 🟢 | every pass 2 sentence read against its source: the floor `chromaFloor% * min(maxc, floorRef)` and `floorRef` over 450/500/550 against `tonal.js` `evenChroma`; `R = 0.2` in `sd` units against `tonal.js:427` and `:431` (`sd` divides by 450); the 58, the 32 and the 23.38 against the U2 handoff lines 83, 87, 106; R65 against the question file on `origin/main`. `node test/repo/branding.mjs`: `clean (750 files scanned)`. `node test/repo/citations.mjs`: `STALE 0 across 10 discovered docs (HEAD 03a6dd63)` | not applicable: readings |

## Findings, pass 1 to pass 2

| Finding | State | Evidence | Negative control |
|---|---|---|---|
| F1 🔴 R57 cited for even-dips | 🟢 | baseline even-dips row and adapter even-dips cell cite R65 by the tracked question file @ 537de9db; C14 (a) reads `3`, `1`, `0`, `resolves` | C14 (a) at 7cea7c41: `0`, `0` |
| F2 🔴 stale sweeps sum | 🟢 | C14 (b): `row says 376 to 496; AGREE` | C14 (b) at 7cea7c41: `row says 355 to 475; STALE` |
| F3 🟡 baseline lines 6 and 33 | 🟢 | both except the two rows, counted under R57 and R65 at load 21 to 42; C14 (e) reads `2` | C14 (e) at 7cea7c41: `0` |
| F4 🔴 `Both are 0` | 🟢 | CHANGELOG names 58 off-anchor dips at 0 and 32 stop-500 notches remaining; C14 (c) reads `0`, `1` | C14 (c) at 7cea7c41: `1`, `0` |
| F5 🔴 `23.4 ... one tertiary ramp` | 🟢 | C14 (d): `Tongass secondary stop 175` `1`, `tertiary ramp` `0` | C14 (d) at 7cea7c41: `0`, `1` |
| F6 🟡 `envelope-relative` | 🟢 | amendment states the capped gamut reference; C14 (f) reads `:0`, `:0`, `0` | C14 (f) at 7cea7c41: `:1`, `:0`, `2` |
| F7 🟡 glossary credits the old floor alone | 🟢 | row credits the shoulder and the capped floor with the 58 and names the 32; C14 (g) reads `0`, `1` | C14 (g) at 7cea7c41: `1`, `0` |
| F8 🟡 lift-0 wording, `lifted-stop units` | 🟢 | foundations, knowledge-02, CHANGELOG; C14 (h) reads `:0`, `:0`, `:0`, `0`, `:1`, `:2` | C14 (h) at 7cea7c41: `:1`, `:0`, `:1`, `1`, `:0`, `:0` |
| F9 🟡 ADR-025 placement, `both allow-lists` | 🟢 | amendment under ADR-026, CHANGELOG says ADR-026, plan wording is revision 17's; C14 (i) reads `1`, `0`, `1`, `0` | C14 (i) at 7cea7c41: `0`, `1`, `0`, `1` |
| F10 🟡 review in `.sdlc/reviews/` | 🟢 | `git mv` to `.sdlc/verdicts/`; C14 (j) reads `2`, `0` | C14 (j) at 7cea7c41: `0`, `1` |
| handoff Host range and C1 control | 🟢 | this file's Host and C1 rows; C14 (k) reads `0`, `0`, `1` | C14 (k) on the pass 1 handoff: `1`, `1`, `0` |

## Left out

| Item | Why |
|---|---|
| `EVEN_NEIGHBOURHOOD_R` comment in `tonal.js` (the same lift-0 and `lifted-stop-units` wording) | routed out by the re-diagnosis: a `src/` edit moves citation line pins; a chore issue or pre-land |
| `npm run build`, `npm run smoke`, any timing | not in this unit's criteria for pass 2; no timing re-run |
| `ui.html` baseline figure | C12's one allowed STALE line; pre-land repairs it |
| `quality-rubric.md` | does not state the floor mechanism (`grep -c floor` prints `0`) |
