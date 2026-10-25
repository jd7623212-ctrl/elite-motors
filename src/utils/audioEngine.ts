/**
 * Web Audio API Acoustic Engine for Sports Car Exhaust Notes
 */

class CarAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playRev(
    soundType: 'inline6-turbo' | 'v8-muscle' | 'flat6-twin' | 'v10-screamer' | 'v6-biturbo' | 'v12-screamer',
    onRpmUpdate?: (rpm: number) => void,
    onEnded?: () => void
  ) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 2.4; // 2.4 seconds total rev cycle

      // Master Gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.15);
      masterGain.gain.setValueAtTime(0.35, now + 1.2);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      masterGain.connect(this.ctx.destination);

      // Lowpass Filter for exhaust body
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.9);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.connect(masterGain);

      // Base engine fundamental frequency based on cylinder layout
      let baseFreq = 55;
      let peakFreq = 240;
      let harmonic2Mult = 2;
      let harmonic3Mult = 3;

      switch (soundType) {
        case 'v8-muscle':
          baseFreq = 42; // Deep rumble
          peakFreq = 180;
          harmonic2Mult = 1.75;
          harmonic3Mult = 2.5;
          break;
        case 'inline6-turbo':
          baseFreq = 52; // 2JZ/RB26 silky howl
          peakFreq = 260;
          harmonic2Mult = 2.0;
          harmonic3Mult = 3.0;
          break;
        case 'flat6-twin':
          baseFreq = 60; // Porsche boxer rasp
          peakFreq = 290;
          harmonic2Mult = 2.0;
          harmonic3Mult = 3.5;
          break;
        case 'v10-screamer':
          baseFreq = 70; // High rev shrieking V10 (Huracán/Carrera GT)
          peakFreq = 380;
          harmonic2Mult = 2.5;
          harmonic3Mult = 4.0;
          break;
        case 'v6-biturbo':
          baseFreq = 58;
          peakFreq = 270;
          harmonic2Mult = 2.0;
          harmonic3Mult = 3.2;
          break;
        case 'v12-screamer':
          baseFreq = 78;
          peakFreq = 420;
          harmonic2Mult = 2.4;
          harmonic3Mult = 4.0;
          break;
      }

      // Oscillator 1: Fundamental
      const osc1 = this.ctx.createOscillator();
      osc1.type = soundType === 'v8-muscle' ? 'sawtooth' : 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, now);
      // Rev up ramp
      osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.85);
      // Peak hold and deceleration
      osc1.frequency.exponentialRampToValueAtTime(peakFreq * 0.95, now + 1.15);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + duration);
      osc1.connect(filter);
      osc1.start(now);
      osc1.stop(now + duration);

      // Oscillator 2: Harmonic richness
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(baseFreq * harmonic2Mult, now);
      osc2.frequency.exponentialRampToValueAtTime(peakFreq * harmonic2Mult, now + 0.85);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * harmonic2Mult, now + duration);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.2, now);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      osc2.start(now);
      osc2.stop(now + duration);

      // Turbo Spool / Exhaust Whine Noise Simulation
      const bufferSize = this.ctx.sampleRate * duration;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(4500, now + 0.9);
      noiseFilter.Q.value = 4.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(soundType.includes('turbo') ? 0.08 : 0.03, now + 0.9);
      // Wastegate / pop on lift-off
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);

      // RPM animation loop for UI
      const startTime = performance.now();
      const minRpm = 900;
      const maxRpm = soundType === 'v10-screamer' ? 8800 : soundType === 'v8-muscle' ? 7200 : 8200;

      const interval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed >= duration) {
          clearInterval(interval);
          if (onRpmUpdate) onRpmUpdate(minRpm);
          if (onEnded) onEnded();
          return;
        }

        let progress = 0;
        if (elapsed < 0.85) {
          progress = elapsed / 0.85;
          const currentRpm = minRpm + (maxRpm - minRpm) * Math.sin(progress * (Math.PI / 2));
          if (onRpmUpdate) onRpmUpdate(Math.round(currentRpm));
        } else if (elapsed < 1.2) {
          if (onRpmUpdate) onRpmUpdate(Math.round(maxRpm - (elapsed - 0.85) * 500));
        } else {
          const decelProgress = (elapsed - 1.2) / (duration - 1.2);
          const currentRpm = minRpm + (maxRpm * 0.8 - minRpm) * Math.max(0, 1 - decelProgress);
          if (onRpmUpdate) onRpmUpdate(Math.round(currentRpm));
        }
      }, 30);
    } catch {
      if (onEnded) onEnded();
    }
  }
}

export const soundEngine = new CarAudioEngine();
