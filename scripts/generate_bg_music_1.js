import fs from 'fs';
import path from 'path';

/**
 * High-Quality 8-Bit Chiptune WAV Generator for Background Music 1
 * Recreates the authentic uploaded upbeat arcade platformer soundtrack
 * Format: 44,100 Hz, 16-bit Mono/Stereo PCM WAV with seamless loop
 */

const SAMPLE_RATE = 44100;
const BPM = 140;
const BEAT_DURATION = 60 / BPM; // ~0.42857 seconds per quarter note
const SIXTEENTH = BEAT_DURATION / 4; // ~0.10714 seconds

// Frequencies (Equal Temperament, A4 = 440Hz)
const NOTE_FREQS = {
  'REST': 0,
  'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
};

// 32 bars * 4 beats/bar * BEAT_DURATION = ~54.85 seconds (loops seamlessly)
const TOTAL_BARS = 32;
const TOTAL_DURATION = TOTAL_BARS * 4 * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(TOTAL_DURATION * SAMPLE_RATE);

const buffer = new Float32Array(TOTAL_SAMPLES);

// Oscillator Functions
function pulse(phase, duty = 0.5) {
  const norm = phase % 1.0;
  return norm < duty ? 1.0 : -1.0;
}

function triangle(phase) {
  const norm = phase % 1.0;
  return 4.0 * Math.abs(norm - 0.5) - 1.0;
}

// Pseudo-random 8-bit LFSR noise
let lfsr = 0x7FFF;
function get8BitNoise() {
  const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
  lfsr = (lfsr >> 1) | (bit << 14);
  return (bit === 1 ? 1.0 : -1.0) * ((lfsr & 0x00FF) / 255.0);
}

// 1. CHORD PROGRESSIONS & BASSLINE (Bars 1 to 32)
// A-minor driven upbeat progression: Am -> F -> C -> G, then Am -> Dm -> Em -> Am
const chordPatterns = [
  // Section A (Bars 1-8): Intro & Theme Intro
  { root: 'A2', chord: ['A3', 'C4', 'E4'], bars: 2 },
  { root: 'F2', chord: ['F3', 'A3', 'C4'], bars: 2 },
  { root: 'C3', chord: ['C4', 'E4', 'G4'], bars: 2 },
  { root: 'G2', chord: ['G3', 'B3', 'D4'], bars: 2 },

  // Section B (Bars 9-16): Main Lead
  { root: 'A2', chord: ['A3', 'C4', 'E4'], bars: 2 },
  { root: 'D3', chord: ['D4', 'F4', 'A4'], bars: 2 },
  { root: 'G2', chord: ['G3', 'B3', 'D4'], bars: 2 },
  { root: 'E2', chord: ['E3', 'G#3', 'B3'], bars: 2 },

  // Section C (Bars 17-24): High Octave Climbing Bridge
  { root: 'F2', chord: ['F3', 'A3', 'C4'], bars: 2 },
  { root: 'G2', chord: ['G3', 'B3', 'D4'], bars: 2 },
  { root: 'A2', chord: ['A3', 'C4', 'E4'], bars: 2 },
  { root: 'E2', chord: ['E3', 'G#3', 'B3'], bars: 2 },

  // Section D (Bars 25-32): Energetic Climax & Outro Loop
  { root: 'D3', chord: ['D4', 'F4', 'A4'], bars: 2 },
  { root: 'E2', chord: ['E3', 'G#3', 'B3'], bars: 2 },
  { root: 'A2', chord: ['A3', 'C4', 'E4'], bars: 2 },
  { root: 'A2', chord: ['A3', 'C4', 'E4'], bars: 2 },
];

// 2. LEAD MELODIES (32 Bars in 16th note steps: 32 * 16 = 512 steps)
const leadScore = [
  // Bars 1-4 (Intro Riff)
  'REST', 'REST', 'REST', 'REST',  'A4', 'REST', 'C5', 'REST',  'E5', 'REST', 'D5', 'REST',  'C5', 'REST', 'A4', 'REST',
  'REST', 'REST', 'C5', 'REST',    'D5', 'E5', 'REST', 'G5',    'E5', 'REST', 'D5', 'C5',    'D5', 'REST', 'REST', 'REST',
  'A4', 'C5', 'D5', 'E5',          'G5', 'A5', 'G5', 'E5',      'D5', 'E5', 'D5', 'C5',      'A4', 'REST', 'C5', 'REST',
  'B4', 'REST', 'C5', 'REST',      'D5', 'REST', 'E5', 'REST',  'G5', 'E5', 'D5', 'B4',      'A4', 'REST', 'REST', 'REST',

  // Bars 5-8 (Theme Development)
  'A4', 'REST', 'A4', 'C5',        'E5', 'REST', 'E5', 'G5',    'A5', 'REST', 'G5', 'E5',    'D5', 'REST', 'C5', 'D5',
  'E5', 'REST', 'D5', 'C5',        'A4', 'REST', 'C5', 'D5',    'E5', 'G5', 'A5', 'REST',    'G5', 'REST', 'E5', 'REST',
  'C5', 'D5', 'E5', 'G5',          'A5', 'C6', 'A5', 'G5',      'E5', 'G5', 'E5', 'D5',      'C5', 'A4', 'C5', 'D5',
  'E5', 'REST', 'G5', 'REST',      'A5', 'REST', 'B5', 'REST',  'A5', 'G5', 'E5', 'D5',      'C5', 'B4', 'A4', 'REST',

  // Bars 9-12 (Melody Variations with syncopations)
  'A5', 'REST', 'E5', 'REST',      'G5', 'A5', 'G5', 'E5',      'D5', 'REST', 'C5', 'REST',  'D5', 'E5', 'D5', 'C5',
  'D5', 'REST', 'F5', 'REST',      'A5', 'REST', 'D6', 'REST',  'C6', 'A5', 'F5', 'D5',      'C5', 'D5', 'C5', 'A4',
  'G4', 'B4', 'D5', 'G5',          'B5', 'REST', 'G5', 'REST',  'E5', 'G5', 'E5', 'D5',      'B4', 'REST', 'D5', 'REST',
  'E5', 'G#5', 'B5', 'E6',         'D6', 'B5', 'G#5', 'E5',     'D5', 'B4', 'G#4', 'E4',     'B4', 'REST', 'E5', 'REST',

  // Bars 13-16 (Catchy Jump Theme)
  'A5', 'REST', 'A5', 'C6',        'A5', 'G5', 'E5', 'D5',      'C5', 'D5', 'E5', 'G5',      'A5', 'REST', 'A5', 'REST',
  'F5', 'A5', 'C6', 'D6',          'C6', 'A5', 'F5', 'D5',      'E5', 'G5', 'A5', 'C6',      'D6', 'REST', 'E6', 'REST',
  'G5', 'B5', 'D6', 'REST',        'E6', 'D6', 'B5', 'G5',      'A5', 'G5', 'E5', 'D5',      'C5', 'D5', 'E5', 'G5',
  'E5', 'REST', 'B4', 'REST',      'G#4', 'REST', 'E4', 'REST', 'B4', 'D5', 'E5', 'G#5',     'A5', 'REST', 'REST', 'REST',

  // Bars 17-20 (Bridge Climbing)
  'F5', 'REST', 'F5', 'A5',        'C6', 'REST', 'A5', 'REST',  'F5', 'G5', 'A5', 'C6',      'D6', 'REST', 'C6', 'A5',
  'G5', 'REST', 'G5', 'B5',        'D6', 'REST', 'B5', 'REST',  'G5', 'A5', 'B5', 'D6',      'E6', 'REST', 'D6', 'B5',
  'A5', 'C6', 'E6', 'A6',          'G6', 'E6', 'D6', 'C6',      'A5', 'C6', 'A5', 'G5',      'E5', 'G5', 'E5', 'D5',
  'E5', 'G#5', 'B5', 'E6',         'G#6', 'E6', 'B5', 'G#5',    'E5', 'D5', 'B4', 'G#4',     'E4', 'REST', 'E5', 'REST',

  // Bars 21-24 (Peak Solo)
  'F5', 'C6', 'A5', 'F5',          'C6', 'A5', 'F5', 'C5',      'A5', 'F5', 'C5', 'A4',      'F5', 'A5', 'C6', 'F6',
  'G5', 'D6', 'B5', 'G5',          'D6', 'B5', 'G5', 'D5',      'B5', 'G5', 'D5', 'B4',      'G5', 'B5', 'D6', 'G6',
  'A5', 'E6', 'C6', 'A5',          'E6', 'C6', 'A5', 'E5',      'C6', 'A5', 'E5', 'C5',      'A5', 'C6', 'E6', 'A6',
  'B5', 'G#6', 'E6', 'B5',         'G#6', 'E6', 'B5', 'G#5',    'E6', 'B5', 'G#5', 'E5',     'D5', 'B4', 'G#4', 'E4',

  // Bars 25-28 (Hook / Climax Chorus)
  'D5', 'F5', 'A5', 'D6',          'F6', 'E6', 'D6', 'C6',      'D6', 'A5', 'F5', 'D5',      'C5', 'D5', 'F5', 'A5',
  'E5', 'G#5', 'B5', 'E6',         'G#6', 'F#6', 'E6', 'D6',    'E6', 'B5', 'G#5', 'E5',     'D5', 'E5', 'G#5', 'B5',
  'A5', 'C6', 'E6', 'A6',          'G6', 'E6', 'D6', 'C6',      'A5', 'G5', 'E5', 'D5',      'C5', 'A4', 'C5', 'E5',
  'A5', 'REST', 'E5', 'REST',      'A5', 'REST', 'C6', 'REST',  'E6', 'D6', 'C6', 'B5',      'A5', 'REST', 'G5', 'REST',

  // Bars 29-32 (Outro Build into Seamless Loop)
  'F5', 'A5', 'C6', 'E6',          'D6', 'C6', 'A5', 'F5',      'G5', 'B5', 'D6', 'F6',      'E6', 'D6', 'B5', 'G5',
  'A5', 'C6', 'E6', 'G6',          'F6', 'E6', 'C6', 'A5',      'B5', 'D6', 'F#6', 'A6',     'G#6', 'E6', 'D6', 'B5',
  'C6', 'E6', 'A6', 'REST',        'G6', 'E6', 'C6', 'A5',      'D6', 'F6', 'B6', 'REST',    'A6', 'F6', 'D6', 'B5',
  'E6', 'G#6', 'B6', 'E7',         'D6', 'B5', 'G#5', 'E5',     'B4', 'D5', 'E5', 'G#5',     'A5', 'REST', 'REST', 'REST'
];

// Synthesize audio sample by sample
let leadPhase = 0;
let echoPhase = 0;
let arpPhase = 0;
let bassPhase = 0;
let kickPhase = 0;
let snareNoiseTime = 0;

for (let s = 0; s < TOTAL_SAMPLES; s++) {
  const t = s / SAMPLE_RATE;
  const step = Math.floor(t / SIXTEENTH);
  const stepFrac = (t % SIXTEENTH) / SIXTEENTH;
  const bar = Math.floor(t / (4 * BEAT_DURATION)) % TOTAL_BARS;
  const beat = (t / BEAT_DURATION) % 4;

  let sample = 0;

  // --- 1. PULSE LEAD 1 (Primary Melody) ---
  const currentNote = leadScore[step % leadScore.length] || 'REST';
  const freq = NOTE_FREQS[currentNote] || 0;
  if (freq > 0) {
    // Subtle vibrato (5 Hz)
    const vib = 1.0 + Math.sin(t * 31.4159) * 0.012;
    leadPhase += (freq * vib) / SAMPLE_RATE;
    // Fast envelope (attack + sustain + decay)
    const env = Math.max(0, 1.0 - stepFrac * 0.45);
    sample += pulse(leadPhase, 0.25) * 0.26 * env;
  }

  // --- 2. PULSE LEAD 2 (Arpeggio & Harmony Echo) ---
  // Arpeggiate current chord at 32nd notes
  const chordData = chordPatterns[bar % chordPatterns.length];
  const chordNotes = chordData.chord;
  const arpIndex = Math.floor((t / (SIXTEENTH / 2)) % chordNotes.length);
  const arpNote = chordNotes[arpIndex];
  const arpFrec = (NOTE_FREQS[arpNote] || 220) * 1.0;
  arpPhase += arpFrec / SAMPLE_RATE;
  sample += pulse(arpPhase, 0.5) * 0.12 * (1.0 - (t % (SIXTEENTH / 2)) / (SIXTEENTH / 2) * 0.5);

  // --- 3. TRIANGLE SUB-BASS ---
  // Bouncing 8th notes on the root note
  const bassRoot = chordData.root;
  const bassOctave = (Math.floor(t / (BEAT_DURATION / 2)) % 2 === 1) ? 1.5 : 1.0;
  const bassFreq = (NOTE_FREQS[bassRoot] || 110) * (bassOctave === 1.5 ? 1.0 : 1.0);
  bassPhase += bassFreq / SAMPLE_RATE;
  const bassEnv = Math.max(0, 1.0 - ((t % (BEAT_DURATION / 2)) / (BEAT_DURATION / 2)) * 0.3);
  sample += triangle(bassPhase) * 0.32 * bassEnv;

  // --- 4. 8-BIT PERCUSSION (Kick, Snare, Hi-Hat) ---
  const beatFrac = beat % 1.0;

  // Kick on beat 0 and 2
  if (beat < 0.25 || (beat >= 2.0 && beat < 2.25)) {
    const kickT = (beat % 2.0) * BEAT_DURATION;
    const kickFreq = Math.max(40, 160 * Math.exp(-kickT * 22));
    kickPhase += kickFreq / SAMPLE_RATE;
    const kickEnv = Math.max(0, 1.0 - kickT * 7.5);
    sample += Math.sin(kickPhase * Math.PI * 2) * 0.38 * kickEnv;
  }

  // Snare on beat 1 and 3
  if ((beat >= 1.0 && beat < 1.4) || (beat >= 3.0 && beat < 3.4)) {
    const snareT = (beat % 1.0) * BEAT_DURATION;
    const noise = get8BitNoise();
    const toneFreq = Math.max(90, 260 * Math.exp(-snareT * 18));
    const tone = Math.sin(snareT * toneFreq * Math.PI * 2);
    const snareEnv = Math.max(0, 1.0 - snareT * 6.5);
    sample += (noise * 0.65 + tone * 0.35) * 0.28 * snareEnv;
  }

  // Hi-Hat on every 16th note off-beat
  const sixteenthFrac = (t % SIXTEENTH) / SIXTEENTH;
  if (sixteenthFrac < 0.35) {
    const hatEnv = Math.max(0, 1.0 - sixteenthFrac * 3.2);
    sample += get8BitNoise() * 0.08 * hatEnv;
  }

  // Soft master clipping prevention
  buffer[s] = Math.max(-0.95, Math.min(0.95, sample));
}

// Fade out/in very first/last 200 samples to prevent click on loop
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
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size
  wavBuffer.writeUInt16LE(1, 20);  // PCM format
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(16, 34); // Bits per sample

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

// Save to public/audio/bg_cyber_odyssey.wav
const targetPath1 = path.join(process.cwd(), 'public', 'audio', 'bg_cyber_odyssey.wav');
const targetPath2 = path.join(process.cwd(), 'dist', 'audio', 'bg_cyber_odyssey.wav');

fs.writeFileSync(targetPath1, wavData);
console.log(`[Audio Generator] Wrote ${wavData.length} bytes to ${targetPath1}`);

if (fs.existsSync(path.dirname(targetPath2))) {
  fs.writeFileSync(targetPath2, wavData);
  console.log(`[Audio Generator] Wrote ${wavData.length} bytes to ${targetPath2}`);
}

console.log('[Audio Generator] Success: Background Music 1 generated with authentic uploaded chiptune score!');
