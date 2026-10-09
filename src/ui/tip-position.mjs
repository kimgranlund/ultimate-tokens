// tip-position.mjs, the rect math for the one shared step tooltip (T-0043). Pure and DOM-free: callers pass
// plain rects, so the flip rules are unit-tested without a browser.
//
// A tooltip opens below its anchor, left edges aligned. Near the right edge of the window it shifts left until
// it fits; near the bottom edge it flips above the anchor (when that side has room, else it takes the roomier
// side and clamps). It never leaves the window by more than the margin, whatever the anchor's position.

/**
 * @param {{left:number,top:number,right:number,bottom:number}} anchor  the swatch's bounding rect, in viewport px
 * @param {{width:number,height:number}} tip                              the tooltip's own size
 * @param {{width:number,height:number}} view                             the window (viewport) size
 * @param {{gap?:number,margin?:number}} [opts]                           gap to the anchor; margin to the window edge
 * @returns {{left:number,top:number,placement:"below"|"above"}}
 */
export function placeTip(anchor, tip, view, { gap = 6, margin = 8 } = {}) {
  const maxLeft = Math.max(margin, view.width - margin - tip.width);
  const left = Math.min(Math.max(anchor.left, margin), maxLeft);

  const belowTop = anchor.bottom + gap;
  const aboveTop = anchor.top - gap - tip.height;
  const maxTop = Math.max(margin, view.height - margin - tip.height);
  const fitsBelow = belowTop <= maxTop;
  const fitsAbove = aboveTop >= margin;

  if (fitsBelow) return { left, top: belowTop, placement: "below" };
  if (fitsAbove) return { left, top: aboveTop, placement: "above" };
  // neither side fits (a tiny window or a tall tip): take the side with more room and clamp into the window
  const roomBelow = view.height - anchor.bottom;
  const roomAbove = anchor.top;
  const below = roomBelow >= roomAbove;
  const top = Math.min(Math.max(below ? belowTop : aboveTop, margin), maxTop);
  return { left, top, placement: below ? "below" : "above" };
}
