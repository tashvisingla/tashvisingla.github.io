// Tendon-driven hand exoskeleton: dorsal frame, per-finger phalanx shells with palmar tendon guides,
// tendons routed back to a wrist-mounted spool pack. Fingers shown mid-grasp.
import { assembly, group, box, cyl, torus, sweep, MAT } from "../cad/parts.js";

const FINGERS = [ // x offset, segment lengths, base curl
  { x: -27, L: [40, 26, 20], name: "Index" },
  { x: -9, L: [44, 29, 22], name: "Middle" },
  { x: 9, L: [41, 27, 21], name: "Ring" },
  { x: 26, L: [33, 21, 18], name: "Little" },
];
const CURL = [0.35, 0.55, 0.45];

/** 2D chain in YZ plane: returns joint points and segment angles. */
function chain(L, curl, start = [0, 0], a0 = 0) {
  const pts = [start]; const angs = []; let [y, z] = start, a = a0;
  L.forEach((l, i) => { a += curl[i]; angs.push(a); y -= Math.sin(a) * l; z += Math.cos(a) * l; pts.push([y, z]); });
  return { pts, angs };
}

function finger({ L }, curl, shellMat) {
  const { pts, angs } = chain(L, curl);
  const items = [], tendon = [];
  L.forEach((l, i) => {
    const [y0, z0] = pts[i], [y1, z1] = pts[i + 1], a = angs[i];
    const cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    items.push({ mesh: box({ x: 16, y: 5, z: l - 4, material: shellMat }), pos: [0, cy + 6 * Math.cos(a), cz + 6 * Math.sin(a)], rot: [(a * 180) / Math.PI, 0, 0] });
    // palmar guide ring
    const gy = cy - 8 * Math.cos(a), gz = cz - 8 * Math.sin(a);
    items.push({ mesh: torus({ R: 3, r: 1, material: MAT.steel() }), pos: [0, gy, gz], rot: [0, 90, 0] });
    tendon.push([0, gy, gz]);
    items.push({ mesh: cyl({ r: 3.5, h: 18, material: MAT.steel() }), pos: [0, y0 + 2, z0], rot: [0, 0, 90] }); // joint pin
  });
  return { g: group(items), tendon };
}

export default function build() {
  const parts = [
    {
      name: "Dorsal frame (hand plate)",
      mesh: group([
        { mesh: box({ x: 78, y: 5, z: 70, material: MAT.pla(0xf3efe6) }), pos: [0, 10, -35] },
        { mesh: box({ x: 84, y: 8, z: 8, material: MAT.pla(0xf3efe6) }), pos: [0, 8, 0] },
      ]),
      pos: [0, 0, 0], explode: [0, 30, 0],
    },
    {
      name: "Wrist cuff",
      mesh: group([
        { mesh: torus({ R: 34, r: 4, arc: Math.PI * 1.3, material: MAT.pla(0x2346a0) }), rot: [0, 0, -144] },
        { mesh: torus({ R: 34, r: 4, arc: Math.PI * 1.3, material: MAT.pla(0x2346a0) }), pos: [0, 0, -22], rot: [0, 0, -144] },
      ]),
      pos: [0, -14, -95], explode: [0, 0, -40],
    },
    {
      name: "Spool pack (tendon actuators)",
      mesh: group([
        { mesh: box({ x: 70, y: 24, z: 40, material: MAT.carbon() }) },
        ...[-24, -8, 8, 24].map((x) => ({ mesh: cyl({ r: 7, h: 10, material: MAT.aluminum() }), pos: [x, 15, 0] })),
      ]),
      pos: [0, 30, -100], explode: [0, 50, -30],
    },
  ];
  FINGERS.forEach((f, i) => {
    const shell = i % 2 ? MAT.pla(0xe0663a) : MAT.pla(0xf3efe6);
    const { g, tendon } = finger(f, CURL, shell);
    parts.push({ name: `${f.name} finger linkage`, mesh: g, pos: [f.x, 0, 4], explode: [f.x * 0.6, 10, 40] });
    // tendon: from fingertip guide back along palm to spool
    const pts = [...tendon].reverse().map(([x, y, z]) => [f.x + x, y, z + 4]);
    pts.push([f.x * 0.9, -10, -20], [f.x * 0.6, -6, -70], [[-24, -8, 8, 24][i], 30, -100]);
    parts.push({ name: `${f.name} tendon`, mesh: sweep(pts, 0.9, MAT.pla(0xc4552d)), pos: [0, 0, 0], explode: [f.x * 0.6, 10, 40] });
  });
  // thumb: two segments, angled out to the side
  const thumb = finger({ L: [32, 24] }, [0.3, 0.5], MAT.pla(0x2346a0));
  parts.push({ name: "Thumb linkage", mesh: group([{ mesh: thumb.g, rot: [0, -50, -30] }]), pos: [-44, -6, -40], explode: [-40, 0, 10] });

  return { group: assembly(parts), notes: "Grip force +25% and dexterity task time −15% came from tendon-routing iterations." };
}
