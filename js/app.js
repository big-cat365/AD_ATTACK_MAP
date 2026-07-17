/*
 * app.js — interaction layer + bootstrap. Owns transient UI state (active
 * view, severity filter, search) and wires DOM events to AD.views / AD.modal.
 * Loaded last, after the DOM and all other modules.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";

  var TOTAL = 0;

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
  var activeSev = new Set();

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

    // per-phase + per-group counts, spine sync, empty-phase hiding
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
      // sync spine node for this phase
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

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---- event wiring ---- */
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
    document.querySelectorAll("#clearFilters, #clearFilters2").forEach(function (b) {
      b.addEventListener("click", clearFilters);
    });

    // open the detail modal from a card's diagram / expand button; close controls
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { AD.modal.close(); return; }
      if (e.target.closest("#clearFilters, #clearFilters2")) return;
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
    TOTAL = AD.ATTACKS.length;
    setView("purple");
    AD.views.render();
    wire();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window.AD);
