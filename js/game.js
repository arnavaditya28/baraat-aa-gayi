// Core game: world, players, relatives, crises, phases, freeze-frame memes.
window.BAG = window.BAG || {};

(function () {
  const W = 1280, H = 720, TOP = 74, BOTTOM = 708;
  const R = BAG.R, AU = BAG.Audio, CAST = BAG.CAST, CR = BAG.CRISES, PHASES = BAG.PHASES;
  const G = BAG.Game = {};

  let cv, c, bg;
  let state = 'title';
  let time = 0, lastTs = 0, hudT = 0, babbleCool = 0, uid = 0;
  let w = null;
  const keys = {}, pressed = {};

  // ---------- Venue layout ----------
  const STATIONS = {
    stage: { rect: [440, 84, 400, 120], point: [640, 226] },
    kitchen: { rect: [1070, 92, 190, 118], point: [1150, 234] },
    buffet: { rect: [880, 330, 230, 60], point: [995, 414] },
    dessert: { rect: [900, 540, 150, 52], point: [975, 616] },
    dj: { rect: [170, 92, 170, 88], point: [255, 204] },
    generator: { rect: [36, 560, 100, 80], point: [164, 600] },
    stable: { rect: [214, 618, 150, 70], point: [290, 600] },
    mandap: { rect: [560, 450, 160, 120], point: [640, 600] }
  };
  const SOLIDS = Object.values(STATIONS).map(s => ({ x: s.rect[0], y: s.rect[1], w: s.rect[2], h: s.rect[3] }));
  const WAYPOINTS = [[640, 300], [500, 390], [780, 400], [300, 300], [960, 480], [400, 500], [800, 650], [500, 670], [1180, 520], [200, 430], [1000, 270], [640, 400], [1180, 660], [120, 330], [860, 260], [300, 520]];
  const LIGHTS = [
    { x1: 0, y1: 74, x2: 430, y2: 88, sag: 26, n: 18, off: 0 },
    { x1: 850, y1: 88, x2: 1280, y2: 74, sag: 26, n: 18, off: 3 },
    { x1: 30, y1: 300, x2: 555, y2: 452, sag: 42, n: 22, off: 1 },
    { x1: 725, y1: 452, x2: 1270, y2: 300, sag: 42, n: 22, off: 4 },
    { x1: 0, y1: 700, x2: 1280, y2: 700, sag: 0, n: 40, off: 2 }
  ];
  const SHORT = {
    fufaji: 'Fufaji', pinky: 'Pinky Bua', bablu: 'Bablu Chacha', sharma: 'Sharma Aunty', mama: 'Mama Jugaadu', dadi: 'Dadi',
    selfie: 'Selfie Didi', chotu: 'Chotu', gupta: 'Gupta Ji', nani: 'Nani', dj: 'DJ Bunty', pandey: 'Pandey Ji', raju: 'Raju Band',
    lallan: 'Lallan', click: 'Click Bhaiya', tentwala: 'Tent Chacha', pandit: 'Pandit Ji', dulha: 'Dulha', dulhan: 'Dulhan'
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
    w = newWorld({ players: [] });
    w.demo = true;
    setupDemoParade();
    requestAnimationFrame(loop);
  };

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

  // ---------- World ----------
  function mkNPC(key, x, y, opts) {
    const L = CAST[key];
    return Object.assign({
      key, look: { skin: L.skin, outfit: L.outfit, hair: L.hair, hat: L.hat, acc: L.acc || [], dupatta: L.dupatta },
      x, y, hx: x, hy: y, tx: null, ty: null, speed: 80, r: 16, solid: false, mood: 'neutral', moving: false, walk: 0,
      seed: Math.random() * 10, label: SHORT[key], voice: L.voice || 180, bubble: null, visible: true, pauseT: 0, cool: 0
    }, opts || {});
  }

  function newWorld(cfg) {
    const nw = {
      cfg, solo: cfg.players.length <= 1, players: [], npc: {}, kids: [], items: [], crises: [], particles: [], floats: [],
      izzat: 100, phase: 0, phaseT: 0, spawnT: 4, cooldown: {}, fails: {}, lastFreeze: -99, shake: 0, flash: 0,
      rain: false, dark: false, tentDown: 0, memeShot: null, chatterT: 2.5, clickT: 18, elapsed: 0, blessCool: 0,
      mamaWin: 0, freeze: null, ending: null, drops: []
    };
    cfg.players.forEach((pc, i) => {
      const look = LOOKS[pc.look] || LOOKS.kurta;
      nw.players.push({
        idx: i, name: pc.name, x: 600 + i * 80, y: 320, r: 13, look: JSON.parse(JSON.stringify(look)), color: PCOLORS[i],
        label: pc.name, labelColor: PCOLORS[i], moving: false, walk: 0, seed: i * 3, frozen: 0, frozenBy: null, carry: null,
        score: 0, hint: null, holdShow: 0, danceCool: 0, bubble: null, voice: 180 + i * 60,
        stats: { fixes: 0, paneer: 0, power: 0, tent: 0, dj: 0, sharma: 0, chashma: 0, fufaji: 0, ghodi: 0, kids: 0, pinky: 0, dances: 0, photos: 0 }
      });
    });
    const n = nw.npc;
    n.fufaji = mkNPC('fufaji', 400, 430, { solid: true, r: 18, seat: true });
    n.dadi = mkNPC('dadi', 800, 560, { solid: true, r: 18, seat: true });
    n.nani = mkNPC('nani', 470, 560, { solid: true, r: 18, seat: true });
    n.sharma = mkNPC('sharma', 1170, 420, { solid: true, r: 18 });
    n.gupta = mkNPC('gupta', 390, 150, { solid: true, r: 16 });
    n.pandit = mkNPC('pandit', 640, 528, { scale: 0.9 });
    n.tentwala = mkNPC('tentwala', 880, 236, { solid: true, r: 16 });
    n.pandey = mkNPC('pandey', 1232, 250, { solid: true, r: 16 });
    n.lallan = mkNPC('lallan', 400, 640, { solid: true, r: 16 });
    n.dj = mkNPC('dj', 255, 122, {});
    n.mama = mkNPC('mama', 96, 470, { speed: 95, solid: true, r: 16 });
    n.selfie = mkNPC('selfie', 960, 480, { wander: true, speed: 70, solid: true, r: 16 });
    n.click = mkNPC('click', 300, 300, { wander: true, speed: 75 });
    n.pinky = mkNPC('pinky', 1180, 660, { wander: true, speed: 72, visible: false });
    n.bablu = mkNPC('bablu', 640, 310, { speed: 45, visible: false, dancing: true });
    n.raju = mkNPC('raju', 90, 250, { visible: false, speed: 70 });
    n.band1 = mkNPC('raju', 120, 230, { visible: false, speed: 70, label: 'Band Party', look: Object.assign({}, CAST.raju, { acc: [], skin: '#c48a5a', hair: 'bandcap' }) });
    n.band2 = mkNPC('raju', 60, 232, { visible: false, speed: 70, label: 'Band Party', look: Object.assign({}, CAST.raju, { acc: ['mustache'], skin: '#a8703f', hair: 'bandcap' }) });
    n.dulha = mkNPC('dulha', 600, 628, { visible: false, speed: 70 });
    n.dulhan = mkNPC('dulhan', 680, 628, { visible: false });
    nw.ghodi = { x: 300, y: 592, hx: 300, hy: 592, tx: null, ty: null, state: 'idle', facing: 1, moving: false, running: false, r: 24, speed: 80, retarget: 0, rider: false };
    for (let i = 0; i < 160; i++) nw.drops.push({ x: Math.random() * W, y: Math.random() * H, s: 500 + Math.random() * 300 });
    return nw;
  }

  function setupDemoParade() {
    const n = w.npc;
    w.ghodi.x = -80; w.ghodi.y = 300; w.ghodi.rider = true; w.ghodi.state = 'demo';
    n.raju.visible = n.band1.visible = n.band2.visible = n.bablu.visible = true;
    n.selfie.wander = false; n.click.wander = false;
  }

  // ---------- Game start / phases ----------
  G.start = function (cfg) {
    w = newWorld(cfg);
    state = 'play';
    w.phase = 0;
    startPhase();
  };

  function startPhase() {
    const ph = PHASES[w.phase];
    w.phaseT = 0; w.spawnT = 4;
    BAG.UI.banner('Phase ' + ph.id + ': ' + ph.name, ph.sub);
    AU.playTrack(ph.track);
    const n = w.npc;
    if (ph.id === 2) {
      // The baraat arrives along the red carpet.
      const g = w.ghodi;
      g.x = -90; g.y = 360; g.state = 'parade'; g.rider = true; g.tx = 330; g.ty = 360; g.speed = 75;
      n.raju.visible = n.band1.visible = n.band2.visible = true;
      n.raju.x = -160; n.raju.y = 350; n.raju.tx = 92; n.raju.ty = 262;
      n.band1.x = -200; n.band1.y = 372; n.band1.tx = 128; n.band1.ty = 240;
      n.band2.x = -230; n.band2.y = 340; n.band2.tx = 58; n.band2.ty = 236;
      n.bablu.visible = true; n.bablu.x = -40; n.bablu.y = 366; n.bablu.tx = 600; n.bablu.ty = 320;
      n.pinky.visible = true; n.pinky.x = 1240; n.pinky.y = 690;
      w.cooldown.ghodi = w.elapsed + 14;
      setTimeout(() => { if (w && n.pinky.visible) say(n.pinky, 'Main aa gayi! {name} beta, kahan ho?'); }, 2500);
      say(n.raju, 'Band baja denge, tension mat lo!');
      AU.sfx('click');
    }
    if (ph.id === 3) {
      n.dulhan.visible = true;
      if (!n.dulha.visible) { n.dulha.visible = true; n.dulha.x = 600; n.dulha.y = 628; }
      say(n.pandit, 'Muhurat 10:42 ka hai. 10:43 nahi chalega.');
    }
  }

  function endPhase() {
    for (const cr of w.crises.slice()) { cleanup(cr, 'cancel'); }
    w.crises = [];
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
    if (state === 'play') { state = 'paused'; BAG.UI.pause(true); }
    else if (state === 'paused') { state = 'play'; BAG.UI.pause(false); }
  };
  G.quitToTitle = function () {
    state = 'title';
    w = newWorld({ players: [] }); w.demo = true; setupDemoParade();
    AU.playTrack('title');
  };
  G.state = () => state;

  // ---------- Speech ----------
  function pickName() { return w.players.length ? rand(w.players).name : 'beta'; }
  function say(e, text, dur) {
    if (!text || !e) return;
    text = text.replace(/\{name\}/g, () => pickName());
    e.bubble = { text, age: 0, dur: dur || clamp(text.length * 0.075, 2.4, 4.5) };
    if (babbleCool <= 0 && !w.demo) { AU.babble(text, e.voice || 180); babbleCool = 0.35; }
  }
  G._say = say;

  // ---------- Crises ----------
  function trySpawn() {
    const ph = PHASES[w.phase];
    const max = ph.maxActive[w.solo ? 0 : 1];
    if (w.crises.length >= max) return;
    const opts = Object.keys(CR).filter(k => CR[k].phases.includes(ph.id) && !w.crises.some(x => x.type === k) && (w.cooldown[k] || 0) <= w.elapsed);
    if (!opts.length) return;
    let tot = opts.reduce((a, k) => a + CR[k].weight, 0), r = Math.random() * tot;
    for (const k of opts) { r -= CR[k].weight; if (r <= 0) { startCrisis(k); return; } }
    startCrisis(opts[opts.length - 1]);
  }

  function startCrisis(type) {
    const d = CR[type], n = w.npc;
    const cr = { type, d, t: d.time, max: d.time, progress: 0, id: ++uid, x: 0, y: 0, title: d.title };
    if (d.station) { cr.x = STATIONS[d.station].point[0]; cr.y = STATIONS[d.station].point[1]; }
    switch (type) {
      case 'paneer': say(n.pandey, rand(CAST.pandey.idle)); break;
      case 'power':
        w.dark = true; AU.sfx('whoomp'); cr.mamaT = 2.5;
        say(n.gupta, 'Generator chalu karo!! Meri call kat gayi!');
        break;
      case 'tent':
        if (PHASES[w.phase].id >= 2) { w.rain = true; cr.title = d.titleRain; }
        say(n.tentwala, rand(CAST.tentwala.idle));
        break;
      case 'dj': say(n.dj, rand(CAST.dj.bad)); break;
      case 'sharma': n.sharma.mood = 'angry'; say(n.sharma, rand(CAST.sharma.idle)); break;
      case 'chashma': {
        const far = WAYPOINTS.filter(p => Math.hypot(p[0] - n.dadi.x, p[1] - n.dadi.y) > 300);
        const p = rand(far);
        w.items.push({ kind: 'chashma', x: p[0] + (Math.random() - 0.5) * 40, y: p[1] + (Math.random() - 0.5) * 30, crid: cr.id });
        say(n.dadi, rand(CAST.dadi.lost)); AU.sfx('aye');
        break;
      }
      case 'fufaji': n.fufaji.mood = 'angry'; say(n.fufaji, rand(CAST.fufaji.angry)); break;
      case 'ghodi': {
        const g = w.ghodi; g.state = 'run'; g.rider = false; g.retarget = 0;
        if (n.dulha.visible === false) { n.dulha.visible = true; n.dulha.x = g.x; n.dulha.y = g.y + 10; n.dulha.tx = 600; n.dulha.ty = 628; }
        AU.sfx('neigh'); say(n.lallan, 'Rani ruk ja!! Arre koi pakdo!');
        break;
      }
      case 'kids': {
        const starts = [[1290, 700], [1290, 480], [860, 730], [1290, 600]];
        const spots = [[935, 612], [975, 618], [1015, 612]];
        const outfits = ['#fdcb6e', '#55efc4', '#ff7675'];
        for (let i = 0; i < 3; i++) {
          const s = rand(starts);
          w.kids.push({
            x: s[0] + i * 25, y: s[1] - i * 10, tx: spots[i][0], ty: spots[i][1], state: 'run', speed: 70 + Math.random() * 25,
            crid: cr.id, look: { skin: CAST.chotu.skin, outfit: outfits[i], hair: 'kid', acc: [] }, kid: true, scale: 0.85,
            seed: Math.random() * 9, walk: 0, moving: true, mood: 'happy', voice: 380, label: i === 0 ? 'Chotu Gang' : null
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
    if (cr.type === 'kids') return { x: 975, y: 560 };
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
      case 'ghodi': w.ghodi.state = 'return'; w.ghodi.tx = w.ghodi.hx; w.ghodi.ty = w.ghodi.hy; w.ghodi.speed = 90; break;
      case 'chashma': w.items = w.items.filter(i => i.crid !== cr.id); w.players.forEach(p => { if (p.carry === 'chashma') p.carry = null; }); break;
      case 'kids':
        w.kids.forEach(k => { if (k.crid === cr.id && k.state !== 'flee') { k.state = 'flee'; k.tx = 1340; k.ty = k.y; k.speed = 220; } });
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
    if (cr.type === 'ghodi') { pts = 150; say(n.lallan, rand(CAST.lallan.caught)); }
    if (cr.type === 'fufaji') { pts = 120; say(n.fufaji, rand(CAST.fufaji.calmed)); bumpTotal('fufaji', 1); }
    if (cr.type === 'chashma') { pts = 100 + cr.d.bonus; say(n.dadi, rand(CAST.dadi.thanks)); }
    if (cr.type === 'paneer') { say(n.pandey, rand(CAST.pandey.fixed)); AU.sfx('cooker'); }
    if (cr.type === 'dj') say(n.dj, rand(CAST.dj.fixed));
    if (cr.type === 'sharma') say(n.sharma, rand(CAST.sharma.calmed));
    if (cr.type === 'power') AU.sfx('powerup');
    if (cr.type === 'tent') say(n.tentwala, 'Dekha? Majboot hai!');
    if (p) {
      p.score += pts; p.stats.fixes++;
      const key = cr.type === 'kids' ? null : cr.type;
      if (key && p.stats[key] !== undefined) p.stats[key]++;
      floatText(pt.x, pt.y - 30, '+' + pts, p.color);
    } else {
      floatText(pt.x, pt.y - 30, 'Jugaad!', '#55efc4');
    }
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
    if (cr.type === 'tent') { w.tentDown = 4; say(n.tentwala, rand(CAST.tentwala.fail)); }
    if (cr.type === 'ghodi') bumpTotal('ghodiFails', 1);
    if (cr.type === 'fufaji') say(n.fufaji, 'Theek hai, hum chale jaate hain. Hum kaun hote hain.');
    if (cr.type === 'kids') { const k = w.kids.find(k => k.crid === cr.id); if (k) say(k, 'Hehehe! Gulab jamun hamare!'); }
    if (w.fails.paneer >= 3) BAG.UI.achieve('paneer_gone');
    AU.sfx('trombone'); AU.sfx('ohh');
    w.shake = 12;
    floatText(pt.x, pt.y - 30, '-' + cr.d.penalty + ' Izzat', '#ff7675');
    if (w.izzat <= 0) { lose(pt); return; }
    if (w.elapsed - w.lastFreeze > 14 || cr.d.penalty > (w.memeShot ? w.memeShot.pen : 0)) {
      triggerFreeze(pt.x, pt.y, rand(cr.d.fail), cr.d.penalty);
    }
  }

  // ---------- Freeze-frame meme ----------
  function triggerFreeze(x, y, caption, pen, after) {
    w.lastFreeze = w.elapsed;
    w.freeze = { x: clamp(x, 200, W - 200), y: clamp(y, 180, H - 160), caption, pen, t: 0, dur: after ? 2.6 : 1.9, shot: false, after };
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
    n.dulha.x = 610; n.dulha.y = 628; n.dulhan.x = 672; n.dulhan.y = 628;
    say(n.fufaji, 'Achha... theek hai. Shaadi achhi thi.', 5);
    setTimeout(() => { if (w.ending) say(n.nani, 'Jeete raho bachchon! Sab ro rahe hain!', 4); }, 1300);
    setTimeout(() => { if (w.ending) say(n.sharma, 'Hmm... hamare Bunty ki shaadi se thodi achhi thi.', 4); }, 2600);
    setTimeout(() => { if (w.ending) say(n.pandit, 'Muhurat pe ho gaya! Shubh ho!', 3.5); }, 3700);
  }

  function lose(pt) {
    w.memeShot = null;
    AU.playTrack('lose');
    triggerFreeze(pt.x, pt.y, BAG.ENDINGS.lose.head + ' ' + BAG.ENDINGS.lose.sub, 999, () => finish(false));
  }

  function finish(won) {
    state = 'result';
    const reached = PHASES[w.phase].id;
    const top = Math.max(0, ...w.players.map(p => p.score));
    const used = new Set();
    const players = w.players.map(p => {
      const s = Object.assign({}, p.stats, { isTop: p.score === top && p.score > 0 });
      const ctxInfo = { won, reachedPhase: reached };
      const ranked = BAG.TITLES.map(T => ({ t: T.t, v: T.f(s, ctxInfo) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
      let pick = ranked.find(x => !used.has(x.t)) || ranked[0] || { t: 'Sab Kaam Ka Aadmi' };
      used.add(pick.t);
      return { name: p.name, color: p.color, score: p.score, stats: p.stats, title: pick.t, look: p.look };
    });
    if (won) {
      BAG.UI.achieve('vidaai');
      if (w.izzat >= 80) BAG.UI.achieve('sharma_beta');
      if (w.players.every(p => p.stats.pinky === 0)) BAG.UI.achieve('pinky_escape');
    }
    if (w.players.some(p => p.stats.dances >= 5)) BAG.UI.achieve('naachunga');
    BAG.UI.result({
      won, players, izzat: Math.round(w.izzat), reachedPhase: reached,
      teamScore: players.reduce((a, p) => a + p.score, 0),
      memeShot: w.memeShot, endShot: w.endShot
    });
  }

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
    for (const k in w.npc) {
      const n = w.npc[k];
      if (n === e || !n.solid || !n.visible) continue;
      const dx = e.x - n.x, dy = e.y - n.y, d = Math.hypot(dx, dy), m = r + n.r;
      if (d < m && d > 0.01) { e.x = n.x + dx / d * m; e.y = n.y + dy / d * m; }
    }
    e.x = clamp(e.x, 16, W - 16); e.y = clamp(e.y, TOP + 30, BOTTOM);
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

  // ---------- Update ----------
  function update(dt) {
    w.elapsed += dt;
    const ph = PHASES[w.phase];
    w.phaseT += dt;
    w.spawnT -= dt;
    if (w.spawnT <= 0) {
      trySpawn();
      const base = ph.spawnEvery[w.solo ? 0 : 1];
      w.spawnT = base * (0.75 + Math.random() * 0.5);
    }
    updatePlayers(dt);
    updateNPCs(dt);
    updateCrises(dt);
    updateFx(dt);
    chatter(dt);
    pickMusic();
    if (state === 'play' && w.phaseT >= ph.dur) endPhase();
  }

  function nearPoint(p, x, y, r) { return Math.hypot(p.x - x, p.y - y) <= r; }

  function updatePlayers(dt) {
    const n = w.npc;
    for (const p of w.players) {
      const k = ctrl(p);
      p.hint = null; p.holdShow = 0; p.danceCool = Math.max(0, p.danceCool - dt);
      if (p.frozen > 0) {
        p.frozen -= dt; p.moving = false;
        if (p.frozenBy === 'pinky' && k.actP) { p.frozen -= 0.4; p.shakeT = 0.15; }
        p.dancing = p.frozenBy === 'dance';
        if (p.frozenBy === 'pinky') p.hint = 'Bhaago! ' + (p.idx === 0 ? 'E' : 'Enter') + ' dabao';
        if (p.frozen <= 0) { p.frozen = 0; p.frozenBy = null; p.dancing = false; if (n.pinky.caught === p) n.pinky.caught = null; }
        continue;
      }
      let dx = k.x, dy = k.y;
      if (dx || dy) {
        const l = Math.hypot(dx, dy); dx /= l; dy /= l;
        const sp = 215;
        p.x += dx * sp * dt; p.y += dy * sp * dt;
        collide(p, p.r);
        p.moving = true; p.walk += dt * 1.8; p.facing = dx >= 0 ? 1 : -1;
      } else p.moving = false;
      p.holding = k.act;
      p.pressedAct = k.actP;
      const keyName = p.idx === 0 ? 'E' : 'Enter';

      // Hold-type crises
      for (const cr of w.crises) {
        if (cr.d.kind !== 'hold') continue;
        const pt = crisisPoint(cr);
        if (nearPoint(p, pt.x, pt.y, 62)) {
          p.hint = 'Hold ' + keyName;
          if (k.act) p.holdShow = cr.progress;
        }
      }
      // Plate pickup at buffet
      const fuf = w.crises.find(x => x.type === 'fufaji');
      if (fuf && !p.carry && nearPoint(p, STATIONS.buffet.point[0], STATIONS.buffet.point[1], 66)) {
        p.hint = keyName + ': Plate lo';
        if (k.actP) { p.carry = 'plate'; AU.sfx('pickup'); say(p, 'Fufaji ke liye special plate!'); }
      }
      if (fuf && p.carry === 'plate' && dist(p, n.fufaji) < 50) resolveCrisis(fuf, p), p.carry = null;
      // Chashma
      for (const it of w.items) {
        if (it.kind === 'chashma' && !p.carry && Math.hypot(p.x - it.x, p.y - it.y) < 28) {
          p.carry = 'chashma'; it.taken = true; AU.sfx('pickup'); say(p, 'Mil gaya Dadi ka chashma!');
        }
      }
      w.items = w.items.filter(i => !i.taken);
      const cha = w.crises.find(x => x.type === 'chashma');
      if (cha && p.carry === 'chashma' && dist(p, n.dadi) < 52) { p.carry = null; resolveCrisis(cha, p); }
      // Nani's blessing
      if (dist(p, n.nani) < 60 && !p.hint) {
        p.hint = keyName + ': Nani ka aashirwad';
        if (k.actP) {
          if (w.elapsed >= w.blessCool) {
            w.blessCool = w.elapsed + 25; w.izzat = Math.min(100, w.izzat + 12);
            say(n.nani, rand(CAST.nani.bless)); AU.sfx('bless'); burst(n.nani.x, n.nani.y - 40, 20, 'spark');
            floatText(n.nani.x, n.nani.y - 60, '+12 Izzat', '#55efc4');
          } else say(n.nani, 'Abhi toh diya tha beta! Thoda ruk.');
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
        const holders = w.players.filter(p => p.frozen <= 0 && p.holding && nearPoint(p, pt.x, pt.y, 62));
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
          if (cr.mamaT <= 0 && !cr.mamaGo) { cr.mamaGo = true; m.tx = 96; m.ty = 548; m.speed = 70; say(m, rand(CAST.mama.idle)); }
          if (cr.mamaGo && m.tx == null && !cr.mamaWork) { cr.mamaWork = 6.5; }
          if (cr.mamaWork != null) {
            cr.mamaWork -= dt;
            if (cr.mamaWork <= 0) {
              cr.mamaT = null;
              if (Math.random() < 0.45) {
                say(m, rand(CAST.mama.success)); BAG.UI.achieve('jugaad'); w.mamaWin++;
                m.tx = m.hx; m.ty = m.hy;
                resolveCrisis(cr, null); continue;
              } else { say(m, rand(CAST.mama.fail)); m.tx = m.hx; m.ty = m.hy; }
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
      if (e.moodT != null) { e.moodT -= dt; if (e.moodT <= 0) { e.moodT = null; e.mood = 'neutral'; } }
      if (e.bubble) { e.bubble.age += dt; if (e.bubble.age > e.bubble.dur) e.bubble = null; }
    }
    // Fufaji stays angry while his crisis is active
    if (w.crises.some(x => x.type === 'fufaji')) { n.fufaji.mood = 'angry'; if (!n.fufaji.bubble && Math.random() < dt * 0.25) say(n.fufaji, rand(CAST.fufaji.angry)); }
    if (w.crises.some(x => x.type === 'sharma') && !n.sharma.bubble && Math.random() < dt * 0.3) say(n.sharma, rand(CAST.sharma.idle));
    if (w.crises.some(x => x.type === 'chashma')) n.dadi.noGlasses = true; else n.dadi.noGlasses = false;

    // Mama walks
    moveTo(n.mama, dt);
    // Band and parade
    ['raju', 'band1', 'band2', 'dulha'].forEach(key => { const e = n[key]; if (e.visible && e.tx != null) moveTo(e, dt, true); });

    // Wanderers: Selfie Didi, Click Bhaiya, Pinky Bua
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

    // Click Bhaiya family photo (phase 2+)
    if (PHASES[w.phase].id >= 2) {
      w.clickT -= dt;
      const cb = n.click;
      if (w.clickT <= 1.4 && !cb.photoCalled) { cb.photoCalled = true; say(cb, rand(CAST.click.idle)); cb.tx = null; cb.pauseT = 2.5; }
      if (w.clickT <= 0) {
        cb.photoCalled = false; w.clickT = 18 + Math.random() * 10;
        w.flash = 1; AU.sfx('flash');
        for (const p of w.players) {
          if (dist(p, cb) < 190 && p.frozen <= 0) {
            p.frozen = 1.4; p.frozenBy = 'photo'; p.stats.photos++; bumpTotal('photos', 1);
            say(p, rand(['Bhaiya jaldi! Kaam hai!', 'Cheese... ab jaane do?', 'Ek aur? Nahi!']));
          }
        }
      }
    }

    // Bablu Chacha dances around the centre (phase 2+)
    const b = n.bablu;
    if (b.visible) {
      b.dancing = true;
      if (b.tx == null) { const spots = [[560, 318], [720, 318], [640, 290], [640, 400], [520, 400], [760, 400]]; const s = rand(spots); b.tx = s[0]; b.ty = s[1]; b.speed = 45; }
      moveTo(b, dt, true);
      for (const p of w.players) {
        if (p.frozen <= 0 && p.danceCool <= 0 && dist(p, b) < 30) {
          p.frozen = 1.3; p.frozenBy = 'dance'; p.danceCool = 3; p.stats.dances++;
          say(p, 'Main bhi naachunga!'); say(b, rand(CAST.bablu.idle));
        }
      }
    }

    // Ghodi
    const g = w.ghodi;
    if (g.state === 'parade') {
      moveTo(g, dt, true);
      g.running = false;
      if (g.tx == null) {
        g.state = 'return'; g.rider = false; g.tx = g.hx; g.ty = g.hy; g.speed = 70;
        n.dulha.visible = true; n.dulha.x = g.x + 10; n.dulha.y = g.y + 12; n.dulha.tx = 600; n.dulha.ty = 628;
        say(n.dulha, rand(CAST.dulha.idle));
      }
    } else if (g.state === 'return') {
      g.running = false;
      if (moveTo(g, dt, false) || g.tx == null) { g.state = 'idle'; g.x = g.hx; g.y = g.hy; }
    } else if (g.state === 'run') {
      g.running = true;
      g.speed = w.solo ? 168 : 190;
      g.retarget -= dt;
      if (g.tx == null || g.retarget <= 0) {
        const near = w.players.length ? w.players.reduce((a, p) => dist(p, g) < dist(a, g) ? p : a) : g;
        let best = null, bd = -1;
        for (let i = 0; i < 4; i++) { const p = rand(WAYPOINTS); const d = Math.hypot(p[0] - near.x, p[1] - near.y); if (d > bd) { bd = d; best = p; } }
        g.tx = best[0]; g.ty = best[1]; g.retarget = 1.3 + Math.random();
      }
      moveTo(g, dt, false);
      const cr = w.crises.find(x => x.type === 'ghodi');
      for (const p of w.players) if (cr && p.frozen <= 0 && dist(p, g) < 38) { resolveCrisis(cr, p); break; }
    } else if (g.state === 'demo') {
      g.moving = true; g.x += 55 * (1 / 60); g.facing = 1;
    }

    // Kids
    for (const kd of w.kids) {
      if (kd.bubble) { kd.bubble.age += dt; if (kd.bubble.age > kd.bubble.dur) kd.bubble = null; }
      if (kd.state === 'run') { kd.speed = kd.speed || 80; if (moveTo(kd, dt, true)) { kd.state = 'eat'; } }
      else if (kd.state === 'eat') { kd.moving = false; kd.eatBob = (kd.eatBob || 0) + dt; }
      else if (kd.state === 'flee') { kd.tx = 1360; kd.ty = kd.y; moveTo(kd, dt, true); if (kd.x > 1320) kd.gone = true; }
      if (kd.state !== 'flee') {
        for (const p of w.players) {
          if (p.frozen <= 0 && dist(p, kd) < 30) {
            kd.state = 'flee'; kd.speed = 230; p.stats.kids++; p.score += 30; AU.sfx('pop');
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
    if (e.cool > 0 || !targets.length) {
      e.armsUp = false;
      if (e.tx == null) { const p = rand(WAYPOINTS); e.tx = p[0]; e.ty = p[1]; }
      e.speed = 60; moveTo(e, dt); return;
    }
    const t = targets.reduce((a, p) => dist(p, e) < dist(a, e) ? p : a);
    e.tx = t.x; e.ty = t.y; e.speed = 72;
    moveTo(e, dt);
    e.chasing = dist(t, e) < 170;
    if (dist(t, e) < 26) {
      t.frozen = 2.6; t.frozenBy = 'pinky'; t.stats.pinky++;
      say(e, rand(CAST.pinky.idle).replace(/\{name\}/g, t.name), 3);
      e.cool = 7; e.tx = null; e.caught = t; e.chasing = false;
    }
  }

  function chatter(dt) {
    w.chatterT -= dt;
    if (w.chatterT > 0) return;
    w.chatterT = 3 + Math.random() * 3;
    const n = w.npc;
    const pool = ['fufaji', 'sharma', 'dadi', 'gupta', 'nani', 'selfie', 'bablu', 'dj', 'pandey', 'lallan', 'tentwala', 'mama', 'raju', 'click'];
    if (PHASES[w.phase].id === 3) pool.push('pandit', 'pandit', 'dadi');
    const busy = Object.values(n).filter(e => e.bubble).length;
    if (busy >= 2) return;
    const cands = pool.filter(k => n[k] && n[k].visible && !n[k].bubble && CAST[k].idle && !(k === 'fufaji' && n.fufaji.mood === 'angry'));
    if (!cands.length) return;
    const k = rand(cands);
    say(n[k], rand(CAST[k].idle));
  }

  function pickMusic() {
    if (state !== 'play') return;
    const has = t => w.crises.some(x => x.type === t);
    let tr = PHASES[w.phase].track, tempo = 1;
    if (has('power')) tr = 'powercut';
    else if (has('dj')) tr = 'djsad';
    else if (has('ghodi')) tr = 'chase';
    else if (has('fufaji')) tr = 'fufaji';
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
  function firework() {
    const x = 150 + Math.random() * 980, y = 110 + Math.random() * 200;
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
      if (p.type === 'fw') { p.vx *= 0.97; p.vy = p.vy * 0.97 + 40 * dt; } else { p.vy += 260 * dt; p.vx *= 0.98; }
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
    // ambient steam from the kitchen when paneer is fine
    if (!w.crises.some(x => x.type === 'paneer') && Math.random() < dt * 4) w.particles.push({ x: 1112 + Math.random() * 20, y: 130, vx: (Math.random() - 0.5) * 10, vy: -30, life: 0, max: 1.6, col: 'rgba(255,255,255,0.35)', size: 6, type: 'smoke', rot: 0, vr: 0 });
    if (w.crises.some(x => x.type === 'power') && Math.random() < dt * 6) w.particles.push({ x: 80 + Math.random() * 20, y: 560, vx: (Math.random() - 0.5) * 20, vy: -40, life: 0, max: 1.8, col: 'rgba(90,90,90,0.6)', size: 10, type: 'smoke', rot: 0, vr: 0 });
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

  function frame(dt) {
    time += dt;
    if (state === 'title') updateDemo(dt);
    else if (state === 'play') update(dt);
    else if (state === 'freeze') {
      const f = w.freeze; f.t += dt;
      if (f.t >= f.dur) { w.freeze = null; if (f.after) f.after(); else state = 'play'; }
    } else if (state === 'ending') {
      const e = w.ending; e.t += dt; e.fw -= dt;
      if (e.fw <= 0) { firework(); e.fw = 0.45 + Math.random() * 0.5; }
      if (Math.random() < dt * 8) burst(Math.random() * W, TOP + 10, 2, 'confetti');
      updateFx(dt);
      for (const k in w.npc) { const n = w.npc[k]; if (n.bubble) { n.bubble.age += dt; if (n.bubble.age > n.bubble.dur) n.bubble = null; } }
      if (e.t > 3.2 && !w.endShot) { render(); try { w.endShot = cv.toDataURL('image/jpeg', 0.85); } catch (er) { /* ignore */ } }
      if (e.t >= e.dur) { w.ending = null; finish(true); }
    } else if (state === 'news' || state === 'paused' || state === 'result') {
      // world is frozen; keep particles alive a bit on the result screen
      if (state === 'result') updateFx(dt);
    }
    render();
    if (state === 'freeze' && w.freeze && !w.freeze.shot && w.freeze.t > 0.4) {
      w.freeze.shot = true;
      try {
        const img = cv.toDataURL('image/jpeg', 0.85);
        if (!w.memeShot || w.freeze.pen >= w.memeShot.pen) w.memeShot = { img, caption: w.freeze.caption, pen: w.freeze.pen };
      } catch (er) { /* canvas export blocked */ }
    }
    hudT -= dt;
    if (hudT <= 0 && w && !w.demo && state !== 'result' && state !== 'title') { hudT = 0.1; pushHud(); }
    for (const k in pressed) pressed[k] = false;
  }

  function updateDemo(dt) {
    const n = w.npc, g = w.ghodi;
    g.x += 55 * dt; g.moving = true; g.facing = 1;
    if (g.x > 1450) g.x = -80;
    const place = (e, dx, dy) => { e.x = g.x + dx; e.y = 300 + dy; e.moving = true; e.walk += dt; };
    place(n.raju, -70, -6); place(n.band1, -105, 10); place(n.band2, -140, -8);
    n.bablu.x = g.x + 90; n.bablu.y = 306; n.bablu.dancing = true;
    for (const k in n) { const e = n[k]; if (e.bubble) { e.bubble.age += dt; if (e.bubble.age > e.bubble.dur) e.bubble = null; } }
    w.chatterT -= dt;
    if (w.chatterT <= 0) {
      w.chatterT = 2.8 + Math.random() * 2;
      const k = rand(['fufaji', 'sharma', 'dadi', 'gupta', 'nani', 'bablu', 'dj', 'pandey', 'raju', 'selfie', 'tentwala']);
      say(n[k], rand(CAST[k].idle));
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

  // ---------- Rendering ----------
  function buildBackground() {
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const g = b.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#1d4a2c'); grd.addColorStop(1, '#14361f');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // mowed stripes
    for (let x = 0; x < W; x += 64) { g.fillStyle = (x / 64) % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'; g.fillRect(x, 0, 32, H); }
    // grass specks
    for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(120,200,120,0.12)' : 'rgba(10,40,20,0.25)'; g.fillRect(Math.random() * W, Math.random() * H, 2, 3); }
    // tiny flowers
    for (let i = 0; i < 70; i++) { g.fillStyle = rand(['#ffb3c7', '#fff3b0', '#ffd6a5']); g.beginPath(); g.arc(Math.random() * W, TOP + Math.random() * (H - TOP), 1.8, 0, 7); g.fill(); }
    // red carpet: gate -> centre -> mandap
    g.fillStyle = '#8e1b2b'; g.fillRect(0, 342, 660, 36); g.fillRect(622, 342, 36, 110);
    g.strokeStyle = '#f7c948'; g.lineWidth = 2;
    g.strokeRect(0, 344, 660, 32);
    g.fillStyle = 'rgba(247,201,72,0.5)';
    for (let x = 12; x < 650; x += 26) { g.beginPath(); g.arc(x, 360, 3, 0, 7); g.fill(); }
    // rangoli in front of the mandap
    const rx = 640, ry = 660;
    ['#e84393', '#fdcb6e', '#00cec9', '#e17055'].forEach((col, i) => {
      g.fillStyle = col;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + i * 0.2; g.beginPath(); g.ellipse(rx + Math.cos(a) * (34 - i * 8), ry + Math.sin(a) * (16 - i * 4), 10 - i * 2, 5 - i, a, 0, 7); g.fill(); }
    });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(rx, ry, 5, 0, 7); g.fill();
    // banquet chairs
    const chair = (x, y) => { g.fillStyle = '#b33939'; R.rr(g, x - 8, y - 18, 16, 14, 3); g.fill(); g.fillStyle = '#f5f0e6'; R.rr(g, x - 9, y - 6, 18, 8, 3); g.fill(); };
    for (let i = 0; i < 5; i++) { chair(720 + i * 30, 290); chair(470 + i * 26, 292); }
    for (let i = 0; i < 4; i++) { chair(1150 + (i % 2) * 34, 560 + Math.floor(i / 2) * 40); }
    chair(400, 432); chair(470, 562); chair(800, 562);
    // hedges along the bottom and sides
    g.fillStyle = '#0f2a17';
    for (let x = 0; x < W; x += 22) { g.beginPath(); g.arc(x, H + 4, 16, 0, 7); g.fill(); }
    // flower pots
    [[30, 120], [1250, 300], [30, 470], [1250, 690], [520, 700], [860, 700]].forEach(([x, y]) => {
      g.fillStyle = '#a0522d'; R.rr(g, x - 10, y - 10, 20, 16, 4); g.fill();
      g.fillStyle = '#2ecc71'; g.beginPath(); g.arc(x, y - 16, 10, 0, 7); g.fill();
      g.fillStyle = '#ff7f11'; g.beginPath(); g.arc(x - 4, y - 20, 3.5, 0, 7); g.arc(x + 5, y - 15, 3.5, 0, 7); g.fill();
    });
    // vignette
    const v = g.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 820);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,0,20,0.55)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return b;
  }

  function has(type) { return w.crises.some(x => x.type === type); }

  function drawGate() {
    c.fillStyle = '#7b2d26';
    R.rr(c, 4, 300, 16, 40, 4); c.fill(); R.rr(c, 4, 380, 16, 40, 4); c.fill();
    R.garland(c, 12, 300, 12, 420, 0);
    c.save(); c.translate(30, 360); c.rotate(-Math.PI / 2);
    c.font = '800 14px ' + R.FONT; c.textAlign = 'center'; c.fillStyle = '#ffd166'; c.fillText('SWAGAT HAI', 0, 0);
    c.restore();
  }

  function drawStage() {
    const [x, y, ww, hh] = STATIONS.stage.rect;
    const cr = has('tent');
    c.save();
    if (cr || w.tentDown > 0) {
      const a = w.tentDown > 0 ? 0.12 : 0.05 + Math.sin(time * 6) * 0.025;
      c.translate(x, y + hh); c.rotate(a); c.translate(-x, -(y + hh));
    }
    // back drape stripes
    for (let i = 0; i < ww / 20; i++) { c.fillStyle = i % 2 ? '#c0392b' : '#f6b93b'; c.fillRect(x + i * 20, y, 20, hh - 30); }
    // scallops
    c.fillStyle = '#8e1b2b';
    for (let i = 0; i < ww / 25; i++) { c.beginPath(); c.arc(x + 12.5 + i * 25, y, 12.5, 0, Math.PI); c.fill(); }
    // platform + sofa
    c.fillStyle = '#5b1a24'; c.fillRect(x, y + hh - 30, ww, 30);
    c.fillStyle = '#f7c948'; c.fillRect(x, y + hh - 30, ww, 3);
    c.fillStyle = '#b71540'; R.rr(c, x + ww / 2 - 60, y + hh - 70, 120, 44, 14); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 3; R.rr(c, x + ww / 2 - 60, y + hh - 70, 120, 44, 14); c.stroke();
    // banner
    c.fillStyle = '#4a0e1a'; R.rr(c, x + ww / 2 - 90, y + 14, 180, 30, 8); c.fill();
    c.font = '800 20px ' + R.FONT; c.textAlign = 'center'; c.fillStyle = '#ffd166';
    c.fillText('✿ Shubh Vivah ✿', x + ww / 2, y + 36);
    R.garland(c, x, y + hh - 30, x + ww, y + hh - 30, 18);
    c.restore();
    if (w.tentDown > 0) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x, y, ww, hh); }
  }

  function drawKitchen() {
    const [x, y, ww, hh] = STATIONS.kitchen.rect;
    c.fillStyle = '#6d4c41'; R.rr(c, x, y, ww, hh, 8); c.fill();
    c.fillStyle = '#8d6e63'; R.rr(c, x + 6, y + 6, ww - 12, hh - 30, 6); c.fill();
    // tandoor
    c.fillStyle = '#bf6b3a'; c.beginPath(); c.arc(x + 40, y + 50, 24, 0, 7); c.fill();
    c.fillStyle = '#2d1b10'; c.beginPath(); c.arc(x + 40, y + 50, 13, 0, 7); c.fill();
    const glow = 0.5 + Math.sin(time * 5) * 0.2;
    c.fillStyle = 'rgba(255,120,30,' + glow + ')'; c.beginPath(); c.arc(x + 40, y + 50, 9, 0, 7); c.fill();
    // kadhai with paneer
    c.fillStyle = '#2d3436'; c.beginPath(); c.ellipse(x + 120, y + 48, 38, 24, 0, 0, 7); c.fill();
    c.fillStyle = '#636e72'; c.beginPath(); c.ellipse(x + 120, y + 46, 32, 19, 0, 0, 7); c.fill();
    if (!has('paneer')) {
      c.fillStyle = '#d35400'; c.beginPath(); c.ellipse(x + 120, y + 46, 28, 15, 0, 0, 7); c.fill();
      c.fillStyle = '#fff6dc';
      for (let i = 0; i < 9; i++) c.fillRect(x + 100 + (i % 3) * 13, y + 36 + Math.floor(i / 3) * 8, 8, 6);
    } else {
      c.font = '800 13px ' + R.FONT; c.fillStyle = '#ff7675'; c.textAlign = 'center'; c.fillText('KHATAM!', x + 120, y + 51);
    }
    c.font = '800 15px ' + R.FONT; c.fillStyle = '#ffd166'; c.textAlign = 'center';
    c.fillText('RASOI', x + ww / 2, y + hh - 9);
  }

  function drawBuffet() {
    const [x, y, ww, hh] = STATIONS.buffet.rect;
    c.fillStyle = '#f5f0e6'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#c0392b'; c.fillRect(x, y + hh - 12, ww, 12);
    c.fillStyle = '#f7c948'; c.fillRect(x, y + hh - 13, ww, 2);
    for (let i = 0; i < 4; i++) {
      const cx = x + 30 + i * 56;
      c.fillStyle = '#b2bec3'; c.beginPath(); c.ellipse(cx, y + 22, 22, 13, 0, 0, 7); c.fill();
      c.fillStyle = '#dfe6e9'; c.beginPath(); c.ellipse(cx, y + 19, 18, 9, 0, 0, 7); c.fill();
    }
    if (has('fufaji')) {
      const p = 0.5 + Math.sin(time * 8) * 0.5;
      c.fillStyle = 'rgba(255,214,102,' + (0.35 + p * 0.4) + ')'; c.beginPath(); c.ellipse(x + ww / 2, y + hh + 16, 40, 14, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + ww / 2, y + hh + 14 - i * 3, 14, 5, 0, 0, 7); c.fill(); }
    }
    c.font = '800 13px ' + R.FONT; c.fillStyle = '#4a0e1a'; c.textAlign = 'center'; c.fillText('BUFFET', x + ww / 2, y + hh - 1);
  }

  function drawDessert() {
    const [x, y, ww, hh] = STATIONS.dessert.rect;
    c.fillStyle = '#fd79a8'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#fab1a0'; R.rr(c, x + 4, y + 4, ww - 8, hh - 16, 5); c.fill();
    const eaten = w.kids.filter(k => k.state === 'eat').length;
    c.fillStyle = '#d4a017'; c.beginPath(); c.ellipse(x + 45, y + 20, 26, 13, 0, 0, 7); c.fill();
    c.fillStyle = '#5d2a0c';
    const left = Math.max(0, 7 - eaten * 2);
    for (let i = 0; i < left; i++) { c.beginPath(); c.arc(x + 30 + (i % 4) * 10, y + 16 + Math.floor(i / 4) * 8, 4.5, 0, 7); c.fill(); }
    c.strokeStyle = '#ff9f1a'; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + 100 + i * 14, y + 20, 5, 0, Math.PI * 1.7); c.stroke(); }
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#4a0e1a'; c.textAlign = 'center'; c.fillText('MITHAI', x + ww / 2, y + hh - 2);
  }

  function drawDJ() {
    const [x, y, ww, hh] = STATIONS.dj.rect;
    const sad = has('dj');
    R.person(c, Object.assign({}, w.npc.dj, { mood: sad ? 'happy' : w.npc.dj.mood, dancing: !sad, label: null }), time);
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
      c.globalAlpha = 0.12 + beat * 0.12;
      c.fillStyle = col1; c.beginPath(); c.moveTo(x + ww / 2, y + 30); c.lineTo(x + ww / 2 - 120, y + 260); c.lineTo(x + ww / 2 - 40, y + 260); c.fill();
      c.fillStyle = col2; c.beginPath(); c.moveTo(x + ww / 2, y + 30); c.lineTo(x + ww / 2 + 120, y + 260); c.lineTo(x + ww / 2 + 40, y + 260); c.fill();
      c.globalAlpha = 1;
    }
  }

  function drawGenerator() {
    const [x, y, ww, hh] = STATIONS.generator.rect;
    c.fillStyle = '#636e72'; R.rr(c, x, y, ww, hh, 6); c.fill();
    c.fillStyle = '#2d3436'; for (let i = 0; i < 5; i++) c.fillRect(x + 12, y + 14 + i * 9, ww - 40, 4);
    const on = !has('power');
    const blink = Math.sin(time * 10) > 0;
    c.fillStyle = on ? '#55efc4' : (blink ? '#ff4757' : '#5a1010'); c.beginPath(); c.arc(x + ww - 14, y + 16, 6, 0, 7); c.fill();
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
    c.font = '800 12px ' + R.FONT; c.fillStyle = '#ffeaa7'; c.textAlign = 'center'; c.fillText("RANI KA TABELA", x + ww / 2, y + hh - 4);
  }

  function drawMandap() {
    const [x, y, ww, hh] = STATIONS.mandap.rect;
    c.fillStyle = '#7b1e2b'; R.rr(c, x, y, ww, hh, 10); c.fill();
    c.strokeStyle = '#f7c948'; c.lineWidth = 3; R.rr(c, x + 6, y + 6, ww - 12, hh - 12, 8); c.stroke();
    // hawan kund + flame
    const fx = x + ww / 2, fy = y + hh / 2 - 6;
    c.fillStyle = '#a0522d'; c.fillRect(fx - 16, fy - 6, 32, 16);
    for (let i = 0; i < 3; i++) {
      const fl = Math.sin(time * 12 + i) * 3;
      c.fillStyle = ['#ff4500', '#ff9f1a', '#ffe066'][i];
      c.beginPath(); c.ellipse(fx, fy - 8 - i * 3 + fl * 0.3, 10 - i * 3, 14 - i * 3 + fl, 0, 0, 7); c.fill();
    }
    // pillars with marigold
    [[x + 8, y + 8], [x + ww - 8, y + 8], [x + 8, y + hh - 8], [x + ww - 8, y + hh - 8]].forEach(([px, py]) => {
      c.fillStyle = '#f7c948'; c.beginPath(); c.arc(px, py, 10, 0, 7); c.fill();
      c.fillStyle = '#ff7f11'; c.beginPath(); c.arc(px, py, 6, 0, 7); c.fill();
    });
    R.garland(c, x + 8, y + 8, x + ww - 8, y + 8, 14);
    R.garland(c, x + 8, y + hh - 8, x + ww - 8, y + hh - 8, 10);
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
      if (Math.random() < 0.05) burst(it.x, it.y - 10, 1, 'spark');
    }
  }

  function drawMarker(cr) {
    const pt = crisisPoint(cr);
    const frac = clamp(cr.t / cr.max, 0, 1);
    const pulse = 1 + Math.sin(time * 8) * 0.08;
    const my = pt.y - (cr.type === 'ghodi' ? 50 : cr.d.kind === 'hold' ? 70 : 75);
    c.save(); c.translate(pt.x, my); c.scale(pulse, pulse);
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
    // pointer above the head
    const hy = p.y - 70 - (p.moving ? Math.abs(Math.sin(p.walk * 11)) * 3 : 0);
    c.fillStyle = p.color;
    c.beginPath(); c.moveTo(p.x - 7, hy - 10); c.lineTo(p.x + 7, hy - 10); c.lineTo(p.x, hy); c.closePath(); c.fill();
    if (p.hint) {
      c.font = '700 13px ' + R.FONT; c.textAlign = 'center';
      const tw = c.measureText(p.hint).width + 14;
      c.fillStyle = 'rgba(20,10,30,0.8)'; R.rr(c, p.x - tw / 2, hy - 36, tw, 22, 11); c.fill();
      c.strokeStyle = p.color; c.lineWidth = 1.5; R.rr(c, p.x - tw / 2, hy - 36, tw, 22, 11); c.stroke();
      c.fillStyle = '#fff'; c.fillText(p.hint, p.x, hy - 20);
    }
    if (p.frozenBy === 'pinky') {
      c.font = '700 22px "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.fillText('💍', p.x + 22 + Math.sin(time * 10) * 2, p.y - 40);
    }
  }

  function render() {
    c.save();
    c.clearRect(0, 0, W, H);
    if (w.shake > 0) c.translate((Math.random() - 0.5) * w.shake, (Math.random() - 0.5) * w.shake);
    const f = state === 'freeze' ? w.freeze : null;
    if (f) {
      const k = Math.min(1, f.t / 0.3), z = 1 + 0.45 * (1 - Math.pow(1 - k, 3));
      c.translate(f.x, f.y); c.scale(z, z); c.translate(-f.x, -f.y);
      if ('filter' in c) c.filter = 'saturate(0.55) contrast(1.15)';
    }
    c.drawImage(bg, 0, 0);
    drawGate();
    drawStage(); drawKitchen(); drawBuffet(); drawDessert(); drawGenerator(); drawStable(); drawMandap(); drawDJ();
    drawItems();
    // entities sorted by y
    const ents = [];
    for (const k in w.npc) { const e = w.npc[k]; if (e.visible && k !== 'dj') ents.push({ y: e.y, draw: () => R.person(c, e, time) }); }
    for (const kd of w.kids) ents.push({ y: kd.y, draw: () => R.person(c, kd, time) });
    for (const p of w.players) ents.push({ y: p.y, draw: () => R.person(c, Object.assign({}, p, { mood: p.frozenBy === 'pinky' ? 'shock' : p.moving ? 'neutral' : 'happy' }), time) });
    const g = w.ghodi;
    ents.push({
      y: g.y, draw: () => {
        R.ghodi(c, g, time);
        if (g.rider) {
          const d = w.npc.dulha;
          R.person(c, Object.assign({}, d, { x: g.x - 4, y: g.y - 30, label: null, moving: false, visible: true }), time);
        }
      }
    });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    // particles below the darkness (smoke/steam)
    drawParticles(false);
    // darkness for power cuts
    if (w.dark) drawDarkness();
    R.fairyLights(c, LIGHTS, time, !w.dark);
    if (w.rain) drawRain();
    drawParticles(true);
    if (!w.demo) for (const cr of w.crises) drawMarker(cr);
    for (const p of w.players) drawPlayerExtras(p);
    // floating texts
    for (const fl of w.floats) {
      c.globalAlpha = 1 - fl.age / 1.4;
      c.font = '800 20px ' + R.FONT; c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.strokeText(fl.text, fl.x, fl.y - fl.age * 40);
      c.fillStyle = fl.col; c.fillText(fl.text, fl.x, fl.y - fl.age * 40);
      c.globalAlpha = 1;
    }
    // speech bubbles on top
    const speakers = [];
    for (const k in w.npc) { const e = w.npc[k]; if (e.visible && e.bubble) speakers.push(e); }
    for (const kd of w.kids) if (kd.bubble) speakers.push(kd);
    for (const p of w.players) if (p.bubble) speakers.push(p);
    for (const e of speakers) {
      let by = e.y - (e.kid ? 56 : 70);
      if (e.key === 'dj') by = e.y - 60;
      if (e === w.npc.dulha && w.ghodi.rider) by = w.ghodi.y - 100;
      R.bubble(c, e.x, by, e.bubble.text, e.bubble.age, e.idx != null ? '#fff3c4' : null);
    }
    if ('filter' in c) c.filter = 'none';
    c.restore();
    if (w.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + w.flash * 0.8 + ')'; c.fillRect(0, 0, W, H); }
    if (f) drawMemeOverlay(f);
  }

  function drawParticles(top) {
    for (const p of w.particles) {
      const isTop = p.type !== 'smoke';
      if (isTop !== top) continue;
      const a = 1 - p.life / p.max;
      c.globalAlpha = Math.max(0, a);
      c.fillStyle = p.col;
      if (p.type === 'petal' || p.type === 'confetti') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        if (p.type === 'petal') { c.beginPath(); c.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, 7); c.fill(); }
        else c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      } else if (p.type === 'smoke') {
        c.beginPath(); c.arc(p.x, p.y, p.size * (1 + p.life), 0, 7); c.fill();
      } else {
        c.beginPath(); c.arc(p.x, p.y, p.size * (p.type === 'fw' ? a + 0.3 : 1), 0, 7); c.fill();
      }
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
    const hole = (x, y, r) => { const g = d.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = g; d.beginPath(); d.arc(x, y, r, 0, 7); d.fill(); };
    for (const p of w.players) hole(p.x, p.y - 30, 130);
    hole(640, 500, 70); // hawan flame
    const m = w.npc.mama; if (m.tx != null || (w.crises.find(x => x.type === 'power') || {}).mamaWork) hole(m.x, m.y - 30, 70);
    hole(STATIONS.generator.point[0] - 60, 600, 55);
    c.drawImage(darkCanvas, 0, 0);
    // phone torches
    c.fillStyle = 'rgba(255,240,180,0.08)';
    for (const p of w.players) { c.beginPath(); c.arc(p.x, p.y - 30, 90, 0, 7); c.fill(); }
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
    const v = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 760);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
    const k = Math.min(1, f.t / 0.25);
    c.save();
    c.textAlign = 'center';
    c.font = '900 40px Impact, "Arial Black", sans-serif';
    c.lineWidth = 8; c.strokeStyle = '#000'; c.fillStyle = '#fff';
    c.globalAlpha = k;
    c.strokeText('AUR PHIR...', W / 2, 140); c.fillText('AUR PHIR...', W / 2, 140);
    const sc = 0.7 + 0.3 * k;
    c.translate(W / 2, H - 120); c.scale(sc, sc);
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
