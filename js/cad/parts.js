// Parametric part helpers. All dimensions in millimetres; the viewer auto-fits scale.
// Each helper returns a THREE.Mesh. Group meshes into an assembly with `assembly()`.
import * as THREE from "three";

export const MAT = {
  aluminum: () => new THREE.MeshStandardMaterial({ color: 0xb9c0c8, metalness: 0.75, roughness: 0.35 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0x8a919a, metalness: 0.85, roughness: 0.3 }),
  pla: (color = 0xe0663a) => new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.6 }),
  carbon: () => new THREE.MeshStandardMaterial({ color: 0x24272c, metalness: 0.3, roughness: 0.45 }),
  balsa: () => new THREE.MeshStandardMaterial({ color: 0xd9bf8f, metalness: 0, roughness: 0.85 }),
  accent: () => new THREE.MeshStandardMaterial({ color: 0x2346a0, metalness: 0.2, roughness: 0.5 }),
};

const extrudeSettings = (depth, bevel = 0) => ({
  depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 48,
});

/** Spur gear. module m, tooth count z, face width w, bore diameter. Centered on origin, axis = Z. */
export function gear({ z = 20, m = 2, width = 6, bore = 5, material = MAT.pla() } = {}) {
  const rp = (m * z) / 2, ra = rp + m, rf = rp - 1.25 * m;
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / z;
  for (let i = 0; i < z; i++) {
    const a = i * step;
    const pts = [
      [rf, a - step * 0.30], [ra, a - step * 0.14], [ra, a + step * 0.14], [rf, a + step * 0.30],
    ];
    pts.forEach(([r, t], j) => {
      const x = r * Math.cos(t), y = r * Math.sin(t);
      i === 0 && j === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    });
    const nxt = a + step - step * 0.30;
    shape.absarc(0, 0, rf, a + step * 0.30, nxt, false);
  }
  if (bore > 0) shape.holes.push(circlePath(bore / 2));
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(width));
  geo.translate(0, 0, -width / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.userData.spec = { type: "gear", z, m, pitchDiameter: m * z };
  return mesh;
}

/** Hollow tube along Y. */
export function tube({ od = 20, id = 16, length = 100, material = MAT.aluminum() } = {}) {
  const shape = new THREE.Shape(); shape.absarc(0, 0, od / 2, 0, Math.PI * 2);
  if (id > 0) shape.holes.push(circlePath(id / 2));
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(length));
  geo.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geo, material);
}

/** Solid shaft along Z, centered. */
export function shaft({ d = 5, length = 40, material = MAT.steel() } = {}) {
  const geo = new THREE.CylinderGeometry(d / 2, d / 2, length, 32);
  geo.rotateX(Math.PI / 2);
  return new THREE.Mesh(geo, material);
}

/** Rectangular plate (XY footprint, thickness along Z) with optional through-holes [{x,y,d}]. */
export function plate({ w = 60, h = 40, t = 4, r = 3, holes = [], material = MAT.aluminum() } = {}) {
  const shape = roundedRect(w, h, r);
  holes.forEach(({ x, y, d }) => shape.holes.push(circlePath(d / 2, x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(t));
  geo.translate(0, 0, -t / 2);
  return new THREE.Mesh(geo, material);
}

/** Extrude any 2D profile: points [[x,y],...] in mm, depth along Z. */
export function extrudeProfile(points, depth, material = MAT.aluminum()) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(depth));
  geo.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geo, material);
}

/** Revolve a profile [[r,y],...] around Y (nose cones, bodies of revolution). */
export function revolve(points, material = MAT.aluminum(), segments = 64) {
  const geo = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  return new THREE.Mesh(geo, material);
}

export function box({ x = 10, y = 10, z = 10, material = MAT.aluminum() } = {}) {
  return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), material);
}

/**
 * Build an assembly. parts: [{ mesh, name, pos:[x,y,z], rot:[x,y,z] (deg), explode:[dx,dy,dz] }]
 * `explode` is the offset (mm) applied at full explode in the viewer.
 */
export function assembly(parts) {
  const g = new THREE.Group();
  for (const p of parts) {
    const m = p.mesh;
    m.name = p.name || m.name || "part";
    if (p.pos) m.position.set(...p.pos);
    if (p.rot) m.rotation.set(...p.rot.map(THREE.MathUtils.degToRad));
    m.userData.basePos = m.position.clone();
    m.userData.explode = new THREE.Vector3(...(p.explode || [0, 0, 0]));
    g.add(m);
  }
  return g;
}

/* ---- 2D helpers ---- */
export function circlePath(r, x = 0, y = 0) {
  const p = new THREE.Path(); p.absarc(x, y, r, 0, Math.PI * 2, true); return p;
}
export function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
