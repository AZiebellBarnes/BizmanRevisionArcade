// Lightweight WebAudio sound helper
// Usage: import { playSound } from './sound.js'; playSound('build');

let ctx = null;
let masterGain = null;
let lastPlay = new Map();

function ensureContext() {
  if (ctx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  ctx = new AudioCtx();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.15; // global volume
  masterGain.connect(ctx.destination);
  // Try to resume on user gesture
  const resume = () => ctx.state === 'suspended' && ctx.resume();
  window.addEventListener('pointerdown', resume, { once: true });
  window.addEventListener('keydown', resume, { once: true });
}

function beep({ freq = 440, dur = 0.1, type = 'sine', vol = 1, attack = 0.005, decay = 0.04 } = {}) {
  ensureContext();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + Math.max(decay, dur));
  osc.connect(gain).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.2);
}

function noise({ dur = 0.12, vol = 0.5 } = {}) {
  ensureContext();
  if (!ctx) return;
  const sr = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(sr * dur), sr);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.5;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.buffer = buffer;
  src.connect(gain).connect(masterGain);
  src.start();
}

function throttle(key, ms) {
  const now = performance.now();
  const last = lastPlay.get(key) || 0;
  if (now - last < ms) return true; // throttled
  lastPlay.set(key, now);
  return false;
}

export function playSound(name) {
  ensureContext();
  switch (name) {
    case 'click':
      if (throttle('click', 40)) return;
      beep({ freq: 400, dur: 0.03, type: 'triangle', vol: 0.25 });
      break;
    case 'correct':
      beep({ freq: 760, dur: 0.06, type: 'triangle', vol: 0.4 });
      beep({ freq: 1010, dur: 0.08, type: 'triangle', vol: 0.35 });
      break;
    case 'wrong':
      noise({ dur: 0.05, vol: 0.22 });
      beep({ freq: 220, dur: 0.07, type: 'square', vol: 0.3 });
      break;
    case 'build':
      if (throttle('build', 60)) return;
      beep({ freq: 520, dur: 0.07, type: 'triangle', vol: 0.6 });
      beep({ freq: 780, dur: 0.05, type: 'triangle', vol: 0.5, attack: 0.002 });
      break;
    case 'upgrade':
      beep({ freq: 660, dur: 0.08, type: 'sawtooth', vol: 0.5 });
      beep({ freq: 990, dur: 0.12, type: 'sawtooth', vol: 0.4 });
      break;
    case 'fire_cannon':
      if (throttle('fire', 70)) return;
      noise({ dur: 0.05, vol: 0.25 });
      beep({ freq: 220, dur: 0.04, type: 'square', vol: 0.3 });
      break;
    case 'tesla':
      if (throttle('tesla', 90)) return;
      beep({ freq: 1200, dur: 0.06, type: 'square', vol: 0.25 });
      break;
    case 'splash':
      if (throttle('splash', 120)) return;
      noise({ dur: 0.08, vol: 0.2 });
      break;
    case 'slow':
      beep({ freq: 300, dur: 0.06, type: 'triangle', vol: 0.25 });
      break;
    case 'alien_die':
      beep({ freq: 240, dur: 0.04, type: 'square', vol: 0.4 });
      beep({ freq: 160, dur: 0.06, type: 'square', vol: 0.35 });
      break;
    case 'hit':
      noise({ dur: 0.04, vol: 0.18 });
      break;
    case 'structure_destroyed':
      noise({ dur: 0.12, vol: 0.3 });
      beep({ freq: 140, dur: 0.08, type: 'square', vol: 0.3 });
      break;
    case 'hq_hit':
      beep({ freq: 110, dur: 0.12, type: 'sine', vol: 0.35 });
      break;
    case 'wave_start':
      beep({ freq: 520, dur: 0.07, type: 'square', vol: 0.35 });
      beep({ freq: 740, dur: 0.1, type: 'square', vol: 0.3 });
      break;
    case 'wave_clear':
      beep({ freq: 880, dur: 0.08, type: 'triangle', vol: 0.4 });
      beep({ freq: 1175, dur: 0.1, type: 'triangle', vol: 0.35 });
      break;
    case 'unlock':
      beep({ freq: 700, dur: 0.06, type: 'triangle', vol: 0.35 });
      break;
    default:
      break;
  }
}
