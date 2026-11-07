// eReg valve actuator: motor → two-stage spur reduction in a split housing → coupler → ball valve.
// Gearbox axes are along Z; valve stem points up into the coupler.
import { assembly, group, gear, shaft, box, cyl, sphere, tube, MAT } from "../cad/parts.js";

const m = 1;

export default function build() {
  const cd1 = (m * (12 + 48)) / 2, cd2 = (m * (14 + 42)) / 2; // 30, 28
  const xa = -30, xb = xa + cd1, xc = xb + cd2;              // motor, intermediate, output axes
  const housingMat = () => Object.assign(MAT.aluminum(), { transparent: true, opacity: 0.35 });
  const parts = [
    {
      name: "Drive motor",
      mesh: group([
        { mesh: cyl({ r: 14, h: 50, material: MAT.carbon() }), rot: [90, 0, 0] },
        { mesh: cyl({ r: 15, h: 6, material: MAT.aluminum() }), pos: [0, 0, 22], rot: [90, 0, 0] },
      ]),
      pos: [xa, 0, -40], explode: [0, 0, -60],
    },
    { name: "Housing (rear half)", mesh: box({ x: 110, y: 74, z: 4, material: housingMat() }), pos: [8, 0, -13], explode: [0, 0, -30] },
    { name: "Housing (front half)", mesh: box({ x: 110, y: 74, z: 4, material: housingMat() }), pos: [8, 0, 17], explode: [0, 0, 50] },
    { name: "Motor pinion (z=12)", mesh: gear({ z: 12, m, width: 5, bore: 2, material: MAT.steel() }), pos: [xa, 0, -6], explode: [0, 0, 12] },
    { name: "Stage 1 gear (z=48)", mesh: gear({ z: 48, m, width: 5, bore: 3, material: MAT.pla(0xe0663a) }), pos: [xb, 0, -6], explode: [0, 0, 12] },
    { name: "Stage 2 pinion (z=14)", mesh: gear({ z: 14, m, width: 5, bore: 3, material: MAT.steel() }), pos: [xb, 0, 4], explode: [0, 0, 26] },
    { name: "Output gear (z=42)", mesh: gear({ z: 42, m, width: 5, bore: 4, material: MAT.accent() }), pos: [xc, 0, 4], explode: [0, 0, 26] },
    { name: "Intermediate shaft", mesh: shaft({ d: 3, length: 34 }), pos: [xb, 0, 2], explode: [0, 0, 0] },
    {
      name: "Output shaft + 90° bevel to stem",
      mesh: group([
        { mesh: shaft({ d: 4, length: 46 }), pos: [0, 0, 12] },
        { mesh: cyl({ r: 7, r2: 4, h: 6, material: MAT.steel() }), pos: [0, -4, 32], rot: [0, 0, 0] },
      ]),
      pos: [xc, 0, 0], explode: [0, 0, 0],
    },
    {
      name: "Stem coupler",
      mesh: cyl({ r: 7, h: 22, material: MAT.aluminum() }),
      pos: [xc, -18, 32], explode: [0, -20, 30],
    },
    {
      name: "Ball valve body (LOX feed line)",
      mesh: group([
        { mesh: sphere({ r: 16, material: MAT.steel() }) },
        { mesh: tube({ od: 16, id: 11, length: 90, material: MAT.steel() }), pos: [45, 0, 0], rot: [0, 0, 90] },
        { mesh: cyl({ r: 11, h: 8, seg: 6, material: MAT.steel() }), pos: [-38, 0, 0], rot: [0, 0, 90] },
        { mesh: cyl({ r: 11, h: 8, seg: 6, material: MAT.steel() }), pos: [38, 0, 0], rot: [0, 0, 90] },
        { mesh: cyl({ r: 4, h: 14, material: MAT.steel() }), pos: [0, 20, 0] },
      ]),
      pos: [xc, -56, 32], explode: [0, -60, 30],
    },
    {
      name: "Mounting bracket",
      mesh: group([
        { mesh: box({ x: 8, y: 80, z: 50, material: MAT.pla(0x5b6475) }), pos: [0, -30, 0] },
        { mesh: box({ x: 50, y: 6, z: 50, material: MAT.pla(0x5b6475) }), pos: [-20, -70, 0] },
      ]),
      pos: [-70, 0, 10], explode: [-50, 0, 0],
    },
  ];
  return { group: assembly(parts), notes: "Actuator layout: 4:1 × 3:1 = 12:1 reduction driving a quarter-turn valve." };
}
