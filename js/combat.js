// ============================================================
// DEAD STREETS — Combat Engine
// ============================================================

const Combat = {
  player:    null,
  enemies:   [],
  floor:     0,
  phase:     null,
  turn:      0,
  hand:      [],   // alias to player.hand for card access
  messages:  [],
  log:       [],   // full log
  animQueue: [],   // { fn, delay, elapsed } timed events
  flashEffect: null,
  rewardCards: [],  // cards to choose from after victory
  selectedTarget: 0,
  onVictory: null,
  onDefeat:  null,

  // ── Initialisation ─────────────────────────────────────────

  start(player, enemyIds, floor, onVictory, onDefeat) {
    this.player   = player;
    this.floor    = floor || 0;
    this.enemies  = enemyIds.map(id => createZombie(id, floor));
    this.phase    = COMBAT_PHASE.PLAYER_TURN;
    this.turn     = 1;
    this.messages = [];
    this.log      = [];
    this.animQueue = [];
    this.flashEffect = null;
    this.rewardCards = [];
    this.selectedTarget = 0;
    this.onVictory = onVictory;
    this.onDefeat  = onDefeat;

    // Reset player for combat
    player.hand    = [];
    player.discard = [];
    player.deck    = shuffle(player.allCards().map(c => ({...c})));
    player.energy  = player.maxEnergy;
    player.block   = 0;
    player.applyCombatStartRelics();

    // Start player turn (draw hand)
    this._beginPlayerTurn();

    // Play boss music if titan
    if (enemyIds.includes('titan')) {
      Audio.playBossAppear();
    } else {
      Audio.playZombieGrowl();
    }
  },

  // ── Game loop hooks ─────────────────────────────────────────

  update(dt) {
    // Tick flash effect
    if (this.flashEffect) {
      this.flashEffect.elapsed = (this.flashEffect.elapsed || 0) + dt;
      if (this.flashEffect.elapsed >= this.flashEffect.duration) {
        this.flashEffect = null;
      }
    }

    // Process anim queue
    if (this.animQueue.length > 0) {
      const ev = this.animQueue[0];
      ev.elapsed = (ev.elapsed || 0) + dt;
      if (ev.elapsed >= (ev.delay || 0)) {
        this.animQueue.shift();
        if (ev.fn) ev.fn();
      }
    }
  },

  // ── Player actions ─────────────────────────────────────────

  playCard(cardIdx) {
    if (this.phase !== COMBAT_PHASE.PLAYER_TURN) return false;
    const card = this.player.hand[cardIdx];
    if (!card) return false;
    if (card.cost > this.player.energy) {
      EventBus.emit('combat_msg', 'Sem energia!');
      Audio.playClick();
      return false;
    }

    this.player.energy -= card.cost;
    const target = this.enemies[this.selectedTarget] || this.enemies[0];
    card.use(this.player, target, this);

    // Remove card from hand, put in discard
    this.player.hand.splice(cardIdx, 1);
    this.player.discard.push(card);

    Audio.playCardPlay();

    // Check for deaths after card play
    this._checkEnemyDeaths();
    this._checkPlayerDeath();
    return true;
  },

  useItem(itemIdx) {
    if (this.phase !== COMBAT_PHASE.PLAYER_TURN) return false;
    const item = this.player.inventory[itemIdx];
    if (!item) return false;
    item.use(this.player, this);
    this.player.inventory.splice(itemIdx, 1);
    this._checkPlayerDeath();
    return true;
  },

  endTurn() {
    if (this.phase !== COMBAT_PHASE.PLAYER_TURN) return;
    this.phase = COMBAT_PHASE.ENEMY_TURN;
    this.player.discardHand();
    this._runEnemyTurns();
  },

  selectTarget(idx) {
    if (idx >= 0 && idx < this.enemies.length) {
      this.selectedTarget = idx;
    }
  },

  // Public draw helper (used by cards like Burst, War Cry)
  drawCards(n) {
    this.player.drawCards(n);
  },

  // ── Enemy AI ───────────────────────────────────────────────

  _runEnemyTurns() {
    const enemyCopy = [...this.enemies];
    let delay = 400;

    // First tick status effects on enemies
    this._queueFn(() => {
      enemyCopy.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const msgs = tickStatuses(enemy);
        msgs.forEach(m => this._addMsg(m));
      });
      this._checkEnemyDeaths();
    }, 100);

    // Each enemy executes its action
    enemyCopy.forEach((enemy, _i) => {
      this._queueFn(() => {
        if (enemy.hp <= 0) return;
        checkZombieSpecials(enemy, this.player, this);
        executeZombieAction(enemy, this.player, this);
        this._checkPlayerDeath();
        if (!this.player.isAlive()) return;
        this._checkEnemyDeaths();
      }, delay);
      delay += 600;
    });

    // Return to player turn
    this._queueFn(() => {
      if (this.phase === COMBAT_PHASE.ENEMY_TURN) {
        this._beginPlayerTurn();
      }
    }, delay);
  },

  _beginPlayerTurn() {
    this.turn++;
    this.phase = COMBAT_PHASE.PLAYER_TURN;

    // Tick player status effects
    const msgs = tickStatuses(this.player);
    msgs.forEach(m => this._addMsg(m));
    this._checkPlayerDeath();
    if (this.phase === COMBAT_PHASE.DEFEAT) return;

    // Restore energy and draw hand
    this.player.energy = this.player.maxEnergy;
    this.player.block  = 0;

    // Check stun
    if (hasStatus(this.player, STATUS.STUN)) {
      this._addMsg('Voce esta atordoado! Turno pulado!');
      this.endTurn();
      return;
    }

    this.player.drawCards(HAND_SIZE);
    this._addMsg(`--- TURNO ${this.turn} ---`);
  },

  // ── Death handling ─────────────────────────────────────────

  _checkEnemyDeaths() {
    const dead = this.enemies.filter(e => e.hp <= 0);
    dead.forEach(enemy => {
      checkZombieOnDeath(enemy, this.player, this);
      const loot = generateZombieLoot(enemy);
      this.player.gold += loot.gold;
      this.player.onKill();
      this._addMsg(`${enemy.name} destruido! +${loot.gold} ouro`);
      Audio.playZombieDeath();
    });
    this.enemies = this.enemies.filter(e => e.hp > 0);

    if (this.enemies.length === 0) {
      this._victory();
    }
  },

  _checkPlayerDeath() {
    if (!this.player.isAlive()) {
      this._defeat();
    }
  },

  _victory() {
    if (this.phase === COMBAT_PHASE.VICTORY || this.phase === COMBAT_PHASE.DEFEAT) return;
    this.phase = COMBAT_PHASE.VICTORY;
    this._addMsg('VITORIA!');
    Audio.playVictory();
    this.player.discardHand();

    // Prepare card rewards
    this.rewardCards = pickCardRewards(this.player.allCards());

    // Delay then callback
    this._queueFn(() => {
      if (this.onVictory) this.onVictory({ gold: 0 });
    }, 800);
  },

  _defeat() {
    if (this.phase === COMBAT_PHASE.DEFEAT) return;
    this.phase = COMBAT_PHASE.DEFEAT;
    this._addMsg('VOCE CAIU...');
    Audio.playDeath();
    this._queueFn(() => {
      if (this.onDefeat) this.onDefeat();
    }, 1500);
  },

  // ── Helpers ────────────────────────────────────────────────

  _addMsg(msg) {
    this.messages.push(msg);
    this.log.push(msg);
    if (this.messages.length > 5) this.messages.shift();
  },

  _queueFn(fn, delay) {
    this.animQueue.push({ fn, delay, elapsed: 0 });
  },

  // ── Rendering ──────────────────────────────────────────────

  render(R) {
    this._drawBackground(R);
    this._drawEnemies(R);
    this._drawPlayer(R);
    this._drawMessageLog(R);
    this._drawHand(R);
    this._drawHUD(R);

    // Flash effect
    if (this.flashEffect) {
      const prog = this.flashEffect.elapsed / this.flashEffect.duration;
      R.flashScreen(this.flashEffect.color, this.flashEffect.alpha * (1 - prog));
    }
  },

  _drawBackground(R) {
    R.fillRect(0, 0, CANVAS_W, CANVAS_H, PALETTE.BG_DARK);
    // Ground
    R.fillRect(0, 420, CANVAS_W, 180, '#1a1208');
    // Road cracks
    for (let x = 0; x < CANVAS_W; x += 50) {
      R.fillRect(x, 425, 35, 3, '#2a2208');
    }
    // Buildings silhouette
    const buildings = [
      { x: 0,   w: 120, h: 200 },
      { x: 140, w: 90,  h: 280 },
      { x: 250, w: 110, h: 170 },
      { x: 380, w: 70,  h: 240 },
      { x: 470, w: 140, h: 200 },
      { x: 630, w: 100, h: 260 },
      { x: 740, w: 60,  h: 180 },
    ];
    buildings.forEach(b => {
      R.fillRect(b.x, 420 - b.h, b.w, b.h, '#1a1a1a');
      // Windows
      for (let wy = 420 - b.h + 15; wy < 420 - 20; wy += 22) {
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 16) {
          const lit = ((wx * 7 + wy * 13) % 10) > 7;
          R.fillRect(wx, wy, 7, 9, lit ? '#443322' : '#0a0a0a');
        }
      }
    });
    // Moon
    R.fillRect(720, 30, 40, 40, '#d8d8c8');
    R.fillRect(730, 28, 25, 45, '#0a0a0f');
  },

  _drawEnemies(R) {
    const maxEnemies = this.enemies.length;
    this.enemies.forEach((enemy, i) => {
      const ex = 420 + i * 140 + (maxEnemies === 1 ? 60 : 0);
      const ey = 220;
      const scale = enemy.id === 'titan' ? 6 : 5;

      // Highlight selected target
      if (i === this.selectedTarget) {
        R.fillRect(ex - 5, ey - 5, SPRITES[enemy.spriteKey][0].length * scale + 10,
                   SPRITES[enemy.spriteKey].length * scale + 10, '#33220011');
        R.strokeRect(ex - 4, ey - 4, SPRITES[enemy.spriteKey][0].length * scale + 8,
                     SPRITES[enemy.spriteKey].length * scale + 8, PALETTE.YELLOW, 2);
      }

      R.drawSprite(enemy.spriteKey, ex, ey, scale, true);

      // HP bar above enemy
      const barW = 60;
      const barX = ex + (SPRITES[enemy.spriteKey][0].length * scale / 2) - barW / 2;
      R.drawHPBar(barX, ey - 22, barW, 8, enemy.hp, enemy.maxHp);
      R.drawTextCentered(`${enemy.hp}`, barX + barW / 2, ey - 22, PALETTE.WHITE, 1);

      // Enemy name
      R.drawTextCentered(enemy.name, ex + SPRITES[enemy.spriteKey][0].length * scale / 2,
                         ey - 35, PALETTE.BILE_YELLOW, 1);

      // Block indicator
      if (enemy.block > 0) {
        R.drawText(`BLK:${enemy.block}`, ex, ey - 48, PALETTE.BRIGHT_BLUE, 1);
      }

      // Intent label
      const intent = getZombieIntent(enemy);
      if (intent) {
        const ic = intent.type === 'attack' ? PALETTE.BLOOD_RED
                 : intent.type === 'block'  ? PALETTE.STEEL_BLUE
                 : PALETTE.BILE_YELLOW;
        R.drawTextCentered(intent.label,
                           ex + SPRITES[enemy.spriteKey][0].length * scale / 2,
                           ey + SPRITES[enemy.spriteKey].length * scale + 8,
                           ic, 1);
      }

      // Status effect pills
      this._drawStatusPills(R, enemy, ex, ey + SPRITES[enemy.spriteKey].length * scale + 20);
    });
  },

  _drawPlayer(R) {
    const px = 80;
    const py = 250;
    const spriteKey = this.phase === COMBAT_PHASE.PLAYER_TURN ? 'player' : 'player_attack';
    R.drawSprite(spriteKey, px, py, 5);

    // Block indicator
    if (this.player.block > 0) {
      R.fillRect(px - 5, py - 30, 55, 14, PALETTE.STEEL_BLUE);
      R.drawText(`BLK:${this.player.block}`, px, py - 28, PALETTE.WHITE, 1);
    }
  },

  _drawMessageLog(R) {
    R.fillRect(0, 390, CANVAS_W, 30, '#0a0a0f');
    const recent = this.messages.slice(-4);
    recent.forEach((msg, i) => {
      const alpha = (i + 1) / recent.length;
      R.drawText(msg, 10, 394 + i * 7, PALETTE.UI_TEXT, 1);
    });
  },

  _drawHand(R) {
    HUD.renderHand(R, this.player.hand, this.player.energy, this.phase);
  },

  _drawHUD(R) {
    HUD.renderCombatTop(R, this.player, this.turn, this.phase);
  },

  _drawStatusPills(R, entity, x, y) {
    let ox = 0;
    Object.entries(entity.statuses || {}).forEach(([key, eff]) => {
      const colors = {
        [STATUS.BURN]:   PALETTE.ORANGE,
        [STATUS.POISON]: PALETTE.TOXIC_GREEN,
        [STATUS.BLEED]:  PALETTE.BLOOD_RED,
        [STATUS.STUN]:   PALETTE.YELLOW,
        [STATUS.REGEN]:  PALETTE.HP_GREEN,
        [STATUS.RAGE]:   PALETTE.BRIGHT_RED,
        [STATUS.ARMOR]:  PALETTE.STEEL_BLUE,
      };
      R.fillRect(x + ox, y, 18, 9, colors[key] || PALETTE.MID_GRAY);
      R.drawText(fmt(eff.stacks), x + ox + 1, y + 2, PALETTE.BLACK, 1);
      ox += 20;
    });
  },
};

// Listen for combat messages
EventBus.on('combat_msg', msg => Combat._addMsg(msg));
EventBus.on('screen_flash', ({ color, alpha }) => {
  Combat.flashEffect = { color, alpha, elapsed: 0, duration: 400 };
});
