# Adia 16-family fitted document: residuals

Companion to the fitted 16-family Adia entry in `docs/reference/colors/categories/brands.json`
(ticket #618). Residuals below are verbatim from the fitting pass posted on #618's comment thread
(comment `5647610524`, 2026-09-12), this file reproduces that data rather than re-deriving it, so
adia-ui-kit's K3 side-by-side design-review page can link to a stable in-repo copy.

## Shared controls (all 16 families)

`lmin: 3, lmax: 100, damp: 89, dampCurve: 1.3, dampAmp: 70, dampBias: 0`

`paletteGroups.baseChroma`, `material: 25, brand: 41, system: 32, data: 27`

## Ramp residuals (25 stops × 16 families)

Reported as aggregate ranges across all 16 families, not a per-family breakdown, the fitting
pass posted on #618 did not publish per-family ramp numbers beyond these ranges and the two named
worst-case families below. Reproduced as-is rather than fabricated to a finer grain:

| Metric | Mean range (across families) | Max | Worst family |
|---|---|---|---|
| ΔL | 0.0002 – 0.0039 | 0.0108 | Info |
| ΔC | 0.0008 – 0.0021 | 0.0097 | Danger |
| ΔH | 0.2° – 2.0° | spikes to 5–9° | only at near-achromatic stops (target CSS's own 8-bit rounding artifact, not this fit) |

## Prime-ladder residuals (7 swatches × 16 families)

Most families: ΔL mean < 0.003. Five families are noticeably worse post-rounding, flagged to
adia-ui-kit's owner for their K3 review (prime is unwired on their importer today, per their
reply, so this likely doesn't gate it, but the numbers are real and not yet accepted as of this
commit):

| Family | ΔL | ΔC |
|---|---|---|
| Neutral | 0.016 | none |
| Secondary | 0.013 | none |
| Data 1 | 0.015 | up to ~0.02 |
| Data 2 | 0.022 | up to ~0.02 |
| Data 5 | 0.010 | none |

Status: **accepted as-is** (owner sign-off recorded on adia-ui-kit's #251, 2026-09-13: the prime-ladder residual, 5 families at dL 0.010-0.022, is accepted, no refit owed from ultimate-tokens; #253, the review page, is closed). Does not block this commit or
`#616`'s tag cut, per the ruling recorded on #618 (comment `5647608697`, 2026-09-12): this
repo's own gate is the versioned/tagged commit itself, not what ships downstream; shipping happens
on adia-ui-kit's own side, held for their owner's review there.

## Source

Round-tripped through this repo's real pipeline (`persist.hydrate()` → `model.stateOf()` →
`engine/exports.js`'s `derivedAll()`/`exportOKLCH()`), validated against adia-ui-kit's committed
`adia-design-system-colors.css` at the per-family/per-stop level.
