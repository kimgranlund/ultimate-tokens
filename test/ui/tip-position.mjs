#!/usr/bin/env node
// tip-position.mjs, verifier for the Radix step tooltip's rect math (src/ui/tip-position.mjs, T-0043). Pure, no DOM.
// Covers the three placements the ticket names (below by default, above near the bottom edge, shifted left near the
// right edge), the corner case, the tall-tip clamp, and that the result stays inside the window in every case.
import { placeTip } from "../../src/ui/tip-position.mjs";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

const VIEW = { width: 1440, height: 900 };
const TIP = { width: 220, height: 51 };
const sw = (left, top) => ({ left, top, right: left + 26, bottom: top + 40 }); // a 26 x 40 swatch, as in the ladder
const inside = (p, tip = TIP, view = VIEW, m = 8) => p.left >= m && p.top >= m && p.left + tip.width <= view.width - m && p.top + tip.height <= view.height - m;

// default: below the swatch, left edges aligned, 6px gap
let p = placeTip(sw(300, 200), TIP, VIEW);
ok(p.placement === "below" && p.left === 300 && p.top === 246, `mid-window swatch: below, aligned (got ${JSON.stringify(p)})`);

// near the bottom edge: flips above (the 56px band the T-0037 verifier found clipped)
p = placeTip(sw(300, 860), TIP, VIEW);
ok(p.placement === "above" && p.top === 860 - 6 - 51 && inside(p), `swatch at the bottom edge: above (got ${JSON.stringify(p)})`);
p = placeTip(sw(300, 900 - 40 - 20), TIP, VIEW); // 20px of room under the swatch, tip needs 57
ok(p.placement === "above", `20px under the swatch: above (got ${JSON.stringify(p)})`);
p = placeTip(sw(300, 900 - 40 - 80), TIP, VIEW); // 80px of room: still below
ok(p.placement === "below", `80px under the swatch: below (got ${JSON.stringify(p)})`);

// near the right edge: shifted left so the box ends at the margin
p = placeTip(sw(1400, 200), TIP, VIEW);
ok(p.placement === "below" && p.left === 1440 - 8 - 220 && inside(p), `swatch at the right edge: shifted left (got ${JSON.stringify(p)})`);
p = placeTip(sw(1230, 200), TIP, VIEW); // 1230 + 220 = 1450 > 1432
ok(p.left === 1212, `swatch 210px from the right edge: shifted to 1212 (got ${p.left})`);
p = placeTip(sw(1200, 200), TIP, VIEW); // 1200 + 220 = 1420 <= 1432
ok(p.left === 1200, `swatch whose tip fits: not shifted (got ${p.left})`);

// both edges at once
p = placeTip(sw(1410, 870), TIP, VIEW);
ok(p.placement === "above" && p.left === 1212 && inside(p), `bottom-right corner: above and shifted (got ${JSON.stringify(p)})`);

// near the left and top edges: never past the margin
p = placeTip(sw(0, 0), TIP, VIEW);
ok(p.left === 8 && p.placement === "below" && inside(p), `top-left swatch: margin on the left (got ${JSON.stringify(p)})`);

// neither side fits (a short window): takes the roomier side, clamps inside, never negative
const SHORT = { width: 600, height: 120 };
p = placeTip(sw(100, 70), { width: 220, height: 90 }, SHORT);
ok(p.top >= 8 && p.top + 90 <= SHORT.height - 8 || p.top === 8, `short window: clamped into the window (got ${JSON.stringify(p)})`);
p = placeTip(sw(100, 10), { width: 220, height: 90 }, SHORT);
ok(p.placement === "below" && p.top >= 8, `short window, swatch near the top: roomier side is below (got ${JSON.stringify(p)})`);

// a tip wider than the window: pinned at the margin, not driven negative
p = placeTip(sw(50, 200), { width: 500, height: 51 }, { width: 400, height: 900 });
ok(p.left === 8, `tip wider than the window: pinned at the margin (got ${p.left})`);

// sweep: every swatch position on a 1440 x 900 window lands inside it
let outside = 0;
for (let x = 0; x <= 1414; x += 37) for (let y = 0; y <= 860; y += 29) if (!inside(placeTip(sw(x, y), TIP, VIEW))) outside++;
ok(outside === 0, `${outside} swatch positions on the sweep put the tip outside the window`);

if (fails.length) { console.error(`tip-position FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("tip-position PASS, below by default · above near the bottom · shifted left near the right · corner · clamps · window sweep");
process.exit(0);
