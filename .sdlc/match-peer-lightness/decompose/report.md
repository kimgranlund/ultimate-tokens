Manifest: .sdlc/match-peer-lightness/decompose/manifest-v1.json (technical-architecture · plan) · coverage_check: clean
Quadrant: load-bearing
Outside-in: five subsystems (engine, document, UI, tests, records); every leaf hosts an action; the ramp branches split per builder because each reads tone at a different line (tonal.js:919, :1431, :1508/:1017); the extreme-chroma pin is its own leaf (n1f) because it is a chroma term shared by all four branches.
Inside-out: 22 actions; a6 (mode-off byte identity) is hosted five times on purpose (four engine leaves plus the neutrality run); a17/a18/a22 are proofs or rulings hosted by gates and records, not new code; a19 to a21 carry the added extremes requirement (opt-in only).
Hand-off: /plan
