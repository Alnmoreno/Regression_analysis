// ============================================================
// DEAD STREETS — Procedural Audio (Web Audio API)
// ============================================================

const Audio = {
  _ctx: null,
  _master: null,
  enabled: true,

  init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this._ctx = new AC();
      this._master = this._ctx.createGain();
      this._master.gain.value = 0.35;
      this._master.connect(this._ctx.destination);
    } catch (e) {
      this.enabled = false;
    }
  },

  // Resume suspended context (must be called after user gesture)
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  },

  // ── Low-level primitives ────────────────────────────────────

  _tone(freq, endFreq, dur, type, vol, delay) {
    if (!this.enabled || !this._ctx) return;
    delay = delay || 0;
    const t0 = this._ctx.currentTime + delay;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
    }
    gain.gain.setValueAtTime(vol || 0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this._master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  },

  _noise(dur, vol, filterFreq, delay) {
    if (!this.enabled || !this._ctx) return;
    delay = delay || 0;
    const sampleRate = this._ctx.sampleRate;
    const bufSamples = Math.ceil(sampleRate * dur);
    const buf = this._ctx.createBuffer(1, bufSamples, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSamples; i++) data[i] = Math.random() * 2 - 1;

    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const filt = this._ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = filterFreq || 2000;
    const gain = this._ctx.createGain();
    const t0 = this._ctx.currentTime + delay;
    gain.gain.setValueAtTime(vol || 0.4, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

    src.connect(filt);
    filt.connect(gain);
    gain.connect(this._master);
    src.start(t0);
    src.stop(t0 + dur + 0.01);
  },

  // ── Named sound effects ─────────────────────────────────────

  playAttack() {
    this._noise(0.06, 0.5, 4000);
    this._tone(150, 60, 0.1, 'sine', 0.2, 0.04);
  },

  playBlock() {
    this._noise(0.05, 0.6, 3500);
    this._tone(500, 400, 0.08, 'triangle', 0.25);
    this._tone(350, 250, 0.1, 'triangle', 0.15, 0.04);
  },

  playHurt() {
    this._tone(440, 220, 0.15, 'sawtooth', 0.4);
    this._noise(0.12, 0.3, 1200);
  },

  playHeal() {
    this._tone(523, 784, 0.2, 'sine', 0.25);
    this._tone(659, 1047, 0.2, 'sine', 0.2, 0.1);
  },

  playZombieGrowl() {
    this._tone(80, 50, 0.4, 'sawtooth', 0.2);
    this._tone(60, 90, 0.3, 'square', 0.1, 0.15);
    this._noise(0.3, 0.15, 500, 0.05);
  },

  playZombieDeath() {
    this._noise(0.4, 0.5, 800);
    this._tone(200, 40, 0.5, 'sawtooth', 0.25, 0.05);
  },

  playCardPlay() {
    this._tone(330, 440, 0.06, 'square', 0.15);
  },

  playCardDraw() {
    this._tone(220, 330, 0.04, 'triangle', 0.12);
  },

  playFire() {
    for (let i = 0; i < 5; i++) {
      this._noise(0.06, 0.2, 3000 + Math.random() * 2000, i * 0.05);
    }
  },

  playPoison() {
    this._tone(120, 100, 0.3, 'sine', 0.15);
    this._noise(0.25, 0.2, 600, 0.05);
  },

  playBossAppear() {
    this._tone(55, 40, 2.0, 'sawtooth', 0.35);
    this._tone(110, 80, 1.5, 'square', 0.15, 0.5);
    this._noise(2.0, 0.1, 400);
  },

  playFanfare() {
    [0, 0.15, 0.3].forEach((delay, i) => {
      const freqs = [523, 659, 784];
      this._tone(freqs[i], freqs[i], 0.25, 'triangle', 0.3, delay);
    });
  },

  playClick() {
    this._tone(440, 880, 0.05, 'square', 0.15);
  },

  playExplosion() {
    this._noise(0.5, 0.8, 600);
    this._tone(80, 30, 0.6, 'sine', 0.5);
    this._tone(40, 20, 0.8, 'sine', 0.3, 0.1);
  },

  playVictory() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => this._tone(f, f, 0.2, 'triangle', 0.3, i * 0.15));
  },

  playDeath() {
    this._noise(1.0, 0.4, 400);
    [200, 160, 120, 80, 50].forEach((f, i) =>
      this._tone(f, f * 0.7, 0.4, 'sawtooth', 0.3, i * 0.2)
    );
  },

  playLevelUp() {
    [220, 330, 440, 660].forEach((f, i) =>
      this._tone(f, f, 0.15, 'square', 0.25, i * 0.1)
    );
  },

  playShotgun() {
    this._noise(0.2, 0.9, 900);
    this._tone(60, 30, 0.4, 'sine', 0.5);
  },

  toggleMute() {
    if (!this._master) return;
    this.enabled = !this.enabled;
    this._master.gain.value = this.enabled ? 0.35 : 0;
  },
};
