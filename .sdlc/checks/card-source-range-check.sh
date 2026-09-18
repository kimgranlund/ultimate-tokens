# Every ADR card whose Source row cites a line range must cite the range its
# section actually occupies at this head: start at its `## ADR-NNN` heading,
# end at the section's last non-blank line (the convention ADR-001 to ADR-022
# follow), so an appended amendment is inside the range and no trailing blank
# line is claimed. ADR-023 and ADR-024, written in this plan, are one line long
# under the other reading and are normalised to this one. Usage: sh .sdlc/checks/card-source-range-check.sh
n=0
for c in .sdlc/records/cards/*.md; do
  id=$(basename "$c" .md)
  case "$id" in ADR-*) ;; *) continue ;; esac
  row=$(grep -E '^\| Source ' "$c" | head -1)
  printf '%s' "$row" | grep -qE '\.md:[0-9]+-[0-9]+' || continue
  src=$(printf '%s' "$row" | grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+\.md' | head -1)
  [ -e "$src" ] || { echo "missing source $id"; n=$((n+1)); continue; }
  span=$(printf '%s' "$row" | grep -oE ':[0-9]+-[0-9]+' | head -1 | tr -d ':')
  start=${span%-*}; end=${span#*-}
  head_line=$(grep -nE "^## $id " "$src" | head -1 | cut -d: -f1)
  [ -n "$head_line" ] || { echo "no heading $id"; n=$((n+1)); continue; }
  next=$(awk -v s="$head_line" 'NR>s && /^## / {print NR; exit}' "$src")
  [ -n "$next" ] || next=$(($(wc -l < "$src") + 1))
  true_end=$(awk -v s="$head_line" -v e="$next" 'NR>=s && NR<e && $0 !~ /^[[:space:]]*$/ {l=NR} END {print l}' "$src")
  [ "$head_line" = "$start" ] || { echo "start $id says $start, heading at $head_line"; n=$((n+1)); }
  [ "$true_end" = "$end" ] || { echo "end $id says $end, section ends at $true_end"; n=$((n+1)); }
done
echo "range mismatches: $n"
