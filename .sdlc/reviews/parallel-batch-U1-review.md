PASS

# Review U1 pass 1 · reviewer to orchestrator

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/parallel-batch.md` U1 (#748 item 1, #796 marketing), criteria C1.1 to C1.5 |
| Branch | unit/pb-U1 @ cb5051f2 (content 46e04538), base 61bcd123 |
| Verdict | 🟢 PASS: every criterion green on my own runs; five low findings, none blocking |

## Criteria

| # | Result | Evidence (my run, `.worktrees/pb-U1`) |
|---|---|---|
| C1.1 | 🟢 | `grep -rn "eleven" docs/marketing \| grep -ic voice` prints `0`; at base 61bcd123 it prints `4`. No `11 voices` digit form either |
| C1.2 | 🟢 | `fix-old-names: keep` count `3` at HEAD and at base, on `claude-plugin.md` lines 19, 33, 60 (both edited lines keep the marker) |
| C1.3 | 🟢 | `em-dash: clean`; `makeVoices` has `15` keys; edited count lines read `15 voices` (landing :41), `15-voice` (plugin :19, :60), `15 type voices` (boilerplate :38). Planted U+2014 in landing: exit 1, landing named. U+2014 appears in the diff only on the two removed CTA lines |
| C1.4 | 🟢 | `git diff --name-only 61bcd123 HEAD`: the four `docs/marketing/**` files plus the handoff. No `.claude/docs/other` file tracked |
| C1.5 | 🟢 | Reran the `~~~sh ran` block: diff against `~~~out ran` is line 1 only (`cb5051f2` vs `46e04538`), as the handoff states. `claims rows 85 fail 0` |
| Gate | 🟢 | `npm test` (NODE_OPTIONS unset, gate load 4 before start): `✓ all 54 test files passed`, exit 0, `git status --short` empty after |

## Claims ledger checks

| Check | Result |
|---|---|
| Independent `grep -cF` sample, 14 present rows (store-copy: tiers, `public on purpose;`, SEO title, `with every update`, Studio seats, `(§6)`, `(§5)`, `Reply to this email or write to`, `so you're back to Free`, `simply back`; landing: `15 voices from display to fine print, 5 treatments`, the thesis sentence, `Open the app (free)`, `per user): unlimited kits`) | all `1` |
| 4 absent rows (`Product, `, `(Ultimate Tokens)`, `instead (§4.2)`, `Studio, `) | all `0` |
| Planted negative controls on a copy of the ledger: a present needle mutated, an absent needle made to match | the ledger script reports `fail 2`, naming both rows: it bites in both directions |
| Swept-line coverage: `git blame 61bcd123` lines from 37b04676 and 1ba47350 (152) vs the verdict table's line refs | every swept line has a verdict except base `:219` (see L3) |

## Polished edits read against voice-platform §4 and §5

Read 19 edits. None changes a price, a count other than the mandated eleven to 15, or a product name. R37 names (`store-copy.md:117`, `:171`), the thesis line (`:131`, landing `:15`) and the storefront tagline (`:78`, landing `:90`) are untouched.

| Edit | Factual change? |
|---|---|
| store `:19`, `:20` `Pro product`, `Studio product` | no, label form |
| store `:35` `purpress` to `purpose`, `2026-07-09:` | no, typo and punctuation |
| store `:90` SEO title `Ultimate Tokens · Perceptual design-token generator` | no, same words, 51 chars |
| store `:101` social card, `:140` Figma variables aside, `:145` design-system aside | no, parentheses only |
| store `:151` `2 brand kits`, `:159` `$39/year` | no, §5 copy-desk form of the same fact |
| store `:174` `§4.1`, `:348` `§6`, `:411` `§5` | corrections: §4.1 is the hosted deep-links, §6 holds the Studio email, §5 is Discounts |
| store `:370` `Subscribe ($39/year)` | no, matches the landing CTA |
| store `:405` Studio receipt, `it` added | no |
| store `:506` `Reply to this email or write to` | no new promise: pre-sweep text was `Just reply` followed by a dash and `{{SUPPORT_EMAIL}}`; `Just` dropped per §5 |
| store `:578` `just` to `simply` | no; §5 names this calming use canonical |
| landing `:41` `headline` to `display` | yes, a correction toward the fact sheet: the first of the 15 voices is Display (`fact-sheet.md:22`) |
| landing `:52` `cannot drift` to `can't drift from each other` | narrows the claim to §3's truthful re-derivation form (`voice-platform.md:57`) |
| landing `:34` `Light and Dark` | no, §5 mode-name casing |
| landing `:79`, `:81` pricing lines | no, same prices; `+$19/seat/year` moved inside the parenthesis |

## Findings (ranked)

| # | Severity | Finding | Where |
|---|---|---|---|
| L1 | 🟡 low | A kept swept line still carries a copy-desk price deviation: `add more anytime at $19 / seat / year`. §5 prices are `$19/seat/year` in prose, and the builder fixed the same class at `:159`. Customer copy pasted into the Studio description; the bold line three rows down already reads `$19/seat/year` | `store-copy.md:188` |
| L2 | 🟡 low | Mode names left lowercase in customer copy, `across light and dark`, while landing now reads `Light and Dark`. Not a swept line (the polished `:134` is the next sentence), so outside the strict charter; the same form survives at `boilerplate.md:28` and `:37` | `store-copy.md:133` |
| L3 | low | The verdict table has no row for base `:219` (HEAD `:218`, `Free vs Pro vs Studio: comparison table`), which was polished. The Claims ledger covers it, so the change is accounted for; the table is incomplete by one line | handoff, rubric verdict table |
| L4 | low | Pre-existing stale pointer on an edited line: §9 and §10 item 11 send Account-panel microcopy to `src/ui/app.js`; the panel lives at `src/ui/overlays/settings.js:395-402`, and only the cap toast is in `app.js:1239` | `store-copy.md:608`, `:657` |
| L5 | info | Both receipt-note sign-offs are now a separate paragraph (`> Ultimate Tokens`); pre-sweep they were inline. `receipt_thank_you_note` is one text field, and whether LS keeps the line break is unverified. Flattened, it still reads correctly. Worth a look during the owner's §10 walk | `store-copy.md:400`, `:408` |

L1 and L2 are one-line fixes that could fold into this unit or ride with handoff open item 3. Neither is a C1 criterion.

## Kept lines sampled

`:7`, `:78`, `:83`, `:84`, `:126`, `:148`, `:188`, `:258`, `:262`, `:392`, `:424`, `:586`, `:611`, plus internal `:27`, `:28`. Mechanical misses: L1 only. `:611` matches the shipped `settings.js:395` string verbatim, so keeping it is right. `:27`, `:28` (`$39 / year`) and `:392` (`empty, DECIDED`) are internal notes, not customer copy.

## Handoff open items

| Item | Outside U1? |
|---|---|
| `settings.js:402` present-tense hosted MCP, no price | 🟢 yes, `src/` (confirmed in the file: `and hosted MCP.`, no price) |
| `voice-check.mjs` misses spelled-out counts | 🟢 yes, `.claude/skills/` |
| voice-platform §5 still names an `em-dash form` | 🟢 path is under `docs/marketing/**`, but plan §3 scopes U1 to the swept lines of store-copy and landing plus the four counts, so outside the charter |
| live LS store carries pre-sweep text | 🟢 yes, #748 item 2, owner's §10 walk |
