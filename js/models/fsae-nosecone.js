// FSAE nose cone (carbon layup, lofted shell) sitting on its CNC-machined mold, plus the
// impact attenuator mount face. Front of car = +Z.
import { assembly, group, loft, box, cyl, MAT } from "../cad/parts.js";

const sections = [
  { z: 0, w: 380, h: 300, y: 150, n: 3.2 },
  { z: 120, w: 360, h: 270, y: 140, n: 3.0 },
  { z: 260, w: 310, h: 220, y: 120, n: 2.8 },
  { z: 380, w: 240, h: 170, y: 100, n: 2.6 },
  { z: 470, w: 170, h: 125, y: 85, n: 2.4 },
  { z: 530, w: 110, h: 85, y: 75, n: 2.2 },
  { z: 560, w: 50, h: 40, y: 72, n: 2 },
];

export default function build() {
  const parts = [
    { name: "Nose cone (carbon fiber shell)", mesh: loft(sections, MAT.carbon(), { seg: 64 }), pos: [0, 0, 0], explode: [0, 220, 0] },
    {
      name: "Attenuator mount plate",
      mesh: box({ x: 220, y: 200, z: 6, material: MAT.aluminum() }),
      pos: [0, 150, -4], explode: [0, 220, -80],
    },
    {
      name: "Male mold (CNC machined tooling board)",
      mesh: group([
        { mesh: loft(sections.map((s) => ({ ...s, w: s.w - 8, h: s.h - 8 })), MAT.pla(0xd9b26a), { seg: 64 }) },
        { mesh: box({ x: 460, y: 30, z: 640, material: MAT.pla(0xb8955a) }), pos: [0, -15, 280] },
      ]),
      pos: [0, 0, 0], explode: [0, -20, 0],
    },
    {
      name: "Mold locating pins",
      mesh: group([-180, 180].map((x) => ({ mesh: cyl({ r: 6, h: 40, material: MAT.steel() }), pos: [x, 10, 580] }))),
      pos: [0, 0, 0], explode: [0, 40, 0],
    },
  ];
  return { group: assembly(parts), notes: "Explode lifts the layup off the tool." };
}
