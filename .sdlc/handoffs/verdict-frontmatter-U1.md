# Handoff verdict-frontmatter U1 · builder → reviewer

Branch unit/vf-U1 @ 9bca8041, off plan/verdict-frontmatter (b2947fa0), pin f685529f confirmed an ancestor.

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| U1-0 | `git merge-base --is-ancestor f685529f HEAD; echo $?` | `0` | ancestry is the assertion itself: at a tip where the pin is not an ancestor the plan's own measured run printed `1` (revision 2 tip 3b1d48b0), which is why revision 3 merged `origin/main` into the branch | 🟢 |
| U1-1 | `sh .sdlc/checks/verdict-frontmatter-check.sh` tail + exit, then the same with the list path swapped for an empty `mktemp` file | `verdicts 68 graded 21 grandfathered 47 bad 0` `exit 0`, then `verdicts 68 graded 68 grandfathered 0 bad 47` `exit 1` | the second run is control F (empty list): it reds on its own, proving a mistyped list path cannot silently pass; the live list is never moved to produce it | 🟢 |
| U1-2 | measured controls A, C, D, D2, E run verbatim against `.sdlc/checks/verdict-frontmatter-check.sh` in a `git clone -q --shared` scratch copy of the unit head | A `MISSING zz-control-U1.md: no verdict: line`; C `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴`; D (🟢 head, prose last line under `## Pass 2`) same VALUE message, proving the LAST line is read; D2 (🔴 head, 🟢 last line) `bad 0` exit 0; E (`rm survey.md`) `STALE survey.md: grandfathered but absent` | control B (the well-formed file: `printf '# Verdict x-U1 · 🟢\nverdict: 🟢\nsha: abc\n\nbody\n'`) prints `bad 0` exit 0 in the same run, so the reds above are the plant's and not the harness's; a script that read the FIRST `verdict:` line instead would print `bad 0` on D and miss the VALUE red, which is the revision-1 defect this control rules out | 🟢 |
| U1-3 | `grep -v '^#' .sdlc/checks/verdict-frontmatter-grandfather.txt \| shasum -a 256`; `head -1 \| cut -c1-1`; `grep -c f685529f` | `29d0eff2c1bccbc1b0dc033a9aba84ca99338869d5c4ef39658be557fc62e3c7`, `#`, `1` | the revision-1 list (46 names, before the recheck added `records-followup-roadmap-authz.md`) hashes `d8b7a8ff...`, a different value, so a stale or hand-typed list is caught by the hash alone | 🟢 |
| U1-4 | substituted-list fixture with a `# x` comment line and an absent `zz-absent.md` name, run against the committed script | `grep -c 'STALE # x'` → `0`; `grep -c 'STALE zz-absent.md'` → `1` | a reader that does not skip `#` lines would print `1` on the first; a script whose list path is not the literal string the `sed` substitutes (built from `$0`, say) would print `0`, `0`, the vacuous case this control rules out | 🟢 |
| U1-5 | `git diff --name-only --diff-filter=MD $B -- .sdlc/verdicts \| wc -l`; per-added-file field check | `0`; no added verdict files this unit, so no per-file line prints | editing `.sdlc/verdicts/survey.md` to add the field would move the first figure to `1`: the backfill is U2's ticket, not this unit's, so the check that nothing moved is the control | 🟢 |
| U1-6 | `grep -c verdict-frontmatter-check.sh .sdlc/adapter.md`; `sed` §6 range `grep -c 'last occurrence'`; `sed` §2.1 range `grep -c verdict-frontmatter-check` | `2`, `1`, `1` | before this unit's edit the adapter had none of these strings: `0`, `0`, `0` (the pre-edit tree, confirmed by inspecting the diff this commit introduces) | 🟢 |
| U1-7 | `git diff --numstat $B -- .sdlc/adapter.md \| cut -f2` (the removed-lines column) | `0` | rewording an existing line such as item 1 in place would show as one removal and one addition, printing `1`; the diff for this unit touches no existing line, only insertions, which `--numstat` distinguishes from a same-line edit | 🟢 |
| U1-8 | `perl -CSD -ne 'print if /\x{2014}/' .sdlc/checks/verdict-frontmatter-check.sh \| wc -l` | `0` | a planted em dash in the header comment (run once by hand while drafting, then removed) printed `1` before the file was finalized | 🟢 |

Controls F and G from the plan's measured table (no list file: everything graded and the check reds on its own; the list-path substitution proving the live path is read and its `#` line skipped) both ran against the committed script in the same scratch clone and matched the plan's printed shapes exactly.

| Plan-level (informational, not this unit's own gate) | Command | Evidence |
|---|---|---|
| P1 | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all 48 test files passed`, `0` |
| P2 | `node test/repo/branding.mjs \| tail -1`; added-line em dash sweep against `$(git merge-base origin/main HEAD)` | `branding: clean (546 files scanned)`, `0` |
| P3 | scope-wall greps against `$(git merge-base origin/main HEAD)` | `0`, `0` |

P4 (re-derive against `origin/main` at pre-land, after `git fetch origin`) is the verifier's row, not run here.

| Field | Value |
|---|---|
| Files | `.sdlc/checks/verdict-frontmatter-check.sh` (new), `.sdlc/checks/verdict-frontmatter-grandfather.txt` (new, 47 names derived at f685529f), `.sdlc/adapter.md` (additive: one line inside §2.1 after item 1, one amendment paragraph under §6) |
| Ran | `npm test` (green, 48/48) · `node test/repo/branding.mjs` (clean) · every U1 row and its planted control above |
| Left out | U2 (backfill ticket), Q1 (`npm test` wiring): not this unit's scope |

## Rework (review round 2, builder pass 1), from review `.sdlc/verdicts/verdict-frontmatter-U1-review.md` (PASS with four findings, graded at 8742b0ee)

Merged `plan/verdict-frontmatter` into `unit/vf-U1` (revision 4 from the review, sha 0dab3839) at `1439d285`. The merge brings `.sdlc/verdicts/records-policy-U1.md` (carries `verdict: 🟢`) and the review's own `.sdlc/verdicts/verdict-frontmatter-U1-review.md` onto the branch, so the baseline the check reads moved: `verdicts 70 graded 23 grandfathered 47 bad 0` where it was `68 21 47 0` before. Every row below was rerun against that new baseline; none of the shapes changed, only the two totals that count all verdict files.

Per owner ruling R9, findings 1, 2 and 4 are fixed in this unit; finding 3 (the U+2028 line-splitting mismatch with `adapter.py`'s `splitlines`) is recorded only, per the review and the plan's revision-4 note.

| Finding | Fix |
|---|---|
| 1 (medium): a listed file is skipped without being read, so a backfill that adds the field but keeps the name on the list passes silently and leaves that file outside enforcement for good | Added the `CLEARED` rule: a listed name is still read; if its own last `verdict:` line is now valid, the check reds `CLEARED <name>: grandfathered but carries the field`. New row U1-9 |
| 2 (low): the adapter amendment said "every file added from here on"; the script actually grades every unlisted top-level `.md` under `.sdlc/verdicts/` (including the 21/23 pre-mandate passing files) and reds `STALE` on a deleted listed file, neither of which the amendment stated | Reworded the §6 amendment paragraph to state scope and all four prefixes (`MISSING`/`VALUE`/`STALE`/`CLEARED`) it enforces; U1-6's three greps still pass unchanged |
| 4 (low, info): the grandfather list's header called all 47 names field-less (three carry a prose value) and gave no way to rerun the derivation without the plan | Reworded line 1: "failing (missing a verdict: line, or one whose last value is prose)", plus the rerun command inline and a pointer to the plan. Line 1 is outside the hash (`grep -v '^#'`), so U1-3's hash is unchanged |

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| U1-9 | in a `git clone -q --shared` scratch copy of the merged head: `printf '\nverdict: 🟢\n' >> .sdlc/verdicts/survey.md; sh .sdlc/checks/verdict-frontmatter-check.sh; echo exit $?` | `CLEARED survey.md: grandfathered but carries the field`, `verdicts 70 graded 23 grandfathered 47 bad 1`, `exit 1`; with `survey.md` also dropped from the list (list path swapped for a copy with that line removed): no `CLEARED` line, `verdicts 70 graded 24 grandfathered 46 bad 0`, `exit 0` | the same plant run against the script as it stood at `8742b0ee` (before this rework): no `CLEARED` line, `bad 0` exit 0, the silent pass the review found | 🟢 |

Rerun of every pass-1 row and control (A, B, C, D, D2, E, F, G, U1-0, U1-1, U1-3 through U1-8, P2, P3) against the new baseline, in a fresh scratch clone with the reworked script and list copied in: all match the shapes recorded in the pass-1 table above, with `68`/`21` read as `70`/`23` and `67`/`21`/`46` (control E) read as `69`/`23`/`46` throughout. `npm test` green (48/48), tree clean after; `node test/repo/branding.mjs` clean (550 files scanned, the merge added tracked files); no em dash in the script, the list, or this section.

| Field | Value |
|---|---|
| Head | `1439d285...` (unit/vf-U1, after the merge and the rework commit) |
| Ran | `npm test` (green, 48/48) · `node test/repo/branding.mjs` (clean, 550 files) · U1-9 and its control · every pass-1 row rerun at the new baseline |
| Left out | finding 3 (recorded in the review and the plan's revision-4 note, not fixed here); U2, Q1 |
