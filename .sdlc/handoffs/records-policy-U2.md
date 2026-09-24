# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rp-U2, text commits ef4a977f and a4b1ecf2 (previous builder, reviewed and kept unchanged), this handoff on top |
| Files | `docs/reference/references/decision-records.md` (ADR-027 section at lines 770-816, Quick map row appended; 49 lines added, 0 removed) · `.sdlc/records/cards/ADR-025.md`, `ADR-026.md`, `ADR-027.md` (new) · `.sdlc/records/index.md` and `.sdlc/records/decisions.md` (three rows each) · this handoff |
| Ran | every U2 row and P1 to P4 in this worktree, each with its negative control in a `git clone -q --shared` scratch clone; all green, every control bit (tables below) |
| Left out | nothing in scope. Three plan-text notes for the Orchestrator under Findings |

G0: `git fetch origin; git show origin/main:docs/reference/references/decision-records.md | grep -c '^## ADR-026 '` printed 1 at origin/main 2a1cd5c802a0cf4396caf630b5a9358d16cb32d6 (rerun by this builder on 2026-09-23; `grep -c '^## ADR-027 '` at the same sha printed 0, so the number is free).

## Review of the previous builder's commits

The previous session left no handoff, so its commits were read as a lead and checked against the plan and the ADR text at this head, not taken on trust.

| Checked | Result |
|---|---|
| ADR-027 text against the plan's paste text | every grepped needle present on one line; wording tightened in one place: the #718 parenthetical reads "a time check that passes only while the superseded figure stays first in its cell" instead of the plan's paraphrase, which matches #718's own title (`gh issue view 718`: "baseline-agrees-check.sh's time check cannot fail: it reads only the first range in a gate cell"). Kept |
| ADR-025 and ADR-026 cards against their ADR sections (lines 696-728, 730-768) | Decision, Forces, Rejected and Consequences condensed from the ADR text itself; 025's Rejected names the two alternatives its Context and Rationale measured; 026's names "fitting harder" from its Context |
| Card `Source` ranges | first line is the heading (U2-6), last line is the Status paragraph's last line, next line blank: 728, 768, 816 checked by `sed -n` |
| Index and ledger rows | 025 `decided (#662)` 2026-09-18, 026 `decided (#681)` 2026-09-20, dates from each ADR's Status line; 027 `proposed`, lineage names adapter §1's Ran-row rule, #718 and #719 |

## Unit rows

`B=$(git merge-base plan/records-policy HEAD)` = `2ab7ec420a68313d7097b967ce2b784586d78a50`. HEAD at run time a4b1ecf2cff44af2cd172e8bfd182883f321ada4 (the text commits; this handoff adds no line any U2 row reads except U2-8).

| Id | Evidence (printed) | Expected | State | Negative control result (printed) |
|---|---|---|---|---|
| U2-1 | `## ADR-026 - ## ADR-027 - ## Quick map `, `0` (also `0` at the P-row base 62524831) | same | 🟢 | line 296 (`---`) deleted: `1`. Section moved after the Quick map: `## ADR-026 - ## Quick map ## ADR-027 - ` |
| U2-2 | `1`, `0` | `1`, `0` | 🟢 | heading rewritten with U+2014: `0`, `1` |
| U2-3 | `1`, `1`, `1`, `1` | `1`, `1`, `1`, `1` or more | 🟢 | rule (3) reworded to "is noted", its `(3)` removed: `1`, `0`, `1`, `1` |
| U2-3b | `1`, `1` | `1`, `1` | 🟢 | the rule (4) lines deleted: `0`, `0` |
| U2-4 | `1`, `0` | `1`, `0` | 🟢 | Status written `DECIDED 2026-09-22 (#721`: `1`, `1` |
| U2-5 | `1`, `3`, `3`, `3` | `1`, `3`, `3`, `3` | 🟢 | the file, index and ledger restored from origin/main and the three cards removed: `0`, three `ls` errors and `0`, `0`, `0` |
| U2-6 | `## ADR-025 `, `## ADR-026 `, `## ADR-027 ` | same | 🟢 | ADR-025's card range set to ADR-024's `682-694`: `## ADR-024 `, `## ADR-026 `, `## ADR-027 ` |
| U2-7 | `3`, `1`, `0`, `2` | `1` or more, `1`, `0`, `2` | 🟢 | 027 card and index row copied from ADR-024's: `0`, `0`, `1` (swapping only the row printed `3`, `0`, `1`: the first figure reads the card, so the control has to copy both) |
| U2-8 | `2` (the G0 line, and this row, which quotes the control line with its sha) | `1` or more | 🟢 | the line `G0: ADR-026 heading seen; ran on 20260922` piped through the filter: `0`; a line ending `printed 1 at origin/main 2a1cd5c8`: `1` |

## Plan-level rows, run here for information; the pre-land verifier reruns them

`B=$(git merge-base origin/main HEAD)` = `625248316db62d7ed55947507c7300161db29f31`.

| Id | Evidence (printed) | Expected | State | Negative control result (printed) |
|---|---|---|---|---|
| P1 | `npm test` exit 0 in 599 s, `✓ all 49 test files passed`, then `0` | `✓ all 49 test files passed` (`.sdlc/baseline.md` line 19), `0` | 🟢 | leading `//` of the `minor` comment line replaced with `/*`: `npm test` exit 1, `SyntaxError: Invalid or unexpected token` from `node scripts/gen-adia-derived-exports.mjs`, the first pre-step; no `test files passed` line |
| P2 | `branding: clean (649 files scanned)`, `0` | clean, `0` | 🟢 | one added card line with U+2014: `1`. A card row naming the retired maker (built at run time from a lowercase string, never typed here): `FAIL: 1 branding violation(s) across 649 files`, exit 1 |
| P3 | `0`, `0` | `0`, `0` | 🟢 | fixture `src/engine/exports.js` plus `.sdlc/records/cards/ADR-027.md` through the filter: `1` |
| P4 | `0`, `0` | `0`, `0` | 🟢 | one artifact row bumped `1.2.0` to `1.2.1` and regenerated: `1`; committed in the scratch clone: `2` |

Tree after every run: `git status --short | wc -l` printed `0` in this worktree. Scratch clones were under `$CLAUDE_JOB_DIR/tmp` (a root-checkout fixture hook blocks a scratch commit under `$TMPDIR` whose cwd resolves to the root checkout).

## Findings for the Orchestrator

| Finding | Where |
|---|---|
| P4's control names `version: "1.1.0"`; #681 moved both artifacts to `1.2.0`, so the plan's literal plant matches nothing and prints `0`. Run at the live string it bites as the plan says | plan, P4 negative control |
| U2-7's control reads "a 027 row copied from ADR-024's"; the row alone leaves the first figure at `3` because it greps the card. The card has to be copied too | plan, U2-7 negative control |
| `npm test` took 599 s here, one second under the Bash tool's 600 s ceiling; a slower host would time the tool out before the suite finishes | P1 |
