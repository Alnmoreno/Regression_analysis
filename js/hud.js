// ============================================================
// DEAD STREETS — HUD (Heads-Up Display)
// ============================================================

const HUD = {
  // Card button regions (for click detection)
  _cardRects: [],
  _itemRects: [],
  _endTurnBtn: { x: 680, y: 528, w: 110, h: 38 },
  _targetBtns: [],

  // ── Combat top bar ─────────────────────────────────────────

  renderCombatTop(R, player, turn, phase) {
    // Background bar
    R.fillRect(0, 0, CANVAS_W, 55);
    R.fillRect(0, 0, CANVAS_W, 55, PALETTE.BG_PANEL);
    R.fillRect(0, 54, CANVAS_W, 2, PALETTE.UI_BORDER);

    // HP bar
    R.drawText('HP', 10, 8, PALETTE.UI_TEXT, 1);
    R.drawHPBar(30, 6, 130, 12, player.hp, player.maxHp);
    R.drawText(`${player.hp}/${player.maxHp}`, 166, 8, PALETTE.WHITE, 1);

    // Block
    if (player.block > 0) {
      R.fillRect(240, 4, 55, 16, PALETTE.STEEL_BLUE);
      R.drawText(`BLK:${player.block}`, 244, 8, PALETTE.WHITE, 1);
    }

    // Energy
    R.drawText('ENERGIA', 305, 8, PALETTE.UI_TEXT, 1);
    R.drawEnergyPips(372, 6, player.energy, player.maxEnergy);

    // Gold
    R.fillRect(485, 4, 70, 16, PALETTE.DARK_BROWN);
    R.drawText(`OURO:${player.gold}`, 489, 8, PALETTE.GOLD, 1);

    // Turn & Phase
    const phaseLabel = phase === COMBAT_PHASE.PLAYER_TURN  ? 'SEU TURNO'
                     : phase === COMBAT_PHASE.ENEMY_TURN   ? 'INIMIGOS...'
                     : phase === COMBAT_PHASE.VICTORY      ? 'VITORIA!'
                     : phase === COMBAT_PHASE.DEFEAT       ? 'DERROTADO!'
                     : '...';
    const phaseColor = phase === COMBAT_PHASE.PLAYER_TURN  ? PALETTE.HP_GREEN
                     : phase === COMBAT_PHASE.ENEMY_TURN   ? PALETTE.BLOOD_RED
                     : phase === COMBAT_PHASE.VICTORY      ? PALETTE.YELLOW
                     : PALETTE.LIGHT_GRAY;
    R.drawText(`T${turn} ${phaseLabel}`, 570, 8, phaseColor, 1);

    // Player status effects (bottom of top bar)
    let ox = 10;
    Object.entries(player.statuses || {}).forEach(([key, eff]) => {
      const cols = {
        [STATUS.BURN]:   PALETTE.ORANGE,
        [STATUS.POISON]: PALETTE.TOXIC_GREEN,
        [STATUS.BLEED]:  PALETTE.BLOOD_RED,
        [STATUS.STUN]:   PALETTE.YELLOW,
        [STATUS.REGEN]:  PALETTE.HP_GREEN,
      };
      R.fillRect(ox, 34, 22, 14, cols[key] || PALETTE.DARK_GRAY);
      R.drawText(`${key.slice(0,3).toUpperCase()}${eff.stacks}`, ox + 1, 37, PALETTE.BLACK, 1);
      ox += 25;
    });

    // Relics strip
    player.relics.forEach((relic, i) => {
      const rx = 650 + i * 24;
      R.fillRect(rx, 4, 20, 20, PALETTE.DARK_BROWN);
      R.strokeRect(rx, 4, 20, 20, PALETTE.GOLD, 1);
      R.drawSprite(relic.spriteKey, rx + 2, 6, 2);
    });

    // Inventory (consumable items) - small icons at right
    player.inventory.forEach((item, i) => {
      const ix = 558 + i * 28;
      R.fillRect(ix, 30, 24, 18, PALETTE.DARK_BROWN);
      R.strokeRect(ix, 30, 24, 18, PALETTE.UI_BORDER);
      if (item.spriteKey) R.drawSprite(item.spriteKey, ix + 1, 31, 2);
      R.drawText(`${i+1}`, ix + 2, 43, PALETTE.LIGHT_GRAY, 1);
    });
    this._itemRects = player.inventory.map((_, i) => ({
      x: 558 + i * 28, y: 30, w: 24, h: 18,
    }));
  },

  // ── Hand of cards ──────────────────────────────────────────

  renderHand(R, hand, energy, phase) {
    const isPlayerTurn = phase === COMBAT_PHASE.PLAYER_TURN;

    // Hand background bar
    R.fillRect(0, 520, CANVAS_W, 80, PALETTE.BG_PANEL);
    R.fillRect(0, 520, CANVAS_W, 2, PALETTE.UI_BORDER);

    // Card layout
    const cardW  = 95;
    const cardH  = 60;
    const gap    = 10;
    const totalW = Math.min(hand.length, 6) * (cardW + gap) - gap;
    const startX = Math.floor((CANVAS_W - totalW - 120) / 2); // leave room for end turn btn
    const cardY  = 525;

    this._cardRects = [];

    hand.forEach((card, i) => {
      if (i >= 6) return;  // max 6 cards shown
      const cx = startX + i * (cardW + gap);
      const canPlay = isPlayerTurn && card.cost <= energy;
      const bgCol = canPlay ? card.color || PALETTE.DARK_GRAY : PALETTE.DARK_GRAY;

      R.fillRect(cx, cardY, cardW, cardH, bgCol);
      R.strokeRect(cx, cardY, cardW, cardH,
                   canPlay ? PALETTE.WHITE : PALETTE.MID_GRAY, 2);

      // Card name
      R.drawText(card.name.slice(0, 8), cx + 4, cardY + 5, PALETTE.WHITE, 1);

      // Cost pips
      for (let p = 0; p < card.cost; p++) {
        R.fillRect(cx + 4 + p * 8, cardY + 15, 6, 6,
                   p < energy ? PALETTE.ENERGY_BLUE : PALETTE.DARK_GRAY);
      }
      if (card.cost === 0) {
        R.drawText('FREE', cx + 4, cardY + 15, PALETTE.BRIGHT_BLUE, 1);
      }

      // Description
      const descLines = this._wrapText(card.description, 9);
      descLines.forEach((line, li) => {
        R.drawText(line, cx + 4, cardY + 28 + li * 8,
                   canPlay ? PALETTE.OFF_WHITE : PALETTE.LIGHT_GRAY, 1);
      });

      // Hover indicator (number key)
      R.drawText(`${i + 1}`, cx + cardW - 10, cardY + 3, PALETTE.BILE_YELLOW, 1);

      this._cardRects.push({ x: cx, y: cardY, w: cardW, h: cardH });
    });

    // End turn button
    const etb = this._endTurnBtn;
    R.fillRect(etb.x, etb.y, etb.w, etb.h,
               isPlayerTurn ? PALETTE.BLOOD_RED : PALETTE.DARK_GRAY);
    R.strokeRect(etb.x, etb.y, etb.w, etb.h,
                 isPlayerTurn ? PALETTE.WHITE : PALETTE.UI_BORDER, 2);
    R.drawTextCentered(
      isPlayerTurn ? 'ENCERRAR' : '...',
      etb.x + etb.w / 2,
      etb.y + (etb.h - 7) / 2,
      PALETTE.WHITE, 1
    );

    // Deck/discard count
    R.drawText(`DECK:${Combat.player ? Combat.player.deck.length : 0}`,
               680, 505, PALETTE.UI_TEXT, 1);
    R.drawText(`DESC:${Combat.player ? Combat.player.discard.length : 0}`,
               740, 505, PALETTE.LIGHT_GRAY, 1);
  },

  // ── Card reward screen ─────────────────────────────────────

  renderCardPick(R, cards, player) {
    R.fillRect(0, 0, CANVAS_W, CANVAS_H, PALETTE.BG_DARK);
    R.drawTextCentered('ESCOLHA UMA CARTA', CANVAS_W / 2, 40, PALETTE.YELLOW, 3);
    R.drawTextCentered('(ou pressione ESC para nenhuma)', CANVAS_W / 2, 80, PALETTE.LIGHT_GRAY, 1);

    const cardW = 160;
    const cardH = 210;
    const gap   = 30;
    const total = cards.length * (cardW + gap) - gap;
    const sx    = Math.floor((CANVAS_W - total) / 2);

    this._cardRects = [];

    cards.forEach((card, i) => {
      const cx = sx + i * (cardW + gap);
      const cy = 120;

      R.fillRect(cx, cy, cardW, cardH, card.color || PALETTE.DARK_GRAY);
      R.strokeRect(cx, cy, cardW, cardH, PALETTE.WHITE, 2);

      R.drawTextCentered(card.name, cx + cardW / 2, cy + 12, PALETTE.WHITE, 2);

      // Cost
      R.fillRect(cx + 6, cy + 30, 20, 14, PALETTE.ENERGY_BLUE);
      R.drawText(`${card.cost}E`, cx + 8, cy + 33, PALETTE.WHITE, 1);

      // Type
      R.drawText(card.type.toUpperCase(), cx + 34, cy + 33, PALETTE.BILE_YELLOW, 1);

      // Description (word-wrapped)
      const lines = this._wrapText(card.description, 14);
      lines.forEach((line, li) => {
        R.drawText(line, cx + 8, cy + 60 + li * 14, PALETTE.OFF_WHITE, 1);
      });

      // Click area
      this._cardRects.push({ x: cx, y: cy, w: cardW, h: cardH });
    });

    // Skip button
    R.fillRect(330, 370, 140, 35, PALETTE.DARK_BROWN);
    R.strokeRect(330, 370, 140, 35, PALETTE.UI_BORDER, 2);
    R.drawTextCentered('PULAR', 400, 381, PALETTE.LIGHT_GRAY, 2);
  },

  // ── Helpers ────────────────────────────────────────────────

  _wrapText(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    words.forEach(word => {
      if ((current + word).length > maxChars) {
        if (current) lines.push(current.trim());
        current = word + ' ';
      } else {
        current += word + ' ';
      }
    });
    if (current.trim()) lines.push(current.trim());
    return lines;
  },

  // ── Click detection ─────────────────────────────────────────

  getClickedCard(mx, my) {
    return this._cardRects.findIndex(r =>
      mx >= r.x && mx <= r.x + r.w &&
      my >= r.y && my <= r.y + r.h
    );
  },

  clickedEndTurn(mx, my) {
    const b = this._endTurnBtn;
    return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  },

  getClickedItem(mx, my) {
    return this._itemRects.findIndex(r =>
      mx >= r.x && mx <= r.x + r.w &&
      my >= r.y && my <= r.y + r.h
    );
  },

  clickedSkipCardPick(mx, my) {
    return mx >= 330 && mx <= 470 && my >= 370 && my <= 405;
  },
};
