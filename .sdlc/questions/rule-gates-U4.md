---
kind: question
plan: rule-gates
unit: U4
asked-by: orchestrator
asked: 2026-09-24
status: open
---

# rule-gates U4: the store product names after the em dash sweep

## Context

U4's automatic sweep (`--fix`, ruling B) rewrote a dash between two words as a comma. In two places the text is the product's name in the Lemon Squeezy store, which is the owner's call, not a style edit:

- `.claude/skills/ultimate-tokens-brand-voice/scripts/store-drift-check.mjs`, `PRODUCT_NAME`: was `Ultimate Tokens — Pro` and `Ultimate Tokens — Studio`, now `Ultimate Tokens, Pro` and `Ultimate Tokens, Studio`. `DESC_PROBES`: was `derived — not guessed`, now `derived, not guessed`.
- `docs/marketing/store-copy.md` lines 117 and 171, the text pasted into the store, carry the same names.

The drift check compares these strings with the live store. Whatever the repo says, the check warns until the store dashboard is re-pasted to match. The comma form reads as a list ("Ultimate Tokens, Pro"), which the reviewer flagged (rg-U4 review, finding 4).

## Question

What should the Pro and Studio product names be in the repo, and later in the store?

## Options

1. `Ultimate Tokens Pro` and `Ultimate Tokens Studio`, no punctuation (Recommended). This is the plainest tier naming. The tagline probe becomes `derived, not guessed`. The owner re-pastes the store names at the next dashboard walk.
2. `Ultimate Tokens: Pro` and `Ultimate Tokens: Studio`, with a colon, which the reviewer suggested. The re-paste is the same.
3. Keep the live store's em dash name. The check's needle uses the `—` escape (as `voice-check.mjs` does at 0faca70d), and `store-copy.md` names it in its own words. There is no store change, but the repo's source for the name no longer carries it verbatim.

## Answer

(pending)
