---
kind: verdict
seat: verifier (independent, read-only)
unit: U5 (records and release notes), plan `.sdlc/plans/preset-intent-fidelity.md`, ticket #681
graded at: unit/pif-u5-records @ `21a0e35d1edcb5ec67f3e3fe90f38677994daab5`
plan read at: plan/preset-intent-fidelity @ `71c7c792` (revisions 27, 28, 29)
origin/main: `13f4658319eaeab1a86ce5d8c0efc8863eb0cc18` (confirmed against the remote with `git ls-remote`, not taken from a local ref)
rulings applied: R8, R9, R10, R12, R13 (`.sdlc/questions/standing-rulings-2026-09-20.md` on origin/main)
written: 2026-09-20
---

# Verdict: 🔴

19 rows green, 3 yellow, 4 red. Every red sits in one section of one file,
`.sdlc/baseline.md` §Interim gate-time ceiling, and every red is records-only, so under **R8** all
four are fixed in place in this unit in one pass and under **R9** none is minted as its own ticket.
Nothing in the engine, the criteria, the gates or the scope is red.

**No reviewer has seen this head.** The reviewer's last record is FIX-FIRST at `27b26330`; the
items were folded into `21a0e35d` without another review round, per R8. The delta
`27b26330..21a0e35d` is two files, `.sdlc/baseline.md` +52/-7 and `.sdlc/handoffs/pif-u5.md`
+43/-8. Three of the four reds below were introduced in that unreviewed delta (rows 21, 22, 23);
the fourth (row 24) predates it and survived it. That is the whole of what the missing round cost.

## Criteria and checks

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | C1 `npm test` green on the branch head, exit 0, runner's last line `all N test files passed` | 🟢 | Own run, scratch clone at the unit head, no `node_modules`: exit 0, last line `✓ all 49 test files passed`, `grep -c FAIL` on the log reads `0`. N = 49 matches `TESTS.length` in `test/run.mjs`, counted independently (`49`) | Corrupted `roleTable[0].light` to `999` in a throwaway worktree and ran the full runner: exit 1, and the output is exactly the shape C1 names, `▶ engine/semantic.mjs      FAIL`, then `  FAIL  refs-canonical  — primary =  550/450 != canonical  999/450`, then `✗ 1/49 test file(s) failed`. One FAIL line, not seventeen, as C1 says; the aggregate reads 49 rather than C1's older 48 because this head registers 49 files, which is the figure U5 repaired |
| 2 | C1 `git status --short` prints nothing after the run | 🟢 | `git status --short` after the run printed nothing; the run's own chain regenerated `gen:figma-assets`, `gen:mcp-assets`, `gen:categories`, `gen:adia-exports`, `bundle`, `gen:figma-ui` first | Appended `/* perturbed */` to `docs/reference/data/adia-oklch-export.css`: `git status --short` printed ` M docs/reference/data/adia-oklch-export.css`, so the empty status is a live comparison and not a vacuous read |
| 3 | C1 interim ceiling, gate time recorded with load per R13 | 🟢 (recorded, not graded) | Wall **447 s**, inside the 280 to 550 band. `uptime` at start: `load averages: 9.80 22.08 29.00`; at end: `load averages: 5.27 9.41 19.60`. Started at 9.80, which is at or above 5, so under R13 this reading is **recorded with its load and not graded against the ceiling** | R13's own text, read on origin/main: `A run at load 5 or above is recorded with its load and not graded.` A run graded at this load would contradict the ruling it cites; this row states the load rather than claiming the band |
| 4 | C9 full regeneration leaves the tree clean | 🟢 | The `npm test` chain ran all five generators plus `bundle`; `git status --short` empty afterwards. `npm ci` (exit 0) then `npm run build` in a second worktree: exit 0, `wrote figma/plugin/ui.html 4111.1 KB`, `git status --short` empty | Perturbed the regenerated CSS artifact, confirmed ` M` appeared, then ran `npm run gen:adia-exports` and watched the status return to empty: the generator restores it, so the clean status is produced by the comparison, not by nothing running |
| 5 | C9 `brands.json` byte-identical to origin/main, no document tag cut | 🟢 | `git diff --stat origin/main -- docs/reference/colors/categories/brands.json` printed nothing. `SOURCE_TAG` stays `adia-brand-document@1.0.0` in `scripts/gen-adia-derived-exports.mjs` | `git tag --list 'adia-*'` prints three lines at this head, all `@1.0.0`, so no tag has been cut yet; the criterion's five-tag expectation is a land-time check the squash performs, and this row does not claim it is met |
| 6 | C9 binder parity untouched | 🟢 | `git diff --stat origin/main -- figma/binder/figma-semantic-binder/code.js` printed nothing | The same command against `docs/reference/data/role-table.json` is non-empty at this head, so an empty stat is a real read of that path and not a swallowed error |
| 7 | C9 role-table changes only by U1's 16 `defaults[].anchor` fields | 🟢 | `git diff origin/main -- docs/reference/data/role-table.json \| grep -c '^[-+]'` prints `18`. `jq '.defaults \| map(has("anchor")) \| all'` prints `true` | Nudged `rolesPerPalette` from 53 to 54 in a throwaway worktree: the same count command printed `20`, so 18 discriminates |
| 8 | C9 the two derived exports carry a new version in `ARTIFACTS` with a one-line comment | 🟢 | Both rows read `version: "1.2.0"`; the comment above them names `#681, plan revision 28` and the shape argument; the 1.1.0 comment is kept as history. The generated headers read `/* adia-oklch-export 1.2.0` and `/* adia-radix-export 1.2.0` | `git diff origin/main -- scripts/gen-adia-derived-exports.mjs` shows the two `1.1.0` lines removed and the two `1.2.0` lines added, so the version is genuinely moved on this branch and not merely asserted |
| 9 | C9 the 53-role deep-equal is unchanged | 🟢 | `jq '.roleTable \| length'` prints `53`; `engine/semantic.mjs` passes in the run at row 1 | Row 1's corruption control reds exactly this gate (`refs-canonical`), so the 53-role identity is enforced and not merely present |
| 10 | C10 six greps, each non-zero on the branch and zero on origin/main | 🟢 | Branch / main: `^## ADR-026` `1` / `0`; `^## 1.64` `1` / `0`; `^\| \*\*Anchor\*\*` `1` / `0`; `^## 9\. Anchored palettes` `1` / `0`; `palette.anchor` `3` / `0`; `anchored palette` `3` / `0` in `acceptance-criteria.md` and `1` / `0` in `quality-rubric.md` | Retyped every needle by one character on the branch: `^## ADR-027` `0`, `^## 1.65` `0`, `^\| \*\*Anchour\*\*` `0`, `^## 10\. Anchored palettes` `0`, `palette.anchored` `0`, `anchored palettes corpus` `0` in both rubrics. All six collapse, so none of the six passes on ambient text |
| 11 | C10 ADR-026 precedes `## Quick map` | 🟢 | `## ADR-026 - A palette's anchor is STORED, not fitted: the sampled source colour is the record` at line `730`; `## Quick map: decisions an enhancing agent is most likely to "fix" (don't)` at line `765` | The same grep on origin/main returns no ADR-026 line at all, so the ordering claim is about text this branch added |
| 12 | C10 the rubric text states the equality predicate | 🟢 | `acceptance-criteria.md` AC-T6: `primeSwatches(palette, controls)[3].hex === anchor` and stop 500 `=== anchor` in all three modes, with `skew` and `lift` stated as not moving either. `quality-rubric.md` carries the matching bullet and `A document that states an anchor "within N L\*" is wrong, not merely imprecise` | The retyped-needle control at row 10 removes both hits, and origin/main's copies carry only lift's displacement mechanism with no anchor predicate, which is what C10's parenthetical predicts |
| 13 | C10 `node test/repo/branding.mjs` green | 🟢 | `branding: clean (537 files scanned)`, exit 0 | Extracted the gate's own three banned patterns programmatically (never retyped) and wrote each into a probe file under `docs/reference/`: the gate exits 1 on all three, naming the probe file each time. The retired maker brand is not written literally anywhere in this verdict |
| 14 | C10 the citation gate green | 🟢 | `node test/repo/citations.mjs` exit 0, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 21a0e35d)`. `node scripts/audit-citations.mjs` exit 0 with `STALE 0` in every audited document | Rewrote `:1641` to `:1651` throughout `docs/lld/app-shell.md`: the gate prints `✗ 1 citation gate failure(s)` and names the drifted line. It bites |
| 15 | `.sdlc/baseline.md` says 49 test files and the figure agrees with the runner | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh` exit 0, `ok    tests: baseline 49, test/run.mjs TESTS 49`, `stale total: 0` | Edited the baseline's summary cell to 48 in a throwaway worktree: the script prints `STALE tests: baseline 48, test/run.mjs TESTS 49` and exits 1 |
| 16 | The ui.html figure matches a fresh build log | 🟢 | Fresh `npm run build` after `npm ci`, both exit 0: `wrote figma/plugin/ui.html 4111.1 KB`. The check agrees: `ok    ui.html: baseline 4111.1 KB, tree 4111.1 KB` | Nudged the baseline figure to 4110.1: the script prints `STALE ui.html: baseline 4110.1 KB, tree 4111.1 KB`, `stale total: 1` |
| 17 | `ref:` is a sha in origin/main's history | 🟢 | `ref: origin/main @ 20298cc`; `git merge-base --is-ancestor 20298cc origin/main` succeeds; the commit is `20298cca chore(deps): refresh build toolchain, lockfile and CI (vite 8.3, TypeScript 7, Node 24, Actions majors) (#706) (#707)`. The script agrees: `ok    head: baseline ref 20298cc is in origin/main's history` | The unit head `21a0e35d` is not an ancestor of origin/main, so the ancestry test distinguishes the two and is not accepting any sha handed to it |
| 18 | The interim ceiling section cites #713 and R13 | 🟢 | Inside §Interim gate-time ceiling: `#713` appears 4 times, `R13` 5 times, including the owner's verbatim ruling `"Interim ceiling now, split sweeps into gate scripts as a new ticket (Recommended)"` and the R13 sentence pinning the band until a run set started under load 5 | Read R13 on origin/main independently: `A run at load 5 or above is recorded with its load and not graded.` The section's threshold matches the ruling's, not the plan's stale load-10 wording (row 26) |
| 19 | The handoff lists the moved citations and the tenth re-pin; ten spot-checked against the engine | 🟢 | Ledger in `.sdlc/handoffs/pif-u4.md` §The complete re-pin ledger: 46 rows counted mechanically, per-document breakdown sums to 46, and `46 minus those 6 bare forms is 40`. Twelve anchors read straight out of this tree and all twelve match byte for byte, including the escaped pipe: `src/ui/app.js:1641` = `  renderCenter(view) {`, `:1886` = `  renderCanvasFooter() {`, `:1927` = `  renderRightPane(view) {`, `:2162` = `  renderAppFooter() {`, `:2587` = `customElements.define("ultimate-tokens", HctApp);`, `:2319` = `  saveToProject() {`, `:2108` = `  _bindRangeDrag() {`, `src/ui/model.mjs:1061` = `    shadcn: exportShadcn(state, { fonts: shadType.fonts, radii: shadGeom.radii }, derived),`, `src/ui/persist.js:646` = `  const gp = clean(e.geomPrefix, "g"); const geomPrefix = gp \|\| null;`, `src/engine/tonal.js:907` = `const _okL = new Map(); // L* -> OKHSL lightness (via a neutral gray at that L*); memoized`, `test/engine/tonal.mjs:283` and `:687`. Tenth re-pin: `grep -c 'export schema 3'` on `test/engine/fixtures/shadcn-baseline.css` reads `3`, `export schema 2` reads `0`, and `src/engine/exports.js:55` reads `export const EXPORT_SCHEMA_VERSION = 3;` | Row 14's line-nudge control reds the gate that protects these same anchors, so a stale ledger row would not survive at this head |
| 20 | #715 cited beside verdict rows 13 and 25 | 🟢 | `.sdlc/handoffs/pif-u4.md:348` (`Follow-up ticket: #715`, row 13's C4 ramp identity control), `:395` (row 25's default-kit sweep) and `:383` (row 20, which the handoff also declares). Each says `#715 is not claimed by #681's PR` | `grep -n "715"` over the file returns exactly those three sites and no fourth, so the citation is placed and not sprayed |
| 21 | `.sdlc/baseline.md` carries no figure that cannot be traced to a recorded run | 🔴 | The CPU-share table row `\| 95% (printed) \| 716.04 s \| no, by 166 s \|` names a run that exists nowhere. `grep -rn "716\.04"` over the whole tree returns exactly one hit, that table cell. It is absent from the 14-row reading series above it, absent from the eight runs `.sdlc/handoffs/pif-u5.md` §8 logs (518.66, 649, 889.89, 705.01, 647.42, 592.17, 747.27, 795.49), and absent from every other record. The 649 s run, which IS in the series, has no row in the CPU table, so the phantom stands where it should be. Introduced at `21a0e35d`, the head no reviewer saw | `git log -S"716.04"` over the branch returns one commit, `21a0e35d`, and nothing earlier: the figure has no ancestor to have been carried from. Contrast every other wall in that table, each of which resolves to a row of the series above it and to a run in the handoff |
| 22 | The ceiling section's counts agree with its own table | 🔴 | `Eight readings sit above the band and one sits inside it.` The reading series has **14** rows, of which **8** are above 550 s and **6** are inside the band (284, 293.09, 318.52, 344, 430.46, 518.66). The sentence is true only of the 9-row CPU-share table, and that table is the one carrying the phantom of row 21; remove the phantom and even it reads 7 above | Counted both tables mechanically rather than reading the prose: `grep -c '^\| [0-9]'` over the series range prints `14`, over the CPU table prints `9`. The sentence matches neither the series it follows nor the corrected table |
| 23 | The R13 eligibility claim holds against the series | 🔴 | `Every reading in this series started at 5.18 or above, so under R13 all of them are RECORDED and none is GRADED.` Two rows give a start load band opening at **3.9** (`284 s` and `344 s`, both `3.9 to 9.4 band`), which is below 5.18 and below R13's threshold, and a third (`318.52 s`) reads `not recorded with the figure`, so its eligibility cannot be asserted in either direction. This is the sentence that carries the section's R13 conclusion | Read the load column of all 14 rows rather than the claim about it. Three rows contradict or cannot support it. The claim would be true of the eight U5 and verifier runs alone, which is a narrower set than `this series` names |
| 24 | The monotone-in-load argument rests on figures that trace to their own runs | 🔴 | `The series 293 s at load 3.1, 430 s at load 5.2, 519 s at load 6.6, 649 s at load 9.4-to-34, 780 s at load 9.4-to-63 and 890 s at load 79.5 is monotone in load`. The `3.1` belongs to a different run: the 293.09 s reading's own source, `.sdlc/handoffs/pif-u4.md:448`, reads `**Current: 293.09 s wall (round 4's own head, 36ce7777), load at start 9.42 / 6.59 / 5.30.**` (`cited:` a record, and `altered:` cut before the trailing ` Per-file`), and the baseline's own series row agrees (`\| 293.09 s \| 9.42 / 6.59 / 5.30 \|`). The `3.1` is the verifier's `345.89 s` run at `real 345.89`, `load at start ` plus `3.14 4.02 4.95` (`.sdlc/verdicts/pif-u4.md:13`, `cited:` a record, `altered:` a fragment of a table cell, the record's own inline fences kept as two spans), a wall time this sentence does not use. With the correct load the series reads 9.42, 5.18, 6.56, 9.42, 9.37, 79.53 against rising walls, which is **not** monotone, and monotonicity is the section's central argument that the overshoot is contention rather than regression | `grep -rn "293\.09"` across `.sdlc/` returns three records, all giving load 9.42, and none giving 3.1. `grep -rn "3\.1[0-9] "` over `.sdlc/handoffs/pif-u4.md` returns nothing, so the figure was not taken from that unit's own handoff either. Every other load in the sentence does resolve to its own row |
| 25 | `.sdlc/adapter.md` differs from the merge parent only as the handoff says | 🟡 | `git diff e9850935 21a0e35d -- .sdlc/adapter.md` is exactly the two changes §3 and §7.3 declare: the `test` gate row's Time cell and the budget note. `git diff --stat a9a36405 21a0e35d -- .sdlc/adapter.md` is empty, confirming §10's `byte-identical to a9a36405`, and the machine-parsed `56 to 60 s` prefix is untouched. The yellow is inside the added note: `a seven-reading series from 284 s to 780 s` is stale against the series it points at, which now holds 14 readings and runs to 889.89 s | `grep -c '^\| [0-9]'` over the baseline's series range prints `14`, not 7, and the maximum row reads `\| 889.89 s \|`. The adapter is a file this same change edited, so the stale-record rule applies to it in this pass |
| 26 | The plan's C1 load threshold against R13 | 🟡 | C1 at plan tip reads `A run at load 10 or above is recorded with its load and not graded against the ceiling.` R13 on origin/main reads `A run at load 5 or above is recorded with its load and not graded.` The baseline applies R13's threshold correctly; the plan wording U5 proposed at revision 27 is stale against the later ruling. Not a defect in the branch's records, but the two documents disagree and a later reader grading against C1 would grade a load-7 run that R13 exempts | Read both texts rather than either alone. R13's own `Effect` line is explicit, and the baseline cites R13 by name five times while the plan cites only #713 |
| 27 | C9's `.roles` needle | 🟡 | `jq '.roles \| length' docs/reference/data/role-table.json` prints `0` on the branch and `0` on origin/main, because the file has no `.roles` key: `jq 'keys'` gives `constants`, `defaults`, `roleTable`, `rolesPerPalette`. The criterion is satisfied as written and is vacuous as written. The 53-role count lives at `.roleTable` (`53`) and is really enforced by `engine/semantic.mjs`. A plan defect under R10, not the branch's | Ran the same needle against `.roleTable`, which prints `53` on both sides and moves to `54` when nudged, showing what a non-vacuous form of this clause looks like |
| 28 | Scope: records, docs, one generator and regenerated artifacts only | 🟢 | `git diff --name-only 71c7c792...21a0e35d` lists 62 paths. Piping that list through `grep -c '^src/\|^test/'` prints `0`: no engine or test logic moved. The one generator is `scripts/gen-adia-derived-exports.mjs`, the regenerated artifacts are `docs/reference/data/adia-oklch-export.css` and `adia-radix-export.mjs`, and the `.sdlc/` bulk arrived through the declared main merge `e69dfb0b` | The same grep against the full `origin/main...21a0e35d` range is non-zero, because U1 to U6 did move engine files, so the `0` above is a real property of U5's own range and not a broken pattern |
| 29 | No em dash added in prose versus the unit's base | 🟢 | Ran a `perl` counter over all `58` changed markdown files, stripping double-backtick then single-backtick inline spans before counting `\x{2014}`, comparing `71c7c792` against `21a0e35d` per file. **Zero files increased.** New files count as base 0, so a new file carrying one would surface; `.sdlc/handoffs/pif-u5.md` reads `0` at head | Fed the counter `a — b`, a backticked line, and `e — f — g`: it returned `3`, stripping the span and counting both dashes on the third line. It counts, and it strips |
| 30 | The adapter's verbatim-quote rule on every record this unit adds | 🟢 | Every spot check is byte-exact against the program in this tree. `sh .sdlc/checks/baseline-agrees-check.sh` output matched the handoff's three quoted rows with `grep -Fxq`, column padding included: `ok    head: baseline ref 20298cc is in origin/main's history`, `stale total: 0`, and the note row. `node scripts/audit-citations.mjs` matched `    STALE 0 \| NEAR 1 \| UNDECIDABLE 0 \| OK 19 \| NOFILE 0  (line counts, deduped)` with its four leading spaces kept. The generator's policy block matched line for line with the `//   ` indentation preserved, the one backtick-bearing line marked `altered:` for its double-backtick fence | Compared with `grep -Fxq`, which is whole-line and literal, so one dropped leading space or one changed glyph fails the test. A reworded or re-indented quote would not have matched |

## Reproducing the four reds

All four are in `.sdlc/baseline.md` §Interim gate-time ceiling and need no build:

```
grep -rn "716\.04" .                       # row 21: one hit, the phantom cell
grep -c '^| [0-9]' <series range>          # row 22: 14 readings, not 9
grep '^| [0-9]' <series range>             # row 23: two rows open at 3.9, one has no load
grep -rn "293\.09" .sdlc/                  # row 24: every source gives 9.42, never 3.1
```

## What this verdict does not claim

- The `npm test` reading of 447 s is not offered as evidence about the ceiling in either direction.
  It started at load 9.80 and under R13 it is recorded, not graded, exactly like every reading in
  the branch's own series.
- `npm run smoke` was not run. It is not among the criteria the plan assigns to U5 and this unit
  touches no `src/ui/` path.
- The five-tag expectation in C9 is a land-time check performed by the squash, not by this head.
- The worktrees and clone under `/tmp/pif-u5-verify` are scratch. **Removal was denied by the
  permission system**, both the `git worktree remove` sweep and `rm -rf /tmp/pif-u5-verify`, so that
  directory is still on disk and someone with the right to delete it should. It is self-contained:
  every worktree was registered in the scratch clone's own `.git`, never the parent's, and the
  parent checkout at the primary checkout is clean, still on `main`, and
  registers `0` worktrees under that path.
- This seat never wrote to the repo, the unit branch or the unit worktree. Every run was in the
  scratch clone or a detached worktree of it.


# Pass 2 (delta 21a0e35d..8918342c), same verifier

---
kind: verdict
seat: verifier (independent, read-only), round 2
unit: U5 (records and release notes), plan `.sdlc/plans/preset-intent-fidelity.md`, ticket #681
graded at: unit/pif-u5-records @ `8918342c`
previous round: `21a0e35d`, verdict 1 (`pif-u5-verify-verdict.md`)
delta re-graded: `21a0e35d..8918342c`, three files, all under `.sdlc/`
rulings applied: R8, R9, R10, R12, R13
written: 2026-09-20
---

# Verdict: 🔴

Rows 21, 22, 24 and 25 are fixed and verified. **Row 23 is still red**, and in a sharper form than
before: the false sentence was corrected in one place and left standing, verbatim, in another
paragraph of the same section. Two new rows record what the brief asked about the graded readings.

Rows 1 to 20 and 26 to 30 of verdict 1 are carried unchanged by reference. The delta touches
`.sdlc/baseline.md`, `.sdlc/adapter.md` and `.sdlc/handoffs/pif-u5.md` only, so no criterion those
rows grade can have moved; row 31 below re-runs the gates that read `.sdlc/` anyway.

## Re-graded rows

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 21 | No figure in §Interim gate-time ceiling that cannot be traced to a recorded run | 🟢 fixed | `grep -c "716\.04"` over `.sdlc/baseline.md` now reads `0`. Derived the stronger property with a script rather than grepping one string: parsed both tables and checked every CPU-table wall against the series. **`CPU walls with no series row (phantoms): NONE`**. The CPU table's nine walls (518.66, 553.45, 592.17, 647.42, 705.01, 747.27, 795.49, 889.89, 780.23) each resolve to a row above | Re-injected the exact retired row, `\| 95% (printed) \| 716.04 s \| no, by 166 s \|`, into a scratch copy and re-ran the same script: it printed `CPU walls with no series row (phantoms): 716.04`. The detector finds a phantom when one is there, and the file is clean |
| 22 | Every counted sentence derives from the series table by a command | 🟢 fixed | Parsed the table and re-derived each claim. `The series holds **15 readings**` → `series rows: 15`. `**9** above the band's 550 s top` → `above 550 (9): 553.45, 592.17, 647.42, 649, 705.01, 747.27, 780.23, 795.49, 889.89`, the stated list element for element. `**6** inside it` → `inside (6): 284, 293.09, 318.52, 344, 430.46, 518.66`, likewise. CPU table: `cpu rows: 9 \| inside: 1 \| above: 8`, matching `Nine rows ... one is inside the band and eight are above it`. Every `no, by N s` cell checks: 553.45 → 3.45, 592.17 → 42.17, 647.42 → 97.42, 705.01 → 155.01, 747.27 → 197.27. The two declared breaks in the share ordering hold: `101%` carries both 553.45 and 592.17, and the bottom pair is `90% -> 889.89` then `87.3% -> 780.23` | Nudged `705.01 s`'s start load from 5.42 to 6.42 in a scratch copy and re-ran the pairing derivation: it printed `pairings that disagree with the table: 705.01`. The derivation reads the rows, not the prose, so a drifted figure surfaces |
| 23 | The R13 eligibility claim holds against the series | 🔴 **still red** | Fixed in one place, left standing in another, and the two now contradict each other inside one section. At line 100: `Exactly **one** of the 15 is graded under R13, and it is the newest.` At line 166, under the heading `How these readings are to be treated`: `Every reading in this series started at 5.18 or above, so under R13 all of them are RECORDED and none is GRADED.` At line 170: `#681's pre-land needs one quiet run started under load 5; none of these is it.` The `553.45 s` row started at `4.63` and falsifies both of the later two. Line 107 makes it worse by narrating the sentence as already gone: `An earlier sentence in this place said flatly that every reading started at 5.18 or above, and then that none was gradeable`. It is not gone; it is 59 lines below. The surviving paragraph is the one a reader looking for the treatment rule lands on | Extracted all three sentences from the same file in one pass with a multi-line `perl -0777` match, so the contradiction is proven from the file rather than from reading order. The single-line `grep -c "Every reading in this series started at 5.18 or above"` returns `0` because the sentence wraps, which is exactly how a line-oriented check would have missed this and how the fix pass appears to have missed it |
| 24 | The monotone-in-load argument rests on figures that trace to their own runs | 🟢 fixed | The claim is withdrawn in the file's own words, `**A monotone-in-load claim stood here and is WITHDRAWN.**`, with the mismatch stated: the 293.09 s row gives `9.42 / 6.59 / 5.30` and `3.14 4.02 4.95` belongs to the verifier's 345.89 s run. Checked every wall-and-load pair the withdrawal cites against the table: `pairings that disagree with the table: NONE`, all eight of 518.66→6.56, 592.17→7.94, 647.42→7.70, 705.01→5.42, 747.27→16.81, 780.23→9.37, 795.49→17.27, 889.89→79.53. `grep -c "is monotone in load, which is what contention"` reads `0`. The string `293 s at load 3.1` survives once, at line 123, inside the withdrawal and marked as the retracted claim, which is the correct use of it | Row 22's load-nudge control also covers this: change one load and the pairing check names the row. A withdrawal that quoted a pairing the table does not carry would fail the same script that passes here |
| 25 | `.sdlc/adapter.md` agrees with the record it points at | 🟢 fixed | The one-line hunk now reads `a 15-reading series from 284 s to 889.89 s`, and the unsupported `that is monotone in host load` clause is dropped. Derived from the table: `readings: 15 min: 284 max: 889.89`. The delta is that single line; the machine-parsed `56 to 60 s` prefix and `:192` are untouched | The same derivation run against the pre-fix text yields 15/284/889.89 against a stated 7/284/780, which is how the stale count was caught in round 1. A figure typed rather than derived would not survive it |

## New rows this round

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 26 | Both graded R13 readings are on this branch | 🟡 | Only one is. `553.45 s` at `4.63` is in this series. The other, `326.00 s` at `4.88`, is on branch `scratch/pif-main-sync-exec-163400` @ `4705ab27`, taken on the sync tree `8f037dd2` (`unit/pif-u5-records` @ `21a0e35d` merged with `origin/main` @ `13f46583`). `git merge-base --is-ancestor` reports that branch is **NOT merged into `8918342c`**. So `Exactly **one** of the 15 is graded under R13` is honest about the series this file holds and wrong about what the plan now has, and the other baseline says the opposite of this one: `the 326.00 s reading is therefore the only` graded reading there. Two records will claim to be the R13 story at land | Searched every ref for a baseline mentioning the figure: exactly one hit, that scratch branch, and none in this unit's history. The reading is real and is simply not here, which is a different defect from the invented figure of round 1 and needs a different fix, an absorb rather than a delete |
| 27 | Each graded reading checks against its log | 🟡 | Neither log exists. The `326.00 s` row names `scratchpad/r13-window-result.txt` and its `.npm-test.log` sibling; both are absent from disk and `git ls-tree` over that branch's `scratchpad` returns nothing, so they were never committed. Run 9's row offers two quoted lines and no log path at all. What is checkable is internal consistency, and it holds for both: `9:13.45` resolves to `553.45` s exactly; `(553.58 + 9.44) / 553.45 = 101.73%`, consistent with the printed `101% cpu`; `4.63` is the one-minute figure of `load averages: 4.63 4.88 10.76`; `553.45 - 550 = 3.45`, which is `0.63%`, matching the stated `0.6%`. The `326.00 s` row is candid that its wall is `date +%s` around the invocation rather than a `time` line, and declines to state a CPU share for that reason | Arithmetic is not provenance and this row does not pretend otherwise. A fabricated reading with self-consistent arithmetic would pass every check above, which is precisely what round 1's phantom nearly did; the only control that bites is a log, and there is none to run |
| 28 | What the section may honestly claim | 🟡 | Stated because the brief asked. **May claim:** two readings are admissible under R13, `326.00 s` at `4.88` and `553.45 s` at `4.63`; one sits inside the band with 224 s of headroom and one sits `3.45 s`, or `0.63%`, over its 550 s top. On the only evidence R13 admits, the interim band is very close to right, and nothing supports widening it. **May not claim:** that none of the series is graded (row 23); that the overshoot is contention, since the monotone-in-load argument is withdrawn and the share ordering is stated in the file itself as neither monotone nor a rate; that the 13 recorded readings bear on the band in either direction; that two readings are a run SET, which is what R13 requires before anything moves. The honest sentence is that the band stands as written, with one graded reading 0.63% over its top, and that #713 re-measures it | The claim was built from the two loads and two walls, not from the prose, and each figure was re-derived above. A version of this row that leaned on the 13 recorded readings would contradict R13's own text, `A run at load 5 or above is recorded with its load and not graded`, read on origin/main |
| 29 | No file outside `.sdlc/` moved | 🟢 | `git diff --name-only 21a0e35d 8918342c \| grep -v '^\.sdlc/' \| wc -l` prints `0`. The three paths are `.sdlc/baseline.md`, `.sdlc/adapter.md` and `.sdlc/handoffs/pif-u5.md` | The unfiltered list is non-empty at 3, so the filter is removing real rows and the `0` is a property of the delta, not of a broken pattern |
| 30 | Branding clean | 🟢 | `node test/repo/branding.mjs` exit 0, `branding: clean (537 files scanned)` | Verdict 1 row 13 drove the gate to exit 1 on all three of its banned shapes, extracted from the gate's own source and never retyped. That control stands; the gate is the same file at this head. The retired maker brand is not written literally anywhere in this verdict |
| 31 | The other `.sdlc/`-reading gates still green at this head | 🟢 | `node test/repo/citations.mjs` exit 0, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 8918342c)`; `node test/repo/doc-mutation-lane.mjs`, `doc-mutation-lane: clean (7 files scanned)`; `sh .sdlc/checks/baseline-agrees-check.sh` exit 0 with `ok    head: baseline ref 20298cc is in origin/main's history` and `stale total: 0` | Verdict 1's controls for each of these bite and are unchanged: a nudged citation line reds the citations gate, a nudged test-file figure prints `STALE tests: baseline 48, test/run.mjs TESTS 49` |
| 32 | No em dash added in prose across the delta | 🟢 | Counted with the same span-stripping `perl` counter, per file, `21a0e35d` against `8918342c`: `.sdlc/baseline.md` `0 -> 0`, `.sdlc/adapter.md` `3 -> 3`, `.sdlc/handoffs/pif-u5.md` `0 -> 0`. No increase | The counter was proved in round 1 against `a — b`, a backticked line and `e — f — g`, returning `3`. The adapter's steady `3` are pre-existing and inside spans this strip does not reach, so a flat count here is a real read and not a silent zero |

## The one fix owed

One edit, in `.sdlc/baseline.md`, in the closing paragraph headed `How these readings are to be
treated`: the two sentences at lines 166 and 170 must say what lines 100 to 113 already say, that
one reading in the series is graded and it started at 4.63. Under **R8** this is fixed in place in
this unit, and under **R9** it is not a ticket. Row 26's absorb of the `326.00 s` reading is the
Conductor's call on which record carries the R13 story, and it should be settled before land rather
than at it.

## Reproducing

From a scratch clone at `8918342c`, no build needed:

```
perl -0777 -ne 'print $& if /Every reading in this\s+series started at 5\.18 or above[^.]*\./s' .sdlc/baseline.md
grep -n "Exactly \*\*one\*\* of the 15 is graded" .sdlc/baseline.md
```

The first still prints the retracted sentence; the second prints the paragraph that retracts it.

## What this verdict does not claim

- No timed `npm test` reading was taken this round. The host was at `load averages: 263.61 137.39
  66.82` with another seat's suite live in `.worktrees/gs-U3`, so a timed run would have been
  worthless under R13 and would have contended with theirs. Under the one-at-a-time convention this
  seat did not start one.
- The full suite was not re-run at this head. The delta is three prose files under `.sdlc/`; the
  three suite members that read `.sdlc/` at all were run directly and are green (row 31), which is
  the same reasoning the handoff's own new paragraph gives for its run 9.
- The `326.00 s` reading is reported as it stands on its own branch. It was not re-derived, and its
  named log does not exist.
- Scratch worktrees and a clone live under `/tmp/pif-u5-verify2`. Round 1's `/tmp/pif-u5-verify`
  could not be removed: the permission system denied both `git worktree remove` and the directory
  delete. Both are self-contained, registered only in their own scratch clones, and the working
  checkout registers none of them.


# Pass 3 (rows-only, delta 8918342c..fdceb246), same verifier

---
kind: verdict
seat: verifier (independent, read-only), round 3
unit: U5 (records and release notes), plan `.sdlc/plans/preset-intent-fidelity.md`, ticket #681
graded at: `fdceb246`
previous round: `8918342c`, verdict 2 (`pif-u5-verify-verdict-2.md`)
scope: rows-only re-verify of the pass-2 red and yellow criteria
host rule honored: no `--full` sweep, no `npm test`, no timing run. Greps, git, reads, and the two
  single-file node gates the brief names
written: 2026-09-20
---

# Verdict pif-U5 pass 3 · 🟡 at fdceb246

Row 23, the pass-2 red, is **fixed**. Both retracted sentences are gone under a wrapped-line search,
the section's partition sums exactly, both graded logs are now committed, and every honesty claim
the brief lists checks against the rows. Three yellows remain, all provenance or hygiene, none
touching a figure or a claim.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | Row 23: §Interim gate-time ceiling no longer contradicts itself; the partition sums | 🟢 | Wrapped-line search, `tr '\n' ' ' < .sdlc/baseline.md \| grep -o "Every reading in this  *series started at 5\.18 or above[^.]*\."` → no match (exit 1), and `grep -c "none of these is it"` on the same flattened stream → `0`. A `perl -0777` scan for every sentence containing `5.18 or above` returns exactly two, and both are now true: the scoped `Of the other 16: **thirteen** record an explicit start load and every one is **5.18 or above**`, and the narration `An earlier sentence in this place said flatly that every reading started at 5.18 or above`, which is now accurate because the sentence it describes is in fact gone. Partition derived by parsing the table, not by reading the prose: `series rows: 18`, `rows marked graded: 2` (326, 553.45), `explicit start load >=5.18: 13`, `no explicit single load: [(318.52, 'not recorded with the figure')]` plus the two `3.9`-band rows 284 and 344 → **2 + 13 + 3 = 18**, the claimed partition element for element. The wall split also derives: `above 550: 11` and `inside: 7`, matching `**11** above the band's 550 s top` and `**7** inside it`, and both printed lists match the derived lists member for member | The identical two commands run against `git show 8918342c:.sdlc/baseline.md` DO print the retracted sentence (`Every reading in this series started at 5.18 or above, so under R13 all of them are RECORDED and none is GRADED.`) and DO return `1` for `none of these is it`. The flattening detector fires on the state that was red and is silent on this head, so the `0` is a property of the file, not of a pattern that never matched |
| 2 | R13 provenance: both graded logs committed, figures and tree agreeing with baseline.md | 🟡 | Both logs are **tracked**, not just on disk: `git ls-tree -r --name-only HEAD .sdlc/records/` lists `.sdlc/records/pif-u5-gate-logs/r13-326s-sync-tree-8f037dd2.txt` and `.../r13-553s-unit-branch.log`. The 553 log's own lines carry `UPTIME BEFORE: ... load averages: 4.63 4.88 10.76` and `npm test  553.58s user 9.44s system 101% cpu 9:13.45 total`, so start load `4.63` and wall `553.45` are quoted, not retyped. The 326 log carries `pre-run load1: 4.88`, `npm test exit code: 0`, `wall time seconds: 326`, and `✓ all 49 test files passed`. On the tree: `git merge-base --is-ancestor 8f037dd2 fdceb246` → **NO**, so the brief's fallback applies and it holds. Baseline states it plainly in the row itself: `Taken on the sync tree 8f037dd2, which is U5 at 21a0e35d merged with main, not on this unit branch`, and that merge is real, `git log -1 --format='%P' 8f037dd2` gives parents `21a0e35d` (U5) and `13f46583` (main). `git diff --name-only 8f037dd2 fdceb246` is **16 paths, all under `.sdlc/`**, `grep -cv '^\.sdlc/'` → `0`, so the record's `records-only, under .sdlc/, touches no runtime file` is exact and in fact stronger than the brief's `.sdlc/ and docs` bar. **The yellow:** the `553.45 s` reading names no tree sha anywhere. Its log carries none (`grep -niE "tree\|commit\|HEAD\|sha"` over it returns only an unrelated `ui/headless-boot.mjs` line), and baseline and `.sdlc/handoffs/pif-u5.md:305` both locate it only as `the committed tree, R8 pass` on this unit branch. So one of the two graded readings cannot have its tree checked at all | The ancestry check is not vacuous: `git cat-file -t 8f037dd2` returns `commit`, so the object is present and `--is-ancestor` is answering about a real commit rather than failing on an unknown ref. The path filter is not vacuous either: the unfiltered list is 16 rows, so `grep -v` is removing real lines to reach `0` |
| 3 | The claims made are the honest ones | 🟢 | Each re-derived from the rows. Band: `Interim ceiling: npm test is expected between 280 and 550 s`, unchanged, and `The band stands untouched`. Overshoot: `553.45 s sits **3.45 s over** its 550 s top, **0.63%**`, computed, `553.45 - 550 = 3.45`, `3.45/550 = 0.627%`. Inside: `326 s` row ends `Comfortably INSIDE the band`, and the parse puts 326 in the `inside` list. Spread: `227 s apart`, computed, `553.45 - 326 = 227.45`, and marked unexplained in the record's own words, `**The divergence among the quiet runs is unexplained** ... **nothing in this record explains that spread**`. Nothing widens: `neither graded reading supports widening it`, and the earlier widening cases are named and disowned (`first at about 100 s and then at 40 to 100 s, is not supported`). Every `no, by N s` cell in the CPU table re-derives from its own wall: 553.45→3.45, 592.17→42, 647.42→97, 705.01→155, 716.04→166, 747.27→197, all matching | The `no, by N s` derivation is a real check, not a restatement: it recomputes `wall - 550` from the parsed wall and compares, and it flagged nothing only after passing six rows. A row whose stated overshoot drifted from its own wall would print `MISMATCH`. The CPU table's 11 walls were also checked back against the series: `cpu phantoms (not in series): NONE`, and `cpu inside: 1, above: 10` matches the prose `one is inside the band and 10 are above it` |
| 4 | Rows 21, 22, 24, 25 still hold at this head | 🟡 | The delta is not cosmetic, `git diff --stat 8918342c fdceb246` moves 92 lines of `.sdlc/baseline.md`, so each was re-derived rather than assumed. **Row 22 🟢**: counts and lists re-derived above and all match. **Row 24 🟢**: `grep -c "is monotone in load, which is what contention"` → `0`, the withdrawal still stands at line 140 (`**A monotone-in-load claim stood here and is WITHDRAWN.**`), and the delta strengthens it with the `1119.57 s` row explicitly refusing to restore it (`One row at load 194.52 does not restore the monotone-in-load argument that a row at load 5.42 broke`). **Row 25 🟢**: the adapter's one line now reads `a 18-reading series from 284 s to 1119.57 s`, and the parse gives `series rows: 18`, min `284`, max `1119.57`, the figures moved with the record instead of going stale, which is what row 25 grades. **Row 21 🟡**: `716.04` went from `0` hits at `8918342c` to `4` at this head, restored as a series row, and its cited source is `scratchpad/p1-gate-evidence/`, a path that exists neither in the working tree (`ls` → `No such file or directory`) nor in any commit (`git log --all --diff-filter=A --name-only \| grep -c "p1-gate-evidence"` → `0`). The reading itself is not a phantom: the row quotes its own two output lines and its `95% cpu 11:56.04 total` resolves to `716.04` exactly. But the citation is uncheckable, which is the same `evidence lived only in /tmp` defect this very section says it committed the two graded logs to prevent. `1119.57` is restored the same round and quotes its own two lines, with no external path claimed | The phantom detector that caught round 1's invented figure was re-run at this head and reports `cpu phantoms: NONE`, so row 21's mechanical property holds; the yellow is the narrower one the detector cannot see, an unresolvable path. The path search is not vacuous, the same `git log --all --name-only` pipeline finds `pif-u5-gate-logs` when asked for it |
| 5 | Hygiene: delta scope, branding, em dashes, home paths | 🟡 | Scope 🟢: `git diff --name-only 8f037dd2 fdceb246` is 16 paths, all `.sdlc/`, none outside. Branding 🟢: `node test/repo/branding.mjs \| tail -1` → `branding: clean (537 files scanned)`, exit 0. Em dashes 🟢: `git diff 8918342c fdceb246 \| grep "^+" \| grep -c ", "` → `0`, so the question of backticks never arises, no added line carries one anywhere. Citations 🟢 (run because the delta is doc-only): `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD fdceb246)`. **The yellow:** one home path survives in a new record. `.sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log` line 30 prints the generator's absolute destination, a `$HOME`-rooted path beginning `/Users/<user>/` and running through `.git-worktrees/pif-u5-records/src/ui/categories/index.js`, the one hit across both logs (the 326 log is `0`). It is the categories generator's own output, so removing it would collide with the adapter's verbatim-quote rule; the fix is a scrub line in the log's own header or a relative-path generator, not a silent edit | The em dash counter is not silently zero: the same `grep -c ", "` over the unfiltered diff body (not just `^+` lines) is also the measure that returned `3 -> 3` for the adapter in round 2, so the pattern matches the character when it is present. The `/Users/` grep is likewise live, it returns `1` for one log and `0` for the other in the same command, so it is discriminating between the two files rather than failing on both |
| 6 | Note (not graded): the branding text filter never opens a committed gate log | ✅ confirmed | Lane A is right, and the mechanism is the extension allowlist at `test/repo/branding.mjs:52`: `const TEXT = /\.(js\|mjs\|ts\|json\|html\|css\|md\|yml\|yaml\|svg\|webmanifest)$/`, applied at line 66 as `if (!TEXT.test(rel) \|\| SKIP_FILES.has(rel) \|\| RECORDS.has(rel)) continue;`. Neither `.txt` nor `.log` is in the alternation. Ran the regex directly against both real paths: `r13-553s-unit-branch.log → false`, `r13-326s-sync-tree-8f037dd2.txt → false`, `x.md → true`. So both committed logs are skipped before their bytes are ever read. What is in them: a case-insensitive scan finds the retired maker brand **once**, lowercase, as a directory segment of the `/Users/` path in the 553 log; the 326 log has none. Against the gate's three actual predicates (`the retired maker brand` uppercase, the retired `.io` domain, the pre-rename package identifier) the count is `0` in both files, so even if `.log` were added to the allowlist today neither log would fail, the bare lowercase form in a filesystem path is not one of the three banned shapes | The regex check is a real discrimination, not an assertion: the same one-liner returns `true` for `x.md` in the same run that returns `false` for both logs, so the filter is being exercised rather than always-falsing. The brand scan is likewise live: it returns a count of `1` for one log and `0` for the other |

## Overall

🟡. No reds. Row 23 is genuinely fixed and the fix survives the wrapped-line search that caught it
last round. The three yellows are all about provenance around the edges of the figures, never the
figures themselves: the `553.45 s` reading names no tree, the restored `716.04 s` row cites a path
that is in no commit, and one committed log carries a home path. All three are one-line edits in
this unit under R8.

## What this verdict does not claim

- No timed run, no `npm test`, no `--full` sweep was taken. The host rule forbade it and nothing
  graded here needs one: every figure was re-derived from the committed rows and the two committed
  logs.
- The `716.04 s` and `1119.57 s` readings, both new since `8918342c`, were checked for internal
  consistency and against the CPU table only. Neither was independently reproduced.
- Rows 1 to 20 and 26 to 32 of the earlier verdicts are carried by reference and were not re-graded.

## Reproducing

From a scratch worktree at `fdceb246`, no build needed:

```
tr '\n' ' ' < .sdlc/baseline.md | grep -c "none of these is it"          # 0 here, 1 at 8918342c
git merge-base --is-ancestor 8f037dd2 fdceb246; echo $?                  # 1, and the fallback holds
git diff --name-only 8f037dd2 fdceb246 | grep -cv '^\.sdlc/'             # 0
git ls-tree -r --name-only HEAD .sdlc/records/pif-u5-gate-logs/          # both logs tracked
grep -rn "/Users/" .sdlc/records/pif-u5-gate-logs/                       # 1 hit, the 553 log
grep -c "716.04" .sdlc/baseline.md; ls -d scratchpad/p1-gate-evidence    # 4 hits, path absent
```


# Pass 3 re-run at 971d59b9 (adds the ceiling-counts check row), same verifier

---
kind: verdict
seat: verifier (independent, read-only), round 3
unit: U5 (records and release notes), plan `.sdlc/plans/preset-intent-fidelity.md`, ticket #681
graded at: `971d59b9` (re-target; the earlier draft of this verdict graded `fdceb246`, which this
  commit replaces by amend)
previous round: `8918342c`, verdict 2 (`pif-u5-verify-verdict-2.md`)
scope: rows-only re-verify of the pass-2 red and yellow criteria, plus the new counts check
host rule honored: no `--full` sweep, no `npm test`, no timing run. Greps, git, reads, and the
  single-file node checks the brief names
written: 2026-09-20
---

# Verdict pif-U5 pass 3 · 🟡 at 971d59b9

Row 23, the pass-2 red, is **fixed**. Both retracted sentences are gone under a wrapped-line search,
the partition sums exactly, both graded logs are committed, every honesty claim the brief lists
checks against the rows, and the new counts check is real: exit 0 with the expected partition line,
and nine independently constructed mutations each drive it to exit 1. Three yellows remain, all
provenance or hygiene, none touching a figure or a claim.

`.sdlc/baseline.md` and `.sdlc/adapter.md` are **byte-identical** between `fdceb246` and this head
(`git diff --name-only fdceb246 971d59b9 -- .sdlc/baseline.md .sdlc/adapter.md` is empty), so the
partition fix was already in at the earlier head and the re-target adds only
`.sdlc/checks/ceiling-counts-check.mjs` and 32 lines of `.sdlc/handoffs/pif-u5.md`. Every derivation
below was nonetheless re-run at `971d59b9` rather than carried.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | Row 23: §Interim gate-time ceiling no longer contradicts itself; the partition sums | 🟢 | Wrapped-line search at this head, `tr '\n' ' ' < .sdlc/baseline.md \| grep -c "Every reading in this  *series started at 5.18 or above"` → `0`, and the same flattened stream `grep -c "none of these is it"` → `0`. A `perl -0777` scan for every sentence containing `5.18 or above` returns exactly two and both are true: the scoped `Of the other 16: **thirteen** record an explicit start load and every one is **5.18 or above**`, and the narration `An earlier sentence in this place said flatly that every reading started at 5.18 or above`, now accurate because the sentence it describes is in fact gone. Partition derived by my own parse of the table, written before reading their script: `series rows: 18`, `rows marked graded: 2` (326, 553.45), `explicit start load >=5.18: 13`, `no explicit single load: [(318.52, 'not recorded with the figure')]` plus the two `3.9`-band rows 284 and 344 → **2 + 13 + 3 = 18**. Wall split likewise: `above 550: 11`, `inside: 7`, matching `**11** above the band's 550 s top` and `**7** inside it`, both printed lists member for member | The identical two commands against `git show 8918342c:.sdlc/baseline.md` DO print the retracted sentence (`Every reading in this series started at 5.18 or above, so under R13 all of them are RECORDED and none is GRADED.`) and DO return `1` for `none of these is it`. The flattening detector fires on the state that was red and is silent here, so the `0` is a property of the file, not of a pattern that never matched |
| 2 | R13 provenance: both graded logs committed, figures and tree agreeing with baseline.md | 🟡 | Both logs are **tracked** at this head, not merely on disk: `git ls-tree -r --name-only HEAD .sdlc/records/pif-u5-gate-logs/` prints `r13-326s-sync-tree-8f037dd2.txt` and `r13-553s-unit-branch.log`. The 553 log's own lines carry `UPTIME BEFORE: ... load averages: 4.63 4.88 10.76` and `npm test  553.58s user 9.44s system 101% cpu 9:13.45 total`, so start load `4.63` and wall `553.45` are quoted, not retyped. The 326 log carries `pre-run load1: 4.88`, `npm test exit code: 0`, `wall time seconds: 326` and `✓ all 49 test files passed`. On the tree: `git merge-base --is-ancestor 8f037dd2 971d59b9` → **NO**, so the brief's fallback applies and it holds. Baseline states it in the row itself, `Taken on the sync tree 8f037dd2, which is U5 at 21a0e35d merged with main, not on this unit branch`, and that merge is real: `git log -1 --format='%P' 8f037dd2` gives parents `21a0e35d` (U5) and `13f46583` (main). `git diff --name-only 8f037dd2 971d59b9` is **17 paths, all under `.sdlc/`**, `grep -cv '^\.sdlc/'` → `0`, stronger than the brief's `.sdlc/ and docs` bar. **The yellow:** the `553.45 s` reading names no tree sha anywhere. Its log carries none (`grep -niE "tree\|commit\|HEAD\|sha"` over it returns only an unrelated `ui/headless-boot.mjs` line), and baseline and `.sdlc/handoffs/pif-u5.md:306` both locate it only as `the committed tree, R8 pass` on this unit branch. One of the two graded readings therefore cannot have its tree checked at all | The ancestry check is not vacuous: `git cat-file -t 8f037dd2` returns `commit`, so `--is-ancestor` is answering about a real object rather than failing on an unknown ref. The path filter is not vacuous either: the unfiltered list is 17 rows, so `grep -v` removes real lines to reach `0` |
| 3 | The claims made are the honest ones | 🟢 | Each re-derived from the rows. Band: `Interim ceiling: npm test is expected between 280 and 550 s`, unchanged, and `The band stands untouched`. Overshoot: `553.45 s sits **3.45 s over** its 550 s top, **0.63%**`, computed as `553.45 - 550 = 3.45` and `3.45/550 = 0.627%`. Inside: the `326 s` row ends `Comfortably INSIDE the band`, and my parse puts 326 in the `inside` list. Spread: `227 s apart`, computed as `553.45 - 326 = 227.45`, and marked unexplained in the record's own words, `**The divergence among the quiet runs is unexplained** ... **nothing in this record explains that spread**`. Nothing widens: `neither graded reading supports widening it`, with the earlier widening cases named and disowned (`first at about 100 s and then at 40 to 100 s, is not supported`). Every `no, by N s` cell of the CPU table re-derives from its own wall: 553.45→3.45, 592.17→42, 647.42→97, 705.01→155, 716.04→166, 747.27→197 | The `no, by N s` derivation recomputes `wall - 550` from the parsed wall and compares, so it is a check and not a restatement; it reported nothing only after passing six rows, and a drifted cell prints `MISMATCH`. The CPU table's 11 walls were also resolved back to the series: `cpu phantoms (not in series): NONE`, and `cpu inside: 1, above: 10` matches the prose `one is inside the band and 10 are above it` |
| 4 | Rows 21, 22, 24, 25 still hold at this head | 🟡 | Re-derived, not assumed. **Row 22 🟢**: counts and lists as row 1. **Row 24 🟢**: `grep -c "is monotone in load, which is what contention"` → `0`; the withdrawal stands at line 140, `**A monotone-in-load claim stood here and is WITHDRAWN.**`; and the `1119.57 s` row explicitly declines to revive it, `One row at load 194.52 does not restore the monotone-in-load argument that a row at load 5.42 broke`. **Row 25 🟢**: the adapter's one line reads `a 18-reading series from 284 s to 1119.57 s`, and my parse gives 18 rows, min `284`, max `1119.57`, so the figures moved with the record instead of going stale, which is what row 25 grades. **Row 21 🟡**: `716.04` went from `0` hits at `8918342c` to `4` here, restored as a series row, and its cited source is `scratchpad/p1-gate-evidence/`, a path present neither in the working tree (`ls` → `No such file or directory`) nor in any commit (`git log --all --diff-filter=A --name-only \| grep -c "p1-gate-evidence"` → `0`). The reading is not a phantom: the row quotes its own two output lines and `95% cpu 11:56.04 total` resolves to `716.04` exactly. But the citation is uncheckable, which is the same `evidence lived only in /tmp` defect this section says the two committed logs exist to prevent. `1119.57`, restored in the same round, quotes its own two lines and claims no external path | The phantom detector that caught round 1's invented figure was re-run here and reports `cpu phantoms: NONE`, so row 21's mechanical property holds; the yellow is the narrower thing the detector cannot see, an unresolvable citation. The path search is not vacuous: the same `git log --all --name-only` pipeline does find `pif-u5-gate-logs` when asked for it |
| 5 | Hygiene: delta scope, branding, em dashes, home paths | 🟡 | Scope 🟢: `git diff --name-only 8f037dd2 971d59b9` is 17 paths, all `.sdlc/`, none outside. Branding 🟢: `node test/repo/branding.mjs \| tail -1` → `branding: clean (538 files scanned)`, exit 0. Em dashes 🟢: `git diff 8f037dd2 971d59b9 \| grep "^+" \| grep -c "—"` → `0`, and the same over the `fdceb246..971d59b9` delta → `0`, so the backtick question never arises, no added line carries one anywhere. Two further doc gates run because the delta is doc-only: `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 971d59b9)` and `doc-mutation-lane: clean (7 files scanned)`. **The yellow:** one home path survives in a new record. `.sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log` line 30 prints the categories generator's absolute destination, a `$HOME`-rooted path beginning `/Users/<user>/` and running through `.git-worktrees/pif-u5-records/src/ui/categories/index.js`. It is the one hit across both logs (the 326 log reads `0`) and the one `/Users/` line in the whole delta. Being the generator's own output, deleting it would collide with the adapter's verbatim-quote rule; the fix is a relative-path generator or a scrub note in the log's header, not a silent edit | The em dash counter is live rather than silently zero: the same `grep -c "—"` is the measure that returned `3 -> 3` for the adapter in round 2, so it matches the character when present. The `/Users/` grep discriminates within one command, returning `1` for one log and `0` for the other, so it is not failing on both |
| 6 | Note (confirm-only, filed as #724): the branding text filter never opens a committed gate log | ✅ confirmed | Lane A is right, and the mechanism is the extension allowlist at `test/repo/branding.mjs:52`, `const TEXT = /\.(js\|mjs\|ts\|json\|html\|css\|md\|yml\|yaml\|svg\|webmanifest)$/`, applied at line 66 as `if (!TEXT.test(rel) \|\| SKIP_FILES.has(rel) \|\| RECORDS.has(rel)) continue;`. Neither `.txt` nor `.log` appears in the alternation. Ran the regex directly against the real paths: `r13-553s-unit-branch.log → false`, `r13-326s-sync-tree-8f037dd2.txt → false`, `x.md → true`, so both logs are skipped before their bytes are read. What is in them: a case-insensitive scan finds the retired maker brand **once**, lowercase, as a directory segment of the `/Users/` path in the 553 log, and none in the 326 log; against the gate's three actual predicates (the upper-case maker name, the retired maker domain, the pre-rename package identifier) both files read `0`, so widening the filter today would still not red either | This head supplies a natural controlled comparison the earlier pass could not: the delta added one `.mjs` under `.sdlc/` and the scanned count moved `537 → 538`, while the two `.txt`/`.log` files added earlier moved it by zero. One scanned extension in, one file counted; two unscanned extensions in, nothing counted. The regex probe is likewise a real discrimination, returning `true` for `x.md` in the same run that returns `false` for both logs |
| 7 | New: `.sdlc/checks/ceiling-counts-check.mjs` runs clean and is not a vacuous gate | 🟢 | `node .sdlc/checks/ceiling-counts-check.mjs` at `971d59b9`: **exit 0**, eleven `ok` lines (counted, `grep -cE "^(ok  \|FAIL)"` → `11`), and the expected line verbatim, `partition: 18 = 2 graded + 13 explicit + 3 unsupportable`, followed by `ceiling-counts: clean`. Its measured partition equals mine, derived independently before I read its source. Read its source too: the assertions that matter are real re-derivations from the parsed rows, not prose echoes, and the one the script exists for is explicit, `PARTITION graded + explicit + unsupportable == total`. It also checks the two adapter-pointer figures that went stale twice | **Nine mutations on a scratch copy outside the worktree** (copied `baseline.md`, `adapter.md` and the script into a clean directory; the untouched copy exits 0 there, so the harness itself is sound). Each drives exit 1 and names the right assertion: total `**18 readings**`→17 → `FAIL prose total == rows (prose 17, rows 18)`; `**11** above`→10 → `FAIL prose above == measured`; `**thirteen**`→`**twelve**` → `FAIL prose explicit count == measured (prose 12, measured 13)` **and** `FAIL prose partition parts sum to 'other N' (12 + 3 vs 16)`, which is the defect the script was written for and reproduces the handoff's own stated control exactly; `Of the other 16`→15 → two FAILs; adapter note `18`→15 → `FAIL adapter note count == rows`; adapter max `1119.57`→`889.89` → `FAIL adapter note max == series max`; deleting the `326 s` row → three FAILs and `partition: 17 = 1 graded + ...`; editing the 553.45 row's start load `4.63`→`6.63` → `partition: 18 = 1 graded + 14 explicit + 3`, so graded-set membership is measured from the load column and not hard-coded; and a stray `\| 42 s \|` row appended elsewhere in the file → three FAILs. Exit codes confirmed explicitly (`mutated exit=1`, `clean exit=0`), and the copy restores to exit 0 after every mutation |

## Overall

🟡. No reds. Row 23 is genuinely fixed and survives the wrapped-line search that caught it last
round; the new check is the strongest artifact in the delta and bites on all nine mutations tried,
including the one no total could see. The three yellows are all provenance at the edges of the
figures, never the figures themselves: the `553.45 s` reading names no tree, the restored `716.04 s`
row cites a path in no commit, and one committed log carries a home path. All three are one-line
edits in this unit under R8.

## Two notes on row 7, neither graded

- **Nothing runs the new check.** `grep -rI "ceiling-counts"` over the tree finds it only in its own
  source and in `.sdlc/handoffs/pif-u5.md`. `test/run.mjs` has no reference to `.sdlc` at all, so it
  is not in `npm test`, and unlike `baseline-agrees-check.sh` it is named in no plan criteria row and
  in no adapter gate list. It follows the existing hand-run convention of `.sdlc/checks/`, so this
  is not a defect in the unit, but a check the ceiling section's next editor will only run if they
  remember it exists. One line in a plan's criteria table or in `.sdlc/adapter.md` would close it.
- **The row parse is file-scoped, not section-scoped.** It collects every `| <N> s |` line in the
  whole of `.sdlc/baseline.md`, which is why the stray-row mutation reds it. That fails loud rather
  than silent, so it is robustness rather than a hole, but a future table elsewhere in the file with
  a seconds-first column would red this check for the wrong reason.

## What this verdict does not claim

- No timed run, no `npm test`, no `--full` sweep. The host rule forbade it and nothing graded here
  needs one: every figure was re-derived from the committed rows and the two committed logs.
- The `716.04 s` and `1119.57 s` readings, both new since `8918342c`, were checked for internal
  consistency and against the CPU table only. Neither was independently reproduced.
- Rows 1 to 20 and 26 to 32 of the earlier verdicts are carried by reference and were not re-graded.

## Reproducing

From a scratch worktree at `971d59b9`, no build needed:

```
node .sdlc/checks/ceiling-counts-check.mjs; echo $?      # 11 ok, partition line, clean, 0
tr '\n' ' ' < .sdlc/baseline.md | grep -c "none of these is it"   # 0 here, 1 at 8918342c
git merge-base --is-ancestor 8f037dd2 971d59b9; echo $?  # 1, and the fallback holds
git diff --name-only 8f037dd2 971d59b9 | grep -cv '^\.sdlc/'      # 0
git ls-tree -r --name-only HEAD .sdlc/records/pif-u5-gate-logs/   # both logs tracked
grep -rn "/Users/" .sdlc/records/pif-u5-gate-logs/       # 1 hit, the 553 log
grep -c "716.04" .sdlc/baseline.md; ls -d scratchpad/p1-gate-evidence   # 4 hits, path absent
```

The check's negative control, run on a copy outside any worktree so the branch is never touched:

```
mkdir -p /scratch/.sdlc/checks && cp .sdlc/baseline.md .sdlc/adapter.md /scratch/.sdlc/ \
  && cp .sdlc/checks/ceiling-counts-check.mjs /scratch/.sdlc/checks/
cd /scratch && perl -0777 -pi -e 's/\*\*thirteen\*\*/**twelve**/' .sdlc/baseline.md
node .sdlc/checks/ceiling-counts-check.mjs; echo $?      # two FAIL lines, exit 1
```


# Pass 4 (delta 971d59b9..6d0755b9), verifier-l2 p4

kind: verdict
seat: verifier (independent, read-only), round 4
unit: U5 (records and release notes), plan `.sdlc/plans/preset-intent-fidelity.md`, ticket #681
graded at: `6d0755b9`
previous round: `971d59b9`, verdict 3 (`pif-u5-verify-verdict-3.md`), overall yellow with three
  provenance yellows: the `553.45 s` row named no tree, the `716.04 s` row cited an uncommitted
  path, and one committed log carried a home path
scope: delta-only re-verify of the eight rows the brief named, `971d59b9..6d0755b9`
host rule honored: no `--full` sweep, no `npm test`. Greps, git, and the one single-file node
  gate the brief names; a negative control for every row ran on a scratch copy outside the
  worktree
written: 2026-09-20

# Verdict pif-U5 pass 4 · 🟢 at 6d0755b9

All three pass-3 yellows are fixed and every mechanical row the brief names holds. The `553.45 s`
reading now names its tree in both directions (`21a0e35d`, `8918342c`), a third gate log is
committed and the previously-leaked home path is scrubbed to `0`, the new ceiling-counts gate is
wired into `.sdlc/adapter.md` §1 and reports the exact partition Lane A claims, and the delta stays
inside `.sdlc/` with clean branding, no added em dash, and no home path in the new records.

| # | Row | Expected | State | Evidence | Negative control |
|---|---|---|---|---|---|
| Y1 | The `553.45 s` row names its tree | Lane A says `21a0e35d` and `8918342c` | 🟢 | `.sdlc/baseline.md:94`, the same row, now carries `**Tree**, stated exactly rather than rounded to a convenient sha: it ran ... over this unit's WORKING tree, whose committed base was \`21a0e35d\` (HEAD from 16:31) and which was committed at 17:04 ... as \`8918342c\`.` Both shas are present verbatim, matched to the exact wording the brief quotes | Another reading in the same table, `592.17 s` at `.sdlc/baseline.md:87`, was grepped the same way (`grep -A2 "592.17" .sdlc/baseline.md \| grep -oE '[0-9a-f]{8}'`) and returns no sha at all, so the extraction is discriminating between a row that names a tree and one that does not, not matching on every row |
| Y2 | The `716.04 s` row's log is committed under `.sdlc/records/pif-u5-gate-logs/` | three logs now | 🟢 | `git ls-tree -r --name-only HEAD .sdlc/records/pif-u5-gate-logs/` lists three files: `gate-716s-review-27b26330.txt` (new this delta), `r13-326s-sync-tree-8f037dd2.txt`, `r13-553s-unit-branch.log`. The new log's own two lines are present: `LOAD-START: 15:34 ... load averages: 16.36 13.43 21.96` and `npm test > /tmp/r3test.log 2>&1  671.56s user 14.35s system 95% cpu 11:56.04 total`, which resolves to `716.04` | `git ls-tree -r --name-only 971d59b9 .sdlc/records/pif-u5-gate-logs/ \| wc -l` returns `2` at the prior head, so the count is a real property of this delta and not always three |
| Y3 | `grep -c /Users/` on the 553 log | `0` | 🟢 | `grep -c "/Users/" .sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log` → `0`. The delta's own diff shows the fix: a header note, `# altered: the generator printed one absolute path rooted in a home directory; the worktree prefix is replaced by <worktree> on that line. No other byte of this log is changed`, and the line itself now reads `wrote <worktree>/src/ui/categories/index.js  (8 categories · 343 palettes total)` in place of the literal `/Users/...` path | `git show 971d59b9:.sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log \| grep -c "/Users/"` → `1` at the prior head, so the same command is discriminating a real scrub, not reporting `0` on both sides |
| Y4 | `.sdlc/adapter.md` §1 carries a gate row invoking `node .sdlc/checks/ceiling-counts-check.mjs`; the check runs clean at this head | Lane A reports `19 = 2 graded + 14 explicit + 3 unsupportable`; confirm the partition matches the table; one mutation as control | 🟢 | `.sdlc/adapter.md:31` is the gate row, naming the exact command and `exit 0 and the last line reads \`ceiling-counts: clean\``. Running it at this head: `node .sdlc/checks/ceiling-counts-check.mjs` prints eleven `ok` lines, `partition: 19 = 2 graded + 14 explicit + 3 unsupportable`, `ceiling-counts: clean`, exit `0`, matching Lane A's figure element for element | Ran on a scratch copy at `/tmp/pif-u5-ctl/.sdlc/{baseline.md,adapter.md,checks/ceiling-counts-check.mjs}`, outside the worktree. Clean copy: exit `0`. Mutated `**fourteen**` → `**thirteen**` in the scratch `baseline.md`: exit `1`, with `FAIL  prose explicit count == measured  (prose 13, measured 14)` and `FAIL  prose partition parts sum to 'other N'  (13 + 3 vs 17)`, the same defect class row 7 of pass 3 was written to catch. The untouched scratch copy restores clean before and after |
| I1 | Adapter diff against `a9a36405` | exactly two hunks: the gate row and the budget note | 🟢 | `git diff a9a36405 6d0755b9 -- .sdlc/adapter.md \| grep -c "^@@"` → `2`. Read both hunks: the first adds the `ceiling-counts` gate row at line 31; the second rewrites the budget-note evidence clause from `a seven-reading series from 284 s to 780 s that is monotone in host load` to `a 19-reading series from 284 s to 1670.43 s`, no other line touched | The same diff one head earlier, `git diff a9a36405 971d59b9 -- .sdlc/adapter.md \| grep -c "^@@"` → `1` (the budget note alone, before the gate row existed), so the count is tracking a real second hunk added in this delta, not a fixed pattern |
| I2 | The frozen two-jobs line | now at line 193, content unchanged | 🟢 | `sed -n '193p' .sdlc/adapter.md` at `6d0755b9` reads `` (\`.sdlc/verdicts/<plan>-prepr.md\`) and green CI (\`build-test\` + \`panda-smoke\`), then the ``. `git show 971d59b9:.sdlc/adapter.md \| sed -n '192p'` reads byte-identical text. The line moved from 192 to 193 because this delta's gate row inserted one line above it in §1, and its content is untouched | `diff <(sed -n '193p' .sdlc/adapter.md) <(git show 971d59b9:.sdlc/adapter.md \| sed -n '192p')` prints nothing, confirming byte equality rather than two different lines that happen to both read plausibly; the line-number shift by exactly one matches the one line the gate row added above it |
| I3 | `git diff --name-only 8f037dd2 6d0755b9` | `.sdlc/` only | 🟢 | 18 paths listed, every one under `.sdlc/` (board, adapter, baseline, the new check, two handoffs, four plan/question/verdict files from the unrelated records-followup unit that landed on main in between, and the three gate logs). `grep -cv '^\.sdlc/'` → `0` | `git cat-file -t 8f037dd2` → `commit`, so the base object is real and the diff is answering about actual history, not a missing ref. The unfiltered list is `18` lines, so `grep -v` is removing zero real lines to reach `0`, not vacuously passing on an empty diff |
| I4 | Branding clean, no em dash added in the delta, no home path in the new records | clean, `0`, `0` | 🟢 | `node test/repo/branding.mjs` → `branding: clean (538 files scanned)`, exit `0`. `git diff 971d59b9 6d0755b9 \| grep "^+" \| grep -c ", "` → `0`. `git diff 971d59b9 6d0755b9 -- .sdlc/records/ \| grep "^+" \| grep -c "/Users/"` → `0`, and a direct scan of all three record files under `.sdlc/records/pif-u5-gate-logs/` independently gives `0` each | The em dash grep is live, not silently zero: `printf 'a line with an em dash, right here\n' \| grep -c ", "` → `1` in the same shell, so the pattern matches the character when present. The `/Users/` grep is likewise live: Y3's own control above shows the identical pattern returning `1` against the prior head's copy of one of these same files |

## Overall

🟢. Every row the brief named is green. All three pass-3 yellows (the untraceable `553.45 s` tree,
the uncommitted `716.04 s` citation, and the leaked home path) are resolved in this delta, and the
new `ceiling-counts` gate is wired into `.sdlc/adapter.md` §1 exactly as Lane A describes, with a
working negative control. The unit is 🟢.

## What this verdict does not claim

- No timed run, no `npm test`, no `--full` sweep was taken. The host rule forbade it and nothing
  graded here needed one.
- Rows outside the eight the brief named (the earlier passes' rows 1 to 25) are carried by
  reference from pass 3 and were not re-graded here.
- The `716.04 s` reading's own figures were checked for internal consistency against its own log
  only, not independently reproduced.

## Reproducing

From a scratch worktree at `6d0755b9`, no build needed:

```
grep -A2 "553.45" .sdlc/baseline.md | grep -oE '21a0e35d|8918342c'   # both present
git ls-tree -r --name-only HEAD .sdlc/records/pif-u5-gate-logs/     # three logs
grep -c "/Users/" .sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log   # 0
node .sdlc/checks/ceiling-counts-check.mjs; echo $?                 # partition 19=2+14+3, exit 0
git diff a9a36405 6d0755b9 -- .sdlc/adapter.md | grep -c "^@@"       # 2
sed -n '193p' .sdlc/adapter.md                                       # frozen two-jobs line
git diff --name-only 8f037dd2 6d0755b9 | grep -cv '^\.sdlc/'         # 0
node test/repo/branding.mjs | tail -1                                 # branding: clean
```
