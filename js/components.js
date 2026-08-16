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

  /** Slugify a platform tag into a CSS-class-safe token. */
  function platSlug(p) { return (p || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /**
   * Collapsible block of hunting queries for a technique.
   * `list` is an array of { plat, t, q }: platform/dialect tag, caption, raw
   * query text. The query is inserted verbatim (esc'd) inside <pre><code> —
   * never monoWrap'd, so pipes/quotes/operators render literally.
   * `opts` = { label, hint, cls } lets the same renderer serve the Microsoft
   * (KQL) block and the CrowdStrike (Falcon) block.
   */
  AD.huntBlock = function (list, opts) {
    if (!list || !list.length) return "";
    opts = opts || {};
    var u = AD.UI;
    var label = opts.label || u.huntLabel, hint = opts.hint || u.huntHint, cls = opts.cls || "";
    var rows = list.map(function (h) {
      var plat = (h.plat || "").toString();
      var badge = plat ? '<span class="hq-plat plat-' + esc(platSlug(plat)) + '">' + esc(plat) + "</span>" : "";
      return '<div class="hq">' +
        (h.t || plat ? '<div class="hq-cap">' + badge + (h.t ? " " + esc(h.t) : "") + "</div>" : "") +
        '<pre class="kql"><code>' + esc(h.q) + "</code></pre></div>";
    }).join("");
    return '<details class="hunt ' + cls + '"><summary><span class="hunt-lbl">' + esc(label) +
      '</span><span class="hq-n">' + list.length + "</span></summary>" +
      '<p class="hunt-hint">' + esc(hint) + "</p>" + rows + "</details>";
  };

  /**
   * Collapsible block of representative command lines for a technique.
   * `list` is an array of { tool, t, q }: the tool badge, a defender-facing
   * caption (which token to pin a hunt on / which log it lands in), and the
   * command exactly as it appears in process telemetry.
   *
   * Shares the `.hunt` chrome so the collapsible affordance is identical to
   * the query blocks, but is rendered *outside* the Red/Blue lanes: the same
   * strings are what the attacker types and what the analyst matches on, so
   * dimming them in either view would be wrong. The caption goes through
   * monoWrap (backticks -> <code>) while the command itself is only esc'd,
   * so operators/quotes/pipes render literally.
   */
  AD.cmdBlock = function (list) {
    if (!list || !list.length) return "";
    var u = AD.UI;
    var rows = list.map(function (c) {
      var badge = c.tool ? '<span class="cmd-tool">' + esc(c.tool) + "</span>" : "";
      return '<div class="hq">' +
        (c.t || badge ? '<div class="hq-cap">' + badge + (c.t ? " " + mw(c.t) : "") + "</div>" : "") +
        '<pre class="kql"><code>' + esc(c.q) + "</code></pre></div>";
    }).join("");
    return '<details class="hunt cmds"><summary><span class="hunt-lbl">' + esc(u.cmdLabel) +
      '</span><span class="hq-n">' + list.length + "</span></summary>" +
      '<p class="hunt-hint">' + esc(u.cmdHint) + "</p>" + rows + "</details>";
  };

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
        (a.triage ? '<p class="triage"><b class="hl-tri">' + u.triageLabel + "</b> " + mw(a.triage) + "</p>" : "") +
        AD.huntBlock(a.hunt) +
        AD.huntBlock(a.huntcs, { label: u.huntCsLabel, hint: u.huntCsHint, cls: "cs" }) +
        '<p><b class="hl-def">' + u.mitigateLabel + "</b> " + mw(a.mitigate) + "</p>" +
        metaRow("Event ID", a.events)
    };
  };
})(window.AD);
