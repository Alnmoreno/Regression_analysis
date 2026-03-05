// ============================================================
// DEAD STREETS — Pixel Art Renderer
// ============================================================

const Renderer = {
  canvas: null,
  ctx: null,
  // Simple 5×7 pixel font (uppercase + digits + punctuation)
  // Each char: 5-wide bitmask rows
  _font: {
    'A':[[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'B':[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
    'C':[[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
    'D':[[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0]],
    'E':[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    'F':[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
    'G':[[0,1,1,1,1],[1,0,0,0,0],[1,0,0,1,1],[1,0,0,0,1],[0,1,1,1,1]],
    'H':[[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'I':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
    'J':[[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'K':[[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0]],
    'L':[[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'N':[[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    'O':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'P':[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
    'Q':[[0,1,1,1,0],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
    'R':[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0]],
    'S':[[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
    'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'U':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'V':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
    'W':[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
    'X':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    'Y':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'Z':[[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
    '0':[[0,1,1,1,0],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[0,1,1,1,0]],
    '1':[[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    '2':[[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,1,1,1,1]],
    '3':[[1,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
    '4':[[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
    '5':[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
    '6':[[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
    '7':[[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
    '8':[[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
    '9':[[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
    ' ':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    '!':[[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
    ':':[[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    '/':[[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0]],
    '-':[[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
    '+':[[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0]],
    '.':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0]],
    '?':[[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[0,0,0,0,0],[0,0,1,0,0]],
    '(':[[0,0,1,1,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,1,1,0]],
    ')':[[0,1,1,0,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,1,1,0,0]],
    '*':[[1,0,1,0,1],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1]],
    '#':[[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0]],
    '%':[[1,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,1]],
    '_':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1]],
  },

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  },

  clear(color) {
    this.ctx.fillStyle = color || PALETTE.BG_DARK;
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  },

  // Draw a pixel-art sprite
  // spriteKey: key in SPRITES object
  // x, y: top-left canvas position
  // scale: px per sprite-pixel
  // flipX: horizontal mirror
  drawSprite(spriteKey, x, y, scale, flipX) {
    scale = scale || 4;
    const sprite = SPRITES[spriteKey];
    if (!sprite) return;
    const ctx = this.ctx;
    const cols = sprite[0].length;

    sprite.forEach((row, py) => {
      row.forEach((color, px) => {
        if (!color) return;
        const dx = flipX ? x + (cols - 1 - px) * scale : x + px * scale;
        ctx.fillStyle = color;
        ctx.fillRect(dx, y + py * scale, scale, scale);
      });
    });
  },

  // Draw a filled rectangle
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  },

  // Draw a rectangle outline
  strokeRect(x, y, w, h, color, thickness) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness || 1;
    this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  },

  // Draw a line (pixel-art style: series of filled squares)
  drawLine(x0, y0, x1, y1, color, lineW) {
    lineW = lineW || 2;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineW;
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  },

  // Draw pixel-art text
  // scale: size of each font pixel (1 = tiny, 2 = small, 3 = medium)
  drawText(text, x, y, color, scale) {
    scale = scale || 1;
    color = color || PALETTE.WHITE;
    const ctx = this.ctx;
    let cx = Math.floor(x);

    for (const ch of text.toString().toUpperCase()) {
      const charData = this._font[ch] || this._font['?'];
      charData.forEach((row, ry) => {
        row.forEach((px, rx) => {
          if (!px) return;
          ctx.fillStyle = color;
          ctx.fillRect(cx + rx * scale, y + ry * scale, scale, scale);
        });
      });
      cx += 6 * scale;
    }
  },

  // Measure text width in pixels
  measureText(text, scale) {
    scale = scale || 1;
    return text.length * 6 * scale;
  },

  // Draw centered text
  drawTextCentered(text, cx, y, color, scale) {
    const w = this.measureText(text, scale);
    this.drawText(text, cx - w / 2, y, color, scale);
  },

  // Draw an HP bar
  drawHPBar(x, y, w, h, current, max, colorFull, colorEmpty) {
    colorEmpty = colorEmpty || PALETTE.HP_EMPTY;
    const pct = clamp(current / max, 0, 1);
    const filledW = Math.floor(w * pct);
    // Determine bar color based on HP percentage
    let col = colorFull;
    if (!col) {
      col = pct > 0.5 ? PALETTE.HP_GREEN
          : pct > 0.25 ? PALETTE.HP_YELLOW
          : PALETTE.HP_RED;
    }
    this.fillRect(x, y, w, h, colorEmpty);
    if (filledW > 0) this.fillRect(x, y, filledW, h, col);
    this.strokeRect(x, y, w, h, PALETTE.UI_BORDER);
  },

  // Draw an energy bar (pips)
  drawEnergyPips(x, y, current, max) {
    for (let i = 0; i < max; i++) {
      const filled = i < current;
      this.fillRect(x + i * 14, y, 11, 11, filled ? PALETTE.ENERGY_BLUE : PALETTE.DARK_GRAY);
      this.strokeRect(x + i * 14, y, 11, 11, PALETTE.UI_BORDER);
    }
  },

  // Screen-space flash (damage taken, heal, etc.)
  flashScreen(color, alpha) {
    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    this.ctx.globalAlpha = 1.0;
  },

  // Draw a rounded-ish panel (just a rect with a slightly lighter border)
  drawPanel(x, y, w, h, bgColor, borderColor) {
    this.fillRect(x, y, w, h, bgColor || PALETTE.UI_BG);
    this.strokeRect(x, y, w, h, borderColor || PALETTE.UI_BORDER, 2);
  },

  // Draw a button with label
  drawButton(x, y, w, h, label, textColor, bgColor, borderColor, textScale) {
    textScale = textScale || 1;
    this.fillRect(x, y, w, h, bgColor || PALETTE.DARK_GRAY);
    this.strokeRect(x, y, w, h, borderColor || PALETTE.UI_BORDER, 2);
    const tw = this.measureText(label, textScale);
    const tx = x + Math.floor((w - tw) / 2);
    const ty = y + Math.floor((h - 5 * textScale) / 2);
    this.drawText(label, tx, ty, textColor || PALETTE.WHITE, textScale);
  },

  // Draw a vertical progress bar (used for charge indicators, etc.)
  drawVertBar(x, y, w, h, pct, color) {
    const filledH = Math.floor(h * clamp(pct, 0, 1));
    this.fillRect(x, y, w, h, PALETTE.DARK_GRAY);
    this.fillRect(x, y + h - filledH, w, filledH, color);
    this.strokeRect(x, y, w, h, PALETTE.UI_BORDER);
  },
};
