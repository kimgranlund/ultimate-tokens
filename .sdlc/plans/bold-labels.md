---
status: approved
ticket: #752
priority: P2
lane: docs (Markdown prose only; no `src/`, no `test/`, no `scripts/`, no generated file)
size: S + S + S (U1 S = 1 point, U2 S = 1, U3 S = 1; 3 points)
labels: kind:bug · size:S on #752 as minted; the plan stays size:S
written: 2026-09-26
head: fb84cc29 (`origin/main` at writing; `plan/bold-labels` is cut from it)
measured-at: fb84cc29, in the planner's own worktree at `/private/tmp/claude-501/bold-labels-plan`, 2026-09-26
depends: U1 and U2 start now (none of their files sits inside an active plan's scope wall; the two hunks that share a file with an active plan are split by hunk, see Depends below). U3 waits for G1: plan prompt-audit (#758, PR #761) and plan docs-repair (#751, PR #753) both landed on `origin/main`, read by command (P0)
rulings: owner ruling R59 of 2026-09-26, relayed by the Conductor: fix #752 by enumeration with a count control; three customer-facing lines first
inputs: `gh issue view 752`; the rule-gates U4 pass 4 verdict (rows 18 and 19) and `.sdlc/plans/rule-gates-U4-rediagnosis.md` (the fifth-predicate case); PR #757, squash 37b04676, whose parent `37b04676^` is where each line's pre-sweep text was read; `.sdlc/adapter.md` §1 to §5; `.sdlc/plans/prompt-audit.md` and `plan/docs-repair`'s `.sdlc/plans/docs-repair.md` (their scope walls); the `ultimate-tokens-brand-voice` skill for the marketing lines
---

# Plan: bold-labels, the paragraph-start bold labels the em dash sweep turned into lists (#752)

## Summary

The rule-gates sweep (#730 U4, PR #757) replaced every em dash with the clause-join comma. A Markdown paragraph that opens with a bold label followed by the dash, with no bullet and no `> ` prefix, was neither R3's bullet label (colon) nor E4, so it took the comma and now reads as a list: `**Resources**, brand://kit ...`. This plan rewrites those lines by enumeration, one by one, and proves the fix by the ticket's own count: the predicate `^\s*\*\*[^*]+\*\*, ` over tracked `.md` files outside `.sdlc/` reads 85 today and reads exactly the 18 kept lines after, each kept line listed here with its read.

Three lines are customer-facing (`README.md`'s try-it-live line, `mcp/README.md`'s Resources and Prompt lines) and go first. The 32 store-copy field labels are one unit behind owner question Q1. The 7 lines inside prompt-audit's and docs-repair's scope walls are one unit behind G1.

## Measured by the planner on 2026-09-26 at fb84cc29

### The predicate today

```sh
git ls-files '*.md' | grep -v '^\.sdlc/' | xargs grep -cE '^[[:space:]]*\*\*[^*]+\*\*, ' | awk -F: '{s+=$2} END{print s}'
```

prints `85` (the ticket's 76 was read at the rule-gates U4 head; nine lines were added since by later plans). Splitting the 85 by what precedes the line: 65 open a paragraph (previous line blank, a heading, a table row or a rule) and 20 are a wrapped continuation line inside a paragraph or list item.

### What each line was before the sweep

Each hit's label was looked up in `git show 37b04676^:<file>`. 70 of the 85 carried the em dash right after the label; 12 already carried the comma at the label (a genuine appositive or list the sweep never touched there, though in three of them a dash later in the same line became a comma); 3 had no same-label line at the parent (two carried the dash inside the label itself, one was rewritten since). The full table is under Enumeration.

### The gates today

- `FORCE_COLOR=0 node test/repo/em-dash.mjs` prints `self-test: PASS` then `em-dash: clean (N files scanned)`, exit 0; N is the tracked-file count of the tree under test (799 on this branch at revision 2, 803 on `afeff6fb` in the checkability review), so a criterion reads the word `clean`, never N.
- `FORCE_COLOR=0 node test/repo/branding.mjs | tail -1` prints `branding: clean (N files scanned)` (791 here, 795 at `afeff6fb`), same rule.
- `node -e` over `test/run.mjs`'s `TESTS` prints `53`, so a green `npm test` ends `all 53 test files passed`.
- `FORCE_COLOR=0 node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs docs/marketing/store-copy.md` prints nothing, exit 0.

### Overlap with the active plans (read from each plan's scope wall and each PR's `--name-only` diff)

| Plan | Files it may change that this plan touches | Ruling |
|---|---|---|
| prompt-audit (#758, PR #761) | `.claude/skills/geometry-system/{SKILL.md,references/foundations.md}`, `.claude/skills/type-scale/references/foundations.md`, `.claude/skills/maintaining-brand-kit-mcp/SKILL.md`, `.claude/skills/adding-semantic-roles/SKILL.md` (its U6 and U7 rewrite whole skill bodies); `plugin/ultimate-tokens/skills/typography-tokens/references/prose.md` (kept here, no edit) | gate: U3 starts after #761 lands (G1). Not in its wall: `plugin/ultimate-tokens/skills/color-tokens/references/{interactive,containers}.md`, `plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md`, `.claude/skills/shipping-changes/references/best-practices.md` (its wall names `shipping-changes/{SKILL.md,references/rubric.md}` only), `mcp/README.md` (its Not-in-scope table says the README repeats none of the text U3 rewrites) |
| docs-repair (#751, PR #753) | `docs/reference/references/ui-plan.md` (two lines here); `README.md` (its U7 inserts one section before `## License`) | gate for `ui-plan.md`: U3 after #753 lands (G1). Split by hunk for `README.md`: this plan's one hunk is line 6 of the file, docs-repair's is a new section near the end; PR #753's diff does not touch `README.md` today. Not in its wall: `docs/reference/CHANGELOG.md`, `docs/reference/typography/README.md`, `docs/reference/reviews/**`, `docs/reference/references/decision-records.md`, `docs/site/**`, `docs/marketing/**` |
| anchor-gaps (#740, PR #762) | `CHANGELOG.md`, its one hunk is `@@ -8,6 +8,19 @@` | split by hunk: this plan's `CHANGELOG.md` hunk is the Settings-modal entry near line 609, 590 lines below |
| records-gates (#741 and others, PR #759), cache-docs (#750, PR #760), chroma-floor (#701) | no file in common with this plan's wall (`gh pr diff --name-only` on each open PR, and the plan branches diffed against `origin/main`) | none |

## Enumeration

Every hit of the predicate at fb84cc29, with its pre-sweep text, its unit, and its replacement. Line numbers are the planner's orientation at fb84cc29 only; the needle a builder or verifier greps for is the bold label (R10). `edit` means the line loses the `**label**, ` shape; `kept` means the comma is a genuine appositive or clause join and the line stays a predicate hit, its read given.

Replacement rule, applied per line: a colon when the remainder is a definition, a value or a list (`**Resources**: brand://kit ...`); a period when the remainder is a full sentence of its own and the label already carries punctuation; a rewrite when neither reads (each rewrite's text is given in full below). No em dash, and no added bold label.

### U1: customer-facing and internal lines outside every active wall (31 lines, 12 files)

| # | file:line | label | was | replacement |
|---|---|---|---|---|
| 1 | `README.md:6` | `**▶ [Try it live](...)**` | dash | colon: `**▶ [Try it live](https://kimgranlund.github.io/ultimate-tokens/)**: the dependency-free,` |
| 2 | `mcp/README.md:47` | `**Resources**` | dash | colon |
| 3 | `mcp/README.md:64` | `**Prompt**` | dash | colon |
| 4 | `docs/site/mcp-hosting-spec.md:224` | `**KV**` | dash | colon |
| 5 | `docs/marketing/voice/voice-platform.md:153` | `**Layer 2, judged axes**` | `**Layer 2 [dash] judged axes**, scored 1–5.` (the dash was inside the label; the comma after it is original) | rewrite the label to `**Layer 2, the judged axes**, scored 1–5.` so the label's own comma is an apposition and the trailing clause reads as the score; stays a predicate hit, counted under kept (row K1) |
| 6 | `docs/reference/typography/README.md:29` | `**2026-07-13, size is now a FIXED, hand-authored table**` | `**2026-07-13 [dash] size is now ...**, not a modular scale` (dash inside the label; comma original) | rewrite the label to `**2026-07-13: size is now a FIXED, hand-authored table**, not a modular scale:`; stays a predicate hit, counted under kept (row K2) |
| 7 to 18 | `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md:18,23,29,35,39,43,45,47,51,53,55,57` | `**Color**`, `**Typography**`, `**Geometry**`, `**B1 [HIGH, confirmed]**`, `**B2 [MEDIUM]**`, `**B4 [LOW]**`, `**B5 [confirmed non-issue]**`, `**B6 [LOW, content drift not data-flow]**`, `**C1 [the core finding]**`, `**C2 [minor]**`, `**C3 [verified clean]**`, `**C4 [non-issue]**` | dash, all twelve | colon, all twelve (a review record; the finding id is the label, the remainder is its statement) |
| 19, 20 | `plugin/ultimate-tokens/skills/color-tokens/references/containers.md:15,26` | `` **`-surface-low…high` (mirrored)** ``, `` **`-surface-dim…bright` (mode-consistent)** `` | dash | colon |
| 21 to 25 | `plugin/ultimate-tokens/skills/color-tokens/references/interactive.md:9,18,30,39,42` | `**Filled (primary CTA)**`, `**Tonal / soft (secondary emphasis)**`, `**Outlined**`, `**Ghost / text button**`, `**Destructive**` | dash | colon |
| 26 to 28 | `plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md:43,53,57` | `**Button (text + optional icon)**`, `**Input / select field**`, `**Toggle / checkbox / radio**` | dash | colon |
| 29 | `.claude/skills/shipping-changes/references/best-practices.md:83` | `` **`npm test`** `` (a wrapped continuation: `... make the change,` ends the line above) | dash | rewrite: `run **\`npm test\`**; its commit body literally records \`npm test 10/10\`, with **no \`npm run build\`** needed. The` (the word `run` joins the imperative list above it; the semicolon holds the sentence) |
| 30 | `CHANGELOG.md:609` | `**Primary accent**` (a wrapped continuation of a bullet ending `First controls:`) | dash | colon: `**Primary accent**: \`Mode-specific · 550 / 450\` *(default)* vs \`Single · 500 / 500\` (one` (the bullet's own `First controls:` sits on the line above; the second colon is the value's, and the existing parenthetical stays as it is) |
| 31 | `docs/site/storage-and-sync-spec.md:60` | `**hosted-MCP use**, or **sign-in**` (a wrapped continuation inside SPEC-R2's bullet) | `or **sign-in** [dash] after which` | rewrite: `**hosted-MCP use**, or **sign-in**. After that trigger the device's docs replicate and stay replicated.`; the line still opens `**hosted-MCP use**, or` (the list's own comma), so it stays a predicate hit, counted under kept (row K18) |

Row 31 makes 31 lines; rows 5, 6 and 31 stay predicate hits after their rewrite, so U1 removes 28 hits and the three rewritten lines join the kept list as K1, K2 and K18. U1's own count check therefore expects the predicate to read `85 - 28 = 57` at its head, before U2 and U3.

### U2: the store-copy field labels (32 edits, 1 file; behind Q1)

`docs/marketing/store-copy.md` lines 30, 52, 58, 66, 75, 81, 87, 93, 99, 123, 129, 177, 182, 375, 417, 424, 428, 431, 435, 452, 464, 488, 505, 518, 540, 549, 558, 568, 581, 586, 595, 632. All 32 carried the dash before the sweep. Each is a field label (a Lemon Squeezy dashboard field or API attribute) followed by where the value goes, then a fenced block holding the value. They are genuinely fields, and a field label reads as a field with a colon: `` **`stores.attributes.name`**: store name ``. Colon on 31 of them. Line 30 (`**Placeholders**, replace before publishing:`) would end with two colons; rewrite it to `**Placeholders** to replace before publishing:`.

The brand-voice skill applies (`docs/marketing/` is its corpus): nothing in the 32 lines is customer copy (the copy is inside the fenced blocks, untouched), so no claim, price or pivot moves; `voice-check.mjs` on the file must still print nothing and exit 0 (U2-2). #748 (the voice reread of the swept store copy) is a separate chore and reads the file after this unit; this unit changes no fenced block, so #748's target text is the same before and after (U2-3).

### U3: the seven lines inside active walls (7 edits, 6 files; behind G1)

| # | file:line | label | was | replacement |
|---|---|---|---|---|
| 1 | `.claude/skills/geometry-system/SKILL.md:29` | `**Edge padding for a glyph = (height − glyph)/2**` | dash | colon |
| 2 | `.claude/skills/geometry-system/references/foundations.md:65` | `` **`gap` and only `gap`** `` (continuation: the line above ends `multiplies`) | dash | colon on the label's own line (`**\`gap\` and only \`gap\`**: \`gap = max(...)\``); `multiplies` stays the last word of the line above, so the file's line count holds (P5, U3-2) |
| 3 | `.claude/skills/type-scale/references/foundations.md:72` | `**The mono-alias groups**` | dash | colon |
| 4 | `.claude/skills/maintaining-brand-kit-mcp/SKILL.md:31` | `**(1) stdout is the protocol channel**` (continuation after `... still *looks* fine:`) | dash | colon |
| 5 | `.claude/skills/adding-semantic-roles/SKILL.md:64` | `**easy to miss**` (continuation inside a parenthetical: `(\`p.roles.length !== 53\`, **easy to miss**, it lives under \`ui/\`)`) | no same-label line at `37b04676^` (the paragraph was rewritten since) | colon: `**easy to miss**: it lives under \`ui/\`)` |
| 6, 7 | `docs/reference/references/ui-plan.md:106,119` | `**Analysis**`, `**Semantic**` | dash | colon |

If prompt-audit's U6 or U7 has already rewritten rows 1 to 5's paragraphs when G1 opens, the builder re-runs the predicate on those five files first; a row whose label no longer matches is reported `already gone` in the handoff and the unit's expected count drops by one per such row (U3-1 reads the count from the kept list, not from this table, for exactly that reason).

### Kept: the 18 lines the predicate still finds after the plan (each with its read)

| K | file:line | label | why kept |
|---|---|---|---|
| K1 | `docs/marketing/voice/voice-platform.md:153` | `**Layer 2, the judged axes**` | after U1 row 5: the comma after the label was original; `, scored 1–5.` is an appositive |
| K2 | `docs/reference/typography/README.md:29` | `**2026-07-13: size is now a FIXED, hand-authored table**` | after U1 row 6: `, not a modular scale` is the contrastive negation the sentence needs |
| K3 | `docs/reference/CHANGELOG.md:134` | `**All 288 travel hexes are now the exact render of their own oklch**` | comma pre-sweep; `, as are the 144 ...` is a clause join |
| K4 | `docs/reference/CHANGELOG.md:144` | `**7.159**` | dash pre-sweep, but the line is `max **7.159**, visible only because ...`, an appositive on a number inside a list of readings |
| K5 | `docs/reference/CHANGELOG.md:803` | `**plugin-free native-import cascade can be tested by hand**` | dash pre-sweep; `It exists so the **...**, the open OD-004 question.` is an appositive |
| K6 | `docs/reference/CHANGELOG.md:1145` | `**inlined**` | dash pre-sweep; `path data **inlined**, NOT a runtime CDN, because ...` reads as the contrast it is |
| K7 | `CHANGELOG.md:311` | `` **`ultimate-tokens-reviewer`** `` | comma pre-sweep; the line continues a list of two names |
| K8 | `CHANGELOG.md:322` | `**per plugin id**` | comma pre-sweep (the sweep's dash was later in the sentence) |
| K9 | `CHANGELOG.md:409` | `**1.125**` | comma pre-sweep; `heading **1.125**, body **1.5**.` is a pair of values |
| K10 | `README.md:59` | `**Config**` | comma pre-sweep; the line continues the export list `..., **Config**, and a **Download-all .zip**.` |
| K11 | `docs/marketing/voice/voice-platform.md:14` | `**"we"**` | comma pre-sweep; the line continues the sentence above it |
| K12 | `docs/reference/geometry/README.md:36` | `**one rule sampled six times**` | comma pre-sweep; `, and it generalizes ...` is a clause join |
| K13 | `docs/reference/references/decision-records.md:338` | `**repo README**` | comma pre-sweep; a list of places continues from the line above (an accepted ADR is append-only in any case, adapter §6) |
| K14 | `docs/reference/references/decision-records.md:547` | `**~20% larger before even adding an HTML shell**` | comma pre-sweep; `, and minifying ...` is a clause join (same ADR rule) |
| K15 | `docs/reference/reviews/2026-07-17-librarian.md:141` | `` **`family/voice/{voice}`** `` | dash pre-sweep; `gets **...**, the literal word "voice" inserted as a namespace segment` is an appositive |
| K16 | `docs/tickets/tkt-0007.md:122` | `**Neutral is derived**` | comma pre-sweep; `, not authored, so ...` is the contrast; `docs/tickets/` is an archive (CLAUDE.md) |
| K17 | `plugin/ultimate-tokens/skills/typography-tokens/references/prose.md:6` | `**sub-title**` | comma pre-sweep; the line continues the sentence above it (inside prompt-audit's wall, and untouched here) |
| K18 | `docs/site/storage-and-sync-spec.md:60` | `**hosted-MCP use**` | after U1 row 31: `the first **export**, **hosted-MCP use**, or **sign-in**` is a list; the sweep's dash sat after `sign-in` and is now a period |

Arithmetic: 85 hits today = 28 U1 removals + 32 U2 removals + 7 U3 removals + 18 kept. `28 + 32 + 7 + 18 = 85`.

## The design, stated once

A one-line-for-one-line edit of 70 Markdown lines, by hand, from this enumeration; no script sweeps, because the read decides the punctuation and a script cannot read. The count control is the ticket's predicate, and the kept list is the expected residue: a verifier does not trust the builder's "I fixed them all", it runs the predicate and diffs its output against the 18 kept rows. No new gate: the 18 legitimate hits would need a grandfather list, which rule-gates refused for the em dash (owner ruling, sweep then gate at zero), and this construct has no zero to gate at.

Prose rules for every line this plan adds. No em dash anywhere (`test/repo/em-dash.mjs` is inside `npm test` and scans `.sdlc/` too). No added bold inline label. The retired maker brand and the pre-rename element identifier are paraphrased, never written (`test/repo/branding.mjs`). Criteria needles are labels, ids, strings and counts, never line numbers (R10). `/usr/bin/grep` is BSD with no `-P`; PCRE runs through `perl -CSD`. The shell is zsh, so a command that needs a pipe's exit code runs under `bash -c 'set -o pipefail; ...'`. Node probes run with `FORCE_COLOR=0`.

## G1: have #761 and #753 landed (U3's step 1, and the Orchestrator's before it cuts the U3 worktree)

```sh
gh pr view 761 --json state -q .state; gh pr view 753 --json state -q .state
git fetch origin && git merge-base --is-ancestor $(gh pr view 761 --json mergeCommit -q .mergeCommit.oid) origin/main && echo ancestor-761
git merge-base --is-ancestor $(gh pr view 753 --json mergeCommit -q .mergeCommit.oid) origin/main && echo ancestor-753
```

Green: both `MERGED`, then `ancestor-761` and `ancestor-753`. Today: `OPEN` twice, and the second and third commands print nothing (there is no merge commit to test). U3 is not cut until all four lines read green, and `plan/bold-labels` is rebased onto (or merged from) the `origin/main` that holds both squashes before U3 branches.

## Criteria (plan-level: each builder runs the rows its unit names, each verifier reruns them, pre-land runs them all)

`B=$(git merge-base origin/main HEAD)` in every row, run at the repo root of the worktree under test.

| id | criterion | command | expected | negative control | today (fb84cc29) |
|---|---|---|---|---|---|
| P0 | G1 read by command before U3 | the four G1 lines | `MERGED`, `MERGED`, `ancestor-761`, `ancestor-753` | today's reading is the control: `OPEN`, `OPEN`, nothing, nothing | `OPEN` `OPEN` |
| P1 | the count control: the predicate finds exactly the kept list | `git ls-files '*.md' \| grep -v '^\.sdlc/' \| xargs grep -HnE '^[[:space:]]*\*\*[^*]+\*\*, ' \| perl -CSD -ne 'print "$1\t$2\n" if /^([^:]+):\d+:\s*(\*\*[^*]+\*\*), /' \| sort > "$CLAUDE_JOB_DIR/tmp/bl-hits.txt"; wc -l < "$CLAUDE_JOB_DIR/tmp/bl-hits.txt"; diff <(sort .sdlc/plans/bold-labels-kept.tsv) "$CLAUDE_JOB_DIR/tmp/bl-hits.txt" && echo kept-exact` | at pre-land: `18` then `kept-exact`. At U1's head: `57` (U1 only). At U2's head on top of U1: `25`. The `.tsv` is the Kept table's file and label columns, tab-separated, written by U1 and reread by every later unit | in a scratch copy (`cp -R` the tree to `$CLAUDE_JOB_DIR/tmp/bl-ctl`), append `**Probe**, a planted line` to `README.md`, rerun: the count is one higher and `diff` prints a `>` line for `README.md	**Probe**`, no `kept-exact` | `85`; no `.tsv` yet, so `diff` reports the missing file |
| P2 | no em dash added, and the gate stays green | `bash -c 'set -o pipefail; FORCE_COLOR=0 node test/repo/em-dash.mjs \| tail -1'; git diff "$B" \| grep -c "^+.*$(printf '\xe2\x80\x94')"` | `em-dash: clean (N files scanned)` exit 0, then `0` | in the scratch copy, append a line carrying `$(printf '\xe2\x80\x94')` to `mcp/README.md` and rerun the gate: it reds and names `mcp/README.md`; the grep prints `1` | `em-dash: clean (798 files scanned)`, `0` |
| P3 | branding clean, and no bold label was added | `FORCE_COLOR=0 node test/repo/branding.mjs \| tail -1; git diff "$B" -U0 -- ':!.sdlc' \| grep -E '^\+' \| grep -vE '^\+\+\+' \| grep -cE '^\+[[:space:]]*\*\*[^*]+\*\*'; git diff "$B" -U0 -- ':!.sdlc' \| grep -E '^-' \| grep -vE '^---' \| grep -cE '^-[[:space:]]*\*\*[^*]+\*\*'` | `branding: clean (N files scanned)`; then the added count equals the removed count minus one (every added bold-label line replaces a removed one, except U1 row 29, whose new line opens with `run ` and so leaves the added count only) | in the scratch copy add a new line `**Planted**: text` in any walled file: the added count now equals the removed count (one above the `removed minus one` the row expects); on an empty diff the same plant reads added `1`, removed `0` | `branding: clean (791 files scanned)`; `0` and `0` |
| P4 | scope wall, file by file | `git diff --name-only "$B" \| grep -v -E -e '^README\.md$' -e '^mcp/README\.md$' -e '^CHANGELOG\.md$' -e '^docs/site/(mcp-hosting-spec\|storage-and-sync-spec)\.md$' -e '^docs/marketing/voice/voice-platform\.md$' -e '^docs/marketing/store-copy\.md$' -e '^docs/reference/typography/README\.md$' -e '^docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers\.md$' -e '^docs/reference/references/ui-plan\.md$' -e '^plugin/ultimate-tokens/skills/color-tokens/references/(containers\|interactive)\.md$' -e '^plugin/ultimate-tokens/skills/geometry-tokens/references/controls\.md$' -e '^\.claude/skills/shipping-changes/references/best-practices\.md$' -e '^\.claude/skills/geometry-system/(SKILL\.md\|references/foundations\.md)$' -e '^\.claude/skills/type-scale/references/foundations\.md$' -e '^\.claude/skills/maintaining-brand-kit-mcp/SKILL\.md$' -e '^\.claude/skills/adding-semantic-roles/SKILL\.md$' -e '^\.sdlc/plans/bold-labels(\.md\|-kept\.tsv)$' -e '^\.sdlc/(handoffs\|verdicts\|reviews\|questions)/bold-labels' -e '^\.sdlc/board\.md$' -e '^src/ui/mcp-assets\.js$' -e '^figma/plugin/ui\.html$' \| wc -l; git diff --name-only "$B" -- src test scripts figma 'mcp/*.mjs' package.json package-lock.json \| wc -l` | `0` then `0`. The wall is these 19 prose files, this plan, its kept list, its records and the board; nothing under `src/`, `test/`, `scripts/`, `figma/`, no MCP source, no generated file except `src/ui/mcp-assets.js` and `figma/plugin/ui.html`, which `npm test` regenerates deterministically because `mcp/README.md` is bundled (revision 3); on a unit that edits `mcp/README.md` the second count reads `1` (`figma/plugin/ui.html`), otherwise `0` | in the scratch copy, `touch docs/spec/planted.md && git add -N docs/spec/planted.md`: the first count reads `1` | `0` and `0` (the branch is at `origin/main`) |
| P5 | line-for-line: every file's insertions equal its deletions | `git diff --numstat "$B" -- ':!.sdlc' \| awk '$1 != $2 {print "UNEQUAL", $0; bad=1} END {exit bad+0}' && echo line-for-line` | `line-for-line` (each edited line is replaced by one line; row 30's rewrite keeps the parenthetical on its two existing lines; row 31's period keeps its one line) | in the scratch copy split any edited line in two: `UNEQUAL` names the file and the command exits 1 | `line-for-line` (empty diff) |
| P6 | `npm test` green on the head, tree clean after | `npm test 2>&1 \| tail -1; git status --short \| wc -l` (quiet-host rule, adapter §1) | `all 53 test files passed`, `0` | the adapter's baseline control in a throwaway clone made from the unit's own commit (`sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json; npm test`: exit 1, `engine/semantic.mjs` fails, `refs-canonical` is the failing gate; record the `grep -c FAIL` count measured) | `all 53 test files passed` (baseline: 80 to 89 s) |
| P7 | the three customer-facing lines read as ruled | `grep -c '^\*\*▶ \[Try it live\](https://kimgranlund.github.io/ultimate-tokens/)\*\*: the dependency-free,' README.md; grep -c '^\*\*Resources\*\*: `brand://kit`' mcp/README.md; grep -c '^\*\*Prompt\*\*: `apply_brand`' mcp/README.md` | `1`, `1`, `1` | on `origin/main` today the same three greps print `0`, `0`, `0` | `0`, `0`, `0` |
| P8 | the customer-facing README keeps its hero rule: the try-it-live line still links the live build | `grep -c 'https://kimgranlund.github.io/ultimate-tokens/' README.md` | the same count as at `$B` (`git show "$B":README.md \| grep -c 'https://kimgranlund.github.io/ultimate-tokens/'`) | in the scratch copy drop the URL from line 6: the head count is one lower than the base count | equal (the diff is empty) |

## Units

- [~] U1 (S) the 31 lines outside every active wall, and the kept list file · builder-l1 · reviewer-l1 · verifier-l1
- [x] U2 (S) the 32 store-copy field labels · builder-l1 · reviewer-l1 · verifier-l1 (starts after Q1 is answered; parallel with U1 in its own worktree, both branch from `plan/bold-labels`)
- [ ] U3 (S) the seven lines inside the prompt-audit and docs-repair walls · builder-l1 · reviewer-l1 · verifier-l1 (starts after G1; last unit, so pre-land runs on its head)

Grades: every unit is a hand edit of prose from an enumeration with a count control, the floor of the ladder (`agent-writing-rules` §Model tiering); the reviewer's job is the read of each line against the rule, which l1 does with the table in hand. Points: 1 each, 3 total.

### U1: outside every wall (31 lines, 12 files, plus `.sdlc/plans/bold-labels-kept.tsv`)

Steps. (1) Write `.sdlc/plans/bold-labels-kept.tsv` from the Kept table: 18 rows, `path<TAB>**label**`, using K1's, K2's and K18's post-rewrite labels. (2) Rows 1 to 31 of the U1 table, each by hand, rereading the paragraph after the edit. (3) P1 (expecting `57`; `diff` will still list U2's and U3's 39 hits as `>` lines, so at U1's head the row's `kept-exact` is not expected and the `57` is the check), P2, P3, P4, P5, P6, P7, P8. (4) Handoff: the per-line table with the punctuation chosen, and any row where the builder chose a period or a rewrite over the table's colon, with its read.

| id | criterion | command | expected | negative control |
|---|---|---|---|---|
| U1-1 | the 28 removals and the three rewrites landed (31 removed lines), nothing else in those files | `git diff "$B" -U0 -- ':!.sdlc' \| grep -cE '^-[[:space:]]*\*\*[^*]+\*\*, '; git diff "$B" -U0 -- ':!.sdlc' \| grep -cE '^\+[[:space:]]*\*\*[^*]+\*\*, '` | `31` then `3` (the three are K1, K2 and K18, rewritten lines that still open with a label and a comma) | forget row 31 (`storage-and-sync-spec.md`): the first count reads `30` |
| U1-2 | the kept list is the 18 rows and only those | `wc -l < .sdlc/plans/bold-labels-kept.tsv; cut -f1 .sdlc/plans/bold-labels-kept.tsv \| sort -u \| wc -l` | `18`, `11` (eleven distinct files across the Kept table; revision 3) | drop K17: `17`, `10` |
| U1-3 | the twelve review-record labels all took the colon | `grep -cE '^\*\*(Color\|Typography\|Geometry\|B1 \[HIGH, confirmed\]\|B2 \[MEDIUM\]\|B4 \[LOW\]\|B5 \[confirmed non-issue\]\|B6 \[LOW, content drift not data-flow\]\|C1 \[the core finding\]\|C2 \[minor\]\|C3 \[verified clean\]\|C4 \[non-issue\])\*\*: ' docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md` | `12` | today `0` |
| U1-4 | the ten consumer-plugin reference labels took the colon | `grep -chE '^\*\*[^*]+\*\*: ' plugin/ultimate-tokens/skills/color-tokens/references/containers.md plugin/ultimate-tokens/skills/color-tokens/references/interactive.md plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md \| paste -sd+ - \| bc` | today's sum plus `10` (measure today's sum first with the same command at `$B`: `git show "$B":<file>` piped in, per file) | today's sum unchanged means the rows were skipped |
| U1-5 | the plugin skill parity gates still pass (the references are read by `test/plugin/*`) | `npm test 2>&1 \| grep -cE '^▶ plugin/(color\|typography\|geometry)-tokens\.mjs +pass'` | `3`, the runner's per-file `▶ ... pass` line (revision 4) for `plugin/color-tokens.mjs`, `plugin/typography-tokens.mjs` and `plugin/geometry-tokens.mjs` (`test/run.mjs` prints `✓ all 53 test files passed` only when every file passed, so P6 is the floor and this row names the three files) | none beyond P6's control: a punctuation edit cannot move a parity count, and if it does the runner names the file |

### U2: the store-copy field labels (32 lines, one file; behind Q1)

Steps. (1) Q1 answered yes (the default if the owner is silent by the time U1 verifies, see Owner questions). (2) The 32 lines: colon on 31, the `**Placeholders** to replace before publishing:` rewrite on line 30. (3) P1 (expecting `25` with U1 merged into `plan/bold-labels` first, or `53` on a branch cut before U1 merged; the handoff says which), P2, P3, P4, P5, P6. (4) Handoff with the list of the 32 labels as edited.

| id | criterion | command | expected | negative control |
|---|---|---|---|---|
| U2-1 | 32 hits removed from the one file, none added | `git diff "$B" -U0 -- docs/marketing/store-copy.md \| grep -cE '^-\*\*[^*]+\*\*, '; git diff "$B" -U0 -- docs/marketing/store-copy.md \| grep -cE '^\+\*\*[^*]+\*\*, '; grep -cE '^\*\*[^*]+\*\*, ' docs/marketing/store-copy.md` | `32`, `0`, `0` | skip line 632: `31`, `0`, `1` |
| U2-2 | voice-check still silent and green | `FORCE_COLOR=0 node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs docs/marketing/store-copy.md; echo exit=$?` | no output line before `exit=0` | in the scratch copy append `, leverage it` to one of the 32 label lines, outside any fence (voice-check skips fenced code): `✗ docs/marketing/store-copy.md:52 ERROR: banned lexicon: "leverage"` and `exit=1`, measured by the planner at revision 2 |
| U2-3 | no fenced block changed (the copy #748 will reread is byte-identical) | `diff <(git show "$B":docs/marketing/store-copy.md \| awk '/^```/{f=!f; next} f') <(awk '/^```/{f=!f; next} f' docs/marketing/store-copy.md) && echo blocks-identical` | `blocks-identical` | change one character inside any fenced block: `diff` prints it and no `blocks-identical` |
| U2-4 | the Placeholders line reads as ruled | `grep -c '^\*\*Placeholders\*\* to replace before publishing:$' docs/marketing/store-copy.md` | `1` | today `0` |

### U3: inside the walls (7 lines, 6 files; behind G1)

Steps. (1) G1 green by command; `plan/bold-labels` carries the `origin/main` that holds #761 and #753. (2) Rerun the predicate on the six files; any label already gone is reported and dropped. (3) The rows of the U3 table. (4) P1 (expecting `18` and `kept-exact`), P2 to P6, then the pre-land pass on this head.

| id | criterion | command | expected | negative control |
|---|---|---|---|---|
| U3-1 | the residue is the kept list exactly | P1's command | `18`, `kept-exact` | P1's control |
| U3-2 | the five skill lines took the colon and the two ui-plan lines took the colon | `grep -c '^\*\*Edge padding for a glyph = (height − glyph)/2\*\*: ' .claude/skills/geometry-system/SKILL.md; grep -c 'multiplies$' .claude/skills/geometry-system/references/foundations.md; grep -cE '^\*\*`gap` and only `gap`\*\*: ' .claude/skills/geometry-system/references/foundations.md; grep -c '^\*\*The mono-alias groups\*\*: ' .claude/skills/type-scale/references/foundations.md; grep -c '^\*\*(1) stdout is the protocol channel\*\*: ' .claude/skills/maintaining-brand-kit-mcp/SKILL.md; grep -c '\*\*easy to miss\*\*: it lives under' .claude/skills/adding-semantic-roles/SKILL.md; grep -cE '^\*\*(Analysis\|Semantic)\*\*: ' docs/reference/references/ui-plan.md` | `1`, `1`, `1`, `1`, `1`, `1`, `2`, minus any row prompt-audit already removed (named in the handoff, with the `git log -1 --format=%h -S'<label>' -- <file>` that shows which commit changed it) | today every count but the second reads `0` (the second, `multiplies$`, reads `1` today and must stay `1`: the colon goes on the label's own line, not the one above) |
| U3-3 | the skills still load as skills: frontmatter untouched | `for f in .claude/skills/geometry-system/SKILL.md .claude/skills/maintaining-brand-kit-mcp/SKILL.md .claude/skills/adding-semantic-roles/SKILL.md; do git diff "$B" -U0 -- "$f" \| grep -cE '^[-+](name\|description):'; done` | `0` three times | edit a `description:` line: `1` |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| Bullet-list bold labels (`- **Label**, text`) and blockquote labels | R3 of the rule-gates sweep gave them the colon already; the ticket's predicate excludes the bullet and `> ` prefixes by construction | none; the rule-gates U4 verdict grades them |
| `.sdlc/**` lines matching the predicate | the ticket says outside `.sdlc/`; records there are paraphrased history and R9 forbids a records ticket for them | fixed in place by whichever PR next touches each record (R9) |
| A `bold-label` gate in `test/repo/` | 18 legitimate hits remain; a gate needs a grandfather list, which the owner refused for the em dash (sweep then gate at zero) | Q2 records the choice; a future planner can revisit if the count grows |
| The voice reread of the swept store copy | #748, a chore of its own; this plan changes no fenced block (U2-3), so its target is the same text | #748 |
| The wrapped continuation lines kept as K4 to K6 and K15, whose dash became a comma mid-sentence | each reads as an appositive after the sweep; rewriting them would be taste, not repair | none |
| Line numbers cited in other records for the edited files | a one-for-one replacement (P5) moves no line number | none |

## Risks

- A builder "helpfully" reflows a paragraph after the edit. P5 catches it (insertions must equal deletions per file) and the handoff explains any rewrite row.
- The kept list is a plan artifact under `.sdlc/plans/`, and the P1 `diff` is only as good as the list. U1-2 pins its row count and its distinct-file count; a verifier also spot-reads three kept rows against the Enumeration's reads.
- prompt-audit U6/U7 rewrite the same skill files U3 edits. The gate (G1) and step 2 of U3 handle the ordering; if a label is already gone, the count expectation moves down and the handoff says so. If prompt-audit instead lands a colon on one of these lines, U3's own diff shrinks and P1 still reads `17`.
- docs-repair's U7 inserts a `README.md` section; U1 edits line 6 of the same file. A squash of either does not conflict with the other's hunk (600 lines apart); if #753 lands first, `plan/bold-labels` merges `origin/main` before U3 and P8's base count is re-read.
- The customer-facing colon in `README.md:6` is on the marketing hero line. The brand-voice skill's pivot rule is about the em-dash glyph, not the colon, and `voice-check.mjs` is not run on `README.md` today; the line's claim, link and words are unchanged (P7, P8).

## Landing

One PR from `plan/bold-labels`, title `docs(prose): paragraph-start bold labels take a colon after the em dash sweep (#752)`, body from the pre-land verdict table per adapter §2.1. Draft PR after U1 verifies; final landing after U3 and the pre-land pair (`bold-labels-prepr-reviewer`, reviewer-l4; `bold-labels-prepr-verifier`, verifier-l3) write `.sdlc/verdicts/bold-labels-prepr.md` with `verdict: 🟢` at the head sha. The prose-only diff regenerates nothing, so `.sdlc/baseline.md`'s `ref` moves only per adapter §5 step 5 (the landing changed files outside `.sdlc/`, so the close-out re-runs `npm test` under the quiet-host rule and sets `ref` to the squash sha). Close #752 with `adapter.py close 752 --reason .sdlc/verdicts/bold-labels-prepr.md`.

## Owner questions

| Q | question | recommendation |
|---|---|---|
| Q1 | The 32 store-copy field labels: fix them here with the colon (U2), or leave them to #748's voice reread? | Fix here. They are field labels, and a field label with a colon is the shape the rest of the file already uses for its bullets (`- **Pro**: **$39 / year**`). #748 reads the copy inside the fenced blocks, which U2 does not touch (U2-3 proves it byte for byte). If the owner is silent when U1 verifies, U2 proceeds on this recommendation and the handoff says so. |
| Q2 | Add a `bold-label` predicate to the repo gates so the construct cannot come back? | No. 18 legitimate lines remain (the Kept table), so a gate would need a grandfather list, which the owner refused for the em dash. The count control in this plan is the check of record; if a later plan drives the kept count to zero, that plan gates it. |
| Q3 | K4 to K6 and K15 (`docs/reference/CHANGELOG.md` and the librarian review): dash pre-sweep, kept here because each reads as an appositive. Rewrite them anyway for uniformity? | Keep. Each reads correctly as written, and a changelog is a dated record; a rewrite there is taste, not repair. |

## Revisions

| date | change | trigger |
|---|---|---|
| 2026-09-26 | written, status draft, at fb84cc29 | owner ruling R59 relayed by the Conductor |
| 2026-09-26 | revision 2: the checkability review of 571dad87 folded (18 green, 8 yellow, 1 red). U2-2's control moved outside the fence and re-measured; P1 writes under `$CLAUDE_JOB_DIR/tmp`; P3 restricted to `':!.sdlc'` and its control restated; P4's pathspec quoted; P2/P3 today cells re-read; U3 row 2 keeps `multiplies` on its own line; U1 step 3 and U1-1 counts aligned; U1-5 names its pass string | `/private/tmp/claude-501/bold-labels-checkability.md` |
| 2026-09-28 | revision 3: U1-2 reads `18`, `11`, since the Kept table spans eleven distinct files and the old `12` contradicted its own `drop K17` control; P4 admits `src/ui/mcp-assets.js` and `figma/plugin/ui.html`, regenerated by `npm test` from the bundled `mcp/README.md` | bl-U1 builder handoff at bfb7e4b2, confirmed by `cut -f1 \| sort -u` on the kept list and the Kept table |
| 2026-09-28 | revision 4: U1-5's grep reads the runner's real per-file line, `▶ plugin/<name>-tokens.mjs  pass`; the old `^✓` form read `0` on a green run | bl-U1 review at fa0b11dd |
