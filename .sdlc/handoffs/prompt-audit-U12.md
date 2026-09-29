# prompt-audit U12 handoff, pass 1

Unit head (code commit): `3a03c8e4` on `unit/pa-U12`, off `plan/prompt-audit` at `ba60879f`. This file is committed after it, so the final head is the next commit.

## Changed

| File | Change |
|---|---|
| `.claude/skills/type-scale/references/best-practices.md` | walkthrough items 1 and 4 state the 2026-07-13 table as a three-entry `SM · MD · LG` row for thirteen voices and name the 2026-07-16 six-entry `XS..2XL` extension; item 5 unchanged |
| `.claude/skills/type-scale/references/foundations.md` | `FIXED SIZE TABLE` bullet states thirteen three-entry plus two six-entry rows; `makeVoices` knob list gains `uc-` and `uw-` |
| `.sdlc/baseline.md` | build row cause reads U3's MCP text rewrite, absorbed into the row at U9; KB cell stays `4137.0` |

## Criteria, as printed in this tree at `3a03c8e4`

| Id | Legs printed | Expected | Result |
|---|---|---|---|
| U12-1 | `0`, `2`, `0`, `15 13 2` | `0`, 1+, `0`, `15 13 2` | 🟢 |
| U12-2 | `0`, `2`, `15`, `1`, `1`, `3`, `3` | `0`, 1+, `15`, `1`, `1`, `3`, `3` | 🟢 |
| U12-3 | `2`, `2`, `2` | `2`, `2`, `2` | 🟢 |
| U12-4 | `0`, `1`, `1`, `1`, `1` | `0`, `1`, `1`, `1`, `1` | 🟢 |
| U12-5 | see below | | 🟢 |

## Negative controls run (against `git show HEAD~1` copies or `git stash`)

| Id | Printed | Plan says |
|---|---|---|
| U12-1 parent | `1`, `0`, `2` | `1`, `0`, `2` |
| U12-2 parent | `1`, `0`, `13`, `0`, `0` | `1`, `0`, `13`, `0`, `0` |
| U12-3 parent tree | `5` on leg 1 | `5` |
| U12-4 parent | `1` on the U9 bundle phrase | `1` |

## Controls not run

- U12-2 "`uc-` typed without `uw-` prints `14`, `1`, `0`".
- U12-3 fixture line appended under `plugin/`, and the `Thirteen`-deleted control.
- U12-4 KB cell typed `4130.3` giving `stale total: 1`.
- The `TKT-0008` and `2026-07-16` fixtures were run only as printf through P6's filter (`1` and `0`), not as a file edit.

## U12-5 (diff `HEAD~1..HEAD`, since `$B` adf300e2 is not this unit's base)

- P3: `branding: clean (956 files scanned)`, `em-dash: clean (964 files scanned)`, added U+2014 lines `0`.
- P6: added ids `0`, removed ids `0`; fixtures `1` and `0` as required.
- `sh .sdlc/checks/baseline-agrees-check.sh` ends `stale total: 0`; it also prints a `note` that the tree moved since the baseline ref `37b04676`, unchanged from before this unit.
- P1: `npm test` exit 0, `all 54 test files passed`, `git status --short` prints `0` lines after. Host was loaded; no retries were needed.
