PASS

# Review chroma-envelope U4 (#725) pass 1 · reviewer-l3

| Field | Value |
|---|---|
| Branch | unit/ce-U4 @ b12ecfd7, base plan/chroma-envelope @ febaa601 |
| Handoff | `.sdlc/handoffs/chroma-envelope-U4.md` |
| Criteria | C4.1 to C4.5, plan `### U4: records` (revision 8) |
| Heavy suite | `npm test` SKIPPED: `ps -Ao command \| grep -c -E 'test/run.mjs\|gate:\|--full'` printed 4 (cap is under 2). The diff changes no executable line (two comment/string edits in `mode-isolation-gate.mjs`, one `owner` string in the fixture), so the light gates below cover it; the builder's own green run stands as the floor |

## Criteria

| Id | State | Re-run evidence |
|---|---|---|
| C4.1 | 🟢 | ADR-026 section `grep -c 'Amendment (2026-'` = 2 at head, 1 at dc177a30. The #725 amendment sits after the #701 one and before ADR-027. Each clause of the plan row is present: B ruling, R69 reverses Q-U2-5 with both citations, `min(group, anchor)`, `c` = log2 3, `d` 0.9275 (R76), the tone hold named as the OKHSL `l` to CIE L\* coupling (not H-K), the six identity counts, second export-wide move, the revision 8 hue construction, the two FLOORS cells with R77 and the 41 pending. Quick map row names both amendments |
| C4.2 | 🟢 | The 4 owner lines (gate `:25`, `:73`, fixture `owner`, adapter mode-isolation row) read "#725 moved perceptual and peak at U2/U3 and re-captured; the next plan that moves them re-captures". The gate's `:73` capture template and the fixture string are byte-equal, so a future `--capture` writes the same owner. The remaining adapter `#725` hit (`:36`) is the chroma-envelope row, not an owner line |
| C4.3 | 🟢 | `grep -c 725 CHANGELOG.md` = 2 (base 0). `[Unreleased]` / `### 2026-09-30` entries name the cap, the retune, the tone hold, `gate:chroma-envelope` and R69. Wording nits in L2, L3 |
| C4.4 | 🟢 | `citations.mjs` exit 0, `STALE 0 across 10 discovered docs + 11 fact pins (HEAD b12ecfd7)`; `em-dash.mjs` clean (1011 files); `branding.mjs` clean (1003 files); `npm test` skipped (see Heavy suite). The named control cannot fire; see M1 |
| C4.5 | 🟢 | `grep -c '34e544942d500b9e\|990c17c5ae140e6e' .sdlc/baseline.md` = 0; the row prints `perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef`, equal to the fixture's `perceptual`/`peak`. The `sweeps` passage grep = 1; it lists 8 gates in the same order as `ci.yml` `sweeps.matrix.gate` (lines 112 to 119) and `package.json` `gate:sweeps`, and says "eight" |

## Judged items

| Item | Verdict | Evidence |
|---|---|---|
| ADR states `r^2.1796`, not the plan's `r^2.0875` | 🟢 correct | `src/engine/tonal.js:445-446`: `OKHSL_DAMP_D = 0.9275`, `OKHSL_DAMP_RESIDUE_EXP = ln(1 - D) / ln(0.3)`. Computed: `2.179591`; `1 - 0.3^2.1796` = `0.9275008`; `1 - 0.3^2.0875` = `0.918999` (the superseded revision 6 d 0.919). Matches `.sdlc/verdicts/chroma-envelope-U3.md` (0d0151ef) finding 2, which says the plan should read 2.1796. The plan's C4.1 row still says 2.0875 (L1) |
| Figures in the records vs code and fixtures at head | 🟢 | Identity counts (perceptual 3779/3780, 76998/94500; peak 3779/3780, 75804/94500; even 0; default kit 16/16, 16/16, 0/16) equal the U3 verdict's C3.6 `--identity-control --authored` row. FLOORS: `test/engine/semantic.mjs:302` peak Success light 7.5, `:370-371` perceptual Data 3 dark 4.8; `:235` names the 41 pending cells. CHANGELOG 0.74 / 0.23 is the U3 verdict's C3.1 `0.7435 / 0.2304` rounded. Baseline hashes equal the fixture. Shipping-changes count 8 equals `ci.yml` and `package.json`. The ADR says "R77" without a Q number, which sidesteps the plan-Q4 vs code-Q7 split the U3 verdict finding 5 names |
| C4.4 control ("one pin moved by one" prints STALE 1) | 🟡 confirmed cannot fire | See M1 |
| No U+2014, no retired brand, no engine/gate/fixture data change | 🟢 | Diff adds no U+2014 (the one hit is a pre-existing context line, `baseline.md` smoke row). `branding.mjs` clean. `git diff --stat ... -- src/` empty; fixture diff is the `owner` line only (0 other `+/-` lines); gate diff is one comment and one string literal |

## Findings (by severity)

### Medium

- **M1. The C4.4 negative control as worded cannot fire, and the `tonal.mjs` range pins it names are only loosely guarded.** Confirmed on a scratch clone at b12ecfd7 (`docs/reference/rubrics/acceptance-criteria.md:25`): `tonal.mjs:301-327` moved to `302-327`, `300-326`, and `735-884` moved to `736-885` all read OK, `citations.mjs` exit 0. Further than the builder found: the same pin moved to `1-27` also reads OK (`matched 'toneAt' at test/engine/tonal.mjs:8`), because the audit binds this line's subject to any word in the sentence (`peak`, `toneAt`, `#FFFFFF`). Only an out-of-file range bites (`9301-9327`: `STALE ... tonal.mjs is 2106 lines`, exit 1). The builder's substitute (a single-line `tonal.js:1024` pin in `00-synthesis.md` moved 100 lines, STALE 1, exit 1) does bite, but on a different pin shape and file; for the two docs the plan actually names, no in-file move is caught. Both pins are correct at head today (`tonal.mjs:301` is the `okhsl-modes` header, `:735` the `lift-monotonic` header), so this is not a U4 defect. For the Orchestrator: record the control as not biting in the verdict, and consider a follow-up ticket on the audit's subject binding for range cites (a pin moved to `1-27` reading OK is the vacuous case).

### Low

- **L1. The plan's C4.1 row still reads `r^2.0875`.** The ADR is right and the plan text is stale (U3 verdict finding 2). Plan-text fix for the Orchestrator at close.
- **L2. CHANGELOG "the peak path emits nothing above stop 500" reads ambiguously.** A consumer can read it as "no stops above 500". The mechanism is that no anchored peak stop's chroma exceeds stop 500's. Suggest "the anchored peak ramp's chroma never exceeds stop 500's".
- **L3. CHANGELOG "Three changes move it" then lists four.** Cap, retune, tone hold, then the anchored `oklch` hue construction. Either "Four changes" or fold the hue sentence into the cap clause.
- **L4. "differs ... at every stop but 500" overstates the per-stop reach.** The identity counts move 76998 (perceptual) and 75804 (peak) of 94500 cells, about 81 percent; stop 500 alone is 3780. The sentence is the plan's own blast-radius line, so it is carried, but "at most stops other than 500" is what was measured.
- **L5. Two NEAR citations left unpinned.** `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89` and `04-context-and-messaging.md:71` cite `src/engine/tonal.js:1024`; `okhslLAt` is now at `:1023` (moved at U2/U3, not by U4). Report-only under the audit, and C4.4 asks U4 to re-pin only what its own edits move, so the builder was within scope. A two-character fix the Orchestrator can fold into the close if wanted.

### Advisory

- The baseline mode-isolation row's timing text still cites the chroma-floor U3 re-time while its printed hash is now #725's; the builder notes this (handoff finding 3) and C4.5 asks only for the hash. A reader could take the timings as measured at these hashes.
- CHANGELOG orders `#### Changed` before `#### Added`; Keep a Changelog lists Added first. Cosmetic.
