// ============================================================
// DEAD STREETS — Map Generator & Renderer
// ============================================================

const Map = {
  nodes:          [],   // flat array { id, type, row, col, x, y, connections, cleared }
  playerNodeId:   null,
  visitedIds:     new Set(),
  _nodeClickRects: [],

  // ── Generation ─────────────────────────────────────────────

  generate(seed) {
    reseedRNG(seed || Date.now());
    this.nodes       = [];
    this.visitedIds  = new Set();

    // Row 0: house (fixed)
    const house = this._makeNode('n_0_0', NODE_TYPE.HOUSE, 0, 2);
    this.nodes.push(house);

    // Rows 1–MAP_ROWS: branching
    for (let row = 1; row <= MAP_ROWS; row++) {
      const count = this._nodesInRow(row);
      for (let col = 0; col < count; col++) {
        const type = this._pickType(row);
        const node = this._makeNode(`n_${row}_${col}`, type, row, col);
        this.nodes.push(node);
      }
    }

    // Row MAP_ROWS+1: boss
    const boss = this._makeNode(`n_boss`, NODE_TYPE.BOSS, MAP_ROWS + 1, 2);
    this.nodes.push(boss);

    // Generate connections
    this._generateConnections();

    // Compute screen positions
    this._computePositions();

    // Start at house
    this.playerNodeId = house.id;
    this.visitedIds.add(house.id);
    house.cleared = true;

    // Make row 1 available
    this._markAvailable();
  },

  _makeNode(id, type, row, col) {
    return { id, type, row, col, x: 0, y: 0, connections: [], cleared: false };
  },

  _nodesInRow(row) {
    const mid = Math.floor(MAP_ROWS / 2);
    const dist = Math.abs(row - mid);
    return clamp(MAP_COLS - Math.floor(dist * 0.6) + randInt(-1, 0), 2, MAP_COLS);
  },

  _pickType(row) {
    const weights = ROW_WEIGHTS[Math.min(row - 1, ROW_WEIGHTS.length - 1)];
    const types = [
      NODE_TYPE.COMBAT,
      NODE_TYPE.ELITE,
      NODE_TYPE.EVENT,
      NODE_TYPE.SHOP,
      NODE_TYPE.REST,
    ];
    return types[weightedRandom(weights)];
  },

  _generateConnections() {
    const byRow = this._nodesByRow();
    const totalRows = MAP_ROWS + 2;

    for (let r = 0; r < totalRows - 1; r++) {
      const fromRow = byRow[r] || [];
      const toRow   = byRow[r + 1] || [];
      if (!fromRow.length || !toRow.length) continue;

      // Track which toRow nodes have at least 1 incoming
      const hasIncoming = new Set();

      fromRow.forEach((fromNode, fi) => {
        // Map from column fraction to toRow column fraction
        const ratio = (fi / Math.max(fromRow.length - 1, 1));
        const baseTarget = Math.round(ratio * (toRow.length - 1));
        const targets = new Set([clamp(baseTarget, 0, toRow.length - 1)]);

        // Add a second connection randomly
        if (rng() > 0.5 && toRow.length > 1) {
          const alt = clamp(baseTarget + (rng() > 0.5 ? 1 : -1), 0, toRow.length - 1);
          targets.add(alt);
        }

        targets.forEach(ti => {
          const toNode = toRow[ti];
          if (!fromNode.connections.includes(toNode.id)) {
            fromNode.connections.push(toNode.id);
            hasIncoming.add(toNode.id);
          }
        });
      });

      // Ensure every toRow node has at least 1 incoming connection
      toRow.forEach((toNode, ti) => {
        if (!hasIncoming.has(toNode.id)) {
          const fromNode = fromRow[clamp(ti, 0, fromRow.length - 1)];
          if (!fromNode.connections.includes(toNode.id)) {
            fromNode.connections.push(toNode.id);
          }
        }
      });
    }
  },

  _nodesByRow() {
    const byRow = {};
    this.nodes.forEach(n => {
      if (!byRow[n.row]) byRow[n.row] = [];
      byRow[n.row].push(n);
    });
    // Sort each row by col
    Object.values(byRow).forEach(row => row.sort((a, b) => a.col - b.col));
    return byRow;
  },

  _computePositions() {
    const byRow = this._nodesByRow();
    const totalRows = MAP_ROWS + 2;

    Object.entries(byRow).forEach(([rowStr, rowNodes]) => {
      const row = parseInt(rowStr);
      const y = MAP_Y_END - (row / (totalRows - 1)) * (MAP_Y_END - MAP_Y_START);
      rowNodes.forEach((node, i) => {
        const pct = rowNodes.length > 1 ? i / (rowNodes.length - 1) : 0.5;
        const jitter = (rng() - 0.5) * 30;
        node.x = MAP_X_START + pct * (MAP_X_END - MAP_X_START) + jitter;
        node.y = y;
      });
    });
  },

  _markAvailable() {
    const current = this._getNode(this.playerNodeId);
    if (!current) return;
    current.connections.forEach(id => {
      const n = this._getNode(id);
      if (n && !n.cleared) n._available = true;
    });
  },

  // ── Navigation ──────────────────────────────────────────────

  getAvailableNodes() {
    const current = this._getNode(this.playerNodeId);
    if (!current) return [];
    return current.connections
      .map(id => this._getNode(id))
      .filter(n => n && !n.cleared);
  },

  canTravel(nodeId) {
    return this.getAvailableNodes().some(n => n.id === nodeId);
  },

  travelTo(nodeId) {
    if (!this.canTravel(nodeId)) return false;
    this.visitedIds.add(this.playerNodeId);
    this.playerNodeId = nodeId;
    this._markAvailable();
    return true;
  },

  getCurrentNode() {
    return this._getNode(this.playerNodeId);
  },

  markCurrentCleared() {
    const n = this.getCurrentNode();
    if (n) { n.cleared = true; n._available = false; }
  },

  _getNode(id) {
    return this.nodes.find(n => n.id === id) || null;
  },

  // ── Rendering ──────────────────────────────────────────────

  render(R) {
    R.fillRect(0, 0, CANVAS_W, CANVAS_H, PALETTE.BG_DARK);
    this._drawTitle(R);
    this._drawEdges(R);
    this._drawNodes(R);
    this._drawPlayerInfo(R);
    this._nodeClickRects = this.nodes.map(n => ({ id: n.id, x: n.x - 14, y: n.y - 14, w: 28, h: 28 }));
  },

  _drawTitle(R) {
    R.drawText('DEAD STREETS', 10, 10, PALETTE.BLOOD_RED, 3);
    R.drawText('ESCOLHA SEU CAMINHO', 10, 46, PALETTE.LIGHT_GRAY, 1);
    const current = this.getCurrentNode();
    if (current) {
      const floorNum = current.row;
      R.drawText(`ANDAR ${floorNum} / ${MAP_ROWS + 1}`, 620, 10, PALETTE.BILE_YELLOW, 2);
    }
  },

  _drawEdges(R) {
    const available = new Set(this.getAvailableNodes().map(n => n.id));

    this.nodes.forEach(fromNode => {
      fromNode.connections.forEach(toId => {
        const toNode = this._getNode(toId);
        if (!toNode) return;
        const isActive = available.has(toId) || fromNode.id === this.playerNodeId;
        const isVisited = fromNode.cleared && toNode.cleared;
        const color = isVisited  ? PALETTE.MID_GRAY
                    : isActive   ? PALETTE.BILE_YELLOW
                    : PALETTE.DARK_GRAY;
        R.drawLine(fromNode.x, fromNode.y, toNode.x, toNode.y, color,
                   isActive ? 2 : 1);
      });
    });
  },

  _drawNodes(R) {
    const available = new Set(this.getAvailableNodes().map(n => n.id));
    const size = 14;

    this.nodes.forEach(node => {
      const isCurrent   = node.id === this.playerNodeId;
      const isAvailable = available.has(node.id);
      const isCleared   = node.cleared;

      const bgColor = isCleared   ? PALETTE.DARK_GRAY
                    : isAvailable ? (NODE_COLOR[node.type] || PALETTE.MID_GRAY)
                    : PALETTE.BG_PANEL;

      const borderColor = isCurrent   ? PALETTE.WHITE
                        : isAvailable ? PALETTE.BILE_YELLOW
                        : PALETTE.UI_BORDER;

      // Glow ring for available
      if (isAvailable || isCurrent) {
        R.fillRect(node.x - size - 3, node.y - size - 3,
                   (size + 3) * 2, (size + 3) * 2,
                   isCurrent ? '#ffffff22' : '#ddaa2222');
      }

      R.fillRect(node.x - size, node.y - size, size * 2, size * 2, bgColor);
      R.strokeRect(node.x - size, node.y - size, size * 2, size * 2,
                   borderColor, isCurrent ? 3 : 2);

      // Icon
      const iconKey = `icon_${node.type}`;
      if (SPRITES[iconKey]) {
        const iconScale = 2;
        const iw = SPRITES[iconKey][0].length * iconScale;
        const ih = SPRITES[iconKey].length * iconScale;
        if (!isCleared) {
          R.drawSprite(iconKey, node.x - iw / 2, node.y - ih / 2, iconScale);
        } else {
          R.drawText('X', node.x - 3, node.y - 4, PALETTE.DARK_GRAY, 1);
        }
      }

      // Label below
      if (isAvailable || isCurrent) {
        const label = NODE_LABEL[node.type] || node.type;
        R.drawTextCentered(label, node.x, node.y + size + 6,
                           isCurrent ? PALETTE.WHITE : PALETTE.BILE_YELLOW, 1);
      }

      // Current player marker (arrow above)
      if (isCurrent) {
        R.fillRect(node.x - 4, node.y - size - 12, 8, 8, PALETTE.WHITE);
        R.drawText('v', node.x - 3, node.y - size - 11, PALETTE.BG_DARK, 1);
      }
    });
  },

  _drawPlayerInfo(R) {
    // Bottom info bar
    R.fillRect(0, CANVAS_H - 45, CANVAS_W, 45, PALETTE.BG_PANEL);
    R.fillRect(0, CANVAS_H - 45, CANVAS_W, 2, PALETTE.UI_BORDER);

    if (!window.Game || !window.Game.player) return;
    const p = window.Game.player;

    R.drawText(`HP: ${p.hp}/${p.maxHp}`, 10, CANVAS_H - 33, PALETTE.HP_GREEN, 1);
    R.drawHPBar(10, CANVAS_H - 20, 120, 8, p.hp, p.maxHp);

    R.drawText(`OURO: ${p.gold}`, 145, CANVAS_H - 33, PALETTE.GOLD, 1);
    R.drawText(`CARTAS NO DECK: ${p.allCards().length}`, 230, CANVAS_H - 33, PALETTE.UI_TEXT, 1);
    R.drawText(`MORTS: ${p.stats.kills}`, 410, CANVAS_H - 33, PALETTE.BLOOD_RED, 1);

    p.relics.forEach((relic, i) => {
      R.fillRect(500 + i * 28, CANVAS_H - 38, 24, 24, PALETTE.DARK_BROWN);
      R.strokeRect(500 + i * 28, CANVAS_H - 38, 24, 24, PALETTE.GOLD);
      R.drawSprite(relic.spriteKey, 502 + i * 28, CANVAS_H - 36, 2);
    });

    R.drawText('[CLIQUE EM UM NO PARA VIAJAR]', 10, CANVAS_H - 10, PALETTE.LIGHT_GRAY, 1);
  },

  // ── Input ───────────────────────────────────────────────────

  getClickedNode(mx, my) {
    return this._nodeClickRects.find(r =>
      mx >= r.x && mx <= r.x + r.w &&
      my >= r.y && my <= r.y + r.h
    ) || null;
  },
};
