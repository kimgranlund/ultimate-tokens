Manifest: .sdlc/ui-standardization/decompose/manifest-v1.json (technical-architecture · plan) · coverage_check: clean
Quadrant: load-bearing
Outside-in: 13 leaves under five groups (text roles, anatomy, motion, default cell, evidence and records); every group node carries `justify: grouping`; no leaf without an action.
Inside-out: 21 actions, all hosted; a2 (bind selectors to roles) and a8 (radius composition) and a21 (move tests off product-md) each span two nodes by design, no action names a solution it does not need.
Hand-off: /plan

Notes for the planner:
- One writer per file: styles.css is touched by n2, n5, n6, n7, n8 (serialize them, or one builder for all five); app.js by n3 and n4 (serialize).
- n1, n9, n10 are independent prep slices and can run in parallel before the styles.css chain.
- n11 (smoke) and n12 (records) close the ticket; n12 needs n1's tables, not the CSS.
