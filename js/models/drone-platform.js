// Extended-endurance quad: 450-class X frame, 10" props, top-mounted pack, flight controller + GPS,
// 2-axis damped camera gimbal below the nose, skid landing gear.
import { assembly, group, box, cyl, extrudeProfile, MAT } from "../cad/parts.js";
import { armXY, arm, motorProp, cameraGimbal, skids } from "../cad/drone.js";

const R = 225; // half motor-to-motor diagonal (450 mm class)

export default function build() {
  const hub = () => extrudeProfile(
    [[-55, -70], [55, -70], [80, -40], [80, 40], [55, 70], [-55, 70], [-80, 40], [-80, -40]], 2.5, MAT.carbon());
  const flat = (m) => { m.rotation.x = Math.PI / 2; return m; };
  const parts = [
    { name: "Bottom plate (power distribution)", mesh: flat(hub()), pos: [0, 0, 0], explode: [0, -30, 0] },
    { name: "Top plate", mesh: flat(hub()), pos: [0, 30, 0], explode: [0, 40, 0] },
  ];
  for (let i = 0; i < 4; i++) {
    const [x, z] = armXY(i, R);
    parts.push({ name: `Arm ${i + 1}`, mesh: arm(i, 50, R + 12, { material: i < 2 ? MAT.pla(0xe0663a) : MAT.pla(0xf3efe6) }), pos: [0, 15, 0], explode: [x * 0.25, 0, z * 0.25] });
    parts.push({ name: `Motor + 10" prop ${i + 1}`, mesh: motorProp(254), pos: [x, 22, z], explode: [x * 0.35, 50, z * 0.35] });
  }
  parts.push({
    name: "Battery pack (top mount, strapped)",
    mesh: group([
      { mesh: box({ x: 140, y: 45, z: 70, material: MAT.pla(0x3a3f47) }) },
      { mesh: box({ x: 6, y: 47, z: 74, material: MAT.pla(0xc4552d) }), pos: [-40, 0, 0] },
      { mesh: box({ x: 6, y: 47, z: 74, material: MAT.pla(0xc4552d) }), pos: [40, 0, 0] },
    ]),
    pos: [0, 56, 0], explode: [0, 110, 0],
  });
  parts.push({ name: "Flight controller (Pixhawk)", mesh: box({ x: 40, y: 14, z: 80, material: MAT.pla(0xf2f2f2) }), pos: [0, 8, -10], explode: [0, 0, -160] });
  parts.push({
    name: "GPS mast",
    mesh: group([
      { mesh: cyl({ r: 2.5, h: 90, material: MAT.carbon() }), pos: [0, 45, 0] },
      { mesh: cyl({ r: 24, h: 8, material: MAT.pla(0xf2f2f2) }), pos: [0, 92, 0] },
    ]),
    pos: [0, 32, -45], explode: [0, 130, -40],
  });
  parts.push({ name: "Camera gimbal mount (2-axis, damped)", mesh: cameraGimbal(), pos: [0, -2, 55], explode: [0, -80, 60] });
  parts.push({ name: "Landing skids", mesh: skids(190, 110), pos: [0, -2, 0], explode: [0, -110, 0] });

  return { group: assembly(parts), notes: "Camera gimbal mounted under the nose for sensor payloads." };
}
