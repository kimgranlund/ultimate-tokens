# Verdict pif-u7 · #681 preset-intent-fidelity, the pre-land fix unit

Verifier, grade l3. Graded `unit/pif-u7 @ 43033841` (frozen), UB `de1bafef`, on 2026-09-21.
Criteria U7-P1 to U7-P5 and U7-1 to U7-14 from the plan's U7 section, U7-P4 as amended at
revision 32 (`git show 5951b160:.sdlc/plans/preset-intent-fidelity.md`).

Every row below is my own run. The builder's handoff (`.sdlc/handoffs/pif-u7.md`) and the two
reviewer passes were read for orientation and are cited nowhere as evidence. Every mutation ran in
a throwaway clone (`$F/neg`, `git clone -q --shared`, reset with `git checkout .` after each step,
0 dirty lines confirmed each time); the UB controls ran in a second clone checked out at
`de1bafef`. The worktree was never written to (`git status --short` empty before and after).
Host rule kept: the guard `pgrep -f 'node .*test/(run|engine|ui)' | wc -l` read 0 before every
test process; my runner refuses to start otherwise. Load sat between 3.0 and 6.5 on 10 cores
for every run below; no timing here enters `.sdlc/baseline.md`.

## Verdict

🟢 **U7 is green.** 19 of 19 criteria 🟢, 0 🟡, 0 🔴; the two extra gates and the skew probe all bite.
verdict: 🟢

## Per-criterion

| # | command (mine) | Evidence (actual output) | state | negative control (mine, in the clone) |
|---|---|---|---|---|
| U7-P1 | fresh `npm test` at `43033841` in the clone, guard 0 before; `perl` count over `test/run.mjs`; `git status --short \| wc -l` after | `✓ all 49 test files passed`, exit 0, 49 `pass` lines and 0 `fail` lines in the runner output; perl count `49`; `git status --short \| wc -l` after the run `0` (`npm test` rewrote nothing at this head); `319.59s user 3.83s system 104% cpu 5:09.34 total`; guard 0 at start 07:41:27, load inside the run at t+5s `2.64 3.79 4.29`, after `4.42 4.02 4.21`. Recorded for the ceiling series only, not added to `.sdlc/baseline.md` | 🟢 | `docs/reference/data/role-table.json:84` primary `light` `550` to `500`, `node test/engine/semantic.mjs`: `FAIL  refs-canonical  primary =  550/450 != canonical  500/450`, `FAIL: 1 gate failure(s)`, exit 1 (the file `npm test` runs for that table, run singly) |
| U7-P2 | `node test/repo/branding.mjs \| tail -1; echo exit` | `branding: clean (553 files scanned)`, exit 0 | 🟢 | a one-line file carrying the retired maker brand's uppercase run written to `.sdlc/verdicts/zz-probe.md`: `✗ .sdlc/verdicts/zz-probe.md: contains "[maker-brand]"`, `FAIL: 1 branding violation(s) across 554 files`, exit 1 |
| U7-P3 | the row's `git diff de1bafef` + `perl -CSD` predicate | `0` | 🟢 | `printf '+ a \xe2\x80\x94 b\n'` through the same predicate prints `1` with `-CSD` and `0` without, so the flagged form bites and the flagless form is vacuous, as the row says |
| U7-P4 | `git diff --name-only de1bafef 43033841` (19 paths); `diff` of that sorted list against the handoff §8d table's path column | the two lists are identical: 12 declared, 2 generated (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, generator named), 5 repaired (`.sdlc/baseline.md`, `test/ui/shell.mjs`, `test/ui/poster-strip.mjs`, `component-inventory.md`, `02-sections-and-resolvers.md`), each with a cause | 🟢 | UB controls reproduced in the `de1bafef` clone: (1) `sh .sdlc/checks/baseline-agrees-check.sh`: `ok ui.html: baseline 4111.1 KB, tree 4111.1 KB`, `stale total: 0`, exit 0; (2) `npm run gen:mcp-assets` exit 0, `git status --short` 0 lines, so `describe-mcp-assets.js` was not pre-existing drift. Row control: an unnamed path would appear in the diff list and not in the table; the `diff` I ran is that comparison and it is empty today |
| U7-P5 | `sh .sdlc/checks/baseline-agrees-check.sh \| tail -1; node .sdlc/checks/ceiling-counts-check.mjs \| tail -1` | `stale total: 0` (exit 0, 9 ok lines plus the expected `note head:` line) and `ceiling-counts: clean` (exit 0) | 🟢 | `ref: origin/main @ 20298cc` changed to `@ 43033841` (the unit head, not in `origin/main`): `STALE head: baseline ref 43033841 is in origin/main's history`, `stale total: 1`, exit 1 |
| U7-1 | `node test/engine/prime.mjs 2>&1 \| grep -i symmetry` | sweep line unchanged `by-construction fails 0, measured exceed-3L* 0/464`; corpus line `3380 palettes, by-construction exceptions 26 (max \|up-down\| 54.3116 L*)`; `pass  symmetry corpus by-construction: 26 of 3380 (expected 26)`; 26 `c` names printed; worst three Suspiria tertiary-muted `#201F25` 54.31, Black metal secondary `#1E2024` 54.10, Night of the Hunter tertiary `#1E211E` 53.83; exit 0, 58 s wall | 🟢 | my own swap (prime-A): Nike secondary `#101820` replaced in `SYM_BY_CONSTRUCTION_ALLOW` alone by `brands "Verifier Fabricated Brand" secondary #101821`, same count 26. Output names both sides: `MISSING ... Verifier Fabricated Brand secondary #101821` and `UNEXPECTED ... Nike ... secondary #101820`, then `FAIL symmetry corpus by-construction set == ORDER_ALLOW: 26 vs 26` with `ORDER_ALLOW side moved: Nike ...` and `this file's side moved: Verifier Fabricated Brand ...`; exit 1 |
| U7-2 | same run | `measured exceed-3L* 22 (max 54.2383 L*)`, `pass  symmetry corpus measured-pixel: 22 of 3380 (expected 22)`, 22 `m` names printed | 🟢 | (a) the gate's own fixture leg in my head run: `negative control (frozen pre-#681 fixture, anchored corpus): measured exceed-3L* 1816/3380, max 52.4868 L*`; (b) my own swap (prime-C): Nike secondary replaced in `SYM_MEASURED_ALLOW` alone, same count: `MISSING ... Verifier Fabricated Brand ...` and `UNEXPECTED ... Nike ...`, `FAIL symmetry corpus measured-pixel allow-list: expected member missing`, exit 1 |
| U7-3 | same run, `grep -ci order_allow` | `1` (the cross-check line): `pass  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): 26 vs 26`; the gate comment (prime.mjs:983-996) names the widening search, `ORDER_ALLOW`'s 21 + 5 split and Q3 (b) | 🟢 | one-sided move (prime-B): a 27th name `zzz "Verifier Invented Preset" primary #000003` added to `ORDER_ALLOW` in `test/engine/anchor.mjs` alone: `FAIL ... ORDER_ALLOW: 26 vs 27`, `ORDER_ALLOW side moved: zzz "Verifier Invented Preset" ...`, exit 1. The other side is prime-A above (`this file's side moved`) |
| U7-4 | same run, `grep -i span` | `pass  ladder-span under 30 L*: 364 of 3380 ... from emitted pixels (expected 364), 363 read off the constructed rungs (expected 363), 0 of 16 default-kit families (expected 0); tolerance 0 on all three`; fixture leg `pixel span under 30 L* 0` | 🟢 | `SPAN_L_FLOOR` 30 to 40 (prime-C): `FAIL ladder-span under 40 L*: 621 of 3380 ... (expected 364), 623 ... (expected 363)`, `FAIL ladder-span pixel span under 40 L*: 621 != expected 364`, exit 1; the pre-#681 fixture reads 0 in the head run, so the report is not constant |
| U7-5 | `awk '/^- C11 /,/^- C12 /' .sdlc/plans/preset-intent-fidelity.md \| grep -c 364` | `1`; read: the bullet names 364 as "the gate's OWN measurement at U7's head", keeps 373 ± 5 labelled "the PROTOTYPE simulation's count", cites "Q3 (b)'s ruled near-black class" | 🟢 | the same awk-and-grep at `0391f045` prints `0` |
| U7-6 | `grep -c '#725'` and `'#701'` over the two files; `gh issue view 725` | `#725`: CHANGELOG 2, decision-records 2; `#701`: CHANGELOG 3, decision-records 2; issue `OPEN`, "Chroma envelope misses its muted targets in perceptual and peak mode, and nothing gates the direction", `kind:bug,size:big` | 🟢 | `#725` at `0391f045` and at `origin/main` prints `0` in both files (four readings, all 0) |
| U7-7 | `awk '/^- C6 /,/^- C7 /' ... \| grep -c '#725'` | `1`; the sentence cites `.sdlc/questions/preset-intent-fidelity-preland.md`, quotes ruling Q2, says #725 owns the perceptual and peak miss while C6 stays open | 🟢 | the same at `0391f045` prints `0` |
| U7-8 | `node test/engine/anchor.mjs 2>&1 \| grep -i key-anchor` | `pass  key-anchor corpus: 3380 of 3380 ... equals the stored anchor, 3380 of 3380 where it equals primeSwatches(...)[3].hex, 0/0 off`; `pass  key-anchor rendered path: 46 of 46 ... 4 subjects (the 16 default-kit families plus 3 named corpus presets), 0 off`; exit 0, 80 s wall. Independence checked: `src/engine/prime.mjs` imports only `hct.js`, `okhsl.js`, `tonal.js` (never `model.mjs`), and `deriveKeyColor`'s body has 0 `primeSwatches` calls, so the second producer does not route through the mutated code | 🟢 | anchored branch disabled in `deriveKeyColor` (`if (false)`, cusp search restored): `FAIL key-anchor corpus: 0 of 3380 ... 3380/3380 off; worst travel "42° N · July · 06:00 · Hidaka coast ..." tertiary-muted, key #F7F4E5 against anchor #252215, 82.9 L* apart`, `FAIL key-anchor rendered path: 0 of 46 ... 46 off`, exit 1. Same mutation, `node test/ui/shell.mjs`: `FAIL model an ANCHORED palette's identity swatch moved on a raw hue edit: #D12AF7 != anchor #0C5DCC`, exit 1 |
| U7-9 | a node one-liner over `brandKit(defaultDocument())` and `handle(tools/call list_palettes, buildSurface(kit))` from `mcp/brand-kit-core.mjs` | `brandKit: 16 of 16 anchored default-kit palettes key == anchor`; `mcp list_palettes: 16 of 16 key == anchor` | 🟢 | the row's control is the pre-fix head; U7-8's `if (false)` mutation is that state and reads 0 of 16 default-kit keys equal on the rendered leg (`key-anchor rendered path: 0 of 46`), so the surfaces fed by that key cannot read 16 of 16 there |
| U7-10 | `node test/ui/headless-boot.mjs 2>&1 \| tail -3` | `HEADLESS BOOT PASS`, 0 `✗` lines, exit 0, 54 s wall; the `(sfk)` group at headless-boot.mjs:3985-4030 asserts anchor gone, `sourceAnchor` kept, the three `preDetach*` stamps, and Reset restoring the 19 + 7 capture | 🟢 | `seedFromKey` reverted to `this.commit((d) => { d.palettes[i].hue = s.hue; d.palettes[i].chroma = s.chroma; })`: exit 1, 5 distinct `(sfk)` assertions red (`sfk1`, `sfk3`, `sfk3b`, `sfk4`, `sfk4c`; `sfk3` reads `got hue=undefined/chroma=undefined/lift=undefined, want 263/54/-12`), 0 non-`(sfk)` `✗` lines, so `(rst)` stays green |
| U7-11 | `node .sdlc/checks/ceiling-counts-check.mjs; echo exit` | 12 `ok` lines, `partition: 19 = 2 graded + 14 explicit + 3 unsupportable`, `ceiling-counts: clean`, exit 0; the two named tautologies survive only as a comment on line 69 (`grep -c` of the assertion strings in code: 0 executable hits) | 🟢 | three `.sdlc/baseline.md` edits, one per run: (1) rewritten assertion, line 100 `592.17` to `592.18` inside the above-list parens: `FAIL prose above LIST == measured above walls (prose [553.45, 592.18, ...] vs measured [553.45, 592.17, ...])`, exit 1; (2) `**Two** of the readings are graded` to `**Three**`: `FAIL prose graded count == measured graded (prose Three (3), measured 2)`, exit 1; (3) `Of the other 17:` to `16:`: `FAIL prose 'other N' == total - graded (prose 16, measured 17)` and `FAIL prose partition parts sum to 'other N' (14 + 3 vs 16)`, exit 1 |
| U7-12 | the row's two greps | `` CURRENT_SCHEMA_VERSION` is 6 `` and `CURRENT_SCHEMA_VERSION = 6` | 🟢 | `src/ui/persist.js` bumped to 7 in the clone: the document still reads `is 6`, the code reads `= 7`, the two readings split |
| U7-13 | `npm run gen:preview >/dev/null; git status --short` in the head clone | `exit 0`, `0` lines | 🟢 | the same in the `de1bafef` clone: ` M docs/img/palette-preview.svg`, `git diff --numstat` `283 283` |
| U7-14 | `grep -c identity-control scripts/report-preset-fidelity.mjs; grep -c "pending U4" test/engine/semantic.mjs` | `0` then `38`; handoff §8 states both, names K2 and K3 as close-out candidates and K1, K4, K5 as carried | 🟢 | either reading moving reds the row; both match the planner's `0391f045` readings, so nothing shipped against the K items |

## Extra gates (not numbered rows)

| gate | command | Evidence (actual) | state | control |
|---|---|---|---|---|
| skew probe, `test/ui/shell.mjs:80-85` (pass-1 F1) | `node test/ui/shell.mjs` at head | `PASS: ui-app pure core + shell clear the checkable predicates`, exit 0 | 🟢 bites | the `skewOnly.palettes[1].skew = ...` line replaced with a comment: `FAIL model editing skew on a still-anchored palette did not change the projected ramp (stale/stored derived state?): ramp[12] #174488 both before and after`, `FAIL: 1 gate failure(s)`, exit 1 |
| set-difference assertion, `test/engine/prime.mjs:1124-1125` | head run: no FAIL, the four names present in `SYM_DIFF_EXPECTED` | `pass` at head, exit `0` | 🟢 bites | one hex digit changed, `#241E1A` to `#241E1B` (prime-B): `FAIL symmetry by-construction minus measured is not the four named palettes: got [film "Apocalypse Now ..." primary #241E1A \| music "The rave ..." secondary #212228 \| travel "37° N ... Patmos ..." tertiary-muted #232220 \| travel "42° N ... Hidaka coast ..." tertiary-muted #252215]`, exit 1, all four named |
| U7-P1's own control | above, in the U7-P1 row | `refs-canonical` FAIL naming `primary 550/450 != canonical 500/450` | 🟢 bites | first attempt with `"PEAK": 500` to `501` did NOT red `semantic.mjs` (exit 0): that constant is not one the gate compares. Recorded so the control is not mistaken for a free pass; the value that bites is a role-table row |

## What this verdict does not claim

- No `npm run build`, no `npm run smoke`. The unit's declared scope touches no build-chain file.
- No timing here is a baseline figure. Load sat between 3.0 and 6.5 for every run; `npm test`'s
  wall is recorded in the U7-P1 row for the ceiling series only, and I did not add it to
  `.sdlc/baseline.md`.
- U7-9's "pre-fix head reads 0 of 16" is derived from the U7-8 mutation's rendered-path reading,
  not from re-running the U7-9 one-liner against the mutated model. The one-liner's own inputs are
  `projectView` outputs, which that leg measures.
- `.sdlc/adapter.md`'s §7 block and its "CI on a PR" row were not read for staleness and are not
  reported on.
- The poster-strip blast radius (handoff §5) and the New-Palette consumer row (§8e F2) are plan
  rows the owner still has to rule on; nothing in U7's criteria grades them and this verdict does
  not either.
- `test/engine/prime.mjs` reads `ORDER_ALLOW` out of `anchor.mjs`'s source text (handoff §10). The
  cross-check reds loudly if the literal moves (prime.mjs:1135); I did not exercise that branch.

## Reproducing

```sh
F=<your scratch dir>/u7v; mkdir -p "$F"
W=/Users/kimba/Projects/nonoun/ultimate-tokens/.git-worktrees/pif-u7
git clone -q --shared "$W" "$F/neg"; git clone -q --shared "$W" "$F/ub"; git -C "$F/ub" checkout -q de1bafef
cd "$F/neg"   # 43033841
pgrep -f 'node .*test/(run|engine|ui)' | wc -l        # must print 0 before each test process

# static rows
git diff --name-only de1bafef 43033841 | sort > /tmp/paths; diff /tmp/paths <(grep -E '^\| `[^`]+` \| (declared|generated|red-in)' .sdlc/handoffs/pif-u7.md | sed -E 's/^\| `([^`]+)`.*/\1/' | sort)
awk '/^- C11 /,/^- C12 /' .sdlc/plans/preset-intent-fidelity.md | grep -c 364
grep -c '#725' docs/reference/references/decision-records.md docs/reference/CHANGELOG.md
sh .sdlc/checks/baseline-agrees-check.sh | tail -1; node .sdlc/checks/ceiling-counts-check.mjs | grep -c '^ok'

# head runs
node test/engine/prime.mjs 2>&1 | grep -i 'symmetry\|span' | grep -v '^    [cm] '
node test/engine/anchor.mjs 2>&1 | grep -i key-anchor
node test/ui/headless-boot.mjs 2>&1 | tail -1; node test/ui/shell.mjs | tail -1

# controls (reset with `git checkout .` between each)
perl -0pi -e 's/(SYM_BY_CONSTRUCTION_ALLOW = \[\n\s*)`brands "Nike · The Swoosh · Since 1971" secondary #101820`/${1}`brands "Verifier Fabricated Brand" secondary #101821`/' test/engine/prime.mjs; node test/engine/prime.mjs 2>&1 | grep -i 'MISSING\|UNEXPECTED\|side moved'
perl -0pi -e 's/(const ORDER_ALLOW = \[\n)/${1}  `zzz "Verifier Invented Preset" primary #000003`,\n/' test/engine/anchor.mjs; perl -pi -e 's/#241E1A`, `music "The rave/#241E1B`, `music "The rave/ if /SYM_DIFF_EXPECTED = /' test/engine/prime.mjs; node test/engine/prime.mjs 2>&1 | grep 'FAIL'
perl -pi -e 's/const SPAN_L_FLOOR = 30;/const SPAN_L_FLOOR = 40;/' test/engine/prime.mjs; node test/engine/prime.mjs 2>&1 | grep 'ladder-span under'
perl -pi -e 's/if \(typeof p\?\.anchor === "string" && ANCHOR_HEX\.test\(p\.anchor\)\) \{/if (false) {/' src/ui/model.mjs; node test/engine/anchor.mjs 2>&1 | grep key-anchor; node test/ui/shell.mjs | grep FAIL
perl -0pi -e 's/this\.commit\(\(d\) => \{\n\s*this\.detachSnapshot\(d, i, p\);\n\s*d\.palettes\[i\]\.hue = s\.hue;\n\s*d\.palettes\[i\]\.chroma = s\.chroma;\n\s*if \(d\.palettes\[i\]\.anchor\) delete d\.palettes\[i\]\.anchor;\n\s*\}\);/this.commit((d) => { d.palettes[i].hue = s.hue; d.palettes[i].chroma = s.chroma; });/' src/ui/sections/color.js; node test/ui/headless-boot.mjs 2>&1 | grep '✗'
perl -pi -e 's/^skewOnly\.palettes\[1\]\.skew = .*$/\/\/ probe/' test/ui/shell.mjs; node test/ui/shell.mjs | grep FAIL
sed -i '' '84s/"550"/"500"/' docs/reference/data/role-table.json; node test/engine/semantic.mjs | grep FAIL
perl -pi -e 's/592\.17/592.18/ if $. == 100' .sdlc/baseline.md; node .sdlc/checks/ceiling-counts-check.mjs | grep FAIL
perl -pi -e 's/^(ref: .*@ )20298cc/${1}43033841/' .sdlc/baseline.md; sh .sdlc/checks/baseline-agrees-check.sh | grep STALE

# UB controls
cd "$F/ub"; sh .sdlc/checks/baseline-agrees-check.sh | grep 'ui.html\|stale total'; npm run gen:mcp-assets >/dev/null; git status --short | wc -l; npm run gen:preview >/dev/null; git diff --numstat
```
