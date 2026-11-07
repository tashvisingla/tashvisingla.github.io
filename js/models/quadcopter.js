// Columbia Robotics quad: printed arms + props (Onshape), fixed-tilt camera mount,
// and a servo-driven snake-style payload arm hanging below the frame.
import * as THREE from "three";
import { assembly, group, box, cyl, sphere, extrudeProfile, MAT } from "../cad/parts.js";
import { armXY, arm, motorProp, fixedCameraMount } from "../cad/drone.js";

const R = 180;

/** Snake: N links hinged in alternating axes, curling forward. */
function snake(n = 7) {
  const root = new THREE.Group();
  let parent = root;
  for (let i = 0; i < n; i++) {
    const seg = new THREE.Group();
    const mat = i % 2 ? MAT.pla(0x2346a0) : MAT.pla(0xe0663a);
    seg.add(box({ x: 16, y: 24, z: 16, material: mat }));
    seg.children[0].position.y = -14;
    const pin = cyl({ r: 3, h: 20, material: MAT.steel() });
    pin.rotation.set(i % 2 ? 0 : 0, 0, Math.PI / 2); seg.add(pin);
    seg.position.y = i === 0 ? 0 : -28;
    seg.rotation.x = i === 0 ? 0 : 0.22; // progressive curl
    parent.add(seg); parent = seg;
  }
  const claw = group([
    { mesh: box({ x: 4, y: 20, z: 8, material: MAT.steel() }), pos: [-8, -10, 0], rot: [0, 0, 15] },
    { mesh: box({ x: 4, y: 20, z: 8, material: MAT.steel() }), pos: [8, -10, 0], rot: [0, 0, -15] },
  ]);
  claw.position.y = -28; parent.add(claw);
  return root;
}

export default function build() {
  const plateProf = [[-45, -55], [45, -55], [60, 0], [45, 55], [-45, 55], [-60, 0]];
  const flat = (m) => { m.rotation.x = Math.PI / 2; return m; };
  const parts = [
    { name: "Bottom plate", mesh: flat(extrudeProfile(plateProf, 3, MAT.carbon())), pos: [0, 0, 0], explode: [0, -25, 0] },
    { name: "Top plate", mesh: flat(extrudeProfile(plateProf, 3, MAT.carbon())), pos: [0, 26, 0], explode: [0, 35, 0] },
    { name: "Avionics stack", mesh: box({ x: 36, y: 18, z: 36, material: MAT.pla(0x1f6b3a) }), pos: [0, 13, 0], explode: [0, 10, -60] },
  ];
  for (let i = 0; i < 4; i++) {
    const [x, z] = armXY(i, R);
    parts.push({ name: `Printed arm ${i + 1}`, mesh: arm(i, 40, R + 12, { w: 26, h: 12, material: MAT.pla(0xf3efe6) }), pos: [0, 12, 0], explode: [x * 0.3, 0, z * 0.3] });
    parts.push({ name: `Motor + printed prop ${i + 1}`, mesh: motorProp(178), pos: [x, 18, z], explode: [x * 0.35, 45, z * 0.35] });
  }
  parts.push({ name: "Battery", mesh: box({ x: 100, y: 32, z: 45, material: MAT.pla(0x3a3f47) }), pos: [0, 46, 0], explode: [0, 80, 0] });
  parts.push({ name: "Camera mount (fixed tilt)", mesh: fixedCameraMount(), pos: [0, -2, 62], explode: [0, -30, 70] });
  parts.push({
    name: "Snake payload mechanism",
    mesh: group([
      { mesh: box({ x: 40, y: 20, z: 24, material: MAT.carbon() }), pos: [0, -10, 0] }, // servo housing
      { mesh: snake(7), pos: [0, -24, 0] },
    ]),
    pos: [0, -2, -10], explode: [0, -90, 0],
  });
  parts.push({
    name: "Landing legs",
    mesh: group([[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => ({
      mesh: group([{ mesh: cyl({ r: 3, h: 70, material: MAT.carbon() }) }, { mesh: sphere({ r: 5, material: MAT.pla(0x2b2f36) }), pos: [0, -36, 0] }]),
      pos: [sx * 45, -36, sz * 45],
    }))),
    pos: [0, 0, 0], explode: [0, -60, 0],
  });
  return { group: assembly(parts), notes: "Snake payload shown deployed and partially curled." };
}
