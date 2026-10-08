Manifest: .sdlc/native-dom-charts/decompose/manifest-v1.json (technical-architecture · plan) · coverage_check: clean
Quadrant: load-bearing
Outside-in: six subsystems (core, renderer, styles, compositions, cleanup, gates, records); every pure-structure node is a grouping; the 12 `html:` sites reclassify as 9 Cartesian + 2 polar + 1 diagram, graphContrast/graphGeomComposition/graphTypeRoles are already native DOM and untouched.
Inside-out: 38 actions, all hosted; no tooltip/keyboard/pin/culling actions exist because the cards are snapshot-tier (no hit regions, 2 to 3 fixed labels), so none are unhosted by omission.
Hand-off: /plan
