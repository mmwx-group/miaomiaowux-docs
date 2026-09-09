// 文档配图点击放大。样式在 src/styles/starlight.css 的 .mmwx-lightbox。
(function () {
  if (typeof document === "undefined") return;

  function captionFor(img) {
    var p = img.closest("p");
    var next = p && p.nextElementSibling;
    if (next && next.tagName === "P" && !next.querySelector("img")) {
      return next.textContent.trim();
    }
    return img.getAttribute("alt") || "";
  }

  function open(img) {
    var box = document.createElement("div");
    box.className = "mmwx-lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");

    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";

    var cap = document.createElement("figcaption");
    cap.textContent = captionFor(img);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "mmwx-lightbox-close";
    close.setAttribute("aria-label", "关闭");
    close.textContent = "×";

    box.appendChild(close);
    box.appendChild(big);
    if (cap.textContent) box.appendChild(cap);
    document.body.appendChild(box);
    document.body.style.overflow = "hidden";

    function dismiss() {
      document.removeEventListener("keydown", onKey);
      box.remove();
      document.body.style.overflow = "";
    }
    function onKey(e) {
      if (e.key === "Escape") dismiss();
    }
    box.addEventListener("click", dismiss);
    document.addEventListener("keydown", onKey);
    close.focus();
  }

  document.addEventListener("click", function (e) {
    var img =
      e.target instanceof Element
        ? e.target.closest(".sl-markdown-content p > img:only-child")
        : null;
    if (!img || img.closest("a") || img.closest(".not-content")) return;
    e.preventDefault();
    open(img);
  });
})();
