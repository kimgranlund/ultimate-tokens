# Review U10 · 🔴 (pass 2, at 1ad1958)

Reviewer: U10-reviewer-l4-p1 (fresh context). Branch `unit/hygiene-U10` @ 1ad1958 (merged `sdlc/adopt` @ 29fc25b). Criteria: root `.sdlc/plans/adopt-hygiene.md` §U10, 6 rows. Both `.sdlc/checks/*.sh` are byte-identical on the branch and the root (`cmp`), so the runs below use them as committed.

Method: the branch was exported with `git archive 1ad1958` to `$CLAUDE_JOB_DIR/tmp/u10b`; every destructive control ran there and the file was restored and rerun to `0` each time. `npm test`, branding, and the U8/U9 sweeps ran in the worktree; porcelain `0` before and after. Pass 1 (at 9020e96) found 0 blocking and flagged the stale ADR Source ranges; that record is replaced by this one.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | six cards and six index cells name the amendment; no "none stated" contradiction | 🟢 | `stale total: 0`, no `stale` line | ADR-016's amendment clause cut on the export: `stale card ADR-016`, `stale total: 1`; restored: `0` |
| 2 | amendment script not vacuous | 🟢 | `- **Amendment (2026-09-16).** plant` under `## ADR-011`: `stale card ADR-011`, `stale index ADR-011`, `stale total: 2`; restored: `0` | without the plant: neither line |
| 3 | no `none` on the six index rows | 🟢 | `0` | plan-measured `2` at 279ae0f; not rerun |
| 4 | U8 and U9 sweeps green | 🟢 | `u8check.sh` rows 1 to 9 print the §U8 Expected column verbatim, exit 0; `wording-check.sh origin/main HEAD` and `29fc25b HEAD`: `em dashes: 0, bold labels: 0`, exit 0 both; U9 c1: `0` then exactly the three expected `missing` lines; U9 c3: no line, `npm ci` count `3` | as in §U8 and §U9; not rerun |
| 5 | gates, tree, branding | 🟢 | `all 44 test files passed`; porcelain `0` after the run; `branding: clean (435 files scanned)` | P1 control not rerun: it requires writing a retired brand string, which this review is barred from |
| 6 | every ADR card's Source range points at its heading and section at this head | 🔴 | script: `range mismatches: 0`. Section read for all 24 ADRs (heading line, next `## ` line, last non-blank line before it): the 12 recomputed starts all sit on their heading. But `ADR-010` still cites `144-157` and its section runs to 161: the `Amendment (2026-09-16)` U1 appended at `:158-161` is outside the cited range, on the one card whose amended-by cell (row 1) names that amendment. The criterion text is not met for ADR-010; the plan's parenthesis "moved every range below ADR-010" is the reason it was skipped (the block was appended inside ADR-010, extending it, not below it) | plan control reproduced: `ADR-011` start shifted to 164 prints `range ADR-011 says 164, heading at 163`, `range mismatches: 1`. Blind spot measured: `ADR-011` end shifted from 192 to 222 (30 lines past the next heading) prints `range mismatches: 0`; the script compares the start line only, so a wrong end, including ADR-010's, never prints |

## Range read, all 24 ADR cards (heading / next heading / last non-blank / card range)

ADR-001 to ADR-009: card end equals the last non-blank line (13-22, 24-50, 52-70, 72-86, 88-98, 100-112, 114-121, 123-134, 136-142) 🟢. ADR-010: 144 / 163 / 161 / card `144-157` 🔴. ADR-011 to ADR-022: starts match (163, 193, 222, 298, 330, 363, 401, 434, 476, 526, 576, 645); every recomputed end is `next heading minus 1`, the blank line one past the last content line (192 vs 191, 221 vs 220, 297 vs 296, 329 vs 328, 362 vs 361, 400 vs 399, 433 vs 432, 475 vs 474, 525 vs 524, 575 vs 574, 644 vs 643, 668 vs 667) 🟡 cosmetic, a convention split from the 13 untouched cards, no content missed. ADR-023: 669-681 (last non-blank 680, same one-blank convention) 🟢. ADR-024: 682-694, last non-blank 694, "Quick map" at 696 🟢.

## Fix for the red

One cell: `ADR-010` Source `144-157` → `144-161` (or `144-162` on the branch's minus-one convention). And the script should compare the end too, or criterion 6 keeps passing on a wrong end: after `start=...`, read `end` from the row, compute `next` as the first `^## ` line after `head` and require `end` between the last non-blank line and `next - 1`. Then the end-shift control above prints `range ADR-011 end 222, section ends 192`.

## Cell fidelity (unchanged since pass 1, re-read at 1ad1958)

| Record | Source | Card and index cells |
|---|---|---|
| ADR-010 | `decision-records.md:158` | 🟢 `persist.js` comment, `zipStore` in `src/ui/zip.mjs` not `makeZip` |
| ADR-013 | `:290` | 🟢 thirteen → fifteen, `UI-control`/`UI-widget` split off `ui`; nothing added |
| ADR-016 | `:394` | 🟢 three renames plus "Color Primitives" unchanged |
| LLD-muted-base | `lld-muted-base-key-spikes.md:220` | 🟢 `src/engine/resolve.mjs`, canvas + `derivePalette` |
| SITE-runbook | `go-live-runbook.md:32` | 🟢 four wired consumers, `hostedMcp` alone unwired and why |
| SITE-describe-palette | `describe-palette-spec.md:579` | 🟢 no-op skip → `exit 1`, key stays the user's action |

`decisions.md:33` and `:50` agree with the ADR-016 and SITE-runbook cells.

## Other cards under the amendment script

All 38 cards have a resolving `| Source |` row; the 24 ADR cards are read by their own section, the 14 others whole-file. Exactly six sources carry `Amendment (2026-09-16)` (`grep -rn` over `docs/`), all six flagged clean. Classes it cannot see: another date (the string is date-fixed); another marker shape; a cell that names the date but misstates the amendment (covered by the table above); a non-ADR `## ` heading between two ADR sections.

## Scope, wording, branding

Diff 29fc25b..1ad1958: 18 files, the six cards, twelve ADR range cells, `index.md`, the handoff. Raw scan of added lines: one em dash (inside the quoted source phrase `"settled — do not relitigate"` the SITE-describe-palette line already carried) and one bold label (the handoff quoting the `- **Amendment (date).**` marker shape); both are kept exceptions the wording script encodes, and it prints `0, 0`. No retired brand string.

## Would block a fresh pre-land read

| Item | State | Evidence |
|---|---|---|
| ADR-010 Source range excludes its own amendment | 🔴 | criterion 6 above |
| `card-source-range-check.sh` checks start only | 🟡 | end-shift control prints `0`; the criterion's own control (start shift) is the only thing it can fail on |
| twelve recomputed ends land on the blank line, thirteen untouched ends on the last content line | 🟡 | cosmetic; pick one convention when ADR-010 is fixed |

Blocking: 1.
