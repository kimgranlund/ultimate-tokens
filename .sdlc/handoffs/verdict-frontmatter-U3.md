# Handoff U3 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/vf-U3 @ e0d5ddfb |
| Files | `.sdlc/checks/verdict-frontmatter-check.sh`, `.sdlc/adapter.md` |
| Ran | `npm test` ✅ (48/48, tree clean) · `node test/repo/branding.mjs` ✅ (557 files, clean) · em dash sweep on the diff ✅ (0) |
| Left out | the delete-with-name case (STALE vs. bad rewrite), named on #734, not claimed closed |

## U3 rows

| Id | Criterion | Command | Evidence | Control | State |
|---|---|---|---|---|---|
| U3-1 | clean run still passes | `sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; echo exit $?` | `verdicts 75 graded 28 grandfathered 47 bad 0` / `exit 0` | U3-2's plant is this row's negative control, run against the same head: it reds where U3-1 stays green | 🟢 |
| U3-2 | grown name reds | plant `zz-grown-U1.md` field-less, append name to the list, in a `--shared` clone of unit head | `GROWN zz-grown-U1.md: not grandfathered at f685529f` / `bad 1 exit 1` | same plant against `fbb19aec` in a separate clone: no `GROWN` line, `bad 0`, `exit 0` (matches critic's control e) | 🟢 |
| U3-3 | unreadable pin fails loud | pin swapped to `0000000f` via `sed`, in a `--shared` clone | `PIN unreadable: 0000000f is not a commit in this repository` / `exit 1`, no summary line | unmodified script on the same clone: `verdicts 75 graded 28 grandfathered 47 bad 0` / `exit 0` | 🟢 |
| U3-4 | adapter states what the check enforces | `grep -c 'shrinks only that way' .sdlc/adapter.md; grep -c 'GROWN' .sdlc/adapter.md` | `0`, `1` | the pre-fix wording, confirmed at `fbb19aec`: `1`, `0` | 🟢 |
| U3-5 | earlier rows still hold | `see the U3-5 rerun table below` | `see the U3-5 rerun table below` | each sub-row below carries its own control | 🟡 (one printed-prefix delta, explained) |

## U3-5: U1/U2 rerun at unit head (e0d5ddfb)

| Id | Command | Evidence | Control | State |
|---|---|---|---|---|
| U1-0 | `git merge-base --is-ancestor f685529f HEAD; echo $?` | `0` | the revision-2 tip `3b1d48b0` printed `1` there (plan-recorded historical control, not rerun this pass since that tip predates the pin being cut in) | 🟢 |
| U1-1 (ruling A) | clean run, then list swapped for an empty temp file | `verdicts 75 graded 28 grandfathered 47 bad 0 exit 0`, then `verdicts 75 graded 75 grandfathered 0 bad 47 exit 1` | the empty-list run above is its own control: it proves a mistyped list path (or one wiped out) cannot pass, since every file becomes graded and 47 turn `bad` | 🟢 |
| U1-2 | defect classes A/C/D/D2/B rerun in a fresh `--shared` clone: field-less, prose value, was-🟢-now-prose (last-line rule), was-🔴-now-🟢, and a well-formed control | `MISSING zz-U1-2-a.md: no verdict: line` (A) · `VALUE zz-U1-2-c.md: last verdict: green is not 🟢, 🟡 or 🔴` (C) · `VALUE zz-U1-2-d.md: last verdict: prose-last is not 🟢, 🟡 or 🔴` (D, proves the last-line rule) | D2 (🔴 first, 🟢 last) and B (well-formed) print no line for their names, confirmed by grep against the same run's output: the reds are the plant's, not the harness's | 🟢 |
| U1-3 | `grep -v '^#' … \| shasum`; `head -1 \| cut -c1-1`; `grep -c 'f685529f'` | `29d0eff2c1bccbc1b0dc033a9aba84ca99338869d5c4ef39658be557fc62e3c7`, `#`, `1` | dropping one name from the list changes the hash to `8db23fd7adbb2625f1d920c0fb94d7f1ef2913c8a7f1c1f1a32173f0bd903d1`, confirmed this pass | 🟢 |
| U1-4 | synthetic list `# x`, `survey.md`, `zz-absent.md` | `STALE # x`: `0` (unchanged) · `STALE zz-absent.md`: **`0`**, not `1`, because the line now reads `GROWN zz-absent.md: not grandfathered at f685529f` instead | separately confirmed real-STALE still fires: deleting a genuinely-pinned file (`adopt-hygiene-U1.md`) in a clone prints `STALE adopt-hygiene-U1.md: grandfathered but absent` unchanged | 🟡, see finding below |
| U1-5 | `git diff --name-only --diff-filter=MD $B -- .sdlc/verdicts \| wc -l` | `0` | planting `verdict: 🟢` onto `.sdlc/verdicts/survey.md` and rerunning the same diff-filter command prints `1`, confirmed this pass in a scratch copy | 🟢 |
| U1-6 | grep counts on adapter.md | `2`, `1`, `1` | the same three greps against `origin/main`'s `adapter.md` (fetched this pass): `0`, `0`, `0` | 🟢 |
| U1-7 | `git diff --numstat origin/main -- .sdlc/adapter.md \| cut -f2` (against `origin/main` per U3-5's own instruction, since this unit edits the amendment line) | `0` (removed-lines column; the amendment line changed in place, not deleted-and-reflowed, so numstat's removal count is 0) | rewording an unrelated existing line (the file's own header) in place and rerunning the same command prints `1`, confirmed this pass in a scratch copy | 🟢 |
| U1-8 | `perl -CSD -ne 'print if /\x{2014}/' .sdlc/checks/verdict-frontmatter-check.sh \| wc -l` | `0` | prepending one em-dash glyph to a scratch copy of the script and rerunning the same command prints `1`, confirmed this pass | 🟢 |
| U1-9 | plant valid `verdict: 🟢` onto grandfathered `survey.md`, in a clone; then also drop its name from the list | `CLEARED survey.md: grandfathered but carries the field` / totals match the clean run except `bad 1 exit 1`; second run (name also dropped): no `CLEARED`, `bad 0 exit 0` | the second run (name dropped) is itself this row's control: it is what the revision-4 fix changed the first run's silent pass into | 🟢 |
| U2-1 | `gh issue view 734` title/labels, then body name-match count | `Backfill verdict: front matter on the 47 grandfathered verdict records (#723 follow-up)` `P3,kind:chore,lane:docs,size:M,status:backlog`, `47` | a body missing one name would print `46` (plan-documented control, not replanted against the live issue #734 this pass) | 🟢 |
| U2-2 | `head -1 \| grep -c '#[0-9]'`; hash of names | `1`, `29d0eff2c1bccbc1` | editing a name while leaving the ticket number would change the hash away from `29d0eff2c1bccbc1` (plan-documented control, matches U1-3's measured re-derivation above) | 🟢 |

## Finding: U1-4's printed prefix changed (STALE → GROWN)

U1-4's plant (`zz-absent.md`) is a name that never existed anywhere, including at the pin `f685529f`. Before U3, the check's only signal for "listed name, no file" was `STALE`. After U3, `existsAtPin` is checked first, so a name absent from the pin is reported `GROWN` even when it is also absent from `.sdlc/verdicts/` today, and `GROWN` is the stronger, more accurate claim (never legitimately grandfathered at all, vs. grandfathered-then-deleted). This is expected fallout of the fix, not a regression: a name that **was** at the pin and is later deleted from `.sdlc/verdicts/` still prints `STALE` exactly as before (confirmed above with `adopt-hygiene-U1.md`). U1-4's literal expected `0`, `1` no longer holds for its own synthetic plant; the row's real intent (comment lines are skipped; an unfindable name reds) still holds, just under a different, correct prefix. Flagging for the reviewer/critic to decide whether U1-4's plant needs updating to a name that exists at the pin but was later deleted, to keep testing STALE specifically, separate from GROWN.

## Probes (dispatch asked "also probe", not scripted as new plan rows)

Both run in a `--shared` clone of the unit head, not the worktree.

- **Trailing space / CRLF on an EXISTING grandfathered name**: appending `adopt-hygiene-U1.md ` (trailing space) or `adopt-hygiene-U1.md\r\n` (CRLF) to the list produces no new output at all: the reader's `.trim()` on every list line strips both before the name is used anywhere, so the appended line collapses to a duplicate of the real entry (a `Set`, so the duplicate is a no-op). `GROWN` does not fire, but neither does anything break.
- **Trailing space / CRLF on a NEW name** (`zz-trailing-space.md `, `zz-crlf.md\r\n`): same `.trim()` runs first, so the check sees the clean name and correctly reports `GROWN zz-trailing-space.md: not grandfathered at f685529f` and `GROWN zz-crlf.md: not grandfathered at f685529f`; whitespace cannot be used to dodge the pin check.
- **Name present at the pin only in a subdirectory** (`sub/nested.md`, planted under `.sdlc/verdicts/sub/`, appended to the list): prints `GROWN sub/nested.md: not grandfathered at f685529f`, since it is not a file at the pin either (the pin never had that path). `existsAtPin` and the current-file `fileSet` both index by the literal listed string, so a real nested path would resolve correctly if it existed at the pin, but this is untested because the pin has no subdirectories under `.sdlc/verdicts/` to draw a positive case from, and manufacturing one to test against a real pinned commit was out of scope for this unit.
