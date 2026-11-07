// 6S2P lithium-sulfur pouch pack (illustrative dimensions, not Zeta production geometry).
// Six parallel pairs stacked, foam interlayers, Al compression plates with corner bolts + G10 stops,
// Ni strip (−) and Al busbar (+) parallel bridges, Ni-Cu series jumpers, BMS + leads on top.
import * as THREE from "three";
import { assembly, group, box, cyl, sweep, MAT } from "../cad/parts.js";

const CELL = { w: 60, l: 92, t: 7 }, GAP = 4, FOAM = 2, TAB = { w: 17, l: 26, t: 0.6 };
const PITCH = CELL.t + FOAM;
const pouch = () => new THREE.MeshStandardMaterial({ color: 0xc9ccd3, metalness: 0.55, roughness: 0.32 });
const foamMat = () => new THREE.MeshStandardMaterial({ color: 0x3d4148, roughness: 0.95 });
const nickel = () => new THREE.MeshStandardMaterial({ color: 0xd8d4c8, metalness: 0.8, roughness: 0.3 });
const nicu = () => new THREE.MeshStandardMaterial({ color: 0xc98a5a, metalness: 0.8, roughness: 0.3 });
const kapton = () => new THREE.MeshStandardMaterial({ color: 0xe0a030, roughness: 0.5, transparent: true, opacity: 0.85 });

const xA = -(CELL.w + GAP) / 2, xB = (CELL.w + GAP) / 2; // cell centers
const zTab = CELL.l / 2;                                   // tab root

/** One parallel group: two cells, (−) tabs adjacent at center, (+) tabs outboard. side = +1/−1 for + stub. */
function parallelGroup(k, side) {
  const items = [];
  for (const [xc, mirror] of [[xA, 1], [xB, -1]]) {
    items.push({ mesh: box({ x: CELL.w, y: CELL.t, z: CELL.l, material: pouch() }), pos: [xc, 0, 0] });
    // sealed edge flange around the pouch
    items.push({ mesh: box({ x: CELL.w + 4, y: 0.8, z: CELL.l + 4, material: pouch() }), pos: [xc, 0, 0] });
    const neg = xc + mirror * 15, pos = xc - mirror * 15;
    items.push({ mesh: box({ x: TAB.w, y: TAB.t, z: TAB.l, material: nickel() }), pos: [neg, 0, zTab + TAB.l / 2] });
    items.push({ mesh: box({ x: TAB.w, y: TAB.t, z: TAB.l, material: MAT.aluminum() }), pos: [pos, 0, zTab + TAB.l / 2] });
  }
  // (−) bridge: Ni strip across the two adjacent negative tabs, stub toward −side
  const negSpan = 2 * Math.abs(xA + 15) + TAB.w;
  items.push({ mesh: box({ x: negSpan, y: 0.8, z: 10, material: nickel() }), pos: [0, 0.7, zTab + 14] });
  items.push({ mesh: box({ x: 66, y: 0.8, z: 8, material: nickel() }), pos: [-side * 33, 0.7, zTab + 22] });
  items.push({ mesh: box({ x: negSpan + 2, y: 0.3, z: 12, material: kapton() }), pos: [0, 1.3, zTab + 14] });
  // (+) bridge: Al busbar arching over, joining outboard positive tabs, stub toward +side
  const px = Math.abs(xA - 15);
  items.push({ mesh: box({ x: 2 * px + 10, y: 2, z: 8, material: MAT.aluminum() }), pos: [0, 3.2, zTab + TAB.l - 3] });
  for (const sx of [-1, 1]) items.push({ mesh: box({ x: 8, y: 3, z: 8, material: MAT.aluminum() }), pos: [sx * px, 1.5, zTab + TAB.l - 3] });
  items.push({ mesh: box({ x: 12, y: 2, z: 8, material: MAT.aluminum() }), pos: [side * (px + 10), 3.2, zTab + TAB.l - 3] });
  // foam interlayer above this group
  items.push({ mesh: box({ x: 2 * CELL.w + GAP, y: FOAM, z: CELL.l, material: foamMat() }), pos: [0, CELL.t / 2 + FOAM / 2, 0] });
  return group(items);
}

export default function build() {
  const parts = [];
  const H = 6 * PITCH;
  const y0 = 3 + FOAM + CELL.t / 2; // above bottom plate + base pad
  const W = 2 * CELL.w + GAP + 26, D = CELL.l + 14;

  parts.push({ name: "Bottom Al plate (3 mm 6061)", mesh: plateWithHoles(W, D), pos: [0, 1.5, 0], explode: [0, -40, 0] });
  parts.push({ name: "Base EVA pad", mesh: box({ x: 2 * CELL.w + GAP, y: FOAM, z: CELL.l, material: foamMat() }), pos: [0, 3 + FOAM / 2, 0], explode: [0, -25, 0] });

  for (let k = 0; k < 6; k++) {
    const side = k % 2 ? -1 : 1;
    parts.push({ name: `Parallel group ${k + 1} (2 cells)`, mesh: parallelGroup(k, side), pos: [0, y0 + k * PITCH, 0], explode: [0, (k - 2.5) * 16, 0] });
  }
  // Series jumpers: + stub of group k to − stub of group k+1 (same side), vertical Ni-Cu bar
  for (let k = 0; k < 5; k++) {
    const side = k % 2 ? -1 : 1;
    const ya = y0 + k * PITCH + 3, yb = y0 + (k + 1) * PITCH + 0.7;
    parts.push({
      name: `Series jumper ${k + 1}–${k + 2} (Ni-Cu)`,
      mesh: box({ x: 3, y: yb - ya + 2, z: 8, material: nicu() }),
      pos: [side * 66, (ya + yb) / 2, zTab + 22 - (k % 2 ? 0 : 0)],
      explode: [side * 30, (k - 2) * 16, 30],
    });
  }
  const top = y0 + 5 * PITCH + CELL.t / 2 + FOAM;
  parts.push({ name: "Top EVA pad", mesh: box({ x: 2 * CELL.w + GAP, y: FOAM, z: CELL.l, material: foamMat() }), pos: [0, top + FOAM / 2, 0], explode: [0, 50, 0] });
  parts.push({ name: "Top Al plate (3 mm 6061)", mesh: plateWithHoles(W, D), pos: [0, top + FOAM + 1.5, 0], explode: [0, 70, 0] });

  const cx = W / 2 - 6, cz = D / 2 - 6, plateTop = top + FOAM + 3;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    parts.push({
      name: `M3 SHCS + G10 stop ${i + 1}`,
      mesh: group([
        { mesh: cyl({ r: 1.5, h: plateTop + 6, material: MAT.steel() }), pos: [0, (plateTop + 6) / 2 - 3, 0] },
        { mesh: cyl({ r: 2.8, h: 3, material: MAT.steel() }), pos: [0, -1.5, 0] },
        { mesh: cyl({ r: 3, h: 2.4, seg: 6, material: MAT.steel() }), pos: [0, plateTop + 1.2, 0] },
        { mesh: box({ x: 12, y: plateTop - 6, z: 12, material: MAT.pla(0xb8c48a) }), pos: [0, plateTop / 2, 0] },
      ]),
      pos: [sx * cx, 0, sz * cz],
      explode: [sx * 25, 90, sz * 25],
    });
  });

  parts.push({
    name: "BMS (6S, active balancing)",
    mesh: group([
      { mesh: box({ x: 70, y: 2, z: 45, material: MAT.pla(0x1f6b3a) }) },
      { mesh: box({ x: 22, y: 6, z: 14, material: MAT.carbon() }), pos: [-18, 4, 8] },
      { mesh: box({ x: 14, y: 4, z: 10, material: MAT.carbon() }), pos: [16, 3, -10] },
    ]),
    pos: [-20, plateTop + 3, -8], explode: [0, 110, 0],
  });
  parts.push({
    name: "XT60 + main leads",
    mesh: group([
      { mesh: sweep([[0, 0, 0], [8, 6, 20], [10, 8, 40]], 2.2, MAT.pla(0xb3261e)) },
      { mesh: sweep([[6, 0, 0], [14, 6, 20], [18, 8, 40]], 2.2, MAT.carbon()) },
      { mesh: box({ x: 16, y: 8, z: 16, material: MAT.pla(0xe6c229) }), pos: [14, 8, 48] },
    ]),
    pos: [30, plateTop + 3, D / 2 - 6], explode: [0, 110, 30],
  });
  parts.push({
    name: "JST-XH 7-pin balance lead",
    mesh: group([
      { mesh: sweep([[0, 0, 0], [-6, 4, 18], [-4, 6, 34]], 1.2, MAT.pla(0xf2f2f2)) },
      { mesh: box({ x: 18, y: 6, z: 6, material: MAT.pla(0xf2f2f2) }), pos: [-4, 6, 38] },
    ]),
    pos: [-40, plateTop + 3, D / 2 - 6], explode: [0, 110, 30],
  });

  return {
    group: assembly(parts),
    notes: "Shows the 6S2P architecture. Cell dimensions approximate.",
  };
}

function plateWithHoles(W, D) {
  const s = new THREE.Shape();
  s.moveTo(-W / 2, -D / 2); s.lineTo(W / 2, -D / 2); s.lineTo(W / 2, D / 2); s.lineTo(-W / 2, D / 2);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = new THREE.Path(); p.absarc(sx * (W / 2 - 6), sz * (D / 2 - 6), 1.6, 0, Math.PI * 2, true); s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: false, curveSegments: 24 });
  g.rotateX(Math.PI / 2); g.translate(0, 1.5, 0);
  return new THREE.Mesh(g, MAT.aluminum());
}
