<!-- sdlc-lite:managed:start v1 sha256:b653f1356179 -->
# Documents

Pick one home from the table, then read one file. Placement effect unproven; see the docs-schema design.

| Home | Holds | Never holds |
|---|---|---|
| `specs/` | What the system is and must do; edited in place | Proposals, dated evidence, steps |
| `planning/` | Proposals, roadmaps, plans under review (`status:`) | What exists today |
| `decisions/` | One numbered decision per file, immutable once accepted | Narrative design |
| `references/` | Lookup tables, listings, glossaries | Procedures, opinions |
| `guides/` | How-to and operating procedures | Lookup tables, design |
| `reports/` | Dated evidence: runs, reviews, audits, releases | Instructions, living specs |
| `assets/` | Non-Markdown files cited by a document | Markdown |
| `archive/` | Superseded or retired documents | Live documents |
| `other/` | Unsorted inbox with `owner:` and `review-by:` | Anything with a clear home |

## Which home

The first line that matches wins.

1. Picture, diagram source or data file: `assets/`.
2. Evidence of something that happened on a date: `reports/`.
3. One choice with its reasons: `decisions/`.
4. A proposal, roadmap or plan under review: `planning/`.
5. Steps a person follows: `guides/`.
6. A table, listing or glossary you look things up in: `references/`.
7. What the system is or must do: `specs/`.
8. Retired or superseded: `archive/`.
9. None of the above, or unsure: `other/`.

## Adding a document

1. Pick the home above; [the layout](layout.md) lists any extra homes.
2. Name it lowercase kebab-case; reports lead with `YYYY-MM-DD-`.
3. Run the onboard setup again to refresh the links below.
4. Put dated evidence in its own file under `reports/`. Do not add it to an entry file.

## Contents

- [specs/](specs/AGENTS.md)
- [planning/](planning/AGENTS.md)
- [references/](references/AGENTS.md)
- [guides/](guides/AGENTS.md)
- [reports/](reports/AGENTS.md)
- `assets/`
- [archive/](archive/AGENTS.md)
- `reference/`
<!-- sdlc-lite:managed:end -->

## Notes

- `assets/` and `reference/` hold no Markdown documents, so they have no entry file and stay unlinked above by design: the onboard setup links a home only when it holds two or more Markdown files. `assets/` holds files that documents cite; `reference/` holds runtime-read data that code and generators open at those exact paths (ADR-028).
- `planning/` was created in T-0034 for `ui-plan.md` and `decomposition.md`, which are plans, not references. `app-shell-patterns.md` and `spec-draft.md` moved to `specs/`, and the procedure `od-004-plugin-free-import-test.md` moved to `guides/`.
