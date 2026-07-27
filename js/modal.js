/*
 * modal.js — the enlarged detail view: full-size diagram + full offense/defense
 * copy for a single technique. Reuses AD.lanes / AD.tags / AD.diagram so its
 * content never drifts from the card grid. The overlay shell itself (open/
 * close/focus-trap/inert/scroll-lock) lives in AD.overlay (core.js) and is
 * shared with the concepts page's figure modal.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc, mw = AD.monoWrap, ICONS = AD.ICONS;

  function findAttack(name) {
    var byName = AD.ATTACKS.filter(function (x) { return x.name === name; })[0];
    if (byName) return byName;
    var key = AD.scnNorm(name);
    return AD.ATTACKS.filter(function (x) { return AD.scnNorm(x.name) === key; })[0] || null;
  }

  /** Build the modal body HTML for one technique. */
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

  function open(name) {
    var a = findAttack(name);
    if (!a) return;
    AD.overlay.open(build(a));
  }

  function close() { AD.overlay.close(); }

  function isOpen() { return AD.overlay.isOpen(); }

  AD.modal = { open: open, close: close, isOpen: isOpen };
})(window.AD);
