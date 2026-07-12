---
name: project-docs
description: >-
  Answers what THIS project (ultimate-tokens) has decided, planned, queued, and specified — from
  the docs/ corpus. Use for "what are the requirements for X", "which tickets are open", "what's
  on the roadmap / the plan", "what did we decide about Y", "is there a spec for Z", "what's the
  status of TKT-####", "what's already been queued or shipped". Consult table → the docs/ files;
  Grep first, read the matching section. ANSWERS from the corpus only. NOT for authoring or
  editing a document (/doc-forge, scribe); NOT for capturing a new feature idea (/feature) or bug
  (/bug-report); NOT for building from a record (/build, orchestration).
user-invocable: false
disable-model-invocation: false
---

# project-docs — this project's decision and work record

The routing surface over `docs/` — so any session can find what this project has decided,
planned, and queued without being told where to look. Answers come from the files, cited by
path; a question the corpus doesn't answer is reported as absent, never guessed.

| Ask | Look in |
|---|---|
| Problem, users, outcomes — the why | `docs/prd/` (PRD-*) |
| Requirements, exact behavior, acceptance criteria | `docs/spec/` (SPEC-*) |
| How something is built internally | `docs/lld/` (LLD-*) |
| A ratified decision and its alternatives | `docs/adr/` (ADR-*, accepted = append-only) |
| What's queued, in flight, or done | `docs/tickets/` (TKT-*; frontmatter `kind:` bug/feature, `size:`, status) |
| Sequenced steps with done-whens | `docs/plan/` (PLAN-*) |
| Horizons of intent — Now / Next / Later | `docs/roadmap/` (ROADMAP-*) |
| One actor, one sitting, one done-when | `docs/task/` (TASK-*) |

Note for this repo specifically: canonical SPEC/reference material for the color/type/geometry
engines lives under `.claude/docs/spec/` (a separate, pre-existing corpus — role tables, export
format shapes, typography/geometry reference docs). `docs/` (this table) is the NEWER, narrower
work-item corpus (tickets, and any future PRD/SPEC/LLD/PLAN/ROADMAP) bootstrapped by scribe's
`/feature` and `/bug-report`. Don't conflate the two: a design/architecture question about the
engines is answered from `.claude/docs/spec/`; "what's queued/open/decided as a work item" is
answered from `docs/`.

(A directory that doesn't exist usually means the project has none of that record type yet —
but before answering "absent", sweep for near-miss locations: misnamed dirs (`docs/specs/`,
`rfcs/`, `design-docs/`, `adrs/`), loose files (`NOTES.md`, `DECISIONS.md`, `ARCHITECTURE.md`),
doc-shaped README sections. A hit → answer with the real location, marked non-canonical:
"spec-shaped content lives at rfcs/ — not indexed; /docs-alignment (scribe) can migrate it." A false
"this project has no specs" is this skill's own worst failure. Knowledge corpora authored at
intake are linked from their ticket, not mapped here.)

## Consult procedure

1. Classify the ask against the table; Grep the corpus for the feature's nouns or the TKT-/PRD-
   id first — the files are records, not linear reads.
2. Answer with **the claim + the file path (+ the record's status where it has one)**. A record's
   frontmatter (`status`, `kind`, `size`) is part of the answer — an open ticket and a done one
   answer "is X built?" oppositely.
3. Cross-references between records use ids (the ID spine: a TKT links its SPEC by id) — follow
   them rather than assuming one file is complete.
4. Route all making: a new idea → `/feature`; a bug → `/bug-report`; building a queued record →
   `/build`; authoring or revising any document → `/doc-forge` (all where installed — otherwise
   name the record that would be touched and hand back to the user).
