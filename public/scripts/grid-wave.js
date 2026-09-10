// 网格水波纹背景(Canvas 版):以中心为波源的连续同心水波,一圈圈快速向四周推进,
// 网格顶点随波面起伏、波峰经过处的网格线以品牌色点亮。文档首页与落地页共用同一份实现。
//
// 挂载方式:
//   1. 元素加 data-grid-wave 属性(可选 data-origin-x / data-origin-y / data-spacing / data-height)
//   2. 或调用 window.MmwxGridWave.mount(el, opts)
// 颜色从宿主元素的 CSS 变量读取:--mmwx-grid-line(基线)、--mmwx-grid-glow(波峰)。
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var WAVELENGTH = 120; // 相邻两圈波峰的间距(px)
  var PERIOD = 900; // 一圈波峰走完一个波长所需时间(ms),越小越快
  var AMPLITUDE = 14; // 波源附近顶点的最大位移(px)
  var FALLOFF = 420; // 振幅随距离衰减的尺度(px):amp / (1 + r / FALLOFF)

  function readColors(host) {
    var cs = getComputedStyle(host);
    return {
      line:
        cs.getPropertyValue("--mmwx-grid-line").trim() ||
        "rgba(217, 119, 87, 0.14)",
      glow:
        cs.getPropertyValue("--mmwx-grid-glow").trim() ||
        "rgba(217, 119, 87, 0.75)",
    };
  }

  function mount(host, opts) {
    if (!host || host.__mmwxGridWave) return host && host.__mmwxGridWave;
    opts = opts || {};
    var spacing = Number(opts.spacing) || 42;
    var originX = opts.originX != null ? Number(opts.originX) : 0.5;
    var originY = opts.originY != null ? Number(opts.originY) : 0.5;
    var maxHeight = Number(opts.height) || 0;

    var canvas = document.createElement("canvas");
    canvas.className = "mmwx-grid-wave";
    canvas.setAttribute("aria-hidden", "true");
    host.classList.add("mmwx-grid-wave-host");
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext("2d");
    var w = 0,
      h = 0,
      dpr = 1,
      cols = 0,
      rows = 0;
    var colors = readColors(host);
    var raf = 0;
    var visible = true;
    var started = 0;

    function resize() {
      var rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(
        1,
        Math.round(maxHeight ? Math.min(rect.height, maxHeight) : rect.height),
      );
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
      if (reduceMotion) draw(0);
    }

    // 计算某个顶点在 now 时刻的位移与发光强度:
    // 径向行波 sin(2π(r/λ - t/T)),振幅随距离衰减,位移沿径向(像水面被推开)
    function displace(x, y, now, out) {
      var ox = originX * w;
      var oy = originY * h;
      var rx = x - ox;
      var ry = y - oy;
      var r = Math.sqrt(rx * rx + ry * ry) || 1;
      var phase = (r / WAVELENGTH - now / PERIOD) * Math.PI * 2;
      var env = 1 / (1 + r / FALLOFF);
      var wave = Math.sin(phase);
      var s = wave * env * AMPLITUDE;
      out[0] = x + (rx / r) * s;
      out[1] = y + (ry / r) * s * 0.75; // 竖向略压扁,更像俯视水面
      // 只有波峰发光,并随距离减弱
      var crest = wave > 0 ? wave * wave : 0;
      out[2] = crest * Math.min(1, env * 1.6);
    }

    var px = [],
      py = [],
      pg = [];
    var tmp = [0, 0, 0];

    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      var n = (cols + 1) * (rows + 1);
      if (px.length !== n) {
        px = new Array(n);
        py = new Array(n);
        pg = new Array(n);
      }
      var offX = (w % spacing) / 2 - spacing;
      var offY = (h % spacing) / 2 - spacing;
      for (var j = 0; j <= rows; j++) {
        for (var i = 0; i <= cols; i++) {
          displace(offX + i * spacing, offY + j * spacing, now, tmp);
          var k = j * (cols + 1) + i;
          px[k] = tmp[0];
          py[k] = tmp[1];
          pg[k] = tmp[2];
        }
      }

      // 基线
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      for (var r0 = 0; r0 <= rows; r0++) {
        for (var c0 = 0; c0 <= cols; c0++) {
          var k0 = r0 * (cols + 1) + c0;
          if (c0 === 0) ctx.moveTo(px[k0], py[k0]);
          else ctx.lineTo(px[k0], py[k0]);
        }
      }
      for (var c1 = 0; c1 <= cols; c1++) {
        for (var r1 = 0; r1 <= rows; r1++) {
          var k1 = r1 * (cols + 1) + c1;
          if (r1 === 0) ctx.moveTo(px[k1], py[k1]);
          else ctx.lineTo(px[k1], py[k1]);
        }
      }
      ctx.stroke();

      // 波峰发光:按线段强度分档描一遍
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = colors.glow;
      var buckets = [0.18, 0.45, 0.8];
      for (var b = 0; b < buckets.length; b++) {
        var lo = buckets[b];
        var hi = b + 1 < buckets.length ? buckets[b + 1] : 2;
        ctx.globalAlpha = lo;
        ctx.beginPath();
        for (var r2 = 0; r2 <= rows; r2++) {
          for (var c2 = 0; c2 < cols; c2++) {
            var a = r2 * (cols + 1) + c2;
            var g = (pg[a] + pg[a + 1]) / 2;
            if (g >= lo && g < hi) {
              ctx.moveTo(px[a], py[a]);
              ctx.lineTo(px[a + 1], py[a + 1]);
            }
          }
        }
        for (var c3 = 0; c3 <= cols; c3++) {
          for (var r3 = 0; r3 < rows; r3++) {
            var a2 = r3 * (cols + 1) + c3;
            var a3 = a2 + cols + 1;
            var g2 = (pg[a2] + pg[a3]) / 2;
            if (g2 >= lo && g2 < hi) {
              ctx.moveTo(px[a2], py[a2]);
              ctx.lineTo(px[a3], py[a3]);
            }
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function frame(ts) {
      raf = 0;
      if (!visible) return;
      if (!started) started = ts;
      draw(ts - started);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion || raf || !visible) return;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    start();

    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(host);
    else window.addEventListener("resize", resize);

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(host);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    // 主题切换时重新读取颜色(文档站用 data-theme,落地页用 .dark)
    var mo = new MutationObserver(function () {
      colors = readColors(host);
      if (reduceMotion) draw(0);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    host.__mmwxGridWave = {
      canvas: canvas,
      resize: resize,
      stop: stop,
      start: start,
    };
    return host.__mmwxGridWave;
  }

  function optsFromDataset(el) {
    var d = el.dataset || {};
    return {
      originX: d.originX,
      originY: d.originY,
      spacing: d.spacing,
      height: d.height,
    };
  }

  function mountAll() {
    var els = document.querySelectorAll("[data-grid-wave]");
    for (var i = 0; i < els.length; i++) mount(els[i], optsFromDataset(els[i]));
    // Starlight 首页(splash 模板):hero 所在面板
    var panel = document.querySelector(
      ".content-panel:has(> .sl-container > .hero)",
    );
    if (panel) {
      var cs = getComputedStyle(panel);
      var hv = parseFloat(cs.getPropertyValue("--mmwx-hero-bg-height")) || 0;
      var remPx =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      mount(panel, { height: hv ? hv * remPx : 0 });
    }
  }

  window.MmwxGridWave = { mount: mount, mountAll: mountAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
