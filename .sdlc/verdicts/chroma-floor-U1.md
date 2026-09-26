---
kind: verdict
plan: chroma-floor
unit: U1
ticket: "#701"
branch: unit/cf-U1
base: plan/chroma-floor @ 650ad34b
grade: verifier-l2, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: C1, C2, C5 to C10 of .sdlc/plans/chroma-floor.md at fb85ed0b, revision 12, and the invariants the plan restates for every unit
pass: 3
passes: 1 at fb85ed0b 🔴, 2 at cbcbf9f4 🟡, 3 at ec618987 🟢
written: 2026-09-26
---

# Verdict chroma-floor U1 · passes 1 to 3 · 🟢 at `ec618987`

Current finding: 🟢 at `ec618987`, in `## Pass 3` below. Passes 1 (🔴 at `fb85ed0b`) and 2 (🟡 at `cbcbf9f4`) are history.

## Pass 1, at `fb85ed0b`: the engine change holds every invariant; C7 and C10 red on their written Expected, C2 and C8 yellow, record items open

verdict: 🔴
sha: fb85ed0b9b80a35d6a7e9b3fc9c0f45c58850f75

`unit/cf-U1` at `fb85ed0b`, which is `c6f15f78` plus a record-only commit
(`3 files changed, 3 insertions(+), 3 deletions(-)`, the three review records' tokens). The evidence
run's report is at `/tmp/v13/cf-U1-verify.md`, its logs under `/tmp/v13/cfF/`. Its clones are
`/tmp/cfv-1790397703`, `/tmp/cfv-base-1790397902`, `/tmp/cfv-ctl-1790398712` and
`/tmp/cfv-basectl-1790400112`; their delete was refused. The host ran at load 10 to 116, so no timing
here is a figure of record.

No engine defect was found. The shoulder is even-only, a factor, exactly `1` at the anchor, and gone
by 300/700. It closes the lone spikes, and the perceptual and peak output is byte-identical to the
base. The reds are criteria whose written Expected the branch does not meet.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C7 | the full leg prints `pass  chroma-envelope` | 🔴 | mine, in the run's logs: the head's `gate:corpus-tonal` FULL prints `FAIL  chroma-envelope` (`(iv dip gate) even: 3 dip instance(s) beyond the cited baseline`), exit `1`; the base prints `pass  chroma-envelope`. An instrumented copy printing every message shows two dip sub-checks under that one name. First, `3` unlisted dips, all at stop 400: Sapa `secondary\|400`, Wadi Rum `primary-muted\|400`, Yixing `primary\|400`. Second, `37 of the 90 cited baseline dips were not observed`, the 450-stop dips the shoulder closed. The uptick and duplicate-hex sub-checks raise nothing. The three stop-400 dips are absent at the base (`SEENBASE even 90 of 90, unlisted 0`), so U1 makes them: 450 rises above 400, and 400 becomes a local minimum, the plan probe's `400 3` | the base passes the same gate, so the gate can tell the two apart |
| C10 | no `docs/` path beyond the six named | 🔴 | the merge-base diff lists `4` `docs/` paths, none of the six: `docs/reference/SKILL.md`, `docs/reference/rubrics/acceptance-criteria.md`, and two under `docs/reference/reviews/2026-08-20-reactivity/`. C10 says a seventh path "is a FAIL", fixed in the plan, not in a handoff. They are forced by C1: reverting them makes `node test/repo/citations.mjs` print `✗ 4 citation gate failure(s)`, because U1 shifts lines in `tonal.js` | the reverted clone's `✗ 4` shows why the four moved |

What unblocks, all without an engine change:

1. A plan revision. C7 at U1 grades the uptick and duplicate substance, or accepts the dip sub-check
   red until U2 retires `EVEN_DIP_BASELINE` (C3). C10 admits the four citation-forced paths by name.
   C2's `lone-spike` line count moves to `2`, or the control line is reworded (below).
2. The #662 comment is posted (C8).
3. The handoff names its movement script and the missing blast-radius fields (below).

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C1 | `npm test` | 🟢 | `✓ all 50 test files passed`, TESTS `50`, tree `0` | `scrim` to `scrimX`: `✗ 1/50 test file(s) failed`, exit `1` |
| C5 | the gate-path envelope | 🟢 | even `10.9/16.2`, `39.1/52.2`, `39.0/44.6`, `16.3/16.5` all `OK`, `above 100% of stop 500: 0 OK`; perceptual and peak md5 `6e558839ee9e43217e1e2f7afc898b7b` at head and base | `--damp-amp 55`: `above 100% of stop 500: 1916 FAIL` |
| C6 | the mode-isolation gate | 🟢 | `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture`; the same two hashes recomputed at the base | the damping term scaled by `1.01` off even: `FAIL  mode-isolation: perceptual 1e74d9d21676fbf4 peak c7d4a2be791066aa do not match fixture`, exit `1`; the shoulder switched off keeps the hashes, so the gate is blind to even, as C6 intends |
| C8 | the chroma floor, and R44's five re-pins | 🟡 | the #662 comment the row asks for is not posted (its draft, `.sdlc/handoffs/chroma-floor-U1-662-comment.md`, carries one em dash); otherwise `pass  chroma-floor`, `pass  role-contrast`, `0 unlisted drops, 0 further erosion`; the comparator prints `FLOORS changed 4, down 4`, the revision-12 figure: Warning `9.9/5.3 -> 9.8/5.2`, Data 3 `6.5/4.8 -> 6.4/4.8`, Data 5 and Data 8 `5.8/5.3 -> 5.7/5.3`, all above AA; no perceptual or peak line | the comparator exits `1` on the change, as ruled, so it sees any FLOORS move |
| C9 | the hue solve | 🟢 | `max OKLab dE 0.0048` perceptual and peak, even `0.0486` (want `> 0.01`); `HEADLESS BOOT PASS` | `solveOkhslHue` offset by 30: `max OKLab dE 0.1668`, exit `1` |
| I | the color-math invariants | 🟢 | one `chromaEnvelope`, the term only in `if (isEven)`; `env(anchorStop) = 1` on `5508/5508` combinations; min abs(sd) at 300/700 `0.2241` above R `0.2`; `0` out-of-gamut cells over 3 × 94,900; target tone moved `0.0000` on all `4,531` moved cells (pixel L* within `0.3848`, 8-bit quantization); the sliders still move `env(450)` | a 69,768-point grid: `0` non-even points differ from the base |
| B | `npm run build` | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4130.1 KB`, tree `0` | `baseline-agrees` reads the new size as `STALE ui.html: baseline 4125.3 KB, tree 4130.1 KB`, so the figure is live |

## Carried

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C2 | the lone-spike gate | 🟡 | the gate line matches byte for byte: `pass  anchor-ramp lone-spike (...): 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`. But `grep -cE 'lone-spike'` prints `2`, not the Expected `1`: the review-F3 control line also matches | `uG *= 1` in place of the shoulder: `FAIL  anchor-ramp lone-spike`, exit `1` |
| M | the blast radius | 🟡 | the handoff names no movement script, so "the verifier reruns the builder's movement script" cannot be done. The run's own: `4531 / 94900` even cells moved (`4.77%`), by stop `400: 4, 450: 2162, 550: 2364, 600: 1`, max dC `19.1356` (the handoff's max); perceptual and peak `0`. The handoff's `4,580 / 94,500` is not reproducible without its script | the base-against-base run of the same script moves `0` cells |
| D | added dashes | 🟡 | `9` added: `.sdlc/adapter.md` `1`, `.sdlc/baseline.md` `1`, the #662 comment draft `1`, a review doc `1` en dash, and `5` in test code comments | the handoff and the review records carry `0` |
| T | the mode-isolation timing row | 🟡 | `0/3` quiet-host readings; a quiet set is owed before pre-land | `baseline-agrees` counts it |
| K | the other checks | 🟡 | `doc-drift-rows` `bad 1` (DD9) and `ceiling-counts: 1 failure(s)` are identical at the base; `verdict-frontmatter` `bad 11` are exactly main's 11, fixed on main by `2981f6be`, and the unit's three review records grade | the base figures equal the head's |

Nits: `test/engine/anchor.mjs:39,42` import two names only comments use; the `tonal.js` comment's
`0.222` is stop 400 at lift 0, not 300/700 (review F5, still open). The chroma-floor-U1-review.md
record grades its FIX-FIRST round `🟡`, while the rule adopted for #734 reads FIX-FIRST as `🔴`.

verdict: 🔴
sha: fb85ed0b9b80a35d6a7e9b3fc9c0f45c58850f75

## Pass 2, at `cbcbf9f4`

verdict: 🟡
sha: cbcbf9f4ea2205c2fe90bc4d8ddcd2715a66eabd

The evidence run, verifier-l2 again, is at `/tmp/v13/cf-U1-verify-p2.md`, with logs in `/tmp/v13/cfG/` and
clones `/tmp/cfv2-*1790404908` (their delete was refused).

No engine line moved since `fb85ed0b`. `tonal.js` changed in comments only (`0` non-comment lines), and
`chromaEnvelope`'s body md5 is `e2c0a679ce217c070f6567499bf942af` at both. The full rendered dump, 3
modes × 94,900 cells, is byte-identical: md5 `6c7bd643f493e82e5dd8459090fbac34` at both. So C5, C8's
ratios and the invariants carry on custody, and every other row was rerun.

Revision 13 was written after pass 1's red and takes its routes. It moves the dip sub-check from C7 at
U1 to U2's C3, and it does not lose a true red. C3's Expected is `0 dips at stops other than 500` over
the same predicate and population. At this head its line would read `24` off-anchor, the three
stop-400 dips among them, so C3 catches all three. Revision 13 also admits C10's four paths and sets
C2's count to `2`. The run notes that revision 13 lives in the revision log only; the criterion
bodies were not edited in place.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C1 | `npm test` | 🟢 | `✓ all 50 test files passed`, TESTS `50`, tree `0` | `scrim` to `scrimX`: `✗ 1/50 test file(s) failed` |
| C2 | the lone-spike gate (rev 13) | 🟢 | `grep -cE 'lone-spike'` `2`; the gate line byte-exact; `a.log` byte-identical to pass 1's | `uG *= 1`: `FAIL  anchor-ramp lone-spike`, exit `1` |
| C6 | mode isolation | 🟢 | `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture` | off-even damping × `1.01`: `do not match fixture`, exit `1` |
| C7 | uptick and duplicate sub-checks (rev 13) | 🟢 | instrumented full leg: `upticks {"perceptual":0,"peak":0,"even":0}`, `dup {"perceptual":0,"peak":0,"even":0}`, known dups `23/23`; the only red under `chroma-envelope` is the dip sub-check, carried to U2 | a second `export function chromaEnvelope`: the export grep reds |
| C8 | the floor, R44's re-pins, #662 | 🟢 | `pass  chroma-floor`, `FLOORS changed 4, down 4`, all above AA; the #662 comment is posted with the five measured cells | the comparator exits `1` on any FLOORS move |
| C9 | the hue solve | 🟢 | `max OKLab dE 0.0048`, even `0.0486` | hue offset by 30: `0.1668`, exit `1` |
| C10 | `docs/` by the fixed list (rev 13) | 🟢 | exactly the four admitted paths; the three named generated files absent; regen tree `0` | a scratch commit to a fifth doc: listed as a fifth path |
| B | build and baseline | 🟢 | `wrote figma/plugin/ui.html 4130.1 KB`; `ok    ui.html: baseline 4130.1 KB, tree 4130.1 KB`, `stale total: 0` | the row back at `4125.3`: `STALE ui.html`, `stale total: 1` |
| P | branding, dashes | 🟢 | `branding: clean (733 files scanned)`; added em or en dash `0` | one planted dash: `1` |

## The two questions the Orchestrator asked

The max dC gap is two measures, and both numbers are right. `19.1356` is the requested CAM16 chroma
(pass 1's script read `s.chroma`), at "Modal jazz" danger 550. `19.2013` is the CAM16 chroma of the
rendered 8-bit hex, at "BZZR" Danger 550, whose requested dC is `19.0268`. Both runs cover the same
4,531 cells. 8-bit rounding moves rendered chroma off the request by up to `2.8690`, enough to reorder
the top cell. The handoff swapped the number under the same "Danger, stop 550" label, which reads as a
correction; it should say it reports rendered-hex CAM16 and name its witness.

`scripts/report-chroma-floor-movement.mjs` is outside U1's scope. C10 does not measure `scripts/`, so
C10 stays 🟢. But the plan's blast-radius text asks for "a scratch script ... and names the script; no
new report flag", U1's file list names `scripts/report-preset-fidelity.mjs` only, and R54 says "No new
scope". A committed 114-line file is more than a named scratch script. If it stays, two limits need
writing into its header:

- Its default base, `git merge-base HEAD origin/main`, becomes the head itself once the plan lands, so
  it will then print `0` moved.
- It hard-codes `model.mjs`'s 15 import strings and exits `2` if any move.

## Notes, none a red

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| S | the movement script: keep or drop | 🟡 | the Orchestrator rules before pre-land, keep with the two limits in its header or drop at U3's sweep; nothing runs it (`0` references from gates or tests) | the script at base = head prints `0 / 94900`, so it measures what it claims |
| CT | two citations pass 2 made NEAR | 🟡 | `00-synthesis.md:89` and `04-context-and-messaging.md:71` cite `src/engine/tonal.js:958`; `okhslLAt` moved to `:959` with the new comment line. The gate stays green; the audit at `fb85ed0b` had neither line. Both paths are C10-admitted, so `958` to `959` is inside scope | the audit diff `fb85ed0b` to `cbcbf9f4` adds exactly these two |
| M | blast-radius fields in the handoff | 🟡 | still missing: presets moved, palettes per mode, max dL*, max dC per stop. The plan has the verifier read the 15% line from its own run, and it does: `4531 / 94900` (`4.77%`), presets `344/344`, palettes `2417/3796`, max dC by stop `2.21 / 18.01 / 19.14 / 1.46` | the base-against-base run moves `0` |
| T | the mode-isolation timing row | 🟡 | `0/3` quiet-host readings, owed before pre-land | `baseline-agrees` counts the row |

Why 🟡 and not 🟢. Every criterion U1 owns is met, but pass 1 named three routes to 🟢, and one of them
is unmet: the handoff still lacks the blast-radius fields (M). Pass 2 also made two citations stale (CT),
and the stale-context rule treats that as a defect. Neither needs an engine change. The script ruling (S)
and the timing row (T) are due before pre-land. An earlier text of this pass read 🟢; it is corrected
here to agree with pass 1's own routes.

One plan-text mismatch: C7's control that keys the term on `stop` does red, but on `damping-curve` and
`intensity-legacy`, not on the `skew-lift-okhsl (iii c)` gate the plan names.

Also carried: `doc-drift-rows` `bad 1` (DD9) and `ceiling-counts: 1 failure(s)` (#755) are identical at
the base. `verdict-frontmatter`'s `bad 11` are main's records, fixed on main, and clear when main is
merged in. No reviewer record covers the pass-2 commit. The `tonal.js:398` comment says "well outside
R" where the lift-±40 bound, `0.2241`, is just outside `0.2`.

verdict: 🟡
sha: cbcbf9f4ea2205c2fe90bc4d8ddcd2715a66eabd

## Pass 3, at `ec618987`

verdict: 🟢
sha: ec618987b21aad0b3ce3e44530468d69fd27a21b

Run by me. `git diff --stat cbcbf9f4 ec618987` is 4 files: the handoff, the two cited docs, and
`scripts/report-chroma-floor-movement.mjs` removed (`114` lines). No `src/` or `test/` file moved, so
pass 2's criterion rows carry on custody. I reran the rows the delta can touch.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| CT | the two citations | 🟢 | both now cite `src/engine/tonal.js:959`, where `export function okhslLAt` sits; the audit reads `OK` on both; `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD ec618987)` | at `cbcbf9f4` the same two lines read NEAR at `:958` |
| S | the script dropped, per the Orchestrator's ruling | 🟢 | `git ls-tree ec618987 scripts/` lists it `0` times; `0` references from any `.mjs`, `.json` or `.yml`; the scratch copy the handoff names, `/private/tmp/claude-501/report-chroma-floor-movement.mjs`, differs from the committed version only in its header comment | at `cbcbf9f4` the file is tracked |
| M | the blast-radius fields | 🟢 | the handoff's movement table now carries presets `344 / 344`, palettes per mode `0`, `0`, `2,417 / 3,796`, cells `4,531 of 94,900` (`4.77%`), max dC by stop on the rendered hex `2.25 / 18.40 / 19.20 / 1.52`, overall `19.2013` with its measure named, and max dL* `0.3848`; each matches pass 2's own run (the requested-chroma figures differ by the named measure) | pass 2's handoff lacked every one of these |
| C1 | `npm test` | 🟢 | fresh clone at `ec618987`, no `node_modules`: `✓ all 50 test files passed`, tree `0` | pass 2's `scrim` plant, same test path |
| P | branding, dashes | 🟢 | `branding: clean (732 files scanned)`; added em or en dash `0`; `baseline-agrees` `stale total: 0` | pass 2's plants |

Carried: the handoff's C12 row still quotes `STALE ui.html` at `4125.3`, `stale total: 1`, which was
true before the correction paragraph and is stale now (`stale total: 0`). That's for the close-out. The
mode-isolation timing row (T) is owed before pre-land. `doc-drift-rows` `bad 1` (DD9) and #755's
ceiling-counts failure are main's.

verdict: 🟢
sha: ec618987b21aad0b3ce3e44530468d69fd27a21b
