/*
 * core.js — shared UI runtime used by both pages (app.js / concepts.js).
 * Depends only on util.js. Everything below used to be duplicated (byte-for
 * -byte or near-identical) between the map page and the glossary page; it now
 * lives here once. No DOM state is held except what a given API explicitly
 * owns (e.g. the overlay's last-focused element).
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";

  /** Debounce: call `fn` `ms` after the last call to the returned wrapper. */
  AD.debounce = function (fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  /** Throttle: run `fn` at most once per animation frame (setTimeout(16) when rAF is unavailable). */
  AD.rafThrottle = function (fn) {
    var pending = false;
    return function () {
      if (pending) return;
      pending = true;
      var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
      raf(function () { pending = false; fn(); });
    };
  };

  /**
   * Apply an i18n dictionary to the current document.
   * [data-t] -> textContent, [data-t-html] -> innerHTML, [data-t-ph] -> placeholder,
   * [data-t-al] -> aria-label, [data-t-ti] -> title.
   * An element whose key has no entry in `dict` (null/undefined) is left untouched.
   * `opts.title`, if given, is written to document.title.
   */
  AD.applyI18n = function (dict, opts) {
    opts = opts || {};
    document.querySelectorAll("[data-t]").forEach(function (el) {
      var v = dict[el.getAttribute("data-t")];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-t-html]").forEach(function (el) {
      var v = dict[el.getAttribute("data-t-html")];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) {
      var v = dict[el.getAttribute("data-t-ph")];
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll("[data-t-al]").forEach(function (el) {
      var v = dict[el.getAttribute("data-t-al")];
      if (v != null) el.setAttribute("aria-label", v);
    });
    document.querySelectorAll("[data-t-ti]").forEach(function (el) {
      var v = dict[el.getAttribute("data-t-ti")];
      if (v != null) el.setAttribute("title", v);
    });
    if (opts.title != null) document.title = opts.title;
  };

  /** Dark/light theme toggle. Pins an explicit value on first click (falls back to the OS preference). */
  AD.theme = {
    toggle: function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var now = cur ? cur : (sysDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", now === "dark" ? "light" : "dark");
    }
  };

  /**
   * After the page is idle, warm the browser cache for `list` (hrefs) so a
   * glossary <-> map switch is near-instant. Deferred so it never competes
   * with this page's own load.
   */
  AD.prefetchWhenIdle = function (list) {
    var go = function () {
      var ric = window.requestIdleCallback || function (f) { return setTimeout(f, 1500); };
      ric(function () {
        list.forEach(function (href) {
          var l = document.createElement("link");
          l.rel = "prefetch"; l.href = href;
          document.head.appendChild(l);
        });
      });
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  };

  /**
   * Generic lazy-fill engine (replaces the map page's card lazy-fill and the
   * glossary page's figure lazy-fill — both were structurally identical).
   *
   * opts:
   *   selector      CSS selector matching elements still needing fill.
   *   fill(el)      Caller-supplied, idempotent; must clear whatever makes
   *                 the element match `selector` (so it isn't re-scanned).
   *   buffer        px margin used for the scroll/resize re-scan and as the
   *                 IntersectionObserver rootMargin fallback (default 1400).
   *   initialBuffer px margin for the first synchronous fill (default = buffer).
   *   rootMargin    IntersectionObserver rootMargin override (default buffer+"px 0px").
   *
   * Returns { fillNear(buffer), fillAll(), destroy() }. Each call to AD.lazy()
   * is self-contained (its own listeners/observer) — the caller must keep the
   * returned handle and call destroy() on the old one before re-creating (e.g.
   * on re-render), or listeners from the stale instance will leak.
   */
  AD.lazy = function (opts) {
    opts = opts || {};
    var selector = opts.selector;
    var fill = opts.fill;
    var buffer = (opts.buffer == null) ? 1400 : opts.buffer;
    var initialBuffer = (opts.initialBuffer == null) ? buffer : opts.initialBuffer;
    var rootMargin = opts.rootMargin || (buffer + "px 0px");
    var io = null;

    function teardownListeners() {
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
      if (io) { io.disconnect(); io = null; }
    }

    /** Synchronously fill every match whose box is within `buffer` px of the viewport. */
    function fillNear(buffer2) {
      buffer2 = (buffer2 == null) ? buffer : buffer2;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var els = document.querySelectorAll(selector);
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.bottom > -buffer2 && r.top < vh + buffer2) fill(els[i]);
      }
      // once nothing is left to fill, drop the scroll/resize listeners + observer
      if (!document.querySelector(selector)) teardownListeners();
    }

    /** Fill every current match regardless of viewport position, then tear down. */
    function fillAll() {
      var els = document.querySelectorAll(selector);
      for (var i = 0; i < els.length; i++) fill(els[i]);
      teardownListeners();
    }

    var onScrollResize = AD.rafThrottle(function () { fillNear(buffer); });

    var initial = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (initial.length) {
      // Always fill the initial viewport synchronously — robust regardless of IO/scroll support.
      fillNear(initialBuffer);
      // Progressive enhancement: IntersectionObserver fills matches as they approach (real browsers).
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            fill(entry.target);
            io.unobserve(entry.target);
          });
        }, { root: null, rootMargin: rootMargin, threshold: 0 });
        initial.forEach(function (el) { io.observe(el); });
      }
      // Fallback + real-browser trigger: fill near viewport on scroll/resize (rAF-throttled).
      window.addEventListener("scroll", onScrollResize, { passive: true });
      window.addEventListener("resize", onScrollResize, { passive: true });
    }

    return { fillNear: fillNear, fillAll: fillAll, destroy: teardownListeners };
  };

  /** Smooth-scroll an element into view and re-trigger its `.flash` highlight. */
  AD.flashScrollTo = function (el) {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  };

  /**
   * Shared modal/overlay shell (used by the technique detail modal on the map
   * page and the figure modal on the glossary page). Built from the richer of
   * the two prior implementations: focus trap + inert background + scroll
   * lock + focus restore. Every DOM lookup is guarded so a page missing
   * `.modal-card` / `.wrap` still works.
   */
  AD.overlay = (function () {
    /* `summary` belongs here: the modal body is mostly <details> blocks (hunt
       queries, command examples). Without it the trap list collapses to the
       close button alone, first === last, and every Tab bounces straight back
       to it — the collapsibles become unreachable by keyboard. */
    var FOCUSABLE = 'a[href], button:not([disabled]), input, summary, [tabindex]:not([tabindex="-1"])';
    var lastFocus = null;

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
      if (!card) return;
      var items = Array.prototype.slice.call(card.querySelectorAll(FOCUSABLE)).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open(html, opts) {
      var body = document.getElementById("modal-body");
      if (body) body.innerHTML = html;
      var m = document.getElementById("modal");
      if (!m) return;
      m.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
      bg(true);
      m.addEventListener("keydown", onTrapKey);
      var x = m.querySelector(".modal-x");
      if (x) x.focus();
      var card = m.querySelector(".modal-card");
      if (card) card.scrollTop = 0;
    }

    function close() {
      var m = document.getElementById("modal");
      if (!m) return;
      m.hidden = true;
      m.removeEventListener("keydown", onTrapKey);
      bg(false);
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function isOpen() {
      var m = document.getElementById("modal");
      return !!m && !m.hidden;
    }

    return { open: open, close: close, isOpen: isOpen };
  })();

  /**
   * Floating "back to top" button, shared by both pages. Built entirely from
   * JS (no markup in the HTML) and appended to <body> on mount(). Visibility
   * is driven by the `show` class rather than the `hidden` attribute so the
   * CSS opacity/transform transition can run. `update()` is public because
   * the automated regression harness cannot dispatch real scroll events —
   * it drives visibility checks by calling update() directly.
   */
  AD.backToTop = (function () {
    var api = { el: null };
    var mounted = false;
    var threshold = 600;

    function scrollY() {
      return window.scrollY || document.documentElement.scrollTop || 0;
    }

    api.update = function () {
      if (!api.el) return;
      api.el.classList.toggle("show", scrollY() > threshold);
    };

    function onClick() {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (api.el) api.el.blur();
    }

    api.mount = function (opts) {
      if (mounted) return; // idempotent
      if (!document.body) return;
      opts = opts || {};
      threshold = (opts.threshold == null) ? 600 : opts.threshold;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "to-top";
      btn.id = "toTop";
      btn.setAttribute("aria-label", "ページ上部へ戻る");
      btn.title = "ページ上部へ戻る";
      btn.innerHTML = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>';
      btn.addEventListener("click", onClick);

      document.body.appendChild(btn);
      api.el = btn;
      mounted = true;

      var onScrollResize = AD.rafThrottle(api.update);
      window.addEventListener("scroll", onScrollResize, { passive: true });
      window.addEventListener("resize", onScrollResize, { passive: true });

      api.update();
    };

    return api;
  })();

  /** Run `fn` once the DOM is ready (immediately if already past `loading`). */
  AD.onReady = function (fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };
})(window.AD);
