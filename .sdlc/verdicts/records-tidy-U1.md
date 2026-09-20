# Verdict U1 · 🟢

Plan `records-tidy` (ticket #712), unit U1, graded at `unit/records-tidy-U1` @ `030824bc` (merge base `730ff941`) by worker `records-tidy-U1-verifier-l1-p1` (verifier-l1, fresh context, throwaway shared clones, every row its own run). Dispatched and written down by the conductor seat under the owner's ruling in `.sdlc/questions/records-tidy-U1-verification.md`, because the verifier seat was down. Host: 10 cores, load 3.4 to 4.1 during the timed gates.

| # | Criterion | State | Evidence (own run) | Negative control (own run) |
|---|---|---|---|---|
| U1-1 | rerun note drops the U3-grades claim, names the newest A2 pass, pass number equals the highest heading, line 18 is the only deleted map line | 🟢 | `0`, `1`, `1` (N computed = 6), `1`, `1`: matches Expected `0 1 1 1 1` | retyped `pass 6 of` to `pass 5 of` in line 18: third leg `0`. Second map line edited: fourth leg `2` |
| U1-2 | K17 debt row quotes the map's seven-name filter byte for byte, no "3 files", line 92 the only deleted line | 🟢 | `1`, `0`, `1`, `1`; the filter lifted from the map is the 7-name form | dropped `ui/counts.mjs` from the map cell, debt row unchanged: first leg `0` (either file moving alone fails) |
| U1-3 | adapter item 1 says reviewer-l4, no l3 outside the amendment, one dated amendment naming the skill, one deleted and two added lines | 🟢 | `0`, `2`, `1`, `1`, `2`, `1`: matches Expected | appended a stray `reviewer-l3` sentence outside the amendment: first leg `1` |
| U1-4 | A2 verdict untouched, seven C31 counts hold | 🟢 | `git diff --stat` empty, then `18`, `18`, `19`, `31`, `1`, `7`, `19 19`: the pinned set | deleted one pass-5 K row: stat non-empty (`1 deletion`), second leg `17` |
| U1-5 | no other tracked `.sdlc/` record gained or lost a reviewer-l3 | 🟢 | `0` | `sed` on `.sdlc/plans/archive/k17-rerun.md`: `1` uncommitted, `1` again once committed |
| §Texts fidelity | three replaced lines plus the amendment equal the plan byte for byte | 🟢 | byte compare against the plan's four fenced blocks: map line 18 MATCH, debt line 92 MATCH, adapter line 58 MATCH, amendment MATCH with the date `2026-09-20`, at adapter line 63, after item 4 and a blank line, before `### 2.2` | the same comparator reported DIFFER when first pointed at the 2026-09-18 amendment paragraph |
| P1 | `npm test` green, no `node_modules`, tree byte-stable | 🟢 | `all 48 test files passed`, then `0` at the committed head (the builder's handoff figure of `3` was its own uncommitted edits and is not evidence). 62.7 s wall, load 3.4 to 3.5 | `"scrim` to `"scrimX` in `role-table.json`: exit `1`, `refs-canonical` FAIL (ordered key set != canonical), `1/48 test file(s) failed` |
| P4 | branding gate clean | 🟢 | `branding: clean (472 files scanned)`, exit `0` | records file copied to `docs/x.md`: `FAIL: 3 branding violation(s) across 473 files`, exit `1` |
| P5 | scope wall | 🟢 | `0`; the eight paths differing from the merge base are all inside the wall | one byte on the A2 verdict `1`; `.sdlc/checks/new.sh` `1`; `verdicts/k17-rerun-records-tidy.md` `1`; `plans/records-tidy-extra.md` `1`; the loop's own later records together `0` |

Counts: 9 rows, 9 🟢, 0 🟡, 0 🔴. Every 🟢 has a control that bit.

Note, not a defect: the plan file on `plan/records-tidy` differs from the unit head by one character, the U1 checkbox, which touches no criterion. The branding red that sat on the plan branch between c45c4ef3 and 16f65d94 was in the Orchestrator's review record, outside the graded diff, and is fixed.
