// shell-roles.mjs, the editor shell's standard tables: text roles, control anatomy, container
// composition and glyph motion, every px derived from one Maison ladder cell. Pure, no DOM. The
// text steps walk the ladder rows (a step down is the next shorter control height), so the shell's
// type follows the cell instead of hand-picked font sizes.
import { LADDER_ROWS } from "../engine/geometry.mjs";
import { uiText } from "../engine/type.mjs";

// UI_ROLES, the nine shell text roles. `step` is a ladder row offset from the cell (0 is the cell's
// own control text) or "badge" (the cell's compact row, chipText); `ink` names the --ink* token.
// The kicker reads --ink-dim, not --ink-faint, so a section heading never fades below a label.
const role = (step, weight, lineHeight, tracking, textCase, ink, family = "sans") => Object.freeze({ step, weight, lineHeight, tracking, textCase, ink, family });
export const UI_ROLES = Object.freeze({
  "pane-title": role(0, 600, 1, "0", "none", "ink"),
  "element-title": role(-1, 600, 1.2, "0", "none", "ink"),
  kicker: role(-2, 700, 1, ".06em", "uppercase", "ink-dim"),
  label: role(-1, 500, 1.3, "0", "none", "ink-dim"),
  control: role(0, 500, 1, "0", "none", "ink"),
  badge: role("badge", 600, 1, ".02em", "none", "ink-dim"),
  helper: role(-2, 400, 1.4, "0", "none", "ink-dim"),
  body: role(0, 400, 1.5, "0", "none", "ink"),
  code: role(-1, 400, 1.4, "0", "none", "ink", "mono"),
});

// WEIGHTS, the four role weights; a rule that sets only a weight uses one of these.
export const WEIGHTS = Object.freeze({ regular: 400, medium: 500, strong: 600, heavy: 700 });

// MOTION, the glyph motion set: two durations (ms) and one easing.
export const MOTION = Object.freeze({ fast: 120, base: 180, ease: "cubic-bezier(.2, 0, 0, 1)" });

// edge(cell), the hairline a switch thumb sits inside its track: an eighth of the icon, at least 1px.
export const edge = (cell) => Math.max(1, Math.round(cell.icon / 8));

// roleText(cell, step, uiTextAt), the text px for a role step on a cell. "badge" is the cell's
// compact row; otherwise move `-step` rows down LADDER_ROWS from the cell's height, clamped at the
// last row. `uiTextAt` is a typeScale `uiText` map (height to px) or null for the bare table.
export function roleText(cell, step, uiTextAt) {
  if (step === "badge") return cell.chipText;
  const at = LADDER_ROWS.findIndex((r) => r.height === cell.height);
  if (at < 0) throw new RangeError(`roleText: no ladder row for height ${cell.height}`);
  const h = LADDER_ROWS[Math.min(at - step, LADDER_ROWS.length - 1)].height;
  return uiTextAt ? uiTextAt[h] : uiText(h);
}

// CONTROL_ANATOMY, each control kind's parts in px from one cell. The interactive chip is
// control-sized; only the badge uses the compact row.
export const CONTROL_ANATOMY = Object.freeze({
  button: (c) => ({ height: c.height, inset: c.inset, gap: c.inset / 2, glyph: c.icon, radius: c.radiusControl }),
  "icon-only": (c) => ({ height: c.height, width: c.height, inset: 0, glyph: c.icon, radius: c.radiusControl }),
  input: (c) => CONTROL_ANATOMY.button(c),
  select: (c) => ({ height: c.height, inset: c.inset, lane: c.icon + c.inset, caret: 0.6 * c.icon, radius: c.radiusControl }),
  trigger: (c) => ({ ...CONTROL_ANATOMY.button(c), caret: c.icon }),
  chip: (c) => ({ height: c.height, inset: c.inset, gap: c.inset / 2, glyph: c.icon, radius: c.height / 2 }),
  badge: (c) => ({ height: c.chipHeight, inset: c.chipInset, gap: c.chipInset / 2, glyph: c.chipHeight - 2 * c.chipInset, radius: c.chipHeight / 2 }),
  switch: (c) => { const e = edge(c); return { trackWidth: 1.75 * c.icon, trackHeight: c.icon, thumb: c.icon - 2 * e, edge: e, radius: c.icon / 2 }; },
  range: (c) => ({ track: 0.4 * c.icon, thumb: 1.25 * c.icon }),
});

// CONTAINER_COMPOSITION, the one inset and radius rule for a container of repeated parts: the outer
// radius is the part radius plus the padding, so the corners stay concentric.
const compose = (padding, radius, partHeight, partInset, partRadius) => ({ padding, radius, partHeight, partInset, partRadius });
export const CONTAINER_COMPOSITION = Object.freeze({
  segmented: (c) => compose(c.partInset, c.radiusControl, c.partHeight, c.partInset, c.radiusInset),
  "tab-row": (c) => compose(c.partInset, c.radiusControl, c.partHeight, c.partInset, c.radiusInset),
  menu: (c) => compose(c.partInset, c.radiusCard, c.height, c.inset, c.radiusControl),
  "input-group": (c) => compose(0, c.radiusControl, c.height, c.inset, c.radiusControl),
  "switch-track": (c) => { const e = edge(c); return compose(e, c.icon / 2, c.icon - 2 * e, e, (c.icon - 2 * e) / 2); },
});

// shellRolesCSS(cell, uiTextAt, hostKey), the per-cell custom properties the shell stylesheet reads:
// the four text steps, the badge glyph box and the switch edge, scoped to one host key.
export function shellRolesCSS(cell, uiTextAt, hostKey) {
  const decls = [0, -1, -2, -3].map((s, i) => [`--ui-text-step-${i}`, roleText(cell, s, uiTextAt)]);
  decls.push(["--ui-badge-icon", cell.chipHeight - 2 * cell.chipInset], ["--ui-edge", edge(cell)]);
  return [`ultimate-tokens[data-ut-geom="${hostKey}"] {`, ...decls.map(([n, v]) => `  ${n}: ${v}px;`), "}"].join("\n");
}
