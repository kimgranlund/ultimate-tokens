# Review U10 · 🟢 (pass 3, at a6e32b2)

Reviewer: U10-reviewer-l4-p1 (fresh context). Branch `unit/hygiene-U10` @ a6e32b2 (merged `sdlc/adopt` @ 6c83520). Criteria: root `.sdlc/plans/adopt-hygiene.md` §U10, 6 rows. Both `.sdlc/checks/*.sh` are byte-identical on the branch and the root (`cmp`). Pass 1 (9020e96) flagged the stale ADR Source starts; pass 2 (1ad1958) went 🔴 on ADR-010's end excluding its own amendment and on the start-only script. Both are fixed here; this record replaces the earlier two.

Method: `git archive a6e32b2` to `$CLAUDE_JOB_DIR/tmp/u10c`; every destructive control ran on that export, the file restored from the commit, and the script rerun to `0` each time. `npm test`, branding and the U8/U9 sweeps ran in the worktree; porcelain `0` before and after.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | six cards and six index cells name the amendment; no "none stated" contradiction | 🟢 | `stale total: 0`, no `stale` line | SITE-runbook's amendment clause cut: `stale card SITE-runbook`, `stale total: 1`; restored: `0` |
| 2 | amendment script not vacuous | 🟢 | `- **Amendment (2026-09-16).** plant` under `## ADR-011`: `stale card ADR-011`, `stale index ADR-011`, `stale total: 2`; restored: `0` | without the plant: neither line |
| 3 | no `none` on the six index rows | 🟢 | `0` | plan-measured `2` at 279ae0f; not rerun |
| 4 | U8 and U9 sweeps green | 🟢 | `u8check.sh` rows 1 to 9 print the §U8 Expected column verbatim, exit 0; `wording-check.sh origin/main HEAD` and `1ad1958 HEAD`: `em dashes: 0, bold labels: 0`, exit 0 both; U9 c1: `0` then exactly the three expected `missing` lines; U9 c3: no line, `npm ci` count `3` | as in §U8 and §U9; not rerun |
| 5 | gates, tree, branding | 🟢 | `all 44 test files passed`; porcelain `0` after the run; `branding: clean (435 files scanned)` | P1 control not rerun: it requires writing a retired brand string, which this review is barred from |
| 6 | every ADR card's Source range is its section, start at the heading, end at the last non-blank line | 🟢 | script: `range mismatches: 0`, no line. Independent measurement of all 24 sections (heading line, next `## ` line, last non-blank before it) agrees with all 24 card ranges, see the table below | four controls, each `range mismatches: 1`, restored to `0`: ADR-011 end 191 → 222 prints `end ADR-011 says 222, section ends at 191` (the plan's control); ADR-010 start 144 → 145 prints `start ADR-010 says 145, heading at 144`; ADR-010 back to its pre-fix `144-157` prints `end ADR-010 says 157, section ends at 161` (pass 2's red now bites); ADR-024 end 694 → 695 (the trailing blank) prints `end ADR-024 says 695, section ends at 694` |

## Range read, all 24 ADR cards

Card range / heading / next heading / last non-blank, every row matching:

| Card | Range | Heading | Next | Last non-blank |
|---|---|---|---|---|
| ADR-001 to ADR-009 | 13-22 · 24-50 · 52-70 · 72-86 · 88-98 · 100-112 · 114-121 · 123-134 · 136-142 | each on its heading | | each on its last content line |
| ADR-010 | 144-161 | 144 | 163 | 161 (the amendment is `:158-161`, inside; `:162` is the blank) |
| ADR-011 to ADR-022 | 163-191 · 193-220 · 222-296 · 298-328 · 330-361 · 363-399 · 401-432 · 434-474 · 476-524 · 526-574 · 576-643 · 645-667 | each on its heading | | each on its last content line, one before the blank pass 2 flagged |
| ADR-023 | 669-680 | 669 | 682 | 680 (`:681` blank) |
| ADR-024 | 682-694 | 682 | 696 (the "Quick map" heading, file end for ADRs) | 694 (`:695` blank) |

The end convention (last non-blank line, no trailing blank claimed) now holds for every ADR card, the 10 untouched ones included, not only the 14 this pass changed. The script's own fallback for a section with no following heading (`wc -l + 1`) is not exercised at this head because "Quick map" follows ADR-024; it reads correctly.

## Cell fidelity (re-read at a6e32b2, unchanged)

| Record | Source | Card and index cells |
|---|---|---|
| ADR-010 | `decision-records.md:158` | 🟢 `persist.js` comment, `zipStore` in `src/ui/zip.mjs` not `makeZip` |
| ADR-013 | `:290` | 🟢 thirteen → fifteen, `UI-control`/`UI-widget` split off `ui` |
| ADR-016 | `:394` | 🟢 three renames plus "Color Primitives" unchanged |
| LLD-muted-base | `lld-muted-base-key-spikes.md:220` | 🟢 `src/engine/resolve.mjs`, canvas + `derivePalette` |
| SITE-runbook | `go-live-runbook.md:32` | 🟢 four wired consumers, `hostedMcp` alone unwired and why |
| SITE-describe-palette | `describe-palette-spec.md:579` | 🟢 no-op skip → `exit 1`, key stays the user's action |

`decisions.md:33` and `:50` agree with the ADR-016 and SITE-runbook cells. Exactly six sources carry `Amendment (2026-09-16)` (`grep -rn` over `docs/`), all six covered; the amendment script's remaining blind classes are another date, another marker shape, a cell that names the date but misstates the text (the table above), and a non-ADR `## ` heading between two ADR sections.

## Scope, wording, branding

Diff 1ad1958..a6e32b2 on the branch: fourteen ADR range cells, the range script, the handoff, plus the merge's own `board.md`, plan and verdict rows from `sdlc/adopt`. Raw scan of added lines outside `.sdlc/verdicts`: 0 em dashes, 0 bold labels. No retired brand string. Handoff's criterion 6 control (`end ADR-010 says 160, section ends at 161`) is a fifth distinct control from the four above; all agree.

## Would block a fresh pre-land read

| Item | State | Evidence |
|---|---|---|
| nothing blocking in U10's files or the records they point at | 🟢 | rows 1 to 6 |
| plan §U10 row 6 negative-control prose says ADR-010's "section runs to 162" while the criterion's own convention ends it at 161 (162 is the blank line) | 🟡 | `sed -n '133p' .sdlc/plans/adopt-hygiene.md`; one word in plan text, the script and the card say 161; fix in the pre-land round's plan pass |

Blocking: 0.
