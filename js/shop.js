// ============================================================
// DEAD STREETS — Shop
// ============================================================

const Shop = {
  stock:    [],
  player:   null,
  _msgQueue: [],
  _continueBtn: { x: 300, y: 540, w: 200, h: 40 },
  _deckView: false,

  generate(player) {
    this.player = player;
    this._msgQueue = [];
    this._deckView = false;

    const items = [];

    // 1 random weapon (not kitchen knife)
    const wpnId = pick(WEAPON_IDS);
    items.push({ type: 'weapon', obj: createWeapon(wpnId), price: WEAPON_DEFS[wpnId].value });

    // 2 random consumables
    const itemId1 = pick(ITEM_IDS);
    const itemId2 = pick(ITEM_IDS.filter(id => id !== itemId1));
    items.push({ type: 'item', obj: createItem(itemId1), price: ITEM_DEFS[itemId1].value });
    items.push({ type: 'item', obj: createItem(itemId2), price: ITEM_DEFS[itemId2].value });

    // 2 random cards
    const cardPick = pickN([...CARD_POOL], 2);
    cardPick.forEach(id => {
      items.push({ type: 'card', obj: { ...CARD_DEFS[id] }, price: 50 });
    });

    // 1 relic
    const relicId = pick(RELIC_IDS);
    items.push({ type: 'relic', obj: createRelic(relicId), price: 80 });

    // Card removal service
    items.push({ type: 'remove_card', obj: null, price: 75, label: 'REMOVER CARTA' });

    this.stock = items;
  },

  buy(idx) {
    const entry = this.stock[idx];
    if (!entry) return false;
    if (this.player.gold < entry.price) {
      this._msgQueue.push('Sem ouro suficiente!');
      Audio.playClick();
      return false;
    }

    this.player.gold -= entry.price;
    let msg = '';

    switch (entry.type) {
      case 'weapon':
        this.player.weapon = entry.obj;
        msg = `Equipou: ${entry.obj.name}!`;
        break;
      case 'item':
        if (!this.player.addItem(entry.obj)) {
          this.player.gold += entry.price; // refund
          this._msgQueue.push('Inventario cheio!');
          return false;
        }
        msg = `Comprou: ${entry.obj.name}!`;
        break;
      case 'card':
        this.player.addCardToDeck(entry.obj);
        msg = `Carta adicionada: ${entry.obj.name}!`;
        break;
      case 'relic':
        this.player.addRelic(entry.obj);
        msg = `Relic adquirida: ${entry.obj.name}!`;
        break;
      case 'remove_card':
        this._deckView = true;
        this.player.gold += entry.price; // hold gold until removal confirmed
        return true;
    }

    this.stock.splice(idx, 1);
    this._msgQueue.push(msg);
    Audio.playClick();
    return true;
  },

  removeCard(cardIdx) {
    const removed = this.player.removeCardFromDeck(cardIdx);
    if (removed) {
      this._msgQueue.push(`Carta removida: ${removed.name}`);
      this._deckView = false;
      // Consume the gold (already was held; re-deduct the removal cost)
      this.player.gold -= 75;
    }
  },

  // ── Rendering ──────────────────────────────────────────────

  render(R) {
    R.fillRect(0, 0, CANVAS_W, CANVAS_H, PALETTE.BG_DARK);
    R.fillRect(0, 0, CANVAS_W, 50, PALETTE.BG_PANEL);
    R.fillRect(0, 50, CANVAS_W, 2, PALETTE.UI_BORDER);

    R.drawTextCentered('LOJA DO SOBREVIVENTE', CANVAS_W / 2, 15, PALETTE.GOLD, 2);
    R.drawText(`OURO: ${this.player.gold}`, 620, 15, PALETTE.GOLD, 2);

    if (this._deckView) {
      this._renderDeckView(R);
      return;
    }

    // Message
    if (this._msgQueue.length > 0) {
      R.fillRect(0, 53, CANVAS_W, 18, '#223322');
      R.drawTextCentered(this._msgQueue[this._msgQueue.length - 1],
                         CANVAS_W / 2, 57, PALETTE.HP_GREEN, 1);
    }

    // Stock items (2 per row)
    const itemW = 175;
    const itemH = 80;
    const cols  = 4;
    const gap   = 10;
    const startX = 10;
    const startY = 78;

    this._stockRects = [];
    this.stock.forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = startX + col * (itemW + gap);
      const iy = startY + row * (itemH + gap);

      const canAfford = this.player.gold >= entry.price;
      const bg = canAfford ? PALETTE.BG_PANEL : '#1a1010';
      const border = canAfford ? PALETTE.UI_HIGHLIGHT : PALETTE.DARK_GRAY;

      R.fillRect(ix, iy, itemW, itemH, bg);
      R.strokeRect(ix, iy, itemW, itemH, border, 2);

      // Type tag
      const typeColors = {
        weapon: PALETTE.BLOOD_RED,
        item:   PALETTE.HP_GREEN,
        card:   PALETTE.STEEL_BLUE,
        relic:  PALETTE.GOLD,
        remove_card: PALETTE.DARK_GRAY,
      };
      R.fillRect(ix + 2, iy + 2, 28, 10, typeColors[entry.type] || PALETTE.DARK_GRAY);
      R.drawText(entry.type.slice(0, 3).toUpperCase(), ix + 3, iy + 3, PALETTE.WHITE, 1);

      // Name
      const name = entry.label || (entry.obj && entry.obj.name) || '???';
      R.drawText(name.slice(0, 16), ix + 4, iy + 18, PALETTE.WHITE, 1);

      // Description
      const desc = entry.obj ? (entry.obj.description || '') : 'Remova 1 carta do seu deck.';
      const lines = desc.slice(0, 60).match(/.{1,20}/g) || [];
      lines.slice(0, 2).forEach((line, li) => {
        R.drawText(line, ix + 4, iy + 32 + li * 10, PALETTE.LIGHT_GRAY, 1);
      });

      // Price
      const priceColor = canAfford ? PALETTE.GOLD : PALETTE.DARK_GRAY;
      R.drawText(`${entry.price}G`, ix + itemW - 32, iy + itemH - 14, priceColor, 1);

      this._stockRects.push({ x: ix, y: iy, w: itemW, h: itemH });
    });

    // Weapon display
    if (this.player.weapon) {
      R.fillRect(0, 440, CANVAS_W, 30, PALETTE.BG_PANEL);
      R.drawText(`ARMA ATUAL: ${this.player.weapon.name}  DMG BONUS:+${this.player.weapon.dmgBonus}`,
                 10, 450, PALETTE.BILE_YELLOW, 1);
    }

    // Continue button
    const btn = this._continueBtn;
    R.fillRect(btn.x, btn.y, btn.w, btn.h, PALETTE.BLOOD_RED);
    R.strokeRect(btn.x, btn.y, btn.w, btn.h, PALETTE.WHITE, 2);
    R.drawTextCentered('SAIR DA LOJA', btn.x + btn.w / 2, btn.y + 14, PALETTE.WHITE, 2);
  },

  _renderDeckView(R) {
    R.fillRect(0, 55, CANVAS_W, CANVAS_H - 55, PALETTE.BG_PANEL);
    R.drawTextCentered('ESCOLHA UMA CARTA PARA REMOVER (-75 ouro)',
                       CANVAS_W / 2, 65, PALETTE.YELLOW, 1);

    const cards = this.player.allCards();
    const cardW = 100;
    const cardH = 55;
    const cols  = 7;
    const gap   = 8;
    const sx    = 10;
    const sy    = 82;

    this._deckCardRects = [];
    cards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx  = sx + col * (cardW + gap);
      const cy  = sy + row * (cardH + gap);

      R.fillRect(cx, cy, cardW, cardH, card.color || PALETTE.DARK_GRAY);
      R.strokeRect(cx, cy, cardW, cardH, PALETTE.WHITE, 1);
      R.drawText(card.name.slice(0, 10), cx + 3, cy + 5, PALETTE.WHITE, 1);
      R.drawText(`CUSTO:${card.cost}`, cx + 3, cy + 18, PALETTE.ENERGY_BLUE, 1);
      R.drawText(card.type.toUpperCase(), cx + 3, cy + 30, PALETTE.BILE_YELLOW, 1);
      R.drawText(`${i + 1}`, cx + cardW - 10, cy + 3, PALETTE.YELLOW, 1);

      this._deckCardRects.push({ x: cx, y: cy, w: cardW, h: cardH });
    });

    // Cancel button
    R.fillRect(300, 520, 200, 35, PALETTE.DARK_BROWN);
    R.strokeRect(300, 520, 200, 35, PALETTE.UI_BORDER, 2);
    R.drawTextCentered('CANCELAR', 400, 532, PALETTE.LIGHT_GRAY, 2);
  },

  // ── Input ───────────────────────────────────────────────────

  handleClick(mx, my) {
    if (this._deckView) {
      // Cancel deck view
      if (mx >= 300 && mx <= 500 && my >= 520 && my <= 555) {
        this._deckView = false;
        this.player.gold += 75; // not charged if cancelled
        return false;
      }
      // Click card to remove
      const idx = (this._deckCardRects || []).findIndex(r =>
        mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
      );
      if (idx >= 0) this.removeCard(idx);
      return false;
    }

    // Continue / leave shop
    const btn = this._continueBtn;
    if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
      return true; // signal: go back to map
    }

    // Buy item
    const idx = (this._stockRects || []).findIndex(r =>
      mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    );
    if (idx >= 0) this.buy(idx);
    return false;
  },
};
