// ============================================================
// DEAD STREETS — Zombie Classes & Factory
// ============================================================

// Base zombie definition
function createZombieBase(def, floor) {
  const scale = 1 + (floor || 0) * 0.08;
  return {
    ...def,
    hp:        Math.round(def.maxHp * scale),
    maxHp:     Math.round(def.maxHp * scale),
    atk:       Math.round(def.atk * scale),
    block:     0,
    statuses:  {},
    intentIdx: 0,
    // Runtime state
    _turnCount: 0,
    _triggered: {},   // special ability one-shot flags
  };
}

// ── ZOMBIE DEFINITIONS ──────────────────────────────────────────

const ZOMBIE_DEFS = {

  // ── Walker ──────────────────────────────────────────────────
  walker: {
    id: 'walker',
    name: 'WALKER',
    maxHp: 28,
    atk: 6,
    xp: 10,
    gold: [3, 8],
    spriteKey: 'zombie_walker',
    // Behavior pattern (cycled)
    behavior: [
      { type: 'attack', label: 'GARRA',   dmg: 6  },
      { type: 'attack', label: 'GARRA',   dmg: 6  },
      { type: 'block',  label: 'RECUAR',  val: 4  },
    ],
    special: null,
  },

  // ── Brute ───────────────────────────────────────────────────
  brute: {
    id: 'brute',
    name: 'BRUTO',
    maxHp: 55,
    atk: 14,
    xp: 25,
    gold: [10, 20],
    spriteKey: 'zombie_brute',
    behavior: [
      { type: 'attack', label: 'SOCO',    dmg: 14 },
      { type: 'attack', label: 'SOCO',    dmg: 14 },
      { type: 'block',  label: 'HUNKER',  val: 12 },
    ],
    special: {
      id: 'ground_slam',
      trigger: 'every_5_turns',
      label: 'SOCO NO CHAO',
      activate(zombie, player, _combat) {
        const dmg = applyDamage(player, 22);
        applyStatus(player, STATUS.STUN, 1, 1);
        player.stats.damageTaken += dmg;
        EventBus.emit('combat_msg', `SOCO NO CHAO! -${dmg} HP + Atordoado!`);
        Audio.playHurt();
        EventBus.emit('screen_flash', { color: PALETTE.BLOOD_RED, alpha: 0.4 });
      },
    },
  },

  // ── Spitter ─────────────────────────────────────────────────
  spitter: {
    id: 'spitter',
    name: 'CUSPIDOR',
    maxHp: 22,
    atk: 4,
    xp: 18,
    gold: [5, 12],
    spriteKey: 'zombie_spitter',
    behavior: [
      { type: 'attack', label: 'CUSPE',   dmg: 4, onHit(player) { applyStatus(player, STATUS.POISON, 2, 3); Audio.playPoison(); } },
      { type: 'attack', label: 'CUSPE',   dmg: 4, onHit(player) { applyStatus(player, STATUS.POISON, 2, 3); Audio.playPoison(); } },
      { type: 'buff',   label: 'CARREGAR', onExec(zombie)      { zombie._charged = true; EventBus.emit('combat_msg', 'Cuspidor carregando bílis...'); } },
    ],
    special: {
      id: 'bile_burst',
      trigger: 'charged',
      label: 'EXPLOSAO DE BILE',
      activate(zombie, player, _combat) {
        const dmg = applyDamage(player, 16);
        applyStatus(player, STATUS.POISON, 4, 4);
        player.stats.damageTaken += dmg;
        zombie._charged = false;
        EventBus.emit('combat_msg', `EXPLOSAO DE BILE! -${dmg} HP + Veneno(4)!`);
        Audio.playPoison();
        EventBus.emit('screen_flash', { color: PALETTE.TOXIC_GREEN, alpha: 0.35 });
      },
    },
  },

  // ── Screamer ────────────────────────────────────────────────
  screamer: {
    id: 'screamer',
    name: 'GRITADOR',
    maxHp: 18,
    atk: 3,
    xp: 20,
    gold: [4, 10],
    spriteKey: 'zombie_screamer',
    behavior: [
      { type: 'attack', label: 'ARRANHAR', dmg: 3 },
      { type: 'buff',   label: 'UIVO',     onExec(_zombie, combat) {
          combat.enemies.forEach(e => { if (e !== _zombie) e.block += 4; });
          EventBus.emit('combat_msg', 'Uivo! Aliados ganham +4 bloco!');
      }},
      { type: 'attack', label: 'ARRANHAR', dmg: 3 },
    ],
    special: {
      id: 'shriek',
      trigger: 'hp_below_50',
      onceOnly: true,
      label: 'GRITO',
      activate(_zombie, _player, combat) {
        const walker = createZombie('walker', combat.floor);
        combat.enemies.push(walker);
        EventBus.emit('combat_msg', 'GRITO! Um Walker aparece como reforco!');
        Audio.playZombieGrowl();
      },
    },
  },

  // ── Charger ─────────────────────────────────────────────────
  charger: {
    id: 'charger',
    name: 'CARREGADOR',
    maxHp: 30,
    atk: 10,
    xp: 22,
    gold: [6, 15],
    spriteKey: 'zombie_charger',
    behavior: [
      { type: 'attack', label: 'INVESTIDA', dmg: 10, onExec(zombie) { zombie._chargeBonus = (zombie._chargeBonus || 0) + 2; } },
    ],
    special: {
      id: 'full_sprint',
      trigger: 'every_3_turns',
      label: 'SPRINT TOTAL',
      activate(zombie, player, _combat) {
        const raw = 12 + (zombie._chargeBonus || 0);
        const dmg = applyDamage(player, raw);
        player.stats.damageTaken += dmg;
        zombie._chargeBonus = 0;
        EventBus.emit('combat_msg', `SPRINT TOTAL! -${dmg} HP!`);
        Audio.playHurt();
      },
    },
  },

  // ── Bloater ─────────────────────────────────────────────────
  bloater: {
    id: 'bloater',
    name: 'INCHADO',
    maxHp: 38,
    atk: 7,
    xp: 28,
    gold: [8, 18],
    spriteKey: 'zombie_bloater',
    behavior: [
      { type: 'attack', label: 'TAPA',  dmg: 7 },
      { type: 'buff',   label: 'INCHAR', onExec(zombie) {
          zombie._inflated = true;
          EventBus.emit('combat_msg', 'Inchado esta estufando... cuidado!');
      }},
      { type: 'attack', label: 'TAPA GORDO', dmg: 10 },
    ],
    special: {
      id: 'death_explosion',
      trigger: 'on_death',
      label: 'EXPLOSAO',
      activate(zombie, player, _combat) {
        const raw = zombie._inflated ? 22 : 15;
        const dmg = applyDamage(player, raw);
        player.stats.damageTaken += dmg;
        EventBus.emit('combat_msg', `INCHADO EXPLODE! -${dmg} HP!`);
        Audio.playExplosion();
        EventBus.emit('screen_flash', { color: PALETTE.ORANGE, alpha: 0.6 });
      },
    },
  },

  // ── Stalker ─────────────────────────────────────────────────
  stalker: {
    id: 'stalker',
    name: 'STALKER',
    maxHp: 25,
    atk: 13,
    xp: 30,
    gold: [7, 16],
    spriteKey: 'zombie_stalker',
    behavior: [
      { type: 'attack', label: 'EMBOSCADA', dmg: 13 },
      { type: 'buff',   label: 'ESQUIVAR',  onExec(zombie) {
          zombie._dodging = true;
          EventBus.emit('combat_msg', 'Stalker esta esquivando...');
      }},
      { type: 'attack', label: 'CORTE',    dmg: 16 },
    ],
    special: null,
    // Stalker has 30% dodge chance when _dodging
  },

  // ── TITAN (Boss) ─────────────────────────────────────────────
  titan: {
    id: 'titan',
    name: 'TITAN DE CARNE',
    maxHp: 150,
    atk: 18,
    xp: 200,
    gold: [60, 100],
    spriteKey: 'zombie_titan',
    behavior: [
      { type: 'attack', label: 'ESMAGAMENTO', dmg: 18 },
      { type: 'block',  label: 'REPOSICAO',   val: 20 },
      { type: 'attack', label: 'ARRANHAO',    dmg: 12 },
      { type: 'attack', label: 'ARRANHAO',    dmg: 12 },
      { type: 'buff',   label: 'ENFURECER',   onExec(zombie) {
          applyStatus(zombie, STATUS.RAGE, 5, 999);
          EventBus.emit('combat_msg', 'TITAN ENFURECIDO! +50% dano!');
      }},
    ],
    special: {
      id: 'phase_shift',
      trigger: 'hp_thresholds',
      thresholds: [0.66, 0.33],
      currentPhase: 0,
      label: 'MUDANCA DE FASE',
      activate(zombie, _player, _combat, phase) {
        if (phase === 0) {
          applyStatus(zombie, STATUS.REGEN, 5, 999);
          zombie.atk = Math.round(zombie.atk * 1.2);
          EventBus.emit('combat_msg', 'TITAN FASE 2! Regenerando e mais forte!');
          Audio.playBossAppear();
        } else if (phase === 1) {
          applyStatus(zombie, STATUS.RAGE, 8, 999);
          zombie.atk = Math.round(zombie.atk * 1.3);
          EventBus.emit('combat_msg', 'TITAN FASE 3! ENRAIVECIDO! Fuja ou morra!');
          Audio.playBossAppear();
          EventBus.emit('screen_flash', { color: PALETTE.BLOOD_RED, alpha: 0.7 });
        }
      },
    },
  },
};

// ── FACTORY ─────────────────────────────────────────────────────

function createZombie(id, floor) {
  const def = ZOMBIE_DEFS[id];
  if (!def) throw new Error(`Unknown zombie: ${id}`);
  const z = createZombieBase(def, floor || 0);
  return z;
}

// Execute a zombie's behavior step (returns action object)
function getZombieIntent(zombie) {
  const beh = ZOMBIE_DEFS[zombie.id].behavior;
  return beh[zombie.intentIdx % beh.length];
}

// Advance the zombie's intent index
function advanceZombieIntent(zombie) {
  zombie.intentIdx = (zombie.intentIdx + 1) % ZOMBIE_DEFS[zombie.id].behavior.length;
}

// Execute zombie intent against player
function executeZombieAction(zombie, player, combat) {
  const intent = getZombieIntent(zombie);
  zombie._turnCount = (zombie._turnCount || 0) + 1;

  // Check stun — skip turn
  if (hasStatus(zombie, STATUS.STUN)) {
    EventBus.emit('combat_msg', `${zombie.name} esta atordoado!`);
    return;
  }

  // Check special triggers (before normal action)
  const def = ZOMBIE_DEFS[zombie.id];

  // Every 5 turns special
  if (def.special && def.special.trigger === 'every_5_turns' && zombie._turnCount % 5 === 0) {
    def.special.activate(zombie, player, combat);
    advanceZombieIntent(zombie);
    return;
  }

  // Every 3 turns special
  if (def.special && def.special.trigger === 'every_3_turns' && zombie._turnCount % 3 === 0) {
    def.special.activate(zombie, player, combat);
    advanceZombieIntent(zombie);
    return;
  }

  // Charged special (spitter)
  if (def.special && def.special.trigger === 'charged' && zombie._charged) {
    def.special.activate(zombie, player, combat);
    advanceZombieIntent(zombie);
    return;
  }

  // Execute normal intent
  if (intent.type === 'attack') {
    // Check dodge (stalker)
    if (zombie._dodging && Math.random() < 0.30) {
      zombie._dodging = false;
      EventBus.emit('combat_msg', `${zombie.name} ESQUIVOU!`);
      advanceZombieIntent(zombie);
      return;
    }
    zombie._dodging = false;

    // Compute damage with RAGE bonus
    let rawDmg = intent.dmg || zombie.atk;
    if (hasStatus(zombie, STATUS.RAGE)) {
      rawDmg = Math.round(rawDmg * 1.5);
    }
    const dmg = applyDamage(player, rawDmg);
    player.stats.damageTaken += dmg;

    // Throns poison relic
    if (player.thornsPoison) {
      applyStatus(zombie, STATUS.POISON, 2, 2);
    }

    if (intent.onHit) intent.onHit(player);
    EventBus.emit('combat_msg', `${zombie.name}: ${intent.label}! -${dmg} HP`);
    if (dmg > 0) {
      Audio.playHurt();
      EventBus.emit('screen_flash', { color: PALETTE.BLOOD_RED, alpha: 0.2 });
    }
  } else if (intent.type === 'block') {
    zombie.block += intent.val || 0;
    EventBus.emit('combat_msg', `${zombie.name}: ${intent.label}! +${intent.val} bloco`);
  } else if (intent.type === 'buff') {
    if (intent.onExec) intent.onExec(zombie, combat);
  }

  if (intent.onExec && intent.type !== 'buff') {
    intent.onExec(zombie, combat);
  }

  advanceZombieIntent(zombie);
}

// Check and trigger hp-threshold and on-death specials
function checkZombieSpecials(zombie, player, combat) {
  const def = ZOMBIE_DEFS[zombie.id];
  if (!def.special) return;

  // hp_below_50
  if (def.special.trigger === 'hp_below_50' &&
      !zombie._triggered[def.special.id] &&
      zombie.hp <= zombie.maxHp * 0.5) {
    if (!def.special.onceOnly || !zombie._triggered[def.special.id]) {
      zombie._triggered[def.special.id] = true;
      def.special.activate(zombie, player, combat);
    }
  }

  // hp_thresholds (boss)
  if (def.special.trigger === 'hp_thresholds' && def.special.thresholds) {
    def.special.thresholds.forEach((thr, idx) => {
      const flagKey = `phase_${idx}`;
      if (!zombie._triggered[flagKey] && zombie.hp <= zombie.maxHp * thr) {
        zombie._triggered[flagKey] = true;
        def.special.activate(zombie, player, combat, idx);
      }
    });
  }
}

// Check on_death special
function checkZombieOnDeath(zombie, player, combat) {
  const def = ZOMBIE_DEFS[zombie.id];
  if (def.special && def.special.trigger === 'on_death') {
    def.special.activate(zombie, player, combat);
  }
}

// Loot generation
function generateZombieLoot(zombie) {
  const def = ZOMBIE_DEFS[zombie.id];
  const gold = randInt(def.gold[0], def.gold[1]);
  return { gold, xp: def.xp };
}

// Pool of zombies per floor band
function zombiePoolForFloor(floor) {
  if (floor <= 2)  return ['walker'];
  if (floor <= 4)  return ['walker', 'spitter'];
  if (floor <= 6)  return ['walker', 'spitter', 'screamer', 'charger'];
  if (floor <= 8)  return ['walker', 'brute', 'spitter', 'screamer', 'charger', 'bloater'];
  return ['walker', 'brute', 'spitter', 'screamer', 'charger', 'bloater', 'stalker'];
}

function zombiesForNode(nodeType, floor) {
  if (nodeType === NODE_TYPE.BOSS) return ['titan'];
  const pool = zombiePoolForFloor(floor);

  if (nodeType === NODE_TYPE.ELITE) {
    const elitePool = pool.filter(id => ['brute', 'bloater', 'stalker'].includes(id));
    if (elitePool.length > 0) {
      return [pick(elitePool)];
    }
    return [pick(pool)];
  }

  // Regular combat: 1–2 zombies
  const count = floor < 3 ? 1 : (Math.random() > 0.6 ? 2 : 1);
  return Array.from({ length: count }, () => pick(pool));
}
