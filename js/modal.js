/*
 * modal.js — the enlarged detail view: full-size diagram + full offense/defense
 * copy for a single technique. Reuses AD.lanes / AD.tags / AD.diagram so its
 * content never drifts from the card grid.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc, mw = AD.monoWrap, ICONS = AD.ICONS;
  var lastFocus = null;

  function findAttack(name) {
    var byName = AD.ATTACKS.filter(function (x) { return x.name === name; })[0];
    if (byName) return byName;
    var key = AD.scnNorm(name);
    return AD.ATTACKS.filter(function (x) { return AD.scnNorm(x.name) === key; })[0] || null;
  }

  function build(a) {
    var scn = AD.diagram.getScenario(a.name);
    var svg = scn
      ? AD.diagram.renderSeq(scn, { compact: false })
      : '<div style="color:var(--muted);font-family:var(--mono);padding:16px">' + esc(AD.UI.noFlow) + "</div>";
    var phase = AD.PHASES.filter(function (p) { return p.id === a.phase; })[0];
    var lanes = AD.lanes(a);
    return (
      '<p class="m-eyebrow">' + (phase ? esc(phase.idx + " · " + phase.name + " / " + phase.en) : "") +
        '<span class="sevwrap sev-' + a.sev + '" style="margin-left:8px"><span class="sev-badge">' + a.sev + "</span></span></p>" +
      '<h2 id="m-title">' + esc(a.name) + "</h2>" +
      (a.aka ? '<p class="m-aka">' + esc(a.aka) + "</p>" : "") +
      '<div class="m-tags">' + AD.tags(a, true) + "</div>" +
      '<p class="m-summary">' + mw(a.summary) + "</p>" +
      '<div class="m-diagram">' + svg + "</div>" +
      '<div class="m-seqlegend">' + AD.diagram.kindLegend() + "</div>" +
      '<div class="m-lanes">' +
        '<div class="m-lane off"><h3>' + ICONS.sword + " " + esc(AD.UI.modalRed) + "</h3>" + lanes.red + "</div>" +
        '<div class="m-lane def"><h3>' + ICONS.shield + " " + esc(AD.UI.modalBlue) + "</h3>" + lanes.blue + "</div>" +
      "</div>"
    );
  }

  var FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
  function bg(on) {
    ['.topbar', '.wrap'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      if (on) { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); }
      else { el.removeAttribute("inert"); el.removeAttribute("aria-hidden"); }
    });
  }
  function onTrapKey(e) {
    if (e.key !== "Tab") return;
    var card = document.querySelector("#modal .modal-card");
    var items = Array.prototype.slice.call(card.querySelectorAll(FOCUSABLE)).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(name) {
    var a = findAttack(name);
    if (!a) return;
    document.getElementById("modal-body").innerHTML = build(a);
    var m = document.getElementById("modal");
    m.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    bg(true);
    m.addEventListener("keydown", onTrapKey);
    m.querySelector(".modal-x").focus();
    m.querySelector(".modal-card").scrollTop = 0;
  }

  function close() {
    var m = document.getElementById("modal");
    m.hidden = true;
    m.removeEventListener("keydown", onTrapKey);
    bg(false);
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isOpen() { return !document.getElementById("modal").hidden; }

  AD.modal = { open: open, close: close, isOpen: isOpen };
})(window.AD);
