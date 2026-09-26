---
kind: evidence
plan: prompt-audit
source: the prompt-cruft audit of 2026-09-25 (four auditor slices), copied in by the planner
copied: 2026-09-25 at 61225d0c
altered: every em dash in the auditor's text (173 of them) is written as `--`, so this record passes the em-dash gate `test/repo/em-dash.mjs` that plan rule-gates (#730) registers in `npm test`; the two findings tables whose first column was headed `#` (2 tables) are headed `Row` so `board.py ids` does not read a finding id such as `C1` or `M1` as a plan-owned definition. Nothing else was changed. The retired maker brand does not appear in the auditor's text, so nothing was paraphrased
status: proposals, not verified truth. Every hunk below was written by an auditor against 61225d0c; a builder re-checks each factual claim against the live tree before applying it, and the rewrite of the em dashes plus the rule-gates sweep mean most hunks no longer apply byte for byte (`.sdlc/plans/prompt-audit.md` measures how many). Slice A's findings table carries no ids; the plan names them SA1 to SA8 in table order, slice B's rows SB1 to SB26, slice C's rows SC1 to SC34, and slice D keeps the auditor's own ids
---

# Prompt audit: ultimate-tokens (2026-09-25)

## Assumptions (Step 0)
- Scope: the whole repo's prompt surface. That is .claude/CLAUDE.md, 3 repo agents, 14 repo skills, docs/reference/SKILL.md, the consumer plugin (1 agent, 3 skills, README), the MCP tool/instructions text in mcp/*-core.mjs, and one direct API call site (mcp/describe-eval-runner.mjs plus describe-rubric.mjs).
- Target model: Claude Opus 5.5 in Claude Code for skills, agents and MCP tools (this session's model). The eval runner targets Haiku 4.5, the model it names on purpose.
- Provider markers: the only API caller is Anthropic (raw fetch). There are no other providers.
- Nothing was applied. Every hunk below is a proposal.

## Totals
| Slice | Surface | Findings | High | Med | Low/flag |
|---|---|---|---|---|---|
| A | CLAUDE.md, agents, docs/reference/SKILL.md | 15 | 1 | 7 | 7 |
| B | skills: export-formats, semantic-roles, editor-sections, color-math, figma-migration, geometry, lemon-squeezy x2 | 26 | 12 | 11 | 3 |
| C | skills: brand-kit-mcp, figma-plugins, project-docs, shipping, type-scale, brand-voice | 34 | 9 | 18 | 7 |
| D | consumer plugin skills, MCP tool descriptions, eval runner | 33 | 12 | 15 | 6 |

Two kinds of finding dominate. Group 2, facts that have gone stale and no longer match the code, makes up most of the High findings. The other large group is history narratives that cite ticket or PR numbers in place of stating the rule. Group 1 pressure language is rare: most caps words carry a reason or a gate, and those are kept.


---

## Slice A: prompt-cruft audit

Scope: `.claude/CLAUDE.md`, `.claude/agents/change-reviewer-agent.md`, `.claude/agents/marketing-manager-agent.md`, `.claude/agents/palette-researcher-agent.md`, `plugin/ultimate-tokens/agents/token-integrator.md`, `docs/reference/SKILL.md`.
Target model: Claude Opus 5.5 in Claude Code (thinking always on, literal instruction-following, over-applies shouted emphasis).

Summary: 7 diffable findings (1 High, 6 Medium) plus 7 Low flags. Groups: 1a x1, 1d migration-relative x3, 2-history x2, 2-volatile/stale x2, plus flags. This slice is mostly clean. Agent `description:` fields ("Use PROACTIVELY", trigger phrases) are routing text and are kept. Reasoned prohibitions are kept: no-Bash for palette-researcher, read-only for change-reviewer, "no `Task` of its own" for token-integrator, "refuse dark patterns", and the privacy guard. Exact schema caps in palette-researcher (EXACTLY 6, SPACE-SEPARATED STRING) are format-sensitive contract text and are kept too.

Highest impact:
1. `docs/reference/SKILL.md:47` says "Twenty-seven" acceptance criteria. The contract block has 29, and line 73 of the same file says 29. The stale count contradicts its own contract.
2. `.claude/CLAUDE.md:49-53` routes bugs and features to Scribe's `/bug-report`/`/feature`, but lines 100-101 of the same file route them to `/file-bug`/`/file-feature`. The two duplicates disagree, and the Scribe commands are not in this session's skill roster. The paragraph also uses migration-relative wording ("now route", "used to").
3. `.claude/agents/marketing-manager-agent.md:24-26` uses "non-negotiable" and "no exceptions" pressure language. Opus 5.5 over-applies that register. The gate itself is load-bearing, and the rewrite keeps it.

Verified facts: `semanticRoles` = 53 and `role-table.json` roleTable = 53. The `html:` SVG attribute count is 6+3+3 = 12, matching CLAUDE.md. `voice-check.mjs`, `color-model-function.md`, `travel-palettes.md`, `intended-use.md`, `type-rubric.md`, `font-cuts.json` and the count-gate test files all exist. There are 8 category JSONs, not 7.

## Findings

| Location | Evidence | Pattern | Why obsolete | Confidence | Action |
|---|---|---|---|---|---|
| docs/reference/SKILL.md:47 | "**Acceptance criteria.** Twenty-seven checkable predicates" | 2-volatile specifics (stale count) | The contract block lists 29 criteria, and line 73 says "29/29 covered". A literal reader gets two counts for the same set. | High | rewrite: "Twenty-nine" |
| .claude/CLAUDE.md:49-53 | "Bugs/features/issues now route to **GitHub Issues** ... carry the machine-read fields the file frontmatter used to. Scribe's `/bug-report`/`/feature` read this ruling and mint issues. The file-ticket backlog was fully migrated 2026-07-17 (`TKT-0031`, Issues #325–#342)" | 1d migration-relative + 2-history + disagreeing duplicate (keep-list 8 exception) | "now"/"used to" describe a diff against a past state. The migration archaeology does not change the rule. The named commands disagree with line 100-101 (`/file-bug`, `/file-feature`), and no Scribe commands are installed (blame: cabd77b7, 2026-07-17). | Medium | rewrite (see diff) |
| .claude/CLAUDE.md:30 | "split out of `exports.js` at TKT-0015 -- undocumented elsewhere" | 2-history | The ticket ID where the file was split is archaeology. The live facts are that the file is undocumented elsewhere and not one of the 10 formats. | Medium | rewrite: drop the split clause |
| .claude/agents/marketing-manager-agent.md:24-26 | "## The non-negotiable loop ... Every piece, no exceptions:" | 1a pressure language | Opus 5.5 follows a stated loop without absolutes, and it over-applies shouted register. The next line already gives the real reason ("A draft you haven't gated is not a deliverable"). | Medium | rewrite: "## The loop" / "Every piece:" |
| .claude/agents/marketing-manager-agent.md:48-49 | "The store-copy's 53→59 role-count drift is the cautionary precedent." | 2-history | Incident narrative. The rule (update the fact sheet, then grep and fix every hit) is stated right above it. The "59" figure is also a stale number sitting in a fact-integrity agent (the live count is 53). | Medium | remove |
| .claude/agents/palette-researcher-agent.md:47,51 | "## Type mode (first-class since ADR-022 - registers, reasoned from the story)" / "`type.slots` is the RETIRED pre-2026-07-30 shape" | 1d migration-relative + 2-history (dated) | "since ADR-022" and "pre-2026-07-30" date the rule against a past schema. The current rule is to emit `registers` and never `slots`, and that is all the model needs. | Medium | rewrite (see diff) |
| docs/reference/SKILL.md:73-76 | "the count grew from 27 when `hpg-tonal-damping-curve` and `hpg-tonal-edge-hue` were folded into the tonal ticket" / "are now **validated**" | 2-history + 1d migration-relative | Change history of the count, plus "now". The current state (29/29, validated) is what the reader needs, and the CHANGELOG holds the provenance. | Medium | rewrite (see diff) |
| docs/reference/SKILL.md:212-214 | "keep the three implementations in parity (`rubrics/parity-checklist.md`)" | 2-duplicates that disagree | First Principle 4 (lines 187-194) calls the 3-implementation framing legacy packaging and says parity is structural in the single-source build. This line orders the reader to keep three implementations in parity. | Medium | rewrite (see diff) |
| .claude/CLAUDE.md:45 | "`docs/tickets/` -- the pre-2026-07-17 bug/feature archive" | 2-time-sensitive | Date-scoped description. It is harmless as an archive label. | Low | flag |
| .claude/agents/palette-researcher-agent.md:44 | "The 7 categories are the bar" | 2-volatile specifics | `docs/reference/colors/categories/` holds 8 JSONs. `brands.json` may be deliberately excluded as a preset, so this needs an owner to confirm. | Low | flag |
| .claude/agents/change-reviewer-agent.md:25 | "(ask which the user means if both exist)" | out of pattern set (subagent contract) | A dispatched subagent has no user channel. It should state which diff it reviewed, or review both. | Low | flag |
| .claude/agents/change-reviewer-agent.md:68-69 | "prefer a missed real defect over noise" | 1a/1c wording (literal reading) | A literal reader may take this as permission to drop real findings. It probably means precision over recall. | Low | flag |
| plugin/ultimate-tokens/agents/token-integrator.md:15,63 | "tools: ... Bash, Task" / "delegate via `Task`" | 2-volatile specifics | Claude Code's subagent tool is now `Agent`, with `Task` kept as an alias. This is a consumer plugin that runs on unknown host versions, so it may be intentional. | Low | flag |
| docs/reference/SKILL.md:35 (+ contract lines 112, 117) | "Output is a set of portable token artifacts (five export formats)" | 2-volatile specifics (disagreeing counts) | Line 113 and the reference map say "eight color formats", and CLAUDE.md says "10 documented color formats". The truth is unclear, and part of this text sits in the gate-read JSON contract. | Low | flag |
| docs/reference/SKILL.md:92,107 (contract block) | "Bridge FIDELITY is no longer a non-goal" / "(the prior 'zip / unzip -t' wording claimed a guarantee nothing produced or tested)" | 1d migration-relative + 2-history | These are relative/historical asides, but they sit inside the spec-quality gate's JSON contract. Leave them to the spec owner. | Low | flag |

## Proposed diff

```diff
--- a/docs/reference/SKILL.md
+++ b/docs/reference/SKILL.md
@@ -47,1 +47,1 @@
-**Acceptance criteria.** Twenty-seven checkable predicates, one contract criterion per
+**Acceptance criteria.** Twenty-nine checkable predicates, one contract criterion per
```

```diff
--- a/.claude/CLAUDE.md
+++ b/.claude/CLAUDE.md
@@ -49,5 +49,4 @@
-- **Git-native ticket backend (ADR-017).** Bugs/features/issues now route to **GitHub Issues**
-  (`gh issue create`), not new `docs/tickets/*.md` files -- labels `kind:bug`/`kind:feature` +
-  `size:small`/`size:big` carry the machine-read fields the file frontmatter used to. Scribe's
-  `/bug-report`/`/feature` read this ruling and mint issues. The file-ticket backlog was fully
-  migrated 2026-07-17 (`TKT-0031`, Issues #325–#342) -- `docs/tickets/` is archive only.
+- **Git-native ticket backend (ADR-017).** Bugs/features/issues go to **GitHub Issues**
+  (`gh issue create`, via `/file-bug`/`/file-feature`), never new `docs/tickets/*.md` files; labels
+  `kind:bug`/`kind:feature` + `size:small`/`size:big` carry the machine-read fields.
+  `docs/tickets/` is archive only.
```

```diff
--- a/.claude/CLAUDE.md
+++ b/.claude/CLAUDE.md
@@ -30,1 +30,1 @@
-  split out of `exports.js` at TKT-0015 -- undocumented elsewhere, not one of the 10) · `derive`/`tonal`/`hct`/`okhsl`.
+  undocumented elsewhere, not one of the 10) · `derive`/`tonal`/`hct`/`okhsl`.
```

```diff
--- a/.claude/agents/marketing-manager-agent.md
+++ b/.claude/agents/marketing-manager-agent.md
@@ -24,3 +24,3 @@
-## The non-negotiable loop (from the ultimate-tokens-brand-voice skill -- already loaded)
+## The loop (from the ultimate-tokens-brand-voice skill -- already loaded)
 
-Every piece, no exceptions: **name the surface** (its posture row) → **pick the stance** (one or two
+Every piece: **name the surface** (its posture row) → **pick the stance** (one or two
```

```diff
--- a/.claude/agents/marketing-manager-agent.md
+++ b/.claude/agents/marketing-manager-agent.md
@@ -47,3 +47,2 @@
 `grep -rn "<old value>" docs/marketing/` -- and fix every hit, plus the README's marketing
-prose and `index.html` meta descriptions if they carry the stale value. The store-copy's 53→59
-role-count drift is the cautionary precedent.
+prose and `index.html` meta descriptions if they carry the stale value.
```

```diff
--- a/.claude/agents/palette-researcher-agent.md
+++ b/.claude/agents/palette-researcher-agent.md
@@ -47,5 +47,5 @@
-## Type mode (first-class since ADR-022 - registers, reasoned from the story)
+## Type mode (registers, reasoned from the story; ADR-022)
 
 A palette's typography is a REGISTER declaration: `type.registers.{anthemic, contextual, functional,
 actionable, data}` (docs/reference/typography/intended-use.md Layer 3 - each register shapes its
-primary voice Display/Headline/Body/Label/Kicker; `type.slots` is the RETIRED pre-2026-07-30 shape).
+primary voice Display/Headline/Body/Label/Kicker; never emit `type.slots`, a retired shape).
```

```diff
--- a/docs/reference/SKILL.md
+++ b/docs/reference/SKILL.md
@@ -72,5 +72,4 @@
 diverges. `_entailment_check.py` proves the carving **covers** all criteria (the partial-order
-gate: **29/29 covered, 6 tickets** -- the count grew from 27 when `hpg-tonal-damping-curve` and
-`hpg-tonal-edge-hue` were folded into the tonal ticket); the council's entailment lens additionally
-pressure-tested intent-entailment. Full carving + the honest-maturity note in `references/decomposition.md`.
-The six child rubric cells **and** the six capability cells are now **validated**. Two further
+gate: **29/29 covered, 6 tickets**); the council's entailment lens additionally pressure-tested
+intent-entailment. Full carving + the honest-maturity note in `references/decomposition.md`.
+The six child rubric cells **and** the six capability cells are **validated**. Two further
```

```diff
--- a/docs/reference/SKILL.md
+++ b/docs/reference/SKILL.md
@@ -213,2 +213,3 @@
-2. Build from `data/role-table.json` (canonical) outward; keep the three implementations in
-   parity (`rubrics/parity-checklist.md`).
+2. Build from `data/role-table.json` (canonical) outward through the single-source engine; if a
+   second independent implementation ever ships, gate it with `rubrics/parity-checklist.md`
+   (First Principle 4).
```

---

## Prompt audit, slice B

Scope: `.claude/skills/{adding-export-formats, adding-semantic-roles, building-editor-sections, color-math, figma-file-migration, geometry-system, lemon-squeezy-api, lemon-squeezy-schemas}`, meaning each SKILL.md in full plus a signal grep over its `references/*.md`.
Target model: Claude Opus 5.5 inside Claude Code (thinking always on, follows instructions literally, over-applies shouted emphasis).

## Summary

- Group 1 (dated prompt text): 0 actionable. The caps words that do appear (`MUST set fill: none`, `must NEVER perturb tone`, `MUST stay the same length`, figma-file-migration's two "Prerequisite, no exceptions" lines) each carry an adjacent reason or a gate, so they fall under keep-list items 3 and 5. No think-step, scaffold, persona, or output-choreography text was found.
- Group 2 (brittle skill files): 21 findings.
  - 10 are volatile specifics that no longer match the code (High).
  - 11 are history narratives or migration-relative phrasing (Medium).
- Groups 3 and 4: not applicable. The lemon-squeezy pair came back clean. Its "look it up, never from memory" rules state their reason and carry a distillation date.
- Highest impact:
  1. **geometry-system says `caret = font` and `font ≈ √h`.** The code has caret on its own power law and font from the `CONTROL_FONT` table. The same SKILL.md contradicts itself 14 lines earlier.
  2. **geometry-system describes the bare edge as `h/2` and the gated field as `padding`.** In code the bare edge is `paddingWide = (h − caret)/2` and the gated field is `paddingNarrow`. The stale text is repeated across 3 reference files.
  3. **Four skills point at `src/ui/app.js` for symbols that moved on 2026-07-17** (TKT-0023, commit 85bc77de). `FORMAT_GROUPS`, `downloadAllZip`, the roles label, and the token-override setters now live in `overlays/drawer.js` and `sections/*.js`. adding-semantic-roles' count-literal list and its 37/49 stale-count grep also no longer match the tests.

## Findings

| Row | Location | Evidence (quoted) | Pattern | Why obsolete | Confidence | Action |
|---|---|---|---|---|---|---|
| 1 | geometry-system/SKILL.md:56-58 | "two tuned power laws of height -- `icon` (roundEven) and `font ≈ √h` (round), `caret = font`" | G2 volatile specifics | Wrong against the code. `src/engine/geometry.mjs:20-23,213-214` has `caret = round(3.5·h^0.39)`, which is its own law and "retired the old v4 'caret = font' rule". Font is `CONTROL_FONT[step]·bh/28`, which is not a power law. The same file says the opposite at :44 and :125, and a literal reader has to reconcile the two. | High | rewrite |
| 2 | geometry-system/SKILL.md:33-37 | "the slotless/bare-label edge `round(height/2)` … asserts `padding === (height − icon)/2` … inline pad = the slotless `h/2`" | G2 volatile specifics | Since TKT-0010 the bare edge is `paddingWide = (h − caret)/2` (geometry.mjs:207). The `.control-*` CSS uses `padding-inline: var(--…-padding-wide)` (:361). The gated field is `paddingNarrow` (test/engine/geometry.mjs:33), and no `padding` field exists any more. | High | rewrite |
| 3 | geometry-system/SKILL.md:139 | "`buildSize(rawHeight, density, fontOverride)` … `fontOverride` is the composition hook" | G2 volatile specifics | The actual signature is `buildSize(rawHeight, density, font, gap)` (geometry.mjs:211). Font and gap arrive pre-resolved from `geomScale`, and there is no `fontOverride` parameter. | High | rewrite |
| 4 | geometry-system/SKILL.md:191 | "The verifier asserts the law `padding === (height − icon)/2` **exactly**" | G2 volatile specifics | The field is `paddingNarrow`. Same drift as #2. | High | rewrite |
| 5 | geometry-system/references/foundations.md:54,132,169; best-practices.md:9,49,100; rubric.md:28 | "asserts `padding === (height − icon)/2`" / "inline pad = the slotless `h/2`" / "`sz.padding === …`" | G2 volatile specifics | Same stale field name and bare-edge formula as #2 and #4, repeated in the references. foundations.md:24 and :45 already state the correct `paddingWide`, so the file contradicts itself. | High | rewrite |
| 6 | adding-export-formats/SKILL.md:93,97 | "(`renderDrawer`'s `FORMAT_GROUPS` in `src/ui/app.js`)" / "(`downloadAllZip` in `src/ui/app.js`)" | G2 volatile specifics (hardcoded paths) | Both symbols now live only in `src/ui/overlays/drawer.js`. They moved in the TKT-0023 app.js decomposition (85bc77de, 2026-07-17), and the lines were written on 2026-07-01. | High | rewrite |
| 7 | adding-semantic-roles/SKILL.md:68 | "6. **`src/ui/app.js`** -- the Roles inspector label" | G2 volatile specifics | The label `"-- 53 semantic roles · light / dark refs"` is at `src/ui/sections/color.js:2250`. app.js has no such string. | High | rewrite |
| 8 | adding-semantic-roles/SKILL.md:60-65 | "`test/ui/headless-boot.mjs` (the `(s4)` `=== 53` Figma-Light role count)" | G2 volatile specifics | `(s4)` compares against the derived `ROLES`, so it holds no literal. The literal is now `(pst8)` (headless-boot.mjs:3222). The list also misses the 53 literals in `test/engine/exports.mjs:434,540,1482,2095` (panda, design-system). Because the list is enumerated, it fails silently. The step's own "grep the current count" is the part that still works. | High | rewrite |
| 9 | adding-semantic-roles/SKILL.md:99-101 | "`git grep -nE \"\b37\b\|\b49\b\" src test docs/reference \| grep -i role`" | G2 volatile specifics / 1d fossil | 37 and 49 are the counts from two role changes ago, and the command returns 0 hits today. The stale-count check has to use the count being replaced, which :81 already expresses as `<oldcount>`. | High | rewrite |
| 10 | building-editor-sections/SKILL.md:79-80 | "owned by `setTypeTokenOverride`/`setGeomTokenOverride` (`src/ui/app.js`)" | G2 volatile specifics | They are defined at `src/ui/sections/typography.js:420` and `src/ui/sections/geometry.js:41`. The move happened in TKT-0023, after these lines were written on 2026-07-01. | High | rewrite |
| 11 | adding-semantic-roles/references/foundations.md:86; rubric.md:14; best-practices.md:32 | "one UI label (`app.js:4046`)" / "CLAUDE.md, app.js:4046 label" / "the `src/ui/app.js` inspector label" | G2 volatile specifics (line-pinned path) | The label is at `sections/color.js:2250`. A line number is the most brittle kind of pin. | High | rewrite |
| 12 | adding-export-formats/references/foundations.md:116-117; best-practices.md:49 | "`model.mjs projectView` `exports[id]` (the UI-readable map, ~line 433) → `app.js renderDrawer FORMAT_GROUPS`" / "→ `app.js` drawer + `downloadAllZip`" | G2 volatile specifics | Same move as #6. The drawer is `overlays/drawer.js`, and "~line 433" is a line pin. | High | rewrite |
| 13 | adding-export-formats/SKILL.md:28-37 | "used to share a file with the 10 color formats above -- split out in TKT-0015 because … was undocumented drift risk for this skill's own '10 formats' claim … has no rubric of record in `docs/reference/` yet" | G2 history narrative; 1d migration-relative | The rule is only "ds-export.js is out of scope, don't add it to `exportAll`". The split story and the ticket number add nothing to the rule, and "yet" is a claim that goes stale. | Medium | rewrite |
| 14 | adding-export-formats/SKILL.md:116-122 | "Worked example: ticket #638's … bumped 2 → 3 … `test/mcp/brand-kit.mjs` pins … so the pair cannot split apart again, the gate a #638 review round added after the first bump landed without it." | G2 history narrative | Two current rules are buried in the archaeology: a bump also moves `MCP_BRAND_KIT_VERSION`, and a var()-leaf counts as a shape change. The "review round added after…" clause cites an incident as the rule's authority. | Medium | rewrite |
| 15 | adding-semantic-roles/SKILL.md:51-59 | "Since TKT-0019 this is GENERATED, not hand-typed … (in order, TKT-0027) … so a forgotten regenerate … now flags as" | 1d migration-relative; G2 history | "Since" and "now" describe a diff against an earlier state that the reader never saw. The rule still holds when stated in the present tense. | Medium | rewrite |
| 16 | color-math/SKILL.md:71-73 | "## The hue model is OKLCH-native (easy to miss -- changed #117 …)" / "is `\"oklch\"`, flipped from `\"cam16\"`." | 1d migration-relative | "Changed" and "flipped from" imply a phantom alternative. The current default (`hueSpace: "oklch"`, tonal.js:44) is the rule. | Medium | rewrite |
| 17 | color-math/SKILL.md:90-92 | "key on the exact float (#686); `tonal.js`'s `okhslLAt` has no cache at all (#738: a memo there was never load-bearing)" | G2 history narrative | The ticket citations and the "was never load-bearing" backstory add nothing to the determinism invariant. The invariant is that there are no caches outside `hct.js` and those key on the exact float. The facts were verified in hct.js:313,339 and tonal.js:926. | Medium | rewrite |
| 18 | color-math/SKILL.md:103-104 | "there is now exactly ONE damping multiplier. Since #681 U3 the per-stop multiplier is" | 1d migration-relative | "Now" and "since" frame the rule as a diff. The gate facts are correct: C7 checks 1 definition and 5 appearances (test/engine/tonal.mjs:1160-1161, 5 non-comment hits in tonal.js). Only the framing is dated. | Medium | rewrite |
| 19 | geometry-system/SKILL.md:42-44 | "TKT-0010 retired `font/2`) … (`caret` rides its OWN height law, `3.5·h^0.39` -- 2026-07-15, never `= font`" | 1d migration-relative; G2 history | Retirement notices and dates carry no rule. With #1 fixed, "never `= font`" protects against an alternative that the SKILL itself no longer states. | Medium | rewrite |
| 20 | geometry-system/SKILL.md:73-76 | "(owner ruling 2026-09-02, final: TWO earlier rulings -- a 7-name t-shirt mapping, then a 10-name t-shirt mapping -- were both superseded; the CSV's ten rows" | G2 history narrative | Superseded rulings are archaeology. A literal reader could weigh the dead t-shirt mappings as live options. | Medium | rewrite |
| 21 | geometry-system/SKILL.md:93-96 | "a real, live pattern before this fix, at FOUR call sites (`geomExampleCard`, `graphGeomCentering`, ds-export's …, and `mcp/png-swatch-board.mjs`'s …)" | G2 history narrative / recency trap | The rule is "use `sizeAnchor`" plus the reason (integer keys reorder). The list of already-fixed call sites is a historical incident. | Medium | rewrite |
| 22 | geometry-system/SKILL.md:124-126 | "TKT-0008 rerouted the join off the old UI/Label voice); … `gap` rides its own GAP_UNIT calibration (TKT-0010 -- no longer follows the font)." | 1d migration-relative | "Rerouted off the old" and "no longer" state a prior design instead of the current one. | Medium | rewrite |
| 23 | figma-file-migration/SKILL.md:100 | "(it happened during TKT-0013's BZZR leg)" | G2 history narrative (incident as authority) | The recovery rule already carries its own reason: a partial write with no readback is indistinguishable from no write. The incident parenthetical adds nothing. | Medium | remove |
| 24 | geometry-system/SKILL.md:62,66 | "INTRINSIC (#252/#253)" / "(#264)" | G2 incident IDs | These are bare issue pointers with no rule content. They cost little and do serve as look-up handles. | Low | flag |
| 25 | adding-semantic-roles/references/best-practices.md:89; adding-export-formats/references/best-practices.md:93 | "updated the `app.js` inspector label" / "5. **`app.js` drawer** -- added the …" | G2 volatile path inside a labeled worked walkthrough | Past-tense worked examples are kept under keep-list items 7 and 8. Only the file name is stale, and a reader following the walkthrough would look in the wrong file. | Low | flag |
| 26 | figma-file-migration/SKILL.md:31,35 | "**Prerequisite, no exceptions:** load `figma-use` …" | 1a pressure language (grep hit) | Kept. The line states its reason, and the Figma MCP server itself marks `figma-use` mandatory. Recorded here only to show that the grep hit was reviewed. | Low | flag (keep) |

Clean: lemon-squeezy-api, lemon-squeezy-schemas, building-editor-sections apart from #10, and the color-math invariants and anchor section, whose emphasis is reasoned and gate-backed.

## Proposed diff

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -55,4 +55,5 @@
 `SIZES = [XS 20, SM 24, MD 28, LG 36, XL 48, 2XL 64]` (heights) -- **two bands** at the MD|LG seam (compact `+4`
 linear below: 20·24·28, expressive `×4/3` geometric above: 36·48·64). The glyphs scale **sublinearly** (the
-optical correction): two tuned power laws of height -- `icon` (roundEven) and `font ≈ √h` (round), `caret =
-font` -- that reproduce the hand-tuned reference table to **±1px**: one rule sampled six times. `CANON_MD =
+optical correction): two tuned power laws of height -- `icon = 2.49·h^0.58` (roundEven) and `caret =
+3.5·h^0.39` (round) -- that reproduce the hand-tuned reference table to **±1px**: one rule sampled six times.
+`font` is not a power law: it is the ratified `CONTROL_FONT` row × `baseHeight/28` (or the composed UI-control voice, below). `CANON_MD =
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -33,5 +33,5 @@
-From that single rule fall out, mechanically: the slot pad `(height − icon)/2`, the slotless/bare-label edge
-`round(height/2)`, the icon-only **square** `minWidth = height`, and the **pill radius** `round(height/2)`. The
-`centering-law` block asserts `padding === (height − icon)/2` **exactly** (not a tolerance) for every size -- it
+From that single rule fall out, mechanically: the slot pad `paddingNarrow = (height − icon)/2`, the caret/bare
+edge `paddingWide = (height − caret)/2`, the icon-only **square** `minWidth = height`, and the **pill radius** `round(height/2)`. The
+`centering-law` block asserts `paddingNarrow === (height − icon)/2` **exactly** (not a tolerance) for every size -- it
 is a derivation, not a fit. The `.control-{size}` CSS utility **embodies** it (block-size lever, padding-block
-0, inline pad = the slotless `h/2`, pill radius).
+0, inline pad = `paddingWide`, pill radius).
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -139 +139 @@
-| `buildSize(rawHeight, density, fontOverride)` | one ramp row -- the LAW + the power law live here; `fontOverride` is the composition hook |
+| `buildSize(rawHeight, density, font, gap)` | one ramp row -- the LAW + the icon/caret power laws live here; `font` and `gap` arrive pre-resolved from `geomScale` (override → composition/calibration → fallback) |
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -191 +191 @@
-The verifier asserts the law `padding === (height − icon)/2` **exactly**, the power-law ramp (±1px vs the
+The verifier asserts the law `paddingNarrow === (height − icon)/2` **exactly**, the power-law ramp (±1px vs the
```

```diff
--- a/.claude/skills/geometry-system/references/foundations.md
+++ b/.claude/skills/geometry-system/references/foundations.md
@@ -54 +54 @@
-var(--size-{s}-radius)` (the pill). The test's `centering-law` block asserts `padding === (height − icon)/2`
+var(--size-{s}-radius)` (the pill). The test's `centering-law` block asserts `paddingNarrow === (height − icon)/2`
@@ -132 +132 @@
-centering law `padding === (height − icon)/2` **still holds on the composed scale**. The `composition` test
+centering law `paddingNarrow === (height − icon)/2` **still holds on the composed scale**. The `composition` test
@@ -169 +169 @@
-  size that **embodies the law** (block-size lever, `padding-block: 0`, inline pad = the slotless `h/2`, pill
+  size that **embodies the law** (block-size lever, `padding-block: 0`, inline pad = `paddingWide` = `(h − caret)/2`, pill
--- a/.claude/skills/geometry-system/references/best-practices.md
+++ b/.claude/skills/geometry-system/references/best-practices.md
@@ -9 +9 @@
-  asserts EXACT equality (`sz.padding === (sz.height - sz.icon)/2`), and the composition test re-asserts it on
+  asserts EXACT equality (`sz.paddingNarrow === (sz.height - sz.icon)/2`), and the composition test re-asserts it on
@@ -49 +49 @@
-  `composed.height === standalone.height && composed.padding === standalone.padding` for every step, **and** the
+  `composed.height === standalone.height && composed.paddingNarrow === standalone.paddingNarrow` for every step, **and** the
@@ -100 +100 @@
-   identical to the standalone scale**; the centering law `padding === (height − icon)/2` still holds on the
+   identical to the standalone scale**; the centering law `paddingNarrow === (height − icon)/2` still holds on the
--- a/.claude/skills/geometry-system/references/rubric.md
+++ b/.claude/skills/geometry-system/references/rubric.md
@@ -28 +28 @@
-violates `padding === (height − icon)/2`. Compare compact vs comfortable at the SAME height (frame must match)
+violates `paddingNarrow === (height − icon)/2`. Compare compact vs comfortable at the SAME height (frame must match)
```

```diff
--- a/.claude/skills/adding-export-formats/SKILL.md
+++ b/.claude/skills/adding-export-formats/SKILL.md
@@ -93 +93 @@
-4. **Wire the drawer tab** (`renderDrawer`'s `FORMAT_GROUPS` in `src/ui/app.js`): add `[id, "Label"]` to the
+4. **Wire the drawer tab** (`renderDrawer`'s `FORMAT_GROUPS` in `src/ui/overlays/drawer.js`): add `[id, "Label"]` to the
@@ -97 +97 @@
-5. **Add it to the Download-All zip** (`downloadAllZip` in `src/ui/app.js`): push `{ name: "folder/file.ext", data }`
+5. **Add it to the Download-All zip** (`downloadAllZip` in `src/ui/overlays/drawer.js`): push `{ name: "folder/file.ext", data }`
```

```diff
--- a/.claude/skills/adding-semantic-roles/SKILL.md
+++ b/.claude/skills/adding-semantic-roles/SKILL.md
@@ -68 +68 @@
-6. **`src/ui/app.js`** -- the Roles inspector label (the `"… semantic roles · light / dark refs"` string;
+6. **`src/ui/sections/color.js`** -- the Roles inspector label (the `"… semantic roles · light / dark refs"` string;
```

```diff
--- a/.claude/skills/adding-semantic-roles/SKILL.md
+++ b/.claude/skills/adding-semantic-roles/SKILL.md
@@ -60,6 +60,6 @@
-5. **Count-gate literals** (grep the current count -- `53` today): update every one --
-   `test/engine/semantic.mjs` (`ROLES.length !== 53`), `test/engine/exports.mjs` (`< 53 * enabledCount`),
-   `test/figma/binder.mjs` (`!== 53 * NAMES.length`), `test/figma/plugin.mjs` (the `53 roles ×…` failure
-   *message* -- `semExpect` itself is derived, not a literal), `test/ui/shell.mjs` (`p.roles.length !== 53`
-   -- **easy to miss**, it lives under `ui/`), `test/ui/headless-boot.mjs` (the `(s4)` `=== 53` Figma-Light
-   role count).
+5. **Count-gate literals** -- the list drifts, so find them rather than trusting one:
+   `git grep -nE "\b<oldcount>\b" test` and update every role-count hit (engine, figma, and `ui/` tests
+   alike; `test/ui/shell.mjs` is the one most often missed because it lives under `ui/`). Some tests
+   derive the count (`semExpect`, headless-boot's `ROLES`) and need no edit; failure *messages* that
+   name the count do.
```

```diff
--- a/.claude/skills/adding-semantic-roles/SKILL.md
+++ b/.claude/skills/adding-semantic-roles/SKILL.md
@@ -99,3 +99,3 @@
 most often `test/ui/shell.mjs`. Don't call it done until `npm test` is green AND
-`git grep -nE "\b37\b|\b49\b" src test docs/reference | grep -i role` shows only the intentional historical
+`git grep -nE "\b<oldcount>\b" src test docs/reference | grep -i role` shows only the intentional historical
 references.
```

```diff
--- a/.claude/skills/building-editor-sections/SKILL.md
+++ b/.claude/skills/building-editor-sections/SKILL.md
@@ -79,3 +79,3 @@
   - **Clamp in the live setters** to the persisted range -- the range literals are owned by
-    `setTypeTokenOverride`/`setGeomTokenOverride` (`src/ui/app.js`), mirroring persist's
+    `setTypeTokenOverride`/`setGeomTokenOverride` (`src/ui/sections/{typography,geometry}.js`), mirroring persist's
     `clampTokenOverrides`; an unclamped value diverges live-vs-persist and can yield negative geom padding.
```

```diff
--- a/.claude/skills/adding-semantic-roles/references/foundations.md
+++ b/.claude/skills/adding-semantic-roles/references/foundations.md
@@ -86 +86 @@
-- A scatter of **count literals** in tests + one UI label (`app.js:4046`) + spec prose.
+- A scatter of **count literals** in tests + one UI label (`src/ui/sections/color.js`, grep `semantic roles`) + spec prose.
--- a/.claude/skills/adding-semantic-roles/references/rubric.md
+++ b/.claude/skills/adding-semantic-roles/references/rubric.md
@@ -14 +14 @@
-| R7 | Prose accuracy | [review] | Current counts bumped (knowledge-03, parity-checklist P1, CLAUDE.md, app.js:4046 label); HISTORICAL counts (36 vs 37, CHANGELOG, ADR/OD, color-data) left intact | 1: a historical count rewritten, or a live label still wrong · 3: live counts right, one stale comment left · 5: live right, history intact, comments in touched files fixed |
+| R7 | Prose accuracy | [review] | Current counts bumped (knowledge-03, parity-checklist P1, CLAUDE.md, the `sections/color.js` roles label); HISTORICAL counts (36 vs 37, CHANGELOG, ADR/OD, color-data) left intact | 1: a historical count rewritten, or a live label still wrong · 3: live counts right, one stale comment left · 5: live right, history intact, comments in touched files fixed |
--- a/.claude/skills/adding-semantic-roles/references/best-practices.md
+++ b/.claude/skills/adding-semantic-roles/references/best-practices.md
@@ -32 +32 @@
-  (the "53 semantic roles" mentions), plus the `src/ui/app.js` inspector label (grep `semantic roles`).
+  (the "53 semantic roles" mentions), plus the `src/ui/sections/color.js` inspector label (grep `semantic roles`).
```

```diff
--- a/.claude/skills/adding-export-formats/references/foundations.md
+++ b/.claude/skills/adding-export-formats/references/foundations.md
@@ -116,2 +116,2 @@
-`exports.js exportX` → `exportAll` (the bundle) → `model.mjs projectView` `exports[id]` (the UI-readable map,
-~line 433) → `app.js renderDrawer FORMAT_GROUPS` (the tab) → `view.exports[id]` (rendered code) →
+`exports.js exportX` → `exportAll` (the bundle) → `model.mjs projectView` `exports[id]` (the UI-readable
+map) → `overlays/drawer.js renderDrawer FORMAT_GROUPS` (the tab) → `view.exports[id]` (rendered code) →
--- a/.claude/skills/adding-export-formats/references/best-practices.md
+++ b/.claude/skills/adding-export-formats/references/best-practices.md
@@ -49 +49 @@
-- **`exportAll` → `model.mjs view.exports` → `app.js` drawer + `downloadAllZip`.** A color format missing from
+- **`exportAll` → `model.mjs view.exports` → `overlays/drawer.js` drawer + `downloadAllZip`.** A color format missing from
```

```diff
--- a/.claude/skills/adding-export-formats/SKILL.md
+++ b/.claude/skills/adding-export-formats/SKILL.md
@@ -28,10 +28,7 @@
 **Not this skill's territory: `src/engine/ds-export.js`.** The Claude Design / Google Stitch / Figma Make
 "DS bundle" DESIGN.md-authoring subsystem (`dsColorRoles`, `exportDesignSystemTokens/Spine/Components/
-Receipt/Bundle/StitchBundle/MakeBundle`, the `dsMake*Md` prose generators) used to share a file with the 10
-color formats above -- split out in TKT-0015 because it's a different KIND of code (content/prose authoring
-for a consumption bundle, not token serialization) and was undocumented drift risk for this skill's own
-"10 formats" claim. It imports a handful of this file's helpers (`derivedAll`, `roleOklch`, `hexOf`, `hex8`,
-`relLumExp`, plus the already-public `cssPrefixOf`/`dialogBackdropOklch`/`exportShadcn`) but is otherwise
-independent, has no rubric of record in `docs/reference/` yet, and is out of scope here -- don't route a
+Receipt/Bundle/StitchBundle/MakeBundle`, the `dsMake*Md` prose generators) is a different kind of code:
+content/prose authoring for a consumption bundle, not token serialization. It imports a handful of
+`exports.js` helpers (`derivedAll`, `roleOklch`, `hexOf`, `hex8`, `relLumExp`, `cssPrefixOf`,
+`dialogBackdropOklch`, `exportShadcn`) but is otherwise independent and out of scope here -- don't route a
 DS-bundle change through this skill's procedure, and don't add its formats to `exportAll` (it is bundled by
 the UI directly, same as the type/geometry emitters).
```

```diff
--- a/.claude/skills/adding-export-formats/SKILL.md
+++ b/.claude/skills/adding-export-formats/SKILL.md
@@ -115,8 +115,6 @@
    curve, a renamed palette) -- the shape is unchanged, so the version isn't either. Absence of a stamp on an
-   older export means version 1 (the pre-#503 shape, retroactive). Worked example: ticket #638's
-   `exportRadix` reference-form variant bumped 2 → 3, because a `var()`-link leaf is a new value SHAPE
-   for a leaf that was always a baked string. That bump moves `MCP_BRAND_KIT_VERSION`
-   (`scripts/gen-mcp-assets.mjs`) too, since it is generated from the same server's `SERVER.version`.
-   `test/mcp/brand-kit.mjs` pins the zip's `package.json` version against `SERVER.version` so the pair
-   cannot split apart again, the gate a #638 review round added after the first bump landed without it.
+   older export means version 1 (retroactive). A leaf whose value changes form (a baked `oklch(...)` becoming a
+   `var()` link, as in `exportRadix`'s `refs` variant) is a SHAPE change and bumps. Every bump also moves
+   `MCP_BRAND_KIT_VERSION` (`scripts/gen-mcp-assets.mjs`, generated from `SERVER.version`);
+   `test/mcp/brand-kit.mjs` pins the zip's `package.json` version against `SERVER.version`.
    The `hpg-export-schema-stamp` gate in
```

```diff
--- a/.claude/skills/adding-semantic-roles/SKILL.md
+++ b/.claude/skills/adding-semantic-roles/SKILL.md
@@ -50,10 +50,10 @@
 4. **`figma/binder/figma-semantic-binder/code.js`** -- `roleTable(n)` carries the same rows (the Figma
-   sandbox can't import the `.mjs`). Since TKT-0019 this is GENERATED, not hand-typed: `roleTable(n)` is
+   sandbox can't import the `.mjs`). It is GENERATED, not hand-typed: `roleTable(n)` is
    `semanticRoles()`'s own function body spliced verbatim by `scripts/gen-figma-binder-code.mjs` between
    `// === GENERATED:ROLE_TABLE ===` markers. Editing `semantic.js` in step 1 and regenerating
    (`npm test`/`npm run build` run the splice for you; run it by hand with `node
    scripts/gen-figma-binder-code.mjs`) is what puts the new row in `code.js` -- there is no separate
    binder-file edit to make, and hand-editing inside the markers is actively wrong (a regenerate
    overwrites it). The binder parity gate (`test/figma/binder.mjs`) deep-equal-compares the FULL role
-   objects (`{key, suffix, light, dark}`, in order, TKT-0027) against `semantic.js` directly, so a
-   forgotten regenerate (a stale committed `code.js`) now flags as a row-count or per-field mismatch.
+   objects (`{key, suffix, light, dark}`, in order) against `semantic.js` directly, so a
+   forgotten regenerate (a stale committed `code.js`) flags as a row-count or per-field mismatch.
```

```diff
--- a/.claude/skills/color-math/SKILL.md
+++ b/.claude/skills/color-math/SKILL.md
@@ -71,3 +71,3 @@
-## The hue model is OKLCH-native (easy to miss -- changed #117; depth in `references/foundations.md` §4)
+## The hue model is OKLCH-native (easy to miss; depth in `references/foundations.md` §4)
 
-- The per-palette `hue` param is an **OKLCH hue** by default -- `DEFAULT_CONTROLS.hueSpace` (and the persist default) is `"oklch"`, flipped from `"cam16"`.
+- The per-palette `hue` param is an **OKLCH hue** by default -- `DEFAULT_CONTROLS.hueSpace` (and the persist default) is `"oklch"`; `"cam16"` survives only on legacy docs that carry it explicitly.
```

```diff
--- a/.claude/skills/color-math/SKILL.md
+++ b/.claude/skills/color-math/SKILL.md
@@ -90,3 +90,3 @@
 5. **Determinism.** No RNG, no clock, no locale. `VC` is computed once at load; the memo caches (`_mc`, `_pk`,
-   `_oh` in `hct.js`) key on the exact float (#686); `tonal.js`'s `okhslLAt` has no cache at all (#738: a
-   memo there was never load-bearing). Same input → identical bytes.
+   `_oh` in `hct.js`) key on the exact float; `tonal.js`'s `okhslLAt` is uncached. Same input → identical
+   bytes.
```

```diff
--- a/.claude/skills/color-math/SKILL.md
+++ b/.claude/skills/color-math/SKILL.md
@@ -103,3 +103,3 @@
-3. **Keep the ramp paths honest: there is now exactly ONE damping multiplier.** Since #681 U3 the
-   per-stop multiplier is a single exported `chromaEnvelope(stop, anchorStop, lift, controls)` in
+3. **Keep the ramp paths honest: there is exactly ONE damping multiplier.** The
+   per-stop multiplier is a single exported `chromaEnvelope(stop, anchorStop, lift, controls)` in
    `tonal.js`, called by all four branches (even, OKHSL, and both anchored). The C7 gate greps for
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -42,3 +42,3 @@
 and is **density-invariant**; **Rhythm** (`gap` = the hand-CALIBRATED `GAP_UNIT` per size -- 3·3·4·6·6·8 at
-the canonical baseHeight, × bh/28; TKT-0010 retired `font/2`) is all density may touch (`caret` rides its
-OWN height law, `3.5·h^0.39` -- 2026-07-15, never `= font` and never composed). The compact pads
+the canonical baseHeight, × bh/28) is all density may touch (`caret` rides its
+OWN height law, `3.5·h^0.39`, and is never composed). The compact pads
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -73,3 +73,3 @@
-steps are named NUMERICALLY -- `LADDER_SIZE_KEYS = ["0".."9"]` (owner ruling 2026-09-02, final: TWO
-earlier rulings -- a 7-name t-shirt mapping, then a 10-name t-shirt mapping -- were both superseded; the
-CSV's ten rows map onto ten CONSECUTIVE +4 steps 20·24·28·32·36·40·44·48·52·56, exported as
+steps are named NUMERICALLY -- `LADDER_SIZE_KEYS = ["0".."9"]` (a final owner ruling; the
+CSV's ten rows map onto ten CONSECUTIVE +4 steps 20·24·28·32·36·40·44·48·52·56, exported as
 `--{pfx}-size-{0..9}-{field}`, e.g. `--md-sys-size-3-height: 32px` -- gen-ui-kit binds these directly).
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -92,5 +92,4 @@
 2. **Never assume `.sizes.MD`/`.SM`/`.LG`/etc. (any t-shirt-letter key) exists.** A bare
-   `scale.sizes.SM || Object.values(scale.sizes)[0]`-style fallback -- a real, live pattern before
-   this fix, at FOUR call sites (`geomExampleCard`, `graphGeomCentering`, ds-export's `uiSize`/
-   `ctrlIcon`/`switchH` anchors, and `mcp/png-swatch-board.mjs`'s control-strip sizing) -- silently
+   `scale.sizes.SM || Object.values(scale.sizes)[0]`-style fallback silently
    lands on step `"0"` (the SMALLEST control) under the ladder, not any sensible letter-equivalent,
```

```diff
--- a/.claude/skills/geometry-system/SKILL.md
+++ b/.claude/skills/geometry-system/SKILL.md
@@ -124,3 +124,3 @@
-all six steps compose since the voice rides the full XS..2XL ramp; TKT-0008 rerouted the join off the old
-UI/Label voice); `caret` keeps its OWN power law (`3.5·h^0.39`, never composed); `gap` rides its own
-GAP_UNIT calibration (TKT-0010 -- no longer follows the font).
+all six steps compose since the voice rides the full XS..2XL ramp; the join reads UI-control, not Label);
+`caret` keeps its OWN power law (`3.5·h^0.39`, never composed); `gap` rides its own
+GAP_UNIT calibration, independent of the font.
```

```diff
--- a/.claude/skills/figma-file-migration/SKILL.md
+++ b/.claude/skills/figma-file-migration/SKILL.md
@@ -100 +100 @@
-- **The MCP session drops or disconnects mid-wave** (it happened during TKT-0013's BZZR leg): treat
+- **The MCP session drops or disconnects mid-wave**: treat
```

---

## Slice C: prompt-cruft audit

Scope: `.claude/skills/{maintaining-brand-kit-mcp, maintaining-figma-plugins, project-docs, shipping-changes, type-scale, ultimate-tokens-brand-voice}` (SKILL.md read in full; references/ and scripts/ signal-grepped). Target model: Claude Opus 5.5 in Claude Code. Read-only; nothing applied.

Summary: 34 findings (9 High, 18 Medium, 7 Low/flag). Nearly all are Group 2. Two kinds dominate:

1. Volatile specifics that no longer match the code (checked against the source). Line anchors drifted: `model.mjs:237` is now 689, `app.js:6565` is now 2457, `model.mjs:39` is now 53. The MCP test now expects 16 palettes, not 8. `make11` no longer exists. `ensureTypeFonts` now lives in `app-helpers.mjs`. project-docs says ADRs, plans and roadmap are "not present yet", but they live in `decision-records.md` and `.sdlc/`. The shipping rubric still counts "three legs" when CI has four jobs. The project-docs routing names commands (`/feature`, `/bug-report`, `/doc-forge`) that CLAUDE.md has replaced with `/file-bug` and `/file-feature`.
2. History narratives where issue numbers stand in for the rule. The worst case is maintaining-figma-plugins SKILL.md:70-115: one paragraph built up over 10 commits, citing #629/#673/#687/#688/#696/#635/#255/#491 and dates, when the current rule fits in half the words.

There is little Group 1 pressure language. The caps that remain mostly sit on reasoned prohibitions or fragile ship steps, which the keep list protects.

## Findings

| Location | Evidence (quoted) | Pattern | Why obsolete | Confidence | Action |
|---|---|---|---|---|---|
| maintaining-brand-kit-mcp/SKILL.md:42-43 | "`brandKit(doc, systems)` in `src/ui/model.mjs:237`" / "`downloadBrandKitMcp()` in `src/ui/app.js:6565`" | G2 volatile specifics | Verified: `brandKit` is at model.mjs:689 and `downloadBrandKitMcp()` at app.js:2457. Opus 5.5 follows the anchor literally and reads the wrong code. | High | rewrite (drop line numbers, name the symbol) |
| maintaining-brand-kit-mcp/SKILL.md:114 | "resources/list (brand://type + brand://geometry) · list_palettes (8)" | G2 volatile specifics | test/mcp/brand-kit.mjs:162 asserts `pal.length === 16`. The skill states a wrong expected value for the test it tells you to run. | High | rewrite (8 → 16) |
| maintaining-brand-kit-mcp/references/foundations.md:9,22,42,142,157; references/best-practices.md:60 | "(`src/ui/model.mjs:237`)", "(`model.mjs:39`)", "`src/ui/model.mjs:675`", "(`app.js:6565`)" | G2 volatile specifics | Every line anchor has drifted (geometryScale is at model.mjs:53, brandKit at 689, downloadBrandKitMcp at app.js:2457). | High | rewrite (drop `:NNN`) |
| project-docs/SKILL.md:25,27,28 | "`docs/adr/` (ADR-*, accepted = append-only) -- not present yet" / "none active right now" / "`docs/roadmap/` (ROADMAP-*) -- not present yet" | G2 volatile specifics | ADRs live in `docs/reference/references/decision-records.md` (ADR-001..). Active plans and the roadmap live in `.sdlc/plans/` and `.sdlc/roadmap.md` (CLAUDE.md SDLC section). The skill's own stated worst failure is a false "absent", and this table produces one. | High | rewrite |
| project-docs/SKILL.md:59-61 | "a new idea → `/feature`; a bug → `/bug-report`; building a queued record → `/build`; authoring or revising any document → `/doc-forge`" | G2 volatile specifics | CLAUDE.md: "Human-filed bugs and features still go through `/file-bug` and `/file-feature`"; the installed doc author is `make-doc`; builds run through the sdlc Orchestrator. The routes named here don't exist. | High | rewrite |
| type-scale/SKILL.md:100 | "the five layers (`cat`→`make11`→treatment→`typeScale`→emitter)" | G2 volatile specifics | `make11` appears nowhere in src/ or test/. The factory is `makeVoices` (SKILL.md:31). | High | rewrite |
| type-scale/SKILL.md:60; type-scale/references/foundations.md:239 | "`ensureTypeFonts()` (in `src/ui/app.js`)" | G2 volatile specifics | Verified: `export function ensureTypeFonts()` is at src/ui/app-helpers.mjs:245. app.js only imports it. | High | rewrite |
| shipping-changes/references/rubric.md:12 | "H5 \| CI watched, all three legs \| [review] \| CI passed build · test · **smoke**" | G2 volatile specifics / duplicates drift | SKILL.md:32-37 and ci.yml list four required jobs (`build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`). The rubric scores a ship green on three. | High | rewrite |
| ultimate-tokens-brand-voice/SKILL.md:67-68 | "(`CLAUDE.md` · \"Context is memory\")" | G2 volatile specifics | The project CLAUDE.md has no "Context is memory" section, so this cites authority that doesn't exist. The sentence already carries the rule. | High | remove citation |
| maintaining-figma-plugins/SKILL.md:70-92 | "**`libraryMode` (#629) is ALWAYS an explicit boolean** … #629 shipped the flag with color exempt by ruling Q1; #673 retired that exemption; #687 closed the last gap. … #696: … before #696 an old bundle applying to an already-uplifted file kept the variables but pruned the mode out from under it." | G2 history narratives; G1d patch accretion; G1d migration-relative ("now") | Blame shows 10 commits layered onto one paragraph. The current rule (every prune reads the resolved flag; Regroup/`plan.retire` are outside it; how undefined resolves) is buried in PR archaeology, and references/foundations.md §6 already owns the detail. | Medium | rewrite |
| maintaining-figma-plugins/SKILL.md:97,105-106 | "**STYLES (2026-07-09, PRs #231–#236):**" / "(2026-07-13, #292/#301, supersedes the v1 bind-all shape: real Figma resolves…)" | G2 history narratives | Dates, PR numbers and "supersedes v1" work as authority. The reason (Figma resolves a bound fontWeight independently) is the part to keep. | Medium | rewrite |
| maintaining-figma-plugins/SKILL.md:114-115 | "Geometry rides the `Geometry` collection (was `Breakpoints`, #491; was `Geometry` pre-ADR-016 -- a revert)" | G1d migration-relative; G2 history | The rename trail describes collection names the model will never see. The name rename maps live in FIGMA_MIGRATIONS. | Medium | remove parenthetical |
| maintaining-figma-plugins/SKILL.md:18 | "vocabulary (#491, was \"Color Semantic\")" | G1d migration-relative | Phantom alternative name. | Medium | remove |
| maintaining-figma-plugins/SKILL.md:39-41 | "since TKT-0019, GENERATED (…) rather than hand-typed -- a verbatim copy either way." | G2 history; G1d "rather than" | The rule is "generated, never hand-edit inside the markers". The history clause adds nothing. | Medium | rewrite |
| maintaining-figma-plugins/SKILL.md:150-152 | "(TKT-0027 widened this from a set-diff, which could miss a `key`/`suffix` typo pointing at an unchanged ref -- the real 2026-06-18 scrim drift was a ref change, which both shapes catch))" | G2 history narratives | The current gate is already stated just before this ("FULL role objects … not just the derived ref-name set"). The parenthetical is incident archaeology. | Medium | remove |
| shipping-changes/SKILL.md:60-61 | "(~265 s wall on a PR, measured on run 35974499577: `build-test` about 260 s is the wall, the `sweeps` legs run 70 to 190 s in parallel)" | G2 volatile specifics | A run ID and to-the-second timings pinned yesterday (blame 2026-09-24) will rot. The model only needs the order of magnitude to set a poll cadence. | Medium | rewrite |
| shipping-changes/SKILL.md:39-41 | "`npm run smoke` itself runs `npm run build` before booting Chrome (#564, a standalone `npm run smoke` must never trust a stale `dist/`)" | G2 history (PR number as authority) | The reason is in the clause itself, so the PR number is only archaeology. | Medium | rewrite |
| shipping-changes/SKILL.md:53-55 | "`-u` sweeps a concurrent agent's half-finished edits into your commit -- that once landed an `src/ui/app.js` change missing its matching test, reddening `main`" | G2 history narratives | The mechanism already gives the reason, so the anecdote is surplus. | Medium | remove anecdote clause |
| shipping-changes/SKILL.md:78-80 | "(the rule was tightened to `node_modules`, so both a real dir and a stray symlink are caught); re-tracking it is the exit-194 regression -- anecdote and why CI is blind to it" | G1d migration-relative ("was tightened"); G2 history | State the current ignore rule. .gitignore:1 is `node_modules` (verified). | Medium | rewrite |
| shipping-changes/SKILL.md:85 | "in the SAME change (TKT-0012)." | G2 history (ticket as authority) | The next sentence gives the reason (orphaned bindings). | Medium | remove ticket id |
| type-scale/SKILL.md:19 | "EXCEPT size itself, which since 2026-07-13 is a hand-authored FIXED table" | G2 time-sensitive; G1d | A date-relative phrase. The rule is simply "size is a fixed table". | Medium | rewrite |
| type-scale/SKILL.md:40 | "(`ranksFor` picks by the voice's `SIZES` length -- 2026-07-16, TKT-0008 follow-up; the old per-voice `STEPS_3`/`STEPS_5`/`STEPS_UI` split stays retired)" … "PROSE since 2026-07-16" | G1d migration-relative; G2 history | Naming retired symbols primes the model toward identifiers that no longer exist (grep: none in type.mjs). | Medium | rewrite |
| type-scale/SKILL.md:48 | "(#446, 2026-08-14; fallback named only when FONT_FALLBACKS differs)" | G2 history | The issue number and date are archaeology. The conditional is contract, so it stays. | Medium | rewrite |
| type-scale/SKILL.md:53 | "see the smoke-is-Chrome-only memory." | G2 volatile specifics (dangling pointer) | No such memory in the repo. CLAUDE.md says this is owned by `shipping-changes`'s `references/foundations.md`. Same dangling pointer at type-scale/references/best-practices.md:49. | Medium | rewrite |
| type-scale/SKILL.md:74 | "Miss this and every doc saved under the old name loses that voice's overrides on its very next hydrate -- the 2026-07-13 Heading→Headline/UI→Label rename was a live example before TKT-0016 fixed the mechanism. This is a standing practice, not a one-off: EVERY future voice rename adds its own entry, the same way a Figma variable rename ships its `FIGMA_MIGRATIONS` entry (TKT-0012)." | G2 history; G1a emphasis | Incident plus "standing practice, not a one-off" plus a caps EVERY restate one rule three ways. | Medium | rewrite |
| ultimate-tokens-brand-voice/SKILL.md:25-26 | "The product once moved 53 → 59 semantic roles while the store copy kept saying 53 -- that class of defect is what the sheet exists to kill." | G2 history narratives | The anecdote's numbers now contradict the live count (53, verified via `semanticRoles`), which invites a "fix" toward 59. The fact-sheet header repeats the same tale. | Medium | rewrite |
| project-docs/SKILL.md:44 | "/docs-alignment (scribe) can migrate it." | G2 volatile specifics | Same retired command family as lines 59-61. | Medium | rewrite |
| project-docs/SKILL.md:9-10 (frontmatter) | "NOT for authoring or editing a document (/doc-forge, scribe); NOT for capturing a new feature idea (/feature) or bug (/bug-report); NOT for building from a record (/build, orchestration)." | G2 volatile specifics in routing text | Routing text is on the keep list, but the named targets are stale. Fix together with the body when the routing eval is rerun. | Low | flag |
| shipping-changes/SKILL.md:7-8 (frontmatter) | "CI watch (build · test · smoke)" | G2 volatile specifics in routing text | Stale versus the four jobs, but it's routing text. | Low | flag |
| type-scale/SKILL.md:64-65 | "**Do NOT hand-edit it.**" / "**`gen:type-fonts` is MANUAL -- it is NOT in the build or test chain**" / "Run it ONLY when" | G1a pressure language | Each has a reason beside it, and the manual-regen trap is real (CLAUDE.md agrees). Only the volume is dated. | Low | flag |
| maintaining-figma-plugins/SKILL.md:49 | "(the `vmsyntax` check -- real incident 2026-06-17)" | G2 history | Short and next to a reasoned, demonstrated failure (the jsvm parse). Harmless. | Low | flag |
| maintaining-figma-plugins/references/foundations.md:63-259; references/figma-styles-hard-constraints.md (throughout) | "#492", "#629's ruling Q1", "Before #696…", "PRs #293/#297/#305", "found live, 2026-07-13/14" | G2 history narratives | Heavy PR archaeology in on-demand references. The hard-constraints file's provenance is load-bearing evidence (constraints found live in Figma), so trimming is a refactor preference, not a defect. | Low | flag |
| project-docs/SKILL.md:35 | "(migrated from `.claude/docs/` on 2026-07-12)" | G1d migration-relative | Harmless aside. | Low | flag |
| type-scale/SKILL.md:33-34 | "(ratified 2026-07-10)" / "(#264 -- each bounded …)" | G2 history | Minor date and issue asides next to real contract text. | Low | flag |

Clean: maintaining-brand-kit-mcp's two hard rules (stdout, opt-in) and its "Do not add a transport…" line are reasoned prohibitions. The shipping-changes gh quirks, merge gate and trailers are fragile exact scripts; their "once" anecdotes are the reason for a fragile step and stay. The brand-voice procedure and rules are author-only context. The scripts/ files are code, not prompt text (the `#529` comment in voice-check.mjs:11 is a code comment and out of scope).

## Proposed diff

```diff
--- a/.claude/skills/maintaining-brand-kit-mcp/SKILL.md
+++ b/.claude/skills/maintaining-brand-kit-mcp/SKILL.md
@@ -42,2 +42,2 @@
-| The **kit** | `brandKit(doc, systems)` in `src/ui/model.mjs:237` | the pure projection that produces `brand-kit.json` -- `stops`/`palettes`/`roles` (Color), `type`, `geometry`. `systems` is the per-system opt-in. |
-| The **package** | `downloadBrandKitMcp()` in `src/ui/app.js:6565` | the export drawer's **Download Brand-Kit MCP** -- zips the server + core + `brand-kit.json` + README + `package.json`. Uses the `MCP_BRAND_KIT` asset. |
+| The **kit** | `brandKit(doc, systems)` in `src/ui/model.mjs` | the pure projection that produces `brand-kit.json` -- `stops`/`palettes`/`roles` (Color), `type`, `geometry`. `systems` is the per-system opt-in. |
+| The **package** | `downloadBrandKitMcp()` in `src/ui/app.js` | the export drawer's **Download Brand-Kit MCP** -- zips the server + core + `brand-kit.json` + README + `package.json`. Uses the `MCP_BRAND_KIT` asset. |
```

```diff
--- a/.claude/skills/maintaining-brand-kit-mcp/SKILL.md
+++ b/.claude/skills/maintaining-brand-kit-mcp/SKILL.md
@@ -114 +114 @@
-                              #   resources/list (brand://type + brand://geometry) · list_palettes (8)
+                              #   resources/list (brand://type + brand://geometry) · list_palettes (16)
```

```diff
--- a/.claude/skills/maintaining-brand-kit-mcp/references/foundations.md
+++ b/.claude/skills/maintaining-brand-kit-mcp/references/foundations.md
@@ -9 +9 @@
-- **`brandKit(doc, systems)`** (`src/ui/model.mjs:237`) is the **pure projection** that produces
+- **`brandKit(doc, systems)`** (`src/ui/model.mjs`) is the **pure projection** that produces
@@ -22 +22 @@
-  geometryScale(doc)` calls a thin **`model.mjs` wrapper** (`model.mjs:39`) that runs the engine's `geomScale`
+  geometryScale(doc)` calls a thin **`model.mjs` wrapper** (`geometryScale`) that runs the engine's `geomScale`
@@ -42 +42 @@
-(`src/engine/exports.js`), interpolated by `brandKit` at `src/ui/model.mjs:675`. Read the constant,
+(`src/engine/exports.js`), interpolated by `brandKit` in `src/ui/model.mjs`. Read the constant,
@@ -142 +142 @@
-these -- `geometryScale(doc)` (`model.mjs:39`) shares the `typeScale` into `geomScale` -- but a tool/resource
+these -- `geometryScale(doc)` (`model.mjs`) shares the `typeScale` into `geomScale` -- but a tool/resource
@@ -157 +157 @@
-- **Shipped in the zip** -- `downloadBrandKitMcp()` (`app.js:6565`) writes `MCP_BRAND_KIT.server` as
+- **Shipped in the zip** -- `downloadBrandKitMcp()` (`src/ui/app.js`) writes `MCP_BRAND_KIT.server` as
--- a/.claude/skills/maintaining-brand-kit-mcp/references/best-practices.md
+++ b/.claude/skills/maintaining-brand-kit-mcp/references/best-practices.md
@@ -60 +60 @@
-  composition is `geometryScale(doc)`'s job (`model.mjs:39`, which passes `{ typeScale }` into `geomScale`); a
+  composition is `geometryScale(doc)`'s job (`model.mjs`, which passes `{ typeScale }` into `geomScale`); a
```

```diff
--- a/.claude/skills/project-docs/SKILL.md
+++ b/.claude/skills/project-docs/SKILL.md
@@ -25,4 +25,4 @@
-| A ratified decision and its alternatives | `docs/adr/` (ADR-*, accepted = append-only) -- not present yet |
+| A ratified decision and its alternatives | `docs/reference/references/decision-records.md` (ADR-NNN sections, append-only; new ADRs go before its Quick map) |
 | What's queued, in flight, or done | **GitHub Issues first** (`gh issue list` -- ADR-017, 2026-07-17: the live ticket backend) -- `docs/tickets/` is the pre-2026-07-17 ARCHIVE only (frontmatter `kind:`/`size:`/`status:` on those files reflects state as of the migration date, not current; a migrated file's `migrated-to:` frontmatter + top-of-file pointer names its Issue) |
-| Sequenced steps with done-whens | `docs/plan/` (PLAN-*) -- closed plans archive to `docs/plan/archive/`; none active right now |
-| Horizons of intent -- Now / Next / Later | `docs/roadmap/` (ROADMAP-*) -- not present yet |
+| Sequenced steps with done-whens | `.sdlc/plans/` (live sdlc plans; closed → `.sdlc/plans/archive/`) and `docs/plan/archive/` (older closed plans); live unit status is `.sdlc/board.md` |
+| Horizons of intent -- Now / Next / Later | `.sdlc/roadmap.md` |
```

```diff
--- a/.claude/skills/project-docs/SKILL.md
+++ b/.claude/skills/project-docs/SKILL.md
@@ -44 +44 @@
-"spec-shaped content lives at rfcs/ -- not indexed; /docs-alignment (scribe) can migrate it." A false
+"spec-shaped content lives at rfcs/ -- not indexed." A false
```

```diff
--- a/.claude/skills/project-docs/SKILL.md
+++ b/.claude/skills/project-docs/SKILL.md
@@ -59,3 +59,3 @@
-4. Route all making: a new idea → `/feature`; a bug → `/bug-report`; building a queued record →
-   `/build`; authoring or revising any document → `/doc-forge` (all where installed -- otherwise
-   name the record that would be touched and hand back to the user).
+4. Route all making: a new idea → `/file-feature`; a bug → `/file-bug`; building a queued record →
+   the sdlc Orchestrator (`.sdlc/adapter.md`); authoring or revising any document → `make-doc`
+   (where installed -- otherwise name the record that would be touched and hand back to the user).
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -100 +100 @@
-| `references/foundations.md` | the SINGLE OWNER of the model: the five layers (`cat`→`make11`→treatment→`typeScale`→emitter), the voice taxonomy + step sets, the `buildCategory` math (nice ladder + override channels), `bodyBase` scaling, the emitter shapes, the font-rendering path |
+| `references/foundations.md` | the SINGLE OWNER of the model: the five layers (`cat`→`makeVoices`→treatment→`typeScale`→emitter), the voice taxonomy + step sets, the `buildCategory` math (nice ladder + override channels), `bodyBase` scaling, the emitter shapes, the font-rendering path |
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -60 +60 @@
-`ensureTypeFonts()` (in `src/ui/app.js`) injects the `<style>` once AND eagerly registers all four via the
+`ensureTypeFonts()` (in `src/ui/app-helpers.mjs`) injects the `<style>` once AND eagerly registers all four via the
--- a/.claude/skills/type-scale/references/foundations.md
+++ b/.claude/skills/type-scale/references/foundations.md
@@ -239 +239 @@
-- **`ensureTypeFonts()`** (in `src/ui/app.js`) injects the `<style>` once and eagerly registers all four via
+- **`ensureTypeFonts()`** (in `src/ui/app-helpers.mjs`) injects the `<style>` once and eagerly registers all four via
```

```diff
--- a/.claude/skills/shipping-changes/references/rubric.md
+++ b/.claude/skills/shipping-changes/references/rubric.md
@@ -12 +12 @@
-| H5 | CI watched, all three legs | [review] | CI passed build · test · **smoke**; for a UI change, the `smoke-screenshots` artifact was looked at | 1: merged red or without watching CI · 3: all three green · 5: green + screenshot inspected (and Safari reasoned-about if WebKit-relevant) |
+| H5 | CI watched, every job | [review] | CI passed all four jobs (`build-test` incl. **smoke**, `panda-smoke`, `corpus-contrast`, `sweeps`); for a UI change, the `smoke-screenshots` artifact was looked at | 1: merged red or without watching CI · 3: every job green · 5: green + screenshot inspected (and Safari reasoned-about if WebKit-relevant) |
```

```diff
--- a/.claude/skills/ultimate-tokens-brand-voice/SKILL.md
+++ b/.claude/skills/ultimate-tokens-brand-voice/SKILL.md
@@ -66,3 +66,3 @@
 update `fact-sheet.md` **in the same change**, then sweep: `grep -rn "<old value>"
-docs/marketing/` and fix every hit. A drifted marketing fact is a defect of the same severity
-as a failing test (`CLAUDE.md` · "Context is memory").
+docs/marketing/` and fix every hit. A drifted marketing fact is a defect of the same severity
+as a failing test.
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -70,23 +70,20 @@
-in `figma.root` pluginData. **`libraryMode` (#629) is ALWAYS an explicit boolean**, never undefined: `true`
-means "this file is a PUBLISHED library", so the apply aliases and deprecates names it no longer produces
-instead of removing them. Every prune on the apply path is now guarded: `applyBundle`'s three-collection
-color VARIABLE reconcile and its Color Roles theme-MODE prune (#673); `applyFloatPlans`' type/geometry
-variable prune AND its own breakpoint-MODE prune (#629, #687); `applyFontPrimitivesModes`' variable +
-Type Primitives MODE prunes (#629; the mode prune reads the SAME resolved decision as the variable
-prune since #696, see below). `applyStylePlans`' paint and text prunes (#629). #629 shipped the
-flag with color exempt by ruling Q1; #673 retired that exemption; #687 closed the last gap. One
-caveat, detailed in `references/foundations.md` section 6: Regroup (#688) and `plan.retire` are
-destructive sites outside the flag by design. Regroup drops every Color Roles variable id regardless
-of `libraryMode`, so the always-warn Regroup gate now says explicitly that Published library does not
-cover it (#688) rather than making the two controls mutually exclusive. Two surfaces, one persisted key
-(`ultimate-tokens-library-mode-v1`, the `_applyConsentKey` precedent, storing both `"1"` and `"0"`
-because unchecked is a real answer): the gate's "Published library" checkbox, and Settings › Token
-mapping › "Figma apply", which exists because "don't show again" makes the gate unreachable and
-nothing in the app clears that consent. An `undefined` reaching `code.js` now means only an OLD
-`ui.html` bundle; on the flagship it never reaches `confirmLibraryMode` (only the standalone binder's
-own `main()` passes `askIfUndecided`); instead `applyFloatPlans`/`applyFontPrimitivesModes` fall back
-to #635's `priorLibraryUpliftVM`, which reads TRUE when the collection already carries prior-uplift
-evidence (an unwanted existing name with a live alias, or a `_deprecated/` name), false otherwise. #696:
-`applyFontPrimitivesModes`' Type Primitives MODE prune decides off that SAME resolved flag, not a raw
-`opts.libraryMode === true` taken at collection time: before #696 an old bundle applying to an
-already-uplifted file kept the variables but pruned the mode out from under it. **The two collection NAMES are per-doc overridable (#255)** -- Settings ›
+in `figma.root` pluginData. **`libraryMode` is always an explicit boolean**, never undefined: `true`
+means "this file is a PUBLISHED library", so the apply aliases and deprecates names it no longer produces
+instead of removing them. Every prune on the apply path reads the one resolved flag: `applyBundle`'s
+three-collection color VARIABLE reconcile and its Color Roles theme-MODE prune; `applyFloatPlans`'
+type/geometry variable prune and breakpoint-MODE prune; `applyFontPrimitivesModes`' variable and
+Type Primitives MODE prunes (both off the same resolved decision); `applyStylePlans`' paint and text
+prunes. Regroup and `plan.retire` are destructive by design and sit outside the flag: Regroup drops
+every Color Roles variable id regardless of `libraryMode`, and its always-warn gate says Published
+library does not cover it (detail in `references/foundations.md` section 6). One persisted key
+(`ultimate-tokens-library-mode-v1`, storing both `"1"` and `"0"` because unchecked is a real answer)
+is set from two surfaces: the gate's "Published library" checkbox, and Settings › Token mapping ›
+"Figma apply", which exists because "don't show again" makes the gate unreachable and nothing in the
+app clears that consent. An `undefined` reaching `code.js` means an old `ui.html` bundle: the flagship
+never calls `confirmLibraryMode` (only the standalone binder's own `main()` passes `askIfUndecided`);
+`applyFloatPlans`/`applyFontPrimitivesModes` fall back to `priorLibraryUpliftVM`, which reads true when
+the collection already carries prior-uplift evidence (an unwanted existing name with a live alias, or
+a `_deprecated/` name), false otherwise. **The two collection NAMES are per-doc overridable** -- Settings ›
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -97 +97 @@
-Binder still looks up the DEFAULT names only. **STYLES (2026-07-09, PRs #231–#236):** when the drawer's Styles chip is on
+Binder still looks up the DEFAULT names only. **STYLES:** when the drawer's Styles chip is on
@@ -104,5 +104,5 @@
 `code.js#applyStylePlans` + `applyFontPrimitivesModes` execute them verbatim, provenance-pruned via
 `STYLE_REGISTRY_KEY` (user styles untouchable). Binds fontSize/fontFamily/paragraphSpacing/
-lineHeight/letterSpacing (px FLOATs since #295) + EITHER fontStyle OR fontWeight -- **never both**
-(2026-07-13, #292/#301, supersedes the v1 bind-all shape: real Figma resolves a bound fontWeight to
-"the closest valid weight" independently, silently overriding a bound fontStyle's named cut; the
+lineHeight/letterSpacing (px FLOATs) + EITHER fontStyle OR fontWeight -- **never both**
+(real Figma resolves a bound fontWeight to
+"the closest valid weight" independently, silently overriding a bound fontStyle's named cut; the
 executor also explicitly UNBINDS the stale half of the pair on re-apply). The full hard-constraint
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -114,2 +114,2 @@
-→ `receiveLiveVariables` feeds the drift diff. Geometry rides the `Geometry` collection (was
-`Breakpoints`, #491; was `Geometry` pre-ADR-016 -- a revert) of Figma NUMBER (FLOAT) vars via `geomTokensFigma` (`src/engine/geometry.mjs`).
+→ `receiveLiveVariables` feeds the drift diff. Geometry rides the `Geometry` collection
+of Figma NUMBER (FLOAT) vars via `geomTokensFigma` (`src/engine/geometry.mjs`).
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -18 +18 @@
-touches before you change a line -- they share the Color Primitives → Color Roles vocabulary (#491, was "Color Semantic") but differ in
+touches before you change a line -- they share the Color Primitives → Color Roles vocabulary but differ in
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -39,3 +39,3 @@
-   `code.js` carries `roleTable(n)` baked in -- since TKT-0019, GENERATED (spliced verbatim from
-   `semanticRoles(n)`'s own function body by `scripts/gen-figma-binder-code.mjs`, between the
-   `// === GENERATED:ROLE_TABLE ===` markers) rather than hand-typed -- a verbatim copy either way.
+   `code.js` carries `roleTable(n)` baked in -- GENERATED (spliced verbatim from
+   `semanticRoles(n)`'s own function body by `scripts/gen-figma-binder-code.mjs`, between the
+   `// === GENERATED:ROLE_TABLE ===` markers).
```

```diff
--- a/.claude/skills/maintaining-figma-plugins/SKILL.md
+++ b/.claude/skills/maintaining-figma-plugins/SKILL.md
@@ -150,3 +150,2 @@
-`semanticRoles(n)`, not just the derived ref-name set (TKT-0027 widened this from a set-diff, which could
-miss a `key`/`suffix` typo pointing at an unchanged ref -- the real 2026-06-18 scrim drift was a ref change,
-which both shapes catch)), and **`vmsyntax`** in `plugin.mjs` (a `catch {` that parses in Node but not in
+`semanticRoles(n)`, not just the derived ref-name set), and **`vmsyntax`** in `plugin.mjs` (a `catch {`
+that parses in Node but not in
```

```diff
--- a/.claude/skills/shipping-changes/SKILL.md
+++ b/.claude/skills/shipping-changes/SKILL.md
@@ -60,2 +60,2 @@
-6. Watch CI (~265 s wall on a PR, measured on run 35974499577: `build-test` about 260 s is the wall,
-   the `sweeps` legs run 70 to 190 s in parallel): poll until the run registers, then
+6. Watch CI (roughly 4 to 5 minutes on a PR; `build-test` is the long pole, the `sweeps` legs run in
+   parallel): poll until the run registers, then
```

```diff
--- a/.claude/skills/shipping-changes/SKILL.md
+++ b/.claude/skills/shipping-changes/SKILL.md
@@ -39,2 +39,2 @@
-without waiting on CI. `npm run smoke` itself runs `npm run build` before booting Chrome (#564, a
-standalone `npm run smoke` must never trust a stale `dist/`), so `build-test`'s own preceding build
+without waiting on CI. `npm run smoke` itself runs `npm run build` before booting Chrome (a
+standalone `npm run smoke` must never trust a stale `dist/`), so `build-test`'s own preceding build
```

```diff
--- a/.claude/skills/shipping-changes/SKILL.md
+++ b/.claude/skills/shipping-changes/SKILL.md
@@ -53,3 +53,2 @@
    - Stage each file by name (`git add <your-files>`), not `git add -u`: in a shared tree, `-u` sweeps
-     a concurrent agent's half-finished edits into your commit -- that once landed an `src/ui/app.js`
-     change missing its matching test, reddening `main` (see "Concurrency isolation").
+     a concurrent agent's half-finished edits into your commit (see "Concurrency isolation").
```

```diff
--- a/.claude/skills/shipping-changes/SKILL.md
+++ b/.claude/skills/shipping-changes/SKILL.md
@@ -78,3 +78,3 @@
-  `git status -s | grep -c node_modules` → 0. It is de-tracked AND ignored (the rule was tightened to
-  `node_modules`, so both a real dir and a stray symlink are caught); re-tracking it is the exit-194
-  regression -- anecdote and why CI is blind to it in `references/foundations.md` §4.
+  `git status -s | grep -c node_modules` → 0. It is de-tracked AND ignored as `node_modules` (no
+  trailing slash, so both a real dir and a stray symlink are caught); why CI can't catch a re-track
+  is in `references/foundations.md` §4.
```

```diff
--- a/.claude/skills/shipping-changes/SKILL.md
+++ b/.claude/skills/shipping-changes/SKILL.md
@@ -85 +85 @@
-  `figma/binder/migrations.mjs` (FIGMA_MIGRATIONS) in the SAME change (TKT-0012). Every apply loop
+  `figma/binder/migrations.mjs` (FIGMA_MIGRATIONS) in the SAME change. Every apply loop
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -19 +19 @@
-**derived** from the treatment's knobs -- EXCEPT size itself, which since 2026-07-13 is a hand-authored FIXED
+**derived** from the treatment's knobs -- EXCEPT size itself, which is a hand-authored FIXED
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -40 +40 @@
-- **Voice taxonomy** -- the fifteen voices; thirteen ride the uniform 3-step ramp (SM/MD/LG) and the two INTERACTIVE voices (UI-control/UI-widget) ride the full XS..2XL 6-step ramp (`ranksFor` picks by the voice's `SIZES` length -- 2026-07-16, TKT-0008 follow-up; the old per-voice `STEPS_3`/`STEPS_5`/`STEPS_UI` split stays retired), the `roleOf` mapping (Body-mono/Label-mono/Kicker/Sub-title/Tiny-mono → `mono`; Lead/Body → `body`; Label/Tiny/UI-control/UI-widget → `ui`), the `box` flag that decouples the presentation FLOW from the font role (the BOX voices are exactly Kicker/UI-control/UI-widget -- Label/Body-mono/Label-mono are `box:false` PROSE since 2026-07-16; Label is the STATIC label voice, interactive single-line text belongs to the UI voices), the caps voices, the per-treatment case rules → foundations §2 + §4.
+- **Voice taxonomy** -- the fifteen voices; thirteen ride the uniform 3-step ramp (SM/MD/LG) and the two INTERACTIVE voices (UI-control/UI-widget) ride the full XS..2XL 6-step ramp (`ranksFor` picks by the voice's `SIZES` length), the `roleOf` mapping (Body-mono/Label-mono/Kicker/Sub-title/Tiny-mono → `mono`; Lead/Body → `body`; Label/Tiny/UI-control/UI-widget → `ui`), the `box` flag that decouples the presentation FLOW from the font role (the BOX voices are exactly Kicker/UI-control/UI-widget -- Label/Body-mono/Label-mono are `box:false` PROSE; Label is the STATIC label voice, interactive single-line text belongs to the UI voices), the caps voices, the per-treatment case rules → foundations §2 + §4.
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -48 +48 @@
-`typeTokensCSS` emits a full stack -- `--font-{role}: '{family}', '{google-safe fallback}', {generic};` (#446, 2026-08-14; fallback named only when FONT_FALLBACKS differs) -- **the single quotes on every named entry are load-bearing.**
+`typeTokensCSS` emits a full stack -- `--font-{role}: '{family}', '{google-safe fallback}', {generic};` (the fallback is named only when FONT_FALLBACKS differs) -- **the single quotes on every named entry are load-bearing.**
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -52,2 +52,2 @@
 (the luxury quoting assert in `test/engine/type.mjs`). Never emit an unquoted family. (This is the type echo of color's anchors -- a
-quiet break that *looks* fine in Chrome; see the smoke-is-Chrome-only memory.)
+quiet break that *looks* fine in Chrome; why smoke is Chrome-only is in `shipping-changes`'s `references/foundations.md`.)
```

```diff
--- a/.claude/skills/type-scale/SKILL.md
+++ b/.claude/skills/type-scale/SKILL.md
@@ -74 +74 @@
-   - A voice RENAME (not an add) → same `persist.js` VOICES allowlist update, PLUS a `RENAME_MAPS` entry there (`src/ui/persist.js`, TKT-0016 -- the schemaVersion + rename-map mechanism, same principle as `hueSpace`'s legacy stamp): bump `CURRENT_SCHEMA_VERSION` and add `{ version, renameVoices: { OldName: "NewName" } }` in the SAME change. Miss this and every doc saved under the old name loses that voice's overrides on its very next hydrate -- the 2026-07-13 Heading→Headline/UI→Label rename was a live example before TKT-0016 fixed the mechanism. This is a standing practice, not a one-off: EVERY future voice rename adds its own entry, the same way a Figma variable rename ships its `FIGMA_MIGRATIONS` entry (TKT-0012).
+   - A voice RENAME (not an add) → same `persist.js` VOICES allowlist update, PLUS a `RENAME_MAPS` entry there (`src/ui/persist.js` -- the schemaVersion + rename-map mechanism, same principle as `hueSpace`'s legacy stamp): bump `CURRENT_SCHEMA_VERSION` and add `{ version, renameVoices: { OldName: "NewName" } }` in the SAME change. Miss this and every doc saved under the old name loses that voice's overrides on its next hydrate. Every voice rename gets its own entry, the same way a Figma variable rename ships its `FIGMA_MIGRATIONS` entry.
```

```diff
--- a/.claude/skills/ultimate-tokens-brand-voice/SKILL.md
+++ b/.claude/skills/ultimate-tokens-brand-voice/SKILL.md
@@ -24,3 +24,3 @@
 - **`docs/marketing/fact-sheet.md`** -- every count, price, name, and claim a copy may use.
-  Copy CITES the sheet; it never remembers a number. The product once moved 53 → 59 semantic roles
-  while the store copy kept saying 53 -- that class of defect is what the sheet exists to kill.
+  Copy CITES the sheet; it never remembers a number, because product counts move and copy written
+  from memory keeps the old value.
```

Out-of-slice notes for the caller: docs/marketing/fact-sheet.md:6-7 carries the same 53/59 tale. Neither this diff nor the grep touches it.

---

## Slice D: consumer plugin skills, MCP tool surface, describe-eval runner

Scope: `plugin/ultimate-tokens/{README.md, skills/{color,geometry,typography}-tokens/SKILL.md}` (+ signal-grep of `references/`), every MCP tool/instructions/prompt text in `mcp/brand-kit-core.mjs`, `mcp/brand-kit-merged-core.mjs`, `mcp/describe-mcp-core.mjs` (server files only wire transports; no tool text), and `mcp/describe-eval-runner.mjs` + the prompt text it sends (`mcp/describe-rubric.mjs` RUBRIC / RESEARCH_TIER_NOTE; `describe-eval.mjs` builds no prompt text).

Targets: skills and MCP tools are read by Claude Opus 5.5. The eval runner targets Haiku 4.5, which it names on purpose.

Method: every factual claim below was checked against the engine by running it (`typeScale`, `typeTokensCSS`, `generateKitTool`, `tonal.js` DEFAULT_CONTROLS). None of the proposed edits trips an existing gate. I checked `voice-parity.mjs` (token/step/prop existence, the `-line-single` proximity check, and the one..ten voice-count regex), `role-parity.mjs` (role tokens, the "N roles" and "N palettes" counts), `dimension-parity.mjs`, `test/mcp/describe-rubric.mjs` (the §7 lift section must still match `/displac/` and `w(stop)` and must not contain `additive`; RUBRIC must include RESEARCH_TIER_NOTE; RESEARCH_TIER_NOTE must mention `keyColor` and /research/) and `test/mcp/describe-mcp-core.mjs:23` (the inputSchema declares both properties). Every edit to `brand-kit-core.mjs` regenerates committed assets through `gen:mcp-assets`, which `npm test` runs.

## Summary

Counts: Group 1 (prompt text: R1-R3, E3) 4 · Group 2 (skill files: C1-C2, T1-T4, S1-S4) 10 · Group 3 (tool descriptions: M1-M10) 10 · Group 1b/4 (request construction: E1, E2, E4) 3 · Low flags 6. Total: 33 rows, 27 of them with diff hunks.

Highest impact:
1. **color-tokens law 6 is stale and wrong.** It says, in shouted caps, that on-colors are "fixed light BY DESIGN ... (do not "fix" this)". ADR-025 made `onColorMode: "contrast"` the default (`src/engine/tonal.js:78`, `src/ui/persist.js:129`), so on-colors now switch per palette and per scheme, and fall through to pure white or black. A consumer agent that follows the skill will tell users that dark on-text is a bug.
2. **typography-tokens contradicts the engine in three ways.** It says there are 13 voices; the engine has 15, and the README says 11. It says every voice is an SM–LG ramp; UI-control and UI-widget export XS–2XL. It routes "chrome" to `label`, the voice the engine defines as static text. It also contradicts itself on that last point.
3. **The MCP surface has contract gaps.** Several tool descriptions leave out things a caller needs:
   - `resolve_token` never documents its role-key grammar (camelCase, e.g. `primary/onPrimary`, `neutral/surfaceHigh`).
   - `nearest_token` only searches raw ramp stops and misparses 3-digit hex.
   - `export_tokens` says it is "only available" after generation, but it is always listed and returns `{error}`.
   - `initialize` names `resolve_token`/`get_ramp`/`nearest_token` even in a kitless merged boot where those tools don't exist, and never mentions `generate_kit`.

## Findings

| Row | Location (file:line) | Evidence (quoted) | Pattern | Why obsolete / wrong | Confidence | Action |
|---|---|---|---|---|---|---|
| C1 | plugin/ultimate-tokens/skills/color-tokens/SKILL.md:87-92 | "On-colors are fixed light BY DESIGN (do not "fix" this). ... resolve to the palette's light end in BOTH modes, for all palettes ... (the product's ADR-003/OD-001)" | G2 volatile specifics (factual rot) + G1a shouted emphasis | ADR-025 amended ADR-003 and closed OD-001. The default `onColorMode` is `"contrast"` (tonal.js:78), so this claim no longer matches the engine. The caps tell a literal-following model to argue with correct output. | High | rewrite |
| C2 | plugin/ultimate-tokens/skills/color-tokens/references/feedback.md:19-20 | "**Do not "fix" white-on-warning text** -- on-colors are fixed light by design (SKILL.md law 6)" | G2 volatile specifics | Repeats C1's stale claim. The default kit may put dark text on warning fills. | High | rewrite |
| T1 | plugin/ultimate-tokens/skills/typography-tokens/SKILL.md:8, :20, :49 | "thirteen-role type scale" / "thirteen named **voices**" / "## The thirteen roles" | G2 volatile specifics | The engine emits 15 voices (`typeScale` categories), and the file's own table lists 15 rows. `voice-parity.mjs` misses this because its count regex only covers one..ten. | High | rewrite |
| T2 | plugin/ultimate-tokens/README.md:11 | "the eleven-role scale" | G2 volatile specifics | Should be 15. It also disagrees with the skill's own (wrong) 13. | High | rewrite |
| T3 | typography-tokens/SKILL.md:51; references/interface.md:5, :55; references/headings.md:5 | "Every voice is now a fixed **SM–LG** (3-step) ramp" / "both 3-step sm/md/lg ramps" / "every voice is a fixed sm/md/lg ramp" / "Every voice is a 3-step ramp" | G2 volatile specifics + G1d migration phrasing ("now") | UI-control and UI-widget are XS–2XL (type.mjs:46-50), and `typeTokensCSS` emits `--type-ui-control-xs-size` … `-2xl-size`. The skill tells the agent to use steps that don't exist and to ignore two that do. | High | rewrite |
| T4 | typography-tokens/SKILL.md:72-77, :137; references/prose.md:58 | "**label** is for *interface chrome you operate*" / "those jobs live on `lead`, `tiny`, `body`, and `label`" / "chrome → `label`" / "chrome is `label`" | G1d patch accretion (partial update left contradictions) | The next sentence (line 73) says "not `label` -- that voice is STATIC text", and interface.md routes operable text to UI-control/UI-widget. The engine agrees (type.mjs:112). The model gets two opposite rules. | High | rewrite |
| M1 | mcp/brand-kit-core.mjs:165 | `instructions: \`... Use resolve_token / get_ramp / nearest_token; read brand://guide first.\`` | G3 tool names in system text / tools invalid in current config | The merged server reuses this `handle`. A kitless boot (brand-kit-merged-server.mjs:47) and a type-only or geometry-only kit lists none of the three tools named, and the instructions never mention `generate_kit`. That is a dangling reference in the one orientation string. | High | rewrite |
| M2 | mcp/brand-kit-core.mjs:76 (usageGuide, served as `brand://guide` + `apply_brand` prompt) | "**Label** (controls/labels), **Label-mono** (monospace controls -- IDs, versions)" | G3 contract/behavior mismatch | The engine defines Label as the static voice, with operable text on UI-control/UI-widget (type.mjs:112). Sub-title is missing from the list. | High | rewrite |
| M3 | mcp/brand-kit-core.mjs:109-111 | "The brand token closest to a given hex (so the agent reuses the system instead of inventing a colour)." | G3 under-described + contract mismatch + behavior-smuggling | The handler searches only raw ramp stops, not semantic roles. It returns `{palette, stop, hex, distance}` with RGB Euclidean distance on a 0-255 scale. `hexToRgb` misparses 3-digit hex ("fff" becomes [255,15,0]). The parenthetical steers behavior instead of stating the contract. | High | add |
| M4 | mcp/brand-kit-core.mjs:97-98 | "Resolve a semantic role to its hex in a scheme. role = \"palette/roleKey\" (or palette + role)." | G3 under-described | Role keys are camelCase and accent-prefixed for the accent family (`primary/primaryHover`, `primary/onPrimary`, `neutral/surfaceHigh`), and nothing documents that. Other gaps: `scheme` defaults to light; the palette is slug-matched but the role key is exact-case; a miss returns `{error}` as a normal result. None of the parameters has a description. | High | add |
| M5 | mcp/brand-kit-merged-core.mjs:79-81 | "Only available once a kit has been GENERATED (not a loaded brand-kit.json alone). ... so the natural next move ... is one call." | G3 contract mismatch + under-described | The tool is always listed and returns `{error}` until a `{brief}` generation. The return shape `{files:[{name,mimeType,text}]}` is undocumented. It writes nothing to disk. The "natural next move" clause steers rather than states the contract. | High | rewrite |
| M6 | mcp/describe-mcp-core.mjs:122-123; mcp/brand-kit-merged-core.mjs:74-75 | "(this NEVER generates a kit) ... never hand-edit the output's hex values." / `properties: { description: { type: "string" }, brief: { type: "object" } }` | G3 under-described + G1a caps | The parameters have no descriptions. The mode-1 payload keys and the mode-2 return (`{kit, doc, lint, meta}`, about 48 KB) are unstated, as are precedence (brief wins) and the fact that a non-object brief is a tool error while numbers are clamped. The merged copy omits the PNG image block that `attachImageBlock` still adds, and the lint array. "never hand-edit" has no reason attached. | Medium | add |
| M7 | mcp/brand-kit-core.mjs:91-96 | "The full tonal ramp (stops → hex) for one palette." / get_prime's `palette: { type: "string" }` | G3 under-described | `palette` is undescribed: it matches name or slug, case-insensitive. The return shape is missing, there is no warning that ramp stops are primitives (not UI colors), and the `{error}` miss shape is unstated. | Medium | add |
| M8 | mcp/brand-kit-core.mjs:88-90 | "List the brand's palettes with their identity colour and canvas group (material/brand/system/data)." | G3 under-described | It returns `{name, key, group, stops}`, and `key` is the hex, which the description doesn't say. It also never says this is how to find valid `palette` arguments. | Medium | add |
| M9 | mcp/brand-kit-core.mjs:106-107 | "All resolved semantic roles for a scheme, as { \"palette/role\": hex }." | G3 under-described (payload / when-not-to-use) | That is 53 roles × every palette (424 keys for the 8-family generated kit, 848 for the 16-palette default). It should point to resolve_token for single lookups. The scheme default of light is unstated. | Medium | add |
| M10 | mcp/brand-kit-core.mjs:67 | "**Accents** → a palette's prime role (e.g. \`primary/primary\`)" | G3 contract ambiguity | "prime" now names the seven `get_prime` swatches (REQ-054). Calling the accent role "prime role" points the model to the wrong tool. | Medium | rewrite |
| S1 | color-tokens/SKILL.md:23, :30-31, :67 | "(SPEC REQ-054)" / "by construction (SPEC\n0.3.0)" / "translucents (ADR-016)" | G2 history narratives | These are product-repo IDs in a skill that ships to other people's projects, where the model cannot open them. The rule stands without the citation. | Medium | remove |
| S2 | geometry-tokens/SKILL.md:54 | "**Four paddings, by anatomy (TKT-0010).**" | G2 history narratives | An archive ticket ID the consumer can't resolve. | Medium | remove |
| S3 | typography-tokens/SKILL.md:37, :64, :96 | "Label/Body-mono/Label-mono went prose 2026-07-16" / "prose flow (may wrap) since 2026-07-16" | G2 history + G1d migration-relative phrasing | This is a diff against a past version the reader never saw, and it implies the old behavior may still exist. State the current rule. | Medium | rewrite |
| S4 | typography-tokens/references/interface.md:3, :7-8, :45, :52 | "(TKT-0008, 2026-07-16)" / "STATIC label voice now" / "no \`-line-single\` since 2026-07-16" / "prose-flow now (2026-07-16)" / "static text since 2026-07-16" | G2 history + G1d migration-relative | Same as S3. | Medium | rewrite |
| R1 | mcp/describe-rubric.mjs:217-219 | "the scheme this replaced simply added L* at each stop, which did not, and could push the light stops into a flat plateau ... **lift > 0** still punches ... **lift < 0** still dips" | G1d migration-relative phrasing | The RUBRIC reaches every generate_kit caller and the Haiku eval. Describing the retired mechanism implies it might still apply. Keeps `displac`/`w(stop)` and adds no "additive" (test/mcp/describe-rubric.mjs:26-28). | Medium | rewrite |
| R2 | mcp/describe-rubric.mjs:49, :232 | "becomes a \`keyColor\` hex in the brief (§3.2)" / "no other name may be used (§3.1)" | G2 volatile specifics (dangling cross-ref) | These cite the internal spec's sections, but the RUBRIC's own §3 is "The named refusal". The reader can't resolve them and may look in the wrong section. | Medium | remove |
| R3 | mcp/describe-rubric.mjs:128-130 | "Rule: before finishing a brief, write one sentence naming the generic/stock palette ..." | G3/G1 contract precision | The schema has `story.refuses` for this, but the rubric never names it. Under forced tool use (the eval) there is no free text to write it in, and an MCP caller doesn't know where the sentence goes. | Medium | rewrite |
| E1 | mcp/describe-eval-runner.mjs:41-49 | `tools: [{ name: "submit_brief", ... }], tool_choice: { type: "tool", name: "submit_brief" }` + `if (!toolUse) throw new Error(\`no tool_use block ...\`)` | G1b JSON-via-forced-tool + retry/missing-tool path | This is extraction, which structured outputs (`output_config.format`) replace. I believe Haiku 4.5 supports structured outputs but haven't verified it here, and the schema would need to be strict-compatible: `story` and `groups.items` lack `additionalProperties:false`, and numeric min/max may be unsupported. The file says it mirrors the planned hosted describe_palette design (#377, spec §8 item 2), so change the two together, or keep the tool and add `strict: true`. | Medium | replace-with-API-feature |
| E2 | mcp/describe-eval-runner.mjs:28-31 | "output is guaranteed schema-shaped, never free text to re-parse" | G3 contract mismatch (code comment) | Forced tool use without `strict: true` does not guarantee schema-valid input. `scoreBrief` already reads the result defensively. | Medium | rewrite |
| E3 | mcp/describe-eval-runner.mjs:39 | `system: \`${briefing.rubric}\n\n${briefing.research}\`` | G1c padding (duplicate) + unfollowable instruction | RESEARCH_TIER_NOTE is already embedded as RUBRIC §10 (a test asserts `RUBRIC.includes(RESEARCH_TIER_NOTE)`), so it goes out twice. It also tells the model to web-search, but the only tool offered is `submit_brief`. | Medium | rewrite |
| E4 | mcp/describe-eval-runner.mjs:38 | `max_tokens: 1024,` | G4 max_tokens sizing | The schema allows `story.narrative/refuses/groups` plus 8 families × `colorName/description`, and the rubric asks for all of it. The code never checks `stop_reason`, so a truncated call shows up as "no tool_use block" or a partial brief and gets scored as an interpretation miss. | Medium | rewrite |
| F1 | mcp/describe-eval-runner.mjs:9, :20 | `const DEFAULT_MODEL = "claude-haiku-4-5-20251001";` | G2 pinned model name / G4 | The alias is `claude-haiku-4-5`. For an eval, a dated snapshot is a defensible reproducibility pin. Switch to the alias only if the intent is "whatever the current Haiku 4.5 is". `anthropic-version: 2023-06-01` is current. There is no prefill, temperature, budget_tokens or thinking config: clean. | Low | flag |
| F2 | mcp/describe-rubric.mjs:131-133, :149-159, :292-316 (RUBRIC) vs describe-eval-runner.mjs:55-60 | chroma table rows for `#E0ACAC`, `#E6A9AA`, `#A37F56`, `#D0944A`, `#BB5D1B`, `#FF6600`, `#D62300`, BZZR 267/98; worked example "Siberian Tigers on Parade" | G1c example over-indexing (eval validity, out of scope) | The runner withholds exemplars so it won't leak answers, but the RUBRIC it sends as the system prompt already carries the answer hexes for about 9 of the 15 goldens (Miami, Grand Budapest, Serengeti, Siberian taiga, Bengal, Nike, BK, BZZR, Corsa). Those entries measure recall of the prompt. | Low | flag |
| F3 | mcp/describe-rubric.mjs:68-69, :154, :176, :206-207, :269 | "\`docs/reference/colors/categories/*.json\`", "\`docs/reference/data/role-table.json\`", "persist.js's own scale", "\`src/engine/tonal.js\`'s \`toneAt\`", "\`describe-kit-core.mjs\`" | G2 volatile specifics | These are repo paths an external MCP caller can't open. They are provenance context, not instructions, so they're harmless noise at worst. | Low | flag |
| F4 | color/geometry/typography-tokens SKILL.md frontmatter `description` | ("which color should this use", "what token for this background/text", ...) ×6 each | G2 trigger-case enumeration | This is routing text, where calibrated urgency is allowed (keep list #6). Re-tune it only against a trigger eval. | Low | flag |
| F5 | color-tokens/SKILL.md:110-111; geometry :96-97; typography :139-140 | "Skill maintainers: \`node scripts/role-parity.mjs\` gates every role ..." | G2 content for another audience | Consumer agents read maintainer-only instructions (a no-op outside the repo). This is harmless unless an agent decides to run it. | Low | flag |
| F6 | voice-parity.mjs:62 (not prompt text) | `/\b(one|two|...|ten)[-\s]+voices?\b/` | G1d unenforced instruction | This is why T1 and T2 drifted silently: the count regex stops at ten and skips "thirteen-role" and "thirteen named voices". Extend it the way role-parity's `parseNumWord` does. | Low | flag |

## Proposed diff

Hunks are grouped by finding ID. The eval-runner hunks (E1, E3, E4) are single-line or zero-context so they can be taken independently.

### C1: color-tokens law 6

```diff
--- a/plugin/ultimate-tokens/skills/color-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/color-tokens/SKILL.md
@@ -87,6 +87,9 @@
-6. **On-colors are fixed light BY DESIGN (do not "fix" this).** `-on-primary` / `-on-primary-variant`
-   resolve to the palette's light end in BOTH modes, for all palettes -- a deliberate brand decision
-   (the product's ADR-003/OD-001) that intentionally overrides per-pair contrast math (e.g. white on
-   a warning-yellow fill). Do not swap in black text, auto-contrast logic, or your own dark variant.
-   If a client insists on WCAG-floor text on fills, raise it as a kit-level decision -- never patch it
-   locally.
+6. **On-colors are resolved by the kit; use them verbatim.** `-on-primary` / `-on-primary-variant`
+   already carry the kit's on-color policy. The default (`onColorMode: contrast`) picks, per palette
+   and per scheme, whichever ramp end reads better on the fill, falling through to pure white/black
+   where neither end reaches WCAG AA 4.5:1, so light text on one accent and dark text on another is
+   expected. A kit exported with `onColorMode: fixed` instead pins every on-color to the light end in
+   both schemes as a brand choice, accepting low contrast on light fills such as warning-yellow.
+   Either way, don't swap in your own text color, auto-contrast logic, or a dark variant: the kit
+   owns this, and a contrast complaint is a kit-level change (regenerate with the other mode), not a
+   local patch.
```

### C2: feedback.md warning on-color

```diff
--- a/plugin/ultimate-tokens/skills/color-tokens/references/feedback.md
+++ b/plugin/ultimate-tokens/skills/color-tokens/references/feedback.md
@@ -18,3 +18,3 @@
 Because containers/outlines are translucent 500-ramp roles, intent callouts tint correctly on any
-surface tier. **Do not "fix" white-on-warning text** -- on-colors are fixed light by design
-(SKILL.md law 6); if a filled warning chip bothers you, use the soft-chip recipe instead.
+surface tier. Use the kit's on-color on a warning fill as-is (SKILL.md law 6); if a filled warning
+chip still reads poorly, use the soft-chip recipe instead.
```

### T1: voice count in typography-tokens

```diff
--- a/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
@@ -8,1 +8,1 @@
-  consumption guide for the thirteen-role type scale (role=function × level=hierarchy-depth, size
+  consumption guide for the fifteen-role type scale (role=function × level=hierarchy-depth, size
@@ -20,1 +20,1 @@
-An Ultimate Tokens export gives thirteen named **voices**, each a ramp of **steps**, as CSS custom
+An Ultimate Tokens export gives fifteen named **voices**, each a ramp of **steps**, as CSS custom
@@ -49,1 +49,1 @@
-## The thirteen roles -- pick by the text's FUNCTION
+## The fifteen roles -- pick by the text's FUNCTION
```

### T2: README voice count

```diff
--- a/plugin/ultimate-tokens/README.md
+++ b/plugin/ultimate-tokens/README.md
@@ -11,1 +11,1 @@
-| **typography-tokens** | the type of any UI | the eleven-role scale -- role=function × level=hierarchy-depth (size derived), the body-vs-ui split, single-line vs multi-line, per-role paragraph rhythm, responsive breakpoint modes. |
+| **typography-tokens** | the type of any UI | the fifteen-voice scale -- role=function × level=hierarchy-depth (size derived), the body-vs-ui split, single-line vs multi-line, per-role paragraph rhythm, responsive breakpoint modes. |
```

### T3: step ranges (UI-control/UI-widget are XS–2XL)

```diff
--- a/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
@@ -51,2 +51,3 @@
-Every voice is now a fixed **SM–LG** (3-step) ramp -- sizes are a hand-authored table, not a modular
-scale, and identical across every treatment (only font/weight/tracking/leading/case vary by treatment).
+Every voice is a fixed **SM–LG** (3-step) ramp except the two interactive voices, UI-control and
+UI-widget, which run **XS–2XL** (6 steps). Sizes are a hand-authored table, not a modular scale, and
+identical across every treatment (only font/weight/tracking/leading/case vary by treatment).
--- a/plugin/ultimate-tokens/skills/typography-tokens/references/interface.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/references/interface.md
@@ -5,1 +5,1 @@
-checks -- compact widget text), both on `--font-ui`, both 3-step sm/md/lg ramps, both with a
+checks -- compact widget text), both on `--font-ui`, both 6-step xs–2xl ramps, both with a
@@ -55,1 +55,1 @@
-- Don't invent sizes between steps -- every voice is a fixed sm/md/lg ramp; there's a step for it.
+- Don't invent sizes between steps -- every voice is a fixed ramp (sm/md/lg; xs–2xl for UI-control and UI-widget); there's a step for it.
--- a/plugin/ultimate-tokens/skills/typography-tokens/references/headings.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/references/headings.md
@@ -5,2 +5,2 @@
-utility class; the raw vars are listed where you need to compose. Every voice is a 3-step ramp --
+utility class; the raw vars are listed where you need to compose. Every heading voice is a 3-step ramp --
 `sm`/`md`/`lg` only.
```

### T4: label vs operable chrome contradictions

```diff
--- a/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
@@ -72,6 +72,6 @@
-Note the split: **body** is for *prose you read*; **label** is for *interface chrome you operate*. A
-button label is `UI-control`, not `body` (and not `label` -- that voice is STATIC text now). A paragraph is `body`, not `label`. **Sub-title** and **tiny**
+Note the split: **body** is for *prose you read*; **UI-control**/**UI-widget** are for *interface text
+you operate*; **label** is *static* interface text. A button label is `UI-control`, not `body` and not `label`. A paragraph is `body`, not `label`. **Sub-title** and **tiny**
 are prose too, even though they render in the *mono*/*ui* font respectively; they wrap (use `-line`,
 not `-line-single`). Reach for `tiny` on a figure caption, not `label`. There's no separate
-"quote"/"caption"/"legal"/"UI" voice -- those jobs live on `lead`, `tiny`, `body`, and `label`
-respectively. **body-mono**, **label-mono**, and **tiny-mono** are mono-font SIBLINGS of `body`,
+"quote"/"caption"/"legal" voice -- those jobs live on `lead`, `tiny`, and `body` respectively.
+**body-mono**, **label-mono**, and **tiny-mono** are mono-font SIBLINGS of `body`,
@@ -137,1 +137,1 @@
-- The voice matches the text's job (prose → `body`, chrome → `label`, headings → a `headline`/`title`/`sub-heading` voice).
+- The voice matches the text's job (prose → `body`, operable chrome → `UI-control`/`UI-widget`, static labels → `label`, headings → a `headline`/`title`/`sub-heading` voice).
--- a/plugin/ultimate-tokens/skills/typography-tokens/references/prose.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/references/prose.md
@@ -58,1 +58,1 @@
-- Don't use `label` for paragraphs or `body` for buttons -- prose is `body`, chrome is `label`.
+- Don't use `label` for paragraphs or `body` for buttons -- prose is `body`, button text is `UI-control`.
```

### M1: initialize instructions derived from the live tool list

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -164,2 +164,8 @@
-    case "initialize":
-      return reply({ protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {}, resources: {}, prompts: {} }, serverInfo: SERVER, instructions: `Brand kit "${kit.name || ""}" from ${kit.generator || "Ultimate Tokens"}. Use resolve_token / get_ramp / nearest_token; read brand://guide first.` });
+    case "initialize": {
+      const has = (n) => TOOLS.some((t) => t.name === n);
+      const start = has("resolve_token") ? "resolve_token looks up one semantic role; get_semantic lists them all; nearest_token matches an existing hex to a ramp stop."
+        : has("generate_kit") ? "No kit is bound yet: call generate_kit with { description } to learn the method, then with { brief } to generate one." : "";
+      const lead = kit.name ? `Brand kit "${kit.name}" from ${kit.generator || "Ultimate Tokens"}.` : "Ultimate Tokens brand-kit server.";
+      return reply({ protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {}, resources: {}, prompts: {} }, serverInfo: SERVER, instructions: [lead, start, "brand://guide describes what the bound kit contains."].filter(Boolean).join(" ") });
+    }
```

### M2: usage guide typography voices

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -76,1 +76,1 @@
-      `- \`get_type\` / \`brand://type\` → the type scale. Pick a voice by the text's FUNCTION: **Display** (hero), **Headline/Sub-heading/Title** (sections), **Lead** (standfirst), **Body** (reading, incl. fine-print), **Body-mono** (code, technical values), **Label** (controls/labels), **Label-mono** (monospace controls -- IDs, versions), **Kicker** (overline label), **Tiny/Tiny-mono** (captions, small print), **UI-control/UI-widget** (interactive single-line text -- buttons, inputs, widget chrome).\n` +
+      `- \`get_type\` / \`brand://type\` → the type scale. Pick a voice by the text's FUNCTION: **Display** (hero), **Headline/Sub-heading/Title/Sub-title** (sections), **Lead** (standfirst), **Body** (reading, incl. fine-print), **Body-mono** (code, technical values), **Label** (static labels -- field labels, table cells, metadata; may wrap), **Label-mono** (monospace static text -- IDs, versions), **Kicker** (overline label), **Tiny/Tiny-mono** (captions, small print), **UI-control/UI-widget** (interactive single-line text -- buttons, inputs, tags, badges).\n` +
```

### M10: "prime role" to "accent role"

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -67,1 +67,1 @@
-      `- **Accents** → a palette's prime role (e.g. \`primary/primary\`) and its \`*Dim/Bright/Low/High\` variants.\n` +
+      `- **Accents** → a palette's accent role (e.g. \`primary/primary\`; not the \`get_prime\` swatches) and its \`*Dim/Bright/Low/High\` variants.\n` +
```

### M8 / M7 / M4 / M9 / M3: read-tool descriptions (one hunk per tool)

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -88,2 +88,2 @@
-    { name: "list_palettes", description: "List the brand's palettes with their identity colour and canvas group (material/brand/system/data).",
+    { name: "list_palettes", description: "List every palette in the bound kit as [{ name, key, group, stops }]: `key` is the palette's identity (key-colour) hex, `group` its canvas group (material/brand/system/data), `stops` the number of tonal stops. Use it to learn the valid `palette` values for get_ramp, get_prime and resolve_token. It returns no role values; use resolve_token or get_semantic for those.",
       inputSchema: { type: "object", properties: {} },
```

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -91,2 +91,2 @@
-    { name: "get_ramp", description: "The full tonal ramp (stops → hex) for one palette.",
-      inputSchema: { type: "object", properties: { palette: { type: "string" } }, required: ["palette"] },
+    { name: "get_ramp", description: "Return one palette's raw tonal ramp as { name, ramp: [{ stop, hex }] }, lightest (50) to darkest (950). Ramp stops are primitives the semantic roles reference, not colours to put in UI code; use resolve_token for a role. An unknown palette returns { error } as a normal result.",
+      inputSchema: { type: "object", properties: { palette: { type: "string", description: "Palette name or slug from list_palettes, matched case-insensitively (\"Primary\" or \"primary\")." } }, required: ["palette"] },
@@ -95,1 +95,1 @@
-      inputSchema: { type: "object", properties: { palette: { type: "string" } }, required: ["palette"] },
+      inputSchema: { type: "object", properties: { palette: { type: "string", description: "Palette name or slug from list_palettes, matched case-insensitively." } }, required: ["palette"] },
```

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -97,2 +97,2 @@
-    { name: "resolve_token", description: "Resolve a semantic role to its hex in a scheme. role = \"palette/roleKey\" (or palette + role).",
-      inputSchema: { type: "object", properties: { palette: { type: "string" }, role: { type: "string" }, scheme: { type: "string", enum: ["light", "dark"] } } },
+    { name: "resolve_token", description: "Resolve one semantic role to its hex for a colour scheme; returns { palette, role, scheme, hex }. Pass either role=\"palette/roleKey\" alone, or palette plus a bare role key. Role keys are camelCase: the accent family is prefixed with the palette slug (primary/primary, primary/primaryHover, primary/onPrimary), the rest are shared names (primary/onSurface, neutral/surfaceHigh, neutral/outline, danger/container). The palette is matched case-insensitively; the role key is exact-case. A miss returns { error } as a normal result; get_semantic lists every valid key.",
+      inputSchema: { type: "object", properties: { palette: { type: "string", description: "Palette name or slug; omit when role carries it (\"palette/roleKey\")." }, role: { type: "string", description: "camelCase role key, or \"palette/roleKey\"." }, scheme: { type: "string", enum: ["light", "dark"], description: "Defaults to light." } } },
```

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -106,2 +106,2 @@
-    { name: "get_semantic", description: "All resolved semantic roles for a scheme, as { \"palette/role\": hex }.",
-      inputSchema: { type: "object", properties: { scheme: { type: "string", enum: ["light", "dark"] } } },
+    { name: "get_semantic", description: "Every resolved semantic role for one scheme, as { \"palette/roleKey\": hex }: 53 roles per palette, so several hundred entries. Use it to discover role keys or audit a whole theme; for a single lookup use resolve_token.",
+      inputSchema: { type: "object", properties: { scheme: { type: "string", enum: ["light", "dark"], description: "Defaults to light." } } },
```

```diff
--- a/mcp/brand-kit-core.mjs
+++ b/mcp/brand-kit-core.mjs
@@ -109,2 +109,2 @@
-    { name: "nearest_token", description: "The brand token closest to a given hex (so the agent reuses the system instead of inventing a colour).",
-      inputSchema: { type: "object", properties: { hex: { type: "string" } }, required: ["hex"] },
+    { name: "nearest_token", description: "Find the raw ramp stop (across every palette) closest to a hex, by straight-line RGB distance; returns { palette, stop, hex, distance } with distance on a 0-255-per-channel scale. It searches ramp stops only, not semantic roles, so it tells you which palette and lightness an existing colour belongs to; then pick the matching semantic role with resolve_token.",
+      inputSchema: { type: "object", properties: { hex: { type: "string", description: "Six-digit #RRGGBB. Three-digit shorthand is not expanded and gives a wrong match." } }, required: ["hex"] },
```

### M5: export_tokens

```diff
--- a/mcp/brand-kit-merged-core.mjs
+++ b/mcp/brand-kit-merged-core.mjs
@@ -80,2 +80,2 @@
-          description: "Export the currently-bound kit's tokens in a documented format, so the natural next move -- writing tokens.css or a framework config into the user's project -- is one call. Only available once a kit has been GENERATED (not a loaded brand-kit.json alone). format: css | oklch | json | dtcg | ui3 | tailwind | shadcn | all (every format at once, multi-file).",
-          inputSchema: { type: "object", properties: { format: { type: "string", enum: [...FORMAT_ORDER, "all"] } }, required: ["format"] },
+          description: "Return the bound kit's tokens as file contents in one format: { files: [{ name, mimeType, text }] }, one file per format, seven for \"all\". It does not write to disk; write the returned text into the project yourself. Works only after a successful generate_kit call with { brief } in this session. With only a loaded brand-kit.json it returns { error } as a normal result.",
+          inputSchema: { type: "object", properties: { format: { type: "string", enum: [...FORMAT_ORDER, "all"], description: "css (tokens.css) | oklch (tokens-oklch.css) | json (tokens.json) | dtcg (dtcg.tokens.json) | ui3 (ui3.json, Figma) | tailwind (tailwind.css) | shadcn (shadcn.css) | all." } }, required: ["format"] },
```

### M6: generate_kit (standalone and merged copies)

```diff
--- a/mcp/describe-mcp-core.mjs
+++ b/mcp/describe-mcp-core.mjs
@@ -122,2 +122,2 @@
-      description: "Turn a plain-language palette description into a brand kit, or learn the method first. Call with { description } to receive the interpretation rubric + PaletteBrief schema + theme-adjacent exemplars (this NEVER generates a kit). Call with { brief } -- an object matching that schema -- to generate deterministically; the result carries a swatch-board PNG preview (for vision-capable callers to self-critique before the user looks) plus a lint array (contrast/chroma-budget advisories, for text-only callers). To refine, patch the brief and resend; never hand-edit the output's hex values.",
-      inputSchema: { type: "object", properties: { description: { type: "string" }, brief: { type: "object" } } },
+      description: "Turn a plain-language palette description into a brand kit in two calls. (1) { description } returns a briefing { rubric, schema, exemplars, research, instructions } and generates nothing. (2) { brief }, an object matching that `schema`, generates deterministically and returns { kit, doc, lint, meta } (about 50 KB of JSON) plus a swatch-board PNG image block for visual self-review; `lint` lists advisories such as clamped values, on-color contrast under 3:1, and chroma budget. If both are sent, brief wins and description is ignored. A non-object brief is a tool error; out-of-range numbers are clamped, not rejected. To refine, patch the brief and call again: every hex is computed from the brief, so hand-edited output hexes are lost on the next generation.",
+      inputSchema: { type: "object", properties: { description: { type: "string", description: "The theme in plain language, e.g. \"Miami Art Deco at dusk\". Returns the briefing only." }, brief: { type: "object", description: "A PaletteBrief matching the schema the briefing returns (families is required). Generates the kit." } } },
--- a/mcp/brand-kit-merged-core.mjs
+++ b/mcp/brand-kit-merged-core.mjs
@@ -74,2 +74,2 @@
-          description: "Turn a plain-language palette description into a brand kit, or learn the method first. Call with { description } to receive the interpretation rubric + PaletteBrief schema + theme-adjacent exemplars (this NEVER generates a kit). Call with { brief } -- an object matching that schema -- to generate deterministically; the read tools (list_palettes, resolve_token, ...) and export_tokens immediately serve the generated kit. To refine, patch the brief and resend; never hand-edit the output's hex values.",
-          inputSchema: { type: "object", properties: { description: { type: "string" }, brief: { type: "object" } } },
+          description: "Turn a plain-language palette description into a brand kit in two calls. (1) { description } returns a briefing { rubric, schema, exemplars, research, instructions } and generates nothing. (2) { brief }, an object matching that `schema`, generates deterministically and returns { kit, doc, lint, meta } (about 50 KB of JSON) plus a swatch-board PNG image block; `lint` lists advisories such as clamped values, on-color contrast under 3:1, and chroma budget. After a generation, this session's read tools (list_palettes, resolve_token, ...) and export_tokens serve the new kit. If both are sent, brief wins. A non-object brief is a tool error; out-of-range numbers are clamped. To refine, patch the brief and call again: every hex is computed from the brief, so hand-edited output hexes are lost on the next generation.",
+          inputSchema: { type: "object", properties: { description: { type: "string", description: "The theme in plain language. Returns the briefing only." }, brief: { type: "object", description: "A PaletteBrief matching the schema the briefing returns (families is required). Generates and binds the kit." } } },
```

### S1: product-repo IDs in color-tokens

```diff
--- a/plugin/ultimate-tokens/skills/color-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/color-tokens/SKILL.md
@@ -23,1 +23,1 @@
-rather than the ramp. No role aliases a prime swatch and none ever will (SPEC REQ-054). Reach for one
+rather than the ramp. No role aliases a prime swatch, and none ever will. Reach for one
@@ -30,2 +30,2 @@
-special construct -- each is an ordinary palette, chroma peers of one another by construction (SPEC
-0.3.0), that happens to make a good chart-series set: the same 53 roles, and its own `prime` swatches
+special construct -- each is an ordinary palette, chroma peers of one another by construction, that
+happens to make a good chart-series set: the same 53 roles, and its own `prime` swatches
@@ -67,1 +67,1 @@
-   `--c-{p}-scrim-{step}` translucents (ADR-016) -- **never use raws in UI code**.
+   `--c-{p}-scrim-{step}` translucents -- **never use raws in UI code**.
```

### S2: ticket ID in geometry-tokens

```diff
--- a/plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md
@@ -54,1 +54,1 @@
-3. **Four paddings, by anatomy (TKT-0010).** `--size-{step}-padding-narrow` is the SLOT edge (a control
+3. **Four paddings, by anatomy.** `--size-{step}-padding-narrow` is the SLOT edge (a control
```

### S3: dated history in typography-tokens SKILL

```diff
--- a/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/SKILL.md
@@ -37,1 +37,1 @@
-   UI-widget -- only; Label/Body-mono/Label-mono went prose 2026-07-16). Prefer the ready-made utility class `.type-{voice}-{step}` (it wires
+   UI-widget -- only). Prefer the ready-made utility class `.type-{voice}-{step}` (it wires
@@ -64,1 +64,1 @@
-| **label** | ui | STATIC labels: field labels, table cells, list metadata -- prose flow (may wrap) since 2026-07-16 |
+| **label** | ui | STATIC labels: field labels, table cells, list metadata -- prose flow (may wrap) |
@@ -95,2 +95,2 @@
-   1.0), which exists on the box-text voices -- **UI-control, UI-widget, and Kicker** (Label/
-   Body-mono/Label-mono went prose 2026-07-16); for multi-line text use `-line`.
+   1.0), which exists on the box-text voices -- **UI-control, UI-widget, and Kicker**; for
+   multi-line text use `-line`.
```

### S4: dated history in interface.md

```diff
--- a/plugin/ultimate-tokens/skills/typography-tokens/references/interface.md
+++ b/plugin/ultimate-tokens/skills/typography-tokens/references/interface.md
@@ -3,1 +3,1 @@
-Everything you *operate* is one of the two INTERACTIVE voices (TKT-0008, 2026-07-16): **UI-control**
+Everything you *operate* is one of the two INTERACTIVE voices: **UI-control**
@@ -7,2 +7,2 @@
-STATIC label voice now -- field labels, table cells, captions-adjacent chrome -- prose flow (it may
-wrap; it has `-line` only, no `-line-single` since 2026-07-16).
+STATIC label voice -- field labels, table cells, captions-adjacent chrome -- prose flow (it may
+wrap; it has `-line` only, no `-line-single`).
@@ -45,1 +45,1 @@
-(proportional) face. Both are prose-flow now (2026-07-16) -- `-line` only; single-line box text is
+(proportional) face. Both are prose-flow -- `-line` only; single-line box text is
@@ -52,1 +52,1 @@
-- Don't use `label` for a button or badge -- `label` is static text since 2026-07-16; it has no
+- Don't use `label` for a button or badge -- `label` is static text; it has no
```

### R1: lift section without the retired-mechanism narrative

```diff
--- a/mcp/describe-rubric.mjs
+++ b/mcp/describe-rubric.mjs
@@ -216,5 +216,5 @@
   and 0 at the ramp's light/dark extremes. That keeps the ramp strictly monotone, because the shift's
-  own slope stays under 1 (\`|A| · π/900 < 1\`); the scheme this replaced simply added L* at each stop,
-  which did not, and could push the light stops into a flat plateau of identical swatches. **lift > 0** still punches the anchor
-  brighter/hotter; **lift < 0** still dips it darker/deeper (Success and Danger both default to **−5**,
+  own slope stays under 1 (\`|A| · π/900 < 1\`), so no two stops collapse into identical swatches.
+  **lift > 0** punches the anchor brighter/hotter; **lift < 0** dips it darker/deeper (Success and
+  Danger both default to **−5**,
   and Warning to **−36**, a grounded, non-neon core even at high chroma). Because
```

### R2: dangling spec section refs

```diff
--- a/mcp/describe-rubric.mjs
+++ b/mcp/describe-rubric.mjs
@@ -49,1 +49,1 @@
-  "their own web-search tool. A found, documented color becomes a `keyColor` hex in the brief (§3.2), not " +
+  "their own web-search tool. A found, documented color becomes a family's `keyColor` hex in the brief, not " +
@@ -232,1 +232,1 @@
-Families are a FIXED enum: ${FAMILY_NAMES.join(" · ")} -- no other name may be used (§3.1); a theme rarely
+Families are a FIXED enum: ${FAMILY_NAMES.join(" · ")} -- no other name may be used; a theme rarely
```

### R3: where the refusal sentence goes

```diff
--- a/mcp/describe-rubric.mjs
+++ b/mcp/describe-rubric.mjs
@@ -128,3 +128,3 @@
-Rule: before finishing a brief, write one sentence naming the generic/stock palette someone would reach for
-on this theme with no research, and state why the real subject refuses it. If you cannot think of a
-cliché to refuse, you have not looked closely enough yet.
+Rule: put one sentence in the brief's \`story.refuses\` naming the generic/stock palette someone would reach
+for on this theme with no research, and why the real subject refuses it. If you cannot think of a cliché
+to refuse, you have not looked closely enough yet.
```

### E2: guarantee comment

```diff
--- a/mcp/describe-eval-runner.mjs
+++ b/mcp/describe-eval-runner.mjs
@@ -28,4 +28,4 @@
-// interpretOne(apiKey, model, description, briefing) → the model's PaletteBrief (a plain object), via
-// FORCED tool-use against the exact schema generate_kit({description}) already returns -- output is
-// guaranteed schema-shaped, never free text to re-parse (mirrors #377's own planned describe_palette
-// design, spec §8 item 2, so this eval genuinely tests what that hosted path will do).
+// interpretOne(apiKey, model, description, briefing) → the model's PaletteBrief (a plain object),
+// constrained to the exact schema generate_kit({description}) already returns. Keep this request shape
+// in lockstep with #377's planned hosted describe_palette call (spec §8 item 2) so the eval tests what
+// that path will do. scoreBrief still reads the result defensively.
```

### E4: max_tokens headroom

```diff
--- a/mcp/describe-eval-runner.mjs
+++ b/mcp/describe-eval-runner.mjs
@@ -38 +38 @@
-      max_tokens: 1024,
+      max_tokens: 4096,
```

### E3: system prompt without the duplicate, unfollowable research note

```diff
--- a/mcp/describe-eval-runner.mjs
+++ b/mcp/describe-eval-runner.mjs
@@ -39 +39 @@
-      system: `${briefing.rubric}\n\n${briefing.research}`,
+      system: `${briefing.rubric}\n\nNo web search is available in this session: for a named real subject, use the documented colors you already know as keyColor hexes.`,
```

### E1: forced tool to structured outputs (verify Haiku 4.5 support and make the schema strict-compatible first; or keep the tool and add `strict: true`)

```diff
--- a/mcp/describe-eval-runner.mjs
+++ b/mcp/describe-eval-runner.mjs
@@ -41,9 +41,9 @@
-      tools: [{ name: "submit_brief", description: "Submit the constructed PaletteBrief.", input_schema: briefing.schema }],
-      tool_choice: { type: "tool", name: "submit_brief" },
+      output_config: { format: { type: "json_schema", schema: briefing.schema } },
     }),
   });
   if (!res.ok) throw new Error(`provider error ${res.status}: ${await res.text()}`);
   const json = await res.json();
-  const toolUse = (json.content || []).find((b) => b.type === "tool_use" && b.name === "submit_brief");
-  if (!toolUse) throw new Error(`no tool_use block in the provider response: ${JSON.stringify(json)}`);
-  return toolUse.input;
+  if (json.stop_reason !== "end_turn") throw new Error(`incomplete response (stop_reason ${json.stop_reason})`);
+  const text = (json.content || []).find((b) => b.type === "text");
+  return JSON.parse(text.text);
 }
```
