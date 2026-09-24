import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Studio 8-Bit Chiptune Generator for Start Menu Background Music
 * Recreates the authentic uploaded upbeat retro arcade platformer title theme
 * Format: 44,100 Hz, 16-bit PCM WAV + High-Quality MP3 via ffmpeg with seamless loop
 */

const SAMPLE_RATE = 44100;
const BPM = 130;
const BEAT_DURATION = 60 / BPM; // ~0.4615 seconds per quarter note
const SIXTEENTH = BEAT_DURATION / 4; // ~0.11538 seconds

// Standard Note Frequencies (A4 = 440Hz)
const NOTE_FREQS = {
  'REST': 0,
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
};

// 32 bars * 4 beats/bar = 128 beats (~59.08 seconds)
const TOTAL_BARS = 32;
const TOTAL_DURATION = TOTAL_BARS * 4 * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(TOTAL_DURATION * SAMPLE_RATE);

const buffer = new Float32Array(TOTAL_SAMPLES);

// Waveform oscillators
function pulse(phase, duty = 0.5) {
  const norm = ((phase % 1.0) + 1.0) % 1.0;
  return norm < duty ? 1.0 : -1.0;
}

function triangle(phase) {
  const norm = ((phase % 1.0) + 1.0) % 1.0;
  return 4.0 * Math.abs(norm - 0.5) - 1.0;
}

// 8-bit LFSR noise for punchy retro percussion
let lfsr = 0x7ACE;
function get8BitNoise() {
  const bit = ((lfsr >> 0) ^ (lfsr >> 1) ^ (lfsr >> 3) ^ (lfsr >> 4)) & 1;
  lfsr = (lfsr >> 1) | (bit << 14);
  return (bit === 1 ? 1.0 : -1.0) * ((lfsr & 0x00FF) / 255.0);
}

// 32-Bar Harmonic Progression (C Major / A Minor Uplifting Platformer Theme)
// Section A: Intro Fanfare (Bars 1-8): C -> G -> Am -> F, C -> G -> F -> G
// Section B: Main Melody Hook (Bars 9-16): C -> Em -> F -> G, Am -> F -> G -> C
// Section C: Bright Adventure Bridge (Bars 17-24): F -> G -> Em -> Am, Dm -> G -> C -> G
// Section D: Triumphant Climax (Bars 25-32): C -> G -> Am -> Em, F -> C -> G -> C (Loop transition)
const chordPlan = [
  // Intro (Bars 1-4)
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'G2', chord: ['B3', 'D4', 'G4', 'B4'] },
  { root: 'A2', chord: ['A3', 'C4', 'E4', 'A4'] },
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  // Intro (Bars 5-8)
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'G2', chord: ['B3', 'D4', 'G4', 'D5'] },
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },

  // Verse A (Bars 9-12)
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'E2', chord: ['E3', 'G3', 'B3', 'E4'] },
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },
  // Verse A (Bars 13-16)
  { root: 'A2', chord: ['A3', 'C4', 'E4', 'A4'] },
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },

  // Bridge (Bars 17-20)
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },
  { root: 'E2', chord: ['E3', 'G3', 'B3', 'E4'] },
  { root: 'A2', chord: ['A3', 'C4', 'E4', 'A4'] },
  // Bridge (Bars 21-24)
  { root: 'D2', chord: ['D3', 'F3', 'A3', 'D4'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'G2', chord: ['B3', 'D4', 'G4', 'B4'] },

  // Climax (Bars 25-28)
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'G2', chord: ['B3', 'D4', 'G4', 'D5'] },
  { root: 'A2', chord: ['A3', 'C4', 'E4', 'A4'] },
  { root: 'E2', chord: ['E3', 'G3', 'B3', 'E4'] },
  // Outro resolution (Bars 29-32)
  { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'] },
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
  { root: 'G2', chord: ['G3', 'B3', 'D4', 'G4'] },
  { root: 'C3', chord: ['C4', 'E4', 'G4', 'C5'] },
];

// Lead Melody score: 32 bars * 16 steps/bar = 512 steps
const leadScore = [
  // Bars 1-4: Cheerful Opening Fanfare
  'C5', 'REST', 'E5', 'REST',    'G5', 'REST', 'C6', 'REST',    'B5', 'REST', 'G5', 'REST',    'E5', 'REST', 'D5', 'REST',
  'C5', 'D5', 'E5', 'G5',        'A5', 'REST', 'G5', 'REST',    'F5', 'REST', 'E5', 'D5',      'C5', 'REST', 'D5', 'REST',
  'E5', 'REST', 'E5', 'REST',    'G5', 'E5', 'D5', 'C5',        'A4', 'REST', 'C5', 'REST',    'D5', 'E5', 'D5', 'REST',
  'C5', 'REST', 'D5', 'REST',    'E5', 'G5', 'A5', 'B5',        'C6', 'REST', 'B5', 'A5',      'G5', 'REST', 'REST', 'REST',

  // Bars 5-8: Bouncy Riff with Syncopations
  'G5', 'REST', 'E5', 'C5',      'D5', 'E5', 'D5', 'C5',        'B4', 'REST', 'D5', 'G5',      'B5', 'REST', 'A5', 'G5',
  'A5', 'REST', 'F5', 'D5',      'C5', 'D5', 'E5', 'F5',        'G5', 'REST', 'E5', 'C5',      'D5', 'REST', 'REST', 'REST',
  'C5', 'E5', 'G5', 'C6',        'B5', 'G5', 'E5', 'D5',        'C5', 'A4', 'C5', 'E5',        'D5', 'C5', 'B4', 'A4',
  'G4', 'B4', 'D5', 'G5',        'B5', 'D6', 'C6', 'B5',        'C6', 'REST', 'REST', 'REST',  'REST', 'REST', 'G5', 'REST',

  // Bars 9-12: Main Upbeat Theme (Happy Bouncing Melody)
  'C6', 'REST', 'G5', 'REST',    'E5', 'G5', 'C6', 'D6',        'E6', 'REST', 'D6', 'C6',      'B5', 'REST', 'G5', 'REST',
  'A5', 'REST', 'F5', 'REST',    'D5', 'F5', 'A5', 'B5',        'C6', 'REST', 'B5', 'A5',      'G5', 'REST', 'E5', 'REST',
  'F5', 'G5', 'A5', 'C6',        'D6', 'REST', 'C6', 'B5',      'C6', 'REST', 'G5', 'REST',    'E5', 'REST', 'C5', 'REST',
  'D5', 'E5', 'F5', 'G5',        'A5', 'B5', 'C6', 'D6',        'B5', 'REST', 'G5', 'REST',    'G5', 'A5', 'B5', 'REST',

  // Bars 13-16: Theme Variations with Playful Skips
  'C6', 'REST', 'C6', 'E6',      'D6', 'C6', 'B5', 'A5',        'G5', 'REST', 'G5', 'B5',      'A5', 'G5', 'F5', 'E5',
  'F5', 'REST', 'A5', 'REST',    'C6', 'REST', 'D6', 'REST',    'E6', 'D6', 'C6', 'B5',        'A5', 'REST', 'G5', 'REST',
  'F5', 'E5', 'D5', 'C5',        'D5', 'REST', 'E5', 'REST',    'F5', 'G5', 'A5', 'B5',        'C6', 'REST', 'D6', 'REST',
  'E6', 'REST', 'D6', 'REST',    'C6', 'REST', 'B5', 'REST',    'C6', 'REST', 'REST', 'REST',  'REST', 'REST', 'REST', 'REST',

  // Bars 17-20: Uplifting Bridge
  'A5', 'REST', 'A5', 'C6',      'B5', 'A5', 'G5', 'F5',        'G5', 'REST', 'G5', 'B5',      'C6', 'B5', 'A5', 'G5',
  'E5', 'REST', 'G5', 'REST',    'B5', 'REST', 'D6', 'REST',    'C6', 'B5', 'A5', 'G5',        'A5', 'REST', 'E5', 'REST',
  'F5', 'REST', 'A5', 'C6',      'F6', 'REST', 'E6', 'D6',      'E6', 'REST', 'C6', 'G5',      'A5', 'REST', 'F5', 'REST',
  'D5', 'F5', 'A5', 'D6',        'C6', 'B5', 'A5', 'G5',        'F5', 'E5', 'D5', 'C5',        'D5', 'REST', 'G5', 'REST',

  // Bars 21-24: Bridge Crescendo
  'F5', 'REST', 'F5', 'A5',      'G5', 'REST', 'G5', 'B5',      'A5', 'REST', 'A5', 'C6',      'B5', 'REST', 'B5', 'D6',
  'C6', 'REST', 'C6', 'E6',      'D6', 'C6', 'B5', 'A5',        'G5', 'A5', 'B5', 'C6',        'D6', 'REST', 'E6', 'REST',
  'F6', 'REST', 'E6', 'D6',      'C6', 'REST', 'B5', 'A5',      'G5', 'REST', 'A5', 'B5',      'C6', 'D6', 'E6', 'REST',
  'D6', 'REST', 'B5', 'REST',    'G5', 'REST', 'D5', 'REST',    'G5', 'REST', 'A5', 'REST',    'B5', 'REST', 'REST', 'REST',

  // Bars 25-28: Triumphant Climax
  'C6', 'REST', 'E6', 'REST',    'G6', 'REST', 'E6', 'REST',    'D6', 'C6', 'B5', 'A5',        'G5', 'REST', 'E5', 'REST',
  'F5', 'A5', 'C6', 'F6',        'E6', 'D6', 'C6', 'B5',        'C6', 'REST', 'A5', 'REST',    'G5', 'REST', 'E5', 'REST',
  'A5', 'REST', 'C6', 'REST',    'E6', 'D6', 'C6', 'B5',        'A5', 'REST', 'G5', 'REST',    'F5', 'REST', 'E5', 'REST',
  'D5', 'F5', 'A5', 'D6',        'C6', 'B5', 'A5', 'G5',        'F5', 'G5', 'A5', 'B5',        'C6', 'REST', 'D6', 'REST',

  // Bars 29-32: Joyful Resolution & Seamless Loop Outro
  'E6', 'REST', 'D6', 'REST',    'C6', 'REST', 'B5', 'REST',    'A5', 'REST', 'G5', 'REST',    'F5', 'REST', 'E5', 'REST',
  'F5', 'REST', 'A5', 'REST',    'C6', 'REST', 'F6', 'REST',    'E6', 'D6', 'C6', 'B5',        'C6', 'REST', 'G5', 'REST',
  'D5', 'E5', 'F5', 'G5',        'A5', 'B5', 'C6', 'D6',        'E6', 'REST', 'D6', 'C6',      'B5', 'REST', 'G5', 'REST',
  'C6', 'REST', 'G5', 'REST',    'E5', 'REST', 'C5', 'REST',    'G4', 'C5', 'E5', 'G5',        'C6', 'REST', 'REST', 'REST',
];

// Phase accumulators
let phaseLead = 0;
let phaseArp = 0;
let phaseBass = 0;
let kickPhase = 0;

for (let s = 0; s < TOTAL_SAMPLES; s++) {
  const t = s / SAMPLE_RATE;
  const barIndex = Math.floor(t / (4 * BEAT_DURATION)) % TOTAL_BARS;
  const barTime = t % (4 * BEAT_DURATION);
  const beatTime = t % BEAT_DURATION;
  const stepIndex = Math.floor(t / SIXTEENTH) % 512;
  const sixteenthFrac = (t % SIXTEENTH) / SIXTEENTH;

  const currentChord = chordPlan[barIndex];
  let sample = 0;

  // 1. LEAD SYNTH (Square/Pulse with Vibrato and ADSR envelope)
  const leadNote = leadScore[stepIndex];
  const leadBaseFreq = NOTE_FREQS[leadNote] || 0;
  if (leadBaseFreq > 0) {
    const vibrato = Math.sin(t * 12.0 * Math.PI * 2) * 0.015;
    const freq = leadBaseFreq * (1.0 + vibrato);
    phaseLead += freq / SAMPLE_RATE;

    // Snappy retro attack, slight decay, sustain
    let env = 1.0;
    if (sixteenthFrac < 0.15) {
      env = sixteenthFrac / 0.15;
    } else if (sixteenthFrac > 0.75) {
      env = Math.max(0, 1.0 - (sixteenthFrac - 0.75) / 0.25);
    }

    const pulseDuty = stepIndex % 4 === 0 ? 0.35 : 0.5;
    sample += pulse(phaseLead, pulseDuty) * 0.24 * env;
  }

  // 2. ARPEGGIO / CHORD HARMONY (Rapid 16th-note sweeps on 12.5% duty pulse)
  const arpIndex = Math.floor(t / (SIXTEENTH * 0.5)) % 4;
  const arpNote = currentChord.chord[arpIndex];
  const arpFreq = NOTE_FREQS[arpNote] || 0;
  if (arpFreq > 0) {
    phaseArp += arpFreq / SAMPLE_RATE;
    const arpEnv = Math.max(0.1, 1.0 - (sixteenthFrac % 0.5) * 1.6);
    sample += pulse(phaseArp, 0.125) * 0.12 * arpEnv;
  }

  // 3. BASSLINE (Bouncy Triangle Wave on Chord Root & Octaves)
  const bassBeatStep = Math.floor((t % BEAT_DURATION) / (BEAT_DURATION / 4));
  let bassPitch = NOTE_FREQS[currentChord.root] || 130;
  if (bassBeatStep === 1 || bassBeatStep === 3) {
    bassPitch *= 2; // Bouncy octave leap
  }
  phaseBass += bassPitch / SAMPLE_RATE;
  const bassEnv = Math.max(0, 1.0 - ((t % (BEAT_DURATION / 2)) / (BEAT_DURATION / 2)) * 0.65);
  sample += triangle(phaseBass) * 0.28 * bassEnv;

  // 4. RETRO 8-BIT PERCUSSION
  // 4a. Kick drum (Beats 1 & 3, plus syncopated punch on beat 2.5)
  const beatInBar = (t % (4 * BEAT_DURATION)) / BEAT_DURATION;
  const isKickBeat = (beatInBar < 0.22) || (beatInBar >= 2.0 && beatInBar < 2.22) || (beatInBar >= 3.5 && beatInBar < 3.72);
  if (isKickBeat) {
    const kickTime = (beatInBar % 1.0) * BEAT_DURATION;
    const kickFreq = Math.max(38, 145 * Math.exp(-kickTime * 32));
    kickPhase += kickFreq / SAMPLE_RATE;
    const kickEnv = Math.max(0, 1.0 - kickTime * 14);
    sample += Math.sin(kickPhase * Math.PI * 2) * 0.32 * kickEnv;
  }

  // 4b. Snappy Snare Drum (Beats 2 & 4)
  const isSnareBeat = (beatInBar >= 1.0 && beatInBar < 1.25) || (beatInBar >= 3.0 && beatInBar < 3.25);
  if (isSnareBeat) {
    const snareTime = (beatInBar % 1.0) * BEAT_DURATION;
    const snareEnv = Math.max(0, 1.0 - snareTime * 18);
    const snareNoise = get8BitNoise();
    const snareBody = Math.sin(snareTime * 180 * Math.PI * 2) * Math.exp(-snareTime * 20);
    sample += (snareNoise * 0.22 + snareBody * 0.12) * snareEnv;
  }

  // 4c. Closed & Open Hi-Hats (16th notes)
  if (sixteenthFrac < 0.32) {
    const isOffbeat = stepIndex % 2 === 1;
    const hatDecay = isOffbeat ? 4.0 : 8.0; // Open hat on offbeats
    const hatEnv = Math.max(0, 1.0 - sixteenthFrac * hatDecay);
    sample += get8BitNoise() * (isOffbeat ? 0.08 : 0.05) * hatEnv;
  }

  // 4d. Crash cymbal on Bar 1 & Bar 17
  if (barIndex === 0 || barIndex === 16) {
    if (barTime < 1.2) {
      const crashEnv = Math.max(0, 1.0 - barTime / 1.2);
      sample += get8BitNoise() * 0.12 * crashEnv;
    }
  }

  // Soft master clipping prevention
  buffer[s] = Math.max(-0.95, Math.min(0.95, sample));
}

// Seamless loop crossfade at start/end
for (let i = 0; i < 300; i++) {
  buffer[i] *= (i / 300);
  buffer[TOTAL_SAMPLES - 1 - i] *= (i / 300);
}

// Encode 16-bit PCM WAV
function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);

  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(16, 34);

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

// Output paths
const publicDir = path.join(process.cwd(), 'public', 'audio');
const distDir = path.join(process.cwd(), 'dist', 'audio');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const wavPathPublic = path.join(publicDir, 'bg_start_menu.wav');
const mp3PathPublic = path.join(publicDir, 'bg_start_menu.mp3');

fs.writeFileSync(wavPathPublic, wavData);
console.log(`[Audio Generator] Generated WAV (${wavData.length} bytes): ${wavPathPublic}`);

// Convert to MP3 using ffmpeg
try {
  execSync(`ffmpeg -y -i "${wavPathPublic}" -codec:a libmp3lame -b:a 192k "${mp3PathPublic}"`, { stdio: 'inherit' });
  console.log(`[Audio Generator] Generated MP3 (${fs.statSync(mp3PathPublic).size} bytes): ${mp3PathPublic}`);
} catch (err) {
  console.warn('[Audio Generator] ffmpeg conversion warning:', err.message);
}

// Copy to dist if dist exists
if (fs.existsSync(distDir)) {
  const wavPathDist = path.join(distDir, 'bg_start_menu.wav');
  const mp3PathDist = path.join(distDir, 'bg_start_menu.mp3');
  fs.copyFileSync(wavPathPublic, wavPathDist);
  if (fs.existsSync(mp3PathPublic)) {
    fs.copyFileSync(mp3PathPublic, mp3PathDist);
  }
  console.log(`[Audio Generator] Copied assets to ${distDir}`);
}

console.log('[Audio Generator] Success: Start Menu BGM generated with authentic 8-bit chiptune score!');
