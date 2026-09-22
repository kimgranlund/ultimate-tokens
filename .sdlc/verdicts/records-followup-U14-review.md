---
kind: review
plan: records-followup
unit: U14
seat: reviewer
branch: unit/rf-U14
head: a01b611a
base: f9725be9
written: 2026-09-21
verdict: FIX-FIRST
verdict-pass-2: PASS
head-pass-2: ede57b30
---

# U14 review: the roadmap rebuilt by a generator

> **R17 label.** Reviewed by opus at high effort, standing in for a fable reviewer. The builder was
> opus high (L6), and the Verifier who grades next is also opus. No cross-model independence.

Fresh context. Read only; nothing edited or committed in the unit worktree, no `git checkout`, and the
generator was never run with `--final`. Every probe wrote only under this seat's job tmp directory.

## Verdict

FIX-FIRST. The machinery holds. The git half of the snapshot checks out against this repo entry by
entry, `--verify` reproduces all 756 lines, every gate is green, and U5-1 to U5-7 print their expected
values. What survived the rebuild is the class it was meant to remove: two strings the generator types
by hand. One is a column header whose cells are false under the header's plain meaning. The other is
a front-matter clause about the owner that no command produces and the plugin's own taxonomy
contradicts. The handoff also has a table that is false at its own head. F1 and F2 are one-line
generator edits, but the fix means a fresh generation, so a new read window and a new `gh` diff
inside it.

| # | Severity | Finding | Fix |
|---|---|---|---|
| F1 | 🔴 medium | the `Plan files naming it` header claims more than its command measures; 3 cells are false | rename the header, regenerate |
| F2 | 🔴 medium | the `status:` line says P labels are the owner's priority, with no source, against plan-rules | drop the clause, regenerate |
| F3 | 🔴 medium | the handoff's `State at this commit` table is false at `a01b611a` | re-anchor or rewrite the table |
| F4 | 🟡 low | `--final` and `GENERATOR` hash the file at the repo root, not the code that is running | hash `import.meta.url` |
| F5 | 🟡 low | `--verify` checks consistency, not authenticity; it skips the reflog agreement check | run the check in `--verify`; state the limit |
| F6 | 🟡 low | U5-5's second leg is vacuous against the rebuilt file, the same defect revision 34 fixed in U5-7 | plan revision (Orchestrator) |
| F7 | 🟡 low | "print the same thing whenever rerun" depends on objects the clone may prune; nothing gates `--verify` | qualify the rule |
| F8 | ⚪ note | smaller imprecisions, listed below | optional |

## Findings

### F1 🔴 `Plan files naming it` says `none` for three issues that plans name

`.sdlc/roadmap.md:52` heads the column `Plan files naming it, at any REFS tip`. Its command
(`roadmap-gen.mjs:135`, printed at `roadmap.md:100`) matches only a line starting `ticket: #N`. The
cells for `#686` (`:55`), `#723` (`:60`) and `#725` (`:70`) print `none`. At `959b1bb7`, the head the
file names:

```
#686: .sdlc/plans/records-followup.md
#723: .sdlc/plans/records-followup-U11-rediagnosis.md .sdlc/plans/records-followup.md
#725: .sdlc/plans/records-followup.md
```

(`git grep -l "#N\b" 959b1bb7 -- .sdlc/plans ':(exclude).sdlc/plans/archive'`.) The U14 row itself names
`#686` and `#725`. Each cell is the true output of its command, and the header turns it into a false
statement: a reader concludes that no plan mentions `#723`. The regex misses no `ticket:` format
(every `ticket:` line at every REFS tip is `#N` or `"#N"`, 21 lines), so this is the header and not
the regex. `Open PRs naming it` (`:136`) has the same shape: it reads `closingIssuesReferences` and the
title, not the body. Fix: headers that say what the command measures, for example `Plans whose ticket:
is it` and `Open PRs closing it or naming it in the title`.

### F2 🔴 an unsourced claim about the owner in front matter

`roadmap.md:4`, typed at `roadmap-gen.mjs:274`: `status: generated (the Conductor owns this file; the
owner's priority is each ticket's P label)`. No command produces the second clause and no ref backs
it. I found no ruling for it in `standing-rulings-2026-09-20.md`,
`records-followup-repair-or-rebuild.md` or `adapter.md`. The sdlc plugin's own taxonomy says the
opposite: `plan-rules/SKILL.md:52` gives the setter of `priority` as `Conductor, from the roadmap`. The
file it replaces said `the owner ranks it`. The new clause turns 9 labels that seats may have applied
into owner decisions, and read with the `order` rule (`:27`) it implies the 11 unlabelled issues are
the owner's deliberate non-priorities. Fix: end the line at `the Conductor owns this file`.

A design note for the Conductor, not a builder defect: plan-rules (`SKILL.md:10`) makes the roadmap
"the only place plans are ranked", and says P labels come "from the roadmap". The rebuilt file ranks
nothing and sorts by P label. Under R18 that is defensible, but the result is circular: labels come
from the roadmap, and the roadmap reads the labels. Someone has to own where priority comes from.

### F3 🔴 the handoff's opening table is false at its own head

`.sdlc/handoffs/records-followup-U14.md:13-20`, `## State at this commit`, reads `roadmap | untouched:
.sdlc/roadmap.md is the blob f9725be9 carries` and `final generation | not run; waits for the
Orchestrator's go`. Both were true at `76993fa0`. At `a01b611a`, the commit a reader holds, both are
false: `e147ae0b` wrote the roadmap. The front matter at `:8` already says `generated`, so the file
contradicts itself. This is the "graded at the head, not the commit it was written at" hazard from the
census, carried inside one file. Fix: retitle it `State at 76993fa0`, or rewrite it to the head state.

### F4 🟡 the generator-provenance guard checks a file, not the running code

`roadmap-gen.mjs:437` (the `--final` guard) and `:58` (the `GENERATOR` read) both hash
`.sdlc/scripts/roadmap-gen.mjs` at the repo root. Neither hashes `import.meta.url`. Probe, without
`--final`: a copy with one legend string changed (blob `71730571`), run from the job tmp dir, wrote a
file that contains the changed string and names `generator: ... blob 06837d22`. So the promise at
`:17-18` ("the blob the file names is the code that produced it") and handoff `:32` claim more than
the code does. The recorded roadmap is not affected: the committed blob `06837d22` (the same at
`5feddebb`, `76993fa0` and `a01b611a`) reproduces it byte for byte. Related, reasoned and not run: the
`--final` requirement at `:435` compares the raw `--out` string, so `./.sdlc/../.sdlc/roadmap.md`
would bypass it. Fix: hash `fileURLToPath(import.meta.url)` in both places, and compare
`path.resolve(out)`.

### F5 🟡 `--verify` proves the file agrees with itself, not that it is true

Two probes on copies, both `exit 0`:

- `#728`'s title changed in the `ISSUES` block and in its table cell together: `reproduces from its
  own Snapshot (756 lines)`.
- `plan/gate-split`'s entry in the `REFLOG` block changed to a different sha, so it disagrees with
  `REFS`: also `exit 0`.

The second probe matters more. The Snapshot prose (`roadmap.md:467`, `roadmap-gen.mjs:378`) says the
blocks "describe one state" because the generator refuses when reflog and refs disagree. That refusal
runs only in `readLive` (`:73-92`). `--verify` never repeats it, so a hand-edited snapshot can break
the claim and still pass. Fix: run the same agreement check on the parsed snapshot inside `--verify`.
The first probe cannot be fixed inside the file. The legend holds by construction because cells are a
function of the snapshot. Whether the snapshot is true rests outside the file: the window note for the
`gh` half, and this review's reflog check for the git half. The verdict should cite both, and not
treat `--verify` exit 0 as a truth check.

### F6 🟡 U5-5's second leg now prints `0` against any file

`awk '/^## Questions for the owner/,/^## Revisions/'` selects 0 lines of the rebuilt file, because the
heading no longer exists. The leg prints `0` whatever the file says. This is the defect revision 34
fixed for U5-7, left standing in U5-5. The first leg (`^Your move`, `0`) still holds, and by
inspection the file carries no prompts. The one open owner question shows only as a question-file row
(`roadmap-2026-09-20.md`, `ruled: Q1 still open`). This needs a plan revision from the Orchestrator,
not a builder change.

### F7 🟡 "whenever they are rerun" depends on objects the clone keeps

`roadmap.md:22` says the commands "print the same thing whenever they are rerun". The worktree
columns run `git rev-list` on worktree heads such as `ab9eaa68` (`unit/pif-u1-anchor`). Once those
branches and worktrees are removed and gc prunes the objects, `--verify` dies with exit 2. The PR
column (`roadmap-gen.mjs:156`) falls back to `commit not in this clone`, which fails `--verify`
differently. Separately, nothing in `npm test` or CI runs `--verify`, so "nothing is patched after
generation" (`:15`) is a convention. Fix: say "while these objects remain in the clone". Consider a
check script that runs `--verify` at pre-land.

### F8 notes

- `head:` (`:6`) says `as read at 2026-09-21T12:35:49Z`. `REFS` was read somewhere between T0 and T1,
  so "read in the window" is exact and "at T0" is not.
- "verbatim except U+2014" (`:467`) leaves out that `sh()` strips trailing newlines
  (`roadmap-gen.mjs:46`). The `WORKTREES` block loses its final blank line against a live rerun.
- The U14 row names inputs on `backup-rf-U13-preR18` (`e57d06d9`, `63cebfa6`, `8c634c90`,
  `eccef435`). The branch exists. The rebuilt file carries none of the claims those inputs supported,
  so they went unused, and the handoff does not say so.
- U5-6's third output (diff against `BASE` `1f991877`) lists the U11 to U14 handoffs and the generator
  besides the roadmap, U5 handoff and question file its Expected names. Everything is under
  `.sdlc/`, the wall holds, and U11 to U13 already stretched this list. The row's Expected is stale,
  not the branch.

## Acceptance on the U14 row

| Criterion | State | Evidence |
|---|---|---|
| every cell is a recorded command's output, rerunnable | 🟢 | `--verify` exit 0, 756 lines. I reran cells by hand through the file's own recipe in bash and in zsh: `pif-u7` `225`, `#377` Other labels `task`, `#709` plan files (both paths), roadmap question `unit/rf-U14@76993fa0`. All match |
| legend marking contract by construction | 🟢 with F5 | no mark exists to break. Kind, Title, Pri and Size are label or `gh` text verbatim (census A20, A22 and A23 are gone: `#718` title, `#721` `feature`, `#377` Size and Lane `none`). By construction relative to the snapshot, not to the world |
| `Count:` and `inputs:` are generation outputs, instant recorded | 🟢 | `COUNT` and the `N_*` scalars (`roadmap-gen.mjs:211-219`) are computed from the blocks. The `INSTANT` block brackets the read |
| `head:` is the generation instant, never patched | 🟢 with F7, F8 | `959b1bb7` = `refs/remotes/origin/main` in `REFS`. `e147ae0b` is the only commit that touched the roadmap on this branch |
| claims about other work name their ref | 🔴 F1, F2 | tables do. The `status:` clause names nothing, and F1's header asserts more than its ref-scoped command |
| reachability, not wall clock | 🟢 | the on-head counts are `git rev-list`, and Landed is `git log --first-parent P..head` (`5f2c3787` is an ancestor of `959b1bb7`, exit 0) |
| negative control: a different ref gives a different cell | 🟢 | `pif-u7` Commits not on head: `225` at `959b1bb7`, `260` at `5f2c3787` |
| negative control: the command discriminates two inputs | 🟢 | `plan/gate-split`: `255` at `95a725bb`, `254` at `2dd4444a` (its previous reflog entry) |
| reflog witness, four conditions | 🟢 | see the git half below |
| one roadmap-only commit | 🟢 | `e147ae0b`, parent `76993fa0`, `--name-only` lists `.sdlc/roadmap.md` alone. `76993fa0:.sdlc/roadmap.md` = `f9725be9:.sdlc/roadmap.md` = blob `b3825864` |

## The git half of the snapshot, against this repo now

| Check | Result |
|---|---|
| all 28 `REFLOG` lines found verbatim in `git reflog show --date=iso-strict --format='%H %gd %gs' <ref>` | 28 of 28 |
| the window is bounded: for each ref, the next newer entry is after T1 `12:35:50Z` or there is none | 25 refs have no newer entry. `unit/rf-U14` next `e147ae0b` at `12:36:05Z`, `main` next `6eee94bf` at `12:39:17Z`, `origin/main` next `6eee94bf` at `12:39:19Z`. The lower bound is each quoted entry, all before T0 |
| `REFS` block against a live `for-each-ref` of the same refs | differs only on `main` and `origin/main` (now `44b8042b`). Both moves are the reflog entries above, after T1 |
| `WORKTREES` block against a live rerun of its command | same 35 entries. Differs only in root `HEAD` (main moved), `rf-U14` `HEAD` (`a01b611a`, after T1), and the final blank line (F8) |
| read from this repo, not a `--shared` clone | yes: run in the worktree, whose reflogs are the main repo's |
| discriminates | yes: the `plan/gate-split` control above, and `readLive`'s exit-3 refusal (handoff N8). F5: `--verify` does not repeat that refusal |
| the `gh` half | not redone. The Verifier graded it inside the window (`records-followup-U14-window.md`: 20 of 20 issues and 3 of 3 PRs). U5-4 still prints `diff 0` against live `gh` now |

## Plan criteria U5-1 to U5-7 at `a01b611a`

| Row | Printed | State |
|---|---|---|
| U5-1 | `1`, `anc 0` | 🟢 |
| U5-2 (bash, root checkout) | `diff 0` | 🟢 |
| U5-3 | `8`, `8` | 🟢 (both numbers now come from one block, so the row agrees by construction) |
| U5-4 | `diff 0` | 🟢 |
| U5-5 | `0`, `0` | 🟡 F6, the second leg is vacuous |
| U5-6 | `nonempty 0`; `.sdlc/roadmap.md`; 12 roadmap commits since `BASE`, each touching only the roadmap | 🟢 (the third output's Expected is stale, see F8) |
| U5-7 (re-pointed) | `0`, `1` | 🟢 (the `DP1 DP2 DP3 DP4` debt cell, copied verbatim from `debt.md` at `959b1bb7`) |

## Gates at `a01b611a`

| Gate | Result |
|---|---|
| `npm test`, exit read from `$?` into a log, not through a pipe | `exit=0`, `✓ all 48 test files passed`, `git status --short` `0` after, HEAD still `a01b611a` |
| `node test/repo/branding.mjs`, exit read directly | `0`, `branding: clean (512 files scanned)` |
| paths outside `.sdlc/` against base `f9725be9` and against `BASE` `1f991877` | `0` and `0` |
| em dashes added (P6 measure) against `f9725be9` and against `BASE` | `0` and `0`. Raw count across the roadmap, generator and handoff: `0` |
| `sh .sdlc/checks/baseline-agrees-check.sh` | exit `0`, `stale total: 0`, one `note head:` line (tree moved outside `.sdlc/` and `.gitignore`) |
| `--verify .sdlc/roadmap.md` | exit `0`, 756 lines |

## To land

1. Builder: F1 and F2 in `roadmap-gen.mjs` (two strings). Optionally F4, F5 and F7's wording in the
   same commit. Commit the generator alone.
2. Orchestrator: a new read window, `--final` once, and the Verifier's `gh` diff inside it again.
   F1 and F2 change typed strings only, so every cell should re-render the same apart from live drift.
3. Builder: F3 in the handoff.
4. Orchestrator: a plan revision for F6 (re-point or retire U5-5's second leg), and optionally
   refresh U5-6's third Expected.

## Pass 2, at `ede57b30`

> **R17 label.** Reviewed by opus at high effort, standing in for a fable reviewer. The builder was
> opus high (L6), and the Verifier who grades next is also opus. No cross-model independence.

Verdict: **PASS.**

The first head I was sent, `3710ad46`, moved while I was reviewing it: the worktree carried an
uncommitted generator edit. I told the lead and graded in a `--shared` clone. The lead then froze the
head at `ede57b30`, three one-file commits later (`418a8ced` generator, `0deb2a54` roadmap, `ede57b30`
handoff). The worktree was clean at `ede57b30` when I started. Everything below ran in a `--shared`
clone of this repo, checked out at `ede57b30` in my job tmp dir. The unit worktree was only read,
and `--final` was never run.

### The re-render, checked hardest

| Check | Result |
|---|---|
| snapshot blocks at `ede57b30` against `e147ae0b` | identical, byte for byte, apart from the new `RENDER` block (`renderer 1958a567`, `snapshot e147ae0b...:.sdlc/roadmap.md`) |
| table rows at `ede57b30` against `e147ae0b` | every data row identical. The only row differences are the legend's `a cell is a command's output` rule (F7 wording) and the issue table's header row (F1) |
| other lines changed against `e147ae0b` | `status:` (F2), `head:` wording (F8), `generator:` naming both blobs, the new "What that proves, and what it cannot" paragraph at `:44` (F5), the Snapshot prose (trailing newlines, RENDER) and the RENDER block. No count, sha or instant moved |
| both blobs named | `generator: ... read by blob 06837d22..., rendered by blob 1958a567...`. `06837d22` is the blob committed at `5feddebb` that ran the read. `1958a567` is `ede57b30:.sdlc/scripts/roadmap-gen.mjs` (`git hash-object`) |
| reproducible | `--verify` exits `0` (769 lines). `--rerender e147ae0b` to a scratch path is `cmp`-identical to the committed file |
| the old file stays checkable | the new generator on `e147ae0b`'s file refuses with exit 1 and names blob `06837d22` to run instead. The old generator on the new file exits 1 at line 4. Each file only verifies under its own renderer |
| does the old read hide anything | no live drift: at review time, U5-4 is `diff 0` against live `gh`, and the 3 open PRs have the snapshot's head shas (`3497b692`, `f9725be9`, `880b4a36`). By construction the file shows nothing after `12:35:50Z`, and `head:` and `instant:` say so |

One 🟡 from the re-render, not blocking. `roadmap.md:437` says "The commit that adds this generation is
not listed, because a file cannot name its own commit". Now three commits touch this generation
(`e147ae0b`, `a6ee67ee`, `0deb2a54`), and the Revisions table stops at `76993fa0`, so none of them is
listed. Only `e147ae0b` is named anywhere in the file, in the RENDER block, and `a6ee67ee` is named
nowhere. Nothing false is stated, and the read is fully identified. But the sentence suggests exactly
one commit is left out. Worth a clause the next time the generator changes. It is not worth another
render.

### F1 to F8

| # | State | Evidence |
|---|---|---|
| F1 | 🟢 | headers now read `Plans whose ticket: line is it, at any REFS tip` and `Open PRs closing it, or naming it in the title`. The commands are unchanged, and so are the cells |
| F2 | 🟢 | `status: generated (the Conductor owns this file)` |
| F3 | 🟢 | the handoff's opening table is now `State at 76993fa0, before the final generation`, with a line saying it is not true at any later head |
| F4 | 🟢, one residue | `SELF` hashes `import.meta.url`. A modified copy (blob `cb91fe48`) running `--verify` exits 1 and names both blobs. Its scratch re-render names `rendered by blob cb91fe48`, its own blob. `--final` compares `SELF` to `HEAD:`. Residue 🟡: the `--final` requirement resolves `--out` against the repo root, but the file is written relative to cwd. From `.sdlc/`, `node scripts/roadmap-gen.mjs --out roadmap.md --rerender e147ae0b` wrote `.sdlc/roadmap.md` without `--final` (probe in the `3710ad46` clone; the content was identical, so the clone stayed clean). Fix: `writeFileSync(resolve(TOP, out))`, or resolve against `process.cwd()` in both places |
| F5 | 🟢 | `--verify` now runs `checkAgreement`, so the `plan/gate-split` REFLOG probe exits `3` (`moved during the read`). A consistent tamper still exits `0`, and `roadmap.md:44` now says so, naming the window grade as the check against the world |
| F6 | 🟢 | revision 35 on main (`7c07ff0c`). The re-pointed leg prints `0` here and `2` at `d34b4fb1`, so it can see prompts again |
| F7 | 🟢 | the legend adds "while the objects they name remain in the clone". Nothing gates `--verify` yet. That is a pre-land or check-script decision, not this unit's |
| F8 | 🟢 | `head:` reads "read between T0 and T1". The Snapshot prose names the dropped trailing newlines. The backup inputs are explained in the handoff. U5-6's Expected is revision 36 |

Handoff 🟡, not blocking: the front matter says `gates run at the unit head`, but the only gates
table is headed `Gates at e147ae0b`, and nothing in the file records gates at `a6ee67ee`, `0deb2a54` or
`ede57b30`. The table below covers that head.

### U5 criteria and gates at `ede57b30`

| Row or gate | Printed | State |
|---|---|---|
| U5-1 | `1`, `anc 0` | 🟢 |
| U5-2 (bash, root checkout, against the clone's file) | `diff 0` | 🟢 |
| U5-3 | `8`, `8` | 🟢 |
| U5-4 | `diff 0` | 🟢 |
| U5-5 (revision 35) | `0`, `0` | 🟢 |
| U5-6 (bash) | `nonempty 0`; `.sdlc/roadmap.md`; the eight paths revision 36 lists | 🟢. The `e147ae0b` → `a6ee67ee` → `0deb2a54` roadmap commits each touch only the roadmap. That is three for one generation, which U5-6 admits and the squash folds |
| U5-7 | `0`, `1` | 🟢 |
| `npm test`, exit read from `$?` into a log | `exit=0`, `all 48 test files passed`, tree `0` after, HEAD still `ede57b30` | 🟢 |
| `node test/repo/branding.mjs` | exit `0`, `clean (512 files scanned)` | 🟢 |
| paths outside `.sdlc/` against `f9725be9` | `0` (three files changed on the branch: the handoff, the roadmap, the generator) | 🟢 |
| em dashes added (P6) against `f9725be9`; raw count in the three files | `0`; `0` | 🟢 |
| `sh .sdlc/checks/baseline-agrees-check.sh` | exit `0`, `stale total: 0` | 🟢 |

`npm test` also passed at `3710ad46` (`exit=0`, 48 files, tree `0`). `ede57b30` differs from it only in
three `.sdlc/` files.

### Pass 2 closed

`npm test` was rerun in the foreground at `ede57b30` on 2026-09-22, in a fresh `--shared` clone, with
the exit code read from `$?` and never through a pipe: `exit=0`, `all 48 test files passed`, tree `0`
after, HEAD still `ede57b30`. It agrees with the run recorded above.

**PASS at `ede57b30`.** F1 to F8 are closed, the re-render carries `e147ae0b`'s graded snapshot
through byte for byte with no data cell moved, and both blobs are named. Two 🟡 notes carry forward
and neither blocks: the `--out` path guard resolves against the repo root while the write is relative
to cwd (F4 residue), and the Revisions sentence now leaves out three commits while claiming one. The
world check for this file remains the window grade of the `gh` blocks plus this review's check of the
git blocks against this repo's reflogs.
