// ============================================================
// DEAD STREETS — Items: Weapons, Consumibles, Relics
// ============================================================

// ── WEAPONS ────────────────────────────────────────────────────
// Weapons affect damage dealt when playing Attack cards
const WEAPON_DEFS = {
  kitchen_knife: {
    id: 'kitchen_knife',
    name: 'FACA DE COZINHA',
    dmgBonus: 0,
    description: 'Arma inicial. Basica mas confiavel.',
    spriteKey: 'item_knife',
    value: 0,
    onHit: null,
  },
  baseball_bat: {
    id: 'baseball_bat',
    name: 'TACO DE BEISEBOL',
    dmgBonus: 4,
    description: '+4 dano. 15% chance de Stun.',
    spriteKey: 'item_bat',
    value: 40,
    onHit: (target) => {
      if (Math.random() < 0.15) {
        applyStatus(target, STATUS.STUN, 1, 1);
        EventBus.emit('combat_msg', 'Atordoado!');
      }
    },
  },
  chainsaw: {
    id: 'chainsaw',
    name: 'MOTOSSERRA',
    dmgBonus: 8,
    description: '+8 dano. Sempre aplica Fogo(2).',
    spriteKey: 'item_knife',
    value: 70,
    onHit: (target) => {
      applyStatus(target, STATUS.BURN, 2, 2);
      Audio.playFire();
    },
  },
  shotgun: {
    id: 'shotgun',
    name: 'ESPINGARDA',
    dmgBonus: 14,
    description: '+14 dano. Apenas 2 usos por combate.',
    spriteKey: 'item_knife',
    value: 80,
    maxAmmo: 2,
    onHit: null,
  },
};

// ── CONSUMABLE ITEMS ───────────────────────────────────────────
const ITEM_DEFS = {
  bandage: {
    id: 'bandage',
    name: 'ATADURA',
    description: 'Cura 8 HP. Acao gratuita.',
    spriteKey: 'item_medkit',
    value: 10,
    use(player, _combat) {
      const heal = Math.min(8, player.maxHp - player.hp);
      player.hp += heal;
      EventBus.emit('combat_msg', `Atadura: +${heal} HP`);
      Audio.playHeal();
    },
  },
  medkit: {
    id: 'medkit',
    name: 'KIT MEDICO',
    description: 'Cura 25 HP.',
    spriteKey: 'item_medkit',
    value: 25,
    use(player, _combat) {
      const heal = Math.min(25, player.maxHp - player.hp);
      player.hp += heal;
      EventBus.emit('combat_msg', `Kit Medico: +${heal} HP`);
      Audio.playHeal();
    },
  },
  molotov: {
    id: 'molotov',
    name: 'MOLOTOV',
    description: 'Fogo(4) em todos inimigos.',
    spriteKey: 'item_molotov',
    value: 30,
    use(_player, combat) {
      combat.enemies.forEach(e => applyStatus(e, STATUS.BURN, 4, 4));
      EventBus.emit('combat_msg', 'Molotov! Todos queimando!');
      Audio.playFire();
      EventBus.emit('screen_flash', { color: PALETTE.ORANGE, alpha: 0.4 });
    },
  },
  grenade: {
    id: 'grenade',
    name: 'GRANADA',
    description: '20 dano a todos os inimigos.',
    spriteKey: 'item_grenade',
    value: 35,
    use(_player, combat) {
      combat.enemies.forEach(e => {
        const dmg = applyDamage(e, 20);
        EventBus.emit('combat_msg', `Granada: -${dmg} HP em ${e.name}!`);
      });
      Audio.playExplosion();
      EventBus.emit('screen_flash', { color: PALETTE.ORANGE, alpha: 0.5 });
    },
  },
  adrenaline: {
    id: 'adrenaline',
    name: 'ADRENALINA',
    description: '+2 energia este turno.',
    spriteKey: 'item_medkit',
    value: 20,
    use(player, _combat) {
      player.energy = Math.min(player.maxEnergy + 2, player.energy + 2);
      EventBus.emit('combat_msg', 'Adrenalina! +2 Energia!');
      Audio.playLevelUp();
    },
  },
};

// ── RELICS ─────────────────────────────────────────────────────
// Passive bonuses applied permanently
const RELIC_DEFS = {
  spiked_gloves: {
    id: 'spiked_gloves',
    name: 'LUVAS ESPINHOSAS',
    description: '+3 dano em todas cartas de ataque.',
    spriteKey: 'item_knife',
    onAcquire(player) { player.atkBonus += 3; },
  },
  shield_fragment: {
    id: 'shield_fragment',
    name: 'FRAGMENTO DE ESCUDO',
    description: '+5 bloco em todas cartas de defesa.',
    spriteKey: 'item_medkit',
    onAcquire(player) { player.blockBonus += 5; },
  },
  infected_vial: {
    id: 'infected_vial',
    name: 'VIAL DE SANGUE',
    description: 'Inimigos que atacam sofrem Veneno(2).',
    spriteKey: 'item_medkit',
    onAcquire(player) { player.thornsPoison = true; },
  },
  photo: {
    id: 'photo',
    name: 'FOTO DO SOBREVIVENTE',
    description: 'Inicia cada combate com +5 bloco.',
    spriteKey: 'item_medkit',
    onAcquire(player) { player.startBlock += 5; },
  },
  adrenaline_relic: {
    id: 'adrenaline_relic',
    name: 'SERINGA DE ADRENALINA',
    description: '+1 energia maxima permanentemente.',
    spriteKey: 'item_medkit',
    onAcquire(player) { player.maxEnergy += 1; },
  },
  survivors_belt: {
    id: 'survivors_belt',
    name: 'CINTO DO SOBREVIVENTE',
    description: '+20 HP maximo.',
    spriteKey: 'item_medkit',
    onAcquire(player) { player.maxHp += 20; player.hp += 20; },
  },
  bloody_cleaver: {
    id: 'bloody_cleaver',
    name: 'CUTELO SANGRENTO',
    description: '+2 ATK por cada zumbi morto nesta corrida.',
    spriteKey: 'item_knife',
    onAcquire(player) { player.killAtkBonus = true; },
  },
};

// Factory functions
function createItem(id) {
  const def = ITEM_DEFS[id];
  if (!def) return null;
  return { ...def };
}

function createWeapon(id) {
  const def = WEAPON_DEFS[id];
  if (!def) return null;
  const w = { ...def };
  if (w.maxAmmo) w.ammo = w.maxAmmo;
  return w;
}

function createRelic(id) {
  const def = RELIC_DEFS[id];
  if (!def) return null;
  return { ...def };
}

// Lists for random picks
const WEAPON_IDS   = Object.keys(WEAPON_DEFS).filter(id => id !== 'kitchen_knife');
const ITEM_IDS     = Object.keys(ITEM_DEFS);
const RELIC_IDS    = Object.keys(RELIC_DEFS);

function randomRelic() {
  return createRelic(pick(RELIC_IDS));
}

function randomItem() {
  return createItem(pick(ITEM_IDS));
}
