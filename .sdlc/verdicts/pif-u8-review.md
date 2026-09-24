# Review U8 · 🟡 FIX-FIRST

Fresh-context reviewer, opus high under owner ruling R17 (the Fable allowance is spent). Unit
branch `unit/pif-u8`, diff `505416d7..d8dd6bdb`, one commit, 13 files. Nothing in the worktree was
edited; every mutation ran in a copy under my session scratch directory. Host load 5 to 7.

Verdict in one line: the code fix is right and bites, every plan figure holds, `npm test` is green.
Four record defects hold it back, all small text edits: a committed log points at a handoff that
was never written, the U8-3 row fails its own criterion as literally written, two committed records
cite gitignored paths, and the `#718` attribution names the wrong defect.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U8-1 | `npm test` exit 0, log committed | 🟢 | Throwaway `--shared` clone at `d8dd6bdb`: `✓ all 49 test files passed`, `exit=0`, `git status --short` empty after. Committed log `.sdlc/records/pif-u7-gate-logs/u8-npm-test.log` ends `✓ all 49 test files passed` | Same clone, `docs/reference/data/role-table.json` `roleTable[0].light` set `550` to `999`, `npm test`: `▶ engine/semantic.mjs      FAIL`, `  FAIL  refs-canonical  — primary =  550/450 != canonical  999/450`, `✗ 1/49 test file(s) failed`, `exit=1`. Clone restored with `git checkout -- .` |
| U8-2 | summary word and failure branch read one predicate; same-length swap headlines `FAIL`, exits non-zero | 🟢 | `test/engine/anchor.mjs:371` `listOk` feeds both summary lines (`:372`, `:374`) and both failure branches (`:378`, `:383`); `test/engine/prime.mjs:1104` `ok` feeds `:1105` and `:1107`. Unmutated: both files exit 0 | I ran the two lists the builder did not. `DUPE_ALLOW[0]` swapped for a fabricated name: `  FAIL  anchor-ladder dupe-allow-list: 3 (expected 3)`, exit 1. `SYM_MEASURED_ALLOW[0]` swapped: `  FAIL  symmetry corpus measured-pixel: 22 of 3380 (expected 22)`, exit 1. Same `DUPE_ALLOW` swap on the base file `505416d7`: `  pass  anchor-ladder dupe-allow-list: 3 (expected 3)`, exit 1. So the fix is red-then-green, and all four frozen lists are now controlled between the handoff and this review |
| U8-3 | every cited path resolves; `scratchpad/u7rev/` in no added line | 🟡 | `git diff 505416d7..d8dd6bdb \| grep '^+' \| grep -c 'scratchpad/u7rev'` prints `1`: the U8-3 row itself, `.sdlc/handoffs/pif-u8.md:29`. Two cited paths are gitignored (`.gitignore:6` `.git-worktrees/`) and do not exist in the tree or a clone: see F3. Every other added path resolves | F2, F3 |
| U8-4 | revision 33 figures hold at head | 🟢 | `grep -c identity-control scripts/report-preset-fidelity.mjs` prints `0`; script reads only `--envelope` and `--damp-amp` (`:24-25`). `grep -c "chromaEnvelope(" src/engine/tonal.js` prints `5` at `:388`, `:749` (`paletteStopsAnchored`), `:830` (`paletteStops`), `:1036` (`okhslStopsAnchored`), `:1092` (`okhslStops`), as the plan names them. `export function chromaEnvelope(` prints `1`; `1 + ((controls.dampAmp` prints `0`. Gate prints `  pass  anchor-ladder dupe-allow-list: 3 (expected 3)`. `git show 4125d965 -- test/engine/anchor.mjs` removes P-Funk from `DUPE_ALLOW`, and `4125d965` is an ancestor of HEAD | Scratch clone at `14d9604d`: one `// chromaEnvelope(0)` line appended to `src/engine/tonal.js`, the grep prints `6`; one `// --identity-control` line appended to `scripts/report-preset-fidelity.mjs`, the grep prints `1`; Suspiria removed from `DUPE_ALLOW`, `node test/engine/anchor.mjs` prints `  FAIL  anchor-ladder dupe-allow-list: 3 (expected 2)`, exit 1. All reverted |
| U8-5 | no em dash in added prose; branding passes | 🟢 | One added line carries an em dash (`.sdlc/plans/preset-intent-fidelity.md:212`), the "ratios explode near 0" clause, present unchanged at `505416d7:212`; the whole-line replace removed one other. New files: 0 each. `branding: clean (572 files scanned)` | Scratch clone at `14d9604d`, one prose line with an em dash appended to `.sdlc/handoffs/pif-u8.md` and committed: the stripped added-line sweep over `505416d7..HEAD` goes from `1` (the pre-existing plan clause) to `2`. Then the retired maker name in uppercase appended to the same file: `node test/repo/branding.mjs` exits 1 with `FAIL: 1 branding violation(s) across 573 files` (altered: the offending line's name is not quoted, per X12). Clone reset |
| U8-6 | one commit, stated subject and trailer | 🟢 | `git rev-list --count 505416d7..d8dd6bdb` prints `1`; subject `fix(records): U8 adopts the orphaned pre-land pass-2 fixes (#681 U8)`; trailer `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>` | `git rev-list --count 505416d7..14d9604d` prints `2`, so the count check reads the rework commit and would fail a second commit (the rework was dispatched as a new commit, no amend, so U8-6 is graded at `d8dd6bdb`; the squash-merge lands one). `git log -1 --format=%s 505416d7` prints `docs(records): repair three claims the U7 row falsified, and commit the handoff (#681)`, which the subject check rejects |

Also run, all clean at head: `ceiling-counts: clean`, `stale total: 0` (baseline-agrees), `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD d8dd6bdb)`, `node scripts/audit-citations.mjs` exit 0.

## Findings, by severity

| # | Sev | Where | Finding | Fix |
|---|---|---|---|---|
| F1 | 🟡 medium | `.sdlc/records/pif-u7-gate-logs/r13-291s-preland-fixes-505416d7-plus-edits.log:5-8` | The header says the commit that follows "adds .sdlc/handoffs/pif-preland-fixes.md and this log" and that the branding re-run "is in the handoff". That handoff was never written (`git log --all -- .sdlc/handoffs/pif-preland-fixes.md` is empty); U8 wrote `pif-u8.md` instead. A committed record now sends its reader to a file that does not exist. No record cites this log either | Append one dated annotation line under the header naming `.sdlc/handoffs/pif-u8.md` (U8-5 row) as where the reading landed, marked as an addition so the verbatim body stays byte for byte; or cite the log from the U8 handoff and say the same there |
| F2 | 🟡 medium | `.sdlc/handoffs/pif-u8.md:29` | The U8-3 row puts `scratchpad/u7rev` in an added line, which is exactly what U8-3 forbids, and claims `0 hits` on "the staged diff's added lines". The claim was true before the row was written and is false for the commit. The row also says every other path "resolves in the tree", which F3 contradicts | Reword the row to name the needle without spelling it (for example "the old review scratch path") and restate the count against the committed diff |
| F3 | 🟢 low | `.sdlc/handoffs/pif-u8.md:12,14`, `.sdlc/questions/preset-intent-fidelity-u8.md:15` | Cite `.git-worktrees/lane-a-notes/u8-preland-fixes-brief.md` and `HANDOVER-681-to-e8.md`. Both are gitignored local notes; they resolve from the root checkout on this host only. Q6's source is therefore unverifiable from the tree | Say beside each citation that the file is a local, uncommitted note, or quote the load-bearing line (Q6's ruling is already quoted, so a clause is enough) |
| F4 | 🟢 low | `test/engine/anchor.mjs:370`, `test/engine/prime.mjs:1103`, commit body | Both comments say "(#718's defect)" and the commit says the fix is "(#718)". #718 is `baseline-agrees-check.sh's time check cannot fail: it reads only the first range in a gate cell` (CLOSED): the same class, a different gate. The brief said "That is precisely what #718 landed against", meaning the class. A reader following #718 from the test finds an unrelated script | "(the #718 class: a headline that disagrees with the exit code)" or drop the number |
| F5 | 🟢 low | `.sdlc/verdicts/pif-u7-review-1.md:12`, `.sdlc/records/pif-u7-blast/README.md:16-19` | Review 1 now says both scripts "reproduce the figures below". `ko.mjs` reproduces `0.00e+0` (I ran it: `default kit: max \|keyOklch - hexToOklch(key)\| 0.00e+0 palettes 16`), but the `5.86e-1` "with the cusp branch restored" figure at `:95` needs a source mutation the README does not describe | Add the cusp-restore mutation to the README's `ko.mjs` section, or scope the sentence to the head figure |
| F6 | ⚪ nit | review-1 `:9-10`, review-2 `:6-7`, README `:8` | "does not survive the session" and "not recovered": the raw `*.out` files and `runner*.sh` are still on disk under the previous driver's session scratch (`.../896c0b67-.../scratchpad/u7rev/`). True that they were not recovered; recoverable today if anyone wants them before `/private/tmp` is cleared | Optional |
| F7 | ⚪ nit | `.sdlc/plans/preset-intent-fidelity.md:215` | C7's "(today 2, lines 318 and 427)" is stale; the count is 0. Pre-existing, and the brief said to leave that clause, so not U8's to fix | Next plan revision |

## Correctness

| Question | Answer |
|---|---|
| Could the new predicate pass a real regression? | 🟢 No. It is exact positional equality of two sorted arrays, stricter than the old count test and identical to the failure branch it now mirrors. Its only error direction is a false red: `anchor.mjs` compares against hand-ordered literals, so an entry added out of sort order reds loudly, never passes quietly. A duplicate-for-duplicate swap (same multiset shape, different counts per name) still reads `FAIL` on the summary, and exits 1 through the fallback or an earlier `anchor-ladder` fail |
| Does any record contradict the code or another record? | 🟡 Yes, F1 and F2. Plan revision 33 matches the code everywhere I measured |
| Is the moved blast script runnable where cited? | 🟢 Yes. Committed `blast.mjs` and `ko.mjs` are byte-identical to the originals (`diff` against `.../896c0b67-.../scratchpad/u7rev/`). `ko.mjs "$PWD"` from the worktree prints the head figure. `blast.mjs` against a `de1bafef`/`285f66ec` clone pair built as the README says prints `{ total: 344, neutralFlip: 148, primaryMoved: 14, relMoved: 339 }` and `default Relative extend: [0.593,0.206,289.000] -> [0.504,0.187,288.988]`, matching the README. Both take absolute roots; a relative root would resolve against the script's own directory, and the README uses absolute paths |
| Merge with origin/main | 🟡 `git merge-tree` reports one conflict, `.sdlc/board.md`, which U8 did not touch; it is the plan branch's. Nothing on main touches `anchor.mjs` or `prime.mjs` since the merge base |

## Next

Builder fixes F1 and F2 (records only, no gate re-run beyond `branding` and `citations`); F3 to F5
in the same pass if cheap. Re-review is a delta read of those lines.

## Pass 2 · 🟢 PASS

Delta `d8dd6bdb..14d9604d`, one commit, 7 files. Same reviewer, opus high under R17. Read only the
lines F1 to F5 touched and the handoff's §7 and §8.

| # | Finding | State | Evidence |
|---|---|---|---|
| F1 | log header cites a handoff never written | 🟢 | `r13-291s-...log:16-18` gains a dated `ADDED 2026-09-22, U8 rework F1` annotation saying `pif-preland-fixes.md` was never written and pointing at `pif-u8.md` (U8-5 row). The verbatim body is untouched |
| F2 | U8-3 row spells the forbidden needle | 🟢 | `git diff 505416d7..14d9604d \| grep '^+' \| grep -c 'scratchpad/u7rev'` prints `0` over the whole unit. `pif-u8.md:30` names "the old review scratch path" and scopes "resolves" to paths that live in the tree, pointing at F3 for the two that do not |
| F3 | gitignored citations | 🟢 | `pif-u8.md:12-15` and `preset-intent-fidelity-u8.md:15` each say the note is local and gitignored and resolves only from the root checkout on this host |
| F4 | `#718` attribution | 🟢 | `test/engine/anchor.mjs:370` and `test/engine/prime.mjs:1103` read "the same defect class as #718". Comment-only edit (`git diff d8dd6bdb..14d9604d -- test` touches two comment lines). The first commit's body keeps the mislabel as history, which the handoff states; acceptable without an amend |
| F5 | `ko.mjs` cusp figure | 🟢 | `pif-u7-review-1.md:12-14` now scopes reproduction to `ko.mjs`'s head figure and says the cusp-restored figure needs an undescribed source mutation |
| F6, F7 | nits | ⚪ | Not in the rework brief; left as next-plan items, as the handoff says |

Reruns at `14d9604d` (test files copied into my scratch copy, verified identical to the commit with `git diff --quiet 14d9604d -- test`):
`node test/engine/anchor.mjs` exit 0, `  pass  anchor-ladder order-allow-list: 26 (expected 26)`, `  pass  anchor-ladder dupe-allow-list: 3 (expected 3)`.
`node test/engine/prime.mjs` exit 0, `  pass  symmetry corpus by-construction: 26 of 3380 (expected 26)`, `  pass  symmetry corpus measured-pixel: 22 of 3380 (expected 22)`, last line `PASS: prime-system clears all AC-050 gates`.
`branding: clean (574 files scanned)`. Added em dashes in the delta after the backtick strip: 0; removed: 0.

No new finding. The pass-1 negative controls stand: the rework changed only comments in the two test files.

verdict: 🟢
