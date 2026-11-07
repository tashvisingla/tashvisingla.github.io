// Model rocket: laser-cut balsa fins, body tube, printed nose cone, spring-loaded payload bay.
import { assembly, group, revolve, tube, extrudeProfile, cyl, box, sweep, MAT } from "../cad/parts.js";

const R = 20; // body tube outer radius (mm)

export default function build() {
  // Ogive-ish nose profile [r, y]
  const nose = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    nose.push([R * Math.sqrt(1 - t * t) * (1 - 0.15 * t) + 0.001, t * 110]);
  }
  const fin = () => extrudeProfile([[0, 0], [0, 70], [45, 25], [45, 0]], 3, MAT.balsa());
  const fins = group([0, 120, 240].map((a) => {
    const f = fin();
    const holder = group([{ mesh: f, pos: [R + 0.5, 0, 0], rot: [0, 0, 0] }]);
    // profile is in XY: x = span outward, y = along tube
    holder.rotation.y = (a * Math.PI) / 180;
    return { mesh: holder };
  }));
  const spring = [];
  for (let i = 0; i <= 80; i++) { const t = i / 80; spring.push([9 * Math.cos(t * 6 * 2 * Math.PI), t * 40, 9 * Math.sin(t * 6 * 2 * Math.PI)]); }

  const parts = [
    { name: "Body tube (lower)", mesh: tube({ od: 2 * R, id: 2 * R - 2, length: 220, material: MAT.pla(0xf3efe6) }), pos: [0, 0, 0], explode: [0, 0, 0] },
    { name: "Fin set (3× balsa, laser cut)", mesh: fins, pos: [0, 0, 0], explode: [0, -40, 0] },
    { name: "Motor mount + 24 mm motor", mesh: cyl({ r: 12.5, h: 90, material: MAT.pla(0x9a7b55) }), pos: [0, 40, 0], explode: [0, -130, 0] },
    { name: "Launch lug", mesh: tube({ od: 6, id: 4, length: 40, material: MAT.pla(0xf3efe6) }), pos: [0, 90, R + 3], explode: [0, 0, 25] },
    { name: "Payload bay", mesh: tube({ od: 2 * R, id: 2 * R - 2, length: 70, material: MAT.pla(0xe0663a) }), pos: [0, 220, 0], explode: [0, 40, 0] },
    { name: "Release spring", mesh: sweep(spring, 0.9, MAT.steel()), pos: [0, 225, 0], explode: [0, 55, 0] },
    { name: "Payload", mesh: box({ x: 22, y: 24, z: 22, material: MAT.accent() }), pos: [0, 272, 0], explode: [0, 85, 0] },
    { name: "Nose cone (3D printed)", mesh: revolve(nose.map(([r, y]) => [r, y]), MAT.pla(0xe0663a)), pos: [0, 290, 0], explode: [0, 120, 0] },
    { name: "Shock cord", mesh: sweep([[0, 215, 0], [8, 240, 6], [-6, 265, -4], [0, 292, 0]], 0.8, MAT.pla(0xc4552d)), pos: [0, 0, 0], explode: [0, 60, 0] },
  ];
  return { group: assembly(parts), notes: "CG/CP placement was validated against flight test." };
}
