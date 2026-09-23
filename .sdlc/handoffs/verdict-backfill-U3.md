# Handoff U3 · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/bf-U3` @ `96a08bd6` |
| Files | `.sdlc/checks/verdict-frontmatter-check.sh` (rewritten), `.sdlc/checks/verdict-frontmatter-grandfather.txt` (deleted), `.sdlc/adapter.md` (one additive amendment paragraph under §6) |
| Ran | see rows below | `npm test` ✅ 48/48, tree clean after · `node test/repo/branding.mjs` ✅ clean (574 files) · em dash sweep on the script ✅ `0` |
| Left out | none |

## Build

The script lost `PIN=`, the `git cat-file` preflight, the list reader, and the `GROWN`/`STALE`/`CLEARED`/`PIN MISMATCH` branches. It keeps `MISSING` and `VALUE` and the last-`verdict:`-line rule, reads files only (no `git`, no pin), and prints `verdicts <all> graded <all> bad <n>` as its last line. Its header comment says the #723 list was backfilled to empty and retired by #734. `.sdlc/checks/verdict-frontmatter-grandfather.txt` is deleted. `.sdlc/adapter.md` §6 gained one amendment paragraph after the #723 one, dated 2026-09-22, naming #734, that every sentence in the #723 paragraph naming the list/pin/`STALE`/`CLEARED`/`GROWN`/`PIN MISMATCH` is history, that the check needs no git and runs in a shallow clone, and that a deletion is the scope wall's `--diff-filter=DR` guard to catch, not this check's. No existing adapter line was changed (P3's `--numstat` deletions column on `.sdlc/adapter.md` is `0`).

## Criteria, each row's actual output

| Id | Command | Printed | Match |
|---|---|---|---|
| U3-1 | `test -e "$L"; echo $?; grep -v '^#' .sdlc/checks/verdict-frontmatter-check.sh \| grep -c -e 'PIN' -e 'grandfather' -e 'GROWN' -e 'STALE' -e 'CLEARED' -e 'cat-file' -e 'execFileSync'` | `1`, `0` | ✅ |
| U3-2 | `bash -c 'sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; echo exit ${PIPESTATUS[0]}'; sh ... \| grep -c grandfathered` | `verdicts 83 graded 83 bad 0`, `exit 0`, `0` | ✅ |
| U3-3 plant A (new field-less file, clone) | `printf '# x\n\nbody\n' > .sdlc/verdicts/zz-control-U1.md; sh ...; echo exit $?` | `MISSING zz-control-U1.md: no verdict: line`, `verdicts 84 graded 84 bad 1`, `exit 1` | ✅ |
| U3-3 plant C (prose value, clone) | `printf -- '---\nverdict: pass\n---\n' > .sdlc/verdicts/zz-control-U1.md; sh ...; echo exit $?` | `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴`, `verdicts 84 graded 84 bad 1`, `exit 1` | ✅ |
| U3-3 plant (N1: backfilled file rewritten field-less, clone) | `rm zz-control-U1.md; printf '# x\n\nbody\n' > .sdlc/verdicts/survey.md; sh ...; echo exit $?` | `MISSING survey.md: no verdict: line`, `verdicts 83 graded 83 bad 1`, `exit 1` | ✅ (the old head printed `bad 0` for this same plant; this is the fix N1 asked for) |
| U3-4 | `git clone -q --depth 1 --no-local . "$F/shallow"`; `git -C "$F/shallow" log -1 --format=%h`; `sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; echo exit ${PIPESTATUS[0]}` in that clone | `96a08bd` (the unit's own head), `verdicts 83 graded 83 bad 0`, `exit 0` | ✅ (the old script prints `PIN unreadable: cannot read commit f685529f (no git, no repo, or shallow clone)`, `exit 1` in the same clone) |
| U3-5 | `B=$(git merge-base origin/main HEAD); git diff --numstat "$B" -- .sdlc/adapter.md \| cut -f2`; the four `sed`/`grep` counts on `## 6. Records` | `0` (deletions), `1` (`#734`), `1` (`shallow clone`/`no git`), `1` (`diff-filter`) | ✅ |
| U3-6 | `perl -CSD -ne 'print if /\x{2014}/' .sdlc/checks/verdict-frontmatter-check.sh \| wc -l` | `0` | ✅ |
| U3-7 (N3 run) | in the clone: `git rm -q .sdlc/verdicts/survey.md; sh ...; echo exit $?; git diff --cached --name-only --diff-filter=D -- .sdlc/verdicts \| wc -l` | `verdicts 82 graded 82 bad 0`, `exit 0` (the check does not catch the deletion), then `1` (the scope-wall command that does) | ✅ |
| U3-8 / P4 (U3 form) | `bash -c 'sh ... \| tail -1; echo exit ${PIPESTATUS[0]}'; test -e "$L"; echo $?` | `verdicts 83 graded 83 bad 0`, `exit 0`, `1` (the list file is gone) | ✅ |
| U3-8 / P7 | `for f in .sdlc/checks/*.sh; do sh "$f" >/dev/null 2>&1; echo "$f exit $?"; done` | all five `exit 0` | ✅ |
| U3-8 / P1 | `npm test 2>&1 \| tail -1; ... TESTS length; git status --short \| wc -l` | `✓ all 48 test files passed`, `48`, `0` | ✅ |
| U3-8 / P2 | branding + em dash sweeps | `branding: clean (574 files scanned)`, `0`, `0` | ✅ |
| U3-8 / P3 | scope wall (with the 47-name exclusion filter) | `0`, `0`, `0` | ✅ |

## The six follow-ups (N1 to N6)

| Id | What it named | How U3 closes it |
|---|---|---|
| N1 | A pinned name could carry any field-less content; a delisted name re-appended with a field-less file passed | No list exists. A field-less rewrite of any file, including a formerly-listed one, now reds `MISSING` (run above: `survey.md` rewritten field-less in the clone reds where the old head passed it) |
| N2 | Moving both pins (the header's and the script's `PIN=`) together, in lockstep, was easy to miss | No pin anywhere in the script; nothing to move |
| N3 | A grandfathered file deleted along with its name from the list passed | This check was never the deletion guard and still is not; the scope wall's `--diff-filter=DR` command on `.sdlc/verdicts` is, and the run above shows it: the check exits 0 on a deletion, the scope-wall command catches it (`1`) |
| N4 | The re-pin recipe (rerunning the check with the list emptied, to compute the next pin) missed the script's own `PIN=` constant | No pin, no recipe; the archived `verdict-frontmatter.md` recipe is history, per the plan's own "not in scope" ruling, and is not edited |
| N5 | The #723 adapter paragraph named the list's header as the pin's authority, when the script's `PIN=` was the actual gate | The whole paragraph is superseded by this amendment, which states the mechanism is gone; nothing about pin authority remains live |
| N6 | `grep -c '#[0-9]'` (or similar) against the list's header could not go red once the header was hand-edited past emptying | The list file is deleted; no row of this plan, this check, or the adapter greps a header that no longer exists |

## Left out

Nothing from U3's rows. Pre-land (P1 to P7 at the plan head, `verdict-backfill-prepr.md`, the #734 closing comment, the Q4 ticket mint, the `#681` landing-order wait) is the Orchestrator's, not this unit's.
