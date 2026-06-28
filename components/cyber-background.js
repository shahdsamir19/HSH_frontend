/**
 * ============================================================
 *  HACK-SHIELD HEROES — CYBER BACKGROUND
 *  cyber-background.js — Injects animated cyberpunk background
 * ============================================================
 *
 *  USAGE:
 *    <link rel="stylesheet" href="components/cyber-background.css">
 *    <script src="components/cyber-background.js"></script>
 *
 *  Automatically injects animated background elements.
 *  Does NOT affect page content — purely decorative layer.
 * ============================================================
 */
(function () {
  'use strict';

  function init() {
    // Add base class to body
    document.body.classList.add('cyber-bg-base');

    // Create the background container
    const container = document.createElement('div');
    container.id = 'cyber-bg-container';

    // Gradient overlay
    const gradient = document.createElement('div');
    gradient.className = 'cyber-bg-gradient';
    container.appendChild(gradient);

    // Animated grid
    const grid = document.createElement('div');
    grid.className = 'cyber-bg-grid';
    container.appendChild(grid);

    // Glowing orbs
    const orbPurple = document.createElement('div');
    orbPurple.className = 'cyber-bg-orb cyber-bg-orb-purple';
    container.appendChild(orbPurple);

    const orbCyan = document.createElement('div');
    orbCyan.className = 'cyber-bg-orb cyber-bg-orb-cyan';
    container.appendChild(orbCyan);

    // Canvas for network nodes
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Floating particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'cyber-bg-particles';

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('span');
      particle.className = 'cyber-bg-particle';
      const hue = Math.random() > 0.5 ? 185 : 280;
      const size = 2 + Math.random() * 3;
      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 10 + Math.random() * 14;

      particle.style.cssText = `
        left: ${left}%;
        bottom: 0;
        width: ${size}px;
        height: ${size}px;
        background: hsl(${hue}, 100%, 60%);
        box-shadow: 0 0 8px hsl(${hue}, 100%, 60%);
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;
      particlesContainer.appendChild(particle);
    }
    container.appendChild(particlesContainer);

    // Insert at beginning of body (behind all content)
    document.body.insertBefore(container, document.body.firstChild);

    // ── Canvas animation (network nodes) ──
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            ctx.strokeStyle = `hsla(185, 100%, 60%, ${0.18 * (1 - d / 140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.fillStyle = 'hsla(185, 100%, 70%, 0.85)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(raf);
    });
  }

  /* ── BOOT ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
