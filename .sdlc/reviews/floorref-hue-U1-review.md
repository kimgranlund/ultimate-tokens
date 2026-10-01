
## Addendum: judged against plan revision 1 (main 563a921f)

Verdict unchanged: PASS. C1.1 to C1.4 are unchanged in revision 1 apart from C1.4's 'Today' column, and all four still hold.

| Item | Against revision 1 | State |
|---|---|---|
| Rendered `EXPORT_STOPS` 94,500 / 4,441 / 1,523 / 339 / 9.11 C, histogram 959 · 729 · 2,607 · 121 · 25 | Reproduced exactly by the reviewer's independent prototype. The revision's cause (Adia counted once on the rendered EXPORT pass, non-anchored, its 7 gate movers) matches F2's cell arithmetic | 🟢 |
| Gate `EXPORT_STOPS` 94,900 / 7 / 3 / 1 / 0.60 C | Reproduced exactly | 🟢 |
| F1, C2.1 control | Still open. Revision 1 keeps "at most 6" and "any single fixed rotated hue" and has the verifier read count plus dC. The stop 300 mutant moves 6 cells at max dC 0.34 C, so it passes both numbers and the hueShift-0 line. The control is therefore not blind-proof as worded | 🟡 planner |
| F2, script comment | Revision 1 states the true reason for leaving Adia out (non-anchored, rendered equals gate). The script comment at `:65-66` / `:607-610` still gives the false damped-envelope reason | 🟡 builder, low |
| F4, kit anchors | Revision 1's census still says the default kit is "non-anchored". All 16 kit palettes carry `anchor` (`src/ui/model.mjs` DEFAULT_PALETTES), and its rendered path moves 24 cells under the prototype. C2.6's "byte-identical because the kit is non-anchored" needs a different reason, or a check that `intensity-legacy` renders without the anchor | 🟡 planner |
