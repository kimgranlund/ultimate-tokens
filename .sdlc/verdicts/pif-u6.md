# Independent verification: plan `preset-intent-fidelity` U6 (#681) + defect #686 root fix

Verifier: independent seat, fresh context. Target `unit/pif-u6-ladder` head `3df582d`, fetched
read-only into my own worktree `scratchpad/vfy-u6` (nothing run inside any `.git-worktrees/pif-*`).
Plan text read from `origin/plan/preset-intent-fidelity` rev 13 (`4a58697`), graded against C1, C5
(ladder half) and C11 as written there, not against the dispatch paraphrase.

Base: `git merge-base HEAD origin/main` = `bf2aaf6`. Diff vs base: 15 files, +2046/-211.

## Verdict

**PASS** , with two 🟡 carry-forwards, neither fix-first. The load-bearing item, #686's root fix,
is confirmed by my own independent reproduction.

**#686 can be closed: root fix confirmed.**

| # | Item | Verdict |
|---|---|---|
| 1 | C1 `npm test` | 🟢 |
| 2 | C5 ladder half + negative control | 🟢 (one LOW note) |
| 3 | C11 ladder symmetry | 🟡 partially deferred by design |
| 4 | C11 control is pinned committed data | 🟢 |
| 5 | #686 root fix | 🟢 |
| 6 | Determinism gate compares hexes; tripwire real | 🟢 |
| 7 | Gate-time cost documented honestly | 🟡 upper bound exceeded under load |
| 8 | Determinism of the gates themselves | 🟢 |
| 9 | `test/repo/branding.mjs` | 🟢 |
verdict: 🟢

## 1. C1 🟢

`test/run.mjs` is NOT in the diff; `TESTS` has **47** entries on this branch. 47 is the correct
number for U6 in isolation: C1's "+1" is for `test/engine/anchor.mjs`, which U1 adds, and U6 is
parallel to U1. 48 applies only once U1 merges.

Two independent timed runs in my worktree, both `exit 0`, both last line `✓ all 47 test files
passed`, `git status --short` empty after each:

- pass 1: real 208.41s, user 207.13s (host load avg 5.04)
- pass 2: real 133.29s, user 136.28s (host load avg 4.20)

## 2. C5, ladder half 🟢

`node test/engine/prime.mjs` prints `ladder-window allow-list: 21 (expected 21)` followed by the 21
r/l-tagged lines. I compared the printed set against the plan's 21 names: all 21 present, same
hexes and L* values (7.32 to 12.20 dark, 100.00 white).

Negative controls I ran myself, each in a fresh scratch copy:

- **Count control.** Patched Nike's tertiary-muted `#FFFFFF` to `#F0F0F0` (L* ~95, inside the
  window) in `docs/reference/colors/categories/brands.json`. Gate printed
  `ladder-window allow-list: 20 (expected 21)`, `FAIL ladder-window , allow-list count 20 != expected 21`,
  process **exit 1**. Bites exactly as C5 specifies.
- **Contents control at constant count.** Changed one allow-listed hex to a *different* out-of-window
  hex (`#161618` → `#141416`). Count stayed 21, gate still FAILed:
  `Missing: Film / Cinema|primary|#161618. Extra: Film / Cinema|primary|#141416.` Exit 1. So the
  list is frozen on identity, not merely counted.
- The gate also carries its own bounds control (a synthetic `[40,60]` window must find more than 21),
  which is a genuine discrimination check on the window constants.

**LOW note (not fix-first).** The frozen identity key is `category|role|hex`
(`EXPECTED_LADDER_ALLOWLIST`, test/engine/prime.mjs:737-752), not the kicker the gate prints. I
proved the gap: renaming an allow-listed preset's kicker
("The Night of the Hunter · 1955 · …" → "… RENAMED") leaves the gate **green, exit 0**. C5's prose
says "failing on any other count or any other name". The file documents the choice and its reason
(the plan's kickers are hand-abbreviated with no formal derivation from the JSON), and
category+role+hex is the substantive key , hex is what decides window membership, and there are no
duplicate triples in the list. Reporting it so the plan's wording and the gate's actual key are
known to differ; a stricter key would additionally pin the kicker.

## 3. C11 🟡

What the committed gate measures, over 464 cases = 2 hue spaces × (16 defaults + 72 hues × 3
chromas) , this matches C11's "both hue spaces, hue 0..359 step 5 × chroma {0,50,100} plus the 16
defaults" exactly:

```
symmetry (this branch): by-construction fails 0, measured exceed-3L* 0/464, max measured asymmetry 0.5180 L*
symmetry negative control (frozen pre-#681 fixture, same sweep): exceed-3L* 295/464, max asymmetry 52.0149 L*
```

All 20 gates pass; `PASS: prime-system clears all AC-050 gates`, exit 0.

The ≥70%-of-prime's-CAM16-chroma-OR-within-0.5-of-`maxChromaInGamut` clause is enforced as gate
**(k)** (test/engine/prime.mjs:681-704), measured on `cam16FromRgb` of the *rendered pixel* (not the
internal `.s` field) with a near-neutral exclusion below 3 CAM16 units and a `checked < 2000` floor
so the sweep cannot silently not run. Sound. **It does not print a measured line**, though C11 says
"the gate prints which" , cosmetic, since it fails loudly with the offending rung and ratio.

**Deferred, and structurally not verifiable at this head:** C11 also requires the sweep over the
**3,380 anchored palettes** and the corpus report's **span < 30 L\* counts (373 ± 5 on source
anchors, exactly 0 on the default kit)**. Both need U1's `anchor` field, which is not on this
branch (U6 is parallel to U1). The file's SCOPE NOTE (test/engine/prime.mjs:9-24) states this
explicitly and `.sdlc/questions/pif-u6.md` carries it as an open question with a named rebase
obligation. This is the right handling, but it means **plan-level C11 cannot be signed off at U6's
head** and must be re-run after the U1 rebase.

Related, same cause: the unit paragraph requires "the three clipped defaults (Tertiary, Danger,
Warning) asserted at their equal-compress spans 52.8 / 49.9 / 46.3 L\* ± 0.05". On this branch's
cusp-anchor construction the clipping set is different , `CLIPPED_DEFAULTS` is
`Secondary 17.77, Info 49.77, Success 17.77, Warning 45.77, Data 1 43.50`, plus an explicit
assertion that Tertiary and Danger are **unclipped** (span 54 exactly) so a silent drift toward the
post-U1 numbers shows up as a test change. Deviation from the unit paragraph's literal text,
measured and reasoned in `.sdlc/questions/pif-u6.md` (rows 31-33, options 1/2, rebase obligation at
lines 68-69, 80). Acceptable as branch-ordering, must be re-pinned at rebase.

## 4. C11's negative control is pinned committed data 🟢 , the flagged fix-first risk is closed

The control is **not** a runtime `origin/main` read. It is a committed fixture,
`test/engine/fixtures/prime-pre-681.mjs` (158 lines, added in `62468d6`), imported directly
(test/engine/prime.mjs:823). I verified its provenance myself:

- Claimed source: `origin/main` commit `9195773`, blob `c744fb8`.
- `git rev-parse 9195773:src/engine/prime.mjs` = `c744fb82d7871be7d5d07fa7fd2c94446f9e8a60` ✓
- After rewriting the three import specifiers back and stripping the 25-line header, the fixture body
  is **byte-identical** to that blob ✓
- The only `execFileSync` left in the test file spawns the determinism *worker* (a node subprocess),
  not `git`. No `git show` at test time.

The fixture header itself records the earlier hazard and why it was vendored (no `origin/main` ref
under `actions/checkout@v4` on a `pull_request` event; and permanently dead on `main` after squash,
since the "old" module would then *be* the new construction). The prior ruling was followed.

## 5. #686 root fix 🟢 , independently reproduced

`src/engine/hct.js` changes three cache keys from truncated to exact:
`maxChromaInGamut` (`hue.toFixed(2)+"|"+tone.toFixed(2)` → `hue+"|"+tone`), `peakC`
(`hue.toFixed(2)` → `String(hue)`), `oklchToCam16Hue` (`target.toFixed(2)+":"+cf.toFixed(3)` →
`target+":"+cf`).

**My own probe**, written from scratch (`scratchpad/probe2.mjs`): population = every distinct hue in
the curated corpus × chroma {12,25,37,50,62,75,88,100} × both hue spaces = **2,320 palettes**;
`primeSwatches` rendered in three separate fresh processes , forward order, reversed order, and
forward with an unrelated `paletteStops` render interleaved every 5th case to warm the shared caches;
full 7-rung hex strings compared per palette.

| Engine | Order-dependent hex diffs |
|---|---|
| this branch (exact keys) | **0** / 4,640 comparisons |
| scratch copy, three keys reverted to `.toFixed(2)`, nothing else changed | **7** / 4,640 |

Example from the reverted copy: `hue 246 / chroma 62 / oklch` gave
`…,#588EBB,#4077A3,#25608B` in one order and `…,#588EBB,#4077A2,#26608B` in another.

Worth recording as method: **my first probe was vacuous** , 500 corpus swatches at their own single
chroma produced 0 diffs on *both* engines, because the corpus `oklch` hue field is integer-valued and
`toFixed(2)` is lossless for integers (bucket census: 0 of 223 oklch buckets held >1 distinct float
hue). Order-dependence only surfaces once chroma varies, because `effHue(hue, "oklch", chromaFrac)`
is what produces the colliding floats. I widened the population until the control bit, then ran the
fixed engine against the same population. The hct.js comment's own figure (7,967 of 21,928 buckets
many-to-one over a real (hue, chroma, hueSpace) population) is consistent with what I saw.

- **No private caches left in `prime.mjs`.** `grep -nE "new Map|boundedCache|\.set\(|localPeakC|localMaxChroma"`
  over non-comment lines: **none**. The only hits anywhere in the file are the header comment
  explaining their removal. `primeSwatches` calls hct.js's shared `peakC`/`maxChromaInGamut` directly.
- **REQ-056 holds, 0 mismatches over 32 pairs.** Gate **(h)** (test/engine/prime.mjs:632-651) asserts
  `primeSwatches(p,{hueSpace,primeChroma:100})[3].rgb` **byte-identical** (zero tolerance, not a
  per-channel step) to an independently re-derived `deriveKeyRgb`, over `SPACES` (2) × `DEFAULTS`
  (16 from `role-table.json`) = **32 pairs**, both hue spaces. Passes.

## 6. Determinism gate is real 🟢

- It compares **hexes**, not `inGamut`. `prime-determinism-worker.mjs` writes
  `primeSwatches(...).map(s => s.hex).join(",")`; the gate diffs those strings
  (test/engine/prime.mjs:246-253). `inGamut` is checked by a *separate* `gamut-ceiling` gate. The
  in-file comment records the prior review's finding that an earlier cut read `inGamut` alone.
- The two sides are **genuinely cold child processes** (one with an empty poison set, one that renders
  1,500 real `primeSwatches` poison palettes *before any case runs*), because Node's ESM cache makes
  hct.js's module-level caches survive a "fresh" re-import in one process. Poison is real palette
  renders, not a synthetic grid. Correct construction.
- Clean run: `determinism …: 0/2000 palettes shifted hex by call order`. `DET_CASES` = 2,000.
- **Tripwire is real.** Same gate against my reverted-key scratch copy: **exit 1**, two failures ,
  `determinism …: 7/2000 palettes shifted hex by call order` and
  `gamut-ceiling: 409/151200 real out-of-gamut rungs exceeds the pinned ceiling of 0`.
  So both the determinism gate and the gamut-ceiling gate catch a reverted fix.

Note on the dispatch paraphrase: "3 of 500 with truncated keys" did not reproduce as that exact
figure. The committed gate measures 7/2,000 and my own probe 7/2,320 , same direction, same order of
magnitude (~0.3%), different sample. The claim's substance holds; its number was sample-specific.

## 7. Gate-time cost 🟡

The dispatch paraphrase said the +21% was "documented in `.sdlc/adapter.md`'s 58-62s budget". That
is not what landed: the budget was **revised**, not left stale. `.sdlc/adapter.md` now reads
"58 to 62 s at `7faf3aa`; **revised #681 U6 (review pass 6 N9)**: 90 to 175 s wall observed,
host-contention-sensitive", with a note below the table giving the corpus-scale method (fresh cold
process, CPU time, engines differing only in the three keys), the four measured pairs
(~15,000ms → ~18,105ms, +21%), the corroborating independent +26%/+32%, the failed `CACHE_CAP`
experiment, and a documented observed range of 97.99s to 173.89s user CPU.

My own two runs: **136.28s user** (inside the documented range) and **207.13s user** (above its top,
at load avg 5.04, with ~10 sibling worktrees live). So the record is honest and not stale, but its
**upper bound understates what a contended host produces**. The note already flags wall clock as
heavily contention-sensitive and asks for a quiet-host re-measure on `main` after landing; that
re-measure should widen or re-baseline the upper bound.

The cost itself is the correct trade: it buys a real shipped export defect's closure.

## 8. Determinism of the gates 🟢

`node test/engine/prime.mjs` run twice in the same worktree: both exit 0, output **byte-identical**
(`cmp -s`). `npm test` run twice: both exit 0, both `all 47 test files passed`, tree clean after each.

## 9. Branding 🟢

`node test/repo/branding.mjs` → `branding: clean (448 files scanned)`, exit 0.

## Carry-forwards for whoever lands the plan

1. **Plan-level C11 is not closed by U6 alone.** The 3,380-anchored-palette sweep and the
   span < 30 L\* counts (373 ± 5 / exactly 0) need U1's anchors. Re-run after the U1 rebase.
2. **Re-pin `CLIPPED_DEFAULTS`** to the plan's post-U1 Tertiary/Danger/Warning 52.8/49.9/46.3 at the
   same rebase (`.sdlc/questions/pif-u6.md` lines 68-69 already names this obligation).
3. Cosmetic: gate (k) could print its measured retention line, which C11's wording implies.
4. Cosmetic/LOW: the ladder-window allow-list is frozen on `category|role|hex`, not the kicker it
   prints; a kicker rename passes silently.
5. Known and accepted: `docs/spec/spec-panda-park-ui-exports.md` EX-1's OKLCH literals are stale on
   this branch by lane rule , U5's job, already recorded in plan revision 10.
