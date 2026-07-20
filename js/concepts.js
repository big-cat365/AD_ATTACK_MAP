/*
 * concepts.js — renderer + interaction for the concepts/glossary page.
 * Reads AD.CONCEPTS[lang] (data), AD.CONCEPTS_UI[lang], AD.CONCEPT_CATS, AD.FIGS.
 * Self-contained (classic script, file:// friendly). Reuses AD.esc from util.js.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc;
  var lang = "ja";
  var byId = {};        // id -> concept (current language)
  var UI, CATS = AD.CONCEPT_CATS;

  function applyUiStrings() {
    document.querySelectorAll("[data-t]").forEach(function (el) { if (UI[el.getAttribute("data-t")] != null) el.textContent = UI[el.getAttribute("data-t")]; });
    document.querySelectorAll("[data-t-html]").forEach(function (el) { if (UI[el.getAttribute("data-t-html")] != null) el.innerHTML = UI[el.getAttribute("data-t-html")]; });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) { el.setAttribute("placeholder", UI[el.getAttribute("data-t-ph")]); });
    document.querySelectorAll("[data-t-al]").forEach(function (el) { el.setAttribute("aria-label", UI[el.getAttribute("data-t-al")]); });
    document.title = UI.title + " — AD Attack Map";
  }

  function catLabel(c) { return lang === "ja" ? c.ja : c.en; }

  function renderNav() {
    var counts = {};
    (AD.CONCEPTS[lang] || []).forEach(function (t) { counts[t.cat] = (counts[t.cat] || 0) + 1; });
    document.getElementById("catnav").innerHTML = CATS.map(function (c) {
      if (!counts[c.id]) return "";
      return '<a class="cat-node" href="#cat-' + c.id + '"><span class="cat-name">' + esc(catLabel(c)) +
        '</span><span class="cat-count">' + counts[c.id] + "</span></a>";
    }).join("");
  }

  function figFor(id) {
    var svg = AD.FIGS && AD.FIGS[id];
    if (!svg) return "";
    return '<div class="c-fig" data-fig="' + id + '" title="' + esc(UI.figHint) + '" tabindex="0" role="button" aria-label="' + esc(UI.figHint) + '">' + svg + "</div>";
  }

  function relatedChips(rel) {
    if (!rel || !rel.length) return "";
    var chips = rel.map(function (rid) {
      var t = byId[rid];
      if (!t) return "";
      return '<button class="rel-chip" data-goto="' + esc(rid) + '">' + esc(t.term) + "</button>";
    }).filter(Boolean).join("");
    if (!chips) return "";
    return '<div class="c-related"><span class="rl">' + esc(UI.related) + "</span>" + chips + "</div>";
  }

  function pointsList(pts) {
    if (!pts || !pts.length) return "";
    return '<div class="c-points"><span class="pl">' + esc(UI.keyPoints) + "</span><ul>" +
      pts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>";
  }

  function card(t) {
    var searchTxt = esc([t.term, t.en, t.aka, t.body].join(" ").toLowerCase());
    var aka = t.aka ? '<div class="c-aka">' + esc(t.aka) + "</div>" : "";
    var enSub = (t.en && t.en !== t.term) ? '<span class="c-en">' + esc(t.en) + "</span>" : "";
    return '<article class="c-card" id="c-' + esc(t.id) + '" data-txt="' + searchTxt + '">' +
      '<div class="c-head"><h3>' + esc(t.term) + "</h3>" + enSub + "</div>" +
      aka +
      figFor(t.id) +
      '<p class="c-body">' + esc(t.body) + "</p>" +
      pointsList(t.points) +
      relatedChips(t.related) +
      "</article>";
  }

  function renderMain() {
    var data = AD.CONCEPTS[lang] || [];
    byId = {}; data.forEach(function (t) { byId[t.id] = t; });
    var html = CATS.map(function (c) {
      var items = data.filter(function (t) { return t.cat === c.id; });
      if (!items.length) return "";
      return '<section class="c-section" id="cat-' + c.id + '">' +
        '<div class="c-sec-head"><h2>' + esc(catLabel(c)) + '</h2><span class="c-sec-count">' + items.length + " " + esc(UI.count) + "</span></div>" +
        '<div class="c-grid">' + items.map(card).join("") + "</div></section>";
    }).join("");
    document.getElementById("main").innerHTML = html;
  }

  function render() { applyUiStrings(); renderNav(); renderMain(); applyFilter(); }

  function setLang(l) {
    if (!AD.CONCEPTS || !AD.CONCEPTS[l]) l = "ja";
    lang = l;
    UI = AD.CONCEPTS_UI[l];
    document.documentElement.lang = l;
    var lb = document.getElementById("langBtn");
    if (lb) lb.textContent = (l === "ja" ? "EN" : "日本語");
    render();
  }

  /* ---- search ---- */
  function applyFilter() {
    var q = document.getElementById("q").value.trim().toLowerCase();
    var visible = 0;
    document.querySelectorAll(".c-card").forEach(function (c) {
      var show = !q || c.dataset.txt.indexOf(q) !== -1;
      c.classList.toggle("hide", !show);
      if (show) visible++;
    });
    document.querySelectorAll(".c-section").forEach(function (s) {
      s.classList.toggle("hide", s.querySelectorAll(".c-card:not(.hide)").length === 0);
    });
    var nr = document.getElementById("noresult");
    if (nr) nr.classList.toggle("show", visible === 0);
    var rc = document.getElementById("rescount");
    if (rc) rc.innerHTML = "<b>" + visible + "</b> " + esc(UI.count);
  }

  /* ---- theme ---- */
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var now = cur ? cur : (sysDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", now === "dark" ? "light" : "dark");
  }

  /* ---- figure modal ---- */
  var lastFocus = null;
  function openFig(id) {
    var svg = AD.FIGS && AD.FIGS[id];
    if (!svg) return;
    var t = byId[id];
    document.getElementById("modal-body").innerHTML =
      (t ? '<p class="m-eyebrow">' + esc(t.en) + '</p><h2 id="m-title">' + esc(t.term) + "</h2>" : "") +
      '<div class="m-fig">' + svg + "</div>";
    var m = document.getElementById("modal");
    m.hidden = false; document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    m.querySelector(".modal-x").focus();
  }
  function closeFig() {
    var m = document.getElementById("modal");
    m.hidden = true; document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function isOpen() { return !document.getElementById("modal").hidden; }

  function gotoCard(id) {
    var el = document.getElementById("c-" + id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  function wire() {
    document.getElementById("q").addEventListener("input", debounce(applyFilter, 90));
    document.getElementById("themeBtn").addEventListener("click", toggleTheme);
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { closeFig(); return; }
      if (e.target.closest("#clearFilters2")) { document.getElementById("q").value = ""; applyFilter(); return; }
      var fig = e.target.closest("[data-fig]");
      if (fig) { openFig(fig.getAttribute("data-fig")); return; }
      var rel = e.target.closest("[data-goto]");
      if (rel) { gotoCard(rel.getAttribute("data-goto")); return; }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) closeFig();
      var fig = e.target.closest && e.target.closest("[data-fig]");
      if (fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openFig(fig.getAttribute("data-fig")); }
    });
  }

  function init() { wire(); setLang("ja"); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window.AD);
