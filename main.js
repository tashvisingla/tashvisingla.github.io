import { person, experience, projects, skills, coursework } from "./data.js";
import { icon } from "./icons.js";

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
  <div class="tb__row tb__foot"><span>Projects</span><strong>${projects.length}</strong><span>Scale</span><strong>1:1</strong></div>`;

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
  <a class="contact__link" href="${esc(l.href)}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}><span class="eyebrow">${esc(l.label)}</span>${esc(l.text)}</a>`).join("");

/* ---------- Projects grid + filters ---------- */
const kinds = ["All", ...new Set(projects.map((p) => p.kind))];
let filter = "All";
function renderGrid() {
  $("#filters").innerHTML = kinds.map((k) =>
    `<button role="tab" aria-selected="${k === filter}" class="${k === filter ? "on" : ""}" data-k="${k}">${k}</button>`).join("");
  $("#project-grid").innerHTML = projects
    .filter((p) => filter === "All" || p.kind === filter)
    .map((p, i) => `
      <a class="card" href="#project-${p.id}">
        <div class="card__art">${icon(p.icon)}<span class="card__no mono">${String(projects.indexOf(p) + 1).padStart(2, "0")}</span></div>
        <div class="card__body">
          <p class="eyebrow">${esc(p.kind)}</p>
          <h3>${esc(p.title)}</h3>
          <p class="card__sub">${esc(p.subtitle)}</p>
          <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          <span class="card__open mono">Open 3D view →</span>
        </div>
      </a>`).join("");
}
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  filter = b.dataset.k; renderGrid();
});
renderGrid();

/* ---------- Detail view + 3D viewer (hash routed: #project-<id>) ---------- */
const detail = $("#detail");
let viewer = null, viewerLoading = null, lastScroll = 0;

async function getViewer() {
  if (viewer) return viewer;
  viewerLoading ??= import("./cad/viewer.js").then(({ createViewer }) => (viewer = createViewer($("#viewer-canvas"))));
  return viewerLoading;
}

async function openProject(id) {
  const p = byId[id]; if (!p) return closeDetail();
  if (detail.hidden) lastScroll = scrollY;
  detail.hidden = false;
  document.body.classList.add("locked");

  const i = projects.indexOf(p);
  $("#d-kind").textContent = p.kind;
  $("#d-title").textContent = p.title;
  $("#d-sub").textContent = p.subtitle;
  $("#d-summary").textContent = p.summary;
  $("#d-details").innerHTML = (p.details || []).map(([h, t]) => `<h4>${esc(h)}</h4><p>${esc(t)}</p>`).join("");
  $("#d-parts-wrap").hidden = true;
  $("#d-specs").innerHTML = p.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  $("#d-tags").innerHTML = p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  $("#d-prev").href = `#project-${projects[(i - 1 + projects.length) % projects.length].id}`;
  $("#d-next").href = `#project-${projects[(i + 1) % projects.length].id}`;
  $("#d-note").textContent = "";

  const status = $("#viewer-status");
  status.textContent = "Loading model…"; status.hidden = false;
  try {
    const v = await getViewer();
    const out = await v.show(p.model);
    if (byId[location.hash.replace("#project-", "")] !== p) return; // navigated away mid-load
    status.hidden = true;
    $("#d-note").textContent = out.placeholder
      ? "◇ Placeholder geometry. Project CAD coming soon."
      : "◇ Illustrative CAD built for this site. " + (out.notes || "");
    const names = v.partNames();
    $("#d-parts").innerHTML = names.map((n) => `<li data-part="${esc(n)}">${esc(n)}</li>`).join("");
    $("#d-parts-wrap").hidden = !names.length;
    $("#explode").value = 0;
    $("#explode-wrap").hidden = !v.hasExplode();
    setMode(currentMode);
  } catch (err) {
    console.error(err);
    status.textContent = "3D viewer couldn't load here. Project details are still below.";
  }
}

function closeDetail() {
  if (detail.hidden) return;
  detail.hidden = true;
  document.body.classList.remove("locked");
  scrollTo(0, lastScroll);
}

let currentMode = "shaded";
function setMode(m) {
  currentMode = m;
  document.querySelectorAll("#mode-seg button").forEach((b) => b.classList.toggle("on", b.dataset.mode === m));
  viewer?.setMode(m);
}
$("#mode-seg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setMode(b.dataset.mode); });
$("#d-parts").addEventListener("mouseover", (e) => { const li = e.target.closest("li"); if (li) viewer?.highlight(li.dataset.part); });
$("#d-parts").addEventListener("mouseleave", () => viewer?.highlight(null));
$("#explode").addEventListener("input", (e) => viewer?.setExplode(+e.target.value));
$("#reset-btn").addEventListener("click", () => viewer?.reset());
$("#rotate-btn").addEventListener("click", () => {
  if (!viewer) return;
  viewer.setAutoRotate(!viewer.autoRotate);
  $("#rotate-btn").classList.toggle("on", viewer.autoRotate);
});
detail.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) { e.preventDefault(); history.replaceState(null, "", "#projects"); route(); }
});
addEventListener("keydown", (e) => {
  if (detail.hidden) return;
  if (e.key === "Escape") { history.replaceState(null, "", "#projects"); route(); }
  if (e.key === "ArrowRight") location.hash = $("#d-next").getAttribute("href");
  if (e.key === "ArrowLeft") location.hash = $("#d-prev").getAttribute("href");
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
