# Handoff: bold-labels U2 (#752)

| Field | Value |
|---|---|
| Branch | `unit/bl-U2` @ `134c72170314c3c472d74c4ef2c5bd65eddee794` |
| Base | `plan/bold-labels` @ `0b551835` (`$B` = merge-base with `origin/main` = `e3a114d675a48c78cefa482f9584bcfd90545f3c`) |
| Worktree | `/Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/bl-U2` |
| Files touched | `docs/marketing/store-copy.md` (32 lines edited, 1 file) |
| Ran | `npm test` (twice, both green, tree clean after except the intentional edit) |

## The 32 labels, as edited

Line 30 rewritten (would have doubled the colon):
`**Placeholders**, replace before publishing:` → `**Placeholders** to replace before publishing:`

The other 31 took a plain colon in place of the sweep's comma (label unchanged, only the punctuation after `**` moved):

52, 58, 66, 75, 81, 87, 93, 99, 123, 129, 177, 182, 375, 417, 424, 428, 431, 435, 452, 464, 488, 505, 518, 540, 549, 558, 568, 581, 586, 595, 632.

Labels: `` `stores.attributes.name` ``, `` `stores.attributes.slug`/`.domain`/`.url` ``, `` `stores.attributes.avatar_url` ``, `Storefront tagline`, `Storefront description (short)`, `SEO meta title`, `SEO meta description`, `Open-graph / social card description`, `Listing excerpt` (×2), `` `products[1182548].attributes.description` ``, `` `products[1182535].attributes.description` ``, `Checkout reassurance footer`, `` `discounts.attributes.name` ``, `` `discounts.attributes.code` ``, `` `discounts.attributes.amount`+`.amount_type` ``, `` `discounts.attributes.duration` ``, `` `discounts.attributes.expires_at` ``, `Confirmation / thank-you page`, `Receipt / subscription-confirmation email`, `Studio welcome email`, `License-key delivery (if sent separately)`, `Onboarding nudge (a few days later, optional)`, `Renewal reminder (optional)`, `Payment failed (dunning)`, `Cancellation confirmation`, `Subscription ended / downgraded to Free`, `Refund policy`, `License terms summary (EULA-lite)`, `Support line`, `Launch announcement + social variants`.

No em dash added anywhere; no bold label added or removed beyond the punctuation change; no fenced block touched.

## Per-criterion evidence

**U2-1** (32 removed, 0 added, 0 residue)
`git diff "$B" -U0 -- docs/marketing/store-copy.md | grep -cE '^-\*\*[^*]+\*\*, '` → `32`
`... grep -cE '^\+\*\*[^*]+\*\*, '` → `0`
`grep -cE '^\*\*[^*]+\*\*, ' docs/marketing/store-copy.md` → `0`
Control (skip line 632, revert its colon back to a comma): `31`, `0`, `1`, matching the plan's stated control exactly.

**U2-2** (voice-check silent and green)
`FORCE_COLOR=0 node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs docs/marketing/store-copy.md; echo exit=$?` → no output line, `exit=0`.
Control (scratch copy, appended `, leverage it` to line 52 outside any fence): `✗ .../store-copy.md:52 ERROR: banned lexicon: "leverage"`, `exit=1`.

**U2-3** (no fenced block changed)
`diff <(git show "$B":docs/marketing/store-copy.md | awk '/^```/{f=!f; next} f') <(awk '/^```/{f=!f; next} f' docs/marketing/store-copy.md) && echo blocks-identical` → `blocks-identical`.
Control (scratch copy, appended `X` to one character inside the first fenced block): diff prints the changed line, no `blocks-identical`.

**U2-4** (Placeholders line reads as ruled)
`grep -c '^\*\*Placeholders\*\* to replace before publishing:$' docs/marketing/store-copy.md` → `1`.
Control: same grep at `$B` → `0` (today's baseline, confirmed).

## Plan-level P checks (run against this unit's head)

- P1: `git ls-files '*.md' | grep -v '^\.sdlc/' | xargs grep -HnE '^[[:space:]]*\*\*[^*]+\*\*, ' | ...` → `53`. This is the "branch cut before U1 merged" case the plan names (U1 is being built in parallel in its own worktree and hadn't merged into `plan/bold-labels` when this unit's branch was cut, so `.sdlc/plans/bold-labels-kept.tsv` doesn't exist yet here and `kept-exact` is not expected at this head; matches the plan's alternate expectation of `53` verbatim).
- P2: `em-dash: clean (805 files scanned)`, exit 0; `git diff "$B" | grep -c em-dash` → `0`.
- P3: `branding: clean (797 files scanned)`; added bold-label-line count `32`, removed `32` (every added line replaces one removed line 1:1, no rewrite row in U2 the way U1 has one).
- P4: scope wall `0`, `0`, only `docs/marketing/store-copy.md` touched, nothing under `src/`, `test/`, `scripts/`, `figma/`.
- P5: `line-for-line`, insertions equal deletions per file (32/32).
- P6: `npm test` → `all 53 test files passed` (run twice, both green); `git status --short` → only `docs/marketing/store-copy.md` (this unit's own uncommitted-then-committed edit), no generated-asset drift.

## Left out

- U1's `.sdlc/plans/bold-labels-kept.tsv` and the pre-land `kept-exact` reading of P1: that's U1's and the pre-land pass's job, not U2's; U2's own criteria (U2-1..U2-4) don't depend on it.
- No gate added (Q2: no gate, per the owner ruling).
- #748 (the voice reread of the swept store copy) is untouched and unblocked (U2-3 proves the fenced blocks it will reread are byte-identical).
