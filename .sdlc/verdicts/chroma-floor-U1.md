---
kind: verdict
plan: chroma-floor
unit: U1
ticket: "#701"
branch: unit/cf-U1
base: plan/chroma-floor @ 650ad34b
grade: verifier-l2, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: C1, C2, C5 to C10 of .sdlc/plans/chroma-floor.md at fb85ed0b, revision 12, and the invariants the plan restates for every unit
pass: 1
written: 2026-09-26
---

# Verdict chroma-floor U1 · 🔴 · the engine change holds every invariant; C7 and C10 red on their written Expected, three record items open

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
| C8 | the chroma floor, and R44's five re-pins | 🟢 | `pass  chroma-floor`, `pass  role-contrast`, `0 unlisted drops, 0 further erosion`; the comparator prints `FLOORS changed 4, down 4`, the revision-12 figure: Warning `9.9/5.3 -> 9.8/5.2`, Data 3 `6.5/4.8 -> 6.4/4.8`, Data 5 and Data 8 `5.8/5.3 -> 5.7/5.3`, all above AA; no perceptual or peak line | the comparator exits `1` on the change, as ruled, so it sees any FLOORS move |
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
