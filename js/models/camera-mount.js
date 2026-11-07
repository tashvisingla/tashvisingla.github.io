// Camera mount for a 450-class quad: twin Ø10 mm carbon rails clamped under the frame,
// a vibration-isolated payload plate on four silicone dampers, and a 2-axis (roll + pitch)
// brushless gimbal carrying an action camera in a screw-clamped cage. Y-up, front = +Z.
import * as THREE from "three";
import { assembly, group, box, cyl, sphere, tube, MAT } from "../cad/parts.js";

const RAIL_X = 32;
const nylon = () => MAT.pla(0x2a2d32);
const anod = () => new THREE.MeshStandardMaterial({ color: 0x2d3138, metalness: 0.7, roughness: 0.35, envMapIntensity: 0.9 });
const silicone = () => new THREE.MeshStandardMaterial({ color: 0x9aa0a6, transparent: true, opacity: 0.85, roughness: 0.35 });

function screw(len = 8) {
  return group([
    { mesh: cyl({ r: 2.6, h: 1.8, material: MAT.steel() }), pos: [0, 0.9, 0] },
    { mesh: cyl({ r: 1.4, h: len, material: MAT.steel() }), pos: [0, -len / 2, 0] },
  ]);
}

function railClamp() {
  return group([
    { mesh: box({ x: 22, y: 6, z: 12, r: 1, material: nylon() }), pos: [0, 0, 0] },
    { mesh: box({ x: 22, y: 6, z: 12, r: 1, material: nylon() }), pos: [0, -13, 0] },
    { mesh: screw(10), pos: [-8, 3, 0] }, { mesh: screw(10), pos: [8, 3, 0] },
  ]);
}

function bldc(r = 13, h = 12) {
  return group([
    { mesh: cyl({ r, h: h * 0.7, material: anod() }) },
    { mesh: cyl({ r: r - 1.5, h: h * 0.3, material: MAT.aluminum() }), pos: [0, h * 0.5, 0] },
    ...[0, 1, 2, 3].map((i) => ({ mesh: cyl({ r: 0.9, h: 0.6, material: MAT.steel() }), pos: [Math.cos(i * 1.57 + 0.78) * r * 0.6, h * 0.66, Math.sin(i * 1.57 + 0.78) * r * 0.6] })),
  ]);
}

export function cameraMountParts() {
  const parts = [];
  // Rails + clamps (attach to the frame's bottom plate)
  parts.push({
    name: "Carbon rails Ø10 mm (×2)",
    mesh: group([-1, 1].map((s) => ({ mesh: tube({ od: 10, id: 8, length: 150, material: MAT.carbon() }), pos: [s * RAIL_X, 0, -75], rot: [90, 0, 0] }))),
    pos: [0, -9, 0], explode: [0, 0, 0],
  });
  [[-1, -40], [1, -40], [-1, 40], [1, 40]].forEach(([s, z], i) =>
    parts.push({ name: `Rail clamp ${i + 1}`, mesh: railClamp(), pos: [s * RAIL_X, 0, z], explode: [s * 18, 22, 0] }));
  // Upper damper plate hangs from the rails
  parts.push({
    name: "Upper damper plate (rail side)",
    mesh: group([
      { mesh: box({ x: 84, y: 2, z: 64, r: 0.5, material: MAT.carbon() }) },
      ...[-1, 1].map((s) => ({ mesh: box({ x: 14, y: 8, z: 50, r: 1, material: nylon() }), pos: [s * RAIL_X, 5, 0] })),
    ]),
    pos: [0, -18, 30], explode: [0, -10, 0],
  });
  parts.push({
    name: "Silicone dampers (×4)",
    mesh: group([[-30, -22], [30, -22], [-30, 22], [30, 22]].map(([x, z]) => ({
      mesh: group([
        { mesh: sphere({ r: 5.5, material: silicone() }) },
        { mesh: cyl({ r: 3, h: 3, material: silicone() }), pos: [0, 5.5, 0] },
        { mesh: cyl({ r: 3, h: 3, material: silicone() }), pos: [0, -5.5, 0] },
      ]),
      pos: [x, 0, z],
    }))),
    pos: [0, -26, 30], explode: [0, -32, 0],
  });
  parts.push({ name: "Isolated payload plate", mesh: box({ x: 84, y: 2, z: 64, r: 0.5, material: MAT.carbon() }), pos: [0, -34, 30], explode: [0, -52, 0] });
  // Gimbal: roll motor under plate, L-arm, pitch motor on the side, camera cage
  parts.push({ name: "Roll motor (brushless)", mesh: group([{ mesh: bldc(13, 12), rot: [90, 0, 0] }]), pos: [0, -48, 14], explode: [0, -70, -20] });
  parts.push({
    name: "Roll arm (machined Al)",
    mesh: group([
      { mesh: box({ x: 10, y: 34, z: 6, r: 1, material: anod() }), pos: [0, -12, 0] },
      { mesh: box({ x: 46, y: 6, z: 6, r: 1, material: anod() }), pos: [20, -30, 0] },
      { mesh: box({ x: 6, y: 18, z: 26, r: 1, material: anod() }), pos: [42, -38, 12] },
    ]),
    pos: [0, -48, 22], explode: [0, -80, 0],
  });
  parts.push({ name: "Pitch motor (brushless)", mesh: group([{ mesh: bldc(11, 10), rot: [0, 0, 90] }]), pos: [36, -86, 34], explode: [30, -95, 0] });
  parts.push({
    name: "Camera cage",
    mesh: group([
      { mesh: box({ x: 48, y: 3, z: 26, r: 0.8, material: anod() }), pos: [0, 17, 0] },
      { mesh: box({ x: 48, y: 3, z: 26, r: 0.8, material: anod() }), pos: [0, -17, 0] },
      { mesh: box({ x: 3, y: 37, z: 26, r: 0.8, material: anod() }), pos: [25, 0, 0] },
      { mesh: box({ x: 3, y: 37, z: 8, r: 0.8, material: anod() }), pos: [-25, 0, -9] },
      { mesh: screw(5), pos: [16, 18.5, 0] }, { mesh: screw(5), pos: [-16, 18.5, 0] },
    ]),
    pos: [6, -86, 34], explode: [0, -110, 30],
  });
  parts.push({
    name: "Action camera",
    mesh: group([
      { mesh: box({ x: 44, y: 30, z: 22, r: 2.5, material: MAT.pla(0x2a2d32) }) },
      { mesh: cyl({ r: 8.5, h: 6, material: anod() }), pos: [-8, 2, 13], rot: [90, 0, 0] },
      { mesh: cyl({ r: 6, h: 1, material: new THREE.MeshStandardMaterial({ color: 0x0d1a2e, metalness: 1, roughness: 0.05 }) }), pos: [-8, 2, 16.2], rot: [90, 0, 0] },
      { mesh: box({ x: 10, y: 4, z: 1, r: 0.3, material: MAT.pla(0x9b2a22) }), pos: [12, 10, 11.2] },
    ]),
    pos: [6, -86, 34], explode: [0, -135, 60],
  });
  return parts;
}

export default function build() {
  return { group: assembly(cameraMountParts()), notes: "Rail-mounted, vibration-isolated 2-axis camera gimbal." };
}
