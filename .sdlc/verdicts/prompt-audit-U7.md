---
kind: verdict
plan: prompt-audit
unit: U7
ticket: "#758"
branch: unit/pa-U7
base: 13346c1a
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict prompt-audit U7 · 🔴 · every plan row and every rewritten skill claim holds, but the handoff labels its Low rows wrongly and calls an applied row out of scope

verdict: 🔴
sha: 8e8aa3ada809df18a74151775703e6659d20ef26

Head `8e8aa3ad`; code commits `7e33c4c4` and `cc924fac`. Unit base plan/prompt-audit `f6cd69cb`; B `13346c1a` (`git merge-base origin/main HEAD`); the eleven U7 files are byte-identical at B and `f6cd69cb`. Criteria from `bee7574d:.sdlc/plans/prompt-audit.md` (revision 7). The evidence run was verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp. `verdict.py check` passes on the handoff, review r2 and the plan, `exit 0` each.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U7-1 | 🟢 | `0, 1, 1, 1, 0, 1, 1, 1` | at B: `3, 0, 0, 0, 1` |
| U7-2 | 🟢 | `1, 1, 1, 1, 0, 2, absent` | at B: `3, 0, 0, 0, 5, 0` |
| U7-3 | 🟢 | `0, 6, SKILL.md:1 foundations.md:1, SKILL.md:0 best-practices.md:0, 1, 1` | at B: `1, 5, 0 and 0, 1 and 1` |
| U7-4 | 🟢 | `0`, `1 1 1 1`, `4`, `0` | at B: `1`, `0 0 0 0`, `4`, `6` |
| U7-5 | 🟢 | `0, 0, 1, 1, 6` | at B: `2, 19` |
| U7-6 | 🟢 | `0, 1, 15` | at B: `4` |
| No line pins | 🟢 | the `:NNN` and `#L` grep over the eleven files prints nothing | at B it prints `8` lines (`model.mjs:39` x3, `app.js:6565` x2, ...) |
| Symbol homes | 🟢 | `15` citations found, each file carrying a definition of its symbol (`ensureTypeFonts` in `app-helpers.mjs`) | at B the scanner prints `NODEF ensureTypeFonts src/ui/app.js`, where `grep -c` finds `2` text matches (import and call) |
| P1 | 🟢 | fresh clone at the head: `✓ all 53 test files passed`, `exit 0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | scrim sed on `role-table.json`: `✗ 1/53 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (810 files scanned)`, `em-dash: clean (818 files scanned)`, `exit 0`; added-line U+2014 `0` | a decision-records copy: `FAIL: 3 branding violation(s)`, `exit 1`; a glyph line in `type-scale/SKILL.md`: `FAIL: 1 em dashes`, `exit 1` |
| P4 | 🟢 | filter from B `0`; forbidden paths `0`; architecture non-DD lines `0`; the unit diff is the eleven files plus three U7 records | the six-name fixture prints `3`; two out-of-wall siblings print `2` |
| P5 | 🟢 | SC1 to SC27 each `1`; the ERE fate count `27` | the `SC14` row cut: `0` and `26` |
| P6 | 🟢 | U7 share: added `0`, removed `14` | `+the rule (TKT-0010)` prints `1` |
| Handoff Low labels | 🔴 | `prompt-audit-evidence.md`'s slice C table runs from line `536` (SC1) to `569` (SC34), numbered in table order (its header, and the handoff's own line 38). The `vmsyntax` row is line `566`, SC31; the figma references row is line `567`, SC32. The handoff says `SC32 (the vmsyntax incident date)` at `:70`, `PR archaeology \| Low, SC31` at `:77`, and `SC30, SC31, SC34 \| Low, not in scope` at `:78` | SC31 was applied: `grep -c 'real incident 2026-06-17'` on the figma SKILL.md prints `1` at `f6cd69cb` and `0` at the head, so `:78` is false as well as mislabelled |

### Findings

- 🔴 F1, handoff: the two Low labels are swapped (`vmsyntax` is SC31, the figma references row SC32), and `:78` lists SC31 as not in scope although U7 applied it. Review r1 used the same wrong `SC32` label and r2 accepted it. The skill files are right; only the record is false. Fix: swap the two labels and take SC31 out of the Left-out row.
- 🟡 F2, `maintaining-brand-kit-mcp/references/foundations.md`: U7 deleted the one sentence correcting `typed`, and the shape block above it still says `typed:true` and `categories: {7 voices}`. `brandKit(defaultDocument())` has no `typed` key and `15` categories. The shape lines predate U7; the deletion leaves them uncorrected.
- 🟡 F3, `maintaining-figma-plugins/SKILL.md` on a touched line: the `priorLibraryUpliftVM` fallback runs only on an empty report (`code.js` 1101 and 1107); the line states it without that condition. Predates U7.
- 🟡 F4, same file, touched line: `Body*/Label*/Tiny*/Lead` omits `UI-control` and `UI-widget`, which `BODY_CLASS_VOICES` (`type.mjs` 420) holds. Predates U7.
- 🟡 F5, `project-docs`: the Now / Next / Later row points at `.sdlc/roadmap.md`, a generated open-issue snapshot with no horizons.
- 🟡 F6, handoff: the questions paragraph went stale when revision 7 relabelled SC6 to SC10.

## Pass 2 · 🟡 · every row and every pass 1 finding holds at 9a14a135; U7-7 cannot see swaps among rows whose spans are common file names

verdict: 🟡
sha: 9a14a1351973e8a5b90a6e55c0b937b6b989f297

Head `9a14a135`; pass 2 code commits `8a230803` and `794f7342`, handoff commits `02436f60`, `c547d584`, `d3acaec7`, `e9ba254f`. Unit base (after the plan merge `405f5d89`) `e0ec78ad`; B `13346c1a`. Criteria U7-1 to U7-12 from `e50b99b3:.sdlc/plans/prompt-audit.md` (revision 8) and `prompt-audit-U7-rediagnosis.md`. Evidence run verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp; the seat re-read the SC31 and SC32 fates itself. `verdict.py check` exits `0` on the handoff (against its `8e8aa3ad` copy), review p2 r2, the plan (against `bee7574d`) and the re-diagnosis.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U7-1 | 🟢 | `0`, `1`, `1`, `1`, `0`, `1`, `1`, `1` | at B: `3`, `0`, `0`, `0`, `1` |
| U7-2 | 🟢 | `1`, `1`, `1`, `1`, `0`, `2`, `absent` | at B: `3`, `0`, `0`, `0`, `5`, `0` |
| U7-3 | 🟢 | `0`, `6`, `SKILL.md:1 foundations.md:1`, `SKILL.md:0 best-practices.md:0`, `1`, `1` | at B: `1`, `5`, `:0 :0`, `:1 :1` |
| U7-4 | 🟢 | `0`, `1 1 1 1`, `4`, `0` | at B: `1`, `0 0 0 0`, `4`, `6` |
| U7-5 | 🟢 | `0`, `0`, `1`, `1`, `6` | at B: `2`, `19` |
| U7-6 | 🟢 | `0`, `1`, `15` | at B: `4` |
| U7-7 | 🟡 | `1`, `1`, then nothing; a hand count of all 34 ids against evidence lines 536 to 569 agrees (566 `vmsyntax` is SC31 `applied, Low`, 567 the figma references trail is SC32 `left out, Low`) | the SC31/SC32 swap prints both `NOMATCH` lines, as does every adjacent swap (33 fixtures); the `8e8aa3ad` handoff prints 10 `NOMATCH` and 7 `MISSING`. Swapping SC3 with SC7 or SC24 prints nothing (F1) |
| U7-8 | 🟢 | `0 0 1 0 6 0 1`, then `1` seven times, then `0`; `real incident 2026-06-17` under `.claude/skills` at head `0` files | SC31 moved to `left out, Low` in a copy: applied grep `0`; the `8e8aa3ad` last leg `1`; `build · test` `1` at B |
| U7-9 | 🟢 | `0`, `0`, `1`, `15 false`; a live `brandKit(defaultDocument())` dump matches the shape block key by key (top level, palette `group`/`prime`, `singleLineHeight` on Kicker, UI-control, UI-widget only, geometry with no `typed`) | ` typed:true` appended to the block prints `1`; `8e8aa3ad` prints `2`, `1` |
| U7-10 | 🟢 | `1`, `2`, `0`, `1`, `1`; the fallback sits under `if (report.aliases.length \|\| report.deprecates.length) ... else useLibrary = priorLibraryUpliftVM(...)`, two sites; `export const BODY_CLASS_VOICES` in `type.mjs` holds UI-control and UI-widget | the plan's `sed` on a copy: third `1`, fourth `0`; `8e8aa3ad` first leg `0` |
| U7-11 | 🟡 | `1`, `1`, `1`, `1`; `.sdlc/roadmap.md` is `status: generated` by `.sdlc/scripts/roadmap-gen.mjs` | the row rewritten to `docs/roadmap/` not present yet: `0`, `2`; at B `0`, `3`, `0`, `1` |
| U7-12 | 🟢 | `0`, `1` against `origin/plan/prompt-audit` `e50b99b3` | the `8e8aa3ad` handoff first leg `1`; `bee7574d~1` second leg `0` |
| Re-verification SC1 to SC28 | 🟢 | definition greps for `brandKit`, `geometryScale`, `typeScaleFor`, `geomScaleFor`, `downloadBrandKitMcp() {`, `export function ensureTypeFonts` each `1`; all 15 symbol-home citations resolve; `pal.length === 16`; ci.yml PR jobs `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`; `make11` in `src test` `0` files | U7-1 to U7-6 at B |
| Line pins | 🟢 | the `path:NNN` and `lines? NNN` greps over the eleven files print nothing | a fixture `src/ui/model.mjs:689` prints `1` |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 53 test files passed`, `exit 0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | scrim sed: `✗ 1/53 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (813 files scanned)`, `em-dash: clean (821 files scanned)`, added U+2014 `0` | a copied ADR: `FAIL: 3 branding violation(s) across 814 files`, `exit 1`; a dashed line: `FAIL: 1 em dashes`, `exit 1` |
| P4 | 🟢 | `0`, `0`, `0`; the eleven skill files plus U7 records | six-name fixture prints `3` |
| P5 | 🟢 | SC1 to SC27 each `1`; ERE count `27` | SC14 row cut: `0` and `26` |
| P6 | 🟢 | U7 share against B: added `0`, removed `14` | `+the rule (TKT-0010)` prints `1` |
| P2 build | owed at pre-land | U7 touches no build input | not run |

Pass 1 fates: F1 fixed (SC31 applied, SC32 left out, by hand count; `SC31.*not in scope` `0`); F2 fixed (`typed` `0`, `15 voices` `1`, live dump agrees); F3 fixed and true; F4 fixed and true; F5 fixed, imprecise (F3 below); F6 fixed.

### Findings

1. 🟡 F1 (plan defect). U7-7 checks that each SC row quotes a span from its own evidence line, but the spans for SC3, SC7 and SC24 (and less so SC1, SC8, SC18, SC20, SC25) are common file names that match several slice-C lines, so swapping SC3 with SC7 or SC24 passes. The labels are right today by hand count. For the planner: require a match on exactly one evidence line, or give those rows a span unique to their line.
2. 🟡 F2. The handoff's U7-12 row describes the plan at `c0e7c07b` and a `grep -c` command that `7189bb10` replaced with the awk form, and says `grep` is ugrep 7.8.4 on this host; the evidence run's `/usr/bin/grep` is BSD grep 2.6.0 (the seats' shells differ). The figures `0`, `1` reproduce.
3. 🟡 F3. project-docs calls `.sdlc/roadmap.md` a generated open-issue snapshot; the file also snapshots open PRs, plans, worktrees and landed commits. Narrower than the file, not false.
4. Note (plan). P5's bare-pipe control exits `2` under BSD grep instead of printing a line count; U7-12's note says a bare `SC6 (make11)` prints `2`, it prints `3` at `e50b99b3`.

Cleared to merge; the three 🟡 are for the next plan revision or the U7 records, none blocks.
