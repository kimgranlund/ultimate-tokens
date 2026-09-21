# Question · fable seats exhausted · the pre-land pair cannot be dispatched as specified

date: 2026-09-20
from: verifier
about: `reviewer-l4` and `verifier-l3` are both fable, and the fable allowance is spent
status: answered

## Context

The `census-roadmap` seat, dispatched at `verifier-l3` for the largest leg of the citation census,
returned without doing the work: `You've reached your Fable limit. Run /usage-credits to continue or
switch models with /model.` It burned its dispatch and produced nothing.

Both seats the `pre-land-review` skill names are fable: `reviewer-l4` and `verifier-l3`. So the pair
that skill specifies cannot be dispatched right now, and any pre-land or release record that needs one
is blocked on the same limit. This session has already run three pre-land passes with that pair; passes
1 to 3 each used two fable seats, which is where the allowance went.

The census leg itself is covered: I re-dispatched it as two `verifier-l2` seats split by line range,
which is opus at high effort, the same model and effort this seat runs. No census claim is lost.

## What is actually at stake

Independence, not capacity. The reason the pre-land pair is graded fable is that it runs a different
model from the builders, the coordinators and me. Substituting `verifier-l2` and `reviewer-l3` keeps
the effort and loses that: the reviewing seats would then share my model, so a failure mode my model
has is no longer caught by anyone. Passes 1 to 3 are the evidence that this matters. The fable
reviewer caught three defects I had graded green or yellow, including one where I argued the wrong
side from a 23 second margin.

## The decision

How should pre-land passes run while the fable allowance is spent?

1. Substitute and label (my default, and what I am doing now for the census). Dispatch `verifier-l2`
   and `reviewer-l3` at opus high, and record in every affected record that the pair ran on the same
   model as the verifier, so the independence claim is not overstated. Work continues; the records
   say plainly what they are worth.
2. Top up the fable allowance (`/usage-credits`) and keep the specified pair. Nothing changes about
   the method; the pre-land passes stay genuinely cross-model.
3. Hold pre-land passes until the allowance resets. Nothing lands that needs a pre-land record.

Continuing under option 1 for the census, since that leg is a fact-gathering sweep with the answers
checkable against the file, not a judgment call where model diversity is doing the work. I would not
write a pre-land verdict under option 1 without the label.

## Effect

`#720` does not land either way: its pre-land verdict is 🔴 on eight findings and that is unaffected
by this question.

## Answer

Owner ruling R17, 2026-09-21, verbatim from `.sdlc/runtime/owner-rulings-2026-09-20-pm.md` row 13:

> | R17 | 2026-09-21: the Fable allowance is spent, so reviewer-l4 and verifier-l3 cannot be dispatched
> and the pre-land pair is blocked (.sdlc/questions/fable-seats-exhausted-2026-09-20.md) | Substitute
> and label (Recommended) · Top up credits · Hold pre-land passes | "Substitute and label
> (Recommended)": pre-land runs at opus high (verifier-l2, reviewer-l3); any record whose pair shared
> the verifier's model is labelled as such, so the lost cross-model independence is on the record |

Option 1, my stated default. In force from now: pre-land pairs are `verifier-l2` and `reviewer-l3` at
opus high, and the label goes in the record itself, not only in the message that carries its path.
