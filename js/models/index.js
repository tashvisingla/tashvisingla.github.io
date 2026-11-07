// CAD model registry. One entry per project `model` key in js/data.js.
//
// To add a real model for a project:
//   1. Create js/models/<project-id>.js exporting `default function build()` that returns
//      { group: THREE.Group, notes?: string, parts?: [{name, note}] }  (use helpers in js/cad/parts.js)
//   2. Add it below:  "<project-id>": () => import("./<project-id>.js"),
// Imported meshes (STL/GLB exported from SolidWorks/Onshape) can be loaded the same way:
//   the build function can return a Promise and use STLLoader / GLTFLoader from three/addons.
//
// Projects without an entry show the placeholder below, labelled "CAD coming soon".

import { assembly, gear, shaft, plate, MAT } from "../cad/parts.js";

export const MODELS = {
  "model-rocket": () => import("./model-rocket.js"),
  "drone-platform": () => import("./drone-platform.js"),
  "gear-train": () => import("./gear-train.js"),
  "li-s-battery": () => import("./li-s-battery.js"),
  "ereg-gearbox": () => import("./ereg-gearbox.js"),
  "roboglove": () => import("./roboglove.js"),
  "fsae-suspension": () => import("./fsae-suspension.js"),
  "fsae-nosecone": () => import("./fsae-nosecone.js"),
  "quadcopter": () => import("./quadcopter.js"),
  "frc-robot": () => import("./frc-robot.js"),
  "camera-mount": () => import("./camera-mount.js"),
  "camera-mount-fixed": () => import("./camera-mount-fixed.js"),
};

export function placeholder() {
  // m=2, z=20 + z=10 → center distance = m(z1+z2)/2 = 30 mm
  const xa = -15, xb = 15;
  const holes = [{ x: xa, y: 0, d: 5 }, { x: xb, y: 0, d: 5 }];
  const group = assembly([
    { name: "Base plate", mesh: plate({ w: 90, h: 50, t: 4, holes }), pos: [0, 0, 0], explode: [0, 0, -18] },
    { name: "Shaft A", mesh: shaft({ d: 5, length: 30 }), pos: [xa, 0, 14], explode: [0, 0, 8] },
    { name: "Shaft B", mesh: shaft({ d: 5, length: 30 }), pos: [xb, 0, 14], explode: [0, 0, 8] },
    { name: "Gear A (z=20)", mesh: gear({ z: 20, m: 2, width: 6, material: MAT.pla(0xe0663a) }), pos: [xa, 0, 20], explode: [0, 0, 26] },
    { name: "Gear B (z=10)", mesh: gear({ z: 10, m: 2, width: 6, material: MAT.accent() }), pos: [xb, 0, 20], rot: [0, 0, 18], explode: [0, 0, 26] },
  ]);
  group.rotation.x = -Math.PI / 2; // parts are Z-up; scene is Y-up
  return { group, placeholder: true, notes: "Placeholder assembly. Project CAD coming soon." };
}

export async function loadModel(key) {
  const loader = MODELS[key];
  if (!loader) return placeholder();
  const mod = await loader();
  const out = await mod.default();
  return out.group ? out : { group: out };
}
