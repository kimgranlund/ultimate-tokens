# Question pane-context pre-land pass 3 · from orchestrator

| Field | Value |
|---|---|
| Blocks | #785 landing (draft PR #797); compute-layers U3 waits on it |
| Evidence | `.sdlc/verdicts/pane-context-prepr.md` pass 3 🔴 at `94bcd8aa` |
| Finding | Every pass 2 red is closed and every gate, smoke, check and CI sweep leg is green with a control that went red. The one 🔴 is a live comment this diff made false: `src/engine/tonal.js:109-110` says `palette.chroma` is "the absolute group target on the group-resolution callers", but `paletteStops` now re-enters at `:946` with chroma 100, so no call below it sees the group value. Comment only, no pixel moves. The record asks for a sweep of the whole "group target" class, not one line. The plan is at revision 15, past the cap of 5. |
| Also in the record (🟡) | `tonal.js` has vestigial `palette.chroma / 100` reads that are now always 1 (code, no pixel; C5.1 rules two of them out of scope). `docs/lld/lld-muted-base-key-spikes.md:62` snippet shows `baseChroma: 30`. `docs/reference/reviews/2026-08-20-reactivity/01-core-reactivity.md:27` mixes history with live line numbers. |
| Question | May the plan take revision 16: one new unit U7 (S), comments and records only, fixing the `tonal.js:109-110` comment plus a class sweep of "group target" claims in live code comments and records, with a scope check that no code line changes? Pass 4 pre-land follows. |
| Options | A (recommended): yes, U7 as above, plus the LLD `:62` snippet and the reactivity line `:27`; the vestigial `/100` reads become a follow-up issue (code change, no pixel). · B: yes, U7 also removes the vestigial `/100` reads (a code change, bigger gates, needs a code reviewer and the full sweeps again). · C: no, land with the stale comment recorded as a known defect. |
| Builder | A: builder-l3, reviewer-l3, verifier-l2 (R86), Pass 1. Not Fable. |
| Default if unanswered | none: a revision past the cap needs the owner |
