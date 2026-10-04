# U8 rework brief · parallel-batch (#786) · orchestrator to builder, pass 2

| Field | Value |
|---|---|
| State | not dispatched: wind-down for a machine move (owner, via the Conductor). Resume after the move |
| Branch | `unit/pb-U8` @ 5c3a1be2 (pushed), base 9be89f15 is the builder's last code commit |
| Cause | reviewer-l3 pass 1 FAIL, `.sdlc/reviews/parallel-batch-U8-review.md`: F1 (R98) the non-anchored line `tonal.js:1041` still caps the floor at the rotated ceiling; 14 dips on the probe grid at head, 2 with the pre-rotation cap, 0 added |
| Routing call | Remedy A (apply the pre-rotation cap at `:1041` too, one predicate on both paths; widen grid (a) with nonzero skew and lift and give it the v2-reverted engine as a second control; widen the C8.6 declaration with the review's numbers; correct the comment at `tonal.js:1012-1014` and the handoff's "no measured defect"). Remedy B needs the owner and is not taken |
| Grade | pass 2 never below pass 1 and at least l7 or two grades up: builder-l7; reviewer-l3, verifier-l2 (shared-family note in the record header) |
| Rules | R1 code defect only; the review's other rows (C8.1 to C8.7, C1, C3, C4, judge 2 to 5) stand; C2 build and C8.8 timing were skipped under load and run at pre-land |
