# Every card whose Source row cites a line range must cite the range its
# heading actually occupies at this head. Usage: sh .sdlc/checks/card-source-range-check.sh
n=0
for c in .sdlc/records/cards/*.md; do
  row=$(grep -E '^\| Source ' "$c" | head -1)
  printf '%s' "$row" | grep -qE '\.md:[0-9]+' || continue
  src=$(printf '%s' "$row" | grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+\.md' | head -1)
  start=$(printf '%s' "$row" | grep -oE '\.md:[0-9]+' | head -1 | cut -d: -f2)
  [ -e "$src" ] || { echo "missing source $c"; n=$((n+1)); continue; }
  id=$(basename "$c" .md)
  case "$id" in
    ADR-*) head=$(grep -nE "^## $id " "$src" | head -1 | cut -d: -f1) ;;
    *) continue ;;
  esac
  [ -n "$head" ] || { echo "no heading $id"; n=$((n+1)); continue; }
  [ "$head" = "$start" ] || { echo "range $id says $start, heading at $head"; n=$((n+1)); }
done
echo "range mismatches: $n"
