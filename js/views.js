/*
 * views.js — builds the static views from data: stat tiles, kill-chain spine,
 * and the per-phase card grid. Also owns the progressive (scroll-independent)
 * reveal + lazy diagram rendering. Reads AD.PHASES / AD.ATTACKS / AD.GROUP_ORDER.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  var esc = AD.esc, mw = AD.monoWrap, ICONS = AD.ICONS;
  var SEV = { Critical: 1, High: 1, Medium: 1 };

  function phaseCounts() {
    var m = {};
    AD.PHASES.forEach(function (p) { m[p.id] = 0; });
    AD.ATTACKS.forEach(function (a) { if (m[a.phase] != null) m[a.phase]++; });
    return m;
  }

  function renderStats() {
    var sev = { Critical: 0, High: 0, Medium: 0 };
    AD.ATTACKS.forEach(function (a) { if (sev[a.sev] != null) sev[a.sev]++; });
    var cats = new Set(AD.ATTACKS.map(function (a) { return a.group; })).size;
    var tiles = [
      { n: AD.ATTACKS.length, l: "収録テクニック", c: "" },
      { n: AD.PHASES.length, l: "キルチェーン フェーズ", c: "" },
      { n: cats, l: "攻撃カテゴリ", c: "" },
      { n: sev.Critical, l: "Critical 重大度", c: "crit" },
      { n: sev.High, l: "High 重大度", c: "" }
    ];
    document.getElementById("stats").innerHTML = tiles.map(function (s) {
      return '<div class="stat ' + s.c + '"><div class="n">' + s.n + '</div><div class="l">' + s.l + "</div></div>";
    }).join("");
  }

  function renderSpine() {
    var counts = phaseCounts();
    document.getElementById("spine").innerHTML = AD.PHASES.map(function (p) {
      return '<a class="phase-node" href="#ph-' + p.id + '" data-phase="' + p.id + '">' +
        '<span class="rail"></span>' +
        '<span class="pnum">' + esc(p.idx) + "</span>" +
        '<span class="pname">' + esc(p.name) + "</span>" +
        '<span class="pen">' + esc(p.en) + "</span>" +
        '<span class="pcount">' + counts[p.id] + " techniques</span>" +
        '<span class="arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></span>' +
        "</a>";
    }).join("");
  }

  function card(a) {
    var lanes = AD.lanes(a);
    var searchTxt = esc([a.name, a.aka, a.mitre, a.cve, a.summary, a.how, a.detect, a.tools].join(" ").toLowerCase());
    var sev = SEV[a.sev] ? a.sev : "Medium";
    var nameEsc = esc(a.name);
    var scn = AD.diagram.getScenario(a.name);
    var svg = scn ? AD.diagram.renderSeq(scn, { compact: true })
      : '<div style="color:var(--faint);font-family:var(--mono);font-size:11px;padding:10px">— flow n/a —</div>';
    return '<article class="card sev-' + sev + ' reveal" data-sev="' + sev + '" data-txt="' + searchTxt + '">' +
      '<div class="card-head">' +
        '<div class="card-title-row"><div><h3>' + nameEsc + "</h3>" +
          (a.aka ? '<div class="aka">' + esc(a.aka) + "</div>" : "") + "</div>" +
          '<span class="sev-badge">' + esc(sev) + "</span></div>" +
        '<p class="summary">' + mw(a.summary) + "</p>" +
        '<div class="tags">' + AD.tags(a) + "</div>" +
      "</div>" +
      '<div class="diagram" data-scn="' + nameEsc + '" title="クリックで拡大">' +
        '<div class="diagram-head"><span class="dl">ATTACK FLOW <b>登場人物と手順</b></span>' +
          '<button class="expand" data-expand="' + nameEsc + '" aria-label="' + nameEsc + ' の攻撃フロー図を拡大">⤢ 拡大</button></div>' +
        '<div class="dscroll">' + svg + "</div>" +
      "</div>" +
      '<div class="split">' +
        '<div class="lane off"><div class="lane-head">' + ICONS.sword + " Red · 攻撃</div>" + lanes.red + "</div>" +
        '<div class="lane def"><div class="lane-head">' + ICONS.shield + " Blue · 防御</div>" + lanes.blue + "</div>" +
      "</div></article>";
  }

  function renderMain() {
    document.getElementById("main").innerHTML = AD.PHASES.map(function (p) {
      var items = AD.ATTACKS.filter(function (a) { return a.phase === p.id; });
      if (!items.length) return "";
      var groups = {};
      items.forEach(function (a) { var g = a.group || "—"; (groups[g] = groups[g] || []).push(a); });
      var gkeys = Object.keys(groups).sort(function (a, b) {
        var ia = AD.GROUP_ORDER.indexOf(a), ib = AD.GROUP_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      var showGroups = gkeys.length > 1;
      var body = gkeys.map(function (g) {
        return (showGroups ? '<div class="group-label">' + esc(g) + ' <span class="gcount">' + groups[g].length + "</span></div>" : "") +
          '<div class="grid">' + groups[g].map(card).join("") + "</div>";
      }).join("");
      return '<section class="phase-block" id="ph-' + p.id + '" data-phase="' + p.id + '">' +
        '<div class="phase-head"><span class="idx">' + esc(p.idx) + '</span><h2>' + esc(p.name) + "</h2>" +
          '<span class="en">' + esc(p.en) + '</span><span class="cnt">' + items.length + " techniques</span></div>" +
        '<p class="phase-desc">' + esc(p.desc) + "</p>" + body + "</section>";
    }).join("");
  }

  /** Progressively fade cards in (diagrams are already embedded at build). */
  function revealAll() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal:not(.in)"));
    var i = 0, BATCH = 20;
    (function step() {
      var end = Math.min(i + BATCH, els.length);
      for (; i < end; i++) els[i].classList.add("in");
      if (i < els.length) setTimeout(step, 10);
    })();
  }

  /** Build the whole page body (stats + spine + grid) and kick off reveal. */
  function render() {
    renderStats();
    renderSpine();
    renderMain();
    revealAll();
  }

  AD.views = { render: render };
})(window.AD);
