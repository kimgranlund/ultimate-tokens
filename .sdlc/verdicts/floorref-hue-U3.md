---
kind: verdict
plan: floorref-hue
unit: U3
seat: verifier
pass: 1
ticket: "#766"
written: 2026-10-03
---

# floorref-hue U3 · pass 1 · 🟡 at `12f6b353`

verdict: 🟡
sha: 12f6b353af5be0a94bd2f4ee3a85934f5a271571

`unit/fh-U3` at `12f6b353`, base `04a36e9b` (plan/floorref-hue after U2 merged). Graded against plan revision 4 (`git show 04a36e9b:.sdlc/plans/floorref-hue.md`, rows C3.1 to C3.7 and the U3 units line), and against the U2 verdict's findings F1 to F3, which this unit claims to close.

The builder was builder-l2 (sonnet). The checker was verifier-l2 (opus, high), working in a fresh context outside the builder's model family.

Preflight: `verdict.py check` exited 0 on the handoff and on the review `/Users/kimba/.claude/jobs/8c58a81c/tmp/fh-U3-review/review.md`. Both were created by the unit. The reviewer-l3 PASS was read but not relied on.

The seat spot-checked two things:
- `baseline-agrees-check.sh` on archives of head and base: the same STALE lines on both. An archive adds one `head` line that needs git history; the worker's clone count is 3.
- The `dip-gate-even` header at `test/engine/tonal.mjs:1607` to `:1611`.

The unit is records and comments only (`src/` untouched; the stripped test diff is empty). Every criterion is met with a control that bites, and every figure the records state matches its source. C3.7 is a post-landing row: its drafted closing comment is graded accurate, and the live check moves to the pre-land record.

The 🟡 has two causes:
- one loose qualifier in four comment lines;
- `baseline-agrees-check.sh` is still red on the `gate:even-dips` line that F3 was meant to clear.

Cleared to merge.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| Lane | 🟢 | `git diff --name-status 04a36e9b 12f6b353`: 12 files, all records (`.claude/skills/color-math/SKILL.md`, `references/foundations.md`, `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/handoffs/floorref-hue-U3.md`, `.sdlc/plans/floorref-hue-pr-body.md`, `CHANGELOG.md`, `decision-records.md`, `glossary.md`, `knowledge-02-tonal-scale.md`) plus `test/engine/even-dips-gate.mjs` and `test/engine/tonal.mjs`; no `src/` path. Stripped diff `git diff -U0 04a36e9b 12f6b353 -- test src \| grep -E '^[+-][^+-]' \| grep -vE '^[+-][[:space:]]*(//\|\*\|/\*)'` prints nothing (grep `rc=1`): both test files change comments only | In `c2` at head, `printf 'const plantedCtl = 1;\n' >> test/engine/tonal.mjs`, the same pipeline on `git diff -U0` prints `+const plantedCtl = 1;`; restored, porcelain `0` |
| C3.1 | 🟡 | `grep -n "floorRef\|seed hue\|seedHue"` on the two skill files: 9 hits (`SKILL.md:84` to `:87`, `foundations.md:87`, `:88`, `:143`, `:145`, `:146`); the rule lines read "the ramp's three reference tones (pivot, 450, 550 ...), read per stop at that stop's own hue before edge rotation (the solved CAM16 hue on the anchored OKLCH path, `seedHue` on anchored cam16, `baseHue` non-anchored; `floorRefAt`, #766)", which matches the engine at head: `floorRefAt(hue, maxc, tone500, tone450, tone550)` (`tonal.js:356`), called with `resolvedHue` before `shift` (`tonal.js:901` to `:905`, `chromaAt(hue, resolvedHue)`) and with `baseHue` on the non-anchored path (`tonal.js:1026`). `grep -nE "rendered hue\|rotated hue\|at the seed hue"` over both skill files, knowledge-02 and the glossary prints nothing (`rc=1`). Concern: `SKILL.md:87` "the floor never rises past the first step where every stop reads one hue" omits the engine header's "and nothing rotates" (Finding 1) | Each skill file restored from `04a36e9b`: `grep -c 'before edge rotation'` `SKILL.md 1 -> 0`, `foundations.md 2 -> 0`, and `SKILL.md:85` reads the old "largest ceiling among stops 450/500/550 (#701)". Planting "read at the seed hue per" into `SKILL.md:85` makes the forbidden-wording grep print the line. Restored, porcelain `0` |
| C3.2 | 🟢 | ADR-026 section (`decision-records.md:730` to `:815`) carries `Amendment (2026-10-03, #766, R85, R87)` after the #701 and #725 amendments, before ADR-027 (`:816`) and the Quick map (`:864`). Every figure checked against its source: 0 gate-path cells of `72,124` STOPS and `94,900` EXPORT_STOPS (U2 C2.1); `3,870 of 71,820` (5.4%, `1,522` palettes, `339` docs), `4,441` EXPORT_STOPS, `9.11` C at Tbilisi `secondary` 100 (U2 C2.2); `4 / 20 / 64` at hueShift `30 / 45 / 60` (plan revision 3); R87 `16` removed, `4` opened, 2 palettes, hueShift `39` and `49` on 5,000 palettes (plan revision 4); (b2) pinned count `7` (U2 C2.13); above100 `502 to 499` (plan section 2, U2 C2.7 `above100 499`). The rotation reason is one sentence ("the gamut ceilings are not monotone in hue ... both directions measured off-anchor dips"). Quick map row: `grep -c '^\| ADR-026 .*#766'` = `1` | `decision-records.md` restored from `04a36e9b`: ADR-026-section `#766` count `2 -> 0`, Quick map row count `1 -> 0`. Restored, porcelain `0` |
| C3.3 | 🟢 | knowledge-02 §5: the per-ramp `ref = max(cm at stops 450, 500, 550)` line is gone and `ref = max(maxChromaInGamut(h0, t) for t in [tone@500, tone@450, tone@550])` sits inside `for each stop`, `h0` "THIS stop's own hue ... BEFORE edge rotation (the per-stop solved CAM16 hue on the anchored OKLCH path; hue above otherwise)". Glossary `chromaFloor` row: "read per stop at that stop's own hue before edge rotation (the per-stop solved CAM16 hue on the anchored OKLCH path; edge rotation is not followed, #766)" plus the caveat "on the anchored OKLCH path ... the floor can rise outward of 450/550 and no-dip is a measurement of `npm run gate:even-dips`". Neither file says rendered or rotated hue (forbidden-wording grep, C3.1 row, `rc=1`) | Both restored from `04a36e9b`: `grep -c 'BEFORE edge rotation'` on knowledge-02 `1 -> 0`, per-ramp `ref` line count `0 -> 1`, glossary `chromaFloor` row `before edge rotation` `1 -> 0`. Restored, porcelain `0` |
| C3.4 | 🟢 | `CHANGELOG.md` `## [Unreleased]` / `### 2026-10-03` / `#### Changed` carries one #766 entry: the pre-rotation rule, `0 gate-path cells`, `3,870 of 71,820 STOPS cells move (5.4%), by at most 9.11 CAM16 C` (U2 C2.2), the rotation reason in one sentence, "none of their live renders move" for the perceptual corpus and default kit, and the bounded random-input note; no PR number (fills at land) | `CHANGELOG.md` restored from `04a36e9b`: `grep -c '#766'` `1 -> 0`. Restored, porcelain `0` |
| C3.5 (and U2 F1) | 🟡 | `grep -n "#766" test/engine/tonal.mjs test/engine/even-dips-gate.mjs`: 7 hits, each history or citation (`even-dips-gate.mjs:29`, `:33`, `:34`, `:44` "predates #766 (#784)", `:48`; `tonal.mjs:1608`, `:1758`). C2.14 grep over `src/engine/tonal.js test/engine/tonal.mjs test/engine/even-dips-gate.mjs` prints nothing, `rc=1`. `grep -n deferred` filtered for 766/floor: nothing. The `evenChroma` header (`tonal.js:321` to `:337`, untouched by U3) reads "On the anchored OKLCH path each stop reads its own solved hue, so the floor can rise outward of 450/550 ... no-dip is a measurement of npm run gate:even-dips, not a structural property". F1 closed on its two named defects: `dip-gate-even` header `grep -c 'so the floor does not rise from 450/550 outward'` = `0`, `grep -c 'gated at 0 here and by the hueShift'` = `0`, and (b2) is now "bounded at the merge-base's dip count rather than at 0" (`grep -c 'bounded at the merge-base'` = `1`). Concern: `tonal.mjs:1609` "Where every stop reads one hue the floor does not rise", `tonal.mjs:1756` "(the gate path, anchored cam16)" and `even-dips-gate.mjs:26` "(the gate path)" still call the floor structurally non-increasing on the rotated gate path, where it is not (Finding 1) | Both test files restored from `04a36e9b`: unqualified phrase `0 -> 1`, "gated at 0 here and by the hueShift" `0 -> 1`, "bounded at the merge-base" `1 -> 0`, `even-dips-gate.mjs` "cannot open a dip on" `0 -> 1`. Planted `// at most 10 C.` into `even-dips-gate.mjs:33`: the C2.14 grep prints `test/engine/even-dips-gate.mjs:33:// at most 10 C. ...`, `rc=0`. Restored: `rc=1`, porcelain `0` |
| C3.6 | 🟢 | In `c1` at head: `node test/repo/em-dash.mjs` `em-dash: clean (1120 files scanned)` rc `0`; `node test/repo/branding.mjs` `branding: clean (1112 files scanned)` rc `0`, with the plan, PR draft, handoff and record edits in the tree. Also `node test/repo/citations.mjs` `STALE 0 ... (HEAD 12f6b353)` rc `0`; `node test/repo/verdict-frontmatter.mjs` `verdicts 269 graded 269 bad 0, planted 2` rc `0` | In `c2`, a U+2014 line appended to `CHANGELOG.md`: `FAIL: 1 em dashes outside inline code spans in 1 files`, `em rc=1`. Restored, porcelain `0` |
| C3.7 | 🟡 deferred to landing | Post-landing row: `gh issue view 766` cannot be graded before the PR lands. The draft is accurate: `.sdlc/plans/floorref-hue-pr-body.md` opens `Closes #766.`; its "Issue closing comment" carries 0 of `72,124` STOPS and 0 of `94,900` EXPORT_STOPS gate-path cells, `3,870 of 71,820` (5.4%, `1,522` palettes, `339` docs), `4,441 of 94,500` EXPORT_STOPS, `9.11` CAM16 C at Tbilisi `secondary` 100, and R87 `16` removed / `4` opened in 5,000 palettes | Read the draft line by line against the U2 verdict: C2.1 `cells 72124 · moved 0`, `EXPORT_STOPS cells 94900 · moved 0`; C2.2 `cells 71820 · moved 3870 (5.4%) · palettes moved 1522 · docs moved 339 · max dC 9.11 C`, `EXPORT_STOPS moved 4441 · palettes moved 1523`; C2.9 `/94500 cells` (the 94,500 denominator); C2.13 `32 / 8 / 13` controls and `5 dips in 3 palettes ... bound 7`; plan revision 4 for `16` / `4`, hueShift `39` and `49`. No figure differs |
| U2 F2 (out-of-lane citations) | 🟢 | PR draft "Out-of-lane edits" names `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md` and `04-context-and-messaging.md`, `src/engine/tonal.js:1026` to `:1050`, forced by `test/repo/citations.mjs`, as the U2 verdict's Lane row records. `grep -c "00-synthesis\|04-context-and-messaging"` on the draft = `2` | Read against the U2 verdict Lane row (`00-synthesis.md:89 cites src/engine/tonal.js:1026`, revert reds `citations.mjs`): same two paths, same token, same forcing gate |
| U2 F3 (`gate:even-dips` range) | 🟡 | Figures match U2 C2.8: baseline row `53.51 · 36.35 · 36.31 · 36.48 · 44.89`, head median `36.48`, merge-base `6.62 · 7.68 · 8.27 · 7.46 · 6.76` median `7.46`, C2.13 blocks `29.48` s ((b2) `10.24`, control `15.30`; `2034+1083+475+354+15297+10241 = 29484` ms), corpus `6.99` s, ratio `0.94`. Adapter even-dips `~36 to 54 s` (36.31 and 53.51 rounded). Adapter `sweeps` re-summed: `86+79+67+57+20+48+36+12 = 405`, `116+100+86+83+23+65+54+12 = 539`, matching `405 to 539 s`. `node .sdlc/checks/ceiling-counts-check.mjs`: `ceiling-counts: clean`, rc `0`. But `bash .sdlc/checks/baseline-agrees-check.sh` exits `1` with `stale total: 3`, not 0, and still reads `STALE time gate:even-dips: baseline 36 to 54 s, adapter 36 to 54 s, 19 to 23 s` (Finding 2) | Adapter restored from `04a36e9b`: the even-dips line reads `baseline 36 to 54 s, adapter 19 to 23 s` (the content mismatch F3 named). Diagnosis in `c2`: deleting "; the earlier 19 to 23 s was the R65 load-counted reading before that block existed" still reads STALE; also relaxing the check's `t.length === 3` to `>= 3` (scratch copy) gives `ok    time gate:even-dips: baseline 36 to 54 s, adapter 36 to 54 s`, `stale total: 2`. Restored, porcelain `0` |
| `npm test` (floor) | 🟢 | `npm test` in `c1` at `12f6b353` (`$S/npmtest2.txt`): `✓ all 54 test files passed`, `rc=0`, then `git status --porcelain \| wc -l` = `0` | `npm test` in `c2` with a U+2014 line planted in `CHANGELOG.md` (`$S/npmctl.txt`): `▶ repo/em-dash.mjs FAIL`, `✗ CHANGELOG.md:926`, `✗ 1/54 test file(s) failed`, `rc=1`. Restored, porcelain `0` |

## Findings

1. 🟡 Four comment lines still call the floor structurally non-increasing "where every stop reads one hue" or on "the gate path", with no "and nothing rotates":
   - `.claude/skills/color-math/SKILL.md:87`
   - `test/engine/tonal.mjs:1609` and `:1756`
   - `test/engine/even-dips-gate.mjs:26`

   Under `hueShift` on the non-anchored path, `floorRef` is read at `baseHue` but `maxc` at the rotated hue, so the floor can rise outward. The checker measured 114 outward rises at hueShift 30 and 60 (worst 2.03 C) and 0 at hueShift 0. The engine's own `evenChroma` header already says "and nothing rotates". This confirms reviewer N1.

   Grid line (a) gates the outcome at 0, and the imprecision predates #766, so this is a wording gap, not a behaviour gap. The fix is a phrase in those four places.
2. 🟡 `bash .sdlc/checks/baseline-agrees-check.sh` is still red at head (the clone shows `stale total: 3`, the same count as the base). The F3 figures themselves are correct, and the re-summed `sweeps` row is right.

   The `gate:even-dips` line stays STALE for two reasons:
   - The check parses exactly three readings, and the row now carries five.
   - U3 added the history phrase "19 to 23 s" to the adapter cell, which the check reads as a third range.

   Two further lines are red, both pre-existing and outside U3's lane:
   - `chroma-envelope`: the adapter's `12 to 12 s` against the baseline's 20 to 21 s. This also understates the `sweeps` sum by about 8 to 9 s at each end.
   - `ui.html`: 4162.0 KB in the baseline against 4165.2 KB in the tree.

   The Orchestrator owns these records. The pre-land record will require `stale total: 0`.
3. 🟢 Every number in the ADR-026 amendment, CHANGELOG, glossary, knowledge-02, the color-math skill, the PR draft and its closing comment matches the U2 verdict (C2.1, C2.2, C2.7, C2.8, C2.13) and plan revisions 3 and 4. The rule as written matches `floorRefAt` and both call sites at head.
4. 🟢 U2 F1 is closed on both of its named defects. U2 F2 is named in the PR draft.
5. 🟢 Housekeeping (reviewer N2): the handoff's Files row omits `test/engine/even-dips-gate.mjs`, whose change is comments only.
