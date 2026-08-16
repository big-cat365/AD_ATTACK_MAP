/*
 * app.js — interaction layer + bootstrap. Owns transient UI state (active
 * view, severity filter, search) and wires DOM events to the modules.
 * Loaded last, after the DOM and all other modules. Shared UI plumbing
 * (theme toggle, debounce, prefetch, i18n, bootstrap) lives in core.js.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";

  var TOTAL = 0;
  var activeSev = new Set();

  /* ---- bootstrap ---- */
  function loadData() {
    var d = AD.I18N.ja;
    AD.ATTACKS = d.attacks; AD.SCENARIOS = d.scenarios; AD.PHASES = d.phases; AD.GROUP_ORDER = d.groupOrder; AD.UI = d.ui;
    TOTAL = AD.ATTACKS.length;
    AD.applyI18n(AD.UI);
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

  /**
   * Normalise a query the way a Japanese keyboard actually produces it:
   * lowercase, and fold full-width alphanumerics to ASCII. An IME left in
   * hiragana mode commits "４６２４", which never matches the half-width
   * "4624" in the index (different code points) and silently returns nothing.
   */
  function normalizeQuery(s) {
    return (s || "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    }).trim().toLowerCase();
  }

  function applyFilter() {
    // Split on whitespace and require every token (AND). A single substring
    // match forced the reader to reproduce word order exactly, so ordinary
    // queries like "mimikatz lsass" or "pass the hash" returned zero results
    // even though 21 and 22 techniques respectively contain both words.
    var terms = normalizeQuery(document.getElementById("q").value).split(/\s+/).filter(Boolean);
    var filtering = terms.length > 0 || activeSev.size > 0;
    var visible = 0;

    document.querySelectorAll(".card").forEach(function (c) {
      var okSev = activeSev.size === 0 || activeSev.has(c.dataset.sev);
      var txt = c.dataset.txt;
      var okQ = terms.every(function (t) { return txt.indexOf(t) !== -1; });
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
        // `.disabled` only sets pointer-events:none, which stops the mouse but
        // leaves the button in the tab order and still firing on Enter. Set the
        // real property too so keyboard and mouse agree.
        node.classList.toggle("disabled", pv === 0);
        node.disabled = pv === 0;
        node.setAttribute("aria-disabled", pv === 0 ? "true" : "false");
      }
    });

    var rc = document.getElementById("rescount");
    if (rc) rc.innerHTML = filtering ? "<b>" + visible + "</b> / " + TOTAL + " techniques" : "<b>" + TOTAL + "</b> techniques";
    document.getElementById("noresult").classList.toggle("show", visible === 0);
    document.querySelectorAll("#clearFilters").forEach(function (b) { b.hidden = !filtering; });

    // Filtering reflows the grid, so cards that were far below the fold can land
    // in view without any scroll event firing. Fill what is on screen now rather
    // than leaving placeholders until the user happens to scroll.
    if (AD.views && AD.views.fillNear) AD.views.fillNear();
  }

  function clearFilters() {
    document.getElementById("q").value = "";
    activeSev.clear();
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    applyFilter();
  }

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
    if (el.hasAttribute("data-lazy") && AD.views.fillCard) AD.views.fillCard(el);
    AD.flashScrollTo(el);
  }

  /* ---- event wiring (bound once; survives re-render/lang-switch) ---- */
  function wire() {
    document.querySelectorAll(".segmented button").forEach(function (b) {
      b.addEventListener("click", function () { setView(b.dataset.view); });
    });
    document.getElementById("q").addEventListener("input", AD.debounce(applyFilter, 90));
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var s = chip.dataset.sev;
        if (activeSev.has(s)) { activeSev.delete(s); chip.setAttribute("aria-pressed", "false"); }
        else { activeSev.add(s); chip.setAttribute("aria-pressed", "true"); }
        applyFilter();
      });
    });
    document.getElementById("themeBtn").addEventListener("click", AD.theme.toggle);

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
      if (e.key === "Escape" && AD.modal.isOpen()) { AD.modal.close(); return; }
      // The diagram is a role="button"; native buttons get Enter/Space for free
      // but a focusable <div> does not, and the legend tells the reader to use Enter.
      var dg = e.target.closest && e.target.closest(".diagram[data-scn]");
      if (dg && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        AD.modal.open(dg.getAttribute("data-scn"));
      }
    });
  }

  function init() {
    wire();
    loadData();
    setView("purple");
    AD.backToTop.mount();
    AD.prefetchWhenIdle(["concepts.html", "css/concepts.css", "js/data/concept-ui.js",
      "js/data/concept-figs.js", "js/data/concepts.js", "js/concepts.js"]);
  }

  AD.onReady(init);
})(window.AD);
