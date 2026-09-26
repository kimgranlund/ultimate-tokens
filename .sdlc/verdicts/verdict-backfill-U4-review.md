# Review, verdict-backfill U4 (ticket #734), builder pass 1 (builder-l2)

Fresh-context reviewer. Worktree `.worktrees/bf-U4`, branch `unit/bf-U4` @ `cd3070eb`. Diff base `363e7ddb`
(the unit base named by the dispatch). Controls run in a `git clone -q --shared` scratch clone under
`$TMPDIR`, never in the worktree. Criteria: `.sdlc/plans/verdict-backfill.md` section "## U4: the eleven
pif records" (revision 5), rows U4-1 to U4-4, plus the plan's prose rules.

| State | Criterion | Evidence | Negative control |
|---|---|---|---|
| PASS | U4-1: each of the eleven carries exactly one `verdict:` line, in or directly after its closing graded block | Reran the per-file `grep -c`/`grep -n`/`wc -l` loop myself in the scratch clone: `count=1` for all eleven, line numbers matching the handoff table exactly (e.g. `pif-u1.md` `12:verdict: 🟢` of `136`, `pif-u5.md` `366:verdict: 🟢` of `390`). Read each of the eleven files in full and confirmed the block the line sits under is genuinely the record's own closing graded state (top summary table for `pif-u1.md`, the `## Verdict` table for `pif-u6.md`, the `## Overall`/pass-4 block for `pif-u5.md`, the `## Regrade at 96f7d99a` table for `pif-u8.md`, the `## Pass 2 · 🟢 PASS` close for `pif-u8-review.md`) and that nothing later in any file re-grades it differently | Deleted `pif-u3.md`'s `verdict:` line in the scratch clone and reran the check: `MISSING pif-u3.md: no verdict: line`, `bad 1`; restoring the file returns `bad 0`, proving the check discriminates rather than passing vacuously |
| PASS | U4-2: every value is unchanged | `git diff 363e7ddb -- .sdlc/verdicts/pif-u*.md \| grep '^[-+]verdict:' \| sort \| uniq -c` → `11 -verdict: 🟢` / `11 +verdict: 🟢`; the unsorted pairing shows 9 🟢/🟢 pairs and 2 🟡/🟡 pairs (`pif-u4.md`, `pif-u7-review-1.md`), matching the handoff exactly, and each pair sits on the same file with no reordering | An unpaired count or a value swap would break the `sort \| uniq -c` symmetry; ran it unsorted too to confirm no cross-file swap |
| PASS | U4-3: no other byte moved | `git diff 363e7ddb --numstat` for the eleven: `1 1` for `pif-u1.md`, `pif-u3.md`, `pif-u4.md`, `pif-u6.md`, `pif-u7.md`; `2 1` for `pif-u2.md`, `pif-u5.md`, `pif-u7-review-1.md`, `pif-u7-review-2.md`, `pif-u8.md`, `pif-u8-review.md`. Read every full unified diff (`-U3`) for all eleven files: the `2 1` files each add one blank separator line, nothing else; front matter that lost its `verdict:` line (`pif-u5.md`) still opens and closes with `---` at lines 1 and 10, valid YAML | A reworded surrounding line would show a higher insert/delete count than `1`/`2`; none did |
| PASS | U4-4: check stays green, nothing else moved | `sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1` → `verdicts 108 graded 108 bad 0` in the scratch clone, matching the builder's own run. `git diff --name-only 363e7ddb` lists exactly the eleven `pif-*` files plus `.sdlc/handoffs/verdict-backfill-U4.md`; no stray file | Confirmed the check bites (see U4-1's control); a stray file would show in the name-only diff and did not |
| FIX-FIRST | Plan prose rule: "No em dash outside an inline backtick span that quotes program output" | The handoff itself carries one: `.sdlc/handoffs/verdict-backfill-U4.md:13`, `"(from line 2, above or in front matter, to the record's closing graded block) — I read the diff,"`. Confirmed with `git diff 363e7ddb -- . \| grep -v '^+++' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/'` → 1 hit, the line above; this is prose, not quoted program output, so the backtick-stripping rule does not exempt it | The same command over the eleven `pif-*.md` diffs alone prints `0` (their own added lines are only `verdict:` tokens and blank lines), isolating the defect to the handoff's own new prose rather than the backfilled records |
| PASS (relied on builder) | `npm test` green, tree clean after | Builder's handoff states `✓ all 49 test files passed`, exit 0, clean tree; I independently reran the frontmatter check (above, `bad 0`) and `node test/repo/branding.mjs` in the scratch clone → `branding: clean (651 files scanned)`. A fresh `npm test` run in my own clone was still executing past this review's time budget; relying on the builder's reported result per the dispatch's allowance since the frontmatter check was independently reproduced | n/a, per dispatch allowance |

## Findings, ranked

**Medium.** `.sdlc/handoffs/verdict-backfill-U4.md:13` carries an em dash in prose the builder wrote for
this handoff, violating the plan's own prose rule stated above U2-1 ("No em dash outside an inline
backtick span that quotes program output"). It is a one-word fix (replace with a comma or a period plus
new sentence) and touches no `pif-*` file or verdict value, so nothing else in this review is contingent
on it, but it is a defect in what this plan itself adds and should not land uncorrected.

No other finding. The eleven moves are byte-clean, values unchanged, placements each independently
verified against the record's own closing graded block, the check is green, and the handoff's per-file
block table matches what the files actually hold.

## Verdict

verdict: 🟡
