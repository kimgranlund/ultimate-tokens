# U7 review control scripts (#681 preset-intent-fidelity)

The two scripts the U7 review's F2 and its `keyOklch` agreement check were measured with, copied
verbatim out of the reviewer's session scratch directory at pre-land pass 2 so the citations in
`.sdlc/verdicts/pif-u7-review-1.md`, `pif-u7-review-2.md`, `.sdlc/plans/preset-intent-fidelity.md`
and `.sdlc/handoffs/pif-u7.md` point at a path that survives the session. Neither script is wired
into `npm test`; both are run by hand.

The reviewer's raw `*.out` files stayed in that scratch directory and are NOT recovered. Where a
record cited an `.out` file, it now cites the command below that regenerates the figure instead.

## `ko.mjs` (one tree)

    node .sdlc/records/pif-u7-blast/ko.mjs "$PWD"

Prints `max |keyOklch - hexToOklch(key)|` over the default kit, proving the `keyOklch` triple every
consumer reads is the same colour the swatch shows. Run from the worktree at `505416d7`:

    default kit: max |keyOklch - hexToOklch(key)| 0.00e+0 palettes 16

## `blast.mjs` (two trees)

Takes ONE directory holding two checkouts, `ub/` (the unit's upstream base) and `neg/` (the graded
head), and compares `projectView(hydrate(doc))` across them over the default kit plus all 343
curated presets. It does not run against the worktree alone, by design: it is a two-tree A/B. Build
the pair in a throwaway clone, never in a worktree another seat is using:

    mkdir -p /tmp/blastctl
    git clone -q --shared <worktree> /tmp/blastctl/ub && git -C /tmp/blastctl/ub checkout -q de1bafef
    git clone -q --shared <worktree> /tmp/blastctl/neg && git -C /tmp/blastctl/neg checkout -q 285f66ec
    node .sdlc/records/pif-u7-blast/blast.mjs /tmp/blastctl

`de1bafef` is the U7 unit's UB and `285f66ec` the head review pass 1 graded, so that pair reproduces
the recorded figures. Re-run at pre-land pass 2, from the worktree, against exactly that pair:

    { total: 344, neutralFlip: 148, primaryMoved: 14, relMoved: 339 }
    default Relative extend: [0.593,0.206,289.000] -> [0.504,0.187,288.988]
    architecture/Bankside / Tate Modern · 1947,: primary idx 2 -> 1
    architecture/SoHo cast-iron loft · 1880s · : primary idx 5 -> 3

Identical to the four figures pass 1 recorded. The two example labels carry one more character here
than the verdict transcribes them with; that is the script's own `name.slice(0, 30)` truncation, not
a different measurement.
