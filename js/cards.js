// ============================================================
// DEAD STREETS — Card System
// ============================================================

// ── CARD DEFINITIONS ───────────────────────────────────────────
const CARD_DEFS = {
  // Starting cards
  strike: {
    id: 'strike',
    name: 'GOLPE',
    cost: 1,
    type: 'attack',
    baseDmg: 6,
    description: '6 dano.',
    color: PALETTE.BLOOD_RED,
    use(player, target, combat) {
      const dmg = this.baseDmg + player.atkBonus;
      const actual = applyDamage(target, dmg);
      if (player.weapon && player.weapon.onHit) player.weapon.onHit(target);
      EventBus.emit('combat_msg', `${this.name}: -${actual} HP`);
      Audio.playAttack();
      EventBus.emit('screen_flash', { color: PALETTE.BLOOD_RED, alpha: 0.15 });
    },
  },
  defend: {
    id: 'defend',
    name: 'DEFENDER',
    cost: 1,
    type: 'defense',
    baseBlock: 5,
    description: '5 bloco.',
    color: PALETTE.STEEL_BLUE,
    use(player, _target, _combat) {
      const block = this.baseBlock + player.blockBonus;
      player.block += block;
      EventBus.emit('combat_msg', `${this.name}: +${block} bloco`);
      Audio.playBlock();
    },
  },
  charge: {
    id: 'charge',
    name: 'INVESTIDA',
    cost: 2,
    type: 'attack',
    baseDmg: 14,
    description: '14 dano.',
    color: PALETTE.BRIGHT_RED,
    use(player, target, _combat) {
      const dmg = this.baseDmg + player.atkBonus;
      const actual = applyDamage(target, dmg);
      EventBus.emit('combat_msg', `${this.name}: -${actual} HP`);
      Audio.playAttack();
    },
  },
  bandage_card: {
    id: 'bandage_card',
    name: 'BANDAGEM',
    cost: 1,
    type: 'skill',
    healAmt: 8,
    description: 'Cura 8 HP.',
    color: PALETTE.HP_GREEN,
    use(player, _target, _combat) {
      const heal = Math.min(this.healAmt, player.maxHp - player.hp);
      player.hp += heal;
      EventBus.emit('combat_msg', `${this.name}: +${heal} HP`);
      Audio.playHeal();
    },
  },

  // Unlockable cards
  double_strike: {
    id: 'double_strike',
    name: 'GOLPE DUPLO',
    cost: 1,
    type: 'attack',
    baseDmg: 4,
    description: '4 dano duas vezes.',
    color: PALETTE.BLOOD_RED,
    use(player, target, _combat) {
      let total = 0;
      for (let i = 0; i < 2; i++) {
        const actual = applyDamage(target, this.baseDmg + player.atkBonus);
        total += actual;
      }
      EventBus.emit('combat_msg', `${this.name}: -${total} HP total`);
      Audio.playAttack();
    },
  },
  bloody_cut: {
    id: 'bloody_cut',
    name: 'CORTE SANGRENTO',
    cost: 1,
    type: 'attack',
    baseDmg: 7,
    description: '7 dano + Sangramento(3) por 4 turnos.',
    color: PALETTE.DARK_RED,
    use(player, target, _combat) {
      const dmg = applyDamage(target, this.baseDmg + player.atkBonus);
      applyStatus(target, STATUS.BLEED, 3, 4);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP + Sangramento!`);
      Audio.playAttack();
    },
  },
  barricade: {
    id: 'barricade',
    name: 'BARRICADA',
    cost: 2,
    type: 'defense',
    baseBlock: 14,
    description: '14 bloco.',
    color: PALETTE.STEEL_BLUE,
    use(player, _target, _combat) {
      const block = this.baseBlock + player.blockBonus;
      player.block += block;
      EventBus.emit('combat_msg', `${this.name}: +${block} bloco`);
      Audio.playBlock();
    },
  },
  burst: {
    id: 'burst',
    name: 'RAJADA',
    cost: 2,
    type: 'attack',
    baseDmg: 8,
    description: '8 dano, compra 1 carta.',
    color: PALETTE.RUST,
    use(player, target, combat) {
      const dmg = applyDamage(target, this.baseDmg + player.atkBonus);
      combat.drawCards(1);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP + Compra 1!`);
      Audio.playAttack();
      Audio.playCardDraw();
    },
  },
  molotov_card: {
    id: 'molotov_card',
    name: 'MOLOTOV',
    cost: 2,
    type: 'skill',
    baseDmg: 15,
    description: '15 dano + Fogo(4) por 3 turnos.',
    color: PALETTE.ORANGE,
    use(player, target, _combat) {
      const dmg = applyDamage(target, this.baseDmg + player.atkBonus);
      applyStatus(target, STATUS.BURN, 4, 3);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP + Fogo!`);
      Audio.playFire();
      EventBus.emit('screen_flash', { color: PALETTE.ORANGE, alpha: 0.3 });
    },
  },
  adrenaline_card: {
    id: 'adrenaline_card',
    name: 'ADRENALINA',
    cost: 0,
    type: 'skill',
    description: '+2 energia este turno.',
    color: PALETTE.BRIGHT_BLUE,
    use(player, _target, _combat) {
      player.energy += 2;
      EventBus.emit('combat_msg', `${this.name}: +2 Energia!`);
      Audio.playLevelUp();
    },
  },
  frenzy: {
    id: 'frenzy',
    name: 'FRENESI',
    cost: 2,
    type: 'attack',
    description: '5 dano x cartas na mao.',
    color: PALETTE.BRIGHT_RED,
    use(player, target, combat) {
      const mult = combat.hand.length;
      const dmg = applyDamage(target, 5 * mult + player.atkBonus);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP (x${mult} cartas)!`);
      Audio.playAttack();
    },
  },
  improvised_shield: {
    id: 'improvised_shield',
    name: 'ESCUDO IMPROVISADO',
    cost: 3,
    type: 'defense',
    baseBlock: 22,
    description: '22 bloco + compra 2 cartas.',
    color: PALETTE.ENERGY_BLUE,
    use(player, _target, combat) {
      const block = this.baseBlock + player.blockBonus;
      player.block += block;
      combat.drawCards(2);
      EventBus.emit('combat_msg', `${this.name}: +${block} bloco + Compra 2!`);
      Audio.playBlock();
      Audio.playCardDraw();
    },
  },
  grenade_card: {
    id: 'grenade_card',
    name: 'GRANADA',
    cost: 3,
    type: 'skill',
    baseDmg: 30,
    description: '30 dano + Stun 1 turno.',
    color: PALETTE.DARK_GRAY,
    use(player, target, _combat) {
      const dmg = applyDamage(target, this.baseDmg + player.atkBonus);
      applyStatus(target, STATUS.STUN, 1, 1);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP + Stun!`);
      Audio.playExplosion();
      EventBus.emit('screen_flash', { color: PALETTE.ORANGE, alpha: 0.5 });
    },
  },
  emergency_heal: {
    id: 'emergency_heal',
    name: 'CURA EMERGENCIAL',
    cost: 2,
    type: 'skill',
    healAmt: 22,
    description: 'Cura 22 HP.',
    color: PALETTE.HP_GREEN,
    use(player, _target, _combat) {
      const heal = Math.min(this.healAmt, player.maxHp - player.hp);
      player.hp += heal;
      EventBus.emit('combat_msg', `${this.name}: +${heal} HP`);
      Audio.playHeal();
    },
  },
  poison_strike: {
    id: 'poison_strike',
    name: 'GOLPE TOXICO',
    cost: 1,
    type: 'attack',
    baseDmg: 5,
    description: '5 dano + Veneno(3) por 3 turnos.',
    color: PALETTE.BILE_GREEN,
    use(player, target, _combat) {
      const dmg = applyDamage(target, this.baseDmg + player.atkBonus);
      applyStatus(target, STATUS.POISON, 3, 3);
      EventBus.emit('combat_msg', `${this.name}: -${dmg} HP + Veneno!`);
      Audio.playPoison();
    },
  },
  war_cry: {
    id: 'war_cry',
    name: 'GRITO DE GUERRA',
    cost: 1,
    type: 'skill',
    description: 'Compra 3 cartas.',
    color: PALETTE.YELLOW,
    use(_player, _target, combat) {
      combat.drawCards(3);
      EventBus.emit('combat_msg', 'Grito de Guerra! +3 cartas!');
      Audio.playCardDraw();
    },
  },
};

// Starting deck (card IDs × quantity)
const STARTING_DECK = [
  'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend',
  'charge',
  'bandage_card',
];

// Pool of cards available to add after combat
const CARD_POOL = [
  'double_strike',
  'bloody_cut',
  'barricade',
  'burst',
  'molotov_card',
  'adrenaline_card',
  'frenzy',
  'improvised_shield',
  'grenade_card',
  'emergency_heal',
  'poison_strike',
  'war_cry',
];

// Build initial deck (deep copy of defs)
function buildStartingDeck() {
  return STARTING_DECK.map(id => ({ ...CARD_DEFS[id] }));
}

// Pick 3 random reward cards not already heavily represented in deck
function pickCardRewards(currentDeck) {
  const pool = shuffle([...CARD_POOL]);
  return pool.slice(0, 3).map(id => ({ ...CARD_DEFS[id] }));
}
