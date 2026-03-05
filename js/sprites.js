// ============================================================
// DEAD STREETS — Pixel Art Sprites
// ============================================================
// Each sprite is a 2D array of PALETTE color hex strings.
// null = transparent pixel.
// Drawn with scale factor (each "pixel" = scale px on canvas).

const SPRITES = {

  // ── PLAYER (8×12) ──────────────────────────────────────────
  player: [
    [null,      '#c8a07a','#c8a07a','#c8a07a','#c8a07a',null],
    ['#c8a07a','#c8a07a','#2a2a2a','#c8a07a','#2a2a2a','#c8a07a'],
    ['#c8a07a','#c8a07a','#c8a07a','#cc1010','#c8a07a','#c8a07a'],
    [null,      '#c8a07a','#c8a07a','#c8a07a','#c8a07a',null],
    ['#3d2010','#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a','#3d2010'],
    ['#3d2010','#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a','#3d2010'],
    ['#c8a07a','#3d2010','#6b3d1a','#6b3d1a','#3d2010','#c8a07a'],
    ['#c8a07a','#3d2010','#6b3d1a','#6b3d1a','#3d2010','#c8a07a'],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
    [null,      '#3d2010','#4a4a4a',null,      '#4a4a4a','#3d2010'],
    [null,      '#3d2010','#3d2010',null,      '#3d2010','#3d2010'],
  ],

  // Player attacking (arms raised)
  player_attack: [
    ['#c8a07a',null,      '#c8a07a','#c8a07a',null,      '#c8a07a'],
    ['#c8a07a','#c8a07a','#2a2a2a','#2a2a2a','#c8a07a','#c8a07a'],
    [null,      '#c8a07a','#c8a07a','#c8a07a','#c8a07a',null],
    [null,      '#c8a07a','#c8a07a','#c8a07a','#c8a07a',null],
    ['#3d2010','#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a','#3d2010'],
    ['#3d2010','#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a','#3d2010'],
    ['#c8a07a','#3d2010','#6b3d1a','#6b3d1a','#3d2010','#c8a07a'],
    ['#c8a07a','#3d2010','#6b3d1a','#6b3d1a','#3d2010','#c8a07a'],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
    [null,      '#3d2010','#4a4a4a',null,      '#4a4a4a','#3d2010'],
    [null,      '#3d2010','#3d2010',null,      '#3d2010','#3d2010'],
  ],

  // ── WALKER (8×10) ──────────────────────────────────────────
  zombie_walker: [
    [null,      '#6a8a5a','#6a8a5a','#6a8a5a','#6a8a5a',null],
    ['#6a8a5a','#3a5a2a','#2a2a2a','#6a8a5a','#2a2a2a','#6a8a5a'],
    ['#6a8a5a','#6a8a5a','#6a8a5a','#8b0000','#6a8a5a','#6a8a5a'],
    ['#6a8a5a','#6a8a5a','#6a8a5a','#6a8a5a','#6a8a5a','#6a8a5a'],
    ['#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a'],
    ['#6a8a5a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#6a8a5a'],
    ['#6a8a5a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#6a8a5a'],
    ['#6a8a5a','#3a5a2a','#4a7a3a',null,      '#4a7a3a','#6a8a5a'],
    [null,      '#3a5a2a','#4a7a3a',null,      '#4a7a3a',null],
    [null,      '#3a5a2a','#3a5a2a',null,      '#4a7a3a',null],
  ],

  // ── BRUTE (8×12) ───────────────────────────────────────────
  zombie_brute: [
    [null,      '#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a',null],
    ['#8a7a5a','#8a7a5a','#2a2a2a','#8a7a5a','#2a2a2a','#8a7a5a'],
    ['#8a7a5a','#8a7a5a','#8a7a5a','#cc1010','#8a7a5a','#8a7a5a'],
    [null,      '#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a',null],
    ['#7a3a1a','#d4580a','#d4580a','#d4580a','#d4580a','#7a3a1a'],
    ['#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a'],
    ['#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a'],
    ['#8a7a5a','#7a3a1a','#d4580a','#d4580a','#7a3a1a','#8a7a5a'],
    ['#8a7a5a','#7a3a1a','#d4580a','#d4580a','#7a3a1a','#8a7a5a'],
    ['#8a7a5a','#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a','#8a7a5a'],
    ['#8a7a5a','#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a','#8a7a5a'],
    ['#7a3a1a','#4a4a4a',null,      null,      '#4a4a4a','#7a3a1a'],
  ],

  // ── SPITTER (8×10) ─────────────────────────────────────────
  zombie_spitter: [
    [null,      '#7a9a4a','#7a9a4a','#7a9a4a','#7a9a4a',null],
    ['#7a9a4a','#4a7a3a','#2a2a2a','#7a9a4a','#2a2a2a','#7a9a4a'],
    ['#6ab04c','#7a9a4a','#c7b446','#c7b446','#7a9a4a','#6ab04c'],
    ['#6ab04c','#c7b446','#c7b446','#c7b446','#c7b446','#6ab04c'],
    ['#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a'],
    ['#7a9a4a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#7a9a4a'],
    ['#7a9a4a','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#7a9a4a'],
    [null,      '#3a5a2a','#4a7a3a',null,      '#4a7a3a',null],
    [null,      '#3a5a2a','#3a5a2a',null,      '#3a5a2a',null],
  ],

  // ── SCREAMER (8×11) ────────────────────────────────────────
  zombie_screamer: [
    [null,      '#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a',null],
    ['#8a7a5a','#6a8a5a','#2a2a2a','#8a7a5a','#2a2a2a','#6a8a5a'],
    [null,      '#8a7a5a','#8b0000','#8b0000','#8a7a5a',null],
    [null,      '#8a7a5a','#8b0000','#8b0000','#8a7a5a',null],
    ['#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a'],
    [null,      '#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a',null],
    [null,      '#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a',null],
    ['#8a7a5a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#8a7a5a'],
    ['#8a7a5a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#8a7a5a'],
    [null,      '#4a4a4a','#4a4a4a',null,      '#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a',null,      '#4a4a4a',null],
  ],

  // ── CHARGER (8×9) ──────────────────────────────────────────
  zombie_charger: [
    [null,      '#c8a07a','#c8a07a',null,null,null],
    ['#c8a07a','#2a2a2a','#c8a07a','#c8a07a',null,null],
    [null,      '#8b0000','#c8a07a','#c8a07a','#c8a07a',null],
    ['#cc1010','#cc1010','#cc1010','#4a4a4a','#4a4a4a','#4a4a4a'],
    ['#cc1010','#cc1010','#cc1010','#4a4a4a','#4a4a4a','#4a4a4a'],
    [null,      '#cc1010','#cc1010','#4a4a4a','#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a',null,null],
    [null,      null,      '#4a4a4a','#4a4a4a',null,null],
    [null,      null,      '#3d2010','#3d2010',null,null],
  ],

  // ── BLOATER (10×10) ────────────────────────────────────────
  zombie_bloater: [
    [null,      '#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c',null],
    ['#6a2a8c','#4a7a3a','#4a7a3a','#4a7a3a','#4a7a3a','#6a2a8c'],
    ['#6a2a8c','#4a7a3a','#2a2a2a','#4a7a3a','#2a2a2a','#6a2a8c'],
    ['#c7b446','#4a7a3a','#4a7a3a','#8b0000','#4a7a3a','#c7b446'],
    ['#6a2a8c','#6a2a8c','#c7b446','#c7b446','#6a2a8c','#6a2a8c'],
    ['#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c'],
    ['#4a7a3a','#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c','#4a7a3a'],
    ['#4a7a3a','#6a2a8c','#6a2a8c','#6a2a8c','#6a2a8c','#4a7a3a'],
    [null,      '#4a4a4a','#6a2a8c','#6a2a8c','#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
  ],

  // ── STALKER (8×11) ─────────────────────────────────────────
  zombie_stalker: [
    [null,      '#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null],
    ['#4a4a4a','#8a7a5a','#6ab04c','#8a7a5a','#6ab04c','#4a4a4a'],
    ['#4a4a4a','#8a7a5a','#8a7a5a','#cc1010','#8a7a5a','#4a4a4a'],
    [null,      '#4a4a4a','#8a7a5a','#8a7a5a','#4a4a4a',null],
    [null,      '#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a',null],
    [null,      '#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a',null],
    ['#4a4a4a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#4a4a4a'],
    ['#4a4a4a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#4a4a4a'],
    [null,      '#4a4a4a','#4a4a4a',null,      '#4a4a4a',null],
    [null,      '#4a4a4a','#4a4a4a',null,      '#4a4a4a',null],
    [null,      '#2a2a2a','#2a2a2a',null,      '#2a2a2a',null],
  ],

  // ── TITAN / BOSS (10×14) ───────────────────────────────────
  zombie_titan: [
    [null,      '#8b0000','#8b0000','#8b0000','#8b0000','#8b0000','#8b0000',null],
    ['#8b0000','#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a','#8a7a5a','#8b0000'],
    ['#8b0000','#8a7a5a','#cc1010','#8a7a5a','#8a7a5a','#cc1010','#8a7a5a','#8b0000'],
    ['#8b0000','#8a7a5a','#8a7a5a','#8b0000','#8b0000','#8a7a5a','#8a7a5a','#8b0000'],
    [null,      '#8b0000','#8b0000','#8a7a5a','#8a7a5a','#8b0000','#8b0000',null],
    ['#cc1010','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#cc1010'],
    ['#d4580a','#d4580a','#cc1010','#d4580a','#d4580a','#cc1010','#d4580a','#d4580a'],
    ['#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a'],
    ['#cc1010','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#d4580a','#cc1010'],
    ['#8a7a5a','#cc1010','#d4580a','#d4580a','#d4580a','#d4580a','#cc1010','#8a7a5a'],
    ['#8a7a5a','#cc1010','#d4580a','#d4580a','#d4580a','#d4580a','#cc1010','#8a7a5a'],
    ['#8b0000','#8b0000','#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a','#8b0000','#8b0000'],
    ['#8b0000','#8b0000','#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a','#8b0000','#8b0000'],
    ['#8b0000','#8b0000',null,      '#4a4a4a','#4a4a4a',null,      '#8b0000','#8b0000'],
  ],

  // ── MAP NODE ICONS (6×6) ───────────────────────────────────
  icon_house: [
    [null,      '#b87840','#b87840','#b87840',null,null],
    ['#b87840','#b87840','#b87840','#b87840','#b87840',null],
    ['#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a','#6b3d1a',null],
    ['#6b3d1a','#2a2a2a','#2a2a2a','#6b3d1a','#6b3d1a',null],
    ['#6b3d1a','#2a2a2a','#2a2a2a','#6b3d1a','#6b3d1a',null],
    ['#3d2010','#3d2010','#3d2010','#3d2010','#3d2010',null],
  ],

  icon_combat: [
    [null,      '#cc1010',null,      null,      '#cc1010',null],
    ['#cc1010','#cc1010','#cc1010','#cc1010','#cc1010','#cc1010'],
    [null,      '#cc1010','#cc1010','#cc1010','#cc1010',null],
    [null,      '#cc1010','#cc1010','#cc1010','#cc1010',null],
    [null,      '#8b0000','#cc1010','#cc1010','#8b0000',null],
    [null,      null,      '#8b0000','#8b0000',null,null],
  ],

  icon_elite: [
    [null,      null,      '#cc1010',null,null,null],
    [null,      '#cc1010','#cc1010','#cc1010',null,null],
    ['#cc1010','#cc1010','#cc1010','#cc1010','#cc1010',null],
    [null,      '#cc1010','#cc1010','#cc1010',null,null],
    [null,      null,      '#cc1010',null,null,null],
    [null,      null,      null,null,null,null],
  ],

  icon_event: [
    [null,      '#2080c8','#2080c8',null,null,null],
    [null,      null,      '#2080c8',null,null,null],
    [null,      '#2080c8','#2080c8',null,null,null],
    [null,      null,      null,null,null,null],
    [null,      '#2080c8',null,null,null,null],
    [null,      null,      null,null,null,null],
  ],

  icon_shop: [
    [null,      '#ddaa22','#ddaa22',null,null,null],
    ['#ddaa22','#ddaa22',null,      null,null,null],
    ['#ddaa22','#ddaa22','#ddaa22',null,null,null],
    [null,      '#ddaa22','#ddaa22',null,null,null],
    [null,      null,      '#ddaa22',null,null,null],
    ['#ddaa22','#ddaa22',null,      null,null,null],
  ],

  icon_rest: [
    [null,null,null,null,null,null],
    [null,      '#d4580a',null,      '#d4580a',null,null],
    [null,      '#d4580a','#d4580a','#d4580a',null,null],
    ['#ddaa22','#ddaa22','#ddaa22','#ddaa22',null,null],
    [null,      '#4a4a4a','#4a4a4a',null,null,null],
    [null,      null,null,null,null,null],
  ],

  icon_boss: [
    [null,      '#8b0000','#8b0000','#8b0000',null,null],
    ['#8b0000','#8b0000','#cc1010','#8b0000','#8b0000',null],
    ['#8b0000','#cc1010','#cc1010','#cc1010','#8b0000',null],
    ['#8b0000','#8b0000','#cc1010','#8b0000','#8b0000',null],
    [null,      '#8b0000','#8b0000','#8b0000',null,null],
    [null,      null,null,null,null,null],
  ],

  // ── ITEMS (6×6) ────────────────────────────────────────────
  item_knife: [
    [null,null,null,null,'#d8d8c8',null],
    [null,null,null,'#d8d8c8','#d8d8c8',null],
    [null,null,'#8a8a8a','#d8d8c8',null,null],
    [null,'#8a8a8a',null,null,null,null],
    ['#6b3d1a','#8a8a8a',null,null,null,null],
    ['#6b3d1a',null,null,null,null,null],
  ],

  item_bat: [
    [null,null,null,null,'#b87840',null],
    [null,null,null,'#b87840','#b87840',null],
    [null,null,'#b87840','#cc1010',null,null],
    [null,'#6b3d1a','#cc1010',null,null,null],
    ['#6b3d1a',null,null,null,null,null],
    [null,null,null,null,null,null],
  ],

  item_medkit: [
    [null,'#8b0000','#8b0000','#8b0000','#8b0000',null],
    ['#8b0000','#f0f0e8','#8b0000','#8b0000','#f0f0e8','#8b0000'],
    ['#8b0000','#8b0000','#8b0000','#8b0000','#8b0000','#8b0000'],
    ['#8b0000','#f0f0e8','#8b0000','#8b0000','#f0f0e8','#8b0000'],
    ['#8b0000','#f0f0e8','#f0f0e8','#f0f0e8','#f0f0e8','#8b0000'],
    [null,'#8b0000','#8b0000','#8b0000','#8b0000',null],
  ],

  item_molotov: [
    [null,null,'#4a4a4a',null,null,null],
    [null,'#d4580a','#d4580a',null,null,null],
    ['#d4580a','#f0f0e8','#f0f0e8','#d4580a',null,null],
    ['#d4580a','#f0f0e8','#f0f0e8','#d4580a',null,null],
    [null,'#d4580a','#d4580a',null,null,null],
    [null,null,null,null,null,null],
  ],

  item_grenade: [
    [null,'#4a4a4a','#4a4a4a',null,null,null],
    ['#4a4a4a','#8a8a8a','#8a8a8a','#4a4a4a',null,null],
    ['#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null,null],
    ['#4a4a4a','#4a4a4a','#4a4a4a','#4a4a4a',null,null],
    [null,'#4a4a4a','#4a4a4a',null,null,null],
    [null,null,null,null,null,null],
  ],
};

// Sprite lookup helper
function getSprite(key) {
  return SPRITES[key] || null;
}

// Sprite dimensions helper
function spriteSize(key, scale) {
  const s = SPRITES[key];
  if (!s || !s[0]) return { w: 0, h: 0 };
  return { w: s[0].length * scale, h: s.length * scale };
}
