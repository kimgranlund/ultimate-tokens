---
kind: verdict
plan: prompt-audit
unit: U11
ticket: "#758"
branch: unit/pa-U11
base: 1b9ec1ed
grade: verifier-l1 (opus) for a builder-l2 (sonnet) build, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict prompt-audit U11 · 🔴 · every row U11-1 to U11-7 holds and every rewritten line is true of the engine; the handoff says legs 3 and 4 of U11-4 cannot run in its tree

verdict: 🔴
sha: 6c7598f73fae19245673e6c85ae05096893e02d1

`unit/pa-U11` at `6c7598f7`, base `1b9ec1ed` (= origin/plan/prompt-audit); `$B` = `cc5be9be`. `verdict.py check` passes on the handoff and the review, both created by the unit. Evidence ran in a fresh `--no-hardlinks` clone with no node_modules and BSD grep. The seat re-ran the red row itself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U11-1 | 🟢 | `0`, `1`, `2`, `15 13 2` | file at `7ff8177c`: `1`, `1`, `1`; line 51 typed `Fifteen` in a copy: second grep `0` |
| U11-2 | 🟢 | `0`, `1`, `1`, `1` (the table's `\|` typed as a bare pipe per the plan's Diff-bases rule) | file at `7ff8177c`: `1`, `0`, `1`; the file-wide `XS.*2XL` grep prints `1` there while the row grep prints `0` |
| U11-3 | 🟢 | `0`, `0`, `1`, `1`, `0`, `15` | file at `7ff8177c`: `1`, `1`, `0`, `0`; `make7` typed back in a copy: `1` |
| U11-4 | 🟢 | `0`, `1`, `1`, `2` | file at `7ff8177c`: `1`, `1`, `1`, `2`; the sentence deleted: `0`, `0` |
| U11-5 | 🟢 | `0`, `1`, `1`, `1` | file at `7ff8177c`: `1`, `0`, `1`; KB typed `4130.3`: `stale total: 1` |
| U11-6 | 🟢 | `4`, `0`, `1`, `sorted` (`2026-09-26`, `2026-09-28`, `2026-09-29`, `2026-09-29`) | file at `7ff8177c`: `sort: -:2: disorder: 2026-09-26`; U3 dated but left in place: `disorder` |
| U11-7 | 🟢 | P1 `✓ all 54 test files passed`, exit 0, status `0`, TESTS `54`; P3 `branding: clean (949 files scanned)`, `em-dash: clean (957 files scanned)`; P6 added `0` | `"scrimX` in role-table.json: exit 1; ADR copy under `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`; `+the rule (TKT-0010)` through P6: `1` |
| Engine truth | 🟢 | `makeVoices()` has `15` keys, 13 on `RANKS` and 2 on `RANKS6` via `ranksFor`; `typeScale({}).categories` carries the same 15 names; `git grep make7 -- src mcp scripts` finds nothing; the kept `Thirteen voices ride the uniform 3-step ramp` is true | at `7ff8177c` the same engine legs contradict `THIRTEEN voices`, `always the uniform SM/MD/LG` and `make7`, which is what U11-1 to U11-3's controls print |
| Scope | 🟢 | `git diff --name-only 1b9ec1ed 6c7598f7`: the five U11 files plus the handoff and review; P4 filters `0`; the moved U3 paragraph differs only by `2026-09-28, ` | P4 six-name fixture `3`; `.sdlc/reviews/other-U11-review.md` through the records filter: `1` |
| Handoff | 🔴 | `.sdlc/handoffs/prompt-audit-U11.md:34` says legs 3 and 4 `need the U8 handoff and evidence file, not in this tree`. `git show 1818bf59:.sdlc/handoffs/prompt-audit-U8.md \| grep -c -E '^[\|] SA7 [\|] applied [\|]'` prints `1`, and the evidence file's `are now \*\*validated\*\*` count prints `2` at the same commit | both files are tracked at `1818bf59`, `aeb53f7d` and `6c7598f7`; a record absent from the tree would print a `No such file` error, not `1` and `2` |

### Findings

1. 🔴 `.sdlc/handoffs/prompt-audit-U11.md:34`: the U11-4 cell should read `0, 1, 1, 2`. Both records are in the unit's tree. The reviewer flagged the same thing. This is a record repair only.
2. 🟡 The handoff's U11-7 control cell says `not separately run`. It should say the builder did not run P1, P3 and P6. This run did, and all three bite.
3. 🟡 Against the plan: the U11-4 "At `$B`" cell says legs 3 and 4 read `0` at `cc5be9be`. With a path on disk they print a `No such file` error instead, and read `0` only through `git show`.
4. 🟡 Against the plan: U11-7's "no history id enters" wording is looser than U11-5, which requires `(#758)` in the build row. P6 does not scan `.sdlc/`, so the row holds as written.
5. The review's BSD-grep note on U11-2 is half right. A literal `[|]` fixes leg 3's anchor, but leg 2 needs bare alternation (`-E 'ranksFor[|]2XL'` prints `0`). The plan's Diff-bases rule already covers this, so it is not a defect. Separately, the review's `957` em-dash count at `aeb53f7d` measures as `956`.
6. Pass 2 needs finding 1 only; finding 2 is cheap in the same edit.
