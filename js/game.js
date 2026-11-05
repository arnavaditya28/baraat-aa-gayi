// Core game: a big venue with a following camera, relatives, props, crises, phases, memes.
window.BAG = window.BAG || {};

(function () {
  const W = 1280, H = 720;          // screen size
  const WW = 2560, WH = 1600;       // world size
  const R = BAG.R, AU = BAG.Audio, CAST = BAG.CAST, CR = BAG.CRISES, PHASES = BAG.PHASES;
  const G = BAG.Game = {};
  const TIME_SCALE = 1.45;          // crisis timers are longer because the venue is bigger
  const PLAYER_SPEED = 265;

  let cv, c, bg;
  let state = 'title';
  let time = 0, lastTs = 0, hudT = 0, babbleCool = 0, uid = 0;
  let w = null;
  const keys = {}, pressed = {};
  const cam = { x: 900, y: 800, z: 0.9 };
  const mouse = { sx: -1, sy: -1, hover: null };

  // ---------- Venue layout (world coordinates) ----------
  const STATIONS = {
    stage: { rect: [900, 110, 640, 180], point: [1220, 318], label: 'Shamiyana', npc: 'tentwala' },
    dj: { rect: [520, 420, 170, 90], point: [605, 542], label: 'DJ Booth', npc: 'dj' },
    kitchen: { rect: [2200, 100, 300, 160], point: [2350, 294], label: 'Rasoi', npc: 'pandey' },
    buffet: { rect: [1880, 430, 320, 70], point: [2040, 530], label: 'Buffet', npc: 'pandey' },
    dessert: { rect: [1980, 760, 170, 56], point: [2065, 846], label: 'Mithai Counter', npc: 'pandey' },
    generator: { rect: [180, 1180, 110, 85], point: [328, 1222], label: 'Generator', npc: 'mama' },
    stable: { rect: [150, 1390, 180, 80], point: [240, 1372], label: "Rani ka Tabela", npc: 'lallan' },
    mandap: { rect: [1120, 760, 220, 170], point: [1230, 964], label: 'Mandap', npc: 'pandit' },
    bride: { rect: [1560, 1250, 380, 220], point: [1750, 1505], label: 'Dulhan Ka Kamra', npc: 'tina' },
    golgappa: { rect: [2330, 640, 150, 66], point: [2405, 740], label: 'Golgappa Stall', npc: 'golgappa' },
    chai: { rect: [2330, 960, 150, 66], point: [2405, 1060], label: 'Chai Stall', npc: 'chaiwala' },
    photo: { rect: [1150, 1340, 140, 90], point: [1220, 1462], label: 'Photo Booth', npc: 'click' },
    gifts: { rect: [960, 1180, 150, 50], point: [1035, 1262], label: 'Gift Table', npc: 'gupta' },
    car1: { rect: [190, 180, 120, 60], point: [250, 270], label: 'Kisi ki Gaadi', car: '#d63031' },
    car2: { rect: [190, 320, 120, 60], point: [250, 410], label: 'Kisi ki Gaadi', car: '#0984e3' },
    car3: { rect: [190, 460, 120, 60], point: [250, 550], label: 'Kisi ki Gaadi', car: '#f1f2f6' },
    gateTop: { rect: [430, 690, 24, 50], point: [470, 760], label: 'Swagat Gate', npc: 'verma' },
    gateBot: { rect: [430, 880, 24, 50], point: [470, 860], label: 'Swagat Gate', npc: 'verma' }
  };
  const SOLIDS = Object.values(STATIONS).map(s => ({ x: s.rect[0], y: s.rect[1], w: s.rect[2], h: s.rect[3] }));
  const TABLES = [[2000, 1100], [2210, 1190], [2390, 1300], [2080, 1390]].map(([x, y]) => ({ x, y, r: 40 }));
  const PROPS = {
    jhula: { x: 760, y: 1430, label: 'Jhula' },
    fireworks: { x: 600, y: 1095, label: 'Patakhe' },
    dancefloor: { x: 920, y: 550, label: 'Dance Floor', area: [700, 410, 440, 280] }
  };
  const DANCE = PROPS.dancefloor.area;
  const WAYPOINTS = [[800, 320], [1700, 420], [1300, 520], [900, 620], [1500, 650], [700, 850], [950, 950], [1500, 1000], [1650, 800],
    [1800, 600], [2050, 640], [2250, 860], [1900, 980], [2250, 1450], [1300, 1250], [800, 1250], [600, 1150], [420, 980], [300, 700],
    [650, 1500], [1100, 1530], [1450, 1180], [2400, 1180], [1700, 1100]];
  const LIGHTS = [];
  (function buildLights() {
    const posts = [[160, 120], [700, 380], [1180, 380], [1760, 380], [2540, 380], [460, 640], [1100, 700], [1360, 700], [1800, 720], [2540, 900],
      [460, 1160], [1100, 1130], [1500, 1150], [2540, 1500], [880, 1590], [160, 1590]];
    const pairs = [[1, 2], [2, 3], [3, 4], [0, 1], [5, 6], [7, 8], [8, 9], [10, 11], [11, 12], [12, 13], [10, 14], [14, 15], [6, 11], [7, 12]];
    pairs.forEach(([a, b], i) => {
      const [x1, y1] = posts[a], [x2, y2] = posts[b];
      LIGHTS.push({ x1, y1, x2, y2, sag: 30 + (i % 3) * 10, n: Math.max(10, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 26)), off: i });
    });
  })();
  const SHORT = {
    fufaji: 'Fufaji', pinky: 'Pinky Bua', bablu: 'Bablu Chacha', sharma: 'Sharma Aunty', mama: 'Mama Jugaadu', dadi: 'Dadi',
    selfie: 'Selfie Didi', chotu: 'Chotu', gupta: 'Gupta Ji', nani: 'Nani', dj: 'DJ Bunty', pandey: 'Pandey Ji', raju: 'Raju Band',
    lallan: 'Lallan', click: 'Click Bhaiya', tentwala: 'Tent Chacha', pandit: 'Pandit Ji', dulha: 'Dulha', dulhan: 'Dulhan',
    chaiwala: 'Chai Wale Kishan', golgappa: 'Golgappa Bhaiya', dholi: 'Dholi Pappu', verma: 'Verma Ji (Gate)', tina: 'Saheli Tina'
  };
  const LOOKS = {
    kurta: { skin: '#c68b5e', outfit: '#e1a91a', hair: 'short', acc: [] },
    lehenga: { skin: '#d9a27a', outfit: '#e84393', hair: 'long', dupatta: '#74b9ff', acc: ['bindi'] }
  };
  const PCOLORS = ['#ffd166', '#74b9ff'];

  const rand = a => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // ---------- Init ----------
  G.init = function (canvas) {
    cv = canvas; c = cv.getContext('2d');
    bg = buildBackground();
    setupInput();
    toDemo();
    requestAnimationFrame(loop);
  };

  function toDemo() {
    w = newWorld({ players: [] });
    w.demo = true;
    const n = w.npc;
    w.ghodi.x = -80; w.ghodi.y = 810; w.ghodi.rider = true; w.ghodi.state = 'demo';
    n.raju.visible = n.band1.visible = n.band2.visible = n.bablu.visible = true;
    n.selfie.wander = false; n.click.wander = false;
    cam.x = 700; cam.y = 800; cam.z = 0.9;
  }

  function setupInput() {
    const block = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
    window.addEventListener('keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT')) return;
      if (block.includes(e.code)) e.preventDefault();
      if (!keys[e.code]) pressed[e.code] = true;
      keys[e.code] = true;
      if ((e.code === 'Escape' || e.code === 'KeyP') && (state === 'play' || state === 'paused')) G.togglePause();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state === 'play') G.togglePause(); });
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    cv.addEventListener('mousemove', e => { [mouse.sx, mouse.sy] = pos(e); });
    cv.addEventListener('mouseleave', () => { mouse.sx = -1; mouse.hover = null; cv.style.cursor = 'default'; });
    cv.addEventListener('mousedown', e => {
      mouse.clicked = true;
      if (state !== 'play') return;
      [mouse.sx, mouse.sy] = pos(e);
      const [wx, wy] = toWorld(mouse.sx, mouse.sy);
      clickWorld(wx, wy);
    });
  }

  function ctrl(p) {
    const solo = w.solo;
    if (p.idx === 0) {
      const up = keys.KeyW || (solo && keys.ArrowUp), dn = keys.KeyS || (solo && keys.ArrowDown);
      const lf = keys.KeyA || (solo && keys.ArrowLeft), rt = keys.KeyD || (solo && keys.ArrowRight);
      const act = keys.KeyE || keys.Space || (solo && (keys.Enter || keys.NumpadEnter));
      const actP = pressed.KeyE || pressed.Space || (solo && (pressed.Enter || pressed.NumpadEnter));
      return { x: (rt ? 1 : 0) - (lf ? 1 : 0), y: (dn ? 1 : 0) - (up ? 1 : 0), act, actP };
    }
    const act = keys.Enter || keys.NumpadEnter || keys.ShiftRight || keys.Slash || keys.Numpad0;
    const actP = pressed.Enter || pressed.NumpadEnter || pressed.ShiftRight || pressed.Slash || pressed.Numpad0;
    return { x: (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), y: (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0), act, actP };
  }

  // ---------- Camera ----------
  function updateCamera(dt) {
    let tx = cam.x, ty = cam.y, tz = cam.z, k = 4;
    if (state === 'freeze' && w.freeze) { tx = w.freeze.x; ty = w.freeze.y; tz = 1.35; k = 12; }
    else if (w.demo) { tx = clamp(w.ghodi.x + 150, 500, 1500); ty = 780; tz = 0.85; k = 2; }
    else if (state === 'ending') { tx = 1230; ty = 880; tz = 1; k = 2; }
    else if (w.players.length) {
      const xs = w.players.map(p => p.x), ys = w.players.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      tx = (minX + maxX) / 2; ty = (minY + maxY) / 2 - 20;
      tz = clamp(Math.min(W / (maxX - minX + 620), H / (maxY - minY + 440)), 0.5, 1);
    }
    const a = 1 - Math.exp(-k * dt);
    cam.z += (tz - cam.z) * a;
    cam.x += (tx - cam.x) * a; cam.y += (ty - cam.y) * a;
    const hw = W / 2 / cam.z, hh = H / 2 / cam.z;
    cam.x = hw * 2 >= WW ? WW / 2 : clamp(cam.x, hw, WW - hw);
    cam.y = hh * 2 >= WH ? WH / 2 : clamp(cam.y, hh - 60 / cam.z, WH - hh);
  }
  function toScreen(x, y) { return [(x - cam.x) * cam.z + W / 2, (y - cam.y) * cam.z + H / 2]; }
  function toWorld(sx, sy) { return [(sx - W / 2) / cam.z + cam.x, (sy - H / 2) / cam.z + cam.y]; }
  function onScreen(x, y, m) { const [sx, sy] = toScreen(x, y); m = m || 0; return sx > -m && sx < W + m && sy > -m && sy < H + m; }

  // ---------- World ----------
  function mkNPC(key, x, y, opts) {
    const L = CAST[key];
    return Object.assign({
      key, look: { skin: L.skin, outfit: L.outfit, hair: L.hair, hat: L.hat, acc: L.acc || [], dupatta: L.dupatta },
      x, y, hx: x, hy: y, tx: null, ty: null, speed: 80, r: 16, solid: false, mood: 'neutral', moving: false, walk: 0,
      seed: Math.random() * 10, label: SHORT[key], voice: L.voice || 180, bubble: null, visible: true, pauseT: 0, cool: 0, hopT: 0
    }, opts || {});
  }

  function newWorld(cfg) {
    const nw = {
      cfg, solo: cfg.players.length <= 1, players: [], npc: {}, kids: [], items: [], crises: [], particles: [], floats: [],
      izzat: 100, phase: 0, phaseT: 0, spawnT: 5, cooldown: {}, fails: {}, lastFreeze: -99, shake: 0, flash: 0,
      rain: false, dark: false, tentDown: 0, memeShot: null, chatterT: 2.5, clickT: 22, elapsed: 0, blessCool: 0,
      mamaWin: 0, freeze: null, ending: null, drops: [], djReq: null, djIdx: 0, musicOverride: null, photoN: 0, fwCool: 0, photoCool: 0
    };
    cfg.players.forEach((pc, i) => {
      const lookName = LOOKS[pc.look] ? pc.look : 'kurta';
      nw.players.push({
        idx: i, isPlayer: true, name: pc.name, x: 880 + i * 90, y: 860, r: 13, look: JSON.parse(JSON.stringify(LOOKS[lookName])), lookName,
        color: PCOLORS[i], label: pc.name, labelColor: PCOLORS[i], moving: false, walk: 0, seed: i * 3, frozen: 0, frozenBy: null,
        carry: null, score: 0, hint: null, holdShow: 0, danceCool: 0, bubble: null, voice: 180 + i * 60, boost: 0, hopT: 0, faceT: 0,
        stats: { fixes: 0, paneer: 0, power: 0, tent: 0, dj: 0, sharma: 0, chashma: 0, fufaji: 0, ghodi: 0, kids: 0, pinky: 0, dances: 0, photos: 0 }
      });
    });
    const n = nw.npc;
    n.fufaji = mkNPC('fufaji', 980, 1080, { solid: true, r: 18 });
    n.nani = mkNPC('nani', 1060, 905, { solid: true, r: 18 });
    n.dadi = mkNPC('dadi', 1400, 905, { solid: true, r: 18 });
    n.sharma = mkNPC('sharma', 2265, 565, { solid: true, r: 18 });
    n.gupta = mkNPC('gupta', 820, 360, { solid: true, r: 16 });
    n.pandit = mkNPC('pandit', 1230, 852, { scale: 0.9 });
    n.tentwala = mkNPC('tentwala', 1600, 330, { solid: true, r: 16 });
    n.pandey = mkNPC('pandey', 2470, 300, { solid: true, r: 16 });
    n.lallan = mkNPC('lallan', 420, 1425, { solid: true, r: 16 });
    n.dj = mkNPC('dj', 605, 445, {});
    n.mama = mkNPC('mama', 360, 1080, { speed: 110, solid: true, r: 16 });
    n.chaiwala = mkNPC('chaiwala', 2505, 1000, { solid: true, r: 16 });
    n.golgappa = mkNPC('golgappa', 2505, 685, { solid: true, r: 16 });
    n.dholi = mkNPC('dholi', 560, 975, { solid: true, r: 16 });
    n.verma = mkNPC('verma', 490, 670, { solid: true, r: 16 });
    n.tina = mkNPC('tina', 1655, 1525, { solid: true, r: 16 });
    n.selfie = mkNPC('selfie', 1500, 650, { wander: true, speed: 75, solid: true, r: 16 });
    n.click = mkNPC('click', 1300, 520, { wander: true, speed: 85 });
    n.pinky = mkNPC('pinky', 2250, 1450, { wander: true, speed: 80, visible: false });
    n.bablu = mkNPC('bablu', 920, 550, { speed: 50, visible: false, dancing: true });
    n.raju = mkNPC('raju', 560, 712, { visible: false, speed: 80 });
    n.band1 = mkNPC('raju', 610, 700, { visible: false, speed: 80, label: 'Band Party', pokeKey: 'band', look: Object.assign({}, CAST.raju, { acc: [], skin: '#c48a5a', hair: 'bandcap' }) });
    n.band2 = mkNPC('raju', 515, 735, { visible: false, speed: 80, label: 'Band Party', pokeKey: 'band', look: Object.assign({}, CAST.raju, { acc: ['mustache'], skin: '#a8703f', hair: 'bandcap' }) });
    n.dulha = mkNPC('dulha', 1190, 995, { visible: false, speed: 80 });
    n.dulhan = mkNPC('dulhan', 1272, 995, { visible: false, speed: 60 });
    nw.ghodi = { x: 345, y: 1360, hx: 345, hy: 1360, tx: null, ty: null, state: 'idle', facing: 1, moving: false, running: false, r: 24, speed: 80, retarget: 0, rider: false, hopT: 0 };
    for (let i = 0; i < 160; i++) nw.drops.push({ x: Math.random() * W, y: Math.random() * H, s: 500 + Math.random() * 300 });
    return nw;
  }

  // ---------- Game start / phases ----------
  G.start = function (cfg) {
    w = newWorld(cfg);
    state = 'play';
    w.phase = 0;
    cam.x = 920; cam.y = 840; cam.z = 1;
    startPhase();
  };

  function startPhase() {
    const ph = PHASES[w.phase];
    w.phaseT = 0; w.spawnT = 5;
    BAG.UI.banner('Phase ' + ph.id + ': ' + ph.name, ph.sub);
    AU.playTrack(ph.track);
    const n = w.npc;
    if (ph.id === 2) {
      // The baraat arrives from the road, through the gate, along the red carpet.
      const g = w.ghodi;
      g.x = -90; g.y = 810; g.state = 'parade'; g.rider = true; g.tx = 1010; g.ty = 810; g.speed = 95;
      const band = [['raju', -170, 800, 560, 712], ['band1', -210, 822, 610, 700], ['band2', -240, 790, 515, 735]];
      band.forEach(([k, x, y, tx, ty]) => { const e = n[k]; e.visible = true; e.x = x; e.y = y; e.tx = tx; e.ty = ty; e.speed = 95; });
      n.bablu.visible = true; n.bablu.x = -40; n.bablu.y = 820; n.bablu.tx = 920; n.bablu.ty = 550; n.bablu.speed = 90;
      n.pinky.visible = true;
      w.cooldown.ghodi = w.elapsed + 16;
      w.musicOverride = { track: 'hero', until: w.elapsed + 9 };
      setTimeout(() => { if (w && n.pinky.visible && state === 'play') say(n.pinky, 'Main aa gayi! {name} beta, kahan ho?', { force: true }); }, 5000);
      say(n.raju, 'Band baja denge, tension mat lo!', { force: true });
      AU.sfx('dholriff');
    }
    if (ph.id === 3) {
      n.dulhan.visible = true; n.dulhan.x = 1750; n.dulhan.y = 1530; n.dulhan.tx = 1272; n.dulhan.ty = 995;
      if (!n.dulha.visible) { n.dulha.visible = true; n.dulha.x = 1190; n.dulha.y = 995; }
      say(n.pandit, 'Muhurat 10:42 ka hai. 10:43 nahi chalega.', { force: true });
    }
  }

  function endPhase() {
    for (const cr of w.crises.slice()) cleanup(cr, 'cancel');
    w.crises = [];
    AU.stopSpeech();
    if (w.phase < PHASES.length - 1) {
      state = 'news';
      BAG.UI.news(makeHeadlines(), () => { w.phase++; startPhase(); state = 'play'; });
    } else win();
  }

  function makeHeadlines() {
    const N = BAG.NEWS, out = [];
    if (w.fails.paneer) out.push(N.paneer);
    if (w.fails.power) out.push(N.power);
    if (w.fails.ghodi) out.push(N.ghodi);
    if (w.fails.fufaji) out.push(N.fufaji);
    const pk = w.players.reduce((a, p) => a + p.stats.pinky, 0);
    if (pk) out.push(N.pinky.replace('{n}', pk * 2 + 1));
    const dn = w.players.reduce((a, p) => a + p.stats.dances, 0);
    if (dn) out.push(N.dances.replace('{n}', dn));
    if (!Object.keys(w.fails).length) out.unshift(N.perfect);
    const gen = N.generic.slice().sort(() => Math.random() - 0.5);
    while (out.length < 4) out.push(gen.pop());
    return out.slice(0, 4);
  }

  G.togglePause = function () {
    if (state === 'play') { state = 'paused'; AU.stopSpeech(); BAG.UI.pause(true); }
    else if (state === 'paused') { state = 'play'; BAG.UI.pause(false); }
  };
  G.quitToTitle = function () { state = 'title'; AU.stopSpeech(); toDemo(); AU.playTrack('title'); };
  G.state = () => state;

  // ---------- Speech ----------
  function pickName() { return w.players.length ? rand(w.players).name : 'beta'; }
  function voiceOf(e) {
    if (e.isPlayer) return BAG.VOICES[e.lookName];
    if (e.kid) return BAG.VOICES.chotu;
    return BAG.VOICES[e.key] || { g: 'm', pitch: 1, rate: 1 };
  }
  // opts: {dur, force (speak even off-screen), priority (interrupt current speech)}
  function say(e, text, opts) {
    if (!text || !e) return;
    opts = opts || {};
    text = text.replace(/\{name\}/g, () => pickName());
    e.bubble = { text, age: 0, dur: opts.dur || clamp(text.length * 0.075, 2.4, 4.5) };
    if (w.demo) return;
    const visible = onScreen(e.x, e.y, 60);
    if (opts.priority || opts.force || visible) {
      const spoke = AU.speak(text, voiceOf(e), !!opts.priority);
      if (!spoke && babbleCool <= 0 && visible) { babbleCool = 0.35; }
    }
  }

  // ---------- Crises ----------
  function trySpawn() {
    const ph = PHASES[w.phase];
    const max = ph.maxActive[w.solo ? 0 : 1];
    if (w.crises.length >= max) return;
    const opts = Object.keys(CR).filter(k => CR[k].phases.includes(ph.id) && !w.crises.some(x => x.type === k) && (w.cooldown[k] || 0) <= w.elapsed);
    if (!opts.length) return;
    let r = Math.random() * opts.reduce((a, k) => a + CR[k].weight, 0);
    for (const k of opts) { r -= CR[k].weight; if (r <= 0) { startCrisis(k); return; } }
    startCrisis(opts[opts.length - 1]);
  }

  function startCrisis(type) {
    const d = CR[type], n = w.npc;
    const tm = d.time * TIME_SCALE;
    const cr = { type, d, t: tm, max: tm, progress: 0, id: ++uid, x: 0, y: 0, title: d.title };
    if (d.station) { cr.x = STATIONS[d.station].point[0]; cr.y = STATIONS[d.station].point[1]; }
    switch (type) {
      case 'paneer': say(n.pandey, rand(CAST.pandey.idle), { force: true }); break;
      case 'power':
        w.dark = true; AU.sfx('whoomp'); cr.mamaT = 3;
        say(n.gupta, 'Generator chalu karo!! Meri call kat gayi!', { force: true });
        break;
      case 'tent':
        if (PHASES[w.phase].id >= 2) { w.rain = true; cr.title = d.titleRain; }
        say(n.tentwala, rand(CAST.tentwala.idle), { force: true });
        break;
      case 'dj': say(n.dj, rand(CAST.dj.bad), { force: true }); w.djReq = null; break;
      case 'sharma': n.sharma.mood = 'angry'; say(n.sharma, rand(CAST.sharma.idle)); break;
      case 'chashma': {
        const far = WAYPOINTS.filter(p => Math.hypot(p[0] - n.dadi.x, p[1] - n.dadi.y) > 450);
        const p = rand(far);
        w.items.push({ kind: 'chashma', x: p[0] + (Math.random() - 0.5) * 40, y: p[1] + (Math.random() - 0.5) * 30, crid: cr.id });
        say(n.dadi, rand(CAST.dadi.lost), { force: true }); AU.sfx('aye');
        break;
      }
      case 'fufaji': n.fufaji.mood = 'angry'; say(n.fufaji, rand(CAST.fufaji.angry), { force: true }); break;
      case 'ghodi': {
        const g = w.ghodi; g.state = 'run'; g.rider = false; g.retarget = 0;
        if (!n.dulha.visible) { n.dulha.visible = true; n.dulha.x = g.x; n.dulha.y = g.y + 10; n.dulha.tx = 1190; n.dulha.ty = 995; }
        AU.sfx('neigh'); say(n.lallan, 'Rani ruk ja!! Arre koi pakdo!', { force: true });
        break;
      }
      case 'kids': {
        const starts = [[2580, 880], [2580, 700], [2300, 1620], [2580, 1150]];
        const spots = [[2025, 842], [2065, 850], [2105, 842]];
        const outfits = ['#fdcb6e', '#55efc4', '#ff7675'];
        for (let i = 0; i < 3; i++) {
          const s = rand(starts);
          w.kids.push({
            key: 'chotu', x: s[0] + i * 25, y: s[1] - i * 10, tx: spots[i][0], ty: spots[i][1], state: 'run', speed: 75 + Math.random() * 25,
            crid: cr.id, look: { skin: CAST.chotu.skin, outfit: outfits[i], hair: 'kid', acc: [] }, kid: true, scale: 0.85,
            seed: Math.random() * 9, walk: 0, moving: true, mood: 'happy', voice: 380, label: i === 0 ? 'Chotu Gang' : null, hopT: 0
          });
        }
        say(w.kids[w.kids.length - 3], rand(CAST.chotu.idle));
        break;
      }
    }
    AU.sfx('alert');
    w.crises.push(cr);
  }

  function crisisPoint(cr) {
    const n = w.npc;
    if (cr.type === 'sharma') return { x: n.sharma.x, y: n.sharma.y };
    if (cr.type === 'fufaji') return { x: n.fufaji.x, y: n.fufaji.y };
    if (cr.type === 'ghodi') return { x: w.ghodi.x, y: w.ghodi.y - 40 };
    if (cr.type === 'chashma') { const it = w.items.find(i => i.crid === cr.id); return it ? { x: it.x, y: it.y } : { x: n.dadi.x, y: n.dadi.y }; }
    if (cr.type === 'kids') return { x: 2065, y: 780 };
    return { x: cr.x, y: cr.y };
  }

  function cleanup(cr, how) {
    const n = w.npc;
    w.cooldown[cr.type] = w.elapsed + 8;
    switch (cr.type) {
      case 'power': w.dark = false; break;
      case 'tent': w.rain = false; break;
      case 'fufaji': n.fufaji.mood = how === 'fixed' ? 'happy' : 'sad'; n.fufaji.moodT = 6; break;
      case 'sharma': n.sharma.mood = how === 'fixed' ? 'happy' : 'neutral'; n.sharma.moodT = 5; break;
      case 'ghodi': w.ghodi.state = 'return'; w.ghodi.tx = w.ghodi.hx; w.ghodi.ty = w.ghodi.hy; w.ghodi.speed = 110; break;
      case 'chashma': w.items = w.items.filter(i => i.crid !== cr.id); w.players.forEach(p => { if (p.carry === 'chashma') p.carry = null; }); break;
      case 'kids':
        w.kids.forEach(k => { if (k.crid === cr.id && k.state !== 'flee') { k.state = 'flee'; k.speed = 240; } });
        break;
    }
    if (cr.type === 'fufaji') w.players.forEach(p => { if (p.carry === 'plate') p.carry = null; });
  }

  function resolveCrisis(cr, p) {
    if (!w.crises.includes(cr)) return;
    w.crises = w.crises.filter(x => x !== cr);
    cleanup(cr, 'fixed');
    const n = w.npc, pt = crisisPoint(cr);
    let pts = 100;
    if (cr.type === 'ghodi') { pts = 150; say(n.lallan, rand(CAST.lallan.caught), { force: true }); }
    if (cr.type === 'fufaji') { pts = 120; say(n.fufaji, rand(CAST.fufaji.calmed), { priority: true }); bumpTotal('fufaji', 1); }
    if (cr.type === 'chashma') { pts = 100 + cr.d.bonus; say(n.dadi, rand(CAST.dadi.thanks), { priority: true }); }
    if (cr.type === 'paneer') { say(n.pandey, rand(CAST.pandey.fixed), { priority: true }); AU.sfx('cooker'); }
    if (cr.type === 'dj') say(n.dj, rand(CAST.dj.fixed), { priority: true });
    if (cr.type === 'sharma') say(n.sharma, rand(CAST.sharma.calmed), { priority: true });
    if (cr.type === 'power') AU.sfx('powerup');
    if (cr.type === 'tent') say(n.tentwala, 'Dekha? Majboot hai!', { priority: true });
    if (p) {
      p.score += pts; p.stats.fixes++;
      if (cr.type !== 'kids' && p.stats[cr.type] !== undefined) p.stats[cr.type]++;
      floatText(pt.x, pt.y - 30, '+' + pts, p.color);
    } else floatText(pt.x, pt.y - 30, 'Jugaad!', '#55efc4');
    w.izzat = Math.min(100, w.izzat + 3);
    AU.sfx('tadaa');
    burst(pt.x, pt.y - 20, 26, 'petal');
  }

  function failCrisis(cr) {
    if (!w.crises.includes(cr)) return;
    const pt = crisisPoint(cr);
    w.crises = w.crises.filter(x => x !== cr);
    cleanup(cr, 'fail');
    const n = w.npc;
    w.fails[cr.type] = (w.fails[cr.type] || 0) + 1;
    w.izzat = Math.max(0, w.izzat - cr.d.penalty);
    if (cr.type === 'tent') { w.tentDown = 4; say(n.tentwala, rand(CAST.tentwala.fail), { force: true }); }
    if (cr.type === 'ghodi') bumpTotal('ghodiFails', 1);
    if (cr.type === 'fufaji') say(n.fufaji, 'Theek hai, hum chale jaate hain. Hum kaun hote hain.', { priority: true });
    if (cr.type === 'kids') { const k = w.kids.find(k => k.crid === cr.id); if (k) say(k, 'Hehehe! Gulab jamun hamare!'); }
    if (w.fails.paneer >= 3) BAG.UI.achieve('paneer_gone');
    AU.sfx(Math.random() < 0.5 ? 'trombone' : 'sadviolin'); AU.sfx('ohh');
    w.shake = 12;
    floatText(pt.x, pt.y - 30, '-' + cr.d.penalty + ' Izzat', '#ff7675');
    if (w.izzat <= 0) { lose(pt); return; }
    // Only big failures get the meme freeze, and not too often.
    if (cr.d.penalty >= 12 && w.elapsed - w.lastFreeze > 25) triggerFreeze(pt.x, pt.y, rand(cr.d.fail), cr.d.penalty);
    else if (!w.memeShot) w.memeShot = { img: snapshot(), caption: rand(cr.d.fail), pen: cr.d.penalty };
  }

  // ---------- Freeze-frame meme ----------
  function triggerFreeze(x, y, caption, pen, after, dur) {
    w.lastFreeze = w.elapsed;
    w.freeze = { x, y, caption, pen, t: 0, dur: dur || (after ? 2.4 : 1.3), shot: false, after };
    state = 'freeze';
    AU.sfx('dhan');
  }

  // ---------- Endings ----------
  function win() {
    state = 'ending';
    w.ending = { t: 0, dur: 6.5, won: true, fw: 0 };
    AU.playTrack('vidaai');
    const n = w.npc;
    Object.values(n).forEach(e => { e.mood = 'happy'; e.moodT = 99; });
    n.dulha.visible = n.dulhan.visible = true;
    n.dulha.x = 1195; n.dulha.y = 995; n.dulhan.x = 1268; n.dulhan.y = 995; n.dulhan.tx = null;
    say(n.fufaji, 'Achha... theek hai. Shaadi achhi thi.', { dur: 5, priority: true });
    setTimeout(() => { if (w.ending) say(n.nani, 'Jeete raho bachchon! Sab ro rahe hain!', { dur: 4, force: true }); }, 2600);
    setTimeout(() => { if (w.ending) say(n.dadi, 'Muhurat pe ho gaya! Ab sab khana kha lo!', { dur: 3.5, force: true }); }, 4600);
  }

  function lose(pt) {
    w.memeShot = null;
    AU.playTrack('lose');
    triggerFreeze(pt.x, pt.y, BAG.ENDINGS.lose.head + ' ' + BAG.ENDINGS.lose.sub, 999, () => finish(false));
  }

  function finish(won) {
    state = 'result';
    AU.stopSpeech();
    const reached = PHASES[w.phase].id;
    const top = Math.max(0, ...w.players.map(p => p.score));
    const used = new Set();
    const players = w.players.map(p => {
      const s = Object.assign({}, p.stats, { isTop: p.score === top && p.score > 0 });
      const ranked = BAG.TITLES.map(T => ({ t: T.t, v: T.f(s, { won, reachedPhase: reached }) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
      const pick = ranked.find(x => !used.has(x.t)) || ranked[0] || { t: 'Sab Kaam Ka Aadmi' };
      used.add(pick.t);
      return { name: p.name, color: p.color, score: p.score, stats: p.stats, title: pick.t, look: p.look };
    });
    if (won) {
      BAG.UI.achieve('vidaai');
      if (w.izzat >= 80) BAG.UI.achieve('sharma_beta');
      if (w.players.every(p => p.stats.pinky === 0)) BAG.UI.achieve('pinky_escape');
    }
    if (w.players.some(p => p.stats.dances >= 5)) BAG.UI.achieve('naachunga');
    BAG.UI.result({ won, players, izzat: Math.round(w.izzat), reachedPhase: reached, teamScore: players.reduce((a, p) => a + p.score, 0), memeShot: w.memeShot ? Object.assign({}, w.memeShot, { img: toImg(w.memeShot.img) }) : null, endShot: toImg(w.endShot) });
  }

  function toImg(s) { try { return s ? s.toDataURL('image/jpeg', 0.85) : null; } catch (e) { return null; } }

  function bumpTotal(k, v) {
    const t = BAG.UI.bumpTotal(k, v);
    if (k === 'fufaji' && t >= 5) BAG.UI.achieve('fufaji_whisperer');
    if (k === 'ghodiFails' && t >= 3) BAG.UI.achieve('ghodi_dushman');
    if (k === 'photos' && t >= 10) BAG.UI.achieve('ek_aur_photo');
  }

  // ---------- Movement / collision ----------
  function collide(e, r) {
    for (const s of SOLIDS) {
      const cx = clamp(e.x, s.x, s.x + s.w), cy = clamp(e.y, s.y, s.y + s.h);
      const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        if (d2 < 0.0001) {
          const l = e.x - s.x, rr = s.x + s.w - e.x, t = e.y - s.y, b = s.y + s.h - e.y, m = Math.min(l, rr, t, b);
          if (m === l) e.x = s.x - r; else if (m === rr) e.x = s.x + s.w + r; else if (m === t) e.y = s.y - r; else e.y = s.y + s.h + r;
        } else { const d = Math.sqrt(d2); e.x = cx + dx / d * r; e.y = cy + dy / d * r; }
      }
    }
    const push = (ox, oy, or) => {
      const dx = e.x - ox, dy = e.y - oy, d = Math.hypot(dx, dy), m = r + or;
      if (d < m && d > 0.01) { e.x = ox + dx / d * m; e.y = oy + dy / d * m; }
    };
    for (const t of TABLES) push(t.x, t.y, t.r);
    for (const k in w.npc) { const n = w.npc[k]; if (n !== e && n.solid && n.visible) push(n.x, n.y, n.r); }
    e.x = clamp(e.x, 16, WW - 16); e.y = clamp(e.y, 60, WH - 14);
  }

  function moveTo(e, dt, noCollide) {
    if (e.tx == null) { e.moving = false; return false; }
    const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy);
    if (d < 4) { e.x = e.tx; e.y = e.ty; e.tx = null; e.moving = false; return true; }
    const st = Math.min(d, e.speed * dt);
    const ox = e.x, oy = e.y;
    e.x += dx / d * st; e.y += dy / d * st;
    if (!noCollide) collide(e, e.r || 14);
    e.facing = dx >= 0 ? 1 : -1;
    e.moving = true; e.walk += dt * (e.speed / 100);
    const moved = Math.hypot(e.x - ox, e.y - oy);
    e.stuck = moved < st * 0.3 ? (e.stuck || 0) + dt : 0;
    if (e.stuck > 1.2) { e.tx = null; e.stuck = 0; e.moving = false; }
    return false;
  }

  // ---------- Interaction: clicking or pressing E on anything ----------
  let clickCache = null;
  function allClickables() {
    if (clickCache) return clickCache;
    const out = clickCache = [];
    for (const k in w.npc) { const e = w.npc[k]; if (e.visible && k !== 'dj') out.push({ kind: 'npc', e, x: e.x, y: e.y - 28 * (e.scale || 1), r: 30, label: e.label }); }
    out.push({ kind: 'npc', e: w.npc.dj, x: 605, y: 425, r: 30, label: 'DJ Bunty' });
    for (const kd of w.kids) out.push({ kind: 'npc', e: kd, x: kd.x, y: kd.y - 22, r: 24, label: 'Chotu Gang' });
    out.push({ kind: 'ghodi', x: w.ghodi.x, y: w.ghodi.y - 38, r: 44, label: 'Rani (Ghodi)' });
    for (const p of w.players) out.push({ kind: 'player', e: p, x: p.x, y: p.y - 28, r: 28, label: p.name });
    for (const k in PROPS) { const pr = PROPS[k]; if (!pr.area) out.push({ kind: 'prop', id: k, x: pr.x, y: pr.y - 20, r: 44, label: pr.label }); }
    for (const k in STATIONS) { const s = STATIONS[k]; out.push({ kind: 'station', id: k, rect: s.rect, x: s.rect[0] + s.rect[2] / 2, y: s.rect[1] + s.rect[3] / 2, label: s.label }); }
    const d = DANCE; out.push({ kind: 'prop', id: 'dancefloor', rect: d, x: d[0] + d[2] / 2, y: d[1] + d[3] / 2, label: 'Dance Floor' });
    return out;
  }

  function hitTest(wx, wy) {
    let best = null, bd = 1e9;
    for (const t of allClickables()) {
      if (t.rect) continue;
      const d = Math.hypot(wx - t.x, wy - t.y);
      if (d < t.r && d < bd) { bd = d; best = t; }
    }
    if (best) return best;
    for (const t of allClickables()) {
      if (!t.rect) continue;
      const [x, y, rw, rh] = t.rect;
      if (wx >= x && wx <= x + rw && wy >= y - 20 && wy <= y + rh) return t;
    }
    return null;
  }

  function clickWorld(wx, wy) {
    const t = hitTest(wx, wy);
    if (!t) { burst(wx, wy, 6, 'petal'); return; }
    const near = w.players.length ? w.players.reduce((a, p) => Math.hypot(p.x - t.x, p.y - t.y) < Math.hypot(a.x - t.x, a.y - t.y) ? p : a) : null;
    interact(t, near, true);
  }
  G._clickWorld = clickWorld;

  function poke(e) {
    const key = e.pokeKey || e.key;
    const lines = BAG.POKE[key] || (CAST[key] && CAST[key].idle) || ['Haan?'];
    e.hopT = 0.45;
    say(e, rand(lines), { priority: true });
  }

  function interact(t, p, byClick) {
    const n = w.npc;
    const pNear = (x, y, r) => p && Math.hypot(p.x - x, p.y - y) < (r || 130);
    if (t.kind === 'npc') {
      const e = t.e;
      if (e.key === 'dj' || e === n.dj) return djRequest();
      if (e.key === 'dholi') { poke(e); playDhol(); return; }
      if (e.key === 'chaiwala' && pNear(STATIONS.chai.point[0], STATIONS.chai.point[1], 160)) return useProp('chai', p);
      if (e.key === 'golgappa' && pNear(STATIONS.golgappa.point[0], STATIONS.golgappa.point[1], 160)) return useProp('golgappa', p);
      if (e.key === 'nani' && !byClick && p) return nanibless(p);
      poke(e);
      AU.sfx('pop');
      return;
    }
    if (t.kind === 'player') { t.e.hopT = 0.45; say(t.e, rand(BAG.POKE.players), { priority: true }); return; }
    if (t.kind === 'ghodi') { w.ghodi.hopT = 0.45; AU.sfx('neigh'); say(n.lallan, rand(BAG.POKE.lallan), { priority: true }); return; }
    if (t.kind === 'prop' || t.kind === 'station') return useProp(t.id, p);
  }

  function useProp(id, p) {
    const n = w.npc;
    const st = STATIONS[id];
    switch (id) {
      case 'chai':
        AU.sfx('slurp'); say(n.chaiwala, 'Garma garam cutting! Ab dekho speed!', { priority: true });
        for (const pl of w.players) if (Math.hypot(pl.x - st.point[0], pl.y - st.point[1]) < 170) { pl.boost = 10; floatText(pl.x, pl.y - 70, 'Chai Power! ⚡', '#ffd166'); }
        return;
      case 'golgappa':
        AU.sfx('crunch'); say(n.golgappa, rand(BAG.POKE.golgappa), { priority: true });
        for (const pl of w.players) if (Math.hypot(pl.x - st.point[0], pl.y - st.point[1]) < 170) { pl.faceT = 1.6; setTimeout(() => say(pl, rand(['Aur teekha!!', 'Paani! Paani!', 'Ek aur bhaiya!'])), 500); }
        return;
      case 'dj': return djRequest();
      case 'photo': {
        if (w.elapsed < w.photoCool) { say(n.click, 'Ruko, flash charge ho raha hai!', { priority: true }); return; }
        w.photoCool = w.elapsed + 8; w.photoN++;
        w.flash = 1; AU.sfx('flash');
        say(n.click, rand(BAG.POKE.click), { priority: true });
        const caps = ['Family Photo #' + (40 + w.photoN), 'Candid (zabardasti wala)', 'Fufaji ne smile nahi kiya', 'Sab ki aankhein band', 'Album ka cover photo'];
        triggerFreeze(st.point[0], st.point[1] - 120, rand(caps), 1, null, 1.0);
        return;
      }
      case 'gifts':
        AU.sfx('gift'); if (p) say(p, rand(['Lifafe mein 101 daalun ya 501?', 'Ye gift kisne diya? Pressure cooker phir se?', 'Shagun ka lifafa kahan gaya?']), { priority: true });
        return;
      case 'car1': case 'car2': case 'car3':
        AU.sfx('caralarm'); say(n.gupta, rand(['Kiski gaadi hai?! Meri toh nahi?', 'Gaadi side karo, baraat aa rahi hai!']), { priority: true });
        return;
      case 'bride':
        AU.sfx('knock'); n.tina.hopT = 0.45; say(n.tina, rand(BAG.POKE.tina), { priority: true });
        return;
      case 'jhula':
        AU.sfx('boing');
        if (p && Math.hypot(p.x - PROPS.jhula.x, p.y - PROPS.jhula.y) < 140) { p.frozen = 1.4; p.frozenBy = 'jhula'; say(p, 'Wheeee! Bachpan yaad aa gaya!', { priority: true }); }
        else say(n.dadi, 'Jhula tootega, dhyaan se!', { priority: true });
        return;
      case 'fireworks':
        if (w.elapsed < w.fwCool) return;
        w.fwCool = w.elapsed + 2.5;
        firework(cam.x + (Math.random() - 0.5) * 500, cam.y - 200);
        say(n.dadi, rand(['Arre dheere! Patakhe andar nahi!', 'Bachche door raho!']), { priority: true });
        return;
      case 'dancefloor':
        if (p) { p.frozen = 1.2; p.frozenBy = 'dance'; say(p, 'Ek step toh banta hai!', { priority: true }); }
        return;
      case 'mandap':
        burst(1230, 830, 18, 'spark'); say(n.pandit, rand(BAG.POKE.pandit), { priority: true });
        return;
      case 'gateTop': case 'gateBot':
        poke(n.verma); return;
      default:
        if (st && st.npc && n[st.npc]) { poke(n[st.npc]); return; }
    }
  }

  function djRequest() {
    const n = w.npc;
    if (w.crises.some(x => x.type === 'dj')) { say(n.dj, 'Pehle ye sad song band karwao, phir request!', { priority: true }); return; }
    const req = BAG.DJ_REQUESTS[w.djIdx++ % BAG.DJ_REQUESTS.length];
    w.djReq = { track: req.track, until: w.elapsed + 30 };
    n.dj.hopT = 0.45;
    say(n.dj, 'Request aayi hai! "' + req.name + '"! Bass boost!', { priority: true });
    BAG.UI.toast('🎵 DJ Bunty bajaa raha hai: ' + req.name);
    AU.sfx('click');
  }

  function playDhol() {
    AU.sfx('dholriff');
    for (const k in w.npc) { const e = w.npc[k]; if (e.visible && Math.hypot(e.x - w.npc.dholi.x, e.y - w.npc.dholi.y) < 420) e.danceT = 2.2; }
  }

  function nanibless(p) {
    const n = w.npc;
    if (w.elapsed >= w.blessCool) {
      w.blessCool = w.elapsed + 25; w.izzat = Math.min(100, w.izzat + 12);
      say(n.nani, rand(CAST.nani.bless), { priority: true }); AU.sfx('bless'); burst(n.nani.x, n.nani.y - 40, 20, 'spark');
      floatText(n.nani.x, n.nani.y - 60, '+12 Izzat', '#55efc4');
    } else say(n.nani, 'Abhi toh diya tha beta! Thoda ruk.', { priority: true });
  }

  // nearest thing a player can talk to / use with E
  function nearestUsable(p) {
    let best = null, bd = 1e9;
    for (const t of allClickables()) {
      if (t.kind === 'player') continue;
      let d;
      if (t.rect) { const [x, y, rw, rh] = t.rect; d = Math.hypot(p.x - clamp(p.x, x, x + rw), p.y - clamp(p.y, y, y + rh)); if (t.id === 'dancefloor') continue; }
      else d = Math.hypot(p.x - t.x, p.y - (t.y + 28));
      if (d < 70 && d < bd) { bd = d; best = t; }
    }
    return best;
  }

  // ---------- Update ----------
  function update(dt) {
    w.elapsed += dt;
    const ph = PHASES[w.phase];
    w.phaseT += dt;
    w.spawnT -= dt;
    if (w.spawnT <= 0) {
      trySpawn();
      w.spawnT = ph.spawnEvery[w.solo ? 0 : 1] * (0.75 + Math.random() * 0.5) * 1.15;
    }
    updatePlayers(dt);
    updateNPCs(dt);
    updateCrises(dt);
    updateFx(dt);
    chatter(dt);
    pickMusic();
    if (state === 'play' && w.phaseT >= ph.dur) endPhase();
  }

  const nearPoint = (p, x, y, r) => Math.hypot(p.x - x, p.y - y) <= r;

  function updatePlayers(dt) {
    const n = w.npc;
    for (const p of w.players) {
      const k = ctrl(p);
      p.hint = null; p.holdShow = 0; p.danceCool = Math.max(0, p.danceCool - dt);
      p.boost = Math.max(0, p.boost - dt); p.faceT = Math.max(0, p.faceT - dt); p.hopT = Math.max(0, p.hopT - dt);
      if (p.frozen > 0) {
        p.frozen -= dt; p.moving = false;
        if (p.frozenBy === 'pinky' && k.actP) p.frozen -= 0.4;
        p.dancing = p.frozenBy === 'dance';
        if (p.frozenBy === 'pinky') p.hint = 'Bhaago! ' + (p.idx === 0 ? 'E' : 'Enter') + ' dabao';
        if (p.frozen <= 0) { p.frozen = 0; p.frozenBy = null; p.dancing = false; }
        continue;
      }
      let dx = k.x, dy = k.y;
      if (dx || dy) {
        const l = Math.hypot(dx, dy); dx /= l; dy /= l;
        const sp = PLAYER_SPEED * (p.boost > 0 ? 1.35 : 1);
        p.x += dx * sp * dt; p.y += dy * sp * dt;
        collide(p, p.r);
        p.moving = true; p.walk += dt * 1.8; p.facing = dx >= 0 ? 1 : -1;
      } else p.moving = false;
      p.holding = k.act;
      const keyName = p.idx === 0 ? 'E' : 'Enter';
      let used = false;

      for (const cr of w.crises) {
        if (cr.d.kind !== 'hold') continue;
        const pt = crisisPoint(cr);
        if (nearPoint(p, pt.x, pt.y, 66)) { p.hint = 'Hold ' + keyName; if (k.act) { p.holdShow = cr.progress; used = true; } }
      }
      const fuf = w.crises.find(x => x.type === 'fufaji');
      if (fuf && !p.carry && nearPoint(p, STATIONS.buffet.point[0], STATIONS.buffet.point[1], 70)) {
        p.hint = keyName + ': Plate lo';
        if (k.actP) { p.carry = 'plate'; used = true; AU.sfx('pickup'); say(p, 'Fufaji ke liye special plate!'); }
      }
      if (fuf && p.carry === 'plate' && dist(p, n.fufaji) < 52) { resolveCrisis(fuf, p); p.carry = null; }
      for (const it of w.items) {
        if (it.kind === 'chashma' && !p.carry && Math.hypot(p.x - it.x, p.y - it.y) < 30) { p.carry = 'chashma'; it.taken = true; AU.sfx('pickup'); say(p, 'Mil gaya Dadi ka chashma!'); }
      }
      w.items = w.items.filter(i => !i.taken);
      const cha = w.crises.find(x => x.type === 'chashma');
      if (cha && p.carry === 'chashma' && dist(p, n.dadi) < 54) { p.carry = null; resolveCrisis(cha, p); }
      if (!p.hint && dist(p, n.nani) < 62) {
        p.hint = keyName + ': Nani ka aashirwad';
        if (k.actP && !used) { nanibless(p); used = true; }
      }
      // talk to / use anything else nearby
      if (!p.hint) {
        const t = nearestUsable(p);
        if (t) {
          p.hint = keyName + ': ' + t.label;
          if (k.actP && !used) interact(t, p, false);
        }
      }
    }
  }

  function updateCrises(dt) {
    const n = w.npc;
    for (const cr of w.crises.slice()) {
      cr.t -= dt;
      if (cr.d.kind === 'hold') {
        const pt = crisisPoint(cr);
        const holders = w.players.filter(p => p.frozen <= 0 && p.holding && nearPoint(p, pt.x, pt.y, 66));
        if (holders.length) {
          cr.progress += dt / cr.d.hold * (1 + 0.7 * (holders.length - 1));
          if (Math.random() < dt * 12) burst(pt.x + (Math.random() - 0.5) * 30, pt.y - 20, 1, 'spark');
          if (cr.progress >= 1) { resolveCrisis(cr, holders[0]); continue; }
        } else cr.progress = Math.max(0, cr.progress - dt * 0.15);
      }
      if (cr.type === 'power') {
        const m = n.mama;
        if (cr.mamaT != null) {
          cr.mamaT -= dt;
          if (cr.mamaT <= 0 && !cr.mamaGo) { cr.mamaGo = true; m.tx = 235; m.ty = 1290; m.speed = 80; say(m, rand(CAST.mama.idle)); }
          if (cr.mamaGo && m.tx == null && cr.mamaWork == null) cr.mamaWork = 7;
          if (cr.mamaWork != null) {
            cr.mamaWork -= dt;
            if (cr.mamaWork <= 0) {
              cr.mamaT = null; m.tx = m.hx; m.ty = m.hy;
              if (Math.random() < 0.45) { say(m, rand(CAST.mama.success), { force: true }); BAG.UI.achieve('jugaad'); w.mamaWin++; resolveCrisis(cr, null); continue; }
              say(m, rand(CAST.mama.fail), { force: true });
            }
          }
        }
      }
      if (cr.type === 'kids') {
        const mine = w.kids.filter(k => k.crid === cr.id);
        if (mine.length && mine.every(k => k.state === 'flee')) { resolveCrisis(cr, cr.lastShooer || null); continue; }
      }
      if (cr.t <= 0) failCrisis(cr);
      if (state !== 'play') return;
    }
  }

  function updateNPCs(dt) {
    const n = w.npc;
    for (const k in n) {
      const e = n[k];
      if (!e.visible) continue;
      e.hopT = Math.max(0, (e.hopT || 0) - dt);
      if (e.danceT) { e.danceT -= dt; if (e.danceT <= 0) e.danceT = 0; }
      if (e.moodT != null) { e.moodT -= dt; if (e.moodT <= 0) { e.moodT = null; e.mood = 'neutral'; } }
      if (e.bubble) { e.bubble.age += dt; if (e.bubble.age > e.bubble.dur) e.bubble = null; }
    }
    w.ghodi.hopT = Math.max(0, w.ghodi.hopT - dt);
    if (w.crises.some(x => x.type === 'fufaji')) { n.fufaji.mood = 'angry'; if (!n.fufaji.bubble && Math.random() < dt * 0.2) say(n.fufaji, rand(CAST.fufaji.angry)); }
    if (w.crises.some(x => x.type === 'sharma') && !n.sharma.bubble && Math.random() < dt * 0.25) say(n.sharma, rand(CAST.sharma.idle));
    n.dadi.noGlasses = w.crises.some(x => x.type === 'chashma');

    moveTo(n.mama, dt);
    ['raju', 'band1', 'band2', 'dulha', 'dulhan'].forEach(key => { const e = n[key]; if (e.visible && e.tx != null) moveTo(e, dt, true); });

    for (const key of ['selfie', 'click', 'pinky']) {
      const e = n[key];
      if (!e.visible || !e.wander) continue;
      if (key === 'pinky' && PHASES[w.phase].id >= 2) { pinkyLogic(e, dt); continue; }
      e.armsUp = false;
      if (e.tx == null) {
        e.pauseT -= dt;
        if (key === 'selfie' && e.pauseT > 0) { e.armsUp = true; e.mood = 'happy'; }
        if (e.pauseT <= 0) { const p = rand(WAYPOINTS); e.tx = p[0] + (Math.random() - 0.5) * 30; e.ty = p[1]; e.pauseT = 2 + Math.random() * 3; e.mood = 'neutral'; }
      } else moveTo(e, dt);
    }

    if (PHASES[w.phase].id >= 2) {
      w.clickT -= dt;
      const cb = n.click;
      if (w.clickT <= 1.4 && !cb.photoCalled) { cb.photoCalled = true; say(cb, rand(CAST.click.idle)); cb.tx = null; cb.pauseT = 2.5; }
      if (w.clickT <= 0) {
        cb.photoCalled = false; w.clickT = 20 + Math.random() * 10;
        if (onScreen(cb.x, cb.y)) { w.flash = 1; AU.sfx('flash'); }
        for (const p of w.players) {
          if (dist(p, cb) < 190 && p.frozen <= 0) {
            p.frozen = 1.4; p.frozenBy = 'photo'; p.stats.photos++; bumpTotal('photos', 1);
            say(p, rand(['Bhaiya jaldi! Kaam hai!', 'Cheese... ab jaane do?', 'Ek aur? Nahi!']));
          }
        }
      }
    }

    const b = n.bablu;
    if (b.visible) {
      b.dancing = true;
      if (b.tx == null) { const s = [[760, 450], [1080, 450], [920, 430], [920, 660], [760, 650], [1080, 650]]; const p = rand(s); b.tx = p[0]; b.ty = p[1]; b.speed = 50; }
      moveTo(b, dt, true);
      for (const p of w.players) {
        if (p.frozen <= 0 && p.danceCool <= 0 && dist(p, b) < 32) {
          p.frozen = 1.3; p.frozenBy = 'dance'; p.danceCool = 3; p.stats.dances++;
          say(p, 'Main bhi naachunga!'); say(b, rand(CAST.bablu.idle));
        }
      }
    }

    const g = w.ghodi;
    if (g.state === 'parade') {
      moveTo(g, dt, true);
      if (g.tx == null) {
        g.state = 'return'; g.rider = false; g.tx = g.hx; g.ty = g.hy; g.speed = 90;
        n.dulha.visible = true; n.dulha.x = g.x + 10; n.dulha.y = g.y + 12; n.dulha.tx = 1190; n.dulha.ty = 995;
        say(n.dulha, rand(CAST.dulha.idle), { force: true });
      }
    } else if (g.state === 'return') {
      g.running = false;
      if (moveTo(g, dt, false) || g.tx == null) { g.state = 'idle'; g.x = g.hx; g.y = g.hy; }
    } else if (g.state === 'run') {
      g.running = true;
      g.speed = w.solo ? 205 : 230;
      g.retarget -= dt;
      if (g.tx == null || g.retarget <= 0) {
        const near = w.players.length ? w.players.reduce((a, p) => dist(p, g) < dist(a, g) ? p : a) : g;
        let best = rand(WAYPOINTS), bd = -1;
        for (let i = 0; i < 4; i++) {
          const p = rand(WAYPOINTS);
          const d = Math.hypot(p[0] - near.x, p[1] - near.y) - Math.hypot(p[0] - g.x, p[1] - g.y) * 0.5; // stay nearby, away from player
          if (d > bd) { bd = d; best = p; }
        }
        g.tx = best[0]; g.ty = best[1]; g.retarget = 1.3 + Math.random();
      }
      moveTo(g, dt, false);
      const cr = w.crises.find(x => x.type === 'ghodi');
      for (const p of w.players) if (cr && p.frozen <= 0 && dist(p, g) < 40) { resolveCrisis(cr, p); break; }
    }

    for (const kd of w.kids) {
      kd.hopT = Math.max(0, (kd.hopT || 0) - dt);
      if (kd.bubble) { kd.bubble.age += dt; if (kd.bubble.age > kd.bubble.dur) kd.bubble = null; }
      if (kd.state === 'run') { if (moveTo(kd, dt, true)) kd.state = 'eat'; }
      else if (kd.state === 'eat') kd.moving = false;
      else if (kd.state === 'flee') { kd.tx = 2620; kd.ty = kd.y; moveTo(kd, dt, true); if (kd.x > 2600) kd.gone = true; }
      if (kd.state !== 'flee') {
        for (const p of w.players) {
          if (p.frozen <= 0 && dist(p, kd) < 32) {
            kd.state = 'flee'; kd.speed = 240; p.stats.kids++; p.score += 30; AU.sfx('pop');
            floatText(kd.x, kd.y - 40, '+30', p.color); say(kd, rand(CAST.chotu.shooed));
            const cr = w.crises.find(x => x.id === kd.crid); if (cr) cr.lastShooer = p;
            break;
          }
        }
      }
    }
    w.kids = w.kids.filter(k => !k.gone);
  }

  function pinkyLogic(e, dt) {
    e.cool -= dt;
    const targets = w.players.filter(p => p.frozen <= 0);
    const t = targets.length ? targets.reduce((a, p) => dist(p, e) < dist(a, e) ? p : a) : null;
    if (e.cool > 0 || !t || dist(t, e) > 520) {
      e.chasing = false;
      if (e.tx == null) { const p = rand(WAYPOINTS); e.tx = p[0]; e.ty = p[1]; }
      e.speed = 70; moveTo(e, dt); return;
    }
    e.tx = t.x; e.ty = t.y; e.speed = 85;
    moveTo(e, dt);
    e.chasing = dist(t, e) < 200;
    if (dist(t, e) < 28) {
      t.frozen = 2.6; t.frozenBy = 'pinky'; t.stats.pinky++;
      say(e, rand(CAST.pinky.idle).replace(/\{name\}/g, t.name), { dur: 3, priority: true });
      e.cool = 8; e.tx = null; e.chasing = false;
    }
  }

  function chatter(dt) {
    w.chatterT -= dt;
    if (w.chatterT > 0) return;
    w.chatterT = 3 + Math.random() * 3;
    const n = w.npc;
    const pool = ['fufaji', 'sharma', 'dadi', 'gupta', 'nani', 'selfie', 'bablu', 'dj', 'pandey', 'lallan', 'tentwala', 'mama', 'raju', 'click', 'chaiwala', 'golgappa', 'dholi', 'verma', 'tina'];
    if (PHASES[w.phase].id === 3) pool.push('pandit', 'pandit', 'dadi');
    if (Object.values(n).filter(e => e.bubble).length >= 3) return;
    let cands = pool.filter(k => n[k] && n[k].visible && !n[k].bubble && CAST[k].idle && !(k === 'fufaji' && n.fufaji.mood === 'angry'));
    const vis = cands.filter(k => onScreen(n[k].x, n[k].y));
    if (vis.length) cands = vis;
    if (!cands.length) return;
    const k = rand(cands);
    say(n[k], rand(CAST[k].idle));
  }

  function pickMusic() {
    if (state !== 'play') return;
    const has = t => w.crises.some(x => x.type === t);
    let tr = PHASES[w.phase].track, tempo = 1;
    if (w.musicOverride && w.elapsed > w.musicOverride.until) w.musicOverride = null;
    if (w.djReq && w.elapsed > w.djReq.until) w.djReq = null;
    const onFloor = w.players.some(p => p.x > DANCE[0] && p.x < DANCE[0] + DANCE[2] && p.y > DANCE[1] && p.y < DANCE[1] + DANCE[3]);
    if (has('power')) tr = 'powercut';
    else if (has('dj')) tr = 'djsad';
    else if (has('ghodi')) tr = 'chase';
    else if (has('fufaji')) tr = 'fufaji';
    else if (w.musicOverride) tr = w.musicOverride.track;
    else if (w.djReq) tr = w.djReq.track;
    else if (onFloor) tr = 'dance';
    else if (w.npc.pinky.chasing) tr = 'pinky';
    else tempo = Math.min(1.25, 1 + 0.05 * w.crises.length);
    AU.playTrack(tr);
    AU.setTempo(tempo);
  }

  // ---------- FX ----------
  function burst(x, y, nn, type) {
    const cols = type === 'petal' ? ['#ff6b9d', '#ff9f43', '#feca57', '#ff4757', '#fff'] : type === 'spark' ? ['#fff3a0', '#ffd166', '#ffffff'] : ['#ff6b9d', '#4ecdc4', '#feca57', '#a29bfe', '#ff9f43'];
    for (let i = 0; i < nn; i++) {
      const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 180;
      w.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0, max: 0.8 + Math.random() * 0.8, col: rand(cols), size: 3 + Math.random() * 4, type, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 });
    }
  }
  function firework(x, y) {
    x = x == null ? cam.x + (Math.random() - 0.5) * W * 0.8 / cam.z : x;
    y = y == null ? cam.y - H * 0.25 / cam.z + Math.random() * 120 : y;
    const col = rand(['#ff6b9d', '#4ecdc4', '#feca57', '#a29bfe', '#ff9f43', '#55efc4']);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2, s = 120 + Math.random() * 60;
      w.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 1.2 + Math.random() * 0.5, col, size: 3, type: 'fw', rot: 0, vr: 0 });
    }
    AU.sfx('firework');
  }
  function floatText(x, y, text, col) { w.floats.push({ x, y, text, col, age: 0 }); }

  function updateFx(dt) {
    for (const p of w.particles) {
      p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.type === 'fw') { p.vx *= 0.97; p.vy = p.vy * 0.97 + 40 * dt; } else if (p.type !== 'smoke') { p.vy += 260 * dt; p.vx *= 0.98; }
      p.rot += p.vr * dt;
    }
    w.particles = w.particles.filter(p => p.life < p.max);
    for (const f of w.floats) f.age += dt;
    w.floats = w.floats.filter(f => f.age < 1.4);
    for (const p of w.players) if (p.bubble) { p.bubble.age += dt; if (p.bubble.age > p.bubble.dur) p.bubble = null; }
    w.shake = Math.max(0, w.shake - dt * 30);
    w.flash = Math.max(0, w.flash - dt * 2.5);
    w.tentDown = Math.max(0, w.tentDown - dt);
    babbleCool -= dt;
    if (!w.crises.some(x => x.type === 'paneer') && Math.random() < dt * 4) w.particles.push({ x: 2380 + Math.random() * 30, y: 140, vx: (Math.random() - 0.5) * 10, vy: -30, life: 0, max: 1.6, col: 'rgba(255,255,255,0.35)', size: 6, type: 'smoke', rot: 0, vr: 0 });
    if (w.crises.some(x => x.type === 'power') && Math.random() < dt * 6) w.particles.push({ x: 220 + Math.random() * 30, y: 1180, vx: (Math.random() - 0.5) * 20, vy: -40, life: 0, max: 1.8, col: 'rgba(90,90,90,0.6)', size: 10, type: 'smoke', rot: 0, vr: 0 });
  }

  // ---------- Main loop ----------
  function loop(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    frame(dt);
    requestAnimationFrame(loop);
  }

  // Test hook: step the game forward without waiting for animation frames.
  G._advance = function (sec, held) {
    const step = 1 / 30;
    for (let t = 0; t < sec; t += step) {
      if (held) for (const k of held) keys[k] = true;
      frame(step);
    }
    if (held) for (const k of held) keys[k] = false;
  };
  G._world = () => w;
  G._cam = () => cam;

  function frame(dt) {
    time += dt;
    if (state === 'title') updateDemo(dt);
    else if (state === 'play') update(dt);
    else if (state === 'freeze') {
      const f = w.freeze; f.t += dt;
      updateFx(dt * 0.2);
      // any key or click skips the meme (except the final "shaadi cancel" one, which needs a moment)
      const skip = f.t > 0.5 && !f.after && (Object.keys(pressed).some(k => pressed[k]) || mouse.clicked);
      if (f.t >= f.dur || skip) { w.freeze = null; if (f.after) f.after(); else state = 'play'; }
    } else if (state === 'ending') {
      const e = w.ending; e.t += dt; e.fw -= dt;
      if (e.fw <= 0) { firework(); e.fw = 0.45 + Math.random() * 0.5; }
      if (Math.random() < dt * 8) burst(cam.x + (Math.random() - 0.5) * W, cam.y - H / 2 + 80, 2, 'confetti');
      updateFx(dt);
      for (const k in w.npc) { const n = w.npc[k]; if (n.bubble) { n.bubble.age += dt; if (n.bubble.age > n.bubble.dur) n.bubble = null; } }
      if (e.t > 3.2 && !w.endShot) w.endShot = snapshot();
      if (e.t >= e.dur) { w.ending = null; finish(true); }
    } else if (state === 'result') updateFx(dt);
    updateCamera(dt);
    updateHover();
    render();
    if (state === 'freeze' && w.freeze && !w.freeze.shot && w.freeze.t > 0.35) {
      w.freeze.shot = true;
      if (!w.memeShot || w.freeze.pen >= w.memeShot.pen) w.memeShot = { img: snapshot(), caption: w.freeze.caption, pen: w.freeze.pen };
    }
    hudT -= dt;
    if (hudT <= 0 && w && !w.demo && state !== 'result' && state !== 'title') { hudT = 0.1; pushHud(); }
    for (const k in pressed) pressed[k] = false;
    mouse.clicked = false;
    clickCache = null;
  }

  // Cheap screenshot: copy into a small canvas now, encode to an image only when the result card needs it.
  function snapshot() {
    const s = document.createElement('canvas'); s.width = 640; s.height = 360;
    s.getContext('2d').drawImage(cv, 0, 0, 640, 360);
    return s;
  }

  function updateHover() {
    if (state !== 'play' || mouse.sx < 0) { mouse.hover = null; if (cv) cv.style.cursor = 'default'; return; }
    const [wx, wy] = toWorld(mouse.sx, mouse.sy);
    mouse.hover = hitTest(wx, wy);
    cv.style.cursor = mouse.hover ? 'pointer' : 'default';
  }

  function updateDemo(dt) {
    const n = w.npc, g = w.ghodi;
    g.x += 70 * dt; g.moving = true; g.facing = 1;
    if (g.x > 1650) g.x = -80;
    const place = (e, dx, dy) => { e.x = g.x + dx; e.y = 810 + dy; e.moving = true; e.walk += dt; };
    place(n.raju, -80, -10); place(n.band1, -120, 12); place(n.band2, -160, -8);
    n.bablu.x = g.x + 110; n.bablu.y = 818; n.bablu.dancing = true;
    for (const k in n) { const e = n[k]; if (e.bubble) { e.bubble.age += dt; if (e.bubble.age > e.bubble.dur) e.bubble = null; } }
    w.chatterT -= dt;
    if (w.chatterT <= 0) {
      w.chatterT = 2.8 + Math.random() * 2;
      const vis = Object.keys(n).filter(k => n[k].visible && CAST[k] && CAST[k].idle && onScreen(n[k].x, n[k].y));
      if (vis.length) { const k = rand(vis); say(n[k], rand(CAST[k].idle)); }
    }
    if (Math.random() < dt * 0.6) firework();
    updateFx(dt);
  }

  function pushHud() {
    const ph = PHASES[w.phase];
    const left = Math.max(0, ph.dur - w.phaseT);
    let clock = null;
    if (ph.id === 3) {
      const mins = 30 + 12 * Math.min(1, w.phaseT / ph.dur);
      const m = Math.floor(mins), s = Math.floor((mins - m) * 60);
      clock = '10:' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' PM';
    }
    BAG.UI.hud({
      phase: 'Phase ' + ph.id + ': ' + ph.name, left, clock, izzat: w.izzat,
      players: w.players.map(p => ({ name: p.name, score: p.score, color: p.color })),
      alerts: w.crises.map(cr => ({ id: cr.id, icon: cr.d.icon, title: cr.title, hint: cr.d.hint, frac: cr.t / cr.max }))
    });
  }

  // ---------- Background (prerendered world) ----------
  function buildBackground() {
    const b = document.createElement('canvas'); b.width = WW; b.height = WH;
    const g = b.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, WH);
    grd.addColorStop(0, '#1d4a2c'); grd.addColorStop(1, '#14361f');
    g.fillStyle = grd; g.fillRect(0, 0, WW, WH);
    for (let x = 0; x < WW; x += 64) { g.fillStyle = (x / 64) % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'; g.fillRect(x, 0, 32, WH); }
    for (let i = 0; i < 3500; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(120,200,120,0.12)' : 'rgba(10,40,20,0.25)'; g.fillRect(Math.random() * WW, Math.random() * WH, 2, 3); }
    for (let i = 0; i < 260; i++) { g.fillStyle = rand(['#ffb3c7', '#fff3b0', '#ffd6a5']); g.beginPath(); g.arc(Math.random() * WW, Math.random() * WH, 1.8, 0, 7); g.fill(); }
    // road + parking
    g.fillStyle = '#2f3542'; g.fillRect(0, 0, 150, WH);
    g.fillStyle = '#f1f2f6'; for (let y = 10; y < WH; y += 60) g.fillRect(70, y, 8, 32);
    g.fillStyle = '#57606f'; g.fillRect(150, 0, 12, WH);
    g.fillStyle = '#3d4450'; R.rr(g, 170, 140, 270, 420, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3;
    for (let y = 160; y < 560; y += 140) { g.beginPath(); g.moveTo(180, y); g.lineTo(330, y); g.stroke(); }
    g.font = '800 26px ' + R.FONT; g.fillStyle = 'rgba(255,255,255,0.4)'; g.textAlign = 'center'; g.fillText('P  PARKING', 305, 130);
    // food court tiles
    for (let x = 1820; x < WW; x += 40) for (let y = 380; y < 1520; y += 40) { g.fillStyle = ((x + y) / 40) % 2 ? '#3a2d2a' : '#43342f'; g.fillRect(x, y, 40, 40); }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(1820, 380, 6, 1140);
    g.font = '800 34px ' + R.FONT; g.fillStyle = 'rgba(255,209,102,0.55)'; g.fillText('🍛 FOOD COURT', 2180, 1500);
    // dance floor
    const [dx, dy, dw, dh] = DANCE;
    for (let x = 0; x < dw; x += 40) for (let y = 0; y < dh; y += 40) { g.fillStyle = ((x + y) / 40) % 2 ? '#2d1b4e' : '#1b1035'; g.fillRect(dx + x, dy + y, 40, 40); }
    g.strokeStyle = '#ff2e97'; g.lineWidth = 4; g.strokeRect(dx, dy, dw, dh);
    // red carpet: road -> gate -> mandap
    g.fillStyle = '#8e1b2b'; g.fillRect(150, 790, 970, 40);
    g.strokeStyle = '#f7c948'; g.lineWidth = 2; g.strokeRect(150, 792, 970, 36);
    g.fillStyle = 'rgba(247,201,72,0.5)'; for (let x = 165; x < 1110; x += 26) { g.beginPath(); g.arc(x, 810, 3, 0, 7); g.fill(); }
    // rangoli in front of mandap
    const rx = 1230, ry = 1060;
    ['#e84393', '#fdcb6e', '#00cec9', '#e17055'].forEach((col, i) => {
      g.fillStyle = col;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + i * 0.2; g.beginPath(); g.ellipse(rx + Math.cos(a) * (34 - i * 8), ry + Math.sin(a) * (16 - i * 4), 10 - i * 2, 5 - i, a, 0, 7); g.fill(); }
    });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(rx, ry, 5, 0, 7); g.fill();
    // banquet chairs around the mandap
    const chair = (x, y) => { g.fillStyle = '#b33939'; R.rr(g, x - 8, y - 18, 16, 14, 3); g.fill(); g.fillStyle = '#f5f0e6'; R.rr(g, x - 9, y - 6, 18, 8, 3); g.fill(); };
    for (let i = 0; i < 9; i++) { chair(900 + i * 34, 1120); chair(1400 + i * 32, 1120); }
    for (let i = 0; i < 6; i++) { chair(1440 + i * 30, 560); chair(1440 + i * 30, 610); }
    chair(980, 1082); chair(1060, 907); chair(1400, 907);
    // flower pots and hedges
    g.fillStyle = '#0f2a17';
    for (let x = 160; x < WW; x += 22) { g.beginPath(); g.arc(x, WH + 4, 16, 0, 7); g.fill(); g.beginPath(); g.arc(x, 50, 16, 0, 7); g.fill(); }
    for (let y = 60; y < WH; y += 22) { g.beginPath(); g.arc(WW + 4, y, 16, 0, 7); g.fill(); }
    [[520, 120], [1700, 1080], [470, 1300], [1460, 1520], [880, 1520], [1780, 120], [2540, 1560], [700, 1080]].forEach(([x, y]) => {
      g.fillStyle = '#a0522d'; R.rr(g, x - 10, y - 10, 20, 16, 4); g.fill();
      g.fillStyle = '#2ecc71'; g.beginPath(); g.arc(x, y - 16, 10, 0, 7); g.fill();
      g.fillStyle = '#ff7f11'; g.beginPath(); g.arc(x - 4, y - 20, 3.5, 0, 7); g.arc(x + 5, y - 15, 3.5, 0, 7); g.fill();
    });
    // area signs
    g.font = '800 22px ' + R.FONT; g.fillStyle = 'rgba(255,234,167,0.5)';
    g.fillText('🎶 DANCE FLOOR', 920, 718); g.fillText('🛕 MANDAP', 1230, 745);
    return b;
  }

  // ---------- Drawing the venue ----------
  const has = type => w.crises.some(x => x.type === type);

  function drawGate() {
    c.fillStyle = '#7b2d26';
    R.rr(c, 430, 690, 24, 50, 4); c.fill(); R.rr(c, 430, 880, 24, 50, 4); c.fill();
    R.garland(c, 442, 690, 442, 930, 0);
    c.strokeStyle = '#f7c948'; c.lineWidth = 6; c.beginPath(); c.arc(442, 810, 120, -Math.PI / 2 - 0.05, Math.PI / 2 + 0.05, true); c.stroke();
    c.save(); c.translate(395, 810); c.rotate(-Math.PI / 2);
    c.font = '800 20px ' + R.FONT; c.textAlign = 'center'; c.fillStyle = '#ffd166'; c.fillText('✿ SWAGAT HAI ✿', 0, 0);
    c.restore();
  }

  function drawStage() {
    const [x, y, ww, hh] = STATIONS.stage.rect;
    c.save();
    if (has('tent') || w.tentDown > 0) {
      const a = w.tentDown > 0 ? 0.08 : 0.035 + Math.sin(time * 6) * 0.018;
      c.translate(x, y + hh); c.rotate(a); c.translate(-x, -(y + hh));
    }
    for (let i = 0; i < ww / 20; i++) { c.fillStyle = i % 2 ? '#c0392b' : '#f6b93b'; c.fillRect(x + i * 20, y, 20, hh - 34); }
    c.fillStyle = '#8e1b2b'; for (let i = 0; i < ww / 25; i++) { c.beginPath(); c.arc(x + 12.5 + i * 25, y, 12.5, 0, Math.PI); c.fill(); }
    c.fillStyle = '#5b1a24'; c.fillRect(x, y + hh - 34, ww, 34);
    c.fillStyle = '#f7c948'; c.fillRect(x, y + hh - 34, ww, 3);
    c.fillStyle = '#b71540'; R.rr(c, x + ww / 2 - 75, y + hh - 80, 150, 50, 16); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 3; R.rr(c, x + ww / 2 - 75, y + hh - 80, 150, 50, 16); c.stroke();
    c.fillStyle = '#4a0e1a'; R.rr(c, x + ww / 2 - 110, y + 16, 220, 34, 8); c.fill();
    c.font = '800 24px ' + R.FONT; c.textAlign = 'center'; c.fillStyle = '#ffd166'; c.fillText('✿ Shubh Vivah ✿', x + ww / 2, y + 41);
    R.garland(c, x, y + hh - 34, x + ww, y + hh - 34, 20);
    c.restore();
    if (w.tentDown > 0) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x, y, ww, hh); }
  }

  function drawKitchen() {
    const [x, y, ww, hh] = STATIONS.kitchen.rect;
    c.fillStyle = '#6d4c41'; R.rr(c, x, y, ww, hh, 8); c.fill();
    c.fillStyle = '#8d6e63'; R.rr(c, x + 6, y + 6, ww - 12, hh - 34, 6); c.fill();
    c.fillStyle = '#bf6b3a'; c.beginPath(); c.arc(x + 55, y + 62, 30, 0, 7); c.fill();
    c.fillStyle = '#2d1b10'; c.beginPath(); c.arc(x + 55, y + 62, 16, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,120,30,' + (0.5 + Math.sin(time * 5) * 0.2) + ')'; c.beginPath(); c.arc(x + 55, y + 62, 11, 0, 7); c.fill();
    c.fillStyle = '#2d3436'; c.beginPath(); c.ellipse(x + 175, y + 60, 46, 28, 0, 0, 7); c.fill();
    c.fillStyle = '#636e72'; c.beginPath(); c.ellipse(x + 175, y + 58, 40, 22, 0, 0, 7); c.fill();
    if (!has('paneer')) {
      c.fillStyle = '#d35400'; c.beginPath(); c.ellipse(x + 175, y + 58, 35, 18, 0, 0, 7); c.fill();
      c.fillStyle = '#fff6dc'; for (let i = 0; i < 12; i++) c.fillRect(x + 150 + (i % 4) * 13, y + 47 + Math.floor(i / 4) * 8, 8, 6);
    } else { c.font = '800 15px ' + R.FONT; c.fillStyle = '#ff7675'; c.textAlign = 'center'; c.fillText('KHATAM!', x + 175, y + 63); }
    c.fillStyle = '#b2bec3'; c.beginPath(); c.arc(x + 255, y + 60, 20, 0, 7); c.fill();
    c.font = '800 17px ' + R.FONT; c.fillStyle = '#ffd166'; c.textAlign = 'center'; c.fillText('RASOI', x + ww / 2, y + hh - 10);
  }

  function drawBuffet() {
    const [x, y, ww, hh] = STATIONS.buffet.rect;
    c.fillStyle = '#f5f0e6'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#c0392b'; c.fillRect(x, y + hh - 14, ww, 14);
    c.fillStyle = '#f7c948'; c.fillRect(x, y + hh - 15, ww, 2);
    for (let i = 0; i < 5; i++) {
      const cx = x + 34 + i * 63;
      c.fillStyle = '#b2bec3'; c.beginPath(); c.ellipse(cx, y + 24, 24, 14, 0, 0, 7); c.fill();
      c.fillStyle = '#dfe6e9'; c.beginPath(); c.ellipse(cx, y + 21, 20, 10, 0, 0, 7); c.fill();
    }
    if (has('fufaji')) {
      const p = 0.5 + Math.sin(time * 8) * 0.5;
      c.fillStyle = 'rgba(255,214,102,' + (0.35 + p * 0.4) + ')'; c.beginPath(); c.ellipse(x + ww / 2, y + hh + 18, 44, 15, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + ww / 2, y + hh + 16 - i * 3, 14, 5, 0, 0, 7); c.fill(); }
    }
    c.font = '800 13px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText('BUFFET', x + ww / 2, y + hh - 2);
  }

  function drawDessert() {
    const [x, y, ww, hh] = STATIONS.dessert.rect;
    c.fillStyle = '#fd79a8'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#fab1a0'; R.rr(c, x + 4, y + 4, ww - 8, hh - 16, 5); c.fill();
    const eaten = w.kids.filter(k => k.state === 'eat').length;
    c.fillStyle = '#d4a017'; c.beginPath(); c.ellipse(x + 50, y + 20, 30, 13, 0, 0, 7); c.fill();
    c.fillStyle = '#5d2a0c';
    for (let i = 0; i < Math.max(0, 8 - eaten * 3); i++) { c.beginPath(); c.arc(x + 32 + (i % 4) * 11, y + 16 + Math.floor(i / 4) * 8, 4.5, 0, 7); c.fill(); }
    c.strokeStyle = '#ff9f1a'; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + 112 + i * 15, y + 20, 5, 0, Math.PI * 1.7); c.stroke(); }
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#4a0e1a'; c.textAlign = 'center'; c.fillText('MITHAI', x + ww / 2, y + hh - 2);
  }

  function drawStall(id, title, col, drawGoods) {
    const [x, y, ww, hh] = STATIONS[id].rect;
    c.fillStyle = '#6d4c41'; R.rr(c, x, y, ww, hh, 6); c.fill();
    for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? col : '#fff'; c.fillRect(x + i * ww / 6, y - 22, ww / 6, 18); }
    drawGoods(x, y, ww, hh);
    c.font = '800 13px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText(title, x + ww / 2, y + hh - 6);
  }

  function drawDJ() {
    const [x, y, ww, hh] = STATIONS.dj.rect;
    const sad = has('dj');
    R.person(c, Object.assign({}, w.npc.dj, { mood: w.npc.dj.mood, dancing: !sad, label: null }), time);
    c.fillStyle = '#111'; R.rr(c, x, y + 30, ww, hh - 30, 8); c.fill();
    const beat = Math.abs(Math.sin(time * Math.PI * 2.2));
    const col1 = sad ? '#3d5a80' : '#ff2e97', col2 = sad ? '#293241' : '#00f5d4';
    c.strokeStyle = col1; c.lineWidth = 3; R.rr(c, x, y + 30, ww, hh - 30, 8); c.stroke();
    [x + 26, x + ww - 26].forEach(sx => {
      c.fillStyle = '#2d3436'; R.rr(c, sx - 20, y + 2, 40, 54, 6); c.fill();
      c.fillStyle = '#000'; c.beginPath(); c.arc(sx, y + 30, 12 + (sad ? 0 : beat * 3), 0, 7); c.fill();
      c.strokeStyle = col2; c.lineWidth = 2; c.beginPath(); c.arc(sx, y + 30, 14 + (sad ? 0 : beat * 3), 0, 7); c.stroke();
    });
    c.font = '800 14px ' + R.FONT; c.textAlign = 'center'; c.fillStyle = col2;
    c.fillText(sad ? 'DJ 😭 SAD' : 'DJ DHAMAKA', x + ww / 2, y + hh - 14);
    if (!sad && !w.dark) {
      c.globalAlpha = 0.1 + beat * 0.1;
      c.fillStyle = col1; c.beginPath(); c.moveTo(x + ww / 2, y + 30); c.lineTo(x + ww + 120, y + 280); c.lineTo(x + ww + 260, y + 200); c.fill();
      c.fillStyle = col2; c.beginPath(); c.moveTo(x + ww / 2, y + 30); c.lineTo(x + ww + 300, y + 60); c.lineTo(x + ww + 320, y + 160); c.fill();
      c.globalAlpha = 1;
    }
  }

  function drawGenerator() {
    const [x, y, ww, hh] = STATIONS.generator.rect;
    c.fillStyle = '#636e72'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#2d3436'; for (let i = 0; i < 5; i++) c.fillRect(x + 12, y + 14 + i * 10, ww - 40, 4);
    const on = !has('power');
    c.fillStyle = on ? '#55efc4' : (Math.sin(time * 10) > 0 ? '#ff4757' : '#5a1010'); c.beginPath(); c.arc(x + ww - 14, y + 16, 6, 0, 7); c.fill();
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText('GENERATOR', x + ww / 2, y + hh - 6);
  }

  function drawStable() {
    const [x, y, ww, hh] = STATIONS.stable.rect;
    c.fillStyle = '#e1b12c'; R.rr(c, x + 10, y + 16, ww - 20, hh - 22, 10); c.fill();
    c.strokeStyle = '#c69500'; c.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const hx = x + 14 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * (ww - 28), hy = y + 20 + (Math.sin(i * 78.233) * 0.5 + 0.5) * (hh - 30);
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 6, hy - 2); c.stroke();
    }
    c.strokeStyle = '#6d4c41'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + ww, y + 8); c.moveTo(x, y + 22); c.lineTo(x + ww, y + 22); c.stroke();
    for (let i = 0; i <= 4; i++) { c.fillStyle = '#5d4037'; c.fillRect(x + i * (ww / 4) - 3, y, 6, 30); }
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText('RANI KA TABELA', x + ww / 2, y + hh - 4);
  }

  function drawMandap() {
    const [x, y, ww, hh] = STATIONS.mandap.rect;
    c.fillStyle = '#7b1e2b'; R.rr(c, x, y, ww, hh, 10); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 3; R.rr(c, x + 6, y + 6, ww - 12, hh - 12, 8); c.stroke();
    const fx = x + ww / 2, fy = y + hh / 2 + 4;
    c.fillStyle = '#a0522d'; c.fillRect(fx - 18, fy - 6, 36, 18);
    for (let i = 0; i < 3; i++) {
      const fl = Math.sin(time * 12 + i) * 3;
      c.fillStyle = ['#ff4500', '#ff9f1a', '#ffe066'][i];
      c.beginPath(); c.ellipse(fx, fy - 8 - i * 3 + fl * 0.3, 11 - i * 3, 15 - i * 3 + fl, 0, 0, 7); c.fill();
    }
    [[x + 10, y + 10], [x + ww - 10, y + 10], [x + 10, y + hh - 10], [x + ww - 10, y + hh - 10]].forEach(([px, py]) => {
      c.fillStyle = '#f7c948'; c.beginPath(); c.arc(px, py, 12, 0, 7); c.fill();
      c.fillStyle = '#ff7f11'; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill();
    });
    R.garland(c, x + 10, y + 10, x + ww - 10, y + 10, 16);
    R.garland(c, x + 10, y + hh - 10, x + ww - 10, y + hh - 10, 12);
  }

  function drawBrideRoom() {
    const [x, y, ww, hh] = STATIONS.bride.rect;
    c.fillStyle = '#c56cf0'; R.rr(c, x, y, ww, hh, 10); c.fill();
    c.fillStyle = '#8e44ad'; c.fillRect(x, y, ww, 30);
    for (let i = 0; i < 4; i++) { c.fillStyle = '#ffeaa7'; R.rr(c, x + 30 + i * 90, y + 60, 50, 60, 6); c.fill(); c.strokeStyle = '#6c3483'; c.lineWidth = 3; R.rr(c, x + 30 + i * 90, y + 60, 50, 60, 6); c.stroke(); }
    c.fillStyle = '#6c3483'; R.rr(c, x + ww / 2 - 28, y + hh - 80, 56, 80, 6); c.fill();
    c.fillStyle = '#f7c948'; c.beginPath(); c.arc(x + ww / 2 + 16, y + hh - 40, 4, 0, 7); c.fill();
    R.garland(c, x + ww / 2 - 34, y + hh - 84, x + ww / 2 + 34, y + hh - 84, 14);
    c.font = '800 18px ' + R.FONT; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('DULHAN KA KAMRA', x + ww / 2, y + 22);
    c.font = '700 13px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.fillText('(Entry Mana Hai 🚫)', x + ww / 2, y + 150);
  }

  function drawPhotoBooth() {
    const [x, y, ww, hh] = STATIONS.photo.rect;
    c.fillStyle = '#2d3436'; R.rr(c, x, y, ww, hh, 8); c.fill();
    c.strokeStyle = '#ffd166'; c.lineWidth = 4; R.rr(c, x + 8, y + 8, ww - 16, hh - 26, 6); c.stroke();
    c.font = '20px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText('📸 🕶️ 👑', x + ww / 2, y + 48);
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.fillText('PHOTO BOOTH', x + ww / 2, y + hh - 5);
  }

  function drawGifts() {
    const [x, y, ww, hh] = STATIONS.gifts.rect;
    c.fillStyle = '#f5f0e6'; R.rr(c, x, y, ww, hh, 6); c.fill();
    [['#e84393', 10], ['#0984e3', 45], ['#00b894', 80], ['#fdcb6e', 112]].forEach(([col, ox], i) => {
      c.fillStyle = col; c.fillRect(x + ox, y - 18 - (i % 2) * 8, 28, 28 + (i % 2) * 8);
      c.fillStyle = '#fff'; c.fillRect(x + ox + 12, y - 18 - (i % 2) * 8, 4, 28 + (i % 2) * 8);
    });
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#4a0e1a'; c.textAlign = 'center'; c.fillText('GIFTS', x + ww / 2, y + hh - 4);
  }

  function drawCars() {
    ['car1', 'car2', 'car3'].forEach(id => {
      const s = STATIONS[id], [x, y, ww, hh] = s.rect;
      c.fillStyle = s.car; R.rr(c, x, y, ww, hh, 16); c.fill();
      c.fillStyle = 'rgba(30,40,60,0.8)'; R.rr(c, x + 30, y + 8, 50, hh - 16, 8); c.fill();
      c.fillStyle = '#ffeaa7'; c.fillRect(x + ww - 6, y + 8, 5, 10); c.fillRect(x + ww - 6, y + hh - 18, 5, 10);
    });
  }

  function drawProps() {
    // jhula
    const j = PROPS.jhula;
    c.strokeStyle = '#6d4c41'; c.lineWidth = 6;
    c.beginPath(); c.moveTo(j.x - 50, j.y); c.lineTo(j.x - 40, j.y - 110); c.lineTo(j.x + 40, j.y - 110); c.lineTo(j.x + 50, j.y); c.stroke();
    const sw = Math.sin(time * 2) * 10;
    c.strokeStyle = '#f7c948'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(j.x - 22, j.y - 108); c.lineTo(j.x - 22 + sw, j.y - 30); c.moveTo(j.x + 22, j.y - 108); c.lineTo(j.x + 22 + sw, j.y - 30); c.stroke();
    c.fillStyle = '#e84393'; R.rr(c, j.x - 28 + sw, j.y - 32, 56, 10, 4); c.fill();
    R.garland(c, j.x - 40, j.y - 110, j.x + 40, j.y - 110, 10);
    // fireworks crate
    const f = PROPS.fireworks;
    c.fillStyle = '#c0392b'; R.rr(c, f.x - 26, f.y - 30, 52, 30, 4); c.fill();
    c.font = '800 11px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText('PATAKHE', f.x, f.y - 12);
    c.strokeStyle = '#ffd166'; c.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(f.x + i * 8, f.y - 30); c.lineTo(f.x + i * 8, f.y - 44); c.stroke(); }
    // dining tables
    for (const t of TABLES) {
      c.fillStyle = '#f5f0e6'; c.beginPath(); c.arc(t.x, t.y, t.r, 0, 7); c.fill();
      c.strokeStyle = '#c0392b'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#ff7f11'; c.beginPath(); c.arc(t.x, t.y, 8, 0, 7); c.fill();
    }
    // dhol
    const d = w.npc.dholi;
    c.fillStyle = '#c0392b'; c.beginPath(); c.ellipse(d.x + 26, d.y - 18, 12, 16, 0, 0, 7); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 2; c.stroke();
  }

  function drawItems() {
    for (const it of w.items) {
      if (it.kind !== 'chashma') continue;
      const s = 1 + Math.sin(time * 6) * 0.1;
      c.save(); c.translate(it.x, it.y - 6); c.scale(s, s);
      c.fillStyle = 'rgba(255,240,150,0.35)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill();
      c.strokeStyle = '#2d3436'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(-7, 0, 6, 0, 7); c.stroke(); c.beginPath(); c.arc(7, 0, 6, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(-1, 0); c.lineTo(1, 0); c.stroke();
      c.restore();
    }
  }

  function markerPos(cr) {
    const pt = crisisPoint(cr);
    return { x: pt.x, y: pt.y - (cr.type === 'ghodi' ? 50 : 72) };
  }

  function drawMarker(cr) {
    const m = markerPos(cr);
    const frac = clamp(cr.t / cr.max, 0, 1);
    const pulse = 1 + Math.sin(time * 8) * 0.08;
    c.save(); c.translate(m.x, m.y); c.scale(pulse, pulse);
    c.fillStyle = frac < 0.3 ? '#ff4757' : '#fffaf0';
    c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill();
    c.strokeStyle = frac < 0.3 ? '#fff' : frac < 0.6 ? '#ffa502' : '#2ed573';
    c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 23, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke();
    c.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(cr.d.icon, 0, 1);
    c.textBaseline = 'alphabetic';
    if (cr.progress > 0) {
      c.fillStyle = 'rgba(0,0,0,0.5)'; R.rr(c, -26, 28, 52, 8, 4); c.fill();
      c.fillStyle = '#55efc4'; R.rr(c, -26, 28, 52 * cr.progress, 8, 4); c.fill();
    }
    c.restore();
  }

  function drawPlayerExtras(p) {
    const hy = p.y - 70 - (p.moving ? Math.abs(Math.sin(p.walk * 11)) * 3 : 0);
    c.fillStyle = p.color;
    c.beginPath(); c.moveTo(p.x - 7, hy - 10); c.lineTo(p.x + 7, hy - 10); c.lineTo(p.x, hy); c.closePath(); c.fill();
    if (p.boost > 0) { c.font = '18px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText('⚡', p.x + 20, hy); }
    if (p.hint) {
      c.font = '700 13px ' + R.FONT; c.textAlign = 'center';
      const tw = c.measureText(p.hint).width + 14;
      c.fillStyle = 'rgba(20,10,30,0.8)'; R.rr(c, p.x - tw / 2, hy - 36, tw, 22, 11); c.fill();
      c.strokeStyle = p.color; c.lineWidth = 1.5; R.rr(c, p.x - tw / 2, hy - 36, tw, 22, 11); c.stroke();
      c.fillStyle = '#fff'; c.fillText(p.hint, p.x, hy - 20);
    }
    if (p.frozenBy === 'pinky') { c.font = '700 22px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText('💍', p.x + 22 + Math.sin(time * 10) * 2, p.y - 40); }
    if (p.faceT > 0) { c.font = '700 20px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText('🌶️🔥', p.x, p.y - 84); }
  }

  function render() {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#0d0414'; c.fillRect(0, 0, W, H);
    if (w.shake > 0) c.translate((Math.random() - 0.5) * w.shake, (Math.random() - 0.5) * w.shake);
    const f = state === 'freeze' ? w.freeze : null;
    c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
    c.drawImage(bg, 0, 0);
    drawCars(); drawGate();
    drawStage(); drawKitchen(); drawBuffet(); drawDessert(); drawGenerator(); drawStable(); drawMandap(); drawBrideRoom(); drawPhotoBooth(); drawGifts();
    drawStall('golgappa', 'GOLGAPPE', '#fdcb6e', (x, y) => { for (let i = 0; i < 8; i++) { c.fillStyle = '#e1a95f'; c.beginPath(); c.arc(x + 20 + i * 15, y + 22, 6, 0, 7); c.fill(); } });
    drawStall('chai', 'CHAI ☕', '#e17055', (x, y) => { c.fillStyle = '#b2bec3'; c.beginPath(); c.arc(x + 40, y + 24, 16, 0, 7); c.fill(); for (let i = 0; i < 5; i++) { c.fillStyle = '#fff'; c.fillRect(x + 72 + i * 13, y + 16, 9, 14); } });
    drawDJ(); drawProps(); drawItems();
    // hover glow
    if (mouse.hover && !mouse.hover.rect) { c.strokeStyle = 'rgba(255,214,102,0.9)'; c.lineWidth = 3; c.beginPath(); c.arc(mouse.hover.x, mouse.hover.y, mouse.hover.r, 0, 7); c.stroke(); }
    if (mouse.hover && mouse.hover.rect) { const [x, y, rw, rh] = mouse.hover.rect; c.strokeStyle = 'rgba(255,214,102,0.9)'; c.lineWidth = 3; R.rr(c, x - 4, y - 4, rw + 8, rh + 8, 10); c.stroke(); }
    // entities sorted by y
    const ents = [];
    for (const k in w.npc) {
      const e = w.npc[k];
      if (!e.visible || k === 'dj') continue;
      ents.push({ y: e.y, draw: () => R.person(c, e.danceT > 0 ? Object.assign({}, e, { dancing: true }) : e, time) });
    }
    for (const kd of w.kids) ents.push({ y: kd.y, draw: () => R.person(c, kd, time) });
    for (const p of w.players) ents.push({ y: p.y, draw: () => R.person(c, Object.assign({}, p, { mood: p.faceT > 0 ? 'shock' : p.frozenBy === 'pinky' ? 'shock' : p.moving ? 'neutral' : 'happy' }), time) });
    const g = w.ghodi;
    ents.push({
      y: g.y, draw: () => {
        c.save();
        if (g.hopT > 0) c.translate(0, -Math.sin((g.hopT / 0.45) * Math.PI) * 14);
        R.ghodi(c, g, time);
        if (g.rider) R.person(c, Object.assign({}, w.npc.dulha, { x: g.x - 4, y: g.y - 30, label: null, moving: false, visible: true }), time);
        c.restore();
      }
    });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    drawParticles(false);
    R.fairyLights(c, LIGHTS, time, !w.dark);
    drawParticles(true);
    if (!w.demo) for (const cr of w.crises) drawMarker(cr);
    for (const p of w.players) drawPlayerExtras(p);
    for (const fl of w.floats) {
      c.globalAlpha = 1 - fl.age / 1.4;
      c.font = '800 22px ' + R.FONT; c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.strokeText(fl.text, fl.x, fl.y - fl.age * 40);
      c.fillStyle = fl.col; c.fillText(fl.text, fl.x, fl.y - fl.age * 40);
      c.globalAlpha = 1;
    }
    c.restore();

    // ---- screen space ----
    c.save();
    if (w.dark) drawDarkness();
    if (w.rain) drawRain();
    drawBubbles();
    if (!w.demo && state !== 'result') { drawArrows(); drawMinimap(); }
    if (mouse.hover && state === 'play') drawTooltip();
    if (w.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + w.flash * 0.8 + ')'; c.fillRect(0, 0, W, H); }
    if (f) drawMemeOverlay(f);
    c.restore();
  }

  function drawBubbles() {
    const speakers = [];
    for (const k in w.npc) { const e = w.npc[k]; if (e.visible && e.bubble) speakers.push(e); }
    for (const kd of w.kids) if (kd.bubble) speakers.push(kd);
    for (const p of w.players) if (p.bubble) speakers.push(p);
    for (const e of speakers) {
      let wy = e.y - (e.kid ? 56 : 72) * (e.scale || 1);
      if (e === w.npc.dj) wy = 380;
      if (e === w.npc.dulha && w.ghodi.rider) wy = w.ghodi.y - 100;
      const [sx, sy] = toScreen(e.x, wy);
      if (sx < -100 || sx > W + 100 || sy < -50 || sy > H + 100) continue;
      R.bubble(c, sx, sy, e.bubble.text, e.bubble.age, e.isPlayer ? '#fff3c4' : null);
    }
  }

  function drawTooltip() {
    const t = mouse.hover;
    const text = (t.label || '') + ' · click karo';
    c.font = '700 14px ' + R.FONT; c.textAlign = 'left';
    const tw = c.measureText(text).width + 16;
    const x = Math.min(W - tw - 6, mouse.sx + 14), y = Math.min(H - 30, mouse.sy + 18);
    c.fillStyle = 'rgba(20,10,30,0.88)'; R.rr(c, x, y, tw, 24, 12); c.fill();
    c.strokeStyle = '#ffd166'; c.lineWidth = 1.5; R.rr(c, x, y, tw, 24, 12); c.stroke();
    c.fillStyle = '#fff'; c.fillText(text, x + 8, y + 17);
  }

  function drawArrows() {
    for (const cr of w.crises) {
      const m = markerPos(cr);
      const [sx, sy] = toScreen(m.x, m.y);
      if (sx > 20 && sx < W - 20 && sy > 80 && sy < H - 20) continue;
      const cx = W / 2, cy = H / 2 + 20;
      const ang = Math.atan2(sy - cy, sx - cx);
      const ex = clamp(sx, 40, W - 40), ey = clamp(sy, 100, H - 40);
      const frac = cr.t / cr.max;
      c.save(); c.translate(ex, ey);
      c.fillStyle = frac < 0.3 ? '#ff4757' : 'rgba(255,250,240,0.95)';
      c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill();
      c.rotate(ang);
      c.fillStyle = frac < 0.3 ? '#fff' : '#ff9f1a';
      c.beginPath(); c.moveTo(34, 0); c.lineTo(22, -9); c.lineTo(22, 9); c.closePath(); c.fill();
      c.rotate(-ang);
      c.font = '20px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(cr.d.icon, 0, 1); c.textBaseline = 'alphabetic';
      c.restore();
    }
  }

  function drawMinimap() {
    const mw = 220, mh = mw * WH / WW, mx = 12, my = H - mh - 12, s = mw / WW;
    c.fillStyle = 'rgba(15,5,25,0.8)'; R.rr(c, mx - 4, my - 4, mw + 8, mh + 8, 10); c.fill();
    c.strokeStyle = 'rgba(255,209,102,0.7)'; c.lineWidth = 2; R.rr(c, mx - 4, my - 4, mw + 8, mh + 8, 10); c.stroke();
    c.fillStyle = '#1d4a2c'; c.fillRect(mx, my, mw, mh);
    c.fillStyle = '#2f3542'; c.fillRect(mx, my, 150 * s, mh);
    c.fillStyle = '#43342f'; c.fillRect(mx + 1820 * s, my + 380 * s, (WW - 1820) * s, 1140 * s);
    c.fillStyle = '#8e1b2b'; c.fillRect(mx + 150 * s, my + 790 * s, 970 * s, 40 * s);
    for (const k in STATIONS) { const r = STATIONS[k].rect; c.fillStyle = k === 'mandap' ? '#c0392b' : k === 'bride' ? '#c56cf0' : 'rgba(255,234,167,0.55)'; c.fillRect(mx + r[0] * s, my + r[1] * s, Math.max(2, r[2] * s), Math.max(2, r[3] * s)); }
    // camera view
    const hw = W / 2 / cam.z, hh = H / 2 / cam.z;
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; c.strokeRect(mx + (cam.x - hw) * s, my + (cam.y - hh) * s, hw * 2 * s, hh * 2 * s);
    // crises
    for (const cr of w.crises) {
      const pt = crisisPoint(cr);
      const pul = 3 + Math.abs(Math.sin(time * 6)) * 3;
      c.fillStyle = '#ff4757'; c.beginPath(); c.arc(mx + pt.x * s, my + pt.y * s, pul, 0, 7); c.fill();
    }
    if (w.npc.pinky.visible) { c.fillStyle = '#e84393'; c.beginPath(); c.arc(mx + w.npc.pinky.x * s, my + w.npc.pinky.y * s, 2.5, 0, 7); c.fill(); }
    for (const p of w.players) { c.fillStyle = p.color; c.beginPath(); c.arc(mx + p.x * s, my + p.y * s, 4, 0, 7); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 1; c.stroke(); }
    c.font = '700 11px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'left'; c.fillText('NAKSHA', mx + 4, my + 12);
  }

  function drawParticles(top) {
    for (const p of w.particles) {
      if ((p.type !== 'smoke') !== top) continue;
      const a = 1 - p.life / p.max;
      c.globalAlpha = Math.max(0, a);
      c.fillStyle = p.col;
      if (p.type === 'petal' || p.type === 'confetti') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        if (p.type === 'petal') { c.beginPath(); c.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, 7); c.fill(); }
        else c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      } else if (p.type === 'smoke') { c.beginPath(); c.arc(p.x, p.y, p.size * (1 + p.life), 0, 7); c.fill(); }
      else { c.beginPath(); c.arc(p.x, p.y, p.size * (p.type === 'fw' ? a + 0.3 : 1), 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  }

  let darkCanvas = null;
  function drawDarkness() {
    if (!darkCanvas) { darkCanvas = document.createElement('canvas'); darkCanvas.width = W; darkCanvas.height = H; }
    const d = darkCanvas.getContext('2d');
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, W, H);
    d.fillStyle = 'rgba(3,4,18,0.9)'; d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r) => {
      const [sx, sy] = toScreen(x, y); const rr = r * cam.z;
      const g = d.createRadialGradient(sx, sy, 0, sx, sy, rr);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g; d.beginPath(); d.arc(sx, sy, rr, 0, 7); d.fill();
    };
    for (const p of w.players) hole(p.x, p.y - 30, 150);
    hole(1230, 850, 80);
    hole(2240, 1220, 60);
    const m = w.npc.mama; hole(m.x, m.y - 30, 80);
    c.drawImage(darkCanvas, 0, 0);
  }

  function drawRain() {
    c.fillStyle = 'rgba(20,30,60,0.18)'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(180,200,255,0.45)'; c.lineWidth = 1.3;
    c.beginPath();
    for (const d of w.drops) {
      d.y += d.s * 0.016; d.x -= d.s * 0.004;
      if (d.y > H) { d.y = -10; d.x = Math.random() * (W + 100); }
      c.moveTo(d.x, d.y); c.lineTo(d.x - 4, d.y + 14);
    }
    c.stroke();
  }

  function drawMemeOverlay(f) {
    c.fillStyle = 'rgba(60,35,10,0.28)'; c.fillRect(0, 0, W, H); // cheap "old film" tint
    const v = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 760);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
    const k = Math.min(1, f.t / 0.25);
    c.save();
    c.textAlign = 'center';
    c.font = '900 40px Impact, "Arial Black", sans-serif';
    c.lineWidth = 8; c.strokeStyle = '#000'; c.fillStyle = '#fff';
    c.globalAlpha = k;
    const top = f.pen <= 1 ? '📸 CLICK!' : 'AUR PHIR...';
    c.strokeText(top, W / 2, 140); c.fillText(top, W / 2, 140);
    const sc = 0.7 + 0.3 * k;
    c.translate(W / 2, H - 200); c.scale(sc, sc);
    c.font = '900 50px Impact, "Arial Black", sans-serif';
    c.lineWidth = 9;
    const lines = R.wrap(c, f.caption.toUpperCase(), 1100);
    lines.forEach((l, i) => { const yy = (i - (lines.length - 1)) * 54; c.strokeText(l, 0, yy); c.fillText(l, 0, yy); });
    c.restore();
    c.font = '700 16px ' + R.FONT; c.textAlign = 'right'; c.fillStyle = 'rgba(255,214,102,0.85)';
    c.fillText('Baraat Aa Gayi! 🐴', W - 16, H - 14);
  }

  G.firework = () => w && firework();
})();
