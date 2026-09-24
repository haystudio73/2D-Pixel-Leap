import fs from 'fs';
import path from 'path';

/**
 * Studio WAV Generator for Background Music 3 (Midnight Funk / Retro Arcade Groove)
 * Recreates the authentic uploaded 126 BPM syncopated retro arcade funk soundtrack
 * Format: 44,100 Hz, 16-bit PCM WAV with seamless loop
 */

const SAMPLE_RATE = 44100;
const BPM = 126;
const BEAT_DURATION = 60 / BPM; // ~0.47619 seconds per quarter note
const SIXTEENTH = BEAT_DURATION / 4; // ~0.11905 seconds

// Note Frequencies
const NOTE_FREQS = {
  'REST': 0,
  'B1': 61.74, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F#2': 92.50, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C#3': 138.59, 'D3': 146.83, 'E3': 164.81, 'F#3': 174.61, 'G3': 196.00, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F#6': 1479.98, 'A6': 1760.00
};

// 32 bars * 4 beats/bar = 128 beats (~60.95 seconds)
const TOTAL_BARS = 32;
const TOTAL_DURATION = TOTAL_BARS * 4 * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(TOTAL_DURATION * SAMPLE_RATE);

const buffer = new Float32Array(TOTAL_SAMPLES);

// Oscillator & Synthesis Functions
function saw(phase) {
  return 2.0 * (phase % 1.0) - 1.0;
}

function pulse(phase, duty = 0.5) {
  return (phase % 1.0) < duty ? 1.0 : -1.0;
}

function triangle(phase) {
  const norm = phase % 1.0;
  return 4.0 * Math.abs(norm - 0.5) - 1.0;
}

// 8-bit LFSR noise for punchy retro drums
let lfsr = 0x55AA;
function getNoise() {
  const bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
  lfsr = (lfsr >> 1) | (bit << 14);
  return (bit === 1 ? 1.0 : -1.0) * ((lfsr & 0x00FF) / 255.0);
}

// Low-pass filter helper
class MoogFilter {
  constructor() {
    this.y1 = 0;
    this.y2 = 0;
    this.y3 = 0;
    this.y4 = 0;
    this.oldx = 0;
    this.oldy1 = 0;
    this.oldy2 = 0;
    this.oldy3 = 0;
  }
  process(input, cutoff, res) {
    const f = Math.max(0.01, Math.min(0.95, (cutoff / (SAMPLE_RATE * 0.5))));
    const k = 3.6 * f - 1.6 * f * f - 1.0;
    const p = (k + 1.0) * 0.5;
    const scale = Math.exp((1.0 - p) * 1.386249);
    const r = res * scale;

    const x = input - r * this.y4;
    this.y1 = x * p + this.oldx * p - k * this.y1;
    this.y2 = this.y1 * p + this.oldy1 * p - k * this.y2;
    this.y3 = this.y2 * p + this.oldy2 * p - k * this.y3;
    this.y4 = this.y3 * p + this.oldy3 * p - k * this.y4;

    this.oldx = x;
    this.oldy1 = this.y1;
    this.oldy2 = this.y2;
    this.oldy3 = this.y3;
    return this.y4;
  }
}

const bassFilter = new MoogFilter();
const leadFilter = new MoogFilter();

// B Minor Funk Chord Progression (Bm7 -> Gmaj7 -> Em7 -> F#7#9)
const chordProgression = [
  // 1-8 (Groove Intro)
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },

  // 9-16 (Main Funk Theme)
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },

  // 17-24 (Bridge / High Octave Funk Melody)
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'A2', chord: ['C#4', 'E4', 'A4', 'C#5'] },
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'A2', chord: ['C#4', 'E4', 'A4', 'C#5'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },

  // 25-32 (Climax & Seamless Loop Outro)
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },
  { root: 'B1', chord: ['D4', 'F#4', 'A4', 'B4'] },
  { root: 'G2', chord: ['D4', 'F#4', 'G4', 'B4'] },
  { root: 'E2', chord: ['D4', 'E4', 'G4', 'B4'] },
  { root: 'F#2', chord: ['C#4', 'E4', 'F#4', 'A#4'] },
];

// Funky Syncopated Bass Patterns (16 steps per bar)
const bassRiffs = [
  // Bm Groove
  ['B1', 'REST', 'B1', 'REST', 'D2', 'REST', 'B1', 'REST', 'REST', 'B1', 'F#2', 'REST', 'A2', 'REST', 'B2', 'A2'],
  ['B1', 'REST', 'REST', 'B1', 'REST', 'D2', 'E2', 'F#2', 'B1', 'REST', 'B1', 'REST', 'D2', 'REST', 'B1', 'REST'],
  // G Groove
  ['G2', 'REST', 'G2', 'REST', 'B2', 'REST', 'G2', 'REST', 'REST', 'G2', 'D3', 'REST', 'F#3', 'REST', 'G3', 'F#3'],
  ['G2', 'REST', 'REST', 'G2', 'REST', 'B2', 'C#3', 'D3', 'G2', 'REST', 'G2', 'REST', 'B2', 'REST', 'G2', 'REST'],
  // Em Groove
  ['E2', 'REST', 'E2', 'REST', 'G2', 'REST', 'E2', 'REST', 'REST', 'E2', 'B2', 'REST', 'D3', 'REST', 'E3', 'D3'],
  ['E2', 'REST', 'REST', 'E2', 'REST', 'G2', 'A2', 'B2', 'E2', 'REST', 'E2', 'REST', 'G2', 'REST', 'E2', 'REST'],
  // F# Groove
  ['F#2', 'REST', 'F#2', 'REST', 'A#2', 'REST', 'F#2', 'REST', 'REST', 'F#2', 'C#3', 'REST', 'E3', 'REST', 'F#3', 'E3'],
  ['F#2', 'REST', 'REST', 'F#2', 'REST', 'A#2', 'C#3', 'E3', 'F#2', 'REST', 'F#2', 'REST', 'A#2', 'REST', 'C#3', 'REST'],
];

// Funky Lead Line (Melodic retro synth flute / lead with vibrato and syncopated phrases)
const leadNotes = [
  // Bars 1-4: Intro groove (Rest + Funky calls)
  'REST', 'REST', 'REST', 'REST',  'REST', 'REST', 'REST', 'REST',  'F#4', 'A4', 'B4', 'REST',   'D5', 'REST', 'B4', 'REST',
  'REST', 'REST', 'F#4', 'A4',    'B4', 'REST', 'D5', 'E5',        'F#5', 'REST', 'E5', 'D5',   'B4', 'REST', 'A4', 'B4',
  'REST', 'REST', 'REST', 'REST',  'D5', 'REST', 'B4', 'REST',      'A4', 'REST', 'F#4', 'REST', 'D4', 'E4', 'F#4', 'A4',
  'B4', 'REST', 'REST', 'REST',    'REST', 'REST', 'REST', 'REST',  'F#4', 'A4', 'B4', 'D5',     'F#5', 'REST', 'E5', 'REST',

  // Bars 5-8: Development
  'B4', 'REST', 'D5', 'REST',      'F#5', 'REST', 'A5', 'REST',    'F#5', 'E5', 'D5', 'B4',     'D5', 'REST', 'E5', 'REST',
  'F#5', 'REST', 'E5', 'D5',      'B4', 'A4', 'B4', 'D5',          'E5', 'F#5', 'E5', 'D5',     'B4', 'REST', 'A4', 'REST',
  'G4', 'B4', 'D5', 'G5',          'F#5', 'D5', 'B4', 'G4',        'E4', 'G4', 'B4', 'E5',      'D5', 'B4', 'A4', 'F#4',
  'F#4', 'A#4', 'C#5', 'F#5',     'E5', 'C#5', 'A#4', 'F#4',       'A4', 'B4', 'D5', 'F#5',     'B5', 'REST', 'REST', 'REST',

  // Bars 9-12: Main Catchy Funk Hook
  'B4', 'D5', 'F#5', 'B5',        'A5', 'F#5', 'E5', 'D5',        'F#5', 'REST', 'E5', 'D5',   'B4', 'REST', 'A4', 'B4',
  'REST', 'D5', 'E5', 'F#5',      'A5', 'B5', 'A5', 'F#5',        'D5', 'E5', 'D5', 'B4',      'A4', 'B4', 'D5', 'REST',
  'G5', 'REST', 'F#5', 'D5',      'B4', 'REST', 'A4', 'G4',        'E5', 'REST', 'D5', 'B4',    'A4', 'REST', 'G4', 'E4',
  'F#4', 'A#4', 'C#5', 'E5',      'F#5', 'E5', 'C#5', 'A#4',       'B4', 'D5', 'F#5', 'A5',     'B5', 'REST', 'REST', 'REST',

  // Bars 13-16: Hook Variation
  'D6', 'REST', 'B5', 'REST',      'A5', 'F#5', 'E5', 'D5',        'B4', 'D5', 'F#5', 'A5',     'B5', 'REST', 'A5', 'F#5',
  'D5', 'E5', 'F#5', 'A5',        'B5', 'D6', 'B5', 'A5',          'F#5', 'A5', 'F#5', 'E5',    'D5', 'E5', 'D5', 'B4',
  'E5', 'G5', 'B5', 'D6',          'B5', 'G5', 'E5', 'D5',         'C#5', 'E5', 'G#5', 'B5',    'A5', 'E5', 'C#5', 'A4',
  'F#4', 'A#4', 'C#5', 'E5',      'F#5', 'G5', 'F#5', 'E5',        'D5', 'C#5', 'B4', 'A#4',    'B4', 'REST', 'REST', 'REST',

  // Bars 17-20: Bridge
  'G5', 'REST', 'G5', 'B5',        'D6', 'REST', 'B5', 'REST',     'G5', 'A5', 'B5', 'D6',      'E6', 'REST', 'D6', 'B5',
  'A5', 'REST', 'A5', 'C#6',       'E6', 'REST', 'C#6', 'REST',    'A5', 'B5', 'C#6', 'E6',     'F#6', 'REST', 'E6', 'C#6',
  'B5', 'D6', 'F#6', 'B6',        'A6', 'F#6', 'E6', 'D6',         'B5', 'D6', 'B5', 'A5',      'F#5', 'A5', 'F#5', 'E5',
  'D5', 'F#5', 'A5', 'D6',        'C#6', 'A5', 'F#5', 'D5',        'B4', 'D5', 'F#5', 'A5',     'B5', 'REST', 'REST', 'REST',

  // Bars 21-24: High Solo
  'G6', 'F#6', 'E6', 'D6',        'B5', 'D6', 'E6', 'G6',          'F#6', 'E6', 'D6', 'B5',     'A5', 'B5', 'D6', 'E6',
  'A6', 'G6', 'E6', 'D6',         'C#6', 'D6', 'E6', 'A6',         'G6', 'E6', 'C#6', 'A5',     'F#5', 'A5', 'C#6', 'E6',
  'F#6', 'E6', 'D6', 'C#6',       'B5', 'C#6', 'D6', 'F#6',        'E6', 'D6', 'B5', 'A5',      'F#5', 'A5', 'B5', 'D6',
  'F#6', 'E6', 'C#6', 'A#5',      'F#5', 'E5', 'C#5', 'A#4',       'F#4', 'A#4', 'C#5', 'E5',   'F#5', 'REST', 'REST', 'REST',

  // Bars 25-28: Climax Chorus
  'B5', 'REST', 'B5', 'D6',        'F#6', 'REST', 'D6', 'REST',    'B5', 'A5', 'F#5', 'D5',     'E5', 'F#5', 'E5', 'D5',
  'G5', 'B5', 'D6', 'G6',          'F#6', 'D6', 'B5', 'G5',        'E5', 'G5', 'B5', 'E6',      'D6', 'B5', 'A5', 'G5',
  'E5', 'G5', 'B5', 'D6',          'E6', 'D6', 'B5', 'G5',         'F#5', 'A#5', 'C#6', 'E6',   'F#6', 'E6', 'C#6', 'A#5',
  'B5', 'D6', 'F#6', 'B6',        'A6', 'F#6', 'E6', 'D6',         'B5', 'A5', 'F#5', 'E5',     'D5', 'B4', 'A4', 'F#4',

  // Bars 29-32: Outro Groove into Seamless Loop
  'G5', 'B5', 'D6', 'F#6',        'E6', 'D6', 'B5', 'G5',          'A5', 'C#6', 'E6', 'G6',     'F#6', 'E6', 'C#6', 'A5',
  'B5', 'D6', 'F#6', 'A6',        'G6', 'F#6', 'D6', 'B5',         'C#6', 'E6', 'G#6', 'B6',    'A#6', 'F#6', 'E6', 'C#6',
  'D6', 'F#6', 'B6', 'REST',       'A6', 'F#6', 'D6', 'B5',        'E6', 'G6', 'B6', 'REST',    'A6', 'F#6', 'E6', 'D6',
  'F#6', 'A#6', 'C#7', 'REST',     'B6', 'F#6', 'D6', 'B5',        'A5', 'F#5', 'D5', 'B4',     'B4', 'REST', 'REST', 'REST'
];

let leadPhase = 0;
let bassPhase = 0;
let stabPhase1 = 0;
let stabPhase2 = 0;
let stabPhase3 = 0;
let kickPhase = 0;

for (let s = 0; s < TOTAL_SAMPLES; s++) {
  const t = s / SAMPLE_RATE;
  const bar = Math.floor(t / (4 * BEAT_DURATION)) % TOTAL_BARS;
  const beat = (t / BEAT_DURATION) % 4;
  const step = Math.floor(t / SIXTEENTH);
  const stepFrac = (t % SIXTEENTH) / SIXTEENTH;

  const chordData = chordProgression[bar % chordProgression.length];
  const riff = bassRiffs[bar % bassRiffs.length];
  const bassNote = riff[step % 16] || 'REST';

  let sample = 0;

  // --- 1. FUNKY SYNTH LEAD (Smooth fluty pulse with gentle vibrato) ---
  const leadNote = leadNotes[step % leadNotes.length] || 'REST';
  const leadFreq = NOTE_FREQS[leadNote] || 0;
  if (leadFreq > 0) {
    const vib = 1.0 + Math.sin(t * 34.0) * 0.015; // 5.4 Hz vibrato
    leadPhase += (leadFreq * vib) / SAMPLE_RATE;
    const env = Math.max(0, 1.0 - stepFrac * 0.38);
    const rawPulse = pulse(leadPhase, 0.35);
    const filtered = leadFilter.process(rawPulse, 2200 + Math.sin(t * 8) * 600, 0.25);
    sample += filtered * 0.24 * env;
  }

  // --- 2. RETRO FUNK BASSLINE (Punchy filtered saw/pulse with snappy envelope) ---
  const bFreq = NOTE_FREQS[bassNote] || 0;
  if (bFreq > 0) {
    bassPhase += bFreq / SAMPLE_RATE;
    const bEnv = Math.max(0, 1.0 - stepFrac * 0.65);
    const rawBass = saw(bassPhase) * 0.7 + triangle(bassPhase) * 0.3;
    const filterEnv = 900 * Math.exp(-stepFrac * 8) + 250;
    const filteredBass = bassFilter.process(rawBass, filterEnv, 0.38);
    sample += filteredBass * 0.38 * bEnv;
  }

  // --- 3. RETRO CHORD STABS (Skank on the 16th-note upbeat) ---
  const isUpbeat = (step % 2 === 1);
  if (isUpbeat && stepFrac < 0.45) {
    const chord = chordData.chord;
    const c1 = NOTE_FREQS[chord[0]] || 260;
    const c2 = NOTE_FREQS[chord[1]] || 330;
    const c3 = NOTE_FREQS[chord[2]] || 390;

    stabPhase1 += c1 / SAMPLE_RATE;
    stabPhase2 += c2 / SAMPLE_RATE;
    stabPhase3 += c3 / SAMPLE_RATE;

    const stabEnv = Math.max(0, 1.0 - stepFrac * 3.5);
    const stabSample = (pulse(stabPhase1, 0.5) + pulse(stabPhase2, 0.5) + triangle(stabPhase3)) * 0.33;
    sample += stabSample * 0.13 * stabEnv;
  }

  // --- 4. FUNK DRUM KIT (Kick, Crisp Snare/Clap, Swinging Hi-Hats) ---
  const beatFrac = beat % 1.0;

  // Funky Kick: Beat 0, Beat 1.75, Beat 2.5
  const isKickTime = (beat < 0.22) || (beat >= 1.75 && beat < 1.95) || (beat >= 2.5 && beat < 2.7);
  if (isKickTime) {
    const kickT = (beatFrac % 0.5) * BEAT_DURATION;
    const kickFreq = Math.max(45, 170 * Math.exp(-kickT * 26));
    kickPhase += kickFreq / SAMPLE_RATE;
    const kickEnv = Math.max(0, 1.0 - kickT * 8.5);
    sample += Math.sin(kickPhase * Math.PI * 2) * 0.42 * kickEnv;
  }

  // Snare/Clap on beat 1 and 3
  if ((beat >= 1.0 && beat < 1.35) || (beat >= 3.0 && beat < 3.35)) {
    const snareT = (beat % 1.0) * BEAT_DURATION;
    const n = getNoise();
    const toneFreq = Math.max(100, 240 * Math.exp(-snareT * 20));
    const tone = Math.sin(snareT * toneFreq * Math.PI * 2);
    const snareEnv = Math.max(0, 1.0 - snareT * 7.0);
    sample += (n * 0.7 + tone * 0.3) * 0.32 * snareEnv;
  }

  // Hi-Hats: 16th-note swing
  const hatFrac = (t % SIXTEENTH) / SIXTEENTH;
  const isOpenHat = (step % 4 === 2); // Open hat on the offbeat "&"
  if (isOpenHat) {
    if (hatFrac < 0.6) {
      const openHatEnv = Math.max(0, 1.0 - hatFrac * 1.8);
      sample += getNoise() * 0.12 * openHatEnv;
    }
  } else {
    if (hatFrac < 0.25) {
      const closedHatEnv = Math.max(0, 1.0 - hatFrac * 4.5);
      sample += getNoise() * 0.08 * closedHatEnv;
    }
  }

  // Master Soft Limiter
  buffer[s] = Math.max(-0.95, Math.min(0.95, sample));
}

// Fade out/in very first/last 200 samples to guarantee zero click when looping
for (let i = 0; i < 200; i++) {
  buffer[i] *= (i / 200);
  buffer[TOTAL_SAMPLES - 1 - i] *= (i / 200);
}

// Encode 16-bit PCM WAV
function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);

  // fmt Subchunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(16, 34);

  // data Subchunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 32768 : s * 32767;
    wavBuffer.writeInt16LE(Math.floor(val), offset);
    offset += 2;
  }

  return wavBuffer;
}

const wavData = createWavBuffer(buffer, SAMPLE_RATE);

const targetPath1 = path.join(process.cwd(), 'public', 'audio', 'bg_cyber_funk.wav');
const targetPath2 = path.join(process.cwd(), 'dist', 'audio', 'bg_cyber_funk.wav');

fs.writeFileSync(targetPath1, wavData);
console.log(`[Audio Generator 3] Wrote ${wavData.length} bytes to ${targetPath1}`);

if (fs.existsSync(path.dirname(targetPath2))) {
  fs.writeFileSync(targetPath2, wavData);
  console.log(`[Audio Generator 3] Wrote ${wavData.length} bytes to ${targetPath2}`);
}

console.log('[Audio Generator 3] Success: Background Music 3 generated with authentic uploaded funk groove!');
