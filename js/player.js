// ============================================================
// DEAD STREETS — Player
// ============================================================

class Player {
  constructor() {
    this.name       = 'SOBREVIVENTE';
    this.maxHp      = STARTING_HP;
    this.hp         = STARTING_HP;
    this.block      = 0;
    this.energy     = MAX_ENERGY;
    this.maxEnergy  = MAX_ENERGY;
    this.gold       = 20;
    this.statuses   = {};

    // Deck management
    this.deck       = buildStartingDeck();
    this.hand       = [];
    this.discard    = [];

    // Equipment
    this.weapon     = createWeapon('kitchen_knife');

    // Inventory (consumable items, max 4 slots)
    this.inventory  = [
      createItem('bandage'),
      createItem('bandage'),
    ];

    // Relics (passive bonuses)
    this.relics     = [];

    // Relic-driven stat modifiers
    this.atkBonus   = 0;    // bonus damage added to attack cards
    this.blockBonus = 0;    // bonus block added to defense cards
    this.startBlock = 0;    // block gained at start of each combat
    this.thornsPoison  = false; // poison counter-attack relic
    this.killAtkBonus  = false; // bonus ATK per kill relic

    // Run statistics
    this.stats = {
      kills: 0,
      damageDealt: 0,
      damageTaken: 0,
      floors: 0,
    };
  }

  // ── Combat methods ──────────────────────────────────────────

  // Called at the start of the player's turn (after enemy turn)
  startTurn() {
    this.energy = this.maxEnergy;
    this.block = 0;           // block resets each turn
    return tickStatuses(this); // returns array of status messages
  }

  isStunned() {
    return hasStatus(this, STATUS.STUN);
  }

  // ── Deck management ─────────────────────────────────────────

  shuffleDiscardIntoDeck() {
    this.deck = shuffle([...this.discard]);
    this.discard = [];
  }

  drawCards(n) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
      if (this.deck.length === 0) {
        if (this.discard.length === 0) break;
        this.shuffleDiscardIntoDeck();
      }
      if (this.deck.length === 0) break;
      drawn.push(this.deck.pop());
    }
    this.hand.push(...drawn);
    return drawn;
  }

  discardHand() {
    this.discard.push(...this.hand);
    this.hand = [];
  }

  discardCard(idx) {
    const [card] = this.hand.splice(idx, 1);
    if (card) this.discard.push(card);
    return card;
  }

  addCardToDeck(card) {
    this.deck.push({ ...card });
    this.deck = shuffle(this.deck);
  }

  removeCardFromDeck(idx) {
    // idx into full deck (deck + discard shown at rest)
    const full = [...this.deck, ...this.discard];
    if (idx < 0 || idx >= full.length) return null;
    const card = full.splice(idx, 1)[0];
    // Rebuild deck and discard without removed card
    this.deck    = full.slice(0, this.deck.length);
    this.discard = full.slice(this.deck.length);
    return card;
  }

  // ── Inventory / items ───────────────────────────────────────

  addItem(item) {
    if (this.inventory.length < 4) {
      this.inventory.push(item);
      return true;
    }
    return false;
  }

  useItem(idx, combat) {
    const item = this.inventory[idx];
    if (!item) return false;
    item.use(this, combat);
    this.inventory.splice(idx, 1);
    return true;
  }

  // ── Relics ──────────────────────────────────────────────────

  addRelic(relic) {
    this.relics.push(relic);
    if (relic.onAcquire) relic.onAcquire(this);
    Audio.playFanfare();
    EventBus.emit('log', `Relic adquirida: ${relic.name}`);
  }

  // Call at start of each new combat
  applyCombatStartRelics() {
    this.block = this.startBlock;
  }

  // Call when a zombie is killed
  onKill() {
    this.stats.kills++;
    if (this.killAtkBonus) {
      this.atkBonus += 2;
    }
  }

  // ── Misc ────────────────────────────────────────────────────

  heal(amount) {
    const actual = Math.min(amount, this.maxHp - this.hp);
    this.hp += actual;
    return actual;
  }

  takeDamage(raw) {
    const dmg = applyDamage(this, raw);
    this.stats.damageTaken += dmg;
    if (dmg > 0) {
      // Counter-attack with poison if relic is equipped
      // (caller must check thornsPoison and apply to attacker)
    }
    return dmg;
  }

  isAlive() {
    return this.hp > 0;
  }

  // Full deck + discard (for display at Rest/Shop)
  allCards() {
    return [...this.deck, ...this.discard];
  }
}
