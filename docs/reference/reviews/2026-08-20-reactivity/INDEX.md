# Reactivity & data-architecture review — 2026-08-20

A four-axis review of the UI's reactivity model, data model/store, data workflows, and
context-providing, prompted by the suspicion that "there's a mix of implementations now."
Reviewed at commit `63e3dc3` (main). Method: four parallel fresh-context reviewers, each
sweeping one axis read-only with file:line-cited findings, plus a host synthesis that
reconciles them. The canon judged against: `.claude/skills/building-editor-sections/`
(SKILL.md + references/foundations.md §3–§4).

| # | Report | Axis | Reviewer verdict (one line) |
|---|---|---|---|
| 00 | [Synthesis & remediation queue](00-synthesis.md) | cross-axis | One intended architecture, four accreted seams — details and priorities inside |
| 01 | [Core reactivity](01-core-reactivity.md) | `commit`/`editDrag` ladder, `render()`/`liveRefresh`, paint paths, `_sync*`, `_view` cache, event models | One coherent model with self-documented fast paths; 1 defect, 2 hazards, no undo-holes |
| 02 | [Sections & scale resolution](02-sections-and-resolvers.md) | view-driven vs doc-driven split, `_typeScaleFor`/`_geomScaleFor` discipline, ownership | One pattern executed twice in parallel; the type/geom resolution layer belongs in model.mjs |
| 03 | [Stores & persistence](03-stores-and-persistence.md) | persist.js, localStorage keys, Figma channels, migrations, dirty-tracking | Three storage disciplines, not one; a per-tick persistence storm on slider drags |
| 04 | [Context & messaging](04-context-and-messaging.md) | Figma postMessage protocol, busy flags, caches, mixin coupling, cleanup | The bridge is designed; the flag/cleanup layer around it is accreted; 1 real wedge |
