import { person, experience, projects, skills, coursework } from "./data.js?v=6";
import { icon } from "./icons.js?v=6";

const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

/* ---------- Static sections ---------- */
$("#hero-tag").textContent = person.tagline;
$("#year").textContent = new Date().getFullYear();

$("#titleblock").innerHTML = `
  <div class="tb__row tb__head"><span>Title</span><strong>${esc(person.first)} ${esc(person.last)}</strong></div>
  <div class="tb__grid">
    <div><span>School</span>${esc(person.school)}</div>
    <div><span>Grad</span>${esc(person.grad)}</div>
    <div><span>Major</span>Mechanical Eng.</div>
    <div><span>Minor</span>Aerospace Eng.</div>
    <div><span>GPA</span>${esc(person.gpa)}</div>
    <div><span>Based</span>${person.locations.map(esc).join(" / ")}</div>
  </div>
  <div class="tb__row tb__foot"><span>Projects</span><strong>${projects.length}</strong>
    <a class="tb__resume" href="${esc(person.resume)}" target="_blank" rel="noopener">Resume <b>PDF ↗</b></a></div>`;

$("#about-text").textContent =
  "I'm a mechanical engineering student at Columbia with a minor in aerospace. Most of my time goes into building things that fly, move, or carry load: a gearbox for a liquid-oxygen hybrid rocket's feed valve, a tendon-driven hand exoskeleton for space suits, suspension and carbon fiber parts for Formula SAE, and quadcopters. This past summer at Zeta Energy I designed a lithium-sulfur battery pack that doubled energy density at the same weight.";

$("#about-edu").innerHTML = `
  <p class="eyebrow">Education</p>
  <h4>${esc(person.school)}</h4>
  <p>${esc(person.degree)} · Minor in ${esc(person.minor)}</p>
  <p class="mono">${esc(person.grad)} · GPA ${esc(person.gpa)}</p>`;

$("#timeline").innerHTML = experience.map((e) => `
  <li class="tl">
    <div class="tl__meta mono"><span>${esc(e.period)}</span><span>${esc(e.place)}</span></div>
    <div class="tl__body">
      <h3>${esc(e.org)}</h3>
      <p class="tl__role">${esc(e.role)}</p>
      <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${e.projects.length ? `<div class="chips">${e.projects.map((id) =>
        `<a class="chip" href="#project-${id}">◇ ${esc(byId[id].title)}</a>`).join("")}</div>` : ""}
    </div>
  </li>`).join("");

$("#skills-list").innerHTML =
  Object.entries(skills).map(([k, v]) => `
    <div class="skillgroup"><p class="eyebrow">${esc(k)}</p>
      <div class="tags">${v.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div></div>`).join("") +
  `<div class="skillgroup"><p class="eyebrow">Coursework (in progress)</p>
     <div class="tags">${coursework.map((s) => `<span class="tag tag--ghost">${esc(s)}</span>`).join("")}</div></div>`;

$("#contact-links").innerHTML = person.links.map((l) => `
  <a class="contact__link" href="${esc(l.href)}"${/^http|\.pdf$/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}><span class="eyebrow">${esc(l.label)}</span>${esc(l.text)}</a>`).join("");

/* ---------- Projects grid + filters ---------- */
const kinds = ["All", ...new Set(projects.map((p) => p.kind))];
let filter = "All";
function renderGrid() {
  $("#filters").innerHTML = kinds.map((k) =>
    `<button role="tab" aria-selected="${k === filter}" class="${k === filter ? "on" : ""}" data-k="${k}">${k}</button>`).join("");
  $("#project-grid").innerHTML = projects
    .filter((p) => filter === "All" || p.kind === filter)
    .map((p, i) => `
      <a class="card${p.featured && filter === "All" ? " card--featured" : ""}" href="#project-${p.id}">
        <div class="card__art${p.thumb ? " card__art--img" : ""}">${p.thumb ? `<img src="${esc(p.thumb)}" alt="${esc(p.title)} CAD" loading="lazy" />` : icon(p.icon)}<span class="card__no mono">${String(projects.indexOf(p) + 1).padStart(2, "0")}</span></div>
        <div class="card__body">
          <p class="eyebrow">${esc(p.kind)}</p>
          <h3>${esc(p.title)}</h3>
          <p class="card__sub">${esc(p.subtitle)}</p>${p.featured && filter === "All" ? `<p class="card__sum">${esc(p.summary)}</p>` : ""}
          <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          <span class="card__open mono">View project →</span>
        </div>
      </a>`).join("");
}
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  filter = b.dataset.k; renderGrid();
});
renderGrid();

/* ---------- Project page + 3D viewer (hash routed: #project-<id>) ---------- */
const detail = $("#detail");
let viewer = null, viewerLoading = null, lastScroll = 0, currentMode = "edges", loadToken = 0;

async function getViewer() {
  if (viewer) return viewer;
  viewerLoading ??= import("./cad/viewer.js?v=6").then(({ createViewer }) => (viewer = createViewer($("#viewer-canvas"))));
  return viewerLoading;
}

const list = (items) => `<ul class="dots">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const fig = (im) => `<figure><img src="${esc(im.src)}" alt="${esc(im.caption || "")}" loading="lazy" data-zoom />${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ""}</figure>`;

function withApogee(p) {
  const a = p.apogee; if (!a || (!a.predicted && !a.actual)) return p;
  const res = [...(p.results || [])], specs = [...p.specs];
  if (a.predicted) specs.push(["Predicted apogee (OpenRocket)", a.predicted]);
  if (a.actual) specs.push(["Actual apogee", a.actual]);
  if (a.predicted && a.actual) res.unshift(`Apogee: ${a.actual} actual vs. ${a.predicted} predicted.`);
  return { ...p, results: res, specs };
}

function renderPage(p) {
  p = withApogee(p);
  const i = projects.indexOf(p);
  $("#d-count").textContent = `${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  $("#d-kind").textContent = p.kind;
  $("#d-title").textContent = p.title;
  $("#d-sub").textContent = p.subtitle;
  $("#d-meta").innerHTML = [["Organization", p.org], ["Role", p.role], ["Dates", p.dates]]
    .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#d-summary").textContent = p.summary;
  $("#d-tags").innerHTML = p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  $("#d-tar").innerHTML = [["Tasks", p.tasks], ["Actions", p.actions], ["Results", p.results]]
    .filter(([, v]) => v?.length).map(([h, v]) => `<div class="tar__col${h === "Results" ? " tar__col--res" : ""}"><h2 class="page__h">${h}</h2>${list(v)}</div>`).join("");
  $("#d-media").innerHTML = (p.media || []).map((m) => m.type === "video"
    ? `<h2 class="page__h">${esc(m.caption || "Video")}</h2><div class="media"><video src="${esc(m.src)}" poster="${esc(m.poster || "")}" controls muted loop playsinline preload="metadata"></video></div>`
    : `<div class="media">${fig(m)}</div>`).join("");
  $("#d-process").innerHTML = p.process?.length
    ? `<h2 class="page__h">Design process</h2>` + p.process.map((st) => `
      <div class="step">
        <div class="step__text"><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></div>
        ${st.images?.length ? `<div class="step__imgs n${Math.min(st.images.length, 4)}">${st.images.map(fig).join("")}</div>` : ""}
      </div>`).join("")
    : "";
  $("#d-specs").innerHTML = p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  $("#d-prev").href = `#project-${projects[(i - 1 + projects.length) % projects.length].id}`;
  $("#d-next").href = `#project-${projects[(i + 1) % projects.length].id}`;
  const views = viewsOf(p);
  $("#view-seg").hidden = views.length < 2;
  $("#view-seg").innerHTML = views.map((v, k) => `<button data-k="${k}" class="${k ? "" : "on"}">${esc(v.label)}</button>`).join("");
}

const viewsOf = (p) => p.views || (p.model ? [{ label: "3D model", model: p.model }] : p.photo ? [{ label: "Photo", photo: p.photo }] : p.drawing ? [{ label: "Drawing", drawing: p.drawing }] : []);
let curViews = [];
function showView(v) {
  const box = $(".viewer");
  stopAnim();
  if (v?.drawing || v?.photo) {
    box.classList.add("is-drawing"); ++loadToken;
    box.classList.toggle("is-photo", !!v.photo);
    $("#drawing img").src = v.drawing || v.photo;
    $("#drawing img").alt = v.photo ? "Robot photo" : "Concept drawing";
    $("#d-parts-wrap").hidden = true;
    $("#d-note").textContent = v.photo ? "" : "◇ Concept illustration. Project CAD coming soon.";
    viewer?.setAutoRotate(false);
  } else if (v?.model) {
    box.classList.remove("is-drawing", "is-photo");
    showModel(v.model);
  }
}

async function showModel(key) {
  const token = ++loadToken;
  const status = $("#viewer-status");
  status.textContent = "Loading model…"; status.hidden = false;
  $("#d-note").textContent = ""; $("#d-parts-wrap").hidden = true;
  try {
    const v = await getViewer();
    const out = await v.show(key);
    if (token !== loadToken) return;
    status.hidden = true;
    $("#d-note").textContent = out.placeholder
      ? "◇ Placeholder geometry. Project CAD coming soon."
      : "◇ Interactive 3D model built for this site. " + (out.notes || "");
    const names = v.partNames();
    $("#d-parts").innerHTML = names.map((n) => `<li data-part="${esc(n)}">${esc(n)}</li>`).join("");
    $("#d-parts-wrap").hidden = !names.length;
    $("#explode").value = 0;
    $("#explode-wrap").hidden = !v.hasExplode();
    setMode(currentMode);
    $("#rotate-btn").classList.toggle("on", v.autoRotate);
  } catch (err) {
    console.error(err);
    status.textContent = "3D viewer couldn't load here. Project details are below.";
  }
}

function openProject(id) {
  const p = byId[id]; if (!p) return closeDetail();
  if (detail.hidden) lastScroll = scrollY;
  detail.hidden = false;
  document.body.classList.add("locked");
  detail.scrollTop = 0;
  stopAnim();
  renderPage(p);
  curViews = viewsOf(p);
  showView(curViews[0]);
}

function closeDetail() {
  if (detail.hidden) return;
  stopAnim();
  detail.querySelectorAll("video").forEach((v) => v.pause());
  detail.hidden = true;
  document.body.classList.remove("locked");
  scrollTo(0, lastScroll);
}

function setMode(m) {
  currentMode = m;
  document.querySelectorAll("#mode-seg button").forEach((b) => b.classList.toggle("on", b.dataset.mode === m));
  viewer?.setMode(m);
}

/* Assembly animation: explode out, hold, reassemble (loops until stopped). */
let anim = 0;
function stopAnim() { cancelAnimationFrame(anim); anim = 0; $("#anim-btn").classList.remove("on"); $("#anim-btn").textContent = "▶"; }
function playAnim() {
  if (!viewer) return;
  $("#anim-btn").classList.add("on"); $("#anim-btn").textContent = "❚❚";
  const t0 = performance.now(), P = 5200;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const tick = (now) => {
    const ph = ((now - t0) % P) / P;
    const e = ph < 0.35 ? ease(ph / 0.35) : ph < 0.55 ? 1 : ph < 0.9 ? 1 - ease((ph - 0.55) / 0.35) : 0;
    viewer.setExplode(e); $("#explode").value = e;
    anim = requestAnimationFrame(tick);
  };
  anim = requestAnimationFrame(tick);
}
$("#anim-btn").addEventListener("click", () => (anim ? stopAnim() : playAnim()));
$("#view-seg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  document.querySelectorAll("#view-seg button").forEach((x) => x.classList.toggle("on", x === b));
  showView(curViews[+b.dataset.k]);
});
$("#mode-seg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setMode(b.dataset.mode); });
$("#d-parts").addEventListener("mouseover", (e) => { const li = e.target.closest("li"); if (li) viewer?.highlight(li.dataset.part); });
$("#d-parts").addEventListener("mouseleave", () => viewer?.highlight(null));
$("#explode").addEventListener("input", (e) => { stopAnim(); viewer?.setExplode(+e.target.value); });
$("#reset-btn").addEventListener("click", () => viewer?.reset());
$("#rotate-btn").addEventListener("click", () => {
  if (!viewer) return;
  viewer.setAutoRotate(!viewer.autoRotate);
  $("#rotate-btn").classList.toggle("on", viewer.autoRotate);
});

/* Lightbox for process images */
const lb = $("#lightbox");
detail.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-zoom]");
  if (img) { lb.querySelector("img").src = img.src; lb.querySelector("p").textContent = img.alt; lb.hidden = false; return; }
  if (e.target.closest("[data-close]")) { e.preventDefault(); history.replaceState(null, "", "#projects"); route(); }
});
lb.addEventListener("click", () => (lb.hidden = true));
addEventListener("keydown", (e) => {
  if (!lb.hidden && e.key === "Escape") return void (lb.hidden = true);
  if (detail.hidden) return;
  if (e.key === "Escape") { history.replaceState(null, "", "#projects"); route(); }
});

function route() {
  const h = location.hash.slice(1);
  if (h.startsWith("project-")) openProject(h.slice(8));
  else {
    const wasOpen = !detail.hidden;
    closeDetail();
    if (h && !wasOpen) document.getElementById(h)?.scrollIntoView();
  }
}
addEventListener("hashchange", route);
route();
