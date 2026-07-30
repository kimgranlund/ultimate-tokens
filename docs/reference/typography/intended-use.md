# Intended use — voices, weight ranks, registers

What each part of the typography system is **for**, so a preset (a brand preset in
`docs/reference/colors/categories/brands.json`, or the generated Color Categories sets) can be
authored and reviewed by *reasoning* — "does this face serve what this voice is for?" — instead of
pattern-matching. Mechanics (sizes, leadings, ladder math) live in `src/engine/type.mjs` and
`README.md`; this doc holds only the purpose layer. The preset gate
(`test/engine/categories.mjs` + the face-existence check) enforces what is mechanical here;
everything else is review judgment against these entries.

## Layer 1 — the fifteen voices

Each entry: the voice's **job**, **where it appears**, and **what a face choice must serve**.
A preset override that can't be justified against the third column is wrong for that voice, even
if it renders.

| Voice | Job | Appears | A face must serve |
|---|---|---|---|
| **Display** | The brand's loudest statement — hero text, anthemic one-liners | Landing heroes, splash, campaign moments | Maximum character at 72–120px. The ONE voice where a brand's most expressive named cut belongs (`styleName`, e.g. BZZR's Compressed Black Italic). Must survive tight leading (0.8) and negative tracking. |
| **Headline** | The page's own name — the H1 | Page/article tops | Strong but readable at 32–48px; sentence case; sibling emphasis rarely needed inline. |
| **Sub-heading** | A CONTEXT label above a list/grid ("LATEST STORIES") — not a subordinate H2 | Section tops | Reads as caps: wide positive tracking, bold. A condensed cut works here (BZZR: Condensed Bold). |
| **Title** | A smaller Headline — names a card, panel, or dialog | Cards, panels, modals | Same family logic as Headline, one register down; must not out-shout Headline. |
| **Sub-title** | A smaller Sub-heading in the alternate (mono-default) face | Under Titles, small section heads | Prose, uppercase, widest tracking (30% em) — the face must stay legible caps-tracked at 18–32px. |
| **Lead** | The intro paragraph — larger body, single emphasis (former Quote folds in) | Article/section openers | A reading face at 20–28px; weight is a free character lever (Luxury sets it Light). |
| **Body** | The reading text (former Legal folds in) | Everywhere prose runs | A quiet workhorse Regular. Core ≤450 (the Regular-face snap — see Layer 2); character lives elsewhere. |
| **Body-mono** | Body dressed in mono — code-adjacent prose, technical excerpts | Docs, terminals, data prose | The mono role at Body's own sizes; a font-only variant, never a different size register. |
| **Label** | The STATIC label — names a thing, may wrap | Field labels, list metadata | Legible at 12–14px, slight positive tracking; interactive text is NOT this voice (that's UI-control/UI-widget). |
| **Label-mono** | Label in mono — data/ID labels | Tables, keys, hashes | Mirrors Label; mono at Label's sizes. |
| **Kicker** | The eyebrow/overline — an uppercase section flag in mono | Above headlines, category tags | Caps + very wide tracking (16% em) at Label's sizes; its own voice, not a mono Label. |
| **Tiny** | The smallest prose — footnotes, captions (former Caption folds in) | Fine print | Must hold at 9–11px; nothing decorative survives here. |
| **Tiny-mono** | Tiny in mono | Timestamps, fine data | Mirrors Tiny. |
| **UI-control** | INTERACTIVE control text — buttons, inputs, selects | Every control | The full 6-step XS..2XL ramp; composes into geometry's control ramp — a change here moves control heights. Box voice (single-line height). |
| **UI-widget** | Compact-widget text — tags, badges, switches | Dense chrome | The 6-step ramp one register under UI-control; same box behavior. |

Aliasing law: every `-mono` voice and Kicker ride their non-mono sibling's exact sizes — the mono
font is the whole difference. A preset must never give them a distinct size story.

## Layer 2 — the weight ranks (two-tier, #303/#307)

Ranks are RELATIVE positions among a voice's deduplicated resolved weights — labeled by rank,
never by face name. Full mechanics: `.claude/skills/type-scale/references/weight-ladders-and-labels.md`.

| Tier | Voices | Ranks & what each is for |
|---|---|---|
| **Expressive** (Display · Headline · Sub-heading · Title · Sub-title · Kicker) | character carriers | 3 bidirectional stops (`Lighter/Light/Heavy/Heavier`): tonal variants of the voice's character — a lighter hero for a quiet page, a heavier one for a launch. They restyle the VOICE, not inline words. |
| **Body-class** (Lead · Body · Body-mono · Label · Label-mono · Tiny · Tiny-mono) | reading text | 2 strictly-heavier stops, fixed faces: `regular`=Regular(400) — the text itself; `bolder`=Medium(500) — inline emphasis, a strong word; `boldest`=Semi-bold(600) — the loudest inline emphasis that still reads as body text. Never a display weight. |

Two laws every preset must satisfy:

1. **Body-class cores stay ≤450** so the style labeled "regular" renders the Regular face (460+
   silently snaps to Medium — shipped once, found live against BZZR).
2. **Every configured weight must resolve to a REAL, distinct cut** of the actual family. A
   missing cut falls back to the nearest face and two "different" siblings render identically
   (GT America has no 600/800 — its body-class boldest is Bold 700; `weights: []` opts a voice
   out when no real sibling exists). Research the family's cuts before writing the ladder.

## Layer 3 — registers: mapping a brand's own taxonomy onto the voices

A brand arrives with its OWN register names (tone-of-voice tiers), not our fifteen voices. Preset
authoring = mapping registers → voices, then picking faces that serve both the register's intent
and the voice's job above. The worked example — BZZR
(`~/Projects/bzzr/brand-corpus/04-expression/typography-guidelines.md`):

| BZZR register | Intent | → Voices | Face (GT America) |
|---|---|---|---|
| **Anthemic** | the brand shouting | Display | Compressed Black Italic (named cut, `styleName`) |
| **Contextual** | framing, section-setting | Headline · Sub-heading | Black · Condensed Bold |
| **Actionable** | do-something text | UI-control · UI-widget · Label | Medium-class |
| **Functional** | plain reading | Body · Lead · Title · Sub-title | Regular · Medium |
| **Data** | machine-adjacent | the `-mono` voices · Kicker | GT America Mono Regular · Medium |

Method: map the register with the matching *intent* (not the matching *name*), give each mapped
voice the register's face where the voice's own "must serve" column allows it, and let unmapped
voices take the quiet default — a register never forces a face onto a voice whose job it would
fight (Anthemic's italic display cut has no business in Body, however on-brand it is).
