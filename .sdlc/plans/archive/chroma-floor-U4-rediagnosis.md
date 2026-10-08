---
kind: rediagnosis
plan: chroma-floor
unit: U4
ticket: "#701"
written: 2026-09-29
author: cf-U4-planner
measured-at: a28b9b22 (unit/cf-U4, pass 1 head; code bbb72843, handoff f1385abc) against e10aa5d1 (plan revision 21), old head d1db4b04 as the control
inputs: `.sdlc/verdicts/chroma-floor-U4.md` (pass 1, 🔴), `.sdlc/verdicts/chroma-floor-prepr.md` (pass 1, F4 and F5), `.sdlc/handoffs/chroma-floor-U4.md` and `.sdlc/verdicts/chroma-floor-U4-review.md` on `unit/cf-U4`, `.sdlc/plans/chroma-floor.md` revision 21 (the U4 line), the sdlc plugin's `githooks/commit-msg` (0.4.0, the installed `core.hooksPath`), `agents/reviewer.md` step 5 and `agents/orchestrator.md` (the review record path), `.sdlc/checks/verdict-frontmatter-check.sh`, `test/repo/verdict-frontmatter.mjs`, `src/engine/tonal.js` (`evenChroma`, `paletteStops`, `paletteStopsAnchored`), `test/engine/tonal.mjs` (`KNOWN_BASELINE_DUP`, `DIP_BASELINE`), `test/engine/anchor.mjs:645-660`
method: read-only against the unit branch; the two hook claims and the three grep forms below were run in a `git clone --shared` of the unit worktree under the seat's job tmp (`cf-U4-rediag/c`), at a28b9b22 and at d1db4b04, exit codes read directly. No source edited, nothing committed.
---

# U4 re-diagnosis: pass 1 fixed everything it was asked and went 🔴 on two things the brief created

Short answer: the code commit `bbb72843` is right and the verifier says so on six of eight rows. The two reds are (1) a records defect the Orchestrator's brief introduced by naming `.sdlc/verdicts/` as the review record's path, where a gate reads every file, and (2) one comment the plan's own F4 wording invited, by listing `anchor.mjs:652` beside two lines that really do name a retired constant when that line names a live one too. Pass 2 is a comment edit, a file move, and four criterion legs that make the next verifier see both.

## 1. Root cause, per red

| # | Defect | Evidence at a28b9b22 | Cause | State |
|---|---|---|---|---|
| 1 | The head fails `npm test`: `.sdlc/verdicts/chroma-floor-U4-review.md` opens with a bare `PASS` and has no `verdict:` line; `verdict-frontmatter-check.sh` reads every top-level `.md` under `.sdlc/verdicts/` (adapter §Amendment 2026-09-22, #734: no list, no pin) | `▶ repo/verdict-frontmatter.mjs FAIL`, `MISSING chroma-floor-U4-review.md: no verdict: line`, `npm exit 1`; the same gate at `bbb72843` reads `bad 0` | The reviewer contract's record path is `.sdlc/reviews/<slug>-U<n>-review.md` (`-review-p<pass>.md` on a repeat pass), a directory no gate grades and where a bare `PASS` first line is the ruled shape (every record there opens that way, e.g. `records-gates-U5-review.md`). The Orchestrator's brief named `.sdlc/verdicts/` instead. The reviewer then followed the brief, and its `Not run` row skipped `npm test` (X2 says the reviewer never runs build or test, so that row is not the reviewer's miss). The verdict was requested at the head without anyone rerunning the one-second `verdict-frontmatter` gate after the review commit | 🔴 |
| 2 | `test/engine/anchor.mjs:652` `KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments (both since retired)`: `KNOWN_BASELINE_DUP` is live | `git grep -c 'const KNOWN_BASELINE_DUP\b' -- src test scripts` prints `test/engine/tonal.mjs:1`; the Set is defined at `tonal.mjs:1280` (23 keys), consumed by the gate at `:1330` and asserted at `:1364-1366`; `const EVEN_DIP_BASELINE` prints nothing | Revision 21's F4 leg reads "the history comments at `tonal.js:409-410`, `report-preset-fidelity.mjs:20`, `anchor.mjs:652` put the retired constants in the past tense". The first two lines name only `EVEN_DIP_BASELINE`; `:652` names two constants, and the leg said "the retired constants", so the builder retired both. The pre-land F4 meant the `EVEN_DIP_BASELINE` half of that line. The leg had no check that a name it calls retired has no `const`, so nothing could catch the over-reach | 🔴 |

Neither red is a code-behaviour defect: the diff `plan/chroma-floor...unit/cf-U4` outside `.sdlc/` is comments, docs and one string literal (the review's `No behaviour change` row, 0 non-comment lines), and R1, R2, R3, F1, F3 and the citations gate are 🟢 at the head. Nothing from pass 1 is reverted.

## 2. The brief's three known causes, checked

| Brief said | Checked | Correction |
|---|---|---|
| The record move must reckon with the commit-msg hook: a rename whose source is a record under `.sdlc/verdicts/` needs `Seat: verifier`; a delete plus add of rewritten content does not | The hook's `is_record_file` (0.4.0 `githooks/commit-msg:66-72`) matches a path under `.sdlc/verdicts/` only when its basename ends `-prepr.md` or is `release-<v>.md` with no further dash; every other name there "is not a record". Run in the scratch clone at a28b9b22: staged `R100 .sdlc/verdicts/chroma-floor-U4-review.md .sdlc/reviews/chroma-floor-U4-review.md`, hook exit `0` with no `Seat:` trailer; control, staged `R100 .sdlc/verdicts/k17-rerun-prepr.md .sdlc/reviews/k17-rerun-prepr.md`: `prepr or release record commit needs a "Seat: verifier" trailer`, exit `1` | The rule is real but does not reach this file. Pass 2 moves the record with a plain `git mv`, byte for byte, under the builder's own commit (no `Seat: verifier`, no rewrite, history kept). A delete plus add is not needed and would lose the rename's history for nothing. With the record moved, `node test/repo/verdict-frontmatter.mjs` at that tree prints `verdicts 192 graded 192 bad 0, planted 2`, exit `0` |
| `anchor.mjs:652` retires a live constant; retire only the `EVEN_DIP_BASELINE` half; add a leg that any constant a comment calls retired has 0 `const` definitions | Confirmed (row 2). One caution for the leg's wording: `tonal.mjs:1502` says `DIP_BASELINE was retired to empty` and `:1517` still defines `const DIP_BASELINE` (one #739 name), so a leg phrased as "any identifier on a line containing `retired`" would red a true comment. The leg is scoped to the phrase that asserts removal (`since retired`, `since-retired`, `both since retired`) and to the three names the plan itself retired | Leg 3 below carries the exact grep set and the control |
| 🟡 the handoff's `ran` block truncates `04-context-and-messaging.md:71` at 140 chars, so the leg does not bite; 🟡 the pre-land 🟡 on `floorRef` read at the base or seed hue needs a disposition | Line 71 is 523 characters and its cite sits past column 140, so `cut -c1-140` prints the same text at both heads. `/usr/bin/grep -no 'src/engine/tonal.js:98[0-9]' <both files>` prints `00-synthesis.md:89:src/engine/tonal.js:985` and `04-context-and-messaging.md:71:src/engine/tonal.js:985` at a28b9b22 and `...:983` twice at d1db4b04, so that form bites on both lines. `floorRef`: at `tonal.js:936` the three ceilings are read at `baseHue` while each stop renders at `hue = baseHue + shift * dir` (`:945-947`); at `:808` they are read at `seedHue` while the anchored path solves a per-stop hue (`resolvedHue`, `:842`) before rotating it. The reference is one level per ramp by design (`evenChroma`'s comment, `:320-324`), so this is not a defect the C13 drain probe shows (far-side dC 0.49 to 0.61 at the head), but the comments at both sites do not say the hue they read at, which is the same class of gap R1 was red for | Leg 4 replaces the `cut` with the `-no` capture. Leg 5 folds the hue fact into the two `floorRef` comments as a stated approximation (exact at hueShift 0 on the cam16 path) and defers the behaviour question by name: one `kind:feature` `size:small` issue the Orchestrator mints, "`floorRef` read at each stop's rendered hue (rotated or solved), measured by C13's drain probe", cited by number in the U4 line once it exists. No engine line changes in U4; U4 stays a comment-and-records unit and the review's `No behaviour change` row stays the wall |

## 3. What pass 2 does

| Step | Action | Where |
|---|---|---|
| 1 | `git mv .sdlc/verdicts/chroma-floor-U4-review.md .sdlc/reviews/chroma-floor-U4-review.md`, byte for byte, in the builder's code commit | unit worktree |
| 2 | `anchor.mjs:652`: name `EVEN_DIP_BASELINE` as the retired one and `KNOWN_BASELINE_DUP` as live (its Set and gate still cite U3's R2). Suggested read: `the tonal.mjs KNOWN_BASELINE_DUP comment and the since-retired EVEN_DIP_BASELINE's comment cited as U3's shipped chromaEnvelope shape` | `test/engine/anchor.mjs` |
| 3 | `floorRef` comments at `tonal.js:804-806` and `:935-936`: add that the three ceilings are read at the seed or base hue, one reference for the whole ramp, exact for the rendered stops at hueShift 0 on the cam16 path and an approximation under edge rotation or the OKLCH hue solve; name the deferral issue | `src/engine/tonal.js` |
| 4 | Handoff pass 2: the `ran` block's R2 line is the `-no` capture form; the block runs at the pass 2 code commit and at d1db4b04 | `.sdlc/handoffs/chroma-floor-U4.md` |
| 5 | Regenerate (`npm test` does it): `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` move by comment bytes only, as in pass 1 | generated |
| 6 | The reviewer writes `.sdlc/reviews/chroma-floor-U4-review-p2.md` (bare `PASS` or `FAIL` first line, the reviews shape) and commits it on the unit branch. Never `.sdlc/verdicts/` | reviewer |
| 7 | Before requesting the verdict, the Orchestrator (or a scout) runs `node test/repo/verdict-frontmatter.mjs` at the unit HEAD, the commit after the review's, and records the line. The verifier grades `npm test` at that HEAD, not at the code commit | orchestrator, verifier |

## 4. Criteria legs added to the U4 line (revision 22)

| Leg | Command | Expected | Negative control |
|---|---|---|---|
| L1 records path | `ls .sdlc/verdicts \| /usr/bin/grep -c 'chroma-floor-U4-review'; ls .sdlc/reviews \| /usr/bin/grep -c 'chroma-floor-U4-review'` | `0` then `2` (pass 1's record moved, pass 2's added); `git log --follow --oneline -- .sdlc/reviews/chroma-floor-U4-review.md` shows `a28b9b22` (history kept through the rename) | at a28b9b22: `1` then `0` |
| L2 gate at HEAD | at the unit HEAD after the last commit on the branch (the review commit): `node test/repo/verdict-frontmatter.mjs; npm test 2>&1 \| tail -1; git status --short \| wc -l` | `verdicts N graded N bad 0`; `✓ all 54 test files passed`; `0`. The verifier's row names the sha it ran at and that sha is `git rev-parse unit/cf-U4` | at a28b9b22: `MISSING chroma-floor-U4-review.md`, `✗ 1/54`, exit 1 |
| L3 retired names | `for c in EVEN_DIP_BASELINE LONE_SPIKE_ALLOW DEFAULT_KIT_SPIKE_FINDING; do git grep -c "const $c\b" -- src test scripts; done` prints nothing; `for c in KNOWN_BASELINE_DUP DIP_BASELINE PERCEPTUAL_DIP_BASELINE; do git grep -c "const $c\b" -- src test scripts; done` prints `test/engine/tonal.mjs:1` three times; `/usr/bin/grep -n 'since retired\|since-retired' test/engine/anchor.mjs test/engine/tonal.mjs src/engine/tonal.js scripts/report-preset-fidelity.mjs` lists lines, and every `[A-Z_]{6,}` identifier on those lines is one of the first three | as stated; `KNOWN_BASELINE_DUP` on no `since retired` line | at a28b9b22: `both since retired` at `anchor.mjs:652` pairs `KNOWN_BASELINE_DUP` with a `const` count of `1` |
| L4 R2 capture | `/usr/bin/grep -no 'src/engine/tonal.js:98[0-9]' docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md` in the handoff's `ran` block, no `cut` | two lines, `:89:src/engine/tonal.js:985` and `:71:src/engine/tonal.js:985`; the handoff's two `out ran` blocks differ on both lines | at d1db4b04: `983` on both lines |
| L5 floorRef hue | `/usr/bin/grep -n 'floorRef' src/engine/tonal.js \| /usr/bin/grep -c 'hue'` and `sed -n` of the two comment blocks | at least `2` (one per site); each block names the hue the ceilings are read at and the condition under which the reference is exact; the deferral issue number appears once in `src/engine/tonal.js` and once in the U4 line | at a28b9b22: `0`; no issue named |

L1 to L5 join the revision 21 legs (each named line re-read with `grep -n`/`sed -n`, `citations.mjs` STALE 0 and no new NEAR, `npm test` green, tree clean, the pin greps at d1db4b04 print the old lines), which stay as written.

## 5. Options

| | A. Pass 2 as section 3 (recommended) | B. Pass 2 without the record move: add a `verdict: 🟢` line to the record in place | C. Split the records fix into its own lane unit |
|---|---|---|---|
| Closes red 1 | yes, and by putting the file where the contract says | yes, but leaves a review record where only the Verifier's records live, in a shape (`verdict:` front matter) reviews do not carry; the next reviewer brief copies it | yes, one more unit, one more merge, for a one-line `git mv` |
| Closes red 2 | yes | yes | no, still needs a U4 pass 2 |
| New legs bite | L1 to L5, each with a control at a28b9b22 or d1db4b04 | L2 only | L1, L2 in the lane unit; L3 to L5 here |
| Passes | 1 | 1, plus a records-policy question later | 2 units |

Recommendation: A.

## 6. Grade

Pass 2 builder-l7 (the Orchestrator's ruling on the board row: an S unit on its second pass after a records red, xhigh effort so the legs are run, not read). An l7 build takes reviewer-l4 and verifier-l3 by the rule; fable is capped on this host, so reviewer-l3 and verifier-l2 stand in under the owner's ruling b9044bb ("Accept opus substitutes, name them in the header"), inside the builder's own model family, and each record's header says so.

Not changed by this re-diagnosis: the code commit `bbb72843` (kept as the base of pass 2), the revision 21 legs, C1 to C15, the pre-land record's 🟢 rows, U1 to U3. The pre-land pass 2 reruns at U4's merge, as revision 21 says.
