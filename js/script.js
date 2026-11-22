/**
 * Tanmay Dawande — Portfolio
 * Minimal, lightweight scripts.
 */

(function () {
  "use strict";

  const projects = [
    {
      title: "babel-tcp",
      description: "A CLI client-server chat with length-prefixed packet framing and hybrid encryption - RSA implemented from raw math, used to bootstrap a 256-bit AES-GCM session.",
      tags: ["Python", "Sockets", "RSA", "AES-GCM"],
      url: "https://github.com/TanmayDawande/babel-tcp",
      link: "https://github.com/TanmayDawande/babel-tcp",
    },
    {
      title: "vigil-ids",
      description: "Machine learning network intrusion detector on CIC-IDS-2017, evaluated by file split to avoid leakage. work in progress.",
      tags: ["Python", "Machine Learning", "Network Security"],
      url: "https://github.com/TanmayDawande/vigil-ids",
      link: "https://github.com/TanmayDawande/vigil-ids",
    },
    {
      title: "quizgenai",
      description: "Generate a quiz from a PPT/PPTX or a PDF or a YouTube video or even a link.",
      tags: ["Python", "AI", "Streamlit"],
      url: "https://github.com/TanmayDawande/quizgenai",
      link: "https://github.com/TanmayDawande/quizgenai",
    },
    {
      title: "Vitian-auto-signin",
      description: "Headless authentication daemon for university campus captive portals with session persistence.",
      tags: ["Python", "Automation", "Network Auth"],
      url: "https://github.com/TanmayDawande/Vitian-auto-signin",
      link: "https://github.com/TanmayDawande/Vitian-auto-signin",
    },
    {
      title: "HandTracker",
      description: "Real-time computer vision pipeline tracking hand landmarks for low-latency gesture recognition.",
      tags: ["Python", "OpenCV", "MediaPipe"],
      url: "https://github.com/TanmayDawande/HandTracker",
      link: "https://github.com/TanmayDawande/HandTracker",
    },
  ];

  const escapeHtml = (val) =>
    String(val ?? "").replace(/[&<>'"]/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }[c]));

  function renderProjects(itemsToRender = projects) {
    const grid = document.querySelector("#project-grid");
    if (!grid) return;

    const limit = grid.dataset.limit ? Number(grid.dataset.limit) : itemsToRender.length;
    const items = itemsToRender.slice(0, limit);

    grid.innerHTML = items
      .map(
        (p) => `
        <a class="project-card" href="${escapeHtml(p.url || p.link)}" target="_blank" rel="noopener noreferrer">
          <div class="card-header">
            <span class="card-title">${escapeHtml(p.title)}</span>
            <span class="card-arrow">↗</span>
          </div>
          <p class="card-desc">${escapeHtml(p.description)}</p>
          <div class="card-tags">
            ${(p.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </a>
      `
      )
      .join("");
  }

  function initYear() {
    document.querySelectorAll("#year").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function initAsciiField() {
    if (document.getElementById("ascii-bg")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "ascii-bg";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const chars = [".", "+", "*", "·", "~"];
    const density = 0.00004;
    const count = Math.max(12, Math.floor(width * height * density));
    const points = [];

    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: 0.15 + Math.random() * 0.25,
        alpha: 0.1 + Math.random() * 0.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.font = "12px monospace";
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fillText(p.char, p.x, p.y);
      }
    }

    draw();

    if (prefersReducedMotion) {
      return;
    }

    function animate() {
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      }
      draw();
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      draw();
    });
  }

  function init() {
    initAsciiField();
    initYear();

    // On blog routes (where #project-grid does not exist), do not execute project DOM queries
    const isBlogRoute = /[\/\\]blog(\.html|[\/\\]|$)/i.test(window.location.pathname);
    if (!isBlogRoute) {
      renderProjects();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
