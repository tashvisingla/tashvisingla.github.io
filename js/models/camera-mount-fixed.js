// Fixed-tilt camera mount for the Columbia Robotics quad: printed base bolted under the frame on
// TPU grommets, two side cheeks with a 25° uptilt pivot, camera clamped between them. Y-up, front = +Z.
import { assembly, group, box, cyl, torus, MAT } from "../cad/parts.js";

export default function build() {
  const slate = () => MAT.pla(0x2346a0);
  const parts = [
    { name: "Mount base (printed)", mesh: box({ x: 40, y: 3, z: 34, material: slate() }), pos: [0, 0, 0], explode: [0, 20, 0] },
    {
      name: "TPU damper grommets (×4)",
      mesh: group([[-14, -10], [14, -10], [-14, 10], [14, 10]].map(([x, z]) => ({ mesh: torus({ R: 2.4, r: 0.9, material: MAT.rubber() }), pos: [x, 2.2, z], rot: [90, 0, 0] }))),
      pos: [0, 0, 0], explode: [0, 35, 0],
    },
    { name: "Side cheek (left)", mesh: box({ x: 3, y: 28, z: 26, material: slate() }), pos: [-17, -14, 4], explode: [-25, 0, 0] },
    { name: "Side cheek (right)", mesh: box({ x: 3, y: 28, z: 26, material: slate() }), pos: [17, -14, 4], explode: [25, 0, 0] },
    { name: "M3 pivot screws", mesh: group([-1, 1].map((s) => ({ mesh: cyl({ r: 2.6, h: 2, material: MAT.steel() }), pos: [s * 19.5, 0, 0], rot: [0, 0, 90] }))), pos: [0, -16, 6], explode: [0, 0, 0] },
    {
      name: "Camera (25° uptilt)",
      mesh: group([
        { mesh: box({ x: 28, y: 26, z: 24, r: 2, material: MAT.carbon() }) },
        { mesh: cyl({ r: 8, h: 10, material: MAT.steel() }), pos: [0, 0, 16], rot: [90, 0, 0] },
      ]),
      pos: [0, -16, 6], explode: [0, -30, 25],
    },
  ];
  const g = assembly(parts);
  g.children[5].rotation.x = -25 * Math.PI / 180;
  return { group: g, notes: "Fixed-tilt FPV-style mount. Explode separates base, cheeks, and camera." };
}
