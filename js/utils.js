// ============================================================
// DEAD STREETS — Utilities
// ============================================================

// Seeded RNG — Mulberry32 algorithm
function createRNG(seed) {
  let s = (seed >>> 0) || 0xdeadbeef;
  return function() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Global RNG instance (re-seeded on new game)
let rng = createRNG(Date.now());

function reseedRNG(seed) {
  rng = createRNG(seed);
}

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return rng() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN(arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted random: weights = [70, 20, 10] → returns index
function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Simple event bus for decoupled communication
const EventBus = {
  _listeners: {},
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => this.off(event, fn);
  },
  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
  },
  emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  },
  clear() {
    this._listeners = {};
  },
};

// Apply a status effect to an entity
function applyStatus(entity, key, stacks, duration) {
  if (!entity.statuses) entity.statuses = {};
  if (!entity.statuses[key]) {
    entity.statuses[key] = { stacks: 0, duration: 0 };
  }
  entity.statuses[key].stacks   += stacks;
  entity.statuses[key].duration  = Math.max(entity.statuses[key].duration, duration);
}

// Remove a status effect from an entity
function removeStatus(entity, key) {
  if (entity.statuses) delete entity.statuses[key];
}

// Check if entity has a status
function hasStatus(entity, key) {
  return !!(entity.statuses && entity.statuses[key] && entity.statuses[key].duration > 0);
}

// Tick status effects at start of entity's turn — returns array of messages
function tickStatuses(entity) {
  if (!entity.statuses) return [];
  const msgs = [];

  for (const [key, eff] of Object.entries(entity.statuses)) {
    switch (key) {
      case STATUS.BURN:
        entity.hp -= eff.stacks;
        msgs.push(`${entity.name} sofre ${eff.stacks} de Fogo!`);
        eff.stacks = Math.max(0, eff.stacks - 1);
        eff.duration--;
        break;
      case STATUS.POISON:
        entity.hp -= eff.stacks;
        msgs.push(`${entity.name} sofre ${eff.stacks} de Veneno!`);
        eff.duration--;
        break;
      case STATUS.BLEED:
        entity.hp -= eff.stacks;
        msgs.push(`${entity.name} sangra por ${eff.stacks}!`);
        eff.duration--;
        break;
      case STATUS.REGEN:
        entity.hp = Math.min(entity.maxHp, entity.hp + eff.stacks);
        msgs.push(`${entity.name} regenera ${eff.stacks} HP!`);
        eff.duration--;
        break;
      case STATUS.STUN:
        eff.duration--;
        break;
      case STATUS.RAGE:
        eff.duration--;
        break;
      case STATUS.ARMOR:
        // armor doesn't tick naturally, consumed by damage
        break;
    }
  }

  // Cleanup expired effects
  for (const key of Object.keys(entity.statuses)) {
    const eff = entity.statuses[key];
    if (eff.duration <= 0 || eff.stacks <= 0) {
      delete entity.statuses[key];
    }
  }

  entity.hp = Math.max(0, entity.hp);
  return msgs;
}

// Compute damage after block absorption
function applyDamage(target, rawDmg) {
  const blocked = Math.min(target.block, rawDmg);
  target.block = Math.max(0, target.block - rawDmg);
  const dmg = rawDmg - blocked;
  target.hp = Math.max(0, target.hp - dmg);
  return dmg;
}

// Format number for display
function fmt(n) {
  return Math.round(n).toString();
}
