# Q7 ratchet gate: profiling note (no commit, profile-only per team-lead)

Worktree head: bf62ee30 (unchanged, this note is not committed to that content). All measurements
foreground, timed with `time`, `uptime` recorded immediately before each run.

## Before / after, tonal.mjs alone

- **Before** (scratch copy with the new C6 (v) block, lines 1756-1832, deleted): **84.17 s** wall.
  Load at start: 3.70 / 4.15 / 4.47.
- **After** (current committed file, 3 separate runs this session): **95.49 s / 95.57 s / 96.89 s**,
  average **95.98 s**. Load at start of these runs: 4.09-4.78 (all three in that band).
- **Delta: ~11.8 s** average, attributable to the new block.

## Per-sweep cost (instrumented scratch copy, timing markers around each of the three sweeps only;
deleted after the run, never committed)

Run: total 102.26 s wall, load at start 4.61 / 4.34 / 4.51 (instrumentation itself adds console.error
calls, so this total is not directly comparable to the clean "after" figure above - the per-sweep
splits are what matters here).

| Sweep | Cost | Scope | Gated? |
|---|---|---|---|
| 1. peak measurement (`measureAnchoredOvershoot(T, "peak")`) | 2,224 ms | full corpus, 3,764 palettes | Yes - pinned, reds on rise |
| 2. even measurement (`measureAnchoredOvershoot(T, "even")`) | 9,449 ms | full corpus, 3,764 palettes | No - report-only figure |
| 3. negative control (`measureAnchoredOvershoot(BuggyT, "peak")`) | 2,242 ms | full corpus, 3,764 palettes | N/A - proof-of-discrimination only |
| module reimport (data-url, base64) | 3 ms | one reimport | negligible |

Sum of the three sweeps: **13,915 ms (~13.9 s)**. This brackets the clean 11.8 s before/after delta
reasonably well; the ~2 s gap is consistent with instrumentation overhead plus this host's own run-to-
run noise, which is substantial even at similar load readings (this session alone has seen tonal.mjs
run anywhere from 84 s to 103 s at loads all in the 3.7-4.8 band).

**Sweep 2 (even) dominates: ~68% of the new block's own cost, and ~4.25x sweep 1's cost for the
identical corpus and iteration shape.** The only difference between sweep 1 and sweep 2 is
`toneMode: "even"` vs `toneMode: "peak"` in the controls object passed into `paletteStops`. This
matches #681 U2's own perf history (u2-perf-brief.md, scratchpad): the even-mode hue solve
(`solveCam16Hue`, a root-find against the rendered chroma) is the known, already-diagnosed cost driver
for even mode specifically, not an artifact of this gate's own loop shape.

## Confirming/refuting team-lead's proposed fix, with numbers

1. **"The two pinned figures stay corpus-wide since they are the monitored quantities."** Confirmed,
   no argument - sampling either pinned figure would break what "today's measured value" means for a
   ratchet.
2. **"Peak and even can share one paletteStops pass."** Partially correct, not literally true.
   `measureAnchoredOvershoot` is called twice, each time re-walking `docs`/`doc.palettes` and
   recomputing `rampChromaOf(pal, doc)` (mode-independent, so identical both times) before calling
   `paletteStops` with a different `toneMode`. Merging into ONE outer loop that computes `chroma` once
   and calls `paletteStops` twice (once per mode) would remove the duplicate iteration and the duplicate
   `rampChromaOf` call, but NOT a duplicate `paletteStops` call - each mode still needs its own, since
   `toneMode` changes the actual computed ramp. The removable overhead here is iteration/lookup cost,
   not the ~9.4 s inside sweep 2's `paletteStops` calls themselves, which is where the real cost lives
   (see above). Expected saving from this merge: well under 1 s, not the bulk of the 11.8 s delta.
3. **"The control does not need the whole corpus - a sampled subset that reds is a control."**
   Confirmed, and it matches this file's own established convention (e.g., the (iii-b) cusp-run
   negative controls above use tiny synthetic ramps, not the corpus at all - proving discrimination, not
   coverage). Applying this to sweep 3 would save ~2.2 s (sweep 3's full cost), since even a small
   sampled subset large enough to include the known witness palette would clearly cross the pin.

**Net read:** items 2 and 3 together would recover roughly 2-3 s of the 11.8 s added, mostly from
sampling the control (item 3); the loop merge (item 2) saves well under a second. The bulk of the added
cost, sweep 2's ~9.4 s, is intrinsic to computing the even-mode report-only figure over the FULL corpus
on every run and is not addressed by either proposed change. Reducing that further would mean either
accepting a sampled/approximate even figure too (in tension with the addendum's own instruction that
both numbers go in the blast-radius report) or accepting it as the honest cost of a fresh, corpus-wide
re-measurement every run, consistent with this whole plan's own "measure the rendered path, don't trust
a stale figure" discipline.

No code changed. Standing by for direction on whether to apply items 2/3, leave sweep 2 as measured, or
something else.

## Follow-up: per-file wall time, full suite, slowest first

Team-lead's next ask: the 11.8 s from the ratchet gate cannot explain 294 s against U2's 144.70 s
baseline, so profile every test file individually. Every file in `test/run.mjs`'s own `TESTS` array run
sequentially, foreground, each timed with `date +%s.%N` before/after (not `npm test`'s own aggregate,
so no gen:/bundle/figma-ui regen overhead included here - this isolates `test/run.mjs`'s own 47 files).

`uptime` at start: 5.16 / 5.05 / 4.80. `uptime` at end: 5.66 / 5.09 / 4.85.

Slowest 4 of 47 files (all others under 10 s, most under 2 s):

| file | wall time |
|---|---|
| `engine/tonal.mjs` | 100.158 s |
| `engine/anchor.mjs` | 80.005 s |
| `ui/headless-boot.mjs` | 61.000 s |
| `engine/prime.mjs` | 54.902 s |
| `ui/poster-strip.mjs` (5th, for scale) | 9.039 s |

Sum of just these 4: **296.065 s**, on its own already bracketing the observed ~294 s whole-suite
figure. Sum of all 47 files run sequentially: 324.918 s (higher than npm test's own 293.68 s reading
because this run sat at a higher load, 5.16-5.66 vs 4.77, and npm test's 293.68 s also included the
gen:/bundle steps happening BEFORE test/run.mjs starts, offset by not needing a fresh `node` process
startup per file the same way - the two totals are not directly comparable, both are real, honest
readings at their own recorded load).

**This is a distributed cost, not one heavy file.** Four files, not one, each already well past what a
144.70 s U2-tree baseline would suggest for the whole suite. `tonal.mjs` is the single largest at
100 s but is only ~31% of the four-file sum; `anchor.mjs` (80 s) and `headless-boot.mjs` (61 s) are
substantial and I did not touch `headless-boot.mjs` at all this session, and only touched `prime.mjs`
for 3 em-dash removals (no runtime-affecting change) - so at least two of the four heavy files carry
costs from earlier units (U1/U2/U3) already integrated into this tree, not from U4's own round 2/3
work specifically. `anchor.mjs`'s own cost does include U4's round 2 additions (the default-kit
lone-spike sweep, the corpus-wide notch re-derivation) on top of whatever U1/U2 already cost there.

No code changed, no commits. This is the number for the owner's new-ceiling-vs-optimization decision;
I have not attempted to attribute cost within anchor.mjs/headless-boot.mjs/prime.mjs beyond what is
above - that would need the same kind of per-block instrumentation I did for tonal.mjs's new gate, in
each of those three files separately, and I have not been asked to do that yet.

## Applied: team-lead's direction on the 11.8s (still no commits, applied in-worktree only)

1. **The anchored-EVEN companion figure moved out of the test suite**, into
   `scripts/report-preset-fidelity.mjs --envelope` (a new section, same corpus scope and metric as the
   gate, verified to reproduce 1,205/3,764 violators, max 17.183605x exactly). It was never asserted
   (report-only per the ruling), so it does not belong in `npm test`.
2. **The negative control now samples** (the known witness doc plus the next 49 docs in corpus order, 50
   total) instead of the full 3,764-palette corpus, checking only the max-ratio metric - the violator
   COUNT is scale-dependent and meaningless against the corpus-wide pin at reduced scale; max ratio is a
   single-witness property, valid at any sample size. Verified: real-engine sample maxRatio reproduces the
   corpus-wide pin exactly (15.132599x, same witness), buggy-engine sample maxRatio reads 25.863456x,
   clearly past the pin.
3. **Left alone, per instruction**: the "share one paletteStops pass" idea (measured under 1s, costs
   clarity for little return).

**Result, first reading:** `test/engine/tonal.mjs` alone: **84.74s** (uptime 4.40/4.76/4.75 at start).
`scripts/report-preset-fidelity.mjs --envelope` run directly: 24.26s wall (uptime 3.92/4.52/4.65 at
start), reproduces both pinned figures exactly (peak 3,119/15.132599x, even 1,205/17.183605x). Neither
of these two numbers affects that script's own exit code (it already FAILs for unrelated, pre-existing
reasons - Q7's own earlier finding, not touched this round).

**Correction after 3 more standalone samples: the single-run wall-clock delta is noise-dominated at
this scale, and my first reading overstated the recovery.** Further `node test/engine/tonal.mjs` runs
after the fix: 99.91s (load 4.75/4.83/4.74), 103.16s (load 4.56/4.76/4.73), 88.89s (load 3.75/4.41/4.59).
Four post-fix readings: 84.74 / 88.89 / 99.91 / 103.16, average **94.18s** - essentially the SAME as the
95.98s average measured before this fix. A full `npm test` re-run post-fix read **327.74s** (5:27.74,
load 3.93/4.38/4.59 at start), HIGHER than the 293.68s pre-fix full-suite reading. At the whole-file or
whole-suite level, this host's own run-to-run noise (a 15-20s+ swing for what should be identical code,
consistent with the per-file profiling's own anchor.mjs/headless-boot.mjs/prime.mjs numbers, none of
which this fix touches) is large enough to swamp a ~10s improvement in a single before/after snapshot.

**What IS solid evidence, and why:** the per-sweep instrumentation done earlier (a WITHIN-run
measurement, immune to cross-run host noise) isolated sweep 2's (even) own cost directly at 9,449ms,
inside a single process, timed against its own Date.now() markers, not by differencing two separate
noisy runs. That code is now structurally gone (confirmed: `grep -n
'measureAnchoredOvershoot(T, "even")' test/engine/tonal.mjs` returns nothing), and
`scripts/report-preset-fidelity.mjs --envelope` reproduces the identical figures where it now lives.
The computational reduction is real and verified by direct instrumentation and by code inspection; a
clean external wall-clock confirmation of "~10s recovered" is not achievable on this host at single-
sample resolution, and I am not claiming one.

No commits yet, still holding for reviewer p3.
