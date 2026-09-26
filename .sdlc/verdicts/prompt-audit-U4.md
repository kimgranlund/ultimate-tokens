---
kind: verdict
plan: prompt-audit
unit: U4
ticket: "#758"
branch: unit/pa-U4
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-26
---

# Verdict prompt-audit U4 · 🔴 · the runner change is right; the review record fails the em dash gate

verdict: 🔴
sha: b6b1a2601202b74dbca3c4a3e637a48083184d40

`unit/pa-U4` at `b6b1a260`, code `8de8ca2d`. The evidence run is `/tmp/v13/pa-U4-verify.md`; I confirmed the red myself.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 / P3 | `npm test` green; the em dash gate green | 🔴 | mine: `node test/repo/em-dash.mjs` at `b6b1a260` prints `FAIL: 4 em dashes outside inline code spans in 1 files`, all in `.sdlc/verdicts/prompt-audit-U4-review.md` (lines `28`, `46`, `65`, `74`), so `npm test` fails `1/53` | at `8de8ca2d`, the commit before the review record: `em-dash: clean (793 files scanned)`, and the run's `npm test` passes `53/53` |

What unblocks: those four lines of the review record reworded without the glyph. No code changes, so the next
pass rereads P1, P3 and the checks at the new head, and the rows below carry.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U4-1 | the three edits are in, the request shape is what Q2 rules | 🟢 | `1 0 0 1 1 1` | the base: `0 1 1 0 1 0` |
| U4-2 | the runner skips cleanly without a key, its pure test green | 🟢 | `check 0`, exit `0` with no `ANTHROPIC_API_KEY`, the pure test passes | a planted syntax error: `check 1` |
| U4-3 | the research note reaches the model once | 🟢 | `1` | the base: `2`; `briefing.research` put back: `2` |
| E1 | E1 not applied (Q2, answer A) | 🟢 | the forced `tool_choice` and the request fields equal the base's; the only behaviour changes are the three asked for: the note sent once, `max_tokens` from `1024` to `4096`, and a `stop_reason: max_tokens` reply now throws | U4-1's base reading |
| P4 | scope wall | 🟢 | `0 0 0` | the plan's fixture: `3` |
| P6 | no history id enters | 🟢 | `0` added, `0` removed | a `(TKT-0010)` fixture: `1` |
| B | branding | 🟢 | `branding: clean (786 files scanned)` | a maker-brand copy: `FAIL: 3` |

Notes, 🟡:
- P5: E1 to E4 each have one fate row, but E1's `dropped` row cites no record; the ruling is at
  `.sdlc/questions/prompt-audit-approval.md:21`, and the row should name it.
- The handoff's extra "P6" check is not a plan row and nothing relies on it. One sentence in it is wrong: it
  says `#377` was kept verbatim, but the rewrapped comment puts it on an added line (P6's pattern still misses it).
- Carried: DD9, #755, and R53's one `STALE time test` line, the same at the base.

verdict: 🔴
sha: b6b1a2601202b74dbca3c4a3e637a48083184d40

## Pass 2 · 2026-09-26 · `f668ba53`: 🟢

`b6b1a260` to `f668ba53` changes only the review record (`1 file changed, 4 insertions(+), 4 deletions(-)`), so the
code rows carry. I reran P1, P3 and the record checks in a clone at `f668ba53`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 / P3 | `npm test` green; the em dash gate green | 🟢 | mine: `em-dash: clean (794 files scanned)`; `npm test` exit `0`, `✓ all 53 test files passed`, tree `0` after; `branding: clean (786 files scanned)`; `verdicts 163 graded 163 bad 0` | pass 1 at `b6b1a260`: `FAIL: 4 em dashes outside inline code spans in 1 files` |

Pass 1's 🟡 notes stand (E1's `dropped` row should cite `.sdlc/questions/prompt-audit-approval.md:21`; the handoff's
`#377` sentence).

verdict: 🟢
sha: f668ba53782d62476c433e4a0a0cd71ae9692a45
