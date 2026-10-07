# Layout

Any other folder directly under `docs/` is a topic. It holds the designs, specifications, and decisions for one concept.

## Homes

- `specs/`
- `planning/`
- `decisions/`
- `references/`
- `guides/`
- `reports/`
- `assets/`
- `archive/`
- `other/`
- `reference/`

## Kinds

| id | kind | holds | not | why | writer | form | life | entry | read | owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `specs/` | specs | what the system is and must do | plans -> `planning/` | one place to trust | people | kebab-case | supersede to `archive/` | - | defining the system | `docs_check.py` |
| `planning/` | planning | proposals and plans under review | built facts -> `specs/` | decisions need a place | people | `status:` front matter | accept, then `archive/` | - | deciding or scheduling | `docs_check.py` |
| `decisions/` | decisions | one numbered decision per file | narrative -> `specs/` | reasons outlive people | people | `NNNN-slug.md`, `status:` | supersede | - | asking why | `docs_check.py` |
| `references/` | references | lookup tables and listings | steps -> `guides/` | fast lookup | people | kebab-case | edit in place | - | looking something up | `docs_check.py` |
| `guides/` | guides | procedures a person follows | tables -> `references/` | do, not explain | people | kebab-case | edit in place | - | doing a task | `docs_check.py` |
| `reports/` | reports | dated evidence | steps -> `guides/` | evidence stays fixed | people | `YYYY-MM-DD-slug.md` | immutable | - | checking what was verified | `docs_check.py` |
| `assets/` | assets | non-Markdown files cited by a document | Markdown -> its home | keep prose clean | people | kebab-case | with its citer | - | opening a cited file | `docs_check.py` |
| `archive/` | archive | superseded or retired documents | live documents -> their home | history without noise | people | `status:`, `superseded-by:` | keep | - | researching history | `docs_check.py` |
| `other/` | other | unsorted documents | anything with a home -> that home | a visible backlog | anyone | `owner:`, `review-by:` | review-by date | - | sorting the inbox | `docs_check.py` |
| `reference/` | assets | data that code, generators and shipped artifacts read at this exact path (`data/`, `colors/categories/`) | documents -> `references/` | a moved data file breaks its readers | people | kebab-case | with its readers | - | changing a generator or the role table | `docs_check.py` |

## Decide

1. Is it a picture, diagram source or data file? yes -> `assets/`
2. Is it evidence of something that happened on a date? yes -> `reports/`
3. Is it one choice with its reasons and alternatives? yes -> `decisions/`
4. Is it a proposal, roadmap or plan under review? yes -> `planning/`
5. Is it steps a person follows? yes -> `guides/`
6. Is it a table, listing or glossary you look things up in? yes -> `references/`
7. Does it describe what the system is or must do? yes -> `specs/`
8. Is it retired or superseded? yes -> `archive/`
otherwise -> `other/`

## Frozen paths

- `docs/reports/`

## Legacy
