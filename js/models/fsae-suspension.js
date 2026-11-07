// FSAE pushrod: thin-wall tube with bonded threaded inserts, rod ends + jam nuts,
// shown between a lower A-arm bracket and the rocker. Section cut shows wall/insert.
import * as THREE from "three";
import { assembly, group, tube, rodEnd, cyl, box, sweep, MAT } from "../cad/parts.js";

const LEN = 320, ANG = 62; // pushrod length, angle from horizontal (deg)

export default function build() {
  const rod = group([
    { mesh: tube({ od: 15.9, id: 13.4, length: LEN, material: MAT.carbon() }), pos: [0, 0, 0] },
    { mesh: cyl({ r: 8.2, h: 28, material: MAT.aluminum() }), pos: [0, 14, 0] },
    { mesh: cyl({ r: 8.2, h: 28, material: MAT.aluminum() }), pos: [0, LEN - 14, 0] },
  ]);
  const tilt = (90 - ANG);
  const dir = new THREE.Vector3(Math.sin(THREE.MathUtils.degToRad(-tilt)), Math.cos(THREE.MathUtils.degToRad(tilt)), 0);
  const top = dir.clone().multiplyScalar(LEN);

  const parts = [
    { name: "Pushrod tube (bonded inserts)", mesh: rod, pos: [0, 0, 0], rot: [0, 0, tilt], explode: [0, 0, 0] },
    { name: "Lower rod end + jam nut", mesh: group([{ mesh: rodEnd({ eye: 10, shank: 26, d: 8 }), rot: [0, 0, 180] }]), pos: [-dir.x * 18, -dir.y * 18, 0], rot: [0, 0, tilt], explode: [-dir.x * 50, -dir.y * 50, 0] },
    { name: "Upper rod end + jam nut", mesh: rodEnd({ eye: 10, shank: 26, d: 8 }), pos: [top.x + dir.x * 18, top.y + dir.y * 18, 0], rot: [0, 0, tilt], explode: [dir.x * 50, dir.y * 50, 0] },
    {
      name: "Lower A-arm + pushrod bracket",
      mesh: group([
        { mesh: sweep([[-260, -10, -120], [-10, -10, 0], [-260, -10, 120]], 8, MAT.steel()) },
        { mesh: box({ x: 30, y: 30, z: 4, material: MAT.steel() }), pos: [0, 0, 8] },
        { mesh: box({ x: 30, y: 30, z: 4, material: MAT.steel() }), pos: [0, 0, -8] },
      ]),
      pos: [-dir.x * 18, -dir.y * 18, 0], explode: [0, -70, 0],
    },
    {
      name: "Rocker (bellcrank)",
      mesh: group([
        { mesh: box({ x: 90, y: 50, z: 6, material: MAT.aluminum() }), pos: [-30, 10, 8] },
        { mesh: box({ x: 90, y: 50, z: 6, material: MAT.aluminum() }), pos: [-30, 10, -8] },
        { mesh: cyl({ r: 6, h: 30, material: MAT.steel() }), pos: [-55, 20, 0], rot: [90, 0, 0] },
      ]),
      pos: [top.x + dir.x * 18, top.y + dir.y * 18, 0], explode: [40, 70, 0],
    },
  ];
  return { group: assembly(parts), notes: "Redesign goal: less unsprung mass, higher torsional stiffness." };
}
