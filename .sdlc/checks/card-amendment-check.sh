# Every record card (and its index lineage cell) whose source carries an
# Amendment (2026-09-16) must name that date. Generic: it derives the card set
# from the cards themselves, so a new card or a new amendment is covered.
# Usage: sh .sdlc/checks/card-amendment-check.sh   (from the repo root)
DR=docs/reference/references/decision-records.md
n=0
for c in .sdlc/records/cards/*.md; do
  id=$(basename "$c" .md)
  src=$(grep -E '^\| Source ' "$c" | grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+\.[a-z]+' | head -1)
  [ -n "$src" ] || src=$(grep -E '^\| (Record|File|Document) ' "$c" | grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+\.[a-z]+' | head -1)
  [ -n "$src" ] && [ -e "$src" ] || continue
  case "$id:$src" in
    ADR-*:"$DR")
      num=${id#ADR-}
      next=$(printf "%03d" $((10#$num + 1)))
      body=$(awk "/^## ADR-$num[: ]/,/^## ADR-$next[: ]/" "$src") ;;
    *) body=$(cat "$src") ;;
  esac
  printf '%s' "$body" | grep -q 'Amendment (2026-09-16)' || continue
  grep -E '^\| (Supersedes|Amended|Lineage)' "$c" | grep -q '2026-09-16' || { echo "stale card $id"; n=$((n+1)); }
  grep -E "^\| $id " .sdlc/records/index.md | grep -q '2026-09-16' || { echo "stale index $id"; n=$((n+1)); }
done
echo "stale total: $n"
