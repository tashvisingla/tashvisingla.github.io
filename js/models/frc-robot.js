// FRC robot: 6-wheel drop-center tank drivetrain, bumpers, two-stage elevator, roller intake.
import { assembly, group, box, cyl, tube, MAT } from "../cad/parts.js";

const W = 680, L = 760; // frame perimeter (mm), front = +Z

export default function build() {
  const rail = (x) => ({ mesh: box({ x: 25, y: 50, z: L, material: MAT.aluminum() }), pos: [x, 0, 0] });
  const cross = (z) => ({ mesh: box({ x: W, y: 50, z: 25, material: MAT.aluminum() }), pos: [0, 0, z] });
  const wheel = () => group([
    { mesh: cyl({ r: 76, h: 38, material: MAT.carbon() }), rot: [0, 0, 90] },
    { mesh: cyl({ r: 50, h: 40, material: MAT.aluminum() }), rot: [0, 0, 90] },
  ]);
  const parts = [
    { name: "Drivetrain frame (2×1 tube)", mesh: group([rail(-W / 2), rail(W / 2), cross(-L / 2), cross(L / 2), cross(0)]), pos: [0, 90, 0], explode: [0, 0, 0] },
  ];
  [-1, 1].forEach((s) => {
    [-260, 0, 260].forEach((z, j) => {
      parts.push({ name: `Wheel ${s < 0 ? "L" : "R"}${j + 1}`, mesh: wheel(), pos: [s * (W / 2 - 50), 76 + (j === 1 ? -4 : 0), z], explode: [s * 90, 0, 0] });
    });
    parts.push({
      name: `Gearbox + motors (${s < 0 ? "left" : "right"})`,
      mesh: group([
        { mesh: box({ x: 60, y: 110, z: 90, material: MAT.pla(0x5b6475) }) },
        { mesh: cyl({ r: 30, h: 90, material: MAT.carbon() }), pos: [-s * 75, 20, -20], rot: [0, 0, 90] },
        { mesh: cyl({ r: 30, h: 90, material: MAT.carbon() }), pos: [-s * 75, 20, 40], rot: [0, 0, 90] },
      ]),
      pos: [s * (W / 2 - 140), 140, 0], explode: [s * 40, 80, 0],
    });
  });
  parts.push({ name: "Bellypan", mesh: box({ x: W, y: 4, z: L, material: MAT.pla(0x2b2f36) }), pos: [0, 63, 0], explode: [0, -60, 0] });
  parts.push({
    name: "Bumpers",
    mesh: group([
      { mesh: box({ x: W + 200, y: 130, z: 80, material: MAT.pla(0xb3261e) }), pos: [0, 0, L / 2 + 40] },
      { mesh: box({ x: W + 200, y: 130, z: 80, material: MAT.pla(0xb3261e) }), pos: [0, 0, -L / 2 - 40] },
      { mesh: box({ x: 80, y: 130, z: L, material: MAT.pla(0xb3261e) }), pos: [W / 2 + 60, 0, 0] },
      { mesh: box({ x: 80, y: 130, z: L, material: MAT.pla(0xb3261e) }), pos: [-W / 2 - 60, 0, 0] },
    ]),
    pos: [0, 110, 0], explode: [0, 0, 0],
  });
  // elevator: outer fixed stage, inner moving stage, carriage
  const upright = (x, h, m) => ({ mesh: box({ x: 25, y: h, z: 50, material: m }), pos: [x, h / 2, 0] });
  parts.push({ name: "Elevator stage 1 (fixed)", mesh: group([upright(-180, 900, MAT.aluminum()), upright(180, 900, MAT.aluminum()), { mesh: box({ x: 385, y: 25, z: 50, material: MAT.aluminum() }), pos: [0, 890, 0] }]), pos: [0, 115, -180], explode: [0, 0, -120] });
  parts.push({ name: "Elevator stage 2", mesh: group([upright(-150, 800, MAT.pla(0x2346a0)), upright(150, 800, MAT.pla(0x2346a0)), { mesh: box({ x: 325, y: 25, z: 40, material: MAT.pla(0x2346a0) }), pos: [0, 790, 0] }]), pos: [0, 420, -150], explode: [0, 220, -120] });
  parts.push({
    name: "Carriage + roller intake",
    mesh: group([
      { mesh: box({ x: 300, y: 160, z: 12, material: MAT.pla(0xe0663a) }), pos: [0, 0, 20] },
      { mesh: box({ x: 12, y: 120, z: 260, material: MAT.pla(0xe0663a) }), pos: [-150, -10, 150] },
      { mesh: box({ x: 12, y: 120, z: 260, material: MAT.pla(0xe0663a) }), pos: [150, -10, 150] },
      { mesh: tube({ od: 50, id: 44, length: 300, material: MAT.pla(0x1f6b3a) }), pos: [150, 30, 260], rot: [0, 0, 90] },
      { mesh: tube({ od: 50, id: 44, length: 300, material: MAT.pla(0x1f6b3a) }), pos: [150, -40, 230], rot: [0, 0, 90] },
    ]),
    pos: [0, 900, -130], explode: [0, 300, 120],
  });
  parts.push({ name: "Battery + electronics board", mesh: box({ x: 400, y: 10, z: 280, material: MAT.pla(0xf3efe6) }), pos: [0, 120, 200], explode: [0, 160, 100] });
  return { group: assembly(parts), notes: "Typical FRC layout, not the team's actual robot." };
}
