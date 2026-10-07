## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 8: Shell buttons and inputs size from the roles
level: L2
### Do
Depends on: step 7. Only the two base rules change.
- `src/ui/styles.css` `button {` (`:157`): replace `padding: 4px 9px`, `gap: 6px` and `border-radius: var(--r-sm)` with `min-block-size: var(--sh-control-height); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); gap: calc(var(--sh-control-inset) / 2); border-radius: var(--sh-control-radius);`. This follows the Maison usage in the handoff; gap = inset / 2 is the glyph rule from the architect Glyphs section. Keep `font: inherit` before the new `font-size`.
- `input[type="text"], input[type="search"], select {` (`:192`): the same, minus `gap`.
- Every other selector is untouched. This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && for s in 'var(--sh-control-height)' 'var(--sh-control-inset)' 'var(--sh-control-text)' 'var(--sh-control-radius)'; do printf '%s\n' "$blk" | grep -qF -- "$s" || exit 1; done`
- (red) `blk=$(awk '/^button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (red) `blk=$(awk '/^input\[type="text"\], input\[type="search"\], select \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (guard) `node test/ui/headless-boot.mjs`
