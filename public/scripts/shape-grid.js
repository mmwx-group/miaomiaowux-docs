// 网格背景(移植自 reactbits.dev/backgrounds/shape-grid 的 ShapeGrid,square 形状):
// 方格网格以恒定速度斜向平移,鼠标所在格子填充品牌色并拖出一条渐隐尾迹。
// 文档首页与落地页共用同一份实现;边缘淡出由 CSS mask 负责,这里不画渐变。
//
// 挂载方式:
//   1. 元素加 data-shape-grid 属性(可选 data-size / data-speed / data-direction / data-trail / data-height)
//   2. 或调用 window.MmwxShapeGrid.mount(el, opts)
// 颜色从宿主元素的 CSS 变量读取:--mmwx-grid-line(描边)、--mmwx-grid-glow(悬停填充)。
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readColors(host) {
    var cs = getComputedStyle(host);
    return {
      border:
        cs.getPropertyValue("--mmwx-grid-line").trim() ||
        "rgba(217, 119, 87, 0.18)",
      fill:
        cs.getPropertyValue("--mmwx-grid-glow").trim() ||
        "rgba(217, 119, 87, 0.45)",
    };
  }

  function mount(host, opts) {
    if (!host || host.__mmwxShapeGrid) return host && host.__mmwxShapeGrid;
    opts = opts || {};
    var size = Number(opts.size) || 40; // 方格边长(px)
    var speed = opts.speed != null ? Number(opts.speed) : 1; // px / 帧(按 60fps 折算)
    var direction = opts.direction || "diagonal"; // right | left | up | down | diagonal
    var trailAmount = opts.trail != null ? Number(opts.trail) : 8; // 尾迹格子数
    var maxHeight = Number(opts.height) || 0;

    var canvas = document.createElement("canvas");
    canvas.className = "mmwx-shape-grid";
    canvas.setAttribute("aria-hidden", "true");
    host.classList.add("mmwx-shape-grid-host");
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext("2d");
    var w = 0,
      h = 0,
      dpr = 1;
    var colors = readColors(host);
    var offset = { x: 0, y: 0 };
    var hovered = null; // {x, y} 格子坐标
    var trail = [];
    var cellAlpha = {}; // "col,row" -> 当前透明度
    var raf = 0;
    var visible = true;
    var lastTs = 0;

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
      if (reduceMotion) draw();
    }

    function wrap(v) {
      return ((v % size) + size) % size;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var ox = wrap(offset.x);
      var oy = wrap(offset.y);
      var cols = Math.ceil(w / size) + 3;
      var rows = Math.ceil(h / size) + 3;

      // 悬停 / 尾迹填充
      ctx.fillStyle = colors.fill;
      for (var key in cellAlpha) {
        var parts = key.split(",");
        var c = +parts[0];
        var r = +parts[1];
        ctx.globalAlpha = cellAlpha[key];
        ctx.fillRect(c * size + ox, r * size + oy, size, size);
      }
      ctx.globalAlpha = 1;

      // 网格线:整张一笔画完,避免相邻格子的边重复描两次
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      for (var col = -2; col < cols; col++) {
        var x = Math.round(col * size + ox) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (var row = -2; row < rows; row++) {
        var y = Math.round(row * size + oy) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }

    function updateCellAlpha() {
      var targets = {};
      if (hovered) targets[hovered.x + "," + hovered.y] = 1;
      for (var i = 0; i < trail.length; i++) {
        var k = trail[i].x + "," + trail[i].y;
        if (!(k in targets))
          targets[k] = (trail.length - i) / (trail.length + 1);
      }
      for (var key in targets) if (!(key in cellAlpha)) cellAlpha[key] = 0;
      for (var key2 in cellAlpha) {
        var target = targets[key2] || 0;
        var next = cellAlpha[key2] + (target - cellAlpha[key2]) * 0.15;
        if (next < 0.005) delete cellAlpha[key2];
        else cellAlpha[key2] = next;
      }
    }

    function frame(ts) {
      raf = 0;
      if (!visible) return;
      var dt = lastTs ? Math.min(ts - lastTs, 100) : 16.7;
      lastTs = ts;
      var step = Math.max(speed, 0.1) * (dt / 16.7);
      if (direction === "right" || direction === "diagonal") offset.x -= step;
      if (direction === "left") offset.x += step;
      if (direction === "down" || direction === "diagonal") offset.y -= step;
      if (direction === "up") offset.y += step;
      offset.x = wrap(offset.x);
      offset.y = wrap(offset.y);
      updateCellAlpha();
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion || raf || !visible) return;
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // 画布在内容下方且 pointer-events:none,所以在 window 上监听鼠标再换算到画布坐标
    function pushTrail(cell) {
      if (trailAmount <= 0) return;
      trail.unshift(cell);
      if (trail.length > trailAmount) trail.length = trailAmount;
    }
    function onMove(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) {
        onLeave();
        return;
      }
      var col = Math.floor((mx - wrap(offset.x)) / size);
      var row = Math.floor((my - wrap(offset.y)) / size);
      if (!hovered || hovered.x !== col || hovered.y !== row) {
        if (hovered) pushTrail(hovered);
        hovered = { x: col, y: row };
      }
    }
    function onLeave() {
      if (hovered) pushTrail(hovered);
      hovered = null;
    }
    if (!reduceMotion) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
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
      if (reduceMotion) draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    host.__mmwxShapeGrid = {
      canvas: canvas,
      resize: resize,
      stop: stop,
      start: start,
    };
    return host.__mmwxShapeGrid;
  }

  function optsFromDataset(el) {
    var d = el.dataset || {};
    return {
      size: d.size,
      speed: d.speed,
      direction: d.direction,
      trail: d.trail,
      height: d.height,
    };
  }

  function mountAll() {
    var els = document.querySelectorAll("[data-shape-grid]");
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

  window.MmwxShapeGrid = { mount: mount, mountAll: mountAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
