# Question chroma-envelope U2 · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope U2 pass 2, U3 criteria, plan revision 5 (the sixth revision row, past the cap of 5) |
| Evidence | `.sdlc/handoffs/chroma-envelope-U2.md` and `.sdlc/plans/chroma-envelope-U2-rediagnosis.md` (unit/ce-U2 @ b7ee8f7c; copy on main) |
| Finding | U2's cap works as asked (no ramp without an anchor moves, no cell rose). Two plan literals cannot hold. C2.3: 15 near-grey anchors sit below white's own CAM16 chroma (2.869), so their stop 50 overshoots by construction. C2.2: the stop-300 p90 miss comes from dark anchors below the cusp, a lightness effect: 100.2 / 99.6 even after U3's hold and retune, so reordering or merging units does not help. The cap also collapses adjacent stops at the extremes (new duplicate hexes, allow-lists move). |
| Question 1 | How is READING (a) ruled for anchored ramps? |
| Options | A (recommended): keep U2's engine. The bars apply to the gate path (the anchor omitted, the rows the plan's predictions already used). The anchored path is reported and gated by the U1 ratchet plus clause counts; a white-pixel exclusion for C6 (v); the allow-lists frozen once, at U3, with the movement declared. Criterion text only, no new engine work. · B: an absolute envelope on the anchored path. Every cell goes green, but it greys the light half of every dark-anchored ramp (Nike stop 300 chroma 19.7 to 7.5, Sapa 46.8 to 22.6), adds more duplicates (31 / 76) and adds an engine change of size M to L. · C: re-freeze only and defer C2.2 to U3. This is A with a delay and no new information. |
| Question 2 | May the plan take revision 5 (a sixth revision row) to write the ruled option's criterion text (C2.2, C2.3, C2.4, C2.7, C3.2, and a third mechanism in the diagnosis)? |
| Options | Yes (recommended) · No, return to the planner for a fresh plan |
| Default if unanswered | none: this re-rules R69's measured bars, so it waits for the owner |

## Answer (owner via AskUserQuestion, 2026-09-29, R74)

| Field | Value |
|---|---|
| Question 1 | A: keep U2's engine; the R69 bars apply to the gate path, the anchored path is reported and held by the U1 ratchet plus clause counts, a white-pixel exclusion for C6 (v), allow-lists frozen once at U3 with the movement declared. Criterion text only |
| Question 2 | Yes: revision 5 (the sixth revision row) is allowed to write the option A criterion text |
