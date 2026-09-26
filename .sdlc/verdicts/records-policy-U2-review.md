# Review · records-policy U2 (ADR-027 proposed; ADR-025, 026, 027 carded) · builder pass 1 (l5)

| Field | Value |
|---|---|
| Branch | `unit/rp-U2` at `0755742bd06c31786df27f0c497058f9ef692b34` |
| Base | `2ab7ec42` (`plan/records-policy` with `origin/main` merged after #681); P rows at `git merge-base origin/main HEAD` = `62524831` |
| Where | rows rerun by this reviewer in a `git clone -q --shared` scratch clone under `$TMPDIR` (`rpU2rev.4Mfz/c`, checked out at the head above, removed after); nothing run in the repo or the worktree beyond reads |
| Relied on | the builder's P1 `npm test` run (`✓ all 49 test files passed`, exit 0, 599 s, tree `0` after). Not rerun here; P2 (branding + em dash), P3 and P4 rerun in full as the cheap gates |
| Reviewer tree | `git status --short \| wc -l` printed `0` in the worktree before this file was written |

## Unit rows

| Id | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U2-1 | ADR-027 after ADR-026, before the Quick map; no line removed | 🟢 | `## ADR-026 - ## ADR-027 - ## Quick map `, `--numstat` on the file `49 0`; `index.md` `3 0`, `decisions.md` `3 0` | line 296 (`---`) deleted: `--numstat` removals `1`; section moved after the Quick map: `## ADR-026 - ## Quick map ## ADR-027 - ` |
| U2-2 | hyphen heading, no U+2014 | 🟢 | `1`, `0` | heading rewritten with U+2014 by `perl -CSD`: `0`, `1` |
| U2-3 | rules (1) to (3) and the control | 🟢 | `1`, `1`, `1`, `1` | `interrogated before it is obeyed` reworded to `is noted`: `1`, `0` |
| U2-3b | rule (4) with its source | 🟢 | `1`, `1` | the rule (4) lines deleted with `sed '/(4) An acceptance criterion rewritten/,/carried forward unclosed/d'`: `0`, `0` |
| U2-4 | owner ratifies, plan does not | 🟢 | `1`, `0` | Status written `DECIDED 2026-09-22 (#721`: `1`, `1` |
| U2-5 | Quick map row, three cards, ledger rows | 🟢 | `1`, `3`, `3`, `3` | file, index and ledger restored from `2ab7ec42`, three cards removed: `0`, three `No such file`, `0`, `0` |
| U2-6 | each card's `Source` starts at its heading | 🟢 | `## ADR-025 `, `## ADR-026 `, `## ADR-027 `; also each range's last line is that ADR's Status paragraph tail (`728`, `768`, `816`) and the next line is blank | 025's range set to ADR-024's `682-694`: `## ADR-024 `, `## ADR-026 `, `## ADR-027 ` |
| U2-7 | 027 `proposed`, 025 and 026 `decided` | 🟢 | `3`, `1`, `0`, `2` | card and index row both copied from ADR-024's: `0`, `0`, `1`, `2`; row alone: `3`, `0`, `1` (the builder's Finding is right) |
| U2-8 | G0 recorded with `origin/main <sha>` | 🟢 | `2`; `origin/main` is now `f8fa8f3a` and its file greps `## ADR-02[67] ` as `1` each way, so the number was free at the sha the handoff names (`2a1cd5c8`) and still is | `G0: ADR-026 heading seen; ran on 20260922` through the filter: `0`; `... printed 1 at origin/main 2a1cd5c8`: `1` |

## Plan rows (rerun here except P1)

| Id | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, tree clean | 🟢 (builder) | handoff row: `✓ all 49 test files passed`, `0`, matching `.sdlc/baseline.md` line 19 `✓ all 49 test files passed`; not rerun by this reviewer, relied on per the dispatch | builder's: leading `//` of the `minor` line replaced with `/*`: `SyntaxError: Invalid or unexpected token`, exit 1 at the `gen:adia-exports` pre-step |
| P2 | branding clean; no added em dash outside backticks | 🟢 | `branding: clean (650 files scanned)`, `0`; with backtick spans kept the count is still `0` | one card line with U+2014: `1`; one card line naming the retired maker in the gate's uppercase form (built at run time by joining two halves of the name, never typed): `FAIL: 1 branding violation(s) across 650 files`, exit `1`. A lowercase plant printed `clean`: the gate matches the retired name in uppercase, its `.io` domain and the legacy tag only, so the handoff's "lowercase string" control bit because of the tag, not the name (altered: retired name removed) |
| P3 | scope wall | 🟢 | `0`, `0`; touched paths are the seven the stat lists, all inside the wall | fixture `src/engine/exports.js` + `.sdlc/records/cards/ADR-027.md` through the filter: `1` |
| P4 | generator outputs byte-identical | 🟢 | `0`, `0` | line 73 `version: "1.2.0"` set to `"1.2.1"` and regenerated: `1`; committed in the scratch: `2` |

## Judgement

| Check | State | Evidence | Negative control |
|---|---|---|---|
| Placement per adapter §6 (after the last ADR, before `## Quick map`) | 🟢 | heading order `730 770` then `## Quick map` at the next heading; `grep -n '^## ADR-02[4-7]'` shows 024 and 025 with the older glyph, 026 and 027 with ` - `, so 027 follows the plan's stated ADR-026 precedent rather than §6's literal U+2014 glyph | the U2-1 move control prints the Quick map before 027 |
| Says what #721 asks and nothing more | 🟢 | every paragraph of #721 (four defects, fifth instance, `56 to 60 s` and #718, the control, the candidate rule) is in Context and Decision; 24 needles from the plan's paste text each grep `1` on the flattened section; rule (4) is the plan's revision 3 addition sourced to `#709 revision 38`, which `git show a4675242:.sdlc/plans/archive/records-followup.md` greps `2` times; `adapter.md` §1's Ran-row clause greps `1`; the 2026-09-19 verbatim-quote amendment sits under `## 3. Hooks and guards`, so "adapter §3" is right; the #718 parenthetical the builder tightened matches `gh issue view 718`'s title ("reads only the first range in a gate cell"); nothing about #722 (U1's comment block) is in the ADR, which is correct: #722 is U1 and lands in `scripts/`, untouched here (`git diff --stat -- scripts` empty) | the U2-3 and U2-3b controls each drop one needle to `0` |
| No existing line of `decision-records.md` changed | 🟢 | `--numstat` `49 0`; the Quick map's existing rows are untouched in the diff (only the `ADR-027` row appended) | line-296 deletion makes removals `1` |
| Cards match `cards/ADR-024.md`'s shape | 🟢 | each card: one `# ADR-NNN · title · date · STATUS` title line, `\| Field \| Value \|` table, the six rows `Decision`, `Forces`, `Rejected`, `Consequences`, `Supersedes / amended by`, `Source`; `grep -c '\*\*'` on the three cards `0` (no bold labels) | the U2-7 copy control replaces 027's card with 024's and the status grep prints `0` |
| Card content is condensed from the ADR text, not a summary | 🟢 | 025: `"contrast"` default, achromatic fall-through, `on{N}Variant` follows the prime, `"fixed"` opt-out, 96 of 96 from 52, Adia 32 from 14, OD-001 closed, both rejected alternatives (flip alone; retune skew and lift) are in the ADR's Context and Rationale at lines 696-728. 026: `anchor`/`sourceAnchor`, window `[9.95, 95.05]`, detach on `hue`/`chroma`, 3,380 palettes, ~23 L\*, ten sources outside the window, 14 of 24, #725 and #701, owner acceptance 2026-09-20, all at lines 730-768. 027: four rules, six defects, #718/#719, no new gate, #723 | the U2-6 control shows a wrong range resolves to another ADR's heading |
| Index and ledger rows match the existing shapes | 🟢 | index rows carry title, ADR date, `decided (#662)` / `decided (#681)` / `proposed (#721), ratification is the owner's`, lineage, `cards/ADR-NNN.md`, the same six columns as the ADR-022 to 024 rows (ADR-022 already uses the `decided (#405)` form); ledger rows `live` / `live` / `proposed` with the lineage the plan dictates | the U2-5 restore control prints `0` rows |
| Em dash and retired maker brand | 🟢 | P2 above: `0` added em dashes in 140 added lines even counting backtick spans; branding clean at 650 files | P2 controls above |
| Handoff G0 line cites the sha it read | 🟢 | `printed 1 at origin/main 2a1cd5c802a0cf4396caf630b5a9358d16cb32d6`, rerun by the builder, with the ADR-027 freedom check at the same sha | the U2-8 malformed line prints `0` |

## The three Findings in the handoff

| Finding | Right? | Evidence |
|---|---|---|
| P4's control names `version: "1.1.0"`, which no longer exists | 🟢 yes | `grep -c 'version: "1.1.0"' scripts/gen-adia-derived-exports.mjs` prints `0`; lines 73 and 74 carry `"1.2.0"` since #681. The plan's literal plant matches nothing; the control still bites at the live string (P4 row above) |
| U2-7's control must copy the card too | 🟢 yes | row alone: `3`, `0`, `1` (first figure reads the card); card and row: `0`, `0`, `1` |
| `npm test` took 599 s, one second under the Bash tool's ceiling | 🟡 plausible, not rerun | the tool's documented `timeout` maximum is 600000 ms; the baseline's figure is `56 to 60 s`, so 599 s is a host-load figure (`flaky-gates` territory), not a suite regression, and it says nothing about this diff, which touches no test input. Worth the Orchestrator's note for the verifier's rerun host, not a defect in the unit |

## Findings, ranked

| Severity | Finding | Where |
|---|---|---|
| low | The handoff's P2 brand control says it was built "from a lowercase string"; the gate's name pattern is the retired maker name, uppercase only, so a lowercase name plant passes unless it carries the legacy tag or the domain (altered: retired name removed). The builder's control did fail the gate, so it planted one of those; the description undersells what bit. No change needed in the diff | `.sdlc/handoffs/records-policy-U2.md` P2 row |
| low | `decisions.md`'s state column has held only `live`, `superseded` and `live, fully executed`; `proposed` is a new value. The header says "a decision is live only after the Verifier grades it", so `proposed` is the honest state and the plan dictates it. Recording it here so the next reconciliation does not read it as a typo | `.sdlc/records/decisions.md:44` |
| note | Adapter §6 still says ADRs are numbered `## ADR-NNN <U+2014> title` and append "after ADR-022"; the plan rules the hyphen form on ADR-026's precedent and this unit follows the plan. §6's own text is stale on both points and is outside this plan's scope wall | `.sdlc/adapter.md` §6 |

verdict: 🟢
