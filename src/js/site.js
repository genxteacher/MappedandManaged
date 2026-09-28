/* Small progressive enhancements. Everything works without this file. */
(function () {
  document.documentElement.classList.add("js");

  // Mobile menu: the header collapses to one line with a Menu button.
  var btn = document.querySelector(".menu-btn");
  var header = document.querySelector(".site-header");
  if (btn && header) {
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  // Product gallery: thumbnails switch the main stage between the cover and the video.
  document.querySelectorAll("[data-gallery]").forEach(function (g) {
    var thumbs = g.querySelectorAll("[data-show]");
    var slides = g.querySelectorAll("[data-slide]");
    slides.forEach(function (s, i) { s.hidden = i > 0; });
    g.classList.add("gallery--ready");
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("data-show");
        slides.forEach(function (s) {
          var on = s.getAttribute("data-slide") === id;
          s.hidden = !on;
          if (!on) { var v = s.querySelector("video"); if (v) v.pause(); }
        });
        thumbs.forEach(function (x) { x.setAttribute("aria-pressed", x === t ? "true" : "false"); });
      });
    });
  });
})();
