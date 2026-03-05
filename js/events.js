// ============================================================
// DEAD STREETS — Random Events
// ============================================================

const Events = {
  current:      null,
  player:       null,
  _optionRects: [],
  _outcomeMsg:  null,
  _resolved:    false,
  _continueBtn: { x: 300, y: 460, w: 200, h: 40 },

  // Pool of events
  POOL: [
    {
      id: 'supply_cache',
      title: 'DEPOSITO DE SUPRIMENTOS',
      text: 'Voce encontra um deposito saqueado. Ainda ha algumas coisas.\nAlgo brilha na prateleira de fundo.',
      options: [
        {
          label: 'FORRAGEAR COM CUIDADO',
          desc: 'Ganhe 1 item aleatorio.',
          apply(p) {
            const item = randomItem();
            if (p.addItem(item)) {
              return `Encontrou: ${item.name}!`;
            }
            return 'Inventario cheio. Nada pegado.';
          },
        },
        {
          label: 'PEGAR TUDO RAPIDO',
          desc: '70%: 2 itens. 30%: perde 10 HP (alarme).',
          apply(p) {
            if (Math.random() < 0.7) {
              const i1 = randomItem(), i2 = randomItem();
              p.addItem(i1); p.addItem(i2);
              return `Pegou ${i1.name} e ${i2.name}!`;
            }
            p.hp = Math.max(1, p.hp - 10);
            return 'Alarme! Zumbis alertados. -10 HP.';
          },
        },
        {
          label: 'DEIXAR PARA LA',
          desc: 'Segue em frente.',
          apply() { return 'Voce continua sem parar.'; },
        },
      ],
    },
    {
      id: 'wounded_survivor',
      title: 'SOBREVIVENTE FERIDO',
      text: 'Um sobrevivente ferido implora por ajuda.\n"Por favor... tenho familia esperando."',
      options: [
        {
          label: 'DAR UMA ATADURA',
          desc: 'Perde 1 Atadura, ganha 1 Relic aleatoria.',
          apply(p) {
            const idx = p.inventory.findIndex(i => i.id === 'bandage');
            if (idx === -1) return 'Sem ataduras. Nao pode ajudar.';
            p.inventory.splice(idx, 1);
            const r = randomRelic();
            p.addRelic(r);
            return `Sobrevivente grato! Relic: ${r.name}`;
          },
        },
        {
          label: 'CURAR COM KIT MEDICO',
          desc: 'Perde 1 Kit Medico, ganha +15 ouro e Relic.',
          apply(p) {
            const idx = p.inventory.findIndex(i => i.id === 'medkit');
            if (idx === -1) return 'Sem kit medico.';
            p.inventory.splice(idx, 1);
            p.gold += 15;
            const r = randomRelic();
            p.addRelic(r);
            return `Sobrevivente salvo! +15 ouro + ${r.name}!`;
          },
        },
        {
          label: 'IGNORAR',
          desc: 'Siga em frente.',
          apply() { return 'Voce endurece o coracao e continua.'; },
        },
      ],
    },
    {
      id: 'abandoned_lab',
      title: 'LABORATORIO ABANDONADO',
      text: 'Um laboratorio destruido. Seringas misteriosas espalhadas.\nO cheiro e de produtos quimicos e morte.',
      options: [
        {
          label: 'BEBER SORO MISTERIOSO',
          desc: 'Efeito aleatorio: pode ser bom ou ruim.',
          apply(p) {
            const r = Math.random();
            if (r < 0.25) {
              p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp);
              return 'Serum de crescimento! +10 HP max!';
            } else if (r < 0.5) {
              p.maxEnergy++;
              return 'Serum de adrenalina! +1 Energia max!';
            } else if (r < 0.75) {
              p.hp = Math.max(1, p.hp - 15);
              return 'Serum toxico! -15 HP!';
            } else {
              applyStatus(p, STATUS.POISON, 3, 5);
              return 'Serum venenoso! Envenenado(3) por 5 turnos!';
            }
          },
        },
        {
          label: 'PEGAR KIT MEDICO IMPROVISADO',
          desc: 'Ganha 1 Kit Medico improvavel.',
          apply(p) {
            const item = createItem('medkit');
            if (p.addItem(item)) return 'Montou um kit medico improvavel!';
            return 'Inventario cheio!';
          },
        },
        {
          label: 'NAO TOCAR EM NADA',
          desc: 'Segue com cuidado.',
          apply() { return 'Voce recua com prudencia.'; },
        },
      ],
    },
    {
      id: 'gas_station',
      title: 'POSTO DE GASOLINA',
      text: 'Um posto de gasolina abandonado.\nTanques parcialmente cheios. Cheiro de combustivel no ar.',
      options: [
        {
          label: 'PEGAR COMBUSTIVEL',
          desc: 'Ganha 1 Molotov.',
          apply(p) {
            const item = createItem('molotov');
            if (p.addItem(item)) return 'Encheu uma garrafa de combustivel!';
            return 'Sem espaco no inventario.';
          },
        },
        {
          label: 'ARRISCAR (30% EXPLOSAO)',
          desc: '30%: -20 HP. 70%: +50 ouro + Molotov.',
          apply(p) {
            if (Math.random() < 0.3) {
              p.hp = Math.max(1, p.hp - 20);
              return 'EXPLOSAO! -20 HP. Sortudo por estar vivo.';
            }
            p.gold += 50;
            const item = createItem('molotov');
            p.addItem(item);
            return '+50 ouro e 1 Molotov! Passou por tudo!';
          },
        },
        {
          label: 'EVITAR',
          desc: 'Muito perigoso.',
          apply() { return 'Voce contorna o posto com cuidado.'; },
        },
      ],
    },
    {
      id: 'trader',
      title: 'COMERCIANTE ERRANTE',
      text: 'Um comerciante disfarçado surge de uma sombra.\n"Tenho coisas que voce nao pode imaginar. Por um preco."',
      options: [
        {
          label: 'COMPRAR SUPRIMENTOS (30 ouro)',
          desc: 'Ganha 2 Kits Medicos por 30 ouro.',
          apply(p) {
            if (p.gold < 30) return 'Sem ouro suficiente.';
            p.gold -= 30;
            p.addItem(createItem('medkit'));
            p.addItem(createItem('medkit'));
            return '-30 ouro. +2 Kits Medicos!';
          },
        },
        {
          label: 'COMPRAR RELIC (60 ouro)',
          desc: 'Relic aleatoria por 60 ouro.',
          apply(p) {
            if (p.gold < 60) return 'Sem ouro suficiente.';
            p.gold -= 60;
            const r = randomRelic();
            p.addRelic(r);
            return `-60 ouro. Relic: ${r.name}!`;
          },
        },
        {
          label: 'IGNORAR',
          desc: 'Nao precisa de nada.',
          apply() { return 'Voce passa sem parar.'; },
        },
      ],
    },
    {
      id: 'infected_dog',
      title: 'CAO INFECTADO',
      text: 'Um cao zumbi troteia ate voce, mas para.\nSeus olhos ainda tem um lampejo de reconhecimento.',
      options: [
        {
          label: 'TENTAR DOMESTICAR',
          desc: '50%: Cao aliado (+5 bloco permanente). 50%: morde (-15 HP).',
          apply(p) {
            if (Math.random() < 0.5) {
              p.startBlock += 5;
              return 'O cao te reconhece! +5 bloco no inicio de cada combate!';
            }
            p.hp = Math.max(1, p.hp - 15);
            return 'MORDIDA! -15 HP. Fuja!';
          },
        },
        {
          label: 'FUGIR',
          desc: 'Recue rapidamente.',
          apply() { return 'Voce recua. O cao some nas sombras.'; },
        },
      ],
    },
    {
      id: 'church',
      title: 'IGREJA ABANDONADA',
      text: 'Uma igreja em silencio. Velas ainda queimam no altar.\n"Deus abandonou este lugar. Mas talvez haja algo aqui."',
      options: [
        {
          label: 'ORAR (Cura 20 HP)',
          desc: 'Momento de paz. Cura 20 HP.',
          apply(p) {
            const healed = p.heal(20);
            return `Um momento de paz. +${healed} HP.`;
          },
        },
        {
          label: 'PROCURAR RELIQUIAS',
          desc: '60%: Relic. 40%: Armadilha -10 HP.',
          apply(p) {
            if (Math.random() < 0.6) {
              const r = randomRelic();
              p.addRelic(r);
              return `Reliquia encontrada: ${r.name}!`;
            }
            p.hp = Math.max(1, p.hp - 10);
            return 'Armadilha! -10 HP.';
          },
        },
        {
          label: 'SAIR SEM TOCAR',
          desc: 'Respeitar os mortos.',
          apply() { return 'Voce sai em silencio.'; },
        },
      ],
    },
  ],

  // ── Interface ──────────────────────────────────────────────

  start(player) {
    this.player     = player;
    this.current    = pick(this.POOL);
    this._optionRects = [];
    this._outcomeMsg  = null;
    this._resolved    = false;
  },

  choose(optionIdx) {
    if (this._resolved) return;
    const opt = this.current.options[optionIdx];
    if (!opt) return;
    this._outcomeMsg = opt.apply(this.player);
    this._resolved   = true;
    Audio.playClick();
  },

  isDone() {
    return this._resolved;
  },

  // ── Rendering ──────────────────────────────────────────────

  render(R) {
    if (!this.current) return;

    R.fillRect(0, 0, CANVAS_W, CANVAS_H, PALETTE.BG_DARK);
    R.fillRect(40, 30, CANVAS_W - 80, CANVAS_H - 60, PALETTE.BG_PANEL);
    R.strokeRect(40, 30, CANVAS_W - 80, CANVAS_H - 60, PALETTE.UI_BORDER, 2);

    // Title
    R.drawTextCentered(this.current.title, CANVAS_W / 2, 50, PALETTE.YELLOW, 2);

    // Divider
    R.fillRect(60, 72, CANVAS_W - 120, 2, PALETTE.UI_BORDER);

    // Body text
    const lines = this.current.text.split('\n');
    lines.forEach((line, i) => {
      R.drawTextCentered(line, CANVAS_W / 2, 88 + i * 16, PALETTE.OFF_WHITE, 1);
    });

    if (!this._resolved) {
      // Option buttons
      this._optionRects = [];
      this.current.options.forEach((opt, i) => {
        const by = 150 + i * 80;
        const bx = 80;
        const bw = CANVAS_W - 160;

        R.fillRect(bx, by, bw, 68, PALETTE.DARK_GRAY);
        R.strokeRect(bx, by, bw, 68, PALETTE.UI_HIGHLIGHT, 2);

        R.drawText(opt.label, bx + 12, by + 10, PALETTE.BILE_YELLOW, 2);
        R.drawText(opt.desc,  bx + 12, by + 36, PALETTE.LIGHT_GRAY, 1);

        this._optionRects.push({ x: bx, y: by, w: bw, h: 68 });
      });
    } else {
      // Outcome message
      R.fillRect(80, 170, CANVAS_W - 160, 60, PALETTE.DARK_BROWN);
      R.strokeRect(80, 170, CANVAS_W - 160, 60, PALETTE.GOLD, 2);
      R.drawTextCentered(this._outcomeMsg || '...', CANVAS_W / 2, 192, PALETTE.WHITE, 1);

      // Continue button
      const btn = this._continueBtn;
      R.fillRect(btn.x, btn.y, btn.w, btn.h, PALETTE.BLOOD_RED);
      R.strokeRect(btn.x, btn.y, btn.w, btn.h, PALETTE.WHITE, 2);
      R.drawTextCentered('CONTINUAR', btn.x + btn.w / 2, btn.y + 14, PALETTE.WHITE, 2);
    }
  },

  // ── Input ───────────────────────────────────────────────────

  handleClick(mx, my) {
    if (!this._resolved) {
      const idx = this._optionRects.findIndex(r =>
        mx >= r.x && mx <= r.x + r.w &&
        my >= r.y && my <= r.y + r.h
      );
      if (idx >= 0) this.choose(idx);
    } else {
      const btn = this._continueBtn;
      if (mx >= btn.x && mx <= btn.x + btn.w &&
          my >= btn.y && my <= btn.y + btn.h) {
        return true; // signal: go back to map
      }
    }
    return false;
  },
};
