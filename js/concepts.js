/*
 * concepts.js — renderer + interaction for the concepts/glossary page.
 * Reads AD.CONCEPTS[lang] (data), AD.CONCEPTS_UI[lang], AD.CONCEPT_CATS, AD.FIGS.
 * Self-contained (classic script, file:// friendly). Reuses AD.esc from
 * util.js and the shared UI runtime (i18n, theme, debounce, prefetch, lazy
 * fill, overlay, bootstrap) from core.js.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc;
  var lang = "ja";
  var byId = {};        // id -> concept (current language)
  var UI, CATS = AD.CONCEPT_CATS;

  function catLabel(c) { return lang === "ja" ? c.ja : c.en; }

  function renderNav() {
    var data = AD.CONCEPTS[lang] || [];
    document.getElementById("catnav").innerHTML = CATS.map(function (c) {
      var items = data.filter(function (t) { return t.cat === c.id; });
      if (!items.length) return "";
      var sub = items.map(function (t) {
        var en = (t.en && t.en !== t.term) ? '<span class="cat-sub-en">' + esc(t.en) + "</span>" : "";
        return '<button class="cat-sub" data-goto="' + esc(t.id) + '"><span class="cat-sub-term">' + esc(t.term) + "</span>" + en + "</button>";
      }).join("");
      return '<div class="cat-group">' +
        '<button class="cat-node" aria-expanded="false" aria-controls="sub-' + esc(c.id) + '">' +
          '<span class="cat-chevron" aria-hidden="true">›</span>' +
          '<span class="cat-name">' + esc(catLabel(c)) + "</span>" +
          '<span class="cat-count">' + items.length + "</span>" +
        "</button>" +
        '<div class="cat-sublist" id="sub-' + esc(c.id) + '" hidden>' + sub + "</div>" +
      "</div>";
    }).join("");
  }

  function figFor(id) {
    var svg = AD.FIGS && AD.FIGS[id];
    if (!svg) return "";
    return '<div class="c-fig" data-fig="' + id + '" data-figlazy="1" title="' + esc(UI.figHint) + '" tabindex="0" role="button" aria-label="' + esc(UI.figHint) + '"></div>';
  }

  /** Fill one figure placeholder with its SVG (once). Idempotent. */
  function fillFig(el) {
    if (!el || !el.hasAttribute("data-figlazy")) return;
    var svg = AD.FIGS && AD.FIGS[el.getAttribute("data-fig")];
    if (svg) el.innerHTML = svg;
    el.removeAttribute("data-figlazy");
  }

  /** AD.lazy handle for the current render's figures; torn down and
   *  recreated on each render() so re-renders never leak listeners. */
  var figLazyHandle = null;

  /** Delegates to the current lazy-fill handle (kept for the public API / regression harness). */
  function fillFigsNear(buffer) {
    if (figLazyHandle) figLazyHandle.fillNear(buffer);
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

  function render() {
    AD.applyI18n(UI, { title: UI.title + " — AD Attack Map" });
    renderNav();
    renderMain();
    if (figLazyHandle) figLazyHandle.destroy();
    figLazyHandle = AD.lazy({ selector: ".c-fig[data-figlazy]", fill: fillFig, buffer: 1000, initialBuffer: 900 });
    applyFilter();
  }

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

  /* ---- figure modal ---- */
  function openFig(id) {
    var svg = AD.FIGS && AD.FIGS[id];
    if (!svg) return;
    var t = byId[id];
    var html = (t ? '<p class="m-eyebrow">' + esc(t.en) + '</p><h2 id="m-title">' + esc(t.term) + "</h2>" : "") +
      '<div class="m-fig">' + svg + "</div>";
    AD.overlay.open(html);
  }

  function gotoCard(id) {
    var el = document.getElementById("c-" + id);
    AD.flashScrollTo(el);
  }

  function wire() {
    document.getElementById("q").addEventListener("input", AD.debounce(applyFilter, 90));
    document.getElementById("themeBtn").addEventListener("click", AD.theme.toggle);
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { AD.overlay.close(); return; }
      if (e.target.closest("#clearFilters2")) { document.getElementById("q").value = ""; applyFilter(); return; }
      var fig = e.target.closest("[data-fig]");
      if (fig) { openFig(fig.getAttribute("data-fig")); return; }
      var rel = e.target.closest("[data-goto]");
      if (rel) { gotoCard(rel.getAttribute("data-goto")); return; }
      var catBtn = e.target.closest(".cat-node");
      if (catBtn) {
        var ex = catBtn.getAttribute("aria-expanded") === "true";
        catBtn.setAttribute("aria-expanded", ex ? "false" : "true");
        var sl = document.getElementById(catBtn.getAttribute("aria-controls"));
        if (sl) sl.hidden = ex;
        return;
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && AD.overlay.isOpen()) AD.overlay.close();
      var fig = e.target.closest && e.target.closest("[data-fig]");
      if (fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openFig(fig.getAttribute("data-fig")); }
    });
  }

  function init() {
    wire();
    setLang("ja");
    AD.prefetchWhenIdle(["index.html", "js/data/attacks.js", "js/data/scenarios.js",
      "js/data/phases.js", "js/data/ui.js", "js/diagram.js", "js/views.js",
      "js/modal.js", "js/app.js", "js/components.js"]);
  }

  AD.concepts = { render: render, gotoCard: gotoCard, fillFigsNear: fillFigsNear };

  AD.onReady(init);
})(window.AD);
