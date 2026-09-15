export const audioSettings = Object.freeze({
  masterVolume: 0.9,
  lobbyMusicVolume: 0.8,
  lobbyAutoplayDelayMs: 750,
  musicVolume: 0.52,
  effectsVolume: 0.9
});

export const musicSources = Object.freeze({
  lobby: './assets/bgm-fekdi.mp3',
  game: 'synth-game-sequence'
});

export const gameTrack = Object.freeze({
  bpm: 132,
  wave: 'square',
  melody: [64, 67, 71, 67, 62, 66, 69, 66, 64, 67, 72, 71, 69, 67, 66, 62],
  bass: [40, null, 40, null, 38, null, 38, null, 36, null, 36, null, 35, null, 38, null]
});

const midiToFrequency = note => 440 * (2 ** ((note - 69) / 12));

export class GameAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.musicBus = null;
    this.effectsBus = null;
    this.enabled = true;
    this.musicEnabled = false;
    this.musicTimer = null;
    this.musicNodes = new Set();
    this.step = 0;
    this.nextNoteAt = 0;
  }

  ensureContext() {
    if (this.context) return true;
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return false;

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.musicBus = this.context.createGain();
    this.effectsBus = this.context.createGain();
    const compressor = this.context.createDynamicsCompressor();

    this.master.gain.value = audioSettings.masterVolume;
    this.musicBus.gain.value = audioSettings.musicVolume;
    this.effectsBus.gain.value = audioSettings.effectsVolume;
    compressor.threshold.value = -12;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;

    this.musicBus.connect(this.master);
    this.effectsBus.connect(this.master);
    this.master.connect(compressor);
    compressor.connect(this.context.destination);
    return true;
  }

  unlock() {
    if (!this.enabled || !this.ensureContext()) return false;
    void this.context.resume();
    if (this.musicEnabled && !this.musicTimer) this.startMusic();
    return true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
      void this.context?.suspend();
      return;
    }
    if (this.musicEnabled) this.unlock();
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
      return;
    }
    if (this.enabled) this.unlock();
  }

  startMusic() {
    if (!this.enabled || !this.context) return;
    this.stopMusic();
    this.step = 0;
    this.nextNoteAt = this.context.currentTime + 0.04;
    this.scheduleMusic();
    this.musicTimer = setInterval(() => this.scheduleMusic(), 80);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
    for (const oscillator of this.musicNodes) {
      try { oscillator.stop(); } catch { /* The note may have already ended. */ }
    }
    this.musicNodes.clear();
  }

  scheduleMusic() {
    const stepDuration = 60 / gameTrack.bpm / 2;
    while (this.nextNoteAt < this.context.currentTime + 0.24) {
      const index = this.step % gameTrack.melody.length;
      if (gameTrack.melody[index] !== null) this.scheduleNote(gameTrack.melody[index], this.nextNoteAt, stepDuration * 0.78, gameTrack.wave, 0.075);
      if (gameTrack.bass[index] !== null) this.scheduleNote(gameTrack.bass[index], this.nextNoteAt, stepDuration * 1.7, 'sine', 0.09);
      this.step++;
      this.nextNoteAt += stepDuration;
    }
  }

  scheduleNote(note, start, duration, wave, volume) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = midiToFrequency(note);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.musicBus);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    this.musicNodes.add(oscillator);
    oscillator.addEventListener('ended', () => this.musicNodes.delete(oscillator), { once: true });
  }

  feedback(correct, celebrate = false, finish = false, reward = true) {
    if (!this.unlock()) return false;
    if (!correct) {
      this.buzzer();
      return true;
    }

    const now = this.context.currentTime;
    if (!reward) {
      this.effectNote(880, now, 0.12, 'sine', 0.12);
      return true;
    }
    const notes = finish ? [523, 659, 784, 1047, 784, 1047, 1319, 1568] : celebrate ? [523, 659, 784, 1047, 1319, 1568] : [659, 784, 1047, 1319];
    const step = finish ? 0.15 : celebrate ? 0.085 : 0.1;
    const ending = now + (notes.length - 1) * step;
    const tail = finish ? 1.2 : 0.45;
    // Make room for the fanfare, even when answers arrive in quick succession.
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setTargetAtTime(audioSettings.musicVolume * 0.25, now, 0.02);
    this.musicBus.gain.setTargetAtTime(audioSettings.musicVolume, ending + tail, 0.15);
    notes.forEach((frequency, index) => {
      const start = now + index * step;
      const duration = index === notes.length - 1 ? tail : 0.22;
      this.effectNote(frequency, start, duration, 'triangle', 0.28);
      this.effectNote(frequency * 2, start, duration * 0.7, 'sine', 0.1);
      if (celebrate || finish) this.effectNote(frequency / 2, start, duration, 'sawtooth', 0.055);
    });
    [0, ...(finish ? [0.3, 0.6, 1.05] : celebrate ? [0.17, 0.425] : [0.3])].forEach(offset => {
      this.effectNote(150, now + offset, 0.22, 'sine', 0.4, 48);
      this.percussion(now + offset, 0.13, 0.18);
    });
    [262, 330, 392, 523].forEach(frequency => {
      this.effectNote(frequency, ending, tail, 'triangle', finish ? 0.14 : 0.08);
    });
    if (finish) this.percussion(ending, 1.1, 0.22);
    return true;
  }

  effectNote(frequency, start, duration, wave, volume, endFrequency = frequency) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.effectsBus);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
    oscillator.addEventListener('ended', () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
  }

  percussion(start, duration, volume) {
    if (!this.noiseBuffer) {
      this.noiseBuffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * 1.2), this.context.sampleRate);
      const samples = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.effectsBus);
    source.start(start);
    source.stop(start + duration);
    source.addEventListener('ended', () => { source.disconnect(); filter.disconnect(); gain.disconnect(); }, { once: true });
  }

  buzzer() {
    const start = this.context.currentTime;
    const envelope = this.context.createGain();
    const buzzGain = this.context.createGain();
    const lfo = this.context.createOscillator();
    const lfoDepth = this.context.createGain();

    envelope.gain.setValueAtTime(0.95, start);
    envelope.gain.setValueAtTime(0.95, start + 0.25);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
    buzzGain.gain.value = 0.13;
    lfo.type = 'square';
    lfo.frequency.value = 26;
    lfoDepth.gain.value = 0.065;
    lfo.connect(lfoDepth);
    lfoDepth.connect(buzzGain.gain);
    buzzGain.connect(envelope);
    envelope.connect(this.effectsBus);

    [145, 151].forEach(frequency => {
      const oscillator = this.context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.68, start + 0.36);
      oscillator.connect(buzzGain);
      oscillator.start(start);
      oscillator.stop(start + 0.39);
    });
    lfo.start(start);
    lfo.stop(start + 0.39);
  }
}

export const gameAudio = new GameAudio();
