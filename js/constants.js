// ============================================================
// DEAD STREETS — Constants & Configuration
// ============================================================

const CANVAS_W = 800;
const CANVAS_H = 600;

// Post-apocalyptic color palette
const PALETTE = {
  // Backgrounds
  BG_DARK:     '#0a0a0f',
  BG_MID:      '#1a1a2e',
  BG_PANEL:    '#12121e',
  // Neutrals
  BLACK:       '#0a0a0a',
  DARK_GRAY:   '#2a2a2a',
  MID_GRAY:    '#4a4a4a',
  LIGHT_GRAY:  '#8a8a8a',
  OFF_WHITE:   '#d8d8c8',
  WHITE:       '#f0f0e8',
  // Decay greens (zombies, environment)
  DARK_GREEN:  '#1a3a1a',
  MUD_GREEN:   '#3a5a2a',
  BILE_GREEN:  '#4a7a3a',
  TOXIC_GREEN: '#6ab04c',
  SICK_GREEN:  '#7a9a4a',
  BILE_YELLOW: '#c7b446',
  // Blood & fire
  DARK_RED:    '#5c0a0a',
  BLOOD_RED:   '#8b0000',
  BRIGHT_RED:  '#cc1010',
  RUST:        '#7a3a1a',
  ORANGE:      '#d4580a',
  YELLOW:      '#d4b410',
  // Blues & purples
  STEEL_BLUE:  '#2a4a7a',
  ENERGY_BLUE: '#2080c8',
  BRIGHT_BLUE: '#44aaff',
  PURPLE:      '#6a2a8c',
  // Skin tones
  HUMAN_SKIN:  '#c8a07a',
  DEAD_SKIN:   '#8a7a5a',
  ZOMBIE_SKIN: '#6a8a5a',
  // UI
  UI_BG:       '#12121e',
  UI_BORDER:   '#3a3a5a',
  UI_HIGHLIGHT:'#6a6a8a',
  UI_TEXT:     '#c8c8a0',
  // HP bar
  HP_GREEN:    '#22cc44',
  HP_YELLOW:   '#ccbb22',
  HP_RED:      '#cc2222',
  HP_EMPTY:    '#331111',
  // Special
  GOLD:        '#ddaa22',
  BROWN:       '#6b3d1a',
  DARK_BROWN:  '#3d2010',
  TAN:         '#b87840',
};

// Node types
const NODE_TYPE = {
  HOUSE:  'house',
  COMBAT: 'combat',
  ELITE:  'elite',
  EVENT:  'event',
  SHOP:   'shop',
  REST:   'rest',
  BOSS:   'boss',
};

// Game states
const GAME_STATE = {
  MENU:      'menu',
  MAP:       'map',
  COMBAT:    'combat',
  CARD_PICK: 'card_pick',
  EVENT:     'event',
  SHOP:      'shop',
  REST:      'rest',
  WIN:       'win',
  LOSE:      'lose',
};

// Combat phases
const COMBAT_PHASE = {
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN:  'enemy_turn',
  ANIMATING:   'animating',
  VICTORY:     'victory',
  DEFEAT:      'defeat',
};

// Status effect keys
const STATUS = {
  BURN:    'burn',
  POISON:  'poison',
  BLEED:   'bleed',
  STUN:    'stun',
  REGEN:   'regen',
  RAGE:    'rage',
  ARMOR:   'armor',
};

// Map config
const MAP_ROWS      = 10;   // floors before boss
const MAP_COLS      = 5;    // max nodes per row
const MAP_X_START   = 130;
const MAP_X_END     = 670;
const MAP_Y_START   = 70;
const MAP_Y_END     = 530;

// Combat / player config
const MAX_ENERGY    = 3;
const HAND_SIZE     = 5;
const STARTING_HP   = 70;

// Node type distribution weights per floor band [combat, elite, event, shop, rest]
const ROW_WEIGHTS = [
  [70,  0, 20,  0, 10],  // Floor 1
  [60,  0, 20, 10, 10],  // Floor 2
  [55, 10, 20,  5, 10],  // Floor 3
  [50, 10, 20, 10, 10],  // Floor 4
  [45, 15, 20, 10, 10],  // Floor 5
  [45, 15, 20, 10, 10],  // Floor 6
  [40, 20, 20, 10, 10],  // Floor 7
  [40, 20, 20, 10, 10],  // Floor 8
  [35, 25, 20, 10, 10],  // Floor 9
  [35, 25, 20, 10, 10],  // Floor 10
];

// Node colors for map rendering
const NODE_COLOR = {
  [NODE_TYPE.HOUSE]:  PALETTE.TAN,
  [NODE_TYPE.COMBAT]: PALETTE.BILE_GREEN,
  [NODE_TYPE.ELITE]:  PALETTE.BLOOD_RED,
  [NODE_TYPE.EVENT]:  PALETTE.STEEL_BLUE,
  [NODE_TYPE.SHOP]:   PALETTE.GOLD,
  [NODE_TYPE.REST]:   PALETTE.MUD_GREEN,
  [NODE_TYPE.BOSS]:   PALETTE.BRIGHT_RED,
};

// Node labels for map
const NODE_LABEL = {
  [NODE_TYPE.HOUSE]:  'CASA',
  [NODE_TYPE.COMBAT]: 'COMBATE',
  [NODE_TYPE.ELITE]:  'ELITE',
  [NODE_TYPE.EVENT]:  'EVENTO',
  [NODE_TYPE.SHOP]:   'LOJA',
  [NODE_TYPE.REST]:   'DESCANSO',
  [NODE_TYPE.BOSS]:   'BOSS',
};
