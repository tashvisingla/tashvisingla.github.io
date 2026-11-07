// Two-stage compound spur reduction (12:36 → 12:36 = 9:1) between printed side plates,
// with an output moment arm for efficiency testing (torque = hanging load × arm length).
import { assembly, group, gear, shaft, plate, box, cyl, MAT } from "../cad/parts.js";

const m = 1.5, W = 6;
const cd = (z1, z2) => (m * (z1 + z2)) / 2; // center distance = 36 mm
const x1 = -cd(12, 36), x2 = 0, x3 = cd(12, 36); // input, idler-compound, output shafts
const PLATE_Z = 22;                             // side plates at ±22 along shaft axis (Z)

export default function build() {
  const holes = [x1, x2, x3].map((x) => ({ x, y: 0, d: 5.2 }));
  const sidePlate = () => plate({ w: 130, h: 70, t: 4, r: 6, holes, material: MAT.pla(0xeae4d6) });
  const parts = [
    { name: "Side plate (rear)", mesh: sidePlate(), pos: [0, 0, -PLATE_Z], explode: [0, 0, -45] },
    { name: "Side plate (front)", mesh: sidePlate(), pos: [0, 0, PLATE_Z], explode: [0, 0, 60] },
    { name: "Input shaft", mesh: shaft({ d: 5, length: 70 }), pos: [x1, 0, 8], explode: [0, 0, 0] },
    { name: "Compound shaft", mesh: shaft({ d: 5, length: 52 }), pos: [x2, 0, 0], explode: [0, 0, 0] },
    { name: "Output shaft", mesh: shaft({ d: 5, length: 74 }), pos: [x3, 0, 10], explode: [0, 0, 0] },
    { name: "Stage 1 pinion (z=12)", mesh: gear({ z: 12, m, width: W, material: MAT.accent() }), pos: [x1, 0, -8], explode: [0, 0, 22] },
    { name: "Stage 1 gear (z=36)", mesh: gear({ z: 36, m, width: W, material: MAT.pla(0xe0663a) }), pos: [x2, 0, -8], rot: [0, 0, 5], explode: [0, 0, 22] },
    { name: "Stage 2 pinion (z=12)", mesh: gear({ z: 12, m, width: W, material: MAT.accent() }), pos: [x2, 0, 8], explode: [0, 0, 34] },
    { name: "Stage 2 gear (z=36)", mesh: gear({ z: 36, m, width: W, material: MAT.pla(0xe0663a) }), pos: [x3, 0, 8], rot: [0, 0, 5], explode: [0, 0, 34] },
    {
      name: "Input crank / motor coupler",
      mesh: group([{ mesh: cyl({ r: 7, h: 10, material: MAT.aluminum() }), rot: [90, 0, 0] }]),
      pos: [x1, 0, 44], explode: [0, 0, 30],
    },
    {
      name: "Calibrated moment arm + hanger",
      mesh: group([
        { mesh: cyl({ r: 6, h: 8, material: MAT.aluminum() }), rot: [90, 0, 0] },
        { mesh: box({ x: 100, y: 6, z: 4, material: MAT.aluminum() }), pos: [50, 0, 0] },
        { mesh: box({ x: 1, y: 40, z: 1, material: MAT.steel() }), pos: [98, -22, 0] },
        { mesh: cyl({ r: 8, h: 14, material: MAT.steel() }), pos: [98, -48, 0] },
      ]),
      pos: [x3, 0, 50], explode: [0, 0, 40],
    },
    { name: "Base", mesh: box({ x: 160, y: 6, z: 70, material: MAT.pla(0x5b6475) }), pos: [0, -38, 0], explode: [0, -30, 0] },
  ];
  return { group: assembly(parts), notes: "Two-stage 9:1 reduction with output moment arm." };
}
