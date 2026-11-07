// Shared multirotor sub-assemblies. Y-up, units mm. Front of aircraft = +Z.
import * as THREE from "three";
import { group, box, cyl, sphere, motor, propeller, extrudeProfile, sweep, MAT } from "./parts.js";

/** Arm i of 4 in X layout: returns [x, z] of motor center for half-diagonal r. */
export const armXY = (i, r) => {
  const a = Math.PI / 4 + (i * Math.PI) / 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
};

/** Tapered arm from hub (r0) to motor (r1), as a box rotated to angle. */
export function arm(i, r0, r1, { w = 22, h = 14, material = MAT.pla(0xe0663a) } = {}) {
  const a = Math.PI / 4 + (i * Math.PI) / 2, L = r1 - r0, mid = (r0 + r1) / 2;
  const prof = [[0, -w / 2], [L, -w / 2.8], [L, w / 2.8], [0, w / 2]];
  const m = extrudeProfile(prof, h, material);
  m.rotation.x = Math.PI / 2; // XY profile → XZ plane, thickness along Y
  const g = new THREE.Group(); g.add(m); m.position.x = r0;
  g.rotation.y = -a;
  return g;
}

export function motorProp(dia = 254) {
  return group([
    { mesh: motor({ d: 28, h: 22 }) },
    { mesh: propeller({ dia }), pos: [0, 30, 0] },
  ]);
}

/** 2-axis camera gimbal on a vibration-damped plate. Hangs below mount point (origin). */
export function cameraGimbal({ material = MAT.carbon() } = {}) {
  const ball = () => sphere({ r: 4, material: MAT.pla(0x2b2f36) });
  return group([
    { mesh: box({ x: 60, y: 2, z: 45, material }), pos: [0, 0, 0] },                 // airframe-side plate
    ...[[-22, -16], [22, -16], [-22, 16], [22, 16]].map(([x, z]) => ({ mesh: ball(), pos: [x, -5, z] })), // dampers
    { mesh: box({ x: 60, y: 2, z: 45, material }), pos: [0, -10, 0] },               // isolated plate
    { mesh: cyl({ r: 10, h: 12, material: MAT.aluminum() }), pos: [0, -17, 0] },     // yaw/pan motor
    { mesh: box({ x: 56, y: 4, z: 6, material: MAT.aluminum() }), pos: [0, -25, 0] }, // U-bracket top
    { mesh: box({ x: 4, y: 30, z: 6, material: MAT.aluminum() }), pos: [-26, -40, 0] },
    { mesh: box({ x: 4, y: 30, z: 6, material: MAT.aluminum() }), pos: [26, -40, 0] },
    { mesh: cyl({ r: 8, h: 8, material: MAT.aluminum() }), pos: [30, -48, 0], rot: [0, 0, 90] }, // tilt motor
    { mesh: box({ x: 40, y: 28, z: 30, material: MAT.carbon() }), pos: [0, -48, 0] }, // camera body
    { mesh: cyl({ r: 9, h: 12, material: MAT.steel() }), pos: [0, -48, 20], rot: [90, 0, 0] }, // lens
    { mesh: cyl({ r: 6, h: 1, material: new THREE.MeshStandardMaterial({ color: 0x223355, metalness: 0.9, roughness: 0.05 }) }), pos: [0, -48, 26.5], rot: [90, 0, 0] },
  ]);
}

/** Fixed-tilt printed camera mount (FPV/mapping style) with 25° uptilt. */
export function fixedCameraMount({ material = MAT.pla(0x2346a0) } = {}) {
  return group([
    { mesh: box({ x: 36, y: 3, z: 30, material }), pos: [0, 0, 0] },
    { mesh: box({ x: 3, y: 28, z: 24, material }), pos: [-17, -14, 4] },
    { mesh: box({ x: 3, y: 28, z: 24, material }), pos: [17, -14, 4] },
    {
      mesh: group([
        { mesh: box({ x: 28, y: 26, z: 24, material: MAT.carbon() }) },
        { mesh: cyl({ r: 8, h: 10, material: MAT.steel() }), pos: [0, 0, 16], rot: [90, 0, 0] },
      ]),
      pos: [0, -16, 6], rot: [-25, 0, 0],
    },
  ]);
}

/** Landing gear: two splayed legs per side plus a skid bar on each side. */
export function skids(span = 200, height = 90, material = MAT.carbon()) {
  const items = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) items.push({ mesh: cyl({ r: 3, h: height + 6, material }), pos: [sx * (span / 2 - 8), -height / 2, sz * 50], rot: [0, 0, sx * -6] });
    items.push({ mesh: cyl({ r: 4, h: 190, material }), pos: [sx * span / 2, -height, 0], rot: [90, 0, 0] });
  }
  return group(items);
}
