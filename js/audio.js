// Procedural music and sound effects with the Web Audio API.
// No audio files: every song and sound is synthesized here, so it is all original.
window.BAG = window.BAG || {};

BAG.Audio = (function () {
  const A = {};
  const KEY = 'bag_audio_v1';
  const S = { music: 0.6, sfx: 0.8, voice: 0.7, muted: false };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage blocked */ }
  A.settings = S;

  let ctx = null, master, musicBus, sfxBus, voiceBus, noiseBuf;
  let track = null, trackName = null, trackGain = null, step = 0, nextTime = 0, tempoMul = 1;
  let melodyEvents = new Map(), melodyLen = 0;
  A.onLyric = null;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  function apply() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(S.muted ? 0 : 0.9, t, 0.03);
    musicBus.gain.setTargetAtTime(S.music * 0.55, t, 0.05);
    sfxBus.gain.setTargetAtTime(S.sfx * 0.8, t, 0.05);
    voiceBus.gain.setTargetAtTime(S.voice * 0.5, t, 0.05);
  }

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    comp.connect(ctx.destination);
    master = ctx.createGain(); master.connect(comp);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    apply();
    setInterval(scheduler, 25);
    if (A._pending) { const p = A._pending; A._pending = null; A.playTrack(p); }
  };

  A.ready = () => !!ctx;
  A.toggleMute = function () { S.muted = !S.muted; apply(); save(); return S.muted; };
  A.setMuted = function (m) { S.muted = m; apply(); save(); };
  A.setVol = function (kind, v) { S[kind] = v; apply(); save(); };
  A.hostelMode = function () { S.music = 0.15; S.sfx = 0.25; S.voice = 0.15; S.muted = false; apply(); save(); };
  A.setTempo = function (m) { tempoMul = m; };

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function env(g, t, a, peak, dur, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function noise(t, dur, filterType, freq, q, peak, bus) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
    return f;
  }

  function tone(t, type, freq, dur, peak, bus, opts) {
    opts = opts || {};
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide || dur));
    if (opts.detune) o.detune.value = opts.detune;
    const g = ctx.createGain();
    env(g, t, opts.attack || 0.005, peak, dur, opts.release || dur * 0.6);
    let node = o;
    if (opts.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lp; node.connect(f); node = f; }
    if (opts.bp) { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = opts.bp; f.Q.value = opts.q || 1; node.connect(f); node = f; }
    node.connect(g); g.connect(bus);
    if (opts.vib) {
      const l = ctx.createOscillator(); l.frequency.value = opts.vib;
      const lg = ctx.createGain(); lg.gain.value = freq * (opts.vibDepth || 0.01);
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  // ---- Drum kit ----
  function drum(kind, ch, t, out) {
    if (kind === 'dhol') {
      if (ch === 'B' || ch === 'b') {
        const strong = ch === 'B';
        tone(t, 'sine', strong ? 150 : 120, 0.32, strong ? 0.9 : 0.55, out, { to: 52, glide: 0.18 });
        noise(t, 0.06, 'bandpass', 800, 1, strong ? 0.35 : 0.2, out);
      } else if (ch === 't') {
        noise(t, 0.07, 'bandpass', 2600, 2, 0.35, out);
        tone(t, 'triangle', 620, 0.05, 0.12, out);
      }
    } else if (kind === 'chimta') {
      tone(t, 'triangle', 2300, 0.05, 0.05, out);
      tone(t, 'triangle', 3450, 0.04, 0.04, out);
    } else if (kind === 'clap') {
      for (let i = 0; i < 3; i++) noise(t + i * 0.012, 0.05, 'bandpass', 1300, 1.2, 0.3, out);
    } else if (kind === 'kick') {
      tone(t, 'sine', 120, 0.25, 0.9, out, { to: 42, glide: 0.12 });
    } else if (kind === 'cricket') {
      for (let i = 0; i < 3; i++) tone(t + i * 0.045, 'sine', 4300 + Math.random() * 300, 0.03, 0.06, out);
    }
  }

  // ---- Lead instruments ----
  function lead(type, t, midi, dur, out) {
    const f = mtof(midi);
    if (type === 'shehnai') {
      tone(t, 'sawtooth', f * 0.97, dur, 0.13, out, { to: f, glide: 0.05, bp: 1300, q: 1.4, vib: 5.5, vibDepth: 0.012, attack: 0.03, release: 0.08 });
      tone(t, 'square', f * 1.003, dur, 0.05, out, { lp: 2600, vib: 5.5, vibDepth: 0.012, attack: 0.03, release: 0.08 });
    } else if (type === 'harmonium') {
      tone(t, 'sawtooth', f, dur, 0.08, out, { lp: 1500, detune: -7, attack: 0.07, release: 0.12 });
      tone(t, 'sawtooth', f, dur, 0.08, out, { lp: 1500, detune: 7, attack: 0.07, release: 0.12 });
    } else if (type === 'brass') {
      // Raju Band Party: three slightly out-of-tune horns, on purpose.
      for (let i = 0; i < 3; i++) {
        tone(t, 'square', f, dur, 0.05, out, { lp: 1900, detune: (Math.random() - 0.5) * 50, attack: 0.02, release: 0.06 });
      }
    } else if (type === 'whistle') {
      tone(t, 'sine', f * 2, dur, 0.1, out, { vib: 7, vibDepth: 0.015, attack: 0.01, release: 0.05 });
    } else if (type === 'synth') {
      // filmy synth lead: two detuned saws with a quick filter pluck
      tone(t, 'sawtooth', f, dur, 0.07, out, { lp: 2400, detune: -9, attack: 0.01, release: 0.06, vib: 6, vibDepth: 0.006 });
      tone(t, 'sawtooth', f * 2, dur, 0.04, out, { lp: 3000, detune: 9, attack: 0.01, release: 0.06 });
    } else if (type === 'flute') {
      tone(t, 'sine', f * 2, dur, 0.11, out, { vib: 5, vibDepth: 0.008, attack: 0.04, release: 0.1 });
      tone(t, 'triangle', f * 2, dur, 0.04, out, { attack: 0.04, release: 0.1 });
      noise(t, Math.min(dur, 0.12), 'bandpass', 3000, 0.8, 0.03, out);
    }
  }

  function degreeMidi(tr, tok) {
    let oct = 0;
    while (tok[0] === '_') { oct--; tok = tok.slice(1); }
    while (tok[0] === '^') { oct++; tok = tok.slice(1); }
    const n = parseInt(tok, 10) - 1;
    const idx = ((n % 7) + 7) % 7;
    const o = Math.floor(n / 7) + oct;
    return tr.root + tr.scale[idx] + 12 * o;
  }

  function parseMelody(tr) {
    melodyEvents = new Map(); melodyLen = 0;
    if (!tr.melody) return;
    const toks = tr.melody.split(/\s+/).filter(x => x && x !== '|');
    melodyLen = toks.length * 2; // eighth notes -> sixteenth steps
    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i];
      if (tk === '.' || tk === '-') continue;
      let len = 1;
      while (i + len < toks.length && toks[i + len] === '.') len++;
      melodyEvents.set(i * 2, { midi: degreeMidi(tr, tk), steps: len * 2 });
    }
  }

  A.playTrack = function (name) {
    if (!ctx) { A._pending = name; return; }
    if (name === trackName) return;
    trackName = name;
    if (trackGain) {
      const old = trackGain;
      old.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
      setTimeout(() => { try { old.disconnect(); } catch (e) { /* gone */ } }, 900);
    }
    track = name ? BAG.TRACKS[name] : null;
    trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    trackGain.gain.setTargetAtTime(1, ctx.currentTime, 0.08);
    trackGain.connect(musicBus);
    step = 0; nextTime = ctx.currentTime + 0.06;
    if (track) parseMelody(track);
    if (!track && A.onLyric) A.onLyric('');
  };
  A.currentTrack = () => trackName;

  function scheduler() {
    if (!ctx || !track || customEl) return;
    while (nextTime < ctx.currentTime + 0.12) {
      playStep(step, nextTime);
      nextTime += 60 / (track.bpm * tempoMul) / 4;
      step++;
    }
  }

  function playStep(s, t) {
    const tr = track, out = trackGain;
    const bar = Math.floor(s / 16), sb = s % 16;
    const stepDur = 60 / (tr.bpm * tempoMul) / 4;
    for (const k in tr.drums) {
      const ch = tr.drums[k][sb];
      if (ch && ch !== '.') drum(k, ch, t, out);
    }
    const deg = tr.chords[bar % tr.chords.length];
    if (tr.bassPat && tr.bassPat[sb] !== '.' && tr.lead) {
      const m = tr.root - 12 + tr.scale[(deg - 1) % 7];
      tone(t, 'triangle', mtof(m), stepDur * 3, tr.bassPat[sb] === 'X' ? 0.28 : 0.18, out, { lp: 700, release: 0.1 });
    }
    if (tr.drone && sb === 0) {
      const m = tr.root - 12;
      const barDur = stepDur * 16;
      tone(t, 'sawtooth', mtof(m), barDur, 0.03, out, { lp: 700, attack: 0.4, release: 0.4 });
      tone(t, 'sawtooth', mtof(m + 7), barDur, 0.022, out, { lp: 700, attack: 0.4, release: 0.4 });
    }
    if (melodyLen && tr.lead) {
      const ev = melodyEvents.get(s % melodyLen);
      if (ev) lead(tr.lead, t, ev.midi, ev.steps * stepDur * 0.95, out);
    }
    if (sb === 0 && bar % 2 === 0 && tr.lyrics && tr.lyrics.length && A.onLyric) {
      const line = tr.lyrics[(bar / 2) % tr.lyrics.length];
      const name = trackName;
      setTimeout(() => { if (trackName === name && A.onLyric) A.onLyric(line); }, Math.max(0, (t - ctx.currentTime) * 1000));
    }
  }

  // ---- Sound effects ----
  const FX = {
    click() { const t = ctx.currentTime; tone(t, 'sine', 140, 0.2, 0.6, sfxBus, { to: 55, glide: 0.15 }); noise(t, 0.05, 'bandpass', 900, 1, 0.2, sfxBus); },
    tadaa() {
      const t = ctx.currentTime;
      lead('shehnai', t, 74, 0.14, sfxBus); lead('shehnai', t + 0.13, 79, 0.35, sfxBus);
    },
    cooker() {
      const t = ctx.currentTime;
      noise(t, 0.9, 'bandpass', 2400, 6, 0.25, sfxBus);
      tone(t, 'sine', 1900, 0.85, 0.08, sfxBus, { to: 2300, glide: 0.4, vib: 9, vibDepth: 0.02 });
    },
    trombone() {
      const t = ctx.currentTime;
      [58, 57, 56, 55].forEach((m, i) => tone(t + i * 0.28, 'sawtooth', mtof(m), i === 3 ? 0.8 : 0.26, 0.14, sfxBus, { lp: 900, vib: i === 3 ? 6 : 0, vibDepth: 0.02, attack: 0.03 }));
    },
    ohh() {
      const t = ctx.currentTime;
      const f = noise(t, 1.0, 'bandpass', 900, 3, 0.35, sfxBus);
      f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(380, t + 0.9);
      tone(t, 'sawtooth', 220, 0.9, 0.05, sfxBus, { to: 160, lp: 800, attack: 0.1 });
    },
    dhan() {
      const t = ctx.currentTime;
      [0, 0.38, 0.76].forEach((d, i) => {
        tone(t + d, 'sine', 110, 0.5, 0.9, sfxBus, { to: 40, glide: 0.4 });
        noise(t + d, 0.25, 'lowpass', 400, 0.7, 0.4, sfxBus);
        const m = [50, 49, 46][i];
        tone(t + d, 'sawtooth', mtof(m), 0.35, 0.09, sfxBus, { lp: 1200 });
        tone(t + d, 'sawtooth', mtof(m + 3), 0.35, 0.07, sfxBus, { lp: 1200 });
      });
    },
    whoomp() { const t = ctx.currentTime; tone(t, 'sine', 220, 0.7, 0.6, sfxBus, { to: 28, glide: 0.65 }); },
    powerup() { const t = ctx.currentTime; tone(t, 'sawtooth', 60, 0.5, 0.15, sfxBus, { to: 240, glide: 0.45, lp: 900 }); FX.click(); },
    pickup() { const t = ctx.currentTime; tone(t, 'square', 880, 0.08, 0.08, sfxBus, { lp: 3000 }); tone(t + 0.07, 'square', 1320, 0.1, 0.08, sfxBus, { lp: 3000 }); },
    flash() { const t = ctx.currentTime; noise(t, 0.12, 'highpass', 3000, 0.5, 0.4, sfxBus); tone(t, 'sine', 3000, 0.25, 0.05, sfxBus, { to: 6000 }); },
    pop() { const t = ctx.currentTime; noise(t, 0.04, 'highpass', 1500, 0.5, 0.5, sfxBus); },
    aye() { const t = ctx.currentTime; tone(t, 'square', 520, 0.3, 0.09, voiceBus, { to: 330, glide: 0.25, bp: 1100, q: 2 }); },
    alert() { const t = ctx.currentTime; tone(t, 'triangle', 988, 0.09, 0.12, sfxBus); tone(t + 0.1, 'triangle', 988, 0.09, 0.12, sfxBus); },
    bless() { const t = ctx.currentTime; [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.08, 'sine', mtof(m), 0.4, 0.1, sfxBus)); },
    firework() { const t = ctx.currentTime; noise(t, 0.6, 'lowpass', 1200, 0.5, 0.4, sfxBus); tone(t, 'sine', 90, 0.4, 0.4, sfxBus, { to: 40 }); },
    neigh() {
      const t = ctx.currentTime;
      tone(t, 'sawtooth', 700, 0.7, 0.1, sfxBus, { to: 380, glide: 0.65, vib: 14, vibDepth: 0.06, bp: 1400, q: 2 });
    },
    // TV-serial style sad violin meme
    sadviolin() {
      const t = ctx.currentTime;
      [69, 67, 65, 64, 62].forEach((m, i) => tone(t + i * 0.32, 'sawtooth', mtof(m), i === 4 ? 1.2 : 0.34, 0.07, sfxBus, { lp: 2200, bp: 1100, q: 0.8, vib: 6.5, vibDepth: 0.012, attack: 0.08 }));
    },
    dholriff() {
      const t = ctx.currentTime;
      'B.tB.tB.BtBtB.B.'.split('').forEach((ch, i) => { if (ch !== '.') drum('dhol', ch, t + i * 0.11, sfxBus); });
    },
    caralarm() {
      const t = ctx.currentTime;
      for (let i = 0; i < 6; i++) tone(t + i * 0.25, 'square', i % 2 ? 900 : 1300, 0.22, 0.06, sfxBus, { lp: 3000 });
    },
    slurp() { const t = ctx.currentTime; const f = noise(t, 0.5, 'bandpass', 600, 4, 0.3, sfxBus); f.frequency.exponentialRampToValueAtTime(2000, t + 0.45); },
    crunch() { const t = ctx.currentTime; for (let i = 0; i < 4; i++) noise(t + i * 0.04, 0.05, 'highpass', 2000, 0.5, 0.3, sfxBus); },
    knock() { const t = ctx.currentTime; for (let i = 0; i < 3; i++) { tone(t + i * 0.16, 'sine', 180, 0.08, 0.5, sfxBus, { to: 90 }); noise(t + i * 0.16, 0.04, 'bandpass', 500, 2, 0.3, sfxBus); } },
    boing() { const t = ctx.currentTime; tone(t, 'triangle', 300, 0.35, 0.15, sfxBus, { to: 900, glide: 0.2, vib: 18, vibDepth: 0.05 }); },
    gift() { const t = ctx.currentTime; [76, 79, 84].forEach((m, i) => tone(t + i * 0.06, 'triangle', mtof(m), 0.2, 0.1, sfxBus)); }
  };
  A.sfx = function (name) { if (ctx && FX[name]) FX[name](); };

  // ---- Real voices (browser speech synthesis) ----
  const synth = window.speechSynthesis || null;
  let voices = [];
  const FEMALE = /heera|neerja|kalpana|swara|veena|lekha|zira|aria|jenny|susan|hazel|samantha|female|sonia|libby|ava|emma/i;
  const MALE = /ravi|hemant|prabhat|madhur|rishi|david|mark|george|guy|male|ryan|daniel|brian|andrew/i;
  function loadVoices() { if (synth) voices = synth.getVoices(); }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice(g) {
    if (!voices.length) loadVoices();
    const want = g === 'f' ? FEMALE : MALE;
    const tiers = [
      v => /en-IN/i.test(v.lang) && want.test(v.name),
      v => /hi-IN/i.test(v.lang) && want.test(v.name),
      v => /en-IN/i.test(v.lang),
      v => /hi-IN/i.test(v.lang),
      v => /^en/i.test(v.lang) && want.test(v.name),
      v => /^en/i.test(v.lang)
    ];
    for (const f of tiers) { const v = voices.find(f); if (v) return v; }
    return null;
  }
  A.hasVoices = () => !!synth && voices.length > 0;
  // vp = {g, pitch, rate}; priority speech interrupts whoever is talking.
  A.speak = function (text, vp, priority) {
    if (S.muted || S.voice <= 0.01) return false;
    if (!synth || !voices.length) { A.babble(text, vp && vp.g === 'f' ? 260 : 130); return false; }
    if (!priority && (synth.speaking || synth.pending)) return false;
    if (priority) synth.cancel();
    const clean = text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/[#*"()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return false;
    const u = new SpeechSynthesisUtterance(clean);
    vp = vp || { g: 'm', pitch: 1, rate: 1 };
    const v = pickVoice(vp.g);
    if (v) { u.voice = v; u.lang = v.lang; }
    // a female voice reading a male part gets pitched down, and the other way round
    let pitch = vp.pitch;
    if (v && vp.g === 'm' && FEMALE.test(v.name)) pitch *= 0.75;
    if (v && vp.g === 'f' && MALE.test(v.name)) pitch *= 1.3;
    u.pitch = Math.max(0.1, Math.min(2, pitch));
    u.rate = vp.rate;
    u.volume = Math.min(1, S.voice * 1.2);
    synth.speak(u);
    return true;
  };
  A.stopSpeech = function () { if (synth) synth.cancel(); };

  // ---- "Apna Gaana": play a song file from the player's own laptop ----
  let customEl = null, customSrc = null;
  A.playCustom = function (file) {
    A.init();
    A.stopCustom();
    customEl = new Audio(URL.createObjectURL(file));
    customEl.loop = true;
    customSrc = ctx.createMediaElementSource(customEl);
    customSrc.connect(musicBus);
    if (trackGain) trackGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
    customEl.play();
    if (A.onLyric) A.onLyric('');
  };
  A.stopCustom = function () {
    if (!customEl) return;
    customEl.pause(); URL.revokeObjectURL(customEl.src);
    try { customSrc.disconnect(); } catch (e) { /* gone */ }
    customEl = null; customSrc = null;
    const name = trackName; trackName = null; A.playTrack(name);
  };
  A.customOn = () => !!customEl;

  // Animal-Crossing style talking blips; pitch per character.
  A.babble = function (text, pitch) {
    if (!ctx || S.muted) return;
    const n = Math.min(9, Math.max(3, Math.round(text.length / 5)));
    const t = ctx.currentTime;
    for (let i = 0; i < n; i++) {
      const p = pitch * (0.85 + Math.random() * 0.35);
      tone(t + i * 0.065, 'triangle', p, 0.05, 0.12, voiceBus, { bp: p * 3, q: 1.5 });
    }
  };

  return A;
})();
