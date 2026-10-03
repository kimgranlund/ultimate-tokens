---
kind: verdict
plan: floorref-hue
seat: verifier
pass: 1
ticket: "#766"
written: 2026-10-03
---

# Pre-PR · floorref-hue · pass 1 · 🟢 at `2a0eef24`

verdict: 🟢
sha: 2a0eef24edc7d70aa118701c1742a14e8578057c
version: n/a (a plan landing, no release)

`plan/floorref-hue` at `2a0eef24` (U1 to U4 merged, main merged in). Scope is `origin/main...2a0eef24`; the merge-base is `00081f2c`, which is also GitHub `main`. Draft PR #793. Criteria are C2.1 to C2.15, C3.1 to C3.7 and C4.x of `.sdlc/plans/floorref-hue.md` at head, plus the open findings of the U2 and U3 verdicts.

Both checkers ran in a fresh context and were dispatched by this seat:
- reviewer-l3 (opus, high), standing in for reviewer-l4;
- verifier-l2 (opus, high), standing in for verifier-l3.

That is the R86/R92 substitution while fable is capped. Both sit outside the family of the sonnet builders (U1, U3, U4), but share the family of the opus U2 builder (builder-l7). The same standing exception covered the U2 unit verdict.

Main moved `src/engine/` since U2's base (prime-name #789: `ds-export.js`, `exports.js` and `prime.mjs`) but not `tonal.js`. The checker re-derived C2.1 and C2.2 against the landed base `00081f2c`, and both reproduce exactly.

Preflight: `verdict.py check` exited 0 on the review. The seat read both reports in full.

Every gate on the head is green with a control that bites:
- `npm test` 54 of 54;
- build, with `ui.html` unchanged at 4165.2 KB;
- smoke;
- `gate:even-dips`: (a) and (b1) 0, (b2) 5 against the pin of 7;
- the mode-isolation hashes;
- the chroma-envelope capture is a no-op;
- `baseline-agrees-check.sh` prints `stale total: 0`.

The reviewer passes the plan with no blocker or high finding.

The U3 verdict's finding 1 was fixed after that verdict, in U3 rework 2 at `8867039e`. That commit was never unit-verified. Both checkers confirm the fix at this head: all four comments now read "and nothing rotates". This record is that confirmation.

CI on `2a0eef24` is all green (`build-test`, `panda-smoke`, `corpus-contrast`, and all eight `sweeps` legs). The PR is still a draft. Cleared to land.

## Rows

| Check | State | Evidence | Negative control |
|---|---|---|---|
| `npm test` | 🟢 | `✓ all 54 test files passed`, rc 0, porcelain 0, wall 228 s (ran beside a floor-ref report, not a quiet-host reading) | `sed 's/"scrim/"scrimX/' role-table.json` then `node test/run.mjs`: `FAIL refs-canonical, ordered key set != canonical`, `✗ 1/54 test file(s) failed`, rc 1; reverted, porcelain 0 |
| `npm ci && npm run build` | 🟢 | `ci rc=0`, `build rc=0`, `wrote figma/plugin/ui.html 4165.2 KB`; `ui.html` shasum `26f5e4b6...` before and after, porcelain 0 | appended `export const = ;` to `src/engine/tonal.js`: `SyntaxError: Unexpected token '='`, build rc 1; reverted, porcelain 0, `ui.html` shasum back to `26f5e4b6...` |
| `npm run smoke` | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, rc 0, porcelain 0 | `customElements.define("ultimate-tokenz", HctApp)` in `src/ui/app.js`: `SMOKE FAIL (3)`, `✗ gallery boots`, rc 1; reverted, rebuilt, porcelain 0, `ui.html` shasum `26f5e4b6...` |
| C2.1 gate path 0 moved | 🟢 | `--floor-ref --base-dir <archive of 00081f2c>`: gate `STOPS` `cells 72124 · moved 0 ... max dC 0.00 C`, `moved in hueShift 0 palettes: 0`, `0 largest mover(s)`; `EXPORT_STOPS` `cells 94900 · moved 0`; rc 0 | same command run from the pass 1 tree `d77e5b74`: gate `STOPS` `moved 6 ... max dC 0.60 C` with exactly Adia `Success` 150 `#C6EBBC`, 200 `#B6DAAD`, 250 `#A6C99D`, 300 `#94B78D`, `Info` 300 `#96ACBC`, `Data 5` 300 `#AAA880`; `EXPORT_STOPS` `moved 7` adding `Success` 175 `#BEE3B5` |
| C2.2 rendered 3,870 / 4,441, 9.11 C | 🟢 | `cells 71820 · moved 3870 (5.4%) · palettes moved 1522 · docs moved 339 · max dC 9.11 C`; `cells 94500 · moved 4441 (4.7%) · palettes moved 1523 · docs moved 339 · max dC 9.11 C`; top mover Tbilisi `secondary stop 100 #FBF9AF -> #F9F8C6`; rendered blocks `diff` against the d77e5b74 run: identical | base `arch16` (00081f2c with `FLOOR_TARGET` scaled 1.6x): rendered `moved 50736 (70.6%) ... max dC 25.12 C` and `moved 66555 ... max dC 25.83 C`, over the 10 C bound, so the row's figures and bound are base-relative and discriminate |
| `npm run gate:even-dips` | 🟢 | `PASS`, rc 0: (a) `0 dips (... 1728 palettes ...)`, (b1) `0 dips (... 128 palettes ...)`, (b2) `5 dips in 3 palettes (... 1000 palettes ... bound 7)`, corpus `0 dips (... 3764 palettes + default kit 16)`; wall 80.9 s under concurrent load (not a C2.8 reading) | in-script controls all bit: (a) `32 dips (want > 0)`, (b1) `8 dips (want > 0)`, (b2) `13 dips (want > 7, the pinned merge-base count)`, pre-#701 `120 dips (want > 0)` |
| `mode-isolation-gate.mjs --full` | 🟢 | `pass mode-isolation: perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef match fixture (captured at ba7a299e...)`, rc 0 | `okhslStops` `const lift = (palette.lift ?? 0) + 1;`: `FAIL mode-isolation: perceptual c64fb2145f896440 peak 298f209547e42a3f do not match fixture`, rc 1; reverted |
| `chroma-envelope-gate.mjs --capture` | 🟢 | `every value equals test/engine/fixtures/chroma-envelope.json (captured at 0ef7b87b...); file left unchanged`; shasum `aac7fb9d...` before and after; even `median 15.6 / 47.0 / 42.5 / 22.9; p90 37.0 / 100.0 / 80.2 / 52.0; above100 499` | copy with even `above100` 498 as base: `--compare` prints `1 cells rose (... even above100)`, rc 1 (self-compare `0 cells rose`, rc 0); `--capture --fixture <that copy>` rewrites it (shasum `7104825a` to `7f58e847`, `above100` back to 499), so "unchanged" is not vacuous |
| `baseline-agrees-check.sh` | 🟢 | `stale total: 0`, rc 0; `ok    time gate:even-dips: baseline 36 to 54 s, adapter 36 to 54 s`, `ok    time gate:chroma-envelope: baseline 20 to 21 s`; `note  head: baseline ref 74850019 ... unproven at this head` (a note, not counted) | (1) `all 54` to `all 53` in baseline: `STALE tests: baseline 53`, rc 1; (2) genuinely stale timing `53.51` to `58.51`: `STALE time gate:even-dips: baseline 36 to 59 s, adapter 36 to 54 s`, rc 1; (3) even-dips row cut to two readings: `STALE time gate:even-dips`, rc 1; (4) C4.2 revert `>= 3` to `=== 3`: `stale total: 2` (even-dips and chroma-envelope), rc 1. All reverted |
| C4.1 / C4.3 | 🟢 | `git diff --stat 00081f2c 2a0eef24 -- .sdlc/checks/baseline-agrees-check.sh`: `1 file changed, 1 insertion(+), 1 deletion(-)`; `grep -c "length === 3\|length >= 3"` prints `1` | revert to `=== 3` (control 4 above) reds C4.2 |
| `card-amendment-check.sh` | 🟢 | `stale total: 0`, rc 0 | `2026-09-16` to `2026-09-17` in `cards/ADR-010.md`: `stale card ADR-010`, `stale total: 1`, rc 1; reverted |
| `card-source-range-check.sh` | 🟡 | red at head: `end ADR-026 says 768, section ends at 814`, `start ADR-027 says 770, heading at 816`, `end ADR-027 says 816, section ends at 862`, `range mismatches: 3`, rc 1. Pre-existing: on `origin/main` 00081f2c `range mismatches: 3`, rc 1 (ends 791, 793, 839); the #766 ADR-026 amendment widened the gap by 23 lines | `cards/ADR-020.md` range `526-574` to `526-575`: `end ADR-020 says 575, section ends at 574`, `range mismatches: 4`, rc 1; reverted |
| `doc-drift-rows-check.sh` | 🟢 | `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, rc 0 | DD1 quote `gen:type-fonts` to `gen:type-fontsX` in `.sdlc/architecture.md`: `QUOTE DD1: not found at .claude/CLAUDE.md:22`, `bad 1`, rc 1; reverted |
| `verdict-frontmatter-check.sh` | 🟢 | `verdicts 270 graded 270 bad 0`, rc 0 | `verdict: 🟡` to `verdict: ok` in `floorref-hue-U3.md`: `VALUE floorref-hue-U3.md: last verdict: ok is not 🟢, 🟡 or 🔴`, `bad 1`, rc 1; reverted |
| `ceiling-counts-check.mjs` | 🟢 | `ceiling-counts: clean`, rc 0, `partition: 20 = 3 graded + 14 explicit + 3 unsupportable` | row `**553.45 s**` to `**553.46 s**` in baseline: `FAIL prose above LIST == measured above walls`, `ceiling-counts: 1 failure(s)`, rc 1; reverted |
| `citations.mjs` | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins + 35 count phrases (HEAD 2a0eef24)`, rc 0 | `15 voices` to `16 voices` in `docs/lld/app-shell.md`: `✗ 2 citation gate failure(s)`, rc 1; reverted |
| `em-dash.mjs` | 🟢 | `em-dash: clean (1125 files scanned)`, rc 0 | U+2014 appended to `.sdlc/plans/floorref-hue.md`: `FAIL: 1 em dashes outside inline code spans in 1 files`, rc 1; reverted |
| `branding.mjs` | 🟢 | `branding: clean (1117 files scanned)`, rc 0 | the uppercase retired maker name (assembled in the shell, not spelled here) appended to the plan: `FAIL: 1 branding violation(s) across 1117 files`, rc 1; reverted |
| C3.1 skill records | 🟢 | `SKILL.md:85-87` "read per stop at that stop's own hue before edge rotation (the solved CAM16 hue on the anchored OKLCH path, `seedHue` on anchored cam16, `baseHue` non-anchored; `floorRefAt`, #766)"; `foundations.md:88`, `:145-146` same rule; `grep -i "rendered hue\|rotated hue"` on both files prints nothing | the plan's control text: "at the seed hue" as the whole rule, absent at head; on `00081f2c` the same grep shows the one-hue reading (plan "Today": 4 hits) |
| C3.2 ADR-026 amendment | 🟢 | ADR-026 section `grep -c "#766"` = `2`; `Amendment (2026-10-03, #766, R85, R87)` names pre-rotation rule, 0 gate-path cells (72,124 / 94,900), `3,870 of 71,820` and `9.11 CAM16 C`, rotation not followed with the measured reason; Quick map row carries `2026-10-03 (#766, R85 ...)` | same grep on `00081f2c` ADR-026: 0 hits (plan "Today") |
| C3.3 knowledge-02, glossary | 🟢 | `knowledge-02-tonal-scale.md:141` "stop's own hue h0 BEFORE edge rotation (the per-stop solved CAM16 hue on the anchored OKLCH path ...)"; `glossary.md:22` `chromaFloor` "read per stop at that stop's own hue before edge rotation" | no "rendered hue" / "rotated hue" reading in either file at head; the plan's control (a one-hue reading) is the `00081f2c` text |
| C3.4 CHANGELOG | 🟢 | under `## [Unreleased]` `### 2026-10-03`: `The even-mode chroma floor reads its gamut reference per stop ... (#766)`, `0 gate-path cells`, `3,870 of 71,820 STOPS cells move (5.4%), by at most 9.11 CAM16 C`, rotation not followed with reason, shipped corpus renders `perceptual` | `git show 00081f2c:CHANGELOG.md` has no #766 entry under Unreleased |
| C3.5 comments | 🟢 | C2.14 grep over `tonal.js tonal.mjs even-dips-gate.mjs` prints nothing, `rc=1`; `grep -c "deferred to #766\|the issue its comment names" src/engine/tonal.js` = `0`; every `#766` hit in the two tests is history or citation (`even-dips-gate.mjs:29,33,34,44,48`, `tonal.mjs:1608,1758`); C2.15 phrases `0 / 0 / 1` | the plan's C2.14 control: pass 1's tree prints 7 lines; at head 0 |
| C3.6 em-dash, branding | 🟢 | `em-dash: clean (1125 files scanned)` and `branding: clean (1117 files scanned)`: both rows above green with this plan, its verdicts and the U3/U4 records in the tree | the em-dash and branding planted controls above |
| U3 verdict finding 1 | 🟢 fixed | `SKILL.md:88`, `tonal.mjs:1609`, `tonal.mjs:1756`, `even-dips-gate.mjs:26` all read "where every stop reads one hue and nothing rotates"; fixed in `8867039e` ("U3 rework 2: one-hue premise adds 'and nothing rotates'") | U3 verdict text at `.sdlc/verdicts/floorref-hue-U3.md` lines 52-56 quotes the four lines without the phrase |
| C3.7 closing comment draft | 🟢 draft accurate, post-landing | `.sdlc/plans/floorref-hue-pr-body.md` opens `Closes #766.`; "Issue closing comment": `0 of 72,124 STOPS ... 0 of 94,900 EXPORT_STOPS`, `3,870 of 71,820 ... (5.4%, 1,522 palettes, 339 docs)`, `4,441 of 94,500`, `9.11 CAM16 C (Tbilisi secondary 100)`, each equal to this run's C2.1/C2.2 output | figures checked against the live report, not the plan; a draft carrying pass 1's `6` / `0.60 C` gate figures would mismatch the C2.1 row |
| CI (state, not certified) | 🟢 reported | `gh pr view 793`: `headRefOid 2a0eef24edc7...` = verified head, `isDraft true`, `MERGEABLE`; `build-test`, `panda-smoke`, `corpus-contrast` and all 8 `sweeps (...)` legs `SUCCESS`, `deploy` `SKIPPED`; `gh run list`: `2a0eef24 CI completed success 2026-10-03T18:19:54Z` | head sha comparison: CI's `headRefOid` equals `git rev-parse` of the verified head; any other sha would make these results not this head's |
| Mergeability | 🟢 | `git merge-tree --write-tree gh/main 2a0eef24`: rc 0, tree `6cb151e6...` = `2a0eef24^{tree}`; `git merge-base gh/main 2a0eef24` = `00081f2c` = GitHub `main` | the tree equality is the check: a conflict prints conflict lines and exits 1, and a non-ancestor main yields a tree different from the head's |
| Reviewer: whole-plan review | 🟢 | `/Users/kimba/.claude/jobs/05defd58/tmp/fhpr-rev/review.md` first line `PASS`, 23 checks. The per-stop rule is right on both paths (`tonal.js:887`, `:905`, `:1026`). `floorRefAt` matches the old `Math.max` under `min(maxc, ·)`. No R78 hue literal, no R98 layer, no dead code. All 34 non-merge commits carry trailers. No private docs or `node_modules` in the diff | U4 check: the reviewer's four planted stale cases (`=== 3` restored, adapter `36 to 53 s`, baseline `63.51`, a two-reading row) each read STALE. The citation control: reverting `00-synthesis.md:89` to `:1026` makes `citations.mjs` exit 1 |

## Findings

1. 🟡 `card-source-range-check.sh` is red: `range mismatches: 3`, rc 1. It is pre-existing, since `origin/main` shows the same 3 and also exits 1, so it does not block this landing.

   But this plan's ADR-026 amendment widens the gap by 23 lines. `cards/ADR-026.md` and `cards/ADR-027.md` now cite 768, 770 and 816, while the sections sit at 814, 816 and 862. Repairing those cards is a stale record this plan made worse. Do it in the landing commit or as a named follow-up.
2. 🟡 Low (reviewer L2). The PR body does not mention:
   - that U4 loosened the pre-land gate script `.sdlc/checks/baseline-agrees-check.sh:42` from `=== 3` to `>= 3` (revision 6, owner answer A);
   - the `chroma-envelope` adapter range moving to 20 to 21 s;
   - the re-summed `sweeps` range;
   - the ui.html KB correction.

   A human reading the body cannot see that a gate changed. Add one line before marking the PR ready.
3. 🟡 Low (reviewer L1). `CHANGELOG.md:22` to `:23` says the per-stop solve applies "on an anchored ramp". Anchored cam16 ramps read `seedHue` and have no solve. The ADR, the skill and the PR body all say "anchored OKLCH". No figure moves.
4. 🟢 Nits from the review, none of them blocking:
   - "6.99 s" should be 7.00 s; the ratio stays 0.94.
   - The plan's revision rows jump from 4 to 6.
   - The plan's frontmatter `size:` and `lane:` leave out U4 and `.sdlc/checks/`.
   - The comment at `src/engine/tonal.js:860` says "candidate hue h" two lines before it correctly names the solved hue.

   The Orchestrator closes the plan bookkeeping at landing (adapter §5).
5. 🟢 C3.7 (`gh issue view 766` closed with the figures) is post-landing. The drafted closing comment matches this run's C2.1 and C2.2 output figure for figure.
6. 🟢 Timings taken here ran under concurrent load (`npm test` 228 s, `gate:even-dips` 80.9 s), so they are not C2.8 readings. The quiet-host C2.8 readings in `.sdlc/verdicts/floorref-hue-U2.md` stand, and no engine line has changed since.
