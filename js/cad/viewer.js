// Reusable CAD viewer. One WebGL context, reused across projects (browsers cap contexts).
// API: const v = createViewer(el); await v.show(modelKey); v.setMode("shaded"|"edges"|"xray");
//      v.setExplode(0..1); v.reset(); v.setAutoRotate(bool); v.dispose();
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { loadModel } from "../models/index.js";

export function createViewer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener("start", () => (controls.autoRotate = false));

  // Studio lighting: neutral environment reflections (what makes metals read as metal) + soft key light
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  renderer.toneMappingExposure = 1.0;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bec8, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); scene.add(key);

  let grid = null, root = null, mode = "edges", explode = 0, home = null, current = null, lastOut = null;
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x14171c, transparent: true, opacity: 0.7 });

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(container);

  function clear() {
    if (root) {
      scene.remove(root);
      root.traverse((o) => { o.geometry?.dispose(); if (o.material && o.material !== edgeMat) o.material.dispose?.(); });
    }
    if (grid) { scene.remove(grid); grid.geometry.dispose(); }
    root = grid = null;
  }

  function addEdges(obj) {
    obj.traverse((o) => {
      if (o.isMesh && !o.userData.edges) {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), edgeMat);
        e.raycast = () => {};
        o.add(e); o.userData.edges = e;
        o.userData.baseMat = o.material;
        o.material.userData.wasTransparent = o.material.transparent;
        o.material.userData.baseOpacity = o.material.opacity;
      }
    });
  }

  function frame() {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);                 // center model on origin
    root.position.y += size.y / 2;             // sit on the grid
    const r = size.length() / 2;
    const dist = r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.05;
    camera.near = r / 100; camera.far = r * 100; camera.updateProjectionMatrix();
    const target = new THREE.Vector3(0, size.y / 2, 0);
    camera.position.copy(target).add(new THREE.Vector3(1, 0.7, 1.2).normalize().multiplyScalar(dist));
    controls.target.copy(target);
    controls.minDistance = r * 0.3; controls.maxDistance = r * 8;
    home = { pos: camera.position.clone(), target: target.clone() };

    const step = Math.pow(10, Math.floor(Math.log10(r / 2)));
    const span = Math.ceil((r * 4) / step) * step;
    grid = new THREE.GridHelper(span, span / step, 0x9aa3b0, 0xc9ced6);
    grid.material.transparent = true; grid.material.opacity = 0.5;
    scene.add(grid);
  }

  function applyMode() {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh) return;
      const base = o.userData.baseMat;
      o.userData.edges.visible = mode !== "shaded";
      if (mode === "xray") {
        o.userData.xray ??= Object.assign(base.clone(), { transparent: true, opacity: 0.12, depthWrite: false });
        o.material = o.userData.xray;
      } else o.material = base;
    });
  }

  function applyExplode() {
    if (!root) return;
    root.traverse((o) => {
      if (o.userData.basePos && o.userData.explode)
        o.position.copy(o.userData.basePos).addScaledVector(o.userData.explode, explode);
    });
  }

  let raf = 0, alive = true;
  (function loop() {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  })();
  resize();

  return {
    async show(modelKey) {
      if (current === modelKey && root) return lastOut;
      clear();
      explode = 0;
      const out = (lastOut = await loadModel(modelKey));
      root = new THREE.Group(); root.add(out.group);
      addEdges(root); scene.add(root);
      frame(); applyMode(); applyExplode();
      controls.autoRotate = true;
      current = modelKey;
      return out;
    },
    hasExplode() {
      let any = false;
      root?.traverse((o) => { if (o.userData.explode?.lengthSq() > 0) any = true; });
      return any;
    },
    partNames() {
      const g = root?.children[0];
      return g ? g.children.filter((c) => c.userData.basePos).map((c) => c.name) : [];
    },
    highlight(name) {
      const g = root?.children[0]; if (!g) return;
      g.children.forEach((c) => c.traverse((o) => {
        if (!o.isMesh) return;
        const on = name && c.name === name, dim = name && !on;
        const mat = o.material;
        if (mat.emissive) mat.emissive.setHex(on ? 0x2346a0 : 0x000000);
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = on ? 0.6 : 0;
        if (mode !== "xray") { mat.transparent = dim || mat.userData?.wasTransparent || false; mat.opacity = dim ? 0.18 : (mat.userData?.baseOpacity ?? 1); }
      }));
    },
    setMode(m) { mode = m; applyMode(); },
    setExplode(t) { explode = t; applyExplode(); },
    setAutoRotate(on) { controls.autoRotate = on; },
    get autoRotate() { return controls.autoRotate; },
    reset() {
      if (!home) return;
      camera.position.copy(home.pos); controls.target.copy(home.target); controls.update();
    },
    dispose() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); clear(); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
