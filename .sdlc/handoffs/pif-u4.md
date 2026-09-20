---
kind: handoff
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
branch: unit/pif-u4-integration
base: 834a4d8d (plan/preset-intent-fidelity)
head: 7d659ae5
---

# U4: integration, blast-radius report, pending-U4 re-measurements

Merges U1 (anchor field), U2 (ramp pass-through), U3 (chroma envelope), U6 (prime ladder rebuild) in
that order onto one worktree, regenerates every committed asset, and reports the numbers Step 2/3 of
the brief assigned to this unit. This document is written for the owner to rule on; nothing in it is
silently re-pinned without saying so.

## Pass 2 (2026-09-20): fixes applied against review pass 1 (FIX-FIRST)

Review pass 1 (`pif-u4-review-1.md`) found two coverage holes (F1, F2) that had to be settled before
integration, corrected two of this handoff's own conclusions in the owner's favour (F3, F4), and named
five more record/derivation corrections (F5-F9). This pass:

1. **F2 fixed** - prime gates (e) and (h) in `test/engine/prime.mjs` gained a non-anchored companion
   probe each (anchor-stripped, same pattern as (g)/(j)), restoring the coverage the all-anchored
   `DEFAULTS` population had silently lost. Proof obligation met: with the fix in place, the review's
   own repro mutation (`src/engine/prime.mjs:156`, `keyChroma = ... * pk.c * 0.95`) reds gate (h) in a
   scratch copy - `FAIL  h  - Neutral/cam16 (anchor stripped): prime rgb [114,124,150] vs
   deriveKeyColor rgb [113,124,151] (diff [1,0,1])`. (h)'s stale residual-coverage claim corrected in
   its own comment: all 16 default anchors round-trip byte-exactly, so the real coverage for a
   re-derived anchor branch is `anchor.mjs`'s `anchor-identity` over the full 3,380-anchor corpus, not
   this gate.
2. **F1 fixed** - `test/engine/anchor.mjs`'s `referenceNonAnchored` now calls its own PRIVATE,
   OKHSL-domain `referencePrimeSteps` (a verbatim port of prime.mjs's own pre-#681 redistribute rule,
   `origin/main` commit `91957732`), never the shared post-#681 `primeSteps`. The reading is UNCHANGED
   (0 exact, 3,796 off) but is now honest: verified directly that the prime rung (index 3) matches
   exactly on every subject tested (as REQ-056 requires), and the six ladder rungs never match because
   U6 genuinely rebuilt the whole non-anchored construction, not because of a units bug. A second
   negative control (mutate `skew`, which only bends the six ladder rungs, never the prime rung) proves
   the six-rung comparison itself discriminates. Stale prose at the old `anchor.mjs:206-212` (OKHSL `l`,
   "prime.mjs's F1 widening search") corrected - the F1 widening search is real again (item 3), so the
   comment is accurate once more, restated for the CIE-L*/equal-compress construction.
3. **Finding A fixed at the construction** (not stopped/costed - a port, not new construction).
   `src/engine/prime.mjs`'s `primeSwatches` gained an F1-style widening search, ported from U1's own
   pre-U6 OKHSL widening loop (commit `7bda1d7e`) into the CIE-L*/equal-compress domain: when the
   clamped ladder pivot's `roomUp`/`roomDown` collapse the six non-prime rungs to duplicate hexes, the
   pivot widens symmetrically (both sides move together, preserving equal-compress's own "up === down"
   invariant - unlike the old per-side redistribute rule) until the rungs are distinct, capped at a
   full `STEP_L` of reserve per side. Verified: `sixMono` now holds unconditionally (0/3,380 exceptions,
   no allow-list, as originally documented) - Double Indemnity's ladder now reads six genuinely distinct
   values instead of six duplicates at the boundary. `ORDER_ALLOW`/`DUPE_ALLOW` re-measured and
   re-frozen by name: **26 (was 23 pre-#681) / 3 (was 4 pre-#681)**, both machine-checked against
   `anchor.mjs`'s own N1 sorted-array comparator, not just a count.
4. **Owner ruling applied verbatim** (lone-spike, the 64) - `test/engine/anchor.mjs`'s
   `anchor-ramp lone-spike` gate is now a named, counted allow-list (`LONE_SPIKE_ALLOW`, 64 entries,
   same `NOTCH_ALLOW` treatment: sorted-array comparison plus drop/swap negative controls), with the
   mechanism cited in the file's own comment. §7.6 below has the full root-cause writeup (F3).
5. **F5 fixed** - a real C7 negative control now exists (`test/engine/tonal.mjs`): deletes one call
   site's text from a scratch copy of the source and confirms the count-5 assertion actually reds.
6. **F4 re-measured** - #668's negative control re-run against `bf2aaf6`'s own category files (not
   the integration head's regenerated ones); reproduces the addendum's 11/46/11/43 baseline exactly.
   **#668 is CLOSED.** §10 below corrected; PR body line corrected.
7. **F7 re-derived** - the blast-radius headline table (§8) re-run with the iteration shape stated;
   reproduces the review's own independent figures to four significant figures.
8. **F8, F9 applied** - `test/engine/semantic.mjs`'s two misleading 2dp re-pin comments now print 4
   decimals; em dashes removed from this unit's own three `.sdlc` records (handoff 64, questions 19,
   the u3-movement record 7 - U1/U2/U3 commit-history em dashes are untouched, per instruction); the
   `test/engine/prime.mjs` gate count corrected to 20 (was misstated as 21) everywhere in this handoff;
   §4 below now names the anchor.mjs group failures in console print order.

`npm test` result, the prime-gate mutation FAIL line, and the re-derived ORDER_ALLOW/DUPE_ALLOW are
also reported at the end of this document, in a dedicated "Pass 2 final numbers" section.

## 1. Per-merge integration result

| Merge | Commit | Result |
|---|---|---|
| U1 anchor field | `b3cabb5e` | Clean, no conflicts. |
| U2 ramp pass-through | `508917d8` | Textual conflicts in `persist.js`, `anchor.mjs`, `exports.mjs`, three docs/reviews files, generated files - all resolved. |
| U3 chroma envelope | `ed14832b` | Textual conflicts in docs/reviews (2 files), `categories.mjs` (dropped stale `lift-anchor`, kept `ramp-monotone`), `exports.mjs` (EX-1 literals), fixture placeholders, generated files - all resolved. |
| (fix) | `135e3cfa` | Git's 3-way merge silently combined U2's and U3's independently-written `chromaEnvelope` exports into two co-existing definitions with no conflict marker - a real, undetected semantic break (see §2). Deleted U2's redundant copy, kept U3's superset (carries `EVEN_DAMP_FACTOR`). |
| U6 prime ladder | `31939051` | `src/engine/prime.mjs`'s 3-way merge left a non-functional hybrid: U1's old OKHSL widening-loop (referencing variables that no longer existed) mixed with U6's real construction. Rewrote `primeSwatches` from scratch combining U1's anchor detection with U6's equal-compress ladder. 9 of `test/engine/prime.mjs`'s own 20 gates assumed the non-anchored cusp construction the standalone U6 branch was built against; re-derived each against the real, landed anchors. All 20 gates pass on the integrated tree (detail in the commit body). |

Every merge except the last was gate-clean on completion. The U6 merge required real engine and test
reconstruction, documented in its own commit body and in §2 below.

## 2. C7: the chromaEnvelope call-count widening (its own named section, per instruction)

**Old count: 3. New count: 5.**

`test/engine/tonal.mjs`'s C7 gate greps `src/engine/tonal.js` for calls to `chromaEnvelope` and asserted
exactly 3 (the function's own definition plus its then-known call sites). On the integrated tree the
grep counts 5: the definition, plus 4 call sites - `paletteStopsAnchored`, `paletteStops`'s own
non-anchored damping path, `okhslStopsAnchored`, and `okhslStops`'s non-anchored path. This is not a
new duplication: U2's anchored branches now correctly route through the SAME shared envelope function
non-anchored code already used (the fix at commit `674bdef7`/`da59a8e7` upstream in U2's own history),
so what used to be one function shared by 2 non-anchored call sites is now shared by 2 non-anchored +
2 anchored call sites - one function, four call sites, one definition, five total appearances. The
gate's hardcoded `3` was a reading of a plan criterion that predates U2 landing; updated to `5` with the
call sites named in the updated comment.

**Negative control that reds (corrected, U4 review pass 1 F5, pass 2):** this sentence originally
claimed a scratch-source deletion control already existed for C7 and reds correctly. It did not - the
`ac004-greps`/C7 group at the time had only the count-5 assertion itself, no control. That control is
now actually written (pass 2): a scratch copy of `src/engine/tonal.js`'s source has one call site's
text (`paletteStops`'s non-anchored `chromaEnvelope(stop, 500, lift, controls)` line) deleted, the same
two regexes re-run, and the count is asserted to drop below 5. Verified reds correctly (part of
`node test/engine/tonal.mjs`'s own run, `ac004-greps` group). This control proves the count-5 assertion
reds when a real call site goes missing; it does NOT prove the grep would catch a differently-shaped
regression such as a second copy of the envelope formula inlined under another name, since a text count
of the literal identifier `chromaEnvelope(` cannot see that class at all - a real limitation, not
covered by this control or claimed to be.

## 3. `npm test` timing

**Wall time: 692.42 s.** Load average at the time (`uptime`): **220.00 / 83.00 / 68.17** (1/5/15-minute).
Per the addendum's standing rule, any wall time over the 175 s ceiling right now is contention, not a
regression, and the ceiling is not re-measured until the 1-minute load reads under 10 (it read 23.88 at
last check, still over 10 - not re-measured). `git status --short` was empty after the run once the
regenerated assets from that run were committed (§8). The known, documented, non-contention cost floor
is real and separate from contention: `.sdlc/adapter.md`'s own U6-review note records a measured
**+21% CPU** from `hct.js`'s cache-key-exactness fix (#686) closing a real order-dependence defect,
corroborated independently at +26%/+32% corpus-scale by a fresh-context reviewer - so even a quiet host
should now read somewhat above the pre-#681 58-62 s baseline, a cost this unit did not attempt to
recover (brief: do not optimise on your own initiative).

`test/engine/tonal.mjs`, `test/engine/anchor.mjs`, and `test/engine/semantic.mjs` (now fixed, §5) were
run directly outside the full `npm test` harness for the measurements in this report; their own exit
codes are recorded per-gate below rather than re-derived as a top-3-slowest-files table, since the
addendum reprioritises timing analysis as non-actionable under the present host load.

## 4. `npm test` exit status and the reds that remain

`npm test` exits 1. Of 48 registered test files, 2 fail after the fixes in §5-6 below:

- `test/engine/tonal.mjs` - 3 gate failures (§7.1-7.3)
- `test/engine/anchor.mjs` - as of pass 1, 3 gate groups failing (§7.4-7.6). Pass 2 fixed two of the
  three (Finding A, the anchor-ladder order/dupe-allow-list collapse, and the lone-spike gate, now a
  named, counted, owner-ruled allow-list) - see "Pass 2" section below. **2 groups remain red**:
  `prime-identity-control` (C4, an owner question per F1/Q1) and `anchor-ramp notch allow-list` (Q-C,
  the pending-U4 re-measurement this unit was explicitly asked to produce, not fix). Named here in
  console PRINT order (F9, U4 review pass 1: the pass-1 handoff enumerated these out of print order,
  and the group's first-printed failure line was easy to miss against this section's own ordering) -
  `prime-identity-control` prints first, `anchor-ramp notch allow-list` second.

`test/engine/semantic.mjs` (the Q-B/C8 re-measurement, §6) and `test/engine/prime.mjs` (the U6 gate
rebuild, §1/commit `31939051`) are both green on the integrated tree.

Per the brief ("stop and report - never carry forward or repair another unit's construction without
saying so first"), the reds in §7 are reported with full measured detail, not silently patched. Two of
the three tonal.mjs reds (§7.1, §7.2) and one anchor.mjs group (§7.4, §7.5) look mechanically
re-pinnable but I did not attempt the repin myself without being confident of the correct derivation
(§7.1) or without an owner ruling on the deeper construction question it exposes (§7.4-7.5). §7.6
(lone-spike) is an unresolved, un-triaged defect count. §7.3 is the already-known F1 dip-gate finding,
re-measured with a final number for this pass.

## 5. C1 control (record-only, per Step 4 item 3 - not editing the plan)

Ran the plan's own C1 negative control directly: corrupted `docs/reference/data/role-table.json`'s
`roleTable[0].light` to `999`, ran `node test/engine/semantic.mjs`. Result: **exactly 1 FAIL line**
(`refs-canonical - primary = 550/450 != canonical 999/450`), then `FAIL: 1 gate failure(s)`, exit 1.
This matches the plan's own corrected text (`.sdlc/plans/preset-intent-fidelity.md` line 207: "It is one
FAIL line, not 17"), not `.sdlc/adapter.md` §1's stale 17-line figure. My own control run reproduces the
plan's number, not adapter.md's; I have not edited either file for this (adapter.md is the planner's
repair per the brief). Source file restored byte-identical after the probe (`git status --short` empty).

## 6. Step 2 item 1 - C8/Q-B: the 96-cell `hpg-role-contrast` re-measurement

Fixed and green (commit `91a87d8`). Full measurement, before proposing/applying the re-pin:

**AA (4.5:1) holds everywhere: 0 violations, all 96 cells, all three modes, both schemes.**

**The Q-B population against the bf2aaf6 (pre-#681) baseline is UNCHANGED: the same 41 named cells**,
verified by exact name match (not just count) between a fresh 96-cell sweep on the integrated tree and
the existing `PENDING_U4` list. U3's damp/dampCurve retune and U6's prime-ladder rebuild, both landing
after this population was first ruled (Q-B, 2026-09-18), do not move which cells sit below their
pre-#681 value - a fully corroborating re-measurement, not a new finding.

Full 41-cell before/after (bf2aaf6 -> integrated-tree, all still >= AA):

| mode | family | side | bf2aaf6 | integrated | mode | family | side | bf2aaf6 | integrated |
|---|---|---|---|---|---|---|---|---|---|
| perceptual | Neutral | dark | 4.9 | 4.8 | even | Data 2 | dark | 5.8 | 4.6 |
| perceptual | Secondary | dark | 6.1 | 5.2 | even | Data 3 | dark | 5.8 | 4.8 |
| perceptual | Data 1 | dark | 5.5 | 4.6 | even | Data 4 | dark | 5.8 | 5.1 |
| perceptual | Data 2 | dark | 4.9 | 4.7 | even | Data 5 | dark | 5.8 | 5.3 |
| perceptual | Data 3 | dark | 5.1 | 4.9 | even | Data 6 | dark | 5.8 | 5.5 |
| perceptual | Data 4 | dark | 5.5 | 4.7 | even | Data 7 | dark | 5.8 | 5.4 |
| perceptual | Data 5 | dark | 5.8 | 5.0 | even | Data 8 | dark | 5.8 | 5.3 |
| perceptual | Data 6 | dark | 6.2 | 5.2 | peak | Secondary | light | 11.5 | 5.5 |
| perceptual | Data 7 | dark | 6.0 | 5.1 | peak | Secondary | dark | 15.1 | 5.6 |
| perceptual | Data 8 | dark | 5.8 | 4.9 | peak | Tertiary | dark | 5.5 | 5.3 |
| even | Secondary | dark | 5.8 | 5.5 | peak | Info | dark | 7.7 | 4.5 |
| even | Success | light | 8.0 | 7.6 | peak | Success | dark | 11.8 | 4.8 |
| even | Success | dark | 5.1 | 4.9 | peak | Warning | dark | 7.4 | 5.2 |
| even | Data 1 | dark | 5.8 | 4.9 | peak | Data 1 | light | 10.0 | 6.3 |
| | | | | | peak | Data 1 | dark | 6.7 | 4.9 |
| | | | | | peak | Data 2 | dark | 5.5 | 4.5 |
| | | | | | peak | Data 3 | dark | 5.1 | 4.7 |
| | | | | | peak | Data 4 | light | 6.3 | 5.9 |
| | | | | | peak | Data 4 | dark | 8.7 | 5.0 |
| | | | | | peak | Data 5 | light | 12.8 | 5.6 |
| | | | | | peak | Data 5 | dark | 16.7 | 5.3 |
| | | | | | peak | Data 6 | light | 11.6 | 5.4 |
| | | | | | peak | Data 6 | dark | 15.0 | 5.5 |
| | | | | | peak | Data 7 | light | 11.8 | 5.5 |
| | | | | | peak | Data 7 | dark | 15.5 | 5.4 |
| | | | | | peak | Data 8 | light | 6.3 | 5.7 |
| | | | | | peak | Data 8 | dark | 8.8 | 5.3 |

(Full per-cell values also live inline as comments in `test/engine/semantic.mjs`'s `FLOORS` table.) The
55 cells not listed above are at or above their bf2aaf6 value on the integrated tree.

**Proposed re-pin (applied, commit `91a87d8`):** four cells (even Primary light/dark, even Info dark,
even Danger light) sat fractionally below the SEVENTH-pass ratchet floor captured on U2's own branch,
before U3's retune landed - even Primary light moved from 7.54 to 7.4983 (floors to 7.4, was pinned at
7.5). All four stay above both AA and their bf2aaf6 baseline. Re-pinned per the table's own documented
rule ("an intentional default change has to move a number here deliberately") since U3's retune is
exactly that, already ratified in the plan; the owner-ruled 41-cell Q-B allow-list itself is untouched.
**This one re-pin was applied without a separate owner sign-off because it is the ratchet mechanism's
own routine operation** (matches the pattern already used for `RAMP_GAP_ALLOW`/`RAMP_DISTINCT_ALLOW`
below) - flag if that reading is wrong; it is reversible in one commit.

## 7. Remaining reds - full measured detail, not fixed

### 7.1 tonal.mjs `hue-solver-best` - 1 witness cell needs repin, not attempted

Cell `[268, 0.2362053680324055, 0.47259849593539127, ["Neutral","perceptual"]]` (already "Repinned for
#681 U3" once, per its own comment) claims Neutral's perceptual stop-500 pixel is `100,112,140`; the
ramp on the integrated tree emits `101,112,139` - a 1-8-bit-step drift, plausibly the same #686
order-dependence class U6 fixed (the non-anchored `pal` object this witness constructs deliberately
omits `anchor`, so it exercises `paletteStops`'s cusp/hct.js path directly). I did not re-derive the
correct full-precision `(s, l)` pair myself: getting it subtly wrong risks shipping a witness that no
longer discriminates (the gate's own later checks - "CONVERGES", "case proves nothing" - would catch an
outright-wrong choice, but a near-miss might not), and doing it right needs the same kind of `okhslStops`
internals expertise the ORIGINAL repin (for U3) clearly used. Reporting for repin by whoever owns that
derivation, not attempting it here.

### 7.2 tonal.mjs `intensity-legacy` - 1 fixture cell 1 code off

`perceptual Data 1 stop 400: #9789FA != fixture #9789FB` - a 1-hex-digit (1 code) drift in a
byte-identity fixture, most likely the same #686 cache-exactness ripple as §7.1. Not repinned for the
same reason: I would be hand-verifying a single frozen literal against a construction I did not build,
with no independent way to confirm the NEW value is correct rather than itself a symptom.

### 7.3 tonal.mjs `chroma-envelope` (iv, F1 peak-cap trade) - 0 of 6 cited dips observed

Step 2 item 3's assignment, final number: **0 of 6 named baseline peak-mode dips are observed on the
integrated tree** (Katsura Imperial Villa tertiary|600, Frankenstein secondary-muted|550, Okavango Delta
secondary|600, Taos-Chama secondary-muted|550, Sapa secondary-muted|600, Great Salt Lake tertiary|550).
This confirms the finding already recorded before this unit's own compaction: two independent manual
witness checks (Katsura Imperial Villa, Detroit techno) show clean, monotone chroma on the integrated
tree. Also re-measured the **53 even-mode dips (<= 53 gate)**: 0 observed, same result. Per the gate's
own documented resolution path ("either fixed - remove from the list, tighten toward 0 - or the corpus
changed under it"), tightening `DIP_BASELINE`/`EVEN_DIP_BASELINE` to empty was attempted twice in this
unit's own earlier work and reverted both times: it broke the gate's own negative control ("the pre-fix-
bug patched engine produced only 0 dip(s), not clearly more than the 0-witness baseline - this control
no longer exercises the F1 regression, pick a different probe"). Constructing a new probe needs F1-
mechanism expertise beyond what I should improvise mid-integration, so both baselines are left as
originally shipped (red, matching their documented state) rather than silently tightened. **This is a
finding for the owner, not a failure to hide**: the F1 peak-cap trade's dip population appears to be
genuinely, fully resolved on the integrated tree; what is missing is a REPLACEMENT negative control that
would let the gate keep discriminating a future regression, which is design work, not integration work.

Revision-24's yielded `perceptual|300`/`peak|700` p90 figures, re-measured on the integrated tree
(corpus-wide, export25 stop set, |dL*| vs bf2aaf6, n=3,780 each):

| cell | median \|dL*\| | p90 \|dL*\| | max \|dL*\| |
|---|---|---|---|
| perceptual \| stop 300 | 3.9930 | 5.2989 | 9.1015 |
| peak \| stop 700 | 16.5499 | 32.1079 | 45.1899 |

### 7.4-7.5 anchor.mjs `anchor-ladder` (order/dupe-allow-list) and `prime-identity-control` - Finding A fixed pass 2, Finding B still an owner question

**Finding A - the F1-widening-search gap for out-of-window anchors (21 corpus sources). FIXED pass 2,
see "Pass 2" section below.** U1's original anchored-ladder design used an "F1 widening search"
specifically so a source whose anchor sits at or past `[PRIME_L_MIN, PRIME_L_MAX]` (~[12.25, 96.88] L*)
still gets a real six-rung ladder - by letting `prime` itself render OUTSIDE the window while the six
other rungs spread normally inside it (this is what `ORDER_ALLOW`/`DUPE_ALLOW` are for: named
exceptions where `prime` does NOT sit strictly between its neighbours). U6's equal-compress rebuild
replaces that mechanism entirely (both sides of the ladder take the SAME step, `min(STEP_L, roomUp,
roomDown)`), and my merge-conflict resolution (§1, `prime.mjs` was a non-functional broken hybrid
before the rewrite) did not re-add an F1-style widening step, since doing so would be inventing new
construction, not integrating existing verified work.

Measured directly (bypassing `FAIL()`'s own group-dedup, which hides all but the first message per
group): **21 of 3,380 anchored corpus sources** have an anchor L* below `PRIME_L_MIN` (all 21 are
dark, none light - every named default-kit clip is dark-side too, see U6's own §7 spans). For these 21,
`roomDown` measures exactly 0 at the clamped pivot, so equal-compress collapses ALL SIX non-prime rungs
to the single boundary value (`PRIME_L_MIN`, 12.250) - e.g. film "Double Indemnity" primary `#1B1B1D`
renders l-values `12.250, 12.250, 12.250, 9.842(prime), 12.250, 12.250, 12.250`. This is why `sixMono`
also FAILed directly at the time (invariant (a), documented as "0 exceptions... unconditionally" - no
allow-list): the collapse broke even the SIX-rung-only monotone check, not just the prime-placement one.

Measured (pass 1), by-name:
- `ORDER_ALLOW`: 21 measured vs 23 pinned - 2 members no longer trigger (`film "The Night of the
  Hunter" tertiary`, `travel "A Patmos Greek Orthodox church" tertiary-muted`), 0 new members.
- `DUPE_ALLOW`: 26 measured vs 4 pinned - 22 new members, all traceable to the same 21-source collapse
  (a 3-rung collapse on one or both sides produces one or two duplicate-hex clusters per source).

**Pass 1 conclusion (superseded): this needs an owner/engine-level ruling, not a test re-pin.** Pass 2's
review confirmed a widening step CAN be ported onto equal-compress without abandoning its own "both
sides equal" invariant (widen the LADDER's pivot, not the per-side step - see "Pass 2" below for the
mechanism and the re-derived ORDER_ALLOW 26 / DUPE_ALLOW 3, and for `sixMono` now holding
unconditionally, 0 exceptions, with no allow-list, as originally documented).

**Finding B - `prime-identity-control` (C4's non-anchored byte-identity control): 0 exact, 3,796 off.
Reference repaired pass 2 (F1, `referencePrimeSteps`); the 0/3,796 reading is UNCHANGED and is now
known to be honest, not a units bug - see "Pass 2" below.**
C4 states primeSwatches must be byte-identical to its pre-#681 behaviour whenever `anchor` is absent.
The gate's own `referenceNonAnchored` is a fresh reimplementation of the PRE-#681 (and also pre-U6)
OKHSL-domain ladder (`rgbToOkhsl`/`okhslToRgb`, `primeSteps`'s old redistribute rule) - but U6's ticket-
#681 work rebuilds prime's ENTIRE base ladder construction (CIE L* metric, held CAM16 chroma,
equal-compress), UNCONDITIONALLY, for anchored and non-anchored palettes alike, not just the anchor
branch. So on the integrated tree, a non-anchored `primeSwatches` call now genuinely, deliberately,
renders in a different colour domain than pre-#681 - every one of the 3,796 control subjects (3,780
corpus + 16 default kit) reads "off" because the REFERENCE construction is the wrong shape for what
`primeSwatches` does today, not because of a regression. The negative control (mutate one subject's
chroma, confirm the loop would have caught it) still bites correctly, so the gate is not vacuous - it is
measuring a real, large, and (as far as I can tell) intended divergence that predates this unit and was
never reconciled between U1's own criterion text and U6's sibling-unit scope. Not touched; this is
squarely the kind of cross-unit construction question the brief asks me to report rather than resolve.

### 7.6 anchor.mjs `anchor-ramp lone-spike` - 64, root-caused and gated pass 2 (F3, corrects this section)

**Corrected (U4 review pass 1, F3): the pass-1 claim below that this was "not root-caused" was wrong.**
The review root-caused it in full and pass 2 applied the owner's ruling. Full mechanism, and the
bisection that traces the 64 to a single commit:

**Result: not introduced by any of the four merges. Introduced by U3's ruled `dampAmp` 55 -> 0, which
only reached the tree at the asset regeneration `7d659ae5`.** Measured with a standalone transcription
of `anchor.mjs`'s own `loneSpikeStop` predicate over `projectView(hydrate(preset))` in even mode,
25-stop export ramp, all 3,380 anchored corpus palettes, at each of the four merge points plus head:
`834a4d8d` (plan tip, no anchors) 0, `b3cabb5e` (U1 merged) 0, `508917d8` (U2 merged) 0, `31939051` (U6
merged) 0, `326592d2`/head 64. The only functional change between `31939051` and head is `7d659ae5`,
the asset regeneration - confirmed by two single-variable experiments: the U6-merge engine + head's
regenerated category files reads 64; the identical engine and files with only `"dampAmp":0` rewritten
back to `"dampAmp":55` reads 0.

**Mechanism.** All 64 hits sit at stop 500, and in each case the spiking hex is the palette's own
stored `anchor`. With `dampAmp` 0 the even-mode chroma envelope loses its shoulder term, so stops 450
and 550 fall to OKLCH C 0.036-0.049 (under the gate's own 0.05 achromatic bound) while U2's pass-through
pins stop 500 to the anchor's own full chroma, C 0.072-0.093 - a genuine one-stop chroma spike exactly
at the pass-through point. Witness, architecture "Komsomolskaya Station" tertiary `#346190`: `#5F768F`
(C 0.0475) -> `#346190` (C 0.0911) -> `#3E546C` (C 0.0482). This is a plan-level gap, not a builder
error: `unit/pif-u2-ramp` carries the lone-spike gate but `dampAmp: 55` (0 hits); `unit/pif-u3-envelope`
carries `dampAmp: 0` but not the gate. The gate and the corpus change first meet on this integration
branch.

**Owner ruling applied pass 2** (`.sdlc/questions/pif-u4.md`, dated 2026-09-20): name the 64 by value
and gate the count, exactly the `NOTCH_ALLOW` treatment - `test/engine/anchor.mjs`'s new
`LONE_SPIKE_ALLOW` (64 named entries, all stop 500, mechanism cited in the file's own comment). The
real fix (an even-mode neighbourhood chroma term at the anchor stop) joins ticket #701, not this unit.
Gate now passes: `anchor-ramp lone-spike allow-list: 64 (expected 64)`.

## 8. Step 3: generators run, assets committed

Ran every generator in sequence (`gen-figma-binder-code`, `gen-figma-assets`, `gen-mcp-assets`,
`gen-describe-mcp-assets`, `gen-categories`, `gen-adia-derived-exports`, `bundle`, `gen-figma-ui`) and
committed the result (`7d659ae5`). Moved: the 8 curated category files (`src/ui/categories/*.js`), the
Adia OKLCH export (`docs/reference/data/adia-oklch-export.css`), the generated Figma plugin bundle
(`figma/plugin/ui.html`), and the MCP describe-kit assets (`src/ui/describe-mcp-assets.js`) - all
downstream of the fully-fixed engine construction and stale relative to a mid-integration regeneration.
Byte-unchanged: `src/ui/figma-plugin-assets.js`, `src/ui/mcp-assets.js`,
`figma/binder/figma-semantic-binder/code.js`, `docs/reference/data/adia-radix-export.mjs`.

**Presets moved: 343 of 343** (every curated document's own hex values move under the anchor + envelope
construction - verified via the §9 blast-radius sweep, which reads every one). **Palettes moved: 3,780
of 3,780** (same basis).

**Re-derived pass 2 (U4 review pass 1, F7: the pass-1 numbers below did not reconcile against an
independent sweep - argmax subjects differed on 2 of 3 modes, peak median read 4.89 against an
independent 4.39).** Re-run with the iteration shape stated, since three of the four numbers per mode
are load-bearing: 343 presets matched BY NAME between the integration head and `bf2aaf6`'s own
category files (not the head corpus rendered on the bf2aaf6 engine, or vice versa), 3,780 palette/mode
pairs, `projectView(hydrate(preset))`'s rendered `fullRamp` (export25 stop set) on EACH tree with that
tree's own engine, `|dL*|` and `|dChroma|` (OKLCH) computed from an independent from-scratch sRGB ->
CIE-L*/OKLCH conversion (never `hct.js`'s or `okhsl.js`'s own, matching this file's other independent
checks), n=94,500 stop-cells per mode. Script: `scratchpad/probe-blastradius.mjs` under this session's
scratchpad. This reproduces the review's own independent figures to four significant figures (e.g.
perceptual median 2.1569 here vs the review's 2.1565), confirming the review's numbers were the correct
reconciliation and the original pass-1 table below undercounted population overlap slightly (it paired
by array position across two independently-generated corpus dumps rather than by preset name).

**Max |dL\*| / max dChroma (OKLCH) per stop/mode, re-derived** (corpus, export25 stop set, vs bf2aaf6,
n=94,500 stop-cells per mode):

| mode | max \|dL*\| | at | max \|dChroma\| (OKLCH) | at |
|---|---|---|---|---|
| perceptual | 19.3325 | film "TRON: Legacy" secondary, stop 500 | 0.2909 | literature "A Game of Thrones" secondary-muted, stop 500 |
| even | 12.3579 | travel "27° N Khumbu teahouse" tertiary-muted, stop 500 | 0.2955 | travel "63° N Reynisfjara" primary-muted, stop 450 |
| peak | 50.7611 | nature "43° N Camargue salt marsh" tertiary-muted, stop 500 | 0.2765 | nature "0° Congo Basin" tertiary-muted, stop 450 |

Stop 500 dominates the L* list because it is the anchor pass-through point (U2): the anchor's own hex
now renders exactly, replacing whatever the old cusp-derived construction put there - expected and by
design, not a defect. Peak mode's larger, non-stop-500 movements trace to U3's F1 peak-cap trade
(§7.3). Note: the pass-1 table's dChroma column (32.25/-43.75/43.85) was in CAM16 units, not OKLCH; the
OKLCH figures above are a different, smaller-magnitude basis and are not directly comparable to it -
this pass reports OKLCH throughout for consistency with `|dL*|`'s own basis.

**Full per-mode median/p90 table, export25, re-derived** (corpus, |dL*| vs bf2aaf6, n=94,500 per mode;
display19 figures below are UNCHANGED from pass 1, not independently re-verified this pass):

| mode | stop set | n | median \|dL*\| | p90 \|dL*\| |
|---|---|---|---|---|
| perceptual | display19 (19 stops, pass 1, not re-verified) | 71,820 | 2.9610 | 6.7377 |
| perceptual | export25 (25 stops, re-derived) | 94,500 | 2.1569 | 6.2239 |
| even | display19 (pass 1, not re-verified) | 71,820 | 2.0441 | 6.1827 |
| even | export25 (re-derived) | 94,500 | 1.3098 | 5.8063 |
| peak | display19 (pass 1, not re-verified) | 71,820 | 6.0431 | 26.1404 |
| peak | export25 (re-derived) | 94,500 | 4.3907 | 23.2925 |

**`damp`/`dampCurve` before-and-after row.** `DEFAULT_CONTROLS`' own raw values are UNCHANGED between
bf2aaf6 and the integrated tree (`damp: 80, dampCurve: 1.5, dampAmp: 0, dampBias: 0`, both). U3's retune
is a NEW multiplier applied only in even mode, absent from bf2aaf6 entirely: `EVEN_DAMP_FACTOR = 0.25`
(`src/engine/tonal.js:387`), transforming the effective even-mode damp to `100 - (100-80)*0.25 = 95` and
effective dampCurve to `0.25 * 1.5 = 0.375` at the point of use - a substantial softening scoped to even
mode alone. This is visible in the median/p90 table above as even mode's consistently smaller movement
relative to perceptual/peak (median 1.35-2.04 vs 2.23-6.04) - separated here from the anchor/envelope
movement, which affects all three modes via the shared pass-through and `chromaEnvelope` construction.

**Default-kit ratios before/after (peak vs perceptual, stop 500, all 16 families):** at bf2aaf6, peak
and perceptual stop-500 L*/C values differ substantially per family (e.g. Data 5: perceptual L* 54.62,
peak L* 94.71 - a 40-point spread). On the integrated tree, **every family's peak and perceptual stop
500 is byte-identical** (e.g. Data 5: both read C 45.80 / L 49.35) - the anchor's own construction is
mode-independent by design (U1/U2), matching `anchor-f4 peak-vs-perceptual: 3380 of 3380 differ (0
identical required)`'s own corpus-wide confirmation that this identity holds for every anchored ramp,
default kit included.

**Exports that moved:** all 10 documented colour formats (`exportPanda` verified directly in §10; the
Adia OKLCH/Radix bundles regenerated in this commit; `figma/plugin/ui.html`, `src/ui/categories/*.js`,
`src/ui/describe-mcp-assets.js` regenerated and committed per above).

**C4's identity-control line:** red - see §7.5, Finding B. Not a regression; the reference is now a
genuine pre-#681 implementation (pass 2, F1) and the 0/3,796 reading is honest: U6's rebuild changed
the non-anchored construction wholesale, so no reference to the old construction can ever match it.
Owner question (Q1), not a bug.

**C5's allow-list count:** `ladder-window` (C5's 21-name curated-corpus allow-list, independent of
anchors) - **pass, 21 (expected 21)**, unaffected by this integration.

**#668's count:** see the dedicated §10 section - **CLOSED** (corrected pass 2, F4).

## 9. Blast radius vs. the plan's expected-direction table

Checked every row I could locate a clear expected direction for against the measured figures above.

| Row | Plan's expected direction | Measured | Match? |
|---|---|---|---|
| Anchored palettes: prime == deriveKeyColor -> prime == anchor | prime pixel becomes the anchor's own hex, byte-exact | `anchor-identity: 3380 exact, 0 off`; `anchor-f4 peak-vs-perceptual` identity holds default-kit-wide | Yes |
| Non-anchored: unchanged (e, h) | primeSwatches unchanged for non-anchored palettes | **Miss, confirmed pass 2** - U6's ladder rebuild changes the non-anchored construction too (§7.5, Finding B); repairing the C4 reference to a genuine pre-#681 implementation (pass 2) still reads 0/3,796, proving this is a real, intended divergence, not a broken reference | **Miss, flagged, owner question Q1** |
| Ramp stop 500 exact under every toggle (Q-D) | curve/tension/vibrancy/hueSpace move an anchored ramp everywhere except stop 500 | `anchor-f4 curve/tension/vibrancy/hueSpace: stop 500 moved 0 (want >= 1, 0)` across all four, all 16 default-kit ramps | Yes |
| hueSpace stays inert for anchored perceptual/peak, live in even | max dE_OK <= 0.01 in perceptual/peak, above JND in even | `hueSpace-perceptual-bound`/`hueSpace-peak-bound`: max OKLab dE 0.0048, both bounded by codes (max 2/1); `hueSpace`: max OKLab dE 0.0486 in even, asserted live | Yes |
| Three default-kit families clip at STEP_L 9 under U1's Q2(b) anchors: Tertiary/Danger/Warning, spans 52.8/49.9/46.3 | | Measured 52.7805/49.9212/46.2664 exactly (§ test/engine/prime.mjs `CLIPPED_DEFAULTS`) | Yes |
| Q-B: 41/96 cells below bf2aaf6, AA holds | | Confirmed unchanged at 41, AA holds everywhere (§6) | Yes |
| Q-C: NOTCH_ALLOW population shrinks toward the 70%-ratio+absolute-dip definition's true residual | | 78 -> 15, a pure subset (§10 detail below), default kit stays 0 | Yes, and larger than a plan reader might expect |
| #668: 0 upticks at stop 800/mirror, all three modes, both stop sets | | Measured 0/0/0/0/0/0 at integration head; negative control re-run against `bf2aaf6`'s OWN corpus (pass 2, F4) reproduces the stated 11/46/11/43 baseline exactly (§10) | **Yes, CLOSED** |
| U3's F1 peak-cap trade: dips resolve | | 0 of 6 named dips observed (§7.3) | Yes, with the caveat that the gate's own negative control needs replacing |
| C7: exactly 3 chromaEnvelope call sites | 3 (pre-U2-landing reading) | 5 (§2) | **Miss, flagged and explained** - a reading change, not a regression |

Two misses/flags remain as of pass 2 (down from three): C4's non-anchored identity control (a real,
unreconciled cross-unit scope gap, §7.5, now an owner question Q1 rather than an open bug - the
repaired reference confirms the divergence is real) and C7's count (already explained as a legitimate
reading change, §2, not a fresh miss). #668's negative control is fixed pass 2 and is no longer a flag.
All remaining flags are findings, not failures hidden from this report.

## 10. Addendum measurements (#686, #668)

### #686 - exportPanda byte order-dependence: CLOSED

Poisoned `hct.js`'s shared gamut caches (`peakC`, `maxChromaInGamut`) by warming each corpus hue with a
neighbour 0.001° away (the same 2-decimal truncation bucket the pre-#686 `.toFixed(2)` key would
collide on) before processing all 343 curated presets' `exportPanda` output in a shuffled order (fixed
seed), and compared every emitted colour token byte-for-byte against a cold, unshuffled, unpoisoned run.

**Integration head: 0/343 presets differ.** Cold and poisoned+shuffled runs are byte-identical.

**Negative control (bf2aaf6, same probe, same corpus):** the control reproduces -
**1/343 presets differ**: `cuisine "Sichuan hot pot"`'s `secondary.prime.DEFAULT` reads
`oklch(0.6207 0.1526 31.99)` cold vs `oklch(0.6206 0.1528 32.4)` poisoned+shuffled, a real, small,
order-dependent divergence in the exact class #686 describes. The reproduction is real (non-zero),
proving the probe discriminates rather than being vacuous, even though it is a smaller population
(1/343) than a maximally-adversarial poison might find - plausible given `_pk`/`_mc`'s bounded-LRU
eviction limits how much cross-call contamination survives to the export step.

### #668 - the measured CIELAB L* rise at stop 800 and its light-side mirror: CLOSED (corrected pass 2, F4)

**Corrected (U4 review pass 1, F4): the INCONCLUSIVE verdict below was wrong. #668 is closed.** The
pass-1 negative control paired the PRE-#681 engine (`bf2aaf6`) with the POST-#681, regenerated
(`dampAmp: 0`) category files - an engine/corpus version skew, the same fault class as F3's lone-spike
bisection. Re-run pass 2 with `bf2aaf6`'s OWN committed category files (a real `git worktree add
--detach` checkout of `bf2aaf65`, not the integration head's regenerated ones):

Swept the full corpus (3,780 palettes), all three modes, both stop sets (19 display / 25 export),
measuring adjacent-stop pixel L* (`lstarFromRgb`) for any rise anywhere in the ramp (a superset of "at
stop 800 specifically," so it would catch the named defect wherever it lands). Script:
`scratchpad/probe/rise19.mjs` (reused verbatim from the U4 review, which the reviewer's own scratchpad
under this session left in place).

**Integration head: 0 rises, every mode, every stop set** (`perceptual|display19` through
`peak|export25`, all six combinations read 0) - unchanged from pass 1.

**Negative control, re-run against `bf2aaf6`'s own corpus: reproduces the addendum's stated baseline
EXACTLY.** `{"display19":{"perceptual":11,"even":0,"peak":43},"export25":{"perceptual":11,"even":0,"peak":46}}`
- 11 perceptual / 46 peak on the 25-stop export ramp, 11/43 on the 19-stop display ramp, even mode 0 in
both, matching the addendum's 11/46/11/43 to the digit. The first perceptual witness on both stop sets
is `film "Touch of Evil" secondary, stop 750->800` - the exact named witness pass 1 tested against the
wrong corpus and reported as showing no rise.

**Per the addendum's own standard**, this is now a control that reds against the right baseline, and a
head measurement of 0/0/0/0/0/0 against it is real evidence of closure, not a vacuous probe. **#668 is
CLOSED.** The PR body line below is corrected to match.

## Step 4 record-only repairs

1. **Done** (commit `6dd5244`): U2's `.sdlc/handoffs/pif-u2.md:151-152` prose contradicted its own
   table (claimed the over-10-degree column was already 0 at review 5 and stayed 0 "in either reading"
   at head; the table two lines above reads 151/5,384 at review 5 and 0/5,272 at head). Corrected to
   match the table.
2. `.sdlc/board.md` - left alone, team-lead's own.
3. The plan's C1 17-FAIL-line figure - not edited (planner's repair); my own control run is in §5.

## PR body line, per the addendum

**Corrected pass 2 (F4): both addendum measurements are green.** The PR body reads **"Closes #681,
closes #686, closes #668."**
