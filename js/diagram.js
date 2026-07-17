/*
 * diagram.js — the attack-flow sequence-diagram renderer.
 * Pure function of a scenario ({ actors, steps }) → SVG string. No DOM access.
 * Layout constants live in CONFIG so spacing/size can be tuned in one place.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc;

  // Layout geometry. `compact` = inline card preview, `full` = modal.
  var CONFIG = {
    padX: 6, headerY: 6, nodeH: 50, lifeGap: 2, stepGap: 12, bottomPad: 14,
    compact: { colW: 152, stepH: 56, font: 10, wrapActor: 11, wrapCross: 18, wrapSelf: 15 },
    full: { colW: 178, stepH: 62, font: 11.5, wrapActor: 13, wrapCross: 26, wrapSelf: 20 }
  };

  // Actor role → { group class (colour), icon path }. Group classes map to
  // the offense/authority/identity/neutral colours defined in styles.css.
  var ROLES = {
    attacker:    { g: "g-off", ic: '<circle cx="12" cy="10" r="6.2"/><path d="M9 20v-2.4M15 20v-2.4M8.5 20h7"/><circle cx="9.7" cy="10" r="1.1"/><circle cx="14.3" cy="10" r="1.1"/>' },
    relay:       { g: "g-off", ic: '<path d="M4 9h13l-3-3M20 15H7l3 3"/>' },
    dc:          { g: "g-def", ic: '<path d="M12 3 4 6v6c0 5 4 7.5 8 9 4-1.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>' },
    server:      { g: "g-neu", ic: '<rect x="3.5" y="4" width="17" height="6.5" rx="1.4"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.4"/><path d="M7 7.2h.01M7 16.7h.01"/>' },
    workstation: { g: "g-neu", ic: '<rect x="3" y="4.5" width="18" height="11.5" rx="1.4"/><path d="M8.5 20h7M12 16v4"/>' },
    db:          { g: "g-neu", ic: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v11c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8V6"/><path d="M4.5 11.5c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8"/>' },
    share:       { g: "g-neu", ic: '<path d="M3 7.5A1.8 1.8 0 0 1 4.8 5.7H9l2 2h8.2A1.8 1.8 0 0 1 21 9.5v7.8a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.3Z"/>' },
    cloud:       { g: "g-neu", ic: '<path d="M7 18a4 4 0 0 1-.4-8A5 5 0 0 1 16 8.7 3.6 3.6 0 0 1 17.5 18Z"/>' },
    dns:         { g: "g-neu", ic: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.6 2.8 14.4 0 17M12 3.5c-2.8 2.6-2.8 14.4 0 17"/>' },
    svcacct:     { g: "g-pur", ic: '<circle cx="8.5" cy="14.5" r="3.6"/><path d="m11 12 8-8M16.5 6.5 19 9M13.5 9 16 11.5"/>' },
    ca:          { g: "g-pur", ic: '<circle cx="12" cy="9" r="5.5"/><path d="m8.7 13.5-1.4 6.5L12 17l4.7 3-1.4-6.5"/>' },
    adobject:    { g: "g-pur", ic: '<path d="M6.5 3h6l4.5 4.5V21h-10.5Z"/><path d="M12.5 3v4.5H17M9 13h6M9 16.5h6"/>' },
    victim:      { g: "g-pur", ic: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.4-5.5 7-5.5s7 1.9 7 5.5"/>' },
    admin:       { g: "g-pur", ic: '<circle cx="10" cy="8" r="3.3"/><path d="M4 20c0-3.4 3-5.3 6-5.3"/><path d="m17.5 12.5.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3Z"/>' }
  };

  // Step kinds → UI label key (colour comes from the .k-* CSS classes).
  var KINDS = [
    { k: "attack", u: "flowAttack" },
    { k: "auth", u: "flowAuth" },
    { k: "data", u: "flowData" },
    { k: "move", u: "flowMove" },
    { k: "defense", u: "flowDefense" }
  ];
  function kindLegend() {
    return KINDS.map(function (x) {
      return '<span><i class="ln k-' + x.k + '"></i>' + AD.UI[x.u] + "</span>";
    }).join("");
  }

  /** Wrap a string into up to `maxLines` lines of `maxChars`, ellipsising overflow. */
  function wrapText(t, maxChars, maxLines) {
    t = (t || "").toString();
    var lines = [];
    for (var i = 0; i < t.length && lines.length < maxLines; i += maxChars) lines.push(t.slice(i, i + maxChars));
    if (lines.length === maxLines && t.length > maxLines * maxChars) {
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…";
    }
    return lines.length ? lines : [""];
  }

  /** A numbered step badge (kind-coloured circle + white number). */
  function badge(x, y, num, kc) {
    return '<circle class="badge ' + kc + '" cx="' + (x + 8) + '" cy="' + (y + 8) + '" r="8"/>' +
      '<text class="snum" x="' + (x + 8) + '" y="' + (y + 11.3) + '" text-anchor="middle">' + num + "</text>";
  }

  /**
   * Render a scenario as an SVG sequence diagram.
   * @param {{actors:Array,steps:Array}} scn
   * @param {{compact?:boolean}} opts
   */
  function renderSeq(scn, opts) {
    opts = opts || {};
    var m = opts.compact ? CONFIG.compact : CONFIG.full;
    var actors = scn.actors, steps = scn.steps, n = actors.length;
    var lifeTop = CONFIG.headerY + CONFIG.nodeH + CONFIG.lifeGap;
    var stepTop = lifeTop + CONFIG.stepGap;
    var W = CONFIG.padX * 2 + n * m.colW;
    var H = stepTop + steps.length * m.stepH + CONFIG.bottomPad;
    var cx = function (i) { return CONFIG.padX + m.colW * i + m.colW / 2; };
    var idx = {};
    actors.forEach(function (a, i) { idx[a.id] = i; });
    var alabel = AD.UI.svgActors + actors.map(function (a) { return a.label; }).join(', ') +
      AD.UI.svgSteps + steps.map(function (st, i) { return (i + 1) + '. ' + st.label; }).join('; ');

    var s = '<svg class="seq" role="img" aria-label="' + esc(alabel) + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg">';

    // lifelines
    actors.forEach(function (a, i) {
      var x = cx(i);
      s += '<line class="lifeline" x1="' + x + '" y1="' + lifeTop + '" x2="' + x + '" y2="' + (H - 10) + '"/>';
    });
    // actor headers (node + icon + wrapped label)
    actors.forEach(function (a, i) {
      var x = cx(i), role = ROLES[a.role] || ROLES.server, nodeW = m.colW - 16, nx = x - nodeW / 2;
      s += '<rect class="anode ' + role.g + '" x="' + nx + '" y="' + CONFIG.headerY + '" width="' + nodeW + '" height="' + CONFIG.nodeH + '" rx="8"/>';
      s += '<g class="aicon ' + role.g + '" transform="translate(' + (x - 9) + "," + (CONFIG.headerY + 6) + ') scale(0.78)">' + role.ic + "</g>";
      wrapText(a.label, m.wrapActor, 2).forEach(function (ln, li) {
        s += '<text class="alabel" x="' + x + '" y="' + (CONFIG.headerY + 33 + li * 11) + '" text-anchor="middle" font-size="' + m.font + '">' + esc(ln) + "</text>";
      });
    });
    // steps: cross-arrows between lifelines, or self-boxes for local/offline work
    steps.forEach(function (st, j) {
      var base = stepTop + j * m.stepH, kc = "k-" + st.kind, num = j + 1;
      var fi = idx[st.from] != null ? idx[st.from] : 0;
      var ti = idx[st.to] != null ? idx[st.to] : 0;
      var x1 = cx(fi), x2 = cx(ti), arrowY = base + m.stepH - 16;
      if (fi === ti) {
        var boxW = m.colW - 26, bx = x1 - boxW / 2, boxY = base + 8, boxH = m.stepH - 20;
        s += '<rect class="selfbox ' + kc + '" x="' + bx + '" y="' + boxY + '" width="' + boxW + '" height="' + boxH + '" rx="7"/>';
        var slf = wrapText(st.label, m.wrapSelf, 2);
        slf.forEach(function (ln, li) {
          s += '<text class="slabel" x="' + x1 + '" y="' + (boxY + boxH / 2 - (slf.length - 1) * 6 + li * 12 + 4) + '" text-anchor="middle" font-size="' + m.font + '">' + esc(ln) + "</text>";
        });
        s += badge(bx + 1, boxY + 1, num, kc);
      } else {
        var dir = x2 > x1 ? 1 : -1, ls = x1 + dir * 10, le = x2 - dir * 9, ax = x2 - dir * 9;
        s += '<line class="arrow ' + kc + '" x1="' + ls + '" y1="' + arrowY + '" x2="' + le + '" y2="' + arrowY + '"/>';
        s += '<path class="ahead ' + kc + '" d="M' + (x2 - dir) + " " + arrowY + " L" + ax + " " + (arrowY - 4) + " L" + ax + " " + (arrowY + 4) + ' Z"/>';
        var midx = (x1 + x2) / 2, cl = wrapText(st.label, m.wrapCross, 2), ly0 = arrowY - 9 - (cl.length - 1) * 11;
        cl.forEach(function (ln, li) {
          s += '<text class="slabel" x="' + midx + '" y="' + (ly0 + li * 11) + '" text-anchor="middle" font-size="' + m.font + '">' + esc(ln) + "</text>";
        });
        s += badge(x1 - 8, arrowY - 8, num, kc);
      }
    });
    return s + "</svg>";
  }

  /** Look up the scenario for a technique name (via the normalised key). */
  function getScenario(name) {
    return AD.SCENARIOS[AD.scnNorm(name)] || null;
  }

  AD.diagram = { renderSeq: renderSeq, getScenario: getScenario, KINDS: KINDS, kindLegend: kindLegend };
})(window.AD);
