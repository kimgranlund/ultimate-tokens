n=0
for a in 010 013 016; do
  m=$((10#$a+1)); m=$(printf "%03d" $m)
  awk "/^## ADR-$a /,/^## ADR-$m /" docs/reference/references/decision-records.md | grep -q 'Amendment (2026-09-16)' || continue
  grep -q '2026-09-16' .sdlc/records/cards/ADR-$a.md || { echo "stale card ADR-$a"; n=$((n+1)); }
  grep -E "^\| ADR-$a " .sdlc/records/index.md | grep -q '2026-09-16' || { echo "stale index ADR-$a"; n=$((n+1)); }
done
for pair in "LLD-muted-base docs/lld/lld-muted-base-key-spikes.md" "SITE-runbook docs/site/go-live-runbook.md" "SITE-describe-palette docs/site/describe-palette-spec.md"; do
  set -- $pair
  grep -q 'Amendment (2026-09-16)' "$2" || continue
  grep -q '2026-09-16' ".sdlc/records/cards/$1.md" || { echo "stale card $1"; n=$((n+1)); }
  grep -E "^\| $1 " .sdlc/records/index.md | grep -q '2026-09-16' || { echo "stale index $1"; n=$((n+1)); }
done
echo "stale total: $n"
