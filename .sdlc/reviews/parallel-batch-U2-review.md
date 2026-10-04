FAIL

# parallel-batch U2 review (reviewer, #783 outside citations)

| Field | Value |
|---|---|
| Unit | U2, branch `unit/pb-U2` @ `72d57335` (code `1d2f65c1`), base `61bcd123` |
| Criteria | plan `### U2` and `### U2 criteria` (C2.1 to C2.5), wave A brief |
| Verdict | 🔴 FAIL: two of the four adapter pitfalls state the wrong mechanism (F1, F2). The code half is 🟢 and needs no rework |
| Rework | rewrite two sentences of the new adapter §1 bullet (suggested text under F1 and F2), fix the matching Claims rows, re-run the `ran` block |

## Findings, by severity

1. 🔴 Major, `.sdlc/adapter.md` new bullet, pitfall 4 is inverted. The bullet says a comment-stripped diff "hides a comment rewrap" and prescribes reading the plain diff once. The source says the opposite: `sed 's|//.*$||'` leaves one whitespace-only line per comment line, so a legitimate rewrap that adds or drops a line reads nonzero, a false red (`.sdlc/verdicts/gates-batch-checkability.md:135`, `gates-batch-U2.md:46`, `docs-stale-batch-checkability.md:73`). Measured here in scratch: a rewrap-only edit reads `2` under the strip, `0` once whitespace-only lines are dropped on both sides; a code change reads `4`. Reading the plain diff once does not fix the false red. Suggested text: "A comment-stripped diff (`sed 's|//.*$||'`) leaves one whitespace-only line per comment line, so a legitimate comment rewrap that adds or drops a line reads nonzero, a false red: drop whitespace-only lines on both sides (`grep -v '^[[:space:]]*$'`). The strip is also blind to a code edit after a `//` inside a string (`"http://..."`)."
2. 🔴 Major, same bullet, pitfall 3 names the wrong mechanism. The bullet says to avoid `origin/main` because it "carries other plans' commits the unit did not touch", which is the two-dot `origin/main..HEAD` hazard. The pitfall #783 recorded is the merge-base form: `git merge-base origin/main HEAD` on a plan branch is the plan's fork point, so the list also carries files from earlier units already merged into the plan branch (`gates-batch-U4.md:47`: U4-8's list carried U1's `citations.mjs`, plan, handoff and review). That merge-base form is what plans write (`.sdlc/plans/archive/gates-batch.md:80`, C5), and the bullet's reasoning does not cover it, so a planner using it would read the rule as satisfied. Measured today: two-dot lists 6 files against 5 (one main-only commit, `96363ae8`); the merge-base form equals the unit-base list only because no wave A unit has merged yet. Suggested text: "On a plan branch, list a unit's files against the unit base (the commit its worktree was cut from, `git merge-base plan/<slug> HEAD`): `git merge-base origin/main HEAD` returns the plan's fork point, so its list also carries files from earlier units already merged into the plan branch."
3. 🟡 Minor, pitfall 2 wording. "the bare label text also appears in comments and in the plan" is wrong: a single-file `grep -c` cannot count the plan. The measured fault was comment prose in the same file (`gates-batch-U4.md:27`: `3` at base). The pre-land verdict also notes the anchor needs a prefix-tolerant form, `name: ".*<words>`, because labels carry `E1 `/`E2 ` (`gates-batch-prepr.md:86`). Drop "and in the plan" and add the prefix-tolerant form.
4. 🟡 Minor, pitfall 1 wording. `.gitattributes` line 11 reads `linguist-generated -diff`; `diff: unset` is what `git check-attr diff` prints. The mechanism itself holds (row below). Suggest "`.gitattributes` `-diff` (line 11; `git check-attr` reads `diff: unset`)", which keeps the C2.4 needle.
5. 🟡 Minor, handoff. The C2.1 replacement grep `MAP\.GEOMETRY_FIELD_RENAME_MAP` covers only `binder.mjs`'s alias; `live-diff.mjs:7`, `migrations.mjs:12` and `mode-apply.mjs:5` import the module as `A`. Nothing reads it (checked below), so the result stands; the command was too narrow to show it.
6. ⚪ Info. The Claims rows for pitfalls 3 and 4 have their needles present, so C2.5 passes mechanically while the claims are wrong. A needle-presence ledger cannot catch an inverted claim; this review read each one against its source.

## Criteria

| Id | Result | Evidence |
|---|---|---|
| C2.1 | 🟢 code; 🟡 plan text | `grep -rn GEOMETRY_FIELD_RENAME_MAP figma/binder/mode-apply-plan.mjs` prints nothing at head, 1 export at base. No reader: `git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan"` and `git grep -nE "\b(MAP\|A)\.GEOMETRY_FIELD_RENAME_MAP"` both exit 1 at head and base. The deleted header comment's content (the `font` exclusion) is still in `migrations.mjs:101-116`, where `code.js:1747` and `plugin.mjs:2030,2076,2084` point. `figma/README.md:26` names only the three gated mirrors, so no record goes stale |
| C2.2 | 🟢 | `self-test: PASS`; grep count `1`. My control (clone of `72d57335`, `rev-parse` `72d57335`, file edited in place): drop `"'"` from `:346` (`enclosingStringContent`): exit 1, `✗ E1 single-quoted heading: matched R8, expected R2s`. Drop it from `:229` (`insideStringAt`) only: exit 0, `self-test: PASS` |
| C2.3 | 🟢 | clone at `61bcd123`: `--fix` prints `R8 0`, `git diff --stat -- src/engine/ds-export.js \| wc -l` = `0`, gate `clean (1171 files scanned)`. No hand edit needed, as the handoff says |
| C2.4 | 🟢 mechanically, 🔴 in content | slice count `4`, baseline `ok    head:` count `1`. Content: F1 to F4 |
| C2.5 | 🟢 | `git diff --name-only 61bcd123..HEAD`: `.sdlc/adapter.md`, `.sdlc/handoffs/parallel-batch-U2.md`, `figma/binder/mode-apply-plan.mjs`, `figma/plugin/ui.html`, `test/repo/em-dash.mjs`. All in the lane plus the regenerated bundle (`app.js`, `apply-gate.js` and `drawer.js` import the planner, so `ui.html` shrinks). Every needle greps. The `ran` block, rerun at `1d2f65c1`, matches `out` byte for byte |

## Pitfalls as measured

| Pitfall | Result | Measured |
|---|---|---|
| 1 `code.js` under `-diff` | 🟢 mechanism, 🟡 wording F4 | at `30c3a7aa`: plain diff prints `Binary files ... differ`, `--numstat` `-	-`, `--stat` `Bin 54952 -> 55065 bytes`; `--text` prints 9 `+`/`-` lines |
| 2 anchor on `name: "` | 🟡 F3 | the rule is right; "in the plan" is not |
| 3 unit base | 🔴 F2 | the rule is right; the stated reason describes a different hazard |
| 4 comment rewrap | 🔴 F1 | inverted: the strip reds a rewrap; it does not hide one |

## Builder's three plan-text mismatches

| Mismatch | Judgment | Plan correction |
|---|---|---|
| C2.1 second grep is file-level | 🟡 Holds. At head and base it prints `test/figma/plugin.mjs` and `test/figma/binder.mjs`, which import the map from `migrations.mjs`. "Both print nothing" cannot pass, and the Today cell "0 importers" did not come from that command | Yes: replace with `git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan" -- figma src scripts test; git grep -nE "\b(MAP\|A)\.GEOMETRY_FIELD_RENAME_MAP" -- figma src scripts test` (both exit 1 at head and base) |
| two quote-list loops, `:229` and `:346` | 🟡 Holds, measured above: only `:346` reds the fixture | Yes, small: C2.2's control should name `enclosingStringContent` (`em-dash.mjs:346`) |
| `diff: unset` prints `Binary files` | ⚪ The measurement holds, but the plan never says the diff "prints nothing". `parallel-batch.md:59` reads "`--text` for `code.js` diffs under `.gitattributes` `diff: unset`", and #783 says "vacuous", which matches the `Binary files` reading | No |

## Gates

| Gate | Result |
|---|---|
| `npm test` | 🟢 `✓ all 54 test files passed`, exit 0, `NODE_OPTIONS` unset, probe count `4` (polled down from 6); tree clean after |
| `em-dash.mjs`, `branding.mjs` | 🟢 clean; no U+2014 in the diff |
| `.claude/docs/other` | 🟢 absent from the diff |
