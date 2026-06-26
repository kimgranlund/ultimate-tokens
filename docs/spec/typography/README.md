# Typography tokens — reference shape

`typography.tokens.json` is the **target output shape** for a planned typography feature: the type
analog of the color engine — a few parameters → a systematic, harmonious type scale → exported as
[DTCG](https://tr.designtokens.org/) tokens (and, in the plugin, Figma text styles). It's a real
Figma-exported token set, kept here as the canonical example to generate *toward*. Font-role names are
generic (no brand/foundry specifics).

## Structure

| Top-level key | What it is |
|---|---|
| `Number` | a base numeric token |
| `Font Family` | the named **font roles** — `Font: UI`, `Font: Display`, `Font: Code` (mono) |
| `Font Specs` | the **scales**, grouped by role category (below) |
| `$extensions` | Figma mode metadata |

### `Font Specs` — four role "voices"

Each is a size ramp; each step carries `Size · Single-line Height · Multi-line Height · Letter Spacing ·
Paragraph Spacing · Paragraph Indent · Weight`.

| Category | Steps | Sizes | Weight | Letter-spacing character |
|---|---|---|---|---|
| **UI** | `3XS … 2XL` (8) | 10–20 px | 450 | **positive, grows as size shrinks** (optical: +0.6 @10px → 0 @20px) |
| **Content** (body) | `XS … XL` | 20–36 px | 450 | small positive |
| **Display** | `XS … XL` | 36–120 px | 900 | **negative, tightens with size** (≈ −0.05 × size) |
| **Heading** | `Eyebrow · Context · Editorial` (each a size ramp) | — | varies | per-treatment |

## The system relationships (what the generator derives)

Mirroring color (`{hue, chroma, distribution}` → even tonal ramp), type derives from
`{ base size, modular ratio per category, leading per category, weight ramp, optical tracking
coefficient, font roles }`:

- **Size** = a **modular scale** (e.g. 1.2 Minor Third for UI, 1.333 Perfect Fourth for editorial, 1.5–1.618 for display).
- **Letter Spacing** = `f(size)` — negative to *tighten* large display, positive to *loosen* small UI text (optical).
- **Multi-line Height** = `size × leading` (~1.5 for body/UI, ~1.1–1.25 for display/headings); **Single-line Height** = `size × 1.0`.
- **Weight** ramps by role — heavy Display (800–900), medium Heading, regular Body/UI (~450).

A set of **treatments** (Product/Lifestyle, Luxury, Editorial, Technical/Data, Brutalist) seed these
params, exactly as the color "Color Categories" presets seed palette params.

> Status: **reference only** — the generator + UI that produce these tokens are not built yet.
