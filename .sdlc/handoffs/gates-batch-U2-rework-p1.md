# Rework gates-batch U2 · reviewer-l3 FAIL · unit/gb-U2 @ bca0a33a

| # | Sev | Finding | Required |
|---|---|---|---|
| 1 | 🔴 | `COUNT_PHRASE_FLOOR` is one total over all pins (35 read, 24 from `skill type voices`), so four of five pins can go vacuous: `noun: "fromats"` on `skill colour formats` plus a planted `eight colour formats` exits 0 with `+ 31 count phrases` (`test/repo/citations.mjs:211`, `:232`) | Each `noun` pin must read at least 1 phrase (its needle already contains the noun), keep the total floor; add a negative control per pin (misspelled noun reds naming the pin) to the handoff |
| 2 | 🟡 | Grammar inconsistent: `roles?` catches singular, voices and formats pins do not (`a fourteen-voice scale` exits 0); a qualifier outside the fixed list slips (`the 14 type voices`) (`:219`) | Align singular handling across pins if the plan's U2 criteria allow it; otherwise declare in Decisions. Qualifier breadth: declare, do not widen |
| 3 | 🟡 | Allow entries excuse a phrase anywhere in the skill dir | No change (plan's choice) |
| 4 | 🟡 | `typography.js:672`, `:1002-1003`, `:1012` (a user-visible string) still say eleven/11 voices | Out of lane: no change in U2; the Orchestrator files a follow-up issue |

Re-run `npm test` (heavy-suite cap applies), update the handoff and its ran block, commit, return the new head.
