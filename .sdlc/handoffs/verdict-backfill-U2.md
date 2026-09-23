# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/bf-U2` @ `792463f9` |
| Files | 16 files under `.sdlc/verdicts/`, `.sdlc/checks/verdict-frontmatter-grandfather.txt` |
| Ran | `sh .sdlc/checks/verdict-frontmatter-check.sh` ✅ `grandfathered 0 bad 0` exit 0 · `npm test` ✅ 48/48, tree clean after · `node test/repo/branding.mjs` ✅ clean (572 files) · em dash sweep ✅ `0` |
| Left out | none |

## The builder's own derivation, independent of the plan's table

Each of the 16 was read to its last block myself, independent of `.sdlc/plans/verdict-backfill.md`'s U2 table, before writing this row.

| File | Line derived from (quoted) | My token | Plan's token |
|---|---|---|---|
| `adopt-hygiene-U5-review.md` | `| Verdict | 🟢 clear |` (line 8), confirmed by pass 1: "All three criteria are green on this pass with no blocking findings." | 🟢 | 🟢 |
| `baseline-regex-U1-review.md` | `**Verdict: 🟢 PASS.**` | 🟢 | 🟢 |
| `k17-rerun-checkability.md` | title `🔴 not mobilizable`, overturned by `## Pass 2 · the revised plan at 67b1ee60 · 🟢 10 of 10 checkable, mobilizable` | 🟢 | 🟢 |
| `records-followup-U11-review.md` | `## Verdict`: `🟡 pass with notes. All four reds are genuine re-derivations...` | 🟡 | 🟡 |
| `records-followup-U12-review.md` | `Verdict: PASS. Roadmap change 🟢 on every criterion; two 🟡 handoff clauses, neither in the roadmap.` | 🟢 | 🟢 |
| `records-followup-U13-review.md` | 7 passes; pass 7 closes: `🟢 PASS at `55672d46`, with two 🟡 notes on the witness that change no figure.` | 🟢 | 🟢 |
| `records-followup-U14-review.md` | pass 1 `FIX-FIRST`; pass 3 closes: `**PASS at `79dc31ed`.** Both carried yellows are closed...` | 🟢 | 🟢 |
| `records-followup-U14-window.md` | evidence record; every row 🟢, no failing check, nothing named that failed | 🟢 | 🟢 |
| `records-followup-U8.md` | front matter `verdict: green-with-one-note`; body: "🟢 on the fix itself... 🟡 one note, no rework asked for... 🔴 none." | 🟢 | 🟢 |
| `records-followup-checkability.md` | Revision 2 close: "Whole plan at 5bf48fa5: 51 criteria, 🟢 51 · 🟡 0 · 🔴 0." | 🟢 | 🟢 |
| `records-followup-prepr-review.md` | body line 3 (byte-pinned): "Verdict FIX-FIRST: the mechanics hold, one blocking finding." (FIX-FIRST reads 🔴 per the plan's token rule) | 🔴 | 🔴 |
| `records-followup-roadmap-authz.md` | authorization record; all three named gates 🟢/pass/ACCEPT, landing authorized | 🟢 | 🟢 |
| `records-followup-roadmap-census.md` | `## Census closed`: "383 claims followed across five files. 318 hold, 48 fail, 16 unresolvable" → "The 48 failures collapse to **45 🔴 and 1 🟡** distinct defects." Later corrections (6 to 13) revise individual sites but do not retract the census's own closing headline | 🔴 | 🔴 |
| `records-refresh-prepr-review.md` | "Verdict: FIX-FIRST. Three live records under `.sdlc/` are untrue at the head the plan names..." | 🔴 | 🔴 |
| `records-tidy-U1-review.md` | "**Verdict: 🟢 pass**, all six criteria blocks match expectations exactly..." | 🟢 | 🟢 |
| `records-tidy-checkability.md` | Pass 2 close: "## Pass 2 · the revised plan at 20869d1b · 🟢 8 of 8 checkable, mobilizable" | 🟢 | 🟢 |

All 16 tokens agree with the plan's table; no row disputed.

## Placement (per U2 steps)

Line 2: `adopt-hygiene-U5-review.md`, `baseline-regex-U1-review.md`, `records-followup-U12-review.md`, `records-refresh-prepr-review.md`, `records-tidy-U1-review.md`.
Last front-matter line: `records-followup-U11-review.md`, `records-followup-U14-window.md`, `records-followup-checkability.md`, `records-followup-roadmap-authz.md`, `records-followup-roadmap-census.md`; `records-followup-prepr-review.md` above the `<!-- body begins, byte-pinned -->` marker; `records-followup-U8.md`'s existing `verdict: green-with-one-note` line replaced in place with `verdict: 🟢 green-with-one-note`.
End of file (after a blank line): `k17-rerun-checkability.md`, `records-tidy-checkability.md`.
Front matter `verdict:` replaced in place with the pass-1 token, final token appended at end of file: `records-followup-U13-review.md` (`verdict: 🔴 FIX-FIRST` in place, `verdict: 🟢` appended), `records-followup-U14-review.md` (same shape).

## Byte-pinned copy (U2-3)

`records-followup-prepr-review.md` body hash before and after: `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2`, unchanged. `verdict:` count above the marker: `1`.

## Diff shape (P5)

Per-file `git diff --numstat`: 11 files `1 0`, `k17-rerun-checkability.md` and `records-tidy-checkability.md` `2 0`, `records-followup-U8.md` `1 1`, `records-followup-U13-review.md` and `records-followup-U14-review.md` `3 1`. Commit summary: `17 files changed, 22 insertions(+), 19 deletions(-)`, matching the sum of the above plus the list file's 16 deleted lines.

## The list and the check

`.sdlc/checks/verdict-frontmatter-grandfather.txt` now holds only its `#` header line. `sh .sdlc/checks/verdict-frontmatter-check.sh | tail -1`: `verdicts 82 graded 82 grandfathered 0 bad 0`, exit 0.

## Hygiene

Branding clean (572 files scanned). Em dash sweep on the 16 records' and the list's added lines: `0` (checked before this handoff existed). This handoff's own added lines, stripped and raw: `0` (fixed after review pass 1 found two, lines 19 and 26 of the earlier revision). `npm test`: `✓ all 48 test files passed`, tree clean after. No `pif-*` file touched; no record outside the 16 touched; nothing changed in any of the 16 except the one `verdict:` line (proved by `git diff --numstat` above).
