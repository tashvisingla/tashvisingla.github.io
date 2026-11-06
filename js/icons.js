// Line-art thumbnails for project cards (drafting style). 64x64 viewBox, stroke = currentColor.
const s = (body) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

function gearPath(cx, cy, r, teeth, depth) {
  let d = "";
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r - depth;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }
  return `<path d="${d}Z"/>`;
}

export const ICONS = {
  gear: s(
    gearPath(24, 30, 15, 12, 3) + `<circle cx="24" cy="30" r="4"/>` +
    gearPath(46, 40, 10, 8, 2.5) + `<circle cx="46" cy="40" r="2.5"/>`
  ),
  rocket: s(
    `<path d="M32 6c6 6 8 14 8 24v16H24V30c0-10 2-18 8-24z"/><path d="M24 36l-8 10v4h8M40 36l8 10v4h-8"/><path d="M28 46v6M36 46v6M32 46v10"/><circle cx="32" cy="24" r="3"/>`
  ),
  drone: s(
    `<rect x="26" y="26" width="12" height="12" rx="2"/><path d="M26 26L16 16M38 26l10-10M26 38L16 48M38 38l10 10"/>` +
    `<ellipse cx="16" cy="16" rx="9" ry="2.5"/><ellipse cx="48" cy="16" rx="9" ry="2.5"/><ellipse cx="16" cy="48" rx="9" ry="2.5"/><ellipse cx="48" cy="48" rx="9" ry="2.5"/>`
  ),
  battery: s(
    `<rect x="8" y="18" width="44" height="28" rx="3"/><path d="M52 26h4v12h-4"/><path d="M16 18v28M24 18v28M32 18v28M40 18v28"/><path d="M28 28l-3 5h6l-3 5"/>`
  ),
  valve: s(
    `<path d="M6 36h16M42 36h16"/><path d="M22 28l20 16V28L22 44z"/><path d="M32 36V18"/><rect x="24" y="8" width="16" height="10" rx="2"/>` +
    gearPath(52, 14, 6, 8, 1.5)
  ),
  hand: s(
    `<path d="M20 56V32l-6-8c-2-3 1-6 4-4l6 6V12a3 3 0 016 0v14-18a3 3 0 016 0v18-14a3 3 0 016 0v16-10a3 3 0 016 0v22c0 8-6 16-14 16z"/><path d="M27 20h0M33 16h0M39 20h0" stroke-width="3"/><path d="M27 26l6-6 6 6 6-4" stroke-dasharray="2 3"/>`
  ),
  car: s(
    `<path d="M4 40l10-2 8-10h22l10 10 6 2v6H4z"/><circle cx="16" cy="46" r="6"/><circle cx="48" cy="46" r="6"/><path d="M26 28l4 10h14"/>`
  ),
  robot: s(
    `<rect x="12" y="24" width="40" height="18" rx="2"/><circle cx="18" cy="48" r="5"/><circle cx="46" cy="48" r="5"/><circle cx="32" cy="48" r="5"/>` +
    `<path d="M22 24l8-14h10l4 6M40 10l-4 14"/><path d="M44 16l8 2"/>`
  ),
};

export const icon = (k) => ICONS[k] || ICONS.gear;
