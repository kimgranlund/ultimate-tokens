---
kind: verdict
plan: cache-docs
seat: verifier
pass: 1
pr: 760
ticket: "#750"
written: 2026-09-26
---

# Pre-PR · cache-docs · pass 1 · 🔴 at `99219abb`: the content is ready, the PR text is not

Closes #750

verdict: 🔴
sha: 99219abb654b78ef46f9eebaf761725a27ed4e0b

`plan/cache-docs` at `99219abb`, draft PR #760, one unit (U1 🟢 at `127fef33`).

The pair:

- **Review leg:** `.sdlc/reviews/cache-docs-prepr-review.md` (main `a92f3f2e`), `reviewer-l4`, last line `verdict: 🟢`.
  It notes that the one stale `toFixed(2)` line left in the tree, `_okL`, is chroma-floor's (#701), not this plan's,
  and that #750's closing text should say so.
- **Verification leg:** I dispatched it as `verifier-l3` at `99219abb`. Its report is `/tmp/v13/cd-prepr-verify.md`.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| PR1 | the PR title matches the Landing | 🔴 | mine: `gh pr view 760` title `plan/cache-docs`; Landing pins `docs(engine): the cache-key lines say exact float, #686 (#750)` | the pinned title carries `docs(engine):`; the current one does not |
| PR2 | the PR body meets the Landing and adapter §2 | 🔴 | mine: body length `0`; Landing pins `Closes #750` | an empty body matches nothing |

What unblocks: `gh pr edit 760` with the pinned title and a §2 body (`Closes #750`, the note on `_okL`, this
record's table, the generated-with line). No commit, so pass 2 rereads only PR1 and PR2 at the same sha.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| CC | custody from U1's verdict | 🟢 | `git diff --stat 127fef33 99219abb -- ':!.sdlc'` prints nothing | the same diff against the base is non-empty |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 53 test files passed`, TESTS `53`, tree `0` (under load, pass/fail only) | the `"scrimX` clone: exit `1` |
| P2 | no bundled or executable source changes; build and smoke not owed | 🟢 | `0`. `npm run build` and `npm run smoke` were not run, on this ground | the plan's two-name fixture: `1` |
| P3 | branding, dashes, the em dash gate | 🟢 | `branding: clean (789 files scanned)`, added `0`, raw `0`, `em-dash: clean (797 files scanned)` | a maker-brand copy: `FAIL: 3` |
| P4 | scope wall | 🟢 | `0`, `0` | the plan's fixture: `2` |
| U1-1 | the three live keys, #686 and #738, no `toFixed` | 🟢 | `0`, `2`, `2`, `2`, `4`, `1`, `0` | the base: `4`, `0`, `0`, `0`, `0`, `0`, `1` |
| U1-2 | the geometry cross-reference, one line | 🟢 | `0`, `1`, `1`, `0`, numstat `1 1` | ` #686` appended: the fourth count `1` |
| U1-3 | the claims are true of the tree | 🟢 | `3`, `3`, `2` | `String(hue)` to `hue.toFixed(2)`: `2`, and `prime.mjs` exit `1` |
| U1-4 | citations green, six lines in two files | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 99219abb)`; `1 1`, `5 5` | a stale cite planted: exit `1` |
| M | clean merge; the squash keeps main's board | 🟢 | mine: `git merge-tree --write-tree origin/main 99219abb` exit `0`; the worker's squash tree differs from main in exactly the six P4 files | two branches editing one board line: exit `1` |
| CI | CI at the full sha | 🟢 | run `36265231014` at `99219abb`: every job `success`, `deploy` `skipped` | run `35785765215` red at `Run npm run smoke` |

Carried, 🟡: `baseline-agrees` with R53's one `STALE time test` line, `doc-drift-rows` DD9, and `ceiling-counts`
(#755), identical on main and on the squash tree. The card checks are read by their last line while #745 is open.

verdict: 🔴
sha: 99219abb654b78ef46f9eebaf761725a27ed4e0b
