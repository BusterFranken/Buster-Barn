// =============================================================================
// SoundSystem.js - Procedural Audio for MOO-QUEST
// All sound effects and music generated via Web Audio API. No audio files.
// =============================================================================

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicPlaying = false;
    this.musicSource = null;
    this.buffers = {};
  }

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.musicGain.gain.value = 0.3;
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.ctx.destination);
    this.sfxGain.gain.value = 0.5;
    this.generateAllSounds();
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ---------------------------------------------------------------------------
  // Buffer helpers
  // ---------------------------------------------------------------------------

  /**
   * Generate an AudioBuffer from a function that writes samples.
   * @param {number} duration - Duration in seconds.
   * @param {function} sampleFn - (t, sampleRate) => sample  (-1..1)
   * @returns {AudioBuffer}
   */
  generateBuffer(duration, sampleFn) {
    var sampleRate = this.ctx.sampleRate;
    var length = Math.ceil(sampleRate * duration);
    var buffer = this.ctx.createBuffer(1, length, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      var t = i / sampleRate;
      data[i] = sampleFn(t, sampleRate);
    }
    return buffer;
  }

  // ---------------------------------------------------------------------------
  // Waveform primitives
  // ---------------------------------------------------------------------------

  /** Square wave: value is +1 or -1 based on phase. */
  square(freq, t) {
    return ((t * freq) % 1) < 0.5 ? 1 : -1;
  }

  /** Triangle wave. */
  triangle(freq, t) {
    var phase = (t * freq) % 1;
    return 1 - 4 * Math.abs(phase - 0.5);
  }

  /** Sine wave. */
  sine(freq, t) {
    return Math.sin(2 * Math.PI * freq * t);
  }

  /** Sawtooth wave. */
  sawtooth(freq, t) {
    return 2 * ((t * freq) % 1) - 1;
  }

  /** White noise sample (no state needed). */
  noise() {
    return Math.random() * 2 - 1;
  }

  /** Linear interpolation. */
  lerp(a, b, frac) {
    return a + (b - a) * frac;
  }

  // ---------------------------------------------------------------------------
  // Sound generators
  // ---------------------------------------------------------------------------

  /** Jump: ascending square sweep 200Hz -> 500Hz, 120ms. */
  generateJump() {
    var self = this;
    var dur = 0.12;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var freq = self.lerp(200, 500, frac);
      var env = 1 - frac;                  // linear decay
      return self.square(freq, t) * env * 0.5;
    });
  }

  /** Land: low sine thud 100Hz, 60ms, quick decay. */
  generateLand() {
    var self = this;
    var dur = 0.06;
    return this.generateBuffer(dur, function (t) {
      var env = Math.exp(-t * 60);          // fast exponential decay
      return self.sine(100, t) * env * 0.6;
    });
  }

  /** Eat: bright chirp triangle 500Hz -> 900Hz, 80ms. */
  generateEat() {
    var self = this;
    var dur = 0.08;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var freq = self.lerp(500, 900, frac);
      var env = 1 - frac;
      return self.triangle(freq, t) * env * 0.5;
    });
  }

  /** Attack: noise burst + square 150Hz, 100ms. */
  generateAttack() {
    var self = this;
    var dur = 0.10;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var env = 1 - frac;
      var n = self.noise() * 0.4;
      var sq = self.square(150, t) * 0.3;
      return (n + sq) * env;
    });
  }

  /** HitEnemy: sharp sine pop 400Hz, 60ms, quick envelope. */
  generateHitEnemy() {
    var self = this;
    var dur = 0.06;
    return this.generateBuffer(dur, function (t) {
      var env = Math.exp(-t * 50);
      return self.sine(400, t) * env * 0.6;
    });
  }

  /** Hurt: descending sawtooth 400Hz -> 100Hz, 250ms. */
  generateHurt() {
    var self = this;
    var dur = 0.25;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var freq = self.lerp(400, 100, frac);
      var env = 1 - frac;
      return self.sawtooth(freq, t) * env * 0.4;
    });
  }

  /** Coin: two-tone square 800Hz 80ms then 1200Hz 80ms. */
  generateCoin() {
    var self = this;
    var dur = 0.16;
    return this.generateBuffer(dur, function (t) {
      var freq = t < 0.08 ? 800 : 1200;
      var localT = t < 0.08 ? t : t - 0.08;
      var env = 1 - (localT / 0.08);
      return self.square(freq, t) * env * 0.4;
    });
  }

  /** Lever: click - noise burst + 200Hz square blip, 80ms. */
  generateLever() {
    var self = this;
    var dur = 0.08;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var env = Math.exp(-t * 40);
      var n = self.noise() * 0.3;
      var sq = self.square(200, t) * 0.3;
      return (n + sq) * env;
    });
  }

  /** GateOpen: rising sine sweep 80Hz -> 250Hz, 400ms. */
  generateGateOpen() {
    var self = this;
    var dur = 0.40;
    return this.generateBuffer(dur, function (t) {
      var frac = t / dur;
      var freq = self.lerp(80, 250, frac);
      // Fade in then out
      var env = frac < 0.1 ? frac / 0.1 : (1 - frac);
      return self.sine(freq, t) * env * 0.5;
    });
  }

  /** Dialog: single click - 1000Hz square, 15ms. */
  generateDialog() {
    var self = this;
    var dur = 0.015;
    return this.generateBuffer(dur, function (t) {
      var env = 1 - (t / dur);
      return self.square(1000, t) * env * 0.3;
    });
  }

  /** Victory: arpeggio C5-E5-G5-C6 (523,659,784,1047Hz), square, 100ms each. */
  generateVictory() {
    var self = this;
    var notes = [523, 659, 784, 1047];
    var noteDur = 0.10;
    var dur = noteDur * notes.length;
    return this.generateBuffer(dur, function (t) {
      var noteIdx = Math.min(Math.floor(t / noteDur), notes.length - 1);
      var freq = notes[noteIdx];
      var localT = t - noteIdx * noteDur;
      var env = 1 - (localT / noteDur);    // decay within each note
      return self.square(freq, t) * env * 0.4;
    });
  }

  // ---------------------------------------------------------------------------
  // Generate all sounds
  // ---------------------------------------------------------------------------

  generateAllSounds() {
    this.buffers.jump = this.generateJump();
    this.buffers.land = this.generateLand();
    this.buffers.eat = this.generateEat();
    this.buffers.attack = this.generateAttack();
    this.buffers.hitEnemy = this.generateHitEnemy();
    this.buffers.hurt = this.generateHurt();
    this.buffers.coin = this.generateCoin();
    this.buffers.lever = this.generateLever();
    this.buffers.gateOpen = this.generateGateOpen();
    this.buffers.dialog = this.generateDialog();
    this.buffers.victory = this.generateVictory();
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  play(name) {
    this.ensureContext();
    if (!this.buffers[name]) return;
    var source = this.ctx.createBufferSource();
    source.buffer = this.buffers[name];
    source.connect(this.sfxGain);
    source.start();
  }

  // ---------------------------------------------------------------------------
  // Background music - simple chiptune loop
  // ---------------------------------------------------------------------------

  /**
   * Generate a 4-bar chiptune melody buffer that can be looped.
   * Tempo ~140 BPM, 4/4 time, 16th-note resolution.
   * Melody uses square wave, bass uses triangle wave.
   */
  generateMusicBuffer() {
    var self = this;
    var bpm = 140;
    var beatDur = 60 / bpm;                         // ~0.4286s per beat
    var barDur = beatDur * 4;
    var totalBars = 4;
    var totalDur = barDur * totalBars;
    var sixteenth = beatDur / 4;

    // Melody notes per sixteenth note (0 = rest).
    // 4 bars x 16 sixteenths = 64 entries.
    // Catchy farm / adventure melody in C major.
    var melody = [
      // Bar 1
      523, 523,   0,   0, 659, 659,   0,   0, 784, 784,   0, 784, 659,   0, 523,   0,
      // Bar 2
      587, 587,   0,   0, 659, 659,   0, 523, 440,   0, 440,   0, 523,   0,   0,   0,
      // Bar 3
      523, 523,   0,   0, 659, 659,   0,   0, 784, 784,   0, 784,1047,   0, 784,   0,
      // Bar 4
      659, 659,   0, 523, 587,   0, 523,   0, 440,   0, 523,   0,   0,   0,   0,   0
    ];

    // Bass notes per beat (one note per quarter note, 16 total).
    var bass = [
      // Bar 1       Bar 2       Bar 3       Bar 4
      131, 131, 165, 165,   147, 147, 165, 131,   131, 131, 165, 165,   165, 147, 131, 131
    ];

    return this.generateBuffer(totalDur, function (t) {
      // Melody voice (square wave)
      var stepIdx = Math.floor(t / sixteenth);
      if (stepIdx >= melody.length) stepIdx = melody.length - 1;
      var melFreq = melody[stepIdx];
      var melSample = 0;
      if (melFreq > 0) {
        var localT = t - stepIdx * sixteenth;
        var env = Math.max(0, 1 - (localT / sixteenth) * 0.6);   // slight decay
        melSample = self.square(melFreq, t) * env * 0.25;
      }

      // Bass voice (triangle wave)
      var beatIdx = Math.floor(t / beatDur);
      if (beatIdx >= bass.length) beatIdx = bass.length - 1;
      var bassFreq = bass[beatIdx];
      var bassSample = self.triangle(bassFreq, t) * 0.2;

      return melSample + bassSample;
    });
  }

  startMusic() {
    this.ensureContext();
    if (this.musicPlaying) return;

    if (!this.buffers.music) {
      this.buffers.music = this.generateMusicBuffer();
    }

    this.musicSource = this.ctx.createBufferSource();
    this.musicSource.buffer = this.buffers.music;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start();
    this.musicPlaying = true;
  }

  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.musicSource = null;
    }
    this.musicPlaying = false;
  }

  setMusicVolume(v) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  setSfxVolume(v) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }
}
