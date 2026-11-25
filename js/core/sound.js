// 音（25b 5章・P-20）：効果音と BGM を Web Audio で合成する（音のファイルは使わない）。
// ブラウザの決まりで、最初に画面を触るまでは音が出せない。スマホは最初は消音（設定で変えられる）。

let ac = null, master = null, sfxGain = null, bgmGain = null;
let cfg = { mute: false, sfx: 0.6, bgm: 0.35 };
let bgmMode = null, bgmTimer = null, nextNote = 0, step = 0;

export const isPhone = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
export function defaultSoundSettings() { return { mute: isPhone(), sfx: 0.6, bgm: 0.35 }; }

function ensure() {
  if (ac) return true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ac = new AC(); master = ac.createGain(); sfxGain = ac.createGain(); bgmGain = ac.createGain();
  sfxGain.connect(master); bgmGain.connect(master); master.connect(ac.destination);
  apply(); return true;
}
function apply() {
  if (!ac) return;
  master.gain.value = cfg.mute ? 0 : 1; sfxGain.gain.value = cfg.sfx; bgmGain.gain.value = cfg.bgm * 0.5;
}

function tone({ type = 'sine', f = 440, f2 = null, t = 0.1, v = 0.3, at = 0, out = sfxGain, attack = 0.005, filter = null }) {
  const now = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, now); if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t);
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(v, now + attack); g.gain.exponentialRampToValueAtTime(0.0001, now + t);
  let node = o; if (filter) { const fl = ac.createBiquadFilter(); fl.type = filter.type; fl.frequency.value = filter.f; o.connect(fl); node = fl; }
  node.connect(g); g.connect(out); o.start(now); o.stop(now + t + 0.05);
}
let noiseBuf = null;
function noise({ t = 0.15, v = 0.3, at = 0, type = 'bandpass', f = 1000, f2 = null, q = 1, out = sfxGain }) {
  if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const now = ac.currentTime + at, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, now); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + t);
  g.gain.setValueAtTime(v, now); g.gain.exponentialRampToValueAtTime(0.0001, now + t);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(now); s.stop(now + t + 0.05);
}

const SFX = {
  tap: () => tone({ f: 720, t: 0.05, v: 0.12 }),
  hit: () => { noise({ t: 0.09, v: 0.5, f: 1400 }); tone({ type: 'triangle', f: 140, f2: 70, t: 0.12, v: 0.4 }); },
  heavy: () => { noise({ t: 0.16, v: 0.6, f: 700 }); tone({ type: 'triangle', f: 100, f2: 45, t: 0.22, v: 0.5 }); },
  hurt: () => { tone({ type: 'sawtooth', f: 220, f2: 80, t: 0.18, v: 0.25, filter: { type: 'lowpass', f: 1200 } }); noise({ t: 0.1, v: 0.3, f: 500 }); },
  guard: () => { tone({ type: 'square', f: 1250, t: 0.12, v: 0.12 }); tone({ type: 'square', f: 1870, t: 0.09, v: 0.08 }); noise({ t: 0.05, v: 0.3, f: 3000 }); },
  dodge: () => noise({ t: 0.22, v: 0.35, type: 'highpass', f: 600, f2: 4000 }),
  break: () => { noise({ t: 0.45, v: 0.7, f: 900, f2: 200 }); for (let i = 0; i < 4; i++) noise({ t: 0.04, v: 0.5, f: 2500, at: i * 0.06 }); tone({ type: 'triangle', f: 90, f2: 40, t: 0.4, v: 0.5 }); },
  roar: () => { tone({ type: 'sawtooth', f: 120, f2: 70, t: 0.8, v: 0.3, attack: 0.08, filter: { type: 'lowpass', f: 700 } }); noise({ t: 0.8, v: 0.25, f: 300, f2: 150 }); },
  good: () => [523, 659, 784, 1046].forEach((f, i) => tone({ type: 'triangle', f, t: 0.25, v: 0.18, at: i * 0.08 })),
  faint: () => [392, 330, 262].forEach((f, i) => tone({ type: 'sine', f, t: 0.4, v: 0.2, at: i * 0.2 })),
  item: () => { tone({ f: 880, t: 0.08, v: 0.15 }); tone({ f: 1320, t: 0.12, v: 0.12, at: 0.06 }); },
};
export function sfx(name) { if (cfg.mute || !ensure() || ac.state !== 'running') return; SFX[name]?.(); }

// ─── BGM：雰囲気だけの短い繰り返し（五音の音階・ゆっくり） ─────────────
const SCALE = { base: [0, 2, 4, 7, 9], explore: [0, 3, 5, 7, 10], battle: [0, 3, 5, 7, 8] };
const TEMPO = { base: 0.62, explore: 0.5, battle: 0.26 };
const ROOT = { base: 57, explore: 55, battle: 50 }; // A3・G3・D3
const midi = n => 440 * 2 ** ((n - 69) / 12);
let drones = [];
function startDrone(mode) {
  stopDrone();
  for (const [d, det] of [[-12, -4], [-5, 3]]) {
    const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
    o.type = mode === 'battle' ? 'sawtooth' : 'triangle'; o.frequency.value = midi(ROOT[mode] + d); o.detune.value = det;
    fl.type = 'lowpass'; fl.frequency.value = mode === 'battle' ? 500 : 800; g.gain.value = 0.05;
    o.connect(fl); fl.connect(g); g.connect(bgmGain); o.start(); drones.push(o);
  }
}
function stopDrone() { drones.forEach(o => { try { o.stop(); } catch { /* 止まっている */ } }); drones = []; }
function schedule() {
  if (!ac || !bgmMode) return;
  while (nextNote < ac.currentTime + 0.3) {
    const sc = SCALE[bgmMode], beat = TEMPO[bgmMode];
    const at = nextNote - ac.currentTime;
    if (bgmMode === 'battle') {
      if (step % 2 === 0) tone({ type: 'triangle', f: 70, f2: 40, t: 0.15, v: 0.35, at: Math.max(0, at), out: bgmGain });
      if (step % 4 === 3 || Math.random() < 0.3) tone({ type: 'square', f: midi(ROOT.battle + 12 + sc[(step * 3) % 5]), t: 0.12, v: 0.05, at: Math.max(0, at), out: bgmGain, filter: { type: 'lowpass', f: 1500 } });
    } else if (Math.random() < 0.55) {
      const n = ROOT[bgmMode] + 12 + sc[Math.floor(Math.random() * 5)] + (Math.random() < 0.3 ? 12 : 0);
      tone({ type: 'triangle', f: midi(n), t: beat * 2.5, v: 0.09, at: Math.max(0, at), out: bgmGain, attack: 0.02 });
    }
    nextNote += beat; step++;
  }
}
export function bgm(mode) {
  if (mode === bgmMode) return;
  bgmMode = mode; clearInterval(bgmTimer); bgmTimer = null;
  if (!ac) return; // 触ったあとで始める
  stopDrone();
  if (!mode) return;
  startDrone(mode); nextNote = ac.currentTime + 0.1; step = 0; bgmTimer = setInterval(schedule, 100);
}

/** 設定を読み込む／変える */
export function configure(next) { cfg = { ...cfg, ...next }; apply(); }
/** 最初に画面を触ったときに音を使えるようにする */
export function unlockOnGesture() {
  const go = () => {
    if (!ensure()) return;
    if (ac.state === 'suspended') ac.resume();
    if (bgmMode && !bgmTimer) { const m = bgmMode; bgmMode = null; bgm(m); }
  };
  ['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, go, { passive: true }));
}
export const sound = { sfx, bgm, configure, unlockOnGesture, defaultSoundSettings };
