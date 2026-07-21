/*
 * app.js — interaction layer + bootstrap. Owns transient UI state (language,
 * active view, severity filter, search) and wires DOM events to the modules.
 * Loaded last, after the DOM and all other modules.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";

  var TOTAL = 0;
  var lang = "ja";
  var activeSev = new Set();

  /* ---- language ---- */
  function applyUiStrings() {
    var u = AD.UI;
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = u[el.getAttribute("data-t")]; });
    document.querySelectorAll("[data-t-html]").forEach(function (el) { el.innerHTML = u[el.getAttribute("data-t-html")]; });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) { el.setAttribute("placeholder", u[el.getAttribute("data-t-ph")]); });
    document.querySelectorAll("[data-t-al]").forEach(function (el) { el.setAttribute("aria-label", u[el.getAttribute("data-t-al")]); });
    document.querySelectorAll("[data-t-ti]").forEach(function (el) { el.setAttribute("title", u[el.getAttribute("data-t-ti")]); });
  }

  function setLang(l) {
    if (!AD.I18N[l]) l = "ja";
    lang = l;
    var d = AD.I18N[l];
    AD.ATTACKS = d.attacks; AD.SCENARIOS = d.scenarios; AD.PHASES = d.phases; AD.GROUP_ORDER = d.groupOrder; AD.UI = d.ui;
    TOTAL = AD.ATTACKS.length;
    document.documentElement.lang = l;
    var lb = document.getElementById("langBtn");
    if (lb) lb.textContent = (l === "ja" ? "EN" : "日本語");
    applyUiStrings();
    AD.views.render();
    applyFilter();
  }

  /* ---- Red / Purple / Blue view ---- */
  function setView(v) {
    document.body.dataset.view = v;
    document.querySelectorAll(".segmented button").forEach(function (b) {
      var on = b.dataset.view === v;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---- search + severity filtering ---- */
  function applyFilter() {
    var q = document.getElementById("q").value.trim().toLowerCase();
    var filtering = q !== "" || activeSev.size > 0;
    var visible = 0;

    document.querySelectorAll(".card").forEach(function (c) {
      var okSev = activeSev.size === 0 || activeSev.has(c.dataset.sev);
      var okQ = !q || c.dataset.txt.indexOf(q) !== -1;
      var show = okSev && okQ;
      c.classList.toggle("hide", !show);
      if (show) visible++;
    });

    document.querySelectorAll(".phase-block").forEach(function (pb) {
      var pv = pb.querySelectorAll(".card:not(.hide)").length;
      pb.classList.toggle("hide", pv === 0);
      var cnt = pb.querySelector(".phase-head .cnt");
      if (cnt) cnt.textContent = pv + " techniques";
      pb.querySelectorAll(".group-label").forEach(function (gl) {
        var grid = gl.nextElementSibling;
        if (grid && grid.classList.contains("grid")) {
          var gv = grid.querySelectorAll(".card:not(.hide)").length;
          gl.style.display = gv ? "" : "none";
          var gc = gl.querySelector(".gcount");
          if (gc) gc.textContent = gv;
        }
      });
      var phase = pb.getAttribute("data-phase");
      var node = document.querySelector('.phase-node[data-phase="' + phase + '"]');
      if (node) {
        var pc = node.querySelector(".pcount");
        if (pc) pc.textContent = pv + " techniques";
        node.classList.toggle("disabled", pv === 0);
        node.setAttribute("aria-disabled", pv === 0 ? "true" : "false");
      }
    });

    var rc = document.getElementById("rescount");
    if (rc) rc.innerHTML = filtering ? "<b>" + visible + "</b> / " + TOTAL + " techniques" : "<b>" + TOTAL + "</b> techniques";
    document.getElementById("noresult").classList.toggle("show", visible === 0);
    document.querySelectorAll("#clearFilters").forEach(function (b) { b.hidden = !filtering; });
  }

  function clearFilters() {
    document.getElementById("q").value = "";
    activeSev.clear();
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    applyFilter();
  }

  /* ---- theme toggle ---- */
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var now = cur ? cur : (sysDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", now === "dark" ? "light" : "dark");
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* ---- phase spine accordion (kill-chain TOC) ---- */
  function togglePhase(pid) {
    var panel = document.getElementById("ptoc-" + pid);
    var wasOpen = panel && !panel.hidden;
    document.getElementById("spine-toc").hidden = true;
    document.querySelectorAll(".ptoc").forEach(function (p) { p.hidden = true; });
    document.querySelectorAll(".phase-node").forEach(function (n) { n.setAttribute("aria-expanded", "false"); });
    if (!wasOpen) {
      if (panel) panel.hidden = false;
      var node = document.querySelector('.phase-node[data-phase="' + pid + '"]');
      if (node) node.setAttribute("aria-expanded", "true");
      document.getElementById("spine-toc").hidden = false;
    }
  }

  function gotoTech(cid) {
    var el = document.getElementById(cid);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }

  /* ---- event wiring (bound once; survives re-render/lang-switch) ---- */
  function wire() {
    document.querySelectorAll(".segmented button").forEach(function (b) {
      b.addEventListener("click", function () { setView(b.dataset.view); });
    });
    document.getElementById("q").addEventListener("input", debounce(applyFilter, 90));
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var s = chip.dataset.sev;
        if (activeSev.has(s)) { activeSev.delete(s); chip.setAttribute("aria-pressed", "false"); }
        else { activeSev.add(s); chip.setAttribute("aria-pressed", "true"); }
        applyFilter();
      });
    });
    document.getElementById("themeBtn").addEventListener("click", toggleTheme);

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { AD.modal.close(); return; }
      if (e.target.closest("#clearFilters, #clearFilters2")) { clearFilters(); return; }
      var pn = e.target.closest(".phase-node");
      if (pn && pn.dataset.phase) { togglePhase(pn.dataset.phase); return; }
      var gt = e.target.closest("[data-goto]");
      if (gt) { gotoTech(gt.getAttribute("data-goto")); return; }
      var ex = e.target.closest("[data-expand]");
      if (ex) { AD.modal.open(ex.getAttribute("data-expand")); return; }
      var dg = e.target.closest(".diagram");
      if (dg && dg.getAttribute("data-scn")) AD.modal.open(dg.getAttribute("data-scn"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && AD.modal.isOpen()) AD.modal.close();
    });
  }

  function init() {
    wire();
    setLang("ja");
    setView("purple");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window.AD);
