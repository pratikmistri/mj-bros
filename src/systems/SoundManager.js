import { AUDIO } from '../config/constants.js';

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicNodes = [];
    this.musicPlaying = false;
    this.muted = false;
    this.loopTimeout = null;
    this.invincibilityInterval = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Gain graph: destination <- master <- music/sfx
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = AUDIO.MASTER_VOLUME;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = AUDIO.MUSIC_VOLUME;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = AUDIO.SFX_VOLUME;
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (!this.ctx) return;
    this.muted = !this.muted;
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : AUDIO.MASTER_VOLUME, this.ctx.currentTime);
    return this.muted;
  }

  // ── Background Music ──

  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this._scheduleLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    for (const node of this.musicNodes) {
      try { node.stop(); } catch (e) { /* already stopped */ }
    }
    this.musicNodes = [];
  }

  _scheduleLoop() {
    if (!this.musicPlaying || !this.ctx) return;

    const now = this.ctx.currentTime + 0.05;
    const bps = AUDIO.BPM / 60;
    const beatDur = 1 / bps; // 0.5s at 120bpm
    const barDur = beatDur * 4; // 2s
    const loopDur = barDur * 4; // 8s

    this.musicNodes = [];

    this._scheduleKick(now, beatDur, loopDur);
    this._scheduleHiHat(now, beatDur, loopDur);
    this._scheduleBass(now, beatDur, loopDur);
    this._scheduleMelody(now, beatDur, loopDur);

    // Re-schedule ~100ms before the loop ends
    this.loopTimeout = setTimeout(() => {
      this._scheduleLoop();
    }, (loopDur - 0.1) * 1000);
  }

  _scheduleKick(startTime, beatDur, loopDur) {
    const beats = Math.floor(loopDur / beatDur);
    for (let i = 0; i < beats; i++) {
      const t = startTime + i * beatDur;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.12);
      this.musicNodes.push(osc);

      // Snare on beats 2 and 4
      if (i % 4 === 1 || i % 4 === 3) {
        this._playSnare(t);
      }
    }
  }

  _playSnare(t) {
    // Body: triangle oscillator for the "crack"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.08);
    this.musicNodes.push(osc);

    // Wire: bandpass-filtered noise for the "snap"
    const buffer = this._createNoise(0.1);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3000;
    bp.Q.value = 1;
    const shelf = this.ctx.createBiquadFilter();
    shelf.type = 'highshelf';
    shelf.frequency.value = 6000;
    shelf.gain.value = 6;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.3, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    src.connect(bp);
    bp.connect(shelf);
    shelf.connect(nGain);
    nGain.connect(this.musicGain);
    src.start(t);
    this.musicNodes.push(src);
  }

  _scheduleHiHat(startTime, beatDur, loopDur) {
    const sixteenthDur = beatDur / 4;
    const count = Math.floor(loopDur / sixteenthDur);
    for (let i = 0; i < count; i++) {
      const t = startTime + i * sixteenthDur;
      const posInBeat = i % 4; // 0=downbeat, 2=off-beat ("and")
      let vol, decay;
      if (posInBeat === 2) {
        // Off-beat emphasis (the "and") — loudest
        vol = 0.35;
        decay = 0.10;
      } else if (posInBeat === 0) {
        // Downbeat — quieter
        vol = 0.18;
        decay = 0.05;
      } else {
        // Ghost 16th notes — soft texture
        if (Math.random() < 0.4) continue; // skip some for variation
        vol = 0.08;
        decay = 0.03;
      }
      const buffer = this._createNoise(decay + 0.02);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7000;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
      src.connect(hp);
      hp.connect(gain);
      gain.connect(this.musicGain);
      src.start(t);
      this.musicNodes.push(src);
    }
  }

  _scheduleBass(startTime, beatDur, loopDur) {
    // Billie Jean bass: F#2, A2, B2
    const F2 = 92.5, A2 = 110, B2 = 123.47;
    const sixteenth = beatDur / 4;
    // 1-bar pattern (16 sixteenths), repeats 4x per loop
    // [sixteenthOffset, freq, durationIn16ths]
    const pattern = [
      [0, F2, 2],     // beat 1
      [2, F2, 1.5],   // beat 1 "and"
      [4, A2, 2],     // beat 2
      [6, B2, 1],     // syncopated push
      [7, B2, 1],     // double-tap
      [8, A2, 2],     // beat 3
      [10, F2, 1.5],  // beat 3 "and"
      [12, F2, 2],    // beat 4
      [14, A2, 2]     // beat 4 "and"
    ];

    const bars = Math.floor(loopDur / (beatDur * 4));
    for (let bar = 0; bar < bars; bar++) {
      const barStart = startTime + bar * beatDur * 4;
      for (const [offset, freq, dur16] of pattern) {
        const t = barStart + offset * sixteenth;
        const noteDur = dur16 * sixteenth * 0.92; // slight staccato gap
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 320;
        lp.Q.value = 3;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.008); // fast 8ms attack
        gain.gain.setValueAtTime(0.4, t + noteDur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + noteDur + 0.01);
        this.musicNodes.push(osc);
      }
    }
  }

  _scheduleMelody(startTime, beatDur, loopDur) {
    // String-synth stabs: F#4=370, A4=440, B4=494, C#5=554
    const F4 = 370, A4 = 440, B4 = 494, C5 = 554;
    // Choppy stab pattern across 4 bars (16 beats)
    // [beatOffset, freq, durationInBeats]
    const pattern = [
      [0, F4, 0.25], [0.5, A4, 0.25], [1.5, B4, 0.25],
      [2, C5, 0.5], [3.5, A4, 0.25],
      [4, F4, 0.25], [4.5, B4, 0.25], [5.5, C5, 0.25],
      [6, A4, 0.5], [7.5, F4, 0.25],
      [8, B4, 0.25], [8.5, C5, 0.25], [9.5, A4, 0.25],
      [10, F4, 0.5], [11.5, B4, 0.25],
      [12, C5, 0.25], [13, A4, 0.25], [13.5, F4, 0.25],
      [14, B4, 0.5], [15.5, C5, 0.25]
    ];

    for (const [beat, freq, dur] of pattern) {
      const t = startTime + beat * beatDur;
      const noteDur = dur * beatDur;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.012); // fast 12ms attack
      gain.gain.setValueAtTime(0.12, t + noteDur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + noteDur + 0.01);
      this.musicNodes.push(osc);
    }
  }

  // ── Sound Effects ──

  playJump() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playStomp() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Triangle thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Noise burst
    const buffer = this._createNoise(0.1);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 1;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.3, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    src.connect(bp);
    bp.connect(nGain);
    nGain.connect(this.sfxGain);
    src.start(t);
  }

  playCollect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Two sines at a musical fifth
    for (const freq of [659, 988]) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  playDamage() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    // Waveshaper distortion
    const ws = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 5) * x / (Math.PI + 5 * Math.abs(x));
    }
    ws.curve = curve;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(ws);
    ws.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playDie() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.8);
  }

  playMoonwalk() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const buffer = this._createNoise(0.5);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(200, t);
    bp.frequency.exponentialRampToValueAtTime(2000, t + 0.4);
    bp.Q.value = 3;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  playHatThrow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const buffer = this._createNoise(0.2);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
    bp.Q.value = 2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  playBrickBreak() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Noise crunch
    const buffer = this._createNoise(0.15);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.25, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(nGain);
    nGain.connect(this.sfxGain);
    src.start(t);
  }

  playPowerUp() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // 5-note ascending arpeggio: C5 E5 G5 B5 C6
    const freqs = [523, 659, 784, 988, 1047];
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const noteStart = t + i * 0.08;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.25);
    });
  }

  playBossRoar() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Low sawtooth with distortion
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 1);
    const ws = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 3);
    }
    ws.curve = curve;
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
    osc.connect(ws);
    ws.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1);

    // Noise rumble
    const buffer = this._createNoise(0.8);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 200;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.2, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    src.connect(lp);
    lp.connect(nGain);
    nGain.connect(this.sfxGain);
    src.start(t);
  }

  startInvincibility() {
    if (!this.ctx) return;
    this.stopInvincibility();
    const playArp = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [523, 659, 784, 1047]; // C5 E5 G5 C6
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        const noteStart = t + i * 0.08;
        gain.gain.setValueAtTime(0.1, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteStart);
        osc.stop(noteStart + 0.12);
      });
    };
    playArp();
    this.invincibilityInterval = setInterval(playArp, 400);
  }

  stopInvincibility() {
    if (this.invincibilityInterval) {
      clearInterval(this.invincibilityInterval);
      this.invincibilityInterval = null;
    }
  }

  playVictory() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // 4 ascending chords: C major -> F major -> G major -> C major (high)
    const chords = [
      [261, 329, 392],   // C E G
      [349, 440, 523],   // F A C
      [392, 494, 587],   // G B D
      [523, 659, 784]    // C E G (high)
    ];
    chords.forEach((chord, ci) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const noteStart = t + ci * 0.4;
        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.setValueAtTime(0.2, noteStart + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(noteStart);
        osc.stop(noteStart + 0.4);
      });
    });
  }

  playGameOver() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // 4 descending notes: A4 F#4 E4 C4
    const freqs = [440, 370, 330, 261];
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const noteStart = t + i * 0.35;
      gain.gain.setValueAtTime(0.3, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.5);
    });
  }

  // ── Helpers ──

  _createNoise(duration) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
