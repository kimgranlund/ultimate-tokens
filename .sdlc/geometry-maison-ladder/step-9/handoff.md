## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 9: Shell segmented controls size from the roles
level: L2
### Do
Depends on: step 7.
- `src/ui/styles.css` `.segmented button {` (`:867`): `min-block-size: calc(var(--sh-control-height) - 6px); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); border-radius: var(--sh-radius-inset);`. The group's 2px padding and 1px border on each side make the whole group one control height.
- `.segmented.seg-sm button` (`:881`) takes the chip row: `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text);`.
- `.canvas-seg button` (`:882`) and `.app-header .section-seg button` (`:1340`) take `padding-block: 0; padding-inline: calc(var(--sh-control-inset) * 2);`, which keeps their wider stance.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^\.segmented button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (red) `blk=$(awk '/^\.segmented\.seg-sm button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-chip-height)' && ! printf '%s\n' "$blk" | grep -qE 'font-size: *[0-9.]+px'`
- (red) `for sel in '^[.]canvas-seg button [{]' '^[.]app-header [.]section-seg button [{]'; do blk=$(awk -v re="$sel" '$0 ~ re {f=1} f{print} f&&/[}]/{exit}' src/ui/styles.css); test -n "$blk" || exit 1; printf '%s\n' "$blk" | grep -qF 'var(--sh-control-inset)' || exit 1; done`
- (guard) `node test/ui/headless-boot.mjs`
