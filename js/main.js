// ============================================================
// DEAD STREETS — Bootstrap
// ============================================================

(function() {
  'use strict';

  let lastTime = 0;

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime), 100); // cap at 100ms
    lastTime = timestamp;

    Game.update(dt);
    Game.render();

    requestAnimationFrame(loop);
  }

  window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas not found!');
      return;
    }

    // Set canvas pixel dimensions
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;

    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Prevent arrow key scrolling
    window.addEventListener('keydown', function(e) {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Init game
    Game.init(canvas);

    // Start loop
    requestAnimationFrame(loop);

    console.log('DEAD STREETS — Loaded successfully!');
    console.log('Controls: Click to navigate | 1-6 to play cards | Enter to end turn | Tab to change target');
  });
})();
