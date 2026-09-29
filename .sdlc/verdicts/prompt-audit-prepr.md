---
kind: verdict
plan: prompt-audit
seat: verifier
pass: 1
ticket: "#758"
written: 2026-09-29
---

# Pre-PR · prompt-audit · pass 1 · 🟡 at `7ff8177c`: every gate, pin and unit row holds, but three false voice claims stay in prompt files the audit edited and the whole-doc needle gap has no follow-up

Closes #758

verdict: 🟡
sha: 7ff8177cb129166919aa4380c5d53adc9f2d6ef7

`plan/prompt-audit` at `7ff8177c` (= `origin/plan/prompt-audit`), merging main at `cc5be9be` (R71). `git merge-tree --write-tree a1bac484 cc5be9be` gives tree `b9ca6a43`, the head's own tree. Draft PR #761, OPEN on this sha. `$B` = `cc5be9be` for plan rows and U1 to U8, pre-plan main `5cfd2b08` for the U9 controls.

Checkers: fable is capped on this host, so reviewer-l3 and verifier-l2 stand in for reviewer-l4 and verifier-l3 under `.sdlc/questions/seat-reliability-approval.md`. Three fresh-context runs: plan rows plus U1 to U5, U6 to U10, and a whole-diff review. The seat re-read the three voice lines, `docs/reference/SKILL.md:76`, `.sdlc/baseline.md:30`, CI and the issue search itself.

### Yellow

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| H1 | prompt files the plan touched state no false engine fact | 🟡 | `.claude/skills/type-scale/references/foundations.md:20` `returns the THIRTEEN voices` (engine: `voice-parity PASS ... (15 voices ...)`); `.claude/skills/type-scale/SKILL.md:30` `` steps` is always the uniform SM/MD/LG ramp `` (false for UI-control and UI-widget, `VOICE_STEPS`); `.claude/skills/adding-export-formats/references/foundations.md:96` `` `make7` builds `` (`git grep -n make7 7ff8177c -- src mcp scripts` prints nothing). All three predate the plan (present at `cc5be9be`) and sit in files U6 and U7 edited; none is in voice-parity's file list | the sibling `type-scale/SKILL.md` carries the pinned `fifteen voices`, and changing it to `thirteen` reds voice-parity (`voice count drift, engine has 15`), so a pinned copy of the same fact fails where these three do not |
| H2 | the new doc-side fact pins catch a stale count | 🟡 | `test/repo/citations.mjs` whole-doc needles: a flip of every copy reds (`exit 1 ✗=1 ... doc no longer carries \`fifteen voices\``), but one stale site beside a true one passes (`a-mixed exit 0 ✗=0`; `eight colour formats` added beside `ten`, exit 0). `gh issue list --state all --search "needle in:title,body"` prints `[]`: no follow-up | at U9's parent `1099acd3` the same five global flips each print `exit 0 ✗=0`, so the pins do bite on a full flip |
| SA7 | U8's applied rows are applied | 🟡 | `docs/reference/SKILL.md:76` still reads `the six capability cells are now **validated**`; evidence row `prompt-audit-evidence.md:55` names that clause and the U8 handoff records SA7 `applied`. The plan's U8 step scopes SA7 to the count history, so it is a scope ambiguity, not a line the plan wrote | `git diff cc5be9be 7ff8177c -- docs/reference/SKILL.md` leaves line 76 untouched while the `count grew from 27` clause is gone |
| BL | baseline row agrees with its own cause | 🟡 | `.sdlc/baseline.md:30` figure `4137.0 KB` (checker: `ok    ui.html: baseline 4137.0 KB, tree 4137.0 KB`, `stale total: 0`), cause text still `re-measured after chroma-floor U5's tonal.js comment repair`; the move happened at prompt-audit U3 and U9 (`:359`, `:365`). The `:359` U3 paragraph is undated and sits above an older paragraph | the KB set back to `4130.3` prints `STALE ui.html: baseline 4130.3 KB, tree 4137.0 KB`, `stale total: 1` |
| PT | plan rows are re-runnable as written | 🟡 | P5 formula `ids + F rows` fails for U1 (`11` vs `15`) and U7 (`27` vs `33`), whose F rows carry no state cell; every id still prints `1`. U8-1 Today expects `bad 1`, both sides print `bad 0`. U9-3 control `the same edits at $B are green` is false for (a) and (b) (`exit 1 ✗=1` at `5cfd2b08`). U6-10 prints `0 0 0` at the head by construction, `1 1 1` at `ef2115bb` | a U6 handoff copy with SB14 deleted prints `0` and `39`; DD32 restored prints `QUOTE DD32: not found at .claude/CLAUDE.md:30`, `bad 1` |

### Green

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| P0 | gates G0, G1 read by command | 🟢 | `grep -c '"repo/em-dash.mjs"'` = `1`, `grep -c FACT_PINS` = `3` on origin/main; #751 `CLOSED` | the same greps at `61225d0c` print `0` and `0` |
| P1 | `npm test` green, no node_modules, N = 54, tree clean | 🟢 | fresh clone: `✓ all 54 test files passed`, exit 0, 128 s; `git status --short \| wc -l` = `0`; `ok    tests: baseline 54, test/run.mjs TESTS 54` | `"scrim` renamed in `role-table.json`: `▶ engine/semantic.mjs FAIL`, exit 1 |
| P2 | `npm run build` green, tree clean, baseline agrees | 🟢 | after `npm ci`: exit 0, `wrote figma/plugin/ui.html 4137.0 KB`, status `0`, `stale total: 0` | baseline KB `4130.3`: `stale total: 1` |
| P3 | branding and em-dash clean | 🟢 | `branding: clean (947 files scanned)`, `em-dash: clean (955 files scanned)`, added-line glyph count `0` | a copied ADR file under `.sdlc/verdicts/` gives `FAIL: 3 branding violation(s)`; one appended glyph gives `FAIL: 1 em dashes` |
| P4 | scope wall, architecture rows DD10/DD32/DD56 only | 🟢 | wall filter over 90 files `0`, forbidden dirs `0`, architecture leg `0` | six-name fixture `3`; a DD11 edit `2`; a `tonal.js` line `1` |
| P5f | every finding has a recorded fate | 🟢 | every id prints `1`: U1 11, U3 13, U4 4, U5 3, U6 22, U7 27, U8 6 | SB14 deleted from a U6 copy prints `0` |
| P6 | no history id or line pin added to a prompt file | 🟢 | added `0`, removed `41` | `+the rule (TKT-0010)` through the filter `1` |
| P7 | evidence copy is what its header says | 🟢 | `0`, `0`, `2`; `board.py ids .sdlc` exit 0 | appended `R1` row: `R1 defined in a plan file`, exit 1 |
| U1 | U1-1 to U1-13 | 🟢 | voice count `15`, `Steps` cell per row, law 6 default, box voices `Kicker,UI-control,UI-widget`, the three parity gates `PASS` exit 0 | at `$B` each needle reverses (`3`, `1`, `0`, `0` for U1-1); a `3xl` step reds voice-parity, exit 1 |
| U2 | U2-1 to U2-5 | 🟢 | `voice-parity PASS ... (15 voices ...)`, wrapper `8` control lines, onColorMode default pinned, typed-number needle `0` | the U1-parent skill under the head script: `voice count drift, engine has 15`, exit 1; tonal.js default `"fixed"` reds, exit 1 |
| U3 | U3-1 to U3-8 | 🟢 | instructions derived from `TOOLS`, `missing 0` input descriptions, guide names every voice, `describe-rubric PASS`, `#fff` distance `0` | static instructions restored: exit 1; `Sub-title` deleted: `missing: Sub-title`, exit 1; `$B` brand-kit-core: `nearest_token("#fff")` distance `72`, exit 1 |
| U4 | U4-1 to U4-3 | 🟢 | `describe-eval PASS`, no-key skip, research note count `1` | `}}}` appended: `check 1`; note re-appended: `2` |
| U5 | U5-1 to U5-3 | 🟢 | `0`, `0`, `1`, `1`; `type.slots` forbidden agrees with `scripts/gen-categories.mjs:384` | at `$B`: `2`, `2`; a `description:` edit prints `2` |
| U6 | U6-1 to U6-9 | 🟢 | geometry laws `0 2 0 1 1 1`, count recipes `24 278 64 278 6` with `\b` count `0`, history ids `0` in five skills | at `$B`: `4 0 3 0 1 1`; `\b` recipe fixture `1` |
| U7 | U7-1 to U7-12 | 🟢 | MCP skill `0 1 1 1 0 1 1 1`, CI jobs `1 1 1 1`, SC ids resolve with no `NOMATCH` | at `$B`: `3 0 0 0 1 1 1 1`; SC31 and SC32 swapped: `NOMATCH SC31` |
| U8 | U8-1, U8-3 | 🟢 | `rows 56 drifted 11 holds 45 undetermined 0 bad 0` at head and `$B`, CLAUDE.md `117` lines; setter home `0 1 1 1 1` | blank line: `118`, `bad 21`; brace path: `symbol homes: 27 checked, 2 stale` |
| U9 | U9-1, U9-5, and U9-2 to U9-4 as written | 🟢 | `✓ citations: ... + 11 fact pins (HEAD 7ff8177c)`, `symbol homes: 27 checked, 0 stale`, floor 999 reds; bare filenames tracked as #775 | `.claude/skills` from `5cfd2b08`: `symbol homes: 14 checked, 6 stale`; `FORMAT_GROUPS` re-homed: exit 1 |
| U10 | U10-1 to U10-6 | 🟢 | `## The fourteen roles`, `fourteen named voices` and `Label` added each exit 1; wrapper `8` lines | unmodified copy `exit 0`; the added `["SKILL.md", BOLD]` entry removed: `plugin FAIL`, exit 1 |
| CI | required jobs on the exact head | 🟢 | `gh pr view 761` rollup: `build-test SUCCESS`, `panda-smoke SUCCESS`, `corpus-contrast SUCCESS`, seven `sweeps (...) SUCCESS` | a red job would print `FAILURE` in the same rollup; `deploy SKIPPED` is not required |

### Findings

1. 🟡 H1 is what holds this record below 🟢. The plan's purpose is removing false engine facts from prompt files, and three stay in files it edited: `THIRTEEN voices`, `steps` always SM/MD/LG, and `make7`. The plan did not write them, so they are not 🔴. 🟢 needs each line corrected, or a filed issue the plan names.
2. 🟡 H2: file a follow-up for the whole-doc needle gap (a stale count beside a true one passes). #775 covers bare filenames only.
3. 🟡 SA7: `docs/reference/SKILL.md:76` `now` remains while the handoff says applied. Cut the word or record SA7 as amended.
4. 🟡 BL and PT: plan and baseline text, landable as is. Recommended in the same pass: `.sdlc/baseline.md:30` cause text, the `:359` date and order, and the P5, U8-1, U9-3 and U6-10 row text.
5. Note: `mcp/brand-kit-core.mjs` carries an `(M1)` finding id in a code comment. It is code, outside P6, and not model-facing.
6. Pass 2 needs only H1, H2 and SA7 re-read, plus a fresh P1, P3 and CI on the new head.
