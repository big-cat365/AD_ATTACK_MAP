/*
 * components.js — presentational fragments shared by the card grid (views.js)
 * and the detail modal (modal.js). Extracting them keeps the two views in
 * sync: the offense/defense copy is authored once here.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc, mw = AD.monoWrap;

  /** MITRE / CVE (and optionally the sub-group) tag pills for a technique. */
  AD.tags = function (a, withGroup) {
    var t = [];
    if (a.mitre) t.push('<span class="tag mitre">' + esc(a.mitre) + "</span>");
    if (a.cve) t.push('<span class="tag cve">' + esc(a.cve) + "</span>");
    if (withGroup && a.group) t.push('<span class="tag">' + esc(a.group) + "</span>");
    return t.join("");
  };

  /** A labelled monospace metadata row (Tools / Event ID), or "" when empty. */
  function metaRow(label, value) {
    if (!value) return "";
    return '<div class="meta"><span class="ml">' + label + '</span><span class="mono">' + esc(value) + "</span></div>";
  }

  /**
   * The inner HTML of the two analysis lanes for a technique.
   * Returned as { red, blue } so the card and modal can wrap them in their
   * own containers (.lane vs .m-lane) while sharing identical content.
   */
  AD.lanes = function (a) {
    var u = AD.UI;
    return {
      red: "<p>" + mw(a.how) + "</p>" + metaRow("Tools", a.tools),
      blue:
        '<p><b class="hl-def">' + u.detectLabel + "</b> " + mw(a.detect) + "</p>" +
        '<p><b class="hl-def">' + u.mitigateLabel + "</b> " + mw(a.mitigate) + "</p>" +
        metaRow("Event ID", a.events)
    };
  };
})(window.AD);
