# adopt-hygiene U2 · pass 2 re-diagnosis

Re-diagnosed by sdlc-planner on 2026-09-16 against `unit/hygiene-U2` @ 04b93f0 and `.sdlc/verdicts/adopt-hygiene-U2.md`. Read-only; the fixes below are for the builder. Both fixes are prototyped: the workflow rewrite passed `actionlint` (exit 0) and `ruby -ryaml` (`yaml ok`) in a scratch dir, and the shell guard exits 1 with an empty key.

## Root causes

| # | Failure | Cause | Who was wrong |
|---|---|---|---|
| 9 | `if: ${{ secrets.ANTHROPIC_API_KEY == '' }}` on a step | GitHub allows `secrets` in job-level `if:`/`env:` but not in a step `if:`; the file fails at load, so the job never runs and stays broken even after the key is added | both: the builder used a context GitHub rejects; the criterion checked only YAML shape plus two greps, so a workflow that errors at load still went green (a vacuous check) |
| 3 | convention line says the sections "embed inline `<foreignObject>` markup" | `html:` is an `h()` attribute that sets `el.innerHTML` (`src/ui/app-helpers.mjs:313`); every one of the 12 uses is `h("div", { class: "an-svg", html: svg })`, an SVG string dropped into a div. `foreignObject` appears 0 times in `src/ui` | builder only: the criterion pinned the count, not the wording, and the count is right; the builder invented the mechanism instead of reading `debt.md` K11, which states it |

## Fixes (smallest correct)

**Criterion 9, `.github/workflows/describe-eval.yml`.** Move the secret to a job-level `env` (`secrets` is allowed there) and check it in a run step; the eval step then needs no `env` of its own. Keep the R8 comment block (reworded to say the guard is a shell test). Diff against 04b93f0, in prose: add under `runs-on:` a job `env:` mapping `ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}`; replace the `if:` step with:

```yaml
      - name: Require the eval key
        run: |
          if [ -z "$ANTHROPIC_API_KEY" ]; then
            echo "::error::ANTHROPIC_API_KEY is not set, add it as a repository secret (gh secret set ANTHROPIC_API_KEY) before this eval can run" >&2
            exit 1
          fi
```

and drop the `env:` block from the eval step (the job env covers it). `mcp/` stays untouched.

**Criterion 3, `.claude/CLAUDE.md:66-68`.** Reword the existing line (not a fourth edit, ruling C9). Replacement for the three lines:

```
- **The `html:` SVG-chart exception: 12 live attributes.** `src/ui/sections/{color,geometry,typography}.js`
  pass an SVG string to `h("div", { class: "an-svg", html: svg })`, which sets `innerHTML` (`app-helpers.mjs`);
  a new one is fine, a count drift means the ratified exception moved and this line needs updating with it.
```

The literal `12` stays on the first line, so the row-3 grep is unchanged.

## Commands that must go green (run in `.worktrees/hygiene-U2`)

| # | Command | Expected |
|---|---|---|
| 9 | `actionlint .github/workflows/describe-eval.yml; echo "exit $?"` | no output, `exit 0` |
| 9 | plan row 9 as written: `grep -c 'exit 1'` / `grep -c 'stays green'` / ruby / `git diff origin/main --stat -- mcp/ \| wc -l` | `1`+, `0`, `yaml ok`, `0` |
| 9 | `grep -c 'if: \${{ secrets' .github/workflows/describe-eval.yml` | `0` |
| 9 | `ANTHROPIC_API_KEY= bash -c 'if [ -z "$ANTHROPIC_API_KEY" ]; then exit 1; fi'; echo $?` | `1` (the guard bites on an empty key) |
| 3 | plan row 3 as written | `1`, then `12` |
| 3 | `grep -c 'foreignObject' .claude/CLAUDE.md; git grep -c foreignObject -- src/ui \| wc -l` | `0`, `0` (CLAUDE.md names no mechanism the code lacks) |
| 1, 2 | plan rows 1 and 2 unchanged | as in the plan (the reword touches neither) |
| 12, P1 | `npm run build`, `npm test` | green, tree stable |

## Plan revisions (append to `.sdlc/plans/adopt-hygiene.md` §U2 and its revision log)

| Row | Revised text |
|---|---|
| 3 | Command: append `; grep -c 'innerHTML' .claude/CLAUDE.md; grep -c 'foreignObject' .claude/CLAUDE.md`. Expected: `1`, `12`, `1`, `0`. Negative control: add "the mechanism named must exist in `src/ui`: `git grep -c <term> -- src/ui` is non-zero for `innerHTML` and zero for `foreignObject`" |
| 9 | Command: prepend `actionlint .github/workflows/describe-eval.yml; echo "exit $?";` and append `; grep -c 'if: \${{ secrets' .github/workflows/describe-eval.yml`. Expected: `exit 0` first, `0` last, the rest as before. Negative control: add "a step-level `if: ${{ secrets.X }}` makes `actionlint` report `context "secrets" is not allowed here` and exit 1 (the pass-1 failure); `ruby` alone cannot see it" |
| log | `2026-09-16 · U2 pass 2: row 9 adds actionlint (YAML load cannot reject a bad expression context); row 3 adds a mechanism-exists check (count alone let a wrong fact through) · verdict adopt-hygiene-U2 🔴` |
