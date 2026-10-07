## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 11: Shell icons size from the control icon role
level: L2
### Do
Depends on: step 7.
- `src/ui/icons.js` `icon(name, opts = {})` (`:44`): keep the `width="${size}" height="${size}"` attributes on the `<svg>` (`:51`) as the no-CSS fallback and because the shim reads attributes. Add an inline style on the same `<svg>`: `width:var(--sh-control-icon, ${size}px);height:var(--sh-control-icon, ${size}px)`. Every shell icon then sizes from the control icon role (handoff Decision 4, manifest a36), with the per-call literal as fallback.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `grep -qF 'var(--sh-control-icon, ${size}px)' src/ui/icons.js`
- (guard) `grep -qF 'width="${size}" height="${size}"' src/ui/icons.js`
- (guard) `node test/ui/headless-boot.mjs`
