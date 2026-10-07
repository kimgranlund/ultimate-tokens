## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 10: Shell chips and switch size from the roles
level: L2
### Do
Depends on: step 7.
- `src/ui/styles.css` `.chip {` (`:787`): `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text); gap: calc(var(--sh-chip-inset) / 2);`. `border-radius: 999px` stays, because the shell chip is a pill by design.
- Switch (Maison `choice.mjs:21-22`, via the architect Carry forward):
  - Remove `--ctl-thumb: 15px` from the `:root` block (`:51`). Declare `--ctl-thumb: calc(var(--sh-control-icon) - 4px);` in the `ultimate-tokens` alias block instead: a 2px edge on each side, and `--sh-control-icon` resolves only on the host.
  - `.toggle .track` (`:953`) becomes `inline-size: calc(1.75 * var(--sh-control-icon)); block-size: var(--sh-control-icon);` with its px width/height removed. `.toggle.on .track::after` (`:963`) translates by `calc(0.75 * var(--sh-control-icon))`. The range thumbs (`:935`, `:940`) keep reading `--ctl-thumb`.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^\.chip \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-chip-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px|font-size: *[0-9.]+px'`
- (red) `! grep -qE -- '--ctl-thumb: *[0-9]' src/ui/styles.css`
- (red) `blk=$(awk '/^\.toggle \.track \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-icon)'`
- (red) `! grep -qF 'translateX(15px)' src/ui/styles.css`
- (guard) `node test/ui/headless-boot.mjs`
