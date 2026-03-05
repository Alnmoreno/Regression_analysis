// ============================================================
// DEAD STREETS — Game State Machine
// ============================================================

const Game = {
  state:    GAME_STATE.MENU,
  player:   null,
  _tick:    0,
  _inputBound: false,

  // ── Initialisation ─────────────────────────────────────────

  init(canvas) {
    Renderer.init(canvas);
    Audio.init();
    this._bindInput(canvas);

    // Make Game accessible globally for Map to read player
    window.Game = this;

    this.setState(GAME_STATE.MENU);
  },

  // ── State machine ──────────────────────────────────────────

  setState(newState, payload) {
    this.state = newState;

    switch (newState) {
      case GAME_STATE.MENU:
        break;

      case GAME_STATE.MAP:
        if (!this.player) {
          this.player = new Player();
          Map.generate(Date.now());
        }
        break;

      case GAME_STATE.COMBAT: {
        const node = Map.getCurrentNode();
        const floor = node ? node.row : 0;
        const enemyIds = zombiesForNode(node ? node.type : NODE_TYPE.COMBAT, floor);
        Combat.start(
          this.player,
          enemyIds,
          floor,
          (result) => this._onCombatVictory(result),
          ()       => this._onCombatDefeat()
        );
        break;
      }

      case GAME_STATE.CARD_PICK:
        // rewardCards already set in Combat after victory
        break;

      case GAME_STATE.EVENT:
        Events.start(this.player);
        break;

      case GAME_STATE.SHOP:
        Shop.generate(this.player);
        break;

      case GAME_STATE.REST:
        break;

      case GAME_STATE.WIN:
      case GAME_STATE.LOSE:
        break;
    }
  },

  // ── Combat callbacks ───────────────────────────────────────

  _onCombatVictory(_result) {
    Map.markCurrentCleared();
    this.player.stats.floors++;
    // Go to card pick screen
    this.setState(GAME_STATE.CARD_PICK);
  },

  _onCombatDefeat() {
    this.setState(GAME_STATE.LOSE);
  },

  // ── Node navigation ────────────────────────────────────────

  travelTo(nodeId) {
    if (!Map.canTravel(nodeId)) return;

    if (!Map.travelTo(nodeId)) return;
    Audio.playClick();

    const node = Map.getCurrentNode();
    if (!node) return;

    switch (node.type) {
      case NODE_TYPE.COMBAT:
      case NODE_TYPE.ELITE:
      case NODE_TYPE.BOSS:
        this.setState(GAME_STATE.COMBAT);
        break;
      case NODE_TYPE.EVENT:
        this.setState(GAME_STATE.EVENT);
        break;
      case NODE_TYPE.SHOP:
        this.setState(GAME_STATE.SHOP);
        break;
      case NODE_TYPE.REST:
        this.setState(GAME_STATE.REST);
        break;
      default:
        this.setState(GAME_STATE.MAP);
    }
  },

  // ── Update loop ────────────────────────────────────────────

  update(dt) {
    this._tick++;
    if (this.state === GAME_STATE.COMBAT) {
      Combat.update(dt);
    }
  },

  // ── Render dispatch ────────────────────────────────────────

  render() {
    switch (this.state) {
      case GAME_STATE.MENU:      this._renderMenu();      break;
      case GAME_STATE.MAP:       Map.render(Renderer);    break;
      case GAME_STATE.COMBAT:    Combat.render(Renderer); break;
      case GAME_STATE.CARD_PICK: this._renderCardPick();  break;
      case GAME_STATE.EVENT:     Events.render(Renderer); break;
      case GAME_STATE.SHOP:      Shop.render(Renderer);   break;
      case GAME_STATE.REST:      this._renderRest();      break;
      case GAME_STATE.WIN:       this._renderWin();       break;
      case GAME_STATE.LOSE:      this._renderLose();      break;
    }
  },

  // ── Screen renderers ───────────────────────────────────────

  _renderMenu() {
    Renderer.clear(PALETTE.BG_DARK);

    // Sky gradient (simulate with bands)
    Renderer.fillRect(0, 0, CANVAS_W, 300, '#0a0a1a');
    Renderer.fillRect(0, 150, CANVAS_W, 150, '#0f0f20');

    // Building silhouettes
    const bldgs = [
      { x: 0,   w: 110, h: 220 },
      { x: 120, w: 80,  h: 300 },
      { x: 220, w: 140, h: 180 },
      { x: 380, w: 70,  h: 270 },
      { x: 470, w: 120, h: 210 },
      { x: 610, w: 90,  h: 290 },
      { x: 715, w: 85,  h: 200 },
    ];
    bldgs.forEach(b => {
      Renderer.fillRect(b.x, 300 - b.h, b.w, b.h + 200, '#111111');
      // Windows
      for (let wy = 300 - b.h + 10; wy < 310; wy += 20) {
        for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 14) {
          Renderer.fillRect(wx, wy, 6, 8,
            Math.random() > 0.6 ? '#332200' : '#080808');
        }
      }
    });

    // Moon
    Renderer.fillRect(700, 20, 50, 50, '#d8d8c8');
    Renderer.fillRect(718, 16, 38, 60, '#0a0a1a');

    // Ground
    Renderer.fillRect(0, 350, CANVAS_W, 250, '#1a1208');

    // Title
    Renderer.drawTextCentered('DEAD STREETS', CANVAS_W / 2, 90, PALETTE.BLOOD_RED, 7);

    // Subtitle
    Renderer.drawTextCentered('ZOMBIE SURVIVAL ROGUELIKE', CANVAS_W / 2, 190, PALETTE.OFF_WHITE, 2);

    // Player sprite in scene
    Renderer.drawSprite('player', 360, 310, 5);

    // Walkers approaching
    Renderer.drawSprite('zombie_walker', 520, 330, 4, true);
    Renderer.drawSprite('zombie_walker', 590, 340, 3, true);
    Renderer.drawSprite('zombie_brute',  650, 310, 4, true);

    // Blink effect for click to start
    if (Math.floor(this._tick / 30) % 2 === 0) {
      Renderer.drawTextCentered('CLIQUE PARA COMECAR', CANVAS_W / 2, 475, PALETTE.BILE_YELLOW, 2);
    }

    // Credits
    Renderer.drawText('v1.0  DEAD STREETS  2024', 10, CANVAS_H - 15, PALETTE.DARK_GRAY, 1);

    // Controls hint
    Renderer.drawText('WASD/MOUSE: NAVEGACAO  |  NUMEROS: CARTAS  |  ENTER: ENCERRAR TURNO',
                      10, CANVAS_H - 28, PALETTE.DARK_GRAY, 1);
  },

  _renderCardPick() {
    HUD.renderCardPick(Renderer, Combat.rewardCards, this.player);
  },

  _renderRest() {
    Renderer.clear(PALETTE.BG_DARK);
    Renderer.fillRect(0, 0, CANVAS_W, CANVAS_H, '#0f1a0f');

    Renderer.drawTextCentered('ABRIGO SEGURO', CANVAS_W / 2, 60, PALETTE.HP_GREEN, 4);
    Renderer.drawTextCentered('Voce encontra um momento de paz.', CANVAS_W / 2, 130, PALETTE.OFF_WHITE, 2);

    // Player sprite
    Renderer.drawSprite('player', 370, 200, 6);

    const healAmt = Math.floor(this.player.maxHp * 0.3);
    const fullHeal = this.player.maxHp - this.player.hp;

    // Heal button
    Renderer.fillRect(180, 330, 440, 55, '#1a3a1a');
    Renderer.strokeRect(180, 330, 440, 55, PALETTE.HP_GREEN, 2);
    Renderer.drawTextCentered(`DESCANSAR E CURAR (+${Math.min(healAmt, fullHeal)} HP)`,
                              CANVAS_W / 2, 348, PALETTE.HP_GREEN, 2);
    Renderer.drawTextCentered(`HP: ${this.player.hp}/${this.player.maxHp}`,
                              CANVAS_W / 2, 364, PALETTE.LIGHT_GRAY, 1);

    // Remove card button
    Renderer.fillRect(180, 400, 440, 55, '#1a1a3a');
    Renderer.strokeRect(180, 400, 440, 55, PALETTE.STEEL_BLUE, 2);
    Renderer.drawTextCentered('ESTUDAR (REMOVER 1 CARTA DO DECK)',
                              CANVAS_W / 2, 418, PALETTE.BRIGHT_BLUE, 2);

    // Continue button
    Renderer.fillRect(280, 470, 240, 45, PALETTE.DARK_GRAY);
    Renderer.strokeRect(280, 470, 240, 45, PALETTE.UI_BORDER, 2);
    Renderer.drawTextCentered('CONTINUAR SEM DESCANSAR', CANVAS_W / 2, 487, PALETTE.LIGHT_GRAY, 1);
  },

  _renderWin() {
    Renderer.clear('#0f1a0f');
    Renderer.drawTextCentered('VOCE SOBREVIVEU!', CANVAS_W / 2, 100, PALETTE.HP_GREEN, 5);
    Renderer.drawTextCentered('O Titan de Carne foi destruido.', CANVAS_W / 2, 200, PALETTE.OFF_WHITE, 2);
    Renderer.drawTextCentered('A cidade... ainda e sua.', CANVAS_W / 2, 230, PALETTE.OFF_WHITE, 2);

    if (this.player) {
      Renderer.drawText(`ZUMBIS MORTOS: ${this.player.stats.kills}`, 250, 310, PALETTE.BLOOD_RED, 2);
      Renderer.drawText(`ANDARES: ${this.player.stats.floors}`, 250, 340, PALETTE.BILE_YELLOW, 2);
      Renderer.drawText(`OURO COLETADO: ${this.player.gold}`, 250, 370, PALETTE.GOLD, 2);
      Renderer.drawText(`HP FINAL: ${this.player.hp}/${this.player.maxHp}`, 250, 400, PALETTE.HP_GREEN, 2);
    }

    Renderer.drawSprite('player', 350, 280, 8);

    if (Math.floor(this._tick / 30) % 2 === 0) {
      Renderer.drawTextCentered('CLIQUE PARA JOGAR NOVAMENTE', CANVAS_W / 2, 480, PALETTE.YELLOW, 2);
    }
  },

  _renderLose() {
    Renderer.clear(PALETTE.BG_DARK);
    Renderer.fillRect(0, 0, CANVAS_W, CANVAS_H, '#1a0000');
    Renderer.drawTextCentered('VOCE CAIU', CANVAS_W / 2, 100, PALETTE.BLOOD_RED, 6);
    Renderer.drawTextCentered('A horda te engoliu.', CANVAS_W / 2, 200, PALETTE.OFF_WHITE, 2);

    if (this.player) {
      Renderer.drawText(`ZUMBIS MORTOS: ${this.player.stats.kills}`, 250, 280, PALETTE.LIGHT_GRAY, 2);
      Renderer.drawText(`ANDARES SOBREVIVIDOS: ${this.player.stats.floors}`, 250, 310, PALETTE.LIGHT_GRAY, 2);
    }

    // Dead player sprite (tinted red via overlay)
    Renderer.drawSprite('zombie_walker', 355, 300, 6);

    if (Math.floor(this._tick / 30) % 2 === 0) {
      Renderer.drawTextCentered('CLIQUE PARA TENTAR NOVAMENTE', CANVAS_W / 2, 480, PALETTE.BRIGHT_RED, 2);
    }
  },

  // ── Rest screen helpers ────────────────────────────────────

  _restHeal() {
    const amount = Math.floor(this.player.maxHp * 0.3);
    const healed = this.player.heal(amount);
    Audio.playHeal();
    return healed;
  },

  _restDeckViewActive: false,
  _restDeckRects: [],

  _renderRestDeckView(R) {
    R.fillRect(50, 80, CANVAS_W - 100, CANVAS_H - 160, PALETTE.BG_PANEL);
    R.strokeRect(50, 80, CANVAS_W - 100, CANVAS_H - 160, PALETTE.STEEL_BLUE, 2);
    R.drawTextCentered('ESCOLHA UMA CARTA PARA REMOVER', CANVAS_W / 2, 95, PALETTE.BRIGHT_BLUE, 2);

    const cards = this.player.allCards();
    const cardW = 95, cardH = 50, cols = 7, gap = 6, sx = 60, sy = 120;

    this._restDeckRects = [];
    cards.forEach((card, i) => {
      const cx = sx + (i % cols) * (cardW + gap);
      const cy = sy + Math.floor(i / cols) * (cardH + gap);
      R.fillRect(cx, cy, cardW, cardH, card.color || PALETTE.DARK_GRAY);
      R.strokeRect(cx, cy, cardW, cardH, PALETTE.WHITE, 1);
      R.drawText(card.name.slice(0, 10), cx + 3, cy + 5, PALETTE.WHITE, 1);
      R.drawText(`${card.cost}E ${card.type.slice(0,3)}`, cx + 3, cy + 18, PALETTE.ENERGY_BLUE, 1);
      this._restDeckRects.push({ x: cx, y: cy, w: cardW, h: cardH });
    });

    R.fillRect(300, CANVAS_H - 90, 200, 32, PALETTE.DARK_BROWN);
    R.strokeRect(300, CANVAS_H - 90, 200, 32, PALETTE.UI_BORDER, 2);
    R.drawTextCentered('CANCELAR', 400, CANVAS_H - 80, PALETTE.LIGHT_GRAY, 2);
  },

  // ── Input binding ──────────────────────────────────────────

  _bindInput(canvas) {
    if (this._inputBound) return;
    this._inputBound = true;

    canvas.addEventListener('click', (e) => {
      Audio.resume();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;
      this._handleClick(mx, my);
    });

    document.addEventListener('keydown', (e) => {
      this._handleKey(e.key, e.code);
    });
  },

  _handleClick(mx, my) {
    switch (this.state) {
      // ── Menu ──
      case GAME_STATE.MENU:
        this.player = null;
        Map.nodes = [];
        this.setState(GAME_STATE.MAP);
        break;

      // ── Map ──
      case GAME_STATE.MAP: {
        const clicked = Map.getClickedNode(mx, my);
        if (clicked) this.travelTo(clicked.id);
        break;
      }

      // ── Combat ──
      case GAME_STATE.COMBAT: {
        if (Combat.phase !== COMBAT_PHASE.PLAYER_TURN) break;

        // End turn button
        if (HUD.clickedEndTurn(mx, my)) {
          Combat.endTurn();
          break;
        }

        // Item click
        const itemIdx = HUD.getClickedItem(mx, my);
        if (itemIdx >= 0) {
          Combat.useItem(itemIdx);
          break;
        }

        // Card click
        const cardIdx = HUD.getClickedCard(mx, my);
        if (cardIdx >= 0) {
          Combat.playCard(cardIdx);
          break;
        }

        // Target selection (click on enemy area)
        Combat.enemies.forEach((_, i) => {
          const ex = 420 + i * 140 + (Combat.enemies.length === 1 ? 60 : 0);
          if (mx >= ex - 30 && mx <= ex + 80 && my >= 200 && my <= 420) {
            Combat.selectTarget(i);
          }
        });
        break;
      }

      // ── Card pick ──
      case GAME_STATE.CARD_PICK: {
        if (HUD.clickedSkipCardPick(mx, my)) {
          this.setState(GAME_STATE.MAP);
          break;
        }
        const ci = HUD.getClickedCard(mx, my);
        if (ci >= 0 && Combat.rewardCards[ci]) {
          this.player.addCardToDeck(Combat.rewardCards[ci]);
          Audio.playCardDraw();
          this.setState(GAME_STATE.MAP);
        }
        break;
      }

      // ── Event ──
      case GAME_STATE.EVENT: {
        const done = Events.handleClick(mx, my);
        if (done) {
          Map.markCurrentCleared();
          this.setState(GAME_STATE.MAP);
        }
        break;
      }

      // ── Shop ──
      case GAME_STATE.SHOP: {
        const done = Shop.handleClick(mx, my);
        if (done) {
          Map.markCurrentCleared();
          this.setState(GAME_STATE.MAP);
        }
        break;
      }

      // ── Rest ──
      case GAME_STATE.REST: {
        // Check if rest deck view active
        if (this._restDeckViewActive) {
          if (mx >= 300 && mx <= 500 && my >= CANVAS_H - 90 && my <= CANVAS_H - 58) {
            this._restDeckViewActive = false;
          } else {
            const idx = (this._restDeckRects || []).findIndex(r =>
              mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
            );
            if (idx >= 0) {
              this.player.removeCardFromDeck(idx);
              Audio.playClick();
              this._restDeckViewActive = false;
              Map.markCurrentCleared();
              this.setState(GAME_STATE.MAP);
            }
          }
          break;
        }

        // Heal button
        if (my >= 330 && my <= 385 && mx >= 180 && mx <= 620) {
          this._restHeal();
          Map.markCurrentCleared();
          this.setState(GAME_STATE.MAP);
          break;
        }
        // Remove card button
        if (my >= 400 && my <= 455 && mx >= 180 && mx <= 620) {
          this._restDeckViewActive = true;
          break;
        }
        // Continue button
        if (my >= 470 && my <= 515) {
          Map.markCurrentCleared();
          this.setState(GAME_STATE.MAP);
        }
        break;
      }

      // ── Win / Lose ──
      case GAME_STATE.WIN:
      case GAME_STATE.LOSE:
        this.player = null;
        Map.nodes = [];
        this.setState(GAME_STATE.MENU);
        break;
    }
  },

  _handleKey(key, _code) {
    switch (this.state) {
      case GAME_STATE.MENU:
        if (key === ' ' || key === 'Enter') {
          this.player = null; Map.nodes = [];
          this.setState(GAME_STATE.MAP);
        }
        break;

      case GAME_STATE.COMBAT:
        if (Combat.phase !== COMBAT_PHASE.PLAYER_TURN) break;
        // Number keys 1–6: play card
        const n = parseInt(key);
        if (n >= 1 && n <= 6) {
          Combat.playCard(n - 1);
        }
        if (key === 'Enter' || key === ' ') {
          Combat.endTurn();
        }
        if (key === 'Tab') {
          Combat.selectTarget((Combat.selectedTarget + 1) % Math.max(1, Combat.enemies.length));
        }
        break;

      case GAME_STATE.CARD_PICK:
        if (key === 'Escape') this.setState(GAME_STATE.MAP);
        break;

      case GAME_STATE.WIN:
      case GAME_STATE.LOSE:
        if (key === ' ' || key === 'Enter') {
          this.player = null; Map.nodes = [];
          this.setState(GAME_STATE.MENU);
        }
        break;
    }
  },

  // ── Render rest screen (override to handle deck view) ──────

  _renderRestOverride(R) {
    if (this._restDeckViewActive) {
      this._renderRest();
      this._renderRestDeckView(R);
    } else {
      this._renderRest();
    }
  },
};

// Override the render function to handle rest deck view
const _origRender = Game.render.bind(Game);
Game.render = function() {
  if (this.state === GAME_STATE.REST && this._restDeckViewActive) {
    this._renderRest();
    this._renderRestDeckView(Renderer);
  } else {
    _origRender();
  }
};
