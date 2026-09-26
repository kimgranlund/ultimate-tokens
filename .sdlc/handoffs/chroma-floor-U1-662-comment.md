Filed from `#701` (chroma-floor) U1, owner ruling R44 (`.sdlc/questions/chroma-floor-U1.md`).

U1 adds a neighbourhood shoulder to the even-mode `chromaEnvelope` (a smoothstep plateau,
`EVEN_NEIGHBOURHOOD_R = 0.2`, `src/engine/tonal.js`) that raises chroma at stops 450/550, closing
65 lone chroma spikes at the anchor stop (64 corpus + 1 default kit, `test/engine/anchor.mjs`).
The same construction moved five of the default kit's even accent contrast ratios down against
their pinned `FLOORS` entries in `test/engine/semantic.mjs` (all still far above the ruled AA
floor, 4.5:1):

| family | side | before | after | floor before | floor after |
|---|---|---|---|---|---|
| Warning | light | 9.9148 | 9.8756 | 9.9 | 9.8 |
| Warning | dark | 5.3334 | 5.2819 | 5.3 | 5.2 |
| Data 3 | light | 6.5224 | 6.4562 | 6.5 | 6.4 |
| Data 5 | light | 5.8350 | 5.7748 | 5.8 | 5.7 |
| Data 8 | light | 5.8570 | 5.7955 | 5.8 | 5.7 |

Re-pinned to `floor(measured, 1dp)` per the table's own stated convention; `FLOORS` comparator
against `<base>` (282fca8d) reads 4 changed `even` rows, all `DOWN` (Warning's light+dark move
together as one row). No `perceptual` or `peak` line moved (mode-isolation gate, `#701` U1's C6).

Nothing here needs #662 to act - the on-color policy is unaffected and every cell holds AA by a
wide margin (worst case: Info dark at 4.5840:1). Filed per C8's own rule ("any downward move ...
handed to #662's policy") so the erosion has a record outside the plan.
