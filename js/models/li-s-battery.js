// Li-S pack, final retention concept (follows Tashvi's CAD): 12 pouch cells (6S2P) stacked with
// compression pads between them, carbon fiber sheets top and bottom, end clamps (one with tab slots),
// shrink wrap.
import * as THREE from "three";
import { assembly, group, box, MAT } from "../cad/parts.js";

const N = 12;                          // cells (6 parallel pairs in series)
const CELL = { x: 100, z: 76, t: 5.6 };
const PAD = 1.6, SHEET = 2, CLAMP = 16;
const TAB = { w: 17, l: 22, t: 0.5, z: 19 };

const pouch = () => new THREE.MeshStandardMaterial({ color: 0x8e8f8c, metalness: 0.45, roughness: 0.45 });
const pad = () => new THREE.MeshStandardMaterial({ color: 0x9c2b22, roughness: 0.85 });
const cf = () => new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.3, roughness: 0.38 });
const nickel = () => new THREE.MeshStandardMaterial({ color: 0xc9b89a, metalness: 0.75, roughness: 0.35 });
const alum = () => new THREE.MeshStandardMaterial({ color: 0xd0d3d6, metalness: 0.85, roughness: 0.3 });

function cell() {
  return group([
    { mesh: box({ x: CELL.x, y: CELL.t, z: CELL.z, r: 1.2, material: pouch() }) },
    { mesh: box({ x: CELL.x + 3, y: 0.6, z: CELL.z + 3, r: 0.2, material: pouch() }) }, // seal flange
    { mesh: box({ x: TAB.l, y: TAB.t, z: TAB.w, r: 0.1, material: nickel() }), pos: [CELL.x / 2 + TAB.l / 2, 0, -TAB.z] },
    { mesh: box({ x: TAB.l, y: TAB.t, z: TAB.w, r: 0.1, material: alum() }), pos: [CELL.x / 2 + TAB.l / 2, 0, TAB.z] },
  ]);
}

/** End clamp: U-shaped carbon block hugging the stack end; `slots` cuts tab openings. */
function clamp(H, slots, side) {
  const D = CELL.z + 10;
  const s = new THREE.Shape();
  s.moveTo(-D / 2, -H / 2); s.lineTo(D / 2, -H / 2); s.lineTo(D / 2, H / 2); s.lineTo(-D / 2, H / 2);
  if (slots) slots.forEach((y) => [-TAB.z, TAB.z].forEach((z) => {
    const p = new THREE.Path(), w = TAB.w + 3, h = 3;
    p.moveTo(z - w / 2, y - h / 2); p.lineTo(z + w / 2, y - h / 2); p.lineTo(z + w / 2, y + h / 2); p.lineTo(z - w / 2, y + h / 2);
    s.holes.push(p);
  }));
  const g = new THREE.ExtrudeGeometry(s, { depth: 6, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.6, bevelSegments: 2 });
  g.rotateY(side > 0 ? -Math.PI / 2 : Math.PI / 2);
  const face = new THREE.Mesh(g, cf());
  const lip = (y) => ({ mesh: box({ x: CLAMP, y: 4, z: D, r: 0.8, material: cf() }), pos: [-side * CLAMP / 2, y, 0] });
  return group([{ mesh: face }, lip(H / 2 - 2), lip(-H / 2 + 2)]);
}

export default function build() {
  const pitch = CELL.t + PAD;
  const stackH = N * pitch + PAD;
  const H = stackH + 2 * SHEET;
  const y0 = SHEET + PAD + CELL.t / 2;
  const parts = [
    { name: "Bottom carbon fiber sheet", mesh: box({ x: CELL.x + 6, y: SHEET, z: CELL.z + 6, r: 0.6, material: cf() }), pos: [0, SHEET / 2, 0], explode: [0, -40, 0] },
  ];
  for (let i = 0; i < N; i++) {
    const pair = Math.floor(i / 2) + 1;
    parts.push({ name: `Compression pad ${i + 1}`, mesh: box({ x: CELL.x - 2, y: PAD, z: CELL.z - 2, r: 0.3, material: pad() }), pos: [0, y0 - CELL.t / 2 - PAD / 2, 0], explode: [0, (i - N / 2) * 7 - 3, 0] });
    parts.push({ name: `Cell ${i + 1} (pair P${pair})`, mesh: cell(), pos: [0, y0 + i * pitch - 0, 0], explode: [0, (i - N / 2) * 7, 0] });
    parts[parts.length - 1].pos[1] = y0 + i * pitch;
    parts[parts.length - 2].pos[1] = y0 + i * pitch - CELL.t / 2 - PAD / 2;
  }
  parts.push({ name: "Top compression pad", mesh: box({ x: CELL.x - 2, y: PAD, z: CELL.z - 2, r: 0.3, material: pad() }), pos: [0, SHEET + stackH - PAD / 2, 0], explode: [0, 46, 0] });
  parts.push({ name: "Top carbon fiber sheet", mesh: box({ x: CELL.x + 6, y: SHEET, z: CELL.z + 6, r: 0.6, material: cf() }), pos: [0, H - SHEET / 2, 0], explode: [0, 60, 0] });

  const slotY = Array.from({ length: N }, (_, i) => y0 + i * pitch - H / 2);
  parts.push({ name: "End clamp (tab side, slotted)", mesh: clamp(H + 8, slotY, 1), pos: [CELL.x / 2 + 3 + 3, H / 2, 0], explode: [70, 0, 0] });
  parts.push({ name: "End clamp (closed side)", mesh: clamp(H + 8, null, -1), pos: [-CELL.x / 2 - 3 - 3, H / 2, 0], explode: [-70, 0, 0] });

  const wrap = new THREE.MeshStandardMaterial({ color: 0xbfd0e0, transparent: true, opacity: 0.1, roughness: 0.15, metalness: 0, depthWrite: false });
  parts.push({ name: "Shrink wrap", mesh: box({ x: CELL.x + 34, y: H + 12, z: CELL.z + 14, r: 3, material: wrap }), pos: [0, H / 2, 0], explode: [0, 0, 110] });

  return {
    group: assembly(parts),
    notes: "Rebuilt from her retention-concept CAD so it can be rotated and exploded.",
  };
}
