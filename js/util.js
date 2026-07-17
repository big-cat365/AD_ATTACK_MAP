/*
 * util.js — shared low-level helpers (no DOM state, no data).
 * Everything is attached to the global `AD` namespace so the classic
 * (non-module) scripts can share it under file:// without bundling.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";

  /** Escape text for safe insertion into HTML (element text or attribute). */
  AD.esc = function (s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /** Escape, then turn `code` spans (backtick pairs) into <code> elements. */
  AD.monoWrap = function (s) {
    return AD.esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  /** Normalise a technique name into a stable lookup key (ASCII + JP kept). */
  AD.scnNorm = function (s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9぀-ヿ一-鿿]/g, "").slice(0, 50);
  };

  /** Inline line-icons used by the offense / defense lane headings. */
  AD.ICONS = {
    sword: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/></svg>',
    shield: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>'
  };
})(window.AD);
