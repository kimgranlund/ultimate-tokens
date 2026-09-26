# U7 review, pass 2: delta `285f66ec` to `43033841`

Fresh-context reviewer, grade l3. Delta only; pass 1 (`pif-u7-review-1.md`) stands for everything
else. Two commits, four files: `test/ui/shell.mjs`, `test/engine/prime.mjs`, the plan, the handoff.
Every mutation in a throwaway `--shared` clone at `43033841` under my scratch dir; guard polled to
0 before each run; host load 5 to 9 during the runs. Outputs went to a session scratch directory and are not recovered; each figure below names the
command that regenerates it.

## F1, the skew probe: 🟢 closed

`test/ui/shell.mjs:80-85` now runs the ramp probe on `skewOnly`, a still-anchored copy whose only
edit is `skew`, with a setup guard that reds if palette 1 loses its `anchor`. The key probe keeps
its own `edited` fixture (hue edit plus detach).

Control, the `skewOnly.palettes[1].skew = ...` line replaced with a comment at `43033841`:

```
  FAIL  model, editing skew on a still-anchored palette did not change the projected ramp (stale/stored derived state?): ramp[12] #174488 both before and after
FAIL: 1 gate failure(s)
exit 1
```

Unmodified head: `PASS: ui-app pure core + shell clear the checkable predicates`, exit 0. The probe
bites again, on the same input that passed at `9ecd071e` and `285f66ec` in pass 1.

The builder's reasoning for rejecting the `detachedOnly` re-basing I suggested holds, and I
measured it: on a detached palette a hue edit alone moves the ramp (`ramp[12]` `#194B97 ->
#76178C`, detached vs detached-plus-hue+60), so comparing `projectView(edited)` against
`projectView(detachedOnly)` would pass on the hue edit with the skew line deleted, the same vacuity
in a new coat. The anchored copy is the right fixture: the engine ignores `hue` there, `skew` is
the only field that can move the ramp, and `skew` never detaches under C12, so the state is
legal. The comment at lines 71-79 says exactly this and names the reviewer's finding.

Handoff §8d now reads "Two assertions were weakened by the same fixture edit. I caught one; the
reviewer found the other", which is the true sentence.

## F2, the New-Palette blast-radius row: 🟢 closed

The plan's Blast radius table gains a row naming `_isNeutralPalette`, `_orderedContext`,
`newPalSamples` and `addKeyColor`, with the figures from my `blast.mjs` run reproduced verbatim:
344 documents, 148 neutral flips, primary index moves for 14 (the two architecture examples),
`deriveRelative("extend")` target moves for 339, default kit `[0.593, 0.206, 289.0]` to
`[0.504, 0.187, 289.0]`, and the `ko.mjs` agreement figure (0 against 0.586). Every number matches
`blast.mjs`'s and `ko.mjs`'s output as I recorded it in pass 1. Both are committed at
`.sdlc/records/pif-u7-blast/`. The row says the
figures are the reviewer's and not re-measured by the builder, which is honest and fine: the
script is in the record and anyone can rerun it.

The row cites Q4 at plan branch `5ddd4102`, and that commit exists: it appends Q4 to
`.sdlc/questions/preset-intent-fidelity-preland.md` with the same three figures in the question and
the chosen answer verbatim, "Intended, the derivation follows the sampled colour (Recommended)".
No code change follows from the ruling, and none is in the delta.

One nit, not a finding: the row's line numbers are the declaration lines (`_isNeutralPalette` 422,
`_orderedContext` 430, `newPalSamples` 444) except `addKeyColor`, cited at 1935, which is the
`vp.keyOklch` read inside it; the declaration is at 1932. Both are inside the method, and
`test/repo/citations.mjs` does not read the plan, so nothing reds.

## F3, the set-difference assertion: 🟢 closed, control constructed

`test/engine/prime.mjs:1121-1125` computes `SYM_BY_CONSTRUCTION_ALLOW minus SYM_MEASURED_ALLOW`
and compares it as a sorted array against `SYM_DIFF_EXPECTED`, the four names the comment had
only stated.

Control, one hex digit changed in `SYM_DIFF_EXPECTED` (The rave `#212228` to `#212229`), both
frozen lists untouched:

```
  pass  symmetry corpus by-construction: 26 of 3380 (expected 26)
  pass  symmetry corpus measured-pixel: 22 of 3380 (expected 22)
  pass  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 26 vs 26
  pass  ladder-span under 30 L*: 364 ... 363 ... 0 ...
  FAIL  symmetry, by-construction minus measured is not the four named palettes: got [film "Apocalypse Now ..." primary #241E1A | music "The rave · the laser tent" secondary #212228 | travel "37° N ... Patmos ..." tertiary-muted #232220 | travel "42° N ... Hidaka coast ..." tertiary-muted #252215]
FAIL: 1 gate failure(s)
exit 1
```

Only the new assertion moves; the four freezes and the span report stay green, so the failure is
isolated to the line that changed. Worth saying plainly what this assertion is: a consistency
check between three frozen literals, not a measurement. Its link to the corpus is through the two
`freeze` comparisons above it, which tie each list to what `primeSwatches` emits (pass 1
reproduced both biting on a same-count swap). With those in place, the chain is: measured set
equals list, list minus list equals the four; a corpus move reds the freeze first and this line
second. That is the mechanism-as-code R2 asked for and no more.

## Standing rows re-read on the delta

U7-P3 over `de1bafef..43033841`, hand-edited paths: `0`. U7-P4: still 19 paths, no new path;
the four delta files are all on the declared list or already named in §8d. `test/engine/prime.mjs`
at head ran to completion in the F3 control clone with every other gate green, so the added
assertion did not disturb the file. `test/ui/shell.mjs` at head: PASS, exit 0.

## Verdict

**PASS.** F1, F2 and F3 are closed with a control I constructed and ran for each of the two gate
changes, and the record change cites an owner ruling that exists on the plan branch. Nothing
blocks. Pass 1's scope-wall, gate and blast-radius readings stand unchanged for the rest of the
unit.

verdict: 🟢
